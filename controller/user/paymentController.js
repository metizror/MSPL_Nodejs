var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var CONSTS=require('./../../config/const')
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var fs=require('fs')
var web_request = require('request');
var something = "Something went wrong";
var querystring = require('querystring');
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784","782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var loginFunctions = require('../../routes/loginFunctions');
var Universal=require('../../util/Universal');
var randomstring = require("randomstring");
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
// const { config } = require('process');
config = require('config');
logger.level = config.get('server.debug_level');
var AdminMail = "ops@royo.com";
var crypto = require('crypto');
const xml2js = require('xml2js');
algorithm = CONSTS.SERVER.CYPTO.ALGO,
    crypto_password =  CONSTS.SERVER.CYPTO.PWD
var uploadMgr=require('../../lib/UploadMgr')
var FormData = require('form-data');
var request = require('request');
const runTimeDbConnection=require('../../routes/runTimeDbConnection')
const common = require('../../common/agent');
var braintree = require("braintree");
const path = require('path')
const ExecuteQ = require('../../lib/Execute');
const http = require('http');

const req = require("request");
        // const fs = require("fs");
        const multiparty = require("multiparty");
        let forms = new multiparty.Form();

/**
 * Used for getting an paystack token for making an payment
 * */
const AccessCode=async (req,res)=>{
        try{
            let paystack_secret_key_data=await Universal.getPaystackSecretKey(req.dbName);
            logger.debug("===========paystack_secret_key_data==>",paystack_secret_key_data[0].value)
            var options = {
                method: 'POST',
                url: 'https://api.paystack.co/transaction/initialize',
                headers: {
                    Authorization: 'Bearer '+paystack_secret_key_data[0].value+'',
                    'content-type': 'application/json'
                },
                body:'{"email":"'+req.query.email+'","amount":"'+Math.round(parseFloat(req.query.net_amount * 100))+'","callback_url":"'+config.get("payment.myfatoorah.success_url")+'","metadata":{"cancel_action":"'+config.get("payment.myfatoorah.cancel_url")+'"}}'
            };
            request(options, function (err, response, body) {
                logger.debug("========ER!========",err);
                if(err){
                    return sendResponse.sendErrorMessage(
                        Universal.getMsgText(
                            14,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                        reply,400);
                }
                else{
                    sendResponse.sendSuccessData(JSON.parse(body), constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }
        catch(err){
            logger.debug("============ERR!==",err);
            return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
        }

}
const createPaypalPayment=async (req,res)=>{
    try{
        let paypal_api = process.env.NODE_ENV == 'live' ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com'
        
        let paypal_data=await Universal.getPaypalData(req.dbName);

        if(Object.keys(paypal_data).length>0){

            
           let tokenData=await Universal.getAuthTokeOfPayPal(paypal_data[config.get("payment.paypal.client_key")],paypal_data[config.get("payment.paypal.secret_key")]);
           logger.debug("===========tokenData======token_type===>>",tokenData.token_type,tokenData.access_token);
            var options = {
                "method": "POST",
                "url": paypal_api+"/v2/checkout/orders",
                "headers": {
                    "Authorization": "Bearer "+tokenData.access_token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"intent":"CAPTURE","purchase_units":[{"amount":{"currency_code":"USD","value":parseFloat(req.query.net_amount)}}]})

            };
            request(options, function (err, response) {
                        if (err)
                        {
                            return sendResponse.sendErrorMessage(
                                Universal.getMsgText(
                                    14,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                                reply,400);
                        }
                        else{
                            sendResponse.sendSuccessData(JSON.parse(response.body), constant.responseMessage.SUCCESS, res, 200);
                        }
            });
            // request.post(paypal_api + '/v2/checkout/orders',
            //     {
            //         auth:
            //             {
            //                 user: paypal_data[config.get("payment.paypal.client_key")],
            //                 pass: paypal_data[config.get("payment.paypal.secret_key")]
            //             },
            //         body:
            //             {
            //                 intent: 'sale',
            //                 payer:
            //                     {
            //                         payment_method: 'paypal'
            //                     },
            //                 transactions: [
            //                     {
            //                         amount:
            //                             {
            //                                 total: parseFloat(req.query.net_amount)*100,
            //                                 currency: 'USD'
            //                             }
            //                     }],
            //                 redirect_urls:
            //                     {
            //                         return_url: 'https://example.com',
            //                         cancel_url: 'https://example.com'
            //                     }
            //             },
            //         json: true
            //     }, function(err, response)
            //     {
            //         if (err)
            //         {
            //             return sendResponse.sendErrorMessage(
            //                 Universal.getMsgText(
            //                     14,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
            //                 reply,400);
            //         }
            //         else{
            //             sendResponse.sendSuccessData(response.body, constant.responseMessage.SUCCESS, res, 200);
            //         }
            //         // // 3. Return the payment ID to the client
            //         // res.json(
            //         //     {
            //         //         id: response.body.id
            //         //     });
            //     });
        }
        else{
            return sendResponse.sendErrorMessage(
                Universal.getMsgText(
                    14,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                reply,400);
        }
    }
    catch(err){
        logger.debug("============ERR!==",err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }

}
const clientToken=async (req,res)=>{
    try{
        var customer_id = "";
        var userDetails
        if(req.query.user_id && req.query.user_id!=""){
            let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            userDetails = await ExecuteQ.QueryAgent(agentConnection,"select braintree_customer_id,name as firstname, name as lastname from cbl_user where id=?",[req.query.user_id]);
        }else{
            userDetails = await ExecuteQ.Query(req.dbName,"select braintree_customer_id,firstname,lastname from user where id=?",[req.users.id]);
        }        
        if(userDetails[0] && userDetails[0].braintree_customer_id){
            customer_id = userDetails[0].braintree_customer_id;
        }

        let braintree_data=await Universal.getBraintreeData(req.dbName);
        var gateway = braintree.connect({
            environment:braintree.Environment.Production,
            merchantId: braintree_data[config.get("payment.venmo.merchant_id")],
            publicKey: braintree_data[config.get("payment.venmo.public_key")],
            privateKey: braintree_data[config.get("payment.venmo.private_key")]
        });
        console.log("gateway============",gateway)
        console.log("33333333333333333333============",braintree_data[config.get("payment.venmo.merchant_id")])
        console.log("22222222222222222222============",braintree_data[config.get("payment.venmo.public_key")])
        console.log("11111111111111111111111============",braintree_data[config.get("payment.venmo.private_key")])
        var generateTokenData = {}

        if(customer_id == ""){
            gateway.customer.create({
                firstName: userDetails[0].firstname,
                lastName: userDetails[0].lastname
            }, async function (err1, customerData) {
                console.log("==Er!====",err)
                if(customerData==undefined){
                    let msg = "There is some problem with braintree details. Unable to create braintree customer."
                    sendResponse.sendErrorMessage(msg,res,500)
                }                console.log("customerData ------- ",customerData)
                customer_id = customerData.customer.id
                generateTokenData = {customerId: customer_id}
                if(req.query.user_id && req.query.user_id!=""){
                    let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
                    let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                    await ExecuteQ.QueryAgent(agentConnection,"update cbl_user set braintree_customer_id=? where id=?",[customerData.customer.id,req.query.user_id]);
                }else{
                    await ExecuteQ.Query(req.dbName,"update user set braintree_customer_id=? where id=?",[customerData.customer.id,req.users.id]);
                }
                gateway.clientToken.generate(generateTokenData, function (err, response) {
                    logger.debug("==Er!====",err)
                    if(err){
                        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
                    }else{
                        sendResponse.sendSuccessData({client_token:response.clientToken}, constant.responseMessage.SUCCESS, res, 200);
                    }
                });
            });
        }else{
            if(customer_id!=""){
                generateTokenData = {customerId: customer_id}
            }
            gateway.clientToken.generate(generateTokenData, function (err, response) {
                console.log("==Er!====",err)
                if(err){
                    return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
                }else{
                    sendResponse.sendSuccessData({client_token:response.clientToken}, constant.responseMessage.SUCCESS, res, 200);
                }
            });
        }
    }
    catch (e) {
        logger.debug("=======Err!===",e)
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}
const getStripeToken3d = (name,stripe_secret_key,card_number,exp_year,exp_month,cvc)=>{
    return new Promise(async(resolve,reject)=>{
        const stripe = require('stripe')(stripe_secret_key);
        // stripe.tokens.create(
        //     {
        //       card: {
        //         number: card_number,
        //         exp_month: exp_month,
        //         exp_year: exp_year,
        //         cvc: cvc,
        //         name:name
        //       },
        //     },



            stripe.paymentMethods.create({
                type: 'card',
                card: {
                  number: card_number,
                  exp_month: exp_month,
                  exp_year: exp_year,
                  cvc: cvc,
                },
              },
            function(err, token) {
              // asynchronously calle
              console.log(err,token)
              if(err){
                  reject(err)
              }else{
                  resolve(token.id)
              }
            }
          );
          
    })
}
const createStripeCard3d = (stripe_secret_key,customer_payment_id,card_source,
    card_number,exp_month,exp_year           
    )=>{
    return new Promise((resolve,reject)=>{
        const stripe = require('stripe')(stripe_secret_key);

        stripe.paymentMethods.attach(
            card_source,
          {
            customer: customer_payment_id
            // {
            //   object: card_source,
            //   number : card_number,
            //   exp_month : exp_month,
            //   exp_year:exp_year
            // },
        
          },
            function (err, card) {
                // asynchronously called
                if (err) {
                    reject(err)
                } else {
                    resolve(card.id)
                }
            }
        );
    })    
}


const checkCardAlreadyExistOfClover = (dbName,user_id,card_number,card_source)=>{
    return new Promise(async(resolve,reject)=>{

        
        let query = "select id from user_cards where user_id=? and card_number=?  and card_source=? and is_deleted =0"

        let params = [user_id,card_number,card_source];

        let result = await ExecuteQ.Query(dbName,query,params);
        
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
}




const  createCloverCustomer = async (dbName,users, basic_auth,token)=>{
    console.log(users.firstname,"fgkdylisyeeevbyy")
    let header = {
        Authorization: `Bearer ${basic_auth}`,
        'Content-Type' : `application/json`
        };    
        let Obj ={
            ecomind: 'ecom',
            shipping: {
              address: {
                city: 'ludhiana',
                country: 'in',
                line1: 'gtb nagar',
                postal_code: '1234',
                state: 'punjab'
              }
            },
            source: token,
            email: users.email,
            name: users.firstname
          
         };
    console.log(Obj,"objobjbj")
     
     let baseURL =   (process.env.NODE_ENV == 'prod') ?          `https://scl.clover.com/v1/customers`:'https://scl-sandbox.dev.clover.com/v1/customers';     
     console.log("==paymaya==baseURL====>>",baseURL)
     let  options = {
        method: 'POST',
        url: baseURL,
        body: Obj,
        headers: header,
        json: true };
        let result = await requestApi(options);
        console.log(options,"8888888888888888888888")
        return result;
    };
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
       const generateCloverToken =  async( dbName,card_number,exp_month,exp_year,cvc, basic_auth)=>{

        let header = {
            Accept: 'application/json',
            apikey:basic_auth,
            'Content-Type' : `application/json`
            };
            
        let Obj ={
           
            "card": {
                "number":card_number,
                "exp_month":exp_month,
                "exp_year":exp_year,
                "cvv":cvc
              }
         };
        
        
         let baseURL =  (process.env.NODE_ENV == 'prod') ?          `https://token.clover.com`   :    `https://token-sandbox.dev.clover.com`;     
         console.log("=Clover base URl=>>",baseURL)
         let  options = {
            method: 'POST',
            url: `${baseURL}/v1/tokens`,
            body: Obj,
            headers: header,
            json: true };
            console.log(options,"options")
            let result = await requestApi(options);
            return result;
        };
        const addUserCardsOfClover = (dbName,user_id,paymentTokenID,CustomerID,card_type,exp_month,exp_year,cvc,card_number,card_source)=>{
            return new Promise(async(resolve,reject)=>{
                let query = "insert into user_cards(user_id,card_id,customer_payment_id,card_type,exp_month,exp_year,cvc,card_number,card_source)"
                query += "values(?,?,?,?,?,?,?,?,?)";
                let params = [user_id,paymentTokenID,CustomerID,card_type,exp_month,exp_year,cvc,card_number,card_source];
                let result = await ExecuteQ.Query(dbName,query,params);
                resolve(result)
            })
        }
        
        


const getPayMayaKeys=(dbName)=>{
    let key_object={};
    return new Promise(async (resolve,reject)=>{
        try {
            logger.debug("=========dbName======2======",dbName)

            let data=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? or `key`=?  or `key`=? or `key`=? or `key`=?",[
                "paymaya_public_key",
                "paymaya_secret_key",
                "unique_id",
                "basic_auth",
                "basic_auth_customer"
            ])
            logger.debug("=--------data---------",data)

            if(data && data.length>0){
                for(const [index,i] of data.entries()){
                    key_object[i.key]=i.value
                }
                resolve(key_object)
            }
            else{
                resolve(key_object)
            }
        }
        catch (e) {
            resolve({})
        }
    })
}


const addCard=async (req,res)=>{
    try{
       logger.debug("***********req.users", req.users);
       
       let params = req.body
       let card_type = params.card_type;
       let zipCode = params.zipCode||"1234";
       let stripe_3d = params.stripe_3d;
       var user_id;
       var is_agent="0";
       let userData = await Universal.getUserData(req.dbName,req.headers.authorization);
       if(req.path=="/agent/add_card"){
            user_id=req.agent.id
            is_agent="1"
       }else{
        user_id=req.users.id;//      user_id=req.users.id;
       }
       let customer_payment_id = "";
      //    gateway_unique_id
    
    let card_holder_name = req.body.card_holder_name!==undefined?req.body.card_holder_name:userData[0].name
       
       let stripe_3d_on=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["stripe_3d_on"]);
       let enableStripe = 0;
    if(stripe_3d_on && stripe_3d_on.length>0&&stripe_3d_on[0].value==1){
        enableStripe= 1;
    }



   
    if (((params.gateway_unique_id) == "stripe") && enableStripe==1) {
   
        let card_source = "stripe"
        let strip_secret_key_data = await Universal.getStripSecretKey(req.dbName);
        console.log("======in strip_secret_key_data-==============",strip_secret_key_data)
        if(strip_secret_key_data && strip_secret_key_data.length>0){
            var userCards;
            if(is_agent=="1"){
                userCards = await checkAgentCards(req.dbName, user_id, card_source);
            }else{
                userCards = await checkUserCards(req.dbName, user_id, card_source);
            }
            
            
            card_type = await getStripeToken3d(params.card_holder_name,
                strip_secret_key_data[0].value,params.card_number,
                params.exp_year,params.exp_month,params.cvc);

            if (userCards && userCards.length > 0) {
                customer_payment_id=userCards[0].customer_payment_id
             let card_id =   await createStripeCard3d(strip_secret_key_data[0].value, 
                userCards[0].customer_payment_id, card_type, params.card_number,
                 params.exp_month, params.exp_year)

                if(is_agent=="1"){                        
                    await addAgentCards(req.dbName, user_id,card_type, 
                        params.card_number, params.exp_month, params.exp_year,
                         userCards[0].customer_payment_id,card_source,card_id);
                }else{
                    await addUserCards(req.dbName, user_id,card_type,
                         params.card_number, params.exp_month,
                          params.exp_year, userCards[0].customer_payment_id,
                          card_source,card_id,params.card_holder_name);
                }
            } else {
                 customer_payment_id = await createStripeCustomer(
                     strip_secret_key_data[0].value, params.email);
                 if(is_agent=="1"){                        
                    await saveAgentId(req.dbName, customer_payment_id, user_id)
                }else{
                    await saveCustomerId(req.dbName, customer_payment_id, user_id)
                }
                let card_id =  await createStripeCard3d(strip_secret_key_data[0].value,
                     customer_payment_id, card_type, params.card_number,
                      params.exp_month, params.exp_year)
                if(is_agent=="1"){
                    await addAgentCards(req.dbName, user_id, card_type, params.card_number, params.exp_month, params.exp_year, customer_payment_id, card_source,card_id);
                }else{
                    await addUserCards(req.dbName, user_id, card_type, params.card_number, params.exp_month, params.exp_year, customer_payment_id, card_source,card_id,params.card_holder_name);
                }
            }
            console.log("44444444444444444444",customer_payment_id)
            sendResponse.sendSuccessData({customer_payment_id:customer_payment_id}, constant.responseMessage.SUCCESS, res, 200);
        
        }else{
            let msg = "strip keys are not added"
            sendResponse.sendErrorMessage(msg,res,500)
        }

    } 
    else
    if ((params.gateway_unique_id) == "stripe") {
            logger.debug("======in stripe-==============")
            let card_source = "stripe"
            let strip_secret_key_data = await Universal.getStripSecretKey(req.dbName);
            logger.debug("======in strip_secret_key_data-==============",strip_secret_key_data)
            if(strip_secret_key_data && strip_secret_key_data.length>0){
                var userCards;
                if(is_agent=="1"){
                    userCards = await checkAgentCards(req.dbName, user_id, card_source);
                }else{
                    userCards = await checkUserCards(req.dbName, user_id, card_source);
                }
                
                
                card_type = await getStripeToken(params.card_holder_name,
                    strip_secret_key_data[0].value,params.card_number,
                    params.exp_year,params.exp_month,params.cvc);

                if (userCards && userCards.length > 0) {
                    customer_payment_id=userCards[0].customer_payment_id
                 let card_id =   await createStripeCard(strip_secret_key_data[0].value, 
                    userCards[0].customer_payment_id, card_type, params.card_number,
                     params.exp_month, params.exp_year)

                    if(is_agent=="1"){                        
                        await addAgentCards(req.dbName, user_id,card_type, 
                            params.card_number, params.exp_month, params.exp_year,
                             userCards[0].customer_payment_id,card_source,card_id);
                    }else{
                        await addUserCards(req.dbName, user_id,card_type,
                             params.card_number, params.exp_month,
                              params.exp_year, userCards[0].customer_payment_id,
                              card_source,card_id);
                    }
                } else {
                     customer_payment_id = await createStripeCustomer(
                         strip_secret_key_data[0].value, params.email);
                     if(is_agent=="1"){                        
                        await saveAgentId(req.dbName, customer_payment_id, user_id)
                    }else{
                        await saveCustomerId(req.dbName, customer_payment_id, user_id)
                    }
                    let card_id =  await createStripeCard(strip_secret_key_data[0].value,
                         customer_payment_id, card_type, params.card_number,
                          params.exp_month, params.exp_year)
                    if(is_agent=="1"){
                        await addAgentCards(req.dbName, user_id, card_type, params.card_number, params.exp_month, params.exp_year, customer_payment_id, card_source,card_id);
                    }else{
                        await addUserCards(req.dbName, user_id, card_type, params.card_number, params.exp_month, params.exp_year, customer_payment_id, card_source,card_id);
                    }
                }
                console.log("44444444444444444444",customer_payment_id)
                sendResponse.sendSuccessData({customer_payment_id:customer_payment_id}, constant.responseMessage.SUCCESS, res, 200);
            
            }else{
                let msg = "strip keys are not added"
                sendResponse.sendErrorMessage(msg,res,500)
            }

        }
        else 
        if ((params.gateway_unique_id) == config.get("payment.payuLatam.unique_id")) {
            let card_source = "payuLatam";
            let data ={};
            let payuLatam_secret_key_data = await Universal.getpayuLatamSecretKey(req.dbName);
            logger.debug("=====payuLatam_secret_key_data=========",payuLatam_secret_key_data);

            if(payuLatam_secret_key_data && payuLatam_secret_key_data.length>0){
                var userCards;
                if(is_agent=="1"){
                    userCards = await checkAgentCards(req.dbName, user_id, card_source);
                }else{
                    userCards = await checkUserCards(req.dbName, user_id, card_source);
                } 
                logger.debug("======userCards==========", userCards);

                params.document = "OR-"+ await Universal.uniqueId();
                 let newCustomerData ={};  
                if(userCards && userCards.length > 0){
                    newCustomerData.id = userCards[0].customer_payment_id;
                }else
                {
                    newCustomerData =  await createCustomer(userData[0], payuLatam_secret_key_data[0].value);	       


                let customerToken = await generatepayuLatamToken(newCustomerData.id, params, payuLatam_secret_key_data[0].value);
     
                 logger.debug("====card_details===========",customerToken)
              
            
                    if(is_agent=="1"){                        
                        await addAgentCards(req.dbName, user_id,card_type,
                            "", params.exp_month,
                            params.exp_year, newCustomerData.id,card_source,
                            customerToken.token);
                            await saveAgentId(req.dbName, newCustomerData.id, user_id);

                    }else{
                    
                        await addUserCards(req.dbName, user_id,card_type,
                              "", params.exp_month,
                              params.exp_year, newCustomerData.id,card_source,
                              customerToken.token);
                              await saveCustomerId(req.dbName, newCustomerData.id, user_id);

                     }           
                let result ={
                    "user_id" : user_id,
                    "card_type" : card_type,
                    "exp_month" :params.exp_month,
                    "exp_year":params.exp_year,
                    "customer_payment_id" : newCustomerData.id,
                    "card_source":card_source,
                    "card_id":customerToken.token

                }
               
               sendResponse.sendSuccessData(result , constant.responseMessage.SUCCESS, res, 200);
                }
            }else{
                let msg = "payuLatam keys are not added"
                sendResponse.sendErrorMessage(msg,res,500)
            }

        }


        else  if((params.gateway_unique_id)== config.get("payment.clover.unique_id")){
                   
            let cloverKeys = await Universal.getCloverKeys(req.dbName);
  
                let card_source = "clover";
                console.log(card_source,"ldlk")
  
                let checkAlreadyExist = await checkCardAlreadyExistOfClover(req.dbName,user_id,
                    params.card_number,params.gateway_unique_id)

                if(checkAlreadyExist && checkAlreadyExist.length>0){
                    return sendResponse.sendErrorMessage("Card with this details already exist",res,400);
                }else{




             let cloverToken = await  generateCloverToken(req.dbName,params.card_number,params.exp_month,params.exp_year,params.cvc,cloverKeys.clover_public_key);
  
             logger.debug("===clover  data=tisthis========",cloverToken);
             console.log(userData[0].firstname,"hhhhhhhhhhhhhhhhhhhhhhhhh")
             var newCustomerData =  await createCloverCustomer(req.dbName,userData[0],cloverKeys.clover_secret_key,cloverToken.id);
             console.log(newCustomerData,"customer")

             await addUserCardsOfClover(req.dbName,params.user_id,newCustomerData.sources.data,newCustomerData.id,params.card_type,params.exp_month,params.exp_year,params.cvc,params.card_number,card_source);

             sendResponse.sendSuccessData({customer_payment_id:newCustomerData.id}, constant.responseMessage.SUCCESS, res, 200);
                }
           }




        else if ((params.gateway_unique_id) == config.get("payment.conekta.unique_id")) {
            logger.debug("======in conekta-==============")
            let conekta_data=await Universal.getConektaSecretKey(dbName);
            if(conekta_data && conekta_data.length>0){
                let card_source = "conekta"
                var userCards;
                if(is_agent=="1"){
                    userCards = await checkAgentCards(req.dbName, user_id, card_source)
                    userData=await  Universal.getAgentData(req.dbName,req.headers.authorization);
                }else{
                    userCards = await checkUserCards(req.dbName, user_id, card_source)
                    userData=await  Universal.getUserData(req.dbName,req.headers.authorization);
                }
                if (userCards && userCards.length > 0) {
                    let card_details = await createConektaCard(userCards[0].customer_payment_id, params.card_type, params.card_number, params.exp_month, params.exp_year)
                    if(is_agent=="1"){
                        await addAgentCards(req.dbName, user_id, params.card_type, params.card_number, params.exp_month, params.exp_year, userCards[0].customer_payment_id,card_source,card_details.id);
                    }else{
                        await addUserCards(req.dbName, user_id, params.card_type, params.card_number, params.exp_month, params.exp_year, userCards[0].customer_payment_id,card_source,card_details.id);
                    }
    
                } else {
                    let customer_details = await createConektaCustomer(userData, params.card_number,params.card_type,req.dbName)
                    if(is_agent=="1"){                        
                        await saveAgentId(req.dbName, customer_details.id, user_id)
                    }else{
                        await saveCustomerId(req.dbName, customer_details.id, user_id)
                    }
                    if(is_agent=="1"){
                        await addAgentCards(req.dbName, user_id, params.card_type, params.card_number, params.exp_month, params.exp_year, customer_details.id, card_source,customer_details.default_payment_source_id);
                    }else{
                        await addUserCards(req.dbName, user_id, params.card_type, params.card_number, params.exp_month, params.exp_year, customer_details.id, card_source,customer_details.default_payment_source_id);
                    }
                }
                console.log("44444444444444444444",customer_payment_id)
                sendResponse.sendSuccessData({customer_payment_id:customer_payment_id}, constant.responseMessage.SUCCESS, res, 200);
            
            }else{
                let msg = "conekta keys are not added"
                sendResponse.sendErrorMessage(msg,res,500)
            }
        } else if ((params.gateway_unique_id)==config.get("payment.venmo.unique_id")) {
            logger.debug("======in venmo`-==============")
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
                let card_source = "venmo"
                var userCards;
                if(is_agent=="1"){
                    userCards = await checkAgentCards(req.dbName, user_id, card_source)
                    userData=await  Universal.getAgentData(req.dbName,req.headers.authorization);
                }else{
                    userCards = await checkUserCards(req.dbName, user_id, card_source)
                    userData=await Universal.getUserData(req.dbName,req.headers.authorization);
                }
                if (userCards && userCards.length > 0) {
                    let card_details_id = await createVenmoCard(userCards[0].customer_payment_id, params.card_number)
                    if(is_agent=="1"){
                        await addAgentCards(req.dbName, user_id, params.card_type, params.card_number, params.exp_month, params.exp_year, userCards[0].customer_payment_id,card_source,card_details_id);
                    }else{
                        await addUserCards(req.dbName, user_id, params.card_type, params.card_number, params.exp_month, params.exp_year, userCards[0].customer_payment_id,card_source,card_details_id);
                    }
    
                } else {
                    let customer_details = await createVenmoCustomer(userData, params.card_number,gateway);
                    if(is_agent=="1"){
                        await saveAgentId(req.dbName, customer_details.id, user_id)
                    }else{
                        await saveCustomerId(req.dbName, customer_details.id, user_id)
                    }
                    if(is_agent=="1"){
                        await addAgentCards(req.dbName, user_id, params.card_type, params.card_number, params.exp_month, params.exp_year, customer_details.id, card_source,customer_details.paymentMethod.globalId);
                    }else{
                        await addUserCards(req.dbName, user_id, params.card_type, params.card_number, params.exp_month, params.exp_year, customer_details.id, card_source,customer_details.paymentMethod.globalId);
                    }
               
                }
                console.log("44444444444444444444",customer_payment_id)
                sendResponse.sendSuccessData({customer_payment_id:customer_payment_id}, constant.responseMessage.SUCCESS, res, 200);
            
            }else{
                let msg = "venmo keys are not added"
                sendResponse.sendErrorMessage(msg,res,500)
            }
        }
        else if((params.gateway_unique_id) == config.get("payment.squareup.unique_id")){
            let card_source = "squareup";
            let squareData=await Universal.getSquareupSecretKey(req.dbName);
            logger.debug("=======squareData==>",squareData)
            if(req.params.card_nonce  === "" || null || undefined){
                let msg = "card_nonce is required";
                sendResponse.sendErrorMessage(msg,res,400);
            } 
            if(req.params.card_holder_name  === "" || null || undefined){
                let msg = "card_holder_name is required";
                sendResponse.sendErrorMessage(msg,res,400);
            } 
            var userDetails
            if(is_agent=="1"){
                userDetails =   await getAgentDetails(req.dbName, user_id);
            }else{
                userDetails =   await getuserDetails(req.dbName, user_id);
            }
                var userCards;
                if(is_agent=="1"){
                    userCards = await checkAgentCards(req.dbName, user_id, card_source);
                }else{
                    userCards = await checkUserCards(req.dbName, user_id, card_source);
                }
                if (userCards && userCards.length > 0) {

                   
                    let card_details = await addSquareCardIntheExistingCustomer(squareData,params,userCards[0].customer_payment_id);

                    if(is_agent=="1"){
                        await addSquareupAgentCards(req.dbName, user_id, card_details.last_4, card_details.exp_month, card_details.exp_year, userCards[0].customer_payment_id , card_source, card_details.id, card_details.card_brand);
                    }else{
                        await addSquareupuserCards(req.dbName, user_id, card_details.last_4, card_details.exp_month, card_details.exp_year, userCards[0].customer_payment_id , card_source, card_details.id, card_details.card_brand);
                    }
                    customer_payment_id = userCards[0].customer_payment_id
                } else {
                    
                 let customer_Details = await  createnNewSquareCustomer(squareData,userDetails[0]); 
                 await savesquareCustomerId(req.dbName, customer_Details.id, user_id);

                 let card_details = await addSquareCardIntheExistingCustomer(squareData,params,customer_Details.id);

                 

                if(is_agent=="1"){
                    await addSquareupAgentCards(req.dbName, user_id, card_details.last_4, card_details.exp_month, card_details.exp_year, customer_Details.id , card_source, card_details.id, card_details.card_brand);
                }else{
                    await addSquareupuserCards(req.dbName, user_id, card_details.last_4, card_details.exp_month, card_details.exp_year, customer_Details.id , card_source, card_details.id, card_details.card_brand);
                }

                 customer_payment_id =  customer_Details.id;
                }
                console.log("44444444444444444444",customer_payment_id)
                sendResponse.sendSuccessData({customer_payment_id:customer_payment_id}, constant.responseMessage.SUCCESS, res, 200);
            
           
        }

        else if((params.gateway_unique_id) == config.get("payment.cybersource.unique_id")){
            logger.debug("========ENte==Cyber===Source=>>")
            let card_source = "cybersource";
            var userDetails
            if(is_agent=="1"){
                userDetails =   await getAgentDetails(req.dbName, user_id);
            }else{
                userDetails =   await getuserDetails(req.dbName, user_id);
            }
            var userCards;
            if(is_agent=="1"){
                userCards = await checkAgentCards(req.dbName, user_id, card_source);
            }else{
                userCards = await checkUserCards(req.dbName, user_id, card_source);
            }
            let cyberSourceData=await Universal.getCyberSourceData(req.dbName);
            if(Object.keys(cyberSourceData).length>0){
                if (userCards && userCards.length > 0) {
                    let cyberData =await saveCyberCardSourceAsToken(cyberSourceData,params.card_number,params.cvc,params.exp_year,params.exp_month)
                  

                    if(is_agent=="1"){
                        userData= await  addAgentCyberSourceCards(req.dbName,cyberData.id,params.card_type,user_id, params.card_number, params.exp_month, params.exp_year,params.cvc,card_source);
                    }else{
                        userData= await  addCyberSourceCards(req.dbName,cyberData.id,params.card_type,user_id, params.card_number, params.exp_month, params.exp_year,params.cvc,card_source);
                    }
                    logger.debug("cyberData==",cyberData);
                    customer_payment_id= cyberData.id;

                }
                else{
                    let cyberData =await saveCyberCardSourceAsToken(cyberSourceData,params.card_number,params.cvc,params.exp_year,params.exp_month)
                    logger.debug("cyberData==",cyberData);
                    customer_payment_id=cyberData.id;
                    if(is_agent=="1"){
                        await saveAgentId(req.dbName, cyberData.id, user_id)
                    }else{
                        await saveCustomerId(req.dbName, cyberData.id, user_id)
                    }

                    if(is_agent=="1"){
                        userData= await addAgentCyberSourceCards(req.dbName,cyberData.id,params.card_type,user_id, params.card_number, params.exp_month, params.exp_year,params.cvc,card_source);
                    }else{
                        userData= await addCyberSourceCards(req.dbName,cyberData.id,params.card_type,user_id, params.card_number, params.exp_month, params.exp_year,params.cvc,card_source);
                    }
                    logger.debug("userData==",cyberData);
                }
                console.log("44444444444444444444",customer_payment_id)
                sendResponse.sendSuccessData({customer_payment_id:customer_payment_id}, constant.responseMessage.SUCCESS, res, 200);
            
            }
            else{
                let msg = "not any key match with any payment gateway"
                sendResponse.sendErrorMessage(msg,res,500)
            }
        }
        else if((params.gateway_unique_id) == config.get("payment.peach.unique_id")){
            console.log("999999999999999999999999")
            let card_source = "peach";
            // let  userDetails =   await getuserDetails(req.dbName, user_id);
            // let userCards  = await checkUserCards(req.dbName, user_id, card_source);            
            let peach_secret_key_data=await Universal.getPeachSecretKey(req.dbName);
            console.log("peach_secret_key_data -- ",peach_secret_key_data)
            
            if(Object.keys(peach_secret_key_data).length>0){

                let peachData =await savePeachCards(req.dbName,user_id,peach_secret_key_data,params,is_agent)
                console.log("888888888888888888 ===== ",peachData)
                customer_payment_id = peachData.id
                console.log("11111111111111",customer_payment_id)
                
                if(is_agent=="1"){
                    await addAgentCyberSourceCards(req.dbName,peachData.id,params.card_type,user_id, params.card_number, params.exp_month, params.exp_year,params.cvc,card_source);
                }else{
                    await addCyberSourceCards(req.dbName,peachData.id,params.card_type,user_id, params.card_number, params.exp_month, params.exp_year,params.cvc,card_source);
                }              
                console.log("22222222222222222222",customer_payment_id)
                console.log("44444444444444444444",customer_payment_id)
                sendResponse.sendSuccessData({customer_payment_id:customer_payment_id}, constant.responseMessage.SUCCESS, res, 200);
            
            }
            else{                
                let msg = "123 not any key match with any payment gateway"
                sendResponse.sendErrorMessage(msg,res,500)
            }
            
        }
        else if((params.gateway_unique_id) == config.get("payment.authorize_net.unique_id")){
            let card_source = "authorize_net";

            userCards = await checkUserCards(req.dbName, user_id, card_source);
            console.log('===usercarsdss===========',userCards)
            if (userCards && userCards.length > 0) {

                let userDetail = await ExecuteQ.Query(req.dbName,
                    "select authnet_profile_id from user where id=?",[user_id])

                    authnet_profile_id=userDetail[0].authnet_profile_id
                    console.log("=======authnet_profile_id========",authnet_profile_id)

                let authnet_payment_profile_id =   await createAuthorizeNetCard(req.dbName,
                    params.email, params.card_number,
                     params.exp_month, params.exp_year,authnet_profile_id,
                    card_holder_name,
                    userData[0].customer_address.substring(0,11),
                    userData[0].customer_address.substring(0,11),
                    userData[0].customer_address.substring(0,11),
                    zipCode,res)
                     await addUserCardsOfAuthNet(req.dbName, user_id,
                          authnet_payment_profile_id,card_source);
                          customer_payment_id=authnet_payment_profile_id
            }else{
             let authnet_profile_id = await createAuthNetCustomer(req.dbName, params.email,res);
            await saveAuthNetCustomerId(req.dbName, authnet_profile_id, user_id)
             logger.debug("========authnet_profile_id================",authnet_profile_id)
            let authnet_payment_profile_id =  await createAuthorizeNetCard(req.dbName,
                    params.email, params.card_number,
                    params.exp_month, params.exp_year,authnet_profile_id,
                    card_holder_name,
                    userData[0].customer_address.substring(0,11),
                    userData[0].customer_address.substring(0,11),
                    userData[0].customer_address.substring(0,11),
                    zipCode,res)
        
                await addUserCardsOfAuthNet(req.dbName, user_id,  authnet_payment_profile_id,card_source);
                customer_payment_id=authnet_payment_profile_id
        
            }
            console.log("44444444444444444444",customer_payment_id)
            sendResponse.sendSuccessData({customer_payment_id:customer_payment_id}, constant.responseMessage.SUCCESS, res, 200);
        
        }

        else if((params.gateway_unique_id) == config.get("payment.paymaya.unique_id")){

            
            let checkAlreadyExist = await checkCardAlreadyExistOfPaymaya(req.dbName,user_id,
                params.card_number,params.gateway_unique_id)
            if(checkAlreadyExist && checkAlreadyExist.length>0){
                return sendResponse.sendErrorMessage("Card with this details already exist",res,400);
            }else{
                
                let getPaymayaKeys = await Universal.getPayMayaKeys(req.dbName);
            console.log(req,"requesttttttttttttttttttttttttttttttttttttttttttt")
            let card_source = "paymaya";
            // userCards = await checkUserCards(req.dbName, user_id, card_source);
            // logger.debug('===usercarsdss ===========',userCards)
            // let paymayadata = await Universal.getPayMayaKeys(req.dbName);
            // logger.debug("=====paymayasecret_key_data=========",paymayadata);
                // console.log(config.get("payment.paymaya.basic_auth"),"basic authggggggggggggggggggggggggg")
            let paymayaToken = await generatePaymayaToken(req.dbName,params.card_number,params.exp_month,params.exp_year,params.cvc,getPaymayaKeys.paymaya_basic_auth);
            
            logger.debug("=====paymaya_data=tisthis========",paymayaToken);
console.log(userData[0].firstname,"hhhhhhhhhhhhhhhhhhhhhhhhh")
            var newCustomerData =  await createPaymayaCustomer(req.dbName,userData[0],getPaymayaKeys.paymaya_basic_auth_customer);	
            console.log("bksjvurvvvvvvvvvvvvvv,",newCustomerData)

            var linkcCardToCustomer = await linkPaymayaCardToCustomer(req.dbName,paymayaToken.paymentTokenId,newCustomerData.id,getPaymayaKeys.basic_auth_customer);
           
                await addUserCardsOfPaymaya(req.dbName,params.user_id,paymayaToken.paymentTokenId,newCustomerData.id,params.card_type,params.exp_month,params.exp_year,params.cvc,params.card_number,card_source);
            console.log(addUserCardsOfPaymaya,"iiiiiiiiiiiiiiiiiiiiiiii")
            sendResponse.sendSuccessData({customer_payment_id:linkcCardToCustomer.verificationUrl}, constant.responseMessage.SUCCESS, res, 200);   
        }
    }
        
        else if((params.gateway_unique_id) == config.get("payment.urway.unique_id")){

            let checkAlreadyExist = await checkCardAlreadyExistOfUrway(req.dbName,user_id,
                params.card_number,params.card_nonce,params.gateway_unique_id)
            if(checkAlreadyExist && checkAlreadyExist.length>0){
                return sendResponse.sendErrorMessage("Card with this details already exist",res,400);
            }else{

                let result  = await addUserCardsOfUrway(req.dbName,params.user_id,
                    params.card_type,params.exp_month,
                    params.exp_year,params.cvc,
                    params.card_number,params.card_nonce,params.gateway_unique_id);
    
                console.log(result,"dlvbslj");
    
                sendResponse.sendSuccessData({payment:result}, constant.responseMessage.SUCCESS, res, 200);
            
        }
        }
        else if((params.gateway_unique_id) == "paymaya"){

            let getPaymayaKeys = await Universal.getPayMayaKeys(req.dbName);
            if(getPaymayaKeys.hasOwnProperty('paymaya_public_key') && getPaymayaKeys.hasOwnProperty('paymaya_secret_key') && getPaymayaKeys.hasOwnProperty('paymaya_basic_auth')
             && getPaymayaKeys.hasOwnProperty('paymaya_basic_auth_customer')){

                let checkAlreadyExist = await checkCardAlreadyExistOfPaymaya(req.dbName,user_id,
                    params.card_number,params.gateway_unique_id)

                if(checkAlreadyExist && checkAlreadyExist.length>0){
                    return sendResponse.sendErrorMessage("Card with this details already exist",res,400);
                }else{

                        console.log(req,"requesttttttttttttttttttttttttttttttttttttttttttt")
    
                        let card_source = "paymaya";
        
                        // console.log(config.get("payment.paymaya.basic_auth"),"basic authggggggggggggggggggggggggg")
        
                        let paymayaToken = await generatePaymayaToken(req.dbName,params.card_number,params.exp_month,params.exp_year,params.cvc,getPaymayaKeys.paymaya_basic_auth);
        
                        logger.debug("=====paymaya_data=tisthis========",paymayaToken);
        
                        console.log(userData[0].firstname,"hhhhhhhhhhhhhhhhhhhhhhhhh")
        
                        var newCustomerData =  await createPaymayaCustomer(req.dbName,userData[0],getPaymayaKeys.paymaya_basic_auth_customer);	
                        console.log("bksjvurvvvvvvvvvvvvvv,",newCustomerData)
            
                        var linkcCardToCustomer = await linkPaymayaCardToCustomer(req.dbName,paymayaToken.paymentTokenId,newCustomerData.id,getPaymayaKeys.paymaya_basic_auth_customer);
                       
                            await addUserCardsOfPaymaya(req.dbName,params.user_id,paymayaToken.paymentTokenId,newCustomerData.id,params.card_type,params.exp_month,params.exp_year,params.cvc,params.card_number,card_source);
                        console.log(addUserCardsOfPaymaya,"iiiiiiiiiiiiiiiiiiiiiiii")
                        sendResponse.sendSuccessData({customer_payment_id:linkcCardToCustomer.verificationUrl}, constant.responseMessage.SUCCESS, res, 200);   
                  
    
                }
            }else{
                let msg = "paymaya keys not found"
                sendResponse.sendErrorMessage(msg,res,500)
            }
            
            // }
        
        
        }
          else if((params.gateway_unique_id) == "firstatlanticcommerce"){

            let getFirstElanticKeys = await Universal.getFirstatlanticKeys(req.dbName);
            console.log("Aaaaaaaaaaaaaaaaa")
            if(getFirstElanticKeys.hasOwnProperty('firstalantic_merchant_pwd') && getFirstElanticKeys.hasOwnProperty('firstalantic_merchan_id') && getFirstElanticKeys.hasOwnProperty('firstalantic_acquire_id')
            ){
                console.log(getFirstElanticKeys,"bbbbbbbbbbbbbbbbbbbbb")

                let checkAlreadyExist = await checkCardAlreadyExistOfPaymaya(req.dbName,user_id,
                    params.card_number,params.gateway_unique_id);
           
                if(checkAlreadyExist && checkAlreadyExist.length>0){
                    return sendResponse.sendErrorMessage("Card with this details already exist",res,400);
                }else{
                    logger.debug("===checkAlreadyExist=>>",checkAlreadyExist)
                        let card_source = "firstatlanticcommerce";
                        let newCustomerData=await getFirstatlanticToken(params.name,params.card_number,params.exp_year,params.exp_month,params.cvc,getFirstElanticKeys);
                        console.log(newCustomerData,"cccccccccccccccccc")

                        await addUserCardsOfEccome(req.dbName,userData[0].id,newCustomerData.id,newCustomerData.id,params.card_type,params.exp_month,params.exp_year,0,newCustomerData.id,card_source,params.card_holder_name);
                        sendResponse.sendSuccessData({customer_payment_id:newCustomerData.id}, constant.responseMessage.SUCCESS, res, 200); 
                }
            }else{
                let msg = "paymaya keys not found"
                sendResponse.sendErrorMessage(msg,res,500)
            }
        }
        else{
            let msg = "Not any key match with any payment gateway"
            sendResponse.sendErrorMessage(msg,res,500)
        }

    }
    catch (e) {
        console.log("=======Err!===",e)
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}
/**
 * Used for getting an paystack token for making an payment
 * */
const atlanticTransactionVerification=async (req,res)=>{
    try{
       let params=req.body;
       console.log("===transactionData>>",params);
       
       
        if(params["ResponseCode"]=="1" || params["ResponseCode"]=="0" || params["ResponseCode"]==0){
            res.writeHead(302, {'Location': 'https://paquett.com/success?transctionRef='+params["OrderID"]+''});
            res.end();
        }
        else{
            res.writeHead(302, {'Location': 'https://paquett.com/failure'});
            res.end();
        } 
       
    
    }
    catch(err){
        logger.debug("============ERR!==",err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }

}

const getFirstatlanticToken = (name,card_number,exp_year,exp_month,cvc,keys)=>{
return new Promise(async(resolve,reject)=>{
        try{
            
        let secretData  = keys["firstalantic_merchant_pwd"]+keys["firstalantic_merchan_id"]+keys["firstalantic_acquire_id"];
        console.log("====>>",secretData)
        let shaData = crypto.createHash('sha1');
        shaData.update(secretData);
        let signatureKey = shaData.digest('base64');
        let inputXml=`<TokenizeRequest xmlns:i="http://www.w3.org/2001/XMLSchema-instance"
        xmlns="http://schemas.firstatlanticcommerce.com/gateway/data"><CardNumber>${card_number}</CardNumber><ExpiryDate>${exp_month}${exp_year}</ExpiryDate><MerchantNumber>${keys["firstalantic_merchan_id"]}</MerchantNumber><Signature>${signatureKey}</Signature></TokenizeRequest>`;

       let baseUrl = (process.env.NODE_ENV == 'prod') ? 'https://marlin.firstatlanticcommerce.com' : 'https://ecm.firstatlanticcommerce.com';

       
       // let baseUrl ='https://ecm.firstatlanticcommerce.com';

       console.log("===xml=>>",inputXml)
        let options = { method: 'POST',
        url: baseUrl+'/PGServiceXML/Tokenize',
        headers: {
                'Content-Type':'text/xml;charset=utf-8'
        },
        body:inputXml
        };
        console.log("===options>>",options);
        request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
            // logger.debug("==error=>",body)
            if(error){
                var msg = "something went wrong";
                // sendResponse.sendErrorMessage(msg,res,500);
            }else {
                let parser = new xml2js.Parser({explicitArray: false, trim: true});
                parser.parseString(body, (err, result) => {
                    console.log("===body==>>",result["TokenizeResponse"]["Success"],result)
                    if(result["TokenizeResponse"]["Success"]){
                        resolve({id:result["TokenizeResponse"]["Token"]})
                    }
                    else{
                        reject()
                    }
                });   

            }
         
        })
    }
    catch(Err){
        console.log("Err!",Err)
            reject()
        }
      
})


}
const getAltanticEcommerce = async (req, res) => {
    try{
        let getFirstElanticKeys = await Universal.getFirstatlanticKeys(req.dbName);
        let amount = req.body.amount;
        let currency = req.body.currency;
        let paymenyToken=req.body.payment_token;
        if(Object.keys(getFirstElanticKeys).length>0){

            let htmLData=await getFirstatlanticTransaction(amount,getFirstElanticKeys,paymenyToken);
            console.log(htmLData,"htmLDatahtmLData");
            sendResponse.sendSuccessData({htmlData:htmLData}, constant.responseMessage.SUCCESS, res, 200);
        }
        else{
            let Err=await  Universal.getMsgText(
                14,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
             return sendResponse.sendErrorMessage(Err,res,400);
        }
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
};

const getFirstatlanticTransaction = (amount,getFirstElanticKeys,paymenyToken)=>{

    return new Promise(async(resolve,reject)=>{
            try{
                let url=config.get("server.protocol")+config.get("server.ip")
                // const ngrok = require('ngrok');
                //  url = await ngrok.connect({
                //                     addr:9020
                //                });
                               console.log("=====url=>>",url)
                let baseUrl = (process.env.NODE_ENV == 'prod') ? 'https://marlin.firstatlanticcommerce.com' : 'https://ecm.firstatlanticcommerce.com';
               
                let numbers=(amount).toFixed(2);
                let amountAfterDecimal=numbers.split(".")[1]
                let amountBeforDecimal=numbers.split(".")[0];
                let leftAmountLength=12-(amountAfterDecimal+amountBeforDecimal).length;
                let refrenceId=randomstring.generate({
                                length: 5,
                                charset: 'numeric'
                            }).toUpperCase();
                console.log("=000000315200=beforeSplit,aftersplit>",amountAfterDecimal,amountBeforDecimal,12-(amountAfterDecimal+amountBeforDecimal).length,'0'.repeat(7));

                let _amount='0'.repeat(leftAmountLength)+amountBeforDecimal+amountAfterDecimal;
                console.log("====_amount",_amount)
                let _orderId="DOIT"+refrenceId;
                let currencyCode="320"
                let secretData = getFirstElanticKeys["firstalantic_merchant_pwd"] + getFirstElanticKeys["firstalantic_merchan_id"] + getFirstElanticKeys["firstalantic_acquire_id"]+_orderId+_amount+currencyCode;
                // a1B23c1234567890464748FACTEST01000000001200840
                console.log("===secretData=>>",secretData)
                // Processing Password (orange) 
                // FAC ID (blue)
                // Acquirer ID (green)
                // Order ID (brown)
                // Amount (red)
                // Purchase Currency (purple)
                let shaData = crypto.createHash('sha1');
                shaData.update(secretData);
                let signatureKey = shaData.digest('base64');
                console.log("===signatureKey===paymenyTokenLength=....>>",signatureKey,paymenyToken.length)

                let options;
                let inputXml;
                if(paymenyToken.length<16){
                    inputXml=`<AuthorizeRequest xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.firstatlanticcommerce.com/gateway/data">
                            <TransactionDetails>
                            <AcquirerId>464748</AcquirerId>
                            <MerchantId>${getFirstElanticKeys["firstalantic_merchan_id"]}</MerchantId>
                            <Signature>${signatureKey}</Signature>
                            <SignatureMethod>SHA1</SignatureMethod>
                            <TransactionCode>8</TransactionCode>
                            <OrderNumber>${_orderId}</OrderNumber>
                            <Amount>${_amount}</Amount>
                            <Currency>320</Currency>
                            <CurrencyExponent>2</CurrencyExponent>
                            <ExtensionData />
                            </TransactionDetails>
                            <CardDetails>
                            <CardNumber>${paymenyToken}</CardNumber> <CardExpiryDate>1222</CardExpiryDate><Installments>0</Installments>
                            </CardDetails>
                            <MerchantResponseURL>${url}/atlantic/verify</MerchantResponseURL>
                            </AuthorizeRequest>`;
                                options = {
                                    method: 'POST',
                                    url: baseUrl+'/PGServiceXML/Authorize',
                                    headers: {
                                        'Content-Type': 'text/xml;charset=utf-8'
                                    },
                                    body: inputXml
                                };
    
                }
                else{
                    inputXml=`<Authorize3DSRequest xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.firstatlanticcommerce.com/gateway/data">
                    <TransactionDetails>
                    <AcquirerId>464748</AcquirerId>
                    <MerchantId>${getFirstElanticKeys["firstalantic_merchan_id"]}</MerchantId>
                    <Signature>${signatureKey}</Signature>
                    <SignatureMethod>SHA1</SignatureMethod>
                    <TransactionCode>8</TransactionCode>
                    <OrderNumber>${_orderId}</OrderNumber>
                    <Amount>${_amount}</Amount>
                    <Currency>320</Currency>
                    <CurrencyExponent>2</CurrencyExponent>
                    <ExtensionData />
                    </TransactionDetails>
                    <CardDetails>
                    <CardNumber>${paymenyToken}</CardNumber> <CardExpiryDate>1222</CardExpiryDate><Installments>0</Installments>
                    </CardDetails>
                    <MerchantResponseURL>${url}/atlantic/verify</MerchantResponseURL>
                    </Authorize3DSRequest>`;
                        options = {
                            method: 'POST',
                            url: baseUrl+'/PGServiceXML/Authorize3DS',
                            headers: {
                                'Content-Type': 'text/xml;charset=utf-8'
                            },
                            body: inputXml
                        };
                    }
             
            console.log("===xml=>>", inputXml);
            
            request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
                console.log("==firstatlantic==error=>",body)
                if(error){
                    var msg = "something went wrong";
                    // sendResponse.sendErrorMessage(msg,res,500);
                    reject(msg)
                }else {
                    let parser = new xml2js.Parser({explicitArray: false, trim: true});
                    parser.parseString(body, (err, result) => {
    
                        console.log("===body==>>",err,result)
                        if(result["Authorize3DSResponse"] && result["Authorize3DSResponse"]["ResponseCode"]=="0"){
                             resolve(result["Authorize3DSResponse"]["HTMLFormData"])
                        }
                        else if(result["AuthorizeResponse"]){
                            console.log ( "here success")
                            resolve(JSON.stringify(result["AuthorizeResponse"]))
                        }
                        else{
                            console.log ( "here error")
                            reject()
                        }
                    
                    });  
                }
                
            })
                 }
                    catch(Err){
                        console.log("==Err==>>",Err)
                    }
        
        
          
    })
    
    
    }

    const  createPaymayaCustomer = async (dbName,users, basic_auth)=>{
        console.log(users.firstname,"fgkdylisyeeevbyy")
        let header = {
            Authorization: `Basic ${basic_auth}`,
            'Content-Type' : `application/json`
            };
        
            let Obj ={
                "firstName": users.firstname,
                "middleName": "",
                "contact":{
                    "email": users.email
                }
             };
        
                  console.log(Obj,"objobjbj")
        //  let url = (process.env.NODE_ENV == 'prod') ? 'https://pg.paymaya.com' : 'https://pg-sandbox.paymaya.com';     
        let url = (process.env.NODE_ENV == 'prod') ? 'https://pg-sandbox.paymaya.com' : 'https://pg-sandbox.paymaya.com'; 
          let baseURL = url+'/payments/v1/customers';     
          console.log("==paymaya==baseURL====>>",baseURL)
          let  options = {
            method: 'POST',
            url: baseURL,
            body: Obj,
            headers: header,
            json: true };
            let result = await requestApi(options);
            console.log(options,"8888888888888888888888")
            return result;
        
        
        };
        // const linkPaymayaCardToCustomer = async (dbName,paymentTokenId,customerId,basic_auth)=>{
    
        //     let header = {
        //         Authorization: `Basic ${basic_auth}`,
        //         'Content-Type' : `application/json`
        //         };
                
        //     let Obj ={
        //         "paymentTokenId": paymentTokenId ,
        //         "isDefault": true
                
        //      };
            
        //      let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://pg.paymaya.com' : 'https://pg-sandbox.paymaya.com';     
        //          console.log("==paymaya==baseURL====>>",baseURL)
        //      console.log("==payulatam==baseURL====>>",baseURL)
        //      let  options = {
        //         method: 'POST',
        //         url: `${baseURL}/payments/v1/customers/${customerId}/cards`,
        //         body: Obj,
        //         headers: header,
        //         json: true };
                
        //         let result = await requestApi(options);
        //         return result;
        // }


        
// const addUserCardsOfPaymaya = (dbName,user_id,paymentTokenID,CustomerID,card_type,exp_month,exp_year,cvc,card_number,card_source)=>{
//     return new Promise(async(resolve,reject)=>{
//         let query = "insert into user_cards(user_id,card_id,customer_payment_id,card_type,exp_month,exp_year,cvc,card_number,card_source)"
//         query += "values(?,?,?,?,?,?,?,?,?)";
//         let params = [user_id,paymentTokenID,CustomerID,card_type,exp_month,exp_year,cvc,card_number,card_source];
//         let result = await ExecuteQ.Query(dbName,query,params);
//         resolve(result)
//     })
// }



    
    
    
const linkPaymayaCardToCustomer = async (dbName,paymentTokenId,customerId,basic_auth)=>{
    
    let header = {
        Authorization: `Basic ${basic_auth}`,
        'Content-Type' : `application/json`
        };
        
    let Obj ={
        "paymentTokenId": paymentTokenId ,
        "isDefault": true
        
     };
     let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://pg.paymaya.com' : 'https://pg-sandbox.paymaya.com';     
         console.log("==paymaya==baseURL====>>",baseURL)
     console.log("==payulatam==baseURL====>>",baseURL)
     let  options = {
        method: 'POST',
        url: `${baseURL}/payments/v1/customers/${customerId}/cards`,
        body: Obj,
        headers: header,
        json: true };
        
        let result = await requestApi(options);
        return result;
}



const checkCardAlreadyExistOfPaymaya = (dbName,user_id,card_number,card_source)=>{
    return new Promise(async(resolve,reject)=>{
 
        
        let query = "select id from user_cards where user_id=? and card_number=?  and card_source=? and is_deleted =0"
 
        let params = [user_id,card_number,card_source];
 
        let result = await ExecuteQ.Query(dbName,query,params);
        
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
}



const generatePaymayaToken =  async( dbName,card_number,exp_month,exp_year,cvc, basic_auth)=>{

    let header = {
        Authorization: `Basic ${basic_auth}`,
        'Content-Type' : `application/json`
        };
        
    let Obj ={
       
        "card": {
            "number": card_number,
            "expMonth": exp_month,
            "expYear": exp_year,
            "cvc": cvc
          }
     };
    
     //let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://pg.paymaya.com' : 'https://pg-sandbox.paymaya.com';     
     let baseURL = 'https://pg-sandbox.paymaya.com';     
     console.log("==paymaya==baseURL====>>",baseURL)
     let  options = {
        method: 'POST',
        url: `${baseURL}/payments/v1/payment-tokens`,
        body: Obj,
        headers: header,
        json: true };
        let result = await requestApi(options);
        return result;
    };
    
    
            
    // const  createPaymayaCustomer = async (dbName,users, basic_auth)=>{
    //     console.log(users.firstname,"fgkdylisyeeevbyy")
    //     let header = {
    //         Authorization: `Basic ${basic_auth}`,
    //         'Content-Type' : `application/json`
    //         };
        
    //         let Obj ={
    //             "firstName": users.firstname,
    //             "middleName": "",
    //             "contact":{
    //                 "email": users.email
    //             }
    //          };
    //     console.log(Obj,"objobjbj")
    //      //let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://pg.paymaya.com' : 'https://pg-sandbox.paymaya.com';     
    //      let baseURL = 'https://pg-sandbox.paymaya.com/payments/v1/customers';     
    //      console.log("==paymaya==baseURL====>>",baseURL)
    //      let  options = {
    //         method: 'POST',
    //         url: baseURL,
    //         body: Obj,
    //         headers: header,
    //         json: true };
    //         let result = await requestApi(options);
    //         console.log(options,"8888888888888888888888")
    //         return result;
    //     };
        
        
        



const addUserCardsOfPaymaya = (dbName,user_id,paymentTokenID,CustomerID,card_type,exp_month,exp_year,cvc,card_number,card_source)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_cards(user_id,card_id,customer_payment_id,card_type,exp_month,exp_year,cvc,card_number,card_source)"
        query += "values(?,?,?,?,?,?,?,?,?)";
        let params = [user_id,paymentTokenID,CustomerID,card_type,exp_month,exp_year,cvc,card_number,card_source];
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)
    })
}

const addUserCardsOfEccome = (dbName,user_id,paymentTokenID,CustomerID,card_type,exp_month,exp_year,cvc,card_number,card_source,card_holder_name)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_cards(card_holder_name,user_id,card_id,customer_payment_id,card_type,exp_month,exp_year,cvc,card_number,card_source)"
        query += "values(?,?,?,?,?,?,?,?,?,?)";
        let params = [card_holder_name,user_id,paymentTokenID,CustomerID,card_type,exp_month,exp_year,cvc,card_number,card_source];
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)
    })
}


        
        
        

