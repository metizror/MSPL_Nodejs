/**
 * Modify by cbl148 on 31/7/2020.
 */
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var adminAccounts = require('./adminAccounts');
const ExecuteQ = require('../lib/Execute')
const uploadMgr = require('../lib/UploadMgr')
const common=require('../common/agent')
var moment=require('moment');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const Universal=require('../util/Universal');

exports.addSuggestions = function (req,res) {
    var name = req.body.name;
    var description = req.body.description;
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.name){
                    name= req.body.name
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',async function(cb){
            var sql ='insert into suggestions_list (`name`, `description`,`status`)values(?,?,?)';
            var result = await ExecuteQ.Query(req.dbName,sql,[name,description,"1"])
            data=result;
            cb(null);
        }]
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}


exports.editSuggestions = function (req,res) {
    var name = req.body.name;
    var description = req.body.description;
    var id = req.body.id;
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.name){
                    name= req.body.name
                }
                if(req.body.name){
                    id= req.body.id
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',async function(cb){
            var sql = "update suggestions_list set name='"+name+"',description='"+description+"' where id='"+id+"' ";
            var result = await ExecuteQ.Query(req.dbName,sql,[])
            data=result;
            cb(null);
        }]
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}

exports.editFeedback = function (req,res) {
    var new_suggestion = req.body.new_suggestion;
    var new_suggestion_description = req.body.new_suggestion_description;
    var feedbackId = req.body.id;
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.name){
                    new_suggestion= req.body.new_suggestion
                }
                if(req.body.id){
                    feedbackId= req.body.id
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',async function(cb){
            var sql ="update feedback set new_suggestions='"+new_suggestion+"', new_suggestion_description='"+new_suggestion_description+"' where id='"+feedbackId+"'";
            var result = await ExecuteQ.Query(req.dbName,sql,[])
            data=result;
            cb(null);
        }]
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}

exports.getSuggestions = function (req,res) {
    var offset = req.query.offset;
    var limit = req.query.limit;
    var data  = {};
    async.auto({
        payableListing:async function(cb) {
            var sql ="select * from suggestions_list  order by id desc LIMIT "+offset+","+limit;
            var result = await ExecuteQ.Query(req.dbName,sql,[])
            let modifyResult=[];
            if(result && result.length>0){
                for(const [index,i] of result.entries()){
                    let cData=await ExecuteQ.Query(req.dbName,`SELECT count(*) as use_count FROM feedback where suggestions_assigned=?`,[i.name])
                    i.used_count=cData[0].use_count
                    modifyResult.push(i)
                }
            }
            var sql1 ="select count(id) cnt from suggestions_list";
            var result1 = await ExecuteQ.Query(req.dbName,sql1,[])
            data={
                count : result1[0].cnt,
                data : modifyResult
            };
            cb(null);
        }
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}
exports.deleteBlockSuggestions = function (req,res) {
    var id = req.body.id;
    var status = req.body.status;
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.status){
                    status= req.body.status
                }
                if(req.body.id){
                    id= req.body.id
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',async function(cb){
            var sql ="update suggestions_list set status='"+status+"' where id='"+id+"'";
            var result = await ExecuteQ.Query(req.dbName,sql,[])
            data=result;
            cb(null);
        }]
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}

exports.approveNewSuggestions = function (req,res) {
    var name = req.body.name;
    var description = req.body.description;
    var status = req.body.status; //0,1 (decline, approve)
    var feedbackId = req.body.id;
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.status){
                    status= req.body.status
                }
                if(req.body.status){
                    status= req.body.status
                }
                if(req.body.feedbackId){
                    feedbackId= req.body.feedbackId
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',async function(cb){

            var sql ="update feedback set new_suggestions='',new_suggestion_description='' where id='"+feedbackId+"'";
            var result = await ExecuteQ.Query(req.dbName,sql,[])
            if(status=="1"){                
                var sql ='insert into suggestions_list (`name`, `description`, `status`)values(?,?,?)';
                var result = await ExecuteQ.Query(req.dbName,sql,[name,description,"1"])
            }
            
            data=result;
            cb(null);
        }]
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}

exports.getFeedbacks = function (req,res) {
    var offset = req.query.offset;
    var limit = req.query.limit;
    var type = req.query.type ? req.query.type : "";
    var data  = {};
    var query = "";
    if(type!=""){
        query = " where from_user_type='"+type+"' "
    }
    async.auto({
        payableListing: async function(cb) {
            var sql ="select * from feedback "+query+" order by id desc LIMIT "+offset+","+limit;
            var result = await ExecuteQ.Query(req.dbName,sql,[])
            var sql1 ="select count(id) cnt from feedback "+query;
            var result1 = await ExecuteQ.Query(req.dbName,sql1,[])
            data={
                count : result1[0].cnt,
                data : result
            };
            cb(null);
        }
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}


exports.saveFooterDetails = async function(req,reply){
    var payload = request.body
    var data = payload.data;
        
    async.auto({
        saveFooterDetails:async function(callback){
            await updateOrInsertFooterData(req.dbName,"footer_data",data);
            callback(null);
        }
    },function(err,result){
        if(err){
            var msg = "some thing went wrong ";
            sendResponse.sendErrorMessage(msg, reply, 500);
        }else{
            return sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
        }
    })
}
function updateOrInsertFooterData(dbName,key,value){
    return new Promise(async(resolve,reject)=>{
        let selectQuery = "select id from tbl_setting where `key`=?"
        let result = await ExecuteQ.Query(dbName,selectQuery,[key])
        if(result && result.length>0){
            let updateQuery = "update tbl_setting set value=? where `key`=?"
            await ExecuteQ.Query(dbName,updateQuery,[value,key])
            resolve();
        }else{
            let insertQuery = "insert into tbl_setting(`key`,value) values(?,?) "
            await ExecuteQ.Query(dbName,insertQuery,[key,value])
            resolve();
        }
    })
}


exports.deleteFeedbacks = function (req,res) {
    var id = req.body.id;
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.id){
                    id= req.body.id
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',async function(cb){
            var sql ="update feedback set is_deleted='1' where id='"+id+"'";
            var result = await ExecuteQ.Query(req.dbName,sql,[])
            data=result;
            cb(null);
        }]
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}

