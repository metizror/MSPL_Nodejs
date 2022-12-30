/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an area's related action from admin panel
 * ==========================================================================
 */
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
const ExecuteQ = require('../../lib/Execute');

logger.level = config.get('server.debug_level');
var crypto = require('crypto')
    algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password =  consts.SERVER.CYPTO.PWD
var chunk = require('chunk');
       
/**
 * @desc used for listing an pincode of areas
 * @param {*Object} req 
 * @param {*Object} res 
 */
const PinCodeList=async (req,res)=>{
    try{
        var created_by=parseInt(req.user.id);
        var area_id=req.query.area_id;
        const areaData=await GetAreas(req.dbName,parseInt(area_id));
        const data=await GetPincodes(req.dbName,area_id);
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
}

const AddPin=async (req,res)=>{
    try{
        logger.debug("==================in start of AddPin==================")
        var aread_id=parseInt(req.body.area_id);
        var user_id=parseInt(req.user.id);
        console.log(req.user)
        logger.debug("===========in the AddPin=======================")
        var pincode=req.body.pincode,newPinArray=[];
        if(pincode && pincode.length>0){
            _.each(pincode,function(i){
                newPinArray.push(i)
                newPinArray.push(aread_id)
                newPinArray.push(user_id)
            })
        }
        var finaData=chunk(newPinArray,3);
        console.log("===pincode==",newPinArray,finaData);
        // var pinData=_.reduce(pincode,f)/
        const data=await AddPinCode(finaData);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for deletion an pincode
 * @param {*Object} req 
 * @param {*Object} res 
 */
const DeletePinCode=async (req,res)=>{
    try{
        var pin_id=req.body.id;
        var user_id=req.user.id;
        const data=await DeletePin(parseInt(pin_id),parseInt(user_id));
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
    }
    catch(err){
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for updating an pincode
 * @param {*Object} req 
 * @param {*Object} res 
 */
const UpdatePinCode=async (req,res)=>{
    try{
        var pin_id=req.body.id;
        var user_id=req.user.id;
        var pincode=req.body.pincode;
        await UpdatePin(pin_id,user_id,pincode)
        sendResponse.sendSuccessData({},constant.responseMessage,res,200);
    }
    catch(err){
        sendResponse.somethingWentWrongError(res)

    }
}


function UpdatePin(id,user_id,pincode){
    return new Promise((resolve,reject)=>{
        var sql="update pincode set `pincode`=? where `id`=?"
        multiConnection[dbName].query(sql,[pincode,id],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })
    })
}

function DeletePin(id,user_id){
    return new Promise((resolve,reject)=>{
        var sql="update pincode set deleted_by=? where id=?"
        multiConnection[dbName].query(sql,[user_id,id],function(err,data){
            if(err){
                reject(err)
            }
            else{
                resolve()
            }
        })
    })
}
function GetPincodes(dbName,id){
    return new Promise((resolve,reject)=>{
        var pinQuery="select `pincode`.`pincode`,`pincode`.`area_id`,`area`.`name`,`pincode`.`id` from pincode inner join area on area.id=pincode.area_id where area_id=? and deleted_by=? "
        multiConnection[dbName].query(pinQuery,[id,0],function(err,data){
                if(err){
                    reject(err)
                }
                else{
                    resolve(data)
                }
        })
    })
}

function AddPinCode(pinData){
    return new Promise((resolve,reject)=>{
        var addQuery="insert into pincode (`pincode`,`area_id`,`created_by`) values ?"
        var st=multiConnection[dbName].query(addQuery,[pinData],function(err,data){
            if(err){
                    reject(err)
                }
                else{
                    resolve()
                }
        })
    })
}

function GetAreas(dbName,id){
    return new Promise((resolve,reject)=>{
        var sql="select name from area where id=? and is_deleted=?";
        multiConnection[dbName].query(sql,[id,0],function(err,data){
            if(err){
                reject(err)
            }
            else{
                if(data && data.length>0){
                    resolve(data[0])
                }
                else{
                    reject(constant.areaMessage.INVALID_AREA)
                }
            }
        })
    })
}



const addGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let coordinates = req.body.coordinates;
        let name = req.body.name
        let polygon = ""
        logger.debug("++++coordinates+++++++coordinates++++++++++++++++++",
        coordinates)
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"
        logger.debug("=============polygon========",polygon)

        let result = await saveCoordinates(req.dbName,polygon,name);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}


const saveCoordinates = (dbName,coordinates,name)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            logger.debug("============coordinates--------------",coordinates)
            let query = "insert into admin_geofence_areas(coordinates,name,is_live) "
            query += "values (PolygonFromText(?),?,?)"
            let params = [coordinates,name,1 ]
            let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const updateGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)

        let coordinates = req.body.coordinates;
        let id = req.body.id
        let name = req.body.name

        let polygon = ""
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"

        let result = await updateCoordinates(req.dbName,polygon,id,name);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const updateCoordinates = (dbName,coordinates,id,name)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update admin_geofence_areas set coordinates= PolygonFromText(?), name=? "
                query += " where id = ?";
           let params = [coordinates,name,id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const deleteGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let id = req.body.id
    
        let result = await deleteCoordinates(req.dbName,id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const deleteCoordinates = (dbName,id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "delete from admin_geofence_areas  where id = ?";
           let params = [id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const listGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let skip = req.query.skip || 0
        let limit = req.query.limit || 1000
        let supplier_id = req.query.supplier_id || 0
        let result = await listCoordinates(req.dbName,skip,limit,supplier_id);


        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const listCoordinates = (dbName,skip,limit,supplier_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = `select aga.id,aga.name,coordinates,is_live,
            IF((select id from  supplier_assigned_geofence_areas
            where admin_geofence_id=aga.id and supplier_id=? limit 1 )>0,1,0) as is_assign
            from admin_geofence_areas aga limit ?,?`;

           let params = [supplier_id,skip,limit]
           let result =  await ExecuteQ.Query(dbName,query,params);


           if(result && result.length>0){
            for(const [index,i] of result.entries()){
                logger.debug("==i.coordinates===",i.coordinates)
                if(i.coordinates!=null || i.coordinates!=""){
                    i.coordinates = i.coordinates && i.coordinates.length>0?i.coordinates[0]:[]
                }
            }
        }


           let query1 = "select * from admin_geofence_areas  ";
           let params1 = []
           let result1 =  await ExecuteQ.Query(dbName,query1,params1);

           let data = {
                list : result,
                count: result1.length
           }
      
           logger.debug("=====result=======",result);
            resolve(data);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}



const assignUnassignGeofenceAreaToSupplier = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let geofenceIds = req.body.geofenceIds
        let supplier_id = req.body.supplier_id
        
        await ExecuteQ.Query(req.dbName,
            "delete from supplier_assigned_geofence_areas where supplier_id=?",
            [supplier_id]);
            
        for(const [index,i] of geofenceIds.entries()){
            let query = `insert into supplier_assigned_geofence_areas 
            (supplier_id,admin_geofence_id) values(?,?)`
            await ExecuteQ.Query(req.dbName,query,[supplier_id,i])
        }

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const activeDeactivateGeofence = async (req, res) => {
    let finalResponse = {};
    try {
        let is_live = req.body.is_live;
        let id = req.body.id;

        let query = "update admin_geofence_areas set is_live=? where id=?";
        let parms = [is_live,id]
        await ExecuteQ.Query(req.dbName,query,parms);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

module.exports={
    activeDeactivateGeofence:activeDeactivateGeofence,
    addGeoFence:addGeoFence,
    updateGeoFence:updateGeoFence,
    deleteGeoFence:deleteGeoFence,
    listGeoFence:listGeoFence,
    PinCodeList:PinCodeList,
    AddPin:AddPin,
    DeletePinCode:DeletePinCode,
    UpdatePinCode:UpdatePinCode,
    assignUnassignGeofenceAreaToSupplier:assignUnassignGeofenceAreaToSupplier
}