const addUserCardsOfUrway = (dbName,user_id, card_type,exp_month,exp_year,cvc,card_number,card_payment_id,card_source)=>{
    return new Promise(async(resolve,reject)=>{

        
        let query = "insert into user_cards(user_id,card_type,exp_month,exp_year,cvc,card_number,card_payment_id,card_source)"
        query += "values(?,?,?,?,?,?,?,?)"
        let params = [user_id,card_type,exp_month,exp_year,cvc,card_number,card_payment_id,card_source];
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)
    })
}

const checkCardAlreadyExistOfUrway = (dbName,user_id,card_number,card_payment_id,card_source)=>{
    return new Promise(async(resolve,reject)=>{

        
        let query = "select id from user_cards where user_id=? and card_number=?  and card_source=? and is_deleted =0"

        let params = [user_id,card_number,card_source];

        let result = await ExecuteQ.Query(dbName,query,params);
        
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
}
 

const createAuthorizeNetCard = (dbName,user_email,
    card_number,expiryMonth,expiryYear,authnet_profile_id,
    user_name,address,city,state,zip,res      
    )=>{
        console.log("=========create auth card function ========",user_name,
        address,city,state,zip,res)
    return new Promise(async(resolve,reject)=>{

        let authorize_net_key_data = await Universal.getAuthorizeNetKeys(dbName);
        console.log("==========authorize_net_key_data=============",authorize_net_key_data)

        if( Object.keys(authorize_net_key_data).length>0){
            let base_url = process.env.NODE_ENV == 'prod'?'https://api.authorize.net/xml/v1/request.api':'https://apitest.authorize.net/xml/v1/request.api'
            let validationMode = process.env.NODE_ENV == 'prod'?'live':'testMode'

            let merchantCustomerId = "rer_cust_id_"+randomstring.generate({
                length: 5,
                charset: 'alphanumeric'
            }).toUpperCase();
            let expirationDate = expiryYear+"-"+expiryMonth
            let body = {
                "createCustomerPaymentProfileRequest": {
                    "merchantAuthentication": {
                     "name": authorize_net_key_data[config.get("payment.authorize_net.api_login_id")],
                     "transactionKey": authorize_net_key_data[config.get("payment.authorize_net.transaction_key")]
                 },
                  "customerProfileId": authnet_profile_id,
                  "paymentProfile": {
                    "billTo": {
                      "firstName": user_name,
                      "lastName": user_name,
                      "address": address,
                      "city": city,
                      "state": state,
                      "zip": zip
                    },
                    "payment": {
                      "creditCard": {
                        "cardNumber": card_number,
                        "expirationDate": expirationDate
                      }
                    },
                    "defaultPaymentProfile": false
                }
                //   },
                //   "validationMode":validationMode
                }
              }
           console.log('===========body=======',JSON.stringify(body));
            var options = {
                'method': 'POST',
                'url':base_url,
                'headers': {
                    'Content-Type': 'application/json'
                },
                body:body,
                json: true
            };
            logger.debug("=====body==========================",JSON.stringify(body))

            web_request(options, async function (error, response, body) {
                logger.debug("===authorize.net====",error)
                if(error){
                    reject(error);
                }
                else{
                    // logger.debug("=====body==========================",JSON.stringify(body))
                    body = JSON.parse(body.trim());
                    // logger.debug("==========json body]]==========",body);

                    console.log("========body.messages.resultCode==========",
                    body.messages,body.messages.resultCode);

                    if(body.messages.resultCode=="Error"){
                        let errormsg = body.messages.message[0].text
                        sendResponse.sendErrorMessage(errormsg,res,400)
                    }else if(body.messages.resultCode=="Ok"){
                        resolve(body.customerPaymentProfileId);
                    }else{
                        let errormsg = "something went wrong while creating customer to Auth.net"
                        sendResponse.sendErrorMessage(errormsg,res,400) 
                    }
                }
            });

        }
        else{
            reject("authorize.net gateway keys not added");
        }
    })    
}

const addUserCardsOfAuthNet = (dbName,user_id,authnet_payment_profile_id,card_source)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_cards(user_id,authnet_payment_profile_id,card_source)"
        query += "values(?,?,?)"
        let params = [user_id,authnet_payment_profile_id,card_source];
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)
    })
}

