/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an dashboard related action from admin panel
 * ==========================================================================
 */
var mysql = require('mysql');
var async = require('async');
var func = require('../../routes/commonfunction');
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
const runTimeDbConnection = require('../../routes/runTimeDbConnection')
var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD


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

const ListDeliveryCompanyAgents = async (req, res) => {
    try {
        logger.debug("=============enter=================");
        
        let delivery_company_id = req.query.delivery_company_id
        var supplierId = req.query.supplierId != null && req.query.supplierId != undefined && req.query.supplierId != 0 ? req.query.supplierId : ""
        var startDate = req.query.startDate || '1990-01-01';
        var endDate = req.query.endDate || '2100-01-01';
        var is_admin = req.query.is_admin==undefined?0:req.query.is_admin;
        var country_code = req.query.country_code ? req.query.country_code : ''
        var country_code_type = req.query.country_code_type ? req.query.country_code_type : ''
        // var admin;

        // if(req.query.is_admin==undefined){
        //     is_admin = req.query.is_admin 
        // }else{
        //     admin=1
        // }
        is_admin = parseInt(is_admin)
        let order_by = parseInt(req.query.order_by);
        let is_desc = parseInt(req.query.is_desc);
        if (order_by == 1) {
            if (is_desc && is_desc > 0) {
                order = "order by cbu.commission desc"
            } else {
                order = "order by cbu.commission asc"
            }
        } else if (order_by == 2) {
            if (is_desc && is_desc > 0) {
                order = "order by revenue desc"
            } else {
                order = "order by revenue asc"
            }
        } else {
            order = "order by cbu.id desc"
        }
        let search = req.query.search == undefined ? "" : req.query.search
        let limit = req.query.limit == undefined ? 10 : parseInt(req.query.limit)
        let offset = req.query.offset == undefined ? 0 : parseInt(req.query.offset)
        var GetAgentDbData = await GetAgentDbInformation(req.dbName);
        logger.debug("=============DATABASE=================", GetAgentDbData);
        let finalResult=[];
        var AgentConnection = await RunTimeAgentConnection(GetAgentDbData);
        var AgentData = await AgentList(AgentConnection,
             search, limit, offset, order, supplierId,
              startDate, endDate, is_admin,req.dbName,
              country_code,country_code_type,delivery_company_id)
       
       if(AgentData && AgentData.length>0){
           for(const [index,i] of AgentData.entries()){
               if(i.supplier_id!="0" && i.supplier_id!=null && i.supplier_id!=""){
                   logger.debug("==i.supplier_id===",i.supplier_id)
                   let ids=i.supplier_id.split(",")
                   logger.debug("=====ids==>>",ids)
                   let names=await ExecuteQ.Query(req.dbName,"select CAST(GROUP_CONCAT(name SEPARATOR ',') AS CHAR) as name from supplier where id IN (?)",[ids]);
                    i.supplier_name=names[0].name
                    finalResult.push(i)
               }
               else{
                     finalResult.push(i)
               }
            
           }
       }
    //    CONCAT(',',cbu.supplier_id, ',') REGEXP ',("+supplierId+"),'
        var AgentListTotalCount = await AgentListWithoutPagination(AgentConnection,
             search,order, supplierId, startDate, endDate,
              is_admin,country_code,country_code_type,delivery_company_id)
       
        var dataToSend = {
            AgentList: finalResult,
            count: AgentListTotalCount
        }
        //  logger.debug("==============Agent Connection====================",AgentConnection);
        // var AvailTime=await AvailTimeList(DbName);
        // var FinalData=await SynchAgentWithAvailTime(AgentData,AvailTime)
        sendResponse.sendSuccessData(dataToSend, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }
}

function AgentList(AgentConnection, search, limit,
     offset, order, supplierId, startDate, endDate,
      is_admin,dbName, country_code,
      country_code_type,delivery_company_id) {
    return new Promise(async (resolve, reject) => {

        var country_code_query = ""
        if(country_code!='' && country_code_type!=''){
            if(country_code_type=='1'){
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cbu.country_code LIKE '"+cc_array[i]+"' or cbu.country_code LIKE '+"+cc_array[i]+"') "
                }
            }else{
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cbu.country_code NOT LIKE '"+cc_array[i]+"' and cbu.country_code NOT LIKE '+"+cc_array[i]+"') "
                }
            }
        }
        logger.debug("======here in agent list function============")
        var sql = "select cbu.avg_rating,cbu.total_rating,cbu.total_review,cbu.base_price, cbu.delivery_charge_share, cbu.order_accepted_count,cbu.order_rejected_count,cbu.employee_id,cbu.agent_commission_type,IFNULL(sum(cbo.commission_ammount),0) AS revenue,cbu.supplier_name,cbu.id,cbu.iso,cbu.country_code,cbu.email,cbu.experience,cbu.occupation,cbu.name,cbu.area_id, "
        sql += "cuc.name as agent_category_name,cbu.stripe_account, cbu.assigned_id, cbu.agent_category_id, (select count(id)  from cbl_user_orders where user_id=cbu.id and status IN(1,3,10,11)) as active_orders, cbu.driver_license_number,cbu.car_model,cbu.car_color,cbu.is_car_insured,cbu.latitude,cbu.longitude,cbu.is_available, cbu.image, cbu.supplier_id,cbu.access_token,cbu.device_type,cbu.device_token, "
        sql += "cbu.commission,cbu.last_login,cbu.is_active,cbu.drivingLicenseUrl,cbu.drivingLicenseBackUrl,cbu.vehicleRegisterationUrl,cbu.vehicleRegisterationBackUrl, cbu.thumb_nail,cbu.country,cbu.city,cbu.state,cbu.phone_number,cbu.ip_address, "
        sql += "cbu.offset,cbu.created_by from cbl_user cbu left join cbl_user_orders cbo on cbu.id = cbo.user_id and DATE(cbo.created_on) >='"+startDate+"' and DATE(cbo.created_on) <='"+endDate+"'   left join cbl_user_categories cuc on cuc.id = cbu.agent_category_id "
        sql += "where delivery_company_id="+delivery_company_id+" and "
        logger.debug("==========checkisadmin=========",is_admin)
        if (is_admin == 0) {
            if (supplierId != "") {
                sql += " CONCAT(',',cbu.supplier_id, ',') REGEXP ',("+supplierId+"),' AND "
            }
            else {
                // sql += " cbu.supplier_id != 0 AND "
            }
        } else {
            sql += " cbu.supplier_id = 0 AND "
        }
        sql += "cbu.deleted_by=? AND (cbu.id LIKE '%" + search + "%' OR cbu.name LIKE '%" + search + "%' OR cbu.email LIKE '%" + search + "%') "+country_code_query+" group by cbu.id " + order + " limit ?,?"
        // logger.debug("============AgentConnection in agent list===========",AgentConnection)

         let data = await ExecuteQ.QueryAgent(AgentConnection,sql,[0, offset, limit]);

