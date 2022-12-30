var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784", "782e67bf1f26170706acd639d757ae08");
var pushNotifications = require('./pushNotifications');
var nodemailer = require('nodemailer');
var validator = require("email-validator");
var phone = require('node-phonenumber')
var phoneUtil = phone.PhoneNumberUtil.getInstance();
let Universal=require('../util/Universal')
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const common = require('../common/agent')
const Execute=require('../lib/Execute')

exports.viewSocialAccountLinks = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
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
                loginFunctions.listSocialAccounts(req.dbName,res, cb);
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


exports.updateSocialAccountLinks = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var fbLink = req.body.fbLink;
    var twitterLink = req.body.twitterLink;
    var instaLink = req.body.instaLink;
    var manValues = [accessToken, sectionId, fbLink, twitterLink, instaLink];
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
                updateLinks(req.dbName,res, fbLink, twitterLink, instaLink, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.listUsersForSettingsPage = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
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
                loginFunctions.listUsers(req.dbName,res, cb);
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

/**
 * @description used for listing an basic detail of supplier like phone,name etc
 */
exports.listSuppliersForSettingsPage = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
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

                loginFunctions.listSuppliersForSettingsPage(req.dbName,res, cb);
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


/**
 * @description used for listing an basic detail of supplier like phone,name etc
 */
exports.listAgentsForSettingsPage = function (req, res) {
    // var accessToken = req.query.accessToken;
    // // var sectionId = req.body.sectionId;
    // var manValues = [accessToken, sectionId];
    async.waterfall([
            // function (cb) {
            //     func.checkBlank(res, manValues, cb);
            // },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            // },
            // function (id, cb) {
            //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            // },
            function (cb) {

                loginFunctions.listAgentsForSettingsPage(req.dbName,res, cb);
            }
        ], function (error, result) {

            if (error) {
                logger.debug("=================er-r----------",error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.sendSystemEmail = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var ids = req.body.ids;
    var receiverType = req.body.receiverType;
    var receiverEmail = req.body.receiverEmail;
    var subject = req.body.subject;
    var content = req.body.content;
    var email = [];
    var type = [];
    var id = [];
    var validEmail = [];
    var validId = [];
    var invalidEmail = [];
    var invalidId = [];
    var validReceiverType = [];
    var invalidReceiverType = [];
    var adminId = 0;
    var manValues = [accessToken, sectionId, receiverEmail, subject, content, ids, receiverType];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                adminId = id;
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                type = receiverType.split("#");
                email = receiverEmail.split("#");
                id = ids.split("#");
                for (var i = 0; i < email.length; i++) {
                    (function (i) {
                        //console.log("emm", email[i]);
                        if (validator.validate(email[i])) {
                            validEmail.push(email[i]);
                            validId.push(id[i]);
                            validReceiverType.push(type[i]);
                            if (i == email.length - 1) {
                                cb(null);
                            }
                        }
                        else {
                            invalidEmail.push(email[i]);
                            invalidId.push(id[i]);
                            invalidReceiverType.push(type[i])
                            if (i == email.length - 1) {
                                cb(null);
                            }
                        }
                    }(i))
                }

            },
            function (cb) {
                //console.log("valid Invalid", validEmail, invalidEmail);
                sendSystemSettingsMail(req,res, validEmail, subject, content, function (err, result) {
                    
                    // if (err) {
                    //     console.log("err", err);
                    //     sendResponse.somethingWentWrongError(res);

                    // }
                    // else {
                    //     //console.log("ressss");
                    //     cb(null);
                    // }
                });
                cb(null)
            },
            function (cb) {
                saveEmailRecord(req.dbName,res, validId, subject, content, adminId, 1, validReceiverType, cb);
            },
            function (cb) {
                saveEmailRecord(req.dbName,res, invalidId, subject, content, adminId, 0, invalidReceiverType, cb);
            }
        ], function (error, data) {

            if (error) {
                console.log("err4", err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                //console.log("done");
                data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.listSystemEmails = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var type = req.body.type;   // 0  for user , 1 for supplier
    var manValues = [accessToken, sectionId, type];
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
                listSystemEmails(req.dbName,res, type, cb);
            }
        ], function (error, data) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.listSystemSMS = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var type = req.body.type;   // 0  for user , 1 for supplier
    var manValues = [accessToken, sectionId, type];
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
                listSystemSMS(req.dbName,res, type, cb);
            }
        ], function (error, data) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.sendSystemSMS = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var ids = req.body.ids;
    var receiverNo = req.body.receiverNo;
    var text = req.body.text;
    var receiverType = req.body.receiverType;
    var adminId = 0;
    var manValues = [accessToken, sectionId, receiverNo, text, ids, receiverType];
    var validNumber = [];
    var validId = [];
    var invalidNumber = [];
    var invalidId = [];
    var type = []
    var validReceiverType = [];
    var invalidReceiverType = [];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                adminId = id;
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                var id = ids.split("#");
                var no = receiverNo.split("#");
                type = receiverType.split("#");
                for (var i = 0; i < no.length; i++) {
                    (function (i) {
                        //console.log("number", no[i]);
                        var number = phoneUtil.parse(no[i]);
                        if (phoneUtil.isValidNumber(number)) {
                            validNumber.push(no[i]);
                            validId.push(id[i]);
                            validReceiverType.push(type[i]);
                            if (i == no.length - 1) {
                                cb(null)
                            }
                        }
                        else {
                            invalidNumber.push(no[i]);
                            invalidId.push(id[i]);
                            invalidReceiverType.push(type[i]);
                            if (i == no.length - 1) {
                                cb(null)
                            }
                        }
                    }(i))
                }

            },
            function (cb) {
                sendSystemSettingsSMS(res, validNumber, text, cb);
            }, function (cb) {
                saveSMSRecord(req.dbName,res, validNumber, validId, text, adminId, 1, validReceiverType, cb);
            },
            function (cb) {
                saveSMSRecord(req.dbName,res, invalidNumber, invalidId, text, adminId, 0, invalidReceiverType, cb);

            }
        ], function (error, data) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.listTermsAndConditions = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
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
                loginFunctions.listTandC(req.dbName,res, cb);
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


exports.listFAQ = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
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
                loginFunctions.listTandC(req.dbName,res, cb);
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


exports.listAboutUs = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
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
                loginFunctions.listTandC(req.dbName,res, cb);
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





const checkPhoneAlreadyExist = (dbName,user_id,phone_number)=>{
    return new Promise(async(resolve,reject)=>{

        
        let query = "select id from user_cards where user_id=? and customer_payment_id=? and is_deleted =0"

        let params = [user_id,phone_number];

        let result = await Execute.Query(dbName,query,params);
        
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
}

exports.saveFlexPayMobile = async function (req, res) {



	return new Promise(async (resolve,reject)=>{
        try{
            let phone_number = req.body.phone_number;
            let user_id = req.body.user_id;
            let merchant = req.body.merchant|| "DUKA";
            let user_name =  req.body.user_name||"";


            let checkAlreadyExist = await checkPhoneAlreadyExist(req.dbName,user_id,
                phone_number)
            if(checkAlreadyExist && checkAlreadyExist.length>0){
                return sendResponse.sendErrorMessage("phone Number with this details already exist",res,400);
            }else{

            var sql = "insert into user_cards(customer_payment_id,user_id,card_type,card_source) values(?,?,?,?)"
            let data=await Execute.Query(req.dbName,sql,[phone_number,user_id,merchant,user_name])
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
        catch(Err){
            logger.debug("===Err==>>",Err)
            sendResponse.somethingWentWrongError(res);
        }
	
    })

}


exports.getFlexPayMobile = async function (req, res) {


	return new Promise(async (resolve,reject)=>{
        try{
            let user_id = req.query.user_id;
            var sql = "select customer_payment_id as phone_number ,card_source as user_name, user_id, card_type as merchant from user_cards where user_id = ?"
            let data=await Execute.Query(req.dbName,sql,[user_id])

            let newdata = {data}
            sendResponse.sendSuccessData(newdata, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
        catch(Err){
            logger.debug("===Err==>>",Err)
            sendResponse.somethingWentWrongError(res);
        }
	
    })

}

exports.deleteFlexPayMobile = async function (req, res) {

 
   
   

	return new Promise(async (resolve,reject)=>{
        try{
            let user_id = req.body.user_id;
            let phone_number = req.body.phone_number;

            var sql = "delete from user_cards where user_id = ? and 	customer_payment_id =? "
            let data=await Execute.Query(req.dbName,sql,[user_id,phone_number])
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
        catch(Err){
            logger.debug("===Err==>>",Err)
            sendResponse.somethingWentWrongError(res);
        }
	
    })

}









exports.flexPayCallback = async function (req, res) {

    // console.log("=============req===========",req);
    console.log("========================",req);
    console.log("=============req==params=========",req.params);
    console.log("========================");
    console.log("=============req===query========",req.query);
    console.log("========================");
    console.log("=============req===query========",req.body);






    var data = req.body;


    let dbname = "duka_0754"
    
    if(data.code==0){
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaa   flexpay")
    
        let query = "update cart set flexpay_status = 0 where flexpay_id =?"
       
        let params = [data.orderNumber]
       let successful_data=  await Execute.Query(dbname,query,params);
    
    console.log(successful_data,"successful_datasuccessful_data")
    
    
    }else if(data.code==1){
        let query = "update cart set flexpay_status = 1 where flexpay_id =?"
       console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbb   flexpay")
        let params = [data.orderNumber]
       let successful_data=  await Execute.Query(dbname,query,params);
       console.log(successful_data,"successful_datasuccessful_data")
    }









    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESSNEW);

}


exports.updateTandC = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var terms_and_conditions = req.body.termsAndConditions;
    var faq = req.body.faq;
    var aboutUs = req.body.aboutUs;
    var languageId = req.body.languageId;
    var manValues = [accessToken, sectionId, terms_and_conditions, languageId,faq,aboutUs];
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
                updateTerms(req.dbName,res, terms_and_conditions,faq,aboutUs, languageId, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.updateFAQ = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var faq = req.body.faq;
    var manValues = [accessToken, sectionId, faq];
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
                updateFAQ(req.dbName,res, faq, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.updateAboutUs = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var aboutUs = req.body.aboutUs;
    var manValues = [accessToken, sectionId, aboutUs];
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
                updateAboutUs(req.dbName,res, aboutUs, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}



exports.sendPushToCustomers = function (req, res) {
    
    
    
    // console.log("****************************************************",req.body);
    
    
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var ids = req.body.ids;
    var userType = req.body.userType;
    var content = req.body.content;
    var userId=[];
    var supplierId=[];
    let agentIds = [];
    var manValues = [accessToken, sectionId, ids, userType, content];

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
                var id=ids.split('#');
                var userTypes=userType.split('#');
                for(var i=0;i<id.length;i++){
                    (function (i) {
                        if(userTypes[i]==0){
                            userId.push(id[i]);
                            if(i==id.length-1){
                                cb(null);
                            }
                        }
                        else if(userTypes[i]==1) {
                            supplierId.push(id[i])
                            if(i==id.length-1){
                                cb(null);
                            }
                        }else{
                            agentIds.push(id[i]);
                            if(i==id.length-1){
                                cb(null);
                            }
                        }
                    }(i))
                }  
            },
            function (cb) {
                if(userId.length){

                    //console.log("user",userId);
                    sendPushNotifications(req.dbName,res, userId, 0, content,req.business_name, cb);
                }
              else{
                    cb(null)
                }
            },
            function (cb) {

                if(supplierId.length){
                    //console.log("supplier",supplierId);
                    sendPushNotifications(req.dbName,res, supplierId, 1, content,req.business_name, cb);
                }
               else {
                    cb(null);
                }
            },
            function(cb){
                if(agentIds && agentIds.length>0){
                    sendPushNotifications(req.dbName,res, agentIds, 2, content,req.business_name, cb);

                }else{
                    cb(null);
                }
            }
            // ,
            // function (cb) {
            //     saveNotification(req.dbName,res,userId,content,5,cb);
            // }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


async function sendPushNotifications(dbName,res, id, userType, content,bussinessName, callback) {
    
    
    
    // console.log("...........userType..........",userType);

    // console.log("...........id..........",id);
    let fcm_server_key = await Universal.getFcmServerKey(dbName);
    if(fcm_server_key!=""){
        fcm_server_key=fcm_server_key
    }else{
        fcm_server_key = config.get('server.fcm_server_key')
    }
    var android=[],userData=[];
    var ios=[], data = {
        "title":bussinessName,
        "status": constant.pushNotificationStatus.SYSTEM_PUSH,
        "message":content,
        "orderId":0
    }
    // var data = {"status": constant.pushNotificationStatus.SYSTEM_PUSH, "message": content, "data": {}};
    if (userType == 0) {
        var ids= id.toString();
        //console.log("iddddd",ids);

        // console.log(".................ids............................",ids);

        var sql = "select id,device_type,device_token from user where id IN ("+ids+")";
        multiConnection[dbName].query(sql,async function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                // console.log(".................result............................",result);
                var fcm = "";

                
                for(var i=0;i<result.length;i++){
                  (async function (i) {
                    // android.push(result[i].device_token);
                    // for await (const[index,i] of result.entries()){
                        android.push(result[i].device_token);
                        userData.push(result[i])
                        // await pushNotifications.sendFcmPushNotificationInBulk(fcm_server_key,result[i].device_token,data);
                    // }
             
                    if(i==result.length-1){
                        await pushNotifications.sendFcmPushNotificationInBulk(userData,
                            dbName,fcm_server_key,android,data);
                        // await pushNotifications.sendFcmPushNotificationInBulk(android,data);
                        callback(null);
                    }
                  }(i))
              }

            }

        })
    }
    else if(userType === 1){
        var ids= id.toString();
        //console.log("iddddd",ids);
        var sql = "select device_type,device_token from supplier where id IN ("+ids+")";
        multiConnection[dbName].query(sql, [ids],async function (err, result) {
            if (err) {
                console.log("err",err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                //console.log("res",result);
                for(var i=0;i<result.length;i++){
                    (async function (i) {

                        if(result[i].device_type==0){
                            // await pushNotifications.sendFcmPushNotificationInBulk(fcm_server_key,result[i].device_token,data);
                            // pushNotifications.sendFcmPushNotification(result[i].device_token,data,callback); 
                            android.push(result[i].device_token);
                            userData.push(result[i])
                            if(i==result.length-1){ 
                                await pushNotifications.sendFcmPushNotificationInBulk(userData,dbName,fcm_server_key,android,data);
                            //    await pushNotifications.sendFcmPushNotificationInBulk(android,data);                  
                                // pushNotifications.sendAndroidPushNotification(android, data, function (err, result) {
                                //     console.log("....ANDROID Push Sent....")
                                // });
                                // if(ios.length){

                                //     var path ="supplier";
                                //    // var path ="/home/royo/testing_branch/royo-backend/ClikatDevelopment.pem";
                                //     var sound = "ping.aiff";
                                //     var data1 = {
                                //         'message':content
                                //     };
                                //     pushNotifications.sendIosPushNotificationInSettings(ios,data1,path,sound,function (err, result) {
                                //         console.log("....IOS Push Sent....")

                                //     });

                                // }
                                callback(null);
                            }
                        }
                        else{
                            // await pushNotifications.sendFcmPushNotificationInBulk(fcm_server_key,result[i].device_token,data);
                            // await  pushNotifications.sendFcmPushNotificationInBulk(ios,data); 
                            ios.push(result[i].device_token);
                            userData.push(result[i])
                            if(i==result.length-1){
                                await pushNotifications.sendFcmPushNotificationInBulk(userData,dbName,fcm_server_key,ios,data);
                            
                                //   await  pushNotifications.sendFcmPushNotificationInBulk(ios,data);     
                                // pushNotifications.sendFcmPushNotification(result[i].device_token,data,callback);
                                // pushNotifications.sendFcmPushNotification(result[i].device_token,data);
                              
                            //     if(android.length){
                            //         pushNotifications.sendAndroidPushNotification(android, data, function (err, result) {
                            //             console.log("....ANDROID Push Sent....")
                            //         });
                            //     }
                            //     var path ="supplier";
                            //  //   var path ="/home/royo/testing_branch/royo-backend/ClikatDevelopment.pem";
                            //     var sound = "ping.aiff";
                            //     var data1 = {
                            //         'message':content
                            //     };
                            //     pushNotifications.sendIosPushNotificationInSettings(ios,data1,path,sound,function (err, result) {
                            //         console.log("....IOS Push Sent....")
                            //     });
                                callback(null);
                            }
                        }
                    }(i))
                }


            }

        })
    }else if(userType === 2){
        var ids= id.toString();
        //console.log("iddddd",ids);
        var sql = "select device_type,device_token from cbl_user where id IN ("+ids+")";
        let getAgentDbInformation = await common.GetAgentDbInformation(dbName);
        let runTimeAgentConn = await common.RunTimeAgentConnection(getAgentDbInformation);
        let result = await Execute.QueryAgent(runTimeAgentConn,sql,[]);
        for(var i=0;i<result.length;i++){
            (async function (i) {

                if(result[i].device_type==0){
                    android.push(result[i].device_token);
                    userData.push(result[i])
                    if(i==result.length-1){ 
                        await pushNotifications.sendFcmPushNotificationInBulk(userData,
                            dbName,fcm_server_key,android,data);

                        callback(null);
                    }
                }
                else{
                    ios.push(result[i].device_token);
                    userData.push(result[i])
                    if(i==result.length-1){
                        await pushNotifications.sendFcmPushNotificationInBulk(userData,dbName,fcm_server_key,ios,data);
                        callback(null);
                    }
                }
            }(i))
        }
    }else{
        callback(null);
    }
}


function updateLinks(dbName,res, fbLink, twitterLink, instaLink, callback) {

    var sql = "select id from social_account_links ";
    multiConnection[dbName].query(sql, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {

            if (result.length) {

                var sql = "update social_account_links set fb_link = ?,twitter_link = ?,instagram_link = ? where id = ? limit 1"
                multiConnection[dbName].query(sql, [fbLink, twitterLink, instaLink, result[0].id], function (err, update) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        callback(null);
                    }


                })
            }
            else {

                var sql = "insert into social_account_links(fb_link,twitter_link,instagram_link) values(?,?,?) ";
                multiConnection[dbName].query(sql, [fbLink, twitterLink, instaLink], function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        callback(null);
                    }

                })

            }

        }

    })

}


async function sendSystemSettingsMail(req,res, receiverEmail, subject, content, callback) {
    let smtpSqlSata=await Universal.smtpData(req.dbName);
    // func.sendMailthroughSMTP(smtpSqlSata,reply, subject, [supplierEmail], emailTemplate, 0,
    func.sendMailthroughSMTPOnlyToBCC(smtpSqlSata,res,subject,
        receiverEmail,content,0,callback)
    // sendMailthroughSMTP = function (smtpData,res,subject,receiversEmail,content,type,callback) {
    // sendSystemSettingsEmail(res, subject, receiverEmail, content, 0, callback);
}


function sendSystemSettingsSMS(res, receiverNo, text, callback) {
    for (var i = 0; i < receiverNo.length; i++) {
        (function (i) {
            //console.log("recd", receiverNo[i]);
            var smsOptions = {
                from: "+18447077820",
                To: receiverNo[i],
                Body: text
            };
            client.messages.create(smsOptions, function (err, message) {
                if (err) {
                    //console.log("err in ", err, receiverNo[i]);
                }
                else {
                    //console.log(message.sid);
                }
                if (i == receiverNo.length - 1) {
                    callback(null);
                }
            });var log4js=require("log4js")
            var logger = log4js.getLogger();
            logger.level = 'debug';
        }(i));

    }
}


function updateTerms(dbName,res, terms_and_conditions,faq,aboutUs, languageId, callback) {
    terms_and_conditions = terms_and_conditions.split("#");
    faq = faq.split("#");
    aboutUs = aboutUs.split("#");
    languageId = languageId.split("#");
    var sql = "select id from terms_and_conditions ";
    var termlength = terms_and_conditions.length;
    var statement = multiConnection[dbName].query(sql, function (err, result) {
        if (err) {
            logger.debug("=============eroreror======1=====",err,statement.sql)
            sendResponse.somethingWentWrongError(res)
        }
        else {
            logger.debug("=============eroreror===2========",terms_and_conditions,err,statement.sql)

            if (result.length) {
                logger.debug("========in the if after eroreror=====2================")
                for (var i = 0; i < result.length; i++) {
                    (function (i) {
                        var sql2 = "update terms_and_conditions set terms_and_conditions = ?,faq = ?,about_us = ? where id = ? and language_id = ? limit 1";
                        var stat2 = multiConnection[dbName].query(sql2, [terms_and_conditions[i],faq[i],aboutUs[i], result[i].id, languageId[i]], function (err, result2) {
                            logger.debug("============stat2==========",stat2.sql)
                                if(i == result.length - 1)
                                {
                                    callback(null)
                                }


                        })

                    }(i))

                }


            }
            else {
                logger.debug("========in the else part after eroreror=====2================",result.length)

                for (var i = 0; i < termlength; i++) {
                    (function (i) {
                        var sql3 = "insert into terms_and_conditions(terms_and_conditions,faq,about_us,language_id) values(?,?,?,?) ";
                        var stat3 = multiConnection[dbName].query(sql3, [terms_and_conditions[i],faq[i],aboutUs[i],languageId[i]], function (err, result3) {
                            logger.debug("============stat3=======",stat3.sql);
                            if(i == termlength - 1)
                            {
                                callback(null)
                            }


                        })

                    }(i))
                }


            }
        }


    })

}


function updateFAQ(dbName,res, faq, callback) {

    var sql = "select id from terms_and_conditions limit 1";
    multiConnection[dbName].query(sql, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            if (result.length) {
                var sql2 = "update terms_and_conditions set faq = ? where id = ? limit 1";
                multiConnection[dbName].query(sql2, [faq, result[0].id], function (err, result2) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        callback(null)
                    }
                })

            }
            else {

                var sql3 = "insert into terms_and_conditions(faq) values(?) ";
                multiConnection[dbName].query(sql3, [faq], function (err, result3) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        callback(null)
                    }
                })

            }
        }


    })

}