const createAuthNetCustomer = (dbName,user_email,res)=>{
    return new Promise(async(resolve,reject)=>{

        let authorize_net_key_data = await Universal.getAuthorizeNetKeys(dbName);
        logger.debug("==========authorize_net_key_data=============",authorize_net_key_data)

        if( Object.keys(authorize_net_key_data).length>0){
            let base_url = process.env.NODE_ENV == 'prod'?'https://api.authorize.net/xml/v1/request.api':'https://apitest.authorize.net/xml/v1/request.api'
            let validationMode = process.env.NODE_ENV == 'prod'?'live':'testMode'

            let merchantCustomerId = "rer_cust_id_"+randomstring.generate({
                length: 5,
                charset: 'alphanumeric'
            }).toUpperCase();
            let body = {
                "createCustomerProfileRequest": {
                    "merchantAuthentication": {
                        "name": authorize_net_key_data[config.get("payment.authorize_net.api_login_id")],
                        "transactionKey": authorize_net_key_data[config.get("payment.authorize_net.transaction_key")]
                    },
                    "profile": {
                        "merchantCustomerId": merchantCustomerId,
                        "description": "Profile description here",
                        "email": "customer-profile-"+user_email+""
                    }
                }
            }
            logger.debug('===========body=======',body);
            var options = {
                'method': 'POST',
                'url':base_url,
                'headers': {
                    'Content-Type': 'application/json'
                },
                body:body,
                json: true
            };
            web_request(options, async function (error, response, body) {
                logger.debug("===authorize.net====",error)
                if(error){
                    reject(error);
                }
                else{
                     body = body.trim();
                    body = JSON.parse(body)

                    logger.debug("========body.messages.resultCode==========",
                    body.messages,body.messages.resultCode);
                    
                    if(body.messages.resultCode=="Error"){
                        let errormsg = body.messages.message[0].text
                        sendResponse.sendErrorMessage(errormsg,res,400)
                    }else if(body.messages.resultCode=="Ok"){
                        resolve(body.customerProfileId);
                    }else{
                        let errormsg = "something went wrong while creating customer to Auth.net"
                        sendResponse.sendErrorMessage(errormsg,res,400) 
                    }
                }
            });

        }
        else{
            let errormsg = "auth net keys are not added";
            sendResponse.sendErrorMessage(errormsg,res,400)
        }
    })    
}



const saveCyberCardSourceAsToken= (cyberSourceData,cardNumber,cvc,expirationYear,expirationMonth)=>{
        logger.debug("==cyberSourceData,cardNumber,cvc,expirationYear,expirationMonth===",
        cyberSourceData,cardNumber,cvc,expirationYear,expirationMonth
        )
        var cybersourceRestApi = require('cybersource-rest-client');
        var instance = new cybersourceRestApi.InstrumentIdentifierApi({
            'authenticationType':process.env.NODE_ENV == 'prod'? 'https_signature':'http_signature',
            'runEnvironment':process.env.NODE_ENV == 'prod'? 'cybersource.environment.production':'cybersource.environment.SANDBOX',
            // 'merchantID':cyberSourceData.cybersource_merchant_id,
            // 'merchantKeyId': cyberSourceData.cybersource_merchant_key_id,
            // 'merchantsecretKey': cyberSourceData.cybersource_merchant_secret_key
            'merchantID':'testrest',
            'merchantKeyId': '08c94330-f618-42a3-b09d-e1e43be5efda',
            'merchantsecretKey': 'yBJxy6LjM2TmcPGu+GaJrHtkke25fPpUX+UY6/L/1tE='
        });
        var card = new cybersourceRestApi.Tmsv1instrumentidentifiersCard();
        card.number = cardNumber;
        card.expirationMonth=expirationMonth;
        card.expirationYear=expirationYear;
        card.securityCode=cvc;

		var body = new cybersourceRestApi.CreateInstrumentIdentifierRequest();
		body.card = card;
        body.type="enrollable card"
		var profileId = 'B7F02830-50C1-4756-9AAD-278E45545383';
        return new Promise((resolve,reject)=>{
		console.log('\n*************** Create Instrument Identifier ********************* ');
		instance.createInstrumentIdentifier(profileId, body, function (error, data, response) {
            logger.debug("==ERR!===",error,data)
			if (error) {
                reject(error)
				console.log('\nError in create instrument identifier : ' + JSON.stringify(error));
			}
			else{
                // logger.debug("========DATA!==",data)
                resolve(data)
            }
        });
    })
}


const addCyberSourceCards = (dbName, customer_payment_id,card_type,user_id, card_number, exp_month, exp_year,cvc,card_source)=>{
    logger.debug("====SAVE=IN==DB==>>")
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_cards(customer_payment_id,user_id,card_type, card_number, exp_month, exp_year,card_source)"
        query += "values(?,?,?,?,?,?,?)"
        let params = [customer_payment_id,user_id,card_type, card_number, exp_month, exp_year,card_source]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result);
    })
}