if(data && data.length>0){
            const settingDataKeys = await func.getSettingDataKeyAndValue(dbName, ['addDocumentsInAgent']);
            settingDataKeys.keyAndValue.addDocumentsInAgent = !!settingDataKeys.keyAndValue.addDocumentsInAgent;
           if(settingDataKeys.keyAndValue.addDocumentsInAgent === true){
   
               // const userIds = data.map((rec)=>rec.id);
               const userIds=_.pluck(data, 'id')
               // const sqlUser = `SELECT id, cbl_user_id, docUrl FROM cbl_user_documents WHERE cbl_user_id IN (${new Array(userIds.length).fill('?').join()});`;
               const sqlUser = `SELECT id, cbl_user_id, docUrl FROM cbl_user_documents WHERE cbl_user_id IN (${userIds.join()})`
               const dataSql = await ExecuteQ.QueryAgent(AgentConnection,sqlUser,userIds);
     
                           if(dataSql && dataSql.length>0){
                         const clbUser={};
                         dataSql.map((rec)=>{
                               if(clbUser[rec.cbl_user_id]){
                                 clbUser[rec.cbl_user_id].push({id:rec.id, cbl_user_id:rec.cbl_user_id, docUrl: rec.docUrl});
                               }else{
                                 clbUser[rec.cbl_user_id] = [];
                                 clbUser[rec.cbl_user_id].push({id:rec.id, cbl_user_id:rec.cbl_user_id, docUrl: rec.docUrl});
                               }
                         });
     
                         data.map(rec=>{
                             if(clbUser[rec.id]){
                                 rec.documents = clbUser[rec.id];
                             }else{
                                 rec.documents = [];
                             }
                             
                         });
     
                     }else{
     
                         data.map(rec=>{
                             rec.documents = [];
                         });
     
                     }
           }
   
           let finaData=[]
           for(const [index,j] of data.entries()){
               j.reviewList=await ExecuteQ.QueryAgent(AgentConnection,"select order_id,user_id,status,rating,reveiw from cbl_user_rating where user_id=?",[j.id])
               finaData.push(j)
           }
           resolve(finaData)
         }else{
            let finaData=[]
            resolve(finaData)

         }


        
    })
}
function AgentListWithoutPagination(AgentConnection,
     search,order, supplierId, startDate, endDate,
      is_admin,country_code,country_code_type,delivery_company_id) {
    return new Promise((resolve, reject) => {
        
        var country_code_query = ""
        if(country_code!='' && country_code_type!=''){
            if(country_code_type=='1'){
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cbu.country_code LIKE '"+cc_array[i]+"' or cbu.country_code LIKE '+"+cc_array[i]+"') "
                }
            }else{
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cbu.country_code NOT LIKE '"+cc_array[i]+"' and cbu.country_code NOT LIKE '+"+cc_array[i]+"') "
                }
            }
        }
        var sql = "select  IFNULL(sum(cbo.commission_ammount),0) AS revenue,cbu.supplier_name,cbu.id,cbu.email,cbu.experience,cbu.occupation,cbu.name,cbu.base_price, cbu.delivery_charge_share,cbu.area_id, "
        sql += "cbu.latitude,cbu.longitude,cbu.is_available, cbu.image, cbu.supplier_id,cbu.access_token,cbu.device_type,cbu.device_token, "
        sql += "cbu.commission,cbu.last_login,cbu.is_active, cbu.thumb_nail,cbu.country,cbu.city,cbu.state,cbu.phone_number,cbu.ip_address, "
        sql += "cbu.offset,cbu.created_by from cbl_user cbu left join cbl_user_orders cbo on cbu.id = cbo.user_id and DATE(cbo.created_on) >='"+startDate+"' and DATE(cbo.created_on) <='"+endDate+"' where  delivery_company_id="+delivery_company_id+" and "
        if (is_admin == 0) {
            if (supplierId != "") {
                sql += " CONCAT(',',cbu.supplier_id, ',') REGEXP ',("+supplierId+"),' AND "
            }
            else {
                // sql += " cbu.supplier_id != 0 AND "
            }
        } else {
            sql += " cbu.supplier_id = 0 AND "
        }
        sql += "cbu.deleted_by=? AND (cbu.id LIKE '%" + search + "%' OR cbu.name LIKE '%" + search + "%' OR cbu.email LIKE '%" + search + "%') "+country_code_query+" group by cbu.id " + order + " "
        var st = AgentConnection.query(sql, [0], function (err, data) {
            logger.debug(st.sql);
            if (err) {
                reject(err)
            }
            else {
                logger.debug("===DATA!=======AgentListWithoutPagination======", data)
                if(data && data.length>0){
                    resolve(data.length)
                }else{
                    let len = 0;
                    resolve(len)
                }
            }
        })
    })
}

function GetAgentDbInformation(dbName) {
    logger.debug("===dbName============2", dbName);
    return new Promise((resolve, reject) => {
        var sql = "select name,user,password,host from agent_db"
        multiConnection[dbName].query(sql, [], function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                logger.debug("====DATA===", data);
                if (data && data.length > 0) {
                    resolve(data[0])
                }
                else {
                    reject()
                }
            }
        })
    })
}
function RunTimeAgentConnection(data) {
    var decipher = crypto.createDecipher(algorithm, crypto_password)
    var password = decipher.update(data.password, 'hex', 'utf8')
    password += decipher.final('utf8');
    // logger.debug("=====password===",password);
    return new Promise((resolve, reject) => {
        resolve(
            runTimeDbConnection.runTimeDbConnections(
                data.name,
                data.host,
                data.user,
                password
            )
        )
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
    dashboard:dashboard,
    ListDeliveryCompanyAgents:ListDeliveryCompanyAgents,
    deliveryCompanyProfile:deliveryCompanyProfile
}