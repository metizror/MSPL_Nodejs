var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var consts=require('./../config/const')
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
var request = require('request');
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
const Universal=require('../util/Universal')
const ExecuteQ=require('../lib/Execute')
var func = require('./commonfunction');
var randomstring = require("randomstring");

exports.signupOrLoginWithPhoneNumber = function(req,res){
    var email;
    var device_token;
    var device_type;   
    var latitude = 0;
    var longitude = 0;
    var password;
    var accessToken;
    var details = {};
    var flag = 1;
    let countryCode = req.body.countryCode;
    let mobileNumber = req.body.mobileNumber;
   var otp;
   req.body.password = "@#$@#SDAFASDFAS3242fs123"
   req.body.email = "u"+req.body.mobileNumber+"@gmail.com";
   let firstname="";
  
    async.auto({
        getValues:function(callback){
  
            if(!(req.body.deviceToken)){
                req.body.deviceToken  = "GGG";
            }else{
                
            }

            if(!(req.body.deviceType)){
                var msg = "device type not found"
                return sendResponse.sendErrorMessage(msg,res,400);
            }

            if(req.body.latitude){
                latitude = req.body.latitude;
            }

            if(req.body.longitude){
                longitude = req.body.longitude;
            }

            /*if(!(req.body.languageId)){
             var msg = "language id not found"
             return sendResponse.sendErrorMessage(msg,res,400);
             }*/

             if(!(countryCode)){
                var msg = "country Code not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }
            if(!(mobileNumber)){
                var msg = "mobile Number  not found";
                return sendResponse.sendErrorMessage(msg,reply,400);
            }


            if(req.body && req.body.email && req.body.deviceToken && req.body.password
                && countryCode && mobileNumber){
                email = req.body.email;
                device_token = req.body.deviceToken;
                device_type = req.body.deviceType;
                password = req.body.password;
                password = md5(password);
                return callback();
         }else{
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg,res,500);
            }
        },
        accessToken:function(callback){
            accessToken = func.encrypt(mobileNumber+new Date());
            callback(null);
        },
        checkmail:['getValues',function(callback){
                var sql = "select firstname,referral_link,referral_id,id,email,otp_verified,access_token,is_active, mobile_no,country_code from user where mobile_no = ? && is_deleted=0 ";
                var sts = multiConnection[req.dbName].query(sql, [mobileNumber], function (err, result) {
                 logger.debug("===============in the get Values ===========",sts.sql,err)
                   if (err) {
                       logger.debug("==========err in get values===========",err)
                        var msg = "db error"
                        sendResponse.sendErrorMessage(msg,res,500);
                    }
                    else {
                        if(result.length){
                            flag = 0;
                            details.existingRecord = true;
                            details.id = result[0].id;
                            details.firstname = result[0].firstname;                            
                            details.access_token = accessToken;
                            details.email = email;
                            details.otp_verified = 0;
                            details.mobile_no = mobileNumber;
                            details.country_code = countryCode;
                            details.test = countryCode+mobileNumber;   
                            callback(null);
                                // let msg = "User already registered with this Mobile Number."
                                // return sendResponse.sendErrorMessage(msg,reply,400);
                        }else{
                            logger.debug("====================6===================")
                            firstname="";
                            callback(null, result);
                        }
                    }   
                })

        }],
        genrateOtp:function(callback){
            otp =  Math.floor(Math.random()*90000) + 10000;
            callback(null);
        },
        createUser:['getValues','accessToken','checkmail','genrateOtp',function(callback){
            if(flag == 1){
                logger.debug("=========in the create user ===============")
                var randomize = require('randomatic');
				let  user_created_id =  randomize('A0', 30);
				console.log("===11111111111=uuid=====",user_created_id);
                var sql = "insert into user (firstname,email,device_token,device_type,latitude,longitude,password,access_token,otp_verified,user_created_id,mobile_no, country_code,otp)values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
                var sts = multiConnection[req.dbName].query(sql, [firstname,email,device_token,device_type,latitude,longitude,password,accessToken,0,user_created_id,mobileNumber,countryCode,otp], function (err, result) {
                    if (err) {
                        logger.debug("======error in create user ==============",err,sts.sql)
                        var msg = "db error"
                        sendResponse.sendErrorMessage(msg,res,500);
                    }
                    else {
                        details.id = result.insertId;
                        details.firstname = firstname;
                        details.access_token = accessToken;
                        // details.referral_link=result[0].referral_link;
                        details.email = email;
                        details.otp_verified = 0;
                        details.mobile_no = mobileNumber;
                        details.country_code = countryCode;                                
                        details.existingRecord = false;
                        details.test = countryCode+mobileNumber;
                        callback(null, result);
                    }
                })
            }else{
           
                callback(null);
            }
        }],
        sendOtp:['createUser',async function(callback){
            let twilioata=await Universal.getTwilioData(request.dbName);
            let OtpVerification = await Universal.disableOtpVerification(request.dbName);
            logger.debug("=========TWilio==DATA!=========>>",twilioata,Object.keys(twilioata).length);
            if(OtpVerification && OtpVerification.length>0){
                otp= 12345;
                callback(null);
            }else{
                if(Object.keys(twilioata).length>0 ){
                    var client = require('twilio')(twilioata[config.get("twilio.s_id")],twilioata[config.get("twilio.auth_key")]);
                    var smsOptions = {
                        from: twilioata[config.get("twilio.number_key")],
                        To: countryCode + mobileNumber.toString(),
                        Body: "Hi there, Your One Time Password is : "+otp
                    };
                    client.messages.create(smsOptions, function (err, message) {
                        logger.debug("=========Twilio==ER!==",err,message)
                        callback(null);
                    });
                }
                else{
                    otp = 12345;
                    callback(null);
                }
            }


        }],
        updateOTPUser:['sendOtp',function(callback){
            var sql = "update user set otp_verified=0,access_token=?,otp = ? ,device_token = ?,device_type = ? where mobile_no = ? ";
            multiConnection[req.dbName].query(sql, [accessToken,otp,device_token,device_type,mobileNumber], function (err, result) {
              console.log("***************err*********result.....",err,result);
                    if (err) {
                        var msg = "db error"
                        sendResponse.sendErrorMessage(msg,res,500);
                    }
                    else {                       
                        callback(null);
                    }
                })
            
        }],     
    },function(err,result){
        if(err) {
            var msg = err;
            sendResponse.sendErrorMessage(msg,res,500);
        }else{
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res,200);
        }
    })
}