const addAgentCyberSourceCards = (dbName, customer_payment_id,card_type,user_id, card_number, exp_month, exp_year,cvc,card_source)=>{
    logger.debug("====SAVE=IN==DB==>>")
    return new Promise(async(resolve,reject)=>{
        let query = "insert into cbl_user_cards(customer_payment_id,user_id,card_type, card_number, exp_month, exp_year,card_source)"
        query += "values(?,?,?,?,?,?,?)"
        let params = [customer_payment_id,user_id,card_type, card_number, exp_month, exp_year,card_source]


        let getAgentDbData=await common.GetAgentDbInformation(dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        var result = await ExecuteQ.QueryAgent(agentConnection,query,params);
        
        resolve(result);
    })
}

const savePeachCards= (dbName,user_id,peach_secret_key_data,params,isAgent)=>{

    return new Promise((resolve,reject)=>{
        
        let url = 'https://test.oppwa.com/v1/registrations';
        let headers= {
            'Content-Type': 'application/x-www-form-urlencoded',
            //'Authorization':'Bearer OGFjN2E0Yzk3MTEyOWYyMjAxNzExNjI2YWYxYjA4N2J8SlpSeFljNnRtbg=='
            'Authorization':'Bearer '+peach_secret_key_data[config.get("payment.peach.peach_auth_token")]
        };
        let obj ={
            //'entityId':'8ac7a4c771129f2401711626cae30c42',
            'entityId':peach_secret_key_data[config.get("payment.peach.peach_entityid")],
            'paymentBrand':params.card_type,
            'card.number':params.card_number,
            'card.holder':params.card_holder_name,
            'card.expiryMonth':params.exp_month,
            'card.expiryYear':params.exp_year,
            'card.cvv':params.cvc,
            'recurringType':'INITIAL',
        };

        console.log(obj,"objobjobjobj")
        
        var options = {
            method: 'POST',
            url: url,
            headers:headers,
            form: obj,
            json: true 
        };

        web_request(options, async function (error, response, body) {
            console.log(error,"########################################",JSON.stringify(body))
            if(error){
                reject(error)
            }else{
                if(isAgent=="1"){
                    let getAgentDbData=await common.GetAgentDbInformation(dbName); 
                    let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                    cardsData = await ExecuteQ.QueryAgent(agentConnection,"update cbl_user set peach_customer_id=? where id=?",[body.id,user_id]);
                }else{
                    await ExecuteQ.Query(dbName,"update user set peach_customer_id=? where id=?",[body.id,user_id]);
                }
                resolve(body)                
            }
        });
    })
}

const getStripeToken = (name,stripe_secret_key,card_number,exp_year,exp_month,cvc)=>{
    return new Promise(async(resolve,reject)=>{
        const stripe = require('stripe')(stripe_secret_key);
        stripe.tokens.create(
            {
              card: {
                number: card_number,
                exp_month: exp_month,
                exp_year: exp_year,
                cvc: cvc,
                name:name
              },
            },
            function(err, token) {
              // asynchronously calle
              console.log(err,token)
              if(err){
                  reject(err)
              }else{
                  resolve(token.id)
              }
            }
          );
          
    })
}

const generatepayuLatamToken =  async( customerId, data, basic_auth)=>{

    let header = {
        Authorization: `Basic ${basic_auth}`,
        'Content-Type' : `application/json`
        };
        
    let Obj ={
        "name": data.card_holder_name ,
        "document": data.document ,
        "number": data.card_number,
        "expMonth": data.exp_month,
        "expYear": data.exp_year,
        "type": data.card_type,
        "address": {
           "line1": "",
           "line2": "",
           "line3": "",
           "postalCode": "",
           "city": "",
           "state": "",
           "country": "MX",
           "phone": ""
        }
     };
    
     let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://api.payulatam.com' : 'https://sandbox.api.payulatam.com';     
     console.log("==payulatam==baseURL====>>",baseURL)
     let  options = {
        method: 'POST',
        url: `${baseURL}/payments-api/rest/v4.3/customers/${customerId}/creditCards`,
        body: Obj,
        headers: header,
        json: true };
        
        let result = await requestApi(options);
        return result;
    };
    
  
 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const  updatepayuLatamCustomerCard  = async(data, payu_latam_api_login, payu_latam_api_key)=>{
 
	let header = {
		'Content-Type' : `application/json`
		};
	let Obj = {
		"expMonth": data.exp_month,
		"expYear": data.exp_year,
		"name": data.card_holder_name,
		"document": data.document,
		"address": {
		   "line1": "",
		   "line2": "",
		   "line3": "",
		   "city": "",
			"state": "",
			"country": "MX",
			"postalCode": "",
			"phone": ""
		}
	 }; 

      let baseURL = (process.env.NODE_ENV == 'prod') ? 'api.payulatam.com' : 'sandbox.api.payulatam.com';     
	let  options = {
		method: 'PUT',
		url: `https://${payu_latam_api_login}:${payu_latam_api_key}@${baseURL}/payments-api/rest/v4.3/creditCards/${data.card_id}`,
		json: Obj,
		headers: header
		 };
	
		let result = await requestApi(options);
		return  result;
};
    
////////////////////////////////////// create a Customer //////////////////////////////////////////////////////
const  createCustomer = async (users, basic_auth)=>{
	

	let header = {
	Authorization: `Basic ${basic_auth}`,
    'Content-Type' : `application/json`
	};

	let Obj ={
		"fullName": users.firstname + "" +users.lastname,
		"email": users.email
	 };

     let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://api.payulatam.com' : 'https://sandbox.api.payulatam.com';     
 let  options = {
	method: 'POST',
	url: `${baseURL}/payments-api/rest/v4.3/customers`,
	body: Obj,
	headers : header,
	json: true };

    
	let result = await requestApi(options);
	return result;

}    

////////////////////////////////  remove Customer Card   /////////////////////////////////////

const removePayuLatamCustomerCard  = async(payu_latam_api_login, payu_latam_api_key,cust_payment_id , credit_card_id)=>{
 
    let baseURL = (process.env.NODE_ENV == 'prod') ? 'api.payulatam.com' : 'sandbox.api.payulatam.com';     

	let  options = {
		method: 'DELETE',
		url: `https://${payu_latam_api_login}:${payu_latam_api_key}@${baseURL}/payments-api/rest/v4.3/customers/${cust_payment_id}/creditCards/${credit_card_id}`,
		json: true };
	
		let result = await requestApi(options);
		return  result;

}


const getStripeUserCards3d = (stripe_secret_key,customer_payment_id) => {
    return new Promise((resolve, reject) => {
        var stripe = require('stripe')(stripe_secret_key);

        stripe.paymentMethods.list({
            customer: customer_payment_id,
            type: 'card',
        }
            ,
            function (err, cards) {
                // asynchronously called
                if (err) {
                    if(err.raw && err.raw.message.includes('No such customer')){
                        resolve([])
                    }else{
                        reject(err)
                    }
                } else {
                    resolve(cards)
                }
            }
        );
    })
}

const listCards = async (req,res)=>{
    try{
        let params = req.query;
       console.log("requestdata>>>>>>>>>>>>>",req.query)
       logger.debug("===========list_cards=============",
       config.get("payment.authorize_net.unique_id"),params.gateway_unique_id,params.customer_payment_id)
       let cardsData;
       let stripe_3d_on=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["stripe_3d_on"]);
       let enableStripe = 0;
    if(stripe_3d_on && stripe_3d_on.length>0&&stripe_3d_on[0].value==1){
        enableStripe= 1;
    }

    /**
    * ------------add new for paystack card save amit ----\\
    */
     let paystack_card_save=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["paystack_card_save"]);
     console.log("paystack_card_save>>>>>>>>>>listCards>>>>>>>",paystack_card_save)
     let enable_paystack_card_save = 0;
     if(paystack_card_save && paystack_card_save.length>0&&paystack_card_save[0].value=="1"){
         enable_paystack_card_save= 1;
     }
     //----------------end---------------\\


    if(((params.gateway_unique_id) == "stripe") && enableStripe==1 ) {    
        let strip_secret_key_data = await Universal.getStripSecretKey(req.dbName);
        if(params.customer_payment_id==null || params.customer_payment_id==undefined){
            cardsData = {}
        }else{
            cardsData = await getStripeUserCards3d(strip_secret_key_data[0].value,
                params.customer_payment_id);
                console.log(cardsData.data,"jgcjhtxc")
                if(cardsData.data){
                   for(const [index,i] of cardsData.data.entries()){
                       i.exp_month = i.card.exp_month
                       i.exp_year= i.card.exp_year
                       i.last4= i.card.last4
                   }
           
               }
        }
       

        sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);
       }
    else
       if((params.gateway_unique_id) == "stripe") {    
        let strip_secret_key_data = await Universal.getStripSecretKey(req.dbName);
        if(params.customer_payment_id==null || params.customer_payment_id==undefined){
            cardsData = {}
        }else{
            cardsData = await getStripeUserCards(strip_secret_key_data[0].value,
                params.customer_payment_id);

        }
        console.log("gg",JSON.stringify(cardsData),"cardsDatacardsDatacardsDatacardsDatacardsData")


        sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);
       }
       else if((params.gateway_unique_id) == config.get("payment.payuLatam.unique_id")) {    
        let payuLatam_api_key_data = await Universal.getpayuLatamApiKey(req.dbName);
        let payuLatam_api_loginkey_data = await Universal.getpayuLatamApiLoginkey(req.dbName);
         console.log("***********payuLatam_secret_key_data", payuLatam_api_key_data, payuLatam_api_loginkey_data) ;
        if(params.customer_payment_id==null || params.customer_payment_id==undefined){
            cardsData = {}
        }else{
            cardsData = await getPayuLatamCardLists(payuLatam_api_loginkey_data[0].value,payuLatam_api_key_data[0].value,
                params.customer_payment_id);
        }
     
        sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);
       }
       else if((params.gateway_unique_id) == config.get("payment.conekta.unique_id")){
        cardsData = await getConektaUserCards(params.customer_payment_id);
        sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);
       }else if((params.gateway_unique_id) == config.get("payment.squareup.unique_id")){
        let squareData=await Universal.getSquareupSecretKey(req.dbName);
        if(params.customer_payment_id==null || params.customer_payment_id==undefined){
            cardsData = {}
        }else{

            cardsData = await getSquareupUserCards(squareData,req.dbName, params.customer_payment_id);

        }
        sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);
       }
      else if((params.gateway_unique_id) == config.get("payment.cybersource.unique_id")){
            let cyberData=Universal.getCyberSourceData(req.dbName);
            cardsData = await ExecuteQ.Query(req.dbName,"select * from user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,config.get("payment.cybersource.unique_id")]);
            sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);
        }
        else if((params.gateway_unique_id) == config.get("payment.peach.unique_id")){
            cardsData = await ExecuteQ.Query(req.dbName,"select * from user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,config.get("payment.peach.unique_id")]);
            cardsData = {data:cardsData}
            sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);

        }
        else if((params.gateway_unique_id) == "firstatlanticcommerce"){
            cardsData = await ExecuteQ.Query(req.dbName,"select * from user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,"firstatlanticcommerce"]);
            cardsData = {data:cardsData};
            sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);

        }
        else if((params.gateway_unique_id) == config.get("payment.paymaya.unique_id")){
            cardsData = await ExecuteQ.Query(req.dbName,"select DISTINCT card_payment_id, id,user_id,customer_payment_id,is_default,is_deleted, card_type,cvc, card_source, card_number, exp_month, exp_year,updated_at,created_at from user_cards where user_id=? and is_deleted=0 and card_source=?",[req.users.id,0,config.get("payment.paymaya.unique_id")]);
            if(cardsData && cardsData.length>0){
                for (const [index, i] of cardsData.entries()) {
                i.token = i.card_id
                }
               
            }
            cardsData = {data:cardsData}
            sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);

        }
        else if((params.gateway_unique_id)== config.get("payment.authorize_net.unique_id")){
            logger.debug("===========dbname===fadsfafds====",req.dbName)
        
        
        
        
            let cardsDetailsFromDb= await ExecuteQ.Query(req.dbName,"select * from user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,config.get("payment.authorize_net.unique_id")]);
            logger.debug("=========cardsDetailsFromDb =========",cardsDetailsFromDb)
           
            if(cardsDetailsFromDb && cardsDetailsFromDb.length>0){
                
                let userDetail = await ExecuteQ.Query(req.dbName,
                    "select authnet_profile_id from user where id=?",[req.users.id])
        
                let cardsData = [];
                let finalData = {}
                for(const [index,i] of cardsDetailsFromDb.entries()){
                    logger.debug("============cards ddtails loop=============")
                    let cardDetailsFromGateway = await getAuthorizeNetCardDetails(
                        userDetail[0].authnet_profile_id,
                        i.authnet_payment_profile_id,
                        req.dbName,
                        res
                        );
                        
                   logger.debug("==========cardDetailsFromGateway===============",
                   typeof cardDetailsFromGateway,cardDetailsFromGateway);
        
                    logger.debug("==============cardsdata========1======",cardsData)
                        cardsData.push(cardDetailsFromGateway)
                     finalData = {"data":cardsData}
        
                    logger.debug("==============cardsdata========2======",cardsData)
                }
                sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);        
        
            }else{
        
                let finalData = {"data":[]}
                sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);        
        
            }   
        }        
        //// list card
        else if((params.gateway_unique_id) == config.get("payment.urway.unique_id")){
            logger.debug("===========dbname===fadsfafds====",req.dbName);

            let   cardsData= await ExecuteQ.Query(req.dbName,"select DISTINCT card_payment_id, id,user_id,customer_payment_id,is_default,is_deleted, card_type,cvc, card_source, card_number, exp_month, exp_year,updated_at,created_at from user_cards where user_id=? and is_deleted=0 and card_source=?",[req.users.id,0,config.get("payment.urway.unique_id")]);
            console.log("=======urway==cardsDetailsFromDb =========",  cardsData)
         
            if(cardsData && cardsData.length>0){
                for (const [index, i] of cardsData.entries()) {
                i.token = i.card_payment_id
                }
               
            }
            cardsData = {data:cardsData}

            sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);
        }
        else if((params.gateway_unique_id) == "paymaya"){
            cardsData = await ExecuteQ.Query(req.dbName,"select * from user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,"paymaya"]);
            if(cardsData && cardsData.length>0){
                for (const [index, i] of cardsData.entries()) {
                i.token = i.card_id
                }
               
            }
            cardsData = {data:cardsData}
            sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);

}
else if((params.gateway_unique_id) == "clover"){
    cardsData = await ExecuteQ.Query(req.dbName,"select * from user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,"clover"]);
    if(cardsData && cardsData.length>0){
        for (const [index, i] of cardsData.entries()) {
        i.token = i.card_id
        }
       
    }
    cardsData = {data:cardsData}
    sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);

}
//// list card for paystack payment gateway 
else if((params.gateway_unique_id) == config.get("payment.paystack.unique_id") && enable_paystack_card_save==1){
    logger.debug("===========dbname===fadsfafds====",req.dbName);
    cardsData = await ExecuteQ.Query(req.dbName,"select * from user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,config.get("payment.paystack.unique_id")]);
    cardsData = {data:cardsData}
    sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);
}
        
        
        
        
    }
    catch (e) {
        console.log("=======Err!===",e)
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

const listAgentCards = async (req,res)=>{
    try{
       console.log(req.query)
       let cardsData;
       let params = req.query;
       var userData=await  Universal.getAgentData(req.dbName,req.headers.authorization);
       if((params.gateway_unique_id) == config.get("payment.strip.unique_id")) {
        let strip_secret_key_data = await Universal.getStripSecretKey(req.dbName);
        if(params.customer_payment_id==null || params.customer_payment_id==undefined){
            cardsData = {}
        }else{
            cardsData = await getStripeUserCards(strip_secret_key_data[0].value,params.customer_payment_id);
        }
       }else if((params.gateway_unique_id) == config.get("payment.conekta.unique_id")){
        cardsData = await getConektaUserCards(params.customer_payment_id);
       }else if((params.gateway_unique_id) == config.get("payment.squareup.unique_id")){
        let squareData=await Universal.getSquareupSecretKey(req.dbName);
        if(params.customer_payment_id==null || params.customer_payment_id==undefined){
            cardsData = {}
        }else{
            cardsData = await getSquareupUserCards(squareData,req.dbName, params.customer_payment_id);

        }
       }
      else if((params.gateway_unique_id) == config.get("payment.cybersource.unique_id")){
            let cyberData=Universal.getCyberSourceData(req.dbName);

            //cardsData = await ExecuteQ.Query(req.dbName,"select * from cbl_user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,config.get("payment.cybersource.unique_id")]);
            let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            cardsData = await ExecuteQ.QueryAgent(agentConnection,"select * from cbl_user_cards where user_id=? and is_deleted=? and card_source=?",[userData[0].id,0,config.get("payment.cybersource.unique_id")]);
        }
        else if((params.gateway_unique_id) == config.get("payment.peach.unique_id")){

            //cardsData = await ExecuteQ.Query(req.dbName,"select * from cbl_user_cards where user_id=? and is_deleted=? and card_source=?",[req.users.id,0,config.get("payment.peach.unique_id")]);

            let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
            let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
            cardsData = await ExecuteQ.QueryAgent(agentConnection,"select * from cbl_user_cards where user_id=? and is_deleted=? and card_source=?",[userData[0].id,0,config.get("payment.peach.unique_id")]);
            cardsData = {data:cardsData}
        }
        sendResponse.sendSuccessData(cardsData, constant.responseMessage.SUCCESS, res, 200);

    }
    catch (e) {
        logger.debug("=======Err!===",e)
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}
const getCyberSourceData=(cyberData)=>{
        logger.debug("==cyberSourceData")
        var cybersourceRestApi = require('cybersource-rest-client');
        var instance = new cybersourceRestApi.InstrumentIdentifierApi({
            'authenticationType':process.env.NODE_ENV == 'prod'? 'https_signature':'http_signature',
            'runEnvironment':process.env.NODE_ENV == 'prod'? 'cybersource.environment.production':'cybersource.environment.SANDBOX',
            // 'merchantID':cyberSourceData.cybersource_merchant_id,
            // 'merchantKeyId': cyberSourceData.cybersource_merchant_key_id,
            // 'merchantsecretKey': cyberSourceData.cybersource_merchant_secret_key
            'merchantID':'testrest',
            'merchantKeyId': '08c94330-f618-42a3-b09d-e1e43be5efda',
            'merchantsecretKey': 'yBJxy6LjM2TmcPGu+GaJrHtkke25fPpUX+UY6/L/1tE='
        });
       

		var body = new cybersourceRestApi.CreateInstrumentIdentifierRequest();
		
		var profileId = '93B32398-AD51-4CC2-A682-EA3E93614EB1';
        return new Promise((resolve,reject)=>{

        console.log('\n*************** Create Instrument Identifier ********************* ');
        
		instance.createInstrumentIdentifier(profileId, body, function (error, data, response) {
            logger.debug("==ERR!===",error,data)
			if (error) {
                reject(error)
				console.log('\nError in create instrument identifier : ' + JSON.stringify(error));
			}
			else{
                // logger.debug("========DATA!==",data)
                resolve(data)
            }
        });
    })

    
}

const UpdateCard = async(req,res)=>{
    try{
        logger.debug(req.body)        
        let params = req.body;
        
        if((params.gateway_unique_id) == config.get("payment.strip.unique_id")) {
            let strip_secret_key_data = await Universal.getStripSecretKey(req.dbName);
            await updateStripeCard(strip_secret_key_data[0].value,params.customer_payment_id,params.card_id,params.exp_month,params.exp_year)
        }
        if((params.gateway_unique_id) == config.get("payment.payuLatam.unique_id")) {
            let payuLatam_api_key_data = await Universal.getpayuLatamApiKey(req.dbName);
            let payuLatam_api_loginkey_data = await Universal.getpayuLatamApiLoginkey(req.dbName);
           let updatedCustomerCardResponse = await updatepayuLatamCustomerCard(params,  payuLatam_api_loginkey_data[0].value, payuLatam_api_key_data[0].value);
         console.log("*********updatedCustomerCardResponse"  , updatedCustomerCardResponse);
           if(updatedCustomerCardResponse){
            params.card_no  = updatedCustomerCardResponse.number;
              await  updatepayuLatamCardInDB(req.dbName ,params);
            }

        }
        else if((params.gateway_unique_id) == config.get("payment.conekta.unique_id")){
            await updateConektaCard(params.customer_payment_id,params.card_id,params.exp_month,params.exp_year,req.dbName)
        }
        // else if((params.gateway_unique_id) == config.get("payment.cybersource.unique_id")){
        //     await updateConektaCard(params.customer_payment_id,params.card_id,params.exp_month,params.exp_year,req.dbName)
        // }
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }catch(e){
        logger.debug("=======Err!===",e)
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

// const updateCyberSource=(customer_payment_id,card_id,exp_month,exp_year,dbName)=>{



    const deleteStripeCard3d = (stripe_secret_key,customer_payment_id,card_id)=>{
        return new Promise((resolve,reject)=>{
            const stripe = require('stripe')(stripe_secret_key);
    
            stripe.paymentMethods.detach(
              //  customer_payment_id,
                card_id,
              function(err, card) {
                // asynchronously called
                if (err) {
                    reject(err)
                } else {
                    resolve(card)
                }
              }
            ); 
        })    
    }
// }


const deleteCloverCardFromDb = (dbName,cardId)=>{
    return new Promise(async(resolve,reject)=>{
        let stmt = "update user_cards set is_deleted=1 where id=?"
        let params = [cardId];
        let result = await ExecuteQ.Query(dbName,stmt,params)
        resolve();
    })    
}

const deleteFromClover = async (dbName,cardId,customerId,basic_auth)=>{

    let header = {
        Authorization: `Bearer ${basic_auth}`,
        'Content-Type' : `application/json`
        };  
        
    let Obj ={   
     };
    
     let baseURL =      (process.env.NODE_ENV == 'prod') ?          `https://scl.clover.com/v1/customers/${customerId}/sources/${cardId}`    :   `https://scl-sandbox.dev.clover.com/v1/customers/${customerId}/sources/${cardId}`;     
         console.log("=clover baseURL====>>",baseURL)
    
     let  options = {
        method: 'DELETE',
        url: baseURL,
        body: Obj,
        headers: header,
        json: true };
        
        let result = await requestApi(options);
        return result;
}


const deleteCard = async(req,res)=>{
    try{

        logger.debug(req.body)        
        let params = req.body
        let squareData=await Universal.getSquareupSecretKey(req.dbName);

        let stripe_3d_on=await Execute.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["stripe_3d_on"]);
        let enableStripe = 0;
     if(stripe_3d_on && stripe_3d_on.length>0&&stripe_3d_on[0].value==1){
         enableStripe= 1;
     }
     /**
    * ------------add new for paystack card save amit ----\\
    */
    let paystack_card_save=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["paystack_card_save"]);
    console.log("paystack_card_save>>>>>>>>>>deleteCard>>>>>>>",paystack_card_save)
    let enable_paystack_card_save = 0;
    if(paystack_card_save && paystack_card_save.length>0&&paystack_card_save[0].value==1){
        enable_paystack_card_save= 1;
    }
    //----------------end---------------\\

        if(((params.gateway_unique_id) == config.get("payment.strip.unique_id")) && enableStripe==1) {
            let strip_secret_key_data = await Universal.getStripSecretKey(req.dbName) ;
            await deleteStripeCard3d(strip_secret_key_data[0].value,params.customer_payment_id,params.card_id)
            await deleteCardFromDb(req.dbName,params.card_id);
        }
        else if((params.gateway_unique_id) == config.get("payment.strip.unique_id")) {
            let strip_secret_key_data = await Universal.getStripSecretKey(req.dbName) ;
            await deleteStripeCard(strip_secret_key_data[0].value,params.customer_payment_id,params.card_id)
            await deleteCardFromDb(req.dbName,params.card_id);
        }
        else if((params.gateway_unique_id) == config.get("payment.payuLatam.unique_id")) {
               	 
	       let checkCardExists =await   checkUserCardsExists(req.dbName, params.card_id, params.gateway_unique_id);

	         if(checkCardExists == null || undefined|| ""){
                 let msg ="Please check cust_payment_id and card_id";
                return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);

	         }

            let payuLatam_api_key_data = await Universal.getpayuLatamApiKey(req.dbName);
            let payuLatam_api_loginkey_data = await Universal.getpayuLatamApiLoginkey(req.dbName);

            await removePayuLatamCustomerCard(payuLatam_api_loginkey_data[0].value, payuLatam_api_key_data[0].value, params.customer_payment_id, params.card_id);
            await deleteCardFromDb(req.dbName, params.card_id);
        }
        else if((params.gateway_unique_id) == config.get("payment.conekta.unique_id")){
            await deleteConektaCard(params.customer_payment_id,params.card_id,req.dbName);
            await deleteCardFromDb(req.dbName,params.card_id);
        }else if((params.gateway_unique_id) == config.get("payment.squareup.unique_id")){
            await deleteSquareupCard(squareData,params.customer_payment_id,params.card_id);
            await deleteCardFromDb(req.dbName,params.card_id);  
        }

        else if((params.gateway_unique_id) == config.get("payment.cybersource.unique_id")){
            let cyberData=Universal.getCyberSourceData(req.dbName);
            await deleteFromCyberSource(cyberData,params.customer_payment_id);
            await deleteCardFromDb(req.dbName,params.card_id);  
        }else if((params.gateway_unique_id) == config.get("payment.authorize_net.unique_id")){
            let userDetail = await ExecuteQ.Query(req.dbName,
                "select authnet_profile_id from user where id=?",[req.users.id]);
                await deleteAuthorizeNetCard(userDetail[0].authnet_profile_id,
                    params.card_id,req.dbName,res)
            await deleteAuthNetCardFromDb(req.dbName,params.card_id)
        }
        else if((params.gateway_unique_id) == config.get("payment.paymaya.unique_id")){
            let getPaymayaKeys = await getPayMayaKeys(req.dbName);
            await deleteFromPaymaya(req.dbName,params.card_id,params.customer_payment_id,getPaymayaKeys.basic_auth);
            console.log(deleteFromPaymaya);
            await deletePaymayaCardFromDb(req.dbName,params.card_id);  
        }
        else if((params.gateway_unique_id) == config.get("payment.authorize_net.unique_id")){
            let userDetail = await ExecuteQ.Query(req.dbName,
                "select authnet_profile_id from user where id=?",[req.users.id]);
                await deleteAuthorizeNetCard(userDetail[0].authnet_profile_id,
                    params.card_id,req.dbName,res)
            await deleteAuthNetCardFromDb(req.dbName,params.card_id)
        }else if((params.gateway_unique_id) == "firstatlanticcommerce"){
            await deleteUrWayCardFromDb(req.dbName,params.card_id)
        }
        else if((params.gateway_unique_id) == config.get("payment.urway.unique_id")){
            await deleteUrWayCardFromDb(req.dbName,params.card_id)
        }
        else if((params.gateway_unique_id) == "paymaya"){
            let getPaymayaKeys = await Universal.getPayMayaKeys(req.dbName);
            await deleteFromPaymaya(req.dbName,params.card_id,params.customer_payment_id,getPaymayaKeys.paymaya_basic_auth);
            console.log(deleteFromPaymaya);
            await deletePaymayaCardFromDb(req.dbName,params.card_id);  
        }

        else if((params.gateway_unique_id) == config.get("payment.clover.unique_id")){

            await deleteFromClover(req.dbName,params.card_id,params.customer_payment_id,config.get("payment.clover.secret_token"));

            console.log(deleteFromPaymaya);
            await deleteCloverCardFromDb(req.dbName,params.card_id);  

            

        }
        else if((params.gateway_unique_id) == config.get("payment.peach.unique_id")){
             let peach_secret_key_data=await Universal.getPeachSecretKey(req.dbName);
             await deletePeachCards(req.dbName,peach_secret_key_data,params.customer_payment_id)
             await deleteCloverCardFromDb(req.dbName,params.card_id);  
        }
        //delete paystack card
        else if(params.gateway_unique_id === config.get("payment.paystack.unique_id") && enable_paystack_card_save=="1"){
            await deleteUrWayCardFromDb(req.dbName,params.card_id)
        }

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }catch(e){
        console.log("=======Err!===",e)
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

const deletePeachCards= (dbName,peach_secret_key_data,customerid)=>{

    return new Promise((resolve,reject)=>{
        
        let url = 'https://test.oppwa.com/v1/registrations/'+customerid+'?"entityId='+peach_secret_key_data[config.get("payment.peach.peach_entityid")]+'';
        let headers= {
            'Content-Type': 'application/x-www-form-urlencoded',
            //'Authorization':'Bearer OGFjN2E0Yzk3MTEyOWYyMjAxNzExNjI2YWYxYjA4N2J8SlpSeFljNnRtbg=='
            'Authorization':'Bearer '+peach_secret_key_data[config.get("payment.peach.peach_auth_token")]
        };
        
        var options = {
            method: 'DELETE',
            url: url,
            headers:headers,
            json: true 
        };

        web_request(options, async function (error, response, body) {
            console.log(error,"########################################",JSON.stringify(body));
                resolve(body)                
            
        });
    })
}


const deletePaymayaCardFromDb = (dbName,cardId)=>{
    return new Promise(async(resolve,reject)=>{
        let stmt = "update user_cards set is_deleted=1 where id=?"
        let params = [cardId];
        let result = await ExecuteQ.Query(dbName,stmt,params)
        resolve();
    })    
}

const deleteFromPaymaya = async (dbName,paymentTokenId,customerId,basic_auth)=>{

    let header = {
        Authorization: `Basic ${basic_auth}`,
        'Content-Type' : `application/json`
        };
        
    let Obj ={   
     };
    
     let baseURL = (process.env.NODE_ENV == 'prod') ? 'https://pg.paymaya.com' : 'https://pg-sandbox.paymaya.com';     
         console.log("==paymaya==baseURL====>>",baseURL)
    
     let  options = {
        method: 'DELETE',
        url: `${baseURL}/payments/v1/customers/${customerId}/cards/${paymentTokenId}`,
        body: Obj,
        headers: header,
        json: true };
        
        let result = await requestApi(options);
        return result;
    

}




const deleteAuthorizeNetCard = (authnet_profile_id,authnet_payment_profile_id,dbName,res       
    )=>{
    return new Promise(async(resolve,reject)=>{
        let authorize_net_key_data = await Universal.getAuthorizeNetKeys(dbName)

        if( Object.keys(authorize_net_key_data).length>0){

            let base_url = process.env.NODE_ENV == 'prod'?'https://api.authorize.net/xml/v1/request.api':'https://apitest.authorize.net/xml/v1/request.api'
            
            let body = {
                "getCustomerPaymentProfileRequest": {
                    "merchantAuthentication": {
                        "name": authorize_net_key_data[config.get("payment.authorize_net.api_login_id")],
                        "transactionKey": authorize_net_key_data[config.get("payment.authorize_net.transaction_key")]
                    },
                    "customerProfileId": authnet_profile_id,
                    "customerPaymentProfileId":authnet_payment_profile_id
                }
            }
            var options = {
                'method': 'POST',
                'url':base_url,
                // 'headers': {
                //     'Content-Type': 'application/json'
                // },
                body:body,
                json:true
            };
            web_request(options, async function (error,response, body) {
                logger.debug("===authorize.net====",error)
                if(error){
                    reject(error);
                }
                else{
                    let result = body.trim();
                    result = JSON.parse(result)
                    logger.debug(result)
                    if(result.messages.resultCode=="Error"){
                        let errorMsg = result.messages.message[0].text
                        sendResponse.sendErrorMessage(errorMsg,res,400);
                    }else if(result.messages.resultCode=="Ok"){
                        resolve(result.paymentProfile.payment.creditCard)
                    }else{
                        let errorMsg = "Something went wrong while deleting the card"
                        sendResponse.sendErrorMessage(errorMsg,res,400);
                    }
                }
            });

        }
        else{
            let errorMsg ="authorize.net gateway keys not added";
            sendResponse.sendErrorMessage(errorMsg,res,400);
        }
    })    
}


const deleteAuthNetCardFromDb = (dbName,authnet_payment_profile_id)=>{
    return new Promise(async(resolve,reject)=>{
        let stmt = "update user_cards set is_deleted=1 where authnet_payment_profile_id=?"
        let params = [authnet_payment_profile_id];
        let result = await ExecuteQ.Query(dbName,stmt,params)
        resolve();
    })    
}

const deleteUrWayCardFromDb = (dbName,cardId)=>{
    return new Promise(async(resolve,reject)=>{
        let stmt = "update user_cards set is_deleted=1 where id=?"
        let params = [cardId];
        let result = await ExecuteQ.Query(dbName,stmt,params)
        resolve();
    })    
}




const deleteFromCyberSource=(cyberData,tokenId)=>{
    return new Promise((resolve,reject)=>{
        var cybersourceRestApi = require('cybersource-rest-client');
        var instance = new cybersourceRestApi.InstrumentIdentifierApi({
            'authenticationType':process.env.NODE_ENV == 'prod'? 'https_signature':'http_signature',
            'runEnvironment':process.env.NODE_ENV == 'prod'? 'cybersource.environment.production':'cybersource.environment.SANDBOX',
            // 'merchantID':cyberSourceData.cybersource_merchant_id,
            // 'merchantKeyId': cyberSourceData.cybersource_merchant_key_id,
            // 'merchantsecretKey': cyberSourceData.cybersource_merchant_secret_key
            'merchantID':'testrest',
            'merchantKeyId': '08c94330-f618-42a3-b09d-e1e43be5efda',
            'merchantsecretKey': 'yBJxy6LjM2TmcPGu+GaJrHtkke25fPpUX+UY6/L/1tE='
        });

        var profileId = '93B32398-AD51-4CC2-A682-EA3E93614EB1';

        instance.deleteInstrumentIdentifier(profileId, tokenId, function (error, data, response) {
            if (error) {
                reject(error)
                console.log('\nError in Delete instrument identifier : ' + JSON.stringify(error));
            }
            else{
                resolve()
            }
        });

    });  
}


const deleteStripeCard = (stripe_secret_key,customer_payment_id,card_id)=>{
    return new Promise((resolve,reject)=>{
        const stripe = require('stripe')(stripe_secret_key);

        stripe.customers.deleteSource(
            customer_payment_id,
            card_id,
          function(err, card) {
            // asynchronously called
            if (err) {
                reject(err)
            } else {
                resolve(card)
            }
          }
        ); 
    })    
}

const deleteCardFromDb = (dbName,card_id)=>{
    return new Promise(async(resolve,reject)=>{
        let stmt = "update user_cards set is_deleted=1 where card_id=?"
        let params = [card_id];
        let result = await ExecuteQ.Query(dbName,stmt,params)
        resolve();
    })    
}


const deleteConektaCard = (customer_payment_id, card_id,dbName) => {
    return new Promise(async(resolve, reject) => {
        let conekta_data=await Universal.getConektaSecretKey(dbName);
        let conekta = require('conekta');
        conekta.api_key = conekta_data[0].value;
        conekta.locale = 'es';
        
        conekta.Customer.find(customer_payment_id, function(err, customer) {
            // console.log("==========customer===========",customer.toObject().payment_sources.data)
            let cards = customer.toObject().payment_sources.data
            
            let card_index = cards.map((e)=>{ return e.id }).indexOf(card_id)
            console.log("========cardindex===",card_index)
          
            customer.payment_sources.get(card_index).update({ exp_month: 02 },
            function(err, paymentSource) {
              console.log("=======++++++===========",paymentSource,err);
              if(err){
                  reject(err)
              }else{
                  resolve(paymentSource)
              }
            });
          });
          
    })
}

const updateStripeCard = (stripe_secret_key,customer_payment_id,card_id,exp_month,exp_year)=>{
    return new Promise((resolve,reject)=>{
        const stripe = require('stripe')(stripe_secret_key);

        stripe.customers.updateSource(
            customer_payment_id,
            card_id,
          {
              exp_month : exp_month,
              exp_year : exp_year
          },
          function(err, card) {
            // asynchronously called
            if (err) {
                reject(err)
            } else {
                resolve(card)
            }
          }
        ); 
    })    
}

const updateConektaCard = (customer_payment_id,card_id,exp_month,exp_year,dbName)=>{
    return new Promise(async(resolve,reject)=>{
        let conekta_data=await Universal.getConektaSecretKey(dbName);
        let conekta = require('conekta');
        conekta.api_key = conekta_data[0].value;
        conekta.locale = 'es';
        conekta.Customer.find(customer_payment_id, function(err, customer) {
            console.log("==========customer===========",customer.toObject().payment_sources.data)
          let cards = customer.toObject().payment_sources.data
          
          let card_index = cards.map((e)=>{ return e.id }).indexOf(card_id)
          console.log("===card_index======",card_index)
          customer.payment_sources.get(card_index).update({ exp_month: exp_month,exp_year:exp_year },
            function(err, paymentSource) {
              console.log("=======++++++===========",paymentSource,err);
              if(err){
                  reject(err)
              }else{
                  resolve(paymentSource)
              }
            });
        });
        
    })    
}

const createStripeCard = (stripe_secret_key,customer_payment_id,card_source,
    card_number,exp_month,exp_year           
    )=>{
    return new Promise((resolve,reject)=>{
        const stripe = require('stripe')(stripe_secret_key);

        stripe.customers.createSource(
            customer_payment_id,
          {
            source: card_source
            // {
            //   object: card_source,
            //   number : card_number,
            //   exp_month : exp_month,
            //   exp_year:exp_year
            // },
        
          },
            function (err, card) {
                console.log("======stripe===Err==>>",err)
                // asynchronously called
                if (err) {
                    reject(err)
                } else {
                    resolve(card.id)
                }
            }
        );
    })    
}


const getAuthorizeNetCardDetails = (authnet_profile_id,authnet_payment_profile_id,dbName,res       
    )=>{
    return new Promise(async(resolve,reject)=>{
        let authorize_net_key_data = await Universal.getAuthorizeNetKeys(dbName)

        if( Object.keys(authorize_net_key_data).length>0){

            let base_url = process.env.NODE_ENV == 'prod'?'https://api.authorize.net/xml/v1/request.api':'https://apitest.authorize.net/xml/v1/request.api'
            
            let body = {
                "getCustomerPaymentProfileRequest": {
                    "merchantAuthentication": {
                        "name": authorize_net_key_data[config.get("payment.authorize_net.api_login_id")],
                        "transactionKey": authorize_net_key_data[config.get("payment.authorize_net.transaction_key")]
                    },
                    "customerProfileId": authnet_profile_id,
                    "customerPaymentProfileId":authnet_payment_profile_id,
                    "includeIssuerInfo": "true"
                }
            }
            var options = {
                'method': 'POST',
                'url':base_url,
                // 'headers': {
                //     'Content-Type': 'application/json'
                // },
                body:body,
                json:true
            };

            logger.debug("==========body------bosyd============",options)

            web_request(options, async function (error,response, body) {
                logger.debug("==========body------bosyd============",body)
                logger.debug("===authorize.net====",error)
                if(error){
                    reject(error);
                }
                else{
                    let result = body.trim();
                    result = JSON.parse(result)
                    logger.debug(result)
                    
                    if(result.messages.resultCode=="Error"){
                        let errorMsg = result.messages.message[0].text
                        sendResponse.sendErrorMessage(errorMsg,res,400);
                    }else if (result.messages.resultCode=="Ok"){
                        result.paymentProfile.payment.creditCard["authnet_payment_profile_id"]=authnet_payment_profile_id
                        result.paymentProfile.payment.creditCard["card_holder_name"]=result.paymentProfile.billTo.firstName
                        result.paymentProfile.payment.creditCard["authnet_profile_id"]=authnet_profile_id
                        resolve(result.paymentProfile.payment.creditCard)
                    }else{
                        let errorMsg = "something went wrong while getting cards"
                        sendResponse.sendErrorMessage(errorMsg,res,400);
                    }
                }
            });

        }
        else{
            let errorMsg ="authorize.net gateway keys not added";
            sendResponse.sendErrorMessage(errorMsg,res,400);
        }
    })    
}

const createConektaCard = (customer_payment_id,card_source,
    card_number,exp_month,exp_year           
    )=>{
    return new Promise(async(resolve,reject)=>{
        let conekta_data=await Universal.getConektaSecretKey(dbName);
        let conekta = require('conekta');
        conekta.api_key = conekta_data[0].value;
        conekta.locale = 'es';

        conekta.Customer.find(customer_payment_id, function(err, customer) {
            // console.log("+===================",err,customer.toObject().payment_sources);
            customer.createPaymentSource({
              type: card_source,
              token_id: card_number
            }, function(err, res) {
              console.log(res,err);
              if(err){
                  logger.debug(err)
                  reject(err)
              }else{
                  resolve(res.toObject())
              }
            });
          });
    })    
}


const createVenmoCard = (customer_payment_id,
    card_number           
    )=>{
    return new Promise(async(resolve,reject)=>{
        gateway.paymentMethod.create({
            customerId: customer_payment_id,
            paymentMethodNonce: card_number
          }, function (err, result) { 
              if(err){
                  reject(err)
              }else{
                  resolve(result.paymentMethod.globalId)
              }
          });
    })    
}

const saveCustomerId = (dbName,customer_payment_id,user_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "update user set customer_payment_id=? where id = ?"
        let params = [customer_payment_id,user_id]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)
    })
}

