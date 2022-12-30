/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an policy related action from admin panel
 * ==========================================================================
 */
var mysql = require('mysql');
var async = require('async');
var constant=require('../../routes/constant')
var connectionCntr=require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr=require('../../lib/UploadMgr')
var confg=require('../../config/const');
var _ = require('underscore'); 
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
var ExecuteQ = require('../../lib/Execute')

var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD


/**
 * 
 * @param {Object} req 
 * @param {*Object} res 
 */
const List=async (req,res)=>{
    try
    {   
        let dataToSend = {};

        dataToSend.status_refund_types = await getStatusRefundTypes(req.dbName);
        dataToSend.min_time = await getRefundTimings(req.dbName);
        dataToSend.partial_refund = await getRefundTypes(req.dbName);

        sendResponse.sendSuccessData(dataToSend, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        sendResponse.somethingWentWrongError(err)
    }
}


const getStatusRefundTypes = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from cancellation_policy"
            let data = await ExecuteQ.Query(dbName,query,[]);
            resolve(data)
        }catch(err){
            logger.debug("========ere========",err)
            reject(err)
        }
    })
}

const getRefundTimings = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from refund_timings"
            let data = await ExecuteQ.Query(dbName,query,[]);
            resolve(data)
        }catch(err){
            logger.debug("========ere========",err)
            reject(err)
        }
    })
}

const getRefundTypes = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from refund_types"
            let data = await ExecuteQ.Query(dbName,query,[]);
            resolve(data)
        }catch(err){
            logger.debug("========ere========",err)
            reject(err)
        }
    })
}



/**
 * @desc used for Update an variant value
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Update = async (req, res) => {
    try {
        let status_refund_types = req.body.status_refund_types;
         let min_time = req.body.min_time;
        let partial_refund = req.body.partial_refund;


        await updateRefundStatusTypes(req.dbName,status_refund_types);
        await updateMinTime(req.dbName,min_time);
        await updateRefundTypes(req.dbName,partial_refund)

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        // con
        console.log("==============errrrrrrr========", Err)
        sendResponse.somethingWentWrongError(res);
    }
}

const updateRefundStatusTypes = async (dbName,status_refund_types)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update cancellation_policy set status=?, refund_type= ? where id=?"
            for(const [index,i] of status_refund_types.entries()){
                await ExecuteQ.Query(dbName,query,[i.status,i.refund_type,i.id]);
            }
            resolve();
        }catch(err){
            logger.debug("================errr==============",err);
            reject(err);
        }

    })
}

const updateMinTime = async (dbName,min_time)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update refund_timings set min_time=? where id=? limit 1";
            await ExecuteQ.Query(dbName,query,[min_time.min_time,min_time.id])

            resolve();
        }catch(err){
            logger.debug("================errr==============",err);
            reject(err);
        }

    })
}

const updateRefundTypes = async (dbName,partial_refund)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update refund_types set value=?,is_flat=? where id=? limit 1";
            await ExecuteQ.Query(dbName,query,[partial_refund.value,partial_refund.is_flat,partial_refund.id]);
            resolve();            
        }catch(err){
            logger.debug("==============errr===========",err)
            reject(err)
        }
    })
}
module.exports={
    List:List,
    Update:Update
}

