

var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var consts=require('./../../config/const')
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784","782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var loginFunctions = require('../../routes/loginFunctions');
var AdminMail = "ops@royo.com";
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD

const supplierVariantList=(req,res)=>{
    var product_id=req.body.product_id;
    var limit=req.body.limit;
    var offset=req.body.offset;
    var serachType=req.body.serachType;
    var serachText=req.body.serachText;
    async.waterfall([
        function (cb) {
            loginFunctions.listOfVariants(req.dbName,0,res, product_id,limit,offset,serachType,serachText,cb);
        },
    ], function (error, result) {
        console.log("==error=",error)
            if (error) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                }
    }
);  

}

module.exports={
    supplierVariantList:supplierVariantList,
  
}