const saveAuthNetCustomerId= (dbName,authnet_profile_id,user_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "update user set authnet_profile_id=? where id = ?"
        let params = [authnet_profile_id,user_id]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)

    })
}

const saveAgentId = (dbName,customer_payment_id,user_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "update cbl_user set customer_payment_id=? where id = ?"
        let params = [customer_payment_id,user_id]
        
        let getAgentDbData=await common.GetAgentDbInformation(dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        var result = await ExecuteQ.QueryAgent(agentConnection,query,params);

        //let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)

    })
}



const addUserCards = (dbName,user_id,card_type,card_number,exp_month,exp_year,customer_payment_id,card_source,card_id,card_holder_name,card_signature)=>{
    return new Promise(async(resolve,reject)=>{
        let holderName=card_holder_name!=undefined && card_holder_name!=""?card_holder_name:""
       // let card_signature_value = card_signature!=undefined && card_signature!=""?card_signature:""
        let saveCardHolderName=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["save_card_holder_name","1"]);
        let query="";
        let params=[]
        // if(saveCardHolderName && saveCardHolderName.length>0){
        //  query = "insert into user_cards(card_holder_name,user_id,card_type,card_number,exp_month,exp_year,customer_payment_id,card_source,card_id)"
        // query += "values(?,?,?,?,?,?,?,?,?)"
        //  params = [holderName,user_id,card_type,card_number,exp_month,exp_year,customer_payment_id,card_source,card_id];
        // }
        // else{
             query = "insert into user_cards(user_id,card_type,card_number,exp_month,exp_year,customer_payment_id,card_source,card_id,card_signature)"
            query += "values(?,?,?,?,?,?,?,?,?)"
            params = [user_id,card_type,card_number,exp_month,exp_year,customer_payment_id,card_source,card_id,card_signature];
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)

    })
}

const getPaystackUserCard = (dbName,cardPaymentData,user_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select * from user_cards where `card_signature`=? and `is_deleted`=? and `user_id`=?"
        let params = [cardPaymentData.signature,0,user_id]

        let result = await ExecuteQ.Query(dbName,query,params)
        resolve(result)
    })
}



const addAgentCards = (dbName,user_id,card_type,card_number,exp_month,exp_year,customer_payment_id,card_source,card_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into cbl_user_cards(user_id,card_type,card_number,exp_month,exp_year,customer_payment_id,card_source,card_id)"
        query += "values(?,?,?,?,?,?,?,?)"
        let params = [user_id,card_type,card_number,exp_month,exp_year,customer_payment_id,card_source,card_id]

        let getAgentDbData=await common.GetAgentDbInformation(dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        var result = await ExecuteQ.QueryAgent(agentConnection,query,params);

        //let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)

    })
}

const checkUserCards = (dbName,user_id,card_source)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select * from user_cards where user_id=? and card_source=? and is_deleted=0";
        let params = [user_id,card_source]
        let result = await ExecuteQ.Query(dbName,query,params);
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
}
const checkUserCardsExists = (dbName, card_id, card_source)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select * from user_cards where card_id=? and card_source=?  and is_deleted=0";
        let params = [card_id,card_source]
        let result = await ExecuteQ.Query(dbName,query,params);
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
}
const checkAgentCards = (dbName,user_id,card_source)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select * from cbl_user_cards where user_id=? and card_source=? and is_deleted=0";
        let params = [user_id,card_source]

        let getAgentDbData=await common.GetAgentDbInformation(dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        var result = await ExecuteQ.QueryAgent(agentConnection,query,params);

        //let result = await ExecuteQ.Query(dbName,query,params);
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
}

const createStripeCustomer = (stripe_secret_key,email)=>{
    return new Promise(async(resolve,reject)=>{
        const stripe = require('stripe')(stripe_secret_key);

        stripe.customers.create(
            {
                description: 'Customer (created for API docs)',
                email : email
            },
            function (err, customer) {
                // asynchronously called
                if(err){
                    reject(err)
                }else{
                    resolve(customer.id)
                }
            }
        );
    })    
}



const createConektaCustomer = (userdata,token_id,type,dbName)=>{
    return new Promise(async(resolve,reject)=>{
        let conekta_data=await Universal.getConektaSecretKey(dbName);
        let conekta = require('conekta');
        conekta.api_key = conekta_data[0].value;
        conekta.locale = 'es';
        conekta.Customer.create({
            name: userData[0].name,
            email: userData[0].email,
            phone: userData[0].mobile_no,
            payment_sources: [{
              token_id: token_id,
              type: type // 'card'
            }],
            shipping_contacts: [{
              phone: userData[0].mobile_no,
              receiver:  userData[0].name,
              address: {
                street1: userData[0].customer_address,
                country: userData[0].customer_address,
                postal_code: "78215"
              }
            }]
        }, function(err, customer) {
            console.log(customer.toObject());
            if(err){
                reject(err)
            }else{
                resolve(customer.toObject());
            }
        });
        
    })    
}

const createVenmoCustomer = (userData,token_id,gateway)=>{
    return new Promise(async(resolve,reject)=>{
        gateway.customer.create({
            firstName: userData[0].name,
            email: userData[0].email,
            paymentMethodNonce: token_id //
          }, function (err, result) {
            console.log("===========result err==========",err,result)
            if(result.success){
                resolve(result)
            }else{
                reject(err)
            }
          });
    })    
}

const getStripeUserCards = (stripe_secret_key,customer_payment_id) => {
    return new Promise((resolve, reject) => {
        var stripe = require('stripe')(stripe_secret_key);

        stripe.customers.listSources(
            customer_payment_id,
            function (err, cards) {
                // asynchronously called
                if (err) {
                    console.log("=======Er==>",err);
                    if(err.raw && err.raw.message.includes('No such customer')){
                        resolve([])
                    }else{
                        reject(err)
                    }
                } else {

                    for(let i =0;i<cards.data.length;i++){
   
                        cards.data[i].customer_payment_id = cards.data[i].customer
                    
                    
                      }


                    resolve(cards)
                }
            }
        );
    })
}

const getPayuLatamCardLists = async(payu_latam_api_login, payu_latam_api_key,  cust_payment_id)=>{	

    logger.debug("===cust_payment_id==", cust_payment_id);
    let baseURL = (process.env.NODE_ENV == 'prod') ? 'api.payulatam.com' : 'sandbox.api.payulatam.com';    
	let  options = {
		method: 'GET',
		url: `https://${payu_latam_api_login}:${payu_latam_api_key}@${baseURL}/payments-api/rest/v4.3/customers/${cust_payment_id}`,
		json: true };
	
		let result = await requestApi(options);
		return  result;
	
};


const getConektaUserCards = (customer_payment_id) => {
    return new Promise(async(resolve, reject) => {
        let conekta_data=await Universal.getConektaSecretKey(dbName);
        let conekta = require('conekta');
        conekta.api_key = conekta_data[0].value;
        conekta.locale = 'es';
        conekta.Customer.find(customer_payment_id  , function(err, customer) {
            console.log(err,customer)
            console.log("==========customer===========",customer.toObject().payment_sources.data)
            let cards = customer.toObject().payment_sources.data
            if(err){
                reject(err)
            }else{
                resolve(cards)
            }
        });
    })
}



/////////////////////////////////// get user detail /////////////////////////////////////////
const getuserDetails = (dbName,user_id,card_source)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select * from user where id=? and is_deleted=0";
        let result = await ExecuteQ.Query(dbName,query,user_id);
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
};
const getAgentDetails = (dbName,user_id,card_source)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "select * from cbl_user where id=? and is_deleted=0";
        let getAgentDbData=await common.GetAgentDbInformation(dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        let result = await ExecuteQ.QueryAgent(agentConnection,query,[user_id]);

        //let result = await ExecuteQ.Query(dbName,query,user_id);
        if(result && result.length>0){
            resolve(result)
        }else{
            resolve([])
        }
    })
};


/////////////////////////////////// createnNewSquareCustomer/////////////////////////////////////////
const createnNewSquareCustomer=  (squareData,userData)=>{
    logger.debug("===squareData==",squareData);
    return new Promise(async(resolve,reject)=>{
        var SquareConnect = require('square-connect');
        // Set Square Connect credentials and environment
        var defaultClient = SquareConnect.ApiClient.instance;
        // Configure OAuth2 access token for authorization: oauth2
        var oauth2 = defaultClient.authentications['oauth2'];
         oauth2.accessToken = squareData.square_token;
         defaultClient.basePath=process.env.NODE_ENV == 'prod'? 'https://connect.squareup.com':'https://connect.squareupsandbox.com'
                                
        let payment_object = {};
        const idempotency_key = crypto.randomBytes(22).toString('hex');
        var payments_api = new SquareConnect.CustomersApi();

         let body = {
            "idempotency_key": idempotency_key,
            "email_address": userData.email,
            "given_name": userData.firstname + userData.lastname
          }
      
          payments_api.createCustomer(body).then(function(data) {
              resolve(data.customer)
          }, function(error) {
            reject(error);
           
          });
       
    })
};

/////////////////////////////////// createnNewSquareCustomer/////////////////////////////////////////
const addSquareCardIntheExistingCustomer=  (squareData,params, customerId)=>{

    return new Promise(async(resolve,reject)=>{

        var SquareConnect = require('square-connect');
        // Set Square Connect credentials and environment
        var defaultClient = SquareConnect.ApiClient.instance;
        // Configure OAuth2 access token for authorization: oauth2
        var oauth2 = defaultClient.authentications['oauth2'];
         oauth2.accessToken = squareData.square_token;
        
        // Set 'basePath' to switch between sandbox env and production env
        // sandbox: https://connect.squareupsandbox.com
        // production: https://connect.squareup.com
        // defaultClient.basePath=process.env.NODE_ENV == 'prod'? 'https://connect.squareup.com':'https://connect.squareupsandbox.com'
       
        defaultClient.basePath='https://connect.squareup.com'
        logger.debug("====process.env.NODE_ENV===",process.env.NODE_ENV)
        
        const idempotency_key = crypto.randomBytes(22).toString('hex');
           
         let payments_api = new SquareConnect.CustomersApi();

         let body = {
            "card_nonce": params.card_nonce,
            "card_holder_name": params.card_holder_name,
          }
      
          payments_api.createCustomerCard(customerId,body).then(function(data) {
              resolve(data.card);
          }, function(error) {
              console.log("=====SQuare==Paymnt===Err========",error)
            reject(error);
           
          });
       
    })
};

const savesquareCustomerId = (dbName,squareup_cust_id,user_id)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "update user set squareup_cust_id=?, customer_payment_id=?  where id =?"
        let params = [squareup_cust_id,squareup_cust_id, user_id]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)

    })
}



const addSquareupuserCards = (dbName, user_id, last_4, exp_month, exp_year, customer_payment_id, card_source, card_id, card_brand)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_cards(user_id, card_number, exp_month, exp_year, customer_payment_id, card_source, card_id, card_brand)"
        query += "values(?,?,?,?,?,?,?,?)"
        let params = [user_id, last_4, exp_month, exp_year, customer_payment_id, card_source, card_id, card_brand]
        let result = await ExecuteQ.Query(dbName,query,params);
        resolve(result)

    })
}

