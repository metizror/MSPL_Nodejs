/**
 * ==============================================================================
 * created by cbl-147
 * @description used for performing an subadmin related action from super admin
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


const subAdminList = async (req,res)=>{

    try{
        let getList = await getAdminList(req.dbName,req.user.id,req.query.limit,req.query.offset,req.query.search)
        // logger.debug("==========getList--==============",getList)
        sendResponse.sendSuccessData(getList, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

function getAdminList(dbName,adminId,limit,offset,search){
    return new Promise(async(resolve,reject)=>{
        try{
            let checkSuperAdminOrNot = await checkForSuperAdmin(dbName,adminId)
            let query;
            let params;
            let count_params;
            let count_query;
            if(checkSuperAdminOrNot){
                query = "select id,email,phone_number,is_superadmin,is_active,created_on from admin where id != ? and email like '%"+search+"%' LIMIT ?,?"
                params = [adminId,offset,limit]
                count_params = [adminId]
            }else{
                query = "select id,email,phone_number,is_superadmin,is_active,created_on from admin where is_superadmin = ? and id != ? and email like '%"+search+"%' LIMIT ?,?"
                params = [0,adminId,offset,limit]
                count_params = [0,adminId]
            }
            

            count_query = query.replace('LIMIT ?,?',"")
            let result = await ExecuteQ.Query(dbName,query,params)
            let count_result = await ExecuteQ.Query(dbName,count_query,count_params)
            let final = {
                count : count_result.length,
                list : result
            }
            resolve(final)
        }catch(err){
            logger.debug("==============erre===============",err)
            reject(err)
        }   
    })

}

function checkForSuperAdmin(dbName,adminId){
    return new Promise(async(resolve,reject)=>{
        try{
            let sql = "select is_superadmin from admin where id=?"
            let params = [adminId]
            let result = await ExecuteQ.Query(dbName,sql,params);
            let is_superadmin = result[0].is_superadmin
            resolve(is_superadmin)
        }catch(err){
            logger.debug("=============errrr=======",err)
            reject(err)
        }
    })
}

module.exports = {
    subAdminList : subAdminList
}