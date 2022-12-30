/**
 * ==========================================================================
 * created by cbl-146
 * @description used for performing an action related loyality points/level
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
var moment = require('moment')
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const common=require('../../common/agent');
let ExecuteQ=require('../../lib/Execute');
let Universal=require('../../util/Universal')
 /**
  * @description used for creating an loyality Level
  * @param {*Obbject} req 
  * @param {*Obbject} res 
  */
const addLoyalityLevel=async (req,res)=>{
    try{
        let name=req.body.name;
        let totalLoyalityPoints=req.body.totalLoyalityPoints;
        let isForAllCategory=req.body.isForAllCategory;
        let perPointOrderAmount=req.body.perPointOrderAmount;
        let perPointAmountType=req.body.perPointAmountType;
        let perPointAmount=req.body.perPointAmount;
        let supplierCateJson=[],finalValue;
        let description=req.body.description;
        logger.debug("==REQ=FILE==INPUT>>",typeof req.body.categoryData);
        await isDuplicacy(req.dbName,0,name,res);
        await haveSamePoints(req.dbName,0,totalLoyalityPoints,res);
        if(parseInt(isForAllCategory)==0){
            logger.debug("===Entering==")
            //  let stringifyData=JSON.stringify(req.body.categoryData)
             supplierCateJson=JSON.parse(req.body.categoryData)
        } 
        logger.debug("==REQ=FILE==INPUT>>",typeof req.body.categoryData);
        if(req.files.file){
            var fileName=req.files.file.name
            var fileExtension=fileName.substring(fileName.lastIndexOf(".")+1);
            logger.debug("==fileExtension=",fileExtension);
            if(fileExtension=="jpg" || fileExtension=="jpeg" || fileExtension=="png" || fileExtension=="gif")
            {
                   
                    let image=await uploadMgr.uploadImageFileToS3BucketNew(req.files.file);
                    logger.debug("=======IMAGE==>>",image);
                    let insertData=await ExecuteQ.Query(req.dbName,
                        `insert into loyality_level(
                            image,thumb_nail,
                            name,total_loyality_points,is_for_all_category,
                            per_point_order_amount,per_point_amount,
                            per_point_amount_type,description) values(?,?,?,?,?,?,?,?,?)`,
                            [
                                image,
                                image,
                                name,
                                totalLoyalityPoints,
                                isForAllCategory,
                                perPointOrderAmount,
                                perPointAmount,
                                perPointAmountType,
                                description
                            ])
                            if(supplierCateJson && supplierCateJson.length>0){
                                let dataTobeInserted=[];
                                for await (const [index,i] of supplierCateJson.entries()){
                                    logger.debug("=====I=>>",i)
                                    dataTobeInserted.push(insertData.insertId)
                                    dataTobeInserted.push(i.category_id)
                                    dataTobeInserted.push(i.supplier_id)
                                    dataTobeInserted.push(i.discount_price)
                                    dataTobeInserted.push(i.price_type)
                            }
                            finalValue=chunk(dataTobeInserted,5);
                            await ExecuteQ.Query(req.dbName,`insert into loyality_level_category_assignment(loyality_level_id,category_id,supplier_id,discount_price,price_type) values ?`,[finalValue]);
                            }
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
            }
            else{
                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);      
            }
        }
        else{
            let insertData=await ExecuteQ.Query(req.dbName,
                `insert into loyality_level(
                    name,total_loyality_points,is_for_all_category,
                    per_point_order_amount,per_point_amount,
                    per_point_amount_type,description) values(?,?,?,?,?,?,?)`,
                    [
                        name,
                        totalLoyalityPoints,
                        isForAllCategory,
                        perPointOrderAmount,
                        perPointAmount,
                        perPointAmountType,
                        description

                    ])
                    if(supplierCateJson && supplierCateJson.length>0){
                        let dataTobeInserted=[]
                        for await (const [index,i] of supplierCateJson.entries()){
                            dataTobeInserted.push(insertData.insertId)
                            dataTobeInserted.push(i.category_id)
                            dataTobeInserted.push(i.supplier_id)
                            dataTobeInserted.push(i.discount_price)
                            dataTobeInserted.push(i.price_type)
                    }
                    finalValue=chunk(dataTobeInserted,5);
                    await ExecuteQ.Query(req.dbName,`insert into loyality_level_category_assignment(loyality_level_id,category_id,supplier_id,discount_price,price_type) values ?`,[finalValue]);
                    }
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);      
        }

    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}




