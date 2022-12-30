var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');
var reports = require('./Reports');
var common = require('../common/agent')
const moment = require('moment')
var log4js = require('log4js');
const uploadMgr = require('../lib/UploadMgr')
let ExecuteQ=require('../lib/Execute')
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const _=require('underscore');
const Universal=require('../util/Universal')
/**
 * @description used for graphical data of orders like which time most order occur
 */
exports.orderGrapicalReport = function (req, res) {
    logger.debug("+===============",req.body)
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startDate=req.body.startDate|| '1990-01-01';
    var endDate=req.body.endDate|| '2100-01-01';
    var manValues = [accessToken, sectionId];
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    let supplierId=req.body.supplier_id || 0
    logger.debug("===man values=====",manValues)
    let sqlAnd=""
    if(parseInt(supplierId)!=0){
        sqlAnd=" and s.id="+supplierId+""
    }
    // let sql=""
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            // },
            // function (id, cb) {
            //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            // },
            async function (cb) {
                var sql = " select DATE_FORMAT(o.created_on,'%H:%i:%s') as slots_time,o.created_on ,o.id,o.status,u.id as user_id,u.email user_email,u.firstname,s.name supplier_name,  ";
                sql += "  o.order_source,o.schedule_order from orders o join supplier_branch b on  ";
                sql += "  o.supplier_branch_id = b.id join supplier s on s.id = b.supplier_id join user u on u.id = o.user_id  ";
                sql += "  where DATE( o.created_on ) >= '"+startDate+"' AND DATE( o.created_on ) <=  '"+endDate+"' "+sqlAnd+"";
                let oData=await ExecuteQ.Query(req.dbName,sql,[]);
                let slotsData=
                [
                {"from_time":"00:00:00","to_time":"02:00:00","orderCount":0},
                {"from_time":"02:00:00","to_time":"04:00:00","orderCount":0},
                {"from_time":"04:00:00","to_time":"06:00:00","orderCount":0},
                {"from_time":"06:00:00","to_time":"08:00:00","orderCount":0},
                {"from_time":"08:00:00","to_time":"10:00:00","orderCount":0},
                {"from_time":"10:00:00","to_time":"12:00:00","orderCount":0},
                {"from_time":"12:00:00","to_time":"14:00:00","orderCount":0},
                {"from_time":"14:00:00","to_time":"16:00:00","orderCount":0},
                {"from_time":"16:00:00","to_time":"18:00:00","orderCount":0},
                {"from_time":"18:00:00","to_time":"20:00:00","orderCount":0},
                {"from_time":"20:00:00","to_time":"22:00:00","orderCount":0},
                {"from_time":"22:00:00","to_time":"24:00:00","orderCount":0}]
                if(oData && oData.length>0){
                    for(const [index,i] of oData.entries()){
                            for(const[ind,j] of slotsData.entries()){
                                if(i.slots_time>=j.from_time && i.slots_time<j.to_time){
                                    logger.debug("=====ENTER==>>",i.slots_time,j)
                                    j.orderCount++;
                                }
                            }
                    }
                }
               let finalSlotsData=_.sortBy( slotsData, function( item ) { return -item.orderCount; } )
               cb(null,finalSlotsData)
            }
        ], function (error, result) {
            if (error) {
                console.log("ee",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData({slots:result}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );


}

exports.orderReport = function (req, res) {
    
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.offset;
    var noOfRecords = req.body.limit;
    var order_by = req.body.order_by;
    var is_desc = req.body.is_desc
    var id = req.body.id|| "";
    var status = req.body.status|| "";
    var email = req.body.email|| "";
    var supplier = req.body.supplier|| "";
    var city = req.body.city|| "";
    var zone = req.body.zone|| "";
    var source = req.body.source|| "";
    var schedule = req.body.schedule|| "";
    var startDate=req.body.startDate|| '1990-01-01';
    let branchId=req.body.branch_id || 0;
    var endDate=req.body.endDate|| '2100-01-01';
    var manValues = [accessToken, sectionId];
    let user_type_id = req.body.user_type_id==undefined?0:req.body.user_type_id
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    logger.debug("===man values=====",manValues)
    var final={};
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                reports.orderListing(req,req.dbName,res, startLimit,
                     noOfRecords,id,status,email,supplier,source,
                     schedule,startDate,endDate,order_by,is_desc,
                     is_download,user_type_id, cb,branchId);
            },
            function(list,cb){
                if(list){
                    logger.debug("+=================1===============")
                    cb(null,list)
                }else{
                    logger.debug("+=================2===============")
                    final.orders=[];
                    final.count=0;
                    cb(null,final)
                }
              
            }
        ], function (error, result) {

            if (error) {
                console.log("ee",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );


}


/**
 * 
 * @todo
 * @author Parijat Chauhan
 */

exports.userSubscriptionReport = async function (req, res) {
    const accessToken = req.body.accessToken;
    const sectionId = req.body.sectionId;
    const id = req.body.id|| "";

    const startLimit = req.body.offset;
    const noOfRecords = req.body.limit;
    const startDate=req.body.startDate||'1990-01-01';
    const endDate=req.body.endDate||'2100-01-01';
    const is_download = req.body.is_download == null ? 0 : req.body.is_download
    const manValues = [accessToken, sectionId];

    logger.debug("==========body========",req.body);

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                reports.userSubscriptionListing(req.dbName,res, startLimit, noOfRecords, startDate,id,endDate,is_download, cb);
            },
            function (list,cb) {
                cb(null,list)
            }
        ], function (error, result) {

            if (error) {
                logger.debug("=============err===qqqq=",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                logger.debug("=====last===result============",result);
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );    
}


/**
 * @description used for agent report download csv and listing
 */

exports.agentReport = async function (req, res) {
    var is_admin = req.body.is_admin!=undefined?req.body.is_admin:0
    is_admin = parseInt(is_admin)
    var search = req.body.search!=undefined?req.body.search:"";
    var order_by = req.body.order_by;
    var is_desc = req.body.is_desc
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var offset = req.body.offset;
    var limit = req.body.limit;
    var startDate=req.body.startDate|| '1990-01-01';
    var endDate=req.body.endDate|| '2100-01-01';
    var supplierId = req.body.supplierId!=null && req.body.supplierId!=undefined && req.body.supplierId!=0?req.body.supplierId:""
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    var manValues = [accessToken];
    var final={};
    var agentConnection;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
           async function (cb) {

                var getAgentDbData=await common.GetAgentDbInformation(req.dbName);  
                // logger.debug("========getAgentDbData===============",getAgentDbData)
                 agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                // logger.debug("========agentConnection===============",agentConnection)
                agentList(agentConnection,res, limit, offset,supplierId, 
                    startDate,endDate,order_by,is_desc,is_admin,search,is_download, cb,req);
            },
            function(list,cb){
                cb(null,list)
            }
        ], function (error, result) {

            if (error) {
                console.log("ee",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}




exports.userReport = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.offset;
    var noOfRecords = req.body.limit;
    var order_by = req.body.order_by;
    var is_desc = req.body.is_desc
    var id = req.body.id|| "";
    // var city = req.body.city|| "";
    // var zone = req.body.zone|| "";
    var startDate=req.body.startDate||'1990-01-01';
    var endDate=req.body.endDate||'2100-01-01';
    let is_download = req.body.is_download==undefined?0:req.body.is_download
    var manValues = [accessToken, sectionId];
    var final={};
    logger.debug("==========body========",req.body)
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                reports.userListing(req.dbName,res, startLimit, noOfRecords, 
                    startDate,id,endDate,order_by,is_desc,is_download, cb);
                
            },

            function (list,cb) {
                cb(null,list)
                // var sql = "select u.id,u.created_on,u.email from user u join "
                // sql += "orders o on u.id = o.user_id " 
                // sql += " WHERE DATE( u.created_on ) >= '"+startDate+"' AND DATE( u.created_on ) <=  '"+endDate+"'";
                // sql += "AND  u.id LIKE  '%"+id+"%'";
                // sql += " group by u.id order by u.id DESC "
                // multiConnection[req.dbName].query(sql, function (err, result) {
                //     //console.log("sql", sql);
                //     if (err) {
                //         sendResponse.somethingWentWrongError(res)
                //     }
                //     else {
                //     var count=result.length;
                //     final.user=list;
                //     final.count=count;
                //      cb(null,final);
                //     }
                // })
            }
        ], function (error, result) {

            if (error) {
                logger.debug("=============err===qqqq=",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                logger.debug("=====last===result============",result);
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}

/**
 * @description used for report of supplier and csv download
 */
exports.supplierReport = function (req, res) {
    
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.offset;
    var noOfRecords = req.body.limit;
    var order_by = req.body.order_by;
    var is_desc = req.body.is_desc
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    var manValues = [accessToken, sectionId];
    var email=req.body.email||""
        ,city=req.body.city||""
        ,zone=req.body.zone||""
        ,startDate=req.body.startDate||'1990-01-01'
        ,endDate=req.body.endDate||'2100-12-12'
        ,product=req.body.product||""
        ,final={};
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                logger.debug("======before supplier listing=======");
                reports.supplierListing(req.dbName,res, startLimit, noOfRecords,email,startDate,endDate,product,order_by,is_desc,is_download,cb);
                logger.debug("=====after supplier listing=============")
            },
            function (list,cb) {
                logger.debug("=========list>>>>>>>>>>>>>>>>",list)
                if(list){
                    cb(null,list)
                }else{
                    final.supplier=[];
                    final.count=0;
                    cb(null,final)
                }
                // console.log("======list=======",list)
                // var sql = "select s.id,s.email,s.created_on, ";
                // sql += " GROUP_CONCAT(DISTINCT p.name SEPARATOR ',') as products ";
                // sql += " from supplier s join ";
                // sql += "  supplier_product sp on sp.supplier_id = s.id join product p on p.id = sp.product_id ";
                // sql += " where s.email LIKE '%"+email+"%'AND DATE( s.created_on ) >= '"+startDate+"' AND DATE(s.created_on ) <=  '"+endDate+"' group by s.id  " +
                //        " having products LIKE '%"+product+"%'" +
                //        " order by s.id DESC ";
                // multiConnection[req.dbName].query(sql, function (err, result) {
                //     // console.log("===========",result)
                //     if (err) {
                //         sendResponse.somethingWentWrongError(res)
                //     }
                //     else {
                //     final.supplier=list;
                //     final.count = result.length;
                //         cb(null,final);
                //     }
                // });
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.areaReport = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    var zoneId  =   req.body.zoneId;
    var name= req.body.name||"";
    var noOfSupplier=req.body.noOfSupplier||0;
    var final={};
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                reports.areaListing(req.dbName,res, startLimit, noOfRecords,zoneId, cb);
            },
            function (list,cb) {
                var sql = "select a.id,a.name,COUNT(sd.id) as no_of_suppliers from area a left join supplier_delivery_areas sd on ";
                sql +=" a.id = sd.area_id where a.zone_id=? and a.is_deleted = 0 group by sd.area_id";
                multiConnection[req.dbName].query(sql,[zoneId],function(err,result)
                {
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{
                        final.area=list;
                        final.count=result.length;
                        cb(null,final);
                    }

                })
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.zoneReport = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    var name = req.body.name||"";
    var no_of_supplier = req.body.noOfSupplier||0;
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    var final={};
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                zoneListing(req.dbName,res, startLimit, noOfRecords,name,no_of_supplier, cb);
            },
            function (list,cb) {
                var sql = "select z.id,z.name,COUNT(sd.id) as no_of_suppliers from zone z left join supplier_delivery_areas sd ";
                sql +=" on z.id = sd.zone_id where z.name like'%"+name+"%' group by sd.zone_id having no_of_suppliers >="+no_of_supplier;
                multiConnection[req.dbName].query(sql,function(err,result)
                {
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{
                    var count=result.length;
                    final.zone=list;
                    final.count=count;
                     cb(null,final);
                    }

                }) 
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.adminReport = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    var email=req.body.email||""
        ,number=req.body.number||""
        ,superAdmin=req.body.superAdmin||""
        ,startDate=req.body.startDate||'1990-01-01'
        ,endDate=req.body.endDate||'2100-12-12'
        ,logins=req.body.logins||0
        ,final={};
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                adminListing(req.dbName,res, startLimit, noOfRecords,email,number,superAdmin,startDate,endDate,logins, cb);
            },
            function (list,cb) {
                var sql = "select a.email,a.phone_number,a.is_superadmin,a.created_on,COUNT(al.id) as no_of_logins from admin a ";
                sql +=" left join admin_login al on a.id = al.admin_id  where a.email LIKE '%"+email+"%' AND a.phone_number LIKE '%"+number+"%' " +
                    "AND DATE( a.created_on ) >= '"+startDate+"' AND DATE(a.created_on ) <=  '"+endDate+"' AND a.is_superadmin LIKE'%"+superAdmin+"%'" +
                    " group by a.id having no_of_logins >= "+logins;
                multiConnection[req.dbName].query(sql,function(err,result)
                {
                    if(err){
                        sendResponse.somethingWentWrongError(res)
                    }
                    else{
                        final.admin=list;
                        final.count=result.length;
                        cb(null,final);
                    }

                })
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.categoryReport = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    var name=req.body.name||""
        ,startDate=req.body.startDate||'1990-01-01'
        ,endDate=req.body.endDate||'2100-12-12'
        ,noOfSupplier=req.body.noOfSupplier||0
        ,final={};
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
               reports.categoryListing(req.dbName,res,startLimit,noOfRecords,name,startDate,endDate,noOfSupplier,cb);
            },
            function (list,cb) {
                var sql = "select c.name,c.created_on,COUNT(sc.id) as no_of_suppliers from categories c left join supplier_category sc ";
                sql +=" on c.id = sc.category_id where c.parent_id = 0 and c.name like'%"+name+"%' and DATE( c.created_on ) >= '"+startDate+"' AND DATE(c.created_on ) <=  '"+endDate+"' " +
                    "group by c.id having no_of_suppliers >="+noOfSupplier;
                multiConnection[req.dbName].query(sql,function(err,result)
                {
                    if(err){
                        sendResponse.somethingWentWrongError(res)
                    }
                    else{
                        final.category=list;
                        final.count= result.length;
                        cb(null,final);
                    }

                })
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.servicesReport = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    var name=req.body.name||""
        ,startDate=req.body.startDate||'1990-01-01'
        ,endDate=req.body.endDate||'2100-12-12'
        ,noOfSupplier=req.body.noOfSupplier||0
        ,final={};
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                serviceListing(req.dbName,res,startLimit,noOfRecords,name,startDate,endDate,noOfSupplier,cb);
            },
            function (list,cb) {
                var sql ="SELECT c.name, c.created_on, COUNT( sc.id ) as no_of_suppliers ";
                sql +=" FROM categories c ";
                sql +=" LEFT JOIN supplier_category sc ON c.id = sc.sub_category_id ";
                sql +=" WHERE c.parent_id in (select id from categories where parent_id = 0) and c.is_deleted = 0 and  c.name like'%"+name+"%' and DATE( c.created_on ) >= '"+startDate+"' AND DATE(c.created_on ) <=  '"+endDate+"' ";
                sql +=" GROUP BY c.id  having no_of_suppliers >="+noOfSupplier;
                multiConnection[req.dbName].query(sql,function(err,result)
                {
                    if(err){
                        sendResponse.somethingWentWrongError(res)
                    }
                    else{
                         final.services=list;
                        final.count=result.length;
                        cb(null,final)
                    }

                })

            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.productReport = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    var name=req.body.name||""
        ,noOfOrder=req.body.noOfOrder||0
        ,noOfSupplier=req.body.noOfSupplier||0
        ,final={};
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                productListing(req.dbName,res,startLimit,noOfRecords,name,noOfSupplier,noOfOrder,cb);
            },
            function (list,cb) {
            var sql = "select p.name,COUNT(sp.id) as no_of_suppliers,COUNT(op.id) as no_of_orders from product p left join ";
            sql +=" supplier_product sp on p.id = sp.product_id left join order_prices op on op.product_id = p.id where ";
            sql +=" sp.is_deleted = 0 and p.is_deleted = 0 and p.name like '%"+name +"%' group by p.id " +
                "having no_of_suppliers >="+noOfSupplier+" and no_of_orders >="+noOfOrder;
            multiConnection[req.dbName].query(sql,function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    final.product=list;
                    final.count=result.length;
                    cb(null,final);
                }

            })
        }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}
exports.adminProductReport = function(req,res)
{
    var final = {};
    const is_download = req.body.is_download==undefined?0:req.body.is_download;
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var category_id = req.body.category_id ? req.body.category_id : '';
    var sub_category_id = req.body.sub_category_id ? req.body.sub_category_id : '';
    var supplier_id = req.body.supplier_id ? req.body.supplier_id : '';
    var manValues = [accessToken, sectionId, limit, offset];
    var filterData = "";
    if(category_id!="" && sub_category_id==""){
        filterData += " and p.category_id='"+category_id+"'"
    }else if(category_id!="" && sub_category_id!=""){
        filterData += " and (p.category_id='"+category_id+"' or p.category_id='"+sub_category_id+"' or p.sub_category_id='"+sub_category_id+"' or p.detailed_sub_category_id='"+sub_category_id+"') "
    }
    if(supplier_id!=""){
        filterData += " and sb.supplier_id='"+supplier_id+"'"
    }
    var sort_by = req.body.sort_by ? req.body.sort_by : 'product_count';//1 - quantity,2 - product_count,3 - revenue
    
    let startDate = req.body.startDate==undefined?"":req.body.startDate
    let endDate = req.body.endDate==undefined?"":req.body.endDate
    let is_filter_to_list = req.body.is_filter_to_list == undefined?0:req.body.is_filter_to_list
    let list_filter_condition = ""
    // if(parseInt(is_filter_to_list)==1){
        list_filter_condition = "  and DATE(o.created_on) >= '"+startDate+"' and DATE(o.created_on) <= '"+endDate+"' "
    // }
    async.waterfall([
        function (cb) {
            console.log("11111111111")
            func.checkBlank(res, manValues, cb);
        },
        // function (cb) {
        //     console.log("22222222222222")
        //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        // },
        // function (id, cb) {
        //     console.log("33333333333")
        //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
        // },
        function (cb) {
            var sql = "SELECT o.id order_id,(select CAST(GROUP_CONCAT( COUNT(DISTINCT s.name) SEPARATOR ',') AS CHAR)) as name,op.product_id, p.`name` product_name, p.category_id, c.`name` category_name, p.sub_category_id, sb.supplier_id, sum(p.quantity) as quantity,SUM(op.price)/sum(p.quantity) as price,p.making_price,SUM(op.price) price_sum,SUM(p.making_price) making_price_sum,((SUM(op.price)+IFNULL(SUM(op.price),0)) - SUM(p.making_price)) revenue, count(op.product_id) as product_count FROM `orders` o left join order_prices op on o.id=op.order_id left join product p on op.product_id=p.id left join categories c on p.category_id=c.id left join categories sc on p.sub_category_id=sc.id left join supplier_branch sb on op.supplier_branch_id=sb.id left join supplier s on sb.supplier_id=s.id left join cart_adds_on cdo on cdo.cart_id=o.cart_id  WHERE o.status='5' "+filterData+" "+list_filter_condition+" group by p.name ORDER by "+sort_by+" DESC LIMIT "+offset+","+limit;
            console.log("adminProductReport sql =========",sql)
            multiConnection[req.dbName].query(sql,async function(err,result)
            {
                if(err){
                    console.log("5555555555555",err)
                    sendResponse.somethingWentWrongError(res);
                }
                else{

                    console.log("666666666666666666")
                    var sql2 = "SELECT o.id order_id FROM `orders` o left join order_prices op on o.id=op.order_id left join product p on op.product_id=p.id left join categories c on p.category_id=c.id left join categories sc on p.sub_category_id=sc.id left join supplier_branch sb on op.supplier_branch_id=sb.id left join supplier s on sb.supplier_id=s.id WHERE o.status='5' "+filterData+" "+list_filter_condition+" group by p.name";
                    let products=await ExecuteQ.Query(req.dbName,sql2,[]);
                    console.log("7777777777777",products)
                    final.data=result;
                    final.count=products.length;
                    let total_revenue = await getRevenueAccToDate(req.dbName,startDate,endDate,sort_by,filterData);
                    final.total_revenue = total_revenue
                    let total_product = await getOrdersAccToDate(req.dbName,startDate,endDate,sort_by,filterData);
                    final.total_product = total_product

                    // if its an download, upload file to cdn and send download link
                    if(parseInt(is_download)){

                        // let sql1 = sql.split('LIMIT')[0];
                        list_filter_condition = "";

                        let sql1 = "SELECT o.id order_id,(select CAST(GROUP_CONCAT( COUNT(DISTINCT s.name) SEPARATOR ',') AS CHAR)) as name,op.product_id, p.`name` product_name, p.category_id, c.`name` category_name, p.sub_category_id, sb.supplier_id, sum(p.quantity) as quantity,SUM(op.price)/sum(p.quantity) as price,p.making_price,SUM(op.price) price_sum,SUM(p.making_price) making_price_sum,((SUM(op.price)+IFNULL(SUM(op.price),0))- SUM(p.making_price)) revenue, count(op.product_id) as product_count FROM `orders` o left join order_prices op on o.id=op.order_id left join product p on op.product_id=p.id left join categories c on p.category_id=c.id left join categories sc on p.sub_category_id=sc.id left join supplier_branch sb on op.supplier_branch_id=sb.id left join supplier s on sb.supplier_id=s.id left join cart_adds_on cdo on cdo.cart_id=o.cart_id WHERE o.status='5' "+filterData+" "+list_filter_condition+" group by p.name ORDER by "+sort_by+" DESC" ;

                        let result = await ExecuteQ.Query(req.dbName,sql1,[]);

                        // return cb(null, result);
                        let header = [ 
                            {id: 'ORDER ID', title: 'ORDER ID'},
                            {id: 'PRODUCT ID', title: 'PRODUCT ID'},   
                            {id: 'PRODUCT NAME', title: 'PRODUCT NAME'}, 
                            {id: 'CATEGORY ID', title: 'CATEGORY ID'},
                            {id: 'CATEGORY NAME', title: 'CATEGORY NAME'},
                            {id: 'SUBCATEGORY ID', title: 'SUBCATEGORY ID'},
                            {id: 'SUPPLIER ID', title: 'SUPPLIER ID'},
                            {id: 'NAME', title: 'NAME'},
                            {id: 'QUANTITY', title: 'QUANTITY'},
                            {id: 'PRICE', title: 'PRICE'},
                            {id: 'MAKING PRICE', title: 'MAKING PRICE'},
                            {id: 'PRICE SUM', title: 'PRICE SUM'},
                            {id: 'MAKING PRICE SUM', title: 'MAKING PRICE SUM'},
                            {id: 'REVENUE', title:'REVENUE'},
                            {id: 'PRODUCT COUNT', title: 'PRODUCT COUNT'}
                          ]
                          let data = result.map((element)=>{
                              let temp = {}
                              temp["ORDER ID"] = element.order_id
                              temp["PRODUCT ID"] = element.product_id
                              temp["PRODUCT NAME"] = element.product_name
                              temp["CATEGORY ID"] = element.category_id
                              temp["CATEGORY NAME"] = element.category_name
                              temp["SUBCATEGORY ID"] = element.sub_category_id
                              temp["SUPPLIER ID"] = element.supplier_id
                              temp["NAME"] = element.name
                              temp["QUANTITY"] = element.quantity
                              temp["PRICE"] = element.price
                              temp["MAKING PRICE"] = element.making_price
                              temp["PRICE SUM"] = element.price_sum
                              temp["MAKING PRICE SUM"] = element.making_price_sum
                              temp["REVENUE"] = element.revenue
                              temp["PRODUCT COUNT"] = element.product_count
                              return temp;
                          })
                
                          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"admin_product_report_")
                          logger.debug("+==========csvLingk=========",csvLink)
                          return cb(null,{"csvFileLink":csvLink})
                        
                    } 
                    // if its not an download, return final data in response
                    return cb(null,final);
                }
            })
        }
        ], function (error, result) {

            if (error) {
                console.log("error ----- ",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}
const getRevenueAccToDate = (dbName,startDate,endDate,sort_by,filterData)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "SELECT DAYOFWEEK(o.created_on) as week_day,DATE(o.created_on) as created_at,(SUM(op.price) - SUM(p.making_price)) revenue FROM `orders` o left join order_prices op on o.id=op.order_id left join product p on op.product_id=p.id left join categories c on p.category_id=c.id left join categories sc on p.sub_category_id=sc.id left join supplier_branch sb on op.supplier_branch_id=sb.id left join supplier s on sb.supplier_id=s.id WHERE DATE(o.created_on) >= ? and DATE(o.created_on)<=? and o.status='5' "+filterData+" group by week_day ORDER by o.created_on DESC "
        let params = [startDate,endDate]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)
    })
}

