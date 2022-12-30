
var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var CONSTS=require('./../../config/const')
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var fs=require('fs')
var something = "Something went wrong";
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
logger.level = config.get('server.debug_level');
var AdminMail = "ops@royo.com";
var crypto = require('crypto');
    algorithm = CONSTS.SERVER.CYPTO.ALGO,
    crypto_password =  CONSTS.SERVER.CYPTO.PWD
var uploadMgr=require('../../lib/UploadMgr')
var FormData = require('form-data');
var request = require('request');
const runTimeDbConnection=require('../../routes/runTimeDbConnection')
const Agent=require('../../common/agent');
const Execute = require('../../lib/Execute');


const PromoType=(dbName,promo_code,language_id)=>{   
    return new Promise((resolve,reject)=>{
            var sql ='select id,firstTime,maxUsers,perUserCount,promoType from promoCode where promoCode = ? and isActive = 0 and isDeleted = 0 and (DATE(startDate) <= CURDATE() and DATE(endDate) >= CURDATE())';
            var stmt = multiConnection[dbName].query(sql, [promo_code], function (err, promoDetails) {      
                logger.debug("=================stmt.sql in promotype function==========",stmt.sql)
                if (err) {
                    var msg = "db error"
                    reject(msg)
                    // sendResponse.sendErrorMessage(msg,res,500);
                }
                else { 

                    logger.debug("=result=",promoDetails)    
                    if(promoDetails && promoDetails.length){      
                        resolve(promoDetails[0])
                    }else{
                        if(language_id == 14){
                            var msg = "Promo Code is not Valid "
                            reject(msg)
                        
                        }else{
                            var msg = "قسيمة الخصم غير صحيحة"
                            reject(msg)                
                        }
                    }
                }
            })
})

}

