/**
 * ==========================================================================
 * created by cbl-147
 * @description used for performing an banner related action from admin panel
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
var Execute = require('../../lib/Execute')

/**
 * @desc used for Update banners
 * @param {*Object} req 
 * @param {*Object} res 
 */
const Update=async (req,res)=>{
    logger.debug("===========entered in update===================")
    try{ 

        let accessToken = req.body.accessToken
        let sectionId = req.body.sectionId
        let supplierId = req.body.supplierId
        let name = req.body.name
        let languageId = req.body.languageId
        let order = req.body.order==undefined || req.body.order=="" ?'0':req.body.order
        // let website_image = req.body.website_image
        // let phone_image = req.body.phone_image
        var startDate = req.body.startDate==undefined || req.body.startDate == null || req.body.startDate==""?"":req.body.startDate;
        var endDate = req.body.endDate==undefined || req.body.endDate == null || req.body.endDate==""?"":req.body.endDate;
        let activeStatus = req.body.activeStatus
        let categoryId = req.body.categoryId
        let branch_id = req.body.branch_id
        let banner_id = req.body.banner_id
        var flow_banner_type = req.body.flow_banner_type ? req.body.flow_banner_type : '';
        let website_image_url = ""
        let isBottom=req.body.isBottom || 0;
        let phone_image_url = ""

        let is_video = req.body.is_video!==undefined && req.body.is_video!==null &&
        req.body.is_video!==""?req.body.is_video:0

        let phone_video = req.body.phone_video!==undefined && req.body.phone_video!==null &&
        req.body.phone_video!==""?req.body.phone_video:""
        
        let website_video = req.body.website_video!==undefined && req.body.website_video!==null &&
        req.body.website_video!==""?req.body.website_video:""

        name = name.split("#")
        logger.debug("===========in banner advertisement controller============",order)
        languageId = languageId.split("#")

        if(req.files.website_image){
            website_image_url = await uploadImage(req.files.website_image)
        }else{
            website_image_url = req.body.website_image || "";
        }

        if(req.files.phone_image){
            phone_image_url = await uploadImage(req.files.phone_image)
        }else{
            phone_image_url = req.body.phone_image || "";
        }

        logger.debug("====================website image url=============",website_image_url)
        logger.debug("====================phone image url=============",phone_image_url,banner_id)
        await updateBanner(req.dbName,banner_id,flow_banner_type,accessToken,
            sectionId,supplierId,name,languageId,order,startDate,endDate,
            activeStatus,categoryId,branch_id,
            website_image_url,phone_image_url,isBottom,is_video,phone_video,website_video)
        await updateBannerEn(req.dbName,banner_id,name,languageId)
        await updateBannerAb(req.dbName,banner_id,name,languageId)
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);   
    }
    catch(Err){
        logger.debug("==============errrrrrrr========",Err)
        sendResponse.somethingWentWrongError(res);
    }
}

function updateBanner(dbName,banner_id,flow_banner_type,accessToken,sectionId,
    supplierId,name,languageId,order,startDate,endDate,activeStatus,
    categoryId,branch_id,website_image_url,phone_image_url,isBottom,is_video,phone_video,website_video){

    let sql = "update advertisements set is_bottom=?,supplier_id=?, name=?, orders=?, "+
    "start_date=?, end_date=?, is_active=?, category_id=?, branch_id=?, website_image=?, phone_image=?, flow_banner_type=?,is_video=?,phone_video=?,website_video=? where id=? "
    let params = [isBottom,supplierId,name[0],order,startDate,endDate,activeStatus,categoryId,branch_id,website_image_url,phone_image_url,
    flow_banner_type,is_video,phone_video,website_video,banner_id]
    return new Promise(async(resolve,reject)=>{
        await Execute.Query(dbName,sql,params);  
        resolve()
    })
}
function updateBannerEn(dbName,banner_id,name,languageId){
    let sql = "update advertisement_ml set name=? where advertisement_id=? and language_id=?"
    let params = [name[0],banner_id,languageId[0]]
    return new Promise(async (resolve,reject)=>{
       await Execute.Query(dbName,sql,params);
        resolve()
    })
}
function updateBannerAb(dbName,banner_id,name,languageId){
    let sql = "update advertisement_ml set name=? where advertisement_id=? and language_id=?"
    let params = [name[1],banner_id,languageId[1]]
    return new Promise(async(resolve,reject)=>{
        await Execute.Query(dbName,sql,params);
        resolve()
    })
}
function uploadImage(file){
    var imageArray=[],image;
    return new Promise(async (resolve,reject)=>{
           // for (const i of data)
        image=await uploadMgr.uploadImageFileToS3BucketNew(file)
        imageArray.push(image);
        logger.debug("===image==imageArray=",imageArray);
        resolve(image);
        // async.each(file,function(i,cb){
        //     await uploadMgr.uploadImage()
        // },function(err){
        //     if(err){
        //     }
        //     else{
        //     }
        // })
        
    })
}


const UpdateDefaulBanner=async (req,res)=>{
    logger.debug("===========entered in update===================")
    try{
        let query = ""
        let banner = ""
        if(req.files.banner_one){
            banner = await uploadImage(req.files.banner_one)
            query = "update tbl_setting set value=? where `key`='banner_one'"
        }

        if(req.files.banner_two){
            banner = await uploadImage(req.files.banner_two)
            query = "update tbl_setting set value=? where `key`='banner_two'"
        }

        if(req.files.banner_three){
            banner = await uploadImage(req.files.banner_three)
            query = "update tbl_setting set value=? where `key`='banner_three'"
        }

        if(req.files.banner_four){
            banner = await uploadImage(req.files.banner_four)
            query = "update tbl_setting set value=? where `key`='banner_four'"

        }

        let params = [banner]
        await Execute.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({banner_link:banner}, constant.responseMessage.SUCCESS, res, 200);   
    }
    catch(Err){
        logger.debug("==============errrrrrrr========",Err)
        sendResponse.somethingWentWrongError(res);
    }
}

const deleteDefaulBanner=async (req,res)=>{
    logger.debug("===========entered in update===================")
    try{
        let query = ""

        if(req.body.bannerkey=="banner_one"){
            query = "delete from tbl_setting where `key`='banner_one'"
        }

        if(req.body.bannerkey=="banner_two"){
            query = "delete from tbl_setting where `key`='banner_two'"
        }

        if(req.body.bannerkey=="banner_three"){
            query = "delete from tbl_setting where `key`='banner_three'"
        }

        if(req.body.bannerkey=="banner_three"){
            query = "delete from tbl_setting where `key`='banner_three'"
        }


        let params = []
        await Execute.Query(req.dbName,query,params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200);   
    }
    catch(Err){
        logger.debug("==============errrrrrrr========",Err)
        sendResponse.somethingWentWrongError(res);
    }
}

module.exports={
    Update:Update,
    UpdateDefaulBanner:UpdateDefaulBanner,
    deleteDefaulBanner:deleteDefaulBanner
}

