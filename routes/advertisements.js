var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');
var pushNotifications = require('./pushNotifications');
var adminOrders=require('./adminOrders');
var moment = require('moment');


var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const ExecuteQ=require('../lib/Execute')

const uploadMgr = require('../lib/UploadMgr')


/**
 * @description used for adding banner from admin panel
 */

exports.addBannerAdvertisement = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    // var fees = req.body.fees;
    var startDate = req.body.startDate==undefined || req.body.startDate == null || req.body.startDate==""?"":req.body.startDate;
    var endDate = req.body.endDate==undefined || req.body.endDate == null || req.body.endDate==""?"":req.body.endDate;
    var phone_image = req.files.phone_image || "";
    var website_image = req.files.website_image || "";
    console.log("=========phone and web image================",phone_image,website_image)
    var activeStatus = req.body.activeStatus;
    // var areaIds = req.body.areaIds;
    var branch_id = req.body.branch_id
    console.log("==========req.body.branchid",branch_id,req.body.branch_id)
    var categoryId = req.body.categoryId;
    var bannerType=req.body.bannerType!=undefined?req.body.bannerType:0;
    let isBottom=req.body.isBottom || 0;
    var flow_banner_type = req.body.flow_banner_type ? req.body.flow_banner_type : '';
    if(req.body.order){
        var order = req.body.order;
    }else{
        var order = 0;
    }
   
    let is_video = req.body.is_video!==undefined && req.body.is_video!==null &&
    req.body.is_video!==""?req.body.is_video:0
    


    let phone_video = req.body.phone_video!==undefined && req.body.phone_video!==null &&
    req.body.phone_video!==""?req.body.phone_video:""

    let website_video = req.body.website_video!==undefined && req.body.website_video!==null &&
    req.body.website_video!==""?req.body.website_video:""


    console.log("....................req.............",req.body);

    var manValues = [accessToken, sectionId, name, languageId,branch_id];
    var folder = "abc";
    var adminId;
    var adsId;
    var phn_img;
    var web_img;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
                logger.debug("===============after  checkBlank ===================")
            },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            //     logger.debug("===============after  authenticateAccessToken ===================")
            // },
            // function (id, cb) {
            //     adminId = id;
            //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            //     logger.debug("===============after  checkforAuthorityofThisAdmin ===================")
            // },
            async function (cb) {
                if(phone_image!==""){
                    let imageUrl = await uploadMgr.uploadImageFileToS3BucketNew(phone_image);
                    // func.uploadImageFileToS3BucketSupplier(res, phone_image, folder, cb); 
                    cb(null,imageUrl);
                }else{
                    cb(null,"")
                }
            },
            async function (imageUrl,cb){
                phn_img = imageUrl;
                // func.uploadImageFileToS3BucketSupplier(res,website_image, folder, cb);
                if(website_image!==""){
                    let image = await uploadMgr.uploadImageFileToS3BucketNew(website_image);
                    cb(null,image);
                }else{
                    cb(null,"")
                }

            },
            function (imageUrl, cb) {
                web_img = imageUrl;
                name = name.split("#");
                languageId = languageId.split("#");
                categoryId = categoryId
                // areaIds = areaIds.split(',');
                console.log("============barnch id======++",branch_id)
                insertBannerAdvertisements(req.dbName,res, supplierId,
                     name[0], startDate, endDate, phn_img,web_img,
                      activeStatus, categoryId,branch_id,
                      order,flow_banner_type,isBottom,phone_video,website_video,is_video,cb);
            },
            function (id, cb) {

                insertInMultipleLanguages(req.dbName,res, id, name, languageId,function(err,result){
                    if(err){
                            cb(err);
                        }
                        else
                        {
                            cb(null);
                        }
                        });
            },
            function(cb){
                // adsId = adsId[0];
                // insertAdFeesInPaymentReceivable(res,supplierId,fees,adminId,startDate,endDate,adsId,0,cb);
                cb(null);
            }
        ], function (error, result) {
            if (error) {
                logger.debug("==========in the something went wrong ================*****")
                sendResponse.somethingWentWrongError(res);
            }
            else {
                logger.debug("==========in the success sendSuccess Data ================*****")

                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

};

exports.addBannerAdvertisementBySuppler = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    // var fees = req.body.fees;
    var startDate = req.body.startDate==undefined || req.body.startDate == null || req.body.startDate==""?"0000-00-00 00:00:00":req.body.startDate;
    var endDate = req.body.endDate==undefined || req.body.endDate == null || req.body.endDate==""?"0000-00-00 00:00:00":req.body.endDate;
    var phone_image = req.files.phone_image;
    var website_image = req.files.website_image;
    console.log("=========phone and web image================",phone_image,website_image)
    var activeStatus = req.body.activeStatus;
    // var areaIds = req.body.areaIds;
    var branch_id = req.body.branch_id
    console.log("==========req.body.branchid",branch_id,req.body.branch_id)
    var categoryId = req.body.categoryId;
    var bannerType=req.body.bannerType!=undefined?req.body.bannerType:0;
    if(req.body.order){
        var order = req.body.order;
    }else{
        var order = 0;
    }
   
    let isBottom=req.body.isBottom || 0;
    let is_video = req.body.is_video!==undefined && req.body.is_video!==null &&
    req.body.is_video!==""?req.body.is_video:0

    let phone_video = req.body.phone_video!==undefined && req.body.phone_video!==null &&
    req.body.phone_video!==""?req.body.phone_video:""

    let website_video = req.body.website_video!==undefined && req.body.website_video!==null &&
    req.body.website_video!==""?req.body.website_video:0


    console.log("....................req.............",req.body);
    var flow_banner_type = req.body.flow_banner_type ? req.body.flow_banner_type : '';

    var manValues = [accessToken, sectionId, name, languageId,phone_image,website_image,branch_id];
    var folder = "abc";
    var adminId;
    var adsId;
    var phn_img;
    var web_img;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
                logger.debug("===============after  checkBlank ===================")
            },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            //     logger.debug("===============after  authenticateAccessToken ===================")
            // },
            // function (id, cb) {
            //     adminId = id;
            //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            //     logger.debug("===============after  checkforAuthorityofThisAdmin ===================")
            // },
            async function (cb) {
                let imageUrl = await uploadMgr.uploadImageFileToS3BucketNew(phone_image);
                // func.uploadImageFileToS3BucketSupplier(res, phone_image, folder, cb); 
                cb(null,imageUrl);
            },
            async function (imageUrl,cb){
                phn_img = imageUrl;
                // func.uploadImageFileToS3BucketSupplier(res,website_image, folder, cb);
                let image = await uploadMgr.uploadImageFileToS3BucketNew(website_image);
                cb(null,image);

            },
            function (imageUrl, cb) {
                web_img = imageUrl;
                name = name.split("#");
                languageId = languageId.split("#");
                categoryId = categoryId
                // areaIds = areaIds.split(',');
                console.log("============barnch id======++",branch_id)
                insertBannerAdvertisements(req.dbName,res, supplierId, name[0], 
                    startDate, endDate, phn_img,web_img, activeStatus,
                     categoryId,branch_id,order,flow_banner_type,isBottom,phone_video,website_video,
                     is_video,cb);
            },
            function (id, cb) {

                insertInMultipleLanguages(req.dbName,res, id, name, languageId,function(err,result){
                    if(err){
                            cb(err);
                        }
                        else
                        {
                            cb(null);
                        }
                        });
            },
            function(cb){
                // adsId = adsId[0];
                // insertAdFeesInPaymentReceivable(res,supplierId,fees,adminId,startDate,endDate,adsId,0,cb);
                cb(null);
            }
        ], function (error, result) {
            if (error) {
                logger.debug("==========in the something went wrong ================*****")
                sendResponse.somethingWentWrongError(res);
            }
            else {
                logger.debug("==========in the success sendSuccess Data ================*****")

                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

};

/**
 * @description used for listing  banners from admin panel
 */
exports.listAdvertisements = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var advertisementType = req.body.advertisementType;
    var limit = parseInt(req.body.limit)
    var offset = parseInt(req.body.offset)
    logger.debug("=========limit -offset======",limit,offset)
    var search = req.body.search
    let supplier_id = req.body.supplier_id==undefined || req.body.supplier_id==null || req.body.supplier_id==""?0:req.body.supplier_id
    let supplier_check = ""
    if(parseInt(supplier_id)!==0){
        supplier_check = " a.supplier_id = "+supplier_id+" AND "
    }
    let count = 0;
    var manValues = [accessToken, sectionId, advertisementType];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                listAds(req.dbName,res, advertisementType,limit,offset,search,supplier_check, cb);
            },
            async function(data,cb){
                try{
                    if(advertisementType == 0){
                        var sql = "select a.flow_banner_type,a.banner_type,a.orders,s.is_live,cml.name as category_name,a.areaId,a.id,a.supplier_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date," +
                            "a.fees,a.website_image,a.phone_image,s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
                            "left join supplier_branch sb on sb.id=a.branch_id "+
                            "join categories_ml cml on cml.category_id = a.category_id where ";
                        sql += " a.is_deleted = ? and a.name LIKE '%"+search+"%' and a.advertisement_type = ? and cml.language_id = 14";
                
                    }else{
                        var sql = "select a.flow_banner_type,a.banner_type,a.orders,s.is_live,a.id,a.supplier_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date,a.fees," +
                            "s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
                            "  where ";
                        sql += " a.is_deleted = ? and a.advertisement_type = ?";
                    }
                    let result=await ExecuteQ.Query(req.dbName,sql,[0, advertisementType]);
                    if(result && result.length>0){
                        count = result.length
                    }
                    logger.debug("=====count in listing of ads=========",count)
                    cb(null,data)
                }
                catch(Err){
                    logger.debug("====Err!==>>",Err)
                    cb(Err)
                }
                // if(advertisementType == 0){
                //     var sql = "select a.banner_type,a.orders,s.is_live,cml.name as category_name,a.areaId,a.id,a.supplier_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date," +
                //         "a.fees,a.website_image,a.phone_image,s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
                //         "join supplier_branch sb on sb.id=a.branch_id "+
                //         "join categories_ml cml on cml.category_id = a.category_id where ";
                //     sql += " a.is_deleted = ? and a.name LIKE '%"+search+"%' and a.advertisement_type = ? and cml.language_id = 14";
            
                // }else{
                //     var sql = "select a.banner_type,a.orders,s.is_live,a.id,a.supplier_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date,a.fees," +
                //         "s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
                //         "  where ";
                //     sql += " a.is_deleted = ? and a.advertisement_type = ?";
                // }
                // multiConnection[req.dbName].query(sql, [0, advertisementType], function (err, result) {
                //     if(err){
                //         logger.debug("=========eerr=======",err)
                //         cb(err)
                //     }else{
                //         if(result && result.length>0){
                //             count = result.length
                //         }
                //         logger.debug("=====count in listing of ads=========",count)
                //         cb(null,data)
                //     }
                // })
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = {
                    list : result,
                    count : count
                };
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}
exports.listAdvertisementsBySupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var advertisementType = req.body.advertisementType;
    var limit = parseInt(req.body.limit)
    var offset = parseInt(req.body.offset)
    logger.debug("=========limit -offset======",limit,offset)
    var search = req.body.search
    let count = 0;

    let supplier_id = req.body.supplier_id==undefined || req.body.supplier_id==null || req.body.supplier_id==""?0:req.body.supplier_id
    let supplier_check = ""
    if(parseInt(supplier_id)!==0){
        supplier_check = " a.supplier_id = "+supplier_id+" AND "
    }
    
    var manValues = [sectionId, advertisementType, supplier_id];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            // },
            // function (id, cb) {
            //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            // },
            function (cb) {
                listAds(req.dbName,res, advertisementType,limit,offset,search,supplier_check, cb);
            },
           async function(data,cb){
                if(advertisementType == 0){
                    var sql = "select a.is_bottom,a.banner_type,a.orders,s.is_live,cml.name as category_name,a.areaId,a.id,a.supplier_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date," +
                        "a.fees,a.website_image,a.phone_image,s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
                        "join supplier_branch sb on sb.id=a.branch_id "+
                        "join categories_ml cml on cml.category_id = a.category_id where " +supplier_check+" ";
                    sql += " a.is_deleted = ? and a.name LIKE '%"+search+"%' and a.advertisement_type = ? and cml.language_id = 14";
            
                }else{
                    var sql = "select a.is_bottom,a.banner_type,a.orders,s.is_live,a.id,a.supplier_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date,a.fees," +
                        "s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
                        "  where " +supplier_check+" ";
                    sql += " a.is_deleted = ? and a.advertisement_type = ?";
                }
                let result=await ExecuteQ.Query(req.dbName,sql,[0, advertisementType]);
                if(result && result.length>0){
                    count = result.length
                }
                logger.debug("=====count in listing of ads=========",count)
                cb(null,data)
            //    let stmt = multiConnection[req.dbName].query(sql, [0, advertisementType], function (err, result) {
            //        logger.debug("=--------===========smt.sql========",stmt.sql)
            //         if(err){
            //             logger.debug("=========eerr=======",err)
            //             cb(err)
            //         }else{
            //             if(result && result.length>0){
            //                 count = result.length
            //             }
            //             logger.debug("=====count in listing of ads=========",count)
            //             cb(null,data)
            //         }
            //     })
            }
        ], function (error, result) {
  
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = {
                    list : result,
                    count : count
                };
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
  
  }