const getOrdersAccToDate = (dbName,startDate,endDate,sort_by,filterData)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "SELECT DAYOFWEEK(o.created_on) as week_day,DATE(o.created_on) as created_at,count(p.id) as total_product FROM `orders` o left join order_prices op on o.id=op.order_id left join product p on op.product_id=p.id left join categories c on p.category_id=c.id left join categories sc on p.sub_category_id=sc.id left join supplier_branch sb on op.supplier_branch_id=sb.id left join supplier s on sb.supplier_id=s.id WHERE DATE(o.created_on) >= ? and DATE(o.created_on)<=? and o.status='5' "+filterData+" group by week_day ORDER by o.created_on DESC "
        let params = [startDate,endDate]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)
    })
}






exports.packageReport = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    var manValues = [accessToken, sectionId, startLimit, noOfRecords];
    var name=req.body.name||""
        ,noOfSupplier=req.body.noOfSupplier||0
        ,final={};
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                packageListing(req.dbName,res,startLimit,noOfRecords,name,noOfSupplier,cb);
            },
            function (list,cb) {
                var sql = "select p.name package_name,COUNT(sp.id) as no_of_suppliers from product p left join supplier_package sp ";
                sql +=" on p.id = sp.package_id where p.is_package = 1 and p.is_deleted = 0 and sp.is_deleted = 0 and p.name like '%"+name+"%' " +
                    "GROUP BY p.id having no_of_suppliers >="+noOfSupplier;
                multiConnection[dbName].query(sql,function(err,result)
                {
                    if(err){
                        sendResponse.somethingWentWrongError(res)
                    }
                    else{
                        final.package=list;
                        final.count=result.length;
                        cb(null,final)
                    }

                })
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


function productListing(dbName,res,startLimit,noOfRecords,name,noOfSupplier,noOfOrder,callback)
{
    var sql = "select p.name,COUNT(sp.id) as no_of_suppliers,COUNT(op.id) as no_of_orders from product p left join ";
    sql +=" supplier_product sp on p.id = sp.product_id left join order_prices op on op.product_id = p.id where ";
    sql +=" sp.is_deleted = 0 and p.is_deleted = 0 and p.name like '%"+name +"%' group by p.id " +
        "having no_of_suppliers >="+noOfSupplier+" and no_of_orders >="+noOfOrder+" " +
        "limit "+startLimit+","+noOfRecords;
    multiConnection[dbName].query(sql,function(err,result)
    {
        if(err){
            console.log("err",err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })
}


function  packageListing(dbName,res,startLimit,noOfRecords,name,noOfSupplier,callback)
{
    var sql = "select p.name package_name,COUNT(sp.id) as no_of_suppliers from product p left join supplier_package sp ";
    sql +=" on p.id = sp.package_id where p.is_package = 1 and p.is_deleted = 0 and sp.is_deleted = 0 and p.name like '%"+name+"%' " +
        "GROUP BY p.id having no_of_suppliers >="+noOfSupplier;
    sql +=" limit "+startLimit+","+noOfRecords;
    multiConnection[dbName].query(sql,function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null,result)
        }

    })

}


