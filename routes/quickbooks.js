
'use strict';





const path = require('path');
const OAuthClient = require('intuit-oauth');
const bodyParser = require('body-parser');

var sendResponse = require('./sendResponse');
var constant = require('./constant');
const ExecuteQ = require('../lib/Execute')
/**
 * Configure View and Handlebars
 */


/**
 * App Variables
 * @type {null}
 */
 let oauth2_token_json = null;
 let redirectUri = '';
 
 /**
  * Instantiate new Client
  * @type {OAuthClient}
  */
 
 let oauthClient = null;
 
 /**
  * Home Route
  */

 
// this router made by naveen verma
 exports.authUri = function(req,res){


    oauthClient = new OAuthClient({
        clientId: 'ABDUPjITIMyY2QgeZorHRQbJwwTWHRwPvd0HpCQmJUtXdoAl1W',            ///////req.query.json.clientId,
        clientSecret: 'nBMNvgiursg4UFUklm3TkVAwxklnBZpB1r3dobY9',                              //req.query.json.clientSecret,
        environment: 'sandbox',                               //req.query.json.environment,
        redirectUri: 'https://api-saas.royoapps.com/callback'                     //req.query.json.redirectUri,
      });
    
      const authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting],
        state: 'intuit-test',
      });
      console.log(authUri,"authUri,,,,,,,,,,,")
      sendResponse.sendSuccessData(authUri, constant.responseMessage.SUCCESS, res, 200);

 }


 exports.callback = function(req,res){
   console.log(req.url,"req.urlreq.urlreq.urlreq.urlreq.url")
    oauthClient
    .createToken(req.url)
    .then(function (authResponse) {
      oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
    })
    .catch(function (e) {
      console.error(e);
    });
  res.send('');


 }

 exports.retriveToken = function(req,res){
  sendResponse.sendSuccessData(oauth2_token_json, constant.responseMessage.SUCCESS, res, 200);
}


exports.refreshAccessToken = function(req,res){
  try{
    oauthClient
    .refresh()
    .then(function (authResponse) {
      console.log(`The Refresh Token is  ${JSON.stringify(authResponse.getJson())}`);
      oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
      sendResponse.sendSuccessData(oauth2_token_json, constant.responseMessage.SUCCESS, res, 200);
    })
    .catch(function (e) {
      console.error(e);
      sendResponse.somethingWentWrongError(res)
    });
  }
  catch(err){  
    console.log(err,"quickbooks errrororororrooro")     
    return   sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

      // return sendResponse.sendErrorMessage("please connect with Quick books first",res,400);
  }
 }

 exports.getCompanyInfo = function(req,res){
  try{
    const companyID = oauthClient.getToken().realmId;

    const url =
      oauthClient.environment == 'sandbox'
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;
  
    oauthClient
      .makeApiCall({ url: `${url}v3/company/${companyID}/companyinfo/${companyID}` })
      .then(function (authResponse) {
        console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
        sendResponse.sendSuccessData(JSON.parse(authResponse.text()), constant.responseMessage.SUCCESS, res, 200);
        res.send(JSON.parse(authResponse.text()));
      })
      .catch(function (e) {
        console.error(e);
        sendResponse.somethingWentWrongError(res)
      });
    }
      catch(err){    
       return   sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

        // return sendResponse.sendErrorMessage("please connect with Quick books first",res,400);
    }
 }


 exports.addCustomer =  function(req,res){
   
  try{
  const companyID = oauthClient.getToken().realmId;
 let obj=  {
    "BillAddr":{
    "CountrySubDivisionCode":req.body.CountrySubDivisionCode,
    "Country":req.body.Country
    },
    "PrimaryPhone":{
    "FreeFormNumber":req.body.FreeFormNumber
    },
    "PrimaryEmailAddr":{
    "Address":req.body.Address
    },
    "Notes":req.body.Notes,
    "DisplayName":req.body.DisplayName,
    }


  const url =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;
console.log(url,"urlurllllllllllllllll")
  oauthClient
    .makeApiCall({ url: `${url}v3/company/${companyID}/customer?minorversion=57`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
  },

  body: JSON.stringify(obj),
   })
    .then(async function (authResponse) {
      console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
      console.log(authResponse,"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
      console.log(authResponse.json.Customer.Id,"kkbkdbhis")
      let query = "update supplier set qb_customer_id = ? where id=?";
      let params = [authResponse.json.Customer.Id,req.body.supplier_id];
      await ExecuteQ.Query(req.dbName,query,params);
      sendResponse.sendSuccessData(JSON.parse(authResponse.text()), constant.responseMessage.SUCCESS, res, 200);
       
     // res.send(JSON.parse(authResponse.text()));
    })
    .catch(function (e) {
      console.error(e);
      sendResponse.somethingWentWrongError(res)
    });


  }
  catch(err){    
    console.log(err,"quickbooks errrororororrooro")   
    return   sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);

    // return sendResponse.sendErrorMessage("please connect with Quick books first",res,400);
}


 }

exports.createInvoice = function(req,res){
try{
 const companyID = oauthClient.getToken().realmId;

 const url =
   oauthClient.environment == 'sandbox'
     ? OAuthClient.environment.sandbox
     : OAuthClient.environment.production;
console.log(url,"urlurllllllllllllllll", JSON.stringify(req.body))
 oauthClient
   .makeApiCall({ url: `${url}v3/company/${companyID}/invoice`,
   method: 'POST',
   headers: {
     'Content-Type': 'application/json',
 },
 
   body: JSON.stringify(req.body)
})
   .then(function (authResponse) {
     console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
     sendResponse.sendSuccessData(JSON.parse(authResponse.text()), constant.responseMessage.SUCCESS, res, 200);
   //  res.send(JSON.parse(authResponse.text()));
   })
   .catch(function (e) {
     console.error(e);
     sendResponse.somethingWentWrongError(res)
   });

  }
  catch(err){
    console.log(err,"quickbooks errrororororrooro")   
    return   sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
 
    // return sendResponse.sendErrorMessage("please connect with Quick books first",res,400);
}




}