const addSquareupAgentCards = (dbName, user_id, last_4, exp_month, exp_year, customer_payment_id, card_source, card_id, card_brand)=>{
    return new Promise(async(resolve,reject)=>{
        let query = "insert into user_cards(user_id, card_number, exp_month, exp_year, customer_payment_id, card_source, card_id, card_brand)"
        query += "values(?,?,?,?,?,?,?,?)"
        let params = [user_id, last_4, exp_month, exp_year, customer_payment_id, card_source, card_id, card_brand]
        //let result = await ExecuteQ.Query(dbName,query,params);

        let getAgentDbData=await common.GetAgentDbInformation(dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        var result = await ExecuteQ.QueryAgent(agentConnection,query,params);

        resolve(result)

    })
}

const getSquareupUserCards = (squareData,dbName,  customer_payment_id) => {
    logger.debug("==squareData=",squareData)
    return new Promise(async(resolve, reject) => {
         // length of idempotency_key should be less than 45
        var SquareConnect = require('square-connect');
        // Set Square Connect credentials and environment
        var defaultClient = SquareConnect.ApiClient.instance;
        // Configure OAuth2 access token for authorization: oauth2
        var oauth2 = defaultClient.authentications['oauth2'];
         oauth2.accessToken = squareData.square_token;
         // Set 'basePath' to switch between sandbox env and production env
         // sandbox: https://connect.squareupsandbox.com
         // production: https://connect.squareup.com
        
        let baseUrl=process.env.NODE_ENV == 'prod'? 'https://connect.squareup.com':'https://connect.squareupsandbox.com'
        //  defaultClient.basePath=process.env.NODE_ENV == 'prod'? 'https://connect.squareup.com':'https://connect.squareupsandbox.com'
        logger.debug("===process.env.NODE_ENV====>>>",process.env.NODE_ENV,baseUrl);
        defaultClient.basePath=baseUrl
        let payment_object = {};
        const idempotency_key = crypto.randomBytes(22).toString('hex');
        var payments_api = new SquareConnect.CustomersApi();
        payments_api.retrieveCustomer(customer_payment_id).then(function(data) {
                resolve (data.customer.cards);
            }, function(error) {
                console.error(error);
                reject (error)
            });
    })
}


const deleteSquareupCard = (squareData,customer_payment_id,card_id) => {
    return new Promise(async(resolve, reject) => {
        var SquareConnect = require('square-connect');
        // Set Square Connect credentials and environment
        var defaultClient = SquareConnect.ApiClient.instance;
        // Configure OAuth2 access token for authorization: oauth2
        var oauth2 = defaultClient.authentications['oauth2'];
         oauth2.accessToken = squareData.square_token;
         defaultClient.basePath=process.env.NODE_ENV == 'prod'? 'https://connect.squareup.com':'https://connect.squareupsandbox.com'
                                
        let payment_object = {};
        const idempotency_key = crypto.randomBytes(22).toString('hex');
        var payments_api = new SquareConnect.CustomersApi();

       payments_api.deleteCustomerCard(customer_payment_id, card_id).then(function(data) {
            resolve (data);
          }, function(error) {
            console.error(error);
            reject (error)
          });
    })
}
const getContextCyberSource=async (req,res)=>{
    try{
        logger.debug(req.body)        
        let params = req.body
        let cyberSourceData=await Universal.getCyberSourceData(req.dbName);
        logger.debug("=cyberSourceData===",cyberSourceData)
        if(Object.keys(cyberSourceData).length>0){
            try {
                // var cybersourceRestApi = require('cybersource-rest-client');

                // var instance = new cybersourceRestApi.PaymentsApi({
                //     'authenticationType':process.env.NODE_ENV == 'prod'? 'https_signature':'http_signature',
                //     'runEnvironment':process.env.NODE_ENV == 'prod'? 'cybersource.environment.production':'cybersource.environment.SANDBOX',
                //     'merchantID':"testrest",
                //     'merchantKeyId': "08c94330-f618-42a3-b09d-e1e43be5efda",
                //     'merchantsecretKey': "yBJxy6LjM2TmcPGu+GaJrHtkke25fPpUX+UY6/L/1tE="
                // });

                // var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
                // processingInformation.commerceIndicator = 'internet';
                // var aggregatorInformation = new cybersourceRestApi.Ptsv2paymentsAggregatorInformation();
                
                // var amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
                // amountDetails.totalAmount = "101.9"
                // amountDetails.currency = 'USD';
                // var orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
                // orderInformation.amountDetails = amountDetails;
                // // var billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
                // //     billTo.country = userData[0].customer_address;
                // //     billTo.firstName = userData[0].name;
                // //     billTo.lastName = userData[0].name
                // //     billTo.phoneNumber = userData[0].mobile_no
                // //     billTo.address1 = userData[0].address_line_2
                // //     billTo.locality = userData[0].customer_address;
                // //     billTo.email = userData[0].email;
                // //     billTo.address2 = userData[0].address_line_2;
                   
                // // orderInformation.billTo = billTo;
                // var paymentInformation = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
                // var card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard(); 
                // var customer = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCustomer(); 
                
                // // card.expirationYear = cardData[0].exp_year
                // card.number = "4111111111111111";
                // // card.expirationMonth = cardData[0].exp_month;
                // // card.securityCode = cardData[0].cvc;
                // customer.customerId="70100000000163223423431111"
                // // card.type = '001';
                // paymentInformation.card = card;
                // paymentInformation.customer=customer
                // var request = new cybersourceRestApi.CreatePaymentRequest();
                // // request.clientReferenceInformation = clientReferenceInformation;
                // request.processingInformation = processingInformation;
                // // request.aggregatorInformation = aggregatorInformation;
                // request.orderInformation = orderInformation;
                // request.paymentInformation = paymentInformation;
                // request.processingInformation.capture = true;
                // console.log('\n*************** Process Payment ********************* ');
        
                // instance.createPayment(request, function (error, data, response) {
                //     if (error) {

                //         console.log('\nError in process a payment : ' + JSON.stringify(error));
                //         return  sendResponse.sendErrorMessage(
                //             Universal.getMsgText(
                //           languageId,{service_type:0,dbName:request.dbName},config.get("error_msg.payment.error")),
                //           reply,400);
                //     }
                //     else {
                //         console.log('\nData of process a payment : ' + JSON.stringify(response['status']),JSON.stringify(response['id']))
                //         card_payment_id = JSON.stringify(response['id']);
                //         payment_status=1
                //         callback(null);
                //     }
                //     // console.log('\nResponse of process a payment : ' + JSON.stringify(response));
                //     // console.log('\nResponse Code of process a payment : ' + JSON.stringify(response['status']));
                //     // callback(error, data);
                // });
                
                var cybersourceRestApi = require('cybersource-rest-client');
                var instance = new cybersourceRestApi.KeyGenerationApi({
                    'authenticationType':process.env.NODE_ENV == 'prod'? 'https_signature':'http_signature',
                    'runEnvironment':process.env.NODE_ENV == 'prod'? 'cybersource.environment.production':'cybersource.environment.SANDBOX',
                    'merchantID':cyberSourceData.cybersource_merchant_id,
                    'merchantKeyId': cyberSourceData.cybersource_merchant_key_id,
                    'merchantsecretKey': cyberSourceData.cybersource_merchant_secret_key
                });
        
                var request = new cybersourceRestApi.GeneratePublicKeyRequest();
                request.encryptionType = 'None';
                // request.targetOrigin="https://api.royoapps.com"
        
                console.log('\n*************** Generate Key ********************* ');
                
                instance.generatePublicKey(request, function (error, data, response) {
                    if (error) {
                        console.log('Error : ' + error);
                        console.log('Error status code : ' + error.statusCode);
                    }
                    else if (data) {
                        console.log('Data : ' + JSON.stringify(data));
                    }
                    // console.log('Response : ' + JSON.stringify(response));
                    console.log('Response Code Of GenerateKey : ' + response['status']);
                    sendResponse.sendSuccessData(JSON.parse(response['text']), constant.responseMessage.SUCCESS, res, 200);
                });
            } catch (error) {
                logger.debug("===error==",error)
                let msg = "strip keys are not added"
                sendResponse.sendErrorMessage(msg,res,500)
            }
        }
        else{
            let msg = "strip keys are not added"
            sendResponse.sendErrorMessage(msg,res,500)
        }
        
    }catch(e){
        logger.debug("=======Err!===",e)
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}
const purchaseGift=async (request,res)=>{
    try{
        logger.debug("========EN==>>")
        let userData=await Universal.getUserData(request.dbName,request.headers.authorization);
        let dbName=request.dbName;
        let uniqueId=request.body.gateway_unique_id;
        let giftId=request.body.gift_id;
        let cardId=request.body.card_id;
        let customerPaymentId=request.body.customer_payment_id;
        let payment_token=request.body.payment_token;
        let currency=request.body.currency;
        let languageId=request.body.languageId;
        let quantity=request.body.quantity;
        let zone_offset=request.body.zone_offset || "+05:30";
        let curreentDateTime;
        let stockFlag=true;
        let giftData=await ExecuteQ.Query(dbName,`select gcm.name,gc.percentage_value,gc.image,(gc.quantity-gc.purchased_quantity) as left_quantity,gc.purchased_quantity,gc.quantity,gc.id,gc.price,gc.price_type,gc.from_date,
        gc.to_date,gc.deleted_by
        from gift_card gc left join gift_card_ml gcm on gcm.gift_card_id=gc.id and gcm.language_id=? where gc.id=? and gc.deleted_by=? `,[languageId,giftId,0])
        logger.debug("=====giftData=",giftData)
        if(giftData && giftData.length>0){
            let giftNetAmount=giftData[0].price*quantity;
            if(parseInt(giftData[0].left_quantity)>=parseInt(quantity)){
             let paymentData=await makePayment(dbName,payment_token
                ,customerPaymentId,cardId,userData,  
                languageId,uniqueId,currency,giftNetAmount);
                let purchaseData=await ExecuteQ.Query(dbName,`insert into user_gift_card (percentage_value,gift_name,gift_image,transaction_id,payment_source,user_id,gift_card_id,price,quantity) values(?,?,?,?,?,?,?,?,?)
                `,[giftData[0].percentage_value,giftData[0].name,giftData[0].image,paymentData.card_payment_id,paymentData.payment_source,request.users.id,giftData[0].id,giftNetAmount,quantity])
                await ExecuteQ.Query(dbName,`update gift_card set purchased_quantity=purchased_quantity+? where id=?`,[quantity,giftId])
                logger.debug("==>>",purchaseData);
                let userGiftCard=await ExecuteQ.Query(dbName,`select * from user_gift_card where id=?`,[purchaseData.insertId])
                let messageFlat=parseInt(giftData[0].price_type)==1?giftData[0].percentage_value+"% OFF":giftData[0].price+" Flat Off";
                // logger.debug("=messageFlat==",messageFlat);
                let logoData=await ExecuteQ.Query(dbName,"select `value`,`key` from tbl_setting where `key`=?",['logo_url']);
                let giftPurchaseTitleColor=await ExecuteQ.Query(dbName,"select `value`,`key` from tbl_setting where `key`=?",['gift_title_bg_color'])
                let logoUrl=logoData && logoData.length>0?logoData[0].value:"";
                logger.debug("===logoData====logoUrl==giftPurchaseTitleColor==>",logoData,logoUrl,giftPurchaseTitleColor);
                let inputData={
                    name:userData[0].name,
                    gift_name:giftData[0].name,
                    business_name:request.business_name,
                    messageFlat:messageFlat,    
                    logo_url:logoUrl,
                    titleBgColor:giftPurchaseTitleColor && giftPurchaseTitleColor.length>0?giftPurchaseTitleColor[0].value:"#ef6937"
                }
                let template=await Universal.getGiftPurchasedTemplate(languageId,inputData);
                logger.debug("===",template)
                // let set
                let smtpSqlSata=await Universal.smtpData(dbName);
                await func.sendEmailToUserByTemplate(smtpSqlSata,"Purchased New Gift", userData[0].email, template);
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            }
            else{
                let msg = "Gift out of stock !"
                sendResponse.sendErrorMessage(msg,res,400)
            }
        }
        else{
            let msg = "Gift not exist !"
            sendResponse.sendErrorMessage(msg,res,400)
        }
        
    }catch(Err){
        logger.debug("=======Err!===",Err);
        return sendResponse.sendErrorMessage(Err,res,400);
    }
}
const getPurchasedGift=async (req,res)=>{
    try{
        let limit=req.query.limit;
        let offset=req.query.offset;
        let userGiftCard=await ExecuteQ.Query(req.dbName,`select gc.price_type,gc.description,gc.price_type,ugc.id,ugc.price,ugc.quantity,
        ugc.gift_image,ugc.gift_name,ugc.is_used,ugc.percentage_value from user_gift_card ugc join gift_card gc on gc.id=ugc.gift_card_id where ugc.user_id=? limit ? offset ?`,[req.users.id,parseInt(limit),parseInt(offset)]);
        let totalCount=await ExecuteQ.Query(req.dbName,`select COUNT(*) as totalCount from user_gift_card where user_id=?`,[req.users.id]);
        sendResponse.sendSuccessData({giftData:userGiftCard,totalCount:totalCount[0].totalCount}, constant.responseMessage.SUCCESS, res, 200);
    }catch(Err){
        logger.debug("=======Err!===",Err);
        return sendResponse.sendErrorMessage(Err,res,400);
    }
}

const makePayment=async(dbName,payment_token,customer_payment_id,card_id,userData,languageId,unique_id,currency,giftNetAmount)=>{
    logger.debug("======")
   let card_payment_id="",payment_source="";
   /**
    * ------------add new for paystack card save amit ----\\
    */
    let paystack_card_save=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",["paystack_card_save"]);
    console.log("paystack_card_save>>>>>>>>>>makePayment>>>>>>>",paystack_card_save)
    let enable_paystack_card_save = 0;
    if(paystack_card_save && paystack_card_save.length>0&&paystack_card_save[0].value==1){
        enable_paystack_card_save= 1;
    }
    //----------------end---------------\\
    return new Promise(async (resolve,reject)=>{
        if((unique_id)==config.get("payment.strip.unique_id")){
            payment_source="stripe";
            logger.debug("+===========request.dbName============",dbName)
            let strip_secret_key_data=await Universal.getStripSecretKey(dbName);
            logger.debug("==card_id=customer_payment_id=STRIP=DATA==>>",card_id,customer_payment_id,strip_secret_key_data,0)
            if(strip_secret_key_data && strip_secret_key_data.length>0){
                const stripe = require('stripe')(strip_secret_key_data[0].value);
                let payment_object = {};
                if(customer_payment_id && customer_payment_id !=="" && card_id!==""){
                    payment_object = {
                        amount: parseFloat((giftNetAmount)*100),
                        currency: currency,
                        source: card_id,
                        customer:customer_payment_id,
                        capture:true,
                        description: '('+userData[0].email+') Gift Payment',
                    }
                }else{
                    payment_object = {
                        amount: Math.round(parseFloat((giftNetAmount)*100)),
                        currency: currency,
                        source: payment_token,
                        capture:true,
                        description: '('+userData[0].email+') Gift Payment',
                    }
                }
                stripe.charges.create(payment_object,async function(err, charge) {
                        logger.debug("==Payment===ERR!==>>",err);
                            if(err){
                                reject(
                                 await Universal.getMsgText(
                                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")));
                            }
                            else{
                                card_payment_id=charge.id
                                resolve({"card_payment_id":card_payment_id,"payment_source":payment_source})
                            }
                        }
                    );
            }
            else{
               reject(
                    await Universal.getMsgText(
                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")))
            }

        }
        else if((unique_id)==config.get("payment.conekta.unique_id")){
            let conekta_data=await Universal.getConektaSecretKey(dbName);
            let userData=await Universal.getUserData(dbName,request.headers.authorization);
            payment_source="conekta";
            logger.debug("=====conekta_data===USR==DAT!==>>>",0,conekta_data,userData)

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
                        "unit_price":Math.round(parseFloat((giftNetAmount)*100)),
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
                    }).then(function (result) {
                            logger.debug("JSON==Object==>",result.toObject());
                            card_payment_id=result.toObject().id;
                            payment_status=1
                            callback(null)
                    }, async function (error) {
                        logger.debug("=======ERR!=====",error);
                            return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                            languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                            reply,400);
                    })
            }
            else{
                return sendResponse.sendErrorMessage(
                   await Universal.getMsgText(
                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                    reply,400);
            }
        }
        else if((unique_id)==config.get("payment.razorpay.unique_id")){
            payment_source="razorpay";
            let razor_pay_data=await Universal.getRazorPayData(dbName);
            logger.debug("======razor_pay_data=net_amount====>>",razor_pay_data,0*100)
            if( Object.keys(razor_pay_data).length>0){
                web_request({
                    method: 'POST',
                    url: "https://"+razor_pay_data[config.get("payment.razorpay.publish_key")]+":"+razor_pay_data[config.get("payment.razorpay.secret_key")]+"@api.razorpay.com/v1/payments/"+payment_token+"/capture",
                    form: {
                        amount: (giftNetAmount)*100,
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
                                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                            reply,400);
                    }
                    else{
                        payment_status=1
                        callback(null)
                    }
                });

            }
            else{
                return sendResponse.sendErrorMessage(
                   await Universal.getMsgText(
                        languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                    reply,400);
            }

        }
        else if((unique_id)==config.get("payment.paystack.unique_id" && enable_paystack_card_save == 1)){
            payment_source="paystack";
            let paystack_secret_key_data=await Universal.getPaystackSecretKey(dbName);
            logger.debug("====STRIP=DATA==>>",paystack_secret_key_data,0)
            //added new one by amit
            let userData = await Universal.getUserData(dbName,req.headers.authorization)

            if(paystack_secret_key_data && paystack_secret_key_data.length>0){
                //this if-else condition made by amit for handling case when card already saved and card is not saved
                //card is already saved
                /**
                 * new add by amit
                 */
                if(payment_token === "" || payment_token === null || payment_token === undefined && customer_payment_id && customer_payment_id!==""){
                    let options = {
                        method: 'POST',
                        url: 'https://api.paystack.co/transaction/charge_authorization',
                        headers: {
                            Authorization: 'Bearer '+paystack_secret_key_data[0].value+'',
                            'content-type': 'application/json'
                        },
                        body:'{"email":"'+userData[0].email+'","amount":"'+Math.round(parseFloat((giftNetAmount)*100))+'","authorization_code" :"'+customer_payment_id+'"}'
                    };

                    web_request(options, function(err, response, body) {
                        logger.debug("====Err With AuthorizationCode!==",err)
                        if(err){
                            return sendResponse.sendErrorMessage(
                                Universal.getMsgText(
                                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                reply,400);
                        }else{
                            logger.debug("===BoDY===>>==",JSON.parse(body));
                            let verifyData=JSON.parse(body);
                            if(verifyData.data.status === "success"){
                                payment_status=1;
                                card_payment_id=verifyData.data.reference;
                                callback(null)
                            }else{
                                return sendResponse.sendErrorMessage(
                                    Universal.getMsgText(
                                        languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
                        }
                    })//---------------------------End--------------\\
                }else{
                    var options = {
                        method: 'GET',
                        url: 'https://api.paystack.co/transaction/verify/'+payment_token+'',
                        headers: {
                            Authorization: 'Bearer '+paystack_secret_key_data[0].value+''
                        }
                    };
                    web_request(options, async function (err, response, body) {
                        logger.debug("====Err!==",err)
                        if(err){
                            return sendResponse.sendErrorMessage(
                                Universal.getMsgText(
                                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                reply,400);
                        }
                        else{
                            logger.debug("===BoDY===>>==",JSON.parse(body));
                            let verifyData=JSON.parse(body);
                            if(verifyData.data.status=="success"){
                                /**
                                 * added new for save card by amit
                                 */
                                let paymentData = verifyData.data.authorization
                                let user_id   = await Universal.getUserId(req.headers.authorization,req.dbName) 
                                let card_type = paymentData && paymentData.card_type ? paymentData.card_type : ""
                                let card_number = paymentData && paymentData.last4 ? paymentData.last4 : ""
                                let exp_month   = paymentData && paymentData.exp_month  ? paymentData.exp_month  : ""
                                let exp_year    = paymentData && paymentData.exp_year  ? paymentData.exp_year : ""
                                let customer_payment_id = paymentData && paymentData.authorization_code ? paymentData.authorization_code : ""
                                let card_source    = paymentData && paymentData.card_source ? paymentData.card_source : payment_source
                                let card_id = ""
    
                                await addUserCards(req.dbName, user_id,card_type,
                                card_number, exp_month,
                                exp_year, customer_payment_id,
                                card_source,card_id);
                                /**
                                 * end
                                 */
                                payment_status=1;
                                card_payment_id=verifyData.data.reference;
                                callback(null)
                            }
                            else{
                                return sendResponse.sendErrorMessage(
                                    Universal.getMsgText(
                                        languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                    reply,400);
                            }
    
                        }
                    });
                }
            }
            else{
                return sendResponse.sendErrorMessage(
                    await Universal.getMsgText(
                        languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                    reply,400);
            }

        }
        else if((unique_id)==config.get("payment.paystack.unique_id")){
            payment_source="paystack";
            let paystack_secret_key_data=await Universal.getPaystackSecretKey(dbName);
            logger.debug("====STRIP=DATA==>>",paystack_secret_key_data,0)

            if(paystack_secret_key_data && paystack_secret_key_data.length>0){
                var options = {
                    method: 'GET',
                    url: 'https://api.paystack.co/transaction/verify/'+payment_token+'',
                    headers: {
                        Authorization: 'Bearer '+paystack_secret_key_data[0].value+''
                    }
                };
                web_request(options, function (err, response, body) {
                    logger.debug("====Err!==",err)
                    if(err){
                        return sendResponse.sendErrorMessage(
                            Universal.getMsgText(
                                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                            reply,400);
                    }
                    else{
                        logger.debug("===BoDY===>>==",JSON.parse(body));
                        let verifyData=JSON.parse(body);
                        if(verifyData.data.status=="success"){
                            payment_status=1;
                            card_payment_id=verifyData.data.reference;
                            callback(null)
                        }
                        else{
                            return sendResponse.sendErrorMessage(
                                Universal.getMsgText(
                                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                                reply,400);
                        }

                    }
                });

            }
            else{
                return sendResponse.sendErrorMessage(
                    await Universal.getMsgText(
                        languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")),
                    reply,400);
            }
        }
        else if((unique_id)==config.get("payment.paypal.unique_id")){
            payment_source="paypal";
            let paypal_api=process.env.NODE_ENV == 'prod'?'https://api.paypal.com':'https://api.sandbox.paypal.com'
            let paypal_data=await Universal.getPaypalData(dbName);
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
                        reject(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")))
                    }
                    else{
                        card_payment_id = payment_token;
                        resolve({"card_payment_id":card_payment_id,"payment_source":payment_source});
                       
                    }
                });

            }
            else{
              reject(
                    await Universal.getMsgText(
                        languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")))
            }
        }
        else if((unique_id)==config.get("payment.venmo.unique_id")){
            payment_source="venmo";
            let braintree_data=await Universal.getBraintreeData(dbName);
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
                    amount: (giftNetAmount),
                    paymentMethodNonce: payment_token,
                    options: {
                        submitForSettlement: true
                    },
                    deviceData: {}
                }, async function(err,result) {
                    if(err){
                        reject(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")))
                    }
                    else{
                        if (result.success) {
                            logger.debug("===braintree===response Id==>>>", result)
                            card_payment_id = result.transaction.id;
                            resolve({"card_payment_id":card_payment_id,"payment_source":payment_source})
                          
                        }
                        else{
                            reject(
                                await Universal.getMsgText(
                                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")))
                        }

                    }

                });
            }
            else{
                reject(
                    await Universal.getMsgText(
                        languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")))
            }
        }
        else if((unique_id)=="zelle"){
                logger.debug("===============zelle==========",zelle_receipt_url)
                if(zelle_receipt_url=="" || zelle_receipt_url==null){
                    logger.debug("=======node zelle url============",zelle_receipt_url)
                    reject()
                }else{
                    payment_source = "zelle"
                    resolve({"card_payment_id":"zelle","payment_source":payment_source})
                  
                }
        }
        else if((unique_id)==config.get("payment.squareup.unique_id")){
            payment_source="squareup";
            let squareData=await Universal.getSquareupSecretKey(dbName)
            const SquareConnect = require('square-connect');
            // Set Square Connect credentials and environment
            const defaultClient = SquareConnect.ApiClient.instance;
            // Configure OAuth2 access token for authorization: oauth2
            const oauth2 = defaultClient.authentications['oauth2'];
            oauth2.accessToken = SquareConnect.square_token;
            // Set 'basePath' to switch between sandbox env and production env
            // sandbox: https://connect.squareupsandbox.com
            // production: https://connect.squareup.com
            defaultClient.basePath=process.env.NODE_ENV == 'prod'? 'https://connect.squareup.com':'https://connect.squareupsandbox.com'
           
                if(Object.keys(squareData).length>0){
                let payment_object = {};
                const idempotency_key = crypto.randomBytes(22).toString('hex');
                var apiInstance = new SquareConnect.LocationsApi();
                // you cand Add some Optional params acc. to the requirements in the PaymentObj
                //https://developer.squareup.com/reference/square/payments-api/create-payment/explorer
                if(customer_payment_id !=="" && card_id!==""){
                    payment_object = {
                        amount: Math.round(parseFloat((giftNetAmount)*100)),
                        currency: currency,
                        source: card_id,
                        customer:customer_payment_id,
                        note: 'Gift Payment',
                    }
                }else{
                    payment_object = {
                        source_id: payment_token,
                        amount_money: {
                          amount: Math.round(parseFloat((giftNetAmount)*100)),    // 100 Cent == $1.00 charge
                          currency: currency
                        },
                        idempotency_key: idempotency_key,
                        note: 'Gift Payment'

                      };
                    }

                    apiInstance.createPayment(payment_object).then(function(data) {
                        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                        card_payment_id = data.payment.id;
                        resolve({"card_payment_id":card_payment_id,"payment_source":payment_source})
                      }, async function(error) {
                        console.error(error);
                        reject(
                             await Universal.getMsgText(
                           languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")))
                      });
                    }
                    else{
                        reject(
                            await  Universal.getMsgText(
                              languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")))
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
                            amountDetails.totalAmount = giftNetAmount;
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
                    
                            instance.createPayment(cbrequest, async function (error, data, response) {
                                if (error) {

                                    console.log('\nError in process a payment : ' + JSON.stringify(error));
                                    reject(await 
                                        Universal.getMsgText(
                                      languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")))
                                }
                                else {
                                    logger.debug('\nData of process a payment : ' + JSON.stringify(response['status']),JSON.stringify(response['id']))
                                    card_payment_id = data.id;
                                    resolve({"card_payment_id":card_payment_id,"payment_source":payment_source})
                                }
                             
                            });
                        } catch (error) {
                            reject(await Universal.getMsgText(
                              languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")))
                        }
                    
                }
                else{
                   
                            reject(await  Universal.getMsgText(
                              languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way")))
                             
                }

                }
        else {
            reject(await Universal.getMsgText(
                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")))
        }
    })
}
const testTelnr=(req,res)=>{
    try{
            let xmlData=`<?xml version="1.0" encoding="UTF-8"?>
            <remote>
            <store>23451</store>
            <key>XZkZH@5MtcR-Nw8T</key>
            <tran>
            <type>capture</type>
            <description>Transaction description</description>
            <test>1</test>
            <currency>usd</currency>
            <amount>40</amount>
            </tran>
            <card>
            <number>4000 0000 0000 0002</number>
            <expiry>
            <month>02</month>
            <year>2029</year>
            </expiry>
            <cvv>123</cvv>
            </card>
            <billing>
            <name>
            <title>Title</title>
            <first>Forenames</first>
            <last>Surname</last>
            </name>
            <address>
            <line1>Street address – line 1</line1>
            <line2>Street address – line 2</line2>
            <line3>Street address – line 3</line3>
            <city>Chandigarh</city>
            <region>Region</region>
            <country>India</country>
            <zip>176023</zip>
            </address>
            <email>testi@gmail.com</email>
            </billing>
            </remote>`;
            request.post('https://secure.telr.com/gateway/remote.xml', {
                // request.post('https://ws2.chasepaymentech.com/PaymentechGateway', {
                // request.post('https://ws2.chasepaymentech.com/DigitalWalletService', {
                'body': xmlData
            },
            function (error, response, body) {
               
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
            })
         

       
    }catch(Err){
        return sendResponse.sendErrorMessage(Err,res,400);
    }
}
const getSaadedPaymentUrl=async (req,res)=>{
    try{
        let currentUtcDate=moment.utc().format("YYYY-MM-DD HH:mm:ss");
        logger.debug("=====curentUtc=input=>>",currentUtcDate,req.query);
        let email=req.query.email;
        let name=req.query.name;
        let amount=req.query.amount;
        let key_object={};
        let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? or `key`=? or `key`=? or `key`=?",
            [
            config.get("payment.sadded.sadded_vendor_id"),
            config.get("payment.sadded.sadded_branch_id"),
            config.get("payment.sadded.sadded_termianl_id"),
            config.get("payment.sadded.sadded_api_key")
        ])
        logger.debug("====SaDDed==keyData!==>>",keyData);

        if(keyData && keyData.length>0){
            for(const [index,i] of keyData.entries()){
                    key_object[i.key]=i.value;
            }
        }
        if(key_object && Object.keys(key_object).length>0 && Object.keys(key_object).length==4){
            let sAddedUrl = process.env.NODE_ENV == 'prod' ? 'https://eps-net.sadadbh.com' : 'https://eps-net-uat.sadadbh.com'
           
            let successPageUrl=req.query.success_url!=undefined && req.query.success_url!=""?req.query.success_url:config.get("payment.sadded.success_url")
            let failurePageUrl=req.query.failure_url!=undefined && req.query.failure_url!=""?req.query.failure_url:config.get("payment.sadded.cancel_url")
            logger.debug("==failurePageUrl==successPageUrl===sAddedUrl===>",failurePageUrl,successPageUrl,sAddedUrl)
            // var options = {
            //     "method": "POST",
            //     "url": "https://eps-net-uat.sadadbh.com/api/v2/web-ven-sdd/epayment/create",
            //     body: JSON.stringify({
            //     "Email":email,
            //     "Customer-name":name,
            //     "Vendor-id":337,
            //     "Date":currentUtcDate,
            //     "Branch-id":406,
            //     "Notification-mode":300,
            //     "Terminal-id":485,
            //     "Success-url":"https://api.royoapps.com/abc.html",
            //     "Error-url":"https://api.royoapps.com/error.html",
            //     "External-reference":"12233",
            //     "Amount":amount,
            //     "Api-key":"0b942a8f-2d44-4097-8b6d-af6a23bfdf58"})
            // };
            var options = {
                "method": "POST",
                "url": sAddedUrl+"/api/v2/web-ven-sdd/epayment/create",
                body: JSON.stringify(
                {
                "Email":email,
                "Customer-name":name,
                "Vendor-id":key_object[config.get("payment.sadded.sadded_vendor_id")],
                "Date":currentUtcDate,
                "Branch-id":key_object[config.get("payment.sadded.sadded_branch_id")],
                "Notification-mode":300,
                "Terminal-id":key_object[config.get("payment.sadded.sadded_termianl_id")],
                "Success-url":successPageUrl,
                "Error-url":failurePageUrl,
                "External-reference":email,
                "Amount":amount,
                "Api-key":key_object[config.get("payment.sadded.sadded_api_key")],
                }
            )
            };
            request(options, async function (error, response, body) {
                logger.debug("---Err---->>",error,body);
                if(error){
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                        reply,400);
                }
                else{
                    sendResponse.sendSuccessData(JSON.parse(body), constant.responseMessage.SUCCESS, res, 200);
                }
            })
        }
        else{
            let Err=await  Universal.getMsgText(
                languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
             return sendResponse.sendErrorMessage(Err,res,400);
        }
         
       
       
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}


const getTapPaymentUrl=async (req,res)=>{
    try{
        let currentUtcDate=moment.utc().format("YYYY-MM-DD HH:mm:ss");
        logger.debug("=====curentUtc=input=>>",currentUtcDate,req.query);
        let email=req.query.email;
        let name=req.query.name;
        let amount=req.query.amount;
        let phone = req.query.phone
        let country_code = req.query.country_code
        let currency = req.query.currency
        let transaction_id = randomstring.generate({
            length: 9,
            charset: 'numeric'
        });
        let order_id = randomstring.generate({
            length: 9,
            charset: 'numeric'
        });

        let tapKeys = await Universal.getTapKeys(req.dbName);
        let mercheckkey = tapKeys['tap_secret_key'];
        let marketplacekey = tapKeys['tap_secret_key_marketplace'];
        console.log("======tap keys====",tapKeys);
        if( tapKeys.hasOwnProperty('tap_secret_key') && 
        tapKeys.hasOwnProperty('tap_secret_key_marketplace')) {
            
            let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
            let tap_secret_key = mercheckkey; 
            let post_url=req.query.post_url
            let redirect_url=req.query.redirect_url

            logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)
            console.log("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)


            var options = { method: 'POST',
            url: tapUrl+"/v2/charges",
            headers: 
            { 'content-type': 'application/json',
                authorization: "Bearer "+ tap_secret_key },
            body: 
            {   amount: amount,
                currency: currency,
                threeDSecure: true,
                save_card: false,
                description: 'payment process for an order',
                statement_descriptor: 'payment process',
                metadata: { udf1: 'test 1', udf2: 'test 2' },
                reference: { transaction: transaction_id, order: order_id },
                receipt: { email: false, sms: true },
                customer: 
                {   first_name: name,
                    email: email,
                    phone: { country_code: country_code, number: phone } },
                source: { id: `src_card` },
                post: { url: post_url },
                redirect: { url: redirect_url } },
            json: true };
            logger.debug("===========options==++++",options)
            request(options, async function (error, response, body) {
                logger.debug("---Err---->>",error,body);
                if(error){
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            14,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.error")),
                        reply,400);
                }
                else{
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
                }
            })
        }
        else{
            let Err=await  Universal.getMsgText(
                14,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.no_gate_way"))
             return sendResponse.sendErrorMessage(Err,res,400);
        }
         
       
       
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        console.log("========er====",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

// const addTapCustomerAndCard = async (req,res)=>{
//     try{

//         let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
//             [
//             config.get("payment.tap.secret_key")
//         ])

//         let customer_profile_json = req.body.customer_profile_json
//         let card_token = req.body.card_token
//         let supplier_id = req.body.supplier_id
//         logger.debug("====SaDDed==keyData!==>>",keyData);

//         let tapKeys = await Universal.getTapKeys(req.dbName);
//         let mercheckkey = tapKeys['tap_secret_key'];
//         let marketplacekey = tapKeys['tap_secret_key_marketplace'];

//         if( tapKeys.hasOwnProperty('tap_secret_key') && 
//         tapKeys.hasOwnProperty('tap_secret_key_marketplace')) {

//             let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'


//             let customer_created_id = await Universal.createCustomerOnTap(customer_profile_json,tapUrl,mercheckkey);
    
//             let savedCardId = await Universal.saveCardOnTap(card_token,customer_created_id,tapUrl,mercheckkey);

//             let query = " update supplier set tap_customer_id=?, tap_saved_card_id=? where id=? ";

//             await ExecuteQ.Query(req.dbName,query,[customer_created_id,savedCardId,supplier_id]);

//             sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

//         }
//         else{
//             let Err=await  Universal.getMsgText(
//                 languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
//              return sendResponse.sendErrorMessage(Err,res,400);
//         }
//     }
//     catch(Err){
//         logger.debug("======ERR!!===>>",Err);
//         return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
//     }
// }



// const createTapBusinessProfile = async (req,res)=>{
//     try{
//         let currentUtcDate=moment.utc().format("YYYY-MM-DD HH:mm:ss");
//         logger.debug("=====curentUtc=input=>>",currentUtcDate,req.query);
//         let business_type=req.body.business_type;
//         let business_name=req.body.business_name;
//         let legal_name=req.body.legal_name;
//         let country=req.body.country;
//         let contact_person_first_name = req.body.contact_person_first_name
//         let contact_person_last_name = req.body.contact_person_last_name
//         let email=req.body.email;
//         let country_code=req.body.country_code;
//         let phone_number=req.body.phone_number;
//         let brand_name=req.body.brand_name;
//         let sector = req.body.sector;
//         let bank_account_number = req.body.bank_account_number
//         let supplier_id = req.body.supplier_id;
//         let is_licensed = req.body.is_licensed
//         let license_number = req.body.license_number
//         let key_object={};
//         let business_profile_json = req.body.business_profile_json;
//         let documents = req.body.documents

        

//         // if(!(documents && documents.length>0)){
//         //     return sendResponse.sendErrorMessage("no documents found",res,400);
//         // }

//        // let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
//         //     [
//         //     config.get("payment.tap.secret_key")
//         // ])
//         // logger.debug("====SaDDed==keyData!==>>",keyData);

//         let tapKeys = await Universal.getTapKeys(req.dbName);
//         let mercheckkey = tapKeys['tap_secret_key'];
//         let marketplacekey = tapKeys['tap_secret_key_marketplace'];

//         if( tapKeys.hasOwnProperty('tap_secret_key') && 
//         tapKeys.hasOwnProperty('tap_secret_key_marketplace')) {

//             let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
//             let tap_secret_key = marketplacekey 
//             let post_url=req.query.post_url
//             let redirect_url=req.query.redirect_url

//             logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)

//             var options = { method: 'POST',
//             url: tapUrl+"/v2/business",
//             headers: 
//             { 'content-type': 'application/json',
//                 authorization: "Bearer "+ tap_secret_key },

//             body : business_profile_json,
//             //  {
//             //     "name": {
//             //       "en": business_name
//             //     },
//             //     "type": business_type,
//             //     "entity": {
//             //       "legal_name": {
//             //         "en": legal_name
//             //       },
//             //       "is_licensed": is_licensed,
//             //       "license_number": license_number,
//             //       "not_for_profit": false,
//             //       "country": country,
//             //       "settlement_by": "Acquirer",
//             //       "documents": documents,
//             //       "bank_account": {
//             //         "iban" : bank_account_number
//             //       }
//             //     },
//             //     "contact_person": {
//             //       "name": {
//             //         "first": contact_person_first_name,
//             //         "last": contact_person_last_name
//             //       },
//             //       "contact_info": {
//             //         "primary": {
//             //           "email": email,
//             //           "phone": {
//             //             "country_code": country_code,
//             //             "number": phone_number
//             //           }
//             //         }
//             //       },
//             //       "is_authorized": true,
//             //     },
//             //     "brands": [
//             //       {
//             //         "name": {
//             //           "en": "flexwareTip"
//             //         },
//             //         "logo": "file_806767656371089408",
//             //         "content": {
//             //           "tag_line": {
//             //             "en": "Walk free",
//             //             "ar": "المشي الحرتروني",
//             //             "zh": "自由走"
//             //           },
//             //           "about": {
//             //             "en": "The Flexwares is a shoe store company selling awsome and long lasting shoes. Come and check out our products online. ",
//             //             "ar": "هذه هي شركة لبيع الأحذية تبيع أحذية رهيبة وطويلة الأمد. تعال وتحقق من منتجاتنا عبر الإنتر",
//             //             "zh": "这是一家鞋店公司，销售长久耐用的鞋子。快来在线查看我们的产品。"
//             //           }
//             //         }
//             //       }
//             //     ],
//             //     "post": {
//             //       "url": "http://flexwares.company/post_url"
//             //     },
//             //     "metadata": {
//             //       "mtd": "metadata"
//             //     }
//             //   }


//             // body:{
//             //         "name": {
//             //             "en": business_name
//             //         },
//             //         "type": business_type,
//             //         "entity": {
//             //             "legal_name": {
//             //             "en": legal_name
//             //             },
//             //             "country": country
//             //         },
//             //         "contact_person": {
//             //             "name": {
//             //             "first": contact_person_first_name,
//             //             "last": contact_person_last_name
//             //             },
//             //             "contact_info": {
//             //             "primary": {
//             //                 "email": email,
//             //                 "phone": {
//             //                 "country_code": country_code,
//             //                 "number": phone_number
//             //                 }
//             //             }
//             //             }
//             //         },
//             //         "brands": [
//             //             {
//             //             "name": {
//             //                 "en": brand_name
//             //             },
//             //             "sector": ["Sec 1","Sec 2"]
//             //             }
//             //         ]
//             // },
//             json: true };
//             logger.debug("===========options==++++",JSON.stringify(options));
//             request(options, async function (error, response, body) {
//                 logger.debug("---Err---->>",error,body);
//                 if(error){
//                     return sendResponse.sendErrorMessage(
//                         await Universal.getMsgText(
//                             languageId,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.error")),
//                         reply,400);
//                 }
//                 else{
//                     if(body && body.errors){
//                         logger.debug("==============errors=====",body)
//                         let msg = body.errors.error
//                         sendResponse.sendErrorMessage(msg,res,400);
//                       }else if (body && body.id){

//                         logger.debug("==============success=====",body)
//                         // if(req.path==="/supplier/tap/create_bussiness"){
//                         //     let tap_business_id = body.id;
//                         //     let tap_business_entity_id = body.entity.id;
//                         //     let query = "update supplier set tap_business_id=?,tap_business_entity_id=? WHERE id=?";
//                         //     let params = [tap_business_id,tap_business_entity_id,supplier_id]
//                         //     await ExecuteQ.Query(req.dbName,query,params);
//                         //     sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
    
//                         // }else if(req.path==="/admin/tap/create_bussiness"){
//                         //     let tap_business_id = body.id;
//                         //     let tap_business_entity_id = body.entity.id;
//                         //     let query = "update admin set tap_business_id=?,tap_business_entity_id=? limit";
//                         //     let params = [tap_business_id,tap_business_entity_id,supplier_id]
//                         //     await ExecuteQ.Query(req.dbName,query,params);
//                         //     sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
//                         // }{

//                             sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);

//                         // }
//                       }else{
//                           let msg = "some error occurred";
//                           sendResponse.sendErrorMessage(msg,res,400);78
//                       }
//                 }
//             })
//         }
//         else{

//             let Err="keys not added for tap";

//             return sendResponse.sendErrorMessage(Err,res,400);
//         }
         
       
       
//     }
//     catch(Err){
//         logger.debug("======ERR!!===>>",Err);
//         return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
//     }
// }


// const addCustmoerCard = async (req,res)=>{
//     try{
//         let currentUtcDate=moment.utc().format("YYYY-MM-DD HH:mm:ss");
//         logger.debug("=====curentUtc=input=>>",currentUtcDate,req.query);
//         let business_type=req.body.business_type;
//         let business_name=req.body.business_name;
//         let legal_name=req.body.legal_name;
//         let country=req.body.country;
//         let contact_person_first_name = req.body.contact_person_first_name
//         let contact_person_last_name = req.body.contact_person_last_name
//         let email=req.body.email;
//         let country_code=req.body.country_code;
//         let phone_number=req.body.phone_number;
//         let brand_name=req.body.brand_name;
//         let sector = req.body.sector;
//         let bank_account_number = req.body.bank_account_number
//         let supplier_id = req.body.supplier_id;
//         let is_licensed = req.body.is_licensed
//         let license_number = req.body.license_number
//         let key_object={};
//         let business_profile_json = req.body.business_profile_json;
//         let documents = req.body.documents

        

//         if(!(documents && documents.length>0)){
//             return sendResponse.sendErrorMessage("no documents found",res,400);
//         }

//         let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
//             [
//             config.get("payment.tap.secret_key")
//         ])
//         logger.debug("====SaDDed==keyData!==>>",keyData);

//         if(keyData && keyData.length>0){
//             let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
//             let tap_secret_key = keyData[0].value
//             let post_url=req.query.post_url
//             let redirect_url=req.query.redirect_url

//             logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)

//             var options = { method: 'POST',
//             url: tapUrl+"/v2/business",
//             headers: 
//             { 'content-type': 'application/json',
//                 authorization: "Bearer "+ tap_secret_key },

//             body : business_profile_json,
//             json: true };
//             logger.debug("===========options==++++",JSON.stringify(options));
//             request(options, async function (error, response, body) {
//                 logger.debug("---Err---->>",error,body);
//                 if(error){
//                     return sendResponse.sendErrorMessage(
//                         await Universal.getMsgText(
//                             languageId,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.error")),
//                         reply,400);
//                 }
//                 else{
//                     if(body && body.errors){
//                         logger.debug("==============errors=====",body)
//                         let msg = body.errors.error
//                         sendResponse.sendErrorMessage(msg,res,400);
//                       }else if (body && body.id){

//                         logger.debug("==============success=====",body)

//                             sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);

//                         // }
//                       }else{
//                           let msg = "some error occurred";
//                           sendResponse.sendErrorMessage(msg,res,400);78
//                       }
//                 }
//             })
//         }
//         else{

//             let Err="keys not added for tap";

//             return sendResponse.sendErrorMessage(Err,res,400);
//         }
         
       
       
//     }
//     catch(Err){
//         logger.debug("======ERR!!===>>",Err);
//         return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
//     }
// }

// const createTapBusinessDestination=async (req,res)=>{
//     try{
//         let display_name=req.body.display_name;
//         let business_id=req.body.business_id;
//         let business_entity_id=req.body.business_entity_id;
//         let bank_account  = req.body.bank_account
//         let business_profile_json = req.body.business_profile_json
//         let supplier_id = req.body.supplier_id || 0;

//         let tapKeys = await Universal.getTapKeys(req.dbName);
//         let mercheckkey = tapKeys['tap_secret_key'];
//         let marketplacekey = tapKeys['tap_secret_key_marketplace'];

//         if( tapKeys.hasOwnProperty('tap_secret_key') && 
//         tapKeys.hasOwnProperty('tap_secret_key_marketplace')) {
//             let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
//             let tap_secret_key = marketplacekey
//             let post_url=req.query.post_url
//             let redirect_url=req.query.redirect_url

//             logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)

//             var options = { method: 'POST',
//             url: tapUrl+"/v2/destination",
//             headers: 
//             { 'content-type': 'application/json',
//                 authorization: "Bearer "+ tap_secret_key },
//             body:business_profile_json,
//             json: true };
//             logger.debug("===========options==++++",options)
//             request(options, async function (error, response, body) {
//                 logger.debug("---Err---->>",error,body);
//                 if(error){
//                     return sendResponse.sendErrorMessage(
//                         await Universal.getMsgText(
//                             languageId,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.error")),
//                         reply,400);
//                 }
//                 else{
//                     if(body && body.errors){
//                         logger.debug("==============errors=====",body)
//                         let msg = body.errors.error
//                         sendResponse.sendErrorMessage(msg,res,400);
//                       }else if (body && body.id){
                        
//                         if(req.path==="/supplier/tap/create_Detination"){
//                             logger.debug("==============success=====",body)
//                             let tap_destination_id = body.id;
//                             let query = "update supplier set tap_destination_id=? WHERE id=?";
//                             let params = [tap_destination_id,supplier_id]
//                             await ExecuteQ.Query(req.dbName,query,params);
    
    
//                             sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
    
//                         }else if(req.path==="/agent/tap/create_Detination"){
//                             logger.debug("==============success=====",body)
//                             let tap_destination_id = body.id;
//                             let query = " update admin set tap_destination_id=? limit 1 ";
//                             let params = [tap_destination_id]
//                             await ExecuteQ.Query(req.dbName,query,params);
    
    
//                             sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
    
//                         }else{
//                             logger.debug("==============success=====",body)
//                             let tap_destination_id = body.id;
//                             let query = " update cbl_user set tap_destination_id=? limit 1 ";
//                             let params = [tap_destination_id]
//                             await ExecuteQ.Query(req.dbName,query,params);
    
    
//                             sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
    
//                         }
          
//                       }else{
//                           let msg = "some error occurred";
//                           sendResponse.sendErrorMessage(msg,res,400);78
//                       }
//                 }
//             })
//         }
//         else{
//             let Err=await  Universal.getMsgText(
//                 languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
//              return sendResponse.sendErrorMessage(Err,res,400);
//         }
         
       
       
//     }
//     catch(Err){
//         logger.debug("======ERR!!===>>",Err);
//         return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
//     }
// }

// const uploadFiletoserver = (forms,headers)=>{
//     return new Promise((resolve,reject)=>{
//         forms.on('file', function(name, file) {
//             console.log("=========file.path=",file.path)
//             let formData = {
//                 file: {
//                     value: fs.createReadStream(file.path),
//                     options: {
//                         filename: file.originalFilename
//                     }
//                 }
//             };
//               const postUrl = "https://api.tap.company" //replace your upload url here  
//                req.post({url: postUrl,formData: formData,headers: headers }, function(err, httpResponse, body) {        
//                 console.log(err);
//                 console.log(httpResponse);
//                 console.log(body)
//                 resolve(body);
//                 // fs.unlink(file.path, (_err) =&gt; {});
//             });
//         //     fs.unlink(file.path, (_err) =&gt; {});
//         });
//     })
// }

// const uploadTapFiles = async (req,res)=>{
//     try{
//         var request = require('request');
//         var fs = require('fs');
//         // console.log(fs.createReadStream('../../test.txt'));

//         const fetch = require('node-fetch')

//         let file = req.files.file;
//         console.log("=======req.files.file========",req.files.file);
//         console.log("=======req.files.file====path====",req.files.file.path)

//         fetch("https://royo.imgix.net/1604124383111_02.png")
//         .then(response => response.text())
//         .then(data => {
//             // Do something with your data
//             var options = {
//                 'method': 'POST',
//                 'url': 'https://api.tap.company/v2/files',
//                 'headers': {
//                   'Authorization': 'Bearer sk_test_XKokBfNWv6FIYuTMg5sLPjhJ'
//                 },
//                 formData: {
//                   'file': {
//                     'value': fs.createReadStream(file.path),
//                     'options': {
//                     }
//                   },
//                   'purpose': 'identity_document',
//                   'title': 'test',
//                   'expires_at': '1234567',
//                   'file_link_create': 'true',
//                   'file_link_meta_data': '{"key1" : "value1","key2" : "value2","key1" : "value1","key2" : "value2"}'
//                 }
//               };
//               console.log("====================",options)
//               request(options, function (error, response) {
//                 if (error) throw new Error(error);
//                 console.log(response.body);
//               });
//         });
       
//     }
//     catch(Err){
//         logger.debug("======ERR!!===>>",Err);
//         return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
//     }
// }


// const uploadTapFiles = async (req,res)=>{
//     try{
//         let file = req.files.file;
//         console.log("==========file==========",file.headers);
//         let purpose=req.body.purpose;
//         let title=req.body.title;
//         let file_link_create = req.body.file_link_create

//         let tapKeys = await Universal.getTapKeys(req.dbName);
//         let mercheckkey = tapKeys['tap_secret_key'];
//         let marketplacekey = tapKeys['tap_secret_key_marketplace'];

//         if( tapKeys.hasOwnProperty('tap_secret_key') && 
//         tapKeys.hasOwnProperty('tap_secret_key_marketplace')) {
            
//             let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
//             let tap_secret_key = marketplacekey
//             let post_url=req.query.post_url
//             let redirect_url=req.query.redirect_url

//             logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)

//             let fileToUpload = req.files.file;
//             console.log("==================fileToUpload=========",fileToUpload)

//             var options = { method: 'POST',
//             url: tapUrl+"/v2/charges",
//             headers: 
//             { 'content-type': 'application/json',
//                 authorization: "Bearer "+ tap_secret_key },

          

//                 formData: {
//                     'file': {
//                     'value': fs.createReadStream(file.path),
//                     'options': {
//                     }
//                     },
//                     'purpose': purpose,
//                     'title': title,
//                     // 'expires_at': '1234567',
//                     'file_link_create': 'true',
//                     // 'file_link_meta_data': '{"key1" : "value1","key2" : "value2","key1" : "value1","key2" : "value2"}'
//                 }
//             };
//             logger.debug("===========options==++++",options)
//             request(options, async function (error, response, body) {
//                 logger.debug("---Err---->>",error,body);
//                 if(error){
//                     return sendResponse.sendErrorMessage(
//                         await Universal.getMsgText(
//                             languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
//                         reply,400);
//                 }
//                 else{
//                     sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);

//                 }
//             })
//         }
//         else{
//             let Err=await  Universal.getMsgText(
//                 languageId,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.no_gate_way"))
//              return sendResponse.sendErrorMessage(Err,res,400);
//         }
         
       
       
//     }
//     catch(Err){
//         logger.debug("======ERR!!===>>",Err);
//         return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
//     }
// }










const getMPaiseUrl = async (req,res)=>{
    try{
        let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
            [
            config.get("payment.mPaisa.client_id")
        ])
        console.log("===========key------data========",keyData)
        if(keyData && keyData.length>0){

           let checkout_url=req.body.checkout_url;
           
            let transaction_id = randomstring.generate({
                length: 9,
                charset: 'numeric'
            });
            let amount=req.body.amount;
            let client_id = keyData[0].value
            let items_details = req.body.items_details

            console.log("======node env ========1===",process.env+"==========")
            console.log("======node env ========2===",process.env.NODE_ENV+"==========")
            // let baseUrl = process.env.NODE_ENV == 'prod' ? 'https://pay.mpaisa.vodafone.com.fj/live/API/' : 'https://pay.mpaisa.vodafone.com.fj/live/API/'
            let baseUrl ='https://pay.mpaisa.vodafone.com.fj/live/API/';
            console.log("==baseUrl====baseUrl====>",baseUrl,JSON.stringify({
                url : checkout_url,
                tID : parseInt(transaction_id),
                amt : amount,
                cID : parseInt(client_id),
                iDet : items_details         
            }))

            var options = {
                method: 'GET',
                url: baseUrl+"?url="+checkout_url+"&tID="+transaction_id+"&amt="+amount+"&cID="+client_id+"&iDet="+items_details,
                headers : {
                    "content-type": "application/json",
                },
                json: true
            };
            console.log("---------options--------",options)
            request(options, async function (error, response, body) {
                logger.debug("---Err---->>",error,body);
                if(error){
                    return sendResponse.sendErrorMessage(
                        "paymeent gateway error",
                        res,400);
                }
                else{
                    let finalRes;
                    if(body.requestID==0){
                        finalRes = body
                    }else{
                        let finalUrl = body.destinationurl
                        finalUrl += "?tID="+parseInt(transaction_id)
                        finalUrl += "&amt="+amount
                        finalUrl += "&cID="+parseInt(client_id)
                        finalUrl += "&iDet="+items_details
                        finalUrl += "&rID="+body.requestID
                        finalUrl += "&token="+body.token
                        finalUrl += "&url="+checkout_url
                        finalRes = {
                            url:checkout_url,
                            tID:parseInt(transaction_id),
                            amt:amount,
                            cID:parseInt(client_id),
                            iDet:items_details,
                            rID:body.requestID,
                            destinationurl:body.destinationurl,
                            token:body.token,
                            tokenv2:body.tokenv2,
                            finalUrl:finalUrl
                        }
                    }
               

                    sendResponse.sendSuccessData(finalRes, constant.responseMessage.SUCCESS, res, 200);
                }
            })
        }
        else{
            let Err="payment gateway not integrated or key not found"
             return sendResponse.sendErrorMessage(Err,res,400);
        }
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}
let xmlParser = require('xml2json');
const Execute = require('../../lib/Execute');

// let xmlParser = require('xml2json');
// const randomstring = require("randomstring");
const getwindCaveUrl = async (req,res)=>{
    try{
        let amount=req.body.amount;
        let _getCurrency = await Universal.getCurrency(req.dbName)
        let currency = _getCurrency;
        let address=req.body.address;
        let email = req.body.email
        let success_url = req.body.success_url
        let failure_url = req.body.failure_url
        
        
        let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? or `key`=?",
            [
            config.get("payment.windcave.PxPayUserId"),
            config.get("payment.windcave.PxPayKey")
        ])

        logger.debug("---------gateway details ==========",keyData)

        let billing_id = "BillingId_"+randomstring.generate({
            length: 5,
            charset: 'alphanumeric'
        }).toUpperCase();

        let tax_id = "TaxId_"+randomstring.generate({
            length: 5,
            charset: 'alphanumeric'
        }).toUpperCase();

        if(keyData && keyData.length==2){
            if(keyData[0].key=="windave_PxPayUserId"){
                pxUserId = keyData[0].value
                pxKeyId = keyData[1].value
            }else{
                pxUserId = keyData[1].value
                pxKeyId = keyData[0].value
            }
            let xmlToPass = "<GenerateRequest>"+
            "<PxPayUserId>"+pxUserId+"</PxPayUserId>"+
            "<PxPayKey>"+pxKeyId+"</PxPayKey>"+
            "<TxnType>Purchase</TxnType>"+
            "<AmountInput>"+amount+"</AmountInput>"+
            "<CurrencyInput>"+currency+"</CurrencyInput>"+
            "<MerchantReference>Purchase Example</MerchantReference>"+
            // "<TxnData1>John Doe</TxnData1>"+
            // "<TxnData2>0211111111</TxnData2>"+
            // "<TxnData3>98 Anzac Ave, Auckland 1010</TxnData3>"+
            "<EmailAddress>"+email+"</EmailAddress>"+
            "<TxnId>"+tax_id+"</TxnId>"+
            "<BillingId>"+billing_id+"</BillingId>"+
            "<EnableAddBillCard>1</EnableAddBillCard>"+
            "<UrlSuccess>"+success_url+"</UrlSuccess>"+
            "<UrlFail>"+failure_url+"</UrlFail>"+
            "<UrlCallback>https://InsertValidUrlForServerSideCallback</UrlCallback>"+
            "</GenerateRequest>"

            logger.debug("---xmlToPass-----xmlToPass--",typeof xmlToPass,xmlToPass);

            let baseUrl = process.env.NODE_ENV == 'prod' ? 'https://sec.windcave.com/pxaccess/pxpay.aspx' : 'https://sec.windcave.com/pxaccess/pxpay.aspx'
           

            logger.debug("==baseUrl====baseUrl====>",amount,
            address,email,success_url,failure_url)

            request.post(
                {url:baseUrl,
                body : xmlToPass,
                headers: {'Content-Type': 'text/xml'}
                },
                function (error, response, body) {        
                    logger.debug("---Err---->>",error,body);
                    if(error){
                        return sendResponse.sendErrorMessage(
                            "paymeent gateway error",
                            res,400);
                    }
                    else{
                        let result = xmlParser.toJson(body)
                        logger.debug("++++++==================",result)
                        sendResponse.sendSuccessData(JSON.parse(result), constant.responseMessage.SUCCESS, res, 200);
                    }
                }
            );
        }
        else{
            let Err=await  "payment gateway not integrated or key not found"
             return sendResponse.sendErrorMessage(Err,res,400);
        }
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

const getAmarPayUrl=async (req,res)=>{
    try{
        var dbName = req.dbName
        let store_id = "aamarpay";
        let tran_id  =  "TaxId_"+randomstring.generate({
            length: 5,
            charset: 'alphanumeric'
        }).toUpperCase();

        let success_url = req.query.success_url==undefined || req.query.success_url==""?"https://billing.royoapps.com/payment-success?tran_id="+tran_id:req.query.success_url+"?tran_id="+tran_id
        let fail_url = req.query.fail_url==undefined || req.query.fail_url==""?"https://billing.royoapps.com/payment-error":req.query.fail_url

        let cancel_url =req.query.fail_url==undefined || req.query.fail_url==""?"https://billing.royoapps.com/payment-error":req.query.fail_url
        let amount = req.query.amount;
        let currency = "BDT";
        let signature_key = "28c78bb1f45112f5d40b956fe104645a";
        let desc = req.query.desc;
        let cus_name=req.query.name;
        let cus_email=req.query.email;
        let cus_add1= req.query.address
        let cus_add2= req.query.address

        let cus_city= "Dhaka"
        let cus_state= "Dhaka"
        let cus_postcode= "1206"
        let cus_country= "Bangladesh"
        let cus_phone= req.query.phone

        let signature_key_data =[{
            "signature_key":signature_key,
            "store_id":store_id
        }];

        if(signature_key_data && signature_key_data.length){
            let amarpaybaseUrl = "https://sandbox.aamarpay.com/sdk/index.php"

            let obj =  {
                "store_id":store_id,
                "tran_id":tran_id,
                "success_url":success_url,
                "fail_url":fail_url,
                "cancel_url":cancel_url,
                "amount":amount,
                "currency":currency,
                "signature_key":signature_key,
                "desc":desc,
                "cus_name":cus_name,
                "cus_email":cus_email,
                "cus_add1":cus_add1,
                "cus_add2":cus_add2,
                "cus_city":cus_city,
                "cus_state":cus_state,
                "cus_postcode":cus_postcode,
                "cus_country":cus_country,
                "cus_phone":cus_phone,
                "app_id":"000599000730016",
                "source":"",
                "source_details":""
                }
            

            let headers =  {
                'Content-Type': 'multipart/form-data',
            }

            var options = {
                method: 'POST',
                url: amarpaybaseUrl,
                headers:headers,
                form: obj,
                json: true 
            };

            logger.debug("+======",options)



           

            request(options, async function (error, response, body) {
                logger.debug("---Err---->>",error,body);
                if(error){
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            14,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                        reply,400);
                }
                else{
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
                }
            })
        }
        else{
            let Err=await  Universal.getMsgText(
                14,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
             return sendResponse.sendErrorMessage(Err,res,400);
        }
         
       
       
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

// const getthawaniUrl = async (req,res)=>{
//     try{
//         let keyData=await Universal.getThawaniKeys(req.dbName)
//         logger.debug("=========keydata=======",keyData)
//         // let filePath = path.resolve("./public/public_key");
  
//         let amount = req.query.amount;
//         let merchant_reference =randomstring.generate({
//             length: 20,
//             charset: 'numeric'
//         }).toUpperCase();
//         let payment_expiry_date = moment().utc()
//         payment_expiry_date = payment_expiry_date.format("YYYY-MM-DD HH:MM:SS")
  
//         let email = req.query.email;
//         let name = req.query.name;
  
//         // let return_url = encryptString("https://billing.royoapps.com/payment-success",filePath);
//         // let callback_url = encryptString("https://billing.royoapps.com/payment-success",filePath);
//         // let sucess_url = encryptString("https://billing.royoapps.com/payment-success",filePath);
//         // let next_url = encryptString("https://billing.royoapps.com/payment-success",filePath);
  
//         if(Object.keys(keyData).length>0){
//             let baseUrl = process.env.NODE_ENV == 'prod' ? 'https://uatecommerce.thawani.om/api/paymentrequest/' : 'https://uatecommerce.thawani.om/api/paymentrequest/'
           
  
//             logger.debug("==baseUrl====baseUrl====>",baseUrl);
        
//             let requestBody =  {
//                 "amount":amount,
//                 "merchant_reference":merchant_reference,
//                 "remark":"Product",
//                 "email":email,
//                 "language":"en",
//                 "payment_expiry_date":"",
//                 "callback_url":"https://billing.royoapps.com/payment-success",
//                 "return_url":"https://billing.royoapps.com/payment-success",
//                 "next_url":"https://billing.royoapps.com/payment-success",
//                 "sucess_url":"https://billing.royoapps.com/payment-success",
//                 "merchant_fields":{
//                     "udf1":"",
//                     "udf2":"",
//                     "udf3":"",
//                     "udf4":"",
//                     "udf5":"",
//                     "udf6":"",
//                     "udf7":"",
//                     "udf8":"",
//                     "udf9":"",
//                     "udf10":""
//                 }
//                 }
  
//                 logger.debug("===========request body=========",JSON.stringify(requestBody));
  
//                 // for(key in requestBody){
//                 //     logger.debug("=========key================",key)
//                 //     requestBody[key] = encryptString(key.toString(), filePath)
//                 // }
  
//                 // for(key in requestBody["merchant_fields"]){
//                 //     logger.debug("=========key==========23======",key)
//                 //     requestBody["merchant_fields"][key] = encryptString(key.toString(), filePath)
//                 // }
//                 console.log("========encrypted body=========",JSON.stringify(requestBody))
//                 requestBody["public_key"]=keyData["thawani_public_key"]
//                 let encryptedBody = await encryptBodyThroughThawani(requestBody,keyData,res);
//             var options = {
//                 method: 'POST',
//                 url: baseUrl,
//                 body:encryptedBody,
//                 headers : {
//                     "content-type": "application/json",
//                     authorization: "Bearer "+ keyData["thawani_api_key"]
//                 },
//                 json: true
//             };
//             console.log("---------options--------",options)
//             request(options, async function (error, response, body) {
//                 logger.debug("---Err---->>",error,body);
//                 if(error){
//                     return sendResponse.sendErrorMessage(
//                         "paymeent gateway error",
//                         res,400);
//                 }
//                 else{
//                     sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
//                 }
//             })
//         }
//         else{
//             let Err="payment gateway not integrated or key not found"
//              return sendResponse.sendErrorMessage(Err,res,400);
//         }
//     }
//     catch(Err){
//         logger.debug("======ERR!!===>>",Err);
//         return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
//     }
//}
  
function encryptBodyThroughThawani(requestBody,keyData,res){
    try{
        return new Promise((resolve,reject)=>{
            let baseUrl = "https://developer.thawani.om/encrypt/"
            var options = {
                method: 'POST',
                url: baseUrl,
                body:requestBody,
                headers : {
                    "content-type": "application/json",
                    authorization: "Bearer "+ keyData["thawani_api_key"]
                },
                json: true
            };
            console.log("---------options--------",options)
            request(options, async function (error, response, body) {
                logger.debug("---Err---->>",error,body);
                if(error){
                    return sendResponse.sendErrorMessage(
                        "paymeent gateway error",
                        res,400);
                }
                else{
                    resolve(body);
                }
            })
        })
    }catch(err){
        logger.debug("=========",err);
        sendResponse.sendErrorMessage("some error during encryption",res,400)
    }
}

// function encryptString (plaintext, publicKeyFile) { 

//     const publicKey = fs.readFileSync(publicKeyFile, "utf8"); 
  
//     // // publicEncrypt() method with its parameters 
//     // const encrypted = crypto.publicEncrypt( 
//     //      publicKey, Buffer.from(plaintext)); 
//     // return encrypted.toString("base64"); 
    
//     let enc = crypto.publicEncrypt({
//         key: publicKey,
//         padding: crypto.RSA_PKCS1_OAEP_PADDING
//         }, Buffer.from(plaintext));
//     return enc.toString("base64");
// } 

const getthawaniUrlNew = async (req,res)=>{
    try{
        let keyData=await Universal.getThawaniKeys(req.dbName)

        // Customer information passed on metadata (Name, Contact number, & Email address).
        
        logger.debug("=========keydata=======",keyData)
        // let filePath = path.resolve("./public/public_key");
        console.log("===================keydatat=================",keyData)
        let amount = req.query.amount;

        let merchant_reference =randomstring.generate({
            length: 20,
            charset: 'numeric'
        }).toUpperCase();

        let payment_expiry_date = moment().utc()

        payment_expiry_date = payment_expiry_date.format("YYYY-MM-DD HH:MM:SS")
  
        let email = req.query.email;
        let name = req.query.name;

        let phoneNumber = req.query.phoneNumber || email
         let success_url = req.query.success_url!==undefined?req.query.success_url:"https://billing.royoapps.com/payment-success"
         let cancel_url = req.query.cancel_url!==undefined?req.query.cancel_url:"https://billing.royoapps.com/payment-success"
        
        if(Object.keys(keyData).length>0){
            let userData=await Execute.Query(req.dbName,"select country_code,mobile_no from user where id=?",[req.users.id])
            phoneNumber=userData && userData.length>0?userData[0].country_code+userData[0].mobile_no:"";
            let baseUrl = process.env.NODE_ENV == 'prod' ? 'https://checkout.thawani.om/api/v1/checkout/session' : 'https://checkout.thawani.om/api/v1/checkout/session';
            //let baseUrl = 'https://checkout.thawani.om/api/v1/checkout/session'
  
            logger.debug("==baseUrl====baseUrl====>",baseUrl,phoneNumber);
        

            let requestBody = {
                "client_reference_id": merchant_reference,
                "products": [
                  {"name": "order", "unit_amount": parseFloat(amount)*1000, "quantity": 1}
                ],
                "success_url": success_url+"?txn_id="+merchant_reference+"",
                "cancel_url": cancel_url+"?txn_id="+merchant_reference+"",
                "metadata": {"customer": name,"email":email,"Contact number":phoneNumber}
              }

            var options = {
                method: 'POST',
                url: baseUrl,
                body:requestBody,
                headers : {
                    "content-type": "application/json",
                    "thawani-api-key":  keyData["THAWANI_API_KEY"]
                },
                json: true
            };
            console.log("---------options--------",JSON.stringify(options));

            request(options, async function (error, response, body) {
                
                logger.debug("---Err---->>",error,body);

                if(error){
                    return sendResponse.sendErrorMessage(
                        "paymeent gateway error",
                        res,400);
                }
                else{
                    let url = "http://checkout.thawani.om/pay/"+body.data.session_id+"?key="+keyData["THAWANI_PUBLIC_KEY"]
                    sendResponse.sendSuccessData(url, constant.responseMessage.SUCCESS, res, 200);
                }
            })
        }
        else{
            let Err="payment gateway not integrated or key not found"
             return sendResponse.sendErrorMessage(Err,res,400);
        }
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

const getTelrUrl=async (req,res)=>{
    try{
        var dbName = req.dbName;
        let token = req.headers.authorization
        let userId = req.users.id;

        let getTelrKeys = await Universal.getTelrKeys(dbName);
        let liveTelrMode=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=? and value=?",["enable_telr_live_mode",1])

        let tran_id  =  "order_"+randomstring.generate({
            length: 8,
            charset: 'alphanumeric'
        }).toUpperCase();

        let amount = req.query.amount;
        let desc = req.query.desc;
        let currency = req.query.currency;
        let ivp_test = 0;
        let billRegion="india";
        let billCountry="india"
        if(!(process.env.NODE_ENV == 'live')){
            currency = "AED";
            ivp_test = 1;
        }
        if(liveTelrMode && liveTelrMode.length>0){
            ivp_test = 0;
            billRegion="United Arab Emirates";
            billCountry="United Arab Emirates"

        }
        let userDetails = await Universal.getUserData(req.dbName,token)
        if(Object.keys(getTelrKeys).length>0){
           
            userDetails = userDetails[0];
            console.log("============userDetails===========",userDetails);
            let obj =  {
                "ivp_method":"create",
                "ivp_store":getTelrKeys.telr_store_id,
                "ivp_authkey":getTelrKeys.telr_authkey,
                "ivp_amount":amount,
                "ivp_currency":currency,
                "ivp_test":ivp_test,
                "ivp_cart":tran_id,
                "ivp_desc":desc,
                "return_auth":req.query.success_url!==undefined?req.query.success_url+"?tran_id="+tran_id:"https://billing.royoapps.com/payment-success?tran_id="+tran_id,
                "return_decl":req.query.success_url!==undefined?req.query.success_url+"?tran_id="+tran_id:"https://billing.royoapps.com/payment-success?tran_id="+tran_id,
                "return_can":req.query.cancel_url!==undefined?req.query.cancel_url:"https://billing.royoapps.com/payment-error",
                "bill_fname":userDetails.name,
                "bill_addr1":userDetails.address_line_1,
                "bill_phone":userDetails.mobile_no,
                "bill_city":userDetails.country_code,
                "bill_country":billCountry,
                "bill_email":userDetails.email,
                "bill_addr2":userDetails.address_line_1,
                "bill_region":billRegion
                }
            

            let headers =  {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic '+Buffer.from(getTelrKeys.merchent_id + ":" + getTelrKeys.api_key).toString('base64')
            }

            var options = {
                method: 'POST',
                url: "https://secure.telr.com/gateway/order.json",
                headers:headers,
                form: obj,
                json: true 
            };

            logger.debug("+======",options)


            logger.debug("+======",JSON.stringify(options))
           

            request(options, async function (error, response, body) {
                logger.debug("---Err---->>",error,body);
                if(error){
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            14,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                        reply,400);
                }
                else{
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
                }
            })
        }
        else{
            let Err=await  Universal.getMsgText(
                14,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
             return sendResponse.sendErrorMessage(Err,res,400);
        }
         
       
       
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

const getHyperPayUrlId = async (req, res) => {
    try {
        let amount = req.body.amount;
        amount = amount.toFixed(2)
        let currency  = req.body.currency
        let is_mada_entity_id = req.body.is_mada_entity_id!==undefined?
        req.body.is_mada_entity_id:0
        let entity_id = "";
        let email = req.body.email || "";
        let street1 = req.body.street1 || "";
        let city = req.body.city || "";
        let state = req.body.state || "";
        let country = req.body.country || "";
        let postcode = req.body.postcode || "";
        let givenName = req.body.givenName || "";
        let surname = req.body.surname || ""
      const hyperPayEntityId = await ExecuteQ.Query(
        req.dbName,
        "select `key`,`value` from tbl_setting where `key`=?",
        ["hyper_pay_entity_id"]
      );
      const hyperPayBeareToken = await ExecuteQ.Query(
        req.dbName,
        "select `key`,`value` from tbl_setting where `key`=?",
        ["hyper_pay_bearer_token"]
      );
      let tran_id  =  "order_"+randomstring.generate({
        length: 8,
        charset: 'alphanumeric'
    }).toUpperCase();

    const hyperPayMadaEntityId = await ExecuteQ.Query(
        req.dbName,
        "select `key`,`value` from tbl_setting where `key`=?",
        ["hyper_pay_mada_entity_id"]
      );

    let userDetails = "";
      if(
          hyperPayEntityId &&
          hyperPayBeareToken &&
          hyperPayMadaEntityId &&
          hyperPayBeareToken.length>0 &&
          hyperPayEntityId.length>0 &&
          hyperPayMadaEntityId.length>0
          ){
            entity_id = hyperPayEntityId[0].value;
            if(parseInt(is_mada_entity_id)){
                entity_id = hyperPayMadaEntityId[0].value;
            }

        let body =  {
            "amount":amount,
            "currency": currency,
            "entityId":entity_id,
            "paymentType":"DB",
            // "testMode":"EXTERNAL",
            "merchantTransactionId": tran_id,
            "customer.email":email,
            // "billing.street1":street1,
            // "billing.city":city,
            // "billing.state":state,
            // "billing.country":country,
            // "billing.postcode":postcode,
            "customer.givenName":givenName,
            "customer.surname":givenName
        }
  
        
        let headers =  {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer '+hyperPayBeareToken[0].value+''
        }
        
        let baseUrl = process.env.NODE_ENV == 'prod' ?"https://oppwa.com/v1/checkouts":"https://test.oppwa.com/v1/checkouts"
  
    // let baseUrl = process.env.NODE_ENV == 'prod' ?"https://test.oppwa.com/v1/checkouts":"https://test.oppwa.com/v1/checkouts"
  
        var options = {
            method: 'POST',
            url: baseUrl,
            headers:headers,
            form: body,
            json: true 
        };
        console.log("========options========options=============",options);
  
        logger.debug("========options========options=============",JSON.stringify(options));
  
    
        request(options, async function (error, response, body) {
            console.log("---Err---->>",error,body);
            if(error){
                return sendResponse.sendErrorMessage(
                    await Universal.getMsgText(
                        14,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                    reply,400);
            }
            else{
                let details = body;
                let data = {
                    baseUrl : process.env.NODE_ENV == 'prod' ?"https://oppwa.com/v1/paymentWidgets.js?checkoutId="+details.id : "https://test.oppwa.com/v1/paymentWidgets.js?checkoutId="+details.id
                }
                // let data = {
                //     baseUrl : process.env.NODE_ENV == 'prod' ?"https://test.oppwa.com/v1/paymentWidgets.js?checkoutId="+details.id : "https://test.oppwa.com/v1/paymentWidgets.js?checkoutId="+details.id
                // }
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
        })
        
    
  
        
      }else{
        let Err=await  Universal.getMsgText(
            14,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.no_gate_way"))
         return sendResponse.sendErrorMessage(Err,res,400);
    }
    
    } catch (err) {
        console.log("===getHyperPayUrlId==ERR!=",err)
      return sendResponse.sendErrorMessage(
        CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,
        res,
        400
      );
    }
};

const getPayMayaUrl = async (req, res) => {
    try{

        var dbName = req.dbName
        
        let getPaymayaKeys = await Universal.getPayMayaKeys(dbName);

        let requestReferenceNumber  = randomstring.generate({
            length: 10,
            charset: 'numeric'
        }).toUpperCase();

        let amount = req.body.amount;
        let currency = req.body.currency;
        let requestUrl = "https://pg-sandbox.paymaya.com/checkout/v1/checkouts";
        if(!(process.env.NODE_ENV == 'live')){
            requestUrl = "https://pg-sandbox.paymaya.com/checkout/v1/checkouts";
        }
        let successUrl = req.body.successUrl;
        let failureUrl = req.body.failureUrl;

        if(Object.keys(getPaymayaKeys).length>0){
            
            let body =  {
                "totalAmount": {
                  "value": amount,
                  "currency": currency
                },
                "redirectUrl": {
                  "success": ""+successUrl+"?ref_id="+requestReferenceNumber+"",
                  "failure": ""+failureUrl+"?ref_id="+requestReferenceNumber+"",
                  "cancel": failureUrl
                },
                "requestReferenceNumber": requestReferenceNumber,
                "metadata": {}
              }
            

            let headers =  {
                'Authorization': 'Basic '+Buffer.from(getPaymayaKeys.paymaya_public_key + ":").toString('base64'),
                'Content-Type' :'application/json'
            }

            var options = {
                method: 'POST',
                url: requestUrl,
                headers:headers,
                form: body,
                json: true 
            };

            logger.debug("+======",options)
            console.log("+======",JSON.stringify(options))


            logger.debug("+======",JSON.stringify(options))
           

            request(options, async function (error, response, body) {
                logger.debug("---Err---->>",error,body);
                if(error){
                    return sendResponse.sendErrorMessage(
                        await Universal.getMsgText(
                            14,{service_type:0,dbName:dbName},config.get("error_msg.payment.error")),
                        reply,400);
                }
                else{
                    sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
                }
            })
        }
        else{
            let Err=await  Universal.getMsgText(
                14,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
             return sendResponse.sendErrorMessage(Err,res,400);
        }
         
       
       
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
};


const requestApi = (options)=>{
return new Promise((resolve, reject) => {
        request(options,
                function (error, response, body) {    			
                    console.log("===requestApi===",error, body);      
                        if(error){
                            reject(error);
                        }
                        else{
                            resolve(body);
                        }
                });

    })
}

const updatepayuLatamCardInDB = (dbName,data)=>{
    console.log("******datae"  ,data);
    let  nowT = Date.now();
    
    data.updated_at =  moment.utc(nowT).format('YYYY-MM-DD HH:mm:ss'); 
    
    return new Promise(async(resolve,reject)=>{
        let query = "update user_cards set exp_month =? and  exp_year =? and updated_at =? where customer_payment_id =? and card_source =? and card_id =?"
    
        let params = [data.exp_month, data.exp_year, data.updated_at, data.customer_payment_id,data.card_source,data.card_id];
        let result = await ExecuteQ.Query(dbName,query, params);
        resolve(result)

    })
}




    const addTapCustomerAndCard = async (req,res)=>{
        try{
    
            let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
                [
                config.get("payment.tap.secret_key")
            ])
            let customer_profile_json = req.body.customer_profile_json
            let card_token = req.body.card_token
            let supplier_id = req.body.supplier_id
            logger.debug("====SaDDed==keyData!==>>",keyData);
    
            if(keyData && keyData.length>0){
                let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
    
    
                let customer_created_id = await Universal.createCustomerOnTap(customer_profile_json,tapUrl,keyData[0].value);
        
                let savedCardId = await Universal.saveCardOnTap(card_token,customer_created_id,tapUrl,keyData[0].value);
    
                let query = " update supplier set tap_customer_id=?, tap_saved_card_id=? where id=? ";
    
                await ExecuteQ.Query(req.dbName,query,[customer_created_id,savedCardId,supplier_id]);
    
                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    
            }
            else{
                let Err=await  Universal.getMsgText(
                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
                 return sendResponse.sendErrorMessage(Err,res,400);
            }
        }
        catch(Err){
            logger.debug("======ERR!!===>>",Err);
            return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
        }
    }
    
    
    
    const createTapBusinessProfile = async (req,res)=>{
        try{
            let currentUtcDate=moment.utc().format("YYYY-MM-DD HH:mm:ss");
            logger.debug("=====curentUtc=input=>>",currentUtcDate,req.query);
            let business_type=req.body.business_type;
            let business_name=req.body.business_name;
            let legal_name=req.body.legal_name;
            let country=req.body.country;
            let contact_person_first_name = req.body.contact_person_first_name
            let contact_person_last_name = req.body.contact_person_last_name
            let email=req.body.email;
            let country_code=req.body.country_code;
            let phone_number=req.body.phone_number;
            let brand_name=req.body.brand_name;
            let sector = req.body.sector;
            let bank_account_number = req.body.bank_account_number
            let supplier_id = req.body.supplier_id;
            let is_licensed = req.body.is_licensed
            let license_number = req.body.license_number
            let key_object={};
            let business_profile_json = req.body.business_profile_json;
            let documents = req.body.documents
    
            
    
            if(!(documents && documents.length>0)){
                return sendResponse.sendErrorMessage("no documents found",res,400);
            }
    
            let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
                [
                config.get("payment.tap.secret_key")
            ])
            logger.debug("====SaDDed==keyData!==>>",keyData);
    
            if(keyData && keyData.length>0){
                let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
                let tap_secret_key = keyData[0].value
                let post_url=req.query.post_url
                let redirect_url=req.query.redirect_url
    
                logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)
    
                var options = { method: 'POST',
                url: tapUrl+"/v2/business",
                headers: 
                { 'content-type': 'application/json',
                    authorization: "Bearer "+ tap_secret_key },
    
                body : business_profile_json,
                json: true };
                logger.debug("===========options==++++",JSON.stringify(options));
                request(options, async function (error, response, body) {
                    logger.debug("---Err---->>",error,body);
                    if(error){
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.error")),
                            reply,400);
                    }
                    else{
                        if(body && body.errors){
                            logger.debug("==============errors=====",body)
                            let msg = body.errors.error
                            sendResponse.sendErrorMessage(msg,res,400);
                          }else if (body && body.id){
    
                            logger.debug("==============success=====",body)
                            // if(req.path==="/supplier/tap/create_bussiness"){
                            //     let tap_business_id = body.id;
                            //     let tap_business_entity_id = body.entity.id;
                            //     let query = "update supplier set tap_business_id=?,tap_business_entity_id=? WHERE id=?";
                            //     let params = [tap_business_id,tap_business_entity_id,supplier_id]
                            //     await ExecuteQ.Query(req.dbName,query,params);
                            //     sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
        
                            // }else if(req.path==="/admin/tap/create_bussiness"){
                            //     let tap_business_id = body.id;
                            //     let tap_business_entity_id = body.entity.id;
                            //     let query = "update admin set tap_business_id=?,tap_business_entity_id=? limit";
                            //     let params = [tap_business_id,tap_business_entity_id,supplier_id]
                            //     await ExecuteQ.Query(req.dbName,query,params);
                            //     sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
                            // }{
    
                                sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
    
                            // }
                          }else{
                              let msg = "some error occurred";
                              sendResponse.sendErrorMessage(msg,res,400);78
                          }
                    }
                })
            }
            else{
    
                let Err="keys not added for tap";
    
                return sendResponse.sendErrorMessage(Err,res,400);
            }
             
           
           
        }
        catch(Err){
            logger.debug("======ERR!!===>>",Err);
            return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
        }
    }
    
    
    const addCustmoerCard = async (req,res)=>{
        try{
            let currentUtcDate=moment.utc().format("YYYY-MM-DD HH:mm:ss");
            logger.debug("=====curentUtc=input=>>",currentUtcDate,req.query);
            let business_type=req.body.business_type;
            let business_name=req.body.business_name;
            let legal_name=req.body.legal_name;
            let country=req.body.country;
            let contact_person_first_name = req.body.contact_person_first_name
            let contact_person_last_name = req.body.contact_person_last_name
            let email=req.body.email;
            let country_code=req.body.country_code;
            let phone_number=req.body.phone_number;
            let brand_name=req.body.brand_name;
            let sector = req.body.sector;
            let bank_account_number = req.body.bank_account_number
            let supplier_id = req.body.supplier_id;
            let is_licensed = req.body.is_licensed
            let license_number = req.body.license_number
            let key_object={};
            let business_profile_json = req.body.business_profile_json;
            let documents = req.body.documents
    
            
    
            if(!(documents && documents.length>0)){
                return sendResponse.sendErrorMessage("no documents found",res,400);
            }
    
            let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
                [
                config.get("payment.tap.secret_key")
            ])
            logger.debug("====SaDDed==keyData!==>>",keyData);
    
            if(keyData && keyData.length>0){
                let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
                let tap_secret_key = keyData[0].value
                let post_url=req.query.post_url
                let redirect_url=req.query.redirect_url
    
                logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)
    
                var options = { method: 'POST',
                url: tapUrl+"/v2/business",
                headers: 
                { 'content-type': 'application/json',
                    authorization: "Bearer "+ tap_secret_key },
    
                body : business_profile_json,
                json: true };
                logger.debug("===========options==++++",JSON.stringify(options));
                request(options, async function (error, response, body) {
                    logger.debug("---Err---->>",error,body);
                    if(error){
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.error")),
                            reply,400);
                    }
                    else{
                        if(body && body.errors){
                            logger.debug("==============errors=====",body)
                            let msg = body.errors.error
                            sendResponse.sendErrorMessage(msg,res,400);
                          }else if (body && body.id){
    
                            logger.debug("==============success=====",body)
    
                                sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
    
                            // }
                          }else{
                              let msg = "some error occurred";
                              sendResponse.sendErrorMessage(msg,res,400);78
                          }
                    }
                })
            }
            else{
    
                let Err="keys not added for tap";
    
                return sendResponse.sendErrorMessage(Err,res,400);
            }
             
           
           
        }
        catch(Err){
            logger.debug("======ERR!!===>>",Err);
            return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
        }
    }
    
    const createTapBusinessDestination=async (req,res)=>{
        try{
            let display_name=req.body.display_name;
            let business_id=req.body.business_id;
            let business_entity_id=req.body.business_entity_id;
            let bank_account  = req.body.bank_account
            let business_profile_json = req.body.business_profile_json
            let supplier_id = req.body.supplier_id || 0;
            let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
                [
                config.get("payment.tap.secret_key")
            ])
            logger.debug("====SaDDed==keyData!==>>",keyData);
    
            if(keyData && keyData.length>0){
                let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
                let tap_secret_key = keyData[0].value
                let post_url=req.query.post_url
                let redirect_url=req.query.redirect_url
    
                logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)
    
                var options = { method: 'POST',
                url: tapUrl+"/v2/destination",
                headers: 
                { 'content-type': 'application/json',
                    authorization: "Bearer "+ tap_secret_key },
                body:business_profile_json,
                json: true };
                logger.debug("===========options==++++",options)
                request(options, async function (error, response, body) {
                    logger.debug("---Err---->>",error,body);
                    if(error){
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.error")),
                            reply,400);
                    }
                    else{
                        if(body && body.errors){
                            logger.debug("==============errors=====",body)
                            let msg = body.errors.error
                            sendResponse.sendErrorMessage(msg,res,400);
                          }else if (body && body.id){
                            
                            if(req.path==="/supplier/tap/create_Detination"){
                                logger.debug("==============success=====",body)
                                let tap_destination_id = body.id;
                                let query = "update supplier set tap_destination_id=? WHERE id=?";
                                let params = [tap_destination_id,supplier_id]
                                await ExecuteQ.Query(req.dbName,query,params);
        
        
                                sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
        
                            }else if(req.path==="/agent/tap/create_Detination"){
                                logger.debug("==============success=====",body)
                                let tap_destination_id = body.id;
                                let query = " update admin set tap_destination_id=? limit 1 ";
                                let params = [tap_destination_id]
                                await ExecuteQ.Query(req.dbName,query,params);
        
        
                                sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
        
                            }else{
                                logger.debug("==============success=====",body)
                                let tap_destination_id = body.id;
                                let query = " update cbl_user set tap_destination_id=? limit 1 ";
                                let params = [tap_destination_id]
                                await ExecuteQ.Query(req.dbName,query,params);
        
        
                                sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
        
                            }
              
                          }else{
                              let msg = "some error occurred";
                              sendResponse.sendErrorMessage(msg,res,400);78
                          }
                    }
                })
            }
            else{
                let Err="keys not added for tap";
    
                return sendResponse.sendErrorMessage(Err,res,400);
            }
             
           
           
        }
        catch(Err){
            logger.debug("======ERR!!===>>",Err);
            return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
        }
    }
    
    const uploadTapFiles = async (req,res)=>{
        try{
            console.log("==files=>>",req.files)
            let file=req.files.file;
            let purpose=req.body.purpose;
            let title=req.body.title;
            let file_link_create = req.body.file_link_create
            let keyData=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",
                [
                config.get("payment.tap.secret_key")
            ])
            console.log("======file!==>>",keyData);
    
            if(keyData && keyData.length>0){
                let tapUrl = process.env.NODE_ENV == 'prod' ? 'https://api.tap.company' : 'https://api.tap.company'
                let tap_secret_key = keyData[0].value
                let post_url=req.query.post_url
                let redirect_url=req.query.redirect_url
    
                logger.debug("==post_url,redirect_url,tapUrl===>",post_url,redirect_url,tapUrl)
    
                var options = { method: 'POST',
                url: tapUrl+"/v2/files",
                headers: 
                { 'content-type': 'multipart/form-data',
                    authorization: "Bearer "+ tap_secret_key },
                form:{
                    "file": file,
                    "purpose": purpose,
                    "title": title,
                    "file_link_create" : file_link_create
                  }
                };
                console.log("===========options==++++",options)
                request(options, async function (error, response, body) {
                    console.log("-TAP--Err---->>",error,body);
                    if(error){
                        return sendResponse.sendErrorMessage(
                            await Universal.getMsgText(
                                languageId,{service_type:0,dbName:req.dbName},config.get("error_msg.payment.error")),
                            reply,400);
                    }
                    else{
                        if(body && body.errors){
                            logger.debug("==============errors=====",body)
                            let msg = body.errors.error
                            sendResponse.sendErrorMessage(msg,res,400);
                          }else if (body && body.id){
    
                            logger.debug("==============success=====",body)
    
                            sendResponse.sendSuccessData(body, constant.responseMessage.SUCCESS, res, 200);
    
                          }else{
                           
                            console.log("---response---->>",response);
                              let msg = "some error occurred";
                              sendResponse.sendErrorMessage(msg,res,400);78
                          }
                    }
                })
            }
            else{
                let Err=await  Universal.getMsgText(
                    languageId,{service_type:0,dbName:dbName},config.get("error_msg.payment.no_gate_way"))
                 return sendResponse.sendErrorMessage(Err,res,400);
            }
             
           
           
        }
        catch(Err){
            console.log("======ERR!!===>>",Err);
            return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
        }
    }
const getUrwayCheckout = async (req,res)=>{
    try{
        let orderNetAmount=req.body.amount;
        let currency=req.body.currency;
        let payment_token=req.body.payment_token;
        
        let getUrwayKeys = await Universal.getUrwayKeys(req.dbName);
        console.log("=======>>>",getUrwayKeys)
        let userData=await Universal.getUserData(req.dbName,req.headers.authorization);
        let urway_user = getUrwayKeys.urway_user || 0;
        let urway_password = getUrwayKeys.urway_password || 0;
        let urway_merchent_key = getUrwayKeys.urway_merchantkey || 0;
        let aamount =  Math.round(parseFloat(orderNetAmount));
        console.log("=urway_user==urway_password==urway_merchent_key==>",urway_user,urway_password,urway_merchent_key)
        if(urway_user!==0 && urway_password!==0 && urway_merchent_key!==0){
            let code = `123|${urway_user}|${urway_password}|${urway_merchent_key}|${aamount}|${currency}`;
            console.log("==CODE=>>",code)
            let hash =crypto.createHash('sha256').update(code).digest('hex');
            console.log("==hash=>>",hash)

            let payment_object = 
            {
                "terminalId": urway_user,
                "password": urway_password,
                "action": "1",
                "currency" : "SAR",
                "customerEmail" : userData[0].email,
                "address":"",
                "city" : userData[0].customer_address,
                "zipcode" : "",
                "state" : userData[0].address_line_2,
                "country": "SA",
                "amount": aamount,
                "customerIp": "10.10.11.89",
                "merchantIp": "10.10.10.27",
                "tranid": "",
                "trackid" : "123",
                "requestHash":hash,
                "tokenizationType": "1",
                "cardToken": payment_token ,
                "udf1": "Test",
                "udf2":"",
                "udf3":"",
                "udf4":"",
                "udf5":""
            }

          
            let baseUrl=(process.env.NODE_ENV == 'prod')?`https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest`:`https://payments-dev.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest`;

            baseUrl=`https://payments-dev.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest`;

            let  options = {
                method: 'POST',
                url: getUrwayKeys.urway_url,
                body: payment_object,
                headers: {},
                json: true };
            
            console.log("===========options======",JSON.stringify(options));

            let urwayresult = await requestApi(options);

            if(urwayresult.payid || urwayresult.responseCode==null){
                console.log("====urwayresult==>",urwayresult)
                sendResponse.sendSuccessData(urwayresult, constant.responseMessage.SUCCESS, res, 200);
            }
            else{
                sendResponse.sendErrorMessage("payment error",res,400);
            }
        }else{
            sendResponse.sendErrorMessage("keys not found",res,400);
        }
    }
    catch(Err){
        logger.debug("======ERR!!===>>",Err);
        return sendResponse.sendErrorMessage(CONSTS.SERVER.ERROR_MSG.DEFAULT_ERROR.MSG,res,400);
    }
}

module.exports={
    getUrwayCheckout:getUrwayCheckout,
    getAltanticEcommerce:getAltanticEcommerce,
    getHyperPayUrlId:getHyperPayUrlId,
    getSaadedPaymentUrl:getSaadedPaymentUrl,
    getTapPaymentUrl:getTapPaymentUrl,
    getMPaiseUrl:getMPaiseUrl,
    getwindCaveUrl:getwindCaveUrl,
    getPurchasedGift:getPurchasedGift,
    purchaseGift:purchaseGift,
    getContextCyberSource:getContextCyberSource,
    clientToken:clientToken,
    createPaypalPayment:createPaypalPayment,
    AccessCode:AccessCode,
    addCard : addCard,
    listCards : listCards,
    listAgentCards:listAgentCards,
    UpdateCard : UpdateCard,
    deleteCard : deleteCard,
    testTelnr:testTelnr,
    getAmarPayUrl:getAmarPayUrl,
    getthawaniUrlNew:getthawaniUrlNew,
	getTelrUrl:getTelrUrl,
    getHyperPayUrlId:getHyperPayUrlId,
    checkUserCardsExists : checkUserCardsExists,
    atlanticTransactionVerification:atlanticTransactionVerification,
    getPayMayaUrl:getPayMayaUrl,
    addTapCustomerAndCard:addTapCustomerAndCard,
    createTapBusinessProfile:createTapBusinessProfile,
    createTapBusinessDestination:createTapBusinessDestination,
    uploadTapFiles:uploadTapFiles,
    addUserCards:addUserCards,
    getPaystackUserCard : getPaystackUserCard
}