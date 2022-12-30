/**
 * Created by vinay on 3/2/16.
 */
var constant = require('./constant');
var universalFunctions = require('../util/Universal');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';


exports.invalidAccessTokenError = function (res) {

    var errResponse = {
        status: constant.responseStatus.INVALID_ACCESS_TOKEN,
        message: constant.responseMessage.INVALID_ACCESS_TOKEN,
        data: {}
    }
    sendData(errResponse,res);
};

exports.parameterMissingError = function (res) {

    var errResponse = {
        status: constant.responseStatus.PARAMETER_MISSING,
        message: constant.responseMessage.PARAMETER_MISSING,
        data: {}
    }
    sendData(errResponse,res);
};

exports.somethingWentWrongError = function (res) {

    var errResponse = {
        status: constant.responseStatus.ERROR_IN_EXECUTION,
        message: constant.responseMessage.ERROR_IN_EXECUTION,
        data: {}
    }
    sendData(errResponse,res);
};


exports.sendErrorMessage = function (msg,res,status) {
    var errResponse = {
        status: status,
        message: msg,
        data: {}
    };
    sendData(errResponse,res);

};

exports.sendErrorMessageWithTranslation = function (req,msg,res,status) {
    let language=req.body.languageId || req.body.languageId;
    let lang=req.headers["accept-language"]!=undefined?req.headers["accept-language"]:"en"; 
    console.log("==lang====msg==accept-language===>>",lang,msg,req.headers["accept-language"])
    i18n.setLocale(lang)
    var errResponse = {
        status: status,
        message: i18n.__(msg),
        data: {}
    };
    sendData(errResponse,res);
};
exports.sendErrorMessageNew = async function (msg,req,res,status) {
    let terminology = await universalFunctions.getTerminology(req.dbName);
    let english=terminology.english;
    let other=terminology.other;
    let msg_text=await universalFunctions.getMsgAfterTerminology(english,msg)

    var errResponse = {
        status: status,
        message: msg,
        data: {}
    };
    sendData(errResponse,res);
};


exports.sendSuccessData = function (data,message,res,status) {
    console.log(`res : `,message,status)
    var successResponse = {
        status: status,
        message: message,
        data: data
    };
    // logger.debug("..........sdfvgbdf..........status......",status);
    sendData(successResponse,res);
};


exports.sendSuccessDataStatusCode = function (data,message,res,status) {

    var successResponse = {
        status: status,
        statusCode: status,
        message: message,
        data: data
    };
    // logger.debug("..........sdfvgbdf..........status......",status);
    sendData(successResponse,res);
};
exports.sendSuccessDataWithVariant = function (data,brands,message,res,status) {
    var successResponse = {
        status: status,
        message: message,
        data: data,
        brands:brands
    };
   // console.log("..........sdfvgbdf..........status......",status);
    sendData(successResponse,res);
};

exports.sendSuccessDataForApp = function (data,message,res) {

    var successResponse = {
        status: 200,
        message: message,
        data: data
    };
    sendData(successResponse,res);
};

exports.unauthorizedCustomer = function(res){

    var Response = {
        status: constant.responseStatus.UNAUTHORIZED_CUSTOMER,
        message: constant.responseMessage.SUBSCRIPTION,
        data: {}
    }
    sendData(Response,res);
}

exports.permissionError = function(res){

    var Response = {
        status: constant.responseStatus.PERMISSION_ERROR,
        message: constant.responseMessage.PERMISSION_ERROR,
        data: {}
    }
    sendData(Response,res);
}

exports.duplicateCategory = function(res){
    var Response = {
        status : constant.responseStatus.SOME_ERROR,
        message : constant.responseMessage.DUPLICATE_ENTRY_FOR_CATEGORY,
        data : {}
    }
    sendData(Response,res)
}
exports.errResponseWithMuliLangugage=function (res) {
    var Response = {
        status : constant.responseStatus.SOME_ERROR,
        message : constant.responseMessage.DUPLICATE_ENTRY_FOR_CATEGORY,
        data : {}
    }
    sendData(Response,res)
}

function sendData(data,res)
{   
    // console.log("response - ",JSON.stringify(data));    
    //res.type('json');
    res.send(data);
}