function serviceListing(dbName,res,startLimit,noOfRecords,name,startDate,endDate,noOfSupplier,callback)
{
    var sql ="SELECT c.name, c.created_on, COUNT( sc.id ) as no_of_suppliers ";
    sql +=" FROM categories c ";
    sql +=" LEFT JOIN supplier_category sc ON c.id = sc.sub_category_id ";
    sql +=" WHERE c.parent_id in (select id from categories where parent_id = 0) and c.is_deleted = 0 and  c.name like'%"+name+"%' and DATE( c.created_on ) >= '"+startDate+"' AND DATE(c.created_on ) <=  '"+endDate+"' ";
    sql +=" GROUP BY c.id  having no_of_suppliers >="+noOfSupplier+" limit "+startLimit+","+noOfRecords;
    multiConnection[dbName].query(sql,function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null,result);
        }

    })

}


exports.categoryListing = function(db_name,res,startLimit,noOfRecords,name,startDate,endDate,noOfSupplier,callback)
{
    var sql = "select c.name,c.created_on,COUNT(sc.id) as no_of_suppliers from categories c left join supplier_category sc ";
    sql +=" on c.id = sc.category_id where c.parent_id = 0 and c.name like'%"+name+"%' and DATE( c.created_on ) >= '"+startDate+"' AND DATE(c.created_on ) <=  '"+endDate+"' " +
        "group by c.id having no_of_suppliers >="+noOfSupplier+" limit "+startLimit+","+noOfRecords;
    console.log("sq",sql);
    multiConnection[db_name].query(sql,function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null,result);
        }

    })


}