const addLoyalityLevelAdmin=async (req,res)=>{
    try{

        let {
            description,
            name,
            commission,
            image,
            total_orders 
        } = req.body;

        total_orders = total_orders || 0;
        
        let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);

        logger.debug("==REQ=FILE==INPUT>>",typeof req.body);

        let params =   [description,name,commission,image,total_orders]

        await ExecuteQ.QueryAgent(
            agentConnection,
            `insert into cbl_user_loyality_level(description,name,commission,image,total_orders) values(?,?,?,?,?,?)`,
            params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
    }

    catch(Err)
    {
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}




 /**
  * @description used for updating an loyality Level
  * @param {*Obbject} req 
  * @param {*Obbject} res 
  */
 const updateLoyalityLevel=async (req,res)=>{
    try{
        let name=req.body.name;
        let id=req.body.id
        let totalLoyalityPoints=req.body.totalLoyalityPoints;
        let isForAllCategory=req.body.isForAllCategory;
        let perPointOrderAmount=req.body.perPointOrderAmount;
        let perPointAmountType=req.body.perPointAmountType;
        let perPointAmount=req.body.perPointAmount;
        let description=req.body.description;
        let supplierCateJson=[],finalValue;
        logger.debug("==REQ=FILE==INPUT>>",typeof req.body.categoryData);
        await isDuplicacy(req.dbName,id,name,res);
        await haveSamePoints(req.dbName,id,totalLoyalityPoints,res);
        if(parseInt(isForAllCategory)==0){
            logger.debug("===Entering==")
            // let stringifyData=JSON.stringify(req.body.categoryData)
            supplierCateJson=JSON.parse(req.body.categoryData)
        } 
        logger.debug("==REQ=FILE==INPUT>>",typeof supplierCateJson,supplierCateJson);
        if(req.files.file){
            var fileName=req.files.file.name
            var fileExtension=fileName.substring(fileName.lastIndexOf(".")+1);
            logger.debug("==fileExtension=",fileExtension);
            if(fileExtension=="jpg" || fileExtension=="jpeg" || fileExtension=="png" || fileExtension=="gif")
            {
                   
                    let image=await uploadMgr.uploadImageFileToS3BucketNew(req.files.file);
                    logger.debug("=======IMAGE==>>",image);
                    let insertData=await ExecuteQ.Query(req.dbName,
                        `update loyality_level set description=?,image=?,thumb_nail=?,name=?,total_loyality_points=?,    is_for_all_category=?,per_point_order_amount=?,per_point_amount=?,per_point_amount_type=? where id=?`,
                            [
                                description,
                                image,
                                image,
                                name,
                                totalLoyalityPoints,
                                isForAllCategory,
                                perPointOrderAmount,
                                perPointAmount,
                                perPointAmountType,
                                id
                            ])
                            await ExecuteQ.Query(req.dbName,`delete from loyality_level_category_assignment where loyality_level_id=?`,[id]);
                            if(supplierCateJson && supplierCateJson.length>0){
                                let dataTobeInserted=[]
                                for await (const [index,i] of supplierCateJson.entries()){
                                    dataTobeInserted.push(insertData.insertId)
                                    dataTobeInserted.push(i.category_id)
                                    dataTobeInserted.push(i.supplier_id)
                                    dataTobeInserted.push(i.discount_price)
                                    dataTobeInserted.push(i.price_type)
                            }
                            finalValue=chunk(dataTobeInserted,5);
                            await ExecuteQ.Query(req.dbName,`insert into loyality_level_category_assignment(loyality_level_id,category_id,supplier_id,discount_price,price_type) values ?`,[finalValue]);
                            }
                    sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200); 
            }
            else{
                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);      
            }
        }
        else{
            let insertData=await ExecuteQ.Query(req.dbName,
                `update loyality_level set
                description=?,name=?,total_loyality_points=?,
                    is_for_all_category=?,
                    per_point_order_amount=?,per_point_amount=?,
                    per_point_amount_type=? where id=?`,
                    [
                        description,
                        name,
                        totalLoyalityPoints,
                        isForAllCategory,
                        perPointOrderAmount,
                        perPointAmount,
                        perPointAmountType,
                        id
                    ])
                if(supplierCateJson && supplierCateJson.length>0){
                    await ExecuteQ.Query(req.dbName,`delete from loyality_level_category_assignment where loyality_level_id=?`,[id]);
                    let dataTobeInserted=[],finalValue;
                    for await (const [index,i] of supplierCateJson.entries()){
                        dataTobeInserted.push(id)
                        dataTobeInserted.push(i.category_id)
                        dataTobeInserted.push(i.supplier_id)
                        dataTobeInserted.push(i.discount_price)
                        dataTobeInserted.push(i.price_type)
                }
                finalValue=chunk(dataTobeInserted,5);
                await ExecuteQ.Query(req.dbName,`insert into loyality_level_category_assignment(loyality_level_id,category_id,supplier_id,discount_price,price_type) values ?`,[finalValue]);
                }
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);      
        }

    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}




