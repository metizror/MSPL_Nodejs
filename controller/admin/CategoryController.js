/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an category related action from admin panel
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
 * @desc used for adding an brand in category
 * @param {*Object} req 
 * @param {*Object} res 
 */
const AddBrandToCat=async (req,res)=>{
    logger.debug("===========+++++++DD")
    var cat_id=req.body.cat_id;
    var brandIds=req.body.brandIds;
    logger.debug("====brand_name=user=",req.user,req.body);

    try{
        var data=await IsBrandAlreadyExist(req.dbName,cat_id,brandIds);
        if(data && data.length>0){
            sendResponse.sendErrorMessage(constant.brandAlreadyExist.ALREADY_EXIST, res, 400); 
        }
        else{
            await AddBrandInCat(req.dbName,parseInt(req.user.id),parseInt(cat_id),brandIds);
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);
        }
    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}
const BrandListAccCat=async (req,res)=>{
    logger.debug("=====DD===========",req.body);
    var cat_id=req.query.cat_id;
    logger.debug("====brand_name=user=",cat_id,req.user,req.body);
    try{
        // logger.debug("=============brandList request.dbName=================",req.dbName);
        var data=await BrandList(req.dbName,cat_id);
        logger.debug("====================after called brand list ============")
        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);        
    }
    catch(Err){
        logger.debug("========error in BrandListAccCat==========================")
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }

}


function BrandList(dbName,catIds){
    var final=[];
    return new Promise(async (resolve,reject)=>{
        var brandQuery="select br.id,br.name,br.description,br.image from cat_brands cb inner join brands br on br.id=cb.brand_id where cb.cat_id=? and cb.deleted_by=? and br.deleted_by=?"
        let data=await ExecuteQ.Query(dbName,brandQuery,[parseInt(catIds),0,0])
        // var stat = multiConnection[dbName].query(brandQuery,[parseInt(catIds),0,0],async function(err,data){
        //     // logger.debug("====ERR!=",err);
        //     if(err){

        //         logger.debug("============err in brandquery===========",stat.sql,err)
        //         reject(err)
        //     }
        //     else{
                logger.debug("===DATA!===",data)
                if(data && data.length>0){




                    
                    var names;
                    for (const i of data) {
                        names=await brandMl(dbName,i.id);
                        final.push({
                            id:i.id,
                            description:i.description,
                            image:i.image,
                            names:names,
                            name:i.name
                        })
                    }
                    resolve(final)
                }   
                else{
                    resolve(final)
                }             
              
        //     }
        // });
    });
}

function brandMl(dbName,id){
    return new Promise(async (resolve,reject)=>{
        try{
            var sql="select name,language_id from brands_ml where brand_id=?"
            let data=await ExecuteQ.Query(dbName,sql,[id]);
            resolve(data)
        }
        catch(Err){
            reject(Err)
        }
})

} 


const UpdateBrandFromCat=async (req,res)=>{
    var brandIds=req.body.brandIds
    var catIds=req.body.cat_id
    try{
        var data=await IsBrandAlreadyExist(req.dbName,catIds,brandIds)
        var update= await AddBrandInCat(req.dbName,parseInt(req.user.id),parseInt(cat_id),brandIds);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
    }
    catch(err){
        sendResponse.somethingWentWrongError(res);
    }

}
const DeleteBrandFromCat=async (req,res)=>{
    var Id=req.body.brandIds
    var cat_id=req.body.cat_id

    try{
        // var data=await IsBrandAlreadyExist(catIds,brandIds)
        var update= await DeleteBrand(req.dbName,parseInt(req.user.id),parseInt(cat_id),Id);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
    }
    catch(err){
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }

}
function DeleteBrand(dbName,user_id,cat_id,brand_id){
        logger.debug("=====user_id,cat_id,brand_id=====",user_id,cat_id,brand_id);   
        return new Promise(async (resolve,reject)=>{
            try{
                var dmlQuery="update cat_brands set deleted_by=? where cat_id=? and brand_id IN (?)"
                await ExecuteQ.Query(dbName,dmlQuery,[user_id,cat_id,brand_id]);
                resolve()
            }
            catch(Err){
                reject(Err)
            }
        })    

}

function IsBrandAlreadyExist(dbName,cat_id,brandIds){
    var brandId=brandIds.join();
    return new Promise(async (resolve,reject)=>{
        try{
           var dmlQuery="select id from cat_brands where brand_id IN(?) and cat_id=? and deleted_by=?";
           let data=await ExecuteQ.Query(dbName,dmlQuery,[brandId,cat_id,0])
           resolve(data);
        }
        catch(Err){
            reject(Err)
        }
    })
}

