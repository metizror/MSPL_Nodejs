/**
 * ==============================================================================
 * created by cbl-147
 * @description used for performing an supplier related action from admin
 * ===============================================================================
 */
const randomstring = require('randomstring');
let web_request=require('request');
var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr=require('../../lib/UploadMgr')
var confg=require('../../config/const');
var _ = require('underscore'); 
const moment = require('moment');
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
// const moment = require('moment')
const model=require('../../Model/')
const ExecuteQ=require('../../lib/Execute')
const queryModel=require('../../Model')
let emailTemp=require('../../routes/email')
var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD
const common=require('../../common/agent');
const Universal = require('../../util/Universal');
/**
 * @desc used for adding an brand in category
 * @param {*Object} req 
 * @param {*Object} res 
 */
const AssignCatToSupplr=async (req,res)=>{
    try{             
        var data=
        sendResponse.sendSuccessData(p_data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){   
        sendResponse.somethingWentWrongError(res);
    }
}

const makeQueryStringForSupplierRegisterApi=(categoryIds, supplierInsertId)=>{

    console.log("dfjdfjdbfjdf",JSON.parse(categoryJSON),id);
    categoryJSON = JSON.parse(categoryJSON);

    console.log("length",categoryJSON)
    var values = [];
    var insertLength = "(?,?,?,?),";
    var querystring = '';
    // if(categoryJSON.length>1){
    for(const i of categoryJSON.length)
    {
        (function(i)
        {
            var categoryId = categoryJSON[i].id;
            var subCategoryData = categoryJSON[i].data;
            var subCategoryLength = subCategoryData.length;
            console.log("==subCategoryLength==subCategoryData=",subCategoryLength,subCategoryData)
            if(subCategoryLength && subCategoryLength.length>0)
            {
                for(var j = 0 ; j < subCategoryLength;j++)
            {
                (function(j)
                {
                    var subCategoryId = subCategoryData[j].id;
                    var detailedSubCategoryData = subCategoryData[j].data;
                    var detailedSubCategoryLength = detailedSubCategoryData .length;
                    console.log("==detailedSubCategoryLength=detailedSubCategoryData=",detailedSubCategoryLength,detailedSubCategoryData)
                    if(detailedSubCategoryLength>0){
                    for(var k = 0 ; k < detailedSubCategoryLength ; k++)
                    {
                        (function(k)
                        {
                            var detailedSubCategoryId = detailedSubCategoryData[k].id;
                            values.push(id,categoryId,subCategoryId,detailedSubCategoryId);
                            querystring += insertLength;
                            console.log("value",values)
                            if(i == categoryJSON.length - 1 && j == subCategoryLength - 1 && k == detailedSubCategoryLength - 1)
                            {
                                querystring = querystring.substring(0, querystring.length - 1);
                                console.log("dfsdfdjfdfdfdf")
                                callback(null, values, querystring);
                            }

                        }(k))
                    }}
                    else{
                        querystring += insertLength;
                        if(i == categoryJSON.length - 1 && j == subCategoryLength - 1){
                             values.push(id,categoryId,subCategoryId,subCategoryId);
                             querystring = querystring.substring(0, querystring.length - 1);
                             callback(null, values, querystring);
                        }
                    }

                }(j))

            }
        }
        else{
            querystring += insertLength;
            if(i == categoryJSON.length - 1){
                values.push(id,categoryId,categoryId,categoryId);
                querystring = querystring.substring(0, querystring.length - 1);
                console.log("===DF=Values===",values,querystring)
                callback(null, values, querystring);
           }
            // values.push(id,categoryId,categoryId,categoryId);
        }

        }(i))

    }
}

/**
 * @desc used for listing of suppliers
 */
const listSuppliers = async (req,res)=>{
    let finalResponse = {};

    try{
        logger.debug("=============1===========",req.query)
        let limit = req.query.limit
        let offset = req.query.offset
        let order_by = parseInt(req.query.order_by);
        let is_desc = parseInt(req.query.is_desc);
        let is_active = parseInt(req.query.is_active)
        let search = req.query.search
        let country_code = req.query.country_code ? req.query.country_code : ''
        let country_code_type = req.query.country_code_type ? req.query.country_code_type : ''
        let languageId=req.query.language_id || 15;

        let is_out_network = req.query.is_out_network!==undefined?req.query.is_out_network:0
        let is_stripe_connected = req.query.is_stripe_connected!=undefined?req.query.is_stripe_connected:0
       
        let sequence_wise = req.query.sequence_wise!==undefined && req.query.sequence_wise!==null
        && req.query.sequence_wise!==null && req.query.sequence_wise!==0?req.query.sequence_wise:0





        let getTotalSupplier = await getTotalRegisterSuppliers(req.dbName,res,limit,
            offset,order_by,is_desc,
            is_active,search,country_code,
            country_code_type,is_out_network,is_stripe_connected,sequence_wise);


        let getRegisterSupplier = await  getRegisterSuppliers(req.dbName,res,limit,
            offset,order_by,is_desc,is_active,search,
            country_code,country_code_type,is_out_network,
            is_stripe_connected,sequence_wise,languageId);
       
        let CategoryData = await getRegSupplierCategoryData(req.dbName)
        
        let result = {
            supplier : getRegisterSupplier,
            category : CategoryData
        }


        let final = await clubDataForRegSupplier(res,result, req.dbName);
        // let final = getRegisterSupplier;
        console.log("==========final final final=====",final);
        finalResponse.count = getTotalSupplier
        finalResponse.suppliersList = final

        let query = "select id from supplier where is_scheduled=1";
        let scheduleData = await ExecuteQ.Query(req.dbName,query,[])
        if(scheduleData && scheduleData.length>0){
            finalResponse.is_suppliers_schedule = 1;
        }else{
            finalResponse.is_suppliers_schedule = 0;
        }
        logger.debug("=====final res=========",finalResponse)
        
        sendResponse.sendSuccessData(finalResponse, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
   

    }catch(err){
        logger.debug("=======ere in list suppliers==========",err)
        sendResponse.somethingWentWrongError(res)
    }
}
/**
 * @desc used for listing an suppliers without pagination
 */
const listAllSuppliers = async (req,res)=>{
    try{
        let finalResponse={
            "suppliersList":[]
        };
        let supplierData=await queryModel.supplierModel.supplierListWithoutPagination(["email","id","name","vat_value"],req.dbName,[]);
        finalResponse.suppliersList = supplierData;
        sendResponse.sendSuccessData(finalResponse, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    }catch(err){
        logger.debug("=======listAllSuppliers==========",err)
        sendResponse.somethingWentWrongError(res)
    }
}
//async function getRegisterSuppliers(dbName,res,limit,offset,order_by,is_desc,is_active,search){
async function getRegisterSuppliers(dbName,res,limit,
    offset,order_by,is_desc,is_active,search,
    country_code,country_code_type,is_out_network,
    is_stripe_connected,sequence_wise,languageId){
    logger.debug("==========================1213-=====")

    let order_by_query = "order by s.id desc";
    if(parseInt(sequence_wise)==1){
        order_by_query = " order by sequence_no desc "
    }
    


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
    let is_out_network_check = "";
    if(parseInt(is_out_network)>0){
        is_out_network_check=" and s.is_out_network=1 "
    }


    return new Promise(async(resolve,reject)=>{
        try{
            let limitSql="";
            if(parseInt(limit)!=0){
                limitSql="limit "+limit+" offset "+offset+""
            }

            let stripeFilterCheck = "";
            if(parseInt(is_stripe_connected)>0){
                if(parseInt(is_stripe_connected)==1){
               
                    stripeFilterCheck = " and stripe_account!='' "
                }else if(parseInt(is_stripe_connected)==2){
                    stripeFilterCheck = " and stripe_account='' "
           
                } 
           
            }
            var day = moment().isoWeekday();
            day=day-1; var day = moment().isoWeekday();
            day=day-1;

            let isHidePrivateData = await ExecuteQ.Query(dbName,
                "select `key`,`value` from tbl_setting where `key`=? and `value`=?",
                ["hide_private_data","1"]);
    

            let query;
            if(isHidePrivateData && isHidePrivateData.length > 0){

                query = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=s.user_created_id or send_to=s.user_created_id) and (`send_to_type`='SUPPLIER' or `send_by_type`='SUPPLIER') order by c_id desc limit 1) as message_id,s.user_created_id, sb.id as default_branch_id,s.is_sponser as is_multibranch, s.country_code,s.gst_price,s.iso,s.self_pickup,concat(SUBSTRING(sml.name,1,1),'**********') as name, s.id,concat(SUBSTRING(s.email,1,1),'**********') as email,s.description,sml.address,"+
            " s.stripe_account,IF(EXISTS(select id from supplier_timings st where st.is_open = 1 and st.supplier_id=s.id and st.week_id = "+day+") , 1, 0) as timing_availablity,s.federal_number,s.user_service_charge,concat(SUBSTRING(s.mobile_number_1,1,1),'**********') as mobile_number_1, s.speciality,s.nationality,s.facebook_link,s.linkedin_link,s.brand,s.speciality,s.description,s.is_active,s.pricing_level,s.commission,s.pickup_commission from supplier s join supplier_ml sml on sml.supplier_id = s.id join supplier_branch sb on sb.supplier_id = s.id   where s.is_active=? "+stripeFilterCheck+" "+is_out_network_check+"  "+country_code_query+" and sml.language_id="+languageId+" and sb.is_head_branch=1 and (sml.name like '%"+search+"%' or s.email like '%"+search+"%') "+order_by_query+" "+limitSql+"  ";

            }else{
                query = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=s.user_created_id or send_to=s.user_created_id) and (`send_to_type`='SUPPLIER' or `send_by_type`='SUPPLIER') order by c_id desc limit 1) as message_id,s.user_created_id, sb.id as default_branch_id,s.is_sponser as is_multibranch, s.country_code,s.gst_price,s.iso,s.self_pickup,sml.name,s.id,s.email,s.description,sml.address,"+
            " s.stripe_account,IF(EXISTS(select id from supplier_timings st where st.is_open = 1 and st.supplier_id=s.id and st.week_id = "+day+") , 1, 0) as timing_availablity,s.federal_number,s.user_service_charge,s.mobile_number_1,s.speciality,s.nationality,s.facebook_link,s.linkedin_link,s.brand,s.speciality,s.description,s.is_active,s.pricing_level,s.commission,s.pickup_commission from supplier s join supplier_ml sml on sml.supplier_id = s.id join supplier_branch sb on sb.supplier_id = s.id   where s.is_active=? "+stripeFilterCheck+" "+is_out_network_check+"  "+country_code_query+" and sml.language_id="+languageId+" and sb.is_head_branch=1 and (sml.name like '%"+search+"%' or s.email like '%"+search+"%') "+order_by_query+" "+limitSql+"  ";
            }
            
            let params = [is_active]
            let suppliers = await ExecuteQ.Query(dbName,query,params);
            
             logger.debug("==============suppliers========",suppliers)
            let finalResult = await getOrdersRevenue(dbName,suppliers,res)
            // logger.debug("=======finalResult-============",finalResult);

            if(parseInt(sequence_wise)!==1){
                if (order_by == 1) {
                    if (is_desc && is_desc > 0) {
                        finalResult = _.sortBy(finalResult,'commission').reverse()
                    } else {
                        finalResult = _.sortBy(finalResult,'commission')
                    }
                } else if (order_by == 2) {
                    if (is_desc && is_desc > 0) {
                        finalResult = _.sortBy(finalResult,'total_revenue').reverse()
                    } else {
                        finalResult = _.sortBy(finalResult,'total_revenue')
                    }
                } else {
                    finalResult = _.sortBy(finalResult,'id').reverse();
                }
            }

      
            
            resolve(finalResult)
        }catch(err){

            reject(err);
        }
    })
}


async function getTotalRegisterSuppliers(dbName,res,limit,offset,
    order_by,is_desc,is_active,search,country_code,
    country_code_type,is_out_network,is_stripe_connected,sequence_wise){
    let stripeFilterCheck = "";
    if(parseInt(is_stripe_connected)>0){
        if(parseInt(is_stripe_connected)==1){
       
            stripeFilterCheck = " and stripe_account!='' "
        }else if(parseInt(is_stripe_connected)==2){
            stripeFilterCheck = " and stripe_account='' "
   
        } 
   
    }
    let order_by_query = "";
    if(parseInt(sequence_wise)==1){
        order_by_query = " order by sequence_no desc "
    }





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

    let is_out_network_check = "";
    if(parseInt(is_out_network)>0){
        is_out_network_check=" and s.is_out_network=1 "
    }


    return new Promise(async(resolve,reject)=>{
        try{
            let limitSql="";
            let query = "select (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=s.user_created_id or send_to=s.user_created_id) and (`send_to_type`='SUPPLIER' or `send_by_type`='SUPPLIER') order by c_id desc limit 1) as message_id,s.user_created_id, sb.id as default_branch_id,s.is_sponser as is_multibranch, s.country_code,s.gst_price,s.iso,s.self_pickup,s.name,s.id,s.email,sml.address,"+
            " s.federal_number,s.user_service_charge,s.mobile_number_1,s.speciality,s.nationality,s.facebook_link,s.linkedin_link,s.brand,s.speciality,s.description,s.is_active,s.pricing_level,s.commission,s.pickup_commission from supplier s join supplier_ml sml on sml.supplier_id = s.id join supplier_branch sb on sb.supplier_id = s.id where s.is_active=? "+stripeFilterCheck+" "+is_out_network_check+"  "+country_code_query+" and sml.language_id=14 and sb.is_head_branch=1 and (s.name like '%"+search+"%' or s.email like '%"+search+"%') "+order_by_query+"  "+limitSql+"  ";
            let params = [is_active]
            let suppliers = await ExecuteQ.Query(dbName,query,params)
            // logger.debug("==============suppliers========",suppliers)
            let finalResult = await getOrdersRevenue(dbName,suppliers,res)

           
            // logger.debug("=======finalResult-============",finalResult);
            resolve(finalResult.length)
        }catch(err){
            resolve(0)
        }
    })
}

async function getOrdersRevenue(db_name,suppliers_data,res){

    return new Promise(async(resolve,reject)=>{
        var sql1 = "select id from supplier_branch where supplier_id = ? "
        var sql2 = "SELECT IFNULL(SUM(supplier_commision),0) as total_revenue from orders where supplier_branch_id = ? and status = 5 "
        let response_array = [],supplierProfitData,supplier_records=[],json_data={},agentConnection={};
        let isAdminDeliveryCharges=await ExecuteQ.Query(db_name,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["is_delivery_charge_to_admin","1"]);
        
        try{
        //    logger.debug("======SuplData======",suppliers_data); 
            if(suppliers_data && suppliers_data.length){
                for(const [index,i] of suppliers_data.entries()){
                    let total=0,commision_given_to_admin=0,order_ids=[];
                    let get_branch = await ExecuteQ.Query(db_name,sql1,[i.id])
                    
                    // logger.debug("=======>>",get_branch)
         
                    for(const [index1,j] of get_branch.entries()){

                        supplierProfitData=await supplierProfitAfterTaxCommission(db_name,j.id);
                        logger.debug("=supplierProfitData=",supplierProfitData)
                        total=total+supplierProfitData.total_supplier_profit;
                        order_ids=order_ids.concat(supplierProfitData.order_ids);
                     
                        // total = total + get_revenue[0].total_revenue
                    }
                    // logger.debug("=======final_order_ids==",order_ids)
                    if(order_ids && order_ids.length>0){
                        logger.debug("===AGENT==CON==")
                        let is_agent_of_supplier=0;
                        let getAgentDbData=await common.GetAgentDbInformation(db_name);        
                        // logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length)
                        if(Object.entries(agentConnection).length===0){
                            agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                        }
                        let agent_order_data=await ExecuteQ.QueryAgent(agentConnection,
                            "select IFNULL(sum(co.commission_ammount),0) AS agentRevenue  from cbl_user_orders co join cbl_user cu on cu.id=co.user_id where co.order_id IN(?) and cu.supplier_id=?",
                            [order_ids,0]);
                        logger.debug("======AGEN=ORDER==DATA!==",agent_order_data);
                        commision_given_to_admin=agent_order_data[0].agentRevenue;
                    }
                    
                    commision_given_to_admin=isAdminDeliveryCharges && isAdminDeliveryCharges.length>0?0:commision_given_to_admin
                    logger.debug("===befor=====>>",total,commision_given_to_admin);
                    total=total-commision_given_to_admin;
                    
                    logger.debug("========>>",total,commision_given_to_admin);




                    json_data.self_pickup=i.self_pickup
                    json_data.supplier_name=i.name
                    json_data.id=i.id
                    json_data.supplier_email=i.email
                    json_data.description=i.description
                    json_data.address=i.address
                    json_data.primary_mobile=i.mobile_number_1
                    json_data.is_active=i.is_active
                    json_data.pricing_level=i.pricing_level
                    json_data.commission=i.commission
                    json_data.pickup_commission=i.pickup_commission
                    json_data.total_revenue=total || 0
                    json_data.is_multibranch = i.is_multibranch
                    json_data.default_branch_id = i.default_branch_id;
                   
                    json_data.message_id = i.message_id
                    json_data.user_created_id = i.user_created_id
                    json_data.federal_number = i.federal_number
                    json_data.user_service_charge = i.user_service_charge
                    json_data.stripe_account = i.stripe_account
                    json_data.timing_availablity=i.timing_availablity
                    supplier_records.push(json_data)
                    
                    json_data={}
                }
                resolve(supplier_records)
            }
            else{
                resolve([])
            }
            // logger.debug("-------response_array---------------",response_array)
        }catch(err){
            logger.debug(err)
            reject(err)
        }      
    })
}


const supplierProfitAfterTaxCommission=(dbName,supplierBranchId)=>{

    return new Promise(async (resolve,reject)=>{
        logger.debug("============ENTEr")
        try{
        let order_ids=[],total_supplier_profit=0;
        let sql ="SELECT `id`,`handling_admin`,`handling_supplier`,`delivery_charges`,`net_amount`,`promo_discount`,`supplier_commision` from orders where supplier_branch_id = ? and status >= 5 "
        let orderData= await ExecuteQ.Query(dbName,sql,[supplierBranchId])
        let orderIds=[]
        // let isAdminDeliveryCharges=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["is_delivery_charge_to_admin","1"]);
        let deliveryCharge=0;
            if(orderData && orderData.length>0){
                for(const [index3,k] of orderData.entries())
                {
                    orderIds.push(k.id)
                    if(index3==(orderData.length-1)){
                        let onlineData=await ExecuteQ.Query(dbName,'select IFNULL(SUM(DISTINCT (total_amount)),0) as total_amount from account_payable_order where order_id IN(?)',[orderIds]);
                    let offlineData=await ExecuteQ.Query(dbName,'select IFNULL(SUM(DISTINCT (total_amount)),0) as total_amount from account_receivable_order where order_id IN (?)',[orderIds]);

                    let onlineAmount=onlineData && onlineData.length>0?parseFloat(onlineData[0].total_amount):0

                    let offlineAmount=offlineData && offlineData.length>0?parseFloat(offlineData[0].total_amount):0;
                    total_supplier_profit=total_supplier_profit+onlineAmount+offlineAmount;
                    }

                    // total_supplier_profit=total_supplier_profit+
                    // deliveryCharge=isAdminDeliveryCharges && isAdminDeliveryCharges.length>0?k.delivery_charges:0;
                    // total_supplier_profit=total_supplier_profit+(parseFloat(k.net_amount)-(parseFloat(k.handling_admin)+parseFloat(k.supplier_commision)+parseFloat(deliveryCharge)+parseFloat(k.promo_discount)))
                    // order_ids.push(k.id)
                }
                resolve({total_supplier_profit:total_supplier_profit,order_ids:order_ids})
            }
            else{

                resolve({total_supplier_profit:total_supplier_profit,order_ids:order_ids})

            }

        }
        catch(Err){
            logger.debug("=========Err>>",Err)
                reject(Err)

        }

    })
}


async function getRegSupplierCategoryData(dbName) {
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select d.supplier_id,d.category_id,d.sub_category_id,d.detailed_sub_category_id,c.type,c.name category_name,";
            query += " sc.name sub_cat_name, dsc.name detailed_sub_cat_name from  supplier_category d left join categories c on ";
            query += " d.category_id = c.id  left join categories sc on d.sub_category_id = sc.id left join categories dsc ";
            query += " on d.detailed_sub_category_id = dsc.id group by d.category_id, d.supplier_id order by d.supplier_id,d.category_id,d.sub_category_id,d.detailed_sub_category_id";
            let params = []
            let data = await ExecuteQ.Query(dbName,query,params)
            logger.debug("===data==categoryissue",data)

            resolve(data)
        }catch(err){
            logger.debug("===getRegSupplierCategoryData===errr====",err)
            reject(err)
        }
    })
}

function clubDataForRegSupplier(res,result, dbName) {

    return new Promise(async (resolve,reject)=>{

        var suppliers = result.supplier;

        // logger.debug("==============suppliers list========+",suppliers)
        var categories = result.category;
        var supplier = [];
        var  supplier_open_status =0;
        var supplierLength = suppliers && suppliers.length>0?suppliers.length:0;
        // console.log("=======suppliers=>>==",suppliers.length,supplierLength,categories.length)
        var x = 0;
        var y = 0;
        var z = 0;
        var exception = {};
        console.log("here");
        if (supplierLength == 0) {
            resolve(supplier);
        }
        else {
    
            for (var i = 0; i < supplierLength; i++) {
                //(async function (i) {
                    var categoriesLength = categories.length;
                    var category = [];
                    var supplierCheck = false;
                    try {
                        for (var j = x; j < categoriesLength; j++) {
                            //(async function (j) {
    
                                if (suppliers[i].id == categories[j].supplier_id) {
                                    if(suppliers[i].id == 105){
                                    }
                                    x++;
                                    supplierCheck = true;
                                    var subCategoryLength = categories.length;
                                    var subCategories = [];
                                    var subCategoryCheck = false;
                                    try {
                                        for (var k = y; k < subCategoryLength; k++) {
                                            //(async function (k) {
                                                if (categories[j].category_id == categories[k].category_id && categories[j].supplier_id == categories[k].supplier_id && suppliers[i].id == categories[j].supplier_id && suppliers[i].id == categories[k].supplier_id) {
                                                    y++;
                                                    subCategoryCheck = true;
                                                    var detailedSubCategoryLength = categories.length;
                                                    var detailedSubCategories = [];
                                                    var detailedCheck = false;
                                                    try {
                                                        for (var l = z; l < detailedSubCategoryLength; l++) {
                                                            // (async function (l) {
    
                                                                if (categories[k].sub_category_id == categories[l].sub_category_id && suppliers[i].id == categories[l].supplier_id) {
                                                                    z++;
    
                                                                    if (categories[l].sub_category_id != 0) {
                                                                        detailedCheck = true;
                                                                        if (categories[l].detailed_sub_category_id != 0) {
                                                                            detailedSubCategories.push({
                                                                                "detailed_sub_cat_id": categories[l].detailed_sub_category_id,
                                                                                "name": categories[l].detailed_sub_cat_name
                                                                            });
                                                                          //  console.log("detailed sub categories " + JSON.stringify(detailedSubCategories));
                                                                        }
                                                                        if (l == detailedSubCategoryLength - 1) {
    
                                                                            subCategories.push({
                                                                                "sub_category_id": categories[k].sub_category_id,
                                                                                "name": categories[k].sub_cat_name,
                                                                                "sub_category_data": detailedSubCategories
                                                                            });
                                                                           // console.log("sub categories " + JSON.stringify(subCategories));
                                                                        }
    
                                                                    }
    
                                                                }
                                                                else {
                                                                    if (detailedCheck && l == detailedSubCategoryLength - 1) {
                                                                        subCategories.push({
                                                                            "sub_category_id": categories[k].sub_category_id,
                                                                            "name": categories[k].sub_cat_name,
                                                                            "sub_category_data": detailedSubCategories
                                                                        });
                                                                       // console.log("sub categories " + JSON.stringify(subCategories));
                                                                        // throw exception;
                                                                    }
    
                                                                }
    
                                                            // }(l))
    
                                                        }
                                                    }
                                                    catch (e) {
                                                      //  console.log(e);
                                                    }
    
                                                    if (k == subCategoryLength - 1) {
    
                                                        category.push({
                                                            "category_id": categories[j].category_id,
                                                            "name": categories[j].category_name,
                                                            "category_data": subCategories
                                                        })
                                                    }
                                                }
                                                else {
                                                    if (subCategoryCheck && k == subCategoryLength - 1) {
                                                        category.push({
                                                            "category_id": categories[j].category_id,
                                                            "name": categories[j].category_name,
                                                            "category_data": subCategories
                                                        });
                                                        // throw exception;
                                                    }

                                                    if(suppliers[i].id == 105){
                                                       
                                                    }
    
                                                }
    
                                            //}(k))
                                        }
                                        if (j == categoriesLength - 1) {

                                            console.log("================supplier object ======",{
                                                "user_created_id": suppliers[i].user_created_id ? suppliers[i].user_created_id : "",
                                                "message_id": suppliers[i].message_id ? suppliers[i].message_id : "",
                                                "supplier_name": suppliers[i].supplier_name,
                                                "id": suppliers[i].id,
                                                "supplier_email": suppliers[i].supplier_email,
                                                "description": suppliers[i].description,
                                                "pickupCommission": suppliers[i].pickup_commission,
                                                "address": suppliers[i].address,
                                                "primary_mobile": suppliers[i].primary_mobile,
                                                "is_active": suppliers[i].is_active,
                                                "pricing_level": suppliers[i].pricing_level,
                                                "total_revenue": suppliers[i].total_revenue,
                                                "type": suppliers[i].type,
                                                "commission":suppliers[i].commission,
                                                "is_multibranch":suppliers[i].is_multibranch,
                                                "default_branch_id":suppliers[i].default_branch_id,
                                                "user_service_charge":suppliers[i].user_service_charge,
                                                "federal_number":suppliers[i].federal_number,
                                                "stripe_account":suppliers[i].stripe_account,
                                                "timing_availablity":suppliers[i].timing_availablity,
                                                "category_data": category
    
                                            })

                                           
                                            supplier.push({
                                                "supplier_open_status" : suppliers[i].timing_availablity,
                                                "user_created_id": suppliers[i].user_created_id ? suppliers[i].user_created_id : "",
                                                "message_id": suppliers[i].message_id ? suppliers[i].message_id : "",
                                                "supplier_name": suppliers[i].supplier_name,
                                                "id": suppliers[i].id,
                                                "supplier_email": suppliers[i].supplier_email,
                                                "description": suppliers[i].description,
                                                "pickupCommission": suppliers[i].pickup_commission,
                                                "address": suppliers[i].address,
                                                "primary_mobile": suppliers[i].primary_mobile,
                                                "is_active": suppliers[i].is_active,
                                                "pricing_level": suppliers[i].pricing_level,
                                                "total_revenue": suppliers[i].total_revenue,
                                                "type": suppliers[i].type,
                                                "commission":suppliers[i].commission,
                                                "is_multibranch":suppliers[i].is_multibranch,
                                                "default_branch_id":suppliers[i].default_branch_id,
                                                "user_service_charge":suppliers[i].user_service_charge,
                                                "federal_number":suppliers[i].federal_number,
                                                "stripe_account":suppliers[i].stripe_account,
                                                "timing_availablity":suppliers[i].timing_availablity,
                                                "category_data": category
    
                                            })
                                        }
                                    }
                                    catch (e) {
                                       // console.log(e);
                                    }
                                }
                                else {
                                    if ( j == categoriesLength - 1) {

                                        
                                        supplier.push({
                                           "supplier_open_status" : suppliers[i].timing_availablity,
                                            "user_created_id": suppliers[i].user_created_id ? suppliers[i].user_created_id : "",
                                            "message_id": suppliers[i].message_id ? suppliers[i].message_id : "",
                                            "supplier_name": suppliers[i].supplier_name,
                                            "id": suppliers[i].id,
                                            "supplier_email": suppliers[i].supplier_email,
                                            "description": suppliers[i].description,
                                            "pickupCommission": suppliers[i].pickup_commission,
                                            "address": suppliers[i].address,
                                            "primary_mobile": suppliers[i].primary_mobile,
                                            "is_active": suppliers[i].is_active,
                                            "pricing_level": suppliers[i].pricing_level,
                                            "total_revenue": suppliers[i].total_revenue,
                                            "type": suppliers[i].type,
                                            "commission":suppliers[i].commission,
                                            "is_multibranch":suppliers[i].is_multibranch,
                                            "default_branch_id":suppliers[i].default_branch_id,
                                            "user_service_charge":suppliers[i].user_service_charge,
                                            "federal_number":suppliers[i].federal_number,
                                            "stripe_account":suppliers[i].stripe_account,
                                            "timing_availablity":suppliers[i].timing_availablity,
                                            "category_data": category
    
                                        });
                                        // console.log("=======2=supplier-===>>",supplier)
                                        // throw exception;
                                    }
    
                                }
    
                            //}(j))
    
                        }
                    }
                    catch (e) {
                       console.log(e);
                    }
    
                    if (i == supplierLength - 1) {
                        console.log("======>>supplier",supplier)
                        resolve(supplier);
                    }
    
                //}(i))
    
            }
        }
    
    
    })
    
}


const addSupplierGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let coordinates = req.body.coordinates;
        let tax = req.body.tax;
        let delivery_charges = req.body.delivery_charges;
        let supplier_id = req.body.supplier_id
        let polygon = ""
        logger.debug("++++coordinates+++++++coordinates++++++++++++++++++",coordinates)
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"
        logger.debug("=============polygon========",polygon)
        let result = await saveCoordinates(req.dbName,polygon,tax,delivery_charges,supplier_id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const addSupplierUpdationRequest = async (req, res) => {

    try {
        let {supplierName, supplierEmail,
            supplierMobileNo, supplierAddress,latitude,longitude,commission,
            pickupCommision,country_code,iso,license_number,
            description,user_service_charge,self_pickup,

            delivery_radius,radius_price,base_delivery_charges,distance_value,is_dine_in,
            payment_method,is_scheduled,is_user_service_charge_flat,is_own_delivery,table_booking_price,
            table_booking_discount,speciality,nationality,facebook_link,linkedin_link,brand,

            supplier_id,min_order,updationRequestId} = req.body
    
        if(updationRequestId!==undefined && updationRequestId!==0){
            let prevData = await Execute.Query(req.dbName,`select * from supplier_updation_requests where id=?`,[updationRequestId]);


            for(const [index,i] of prevData.entries()){

                
                supplierName = supplierName!==i.name?supplierName:i.name,
                supplierEmail = supplierEmail!==i.supplierEmail?supplierEmail:i.email,
                supplierMobileNo = supplierMobileNo!==i.name?supplierMobileNo:i.mobile_number_1,
                supplierAddress =supplierAddress!==i.address?supplierAddress:i.address,
                latitude = latitude!==i.latitude?latitude:i.latitude,
                longitude = longitude!==i.longitude?longitude:i.longitude,
                commission = commission!==i.commission?commission:i.commission,
                pickupCommision = pickupCommision!==i.pickupCommision?pickupCommision:i.pickupCommision,

                country_code = country_code!==i.country_code?country_code:i.country_code,
                iso = iso!==i.iso?iso:i.iso,
                license_number = license_number!==i.license_number?license_number:i.license_number,
                description = description!==i.description?description:i.description,
                user_service_charge = user_service_charge!==i.user_service_charge?user_service_charge:i.user_service_charge,
                self_pickup = self_pickup!==i.self_pickup?self_pickup:i.self_pickup,
                delivery_radius  =delivery_radius!==i.delivery_radius?delivery_radius:i.delivery_radius,
                radius_price = radius_price!==i.radius_price?radius_price:i.radius_price,
                base_delivery_charges = base_delivery_charges!==i.base_delivery_charges?base_delivery_charges:i.base_delivery_charges,
                distance_value = distance_value!==i.distance_value?distance_value:i.distance_value,
                is_dine_in = is_dine_in!==i.is_dine_in?is_dine_in:i.is_dine_in,
                payment_method = payment_method!==i.payment_method?payment_method:i.payment_method,
                is_scheduled = is_scheduled!==i.is_scheduled?is_scheduled:i.is_scheduled,
                is_user_service_charge_flat = is_user_service_charge_flat!==i.is_user_service_charge_flat?is_user_service_charge_flat:i.is_user_service_charge_flat,
                is_own_delivery =  is_own_delivery!==i.is_own_delivery?is_own_delivery:i.is_own_delivery,
                table_booking_price = table_booking_price!==i.table_booking_price?table_booking_price:i.table_booking_price,

                table_booking_discount = table_booking_discount!==i.table_booking_discount?table_booking_discount:i.table_booking_discount,
                speciality = speciality!==i.speciality?speciality:i.speciality,
                nationality = nationality!==i.nationality?nationality:i.nationality,
                facebook_link = facebook_link!==i.facebook_link?facebook_link:i.facebook_link,
                linkedin_link = linkedin_link!==i.linkedin_link?linkedin_link:i.linkedin_link,
                brand =    brand!==i.brand?brand:i.brand
                
            }

            if(req.files.logo){
                let logo = await uploadMgr.uploadImageFileToS3BucketNew(req.files.logo)
                let query = ` update supplier_updation_requests set logo=? where id=? `;
                await Execute.Query(req.dbName,query,[logo,updationRequestId]);  

                
            }

            if(req.files.supplier_image){
                let supplier_image = await uploadMgr.uploadImageFileToS3BucketNew(req.files.supplier_image)
                let query = ` update supplier_updation_requests set supplier_image=? where id=? `;
                await Execute.Query(req.dbName,query,[supplier_image,updationRequestId]);
            }

            let query = ` update supplier_updation_requests set name=?,
                email=?,mobile_number_1=?, 
                address=?,latitude=?,
                longitude=?,commission=?,
                pickup_commission=?,country_code=?,
                iso=?,license_number=?,
                description=?,user_service_charge=?,
                self_pickup=?,delivery_radius=?,
                radius_price=?,base_delivery_charges=?,
                distance_value=?,is_dine_in=?,
                payment_method=?,is_scheduled=?,
                is_user_service_charge_flat=?,is_own_delivery=?,
                table_booking_price=?,table_booking_discount=?,
                speciality=?,nationality=?,
                facebook_link=?,linkedin_link=?,brand=?,min_order=? where id=? `;
                        
            let params = [supplierName || "",
                         supplierEmail || "",
                        supplierMobileNo || "",
                        supplierAddress,
                        latitude,
                        longitude,
                        commission || 0,
                        pickupCommision || 0,
                        country_code || "",
                        iso || "",
                        license_number || "",
                        description || "",
                        user_service_charge || 0,
                        self_pickup || 0,
                        delivery_radius || 0,
                        radius_price || 0,
                        base_delivery_charges || 0,
                        distance_value || 0,
                        is_dine_in || 0,
                        payment_method || 0,
                        is_scheduled || 0,
                        is_user_service_charge_flat || 0,
                        is_own_delivery || 0,
                        table_booking_price || 0,
                        table_booking_discount || 0,
                        speciality || "",nationality || "",
                        facebook_link || "",
                        linkedin_link || "",
                        brand || "",min_order,
                        updationRequestId]
            
            await Execute.Query(req.dbName,query,params);
        }else{

            let query = ` insert into supplier_updation_requests(name,
                email,mobile_number_1, 
                address,latitude,
                longitude,commission,
                pickup_commission,country_code,
                iso,license_number,
                description,user_service_charge,
                self_pickup,delivery_radius,
                radius_price,base_delivery_charges,
                distance_value,is_dine_in,
                payment_method,is_scheduled,
                is_user_service_charge_flat,is_own_delivery,
                table_booking_price,table_booking_discount,
                speciality,nationality,
                facebook_link,linkedin_link,brand,min_order,
    
                supplier_id)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                        
            let params = [supplierName || "", supplierEmail || "",
                    supplierMobileNo || "", supplierAddress,latitude,longitude,
                    commission || 0,
                    pickupCommision || 0,
                    country_code || "",
                    iso || "",
                    license_number || "",
                    description || "",
                    user_service_charge || 0,
                    self_pickup || 0,
                    delivery_radius || 0,
                    radius_price || 0,
                    base_delivery_charges || 0,
                    distance_value || 0,
                    is_dine_in || 0,
                    payment_method || 0,
                    is_scheduled || 0,
                    is_user_service_charge_flat || 0,
                    is_own_delivery || 0,
                    table_booking_price || 0,
                    table_booking_discount || 0,
                    speciality || "",
                    nationality || "",
                    facebook_link || "",
                    linkedin_link || "",
                    brand || "",min_order,
                    supplier_id]
            
            let result = await Execute.Query(req.dbName,query,params);


            if(req.files && req.files.logo){
                let logo = await uploadMgr.uploadImageFileToS3BucketNew(req.files.logo)
                let query = ` update supplier_updation_requests set logo=? where id=? `;
                await Execute.Query(req.dbName,query,[logo,result.insertId]);  

                
            }

            if(req.files && req.files.supplier_image){
                let supplier_image = await uploadMgr.uploadImageFileToS3BucketNew(req.files.supplier_image)
                let query = ` update supplier_updation_requests set supplier_image=? where id=? `;
                await Execute.Query(req.dbName,query,[supplier_image,result.insertId]);
            }
        }
        
        
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
       console.log("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

// const addSupplierProductUpdationRequest = async (req, res) => {

//     try {
//         let {name, description,
//             priceUnit, measuringUnit,commissionPackage,commission,barCode,
//             count,imagePath,quantity,brand_id,
//             pricing_type,is_product,payment_after_confirmation,
//             cart_image_upload,making_price,product_tags,variant,is_updation_vendor_request
//         } = req.body

//         if(description.length>0){
//             description = description.split("#");
//         }else{
            
//         }

//         if(name.length>0){
//             name = name.split("#");
//         }else{

//         }
        

//         if(updationRequestId!==undefined && updationRequestId!==0){
//             // let prevData = await Execute.Query(req.dbName,`select * from supplier_product_updation_requests where id=?`,[updationRequestId]);


//             var query = ` update supplier_product_updation_requests set name=?,
//                 name_ml=?,description=?,description_ml=?,
//                 priceUnit=?,measuringUnit=?, 
//                 commissionPackage=?,commission=?,
//                 barCode=?,count=?,
//                 imagePath=?,quantity=?,
//                 brand_id=?,pricing_type=?,
//                 is_product=?,payment_after_confirmation=?,cart_image_upload=?,
//                 making_price=? where id=? `;
                        
//             let params = [name[0],name[1], description[0],description[1],
//                 priceUnit, measuringUnit,commissionPackage,commission,barCode,
//                 count,imagePath,quantity,brand_id,
//                 pricing_type,is_product,payment_after_confirmation,
//                 cart_image_upload,making_price,
//                         updationRequestId]
            
//             await Execute.Query(req.dbName,query,params);
//         }else{
//             description = description.split("#");

//             name = name.split("#");

           
//             var query = ` insert into supplier_product_updation_requests(name,
//                 name_ml,description,description_ml,
//                 priceUnit,measuringUnit, 
//                 commissionPackage,commission,
//                 barCode,count,
//                 imagePath,quantity,
//                 brand_id,pricing_type,
//                 is_product,payment_after_confirmation,cart_image_upload,
//                 making_price)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                        
//             let params = [name[0],name[1], description[0],description[1],
//             priceUnit, measuringUnit,commissionPackage,commission,barCode,
//             count,imagePath,quantity,brand_id,
//             pricing_type,is_product,payment_after_confirmation,
//             cart_image_upload,making_price]
            
//             await Execute.Query(req.dbName,query,params);
//         }
        
        
        
//         sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

//     } catch (err) {
//         logger.debug("=======ere in list suppliers==========", err)
//         sendResponse.somethingWentWrongError(res)
//     }
// }


const approveSupplierUpdationRequest = async (req, res) => {
    try {
        let {updationRequestId, update_request_approved} = req.body

        if( update_request_approved == 2 ) {

    
            await Execute.Query(req.dbName,
                `update supplier_updation_requests set  update_request_approved=${update_request_approved} where id=?`,[updationRequestId])



        } else {
            var query = ` select name,
            email,mobile_number_1, 
            address,latitude,
            longitude,commission,
            pickup_commission,country_code,
            iso,license_number,
            description,user_service_charge,
            self_pickup,delivery_radius,
            radius_price,base_delivery_charges,
            distance_value,is_dine_in,
            payment_method,is_scheduled,
            is_user_service_charge_flat,is_own_delivery,
            table_booking_price,table_booking_discount,
            speciality,nationality,
            facebook_link,linkedin_link,brand,supplier_id,logo,supplier_image 
                from supplier_updation_requests 
                where id=${updationRequestId}`;
            
            let updationData = await Execute.Query(req.dbName,query,[]);
            
            let {name,
                email,mobile_number_1, 
                address,latitude,
                longitude,commission,
                pickup_commission,country_code,
                iso,license_number,
                description,user_service_charge,
                self_pickup,delivery_radius,
                radius_price,base_delivery_charges,
                distance_value,is_dine_in,
                payment_method,is_scheduled,
                is_user_service_charge_flat,is_own_delivery,
                table_booking_price,table_booking_discount,
                speciality,nationality,
                facebook_link,linkedin_link,brand,
                supplier_id,logo,supplier_image
                } = updationData[0];
    
                let queryForUpdation = ` update supplier set  name=?,
                email=?,mobile_number_1=?, 
                address=?,latitude=?,
                longitude=?,commission=?,
                pickup_commission=?,country_code=?,
                iso=?,license_number=?,
                description=?,user_service_charge=?,
                self_pickup=?,delivery_radius=?,
                radius_price=?,base_delivery_charges=?,
                distance_value=?,is_dine_in=?,
                payment_method=?,is_scheduled=?,
                is_user_service_charge_flat=?,is_own_delivery=?,
                table_booking_price=?,table_booking_discount=?,
                speciality=?,nationality=?,
                facebook_link=?,linkedin_link=?,brand=?,logo=?,supplier_image=? where id=? `;
    
                let updationParams = [
                name,
                email,mobile_number_1, 
                address,latitude,
                longitude,commission,
                pickup_commission,country_code,
                iso,license_number,
                description,user_service_charge,
                self_pickup,delivery_radius,
                radius_price,base_delivery_charges,
                distance_value,is_dine_in,
                payment_method,is_scheduled,
                is_user_service_charge_flat,is_own_delivery,
                table_booking_price,table_booking_discount,
                speciality,nationality,
                facebook_link,linkedin_link,brand,logo,supplier_image,
                supplier_id
                ]
    
                await Execute.Query(req.dbName," update supplier_admin set email=? where supplier_id=?",[email,supplier_id])
    
                await Execute.Query(req.dbName,queryForUpdation,updationParams)
    
    

                await Execute.Query(req.dbName,"update supplier_ml set  name=? where supplier_id=?",[name,supplier_id]);
    
        
                await Execute.Query(req.dbName,
                    `update supplier_updation_requests set  update_request_approved=${update_request_approved} where id=?`,[updationRequestId])
    
    
    
        }

        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        console.log("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}


const getSupplierUpdationRequests = async (req, res) => {

    try {
        let {limit,skip} = req.query

        var query = ` select * from supplier_updation_requests  order by id desc limit ?,? `;
                    
        let params = [skip,limit]
        
        let result = await Execute.Query(req.dbName,query,params);

        if( result && result.length>0 ) {

            for(const [index,i] of result.entries()) {
                let supplierInfoQuery = ` select * from supplier where id=${i.supplier_id} `;
                
                i.supplierOldDetails = await ExecuteQ.Query(req.dbName, supplierInfoQuery, []);

            }
        }

        var query1 = ` select * from supplier_updation_requests  `;
                    
        let params1 = []
        
        let result1 = await Execute.Query(req.dbName,query1,params1);


        let finalData = {
            list : result,
            count : result1 && result1.length>0?result1.length:0
        }
        
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const getSupplierUpdationRequestsBySupplier = async (req, res) => {

    try {
        let {limit,skip,supplier_id} = req.query

        var query = ` select * from supplier_updation_requests where supplier_id=? limit ?,? `;
                    
        let params = [supplier_id,skip,limit]
        
        let result = await Execute.Query(req.dbName,query,params);

        var query1 = ` select * from supplier_updation_requests where supplier_id=?  `;
                    
        let params1 = [supplier_id]
        
        let result1 = await Execute.Query(req.dbName,query1,params1);

        let finalData = {
            list : result,
            count : result1 && result1.length>0?result1.length:0
        }
        
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const saveCoordinates = (dbName,coordinates,tax,delivery_charges,supplier_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            logger.debug("============coordinates--------------",coordinates)
            let query = "insert into supplier_delivery_areas(coordinates,tax,delivery_charges,supplier_id) "
            query += "values (PolygonFromText(?),?,?,?)"
            let params = [coordinates,tax,delivery_charges,supplier_id ]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const updateSupplierGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let coordinates = req.body.coordinates;
        let tax = req.body.tax;
        let delivery_charges = req.body.delivery_charges;
        let id = req.body.id
        let polygon = ""
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"

        let result = await updateCoordinates(req.dbName,polygon,tax,delivery_charges,id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const updateCoordinates = (dbName,coordinates,tax,delivery_charges,id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update supplier_delivery_areas set coordinates= PolygonFromText(?)"
                query += ", tax = ?, delivery_charges= ? where id = ?";
           let params = [coordinates,tax,delivery_charges,id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const deleteSupplierGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let id = req.body.id
    
        let result = await deleteCoordinates(req.dbName,id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const deleteCoordinates = (dbName,id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "delete from supplier_delivery_areas  where id = ?";
           let params = [id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const listSupplierGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let supplier_id = req.query.supplier_id
    
        let result = await listCoordinates(req.dbName,supplier_id);
        if(result && result.length>0){
            for(const [index,i] of result.entries()){
                logger.debug("==i.coordinates===",i.coordinates)
                if(i.coordinates!=null || i.coordinates!=""){
                    i.coordinates = i.coordinates && i.coordinates.length>0?i.coordinates[0]:[]
                }
            }
        }
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const listCoordinates = (dbName,supplier_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select id,supplier_Id,tax,delivery_charges,coordinates from supplier_delivery_areas  where supplier_id = ?";
           let params = [supplier_id]
           let result =  await ExecuteQ.Query(dbName,query,params);
        //    result.map(obj=>{
        //        obj.coordinates = obj.coordinates[0]
        //    })
           logger.debug("=====result=======",result);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const AddSupplierAvailability = async (req, res) => {
    try {
        var input_data = req.body;
        var data = {
            "offset": input_data.offset,
            // "agent_token":input_data.agent_token,
            "weeks_data": input_data.weeks_data,
            "user_time": input_data.user_time,
            "user_avail_date": input_data.user_avail_date
        }   
        let date_order_type = req.body.date_order_type
        let offset = req.body.offset;
        let weeks_data = req.body.weeks_data;
        let supplier_timings = req.body.supplier_timings;
        let supplier_available_dates = req.body.supplier_available_dates;
        let supplier_location_id = req.body.supplier_location_id
        let interval = req.body.supplier_slots_interval==undefined || req.body.supplier_slots_interval==""   ?30:req.body.supplier_slots_interval
        /* 1. check supplier availability with supplier id
           2. getAvailDateId set supplier_available_date if mention in array any
              and get the date id back other wise get 0 date id back
           3. add supplier availability table with day_id,supplier_id,status
           4. add supplier_slot_timings (check supplier_availble date array if empty
              then directly update with date_id,supplier_id,offset)
        */
        let supplier_id = req.body.supplier_id;

        await checkSupplierAvailability(req.dbName,supplier_id,date_order_type,res,supplier_location_id);

        let date_id =  await saveAndGetAvailableDateId(req.dbName,supplier_id,supplier_available_dates,date_order_type,supplier_location_id);
        await saveSupplierAvailabilityAndTimings(req.dbName,supplier_id,weeks_data,supplier_timings,supplier_available_dates,date_id,date_order_type,supplier_location_id);
        await updateOrInsertSlotsInterval(req.dbName,date_order_type,interval);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const updateOrInsertSlotsInterval = (dbName,date_order_type,interval)=>{
    return new Promise(async(resolve,reject)=>{
        try{
           let query = "select id from supplier_slots_interval where booking_type=?"
           let params = [date_order_type]
           let result = await ExecuteQ.Query(dbName,query,params);

           if(result && result.length>0){
               let query = "update supplier_slots_interval set `interval`=? where booking_type=?"
               let params = [interval,date_order_type];
               await ExecuteQ.Query(dbName,query,params);
               resolve();
           }else{
             let query = "insert into supplier_slots_interval(`interval`,booking_type) values(?,?)"
             let params = [interval,date_order_type];
             await ExecuteQ.Query(dbName,query,params);
               resolve();
           }

        }catch(err){
            logger.debug(err);
            reject(err)
        }
    })
}



const checkSupplierAvailability = (dbName,supplier_id,date_order_type,res,supplier_location_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
           let query = "select id from supplier_availability where supplier_id = ? and date_order_type=? and supplier_location_id=?"
           let params = [supplier_id,date_order_type,supplier_location_id]
           let result = await ExecuteQ.Query(dbName,query,params);

           if(result && result.length>0){
            let message = "Availability already set you can update your availability"
            sendResponse.sendErrorMessage(message, res, 400)
           }else{
            resolve(result);
           }

        }catch(err){
            logger.debug(err);
            reject(err)
        }
    })
}

const saveAndGetAvailableDateId = (dbName,supplier_id,supplier_available_dates,date_order_type,supplier_location_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            if(supplier_available_dates && supplier_available_dates.length>0){
                for(const [index,i] of supplier_available_dates.entries()){
                    let query = "insert into supplier_available_dates(supplier_id,status,from_date,to_date,date_order_type,supplier_location_id) ";
                    query += "values(?,?,?,?,?,?)";
                    let params = [supplier_id,i.status,i.from_date,i.to_date,date_order_type,supplier_location_id];
                    let result = await ExecuteQ.Query(dbName,query,params);
                    resolve(result.insertId)
                }
            }else{
                resolve(0);
            }
        }catch(err){
            logger.debug(err);
            reject(err)
        }
    })
}

const saveSupplierAvailabilityAndTimings = 
(
dbName,supplier_id,weeks_data,
supplier_timings,supplier_available_dates,dateIds,
date_order_type,
supplier_location_id
)=>{
    logger.debug("==========supplier timings====+++",supplier_timings)
    return new Promise(async(resolve,reject)=>{
        try{
            for(const [index,i] of weeks_data.entries()){
                let query = "insert into supplier_availability(supplier_id,status,day_id,supplier_location_id,date_order_type) ";
                query += "values(?,?,?,?,?)";
                let params = [supplier_id,i.status,i.day_id,supplier_location_id,date_order_type];
                let result = await ExecuteQ.Query(dbName,query,params);
            }

            if(supplier_available_dates && supplier_available_dates.length>0){
                for(const [index,i] of supplier_available_dates.entries()){
                    for(const [index2,j] of supplier_timings.entries()){

                        let query2 = "insert into supplier_slot_timings(supplier_id,start_time,end_time,date_id,day_id,supplier_location_id,quantity,price,date_order_type) ";
                            query2 += "values(?,?,?,?,?,?,?,?,?)";
                            j.quantity = j.quantity!==undefined?j.quantity:0
                            j.price = j.price!==undefined?j.price:0
                        let params = [supplier_id,j.start_time,j.end_time,dateIds,8,supplier_location_id,j.quantity,j.price,date_order_type];
                        await ExecuteQ.Query(dbName,query2,params);                        
                    }
                }
            }else{
                for(const [index2,j] of supplier_timings.entries()){
                    let query2 = "insert into supplier_slot_timings(supplier_id,start_time,end_time,date_id,day_id,supplier_location_id,quantity,price,date_order_type) ";
                        query2 += "values(?,?,?,?,?,?,?,?,?)";
                        j.quantity = j.quantity!==undefined?j.quantity:0
                        j.price = j.price!==undefined?j.price:0
                    let params = [supplier_id,j.start_time,j.end_time,dateIds,j.day_id,supplier_location_id,j.quantity,j.price,date_order_type];
                    await ExecuteQ.Query(dbName,query2,params);                        
                }
            }
            resolve();
        }catch(err){
            logger.debug(err);
            reject(err)
        }
    })
}

const UpdateSupplierAvailability = async (req, res) => {
    try {
        
        let offset = req.body.offset;
        let weeks_data = req.body.weeks_data;
        let supplier_timings = req.body.supplier_timings;
        let supplier_available_dates = req.body.supplier_available_dates;
        let date_order_type = req.body.date_order_type
        let supplier_location_id = req.body.supplier_location_id
        let interval = req.body.supplier_slots_interval==undefined || req.body.supplier_slots_interval==""   ?30:req.body.supplier_slots_interval;
       
        let _activeWeek=_.filter(weeks_data, function(item){ 
            return item.status==1
        });
        let _weekDays=_.pluck(_activeWeek,"day_id");
        console.log("=====_activeWeek===>>",_activeWeek,_weekDays)
        /* 1. update weeks data  supplier availability (update status basically)
           2. getAvailDateId update/set supplier_available_date if mention in array any
              and get the date id back other wise get 0 date id back
              if there is no ID than create row otherwise update row with ID
              (from date, to date)
           4. check avail time array if array empty than simply resolve
              if array not empty than loop through the array one by one
              if ID found than update the row if not found than create another row
              in update - (start time , end time)
              in create - (start time, end time , supplierId, dateId, day id)
        */
        
        let supplier_id = req.body.supplier_id;

        
        await UpdateSupplierWeekData(req.dbName,supplier_id,weeks_data,
            date_order_type,supplier_location_id);
            

        let date_ids = await updateAndGetAvailableDateId(req.dbName,supplier_id,supplier_available_dates,date_order_type,supplier_location_id);
        let _availableDateData=[]
        let _datesData=await ExecuteQ.Query(req.dbName,`select * from supplier_available_dates where supplier_id=? and date_order_type=? and supplier_location_id=?`,[supplier_id,date_order_type,supplier_location_id])
        if(_datesData && _datesData.length>0){
            for(const [index,i] of _datesData.entries()){
                let dayOfWeek = moment(i.from_date).day();
                _availableDateData.push({
                    "day_id":dayOfWeek,
                    "id":i.id
                })
            }
        }
        await updateSupplierAvailabilityAndTimings(req.dbName,supplier_id,
            supplier_timings,date_ids,date_order_type,supplier_location_id,_availableDateData,_weekDays);
        
            
        await updateOrInsertSlotsInterval(req.dbName,date_order_type,interval);



        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const UpdateSupplierWeekData = (dbName,supplier_id,weeks_data,date_order_type,supplier_location_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            logger.debug("======req.dbname=======2====",dbName)
            if(weeks_data && weeks_data.length>0){
                logger.debug("======req.dbname=======3====",dbName)
                for(const [index,i] of weeks_data.entries()){
                
                let query = "update supplier_availability set status=1 where id=? and supplier_id=?";
                let params = [i.id,supplier_id];
                logger.debug("======req.dbname=======4====",dbName);
                let result = await ExecuteQ.Query(dbName,query,params);

                if(index==weeks_data.length-1){
                    resolve();
                }


                }
                
            }else{
                resolve();
            }

        }catch(err){
            logger.debug(err);
            reject(err)
        }
    })
}

const deleteSlotsTimings = async (req, res) => {
    try {

        let id = req.body.slotId;
        let supplier_id = req.body.supplier_location_id
        let query = "delete from supplier_slot_timings where id=?"
        let params = [id]
        let result = await ExecuteQ.Query(req.dbName,query,params);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const updateAndGetAvailableDateId = (dbName,supplier_id,supplier_available_dates,
    date_order_type,supplier_location_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let ids = []
            if(supplier_available_dates && supplier_available_dates.length>0){
                for(const [index,i] of supplier_available_dates.entries()){
                    // await ExecuteQ.Query(dbName,`delete from supplier_available_dates where supplier_location_id=? and supplier_id=? and date_order_type=?`,[supplier_location_id,supplier_id,date_order_type])
                    if(i.id!==undefined && i.id!=="" && i.id!==0){
                        let query = "update supplier_available_dates set from_date = ?, to_date = ? ";
                            query += "where id= ? and supplier_id = ?"
                        let params = [i.from_date,i.to_date,i.id,supplier_id];
                        let results = await ExecuteQ.Query(dbName,query,params);
                        ids.push(i.id);
                    }
                    else{
                        let query = "insert into supplier_available_dates(from_date,to_date,supplier_id,status,date_order_type,supplier_location_id) ";
                            query += "values(?,?,?,?,?,?)"
                        let params = [i.from_date,i.to_date,supplier_id,i.status,date_order_type,supplier_location_id];
                        let results = await ExecuteQ.Query(dbName,query,params);
                        ids.push(results.insertId);
                    }
                }
                resolve(ids)
            }else{
                resolve(0);
            }
        }catch(err){
            logger.debug(err);
            reject(err)
        }
    })
}
const updateExistingSlots=(dbName,supplier_timings,supplier_id)=>{
return new Promise(async (resolve,reject)=>{
    let slotsIds=[0];
    if(supplier_timings && supplier_timings.length>0){

        for(const [index,i] of supplier_timings.entries()){

            if(i.id!==undefined && i.id!==""){
                let query = "update supplier_slot_timings set start_time = ?, end_time = ?, quantity = ?, price = ? ";
                    query += "where id= ? and supplier_id = ?"
                    i.quantity = i.quantity!==undefined?i.quantity:0
                    i.price = i.price!==undefined?i.price:0
                let params = [i.start_time,i.end_time,i.quantity,i.price,i.id,supplier_id];
                let results = await ExecuteQ.Query(dbName,query,params);
                console.log("==result==>",results)
                slotsIds.push(i.id)
            }

            if(index==supplier_timings.length-1){
                resolve(slotsIds)
            }

        }
        }
        else{
            resolve(slotsIds)
        }
})
}
const addNewSlots=(dbName,supplier_timings,supplier_id,_updatedSlotsId,supplier_location_id,date_order_type,date_ids,_availableDateData,_weekDays)=>{
    return new Promise(async (resolve,reject)=>{
        console.log("date_ids===>>",date_ids)
        if(supplier_timings && supplier_timings.length>0){

            // if(parseInt(date_order_type)==1){
            //      await ExecuteQ.Query(dbName,`delete from supplier_slot_timings where supplier_id=? and supplier_location_id=? and id NOT IN(?)`,[supplier_id,supplier_location_id,_updatedSlotsId]);
            // }
            for(const [index,i] of supplier_timings.entries()){
                console.log("===date_ids>>",date_ids);

                if(date_ids!=0){
                    if(index==0){
                         await ExecuteQ.Query(dbName,`delete from supplier_slot_timings where supplier_id=? and supplier_location_id=? and date_id=? and date_order_type=?`,[supplier_id,supplier_location_id,date_ids[0],date_order_type]);
                    }
                    let query = "insert into supplier_slot_timings(start_time,end_time,supplier_id,date_id,day_id,date_order_type,supplier_location_id,quantity,price) ";
                    query += "values(?,?,?,?,?,?,?,?,?)"
                    i.quantity = i.quantity!==undefined?i.quantity:0
                    i.price = i.price!==undefined?i.price:0
                    date_ids[0] = date_ids[0]==null || date_ids[0]==undefined?0:date_ids[0]
                    let params = [i.start_time, i.end_time, supplier_id, date_ids, i.day_id!=undefined?i.day_id:8,date_order_type,supplier_location_id,i.quantity,i.price];
                    await ExecuteQ.Query(dbName,query,params);
                }
                else{
                    await deleteDatesIfExistOnDayId(_availableDateData,i.day_id,dbName);
                    if(index==0){
                        let dayIds=_.pluck(supplier_timings, 'day_id');
                        await ExecuteQ.Query(dbName,`delete from supplier_slot_timings where supplier_id=? and supplier_location_id=? and day_id IN(?) and date_order_type=?`,[supplier_id,supplier_location_id,dayIds,date_order_type]);
                    }
                    let query = "insert into supplier_slot_timings(start_time,end_time,supplier_id,date_id,day_id,date_order_type,supplier_location_id,quantity,price) ";
                    query += "values(?,?,?,?,?,?,?,?,?)"
                    i.quantity = i.quantity!==undefined?i.quantity:0
                    i.price = i.price!==undefined?i.price:0
                    date_ids[0] = date_ids[0]==null || date_ids[0]==undefined?0:date_ids[0]
                    let params = [i.start_time, i.end_time, supplier_id, date_ids, i.day_id!=undefined?i.day_id:8,date_order_type,supplier_location_id,i.quantity,i.price];
                    await ExecuteQ.Query(dbName,query,params);
                   

                }

                
                if(index==supplier_timings.length-1){
                    resolve()
                }
            }
            
            }
            else{
                if(date_ids!=0){
                    await ExecuteQ.Query(dbName,`delete from supplier_slot_timings where supplier_id=? and supplier_location_id=? and date_id=? and date_order_type=?`,[supplier_id,supplier_location_id,date_ids[0],date_order_type]);
                }
                else{
                    await ExecuteQ.Query(dbName,`delete from supplier_slot_timings where supplier_id=? and supplier_location_id=? and day_id IN(?) and date_order_type=?`,[supplier_id,supplier_location_id,_weekDays,date_order_type]);
                }
                resolve()

            }
           
    })
}
const deleteDatesIfExistOnDayId=(_availableDateData,day_id,dbName)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            for(const [index,i] of _availableDateData.entries()){
                if(parseInt(day_id)==parseInt(i.day_id)){
                    console.log("==match=dayId>>",day_id)
                    await ExecuteQ.Query(dbName,`delete from supplier_available_dates where id=?`,[i.id]);
                }
            }
            resolve()
        }
        catch(Err){
            console.log("===Err==>>",Err)
            resolve()
        }
    })
}
const updateSupplierAvailabilityAndTimings = 
(
dbName,supplier_id,
supplier_timings,
date_ids,
date_order_type,
supplier_location_id,
_availableDateData,
_weekDays
)=>{
    logger.debug("------>>",date_ids)
    return new Promise(async(resolve,reject)=>{
        try{


            let _updatedSlotsId=await updateExistingSlots(dbName,supplier_timings,supplier_id);
            await addNewSlots(dbName,supplier_timings,supplier_id,_updatedSlotsId,supplier_location_id,date_order_type,date_ids,_availableDateData,_weekDays);
            
            resolve()
           
        }catch(err){
            logger.debug(err);
            reject(err)
        }
    })
}

const GetSupplierAvailability = async (req, res) => {

    try {

        let supplier_id = req.query.supplier_id;
        let date_order_type = req.query.date_order_type 
        logger.debug("=-=====dateordertype=====",date_order_type)
        let supplier_location_id = req.query.supplier_location_id!==undefined?req.query.supplier_location_id:0
       
        let supplier_available_dates = await supplierAvailableDates(req.dbName,supplier_id,date_order_type,supplier_location_id);
        let supplier_timings = await supplierSlotTimings(req.dbName,supplier_id,date_order_type,supplier_location_id);
        let weeks_data = await supplierAvailability(req.dbName,supplier_id,date_order_type,supplier_location_id);
       
        let supplier_slots_interval = await getSlotsInterval(req.dbName,date_order_type);
        
        let query = "select name, email, phone from supplier where id = ?";
        let params = [supplier_id];
        let result = await ExecuteQ.Query(req.dbName,query,params);
        let finalData = null;

        if(
            (supplier_available_dates && supplier_available_dates.length>0)||
            (supplier_timings && supplier_timings.length>0)||
            (weeks_data && weeks_data.length>0)
        ){

            let dataToSend = {
                supplier_available_dates : supplier_available_dates,
                supplier_timings : supplier_timings,
                weeks_data : weeks_data,
                supplier_slots_interval:supplier_slots_interval,
                email : result[0].email,
                name : result[0].name,
                phone : result[0].phone
            }
            
            sendResponse.sendSuccessData(dataToSend, constant.responseMessage.SUCCESS, res, 200);
        }else{
            sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);

        }
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const supplierAvailableDates = (dbName, supplier_id, date_order_type, supplier_location_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "select id,supplier_id,status,date_order_type,DATE_FORMAT(from_date,'%Y-%m-%d') as from_date,DATE_FORMAT(to_date,'%Y-%m-%d') as to_date,date_order_type,supplier_location_id from supplier_available_dates ";
                query += "where supplier_id = ? and date_order_type = ? and supplier_location_id=?";

            let params = [supplier_id,date_order_type,supplier_location_id];
            let result = await ExecuteQ.Query(dbName, query, params);
            resolve(result);
        } catch (err) {
            logger.debug(err);
            reject(err)
        }
    })
}

const supplierAvailability = (dbName, supplier_id,date_order_type,supplier_location_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "select id,supplier_id,status,day_id,date_order_type,supplier_location_id from supplier_availability ";
                query += "where supplier_id = ? and date_order_type=? and supplier_location_id=?";

            let params = [supplier_id,date_order_type,supplier_location_id];
            let result = await ExecuteQ.Query(dbName, query, params);
            resolve(result);
        } catch (err) {
            logger.debug(err);
            reject(err)
        }
    })
}

const supplierSlotTimings = (dbName, supplier_id,date_order_type,supplier_location_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "select (SELECT COUNT(id) as total_booking from supplier_booked_slots sb WHERE sb.slot_id=sl.id) as total_booking ,sl.id,sl.supplier_id,sl.status,sl.start_time,sl.end_time,sl.date_id,sl.day_id,sl.`offset`,sl.date_order_type,sl.supplier_location_id,sl.price,sl.quantity from supplier_slot_timings sl ";
                query += "where sl.supplier_id = ? and sl.date_order_type=? and sl.supplier_location_id=? ";

            let params = [supplier_id,date_order_type,supplier_location_id];
            let result = await ExecuteQ.Query(dbName, query, params);
            resolve(result);
        } catch (err) {
            logger.debug(err);
            reject(err)
        }
    })
}


const addSupplierOrderGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let coordinates = req.body.coordinates;
        let  supplier_id    = req.body.supplier_id
        let name=req.body.name!=undefined?req.body.name:""
        let polygon = ""
        logger.debug("++++coordinates+++++++coordinates++++++++++++++++++",coordinates)
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"
        logger.debug("=============polygon========",polygon)

        let result = await saveOrderCoordinates(req.dbName,polygon,supplier_id,name);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const saveOrderCoordinates = (dbName,coordinates,supplier_id,name)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            logger.debug("============coordinates--------------",coordinates)
            let query = "insert into supplier_location_availabilities(coordinates,supplier_id,name) "
            query += "values (PolygonFromText(?),?,?)"
            let params = [coordinates,supplier_id,name]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}


const updateSupplierOrderGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let coordinates = req.body.coordinates;
        let delivery_charges = req.body.delivery_charges;
        let id = req.body.id
        let name=req.body.name!=undefined?req.body.name:""
        let polygon = ""
        let result = {}
        if(coordinates.length > 0){
            for (const [index, i] of coordinates.entries()) {
                polygon += i.x + " " + i.y + ","
            }

            polygon = polygon.substring(0, polygon.length - 1)
            polygon = "polygon((" + polygon + "))"

            result = await updateOrderCoordinates(req.dbName,polygon,id,name);
        }
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const updateOrderCoordinates = (dbName,coordinates,id,name)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update supplier_location_availabilities set name=?,coordinates= PolygonFromText(?) "
                query += " where id = ?";
           let params = [name,coordinates,id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const deleteSupplierOrderGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let id = req.body.id
    
        let result = await deleteOrderCoordinates(req.dbName,id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const deleteOrderCoordinates = (dbName,id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "delete from supplier_location_availabilities  where id = ?";
           let params = [id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const listSupplierOrderGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let supplier_id = req.query.supplier_id
    
        let result = await listOrderCoordinates(req.dbName,supplier_id);

        if(result && result.length>0){
            for(const [index,i] of result.entries()){
                logger.debug("==i.coordinates===",i.coordinates)
                if(i.coordinates!=null || i.coordinates!=""){
                    i.coordinates = i.coordinates && i.coordinates.length>0?i.coordinates[0]:[]
                }
            }
        }
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const listOrderCoordinates = (dbName,supplier_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select name,id,supplier_Id,coordinates from supplier_location_availabilities  where supplier_id = ?";
           let params = [supplier_id]
           let result =  await ExecuteQ.Query(dbName,query,params);
        //    result.map(obj=>{
        //        obj.coordinates = obj.coordinates[0]
        //    })
           logger.debug("=====result=======",result);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const getSupplierSlots = async (req, res) => {
    let finalResponse = {};
    try {
        let supplier_id = req.query.supplier_id
        let date = req.query.date
        let offset = req.query.offset || "+05:30"
        let date_order_type = req.query.date_order_type
        let latitude = req.query.latitude
        let longitude = req.query.longitude
        let seating_capacity = req.query.seating_capacity || 0;
        let branch_id = req.query.branch_id || 0;
        let table_booking_price = 0;
        let tableBookPrice = await ExecuteQ.Query(req.dbName,
            "select table_booking_price  from supplier where id=?",[supplier_id]);
        
        if(tableBookPrice && tableBookPrice.length>0){
            table_booking_price = tableBookPrice[0].table_booking_price
        }
        let slots = []

        let slotsInterval = await getSlotsInterval(req.dbName,date_order_type);
        let slotBuffer
        let interval = 30;

        if(slotsInterval>0){
            interval = slotsInterval;
        }



        let AvailableSlots = await getAvailSlotsWithOrderType(req.dbName,supplier_id,
            date_order_type,latitude,longitude,date,seating_capacity);
            logger.debug("======available slots=======",AvailableSlots)


            let currentDateTime = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");

            if(req.path=="/user/list_supplier_slots/v1"){
                let availableTables = []
                if(AvailableSlots && AvailableSlots.length>0){
                    for(const [index,i] of AvailableSlots.entries()){

                        let query = "select st.id,st.supplier_id,s.table_booking_price,st.table_number,st.table_name,st.seating_capacity,st.qr_code from supplier_tables st join supplier s on s.id = st.supplier_id left join user_table_booked utb on utb.table_id = st.id  and utb.slot_id !=? "
                        query+= "where st.supplier_id=?  and st.is_deleted=? and st.seating_capacity=? group by st.id  ";        
                        let params = [i.id,supplier_id,0,seating_capacity];
                        let result = await ExecuteQ.Query(req.dbName,query,params);
                       
                        if(result && result.length>0){
                            for(const [index,i] of result.entries()){
                                availableTables.push(i);
                            }
                        }

                        // let timeslots = await  Universal.TimeSlots(i.start_time,i.end_time,interval);
                        // logger.debug('========timeslots======',timeslots)
                        // slots = slots.concat(timeslots)
                   
                    }
                }
                // slots = _.uniq(slots);

                
                // if(slots && slots.length>0){
                //     let result = [];

                //     for(const [index,i] of slots.entries()){

                //     let query = "select * from  hold_supplier_slots where "+
                //     "slotDate=? and slotTime ='"+i+"'";

                //     let data = await ExecuteQ.Query(req.dbName,query,[date]);

                //     if(data && data.length>0){
                //         for(const [index,i] of data.entries()){
                //             result.push(i)
                //         }
                           
                //         }
                //     }

                //     for(const [index,i] of result.entries()){
                //     logger.debug("======created_at==created_at====created_at=========",i.created_at)
                   
                //     let holdingTime = moment(new Date(i.created_at)).format("YYYY-MM-DD HH:mm:ss");

                //     let diff = moment.duration(moment(currentDateTime)
                //     .diff(moment(holdingTime)));

                //     diff = parseInt(diff.asMinutes());
                //     logger.debug("======holdingTime======currentDateTime=========",
                //     holdingTime,currentDateTime);
                //     if(diff<5){
                //         logger.debug("===========================diff=====",diff);
                //         let index = slots.indexOf(i.slotTime)
                //         logger.debug("===========================index=====",index,i.slotTime);
                //         if(index>0){
                //             logger.debug("=====index==slots===",index,JSON.stringify(slots));

                //             slots.splice(index,1);
                //             logger.debug("=====index==slots===",index,JSON.stringify(slots));

                //         }
                //     }

                //     }
                // }
                for(const [index,i] of AvailableSlots.entries()){
                    let timeslots = await  Universal.TimeSlots(i.start_time,i.end_time,interval);
                    logger.debug('========timeslots======',timeslots)
                    slots = slots.concat(timeslots)
                }
            
            slots = _.uniq(slots);

                sendResponse.sendSuccessData({table_booking_price:table_booking_price,
                    slots:slots,availableTables:availableTables}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        
            }else if (req.path=="/user/list_supplier_slots/v2"){

                if(AvailableSlots && AvailableSlots.length>0){


                    for(const [index,i] of AvailableSlots.entries()){

                        logger.debug('========{start_time:i.start_time,end_time:i.end_time}======',{start_time:i.start_time,end_time:i.end_time})

                        slots.push({start_time:i.start_time,end_time:i.end_time});
                    }
                }


                let s = []
                for(const [index,i] of slots.entries()){

                    let flag = false;

                    if(s && s.length>0){
                        for(const [x,j] of s.entries()){
                            if(i.start_time==j.start_time && i.end_time == j.end_time){
                                flag = true;
                            }
                        }
                        if(!flag){
                            s.push(i)
                        }

                    }else{
                        s.push(i)
                    }

                }

                sendResponse.sendSuccessData(s, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

            }else{
                if(AvailableSlots && AvailableSlots.length>0){


                    for(const [index,i] of AvailableSlots.entries()){
                        let timeslots = await  Universal.TimeSlots(i.start_time,i.end_time,interval);
                        logger.debug('========timeslots======',timeslots)
                        slots = slots.concat(timeslots)
                    }
                }
                slots = _.uniq(slots);
        
                sendResponse.sendSuccessData(slots, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        
            }
    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const getSlotsInterval = (dbName,date_order_type)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from supplier_slots_interval where booking_type=?";
            let result = await ExecuteQ.Query(dbName,query,[date_order_type]);
            logger.debug("======reult========",result)
            if(result && result.length>0){
                resolve(parseInt(result[0].interval));
            }else{
                resolve(30)
            }
            
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const getSlotsBufferTime = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select `key`,value from tbl_setting where `key`=?";
            let result = await ExecuteQ.Query(dbName,query,["schedule_time_buffer"]);
            logger.debug("======reult========",result)
            if(result && result.length>0){
                resolve(parseInt((result[0].value).toString()));
            }else{
                resolve(1)
            }
            
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const getAvailSlotsWithOrderType = (dbName, supplier_id, 
    date_order_type, latitude, longitude, date, seating_capacity) => {
    return new Promise(async (resolve, reject) => {
        try {
            let dayOfWeek = moment(date).day();

            /**for delivery type */
            if (parseInt(date_order_type) == 1) {
                /*
                check user lies in any geofence of supplier
                */
                let sql = "select st_contains(coordinates,point(?,?)) as is_under,id from supplier_location_availabilities ";
                sql += "where supplier_id=?  having is_under>0"
                let params = [latitude, longitude, supplier_id]
                let geoResult = await ExecuteQ.Query(dbName, sql, params);
                logger.debug("==========result========", geoResult)

                /**for geoResult delivery slots */
                if (geoResult && geoResult.length > 0) {
                    let availableDate = await supplierAvailableDatesAccToDate(dbName, supplier_id, date_order_type, geoResult[0].id, date)
                    
                    if(availableDate && availableDate.length>0){
                        let supplier_timings = await supplierSlotTimingsAccToDate(dbName, 
                            supplier_id, 1, geoResult[0].id, availableDate[0].id,dayOfWeek);
                        logger.debug("========suppliertimings==1==",supplier_timings)
                        resolve(supplier_timings);
                    }else{
                        let supplier_timings = await supplierSlotTimingsAccToDate(dbName, supplier_id, 1, geoResult[0].id, 0,dayOfWeek);
                        logger.debug("========suppliertimings==2==",supplier_timings)

                        resolve(supplier_timings);
                    }

                }
                /**for default delivery slots */
                else {
                    let availableDate = await supplierAvailableDatesAccToDate(dbName, supplier_id, 1, 0, date)
                    if(availableDate && availableDate.length>0){
                        let supplier_timings = await supplierSlotTimingsAccToDate(dbName, supplier_id, 1, 0, availableDate[0].id,dayOfWeek);
                        logger.debug("========suppliertimings==3==",supplier_timings);
                        
                        resolve(supplier_timings);
                    }else{
                        let supplier_timings = await supplierSlotTimingsAccToDate(dbName, supplier_id, 1, 0, 0,dayOfWeek);
                        resolve(supplier_timings);
                    }
                   
                }
            }
            /**for pickup type */
            else if (parseInt(date_order_type) == 2) {
                let availableDate = await supplierAvailableDatesAccToDate(dbName, supplier_id, 2, 0, date)
                if(availableDate && availableDate.length>0){
                    let supplier_timings = await supplierSlotTimingsAccToDate(dbName, supplier_id, 2, 0, availableDate[0].id,dayOfWeek);
                    resolve(supplier_timings);
                }else{
                    let supplier_timings = await supplierSlotTimingsAccToDate(dbName, supplier_id, 2, 0, 0,dayOfWeek);
                    resolve(supplier_timings);
                }


            }
            /**for dine in type */
            else {
                let availableDate = await supplierAvailableDatesAccToDate(dbName, supplier_id, 3, 0, date)
                if(availableDate && availableDate.length>0){
                    let supplier_timings = await supplierSlotTimingsAccToDate(dbName, supplier_id, 3, 0, availableDate[0].id,dayOfWeek);
                    resolve(supplier_timings);
                }else{
                    let supplier_timings = await supplierSlotTimingsAccToDate(dbName, supplier_id, 3, 0, 0,dayOfWeek);
                    resolve(supplier_timings);
                }

            }

        } catch (e) {
            logger.debug("==========err=+++++", e);
            reject(e)
        }
    })
}

const supplierSlotTimingsAccToDate = (dbName, supplier_id, date_order_type, supplier_location_id,
     date_id,dayOfWeek) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "";
            let params = "";
            let result;
            if(parseInt(date_id)!==0){  
                 query = "select id,supplier_id,status,start_time,end_time,date_id,day_id,`offset`,date_order_type,supplier_location_id,quantity,price from supplier_slot_timings ";
                query += "where supplier_id = ? and date_order_type=? and supplier_location_id=? and date_id=?";
                 params = [supplier_id, date_order_type, supplier_location_id, date_id];
                result = await ExecuteQ.Query(dbName, query, params);
            }else{
                 query = "select id,supplier_id,status,start_time,end_time,date_id,day_id,`offset`,date_order_type,supplier_location_id,quantity,price from supplier_slot_timings ";
                query += "where supplier_id = ? and date_order_type=? and supplier_location_id=? and day_id=? ";
    
                 params = [supplier_id, date_order_type, supplier_location_id,dayOfWeek];
                 result = await ExecuteQ.Query(dbName, query, params);
            }

             

            logger.debug("==============result======", result);

            let final_slots = [...result]

            if (result && result.length > 0) {

                for (const [index, i] of result.entries()) {

                    logger.debug("===========index and i=======", index, i);
                    var i_quantity = parseInt(i.quantity)
                    // if(is_decimal_quantity_allowed == "1"){
                    //     i_quantity = parseFloat(i.quantity)
                    // }
                    let multiWeeksCheck = ""
                    if(parseInt(date_id)==0){
                        multiWeeksCheck = " and day_id = "+dayOfWeek+""
                    }

                    if (i_quantity > 0) {
                        let query = "select count(id) as booked_slots from supplier_booked_slots where slot_id = ? "+multiWeeksCheck+" ";
                        let params = [i.id]
                        let results = await ExecuteQ.Query(dbName, query, params);
                        console.log("============results===", results, i_quantity,
                            parseInt(results[0].booked_slots), i_quantity <= parseInt(results[0].booked_slots))
                        if (i_quantity <= parseInt(results[0].booked_slots)) { 
                            console.log("==========before=============222======", final_slots)
                            let x = final_slots.findIndex(o=> o.id == i.id);
                            if(x>-1){
                                final_slots.splice(x, 1);

                            }
                            logger.debug("==========after=============3233======", final_slots)
                        }
                    }


                    if (index == result.length - 1) {
                        console.log("===final_slots=",final_slots)
                        resolve(final_slots);
                    }

                }

            }else{
                resolve([])
            }
        } catch (err) {
            logger.debug(err);
            reject(err)
        }
    })
}

const supplierAvailableDatesAccToDate = (dbName, supplier_id, date_order_type, supplier_location_id,date) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "select id,supplier_id,status,date_order_type,from_date,to_date,date_order_type,supplier_location_id from supplier_available_dates ";
                query += "where supplier_id = ? and date_order_type = ? and supplier_location_id=? and from_date=?";

            let params = [supplier_id,date_order_type,supplier_location_id,date];
            let result = await ExecuteQ.Query(dbName, query, params);
            resolve(result);
        } catch (err) {
            logger.debug(err);
            reject(err)
        }
    })
}


const timeSlots = (dbName,from,to,interval)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let from = "00:30:00";
            let to = "23:59:00";
            let interval = 30;
            let timeslots = Universal.TimeSlots(from,to,interval);
            resolve(timeslots);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}


const getSupplierAvailabilityAccToOrderType = async (req, res) => {
    try {
        let date_order_type = req.query.date_order_type
        let supplier_id = req.query.supplier_id
        let latitude = req.query.latitude
        let longitude = req.query.longitude

        /*
            date_order_type - 1 for delivery 2 for pickup and 3 for dinin
            1) if its 1 than check user lat long with geofence and if found
            particular geofence get its slots avalbilities other wise 
            get the default slots for delivery
            
            2) if its 2 check directly for pickup slots availibilities
            
            3) if its 3 check directly for dinin slots availibilities

        */
        let result = await getAvailWithOrderType(req.dbName, supplier_id, date_order_type, latitude, longitude);
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const getAvailWithOrderType = (dbName, supplier_id, date_order_type, latitude, longitude) => {
    return new Promise(async (resolve, reject) => {
        try {

            /**for delivery type */
            if (parseInt(date_order_type) == 1) {

                /*
                check user lies in any geofence of supplier
                */
                let sql = "select st_contains(coordinates,point(?,?)) as is_under,id from supplier_location_availabilities ";
                sql += " where supplier_id=? having is_under>0";
                let params = [latitude, longitude, supplier_id];
                let geoResult = await ExecuteQ.Query(dbName, sql, params);

                if (geoResult && geoResult.length > 0) {
                    let supplier_available_dates = await supplierAvailableDates(dbName, supplier_id, 1, geoResult[0].id);
                    let supplier_timings = await supplierSlotTimings(dbName, supplier_id, 1, geoResult[0].id);
                    let weeks_data = await supplierAvailability(dbName, supplier_id, 1, geoResult[0].id);
                    let supplier_slots_interval = await getSlotsInterval(dbName,date_order_type);
                    let schedule_time_buffer = await getSlotsBufferTime(dbName);

                    let query = "select name, email, phone from supplier where id = ?";
                    let params = [supplier_id];
                    let result = await ExecuteQ.Query(dbName, query, params);
                    let dataToSend = {
                        supplier_available_dates: supplier_available_dates,
                        supplier_timings: supplier_timings,
                        weeks_data: weeks_data,
                        supplier_slots_interval:supplier_slots_interval,
                        schedule_time_buffer:schedule_time_buffer,                                           
                        email: result[0].email,                                                  
                        name: result[0].name,
                        phone: result[0].phone
                    }
                    resolve(dataToSend);
                }
                /**for default delivery slots */
                else {
                    let supplier_available_dates = await supplierAvailableDates(dbName, supplier_id, 1, 0);
                    let supplier_timings = await supplierSlotTimings(dbName, supplier_id, 1, 0);
                    let weeks_data = await supplierAvailability(dbName, supplier_id, 1, 0);
                    let supplier_slots_interval = await getSlotsInterval(dbName,date_order_type);
                    let schedule_time_buffer = await getSlotsBufferTime(dbName);
                    let query = "select name, email, phone from supplier where id = ?";
                    let params = [supplier_id];
                    let result = await ExecuteQ.Query(dbName, query, params);
                    let dataToSend = {
                        supplier_available_dates: supplier_available_dates,
                        supplier_timings: supplier_timings,
                        weeks_data: weeks_data,
                        schedule_time_buffer:schedule_time_buffer, 
                        supplier_slots_interval:supplier_slots_interval,
                        email: result[0].email,
                        name: result[0].name,
                        phone: result[0].phone
                    }
                    resolve(dataToSend);
                }

            }
            /**for pickup type */
            else if (parseInt(date_order_type) == 2) {
                let supplier_available_dates = await supplierAvailableDates(dbName, supplier_id, 2, 0);
                let supplier_timings = await supplierSlotTimings(dbName, supplier_id, 2, 0);
                let weeks_data = await supplierAvailability(dbName, supplier_id, 2, 0);
                let supplier_slots_interval = await getSlotsInterval(dbName,date_order_type);
                let schedule_time_buffer = await getSlotsBufferTime(dbName);
                let query = "select name, email, phone from supplier where id = ?";
                let params = [supplier_id];
                let result = await ExecuteQ.Query(dbName, query, params);
                let dataToSend = {
                    supplier_available_dates: supplier_available_dates,
                    supplier_timings: supplier_timings,
                    weeks_data: weeks_data,
                    schedule_time_buffer:schedule_time_buffer, 
                    supplier_slots_interval:supplier_slots_interval,
                    email: result[0].email,
                    name: result[0].name,
                    phone: result[0].phone
                }
                resolve(dataToSend);

            }
            /**for dine in type */
            else {
                let supplier_available_dates = await supplierAvailableDates(dbName, supplier_id, 3, 0);
                let supplier_timings = await supplierSlotTimings(dbName, supplier_id, 3, 0);
                let weeks_data = await supplierAvailability(dbName, supplier_id, 3, 0);
                let supplier_slots_interval = await getSlotsInterval(dbName,date_order_type);
                let schedule_time_buffer = await getSlotsBufferTime(dbName);
                let query = "select name, email, phone from supplier where id = ?";
                let params = [supplier_id];
                let result = await ExecuteQ.Query(dbName, query, params);
                let dataToSend = {
                    supplier_available_dates: supplier_available_dates,
                    supplier_timings: supplier_timings,
                    weeks_data: weeks_data,
                    supplier_slots_interval:supplier_slots_interval,
                    email: result[0].email,
                    schedule_time_buffer:schedule_time_buffer, 
                    name: result[0].name,
                    phone: result[0].phone
                }
                resolve(dataToSend);
            }

        } catch (e) {
            logger.debug("==========err=+++++", e);
            reject(e)
        }
    })
}


const AddSupplierTables = async (req, res) => {
    try {
        let supplier_id  = req.body.supplier_id
        let table_number = req.body.table_number
        let table_name = req.body.table_name
        let seating_capacity = req.body.seating_capacity
        let branch_id = req.body.branch_id
        let query = "insert into supplier_tables (branch_id,supplier_id,table_number,table_name,seating_capacity) "
        query+= "values(?,?,?,?,?)";        
        let params = [branch_id,supplier_id,table_number,table_name,seating_capacity];
        await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const listSupplierTables = async (req, res) => {
    try {
        let supplier_id  = req.query.supplier_id
        let branch_id = req.query.branch_id
        let limit = req.query.limit 
        let offset = req.query.offset
        // let slot_id = req.query.slot_id!==undefined?req.query.slot_id:0
        
        // if(parseInt(slot_id)!==0){

        // }

        let query = "select st.id,st.supplier_id,st.table_number,st.table_name,st.seating_capacity,st.qr_code from supplier_tables st left join user_table_booked utb on utb.table_id = st.id "
        query+= "where st.supplier_id=? and st.branch_id=? and st.is_deleted=? group by st.id  limit ?,?";        
        let params = [supplier_id,branch_id,0,offset,limit];
        let result = await ExecuteQ.Query(req.dbName,query,params);
        
        let query1 = "select st.id,st.supplier_id,st.table_number,st.table_name,st.seating_capacity,st.qr_code from supplier_tables st left join user_table_booked utb on utb.table_id = st.id "
        query1+= "where st.supplier_id=? and st.branch_id=? and st.is_deleted=? group by st.id ";        
        let params1 = [supplier_id,branch_id,0];
        let result1 = await ExecuteQ.Query(req.dbName,query1,params1);

        let final = {
            list : result,
            count : result1 && result1.length>0?result1.length:0
        }

        sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const listSupplierTablesForUser = async (req, res) => {
    try {
        let supplier_id  = req.query.supplier_id
        let branch_id = req.query.branch_id
        let limit = req.query.limit 
        let offset = req.query.offset
        let slot_id = req.query.slot_id!==undefined?req.query.slot_id:0
        
        // if(parseInt(slot_id)!==0){

        // }

        let query = "select st.id,st.supplier_id,st.table_number,st.table_name,st.seating_capacity,st.qr_code from supplier_tables st left join user_table_booked utb on utb.table_id = st.id  and utb.slot_id !=? "
        query+= "where st.supplier_id=? and st.branch_id=? and st.is_deleted=? group by st.id  limit ?,?";        
        let params = [slot_id,supplier_id,branch_id,0,offset,limit];
        let result = await ExecuteQ.Query(req.dbName,query,params);
        
        let query1 = "select st.id,st.supplier_id,st.table_number,st.table_name,st.seating_capacity,st.qr_code from supplier_tables st left join user_table_booked utb on utb.table_id = st.id and utb.slot_id !=? "
        query1+= "where st.supplier_id=? and st.branch_id=? and st.is_deleted=? group by st.id ";        
        let params1 = [slot_id,supplier_id,branch_id,0];
        let result1 = await ExecuteQ.Query(req.dbName,query1,params1);

        let final = {
            list : result,
            count : result1 && result1.length>0?result1.length:0
        }

        sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const updateSupplierTables = async (req, res) => {
    try {
        let table_number = req.body.table_number
        let table_name = req.body.table_name
        let seating_capacity = req.body.seating_capacity
        let id = req.body.id

        let query = "update supplier_tables set table_number=?,table_name=?,seating_capacity=? "
        query+= "where id=?";        
        let params = [table_number,table_name,seating_capacity,id];
        await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const deleteSupplierTable = async (req, res) => {
    try {
        let id = req.body.id

        let query = "update supplier_tables set is_deleted=1 "
        query+= "where id=?";        
        let params = [id];
        await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const addTableQrCode = async (req, res) => {
    try {
        let id = req.body.id
        let qr_code = req.body.qr_code
        let query = "update supplier_tables set qr_code=? "
        query+= "where id=?";        
        let params = [qr_code,id];
        await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}
const addSupplierQrCode = async (req, res) => {
    try {
        let id = req.supplier.supplier_id || req.body.id;
        let qr_code = req.body.qr_code
        let query = "update supplier set qr_code=? "
        query+= "where id=?";        
        let params = [qr_code,id];
        await ExecuteQ.Query(req.dbName,query,params);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        console.log("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}
const addSupplierQrCodeByAdmin = async (req, res) => {
    try {
        let id =  req.body.id;
        let qr_code = req.body.qr_code
        let query = "update supplier set qr_code=? "
        query+= "where id=?";        
        let params = [qr_code,id];
        await ExecuteQ.Query(req.dbName,query,params);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        console.log("=======addSupplierQrCodeByAdmin====err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}
const listSupplierBokingRequests = async (req, res) => {
    try {
        let limit = req.query.limit 
        let offset = req.query.offset
        let is_supplier_request = req.path=="/supplier/user_booking_requests"?1:0
        let supplier_check = ""
        if(is_supplier_request){
            supplier_check = " where utb.supplier_id = "+req.supplier.supplier_id+" ";
        }
        let query = "select s.id as supplier_id,utb.branch_id,utb.order_id,utb.id,st.id as table_id,st.table_name,st.table_number,st.seating_capacity as table_seating_capacity, "
        query+="s.delivery_max_time,sb.branch_name,u.firstname as user_name,u.email as user_email,utb.status, "
        query+="utb.seating_capacity,utb.schedule_date,utb.schedule_end_date from user_table_booked utb join user u on u.id = utb.user_id "
        query+="left join supplier_tables st on st.id = utb.table_id join supplier s on s.id = utb.supplier_id "
        query+="join supplier_branch sb on sb.id = utb.branch_id "+supplier_check+" order by utb.id desc limit ?,? "
        let params = [offset,limit];
        let result = await ExecuteQ.Query(req.dbName,query,params);
        
        let query1 = "select utb.order_id,utb.id,st.id as table_id,st.table_name,st.table_number,st.seating_capacity as table_seating_capacity, "
        query1+="utb.seating_capacity,s.delivery_max_time,sb.branch_name,u.firstname as user_name,u.email as user_email,utb.status "
        query1+="from user_table_booked utb join user u on u.id = utb.user_id "
        query1+="left join supplier_tables st on st.id = utb.table_id join supplier s on s.id = utb.supplier_id "
        query1+="join supplier_branch sb on sb.id = utb.branch_id "+supplier_check+" order by utb.id desc "        
        let params1 = [];
        let result1 = await ExecuteQ.Query(req.dbName,query1,params1);

        let final = {
            list : result,
            count : result1 && result1.length>0?result1.length:0
        }

        sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const updateTableBookingStatus = async (req, res) => {
    try {
        let status = req.body.status
        let id = req.body.id
        let reason = req.body.reason || ""
        let user_id = ""
        var supplier_id
        let slotData = await ExecuteQ.Query(req.dbName,"select * from user_table_booked where id=?",[id])

        let userData = await ExecuteQ.Query(req.dbName,"select  u.email  from user_table_booked ut join user u on ut.user_id = u.id where ut.id = ?",[id])
       
        let slot_id = slotData[0].slot_id
         user_id = slotData[0].user_id
         var supplier_id = slotData[0].supplier_id
              console.log(supplier_id,"suplieridllllllllllllllllllllllllllllllllllllll")
        if(parseInt(status)==1){

            let schedule_date = slotData[0].schedule_date
            let booked_slots = moment(schedule_date).format('HH:MM:SS')
            let booked_date = moment(schedule_date).format('YYYY-MM-DD')
            let day_id =  moment(booked_date).day();
              
            if(!(parseInt(slotData[0].order_id)>0)){
            // add entry in supplier booked slots
            let query = "insert into supplier_booked_slots(day_id,supplier_id,order_id,user_id,slot_id,booked_slots,booked_date) values(?,?,?,?,?,?,?)"
            let params = [
                         day_id,
                          1,
                          0,
                          user_id,
                          slot_id,
                          booked_slots,
                          booked_date
                         ]
            await ExecuteQ.Query(req.dbName,query,params);
            }

        }
        let query = "update user_table_booked set status=?,reason=? "
        query+= "where id=?";        
        let params = [status,reason,id];
        await ExecuteQ.Query(req.dbName,query,params);

        let user_details = await ExecuteQ.Query(req.dbName,"select device_token	from user where id=?",[user_id]);
        let device_token = user_details[0].device_token==undefined?"":user_details[0].device_token

        let message = ""
        if(parseInt(status)==1){
            message = "your table booking is confirmed"
        }else if(parseInt(status)==2){
            message = "your table booking request has been rejected please check your mail for further details "
        }else{
            message = "your table booking is completed"
        }

        var data = {
            "type":"table_booking",
            "status": 0,
            "message":message,
            "table_request_id":id,
            "user_id":user_id
        }
let userEmail = userData[0].email
console.log(userEmail,"mailuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");




        const lib = require('../../lib/NotificationMgr')
        await lib.sendFcmPushNotification([device_token], data,req.dbName);

        await saveadminsNotifications(req.dbName,supplier_id,0,
            data.message,1,user_id,data.type);

            var subject = "your table has been rejected"
        var content = reason

            const func = require('../../routes/commonfunction');
            let smtpSqlSata=await Universal.smtpData(req.dbName);
            func.sendMailthroughSMTP(smtpSqlSata,res,subject,userEmail,content,0,function(err,result){
                if(err){
    
                    sendResponse.somethingWentWrongError(res);
                }else{
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                }
            });   







       
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

async function saveadminsNotifications(dbName,supplierId,orderId,message,status,user_id,type){
    return new Promise(async(resolve,reject)=>{
        try{
                var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status,is_admin,notification_type) values(?,?,?,?,?,?,?) ";
                let params = [user_id, supplierId, orderId, message, status,1,type]

                await ExecuteQ.Query(dbName,sql,params);
                resolve()
            
        }catch(e){
            logger.debug(e);
            resolve()
        }
    })
}
const lib = require('../../lib/NotificationMgr')


const makeTableBookingRequest = async (req, res) => {
    try {

        let request = req;
        let user_id = req.body.user_id
        let table_id = req.body.table_id==undefined?0:req.body.table_id
        let slot_id = req.body.slot_id ==undefined?0:req.body.slot_id
        let supplier_id = 0;
        let branch_id = 0;
        let seating_capacity = req.body.seating_capacity!==undefined?req.body.seating_capacity:0;
        let getTableDetails = await ExecuteQ.Query(req.dbName,"select * from supplier_tables where id=?",[table_id]);
        supplier_id = req.body.supplier_id==undefined?0:req.body.supplier_id
        branch_id = req.body.branch_id==undefined?0:req.body.branch_id
        if(getTableDetails && getTableDetails.length>0){
            supplier_id = getTableDetails[0].supplier_id
            branch_id = getTableDetails[0].branch_id
            seating_capacity=seating_capacity==0?getTableDetails[0].seating_capacity:seating_capacity
        }

        
        let schedule_date = req.body.schedule_date==undefined || req.body.schedule_date==""?"0000-00-00 00:00:00":req.body.schedule_date
        let schedule_end_date  = req.body.schedule_end_date==undefined || req.body.schedule_end_date==""?"0000-00-00 00:00:00":req.body.schedule_end_date
        // await checkSupplierTableDateTime(req.dbName,table_id,schedule_date,res);

        let dbName = request.dbName;
        let unique_id = request.body.gateway_unique_id != undefined ? (request.body.gateway_unique_id).toLowerCase() : "";
        let amount = request.body.amount || 0;
        // in case of mumybene gateway need customer mobile number
        let phoneNumber = request.body.mobile_no;
        let payment_source = "";
        let payment_status = 1;
        let card_id = request.body.card_id==undefined?"":request.body.card_id;
        let customer_payment_id = request.body.customer_payment_id==undefined?"":request.body.customer_payment_id;
        let payment_token=request.body.payment_token;
        let myFatoorahInvoiceId=request.body.invoiceId;
        let card_payment_id=""
        var transaction_id="";
        let countryCode = ""
        let zelle_receipt_url = request.body.payment_token!==undefined && request.body.payment_token!==null?request.body.payment_token:""
        let languageId = request.body.languageId || 14;
        let currency=request.body.currency!=undefined?request.body.currency:"usd";
        let cartId = request.body.cartId
        // let user_id = request.users!=undefined?request.users.id:request.body.user_id;
        let comment = request.body.comment==undefined?"":request.body.comment
        let by_admin = 0
        // logger.debug("=======request.path==========",request.path);
        // var userData = await Universal.getUserData(request.dbName, request.headers.authorization);
        let userWalletDetails = await ExecuteQ.Query(request.dbName,"select wallet_amount from user where access_token = ?",[request.headers.authorization]);

        try{
            let userData = await Universal.getUserData(dbName,request.headers.authorization);
            



            let table_book_mac_theme = await ExecuteQ.Query(dbName,
                "select `key`,value from tbl_setting where `key`=? and value='1'",
                ["table_book_mac_theme"]);

                if(table_book_mac_theme && table_book_mac_theme.length>0 &&  parseFloat(amount)>0){

                if((unique_id)==config.get("payment.mumybene.unique_id")){
                    payment_source="mumybene";
                    let mumybene_key_data=await Universal.getMumybeneKeyData(dbName);
                    if(mumybene_key_data){
                        
                        var mumybene_username = mumybene_key_data[config.get("payment.mumybene.mumybene_username")]
                        var mumybene_password = mumybene_key_data[config.get("payment.mumybene.mumybene_password")]
                        // var phoneNumber = request.body.mobile_no;// ? request.body.mobile_no : "0954755348";
                        var service_provider = request.body.service_provider;// ? request.body.mobile_no : "0954755348";
                        var paymentReference = "order_" + (+ new Date()); //"Testabc0112";
                        
                        var transactionAmount = orderNetAmount//"100";
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
                            <kon:processCustomerPayment>
                            <transactionAmount>`+transactionAmount+`</transactionAmount>
                            <customerMobile>`+phoneNumber+`</customerMobile>
                            <paymentReference>`+paymentReference+`</paymentReference>
                            </kon:processCustomerPayment>
                            </soapenv:Body>
                            </soapenv:Envelope>`;
                        var options = { method: 'POST',
                            url: baseUrl,
                            headers: {
                            'Content-Type':'text/xml;charset=utf-8',
                            'Accept-Encoding': 'gzip,deflate',
                            'Content-Length':xml.length
                            },
                            body:xml,
                            timeout: 60000
                        };
                        
                        web_request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
                            
                            if(error){
                                if(error.code=="ESOCKETTIMEDOUT"){


                                    let xml1 =`<soapenv:Envelope
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
                                        <kon:queryCustomerPayment>
                                        <paymentReference>`+paymentReference+`</paymentReference>
                                        </kon:queryCustomerPayment>
                                        </soapenv:Body>
                                        </soapenv:Envelope>`;
                                    var options1 = { method: 'POST',
                                        url: "http://test.543.cgrate.co.zm:55555/Konik/KonikWs",
                                        headers: {
                                        'Content-Type':'text/xml;charset=utf-8',
                                        'Accept-Encoding': 'gzip,deflate',
                                        'Content-Length':xml1.length
                                        },
                                        body:xml1
                                    };
                                    
                             web_request(options1,async function (error1, response1, body1) {
                                        
                                        if(error1){
                                            
                                            return  sendResponse.sendErrorMessage(
                                                await Universal.getMsgText(
                                                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                                reply,400);
                                        }else if (!error1 && response1.statusCode == 200) {
                                            
                                            var xml2js1 = require('xml2js');
                                            var parser1 = new xml2js1.Parser({explicitArray: false, trim: true});
                                            parser1.parseString(body1,async (err1, result1) => {
                                                
                                                var responseCode1 = result1['env:Envelope']['env:Body']['ns2:queryCustomerPaymentResponse']['return']['responseCode']           
                                                if(responseCode1 == "0"){
                                                    var paymentID1 = result1['env:Envelope']['env:Body']['ns2:queryCustomerPaymentResponse']['return']['paymentID']
                                                    card_payment_id=paymentID1
                                                    transaction_id=paymentReference
                                                    payment_source="543 ("+service_provider+")"
                                                    payment_status=1

                                        await bookTable(req.dbName,branch_id,user_id,table_id,
                                            slot_id,schedule_date,schedule_end_date,
                                            supplier_id,amount,payment_source,
                                            zelle_receipt_url,1,seating_capacity,req);
                                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
                                
                                                }else{
                                                    return  sendResponse.sendErrorMessage("Timeout: You did not respond to the prompt on your phone in time, please try again.",reply,400);
                                                }
                                            });                                
                                        }else{
                                            return  sendResponse.sendErrorMessage(
                                                await Universal.getMsgText(
                                                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                                reply,400);
                                        }
                                    });
                                }else{
                                    return  sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                                }
                            }else if (!error && response.statusCode == 200) {
                                var xml2js = require('xml2js');
                                var parser = new xml2js.Parser({explicitArray: false, trim: true});
                                console.log("parser -- ",JSON.stringify(parser))
                                parser.parseString(body, (err, result) => {
                                    var responseCode = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['responseCode']  
                                    console.log("responseCode ==== ",responseCode)
                                    if(responseCode == "0"){
                                        var paymentID = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['paymentID']
                                        card_payment_id=paymentID
                                        transaction_id=paymentReference
                                        payment_source="543 ("+service_provider+")"
                                        payment_status=1
                                        console.log("11111111111111111111111111111",paymentReference)
                                        callback(null)
                                    }else{
                                        //var responseMessage = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['responseMessage']
                                        var responseMessage = "";
                                        if(responseCode == "17"){
                                            // responseMessage = "Timeout: You did not respond to the prompt on your phone in time, please try again.";
                                            responseMessage = "This transaction has timedout, please try again.";
                                        }
                                        else if(responseCode == "1"){
                                            responseMessage = "Insufficient funds: It appears your account has insufficient funds, please choose a different payment method"
                                        }
                                        else if(responseCode == "79"){
                                            responseMessage = "You're not currently registered to make payments. To register follow the instructions below:\n1. Add +260211840008 as a WhatsApp contact \n 2. Send “Hello” and follow the instructions \n"
                                        }
                                        else if(responseCode == "6"){
                                            responseMessage = "You're not currently registered to make payments. To register follow the instructions below:\n1. Add +260211840008 as a WhatsApp contact \n 2. Send “Hello” and follow the instructions \n"
                                        }
                                        else{
                                            responseMessage = "Sorry, an error occurred. Please try again"
                                        }
                                        console.log(responseCode,"---------responseMessage ------------------- ",responseMessage)
                                        
                                        return  sendResponse.sendErrorMessage(responseMessage,reply,400);
                                    }
                                });                                
                            }else{
                                console.log("0101010101010101010101010101010101010101")
                                return  sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                        });
                    }else{
                        console.log("1212121212121212121212121212121212121212")
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                            languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }
                }
                else if((unique_id)==config.get("payment.strip.unique_id")){
                    payment_source="stripe";
                    logger.debug("2222222222+===========request.dbName============",dbName)
                    let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
                    // logger.debug("111111111111111==card_id=customer_payment_id=STRIP=DATA==>>",card_id,customer_payment_id,strip_secret_key_data,Math.round(parseFloat(productList[0].net_amount*100)))
                    if(strip_secret_key_data && strip_secret_key_data.length>0){
                        const stripe = require('stripe')(strip_secret_key_data[0].value);
                        let payment_object = {};
                        if(customer_payment_id !=="" && card_id!==""){
                            payment_object = {
                                amount: Math.round(parseFloat(amount*100)),
                                currency: currency,
                                source: card_id,
                                customer:customer_payment_id,
                                capture:true,
                                description: '('+ userData[0].email +') Made an booking',
                            }
                        }else{
                            payment_object = {
                                amount: Math.round(parseFloat(amount*100)),
                                currency: currency,
                                source: payment_token,
                                capture:true,
                                description: '('+userData[0].email+') Made an booking',
                            }
                        }
                        console.log("payment_object === ",payment_object)
                        stripe.charges.create(payment_object,async function(err, charge) {
                                console.log("==Payment===ERR!==>>",err);
                                    if(err){
                                        let msg=config.get("error_msg.payment.error");
                                        switch (err.type) {
                                            case 'StripeCardError':
                                              // A declined card error
                                              msg=err.message; // => e.g. "Your card's expiration year is invalid."
                                              break;
                                            case 'StripeRateLimitError':
                                              // Too many requests made to the API too quickly
                                              break;
                                            case 'StripeInvalidRequestError':
                                              // Invalid parameters were supplied to Stripe's API
                                              msg=err.message
                                              break;
                                            case 'StripeAPIError':
                                              // An error occurred internally with Stripe's API
                                              break;
                                            case 'StripeConnectionError':
                                              // Some kind of error occurred during the HTTPS communication
                                              break;
                                            case 'StripeAuthenticationError':
                                              // You probably used an incorrect API key
                                              break;
                                            default:
                                              // Handle any other types of unexpected errors
                                              msg=config.get("error_msg.payment.error");
                                              break;
                                          }

                                        console.log("==Payment===ERR!==>>",err,msg);
                                        return  sendResponse.sendErrorMessage(
                                        msg,
                                        res,400);
                                    }
                                    else{
                                        card_payment_id=charge.id
                                        payment_status=1
                                        await bookTable(req.dbName,branch_id,
                                            user_id,table_id,slot_id,schedule_date,
                                            schedule_end_date,supplier_id,amount,
                                            payment_source,zelle_receipt_url,1,seating_capacity,req);
                             sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);


                                    }
                                }
                            );
                    }
                    else{
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                            languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }

                }
                else if((unique_id)==config.get("payment.authorize_net.unique_id")){
                    payment_source="authorize_net";
                    let authorize_net_key_data = await Universal.getAuthorizeNetKeys(request.dbName)
                    let base_url = process.env.NODE_ENV == 'prod'?'https://api.authorize.net/xml/v1/request.api':'https://apitest.authorize.net/xml/v1/request.api'
                    let expirationDate = request.body.expirationDate
                    let ref_id = "ref_id_"+randomstring.generate({
                        length: 5,
                        charset: 'alphanumeric'
                    }).toUpperCase();
                    if(Object.keys(authorize_net_key_data).length>0){
                        let body = {};
                        let authnet_profile_id = request.body.authnet_profile_id!==undefined?request.body.authnet_profile_id:"";
                        let authnet_payment_profile_id = request.body.authnet_payment_profile_id!==undefined?request.body.authnet_payment_profile_id:"";
                       
                        if(authnet_profile_id!=="" && authnet_payment_profile_id!==""){
                            body = {
                                "createTransactionRequest": {
                                    "merchantAuthentication": {
                                        "name": authorize_net_key_data[config.get("payment.authorize_net.api_login_id")],
                                        "transactionKey": authorize_net_key_data[config.get("payment.authorize_net.transaction_key")]
                                    },
                                    "refId": ref_id,
                                    "transactionRequest": {
                                        "transactionType": "authCaptureTransaction",
                                        "amount": Math.round(parseFloat(orderNetAmount)),
                                          "profile": {
                                              "customerProfileId": authnet_profile_id,
                                              "paymentProfile": { "paymentProfileId": authnet_payment_profile_id }
                                          }
                                    }
                                }
                            }

                        console.log("========body to send==========",body,
                        body.createTransactionRequest.transactionRequest.profile)

                        console.log("=======JSON.stringify(body)==========",JSON.stringify(body))
                        var options = {
                            'method': 'POST',
                            'url':base_url,
                            'headers': {
                                'Content-Type': 'application/json'
                            },
                            body:body,
                            json:true
                        };
                        web_request(options, async function (error, response,body) {
                            console.log("====Body=====",error,body)
                            if(error){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                payment_status=1;
                                let result = body.trim();
                                result = JSON.parse(result)
                                console.log(result,"-------------------------llllllll")
                                logger.debug(result)
                                
                                if(result.messages.resultCode=="Error"){
                                    let errorMsg = result.messages.message[0].text
                                    sendResponse.sendErrorMessage(errorMsg,reply,400);
                                }else if (result.messages.resultCode=="Ok"){
                                    card_payment_id=result.transactionResponse.transId;
                                    await bookTable(req.dbName,branch_id,
                                        user_id,table_id,slot_id,schedule_date,
                                        schedule_end_date,supplier_id,amount,
                                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                               sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                                }else{
                                    let errorMsg = "something went wrong during payment"
                                    sendResponse.sendErrorMessage(errorMsg,reply,400);
                                }
                            }
                        })
                        }else{
                                let errorMsg  = "authnet_profile_id or authnet_payment_profile_id not found"
                            sendResponse.sendErrorMessage(errorMsg,reply,400);

                            // body = {
                            //     "createTransactionRequest": {
                            //         "merchantAuthentication": {
                            //             "name": authorize_net_key_data[config.get("payment.authorize_net.api_login_id")],
                            //             "transactionKey": authorize_net_key_data[config.get("payment.authorize_net.transaction_key")]
                                    
                            //         },
                            //         "refId":ref_id,
                            //         "transactionRequest": {
                            //             "transactionType": "authCaptureTransaction",
                            //             "amount": Math.round(parseFloat(orderNetAmount)),
                            //             "payment": {
                            //                 "creditCard": {
                            //                     "cardNumber": paymentToken,
                            //                     "expirationDate": expirationDate
                            //                 }
                            //             },
                            //             "billTo": {
                            //                 "firstName": userData[0].name,
                            //             }
                            //         }
                            //     }
                            // }
                        }


                    }
                    else{
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }
                }
                else if((unique_id)==config.get("payment.peach.unique_id")){
                    payment_source="peach";
                    let peach_secret_key_data=await Universal.getPeachSecretKey(request.dbName);
                    
                    //if(peach_secret_key_data && peach_secret_key_data.length>0){
                    if(Object.keys(peach_secret_key_data).length>0){
                        console.log("customer_payment_id ========== ",customer_payment_id)
                        
                        let url = "https://test.oppwa.com/v1/registrations/"+customer_payment_id+"/payments";
                        let headers= {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization':'Bearer '+peach_secret_key_data[config.get("payment.peach.peach_auth_token")] //OGFjN2E0Yzk3MTEyOWYyMjAxNzExNjI2YWYxYjA4N2J8SlpSeFljNnRtbg==' 
                        };
                        var amountForPeachSandbox =parseInt(orderNetAmount)
                        let obj ={
                            'entityId': peach_secret_key_data[config.get("payment.peach.peach_entityid")],//'8ac7a4c771129f2401711626cae30c42',
                            'amount': amountForPeachSandbox,//orderNetAmount,
                            'currency':currency,
                            'paymentType':'PA'
                        };

                        var options = {
                            method: 'POST',
                            url: url,
                            headers:headers,
                            form: obj,
                            json: true 
                        };
                        web_request(options, async function (error, response,body) {
                            console.log(error,"##############################################################", JSON.stringify(body))
                            if(error){
                                console.log("11111111111111111 error ----- ",error)
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                payment_status=1
                                card_payment_id = body.id;

                                await bookTable(req.dbName,branch_id,
                                    user_id,table_id,slot_id,schedule_date,
                                    schedule_end_date,supplier_id,amount,
                                    payment_source,zelle_receipt_url,1,seating_capacity,req);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                            }
                        });
                        

                    }
                    else{
                        console.log("222222222222222222222error ----- ",error)
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }

                }
                else if((unique_id)==config.get("payment.paystack.unique_id")){
                    payment_source="paystack";
                    let paystack_secret_key_data=await Universal.getPaystackSecretKey(request.dbName);
                    logger.debug("====STRIP=DATA==>>",paystack_secret_key_data,Math.round(parseFloat(productList[0].net_amount*100)))

                    if(paystack_secret_key_data && paystack_secret_key_data.length>0){
                        var options = {
                            method: 'GET',
                            url: 'https://api.paystack.co/transaction/verify/'+payment_token+'',
                            headers: {
                                Authorization: 'Bearer '+paystack_secret_key_data[0].value+''
                            }
                        };
                        web_request(options,async function (err, response, body) {
                            logger.debug("====Err!==",err)
                            if(err){
                                return sendResponse.sendErrorMessage(
                                    Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                logger.debug("===BoDY===>>==",JSON.parse(body));
                                let verifyData=JSON.parse(body);
                                if(verifyData.data.status=="success"){
                                    payment_status=1;
                                    card_payment_id=verifyData.data.reference;
                                    await bookTable(req.dbName,branch_id,
                                        user_id,table_id,slot_id,schedule_date,
                                        schedule_end_date,supplier_id,amount,
                                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                                 sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                                }
                                else{
                                    return sendResponse.sendErrorMessage(
                                        Universal.getMsgText(
                                            languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                        reply,400);
                                }

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
                else if((unique_id)==config.get("payment.payuLatam.unique_id")){
                    payment_source="payuLatam";
                    logger.debug("========unique_id unique_id====",unique_id)   
                    let payuLatam_api_key_data = await Universal.getpayuLatamApiKey(request.dbName);
                    let payuLatam_api_loginkey_data  = await Universal.getpayuLatamApiLoginkey(request.dbName);
                    let payuLatam_api_merchant_data  = await Universal.getpayuLatamMerchantId(request.dbName);
                    let payuLatam_api_account_data   = await Universal.getpayuLatamAccountId(request.dbName);
                    let payuLatam_basic_auth_data   = await Universal.getpayuLatamSecretKey(request.dbName);

                    logger.debug("========userCards===",userData)
                    if(payuLatam_api_key_data && payuLatam_api_key_data.length>0 && payuLatam_api_loginkey_data && payuLatam_api_loginkey_data.length>0){
                    
                        let userCards = await checkUserCards(request.dbName, userData[0].id, payment_source);
                        logger.debug("========userCards===",userCards)   

                        let payment_object = {};
                        // if(customer_payment_id !=="" && card_id!==""){
                            payment_object = {
                                "amount": Math.round(parseFloat(orderNetAmount*100)),
                                "currency"     : currency,
                                "customer_token" : userCards[0].card_id,
                                "customer"    : userCards[0].customer_payment_id,
                                "capture"        :true,
                                "description"    : '('+userData[0].email+') Make an order',
                                "firstName"      :   userData[0].firstname,
                                "lastName"       :   userData[0].lastname,
                                "email"          :   userData[0].email,
                                "address"        :   userData[0].customer_address,
                                "payment_method" :  userCards[0].card_type,
                                "ip_address"     : "157.36.245.5",
                            }
                        // }else{
                        //     payment_object = {
                        //         amount: Math.round(parseFloat(orderNetAmount*100)),
                        //         currency: currency,
                        //         source: payment_token,
                        //         capture:true,
                        //         description: '('+userData[0].email+') Made an booking',
                        //     }
                        // }
                        
                       
                        var payment_result =  await  authorizeAndCapturePayment( payment_object,  payuLatam_api_loginkey_data[0].value,  payuLatam_api_key_data[0].value,  payuLatam_api_merchant_data[0].value, payuLatam_api_account_data[0].value, payuLatam_basic_auth_data[0].value)
                       
                        if(payment_result.transactionResponse.state != 'DECLINED'){
                            if( payment_result.transactionResponse.state == 'APPROVED'){
                                payment_status =  1;
                                card_payment_id = payment_result.transactionResponse.transactionId;
                            }else if(payment_result.transactionResponse.state == 'PENDING'){
                                payment_status = 0;
                                card_payment_id = payment_result.transactionResponse.transactionId;
                            }
                            else if(payment_result.transactionResponse.state == 'SUBMITTED'){
                                payment_status = 0;
                                card_payment_id = payment_result.transactionResponse.transactionId;
                            }

                            await bookTable(req.dbName,branch_id,
                                user_id,table_id,slot_id,schedule_date,
                                schedule_end_date,supplier_id,amount,
                                payment_source,zelle_receipt_url,1,seating_capacity,req);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                        }else{
                                payment_status = 0;
                                let msg =payment_result.transactionResponse.responseMessage;
                                console.log("*********msg", msg);
                                return sendResponse.sendErrorMessage(msg,reply,400);

                        }
                      
                    }
                    else{
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                            languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }

                }
                else if((unique_id)==config.get("payment.conekta.unique_id")){
                    let conekta_data=await Universal.getConektaSecretKey(request.dbName);
                    let userData=await Universal.getUserData(request.dbName,request.headers.authorization);
                    payment_source="conekta";
                    logger.debug("=====conekta_data===USR==DAT!==>>>",productList[0].net_amount,conekta_data,userData)

                    if(conekta_data && conekta_data.length>0){
                        let conekta = require('conekta');
                        conekta.api_key = conekta_data[0].value;
                        conekta.locale = 'es';
                        conekta.Order.create({
                            "currency": "MXN",
                            "customer_info": {
                                "name": userData[0].name,
                                "phone": userData[0].mobile_no,
                                "email": userData[0].email
                            },
                            "line_items": [{
                                "name": userData[0].name,
                                "unit_price":Math.round(parseFloat(orderNetAmount*100)),
                                "quantity": 1
                            }],
                            "shipping_lines": [
                                {
                                    "amount": 0
                                }
                            ],
                            "shipping_contact": {
                                    "address": {
                                        street1:userData[0].customer_address,
                                        city: userData[0].customer_address,
                                        state: userData[0].address_line_2,
                                        postal_code: "78215",
                                        country: userData[0].customer_address,
                                        residential: true,
                                        object: "shipping_address"
                                    }
                            },
                            "charges": [
                                {
                                "payment_method": {
                                        "type": "card",
                                        "token_id": payment_token
                                }
                            }]
                            }).then(async function (result) {
                                    logger.debug("JSON==Object==>",result.toObject());
                                    card_payment_id=result.toObject().id;
                                    payment_status=1

                                    await bookTable(req.dbName,branch_id,
                                            user_id,table_id,slot_id,schedule_date,
                                            schedule_end_date,supplier_id,amount,
                                            payment_source,zelle_receipt_url,1,seating_capacity,req);

                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                            }, async function (error) {
                                logger.debug("=======ERR!=====",error);
                                    return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                    languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            })
                    }
                    else{
                        return sendResponse.sendErrorMessage(
                           await Universal.getMsgText(
                            languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }
                }
                else if((unique_id)==config.get("payment.razorpay.unique_id")){
                    payment_source="razorpay";
                    let razor_pay_data=await Universal.getRazorPayData(request.dbName);
                    logger.debug("======razor_pay_data=net_amount====>>",razor_pay_data,productList[0].net_amount*100)
                    if( Object.keys(razor_pay_data).length>0){
                        web_request({
                            method: 'POST',
                            url: "https://"+razor_pay_data[config.get("payment.razorpay.publish_key")]+":"+razor_pay_data[config.get("payment.razorpay.secret_key")]+"@api.razorpay.com/v1/payments/"+payment_token+"/capture",
                            form: {
                                amount: (orderNetAmount)*100,
                                currency: "INR"
                            }
                        }, async function (error, response, body) {
                            logger.debug("===RazorPayError====",error)
                            // console.log('Status:', response.statusCode);
                            // console.log('Headers:', JSON.stringify(response.headers));
                            // console.log('Response:', body);
                            if(error){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                payment_status=1
                                await bookTable(req.dbName,branch_id,
                                    user_id,table_id,slot_id,schedule_date,
                                    schedule_end_date,supplier_id,amount,
                                    payment_source,zelle_receipt_url,1,seating_capacity,req);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

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

                else if((unique_id)==config.get("payment.razorpay.unique_id")){
                    payment_source="razorpay";
                    let razor_pay_data=await Universal.getRazorPayData(request.dbName);
                    logger.debug("======razor_pay_data=net_amount====>>",razor_pay_data,productList[0].net_amount*100)
                    if( Object.keys(razor_pay_data).length>0){
                        web_request({
                            method: 'POST',
                            url: "https://"+razor_pay_data[config.get("payment.razorpay.publish_key")]+":"+razor_pay_data[config.get("payment.razorpay.secret_key")]+"@api.razorpay.com/v1/payments/"+payment_token+"/capture",
                            form: {
                                amount: (orderNetAmount)*100,
                                currency: "INR"
                            }
                        }, async function (error, response, body) {
                            logger.debug("===RazorPayError====",error)
                            // console.log('Status:', response.statusCode);
                            // console.log('Headers:', JSON.stringify(response.headers));
                            // console.log('Response:', body);
                            if(error){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                payment_status=1
                                await bookTable(req.dbName,branch_id,
                                    user_id,table_id,slot_id,schedule_date,
                                    schedule_end_date,supplier_id,amount,
                                    payment_source,zelle_receipt_url,1,seating_capacity,req);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
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

                
                else if((unique_id)==config.get("payment.myfatoorah.unique_id")){
                    
                    card_payment_id = payment_token;
                    payment_status=1
                    payment_source="myfatoorah"
                    transaction_id=myFatoorahInvoiceId

                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)=="urway"){
                    
                    card_payment_id = payment_token;
                    payment_status=1
                    payment_source="urway"

                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                 sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)=="aamarpay"){
                    
                    payment_source = "aamarpay";
                    card_payment_id = payment_token;
                    payment_status=1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,payment_source,zelle_receipt_url,1,req);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)=="hyperpay"){
                    
                    payment_source = "hyperpay";
                    card_payment_id = payment_token;
                    payment_status=1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)=="telr"){
                    
                    payment_source = "telr";
                    card_payment_id = payment_token;
                    payment_status=1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,payment_source,zelle_receipt_url,1,req);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                
                else if((unique_id)=="datatrans"){
                    
                    payment_source = "datatrans";
                    card_payment_id = payment_token;
                    payment_status=1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)==config.get("payment.payhere.unique_id")){
                    
                    card_payment_id = payment_token;
                    payment_status=1
                    payment_source="payhere"
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)==config.get("payment.converge.unique_id")){
                    
                    card_payment_id = payment_token;
                    payment_status=1
                    payment_source="converge"
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)==config.get("payment.tap.unique_id")){
                    payment_source = "tap";
                    card_payment_id = payment_token;
                    payment_status = 1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)==config.get("payment.mPaisa.unique_id")){
                    payment_source = "mPaisa";
                    card_payment_id = payment_token;
                    payment_status = 1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)=="sadadqa"){
                    payment_source = "sadadqa";
                    card_payment_id = payment_token;
                    payment_status = 1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
                }
                else if((unique_id)=="transbank"){
                    payment_source = "transbank";
                    card_payment_id = payment_token;
                    payment_status = 1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,
                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }else if((unique_id)=="paymaya"){
                    payment_source = "paymaya";
                    card_payment_id = payment_token;
                    payment_status = 1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,payment_source,zelle_receipt_url,1,seating_capacity,req);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)==config.get("payment.windcave.unique_id")){
                    payment_source = "windcave";
                    card_payment_id = payment_token;
                    payment_status = 1
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,payment_source,zelle_receipt_url,1,seating_capacity,req);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }
                else if((unique_id)==config.get("payment.paypal.unique_id")){
                    payment_source="paypal";
                    let paypal_api=process.env.NODE_ENV == 'prod'?'https://api.paypal.com':'https://api.sandbox.paypal.com'
                    let paypal_data=await Universal.getPaypalData(request.dbName);
                    logger.debug("========paypal==API==",paypal_api,paypal_data)
                    if(Object.keys(paypal_data).length>0){
                        let tokenData=await Universal.getAuthTokeOfPayPal(paypal_data[config.get("payment.paypal.client_key")],paypal_data[config.get("payment.paypal.secret_key")]);
                        var options = {
                            'method': 'POST',
                            'url': paypal_api+'/v2/checkout/orders/'+payment_token+'/capture',
                            'headers': {
                                'Authorization': 'Bearer '+tokenData.access_token,
                                // 'PayPal-Request-Id': '7b92603e-77ed-4896-8e78-5dea2050476a',
                                'Content-Type': 'application/json'
                            }
                        };
                        web_request(options, async function (error, response,body) {
                            logger.debug("====Body=====",error,body)
                            if(error){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                payment_status=1
                                card_payment_id = payment_token;
                                await bookTable(req.dbName,branch_id,
                                    user_id,table_id,slot_id,schedule_date,
                                    schedule_end_date,supplier_id,amount,payment_source,zelle_receipt_url,1,seating_capacity,req);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

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

                else if((unique_id)==config.get("payment.checkout.unique_id")){
                    payment_source="checkout";
        
                    let checkout_data=await Universal.getCheckoutSecretKey(request.dbName);
                    logger.debug("======razor_pay_data=net_amount====>>",checkout_data)
                    if( Object.keys(checkout_data).length>0){
                        var headers = {
                            'Accept': 'application/json',
                            'Authorization': checkout_data[config.get("payment.checkout.secret_key")]//'sk_test_a7d262c3-15fd-4564-8aca-9e45ed879f57'
                        };

                        //console.log("headers ============= ",headers)
                        
                        var dataString = {
                            "source": {
                                "type": "token",
                                "token": payment_token//"tok_4gzeau5o2uqubbk6fufs3m7p54"
                            },
                            //"amount": amount,//6500,
                            "amount": parseFloat(orderNetAmount),
                            "currency": currency,//"USD",
                            "reference": request.body.cartId ? request.body.cartId : '',//"ORD-5023-4E89",
                            "metadata": {
                                "card_id": card_id,
                                "customer_payment_id": customer_payment_id
                            }
                        };
                        console.log("dataString ============= ",dataString)
                        let checkout_api_url = (process.env.NODE_ENV == 'prod') ? 'https://api.checkout.com/payments' : 'https://api.sandbox.checkout.com/payments';
                        console.log("options ------- ------ ------ ",{
                            method: 'POST',
                            //url: "https://api.sandbox.checkout.com/payments",
                            url: checkout_api_url,
                            headers: headers,
                            form: dataString
                        })
                        web_request({
                            method: 'POST',
                            //url: "https://api.sandbox.checkout.com/payments",
                            url: checkout_api_url,
                            headers: headers,
                            form: dataString
                        }, async function (error, response, body) {
                            // console.log("1#########################################################")
                            // logger.debug("=== Checkout ====",error)
                            // console.log("2#########################################################")
                            // console.log(error)
                            // console.log("3#########################################################")
                            // console.log(response)
                            // console.log("4#########################################################")
                            // console.log(body)
                            // console.log("5#########################################################")
                            if(error){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                card_payment_id=body.id;
                                payment_status=1
                                await bookTable(req.dbName,branch_id,
                                    user_id,table_id,slot_id,schedule_date,
                                    schedule_end_date,supplier_id,amount,payment_source,
                                    zelle_receipt_url,1,seating_capacity,req);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

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
                
                else if((unique_id)==config.get("payment.venmo.unique_id")){
                    payment_source="venmo";
                    let braintree_data=await Universal.getBraintreeData(request.dbName);
                    logger.debug("========braintree_data==API==",braintree_data);

                    if(Object.keys(braintree_data).length>0){
                        var braintree = require("braintree");
                        var gateway = braintree.connect({
                            environment:process.env.NODE_ENV == 'prod'? braintree.Environment.Production:braintree.Environment.Sandbox,
                            merchantId: braintree_data[config.get("payment.venmo.merchant_id")],
                            publicKey: braintree_data[config.get("payment.venmo.public_key")],
                            privateKey: braintree_data[config.get("payment.venmo.private_key")]
                        });

                        gateway.transaction.sale({
                            amount: orderNetAmount,
                            paymentMethodNonce: payment_token,
                            options: {
                                submitForSettlement: true
                            },
                            deviceData: {}
                        }, async function(err,result) {
                            if(err){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                if (result.success) {
                                    logger.debug("===braintree===response Id==>>>", result)
                                    card_payment_id = result.transaction.id;
                                    payment_status=1
                                    await bookTable(req.dbName,branch_id,
                                        user_id,table_id,slot_id,schedule_date,
                                        schedule_end_date,supplier_id,amount,
                                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                                }
                                else{
                                    return sendResponse.sendErrorMessage(
                                        await Universal.getMsgText(
                                            languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                        reply,400);
                                }

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
                else if((unique_id).toLowerCase()==config.get("payment.braintree.unique_id")){
                    payment_source="braintree";
                    let braintree_data=await Universal.getBraintreeData(request.dbName);
                    logger.debug("========braintree_data==API==",braintree_data);

                    if(Object.keys(braintree_data).length>0){
                        var braintree = require("braintree");
                        var gateway = braintree.connect({
                            //environment:process.env.NODE_ENV == 'prod'? braintree.Environment.Production:braintree.Environment.Sandbox,
                            environment: braintree.Environment.Production,
                            merchantId: braintree_data[config.get("payment.braintree.merchant_id")],
                            publicKey: braintree_data[config.get("payment.braintree.public_key")],
                            privateKey: braintree_data[config.get("payment.braintree.private_key")]
                        });

                        gateway.transaction.sale({
                            amount: orderNetAmount,
                            paymentMethodNonce: payment_token,
                            options: {
                                submitForSettlement: true
                            },
                            deviceData: {}
                        }, async function(err,result) {
                            console.log(err,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",result)
                            if(err){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                if (result.success) {
                                    logger.debug("===braintree===response Id==>>>", result)
                                    card_payment_id = result.transaction.id;
                                    payment_status=1
                                    await bookTable(req.dbName,branch_id,
                                        user_id,table_id,slot_id,schedule_date,
                                        schedule_end_date,supplier_id,amount,
                                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                                }
                                else{
                                    return sendResponse.sendErrorMessage(
                                        await Universal.getMsgText(
                                            languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                        reply,400);
                                }

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
                else if((unique_id)=="zelle"){
                        logger.debug("===============zelle==========",zelle_receipt_url)
                        if(zelle_receipt_url=="" || zelle_receipt_url==null){
                            logger.debug("=======node zelle url============",zelle_receipt_url)
                            let msg = "please provide receipt for zelle";
                            sendResponse.sendErrorMessage(msg,reply,500);
                        }else{
                            payment_source = "zelle"
                            await bookTable(req.dbName,branch_id,
                                user_id,table_id,slot_id,schedule_date,
                                schedule_end_date,supplier_id,amount,
                                payment_source,zelle_receipt_url,1,seating_capacity,req);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                        }
                }
                else if((unique_id)=="pipolpay"){
                    logger.debug("===============zelle==========",zelle_receipt_url)
                    if(zelle_receipt_url=="" || zelle_receipt_url==null){
                        logger.debug("=======node zelle url============",zelle_receipt_url)
                        let msg = "please provide receipt for PipolPay";
                        sendResponse.sendErrorMessage(msg,reply,500);
                    }else{
                        payment_source = "PipolPay"
                        await bookTable(req.dbName,branch_id,
                            user_id,table_id,slot_id,schedule_date,
                            schedule_end_date,supplier_id,amount,
                            payment_source,zelle_receipt_url,1,seating_capacity,req);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                    }
            }
                else if((unique_id)=="oxxo"){
                    logger.debug("===============oxxo==========",zelle_receipt_url)
                    if(zelle_receipt_url=="" || zelle_receipt_url==null){
                        logger.debug("=======node oxxo url============",
                        zelle_receipt_url)
                        let msg = "please provide receipt for oxxo";
                        sendResponse.sendErrorMessage(msg,reply,500);
                    }else{
                        payment_status = 1;
                        payment_source = "oxxo"
                        await bookTable(req.dbName,branch_id,
                            user_id,table_id,slot_id,schedule_date,
                            schedule_end_date,supplier_id,amount,
                            payment_source,zelle_receipt_url,1,seating_capacity,req);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                    }
                }
                else if(unique_id=="cred_movil"){
                    logger.debug("===============zelle==========",zelle_receipt_url)
                    if(zelle_receipt_url=="" || zelle_receipt_url==null){
                        logger.debug("=======node zelle url============",zelle_receipt_url)
                        let msg = "please provide receipt for cred movil";
                        sendResponse.sendErrorMessage(msg,reply,500);
                    }else{
                        payment_source = "cred_movil"
                        await bookTable(req.dbName,branch_id,
                            user_id,table_id,slot_id,schedule_date,
                            schedule_end_date,supplier_id,amount,
                            payment_source,zelle_receipt_url,1,seating_capacity,req);
                       
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                    }
                }
                else if ((unique_id) == "cashapp") {
                    logger.debug("===============cashapp==========", zelle_receipt_url)
                    if (zelle_receipt_url == "" || zelle_receipt_url == null) {
                        logger.debug("=======node zelle url============", zelle_receipt_url)
                        let msg = "please provide receipt for cashapp";
                        sendResponse.sendErrorMessage(msg, reply, 500);
                    } else {
                        payment_source = "cashapp"
                        await bookTable(req.dbName,branch_id,
                            user_id,table_id,slot_id,schedule_date,
                            schedule_end_date,supplier_id,amount,
                            payment_source,zelle_receipt_url,1,seating_capacity,req);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                    }
                }
                else if((unique_id)==config.get("payment.squareup.unique_id")){
                    payment_source="squareup";
                    let squareData=await Universal.getSquareupSecretKey(dbName)
                    
                        if(Object.keys(squareData).length>0){
                        var SquareConnect = require('square-connect');
                        // Set Square Connect credentials and environment
                        var defaultClient = SquareConnect.ApiClient.instance;
                        // Configure OAuth2 access token for authorization: oauth2
                        var oauth2 = defaultClient.authentications['oauth2'];
                        oauth2.accessToken = squareData.square_token;
                        // Set 'basePath' to switch between sandbox env and production env
                        // sandbox: https://connect.squareupsandbox.com
                        // production: https://connect.squareup.com
                        let basePathOfSequare=process.env.NODE_ENV == 'prod'? 'https://connect.squareup.com':'https://connect.squareupsandbox.com';
                        logger.debug("=basePathOfSequare===",basePathOfSequare);
                        defaultClient.basePath=process.env.NODE_ENV == 'prod'? 'https://connect.squareup.com':'https://connect.squareupsandbox.com'
                    
                        let payment_object = {};
                        const idempotency_key = crypto.randomBytes(22).toString('hex');
                        var apiInstance = new SquareConnect.PaymentsApi();
                        // you cand Add some Optional params acc. to the requirements in the PaymentObj
                        //https://developer.squareup.com/reference/square/payments-api/create-payment/explorer
                        logger.debug("==withou,with=",parseInt(Math.round(parseFloat((orderNetAmount-referralAmount)*100))),typeof parseInt(Math.round(parseFloat((orderNetAmount-referralAmount)*100))),typeof Math.round(parseFloat((orderNetAmount-referralAmount)*100)))
                        if(customer_payment_id !=="" && card_id!==""){
                            payment_object = {
                                amount_money: {
                                    amount: parseInt(Math.round(parseFloat((orderNetAmount)*100))),    // 100 Cent == $1.00 charge
                                    currency: currency
                                  },
                                // currency: currency,
                                source_id: card_id,
                                customer_id:customer_payment_id,
                                idempotency_key: idempotency_key,
                                note: 'Made an booking'
                            }
                        }else{
                            payment_object = {
                                source_id: payment_token,
                                amount_money: {
                                  amount: parseInt(Math.round(parseFloat((orderNetAmount)*100))),    // 100 Cent == $1.00 charge
                                  currency: currency
                                },
                                idempotency_key: idempotency_key,
                                note: 'Made an booking'

                              };
                            }
                            logger.debug("===payment_object=",payment_object);
                            apiInstance.createPayment(payment_object).then(async function(data) {
                                console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                                card_payment_id = data.payment.id;
                                transaction_id=idempotency_key
                                payment_status=1
                                await bookTable(req.dbName,branch_id,
                                    user_id,table_id,slot_id,schedule_date,
                                    schedule_end_date,supplier_id,amount,
                                    payment_source,zelle_receipt_url,1,seating_capacity,req);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                              }, function(error) {
                                console.error(error);
                                return  sendResponse.sendErrorMessage(
                                     Universal.getMsgText(
                                   languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                   reply,400);
                              });
                            }
                            else{
                                return sendResponse.sendErrorMessage(
                                    await  Universal.getMsgText(
                                      languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                                      reply,400);
                            }
                                    
                     
                        }
                else if((unique_id)==config.get("payment.cybersource.unique_id")){
                        payment_source="cybersource";
                        let cyberSourceData=await Universal.getCyberSourceData(dbName);
                        logger.debug("==cyberSourceData====",cyberSourceData);
                        if(Object.keys(cyberSourceData).length>0){
                            var cybersourceRestApi = require('cybersource-rest-client');
                                try {
                                    var instance = new cybersourceRestApi.PaymentsApi({
                                        'authenticationType':process.env.NODE_ENV == 'prod'? 'https_signature':'http_signature',
                                        'runEnvironment':process.env.NODE_ENV == 'prod'? 'cybersource.environment.production':'cybersource.environment.SANDBOX',
                                        'merchantID':cyberSourceData.cybersource_merchant_id,
                                        'merchantKeyId': cyberSourceData.cybersource_merchant_key_id,
                                        'merchantsecretKey': cyberSourceData.cybersource_merchant_secret_key
                                    });
                                    var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
                                    processingInformation.commerceIndicator = 'internet';
                                    // var aggregatorInformation = new cybersourceRestApi.Ptsv2paymentsAggregatorInformation();
                                    

                                    var amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
                                    amountDetails.totalAmount = parseFloat(parseFloat(orderNetAmount));
                                    amountDetails.currency = 'AED';
                                    var orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
                                    orderInformation.amountDetails = amountDetails;

                                    // var billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
                                    //     billTo.country = userData[0].customer_address;
                                    //     billTo.firstName = userData[0].name;
                                    //     billTo.lastName = userData[0].name
                                    //     billTo.phoneNumber = userData[0].mobile_no
                                    //     billTo.address1 = userData[0].address_line_2
                                    //     billTo.locality = userData[0].customer_address;
                                    //     billTo.email = userData[0].email;
                                    //     billTo.address2 = userData[0].address_line_2;
                                       
                                    // orderInformation.billTo = billTo;
                                    var paymentInformation = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
                                    // var card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard(); 
                                    var customer = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCustomer();
                                    customer.customerId=payment_token;
                                    // card.expirationYear = cardData[0].exp_year
                                    // card.number = cardData[0].card_number;
                                    // card.expirationMonth = cardData[0].exp_month;
                                    // card.securityCode = await Universal.getDecryptData(cardData[0].cvc);
                                    // // customer.customer_payment_id
                                    // card.type = cardData[0].card_type;
                                    // paymentInformation.card = card;
                                    paymentInformation.customer=customer
                                    var cbrequest = new cybersourceRestApi.CreatePaymentRequest();
                                    // request.clientReferenceInformation = clientReferenceInformation;
                                    cbrequest.processingInformation = processingInformation;
                                    // request.aggregatorInformation = aggregatorInformation;
                                    cbrequest.orderInformation = orderInformation;
                                    cbrequest.paymentInformation = paymentInformation;
                                    cbrequest.processingInformation.capture = true;
                                    console.log('\n*************** Process Payment ********************* ');
                            
                                    instance.createPayment(cbrequest, async  function (error, data, response) {
                                        if (error) {

                                            console.log('\nError in process a payment : ' + JSON.stringify(error));
                                            return  sendResponse.sendErrorMessage(
                                                Universal.getMsgText(
                                              languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                              reply,400);
                                        }
                                        else {
                                            console.log('\nData of process a payment : ' + JSON.stringify(response['status']),JSON.stringify(response['id']))
                                            card_payment_id = data.id;
                                            payment_status=1
                                            await bookTable(req.dbName,branch_id,
                                                user_id,table_id,slot_id,schedule_date,
                                                schedule_end_date,supplier_id,
                                                amount,payment_source,zelle_receipt_url,1,seating_capacity,req);
                                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                                        }
                                        // console.log('\nResponse of process a payment : ' + JSON.stringify(response));
                                        // console.log('\nResponse Code of process a payment : ' + JSON.stringify(response['status']));
                                        // callback(error, data);
                                    });
                                } catch (error) {
                                    logger.debug("======ERR!===>>",error)
                                    return  sendResponse.sendErrorMessage(
                                        Universal.getMsgText(
                                      languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                      reply,400);
                                }
                            
                        }
                        else{
                              return sendResponse.sendErrorMessage(
                                    await  Universal.getMsgText(
                                      languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                                      reply,400);
                        }

                        }
                else if((unique_id)==config.get("payment.paytab.unique_id")){
                    console.log("############################## paytab 111111111111")
                    let payTabData=await Universal.getPayTabData(dbName);
                    
                    payment_source="paytab";
                    console.log("############################## paytab 222222222222",payTabData)
                    if(Object.keys(payTabData).length>0){
                        console.log("############################## paytab 333333333333",payTabData)
                    web_request.post({
                        url: "https://www.paytabs.com/apiv2/verify_payment_transaction",
                        method: "POST",
                        form: {
                            "merchant_email":payTabData.merchant_email,
                            "secret_key":payTabData.paytabs_secret_key,
                            // "merchant_email":"Kiran.girija@afoc.mil.ae", //payTabData.paytab_merchant_email,
                            // "secret_key":"QGj2hCvxNdFnoA9QZe9jm8QSr2S44FcUmvWD7sbUFRh4rrUrG4L2cCUEENJJsVDPqAsy3EtIvLNXdHoTM9WYLRDqEm97hNWIophr",//payTabData.paytab_secret_key,
                            "transaction_id":payment_token
                        }
                        
                      }, async function(error, response, body) {
                        console.log("############################## paytab 44444444444444",payTabData)
                          logger.debug("===paytabErr!===",error)
                        if (error) {
                            return  sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                              languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                              reply,400);
                        }
                        else {
                            card_payment_id = JSON.parse(body).transaction_id;
                            payment_status=1
                            await bookTable(req.dbName,branch_id,
                                user_id,table_id,slot_id,schedule_date,
                                schedule_end_date,supplier_id,amount,
                                payment_source,zelle_receipt_url,1,seating_capacity,req);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                            }
                          
                      })
                    }
                      else{
                        return sendResponse.sendErrorMessage(
                              await  Universal.getMsgText(
                                languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                                reply,400);
                    }

                }else if((unique_id)=="safe2pay"){

                    payment_source="safe2pay";
                    let safe2pay_keydata = await Universal.getSafe2Paykey(request.dbName)
                    
                    let base_url = "https://payment.safe2pay.com.br/v2/Payment";

                    let IsSandbox = process.env.NODE_ENV == 'prod'?false:true
                    // let expirationDate = request.body.expirationDate
                    let ref_id = "ref_id_"+randomstring.generate({
                        length: 5,
                        charset: 'alphanumeric'
                    }).toUpperCase();
                    if(Object.keys(safe2pay_keydata).length>0){
                        let body = {};
                            body = {
                                "IsSandbox": IsSandbox,
                                "Application": "Aplicação de teste",
                                "Vendor": "test",
                                "CallbackUrl": "https://callbacks.exemplo.com.br/api/Notify",
                                "PaymentMethod": "2",
                                "Customer": {
                                    "Name": "test",
                                    "Identity":ref_id,
                                    "Phone": phoneNumber,
                                    "Email": "safe2pay@safe2pay.com.br"
                                },
                                "Products": [
                                    {
                                        "Code": "001",
                                        "Description": "Teste 1",
                                        "UnitPrice": 25.00,
                                        "Quantity": 1
                                    }
                                ],
                                "PaymentObject": {
                                    "Holder": "João da Silva",
                                    "CardNumber": "5105 1051 0510 5100",
                                    "ExpirationDate": "12/2021",
                                    "SecurityCode": "241",
                                    "InstallmentQuantity": 05,
                                    "SoftDescriptor": "Teste"
                                }
                            }
                            


                        logger.debug("=======JSON.stringify(body)==========",JSON.stringify(body))
                        var options = {
                            'method': 'POST',
                            'url':base_url,
                            'headers': {
                                'Content-Type': 'application/json',
                                'x-api-key':safe2pay_keydata.safe2pay_apikey
                            },
                            body:body,
                            json:true
                        };
                        web_request(options, async function (error, response,body) {
                            logger.debug("====Body=====",error,body)
                            if(error){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                payment_status=1;
                                await bookTable(req.dbName,branch_id,
                                    user_id,table_id,slot_id,schedule_date,
                                    schedule_end_date,supplier_id,amount,
                                    payment_source,zelle_receipt_url,1,seating_capacity,req);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                            }
                        })


                    }
                    else{
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                            reply,400);
                    }
                }
                else if((unique_id)=="authorize_net"){
                            payment_source="authorize_net";
                            let authorize_net_key_data = await Universal.getAuthorizeNetKeys(request.dbName)
                            let base_url = process.env.NODE_ENV == 'prod'?'https://api.authorize.net/xml/v1/request.api':'https://apitest.authorize.net/xml/v1/request.api'
                            let expirationDate = request.body.expirationDate
                            let ref_id = "ref_id_"+randomstring.generate({
                                length: 5,
                                charset: 'alphanumeric'
                            }).toUpperCase();
                            if(Object.keys(authorize_net_key_data).length>0){
                                let body = {};
                                let authnet_profile_id = request.body.authnet_profile_id!==undefined?request.body.authnet_profile_id:"";
                                let authnet_payment_profile_id = request.body.authnet_payment_profile_id!==undefined?request.body.authnet_payment_profile_id:"";
                               
                                if(authnet_profile_id!=="" && authnet_profile_id!==""){
                                    body = {
                                        "createTransactionRequest": {
                                            "merchantAuthentication": {
                                                "name": authorize_net_key_data[config.get("payment.authorize_net.api_login_id")],
                                                "transactionKey": authorize_net_key_data[config.get("payment.authorize_net.transaction_key")]
                                            },
                                            "refId": ref_id,
                                            "transactionRequest": {
                                                "transactionType": "authCaptureTransaction",
                                                "amount": Math.round(parseFloat(orderNetAmount)),
                                                  "profile": {
                                                      "customerProfileId": authnet_profile_id,
                                                      "paymentProfile": { "paymentProfileId": authnet_payment_profile_id }
                                                  }
                                            }
                                        }
                                    }
                                }else{
                                    body = {
                                        "createTransactionRequest": {
                                            "merchantAuthentication": {
                                                "name": authorize_net_key_data[config.get("payment.authorize_net.api_login_id")],
                                                "transactionKey": authorize_net_key_data[config.get("payment.authorize_net.transaction_key")]
                                            
                                            },
                                            "refId":ref_id,
                                            "transactionRequest": {
                                                "transactionType": "authCaptureTransaction",
                                                "amount": parseFloat(orderNetAmount),
                                                "payment": {
                                                    "creditCard": {
                                                        "cardNumber": paymentToken,
                                                        "expirationDate": expirationDate
                                                    }
                                                },
                                                "billTo": {
                                                    "firstName": userData[0].name,
                                                }
                                            }
                                        }
                                    }
                                }
        
                                logger.debug("========body to send==========",body,
                                body.createTransactionRequest.transactionRequest.profile)
        
                                logger.debug("=======JSON.stringify(body)==========",JSON.stringify(body))
                                var options = {
                                    'method': 'POST',
                                    'url':base_url,
                                    'headers': {
                                        'Content-Type': 'application/json'
                                    },
                                    body:body,
                                    json:true
                                };
                                web_request(options, async function (error, response,body) {
                                    logger.debug("====Body=====",error,body)
                                    if(error){
                                        return sendResponse.sendErrorMessage(
                                            await Universal.getMsgText(
                                                languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                            reply,400);
                                    }
                                    else{
                                        payment_status=1;
                                        let result = body.trim();
                                        result = JSON.parse(result)
                                        logger.debug(result)
                                        
                                        if(result.messages.resultCode=="Error"){
                                            let errorMsg = result.messages.message[0].text
                                            sendResponse.sendErrorMessage(errorMsg,reply,400);
                                        }else if (result.messages.resultCode=="Ok"){
                                            card_payment_id=result.transactionResponse.transId;
                                            await bookTable(req.dbName,branch_id,
                                                user_id,table_id,slot_id,schedule_date,
                                                schedule_end_date,supplier_id,amount,
                                                payment_source,zelle_receipt_url,1,seating_capacity,req);
                                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
                                                
                                        }else{
                                            let errorMsg = "something went wrong during payment"
                                            sendResponse.sendErrorMessage(errorMsg,reply,400);
                                        }
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
                else if ((unique_id)=="pago_facil"){
                    let pago_facil_key_data = await Universal.getPagofacilKeys(dbName);
                    let base_url = process.env.NODE_ENV == 'prod'?'https://api.pagofacil.tech/Wsrtransaccion/index/format/json':'https://sandbox.pagofacil.tech/Wsrtransaccion/index/format/json'
                    if(Object.keys(pago_facil_key_data).length>0){
                        let headers =  {
                            'Content-Type': 'multipart/form-data',
                        }
                        
                        formData = {
                            "method":"transaccion",
                            "data[nombre]":tran_id,
                            "data[apellidos]":success_url,
                            "data[numeroTarjeta]":fail_url,
                            "data[cvt]":cancel_url,
                            "data[cp]":amount,
                            "data[mesExpiracion]":currency,
                            "data[anyoExpiracion]":signature_key,
                            "data[monto]":desc,
                            "data[idSucursal]":cus_name,
                            "data[idUsuario]":cus_email,
                            "data[idServicio]":cus_add1,
                            "data[email]":cus_add2,
                            "data[telefono]":cus_city,
                            "data[celular]":cus_state,
                            "data[calleyNumero]":cus_postcode,
                            "data[colonia]":cus_country,
                            "data[municipio]":cus_phone,
                            "data[status]":"000599000730016",
                            "data[estado]":"",
                            "data[pais]":""
                        }
                        logger.debug("========body to send==========",body)

                        logger.debug("=======JSON.stringify(body)==========",JSON.stringify(body))

                        var options = {
                            method: 'POST',
                            url: base_url,
                            headers:headers,
                            form: formData,
                            json: true 
                        };
                        web_request(options, async function (error, response,body) {
                            logger.debug("====Body=====",error,body)
                            if(error){
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                            else{
                                payment_status=1;
                                let result = body.trim();
                                result = JSON.parse(result)
                                logger.debug(result)
                                
                                if(result.messages.resultCode=="Error"){
                                    let errorMsg = result.messages.message[0].text
                                    sendResponse.sendErrorMessage(errorMsg,reply,400);
                                }else if (result.messages.resultCode=="Ok"){
                                    card_payment_id=result.transactionResponse.transId;
                                await bookTable(req.dbName,branch_id,
                                        user_id,table_id,slot_id,schedule_date,
                                        schedule_end_date,supplier_id,amount,
                                        payment_source,zelle_receipt_url,1,seating_capacity,req);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                                }else{
                                    let errorMsg = "something went wrong during payment"
                                    sendResponse.sendErrorMessage(errorMsg,reply,400);
                                }
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

                else if ((unique_id)=="pago_facil"){
                            logger.debug("======dbname=======",request.dbName);
                            let pago_facil_key_data = await Universal.getPagofacilKeys(request.dbName);
                            logger.debug("=========pago data=======",pago_facil_key_data)
                            let base_url = process.env.NODE_ENV == 'prod'?'https://api.pagofacil.tech/Wsrtransaccion/index/format/json':'https://sandbox.pagofacil.tech/Wsrtransaccion/index/format/json'
                            let tran_id = "tran_id_"+randomstring.generate({
                                length: 5,
                                charset: 'alphanumeric'
                            }).toUpperCase();
                            let cvt = request.body.cvt;
                            let cp = request.body.cp;
                            let expMonth = request.body.expMonth;
                            let expYear = request.body.expYear;
                            
                            logger.debug("==========pagofacil key data====",pago_facil_key_data)
                            if(Object.keys(pago_facil_key_data).length>0){
                                let headers =  {
                                    'Content-Type': 'multipart/form-data',
                                }
                                
                                formData = {
                                    "method":"transaccion",
                                    "data[nombre]":userData[0].firstname,
                                    "data[apellidos]":userData[0].firstname,
                                    "data[numeroTarjeta]":payment_token,
                                    "data[cvt]":cvt,
                                    "data[cp]":cp,
                                    "data[mesExpiracion]":expMonth,
                                    "data[anyoExpiracion]":expYear,
                                    "data[monto]": parseFloat(orderNetAmount).toString(),
                                    "data[idSucursal]":pago_facil_key_data.idSucursa,
                                    "data[idUsuario]":pago_facil_key_data.idUsuario,
                                    "data[idServicio]":"3",
                                    "data[email]":userData[0].email,
                                    "data[telefono]":userData[0].mobile_no,
                                    "data[celular]":userData[0].mobile_no,
                                    "data[calleyNumero]":userData[0].customer_address,
                                    "data[colonia]":userData[0].customer_address,
                                    "data[municipio]":userData[0].customer_address,
                                    "data[status]":"Sonora",
                                    "data[estado]":"México",
                                    "data[pais]":"México"
                                }
                                logger.debug("========formData to send==========",formData)
                        
                                logger.debug("=======JSON.stringify(formData)==========",JSON.stringify(formData))
                        
                                var options = {
                                    method: 'POST',
                                    url: base_url,
                                    headers:headers,
                                    form: formData,
                                    json: true 
                                };
                                web_request(options, async function (error, response,body) {
                                    logger.debug("====Body=====",error,body)
                                    if(error){
                                        return sendResponse.sendErrorMessage(
                                            await Universal.getMsgText(
                                                languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                            reply,400);
                                    }
                                    else{
                                        payment_status=1;
                                        payment_source = "pago_facil"
                                        if(body.WebServices_Transacciones.transaccion.autorizado=="0"){
                                            return sendResponse.sendErrorMessage(body.WebServices_Transacciones.transaccion.texto,
                                                reply,400)
                                        }else{
                                            card_payment_id = body.WebServices_Transacciones.transaccion.idTransaccion
                                            await bookTable(req.dbName,branch_id,
                                                user_id,table_id,slot_id,schedule_date,
                                                schedule_end_date,supplier_id,amount,
                                                payment_source,zelle_receipt_url,1,seating_capacity,req);
                                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
                                        }
                                    }
                                });
                        
                            }
                            else{

                                return sendResponse.sendErrorMessage("keys not added",reply,400)
                            }
                        
                }
                else if ((unique_id)=="wallet"){
                    if(userWalletDetails && userWalletDetails.length>0){

                        walletLeftAmount = parseFloat(userWalletDetails[0].wallet_amount) - parseFloat(amount)
                        updateWalletQuery = "update user set wallet_amount=? where id=?"
                        await ExecuteQ.Query(request.dbName,updateWalletQuery,[walletLeftAmount,id]);
                        let query = "insert into user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add) values(?,?,?,?,?,?)"
                        let params = [user_id,amount,"",0,3,0];
                        await ExecuteQ.Query(request.dbName,query,params);   
                        
                        await bookTable(req.dbName,branch_id,
                            user_id,table_id,slot_id,schedule_date,
                            schedule_end_date,supplier_id,amount,
                            payment_source,zelle_receipt_url,1,seating_capacity,req);

                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
                }else{
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                            languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                            res,400);
                    }

                }
                else{
                    console.log("=======eerr---------=====",unique_id)
                    return sendResponse.sendErrorMessage(
                      await  Universal.getMsgText(
                        languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.no_gate_way")),
                        res,400);
                }
                }else{
                    payment_source = "none"
                    await bookTable(req.dbName,branch_id,
                        user_id,table_id,slot_id,schedule_date,
                        schedule_end_date,supplier_id,amount,payment_source,
                        zelle_receipt_url,1,seating_capacity,req);







                        



                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);

                }

            
            
        }   
        catch(Err){
            logger.debug("======ERR!===?",Err)
            return sendResponse.sendErrorMessage(
                await Universal.getMsgText(
                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                res,400);
        }
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const bookTable = (dbName,branch_id,user_id,
    table_id,slot_id,schedule_date,schedule_end_date,supplier_id,
    amount,payment_source,reciept_url,payment_type,seating_capacity,request)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_table_booked(branch_id,user_id,table_id,slot_Id,schedule_date,schedule_end_date,supplier_id,amount,payment_source,reciept_url,payment_type,seating_capacity) "
         query+= " values(?,?,?,?,?,?,?,?,?,?,?,?)";        
        let params = [branch_id,user_id,table_id,slot_id,schedule_date,schedule_end_date,supplier_id,amount,payment_source,reciept_url,payment_type,seating_capacity];
        await ExecuteQ.Query(dbName,query,params);

        let QueryV1 = "insert into supplier_booked_slots(day_id,supplier_id,order_id,user_id,slot_id) values(?,?,?,?,?)"
        let paramsV1 = [
                      0,
                      1,
                      0,
                      user_id,
                      slot_id
                      
                     ]
        await ExecuteQ.Query(dbName,QueryV1,paramsV1);


        let adminData=await ExecuteQ.Query(dbName,
            "select lg.language_code,ad.fcm_token,ad.email,ad.id,ad.language_id from admin ad join language lg on lg.id=ad.language_id where is_active=1",[])


        let  supplierDatas=await ExecuteQ.Query(dbName, 
                    "select `device_token`,`device_type`,`id` from supplier where id in (?)",supplier_id)
    
            logger.debug("==adminData==supplierDatas=",adminData,supplierDatas);
            

    
            let fcmToken = [];
        if(adminData && adminData.length>0){
            for(const [index,i] of adminData.entries()){
                request.userLanguage=i.language_code;
                let aData = {
                    "status": 0,
                    "message":await Universal.getMsgText(parseInt(i.language_id),request,-1),
                    "sound":"default"
                }
                await saveadminsNotifications(request.dbName,[i],0,0,
                    aData.message,1,i.id);
                await lib.sendFcmPushNotification([i.fcm_token], aData,request.dbName);
            }
        }

           
    
            if (supplierDatas.length)
                _.each(supplierDatas,function(i){
                    fcmToken.push(i.device_token)
                })
            
            var data = {
                "status": 0,
                "message":"you got a new table booking request",
                "sound":"default"
            }
            
            await lib.sendFcmPushNotification(fcmToken, data,dbName);
            logger.debug("=====NOTCATION==Cb=>>",data,dbName)

        



        resolve();
    })
}


const checkSupplierTableDateTime = (dbName,table_id,schedule_date,res)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select id from user_table_booked where table_id=? and schedule_date=?"
        let params = [table_id,schedule_date];
        let data = await ExecuteQ.Query(dbName,query,params);
        if(data && data.length>0){
            let msg = "Table already booked at this slot"
            sendResponse.sendErrorMessage(msg,res,400);
        }else{
            resolve()
        }
    })
}



const listUserBokingRequests = async (req, res) => {
    try {
        let limit = req.query.limit 
        let offset = req.query.offset
        let user_id = req.query.user_id
        let invitation_list = req.query.invitation_list==undefined?0:req.query.invitation_list
        let status = req.query.status==undefined?0:req.query.status
        
        if(parseInt(invitation_list)==1){
            let query = "select utb.user_in_range,utb.user_on_the_way,utb.branch_id, utb.order_id,s.id as supplier_id,utb.id,st.id as table_id,st.table_name,st.table_number,utb.seating_capacity, "
            query+="utb.amount,utb.payment_source,utb.reciept_url,utb.payment_type,sb.branch_name,u.firstname as user_name,u.email as user_email,utb.status, "
            query+="utb.schedule_date,utb.schedule_end_date from user_table_invites uti join user_table_booked utb on utb.id = uti.table_booking_id join user u on u.id = utb.user_id "
            query+="left join supplier_tables st on st.id = utb.table_id join supplier s on s.id = utb.supplier_id "
            query+="join supplier_branch sb on sb.id = utb.branch_id where uti.user_id=? order by utb.id desc limit ?,? "
            let params = [user_id,offset,limit];
            let result = await ExecuteQ.Query(req.dbName,query,params);
            
            let query1 = "select utb.user_in_range,utb.user_on_the_way,utb.id,st.id as table_id,st.table_name,st.table_number,utb.seating_capacity, "
            query1+="utb.amount,utb.payment_source,utb.reciept_url,utb.payment_type,sb.branch_name,u.firstname as user_name,u.email as user_email,utb.status "
            query1+="from user_table_invites uti join user_table_booked utb on utb.id = uti.table_booking_id join user u on u.id = utb.user_id "
            query1+="left join supplier_tables st on st.id = utb.table_id join supplier s on s.id = utb.supplier_id "
            query1+="join supplier_branch sb on sb.id = utb.branch_id where uti.user_id=? "        
            let params1 = [user_id];
            let result1 = await ExecuteQ.Query(req.dbName,query1,params1);
    
            let final = {
                list : result,
                count : result1 && result1.length>0?result1.length:0
            }
    
    
    
            sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
        }else{
            let status_check = "";
            
         if(parseInt(status)>0){
            if(parseInt(status)==1){
                status_check = " and utb.status=0 or utb.status=1  "
            }else{
                status_check = " and utb.status=2 or utb.status=3 "
            }
         }
        let query = "select utb.user_in_range,utb.user_on_the_way,utb.branch_id,utb.order_id,s.id as supplier_id,utb.id,st.id as table_id,st.table_name,st.table_number,utb.seating_capacity, "
        query+="utb.amount,utb.payment_source,utb.reciept_url,utb.payment_type, s.logo,sb.branch_name,sb.address as supplier_branch_address,u.firstname as user_name,u.email as user_email,utb.status, "
        query+="utb.schedule_date,utb.schedule_end_date from user_table_booked utb join user u on u.id = utb.user_id "
        query+="left join supplier_tables st on st.id = utb.table_id join supplier s on s.id = utb.supplier_id "
        query+="join supplier_branch sb on sb.id = utb.branch_id where utb.user_id=? "+status_check+" order by utb.id desc limit ?,? "
        let params = [user_id,offset,limit];
        let result = await ExecuteQ.Query(req.dbName,query,params);
        
        let query1 = "select utb.user_in_range,utb.user_on_the_way,utb.branch_id,utb.id,st.id as table_id,st.table_name,st.table_number,utb.seating_capacity, "
        query1+="utb.amount,utb.payment_source,utb.reciept_url,utb.payment_type, s.logo,sb.branch_name,sb.address as supplier_branch_address,u.firstname as user_name,u.email as user_email,utb.status "
        query1+="from user_table_booked utb join user u on u.id = utb.user_id "
        query1+="left join supplier_tables st on st.id = utb.table_id join supplier s on s.id = utb.supplier_id "
        query1+="join supplier_branch sb on sb.id = utb.branch_id where utb.user_id=? "+status_check+" "        
        let params1 = [user_id];
        let result1 = await ExecuteQ.Query(req.dbName,query1,params1);

        if(result && result.length>0){
            for(const [index,i] of result.entries()){
                let query = "select u.email,u.firstname,u.id as user_id, uti.id from user_table_invites uti " 
                query += " join user u on u.id = uti.user_id where uti.table_booking_id = ? "
                let params = [i.id];
                i.invitedUsers = await ExecuteQ.Query(req.dbName,query,params);
            }
        }

        let final = {
            list : result,
            count : result1 && result1.length>0?result1.length:0
        }



        sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
        }
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const assignTableToUser = async (req, res) => {
    try {
        let user_id = req.body.user_id
        let table_id = req.body.table_id
        let request_id = req.body.request_id
        
        let query = "update user_table_booked set table_id=? where id=?";
        let params = [table_id,request_id];
        await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const verifyTableNumber = async (req, res) => {
    try {
        let supplier_id = req.body.supplier_id
        let table_number = req.body.table_number
        
        let query = "select * from supplier_tables where table_number=? and supplier_id=? ";
        let params = [table_number,supplier_id];
        let result = await ExecuteQ.Query(req.dbName,query,params);
        
        if(result && result.length>0){
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
        }else{
            sendResponse.sendSuccessData([], constant.responseMessage.SUCCESS, res, 200);
        }
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const acceptTableInvitation = async (req, res) => {
    try {
        let table_booking_id = req.body.table_booking_id
        let user_id = req.body.user_id
        
        let query = "insert into user_table_invites (table_booking_id,user_id) values(?,?) ";
        let params = [table_booking_id,user_id];

        let result = await ExecuteQ.Query(req.dbName,query,params);
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}
const request = require('request');
const { resolve } = require('path');
const { reject } = require('underscore');
const Execute = require('../../lib/Execute');
const genrateTableDeeplink = async (req, res) => {
    try {
        let domainUriPrefix = req.body.domainUriPrefix;
        let link = req.body.link;
        let androidPackageName = req.body.androidPackageName
        let iosBundleId = req.body.iosBundleId;
        let firebase_api_key = req.body.firebase_api_key

        let body_data = {
            
                "dynamicLinkInfo": {
                  "domainUriPrefix": domainUriPrefix,
                  "link": link,
                  "androidInfo": {
                    "androidPackageName": androidPackageName
                  },
                  "iosInfo": {
                    "iosBundleId": iosBundleId
                  }
                }
              
        }
        request.post({
            headers:{'content-type' : 'application/json'},
            url:'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key='+firebase_api_key+'',
            method: "POST",
            body: body_data,
            json: true
            },function(error, response, body){    
                logger.debug("========ERROR==",error )
                if(error){
                    logger.debug("===========err========", error);
                    let message = "Something went wrong";
                    sendResponse.sendErrorMessage(message, res, 400)
                }
                else{   
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
                }
          });
        
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const updateTableNumber = async (req, res) => {
    try {
        let table_id = req.body.table_id
        let id = req.body.id
        let order_id = req.body.order_id!==undefined ?req.body.order_id:0;

        if(parseInt(order_id)>0){
            let query = "update orders set table_id=? where id=?";
            let params = [table_id,order_id];
    
            let result = await ExecuteQ.Query(req.dbName,query,params);
            
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            
        }else{
            let query = "update user_table_booked set table_id=? where id=?";
            let params = [table_id,id];
    
            let result = await ExecuteQ.Query(req.dbName,query,params);
            
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            
        }

    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const updateSupplierSequenceNumber = async (req, res) => {
    try {
        let supplierSequence = req.body.supplierSequence;

        let query = "update supplier set sequence_no=? where id=? "

        for(const [index,i] of supplierSequence.entries()){   
            await ExecuteQ.Query(req.dbName,query,[i.sequence_no,i.supplier_id]);
        }
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
    }
}

const updateSupplierPassword = async (req, res) => {
    try {
        let password = req.body.password
        let supplier_id = req.body.supplier_id
        let encrypt_password  = ""
        encrypt_password = md5(password)
        let query = "update supplier_admin set password=? where supplier_id=?";
        let params = [encrypt_password,supplier_id];
        let supplierData=await queryModel.supplierModel.getSupplierAdminData(["email"],req.dbName,[supplier_id]);
        let email =supplierData && supplierData.length>0?supplierData[0].email:"";
        emailTemp.userResetpassword(req,res,email,password,"",function(err,result){
            // if(err){
                console.log("..****register email*****....",err);
            // }
        });
        await ExecuteQ.Query(req.dbName,query,params);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
    }
}

const addSupplierTags = async (req, res) => {
    try {
        let name = req.body.name;
        let tag_image = req.body.tag_image;
        let query = "insert into  supplier_tags(name,tag_image) values(?,?)"
        await ExecuteQ.Query(req.dbName,query,[name,tag_image]);
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const updateSupplierTags = async (req, res) => {
    try {
        let name = req.body.name;
        let tag_image = req.body.tag_image;
        let id = req.body.id

        let query = "update supplier_tags set name=?,tag_image=? where id=?"
        await ExecuteQ.Query(req.dbName,query,[name,tag_image,id]);
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
    }
}

const listSupplierTags = async (req, res) => {
    try {
        let limit = req.query.limit;
        let skip = req.query.skip;

        let query = "select * from  supplier_tags limit ?,?"
        let data = await ExecuteQ.Query(req.dbName,query,[skip,limit]);
        

        let query2 = "select * from  supplier_tags"
        let data2 = await ExecuteQ.Query(req.dbName,query2,[]);
        
        let final = {
            list : data,
            count : data2 && data.length>0?data.length:0
        }

        sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
    }
}

const listSupplierTagsBySupplierId = async (req, res) => {
    try {
        let limit = req.query.limit;
        let skip = req.query.skip;
        let supplier_id = req.query.supplier_id

        var sql1 = "select * from supplier_tags";
        let datacount=await ExecuteQ.Query(req.dbName,sql1,[]);
        
        var sql2 = "select * from supplier_tags limit ?,?";
        let result=await ExecuteQ.Query(req.dbName,sql2,[skip,limit]);

        for(const [index,i] of result.entries()){
            let query = "select id from supplier_assigned_tags where supplier_id=? and tag_id=?";
            let params = [supplier_id,i.id]
            let data = await ExecuteQ.Query(req.dbName,query,params);
            if(data && data.length>0){
                i.is_assigned = 1
            }else{
                i.is_assigned = 0
            }
        }
        
        let final = {
            list : result,
            count : datacount && datacount.length>0?datacount.length:0
        }

        sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
    }
}

const deleteSupplierTag = async (req, res) => {
    try {
        let id = req.body.id;
        await checkSupplierTagAssigned(req.dbName,id,res);
        let query = "delete from supplier_tags where id=?"
        await ExecuteQ.Query(req.dbName,query,[id]);
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}
const checkSupplierTagAssigned = (dbName,tag_id,res)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select id from supplier_assigned_tags where tag_id=?";
        let result = await ExecuteQ.Query(dbName,query,[tag_id]);
        if(result && result.length>0){
            var message = "This tag is already assigned to one of the supplier";
            sendResponse.sendErrorMessage(message, res, 400)
        }else{
            resolve();
        }
    })
}


const assignTagsToSupplier = async (req, res) => {
    try {
        let supplier_id = req.body.supplier_id;
        let tag_ids = req.body.tag_ids;

        let query = "delete from  supplier_assigned_tags where supplier_id=?";
        await ExecuteQ.Query(req.dbName,query,[supplier_id]);

        if(tag_ids && tag_ids.length>0){
            for(const [index,i] of tag_ids.entries()){
                let query2 = "insert into  supplier_assigned_tags(supplier_id,tag_id) values(?,?)"
                await ExecuteQ.Query(req.dbName,query2,[supplier_id,i]);
            }
        }

        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const unassignTagsToSupplier = async (req, res) => {
    try {
        let id = req.body.id;
        
        let query = "delete from supplier_assigned_tags where id=? "
        await ExecuteQ.Query(req.dbName,query,[id]);
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const addUpdateSupplierFlavor = async (req, res) => {
    try {
        let supplier_id = req.body.supplier_id;
        let is_flavor_of_week = req.body.is_flavor_of_week;
        let flavor_of_week = req.body.flavor_of_week
        
       await addUpdateSettings(req.dbName,"flavor_of_week",flavor_of_week);
       await ExecuteQ.Query(req.dbName,
        "update supplier set is_flavor_of_week=? where id=?",
        [is_flavor_of_week,supplier_id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}
const addUpdateSettings = async (dbName,key,value) => {
    try {
        return new Promise(async(resolve,reject)=>{
         let keyCheck = await ExecuteQ.Query(dbName,
            "select `key`, value from tbl_setting where `key`= ?",[key]);
            if(keyCheck && keyCheck.length>0){
                let query = "update tbl_setting set value=? where `key`=?"
                await ExecuteQ.Query(dbName,query,[value,key]);
                resolve();
            }else{
                let query = "insert into tbl_setting (`key`,value) values(?,?)"
                await ExecuteQ.Query(dbName,query,[key,value]);
                resolve();
            }
        })
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const addUpdateWeightWiseDeliveryCharge = async (req, res) => {
    try {
        let supplier_id = req.body.supplier_id;
        let weight = req.body.weight;
        let delivery_charge = req.body.delivery_charge;
        // let measuring_unit = req.body.measuring_unit;
        let id = req.body.id

        let query = "";
        let params = [];
    

        if(id!=="" && id!==undefined && id!==0 && id!==null){
            query = "update weight_wise_delivery_charge set weight=?,delivery_charge=? where id=?";
            params = [weight,delivery_charge,id]
            await ExecuteQ.Query(req.dbName,query,params);

        }else{
            query = "insert into weight_wise_delivery_charge(supplier_id,weight,delivery_charge) values (?,?,?)";
            params = [supplier_id,weight,delivery_charge]
            await ExecuteQ.Query(req.dbName,query,params);
        }
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const deleteWeightWiseDeliveryCharge = async (req, res) => {
    try {
        let id = req.body.id

        let query = "";
        let params = [];
    

            query = "delete from weight_wise_delivery_charge  where id=?";
            params = [id]
            await ExecuteQ.Query(req.dbName,query,params);

        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const listWeightWiseDeliveryCharge = async (req, res) => {
    try {
        let supplier_id = req.query.supplier_id
        let skip = req.query.skip;
        let limit = req.query.limit
        let query = "";
        let params = [];
    

        query = "select * from weight_wise_delivery_charge  where supplier_id=? limit ?,?";
        params = [supplier_id,skip,limit]
        let data = await ExecuteQ.Query(req.dbName,query,params);

        let query2 = "select * from weight_wise_delivery_charge  where supplier_id=?";
        let params2 = [supplier_id]
        let data2 = await ExecuteQ.Query(req.dbName,query2,params2);
        
        let finalData = {
            list : data,
            count : data2 && data2.length>0?data2.length:0
        }
        
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
    }
}

const updateSupplierImages = async (req, res) => {
    try {
        let supplier_id = req.body.supplier_id
        let supplier_images = req.body.supplier_images

        if(supplier_images && supplier_images.length>0){
            await ExecuteQ.Query(req.dbName,
                "delete from supplier_image where supplier_id=?",
                [supplier_id]);
            for(const [index,i] of supplier_images.entries()){
                await ExecuteQ.Query(req.dbName,
                    `insert into supplier_image(supplier_id,image_path,orderImage)
                     values(?,?,?)`,[supplier_id,i,index+1]);
            }
        }
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const addOrderTypeWiseGateways = async (req, res) => {
    try {
        let supplier_id = req.body.supplier_id
        let order_type = req.body.order_type
        let payment_gateways = req.body.payment_gateways
        await checkOrderWiseGatewayAlreadyExist(req.dbName,supplier_id,order_type,res);
        let query = "insert into order_type_wise_payment_gateways(supplier_id,order_type,payment_gateways) values(?,?,?) "
        let params = [supplier_id,order_type,payment_gateways]
        await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const checkOrderWiseGatewayAlreadyExist = (dbName,supplier_id,order_type,res)=>{
    return new Promise(async(resolve,reject)=>{
        let query = `select * from order_type_wise_payment_gateways
         where order_type=? and supplier_id=?`;
        let params = [order_type,supplier_id];
        let data = await ExecuteQ.Query(dbName,query,params);
        if(data && data.length>0){
            let msg = "Sorry, gateways with this order type already exist"
            sendResponse.sendErrorMessage(msg,res,400)
        }else{
            resolve();
        }
    
    })
}

const updateOrderTypeWiseGateways = async (req, res) => {
    try {
        let id = req.body.id
        let payment_gateways = req.body.payment_gateways

        let query = "update order_type_wise_payment_gateways set payment_gateways=? where id=? "
        let params = [payment_gateways,id]
        await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const deleteOrderTypeWiseGateway = async (req, res) => {
    try {
        let id = req.body.id

        let query = "delete from order_type_wise_payment_gateways where  id=? "
        let params = [id]
        await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const listOrderTypeWiseGateway = async (req, res) => {
    try {
         let supplier_id = req.query.supplier_id

        let query = "select * from order_type_wise_payment_gateways where supplier_id=? "
        let params = [supplier_id]
        let data = await ExecuteQ.Query(req.dbName,query,params);

        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const updateSupplierProductOffer = async (req, res) => {
    try {

        let supplierId = req.body.supplierId;
        let supplierBranchId = req.body.supplierBranchId;
        let offerValue = req.body.offerValue || 0;
        let admin_offer = req.body.admin_offer || 0;
        let supplier_offer = req.body.supplier_offer || 0;
        let isProductOffer = req.body.is_products_offer || 0;

        if(parseInt(isProductOffer)>0){
            await updateSupplierOffer(supplierId,
                offerValue,isProductOffer,admin_offer,supplier_offer,req.dbName);
            await deleteProductOfferPrice(supplierBranchId,offerValue,req.dbName);
            await updateProductOfferPrice(supplierBranchId,offerValue,req.dbName);
        }else{
            await updateSupplierOffer(supplierId,
                offerValue,isProductOffer,admin_offer,supplier_offer,req.dbName);
            await deleteProductOfferPrice(supplierBranchId,offerValue,req.dbName);
        }

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const deleteProductOfferPrice = async (supplierBranchId, offerValue,
     dbName) => {
   return new Promise(async(resolve,reject)=>{
   try {

            offerValue = offerValue/100;

            let query1 =  `delete pp

            from product_pricing pp
            
            join supplier_branch_product sbp on sbp.product_id = pp.product_id
            
            where sbp.supplier_branch_id=?

            and pp.price_type =1`

            await ExecuteQ.Query(dbName,query1,[supplierBranchId]);
   
            resolve();
      
       }
   catch (err) {
       logger.debug("===========err===updateSupplierOffer=====", err);
       reject(err)
   }
})

}

const updateProductOfferPrice = async (supplierBranchId, offerValue,
      dbName) => {
    return new Promise(async(resolve,reject)=>{
    try {
        offerValue = offerValue/100;


        let query2 = `

        INSERT INTO product_pricing (
            product_id, 
            price , 
            display_price,
            handling,
            delivery_charges,
            price_type,
            user_type,
            start_date,
            end_date,
            handling_supplier)

            select 
            pp.product_id, 
            pp.price-(pp.price* ${offerValue}), 
            pp.display_price,
            pp.handling,
            pp.delivery_charges,
            1,
            user_type,
            start_date,
            end_date,
            handling_supplier
            
            from supplier_branch_product sbp
            
            join product_pricing pp on sbp.product_id = pp.product_id
            
            where sbp.supplier_branch_id=?
            and pp.price_type =0`;

            await ExecuteQ.Query(dbName,query2,[supplierBranchId]);

            resolve();
       
        }
    catch (err) {
        logger.debug("===========err===updateSupplierOffer=====", err);
        reject(err)
    }
})

}

const updateSupplierOffer = async (supplierId, offerValue,
    isProductOffer,admin_offer,supplier_offer, dbName) => {
   return new Promise(async(resolve,reject)=>{
   try {

           let query =`update supplier set 
           is_products_offer = ?,
            offerValue = ?,admin_offer=?,supplier_offer=? where id=? `;
           let params = [isProductOffer,offerValue,admin_offer,supplier_offer,supplierId];
           await ExecuteQ.Query(dbName,query,params);
   
           resolve();
      
       }
   catch (err) {
       logger.debug("===========err===updateSupplierOffer=====", err);
       reject(err)
   }
})

}


const listSupplierTablesCapacities = async (req, res) => {
    try {
        let supplier_id  = req.query.supplier_id
        let branch_id = req.query.branch_id

        let query = "select st.id,st.supplier_id,st.table_number,st.table_name,st.seating_capacity,st.qr_code from supplier_tables st left join user_table_booked utb on utb.table_id = st.id "
        query+= "where st.supplier_id=? and st.branch_id=? and st.is_deleted=? group by st.id ";        
       
        let params = [supplier_id,branch_id,0];
        let result = await ExecuteQ.Query(req.dbName,query,params);
        result = _.chain(result).map('seating_capacity').unique().value();

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

const holdSupplierTableSlots = async (req, res) => {
    try {

        let slotDate = req.body.slotDate 
        let slotTime = req.body.slotTime 
        let branch_id = req.body.branch_id
        let supplier_id = req.body.supplier_id
        let offset = req.body.offset || "+05:30"
        let currentDateTime = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");

        let query = "insert into hold_supplier_slots (slotDate,slotTime,branch_id,supplier_id,created_at) values(?,?,?,?,?)";
        await ExecuteQ.Query(req.dbName,query,[
            slotDate,slotTime,branch_id,supplier_id,currentDateTime
        ])

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}


const updateSupplierAvailibilityOnOff = async (req, res) => {
    try {

        let id = req.body.id
        let is_open = req.body.is_open

        let query = "update supplier_timings set is_open=? where supplier_id=?";
        let query2 = "update supplier set is_live=? where id=?";
        await ExecuteQ.Query(req.dbName,query,[is_open,id]);
        await ExecuteQ.Query(req.dbName,query2,[is_open,id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used for upload an supplier csv from admin panel
 */

class Supplier{
    static async Import(req, res, next) {
           try {
                let fileRows = [];
                let fileName = req.files.file.name;
                let promises=[];
                await Universal.csvFileExtensionValidataion(fileName);
                let rowData=await Universal.supplierCsvParsingAndValidation(req);
                let supplierModel= new queryModel.supplier.bulk(req.dbName,rowData);
                promises.push(await supplierModel.insert());
                await Promise.all(promises)
                 .then(data => {
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                    return;
                 })
                .catch(error => {
                    logger.debug('=error=>>',error);
                    sendResponse.somethingWentWrongError(error,
                        constant.responseMessage.INTERNAL_SERVER_ERROR,
                        res,
                        500
                    );
                    return;
                });
           } catch (err) {
               let errTypeMsg=typeof err ==='object'?err.sqlMessage:err
               errTypeMsg=errTypeMsg=='undefined' || errTypeMsg=='' || errTypeMsg==undefined?constant.responseMessage.INTERNAL_SERVER_ERROR:errTypeMsg
              logger.debug("Error in Supplier Import===>>",err,errTypeMsg);
              sendResponse.sendErrorMessageWithTranslation(req,errTypeMsg, res, 500);
           }
        }
}
 
const getSupplierProductUpdationRequests = async (req, res) => {

    try {
        let {limit,skip,product_id} = req.query

        let updateRequests      = await getProductUpdationRequests(req.dbName,limit,skip,product_id);

        let updateRequestsCount = await getProductUpdationRequestsCount(req.dbName);

        if( updateRequests && updateRequests.length>0 ){

            for(const [index,i] of updateRequests.entries()){
                i.productUpdationMl = await getProductUpdationRequestsNames(req.dbName,i.id);
                i.productUpdationImages = await getProductUpdationRequestsImages(req.dbName,i.id)
            }

            let finalData = {
                list:updateRequests,
                count:updateRequestsCount
            }            
            sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
   
        }else{
            let finalData = {
                list:[],
                count:0
            }   
            sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
        

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const getSupplierProductPricingUpdationRequests = async (req, res) => {

    try {
        let {product_id,limit,skip} = req.query
        let updateRequests = await getProductPricingUpdationRequests(req.dbName,limit,skip);
        let updateRequestsCount = await getProductPricingUpdationRequestsCount(req.dbName);

        let data = {
            list : updateRequests,
            count : updateRequestsCount
        }
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
        catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

function getProductUpdationRequests(dbName,limit,skip,product_id){
    return new Promise(async(resolve,reject)=>{
        if(product_id==undefined){

            let query = `select spur.*,sb.name as supplier_branch_name ,
            s.name as supplier_name
            from supplier_product_updation_request spur 
            join supplier_branch_product sbp on sbp.product_id = spur.product_id
            join supplier_branch sb on sb.id = sbp.supplier_branch_id 
            join supplier s on sb.supplier_id = s.id
            
            order by spur.id desc limit ?,?`;

            let data = await Execute.Query(dbName,query,[skip,limit]);

            // i.productUpdationMl = await getProductUpdationRequestsNames(req.dbName,i.id);
            // i.productUpdationImages = await getProductUpdationRequestsImages(req.dbName,i.id)

            if( data && data.length > 0 ) {
                for(const [index, i] of data.entries()){

                    let productDetails = await ExecuteQ.Query(dbName,` select * from product where id = ? `,[i.product_id]);
                    
                    let productImages = await ExecuteQ.Query(dbName,` select * from product_image where product_id = ? `,[i.product_id]);
                   
                    let productMl = await ExecuteQ.Query(dbName,` select * from product_ml where product_id = ? `,[i.product_id]);
                   
                    i.oldProductData = productDetails[0];

                    i.oldProductData.productImages = productImages // && productImages.length>0 ? productImages[0] : [];

                    i.oldProductData.productMl = productMl// && productMl.length>0 ? productMl[0] : [];

                }
            }
            resolve(data);   
        }else{

            let query = `select spur.*,sb.name as supplier_branch_name from supplier_product_updation_request spur 
            join supplier_branch_product sbp on sbp.product_id = spur.product_id
            join supplier_branch sb on sb.id = sbp.supplier_branch_id
            where sbp.product_id = ?
            order by spur.id desc limit ?,?`;

            let data = await Execute.Query(dbName,query,[product_id,skip,limit]);


            
            resolve(data);
        }
    })
}

function getProductPricingUpdationRequests(dbName,limit,skip){
    return new Promise(async(resolve,reject)=>{
       
            let query = `select ppur.*,p.product_desc,sb.name as supplier_branch_name, p.name,
            s.name as supplier_name

            from product_pricing_updation_request ppur
            
            join product p on ppur.product_id = p.id
            
            join supplier_branch_product sbp on sbp.product_id = p.id
            
            join supplier_branch sb on sb.id = sbp.supplier_branch_id

            join supplier s on sb.supplier_id = s.id

           
            order by  ppur.id desc
            limit ?,?  `;

            let data = await Execute.Query(dbName,query,[skip,limit]);

            if( data && data.length > 0 ) {

                for(const [index, i] of data.entries()) {
                    let productPricingDetails = await ExecuteQ.Query(dbName,` select * from product_pricing where product_id = ? `,[i.product_id]);
                    i.old_price = productPricingDetails

                    let productImages = await ExecuteQ.Query(dbName,` select * from product_image where product_id = ? `,[i.product_id]);

                    i.productImages = productImages
                }

            }

            resolve(data);
        
    })
}
function getProductPricingUpdationRequestsCount(dbName){
    return new Promise(async(resolve,reject)=>{
       
            let query = "select * from product_pricing_updation_request  ";
            let data = await Execute.Query(dbName,query,[]);
            if(data && data.length>0){
                resolve(data.length);

            }else{
                resolve(0);

            }
        
    })
}

function getProductUpdationRequestsCount(dbName){
    return new Promise(async(resolve,reject)=>{
        let query = "select * from supplier_product_updation_request ";
        let data = await Execute.Query(dbName,query,[]);
        resolve(data.length);
    })
}

function getProductUpdationRequestsNames(dbName,update_request_id){
    return new Promise(async(resolve,reject)=>{
        let query = "select * from supplier_updation_request_product_ml where updation_request_id = ? ";
        let data = await Execute.Query(dbName,query,[update_request_id]);
        resolve(data);
    })
}

function getProductUpdationRequestsImages(dbName,update_request_id){
    return new Promise(async(resolve,reject)=>{
        let query = "select * from product_image_request where update_request_id = ? ";
        let data = await Execute.Query(dbName,query,[update_request_id]);
        resolve(data);
    })
}

const approveSupplierProductUpdationRequest = async (req, res) => {
    try {
        let {updationRequestId,update_request_approved} = req.body

        update_request_approved = update_request_approved!==undefined?update_request_approved:0;


        if(parseInt(update_request_approved)==2){

            await Execute.Query(req.dbName,
                "update supplier_product_updation_request set  update_request_approved=2 where id=?",[updationRequestId])
        
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }else{
           
        let query = ` select *
            from supplier_product_updation_request 
            where id=${updationRequestId}`;
        
        let updationData = await Execute.Query(req.dbName,query,[]);
        
        let {payment_after_confirmation ,
            cart_image_upload ,name ,price_unit ,product_desc ,sku ,bar_code ,commission , 
            commission_type ,commission_package ,measuring_unit,quantity ,brand_id,is_product,
            pricing_type,duration, making_price,product_tags,Size_chart_url,country_of_origin,
            purchase_limit,is_subscription_required,allergy_description,is_allergy_product,
            is_appointment,special_instructions,product_id
            } = updationData[0];

            let queryForUpdation = ` update product set  payment_after_confirmation=? ,
            cart_image_upload=? ,name =?,price_unit=? ,product_desc =?,sku =?,bar_code =?,commission=? , 
            commission_type=? ,commission_package =?,measuring_unit=?,quantity=? ,brand_id=?,is_product=?,
            pricing_type=?,duration=?, making_price=?,product_tags=?,Size_chart_url=?,country_of_origin=?,
            purchase_limit=?,is_subscription_required=?,allergy_description=?,
            is_allergy_product=?,is_appointment=?,special_instructions=?
             where id=? `;

            let updationParams = [
                payment_after_confirmation ,
                cart_image_upload ,name ,price_unit ,product_desc ,sku ,bar_code ,commission , 
                commission_type ,commission_package ,measuring_unit,quantity ,brand_id,is_product,
                pricing_type,duration, making_price,product_tags,Size_chart_url,country_of_origin,
                purchase_limit,is_subscription_required,allergy_description,is_allergy_product,is_appointment,special_instructions,
                product_id
            ]

            await Execute.Query(req.dbName,queryForUpdation,updationParams)


        let queryMl = ` select *
            from supplier_updation_request_product_ml 
            where updation_request_id=${updationRequestId}`;
        
        let updationMlData = await Execute.Query(req.dbName,queryMl,[]);
            console.log("=================product_id===================",product_id);
            console.log("=================product_id===================",product_id);

        if(updationMlData && updationMlData.length>0){
            for(const [index,i] of updationMlData.entries()){
                let query = "update product_ml set name=?, product_desc=?, measuring_unit=? where language_id=? and product_id=?";
                await Execute.Query(req.dbName,query,[i.name,i.product_desc,i.measuring_unit,i.language_id,product_id]);
            }

    
        }

            


        let queryImages = ` select *
        from product_image_request 
        where update_request_id=${updationRequestId}`;
    
        let updationImagesData = await Execute.Query(req.dbName,queryImages,[]);

        if(updationImagesData && updationImagesData.length>0){
            await Execute.Query(req.dbName,
                "delete from product_image where product_id=?",[product_id]);

            for(const [index,i] of updationImagesData.entries()){   
                let query = "INSERT INTO  product_image (image_path, default_image, imageOrder, product_id) VALUES(?,?,?,?)"
                await Execute.Query(req.dbName,query,[i.image_path,i.defaul_image,i.imageOrder,product_id]);
            }
        }

        await Execute.Query(req.dbName,
                "update supplier_product_updation_request set  update_request_approved=1 where id=?",[updationRequestId])
        

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}


const approveSupplierProductPricingUpdationRequest = async (req, res) => {
    try {
        let {updationRequestId,update_request_approved} = req.body

        let query = ` select *
            from product_pricing_updation_request 
            where id IN (${updationRequestId})`;
        
        let updationData = await Execute.Query(req.dbName,query,[]);
        if(updationData && updationData.length>0 && update_request_approved == 1){

            let product_id = updationData[0].product_id;
            let query = "delete from product_pricing where product_id=?";
            await ExecuteQ.Query(req.dbName,query,[product_id]);

            for(const [index,i] of updationData.entries()){
                let {
                    user_type ,start_date ,end_date ,offer_name ,price ,display_price ,handling , 
                    handling_supplier ,can_urgent ,urgent_price,house_cleaning_price ,beauty_saloon_price,commission,
                    delivery_charges,price_type, commission_type,urgent_type,min_hour,max_hour,
                    per_hour_price,urgent_value,pricing_type,gst_price,
                    user_type_id,product_id
                    } = i;
    
                let queryForUpdation = `insert into product_pricing (start_date ,end_date ,offer_name ,price ,display_price ,handling , 
                    handling_supplier ,can_urgent ,urgent_price,house_cleaning_price ,beauty_saloon_price,commission,
                    delivery_charges,price_type, commission_type,urgent_type,min_hour,max_hour,
                    per_hour_price,urgent_value,pricing_type,gst_price,
                    user_type_id,product_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    
                let params = [
                    start_date ,end_date ,offer_name ,price ,display_price ,handling , 
                    handling_supplier ,can_urgent ,urgent_price,house_cleaning_price ,beauty_saloon_price,commission,
                    delivery_charges,price_type, commission_type,urgent_type,min_hour,max_hour,
                    per_hour_price,urgent_value,pricing_type,gst_price,
                    user_type_id,product_id 
                ]  
    
                await ExecuteQ.Query(req.dbName,queryForUpdation,params);

                // sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

            }




            await ExecuteQ.Query(req.dbName,`
            update product_pricing_updation_request set update_request_approved=${update_request_approved} where id=${updationRequestId}
            `,[])
         
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);


        } else if (updationData && updationData.length>0 && update_request_approved == 2) {
            await ExecuteQ.Query(req.dbName,`
            update product_pricing_updation_request set update_request_approved=${update_request_approved} where id=${updationRequestId}
            `,[])
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
        
        else{
                sendResponse.sendErrorMessage("No updation request found",res,400);
        }
        
    } catch (err) {
        console.log("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}


const createTapSupplierDestination = async (req, res) => {
    try {
        let display_name = req.body.display_name
        let business_id = req.body.business_id
        let business_entity_id = req.body.business_entity_id 

        let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
        [
        config.get("payment.tap.secret_key")
    ])
    logger.debug("====SaDDed==keyData!==>>",keyData);

    if(keyData && keyData.length>0){
        let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
        let tap_secret_key = keyData[0].value

        logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)

        var options = { method: 'POST',
        url: tapUrl+"/v2/destination",
        headers: 
        { 'content-type': 'application/json',
            authorization: "Bearer "+ tap_secret_key },
        body: 
        {
            "display_name": display_name,
            "business_id": business_id,
            "business_entity_id": business_entity_id
        },
        json: true };
        logger.debug("===========options==++++",options,JSON.stringify(options))
        request(options, async function (error, response, body) {
            logger.debug("---Err---->>",error,body);
            if(error){
                return sendResponse.sendErrorMessage("Error creating tap destination",reply,400);
            }
            else{
                sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
            }
        })
    }
    else{
        
        let Err = "Keys not added for tap payment gateway";

        return sendResponse.sendErrorMessage(Err,res,400);
    }
     
    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("===========err========", err);
        var message = "Something went wrong";
        sendResponse.sendErrorMessage(message, res, 400)
        // sendResponse.somethingWentWrongError(res);
    }
}

class branch{
    /**
     * @description used for copy data from one branch to other branch
     * @param {*Object} req 
     * @param {*Object} res 
     * @param {*function} next 
     */
    static async copyData(req,res,next){
        try{

            let _dbName=req.dbName;
            let _branchId=req.body.toBranchId;
            let _mainBranchId=req.body.fromBranchId;
            let _products=await model.supplier.branch.productList(_dbName,_mainBranchId);
            await model.supplier.branch.deleteIfDupExistInBranch(_dbName,_products,_branchId);

            let _cpProducts=await model.supplier.branch.copyProduct(_dbName,_products);
            await model.supplier.branch.copyProductName(_dbName,_cpProducts.products);
            await model.supplier.branch.copyProductImages(_dbName,_cpProducts.products);
            await Universal.copyAddsOnExistingPoduct(req.dbName,_cpProducts.originalIds,_cpProducts.insertedIds);
            await model.supplier.branch.copyProductPrice(_dbName,_cpProducts.products);
            await model.supplier.branch.addProductInSupplierBranch(_dbName,_mainBranchId,_branchId,_cpProducts.products);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }catch(Err){
            sendResponse.sendErrorMessageWithTranslation(req,"Something went wrong", res, 400)
        }
    }
    /**
     * @description used for list an branch 
     * @param {*Object} req 
     * @param {*Object} res 
     * @param {*function} next 
     */
    static async list(req,res,next){
        try{
            let _supplierId=req.query.supplierId
            let bData=await model.supplier.branch.list(_supplierId,req.dbName);
            sendResponse.sendSuccessData(bData, constant.responseMessage.SUCCESS, res, 200);
        }catch(Err){
            logger.debug("==branch list =Err=",Err)
            sendResponse.sendErrorMessageWithTranslation(req,"Something went wrong", res, 400)
        }
    }
    /**
     * @description used for update password branch
     * @param {*Object} req 
     * @param {*Object} res 
     * @param {*Function} next 
     */
    static async updatePwd(req,res,next){
        try{
            let _password = req.body.password;
            let _supplierId = req.body.supplierId || req.supplier.supplier_id;
            let _branchId=req.body.branchId || req.supplier.id;
            let _encyptPwd =md5(_password);
            await model.supplier.branch.updatePwd(req.dbName,_branchId,_encyptPwd);
            let branchData=await model.supplier.branch.data(["email"],req.dbName,[_branchId]);
            let email =branchData && branchData.length>0?branchData[0].email:"";
            emailTemp.userResetpassword(req,res,email,_password,function(err,result){
                // if(err){
                    console.log("..****register email*****....",err);
                // }
            });
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
        catch(Err){
            sendResponse.sendErrorMessageWithTranslation(req,"Something went wrong", res, 400)
        }

    }
}

function getSupplierOpenStatus(dbName, supplierId) {
    return new Promise(async (resolve, reject) => {
        try {
            var query = " select id,is_open from supplier_timings where supplier_id = ? ";
            let data = await ExecuteQ.Query(dbName, query, [supplierId]);

            if (data && data.length > 0) {
                resolve(data[0].is_open)
            } else {
                resolve(0)
            }

        }
        catch (Err) {
            reject(Err)
        }
    })
}


module.exports={
    branch:branch,
    Supplier:Supplier,
    updateSupplierAvailibilityOnOff:updateSupplierAvailibilityOnOff,
    holdSupplierTableSlots:holdSupplierTableSlots,
    listSupplierTablesCapacities:listSupplierTablesCapacities,
    addOrderTypeWiseGateways:addOrderTypeWiseGateways,
    updateOrderTypeWiseGateways:updateOrderTypeWiseGateways,
    deleteOrderTypeWiseGateway:deleteOrderTypeWiseGateway,
    listOrderTypeWiseGateway:listOrderTypeWiseGateway,
    updateSupplierImages:updateSupplierImages,
    addUpdateWeightWiseDeliveryCharge:addUpdateWeightWiseDeliveryCharge,
    deleteWeightWiseDeliveryCharge:deleteWeightWiseDeliveryCharge,
    listWeightWiseDeliveryCharge:listWeightWiseDeliveryCharge,
    addUpdateSupplierFlavor:addUpdateSupplierFlavor,
    unassignTagsToSupplier:unassignTagsToSupplier,
    assignTagsToSupplier:assignTagsToSupplier,
    addSupplierTags:addSupplierTags,
    updateSupplierTags:updateSupplierTags,
    listSupplierTags:listSupplierTags,
    deleteSupplierTag:deleteSupplierTag,
    AssignCatToSupplr:AssignCatToSupplr,
    updateSupplierPassword:updateSupplierPassword,
    listSuppliers : listSuppliers,
    addSupplierGeoFence: addSupplierGeoFence,
    updateSupplierGeoFence:updateSupplierGeoFence,
    deleteSupplierGeoFence:deleteSupplierGeoFence,
    listSupplierGeoFence:listSupplierGeoFence,
    AddSupplierAvailability:AddSupplierAvailability,
    UpdateSupplierAvailability:UpdateSupplierAvailability,
    GetSupplierAvailability:GetSupplierAvailability,
    listSupplierOrderGeoFence:listSupplierOrderGeoFence,
    deleteSupplierOrderGeoFence:deleteSupplierOrderGeoFence,
    updateSupplierOrderGeoFence:updateSupplierOrderGeoFence,
    addSupplierOrderGeoFence:addSupplierOrderGeoFence,
    deleteSlotsTimings:deleteSlotsTimings,
    getSupplierSlots:getSupplierSlots,
    getSupplierAvailabilityAccToOrderType:getSupplierAvailabilityAccToOrderType,
    AddSupplierTables:AddSupplierTables,
    listSupplierTables:listSupplierTables,
    updateSupplierTables:updateSupplierTables,
    deleteSupplierTable:deleteSupplierTable,
    addTableQrCode:addTableQrCode,
    listSupplierBokingRequests:listSupplierBokingRequests,
    updateTableBookingStatus:updateTableBookingStatus,
    makeTableBookingRequest:makeTableBookingRequest,
    listUserBokingRequests:listUserBokingRequests,
    listSupplierTablesForUser:listSupplierTablesForUser,
    assignTableToUser:assignTableToUser,
    verifyTableNumber:verifyTableNumber,
    acceptTableInvitation:acceptTableInvitation,
    genrateTableDeeplink:genrateTableDeeplink,
    updateTableNumber:updateTableNumber,
    listSupplierTagsBySupplierId:listSupplierTagsBySupplierId,
    listAllSuppliers:listAllSuppliers,
    updateSupplierProductOffer:updateSupplierProductOffer,
    updateSupplierSequenceNumber:updateSupplierSequenceNumber,
    getSlotsBufferTime:getSlotsBufferTime,
    addSupplierUpdationRequest:addSupplierUpdationRequest,
    getSupplierUpdationRequests:getSupplierUpdationRequests,
    getSupplierUpdationRequestsBySupplier:getSupplierUpdationRequestsBySupplier,
    approveSupplierUpdationRequest:approveSupplierUpdationRequest,
    getSupplierProductUpdationRequests:getSupplierProductUpdationRequests,
    approveSupplierProductUpdationRequest:approveSupplierProductUpdationRequest,
    getSupplierProductPricingUpdationRequests:getSupplierProductPricingUpdationRequests,
    approveSupplierProductPricingUpdationRequest:approveSupplierProductPricingUpdationRequest,
    addSupplierQrCode:addSupplierQrCode,
    addSupplierQrCodeByAdmin:addSupplierQrCodeByAdmin
}

