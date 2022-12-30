/**
 * ================================================================================
 * created by cbl-147
 * @description used for performing an order related action like edit from admin panel
 * ==============================================================================
 */
var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr=require('../../lib/UploadMgr')
var confg=require('../../config/const');
var _ = require('underscore'); 
var chunk = require('chunk');
var moment = require('moment')
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const common=require('../../common/agent');
let ExecuteQ=require('../../lib/Execute');
let lib=require('../../lib/NotificationMgr')
let Universal=require('../../util/Universal');
const { request } = require('http');
/**
 * @des Api used for shipment of order into DHL   
 * @param {*Object} req 
 * @param {*Object} res 
 */
const dhlShipment=async (req,res)=>{
    try{
        let ordersPrice=req.body.items;
        let orderId=req.body.orderId;
        let adminHandling=req.body.handlingAdmin || 0;
        let userServiceCharge=req.body.userServiceCharge || 0;
        let deliveryCharge=req.body.deliveryCharge || 0;
        let remainingAmount=0;
        let refundAmount=0;
        var offset=req.body.offset!=undefined && req.body.offset!="" && req.body.offset!=null?req.body.offset:4
        var sql = `select ors.*,o.user_delivery_address,s.address as supplier_address,sbp.category_id,o.self_pickup,o.payment_type,o.schedule_date,o.created_on,o.net_amount,
        s.supplier_id as supplier_id,s.name as supplier_name,u.email,u.id as user_id,u.device_token,u.device_type,u.notification_status,u.notification_language,
        CONCAT(u.firstname,' ',u.lastname) as userName from orders o join user u on o.user_id = u.id 
        join order_prices ors on ors.order_id=o.id join product pr on pr.id=ors.product_id join
        supplier_branch sb on sb.id=o.supplier_branch_id join supplier_ml s on s.supplier_id = sb.supplier_id left join supplier_branch_product sbp on sbp.product_id=ors.product_id
        and s.language_id=u.notification_language where o.id = ?`
        let orderResult=await ExecuteQ.Query(req.dbName,sql,[orderId]);
        let dhlConfigData=await Universal.getDhlKeyData(req.dbName);
            logger.debug("========DHL=>>",dhlConfigData);
            // Object.keys(shipStationData).length>0 
            if(Object.keys(dhlConfigData).length>0 && orderResult.length>0){
                let userData=await ExecuteQ.Query(req.dbName,`select id,device_token from user where id=?`,[orderResult[0].user_id]);
                let user_delivery_address=orderResult[0].user_delivery_address || 0;
                let userName=orderResult[0].userName || "";
                let net_amount=orderResult[0].net_amount || 0;
                let userEmailId=orderResult[0].email || ""
                let supplierId=orderResult[0].supplier_id || 0;
                var date1 = moment().utcOffset(offset);
                var confirmed_at=moment(date1).format("YYYY-MM-DD");
                logger.debug("........confirmed_at.......",confirmed_at);
                let user_address_data=await ExecuteQ.Query(req.dbName,"select * from user_address where id=?",[user_delivery_address]);
                let city=user_address_data[0].city!="" && user_address_data[0].city!=undefined?user_address_data[0].city:"Budaiya"
                logger.debug("====CITY===>>",city);
                let supplierData=await ExecuteQ.Query(req.dbName,`select country_code,phone,id,email,address,name from supplier where id=?`,[supplierId]);
                let itemPieces="";
                let totalWeight=0
                let dhlXmlRequest=`<?xml version="1.0" encoding="UTF-8"?>
                <req:ShipmentRequest xmlns:req="http://www.dhl.com" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                xsi:schemaLocation="http://www.dhl.com ship-val-global-req-6.2.xsd" 
                schemaVersion="6.2">
                   <Request>
                      <ServiceHeader>
                         <MessageTime>${moment(new Date()).format()}</MessageTime>
                         <MessageReference>23456789012345678901234567890</MessageReference>
                         <SiteID>${dhlConfigData[config.get("server.dhl.dhl_site_key")]}</SiteID>
                         <Password>${dhlConfigData[config.get("server.dhl.dhl_password")]}</Password>
                      </ServiceHeader>
                      <MetaData>
                         <SoftwareName>3PV</SoftwareName>
                         <SoftwareVersion>6.2</SoftwareVersion>
                      </MetaData>
                   </Request>
                   <RegionCode>AP</RegionCode>
                   <LanguageCode>en</LanguageCode>
                   <PiecesEnabled>Y</PiecesEnabled>
                   <Billing>
                      <ShipperAccountNumber>${dhlConfigData[config.get("server.dhl.dhl_account_number")]}</ShipperAccountNumber>
                      <ShippingPaymentType>S</ShippingPaymentType>
                      <BillingAccountNumber>${dhlConfigData[config.get("server.dhl.dhl_account_number")]}</BillingAccountNumber>
                      <DutyPaymentType>R</DutyPaymentType>
                   </Billing>
                   <Consignee>
                   <CompanyName>Test</CompanyName>
                      <AddressLine>${user_address_data[0].address_line_1}</AddressLine>
                      <AddressLine>${user_address_data[0].customer_address}</AddressLine>
                      <City>${city}</City>
                      <CountryCode>BH</CountryCode>
                      <CountryName>Bahrain</CountryName>
                      <Contact>
                         <PersonName>${userName}</PersonName>
                         <PhoneNumber>${user_address_data[0].phone_number}</PhoneNumber>
                         <Email>${userEmailId}</Email>
                      </Contact>
                   </Consignee>
                   <Commodity>
                      <CommodityCode>cc</CommodityCode>
                      <CommodityName>cm</CommodityName>
                   </Commodity>
                   <Dutiable>
                      <DeclaredValue>${parseFloat(net_amount)}</DeclaredValue>
                      <DeclaredCurrency>BHD</DeclaredCurrency>
                      <ShipperEIN>ShipperEIN</ShipperEIN>
                   </Dutiable>
                  <ShipmentDetails>
                      <NumberOfPieces>${ordersPrice.length}</NumberOfPieces><Pieces>`
                      for(const [index,i] of ordersPrice.entries()){
                        totalWeight=totalWeight+i.weight;
                       itemPieces+=`
                         <Piece>
                            <PieceID>${index+1}</PieceID>
                            <PackageType>EE</PackageType>
                            <Weight>${i.weight}</Weight>
                            <Width>${i.width}</Width>
                            <Height>${i.height}</Height>
                            <Depth>${i.depth}</Depth>
                         </Piece>`
                      }
                      let footerXml=`</Pieces>
                      <Weight>${totalWeight}</Weight>
                      <WeightUnit>K</WeightUnit>
                      <GlobalProductCode>N</GlobalProductCode>
                      <LocalProductCode>N</LocalProductCode>
                      <Date>${confirmed_at}</Date>
                      <Contents>FOR TESTING PURPOSE ONLY. PLEASE DO NOT SHIP!</Contents>
                      <DoorTo>DD</DoorTo>
                      <DimensionUnit>C</DimensionUnit>
                      <InsuredAmount>${parseFloat(net_amount)}</InsuredAmount>
                      <PackageType>EE</PackageType>
                      <IsDutiable>N</IsDutiable>
                      <CurrencyCode>BHD</CurrencyCode>
                   </ShipmentDetails>
                   <Shipper>
                      <ShipperID>#${supplierData[0].name+"-"+supplierData[0].id}</ShipperID>
                      <CompanyName>${supplierData[0].name}</CompanyName>
                      <AddressLine>${supplierData[0].address}</AddressLine>
                      <City>Budaiya</City>
                      <CountryCode>BH</CountryCode>
                      <CountryName>Bahrain</CountryName>
                      <Contact>
                         <PersonName>${supplierData[0].name}</PersonName>
                         <PhoneNumber>${supplierData[0].name}</PhoneNumber>
                         <Email>${supplierData[0].email}</Email>
                      </Contact>
                   </Shipper>
                   <EProcShip>N</EProcShip>
                   <LabelImageFormat>PDF</LabelImageFormat>
                </req:ShipmentRequest>`;
                let finalDhlXMl=dhlXmlRequest+itemPieces+footerXml;
                await Universal.addOrderInDhl(finalDhlXMl,orderResult[0],req.dbName);
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);
            }
            else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);
            }
         
        
    }
    catch(Err){
        logger.error("=====Err!===========dhl====================",Err);
        sendResponse.somethingWentWrongError(res);
    }
}  


const saveTrackingDetail = (dbName,shippo_label_url,shippo_tracking_number,orderId)=>{

    return new Promise(async(resolve,reject)=>{
        try{
            let query  = `update orders set shippo_label_url=?,shippo_tracking_number=? where id = ?`
            let params = [shippo_label_url,shippo_tracking_number,orderId]
            let result = await ExecuteQ.Query(dbName,query,params);
            resolve(result)
        }catch(err){
            logger.debug(err)
            reject(err)
        }
    })
}

const shippoShipment = async (req, res) => {


    let shippoKeys = await Universal.getShippoKeys(req.dbName);
    if (shippoKeys && shippoKeys.length > 0) {
        const shippo = require('shippo')(shippoKeys[0].value);

        let { sendername, senderstreet1, sendercity, senderstate, senderzip, sendercountry, senderphone, senderemail } = req.body;

        let orderId = req.body.orderId;
        logger.debug("==REQ=FILE==INPUT>>", typeof req.body);

        let { length, width, height, distance_unit, weight, mass_unit } = req.body;
        logger.debug("==REQ=body==INPUT>>", typeof req.body);

        let addressFrom = {};

        addressFrom["name"] = req.body.username;
        addressFrom["street1"] = req.body.userstreet1;
        addressFrom["city"] = req.body.usercity;
        addressFrom["state"] = req.body.userstate;
        addressFrom["zip"] = req.body.userzip;
        addressFrom["country"] = req.body.usercountry;

        let addressTo = {};

        addressTo["name"] = req.body.sendername;
        addressTo["street1"] = req.body.senderstreet1;
        addressTo["city"] = req.body.sendercity;
        addressTo["state"] = req.body.senderstate;
        addressTo["zip"] = req.body.senderzip;
        addressTo["country"] = req.body.sendercountry;


        let parcel = {};

        parcel["length"] = req.body.length;
        parcel["width"] = req.body.width;
        parcel["height"] = req.body.height;
        parcel["distance_unit"] = req.body.distance_unit;
        parcel["weight"] = req.body.weight;
        parcel["mass_unit"] = req.body.mass_unit;


        shippo.shipment.create({
            "address_from": addressFrom,
            "address_to": addressTo,
            "parcels": [parcel],
            "async": false
        }).catch(function (err) {
            // Deal with an error
            console.log("There was an error creating shipment: %s", err);
            sendResponse.sendErrorMessage("There was an error creating shipment: %s", res, 400)
        }).then(function (shipment) {
            console.log("shipment : %s", JSON.stringify(shipment, null, 4));
            return shippo.shipment.rates(shipment.object_id);
        }).catch(function (err) {
            // Deal with an error
            console.log("There was an error retrieving rates : %s", err);
            sendResponse.sendErrorMessage("There was an error retrieving rates : %s", res, 400)
        }).then(function (rates) {
            console.log("rates : %s", JSON.stringify(rates, null, 4));
            // Get the first rate in the rates results for demo purposes.
            rate = rates.results[0];
            // Purchase the desired rate
            return shippo.transaction.create({ "rate": rate.object_id, "async": false })
        }).catch(function (err) {
            // Deal with an error
            console.log("There was an error creating transaction : %s", err);
            sendResponse.sendErrorMessage("There was an error creating transaction : %s", res, 400)
        }).then(async function (transaction) {
            console.log("transaction : %s", JSON.stringify(transaction, null, 4));

            // print label_url and tracking_number
            if (transaction.status == "SUCCESS") {
                console.log("Label URL: %s", transaction.label_url);
                console.log("Tracking Number: %s", transaction.tracking_number);
                await saveTrackingDetail(req.dbName, transaction.label_url, transaction.tracking_number, orderId)
                sendResponse.sendSuccessData({ transaction: transaction }, constant.responseMessage.SUCCESS, res, 200);
            } else {
                //Deal with an error with the transaction
                console.log("Message: %s", JSON.stringify(transaction.messages, null, 2));
            }
        });
    }else{
        sendResponse.sendErrorMessage("shippo keys not found",res,400);
    }
}


/**
 * @des Api used for shipment of order into DHL   
 * @param {*Object} req 
 * @param {*Object} res 
 */
