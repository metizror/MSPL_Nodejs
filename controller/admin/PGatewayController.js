
var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var consts=require('./../../config/const')
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var something = "Something went wrong";
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var AdminMail = "ops@royo.com";
const ExecuteQ=require('../../lib/Execute')
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
var chunk = require('chunk');
let Execute=require('../../lib/Execute');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
/**
 * @description used for Enable/Add Payment Gateway
 * @param {*Object} req 
 * @param {*Object} res 
 */
const EnablePGateWay=async (req,res)=>{
    let status=req.body.status;
    let keyData=req.body.keyData
    try{
       var data= await UpdateKeyValue(req.dbName,keyData,status);
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch(err){    
        logger.debug("====ERR!==",err);    
        sendResponse.somethingWentWrongError(res);
    }
}

const UpdateKeyValue=(dbName,keyData,status)=>{
    return new Promise( async(resolve,reject)=>{
        try{
            var sql=""
            for(const i of keyData){
                sql+=" update `payment_gateways_credential` `pc` join `payment_gateways` `p` on `p`.`id`=`pc`.`payment_gateway_id`   set `pc`.`value`='"+i.value+"',"+
                " `pc`.`for_front_end`="+i.for_front_end+",`p`.`is_active`="+status+" where `pc`.`id`="+i.id+";"
            }
            // logger.debug("======SQL==",sql);
            await Execute.Query(dbName,sql,[])
            resolve()
        }
        catch(Err){
            logger.debug("===ERR!==",Err)
            reject(Err)
        }
    })
}


const addPaymentGatewaysArea=async (req,res)=>{
    try{
        logger.debug("=============1===========", req.body)
        let coordinates = req.body.coordinates;
        let payment_gateways = req.body.payment_gateways.join("#");
        let polygon = ""
        logger.debug("++++coordinates+++++++coordinates++++++++++++++++++",coordinates)
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"
        logger.debug("=============polygon========",polygon)
        let result = await saveCoordinatesOfAdmin(req.dbName,polygon,payment_gateways);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    }
    catch(err){    
        logger.debug("====ERR!==",err);    
        sendResponse.somethingWentWrongError(res);
    }
}

const saveCoordinatesOfAdmin = (dbName,coordinates,payment_gateways)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            logger.debug("============coordinates--------------",coordinates)
            let query = "insert into area(coordinates,payment_gateways) "
            query += "values (PolygonFromText(?),?)"
            let params = [coordinates,payment_gateways]
            let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}


const updatePaymentGatewaysArea=async (req,res)=>{
    try{
        logger.debug("=============1===========", req.body)
        let coordinates = req.body.coordinates;
        let payment_gateways = req.body.payment_gateways.join("#");
        let id = req.body.id
        let polygon = ""
        logger.debug("++++coordinates+++++++coordinates++++++++++++++++++",coordinates)
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"
        logger.debug("=============polygon========",polygon)
        let result = await updateCoordinatesOfAdmin(req.dbName,polygon,payment_gateways,id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    }
    catch(err){    
        logger.debug("====ERR!==",err);    
        sendResponse.somethingWentWrongError(res);
    }
}

const updateCoordinatesOfAdmin = (dbName,coordinates,payment_gateways,id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            logger.debug("============coordinates--------------",coordinates)
            let query = "update area set coordinates=PolygonFromText(?), payment_gateways=? "
            query += "where id = ?"
            let params = [coordinates,payment_gateways,id]
            let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const deletePaymentGatewaysCoordinate = async (req, res) => {
    try {
        logger.debug("=============1===========", req.body)
        let id = req.body.id
    
        let result = await deleteCoordinatesOfAdmin(req.dbName,id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const deleteCoordinatesOfAdmin = (dbName,id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "delete from area  where id = ?";
           let params = [id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}


const listPaymentGateways = async (req, res) => {
    try {
        logger.debug("=============1===========", req.query)
    
        let result = await listCoordinatesOfAdmin(req.dbName);
        if(result && result.length>0){
            for(const [index,i] of result.entries()){
                if(i.coordinates!==[] || i.coordinates!==null || i.coordinates!==""){
                    i.coordinates = i.coordinates[0]
                }
            }
        }
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const listCoordinatesOfAdmin = (dbName)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select id,coordinates,payment_gateways from area ";
           let params = []
           let result =  await ExecuteQ.Query(dbName,query,params);
        //    result.map(obj=>{
        //        obj.coordinates = obj.coordinates[0]
        //    })
           logger.debug("=====result=======",result);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}


module.exports={
    EnablePGateWay:EnablePGateWay,
    addPaymentGatewaysArea:addPaymentGatewaysArea,
    updatePaymentGatewaysArea:updatePaymentGatewaysArea,
    deletePaymentGatewaysCoordinate:deletePaymentGatewaysCoordinate,
    listPaymentGateways:listPaymentGateways
}