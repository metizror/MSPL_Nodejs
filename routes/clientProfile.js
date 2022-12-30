
/**
 * @desc used for perform an operation related users like listing,activat-deactive etc from admin panel
 */
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');
const ExecuteQ=require('../lib/Execute')
const uploadMgr = require('../lib/UploadMgr')
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
/**
 * @description used for listing an user from admin panel
 */
exports.listUsers = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var offset = req.body.offset;
    var limit = req.body.limit;
    var searchType = req.body.searchType;
    var serachText = req.body.searchText;
    var search = req.body.search || ""
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    var subscription_id = req.body.subscription_id ? req.body.subscription_id : '';
    
    var country_code_query = ""
    if(country_code!='' && country_code_type!=''){
        if(country_code_type=='1'){
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (country_code LIKE '"+cc_array[i]+"' or country_code LIKE '+"+cc_array[i]+"') "
            }
        }else{
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (country_code NOT LIKE '"+cc_array[i]+"' and country_code NOT LIKE '+"+cc_array[i]+"') "
            }
        }
    }
    
    let is_download = req.body.is_download==undefined?0:req.body.is_download
    let is_stripe_connected = req.body.is_stripe_connected==undefined?0:req.body.is_stripe_connected

    console.log(".......serachType.....",req.body);
  
    var temp = {};
    var count_details;
    var manValues = [accessToken, sectionId];
    let having_data = ""

    if(parseInt(is_stripe_connected)==1){
        having_data = " having is_stripe_account=1 "
    }else if(parseInt(is_stripe_connected)==2){
        having_data = " having is_stripe_account=0 "

    }
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
                if(is_download!==0){
                  let totalClientProfiles = await loginFunctions.getTotalClientProfile(req.dbName,res,limit,offset,searchType,serachText,search,country_code,country_code_type);
                    console.log("+=========totalClientProfiles=============",totalClientProfiles[0])
                    let csvFile = await loginFunctions.makeCsvOfRecords(totalClientProfiles,limit,offset)                    
                    console.log(csvFile);
                    temp.csvFileLink = csvFile
                    cb(null)

                }else{
                    loginFunctions.clientProfile(req.dbName,res,
                        limit,offset,searchType,serachText,search,
                         country_code,country_code_type,
                         subscription_id,is_stripe_connected,async function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            temp.users = result
                            cb(null);

                            // if(parseInt(is_stripe_connected)>0){
                            //     if(parseInt(is_stripe_connected)==1){
                            //         let final = []
                            //         for(const [index,i] of result.entries()){

                            // logger.debug("===i.is_stripe_account,i.id,i.email===========",
                            // i.is_stripe_account,i.id,i.email);

                            //             if(parseInt(i.is_stripe_account)>0){
                            // logger.debug("===i.is_stripe_account===========",
                            // i.is_stripe_account);
                            //                 final.push(i);
                            //             }
                            //         }
                            //         temp.users = final;
                            //         cb(null);
                            //     }else if(parseInt(is_stripe_connected)==2){ 
                            //         let final = []
                            //         for(const [index,i] of result.entries()){
                            //             if(parseInt(i.is_stripe_account)==0){
                            //                 final.push(i);
                            //             }
                            //         }
                            //         temp.users = final;
                            //         cb(null);
                            //     }else{
                            //         cb(null);
                            //     }
                            // }else{
                            //     cb(null);
                            // }
                            
                        }
                    });
                }


            },
            async function(cb){
                try{
                if(searchType == 1){
                    var sql = "SELECT count(id) as total,IF((SELECT id FROM   user_cards WHERE  user_id = id AND is_deleted = 0 LIMIT  1)>0,1,0) AS is_stripe_account from user where is_deleted = 0 and (email LIKE '%"+search+"%' OR firstname LIKE '%"+search+"%' OR phone_no LIKE '%"+search+"%' OR mobile_no LIKE '%"+search+"%')  "+country_code_query+" "+having_data+" ";

                }else{
                    var sql = "SELECT count(id) as total,IF((SELECT id FROM   user_cards WHERE  user_id = id AND is_deleted = 0 LIMIT  1)>0,1,0) AS is_stripe_account from user where is_deleted = 0  "+country_code_query+" "+having_data+" "
            
                }
                let result=await ExecuteQ.Query(req.dbName,sql,[]);
                temp.count = result[0].total
                cb(null)
            }
            catch(Err){
                logger.debug("======Err!==>>",Err);
                cb(Err);
            }
            //    let stmt = multiConnection[req.dbName].query(sql,[],function(err,result){
            //        console.log("+======user listing count query ===========",stmt.sql)
            //         if(err){
            //             cb(err);
            //         }else{
            //             temp.count = result[0].total
            //            // temp.push({count:result[0]});
            //             cb(null)
            //         }
            //     })
            }
        ], function (error, result) {

            if (error) {
                console.log("eee",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(temp, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}




exports.activeDeactiveUsers = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var userId=req.body.userId;
    var status=req.body.status;
    var manValues = [accessToken, sectionId];
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
                makeUserActiveAndInactive(req.dbName,res,userId,status,cb)
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.updateUserLoyaltyPoint = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var userId=req.body.userId;
    var points=req.body.points;
    var manValues = [accessToken, sectionId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                updateLoyaltyPoints(req.dbName,res,userId,points,cb)
            }
        ], function (error, result) {

        console.log("..........err.........................",error,result);
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

function makeUserActiveAndInactive(dbName,res,userId,status,callback) {
    var sql='update user set is_active= ? where id=?';
    multiConnection[dbName].query(sql,[status,userId],function (err,result) {
        if (err) {
            console.log("...",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
        callback(null)
        }
    })
}

function updateLoyaltyPoints(dbName,res,userId,points,callback) {

    var sql='update user set loyalty_points=loyalty_points+? where id=?';
    multiConnection[dbName].query(sql,[points,userId],function (err,result) {
        
        console.log("........err.........................",err,result);
        if (err) {
            console.log("...",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
        callback(null)
        }
    })
}