exports.deleteAdvertisement = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var image;
    var manValues = [accessToken, sectionId, id];

    

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
        /*    function (cb) {
                var sql = "select banner_image from advertisements where id = ? limit 1";
                multiConnection[dbName].query(sql, [0, id], function (err, result) {
                    console.log(".update delete ....sedd...............",err,result);

                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        image = result[0].banner_image;
                        cb(null);
                    }

                })
            },*/
            function (cb) {
                var sql = "delete from advertisements where banner_image = ? ";
                multiConnection[dbName].query(sql, [id], function (err, result) {
                    console.log(".update delete ...................",err,result);

                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null);
                    }
                })
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}













exports.deleteAdvertisement_new = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var image;
    var manValues = [accessToken, sectionId, id];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            // function (cb) {
            //     func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            // },
            // function (id, cb) {
            //     func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            // },
            /*    function (cb) {
             var sql = "select banner_image from advertisements where id = ? limit 1";
             multiConnection[dbName].query(sql, [0, id], function (err, result) {
             console.log(".update delete ....sedd...............",err,result);

             if (err) {
             sendResponse.somethingWentWrongError(res);
             }
             else {
             image = result[0].banner_image;
             cb(null);
             }

             })
             },*/
        async function (cb) {
            try{
                var sql = "update advertisements set is_deleted = ? where id = ? limit 1";
                await ExecuteQ.Query(req.dbName,sql,[1, id])
                cb(null);
            }
            catch(Err){
                logger.debug("===Err!==",Err);
                sendResponse.somethingWentWrongError(res);
            }
            // multiConnection[req.dbName].query(sql, [1, id], function (err, result) {
            //     if (err) {
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
                    // cb(null);
            //     }

            // })
        }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}







