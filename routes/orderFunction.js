/**
 * Created by cbl98 on 20/5/16.
 */
var async=require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var moment=require('moment');

var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const ExecuteQ=require('../lib/Execute')
const common=require('../common/agent')
const Universal=require('../util/Universal');



exports.orderDescription= function(dbName,res,orderId,callback) {
    var image=[],adssOn=[],agentConnection={};
    var data=[] ;
    var productId=[],cartId=0;
    async.auto({
      orderDetails:async function (cb) {
        try{
            
          var sql="select o.have_coin_change,op.id as orderPriceId,s.delivery_min_time,ct.terminology,o.is_edit,o.type,o.user_service_charge,s.id as supplier_id,o.supplier_branch_id,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,crt.addOn,op.product_id,crt.id as cart_id,crt.questions,IFNULL(odp.discountAmount,0) as discountAmount,odp.promoCode,sb.branch_name,sb.address as branch_address,u.id as user_id,u.user_image,p.pricing_type,o.cart_id,o.tip_agent,o.payment_source,o.zelle_receipt_url,o.self_pickup,o.id,o.created_on,o.delivered_on,o.schedule_date,op.product_id,IFNULL(op.duration,0) as wduration,op.product_name as product,s.name as supplier,op.price as Product_cost,o.net_amount as order_cost,o.delivery_charges," +
              " o.order_delivery_type,p.commission,o.parking_instructions,o.area_to_focus,o.payment_type,o.referral_amount,p.commission_type,p.measuring_unit,o.referral_amount,o.refund_amount,o.preparation_time,o.handling_admin,o.handling_supplier,CONCAT(u.firstname,' ',u.lastname) As User_Name,u.mobile_no, ua.address_link, " +
              "ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.status,op.quantity " +
              "from orders o join order_prices op on op.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id " +
              "join supplier s on sb.supplier_id=s.id join product p on p.id=op.product_id join categories ct on ct.id=p.category_id " +
              "join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id join cart crt on crt.id=o.cart_id where o.id = ?";
       let desc=await ExecuteQ.Query(dbName,sql,[orderId])
        //   let stmt = multiConnection[dbName].query(sql,[orderId],async function (err,desc) {
        //     logger.debug("============statement of order desc========",stmt.sql)
        //       if(err) {
        //           console.log('error1------',err);
        //           sendResponse.somethingWentWrongError(res);
        //       }
        //       else {
                logger.debug("=========order data 1 ========",desc)
                let shipStationData=await Universal.getShippingData(dbName);
                for(const [index,i] of desc.entries()){
                        i.dhlData=await ExecuteQ.Query(dbName,`select order_id,bar_code,shipping_charge,package_charge,chargeabl_weight,airway_bill_number,base64_image from dhl_shipment where order_id=?`,[orderId]);
                        i.addsOn=await getOrderAddsOn(dbName,i.cart_id,i.product_id);
                        i.prod_variants=await getCartVariant(dbName,i.cart_id,i.product_id);
                        i.shippingData=[]
                        if(Object.keys(shipStationData).length>0){
                            i.shippingData=await Universal.getShippingOrderDetail(shipStationData,"JUSTCBD-"+orderId);
                        }
                        var getAgentDbData=await common.GetAgentDbInformation(dbName);     
                        logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length);
                        if(Object.entries(agentConnection).length===0){
                            agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                        } 
                        var agentData=await getAgentData(agentConnection,orderId,dbName);
                        i.agent=agentData;
                        data.push(i)
                        if(index==desc.length-1)
                        {
                            cb(null);
                        }
                 }
        //       }
        //   })
        }
        catch(Err){
            logger.debug("==Err!===>",Err)
            sendResponse.somethingWentWrongError(res);
        }
      },
      getProductId:['orderDetails',function (cb) {
         var length= data.length;
          for(var i=0;i<length;i++){
              (function (i) {
                  productId.push(data[i].product_id);
                  if(i==(length-1)){
                      cb(null);
                  }
              }(i))
          }
      }],
      getImage:['getProductId',async function (cb) {
        logger.debug("========product_____id------:",productId)
          productId=productId.toString();
          logger.debug("========product_____id------:",productId)
          var sql1='select image_path,product_id from product_image where product_id IN ('+productId+')';
          let images=await ExecuteQ.Query(dbName,sql1,[])
        //   multiConnection[dbName].query(sql1,function (err,images) {
        //       if(err) {
        //           console.log('error------',err);
        //           sendResponse.somethingWentWrongError(res);

        //       }
        //       else {
                  if(data.length){
                      for(var i=0;i<data.length;i++)
                      {
                          (function (i) {
                              for(var j=0;j<images.length;j++){
                                  (function (j) {
                                      if(images[j].product_id==data[i].product_id){
                                          image.push(images[j].image_path);
                                          if(j==images.length-1){
                                              data[i].image=image;
                                              image=[];
                                          }
                                      }
                                      else{
                                          if(j==images.length-1){
                                              data[i].image=image;
                                              image=[];
                                          }
                                      }
                                      if(i==data.length-1){
                                          cb(null);
                                      }
                                  }(j))
                              }
                          }(i))
                      } 
                  }
                  else {
                      cb(null)
                  }
        //       }
        //   })
      }]
  }, function (err, result) {
      if (err) {
          logger.debug("===============derrr=============",err)
          sendResponse.somethingWentWrongError(res);
      } else {
          callback(null,data)
      }
  })

}
exports.orderDescriptionV2= async function(dbName,res,orderId,groupId,callback) {
    let whereClause=groupId!=0?"where o.grouping_id = "+groupId+"":"where o.id = "+orderId+""
    var image=[],adssOn=[],agentConnection={};
    var data=[] ;
    var productId=[],cartId=0;
    let addonpricetotal = 0;
    let flexpay_on=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",["flexpay_on"]);
            let flexpay_check = ""
         if(flexpay_on && flexpay_on.length>0 && flexpay_on[0].value==1){
            flexpay_check= ",crt.flexpay_status,crt.flexpay_id"
         }
        


    async.auto({
      orderDetails:async function (cb) {
          var sql="select s.email,s.offerValue,o.delivery_notes,o.admin_commission, o.order_source,o.is_dine_in,s.local_currency,s.qb_customer_id,s.currency_exchange_rate,o.loyality_point_discount,o.have_coin_change,o.table_id,o.slot_price,o.delivery_latitude,o.delivery_longitude,o.wallet_discount_amount,o.is_schedule,o.schedule_end_date,op.handling_admin as item_handling,op.id as orderPriceId,(p.quantity-p.purchased_quantity) as left_quantity,o.is_edit,o.edit_by,s.delivery_min_time,ct.terminology,o.type,o.user_service_charge,s.id as supplier_id,o.supplier_branch_id,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,crt.addOn,op.product_id,crt.id as cart_id,crt.questions,IFNULL(op.duration,0) as wduration,IFNULL(odp.discountAmount,0) as discountAmount,odp.promoCode,sb.branch_name,sb.address as branch_address,u.business_name,u.abn_number,u.id as user_id,u.user_image,p.pricing_type,o.cart_id,o.tip_agent,o.payment_source,o.approve_rejection_reason,o.zelle_receipt_url,o.self_pickup,o.id,o.created_on, o.transaction_id, o.card_payment_id,o.delivered_on,o.schedule_date,op.product_id,op.product_name as product,s.name as supplier,op.price as Product_cost,o.net_amount as order_cost,o.delivery_charges," +
              " op.admin_commissions,o.no_touch_delivery,o.liquor_bottle_deposit_tax,o.liquor_plt_deposit_tax, o.seating_capacity,dc.name as delivery_company_name,dc.id as delivery_company_id,op.product_reference_id,op.product_dimensions,op.product_upload_reciept,op.product_owner_name,o.is_cutlery_required,o.vehicle_number,o.order_delivery_type,u.user_created_id as receiver_created_id,s.is_own_delivery,o.is_shiprocket_assigned,o.is_tax_add,o.is_subtotal_add,o.admin_updated_charge,o.admin_price_update_receipt,p.commission,o.refund_amount,o.remaining_amount,o.parking_instructions,o.area_to_focus,o.payment_type,o.referral_amount,p.commission_type,p.measuring_unit,o.referral_amount,o.refund_amount,o.preparation_time,o.handling_admin,o.handling_supplier,CONCAT(u.firstname,' ',u.lastname) As User_Name,u.mobile_no, ua.address_link, " +
              " op.actual_price,op.freeQuantity,op.special_instructions,u.id_for_invoice, ua.pincode, ua.name as user_name, ua.phone_number as user_phone_number,ua.reference_address,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.status,op.quantity "+flexpay_check+" " +
              "from orders o join order_prices op on op.order_id=o.id join supplier_branch sb on sb.id=op.supplier_branch_id " +
              " left join delivery_companies dc on dc.id = o.delivery_company_id join supplier s on sb.supplier_id=s.id join product p on p.id=op.product_id " +
              "join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id left join cart crt on crt.id=o.cart_id join supplier_branch_product sp on sp.product_id =op.product_id join categories ct on ct.id =sp.category_id "+whereClause+"";
          let stmt =await  multiConnection[dbName].query(sql,[],async function (err,desc) {
            let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
            var is_decimal_quantity_allowed = "0";
            if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
            }
            logger.debug("============statement of order desc========",stmt.sql)
              if(err) {
                  console.log('error1------',err);
                  sendResponse.somethingWentWrongError(res);
              }
              else {

                logger.debug("=========order data 1 ========",desc)
                let shipStationData=await Universal.getShippingData(dbName);


                let isOrderFromMultipleSupplier=await ExecuteQ.Query(dbName,`select id from orders where id!=? and cart_id=?`,[orderId,desc[0].cart_id])

                       var getAgentDbData=await common.GetAgentDbInformation(dbName);   
                        //logger.debug("===========agent getAgentDbData======= ===== ========",getAgentDbData)  
                        logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length);
                        if(Object.entries(agentConnection).length===0){
                            agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                        } 

                var agentData=await getAgentData(agentConnection,orderId,dbName);
		var dhlData = await ExecuteQ.Query(dbName,`select order_id,bar_code,shipping_charge,package_charge,chargeabl_weight,airway_bill_number,base64_image from dhl_shipment where order_id=?`,[orderId]);
		let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
                let productOrderPricesQuery = 'select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
                let params = []
                let productOrderPrices = await ExecuteQ.Query(dbName,productOrderPricesQuery,params);

                for(const [index,i] of desc.entries()){
                        i.return_data=await ExecuteQ.Query(dbName,"select status,reasons,product_id from order_return_request where order_price_id=?",[i.orderPriceId])

                       // i.dhlData=await ExecuteQ.Query(dbName,`select order_id,bar_code,shipping_charge,package_charge,chargeabl_weight,airway_bill_number,base64_image from dhl_shipment where order_id=?`,[orderId]);
                        i.dhlData=dhlData;
			            i.addsOn=await getOrderAddsOn(dbName,i.cart_id,i.product_id);
                        if (i && i.table_id)
			            i.table_details = await getUserTableDetails(dbName,i.table_id);
			            i.prod_variants=await getCartVariant(dbName,i.cart_id,i.product_id);
                        i.shippingData=[]
                        i.order_cost = i.order_cost-(i.discountAmount)-(i.referral_amount)-(i.wallet_discount_amount)
                        if(Object.keys(shipStationData).length>0){
                            i.shippingData=await Universal.getShippingOrderDetail(shipStationData,"JUSTCBD-"+orderId);
                        }
                        i.out_network = {
                            "product_reference_id":i.product_reference_id,
                            "product_dimensions":i.product_dimensions,
                            "product_upload_reciept":i.product_upload_reciept,
                            "product_owner_name":i.product_owner_name
                        }
                        logger.debug("==dbName=========dbName dbName======= ===== ========",dbName)  

                      
                        
                        
                        let totalPrice = await totalOrderPriceList(dbName,productOrderPrices, is_decimal_quantity_allowed_val,i);
			            var i_quantity = parseInt(i.quantity)
                        if(is_decimal_quantity_allowed == "1"){
                            i_quantity = parseFloat(i.quantity)
                        }
                        let addonprice = await addonTotalPrice(i.addsOn,i_quantity);
                        // if(isOrderFromMultipleSupplier && isOrderFromMultipleSupplier.length>0){
                        //     i.order_cost = (i.order_cost+addonprice)-(i.discountAmount)-(i.referral_amount)-(i.wallet_discount_amount)
                        // }
                        addonpricetotal = addonpricetotal+addonprice
                        i.total_order_price = totalPrice

                    
                        i.agent=agentData;
                        console.log("=======iiiiiiiiiiiiiiiiiiiiiii======",i)
                     
                        i.variant = await getProductVariants(dbName,i.product_id)

                        data.push(i)
                        if(index==desc.length-1)
                        {
                            cb(null);
                        }
                 }
              }
          })
      },
      getProductId:['orderDetails',function (cb) {
         var length= data.length;
          for(var i=0;i<length;i++){
              (function (i) {
                  productId.push(data[i].product_id);
                  if(i==(length-1)){
                      cb(null);
                  }
              }(i))
          }
      }],
      getImage:['getProductId',function (cb) {
        logger.debug("========product_____id------:",productId)
          productId=productId.toString();
          logger.debug("========product_____id------:",productId)
          var sql1='select image_path,product_id from product_image where product_id IN ('+productId+')';
          multiConnection[dbName].query(sql1,function (err,images) {
              if(err) {
                  console.log('error------',err);
                  sendResponse.somethingWentWrongError(res);

              }
              else {
                  if(data.length){
                      for(var i=0;i<data.length;i++)
                      {
                          (function (i) {
                              for(var j=0;j<images.length;j++){
                                  (function (j) {
                                      if(images[j].product_id==data[i].product_id){
                                          image.push(images[j].image_path);
                                          if(j==images.length-1){
                                              data[i].image=image;
                                              image=[];
                                          }
                                      }
                                      else{
                                          if(j==images.length-1){
                                              data[i].image=image;
                                              image=[];
                                          }
                                      }
                                      if(i==data.length-1){
                                          cb(null);
                                      }
                                  }(j))
                              }
                          }(i))
                      } 
                  }
                  else {
                      cb(null)
                  }
              }
          })
      }]
  }, function (err, result) {
      if (err) {
          logger.debug("===============derrr=============",err)
          sendResponse.somethingWentWrongError(res);
      } else {
          for (const [index, i] of data.entries()) {
              i.total_order_price = i.total_order_price + addonpricetotal
          }
          callback(null,data)
      }
  })

}