exports.supplierListing = async function(db_name,res, startLimit, noOfRecords,email,startDate,endDate,product,order_by,is_desc,is_download, callback) {

        console.log("======in supplier listing function entry===========")

        var final = {}

        var order = ""
        order_by = parseInt(order_by)
        if(order_by==1){
            if(is_desc && is_desc>0){
                order = "order by s.email DESC"
            }else{
                order = "order by s.email ASC"
            }
        }else if(order_by==2){
            if(is_desc && is_desc>0){
                order = "order by s.created_on DESC"
            }else{
                order = "order by s.created_on ASC"
            }
        }else if(order_by==3){
            if(is_desc && is_desc>0){
                order = "order by no_of_orders DESC"
            }else{
                order = "order by no_of_orders ASC"
            }
        }else if(order_by==4){
            if(is_desc && is_desc>0){
                order = "order by revenue DESC"
            }else{
                order = "order by revenue ASC"
            }
        }else if(order_by==5){
            if(is_desc && is_desc>0){
                order = "order by s.commission DESC"
            }else{
                order = "order by s.commission ASC"
            }
        }
        else{
            order = "order by s.id"
        }


          var sql = "select s.id as s_id, s.email,s.name,s.created_on,s.commission, ( select COUNT(o.id) no_of_orders from orders o join supplier_branch sb on o.supplier_branch_id = sb.id "+
          "join supplier s on s.id = sb.supplier_id where o.status = 5 and s.id = s_id ) as no_of_orders, ( select IFNULL(SUM(o.supplier_commision),0) from orders o "+
          "join supplier_branch sb on o.supplier_branch_id = sb.id join supplier s on s.id = sb.supplier_id where o.status = 5 and s.id = s_id ) as revenue "+ //,GROUP_CONCAT(DISTINCT p.name SEPARATOR ',') as products "
          "from supplier s "+ //join supplier_product sp on sp.supplier_id = s.id  join product p on p.id = sp.product_id "+
          "where DATE(s.created_on) >= '"+startDate+"' AND DATE(s.created_on) <= '"+endDate+"' AND (s.name LIKE '%"+email+"%' or s.email LIKE '%"+email+"%') group by s.id "+  //having products LIKE '%"+product+"%'"+
          ""+order+ " LIMIT " + startLimit + "," + noOfRecords
        if(parseInt(is_download)){
            let sql1 = sql.split('LIMIT')[0];
            let result = await ExecuteQ.Query(db_name,sql1,[]);

            let finalList = await getOrdersRevenue(db_name,result);
            let header = [ 
                {id: 'ID', title: 'ID'},
                {id: 'NAME', title: 'NAME'}, 
                {id: 'EMAIL', title: 'EMAIL'},   
                {id: 'REGISTERED ON', title: 'REGISTERED ON'},
                {id: 'ORDERS DELIVERED', title: 'ORDERS DELIVERED'},
                {id: 'REVENUE', title: 'REVENUE'},
                {id: 'COMMISSION', title: 'COMMISSION'}
              ]
              let data = finalList.map((element)=>{
                  let temp = {}
                  temp.ID = element.s_id
                  temp.NAME = element.name
                  temp.EMAIL = element.email
                  temp["REGISTERED ON"] = moment(element.created_on).format('YYYY-MM-DD HH:mm:ss')
                  temp["ORDERS DELIVERED"] = element.no_of_orders
                  temp.REVENUE = element.revenue
                  temp.COMMISSION = element.commission
                  logger.debug("==temp.COMMISSION=",temp.COMMISSION)
                  return temp;
              })
    
              let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"supplier_list_")
              logger.debug("+==========csvLingk=========",csvLink)
              callback(null,{"csvFileLink":csvLink})
        }else{
            try{
                let result=await ExecuteQ.Query(db_name,sql,[]);
                if(!result.length){
                    callback(null,[])
                }else{
                    let count = await getListCount(sql,db_name);
                    final.supplier=await getOrdersRevenue(db_name,result)
                    final.count = count;
                    callback(null,final)
                }
            }
            catch(Err){
                sendResponse.somethingWentWrongError(res)
            }
            // let stmt = multiConnection[db_name].query(sql,async function (err, result) {
            //     logger.debug("===========result=======and sql query==================<>>>>>>>>>>>>>>>>>>>>",stmt.sql,result)
            //     if (err) {
            //         console.log("err",err)
            //         sendResponse.somethingWentWrongError(res)
            //     }
            //     else {
            //         if(!result.length){
            //             callback(null,[])
            //         }else{
        
            //             let count = await getListCount(sql,db_name);
            //             final.supplier=await getOrdersRevenue(db_name,result)
            //             final.count = count;
            //             callback(null,final)
            //         }
            //     }
        
            // })
        }
}
const supplierProfitAfterTaxCommission=(dbName,supplierBranchId)=>{

    return new Promise(async (resolve,reject)=>{
        logger.debug("============ENTEr")
        try{
        let order_ids=[],total_supplier_profit=0;
        let sql ="SELECT `id`,`handling_admin`,`handling_supplier`,`delivery_charges`,`net_amount`,`supplier_commision` from orders where supplier_branch_id = ? and status >= 5 "
        let orderData= await ExecuteQ.Query(dbName,sql,[supplierBranchId])
        let orderIds=[]
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
                    // total_supplier_profit=total_supplier_profit+(parseFloat(k.net_amount)-(parseFloat(k.handling_admin)+parseFloat(k.supplier_commision)))
                    // order_ids.push(k.id)
                }
                resolve({total_supplier_profit:total_supplier_profit,order_ids:orderIds})
            }
            else{

                resolve({total_supplier_profit:total_supplier_profit,order_ids:orderIds})

            }

        }
        catch(Err){
            logger.debug("=========Err>>",Err)
                reject(Err)

        }

    })
}
async function getOrdersRevenue(db_name,suppliers_data){

    return new Promise(async(resolve,reject)=>{
        var sql1 = "select id from supplier_branch where supplier_id = ? "
        var sql2 = "SELECT IFNULL(SUM(supplier_commision),0) as total_revenue from orders where supplier_branch_id = ? and status = 5 "
        let response_array = [],supplierProfitData,supplier_records=[],json_data={},agentConnection={};
        try{
           logger.debug("======SuplData======",suppliers_data); 
            if(suppliers_data && suppliers_data.length){
                for(const [index,i] of suppliers_data.entries()){
                    let total=0,commision_given_to_admin=0,order_ids=[];
                    let get_branch = await ExecuteQ.Query(db_name,sql1,[i.s_id])
                    
                    logger.debug("=======>>",get_branch)
         
                    for(const [index1,j] of get_branch.entries()){
                        supplierProfitData=await supplierProfitAfterTaxCommission(db_name,j.id);
                        logger.debug("=supplierProfitData=",supplierProfitData)
                        total=total+supplierProfitData.total_supplier_profit;
                        order_ids=order_ids.concat(supplierProfitData.order_ids);
                     
                        // total = total + get_revenue[0].total_revenue
                    }
                    logger.debug("=======final_order_ids==",order_ids)
                    if(order_ids && order_ids.length>0){
                        logger.debug("===AGENT==CON==")
                        let is_agent_of_supplier=0;
                        let getAgentDbData=await common.GetAgentDbInformation(db_name);        
                        logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length)
                        if(Object.entries(agentConnection).length===0){
                            agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                        }
                        let agent_order_data=await ExecuteQ.QueryAgent(agentConnection,
                            "select IFNULL(sum(co.commission_ammount),0) AS agentRevenue  from cbl_user_orders co join cbl_user cu on cu.id=co.user_id where co.order_id IN(?) and cu.supplier_id=?",
                            [order_ids,0]);
                        logger.debug("======AGEN=ORDER==DATA!==",agent_order_data);
                        commision_given_to_admin=agent_order_data[0].agentRevenue;
                    }
                    let isAdminDeliveryCharges=await ExecuteQ.Query(db_name,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["is_delivery_charge_to_admin","1"]);
                    commision_given_to_admin=isAdminDeliveryCharges && isAdminDeliveryCharges.length>0?0:commision_given_to_admin
                    logger.debug("===befor=====>>",total,commision_given_to_admin);
                    
                    logger.debug("===befor=====>>",total,commision_given_to_admin);
                    total=total-commision_given_to_admin;
                    logger.debug("========>>",total,commision_given_to_admin);
                    json_data.s_id=i.s_id
                    json_data.email=i.email
                    json_data.name=i.name
                    json_data.created_on=i.created_on
                   
                    json_data.no_of_orders=i.no_of_orders
                    // json_data.commission=i.commission
                    json_data.revenue=total || 0
                    json_data.commission=i.commission
                 
                    // {
                    //     "s_id": 71,
                    //     "email": "test1234@yopmail.com",
                    //     "name": "Test1234",
                    //     "created_on": "2019-11-08T18:59:11.000Z",
                    //     "commission": 3,
                    //     "no_of_orders": 0,
                    //     "revenue": 0
                    // },

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

exports.orderListing = async function(req,db_name,res, startLimit,
     noOfRecords,id,status,email,supplier,source,schedule,startDate,
     endDate,order_by,is_desc,is_download,user_type_id,callback,branchId) {
       
        let user_type_filter = ""
        if(parseInt(user_type_id)>0){
            user_type_filter = " and u.user_type_id = "+user_type_id+" ";
        }
        if(branchId!=0)
        {
            user_type_filter=user_type_filter+" and o.supplier_branch_id="+branchId+" "
        }
    let final = {};

    var order = ""
    order_by = parseInt(order_by)
    if(order_by==1){
        if(is_desc && is_desc>0){
            order = "order by supplier_name DESC"
        }else{
            order = "order by supplier_name ASC"
        }
    }else if(order_by==2){
        if(is_desc && is_desc>0){
            order = "order by u.email DESC"
        }else{
            order = "order by u.email ASC"
        }
    }else if(order_by==3){
        if(is_desc && is_desc>0){
            order = "order by o.created_on DESC"
        }else{
            order = "order by o.created_on ASC"
        }
    }else{
        order = "order by o.id"
    }
    var sql = " select u.user_type_id,o.net_amount,o.status,u.firstname as name,b.branch_name as branch_name,u.mobile_no,u.country_code,o.created_on,o.id,o.status,o.payment_type,u.id as user_id,u.email user_email,u.firstname,s.name supplier_name,  ";
    sql += "  o.ready_to_pick_images,o.order_source,o.schedule_order from orders o join supplier_branch b on  ";
    sql += "  o.supplier_branch_id = b.id join supplier s on s.id = b.supplier_id join user u on u.id = o.user_id  ";
    
    sql += "  where DATE( o.created_on ) >= '"+startDate+"' AND DATE( o.created_on ) <=  '"+endDate+"' "+user_type_filter+" AND (o.id LIKE '%"+id+"%' OR  u.email LIKE '%"+id+"%' OR u.firstname LIKE '%"+id+"%') ";

    if(status && status.length>0){
        sql += "  AND o.status = "+parseInt(status)
    }
    

    sql += " AND u.email LIKE'%"+email+"%' AND s.id LIKE'%"+supplier+"%'" +
           " AND o.order_source LIKE'%"+source+"%'AND o.schedule_order LIKE'%"+schedule+"%' ";
    sql += " "+order+"  LIMIT " + startLimit + "," + noOfRecords;


    let count = await getListCount(sql,db_name)
    logger.debug("===========count in order reports========",count)

    if(parseInt(is_download)){
        let sql1 = sql.split('LIMIT')[0];
        let result=await ExecuteQ.Query(db_name,sql1,[])
        // let stmt = multiConnection[db_name].query(sql1,function (err, result) {
        //     console.log("============sql in order listing========",stmt.sql)
        //     if (err) {
        //         console.log("errror", err);
        //         sendResponse.somethingWentWrongError(res)
        //     }
        //     else {
                var sql2 = "select ct.terminology,order_prices.product_name,order_prices.price,order_prices.order_id,order_prices.quantity from order_prices join product p on p.id=order_prices.product_id join categories ct on ct.id=p.category_id";
                let products=await ExecuteQ.Query(db_name,sql2,[]);

                // multiConnection[db_name].query(sql2,async function (err, products) {
                //     if (err) {
                //         console.log("errror", err)
                //         sendResponse.somethingWentWrongError(res)
                //     }
                //     else {////////////
                        var orderLength = result.length;
                        if (!orderLength) {
                            callback(null, [])
                        }
                        else {
                            var productLength = products.length;
                            for (var i = 0; i < orderLength; i++) {
                                (async function (i) {
                                    var productArray = [];
                                    for (var j = 0; j < productLength; j++) {
                                        (async function (j) {
                                            if (result[i].id == products[j].order_id) {
                                                productArray.push(products[j]);
                                                result[i].terminology=products[j].terminology;
                                                if (j == productLength - 1) {
                                                    result[i].products = productArray;
                                                    if (i == orderLength - 1) {
                                                        final.orders = result
                                                        final.count = count
                                                        logger.debug("=========final in ordre repots==1===",final)
                                                        
                                                        let header = [ 
                                                            {id: 'ORDER ID', title: 'ORDER ID'},
                                                            {id: 'USER NAME', title: 'USER NAME'},
                                                            {id: 'USER CONTACT NUMBER', title: 'USER CONTACT NUMBER'},
                                                            {id: 'SUPPLIER', title: 'SUPPLIER'},    
                                                            {id: 'USER EMAIL', title: 'USER EMAIL'},
                                                            {id: 'CREATED ON', title: 'CREATED ON'},
                                                            {id: 'PRODUCTS', title: 'PRODUCTS'},
                                                            {id: 'REVENUE', title: 'REVENUE'},
                                                            {id: 'STATUS', title: 'STATUS'},
                                                            {id: 'PAYMENT MODE', title: 'PAYMENT MODE'}
                                                          ]
                                                          let data = result.map((element)=>{
                                                              let temp = {}
                                                              temp["ORDER ID"] = element.id;
                                                              temp["USER NAME"] = element.firstname 
                                                              temp["USER CONTACT NUMBER"] = element.mobile_no;
                                                              temp.SUPPLIER = element.supplier_name
                                                              temp["USER EMAIL"] =element.user_email
                                                              temp["CREATED ON"] = moment(element.created_on).format('YYYY-MM-DD HH:mm:ss')
                                                              let key = [];


                                                              let prodArr = element.products.map((list)=>{
                                                                logger.debug("==========list====1===",list.product_name)
                                                                key.push(list.product_name+"*"+list.quantity)
                                                                })
                                                                logger.debug("========produarr-==11=======",key)
                                                              temp.PRODUCTS = key.join(",")

                                                              temp['REVENUE']=temp.net_amount

                                                            //   temp.STATUS = element.status
                                                              temp.STATUS = Universal.getStatusByName(parseInt(req.service_type),parseInt(element.status),0)
                                                              temp["PAYMENT MODE"] =parseInt(element.payment_type)==1?"Online":"Cash";
                                                              return temp;
                                                          })
                                                
                                                          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"sales_report_")
                                                          logger.debug("+==========csvLingk=========",csvLink)
                                                          callback(null,{"csvFileLink":csvLink})
                                                    }
                                                }
                                            }
                                            else {
                                                if (j == productLength - 1) {
                                                    result[i].products = productArray;
                                                    if (i == orderLength - 1) {
                                                        final.orders = result
                                                        final.count = count
                                                        logger.debug("=========final in ordre repots==1===",final)
                                                        
                                                        let header = [ 
                                                            {id: 'ID', title: 'ID'},
                                                            {id: 'USER NAME', title: 'USER NAME'},
                                                            {id: 'SUPPLIER', title: 'SUPPLIER'},    
                                                            {id: 'USER EMAIL', title: 'USER EMAIL'},
                                                            {id: 'CREATED ON', title: 'CREATED ON'},
                                                            {id: 'PRODUCTS', title: 'PRODUCTS'},
                                                            {id: 'STATUS', title: 'STATUS'}
                                                          ]
                                                          let data = result.map((element)=>{
                                                              let temp = {}
                                                              temp.ID = element.id
                                                              temp["USER NAME"] = element.firstname    
                                                              temp.SUPPLIER = element.supplier_name
                                                              temp["USER EMAIL"] =element.user_email
                                                              temp["CREATED ON"] = moment(element.created_on).format('YYYY-MM-DD HH:mm:ss')
                                                              let key = [];
                                                              element.products.forEach((list)=>{
                                                                  logger.debug("==========list====2===",list.product_name+"*"+list.quantity)
                                                                key.push(list.product_name+"*"+list.quantity)
                                                                })
                                                              logger.debug("========produarr-==22=======",key)
                                                              temp.PRODUCTS = key.join(",")
                                                            //   temp.STATUS = element.status
                                                            temp.STATUS = Universal.getStatusByName(parseInt(req.service_type),parseInt(element.status),0)
                                                              return temp;
                                                          })
                                                
                                                          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"order_list_")
                                                          logger.debug("+==========csvLingk=========",csvLink)
                                                          callback(null,{"csvFileLink":csvLink})
                                                    }
                                                }
                                            }
    
                                        }(j))
    
                                    }
    
                                }(i))
    
                            }
                        }
    
                //     }
    
                // })
        //     }
    
        // })
        
        }
    
    
    
    else{
        let stmt = multiConnection[db_name].query(sql,function (err, result) {
            console.log("============sql in order listing========",stmt.sql)
            if (err) {
                console.log("errror", err);
                sendResponse.somethingWentWrongError(res)
            }
            else {
                var sql2 = "select ct.terminology,order_prices.product_name,order_prices.price,order_prices.order_id,order_prices.quantity from order_prices join product p on p.id=order_prices.product_id join categories ct on ct.id=p.category_id";
                multiConnection[db_name].query(sql2, function (err, products) {
                    if (err) {
                        console.log("errror", err)
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {////////
                        var orderLength = result.length;
                        if (!orderLength) {
                            callback(null, [])
                        }
                        else {
                            var productLength = products.length;
                            for (var i = 0; i < orderLength; i++) {
                                (function (i) {
                                    var productArray = [];
                                    for (var j = 0; j < productLength; j++) {
                                        (function (j) {
                                            if (result[i].id == products[j].order_id) {
                                                productArray.push(products[j]);
                                                result[i].terminology=products[j].terminology;
                                                if (j == productLength - 1) {
                                                    result[i].products = productArray;
                                                    if (i == orderLength - 1) {
                                                        final.orders = result
                                                        final.count = count
                                                        logger.debug("=========final in ordre repots==1===",final)
                                                        callback(null, final)
                                                    }
                                                }
                                            }
                                            else {
                                                if (j == productLength - 1) {
                                                    result[i].products = productArray;
                                                    
                                                    if (i == orderLength - 1) {
                                                        final.orders = result
                                                        final.count = count
                                                        logger.debug("=========final in ordre repots===2==",final)
                                                        callback(null, final)
                                                    }
                                                }
                                            }
    
                                        }(j))
    
                                    }
    
                                }(i))
    
                            }
                        }
    
                    }
    
                })
            }
    
        })
    

    }

}


exports.userListing = async function (db_name,res, startLimit, noOfRecords, startDate,id,endDate,order_by,is_desc,is_download,callback) {
    let final = {}
    var order = ""
    order_by = parseInt(order_by)
    if(order_by==1){
        if(is_desc && is_desc>0){
            order = "order by u.email DESC"
        }else{
            order = "order by u.email ASC"
        }
    }else if(order_by==2){
        if(is_desc && is_desc>0){
            order = "order by u.created_on DESC"
        }else{
            order = "order by u.created_on ASC"
        }
    }else if(order_by==3){
        if(is_desc && is_desc>0){
            order = "order by no_of_orders DESC"
        }else{
            order = "order by no_of_orders ASC"
        }
    }else{
        order = "order by u.id"
    }
    // (select COUNT(id) as no_of_orders from orders where user_id=u.id) as no_of_orders
    var orders = 0;
    var sql = "select u.abn_number,u.business_name,u.nhs_status,u.id,u.mobile_no,u.created_on,u.email,u.firstname from user u"
    sql += " WHERE DATE( u.created_on ) >= '"+startDate+"' AND DATE( u.created_on ) <=  '"+endDate+"'";
    sql += "AND (u.id LIKE '%"+id+"%' OR u.mobile_no LIKE '%"+id+"%' OR u.firstname LIKE '%"+id+"%' OR u.email LIKE '%"+id+"%')";
    sql += " group by u.id "+order+"  LIMIT " + startLimit + "," + noOfRecords;

    if(parseInt(is_download)){

        let sql1 = sql.split('LIMIT')[0];
        let totalUsers = await ExecuteQ.Query(db_name,sql1,[]);
        let header = [ 
            {id: 'ID', title: 'ID'},
            {id: 'EMAIL', title: 'EMAIL'},
            {id: 'NAME', title: 'NAME'},    
            {id: 'REGISTERED ON', title: 'REGISTERED ON'},
            {id: 'TOTAL ORDERS', title: 'TOTAL ORDERS'},
            {id: 'NHA STATUS', title: 'NHA STATUS'},
            {id: 'PHONE NUMBER', title: 'PHONE NUMBER'}
          ]
          let data=[]
          for(const [index,element] of totalUsers.entries()){
        //   let data = totalUsers.map((element)=>{
              let temp = {}
              temp.ID = element.id
              temp.EMAIL = element.email
              temp.NAME = element.firstname
              temp["REGISTERED ON"] = moment(element.created_on).format('YYYY-MM-DD HH:mm:ss');
              let countData=await ExecuteQ.Query(db_name,"select COUNT(id) as no_of_orders from orders where user_id=?",[element.id]);
              temp["TOTAL ORDERS"] = countData[0].no_of_orders
              temp['NHA STATUS'] = element.nhs_status==1?"YES":"NO";
              temp["PHONE NUMBER"] = element.mobile_no
            //   return temp;
               data.push(temp)
          }
        //   })

          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"user_report_")
          logger.debug("+==========csvLingk=========",csvLink)
          callback(null,{"csvFileLink":csvLink})

    }else{
        let result=await ExecuteQ.Query(db_name,sql,[]);
        let finalResult=[];
        for(const [index,element] of result.entries()){
            //   let data = totalUsers.map((element)=>{
                let countData=await ExecuteQ.Query(db_name,"select COUNT(id) as no_of_orders from orders where user_id=?",[element.id]);
                let netAmountData =await ExecuteQ.Query(db_name,"select COUNT(id) as total from orders where user_id=?",[element.id]);

                  element.no_of_orders = countData[0].no_of_orders
                  element.totalAmount = netAmountData[0].total
                //   return temp;
                finalResult.push(element)
              }
        // let stmt = multiConnection[db_name].query(sql,async function (err, result) {
            // logger.debug("==========mulit con sql of user listing=====",stmt.sql)
            // if (err) {
            //     logger.debug("=========error in user listing======",err)
            //     sendResponse.somethingWentWrongError(res)
            // }
            // else {
                if(!result.length){
                    final.user = []
                    final.count = 0
                    callback(null,final)
                }else{

                    let count = await getListCount(sql,db_name);
                    final.user = finalResult;
                    final.count = count;
                    callback(null,final)
                }
                // if(order_by==3){
                //     logger.debug("==========heree===========",order_by)
                //     if(is_desc && is_desc>0){
                //         order = "order by no_of_orders DESC"
                //     }else{
                //         order = "order by no_of_orders ASC"
                //     }
                // }else{
                //     order = ""
                // }
                // var sql2 = "select COUNT(id) as no_of_orders,user_id from orders group by user_id "+order+"";
                // logger.debug("=========here is query=======1====",sql2)
                // let stmt = multiConnection[db_name].query(sql2, function (err, result2) {
                //     logger.debug("=========here is eroror=======2====",err,stmt.sql2)
                //     if (err) {
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else {
                //         var userLength = result.length;
                //         if (!userLength) {
                //             callback(null, []);
                //         }
                //         else {
                //             var orderLength = result2.length;
                //             for (var i = 0; i < userLength; i++) {
                //                 (function (i) {
                //                     for (var j = 0; j < orderLength; j++) {
                //                         (function (j) {
                //                            // console.log("jvhdsvujsd",result[i].id,result2[j].user_id);
                //                             if (result[i].id == result2[j].user_id) {
                //                                 orders = result2[j].no_of_orders;
                //                                 if (j == orderLength - 1) {
                //                                     result[i].no_of_orders = orders;
                //                                     orders=0
                //                                     if (i == userLength - 1) {
                //                                         callback(null, result);
                //                                     }
                //                                 }
                //                             }
                //                             else {
                //                                 if (j == orderLength - 1) {
                //                                     result[i].no_of_orders = orders;
                //                                     orders=0
                //                                     if (i == userLength - 1) {
                //                                         callback(null, result);
                //                                     }
                //                                 }
                //                             }
    
                //                         }(j))
    
                //                     }
    
                //                 }(i))
    
                //             }
    
                //         }
    
                //     }
    
                // })
            // }
    
        // })
    }

}


function getListCount(sql,dbName){
    logger.debug("============sql in get user list count funciton=====",sql)
    let len;
    let sql1 = sql.split('LIMIT')[0];
    logger.debug("============sql in get user list count funciton== =========after split===",sql1)
  return new Promise(async (resolve,reject)=>{
      try{
        let results=await ExecuteQ.Query(dbName,sql1,[]);
        if(results && results.length){
                len = results.length
                resolve(len)
            }
            else{
                len = 0
                resolve(len)
            }
        }
        catch(Err){
            reject(Err)
        }
    // let stmt = multiConnection[dbName].query(sql1,function(err,result){
    //     logger.debug("======with out limit offset user list report=======",stmt.sql)
    //     if(err){
    //         reject(err)
    //     }else{
    //         if(result && result.length){
    //             len = result.length
    //             resolve(len)
    //         }else{
    //             len = 0
    //             resolve(len)
    //         }
    //     }
    // })
  })
}


exports.areaListing = function(db_name,res, startLimit, noOfRecords,zoneId, callback) {
    var areas;
    var orders;
    async.auto({
        areas:function(cb){

            listAreas(db_name,res,startLimit,noOfRecords,zoneId,function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    areas = result;
                    cb(null);
                }

            });
        },
        totalOrdersAndRevenue:function(cb){

            listOrderNoAndRevenue(db_name,res,function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    orders = result;
                    cb(null);
                }
            });
        },
        clubData:['areas','totalOrdersAndRevenue',function(cb)
        {
            clubAreaData(res,areas,orders,cb);

        }],

    },function(err,response)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,response.clubData);
        }

    })

}


