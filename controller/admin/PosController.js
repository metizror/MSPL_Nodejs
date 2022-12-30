/**
 * ==========================================================================
 * created by Gagan
 * @description used for POS apis
 * ==========================================================================
 */
var async = require('async');
var constant=require('../../routes/constant')
var sendResponse = require('../../routes/sendResponse');
var confg=require('../../config/const');
var _ = require('underscore'); 
let ExecuteQ=require('../../lib/Execute');
let web_request=require('request');
const Universal = require('../../util/Universal')

var log4js=require("log4js")
var logger = log4js.getLogger();
var languageId = 14;
logger.level = 'debug';
var baseUrl = "https://api.flowhub.co/v0/";
var baseUrlV1 = "https://api.flowhub.co/v1/"




/**
 * @description used to get inventory
 * @param {*Object} req 
 * @param {*Object} res 
 */
const importInventory=async (req,res)=>{
    try{
        var categoryId = req.query.categoryId;
        var subCategoryId = req.query.subCategoryId ? req.query.subCategoryId : 0;
        var api_key = req.query.api_key ? req.query.api_key : '';
        var client_id = req.query.client_id ? req.query.client_id : '';
        var supplier_id = req.query.supplier_id ? req.query.supplier_id : '';
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = api_key!="" ? api_key : converge_key_data['pos_key']
        var pos_client_id = client_id!="" ? client_id : converge_key_data['pos_client_id']
        var sub_url = "inventory"
        if(subCategoryId!=0){
            categoryId = subCategoryId;
        }
        web_request({
            method: 'GET',
            url: baseUrl+sub_url,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            //console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                let userId=req.user.id;
                if(req.path=="/supplier/pos/importInventory"){
                    userId=supplier_id;
                }
                console.log("2222222222222222222222")
                for(var i=0;(i < data.data.length);i++){
                //for(var i=0;(i < 10);i++){
                    data.data[i].priceInMinorUnits = data.data[i].priceInMinorUnits/100
                    //console.log(" #################################### 33333333333333333333333",i, data[i], data.data[i])
                    var resData = await ExecuteQ.Query(req.dbName,"select count(id) cnt from product where category_id=? and sub_category_id=? and pos_product_id=?",[categoryId,subCategoryId,data.data[i].productId]);

                    if(resData[0].cnt == 0){
                        
                        var catData = await ExecuteQ.Query(req.dbName,"select id,count(id) cnt from categories where name=?",[data.data[i].category]);
                        if(catData[0].cnt == "0"){
                            let newCate = await ExecuteQ.Query(req.dbName, "insert into categories(`product_addition_level`,`category_order`,`services_at_home_price_applicable`,`chemical_tools_price_applicable`,`is_barcode`,`category_flow`,`approved_by`,`created_by`,`illustration`,`icon`,`image`,`product_placement_level`,`supplier_placement_level`,`order`,`new_order`,`name`,`description`,`tax`,`type`,`parent_id`) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            [0,
                                0,
                                0,
                                0,
                                0,
                                'Category>Suppliers>SupplierInfo>SubCategory>Pl',
                                userId,
                                userId,
                                "tes",
                                "https://",
                                "https://",
                                0,
                                0,
                                0,
                                0,
                                data.data[i].category,
                                data.data[i].category,
                                0,
                                0,
                                0
                            ]);
                            
                            await ExecuteQ.Query(req.dbName, `insert into categories_ml(language_id,name,description,category_id) values(?,?,?,?)`, [14, data.data[i].category, data.data[i].category, newCate.insertId]);
                            await ExecuteQ.Query(req.dbName, `insert into categories_ml(language_id,name,description,category_id) values(?,?,?,?)`, [15, data.data[i].category, data.data[i].category, newCate.insertId]);

                            categoryId = newCate.insertId;
                            subCategoryId = newCate.insertId;
                        }else{
                            categoryId = catData[0].id
                            subCategoryId = catData[0].id
                        }                        

                        if(req.path=="/supplier/pos/importInventory"){
                            var dd = await ExecuteQ.Query(req.dbName," select (SELECT id FROM `supplier_branch` WHERE supplier_id='"+userId+"') branch_id, count(id) cnt from supplier_category where supplier_id=? and `category_id`=?",[parseInt(userId),parseInt(categoryId)])
                            if(dd[0].cnt == 0){
                                await ExecuteQ.Query(req.dbName,"insert into supplier_category(`supplier_id`,`category_id`,`sub_category_id`,`detailed_sub_category_id`) values (?,?,?,?)",[parseInt(userId),parseInt(categoryId),0,0])
                            }
                        }

                        console.log("4144444444444444444444444444444444")
                        let inserProd=await ExecuteQ.Query(req.dbName,`insert into product(
                            pos_product_id,
                            name,
                            product_desc,
                            quantity,
                            category_id,
                            sub_category_id,
                            detailed_sub_category_id,
                            is_global,
                            is_live,
                            pricing_type,
                            bar_code,
                            measuring_unit,
                            sku,
                            commission_type,
                            commission,
                            commission_package,
                            recurring_possible,
                            scheduling_possible,
                            is_package,
                            is_deleted,
                            created_by,
                            approved_by_supplier,
                            approved_by_admin
                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[data.data[i].productId,data.data[i].productName,data.data[i].productDescription,data.data[i].quantity,categoryId,subCategoryId,0,1,1,0,"","",data.data[i].sku,0,0.0,0,0,0,0,0,userId,1,1]);
                            await ExecuteQ.Query(req.dbName,`insert into product_ml(product_id,name,language_id,product_desc,measuring_unit) values (?,?,?,?,?)`,[inserProd.insertId,data.data[i].productName,14,data.data[i].productDescription,'a']);
                            await ExecuteQ.Query(req.dbName,`insert into product_ml(product_id,name,language_id,product_desc,measuring_unit) values (?,?,?,?,?)`,[inserProd.insertId,data.data[i].productName,15,data.data[i].productDescription,'a']);
                            if(data.data[i].productPictureURL!="" && data.data[i].productPictureURL!=null)
                            await ExecuteQ.Query(req.dbName,`insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,[inserProd.insertId,data.data[i].productPictureURL,1,1]);
                            await ExecuteQ.Query(req.dbName,`insert into product_pricing(
                                product_id,
                                start_date,
                                end_date,
                                price,
                                handling,
                                handling_supplier,
                                can_urgent,
                                urgent_price,
                                delivery_charges,
                                urgent_type,
                                price_type,
                                display_price,
                                urgent_value,
                                pricing_type) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[inserProd.insertId,"2000-01-01 00:00:00","2099-01-01 00:00:00",data.data[i].priceInMinorUnits,0,0,0,0,0,0,0,data.data[i].priceInMinorUnits,0,0]);

                                if(req.path=="/supplier/pos/importInventory"){
                                    let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) values (?,?,?,?,?,?,?,?,?) ";
                                    await ExecuteQ.Query(req.dbName, branchProductSql, [dd[0].branch_id,inserProd.insertId,categoryId,subCategoryId,categoryId,0,0,0,0]);
                                }
                    }else{
                        console.log("55555555555555555555555555555555555")
                        await ExecuteQ.Query(req.dbName,"update product set name=?, product_desc=?, quantity=?, sku=? where  category_id=? and sub_category_id=? and pos_product_id=?",[data.data[i].productName,data.data[i].productDescription,data.data[i].quantity,data.data[i].sku,categoryId,subCategoryId,data.data[i].productId]);
                    }
                }
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get inventory
 * @param {*Object} req 
 * @param {*Object} res 
 */
const inventoryByLocation=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var locationId = req.query.locationId ? req.query.locationId : "";
        var sub_url = "locations/"+locationId+"/inventory"
        if(locationId==""){
            sub_url = "inventory"
        }
        web_request({
            method: 'GET',
            url: baseUrl+sub_url,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            //console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get inventory
 * @param {*Object} req 
 * @param {*Object} res 
 */
const inventoryNonZero=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var locationId = req.query.locationId ? req.query.locationId : "";
        var sub_url = "locations/"+locationId+"/inventoryNonZero"
        if(locationId==""){
            sub_url = "inventoryNonZero"
        }
        web_request({
            method: 'GET',
            url: baseUrl+sub_url,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            //console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to get inventory
 * @param {*Object} req 
 * @param {*Object} res 
 */
const inventoryAnalytics=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var locationId = req.query.locationId ? req.query.locationId : "";
        var sub_url = "locations/"+locationId+"/Analytics"
        if(locationId==""){
            sub_url = "inventoryAnalytics"
        }
        web_request({
            method: 'GET',
            url: baseUrl+sub_url,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get clients locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const clientsLocations=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var locationId = req.query.locationId ? req.query.locationId : "";
        var sub_url = "locations/"+locationId+"/clientsLocations"
        if(locationId==""){
            sub_url = "clientsLocations"
        }
        web_request({
            method: 'GET',
            url: baseUrl+sub_url,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const inventoryByRooms=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var locationId = req.query.locationId ? req.query.locationId : "";
        var sub_url = "locations/"+locationId+"/inventoryByRooms"
        if(locationId==""){
            sub_url = "inventoryByRooms"
        }
        web_request({
            method: 'GET',
            url: baseUrl+sub_url,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const inventoryByRoomsNonZero=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var locationId = req.query.locationId ? req.query.locationId : "";
        var sub_url = "locations/"+locationId+"/inventoryByRoomsNonZero"
        if(locationId==""){
            sub_url = "inventoryByRoomsNonZero"
        }
        web_request({
            method: 'GET',
            url: baseUrl+sub_url,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const inventoryAnalyticsByRooms=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var locationId = req.query.locationId ? req.query.locationId : "";
        var sub_url = "locations/"+locationId+"/AnalyticsByRooms"
        if(locationId==""){
            sub_url = "inventoryAnalyticsByRooms"
        }
        web_request({
            method: 'GET',
            url: baseUrl+sub_url,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}



/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const findCustomersByPhoneNumber=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var phone_number = req.query.phone_number;
        web_request({
            method: 'GET',
            url: baseUrlV1+"customers/findByPhoneNumber?phone_number="+phone_number,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const findCustomersById=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var customerId = req.query.customerId;
        web_request({
            method: 'GET',
            url: baseUrlV1+"customers/findByPhoneNumber?customer_id="+customerId,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const findCustomers=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var page = req.query.page ? req.query.page : 10;
        var page_size = req.query.page_size ? req.query.page_size : "asc";
        var queryStr = "?page="+page+"&page_size="+page_size
        var created_after = req.query.created_after ? req.query.created_after : "";
        
        var order_by = req.query.order_by ? req.query.order_by : "";
        var created_before = req.query.created_before ? req.query.created_before : "";
        if(created_after!=""){
            queryStr += "&created_after="+created_after
        }
        if(order_by!=""){
            queryStr += "&order_by="+order_by
        }
        if(created_before!=""){
            queryStr += "&created_before="+created_before
        }
        

        web_request({
            method: 'GET',
            url: baseUrlV1+"customers"+queryStr,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const findOrdersByCustomerId=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var customerId = req.query.customerId;
        var page = req.query.page ? req.query.page : 10;
        var page_size = req.query.page_size ? req.query.page_size : "asc";
        var queryStr = "?page="+page+"&page_size="+page_size
        var created_after = req.query.created_after ? req.query.created_after : "";
        
        var order_by = req.query.order_by ? req.query.order_by : "";
        var created_before = req.query.created_before ? req.query.created_before : "";
        if(created_after!=""){
            queryStr += "&created_after="+created_after
        }
        if(order_by!=""){
            queryStr += "&order_by="+order_by
        }
        if(created_before!=""){
            queryStr += "&created_before="+created_before
        }
        

        web_request({
            method: 'GET',
            url: baseUrlV1+"orders/findByCustomerId/"+customerId+"/"+queryStr,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const findOrdersByLocationId=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var importId = req.query.importId;
        var page = req.query.page ? req.query.page : 10;
        var page_size = req.query.page_size ? req.query.page_size : "asc";
        var queryStr = "?page="+page+"&page_size="+page_size
        var created_after = req.query.created_after ? req.query.created_after : "";
        
        var order_by = req.query.order_by ? req.query.order_by : "";
        var created_before = req.query.created_before ? req.query.created_before : "";
        if(created_after!=""){
            queryStr += "&created_after="+created_after
        }
        if(order_by!=""){
            queryStr += "&order_by="+order_by
        }
        if(created_before!=""){
            queryStr += "&created_before="+created_before
        }
        

        web_request({
            method: 'GET',
            url: baseUrlV1+"orders/findByLocationId/"+importId+"/"+queryStr,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


/**
 * @description used to get inventory by rooms and locations
 * @param {*Object} req 
 * @param {*Object} res 
 */
const findOrdersByPhoneNumber=async (req,res)=>{
    try{
        let converge_key_data=await Universal.getPOSKeys(req.dbName);
        var pos_key = converge_key_data['pos_key']
        var pos_client_id = converge_key_data['pos_client_id']
        var phone_number = req.query.phone_number;
        var page = req.query.page ? req.query.page : 10;
        var page_size = req.query.page_size ? req.query.page_size : "asc";
        var queryStr = "?page="+page+"&page_size="+page_size        
        var order_by = req.query.order_by ? req.query.order_by : "";
        if(phone_number!=""){
            queryStr += "&phone_number="+phone_number
        }
        if(order_by!=""){
            queryStr += "&order_by="+order_by
        }
        

        web_request({
            method: 'GET',
            url: baseUrlV1+"orders/findByPhoneNumber"+queryStr,
            headers:{ 'key': pos_key,'ClientId': pos_client_id },
        }, async function (error, response, body) {
            console.log(error,"==================================",body)
            if(error){ return sendResponse.sendErrorMessage("Error",res,400); }
            else{
                var data = (typeof body !== 'string') ? body : JSON.parse(body);
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        });
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}


 module.exports={
    importInventory:importInventory,
    inventoryByLocation:inventoryByLocation,
    inventoryNonZero:inventoryNonZero,
    inventoryAnalytics:inventoryAnalytics,
    clientsLocations:clientsLocations,
    inventoryByRooms:inventoryByRooms,
    inventoryByRoomsNonZero:inventoryByRoomsNonZero,
    inventoryAnalyticsByRooms:inventoryAnalyticsByRooms,
    findCustomersByPhoneNumber:findCustomersByPhoneNumber,
    findCustomersById:findCustomersById,
    findCustomers:findCustomers,
    findOrdersByCustomerId:findOrdersByCustomerId,
    findOrdersByLocationId:findOrdersByLocationId,
    findOrdersByPhoneNumber:findOrdersByPhoneNumber
 }