const ValidUser=(dbName,userId)=>{
    return new Promise((resolve,reject)=>{
        var validUser;
        var sql ='select id from orders where user_id = ?';
        multiConnection[dbName].query(sql, [userId], function (err, result) {
        // console.log("...........................userdid............",err,result);
            if (err) {
                var msg = "db error"
                sendResponse.sendErrorMessage(msg,res,500);
            }
            else {
                if(result && result.length){
                    validUser = result.length
                    resolve(validUser)
                }else{
                    validUser = 0;
                    resolve(validUser)
                }
            }
        })
})

}
const PromoUserUsed=(dbName,promoCode,userId)=>{
    return new Promise((resolve,reject)=>{
    var sql ='select userId from order_promo where promoCode = ? and userId = ? and redeemPromo = 1';
    multiConnection[dbName].query(sql, [promoCode,userId], function (err, result) {
         if (err) {
            var msg = "db error"
            reject(msg)
             //sendResponse.sendErrorMessage(msg,res,500);
        }
        else {
             if(result && result.length){
                promoUserUsed = result.length
                resolve(promoUserUsed)
            }else{
                promoUserUsed = 0;
                resolve(promoUserUsed)
            }
        }
    })
})
}
const TotalUserUsed=(dbName,promoCode)=>{
    return new Promise((resolve,reject)=>{
    var sql ='select userId from order_promo where promoCode = ? and redeemPromo = 1';
    multiConnection[dbName].query(sql, [promoCode], function (err, result) {
        if (err) {
            var msg = "db error"
            cb(msg)
            //  sendResponse.sendErrorMessage(msg,res,500);
        }
        else {
            if(result && result.length){
                totalUserUsed = result.length
                resolve(totalUserUsed)
            } else {
                totalUserUsed = 0;
                resolve(totalUserUsed)
            }
        }
    })
})
}
const PromoValidation = async (dbName, promo_code, language_id, user_id, validUser) => {
    return new Promise(async (resolve, reject) => {
        try {
            // logger.debug("==promo_data==",language_id)
            var crossTotalLimit = false, perUserLimit = false
            var promo_data = await PromoType(dbName, promo_code, language_id);
            // logger.debug("==promo_data==",promo_data)
            var valid_user = await ValidUser(dbName, user_id);
            // logger.debug("==valid_user==",valid_user)

            var promo_user_used = await PromoUserUsed(dbName, promo_code, user_id);
            // logger.debug("==promo_user_used==",promo_user_used);

            var total_user_used = await TotalUserUsed(dbName, promo_code);
            logger.debug("==promo_data==valid_user==promo_user_used==total_user_used=", promo_data, valid_user,

                promo_user_used, total_user_used);
            logger.debug("=-===============promo_data.firstTime", promo_data.firstTime)
            if (promo_data.firstTime == 0 || promo_data.firstTime == null) {
                if ((promo_data.maxUsers != 0) && (promo_data.maxUsers <= total_user_used)) {
                    if (language_id == 14) {
                        var msg = "Promo Code is already used"
                        reject(msg)
                    } else {
                        var msg = " لقد تم استخدام قسيمة الخصم مسبقا"
                        reject(msg)
                    }
                }
                else if ((promo_data.perUserCount != 0) && (promo_data.perUserCount <= promo_user_used)) {
                    if (language_id == 14) {
                        var msg = "Promo Code is already used"
                        reject(msg)
                    } else {
                        var msg = " لقد تم استخدام قسيمة الخصم مسبقا"
                        reject(msg)
                    }
                }
                else {
                    resolve()
                }
            } else if (valid_user == 0 && promo_data.firstTime == 1) {
                resolve()
            }

            else {
                if (language_id == 14) {
                    var msg = "Promo Code is not Valid "
                    reject(msg)
                    //sendResponse.sendErrorMessage(msg,res,400);
                } else {
                    var msg = "قسيمة الخصم غير صحيحة"
                    reject(msg)
                    //sendResponse.sendErrorMessage(msg,res,400);
                }
            }
        }
        catch (err) {
            reject(err)
        }
    })


}
const PromoData=(dbName,promo_code,language_id)=>{
    return new Promise((resolve,reject)=>{
        var sql ='select detailsJson,id,promoCode,promoDesc from promoCode where promoCode = ? and isActive = 0 and isDeleted = 0 and (DATE(startDate) <= CURDATE() and DATE(endDate) >= CURDATE())';
        multiConnection[dbName].query(sql, [promo_code], function (err, promoDetails) {      
            if (err) {
                var msg = "db error"
                reject(msg)
                // sendResponse.sendErrorMessage(msg,res,500);
            }
            else { 
                // logger.debug("=result=",promoDetails)    
                if(promoDetails && promoDetails.length){      
                    resolve(promoDetails)
                }else{
                    if(language_id == 14){
                        var msg = "Promo Code is not Valid "
                        reject(msg)
                    
                    }else{
                        var msg = "قسيمة الخصم غير صحيحة"
                        reject(msg)                
                    }
                }
            }
        })
})
}
/**
 * @description used for listing an promo code from user side
 * @param {*Object} req 
 * @param {*Object} res 
 */