exports.orderDescriptionV3= async function(dbName,res,orderId,callback) {
    let whereClause="where o.id = "+orderId+""
    var image=[],adssOn=[],agentConnection={};
    var data=[] ;
    var productId=[],cartId=0;
    let addonpricetotal = 0;
    let flexpay_on=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",["flexpay_on"]);
            let flexpay_check = ""
         if(flexpay_on && flexpay_on.length>0 && flexpay_on[0].value==1){
            flexpay_check= ",crt.flexpay_status,crt.flexpay_id"
         }
        

 
    async.auto({
      orderDetails:async function (cb) {
          var sql="select s.email,o.delivery_notes, o.order_source,o.is_dine_in,s.local_currency,s.qb_customer_id,s.currency_exchange_rate,o.loyality_point_discount,o.have_coin_change,o.table_id,o.slot_price,o.delivery_latitude,o.delivery_longitude,o.wallet_discount_amount,o.is_schedule,o.schedule_end_date,op.handling_admin as item_handling,op.id as orderPriceId,(p.quantity-p.purchased_quantity) as left_quantity,o.is_edit,o.edit_by,s.delivery_min_time,ct.terminology,o.type,o.user_service_charge,s.id as supplier_id,o.supplier_branch_id,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,crt.addOn,op.product_id,crt.id as cart_id,crt.questions,IFNULL(op.duration,0) as wduration,IFNULL(odp.discountAmount,0) as discountAmount,odp.promoCode,sb.branch_name,sb.address as branch_address,u.business_name,u.abn_number,u.id as user_id,u.user_image,p.pricing_type,o.cart_id,o.tip_agent,o.payment_source,o.approve_rejection_reason,o.zelle_receipt_url,o.self_pickup,o.id,o.created_on, o.transaction_id, o.card_payment_id,o.delivered_on,o.schedule_date,op.product_id,op.product_name as product,s.name as supplier,op.price as Product_cost,o.net_amount as order_cost,o.delivery_charges," +
              " o.no_touch_delivery,o.liquor_bottle_deposit_tax,o.liquor_plt_deposit_tax, o.seating_capacity,dc.name as delivery_company_name,dc.id as delivery_company_id,op.product_reference_id,op.product_dimensions,op.product_upload_reciept,op.product_owner_name,o.is_cutlery_required,o.vehicle_number,o.order_delivery_type,u.user_created_id as receiver_created_id,s.is_own_delivery,o.is_shiprocket_assigned,o.is_tax_add,o.is_subtotal_add,o.admin_updated_charge,o.admin_price_update_receipt,p.commission,o.refund_amount,o.remaining_amount,o.parking_instructions,o.area_to_focus,o.payment_type,o.referral_amount,p.commission_type,p.measuring_unit,o.referral_amount,o.refund_amount,o.preparation_time,o.handling_admin,o.handling_supplier,CONCAT(u.firstname,' ',u.lastname) As User_Name,u.mobile_no, ua.address_link, " +
              " op.freeQuantity,op.special_instructions,u.id_for_invoice, ua.pincode, ua.name as user_name, ua.phone_number as user_phone_number,ua.reference_address,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.status,op.quantity "+flexpay_check+" " +
              "from orders o join order_prices op on op.order_id=o.id left join supplier_branch sb on sb.id=op.supplier_branch_id " +
              " left join delivery_companies dc on dc.id = o.delivery_company_id left join supplier s on sb.supplier_id=s.id join product p on p.id=op.product_id " +
              "join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id left join cart crt on crt.id=o.cart_id left join supplier_branch_product sp on sp.product_id =op.product_id left join categories ct on ct.id =sp.category_id "+whereClause+"";
         
         console.log (sql,"emaildataemaildata")
              let stmt =await  multiConnection[dbName].query(sql,[],async function (err,desc) {
            let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
            var is_decimal_quantity_allowed = "0";
            if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
            }
            logger.debug("============statement of order desc========",stmt.sql)
              if(err) {
                  console.log('error1------',err);
                  sendResponse.somethingWentWrongError(res);
              }
              else {

                logger.debug("=========order data 1 ========",desc)
                let shipStationData=await Universal.getShippingData(dbName);


                let isOrderFromMultipleSupplier=await ExecuteQ.Query(dbName,`select id from orders where id!=? and cart_id=?`,[orderId,desc[0].cart_id])

                       var getAgentDbData=await common.GetAgentDbInformation(dbName);   
                        //logger.debug("===========agent getAgentDbData======= ===== ========",getAgentDbData)  
                        logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length);
                        if(Object.entries(agentConnection).length===0){
                            agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                        } 

                var agentData=await getAgentData(agentConnection,orderId,dbName);
		var dhlData = await ExecuteQ.Query(dbName,`select order_id,bar_code,shipping_charge,package_charge,chargeabl_weight,airway_bill_number,base64_image from dhl_shipment where order_id=?`,[orderId]);
		let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
                let productOrderPricesQuery = 'select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
                let params = []
                let productOrderPrices = await ExecuteQ.Query(dbName,productOrderPricesQuery,params);

                for(const [index,i] of desc.entries()){
                        i.return_data=await ExecuteQ.Query(dbName,"select status,reasons,product_id from order_return_request where order_price_id=?",[i.orderPriceId])

                       // i.dhlData=await ExecuteQ.Query(dbName,`select order_id,bar_code,shipping_charge,package_charge,chargeabl_weight,airway_bill_number,base64_image from dhl_shipment where order_id=?`,[orderId]);
                        i.dhlData=dhlData;
			            i.addsOn=await getOrderAddsOn(dbName,i.cart_id,i.product_id);
                        if (i && i.table_id)
			            i.table_details = await getUserTableDetails(dbName,i.table_id);
			            i.prod_variants=await getCartVariant(dbName,i.cart_id,i.product_id);
                        i.shippingData=[]
                        i.order_cost = i.order_cost-(i.discountAmount)-(i.referral_amount)-(i.wallet_discount_amount)
                        if(Object.keys(shipStationData).length>0){
                            i.shippingData=await Universal.getShippingOrderDetail(shipStationData,"JUSTCBD-"+orderId);
                        }
                        i.out_network = {
                            "product_reference_id":i.product_reference_id,
                            "product_dimensions":i.product_dimensions,
                            "product_upload_reciept":i.product_upload_reciept,
                            "product_owner_name":i.product_owner_name
                        }
                        logger.debug("==dbName=========dbName dbName======= ===== ========",dbName)  

                      
                        
                        
                        let totalPrice = await totalOrderPriceList(dbName,productOrderPrices, is_decimal_quantity_allowed_val,i);
			            var i_quantity = parseInt(i.quantity)
                        if(is_decimal_quantity_allowed == "1"){
                            i_quantity = parseFloat(i.quantity)
                        }
                        let addonprice = await addonTotalPrice(i.addsOn,i_quantity);
                        // if(isOrderFromMultipleSupplier && isOrderFromMultipleSupplier.length>0){
                        //     i.order_cost = (i.order_cost+addonprice)-(i.discountAmount)-(i.referral_amount)-(i.wallet_discount_amount)
                        // }
                        addonpricetotal = addonpricetotal+addonprice
                        i.total_order_price = totalPrice

                    
                        i.agent=agentData;
                        console.log("=======iiiiiiiiiiiiiiiiiiiiiii======",i)
                     
                        i.variant = await getProductVariants(dbName,i.product_id)

                        data.push(i)
                        if(index==desc.length-1)
                        {
                            cb(null);
                        }
                 }
              }
          })
      },
      getProductId:['orderDetails',function (cb) {
         var length= data.length;
          for(var i=0;i<length;i++){
              (function (i) {
                  productId.push(data[i].product_id);
                  if(i==(length-1)){
                      cb(null);
                  }
              }(i))
          }
      }],
      getImage:['getProductId',function (cb) {
        logger.debug("========product_____id------:",productId)
          productId=productId.toString();
          logger.debug("========product_____id------:",productId)
          var sql1='select image_path,product_id from product_image where product_id IN ('+productId+')';
          multiConnection[dbName].query(sql1,function (err,images) {
              if(err) {
                  console.log('error------',err);
                  sendResponse.somethingWentWrongError(res);

              }
              else {
                  if(data.length){
                      for(var i=0;i<data.length;i++)
                      {
                          (function (i) {
                              for(var j=0;j<images.length;j++){
                                  (function (j) {
                                      if(images[j].product_id==data[i].product_id){
                                          image.push(images[j].image_path);
                                          if(j==images.length-1){
                                              data[i].image=image;
                                              image=[];
                                          }
                                      }
                                      else{
                                          if(j==images.length-1){
                                              data[i].image=image;
                                              image=[];
                                          }
                                      }
                                      if(i==data.length-1){
                                          cb(null);
                                      }
                                  }(j))
                              }
                          }(i))
                      } 
                  }
                  else {
                      cb(null)
                  }
              }
          })
      }]
  }, function (err, result) {
      if (err) {
          logger.debug("===============derrr=============",err)
          sendResponse.somethingWentWrongError(res);
      } else {
          for (const [index, i] of data.entries()) {
              i.total_order_price = i.total_order_price + addonpricetotal
          }
          callback(null,data)
      }
  })

}

const  getProductVariants = (dbName, product_id)=> {
    return new Promise(async (resolve, reject) => {
        try {
                // let productIds = [];
                // for (const [index, i] of products.entries()) {
                //     productIds.push(products[index].product_id);
                // }
    
                let vsql = `select cv.name,variants.id as vaiant_id,variants.value,product_variants.product_id,
                product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id
                join cat_variants cv on cv.id = variants.cat_variant_id where product_variants.product_id  IN(${product_id})`;
    
                let vData = await ExecuteQ.Query(dbName, vsql,[product_id])

                resolve(vData);

                // console.log("==============i.variant ======",vData)
                // if(vData && vData.length>0){
                //     for (const [index, i] of products.entries()) {
                //         console.log("==============i.variant ======",
                //         i.product_id,
                //         // vData.filter(v=>{console.log(v) })
                //         );
                //         let variant = [];
        
                //         for (const [x, j] of vData.entries()) {
                //             if(parseInt(j.product_id)==parseInt(i.product_id)){
                //                 variant.push(j)
                //             }
                            
                //         }  
                //         i.variant = variant;              
        
                //         console.log("==============i.variant ======",i.variant)
                //         if (index == (products.length - 1)) {
                //             resolve(products)
                //         }
                //     }
                // }else{
                //     resolve(products)

                // }

            
        } catch (err) {
            logger.debug(err)
            reject(err)
        }
    })
}
// let is_tax_add = req.body.is_tax_add==undefined?0:req.body.is_tax_add;
// let is_subtotal_add = req.body.is_subtotal_add==undefined?0:req.body.is_subtotal_add;
const totalOrderPriceList = (dbName, orderPrices, is_decimal_quantity_allowed_val, result)=>{
    return new Promise(async(resolve,reject)=>{
        let temp_price = 0
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }

            for(var j=0;j<orderPrices.length;j++){
                let id1 = parseInt(orderPrices[j].order_id)
                let id2 = result.id
                if(id1==id2){
                    if(is_decimal_quantity_allowed == "1"){
                        temp_price = Number(orderPrices[j].price) * parseFloat(orderPrices[j].quantity) + temp_price
                    }else{
                        temp_price = Number(orderPrices[j].price) * Number(orderPrices[j].quantity) + temp_price
                    }
                }
            }
            logger.debug("========temp_price========",temp_price);
        resolve(temp_price);     
    })
}
exports.orderDescriptionV2Prev= function(dbName,res,orderId,callback) {

    var image=[],adssOn=[],agentConnection={};
    var data=[] ;
    var productId=[],cartId=0;
    let addonpricetotal = 0;

    async.auto({
      orderDetails:function (cb) {

          
          var sql="select o.order_source,o.approve_rejection_reason,o.is_dine_in,s.local_currency,s.currency_exchange_rate,o.loyality_point_discount,o.have_coin_change,o.table_id,o.slot_price, o.wallet_discount_amount,o.is_schedule,o.schedule_end_date,op.handling_admin as item_handling,op.id as orderPriceId,(p.quantity-p.purchased_quantity) as left_quantity,o.is_edit,o.edit_by,s.delivery_min_time,ct.terminology,o.type,o.user_service_charge,s.id as supplier_id,o.supplier_branch_id,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,crt.addOn,op.product_id,crt.id as cart_id,crt.questions,IFNULL(op.duration,0) as wduration,IFNULL(odp.discountAmount,0) as discountAmount,odp.promoCode,sb.branch_name,sb.address as branch_address,u.id as user_id,u.user_image,p.pricing_type,o.cart_id,o.tip_agent,o.payment_source,o.zelle_receipt_url,o.self_pickup,o.id,o.created_on, o.transaction_id, o.card_payment_id,o.delivered_on,o.schedule_date,op.product_id,op.product_name as product,s.name as supplier,op.price as Product_cost,o.net_amount as order_cost,o.delivery_charges," +
              " op.product_reference_id,op.product_dimensions,op.product_upload_reciept,op.product_owner_name,o.is_cutlery_required,o.vehicle_number,o.order_delivery_type,s.is_own_delivery,o.is_shiprocket_assigned,o.is_tax_add,o.is_subtotal_add,o.admin_updated_charge,o.admin_price_update_receipt,p.commission,o.refund_amount,o.remaining_amount,o.parking_instructions,o.area_to_focus,o.payment_type,o.referral_amount,p.commission_type,p.measuring_unit,o.referral_amount,o.refund_amount,o.preparation_time,o.handling_admin,o.handling_supplier,CONCAT(u.firstname,' ',u.lastname) As User_Name,u.mobile_no, ua.address_link, " +
              " ua.name as user_name, ua.phone_number as user_phone_number,ua.reference_address,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.status,op.quantity " +
              "from orders o join order_prices op on op.order_id=o.id join supplier_branch sb on sb.id=op.supplier_branch_id " +
              " left join delivery_companies dc on dc.id = o.delivery_company_id join supplier s on sb.supplier_id=s.id join product p on p.id=op.product_id join categories ct on ct.id=p.category_id " +
              "join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id left join cart crt on crt.id=o.cart_id where o.id = ?";
          let stmt = multiConnection[dbName].query(sql,[orderId],async function (err,desc) {
            let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
            var is_decimal_quantity_allowed = "0";
            if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
            }
            logger.debug("============statement of order desc========",stmt.sql)
              if(err) {
                  console.log('error1------',err);
                  sendResponse.somethingWentWrongError(res);
              }
              else {
                logger.debug("=========order data 1 ========",desc)
                let shipStationData=await Universal.getShippingData(dbName);

                let isOrderFromMultipleSupplier=await ExecuteQ.Query(dbName,`select id from orders where id!=? and cart_id=?`,[orderId,desc[0].cart_id])

                       var getAgentDbData=await common.GetAgentDbInformation(dbName);   
                        //logger.debug("===========agent getAgentDbData======= ===== ========",getAgentDbData)  
                        logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length);
                        if(Object.entries(agentConnection).length===0){
                            agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                        } 

                var agentData=await getAgentData(agentConnection,orderId,dbName);
		var dhlData = await ExecuteQ.Query(dbName,`select order_id,bar_code,shipping_charge,package_charge,chargeabl_weight,airway_bill_number,base64_image from dhl_shipment where order_id=?`,[orderId]);
		let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
                let productOrderPricesQuery = 'select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
                let params = []
                let productOrderPrices = await ExecuteQ.Query(dbName,productOrderPricesQuery,params);

                for(const [index,i] of desc.entries()){
                        i.return_data=await ExecuteQ.Query(dbName,"select status,reasons,product_id from order_return_request where order_price_id=?",[i.orderPriceId])

                       // i.dhlData=await ExecuteQ.Query(dbName,`select order_id,bar_code,shipping_charge,package_charge,chargeabl_weight,airway_bill_number,base64_image from dhl_shipment where order_id=?`,[orderId]);
                        i.dhlData=dhlData;
			i.addsOn=await getOrderAddsOn(dbName,i.cart_id,i.product_id);
                        if (i && i.table_id)
			    i.table_details = await getUserTableDetails(dbName,i.table_id);
                        
			i.prod_variants=await getCartVariant(dbName,i.cart_id,i.product_id);
                        i.shippingData=[]
                        i.order_cost = i.order_cost-(i.discountAmount)-(i.referral_amount)-(i.wallet_discount_amount)
                        if(Object.keys(shipStationData).length>0){
                            i.shippingData=await Universal.getShippingOrderDetail(shipStationData,"JUSTCBD-"+orderId);
                        }
                        //op.product_reference_id,op.product_dimensions,
                        //op.product_upload_reciept,op.product_owner_name,

                        i.out_network = {
                            "product_reference_id":i.product_reference_id,
                            "product_dimensions":i.product_dimensions,
                            "product_upload_reciept":i.product_upload_reciept,
                            "product_owner_name":i.product_owner_name
                        }
                        logger.debug("==dbName=========dbName dbName======= ===== ========",dbName)  

                       // var getAgentDbData=await common.GetAgentDbInformation(dbName);   
                        //logger.debug("===========agent getAgentDbData======= ===== ========",getAgentDbData)  
                        //logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length);
                        //if(Object.entries(agentConnection).length===0){
                          //  agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                        //} 
                        //let totalPrice = await totalOrderPrice(dbName,i);
                        let totalPrice = await totalOrderPriceList(dbName,productOrderPrices, is_decimal_quantity_allowed_val,i);
			var i_quantity = parseInt(i.quantity)
                        if(is_decimal_quantity_allowed == "1"){
                            i_quantity = parseFloat(i.quantity)
                        }
                        let addonprice = await addonTotalPrice(i.addsOn,i_quantity);
                        if(isOrderFromMultipleSupplier && isOrderFromMultipleSupplier.length>0){
                            i.order_cost = (i.order_cost+addonprice)-(i.discountAmount)-(i.referral_amount)-(i.wallet_discount_amount)
                        }
                        addonpricetotal = addonpricetotal+addonprice
                        //logger.debug("=========total_price======",totalPrice)
                        i.total_order_price = totalPrice

                        //logger.debug("===========agent con======= ===== ========",agentConnection)
                       // var agentData=await getAgentData(agentConnection,orderId,dbName);
                        i.agent=agentData;
                        data.push(i)
                        if(index==desc.length-1)
                        {
                            cb(null);
                        }
                 }
              }
          })
      },
      getProductId:['orderDetails',function (cb) {
         var length= data.length;
          for(var i=0;i<length;i++){
              (function (i) {
                  productId.push(data[i].product_id);
                  if(i==(length-1)){
                      cb(null);
                  }
              }(i))
          }
      }],
      getImage:['getProductId',function (cb) {
        logger.debug("========product_____id------:",productId)
          productId=productId.toString();
          logger.debug("========product_____id------:",productId)
          var sql1='select image_path,product_id from product_image where product_id IN ('+productId+')';
          multiConnection[dbName].query(sql1,function (err,images) {
              if(err) {
                  console.log('error------',err);
                  sendResponse.somethingWentWrongError(res);

              }
              else {
                  if(data.length){
                      for(var i=0;i<data.length;i++)
                      {
                          (function (i) {
                              for(var j=0;j<images.length;j++){
                                  (function (j) {
                                      if(images[j].product_id==data[i].product_id){
                                          image.push(images[j].image_path);
                                          if(j==images.length-1){
                                              data[i].image=image;
                                              image=[];
                                          }
                                      }
                                      else{
                                          if(j==images.length-1){
                                              data[i].image=image;
                                              image=[];
                                          }
                                      }
                                      if(i==data.length-1){
                                          cb(null);
                                      }
                                  }(j))
                              }
                          }(i))
                      } 
                  }
                  else {
                      cb(null)
                  }
              }
          })
      }]
  }, function (err, result) {
      if (err) {
          logger.debug("===============derrr=============",err)
          sendResponse.somethingWentWrongError(res);
      } else {
          for (const [index, i] of data.entries()) {
              i.total_order_price = i.total_order_price + addonpricetotal
          }
          callback(null,data)
      }
  })

}

