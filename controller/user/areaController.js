var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var consts=require('./../../config/const')
const lib=require('../../lib/NotificationMgr')
var _ = require('underscore');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784","782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var AdminMail = "ops@royo.com";

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const Universal = require('../../util/Universal')
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
var chunk = require('chunk');

/**
 * @desc used for listing an pincode of areas
 * @param {*Object} req 
 * @param {*Object} res 
 */
const GetArea=async (req,res)=>{
    try{
        var pincode=req.body.pincode;
        var languageId=req.body.languageId!=undefined && req.body.languageId!=""?req.body.languageId:14;
       logger.debug("============dbName in GetArea=================",req.dbName)
        const data=await Areas(parseInt(pincode),languageId,req.dbName);

        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        console.log(err)
        return sendResponse.sendErrorMessage(err,res,400);
    }
}

function Areas(pincode,languageId,dbName){
    logger.debug("===========db name in area==========",dbName)
    var final=[];
    return new Promise((resolve,reject)=>{
        var sql="select city.id as country_id,area.id as area_id from pincode inner join area on area.id=pincode.area_id inner join zone on zone.id=area.zone_id inner join city on city.id=zone.city_id  where pincode.`pincode`=? and area.is_deleted=? and pincode.deleted_by=? ;";
         var st= multiConnection[dbName].query(sql,[pincode,0,0],async function(err,data){
              console.log(st.sql)
            if(err){
                reject(err)
            }
            else{
                if(data && data.length>0){
                    var names;
                    for (const i of data) {
                        names=await areaMl(dbName,i.area_id,pincode),
                        
                        final.push({
                            area_id:i.area_id,    
                            country_id:i.country_id,                       
                            name:names
                        })
                    }
                    resolve(final)
                }   
                else{
                    reject(constant.areaMessage.AREA_NOT_FOUND)
                }
            }
        })

    })
}

function areaMl(dbName,id,pincode){
   
    return new Promise((resolve,reject)=>{
         var sql="select name,language_id from area_ml where area_id=?";
         var st= multiConnection[dbName].query(sql,[id],function(err,data){
            // logger.debug(st.sql)
            if(err){
                reject(err)
            }
            else{
                // logger.debug("=DATA=!=",data)
                resolve(data)
            }
        })

    })
    
    
}


/**
 * @desc used for getting the user zone
 * @param {*Object} req 
 * @param {*Object} res 
 */
const GetUserZone = async (req,res)=>{
    try{
        let {latitude,longitude} = req.query
        let data = await Universal.checkUserZone(req.dbName,latitude,longitude);

        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        console.log(err)
        return sendResponse.sendErrorMessage(err,res,400);
    }
}


module.exports={
    GetArea:GetArea,
    GetUserZone:GetUserZone
}
