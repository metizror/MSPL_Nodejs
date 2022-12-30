"use strict"
var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
const smsManager = require('../../lib/smsManager')

var func = require('../../routes/commonfunction');
var consts = require('./../../config/const')
const uploadMgr = require('../../lib/UploadMgr')
const lib = require('../../lib/NotificationMgr')
var _ = require('underscore');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
let Execute = require('../../lib/Execute');
const randomstring = require("randomstring");
const common = require('../../common/agent')
let Universal = require('../../util/Universal')
var randomEmail = require('random-email');
const moment = require('moment');
let web_request = require('request')
const emailTemplates = require('../../lib/templates/emailTemplates');
const model = require('../../Model/')
var constant = require('../../routes/constant');
var emailTemp = require('../../routes/email');
let randomize = require('randomatic');
/**
 * @desc used for set an default addres of user
 * @param {*} req 
 * @param {*} res 
 */
const setDefaultAddress = async (req, res) => {
    try {
        let add_id = req.body.id;
        await Execute.Query(req.dbName, "update user_address set is_default=1 where id=" + add_id + "", [])
        await Execute.Query(req.dbName, "update user_address set is_default=0 where id!=" + add_id + "", [])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.error(err)
        return sendResponse.sendErrorMessage(err, res, 400);
    }
}

/**
 * @desc used for set an user NHS 
 * @param {*} req 
 * @param {*} res 
 */
