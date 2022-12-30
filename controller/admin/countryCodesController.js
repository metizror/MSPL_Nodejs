/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an country code related action from admin panel
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
var ExecuteQ=require('../../lib/Execute');

var crypto = require('crypto'),
    algorithm = confg.SERVER.CYPTO.ALGO,
    password =  confg.SERVER.CYPTO.PWD

/**
 * @desc used for adding countryCode
 * @param {*Object} req 
 * @param {*Object} res 
 */
const addUpdateCountryCode = async (req,res)=>{
    try{
        const {country_code,iso,flag_image,
            country_name,id} = req.body
        if(id!==undefined && id!==""){
            let query = `
            update country_codes set 
                country_code=?,iso=?,flag_image=?,country_name=?
            where id=?`;
            let params = [
                country_code,iso,flag_image,country_name,id
            ]
            await ExecuteQ.Query(req.dbName,query,params);  
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);        
  
        }else{
            let query = `
            insert into country_codes (
                country_code,iso,flag_image,country_name
            ) values(?,?,?,?)`;
            let params = [
                country_code,iso,flag_image,country_name
            ]
            await ExecuteQ.Query(req.dbName,query,params);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);        

        }
        
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @desc used for listing countryCodes
 * @param {*Object} req 
 * @param {*Object} res 
 */
const listCountryCodes = async (req,res)=>{
    try{
        const {limit,skip} = req.query

        let query = `select * from country_codes limit ?,?`;
        
        let data =  await ExecuteQ.Query(req.dbName,query,[skip,limit]);  

        let query1 = `select * from country_codes `;
        let data1 =  await ExecuteQ.Query(req.dbName,query1,[skip,limit]);  
        
        let final = {
            list : data,
            count : data1 && data1.length>0?data1.length:0
        }

        sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, 200);        
  
        
        
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

/**
 * @desc used for listing countryCodes
 * @param {*Object} req 
 * @param {*Object} res 
 */
const deleteCountryCodes = async (req,res)=>{
    try{
        const {id} = req.body

        let query = `delete from country_codes where id=?`;
        
        await ExecuteQ.Query(req.dbName,query,[id]);  

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);        
   
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}
module.exports={
    addUpdateCountryCode:addUpdateCountryCode,
    listCountryCodes:listCountryCodes,
    deleteCountryCodes:deleteCountryCodes
}

