
var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var CONSTS = require('./../../config/const')
const lib = require('../../lib/NotificationMgr')
var _ = require('underscore');
var fs = require('fs')
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784", "782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var loginFunctions = require('../../routes/loginFunctions');
var Universal = require('../../util/Universal');
var randomstring = require("randomstring");
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = config.get('server.debug_level');
var AdminMail = "ops@royo.com";
var crypto = require('crypto');
algorithm = CONSTS.SERVER.CYPTO.ALGO,
    crypto_password = CONSTS.SERVER.CYPTO.PWD
var uploadMgr = require('../../lib/UploadMgr')
var FormData = require('form-data');
var request = require('request');
const runTimeDbConnection = require('../../routes/runTimeDbConnection')
const common = require('../../common/agent');
var braintree = require("braintree");
var web_request = require('request');

const ExecuteQ = require('../../lib/Execute');


/**
 * Used for getting an paystack token for making an payment
 * */
const addMoneyToWallet = async (request, reply) => {
    try {
        let dbName = request.dbName;
        let unique_id = request.body.gateway_unique_id != undefined ? (request.body.gateway_unique_id).toLowerCase() : "";
        let amount = request.body.amount;
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
        let user_id = request.users!=undefined?request.users.id:request.body.user_id;
        let comment = request.body.comment==undefined?"":request.body.comment
        let by_admin = 0
        logger.debug("=======request.path==========",request.path);
        var userData = await Universal.getUserData(request.dbName, request.headers.authorization);
        // await walletUserMoneyCheck(user_id,amount,request.dbName,reply);

        if(request.path=="/admin/wallet/add_money_to_user"){
            logger.debug("===in the admin api of add wallet================")
            by_admin = 1;
            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,"added by admin",comment)
            await addAmountToUserWallet(dbName,user_id,amount);
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
        }else{
            if ((unique_id) == config.get("payment.mumybene.unique_id")) {

                logger.debug("+===========request.dbName============", dbName)
                let mumybene_key_data = await Universal.getMumybeneKeyData(dbName);
                console.log("111111111111111111111111", mumybene_key_data)
                if (mumybene_key_data) {
                    console.log("2222222222222222222222")
                    var mumybene_username = mumybene_key_data[config.get("payment.mumybene.mumybene_username")]
                    var mumybene_password = mumybene_key_data[config.get("payment.mumybene.mumybene_password")]
                    // var phoneNumber = request.body.mobile_no;// ? request.body.mobile_no : "0954755348";
                    var paymentReference = "order_" + (+ new Date()); //"Testabc0112";
                    console.log("paymentReference ------------------- ", paymentReference)
                    var transactionAmount = amount//"100";
                    var baseUrl = "http://test.543.cgrate.co.zm:55555/Konik/KonikWs"
    
                    let xml = `<soapenv:Envelope
                            xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                            xmlns:kon="http://konik.cgrate.com">
                            <soapenv:Header xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                                <wsse:Security xmlns:mustUnderstand="1">
                                    <wsse:UsernameToken xmlns:Id="UsernameToken-1" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                                        <wsse:Username xmlns="http://konik.cgrate.com">`+ mumybene_username + `</wsse:Username>
                                        <wsse:Password xmlns:Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">`+ mumybene_password + `</wsse:Password>
                                    </wsse:UsernameToken>
                                </wsse:Security>
                            </soapenv:Header>
                            <soapenv:Body>
                            <kon:processCustomerPayment>
                            <transactionAmount>`+ transactionAmount + `</transactionAmount>
                            <customerMobile>`+ phoneNumber + `</customerMobile>
                            <paymentReference>`+ paymentReference + `</paymentReference>
                            </kon:processCustomerPayment>
                            </soapenv:Body>
                            </soapenv:Envelope>`;
                    var options = {
                        method: 'POST',
                        url: baseUrl,
                        headers: {
                            'Content-Type': 'text/xml;charset=utf-8',
                            'Accept-Encoding': 'gzip,deflate',
                            'Content-Length': xml.length
                        },
                        body: xml
                    };
    
                    console.log("options -- ", JSON.stringify(options))
    
                    web_request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
                        console.log("response ==== ", JSON.stringify(response))
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        } else if (!error && response.statusCode == 200) {
                            var xml2js = require('xml2js');
                            var parser = new xml2js.Parser({ explicitArray: false, trim: true });
                            console.log("parser -- ", JSON.stringify(parser))
                            parser.parseString(body,async (err, result) => {
                                var responseCode = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['responseCode']
                                console.log("responseCode ==== ", responseCode)
                                if (responseCode == "0") {
                                    var paymentID = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['paymentID']
                                    card_payment_id = paymentID
                                    transaction_id = paymentReference
                                    payment_source = "543"
                                    payment_status = 1
                                    console.log("11111111111111111111111111111", paymentReference)
                                    // await addMoneyToUser(dbName,user_id,amount);
                                    await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                                    await addAmountToUserWallet(dbName,user_id,amount);
                                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                                } else {
                                    //var responseMessage = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['responseMessage']
                                    var responseMessage = "";
                                    if (responseCode == "17") {
                                        responseMessage = "Timeout: You did not respond to the prompt on your phone in time, please try again.";
                                    } else if (responseCode == "1") {
                                        responseMessage = "Insufficient funds: It appears your account has insufficient funds, please choose a different payment method"
                                    }
                                    else if(responseCode == "79"){
                                        responseMessage = "Register by following these instructions:1. Add +260211840008 as a WhatsApp contact 2. Send “Hello” and follow the instructions "
                                    }
                                    else if(responseCode == "6"){
                                        responseMessage = "Register by following these instructions:1. Add +260211840008 as a WhatsApp contact 2. Send “Hello” and follow the instructions "
                                    }
                                     else {
                                        responseMessage = "Sorry, an error occurred. Please try again"
                                    }
                                    console.log(responseCode, "---------responseMessage ------------------- ", responseMessage)
    
                                    return sendResponse.sendErrorMessage(responseMessage, reply, 400);
                                }
                            });
                        } else {
                            console.log("0101010101010101010101010101010101010101")
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                    });
                } else {
                    console.log("1212121212121212121212121212121212121212")
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
            else if ((unique_id) == config.get("payment.strip.unique_id")) {
                payment_source = "stripe";
                logger.debug("+===========request.dbName============", dbName)
                let strip_secret_key_data = await Universal.getStripSecretKey(dbName);
                logger.debug("==card_id=customer_payment_id=STRIP=DATA==>>", card_id, customer_payment_id, strip_secret_key_data)
                if (strip_secret_key_data && strip_secret_key_data.length > 0) {
                    const stripe = require('stripe')(strip_secret_key_data[0].value);
                    let payment_object = {};
                    if (customer_payment_id !== "" && card_id !== "") {
                        payment_object = {
                            amount: Math.round(parseFloat(amount * 100)),
                            currency: currency,
                            source: card_id,
                            customer: customer_payment_id,
                            capture: true,
                            description: '('+userData[0].email+') add money to wallet',
                        }
                    } else {
                        payment_object = {
                            amount: Math.round(parseFloat(amount * 100)),
                            currency: currency,
                            source: payment_token,
                            capture: true,
                            description: '('+userData[0].email+') add money to wallet',
                        }
                    }
                    stripe.charges.create(payment_object, async function (err, charge) {
                        logger.debug("==Payment===ERR!==>>", err);
                        if (err) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            card_payment_id = charge.id
                            payment_status = 1
                            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToUserWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
    
                        }
                    }
                    );
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
            }
            else if ((unique_id) == config.get("payment.conekta.unique_id")) {
                let conekta_data = await Universal.getConektaSecretKey(request.dbName);
                let userData = await Universal.getUserData(request.dbName, request.headers.authorization);
                payment_source = "conekta";
                logger.debug("=====conekta_data===USR==DAT!==>>>", productList[0].net_amount, conekta_data, userData)
    
                if (conekta_data && conekta_data.length > 0) {
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
                            "unit_price": Math.round(parseFloat(amount * 100)),
                            "quantity": 1
                        }],
                        "shipping_lines": [
                            {
                                "amount": 0
                            }
                        ],
                        "shipping_contact": {
                            "address": {
                                street1: userData[0].customer_address,
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
                        logger.debug("JSON==Object==>", result.toObject());
                        card_payment_id = result.toObject().id;
                        payment_status = 1
                        await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                        await addAmountToUserWallet(dbName,user_id,amount);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                    }, async function (error) {
                        logger.debug("=======ERR!=====", error);
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    })
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
            else if ((unique_id) == config.get("payment.razorpay.unique_id")) {
                payment_source = "razorpay";
                let razor_pay_data = await Universal.getRazorPayData(request.dbName);
                // logger.debug("======razor_pay_data=net_amount====>>", razor_pay_data, productList[0].net_amount * 100)
                if (Object.keys(razor_pay_data).length > 0) {
                    web_request({
                        method: 'POST',
                        url: "https://" + razor_pay_data[config.get("payment.razorpay.publish_key")] + ":" + razor_pay_data[config.get("payment.razorpay.secret_key")] + "@api.razorpay.com/v1/payments/" + payment_token + "/capture",
                        form: {
                            amount: (amount) * 100,
                            currency: "INR"
                        }
                    }, async function (error, response, body) {
                        logger.debug("===RazorPayError====", error)
                        // console.log('Status:', response.statusCode);
                        // console.log('Headers:', JSON.stringify(response.headers));
                        // console.log('Response:', body);
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            payment_status = 1
                            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToUserWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
                    });
    
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
            }
            else if((unique_id)==config.get("payment.authorize_net.unique_id")){
                    payment_source="authorize_net";
                    let authorize_net_key_data = await Universal.getAuthorizeNetKeys(dbName)
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
                                        "amount": amount,
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
                                        "amount": amount,
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
                                payment_source = "authorize_net";
                                if(result.messages.resultCode=="Error"){
                                    let errorMsg = result.messages.message[0].text
                                    sendResponse.sendErrorMessage(errorMsg,reply,400);
                                }else if (result.messages.resultCode=="Ok"){
                                    card_payment_id = result.transactionResponse.transId;
                                    await addWalletTransactionRecord(dbName,user_id,
                                    amount,card_payment_id,by_admin,0,1,0,payment_source,"");

                                    await addAmountToUserWallet(dbName,user_id,amount);

                                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                                }else{
                                    let errorMsg = "something went wrong while getting cards"
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
    
           
            else if ((unique_id) == config.get("payment.razorpay.unique_id")) {
                payment_source = "razorpay";
                let razor_pay_data = await Universal.getRazorPayData(request.dbName);
                logger.debug("======razor_pay_data=net_amount====>>", razor_pay_data, productList[0].net_amount * 100)
                if (Object.keys(razor_pay_data).length > 0) {
                    web_request({
                        method: 'POST',
                        url: "https://" + razor_pay_data[config.get("payment.razorpay.publish_key")] + ":" + razor_pay_data[config.get("payment.razorpay.secret_key")] + "@api.razorpay.com/v1/payments/" + payment_token + "/capture",
                        form: {
                            amount: (amount) * 100,
                            currency: "INR"
                        }
                    }, async function (error, response, body) {
                        logger.debug("===RazorPayError====", error)
                        // console.log('Status:', response.statusCode);
                        // console.log('Headers:', JSON.stringify(response.headers));
                        // console.log('Response:', body);
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            payment_status = 1
                            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToUserWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
                    });
    
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
            }
    
    
            else if ((unique_id) == config.get("payment.myfatoorah.unique_id")) {
    
                card_payment_id = payment_token;
                payment_status = 1
                payment_source = "myfatoorah"
                transaction_id = myFatoorahInvoiceId
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
    
            }
            else if((unique_id)=="aamarpay"){
                
                payment_source = "aamarpay";
                card_payment_id = payment_token;
                payment_status=1
                
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

            }
            else if((unique_id)=="datatrans"){
                
                payment_source = "datatrans";
                card_payment_id = payment_token;
                payment_status=1
                
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

            }
            else if((unique_id)=="thawani"){
                
                payment_source = "thawani";
                card_payment_id = payment_token;
                payment_status=1
                
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

            }
            else if((unique_id)=="sadadqa"){
                card_payment_id = payment_token;
                payment_status = 1
                payment_source = "sadadqa"
                await addWalletTransactionRecord(dbName,user_id,amount,
                    card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
    
            }
            else if((unique_id)=="transbank"){
                card_payment_id = payment_token;
                payment_status = 1
                payment_source = "transbank"
                await addWalletTransactionRecord(dbName,user_id,amount,
                    card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
    
            }
            else if ((unique_id) == config.get("payment.converge.unique_id")) {
    
                card_payment_id = payment_token;
                payment_status = 1
                payment_source = "converge"
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
    
            }
            else if ((unique_id) == config.get("payment.tap.unique_id")) {
                payment_source = "tap";
                card_payment_id = payment_token;
                payment_status = 1
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }
            else if ((unique_id) == config.get("payment.mPaisa.unique_id")) {
                payment_source = "mPaisa";
                card_payment_id = payment_token;
                payment_status = 1
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }else if((unique_id)=="telr"){
                    
            payment_source = "telr";
            card_payment_id = payment_token;
            payment_status=1
            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
            await addAmountToUserWallet(dbName,user_id,amount);
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

            }
            else if((unique_id)=="hyperpay"){
                    
                card_payment_id = payment_token;
                payment_status=1
                payment_source="hyperpay"

                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

            }
            else if((unique_id)==config.get("payment.payhere.unique_id")){
                    
                card_payment_id = payment_token;
                payment_status=1
                payment_source="payhere"
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }
            else if((unique_id)=="paymaya"){
                payment_source = "paymaya";
                card_payment_id = payment_token;
                payment_status = 1
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }
            else if ((unique_id) == config.get("payment.windcave.unique_id")) {
                payment_source = "windcave";
                card_payment_id = payment_token;
                payment_status = 1
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }
            else if ((unique_id) == config.get("payment.paypal.unique_id")) {
                payment_source = "paypal";
                let paypal_api = process.env.NODE_ENV == 'prod' ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com'
                let paypal_data = await Universal.getPaypalData(request.dbName);
                logger.debug("========paypal==API==", paypal_api, paypal_data)
                if (Object.keys(paypal_data).length > 0) {
                    let tokenData = await Universal.getAuthTokeOfPayPal(paypal_data[config.get("payment.paypal.client_key")], paypal_data[config.get("payment.paypal.secret_key")]);
                    var options = {
                        'method': 'POST',
                        'url': paypal_api + '/v2/checkout/orders/' + payment_token + '/capture',
                        'headers': {
                            'Authorization': 'Bearer ' + tokenData.access_token,
                            // 'PayPal-Request-Id': '7b92603e-77ed-4896-8e78-5dea2050476a',
                            'Content-Type': 'application/json'
                        }
                    };
                    web_request(options, async function (error, response, body) {
                        logger.debug("====Body=====", error, body)
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            payment_status = 1
                            card_payment_id = payment_token;
                            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToUserWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
                    });
    
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
    
            else if ((unique_id) == config.get("payment.checkout.unique_id")) {
                payment_source = "checkout";
    
                let checkout_data = await Universal.getCheckoutSecretKey(request.dbName);
                logger.debug("======razor_pay_data=net_amount====>>", checkout_data)
                if (Object.keys(checkout_data).length > 0) {
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
                        "amount": parseFloat(amount),
                        "currency": currency,//"USD",
                        "reference": request.body.cartId ? request.body.cartId : '',//"ORD-5023-4E89",
                        "metadata": {
                            "card_id": card_id,
                            "customer_payment_id": customer_payment_id
                        }
                    };
                    console.log("dataString ============= ", dataString)
                    let checkout_api_url = (process.env.NODE_ENV == 'prod') ? 'https://api.checkout.com/payments' : 'https://api.sandbox.checkout.com/payments';
                    console.log("options ------- ------ ------ ", {
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
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            card_payment_id = body.id;
                            payment_status = 1
                            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToUserWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
                    });
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
    
            else if ((unique_id) == config.get("payment.venmo.unique_id")) {
                payment_source = "venmo";
                let braintree_data = await Universal.getBraintreeData(request.dbName);
                logger.debug("========braintree_data==API==", braintree_data);
    
                if (Object.keys(braintree_data).length > 0) {
                    var braintree = require("braintree");
                    var gateway = braintree.connect({
                        environment: process.env.NODE_ENV == 'prod' ? braintree.Environment.Production : braintree.Environment.Sandbox,
                        merchantId: braintree_data[config.get("payment.venmo.merchant_id")],
                        publicKey: braintree_data[config.get("payment.venmo.public_key")],
                        privateKey: braintree_data[config.get("payment.venmo.private_key")]
                    });
    
                    gateway.transaction.sale({
                        amount: amount,
                        paymentMethodNonce: payment_token,
                        options: {
                            submitForSettlement: true
                        },
                        deviceData: {}
                    }, async function (err, result) {
                        if (err) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            if (result.success) {
                                logger.debug("===braintree===response Id==>>>", result)
                                card_payment_id = result.transaction.id;
                                payment_status = 1
                                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                                await addAmountToUserWallet(dbName,user_id,amount);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                            }
                            else {
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
                            }
    
                        }
    
                    });
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
            else if ((unique_id) == "zelle") {
                logger.debug("===============zelle==========", zelle_receipt_url)
                if (zelle_receipt_url == "" || zelle_receipt_url == null) {
                    logger.debug("=======node zelle url============", zelle_receipt_url)
                    let msg = "please provide receipt for zelle";
                    sendResponse.sendErrorMessage(msg, reply, 500);
                } else {
                    payment_source = "zelle"
                    await addWalletTransactionRecord(dbName,user_id,amount,
                        card_payment_id,by_admin,0,1,0,payment_source,"")
                    await addAmountToUserWallet(dbName,user_id,amount);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                }
            }
            else if(unique_id=="cred_movil"){
                logger.debug("===============cred_movil==========", zelle_receipt_url)
                if (zelle_receipt_url == "" || zelle_receipt_url == null) {
                    logger.debug("=======node zelle url============", zelle_receipt_url)
                    let msg = "please provide receipt for cred_movil";
                    sendResponse.sendErrorMessage(msg, reply, 500);
                } else {
                    payment_source = "cred_movil"
                    await addWalletTransactionRecordInCaseZelle(dbName,
                        user_id,amount,card_payment_id,by_admin,
                        0,1,0,payment_source,"")
                    // await addAmountToUserWallet(dbName,user_id,amount);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
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
                    await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,payment_source,"")
                    await addAmountToUserWallet(dbName,user_id,amount);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
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
                        "data[monto]": parseFloat(amount).toString(),
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
                            payment_source = "pago_facil"
                            if(body.WebServices_Transacciones.transaccion.autorizado=="0"){
                                return sendResponse.sendErrorMessage(body.WebServices_Transacciones.transaccion.texto,
                                    reply,400)
                            }else{
                                card_payment_id = body.WebServices_Transacciones.transaccion.idTransaccion

                                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                                await addAmountToUserWallet(dbName,user_id,amount);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

                            }
                        }
                    });
            
                }
                else{

                    return sendResponse.sendErrorMessage("keys not added",reply,400)
                }
            
            }
            else if((unique_id)=="safe2pay"){

                payment_source="safe2pay";

                let safe2pay_keydata = await Universal.getSafe2Paykey(request.dbName);
                
                let base_url = "https://payment.safe2pay.com.br/v2/Payment";

                let IsSandbox = process.env.NODE_ENV == 'prod'?false:true

                // let expirationDate = request.body.expirationDate
                let cvv = "123";
                
                cvv = request.body.cvt!==undefined?request.body.cvt:request.body.cvv;

                let expMonth = request.body.expMonth;
                let expYear = request.body.expYear;

                let ref_id = "ref_id_"+randomstring.generate({
                    length: 5,
                    charset: 'alphanumeric'
                }).toUpperCase();

                if(Object.keys(safe2pay_keydata).length>0){
                    let body = {};
                        body = {
                            "IsSandbox": IsSandbox,
                            "Application": "Aplicação de teste",
                            "Vendor": userData[0].firstname,
                            "CallbackUrl": "https://callbacks.exemplo.com.br/api/Notify",
                            "PaymentMethod": "2",
                            "Customer": {
                                "Name": userData[0].firstname,
                                "Identity":ref_id,
                                "Phone": userData[0].mobile_no,
                                "Email": userData[0].email
                            },
                            "Products": [
                                {
                                    "Code": ref_id,
                                    "Description": "wallet money add",
                                    "UnitPrice": amount,
                                    "Quantity": 1
                                }
                            ],
                            "PaymentObject": {
                                "Holder": userData[0].firstname,
                                "CardNumber": payment_token,
                                "ExpirationDate": expMonth+"/"+expYear,//"12/2021",
                                "SecurityCode": cvv
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

                            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToUserWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

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
            else if ((unique_id) == config.get("payment.squareup.unique_id")) {
                payment_source = "squareup";
                let squareData = await Universal.getSquareupSecretKey(dbName)
    
                if (Object.keys(squareData).length > 0) {
                    var SquareConnect = require('square-connect');
                    // Set Square Connect credentials and environment
                    var defaultClient = SquareConnect.ApiClient.instance;
                    // Configure OAuth2 access token for authorization: oauth2
                    var oauth2 = defaultClient.authentications['oauth2'];
                    oauth2.accessToken = squareData.square_token;
                    // Set 'basePath' to switch between sandbox env and production env
                    // sandbox: https://connect.squareupsandbox.com
                    // production: https://connect.squareup.com
                    let basePathOfSequare = process.env.NODE_ENV == 'prod' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
                    logger.debug("=basePathOfSequare===", basePathOfSequare);
                    defaultClient.basePath = process.env.NODE_ENV == 'prod' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com'
    
                    let payment_object = {};
                    const idempotency_key = crypto.randomBytes(22).toString('hex');
                    var apiInstance = new SquareConnect.PaymentsApi();
                    // you cand Add some Optional params acc. to the requirements in the PaymentObj
                    //https://developer.squareup.com/reference/square/payments-api/create-payment/explorer
                    // logger.debug("==withou,with=", parseInt(Math.round(parseFloat((amount - referralAmount) * 100))), typeof parseInt(Math.round(parseFloat((amount - referralAmount) * 100))), typeof Math.round(parseFloat((amount - referralAmount) * 100)))
                    if (customer_payment_id !== "" && card_id !== "") {
                        payment_object = {
                            amount_money: {
                                amount: parseInt(Math.round(parseFloat((amount) * 100))),    // 100 Cent == $1.00 charge
                                currency: "USD"
                            },
                            // currency: currency,
                            source_id: card_id,
                            customer_id: customer_payment_id,
                            idempotency_key: idempotency_key,
                            note: 'Made an booking'
                        }
                    } else {
                        payment_object = {
                            source_id: payment_token,
                            amount_money: {
                                amount: parseInt(Math.round(parseFloat((amount) * 100))),    // 100 Cent == $1.00 charge
                                currency: "USD"
                            },
                            idempotency_key: idempotency_key,
                            note: 'Made an booking'
    
                        };
                    }
                    logger.debug("===payment_object=", payment_object);
                    apiInstance.createPayment(payment_object).then(async function (data) {
                        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                        card_payment_id = data.payment.id;
                        transaction_id = idempotency_key
                        payment_status = 1
                        await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                        await addAmountToUserWallet(dbName,user_id,amount);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                    }, function (error) {
                        console.error(error);
                        return sendResponse.sendErrorMessage(
                            Universal.getMsgText(
                                languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    });
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
    
            }
            else if ((unique_id) == config.get("payment.cybersource.unique_id")) {
                payment_source = "cybersource";
                let cyberSourceData = await Universal.getCyberSourceData(dbName);
                logger.debug("==cyberSourceData====", cyberSourceData);
                if (Object.keys(cyberSourceData).length > 0) {
                    var cybersourceRestApi = require('cybersource-rest-client');
                    try {
                        var instance = new cybersourceRestApi.PaymentsApi({
                            'authenticationType': process.env.NODE_ENV == 'prod' ? 'https_signature' : 'http_signature',
                            'runEnvironment': process.env.NODE_ENV == 'prod' ? 'cybersource.environment.production' : 'cybersource.environment.SANDBOX',
                            'merchantID': cyberSourceData.cybersource_merchant_id,
                            'merchantKeyId': cyberSourceData.cybersource_merchant_key_id,
                            'merchantsecretKey': cyberSourceData.cybersource_merchant_secret_key
                        });
                        var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
                        processingInformation.commerceIndicator = 'internet';
                        // var aggregatorInformation = new cybersourceRestApi.Ptsv2paymentsAggregatorInformation();
    
    
                        var amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
                        amountDetails.totalAmount = parseFloat(parseFloat(amount));
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
                        customer.customerId = payment_token;
                        // card.expirationYear = cardData[0].exp_year
                        // card.number = cardData[0].card_number;
                        // card.expirationMonth = cardData[0].exp_month;
                        // card.securityCode = await Universal.getDecryptData(cardData[0].cvc);
                        // // customer.customer_payment_id
                        // card.type = cardData[0].card_type;
                        // paymentInformation.card = card;
                        paymentInformation.customer = customer
                        var cbrequest = new cybersourceRestApi.CreatePaymentRequest();
                        // request.clientReferenceInformation = clientReferenceInformation;
                        cbrequest.processingInformation = processingInformation;
                        // request.aggregatorInformation = aggregatorInformation;
                        cbrequest.orderInformation = orderInformation;
                        cbrequest.paymentInformation = paymentInformation;
                        cbrequest.processingInformation.capture = true;
                        console.log('\n*************** Process Payment ********************* ');
    
                        instance.createPayment(cbrequest,async  function (error, data, response) {
                            if (error) {
    
                                console.log('\nError in process a payment : ' + JSON.stringify(error));
                                return sendResponse.sendErrorMessage(
                                    Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
                            }
                            else {
                                console.log('\nData of process a payment : ' + JSON.stringify(response['status']), JSON.stringify(response['id']))
                                card_payment_id = data.id;
                                payment_status = 1
                                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                                await addAmountToUserWallet(dbName,user_id,amount);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                            }
                            // console.log('\nResponse of process a payment : ' + JSON.stringify(response));
                            // console.log('\nResponse Code of process a payment : ' + JSON.stringify(response['status']));
                            // callback(error, data);
                        });
                    } catch (error) {
                        logger.debug("======ERR!===>>", error)
                        return sendResponse.sendErrorMessage(
                            Universal.getMsgText(
                                languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    }
    
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
            }
            else if ((unique_id) == config.get("payment.paytab.unique_id")) {
                let payTabData = await Universal.getPayTabData(dbName);
    
                payment_source = "paytab";
                if (Object.keys(payTabData).length > 0) {
                    web_request.post({
                        url: "https://www.paytabs.com/apiv2/verify_payment_transaction",
                        method: "POST",
                        form: {
                            "merchant_email":payTabData.merchant_email,
                            "secret_key":payTabData.paytabs_secret_key,
                            // "merchant_email":"Kiran.girija@afoc.mil.ae", //payTabData.paytab_merchant_email,
                            // "secret_key":"QGj2hCvxNdFnoA9QZe9jm8QSr2S44FcUmvWD7sbUFRh4rrUrG4L2cCUEENJJsVDPqAsy3EtIvLNXdHoTM9WYLRDqEm97hNWIophr",//payTabData.paytab_secret_key,
                            "transaction_id": customer_payment_id
                        }
    
                    }, async function (error, response, body) {
                        logger.debug("===paytabErr!===", error)
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            card_payment_id = JSON.parse(body).transaction_id;
                            payment_status = 1
                            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToUserWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
    
                    })
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
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
                    var amountForPeachSandbox =parseInt(amount)
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
                            await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToUserWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
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
            else if((unique_id)==config.get("payment.authorize_net.unique_id")){
                payment_source="authorize_net";
                let authorize_net_key_data = await Universal.getAuthorizeNetKeys(dbName)
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
                                    "amount": amount,
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
                                    "amount": amount,
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
                            payment_source = "authorize_net";
                            if(result.messages.resultCode=="Error"){
                                let errorMsg = result.messages.message[0].text
                                sendResponse.sendErrorMessage(errorMsg,reply,400);
                            }else if (result.messages.resultCode=="Ok"){
                                card_payment_id = result.transactionResponse.transId;
                                await addWalletTransactionRecord(dbName,user_id,
                                amount,card_payment_id,by_admin,0,1,0,payment_source,"");
            
                                await addAmountToUserWallet(dbName,user_id,amount);
            
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                            }else{
                                let errorMsg = "something went wrong while initiate payment"
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
            else if((unique_id)=="urway"){
                    
                card_payment_id = payment_token;
                payment_status=1
                payment_source="urway"
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,
                    by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            
            }
            else if((unique_id)=="pipolpay"){
                logger.debug("===============zelle==========",zelle_receipt_url)
                if(zelle_receipt_url=="" || zelle_receipt_url==null){
                    logger.debug("=======node zelle url============",zelle_receipt_url)
                    let msg = "please provide receipt for PipolPay";
                    sendResponse.sendErrorMessage(msg,reply,500);
                }else{
                    payment_source = "PipolPay"
                    await addWalletTransactionRecord(dbName,user_id,amount,
                        card_payment_id,by_admin,0,1,0,payment_source,"")
                    await addAmountToUserWallet(dbName,user_id,amount);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                }
             }
            else if((unique_id)=="oxxo"){
                logger.debug("===============oxxo==========",zelle_receipt_url)
                if(zelle_receipt_url=="" || zelle_receipt_url==null){
                    logger.debug("=======node oxxo url============",
                    zelle_receipt_url)
                    let msg = "please provide receipt for oxxo";
                    sendResponse.sendErrorMessage(msg,res,500);
                }else{
                    payment_status = 1;
                    payment_source = "oxxo"
                    await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,payment_source,"")
                    await addAmountToUserWallet(dbName,user_id,amount);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                }
            }
    
            else {
                return sendResponse.sendErrorMessage(
                    await Universal.getMsgText(
                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                    reply, 400);
            }
        }
         
    }
    catch (Err) {
        logger.debug("======ERR!===?", Err)
        return sendResponse.sendErrorMessage("Sorry payment failed",reply, 400);
    }
}

/**
 * Used for getting an paystack token for making an payment
 * */
const addMoneyToAgentWallet = async (request, reply) => {
    try {
        let dbName = request.dbName;
        let unique_id = request.body.gateway_unique_id != undefined ? (request.body.gateway_unique_id).toLowerCase() : "";
        let amount = request.body.amount;
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
        let user_id = request.body.user_id
        let comment = request.body.comment==undefined?"":request.body.comment
        let by_admin = 0
        logger.debug("=======request.path==========",request.path);
        var userData
        if(request.headers.authorization){
            userData = await Universal.getAgentData(request.dbName, request.headers.authorization);
        }
        console.log(userData,"333333333333333333333333333")
        // await walletUserMoneyCheck(user_id,amount,request.dbName,reply);

        if(request.path=="/admin/wallet/add_money_to_agent"){
            console.log("1111111111111111111111111111111")
            logger.debug("===in the admin api of add wallet================")
            by_admin = 1;
            await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,"added by admin",comment)
            await addAmountToAgentWallet(dbName,user_id,amount);
            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
        }else{
            console.log("2222222222222222222222222222222222")
            if ((unique_id) == config.get("payment.mumybene.unique_id")) {

                logger.debug("+===========request.dbName============", dbName)
                let mumybene_key_data = await Universal.getMumybeneKeyData(dbName);
                console.log("111111111111111111111111", mumybene_key_data)
                if (mumybene_key_data) {
                    console.log("2222222222222222222222")
                    var mumybene_username = mumybene_key_data[config.get("payment.mumybene.mumybene_username")]
                    var mumybene_password = mumybene_key_data[config.get("payment.mumybene.mumybene_password")]
                    // var phoneNumber = request.body.mobile_no;// ? request.body.mobile_no : "0954755348";
                    var paymentReference = "order_" + (+ new Date()); //"Testabc0112";
                    console.log("paymentReference ------------------- ", paymentReference)
                    var transactionAmount = amount//"100";
                    var baseUrl = "http://test.543.cgrate.co.zm:55555/Konik/KonikWs"
    
                    let xml = `<soapenv:Envelope
                            xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                            xmlns:kon="http://konik.cgrate.com">
                            <soapenv:Header xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                                <wsse:Security xmlns:mustUnderstand="1">
                                    <wsse:UsernameToken xmlns:Id="UsernameToken-1" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                                        <wsse:Username xmlns="http://konik.cgrate.com">`+ mumybene_username + `</wsse:Username>
                                        <wsse:Password xmlns:Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">`+ mumybene_password + `</wsse:Password>
                                    </wsse:UsernameToken>
                                </wsse:Security>
                            </soapenv:Header>
                            <soapenv:Body>
                            <kon:processCustomerPayment>
                            <transactionAmount>`+ transactionAmount + `</transactionAmount>
                            <customerMobile>`+ phoneNumber + `</customerMobile>
                            <paymentReference>`+ paymentReference + `</paymentReference>
                            </kon:processCustomerPayment>
                            </soapenv:Body>
                            </soapenv:Envelope>`;
                    var options = {
                        method: 'POST',
                        url: baseUrl,
                        headers: {
                            'Content-Type': 'text/xml;charset=utf-8',
                            'Accept-Encoding': 'gzip,deflate',
                            'Content-Length': xml.length
                        },
                        body: xml
                    };
    
                    console.log("options -- ", JSON.stringify(options))
    
                    web_request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
                        console.log("response ==== ", JSON.stringify(response))
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        } else if (!error && response.statusCode == 200) {
                            var xml2js = require('xml2js');
                            var parser = new xml2js.Parser({ explicitArray: false, trim: true });
                            console.log("parser -- ", JSON.stringify(parser))
                            parser.parseString(body,async (err, result) => {
                                var responseCode = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['responseCode']
                                console.log("responseCode ==== ", responseCode)
                                if (responseCode == "0") {
                                    var paymentID = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['paymentID']
                                    card_payment_id = paymentID
                                    transaction_id = paymentReference
                                    payment_source = "543"
                                    payment_status = 1
                                    console.log("11111111111111111111111111111", paymentReference)
                                    // await addMoneyToUser(dbName,user_id,amount);
                                    await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                                    await addAmountToAgentWallet(dbName,user_id,amount);
                                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                                } else {
                                    //var responseMessage = result['env:Envelope']['env:Body']['ns2:processCustomerPaymentResponse']['return']['responseMessage']
                                    var responseMessage = "";
                                    if (responseCode == "17") {
                                        responseMessage = "Timeout: You did not respond to the prompt on your phone in time, please try again.";
                                    } else if (responseCode == "1") {
                                        responseMessage = "Insufficient funds: It appears your account has insufficient funds, please choose a different payment method"
                                    }
                                    else if(responseCode == "79"){
                                        responseMessage = "Register by following these instructions:1. Add +260211840008 as a WhatsApp contact 2. Send “Hello” and follow the instructions "
                                    }
                                    else if(responseCode == "6"){
                                        responseMessage = "Register by following these instructions:1. Add +260211840008 as a WhatsApp contact 2. Send “Hello” and follow the instructions "
                                    }
                                     else {
                                        responseMessage = "Sorry, an error occurred. Please try again"
                                    }
                                    console.log(responseCode, "---------responseMessage ------------------- ", responseMessage)
    
                                    return sendResponse.sendErrorMessage(responseMessage, reply, 400);
                                }
                            });
                        } else {
                            console.log("0101010101010101010101010101010101010101")
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                    });
                } else {
                    console.log("1212121212121212121212121212121212121212")
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
            else if ((unique_id) == config.get("payment.strip.unique_id")) {
                payment_source = "stripe";
                console.debug("+===========request.dbName============", dbName)
                let strip_secret_key_data = await Universal.getStripSecretKey(dbName);
                logger.debug("==card_id=customer_payment_id=STRIP=DATA==>>", card_id, customer_payment_id, strip_secret_key_data)
                if (strip_secret_key_data && strip_secret_key_data.length > 0) {
                    const stripe = require('stripe')(strip_secret_key_data[0].value);
                    let payment_object = {};
                    if (customer_payment_id !== "" && card_id !== "") {
                        payment_object = {
                            amount: Math.round(parseFloat(amount * 100)),
                            currency: currency,
                            source: card_id,
                            customer: customer_payment_id,
                            capture: true,
                            description: '('+userData[0].email+') add money to wallet',
                        }
                    } else {
                        payment_object = {
                            amount: Math.round(parseFloat(amount * 100)),
                            currency: currency,
                            source: payment_token,
                            capture: true,
                            description: '('+userData[0].email+') add money to wallet',
                        }
                    }
                    stripe.charges.create(payment_object, async function (err, charge) {
                        logger.debug("==Payment===ERR!==>>", err);
                        if (err) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            card_payment_id = charge.id
                            payment_status = 1
                            await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToAgentWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
    
                        }
                    }
                    );
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
            }
            else if ((unique_id) == config.get("payment.conekta.unique_id")) {
                let conekta_data = await Universal.getConektaSecretKey(request.dbName);
                let userData = await Universal.getUserData(request.dbName, request.headers.authorization);
                payment_source = "conekta";
                logger.debug("=====conekta_data===USR==DAT!==>>>", productList[0].net_amount, conekta_data, userData)
    
                if (conekta_data && conekta_data.length > 0) {
                    let conekta = require('conekta');
                    conekta.api_key = conekta_data[0].value;
                    conekta.locale = 'es';
                    conekta.Order.create({
                        "currency": "MXN",
                        "customer_info": {
                            "name": userData[0].name,
                            "phone": userData[0].phone_number,
                            "email": userData[0].email
                        },
                        "line_items": [{
                            "name": userData[0].name,
                            "unit_price": Math.round(parseFloat(amount * 100)),
                            "quantity": 1
                        }],
                        "shipping_lines": [
                            {
                                "amount": 0
                            }
                        ],
                        "shipping_contact": {
                            "address": {
                                street1: userData[0].customer_address,
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
                        logger.debug("JSON==Object==>", result.toObject());
                        card_payment_id = result.toObject().id;
                        payment_status = 1
                        await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                        await addAmountToAgentWallet(dbName,user_id,amount);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                    }, async function (error) {
                        logger.debug("=======ERR!=====", error);
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    })
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
            else if ((unique_id) == config.get("payment.razorpay.unique_id")) {
                payment_source = "razorpay";
                let razor_pay_data = await Universal.getRazorPayData(request.dbName);
                logger.debug("======razor_pay_data=net_amount====>>", razor_pay_data, productList[0].net_amount * 100)
                if (Object.keys(razor_pay_data).length > 0) {
                    web_request({
                        method: 'POST',
                        url: "https://" + razor_pay_data[config.get("payment.razorpay.publish_key")] + ":" + razor_pay_data[config.get("payment.razorpay.secret_key")] + "@api.razorpay.com/v1/payments/" + payment_token + "/capture",
                        form: {
                            amount: (amount) * 100,
                            currency: "INR"
                        }
                    }, async function (error, response, body) {
                        logger.debug("===RazorPayError====", error)
                        // console.log('Status:', response.statusCode);
                        // console.log('Headers:', JSON.stringify(response.headers));
                        // console.log('Response:', body);
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            payment_status = 1
                            await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToAgentWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
                    });
    
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
            }
    
            else if ((unique_id) == config.get("payment.razorpay.unique_id")) {
                payment_source = "razorpay";
                let razor_pay_data = await Universal.getRazorPayData(request.dbName);
                logger.debug("======razor_pay_data=net_amount====>>", razor_pay_data, productList[0].net_amount * 100)
                if (Object.keys(razor_pay_data).length > 0) {
                    web_request({
                        method: 'POST',
                        url: "https://" + razor_pay_data[config.get("payment.razorpay.publish_key")] + ":" + razor_pay_data[config.get("payment.razorpay.secret_key")] + "@api.razorpay.com/v1/payments/" + payment_token + "/capture",
                        form: {
                            amount: (amount) * 100,
                            currency: "INR"
                        }
                    }, async function (error, response, body) {
                        logger.debug("===RazorPayError====", error)
                        // console.log('Status:', response.statusCode);
                        // console.log('Headers:', JSON.stringify(response.headers));
                        // console.log('Response:', body);
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            payment_status = 1
                            await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToAgentWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
                    });
    
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
            }
    
    
            else if ((unique_id) == config.get("payment.myfatoorah.unique_id")) {
    
                card_payment_id = payment_token;
                payment_status = 1
                payment_source = "myfatoorah"
                transaction_id = myFatoorahInvoiceId
                await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToAgentWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
    
            }
            else if((unique_id)=="aamarpay"){
                
                payment_source = "aamarpay";
                card_payment_id = payment_token;
                payment_status=1
                
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

            }
            else if((unique_id)=="datatrans"){
                
                payment_source = "datatrans";
                card_payment_id = payment_token;
                payment_status=1
                
                await addWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToUserWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)

            }
            else if ((unique_id) == config.get("payment.converge.unique_id")) {
    
                card_payment_id = payment_token;
                payment_status = 1
                payment_source = "converge"
                await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToAgentWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
    
            }
            else if ((unique_id) == config.get("payment.tap.unique_id")) {
                payment_source = "tap";
                card_payment_id = payment_token;
                payment_status = 1
                await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToAgentWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }
            else if ((unique_id) == config.get("payment.mPaisa.unique_id")) {
                payment_source = "mPaisa";
                card_payment_id = payment_token;
                payment_status = 1
                await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToAgentWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }
            else if((unique_id)==config.get("payment.payhere.unique_id")){
                    
                card_payment_id = payment_token;
                payment_status=1
                payment_source="payhere"
                await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToAgentWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }
            else if ((unique_id) == config.get("payment.windcave.unique_id")) {
                payment_source = "windcave";
                card_payment_id = payment_token;
                payment_status = 1
                await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                await addAmountToAgentWallet(dbName,user_id,amount);
                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
            }
            else if ((unique_id) == config.get("payment.paypal.unique_id")) {
                payment_source = "paypal";
                let paypal_api = process.env.NODE_ENV == 'prod' ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com'
                let paypal_data = await Universal.getPaypalData(request.dbName);
                logger.debug("========paypal==API==", paypal_api, paypal_data)
                if (Object.keys(paypal_data).length > 0) {
                    let tokenData = await Universal.getAuthTokeOfPayPal(paypal_data[config.get("payment.paypal.client_key")], paypal_data[config.get("payment.paypal.secret_key")]);
                    var options = {
                        'method': 'POST',
                        'url': paypal_api + '/v2/checkout/orders/' + payment_token + '/capture',
                        'headers': {
                            'Authorization': 'Bearer ' + tokenData.access_token,
                            // 'PayPal-Request-Id': '7b92603e-77ed-4896-8e78-5dea2050476a',
                            'Content-Type': 'application/json'
                        }
                    };
                    web_request(options, async function (error, response, body) {
                        logger.debug("====Body=====", error, body)
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            payment_status = 1
                            card_payment_id = payment_token;
                            await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToAgentWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
                    });
    
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
    
            else if ((unique_id) == config.get("payment.checkout.unique_id")) {
                payment_source = "checkout";
    
                let checkout_data = await Universal.getCheckoutSecretKey(request.dbName);
                logger.debug("======razor_pay_data=net_amount====>>", checkout_data)
                if (Object.keys(checkout_data).length > 0) {
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
                        "amount": parseFloat(amount),
                        "currency": currency,//"USD",
                        "reference": request.body.cartId ? request.body.cartId : '',//"ORD-5023-4E89",
                        "metadata": {
                            "card_id": card_id,
                            "customer_payment_id": customer_payment_id
                        }
                    };
                    console.log("dataString ============= ", dataString)
                    let checkout_api_url = (process.env.NODE_ENV == 'prod') ? 'https://api.checkout.com/payments' : 'https://api.sandbox.checkout.com/payments';
                    console.log("options ------- ------ ------ ", {
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
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            card_payment_id = body.id;
                            payment_status = 1
                            await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToAgentWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
                    });
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
    
            else if ((unique_id) == config.get("payment.venmo.unique_id")) {
                payment_source = "venmo";
                let braintree_data = await Universal.getBraintreeData(request.dbName);
                logger.debug("========braintree_data==API==", braintree_data);
    
                if (Object.keys(braintree_data).length > 0) {
                    var braintree = require("braintree");
                    var gateway = braintree.connect({
                        environment: process.env.NODE_ENV == 'prod' ? braintree.Environment.Production : braintree.Environment.Sandbox,
                        merchantId: braintree_data[config.get("payment.venmo.merchant_id")],
                        publicKey: braintree_data[config.get("payment.venmo.public_key")],
                        privateKey: braintree_data[config.get("payment.venmo.private_key")]
                    });
    
                    gateway.transaction.sale({
                        amount: amount,
                        paymentMethodNonce: payment_token,
                        options: {
                            submitForSettlement: true
                        },
                        deviceData: {}
                    }, async function (err, result) {
                        if (err) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            if (result.success) {
                                logger.debug("===braintree===response Id==>>>", result)
                                card_payment_id = result.transaction.id;
                                payment_status = 1
                                await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                                await addAmountToAgentWallet(dbName,user_id,amount);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                            }
                            else {
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
                            }
    
                        }
    
                    });
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
            }
            else if ((unique_id) == "zelle") {
                logger.debug("===============zelle==========", zelle_receipt_url)
                if (zelle_receipt_url == "" || zelle_receipt_url == null) {
                    logger.debug("=======node zelle url============", zelle_receipt_url)
                    let msg = "please provide receipt for zelle";
                    sendResponse.sendErrorMessage(msg, reply, 500);
                } else {

                    payment_source = "zelle"
                    await addWalletTransactionRecordInCaseZelle(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,payment_source,"")
                    // await addAmountToUserWallet(dbName,user_id,amount);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
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
                    await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,payment_source,"")
                    await addAmountToAgentWallet(dbName,user_id,amount);
                    sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                }
            }
            else if ((unique_id) == config.get("payment.squareup.unique_id")) {
                payment_source = "squareup";
                let squareData = await Universal.getSquareupSecretKey(dbName)
    
                if (Object.keys(squareData).length > 0) {
                    var SquareConnect = require('square-connect');
                    // Set Square Connect credentials and environment
                    var defaultClient = SquareConnect.ApiClient.instance;
                    // Configure OAuth2 access token for authorization: oauth2
                    var oauth2 = defaultClient.authentications['oauth2'];
                    oauth2.accessToken = squareData.square_token;
                    // Set 'basePath' to switch between sandbox env and production env
                    // sandbox: https://connect.squareupsandbox.com
                    // production: https://connect.squareup.com
                    let basePathOfSequare = process.env.NODE_ENV == 'prod' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
                    logger.debug("=basePathOfSequare===", basePathOfSequare);
                    defaultClient.basePath = process.env.NODE_ENV == 'prod' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com'
    
                    let payment_object = {};
                    const idempotency_key = crypto.randomBytes(22).toString('hex');
                    var apiInstance = new SquareConnect.PaymentsApi();
                    // you cand Add some Optional params acc. to the requirements in the PaymentObj
                    //https://developer.squareup.com/reference/square/payments-api/create-payment/explorer
                    // logger.debug("==withou,with=", parseInt(Math.round(parseFloat((amount - referralAmount) * 100))), typeof parseInt(Math.round(parseFloat((amount - referralAmount) * 100))), typeof Math.round(parseFloat((amount - referralAmount) * 100)))
                    if (customer_payment_id !== "" && card_id !== "") {
                        payment_object = {
                            amount_money: {
                                amount: parseInt(Math.round(parseFloat((amount) * 100))),    // 100 Cent == $1.00 charge
                                currency: "USD"
                            },
                            // currency: currency,
                            source_id: card_id,
                            customer_id: customer_payment_id,
                            idempotency_key: idempotency_key,
                            note: 'Made an booking'
                        }
                    } else {
                        payment_object = {
                            source_id: payment_token,
                            amount_money: {
                                amount: parseInt(Math.round(parseFloat((amount) * 100))),    // 100 Cent == $1.00 charge
                                currency: "USD"
                            },
                            idempotency_key: idempotency_key,
                            note: 'Made an booking'
    
                        };
                    }
                    logger.debug("===payment_object=", payment_object);
                    apiInstance.createPayment(payment_object).then(async function (data) {
                        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                        card_payment_id = data.payment.id;
                        transaction_id = idempotency_key
                        payment_status = 1
                        await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                        await addAmountToAgentWallet(dbName,user_id,amount);
                        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                    }, function (error) {
                        console.error(error);
                        return sendResponse.sendErrorMessage(
                            Universal.getMsgText(
                                languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    });
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
    
            }
            else if ((unique_id) == config.get("payment.cybersource.unique_id")) {
                payment_source = "cybersource";
                let cyberSourceData = await Universal.getCyberSourceData(dbName);
                logger.debug("==cyberSourceData====", cyberSourceData);
                if (Object.keys(cyberSourceData).length > 0) {
                    var cybersourceRestApi = require('cybersource-rest-client');
                    try {
                        var instance = new cybersourceRestApi.PaymentsApi({
                            'authenticationType': process.env.NODE_ENV == 'prod' ? 'https_signature' : 'http_signature',
                            'runEnvironment': process.env.NODE_ENV == 'prod' ? 'cybersource.environment.production' : 'cybersource.environment.SANDBOX',
                            'merchantID': cyberSourceData.cybersource_merchant_id,
                            'merchantKeyId': cyberSourceData.cybersource_merchant_key_id,
                            'merchantsecretKey': cyberSourceData.cybersource_merchant_secret_key
                        });
                        var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
                        processingInformation.commerceIndicator = 'internet';
                        // var aggregatorInformation = new cybersourceRestApi.Ptsv2paymentsAggregatorInformation();
    
    
                        var amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
                        amountDetails.totalAmount = parseFloat(parseFloat(amount));
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
                        customer.customerId = payment_token;
                        // card.expirationYear = cardData[0].exp_year
                        // card.number = cardData[0].card_number;
                        // card.expirationMonth = cardData[0].exp_month;
                        // card.securityCode = await Universal.getDecryptData(cardData[0].cvc);
                        // // customer.customer_payment_id
                        // card.type = cardData[0].card_type;
                        // paymentInformation.card = card;
                        paymentInformation.customer = customer
                        var cbrequest = new cybersourceRestApi.CreatePaymentRequest();
                        // request.clientReferenceInformation = clientReferenceInformation;
                        cbrequest.processingInformation = processingInformation;
                        // request.aggregatorInformation = aggregatorInformation;
                        cbrequest.orderInformation = orderInformation;
                        cbrequest.paymentInformation = paymentInformation;
                        cbrequest.processingInformation.capture = true;
                        console.log('\n*************** Process Payment ********************* ');
    
                        instance.createPayment(cbrequest,async  function (error, data, response) {
                            if (error) {
    
                                console.log('\nError in process a payment : ' + JSON.stringify(error));
                                return sendResponse.sendErrorMessage(
                                    Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
                            }
                            else {
                                console.log('\nData of process a payment : ' + JSON.stringify(response['status']), JSON.stringify(response['id']))
                                card_payment_id = data.id;
                                payment_status = 1
                                await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                                await addAmountToAgentWallet(dbName,user_id,amount);
                                sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                            }
                            // console.log('\nResponse of process a payment : ' + JSON.stringify(response));
                            // console.log('\nResponse Code of process a payment : ' + JSON.stringify(response['status']));
                            // callback(error, data);
                        });
                    } catch (error) {
                        logger.debug("======ERR!===>>", error)
                        return sendResponse.sendErrorMessage(
                            Universal.getMsgText(
                                languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    }
    
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
    
            }
            else if ((unique_id) == config.get("payment.paytab.unique_id")) {
                let payTabData = await Universal.getPayTabData(dbName);
    
                payment_source = "paytab";
                if (Object.keys(payTabData).length > 0) {
                    web_request.post({
                        url: "https://www.paytabs.com/apiv2/verify_payment_transaction",
                        method: "POST",
                        form: {
                            "merchant_email":payTabData.merchant_email,
                            "secret_key":payTabData.paytabs_secret_key,
                            // "merchant_email":"Kiran.girija@afoc.mil.ae", //payTabData.paytab_merchant_email,
                            // "secret_key":"QGj2hCvxNdFnoA9QZe9jm8QSr2S44FcUmvWD7sbUFRh4rrUrG4L2cCUEENJJsVDPqAsy3EtIvLNXdHoTM9WYLRDqEm97hNWIophr",//payTabData.paytab_secret_key,
                            "transaction_id": customer_payment_id
                        }
    
                    }, async function (error, response, body) {
                        logger.debug("===paytabErr!===", error)
                        if (error) {
                            return sendResponse.sendErrorMessage(
                                await Universal.getMsgText(
                                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                reply, 400);
                        }
                        else {
                            card_payment_id = JSON.parse(body).transaction_id;
                            payment_status = 1
                            await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToAgentWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
                        }
    
                    })
                }
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
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
                    var amountForPeachSandbox =parseInt(amount)
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
                            await addAgentWalletTransactionRecord(dbName,user_id,amount,card_payment_id,by_admin,0,1,0,payment_source,"")
                            await addAmountToAgentWallet(dbName,user_id,amount);
                            sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, reply, 200)
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
    
            else {
                return sendResponse.sendErrorMessage(
                    await Universal.getMsgText(
                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                    reply, 400);
            }
        }
         
    }
    catch (Err) {
        logger.debug("======ERR!===?", Err)
        return sendResponse.sendErrorMessage("Sorry payment failed",reply, 400);
    }
}

const walletUserMoneyCheck = async(user_id,amount,dbName,reply)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select id, wallet_amount  from user where id=?";
            let params = [user_id];
            let result = await ExecuteQ.Query(dbName,query,params);
          
            if(parseFloat(result[0].wallet_amount)<parseFloat(amount)){
                sendResponse.sendErrorMessage("Insufficient balance in your wallet amount",reply,400);
            }else{
                resolve();
            }

        }catch(error){
            logger.debug("=======er=========",error);
            reject(error);
        }
    })
}
const walletAgentMoneyCheck = async(user_id,amount,dbName,reply)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            
            let query = "select id, wallet_amount  from cbl_user where id=?";
            let params = [user_id];
            let getAgentDbData=await common.GetAgentDbInformation(dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            var result = await ExecuteQ.QueryAgent(agentConnection,query,params);
            //let result = await ExecuteQ.Query(agentDb,query,params);
          
            if(parseFloat(result[0].wallet_amount)<parseFloat(amount)){
                sendResponse.sendErrorMessage("Insufficient balance in your wallet amount",reply,400);
            }else{
                resolve();
            }

        }catch(error){
            logger.debug("=======er=========",error);
            reject(error);
        }
    })
}



const shareWalletMoney = async(request,response)=>{
    try{
        let share_through = ""
        let comment = request.body.comment!==undefined?request.body.comment:""
        let user_email = request.body.user_email!==undefined || request.body.user_email!==""?request.body.user_email:""
        let phone_number = request.body.phone_number!==undefined || request.body.phone_number!==""?request.body.phone_number:""
        let amount = request.body.amount;
        let countryCode = request.body.countryCode==undefined?"":request.body.countryCode
        let share_by_user_id = request.users.id

        await walletUserMoneyCheck(share_by_user_id,amount,request.dbName,response);
       
        if(user_email!==""){
            share_through = "email";
        }else{
            share_through = "phone";
        }
        logger.debug("========useremail==phonenumber===amount======",user_email,phone_number,amount);
        let share_with_user_details = await getUserDetails(request.dbName,user_email,phone_number,0,countryCode);
        logger.debug("=======share_with_user_details==============",share_with_user_details)
        if(share_with_user_details && share_with_user_details<=0){
            return sendResponse.sendErrorMessage("user does not exist with this email or phone number",response,500);
        }
        logger.debug("")
       
        logger.debug("-----------share by user id--------",share_by_user_id)
        let share_by_user_details = await getUserDetails(request.dbName,"","",share_by_user_id,"");
        logger.debug("=======share_by_user_details  ==============",share_with_user_details)

        if(share_by_user_details.wallet_amount<amount){
            return sendResponse.sendErrorMessage("Your don't have enough amount to share",response,500);
        }
       let shareDetails =  await shareMoneyWithUser(request.dbName,share_by_user_id,share_with_user_details.id,amount,"wallet_money");
    //    insertId
        await addWalletTransactionRecord(request.dbName,share_with_user_details.id,amount,"",0,1,1,shareDetails.insertId,"share with "+share_through,comment);
        await addWalletTransactionRecord(request.dbName,share_by_user_id,amount,"",0,1,0,shareDetails.insertId,"share with "+share_through,comment);


        await deductAmountFromUserWallet(request.dbName,share_by_user_id,amount)
        await addAmountToUserWallet(request.dbName,share_with_user_details.id,amount)
        return sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, response, 200);
    }catch(error){
        logger.debug("-------",error)
        sendResponse.sendErrorMessage("Error while transferring money to user wallet",response,500);
    }
}

const agentShareWalletMoney = async(request,response)=>{
    try{
        let share_through = ""
        let comment = request.body.comment!==undefined?request.body.comment:""
        let user_email = request.body.user_email!==undefined || request.body.user_email!==""?request.body.user_email:""
        let phone_number = request.body.phone_number!==undefined || request.body.phone_number!==""?request.body.phone_number:""
        let amount = request.body.amount;
        let countryCode = request.body.countryCode==undefined?"":request.body.countryCode
        let share_by_user_id = request.body.user_id//current user id

        await walletAgentMoneyCheck(share_by_user_id,amount,request.dbName,response);
       
        if(user_email!==""){
            share_through = "email";
        }else{
            share_through = "phone";
        }
        logger.debug("========useremail==phonenumber===amount======",user_email,phone_number,amount);
        let share_with_user_details = await getAgentDetails(request.dbName,user_email,phone_number,0,countryCode);
        logger.debug("=======share_with_user_details==============",share_with_user_details)
        if(share_with_user_details && share_with_user_details<=0){
            return sendResponse.sendErrorMessage("user does not exist with this email or phone number",response,500);
        }
        logger.debug("")
       
        logger.debug("-----------share by user id--------",share_by_user_id)
        let share_by_user_details = await getAgentDetails(request.dbName,"","",share_by_user_id,"");
        logger.debug("=======share_by_user_details  ==============",share_with_user_details)

        if(share_by_user_details.wallet_amount<amount){
            return sendResponse.sendErrorMessage("Your don't have enough amount to share",response,500);
        }
       let shareDetails =  await shareMoneyWithAgent(request.dbName,share_by_user_id,share_with_user_details.id,amount,"wallet_money");
    //    insertId
        await addAgentWalletTransactionRecord(request.dbName,share_with_user_details.id,amount,"",0,1,1,shareDetails.insertId,"share with "+share_through,comment);
        await addAgentWalletTransactionRecord(request.dbName,share_by_user_id,amount,"",0,1,0,shareDetails.insertId,"share with "+share_through,comment);


        await deductAmountFromAgentWallet(request.dbName,share_by_user_id,amount)
        await addAmountToAgentWallet(request.dbName,share_with_user_details.id,amount)
        return sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, response, 200);
    }catch(error){
        logger.debug("-------",error)
        sendResponse.sendErrorMessage("Error while transferring money to user wallet",response,500);
    }
}



function getUserDetails(dbName,user_email,phone_number,user_id,countryCode){
    return new Promise(async(resolve,reject)=>{
        try{
            let where_clause = ""
            let params = []
            if(user_email!=="" && user_email!==undefined){
                where_clause = "where email=?"
                params = [user_email]
            }else{
                where_clause = "where country_code=? having mobile_no=? or phone=?"
                let number_without_special_char = phone_number.replace("(","").replace(")","").replace("-","").replace(/ /g, "")
                params = [countryCode,number_without_special_char,phone_number]
            }

            if(user_id!=0){
                where_clause = "where id=?"
                params = [user_id]
            }
    
            let query = "select id,replace(replace(replace(replace(mobile_no,'-',''),'(',''),')',''),' ','') as mobile_no,mobile_no as phone from user "+where_clause+" ";
            let user_details = await ExecuteQ.Query(dbName,query,params);
            if(user_details && user_details.length>0){
                resolve(user_details[0]);
            }else{
                resolve(user_details)
            }
        }catch(err){
            logger.debug("===============err=========",err);
            reject(err);
        }
    })
}
function getAgentDetails(dbName,user_email,phone_number,user_id,countryCode){
    return new Promise(async(resolve,reject)=>{
        try{
            
            let where_clause = ""
            let params = []
            if(user_email!=="" && user_email!==undefined){
                where_clause = "where email=?"
                params = [user_email]
            }else{
                // where_clause = "where country_code=? having phone_number=?"
                // params = [countryCode,phone_number]
                countryCode = countryCode.replace("+","");
                where_clause = "where (country_code=? or country_code=?) having phone_number=? or phone_number=?"
                let number_without_special_char = phone_number.replace("(","").replace(")","").replace("-","").replace(/ /g, "")
                params = [countryCode,"+",countryCode,number_without_special_char,phone_number]
            }

            if(user_id!=0){
                where_clause = "where id=?"
                params = [user_id]
            }
    
            let query = "select id,replace(replace(replace(replace(phone_number,'-',''),'(',''),')',''),' ','') as mobile_no, wallet_amount, phone_number as phone from cbl_user "+where_clause+" ";

            let getAgentDbData=await common.GetAgentDbInformation(dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            var user_details = await ExecuteQ.QueryAgent(agentConnection,query,params);
            //let user_details = await ExecuteQ.Query(agentDb,query,params);
            if(user_details && user_details.length>0){
                resolve(user_details[0]);
            }else{
                resolve(user_details)
            }
        }catch(err){
            logger.debug("===============err=========",err);
            reject(err);
        }
    })
}


function shareMoneyWithUser(dbName,share_by_id,share_with_id,amount,share_through){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "insert into user_wallet_share(share_by,share_with,amount,share_through) values(?,?,?,?)"
            let params = [share_by_id,share_with_id,amount,share_through]
            let result = await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(err){
            logger.debug("===============err=========",err);
            reject(err);
        }
    })
}
function shareMoneyWithAgent(dbName,share_by_id,share_with_id,amount,share_through){
    return new Promise(async(resolve,reject)=>{
        try{
            
            let query = "insert into cbl_user_wallet_share(share_by,share_with,amount,share_through) values(?,?,?,?)"
            let params = [share_by_id,share_with_id,amount,share_through]

            let getAgentDbData=await common.GetAgentDbInformation(dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            var result = await ExecuteQ.QueryAgent(agentConnection,query,params);
            
            //let result = await ExecuteQ.Query(agentDb,query,params);
            resolve(result);
        }catch(err){
            logger.debug("===============err=========",err);
            reject(err);
        }
    })
}


const addWalletTransactionRecord = async (dbName,user_id,amount,card_payment_id,
    by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "insert into user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment) values(?,?,?,?,?,?,?,?,?)"
            let params = [user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment]
            await ExecuteQ.Query(dbName,query,params);
            resolve();
        }catch(err){
            logger.debug("========err======",err);
            reject(err);
        }
    })
}

const addWalletTransactionRecordInCaseZelle = async (dbName,user_id,amount,card_payment_id,
    by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "insert into user_wallet_transactions(is_approved,user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment) values(?,?,?,?,?,?,?,?,?,?)"
            let params = [0,user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment]
            await ExecuteQ.Query(dbName,query,params);
            resolve();
        }catch(err){
            logger.debug("========err======",err);
            reject(err);
        }
    })
}
const addAmountToUserWallet = async (dbName,user_id,amount)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query1 = "update user set wallet_amount=wallet_amount+? where id=?"
            let params1 = [amount,user_id]
            await ExecuteQ.Query(dbName,query1,params1);
            resolve();
        }catch(err){
            logger.debug("========err======",err);
            reject(err);
        }
    })
}

const deductAmountFromUserWallet = async (dbName,user_id,amount)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query1 = "update user set wallet_amount=wallet_amount-? where id=?"
            let params1 = [amount,user_id]
            await ExecuteQ.Query(dbName,query1,params1);
            resolve();
        }catch(err){
            logger.debug("========err======",err);
            reject(err);
        }
    })
}
const deductAmountFromAgentWallet = async (dbName,user_id,amount)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            
            let query1 = "update cbl_user set wallet_amount=wallet_amount-? where id=?"
            let params1 = [amount,user_id]

            let getAgentDbData=await common.GetAgentDbInformation(dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            var result = await ExecuteQ.QueryAgent(agentConnection,query1,params1);

            //await ExecuteQ.Query(agentDb,query1,params1);
            resolve();
        }catch(err){
            logger.debug("========err======",err);
            reject(err);
        }
    })
}

const userWalletTransactions = async(request,response)=>{
    try{
        let limit = request.query.limit || 1000;
        let skip = request.query.skip || 0;
        let user_id = request.users.id;
        let data = await userTransactionsDetails(request.dbName,user_id,limit,skip);

        return sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS, response, 200);
    }catch(error){
        logger.debug("-------",error)
        sendResponse.sendErrorMessage(sendResponse.somethingWentWrongError(response),response,500);
    }
}

const agentWalletTransactions = async(request,response)=>{
    try{
        let limit = request.query.limit || 1000;
        let skip = request.query.skip || 0;
        let user_id = request.query.user_id;

        let data = await agentWalletTransactionsDetails(request.dbName,user_id,limit,skip);

        return sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS, response, 200);
    }catch(error){
        logger.debug("-------",error)
        sendResponse.sendErrorMessage(sendResponse.somethingWentWrongError(response),response,500);
    }
}



const addAgentWalletTransactionRecord = async (dbName,user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "insert into cbl_user_wallet_transactions(user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment) values(?,?,?,?,?,?,?,?,?)"
            let params = [user_id,amount,card_payment_id,by_admin,added_deduct_through,is_add,user_wallet_share_id,payment_source,comment]
            

            let getAgentDbData=await common.GetAgentDbInformation(dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            var result = await ExecuteQ.QueryAgent(agentConnection,query,params);

            //await ExecuteQ.Query(agentDb,query,params);
            resolve();
        }catch(err){
            console.log("========wallet=acception==error====",err);
            reject(err);
        }
    })
}


const addAmountToAgentWallet = async (dbName,user_id,amount)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query1 = "update cbl_user set wallet_amount=wallet_amount+? where id=?"
            let params1 = [amount,user_id]

            

            let getAgentDbData=await common.GetAgentDbInformation(dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            var result = await ExecuteQ.QueryAgent(agentConnection,query1,params1);

            //await ExecuteQ.Query(agentDb,query1,params1);
            resolve();
        }catch(err){
            logger.debug("========err======",err);
            reject(err);
        }
    })
}

const userTransactionsDetails = (dbName,user_id,limit,skip)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from user_wallet_transactions where user_id=? order by id desc limit ?,?";
            let params = [user_id,skip,limit];
            let result = await ExecuteQ.Query(dbName,query,params);
            let query2 = "select count(id) as total from user_wallet_transactions where user_id=?";
            let params2 = [user_id];
            let totalResult = await ExecuteQ.Query(dbName,query2,params2);
            let query3 = "select id,email,mobile_no,wallet_amount,phone_no,firstname,lastname,country_code from user where id=?";
            let result3 = await ExecuteQ.Query(dbName,query3,[user_id]);



            // let shareWalletDetails = await ExecuteQ.Query(dbName,"select * from user_wallet_share where share_by=? or share_with=?",[user_id,user_id]);

            if (result && result.length > 0) {
                for (const [index, i] of result.entries()) {
                    let shareWalletDetails = await ExecuteQ.Query(dbName, "select * from user_wallet_share where id=?", [i.user_wallet_share_id]);
                    if (shareWalletDetails && shareWalletDetails.length > 0) {
                        if (i.user_id == shareWalletDetails[0].share_by && i.is_add==0) {
                            i.share_amount = shareWalletDetails[0].amount
                            i.shareDate = shareWalletDetails[0].created_at
                            i.share_through = shareWalletDetails[0].share_through   
                            let shareByDetails = await ExecuteQ.Query(dbName,"select firstname,email,mobile_no from user where id = ?",[shareWalletDetails[0].share_with]);
                            i.share_user_name = shareByDetails[0].firstname
                            i.share_user_email = shareByDetails[0].email
                            i.share_mobile_no = shareByDetails[0].mobile_no
                        } else
                        if (i.user_id == shareWalletDetails[0].share_with && i.is_add==1) {
                            i.share_amount = shareWalletDetails[0].amount
                            i.shareDate = shareWalletDetails[0].created_at
                            i.share_through = shareWalletDetails[0].share_through
                            let shareWithDetails = await ExecuteQ.Query(dbName,"select firstname,email,mobile_no from user where id = ?",[shareWalletDetails[0].share_by]);
                            i.share_user_name = shareWithDetails[0].firstname
                            i.share_user_email = shareWithDetails[0].email
                            i.share_mobile_no = shareWithDetails[0].mobile_no
                        }
                    }
                     else {
                        i.share_amount = 0
                        i.shareDate = ""
                        i.share_through = ""
                        i.share_user_name = ""
                        i.share_user_email = ""
                        i.share_mobile_no = ""
                    }
                }
            }

            let data = {
                transactions : result,
                count : totalResult[0].total,
                userDetails : result3[0]
            }
            resolve(data)
        }catch(err){
            logger.debug("===========",err);
            reject(err);
        }
    })
}