exports.addNotificationAdvertisement = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var name = req.body.name;
    var description = "hello#ok";
    var languageId = req.body.languageId;
    var fees = req.body.fees;
    var broadCastingDate = req.body.broadCastingDate;
    var users = req.body.users;
    var areaIds = req.body.areaIds;
   // var activeStatus = req.body.activeStatus;
    var manValues = [accessToken, sectionId, name, languageId, fees, broadCastingDate, users, areaIds];
    var folder = "abc";
    var adId;
    var adminId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                adminId = id;
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                logger.debug("================after ==checkforAuthorityofThisAdmin====================")
                name = name.split("#");
                languageId = languageId.split("#");
                description = description.split("#");
                insertNotificationAdvertisements(req.dbName,res, supplierId, name[0], fees, broadCastingDate, users,1,description[0], cb);
            },
            function (id, cb) {
                adId = id;
                logger.debug("====================after insertNotificationAdvertisements=======================")
                insertNotificationInMultipleLanguages(req.dbName,res, id, name,description, languageId, cb);
            },
            function (cb) {
                logger.debug("=================after insertNotificationInMultipleLanguages ================================")
                insertNotificationAdAreas(req.dbName,res, adId, areaIds, cb);
            },
            function(cb){
                logger.debug("=================after insertNotificationAdAreas ================================")
                insertAdFeesInPaymentReceivable(req.dbName,res,supplierId,fees,adminId,broadCastingDate,0,adId,1,cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.addSupplierExtranetAdvertisement = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var bannerImage = req.files.bannerImage;
    // var activeStatus = req.body.activeStatus;
    var manValues = [accessToken, sectionId, name, languageId, startDate, endDate, bannerImage];
    var folder = "abc";
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
                logger.debug("==================after checkBlank====================")
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
                logger.debug("==================after authenticateAccessToken====================")
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
                logger.debug("==================after checkforAuthorityofThisAdmin====================")
            },
            async function (cb) {
                let imageUrl = await uploadMgr.uploadImageFileToS3BucketNew(bannerImage);
                cb(null,imageUrl);
                // func.uploadImageFileToS3Bucket(res, bannerImage, folder, cb);
                logger.debug("==================after uploadImageFileToS3Bucket====================")
            },
            function (imageUrl, cb) {
                name = name.split("#");
                languageId = languageId.split("#");
               // console.log(imageUrl);
                insertSupplierExtranetAdvertisements(req.dbName,res, 0, name[0], startDate, endDate, imageUrl,1, cb);
                logger.debug("==================after insertSupplierExtranetAdvertisements====================")
            },
            function (id, cb) {
                logger.debug("=============called from here  addSupplierExtranetAdvertisement ===========")
                insertInMultipleLanguages(req.dbName,res, id, name, languageId, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.addSponsorAdvertisement = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var fees = req.body.fees;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var bannerImage = req.files.bannerImage;
    var activeStatus = req.body.activeStatus;
    var categoryId = req.body.categoryId;
    var areaIds = req.body.areaIds;
    var manValues = [accessToken, sectionId, name, languageId, fees, startDate, endDate, bannerImage, activeStatus, categoryId, areaIds];
    var folder = "abc";
    var adId;
    var adminId;
    console.log("lhasbj",req.body);
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                adminId = id;
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            async function (cb) {
                let imageUrl = await uploadMgr.uploadImageFileToS3BucketNew(bannerImage);
                cb(null,imageUrl);
                // func.uploadImageFileToS3Bucket(res, bannerImage, folder, cb);
            },
            function (imageUrl, cb) {
                name = name.split("#");
                languageId = languageId.split("#");
                insertSponsorAdvertisements(req.dbName,res, supplierId, name[0], fees, startDate, endDate, imageUrl, activeStatus, cb);
            },
            function (id, cb) {
                adId = id;
                logger.debug("==============callled from here addSponsorAdvertisement=======================")
                insertInMultipleLanguages(req.dbName,res, id, name, languageId, cb);
            },
            function (cb) {
                insertSponsorCategoryAreas(req.dbName,res, adId, areaIds, categoryId, cb);
            },
             function(cb){
                 insertAdFeesInPaymentReceivable(req.dbName,res,supplierId,fees,adminId,startDate,endDate,adId,3,cb);
             }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );


}


exports.addEmailAdvertisement = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var fees = req.body.fees;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var bannerImage = req.files.bannerImage;
    var activeStatus = req.body.activeStatus;
    var manValues = [accessToken, sectionId, name, languageId, fees, startDate, endDate, bannerImage, activeStatus];
    var folder = "abc";
    var adId;
    var adminId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                adminId = id;
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            async function (cb) {
                let imageUrl = await uploadMgr.uploadImageFileToS3BucketNew(bannerImage);
                cb(null,imageUrl);
                // func.uploadImageFileToS3BucketSupplier(res, bannerImage, folder, cb);
            },
            function (imageUrl, cb) {
                name = name.split("#");
                languageId = languageId.split("#");
                insertEmailAdvertisements(req.dbName,res, supplierId, name[0], fees, startDate, endDate, imageUrl, activeStatus, cb);
            },
            function (id, cb) {
                logger.debug("==========================called from here addEmailAdvertisement=====================")
                adId = id;
                insertInMultipleLanguages(req.dbName,res,id,name,languageId,cb);
                
            },
           function(cb){
               console.log(".....tempo................")
               insertAdFeesInPaymentReceivable(req.dbName,res,supplierId,fees,adminId,startDate,endDate,adId,4,cb);
           }
        ], function (error, result) {
           if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.sendEmailAdvertisement = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var emailContent = req.body.emailContent;
    var manValues = [accessToken, sectionId, emailContent];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                getUserEmailIds(req.dbName,res, cb);
            },
            function (users, cb) {
                var subject = "Email Advertisement";
                if (users.length) {
                    func.sendMailthroughSMTP(res, cb, subject, users.toString(), emailContent, 0);
                }
                else {
                    cb(null);
                }

            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );


}