const trackShipment=async (req,res)=>{
    try{
        let ordersPrice=req.body.items;
        let orderId=req.body.orderId;
        let adminHandling=req.body.handlingAdmin || 0;
        let userServiceCharge=req.body.userServiceCharge || 0;
        let deliveryCharge=req.body.deliveryCharge || 0;
        let remainingAmount=0;
        let refundAmount=0;
        var offset=req.body.offset!=undefined && req.body.offset!="" && req.body.offset!=null?req.body.offset:4
        let orderResult=await ExecuteQ.Query(req.dbName,`select order_id,bar_code,shipping_charge,package_charge,chargeabl_weight,airway_bill_number,base64_image from dhl_shipment where order_id=?`,[orderId]);
        let dhlConfigData=await Universal.getDhlKeyData(req.dbName);
            logger.debug("========DHL=>>",dhlConfigData,orderResult);
            // Object.keys(shipStationData).length>0 
            if(Object.keys(dhlConfigData).length>0 && orderResult.length>0){
                let dhlXmlRequest=`<?xml version="1.0" encoding="UTF-8"?>
                <req:KnownTrackingRequest xmlns:req="http://www.dhl.com" 
                                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                                        xsi:schemaLocation="http://www.dhl.com
                                        TrackingRequestKnown.xsd">
                    <Request>
                        <ServiceHeader>
                        <MessageTime>${moment(new Date()).format()}</MessageTime>
                        <MessageReference>23456789012345678901234567890</MessageReference>
                        <SiteID>${dhlConfigData[config.get("server.dhl.dhl_site_key")]}</SiteID>
                        <Password>${dhlConfigData[config.get("server.dhl.dhl_password")]}</Password>
                        </ServiceHeader>
                    </Request>
                    <LanguageCode>en</LanguageCode>
                    <AWBNumber>${orderResult[0].airway_bill_number}</AWBNumber>
                    <LevelOfDetails>ALL_CHECK_POINTS</LevelOfDetails>
                    <PiecesEnabled>S</PiecesEnabled> 
                </req:KnownTrackingRequest>`
                let finalDhlXMl=dhlXmlRequest
                let data=await Universal.trackOrderInDhl(finalDhlXMl,orderResult[0],req.dbName);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);
            }
            else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);
            }
         
        
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}  



/**
 * @des Api used for shipment of order into shiprocket   
 * @param {*Object} req 
 * @param {*Object} res 
 */
const shiprocketShipment=async (req,res)=>{
    try{
        let ordersPrice=req.body.items;
        let orderId=req.body.orderId;
        let adminHandling=req.body.handlingAdmin || 0;
        let userServiceCharge=req.body.userServiceCharge || 0;
        let deliveryCharge=req.body.deliveryCharge || 0;
        let customer_pincode = req.body.customer_pincode;
        let customer_state = req.body.customer_state;
        let supplier_pincode = req.body.customer_pincode;
        let supplier_state = req.body.customer_state;
        let supplier_city = req.body.supplier_city;
        let length = req.body.length;
        let breadth = req.body.breadth;
        let height = req.body.height;
        let weight = req.body.weight;
        let remainingAmount=0;
        let refundAmount=0;
        var offset=req.body.offset!=undefined && req.body.offset!="" && req.body.offset!=null?req.body.offset:4
        var sql = `select ors.*,o.user_delivery_address,s.address as supplier_address,sbp.category_id,o.self_pickup,o.payment_type,o.schedule_date,o.created_on,o.net_amount,
        s.supplier_id as supplier_id,s.name as supplier_name,u.email,u.id as user_id,u.device_token,u.device_type,u.notification_status,u.notification_language,
        CONCAT(u.firstname,' ',u.lastname) as userName from orders o join user u on o.user_id = u.id 
        join order_prices ors on ors.order_id=o.id join product pr on pr.id=ors.product_id join
        supplier_branch sb on sb.id=o.supplier_branch_id join supplier_ml s on s.supplier_id = sb.supplier_id left join supplier_branch_product sbp on sbp.product_id=ors.product_id
        and s.language_id=u.notification_language where o.id = ?`
        let orderResult=await ExecuteQ.Query(req.dbName,sql,[orderId]);
        let shipRocketConfigData=await Universal.getShipRocketKeyData(req.dbName);

            logger.debug("========shipRocketConfigData=>>",shipRocketConfigData);
            // Object.keys(shipStationData).length>0 
            if(Object.keys(shipRocketConfigData).length>0 && orderResult.length>0){
                let shipRocketToken = await Universal.loginToShipRocket(shipRocketConfigData.shiprocket_email,shipRocketConfigData.shiprocket_password);
                
                let userData=await ExecuteQ.Query(req.dbName,`select id,device_token from user where id=?`,[orderResult[0].user_id]);
                let user_delivery_address=orderResult[0].user_delivery_address || 0;
                let userName=orderResult[0].userName || "";
                let net_amount=orderResult[0].net_amount || 0;
                let userEmailId=orderResult[0].email || ""
                let supplierId=orderResult[0].supplier_id || 0;
                var date1 = moment().utcOffset(offset);
                var confirmed_at=moment(date1).format("YYYY-MM-DD");
                logger.debug("........confirmed_at.......",confirmed_at);
                let user_address_data=await ExecuteQ.Query(req.dbName,"select * from user_address where id=?",[user_delivery_address]);
                let city=user_address_data[0].city!="" && user_address_data[0].city!=undefined?user_address_data[0].city:"Budaiya"
                logger.debug("====CITY===>>",city);
                let supplierData=await ExecuteQ.Query(req.dbName,`select country_code,phone,id,email,address,name from supplier where id=?`,[supplierId]);
                let itemPieces="";
                let totalWeight=0;
                let order_id_ref = Math.floor(Math.random()*90000) + 10000;
                let order_items = []
                for(const [index,i] of ordersPrice.entries()){
                    order_items.push({
                        "name":i.productName,
                        "sku": "delta123",
                        "units": i.quantity,
                        "selling_price": i.ordersPrice
                    })
                }
                let shiprocketRequestBody = {
 
                    "order_id": order_id_ref,
                    "order_date": moment(new Date()).format('YYYY-MM-DD HH:MM'),
                    "billing_customer_name": userName,
                    "billing_last_name": userName,
                    "billing_address": user_address_data[0].customer_address,
                    "billing_city": city,
                    "billing_pincode": customer_pincode,
                    "billing_state": customer_state,
                    "billing_country": "India",
                    "billing_email": userEmailId,
                    "billing_phone": user_address_data[0].phone_number,
                    "shipping_is_billing": true,
                    "order_items": order_items,
                    "payment_method": "COD",
                    "sub_total": net_amount,
                    "length": length,
                    "breadth": breadth,
                    "height": height,
                    "weight": weight,
                    "pickup_location": supplierData[0].address,
                    "vendor_details": {
                      "email": supplierData[0].email,
                      "phone": supplierData[0].phone,
                      "name": supplierData[0].name,
                      "address": supplierData[0].address,
                      "address_2": "",
                      "city": supplier_city,
                      "state": supplier_state,
                      "country": "india",
                      "pin_code": supplier_pincode,
                      "pickup_location": supplierData[0].address
                    }
                  }
                  
                await Universal.addOrderInShipRocket(shiprocketRequestBody,
                    orderResult[0],req.dbName,shipRocketToken);
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);
            }
            else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);
            }
         
        
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.sendErrorMessage(Err,res,400)
    }
} 


/**
 * @des Api used for shipment of order into shiprocket   
 * @param {*Object} req 
 * @param {*Object} res 
 */
const trackShipmentOfShipRocket = async (req,res)=>{
    try{
        let ordersPrice=req.body.items;
        let orderId=req.body.orderId;
        let adminHandling=req.body.handlingAdmin || 0;
        let userServiceCharge=req.body.userServiceCharge || 0;
        let deliveryCharge=req.body.deliveryCharge || 0;
        let remainingAmount=0;
        let refundAmount=0;
        var offset=req.body.offset!=undefined && req.body.offset!="" && req.body.offset!=null?req.body.offset:4
        let orderResult=await ExecuteQ.Query(req.dbName,`select order_id,shipment_id,awb_code,label_url,manifest_url,pickup_token_number from shiprocket_shipment where order_id=?`,[orderId]);
        let shipRocketConfigData=await Universal.getShipRocketKeyData(req.dbName);
            logger.debug("========shipRocketConfigData=>>",shipRocketConfigData,orderResult);
            // Object.keys(shipStationData).length>0 
            if(Object.keys(shipRocketConfigData).length>0 && orderResult.length>0){
                let shipRocketToken = await Universal.loginToShipRocket(shipRocketConfigData.shiprocket_email,shipRocketConfigData.shiprocket_password);

                let query_url = "https://apiv2.shiprocket.in/v1/external/courier/track/awb/"+orderResult[0].awb_code
          
                request({
                    method: 'GET',
                    url: query_url,
                    headers:{ 
                        'Authorization':'Bearer '+shipRocketToken
                     },
                }, async function (error, response, body) {
                    if(error){
                    logger.error("=====Err!=",error);
                    sendResponse.sendErrorMessage(error,res,400)
                    }else{
                        resolve(body);
                    }
    
                });
            }else{
                logger.error("=====Err!=");
                sendResponse.sendErrorMessage("keys are not added",res,400)
            }

        
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.sendErrorMessage(Err,res,400);
    }
}  




/**
 * @des Api used for adding an items in order  
 * @param {*Object} req 
 * @param {*Object} res 
 */
