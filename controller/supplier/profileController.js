var mysql = require('mysql');
var async = require('async');
var constant = require('../../routes/constant')
var connectionCntr = require('../../routes/connection')
var sendResponse = require('../../routes/sendResponse');
var uploadMgr = require('../../lib/UploadMgr')
var confg = require('../../config/const');
var _ = require('underscore');
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
let Execute = require('../../lib/Execute')
const common = require('../../common/agent');

const uploadDetails = async (req, res) => {
    try {
        let user = req.user;

        let paylaod = req.body;
        let data = {};

        let file = req.files != undefined ? req.files.business_certificate && req.files.business_certificate.originalFilename ? req.files.business_certificate : undefined : undefined;

        if (file) {
            paylaod.business_certificate = await uploadMgr.uploadImageFileToS3BucketNew(file);
        } else {
            paylaod.business_certificate = '';
        }

        console.log('paylaod', paylaod);

        let setSql = `${paylaod.passport_id ? `passport_id= ${connection.escape(paylaod.passport_id)},` : ""}
        ${paylaod.bank_details ? `bank_details= ${connection.escape(paylaod.bank_details)},` : ""}
        ${paylaod.business_certificate ? `business_certificate= ${connection.escape(paylaod.business_certificate)},` : ""}
        `;

        setSql = setSql.trim().slice(0, -1);

        let sql = `update supplier 
        set 
        ${setSql}
        where id=${connection.escape(user.supplier_id)}        
        `
        data = await Execute.Query(req.dbName, { sql: sql, nestTables: false }, [])
        console.log('data', data);


        return sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const addSupplierMinOrderDistancePrice = async (req, res) => {
    try {
        let payload = req.body

        let distance = payload.distance;
        let supplier_id = payload.supplier_id;
        let min_amount = payload.min_amount;
        
        let {id} = req.body

        if(id!==undefined && id!==0){
       
            let query = "update supplier_min_order_distance set distance=?,min_amount=? where id=?";
            
            
            await Execute.Query(req.dbName,query,[distance,min_amount,id]);  

        }else{

            let query = "insert into supplier_min_order_distance(distance,supplier_id,min_amount)";
            query += " value(?,?,?) ";
            
            await Execute.Query(req.dbName,query,[distance,supplier_id,min_amount]);
        }

        return sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const listSupplierMinOrderDistancePrice = async (req, res) => {
    try {
        let payload = req.query
        let supplier_id = payload.supplier_id
        
        let query = "select * from supplier_min_order_distance where supplier_id=?";
        
        let result = await Execute.Query(req.dbName,query,[supplier_id]);

        return sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const deleteSupplierMinOrderDistancePrice = async (req, res) => {
    try {
        let payload = req.body
        let id = payload.id
        
        let query = "delete from supplier_min_order_distance where id=?";
        
        let result = await Execute.Query(req.dbName,query,[id]);

        return sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}
const updateSupplierLanguage = async (req, res) => {
    try {
        let language_id = req.body.language_id;
        let supplier_id= req.supplier.supplier_id;
        let query = "update supplier set language_id=? where id=?";
         await Execute.Query(req.dbName,query,[language_id,supplier_id]);
        return sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch (Err) {
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

module.exports = {
    updateSupplierLanguage:updateSupplierLanguage,
    uploadDetails:uploadDetails,
    addSupplierMinOrderDistancePrice:addSupplierMinOrderDistancePrice,
    listSupplierMinOrderDistancePrice:listSupplierMinOrderDistancePrice,
    deleteSupplierMinOrderDistancePrice:deleteSupplierMinOrderDistancePrice
}