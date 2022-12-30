/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an dashboard related action from admin panel
 * ==========================================================================
 */
var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr=require('../../lib/UploadMgr')
var confg=require('../../config/const');
const Universal=require('../../util/Universal')
var _ = require('underscore'); 
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const common=require('../../common/agent');
let ExecuteQ=require('../../lib/Execute')
const AgentCommon = require('../../common/agent');
const { reject } = require('underscore');

var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD

/**
 * @desc used for adding an Delivery Company
 * @param {*Object} req 
 * @param {*Object} res 
 */
const addDeliveryCompnay = async (req,res)=>{
    try{
        let body = req.body
        let {
            name,email,address,latitude,
            longitude,iso
        } = body
        let password = md5("123456");
        let d = new Date();
        d = d.getTime()
        let access_token= await Universal.getEncryptData(email + d);
        let deviceToken=req.body.deviceToken || "";

        let image_url = body.image_url || ""
        let logo_url = body.logo_url || ""
        let phone_number = body.phone_number || ""
        let country_code = body.country_code || ""

        let first_name = body.first_name || ""
        let last_name = body.last_name || ""
        let license_number = body.license_number || ""
        let designation = body.designation || ""

        let letter_of_intent = body.letter_of_intent || ""
        let preferred_language = body.preferred_language || ""
        let coverage_cities = body.coverage_cities || ""
        let more_information = body.more_information || ""
        let license_image = body.license_image || ""

        let type_of_deliveries_offered = body.base_delivery_charges || 0
        let booking_type = body.booking_type !==undefined?body.booking_type:0

        let no_of_motorbike_controlled_temp = body.no_of_motorbike_controlled_temp !==undefined?body.no_of_motorbike_controlled_temp:0
        let no_of_motorbike_non_controlled_temp = body.no_of_motorbike_non_controlled_temp !==undefined?body.no_of_motorbike_non_controlled_temp:0
        let no_of_cars = body.no_of_cars !==undefined?body.no_of_cars:0
        let no_of_vans_controlled_temp = body.no_of_vans_controlled_temp !==undefined?body.no_of_vans_controlled_temp:0
        let no_of_vans_non_controlled_temp = body.no_of_vans_non_controlled_temp !==undefined?body.no_of_vans_non_controlled_temp:0

        let base_delivery_charges = body.base_delivery_charges !==undefined?body.base_delivery_charges:0
        let distance_value = body.distance_value!==undefined?body.distance_value:0
        let delivery_radius = body.delivery_radius !==undefined?body.delivery_radius:0
        let radius_price = body.radius_price !==undefined?body.radius_price:0


        await registerDeliveryCompany(
            name,email,address,latitude,
            longitude,delivery_radius,radius_price,
            image_url,logo_url,phone_number,country_code,
            base_delivery_charges,distance_value,1,
            req.dbName,password,deviceToken,access_token,iso,first_name,
            last_name,license_number,designation,letter_of_intent,preferred_language,
            coverage_cities,more_information,license_image,type_of_deliveries_offered,
            booking_type,no_of_motorbike_controlled_temp,no_of_motorbike_non_controlled_temp,
            no_of_cars,no_of_vans_controlled_temp,no_of_vans_non_controlled_temp


        )
        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @desc used for update an Delivery Company
 * @param {*Object} req 
 * @param {*Object} res 
 */
const updateDeliveryCompnay = async (req,res)=>{
    try{
        let body = req.body
        let {
            name,email,address,latitude,
            longitude,delivery_radius,radius_price,id,iso
        } = body
        radius_price = radius_price || 0
        
        delivery_radius = delivery_radius || 0
        let image_url = body.image_url || ""
        let logo_url = body.logo_url || ""
        let phone_number = body.phone_number || ""
        let country_code = body.country_code || ""
        let base_delivery_charges = body.base_delivery_charges || 0
        let distance_value = body.distance_value || 0

        let first_name = body.first_name || ""
        let last_name = body.last_name || ""
        let license_number = body.license_number || ""
        let designation = body.designation || ""

        let letter_of_intent = body.letter_of_intent || ""
        let preferred_language = body.preferred_language || ""
        let coverage_cities = body.coverage_cities || ""
        let more_information = body.more_information || ""
        let license_image = body.license_image || ""

        let type_of_deliveries_offered = body.base_delivery_charges || 0
        let booking_type = body.booking_type || 0


        let no_of_motorbike_controlled_temp = body.no_of_motorbike_controlled_temp !==undefined?body.no_of_motorbike_controlled_temp:0
        let no_of_motorbike_non_controlled_temp = body.no_of_motorbike_non_controlled_temp !==undefined?body.no_of_motorbike_non_controlled_temp:0
        let no_of_cars = body.no_of_cars !==undefined?body.no_of_cars:0
        let no_of_vans_controlled_temp = body.no_of_vans_controlled_temp !==undefined?body.no_of_vans_controlled_temp:0
        let no_of_vans_non_controlled_temp = body.no_of_vans_non_controlled_temp !==undefined?body.no_of_vans_non_controlled_temp:0


        await updateDeliveryCompany(
            name,email,address,latitude,
            longitude,delivery_radius,radius_price,
            image_url,logo_url,phone_number,country_code,
            base_delivery_charges,distance_value,0,
            req.dbName,id,
            first_name,
            last_name,
            license_number,
            designation,
            letter_of_intent,
            preferred_language,
            coverage_cities,
            more_information,
            license_image,
            type_of_deliveries_offered,
            booking_type,
            no_of_motorbike_controlled_temp,
            no_of_motorbike_non_controlled_temp,
            no_of_cars,
            no_of_vans_controlled_temp,
            no_of_vans_non_controlled_temp,iso
        )
        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const registerDeliveryCompany = function(name,email,address,latitude,
    longitude,delivery_radius,radius_price,
    image_url,logo_url,phone_number,country_code,
    base_delivery_charges,distance_value,status,
    dbName,password,deviceToken,access_token,iso,
    first_name,
    last_name,
    license_number,
    designation,
    letter_of_intent,
    preferred_language,
    coverage_cities,
    more_information,
    license_image,
    type_of_deliveries_offered,
    booking_type,
    no_of_motorbike_controlled_temp,
    no_of_motorbike_non_controlled_temp,
    no_of_cars,
    no_of_vans_controlled_temp,
    no_of_vans_non_controlled_temp){

    return new Promise(async(resolve,reject)=>{
      let query = `insert into delivery_companies (
            name,email,address,latitude,
            longitude,delivery_radius,radius_price,
            image_url,logo_url,phone_number,country_code,
            base_delivery_charges,distance_value,status,
            password,device_token,access_token,iso,first_name,
            last_name,license_number,designation,letter_of_intent,preferred_language,
            coverage_cities,more_information,license_image,type_of_deliveries_offered,
            booking_type,no_of_motorbike_controlled_temp,no_of_motorbike_non_controlled_temp,
            no_of_cars,no_of_vans_controlled_temp,no_of_vans_non_controlled_temp)
             values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      let params = [
        name,email,address,latitude,
        longitude,delivery_radius,radius_price,
        image_url,logo_url,phone_number,country_code,
        base_delivery_charges,distance_value,status,
        password,deviceToken,access_token,iso,first_name,
        last_name,license_number,designation,letter_of_intent,preferred_language,
        coverage_cities,more_information,license_image,type_of_deliveries_offered,
        booking_type,no_of_motorbike_controlled_temp,no_of_motorbike_non_controlled_temp,
        no_of_cars,no_of_vans_controlled_temp,no_of_vans_non_controlled_temp
      ]
      await ExecuteQ.Query(dbName,query,params);
      resolve();
    })
}

const updateDeliveryCompany = function(
    name,email,address,latitude,
    longitude,delivery_radius,radius_price,
    image_url,logo_url,phone_number,country_code,
    base_delivery_charges,distance_value,status,
    dbName,id,    first_name,
    last_name,
    license_number,
    designation,
    letter_of_intent,
    preferred_language,
    coverage_cities,
    more_information,
    license_image,
    type_of_deliveries_offered,
    booking_type,
    no_of_motorbike_controlled_temp,
    no_of_motorbike_non_controlled_temp,
    no_of_cars,
    no_of_vans_controlled_temp,
    no_of_vans_non_controlled_temp,iso){
    var category = [];
    return new Promise(async(resolve,reject)=>{
      let query = `update delivery_companies set
            name=?,email=?,address=?,latitude=?,
            longitude=?,delivery_radius=?,radius_price=?,
            image_url=?,logo_url=?,phone_number=?,
            country_code=?,
            base_delivery_charges=?,distance_value=?,status=?,    first_name=?,
            last_name=?,
            license_number=?,
            designation=?,
            letter_of_intent=?,
            preferred_language=?,
            coverage_cities=?,
            more_information=?,
            license_image=?,
            type_of_deliveries_offered=?,
            booking_type=?,
            no_of_motorbike_controlled_temp=?,
            no_of_motorbike_non_controlled_temp=?,
            no_of_cars=?,
            no_of_vans_controlled_temp=?,
            no_of_vans_non_controlled_temp=?,iso=?
            where id=?
            `;
      let params = [
        name,email,address,latitude,
        longitude,delivery_radius,radius_price,
        image_url,logo_url,phone_number,country_code,
        base_delivery_charges,distance_value,status,    first_name,
        last_name,
        license_number,
        designation,
        letter_of_intent,
        preferred_language,
        coverage_cities,
        more_information,
        license_image,
        type_of_deliveries_offered,
        booking_type,
        no_of_motorbike_controlled_temp,
        no_of_motorbike_non_controlled_temp,
        no_of_cars,
        no_of_vans_controlled_temp,
        no_of_vans_non_controlled_temp,iso,id
      ]
      await ExecuteQ.Query(dbName,query,params);
      resolve();
    })
}



/**
 * @desc used for listing  Delivery Companies
 * @param {*Object} req 
 * @param {*Object} res 
 */
const listDeliveryCompnanies = async (req,res)=>{
    try{
        let q = req.query
        let {limit,skip,supplier_id,search} = q
        search = search !==undefined?search:""
        supplier_id = supplier_id !==undefined?supplier_id:0

        let query = `SELECT delivery_companies.*,
        IF((select count(id) from supplier_assigned_delivery_companies sadc
        where sadc.supplier_id=${supplier_id} and
        sadc.delivery_company_id=delivery_companies.id limit 1)>0,1,0)
        as is_assigned
        FROM delivery_companies where
         delivery_companies.name like '%${search}%' or
         delivery_companies.first_name like '%${search}%' or
         delivery_companies.last_name like '%${search}%'
         limit ?,?`
        
        let result = await ExecuteQ.Query(req.dbName,query,[skip,limit]);

        let query1 = `select id from delivery_companies`
        
        let result1 = await ExecuteQ.Query(req.dbName,query1,[]);
        
        

        let dataToSend = {
            list : result,
            count : result1 && result1.length>0?result1.length:0
        }

        sendResponse.sendSuccessData(dataToSend,constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @desc used for block/unblock  Delivery Companies
 * @param {*Object} req 
 * @param {*Object} res 
 */
const blockUnblockDeliveryCompnanies = async (req,res)=>{
    try{
        let body = req.body
        let {id,is_block} = body

        let query = `update delivery_companies set is_block=? where id=?`
        
        await ExecuteQ.Query(req.dbName,query,[is_block,id]);

       
        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @desc used for block/unblock  Delivery Companies
 * @param {*Object} req 
 * @param {*Object} res 
 */
const verifyDeliveryCompnanies = async (req,res)=>{
    try{
        let body = req.body
        let {id,is_verified} = body

        let query = `update delivery_companies set is_verified=? where id=?`
        
        await ExecuteQ.Query(req.dbName,query,[is_verified,id]);

       
        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}


const assignDeliveryCompanyToSuppliers = async (req, res) => {
    try {
        let body = req.body
        let { supplierDeliveryCompanyIds } = body

        await assignDeliveryCompany(supplierDeliveryCompanyIds,req.dbName);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

    }
    catch (Err) {
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const assignDeliveryCompany = async (supplierDeliveryCompanyIds,dbName) => {
    return new Promise(async(resolve, reject) => {
        try {
            let deleteQuery = "delete from supplier_assigned_delivery_companies where supplier_id=?"
            await ExecuteQ.Query(dbName,deleteQuery,[supplierDeliveryCompanyIds[0].supplier_id]);

            for (const [index, i] of supplierDeliveryCompanyIds.entries()) {
                let checkQuery = `select id from supplier_assigned_delivery_companies
                where supplier_id=? and delivery_company_id=?`
                let result = await ExecuteQ.Query(dbName, checkQuery,
                    [i.supplier_id, i.delivery_company_id]);


                if (!(result && result.length)) {
                    let query = `insert into supplier_assigned_delivery_companies
            (supplier_id,delivery_company_id) values(?,?)`

                    await ExecuteQ.Query(dbName, query,
                        [i.supplier_id, i.delivery_company_id]);
                }

                if (index == supplierDeliveryCompanyIds.length - 1) {
                    resolve();
                }
            }
        }
        catch (Err) {
            logger.error("===verifyDeliveryCompnanies====err================", Err);
            reject(Err);
        }
    })
}


/**
 * @des New login api for delivery company login
 * @param {*Object} req 
 * @param {*Object} res 
 */
const deliveryCompanyLogin=async (req,res)=>{
    try{
        let email=req.body.email;
        let password=req.body.password;

        let deviceToken=req.body.fcm_token || "";

        let client_ip = req.connection.remoteAddress;

        var ip_array = client_ip.split(":");

        var ip = ip_array[ip_array.length - 1];

        let date = new Date();
        let date1 = date.toISOString().split("T");

        let today_date = date1[0],response_data = {};

        let deliveryCompanyData = await ExecuteQ.Query(req.dbName,
            "select `name`,`id`,`is_block`,`email`,`password`,`device_token`,`is_verified` from delivery_companies where `email`=?",[email]);

        if(deliveryCompanyData && deliveryCompanyData.length>0){

            let encrypted_password = md5(password);

            if(encrypted_password==deliveryCompanyData[0].password){
                // logger.debug("=====email+new DATE()=======",email+new Date());
                let d = new Date();
                d = d.getTime()

                let access_token= await Universal.getEncryptData(email + d);

                logger.debug("=======accesstoken=======",access_token)

                await ExecuteQ.Query(req.dbName,"update delivery_companies set access_token=?,device_token=? where id=?",[access_token,deviceToken,deliveryCompanyData[0].id]);


                    response_data = {
                        "access_token": access_token,
                        "delivery_company_id": deliveryCompanyData[0].id,
                        "delivery_company_email": email,
                        "name":deliveryCompanyData[0].name
                    }
                


                sendResponse.sendSuccessData(response_data, constant.responseMessage.LOGGED_IN, res, constant.responseStatus.SUCCESS);  
            }
            else{
                sendResponse.sendSuccessData(response_data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
            }
        }

        else{
            response_data = {}
            sendResponse.sendSuccessData(response_data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
        }
    
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}  


/**
 * @des New login api for delivery company login
 * @param {*Object} req 
 * @param {*Object} res 
 */
const dashboard = async (req,res)=>{
    try{
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let delivery_company_id = req.body.delivery_company_id;

        // getDeliveryCompanyActiveOrders(req.dbName,delivery_company_id)
        // getDeliveryCompanyPendingOrders(req.dbName,delivery_company_id)
        // getDeliveryCompanyDeliveredOrders(req.dbName,delivery_company_id)
        // getDeliveryCompanyCustomerCancelledOrders(req.dbName,delivery_company_id)
        let ordersCount = await get_orders_count(req.dbName,delivery_company_id);

        let response_data = {
            pending_order_count : ordersCount[0].pending_order_count,
            active_order_count : ordersCount[0].active_order_count,
            completed_order_count : ordersCount[0].completed_order_count,
            cancel_order_count : ordersCount[0].cancel_order_count
        }
        sendResponse.sendSuccessData(response_data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
            
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}  


const get_orders_count = (db_name,delivery_company_id)=>{
    return new Promise((resolve,reject)=>{
        var sqlQuery = "select count(IF(status=0,1,NULL))  as pending_order_count, ";
        sqlQuery += "count(IF(status=1 or status=9 or status=3 or status=7 or status=11 or status=10,1,NULL)) as active_order_count, ";
        sqlQuery += "count(IF(status=5,1,NULL)) as completed_order_count, ";
        sqlQuery += "count(IF(status=8,1,NULL)) as cancel_order_count from orders where delivery_company_id=? " 
        
        var st = multiConnection[db_name].query(sqlQuery,[delivery_company_id],(err,data)=>{
            logger.debug(st.sql,err)
            if(err){
                reject("Something Went Wrong")
            }else{
                logger.debug("======data???=======",data)
                resolve(data)
            }
        })
    })
}

/**
 * @des New login api for delivery company login
 * @param {*Object} req 
 * @param {*Object} res 
 */
const deliveryCompanyProfile = async (req,res)=>{
    try{
        let delivery_company_id = req.query.delivery_company_id;


        let query = "select * from delivery_companies where id = ?";
        let result = await ExecuteQ.Query(req.dbName,query,[delivery_company_id])

        sendResponse.sendSuccessData(result[0], constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
            
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}  

module.exports={
    addDeliveryCompnay:addDeliveryCompnay,
    listDeliveryCompnanies:listDeliveryCompnanies,
    updateDeliveryCompnay:updateDeliveryCompnay,
    blockUnblockDeliveryCompnanies:blockUnblockDeliveryCompnanies,
    verifyDeliveryCompnanies:verifyDeliveryCompnanies,
    assignDeliveryCompanyToSuppliers:assignDeliveryCompanyToSuppliers,
    deliveryCompanyLogin:deliveryCompanyLogin,
    dashboard:dashboard,
    deliveryCompanyProfile:deliveryCompanyProfile
}