const AddItemInOrder=async (req,res)=>{
    try{
        let edit_by = "admin"
        if(req.path=="/agent/order/add_items"){
            edit_by = "agent"
        }
        if(req.path=="/user/order/add_items"){
            edit_by = "user"
        }
        let itemData=req.body.items;
        let orderId=req.body.orderId;
        let removalItems=req.body.removalItems;
        var is_edit = "1";
        let quantity=0,totalQuantity=0,modifiedOrderPrice=0,finalNetAmount=0;
        let duration  = req.body.duration==undefined?0:req.body.duration;
        let totalDuration = 0;
        let adminHandling=req.body.handlingAdmin || 0;
        let userServiceCharge=req.body.userServiceCharge || 0;
        let deliveryCharge=req.body.deliveryCharge || 0;
        let orderDetail=await orderData(req.dbName,orderId);
        let orderDataOnlyDetails=await orderDataOnly(req.dbName,orderId);
        let user_id = orderDetail[0].user_id;
        let table_booking_fee = req.body.table_booking_fee || 0;

        let remainingAmount=0;
        let refundAmount=0;
        let fcmToken=[]
        let table_book_mac_theme = await ExecuteQ.Query(req.dbName,
            "select `key`, value from tbl_setting where `key`=? and value='1'",
            ["table_book_mac_theme"]);
            
        let adminData=await ExecuteQ.Query(req.dbName,
            "select `fcm_token`,`email`,`id` from admin where is_active=1",[])
         let supplierDatas=await ExecuteQ.Query(req.dbName, 
                "select s.device_token,s.device_type,s.id from  orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id = sb.supplier_id where ors.id=?",orderId)
    
        logger.debug("==adminData==supplierDatas=",adminData,supplierDatas);
        adminData.forEach(element => {
            fcmToken.push(element.fcm_token)
        });
        _.each(supplierDatas,function(i){
            fcmToken.push(i.device_token)
        })

        let userData=await ExecuteQ.Query(req.dbName,`select id,device_token from user where id=?`,[orderDetail[0].user_id]);
        logger.debug("=====ENtrin==>>",req.body,itemData,orderId,orderDetail);
        let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        let pricing_type = req.body.pricing_type==undefined?1:req.body.pricing_type
        let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(req.dbName)
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }

        if(itemData && itemData.length>0){

            for(const [index,i] of itemData.entries()){
                let orderItemPriceId=i.orderPriceId || 0
                logger.debug("=======orderItemPriceId=>",orderItemPriceId)
                let orderAmountData=await orderData(req.dbName,orderId);
                let itemOrder=await itemExistInOrder(req.dbName,orderId,orderItemPriceId);
                if(itemOrder && itemOrder.length>0){
                    /*******************For Home Service************************/

                    var itemOrder_quantity = parseInt(itemOrder[0].quantity);
                    var i_quantity = parseInt(i.quantity);
                    logger.debug("============i_quantity=============",i_quantity,itemOrder_quantity)
                    if(is_decimal_quantity_allowed == "1"){
                        itemOrder_quantity = parseFloat(itemOrder[0].quantity);
                        i_quantity = parseFloat(i.quantity);
                        logger.debug("============itemOrder_quantity=============",i_quantity,itemOrder_quantity)
                    }
                
                    if(duration>0){
                        if(parseInt(duration)<parseInt(itemOrder[0].duration)){
                            logger.debug("===========in one============")
                            totalDuration = /* parseInt(itemOrder[0].duration)- */ parseInt(duration); 
                            modifiedOrderPrice =parseFloat((itemOrder[0].price)*(itemOrder[0].quantity))- parseFloat(i.price);
                            logger.debug("============pricing=========type=======",parseInt(pricing_type))
                            if(parseInt(pricing_type)==0){
                                modifiedOrderPrice = parseFloat(i.price)*(itemOrder_quantity - i_quantity)
                            }
                            logger.debug("==========modeified order price==========",modifiedOrderPrice)
                            refundAmount=refundAmount+modifiedOrderPrice;
                            finalNetAmount=parseFloat(itemOrder[0].net_amount)-parseFloat(modifiedOrderPrice);
                            await ExecuteQ.Query(req.dbName,"update order_prices set quantity=?,price=? where id=?",[i.quantity,parseFloat(i.price),orderItemPriceId]);
                            await ExecuteQ.Query(req.dbName,"update orders set net_amount=?,duration=? where id=?",[finalNetAmount,totalDuration,orderId]);
                            // //
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_order_prices set quantity=?,price=? where order_price_id=?",[i.quantity,parseFloat(i.price),orderItemPriceId]);
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=?,duration=? where order_id=?",[finalNetAmount,totalDuration,orderId]);
                        }else if(parseInt(duration)>parseInt(itemOrder[0].duration)){
                            logger.debug("===========in two============")
                            totalDuration = parseInt(duration) //-parseInt(itemOrder[0].duration);
                            modifiedOrderPrice =parseFloat(i.price) - parseFloat((itemOrder[0].price)*(itemOrder[0].quantity))
                            if(parseInt(pricing_type)==0){
                                modifiedOrderPrice = parseFloat(i.price)*(i_quantity - itemOrder_quantity)
                            }
                            remainingAmount=remainingAmount+modifiedOrderPrice; 
                            finalNetAmount=parseFloat(itemOrder[0].net_amount)+parseFloat(modifiedOrderPrice);
                            await ExecuteQ.Query(req.dbName,"update order_prices set quantity=?,price=? where id=?",[i.quantity,parseFloat(i.price),orderItemPriceId]);
                            await ExecuteQ.Query(req.dbName,"update orders set net_amount=?,duration=? where id=?",[finalNetAmount,totalDuration,orderId]);
                            // //
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_order_prices set quantity=?,price=? where order_price_id=?",[i.quantity,parseFloat(i.price),orderItemPriceId]);
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=?,duration=? where order_id=?",[finalNetAmount,totalDuration,orderId]);
                        }
                    }
                    
                    /************************************************************/

                    else{
                        logger.debug("=======inputQuanty==itemQuantity=",i_quantity,itemOrder_quantity)
                        if(i_quantity < itemOrder_quantity){

                            totalQuantity=itemOrder_quantity - i_quantity;
                            modifiedOrderPrice=totalQuantity*parseFloat(i.price);
                            refundAmount=refundAmount+modifiedOrderPrice;
                            finalNetAmount=parseFloat(itemOrder[0].net_amount)-parseFloat(modifiedOrderPrice)
                            logger.debug("===totalQuantity==modifiedOrderPrice===finalNetAmount",totalQuantity,modifiedOrderPrice,finalNetAmount);
                        
                         
                            await ExecuteQ.Query(req.dbName,"update order_prices set quantity=? where id=?",[i.quantity,orderItemPriceId]);
                            await ExecuteQ.Query(req.dbName,"update orders set net_amount=?,slot_price=? where id=?",[finalNetAmount,table_booking_fee,orderId]);
                            // //
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_order_prices set quantity=? where order_price_id=?",[i.quantity,orderItemPriceId]);
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=? where order_id=?",[finalNetAmount,orderId]);
                        }
                        else if(i_quantity > itemOrder_quantity){

                            
                            let previous_table_book_fee = orderDetail[0].slot_price
                                let curr_table_booking_fee = table_booking_fee;
                            if(table_book_mac_theme && table_book_mac_theme.length>0){

                                
                                
                                if(parseFloat(curr_table_booking_fee)>parseFloat(previous_table_book_fee)){
                                table_book_fee = parseFloat(previous_table_book_fee)-parseFloat(curr_table_booking_fee)
                                }
                            }
                            totalQuantity=i_quantity - itemOrder_quantity;
                            modifiedOrderPrice=totalQuantity*parseFloat(i.price);
                            remainingAmount=remainingAmount+modifiedOrderPrice;
                            finalNetAmount=parseFloat(itemOrder[0].net_amount)+parseFloat(modifiedOrderPrice)
                           
                            logger.debug("==remainingAmount=totalQuantity==modifiedOrderPrice===finalNetAmount",remainingAmount,totalQuantity,modifiedOrderPrice,finalNetAmount);
                            await ExecuteQ.Query(req.dbName,"update order_prices set quantity=? where id=?",[i.quantity,orderItemPriceId]);
                            await ExecuteQ.Query(req.dbName,"update orders set net_amount=?,slot_price=? where id=?",
                            [finalNetAmount,table_booking_fee,orderId]);
                            //
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_order_prices set quantity=? where order_price_id=?",[i.quantity,orderItemPriceId]);
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=? where order_id=?",[finalNetAmount,orderId]);
                        }
                    }
                }
                else{
                    logger.debug("===New Item==netAMonunt==inputQuanty==itemQuantity=",i_quantity)
                    if(duration>0){
                        let itemOrder=await itemExistInOrder(req.dbName,orderId,removalItems[0]);
                        totalDuration = parseInt(duration);
                        let previous_ammount_diff = orderAmountData[0].net_amount-(itemOrder[0].price*itemOrder[0].quantity)

                        modifiedOrderPrice = parseFloat(i.price)
                        remainingAmount=remainingAmount+modifiedOrderPrice;
                        // finalNetAmount=parseFloat(orderAmountData[0].net_amount)+parseFloat(modifiedOrderPrice);
                        finalNetAmount = modifiedOrderPrice + previous_ammount_diff 
                        logger.debug("=remainingAmount==totalQuantity==modifiedOrderPrice===finalNetAmount",remainingAmount,totalQuantity,parseFloat(modifiedOrderPrice),finalNetAmount);
                        let agentOrderDetails = await ExecuteQ.QueryAgent(agentConnection,"select * from cbl_user_orders where order_id = ?",[orderId])
                        let orderPriceData=await addItemInOrder(req.dbName,i.branchId,i.productName,orderId,i.productDesc,i.productId,i.imagePath,i.price,i.quantity);
                       
                        if(agentOrderDetails && agentOrderDetails.length>0){
                            await addItemInAgentOrder(req.dbName,orderPriceData.insertId,i.branchId,i.productName,agentOrderDetails[0].id,i.productDesc,i.productId,i.imagePath,i.price,i.quantity,agentConnection)
                             ///////
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=?,duration=? where order_id=?",[finalNetAmount,totalDuration,orderId]);
                        }
                      
                        await ExecuteQ.Query(req.dbName,"update orders set net_amount=?,duration=? where id=?",[finalNetAmount,totalDuration,orderId]);
                           
                    }else{

                        totalQuantity=i.quantity
                        modifiedOrderPrice=totalQuantity*parseFloat(i.price);
                        remainingAmount=remainingAmount+modifiedOrderPrice;
                        finalNetAmount = parseFloat(orderAmountData[0].net_amount)+parseFloat(modifiedOrderPrice);



                        logger.debug("=netAMount==remainingAmount==totalQuantity==modifiedOrderPrice===finalNetAmount",orderAmountData[0].net_amount,remainingAmount,totalQuantity,parseFloat(modifiedOrderPrice),finalNetAmount);
                       
                        let agentOrderDetails = await ExecuteQ.QueryAgent(agentConnection,"select * from cbl_user_orders where order_id = ?",[orderId])
    
                        let orderPriceData= await addItemInOrder(req.dbName,i.branchId,i.productName,orderId,i.productDesc,i.productId,i.imagePath,i.price,i.quantity);
                       
                        if(agentOrderDetails && agentOrderDetails.length>0){
                            await addItemInAgentOrder(req.dbName,orderPriceData.insertId,i.branchId,i.productName,agentOrderDetails[0].id,i.productDesc,i.productId,i.imagePath,i.price,i.quantity,agentConnection)
                            ///////
                            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=? where order_id=?",[finalNetAmount,orderId]);
                        }

                        await ExecuteQ.Query(req.dbName,"update orders set net_amount=? where id=?",[finalNetAmount,orderId]);
                    }
        
                    
                }
            }
            //adding an tax in remaining amount
            remainingAmount=(parseFloat(adminHandling)-parseFloat(orderDataOnlyDetails[0].handling_admin))>0?remainingAmount+(parseFloat(adminHandling)-parseFloat(orderDataOnlyDetails[0].handling_admin)):remainingAmount;
            //adding an service change in remaining amount
            remainingAmount=(parseFloat(userServiceCharge)-parseFloat(orderDetail[0].user_service_charge))>0?remainingAmount+(parseFloat(userServiceCharge)-parseFloat(orderDetail[0].user_service_charge)):remainingAmount;
            
            //adding an tax in refund amount
            refundAmount =(parseFloat(orderDetail[0].user_service_charge)-parseFloat(userServiceCharge))>0?refundAmount+(parseFloat(orderDetail[0].user_service_charge)-parseFloat(userServiceCharge)):refundAmount;
            //adding an service change in refund amount
            refundAmount=(parseFloat(orderDataOnlyDetails[0].handling_admin)-parseFloat(adminHandling))>0?refundAmount+(parseFloat(orderDataOnlyDetails[0].handling_admin)-parseFloat(adminHandling)):refundAmount;

            //adding an delivery charge in remaining amount
            remainingAmount=(parseFloat(deliveryCharge)-parseFloat(orderDataOnlyDetails[0].delivery_charges))>0?remainingAmount+(parseFloat(deliveryCharge)-parseFloat(orderDataOnlyDetails[0].delivery_charges)):remainingAmount;
            //adding an delivery charge in refund amount
            // refundAmount=(parseFloat(orderDetail[0].delivery_charges)-parseFloat(deliveryCharge))>0?refundAmount+(parseFloat(orderDetail[0].delivery_charges)-parseFloat(deliveryCharge)):refundAmount;
            

            logger.debug("==adminHandling==handling_admin=refundAmount=remainingAmount===payment_type==payment_after_confirmation=",
            adminHandling,
            (orderDataOnlyDetails[0].handling_admin),
            refundAmount,
            remainingAmount,
            orderDetail[0].payment_type,
            orderDetail[0].payment_after_confirmation)
            let refundAmountDataAfterRmItem = 0;

            if(duration>0){
                refundAmountDataAfterRmItem = await  removalServiceAndGetRefundAmount(req.dbName,removalItems,orderId,agentConnection,duration);
            }else{
                refundAmountDataAfterRmItem = await removalItemAndGetRefundAmount(req.dbName,removalItems,orderId,agentConnection);
            }
            let totalRefundAmount=refundAmount+refundAmountDataAfterRmItem;

            if(totalRefundAmount>remainingAmount){
                totalRefundAmount = totalRefundAmount-remainingAmount
                remainingAmount =0
            }else{
                remainingAmount = remainingAmount-totalRefundAmount
                totalRefundAmount = 0
            }
            logger.debug("===createdBy====",parseInt(orderDetail[0].created_by))
            if(parseInt(orderDetail[0].created_by)>0){
                totalRefundAmount = 0
                remainingAmount=0
            }
            if((parseInt(orderDetail[0].payment_type)==1 || parseInt(orderDetail[0].payment_type)==4) && parseInt(orderDetail[0].payment_after_confirmation)<1){
                await ExecuteQ.Query(req.dbName,"update orders set remaining_amount=? where id=?",[remainingAmount,orderId]);
                await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set remaining_amount=? where order_id=?",[remainingAmount,orderId]);
            
            }
            logger.debug("====refundAmountDataAfterRmItem===",totalRefundAmount);



            if(table_book_mac_theme && table_book_mac_theme.length>0){

                // let previous_table_book_fee = orderDetail[0].slot_price
                // let curr_table_booking_fee = table_booking_fee;
                
                // let  walletLeftAmount = parseFloat(totalRefundAmount) 
                // updateWalletQuery = "update user set wallet_amount=wallet_amount+? where id=?"
                // await ExecuteQ.Query(req.dbName,updateWalletQuery,[walletLeftAmount,orderDetail[0].user_id]);

                // let query = "insert into user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add) values(?,?,?,?,?,?)"
                // let params = [orderDetail[0].user_id,walletLeftAmount,"",0,3,1];
                // await ExecuteQ.Query(req.dbName,query,params);    

            }else{
                if(parseFloat(totalRefundAmount)>0 &&
                (parseInt(orderDetail[0].payment_type)==1 || 
                parseInt(orderDetail[0].payment_type)==4)){
   
                   if(orderDetail[0].payment_source=='stripe'){
                       await Universal.refundStripePayment(orderDetail[0].card_payment_id,totalRefundAmount,req.dbName);
                   }

                   if(parseInt(orderDetail[0].payment_type)==4){

                      let  walletLeftAmount = parseFloat(totalRefundAmount) 
                       updateWalletQuery = "update user set wallet_amount=wallet_amount+? where id=?"
                       await ExecuteQ.Query(req.dbName,updateWalletQuery,[walletLeftAmount,orderDetail[0].user_id]);
                       let query = "insert into user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add) values(?,?,?,?,?,?)"
                       let params = [orderDetail[0].user_id,walletLeftAmount,"",0,3,1];
                       await ExecuteQ.Query(req.dbName,query,params);    

                   }
                   await ExecuteQ.Query(req.dbName,"update orders set refund_amount=? where id=?",[totalRefundAmount,orderId]);
                   await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set refund_amount=? where order_id=?",[totalRefundAmount,orderId]);
               
               }
            }
            
            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set refund_amount=? where order_id=?",[totalRefundAmount,orderId]);
            logger.debug("=====adminHandling===userServiceCharge=",adminHandling,userServiceCharge)
           
            if(adminHandling>0){
                let taxAmount=(parseFloat(adminHandling)-parseFloat(orderDataOnlyDetails[0].handling_admin))>0?(parseFloat(adminHandling)-parseFloat(orderDataOnlyDetails[0].handling_admin)):(parseFloat(orderDataOnlyDetails[0].handling_admin)-parseFloat(adminHandling));
                logger.debug("===adminHandling===Handlin-admin=taxAmount==",adminHandling,orderDataOnlyDetails[0].handling_admin,taxAmount)
                if(parseFloat(orderDataOnlyDetails[0].handling_admin)>parseFloat(adminHandling)){
                    await ExecuteQ.Query(req.dbName,"update orders set handling_admin=?,net_amount=net_amount-? where id=?",[adminHandling,taxAmount,orderId]);
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set handling_admin=?,net_amount=net_amount-? where order_id=?",[adminHandling,taxAmount,orderId]);
                
                }
                else if(parseFloat(orderDataOnlyDetails[0].handling_admin)<parseFloat(adminHandling)){
                    await ExecuteQ.Query(req.dbName,"update orders set handling_admin=?,net_amount=net_amount+? where id=?",[adminHandling,taxAmount,orderId]);
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set handling_admin=?,net_amount=net_amount+? where order_id=?",[adminHandling,taxAmount,orderId]);
                
                }
                
            }
            if(userServiceCharge>0){
                let serviceTaxAmount=(parseFloat(userServiceCharge)-parseFloat(orderDetail[0].user_service_charge))>0?(parseFloat(userServiceCharge)-parseFloat(orderDetail[0].user_service_charge)):userServiceCharge;
                logger.debug("===userServiceCharge==user_service_charge==serviceTaxAmount==",userServiceCharge,orderDetail[0].user_service_charge,serviceTaxAmount)
               if((parseFloat(orderDetail[0].user_service_charge)>parseFloat(userServiceCharge))){
                    await ExecuteQ.Query(req.dbName,"update orders set user_service_charge=?,net_amount=net_amount-? where id=?",[userServiceCharge,serviceTaxAmount,orderId]);
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set user_service_charge=?,net_amount=net_amount-? where order_id=?",[userServiceCharge,serviceTaxAmount,orderId]);
                }
               else if((parseFloat(orderDetail[0].user_service_charge)<parseFloat(userServiceCharge))){
                    await ExecuteQ.Query(req.dbName,"update orders set user_service_charge=?,net_amount=net_amount+? where id=?",[userServiceCharge,serviceTaxAmount,orderId]);
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set user_service_charge=?,net_amount=net_amount+? where order_id=?",[userServiceCharge,serviceTaxAmount,orderId]);
               }
            }
            if(deliveryCharge>0){
                let deliveryChargeAmount=(parseFloat(deliveryCharge)-parseFloat(orderDetail[0].delivery_charges))>0?(parseFloat(deliveryCharge)-parseFloat(orderDetail[0].delivery_charges)):deliveryCharge;
                logger.debug("===deliveryChargeAmount==delivery_charges==deliveryCharge==",deliveryChargeAmount,orderDetail[0].delivery_charges,deliveryCharge)
               if((parseFloat(orderDetail[0].delivery_charges)>parseFloat(deliveryCharge))){
                    await ExecuteQ.Query(req.dbName,"update orders set delivery_charges=?,net_amount=net_amount-? where id=?",[deliveryCharge,deliveryChargeAmount,orderId]);
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set delivery_charges=?,net_amount=net_amount-? where order_id=?",[deliveryCharge,deliveryChargeAmount,orderId]);
                
                }
               else{
                    await ExecuteQ.Query(req.dbName,"update orders set delivery_charges=?,net_amount=net_amount+? where id=?",[deliveryCharge,deliveryChargeAmount,orderId]);
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set delivery_charges=?,net_amount=net_amount+? where order_id=?",[deliveryCharge,deliveryChargeAmount,orderId]);
            
                }
            }


            if(table_book_mac_theme && table_book_mac_theme.length>0 && parseFloat(table_booking_fee)>0){
                let previous_table_book_fee =  parseFloat(orderDetail[0].slot_price);
                let curr_table_booking_fee = parseFloat(table_booking_fee);
                let orderAmountData = await ExecuteQ.Query(req.dbName,
                    "select net_amount from orders where id=?",[orderId])
                let orderNetAmt = parseFloat(orderAmountData[0].net_amount);
                let tablebookAmountDiff = 0;

                if(curr_table_booking_fee>0){
                    if(curr_table_booking_fee>previous_table_book_fee){
                        
                        console.log("==============table book feeses========1====+",previous_table_book_fee,curr_table_booking_fee);

                        tablebookAmountDiff = curr_table_booking_fee-previous_table_book_fee;
                        console.log("==============table book tablebookAmountDiff====1========+",tablebookAmountDiff);

                        orderNetAmt = orderNetAmt + parseFloat(tablebookAmountDiff);
                        console.log("==============table book finalNetAmount======1======+",orderNetAmt);

                        await ExecuteQ.Query(req.dbName,"update orders set slot_price=? where id=?",
                        [orderNetAmt,table_booking_fee,orderId]);
                        // await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=? where order_id=?",[orderNetAmt,orderId]);
                        let  walletLeftAmount = parseFloat(totalRefundAmount) 
                        let query = "insert into user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add) values(?,?,?,?,?,?)"
                        let params = [orderDetail[0].user_id,walletLeftAmount,"",0,3,1];
                        await ExecuteQ.Query(req.dbName,query,params);    
        
                    }else if(previous_table_book_fee>curr_table_booking_fee){
                        console.log("==============table book feeses======2======+",previous_table_book_fee,curr_table_booking_fee);
                        tablebookAmountDiff = previous_table_book_fee-curr_table_booking_fee;
                        console.log("==============table book tablebookAmountDiff===2=========+",tablebookAmountDiff);

                        orderNetAmt = orderNetAmt - parseFloat(tablebookAmountDiff);

                        console.log("==============table book finalNetAmount=====2=======+",orderNetAmt);

                        await ExecuteQ.Query(req.dbName,"update orders set slot_price=? where id=?",
                        [orderNetAmt,table_booking_fee,orderId]);
                        // await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=? where order_id=?",[finalNetAmount,orderId]);
                        let  walletLeftAmount = parseFloat(totalRefundAmount) 
                        let query = "insert into user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add) values(?,?,?,?,?,?)"
                        let params = [orderDetail[0].user_id,walletLeftAmount,"",0,3,1];
                        await ExecuteQ.Query(req.dbName,query,params);    
        
                    }
                }
                
            }



            agent_order_data=await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set is_edit=? where order_id=?",[is_edit,orderId]);
            await ExecuteQ.Query(req.dbName,"update orders set is_edit=?,edit_by=? where id=?",[is_edit,"admin",orderId]);
            if(edit_by=="user" || edit_by=="agent"){
                let message="Hi, your order modified by "+edit_by+"";
                var noteData = {
                    "status": 0,
                    "message":message,
                    "orderId":orderId,
                    "self_pickup":0,
                    "is_edit":1,
                    // "created_by":req.user.id
                    "created_by":1
                }
                await lib.sendFcmPushNotification(fcmToken, noteData,req.dbName);
                await saveNoticationData(req.dbName,res,1,0,orderId,0,message);
            }
            else{
            let message="Hi there, your order modified by "+edit_by+"";
            var noteData = {
                "status": 0,
                "message":message,
                "orderId":orderId,
                "self_pickup":0,
                "is_edit":1,
                // "created_by":req.user.id
                "created_by":1
            }
            await lib.sendFcmPushNotification([userData[0].device_token], noteData,req.dbName);
            await saveNoticationData(req.dbName,res,1,0,orderId,0,message);
            }
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);  
       
        }
        else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);  
        }
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
} 