function updateAboutUs(dbName,res, aboutUs, callback) {

    var sql = "select id from terms_and_conditions limit 1";
    multiConnection[dbName].query(sql, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            if (result.length) {
                var sql2 = "update terms_and_conditions set about_us = ? where id = ? limit 1";
                multiConnection[dbName].query(sql2, [aboutUs, result[0].id], function (err, result2) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        callback(null)
                    }
                })

            }
            else {

                var sql3 = "insert into terms_and_conditions(about_us) values(?) ";
                multiConnection[dbName].query(sql3, [aboutUs], function (err, result3) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        callback(null)
                    }
                })

            }
        }


    })

}

function sendSystemSettingsEmail(res, subject, receiversEmail, content, type, callback) {


    var transporter = nodemailer.createTransport("SMTP", {
        service: "mailgun",
        auth: {
            user: config.get('EmailCredentials.email'),
            pass: config.get('EmailCredentials.password')
        }
    });
    if (type == 0) {
        var mailOptions = {
            from: config.get('EmailCredentials.email'), // sender address
            to: receiversEmail, // list of receivers
            subject: subject, // Subject line
            html: content  // plaintext body
        };
    }
    else {
        var mailOptions = {
            from: config.get('EmailCredentials.email'), // sender address
            to: receiversEmail, // list of receivers
            subject: subject, // Subject line
            text: content // plaintext body
        };
    }

// setup e-mail data with unicode symbols


// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("err", error);
            callback(null);
        } else {
            console.log('Message sent: ' + JSON.stringify(info));
            callback(null);
        }

    });

}