const getUserTableDetails = (dbName,table_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from supplier_tables where id=?";
            let params = [table_id]
            let data = await ExecuteQ.Query(dbName,query,params);
            if(data && data.length>0){
                resolve(data[0]);
            }else{
                resolve()
            }
        }catch(err){
            logger.debug("errrrrrrrr========",err);
            resolve({})
        }
    })
}
//const totalOrderPriceList = (dbName, orderPrices, is_decimal_quantity_allowed_val, result)=>{
   // return new Promise(async(resolve,reject)=>{
        //let temp_price = 0
        //var is_decimal_quantity_allowed = "0";
        //if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
          //  is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        //}

           // for(var j=0;j<orderPrices.length;j++){
                //let id1 = parseInt(orderPrices[j].order_id)
                //let id2 = result.id
                //if(id1==id2){
                   // if(is_decimal_quantity_allowed == "1"){
                  //      temp_price = Number(orderPrices[j].price) * parseFloat(orderPrices[j].quantity) + temp_price
                //    }else{
              //          temp_price = Number(orderPrices[j].price) * Number(orderPrices[j].quantity) + temp_price
            //        }
          //      }
        //    }
      //      logger.debug("========temp_price========",temp_price);
    //    resolve(temp_price);     
  //  })
//}
const totalOrderPrice  = (dbName,result)=>{
    return new Promise(async(resolve,reject)=>{
        let temp_price = 0
       // logger.debug("=================result=======",result);
        let query = 'select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
        let params = []
        let product1 = await ExecuteQ.Query(dbName,query,params);
        let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }

        logger.debug("========product1.len======",product1.length)
            for(var j=0;j<product1.length;j++){
                // logger.debug("=========product1[j].order_id == result.id==============",result.id,product1[j].order_id,product1[j].order_id == result.id);
                let id1 = parseInt(product1[j].order_id)
                let id2 = result.id
                // logger.debug("=============id1=====id2 ======",id1,id2)
                if(id1==id2){
                    if(is_decimal_quantity_allowed == "1"){
                        temp_price = Number(product1[j].price) * parseFloat(product1[j].quantity) + temp_price
                    }else{
                        temp_price = Number(product1[j].price) * Number(product1[j].quantity) + temp_price
                    }
                    // logger.debug("==============temppriee======1===",temp_price)
                }
            }
            logger.debug("========temp_price========",temp_price);
        resolve(temp_price);     
    })
}

const addonTotalPrice=(addOns,quantity)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let addonprice = 0
            if(addOns && addOns.length>0){
                for(const [index,i] of addOns.entries()){
                    addonprice = addonprice + (i.price*i.quantity)
                    // addonprice = addonprice + (i.price*parseInt(quantity))
                }
            }
            resolve(addonprice)
        }
        catch(Err){
            reject(Err)
        }
    })
}

const getCartVariant=(dbName,cartId,productId)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            var data=await ExecuteQ.Query(dbName,"select "+
                "cart_variant.*"+
                " from cart_variant where cart_id=? and product_id=?",[parseInt(cartId),parseInt(productId)])
            resolve(data)
        }
        catch(Err){
            reject(Err)
        }
    })
}

function getAgentData(agentConnection,orderId,dbName){
    // logger.debug(agentConnection);
    return new Promise(async (resolve,reject)=>{
        var query="select (SELECT message_id FROM "+dbName+".chats WHERE  (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=usr.agent_created_id or send_to=usr.agent_created_id) and (`send_to_type`='AGENT' or `send_by_type`='AGENT') order by c_id desc limit 1) as message_id, usr.longitude,usr.latitude,usr.name,usr.image,usr.experience,usr.occupation,usr.phone_number,usr.city,usr.country,"+
        " ors.ready_to_pick_images,ors.microblink_verification_front_url,ors.microblink_verification_back_url, ors.order_left_reason,ors.left_with_picture_url,usr.agent_bio_url,ors.signature_image_url, usr.state,usr.phone_number,usr.email, usr.agent_created_id "+
        " from `cbl_user` as usr inner join `cbl_user_orders` ors on ors.user_id=usr.id where ors.order_id=?"
        
        try{
            var agentData = await ExecuteQ.QueryAgent(agentConnection, query, [orderId]);
            resolve(agentData);
        }catch(err){
            reject(err);
        }
        
        

        // var st= agentConnection.query(query,[orderId],function(err,agentData){
        //     // logger.debug("===ST==SQL",st.sql);
        //     if(err){
        //         reject(err)
        //     }
        //     else{
        //         // logger.debug("============AGENT=DATA!==",agentData);
        //         resolve(agentData)
        //         }
        //     })
    })
}

const getOrderAddsOn=(dbName,cartId,productId)=>{
    return new Promise(async (resolve,reject)=>{
            try{
                var data=await ExecuteQ.Query(dbName,"select "+
                "cart_adds_on.*"+
                " from cart_adds_on join product_adds_on padds on padds.id=cart_adds_on.adds_on_id where cart_id=? and padds.product_id=?",[parseInt(cartId),parseInt(productId)])
                resolve(data)
            }
            catch(Err){
                reject(Err)
            }
    })
}

exports.checkOrderStatus = function(dbName,orderId,cb,res){
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "select status from orders where id = ?"
            let params = [orderId]
            let data = await ExecuteQ.Query(dbName,sql,params)
            if(data && data.length>0){
                if(data[0].status==8){
                    let msg = "Order already cancelled by user"
                    sendResponse.sendErrorMessage(msg,res,400)                    
                }else{
                    cb(null)
                }

            }else{
                let msg = "order not exist with this order id"
                sendResponse.sendErrorMessage(msg,res,400)
            }
        }catch(err){
            logger.debug("-=============err========",err);
            sendResponse.somethingWentWrongError()
        }

    })
}

exports.confirmPendingOrder= async function (dbName,res,orderid,status,reason,
    offset,preparation_time,delivery_date_time,cb) {
    try{
            if(status==1)
            {
                    var date1 = moment().utcOffset(offset);
                    var confirmed_at=date1._d
                    logger.debug("........confirmed_at.......",confirmed_at);
                    let orderApprovalByAdmin = await ExecuteQ.Query(dbName,
                        "select `key`,value from tbl_setting where `key`=? and value=1",
                        ["order_approval_by_admin"]
                    )
                    let isApproved = 0;
                    if(orderApprovalByAdmin && orderApprovalByAdmin.length>0)
                        isApproved = 1;

                    var sql= 'update orders set status=?,confirmed_on=?, preparation_time=?,delivery_date_time=?, is_approved_by_admin=? where id =? ';
                    await ExecuteQ.Query(dbName,sql,[status,confirmed_at,preparation_time,delivery_date_time,isApproved,orderid])
            //    var stmt = multiConnection[dbName].query(sql,[status,confirmed_at,preparation_time,delivery_date_time,orderid],async function(err,result)
            //     {
            //         logger.debug("=================in the confirmPendingOrder===if block=============",stmt.sql,err)
            //         if(err)
            //         {
            //             sendResponse.somethingWentWrongError(res);

            //         }
            //         else
            //         {
                        await updatePreparationTime(dbName,orderid,preparation_time);

                        cb(null);
                //     }
                // }); 
            }
            else 
            {
                var sql= 'update orders set status=?,approve_rejection_reason=? where id=?';
                await ExecuteQ.Query(dbName,sql,[status,reason,orderid]);
                // stmt = multiConnection[dbName].query(sql,[status,reason,orderid],async function(err,result)
                // {
                //     logger.debug("===============in the confirmPendingOrder======else block=========",stmt.sql,err)
                //     if(err)
                //     {
                //         sendResponse.somethingWentWrongError(res);

                //     }
                //     else
                //     {
                        
                            await updatePurchaseQuantity(dbName,orderid)
                            cb(null);
                    
                //     }
                // });
            }
        }catch(err){
            logger.debug("+=====================ererrr---------",err)
            cb(null);
        }
}


function updatePreparationTime(dbName,orderId,preparation_time){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update cbl_user_orders set preparation_time=? where order_id=? "
            let getAgentDbData=await common.GetAgentDbInformation(dbName);        
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
            let agent_order_data=await ExecuteQ.QueryAgent(agentConnection,query,[preparation_time,orderId]);
            resolve()
        }catch(err){
            logger.debug("=============errrr=========",err);
            reject(err)
        }

    })
}

function updatePurchaseQuantity(dbName,orderId){
   
    let query="update product p inner join order_prices orp on orp.product_id=p.id "+
        " inner join cart_products crp on crp.product_id=orp.product_id set p.purchased_quantity= p.purchased_quantity"+
        " - orp.quantity where orp.order_id IN (?)";
    
    let params = [orderId]
    return new Promise(async(resolve,reject)=>{
        try{
            await ExecuteQ.Query(dbName,query,params)
            resolve();
        }catch(err){
            logger.debug("==================erer=========");
            reject();
        }
    })

}