function AddBrandInCat(dbName,user_id,cat_id,brandIds){
    logger.debug("==brandIds=",user_id,cat_id,brandIds);

    var finalValue=[];
    _.each(brandIds,function(i){
        finalValue.push(cat_id,user_id,i)
    })
    var valueToInsert=chunk(finalValue,3);
    logger.debug("===valueToInsert============",valueToInsert);
    return new Promise(async (resolve,reject)=>{
        try{
        var ddlQuery="insert into cat_brands (`cat_id`,`created_by`,`brand_id`) values ? "
        await ExecuteQ.Query(dbName,ddlQuery,[valueToInsert])
        resolve();
        }
        catch(Err){
            reject(Err)
        }
    })

}

const orderByMainCategoriesSequence = async (req,res)=>{
    try{
        let categoryOrders = req.body.categoryOrders;
        
        if(categoryOrders && categoryOrders.length>0){
            for(const [index,i] of categoryOrders.entries()){
                let query = `update categories set sequence_no=? where id=?`
                await ExecuteQ.Query(req.dbName,query,[i.sequence_no,i.id]);
            }

        }
        
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
    }
    catch(err){
        logger.error(err);
        sendResponse.somethingWentWrongError(res);
    }

}


const addCategoryGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let coordinates = req.body.coordinates;
        let category_id = req.body.category_id
        let polygon = ""
        logger.debug("++++coordinates+++++++coordinates++++++++++++++++++",
        coordinates)
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"
        logger.debug("=============polygon========",polygon)

        let result = await saveCoordinates(req.dbName,polygon,category_id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}


const saveCoordinates = (dbName,coordinates,category_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            logger.debug("============coordinates--------------",coordinates)
            let query = "insert into categories_areas(coordinates,category_id) "
            query += "values (PolygonFromText(?),?)"
            let params = [coordinates,category_id ]
            let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const updateCategoryGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)

        let coordinates = req.body.coordinates;
        let id = req.body.id

        let polygon = ""
        for (const [index, i] of coordinates.entries()) {
            polygon += i.x + " " + i.y + ","
        }
        polygon = polygon.substring(0, polygon.length - 1)
        polygon = "polygon((" + polygon + "))"

        let result = await updateCoordinates(req.dbName,polygon,id);

        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const updateCoordinates = (dbName,coordinates,id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "update categories_areas set coordinates= PolygonFromText(?)"
                query += " where id = ?";
           let params = [coordinates,id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const deleteCategoryGeoFence = async (req, res) => {
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
            let query = "delete from categories_areas  where id = ?";
           let params = [id]
           let result =  await ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(e){
            logger.debug("==========err=+++++",e);
            reject(e)
        }
    })
}

const listCategoryGeoFence = async (req, res) => {
    let finalResponse = {};
    try {
        logger.debug("=============1===========", req.body)
        let category_id = req.query.category_id
    
        let result = await listCoordinates(req.dbName,category_id);

        if(result && result.length>0){
            for(const [index,i] of result.entries()){
                logger.debug("==i.coordinates===",i.coordinates)
                if(i.coordinates!=null || i.coordinates!=""){
                    i.coordinates = i.coordinates && i.coordinates.length>0?i.coordinates[0]:[]
                }
            }
        }
        sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        logger.debug("=======ere in list suppliers==========", err)
        sendResponse.somethingWentWrongError(res)
    }
}

const listCoordinates = (dbName,category_id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select id,category_id,coordinates from categories_areas  where category_id = ?";
           let params = [category_id]
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

/**
 * @desc used for assigning category timings
 * @param {*Object} req 
 * @param {*Object} res 
 */
const addCategoryTimings = async (req,res)=>{
    try{
        let {category_id,supplier_id,startTime,endTime,weekday} = req.body
        let query = `update supplier_category set weekday=?, start_time=?, end_time=? where supplier_id=? and category_id=? `;
        await ExecuteQ.Query(req.dbName,query,[weekday,startTime,endTime,category_id,supplier_id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    }
    catch(Err){
        logger.error(Err);
        sendResponse.somethingWentWrongError(res);
    }
}

module.exports={
    addCategoryTimings:addCategoryTimings,
    AddBrandToCat:AddBrandToCat,
    DeleteBrandFromCat:DeleteBrandFromCat,
    UpdateBrandFromCat:UpdateBrandFromCat,
    BrandListAccCat:BrandListAccCat,
    orderByMainCategoriesSequence:orderByMainCategoriesSequence,
   
    addCategoryGeoFence:addCategoryGeoFence,
    updateCategoryGeoFence:updateCategoryGeoFence,
    deleteCategoryGeoFence:deleteCategoryGeoFence,
    listCategoryGeoFence:listCategoryGeoFence
}