exports.changeAdvertisementStatus = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var status = req.body.status;
    var manValues = [accessToken, sectionId, id];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                var sql = "update advertisements set is_active = ? where id = ? limit 1";
                multiConnection[req.dbName].query(sql, [status, id], function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null);
                    }

                })
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}

exports.changeAdvertisementStatusNew = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var status = req.body.status;
    
    console.log("....re.bodu................",req.body);
    
    var manValues = [accessToken, sectionId, id];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                var sql = "update advertisements set is_active = ? where banner_image = ? ";
                multiConnection[req.dbName].query(sql, [status, id], function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null);
                    }

                })
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}











function listAds(dbName,res, type, limit, offset, search,supplier_check, callback) {

    if (type == 0 || type == 2 || type == 4) {
        async.auto({
                one: function (cb) {

                    listingOfAds(dbName,res,limit,offset,search, type,supplier_check, cb)
                }
            }
            , function (err, response) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    callback(null, response.one);
                }

            })
    }

    else if (type == 1) {
        var ads;
        async.auto({
            one: function (cb) {
                listingOfAds(dbName,res,limit,offset,search, type,supplier_check, function (err, response) {
                  console.log("........err.....4322",err,response)
                    if (err) {
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        if (response.length) {
                            ads = response;
                            cb(null);
                        }
                        else {
                            callback(null, [])
                        }

                    }

                })
            },
            two: ['one', function (cb) {
                getBroadcastingAreas(dbName,res, ads, cb);
            }]
        }, function (err, response) {
            console.log("........err..3333...4322",err,response)
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, response.two)
            }

        })

    }

    else if (type == 3) {
        var ads;
        async.auto({
            one: function (cb) {
                listingOfAds(dbName,res,limit,offset,search,type,supplier_check, function (err, response) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        if (response.length) {
                            ads = response;
                            cb(null);
                        }
                        else {
                            callback(null, [])
                        }
                    }

                })
            },
            two: ['one', function (cb) {
                getCategoryAndAreas(dbName,res, ads, cb);
            }]
        }, function (err, response) {
           
           console.log("............................err.....response..........",err,response);
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null, response.two)
            }

        })

    }
}


async function insertBannerAdvertisements(dbName,res, supplierId, name, startDate,
     endDate, phn_img, web_img, activeStatus,categoryId,branch_id,
     order,flow_banner_type,isBottom,phone_video,website_video,is_video,callback) {
         try{
            var sql = "INSERT INTO advertisements(supplier_id,name, is_active, phone_image,website_image,start_date, end_date,advertisement_type,category_id,branch_id,orders,flow_banner_type,is_bottom,phone_video,website_video,is_video) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
            let result=await ExecuteQ.Query(dbName,sql,[supplierId, name, activeStatus, phn_img, web_img, startDate, endDate, 0,categoryId,branch_id,order,flow_banner_type,isBottom,phone_video,website_video,is_video])
            // console.log(".........query...............",order);
            // multiConnection[dbName].query(sql, [supplierId, name, activeStatus, phn_img, web_img, startDate, endDate, 0,categoryId,branch_id,order], function (err, result) {
            //    console.log(".......err.............................",err,result);
               
            //     if (err) {
            //         logger.debug("===========in the insertBannerAdvertisements function error  ===============");
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
                        callback(null,result.insertId);
            //     }
            // })
         }
         catch(Err){
             logger.debug("==insertBannerAdvertisements===Err!==",Err)
         }
}