const agentWalletTransactionsDetails = (dbName,user_id,limit,skip)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let getAgentDbData=await common.GetAgentDbInformation(dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            
            let query = "select * from  cbl_user_wallet_transactions where user_id=? order by id desc limit ?,?";
            let params = [user_id,skip,limit];
            //let result = await ExecuteQ.Query(agentDb,query,params);
            let result = await ExecuteQ.QueryAgent(agentConnection,query,params);
            let query2 = "select count(id) as total from cbl_user_wallet_transactions where user_id=?";
            let params2 = [user_id];
            //let totalResult = await ExecuteQ.Query(agentDb,query2,params2);
            let totalResult = await ExecuteQ.QueryAgent(agentConnection,query2,params2);


            let query3 = "select id,email,`phone_number`,GREATEST(wallet_amount, 0) as wallet_amount,name,country_code from cbl_user where id=?";
            //let result3 = await ExecuteQ.Query(agentDb,query3,[user_id]);

            let result3 = await ExecuteQ.QueryAgent(agentConnection,query3,[user_id]);



            // let shareWalletDetails = await ExecuteQ.Query(dbName,"select * from user_wallet_share where share_by=? or share_with=?",[user_id,user_id]);

            if (result && result.length > 0) {
                for (const [index, i] of result.entries()) {
                    //let shareWalletDetails = await ExecuteQ.Query(agentDb, "select * from cbl_user_wallet_share where id=?", [i.user_wallet_share_id]);
                    let shareWalletDetails = await ExecuteQ.QueryAgent(agentConnection,"select * from cbl_user_wallet_share where id=?", [i.user_wallet_share_id]);
                    if (shareWalletDetails && shareWalletDetails.length > 0) {
                        if (i.user_id == shareWalletDetails[0].share_by && i.is_add==0) {
                            i.share_amount = shareWalletDetails[0].amount
                            i.shareDate = shareWalletDetails[0].created_at
                            i.share_through = shareWalletDetails[0].share_through   
                            //let shareByDetails = await ExecuteQ.Query(agentDb,"select name,email,phone_number from cbl_user where id = ?",[shareWalletDetails[0].share_with]);
                            let shareByDetails = await ExecuteQ.QueryAgent(agentConnection,"select name,email,phone_number from cbl_user where id = ?",[shareWalletDetails[0].share_with]);
                            i.share_user_name = shareByDetails[0].name
                            i.share_user_email = shareByDetails[0].email
                            i.share_mobile_no = shareByDetails[0].phone_number
                        } else
                        if (i.user_id == shareWalletDetails[0].share_with && i.is_add==1) {
                            i.share_amount = shareWalletDetails[0].amount
                            i.shareDate = shareWalletDetails[0].created_at
                            i.share_through = shareWalletDetails[0].share_through
                            //let shareWithDetails = await ExecuteQ.Query(agentDb,"select name,email,phone_number from cbl_user where id = ?",[shareWalletDetails[0].share_by]);
                            let shareWithDetails = await ExecuteQ.QueryAgent(agentConnection,"select name,email,phone_number from cbl_user where id = ?",[shareWalletDetails[0].share_by]);
                            i.share_user_name = shareWithDetails[0].name
                            i.share_user_email = shareWithDetails[0].email
                            i.share_mobile_no = shareWithDetails[0].phone_number
                        }
                    }

                     else {
                        i.share_amount = 0
                        i.shareDate = ""
                        i.share_through = ""
                        i.share_user_name = ""
                        i.share_user_email = ""
                        i.share_mobile_no = ""
                    }

                }
            }

            let data = {
                transactions : result,
                count : totalResult[0].total,
                userDetails : result3[0]
            }
            
            resolve(data)
        }catch(err){
            logger.debug("===========",err);
            reject(err);
        }
    })
}


