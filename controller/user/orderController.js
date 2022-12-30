
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
var common = require('../../routes/commonfunction')
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
const Agent = require('../../common/agent')
let Execute = require('../../lib/Execute');
let web_request = require('request');


const generateOrder = async (req, res) => {
    try {
        logger.debug("====input===>>", req.dbName);
        var agent_id_array = req.body.agentIds != undefined ? req.body.agentIds : [];
        var cart_id = req.body.cartId;
        var language_id = req.body.languageId;
        var is_package = req.body.isPackage;
        var payment_type = req.body.paymentType;
        var offset = req.body.offset;
        var duration = req.body.duration;
        var agent_data;
        // var date_time=req.body.date
        var booking_date_time = req.body.date_time != undefined && req.body.date_time != "" ? req.body.date_time : "";
        if (booking_date_time != "") {
            dateTime = new Date(booking_date_time);
            booking_date = moment(dateTime).format("YYYY-MM-DD");
            slots = moment(dateTime).format("HH:mm:ss");
        }
        var service_ids = await ServiceIds(cart_id, req.dbName);
        logger.debug("=======service_ids=====", service_ids);
        if (agent_id_array && agent_id_array.length > 0) {
            var agent_data = await AgentValidation(agent_id_array, service_ids, duration, booking_date_time, req.dbName);
        }
        else {
        }
        // sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (err) {
        logger.debug("============ERR!==", err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG, res, 400);
    }

}
const ServiceIds = (cart_id, dbName) => {

    var service_ids = [];

    return new Promise((resolve, reject) => {

        multiConnection[dbName].query("select product_id from cart_products where cart_id=? ", [cart_id], function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                if (data && data.length > 0) {
                    for (const i of data) {
                        service_ids.push(i.product_id)
                    }
                    resolve(service_ids)
                }
                else {
                    resolve(service_ids)
                }
            }
        })
    })

}

const AgentValidation = (ids, service_ids, duration, date_time, dbName) => {
    return new Promise(async (resolve, reject) => {
        var get_agent_db_info = await Agent.GetAgentDbInformation(dbName);
        var agent_connection = await Agent.RunTimeAgentConnection(get_agent_db_info);
        var sqlQuery = "select id from cbl_user where id IN(?) and deleted_by=?";
        var st = agent_connection.query(sqlQuery, [ids, 0], async function (err, agentData) {
            if (err) {
                reject(CONSTS.SERVER.ERROR_MSG.AGENT.INVALID_AGENT.MSG)
            }
            else {
                var input_data = {
                    "duration": duration,
                    "datetime": date_time,
                    "serviceIds": service_ids
                };
                if (agentData && agentData.length > 0) {
                    try {
                        var api_key = await Agent.KeyData(agent_connection, config.get("agent.api_key"));
                        var secret_key = await Agent.KeyData(agent_connection, config.get("agent.db_secret_key"));
                        var agents_data = await Agent.AvailsAgentIds(input_data, api_key, secret_key);
                        logger.debug("=====agents_data=======", agents_data);
                        resolve(agents_data)
                    }
                    catch (err) {
                        logger.debug("=====err=======", err);
                        reject(CONSTS.SERVER.ERROR_MSG.AGENT.INVALID_AGENT.MSG)
                    }
                }
                else {
                    reject(CONSTS.SERVER.ERROR_MSG.AGENT.INVALID_AGENT.MSG)
                }
            }
        })

    })
}