const setNhsStatus = async (req, res) => {
    try {
        let user_id = req.body.id;
        let nhs_status = req.body.nhs_status == undefined ? 0 : req.body.nhs_status
        await Execute.Query(req.dbName, "update user set nhs_status=? where id=? ", [nhs_status, user_id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.error(err)
        return sendResponse.sendErrorMessage(err, res, 400);
    }
}
/**
 * @description used for registration by apple id
 * @param {*Object} req 
 * @param {*Object} res 
 */
const newRegistration = async (req, res) => {
    let apple_id = req.body.apple_id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let longitude = req.body.longitude;
    let latitude = req.body.latitude;
    let device_token = req.body.deviceToken
    let notification_language = req.body.languageId;
    let referralCode_1 = "REF-" + randomstring.generate({
        length: 5,
        charset: 'alphabetic'
    }).toUpperCase();
    let details = {};
    try {
        let result = await alreadyExist(req.dbName, apple_id);
        if (result && result.length > 0) {
            await Execute.Query(req.dbName, "update user set device_token=? where id=?", [device_token, result[0].id]);
            details.email = result[0].email;
            if (req.dbName == "rushdelivery_0598" && result[0].email == "") {
                details.email = result[0].apple_id;
            }
            /**
             * ------new change for fula-------\
             */
            if (req.dbName == "fulalive_0857" && result[0].apple_id) {
                details.apple_id = result[0].apple_id
            }
            if (result[0].apple_id) {
                details.apple_id = result[0].apple_id
            }
            /**
             * end
             */
            details.id = result[0].id
            details.referral_link = result[0].referral_link;
            // details.mobile_no = result[0].mobile_no;
            details.first_name = result[0].firstname;
            if (result[0].referral_id != null && result[0].referral_id != undefined && result[0].referral_id != "") {
                details.referral_id = result[0].referral_id;
            }
            else {
                await Execute.Query(req.dbName, "update user set referral_id=? where id=?", [referralCode_1, result[0].id]);
                details.referral_id = referralCode_1;
            }

            details.last_name = result[0].lastname;
            details.access_token = result[0].access_token;
            details.device_token = result[0].device_token;
            details.user_image = result[0].user_image;
            details.user_created_id = result[0].user_created_id;
            details.otp_verified = result[0].otp_verified;
            details.customer_payment_id = result[0].customer_payment_id
            logger.debug("======DETAIL==", details)
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }
        else {
            var randomize = require('randomatic');
            let user_created_id = randomize('A0', 30);
            console.log("===11111111111=uuid=====", user_created_id);
            let access_token = func.encrypt(apple_id + new Date());
            let insert = await Execute.Query(req.dbName, "insert into user (`is_active`,`notification_language`,`device_token`,`latitude`,`longitude`,`email`,`firstname`,`lastname`,`apple_id`,`access_token`,`otp_verified`,`referral_id`,`user_created_id`) values (?,?,?,?,?,?,?,?,?,?,?,?,?)", [
                1,
                notification_language,
                device_token,
                latitude,
                longitude,
                email,
                first_name,
                last_name,
                apple_id,
                access_token,
                0,
                referralCode_1,
                user_created_id
            ])
            logger.debug("======RESULT===>", insert);



            let sResult = await Execute.Query(req.dbName, "select * from user where id=?", [insert.insertId])
            details.email = sResult[0].email;

            if (req.dbName == "rushdelivery_0598" && result[0].email == "") {
                details.email = result[0].apple_id;
            }
            /**
             * change for fula alive
             */
            if (req.dbName == 'fulalive_0857' && sResult[0].apple_id) {
                //details.is_login_with_apple_id = 1
                details.apple_id = sResult[0].apple_id

            }

            // details.mobile_no = result[0].mobile_no;
            details.referral_link = sResult[0].referral_link;
            details.mobile_no = sResult[0].mobile_no;
            details.referral_id = sResult[0].referral_id;
            details.otp_verified = sResult[0].otp_verified;
            details.id = sResult[0].id;
            details.firstname = sResult[0].firstname + sResult[0].lastname
            details.access_token = sResult[0].access_token;
            details.user_created_id = sResult[0].user_created_id;
            details.customer_payment_id = sResult[0].customer_payment_id

            details.gender = sResult[0].gender;
            details.user_image = sResult[0].user_image;
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    }
    catch (Err) {
        logger.debug("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }

}

const alreadyExist = (dbName, apple_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user_data = await Execute.Query(dbName, "select customer_payment_id,user_created_id,referral_id,referral_link,user_image,id,otp_verified,id,apple_id,access_token,device_token,firstname,lastname,email from user where apple_id=?", [apple_id])
            resolve(user_data);
        }
        catch (err) {
            reject(err)
        }
    })
}
const getMyReferralData = async (req, res) => {
    try {

        var bothGetRefferal = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ["refer_both"]);

        if (bothGetRefferal && bothGetRefferal.length > 0 && bothGetRefferal[0].value == 1) {

            var referredUsersByMe = await Execute.Query(req.dbName, `select ur.receive_price,ur.given_price,us.user_image,us.firstname,us.lastname,us.email,us.mobile_no,us.country_code from user
                us join user_referral as ur on us.id =ur.to_id where (ur.from_id=? or  ur.to_id = ?  )    and ur.ready_for_use=?`, [req.users.id, req.users.id, 1]);
        }
        else {
            var referredUsersByMe = await Execute.Query(req.dbName, `select ur.receive_price,ur.given_price,us.user_image,us.firstname,us.lastname,us.email,us.mobile_no,us.country_code from user
              us join user_referral as ur on us.id =ur.to_id where ur.from_id=? and ur.ready_for_use=?`, [req.users.id, 1]);

        }
        sendResponse.sendSuccessData({ referalData: referredUsersByMe }, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.debug("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }
}
/**
 * @desc used for getting an getting an refferalAmonut
 * @param {*Object} req 
 * @param {*Object} res 
 */
const myReferralAmount = async (req, res) => {
    let referalAmount = 0;
    try {
        let referralFeatureData = await Execute.Query(req.dbName, "select * from tbl_setting where `key`=? and `value`=?", ["referral_feature", "1"])
        if (referralFeatureData && referralFeatureData.length > 0) {
            referalAmount = await Universal.getUserLeftReferralAmount(req.dbName, req.users.id);
        }
        sendResponse.sendSuccessData({ referalAmount: referalAmount }, constant.responseMessage.SUCCESS, res, 200);
    } catch (err) {
        logger.debug("==ER!==", err)
        return sendResponse.sendErrorMessage(err, res, 400);
    }
}

const newRegistrationuser = async (req, res) => {
    let apple_id = req.body.apple_id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email || ""; //
    let longitude = req.body.longitude || 0;
    let latitude = req.body.latitude || 0;
    let device_token = req.body.deviceToken
    let device_type = req.body.deviceType;
    let is_otp_verifed = 0;
    let password = req.body.password == "12345" ? randomstring.generate({
        length: 6,
        charset: 'alphabetic'
    }).toUpperCase() : req.body.password;
    let _otpVerificationDisabled = await Universal.disableOtpVerification(req.dbName);

    is_otp_verifed = _otpVerificationDisabled && _otpVerificationDisabled.length > 0 ? 1 : 0;
    let emailPwd = password
    let address = req.body.address;
    let accessToken = "";
    let referralCode_1 = "REF-" + randomstring.generate({
        length: 5,
        charset: 'alphabetic'
    }).toUpperCase();
    let referralCode = req.body.referralCode
    let details = {};
    let flag = 1;
    let notification_language = req.body.languageId;
    let countryCode = req.body.countryCode;
    let mobileNumber = req.body.mobileNumber;
    let otp;
    let image = ""


    if (email == "") {
        accessToken = func.encrypt(email + new Date());;
    } else {
        accessToken = func.encrypt(countryCode + mobileNumber + new Date());;

    }
    let abn_number = req.body.abn_number == undefined ? "" : req.body.abn_number
    let business_name = req.body.business_name == undefined ? "" : req.body.business_name
    let dateOfBirth = req.body.dateOfBirth !== undefined ? req.body.dateOfBirth : ""

    try {

        await checkEmailAlreadyExist(req.dbName, email, res);
        await checkPhoneAlreadyExist(req.dbName, mobileNumber, res)
        if (req.files && req.files.profilePic) {
            image = await uploadMgr.uploadImageFileToS3BucketNew(req.files.profilePic);
        }
        otp = Math.floor(Math.random() * 90000) + 10000;
        otp = _otpVerificationDisabled && _otpVerificationDisabled.length > 0 ? 12345 : otp;

        let twilioata = await Universal.getTwilioData(req.dbName);
        let messagebirddata = await Universal.getmessagebirdkey(req.dbName);
        logger.debug("=========TWilio==DATA!=========>>", twilioata, Object.keys(twilioata).length);
        password = md5(password);

        let user_created_id = randomize('A0', 30);
        let insertId = await saveUser(req.dbName, referralCode_1,
            email, device_token, device_type, latitude,
            longitude, password, accessToken, is_otp_verifed, user_created_id,
            countryCode, mobileNumber, otp, image, first_name, abn_number, business_name, dateOfBirth);

        await referralCodeCheck(req.dbName, referralCode, insertId, countryCode, mobileNumber)
        let rides_registeration_input = {
            email: email,
            language_id: 1,
            access_token: accessToken,
            fcm_id: device_token,
            name: first_name,
            phone_code: countryCode,
            phone_number: mobileNumber,
            device_type: device_type ? "Ios" : "android",
            address: "chandigarh",
            latitude: req.body.latitude != undefined ? req.body.latitude : 30.7333,
            longitude: req.body.longitude != undefined ? req.body.longitude : 76.7794,
            gender: "male",
            timezone: req.body.zone_offset != undefined && req.body.zone_offset !== "" && req.body.zone_offset != null ? req.body.zone_offset : "+05:30",
            profile_pic: image
        }
        let rideRegistrationEnable = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ['ride_registeration']);
        logger.debug("====rideRegistrationEnable=", rideRegistrationEnable)
        if (rideRegistrationEnable && rideRegistrationEnable.length > 0) {
            let baseUrlRideData = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ['ride_base_url'])
            let dbSecretKeyData = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ['ride_db_secret_key']);
            let dbSecretKey = dbSecretKeyData && dbSecretKeyData.length > 0 ? dbSecretKeyData[0].value : "";
            let baseUrl = baseUrlRideData && baseUrlRideData.length > 0 ? baseUrlRideData[0].value : config.get("server.rides.api_link");
            logger.debug("======baseUrlRideData==baseUrl==dbSecretKey=>>", baseUrlRideData, baseUrl, dbSecretKey);
            if (parseInt(rideRegistrationEnable[0].value) == 1) {
                await common.ridesRegisteration(baseUrl, rides_registeration_input, dbSecretKey);
            }

        }

        if (Object.keys(messagebirddata).length > 0) {
            var messagebird = require('messagebird')(messagebirddata[config.get("messagebird.bird_key")]);


            var params = {
                'originator': 'MSGBRD',
                'recipients': [
                    countryCode + mobileNumber.toString().replace(/\s/g, '')
                ],
                'body': "Hi there, Your One Time Password is : " + otp
            };

            messagebird.messages.create(params, function (err, response) {
                if (err) {
                    return console.log(err);
                }
                console.log(response, "responseresponse");


            });


        }
        if (Object.keys(twilioata).length > 0 && req.body.password != "12345") {
            await sendOtp(twilioata, countryCode, mobileNumber, otp);
        }
        let twilioAuthyData = await Universal.getTwilioAuthyData(req.dbName);
        let twilio_authy_id = "";
        if (Object.keys(twilioAuthyData).length > 0) {
            let authyData = {
                email: email,
                phone: mobileNumber,
                country_code: countryCode,
            };
            console.log("$$$$$$$$$$", authyData);
            let userAuthy = await smsManager.createAuthyUser(
                twilioAuthyData.authy_production_key,
                authyData
            );
            console.log("Authy wala user", userAuthy);

            if (userAuthy) {
                twilio_authy_id = userAuthy.user.id;
            }

            let sendOtp = await smsManager.sendToken(
                twilioAuthyData.authy_production_key,
                userAuthy.user.id
            );
            console.log("&&&&&&&&&&", sendOtp);
            await Execute.Query(req.dbName, "update user set twilio_authy_id=? where id=?", [twilio_authy_id, insertId])

        }

        if (req.body.password == "12345") {
            await Execute.Query(req.dbName, "update user set is_active=1 where id=?", [insertId])
        }
        var documents = req.files != undefined ? req.files.documents : [];
        logger.debug("=====", req.files)
        let documentString = ""
        if (req && req.files && req.files.documents) {
            if (documents && documents.length > 0) {
                for (let i = 0; i < documents.length; i++) {
                    let document = await uploadMgr.uploadImageFileToS3BucketNew(documents[i])
                    documentString = documentString + document + "#"
                    logger.debug("============", documentString)
                }
            }
            else {
                let document = await uploadMgr.uploadImageFileToS3BucketNew(req.files.documents)
                documentString = documentString + document + "#"
            }
            documentString = documentString.slice(0, documentString.length - 1)
            logger.debug("=documentString====>>", documentString);
            await Execute.Query(req.dbName, "update user set documents=? where id=?", [documentString, insertId]);
        }
        emailTemp.userRegister(req, res, "", first_name, emailPwd, email, notification_language, {}, function (err, result) {
            if (err) {
                console.log("..****register email*****....", err);
            }
        })
        // enable_vendor_order_creation
        let enable_vendor_order_creation = await Execute.Query(req.dbName,
            "select `key`,value from tbl_setting where `key`=? and value=1",
            ["enable_vendor_order_creation"]
        )


        if (enable_vendor_order_creation && enable_vendor_order_creation.length > 0) {
            let sql = "insert into user_address (name,user_id,customer_address,latitude,longitude)values(?,?,?,?,?) ";
            let params = [first_name, insertId, address, latitude, longitude];
            let addressdata = await Execute.Query(req.dbName, sql, params);

            sendResponse.sendSuccessData(
                { access_token: accessToken, userId: insertId, deliveryId: addressdata.insertId },
                constant.responseMessage.SUCCESS, res, 200);

        } else {
            sendResponse.sendSuccessData(
                { access_token: accessToken, userId: insertId },
                constant.responseMessage.SUCCESS, res, 200);
        }


    }
    catch (Err) {
        logger.debug("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }
}
/**
 * @desc used for register user from phone nummber
 * @param {*Object} req 
 * @param {*Object} res 
 */
const registerByPhone = async (req, res) => {
    let name = req.body.name || "";
    let email = randomEmail({ domain: 'royo.com' });
    let longitude = 0;
    let latitude = 0;
    let deviceToken = req.body.deviceToken
    let deviceType = req.body.deviceType

    var generatedText = "";
    var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for (var i = 0; i < 6; i++) {
        generatedText += text.charAt(Math.floor((Math.random() * text.length)));
    }
    // password=generatedText;
    let password = req.body.password || generatedText;
    let accessToken = func.encrypt(email + new Date());;
    let myReferralCode = "REF-" + randomstring.generate({
        length: 5,
        charset: 'alphabetic'
    }).toUpperCase();
    let languageId = req.body.languageId;
    let countryCode = req.body.countryCode;
    let mobileNumber = req.body.mobileNumber;
    let userId = 0;
    let fullNumber = countryCode + mobileNumber;
    let isAlreadyRegistered = 0
    const request = req;
    try {



        let otp = Math.floor(Math.random() * 90000) + 10000;
        // otp=12345;
        password = md5(password);
        var randomize = require('randomatic');
        let userCreatedId = randomize('A0', 30);

        await checkPhoneAlreadyExist(req.dbName, mobileNumber, res);

        let phoneData = await Execute.Query(req.dbName, "select id,customer_payment_id,squareup_cust_id,braintree_customer_id,peach_customer_id,user_created_id,id,otp,country_code,mobile_no from `user` where country_code=? and mobile_no=?", [countryCode, mobileNumber]);

        let WhatsOtpData = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ["whatsup_sent_otp_flag"]);

        console.log("==WhatsOtpData==fullNumber==>>", fullNumber.replace(/\D/g, ""))
        phoneData = await Execute.Query(req.dbName, "select customer_payment_id,squareup_cust_id,braintree_customer_id,peach_customer_id,user_created_id,id,otp,country_code,mobile_no,email from `user` where country_code=? and mobile_no=? ", [countryCode, mobileNumber]);
        let twilioata = await Universal.getTwilioData(req.dbName);
        let muthofunData = await Universal.getMuthoFunData(req.dbName);
        let message = "Hi there, Your OTP is : " + otp;
        console.log("=========TWilio==DATA!==At==Phone==REg===>>", twilioata, Object.keys(twilioata).length);

        if (Object.keys(muthofunData).length > 0) {
            var options = {
                method: 'GET',
                url: "http://clients.muthofun.com:8901/esmsgw/sendsms.jsp?user=" + muthofunData["muthofun_username"] + "&password=" + muthofunData["muthofun_password"] + "&mobiles=" + countryCode + mobileNumber.toString() + "&sms=" + message + "&unicode=1"
            };
            web_request(options, function (err, body) {
                console.log("==Muthofun==SMS=Err===>>", err)
            })
        }
        else {
            if (Object.keys(twilioata).length > 0) {
                var client = require('twilio')(twilioata[config.get("twilio.s_id")], twilioata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twilioata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString(),
                    body: "Hi there, Your OTP for " + request.business_name + " is : " + otp
                };
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                });
            }
        }
        if (WhatsOtpData && WhatsOtpData.length > 0) {
            if (parseInt(WhatsOtpData[0].value) == 1) {
                var options = {
                    method: 'POST',
                    url: "http://dingo-284215.rj.r.appspot.com/api/v1/message/recovery",
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer AZI4uTSHNXVBgdCmHoMbrez2OpSdzQsc',
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json'
                    },
                    body: {
                        phone: mobileNumber,
                        nickname: name,
                        phone: fullNumber.replace(/\D/g, "")
                    },
                    json: true
                };
                web_request(options, function (error, response, body) {
                    console.log("=====WhatsUp=SednOtp=====", body)

                });
            }

        }

        let twilioAuthyData = await Universal.getTwilioAuthyData(req.dbName);

        let twilio_authy_id = "";
        if (Object.keys(twilioAuthyData).length > 0) {

            let authyData = {
                email: email,
                phone: mobileNumber,
                country_code: countryCode,
            };
            console.log("$$$$$$$$$$", authyData);
            let userAuthy = await smsManager.createAuthyUser(
                twilioAuthyData.authy_production_key,
                authyData
            );
            console.log("Authy wala user", userAuthy);

            if (userAuthy) {
                twilio_authy_id = userAuthy.user.id;
            }

            let sendOtp = await smsManager.sendToken(
                twilioAuthyData.authy_production_key,
                userAuthy.user.id
            );
            console.log("&&&&&&&&&&", sendOtp);
            //    callback(null);

        }



        if (phoneData && phoneData.length > 0) {
            await Execute.Query(req.dbName, "update `user` set otp=?,device_token=?,device_type=?,latitude=?,longitude=?,twilio_authy_id=? where id=?", [otp, deviceToken, deviceType, latitude, longitude, twilio_authy_id, phoneData[0].id])
            userCreatedId = phoneData[0].user_created_id;
            userId = phoneData[0].id
            isAlreadyRegistered = 1

        }
        else {
            let insertedId = await saveUserData(req.dbName, myReferralCode, email, deviceToken, deviceType, latitude,
                longitude, password, accessToken, 0, userCreatedId,
                countryCode, mobileNumber, otp, "", name, twilio_authy_id);
            userId = insertedId
        }

        sendResponse.sendSuccessData(
            {
                // customer_payment_id: phoneData[0].customer_payment_id==null?'':phoneData[0].customer_payment_id,
                // squareup_cust_id:phoneData[0].squareup_cust_id==null?'':phoneData[0].squareup_cust_id,
                // braintree_customer_id:phoneData[0].braintree_customer_id,
                // peach_customer_id:phoneData[0].peach_customer_id,
                userCreatedId: userCreatedId,
                isAlreadyRegistered: isAlreadyRegistered,
                accessToken: accessToken
            }, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        console.log("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }
}
/**
 * @desc used for register user from phone nummber
 * @param {*Object} req 
 * @param {*Object} res 
 */
const resendUserOtp = async (req, res) => {
    let userCreatedId = req.body.userCreatedId;
    try {
        let otp = Math.floor(Math.random() * 90000) + 10000;
        otp = 12345;
        let userData = await Execute.Query(req.dbName, "select firstname,user_created_id,id,otp,country_code,mobile_no from `user` where user_created_id=?", [userCreatedId]);
        if (userData && userData.length > 0) {
            let mobileNumber = userData[0].mobile_no;
            let countryCode = userData[0].country_code;
            let fullNumber = countryCode + mobileNumber;
            let name = userData[0].firstname || ""
            await Execute.Query(req.dbName, "update `user` set otp=? where id=?", [otp, userData[0].id])
            let WhatsOtpData = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ["whatsup_sent_otp_flag"]);
            logger.debug("==WhatsOtpData==fullNumber==>>", fullNumber.replace(/\D/g, ""));
            let twilioata = await Universal.getTwilioData(req.dbName);
            let muthofunData = await Universal.getMuthoFunData(req.dbName);
            let message = "Hi there, Your One Time Password is : " + otp;
            logger.debug("=========TWilio==DATA!==At==Phone==REg===>>", twilioata, Object.keys(twilioata).length);
            if (Object.keys(muthofunData).length > 0) {
                var options = {
                    method: 'GET',
                    url: "http://clients.muthofun.com:8901/esmsgw/sendsms.jsp?user=" + muthofunData["muthofun_username"] + "&password=" + muthofunData["muthofun_password"] + "&mobiles=" + countryCode + mobileNumber.toString() + "&sms=" + message + "&unicode=1"
                };
                web_request(options, function (err, body) {
                    logger.debug("==Muthofun==SMS=Err===>>", err)
                })
            }
            else {
                if (Object.keys(twilioata).length > 0) {
                    var client = require('twilio')(twilioata[config.get("twilio.s_id")], twilioata[config.get("twilio.auth_key")]);
                    var smsOptions = {
                        from: twilioata[config.get("twilio.number_key")],
                        to: countryCode + mobileNumber.toString(),
                        body: "Hi there, Your One Time Password for " + request.business_name + " is : " + otp
                    };
                    client.messages.create(smsOptions, function (err, message) {
                        logger.debug("=========Twilio==ER!==", err, message)
                    });
                }
            }
            if (WhatsOtpData && WhatsOtpData.length > 0) {
                if (parseInt(WhatsOtpData[0].value) == 1) {
                    var options = {
                        method: 'POST',
                        url: "http://dingo-284215.rj.r.appspot.com/api/v1/message/recovery",
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': 'Bearer AZI4uTSHNXVBgdCmHoMbrez2OpSdzQsc',
                            'Cache-Control': 'no-cache',
                            'Content-Type': 'application/json'
                        },
                        body: {
                            phone: mobileNumber,
                            nickname: name,
                            phone: fullNumber.replace(/\D/g, "")
                        },
                        json: true
                    };
                    web_request(options, function (error, response, body) {
                        logger.debug("=====WhatsUp=SednOtp=====", body)

                    });
                }

            }

        }



        sendResponse.sendSuccessData({ userCreatedId: userCreatedId }, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.debug("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }
}


/**
 * @desc used for register user from phone nummber
 * @param {*Object} req 
 * @param {*Object} res 
 */
const sendContactUsEmail = async (req, res) => {
    let methodName = "resendUserOtp";
    try {
        let emailId = req.body.emailId;
        let phoneNumber = req.body.phoneNumber;
        let countryCode = req.body.countryCode;

        const adminDetails = await getDefaultAdminDetails(req.dbName);
        let colorThemeData = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=?", ["theme_color"]);
        let colorTheme = colorThemeData && colorThemeData.length > 0 ? colorThemeData[0].value : "#e84b58"

        let smtpData = await Universal.smtpData(req.dbName);


        const emailTemplate = await emailTemplates.contactUsEmail(
            req.business_name,
            colorTheme,
            req.logo_url,
            emailId,
            phoneNumber,
            countryCode)


        await func.sendMailthroughSMTPWithPromises(
            smtpData,
            res,
            emailTemplate.subject,
            adminDetails[0].email,
            emailTemplate.template,
            0)


        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (erorr) {
        logger.debug({ methodName: methodName, erorr: erorr });
        return sendResponse.sendErrorMessage(erorr, res, 400)
    }
}

const getDefaultAdminDetails = (dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = "select email,phone_number,iso,country_code from admin order by id asc limit 1";
            let params = []
            let result = await Execute.Query(dbName, sql, params);
            resolve(result);

        } catch (e) {
            logger.debug("+===============e=======", e);
            resolve([])
        }
    })

}




/**
 * @desc used for update an user name
 * @param {*Object} req 
 * @param {*Object} res 
 */
const updateUserName = async (req, res) => {
    let userCreatedId = req.body.userCreatedId;
    let name = req.body.name || "";
    try {
        await Execute.Query(req.dbName, "update `user` set firstname=? where user_created_id=?", [name, userCreatedId])
        sendResponse.sendSuccessData({ name: name }, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.debug("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }
}
/**
 * @desc used for verify otp sent on phone nummber
 * @param {*Object} req 
 * @param {*Object} res 
 */
const verifyOtp = async (req, res) => {
    let userCreatedId = req.body.userCreatedId;
    let otp = req.body.otp;
    let languageId = req.body.languageId || 14
    try {
        // let otp =  Math.floor(Math.random()*90000) + 10000;
        let userData = await Execute.Query(req.dbName, "select firstname,email,access_token,user_created_id,id,otp,country_code,mobile_no from `user` where user_created_id=? and otp=?", [userCreatedId, otp]);
        if (userData && userData.length > 0) {
            let accessToken = func.encrypt(userData[0].email + new Date());
            await Execute.Query(req.dbName, "update `user` set access_token=?,otp_verified = ?,is_active = ? where id=?", [accessToken, 1, 1, userData[0].id])
            sendResponse.sendSuccessData({ accessToken: accessToken, name: userData[0].firstname, mobile_no: userData[0].mobile_no, country_code: userData[0].country_code }, constant.responseMessage.SUCCESS, res, 200);
        }
        else {
            if (languageId == 14) {
                var msg = "invalid otp";
                return sendResponse.sendErrorMessage(msg, res, 400);
            } else {
                var msg = " غير صالحةمكتب المدعي العام  ";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
        }
    }
    catch (Err) {
        logger.debug("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }
}
const sendOtp = (twilioata, countryCode, mobileNumber, otp) => {
    return new Promise(async (resolve, reject) => {
        var client = require('twilio')(twilioata[config.get("twilio.s_id")], twilioata[config.get("twilio.auth_key")]);
        var smsOptions = {
            from: twilioata[config.get("twilio.number_key")],
            to: countryCode + mobileNumber.toString(),
            body: "Hi there, Your One Time Password is : " + otp
        };
        client.messages.create(smsOptions, function (err, message) {
            logger.debug("=========Twilio==ER!==", err)
            resolve();
        });
    })
}

/**
 * @desc used for banners listing
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getAllBanners = async (req, res) => {
    let latitude = req.query.latitude;
    let longitude = req.query.longitude;
    let offset = req.query.offset || "+05:30";
    let categoryId = req.query.categoryId || 0
    try {
        let bannersList = await getBanners(req.dbName, res, latitude, longitude,
            offset, categoryId);
        sendResponse.sendSuccessData(bannersList, constant.responseMessage.SUCCESS, res, 200);

    }
    catch (Err) {
        logger.debug("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }
}

async function getBanners(dbName, res, latitude,
    longitude, offset, categoryId) {
    let mUnit = await Universal.getMeausringUnit(dbName);
    logger.debug("==offset======offset===offset===", offset)
    var current_time = moment().utcOffset(offset).format('YYYY-MM-DD');

    if (parseInt(categoryId) == 0) {
        var sql = "select s.delivery_radius,s.name as supplier_name,a.id,a.flow_banner_type,cc.type,cc.menu_type,cc.name as category_name, cc.category_order, cc.supplier_placement_level, cc.category_flow,a.category_id, a.banner_type,a.branch_id, a.category_id, IF((select count(*) from categories where parent_id = a.category_id),1,0) as is_subcategory, a.phone_image,"
        sql += "a.website_image,a.name, a.supplier_id, a.branch_id,(" + mUnit + " * acos (cos (radians(" + latitude + ")) * cos(radians(sb.latitude))* cos("
        sql += "radians(sb.longitude) - radians(" + longitude + ")) + sin (radians(" + latitude + "))* sin(radians(sb.latitude)))) AS distance  from advertisements a "
        sql += "left join supplier_branch sb on sb.id = a.branch_id join categories cc on cc.id = a.category_id join supplier s on s.id = a.supplier_id where a.is_active = 1 and  s.is_active = 1  and s.is_deleted = 0 and a.advertisement_type = 0 and "
        sql += "a.is_deleted = ?   and ((DATE(a.start_date) <= '" + current_time + "' and DATE(a.end_date) >= '" + current_time + "') or( DATE(a.start_date) = '0000-00-00' and DATE(a.end_date) = '0000-00-00' )) and sb.is_deleted = ? and cc.is_live = ? GROUP BY name having s.delivery_radius>=distance ORDER BY a.orders DESC"

    }
    else {
        var sql = "select s.delivery_radius,s.name as supplier_name,a.id,a.flow_banner_type,cc.type,cc.menu_type,cc.name as category_name, cc.category_order, cc.supplier_placement_level, cc.category_flow,a.category_id, a.banner_type,a.branch_id, a.category_id, IF((select count(*) from categories where parent_id = a.category_id),1,0) as is_subcategory, a.phone_image,"
        sql += "a.website_image,a.name, a.supplier_id, a.branch_id,(" + mUnit + " * acos (cos (radians(" + latitude + ")) * cos(radians(sb.latitude))* cos("
        sql += "radians(sb.longitude) - radians(" + longitude + ")) + sin (radians(" + latitude + "))* sin(radians(sb.latitude)))) AS distance  from advertisements a "
        sql += "left join supplier_branch sb on sb.id = a.branch_id join categories cc on cc.id = a.category_id join supplier s on s.id = a.supplier_id where a.is_active = 1 and  s.is_active = 1  and s.is_deleted = 0 and a.advertisement_type = 0 and "
        sql += "a.is_deleted = ?   and ((DATE(a.start_date) <= '" + current_time + "' and DATE(a.end_date) >= '" + current_time + "') or( DATE(a.start_date) = '0000-00-00' and DATE(a.end_date) = '0000-00-00' )) and sb.is_deleted = ? and cc.is_live = ? and cc.id=" + categoryId + " GROUP BY name having s.delivery_radius>=distance ORDER BY a.orders DESC"

    }

    try {
        return new Promise(async (resolve, reject) => {
            let result = await Execute.Query(dbName, sql, [0, 0, 1]);
            resolve(result);
        })
    }
    catch (Err) {
        logger.debug("===Err!=", Err)
        var msg = "something went wrong";
        sendResponse.sendErrorMessage(msg, res, 500);
    }
}

const uploadProfilePic = (profilePic, reply) => {
    return new Promise(async (resolve, reject) => {
        var folder = "abc";
        func.uploadImageFileToS3BucketSupplier(reply, profilePic, folder, function (err, result) {
            if (err) {
                var msg = "db error :";
                return sendResponse.sendErrorMessage(msg, reply, 500);
            } else {
                resolve(result);
            }
        });
    })
}

const referralCodeCheck = (dbName, referralCode, user_id, countryCode, mobileNumber) => {
    return new Promise(async (resolve, reject) => {
        if (referralCode != "" && referralCode != undefined) {
            console.log("herehererefferal")
            let receivePriceData = await Universal.getRecieverReferralPrice(dbName);
            let givePriceData = await Universal.getGivenReferralPrice(dbName);
            let referralUserData = await Execute.Query(dbName, "select id,email from user where referral_id=?", [referralCode])
            console.log(referralUserData, "referralUserDatareferralUserData")
            if (referralUserData && referralUserData.length > 0) {
                let usedDupEmailPhone = await Execute.Query(dbName, `select * from user join user_referral 
                    on user_referral.to_id=user.id where user_referral.from_id=? and user.country_code=? and user.mobile_no=?`,
                    [referralUserData[0].id, countryCode, mobileNumber]);
                if (usedDupEmailPhone && usedDupEmailPhone.length > 0) {
                    let msg = "Sorry you have already used this referral code "
                    return sendResponse.sendErrorMessage(msg, reply, 400);
                } else {
                    console.log("refeeral else")
                    let insertSqlQuery = `insert into user_referral(from_id,to_id,given_price,receive_price) values(?,?,?,?)`
                    await Execute.Query(dbName, insertSqlQuery, [referralUserData[0].id, user_id, givePriceData, receivePriceData])
                    resolve();
                }
            } else {
                let msg = "Sorry invalid referral code "
                return sendResponse.sendErrorMessage(msg, reply, 400);
            }
        } else {
            resolve();
        }
    })
}

const saveUser = (dbName, referralCode, email, device_token, device_type,
    latitude, longitude, password, accessToken, otp_verified, user_created_id,
    country_code, mobile_no, otp, image, name, abn_number, business_name, dateOfBirth) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "insert into user (referral_id,email,device_token,device_type,latitude,longitude,password,access_token,otp_verified,user_created_id,country_code,mobile_no,otp,user_image,firstname,abn_number,business_name,dateOfBirth)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            let params = [referralCode, email, device_token, device_type, latitude, longitude, password, accessToken, otp_verified, user_created_id, country_code, mobile_no, otp, image, name, abn_number, business_name, dateOfBirth];
            let result = await Execute.Query(dbName, query, params);
            resolve(result.insertId)
        } catch (err) {
            logger.debug(err)
            reject(err)
        }
    })

}
const saveUserData = (dbName, referralCode, email, device_token, device_type,
    latitude, longitude, password, accessToken, otp_verified, user_created_id,
    country_code, mobile_no, otp, image, name, twilio_authy_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = `insert into user (braintree_customer_id,is_sweetoo,loyalty_points,
                email_verified,is_logged_in,area_id,fb_access_token,gender,lastname,phone_no,
                is_deleted,is_verified,old_mobile_no,is_active,referral_id,email,device_token,
                device_type,latitude,longitude,password,access_token,otp_verified,user_created_id,
                country_code,mobile_no,otp,user_image,firstname,twilio_authy_id)
                values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            let params = ["", 0, 0, 1, 0, 0, "", 0, "", mobile_no, 0, 0, "", 0, referralCode, email, device_token,
                device_type, latitude, longitude, password, accessToken, otp_verified, user_created_id,
                country_code, mobile_no, otp, image, name, twilio_authy_id];
            let result = await Execute.Query(dbName, query, params);
            resolve(result.insertId)
        } catch (err) {
            logger.debug(err)
            reject(err)
        }
    })

}
const checkEmailAlreadyExist = (dbName, email_id, res) => {
    return new Promise(async (resolve, reject) => {
        let query = "select id from user where email=? and is_deleted=0"
        let params = [email_id]
        let result = await Execute.Query(dbName, query, params);
        logger.debug("==========1========", result);
        if (result && result.length > 0) {
            logger.debug("=========2=========", result);
            let errMsg = "Email already exist";
            sendResponse.sendErrorMessage(errMsg, res, 400);
        } else {
            logger.debug("==========3========", result);
            resolve(result)
        }
    })
}

const checkPhoneAlreadyExist = (dbName, mobile_no, res) => {
    return new Promise(async (resolve, reject) => {
        let query = "select id from user where mobile_no=? and is_deleted=0"
        let params = [mobile_no]
        let result = await Execute.Query(dbName, query, params);
        logger.debug("==========1========", result);
        if (result && result.length > 0) {
            logger.debug("==========2========", result);
            let errMsg = "User already registered with this Mobile Number.";

            sendResponse.sendErrorMessage(errMsg, res, 400);


        } else {
            logger.debug("========3==========", result);
            resolve(result)
        }
    })
}

/**
 * @description used for uploading an doucmnet from users
 * @param {*Object} req 
 * @param {*Object} res 
 */
const uploadDocument = async (req, res) => {
    try {
        var documents = req.files != undefined ? req.files.documents : [];
        logger.debug("=====", req.files)
        let documentString = ""
        if (req.files.documents) {
            if (documents && documents.length > 0) {
                for (let i = 0; i < documents.length; i++) {
                    let document = await uploadMgr.uploadImageFileToS3BucketNew(documents[i])
                    documentString = documentString + document + "#"
                    logger.debug("============", documentString)
                }
            }
            else {
                let document = await uploadMgr.uploadImageFileToS3BucketNew(req.files.documents)
                documentString = documentString + document + "#"
            }
            documentString = documentString.slice(0, documentString.length - 1)
            logger.debug("=documentString====>>", documentString);
            await Execute.Query(req.dbName, "update user set documents=? where id=?", [documentString, req.users.id]);
            sendResponse.sendSuccessData({ document: documentString }, constant.responseMessage.SUCCESS, res, 200);
        }
        else {
            sendResponse.sendSuccessData({ document: documentString }, constant.responseMessage.SUCCESS, res, 200);
        }


    }
    catch (Err) {
        logger.debug("========ERr=>", Err);
        return sendResponse.sendErrorMessage(Err, res, 400)
    }
}
/**
 * @desc used for getting an getting an user Loyality Data
 * @param {*Object} req 
 * @param {*Object} res 
 */
const userLoyalityData = async (req, res) => {
    try {
        let loyalityLevelData = await Universal.getUserLoyalityLevelData(req.dbName, req.users.id);
        let nextLoyalityLevel = await Execute.Query(req.dbName, `select description,name,id,image,total_loyality_points,is_for_all_category,per_point_order_amount,per_point_amount,per_point_amount_type from loyality_level where is_deleted=? and total_loyality_points>? order by total_loyality_points desc `, [0, loyalityLevelData[0].total_loyality_points]);
        let pointData = await Universal.usedLoyalityPointData(req.dbName, req.users.id);
        sendResponse.sendSuccessData({
            nextLoyalityLevel: nextLoyalityLevel,
            loyalityLevel: loyalityLevelData,
            totalPointAmountEarned: pointData.totalPointAmountEarned,
            totalEarningPoint: pointData.
                totalEarning, earnedData: pointData.
                    usedData,
            leftPointAmount: pointData.leftPointAmount
        }, constant.responseMessage.SUCCESS, res, 200);
    } catch (err) {
        logger.debug("==ER!==", err)
        return sendResponse.sendErrorMessage("No loyality point found", res, 400);
    }
}


/**
 * @desc used for getting an getting an user Loyality Data
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getCategoryWiseSupplierList = async (req, res) => {
    try {
        let categoryIds = req.body.categoryIds;
        let latitude = req.body.latitude;
        let longitude = req.body.longitude
        let languageId = req.body.languageId
        // let categoryId = categoryIds.join();
        let day = moment().isoWeekday();
        day = day - 1;
        let mUnit = await Universal.getMeausringUnit(req.dbName);

        // let data = [];

        // for(const [index,i] of categoryIds.entries()){
        let categorySuppliersList = await categorySuppliers(req.dbName,
            categoryIds, latitude, longitude, mUnit, day, languageId);
        //     if(categorySuppliersList && categorySuppliersList.length>0){
        //         let obj = {
        //             categoryName:categorySuppliersList[0].category_name,
        //             suppliers:categorySuppliersList
        //         }    
        //         data.push(obj)
        //     }
        // }

        let finalData = []
        let tempJson = {}
        let categoryWiseSuppliers = _.groupBy(categorySuppliersList, "category_name")

        _.each(categoryWiseSuppliers, function (value, key, object) {
            tempJson.category_name = key
            tempJson.category_id = value[0].category_id
            tempJson.suppliers = value
            finalData.push(tempJson);
            tempJson = {}
        })
        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
    } catch (err) {
        logger.debug("==ER!==", err)
        return sendResponse.sendErrorMessage(err, res, 400);
    }
}

const categorySuppliers = async (dbName,
    categoryIds, latitude, longitude, mUnit, day, languageId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = "select *,if( count(*)>1,1,0) as is_multi_branch from ( select s.id,s.delivery_radius,si.image_path as supplier_image,sc.onOffComm,s.delivery_prior_total_time as delivery_prior_time,s.delivery_min_time,s.delivery_max_time,s.urgent_delivery_time,s.total_reviews,s.rating,sb.id as supplier_branch_id, ";
            sql += " ctg.id as category_id,ctg.name as category_name, sml.address,sml.name,s.logo,st.is_open as status,st.start_time,st.end_time," +
                " s.preparation_time, s.payment_method,sc.commission_package,(" + mUnit + " * acos (cos ( radians(" + latitude + ") )* cos( radians( s.latitude ) )* cos( radians( s.longitude ) - radians(" + longitude + ") )+ sin ( radians(" + latitude + ") )* sin( radians( s.latitude ) ))) AS distance from supplier_category sc join supplier s on s.id = " +
                " sc.supplier_id join supplier_timings st on st.supplier_id = s.id join supplier_branch sb on ";
            sql += " s.id = sb.supplier_id  join categories ctg on ctg.id = sc.category_id   join supplier_ml " +
                " sml on s.id = sml.supplier_id left join supplier_image si on si.supplier_id=s.id where ";
            sql += " sc.category_id IN(" + categoryIds.join(",") + ")  and s.is_live = ? and s.is_active = ? and s.is_deleted =0 and sb.is_live = ? and sml.language_id = ? " +
                "and sb.is_deleted = ?  and st.week_id =? GROUP BY s.id,sb.id having distance<s.delivery_radius ) as sub group by id";
            let result = await Execute.Query(dbName, sql,
                [1, 1, 1, languageId, 0, day])
            resolve(result)
        } catch (error) {
            logger.debug('=error=error=error===', error)
            reject(error)
        }
    })
}
/**
 * @desc used for an update an phone number
 */
class Phone {
    static async Update(req, res, next) {
        //    logger.debug("=======>>",req)
        try {
            let mobileNumber = req.body.mobile_number;
            let countryCode = req.body.country_code;
            let promises = []
            const dbName = req.dbName;
            let userId = req.users.id;
            let useModel = new model.users.phone(dbName, mobileNumber, countryCode, userId);
            logger.debug("====input=Param=====>>", req.body)
            promises.push(await useModel.update()); //userType
            await Promise.all(promises)
                .then(data => {
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
                    return
                })
                .catch(error => {
                    logger.debug('=error=>>', error);
                    sendResponse.somethingWentWrongError(error,
                        constant.responseMessage.INTERNAL_SERVER_ERROR,
                        res,
                        500
                    );
                    return;
                });
        } catch (err) {
            logger.debug("Error in Phone Update===>>", err);
            sendResponse.sendErrorMessageWithTranslation(req, constant.responseMessage.ERROR_IN_EXECUTION, res, 500);
        }
    }
}
module.exports = {
    Phone: Phone,
    verifyOtp: verifyOtp,
    getCategoryWiseSupplierList: getCategoryWiseSupplierList,
    resendUserOtp: resendUserOtp,
    registerByPhone: registerByPhone,
    userLoyalityData: userLoyalityData,
    uploadDocument: uploadDocument,
    newRegistration: newRegistration,
    setDefaultAddress: setDefaultAddress,
    getMyReferralData: getMyReferralData,
    myReferralAmount: myReferralAmount,
    updateUserName: updateUserName,
    newRegistrationuser: newRegistrationuser,
    setNhsStatus: setNhsStatus,
    getAllBanners: getAllBanners,
    sendContactUsEmail: sendContactUsEmail
}