const adminWalletTransactions = async(request,response)=>{
    try{
        let limit = request.query.limit || 1000;
        let skip = request.query.skip || 0;
        let user_id = request.query.user_id!==undefined && request.query.user_id!==0?request.query.user_id:0
        let data = await adminTransactionsDetails(request.dbName,user_id,limit,skip);
        return sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS, response, 200);
    }catch(error){
        logger.debug("-------",error)
        sendResponse.sendErrorMessage(sendResponse.somethingWentWrongError(response),response,500);
    }
}

const adminTransactionsDetails = (dbName,user_id,limit,skip)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from user_wallet_transactions where user_id=?   order by id desc limit ?,?";
            let params = [user_id,skip,limit];
            let result = await ExecuteQ.Query(dbName,query,params);
            let query2 = "select count(id) as total from user_wallet_transactions where user_id=?";
            let params2 = [user_id];
            let totalResult = await ExecuteQ.Query(dbName,query2,params2);

            let query3 = "select id,email,mobile_no,wallet_amount,phone_no,firstname,lastname,country_code from user where id=?";
            let result3 = await ExecuteQ.Query(dbName,query3,[user_id]);

            
          
            if (result && result.length > 0) {
                for (const [index, i] of result.entries()) {
                    let shareWalletDetails = await ExecuteQ.Query(dbName, "select * from user_wallet_share where id=?", [i.user_wallet_share_id]);
                    if (shareWalletDetails && shareWalletDetails.length > 0) {
                        if (i.user_id == shareWalletDetails[0].share_by && i.is_add==0) {
                            i.share_amount = shareWalletDetails[0].amount
                            i.shareDate = shareWalletDetails[0].created_at
                            i.share_through = shareWalletDetails[0].share_through   
                            let shareByDetails = await ExecuteQ.Query(dbName,"select firstname,email,mobile_no from user where id = ?",[shareWalletDetails[0].share_with]);
                            i.share_user_name = shareByDetails[0].firstname
                            i.share_user_email = shareByDetails[0].email
                            i.share_mobile_no = shareWalletDetails[0].mobile_no
                        } else
                        if (i.user_id == shareWalletDetails[0].share_with && i.is_add==1) {
                            i.share_amount = shareWalletDetails[0].amount
                            i.shareDate = shareWalletDetails[0].created_at
                            i.share_through = shareWalletDetails[0].share_through
                            let shareWithDetails = await ExecuteQ.Query(dbName,"select firstname,email,mobile_no from user where id = ?",[shareWalletDetails[0].share_by]);
                            i.share_user_name = shareWithDetails[0].firstname
                            i.share_user_email = shareWithDetails[0].email
                            i.share_mobile_no = shareWalletDetails[0].mobile_no
                        }
                    }
                     else {
                        i.share_amount = 0
                        i.shareDate = ""
                        i.share_through = ""
                        i.share_user_name = ""
                        i.share_user_email = ""
                        i.share_mobile_no = ""
                    }
                }
            }


            let data = {
                transactions : result,
                count : totalResult[0].total,
                userDetails : result3[0]
            }
            resolve(data)
        }catch(err){
            logger.debug("===========",err);
            reject(err);
        }
    })
}
/**
 * @description used for approve an wallet transaction done from zelle
 * @param {*Object} req 
 * @param {*Object} res 
 */
const approveWalletTransaction=async(req,res)=>{
    try{
        let id=req.body.transId;
        let transactionData=await ExecuteQ.Query(req.dbName,`select * from user_wallet_transactions where id=? and is_approved=?`,[id,0]);
        if(transactionData && transactionData.length>0){
            let query1 = "update user set wallet_amount=wallet_amount+? where id=?"
            let params1 = [parseFloat(transactionData[0].amount),transactionData[0].user_id]
            await ExecuteQ.Query(req.dbName,query1,params1);
            await ExecuteQ.Query(req.dbName,`update user_wallet_transactions set is_approved=? where id=?`,[id]);
        }
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);  
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
module.exports = {
    approveWalletTransaction:approveWalletTransaction,
    addMoneyToWallet: addMoneyToWallet,
    addMoneyToAgentWallet:addMoneyToAgentWallet,
    shareWalletMoney:shareWalletMoney,
    agentShareWalletMoney:agentShareWalletMoney,
    userWalletTransactions : userWalletTransactions,
    agentWalletTransactions:agentWalletTransactions,
    adminWalletTransactions:adminWalletTransactions
}