exports.orderShipped =async function(dbName,res,orderid,status,offset,cb) {
    try{
    var date1 = moment().utcOffset(offset);
    var date=date1._d
    console.log("........shipped.......",date);
    var sql= 'update orders set status=?,shipped_on=? where id=? ';
    await ExecuteQ.Query(dbName,sql,[status,date,orderid]);
    // multiConnection[dbName].query(sql,[status,date,orderid],function(err,result)
    // {
    //     if(err)
    //     {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else
    //     {

        let query1 = "select progress_on,near_on from orders where id=?";
        let result1 = await ExecuteQ.Query(dbName,query1,[orderid]);
        if(result1 && result1.length){
            var update_set = []
            if(result1[0] && result1[0].progress_on=="0000-00-00 00:00:00"){
                update_set.push(' progress_on="'+date+'" ');
            }
            if(result1[0] && result1[0].near_on=="0000-00-00 00:00:00"){
                update_set.push(' near_on="'+date+'" ');
            }
            if(update_set.length>0){
                update_set.join(',')
                var sql1= 'update orders set '+update_set+' where id=? ';
                await ExecuteQ.Query(dbName,sql1,[orderid]);   
            }
        }
            cb(null);
    //     }
    // });
}
catch(Err){
    logger.debug("===Err!==",Err);
    sendResponse.somethingWentWrongError(res);
}
};
exports.orderInProgress =async function(dbName,res,orderid,status,offset,cb) {
    try{
    var date1 = moment().utcOffset(offset);
    var date=date1._d
    date = date.toISOString().slice(0,19)
    date = date.replace("T"," ")
    console.log("........shipped.......",date);

    var sql= 'update orders set status=?,progress_on=? where id=? ';
    await ExecuteQ.Query(dbName,sql,[status,date,orderid]);
    
    let query1 = "select id from orders where id=? and confirmed_on='0000-00-00 00:00:00'";
    let result1 = await ExecuteQ.Query(dbName,query1,[orderid]);
    if(result1 && result1.length){
        var sql1= 'update orders set confirmed_on=? where id=? ';
        await ExecuteQ.Query(dbName,sql1,[date,orderid]);
    }

    // var stmt=multiConnection[dbName].query(sql,[status,date,orderid],async function(err,result)
    // {
    //     console.log("........shipped.......",date,stmt.sql,err);
    //     if(err)
    //     {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else
    //     {
            // try{
                await updatePreparationAndPickupTIme(dbName,date,orderid,offset)
                cb(null);
            // }catch(err){
            //     logger.debug("==========er=e======",err);
            //     cb(err)
            // }
    //     }
    // });
}
catch(Err){
    logger.debug(":==>",Err)
    sendResponse.somethingWentWrongError(res);
}
};

async function updatePreparationAndPickupTIme(dbName,progress_on_time,orderId,offset){
    return new Promise(async(resolve,reject)=>{
        try{
            // QUERY FOR CHECKING PREPARATION TIME
            let query = "select preparation_time from orders where id=?";
            let result = await ExecuteQ.Query(dbName,query,[orderId]);

            let preparation_time = result[0].preparation_time

            preparation_time = preparation_time.split(':'); // split it at the colons

            // Hours are worth 60 minutes.
            //LOGIC TO GET THE PREPARATION TIME IN MINUTES
            preparation_time = (+preparation_time[0]) * 60 + (+preparation_time[1]);


            // ADD PREPARATION TIME IN CURRENT DATETIME
            let date1 = moment().utcOffset(offset).add(preparation_time,'minutes')

            let preparationAndPickUpDate = date1._d
            logger.debug("===========preparationAndPickUpDate=======",preparationAndPickUpDate)

            preparationAndPickUpDate = preparationAndPickUpDate.toISOString().slice(0,19)
            // GOT FINAL TIME AND DATE
            preparationAndPickUpDate = preparationAndPickUpDate.replace("T"," ")

            //UPDATE DATETIME PICKUP
            let query2 = "update orders set preparation_pickup_date_time=? where id=?"
            let params2 = [preparationAndPickUpDate,orderId]
            
            let result2 = await ExecuteQ.Query(dbName,query2,params2);

            let getAgentDbData=await common.GetAgentDbInformation(dbName);        
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
            let query3 = "update cbl_user_orders set preparation_pickup_date_time=? where order_id=?";
            let params3 = [preparationAndPickUpDate,orderId]
            let result3 = await ExecuteQ.QueryAgent(agentConnection,query3,params3);

            resolve();

        }catch(err){
            logger.debug("========err=======",err);
            reject(err)
        }
    })
}

exports.orderNearby=function(dbName,res,orderid,status,offset,service_type,callback) {
    var date1 = moment().utcOffset(offset);
    var date=date1._d
   var oldStatus;
   async.auto({
       getStatus:async function (cb) {
           try{
           var sql='select status from orders where id = ? ';
           let result=await ExecuteQ.Query(dbName,sql,[orderid]);
            //  multiConnection[dbName].query(sql,[orderid],function (err,result) {
            //      if(err)
            //      {
            //          console.log("...err...",err)
            //          sendResponse.somethingWentWrongError(res);

            //      }
            //      else
            //      {
                     oldStatus=result[0].status;
                     cb(null);
            //      } 
            //  })
           }
           catch(Err){
            logger.debug("===Err!==",Err)
            sendResponse.somethingWentWrongError(res);
           }
       },
       calculateWaitingCharges:['getStatus',async function(cb){
        try{
            let sql = "";
            if(dbName == "hungrycanadian_0710"){
                
                let cdate= moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");
                console.log("datedatedate",cdate)
                sql = "SELECT TIMESTAMPDIFF(MINUTE,preparation_pickup_date_time,'"+cdate+"' )  as extraTime from orders where id=?";
            } else{
                sql = "SELECT TIMESTAMPDIFF(MINUTE,preparation_pickup_date_time,NOW() )  as extraTime from orders where id=?";
            }

            let result=await ExecuteQ.Query(dbName,sql,[orderid]);
            // let stmt = multiConnection[dbName].query(sql,[orderid],async function(err,result){
                // logger.debug("====",stmt.sql)
                // if(err){
                //     logger.debug("==============errr======",err);
                // }else{
                    logger.debug("=========extra time==1==",result)
                    let extraTime = result[0].extraTime;
                    // extraTime = extraTime.split(':'); // split it at the colons
                    // Hours are worth 60 minutes.
                    // extraTime = (+extraTime[0]) * 60 + (+extraTime[1]);
                    logger.debug("========extra time=====2",extraTime)
                    if(extraTime>0){
                        //give waiting charges
                       
                            await setWaitingCharges(dbName,extraTime,orderid);
                            cb(null);   
                       

                    }else{
                        //no waiting charges
                        cb(null);
                    }
                }catch(err){
                    logger.debug("=======erer=======",err)
                    cb(err)
                }
            //     }
            // })
       }],
       updateStatus:['calculateWaitingCharges',async function (cb) {
           try{
               console.log("4444444444444444")
          if(oldStatus==3){
              var sql= 'update orders set status=?,near_on=? where id=?';
              await ExecuteQ.Query(dbName,sql,[status,date,orderid]);
            //   multiConnection[dbName].query(sql,[status,date,orderid],function(err,result)
            //   {
            //       if(err)
            //       {
            //           console.log("...err1...",err)
            //           sendResponse.somethingWentWrongError(res);

            //       }
            //       else
            //       {
                console.log("5555555555555555")      
                        let query1 = "select id from orders where id=? and progress_on='0000-00-00 00:00:00'";
                        let result1 = await ExecuteQ.Query(dbName,query1,[orderid]);
                        if(result1 && result1.length){
                            console.log("666666666666666")
                            var sql1= 'update orders set progress_on=? where id=? ';
                            await ExecuteQ.Query(dbName,sql1,[date,orderid]);
                        }
                      cb(null);
            //       }
            //   });
          }
          else {
              if (service_type == 2) {
                  logger.debug("===========ecom=============")
                  var sql = 'update orders set status=?,near_on=? where id=?';
                  await ExecuteQ.Query(dbName,sql,[status, date, orderid])
                //   multiConnection[dbName].query(sql, [status, date, orderid], function (err, result) {
                //       if (err) {
                //           console.log("...err2...", err)
                //           sendResponse.somethingWentWrongError(res);

                //       }
                //       else {

                        let query1 = "select id from orders where id=? and progress_on='0000-00-00 00:00:00'";
                        let result1 = await ExecuteQ.Query(dbName,query1,[orderid]);
                        if(result1 && result1.length){
                            var sql1= 'update orders set progress_on=? where id=? ';
                            await ExecuteQ.Query(dbName,sql1,[date,orderid]);
                        }
                          cb(null);
                //       }
                //   });
              } else {
                logger.debug("===========food=============")
                  var sql = 'update orders set status=?,near_on=? ,shipped_on=? where id=?';
                  await ExecuteQ.Query(dbName,sql,[status, date, date, orderid]);
                //   multiConnection[dbName].query(sql, [status, date, date, orderid], function (err, result) {
                //       if (err) {
                //           console.log("...err2...", err)
                //           sendResponse.somethingWentWrongError(res);

                //       }
                //       else {

                    let query1 = "select id from orders where id=? and progress_on='0000-00-00 00:00:00'";
                    let result1 = await ExecuteQ.Query(dbName,query1,[orderid]);
                    if(result1 && result1.length){
                        var sql1= 'update orders set progress_on=? where id=? ';
                        await ExecuteQ.Query(dbName,sql1,[date,orderid]);
                    }
                          cb(null);
                //       }
                //   });
              }
          }
        }
        catch(Err){
            logger.debug("==ER!==",Err)
            sendResponse.somethingWentWrongError(res);
        }
       }],
   },function (err,result) {
       logger.debug("==================last result-=================",result)
       if(err)
       {
           logger.debug("-",err)
           sendResponse.somethingWentWrongError(res);

       }
       else
       {
           logger.debug("==================")
           callback(null);
       }
   })
};

function setWaitingCharges(dbName,extraTime,orderId){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select value from tbl_setting where `key`= 'waiting_charges'"
            let result1 = await ExecuteQ.Query(dbName,query,[])
            let chargePerMin = result1[0].value
            let waitingCharges = extraTime* chargePerMin;
            let query2 = "update orders set waiting_charges=? where id = ?"
            let params2 = [waitingCharges,orderId];
            let result2 = await ExecuteQ.Query(dbName,query2,params2);
            let getAgentDbData=await common.GetAgentDbInformation(dbName);        
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
            let query3 = "update cbl_user_orders set waiting_charges=? where order_id=?";
            let params3 = [waitingCharges,orderId]
            let result3 = await ExecuteQ.QueryAgent(agentConnection,query3,params3)
            resolve();
        }catch(err){
            logger.debug("===========err=========",err);
            reject(err);
        }
    })
}

