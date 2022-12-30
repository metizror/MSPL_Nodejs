var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var _ = require('underscore');
var validator = require("email-validator");
var supplierProfile = require('./supplierProfile.js');
var loginFunctions = require('./loginFunctions.js');
var moment=require('moment');
const uploadMgr = require('../lib/UploadMgr');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const ExecuteQ=require('../lib/Execute')


exports.getRegSupplierInfoTab11 = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var values = [accessToken, sectionId];
    var supplier_id, supplierId;
    async.waterfall([
            function (cb) {
                logger.debug("=================checkBlank===1==================");
                func.checkBlank(res, values, cb);
                logger.debug("=================checkBlank====2=================")
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
                logger.debug("=================authenticateAccessTokenSupplier=====================")
            },
            // function (id, cb) {
            //     logger.debug("=================checkforAuthorityofThisSupplier==========*********===========")

            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
                supplier_id = id;
                 getId(req.dbName,res,supplier_id, cb);
            },
            function (id, cb) {
                supplierId = id[0].supplier_id;
                supplierProfile.getSupplierData(req.dbName,supplierId, res, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


/*
 * ------------------------------------------------------
 * Save/Edit tab 1 information of supplier profile (basic info like names, catgeories and all)
 * Output: success/error
 * ------------------------------------------------------
 */
/*exports.saveSupplierProfileTab11 = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierEmail = req.body.supplierEmail;
    var supplierName = req.body.supplierName;
    var languageId = req.body.languageId;
    var isRecommended = req.body.isRecommended;
    var pricingLevel = req.body.pricingLevel;
    var handlingAdmin = req.body.handlingAdmin;
    var handlingSupplier = req.body.handlingSupplier;
    var isUrgent = req.body.isUrgent;
    var isPostponed = req.body.isPostponed;
    var currentStatus = req.body.currentStatus;
    var address = req.body.address;
    var telephone = req.body.telephone;
    var fax = req.body.fax;
    var primaryMobile = req.body.primaryMobile;
    var secondaryMobile = req.body.secondaryMobile;
    var categoryString = req.body.categoryString;
    var tradeLicenseNo = req.body.tradeLicenseNo;
    var commissionType = req.body.commissionType;  // separated with #
    var commission = req.body.commission;          // separated with #
    var commissionPackage = req.body.commissionPackage; // separated with #
    var urgentType = req.body.urgentType;
    var urgentPrice = req.body.urgentPrice;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var monthPrice = req.body.monthPrice;
    var multilanguageId = req.body.multilanguageId;  //separated by #
    var subscriptionId = req.body.subscriptionId; // separated by #
    var folder = "abc";
    var photoStatus = req.body.photoStatus;
    var logoUrl = req.body.logoUrl;
    var supplierphotoStatus = req.body.supplierphotoStatus;
    var supplierImageUrl = req.body.supplierImageUrl;
    var businessStartDate = req.body.businessStartDate;
    var paymentMethod = req.body.paymentMethod;
    //console.log(req.body);
    var values = [accessToken, supplierEmail, sectionId, supplierName, languageId, isRecommended, pricingLevel, handlingAdmin, handlingSupplier, isUrgent, isPostponed, currentStatus, address, telephone, fax, primaryMobile, secondaryMobile, categoryString, tradeLicenseNo, photoStatus, commissionType, commission, urgentType, urgentPrice, startDate, endDate, monthPrice, commissionPackage, supplierphotoStatus, businessStartDate, paymentMethod];
    var supplierAdminid, supplierId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(accessToken, res, cb);
            },
            function (id, cb) {
                supplierAdminid = id;
                func.checkforAuthorityofThisSupplier(id, sectionId, res, cb);
            },
            function (cb) {
                getId(res, supplierAdminid, cb);
            },
            function (id, cb) {
                supplierId = id[0].supplier_id;
                if (photoStatus == 0) {
                    cb(null, logoUrl);
                }
                else {
                    func.uploadImageFileToS3Bucket(res, req.files.logo, folder, cb);
                }
            },
            function (imageUrl, cb) {
                logoUrl = imageUrl;
                if (supplierphotoStatus == 0) {
                    cb(null, supplierImageUrl);
                }
                else {
                    func.uploadImageFileToS3Bucket(res, req.files.supplierImage, folder, cb);
                }
            },
            function (supplierImageUrl, cb) {
                var names = supplierName.split("#");
                var languageIds = languageId.split("#");
                var addresses = address.split("#");
                var updateValues = [names[0], isRecommended, pricingLevel, handlingAdmin, handlingSupplier, isUrgent, isPostponed, currentStatus, addresses[0], telephone, fax, primaryMobile, secondaryMobile, tradeLicenseNo, logoUrl, urgentType, urgentPrice, 1, supplierImageUrl, businessStartDate, paymentMethod, supplierId];
                supplierProfile.updateSupplierData(res, primaryMobile, supplierEmail, updateValues, names, addresses, languageIds, multilanguageId, supplierId, startDate, endDate, monthPrice, categoryString, commission, commissionType, commissionPackage, supplierAdminid, subscriptionId, supplierImageUrl, cb);
            },
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
}*/
/**
 * @description used for update an supplier profile
 */
exports.saveSupplierProfileSubTab1 = function (req,res) {
    var isPostponed = req.body.isPostponed;
    var isUrgent = req.body.isUrgent;
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierEmail = req.body.supplierEmail;
    var addressEn = req.body.addressEn;
    var addressAb = req.body.addressAb;
    var telephone = req.body.telephone;
    var fax = req.body.fax;
    var primaryMobile = req.body.primaryMobile;
    var secondaryMobile = req.body.secondaryMobile;
    var businessStartDate = req.body.businessStartDate;
    var tradeLicenseNo = req.body.tradeLicenseNo;
    let licenseNumber=req.body.license_number;
    var supplierNameEn = req.body.supplierNameEn;
    var supplierNameAb = req.body.supplierNameAb;
    var paymentMethod = req.body.payment_method;
    var supplier_id,supplierId,flag=0;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var delivery_radius = req.body.delivery_radius;
    let radius_price=req.body.radius_price
    var is_area_restricted = req.body.is_area_restricted;
    var delivery_type = req.body.delivery_type;
    var head_branch = 0;
    var supplierBranchId = 0;
    let is_dine_in = req.body.is_dine_in==undefined?0:req.body.is_dine_in
    let distance_value = req.body.distance_value || 0;
    let base_delivery_charges =  req.body.base_delivery_charges || 0;
    let facebook_link=req.body.facebook_link || "";
    let speciality=req.body.speciality || "";
    let nationality=req.body.nationality || "";
    let linkedin_link=req.body.linkedin_link || "";
    let isProductOffer = req.body.is_products_offer || 0;
    let brand=req.body.brand || "";
    let description=req.body.description || "";
    let offer_value=req.body.offer_value || 0;
    let min_order=req.body.min_order || 0;
    var values = [accessToken,paymentMethod, supplierEmail, sectionId, telephone, primaryMobile, secondaryMobile];
    async.auto({
        checkValues:function (cb) {
            func.checkBlank(res, values, cb);
        },
        checkAccessToken:['checkValues',function (cb) {
            func.authenticateAccessTokenSupplier(req.dbName,accessToken, res,function (err,result) {
                console.log(".......authenticateAccessToken..........",err,result);
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    supplier_id=result;
                    cb(null);
                }
            });

        }],
        supplierId:['checkAccessToken',function (cb) {
          getId(req.dbName,res,supplier_id,function (err,result) {
              if(err){
                  console.log("err",err);
                  sendResponse.somethingWentWrongError(res);
              }
              else {
                  supplierId=result[0].supplier_id;
                  cb(null);
              }
          })
        }],
        getEmail:['supplierId',async function (cb) {
            try{
            var sql='select id from supplier where email=? and id != ?'
            let result=await ExecuteQ.Query(req.dbName,sql,[supplierEmail,supplierId]);
                if(result.length){
                    flag=1;
                }
                cb(null);
            
                }
                catch(Err){
                    logger.debug("==getEmail===",Err)
                    sendResponse.somethingWentWrongError(res);
                }
        }],
        updateEmail:['getEmail',async function (cb) {
            try{
            if(flag==1){
                sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
            }
            else {
                if(req.dbName=="northwesteats_0692"){
                    var sql='update supplier s join supplier_admin sa on sa.supplier_id = s.id set s.email=?,sa.email=? where s.id=?';
                    await ExecuteQ.Query(req.dbName,sql,[supplierEmail,supplierEmail,supplierId]);
                } else{
                    var sql='update supplier s join supplier_admin sa on sa.supplier_id = s.id set s.is_products_offer=?,s.email=?,sa.email=? where s.id=?';
                    await ExecuteQ.Query(req.dbName,sql,[isProductOffer,supplierEmail,supplierEmail,supplierId]);
                }
                 
               

                var sql1='update supplier s join supplier_branch sa on sa.supplier_id = s.id set sa.min_order=? where s.id=?';
                await ExecuteQ.Query(req.dbName,sql1,[min_order,supplierId]);
                cb(null);
                
            }
        }
        catch(Err){
            sendResponse.somethingWentWrongError(res);
        }
        }],
        updateData:['updateEmail',async function (cb) {
            try{
                // let speciality=req.body.speciality || "";
                // let nationality=req.body.nationality || "";
                // let linkedin_link=req.body.linkedin_link || "";
                // let brand=req.body.brand || "";
                // let description=req.body.description || "";

                var sql = "update supplier set offerValue=?,speciality=?,description=?,brand=?,linkedin_link=?,nationality=?,facebook_link=?,distance_value=?,base_delivery_charges=?,is_dine_in=?,address=?,phone = ? ,fax = ? ,mobile_number_1 = ?,mobile_number_2 = ? ,trade_license_no = ?,business_start_date = ?,name = ?,delivery_radius=?,radius_price=?,license_number=? where id = ? limit 1";
                 await ExecuteQ.Query(req.dbName,sql,[offer_value,speciality,description,brand,linkedin_link,nationality,facebook_link,distance_value,base_delivery_charges, is_dine_in,addressEn,telephone,fax,primaryMobile,secondaryMobile,tradeLicenseNo,businessStartDate,supplierNameEn,delivery_radius,radius_price,licenseNumber,supplierId])
                 cb(null);
                }
            catch(Err){
                logger.debug("===Err==",Err);
                sendResponse.somethingWentWrongError(res);
            }
            
        }],
        updateData2:['updateData',async function (cb) {
            try{
            var sql = "update supplier_admin set phone_number = ? where supplier_id = ? limit 1"
            await ExecuteQ.Query(req.dbName,sql,[primaryMobile, supplierId]);
            cb(null);
              
            }
            catch(Err){
                sendResponse.somethingWentWrongError(res);
            }
        }],
        updateSupplierEnglishName:['updateData2',async function(cb){
            try{
            var sql = "update supplier_ml SET  name = ? ,address = ?  where supplier_id = ? and language_id  = ?";
            await ExecuteQ.Query(req.dbName,sql,[supplierNameEn,addressEn,supplierId,14]);
            cb(null);
            
            }
            catch(Err){
                cb(null)
            }
        }],
        updateSupplierArabicName:['updateSupplierEnglishName',async function(cb){
            try{
                var sql = "update supplier_ml SET  name = ? ,address = ? where supplier_id = ? and language_id  = ?";
                await ExecuteQ.Query(req.dbName,sql,[supplierNameAb,addressAb,supplierId,15])
                cb(null);
            }
            catch(Err){
                logger.debug("===Err!==",Err)
                cb(null)
            }
            
        }],
        updatePaymentMethods:['updateSupplierArabicName',async function(cb){
            try{
            var sql='update supplier set payment_method = ?,is_postpone=?,is_urgent=? where id = ? ';
            await ExecuteQ.Query(req.dbName,sql,[paymentMethod,isPostponed,isUrgent,supplierId])
            cb(null);
        }
            catch(Err){
                cb(null)
            }
           
        }],
        checkSupplierHeadBranch:['updatePaymentMethods',async function(cb){
                try{
                    var sql = "select id from supplier_branch where supplier_id = ? and is_head_branch=1 limit 1"
                    let result=await ExecuteQ.Query(req.dbName,sql,[supplierId])
                        if (result.length) {
                            logger.debug("=====head branch=========",head_branch)
                            head_branch = 1;
                            supplierBranchId = result[0].id;
                            logger.debug("=====supplierBranchId=========",result[0].id)
                        }
                        cb(null)
                }
                catch(Err){
                    cb(Err)
                }
              
        }],
        supplierHeadBranch : ['checkSupplierHeadBranch',function(cb){
                addSupplierHeadBranch(req.dbName,res,head_branch,supplierBranchId,supplierId,supplierNameEn,supplierNameEn,telephone,primaryMobile,secondaryMobile,supplierEmail,addressEn,1,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,function(err,result){
                    if(err){
                        sendResponse.somethingWentWrongError(res)
                    }else{
                      supplierBranchId = result;
                      cb(null)
                    }
                })
        }],
        supplierHeadBranchMl : ['supplierHeadBranch',function(cb){
                addSupplierHeadBranchMl(req.dbName,res,head_branch,supplierNameEn,supplierNameAb,supplierBranchId,addressEn,addressAb,function(err,result){
                    if(err){
                        cb(err)
                    }else{
                        cb(null)
                    }
                })
        }]

    },function (err,result) {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

var addSupplierHeadBranch = async function(dbName,res,head_branch,supplierBranchId,supplierId,name,branchName,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,callback){
        try{
            if(head_branch==0){
                var sql = "insert into supplier_branch(supplier_id,name,branch_name,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
            await ExecuteQ.Query(dbName,sql,[supplierId,name,branchName,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type])
                // var stmt=multiConnection[dbName].query(sql,[supplierId,name,branchName,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type],function(err,result){
                //     console.log("============errr============",err,stmt.sql,result)
                //     if(err){
                //         callback(err);
                //     }else{
                        callback(null,result.insertId)
                //     }
                // })
            }else{
                var sql = "update supplier_branch set name=?,branch_name=?,phone=?,mobile_1=?,mobile_2=?,email=?,address=?,is_head_branch=?,latitude=?,longitude=?,delivery_radius=?,is_area_restricted=?,delivery_type = ? where id=?"
                await ExecuteQ.Query(dbName,sql,[name,branchName,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,supplierBranchId])
                // var stmt = multiConnection[dbName].query(sql,[name,branchName,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,supplierBranchId],function(err,result){
                //     console.log("============errr============",err,stmt.sql,result)
                //     if(err){
                //         callback(err);
                //     }else{
                        callback(null,supplierBranchId)
                //     }
                // })
            }
        }
        catch(Err){
            logger.debug("====Err!==",Err)
            callback(err);
        }
}

var addSupplierHeadBranchMl = async function(dbName,res,head_branch,supplierNameEn,supplierNameAb,supplierBranchId,addressEn,addressAb,callback){
   try{
    if(head_branch==0){
        var sql1 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
        await ExecuteQ.Query(dbName,sql1,[supplierNameEn,supplierNameEn,14,supplierBranchId,addressEn])
        // var stmt = multiConnection[dbName].query(sql1,[supplierNameEn,supplierNameEn,14,supplierBranchId,addressEn],function(err,result1){
        //     console.log("============errr============",err,result1)
        //     if(err){
        //         callback(err)
        //     }else{
                var sql2 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
                let result2=await ExecuteQ.Query(dbName,sql2,[supplierNameAb,supplierNameAb,15,supplierBranchId,addressAb])
                // var stmt=multiConnection[dbName].query(sql2,[supplierNameAb,supplierNameAb,15,supplierBranchId,addressAb],function(err,result2){
                //     console.log("============qeru==========",stmt.sql2,err)
                //     if(err){
                //         callback(err)
                //     }else{
                        callback(null,result2.insertId)
                //     }
                // })            
        //     }
        // })
    }else{
        var sql1 = "update supplier_branch_ml set name=?,branch_name=?,address=? where supplier_branch_id=? and language_id=?"
        await ExecuteQ.Query(dbName,sql1,[supplierNameEn,supplierNameEn,addressEn,supplierBranchId,14])
        // var stmt = multiConnection[dbName].query(sql1,[supplierNameEn,supplierNameEn,addressEn,supplierBranchId,14],function(err,result1){
        //     console.log("============errr============",err,result1)
        //     if(err){
        //         callback(err)
        //     }else{
                var sql2 = "update supplier_branch_ml set name=?,branch_name=?,address=? where supplier_branch_id=? and language_id=?"
                let result2=await ExecuteQ.Query(dbName,sql2,[supplierNameAb,supplierNameAb,addressAb,supplierBranchId,15])
                // var stmt = multiConnection[dbName].query(sql1,[supplierNameAb,supplierNameAb,addressAb,supplierBranchId,15],function(err,result2){
                //     console.log("============errr============",err,stmt.sql1,result2)
                //     if(err){
                //         callback(err)
                //     }else{
                        callback(null,result2)
                //     }
                // })
        //     }
        // })
    }
}
catch(Err){
    logger.debug("===Err!==",Err)
    callback(err)
}
}



exports.saveSupplierImage_2 = function (req,res) {


    var accessToken;
    var sectionId;
    var supplier_id,supplierId;
    var folder = "abc";
    var supplierImageUrl = [];
    var deleteImage = [] ;
    console.log("**************",req.body);
    console.log("**************",req.files);
    var logoUrl = "";
    var is_url_a_logoImage = "0"

    async.auto({
        checkValues:function (cb) {
            if(req.body.accessToken){
                accessToken = req.body.accessToken;
            }
            else {
                var msg = "accessToken id not found";
                return sendResponse.sendErrorMessage(msg,res,400);
            }
            if(req.body.sectionId){
                sectionId = req.body.sectionId;
            }
            else {
                var msg = "sectionId id not found";
                return sendResponse.sendErrorMessage(msg,res,400);
            }
            if(req.body.deleteImage && req.body.deleteImage.length>0){
                var temp = req.body.deleteImage;
                // deleteImage=temp.split(',').toString();
                deleteImage = temp
                console.log(".,*************deleteImage********************...",deleteImage);
            }


            cb(null);
        },
        checkAccessToken:['checkValues',function (cb) {
            func.authenticateAccessTokenSupplier(req.dbName,accessToken, res,function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    supplier_id=result;
                    cb(null);
                }
            });

        }],
        supplierId:['checkAccessToken',function (cb) {
            getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    supplierId=result[0].supplier_id;
                    logger.debug("=------supplierIdsupplierId-------",supplierId)
                    cb(null);
                }
            })
        }],
        deleteImage:['supplierId',function(cb){
            deleteImage = JSON.parse(deleteImage)
            deleteImage = deleteImage[0]
            if(deleteImage && deleteImage.length>0){
                
                    var sql = "delete from supplier_image where orderImage = ? and supplier_id = ?";
                    let smt = multiConnection[req.dbName].query(sql,[deleteImage,supplierId],function(err,result){
                        logger.debug("===============a==========",smt.sql)
                        if(err){
                            console.log("err2",err);
                            cb(err);
                        }else{
                                cb(null,result)
                        }
                    })
                
            } else{
                cb(null)
            }
        }],
        imageLogo:['deleteImage',async function (cb) {
            logger.debug("===============b==========")
            if(req.files.logo){
                logger.debug("===============c==========")
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.logo);
                //supplierImageUrl.push({image:result,order:1}) 
                logoUrl = result;
                is_url_a_logoImage = "1"

                cb(null);
                // func.uploadImageFileToS3Bucket(res,req.files.image1, folder,function(err,result){
                //     if(err){
                //         console.log("err3",err);
                //         cb(err);
                //     }else{
                //         supplierImageUrl.push({image:result,order:1});
                //         logger.debug("=supplierimage url==============+",supplierImageUrl)
                //         cb(null);
                //     }
                // });
            }else{
                cb(null);
            }

        }] ,
        imageOne:['deleteImage',async function (cb) {
            logger.debug("===============b==========")
            if(req.files.image1){
                logger.debug("===============c==========")
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image1);
                supplierImageUrl.push({image:result,order:1})
                logger.debug("=supplierimage url==============+",supplierImageUrl)
                cb(null);
                // func.uploadImageFileToS3Bucket(res,req.files.image1, folder,function(err,result){
                //     if(err){
                //         console.log("err3",err);
                //         cb(err);
                //     }else{
                //         supplierImageUrl.push({image:result,order:1});
                //         logger.debug("=supplierimage url==============+",supplierImageUrl)
                //         cb(null);
                //     }
                // });
            }else{
                cb(null);
            }

        }] ,
        imageTwo:['deleteImage',async function (cb) {
            if(req.files.image2){
                logger.debug("===============c==========")
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image2);
                supplierImageUrl.push({image:result,order:2})
                logger.debug("=supplierimage url==============+",supplierImageUrl)
                cb(null); 
                
                
                // func.uploadImageFileToS3Bucket(res,req.files.image2, folder,function(err,result){
                //     if(err){
                //         console.log("err4",err);
                //         cb(err);
                //     }else{
                //         supplierImageUrl.push({image:result,order:2});
                //         cb(null);
                //     }
                // });
            }else{
                cb(null);
            }

        }],
        imageThree:['deleteImage',async function (cb) {
            if(req.files.image3){
                logger.debug("===============c==========")
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image3);
                supplierImageUrl.push({image:result,order:3})
                logger.debug("=supplierimage url==============+",supplierImageUrl)
                cb(null);
                // func.uploadImageFileToS3Bucket(res,req.files.image3, folder,function(err,result){
                //     if(err){
                //         console.log("err5",err);
                //         cb(err);
                //     }else{
                //         supplierImageUrl.push({image:result,order:3});
                //         cb(null);
                //     }
                // });
            }else{
                cb(null);
            }

        }],
        imageFour:['deleteImage',async function (cb) {
            if(req.files.image4){
                logger.debug("===============c==========")
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image4);
                supplierImageUrl.push({image:result,order:4})
                logger.debug("=supplierimage url==============+",supplierImageUrl)
                cb(null);
                // func.uploadImageFileToS3Bucket(res,req.files.image4, folder,function(err,result){
                //     if(err){
                //         console.log("err6",err);
                //         cb(err);
                //     }else{
                //         supplierImageUrl.push({image:result,order:4});
                //         cb(null);
                //     }
                // });
            }else{
                cb(null);
            }

        }],
        saveImage:['imageLogo','imageOne','imageTwo','imageThree','imageFour',function (cb) {
            if(is_url_a_logoImage=="1"){
                updateSupplierLogo(req.dbName,res,supplierId,logoUrl,cb);
            }else{
                logger.debug("==============save image=============",supplierImageUrl)
                updateSupplierImage(req.dbName,res,supplierId,supplierImageUrl,cb);
            }
        }]
    },function (err,result) {
        if(err){
            console.log("err7",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var data = [];
            sendResponse.sendSuccessData(supplierImageUrl, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

/*
 * ------------------------------------------------------
 * Get tab 2 information of supplier profile (delivery areas and branches)
 * Output: supplier tab 2 information
 * ------------------------------------------------------
 */

exports.getRegSupplierInfoTab2Extranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = 0;
    var supplier_id;
    var values = [accessToken, sectionId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
                 getId(req.dbName,res,supplier_id, cb);
            },
            function (id, cb) {
                supplierId = id[0].supplier_id;
                supplierProfile.getSupplierInfoTab2(req.dbName,res, supplierId, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.changeBranchStatusExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var status = req.body.status;
    var values = [accessToken, sectionId, branchId, status];
    var data;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplierProfile.updateBranchStatus(req.dbName,res, branchId, status, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                data = []
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.deleteBranchExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var values = [accessToken, sectionId, branchId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                deleteBranch(req.dbName,res, branchId, cb);
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
};


exports.addBranchExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var name = req.body.name; // separated by #
    var branchName = req.body.branchName; // separated by #
    var languageId = req.body.languageId; // separated by #
    var email = req.body.email;
    var password = req.body.password;
    var country_code = req.body.country_code||"";
    var phone = req.body.phone;
    var primaryMobile = req.body.primaryMobile;
    var secondaryMobile = req.body.secondaryMobile;
    var address = req.body.address; // separated with #
    var areaId = req.body.areaId; //separated with #
    //console.log(req.body);
    var values = [accessToken, sectionId, name, branchName, languageId, email, password, phone, primaryMobile, secondaryMobile, address]
    var branchId;
    var supplier_id, supplierId;
    var add_area = req.body.add_areadId||"";
    var remove_area = req.body.remove_areaId||"";
    var latitude = req.body.latitude || 0;
    var longitude = req.body.longitude || 0;
    var is_area_restricted = req.body.is_area_restricted || 0;
    var delivery_type = req.body.delivery_type || 0;
    var delivery_radius = req.body.delivery_radius || 0;
    var logo_path="";
  console.log("...e.....",req.body);
  var logo_path="";
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
                 getId(req.dbName, res,supplier_id, cb);
            },
            function (id, cb) {
                supplierId = id[0].supplier_id;
                console.log("-get supplierid ==========",id[0].supplier_id)
                if (req.body.supplierBranchId) {
                    cb(null);
                }
                else {
                    supplierProfile.checkForSupplierBranchEmail(req.dbName,res, email, cb);
                }
            },
            function (cb) {
                name = name.split("#");
                languageId = languageId.split("#");
                branchName = branchName.split("#");
                address = address.split("#");
                password = md5(password);
                if (req.body.supplierBranchId) {
                    
                    supplierProfile.updateSupplierBranch(req.dbName,res, name[0], supplierId, branchName[0], email, password, phone, primaryMobile, secondaryMobile, address[0], req.body.supplierBranchId, 0,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,req.body.password, cb,country_code);

                }
                else {
                    supplierProfile.updateSupplierBranch(req.dbName,res, name[0], supplierId, branchName[0], email, password, phone, primaryMobile, secondaryMobile, address[0], "", 0,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,req.body.password, cb,country_code);

                }
            },
            function (branchId1, cb) {
                console.log("+==============hewr i am ===========")
                branchId = branchId1;
                if (req.body.multiLanguageId) {
                    supplierProfile.updateBranchInMultiLanguage(req.dbName,res, name, languageId, branchName, address, req.body.multiLanguageId, branchId, cb);
                }
                else {
                    supplierProfile.updateBranchInMultiLanguage(req.dbName,res, name, languageId, branchName, address, "", branchId, cb);
                }

            },
            async function (cb) {
                    if (req.files.logo) {
                        let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.logo)
                        logo_path = result;
                        cb(null);
                    } else {
                        cb(null);
                    }
                },
                async function (cb) {
                    if (req.files.logo) {
                        var sql = "update supplier_branch set logo=? where id=? "
                        multiConnection[req.dbName].query(sql, [logo_path, branchId], function (err, result) {
                            if (err) {
                                cb(err);
                            } else {
                                cb(null);
                            }
                        })
                    } else {
                        cb(null);
                    }
                },
        //     function (cb) {
        //         areaId = areaId.split("#");
        //         supplierProfile.updateBranchDeliveryAreas(req.dbName,res, areaId, branchId, cb);
        //     },
        //     function (cb) {
        //     if(req.body.supplierBranchId){
        //         supplierProfile.updateBranchAreaProduct(req.dbName,res,areaId,branchId,add_area,remove_area,cb);
        //     }
        //     else {
        //         cb(null);
        //     }
        // }
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
exports.addLogoBranchExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.supplierBranchId? req.body.supplierBranchId:"0";
    // var name = req.body.name; // separated by #
    // var branchName = req.body.branchName; // separated by #
    // var languageId = req.body.languageId; // separated by #
    // var email = req.body.email;
    // var password = req.body.password;
    // var country_code = req.body.country_code||"";
    // var phone = req.body.phone;
    // var primaryMobile = req.body.primaryMobile;
    // var secondaryMobile = req.body.secondaryMobile;
    // var address = req.body.address; // separated with #
    // var areaId = req.body.areaId; //separated with #
    // //console.log(req.body);
    var values = [accessToken, sectionId, branchId]
    // var supplier_id, supplierId;
    // var add_area = req.body.add_areadId||"";
    // var remove_area = req.body.remove_areaId||"";
    // var latitude = req.body.latitude || 0;
    // var longitude = req.body.longitude || 0;
    // var is_area_restricted = req.body.is_area_restricted || 0;
    // var delivery_type = req.body.delivery_type || 0;
    // var delivery_radius = req.body.delivery_radius || 0;
    var logo_path="";
  console.log("...e.....",req.body);
  var logo_path="";
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplierBranch(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                supplier_id = id;
                cb(null)
                // func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                 getId(req.dbName, res,supplier_id, cb);
            },
            function (id, cb) {
                console.log('id',id);
                
                supplierId = id[0].supplier_id;
                console.log("-get supplierid ==========",id[0].supplier_id)
                if (req.body.supplierBranchId) {
                    cb(null);
                }
                else {
                    supplierProfile.checkForSupplierBranchEmail(req.dbName,res, email, cb);
                }
            },
            // function (cb) {
            //     name = name.split("#");
            //     languageId = languageId.split("#");
            //     branchName = branchName.split("#");
            //     address = address.split("#");
            //     password = md5(password);
            //     if (req.body.supplierBranchId) {
                    
            //         supplierProfile.updateSupplierBranch(req.dbName,res, name[0], supplierId, branchName[0], email, password, phone, primaryMobile, secondaryMobile, address[0], req.body.supplierBranchId, 0,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,req.body.password, cb,country_code);

            //     }
            //     else {
            //         supplierProfile.updateSupplierBranch(req.dbName,res, name[0], supplierId, branchName[0], email, password, phone, primaryMobile, secondaryMobile, address[0], "", 0,latitude,longitude,delivery_radius,is_area_restricted,delivery_type,req.body.password, cb,country_code);

            //     }
            // },
            // function (branchId1, cb) {
            //     console.log("+==============hewr i am ===========")
            //     branchId = branchId1;
            //     if (req.body.multiLanguageId) {
            //         supplierProfile.updateBranchInMultiLanguage(req.dbName,res, name, languageId, branchName, address, req.body.multiLanguageId, branchId, cb);
            //     }
            //     else {
            //         supplierProfile.updateBranchInMultiLanguage(req.dbName,res, name, languageId, branchName, address, "", branchId, cb);
            //     }

            // },
            async function (cb) {
                    if (req.files.logo) {
                        let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.logo)
                        logo_path = result;
                        cb(null);
                    } else {
                        cb(null);
                    }
                },
                async function (cb) {
                    if (req.files.logo) {
                        var sql = "update supplier_branch set logo=? where id=? "
                        multiConnection[req.dbName].query(sql, [logo_path, branchId], function (err, result) {
                            if (err) {
                                cb(err);
                            } else {
                                cb(null);
                            }
                        })
                    } else {
                        cb(null);
                    }
                },
        //     function (cb) {
        //         areaId = areaId.split("#");
        //         supplierProfile.updateBranchDeliveryAreas(req.dbName,res, areaId, branchId, cb);
        //     },
        //     function (cb) {
        //     if(req.body.supplierBranchId){
        //         supplierProfile.updateBranchAreaProduct(req.dbName,res,areaId,branchId,add_area,remove_area,cb);
        //     }
        //     else {
        //         cb(null);
        //     }
        // }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = {
                    logo:logo_path
                };
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}


exports.listUnassignedAreasExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var values = [accessToken, sectionId];
    var supplier_id, supplierId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
                 getId(req.dbName, res,supplier_id, cb);
            },
            function (id, cb) {
                supplierId = id[0].supplier_id;
                supplierProfile.listAreasOfSupplier(req.dbName,res, supplierId, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );

}


exports.listCountryIdsExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var values = [accessToken, sectionId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplierProfile.listCountryWithNamesAndId(req.dbName,res, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.getCountryCityList = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var countryId = req.body.countryId;
    var values = [accessToken, sectionId,countryId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                loginFunctions.listCountryCity(req.dbName,res, cb, countryId);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.listZonesAccordingToCityId = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var cityId = req.body.cityId;
    var values = [accessToken, sectionId,cityId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id,cb) {
                loginFunctions.listZonesOfParticularCity(req.dbName,res, cb, cityId);
            }
        ], function (error, result) {
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}




exports.listAreaIdsExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var zoneId = req.body.zoneId;
    var values = [accessToken, sectionId, zoneId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id,cb) {
                supplierProfile.getAreaByZoneId(req.dbName,res, cb, zoneId);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}


exports.addSupplierDeliveryAreasExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var deliveryAreaIds = req.body.deliveryAreaIds;  // country#city#zone#area1@area2
    var supplierId, supplier_id;
    var values = [accessToken, sectionId, deliveryAreaIds];
    console.log("==============asdasdasdasddasdsdsfdff========================",req.body)
    async.waterfall([
            function (cb) {
                //console.log("val", values);
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
                 getId(req.dbName,res, supplier_id, cb);
            },
            function (id, cb) {
                supplierId = id[0].supplier_id;
                supplierProfile.insertDeliveryAreas(req.dbName,res,cb,deliveryAreaIds,supplierId);

            },
            function (cb) {
                supplierProfile.makeHeadBranch(req.dbName,res, supplierId,deliveryAreaIds, cb);
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
};


exports.removeSupplierDeliveryAreasExtranet = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var values = [accessToken, sectionId, id];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplierProfile.removeDeliveryAreas(req.dbName,res, id, cb);
            },
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


function deleteBranch(dbName,res, branchId, callback) {

    var sql = 'update supplier_branch sb join supplier_branch_area_product sbap on sbap.supplier_branch_id=sb.id join ' +
        'supplier_branch_delivery_areas sbda on sbda.supplier_branch_id = sb.id set sb.is_deleted=1,sbap.is_deleted=1,' +
        'sbda.is_deleted=1 where sb.id = ? ';
    multiConnection[dbName].query(sql, [branchId], function (err, result) {
        if (err) {
            console.log("err.....",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
        callback(null)
        }
        
    })
  /*  var sql = "update supplier_branch set is_deleted = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, [1, branchId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql = "update supplier_branch_delivery_areas set is_deleted = ? where supplier_branch_id = ?";
            multiConnection[dbName].query(sql, [1, branchId], function (err, result2) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    callback(null);
                }

            })


        }

    })*/

}


function addSupplierDeliveryAreas(res, supplierId, deliveryAreaIds, callback) {
    logger.debug("=======================firstone==========================")
    var ids = deliveryAreaIds.split("#");
    var areaIds = ids[3].split("@");
    var idsLength = areaIds.length;
    for (var i = 0; i < idsLength; i++) {
        (function (i) {
            var sql = "select id from supplier_delivery_areas where country_id = ? and city_id = ? and zone_id = ? and area_id = ? and supplier_id = ? and is_deleted = ? limit 1";
            multiConnection[dbName].query(sql, [ids[0], ids[1], ids[2], areaIds[i], supplierId, 0], function (err, result) {
                console.log(err);
                if (result.length) {
                    if (i == idsLength - 1) {
                        callback(null);
                    }
                }
                else {
                    var sql2 = "insert into supplier_delivery_areas(supplier_id,country_id,city_id,zone_id,area_id,is_active) values (?,?,?,?,?,?)";
                    multiConnection[dbName].query(sql2, [supplierId, ids[0], ids[1], ids[2], areaIds[i], 1], function (err, result) {

                        if (i == idsLength - 1) {
                            callback(null);
                        }

                    })
                }

            })

        }(i))

    }
}


/*
 * ------------------------------------------------------
 * Get tab 3 information of supplier profile(description, uniqueness, terms and conditions)
 * Output: supplier tab 3 information
 * ------------------------------------------------------
 */
exports.getRegSupplierExtranetInfoTab3 = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var values = [accessToken, sectionId];
    var supplierId, supplier_id;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
                 getId(req.dbName,res, supplier_id, cb);
            },
            function (id, cb) {
                supplierId = id[0].supplier_id;
                supplierProfile.getSupplierDataTab3(req.dbName,supplierId, res, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }


        }
    );

}


/*
 * ------------------------------------------------------
 * Save/Edit tab 3 information of supplier profile (description, uniqueness, terms and conditions)
 * Output: success/error
 * ------------------------------------------------------
 */
exports.saveSupplierExtranetInfoTab3 = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var description = req.body.description;
    var uniqueness = req.body.uniqueness;
    var t_and_c = req.body.t_and_c;
    var languageId = req.body.languageId;
    var descriptionId = req.body.descriptionId;
    var values = [accessToken, sectionId, description, uniqueness, t_and_c, languageId, descriptionId];
    logger.debug("===============values=============",values,req.body)
    var supplierId, supplier_id;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessTokenSupplier(req.dbName,accessToken, res, cb);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id, sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
                 getId(req.dbName,res,supplier_id, cb);
            },
            function (id, cb) {
                supplierId = id[0].supplier_id;
                //console.log(description);
                description = description.split("#");
                uniqueness = uniqueness.split("#");
                t_and_c = t_and_c.split("#");
                languageId = languageId.split("#");
                descriptionId = descriptionId.split("#");
                supplierProfile.saveSupplierDescription(req.dbName,res, supplierId, description[0], uniqueness[0], t_and_c[0], cb);
            }
            ,
            function (cb) {
                supplierProfile.updateDescription(req.dbName,res, description, uniqueness, t_and_c, descriptionId, cb);
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


// function getId(dbName,res, id, cb) {
//     logger.debug("==================entered in getId======================")
//     var sql = 'select supplier_id from supplier_admin where id=?';
//     logger.debug("==================entered in getId=============sqll=========")

//     var stat = multiConnection[dbName].query(sql, [id], function (err, id) {
//         logger.debug("=============after the query=============****===========")
//         if (err) {
//             logger.debug('error------', err,stat.sql);
//             sendResponse.somethingWentWrongError(res);

//         }
//         else {
//             logger.debug("==========in the else of getId===========",id)
//             //console.log('result-----', id);
//             cb(null, id);
//         }
//     })
// }
async function getId(dbName, res, id, cb) {
    try{
        var sql = 'select supplier_id from supplier_admin where id=?';
        let result=await ExecuteQ.Query(dbName,sql,[id]);
        if (result.length) {
            cb(null,result);
        } else {
            let bSql='select supplier_id from supplier_branch where id=?';
            let bResult=await ExecuteQ.Query(dbName,bSql,[id]);
            if (bResult.length){
                cb(null, bResult);
            }else{
                sendResponse.somethingWentWrongError(res);
            }
        }
    }
    catch(Err){
        logger.debug("=====Err!==",Err)
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = 'select supplier_id from supplier_admin where id=?';
    // multiConnection[dbName].query(sql, [id], function (err, result) {
    //     if (err) {
    //         console.log('error------', err);
    //         sendResponse.somethingWentWrongError(res);

    //     }
    //     else {
    //         //console.log('result-----',id);
    //         if (result.length) {
    //             cb(null,result);
    //         } else {
    //             var sql = 'select supplier_id from supplier_branch where id=?';
    //             multiConnection[dbName].query(sql, [id], function (err, result) {
    //                 if (err) {
    //                     console.log('error------', err);
    //                     sendResponse.somethingWentWrongError(res);

    //                 }
    //                 else {
    //                     //console.log('result-----',id);
    //                     if (result.length){
    //                         cb(null, result);
    //                     }else{
    //                         sendResponse.somethingWentWrongError(res);
    //                     }
    //                 }
    //             })
    //         }

    //     }
    // })
}

async function  updateSupplierLogo(dbName,res,supplierId,supplierLogoUrl,callback) {
    try{
    if(supplierLogoUrl == ""){
        callback(null)
    }
    else{
        var sql2 = " update supplier set logo=? where id=?";
        await ExecuteQ.Query(dbName,sql2,[supplierLogoUrl,supplierId])
        var sql3 = " update supplier_branch set logo=? where supplier_id=? and is_head_branch=1";
        await ExecuteQ.Query(dbName,sql3,[supplierLogoUrl,supplierId])
        // let stmt = multiConnection[dbName].query(sql2,[supplierLogoUrl,supplierId],function(err,result){
        //     if(err){
        //         sendResponse.somethingWentWrongError(res)
        //     } else{
        //         callback(null);
        //     }
        // })
        callback(null)
    }
}
catch(Err){
    logger.debug("===updateSupplierLogo===>>",Err)
    callback(null)
}
}
function  updateSupplierImage(dbName,res,supplierId,supplierImageUrl,callback) {
    if(supplierImageUrl.length == 0){
        callback(null)
    }
    logger.debug("=========update image ==========",supplierImageUrl)
    if(supplierImageUrl && supplierImageUrl.length>0){
        for(var i = 0;i< supplierImageUrl.length;i++){
            (function(i){
                var sql2 = " insert into supplier_image (supplier_id,image_path,orderImage) values(?,?,?) ";
                let stmt = multiConnection[dbName].query(sql2,[supplierId,supplierImageUrl[i].image,supplierImageUrl[i].order],function(err,result)
                {
                    logger.debug("=============update supplier image",stmt.sql)
                    if(err){
                        console.log("errr...",err);
                        sendResponse.somethingWentWrongError(res)
                    } else{
    
                        if(i == (supplierImageUrl.length -1)){
                            callback(null);
    
                        }
                    }
                })
            }(i));
        }
    }else{
        callback(null)
    }


}

exports.changeStatus = function(request,reply){
    var supplierId;
    var status;
    var accessToken;
    async.auto({
        getValue:function(cb){
            if(!(request.body.accessToken)){
                var msg = "accessToken  not found";
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                accessToken = request.body.accessToken;
            }
            if(!(request.body.status)){
                var msg = "status  not found";
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                status = request.body.status;
            }
            cb(null);
        },
        checkAccessToken:['getValue',function(cb){
            var sql = "select id from supplier where access_token =?";
            multiConnection[request.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if(result.length){
                        supplierId = result[0].id;
                        cb(null);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, reply, constant.responseStatus.INVALID_ACCESS_TOKEN);
                    }
                }
            })
        }],
        changeStatus:['checkAccessToken',function(cb){
            var day = moment().isoWeekday();
            day=day-1;
            console.log("status.....",day);
            var sql='update supplier s join supplier_timings st on s.id=st.supplier_id set s.status = ?,st.is_open = ? ' +
                'where s.id= ? and st.week_id = ?';
            multiConnection[request.dbName].query(sql,[status,status,supplierId,day],function (err,result) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null);
                }
            })
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(reply);
        }else{
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, reply, constant.responseStatus.SUCCESS);
        }
    })
}