exports.promoCodeList = function(req,res){
    var email;
    var device_token;
    var device_type;   
    var latitude = 0;
    var longitude = 0;
    var password;
    var accessToken;
    var details = {};
    var flag = 1;
   var otp;

   let limit=req.body.limit || 10;
   let offset=req.body.offset || 0;    

   console.log(req.dbName);


//    var sql = "SELECT *  FROM `promoCode` where isDeleted=0 and startDate >= NOW()  and endDate<=NOW()";

                async.waterfall([
                     function(callback) {
                        var sql = `SELECT *  FROM promoCode where isDeleted=0 limit ?,? `;
                        var sts = multiConnection[req.dbName].query(sql, [offset, limit], function (err, result) {
                                        if (err) {
                                            logger.debug("==========err in get values===========",err)
                                             var msg = "db error"
                                             sendResponse.sendErrorMessage(msg,res,500);
                                         }
                                         else {
                                            callback(null, result);
                                             
                                         }   
                                     })
                    },
                     function(results,callback) {
                        var sql = `SELECT count(1) as count FROM promoCode where isDeleted=0;`;
                        var sts = multiConnection[req.dbName].query(sql, [offset, limit], function (err, result) {
                                        if (err) {
                                            logger.debug("==========err in get values===========",err)
                                             var msg = "db error"
                                             sendResponse.sendErrorMessage(msg,res,500);
                                         }
                                         else {
                                             callback(null, results,result[0].count);
                                             
                                         }   
                                     })
                    },
                      function(data, count, callback) {
                        // once there is some data and the directory exists,
                        // write the data to a file in the directory
                        callback(null, {data, count,limit,offset});
                    }                 
                ], function(err, results) {
                    console.log('err = ', err);
                    console.log('results = ', results);
                    sendResponse.sendSuccessData(results, constant.responseMessage.SUCCESS, res,200);
                });
 


    // async.auto({
    //     getValues:function(callback){
  
    //         if(!(req.body.deviceToken)){
    //             req.body.deviceToken  = "GGG";
    //         }else{
                
    //         }

    //         if(!(req.body.deviceType)){
    //             var msg = "device type not found"
    //             return sendResponse.sendErrorMessage(msg,res,400);
    //         }

    //         if(req.body.latitude){
    //             latitude = req.body.latitude;
    //         }

    //         if(req.body.longitude){
    //             longitude = req.body.longitude;
    //         }

    //         /*if(!(req.body.languageId)){
    //          var msg = "language id not found"
    //          return sendResponse.sendErrorMessage(msg,res,400);
    //          }*/

    //          if(!(countryCode)){
    //             var msg = "country Code not found"
    //             return sendResponse.sendErrorMessage(msg,reply,400);
    //         }
    //         if(!(mobileNumber)){
    //             var msg = "mobile Number  not found";
    //             return sendResponse.sendErrorMessage(msg,reply,400);
    //         }


    //         if(req.body && req.body.email && req.body.deviceToken && req.body.password
    //             && countryCode && mobileNumber){
    //             email = req.body.email;
    //             device_token = req.body.deviceToken;
    //             device_type = req.body.deviceType;
    //             password = req.body.password;
    //             password = md5(password);
    //             return callback();
    //      }else{
    //             var msg = "something went wrong";
    //             return sendResponse.sendErrorMessage(msg,res,500);
    //         }
    //     },
    //     accessToken:function(callback){
    //         accessToken = func.encrypt(mobileNumber+new Date());
    //         callback(null);
    //     },
    //     checkmail:['getValues',function(callback){
    //             var sql = "SELECT *  FROM `promoCode` where isDeleted=0 and startDate >= NOW()  and endDate<=NOW()  ";
    //             var sts = multiConnection[req.dbName].query(sql, [mobileNumber], function (err, result) {
    //              logger.debug("===============in the get Values ===========",sts.sql,err)
    //                if (err) {
    //                    logger.debug("==========err in get values===========",err)
    //                     var msg = "db error"
    //                     sendResponse.sendErrorMessage(msg,res,500);
    //                 }
    //                 else {
    //                     if(result.length){
    //                         flag = 0;
    //                         details.existingRecord = true;
    //                         details.id = result[0].id;
    //                         details.firstname = result[0].firstname;                            
    //                         details.access_token = accessToken;
    //                         details.email = email;
    //                         details.otp_verified = 0;
    //                         details.mobile_no = mobileNumber;
    //                         details.country_code = countryCode;
    //                         details.test = countryCode+mobileNumber;   

    //                         callback(null);
    //                             // let msg = "User already registered with this Mobile Number."
    //                             // return sendResponse.sendErrorMessage(msg,reply,400);
    //                     }else{
    //                         logger.debug("====================6===================")
    //                         callback(null, result);
    //                     }
    //                 }   
    //             })

    //     }],
    //     genrateOtp:function(callback){
    //         otp =  Math.floor(Math.random()*90000) + 10000;
    //         callback(null);
    //     },
    //     createUser:['getValues','accessToken','checkmail','genrateOtp',function(callback){
    //         if(flag == 1){
    //             logger.debug("=========in the create user ===============")
    //             var randomize = require('randomatic');
	// 			let  user_created_id =  randomize('A0', 30);
	// 			console.log("===11111111111=uuid=====",user_created_id);
    //             var sql = "insert into user (email,device_token,device_type,latitude,longitude,password,access_token,otp_verified,user_created_id,mobile_no, country_code,otp)values(?,?,?,?,?,?,?,?,?,?,?,?)";
    //             var sts = multiConnection[req.dbName].query(sql, [email,device_token,device_type,latitude,longitude,password,accessToken,0,user_created_id,mobileNumber,countryCode,otp], function (err, result) {
    //                 if (err) {
    //                     logger.debug("======error in create user ==============",err,sts.sql)
    //                     var msg = "db error"
    //                     sendResponse.sendErrorMessage(msg,res,500);
    //                 }
    //                 else {
    //                     details.id = result.insertId;
    //                     details.firstname = result[0].firstname;
    //                     details.access_token = accessToken;
    //                     // details.referral_link=result[0].referral_link;
    //                     details.email = email;
    //                     details.otp_verified = 0;
    //                     details.mobile_no = mobileNumber;
    //                     details.country_code = countryCode;                                
    //                     details.existingRecord = false;
    //                     details.test = countryCode+mobileNumber;
    //                     callback(null, result);
    //                 }
    //             })
    //         }else{
           
    //             callback(null);
    //         }
    //     }],
    //     sendOtp:['createUser',async function(callback){
    //         let twilioata=await Universal.getTwilioData(request.dbName);
    //         let OtpVerification = await Universal.disableOtpVerification(request.dbName);
    //         logger.debug("=========TWilio==DATA!=========>>",twilioata,Object.keys(twilioata).length);
    //         if(OtpVerification && OtpVerification.length>0){
    //             otp= 12345;
    //             callback(null);
    //         }else{
    //             if(Object.keys(twilioata).length>0 ){
    //                 var client = require('twilio')(twilioata[config.get("twilio.s_id")],twilioata[config.get("twilio.auth_key")]);
    //                 var smsOptions = {
    //                     from: twilioata[config.get("twilio.number_key")],
    //                     To: countryCode + mobileNumber.toString(),
    //                     Body: "Hi there, Your One Time Password is : "+otp
    //                 };
    //                 client.messages.create(smsOptions, function (err, message) {
    //                     logger.debug("=========Twilio==ER!==",err,message)
    //                     callback(null);
    //                 });
    //             }
    //             else{
    //                 otp = 12345;
    //                 callback(null);
    //             }
    //         }


    //     }],
    //     updateOTPUser:['sendOtp',function(callback){
    //         var sql = "update user set otp_verified=0,access_token=?,otp = ? ,device_token = ?,device_type = ? where mobile_no = ? ";
    //         multiConnection[req.dbName].query(sql, [accessToken,otp,device_token,device_type,mobileNumber], function (err, result) {
    //           console.log("***************err*********result.....",err,result);
    //                 if (err) {
    //                     var msg = "db error"
    //                     sendResponse.sendErrorMessage(msg,res,500);
    //                 }
    //                 else {                       
    //                     callback(null);
    //                 }
    //             })
            
    //     }],     
    // },function(err,result){
    //     if(err) {
    //         var msg = err;
    //         sendResponse.sendErrorMessage(msg,res,500);
    //     }else{
    //         sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res,200);
    //     }
    // })
}