function saveEmailRecord(dbName,res, id, title, body, adminId, status, receiverType, callback) {
    var values = new Array();
    var insertLength = "(?,?,?,?,?,?,?),";
    var querystring = '';
    async.auto({
        getValue: function (cb) {
            var length = id.length;
            if (length) {
                for (var i = 0; i < length; i++) {
                    (function (i) {
                        var type = 1;
                        values.push(title, body, adminId, type, status, id[i], receiverType[i]);
                        querystring = querystring + insertLength;
                        //console.log('<=======querystring=======>' + querystring);
                        if (i == length - 1) {

                            querystring = querystring.substring(0, querystring.length - 1);
                            cb(null);

                        }
                    }(i))
                }
            }
            else {
                callback(null);
            }
        },
        setValue: ['getValue', function (cb) {
            var sql = "insert into sms_email_text(title,body,created_by,type,status,receiver_id,receiver_type)values" + querystring;
            multiConnection[dbName].query(sql, values, function (err, reply) {
                if (err) {
                    console.log("error", err);
                    //console.log("from insert");
                    sendResponse.somethingWentWrongError(res);
                } else {
                    cb(null);
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            console.log('err12-----', err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    });
}

function saveSMSRecord(dbName,res, no, id, body, adminId, status, receiverType, callback) {
    var values = new Array();
    var insertLength = "(?,?,?,?,?,?,?),";
    var querystring = '';
    async.auto({
        getValue: function (cb) {
            var length = no.length;
            if (length) {
                for (var i = 0; i < length; i++) {
                    (function (i) {
                        var type = 0;
                        var title = "System SMS";
                        values.push(title, body, adminId, type, status, id[i], receiverType[i]);
                        querystring = querystring + insertLength;
                        //console.log('<=======querystring=======>' + querystring);
                        if (i == length - 1) {

                            querystring = querystring.substring(0, querystring.length - 1);
                            cb(null);

                        }
                    }(i))
                }
            }
            else {
                callback(null);
            }
        },
        setValue: ['getValue', function (cb) {
            var sql = "insert into sms_email_text(title,body,created_by,type,status,receiver_id,receiver_type)values" + querystring;
            multiConnection[dbName].query(sql, values, function (err, reply) {
                if (err) {
                    console.log("error", err);
                    //console.log("from insert");
                    sendResponse.somethingWentWrongError(res);
                } else {
                    cb(null);
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            console.log('err12-----', err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    });
}


function listSystemEmails(dbName,res, type, callback) {
    if (type == 0) {
        var sql = "SELECT e.title, e.body, e.created_on, e.status, CONCAT( u.firstname,  ' ', u.lastname ) name ";
        sql += " FROM sms_email_text e ";
        sql += " JOIN user u ON e.receiver_id = u.id ";
        sql += " WHERE e.receiver_type =0 ";
        sql += " AND e.type =1 ";
        multiConnection[dbName].query(sql, function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, result);
            }

        })
    }
    else {
        var sql = "SELECT e.title, e.body, e.created_on, e.status, s.name ";
        sql += " FROM sms_email_text e ";
        sql += " JOIN supplier s ON e.receiver_id = s.id ";
        sql += " WHERE e.receiver_type = 1 ";
        sql += " AND e.type = 1 ";
        multiConnection[dbName].query(sql, function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, result);
            }

        })
    }

}


function listSystemSMS(dbName,res, type, callback) {
    if (type == 0) {
        var sql = "SELECT e.title, e.body, e.created_on, e.status, CONCAT( u.firstname,  ' ', u.lastname ) name ";
        sql += " FROM sms_email_text e ";
        sql += " JOIN user u ON e.receiver_id = u.id ";
        sql += " WHERE e.receiver_type =0 ";
        sql += " AND e.type =0 ";
        multiConnection[dbName].query(sql, function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, result);
            }

        })
    }
    else {
        var sql = "SELECT e.title, e.body, e.created_on, e.status, s.name ";
        sql += " FROM sms_email_text e ";
        sql += " JOIN supplier s ON e.receiver_id = s.id ";
        sql += " WHERE e.receiver_type = 1 ";
        sql += " AND e.type = 0 ";
        multiConnection[dbName].query(sql, function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, result);
            }

        })
    }
}

