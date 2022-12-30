/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an password of supplieraction from admin panel
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
var Execute = require('../../lib/Execute')

/**
 * @desc used for adding an brand in category
 * @param {*Object} req 
 * @param {*Object} res 
 */
const update=async (req,res)=>{
    try{
         let password = req.body.password
         let adminId = req.user.id
         await resetAdminPassword(req.dbName,adminId,password)

        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}
const resetSupplierPassword=async (req,res)=>{
    try{
        let password = req.body.password
        let adminId = req.supplier.supplier_id
        await resetPassword(req.dbName,adminId,password)
        sendResponse.sendSuccessData({},constant.responseMessage.SUCCESS, res, 200);
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

function resetAdminPassword(dbName,adminId,password){
    return new Promise(async(resolve,reject)=>{
        password = md5(password)
        let sql = "update admin set password = ? where id = ?"
        let params = [password,adminId]
        let data = await Execute.Query(dbName,sql,params)
        resolve(data)
    })
}
function resetPassword(dbName,supplierId,password){
    return new Promise(async(resolve,reject)=>{
        password = md5(password);
        let sql = "update supplier join supplier_admin on supplier_admin.supplier_id=supplier.id set supplier.password = ?,supplier_admin.password=? where supplier.id = ?"
        let params = [password,password,supplierId]
        let data = await Execute.Query(dbName,sql,params)
        resolve(data);
    })
}

module.exports={
    update:update,
    resetSupplierPassword:resetSupplierPassword
}