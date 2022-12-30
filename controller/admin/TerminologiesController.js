
/**
 * ==============================================================================
 * created by cbl-147
 * @description used for performing an terminology related action from admin
 * ===============================================================================
 */
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
 * @desc used for adding the terminologies
 */

const addTerminologies = async (req,res)=>{

    try{
        let key = req.body.key;
        let value = req.body.value;
        let is_status = req.body.is_status
        logger.debug("-===============key===value==add====",key,value)
            await insertTerminology(req.dbName,key,value,is_status)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

async function insertTerminology(dbName,key,value,is_status){
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "insert into terminologies(`key`,value,is_status) values(?,?,?)"
            let params = [key,value,is_status]
            await ExecuteQ.Query(dbName,sql,params)
            resolve();

        }catch(err){
            logger.debug("==================errr-==========",err);
            reject(err)
        }
    })
}
const updateTerminologies = async (req,res)=>{

    try{
        // let key = req.body.key;
        // let value = req.body.value;
        // let is_status = req.body.order_status
        // logger.debug("-===============key===value==update====",key,value)
        let terminologies = req.body.terminologies
        await updateTerminology(req.dbName,"terminology",terminologies)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}
async function  updateTerminology(dbName,key,value){
    console.log("===========value======",value)
    try{
        let query2 = "update tbl_setting set value = ? where `key` = ?"
        await ExecuteQ.Query(dbName,query2,[value,key])
    }catch(Err){
        logger.debug(Err)
        sendResponse.somethingWentWrongError(res);
    }
}


module.exports = {
    addTerminologies : addTerminologies,
    updateTerminologies : updateTerminologies
}