const updateAdminLoyalityLevel=async (req,res)=>{
    try{
        let {description,name,commission,image,total_orders,id} = req.body;
  
        total_orders = total_orders || 0;
        
        
        let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);

        
        let params =   [id,description,name,commission,image,total_orders,id]

        await ExecuteQ.QueryAgent(agentConnection, 
            `update cbl_user_loyality_level set description=?,name=?,commission=?,image=?,total_orders=? where id=?` ,params);
        
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}





const haveSamePoints=(dbName,id,totalLoyalityPoints,res)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let dupData,sql;
            sql=parseInt(id)==0?`select id from loyality_level where total_loyality_points=? and is_deleted=?`:`select id from loyality_level where total_loyality_points=? and is_deleted=? and id!=${id}`;

            dupData=await ExecuteQ.Query(dbName,sql,[totalLoyalityPoints,0]
            )
            if(dupData && dupData.length>0){
                sendResponse.sendErrorMessage(constant.responseMessage.SAME_TOTAL_LOYALITY_POINT, res, 400);  
                // reject(constant.responseMessage.DUPLICATE_ENTRY)
            }
            else{
                resolve()
            }
        }
        catch(Err){
            reject(Err)
        }

    })
}
const isDuplicacy=(dbName,id,name,res)=>{
 
    return new Promise(async (resolve,reject)=>{
        try{
            let dupData,sql;
            sql=parseInt(id)==0?`select id from loyality_level where name=? and is_deleted=?`:`select id from loyality_level where name=? and is_deleted=? and id!=${id}`;
            dupData=await ExecuteQ.Query(dbName,sql,[name,0])
            if(dupData && dupData.length>0){
                sendResponse.sendErrorMessage(constant.responseMessage.DUPLICATE_ENTRY, res, 400);  
                // reject(constant.responseMessage.DUPLICATE_ENTRY)
            }
            else{
                resolve()
            }
        }
        catch(Err){
            reject(Err)
        }

    })
}