const OrderAmountUpdateWithReceipt = async (req,res)=>{
    try{
        let order_id = req.body.order_id;
        let admin_updated_charge = req.body.admin_updated_charge;
        let admin_price_update_receipt = req.body.admin_price_update_receipt;

        let is_tax_add = req.body.is_tax_add==undefined?0:req.body.is_tax_add;
        let is_subtotal_add = req.body.is_subtotal_add==undefined?0:req.body.is_subtotal_add;

        let handlingAdmin = req.body.handlingAdmin;

        let query = "select payment_type,handling_admin,id,net_amount,card_payment_id,payment_source,user_id from orders where id=?";

        let orderData = await ExecuteQ.Query(req.dbName,query,[order_id]);

        let userData = await ExecuteQ.Query(req.dbName,
            "select device_token from user where id=?",[orderData[0].user_id])
        let remaining_amount = 0;
        let refund_amount = 0;
        logger.debug("========1=======",order_id,admin_updated_charge,
        admin_price_update_receipt)
        let getAgentDbData=await common.GetAgentDbInformation(req.dbName);        
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        let tax_diff=0;
        if(parseInt(is_tax_add)==1){
            
             tax_diff = parseFloat(handlingAdmin)-parseFloat(orderData[0].handling_admin)
            remaining_amount = tax_diff;
            let query1 = "update orders set handling_admin=?,net_amount=net_amount+?,is_tax_add=? where id=?";
            await ExecuteQ.Query(req.dbName,query1,[handlingAdmin,tax_diff,is_tax_add,order_id]);
    
    
            let queryforAgent = "update cbl_user_orders set handling_admin=? where order_id=?";
            await ExecuteQ.QueryAgent(agentConnection,queryforAgent,[handlingAdmin,order_id]);
            
        }else{
             tax_diff = parseFloat(orderData[0].handling_admin)-parseFloat(handlingAdmin)
            refund_amount = tax_diff;
            let query1 = "update orders set handling_admin=?,net_amount=net_amount-?,is_tax_add=? where id=?";
            await ExecuteQ.Query(req.dbName,query1,[handlingAdmin,tax_diff,is_tax_add,order_id]);
    
    
            let queryforAgent = "update cbl_user_orders set handling_admin=? where order_id=?";
            await ExecuteQ.QueryAgent(agentConnection,queryforAgent,[handlingAdmin,order_id]);
     
        }

        if(parseInt(is_subtotal_add)==1){
            logger.debug("========2=======",orderData[0].net_amount,admin_updated_charge)
            let final_net_amount = parseFloat(orderData[0].net_amount)+parseFloat(admin_updated_charge);
            logger.debug("========3=======",final_net_amount,admin_updated_charge)
            if(parseInt(is_tax_add)==1){
            remaining_amount = parseFloat(admin_updated_charge)+parseFloat(tax_diff);

            }else{
            remaining_amount = parseFloat(admin_updated_charge)-parseFloat(tax_diff);

            }
            if(parseInt(orderData[0].payment_type)==0){
                remaining_amount =0;
                refund_amount=0;
            }

            await ExecuteQ.Query(req.dbName,"update orders set is_subtotal_add=?,admin_price_update_receipt=?,remaining_amount=?,net_amount=?,admin_updated_charge=? where id=?",[is_subtotal_add,admin_price_update_receipt,remaining_amount,final_net_amount,admin_updated_charge,order_id]);
            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set admin_price_update_receipt=?,remaining_amount=?,net_amount=?,admin_updated_charge=? where order_id=?",[admin_price_update_receipt,remaining_amount,final_net_amount,admin_updated_charge,order_id]);
      
        }else{
            logger.debug("========4=======",orderData[0].net_amount,admin_updated_charge)

            let final_net_amount = parseFloat(orderData[0].net_amount)-parseFloat(admin_updated_charge);
            logger.debug("=======5=======",final_net_amount,admin_updated_charge)
            if(parseInt(is_tax_add)==1){
            refund_amount = parseFloat(admin_updated_charge)+parseFloat(tax_diff);

            }else{
            refund_amount = parseFloat(admin_updated_charge)-parseFloat(tax_diff);

            }
            if(parseInt(orderData[0].payment_type)==0){
                remaining_amount =0;
                refund_amount=0;
            }
            
            await ExecuteQ.Query(req.dbName,"update orders set is_subtotal_add=?,admin_price_update_receipt=?,refund_amount=?,net_amount=?,admin_updated_charge=? where id=?",[is_subtotal_add,admin_price_update_receipt,refund_amount,final_net_amount,admin_updated_charge,order_id]);
            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set admin_price_update_receipt=?,refund_amount=?,net_amount=?,admin_updated_charge=? where order_id=?",[admin_price_update_receipt,refund_amount,final_net_amount,admin_updated_charge,order_id]);      
            if(orderData[0].payment_source=='stripe'){
                await Universal.refundStripePayment(orderData[0].card_payment_id,totalRefundAmount,req.dbName);
            }
        }

        let message="Hi there, your order modified by admin";
        var noteData = {
            "status": 0,
            "message":message,
            "orderId":order_id
        }
        await lib.sendFcmPushNotification([userData[0].device_token], noteData,req.dbName);
        await saveNoticationData(req.dbName,res,orderData[0].user_id,0,order_id,0,message);
       
       
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);  
   
 
    }catch(error){
        logger.debug("============error=======",error);
        sendResponse.sendErrorMessage("some thing went wrong",res,400);
    }
}