function listAreas(db_name,res,startLimit,noOfRecords,zoneId,callback){

    var sql = "select a.id,a.name,COUNT(sd.id) as no_of_suppliers from area a left join supplier_delivery_areas sd on ";
    sql +=" a.id = sd.area_id where a.zone_id=? and a.is_deleted = 0 group by sd.area_id limit "+startLimit+","+noOfRecords;
    multiConnection[db_name].query(sql,[zoneId],function(err,result)
    {
      //  console.log("result",result);
        if(err){
            console.log("rrrr",err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })
}



function listOrderNoAndRevenue(db_name,res,callback) {
    var sql = "select COUNT(o.id) no_of_orders, SUM(o.net_amount) total_revenue,a.id from orders o join user u ";
    sql +=" on o.user_id = u.id join area a on u.area_id = a.id group by a.id ";
    multiConnection[db_name].query(sql,function(err,result)
    {
        if(err){
            console.log("aaaaa",err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })

}


function clubAreaData(res,areas,orders,callback) {
  //  console.log("aaa",areas,orders)
    var areasLength = areas.length;
    var ordersLength = orders.length;

    if(!areasLength){
        callback(null,[]);
    }
    else{

        for(var i = 0 ; i < areasLength ; i++)
        {
            (function(i)
            {
                var orderNo = 0 ;
                var revenue = 0;
                for( var j = 0 ; j < ordersLength ; j++)
                {
                    (function(j)
                    {
                        if(areas[i].id == orders[j].id)
                        {
                            orderNo = orders[j].no_of_orders;
                            revenue = orders[j].total_revenue;
                            if(j == ordersLength - 1)
                            {
                                areas[i].no_of_orders = orderNo;
                                areas[i].total_revenue = revenue;
                                if(i == areasLength - 1)
                                {
                                    callback(null,areas);

                                }
                            }
                        }
                        else{
                            if(j == ordersLength - 1)
                            {
                                areas[i].no_of_orders = orderNo;
                                areas[i].total_revenue = revenue;
                                if(i == areasLength - 1)
                                {
                                    callback(null,areas);

                                }
                            }
                        }

                    }(j))

                }

            }(i))

        }

    }

}


function adminListing(dbName,res, startLimit, noOfRecords,email,number,superAdmin,startDate,endDate,logins,callback) {
   var sql = "select a.email,a.phone_number,a.is_superadmin,a.created_on,COUNT(al.id) as no_of_logins from admin a ";
    sql +=" left join admin_login al on a.id = al.admin_id  where a.email LIKE '%"+email+"%' AND a.phone_number LIKE '%"+number+"%' " +
        "AND DATE( a.created_on ) >= '"+startDate+"' AND DATE(a.created_on ) <=  '"+endDate+"' AND a.is_superadmin LIKE'%"+superAdmin+"%'" +
        " group by a.id having no_of_logins >= "+logins+" limit "+startLimit+","+noOfRecords;
    multiConnection[dbName].query(sql,function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null,result);
        }

    })
}


function zoneListing(dbName,res, startLimit, noOfRecords,name,no_of_supplier, callback) {
    var zones;
    var orders;
    async.auto({
        areas:function(cb){
            listZones(dbName,res,startLimit,noOfRecords,name,no_of_supplier,function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    zones = result;
                    cb(null);
                }

            });
        },
        totalOrdersAndRevenue:function(cb){
            listOrderNoAndRevenueForZone(dbName,res,function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    orders = result;
                    cb(null);
                }
            });
        },
        clubData:['areas','totalOrdersAndRevenue',function(cb)
        {
            clubAreaData(res,zones,orders,cb);

        }]

    },function(err,response)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,response.clubData);
        }

    })

}