const promoListing = async(req,res)=>{
    try{
        let limit=req.query.limit;
        let skip=req.query.skip;
        let categoryId = req.query.categoryId || 0;
        // let promo_code_type = req.query.promo_code_type==undefined?1:req.query.promo_code_type


        let supplierIds = req.query.supplierIds
        // let categoryId = req.query.categoryId
        let categoryCondition = "and supplierId IN("+supplierIds+")";

        if(categoryId !== undefined && parseInt(categoryId) !== 0) {
            categoryCondition = "and ( supplierId IN("+supplierIds+") or category="+categoryId+")"
        }
        
        
        let query2,query,params;
        logger.debug("=======supplierIds==>>",supplierIds.length);

        // let categoryCondition = "and supplierId IN("+supplierIds+")";

        // if(categoryId !== undefined && parseInt(categoryId) !== 0) {
        //     categoryCondition = "and ( supplierId IN("+supplierIds+") or category="+categoryId+")"
        // }

        if(parseInt(req.is_single_vendor)>0){
            query ='select pc.id, pc.name,pc.promoCode,pc.discountPrice,pc.promoDesc,pc.firstTime,pc.startDate,pc.endDate,pc.promo_user_subscription_type'
            query+= ' from promoCode pc where  pc.isActive = 0 ';
            query+= ' and pc.isDeleted = 0 and (DATE(pc.startDate) <= CURDATE() and DATE(pc.endDate) >= CURDATE())';
            query += ' group by pc.promoCode limit ?,?';
            params = [skip,limit]

            query2 ='select pc.id, pc.name,pc.promoCode,pc.discountPrice,pc.promoDesc,pc.firstTime,pc.startDate,pc.endDate,pc.promo_user_subscription_type'
            query2+= ' from promoCode pc where  pc.isActive = 0 ';
            query2+= ' and pc.isDeleted = 0 and (DATE(pc.startDate) <= CURDATE() and DATE(pc.endDate) >= CURDATE())';
            query2 += '   group by pc.promoCode';
            params2 = [] 
        }
        else{
                query ='select pc.id, pc.name,pc.promoCode,pc.discountPrice,pc.promoDesc,pc.firstTime,pc.startDate,pc.endDate,pc.promo_user_subscription_type'
                query+= ' from promoCode pc where  pc.isActive = 0 ';
                query+= ' and pc.isDeleted = 0 and (DATE(pc.startDate) <= CURDATE() and DATE(pc.endDate) >= CURDATE())';
                query += ' '+categoryCondition+'  group by pc.promoCode limit ?,?';
                params = [skip,limit]

                query2 ='select pc.id, pc.name,pc.promoCode,pc.discountPrice,pc.promoDesc,pc.firstTime,pc.startDate,pc.endDate,pc.promo_user_subscription_type'
                query2+= ' from promoCode pc where  pc.isActive = 0 ';
                query2+= ' and pc.isDeleted = 0 and (DATE(pc.startDate) <= CURDATE() and DATE(pc.endDate) >= CURDATE())';
                query2 += ' '+categoryCondition+'  group by pc.promoCode';
                params2 = []
        }

        let result = await Execute.Query(req.dbName,query,params);
        let result_count = await Execute.Query(req.dbName,query2,params2);

        let finalData = {
            list:result,
            count:result_count && result_count.length>0?result_count.length:0
        }

        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
      
    }
    catch(err){
        console.log("==ER!==",err);
        return sendResponse.sendErrorMessage(err,res,400);
    }
}

const voucherListing = async(req,res)=>{
    try{
        let limit=req.query.limit;
        let skip=req.query.skip;
        let query =' select * '
        query+= ' from promoCode pc where  pc.isActive = 0 ';
        query+= ' and pc.isDeleted = 0 and (DATE(pc.startDate) <= CURDATE() and DATE(pc.endDate) >= CURDATE())';
        query += '  and is_voucher=1  group by pc.promoCode limit ?,?';

        let params = [skip,limit]


        let query2 =' select * '
        query2+= ' from promoCode pc where  pc.isActive = 0 ';
        query2+= ' and pc.isDeleted = 0 and (DATE(pc.startDate) <= CURDATE() and DATE(pc.endDate) >= CURDATE())';
        query2 += '  and is_voucher=1  group by pc.promoCode';

        let params2 = []

        let result = await Execute.Query(req.dbName,query,params);
        let result_count = await Execute.Query(req.dbName,query2,params2);

        let finalData = {
            list:result,
            count:result_count && result_count.length>0?result_count.length:0
        }

        sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, 200);
      
    }
    catch(err){
        logger.debug("==ER!==",err);
        return sendResponse.sendErrorMessage(err,res,400);
    }
}

module.exports={
    PromoValidation:PromoValidation,
    PromoType:PromoType,
    PromoData:PromoData,
    promoListing:promoListing,
    voucherListing:voucherListing
}