exports.deliveredOrder=function (dbName,res,orderid,status,offset,service_type,callback) {

    var date2 = moment().utcOffset(offset);
    var date = date2._d
    var date1=date.toISOString().slice(0,10);
    console.log('date---',date1);
    var com=0;
    var payAmount=0;
    var amount=0;
    var tip_agent = 0;
    var waiting_charges = 0;
    var delivery=0;
    var method=0;
    var handling_admin=0;
    var handling_supplier=0;
    let supplier_vat_value = 0;
    var supplierId=0;
    var adminId=0;
    var length=0;
    var status1,id;
    var cardId=0;
    var point=0;
    var spent=0;
    var userId=0;
    var orderStatus;
    var total_points;
    var cate=[];
    var product=[];
    var supplier_commision = 0;
    let agent_commision=0,is_agent_of_supplier=0,discount_amount=0,bear_by_supplier=0,commision_on_original_amount=0,original_amount=0;
    async.auto({
        checkStatus:async function (cb) {
                    try{
                    var sql='select status from orders where id = ? LIMIT 1';
                    let result=await ExecuteQ.Query(dbName,sql,[orderid])
                    // multiConnection[dbName].query(sql,[orderid],function (err,result) {
                    //    console.log("...........dfbfg.nb..........",err,result);
                    //     if(err){
                    //             //  console.log('errr1----', err);
                    //             cb(err)
                           
                    //     }
                    //     else{
                            console.log("=========",result[0].status)
                            orderStatus=result[0].status;
                           // console.log("..**********************orderStatus********************",orderStatus);
                            cb(null);
                    //     }
                    // })
                    }
                    catch(Err){
                        logger.debug("====Err!==",Err);
                        cb(err)
                    }
           
        },
        updateStatus:['checkStatus',async function (cb) {
            try{
                 var sql= 'update orders set status=?,delivered_on =?,near_on =?,shipped_on=? where id=?';
                await ExecuteQ.Query(dbName,sql,[status,date,date,date,orderid]);
                let query1 = "select id from orders where id=? and progress_on='0000-00-00 00:00:00'";
                let result1 = await ExecuteQ.Query(dbName,query1,[orderid]);
                if(result1 && result1.length){
                    var sql1= 'update orders set progress_on=? where id=? ';
                    await ExecuteQ.Query(dbName,sql1,[date,orderid]);
                }
                cb(null);
                        
                
            }
            catch(Err){
                cb(Err)
            }
           

        }],
        getData:['updateStatus',async function (cb) {
            try{
            var sql1='select o.user_id,o.user_service_charge,o.refund_amount,o.tip_agent,supplier_commision,o.payment_type,o.net_amount,o.handling_admin,o.handling_supplier,s.id as supplier,a.id as admin, ' +
                ' o.supplier_vat_value,o.slot_price,o.delivery_charges,o.card_payment_id from orders o join supplier_branch sb on sb.id=o.supplier_branch_id ' +
                'left join supplier s on s.id=sb.supplier_id left join admin a on a.id=s.created_by where o.id=? ';
            let reply=await ExecuteQ.Query(dbName,sql1,[orderid]);
        //   let st=  multiConnection[dbName].query(sql1,[orderid],function(err,reply)
        //     {
        //         logger.debug("====STMT=:>",st.sql)
        //         if(err) {
        //             cb(err)
        //             // multiConnection[dbName].rollback(function () {
        //             //     console.log('err2-----',err);
        //             //     cb(err);
        //             // });
        //         } else
        //         {
                   // console.log("...............getData.............",reply);
                    amount=parseFloat(reply[0].net_amount)-parseFloat(reply[0].refund_amount);
                    handling_admin=parseFloat(reply[0].handling_admin);
                    handling_supplier=parseFloat(reply[0].handling_supplier);
                    supplier_commision = parseFloat(reply[0].supplier_commision)
                    com= parseFloat(reply[0].supplier_commision)+parseFloat(reply[0].slot_price)
                    supplier_vat_value = parseFloat(reply[0].supplier_vat_value)
                    delivery=parseFloat(reply[0].delivery_charges);
                    user_service_charge = parseFloat(reply[0].user_service_charge)
                   // payAmount=parseInt(reply[0].net_amount)-parseInt(reply[0].handling_admin);
                    method=parseInt(reply[0].payment_type);
                    supplierId=reply[0].supplier!=null?reply[0].supplier:0;
                    adminId=reply[0].admin!=null?reply[0].admin:0;
                    cardId=reply[0].card_payment_id;
                    userId = reply[0].user_id;
                    //amount=amount+delivery;
                 //   console.log('value-----',amount,handling_admin,handling_supplier,delivery,method,supplierId,adminId,cardId);
                    cb(null);
                // }
            // });
            }
            catch(Err){
                cb(Err)
            }
        }],
        getAgentDetail:['getData',async function(cb){
            try{
                let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
                let agent_order_data=await ExecuteQ.QueryAgent(agentConnection,"select commission_ammount, tip_agent,agent_base_price, agent_delivery_charge_share,waiting_charges,cu.* from cbl_user_orders co join cbl_user cu on cu.id=co.user_id where co.order_id=?",[orderid]);
                if(agent_order_data && agent_order_data.length>0){
                    is_agent_of_supplier=agent_order_data[0].supplier_id;
                    agent_commision=parseFloat(agent_order_data[0].commission_ammount);
                    agent_base_price = parseFloat(agent_order_data[0].agent_base_price);
                    agent_delivery_charge_share=parseFloat(agent_order_data[0].agent_delivery_charge_share);
                    tip_agent = parseFloat(agent_order_data[0].tip_agent);
                    waiting_charges = parseFloat(agent_order_data[0].waiting_charges);
                    logger.debug("======is_agent_of_supplier===agent_commision====tip_agent==waiting_charges===",is_agent_of_supplier,
                    agent_commision,tip_agent,waiting_charges
                    )
                }      
                cb(null)
            }
            catch(Err){
                cb(null)
            }   
        }],
        promoDiscount:['getAgentDetail',async function(cb){
            try{
                let promo_data=await ExecuteQ.Query(dbName,"select IFNULL(SUM(orp.price*orp.quantity),0) as tota_product_amount,pc.discountPrice,pc.discountType,pc.bear_by,pc.commission_on,op.totalAmount,op.discountAmount from order_promo op join promoCode pc on pc.id=op.promoId join order_prices orp on orp.order_id=op.orderId where op.orderId=?",[orderid])
                if(promo_data && promo_data.length>0){
                    // bear_by_supplier=0 for admin,commision_on_original_amount=0 for original price;
                    if(parseInt(promo_data[0].tota_product_amount)>0){
                        logger.debug("======promo_data",promo_data);
                        let original_discount_amount=0;
                        discount_amount=promo_data[0].discountAmount
                        original_amount=promo_data[0].tota_product_amount
                        bear_by_supplier=promo_data[0].bear_by
                        commission_on=promo_data[0].commission_on
                        logger.debug("=====discount_amount==original_amount===bear_by_supplier==commission_on==>>",discount_amount,
                        original_amount,bear_by_supplier,commission_on)
                        // if(commission_on!=0){
                        //     if(promo_data[0].discountType!=0){
                        //         original_discount_amount=(original_amount+delivery+handling_admin)-((original_amount+delivery+handling_admin)*promo_data[0].discountPrice)/100;
                        //         logger.debug("===discountPrice=====",promo_data[0].discountPrice);
                        //         discount_amount=original_discount_amount*promo_data[0].discountPrice/100;
                        //         logger.debug("===original_discount_amount=====discount_amount",original_discount_amount,discount_amount)
                        //         }
                        // }
                        
                    }
                }
                cb(null)
            }
            catch(Err){
                logger.debug("====Err!==",Err);
                cb(Err)
            }   
        }],
        getAccountData:['promoDiscount',async function(cb){
            try{
            logger.debug("===============================in getaccount data===========================")
          if(method == 1 || method==4) {
              var sql2 = 'select id,status from account_payable where supplier_id = ? AND  DATE(updated_date) = ? ';
              let check=await ExecuteQ.Query(dbName,sql2,[supplierId, date1])
              //   multiConnection[dbName].query(sql2, [supplierId, date1], function (err, check) {
            //        if (err) {
            //         //   multiConnection[dbName].rollback(function () {
            //               console.log('err3-----', err);
            //               cb(err);
            //         //   });
            //       } else {
                      length = check.length;
                      if(length) {
                          status1 = check[0].status;
                          id = check[0].id
                      }
                      cb(null);
            //       }
            //   });
          }
          else  {
                var sql2 = 'select  id,status from account_receivable where supplier_id = ? AND  DATE(updated_at) = ? ';
                let check=await ExecuteQ.Query(dbName,sql2,[supplierId, date1]);
                length = check.length;
                if(length)
                {
                    status1 = check[0].status;
                    id = check[0].id
                }
                cb(null);
          }
        }
        catch(Err){
            cb(Err);
        }
        }],
        insertion1:['getAccountData',async function (cb) {
            let adminDeliveryCharges=0;
            let supplierDeliveryCharges=0
            let adminPromoBearAmount=0;
            let supplierPromoBearAmount=0;
            try{
                let isAdminDeliveryCharges=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["is_delivery_charge_to_admin","1"]);
                agent_commision=isAdminDeliveryCharges && isAdminDeliveryCharges.length>0?delivery:agent_commision;
                logger.debug("=handling_admin==supplier_commision===is_agent_of_supplier==agent_commision===tip_agent=",
                    handling_admin,
                    supplier_commision,
                    is_agent_of_supplier,
                    agent_commision,
                    tip_agent
                )
         if(method == 1 || method==4 || method!=0){
             console.log("amount =========== ",amount)
             console.log("amount =========== ",(handling_admin+user_service_charge+supplier_commision+(parseInt(is_agent_of_supplier)==0?agent_commision:0)+(parseInt(is_agent_of_supplier)==0?tip_agent:0)+(parseInt(is_agent_of_supplier)==0?waiting_charges:0)))
             console.log("1111111111111111111 ", handling_admin, user_service_charge, supplier_commision)
             console.log("22222222222222222222  ", is_agent_of_supplier, agent_commision, tip_agent, waiting_charges);
             
             let userServiceChargeToSupplier = await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["userServiceChargeToSupplier","1"]);

             if(userServiceChargeToSupplier && userServiceChargeToSupplier.length>0){
                payAmount=parseFloat(amount)-(handling_admin+supplier_commision+(parseInt(is_agent_of_supplier)==0?agent_commision:0)+(parseInt(is_agent_of_supplier)==0?tip_agent:0)+(parseInt(is_agent_of_supplier)==0?waiting_charges:0));

             }else{
                payAmount=parseFloat(amount)-(handling_admin+user_service_charge+supplier_commision+(parseInt(is_agent_of_supplier)==0?agent_commision:0)+(parseInt(is_agent_of_supplier)==0?tip_agent:0)+(parseInt(is_agent_of_supplier)==0?waiting_charges:0));

             }           

           
            payAmount=isNaN(payAmount-(bear_by_supplier!=0?discount_amount:0))==true?0:(payAmount-(bear_by_supplier!=0?discount_amount:0));

            //  if(length){
            //      if(status1==1){
            //          var sql3 = "update account_payable set total_amount = total_amount + ?,amount_left = amount_left + ?,status = ? ,updated_date = ? where id = ?";
            //         await ExecuteQ.Query(dbName,sql3,[payAmount, payAmount, 2, date,id]);
            //         cb(null);
                    
            //      }
            //      else{
            //          var sql3 = "update account_payable set total_amount = total_amount + ?,amount_left  = amount_left + ?,updated_date = ? where id = ? ";
            //         await ExecuteQ.Query(dbName,sql3,[payAmount, payAmount, date,id]);
            //         cb(null);
                   
            //      }
            //  }
             
            //  else {
                 
                var sql3='insert into account_payable(admin_id,supplier_id,total_amount,amount_paid,amount_left,status,created_date)values(?,?,?,?,?,?,?)';
                let result1=await ExecuteQ.Query(dbName,sql3,[adminId,supplierId,payAmount,0,payAmount,0,date]);
                //  let stmt = multiConnection[dbName].query(sql3,[adminId,supplierId,payAmount,0,payAmount,0,date],function (err,result1) {
                //     logger.debug("===========update account_payable=====2=====",stmt.sql3)
                //      if (err) {
                //         //  multiConnection[dbName].rollback(function () {
                //              console.log('err6-----', err);
                //              cb(err);
                //         //  });
                //      }
                //      else{
                         id=result1.insertId;
                         cb(null);
                //      }
                //  });

          //   }

             
         }
         else{
            
            let userServiceChargeToSupplier = await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["userServiceChargeToSupplier","1"]);

            if(userServiceChargeToSupplier && userServiceChargeToSupplier.length>0){
                payAmount=amount-(handling_admin+supplier_commision+(parseInt(is_agent_of_supplier)==0?agent_commision:0)+(parseInt(is_agent_of_supplier)==0?tip_agent:0)+(parseInt(is_agent_of_supplier)==0?waiting_charges:0));

            }else{
                payAmount=(handling_admin+user_service_charge+supplier_commision+(parseInt(is_agent_of_supplier)==0?agent_commision:0)+(parseInt(is_agent_of_supplier)==0?tip_agent:0)+(parseInt(is_agent_of_supplier)==0?waiting_charges:0));

            }

            payAmount=isNaN(payAmount-(bear_by_supplier!=0?discount_amount:0))==true?0:(payAmount-(bear_by_supplier!=0?discount_amount:0));


             if(length){
                 if(status1==1){
                     var sql3 = "update account_receivable set total_amount = total_amount + ?,amount_left = amount_left + ?,status = ?,updated_at=? where id = ?";
                     await ExecuteQ.Query(dbName,sql3,[payAmount, payAmount, 2,date,id]);

                    //  let stmt = multiConnection[dbName].query(sql3, [payAmount, payAmount, 2,date,id], function (err, update) {
                    //     logger.debug("===========update account_payable======3====",stmt.sql3)
                    //      if (err) {
                    //         //  multiConnection[dbName].rollback(function () {
                    //              console.log('err4-----', err);
                    //             cb(err);
                    //         //  });
                    //      }
                    //      else{
                             cb(null);
                    //      }
                    //  });
                 }
                 else{
                     //console.log('values-----',id);
                     var sql3 = "update account_receivable set total_amount = total_amount + ?,amount_left  = amount_left + ?,updated_at=? where id = ? ";
                     await ExecuteQ.Query(dbName,sql3,[payAmount, payAmount, date,id]);
                    //  let stmt = multiConnection[dbName].query(sql3, [payAmount, payAmount, date,id], function (err, update) {
                    //     logger.debug("===========update account_payable======4====",stmt.sql3)
                     

                    //      if (err) {
                    //         //  multiConnection[dbName].rollback(function () {
                    //              console.log('err5-----', err);
                    //            cb(err);
                    //         //  });
                    //      }
                    //      else {
                             cb(null);
                    //      }
                    //  });
                 }
             }
             else {
                 var sql3='insert into account_receivable(admin_id,supplier_id,total_amount,amount_paid,amount_left,status,created_date)values(?,?,?,?,?,?,?)';
                 let result1=await ExecuteQ.Query(dbName,sql3,[adminId,supplierId,payAmount,0,payAmount,0,date]);
                    id=result1.insertId;
                cb(null);
                
             }
         }

        }
        catch(Err){
            cb(Err)
        }
       }],
        insertion2:['insertion1',async function (cb) {
            try{
            if(method==1 || method==4 || method!=0){
                var sql4='insert into account_payable_order(account_payable_id,order_id,order_transaction_id,total_amount,total_left,commission)values(?,?,?,?,?,?)';
                console.log(id, orderid,cardId,"--------------------",payAmount,"--------------------",amount,com)

                if(dbName== "northwesteats_0692"){
                    let commision=await ExecuteQ.Query(dbName,`select commission,admin_offer,vat_value from supplier where id=? `,[supplierId]);
                    console.log(commision,"commisioncommision")
                    com = commision[0].commission
                    console.log("user_service_charge>>>>",user_service_charge)
                    payAmount = amount - user_service_charge;
                    com = payAmount * com /100
                    payAmount = payAmount -com;
                    let vat = (com + user_service_charge) * commision[0].vat_value/100
                    payAmount = payAmount - vat
                    
                    
                }

                await ExecuteQ.Query(dbName,sql4,[id, orderid,cardId,payAmount,payAmount,com])
                // let stmt = multiConnection[dbName].query(sql4, [id, orderid,cardId,payAmount,payAmount,com], function (err, reply1) {
                //     logger.debug("===========update account_payable=====6=====",stmt.sql4)
                //     if (err) {
                //         // multiConnection[dbName].rollback(function () {
                //             console.log('err5-----', err);
                //             cb(err);
                //         // });
                //     }
                //     else {
                        cb(null);
                //     }
                // });
            }
            else{
                var sql4='insert into account_receivable_order(account_receivable_id,order_id,order_transaction_id,total_amount,total_left,commission)values(?,?,?,?,?,?)';

                if(dbName== "northwesteats_0692"){
                    let commision=await ExecuteQ.Query(dbName,`select commission,admin_offer,vat_value from supplier where id=? `,[supplierId]);
                    console.log(commision,"commisioncommision")
                    com = commision[0].commission
                    console.log("user_service_charge>>>>",user_service_charge)
                    payAmount = amount - user_service_charge;
                    com = payAmount * com /100
                    payAmount = payAmount -com;
                    let vat = (com + user_service_charge) * commision[0].vat_value/100
                    payAmount = payAmount - vat
                    // let admin_offer = commision[0].admin_offer
                    // payAmount = payAmount - admin_offer;
                    // console.log("admin_offer>>>>",admin_offer)
                }
                
                console.log("payAmount>>>>",payAmount)
                console.log("com>>>>",com)
                await ExecuteQ.Query(dbName,sql4,[id, orderid,cardId,payAmount,payAmount,com])
                // let stmt = multiConnection[dbName].query(sql4,[id, orderid,cardId,payAmount,payAmount,com], function (err, reply1) {
                //     logger.debug("===========update account_payable=====7=====",stmt.sql4)
                //     if (err) {
                //         // multiConnection[dbName].rollback(function () {
                //             console.log('err5-----', err);
                //             cb(err);
                //         // });
                //     }
                //     else {
                        cb(null);
                //     }
                // });
            }
        }
        catch(Err){
            cb(Err)
        }
        }],
        supplier_level:['insertion2',function(cb){
            console.log("................ supplier_level............",orderid,supplierId);
            calculate(dbName,orderid,supplierId,function(err,result){
                if(err){
                    cb(err);
                }else{
                 
                    if(isNaN(result)){
                      total_points = 0;
                        
                    }else{
                    total_points = parseInt(result);
                    }
                    cb(null);
                }
            })
        }],
        updateUser:["supplier_level",async function (cb) {
            try{
            logger.debug(".........sdfbgvdfbhgf............................",total_points);
            var sql23= "update user set loyalty_points=loyalty_points+? where id =?";
            await ExecuteQ.Query(dbName,sql23,[total_points,userId])
            console.log("===========is_agent_of_supplier===delivery==agent_commision==discount_amount=bear_by_supplier>>",is_agent_of_supplier,delivery,agent_commision,discount_amount,bear_by_supplier)
            if(parseInt(status)==5){
                
            if((parseInt(is_agent_of_supplier)==0) && (parseFloat(delivery)>=parseFloat(agent_commision))){
                   adminDeliveryCharges=(parseFloat(delivery)==parseFloat(agent_commision))?agent_commision:parseFloat(delivery)-parseFloat(agent_commision)
                   let dupData=await ExecuteQ.Query(dbName,`select id from additional_admin_revenue_amount where supplier_id=? and order_id=? and delivery_amount=?`,[0,orderid,adminDeliveryCharges])
                   console.log("===dupData=1==>>",dupData)
                   if(Array.isArray(dupData) && !dupData.length){
                      await ExecuteQ.Query(dbName,'insert into additional_admin_revenue_amount(promo_bear_amount,delivery_amount,order_cancel_amount,supplier_id,order_id) values(?,?,?,?,?)',[0,adminDeliveryCharges,0,0,orderid])
                   }
            }
            if((parseInt(is_agent_of_supplier)!=0) && (parseFloat(delivery)>=parseFloat(agent_commision))){
                   supplierDeliveryCharges=(parseFloat(delivery)==parseFloat(agent_commision))?agent_commision:parseFloat(delivery)-parseFloat(agent_commision)
                   let dupData=await ExecuteQ.Query(dbName,`select id from additional_admin_revenue_amount where supplier_id=? and order_id=? and delivery_amount=?`,[supplierId,orderid,supplierDeliveryCharges])
                   console.log("===dupData=2==>>",dupData)
                   if(Array.isArray(dupData) && !dupData.length){
                   await ExecuteQ.Query(dbName,'insert into additional_admin_revenue_amount(promo_bear_amount,delivery_amount,order_cancel_amount,supplier_id,order_id) values(?,?,?,?,?)',[0,supplierDeliveryCharges,0,supplierId,orderid])
                   }
            }
            if(bear_by_supplier!=0 && discount_amount>0){
                let dupData=await ExecuteQ.Query(dbName,`select id from additional_admin_revenue_amount where supplier_id=? and order_id=? and promo_bear_amount=?`,[supplierId,orderid,discount_amount])
                console.log("===dupData=3==>>",dupData)
                if(Array.isArray(dupData) && !dupData.length){
                  await ExecuteQ.Query(dbName,'insert into additional_admin_revenue_amount(promo_bear_amount,delivery_amount,order_cancel_amount,supplier_id,order_id) values(?,?,?,?,?)',[discount_amount,0,0,supplierId,orderid])
                }
            }
            if(bear_by_supplier==0 && discount_amount>0){
                let dupData=await ExecuteQ.Query(dbName,`select id from additional_admin_revenue_amount where supplier_id=? and order_id=? and promo_bear_amount=?`,[0,orderid,discount_amount])
                console.log("===dupData=4==>>",dupData)
                if(Array.isArray(dupData) && !dupData.length){
                   await ExecuteQ.Query(dbName,'insert into additional_admin_revenue_amount(promo_bear_amount,delivery_amount,order_cancel_amount,supplier_id,order_id) values(?,?,?,?,?)',[discount_amount,0,0,0,orderid])
                }
            }
        }

            logger.debug("=====================1234=================")
            cb(null);
           
            }
            catch(Err){
                cb(Err)
            }
        }]
    },function(err,result){
        logger.debug('=====================1================')
         if(err) {
                console.log('err2-----',err);
                sendResponse.somethingWentWrongError(res);
        }
        else{
            logger.debug('=====================2================')
        callback(null,[]);
        }
    })

}