const addOrderReciept = async (req, res) => {
    try {
        console.log("=============req of add order rec====", req)
        if (req.files.file) {
            var fileName = req.files.file.name
            var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
            logger.debug("==fileExtension=", fileExtension);
            // if(fileExtension=="jpg" || fileExtension=="jpeg" ||
            //  fileExtension=="png" || fileExtension=="gif" || 
            //  fileExtension=="pdf" || fileExtension=="csv")
            // {
            // var image=await uploadMgr.uploadImage(req.files.file)
            var image = await uploadMgr.uploadImageFileToS3BucketNew(req.files.file)
            logger.debug("============image url=======", image)
            sendResponse.sendSuccessData(image, constant.responseMessage.SUCCESS, res, 200);
            // }
            // else{
            //     sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
            // }
        }
        else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
    }
    catch (Err) {
        console.log("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}
const deleteImage = (req, res) => {
    try {
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        sendResponse.somethingWentWrongError(res)
    }
}
const getOrderInShipStation = async (req, res) => {
    try {
        let orderId = req.body.orderId;
        let shippingData = await Universal.getShippingData(req.dbName);
        logger.debug("====shippingData====>>", shippingData);
        let shippinOrderData = await Universal.getShippingOrderDetail(shippingData, "JUSTCBD-" + orderId)
        sendResponse.sendSuccessData(shippinOrderData, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.debug("=====ERR!===", Err);
        sendResponse.somethingWentWrongError(res)
    }
}
const orderRequestByUser = async (req, res) => {
    try {
        let prescriptionImage = "";
        let prescription = req.body.prescription != undefined ? req.body.prescription : "";
        let supplierBranchId = req.body.supplier_branch_id;
        let deliveryId = req.body.deliveryId || 0
        logger.debug("=====BDY==INPUT==>", prescription);
        let user_id = req.users.id;
        if (req.files.file) {
            var fileName = req.files.file.name
            var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
            logger.debug("==fileExtension=", fileExtension);
            if (fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif") {
                // prescriptionImage=await uploadMgr.uploadImage(req.files.file);
                prescriptionImage = await uploadMgr.uploadImageFileToS3BucketNew(req.files.file);
                // `user_id` int(11) NOT NULL DEFAULT '0',
                // `supplier_branch_id` int(11) NOT NULL DEFAULT '0',
                // `prescription` text,
                // `prescription_image` text
                await Execute.Query(req.dbName, "insert into user_order_request(delivery_id,user_id,supplier_branch_id,prescription_image,prescription) values(?,?,?,?,?)",
                    [deliveryId, user_id, supplierBranchId, prescriptionImage, prescription])
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
            else {
                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
            }
        }
        else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
    }
    catch (Err) {
        console.log("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for making an payment from user
 * @param {*Object} request 
 * @param {*Object} reply 
 */
const makeOrderPayment = async (request, reply) => {

    let languageId = request.body.languageId;

    try {
        // logger.debug("=======CONFIG===>>",config,config.get("service"),config.get("agent"))
        let unique_id = request.body.gateway_unique_id != undefined ? (request.body.gateway_unique_id).toLowerCase() : "";
        let order_id = request.body.order_id;
        let orderNetAmount = 0, referralAmount = 0;
        let card_payment_id = "", payment_source = "";
        let customer_payment_id = request.body.customer_payment_id == undefined ? "" : request.body.customer_payment_id
        let card_id = request.body.card_id == undefined ? "" : request.body.card_id
        let currency = request.body.currency != undefined ? request.body.currency : "usd";
        let payment_token = request.body.payment_token;
        let orderData = await Execute.Query(request.dbName, `select * from orders where id=?`, [order_id])

        orderNetAmount = orderData && orderData.length > 0 ? orderData[0].net_amount : 0
        let paymentType = request.body.payment_type;
        logger.debug("==orderNetAmount==>>", orderData, orderNetAmount);

        var userData = await Universal.getUserData(request.dbName, request.headers.authorization);

        switch (parseInt(paymentType)) {
            case 1:
                if ((unique_id) == config.get("payment.strip.unique_id")) {
                    payment_source = "stripe";
                    let strip_secret_key_data = await Universal.getStripSecretKey(request.dbName);
                    logger.debug("==card_id=customer_payment_id=STRIP=DATA==>>", card_id, customer_payment_id, strip_secret_key_data, Math.round(parseFloat(orderNetAmount * 100)))
                    if (strip_secret_key_data && strip_secret_key_data.length > 0) {
                        const stripe = require('stripe')(strip_secret_key_data[0].value);
                        let payment_object = {};
                        if (customer_payment_id !== "" && card_id !== "") {
                            payment_object = {
                                amount: Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
                                currency: currency,
                                source: card_id,
                                customer: customer_payment_id,
                                capture: true,
                                description: '(' + userData[0].email + ') Made an booking',
                            }
                        } else {
                            payment_object = {
                                amount: Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
                                currency: currency,
                                source: payment_token,
                                capture: true,
                                description: '(' + userData[0].email + ') Made an booking',
                            }
                        }
                        stripe.charges.create(payment_object, async function (err, charge) {
                            logger.debug("==Payment===ERR!==>>", err);
                            if (err) {
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
                            }
                            else {
                                card_payment_id = charge.id
                                await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [1, card_payment_id, unique_id, 1, order_id]);
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                    logger.debug("=====conekta_data===USR==DAT!==>>>", 0, conekta_data, userData)

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
                                "unit_price": Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
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
                            card_payment_id = result.toObject().id
                            await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [1, card_payment_id, unique_id, 1, order_id]);
                            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                    logger.debug("======razor_pay_data=net_amount====>>", razor_pay_data, 0 * 100)
                    if (Object.keys(razor_pay_data).length > 0) {
                        web_request({
                            method: 'POST',
                            url: "https://" + razor_pay_data[config.get("payment.razorpay.publish_key")] + ":" + razor_pay_data[config.get("payment.razorpay.secret_key")] + "@api.razorpay.com/v1/payments/" + payment_token + "/capture",
                            form: {
                                amount: (orderNetAmount - referralAmount) * 100,
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
                                await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [1, card_payment_id, unique_id, 1, order_id]);
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                else if ((unique_id) == config.get("payment.paystack.unique_id")) {
                    payment_source = "paystack";
                    let paystack_secret_key_data = await Universal.getPaystackSecretKey(request.dbName);
                    logger.debug("====STRIP=DATA==>>", paystack_secret_key_data, Math.round(parseFloat(0 * 100)))

                    if (paystack_secret_key_data && paystack_secret_key_data.length > 0) {
                        var options = {
                            method: 'GET',
                            url: 'https://api.paystack.co/transaction/verify/' + payment_token + '',
                            headers: {
                                Authorization: 'Bearer ' + paystack_secret_key_data[0].value + ''
                            }
                        };
                        web_request(options, async function (err, response, body) {
                            logger.debug("====Err!==", err)
                            if (err) {
                                return sendResponse.sendErrorMessage(
                                    Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
                            }
                            else {
                                logger.debug("===BoDY===>>==", JSON.parse(body));
                                let verifyData = JSON.parse(body);
                                if (verifyData.status) {
                                    card_payment_id = verifyData.data.reference;
                                    await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [1, card_payment_id, unique_id, 1, order_id]);
                                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                                card_payment_id = payment_token;
                                await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [1, card_payment_id, unique_id, 1, order_id]);
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                            amount: (orderNetAmount - referralAmount),
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
                                    await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [1, card_payment_id, unique_id, 1, order_id]);
                                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                        callback(null)
                    }
                }
                else if ((unique_id) == "tap") {
                    payment_source = "tap"

                    await Execute.Query(request.dbName, `update orders set payment_status=?,payment_type=? where id=? and payment_type IN(?)`, [1, 1, order_id, [0, 3]]);

                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);


                }
                else if ((unique_id) == config.get("payment.squareup.unique_id")) {
                    payment_source = "squareup";

                    let payment_object = {};
                    const idempotency_key = crypto.randomBytes(22).toString('hex');

                    // you cand Add some Optional params acc. to the requirements in the PaymentObj
                    //https://developer.squareup.com/reference/square/payments-api/create-payment/explorer
                    if (customer_payment_id !== "" && card_id !== "") {
                        payment_object = {
                            amount: Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
                            currency: currency,
                            source: card_id,
                            customer: customer_payment_id,
                            note: 'Made an booking',
                        }
                    } else {
                        payment_object = {
                            source_id: payment_token,
                            amount_money: {
                                amount: Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),    // 100 Cent == $1.00 charge
                                currency: currency
                            },
                            idempotency_key: idempotency_key,
                            note: 'Made an booking'
                        };
                    }

                    apiInstance.createPayment(payment_object).then(async function (data) {
                        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                        card_payment_id = data.payment.id;
                        await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [1, card_payment_id, unique_id, 1, order_id]);
                        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
                    }, async function (error) {
                        console.error(error);
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    });


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

                        var dataString = {
                            "source": {
                                "type": "token",
                                "token": payment_token//"tok_4gzeau5o2uqubbk6fufs3m7p54"
                            },
                            "amount": amount,//6500,
                            "currency": currency,//"USD",
                            "reference": order_id,//"ORD-5023-4E89",
                            "metadata": {
                                "card_id": card_id,
                                "customer_payment_id": customer_payment_id
                            }
                        };
                        let checkout_api_url = (process.env.NODE_ENV == 'prod') ? 'https://api.checkout.com/payments' : 'https://api.sandbox.checkout.com/payments';
                        web_request({
                            method: 'POST',
                            //url: "https://api.sandbox.checkout.com/payments",
                            url: checkout_api_url,
                            headers: headers,
                            form: dataString
                        }, async function (error, response, body) {
                            logger.debug("=== Checkout ====", error)
                            if (error) {
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
                            }
                            else {
                                await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [1, card_payment_id, unique_id, 1, order_id]);
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                else if ((unique_id) == config.get("payment.saferpay.unique_id")) {
                    payment_source = "saferpay";

                    let safer_pay_data = await Universal.getSaferPayData(request.dbName);
                    logger.debug("======safer_pay_data====>>", safer_pay_data, 0 * 100)

                    if (Object.keys(safer_pay_data).length > 0) {
                        let orderPricesData = await Execute.Query(request.dbName, `
                        select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op where op.order_id=?
                        `, [order_id]);
                        let items = [];

                        for (const [index, i] of orderPricesData.entries()) {
                            items.push({
                                "Type": "DIGITAL",
                                "Quantity": i.quantity,
                                "Name": i.product_name,
                                "UnitPrice": Math.round(parseFloat((i.price) * 100))
                            })
                        }

                        var firstName = userData[0].name.split(' ').slice(0, -1).join(' ');
                        var lastName = userData[0].name.split(' ').slice(-1).join(' ');
                        let requestId = crypto.randomBytes(22).toString('hex');

                        let payload = {
                            "TerminalId": "17727920",
                            "Payment": {
                                "Amount": {
                                    "Value": Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
                                    "CurrencyCode": currency.toUpperCase()
                                },
                                "OrderId": order_id,
                                "Description": order_id
                            },
                            "Payer": {
                                "BillingAddress": {
                                    "FirstName": firstName,
                                    "LastName": lastName,
                                    "Email": userData[0].email
                                }
                            },
                            "Order": {
                                "Items": items
                            },
                            "RiskFactors": {
                                "DeliveryType": "HOMEDELIVERY",
                                "PayerProfile": {
                                    "HasAccount": false,
                                    "HasPassword": false,
                                    "FirstName": firstName,
                                    "LastName": lastName,
                                    "Email": userData[0].email,
                                    "Phone": {
                                        "Mobile": userData[0].mobile_no
                                    }
                                }
                            },
                            "RequestHeader": {
                                "SpecVersion": "1.20",
                                'CustomerId': "254802",
                                "RequestId": requestId,
                                "RetryIndicator": 0,
                            },
                            "ReturnUrls": {
                                "Success": config.get("payment.saferpay.success_url"),
                                "Fail": config.get("payment.saferpay.cancel_url"),
                                "Abort": config.get("payment.saferpay.cancel_url")
                            }
                        };

                        let username = safer_pay_data.saferpay_username;
                        let password = safer_pay_data.saferpay_password;

                        let authToken = "Basic " + new Buffer(username + ":" + password).toString("base64");

                        var headers = {
                            "Content-type": "application/json",
                            "accetp": "application/json; charset=utf-8",
                            'Authorization': authToken
                        };

                        let url = "https://test.saferpay.com/api/payment/v1/PaymentPage/Initialize";

                        if (process.env.NODE_ENV == 'prod')
                            url = "https://www.saferpay.com/api/payment/v1/PaymentPage/Initialize";

                        web_request({
                            method: 'POST',
                            url: url,
                            headers: headers,
                            body: payload,
                            json: true
                        }, async function (error, response, body) {

                            if (body && body.Behavior == 'ABORT') {
                                console.log('Response:', body);
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
                            }
                            else {
                                card_payment_id = body.ResponseHeader.RequestId;
                                console.log(card_payment_id);
                                await Execute.Query(request.dbName, `update orders set payment_type=?,card_payment_id=?,payment_source=?,payment_status=? where id=?`, [0, card_payment_id, unique_id, 1, order_id]);
                                sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, reply, 200);
                            }

                            if (error) {
                                return sendResponse.sendErrorMessage(
                                    await Universal.getMsgText(
                                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                                    reply, 400);
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
                else {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                        reply, 400);
                }
                break;
            case 0:
                await Execute.Query(request.dbName, `update orders set payment_status=?,payment_type=? where id=? and payment_type IN(?)`, [1, 0, order_id, [0, 3]]);

                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
                break;

        }



    }
    catch (Err) {
        console.log("======ERR!===?", Err)
        return sendResponse.sendErrorMessage(
            await Universal.getMsgText(
                languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
            reply, 400);
    }
}

/**
 * @description used for making an payment from user
 * @param {*Object} request 
 * @param {*Object} reply 
 */
const makeSaferPayment = async (request, reply) => {
    try {
        // logger.debug("=======CONFIG===>>",config,config.get("service"),config.get("agent"))
        let unique_id = "saferpay";
        let amount = request.body.amount, referralAmount = 0;
        let saferpay_request_id = "", payment_source = "";
        let currency = request.body.currency != undefined ? request.body.currency : "usd";
        let languageId = request.body.languageId;

        // var userData = await Universal.getUserData(request.dbName, request.headers.authorization);
        // var catpturTransaction = await Universal.saferpayTransactionCatptur(request.dbName, 39851);
        payment_source = "saferpay";

        let safer_pay_data = await Universal.getSaferPayData(request.dbName);
        logger.debug("==safer_pay_data==>>", safer_pay_data);

        if (Object.keys(safer_pay_data).length > 0) {

            let requestId = crypto.randomBytes(22).toString('hex');

            let payload = {
                "TerminalId": safer_pay_data.saferpay_terminal_id,
                "Payment": {
                    "Amount": {
                        "Value": Math.round(parseFloat((amount - referralAmount) * 100)),
                        "CurrencyCode": currency.toUpperCase()
                    }
                },
                // "Payer": {
                //     "BillingAddress": {
                //     "FirstName": firstName,
                //     "LastName": lastName,
                //     "Email": userData[0].email
                //     }
                // },
                "Payer": {
                    "LanguageCode": "en"
                },
                "RequestHeader": {
                    "SpecVersion": "1.20",
                    'CustomerId': safer_pay_data.saferpay_customer_id,
                    "RequestId": requestId,
                    "RetryIndicator": 0,
                },
                "ReturnUrls": {
                    "Success": request.body.success_url + '?requestId=' + requestId,
                    "Fail": request.body.cancel_url,
                    "Abort": request.body.cancel_url
                }
            };
            let username = safer_pay_data.saferpay_username;
            let password = safer_pay_data.saferpay_password;

            let authToken = "Basic " + new Buffer(username + ":" + password).toString("base64");

            var headers = {
                "Content-type": "application/json",
                "accetp": "application/json; charset=utf-8",
                'Authorization': authToken
            };

            let url = "https://test.saferpay.com/api/Payment/v1/Transaction/Initialize";

            if (process.env.NODE_ENV == 'prod')
                url = "https://www.saferpay.com/api/Payment/v1/Transaction/Initialize";
            // url = "https://www.saferpay.com/api/payment/v1/PaymentPage/Initialize";

            web_request({
                method: 'POST',
                url: url,
                headers: headers,
                body: payload,
                json: true
            }, async function (error, response, body) {

                if (body && body.Behavior == 'ABORT') {
                    console.log('Response:', body);
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                        reply, 400);
                }
                else {
                    saferpay_request_id = body.ResponseHeader.RequestId;
                    let saferpay_token = body.Token;
                    await Execute.Query(request.dbName, `insert into saferpay(saferpay_request_id,saferpay_token) values(?,?)`, [saferpay_request_id, saferpay_token])
                    // await Execute.Query(request.dbName,`update orders set payment_type=?,saferpay_token=?, saferpay_request_id=?,payment_source=?,payment_status=? where id=?`,[1,saferpay_token,saferpay_request_id, unique_id,0,order_id]);
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, reply, 200);
                }

                if (error) {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                        reply, 400);
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
    catch (Err) {
        console.log("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used for payment authorize
 * @param {*Object} request 
 * @param {*Object} reply 
 */
const checkSaferTransactionAuthorize = async (request, reply) => {
    try {
        let order_id = request.body.order_id;
        let orderData = await Execute.Query(request.dbName, `select * from orders where id=?`, [order_id])
        let safer_pay_data = await Universal.getSaferPayData(request.dbName);
        let languageId = request.body.languageId;

        if (Object.keys(safer_pay_data).length > 0) {
            let payload = {
                "RequestHeader": {
                    "SpecVersion": "1.20",
                    "CustomerId": safer_pay_data.saferpay_customer_id,
                    "RequestId": orderData[0].saferpay_request_id,
                    "RetryIndicator": 0
                },
                "Token": orderData[0].saferpay_token
            };
            let username = safer_pay_data.saferpay_username;
            let password = safer_pay_data.saferpay_password;

            let authToken = "Basic " + new Buffer(username + ":" + password).toString("base64");

            var headers = {
                "Content-type": "application/json",
                "accetp": "application/json; charset=utf-8",
                'Authorization': authToken
            };

            let url = "https://test.saferpay.com/api/Payment/v1/Transaction/Authorize";

            if (process.env.NODE_ENV == 'prod')
                url = "https://www.saferpay.com/api/Payment/v1/Transaction/Authorize";
            // url = "https://www.saferpay.com/api/payment/v1/PaymentPage/Initialize";

            web_request({
                method: 'POST',
                url: url,
                headers: headers,
                body: payload,
                json: true
            }, async function (error, response, body) {

                if (body && body.Behavior == 'ABORT') {
                    console.log('Response:', body);
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                        reply, 400);
                }
                else {
                    let card_payment_id = body.Transaction.Id;
                    await Execute.Query(request.dbName, `update orders set card_payment_id=?,payment_status=? where id=?`, [card_payment_id, 1, order_id]);
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, reply, 200);
                }

                if (error) {
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                        reply, 400);
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
    catch (Err) {
        console.log("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used for order return request from the users 
 * @param {*Object} req 
 * @param {*Obkect} res 
 */
const orderReturnRequest = async (req, res) => {
    try {
        let returned_by = "user";
        if (req.path == "/agent/order/return_request") {
            returned_by = "agent";
        }
        let orderPriceId = req.body.order_price_id;
        let userId = req && req.users && req.users.id == undefined ? 0 : req.users.id;
        let productId = req.body.product_id;
        let reasonse = req.body.reason || "";
        let refund_to_wallet = req.body.refund_to_wallet !== undefined ? req.body.refund_to_wallet : 0
        let orderPricesData = await Execute.Query(req.dbName, `
        select * from order_prices op join orders ors on ors.id=op.order_id
          where op.id=? and op.product_id=? and ors.user_id=?
        `, [orderPriceId, productId, userId]);
        if (orderPricesData && orderPricesData.length > 0) {
            let alreadyReturnRequest = await Execute.Query(req.dbName, `select * from order_return_request where order_price_id=?`
                , [orderPriceId]);
            if (alreadyReturnRequest && alreadyReturnRequest.length > 0) {
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
            else {
                await Execute.Query(req.dbName, `insert into order_return_request(reasons,order_price_id,product_id,user_id,refund_to_wallet,returned_by) values(?,?,?,?,?,?)`,
                    [reasonse, orderPriceId, productId, userId, refund_to_wallet, returned_by]
                )
                let getAgentDbData = await Agent.GetAgentDbInformation(req.dbName);
                let agentConnection = await Agent.RunTimeAgentConnection(getAgentDbData);
                let agentOrderData = await Execute.QueryAgent(agentConnection, `select cop.* from  cbl_user_orders  co join cbl_user_order_prices cop on cop.order_id=co.order_id where co.order_id=? and cop.item_id=?`,
                    [orderPricesData[0].order_id, productId]);
                logger.debug("====agentOrderData==", agentOrderData);
                if (agentOrderData && agentOrderData.length > 0) {
                    await Execute.QueryAgent(agentConnection, `insert into cbl_user_order_return(order_id,item_id,status) values(?,?,?)`,
                        [orderPricesData[0].order_id, agentOrderData[0].id, 0])
                }
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
        }
        else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
    }
    catch (Err) {
        console.log("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @description used for order return request from the users 
 * @param {*Object} req 
 * @param {*Obkect} res 
 */
const orderReturnRequestByAgent = async (req, res) => {
    try {
        let returned_by = "user";
        if (req.path == "/agent/order/return_request") {
            returned_by = "agent";
        }
        let orderPriceId = req.body.order_price_id;

        let agent_order_id = req.body.agent_order_id == undefined ? 0 : req.body.agent_order_id
        let productId = req.body.product_id;
        let reasonse = req.body.reason || "";

        let refund_to_wallet = req.body.refund_to_wallet !== undefined ? req.body.refund_to_wallet : 0


        let orderPricesData = await Execute.Query(req.dbName, `
        select *,ors.user_id from order_prices op join orders ors on ors.id=op.order_id
          where op.id=? and op.product_id=?
        `, [orderPriceId, productId]);

        let userId = orderPricesData[0].user_id
        if (orderPricesData && orderPricesData.length > 0) {
            let alreadyReturnRequest = await Execute.Query(req.dbName, `select * from order_return_request where order_price_id=?`
                , [orderPriceId]);
            if (alreadyReturnRequest && alreadyReturnRequest.length > 0) {
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
            else {
                await Execute.Query(req.dbName, `insert into order_return_request(reasons,order_price_id,product_id,user_id,refund_to_wallet,returned_by) values(?,?,?,?,?,?)`,
                    [reasonse, orderPriceId, productId, userId, refund_to_wallet, returned_by]
                )
                let getAgentDbData = await Agent.GetAgentDbInformation(req.dbName);
                let agentConnection = await Agent.RunTimeAgentConnection(getAgentDbData);
                let agentOrderData = await Execute.QueryAgent(agentConnection, `select cop.* from  cbl_user_orders  co join cbl_user_order_prices cop on cop.order_id=co.order_id where co.order_id=? and cop.item_id=?`,
                    [agent_order_id, productId]);
                logger.debug("====agentOrderData==", agentOrderData);
                if (agentOrderData && agentOrderData.length > 0) {
                    await Execute.QueryAgent(agentConnection, `insert into cbl_user_order_return(order_id,item_id,status) values(?,?,?)`,
                        [agent_order_id, productId, 0])
                }
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
        }
        else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
    }
    catch (Err) {
        console.log("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}
const orderRequestList = async (req, res) => {
    try {
        let userId = req.users.id;
        let limit = req.query.limit;
        let offset = req.query.offset;
        // let 
        let countData = await Execute.Query(req.dbName, "select COUNT(*) as total_count from user_order_request where user_id=?", [userId])
        let requestOrderData = await Execute.Query(req.dbName, "select s.name,ur.*,ua.id as user_address_id,ua.address_line_1,ua.address_line_2,ua.latitude,ua.longitude,ua.country_code,ua.customer_address,ua.address_link from user_order_request ur left join user_address ua on ua.id=ur.delivery_id left join supplier_branch sb on sb.id=ur.supplier_branch_id join supplier s on s.id=sb.supplier_id where ur.user_id=? order by ur.id desc limit ? offset ? ",
            [userId, parseInt(limit), parseInt(offset)])
        sendResponse.sendSuccessData({ data: requestOrderData, totalCount: countData[0].total_count }, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.debug("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}
const requestCancelledByUser = async (req, res) => {
    try {
        logger.debug("=============IN==>>========", req.body)
        let id = req.body.id
        let status = 3;
        let reason = req.body.reason || "";
        // let offset = req.query.offset
        await Execute.Query(req.dbName, "update user_order_request set status=?,reasons=? where id=?", [status, reason, id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

    }
    catch (Err) {
        logger.error("=====Err!=", Err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for an making an remaining payment of order
 * @param {*Object} request 
 * @param {*Object} reply 
 */
const makeOrderPaymentOfRemainingAmount = async (request, reply) => {
    try {
        // logger.debug("=======CONFIG===>>",config,config.get("service"),config.get("agent"))
        let unique_id = request.body.gateway_unique_id != undefined ? (request.body.gateway_unique_id).toLowerCase() : "";
        let order_id = request.body.order_id;
        let orderNetAmount = 0, referralAmount = 0;
        let card_payment_id = "", payment_source = "";
        let customer_payment_id = request.body.customer_payment_id == undefined ? "" : request.body.customer_payment_id
        let card_id = request.body.card_id == undefined ? "" : request.body.card_id
        let currency = request.body.currency != undefined ? request.body.currency : "usd";
        let payment_token = request.body.payment_token;
        let orderData = await Execute.Query(request.dbName, `select * from orders where id=?`, [order_id])
        orderNetAmount = orderData && orderData.length > 0 ? orderData[0].remaining_amount : 0
        let languageId = request.body.languageId;
        let paymentType = request.body.payment_type;
        logger.debug("===orderData=orderNetAmount==>>", orderData, orderNetAmount);
        var userData = await Universal.getUserData(request.dbName, request.headers.authorization);

        if ((unique_id) == config.get("payment.strip.unique_id")) {
            payment_source = "stripe";
            let strip_secret_key_data = await Universal.getStripSecretKey(request.dbName);
            logger.debug("==card_id=customer_payment_id=STRIP=DATA==>>", card_id, customer_payment_id, strip_secret_key_data, Math.round(parseFloat(orderNetAmount * 100)))
            if (strip_secret_key_data && strip_secret_key_data.length > 0) {
                const stripe = require('stripe')(strip_secret_key_data[0].value);
                let payment_object = {};
                if (customer_payment_id !== "" && card_id !== "") {
                    payment_object = {
                        amount: Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
                        currency: currency,
                        source: card_id,
                        customer: customer_payment_id,
                        capture: true,
                        description: '(' + userData[0].email + ') Made an booking',
                    }
                } else {
                    payment_object = {
                        amount: Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
                        currency: currency,
                        source: payment_token,
                        capture: true,
                        description: '(' + userData[0].email + ') Made an booking',
                    }
                }
                stripe.charges.create(payment_object, async function (err, charge) {
                    logger.debug("==Payment===ERR!==>>", err);
                    if (err) {
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    }
                    else {
                        card_payment_id = charge.id
                        await Execute.Query(request.dbName, `insert into order_remaining_payment(
                                                order_id,
                                                payment_source,
                                                card_payment_id,
                                                amount
                                                ) values(?,?,?,?)`, [order_id, payment_source, card_payment_id, orderNetAmount - referralAmount])
                        await Execute.Query(request.dbName, `update orders set remaining_amount=? where id=?`, [0, order_id]);

                        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
            logger.debug("=====conekta_data===USR==DAT!==>>>", 0, conekta_data, userData)

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
                        "unit_price": Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
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
                    card_payment_id = result.toObject().id
                    await Execute.Query(request.dbName, `insert into order_remaining_payment(
                                            order_id,
                                            payment_source,
                                            card_payment_id,
                                            amount
                                            ) values(?,?,?,?)`, [order_id, payment_source, card_payment_id, orderNetAmount - referralAmount])
                    await Execute.Query(request.dbName, `update orders set remaining_amount=? where id=?`, [0, order_id]);

                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
            logger.debug("======razor_pay_data=net_amount====>>", razor_pay_data, 0 * 100)
            if (Object.keys(razor_pay_data).length > 0) {
                web_request({
                    method: 'POST',
                    url: "https://" + razor_pay_data[config.get("payment.razorpay.publish_key")] + ":" + razor_pay_data[config.get("payment.razorpay.secret_key")] + "@api.razorpay.com/v1/payments/" + payment_token + "/capture",
                    form: {
                        amount: (orderNetAmount - referralAmount) * 100,
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
                        await Execute.Query(request.dbName, `insert into order_remaining_payment(
                                        order_id,
                                        payment_source,
                                        card_payment_id,
                                        amount
                                        ) values(?,?,?,?)`, [order_id, payment_source, card_payment_id, orderNetAmount - referralAmount])
                        await Execute.Query(request.dbName, `update orders set remaining_amount=? where id=?`, [0, order_id]);
                        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
        else if ((unique_id) == config.get("payment.paystack.unique_id")) {
            payment_source = "paystack";
            let paystack_secret_key_data = await Universal.getPaystackSecretKey(request.dbName);
            logger.debug("====STRIP=DATA==>>", paystack_secret_key_data, Math.round(parseFloat(0 * 100)))

            if (paystack_secret_key_data && paystack_secret_key_data.length > 0) {
                var options = {
                    method: 'GET',
                    url: 'https://api.paystack.co/transaction/verify/' + payment_token + '',
                    headers: {
                        Authorization: 'Bearer ' + paystack_secret_key_data[0].value + ''
                    }
                };
                web_request(options, async function (err, response, body) {
                    logger.debug("====Err!==", err)
                    if (err) {
                        return sendResponse.sendErrorMessage(
                            Universal.getMsgText(
                                languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    }
                    else {
                        logger.debug("===BoDY===>>==", JSON.parse(body));
                        let verifyData = JSON.parse(body);
                        if (verifyData.status) {
                            card_payment_id = verifyData.data.reference;
                            await Execute.Query(request.dbName, `insert into order_remaining_payment(
                                            order_id,
                                            payment_source,
                                            card_payment_id,
                                            amount
                                            ) values(?,?,?,?)`, [order_id, payment_source, card_payment_id, orderNetAmount - referralAmount])
                            await Execute.Query(request.dbName, `update orders set remaining_amount=? where id=?`, [0, order_id]);

                            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                        card_payment_id = payment_token;
                        await Execute.Query(request.dbName, `insert into order_remaining_payment(
                                        order_id,
                                        payment_source,
                                        card_payment_id,
                                        amount
                                        ) values(?,?,?,?)`, [order_id, payment_source, card_payment_id, orderNetAmount - referralAmount])
                        await Execute.Query(request.dbName, `update orders set remaining_amount=? where id=?`, [0, order_id]);

                        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                    amount: (orderNetAmount - referralAmount),
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
                            await Execute.Query(request.dbName, `insert into order_remaining_payment(
                                            order_id,
                                            payment_source,
                                            card_payment_id,
                                            amount
                                            ) values(?,?,?,?)`, [order_id, payment_source, card_payment_id, orderNetAmount - referralAmount])
                            await Execute.Query(request.dbName, `update orders set remaining_amount=? where id=?`, [0, order_id]);
                            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
                callback(null)
            }
        }
        else if ((unique_id) == config.get("payment.squareup.unique_id")) {
            payment_source = "squareup";

            let payment_object = {};
            const idempotency_key = crypto.randomBytes(22).toString('hex');

            // you cand Add some Optional params acc. to the requirements in the PaymentObj
            //https://developer.squareup.com/reference/square/payments-api/create-payment/explorer
            if (customer_payment_id !== "" && card_id !== "") {
                payment_object = {
                    amount: Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),
                    currency: currency,
                    source: card_id,
                    customer: customer_payment_id,
                    note: 'Made an booking',
                }
            } else {
                payment_object = {
                    source_id: payment_token,
                    amount_money: {
                        amount: Math.round(parseFloat((orderNetAmount - referralAmount) * 100)),    // 100 Cent == $1.00 charge
                        currency: currency
                    },
                    idempotency_key: idempotency_key,
                    note: 'Made an booking'
                };
            }

            apiInstance.createPayment(payment_object).then(async function (data) {
                console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                card_payment_id = data.payment.id;
                await Execute.Query(request.dbName, `insert into order_remaining_payment(
                                        order_id,
                                        payment_source,
                                        card_payment_id,
                                        amount
                                        ) values(?,?,?,?)`, [order_id, payment_source, card_payment_id, orderNetAmount - referralAmount])
                await Execute.Query(request.dbName, `update orders set remaining_amount=? where id=?`, [0, order_id]);
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
            }, async function (error) {
                console.error(error);
                return sendResponse.sendErrorMessage(
                    await Universal.getMsgText(
                        languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                    reply, 400);
            });


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

                var dataString = {
                    "source": {
                        "type": "token",
                        "token": payment_token//"tok_4gzeau5o2uqubbk6fufs3m7p54"
                    },
                    "amount": orderNetAmount - referralAmount,//6500,
                    "currency": currency,//"USD",
                    "reference": order_id,//"ORD-5023-4E89",
                    "metadata": {
                        "card_id": card_id,
                        "customer_payment_id": customer_payment_id
                    }
                };
                let checkout_api_url = (process.env.NODE_ENV == 'prod') ? 'https://api.checkout.com/payments' : 'https://api.sandbox.checkout.com/payments';
                web_request({
                    method: 'POST',
                    //url: "https://api.sandbox.checkout.com/payments",
                    url: checkout_api_url,
                    headers: headers,
                    form: dataString
                }, async function (error, response, body) {
                    logger.debug("=== Checkout ====", error)
                    if (error) {
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
                            reply, 400);
                    }
                    else {
                        await Execute.Query(request.dbName, `insert into order_remaining_payment(
                                    order_id,
                                    payment_source,
                                    card_payment_id,
                                    amount
                                    ) values(?,?,?,?)`, [order_id, payment_source, card_payment_id, orderNetAmount - referralAmount])
                        await Execute.Query(request.dbName, `update orders set remaining_amount=? where id=?`, [0, order_id]);
                        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
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
        else {
            return sendResponse.sendErrorMessage(
                await Universal.getMsgText(
                    languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.no_gate_way")),
                reply, 400);
        }

    }
    catch (Err) {
        logger.debug("======ERR!===?", Err)
        return sendResponse.sendErrorMessage(
            await Universal.getMsgText(
                languageId, { service_type: 0, dbName: request.dbName }, config.get("error_msg.payment.error")),
            reply, 400);
    }
}
const updateUserLanguage = async (req, res) => {
    try {
        let language_id = req.body.language_id;
        let user_id = req.users.id;
        await Execute.Query(req.dbName, "update user set notification_language=? where id=?", [language_id, user_id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        sendResponse.somethingWentWrongError(res);
    }
}

const changeOrderStatusByUser = async (req, res) => {
    try {
        let order_id = req.body.order_id;
        order_id = parseInt(order_id)
        let status = req.body.status
        status = parseInt(status)
        let userId = req.users.id;
        let is_automatic = req.body.is_automatic || 0
        let parking_instructions = req.body.parking_instructions || ""
        let user_on_the_way = 0;
        if (parseInt(status) == 3) {
            user_on_the_way = 1;
        }
        let offset = req.body.offset || "+05:30";
        var date10 = moment().utcOffset(offset);
        var delivered_on = date10._d;

        let query = "update orders set status = ?,user_on_the_way=?,parking_instructions=?,is_automatic=? where id=?";
        let params = [status, user_on_the_way, parking_instructions, is_automatic, order_id];
        await Execute.Query(req.dbName, query, params);
        if (parseInt(status) == 5) {
            await Execute.Query(req.dbName, "update orders set delivered_on=? where id=?", [delivered_on, order_id]);

            let orderDetails = await Execute.Query(req.dbName, `select * from orders where id=? `, [order_id]);
            var pointEnableKey = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key` =?", ["is_loyality_point_distributed"]);
            if (pointEnableKey.length && pointEnableKey[0].value == 0) {
                let pointsPerOrder = parseFloat(orderDetails[0].net_amount);

                let pointOrderData = await Execute.Query(req.dbName, `select * from loyality_point_earning where order_id=? and is_ready_for_use=? and user_id=?`, [order_id, 0, userId]);
                if (pointOrderData && pointOrderData.length > 0) {
                    await Execute.Query(req.dbName, `update loyality_point_earning set is_ready_for_use=1,earned_points=? where order_id=? and user_id=?`, [pointsPerOrder, order_id, userId])
                    await Execute.Query(req.dbName, `update user set total_loyality_amount=total_loyality_amount+?,loyalty_points=loyalty_points+? where id=?`, [pointOrderData[0].earned_amount, pointsPerOrder, userId])
                }
                    await Execute.Query(req.dbName, `update user_referral set ready_for_use=? where to_id=?`, [1, userId]);
                
            }
        }
        let supplierDeviceTokens = await getOrderSupplierDeviceTokens(req.dbName, order_id);
        let adminDeviceTokens = await getAdminDeviceTokens(req.dbName);

        let fcmToken = []
        if (adminDeviceTokens && adminDeviceTokens.length > 0) {
            for (const [index, i] of adminDeviceTokens.entries()) {
                fcmToken.push(i.fcm_token)
            }
        }
        if (supplierDeviceTokens && supplierDeviceTokens.length > 0) {
            for (const [index, i] of supplierDeviceTokens.entries()) {
                fcmToken.push(i.device_token)
            }
        }
        var data = {
            "status": 0,
            "message": await Universal.getMsgText(14, req, status),
            "orderId": order_id,
            "self_pickup": 1
        }
        if (parseInt(status) == 3) {
            data.message = "The user is on the way"
        }

        if (parseInt(status) == 4) {
            data.message = "User has arrived"
        }

        logger.debug("============data==========", data);
        await lib.sendFcmPushNotification(fcmToken, data, req.dbName);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        console.log("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}

const getOrderSupplierDeviceTokens = (dbName, order_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            let query = "SELECT s.device_token,s.id,s.device_type  from orders o "
            query += "join supplier_branch sb on o.supplier_branch_id = sb.id "
            query += "join supplier s on s.id = sb.supplier_id "
            query += "where o.id = ?"
            let params = [order_id];
            let result = await Execute.Query(dbName, query, params);
            resolve(result);
        } catch (err) {
            logger.debug("==========ere===", err);
            reject(err);
        }
    })
}

const getAdminDeviceTokens = (dbName) => {
    return new Promise(async (resolve, reject) => {
        try {

            let query = "select `fcm_token`,`email`,`id` from admin where is_active=1 and fcm_token!=?"
            let params = ["0"];
            let result = await Execute.Query(dbName, query, params);
            resolve(result);
        } catch (err) {
            logger.debug("==========ere===", err);
            reject(err);
        }
    })
}

/**
 * @des Api used for shipment of order into DHL   
 * @param {*Object} req 
 * @param {*Object} res 
 */
const trackShipment = async (req, res) => {
    try {
        let ordersPrice = req.body.items;
        let orderId = req.body.orderId;
        let userId = req.users.id;
        let orderResult = await Execute.Query(req.dbName, `select ors.user_id,dh.order_id,dh.bar_code,dh.shipping_charge,dh.package_charge,dh.chargeabl_weight,dh.airway_bill_number,dh.base64_image from dhl_shipment dh join orders ors on ors.id=dh.order_id  where dh.order_id=? and ors.user_id=?`, [orderId, userId]);
        let dhlConfigData = await Universal.getDhlKeyData(req.dbName);
        logger.debug("========DHL=>>", dhlConfigData, orderResult);
        // Object.keys(shipStationData).length>0 
        if (Object.keys(dhlConfigData).length > 0 && orderResult.length > 0) {
            let dhlXmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
                <req:KnownTrackingRequest xmlns:req="http://www.dhl.com" 
                                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                                        xsi:schemaLocation="http://www.dhl.com
                                        TrackingRequestKnown.xsd">
                    <Request>
                        <ServiceHeader>
                        <MessageTime>${moment(new Date()).format()}</MessageTime>
                        <MessageReference>23456789012345678901234567890</MessageReference>
                        <SiteID>${dhlConfigData[config.get("server.dhl.dhl_site_key")]}</SiteID>
                        <Password>${dhlConfigData[config.get("server.dhl.dhl_password")]}</Password>
                        </ServiceHeader>
                    </Request>
                    <LanguageCode>en</LanguageCode>
                    <AWBNumber>${orderResult[0].airway_bill_number}</AWBNumber>
                    <LevelOfDetails>ALL_CHECK_POINTS</LevelOfDetails>
                    <PiecesEnabled>S</PiecesEnabled> 
                </req:KnownTrackingRequest>`
            let finalDhlXMl = dhlXmlRequest
            let data = await Universal.trackOrderInDhl(finalDhlXMl, orderResult[0], req.dbName);
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
        }
        else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
    }
    catch (Err) {
        logger.error("=====Err!=", Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @des Api used for shipment of order into shiprocket   
 * @param {*Object} req 
 * @param {*Object} res 
 */
const trackShipmentOfShipRocket = async (req, res) => {
    try {
        let ordersPrice = req.body.items;
        let orderId = req.body.orderId;
        let adminHandling = req.body.handlingAdmin || 0;
        let userServiceCharge = req.body.userServiceCharge || 0;
        let deliveryCharge = req.body.deliveryCharge || 0;
        let remainingAmount = 0;
        let refundAmount = 0;
        var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
        let orderResult = await Execute.Query(req.dbName, `select order_id,shipment_id,awb_code,label_url,manifest_url,pickup_token_number from shiprocket_shipment where order_id=?`, [orderId]);
        let shipRocketConfigData = await Universal.getShipRocketKeyData(req.dbName);
        logger.debug("========shipRocketConfigData=>>", shipRocketConfigData, orderResult);
        // Object.keys(shipStationData).length>0 
        if (Object.keys(shipRocketConfigData).length > 0 && orderResult.length > 0) {
            let shipRocketToken = await Universal.loginToShipRocket(shipRocketConfigData.shiprocket_email, shipRocketConfigData.shiprocket_password);

            let query_url = "https://apiv2.shiprocket.in/v1/external/courier/track/awb/" + orderResult[0].awb_code

            request({
                method: 'GET',
                url: query_url,
                headers: {
                    'Authorization': 'Bearer ' + shipRocketToken
                },
            }, async function (error, response, body) {

                sendResponse.sendSuccessData({
                    "tracking_data": {
                        "track_status": 1,
                        "shipment_status": 3,
                        "shipment_track": [
                            {
                                "id": 8087109,
                                "awb_code": "788830567028",
                                "courier_company_id": 2,
                                "shipment_id": null,
                                "order_id": 16255275,
                                "pickup_date": null,
                                "delivered_date": null,
                                "weight": "2.5",
                                "packages": 1,
                                "current_status": "Pickup Generated",
                                "delivered_to": "New Delhi",
                                "destination": "New Delhi",
                                "consignee_name": "Naruto",
                                "origin": "Jammu",
                                "courier_agent_details": null
                            }
                        ],
                        "shipment_track_activities": [
                            {
                                "date": "2019-08-01 05:20:55",
                                "activity": "Shipment information sent to FedEx - OC",
                                "location": "NA"
                            }
                        ],
                        "track_url": "https://app.shiprocket.in/tracking/awb/788830567028"
                    }
                }, constant.responseMessage.SUCCESS, res, 200);

                // if(error){
                // logger.error("=====Err!=",error);
                // sendResponse.sendErrorMessage(error,res,400)
                // }else{
                //     resolve(body);
                // }

            });
        } else {
            // logger.error("=====Err!=");
            // sendResponse.sendErrorMessage("keys are not added",res,400)

            sendResponse.sendSuccessData({
                "tracking_data": {
                    "track_status": 1,
                    "shipment_status": 3,
                    "shipment_track": [
                        {
                            "id": 8087109,
                            "awb_code": "788830567028",
                            "courier_company_id": 2,
                            "shipment_id": null,
                            "order_id": 16255275,
                            "pickup_date": null,
                            "delivered_date": null,
                            "weight": "2.5",
                            "packages": 1,
                            "current_status": "Pickup Generated",
                            "delivered_to": "New Delhi",
                            "destination": "New Delhi",
                            "consignee_name": "Naruto",
                            "origin": "Jammu",
                            "courier_agent_details": null
                        }
                    ],
                    "shipment_track_activities": [
                        {
                            "date": "2019-08-01 05:20:55",
                            "activity": "Shipment information sent to FedEx - OC",
                            "location": "NA"
                        }
                    ],
                    "track_url": "https://app.shiprocket.in/tracking/awb/788830567028"
                }
            }, constant.responseMessage.SUCCESS, res, 200);
        }


    }
    catch (Err) {
        logger.error("=====Err!=", Err);
        sendResponse.sendErrorMessage(Err, res, 400);
    }
}


module.exports = {
    trackShipment: trackShipment,
    trackShipmentOfShipRocket: trackShipmentOfShipRocket,
    makeOrderPaymentOfRemainingAmount: makeOrderPaymentOfRemainingAmount,
    requestCancelledByUser: requestCancelledByUser,
    orderRequestList: orderRequestList,
    orderReturnRequest: orderReturnRequest,
    makeOrderPayment: makeOrderPayment,
    orderRequestByUser: orderRequestByUser,
    generateOrder: generateOrder,
    addOrderReciept: addOrderReciept,
    deleteImage: deleteImage,
    getOrderInShipStation: getOrderInShipStation,
    changeOrderStatusByUser: changeOrderStatusByUser,
    orderReturnRequestByAgent: orderReturnRequestByAgent,
    makeSaferPayment: makeSaferPayment,
    checkSaferTransactionAuthorize: checkSaferTransactionAuthorize,
    updateUserLanguage:updateUserLanguage
}