const isAdminDuplicacy=(dbName,agentConnection,id,name,res)=>{
    
    return new Promise(async (resolve,reject)=>{
      
        try{
            let dupData,sql;
            sql=parseInt(id)==0?`select id from cbl_user_loyality_level where name=? and is_deleted=?`:`select id from cbl_user_loyality_level where name=? and is_deleted=? and id!=${id}`;
            dupData=await ExecuteQ.QueryAgent(agentConnection,sql,[name,0])
            if(dupData && dupData.length>0){
                sendResponse.sendErrorMessage(constant.responseMessage.DUPLICATE_ENTRY, res, 400);  
                // reject(constant.responseMessage.DUPLICATE_ENTRY)
            }
            else{
                resolve()
            }
        }
        catch(Err){
            reject(Err)
        }

    })
}
/**
 * @description used for lising an loyality level with pagination
 * @param {*Object} req 
 * @param {*Object} res 
 */
const listLoyalityLevel=async (req,res)=>{
    try{
        let limit=req.query.limit;
        let offset=req.query.offset;
        let countData=await ExecuteQ.Query(req.dbName,`select COUNT(*) as totalCount from loyality_level where is_deleted=?`,[0]);
        let levelData=await ExecuteQ.Query(req.dbName,`select description,id,name,image,thumb_nail,total_loyality_points,is_for_all_category,per_point_order_amount,per_point_amount,per_point_amount_type from loyality_level where is_deleted=?`,[0]);
        for await(const [index,i] of levelData.entries()){
            i.categoryData=await ExecuteQ.Query(req.dbName,"select lc.id,lc.loyality_level_id,lc.category_id,lc.discount_price,lc.price_type,lc.supplier_id from loyality_level_category_assignment lc left join categories c on c.id=lc.category_id where lc.loyality_level_id=?",[i.id])
        }
        sendResponse.sendSuccessData({levelData:levelData,countData:countData}, constant.responseMessage.SUCCESS, res, 200);  
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for soft delete an loyality level
 * @param {*Object} req 
 * @param {*Object} res 
 */
const deleteLoyalityLevel=async(req,res)=>{
    try{
        let id=req.body.id;
        await ExecuteQ.Query(req.dbName,`update loyality_level set is_deleted=? where id=?`,[1,id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);  
    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const listAdminLoyalityLevel=async (req,res)=>{
    let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
    let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
    try{
        let limit=req.query.limit;
        let offset=req.query.offset;

        let countData=await ExecuteQ.QueryAgent(agentConnection,`select COUNT(*) as totalCount from cbl_user_loyality_level where is_deleted=?`,[0]);

        let levelData=await ExecuteQ.QueryAgent(agentConnection,`select id,description,name,image,commission from cbl_user_loyality_level where is_deleted=? limit ?,? `,[0,offset,limit]);
        
        if(countData && countData.length>0){
            countData = countData[0].totalCount
        }else{
            countData =  0;
        }

        sendResponse.sendSuccessData({levelData:levelData,count:countData}, constant.responseMessage.SUCCESS, res, 200);  
    }

    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for soft delete an loyality level
 * @param {*Object} req 
 * @param {*Object} res 
 */
const deleteAdminLoyalityLevel=async(req,res)=>{
    let getAgentDbData=await common.GetAgentDbInformation(req.dbName); 
    let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
    try{

        let id=req.body.id;
        await ExecuteQ.QueryAgent(agentConnection,`update cbl_user_loyality_level set is_deleted=? where id=?`,[1,id]);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);  

    }
    catch(Err){
        logger.error("======ERR!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
}
 module.exports={
    addLoyalityLevel:addLoyalityLevel,
    udateLoyalityLevel:updateLoyalityLevel,
    listLoyalityLevel:listLoyalityLevel,
    deleteLoyalityLevel:deleteLoyalityLevel,
    addLoyalityLevelAdmin:addLoyalityLevelAdmin,
    listAdminLoyalityLevel:listAdminLoyalityLevel,
    deleteAdminLoyalityLevel:deleteAdminLoyalityLevel,
    updateAdminLoyalityLevel:updateAdminLoyalityLevel
    
 }