exports.updateOrder= function(dbName,res,status,orderId,date,cb) {
    var sql= 'update orders set status=?,schedule_date = ?,info=? where id=? AND status =7';
    multiConnection[dbName].query(sql,[status,date,1,orderId],function(err,result)
    {
        if(err)
        {
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res);

        }
        else
        {
            cb(null);
        }
    });
}


var calculate = async  function(dbName,orderid,supplierId,callback){
    var product;
    var arr =[];
    var selectSupplier;
    var  checkNext = false;
    var total = 0;
    var temp = false;
    let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
    var is_decimal_quantity_allowed = "0";
    if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
        is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
    }
    async.auto({
        orderProduct:async function(cb){
            try{
                var sql = "select p.category_id,op.price,op.product_id,op.quantity from orders o join order_prices op on o.id = op.order_id join product p" +
                " on p.id = op.product_id where o.id = ?"
                let result=await ExecuteQ.Query(dbName,sql,[orderid]);
                    product = result;
                    cb(null)
            }
            catch(Err){
                cb(Err)
            }
            // var sql = "select p.category_id,op.price,op.product_id,op.quantity from orders o join order_prices op on o.id = op.order_id join product p" +
            //     " on p.id = op.product_id where o.id = ?"
            // multiConnection[dbName].query(sql,orderid,function(err,result){
            
            //     if(err){
            //         cb(err);
            //     }else{
            //         product = result;
            //         cb(null);
            //     }
            // })
        },
        checkSupplier:['orderProduct',async function(cb){
            try{
            var sql = "select s.commisionButton from supplier s join supplier_category sc on sc.supplier_id = s.id where sc.onOffComm = 1 and s.id = ? and s.is_deleted = 0 GROUP BY s.id"
            let result=await ExecuteQ.Query(dbName,sql,[supplierId])
            // multiConnection[dbName].query(sql,[supplierId],function(err,result){
            //    console.log(".......................calculate..........2.......",err,result);

            //     if(err){
            //         cb(err);
            //     }else{
                    if(result.length){
                        checkNext = true;
                        if(result[0].commisionButton == 1){
                            selectSupplier = 1;
                            cb(null);
                        }else{
                            selectSupplier = 0;
                            cb(null);
                        }
                    }else{
                        checkNext =false;
                        total = 0;
                        cb(null);
                    }
            //     }
            // })
        }
        catch(Err){
            cb(Err)
        }
        }],
        sumCategory:['checkSupplier',function(cb){
            console.log(".......................sumCategory..........3.......");

           console.log(".......................sumCategory..........3.......",product);

            if(productLen == 0){
                return cb(null)
            }
            
            var sencodeLoop = false;
         
            
            var productLen = product.length;
            
            if(productLen == 0){
                return cb(null)
            }
            
            if(productLen ==1)
            {
                var tempPrice = parseInt(product[0].price) * parseInt(product[0].quantity);
                if(is_decimal_quantity_allowed == "1"){
                    tempPrice = parseInt(product[0].price) * parseFloat(product[0].quantity);
                }
                arr.push({categoryId:product[0].category_id , price:tempPrice});
                console.log("---------------------------------------------------------------------------------------",arr);
                return cb(null)
            }        
            for(var i =1;i<productLen;i++){
                (function(i){
                    if(i ==1  ){
                        var tempPrice = parseInt(product[0].price) * parseInt(product[0].quantity);
                        if(is_decimal_quantity_allowed == "1"){
                            tempPrice = parseInt(product[0].price) * parseFloat(product[0].quantity);
                        }
                        arr.push({categoryId:product[0].category_id , price:tempPrice});
                  //      console.log("---------------------------------------------------------------------------------------",arr);
                    }
                    
                    var arrLength = arr.length;
                    
                    for(var j =0;j<arrLength;j++){
                        (function(j){
                       //     console.log(".*********product[i].category_id********",product[i].category_id);
                     //       console.log(".*********arr[j].categoryId********",arr[j].categoryId);

                            if(product[i].category_id == arr[j].categoryId){
                                var priceValue = arr[j].price;
                            
                        //        console.log("...product[i].price.......",product[i].price);
                        //        console.log("...product[i].quantity *************** product[i].quantity.......",product[i].quantity);

                                tempPrice = parseInt(product[i].price) * parseInt(product[i].quantity);
                            
                          //      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&",tempPrice);
                         //       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&",priceValue);
                                arr[j].price = parseInt(tempPrice) + parseInt(priceValue);
                        //        console.log("add*************add*******************", arr[i]);
                                sencodeLoop = true
                            
                            }else{
                                if(j == (arrLength  -1) && sencodeLoop == false){
                                    tempPrice = parseInt(product[i].price) * parseInt(product[i].quantity);
                                    if(is_decimal_quantity_allowed == "1"){
                                        tempPrice = parseInt(product[i].price) * parseFloat(product[i].quantity);
                                    }
                                    arr.push({categoryId:product[i].category_id , price:tempPrice});
                          //          console.log(",.,,,first time......................",arr);

                                }
                            }
                            
                        }(j));
                        
                        
                        if(i == (productLen - 1) && j == (arrLength -1)){
                            cb(null);
                        }
                    }

                    if(i == (productLen - 1) && (arrLength == 0 || j == (arrLength -1))){
                        cb(null);
                    }
                }(i));
            }
            
        }],
        checkPrice:['sumCategory',function(cb){
            
          //  console.log("............arr............................",arr);
            if(checkNext == true){
            //      console.log(".................................getArrr.........................",arr);
                var lens = arr.length;
                if(lens == 0){
                    callback(null,total)
                }
                for(var k = 0;k< lens;k++){
                    (function(k){
               //         console.log(".................................function.........................",k);
                        getPoints(dbName,arr[k],supplierId,selectSupplier,function(err,result){
                            if(err){
                                cb(err);
                            }else{
                         //       console.log("...............arr[k].......................",arr[k]);
                           //     console.log("...............result.......................",result);
                                total = total + result;
                          //      console.log("...............total123.......................",total);
                                
                                setTimeout(function(){

                                    if(k == (lens-1)){
                          //              console.log("...............total.......................",total);
                                        temp =true;
                                        callback(null,total)
                                    }  
                                },1000)

                            }
                        })
                    }(k));
                }
            }else{
                cb(null)
            }
        }]
    },function(err,result){
        
        if(err){
            callback(err);
        }else{
          if(temp == true){
          //   console.log("..............temp.................",temp);
          //   console.log(".................aaaaaa......................final callback...................................................",total);
          } 
        }
    })
}

var getPoints = function(dbName,arr,supplierId,selectSupplier,callback){
     var findValue = false;
    var level =  9;
    var loyality=0;
    var commission;
    async.auto({
        getSupplier:async function(cb){
            try{
            var sql = "select commission from supplier_category where category_id = ? and 	commission_type = 1 and supplier_id = ?";
            let result=await ExecuteQ.Query(dbName,sql,[arr.categoryId,supplierId])
            // multiConnection[dbName].query(sql,[arr.categoryId,supplierId],function(err,result){
            //     console.log(".,.....................err...............................",err,result);
            //     if(err){
            //         cb(err);
            //     }else{
                    // console.log("..............get supplier............................................",err,result);
                    if(result.length){
                      commission = result[0].commission;
                    }else{
                      commission = 0;
                    }
                    cb(null);
                    
            //     }
            // })
                }
                catch(Err){
                    cb(Err)
                }
        },
         getLevel:['getSupplier',async function(cb){
             try{
            if(selectSupplier == 1){

                var sql='select distinct(sc.commission) from supplier_category sc join supplier s on s.id = sc.supplier_id where commission_type = 1 and s.is_live = 1 and `onOffComm` = 1 and `category_id` =? order by commission DESC LIMIT 0,3'
               let result=await ExecuteQ.Query(dbName,sql,[arr.categoryId])
                // multiConnection[dbName].query(sql,[arr.categoryId],function(err,result){
                //     if(err){
                //         cb(err);
                //     }else{
                        
                        console.log("....................result[0].commission ....................",result);
                        
                        var len  = result.length;
                        if(len ==0){
                         return cb(null);
                        }
                        if(result[0].commission && commission >  result[0].commission || commission ==  result[0].commission){
                          console.log("..................level 2.........................");
                            findValue = true;
                            level = 2;
                        } else if(result.length >= 2 && result[1].commission && commission <  result[0].commission && (commission >  result[1].commission || commission ==  result[1].commission)){
                            console.log("..................level 0.........................");
                            findValue = true;
                            level = 0;
                        }else if(result.length >= 3 && result[2].commission && commission <  result[1].commission && (commission >  result[2].commission || commission ==  result[2].commission)){
                            findValue = true;
                            level = 1;
                        }else {
                            findValue = true;
                            level = 3;
                        }
                        cb(null);
                //     }
                // })
            }else{
                cb(null);
            }
        }
        catch(Err){
            cb(Err);
        }
        }],
        checkLevel:['getLevel',async function(cb){
            try{
           if(level == 3){
               var sql='select onOffComm from supplier_category where commission_type = 1 and category_id = ? and supplier_id = ?';
                let result=await ExecuteQ.Query(dbName,sql,[arr.categoryId,supplierId])
               //    multiConnection[dbName].query(sql,[arr.categoryId,supplierId],function(err,result){
            //        console.log("....................levle 3........",result);
                   if(result.length && result[0].onOffComm == 1){
                       level = 3;
                       cb(null);
                   }else{
                       level = 6;
                       cb(null);
                   }
            //    })

           }else{
               cb(null);
           }
        }
        catch(Err){
            cb(null)
        }
        }],
        getPoints:['checkLevel',async function(cb){
            try{
            if(level == 6){
                loyality = 0;
               return  cb(null);
            }else{
                if(selectSupplier == 1){
                    var sql = "select amount_spent,	points from loyalty_points where commission_package = ? ";
                }else{
                    var sql = "select amount_spent,	points from loyalty_points where commission_package = ? ";
                    level = 3;
                }
                let result=await ExecuteQ.Query(dbName,sql,[level])
                // multiConnection[dbName].query(sql,[level],function(err,result){
                //     console.log(".*******************************level***********",result); 
                    
                //     if(err){
                //         cb(err);
                //     }else{
                        if(result.length){
                            loyality = (arr.price / result[0].amount_spent)*result[0].points;
                            cb(null);
                        }else{
                            cb(null);
                        }
                //     }
                // })
            }
        }
        catch(Err)
        {
            logger.debug("==Err!==",Err)
            cb(Err)
        }
        }]
    },function(err,result){
        if(err){
            callback(err)
        }else{
            console.log("..............loyality...............",loyality);
            callback(null,loyality);
        }
    })

}