const removalItemAndGetRefundAmount= (dbName,orderItems,orderId,agentConnection)=>{
    return new Promise(async (resolve,reject)=>{ 
        let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }  
        let refundToCustomer=0; 
    if(orderItems && orderItems.length>0){
            
            for(const [index,i] of orderItems.entries()){
                
                let orderItemAmount=0,finalNetAmount=0;
                let orderItems=await itemExistInOrder(dbName,orderId,i);
                if(orderItems && orderItems.length>0){
                    if(is_decimal_quantity_allowed == "1"){
                        orderItemAmount=parseFloat(orderItems[0].price)*parseFloat(orderItems[0].quantity);
                    }else{
                        orderItemAmount=parseFloat(orderItems[0].price)*parseInt(orderItems[0].quantity);
                    }                    
                    refundToCustomer=refundToCustomer+orderItemAmount
                    finalNetAmount=parseFloat(orderItems[0].net_amount)-parseFloat(orderItemAmount);
                    logger.debug("===orderItemAmount====finalNetAmount",orderItemAmount,parseFloat(finalNetAmount),parseFloat(orderItems[0].price),parseFloat(orderItems[0].quantity));
                    await ExecuteQ.Query(dbName,"update orders set net_amount=? where id=?",[finalNetAmount,orderId]);
                    await ExecuteQ.Query(dbName,"delete from order_prices where id=?",[i]);
                    /////////////
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=? where order_id=?",[finalNetAmount,orderId]);
                    await ExecuteQ.QueryAgent(agentConnection,"delete from cbl_user_order_prices where order_price_id=?",[i]);
                }
            }
            resolve(refundToCustomer)
        }
        else{
            resolve(refundToCustomer)
        }
    })
}

const removalServiceAndGetRefundAmount= (dbName,orderItems,orderId,agentConnection,duration)=>{
    return new Promise(async (resolve,reject)=>{   
        let refundToCustomer=0; 
    if(orderItems && orderItems.length>0){
            
            for(const [index,i] of orderItems.entries()){
                let orderItemAmount=0,finalNetAmount=0;
                let orderItems=await itemExistInOrder(dbName,orderId,i);
                if(orderItems && orderItems.length>0){
                    orderItemAmount=parseFloat(orderItems[0].price) //*parseInt(orderItems[0].quantity);
                    refundToCustomer=refundToCustomer+orderItemAmount
                    finalNetAmount=parseFloat(orderItems[0].net_amount)//-parseFloat(orderItemAmount);
                    logger.debug("===orderItemAmount====finalNetAmount",orderItemAmount,parseFloat(finalNetAmount),parseFloat(orderItems[0].price),parseFloat(orderItems[0].quantity));
                    await ExecuteQ.Query(dbName,"update orders set net_amount=?,duration=? where id=?",[finalNetAmount,duration,orderId]);
                    await ExecuteQ.Query(dbName,"delete from order_prices where id=?",[i]);
                    /////////////
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders set net_amount=?,duration=? where order_id=?",[finalNetAmount,duration,orderId]);
                    await ExecuteQ.QueryAgent(agentConnection,"delete from cbl_user_order_prices where order_price_id=?",[i]);
                }
            }
            resolve(refundToCustomer)
        }
        else{
            resolve(refundToCustomer)
        }
    })
}


const orderData=(dbName,orderId)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let sqlQ=`select * from orders ors join order_prices orp on orp.order_id=ors.id where orp.order_id=? `
            let sqlData=await ExecuteQ.Query(dbName,sqlQ,[orderId]);
            logger.debug("===orderItemData==",sqlData);
            resolve(sqlData)
        }
        catch(Err){
            logger
            resolve([])
        }
        
    })
}
const orderDataOnly=(dbName,orderId)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let sqlQ=`select * from orders ors where id=? `
            let sqlData=await ExecuteQ.Query(dbName,sqlQ,[orderId]);
            logger.debug("===orderItemData==",sqlData);
            resolve(sqlData)
        }
        catch(Err){
            logger
            resolve([])
        }
        
    })
}
const itemExistInOrder=(dbName,orderId,productId)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let sqlQ=`select ors.*,orp.quantity,orp.price from orders ors join order_prices orp on orp.order_id=ors.id where orp.order_id=? and orp.id=?`
            let sqlData=await ExecuteQ.Query(dbName,sqlQ,[orderId,productId]);
            logger.debug("===orderItemData==",sqlData);
            resolve(sqlData)
        }
        catch(Err){
            logger
            resolve([])
        }
        
    })
}
const addItemInOrder=(dbName,branchId,productName,orderId,productDesc,productId,imagePath,price,quantity)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let sqlQ=`insert into order_prices(supplier_branch_id,order_id,price,quantity,product_id,product_name,product_desc,image_path)
             values(?,?,?,?,?,?,?,?)`
            let sqlData=await ExecuteQ.Query(dbName,sqlQ,[branchId,orderId,price,quantity,productId,productName,productDesc,imagePath]);
            logger.debug("===orderItemData==",sqlData);
            resolve(sqlData)
        }
        catch(Err){
            logger.debug("======Err!==>",Err);
            resolve()
        }
    })
}
const addItemInAgentOrder=(dbName,orderPriceId,branchId,productName,orderId,productDesc,productId,imagePath,price,quantity,agnetConnection)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let sqlQ=`insert into cbl_user_order_prices(order_price_id,order_id,price,quantity,item_id,item_name,item_desc,image_path)
             values(?,?,?,?,?,?,?,?)`
            let sqlData=await ExecuteQ.QueryAgent(agnetConnection,sqlQ,[orderPriceId,orderId,price,quantity,productId,productName,productDesc,imagePath]);
            logger.debug("===orderItemData==",sqlData);
            resolve()
        }
        catch(Err){
            logger.debug("======Err!==>",Err);
            resolve()
        }
    })
}
const addItemInOrderWithHandling=(dbName,branchId,productName,orderId,productDesc,productId,
    imagePath,price,quantity,handlingAdmin,handlingSupplier)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let sqlQ=`insert into order_prices(handling_admin,handling_supplier,supplier_branch_id,order_id,price,quantity,product_id,product_name,product_desc,image_path)
             values(?,?,?,?,?,?,?,?,?,?)`
            let sqlData=await ExecuteQ.Query(dbName,sqlQ,[handlingAdmin,handlingSupplier,branchId,orderId,price,quantity,productId,productName,productDesc,imagePath]);
            logger.debug("===orderItemData==",sqlData);
            resolve()
        }
        catch(Err){
            logger.debug("======Err!==>",Err);
            resolve()
        }
    })
}
const removeItemFromOrder=async (req,res)=>{
    try {
        let orderId=req.body.orderId;
        let orderItem=req.body.items;
        let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(req.dbName)
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }
        if(orderItem && orderItem.length>0){
            for(const [index,i] of orderItem.entries()){
                let orderItemAmount=0,finalNetAmount=0
                let orderItems=await itemExistInOrder(req.dbName,orderId,i.productId);
                if(orderItems && orderItems.length>0){
                    if(is_decimal_quantity_allowed == "1"){
                        orderItemAmount=parseFloat(orderItems[0].price)*parseFloat(orderItems[0].quantity);
                    }else{
                        orderItemAmount=parseFloat(orderItems[0].price)*parseInt(orderItems[0].quantity);
                    }
                    finalNetAmount=parseFloat(orderItems[0].net_amount)-parseFloat(orderItemAmount);
                    logger.debug("===orderItemAmount====finalNetAmount",orderItemAmount,parseFloat(finalNetAmount),parseFloat(orderItems[0].price),parseFloat(orderItems[0].quantity));
                    await ExecuteQ.Query(req.dbName,"update orders set net_amount=? where id=?",[finalNetAmount,orderId]);
                    await ExecuteQ.Query(req.dbName,"delete from order_prices where product_id=?",[i.productId]);
                }
            }
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
        }
        else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
        }
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for listing order request by user
 * @param {*Object} req 
 * @param {*Object} res 
 */