exports.accountPayablelist = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var search = req.body.search    
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var payment_source = req.body.payment_source ? req.body.payment_source : '';
    var adminId;
    const is_download = req.body.is_download
    var data=[];
    var supplier='',
        startDate= '1990-01-01',
        endDate='2100-01-01',
        status='';
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.supplier){
                    supplier= req.body.supplier
                }
                if(req.body.startDate){
                    startDate= moment(req.body.startDate).format('YYYY-MM-DD');
                }
                if(req.body.endDate){
                    endDate= moment(req.body.endDate).format('YYYY-MM-DD');
                }
                if(req.body.status){
                    status= req.body.status
                }

                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',function(cb){
            adminAccounts.accountPayableListing(req.dbName,res,supplier,startDate,endDate,status,search,limit,offset,payment_source,is_download,country_code,country_code_type,function (err,result) {
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

exports.accountPayablelistV1 = function (req,res) {

    var accessToken=0;
    var sectionId=0;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var search = req.body.search    
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var payment_source = req.body.payment_source ? req.body.payment_source : '';
    var adminId;
    const is_download = req.body.is_download
    var data=[];
    var supplier='',
        startDate= '1990-01-01',
        endDate='2100-01-01',
        status='';
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.supplier){
                    supplier= req.body.supplier
                }
                if(req.body.startDate){
                    startDate= moment(req.body.startDate).format('YYYY-MM-DD');
                }
                if(req.body.endDate){
                    endDate= moment(req.body.endDate).format('YYYY-MM-DD');
                }
                if(req.body.status){
                    status= req.body.status
                }

                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',function(cb){

            adminAccounts.accountPayableListingV1(req.dbName,res,supplier,startDate,endDate,status,search,limit,offset,payment_source,is_download,country_code,country_code_type,function (err,result) {
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

exports.payableDescription = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var orderId=0;
    var adminId;
    var data=[];
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.authSectionId && req.body.id)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                orderId=req.body.id;
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
                    console.log("adminId:  ",adminId);
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
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableDescription:['checkauthority',function(cb){
            accountPayableDescription(req.dbName,res,orderId,function (err,result) {
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
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

};
/**
 * @description used for when admin mark paymnet recieved in account section 
 */
exports.payment = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var orderId=0;
    var transactionData=2;
    var accountType=2;
    var adminId;
    var data=[];
    async.auto({
        blankField:function(cb) {
            console.log(req.body.transactionData);
            if(req.body && req.body.accessToken && req.body.authSectionId && req.body.transactionData)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                transactionData=req.body.transactionData;
                accountType=req.body.accountType;
              //  paymentMethod=req.body.paymethod;
             //   payId=req.body.payId;
                cb(null);
            } else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err) {
                    sendResponse .somethingWentWrongError(res);
                }
                else {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        payment:['checkauthority',function(cb){
          if(accountType == 1){
              receivablePayment(req.dbName,res,transactionData,function (err,result) {
                  if(err) {
                      sendResponse.somethingWentWrongError(res);
                  }
                  else {
                      data=[];
                      cb(null);
                  }
              })
          }
          else
          if(accountType == 2){
              subscriptionPayment(req.dbName,res,transactionData,function (err,result) {
                  if(err) {
                      sendResponse.somethingWentWrongError(res);
                  }
                  else {
                      data=[];
                      cb(null);
                  }
              })
          }
            else {
              payablePayment(req.dbName,res,transactionData,function (err,result) {
                  console.log(err,"========================",result)
                  if(err) {
                      sendResponse.somethingWentWrongError(res);
                  }
                  else {
                      data=result;
                      cb(null);
                  }
              })
          }

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    })

};

exports.accountReceivablelist = function (req,res) {


    var accessToken=0;
    var sectionId=0;
    var limit = req.body.limit
    var offset = req.body.offset
    var adminId;
    var search = req.body.search    
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    var data=[];
    var supplier='',
        startDate= '1990-01-01',
        endDate='2100-01-01',
        status='';
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.supplier){
                  supplier= req.body.supplier
                }
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                if(req.body.status){
                    status= req.body.status
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        receivableListing:['checkauthority',function(cb){

            adminAccounts.accountReceivableListing(req.dbName,res,supplier,
                startDate,endDate,status,search,limit,offset,is_download,country_code,country_code_type,function (err,result) {
                if(err) {
                    console.log("=====EaccountReceivableListingRR!==",err)
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

};


exports.accountReceivablelistV1 = function (req,res) {

    var accessToken=0;
    var sectionId=0;
    var limit = req.body.limit
    var offset = req.body.offset
    var adminId;
    var search = req.body.search    
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    var data=[];
    var supplier='',
        startDate= '1990-01-01',
        endDate='2100-01-01',
        status='';
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.supplier){
                  supplier= req.body.supplier
                }
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                if(req.body.status){
                    status= req.body.status
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        receivableListing:['checkauthority',function(cb){
            
            adminAccounts.accountReceivableListingV1(req.dbName,res,supplier,startDate,endDate,status,search,limit,offset,is_download,country_code,country_code_type,function (err,result) {
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

};


exports.receivableDescription = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var orderId=0;
    var adminId;
    var data=[];
    async.auto({
        blankField:function(cb)
        {
            if(req.body && req.body.accessToken && req.body.authSectionId && req.body.id)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                orderId=req.body.id;
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
                    console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb)
        {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
       receivableDescription:['checkauthority',function(cb){
            accountReceivableDescription(req.dbName,res,orderId,function (err,result) {
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

};
/**
 * @description used for listing an offline recieved payment in account section acc. orders
 */
exports.statement = function (req,res) {

    var search = req.body.search
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var limit = req.body.limit;
    var offset = req.body.offset
    var accessToken=0;
    var sectionId=0;
    var supplier='',
        startDate= '1990-01-01',
        endDate='2100-01-01';
    var adminId;
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    var data=[];
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId )
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.supplier){
                    supplier= req.body.supplier
                }
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        getStatement:['checkauthority',function(cb){
            adminAccounts.getStatement(req.dbName,res,supplier,startDate,endDate,search,limit,offset,is_download,country_code,country_code_type,function (err,result) {
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

};


exports.statementV1 = function (req,res) {
    var search = req.body.search
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var limit = req.body.limit;
    var offset = req.body.offset
    var accessToken=0;
    var sectionId=0;
    var supplier='',
        startDate= '1990-01-01',
        endDate='2100-01-01';
    var adminId;
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    var data=[];
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId )
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.supplier){
                    supplier= req.body.supplier
                }
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        getStatement:['checkauthority',function(cb){
            adminAccounts.getStatementV1(req.dbName,res,supplier,startDate,endDate,search,limit,offset,is_download,country_code,country_code_type,function (err,result) {
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

};

exports.accountPayableListing = function(db_name,res,supplier,startDate,endDate,status,search,limit,offset,payment_source,is_download,country_code,country_code_type,callback) {
var sum=0;
var id=0;

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
    var data1={};
    var sql;
    async.auto({
        ordersPart:async function (cb) {
             sql="select s.id,aro.status,IFNULL(odp.discountAmount,0) as discountAmount,o.supplier_vat_value, o.payment_source, o.card_payment_id as payment_id, o.transaction_id as payment_reference_number, aro.commission,aro.order_id,s.name,u.firstname,o.delivered_on,o.handling_admin,o.handling_supplier,o.delivery_charges,o.urgent_price,o.net_amount-discountAmount as net_amount,aro.total_amount from account_payable ar join account_payable_order aro " +
                "on aro.account_payable_id=ar.id join orders o on o.id=aro.order_id left join order_promo odp on odp.orderId = o.id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                " supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id " +
                "where s.id LIKE'%"+supplier+"%' AND  DATE( o.created_on ) >= '"+startDate+"' " +
                "AND DATE( o.created_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%' AND (u.firstname LIKE '%"+search+"%' OR aro.order_id LIKE '%"+search+"%') AND o.payment_source LIKE '%"+payment_source+"%' "+country_code_query+" order by aro.order_id desc LIMIT "+offset+","+limit


                if(parseInt(is_download)){
                    let sql1 = sql.split('LIMIT')[0];
                    let receivable = await ExecuteQ.Query(db_name,sql1,[]);
                    let header = [ 
                        {id: 'ORDER NO', title: 'ORDER NO'},
                        {id: 'RESTAURANT ID', title: 'RESTAURANT ID'},   
                        {id: 'RESTAURANT NAME', title: 'RESTAURANT NAME'}, 
                        {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME '},
                        {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'},
                        {id: 'TAX', title: 'TAX'},
                        {id: 'COMMISSION', title: 'COMMISSION'},
                        {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                        {id: 'ORDERS AMOUNT', title: 'ORDERS AMOUNT'},
                        {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                        {id: 'PAYMENT STATUS', title: 'PAYMENT STATUS'}
                      ]
                      let data = receivable.map((element)=>{
                          let temp = {}
                          temp["ORDER NO"] = element.order_id
                          temp["RESTAURANT ID"] = element.id
                          temp["RESTAURANT NAME"] = element.name 
                          temp["CUSTOMER NAME"] = element.firstname
                          temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                          temp.TAX = element.handling_admin
                          temp.COMMISSION = element.commission
                          temp["DELIVERY CHARGES"] = element.delivery_charges
                          temp["ORDERS AMOUNT"] = element.net_amount
                          temp["BALANCE AMOUNT"] = element.total_amount
                          temp["PAYMENT STATUS"] = element.status==1?"Received":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                          return temp;
                      })
            
                      let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                      logger.debug("+==========csvLingk=========",csvLink)
                      data1.csvFileLink = csvLink
                      cb(null)
                }else{
                    let payable=await ExecuteQ.Query(db_name,sql,[]);
                    // multiConnection[db_name].query(sql, function (err, payable) {
                    //     if (err) {
                    //         console.log('error2------', err);
                    //         sendResponse.somethingWentWrongError(res);
        
                    //     }
                    //     else {
                            if(payable.length){
                                data1.orders=payable
                            }
                            else {
                                data1.orders=[]
                            }
                            cb(null)
                    //     }
                    // })
                }
        },
        orderPart1:async function(cb){
            let sql3 = sql.split('LIMIT')[0];
            let payable=await ExecuteQ.Query(db_name,sql3,[]);
            // let stmt = multiConnection[db_name].query(sql3, function (err, payable) {
            //     logger.debug("========orderpart1===========sql3====>>>><<<<>>>",stmt.sql)
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
                    if(payable.length){
                        data1.count=payable.length
                        
                    }
                    else {
                        data1.count=0
                    }
                        cb(null)
            //     }
            // })
        },
        ordersPart2:async function (cb) {
            var sql="select sum(aro.commission) as total_commission,sum(o.handling_admin) as total_handling_admin,sum(o.handling_supplier) as total_handling_supplier," +
                "sum(o.delivery_charges) as total_delivery_charges,sum(o.urgent_price) as total_urgent_charges,sum(o.net_amount) as total_net_amount," +
                "sum(aro.total_amount) as total_payable_amount from account_payable ar join account_payable_order aro " +
                "on aro.account_payable_id=ar.id join orders o on o.id=aro.order_id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                "supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id " +
                "where s.id LIKE '%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' " +
                "AND DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%'  AND o.payment_source LIKE '%"+payment_source+"%'  "+country_code_query+"";
                
                let result=await ExecuteQ.Query(db_name,sql,[]);
                // multiConnection[db_name].query(sql, function (err, result) {
                // if (err) {
                //     console.log('error1------', err);
                //     sendResponse.somethingWentWrongError(res);

                // }
                // else {
                    if(result.length){
                        if(result[0].total_commission==null){
                            data1.totals={
                                "total_commission":0,
                                "total_handling_admin":0,
                                "total_handling_supplier":0,
                                "total_delivery_charges":0,
                                "total_urgent_charges":0,
                                "total_net_amount":0,
                                "total_payable_amount":0
                            }
                        }
                        else {
                            data1.totals=result
                        }
                        
                    }
                    else {
                        data1.totals={
                            "total_commission":0,
                            "total_handling_admin":0,
                            "total_handling_supplier":0,
                            "total_delivery_charges":0,
                            "total_urgent_charges":0,
                            "total_net_amount":0,
                            "total_payable_amount":0
                        }
                    }
                    cb(null)
            //     }
            // })
        },
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data1);
        }
    });


/*    var sql="select ap.id,apo.order_id,apo.order_transaction_id,o.handling_admin,o.handling_supplier,o.delivery_charges,(o.net_amount-(o.handling_supplier+o.handling_admin+o.delivery_charges)) as cost_price," +
        "o.handling_admin AS Admin_Total,apo.total_amount AS Supplier_Total,apo.total_left,apo.status,apo.total_paid AS Transfered,apo.transaction_mode,apo.payment_date,apo.payment_transaction_id from account_payable ap join account_payable_order apo " +
        "on apo.account_payable_id=ap.id join orders o on o.id=apo.order_id";
    multiConnection[dbName].query(sql,function (err,payable) {
        if(err)
        {
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res);

        }
        else if(payable.length > 0) {
            var sql1='select apo.order_id,o.net_amount,p.commission_type,p.commission from account_payable_order apo ' +
                'join orders o on o.id=apo.order_id join order_prices op on o.id=op.order_id join product p on op.product_id=p.id';
            multiConnection[dbName].query(sql1,function (err,comm) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);
                }
                else{
               //     console.log('com---',comm);
                    for(var j=0;j<payable.length;j++)
                    {
                        (function (j) {
                            sum=0;
                            for(var i=0;i<comm.length;i++)
                            {(function (i)
                            {
                                console.log('order----',comm[i].order_id,payable[j].order_id);
                                if(comm[i].order_id == payable[j].order_id)
                                {
                                    console.log('commtype---',comm[i].commission_type)
                                    if(comm[i].commission_type==0)
                                    {
                                        console.log('comm1---',comm[i].commission)

                                        sum=sum+comm[i].commission;
                                        console.log('sum',sum);
                                    }
                                    else {
                                        console.log('comm2---',comm[i].commission)
                                        sum = sum + ((comm[i].commission * comm[i].net_amount) / 100);
                                        console.log('sum',sum);
                                    }
                                }
                                if(i==comm.length-1){
                                    payable[j].commission=sum;
                                    payable[j].cost_price= payable[j].cost_price - sum;
                                    payable[j].Admin_Total= payable[j].Admin_Total + sum;
                                 

                                }
                            }(i));
                            }
                            if(j==payable.length-1)
                            {
                                callback(null,payable);
                            }
                        }(j));
                    }
                }
            });

        }
        else {
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })*/
}
const totalOrderPrice  = (dbName,order_id)=>{
    return new Promise(async(resolve,reject)=>{
        let temp_price = 0
        logger.debug("=================result=======",order_id);
        let query = 'select op.price,op.order_id,op.freeQuantity,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
        let params = []
        let product1 = await ExecuteQ.Query(dbName,query,params);
        let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
        var is_decimal_quantity_allowed = "0";
        if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
            is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
        }
        logger.debug("========product1.len======",product1.length)
            for(var j=0;j<product1.length;j++){
                // logger.debug("=========product1[j].order_id == result.id==============",order_id,product1[j].order_id,product1[j].order_id == order_id);
                let id1 = parseInt(product1[j].order_id)
                let id2 = order_id
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

exports.accountPayableListingV1 = function(db_name,res,supplier,startDate,endDate,status,search,limit,offset,payment_source,is_download,country_code,country_code_type,callback) {
    var sum=0;
    var id=0;
   
    let supplierquery = "%"+supplier+"%"
    if(supplier){
        supplierquery = ""+supplier+""
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
        var data1={};
        var sql;
        async.auto({
            ordersPart:async function (cb) {
                 sql="select (SELECT request_status from agent_supplier_payouts where order_id=o.id limit 1) as withdraw_request_status,o.waiting_charges,o.supplier_vat_value,o.user_service_charge,o.self_pickup, s.id, s.vat_value,   aro.status,o.promo_discount,o.payment_source,cr.id as cart_id,op.quantity,op.product_id, o.card_payment_id as payment_id, o.transaction_id as payment_reference_number, aro.commission,aro.order_id,s.name,u.firstname,o.delivered_on,o.handling_admin,o.handling_supplier,o.delivery_charges,o.urgent_price,o.net_amount,o.net_amount as total_order_price,aro.total_amount from account_payable ar join account_payable_order aro " +
                    "on aro.account_payable_id=ar.id join orders o on o.id=aro.order_id  join order_prices op on op.order_id = o.id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                    " supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id join cart cr on cr.id=o.cart_id " +
                    "where s.id LIKE '"+supplierquery+"' AND  DATE( o.created_on ) >= '"+startDate+"' " +
                    "AND DATE( o.created_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%' AND (u.firstname LIKE '%"+search+"%' OR aro.order_id LIKE '%"+search+"%') AND o.payment_source LIKE '%"+payment_source+"%' "+country_code_query+" group by aro.order_id order by aro.order_id desc LIMIT "+offset+","+limit
    
    
                         let sql2="select `key`,`value` from tbl_setting where `key` =? "
                        var textEnableKey = await ExecuteQ.Query(db_name,sql2,["is_tax_added"]);
                    if(parseInt(is_download)){
                        // let sql1 = sql.split('LIMIT')[0];
                        let receivable = await ExecuteQ.Query(db_name,sql,[]);

                        // for (const [key, value] of receivable.entries()) {

                        //     value.Product_cost = await totalOrderPrice(db_name,value.order_id)
        
                        // }

                        let header = [ 
                            {id: 'ORDER NO', title: 'ORDER NO'},
                            {id: 'RESTAURANT ID', title: 'RESTAURANT ID'},   
                            {id: 'RESTAURANT NAME', title: 'RESTAURANT NAME'}, 
                            {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME '},
                            {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'},
                            {id: 'TAX', title: 'TAX'},
                            {id: 'COMMISSION', title: 'COMMISSION'},
                            {id: 'ORDER SUB-TOTAL', title: 'ORDER SUB-TOTAL'},
                            {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                            {id: 'ORDERS AMOUNT', title: 'ORDERS AMOUNT'},
                            {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                            {id: 'PAYMENT STATUS', title: 'PAYMENT STATUS'}
                          ]
                          let data=[]
                          for(const [index,element] of receivable.entries()){
                            let temp = {}
                            let Product_cost =await totalOrderPrice(db_name,element.order_id)
                            let adds_on=await getOrderAddsOn(db_name,element.cart_id,element.product_id);
                            if(adds_on && adds_on.length>0){
                                let addonprice = await addonTotalPrice(adds_on,element.quantity)
                                Product_cost = Product_cost + addonprice;
                            }
                            element.Product_cost=Product_cost;
                              temp["ORDER NO"] = element.order_id
                              temp["RESTAURANT ID"] = element.id
                              temp["RESTAURANT NAME"] = element.name 
                              temp["CUSTOMER NAME"] = element.firstname
                              temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                              temp.TAX = element.handling_admin
                              temp.COMMISSION = element.commission
                              temp["ORDER SUB-TOTAL"] = element.Product_cost
                              temp["DELIVERY CHARGES"] = element.delivery_charges
                                temp["ORDERS AMOUNT"] = element.net_amount
                                if(textEnableKey.length>0 && textEnableKey[0].value==0){
                                    temp["BALANCE AMOUNT"] = element.total_amount + element.user_service_charge
                                }
                                else{
                                    temp["BALANCE AMOUNT"] = element.total_amount
                                }
                            //   temp["BALANCE AMOUNT"] = element.total_amount
                              temp["PAYMENT STATUS"] = element.status==1?"Received":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                             data.push(temp);
                          }
                          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                          logger.debug("+==========csvLingk=========",csvLink)
                          data1.csvFileLink = csvLink
                          cb(null)
                    }else{
                        let receivable=await ExecuteQ.Query(db_name,sql,[]);
                        console.log("======LOOPP->==>>")
                        for (const [key, value] of receivable.entries()) {
                            console.log("=====key.cart_id==>>",value.cart_id)
                            let Product_cost = await totalOrderPrice(db_name,value.order_id);
                            let adds_on=await getOrderAddsOn(db_name,value.cart_id,value.product_id);
                            if(adds_on && adds_on.length>0){
                                let addonprice = await addonTotalPrice(adds_on,value.quantity)
                                Product_cost = Product_cost + addonprice;
                            }
                            value.Product_cost=Product_cost;
                        }
                        
                                if(receivable.length){
                                    if(textEnableKey.length>0 && textEnableKey[0].value==0){
                                        let changReceivable=[]
                                    for(let i=0;i<receivable.length;i++){
                                        receivable[i].total_amount=receivable[i].total_amount+receivable[i].user_service_charge
                                        changReceivable.push(receivable[i])
                                    }
                                    data1.orders=changReceivable
                                }
                                else{
                                    data1.orders=receivable
                                }
                                }
                                else {
                                    data1.orders=[]
                                }
                                cb(null)
                        
                    }
            },
            orderPart1:function(cb){
                let sql3 = sql.split('LIMIT')[0];
                let stmt = multiConnection[db_name].query(sql3, function (err, payable) {
                    logger.debug("========orderpart1===========sql3====>>>><<<<>>>",stmt.sql)
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);
    
                    }
                    else {
                        if(payable.length){
                            data1.count=payable.length
                            
                        }
                        else {
                            data1.count=0
                        }
                            cb(null)
                    }
                })
            },
            ordersPart2:async function (cb) {

                var sql="select sum(aro.commission) as total_commission,sum(o.handling_admin) as total_handling_admin,sum(o.handling_supplier) as total_handling_supplier," +
                    "sum(o.delivery_charges) as total_delivery_charges,sum(o.urgent_price) as total_urgent_charges,sum(o.net_amount) as total_net_amount," +
                    "aro.total_amount as total_payable_amount from account_payable ar join account_payable_order aro " +
                    "on aro.account_payable_id=ar.id join orders o on o.id=aro.order_id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                    "supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id " +
                    "where s.id LIKE '%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' " +
                    "AND DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%'  AND o.payment_source LIKE '%"+payment_source+"%'  "+country_code_query+" group by aro.order_id";
                    let result=await ExecuteQ.Query(db_name,sql,[]);
                    // multiConnection[db_name].query(sql,  function (err, result) {
                    // if (err) {
                    //     console.log('error1------', err);
                    //     sendResponse.somethingWentWrongError(res);
    
                    // }
                    // else {
                        let totalJson={
                            "total_commission":0,
                            "total_handling_admin":0,
                            "total_handling_supplier":0,
                            "total_delivery_charges":0,
                            "total_urgent_charges":0,
                            "total_net_amount":0,
                            "total_payable_amount":0
                        }
                        if(result.length>0){
                            for(const [index,i] of result.entries()){
                                totalJson.total_commission=i.total_commission!=null?parseFloat(totalJson.total_commission)+parseFloat(i.total_commission):parseFloat(totalJson.total_commission)+0
                                totalJson.total_handling_admin=i.total_handling_admin!=null?parseFloat(totalJson.total_handling_admin)+parseFloat(i.total_handling_admin):parseFloat(totalJson.total_handling_admin)+0
                                totalJson.total_handling_supplier=i.total_handling_supplier!=null?parseFloat(totalJson.total_handling_supplier)+parseFloat(i.total_handling_supplier):parseFloat(totalJson.total_handling_supplier)+0
                                totalJson.total_delivery_charges=i.total_delivery_charges!=null?parseFloat(totalJson.total_delivery_charges)+parseFloat(i.total_delivery_charges):parseFloat(totalJson.total_delivery_charges)+0
                                totalJson.total_urgent_charges=i.total_urgent_charges!=null?parseFloat(totalJson.total_urgent_charges)+parseFloat(i.total_urgent_charges):parseFloat(totalJson.total_urgent_charges)+0
                                totalJson.total_net_amount=i.total_net_amount!=null?parseFloat(totalJson.total_net_amount)+parseFloat(i.total_net_amount):parseFloat(totalJson.total_net_amount)+0
                                totalJson.total_payable_amount=i.total_payable_amount!=null?parseFloat(totalJson.total_payable_amount)+parseFloat(i.total_payable_amount):parseFloat(totalJson.total_payable_amounts)+0
                                if(index==(result.length-1)){
                                    data1.totals=[totalJson]
                                    cb(null)
                                }
                            }

                            // if(result[0].total_commission==null){
                            //     data1.totals={
                            //         "total_commission":0,
                            //         "total_handling_admin":0,
                            //         "total_handling_supplier":0,
                            //         "total_delivery_charges":0,
                            //         "total_urgent_charges":0,
                            //         "total_net_amount":0,
                            //         "total_payable_amount":0
                            //     }
                            // }
                            // else {
                            //     data1.totals=result
                            // }
                            
                        }
                        else {
                            data1.totals={
                                "total_commission":0,
                                "total_handling_admin":0,
                                "total_handling_supplier":0,
                                "total_delivery_charges":0,
                                "total_urgent_charges":0,
                                "total_net_amount":0,
                                "total_payable_amount":0
                            }
                            cb(null)
                        }
                    
                //     }
                // })
            },
        },function (err,result) {
            if(err)
            {
                console.log('err12-----',err);
                sendResponse.somethingWentWrongError(res);
            }
            else{
                callback(null,data1);
            }
        });
    }

const addonTotalPrice=(addOns,quantity)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let addonprice = 0
            if(addOns && addOns.length>0){
                for(const [index,i] of addOns.entries()){
                    addonprice = addonprice + (i.price*parseInt(i.quantity))
                    // addonprice = addonprice + (i.price*i.quantity)
                }
            }
            resolve(addonprice)
        }
        catch(Err){
            reject(Err)
        }
    })
}
const getOrderAddsOn=(dbName,cartId,productId)=>{
    return new Promise(async (resolve,reject)=>{
            try{
                var data=await ExecuteQ.Query(dbName,"select "+
                "cart_adds_on.*"+
                " from cart_adds_on join product_adds_on padds on padds.id=cart_adds_on.adds_on_id where cart_id=?",[parseInt(cartId)])
                resolve(data)
            }
            catch(Err){
                reject(Err)
            }
    })
}

    
function accountPayableDescription(dbName,res,id,callback){
    var sum=0;
    var sum1=0;
    var data1 ={};
    var details=[]
    var supplier_id=0;
    async.auto({
        orderDetails1:function (cb) {
            var sql = "select op.price,op.quantity,p.id as product_id,p.category_id,op.product_name,(op.price-(op.handling_admin+op.handling_supplier))" +
                "AS Amount,op.handling_admin,op.handling_supplier," +
                "(op.price-(op.handling_admin+op.handling_supplier)) AS Supplier_Costprice,op.price AS user_paid " +
                "from orders o join order_prices op on o.id=op.order_id join product p on p.id=op.product_id where o.id = ?";
            multiConnection[dbName].query(sql, [id], function (err, receivabledesc) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    data1.order_description = receivabledesc;
                    details=receivabledesc;
                    cb(null)
                }
            })
        },
        orderDetails2:function (cb) {
            var sql1 = 'select o.id,sb.supplier_id,o.delivery_charges,o.net_amount ,aro.total_amount as adminTotal,(o.net_amount-aro.total_amount) as supplierTotal ' +
                ' from orders o join account_payable_order aro on aro.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id  where o.id= ?';
            multiConnection[dbName].query(sql1, [id], function (err, delivery) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data1.delivery_charge = delivery[0].delivery_charges;
                    data1.Net_userpaid = delivery[0].net_amount;
                    data1.Admin_Total = delivery[0].adminTotal;
                    data1.orderId = delivery[0].id;
                    data1.supplier_Total = delivery[0].supplierTotal;
                    supplier_id=delivery[0].supplier_id;
                    console.log('sss--', data1);
                    cb(null, data1);
                }
            });

        },
        orderDetails3:['orderDetails1','orderDetails2',function (cb) {
            if(details.length){
                for(var i=0;i<details.length;i++){
                    (function (i) {
                        var sql='select commission_type,commission from supplier_category where supplier_id =? and category_id = ? group by category_id'
                        multiConnection[dbName].query(sql,[supplier_id,details[i].category_id],function (err,result) {
                            if(err){
                                console.log('err14-----',err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                if(result[0].commission_type == 0) {
                                    details[i].commission_admin=result[0].commission;
                                    details[i].commission=result[0].commission;
                                    details[i].commission_type=result[0].commission_type;
                                    details[i].Supplier_Costprice=details[i].Supplier_Costprice - details[i].commission_admin;
                                    if(i==(details.length-1)){
                                        cb(null)
                                    }
                                }
                                else {
                                    details[i].commission_admin=(result[0].commission * (details[i].price*details[i].quantity)) / 100;
                                    details[i].commission=details[i].commission_admin;
                                    details[i].commission_type=result[0].commission_type;
                                    details[i].Supplier_Costprice=details[i].Supplier_Costprice - details[i].commission_admin;
                                    if(i==(details.length-1)){
                                        cb(null)
                                    }
                                }
                            }
                        })

                    }(i))
                }
            }
            else {
                cb(null)
            }
        }]

    },function (err,result) {
        if(err){
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null,data1);
        }
    })

    /* var sql="select op.product_name,(op.price-(op.handling_admin+op.handling_supplier)) AS Amount,op.handling_admin,p.commission_type,p.commission,op.handling_supplier,(op.price-(op.handling_admin+op.handling_supplier)) AS Supplier_Costprice,op.price AS user_paid " +
         "from orders o join order_prices op on o.id=op.order_id join product p on p.id=op.product_id where o.id = ?";
     multiConnection[dbName].query(sql,[id],function (err,payabledesc) {
         if(err) {
             console.log('error------',err);
             sendResponse.somethingWentWrongError(res);

         }
         else if(payabledesc.length){
          //   console.log('pay111-----',payabledesc);
           //  console.log('id---',id);
             for(var i=0;i<payabledesc.length;i++){
                 (function (i) {
                     if(payabledesc[i].commission_type==0)
                     {
                     payabledesc[i].commission_admin=payabledesc[i].commission;
                     payabledesc[i].Supplier_Costprice=payabledesc[i].Supplier_Costprice-payabledesc[i].commission_admin;
                     sum=sum+payabledesc[i].handling_admin+payabledesc[i].commission_admin;
                     sum1=sum1+payabledesc[i].handling_supplier+payabledesc[i].Supplier_Costprice;
                     }
                     else{
                         payabledesc[i].commission_admin=((payabledesc[i].commission/100)* payabledesc[i].Amount);
                         payabledesc[i].Supplier_Costprice=payabledesc[i].Supplier_Costprice-payabledesc[i].commission_admin;
                         sum=sum+payabledesc[i].handling_admin+payabledesc[i].commission_admin;
                         sum1=sum1+payabledesc[i].handling_supplier+payabledesc[i].Supplier_Costprice;
                     }

                     if(i==payabledesc.length-1)
                     {
                         console.log("sum---",sum);
                         data.Admin_Total=sum;
                         data.supplier_Total=sum1;
                     }
                 }(i))
             }
             data.orderdescription=payabledesc;
             var sql1='select o.delivery_charges,o.net_amount from orders o where o.id= ?';
             multiConnection[dbName].query(sql1,[id],function (err,delivery) {
                 if(err)
                 {
                     console.log('error------',err);
                     sendResponse.somethingWentWrongError(res);
                 }
                 else {
                     console.log('del==',delivery);
                     data.delivery_charge=delivery[0].delivery_charges;
                     data.Net_userpaid=delivery[0].net_amount;
                     console.log('sss--',data);
                     callback(null,data);
                 }
             });
         }
         else {
             sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

         }
     })*/
}

function receivablePayment(dbName,res,data,callback) {
var id=0;
    console.log(".nfds",data.length);
    async.auto({
        update:function (cb) {
            for(var i=0;i<data.length;i++){
                (async function (i) {
                    var amount=parseInt(data[i].amount);
                    var orderId=parseInt(data[i].orderId);
                    var sql = "update account_receivable_order aro join account_receivable ar on aro.account_receivable_id = ar.id set " +
                        "aro.total_left = aro.total_left - "+amount+",aro.total_paid = aro.total_paid  + "+amount+",aro.status = 1," +
                        "ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.order_id = "+orderId;
                    await ExecuteQ.Query(dbName,sql,[])
                    // multiConnection[dbName].query(sql, function (err, result) {
                    //     console.log("dfsnfdskfds",err,result)
                    //     if (err) {
                    //         console.log('errr1----', err);
                    //         sendResponse.somethingWentWrongError(res);
                    //     }
                    //     else {
                            // console.log("dfd",i)
                            if(i==(data.length-1)){
                                cb(null);
                            }
                    //     }
                    // });
                }(i))
            }
        },
        setStatement:['update',function (cb) {
            var date1 = moment().utcOffset(4);
            var date=date1._d;
            for(var i=0;i<data.length;i++){
                (async function (i) {
                    var amount=parseInt(data[i].amount);
                    var orderId=data[i].orderId
                    var supplierId=data[i].supplierId
                    var sql ='insert into account_statement(supplier_id,order_id,transaction_date,credit)values(?,?,?,?)';
                    await ExecuteQ.Query(dbName,sql,[supplierId,orderId,date,amount])
                    // multiConnection[dbName].query(sql,[supplierId,orderId,date,amount], function (err, result) {
                    //     console.log("dfsnfdskfds",err,result)
                    //     if (err) {
                    //         console.log('errr1----', err);
                    //         sendResponse.somethingWentWrongError(res);
                    //     }
                    //     else {
                            // console.log("ddd",i)
                            if(i==(data.length-1)){
                                cb(null);
                            }
                    //     }
                    // });
                }(i))
            }
        }]
    },function (err,result) {
        if(err){
            console.log('errr3----', err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    });
   // data=JSON.parse(data)
   
  /*async.auto({
      update:function (cb) {
          connection.beginTransaction(function (err) {
              if (err) {
                  console.log('error------', err);
                  sendResponse.somethingWentWrongError(res);
              }
              else {
                  var sql = "update account_payable_order set total_paid = total_paid + ?,total_left=total_left - ?,transaction_mode=?,payment_transaction_id = ? where order_id = ? AND status!=1";
                  multiConnection[dbName].query(sql, [amount, amount, method, payId, id1], function (err, result) {
                      if (err) {
                          multiConnection[dbName].rollback(function () {
                              console.log('errr1----', err);
                              sendResponse.somethingWentWrongError(res);
                          });
                      }
                      else if (result.affectedRows) {
                          cb(null);
                      }
                      else {
                          var msg = "No value to pay";
                          sendResponse.sendErrorMessage(msg, res,constant.responseStatus.SOME_ERROR);
                      }
                  });
              }
          });
      },
      status:['update',function(cb){
        var sql1='select account_payable_id,total_amount,total_paid from account_payable_order where order_id=?';
         var sql2='update account_payable_order set status = ? where order_id = ?';
          multiConnection[dbName].query(sql1,[id1],function (err,result) {
              if(err)
              {
                  multiConnection[dbName].rollback(function () {
                      console.log('errr2----', err);
                      sendResponse.somethingWentWrongError(res);
                  });
              }
              else {
                  id=result[0].account_payable_id;
                  if(result[0].total_amount == result[0].total_paid)
                  {
                      multiConnection[dbName].query(sql2,[1,id1],function (err,result1) {
                          if(err)
                          {
                              multiConnection[dbName].rollback(function () {
                                  console.log('errr3----', err);
                                  sendResponse.somethingWentWrongError(res);
                              });
                          }
                          else {
                              cb(null)
                          }
                      });
                  }
                  else {
                      multiConnection[dbName].query(sql2,[2,id1],function (err,result1) {
                          if(err)
                          {
                              multiConnection[dbName].rollback(function () {
                                  console.log('errr4----', err);
                                  sendResponse.somethingWentWrongError(res);
                              });
                          }
                          else {
                              cb(null);
                          }
                      });
                  }
              }
          })
    }],
    updateAccountPayable:['status',function (cb) {
        var sql3="update account_payable set amount_paid = amount_paid + ?,amount_left=amount_left - ? where id = ? AND status!=1";
            multiConnection[dbName].query(sql3,[amount,amount,id],function (err,result2) {
                if(err){
                    multiConnection[dbName].rollback(function () {
                        console.log('errr5----', err);
                        sendResponse.somethingWentWrongError(res);
                    });
                }
                 else {
                    cb(null);
                }
            })
    }],
      updateAccountPayablStatus:['updateAccountPayable',function(cb){
          var sql4='select supplier_id,total_amount,amount_paid from account_payable where id=?';
          var sql5='update account_payable set status = ? where id = ?';
          multiConnection[dbName].query(sql4,[id],function (err,result) {
              if(err)
              {
                  multiConnection[dbName].rollback(function () {
                      console.log('errr6----', err);
                      sendResponse.somethingWentWrongError(res);
                  });
              }
              else {
                  supplier=result[0].supplier_id;
                  if(result[0].total_amount == result[0].amount_paid)
                  {
                      multiConnection[dbName].query(sql5,[1,id],function (err,result1) {
                          if(err)
                          {
                              multiConnection[dbName].rollback(function () {
                                  console.log('errr1----', err);
                                  sendResponse.somethingWentWrongError(res);
                              });
                          }
                          else {
                              cb(null)
                          }
                      });
                  }
                  else {
                      multiConnection[dbName].query(sql5,[2,id],function (err,result1) {
                          if(err)
                          {
                              multiConnection[dbName].rollback(function () {
                                  console.log('errr7----', err);
                                  sendResponse.somethingWentWrongError(res);
                              });
                          }
                          else {
                              cb(null);
                          }
                      });
                  }
              }
          })
      }],
      updateStatement:['updateAccountPayablStatus',function (cb) {
        var sql9='insert into account_statement(transaction_id,supplier_id,order_id,transaction_date,payment_method,debit)values(?,?,?,?,?,?)';
            multiConnection[dbName].query(sql9,[payId,supplier,id1,date1,method,amount],function (err,result) {
                if(err)
                {
                    multiConnection[dbName].rollback(function () {
                        console.log('err143-----',err);
                        sendResponse.somethingWentWrongError(res);
                    });
                }
                else {
                    cb(null);
                }
            })
      }]
  }, function(err,result){
      if(err) {
          multiConnection[dbName].rollback(function () {
              console.log('err12-----',err);
              sendResponse.somethingWentWrongError(res);
          });
      }else{
          connection.commit(function (err) {
              if(err)
              {
                  multiConnection[dbName].rollback(function () {
                      console.log('err12-----',err);
                      sendResponse.somethingWentWrongError(res);
                  });
              }
              else{
                  console.log('Transaction Complete----');
                  callback(null);
              }
          });
      }
  })*/

}

async function payablePayment(dbName,res,data,callback) {
    let strip_secret_key_data = await Universal.getStripSecretKey(dbName);

    var id=0;
    console.log("111111111111111111111")
    var unsuccessfulOrderIds = [];
        async.auto({
            update:function (cb) {
                console.log("2222222222222222222222222222")
                var date1 = moment().utcOffset(4);
                var date=date1._d
                for(var i=0;i<data.length;i++){
                    (async function (i) {
                        console.log("3333333333333333333333333333333")
                        var amount=parseFloat(data[i].amount);
                        var orderId=parseInt(data[i].orderId);
                        var supplierId=data[i].supplierId;
                        var transaction_mode=data[i].transaction_mode;
    
                        if(transaction_mode == "1"){
                            console.log("444444444444444444444444444444444")
                            
                            var reslt = await ExecuteQ.Query(dbName,"SELECT o.payment_source,o.card_payment_id, (SELECT value FROM `tbl_setting` WHERE `key` = 'is_supplier_stripe_split_enabled' LIMIT 1) is_supplier_stripe_split_enabled, (SELECT stripe_account from supplier where id=?) supplier_stripe_account_id   FROM `orders` o where o.id=?",[supplierId,orderId])
                            console.log("result =========== ", reslt);
    console.log(dbName,"dbname.............")
                            if(reslt[0] != undefined && reslt[0].payment_source && reslt[0].payment_source == "stripe" && reslt[0].card_payment_id != "" && reslt[0].is_supplier_stripe_split_enabled=="1"){
                                console.log("555555555555555555555555555555555555555555")
                                var charge_id=reslt[0].card_payment_id; // charge id
                                var is_supplier_stripe_split_enabled=reslt[0].is_supplier_stripe_split_enabled;// 0/1 (0-disabled, 1 - enabled)
                                console.log(reslt[0].supplier_stripe_account_id,"KKKKKKKKKKKKKKKKKK")
    
                                if (is_supplier_stripe_split_enabled=="1" && reslt[0].supplier_stripe_account_id) {
                                    console.log("6666666666666666666666666666666666")
    console.log(parseInt(parseFloat(amount * 100)));
                                var stripe = require('stripe')(strip_secret_key_data[0].value);

                                    var stripeTransfer = await stripe.transfers.create({
                                        amount: parseInt(parseFloat(amount * 100)),
                                        currency: dbName=='northwesteats_0692'? 'gbp' :"usd",
                                        source_transaction: charge_id,
                                        destination: reslt[0].supplier_stripe_account_id,
                                    });
                                    console.log(stripeTransfer,"stripeTransferstripeTransfer");
                                    if(stripeTransfer.id){
                                        console.log("777777777777777777777777777777")
                                        var sqlUpdate="update orders set supplier_stripe_transfer_id=? where id=?";
                                        await ExecuteQ.Query(dbName,sqlUpdate,[stripeTransfer.id,orderId])
                                        var sql = "update account_payable_order aro join account_payable ar on aro.account_payable_id = ar.id set " +
                                        "aro.total_left = aro.total_left - "+amount+",aro.total_paid = aro.total_paid  + "+amount+",aro.status = 1," +
                                        "ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.order_id = "+orderId;
                                        await ExecuteQ.Query(dbName,sql,[])
                                        // multiConnection[dbName].query(sql, function (err, result) {
                                        //     console.log(".....",err,result);
                                        //     if (err) {
                                        //         console.log('errr1----', err);
                                        //         sendResponse.somethingWentWrongError(res);
                                        //     }
                                        //     else {
                                                var sqls ='insert into account_statement(supplier_id,order_id,transaction_date,debit)values(?,?,?,?)';
                                               await ExecuteQ.Query(dbName,sqls,[supplierId,orderId,date,amount])
                                                var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='2'"
                                                await ExecuteQ.Query(dbName,sql,[orderId,supplierId])
                                                // multiConnection[dbName].query(sql,[supplierId,orderId,date,amount], function (err, result) {
                                                //     if (err) {
                                                //         console.log('errr1----', err);
                                                //         sendResponse.somethingWentWrongError(res);
                                                //     }
                                                //     else {
                                                        if(i==(data.length-1)){
                                                            cb(null);
                                                        }
                                                //     }
                                                // });
                                        //     }
                                        // });
                                    }else{
                                        console.log("888888888888888888888888888888888")
                                        unsuccessfulOrderIds.push(data[i]);
                                        if(i==(data.length-1)){
                                            cb(null);
                                        }
                                    }
                                }else{
                                    console.log("99999999999999999999999999999999999")
                                    unsuccessfulOrderIds.push(data[i]);
                                    if(i==(data.length-1)){
                                        cb(null);
                                    }
                                }
                            }else{
                                console.log("101010101010101010101010101010")
                                unsuccessfulOrderIds.push(data[i]);
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        }else{
    
                            var sqlp = "update account_payable_order aro join account_payable ar on aro.account_payable_id = ar.id set " +
                                "aro.total_left = aro.total_left - "+amount+",aro.total_paid = aro.total_paid  + "+amount+",aro.status = 1," +
                                "ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.order_id = "+orderId;
                            await ExecuteQ.Query(dbName,sqlp,[])
                            
                            // multiConnection[dbName].query(sql, function (err, result) {
                            //     console.log(".....",err,result);
                            //     if (err) {
                            //         console.log('errr1----', err);
                            //         sendResponse.somethingWentWrongError(res);
                            //     }
                            //     else {
                                    // if(i==(data.length-1)){
                                    //     cb(null);
                                    // }
                                    var sql ='insert into account_statement(supplier_id,order_id,transaction_date,debit)values(?,?,?,?)';
                                   await ExecuteQ.Query(dbName,sql,[supplierId,orderId,date,amount])

                                   var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='2'"
                                   await ExecuteQ.Query(dbName,sql,[orderId,supplierId])
                                    // multiConnection[dbName].query(sql,[supplierId,orderId,date,amount], function (err, result) {
                                    //     if (err) {
                                    //         console.log('errr1----', err);
                                    //         sendResponse.somethingWentWrongError(res);
                                    //     }
                                    //     else {
                                            if(i==(data.length-1)){
                                                cb(null);
                                            }
                                    //     }
                                    // });
                            //     }
                            // });
                        }
    
                    }(i))
                }
            },
            // setStatement:['update',function (cb) {
            //     var date1 = moment().utcOffset(4);
            //     var date=date1._d
            //     for(var i=0;i<data.length;i++){
            //         (function (i) {
            //             var amount=parseInt(data[i].amount);
            //             var orderId=data[i].orderId;
            //             var supplierId=data[i].supplierId;
            //             var sql ='insert into account_statement(supplier_id,order_id,transaction_date,debit)values(?,?,?,?)';
            //             multiConnection[dbName].query(sql,[supplierId,orderId,date,amount], function (err, result) {
            //                 if (err) {
            //                     console.log('errr1----', err);
            //                     sendResponse.somethingWentWrongError(res);
            //                 }
            //                 else {
            //                     if(i==(data.length-1)){
            //                         cb(null);
            //                     }
            //                 }
            //             });
            //         }(i))
            //     }
            // }]
        },function (err,result) {
            if(err){
                console.log('errr3----', err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                console.log("unsuccessfulOrderIds === ",unsuccessfulOrderIds)
                callback(null, unsuccessfulOrderIds);
            }
        });
    
    }
    

function subscriptionPayment(dbName,res,data,callback) {
var id=0;
    async.auto({
        update:function (cb) {
            for(var i=0;i<data.length;i++){
                (async function (i) {
                    try{
                    var amount=parseInt(data[i].amount);
                    var orderId=parseInt(data[i].orderId);
                    var sql = "update account_receivable_subscriptions aro join account_receivable ar on aro.account_receivable_id = ar.id set " +
                        "aro.transaction_status = 1,ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.id = "+orderId;
                   await ExecuteQ.Query(dbName,sql,[])
                        // multiConnection[dbName].query(sql, function (err, result) {
                    //     console.log(".....",err,result);
                    //     if (err) {
                    //         console.log('errr1----', err);
                    //         sendResponse.somethingWentWrongError(res);
                    //     }
                    //     else {
                            if(i==(data.length-1)){
                                cb(null);
                            }
                    //     }
                    // });
                }
                catch(Err){
                    sendResponse.somethingWentWrongError(res);
                }
                }(i))
            }
        },
        setStatement:['update',function (cb) {
            var date1 = moment().utcOffset(4);
            var date=date1._d
            for(var i=0;i<data.length;i++){
                (async function (i) {
                    try{
                    var amount=parseInt(data[i].amount);
                    var orderId=data[i].orderId;
                    var supplierId=data[i].supplierId;
                    var sql ='insert into account_statement(supplier_id,subscription_id,transaction_date,credit)values(?,?,?,?)';
                    await ExecuteQ.Query(dbName,sql,[supplierId,orderId,moment(date).format('YYYY-MM-DD'),amount])
                    // multiConnection[dbName].query(sql,[supplierId,orderId,moment(date).format('YYYY-MM-DD'),amount], function (err, result) {
                    //     if (err) {
                    //         console.log('errr1----', err);
                    //         sendResponse.somethingWentWrongError(res);
                    //     }
                    //     else {
                            if(i==(data.length-1)){
                                cb(null);
                            }
                    //     }
                    // });
                        }
                        catch(Err){
                            sendResponse.somethingWentWrongError(res);
                        }
                }(i))
            }
        }]
    },function (err,result) {
        if(err){
            console.log('errr3----', err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    });
   // data=JSON.parse(data)

  /*async.auto({
      update:function (cb) {
          connection.beginTransaction(function (err) {
              if (err) {
                  console.log('error------', err);
                  sendResponse.somethingWentWrongError(res);
              }
              else {
                  var sql = "update account_payable_order set total_paid = total_paid + ?,total_left=total_left - ?,transaction_mode=?,payment_transaction_id = ? where order_id = ? AND status!=1";
                  multiConnection[dbName].query(sql, [amount, amount, method, payId, id1], function (err, result) {
                      if (err) {
                          multiConnection[dbName].rollback(function () {
                              console.log('errr1----', err);
                              sendResponse.somethingWentWrongError(res);
                          });
                      }
                      else if (result.affectedRows) {
                          cb(null);
                      }
                      else {
                          var msg = "No value to pay";
                          sendResponse.sendErrorMessage(msg, res,constant.responseStatus.SOME_ERROR);
                      }
                  });
              }
          });
      },
      status:['update',function(cb){
        var sql1='select account_payable_id,total_amount,total_paid from account_payable_order where order_id=?';
         var sql2='update account_payable_order set status = ? where order_id = ?';
          multiConnection[dbName].query(sql1,[id1],function (err,result) {
              if(err)
              {
                  multiConnection[dbName].rollback(function () {
                      console.log('errr2----', err);
                      sendResponse.somethingWentWrongError(res);
                  });
              }
              else {
                  id=result[0].account_payable_id;
                  if(result[0].total_amount == result[0].total_paid)
                  {
                      multiConnection[dbName].query(sql2,[1,id1],function (err,result1) {
                          if(err)
                          {
                              multiConnection[dbName].rollback(function () {
                                  console.log('errr3----', err);
                                  sendResponse.somethingWentWrongError(res);
                              });
                          }
                          else {
                              cb(null)
                          }
                      });
                  }
                  else {
                      multiConnection[dbName].query(sql2,[2,id1],function (err,result1) {
                          if(err)
                          {
                              multiConnection[dbName].rollback(function () {
                                  console.log('errr4----', err);
                                  sendResponse.somethingWentWrongError(res);
                              });
                          }
                          else {
                              cb(null);
                          }
                      });
                  }
              }
          })
    }],
    updateAccountPayable:['status',function (cb) {
        var sql3="update account_payable set amount_paid = amount_paid + ?,amount_left=amount_left - ? where id = ? AND status!=1";
            multiConnection[dbName].query(sql3,[amount,amount,id],function (err,result2) {
                if(err){
                    multiConnection[dbName].rollback(function () {
                        console.log('errr5----', err);
                        sendResponse.somethingWentWrongError(res);
                    });
                }
                 else {
                    cb(null);
                }
            })
    }],
      updateAccountPayablStatus:['updateAccountPayable',function(cb){
          var sql4='select supplier_id,total_amount,amount_paid from account_payable where id=?';
          var sql5='update account_payable set status = ? where id = ?';
          multiConnection[dbName].query(sql4,[id],function (err,result) {
              if(err)
              {
                  multiConnection[dbName].rollback(function () {
                      console.log('errr6----', err);
                      sendResponse.somethingWentWrongError(res);
                  });
              }
              else {
                  supplier=result[0].supplier_id;
                  if(result[0].total_amount == result[0].amount_paid)
                  {
                      multiConnection[dbName].query(sql5,[1,id],function (err,result1) {
                          if(err)
                          {
                              multiConnection[dbName].rollback(function () {
                                  console.log('errr1----', err);
                                  sendResponse.somethingWentWrongError(res);
                              });
                          }
                          else {
                              cb(null)
                          }
                      });
                  }
                  else {
                      multiConnection[dbName].query(sql5,[2,id],function (err,result1) {
                          if(err)
                          {
                              multiConnection[dbName].rollback(function () {
                                  console.log('errr7----', err);
                                  sendResponse.somethingWentWrongError(res);
                              });
                          }
                          else {
                              cb(null);
                          }
                      });
                  }
              }
          })
      }],
      updateStatement:['updateAccountPayablStatus',function (cb) {
        var sql9='insert into account_statement(transaction_id,supplier_id,order_id,transaction_date,payment_method,debit)values(?,?,?,?,?,?)';
            multiConnection[dbName].query(sql9,[payId,supplier,id1,date1,method,amount],function (err,result) {
                if(err)
                {
                    multiConnection[dbName].rollback(function () {
                        console.log('err143-----',err);
                        sendResponse.somethingWentWrongError(res);
                    });
                }
                else {
                    cb(null);
                }
            })
      }]
  }, function(err,result){
      if(err) {
          multiConnection[dbName].rollback(function () {
              console.log('err12-----',err);
              sendResponse.somethingWentWrongError(res);
          });
      }else{
          connection.commit(function (err) {
              if(err)
              {
                  multiConnection[dbName].rollback(function () {
                      console.log('err12-----',err);
                      sendResponse.somethingWentWrongError(res);
                  });
              }
              else{
                  console.log('Transaction Complete----');
                  callback(null);
              }
          });
      }
  })*/

}   

exports.accountReceivableListing = function(db_name,res,supplier,startDate,endDate,status,search,limit,offset,is_download,country_code,country_code_type,callback) {
    let supplierquery = "%"+supplier+"%"
    if(supplier){
        supplierquery = ""+supplier+""
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

    var sum=0;
    var data1={};
    var orders=[];
    var totalAdmin=0;
    var totalSupplier=0;
    var sql
    /*  var id=0;*/
console.log("....ss",supplier,startDate,endDate,status)
    async.auto({
        ordersPart:async function (cb) {
            try{
            sql="select o.waiting_charges,aro.status,o.self_pickup,aro.commission,aro.order_id,s.id,s.vat_value,o.supplier_vat_value,o.user_service_charge,IFNULL(odp.discountAmount,0) as discountAmount,s.name,u.firstname,o.payment_source,o.promo_discount,o.card_payment_id as payment_id,cr.id as cart_id,op.quantity,op.product_id, o.transaction_id as payment_reference_number, o.delivered_on,o.handling_admin,o.handling_supplier,o.delivery_charges,o.urgent_price,if(discountAmount!='NULL', o.net_amount- discountAmount,o.net_amount) as net_amount,o.net_amount as total_order_price,aro.total_amount from account_receivable ar join account_receivable_order aro " +
            "on aro.account_receivable_id=ar.id join orders o on o.id=aro.order_id  join order_prices op on op.order_id = o.id left join order_promo odp on odp.orderId = o.id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
            " supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id left join cart cr on cr.id=o.cart_id " +
            "where s.id LIKE '"+supplierquery+"' AND  DATE( o.delivered_on ) >= '"+startDate+"' " +
            "AND DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%' AND (u.firstname LIKE '%"+search+"%' OR aro.order_id LIKE '%"+search+"%') "+country_code_query+" group by aro.order_id order by aro.order_id desc LIMIT "+offset+","+limit+"";
//like %% ,like this wil result id 74 and 174  also use only like instead
let sql2="select `key`,`value` from tbl_setting where `key` =? "
                var textEnableKey = await ExecuteQ.Query(db_name,sql2,["is_tax_added"]);
                
            if(parseInt(is_download)){
                // let sql1 = sql.split('LIMIT')[0];
                let receivable = await ExecuteQ.Query(db_name,sql,[]);
                // for (const [key, value] of receivable.entries()) {

                //     value.Product_cost = await totalOrderPrice(db_name,value.order_id)

                // }

                let header = [ 
                    {id: 'ORDER NO', title: 'ORDER NO'},
                    {id: 'RESTAURANT ID', title: 'RESTAURANT ID'},   
                    {id: 'RESTAURANT NAME', title: 'RESTAURANT NAME'}, 
                    {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME '},
                    {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'},
                    {id: 'TAX', title: 'TAX'},
                    {id: 'COMMISSION', title: 'COMMISSION'},
                    {id: 'ORDER SUB-TOTAL', title: 'ORDER SUB-TOTAL'},
                    {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                    {id: 'ORDERS AMOUNT', title: 'ORDERS AMOUNT'},
                    {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                    {id: 'PAYMENT STATUS', title: 'PAYMENT STATUS'}
                  ]
                  let data=[]
                //   let data = receivable.map(async (element)=>{
                    for(const [index,element] of receivable.entries()){
                        console.log("=====key.cart_id==>>",element.cart_id)
                        let Product_cost =await totalOrderPrice(db_name,element.order_id)
                        let adds_on=await getOrderAddsOn(db_name,element.cart_id,element.product_id);
                        if(adds_on && adds_on.length>0){
                            let addonprice = await addonTotalPrice(adds_on,element.quantity)
                            Product_cost = Product_cost + addonprice;
                        }
                     element["Product_cost"]=Product_cost;
                      let temp = {}
                      temp["ORDER NO"] = element.order_id
                      temp["RESTAURANT ID"] = element.id
                      temp["RESTAURANT NAME"] = element.name 
                      temp["CUSTOMER NAME"] = element.firstname
                      temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                      temp.TAX = element.handling_admin
                      temp.COMMISSION = element.commission
                      temp["ORDER SUB-TOTAL"] = element.Product_cost
                      temp["DELIVERY CHARGES"] = element.delivery_charges
                     
                        temp["ORDERS AMOUNT"] = element.net_amount
                        if(textEnableKey.length>0 && textEnableKey[0].value==0){
                            temp["BALANCE AMOUNT"] = element.total_amount + element.user_service_charge
                        }
                        else{
                            temp["BALANCE AMOUNT"] = element.total_amount
                        }
                    //   temp["BALANCE AMOUNT"] = element.total_amount
                      temp["PAYMENT STATUS"] = element.status==1?"Received":"Pending" //0-unpaid,1-fully_paid,
                      data.push(temp)
                    }
        
                  let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                  logger.debug("+==========csvLingk=========",csvLink)
                  data1.csvFileLink = csvLink
                  cb(null)
            }
            else{
                let receivable=await ExecuteQ.Query(db_name,sql,[]);
                    for (const [key, value] of receivable.entries()) {
                        console.log("=====key.cart_id==>>",value.cart_id)
                        let Product_cost =await totalOrderPrice(db_name,value.order_id)
                        let adds_on=await getOrderAddsOn(db_name,value.cart_id,value.product_id);
                        if(adds_on && adds_on.length>0){
                            let addonprice = await addonTotalPrice(adds_on,key.quantity)
                            Product_cost = Product_cost + addonprice
                        }
                        value.Product_cost=Product_cost;
                    }

                
               
                        if(receivable.length){
                            if(textEnableKey.length>0 && textEnableKey[0].value==0){
                                let changReceivable=[]
                            for(let i=0;i<receivable.length;i++){
                                receivable[i].total_amount=receivable[i].total_amount+receivable[i].user_service_charge
                                changReceivable.push(receivable[i])
                            }
                            data1.orders=changReceivable
                        }
                        else{
                            data1.orders=receivable
                        }

                            // data1.orders=receivable
                            
                        }
                        else {
                            data1.orders=[]
                        }
                            cb(null)
                //     }
                // })
            }
        }
        catch(Err){
            console.log("===Err!==",Err);
            sendResponse.somethingWentWrongError(res);
        }
        },
        orderPart1:async function(cb){
            try{
            let sql3 = sql.split('LIMIT')[0];
            let receivable=await ExecuteQ.Query(db_name,sql3,[]);
            
                    if(receivable.length){
                        data1.count=receivable.length
                        
                    }
                    else {
                        data1.count=0
                    }
                        cb(null)
            
                }
                catch(Err){
                    logger.debug("====Err!==",Err)
                    sendResponse.somethingWentWrongError(res);
                }
        },
        ordersPart2:async function (cb) {
            try{
            var sql="select sum(aro.commission) as total_commission,sum(o.handling_admin) as total_handling_admin,sum(o.handling_supplier) as total_handling_supplier," +
                "sum(o.delivery_charges) as total_delivery_charges,sum(o.urgent_price) as total_urgent_charges,sum(o.net_amount) as total_net_amount," +
                "aro.total_amount as total_receivable_amount from account_receivable ar join account_receivable_order aro " +
                "on aro.account_receivable_id=ar.id join orders o on o.id=aro.order_id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                "supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id " +
                "where s.id LIKE '%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' AND " +
                "DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%'  "+country_code_query+" group by aro.order_id";
                let result=await ExecuteQ.Query(db_name,sql,[]);
                // let stmt = multiConnection[db_name].query(sql, function (err, result) {
                //     logger.debug("========ordersPart2===========sql======",stmt.sql)
                // if (err) {
                //     console.log('error------', err);
                //     sendResponse.somethingWentWrongError(res);

                // }
                // else {
                    
                        let totalJson={
                            "total_commission":0,
                            "total_handling_admin":0,
                            "total_handling_supplier":0,
                            "total_delivery_charges":0,
                            "total_urgent_charges":0,
                            "total_net_amount":0,
                            "total_receivable_amount":0
                        }
                        if(result.length>0){
                            
                            for(const [index,i] of result.entries()){
                                totalJson.total_commission=i.total_commission!=null?parseFloat(totalJson.total_commission)+parseFloat(i.total_commission):parseFloat(totalJson.total_commission)+0
                                totalJson.total_handling_admin=i.total_handling_admin!=null?parseFloat(totalJson.total_handling_admin)+parseFloat(i.total_handling_admin):parseFloat(totalJson.total_handling_admin)+0
                                totalJson.total_handling_supplier=i.total_handling_supplier!=null?parseFloat(totalJson.total_handling_supplier)+parseFloat(i.total_handling_supplier):parseFloat(totalJson.total_handling_supplier)+0
                                totalJson.total_delivery_charges=i.total_delivery_charges!=null?parseFloat(totalJson.total_delivery_charges)+parseFloat(i.total_delivery_charges):parseFloat(totalJson.total_delivery_charges)+0
                                totalJson.total_urgent_charges=i.total_urgent_charges!=null?parseFloat(totalJson.total_urgent_charges)+parseFloat(i.total_urgent_charges):parseFloat(totalJson.total_urgent_charges)+0
                                totalJson.total_net_amount=i.total_net_amount!=null?parseFloat(totalJson.total_net_amount)+parseFloat(i.total_net_amount):parseFloat(totalJson.total_net_amount)+0

                                totalJson.total_receivable_amount=i.total_receivable_amount!=null?parseFloat(totalJson.total_receivable_amount)+parseFloat(i.total_receivable_amount):parseFloat(totalJson.total_receivable_amount)+0

                                if(index==(result.length-1)){
                                    data1.totals=[totalJson]
                                    cb(null)
                                }
                            }
                    }
                    
                    else {
                        data1.totals={}
                        cb(null)
                    }
                   
            //     }
            // })
                }
                catch(Err){
                    logger.debug("=Err=ordersPart2==",Err)
                    sendResponse.somethingWentWrongError(res);
                }
        },
        subscriptionsPart1:async function (cb) {
            try{
            var sql="select ars.id as transaction_id,ars.supplier_id,s.id,s.name,ars.service_type,ars.amount,ars.created_date,ars.transaction_status,ars.transaction_date,ars.starting_date,ars.ending_date,ars.ads_type " +
                "from account_receivable_subscriptions ars join supplier s on ars.supplier_id=s.id "+
                "where s.id LIKE'%"+supplier+"%' AND  DATE(ars.starting_date) >= '"+moment(startDate).format('YYYY-MM-DD')+"' AND " +
                "DATE( ars.ending_date ) <=  '"+moment(endDate).format('YYYY-MM-DD')+"'  "+country_code_query+" AND ars.transaction_status LIKE '%"+status+"%'";
                let sub=await ExecuteQ.Query(db_name,sql,[]);
                // let stmt = multiConnection[db_name].query(sql,function (err,sub) {
                //     logger.debug("========subscriptionsPart1===========sql======",stmt.sql)
                // if(err)
                // {
                //     console.log('err185-----',err);
                //     sendResponse.somethingWentWrongError(res);
                // }
                if(sub.length>0){
                    data1.subscriptions=sub;
                    cb(null)
                }
                else {
                    data1.subscriptions={};
                    cb(null);
                }
            // })
        }
        catch(Err){
            logger.debug("===subscriptionsPart1===Err!==",Err)
            sendResponse.somethingWentWrongError(res);

        }
        },
        subscriptionsPart2:async function (cb) {
            try{
            var sql="select sum(ars.amount) as subTotal from account_receivable_subscriptions ars join supplier s on ars.supplier_id=s.id "+
                "where s.id LIKE'%"+supplier+"%' AND  DATE( ars.starting_date ) >= '"+startDate+"' AND " +
                "DATE(ars.ending_date ) <=  '"+endDate+"'  "+country_code_query+" AND ars.transaction_status LIKE '%"+status+"%'";
                let reply=await ExecuteQ.Query(db_name,sql,[]);
            //   let stmt = multiConnection[db_name].query(sql,function (err,reply) {
            //         logger.debug("========subscriptionsPart2===========sql======",stmt.sql)
            //     if(err)
            //     {
            //         console.log('err185-----',err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
                 if(reply.length>0){
                   /* if(sub[0].subTotal == null){
                        data1.subsTotal={
                            "subTotal":0
                        };
                    }*/
                        data1.subsTotal=reply;
                    cb(null)
                }
                else {
                    data1.subsTotal={
                        "subTotal":0
                    };
                    cb(null);
                }
            }
            catch(Err){
                logger.debug("===Err=subscriptionsPart2=",Err)
                sendResponse.somethingWentWrongError(res);
            }
            // })
        }
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data1);
        }
    });

   /* async.auto({
        orders: function (cb) {
            var sql = "select ar.id,aro.order_id,aro.order_transaction_id,o.handling_admin,o.handling_supplier,o.delivery_charges,(o.net_amount-(o.handling_supplier+o.handling_admin+o.delivery_charges)) as cost_price," +
                "(o.net_amount-aro.total_amount) AS Supplier_Total,aro.total_amount AS Admin_Total,aro.total_left,aro.status,aro.total_paid AS Transfered,aro.transaction_mode,aro.payment_date,aro.payment_transaction_id from account_receivable ar join account_receivable_order aro " +
                "on aro.account_receivable_id=ar.id join orders o on o.id=aro.order_id ";
            multiConnection[dbName].query(sql, function (err, receivable) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if (receivable.length) {
                    console.log('result-----', receivable);
                    var sql1 = 'select aro.order_id,o.net_amount,p.commission_type,p.commission from account_receivable_order aro ' +
                        'join orders o on o.id=aro.order_id join order_prices op on o.id=op.order_id join product p on op.product_id=p.id';
                    multiConnection[dbName].query(sql1, function (err, comm) {
                        if (err) {
                            console.log('error------', err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                         //   console.log('com---', comm);
                            for (var j = 0; j < receivable.length; j++) {
                                (function (j) {
                                    sum = 0;
                                    for (var i = 0; i < comm.length; i++) {
                                        (function (i) {
                                            //console.log('order----', comm[i].order_id, receivable[j].order_id);
                                            if (comm[i].order_id == receivable[j].order_id) {
                                               // console.log('commtype---', comm[i].commission_type)
                                                if (comm[i].commission_type == 0) {
                                                 //   console.log('comm1---', comm[i].commission)
                                                    sum = sum + comm[i].commission;
                                                  //  console.log('sum', sum);
                                                }
                                                else {
                                                 //   console.log('comm2---', comm[i].commission)
                                                    sum = sum + ((comm[i].commission * comm[i].net_amount) / 100);
                                                  //  console.log('sum', sum);
                                                }
                                            }
                                            if (i == comm.length - 1) {
                                                receivable[j].commission = sum;
                                                receivable[j].cost_price = receivable[j].cost_price - sum;
                                                receivable[j].Supplier_Total = receivable[j].Supplier_Total + receivable[j].cost_price;
                                            }
                                        }(i));
                                    }
                                    if (j == receivable.length - 1) {
                                        data1.orders = receivable;
                                        cb(null);
                                    }
                                }(j));
                            }
                        }
                    });

                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                }
            })
        },
        subscriptions:function (cb) {
                var sql='select ars.transaction_id,ars.supplier_id,s.name,ars.service_type,ars.amount,ars.created_date,ars.transaction_status,ars.transaction_date,ars.starting_date,ars.ending_date,ars.ads_type ' +
                'from account_receivable_subscriptions ars join supplier s on ars.supplier_id=s.id';
            multiConnection[dbName].query(sql,function (err,sub) {
                if(err)
                {
                    console.log('err185-----',err);
                    sendResponse.somethingWentWrongError(res);
                }
                else if(sub.length>0){
                    data1.subscriptions=sub;
                    cb(null)
                }
                else {
                    data1.subscriptions={};
                    cb(null);
                }
            })
        }
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data1);
        }
    });*/
    }



exports.accountReceivableListingV1 = function(db_name,res,supplier,startDate,endDate,status,search,limit,offset,is_download,country_code,country_code_type,callback) {

    var country_code_query = "";

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

    var sum=0;
    var data1={};
    var orders=[];
    var totalAdmin=0;
    var totalSupplier=0;
    var sql
    /*  var id=0;*/
console.log("....ss",supplier,startDate,endDate,status)
    async.auto({
        ordersPart:async function (cb) {

            sql="select aro.status,aro.commission,aro.order_id,s.id,s.name,u.firstname,o.payment_source,IFNULL(odp.discountAmount,0) as discountAmount,o.user_service_charge, o.card_payment_id as payment_id, o.transaction_id as payment_reference_number, o.delivered_on,o.handling_admin,o.handling_supplier,o.delivery_charges,o.urgent_price,if(discountAmount!='NULL', o.net_amount- discountAmount,o.net_amount) as net_amount,aro.total_amount from account_receivable ar join account_receivable_order aro " +
            "on aro.account_receivable_id=ar.id join orders o on o.id=aro.order_id left join order_promo odp on odp.orderId = o.id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
            " supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id " +
            "where s.id LIKE '%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' " +
            "AND DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%' AND (u.firstname LIKE '%"+search+"%' OR aro.order_id LIKE '%"+search+"%') "+country_code_query+" order by aro.order_id desc LIMIT "+offset+","+limit+"";

            if(parseInt(is_download)){
                let sql1 = sql.split('LIMIT')[0];
                let receivable = await ExecuteQ.Query(db_name,sql1,[]);
                let header = [ 
                    {id: 'ORDER NO', title: 'ORDER NO'},
                    {id: 'RESTAURANT ID', title: 'RESTAURANT ID'},   
                    {id: 'RESTAURANT NAME', title: 'RESTAURANT NAME'}, 
                    {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME '},
                    {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'},
                    {id: 'TAX', title: 'TAX'},
                    {id: 'COMMISSION', title: 'COMMISSION'},
                    {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                    {id: 'ORDERS AMOUNT', title: 'ORDERS AMOUNT'},
                    {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                    {id: 'PAYMENT STATUS', title: 'PAYMENT STATUS'}
                  ]
                  let data = receivable.map((element)=>{
                      
                      let temp = {}
                      temp["ORDER NO"] = element.order_id
                      temp["RESTAURANT ID"] = element.id
                      temp["RESTAURANT NAME"] = element.name 
                      temp["CUSTOMER NAME"] = element.firstname
                      temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                      temp.TAX = element.handling_admin
                      temp.COMMISSION = element.commission
                      temp["DELIVERY CHARGES"] = element.delivery_charges
                      temp["ORDER AMOUNT"] = element.net_amount
                      temp["BALANCE AMOUNT"] = element.total_amount
                      temp["PAYMENT STATUS"] = element.status==1?"Received":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                      return temp;
                  })
        
                  let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                  logger.debug("+==========csvLingk=========",csvLink)
                  data1.csvFileLink = csvLink
                  cb(null)
            }else{
                let stmt = multiConnection[db_name].query(sql, function (err, receivable) {
                    logger.debug("========orderpart===========sql======",stmt.sql)
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);
    
                    }
                    else {
                        if(receivable && receivable.length){
                        
                            data1.orders=receivable
                            
                        }
                        else {
                            data1.orders=[]
                        }
                            cb(null)
                    }
                })
            }
        },
        orderPart1:function(cb){
            let sql3 = sql.split('LIMIT')[0];
            let stmt = multiConnection[db_name].query(sql3, function (err, receivable) {
                logger.debug("========orderpart1===========sql3====>>>><<<<>>>",stmt.sql)
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    if(receivable.length){
                        data1.count=receivable.length
                        
                    }
                    else {
                        data1.count=0
                    }
                        cb(null)
                }
            })
        },
        ordersPart2:function (cb) {
            var sql="select sum(aro.commission) as total_commission,sum(o.handling_admin) as total_handling_admin,sum(o.handling_supplier) as total_handling_supplier," +
                "sum(o.delivery_charges) as total_delivery_charges,sum(o.urgent_price) as total_urgent_charges,sum(o.net_amount) as total_net_amount," +
                "sum(aro.total_amount) as total_receivable_amount from account_receivable ar join account_receivable_order aro " +
                "on aro.account_receivable_id=ar.id join orders o on o.id=aro.order_id join supplier_branch sb on sb.id =o.supplier_branch_id join " +
                "supplier s on s.id =sb.supplier_id join user u on u.id = o.user_id " +
                "where s.id LIKE '%"+supplier+"%' AND  DATE( o.delivered_on ) >= '"+startDate+"' AND " +
                "DATE( o.delivered_on ) <=  '"+endDate+"' AND aro.status LIKE '%"+status+"%'  "+country_code_query+"";
                let stmt = multiConnection[db_name].query(sql, function (err, result) {
                    logger.debug("========ordersPart2===========sql======",stmt.sql)
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    if(result.length){
                        data1.totals=result
                    }
                    else {
                        data1.totals={}
                    }
                    cb(null)
                }
            })
        },
        subscriptionsPart1:function (cb) {
            var sql="select ars.id as transaction_id,ars.supplier_id,s.id,s.name,ars.service_type,ars.amount,ars.created_date,ars.transaction_status,ars.transaction_date,ars.starting_date,ars.ending_date,ars.ads_type " +
                "from account_receivable_subscriptions ars join supplier s on ars.supplier_id=s.id "+
                "where s.id LIKE'%"+supplier+"%' AND  DATE(ars.starting_date) >= '"+moment(startDate).format('YYYY-MM-DD')+"' AND " +
                "DATE( ars.ending_date ) <=  '"+moment(endDate).format('YYYY-MM-DD')+"'  "+country_code_query+" AND ars.transaction_status LIKE '%"+status+"%'";
                let stmt = multiConnection[db_name].query(sql,function (err,sub) {
                    logger.debug("========subscriptionsPart1===========sql======",stmt.sql)
                if(err)
                {
                    console.log('err185-----',err);
                    sendResponse.somethingWentWrongError(res);
                }
                else if(sub.length>0){
                    data1.subscriptions=sub;
                    cb(null)
                }
                else {
                    data1.subscriptions={};
                    cb(null);
                }
            })
        },
        subscriptionsPart2:function (cb) {
            var sql="select sum(ars.amount) as subTotal from account_receivable_subscriptions ars join supplier s on ars.supplier_id=s.id "+
                "where s.id LIKE'%"+supplier+"%' AND  DATE( ars.starting_date ) >= '"+startDate+"' AND " +
                "DATE(ars.ending_date ) <=  '"+endDate+"'  "+country_code_query+" AND ars.transaction_status LIKE '%"+status+"%'";
              let stmt = multiConnection[db_name].query(sql,function (err,reply) {
                    logger.debug("========subscriptionsPart2===========sql======",stmt.sql)
                if(err)
                {
                    console.log('err185-----',err);
                    sendResponse.somethingWentWrongError(res);
                }
                else if(reply.length>0){
                        data1.subsTotal=reply;
                    cb(null)
                }
                else {
                    data1.subsTotal={
                        "subTotal":0
                    };
                    cb(null);
                }
            })
        }
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data1);
        }
    });
}



function accountReceivableDescription(dbName,res,id,callback){
    var data1 = {};
    var sum = 0;
    var sum1 = 0;
    var details=[];
    var supplier_id=0;
    async.auto({
            orderDetails1:function (cb) {
                var sql = "select op.price,op.quantity,p.id as product_id,p.category_id,op.product_name,(op.price-(op.handling_admin+op.handling_supplier))" +
                    "AS Amount,op.handling_admin,op.handling_supplier," +
                    "(op.price-(op.handling_admin+op.handling_supplier)) AS Supplier_Costprice,op.price AS user_paid " +
                    "from orders o join order_prices op on o.id=op.order_id join product p on p.id=op.product_id where o.id = ?";
                multiConnection[dbName].query(sql, [id], function (err, receivabledesc) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        data1.order_description = receivabledesc;
                        details=receivabledesc;
                        cb(null)
                    }
                })
            },
            orderDetails2:function (cb) {
                var sql1 = 'select o.id,sb.supplier_id,o.delivery_charges,o.net_amount ,aro.total_amount as adminTotal,(o.net_amount-aro.total_amount) as supplierTotal ' +
                    ' from orders o join account_receivable_order aro on aro.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id  where o.id= ?';
                multiConnection[dbName].query(sql1, [id], function (err, delivery) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        data1.delivery_charge = delivery[0].delivery_charges;
                        data1.Net_userpaid = delivery[0].net_amount;
                        data1.Admin_Total = delivery[0].adminTotal;
                        data1.supplier_Total = delivery[0].supplierTotal;
                        data1.orderId = delivery[0].id;
                        supplier_id=delivery[0].supplier_id;    
                        console.log('sss--', data1);
                        cb(null, data1);
                    }
                });

            },
            orderDetails3:['orderDetails1','orderDetails2',function (cb) {
                if(details.length){
                 for(var i=0;i<details.length;i++){
                     (function (i) {
                      var sql='select commission_type,commission from supplier_category where supplier_id =? and category_id = ? group by category_id'
                        multiConnection[dbName].query(sql,[supplier_id,details[i].category_id],function (err,result) {
                            if(err){
                                console.log('err14-----',err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                if(result[0].commission_type == 0) {
                                    details[i].commission_admin=result[0].commission;
                                    details[i].commission=result[0].commission;
                                    details[i].commission_type=result[0].commission_type;
                                    details[i].Supplier_Costprice=details[i].Supplier_Costprice - details[i].commission_admin;
                                    if(i==(details.length-1)){
                                        cb(null)
                                    }
                                }
                                else {
                                    details[i].commission_admin=(result[0].commission * (details[i].price*details[i].quantity)) / 100;
                                    details[i].commission=details[i].commission_admin;
                                    details[i].commission_type=result[0].commission_type;
                                    details[i].Supplier_Costprice=details[i].Supplier_Costprice - details[i].commission_admin;
                                    if(i==(details.length-1)){
                                        cb(null)
                                    }
                                }
                            }
                        })

                     }(i))
                 }
                }
                else {
                    cb(null)
                }
            }]

    },function (err,result) {
        if(err){
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null,data1);
        }
    })

           
          /*  var sql = "select o.id,p.id,op.product_name,(op.price-(op.handling_admin+op.handling_supplier)) AS Amount,op.handling_admin,p.commission_type,p.commission,op.handling_supplier,(op.price-(op.handling_admin+op.handling_supplier)) AS Supplier_Costprice,op.price AS user_paid " +
                "from orders o join order_prices op on o.id=op.order_id join product p on p.id=op.product_id where o.id = ?";
            multiConnection[dbName].query(sql, [id], function (err, receivabledesc) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                   // console.log('pay111-----', receivabledesc);
                   // console.log('id---', id);
                    for (var i = 0; i < receivabledesc.length; i++) {
                        (function (i) {
                            if (receivabledesc[i].commission_type == 0) {
                                receivabledesc[i].commission_admin = receivabledesc[i].commission;
                                receivabledesc[i].Supplier_Costprice = receivabledesc[i].Supplier_Costprice - receivabledesc[i].commission_admin;
                                sum = sum + receivabledesc[i].handling_admin + receivabledesc[i].commission_admin;
                                sum1 = sum1 + receivabledesc[i].handling_supplier + receivabledesc[i].Supplier_Costprice;
                            }
                            else {
                                receivabledesc[i].commission_admin = ((receivabledesc[i].commission / 100) * receivabledesc[i].Amount);
                                receivabledesc[i].Supplier_Costprice = receivabledesc[i].Supplier_Costprice - receivabledesc[i].commission_admin;
                                sum = sum + receivabledesc[i].handling_admin + receivabledesc[i].commission_admin;
                                sum1 = sum1 + receivabledesc[i].handling_supplier + receivabledesc[i].Supplier_Costprice;
                            }

                            if (i == receivabledesc.length - 1) {
                                data1.order_description = receivabledesc;
                            }
                        }(i))
                    }

                    var sql1 = 'select o.delivery_charges,o.net_amount ,aro.total_amount as adminTotal,(o.net_amount-aro.total_amount) as supplierTotal ' +
                        ' from orders o join account_receivable_order aro on aro.order_id=o.id  where o.id= ?';
                    multiConnection[dbName].query(sql1, [id], function (err, delivery) {
                        if (err) {
                            console.log('error------', err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            console.log('del==', delivery);
                            data1.delivery_charge = delivery[0].delivery_charges;
                            data1.Net_userpaid = delivery[0].net_amount;
                            data1.Admin_Total = delivery[0].adminTotal;
                            data1.supplier_Total = delivery[0].supplierTotal;
                            console.log('sss--', data1);
                            callback(null, data1);
                        }
                    });

                }
            })
        */
    }

//exports.getStatement=function(db_name,res,supplier,startDate,endDate,search,limit,offset,is_download,callback) {
exports.getStatement=function(db_name,res,supplier,startDate,endDate,search,limit,offset,is_download,country_code,country_code_type,callback) {
var data={};
var credit=0;
var debit=0;
var balance=0;
var totalBalance=0;
var sql1;
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
   async.auto({
        supplierdetails:async function (cb) {
            try{
                var sql='select name,address from supplier where id = ?';
                let result=await ExecuteQ.Query(db_name,sql,[supplier])
                    data.supplier=result;
                    cb(null);
            }
            catch(Err){
                logger.debug("===Er!=",Err)
                sendResponse.somethingWentWrongError(res);
            }
            // var sql='select name,address from supplier where id = ?';
            // let stmt = multiConnection[db_name].query(sql,[supplier],function (err,result) {
            //     logger.debug("=========sql stmt of supplierlist in getStatements========",stmt.sql)
            //     if(err)
            //     {
            //         console.log('err12-----',err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else{
            //         logger.debug("=======suppliers in result =========",result)
            //         data.supplier=result;
            //         cb(null);
            //     }
            // })
        },
       statementDetails:async function (cb) {
           try{
            sql1='SELECT o.waiting_charges,o.user_service_charge,o.supplier_vat_value,s.vat_value,o.delivery_charges, o.payment_source,o.self_pickup,o.card_payment_id as payment_id, o.transaction_id as payment_reference_number ,o.id as id,u.firstname,o.promo_discount,  cr.id as cart_id, op.quantity,op.product_id, o.delivered_on,o.net_amount,o.handling_admin,o.handling_supplier,o.urgent_price,' +
               'aro.commission,aro.total_amount,1 as accountType FROM account_statement acs join account_receivable_order aro on ' +
               'aro.order_id =acs.order_id join orders o on o.id = acs.order_id  join order_prices op on op.order_id = o.id join cart cr on cr.id = o.cart_id   join user u on u.id =o.user_id left join supplier s on acs.supplier_id=s.id ' +
               'where acs.supplier_id LIKE "%'+supplier+'%" '+country_code_query+' AND  DATE( acs.transaction_date ) >= "'+startDate+'" AND ' +
               'DATE(acs.transaction_date ) <=  "'+endDate+'" AND (o.id LIKE "%'+search+'%" OR u.firstname LIKE "%'+search+'%") group by aro.order_id '+
               ' UNION ALL ' +
               'SELECT o.waiting_charges,o.user_service_charge,o.supplier_vat_value,s.vat_value,o.delivery_charges,o.payment_source,o.self_pickup, o.card_payment_id as payment_id, o.transaction_id as payment_reference_number, o.id as id,u.firstname,o.promo_discount, cr.id as cart_id, op.quantity,op.product_id,   o.delivered_on,o.net_amount,o.handling_admin,o.handling_supplier,o.urgent_price,' +
               'aro.commission,aro.total_amount,0 as accountType FROM account_statement acs join account_payable_order aro on ' +
               'aro.order_id =acs.order_id join orders o on o.id = acs.order_id  join order_prices op on op.order_id = o.id join cart cr on cr.id = o.cart_id  join user u on u.id =o.user_id left join supplier s on acs.supplier_id=s.id ' +
               ' where acs.supplier_id LIKE "%'+supplier+'%" AND  DATE( acs.transaction_date ) >= "'+startDate+'" AND ' +
                   'DATE(acs.transaction_date ) <=  "'+endDate+'" AND (o.id LIKE "%'+search+'%" OR u.firstname LIKE "%'+search+'%")  group by aro.order_id,aro.order_id order by id desc LIMIT '+offset+','+limit+'';

                if(parseInt(is_download)){
                   // let sql2 = sql1.split('LIMIT')[0];
                 let result = await ExecuteQ.Query(db_name,sql1,[])
                 let header = [ 
                    {id: 'USER ID', title: 'USER ID'},
                    {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME'},   
                    {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'}, 
                    {id: 'TAX', title: 'TAX'},
                    {id: 'COMMISSION', title: 'COMMISSION'},
                    {id: 'ORDER SUB-TOTAL', title: 'ORDER SUB-TOTAL'},
                    {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                    {id: 'ORDER AMOUNT', title: 'ORDER AMOUNT'},
                    {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                    {id: 'TRANSACTION STATUS', title: 'TRANSACTION STATUS'}
                  ]

                  let body=[]
                  for(const [index,element] of result.entries()){
                    let temp = {}
                    let Product_cost =await totalOrderPrice(db_name,element.id)
                    let adds_on=await getOrderAddsOn(db_name,element.cart_id,element.product_id);
                    if(adds_on && adds_on.length>0){
                        let addonprice = await addonTotalPrice(adds_on,element.quantity)
                        Product_cost = Product_cost + addonprice;
                    }
                    element.Product_cost=Product_cost;

                      
                      temp["USER ID"] = element.id
                      temp["CUSTOMER NAME"] = element.firstname
                      temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                      temp.TAX = element.handling_admin
                      temp.COMMISSION = element.commission
                      temp["ORDER SUB-TOTAL"] = element.Product_cost

                      temp["DELIVERY CHARGES"] = element.delivery_charges
                      temp["ORDER AMOUNT"] = element.net_amount
                      temp["BALANCE AMOUNT"] = element.total_amount
                      temp["TRANSACTION STATUS"] = "Received" //0-unpaid,1-fully_paid,2-partially_paid
                      body.push(temp);
                  }
        
                  let csvLink = await uploadMgr.uploadCsvFileNew(body,header,"account_statement")
                  logger.debug("+==========csvLingk=========",csvLink)
                  data.csvFileLink = csvLink
                  cb(null);

                }else{
                    let result=await ExecuteQ.Query(db_name,sql1,[supplier]);

                    for (const [key, value] of result.entries()) {
                        console.log("=====key.cart_id==>>",value.cart_id)
                        let Product_cost = await totalOrderPrice(db_name,value.id);
                        let adds_on=await getOrderAddsOn(db_name,value.cart_id,value.product_id);
                        if(adds_on && adds_on.length>0){
                            let addonprice = await addonTotalPrice(adds_on,value.quantity)
                            Product_cost = Product_cost + addonprice;
                        }
                        value.Product_cost=Product_cost;
                    }

                    // let stmt = multiConnection[db_name].query(sql1,[supplier],function (err,result) {
                    //     logger.debug("===========statementDetails===query=>>",stmt.sql)
                    //     if(err)
                    //     {
                    //         console.log('err12-----',err);
                    //         sendResponse.somethingWentWrongError(res);
                    //     }
                    //     else{
                            data.statement=result;
                            cb(null);
                    //     }
                    // })
                }
            }
            catch(Err){
                sendResponse.somethingWentWrongError(res);
            }
       },
       statementDetailsCount:async function(cb){
           try{
                let sql2 = sql1.split('LIMIT')[0];
                let result=await ExecuteQ.Query(db_name,sql2,[supplier,supplier]);
                // let stmt = multiConnection[db_name].query(sql2,[supplier,supplier],function (err,result) {
                //     logger.debug("===========statementDetails----count---===query=>>>>>",stmt.sql)
                //     if(err)
                //     {
                //         console.log('err12-----',err);
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else{
                        data.count=result.length;
                        cb(null);
                //     }
                // })
           }
           catch(Err){
                logger.debug("===Err!==",Err)
                sendResponse.somethingWentWrongError(res);
           }
       },
       subscriptionDetails:async function (cb) {
           try{
            var sql='select ars.id,ars.ads_type,ars.service_type,ars.starting_date,ars.ending_date,ars.amount,acs.transaction_date ' +
            'from account_receivable_subscriptions ars join account_statement acs on acs.subscription_id = ars.id ' +
            ' where acs.supplier_id = ? AND  DATE( acs.transaction_date ) >= "'+moment(startDate).format('YYYY-MM-DD')+'" AND ' +
            'DATE(acs.transaction_date ) <=  "'+moment(endDate).format('YYYY-MM-DD')+'"';
            let result=await ExecuteQ.Query(db_name,sql,[supplier])
            // let stmt = multiConnection[db_name].query(sql,[supplier],function (err,result) {
            //  logger.debug("===========subscriptionDetails===query=>>",stmt.sql)
            // if(err)
            // {
            //     console.log('err12-----',err);
            //     sendResponse.somethingWentWrongError(res);
            // }
            // else{
                data.subscription=result;
                cb(null);
        //     }
        // })
           }
           catch(Err){
               logger.debug("=====Err!==",Err)
                sendResponse.somethingWentWrongError(res);
           }
         
       }
   },function (err,result) {
       if(err)
       {
           console.log('err12-----',err);
           sendResponse.somethingWentWrongError(res);
       }
       else{
           callback(null,data);
       }
   }); 
    
 /*var sql1="select sum(debit) as total_debit,sum(credit) as total_credit from account_statement";
    multiConnection[dbName].query(sql1,function (err,reply) {
        if(err){
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res); 
        }
        else{
            totalBalance=parseInt(reply[0].total_credit)-parseInt(reply[0].total_debit);
            var sql="select transaction_date,a.transaction_id,a.order_id,a.subscription_id,s.name,a.credit,a.debit from account_statement a join supplier s on s.id=a.supplier_id " +
                "where year(transaction_date)=? and month(transaction_date)=?";
            multiConnection[dbName].query(sql,[year,month],function (err,result) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(result.length){
                    for(var k=0;k<result.length;k++){
                        (function (k) {
                            data1.push(result[k]);
                            credit=credit + parseInt(result[k].credit);
                            debit=debit + parseInt(result[k].debit);
                            if(k == result.length-1)
                            {
                                balance=(credit-debit);
                                data.push({
                                    'year':year,
                                    'month':month,
                                    'data':data1,
                                    'total_debit':debit,
                                    'total_credit':credit,
                                    'total_month_balance':balance,
                                    'total_balance':totalBalance
                                });
                                callback(null,data);
                            }
                        }(k))

                    }
                   
                }
                else {
                    callback(null,result);

                }
            })
        }
    })*/
    
}

exports.getStatementV1=function(db_name,res,supplier,startDate,endDate,search,limit,offset,is_download,country_code,country_code_type,callback) {
    var data={};
    var credit=0;
    var debit=0;
    var balance=0;
    var totalBalance=0;
    var sql1;
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
       async.auto({
            supplierdetails:function (cb) {
                var sql='select name,address from supplier where id = ?';
                let stmt = multiConnection[db_name].query(sql,[supplier],function (err,result) {
                    logger.debug("=========sql stmt of supplierlist in getStatements========",stmt.sql)
                    if(err)
                    {
                        console.log('err12-----',err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{
                        logger.debug("=======suppliers in result =========",result)
                        data.supplier=result;
                        cb(null);
                    }
                })
            },
           statementDetails:async function (cb) {
                sql1='SELECT ous.subscription_id,ous.total_discount_amount,ous.benefit_types_list,ous.discount_amount_per_benefit, o.delivery_charges, o.payment_source, o.card_payment_id as payment_id, o.transaction_id as payment_reference_number ,o.id as id,u.firstname,o.delivered_on,o.net_amount,o.handling_admin,o.handling_supplier,o.urgent_price,' +
                   'aro.order_id,aro.commission,aro.total_amount,1 as accountType FROM account_statement acs join account_receivable_order aro on ' +
                   'aro.order_id =acs.order_id join orders o on o.id = acs.order_id join user u on u.id =o.user_id left join supplier s on acs.supplier_id=s.id ' +
                   'where acs.supplier_id LIKE "%'+supplier+'%" '+country_code_query+' AND  DATE( acs.transaction_date ) >= "'+startDate+'" AND ' +
                   'DATE(acs.transaction_date ) <=  "'+endDate+'" AND (o.id LIKE "%'+search+'%" OR u.firstname LIKE "%'+search+'%") '+
                   ' UNION ALL ' +
                   'SELECT ous.subscription_id,ous.total_discount_amount,ous.benefit_types_list,ous.discount_amount_per_benefit,o.delivery_charges,o.payment_source, o.card_payment_id as payment_id, o.transaction_id as payment_reference_number, o.id as id,u.firstname,o.delivered_on,o.net_amount,o.handling_admin,o.handling_supplier,o.urgent_price,' +
                   'aro.commission,aro.total_amount,0 as accountType FROM account_statement acs join account_payable_order aro on ' +
                   'aro.order_id =acs.order_id join orders o on o.id = acs.order_id join user u on u.id =o.user_id left join supplier s on acs.supplier_id=s.id ' +
                   ' where acs.supplier_id LIKE "%'+supplier+'%" AND  DATE( acs.transaction_date ) >= "'+startDate+'" AND ' +
                       'DATE(acs.transaction_date ) <=  "'+endDate+'" AND (o.id LIKE "%'+search+'%" OR u.firstname LIKE "%'+search+'%")  group by aro.order_id order by id  desc LIMIT '+offset+','+limit+'';
    


                    if(parseInt(is_download)){
                        let sql2 = sql1.split('LIMIT')[0];
                     let result = await ExecuteQ.Query(db_name,sql2,[])
                     let header = [ 
                        {id: 'USER ID', title: 'USER ID'},
                        {id: 'CUSTOMER NAME', title: 'CUSTOMER NAME'},   
                        {id: 'ORDER DELIVERY DATE', title: 'ORDER DELIVERY DATE'}, 
                        {id: 'TAX', title: 'TAX'},
                        {id: 'COMMISSION', title: 'COMMISSION'},
                        {id: 'DELIVERY CHARGES', title: 'DELIVERY CHARGES'},
                        {id: 'ORDER AMOUNT', title: 'ORDER AMOUNT'},
                        {id: 'BALANCE AMOUNT', title: 'BALANCE AMOUNT'},
                        {id: 'TRANSACTION STATUS', title: 'TRANSACTION STATUS'}
                      ]
                      let body = result.map((element)=>{
                          let temp = {}
                          temp["USER ID"] = element.id
                          temp["CUSTOMER NAME"] = element.firstname
                          temp["ORDER DELIVERY DATE"] = moment(element.delivered_on).format('MMMM Do YYYY, h:mm:ss a')
                          temp.TAX = element.handling_admin
                          temp.COMMISSION = element.commission
                          temp["DELIVERY CHARGES"] = element.delivery_charges
                          temp["ORDER AMOUNT"] = element.net_amount
                          temp["BALANCE AMOUNT"] = element.total_amount
                          temp["TRANSACTION STATUS"] = "Received" //0-unpaid,1-fully_paid,2-partially_paid
                          return temp;
                      })
            
                      let csvLink = await uploadMgr.uploadCsvFileNew(body,header,"account_statement")
                      logger.debug("+==========csvLingk=========",csvLink)
                      data.csvFileLink = csvLink
                      cb(null);
    
                    }else{
                        let stmt = multiConnection[db_name].query(sql1,[supplier],function (err,result) {
                            logger.debug("===========statementDetails===query=>>",stmt.sql)
                            if(err)
                            {
                                console.log('err12-----',err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else{
                                data.statement=result;
                                cb(null);
                            }
                        })
                    }
           },
           statementDetailsCount:function(cb){
            let sql2 = sql1.split('LIMIT')[0];
            let stmt = multiConnection[db_name].query(sql2,[supplier,supplier],function (err,result) {
                logger.debug("===========statementDetails----count---===query=>>>>>",stmt.sql)
                if(err)
                {
                    console.log('err12-----',err);
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    data.count=result.length;
                    cb(null);
                }
            })
           },
           subscriptionDetails:function (cb) {
               var sql='select ars.id,ars.ads_type,ars.service_type,ars.starting_date,ars.ending_date,ars.amount,acs.transaction_date ' +
                   'from account_receivable_subscriptions ars join account_statement acs on acs.subscription_id = ars.id ' +
                   ' where acs.supplier_id = ? AND  DATE( acs.transaction_date ) >= "'+moment(startDate).format('YYYY-MM-DD')+'" AND ' +
                   'DATE(acs.transaction_date ) <=  "'+moment(endDate).format('YYYY-MM-DD')+'"';
                   let stmt = multiConnection[db_name].query(sql,[supplier],function (err,result) {
                    logger.debug("===========subscriptionDetails===query=>>",stmt.sql)
                   if(err)
                   {
                       console.log('err12-----',err);
                       sendResponse.somethingWentWrongError(res);
                   }
                   else{
                       data.subscription=result;
                       cb(null);
                   }
               })
           }
       },function (err,result) {
           if(err)
           {
               console.log('err12-----',err);
               sendResponse.somethingWentWrongError(res);
           }
           else{
               callback(null,data);
           }
       }); 
        
    }
    
exports.driverAccountPayablelist = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var search = req.body.search
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var agentId = req.body.agentId ? req.body.agentId : "";
    var supplier = req.body.supplier;
    var adminId;
    const is_download = req.body.is_download
    var data=[];
    //var supplier='',
    var startDate= '1990-01-01',
        endDate='2100-01-01',
        status='';
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                // if(req.body.supplier){
                //     supplier= req.body.supplier
                // }
                if(req.body.startDate){
                    startDate= moment(req.body.startDate).format('YYYY-MM-DD');
                }
                if(req.body.endDate){
                    endDate= moment(req.body.endDate).format('YYYY-MM-DD');
                }
                if(req.body.status){
                    status= req.body.status
                }

                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',function(cb){
            adminAccounts.driverAccountPayableListing(req.dbName,res,agentId,supplier,startDate,endDate,status,search,limit,offset,is_download,country_code,country_code_type,function (err,result) {
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




exports.driverAccountPayablelistV1 = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var search = req.body.search
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var agentId = req.body.agentId ? req.body.agentId : "";
    var supplier = req.body.supplier;
    let supplierBranchId=req.body.supplierBranchId || 0;
    var adminId;
    const is_download = req.body.is_download
    var data=[];
    //var supplier='',
    var startDate= '1990-01-01',
        endDate='2100-01-01',
        status='';
    async.auto({
        blankField:function(cb) {
            if(req.body && req.body.accessToken && req.body.authSectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                // if(req.body.supplier){
                //     supplier= req.body.supplier
                // }
                if(req.body.startDate){
                    startDate= moment(req.body.startDate).format('YYYY-MM-DD');
                }
                if(req.body.endDate){
                    endDate= moment(req.body.endDate).format('YYYY-MM-DD');
                }
                if(req.body.status){
                    status= req.body.status
                }

                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        payableListing:['checkauthority',function(cb){
            
            adminAccounts.driverAccountPayableListingV1(req.dbName,res,agentId,supplier,startDate,endDate,status,search,limit,offset,is_download,country_code,country_code_type,supplierBranchId,function (err,result) {
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


exports.driverAccountPayableListing = async function(db_name,res,agentId,supplier,startDate,endDate,status,search,limit,offset,is_download,country_code,country_code_type,callback) {
var sum=0;
var id=0;
var status_check = "";
if(status && status == "1"){
    //status_check = "AND capo.status LIKE '%"+status+"%'";
    status_check = "AND cuo.order_id IN (SELECT order_id from cbl_account_payable_order)";
}else if(status && status == "0"){
    status_check = "AND cuo.order_id NOT IN (SELECT order_id from cbl_account_payable_order)";
}

    var country_code_query = ""
    if(country_code!='' && country_code_type!=''){
        if(country_code_type=='1'){
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (cu.country_code LIKE '"+cc_array[i]+"' or cu.country_code LIKE '+"+cc_array[i]+"') "
            }
        }else{
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (cu.country_code NOT LIKE '"+cc_array[i]+"' and cu.country_code NOT LIKE '+"+cc_array[i]+"') "
            }
        }
    }
    var data1={};
    var sql;
    let getAgentDbData=await common.GetAgentDbInformation(db_name);        
    let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
    async.auto({
        ordersPart:async function (cb) {
            let mUnit=await Universal.getMeausringUnit(db_name);
             sql="SELECT round(("+mUnit+" * acos( cos( radians( supplierinfo.latitude) ) * cos( radians( user_address.latitude ) ) * cos( radians( user_address.longitude ) - radians(supplierinfo.longitude) ) + sin( radians(supplierinfo.latitude) ) * sin( radians( user_address.latitude ) ) ) )) as distance, user_orders.payment_source, user_orders.card_payment_id as payment_id, user_orders.transaction_id as payment_reference_number, IF( capo.status ='2', 'Partially Paid', IF( capo.status = '1', 'Paid', 'Not Paid' ) ) payment_status,capo.transaction_mode , cuo.`order_id`, cuo.customer_name, cuo.customer_phone_number, cuo.customer_email, cuo.customer_id, cuo.`commission_ammount`,cuo.agent_base_price,cuo.agent_delivery_charge_share, cuo.`user_id`, cuo.supplier_id, cuo.supplier_name, cu.name, cu.email, cu.phone_number,cu.id as agent_id,cu.country,cu.city,cu.state, IF( cu.agent_commission_type=0, 'Percentage', 'Flat' ) agent_commission_type, cuo.`net_amount`, cuo.`delivery_charges`, cuo.`waiting_charges`, cuo.`tip_agent`, cuo.`status`, cuo.delivered_on delivery_date, cuo.`card_payment_id`, cuo.`payment_type`,IF( TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on) > 0, TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on), '0' ) as duration, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as total_amount FROM `cbl_user_orders` cuo join cbl_user cu on cuo.user_id=cu.id left join cbl_account_payable_order capo on cuo.order_id=capo.order_id join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id left join "+db_name+".user_address user_address on user_orders.user_delivery_address=user_address.id left join "+db_name+".supplier supplierinfo on cuo.supplier_id=supplierinfo.id WHERE cu.supplier_id='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' "+status_check+" AND (cuo.customer_name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%' "+country_code_query+" order by cuo.order_id + 0 desc LIMIT "+offset+","+limit;


                if(parseInt(is_download)){
                    let sql1 = sql.split('LIMIT')[0];
                    //let receivable = await ExecuteQ.Query(db_name,sql1,[]);
                    let receivable=await ExecuteQ.QueryAgent(agentConnection,sql1,[]);
                    let header = [ 
                        {id: 'ORDER_NO', title: 'ORDER_NO'},
                        {id: 'DISTANCE', title: 'DISTANCE'},
                        {id: 'COMMISSION_AMOUNT', title: 'COMMISSION_AMOUNT'},
                        {id: 'AGENT_ID', title: 'AGENT_ID'},
                        {id: 'AGENT_NAME', title: 'AGENT_NAME'},
                        {id: 'AGENT_EMAIL', title: 'AGENT_EMAIL'},
                        {id: 'AGENT_PHONE_NUMBER', title: 'AGENT_PHONE_NUMBER'},
                        {id: 'AGENT_CITY', title: 'AGENT_CITY'},
                        {id: 'AGENT_STATE', title: 'AGENT_STATE'},
                        {id: 'AGENT_COUNTRY', title: 'AGENT_COUNTRY'},
                        {id: 'AGENT_COMMISSION_TYPE', title: 'AGENT_COMMISSION_TYPE'},
                        {id: 'NET_AMOUNT', title: 'NET_AMOUNT'},
                        {id: 'TOTAL_AMOUNT', title: 'TOTAL_AMOUNT'},
                        {id: 'DELIVERY_CHARGES', title: 'DELIVERY_CHARGES'},
                        {id: 'WAITING_CHARGES', title: 'WAITING_CHARGES'},
                        {id: 'TIP_AGENT', title: 'TIP_AGENT'},
                        {id: 'STATUS', title: 'STATUS'},
                        {id: 'DURATION', title: 'DURATION'},
                        {id: 'PAYMENT_TYPE', title: 'PAYMENT_TYPE'},
                        {id: 'ORDER_DELIVERY_DATE', title: 'ORDER_DELIVERY_DATE'}
                      ]
                      let data = receivable.map((element)=>{
                          let temp = {}
                          temp["ORDER_NO"] = element.order_id
                          temp["DISTANCE"] = element.distance
                          temp["COMMISSION_AMOUNT"] = element.commission_ammount
                          temp["AGENT_ID"] = element.agent_id
                          temp["AGENT_NAME"] = element.name
                          temp["AGENT_EMAIL"] = element.email
                          temp["AGENT_PHONE_NUMBER"] = element.phone_number
                          temp["AGENT_CITY"] = element.city
                          temp["AGENT_STATE"] = element.state
                          temp["AGENT_COUNTRY"] = element.country
                          temp["AGENT_COMMISSION_TYPE"] = element.agent_commission_type
                          temp["NET_AMOUNT"] = element.net_amount
                          temp["TOTAL_AMOUNT"] = element.total_amount
                          temp["DELIVERY_CHARGES"] = element.delivery_charges
                          temp["WAITING_CHARGES"] = element.waiting_charges
                          temp["TIP_AGENT"] = element.tip_agent
                          temp["DURATION"] = element.duration
                          temp["PAYMENT_TYPE"] = element.payment_type
                          temp["ORDER_DELIVERY_DATE"] = moment(element.delivery_date).format('MMMM Do YYYY, h:mm:ss a')
                          temp["STATUS"] = element.status==5?"delivered":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                          //0 :pending,1:confirm,2:reject, 3: shipped, 4:nearby,5:delivered,6:rating_by_user,7:tracked,8:customer_cancel,9:schedule,10 reached 11=In-progress
                          return temp;
                      })
            
                      let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                      logger.debug("+==========csvLingk=========",csvLink)
                      data1.csvFileLink = csvLink
                      cb(null)
                }else{

                    let payable=await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                    if(payable.length){
                        data1.data=payable
                    }
                    else {
                        data1.data=[]
                    }
                    cb(null)
                }
        },
        orderPart1:async function(cb){
            let sql3 = sql.split('LIMIT')[0];
            let payable = await ExecuteQ.QueryAgent(agentConnection,sql3,[]);
            if(payable.length){
                data1.count=payable.length                
            }
            else {
                data1.count=0
            }
            cb(null)
        },
        ordersPart2:async function (cb) {
            var sql="SELECT sum(cuo.`commission_ammount`) as total_commission_ammount, sum(cuo.`net_amount`) as total_net_amount, sum(cuo.`delivery_charges`) as total_delivery_charges, sum(cuo.`waiting_charges`) as total_waiting_charges, sum(cuo.`tip_agent`) as total_tip_agent, IF( ((sum(cuo.`commission_ammount`) + sum(cuo.`tip_agent`) + sum(cuo.`agent_base_price`) + sum(cuo.`agent_delivery_charge_share`)) - (sum(capo.`commission_ammount`) + sum(capo.`tip_agent`) + sum(capo.`agent_base_price`) + sum(capo.`agent_delivery_charge_share`)))  > 0, ((sum(cuo.`commission_ammount`) + sum(cuo.`tip_agent`) + sum(cuo.`agent_base_price`) + sum(cuo.`agent_delivery_charge_share`)) - (sum(capo.`commission_ammount`) + sum(capo.`tip_agent`) + sum(capo.`agent_base_price`) + sum(capo.`agent_delivery_charge_share`))), 0) as total_amount FROM `cbl_user_orders` cuo join cbl_user cu on cuo.user_id=cu.id left join cbl_account_payable_order capo on cuo.order_id=capo.order_id WHERE cu.supplier_id='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' "+status_check+" AND (cuo.customer_name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%' "+country_code_query+"";

            let result = await ExecuteQ.QueryAgent(agentConnection,sql,[]);
            if(result.length){
                if(result[0].total_amount==null){
                    data1.totals={
                        "total_commission_ammount":0,
                        "total_net_amount":0,
                        "total_delivery_charges":0,
                        "total_waiting_charges":0,
                        "total_tip_agent":0,
                        "total_amount":0, // make it payable
                    }
                }
                else {
                    data1.totals=result
                }
                
            }
            else {
                data1.totals={
                    "total_commission_ammount":0,
                    "total_net_amount":0,
                    "total_delivery_charges":0,
                    "total_waiting_charges":0,
                    "total_tip_agent":0,
                    "total_amount":0,
                }
            }
            cb(null)
        },
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,data1);
        }
    });
}


exports.driverAccountPayableListingV1 = async function(db_name,res,agentId,supplier,startDate,endDate,status,search,limit,offset,is_download,country_code,country_code_type,supplierBranchId,callback) {
    var sum=0;
    var id=0;
    var status_check = "";
    let branch_sql=supplierBranchId!=0?" AND user_orders.supplier_branch_id="+supplierBranchId+"":""
    if(status && status == "1"){
        //status_check = "AND capo.status LIKE '%"+status+"%'";
        status_check = "AND cuo.order_id IN (SELECT order_id from cbl_account_payable_order)";
    }else if(status && status == "0"){
        status_check = "AND cuo.order_id NOT IN (SELECT order_id from cbl_account_payable_order)";
    }
    
        var country_code_query = ""
        if(country_code!='' && country_code_type!=''){
            if(country_code_type=='1'){
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cu.country_code LIKE '"+cc_array[i]+"' or cu.country_code LIKE '+"+cc_array[i]+"') "
                }
            }else{
                var cc_array = country_code.split(",");
                for (var i = 0; i < cc_array.length; i++) {
                    country_code_query += " AND (cu.country_code NOT LIKE '"+cc_array[i]+"' and cu.country_code NOT LIKE '+"+cc_array[i]+"') "
                }
            }
        }
        var data1={};
        let mUnit=await Universal.getMeausringUnit(db_name);
        var sql;
        let getAgentDbData=await common.GetAgentDbInformation(db_name);        
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);  
      
        async.auto({
            ordersPart:async function (cb) {
                let supplier_check = " cu.supplier_id='"+supplier+"' AND "

                if(supplier==""){
                    supplier_check = ""
                }
                 sql="SELECT (SELECT request_status from  "+db_name+".agent_supplier_payouts where order_id=user_orders.id limit 1) as withdraw_request_status,round(("+mUnit+" * acos( cos( radians( supplierinfo.latitude) ) * cos( radians( user_address.latitude ) ) * cos( radians( user_address.longitude ) - radians(supplierinfo.longitude) ) + sin( radians(supplierinfo.latitude) ) * sin( radians( user_address.latitude ) ) ) )) as distance, user_orders.payment_source, user_orders.card_payment_id as payment_id, user_orders.transaction_id as payment_reference_number, IF( capo.status ='2', 'Partially Paid', IF( capo.status = '1', 'Paid', 'Not Paid' ) ) payment_status,capo.transaction_mode , cuo.`order_id`, cuo.customer_name, cuo.customer_phone_number, cuo.customer_email, cuo.customer_id, cuo.`commission_ammount`,cuo.agent_base_price,cuo.agent_delivery_charge_share, cuo.`user_id`, cuo.supplier_id, cuo.supplier_name, cu.name, cu.email, cu.phone_number,cu.id as agent_id,cu.country,cu.city,cu.state, IF( cu.agent_commission_type=0, 'Percentage', 'Flat' ) agent_commission_type, (cuo.`net_amount`-cuo.`promo_discount`) as net_amount, cuo.`delivery_charges`, cuo.`waiting_charges`, cuo.`tip_agent`, cuo.`status`, user_orders.delivered_on delivery_date, cuo.`card_payment_id`, cuo.`payment_type`,IF( TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on) > 0, TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on), '0' ) as duration, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as total_amount FROM `cbl_user_orders` cuo join cbl_user cu on cuo.user_id=cu.id left join cbl_account_payable_order capo on cuo.order_id=capo.order_id join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id left join "+db_name+".user_address user_address on user_orders.user_delivery_address=user_address.id left join "+db_name+".supplier supplierinfo on cuo.supplier_id=supplierinfo.id WHERE  "+supplier_check+"  DATE( user_orders.delivered_on ) >= '"+startDate+"' AND DATE( user_orders.delivered_on ) <=  '"+endDate+"' "+status_check+" AND (cuo.customer_name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%' "+country_code_query+" "+branch_sql+" order by cuo.order_id + 0 desc LIMIT "+offset+","+limit;
                 console.log("sql #########$$$$$$$$$$$$$$$$$$$$$$$$$",sql)
    
    
                    if(parseInt(is_download)){
                        let sql1 = sql.split('LIMIT')[0];
                        //let receivable = await ExecuteQ.Query(db_name,sql1,[]);
                        let receivable=await ExecuteQ.QueryAgent(agentConnection,sql1,[]);
                        let header = [ 
                            {id: 'ORDER_NO', title: 'ORDER_NO'},
                            {id: 'DISTANCE', title: 'DISTANCE'},
                            {id: 'COMMISSION_AMOUNT', title: 'COMMISSION_AMOUNT'},
                            {id: 'AGENT_ID', title: 'AGENT_ID'},
                            {id: 'AGENT_NAME', title: 'AGENT_NAME'},
                            {id: 'AGENT_EMAIL', title: 'AGENT_EMAIL'},
                            {id: 'AGENT_PHONE_NUMBER', title: 'AGENT_PHONE_NUMBER'},
                            {id: 'AGENT_CITY', title: 'AGENT_CITY'},
                            {id: 'AGENT_STATE', title: 'AGENT_STATE'},
                            {id: 'AGENT_COUNTRY', title: 'AGENT_COUNTRY'},
                            {id: 'AGENT_COMMISSION_TYPE', title: 'AGENT_COMMISSION_TYPE'},
                            {id: 'NET_AMOUNT', title: 'NET_AMOUNT'},
                            {id: 'TOTAL_AMOUNT', title: 'TOTAL_AMOUNT'},
                            {id: 'DELIVERY_CHARGES', title: 'DELIVERY_CHARGES'},
                            {id: 'WAITING_CHARGES', title: 'WAITING_CHARGES'},
                            {id: 'TIP_AGENT', title: 'TIP_AGENT'},
                            {id: 'STATUS', title: 'STATUS'},
                            {id: 'DURATION', title: 'DURATION'},
                            {id: 'PAYMENT_TYPE', title: 'PAYMENT_TYPE'},
                            {id: 'ORDER_DELIVERY_DATE', title: 'ORDER_DELIVERY_DATE'}
                          ]
                          let data = receivable.map((element)=>{
                              let temp = {}
                              temp["ORDER_NO"] = element.order_id
                              temp["DISTANCE"] = element.distance
                              temp["COMMISSION_AMOUNT"] = element.commission_ammount
                              temp["AGENT_ID"] = element.agent_id
                              temp["AGENT_NAME"] = element.name
                              temp["AGENT_EMAIL"] = element.email
                              temp["AGENT_PHONE_NUMBER"] = element.phone_number
                              temp["AGENT_CITY"] = element.city
                              temp["AGENT_STATE"] = element.state
                              temp["AGENT_COUNTRY"] = element.country
                              temp["AGENT_COMMISSION_TYPE"] = element.agent_commission_type
                              temp["NET_AMOUNT"] = element.net_amount
                              temp["TOTAL_AMOUNT"] = element.total_amount
                              temp["DELIVERY_CHARGES"] = element.delivery_charges
                              temp["WAITING_CHARGES"] = element.waiting_charges
                              temp["TIP_AGENT"] = element.tip_agent
                              temp["DURATION"] = element.duration
                              temp["PAYMENT_TYPE"] = element.payment_type
                              temp["ORDER_DELIVERY_DATE"] = moment(element.delivery_date).format('MMMM Do YYYY, h:mm:ss a')
                              temp["STATUS"] = element.status==5?"delivered":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                              //0 :pending,1:confirm,2:reject, 3: shipped, 4:nearby,5:delivered,6:rating_by_user,7:tracked,8:customer_cancel,9:schedule,10 reached 11=In-progress
                              return temp;
                          })
                
                          let csvLink = await uploadMgr.uploadCsvFileNew(data,header,"cash_orders_list_")
                          logger.debug("+==========csvLingk=========",csvLink)
                          data1.csvFileLink = csvLink
                          cb(null)
                    }else{
                        console.log("sql 111111111111111 #########$$$$$$$$$$$$$$$$$$$$$$$$$",sql)
    
                        let payable=await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                        if(payable.length){
                            data1.data=payable
                        }
                        else {
                            data1.data=[]
                        }
                        cb(null)
                    }
            },
            orderPart1:async function(cb){
                logger.debug("=sql==>>",sql)
                let sql3 = sql.split('LIMIT')[0];
                let payable = await ExecuteQ.QueryAgent(agentConnection,sql3,[]);
                if(payable.length){
                    data1.count=payable.length                
                }
                else {
                    data1.count=0
                }
                cb(null)
            },
            ordersPart2:async function (cb) {
                var sql="SELECT sum(cuo.`commission_ammount`) as total_commission_ammount, sum(cuo.`net_amount`) as total_net_amount, sum(cuo.`delivery_charges`) as total_delivery_charges, sum(cuo.`waiting_charges`) as total_waiting_charges, sum(cuo.`tip_agent`) as total_tip_agent, IF( ((sum(cuo.`commission_ammount`) + sum(cuo.`tip_agent`) + sum(cuo.`agent_base_price`) + sum(cuo.`agent_delivery_charge_share`)) - (sum(capo.`commission_ammount`) + sum(capo.`tip_agent`) + sum(capo.`agent_base_price`) + sum(capo.`agent_delivery_charge_share`)))  > 0, ((sum(cuo.`commission_ammount`) + sum(cuo.`tip_agent`) + sum(cuo.`agent_base_price`) + sum(cuo.`agent_delivery_charge_share`)) - (sum(capo.`commission_ammount`) + sum(capo.`tip_agent`) + sum(capo.`agent_base_price`) + sum(capo.`agent_delivery_charge_share`))), 0) as total_amount FROM `cbl_user_orders` cuo left join cbl_user cu on cuo.user_id=cu.id left join cbl_account_payable_order capo on cuo.order_id=capo.order_id  join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id WHERE  DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' "+status_check+" AND (cuo.customer_name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%' "+country_code_query+" "+branch_sql+"";
    
                let result = await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                if(result.length){
                    if(result[0].total_amount==null){
                        data1.totals={
                            "total_commission_ammount":0,
                            "total_net_amount":0,
                            "total_delivery_charges":0,
                            "total_waiting_charges":0,
                            "total_tip_agent":0,
                            "total_amount":0, // make it payable
                        }
                    }
                    else {
                        data1.totals=result
                    }
                    
                }
                else {
                    data1.totals={
                        "total_commission_ammount":0,
                        "total_net_amount":0,
                        "total_delivery_charges":0,
                        "total_waiting_charges":0,
                        "total_tip_agent":0,
                        "total_amount":0,
                    }
                }
                cb(null)
            },
        },function (err,result) {
            if(err)
            {
                console.log('err12-----',err);
                sendResponse.somethingWentWrongError(res);
            }
            else{
                callback(null,data1);
            }
        });
    }


exports.driverPayment = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var orderId=0;
    var transactionData=2;
    //var accountType=2;
    var adminId;
    var data=[];
    async.auto({
        blankField:function(cb) {
            console.log(req.body.transactionData);
            if(req.body && req.body.accessToken && req.body.authSectionId && req.body.transactionData)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                transactionData=req.body.transactionData;
                //accountType=req.body.accountType;
                cb(null);
            } else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err) {
                    sendResponse .somethingWentWrongError(res);
                }
                else {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        payment:['checkauthority',function(cb){
            console.log("1111111111111")
            driverPayablePayment(req.dbName,res,transactionData,function (err,result) {
                console.log("2222222222222")
                if(err) {
                    console.log("3333333333333")
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("4444444444444")
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

};

// function driverPayablePayment(dbName,res,data,callback) {
//     console.log("555555555555555555555555")
//     var id=0; 
//         async.auto({
//             update: async function (cb) {
//                 let getAgentDbData=await common.GetAgentDbInformation(dbName);        
//                 let agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
//                 for(var i=0;i<data.length;i++){
//                     (async function (i) {
//                         var amount=parseFloat(data[i].amount);
//                         var orderId=parseInt(data[i].orderId);
//                         var user_id=parseInt(data[i].user_id);
//                         var transaction_mode=parseInt(data[i].transaction_mode);


//                         if(transaction_mode == "1"){
//                             let agent_account_data=await ExecuteQ.QueryAgent(agentConnection,"select cu.stripe_account, cu.id as agent_id, (cuo.`commission_ammount` + cuo.`tip_agent`) as agent_payable_amount from cbl_user_orders cuo join cbl_user cu on cuo.user_id=cu.id where cuo.order_id=? and cuo.user_id!='0' limit 1",[orderId]);
                            
//                             var sql="select o.payment_source, o.card_payment_id, (SELECT value FROM `tbl_setting` WHERE `key` = 'is_agent_stripe_split_enabled' LIMIT 1) is_agent_stripe_split_enabled from orders o where o.id = ?  LIMIT 1";
//                             var reslt = await multiConnection[dbName].query(sql,[orderId])
//                             var agent_stripe_account_id=agent_account_data[0].stripe_account ? agent_account_data[0].stripe_account : '';
//                             var agent_payable_amount = agent_account_data[0].agent_payable_amount ? agent_account_data[0].agent_payable_amount : 0;

//                             if(reslt[0] != undefined && reslt[0].payment_source && reslt[0].payment_source == "stripe" && reslt[0].card_payment_id != "" && reslt[0].is_agent_stripe_split_enabled=="1"){
//                                 var charge_id=reslt[0].card_payment_id; // charge id
//                                 var is_agent_stripe_split_enabled=reslt[0].is_agent_stripe_split_enabled;// 0/1 (0-disabled, 1 - enabled)

//                                 if (is_agent_stripe_split_enabled=="1" && agent_stripe_account_id && agent_payable_amount != 0) {
//                                     await stripe.transfers.create({
//                                         amount: parseFloat(agent_payable_amount),
//                                         currency: "usd",
//                                         source_transaction: charge_id,
//                                         destination: agent_stripe_account_id,
//                                     });
//                                 }
//                             }
//                         }


//                         var selSql="select tip_agent, (`commission_ammount` + `tip_agent`) as total_amount ,  waiting_charges, commission_ammount, delivery_charges from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
//                         let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
//                         var tip_agent = orderExistingDetails[0].tip_agent;
//                         var total_amount = orderExistingDetails[0].total_amount;
//                         var total_paid = amount;
//                         var total_left = orderExistingDetails[0].total_amount - amount;
//                         var waiting_charges = orderExistingDetails[0].waiting_charges;
//                         var delivery_charges = orderExistingDetails[0].delivery_charges;
//                         var commission_ammount = orderExistingDetails[0].commission_ammount;
//                         var status = (total_amount == total_paid) ? 1 : 2;
//                         sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"')";
                        
//                         // var selSql="select tip_agent, total_amount, total_paid, total_left, status, transaction_mode, waiting_charges, payment_date, commission_ammount, delivery_charges from cbl_account_payable_order where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
//                         // let orderDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
//                         // var sql="";
//                         // if(orderDetails.length){
//                         //     var total_paid = orderDetails[0].total_paid + amount
//                         //     var total_left = orderDetails[0].total_left - amount
//                         //     if(total_paid == orderDetails[0].total_amount){
//                         //         total_left = "0";
//                         //     }
//                         //     sql = "update cbl_account_payable_order set total_left = "+total_left+", total_paid = "+total_paid+", status = 1 where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
//                         // }else{
//                         //     var selSql="select tip_agent, (`commission_ammount` + `tip_agent`) as total_amount ,  waiting_charges, commission_ammount, delivery_charges from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
//                         //     let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
//                         //     var tip_agent = orderExistingDetails[0].tip_agent;
//                         //     var total_amount = orderExistingDetails[0].total_amount;
//                         //     var total_paid = amount;
//                         //     var total_left = orderExistingDetails[0].total_amount - amount;
//                         //     var waiting_charges = orderExistingDetails[0].waiting_charges;
//                         //     var delivery_charges = orderExistingDetails[0].delivery_charges;
//                         //     var commission_ammount = orderExistingDetails[0].commission_ammount;
//                         //     var status = (total_amount == total_paid) ? 1 : 2;
//                         //     sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"')";
//                         // }
//                         if(transaction_mode == "1"){
//                             if(reslt[0] != undefined && reslt[0].payment_source && reslt[0].payment_source == "stripe" && reslt[0].card_payment_id != "" && reslt[0].is_agent_stripe_split_enabled=="1"){
//                                 await ExecuteQ.QueryAgent(agentConnection,sql,[]);
//                             }
//                         }else{
//                             await ExecuteQ.QueryAgent(agentConnection,sql,[]);
//                         }
//                         if(i==(data.length-1)){
//                             cb(null);
//                         }
//                     }(i))
//                 }
//             }
//         },function (err,result) {
//             if(err){
//                 console.log('errr3----', err);
//                 sendResponse.somethingWentWrongError(res);
//             }
//             else {
//                 callback(null);
//             }
//         });
    
// }



function driverPayablePayment(dbName,res,data,callback) {
    console.log("555555555555555555555555")
    var id=0; 
    var unsuccessfulOrderIds = [];
        async.auto({
            update: async function (cb) {
                let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                let agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
                for(var i=0;i<data.length;i++){
                    (async function (i) {
                        var amount=parseFloat(data[i].amount);
                        var orderId=parseInt(data[i].orderId);
                        var user_id=parseInt(data[i].user_id);
                        var transaction_mode=parseInt(data[i].transaction_mode);


                        if(transaction_mode == "1"){
                            let agent_account_data=await ExecuteQ.QueryAgent(agentConnection,"select cu.stripe_account, cu.id as agent_id, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.`agent_base_price` + cuo.`agent_delivery_charge_share`) as agent_payable_amount from cbl_user_orders cuo join cbl_user cu on cuo.user_id=cu.id where cuo.order_id=? and cuo.user_id!='0' limit 1",[orderId]);
                            
                            var sql="select o.payment_source, o.card_payment_id, (SELECT value FROM `tbl_setting` WHERE `key` = 'is_agent_stripe_split_enabled' LIMIT 1) is_agent_stripe_split_enabled from orders o where o.id = ?  LIMIT 1";
                            var reslt = await multiConnection[dbName].query(sql,[orderId])
                            var agent_stripe_account_id=agent_account_data[0].stripe_account ? agent_account_data[0].stripe_account : '';
                            var agent_payable_amount = agent_account_data[0].agent_payable_amount ? agent_account_data[0].agent_payable_amount : 0;

                            if(reslt[0] != undefined && reslt[0].payment_source && reslt[0].payment_source == "stripe" && reslt[0].card_payment_id != "" && reslt[0].is_agent_stripe_split_enabled=="1"){
                                var charge_id=reslt[0].card_payment_id; // charge id
                                var is_agent_stripe_split_enabled=reslt[0].is_agent_stripe_split_enabled;// 0/1 (0-disabled, 1 - enabled)

                                if (is_agent_stripe_split_enabled=="1" && agent_stripe_account_id && agent_payable_amount != 0) {

                                    var stripeTransfer = await stripe.transfers.create({
                                        amount: Math.round(parseFloat(agent_payable_amount * 100)),
                                        currency: "usd",
                                        source_transaction: charge_id,
                                        destination: agent_stripe_account_id,
                                    });
                                    if(stripeTransfer.id){
                                        var selSql="select tip_agent, (`commission_ammount` + `tip_agent` + agent_base_price + agent_delivery_charge_share) as total_amount ,  waiting_charges, commission_ammount, delivery_charges, agent_base_price, agent_delivery_charge_share from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                                        let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                                        var tip_agent = orderExistingDetails[0].tip_agent;
                                        var total_amount = orderExistingDetails[0].total_amount;
                                        var total_paid = amount;
                                        var total_left = orderExistingDetails[0].total_amount - amount;
                                        var waiting_charges = orderExistingDetails[0].waiting_charges;
                                        var delivery_charges = orderExistingDetails[0].delivery_charges;
                                        var commission_ammount = orderExistingDetails[0].commission_ammount;
                                        var agent_base_price = orderExistingDetails[0].agent_base_price;
                                        var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                                        var status = (total_amount == total_paid) ? 1 : 2;
                                        sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`,`agent_base_price`, `agent_delivery_charge_share`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"', '"+agent_base_price+"', '"+agent_delivery_charge_share+"')";
                                        await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                                        var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='1'"
                                        await ExecuteQ.Query(dbName,sql,[orderId,user_id])
                                        if(i==(data.length-1)){
                                            cb(null);
                                        }
                                    }else{
                                        unsuccessfulOrderIds.push(data);
                                        if(i==(data.length-1)){
                                            cb(null);
                                        }
                                    }
                                }else{
                                    unsuccessfulOrderIds.push(data);
                                    if(i==(data.length-1)){
                                        cb(null);
                                    }
                                }
                            }else{                                
                                unsuccessfulOrderIds.push(data);
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        }else{
                            var selSql="select tip_agent, (`commission_ammount` + `tip_agent` + agent_base_price + agent_delivery_charge_share) as total_amount ,  waiting_charges, commission_ammount, delivery_charges, agent_base_price, agent_delivery_charge_share from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                            let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                            var tip_agent = orderExistingDetails[0].tip_agent;
                            var total_amount = orderExistingDetails[0].total_amount;
                            var total_paid = amount;
                            var total_left = orderExistingDetails[0].total_amount - amount;
                            var waiting_charges = orderExistingDetails[0].waiting_charges;
                            var delivery_charges = orderExistingDetails[0].delivery_charges;
                            var commission_ammount = orderExistingDetails[0].commission_ammount;
                            var agent_base_price = orderExistingDetails[0].agent_base_price;
                            var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                            var status = (total_amount == total_paid) ? 1 : 2;
                            sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`,`agent_base_price`, `agent_delivery_charge_share`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"', '"+agent_base_price+"', '"+agent_delivery_charge_share+"')";
                            await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                            var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='1'"
                            await ExecuteQ.Query(dbName,sql,[orderId,user_id])
                        }
                        if(i==(data.length-1)){
                            cb(null);
                        }
                    }(i))
                }
            }
        },function (err,result) {
            if(err){
                console.log('errr3----', err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, unsuccessfulOrderIds);
            }
        });
    
}

exports.driverStatement = function (req,res) {
    var search = req.body.search
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var limit = req.body.limit;
    var offset = req.body.offset
    var agentId = req.body.agentId ? req.body.agentId : '';
    var supplier = req.body.supplier;
    let supplierBranchId=req.body.supplierBranchId || 0;
    var accessToken=0;
    var sectionId=0;
    var supplier='',
        startDate= '1990-01-01',
        endDate='2100-01-01';
    var adminId;
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    var data=[];
    console.log("00000000000000000000000")
    async.auto({
        blankField:function(cb) {
            console.log("66666666666666666666666666666")
            if(req.body && req.body.accessToken && req.body.authSectionId )
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.supplier){
                    supplier= req.body.supplier
                }
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            console.log("77777777777777777777")
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb) {
            console.log("8888888888888888888888888888")
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        getStatement:['checkauthority',function(cb){
            console.log("1111111111111111")
            adminAccounts.getDriverStatement(req.dbName,res,agentId,supplier,startDate,endDate,search,limit,offset,is_download,country_code,country_code_type ,supplierBranchId,function (err,result) {
                console.log("222222222222222")
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

};


exports.driverStatementV1 = function (req,res) {
    var search = req.body.search
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var limit = req.body.limit;
    var offset = req.body.offset
    var agentId = req.body.agentId ? req.body.agentId : '';
    var supplier = req.body.supplier;
    var accessToken=0;
    var sectionId=0;
    var supplier='',
        startDate= '1990-01-01',
        endDate='2100-01-01';
    var adminId;
    const is_download = req.body.is_download==undefined?0:req.body.is_download
    var data=[];
    console.log("00000000000000000000000")
    async.auto({
        blankField:function(cb) {
            console.log("66666666666666666666666666666")
            if(req.body && req.body.accessToken && req.body.authSectionId )
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.authSectionId;
                if(req.body.supplier){
                    supplier= req.body.supplier
                }
                if(req.body.startDate){
                    startDate= req.body.startDate
                }
                if(req.body.endDate){
                    endDate= req.body.endDate
                }
                cb(null);
            }
            else
            {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            console.log("77777777777777777777")
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb) {
            console.log("8888888888888888888888888888")
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        getStatement:['checkauthority',function(cb){
            console.log("1111111111111111")
            adminAccounts.getDriverStatementV1(req.dbName,res,agentId,supplier,startDate,endDate,search,limit,offset,is_download,country_code,country_code_type ,function (err,result) {
                console.log("222222222222222")
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

};

exports.getDriverStatement=async function(db_name,res,agentId,supplier,startDate,endDate,search,limit,offset,is_download, country_code,country_code_type,supplierBranchId,callback) {
    var data={};
    var credit=0;
    var debit=0;
    var balance=0;
    var totalBalance=0;
    var sql1;
    var country_code_query = ""
    let branch_sql=supplierBranchId!=0?" AND user_orders.supplier_branch_id="+supplierBranchId+"":""
    if(country_code!='' && country_code_type!=''){
        if(country_code_type=='1'){
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (cu.country_code LIKE '"+cc_array[i]+"' or cu.country_code LIKE '+"+cc_array[i]+"') "
            }
        }else{
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (cu.country_code NOT LIKE '"+cc_array[i]+"' and cu.country_code NOT LIKE '+"+cc_array[i]+"') "
            }
        }
    }
    let mUnit=await Universal.getMeausringUnit(db_name);
    let getAgentDbData=await common.GetAgentDbInformation(db_name);        
    let agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
       async.auto({
           statementDetails:async function (cb) {
            console.log("3333333333333333333333")
              
                sql1="SELECT round(("+mUnit+" * acos( cos( radians( supplierinfo.latitude) ) * cos( radians( user_address.latitude ) ) * cos( radians( user_address.longitude ) - radians(supplierinfo.longitude) ) + sin( radians(supplierinfo.latitude) ) * sin( radians( user_address.latitude ) ) ) )) as distance, user_orders.payment_source, user_orders.card_payment_id as payment_id, user_orders.transaction_id as payment_reference_number, IF( capo.status ='2', 'Partially Paid', IF( capo.status = '1', 'Paid', 'Not Paid' ) ) payment_status, capo.transaction_mode, cuo.`order_id`, cuo.customer_name, cuo.customer_phone_number, cuo.customer_email, cuo.customer_id, cuo.`commission_ammount`,cuo.agent_base_price, cuo.agent_delivery_charge_share, cuo.`user_id`, cuo.supplier_id, cuo.supplier_name, cu.name, cu.email, cu.phone_number,cu.id as agent_id,cu.country,cu.city,cu.state, IF( cu.agent_commission_type=0, 'Percentage', 'Flat' ) agent_commission_type, cuo.`net_amount`, cuo.`delivery_charges`, cuo.`waiting_charges`, cuo.`tip_agent`, cuo.`status`,cuo.delivered_on delivery_date, cuo.`card_payment_id`, cuo.`payment_type`,IF( TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on) > 0, TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on), '0' ) as duration, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as total_amount FROM `cbl_account_payable_order` capo join cbl_user_orders cuo on capo.order_id = cuo.order_id join cbl_user cu on capo.user_id=cu.id  join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id left join "+db_name+".user_address user_address on user_orders.user_delivery_address=user_address.id left join "+db_name+".supplier supplierinfo on cuo.supplier_id=supplierinfo.id WHERE DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' AND cuo.status LIKE '%"+status+"%' AND (cu.name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%' "+country_code_query+" "+branch_sql+" order by cuo.order_id + 0 desc LIMIT "+offset+","+limit;
    
                    if(parseInt(is_download)){
                        let sql2 = sql1.split('LIMIT')[0];
                     let result = await ExecuteQ.QueryAgent(agentConnection,sql2,[]);

                      let header = [ 
                        {id: 'ORDER_NO', title: 'ORDER_NO'},
                        {id: 'DISTANCE', title: 'DISTANCE'},
                        {id: 'COMMISSION_AMOUNT', title: 'COMMISSION_AMOUNT'},
                        {id: 'AGENT_ID', title: 'AGENT_ID'},
                        {id: 'AGENT_NAME', title: 'AGENT_NAME'},
                        {id: 'AGENT_EMAIL', title: 'AGENT_EMAIL'},
                        {id: 'AGENT_PHONE_NUMBER', title: 'AGENT_PHONE_NUMBER'},
                        {id: 'AGENT_CITY', title: 'AGENT_CITY'},
                        {id: 'AGENT_STATE', title: 'AGENT_STATE'},
                        {id: 'AGENT_COUNTRY', title: 'AGENT_COUNTRY'},
                        {id: 'AGENT_COMMISSION_TYPE', title: 'AGENT_COMMISSION_TYPE'},
                        {id: 'NET_AMOUNT', title: 'NET_AMOUNT'},
                        {id: 'TOTAL_AMOUNT', title: 'TOTAL_AMOUNT'},
                        {id: 'DELIVERY_CHARGES', title: 'DELIVERY_CHARGES'},
                        {id: 'WAITING_CHARGES', title: 'WAITING_CHARGES'},
                        {id: 'TIP_AGENT', title: 'TIP_AGENT'},
                        {id: 'STATUS', title: 'STATUS'},
                        {id: 'DURATION', title: 'DURATION'},
                        {id: 'PAYMENT_TYPE', title: 'PAYMENT_TYPE'},
                        {id: 'ORDER_DELIVERY_DATE', title: 'ORDER_DELIVERY_DATE'},
                        {id: 'ORDER_AMOUNT', title: 'ORDER_AMOUNT'},
                        //{id: 'BALANCE_AMOUNT', title: 'BALANCE_AMOUNT'},
                        {id: 'TRANSACTION_STATUS', title: 'TRANSACTION_STATUS'}
                      ]
                      let body = result.map((element)=>{
                          let temp = {}
                          temp["ORDER_NO"] = element.order_id
                          temp["DISTANCE"] = element.distance
                          temp["COMMISSION_AMOUNT"] = element.commission_ammount
                          temp["AGENT_ID"] = element.agent_id
                          temp["AGENT_NAME"] = element.name
                          temp["AGENT_EMAIL"] = element.email
                          temp["AGENT_PHONE_NUMBER"] = element.phone_number
                          temp["AGENT_CITY"] = element.city
                          temp["AGENT_STATE"] = element.state
                          temp["AGENT_COUNTRY"] = element.country
                          temp["AGENT_COMMISSION_TYPE"] = element.agent_commission_type
                          temp["NET_AMOUNT"] = element.net_amount
                          temp["TOTAL_AMOUNT"] = element.total_amount
                          temp["DELIVERY_CHARGES"] = element.delivery_charges
                          temp["WAITING_CHARGES"] = element.waiting_charges
                          temp["TIP_AGENT"] = element.tip_agent
                          temp["DURATION"] = element.duration
                          temp["PAYMENT_TYPE"] = element.payment_type
                          temp["ORDER_DELIVERY_DATE"] = moment(element.delivery_date).format('MMMM Do YYYY, h:mm:ss a')
                          temp["STATUS"] = element.status==5?"delivered":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                          //0 :pending,1:confirm,2:reject, 3: shipped, 4:nearby,5:delivered,6:rating_by_user,7:tracked,8:customer_cancel,9:schedule,10 reached 11=In-progress
                          temp["ORDER_AMOUNT"] = element.net_amount
                          //temp["BALANCE_AMOUNT"] = element.total_amount
                          temp["TRANSACTION_STATUS"] = element.payment_status //0-unpaid,1-fully_paid,2-partially_paid
                          return temp;
                      })
            
                      let csvLink = await uploadMgr.uploadCsvFileNew(body,header,"driver_account_statement")
                      logger.debug("+==========csvLingk=========",csvLink)
                      data.csvFileLink = csvLink
                      cb(null);
    
                    }else{
                        let result = await ExecuteQ.QueryAgent(agentConnection,sql1,[]);
                        data.statement=result;
                        cb(null);
                    }
           },
           statementDetailsCount:async function(cb){
            console.log("44444444444444444444")
            let sql2="SELECT round(("+mUnit+" * acos( cos( radians( supplierinfo.latitude) ) * cos( radians( user_address.latitude ) ) * cos( radians( user_address.longitude ) - radians(supplierinfo.longitude) ) + sin( radians(supplierinfo.latitude) ) * sin( radians( user_address.latitude ) ) ) )) as distance,  cuo.`order_id`, cuo.customer_name, cuo.customer_phone_number, cuo.customer_email, cuo.customer_id, cuo.`commission_ammount`,cuo.agent_base_price, cuo.agent_delivery_charge_share, cuo.`user_id`, cuo.supplier_id, cuo.supplier_name, cu.name, cu.email, cu.phone_number,cu.id as agent_id,cu.country,cu.city,cu.state, IF( cu.agent_commission_type=0, 'Percentage', 'Flat' ) agent_commission_type, cuo.`net_amount`, cuo.`delivery_charges`, cuo.`waiting_charges`, cuo.`tip_agent`, cuo.`status`,cuo.delivered_on delivery_date, cuo.`card_payment_id`, cuo.`payment_type`,IF( TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on) > 0, TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on), '0' ) as duration, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as total_amount  FROM `cbl_account_payable_order` capo join cbl_user_orders cuo on capo.order_id = cuo.order_id join cbl_user cu on capo.user_id=cu.id join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id  left join "+db_name+".user_address user_address on user_orders.user_delivery_address=user_address.id left join "+db_name+".supplier supplierinfo on cuo.supplier_id=supplierinfo.id  WHERE DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' AND cuo.status LIKE '%"+status+"%' AND (cu.name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%' "+country_code_query+" "+branch_sql+" order by cuo.order_id + 0 desc";
            //let sql2 = sql1.split('LIMIT')[0];
            let result = await ExecuteQ.QueryAgent(agentConnection,sql2,[]);
            data.count=result.length;
            cb(null);
           },
           
            ordersPart2:async function (cb) {
                var sql="SELECT sum(capo.`total_amount`) as total_amount FROM `cbl_account_payable_order` capo join cbl_user cu on capo.user_id=cu.id left join cbl_user_orders cuo on capo.order_id = cuo.order_id join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id WHERE cu.supplier_id='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' AND cuo.status LIKE '%"+status+"%' AND (cu.name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%'  "+country_code_query+" "+branch_sql+"";

                let result = await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                if(result.length){
                    if(result[0].total_amount==null){
                        data.totals={
                            "total_amount":0,
                        }
                    }
                    else {
                        data.totals=result
                    }
                    
                }
                else {
                    data.totals={
                        "total_amount":0,
                    }
                }
                cb(null)
            }
       },function (err,result) {
           if(err)
           {
               console.log('err12-----',err);
               sendResponse.somethingWentWrongError(res);
           }
           else{
               callback(null,data);
           }
       }); 
        
    }


exports.getDriverStatementV1=async function(db_name,res,agentId,supplier,startDate,endDate,search,limit,offset,is_download, country_code,country_code_type,callback) {
    var data={};
    var credit=0;
    var debit=0;
    var balance=0;
    var totalBalance=0;
    var sql1;
    var country_code_query = ""
    if(country_code!='' && country_code_type!=''){
        if(country_code_type=='1'){
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (cu.country_code LIKE '"+cc_array[i]+"' or cu.country_code LIKE '+"+cc_array[i]+"') "
            }
        }else{
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (cu.country_code NOT LIKE '"+cc_array[i]+"' and cu.country_code NOT LIKE '+"+cc_array[i]+"') "
            }
        }
    }
    let mUnit=await Universal.getMeausringUnit(db_name);
    let getAgentDbData=await common.GetAgentDbInformation(db_name);        
    let agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
       async.auto({
           statementDetails:async function (cb) {
            console.log("3333333333333333333333")

                sql1="SELECT round(("+mUnit+" * acos( cos( radians( supplierinfo.latitude) ) * cos( radians( user_address.latitude ) ) * cos( radians( user_address.longitude ) - radians(supplierinfo.longitude) ) + sin( radians(supplierinfo.latitude) ) * sin( radians( user_address.latitude ) ) ) )) as distance, user_orders.payment_source, user_orders.card_payment_id as payment_id, user_orders.transaction_id as payment_reference_number, IF( capo.status ='2', 'Partially Paid', IF( capo.status = '1', 'Paid', 'Not Paid' ) ) payment_status, capo.transaction_mode, cuo.`order_id`, cuo.customer_name, cuo.customer_phone_number, cuo.customer_email, cuo.customer_id, cuo.`commission_ammount`,cuo.agent_base_price, cuo.agent_delivery_charge_share, cuo.`user_id`, cuo.supplier_id, cuo.supplier_name, cu.name, cu.email, cu.phone_number,cu.id as agent_id,cu.country,cu.city,cu.state, IF( cu.agent_commission_type=0, 'Percentage', 'Flat' ) agent_commission_type, cuo.`net_amount`, cuo.`delivery_charges`, cuo.`waiting_charges`, cuo.`tip_agent`, cuo.`status`,cuo.delivered_on delivery_date, cuo.`card_payment_id`, cuo.`payment_type`,IF( TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on) > 0, TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on), '0' ) as duration, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as total_amount FROM `cbl_account_payable_order` capo join cbl_user_orders cuo on capo.order_id = cuo.order_id join cbl_user cu on capo.user_id=cu.id  join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id left join "+db_name+".user_address user_address on user_orders.user_delivery_address=user_address.id left join "+db_name+".supplier supplierinfo on cuo.supplier_id=supplierinfo.id WHERE cu.supplier_id='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' AND cuo.status LIKE '%"+status+"%' AND (cu.name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%' "+country_code_query+" order by cuo.order_id + 0 desc LIMIT "+offset+","+limit;
    
                    if(parseInt(is_download)){
                        let sql2 = sql1.split('LIMIT')[0];
                     let result = await ExecuteQ.QueryAgent(agentConnection,sql2,[]);

                      let header = [ 
                        {id: 'ORDER_NO', title: 'ORDER_NO'},
                        {id: 'DISTANCE', title: 'DISTANCE'},
                        {id: 'COMMISSION_AMOUNT', title: 'COMMISSION_AMOUNT'},
                        {id: 'AGENT_ID', title: 'AGENT_ID'},
                        {id: 'AGENT_NAME', title: 'AGENT_NAME'},
                        {id: 'AGENT_EMAIL', title: 'AGENT_EMAIL'},
                        {id: 'AGENT_PHONE_NUMBER', title: 'AGENT_PHONE_NUMBER'},
                        {id: 'AGENT_CITY', title: 'AGENT_CITY'},
                        {id: 'AGENT_STATE', title: 'AGENT_STATE'},
                        {id: 'AGENT_COUNTRY', title: 'AGENT_COUNTRY'},
                        {id: 'AGENT_COMMISSION_TYPE', title: 'AGENT_COMMISSION_TYPE'},
                        {id: 'NET_AMOUNT', title: 'NET_AMOUNT'},
                        {id: 'TOTAL_AMOUNT', title: 'TOTAL_AMOUNT'},
                        {id: 'DELIVERY_CHARGES', title: 'DELIVERY_CHARGES'},
                        {id: 'WAITING_CHARGES', title: 'WAITING_CHARGES'},
                        {id: 'TIP_AGENT', title: 'TIP_AGENT'},
                        {id: 'STATUS', title: 'STATUS'},
                        {id: 'DURATION', title: 'DURATION'},
                        {id: 'PAYMENT_TYPE', title: 'PAYMENT_TYPE'},
                        {id: 'ORDER_DELIVERY_DATE', title: 'ORDER_DELIVERY_DATE'},
                        {id: 'ORDER_AMOUNT', title: 'ORDER_AMOUNT'},
                        //{id: 'BALANCE_AMOUNT', title: 'BALANCE_AMOUNT'},
                        {id: 'TRANSACTION_STATUS', title: 'TRANSACTION_STATUS'}
                      ]
                      let body = result.map((element)=>{
                          let temp = {}
                          temp["ORDER_NO"] = element.order_id
                          temp["DISTANCE"] = element.distance
                          temp["COMMISSION_AMOUNT"] = element.commission_ammount
                          temp["AGENT_ID"] = element.agent_id
                          temp["AGENT_NAME"] = element.name
                          temp["AGENT_EMAIL"] = element.email
                          temp["AGENT_PHONE_NUMBER"] = element.phone_number
                          temp["AGENT_CITY"] = element.city
                          temp["AGENT_STATE"] = element.state
                          temp["AGENT_COUNTRY"] = element.country
                          temp["AGENT_COMMISSION_TYPE"] = element.agent_commission_type
                          temp["NET_AMOUNT"] = element.net_amount
                          temp["TOTAL_AMOUNT"] = element.total_amount
                          temp["DELIVERY_CHARGES"] = element.delivery_charges
                          temp["WAITING_CHARGES"] = element.waiting_charges
                          temp["TIP_AGENT"] = element.tip_agent
                          temp["DURATION"] = element.duration
                          temp["PAYMENT_TYPE"] = element.payment_type
                          temp["ORDER_DELIVERY_DATE"] = moment(element.delivery_date).format('MMMM Do YYYY, h:mm:ss a')
                          temp["STATUS"] = element.status==5?"delivered":"Pending" //0-unpaid,1-fully_paid,2-partially_paid
                          //0 :pending,1:confirm,2:reject, 3: shipped, 4:nearby,5:delivered,6:rating_by_user,7:tracked,8:customer_cancel,9:schedule,10 reached 11=In-progress
                          temp["ORDER_AMOUNT"] = element.net_amount
                          //temp["BALANCE_AMOUNT"] = element.total_amount
                          temp["TRANSACTION_STATUS"] = element.payment_status //0-unpaid,1-fully_paid,2-partially_paid
                          return temp;
                      })
            
                      let csvLink = await uploadMgr.uploadCsvFileNew(body,header,"driver_account_statement")
                      logger.debug("+==========csvLingk=========",csvLink)
                      data.csvFileLink = csvLink
                      cb(null);
    
                    }else{
                        let result = await ExecuteQ.QueryAgent(agentConnection,sql1,[]);
                        data.statement=result;
                        cb(null);
                    }
           },
           statementDetailsCount:async function(cb){
            console.log("44444444444444444444")
            let sql2="SELECT round(("+mUnit+" * acos( cos( radians( supplierinfo.latitude) ) * cos( radians( user_address.latitude ) ) * cos( radians( user_address.longitude ) - radians(supplierinfo.longitude) ) + sin( radians(supplierinfo.latitude) ) * sin( radians( user_address.latitude ) ) ) )) as distance,  cuo.`order_id`, cuo.customer_name, cuo.customer_phone_number, cuo.customer_email, cuo.customer_id, cuo.`commission_ammount`,cuo.agent_base_price, cuo.agent_delivery_charge_share, cuo.`user_id`, cuo.supplier_id, cuo.supplier_name, cu.name, cu.email, cu.phone_number,cu.id as agent_id,cu.country,cu.city,cu.state, IF( cu.agent_commission_type=0, 'Percentage', 'Flat' ) agent_commission_type, cuo.`net_amount`, cuo.`delivery_charges`, cuo.`waiting_charges`, cuo.`tip_agent`, cuo.`status`,cuo.delivered_on delivery_date, cuo.`card_payment_id`, cuo.`payment_type`,IF( TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on) > 0, TIMESTAMPDIFF(MINUTE,cuo.shipped_on,cuo.delivered_on), '0' ) as duration, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as total_amount  FROM `cbl_account_payable_order` capo join cbl_user_orders cuo on capo.order_id = cuo.order_id join cbl_user cu on capo.user_id=cu.id join "+db_name+".orders as user_orders on cuo.order_id=user_orders.id  left join "+db_name+".user_address user_address on user_orders.user_delivery_address=user_address.id left join "+db_name+".supplier supplierinfo on cuo.supplier_id=supplierinfo.id  WHERE cu.supplier_id='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' AND cuo.status LIKE '%"+status+"%' AND (cu.name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%' "+country_code_query+" order by cuo.order_id + 0 desc";
            //let sql2 = sql1.split('LIMIT')[0];
            let result = await ExecuteQ.QueryAgent(agentConnection,sql2,[]);
            data.count=result.length;
            cb(null);
           },
           
            ordersPart2:async function (cb) {
                var sql="SELECT sum(capo.`total_amount`) as total_amount FROM `cbl_account_payable_order` capo join cbl_user cu on capo.user_id=cu.id left join cbl_user_orders cuo on capo.order_id = cuo.order_id WHERE cu.supplier_id='0' AND DATE( cuo.delivered_on ) >= '"+startDate+"' AND DATE( cuo.delivered_on ) <=  '"+endDate+"' AND cuo.status LIKE '%"+status+"%' AND (cu.name LIKE '%"+search+"%' OR cuo.order_id LIKE '%"+search+"%') AND cuo.user_id LIKE '%"+agentId+"%' AND cuo.supplier_id LIKE '%"+supplier+"%'  "+country_code_query+"";

                let result = await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                if(result.length){
                    if(result[0].total_amount==null){
                        data.totals={
                            "total_amount":0,
                        }
                    }
                    else {
                        data.totals=result
                    }
                    
                }
                else {
                    data.totals={
                        "total_amount":0,
                    }
                }
                cb(null)
            }
       },function (err,result) {
           if(err)
           {
               console.log('err12-----',err);
               sendResponse.somethingWentWrongError(res);
           }
           else{
               callback(null,data);
           }
       }); 
        
    }


    exports.payoutAgentRequestList = function (req,res) {
        var accessToken=0;
        var sectionId=0;
        var limit = req.query.limit;
        var offset = req.query.offset;
        var agent_id = req.query.agent_id ? req.query.agent_id : '';
        let supplierBranchId=req.query.supplierBranchId || 0;
        let branch_sql=supplierBranchId!=0?" AND user_orders.supplier_branch_id="+supplierBranchId+"":""
        var query1=""
        if(agent_id!=''){
            query1 += "and agent_supplier_id='"+agent_id+"'"
        }
        var request_status = req.query.request_status ? req.query.request_status : '';
        if(request_status!=''){
            query1 += "and request_status='"+request_status+"'"
        }
        async.auto({
            getAllPayouts:async function(cb) {
                
                var sql="select asp.*, (SELECT name from "+req.dbName+"_agent.cbl_user where id=asp.agent_supplier_id) as agent_name from agent_supplier_payouts asp join orders as user_orders on asp.order_id=user_orders.id  where asp.type='1' "+query1+" "+branch_sql+" order by asp.id desc LIMIT "+offset+","+limit;
                var result = await ExecuteQ.Query(req.dbName,sql)

                var sqlCount="select count(asp.id) as cnt from agent_supplier_payouts asp join orders as user_orders on asp.order_id=user_orders.id where asp.type='1' "+query1+" "+branch_sql+"";
                var resultCount = await ExecuteQ.Query(req.dbName,sqlCount)

                data={
                    data : result,
                    count: resultCount[0].cnt
                };
                cb(null);
            }
        },function(err,result){
                if(err) {
                    sendResponse.somethingWentWrongError(res);
                }else{
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                }
            })
    }
    exports.payoutSupplierRequestList = function (req,res) {
        var accessToken=0;
        var sectionId=0;
        var limit = req.query.limit;
        var offset = req.query.offset;
        var supplier_id = req.query.supplier_id ? req.query.supplier_id : '';
        var query1=""
        if(supplier_id!=''){
            query1 += "and agent_supplier_id='"+supplier_id+"'"
        }
        var request_status = req.query.request_status ? req.query.request_status : '';
        if(request_status!=''){
            query1 += "and request_status='"+request_status+"'"
        }
        async.auto({
            getAllPayouts:async function(cb) {
                var sql="select asp.*, (SELECT name from supplier where id=asp.agent_supplier_id) as supplier_name from agent_supplier_payouts asp  where type='2' "+query1+" order by asp.id desc LIMIT "+offset+","+limit;
                var result = await ExecuteQ.Query(req.dbName,sql)


                var sqlCount="select count(asp.id) as cnt from agent_supplier_payouts asp  where type='2' "+query1;
                var resultCount = await ExecuteQ.Query(req.dbName,sqlCount)

                data={
                    data : result,
                    count: resultCount[0].cnt
                };
                cb(null);
            }
        },function(err,result){
                if(err) {
                    sendResponse.somethingWentWrongError(res);
                }else{
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                }
            })
    }
exports.acceptRejectPayoutRequest = function (req,res) {
        var accessToken=0;
        var sectionId=0;
        var requestId = req.body.request_id;
        var status = req.body.status
        var data = {};
        
        async.auto({
            blankField:function(cb) {
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
            }, 
            authenticate:['blankField',function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                        sendResponse .somethingWentWrongError(res);
                    }
                    else
                    {
                        adminId=result;
                        logger.debug("adminId:  ",adminId);
                        cb(null);
                    }
                })
            }],
            checkauthority:['authenticate',function(cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                    if(err)
                    {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else
                    {
                        console.log("checkauthority complete");
                        cb(null);
                    }
                });
            }],
            payablePayouts:['checkauthority',async function(cb){
                var sql="update agent_supplier_payouts set request_status='"+status+"' where id='"+requestId+"'"
                var result = await ExecuteQ.Query(req.dbName,sql,[status,requestId])
                //data=result;
                cb(null);
            }]
        },function(err,result){
                if(err) {
                    sendResponse.somethingWentWrongError(res);
                }else{
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                }
            })
}

exports.acceptRejectPayoutRequestV1 = function (req,res) {
    var accessToken=0;
    var sectionId=0;
    var requestId = req.body.request_id;
    var status = req.body.status
    var data = {};

    let transactionData = req.body.transactionData
    
    async.auto({
        blankField:function(cb) {
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
        }, 
        authenticate:['blankField',function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    logger.debug("adminId:  ",adminId);
                    cb(null);
                }
            })
        }],
        checkauthority:['authenticate',function(cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        // GetAmountAndAccount:['checkauthority',async function(cb){
        //     var sql="select asp.*, (SELECT 	stripe_account from "+req.dbName+"_agent.cbl_user where id=asp.agent_supplier_id) as stripe_account from agent_supplier_payouts asp where type='1' and id=?"
        //     var result = await ExecuteQ.Query(req.dbName,sql,[requestId]);
        //     console.log(result)
        //     let data={amount:result[0].payable_amount,
        //     stripe_account:result[0].stripe_account};
        //      agentDetails=data;
        //     cb(null);
        // }],
        createTransfer:['checkauthority',async function(cb){
           agentPayoutPaymentsV1(req.dbName,res,transactionData,function (err,result) {
                console.log("2222222222222")
                if(err) {
                    console.log("3333333333333")
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("4444444444444")
                    data=result;
                    cb(null);
                }
            })

         //await Universal.transferAmount(agentDetails.amount,agentDetails.stripe_account,req.dbName);
        //  cb(null);

        }],
        payablePayouts:['createTransfer',async function(cb){
            var sql="update agent_supplier_payouts set request_status='"+status+"' and payment_status=1 where id='"+requestId+"'"
            var result = await ExecuteQ.Query(req.dbName,sql,[status,requestId])
            //data=result;
            cb(null);
        }]
    },function(err,result){
            if(err) {
                sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
            }
        })
}

    
exports.agentPayoutPayments = function (req,res) {
        var accessToken=0;
        var sectionId=0;
        var orderId=0;
        var transactionData=2;
        //var accountType=2;
        var adminId;
        var data=[];
        async.auto({
            blankField:function(cb) {
                console.log(req.body.transactionData);
                if(req.body && req.body.accessToken && req.body.authSectionId && req.body.transactionData)
                {
                    accessToken=req.body.accessToken;
                    sectionId=req.body.authSectionId;
                    transactionData=req.body.transactionData;
                    //accountType=req.body.accountType;
                    cb(null);
                } else {
                    sendResponse.parameterMissingError(res);
                }
            },
            authenticate:['blankField',function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err) {
                        sendResponse .somethingWentWrongError(res);
                    }
                    else {
                        adminId=result;
                        console.log("adminId:  ",adminId);
                        cb(null);
                    }
                })
            }],
            checkauthority:['authenticate',function(cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                    if(err) {
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        console.log("checkauthority complete");
                        cb(null);
                    }
                });
    
            }],
            agentPayoutPayments:['checkauthority',function(cb){
                console.log("1111111111111")
                agentPayoutPayments(req.dbName,res,transactionData,function (err,result) {
                    console.log("2222222222222")
                    if(err) {
                        console.log("3333333333333")
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        console.log("4444444444444")
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
    
    };


function agentPayoutPayments(dbName,res,data,callback) {
    console.log("555555555555555555555555")
    var id=0; 
    var unsuccessfulOrderIds = [];
        async.auto({
            update: async function (cb) {
                let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                let agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
                for(var i=0;i<data.length;i++){
                    (async function (i) {
                        var amount=parseFloat(data[i].amount);
                        var orderId=parseInt(data[i].orderId);
                        var user_id=parseInt(data[i].user_id);
                        var transaction_mode=parseInt(data[i].transaction_mode);


                        if(transaction_mode == "1"){
                            let agent_account_data=await ExecuteQ.QueryAgent(agentConnection,"select cu.stripe_account, cu.id as agent_id, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as agent_payable_amount from cbl_user_orders cuo join cbl_user cu on cuo.user_id=cu.id where cuo.order_id=? and cuo.user_id!='0' limit 1",[orderId]);
                            
                            var sql="select o.payment_source, o.card_payment_id, (SELECT value FROM `tbl_setting` WHERE `key` = 'is_agent_stripe_split_enabled' LIMIT 1) is_agent_stripe_split_enabled from orders o where o.id = ?  LIMIT 1";
                            var reslt = await multiConnection[dbName].query(sql,[orderId])
                            var agent_stripe_account_id=agent_account_data[0].stripe_account ? agent_account_data[0].stripe_account : '';
                            var agent_payable_amount = agent_account_data[0].agent_payable_amount ? agent_account_data[0].agent_payable_amount : 0;

                            if(reslt[0] != undefined && reslt[0].payment_source && reslt[0].payment_source == "stripe" && reslt[0].card_payment_id != "" && reslt[0].is_agent_stripe_split_enabled=="1"){
                                var charge_id=reslt[0].card_payment_id; // charge id
                                var is_agent_stripe_split_enabled=reslt[0].is_agent_stripe_split_enabled;// 0/1 (0-disabled, 1 - enabled)

                                if (is_agent_stripe_split_enabled=="1" && agent_stripe_account_id && agent_payable_amount != 0) {

                                    var stripeTransfer = await stripe.transfers.create({
                                        amount: Math.round(parseFloat(agent_payable_amount * 100)),
                                        currency: "usd",
                                        source_transaction: charge_id,
                                        destination: agent_stripe_account_id,
                                    });
                                    if(stripeTransfer.id){
                                        var selSql="select tip_agent, (`commission_ammount` + `tip_agent` + agent_base_price + agent_delivery_charge_share) as total_amount ,  waiting_charges, commission_ammount, delivery_charges, agent_base_price, agent_delivery_charge_share from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                                        let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                                        var tip_agent = orderExistingDetails[0].tip_agent;
                                        var total_amount = orderExistingDetails[0].total_amount;
                                        var total_paid = amount;
                                        var total_left = orderExistingDetails[0].total_amount - amount;
                                        var waiting_charges = orderExistingDetails[0].waiting_charges;
                                        var delivery_charges = orderExistingDetails[0].delivery_charges;
                                        var commission_ammount = orderExistingDetails[0].commission_ammount;
                                        var agent_base_price = orderExistingDetails[0].agent_base_price;
                                        var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                                        var status = (total_amount == total_paid) ? 1 : 2;
                                        sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`, `agent_base_price`, `agent_delivery_charge_share`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"', '"+agent_base_price+"', '"+agent_delivery_charge_share+"')";
                                        await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                                        var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='1'"
                                        await ExecuteQ.Query(dbName,sql,[orderId,user_id])
                                        if(i==(data.length-1)){
                                            cb(null);
                                        }
                                    }else{
                                        unsuccessfulOrderIds.push(data);
                                        if(i==(data.length-1)){
                                            cb(null);
                                        }
                                    }
                                }else{
                                    unsuccessfulOrderIds.push(data);
                                    if(i==(data.length-1)){
                                        cb(null);
                                    }
                                }
                            }else{                                
                                unsuccessfulOrderIds.push(data);
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        }else{
                            var selSql="select tip_agent, (`commission_ammount` + `tip_agent` + agent_base_price + agent_delivery_charge_share) as total_amount ,  waiting_charges, commission_ammount, delivery_charges, agent_base_price, agent_delivery_charge_share from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                            let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                            var tip_agent = orderExistingDetails[0].tip_agent;
                            var total_amount = orderExistingDetails[0].total_amount;
                            var total_paid = amount;
                            var total_left = orderExistingDetails[0].total_amount - amount;
                            var waiting_charges = orderExistingDetails[0].waiting_charges;
                            var delivery_charges = orderExistingDetails[0].delivery_charges;
                            var commission_ammount = orderExistingDetails[0].commission_ammount;
                            var agent_base_price = orderExistingDetails[0].agent_base_price;
                            var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                            var status = (total_amount == total_paid) ? 1 : 2;
                            sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`, `agent_base_price`, `agent_delivery_charge_share`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"', '"+agent_base_price+"', '"+agent_delivery_charge_share+"')";
                            await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                            var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='1'"
                            await ExecuteQ.Query(dbName,sql,[orderId,user_id])
                        }
                        if(i==(data.length-1)){
                            cb(null);
                        }
                    }(i))
                }
            }
        },function (err,result) {
            if(err){
                console.log('errr3----', err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, unsuccessfulOrderIds);
            }
        });
    
}

function agentPayoutPaymentsV1(dbName,res,data,callback) {
    console.log("555555555555555555555555")
    var id=0; 
    var unsuccessfulOrderIds = [];
        async.auto({
            update: async function (cb) {
                let getAgentDbData=await common.GetAgentDbInformation(dbName);        
                let agentConnection=await common.RunTimeAgentConnection(getAgentDbData); 
                let currency = await Universal.getCurrency(dbName)
                for(var i=0;i<data.length;i++){
                    (async function (i) {
                        var amount=parseFloat(data[i].amount);
                        var orderId=parseInt(data[i].orderId);
                        var user_id=parseInt(data[i].user_id);
                        var transaction_mode=parseInt(data[i].transaction_mode);


                        if(1){
                            let agent_account_data=await ExecuteQ.QueryAgent(agentConnection,"select cu.stripe_account, cu.id as agent_id, (cuo.`commission_ammount` + cuo.`tip_agent` + cuo.agent_base_price + cuo.agent_delivery_charge_share) as agent_payable_amount from cbl_user_orders cuo join cbl_user cu on cuo.user_id=cu.id where cuo.order_id=? and cuo.user_id!='0' limit 1",[orderId]);
                            
                            var sql="select o.payment_source, o.card_payment_id, (SELECT value FROM `tbl_setting` WHERE `key` = 'is_agent_stripe_split_enabled' LIMIT 1) is_agent_stripe_split_enabled from orders o where o.id = ?  LIMIT 1";
                            // var reslt = await multiConnection[dbName].query(sql,[orderId])
                            var reslt = await ExecuteQ.Query(dbName,sql,[orderId])

                            var agent_stripe_account_id=agent_account_data[0].stripe_account ? agent_account_data[0].stripe_account : '';
                            var agent_payable_amount = agent_account_data[0].agent_payable_amount ? agent_account_data[0].agent_payable_amount : 0;

                            if(reslt[0] != undefined 
                                && reslt[0].payment_source 
                                && reslt[0].payment_source == "stripe" ){

                                 const stripe = require('stripe')(`sk_test_51IY8YyKTfafz82aSlvlUIX6bZhJ1pLrcqJb3NZ6JTURixS9S4WTgWm0Etvhv69uNnP6lCoDXzMhSeeiHz8XROV7q001EerJrBH`);

                                    console.log("=====reslt[0]=====")
                                var charge_id=reslt[0].card_payment_id; // charge id
                                var is_agent_stripe_split_enabled=reslt[0].is_agent_stripe_split_enabled;// 0/1 (0-disabled, 1 - enabled)
                                console.log("=====agent_stripe_account_id====agent_payable_amount===",
                                agent_stripe_account_id, agent_payable_amount )

                                if (agent_stripe_account_id && agent_payable_amount != 0) {

                                    var stripeTransfer = await stripe.transfers.create({
                                        amount: Math.round(parseFloat(agent_payable_amount * 100)),
                                        currency: currency,
                                        destination: agent_stripe_account_id,
                                    });
                                    console.log("====stripeTransfer=====",stripeTransfer)

                                    if(stripeTransfer.id){
                                        var selSql="select tip_agent, (`commission_ammount` + `tip_agent` + agent_base_price + agent_delivery_charge_share) as total_amount ,  waiting_charges, commission_ammount, delivery_charges, agent_base_price, agent_delivery_charge_share from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                                        let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                                        var tip_agent = orderExistingDetails[0].tip_agent;
                                        var total_amount = orderExistingDetails[0].total_amount;
                                        var total_paid = amount;
                                        var total_left = orderExistingDetails[0].total_amount - amount;
                                        var waiting_charges = orderExistingDetails[0].waiting_charges;
                                        var delivery_charges = orderExistingDetails[0].delivery_charges;
                                        var commission_ammount = orderExistingDetails[0].commission_ammount;
                                        var agent_base_price = orderExistingDetails[0].agent_base_price;
                                        var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                                        var status = (total_amount == total_paid) ? 1 : 2;
                                        sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`, `agent_base_price`, `agent_delivery_charge_share`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"', '"+agent_base_price+"', '"+agent_delivery_charge_share+"')";
                                        await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                                        var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='1'"
                                        await ExecuteQ.Query(dbName,sql,[orderId,user_id])
                                        if(i==(data.length-1)){
                                            cb(null);
                                        }
                                    }else{
                                        unsuccessfulOrderIds.push(data);
                                        if(i==(data.length-1)){
                                            cb(null);
                                        }
                                    }
                                }else{
                                    unsuccessfulOrderIds.push(data);
                                    if(i==(data.length-1)){
                                        cb(null);
                                    }
                                }
                            }else{                                
                                unsuccessfulOrderIds.push(data);
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
                        }else{
                            var selSql="select tip_agent, (`commission_ammount` + `tip_agent` + agent_base_price + agent_delivery_charge_share) as total_amount ,  waiting_charges, commission_ammount, delivery_charges, agent_base_price, agent_delivery_charge_share from cbl_user_orders where user_id = '"+user_id+"' and order_id = '"+orderId+"'";
                            let orderExistingDetails = await ExecuteQ.QueryAgent(agentConnection,selSql,[]);
                            var tip_agent = orderExistingDetails[0].tip_agent;
                            var total_amount = orderExistingDetails[0].total_amount;
                            var total_paid = amount;
                            var total_left = orderExistingDetails[0].total_amount - amount;
                            var waiting_charges = orderExistingDetails[0].waiting_charges;
                            var delivery_charges = orderExistingDetails[0].delivery_charges;
                            var commission_ammount = orderExistingDetails[0].commission_ammount;
                            var agent_base_price = orderExistingDetails[0].agent_base_price;
                            var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                            var status = (total_amount == total_paid) ? 1 : 2;
                            sql ="INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`, `agent_base_price`, `agent_delivery_charge_share`) VALUES ('"+user_id+"', '"+tip_agent+"', '"+orderId+"', '"+total_amount+"', '"+total_paid+"', '"+total_left+"', '"+status+"', '"+transaction_mode+"', '"+waiting_charges+"', '"+commission_ammount+"', '"+delivery_charges+"', '"+agent_base_price+"', '"+agent_delivery_charge_share+"')";
                            await ExecuteQ.QueryAgent(agentConnection,sql,[]);
                            var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='1'"
                            await ExecuteQ.Query(dbName,sql,[orderId,user_id])
                        }
                        if(i==(data.length-1)){
                            cb(null);
                        }
                    }(i))
                }
            }
        },function (err,result) {
            if(err){
                console.log('errr3----', err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, unsuccessfulOrderIds);
            }
        });
    
}
    exports.supplierPayoutPayments = function (req,res) {
        var accessToken=0;
        var sectionId=0;
        var orderId=0;
        var transactionData=2;
        //var accountType=2;
        var adminId;
        var data=[];
        async.auto({
            blankField:function(cb) {
                console.log(req.body.transactionData);
                if(req.body && req.body.accessToken && req.body.authSectionId && req.body.transactionData)
                {
                    accessToken=req.body.accessToken;
                    sectionId=req.body.authSectionId;
                    transactionData=req.body.transactionData;
                    //accountType=req.body.accountType;
                    cb(null);
                } else {
                    sendResponse.parameterMissingError(res);
                }
            },
            authenticate:['blankField',function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err) {
                        sendResponse .somethingWentWrongError(res);
                    }
                    else {
                        adminId=result;
                        console.log("adminId:  ",adminId);
                        cb(null);
                    }
                })
            }],
            checkauthority:['authenticate',function(cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                    if(err) {
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        console.log("checkauthority complete");
                        cb(null);
                    }
                });
    
            }],
            supplierPayoutPayments:['checkauthority',function(cb){
                console.log("1111111111111")
                supplierPayoutPayments(req.dbName,res,transactionData,function (err,result) {
                    console.log("2222222222222")
                    if(err) {
                        console.log("3333333333333")
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        console.log("4444444444444")
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
    
    };


    async function supplierPayoutPayments(dbName,res,data,callback) {
        var strip_secret_key_data = await Universal.getStripSecretKey(dbName);

        var stripe = require('stripe')(strip_secret_key_data[0].value);
        var id=0;
        console.log("111111111111111111111")
        var unsuccessfulOrderIds = [];
            async.auto({
                update:function (cb) {
                    console.log("2222222222222222222222222222")
                    var date1 = moment().utcOffset(4);
                    var date=date1._d
                    for(var i=0;i<data.length;i++){
                        (async function (i) {
                            console.log("3333333333333333333333333333333")
                            var amount=parseInt(data[i].amount);
                            var orderId=parseInt(data[i].orderId);
                            var supplierId=data[i].supplierId;
                            var transaction_mode=data[i].transaction_mode;
        
                            if(transaction_mode == "1"){
                                console.log("444444444444444444444444444444444")
                                
                                var reslt = await ExecuteQ.Query(dbName,"SELECT o.payment_source,o.card_payment_id, (SELECT value FROM `tbl_setting` WHERE `key` = 'is_supplier_stripe_split_enabled' LIMIT 1) is_supplier_stripe_split_enabled, (SELECT stripe_account from supplier where id=?) supplier_stripe_account_id   FROM `orders` o where o.id=?",[supplierId,orderId])
                                console.log("result =========== ", reslt);
        
                                if(reslt[0] != undefined && reslt[0].payment_source && reslt[0].payment_source == "stripe" && reslt[0].card_payment_id != "" && reslt[0].is_supplier_stripe_split_enabled=="1"){
                                    console.log("555555555555555555555555555555555555555555")
                                    var charge_id=reslt[0].card_payment_id; // charge id
                                    var is_supplier_stripe_split_enabled=reslt[0].is_supplier_stripe_split_enabled;// 0/1 (0-disabled, 1 - enabled)
        
                                    if (is_supplier_stripe_split_enabled=="1" && supplier_stripe_account_id) {
                                        console.log("6666666666666666666666666666666666")
                                        var stripe = require('stripe')(strip_secret_key_data[0].value);
                                        var stripeTransfer = await stripe.transfers.create({
                                            amount: Math.round(parseFloat(amount * 100)),
                                            currency: "usd",
                                            source_transaction: charge_id,
                                            destination: supplier_stripe_account_id,
                                        });
                                        if(stripeTransfer.id){
                                            console.log("777777777777777777777777777777")
                                            var sqlUpdate="update orders set supplier_stripe_transfer_id=? where id=?";
                                            await ExecuteQ.Query(dbName,sqlUpdate,[stripeTransfer.id,orderId])
                                            var sql = "update account_payable_order aro join account_payable ar on aro.account_payable_id = ar.id set " +
                                            "aro.total_left = aro.total_left - "+amount+",aro.total_paid = aro.total_paid  + "+amount+",aro.status = 1," +
                                            "ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.order_id = "+orderId;
                                            await ExecuteQ.Query(dbName,sql,[])
                                            var sqls ='insert into account_statement(supplier_id,order_id,transaction_date,debit)values(?,?,?,?)';
                                            await ExecuteQ.Query(dbName,sqls,[supplierId,orderId,date,amount])
                                            var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='2'"
                                            await ExecuteQ.Query(dbName,sql,[orderId,supplierId])
                                            if(i==(data.length-1)){
                                                cb(null);
                                            }
                                        }else{
                                            console.log("888888888888888888888888888888888")
                                            unsuccessfulOrderIds.push(data[i]);
                                            if(i==(data.length-1)){
                                                cb(null);
                                            }
                                        }
                                    }else{
                                        console.log("99999999999999999999999999999999999")
                                        unsuccessfulOrderIds.push(data[i]);
                                        if(i==(data.length-1)){
                                            cb(null);
                                        }
                                    }
                                }else{
                                    console.log("101010101010101010101010101010")
                                    unsuccessfulOrderIds.push(data[i]);
                                    if(i==(data.length-1)){
                                        cb(null);
                                    }
                                }
                            }else{
        
                                var sqlp = "update account_payable_order aro join account_payable ar on aro.account_payable_id = ar.id set " +
                                    "aro.total_left = aro.total_left - "+amount+",aro.total_paid = aro.total_paid  + "+amount+",aro.status = 1," +
                                    "ar.amount_paid = ar.amount_paid + "+amount+",ar.amount_left = ar.amount_left - "+amount+" where aro.order_id = "+orderId;
                                await ExecuteQ.Query(dbName,sqlp,[])
                                var sql ='insert into account_statement(supplier_id,order_id,transaction_date,debit)values(?,?,?,?)';
                                await ExecuteQ.Query(dbName,sql,[supplierId,orderId,date,amount])
                                var sql="update agent_supplier_payouts set payment_status='1' where order_id=? and agent_supplier_id=? and type='2'"
                                await ExecuteQ.Query(dbName,sql,[orderId,supplierId])
                                if(i==(data.length-1)){
                                    cb(null);
                                }
                            }
        
                        }(i))
                    }
                },
            },function (err,result) {
                if(err){
                    console.log('errr3----', err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("unsuccessfulOrderIds === ",unsuccessfulOrderIds)
                    callback(null, unsuccessfulOrderIds);
                }
            });
        
        }

exports.getAdminChatList = function (req,res) {
    var limit = req.query.limit ? req.query.limit : "50";
    var offset = req.query.offset ? req.query.offset : "0"
    var type = req.query.type ? req.query.type : "1"
    var accessToken=0;
    var adminId;
    var data=[];
    console.log("111111111111111111111111111111111")
    async.auto({
        blankField:function(cb) {
            console.log("22222222222222222222222222222222")
            if(req.query && req.query.accessToken){
                console.log("2222222222222222222222222222")
                accessToken=req.query.accessToken;
                cb(null);
            }else{
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['blankField',function (cb) {
            console.log("3333333333333333333333333333333")
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                console.log("444444444444444444444444444444444444444")
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                    console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        getChat:['authenticate', async function(cb){
            console.log("55555555555555555555555555555")
            var agent_db = req.dbName+"_agent";
            var _userCreatedData = await ExecuteQ.Query(req.dbName,`select user_created_id from admin where id=?`,[adminId])
            let _userCreatedId=_userCreatedData && _userCreatedData.length>0?_userCreatedData[0].user_created_id:"";

            var sql ="select CASE WHEN send_to_type = 'ADMIN' THEN send_by_type ELSE send_to_type END AS utype, max(`c_id`) as last_id, (select text from chats where c_id=max(c.c_id) and (c.send_by='"+_userCreatedId+"' or c.send_to='"+_userCreatedId+"')  ) last_text, (select message_id from chats where c_id=max(c.c_id) and (c.send_by='"+_userCreatedId+"' or c.send_to='"+_userCreatedId+"') ) message_id, sent_at, u.email, u.id, concat(u.firstname, ' ',u.lastname) as name,u.user_image as image, u.user_created_id from chats c left join user u on (CASE WHEN send_to_type = 'ADMIN' THEN send_by ELSE send_to END)=u.user_created_id where (send_to_type='ADMIN' or send_by_type='ADMIN') AND send_to!='' AND send_by!='' group by least(`send_by`, `send_to`), greatest(`send_by`, `send_to`) having utype='USER' order by last_id desc LIMIT "+offset+","+limit;
            if(type=="2"){ //agent
                sql="select CASE WHEN send_to_type = 'ADMIN' THEN send_by_type ELSE send_to_type END AS utype, max(`c_id`) as last_id, (select text from chats where c_id=max(c.c_id)) last_text,(select message_id from chats where c_id=max(c.c_id)) message_id, sent_at, u.email, u.id, u.name,u.image, u.agent_created_id from chats c left join "+agent_db+".cbl_user u on (CASE WHEN send_to_type = 'ADMIN' THEN send_by ELSE send_to END)=u.agent_created_id where (send_to_type='ADMIN' or send_by_type='ADMIN') AND send_to!='' AND send_by!='' group by least(`send_by`, `send_to`), greatest(`send_by`, `send_to`) having utype='AGENT' order by last_id desc LIMIT "+offset+","+limit;
            }
            if(type=="3"){ //supplier
                sql="select CASE WHEN send_to_type = 'ADMIN' THEN send_by_type ELSE send_to_type END AS utype, max(`c_id`) as last_id, (select text from chats where c_id=max(c.c_id) and (c.send_by='"+_userCreatedId+"' or c.send_to='"+_userCreatedId+"') ) last_text,(select message_id from chats where c_id=max(c.c_id) and (c.send_by='"+_userCreatedId+"' or c.send_to='"+_userCreatedId+"') ) message_id, sent_at, u.email, u.id, u.name,u.supplier_image as image, u.user_created_id from chats c left join supplier u on (CASE WHEN send_to_type = 'ADMIN' THEN send_by ELSE send_to END)=u.user_created_id where (send_to_type='ADMIN' or send_by_type='ADMIN') AND send_to!='' AND send_by!='' group by least(`send_by`, `send_to`), greatest(`send_by`, `send_to`) having utype='SUPPLIER' order by last_id desc LIMIT "+offset+","+limit;
            }
            var result = await ExecuteQ.Query(req.dbName,sql,[])
            console.log("result =====================",result)
            data=result
            cb(null);
        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

        }
    })

};
    