exports.payToAgentAndSupplier= async function (dbName,res,orderid,callback) {
    console.log("111111111111111111111111111111111")
    let stripe =""
    let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
    let currencyName=await Universal.getCurrency(dbName);
    logger.debug("=======currencyName",currencyName)
    let stripe_keys=strip_secret_key_data && strip_secret_key_data.length>0?strip_secret_key_data[0].value:"test_kg780"
     stripe = require('stripe')(stripe_keys);

    var charge_id,
    is_supplier_stripe_split_enabled,
    is_agent_stripe_split_enabled, 
    agent_stripe_account_id,
    agent_tap_account_id,
    supplier_stripe_account_id, 
    supplier_tap_account_id,
    agent_id,
    supplier_payable_amount,
    agent_payable_amount,
    supplier_id,
    is_admin_driver;
    
    let is_supplier_tap_split_enabled = "SELECT value FROM `tbl_setting` WHERE `key` = 'is_supplier_tap_split_enabled' and value=1 LIMIT 1";
    let tapSecretkey = "SELECT value FROM `tbl_setting` WHERE `key` = 'tap_secret_key'  LIMIT 1";

    // is_supplier_tap_split_enabled = is_supplier_tap_split_enabled && is_supplier_tap_split_enabled.length>0?1:0;

    let is_agent_tap_split_enabled = "SELECT value FROM `tbl_setting` WHERE `key` = 'is_agent_tap_split_enabled' and value=1 LIMIT 1";
    // is_agent_tap_split_enabled = is_agent_tap_split_enabled && is_agent_tap_split_enabled.length>0?1:0;
    async.auto({
        getPaymentSource:async function (cb) {     
            try{       
                    var sql="select o.payment_source, o.card_payment_id, o.payment_type, (SELECT value FROM `tbl_setting` WHERE `key` = 'is_supplier_stripe_split_enabled' LIMIT 1) is_supplier_stripe_split_enabled, (SELECT value FROM `tbl_setting` WHERE `key` = 'is_agent_stripe_split_enabled' LIMIT 1) is_agent_stripe_split_enabled from orders o where o.id = ?  LIMIT 1";
                    let result=await ExecuteQ.Query(dbName,sql,[orderid]);
                    // console.log("222222222222222222222222222222222222222")
                    // multiConnection[dbName].query(sql,[orderid],function (err,result) {
                    //    console.log("...........dfbfg.nb..........",err,result);
                    //     if(err){
                    //             cb(err)                           
                    //     } else {
                            console.log("=========",result[0].payment_source)
                            if(result[0] != undefined && result[0].payment_source && result[0].payment_source == "stripe" && result[0].card_payment_id != "" && result[0].is_supplier_stripe_split_enabled=="1" && result[0].is_agent_stripe_split_enabled=="1"){
                                charge_id=result[0].card_payment_id; // charge id
                                is_supplier_stripe_split_enabled=result[0].is_supplier_stripe_split_enabled; // 0/1 (0-disabled, 1 - enabled)
                                is_agent_stripe_split_enabled=result[0].is_agent_stripe_split_enabled;// 0/1 (0-disabled, 1 - enabled)
                                console.log("3333333333333333333333333333333333333333333")
                                cb(null);
                            }else{
                                console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",result)
                                // if(result[0].payment_type=="0" && result[0].allow_agentwallet_to_pay_for_cashorder && result[0].allow_agentwallet_to_pay_for_cashorder=="1"){
                                //     console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",result)
                                //     var GetAgentDbData = await common.GetAgentDbInformation(dbName);
                                //     var AgentConnection = await common.RunTimeAgentConnection(GetAgentDbData);
                                    
                                //     var agentOrderDetails = await ExecuteQ.QueryAgent(AgentConnection,"SELECT (select wallet_amount from cbl_user where id=cbl_user_orders.user_id) as agent_wallet_balance, `tip_agent`, `commission_ammount`,`net_amount`, agent_base_price, agent_delivery_charge_share,user_id,(net_amount - (tip_agent + commission_ammount + agent_base_price + agent_delivery_charge_share)) amount_payable, (tip_agent + commission_ammount + agent_base_price + agent_delivery_charge_share) agent_amount FROM `cbl_user_orders` WHERE order_id=?",[orderid]);
                                //     console.log("ccccccccccccccccccccccccccccccc",agentOrderDetails)
                                //     if(agentOrderDetails[0].agent_wallet_balance < agentOrderDetails[0].amount_payable){
                                //         console.log("dddddddddddddddddddddddd")
                                //         var message = "Delivery boy do not have enough balance in wallet";
                                //         cb(message)
                                //         sendResponse.sendErrorMessage(message, res, 400)
                                //     }else{
                                //         console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
                                //         let query1 = "update cbl_user set wallet_amount=wallet_amount-? where id=?"
                                //         let params1 = [agentOrderDetails[0].amount_payable,agentOrderDetails[0].user_id]
                                //         await ExecuteQ.QueryAgent(AgentConnection,query1,params1);
                                //         await agentPayablePayment(dbName, res, agentOrderDetails[0].agent_amount,orderid, agentOrderDetails[0].user_id)
                                //     }
                                // }else{
                                    console.log("44444444444444444444444444444444444444")
                                    cb(null);
                                //}
                            }
                            
                    //     }
                    // })
                }
                catch(Err){
                    cb(Err)
                }
           
        },
        getAgentSupplierStripeAccountIds:['getPaymentSource',async function (cb) {
            // && result[0].is_supplier_stripe_split_enabled == "stripe" && result[0].is_agent_stripe_split_enabled == "1"){
            try{
                console.log("555555555555555555555555555555555555555555555555555")
                let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
                let agent_account_data=await ExecuteQ.QueryAgent(agentConnection,"select cu.stripe_account, cu.supplier_id, cu.id as agent_id,cuo.`commission_ammount`, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as agent_payable_amount from cbl_user_orders cuo join cbl_user cu on cuo.user_id=cu.id where cuo.order_id=? limit 1",[orderid]);

                var sql="SELECT s.id, s.stripe_account, (o.net_amount - (o.handling_admin + o.supplier_commision)) supplier_payable_amount, o.delivery_charges, o.self_pickup FROM `orders`o join supplier_branch sb on o.`supplier_branch_id`=sb.id join supplier s on s.id=sb.supplier_id WHERE o.id=?";
               let result=await ExecuteQ.Query(dbName,sql,[orderid])
                // multiConnection[dbName].query(sql,[orderid],function (err,result) {
                //     console.log("666666666666666666666666666666...........dfbfg.nb..........",err,result);
                //     if(err){
                //             cb(err)                           
                //     } else {
                        agent_stripe_account_id=(agent_account_data[0] && agent_account_data[0].stripe_account) ? agent_account_data[0].stripe_account : '';
                        if(result[0].self_pickup && result[0].self_pickup=='1'){
                            console.log("11111111222222222222- ------------- agent_account_data[0].agent_payable_amount")
                            agent_payable_amount = 0;
                        }else{
                            console.log(agent_account_data[0].agent_payable_amount,
                                 "- ------------- agent_account_data[0].agent_payable_amount")
                            console.log(agent_account_data, agent_account_data[0])
                            agent_payable_amount = (agent_account_data[0] && agent_account_data[0].agent_payable_amount) ? agent_account_data[0].agent_payable_amount : 0;
                        }
                        //agent_payable_amount = (agent_account_data[0] && agent_account_data[0].agent_payable_amount) ? agent_account_data[0].agent_payable_amount : 0;
                        agent_id = (agent_account_data[0] && agent_account_data[0].agent_id) ? agent_account_data[0].agent_id : '';
                        //is_admin_driver = agent_account_data[0].supplier_id!='0' ? '1' : '0';
                        supplier_stripe_account_id = (result[0] && result[0].stripe_account) ? result[0].stripe_account : '';
                        supplier_id = (result[0] && result[0].id) ? result[0].id : '';

                        // in case agetn commision on delivery chanrges
                        let agent_commision_amount=0;
                        let deliveryChargeData=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["commission_delivery_wise","1"]);
                        agent_commision_amount=deliveryChargeData && deliveryChargeData.length>0?agent_account_data[0].commission_ammount:0;

                        console.log("===agent_commision_amount======>>>",agent_commision_amount)
                        if(agent_account_data[0].supplier_id=='0'){ //if driver is of admin
                            var delivery_charges = (result[0] && result[0].delivery_charges) ? result[0].delivery_charges : 0;
                            supplier_payable_amount = (result[0] && result[0].supplier_payable_amount) ? (result[0].supplier_payable_amount - (parseFloat(agent_payable_amount-agent_commision_amount) + delivery_charges)) : 0;
                        }else{ //if driver is of supplier
                            supplier_payable_amount = (result[0] && result[0].supplier_payable_amount) ? (result[0].supplier_payable_amount - (agent_payable_amount-parseFloat(agent_commision_amount))) : 0;
                        }
        
                        console.log("777777777777777777777777777777777777777777777")
                        cb(null);
                //     }
                // })
            }
            catch(Err){
                console.log("===Err====>>",Err)
                cb(null)
            }   
        
        }],
        // getAgentSupplierTapAccountIds:['getAgentSupplierStripeAccountIds',async function (cb) {
        //     // && result[0].is_supplier_stripe_split_enabled == "stripe" && result[0].is_agent_stripe_split_enabled == "1"){
        //     try{
        //         console.log("555555555555555555555555tap555555555555555555555555555")
        //         let getAgentDbData=await common.GetAgentDbInformation(dbName);        
        //         let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
        //         let agent_account_data=await ExecuteQ.QueryAgent(agentConnection,
        //             "select cu.tap_destination_id, cu.supplier_id, cu.id as agent_id,cuo.`commission_ammount`, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as agent_payable_amount from cbl_user_orders cuo join cbl_user cu on cuo.user_id=cu.id where cuo.order_id=? limit 1",[orderid]);

        //         var sql="SELECT s.id, s.tap_destination_id, (o.net_amount - (o.handling_admin + o.supplier_commision)) supplier_payable_amount, o.delivery_charges, o.self_pickup FROM `orders`o join supplier_branch sb on o.`supplier_branch_id`=sb.id join supplier s on s.id=sb.supplier_id WHERE o.id=?";
        //        let result=await ExecuteQ.Query(dbName,sql,[orderid])
        //         // multiConnection[dbName].query(sql,[orderid],function (err,result) {
        //         //     console.log("666666666666666666666666666666...........dfbfg.nb..........",err,result);
        //         //     if(err){
        //         //             cb(err)                           
        //         //     } else {
        //             agent_tap_account_id=(agent_account_data[0] && agent_account_data[0].tap_destination_id) ? agent_account_data[0].tap_destination_id : '';
        //                 if(result[0].self_pickup && result[0].self_pickup=='1'){
        //                     console.log("11111111222222222222- -------tap------ agent_account_data[0].agent_payable_amount")
        //                     agent_payable_amount = 0;
        //                 }else{
        //                     console.log(agent_account_data[0].agent_payable_amount,
        //                          "- ------------- agent_account_data[0].agent_payable_amount")
        //                     console.log(agent_account_data, agent_account_data[0])
        //                     agent_payable_amount = (agent_account_data[0] && agent_account_data[0].agent_payable_amount) ? agent_account_data[0].agent_payable_amount : 0;
        //                 }
        //                 //agent_payable_amount = (agent_account_data[0] && agent_account_data[0].agent_payable_amount) ? agent_account_data[0].agent_payable_amount : 0;
        //                 agent_id = (agent_account_data[0] && agent_account_data[0].agent_id) ? agent_account_data[0].agent_id : '';
        //                 //is_admin_driver = agent_account_data[0].supplier_id!='0' ? '1' : '0';
        //                 supplier_tap_account_id = (result[0] && result[0].tap_destination_id) ? result[0].tap_destination_id : '';
        //                 supplier_id = (result[0] && result[0].id) ? result[0].id : '';

        //                 // in case agetn commision on delivery chanrges
        //                 let agent_commision_amount=0;
        //                 let deliveryChargeData=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["commission_delivery_wise","1"]);
        //                 agent_commision_amount=deliveryChargeData && deliveryChargeData.length>0?agent_account_data[0].commission_ammount:0;

        //                 console.log("===agent_commision_amount==tap====>>>",agent_commision_amount)
        //                 if(agent_account_data[0].supplier_id=='0'){ //if driver is of admin
        //                     var delivery_charges = (result[0] && result[0].delivery_charges) ? result[0].delivery_charges : 0;
        //                     supplier_payable_amount = (result[0] && result[0].supplier_payable_amount) ? (result[0].supplier_payable_amount - (parseFloat(agent_payable_amount-agent_commision_amount) + delivery_charges)) : 0;
        //                 }else{ //if driver is of supplier
        //                     supplier_payable_amount = (result[0] && result[0].supplier_payable_amount) ? (result[0].supplier_payable_amount - (agent_payable_amount-parseFloat(agent_commision_amount))) : 0;
        //                 }
        
        //                 console.log("77777777777777777777777777tap7777777777777777777")
        //                 cb(null);
        //         //     }
        //         // })
        //     }
        //     catch(Err){
        //         console.log("===Err====>>",Err)
        //         cb(null)
        //     }   
        
        // }],
        makePayments:['getAgentSupplierStripeAccountIds',async function (cb) {
            try{
            console.log("8888888888888888888888888888888",is_supplier_stripe_split_enabled,supplier_stripe_account_id,supplier_payable_amount)
            console.log("1111 8888888888888888888888888888888",is_agent_stripe_split_enabled,agent_stripe_account_id,agent_payable_amount)
            if (is_supplier_stripe_split_enabled=="1" && supplier_stripe_account_id!='' && supplier_payable_amount != 0 && supplier_payable_amount!=undefined) {
                console.log("999999999999999999999999999999999999999999999999",{
                    amount: Math.round(parseFloat(supplier_payable_amount * 100)), //parseFloat(supplier_payable_amount),
                    currency: currencyName,
                    source_transaction: charge_id,
                    destination: supplier_stripe_account_id,
                })
                const transfer = await stripe.transfers.create({
                    amount: Math.round(parseFloat(supplier_payable_amount * 100)),
                    currency: currencyName,
                    source_transaction: charge_id,
                    destination: supplier_stripe_account_id,
                });
                if(transfer.id){
                    await supplierPayablePayment(dbName, supplier_payable_amount, orderid, transfer.id, supplier_id)
                }
            }
            if (is_agent_stripe_split_enabled=="1" && agent_stripe_account_id!='' && agent_payable_amount != 0 && agent_payable_amount!=undefined) {

                console.log("00000000000000000000000000000000000000",{
                    amount: Math.round(parseFloat(agent_payable_amount * 100)), //parseFloat(agent_payable_amount),
                    currency: currencyName,
                    source_transaction: charge_id,
                    destination: agent_stripe_account_id,
                });
                const transfer = await stripe.transfers.create({
                    amount: Math.round(parseFloat(agent_payable_amount * 100)),
                    currency: currencyName,
                    source_transaction: charge_id,
                    destination: agent_stripe_account_id,
                });
                await agentPayablePayment(dbName, res, agent_payable_amount,orderid, agent_id)
            }
            cb(null)
        }
        catch(Err){
            console.log("===========split=Issue==makePayments=>>",Err)
            cb(null)
        }
            
        }],
        // makePaymentsForTap:['getAgentSupplierTapAccountIds',async function (cb) {
        //     console.log("8888888888888888888888888888888",is_supplier_tap_split_enabled,supplier_tap_account_id,supplier_payable_amount)
        //     console.log("1111 8888888888888888888888888888888",is_agent_tap_split_enabled,agent_tap_account_id,agent_payable_amount)
        //     if (is_supplier_tap_split_enabled=="1" && supplier_tap_account_id!='' && supplier_payable_amount != 0 && supplier_payable_amount!=undefined) {
        //         console.log("999999999999999999999999999999999999999999999999",{
        //             amount: Math.round(parseFloat(supplier_payable_amount * 100)), //parseFloat(supplier_payable_amount),
        //             currency: currencyName,
        //             source_transaction: charge_id,
        //             destination: supplier_stripe_account_id,
        //         })
        //         const transfer = await stripe.transfers.create({
        //             amount: Math.round(parseFloat(supplier_payable_amount * 100)),
        //             currency: currencyName,
        //             source_transaction: charge_id,
        //             destination: supplier_stripe_account_id,
        //         });
        //         const transfer = await Universal.transferAmountUsingTap( Math.round(parseFloat(supplier_payable_amount * 100)),
        //         "",supplier_tap_account_id,"amount split",tapSecretkey[0].value
        //         )
        //         if(transfer.id){
        //             await supplierPayablePayment(dbName, supplier_payable_amount, orderid, transfer.id, supplier_id)
        //         }
        //     }
        //     if (is_agent_tap_split_enabled=="1" && agent_tap_account_id!='' && agent_payable_amount != 0 && agent_payable_amount!=undefined) {

        //         console.log("00000000000000000000000000000000000000",{
        //             amount: Math.round(parseFloat(agent_payable_amount * 100)), //parseFloat(agent_payable_amount),
        //             currency: currencyName,
        //             source_transaction: charge_id,
        //             destination: agent_stripe_account_id,
        //         });
        //         const transfer =  await Universal.transferAmountUsingTap( Math.round(parseFloat(supplier_payable_amount * 100)),
        //         "",supplier_tap_account_id,"amount split",tapSecretkey[0].value
        //         )
        //         await agentPayablePayment(dbName, res, agent_payable_amount,orderid, agent_id)
        //     }
        //     cb(null)
        // }],
    },function(err,result){
        logger.debug('=====================1================')
         if(err) {
                console.log('err2-----',err);
                sendResponse.somethingWentWrongError(res);
        }
        else{
            logger.debug('=====================2================')
        callback(null,[]);
        }
    })

}