function insertAdFeesInPaymentReceivable(dbName,res,supplierId,fees,adminId,startDate,endDate,adsId,type,callback) {
  //  console.log("hereee");
    var date1=new Date();
   // console.log("date",date1);
    var date2 = new Date().toISOString().split("T");
    var sql = "select id,status from account_receivable ";
    sql += " where supplier_id = ? and DATE(updated_at) = ? limit 1";
    multiConnection[dbName].query(sql,[supplierId,date2[0]],function(err,result)
    {
        if(err){
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length) {
                if(result[0].status == 1)
                {
                    var sql2 = "update account_receivable set total_amount = total_amount + ?,amount_left = amount_left + ?,status = 2,updated_at=? ";
                        sql2 += " where id = ? limit 1";
                    multiConnection[dbName].query(sql2,[fees,fees,date1,result[0].id],function(err,updated)
                    {
                        if(err){
                            console.log("err1",err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else{
                            var sql3="insert into account_receivable_subscriptions(account_receivable_id,supplier_id,service_type,advertisement_id,amount,created_date,starting_date,ending_date,ads_type)values(?,?,?,?,?,?,?,?,?) ";
                                multiConnection[dbName].query(sql3,[result[0].id,supplierId,1,adsId,fees,moment(date1).format('YYYY-MM-DD'),moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),type],function (err,result1) {
                                    if(err){
                                        console.log("err2",err);
                                        sendResponse.somethingWentWrongError(res);
                                    }
                                    else{
                                        callback(null);
                                    }
                                })
                            }
                    })
                }
                else {
                    var sql2 = "update account_receivable set total_amount = total_amount + ?,amount_left = amount_left + ?,updated_at=? ";
                        sql2 += " where id = ? limit 1";
                    multiConnection[dbName].query(sql2,[fees,fees,date1,result[0].id],function(err,updated)
                    {
                        if(err){
                            console.log("err3",err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else{
                            var sql3="insert into account_receivable_subscriptions(account_receivable_id,supplier_id,service_type,advertisement_id,amount,created_date,starting_date,ending_date,ads_type)values(?,?,?,?,?,?,?,?,?) ";
                            multiConnection[dbName].query(sql3,[result[0].id,supplierId,1,adsId,fees,moment(date1).format('YYYY-MM-DD'),moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),type],function (err,result1) {
                                if(err){
                                    console.log("err4",err);
                                    sendResponse.somethingWentWrongError(res);
                                }
                                else{
                                    callback(null);
                                }
                            })
                        }
                    })
                }
            }
            else{
                var sql2 = "insert into account_receivable(admin_id,supplier_id,created_date,total_amount,amount_left,status) values(?,?,?,?,?,?) ";
                multiConnection[dbName].query(sql2,[adminId,supplierId,date1,fees,fees,0],function(err,inserted)
                {
                    if(err){
                        console.log("err5",err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{
                        var insertId=inserted.insertId;
                        var sql3="insert into account_receivable_subscriptions(account_receivable_id,supplier_id,service_type,advertisement_id,amount,created_date,starting_date,ending_date,ads_type)values(?,?,?,?,?,?,?,?,?) ";
                        multiConnection[dbName].query(sql3,[insertId,supplierId,1,adsId,fees,moment(date1).format('YYYY-MM-DD'),moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),type],function (err,result1) {
                            if(err){
                                console.log("err6",err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else{
                                callback(null);
                            }
                        })
                    }

                })
            }
        }

    })

}


function insertNotificationAdvertisements(dbName,res, supplierId, name, fees, broadCastingDate, users,activeStatus,description, callback) {
    logger.debug("==================in the  insertNotificationAdvertisements =========================== ")
    var sql = "INSERT INTO `advertisements`(`supplier_id`, `name`, `is_active`,`start_date`, `fees`, `advertisement_type`,`no_of_users`,`description`) VALUES (?,?,?,?,?,?,?,?)"
   var statement =  multiConnection[dbName].query(sql, [supplierId, name, activeStatus,moment(broadCastingDate).format('YYYY-MM-DD'), fees, 1, users,description], function (err, result) {
        if (err) {
            logger.debug("================== error===in the  insertNotificationAdvertisements =========================== ",statement.sql,err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            logger.debug("==================not an error in the  insertNotificationAdvertisements =========================== ")
            callback(null, result.insertId);
        }

    })
}


function insertSupplierExtranetAdvertisements(dbName,res, supplierId, name, startDate, endDate, imageUrl,activeStatus, callback) {
    var sql = "INSERT INTO `advertisements`(`supplier_id`, `name`, `is_active`,`start_date`,`end_date`, `advertisement_type`,`banner_image`) VALUES (?,?,?,?,?,?,?)"
   var statement =  multiConnection[dbName].query(sql, [supplierId, name,activeStatus, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), 2, imageUrl], function (err, result) {
        if (err) {
            logger.debug("================error in insertSupplierExtranetAdvertisements========================",err,statement.sql)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result.insertId);
        }

    })
}


/*
function insertInMultipleLanguages(res,id,name,languageId,cb) {
    var queryString = "";
    var insertString = "(?,?,?),";
    var values = [];

            for (var i = 0; i < name.length; i++) {
                (function (i) {
                    values.push(id, name[i], languageId[i]);
                    queryString = queryString + insertString;
                    if (i == name.length - 1) {
                        queryString = queryString.substring(0, queryString.length - 1);
                        var sql = "insert into advertisement_ml(advertisement_id,name,language_id) values " + queryString;
                        multiConnection[dbName].query(sql, values, function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {

                            }

                        })
                    }

                }(i))
            }
    


}
*/
function insertInMultipleLanguages(dbName,res, id, name, languageId, callback) {
    logger.debug("===========in the insertInMultipleLanguage 1 =====================")
    var queryString = "";
    var insertString = "(?,?,?),";
    var values = [];
    for (var i = 0; i < name.length; i++) {
        (async function (i) {
            values.push(id, name[i], languageId[i]);
            queryString = queryString + insertString;
            if (i == name.length - 1) {
                try{
                queryString = queryString.substring(0, queryString.length - 1);
                var sql = "insert into advertisement_ml(advertisement_id,name,language_id) values " + queryString;
                await ExecuteQ.Query(dbName,sql,values);
                logger.debug("==============not any error in sql =================_+++++++++")
                callback(null);
                }
                catch(Err){
                    logger.debug("===Err!=",Err);
                    sendResponse.somethingWentWrongError(res)
                }
            //    var statement =  multiConnection[dbName].query(sql, values, function (err, result) {
            //         if (err) {
            //             logger.debug("==============error in sql =================_+++++++++",statement.sql,err)
            //             sendResponse.somethingWentWrongError(res)
            //         }
            //         else {
                        // logger.debug("==============not any error in sql =================_+++++++++")
                        // callback(null);
                //     }

                // })
            }

        }(i))
    }

}


function insertInMultipleLanguagess(dbName,res,id,name,languageId,cb) {
    logger.debug("===========in the insertInMultipleLanguage 2 =====================")

    var queryString = "";
    var insertString = "(?,?,?),";
    var values = [];

    var lens = id.length;
    for(var j= 0;j<lens;j++){
        (function(j){
            for (var i = 0; i < name.length; i++) {
                (function (i) {
                    values.push(id[j], name[i], languageId[i]);
                    queryString = queryString + insertString;
                    if (i == name.length - 1) {
                        queryString = queryString.substring(0, queryString.length - 1);
                        console.log("...................values..................",values);
                      
                        var sql = "insert into advertisement_ml(advertisement_id,name,language_id) values " + queryString;
                        console.log("...................sql..................",sql);

                        multiConnection[dbName].query(sql, values, function (err, result) {
                          
                            console.log("*/************************************************",err,result);
                            if (err) {
                                
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                values = [];
                                queryString = "";
                                insertString = "(?,?,?),";
                                console.log("........------------------------------------------------",err,result);

                                if(j == (lens -1)){
                                    console.log("..................in last.........................",cb);
                                    cb(null,id[0]);
                                }

                            }

                        })
                    }

                }(i))
            }
        }(j));
    }



}


function insertSponsorAdvertisements(dbName,res, supplierId, name, fees, startDate, endDate, imageUrl, activeStatus, callback) {


    var data ;
    async.auto({
        updateValue:function(cb){

            var sql = "INSERT INTO `advertisements`(`supplier_id`, `name`, `is_active`, `banner_image`,`start_date`, `end_date`, `fees`, `advertisement_type`) VALUES (?,?,?,?,?,?,?,?)"
           var statement =  multiConnection[dbName].query(sql, [supplierId, name, activeStatus, imageUrl, moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'), fees, 3], function (err, result) {
                if (err) {
                    logger.debug("========error is here in insertSponsorAdvertisements==============",err,statement.sql)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
               
                    data = result.insertId;
                    cb(null, result.insertId);
                }

            })
        },
        isSponserSetup:function(cb){
            
            if(activeStatus == 1){
                var sql = "update supplier set is_sponser = ? where id = ?"
                multiConnection[dbName].query(sql, [1,supplierId], function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null);
                    }
                })
            }else{
                cb(null);
            }
            
        }
    },function(err,result){
        if(err){
            callback(err);
        }else{
            callback(null,data);
        }
    })


}