function listZones(dbName,res,startLimit,noOfRecords,name,no_of_supplier,callback){

    var sql = "select z.id,z.name,COUNT(sd.id) as no_of_suppliers from zone z left join supplier_delivery_areas sd ";
    sql +=" on z.id = sd.zone_id where z.name like'%"+name+"%' group by sd.zone_id having no_of_suppliers >="+no_of_supplier+" limit "+startLimit+","+noOfRecords;
    multiConnection[dbName].query(sql,function(err,result)
    {
        if(err){
            console.log("aaa",err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })
}



function listOrderNoAndRevenueForZone(dbName,res,callback)
{
    var sql = "select COUNT(o.id) as no_of_orders, SUM(o.net_amount) as total_revenue,z.id from orders o join user u ";
    sql +=" on o.user_id = u.id join area a on u.area_id = a.id join zone z on a.zone_id = z.id group by z.id";
    multiConnection[dbName].query(sql,function(err,result)
    {
        
        if(err){          
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })

}


exports.profitLossReport=function(req,res){
    var sectionId=0;
    var accessToken=0;
    var adminId=0;
    var data=0;
    var startLimit = req.body.startLimit;
    var noOfRecords = req.body.noOfRecords;
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, authenticate:['blankField',function (cb)
        {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    //console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb)
        {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    //console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        ProfitLoss:['checkauthority',function(cb){
            profitLossReport(req.dbName,res,startLimit,noOfRecords,function (err,result) {
                if(err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data=result;
                    cb(null);
                }
            })
        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })
}

function profitLossReport(dbName,res, startLimit, noOfRecords,callback)
{
   var data=[];
   var data1=[];
   var status=-1;
   var total_credit=0;
   var total_debit=0;
    var net_amount=0;
    var sql="select supplier_id, month(a.transaction_date) as month,SUM(a.credit) as total_credit, SUM(a.debit) as total_debit from account_statement a " +
        "GROUP BY supplier_id,month(a.transaction_date) limit "+startLimit+","+noOfRecords;
    multiConnection[dbName].query(sql,function (err,result) {
        if(err){
            console.log("err in profitLoss",err);
            sendResponse.somethingWentWrongError(res);
        }
       else{
            //console.log("resr",result);
               for(var i=0;i<result.length;i++){
                      for(var j=i;j<result.length;j++) {
                          (function (j) {
                             if(result[i].supplier_id == result[j].supplier_id)
                             {
                                 net_amount=result[j].total_credit-result[j].tota_debit;
                                 if(net_amount>=0){
                                 status=1;
                             }
                                 else {
                                 status=0;
                             }
                                data.push({
                                   'month': result[j].month,
                                   'total_credit':result[j].total_credit,
                                   'tota_debit':result[j].total_debit,
                                   'total_balance':status
                                });
                                 i=j;
                             }
                              if(j == result.length-1){
                                  data1.push({
                                      "supplier_id":result[i].supplier_id,
                                        "data":data
                                  });
                                  if(i==result.length-1)
                                  {
                                      callback(null,data1);
                                  }
                              data=[];
                              }
                          }(j))
                      }
               }
        }
    })
}

async function agentList(agentConnection,res, limit, offset,supplierId,startDate,endDate,order_by,is_desc,is_admin,search,is_download, cb,req){
    var final = {}
    limit = parseInt(limit)
    offset = parseInt(offset)
    var order = ""
    order_by = parseInt(order_by)
    if(order_by==1){
        if(is_desc && is_desc>0){
            order = "order by cu.name DESC"
        }else{
            order = "order by cu.name ASC"
        }
    }else if(order_by==2){
        if(is_desc && is_desc>0){
            order = "order by cu.email DESC"
        }else{
            order = "order by cu.email ASC"
        }
    }else if(order_by==3){
        if(is_desc && is_desc>0){
            order = "order by total_orders DESC"
        }else{
            order = "order by total_orders ASC"
        }
    }else if(order_by==4){
        if(is_desc && is_desc>0){
            order = "order by revenue DESC"
        }else{
            order = "order by revenue ASC"
        }
    }
    else{
        order = "order by cu.id"
    }
 var sql = "select cu.name,cu.supplier_id,IFNULL(sp.name,'N/A') as supplier_name,cu.email,cu.id as user_id,count(cuo.user_id) as total_orders,IFNULL(sum(commission_ammount),0) as revenue,IFNULL(sum(net_amount),0) as totalNetAmount  "
    sql += " from cbl_user cu left join cbl_user_orders cuo on cuo.user_id = cu.id and cuo.status=5 and DATE(cuo.created_on) >='"+startDate+"' "
    sql += "and DATE(cuo.created_on) <='"+endDate+"' left join "+req.dbName+".supplier sp on sp.id=cu.supplier_id where "

    if(is_admin==0){
        if(supplierId!=""){
            sql += " cu.supplier_id = "+supplierId+" AND "
        }
         else{
            // sql += " cu.supplier_id != 0 AND "
        }

    }else{
        sql += " cu.supplier_id = 0 AND "
    }
    
    sql += "  (cu.id LIKE '%"+search+"%' OR cu.email LIKE '%"+search+"%' OR cu.name LIKE '%"+search+"%') group by cu.id "+order+" LIMIT ?,? "


    

    if(parseInt(is_download)){
        let sql1 = sql.split('LIMIT')[0];
        let result = await ExecuteQ.QueryAgent(agentConnection,sql1,[]);
        let header = [ 
            {id: 'ID', title: 'ID'},
            {id: 'NAME', title: 'NAME'},   
            {id: 'EMAIL', title: 'EMAIL'}, 
            {id: 'RESTAURANT', title: 'RESTAURANT'},
            {id: 'TOTAL AMOUNT', title: 'TOTAL AMOUNT'},
            {id: 'TOTAL ORDERS', title: 'TOTAL ORDERS'},
            {id: 'REVENUE', title: 'REVENUE'}
          ]
          let data = result.map((element)=>{
              let temp = {}
              temp.ID = element.user_id
              temp.NAME = element.name
              temp.EMAIL = element.email
              temp.RESTAURANT = element.supplier_id!==0?element.supplier_name:"admin level agent"
              temp["TOTAL AMOUNT"] = element.totalNetAmount
              temp["TOTAL ORDERS"] = element.total_orders
              temp.REVENUE = element.revenue
              return temp;
          })

          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"agent_report_")
          logger.debug("+==========csvLingk=========",csvLink)
          cb(null,{"csvFileLink":csvLink})
        
    }else{
        let stmt = agentConnection.query(sql,[offset,limit],async function (err, result) {
            logger.debug("===========agent final list ===========",stmt.sql)
            if (err) {
                console.log("errror", err);
                sendResponse.somethingWentWrongError(res)
            }
            else {
                let count = await getListCountOfAgents(sql,agentConnection)
                final.agents = result
                final.count = count
                cb(null,final);
            }
    
        })
    }

}

function getListCountOfAgents(sql,agentConnection){
    logger.debug("============sql in get user list count funciton=====",sql)
    let len;
    let sql1 = sql.split('LIMIT')[0];
    logger.debug("============sql in get user list count funciton== =========after split===",sql1)
  return new Promise((resolve,reject)=>{
    let stmt =agentConnection.query(sql1,function(err,result){
        logger.debug("======with out limit offset user list report=======",stmt.sql)
        if(err){
            reject(err)
        }else{
            if(result && result.length){
                len = result.length
                resolve(len)
            }else{
                len = 0
                resolve(len)
            }
        }
    })
  })
}




exports.userSubscriptionListing = async function (db_name, res, startLimit, noOfRecords, startDate,id,endDate,is_download,callback) {
    let final = {}
    // var order = ""
    // order_by = parseInt(order_by)
    // if(order_by==1){
    //     if(is_desc && is_desc>0){
    //         order = "order by u.email DESC"
    //     }else{
    //         order = "order by u.email ASC"
    //     }
    // }else if(order_by==2){
    //     if(is_desc && is_desc>0){
    //         order = "order by u.created_on DESC"
    //     }else{
    //         order = "order by u.created_on ASC"
    //     }
    // }else if(order_by==3){
    //     if(is_desc && is_desc>0){
    //         order = "order by no_of_orders DESC"
    //     }else{
    //         order = "order by no_of_orders ASC"
    //     }
    // }else{
    //     order = "order by u.id"
    // }

    // var orders = 0;

    const sqlListAllPlans = "SELECT id,name,description,plan_type,price,admin_commission FROM subscription_plans WHERE is_deleted=false";
    const sqlTotalSubscriptionRevenue = "SELECT SUM(subscription_plans.price) total_revenue FROM user_subscription LEFT JOIN subscription_plans ON user_subscription.subscription_plan_id=subscription_plans.id";
    const sqlListAllSubscriptions = "SELECT user_subscription.id,user_subscription.user_id, user.email, subscription_plans.name, subscription_plans.plan_type, subscription_plans.price FROM user_subscription INNER JOIN subscription_plans ON user_subscription.subscription_plan_id=subscription_plans.id INNER JOIN user ON user_subscription.user_id=user.id";
    const sqlSubscriptionCountPerPlan = "SELECT subscription_plans.id, subscription_plans.name, subscription_plans.plan_type, subscription_plans.price, COUNT(user_subscription.id) subscribed_users FROM user_subscription INNER JOIN subscription_plans ON user_subscription.subscription_plan_id=subscription_plans.id GROUP BY subscription_plans.id";
    const sqlSubscriberCountPerPlan = "SELECT user_subscription.id, COUNT(user_subscription.user_id) subscribers_count, subscription_plans.name, subscription_plans.plan_type, subscription_plans.price FROM user_subscription INNER JOIN subscription_plans ON user_subscription.subscription_plan_id=subscription_plans.id GROUP BY subscription_plans.id"
    const sqlSubscribedUserRevenue = "SELECT subscription_plans.name, subscription_plans.plan_type, subscription_plans.price, SUM(subscription_plans.price) total_plan_revenue FROM user_subscription INNER JOIN subscription_plans ON user_subscription.subscription_plan_id=subscription_plans.id GROUP BY subscription_plans.id";
    const sqlPerUserRevenue = "SELECT  user_subscription.user_id, user.email,  SUM(subscription_plans.price) revenue FROM user_subscription INNER JOIN subscription_plans ON user_subscription.subscription_plan_id=subscription_plans.id INNER JOIN user ON user.id=user_subscription.user_id  GROUP BY user_subscription.user_id";
    const sqlListActiveSubscriptions = "SELECT * FROM user_subscription WHERE NOW() BETWEEN start_date AND end_date";


    const sqlQueryList = {
        sqlListAllPlans,
        sqlTotalSubscriptionRevenue,
        sqlListAllSubscriptions,
        sqlSubscriptionCountPerPlan,
        sqlSubscriberCountPerPlan,
        sqlSubscribedUserRevenue,
        sqlPerUserRevenue,
        sqlListActiveSubscriptions
    };

    // var sql = "select u.id,u.mobile_no,u.created_on,u.email,u.firstname from user_subscription us INNER JOIN user  "
    // sql += " orders o on u.id = o.user_id " 
    // sql += " WHERE DATE( u.created_on ) >= '"+startDate+"' AND DATE( u.created_on ) <=  '"+endDate+"'";
    // sql += "AND (u.id LIKE '%"+id+"%' OR u.mobile_no LIKE '%"+id+"%' OR u.firstname LIKE '%"+id+"%' OR u.email LIKE '%"+id+"%')";
    // sql += " group by u.id "+order+"  LIMIT " + startLimit + "," + noOfRecords;

    if(parseInt(is_download)){
        let sql1 = sql.split('LIMIT')[0];
        let totalUsers = await ExecuteQ.Query(db_name,sql1,[]);
        let header = [ 
            {id: 'ID', title: 'ID'},
            {id: 'EMAIL', title: 'EMAIL'},
            {id: 'NAME', title: 'NAME'},    
            {id: 'REGISTERED ON', title: 'REGISTERED ON'},
            {id: 'TOTAL ORDERS', title: 'TOTAL ORDERS'}
          ]
          let data = totalUsers.map((element)=>{
              let temp = {}
              temp.ID = element.id
              temp.EMAIL = element.email
              temp.NAME = element.firstname
              temp["REGISTERED ON"] = moment(element.created_on).format('YYYY-MM-DD HH:mm:ss')
              temp["TOTAL ORDERS"] = element.no_of_orders
              return temp;
          })

          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"user_report_")
          logger.debug("+==========csvLingk=========",csvLink)
          return callback(null,{"csvFileLink":csvLink})

    }

    try {
        let result=await Promise.all(Object.values(sqlQueryList).map(sql => ExecuteQ.Query(db_name,sql,[])))
        let output = Object.keys(sqlQueryList).map((v, i) => ({'Query' : v, 'Value' : result[i]}))
        console.log(output);
        return callback(null, output);
        if(!result.length){
            final.user = []
            final.count = 0
            callback(null,final)
        }
        else{
            let count = await getListCount(sql,db_name);
            final.user = result;
            final.count = count;
            callback(null,final)
        }
    } catch (error) {
        return callback(error);
    }
}


exports.userSubscriptionRevenueReport = function(req,res)
{
    var final = {};
    const is_download = req.body.is_download==undefined?0:req.body.is_download;
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var manValues = [accessToken, sectionId, limit, offset];
    var sort_by = req.body.sort_by ? req.body.sort_by : 'id';//1 - id, 2- total_revenue,3 - number_of_active_users
    var searchText = req.body.search ? req.body.search : "";
    var searchQuery = "";
    if(searchText!=""){
        searchQuery = " and usp.title LIKE '%"+searchText+"%' "
    }
    var month_filter = req.body.month_filter ? req.body.month_filter : "";
    var monthSearchQuery = "";
    if(month_filter!=""){
        monthSearchQuery = " and MONTH(created_at)='"+month_filter+"' ";
    }
    


    async.waterfall([
        function (cb) {
            console.log("11111111111")
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            var sql = "select (SELECT count(id) from user_subscription_logs where usp.id=subscription_plan_id "+monthSearchQuery+") times_purchased, (usp.price * (SELECT count(id) from user_subscription_logs where usp.id=subscription_plan_id "+monthSearchQuery+")) total_revenue, (SELECT count(id) from user_subscription where usp.id=subscription_plan_id "+monthSearchQuery+") number_of_users, (SELECT count(id) from user_subscription where usp.id=subscription_plan_id and is_deleted='0' and is_cancelled='0' and `status`='1'  "+monthSearchQuery+") number_of_active_users, usp.* from user_subscription_plans usp where usp.is_blocked='0' "+searchQuery+" ORDER by "+sort_by+" DESC LIMIT "+offset+","+limit;
            console.log("adminProductReport sql =========",sql)
            multiConnection[req.dbName].query(sql,async function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    var sql2 = "select count(id) cnt from user_subscription_plans where is_blocked='0' ";
                    let dataCount=await ExecuteQ.Query(req.dbName,sql2,[]);

                    var sql3 = "select MONTHNAME(usp.created_at) `month`, YEAR(usp.created_at) `year`, usp.created_at , SUM((usp.price * (SELECT count(id) from user_subscription_logs where usp.id=subscription_plan_id))) total_revenue from user_subscription_plans usp where usp.is_blocked='0' GROUP BY YEAR(usp.created_at), MONTH(usp.created_at) ";
                    let dataMonthly=await ExecuteQ.Query(req.dbName,sql3,[]);
                    
                    final.data=result;
                    final.count=dataCount[0].cnt;
                    final.graph=dataMonthly

                    // if its an download, upload file to cdn and send download link
                    if(parseInt(is_download)){
                        let sql1 = sql.split('LIMIT')[0];
                        let result = await ExecuteQ.Query(req.dbName,sql1,[]);

                        // return cb(null, result);
                        let header = [ 
                            {id: 'ID', title: 'ID'},
                            {id: 'TITLE', title: 'TITLE'},   
                            {id: 'DESCRIPTION', title: 'DESCRIPTION'}, 
                            {id: 'PRICE', title: 'PRICE'},
                            {id: 'TYPE', title: 'TYPE'},
                            {id: 'IMAGE', title: 'IMAGE'},
                            {id: 'NUMBER OF TIMES PURCHASED', title: 'NUMBER OF TIMES PURCHASED'},
                            {id: 'TOTAL REVENUE', title: 'TOTAL REVENUE'},
                            {id: 'TOTAL NUMBER OF USERS', title: 'TOTAL NUMBER OF USERS'},
                            {id: 'TOTAL NUMBER OF ACTIVE USERS', title: 'TOTAL NUMBER OF ACTIVE USERS'},
                            {id: 'DATE CREATED', title: 'DATE CREATED'}
                          ]
                          let data = result.map((element)=>{
                              let temp = {}
                              temp["ID"] = element.id
                              temp["TITLE"] = element.title
                              temp["DESCRIPTION"] = element.description
                              temp["PRICE"] = element.price
                              temp["TYPE"] = element.type
                              temp["IMAGE"] = element.image
                              temp["NUMBER OF TIMES PURCHASED"] = element.times_purchased
                              temp["TOTAL REVENUE"] = element.total_revenue
                              temp["TOTAL NUMBER OF USERS"] = element.number_of_users
                              temp["TOTAL NUMBER OF ACTIVE USERS"] = element.number_of_active_users
                              temp["DATE CREATED"] = element.created_at
                              return temp;
                          })
                
                          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"user_subscription_report_")
                          logger.debug("+==========csvLingk=========",csvLink)
                          return cb(null,{"csvFileLink":csvLink})
                        
                    } 
                    // if its not an download, return final data in response
                    return cb(null,final);
                }
            })
        }
        ], function (error, result) {

            if (error) {
                console.log("error ----- ",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

exports.supplierSubscriptionRevenueReport = function(req,res)
{
    var final = {};
    const is_download = req.body.is_download==undefined?0:req.body.is_download;
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var manValues = [accessToken, sectionId, limit, offset];
    var sort_by = req.body.sort_by ? req.body.sort_by : 'id';//1 - id, 2- total_revenue,3 - number_of_active_users
    var searchText = req.body.search ? req.body.search : "";
    var searchQuery = "";
    if(searchText!=""){
        searchQuery = " and sp.name LIKE '%"+searchText+"%' "
    }
    var month_filter = req.body.month_filter ? req.body.month_filter : "";
    var monthSearchQuery = "";
    if(month_filter!=""){
        monthSearchQuery = " and MONTH(created_at)='"+month_filter+"' ";
    }
    

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            var sql = "SELECT (SELECT count(id) from supplier_subscription where sp.id=plan_id  "+monthSearchQuery+") number_of_users, (SELECT count(id) from supplier_subscription where sp.id=plan_id and `status`='active' "+monthSearchQuery+" ) number_of_active_users, (sp.price * (SELECT count(id) from supplier_subscription where sp.id=plan_id "+monthSearchQuery+")) total_revenue, sp.* FROM `subscription_plans` sp WHERE sp.is_deleted='0' and sp.is_block='0' "+searchQuery+" ORDER by "+sort_by+" DESC LIMIT "+offset+","+limit;
            console.log("adminProductReport sql =========",sql)
            multiConnection[req.dbName].query(sql,async function(err,result)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    var sql2 = "SELECT count(id) cnt FROM `subscription_plans` sp WHERE sp.is_deleted='0' and sp.is_block='0' ";
                    let dataCount=await ExecuteQ.Query(req.dbName,sql2,[]);


                    var sql3 = "SELECT MONTHNAME(sp.created_at) `month`, YEAR(sp.created_at) `year`, sp.created_at, SUM((sp.price * (SELECT count(id) from supplier_subscription where sp.id=plan_id))) total_revenue FROM `subscription_plans` sp WHERE sp.is_deleted='0' and sp.is_block='0' GROUP BY YEAR(sp.created_at), MONTH(sp.created_at)";
                    let dataMonthly=await ExecuteQ.Query(req.dbName,sql3,[]);
                    
                    final.data=result;
                    final.count=dataCount[0].cnt;
                    final.graph=dataMonthly

                    // if its an download, upload file to cdn and send download link
                    if(parseInt(is_download)){
                        let sql1 = sql.split('LIMIT')[0];
                        let result = await ExecuteQ.Query(req.dbName,sql1,[]);

                        // return cb(null, result);
                        let header = [ 
                            {id: 'ID', title: 'ID'},
                            {id: 'TITLE', title: 'TITLE'},   
                            {id: 'DESCRIPTION', title: 'DESCRIPTION'}, 
                            {id: 'PRICE', title: 'PRICE'},
                            {id: 'TYPE', title: 'TYPE'},
                            //{id: 'IMAGE', title: 'IMAGE'},
                            //{id: 'NUMBER OF TIMES PURCHASED', title: 'NUMBER OF TIMES PURCHASED'},
                            {id: 'TOTAL_REVENUE', title: 'TOTAL_REVENUE'},
                            {id: 'TOTAL_NUMBER_OF_USERS', title: 'TOTAL_NUMBER_OF_USERS'},
                            {id: 'TOTAL_NUMBER_OF_ACTIVE_USERS', title: 'TOTAL_NUMBER_OF_ACTIVE_USERS'},
                            {id: 'DATE_CREATED', title: 'DATE_CREATED'}
                          ]
                          let data = result.map((element)=>{
                              let temp = {}
                              temp["ID"] = element.id
                              temp["TITLE"] = element.name
                              temp["DESCRIPTION"] = element.description
                              temp["PRICE"] = element.price
                              temp["TYPE"] = element.plan_type
                              //temp["IMAGE"] = element.image
                              //temp["NUMBER OF TIMES PURCHASED"] = element.times_purchased
                              temp["TOTAL REVENUE"] = element.total_revenue
                              temp["TOTAL NUMBER OF USERS"] = element.number_of_users
                              temp["TOTAL NUMBER OF ACTIVE USERS"] = element.number_of_active_users
                              temp["DATE CREATED"] = element.created_at
                              return temp;
                          })
                
                          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"supplier_subscription_report_")
                          logger.debug("+==========csvLingk=========",csvLink)
                          return cb(null,{"csvFileLink":csvLink})
                        
                    } 
                    // if its not an download, return final data in response
                    return cb(null,final);
                }
            })
        }
        ], function (error, result) {

            if (error) {
                console.log("error ----- ",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}
