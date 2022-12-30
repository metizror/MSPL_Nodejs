/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an dashboard related action from admin panel
 * ==========================================================================
 */
var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr=require('../../lib/UploadMgr')
var confg=require('../../config/const');
const Universal=require('../../util/Universal')
var _ = require('underscore'); 
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const common=require('../../common/agent');
let ExecuteQ=require('../../lib/Execute')
const AgentCommon = require('../../common/agent');
const { reject } = require('underscore');

var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD


/**
 * @des New login api for delivery company login
 * @param {*Object} req 
 * @param {*Object} res 
 */
const deliveryCompanyLogin=async (req,res)=>{
    try{
        let email=req.body.email;
        let password=req.body.password;

        let deviceToken=req.body.fcm_token || "";

        let client_ip = req.connection.remoteAddress;

        var ip_array = client_ip.split(":");

        var ip = ip_array[ip_array.length - 1];

        let date = new Date();
        let date1 = date.toISOString().split("T");

        let today_date = date1[0],response_data = {};

        let deliveryCompanyData = await ExecuteQ.Query(req.dbName,
            "select `name`,`id`,`is_block`,`email`,`password`,`device_token`,`is_verified` from delivery_companies where `email`=?",[email]);

        if(deliveryCompanyData && deliveryCompanyData.length>0){

            let encrypted_password = md5(password);
            if(parseInt(deliveryCompanyData[0].is_verified)!==1){
                sendResponse.sendSuccessData(response_data,
                    constant.responseMessage.NOT_VERIFIED, 
                    res, constant.responseStatus.SOME_ERROR);
            }else{
                if(encrypted_password==deliveryCompanyData[0].password){
                    // logger.debug("=====email+new DATE()=======",email+new Date());
                    let d = new Date();
                    d = d.getTime()
    
                    let access_token= await Universal.getEncryptData(email + d);
    
                    logger.debug("=======accesstoken=======",access_token)
    
                    await ExecuteQ.Query(req.dbName,"update delivery_companies set access_token=?,device_token=? where id=?",[access_token,deviceToken,deliveryCompanyData[0].id]);
    
    
                        response_data = {
                            "access_token": access_token,
                            "delivery_company_id": deliveryCompanyData[0].id,
                            "delivery_company_email": email,
                            "name":deliveryCompanyData[0].name
                        }
                    
    
    
                    sendResponse.sendSuccessData(response_data, constant.responseMessage.LOGGED_IN, res, constant.responseStatus.SUCCESS);  
                }
    
                else{
                    sendResponse.sendSuccessData(response_data,
                         constant.responseMessage.INCORRECT_CREDENTIALS, 
                         res, constant.responseStatus.SOME_ERROR);
                }
            }

        }

        else{
            response_data = {}
            sendResponse.sendSuccessData(response_data, 
                constant.responseMessage.INCORRECT_CREDENTIALS,
                 res, constant.responseStatus.SOME_ERROR);
        }
    
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}  

/**
 * @des New logout api for delivery company logout
 * @param {*Object} req 
 * @param {*Object} res 
 */
const deliveryCompanyLogout=async (req,res)=>{
    try{
        let access_token=req.headers.authorization || ""
        let query = "update delivery_companies set access_token='' where access_token=?"
        await ExecuteQ.Query(req.dbName,query,[access_token])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);  
    
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}  


module.exports={
    deliveryCompanyLogin:deliveryCompanyLogin,
    deliveryCompanyLogout:deliveryCompanyLogout
}