const orderRequest=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.query)
        let limit = req.query.limit
        let offset = req.query.offset
        let totalCount=await ExecuteQ.Query(req.dbName,"select COUNT(*) totalCount from user_order_request");
        let dataWithPagination=await ExecuteQ.Query(req.dbName,"select IFNULL(ors.created_by,0) as	created_by,user_order_request.*,ua.id as user_address_id,ua.address_line_1,ua.address_line_2,ua.latitude,ua.longitude,ua.country_code,ua.customer_address,ua.address_link,sb.supplier_id from user_order_request join supplier_branch sb on sb.id= user_order_request.supplier_branch_id left join user_address ua on ua.id=user_order_request.delivery_id left join orders ors on ors.request_id=user_order_request.id order by user_order_request.id desc limit ? offset ?",[limit,offset]);
        sendResponse.sendSuccessData({totalCount:totalCount[0].totalCount,data:dataWithPagination}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for listing order request by user
 * @param {*Object} req 
 * @param {*Object} res 
 */
const orderRequestBySupplier=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.query)
        let limit = req.query.limit
        let offset = req.query.offset
        let supplierId=req.user.supplier_id;
        let totalCount=await ExecuteQ.Query(req.dbName,"select COUNT(*) as totalCount from user_order_request join supplier_branch sb on sb.id= user_order_request.supplier_branch_id left join orders ors on ors.request_id=user_order_request.id where sb.supplier_id=?",[supplierId]);
        let dataWithPagination=await ExecuteQ.Query(req.dbName,"select IFNULL(ors.created_by,0) as	created_by,user_order_request.*,sb.supplier_id from user_order_request join supplier_branch sb on sb.id= user_order_request.supplier_branch_id left join orders ors on ors.request_id=user_order_request.id where sb.supplier_id=? order by user_order_request.id desc limit ? offset ?",[supplierId,limit,offset]);
        sendResponse.sendSuccessData({totalCount:totalCount[0].totalCount,data:dataWithPagination}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @des Api used for create an new order by admin/supplier panel
 * @param {*Object} req 
 * @param {*Object} res 
 */
const createNewOrderForRequest=async (req,res)=>{
    try{
        
        let itemData=req.body.items;
        let branchId=req.body.branchId;
        let paymentType=req.body.paymentType;
        let userId=req.body.userId;
        let createdBy=req.user.id;
        let requestId=req.body.requestId || 0;
        let deliveryCharge=req.body.deliveryCharge || 0;
        let userServiceCharge=req.body.userServiceCharge || 0;
        let selfPickup=req.body.selfPickup;
        var zoneOffset=req.query.zoneOffset!=undefined?req.query.zoneOffset:"+05:30";
        let presImage1=req.query.presImage1!=undefined?req.query.presImage1:"";
        let presDescription=req.query.presDescription!=undefined?req.query.presDescription:"";
        var currentDateTime =moment().utcOffset(zoneOffset).format("YYYY-MM-DD HH:mm:ss");
        let quantity=0,totalQuantity=0,modifiedOrderPrice=0,finalNetAmount=0,userAddressId=0;
        let userDefautltAddress=await ExecuteQ.Query(req.dbName,"select ua.id from user_address ua left join user_order_request uor on uor.delivery_id=ua.id  where ua.user_id=? and uor.id=?",[userId,requestId]);
        let userData=await ExecuteQ.Query(req.dbName,`select id,device_token from user where id=?`,[userId]);
        let supplierData=await ExecuteQ.Query(req.dbName,"select supplier_branch.supplier_id,s.* from supplier_branch left join supplier s on s.id=supplier_branch.supplier_id where supplier_branch.id =?",[branchId]);
        let supplierId=supplierData && supplierData.length>0?supplierData[0].supplier_id:0
        if(userDefautltAddress && userDefautltAddress.length>0){
            userAddressId=userDefautltAddress[0].id
        }
        let maxDeliveryTimeInMinute=supplierData && supplierData.length>0?supplierData[0].delivery_max_time:0;
        let deliverDateTime=moment(currentDateTime).add(parseInt(maxDeliveryTimeInMinute),'m');
  
        logger.debug("=====ENtrin==>>",req.body,itemData);
        if(itemData && itemData.length>0){
            let amountData =await calculateNetAmount(req.dbName, itemData);
            logger.debug("====AMOUNT==DATA!===>>",amountData);
            let inserOrder=await ExecuteQ.Query(req.dbName,
            `insert into orders(pres_image1,pres_description,user_service_charge,delivery_charges,schedule_date,request_id,payment_type,delivered_on,handling_admin,handling_supplier,net_amount,
                user_id,supplier_branch_id,status,created_on,user_delivery_address,created_by) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[
                presImage1,
                presDescription,
                userServiceCharge,
                deliveryCharge,
                moment(deliverDateTime).format("YYYY-MM-DD HH:mm:ss"),
                requestId,
                paymentType,
                moment(deliverDateTime).format("YYYY-MM-DD HH:mm:ss"),
                amountData.adminHandling,
                amountData.supplierHandling,
                amountData.netAmount+deliveryCharge+userServiceCharge,
                userId,
                branchId,
                0,
                currentDateTime,
                userAddressId,
                createdBy
            ])
            logger.debug("==inserOrder==>>=",inserOrder);
            for(const [index,i] of itemData.entries()){
                    await addItemInOrderWithHandling(req.dbName,i.branchId,i.productName,inserOrder.insertId,
                        i.productDesc,i.productId,i.imagePath,i.price,i.quantity,i.handlingAdmin,i.handlingSupplier);
            }
           let supplierCommission=await ExecuteQ.Query(req.dbName,
            `select sp.id,sp.commission/100 as supplier_commission,sp.pickup_commission/100 as pickup_commission from supplier sp where sp.id=?`,[supplierId])
            let handlingSupplierCharges=0;
            let commission_settings=await Universal.isCommissionDynamicEnabled(req.dbName);
            if(supplierCommission && supplierCommission.length>0){
                    let sql = "update orders set supplier_commision=? where id = ?"
                    for(const [index,j] of  supplierCommission.entries()){
                        
                        var sc_total_price = amountData.netAmount;
                        if(Object.keys(commission_settings).length>0){
                            if(commission_settings.is_commission_dynamic == "1" && commission_settings.is_admin_commission_on_netamount == "0"){
                                let sc_total_price_data = await ExecuteQ.Query(req.dbName,"SELECT SUM(price * quantity) sub_total FROM `order_prices` WHERE order_id=? GROUP BY order_id",[supplier_commission[i].order_id])
                                if(sc_total_price_data[0] && sc_total_price_data[0].sub_total!=""){
                                    sc_total_price = sc_total_price_data[0].sub_total;
                                }
                            }
                        }
                        if(parseInt(selfPickup)==1) {
                            handlingSupplierCharges = j.pickup_commission * sc_total_price;
                        } else {
                            handlingSupplierCharges = j.supplier_commission * sc_total_price;
                        }
                        await ExecuteQ.Query(req.dbName,sql,[handlingSupplierCharges,inserOrder.insertId])
                    }
              }
            await ExecuteQ.Query(req.dbName,
            `update product p inner join order_prices orp on orp.product_id=p.id 
            inner join cart_products crp on crp.product_id=orp.product_id set p.purchased_quantity= p.purchased_quantity+orp.quantity
             where orp.order_id IN (?)`,
            [inserOrder.insertId]);
            await ExecuteQ.Query(req.dbName,`update user_order_request set status=1 where id=?`,[requestId]);
            var noteData = {
                "status": 0,
                "message":"Hi there, New order by admin please proceed to payment",
                "orderId":inserOrder.insertId,
                "self_pickup":0,
                "created_by":req.user.id
            }
            await lib.sendFcmPushNotification([userData[0].device_token], noteData,req.dbName);
            await saveNoticationData(req.dbName,res,req.user.id,supplierId,inserOrder.insertId,0,"Hi there, New order by admin please proceed to payment")
            sendResponse.sendSuccessData({orderId:inserOrder.insertId}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
        }
        else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
        }
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


const saveNoticationData = function (dbName,res, userId, supplierId, orderId, status, message) {
    return new Promise((resolve,reject)=>{
        var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status) values(?,?,?,?,?) ";
        let stmt = multiConnection[dbName].query(sql, [userId, supplierId, orderId, message, status], function (err, result) {
            logger.debug("===============stmt of save notif=======",stmt.sql);
            // if (err) {
            //     console.log("err....",err);
            //     sendResponse.somethingWentWrongError(res);
            // }
            // else {
               resolve();
            // }
        })
    })    
}
const calculateNetAmount=(dbName,itemData)=>{
    return new Promise(async  (resolve,reject)=>{
        let quantity=0,totalQuantity=0,modifiedOrderPrice=0,taxByPercentage=0,finalNetAmount=0,totalHandlingCharge=0,totalTax=0,totalSuplierHandling=0;
        let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }
        for(const [index,i] of itemData.entries()){
            var i_product = parseInt(i.quantity)
            if(is_decimal_quantity_allowed == "1"){
                i_product = parseFloat(i.quantity)
            }
            logger.debug("===New Item==netAMonunt==inputQuanty==itemQuantity=",i_product);
            totalQuantity=i_product;
            taxByPercentage=(parseFloat(i.price)*i_product*parseFloat(i.handlingAdmin))/100;
            totalHandlingCharge=taxByPercentage;
            totalTax=totalTax+taxByPercentage;
            totalSuplierHandling=totalSuplierHandling+parseFloat(i.handlingSupplier);
            modifiedOrderPrice=totalQuantity*parseFloat(i.price);
            finalNetAmount=parseFloat(finalNetAmount)+parseFloat(modifiedOrderPrice)+totalHandlingCharge+totalSuplierHandling;
            logger.debug("==totalHandlingCharge==totalSuplierHandling=totalQuantity==modifiedOrderPrice===finalNetAmount",
            totalHandlingCharge,totalSuplierHandling,totalQuantity,parseFloat(modifiedOrderPrice),finalNetAmount);
          }
          resolve({netAmount:finalNetAmount,adminHandling:totalTax,supplierHandling:totalSuplierHandling})
    })
}

const scheduleDeliveryDate =async (req,res)=>{
    try{
        let orderId = req.body.orderId
        let deliveryDateTime = req.body.deliveryDateTime
        let offset=req.body.offset!=undefined && req.body.offset!="" && req.body.offset!=null?req.body.offset:"+05:30"
        // deliveryDateTime = moment(moment.utc(deliveryDateTime)).utcOffset(offset).format("YYYY-MM-DD HH:mm:ss")
        logger.debug("=======delivery date time=====",deliveryDateTime)

        // await getDeliveryTime(req.dbName,orderId);
        await updateDeliveryDateTime(req.dbName,orderId,deliveryDateTime);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
        
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
const updateDeliveryDateTime = (dbName,orderId,deliverDateTime)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "update orders set schedule_date=? where id = ?";
            let params = [deliverDateTime,orderId]
            await ExecuteQ.Query(dbName,sql,params);
            resolve();
        }catch(err){
            logger.debug("========err========",err);
            reject(err);
        }
    })
}

const getDeliveryTime = (dbName,orderId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select o.id,s.name,s.delivery_min_time,o.created_on from orders o join supplier_branch sb on o.supplier_branch_id = sb.id join supplier s on s.id = sb.supplier_id where o.id=?"
            let params = [orderId]
            let result = await ExecuteQ.Query(dbName,query,params);
            logger.debug("==========result of get delivery time===",result);
            let created_on = result[0].created_on
            let delivery_min_time = result[0].delivery_min_time
            let currentDeliveryDateTime = moment(created_on).add(parseInt(delivery_min_time),'m');
            logger.debug("========currentDeliveryDateTime============",currentDeliveryDateTime);
            resolve();
        }catch(e){
            logger.debug("============e========",e);
            reject(e);
        }

    })
}
/**
 * @description used for listing order request by user
 * @param {*Object} req 
 * @param {*Object} res 
 */
const orderReturnRequest=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.query)
        let limit = req.query.limit
        let offset = req.query.offset
        let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        let finalData=[];
        let totalCount=await ExecuteQ.Query(req.dbName,"select COUNT(*) totalCount from order_return_request");
        let dataWithPagination=await ExecuteQ.Query(req.dbName,"select sb.supplier_id,op.id as order_prices_id,op.order_id,op.price,op.quantity,op.supplier_branch_id,op.gst_charges,op.product_id,op.product_name,op.product_desc,op.image_path,op.handling_admin,op.handling_supplier,orq.* from order_return_request orq join order_prices op on orq.order_price_id = op.id left join supplier_branch sb on sb.id=op.supplier_branch_id order by orq.id desc limit ? offset ?",[limit,offset]);
        if(dataWithPagination && dataWithPagination.length>0){
            for(const [index,i] of dataWithPagination.entries()){
                i.agent=await ExecuteQ.QueryAgent(agentConnection,"select * from cbl_user_orders co join cbl_user_order_prices cop on cop.order_id=co.id join cbl_user cu on cu.id=co.user_id where co.order_id=? and cop.item_id=? and co.is_return>0",[i.order_id,i.product_id]);
                finalData.push(i)
            }
        }
        sendResponse.sendSuccessData({totalCount:totalCount[0].totalCount,data:finalData}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for listing order request by user
 * @param {*Object} req 
 * @param {*Object} res 
 */
const orderReturnRequestOfSupplier=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.query)
        let limit = req.query.limit
        let offset = req.query.offset
        let supplierId=req.user.supplier_id;
        let totalCount=await ExecuteQ.Query(req.dbName,"select COUNT(*) totalCount from order_return_request orq join order_prices op on orq.order_price_id = op.id left join supplier_branch sb on sb.id=op.supplier_branch_id where sb.supplier_id=?",[supplierId]);
        let dataWithPagination=await ExecuteQ.Query(req.dbName,"select sb.supplier_id,op.id as order_prices_id,op.order_id,op.price,op.quantity,op.supplier_branch_id,op.gst_charges,op.product_id,op.product_name,op.product_desc,op.image_path,op.handling_admin,op.handling_supplier,orq.* from order_return_request orq join order_prices op on orq.order_price_id = op.id left join supplier_branch sb on sb.id=op.supplier_branch_id where sb.supplier_id=? order by orq.id desc limit ? offset ?",[supplierId,limit,offset]);
        
        sendResponse.sendSuccessData({totalCount:totalCount[0].totalCount,data:dataWithPagination}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used for listing supplier ratings
 * @param {*Object} req 
 * @param {*Object} res 
 */
const supplierRatingList=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.query);

        let limit = req.query.limit
        let offset = req.query.offset
        var country_code = req.query.country_code ? req.query.country_code : ''
        var country_code_type = req.query.country_code_type ? req.query.country_code_type : ''

        var country_code_query = ""
        if(country_code!='' && country_code_type!=''){
            if(country_code_type=='1'){
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (s.country_code LIKE '"+cc_array[i]+"' or s.country_code LIKE '+"+cc_array[i]+"') "
                }
            }else{
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (s.country_code NOT LIKE '"+cc_array[i]+"' and s.country_code NOT LIKE '+"+cc_array[i]+"') "
                }
            }
        }
        let totalCount=await ExecuteQ.Query(req.dbName,"select COUNT(*) totalCount from supplier_rating");
        let dataWithPagination=await ExecuteQ.Query(req.dbName,"select sr.*,u.firstname as user_name,s.name as supplier_name  from supplier_rating sr join user u on sr.user_id = u.id join supplier s on s.id = sr.supplier_id "+country_code_query+" group by sr.comment order by sr.id desc  limit ? offset ?",[limit,offset]);

        sendResponse.sendSuccessData({totalCount:totalCount[0].totalCount,data:dataWithPagination}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


const updateStatusReturnOrder=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.body)
        let id = req.body.id
        let status=req.body.status;
        let orderId=req.body.orderId ? req.body.orderId : '0';
        // let offset = req.query.offset
        let returnOrderData=await ExecuteQ.Query(req.dbName,`select * from  order_return_request where id=?`,[id]);
        await ExecuteQ.Query(req.dbName,"update order_return_request set status=? where id=?",[status,id]);
        let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        let offset = req.body.offset || "+5:30"
        let sql;
        var date2 = moment().utcOffset(offset);
        var date = moment(date2).format("YYYYY-MM-DD HH:mm:ss")
        let agentStatus=1;
        if(parseInt(status)==1){
            agentStatus=13;
            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders co join cbl_user_order_prices cop on cop.order_id=co.id set co.shipped_on=?,co.status=? where cop.item_id=? and co.is_return=?",[date,agentStatus,returnOrderData[0].product_id,1]);
       
        }
        if(parseInt(status)==2){
            agentStatus=14;
            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders co join cbl_user_order_prices cop on cop.order_id=co.id set co.reached_on=?,co.status=? where cop.item_id=? and co.is_return=?",[date,agentStatus,returnOrderData[0].product_id,1]);
         }
        if(parseInt(status)==3){
            agentStatus=15;
            await ExecuteQ.QueryAgent(agentConnection,"update cbl_user_orders co join cbl_user_order_prices cop on cop.order_id=co.id set co.delivered_on=?,co.status=? where cop.item_id=? and co.is_return=?",[date,agentStatus,returnOrderData[0].product_id,1]);
            if(orderId!='0'){
                await refund_stripe_payments(req.dbName,res,req,orderId,returnOrderData);
            }
         }
       
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
const refund_stripe_payments = function (dbName, res,request, orderId, returnOrderData) {
    return new Promise(async (resolve,reject)=>{
        let refund_to_wallet = 0;
        let user_id = 0;
        if(returnOrderData && returnOrderData.length>0){
            refund_to_wallet = returnOrderData[0].refund_to_wallet
            user_id = returnOrderData[0].user_id
        }
        let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
        const stripe = require('stripe')(strip_secret_key_data[0].value);
        
        var sql = "select transaction_id, card_payment_id as charge_id, supplier_stripe_transfer_id as transfer_id, payment_source, delivery_charges,supplier_commision,handling_admin,net_amount from orders where id=?";
        let stmt = multiConnection[dbName].query(sql, [orderId], async function (err, result) {
            if(err){
                var msg = "something went wrong";
                sendResponse.sendErrorMessage(msg,res,500);
            }

            var supplier_refundable_amount, admin_refundable_amount

                
            let getAgentDbData=await common.GetAgentDbInformation(dbName);        
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
            let agent_account_data=await ExecuteQ.QueryAgent(agentConnection,"select cu.stripe_account, cuo.supplier_id, cu.id as agent_id, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as agent_payable_amount from cbl_user_orders cuo join cbl_user cu on cuo.user_id=cu.id where cuo.order_id=? and cuo.user_id!='0' limit 1",[orderId]);

            
            var transaction_id = (result[0] && result[0].transaction_id) ? result[0].transaction_id : '';
            var charge_id = (result[0] && result[0].charge_id) ? result[0].charge_id : 0;
            var delivery_charges = (result[0] && result[0].delivery_charges) ? result[0].delivery_charges : 0;
            var handling_admin = (result[0] && result[0].handling_admin) ? result[0].handling_admin : 0;
            var supplier_commission = (result[0] && result[0].supplier_commision) ? result[0].supplier_commision : 0;
            var net_amount = (result[0] && result[0].net_amount) ? result[0].net_amount : 0;

            var is_admin_driver = (agent_account_data[0] && agent_account_data[0].supplier_id && agent_account_data[0].supplier_id!='0') ? '1' : '0';
            var agent_payable_amount = (agent_account_data[0] && agent_account_data[0].agent_payable_amount) ? agent_account_data[0].agent_payable_amount : 0   
            if(is_admin_driver=='0'){ //if driver is of admin
                admin_refundable_amount = handling_admin + supplier_commission + delivery_charges
                supplier_refundable_amount = net_amount - (admin_refundable_amount + agent_payable_amount)
            }else{ //if driver is of supplier
                admin_refundable_amount = handling_admin + supplier_commission
                supplier_refundable_amount = net_amount - (admin_refundable_amount + agent_payable_amount + delivery_charges)
            }

            var refundableAmount = (parseFloat(admin_refundable_amount) + parseFloat(supplier_refundable_amount))

            if(parseInt(refund_to_wallet)===1){
                let  updateWalletQuery = "update user set wallet_amount=wallet_amount+? where id=?"
                await ExecuteQ.Query(dbName,updateWalletQuery,[refundableAmount,user_id]);
                let query = "insert into user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add) values(?,?,?,?,?,?)"
                let params = [user_id,refundableAmount,"",0,2,1];
                await ExecuteQ.Query(dbName,query,params);   
                resolve();
            }else{
                if(result[0] && result[0].payment_source=='stripe'){
                             
                    var transfer_id = (result[0] && result[0].transfer_id) ? result[0].transfer_id : 0;
                    
                    var supTransfer, adminRefund;
                    if(transfer_id!='0'){
                        supTransfer = await stripe.transfers.createReversal(
                            transfer_id,//'tr_1GqNaBLyOfejzWzovFTSk1M7',
                            {amount: Math.round(parseFloat(supplier_refundable_amount * 100))}
                        );
                    }else{
                        admin_refundable_amount = refundableAmount 
                    }
                    adminRefund = await stripe.refunds.create({
                        charge: charge_id,//'ch_1GqWEELyOfejzWzoz4uOgoXv',
                        amount: Math.round(parseFloat(admin_refundable_amount * 100))
                    });
                    if((transfer_id!='0' && supTransfer.id && adminRefund.id) || (transfer_id=='0' &&  adminRefund.id)){
                        resolve();
                    }else{
                        var msg = "something went wrong";
                        sendResponse.sendErrorMessage(msg,res,500);
                    }
                }else if(result[0] && result[0].payment_source=='543'){//mumybene
                    let mumybene_key_data=await Universal.getMumybeneKeyData(dbName);
                    if(mumybene_key_data && transaction_id!=''){
                        var mumybene_username = mumybene_key_data[config.get("payment.mumybene.mumybene_username")]
                        var mumybene_password = mumybene_key_data[config.get("payment.mumybene.mumybene_password")]
                        var baseUrl = "http://test.543.cgrate.co.zm:55555/Konik/KonikWs"
    
                        let xml =`<soapenv:Envelope
                            xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                            xmlns:kon="http://konik.cgrate.com">
                            <soapenv:Header xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                                <wsse:Security xmlns:mustUnderstand="1">
                                    <wsse:UsernameToken xmlns:Id="UsernameToken-1" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                                        <wsse:Username xmlns="http://konik.cgrate.com">`+mumybene_username+`</wsse:Username>
                                        <wsse:Password xmlns:Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">`+mumybene_password+`</wsse:Password>
                                    </wsse:UsernameToken>
                                </wsse:Security>
                            </soapenv:Header>
                            <soapenv:Body>
                            <kon:reverseCustomerPayment>
                            <paymentReference>`+transaction_id+`</paymentReference>
                            </kon:reverseCustomerPayment>
                            </soapenv:Body>
                            </soapenv:Envelope>`;
                        var options = { method: 'POST',
                            url: baseUrl,
                            headers: {
                            'Content-Type':'text/xml;charset=utf-8',
                            'Accept-Encoding': 'gzip,deflate',
                            'Content-Length':xml.length
                            },
                            body:xml
                        };
                        
                        web_request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
                            if(error){
                                var msg = "something went wrong";
                                sendResponse.sendErrorMessage(msg,res,500);
                            }else if (!error && response.statusCode == 200) {
                                var xml2js = require('xml2js');
                                var parser = new xml2js.Parser({explicitArray: false, trim: true});
                                parser.parseString(body, (err, result) => {
                                    var responseCode = result['env:Envelope']['env:Body']['ns2:reverseCustomerPaymentResponse']['return']['responseCode']
                                    var responseMessage = result['env:Envelope']['env:Body']['ns2:reverseCustomerPaymentResponse']['return']['responseMessage']
                                    data = {
                                        responseCode: responseCode,
                                        responseMessage: responseMessage
                                    };
                                    resolve();
                                });                                
                            }else{
                                var msg = "something went wrong";
                                sendResponse.sendErrorMessage(msg,res,500);
                            }
                        });
                    }
                }else if(result[0] && result[0].payment_source=='myfatoorah'){//myfatoorah
                    let myfatoorah_token=await Universal.getMyFatoorahToken(dbName); //myfatoorah_secret_key
                    //var token = myfatoorah_token;
                    myfatoorah_token = myfatoorah_token[0].value //token value to be placed here;
                
                    let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://api.myfatoorah.com' : 'https://apitest.myfatoorah.com';
                
                    //var baseURL = 'https://apitest.myfatoorah.com';
                    var dataToSend = {
                        "KeyType": " invoiceid ",
                        "Key": transaction_id,
                        "RefundChargeOnCustomer": false,
                        "ServiceChargeOnCustomer": false,
                        "Amount": refundableAmount,
                        "Comment": "Order return"
                    }
                    var options = { 
                        method: 'POST',
                        url: baseURL+'/v2/MakeRefund',
                        headers: { 
                            Accept: 'application/json',
                            Authorization: 'bearer '+myfatoorah_token,
                            'Content-Type': 'application/json' 
                        },
                        body: dataToSend,
                        json: true 
                    };
                    console.log("options ----------- ",JSON.stringify(options))
                
                    web_request(options, function (error, response, body) {
                        if (error) {
                            var msg = "something went wrong";
                            sendResponse.sendErrorMessage(msg,res,500);
                        }
                        else {
                            resolve();
                        }
                    });
                }else if(result[0] && result[0].payment_source=='razorpay'){//myfatoorah
                    let razor_pay_data=await Universal.getRazorPayData(dbName);
                    if( Object.keys(razor_pay_data).length>0){
                
                        web_request({
                            method: 'POST',
                            url: "https://"+razor_pay_data[config.get("payment.razorpay.publish_key")]+":"+razor_pay_data[config.get("payment.razorpay.secret_key")]+"@api.razorpay.com/v1/payments/"+charge_id+"/refund",
                            form: {
                                "amount": (refundableAmount)*100
                            }
                        }, function (error, response, body) {
                            if (error) {
                                var msg = "something went wrong";
                                sendResponse.sendErrorMessage(msg,res,500);
                            }
                            else {
                                resolve();
                            }
                        });
                    }
                    else{
                        return sendResponse.sendErrorMessage(
                           await Universal.getMsgText(
                                languageId,{dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }
                }else if(result[0] && result[0].payment_source=='conekta'){//myfatoorah
                    let conekta_data=await Universal.getConektaSecretKey(dbName);
                    let userData=await Universal.getUserData(dbName,request.headers.authorization);
                    if(conekta_data && conekta_data.length>0){
                        let conekta = require('conekta');
                        conekta.api_key = conekta_data[0].value;
                        conekta.locale = 'es';
    
    
                        conekta.Order.find(charge_id, function(err, order) {
                            order.createRefund({
                                "reason": "Order return",
                                "amount": refundableAmount
                            }, function(err, result) {
                                if (err) {
                                    var msg = "something went wrong";
                                    sendResponse.sendErrorMessage(msg,res,500);
                                }
                                else {
                                    resolve();
                                }
                            });
                        }); 
                    }
                    else{
                        return sendResponse.sendErrorMessage(
                           await Universal.getMsgText(
                            languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }
                }
                else if(result[0] && result[0].payment_source=='checkout'){//checkout    
                    let checkout_data=await Universal.getCheckoutSecretKey(dbName);
                    logger.debug("======razor_pay_data=net_amount====>>",checkout_data)
                    if( Object.keys(checkout_data).length>0){
                        var headers = {
                            'Accept': 'application/json',
                            'Authorization': checkout_data[config.get("payment.checkout.secret_key")]//'sk_test_a7d262c3-15fd-4564-8aca-9e45ed879f57'
                        };
                        
                        var dataString = {
                            "amount": refundableAmount
                        };
                        let checkout_api_url = (process.env.NODE_ENV == 'prod') ? 'https://api.checkout.com/payments/'+charge_id+'/refunds' : 'https://api.sandbox.checkout.com/payments/'+charge_id+'/refunds';
                        web_request({
                            method: 'POST',
                            url: checkout_api_url,
                            headers: headers,
                            form: dataString
                        }, async function (error, response, body) {
                            if(error){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{dbName:dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                resolve();
                            }
                        });
                    }
                    else{
                        return sendResponse.sendErrorMessage(
                           await Universal.getMsgText(
                                languageId,{dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }
                }
                else if(result[0] && result[0].payment_source=='squareup'){//squareup
                    
    
                    let squareData=await Universal.getSquareupSecretKey(dbName)
                    if(Object.keys(squareData).length>0){
    
    
                        let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://connect.squareup.com/v2/refunds' : 'https://connect.squareupsandbox.com/v2/refunds';
                    
                        var dataToSend = {
                            "idempotency_key": transaction_id,
                            "payment_id": charge_id,
                            "amount_money": {
                              "amount": refundableAmount,
                              "currency": "USD"
                            }
                        };
                        var options = { 
                            method: 'POST',
                            url: baseURL,
                            headers:  {
                                'Accept': 'application/json',
                                'Authorization': 'Bearer ' + squareData.square_token,
                                'Cache-Control': 'no-cache',
                                'Content-Type': 'application/json'
                            },
                            body: dataToSend,
                            json: true 
                        };
                    
                        web_request(options, function (error, response, body) {
                            if (error) {
                                var msg = "something went wrong";
                                sendResponse.sendErrorMessage(msg,res,500);
                            }
                            else {
                                resolve();
                            }
                        });
                    }else{
                        return sendResponse.sendErrorMessage(
                            await  Universal.getMsgText(
                              languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                              reply,400);
                    }
                                    
                     
                }
                else if(result[0] && result[0].payment_source=='paytab'){//paytab                
    
                    let payTabData=await Universal.getPayTabData(dbName);
                    if(Object.keys(payTabData).length>0){
    
                    
                        var dataToSend = {
                            "merchant_email":payTabData.paytab_secret_key,
                            "secret_key":payTabData.paytab_merchant_email,
                            "refund_amount":refundableAmount,
                            "refund_reason":"Order return",
                            "transaction_id":charge_id
                        };
                        var options = { 
                            method: 'POST',
                            url: "https://www.paytabs.com/apiv2/refund_process",
                            form: dataToSend
                        };
                    
                        web_request(options, function (error, response, body) {
                            if (error) {
                                var msg = "something went wrong";
                                sendResponse.sendErrorMessage(msg,res,500);
                            }
                            else {
                                resolve();
                            }
                        });
                    }else{
                        return sendResponse.sendErrorMessage(
                            await  Universal.getMsgText(
                              languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                              reply,400);
                    }
                                    
                     
                }
                else if(result[0] && result[0].payment_source=='converge'){//converge                
    
                    let converge_key_data=await Universal.getConvergeData(dbName);
    
                    var merchantID = converge_key_data[config.get("payment.converge.merchantID")]
                    var merchantUserID = converge_key_data[config.get("payment.converge.merchantUserID")]
                    var merchantPIN = converge_key_data[config.get("payment.converge.merchantPIN")]
                    var transaction_type = "ccreturn";
                    var transactionAmount = refundableAmount//"100";
                    
                    data = { 
                        ssl_merchant_id:merchantID,
                        ssl_user_id:merchantUserID,
                        ssl_pin:merchantPIN,
                        ssl_transaction_type:transaction_type,
                        ssl_txn_id:charge_id,
                        ssl_amount:transactionAmount
                    }
                    //let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://api.convergepay.com/hosted-payments/transaction_token' : 'https://api.demo.convergepay.com/hosted-payments/transaction_token';
                    let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://api.covergepay.com/VirtualMerchant/process.do' : 'https://api.demo.convergepay.com/hosted-payments/transaction_token';
                    var options = { 
                        method: 'POST',
                        url: baseURL,
                        form: data
                    };
                
                    web_request(options, function (error, response, body) {
                        if (error) {
                            var msg = "something went wrong";
                            sendResponse.sendErrorMessage(msg,res,500);
                        }
                        else {
                            resolve();
                        }
                    });
                                    
                     
                }
    
                else if(result[0] && result[0].payment_source=='paypal'){//paypal                
    
                    let paypal_api=process.env.NODE_ENV == 'prod'?'https://api.paypal.com':'https://api.sandbox.paypal.com'
                    let paypal_data=await Universal.getPaypalData(request.dbName);
                    if(Object.keys(paypal_data).length>0){
                        let tokenData=await Universal.getAuthTokeOfPayPal(paypal_data[config.get("payment.paypal.client_key")],paypal_data[config.get("payment.paypal.secret_key")]);
                        var headers = {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer '+tokenData.access_token,
                        };
                        
                        var dataString = {
                          "amount": {
                            "total": refundableAmount,
                            "currency": "USD"
                          },
                          "invoice_number": "INVOICE-123",
                          "description": "Order return"
                        };
                        var options = {
                            'url': paypal_api+'v1/payments/sale/'+charge_id+'/refund',
                            method: 'POST',
                            headers: headers,
                            body: dataString
                        };
                    
                        web_request(options, function (error, response, body) {
                            if (error) {
                                var msg = "something went wrong";
                                sendResponse.sendErrorMessage(msg,res,500);
                            }
                            else {
                                resolve();
                            }
                        });
                    }
                    else{
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }
                                    
                     
                }    
            }
        })
    })    
}
const rejectOrderRequest=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.body)
        let id = req.body.id
        let status=2;
        let reason=req.body.reason;
        // let offset = req.query.offset
        await ExecuteQ.Query(req.dbName,"update user_order_request set status=?,reasons=? where id=?",[status,reason,id]);
        let userData=await ExecuteQ.Query(req.dbName,`select ur.* from user ur join user_order_request orq on orq.user_id=ur.id where orq.id=?`,[id])
        let message="Hi there, your order rejected by admin";
            var noteData = {
                "status": 0,
                "message":message,
                "orderId":0,
                "self_pickup":0,
                "is_edit":1,
                "type": "request",
                // "created_by":req.user.id
                "created_by":1
            }
            await lib.sendFcmPushNotification([userData[0].device_token], noteData,req.dbName);
            await saveNoticationData(req.dbName,res,1,0,0,0,message);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


const updateRatingOfSupplier=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.body)
        let is_approved = req.body.is_approved
        let id=req.body.id;
        // let offset = req.query.offset
        await ExecuteQ.Query(req.dbName,"update supplier_rating set is_approved=? where id=?",[is_approved,id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const updateRatingOfProduct=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.body)
        let is_approved = req.body.is_approved
        let id=req.body.id;
        // let offset = req.query.offset
        await ExecuteQ.Query(req.dbName,"update product_rating set is_approved=? where id=?",[is_approved,id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}




/**
 * @description used for listing product ratings
 * @param {*Object} req 
 * @param {*Object} res 
 */
const productRatingList=async (req,res)=>{
    try{
        
        logger.debug("=============IN==>>========",req.query)
        let limit = req.query.limit
        let offset = req.query.offset
        var country_code = req.query.country_code ? req.query.country_code : ''
        var country_code_type = req.query.country_code_type ? req.query.country_code_type : ''

        var country_code_query = ""
        if(country_code!='' && country_code_type!=''){
            if(country_code_type=='1'){
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (s.country_code LIKE '"+cc_array[i]+"' or s.country_code LIKE '+"+cc_array[i]+"') "
                }
            }else{
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (s.country_code NOT LIKE '"+cc_array[i]+"' and s.country_code NOT LIKE '+"+cc_array[i]+"') "
                }
            }
        }
        
        let sql = "select s.name as supplier_name,p.name as product_name,u.firstname as user_name,pr.* from product_rating pr "
        sql += "join user u on u.id = pr.user_id "
        sql += "join supplier_branch_product sbp on sbp.product_id = pr.product_id "
        sql += " join product p on p.id = pr.product_id "
        sql += "join supplier_branch sb on sb.id = sbp.supplier_branch_id "
        sql += "join supplier s on s.id = sb.supplier_id "+country_code_query+" order by pr.id desc  limit ? offset ?"
        let totalCount=await ExecuteQ.Query(req.dbName,"select COUNT(*) totalCount from product_rating");
        let dataWithPagination=await ExecuteQ.Query(req.dbName,sql,[limit,offset]);
        sendResponse.sendSuccessData({totalCount:totalCount[0].totalCount,data:dataWithPagination}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const updateOrderPaymentStatus=async (req,res)=>{
    try{
        logger.debug("=============IN==>>========",req.body)
        let is_payment_confirmed = req.body.is_payment_confirmed
        let order_id=req.body.order_id;
        // let offset = req.query.offset
        await ExecuteQ.Query(req.dbName,"update orders set is_payment_confirmed=? where id=?",
        [is_payment_confirmed,order_id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for listing product ratings
 * @param {*Object} req 
 * @param {*Object} res 
 */
const productRatingListOfSupplier=async (req,res)=>{
    try{
        
        console.log("=============IN==>>========",req.query)
        
        let supplier_id=req.supplier.supplier_id;

        console.log("===supplier_id==========IN==>>=supplier_id=======",supplier_id,req.supplier)

        let limit = req.query.limit;
        let offset = req.query.offset;
        var country_code = req.query.country_code ? req.query.country_code : '';
        var country_code_type = req.query.country_code_type ? req.query.country_code_type : '';

        var country_code_query = ""
        if(country_code!='' && country_code_type!=''){
            if(country_code_type=='1'){
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (s.country_code LIKE '"+cc_array[i]+"' or s.country_code LIKE '+"+cc_array[i]+"') "
                }
            }else{
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (s.country_code NOT LIKE '"+cc_array[i]+"' and s.country_code NOT LIKE '+"+cc_array[i]+"') "
                }
            }
        }
        
        let sql = "select s.name as supplier_name,p.name as product_name,u.firstname as user_name,pr.* from product_rating pr "
        sql += "join user u on u.id = pr.user_id "
        sql += "join supplier_branch_product sbp on sbp.product_id = pr.product_id "
        sql += " join product p on p.id = pr.product_id "
        sql += "join supplier_branch sb on sb.id = sbp.supplier_branch_id "
        sql += "join supplier s on s.id = sb.supplier_id "+country_code_query+" and sb.supplier_id="+supplier_id+" order by pr.id desc  limit ? offset ?"
        let totalCount=await ExecuteQ.Query(req.dbName,"select COUNT(*) totalCount from product_rating");
        let dataWithPagination=await ExecuteQ.Query(req.dbName,sql,[limit,offset]);
        sendResponse.sendSuccessData({totalCount:totalCount[0].totalCount,data:dataWithPagination}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error("=====Err!=",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

module.exports={
    productRatingListOfSupplier:productRatingListOfSupplier,
    updateOrderPaymentStatus:updateOrderPaymentStatus,
    shiprocketShipment:shiprocketShipment,
    trackShipment:trackShipment,
    orderReturnRequestOfSupplier:orderReturnRequestOfSupplier,
    orderRequestBySupplier:orderRequestBySupplier,
    rejectOrderRequest:rejectOrderRequest,
    updateStatusReturnOrder:updateStatusReturnOrder,
    orderReturnRequest:orderReturnRequest,
    createNewOrderForRequest:createNewOrderForRequest,
    orderRequest:orderRequest,
    AddItemInOrder : AddItemInOrder,
    removeItemFromOrder:removeItemFromOrder,
    scheduleDeliveryDate:scheduleDeliveryDate,
    supplierRatingList:supplierRatingList,
    updateRatingOfSupplier:updateRatingOfSupplier,
    updateRatingOfProduct:updateRatingOfProduct,
    productRatingList:productRatingList,
    dhlShipment:dhlShipment,
    OrderAmountUpdateWithReceipt:OrderAmountUpdateWithReceipt,
    trackShipmentOfShipRocket:trackShipmentOfShipRocket,
    shippoShipment:shippoShipment

}