function saveNotification(dbName,res,users,message,status,callback) {
    var values = new Array();
    var insertLength = "(?,?,?),";
    var querystring = '';
    async.auto({
        getValue:function (cb) {
            if(users.length){
                for(var i=0;i<users.length;i++){
                    (function (i) {
                        values.push(users[i],message,status);
                        querystring = querystring + insertLength;
                                if (i == users.length - 1) {
                            querystring = querystring.substring(0, querystring.length - 1);
                            cb(null);

                        }
                    }(i))
                }
            }
            else{
                callback(null);
            }
        },
        setValue:['getValue',async function (cb) {
            try{
                var sql="insert into push_notifications(user_id,notification_message,notification_status)values"+querystring;
                await Execute.Query(dbName,sql,values);
                cb(null)
            }
            catch(Err){
                logger.debug("==Err===>>",Err)
                cb(Err)
            }
            // var sql="insert into push_notifications(user_id,notification_message,notification_status)values"+querystring;
            // multiConnection[dbName].query(sql, values, function (err, reply) {
            //     if (err) {
            //         console.log("error",err);
            //         //console.log("from insert");
            //         sendResponse.somethingWentWrongError(res);
            //     } else {
            //         //console.log("from inserted");
            //         cb(null);
            //     }
            // })
        }]
    },function (err,result) {
        if(err)
        {
            // console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null);
        }
    });
}