function insertNotificationAdAreas(dbName,res, adId, areaIds, callback) {
    areaIds = areaIds.split("#");
    var queryString = "";
    var insertString = "(?,?),";
    var values = [];
    for (var i = 0; i < areaIds.length; i++) {
        (function (i) {
            values.push(adId, areaIds[i]);
            queryString = queryString + insertString;
            if (i == areaIds.length - 1) {
                queryString = queryString.substring(0, queryString.length - 1);
                var sql = "insert into notification_broadcasting_areas(advertisement_id,area_id) values " + queryString;
                var statement = multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        logger.debug("==================error in insertNotificationAdAreas============ ",err,statement.sql)
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        callback(null);
                    }

                })
            }

        }(i))
    }
}


function insertSponsorCategoryAreas(dbName,res, adId, areaIds, categoryId, callback) {
    areaIds = areaIds.split(",");
    var queryString = "";
    var insertString = "(?,?,?),";
    var values = [];
    for (var i = 0; i < areaIds.length; i++) {
        (function (i) {
            values.push(adId, categoryId, areaIds[i]);
            queryString = queryString + insertString;
            if (i == areaIds.length - 1) {
                queryString = queryString.substring(0, queryString.length - 1);
                var sql = "insert into ads_sponsor_areas(advertisement_id,category_id,area_id) values " + queryString;
               var statement=multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        logger.debug("================error in insertSponsorCategoryAreas===============",statement.sql,err)
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        callback(null);
                    }

                })
            }

        }(i))
    }

}


function insertEmailAdvertisements(dbName,res, supplierId, name, fees, startDate, endDate, imageUrl, activeStatus, callback) {
    var sql = "INSERT INTO `advertisements`(`supplier_id`, `name`, `is_active`, `banner_image`,`start_date`, `end_date`, `fees`, `advertisement_type`) VALUES (?,?,?,?,?,?,?,?)"
    var statement = multiConnection[dbName].query(sql, [supplierId, name, activeStatus, imageUrl, moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'), fees, 4], function (err, result) {
        if (err) {
            logger.debug("==========error in insertEmailAdvertisements===============",err,statement.sql)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result.insertId);
        }

    })
}


function getUserEmailIds(dbName,res, callback) {
    var emailIds = [];

    var sql = "select email from user where is_deleted = ? ";
    multiConnection[dbName].query(sql, [0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (result.length) {
                for (var i = 0; i < result.length; i++) {
                    (function (i) {
                        emailIds.push(result[i].email);
                        if (i == result.length - 1) {
                            callback(null, emailIds);
                        }

                    }(i))

                }
            }
            else {
                callback(null, emailIds);
            }

        }

    })
}

async function listingOfAds(dbName,res,limit,offset,search,type,supplier_check, callback) {
    
    logger.debug("....type...........................onw ...........",type);
    try{
        if(type == 0){
  
            // var sql = "select a.banner_type,a.orders,s.is_live,cml.name as category_name,a.areaId,aml.name as area_name,a.id,a.supplier_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date," +
            //     "a.fees,s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
            //     " join area_ml aml on aml.area_id = a.areaId join categories_ml cml on cml.category_id = a.category_id where ";
            // sql += " a.is_deleted = ? and a.advertisement_type = ? and aml.language_id = 14 and cml.language_id = 14";
      
            var sql = "select a.flow_banner_type,a.banner_type,a.orders,s.is_live,cml.name as category_name,a.areaId,a.id,a.supplier_id,a.branch_id,a.category_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date," +
                "  a.phone_video,a.website_video,a.is_video, a.fees,a.website_image,a.phone_image,s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
                " left join supplier_branch sb on sb.id=a.branch_id "+
                "join categories_ml cml on cml.category_id = a.category_id where "+supplier_check+" ";
            sql += " a.is_deleted = ? and a.name LIKE '%"+search+"%' and a.advertisement_type = ? and cml.language_id = 14 LIMIT ?,?";
      
        }else{
      
            var sql = "select a.flow_banner_type,a.banner_type,a.orders,s.is_live,a.id,a.supplier_id,a.name,a.is_active,a.banner_image,a.no_of_users,a.start_date,a.end_date,a.fees," +
                " a.phone_video,a.website_video,a.is_video,    s.name supplier_name from advertisements a left join supplier s on a.supplier_id = s.id " +
                "  where "+supplier_check+" ";
            sql += " a.is_deleted = ? and a.name LIKE '%"+search+"%' and a.advertisement_type = ? LIMIT ?,?";
      
        }
        let result=await ExecuteQ.Query(dbName,sql,[0, type,offset,limit]);
        if (!result.length) {
                callback(null, [])
            }
        else{
            var sql2 = "select a.advertisement_id,a.name,l.language_name,l.id from advertisement_ml a join language l ";
            sql2 += " on a.language_id = l.id ";
            let result2=await ExecuteQ.Query(dbName,sql2,[])
            for (var i = 0; i < result.length; i++) {
                (function (i) {
                    var names = [];
                    for (var j = 0; j < result2.length; j++) {
                        (function (j) {
                            if (result[i].id == result2[j].advertisement_id) {
                                names.push(result2[j]);
                                if (j == result2.length - 1) {
                                    result[i].names = names;
                                    if (i == result.length - 1) {
                                        callback(null, result)
                                    }
                                }
                            }
                            else {
                                if (j == result2.length - 1) {
                                    result[i].names = names;
                                    if (i == result.length - 1) {
                                        callback(null, result)
                                    }
                                }
                            }
                        }(j))
                    }
                }(i))
    
            }
        }
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res);
    }
   
    // let stmt = multiConnection[dbName].query(sql, [0, type,offset,limit], function (err, result) {
    //  console.log(".....err...................first,..........",err,result,stmt.sql);
     
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
           
    //         if (!result.length) {
    //             callback(null, [])
    //         }
    //         else {
    //             var sql2 = "select a.advertisement_id,a.name,l.language_name,l.id from advertisement_ml a join language l ";
    //             sql2 += " on a.language_id = l.id ";
    //             multiConnection[dbName].query(sql2, function (err, result2) {
    //              console.log("..........one.......two.............",err,result);
    //                 if (err) {
    //                     sendResponse.somethingWentWrongError(res);
    //                 }
    //                 else {
    //                     for (var i = 0; i < result.length; i++) {
    //                         (function (i) {
    //                             var names = [];
    //                             for (var j = 0; j < result2.length; j++) {
    //                                 (function (j) {
    //                                     if (result[i].id == result2[j].advertisement_id) {
    //                                         names.push(result2[j]);
    //                                         if (j == result2.length - 1) {
    //                                             result[i].names = names;
    //                                             if (i == result.length - 1) {
    //                                                 callback(null, result)
    //                                             }
    //                                         }
    //                                     }
    //                                     else {
    //                                         if (j == result2.length - 1) {
    //                                             result[i].names = names;
    //                                             if (i == result.length - 1) {
    //                                                 callback(null, result)
    //                                             }
    //                                         }
    //                                     }
    //                                 }(j))
    //                             }
    //                         }(i))
  
    //                     }
  
    //                 }
  
    //             })
    //         }
    //     }
  
    // })
  }