function supplierPayablePayment(dbName,totalAmount,order_Id, transfer_id, supplierId) {

    return new Promise((resolve,reject)=>{
        var date1 = moment().utcOffset(4);
        var date=date1._d

        async.auto({
            update: async function (cb) {
                var amount=parseInt(totalAmount);
                var orderId=parseInt(order_Id);

                var sqlUpdate="update orders set supplier_stripe_transfer_id=? where id=?";
                await multiConnection[dbName].query(sqlUpdate,[transfer_id,orderId])

                var sql = "update account_payable_order aro join account_payable ar on aro.account_payable_id = ar.id set " +
                    "aro.total_left = aro.total_left - "+amount+",aro.total_paid = aro.total_paid  + "+amount+",aro.status = 1," +
                    "ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.order_id = "+orderId;
                multiConnection[dbName].query(sql, async function (err, result) {
                    console.log(".....",err,result);
                    if (err) {
                        console.log('errr1----', err);
                        //sendResponse.somethingWentWrongError(res);
                        reject(err)
                    }
                    else {   
                        var sql ='insert into account_statement(supplier_id,order_id,transaction_date,debit)values(?,?,?,?)';
                        await multiConnection[dbName].query(sql,[supplierId,orderId,date,amount])
                        cb(null);
                    }
                });
                    
            }
        },function (err,result) {
            if(err){
                reject(err)
            }
            else {
                resolve(result)
            }
        });
        
                
        
                
                
    })        
    
}

function agentPayablePayment(dbName,res,totalAmount,order_Id, agentId) {

    return new Promise((resolve,reject)=>{

        async.auto({
            update: async function (cb) {
                let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                let agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
                
                var amount=parseFloat(totalAmount);
                var orderId=parseInt(order_Id);
                var user_id=parseInt(agentId);
                var transaction_mode = 1;

                var selSql="select tip_agent, waiting_charges, commission_ammount, agent_base_price, agent_delivery_charge_share, delivery_charges from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                var tip_agent = orderExistingDetails[0].tip_agent;
                var total_amount = amount;
                var total_paid = amount;
                var total_left = 0;
                var waiting_charges = orderExistingDetails[0].waiting_charges;
                var delivery_charges = orderExistingDetails[0].delivery_charges;
                var commission_ammount = orderExistingDetails[0].commission_ammount;
                var agent_base_price = orderExistingDetails[0].agent_base_price;
                var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                var status = 1;
                sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`,`agent_base_price`, `agent_delivery_charge_share`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"', '"+agent_base_price+"', '"+agent_delivery_charge_share+"')";

                await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                cb(null);
                    
            }
        },function (err,result) {
            if(err){
                reject(err)
            }
            else {
                resolve(result)
            }
        });
        
                
        
                
                
    })        
    
}

//const refund_stripe_payments = function (dbName, res,request, orderId) {
exports.refund_stripe_payments= function (dbName, res,request, orderId) {
    return new Promise(async (resolve,reject)=>{
        
        var sql = "select wallet_discount_amount,user_id,payment_type,transaction_id, card_payment_id as charge_id, supplier_stripe_transfer_id as transfer_id, payment_source, delivery_charges,supplier_commision,handling_admin,net_amount from orders where id=?";
        let result=await ExecuteQ.Query(dbName,sql,[orderId]);
        // let stmt = multiConnection[dbName].query(sql, [orderId], async function (err, result) {
        //     if(err){
        //         var msg = "something went wrong";
        //         sendResponse.sendErrorMessage(msg,res,500);
        //     }
console.log(result,"resultresult         8888888888888888*****************      !1111111111111")
            var supplier_refundable_amount, admin_refundable_amount

                
            let getAgentDbData=await common.GetAgentDbInformation(dbName);        
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  

            let agent_account_data=await ExecuteQ.QueryAgent(agentConnection,"select cu.stripe_account, cuo.supplier_id, cu.id as agent_id, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as agent_payable_amount from cbl_user_orders cuo join cbl_user cu on cuo.user_id=cu.id where cuo.order_id=? and cuo.user_id!='0' limit 1",[orderId]);

            
            var transaction_id = (result[0] && result[0].transaction_id) ? result[0].transaction_id : '';
            //var card_payment_id = (result[0] && result[0].card_payment_id)? result[0].card_payment_id:'';
            var charge_id = (result[0] && result[0].charge_id) ? result[0].charge_id : 0;
            var delivery_charges = (result[0] && result[0].delivery_charges) ? result[0].delivery_charges : 0;
            var handling_admin = (result[0] && result[0].handling_admin) ? result[0].handling_admin : 0;
            var supplier_commission = (result[0] && result[0].supplier_commision) ? result[0].supplier_commision : 0;
            var net_amount = (result[0] && result[0].net_amount) ? result[0].net_amount : 0;
            let wallet_discount_amount = result[0].wallet_discount_amount
            var is_admin_driver = (agent_account_data!=null && agent_account_data[0]!=undefined && agent_account_data[0].supplier_id!=undefined && agent_account_data[0].supplier_id!='0') ? '1' : '0';
            var agent_payable_amount = (agent_account_data!=null && agent_account_data[0]!=undefined && agent_account_data[0].agent_payable_amount!=undefined) ? agent_account_data[0].agent_payable_amount : 0  
            
            if(is_admin_driver=='0'){ //if driver is of admin
                admin_refundable_amount = handling_admin + supplier_commission + delivery_charges
                supplier_refundable_amount = net_amount - (admin_refundable_amount + agent_payable_amount)
            }else{ //if driver is of supplier
                admin_refundable_amount = handling_admin + supplier_commission
                supplier_refundable_amount = net_amount - (admin_refundable_amount + agent_payable_amount + delivery_charges)
            }

            // var refundableAmount = (parseFloat(admin_refundable_amount) + parseFloat(supplier_refundable_amount))-(parseFloat(wallet_discount_amount))
            var refundableAmount=net_amount;
            if(parseInt(result[0].payment_type)==4){
               resolve()
            }

            if(result[0] && result[0].payment_source=='stripe'){

                                 
                let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
                const stripe = require('stripe')(strip_secret_key_data[0].value);
                var transfer_id = (result[0] && result[0].transfer_id) ? result[0].transfer_id : 0;
                
                var supTransfer, adminRefund;
                if(transfer_id!='0'){
                    logger.debug("========transfer_id=>>")
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
            }else if(result[0] && result[0].payment_source=='paymaya'){

                let getPaymayaKeys = await getPayMayaKeys(req.dbName);

                let baseURL = "https://pg-sandbox.paymaya.com/payments/v1/payments/"+charge_id+"/refunds";
            
            
                var dataToSend = {
                    
                    
                        "totalAmount": {
                          "amount": refundableAmount,
                          "currency": "USD"
                        },
                        "reason": "Item out of stock"
                      
                      
                }
                var options = { 
                    method: 'POST',
                    url: baseURL,
                    headers: { 
                        Authorization: `Basic ${getPaymayaKeys.basic_auth_customer}`,
                        'Content-Type' : `application/json`
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
                                
                 
            }else{
                resolve();
            }
    })    
}


const addWalletTransactionRecordDuringOrderRejection = async (dbName,user_id,amount,card_payment_id,
    by_admin,added_deduct_through,is_add,user_wallet_share_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "insert into user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id) values(?,?,?,?,?,?,?)"
            let params = [user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id]
            await ExecuteQ.Query(dbName,query,params);
            let query1 = "update user set wallet_amount=wallet_amount+? where id=?";
            let params1 = [amount,user_id];
            await ExecuteQ.Query(dbName,query1,params1);
            resolve();
        }catch(err){
            logger.debug("========err======",err);
            reject(err);
        }
    })
}



exports.orderDescriptionV4= async function(dbName,order_ids) {
      
  
    return new Promise(async(resolve,reject)=>{
        try{
          var sql=`SELECT 
          o.delivery_charges,
          o.user_service_charge, 
          s.name,
          s.email,
          op.product_name as product,
          op.quantity,
           
          o.payment_source, 
          o.self_pickup, 
          o.card_payment_id as payment_id, 
          o.transaction_id as payment_reference_number, 
          o.id as id, 
          u.firstname, 
          o.promo_discount, 
          cr.id as cart_id, 
         
          op.product_id, 
          o.delivered_on, 
         o.net_amount, 
          o.handling_admin, 
          o.handling_supplier, 
          o.urgent_price, 
          aro.commission, 
          aro.total_amount , 
          1 as accountType  
        FROM 
          account_statement acs 
          join account_receivable_order aro on aro.order_id = acs.order_id 
          join orders o on o.id = acs.order_id 
          join order_prices op on op.order_id = o.id 
          join cart cr on cr.id = o.cart_id 
          join user u on u.id = o.user_id 
          left join supplier s on acs.supplier_id = s.id 
          left join supplier_branch_product sp on sp.product_id =op.product_id

        where 
          acs.supplier_id LIKE "%%" 
          AND DATE(acs.transaction_date) >= "1990-01-01" 
          AND DATE(acs.transaction_date) <= "2100-01-01" 
          AND o.id IN (${order_ids})  
        UNION ALL 
        SELECT 
        o.delivery_charges,
        o.user_service_charge, 
        s.name,
        s.email,
        op.product_name as product,
        op.quantity,
         
        o.payment_source, 
        o.self_pickup, 
        o.card_payment_id as payment_id, 
        o.transaction_id as payment_reference_number, 
        o.id as id, 
        u.firstname, 
        o.promo_discount, 
        cr.id as cart_id, 
       
        op.product_id, 
        o.delivered_on, 
       o.net_amount, 
        o.handling_admin, 
        o.handling_supplier, 
        o.urgent_price, 
        aro.commission, 
        aro.total_amount ,
          0 as accountType 
        FROM 
          account_statement acs 
          join account_payable_order aro on aro.order_id = acs.order_id 
          join orders o on o.id = acs.order_id 
          join order_prices op on op.order_id = o.id 
          join cart cr on cr.id = o.cart_id 
          join user u on u.id = o.user_id 
          left join supplier s on acs.supplier_id = s.id 
          left join supplier_branch_product sp on sp.product_id =op.product_id
        where 
          acs.supplier_id LIKE "%%" 
          AND DATE(acs.transaction_date) >= "1990-01-01" 
          AND DATE(acs.transaction_date) <= "2100-01-01" 
          AND o.id IN (${order_ids}) 
         
        order by 
        id desc
        `
          
            let result = await ExecuteQ.Query(dbName,sql,[]);
            resolve(result);
        }catch(err){
            logger.debug("========err=======",err);
            reject(err)
        }
    
    })
}


exports.statementEmailData= async function(dbName,order_ids, condition ='') {


    if(condition == "cash"){
        condition = " and o.payment_source = ''";
    }else{
        condition = "  group by date(delivered_on)";
    }
      
  
    return new Promise(async(resolve,reject)=>{
        try{
          var sql=`SELECT 
                 
          o.id as id, 
          count( DISTINCT o.id ) as count,
          sum(o.net_amount) as net_amount,
          sum(o.supplier_vat_value) as supplier_vat_value,
        sum(aro.commission) as commission,
        sum(o.delivery_charges) as delivery_charges,
        sum(o.user_service_charge) as user_service_charge,
        o.delivered_on,
        s.commission,
        s.vat_value,
       sum(aro.total_amount) as total_amount,
        1 as accountType  
      FROM 
        account_statement acs 
        join account_receivable_order aro on aro.order_id = acs.order_id 
        join orders o on o.id = acs.order_id 
       
        join cart cr on cr.id = o.cart_id 
        join user u on u.id = o.user_id 
        left join supplier s on acs.supplier_id = s.id 
        
      where 
        o.id IN (${order_ids}) ${condition}
     
      UNION ALL 
      SELECT 
            o.id as id, sum(o.net_amount) as net_amount,
            sum(o.supplier_vat_value) as supplier_vat_value,
            count( DISTINCT o.id ) as count,
        sum(aro.commission) as commission,
        sum(o.delivery_charges) as delivery_charges,
        sum(o.user_service_charge) as user_service_charge,
        s.commission,
         o.delivered_on,
         s.vat_value,
      sum(aro.total_amount) as total_amount,
        0 as accountType 
      FROM 
        account_statement acs 
        join account_payable_order aro on aro.order_id = acs.order_id 
        join orders o on o.id = acs.order_id 
        
        join cart cr on cr.id = o.cart_id 
        join user u on u.id = o.user_id 
        left join supplier s on acs.supplier_id = s.id 
        
      where 
        
        o.id IN (${order_ids}) 
         ${condition}    
        ` 
         let result = await ExecuteQ.Query(dbName,sql,[]);
            resolve(result);
        }catch(err){
            logger.debug("========err=======",err);
            reject(err)
        }
    
    })
}