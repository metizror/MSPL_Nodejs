var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var consts=require('./../../config/const')
var _ = require('underscore');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const ExecuteQ=require('../../lib/Execute')
var uploadMgr=require('../../lib/UploadMgr')

/**
 * @desc used for updating the place holders
 */


const updatePlaceHolders = async (req,res)=>{

    try{
        let key = req.body.key
        let app_url = ""
        let web_url = ""

        if(req.files.app){
            // app_url = await uploadMgr.uploadImage(req.files.app)
            app_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.app)
            
        }else{
            app_url = req.body.app
        }

        if(req.files.web){
            // web_url = await uploadMgr.uploadImage(req.files.web)
            web_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.web)
        }else{
            web_url = req.body.web
        }

        let dataToSave = '{"app" : "'+app_url+'","web" : "'+web_url+'"}'

        await placeholdersUpdate(res,req.dbName,key,dataToSave)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}
async function  placeholdersUpdate(res,dbName,key,value){
return new Promise(async(resolve,reject)=>{
    console.log("===========value======",value)
    try{
        let data=await ExecuteQ.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",[key])      
        if(data && data.length>0){
            let query2 = "update tbl_setting set value = ? where `key` = ?"
            await ExecuteQ.Query(dbName,query2,[value,key])
            resolve()
        }else{
            await ExecuteQ.Query(dbName,"insert into tbl_setting (`key`,`value`) values(?,?)",[key,value])
            resolve()
        }
    }catch(Err){
        logger.debug(Err)
        sendResponse.somethingWentWrongError(res);
    }
})
}

/**
 * @desc used for updating the place holders
 */


const updatePlaceHoldersV1 = async (req,res)=>{
    try{
        let key = req.body.key
        let app_url = ""
        let web_url = "";
        let message=req.body.message;
        if(req.files.app){
            // app_url = await uploadMgr.uploadImage(req.files.app)
            app_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.app)
        }else{
            app_url = req.body.app
        }

        if(req.files.web){
            // web_url = await uploadMgr.uploadImage(req.files.web)
            web_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.web)
        }else{
            web_url = req.body.web
        }

        let dataToSave = '{"app" : "'+app_url+'","web" : "'+web_url+'","message":"'+message+'"}'
        await placeholdersUpdate(res,req.dbName,key,dataToSave)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}
module.exports = {
    updatePlaceHolders : updatePlaceHolders,
    updatePlaceHoldersV1:updatePlaceHoldersV1
}