async function getBroadcastingAreas(dbName,res, ads, callback) {
    try{
        var adsLength = ads.length;
        var sql = "select a.name,ad.area_id,ad.advertisement_id from notification_broadcasting_areas ad join area a";
        sql += " on ad.area_id = a.id where ad.is_deleted = ?";
        let result=await ExecuteQ.Query(dbName,sql,[0]);
        var areaLength = result.length;
        for (var i = 0; i < adsLength; i++) {

            (function (i) {
                var areas = [];
                for (var j = 0; j < areaLength; j++) {
                    (function (j) {
                        if (ads[i].id == result[j].advertisement_id) {
                            areas.push(result[j]);
                            if (j == areaLength - 1) {
                                ads[i].areas = areas;
                                if (i == adsLength - 1) {
                                    callback(null, ads);
                                }
                            }
                        }
                        else {
                            if (j == areaLength - 1) {
                                ads[i].areas = areas;
                                if (i == adsLength - 1) {
                                    callback(null, ads);
                                }
                            }
                        }

                    }(j))

                }


            }(i))

        }
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res);
    }

    // var adsLength = ads.length;
    // var sql = "select a.name,ad.area_id,ad.advertisement_id from notification_broadcasting_areas ad join area a";
    // sql += " on ad.area_id = a.id where ad.is_deleted = ?";
    // multiConnection[dbName].query(sql, [0], function (err, result) {
    //     console.log("........err.....478997897898322",err,result)
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         var areaLength = result.length;
    //         for (var i = 0; i < adsLength; i++) {

    //             (function (i) {
    //                 var areas = [];
    //                 for (var j = 0; j < areaLength; j++) {
    //                     (function (j) {
    //                         if (ads[i].id == result[j].advertisement_id) {
    //                             areas.push(result[j]);
    //                             if (j == areaLength - 1) {
    //                                 ads[i].areas = areas;
    //                                 if (i == adsLength - 1) {
    //                                     callback(null, ads);
    //                                 }
    //                             }
    //                         }
    //                         else {
    //                             if (j == areaLength - 1) {
    //                                 ads[i].areas = areas;
    //                                 if (i == adsLength - 1) {
    //                                     callback(null, ads);
    //                                 }
    //                             }
    //                         }

    //                     }(j))

    //                 }


    //             }(i))

    //         }
    //     }

    // })

}


function getCategoryAndAreas(dbName,res, ads, callback) {
    var adsLength = ads.length;
    var sql = "select a.advertisement_id,c.name category_name,ar.name area_name from ads_sponsor_areas a ";
    sql += " join categories c on a.category_id = c.id join area ar on a.area_id = ar.id where a.is_deleted = ?";
    multiConnection[dbName].query(sql, [0], function (err, categoryAreas) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            console.log("lmjkasd",categoryAreas);
            var categoryAreasLength = categoryAreas.length;
            if(categoryAreasLength == 0){
                callback(null, []);

            }
            
            for (var i = 0; i < adsLength; i++) {
                (function (i) {
                    var categories = [];
                    for (var j = 0; j < categoryAreasLength; j++) {
                        (function (j) {
                            if (ads[i].id == categoryAreas[j].advertisement_id) {
                                categories.push(categoryAreas[j]);
                                if (j == categoryAreasLength - 1) {
                                    ads[i].categoryAreas = categories;
                                    if (i == adsLength - 1) {
                                        callback(null, ads);
                                    }
                                }
                            }
                            else {
                                if (j == categoryAreasLength - 1) {
                                    ads[i].categoryAreas = categories;
                                    if (i == adsLength - 1) {
                                        callback(null, ads);
                                    }
                                }

                            }


                        }(j))

                    }

                }(i))

            }


        }

    })

}

