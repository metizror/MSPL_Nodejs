let mysql = require('mysql');
let async = require('async');
let constant=require('../../routes/constant')
let connectionCntr=require('../../routes/connection')
let sendResponse = require('../../routes/sendResponse');
let uploadMgr=require('../../lib/UploadMgr')
let confg=require('../../config/const');
let _ = require('underscore'); 
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const model=require('../../Model')
/**
 * @description used for operation related an customized comission
 */
class customizedcommision{
    /**
     * @description used for listing an customized commision list
     * @param {*Object} req 
     * @param {*Object} res 
     * @param {*Callback} next 
     */
   static async list(req,res,next){
        try{
            let comission=[];
            let commision=new model.commision.admin(req.dbName);
            await Promise.all(await commision.find()).then(
                (data)=>{
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
            }
            ).catch(
                (Err)=>{
                sendResponse.sendErrorMessage(constant.responseMessage.INTERNAL_SERVER_ERROR, res, 400)
            }
            )
        }
        catch(Err){
            sendResponse.sendErrorMessage(constant.responseMessage.ERROR_IN_EXECUTION, res, 400)
        }
   }
   /**
    * @description used for an updating an customized commision
    * @param {*Object} req 
    * @param {*Object} res 
    * @param {*Callback} next 
    */
   static async update(req,res,next){
    try{
        let promises=[];
        let minimum_amount=req.body.minimum_amount;
        let below_commission_type=req.body.below_commission_type;
        let below_commission_amount=req.body.below_commission_amount;
        let above_commission_amount=req.body.above_commission_amount;
        let above_commission_type=req.body.above_commission_type;
        let minimum_cart_fee=req.body.minimum_cart_fee;
        let id=req.body.id;
        let commision=new model.commision.admin(req.dbName,minimum_amount,below_commission_type,below_commission_amount,above_commission_type,above_commission_amount,minimum_cart_fee,id);
        let supplier=new model.supplier.commision(req.dbName,below_commission_amount);
        promises.push(await commision.update());
        promises.push(await supplier.update());
        await Promise.all(promises).then(
            (data)=>{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
        ).catch(
            (Err)=>{
                logger.debug("=Err====>>",Err)
            sendResponse.sendErrorMessage(constant.responseMessage.INTERNAL_SERVER_ERROR, res, 400)
        }
        )
    }
    catch(Err){
        logger.debug(
            "=Err!=>",Err
        )
        sendResponse.sendErrorMessage(constant.responseMessage.ERROR_IN_EXECUTION, res, 400)
    }
}
}
module.exports={
    customizedcommision:customizedcommision
}