exports.sendPushNotification = function (req, res) {
    var accessToken = 0 ;
    var sectionId = 0;
    var adminId = 0;
    var data =[];
    var num_of_users=[];
    var supplier=[];
    var data1=[];
    var length=0;
    var length1=0;
    var date1=new Date();
   // console.log("date",date1);
    var date2 = new Date().toISOString().split("T");
    async.auto({
        checkBlank:function (cb) {
            if(req.body && req.body.accessToken && req.body.sectionId)
            {
                accessToken=req.body.accessToken;
                sectionId=req.body.sectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate:['checkBlank',function (cb)
        {
            func.authenticateAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse .somethingWentWrongError(res);
                }
                else
                {
                    adminId=result;
                 //   console.log("adminId:  ",adminId);
                    cb(null);
                }

            })
        }],
        checkauthority:['authenticate',function(cb)
        {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,sectionId, res,function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                   // console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        getNotificationData:['checkauthority',function (cb)
        {
            var sql='select a.id,a.supplier_id,a.banner_image,a.no_of_users from advertisements a ' +
                'where a.is_active =? and DATE(a.start_date)=? and a.advertisement_type=? and a.is_deleted=? and a.is_sent= ?';
            multiConnection[req.dbName].query(sql,[1,date2[0],1,0,0],function (err,values) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    length=values.length;
                    if(values.length){
                        for(var i=0;i<values.length;i++){
                            (function (i)
                            {
                                supplier.push(values[i].supplier_id);
                                num_of_users.push(values[i].no_of_users);
                               data.push({
                                   'images':values[i].banner_image
                               });
                                if(i == values.length-1){
                                    cb(null)
                                }
                            }(i))
                        }

                    }
                    else{
                         data = [];
                        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                    }
                }
            })
        }],
        getUsers:['getNotificationData',function(cb)
        {
            var sql1='select u.id,u.device_token,u.device_type from user u where u.is_deleted=? and u.notification_status=?';
          
                    multiConnection[req.dbName].query(sql1,[0,1],function (err,result) {
                        if(err){
                            console.log("err1",err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            length1=result.length;
                            data1=result;
                            cb(null);
                        }
                    });
        }],
        sendNotification:['getUsers',function (cb)
        {
            sendNotification(res,num_of_users,data,data1,function (err,result) {
                if(err){
                    console.log("err1222",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("comp");
                    cb(null);
                }
            });
        }],
        updateAdvertisement:['sendNotification',function(cb)
        {
            var sql1='update advertisements set is_sent = ? where DATE(start_date) = ? ';
            multiConnection[req.dbName].query(sql1,[1,date2[0]],function (err,result) {
                if(err){
                    console.log("err in update",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    cb(null);
                }
            })
        }],
        saveNotification:['updateAdvertisement',function (cb) {
            for(var k=0;k<data.length;k++){
                (function (k) {
                   var  message= constant.pushNotificationMessage.BROADCASTING_PUSH_ENGLISH;
                    var status=constant.pushNotificationStatus.BROADCASTING_PUSH;
                    saveNotification(res,num_of_users[k],data1,supplier[k],message,status,function (err,res) {
                        if(err){
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            if(k==data.length-1){
                                cb(null);
                            }
                        }
                    });
                }(k))
            }

        }]
    },function(err,result){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            var data123=[];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
        }
    });

}

function sendNotification(res,min_users,data12,total_users,callback) {
   // console.log("send push");
var deviceToken=0;
var deviceType=-1;
var message;
var androidData=[];
var iosData=[];
var android=[];
var ios=[];
    for(var i=0;i<data12.length;i++){
        (function (i) {
           for(var j=0;j<min_users[i];j++){
               (function (j) {
                   deviceToken=total_users[j].device_token;
                   deviceType=total_users[j].device_type;
                   if(deviceType==0){
                       androidData = {
                               "status": constant.pushNotificationStatus.BROADCASTING_PUSH,
                               "message": constant.pushNotificationMessage.BROADCASTING_PUSH_ENGLISH,
                               "data": data12[i]
                           };
                       android.push(deviceToken);
                       if(j == min_users[i]-1)
                       {
                           if(android.length){
                               pushNotifications.sendAndroidPushNotification(android, androidData,function (err,result) {
                                   if(err){
                                       console.log("err in android",err);
                                       sendResponse.somethingWentWrongError(res);
                                   }
                                   else{
                                       console.log("push sent in android");
                                   }
                               });
                           }

                          if(ios.length){
                              pushNotifications.sendIosPushNotification(ios, iosData, message, function (err,result) {
                                  if(err){
                                      console.log("err in ios",err);
                                      sendResponse.somethingWentWrongError(res);
                                  }
                                  else{
                                      console.log("push sent in ios");
                                  }
                              });
                          }

                           if(i == data12.length-1){
                               callback(null);
                           }
                           android=[];
                           ios=[];
                       }
                   }
                   else {
                       iosData = {
                           "status": constant.pushNotificationStatus.BROADCASTING_PUSH,
                           "message": constant.pushNotificationMessage.BROADCASTING_PUSH_ENGLISH,
                           "data": data12[i]
                       };
                       ios.push(deviceToken)
                       message = iosData.message;
                       if(j == min_users[i]-1){
                           if(android.length){
                               pushNotifications.sendAndroidPushNotification(android, androidData,function (err,result) {
                                   if(err){
                                       console.log("err in android",err);
                                       sendResponse.somethingWentWrongError(res);
                                   }
                                   else{
                                       console.log("push sent in android");
                                   }
                               });
                           }
                           if(ios.length){
                               pushNotifications.sendIosPushNotification(ios, iosData, message, function (err,result) {
                                   if(err){
                                       console.log("err in ios",err);
                                       sendResponse.somethingWentWrongError(res);
                                   }
                                   else{
                                       console.log("push sent in ios");
                                   }
                               });
                           }
                           if(i==data12.length-1){
                               callback(null);
                           }
                       }
                   }

               }(j))
           }
        }(i))
    }
}

function saveNotification(res,users,data1,supplier,message,status,callback) {
    var values = new Array();
    var insertLength = "(?,?,?,?),";
    var querystring = '';
    async.auto({
        getValue:function (cb) {
            if(users){
                for(var i=0;i<users;i++){
                    (function (i) {
                        values.push(data1[i].id,supplier,message,status);
                        querystring = querystring + insertLength;
                       // console.log('<=======querystring=======>'+querystring);
                        if (i == users - 1) {

                            querystring = querystring.substring(0, querystring.length - 1);
                            cb(null);

                        }
                    }(i))
                }
            }
            else{
                callback(null);
            }
        },
        setValue:['getValue',function (cb) {
            var sql="insert into push_notifications(user_id,supplier_id,notification_message,notification_status)values"+querystring;
            multiConnection[dbName].query(sql, values, function (err, reply) {
                if (err) {
                    console.log("error",err);
                  //  console.log("from insert");
                    sendResponse.somethingWentWrongError(res);
                } else {
                    cb(null);
                }
            })
        }]
    },function (err,result) {
        if(err)
        {
            console.log('err12-----',err);
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null);
        }
    });
}


function insertNotificationInMultipleLanguages(dbName,res, id, name,description, languageId, callback) {
    var queryString = "";
    var insertString = "(?,?,?,?),";
    var values = [];
    for (var i = 0; i < name.length; i++) {
        (function (i) {
            values.push(id, name[i], languageId[i],description[i]);
            queryString = queryString + insertString;
            if (i == name.length - 1) {
                queryString = queryString.substring(0, queryString.length - 1);
                var sql = "insert into advertisement_ml(advertisement_id,name,language_id,description) values " + queryString;
                var statement = multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        logger.debug("==========errror insertNotificationInMultipleLanguages=========== ",err,statement.sql)
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        logger.debug("==========not an error in insertNotificationInMultipleLanguages=============")

                        callback(null);
                    }

                })
            }

        }(i))
    }

}
