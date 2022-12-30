/**
 * Created by cbl98 on 9/5/16.
 */

var func = require('./commonfunction');
const uploadMgr = require('../lib/UploadMgr');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginfunctionsupplier');
var products = require('./product');
//var AdminMail = "mohit.codebrew@gmail.com"
var moment = require('moment');
const ExecuteQ=require('../lib/Execute')
var AdminMail = "ops@royo.com"
var emailTemp = require('./email');
var adminloginFunctions = require('./loginFunctions');
var _ = require('underscore');
var chunk = require('chunk')
var consts = require('../config/const')
var log4js=require("log4js")
const Universal=require('../util/Universal')

var logger = log4js.getLogger();
logger.level = 'debug';


exports.listProductofsupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    let searchText=req.body.serachText;
    var manValues = [accessToken,sectionId,categoryId,subCategoryId,detailedSubCategoryId];
    var supplier_id;
    var supplierId;
    var limit =parseInt(req.body.limit);
    var offset=parseInt(req.body.offset);
    console.log("************************************",req.body);
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
             getId(req.dbName,res,supplier_id,cb)
            },
            function (id,cb) {
                supplierId=id[0].supplier_id;

                 loginFunctions.listSupplierProducts(req.dbName,res, supplierId,categoryId,subCategoryId,detailedSubCategoryId,limit,offset,searchText, cb)
            },

        ], function (error, result) {
            
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                //console.log('---res===',result);
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

exports.addProductbysupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var name = req.body.name;
    let cart_image_upload=req.body.cart_image_upload || 0;
    let payment_after_confirmation=req.body.payment_after_confirmation || 0;
    // p.cart_image_upload,p.payment_after_confirmation
    var languageId = req.body.languageId;
    var priceUnit = req.body.priceUnit;
    var description = req.body.description;
    var sku = req.body.sku;
    var barCode = req.body.barCode;
    var count = req.body.count;
    var image = req.files.image;
    var imageOrder = req.body.imageOrder;
    var commissionType = req.body.commissionType;
    var commissionPackage = req.body.commissionPackage;
    var commission = req.body.commission;
    var unit=req.body.measuringUnit;
    var pricing_type=  req.body.pricing_type;
    var manValues = [accessToken,sectionId,categoryId,subCategoryId, detailedSubCategoryId, name, priceUnit, description, sku,unit, count, languageId, commission, commissionPackage, commissionType,pricing_type];
    var folder = "abc";
    var imageName = [];
    var supplierId;
    var productId;
    var names;
    var languages;
    var descriptions;
    var supplier_id;
    imageOrder = imageOrder.split(",");
    var supplierName,categories=[];
    var cateName,subcatName,detSubCatName;
    var product_variant_ids=[]
    var variant_id=req.body.variant_id!=undefined && req.body.variant_id!=""?req.body.variant_id:[]
    var quantity=req.body.quantity!=undefined && req.body.quantity!=""?req.body.quantity:0
    var parent_id=req.body.parent_id!=undefined && req.body.parent_id!=""?req.body.parent_id:0
    var brand_id=req.body.brand_id!=undefined && req.body.brand_id!=""?req.body.brand_id:0
    var is_product=req.body.is_product !=undefined && req.body.is_product!==""?req.body.is_product:1
    var duration=req.body.duration !=undefined && req.body.duration!==""?req.body.duration:0
    var interval_flag=req.body.interval_flag !=undefined && req.body.interval_flag!==""?req.body.interval_flag:0;
    var interval_value=req.body.interval_value !=undefined && req.body.interval_value!==""?req.body.interval_value:0;
    var is_driver=req.body.is_driver !=undefined && req.body.is_driver!==""?req.body.is_driver:0;
    var api_version=Universal.getVersioning(req.path);
    logger.debug(req.body,quantity);
    let is_prescribed=req.body.is_prescribed !=undefined && req.body.is_prescribed!==""?req.body.is_prescribed:0;

    async.auto({
        checkVariant:function (cb) {
            if(parent_id!=0){
                if(variant_id && variant_id.length>0){
                    var sqlS="select prv.product_id,prv.variant_id,count(prv.product_id) AS count  from product_variants prv where prv.variant_id IN (?) "+ 
                    " and prv.parent_id!=prv.product_id group by prv.product_id having count>=?"
                    var st=multiConnection[req.dbName].query(
                        sqlS,[variant_id,parseInt(variant_id.length)],function(er,variantDat){
                        if(err){
                            sendResponse.somethingWentWrongError(res);
                        }
                        else{
                            if(variantDat && variantDat.length>0){
                                sendResponse.sendSuccessData(data, constant.responseMessage.ProductVariant.ALREADY_EXIST, res, constant.responseStatus.SOME_ERROR);
                            }
                            else{
                                console.log("==H=",variantDat)
                                if(variantDat && variantDat.length>0){
                                    sendResponse.sendSuccessData({}, constant.ProductVariant.ALREADY_EXIST, res, constant.responseStatus.SOME_ERROR);
                                }
                                else{
                                    cb(null)
                                }
                            }
                        }
                        })
                       
                    }
                    else{
                        console.log("===PARAMS=MISSED=variant_id=",variant_id)
                        sendResponse.parameterMissingError(res);
                    }
                }
                else{
                    cb(null)
                }
            
        },
        checkBlank:['checkVariant',function (cb) {
            func.checkBlank(res, manValues, cb);
        }],
        authenticate:['checkBlank',function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                if(err){
                    console.log(".....err",err);
                sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplier_id = result;
                    cb(null)
                }
            },1);
        }],
        supplierId:['authenticate',function (cb) {

             getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    supplierName=result[0].name;

                    cb(null);
                }
            })

        }],
        insertProduct:['supplierId',function (cb) {
            names = name.split("#");
            languages = languageId.split("#");
            descriptions = description.split("#");
            unit=unit.split('#');

            logger.debug("req.dbName, supplierId, categoryId, subCategoryId, detailedSubCategoryId, names[0],"+
            "priceUnit, descriptions[0], sku, barCode,unit[0], commission, commissionType, commissionPackage,pricing_type,quantity,parent_id,brand_id,is_product,duration,interval_flag,interval_value,api_version,is_driver",
            req.dbName, supplierId, categoryId, subCategoryId, detailedSubCategoryId, names[0],
                 priceUnit, descriptions[0], sku, barCode,unit[0], commission, commissionType,
                  commissionPackage,pricing_type,quantity,parent_id,brand_id,is_product,duration,interval_flag,interval_value,api_version,is_driver
            
            )
            insertProduct(req.dbName,is_prescribed,res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, names[0],
                 priceUnit, descriptions[0], sku, barCode,unit[0], commission, commissionType,
                  commissionPackage,pricing_type,
                quantity,parent_id,brand_id,is_product,duration,interval_flag,
                interval_value,api_version,is_driver,cart_image_upload,
                payment_after_confirmation,0,function (err,result) {
                if(err){
                    console.log(".....err1.......",err);
                    sendResponse.somethingWentWrongError(res)
                }   
                else {
                    productId = result;
                    cb(null);
                }
            });
        }],
        multiLanguage:['insertProduct',function (cb) {
             insertProductNameInMultiLanguage(req.dbName,res, productId, names, descriptions, languages,unit,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    cb(null);
                }
            });
        }],
        insertInSupplierProduct:['insertProduct',function (cb) {
             insertproductsupplier(req.dbName,res,productId,supplierId,categoryId,subCategoryId,detailedSubCategoryId,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    cb(null);
                }
            });
        }],
        setImage:['insertProduct',function (cb) {
            for (var i = 0; i < count; i++) {
                (function (i) {
                    async.parallel([
                        async function (cbs) {
                            let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                            cbs(null,result)
                            // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                        }
                    ], function (err2, response2) {
                        /*        console.log("..............imageOrder...................",imageOrder[i]);
                         console.log("..............response2...................",response2);
                         */
                        imageName.push({order:imageOrder[i],image:response2});
                        //console.log("==============response2===============" + response2);
                        if (imageName.length == count) {
                            //console.log("==========imagename===========" + JSON.stringify(imageName));
                            cb(null);
                        }
                    })
                }(i))
            }
        }],
        insertImage:['setImage',function (cb) {
             insertProductImages(req.dbName,res, imageName, productId,0,0, function (err,result) {
                if(err){
                    console.log("...1...",err,result);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    cb(null);
                }
            });

        }],
        insertVariants:['insertImage',function(cb){
                // console.log("===variant_id==",variant_id)
                var parent_ids=parent_id==0?productId:parent_id
                if(variant_id && variant_id.length>0){
                    _.each(variant_id,function(i){
                        product_variant_ids.push(
                            productId,
                            i,
                            parent_ids
                        )
                    })
                  var final_value=chunk(product_variant_ids,3);
                    insertProductVarints(req.dbName,res,final_value,cb);
                }
                else{
                    cb(null)
                } 
           
        }],
        getData:['insertVariants',function (cb) {
            categories.push(categoryId);
            categories.push(subCategoryId);
            categories.push(detailedSubCategoryId);
            categories=categories.toString();
            var sql='select name from categories where id IN('+categories+')';
            multiConnection[req.dbName].query(sql,function (err,result) {
                if(err){
                    console.log("......",err,result);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    cateName=result[0].name;
                    if(result[1]){
                        subcatName=result[1].name;
                    }
                    var detSubCat=parseInt(detailedSubCategoryId);
                    if(detSubCat && result[2]){
                        detSubCatName=result[2].name;
                    }
                    else {
                        detSubCatName='';
                    }
                    cb(null)
                }
            })
        }],
        sendAdminMail:['getData',function(cb){
            emailTemp.addProductBySupplier(req,res,AdminMail,supplierName,productId,name[0],cateName,subcatName,detSubCatName,function(err,result){
                if(err){
                    console.log("..****register email*****....",err);
                }
            })
            cb(null)
        }],
    },function (err,result) {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else {
            var data = {productId:productId};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.deleteproduct = function(req,res) {
    var accessToken = req.body.accessToken;
    var productId = req.body.productId;
    var manValues = [accessToken,productId];
    var supplierId;
    var supplier_id;
    var product = productId.split("#").toString();
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplier_id=id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,0, res, cb);
            // },
            function (id, cb) {
                supplier_id=id;
             getId(req.dbName,res,supplier_id,cb)
            },
            function (id,cb) {
                supplierId=id[0].supplier_id;
                deleteProduct(req.dbName,res,product, cb);
            },
            function(cb)
            {
                deleteSupplierProduct(req.dbName,res,product,supplierId,cb);
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

exports.productdescription = function (req,res) {
    var accessToken = req.body.accessToken;
    var productId = req.body.productId;
    var languageId=req.body.language;
    var manValues = [accessToken,productId,languageId];
    var supplierId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplierId=id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,0, res, cb);
            // },
            function (id, cb) {
                supplierId = id;
                productdescription(req.dbName,res,productId,languageId,cb)
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                //console.log('result1-------',result);
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

exports.addPricingOfProductBysupplier = function(req,res) {
    var dbName = req.dbName;
    var accessToken = req.body.accessToken;
    var productId = req.body.productId;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var price = req.body.price;
    var displayPrice = req.body.displayPrice;
    var handlingFeeSupplier = req.body.handlingFeeSupplier;
    var isUrgent = req.body.isUrgent;
    var urgentPrice = req.body.urgentPrice;
    var urgentType = req.body.urgentType;
    let handlingFeeAdmin = req.body.handlingFeeAdmin
    var deliveryCharges = req.body.deliveryCharges;
    var offerType = req.body.offerType;
    var productPricingId=0;
    var supplier_id,supplierId;
    var sectionId = req.body.sectionId;
    var minOrder = req.body.minOrder;
    var chargesBelowMinOrder = req.body.chargesBelowMinOrder;
    var areaId = req.body.areaId;
    var pricing_type = req.body.pricing_type;
    //console.log("opeee",typeof (price))
    //console.log("opeee",.stringyfy(price))
    var manValues = [accessToken, sectionId, productId, startDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, displayPrice,pricing_type];
    var adminId;
    var actualPrice=0;
    var type = req.body.type; // 0-- admin, 1 -- supplier, 2 -- supplier branch
    var id = req.body.id; // supplier id or supplier branch id
    let service_type = req.service_type
    let actualProductPrice="";
    if(req.body.actualProductPrice && req.body.actualProductPrice!=undefined && req.body.actualProductPrice!=null){
         actualProductPrice=req.body.actualProductPrice;
         displayPrice = price;
    }
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            // },
            function (id, cb) {
                supplier_id = id;
                 getId(req.dbName,res,supplier_id,cb)
            },
            async function (id,cb) {
                supplierId=id[0].supplier_id;

                let checkUserType = await Universal.getUserPriceType(req.dbName);
                console.log("=======checkUserType=====>>",checkUserType)
                if (checkUserType && checkUserType.length > 0) {

                    if (service_type == 1 || service_type == 2) {
                        if (discountPrice && discountPrice.length > 0) {
                            for (const [index, i] of discountPrice.entries()) {
                                await insertProductPriceNew(req.dbName, res, productId, i.startDate, i.endDate, i.price, handlingFeeAdmin,
                                    handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder,
                                    chargesBelowMinOrder, urgentType, i.offerType, type, id, i.displayPrice, i.discountPrice,
                                    i.discountStartDate, i.discountEndDate, pricing_type, houseCleaningPrice, beautySaloonPrice, i.user_type_id);
                            }
                        } else {

                            for (const [index, i] of price.entries()) {
                                await insertProductPriceNew(req.dbName, res, productId, i.startDate, i.endDate, i.price, handlingFeeAdmin,
                                    handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder,
                                    chargesBelowMinOrder, urgentType, i.offerType, type, id, i.displayPrice, "",
                                    "", "", pricing_type, houseCleaningPrice, beautySaloonPrice, i.user_type_id);
                            }
                        }
                        cb(null);
                    }
                    else{
                        for (const [index, i] of price.entries()) {

                        await insertProductPriceNew(req.dbName, res, productId, i.startDate, i.endDate, i.price, handlingFeeAdmin,
                            handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder,
                            chargesBelowMinOrder, urgentType, i.offerType, type, id, i.displayPrice, "",
                            "", "", pricing_type, houseCleaningPrice, beautySaloonPrice, i.user_type_id);
                        }
                            cb(null);
                    }
                    
                }else{
                    if (req.body.discountPrice) {

                        var discountPrice = req.body.discountPrice;
                        var discountStartDate = req.body.discountStartDate;
                        var discountEndDate = req.body.discountEndDate;
                        if (req.body.houseCleaningPrice) {
                            console.log("=============1=====================",discountStartDate,discountEndDate)
                            var houseCleaningPrice = req.body.houseCleaningPrice;
                            insertPricing(req.dbName,res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, displayPrice, houseCleaningPrice, 0, discountPrice, discountStartDate, discountEndDate,pricing_type, actualProductPrice,cb);
                        }
                        else if (req.body.beautySaloonPrice) {
                            console.log("=============2====================",discountStartDate,discountEndDate)
                            var beautySaloonPrice = req.body.beautySaloonPrice;
                            insertPricing(req.dbName,res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType,  displayPrice, 0, beautySaloonPrice, discountPrice, discountStartDate, discountEndDate,pricing_type, actualProductPrice,cb);
                        }
                        else {
                            console.log("=============3=====================",discountStartDate,discountEndDate)
                            insertPricing(req.dbName,res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType,  displayPrice, 0, 0, discountPrice, discountStartDate, discountEndDate,pricing_type, actualProductPrice,cb);
                        }
        
                    }
                    else {
                        if (req.body.houseCleaningPrice) {
                            var houseCleaningPrice = req.body.houseCleaningPrice;
                            insertPricing(req.dbName,res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, displayPrice, houseCleaningPrice, 0, 0, 0, 0,pricing_type, actualProductPrice,cb);
                        }
                        else if (req.body.beautySaloonPrice) {
                            var beautySaloonPrice = req.body.beautySaloonPrice;
                            insertPricing(req.dbName,res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, displayPrice, 0, beautySaloonPrice, 0, 0, 0,pricing_type, actualProductPrice,cb);
                        }
                        else {
                            insertPricing(req.dbName,res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, displayPrice, 0, 0, 0, 0, 0,pricing_type,actualProductPrice, cb);
                        }
                    }
                }
        },
         /*   function (id,cb) {
                supplierId=id[0].supplier_id;
                if (req.body.houseCleaningPrice) {
                    insertProductPricing(res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, productPricingId, req.body.houseCleaningPrice, 0,supplierId, cb);
                }
                else if (req.body.beautySaloonPrice) {
                    insertProductPricing(res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, productPricingId, 0, req.body.beautySaloonPrice,supplierId, cb);
                }
                else {
                    insertProductPricing(res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, productPricingId, 0, 0, supplierId,cb);
                }
            },*/
        ], function (error) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = []
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

exports.editPricingOfProductBysupplier = function(req,res) {
    var accessToken = req.body.accessToken;
    var productPricingId = req.body.productPricingId;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var price = req.body.price;
    var handlingFeeSupplier = req.body.handlingFeeSupplier;
    var isUrgent = req.body.isUrgent;
    var urgentPrice = req.body.urgentPrice;
    var commission = req.body.commission;
    var deliveryCharges = req.body.deliveryCharges;
    var commissionType = req.body.commissionType;
    var urgentType = req.body.urgentType;
    var manValues = [accessToken, productPricingId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, commission, deliveryCharges, commissionType, urgentType];
    var insertValues = [startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, commission, deliveryCharges, commissionType, urgentType, productPricingId];
    var supplierId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplierId = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,0, res, cb);
            // },
             function (id, cb) {
                supplierId = id;
                editProductPricing(res, insertValues, cb);
            },
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = []
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

exports.productpricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var productId = req.body.productId;
    var manValues = [accessToken, productId];
    var supplier_id;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,0, res, cb);            
            // },
            function (id, cb) {
                supplier_id = id;
                listProductPriceDetails(req.dbName,res, productId, cb);
            },
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

exports.listProductDetailsOfSupplierBranch = function (req, res) {
    var serachType = 0;
    var serachText = '';
    if(req.body.serachType){
        serachType=parseInt(req.body.serachType);
    }
    if(req.body.serachText){
        serachText=req.body.serachText;
    }
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, branchId, categoryId, subCategoryId, detailedSubCategoryId];
    var supplier_id=0;
    var supplierId=0;
    var limit = 0;
    var offset =  0;
    var product=[];
        limit = parseInt(req.body.limit);
    
        offset = parseInt(req.body.offset)
    var data = {};
    
    console.log("**************",req.body);
    
    async.auto({
        checkBlank:function (cb) {
            func.checkBlank(res, manValues, cb); 
        },
        authenticate:['checkBlank',function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                if(err){
                    console.log("......errr.......",err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    supplier_id = result;
                    cb(null);
                }
            },1);
        }],
        // checkAuthority:['authenticate',function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res, cb);
        // }],
      /*  getSupplier:['checkAuthority',function (cb) {
            getId(res,supplier_id,function (err,result) {
                if(err){
                    console.log("......errr1.......",err)
                    sendResponse.somethingWentWrongError(res);  
                }
                else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })
        }],*/
        branchProducts:['authenticate',function (cb) {

            products.listSupplierBranchProducts(req.dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId,limit,offset,serachType,serachText, function (err,result) {
                if(err){
                    console.log("......errr2.......",err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    product=result;
                    cb(null);
                }
            });
        }],
        productCount:['branchProducts',async function (cb) {
            try{
            console.log("dddd",product.length)

            if(serachType == 0){
                var sql = "select p.name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
                sql += " join product p on sp.product_id = p.id join categories c on c.id = p.category_id join currency_conversion curr ";
                sql += " on curr.id = p.price_unit where sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ?";

            } else {
                var sql = "select p.name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id," +
                    " p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable," +
                    "c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
                sql += " join product p on sp.product_id = p.id join categories c on c.id = p.category_id join currency_conversion curr ";
                sql += " on curr.id = p.price_unit where sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? " +
                    "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%' " +
                    " or p.sku LIKE '%"+serachText+"%' or p.product_desc LIKE '%"+serachText+"%' or c.name LIKE '%"+serachText+"%'  or c.name LIKE '%"+serachText+"%' or p.name LIKE '%"+serachText+"%') ";
            }
            let products=await ExecuteQ.Query(req.dbName,sql,[branchId,0,categoryId,subCategoryId,detailedSubCategoryId])
            // multiConnection[req.dbName].query(sql, [branchId,0,categoryId,subCategoryId,detailedSubCategoryId], function (err, products) {
            //     if (err) {
            //         console.log("err1.....",err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
                    data.products=product;
                    data.product_count=products.length;

                    if(data.products.length){
                        var len = data.products.length;
                        for(var i =0;i < len;i++){
                            (async function(i){
                                var sql = "SELECT p.user_type_id,p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
                                    sql += " ,p.price_type,";
                                    sql += " p.delivery_charges from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
                                    sql += " p.is_deleted = ? and p.product_id = ? " +
                                        " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
                            let priceData=await ExecuteQ.Query(req.dbName,sql,[0,data.products[i].id])
                             //    let stmt = multiConnection[req.dbName].query(sql, [0,data.products[i].id],function(err,priceData) {
                            //        console.log("===========price id sql =====1====",stmt.sql)
                                    data.products[i].price = priceData;
                                    if(i == (len -1)){
                                        cb(null)
                                    }
                                // })
                        }(i));
                    }}
                    else{
                        cb(null)
                    }
            //     }

            // })
                }
                catch(Err){
                    logger.debug("==Err!==",Err);
                    sendResponse.somethingWentWrongError(res);
                }
        }]
        
    },function (err,result) {
        if(err){
            console.log("final",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);      
        }
    })
    
    
    /*
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(accessToken, res, cb,1);
            },
            function (id, cb) {
                supplier_id = id;
                func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            },
            function (cb) {
                products.listSupplierBranchProducts(req.dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId,limit,offset,cb);
            },
        function (product,cb) {
            var sql = "select p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
            sql += " join product p on sp.product_id = p.id join categories c on c.id = p.category_id join currency_conversion curr ";
            sql += " on curr.id = p.price_unit where sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ?";
            multiConnection[dbName].query(sql, [branchId,0,categoryId,subCategoryId,detailedSubCategoryId], function (err, products) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("res...",products)
                    data.product=product;
                    data.product_count=products.length;
                    cb(null);
                }

            })
        }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );*/
}


exports.listProductDetailsOfSupplierBranchV1 = function (req, res) {


    var serachType = 0;
    var serachText = '';
    if(req.body.serachType){
        serachType=parseInt(req.body.serachType);
    }
    if(req.body.serachText){
        serachText=req.body.serachText;
    }
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, branchId, categoryId, subCategoryId, detailedSubCategoryId];
    var supplier_id=0;
    var supplierId=0;
    var limit = 0;
    var offset =  0;
    var product=[];
        limit = parseInt(req.body.limit);
    
        offset = parseInt(req.body.offset)
    var data = {};
    var tags = req.body.tagText ? req.body.tagText : "";
    
    console.log("**************",req.body);
    
    async.auto({
        checkBlank:function (cb) {
            func.checkBlank(res, manValues, cb); 
        },
        authenticate:['checkBlank',function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                if(err){
                    console.log("......errr.......",err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    supplier_id = result;
                    cb(null);
                }
            },1);
        }],
        
        branchProducts:['authenticate',function (cb) {
            products.listSupplierBranchProductsV1(req.dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId,limit,offset,serachType,serachText,tags, function (err,result) {
                if(err){
                   sendResponse.somethingWentWrongError(res);
                }
                else {
                    product=result;
                    cb(null);
                }
            });
        }],
        productCount:['branchProducts',async function (cb) {
            try{
            
            var qr = "";
            if(tags!=""){
              qr = " and find_in_set('"+tags+"',p.product_tags) "
            }

            if(serachType == 0){
                var sql = "select p.name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
                sql += " join product p on sp.product_id = p.id join categories c on c.id = p.category_id join currency_conversion curr ";
                sql += " on curr.id = p.price_unit where sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? "+qr;

            } else {
                var sql = "select p.name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id," +
                    " p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable," +
                    "c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
                sql += " join product p on sp.product_id = p.id join categories c on c.id = p.category_id join currency_conversion curr ";
                sql += " on curr.id = p.price_unit where sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? " +
                    "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%' " +
                    " or p.sku LIKE '%"+serachText+"%' or p.product_desc LIKE '%"+serachText+"%' or c.name LIKE '%"+serachText+"%'  or c.name LIKE '%"+serachText+"%' or p.name LIKE '%"+serachText+"%') " +qr;
            }
            let products=await ExecuteQ.Query(req.dbName,sql,[branchId,0,categoryId,subCategoryId,detailedSubCategoryId])
                    data.products=product;
                    data.product_count=products.length;

                    if(data.products.length){
                        var len = data.products.length;
                        for(var i =0;i < len;i++){
                            (async function(i){
                                let actualPriceQuery="";
                                //let query="SELECT *  FROM `tbl_setting` WHERE `key` = 'enable_actual_price' AND `value` = '1'"
                               // let enableActualPrice=await ExecuteQ.Query(req.dbName,query)
                                if(req.dbName == "yunofood_0906" ){
                                    actualPriceQuery="p.actual_price,"
                                }
                                var sql = "SELECT p.tax_type,p.tax_value,"+actualPriceQuery+"p.user_type_id,p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
                                    sql += " ,p.price_type,";
                                    sql += " p.delivery_charges from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
                                    sql += " p.is_deleted = ? and p.product_id = ? " +
                                        " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
                            let priceData=await ExecuteQ.Query(req.dbName,sql,[0,data.products[i].id])
                             //    let stmt = multiConnection[req.dbName].query(sql, [0,data.products[i].id],function(err,priceData) {
                            //        console.log("===========price id sql =====1====",stmt.sql)
                                    data.products[i].price = priceData;
                                    if(i == (len -1)){
                                        cb(null)
                                    }
                        }(i));
                    }}
                    else{
                        cb(null)
                    }
                }
                catch(Err){
                    logger.debug("==Err!==",Err);
                    sendResponse.somethingWentWrongError(res);
                }
        }]
        
    },function (err,result) {
        if(err){
            console.log("final",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);      
        }
    })
}
/**
 * @description used for assigning product to branch from admin level product from supplier panel
 */
exports.assignProductToSupplierBranch = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId!=undefined && req.body.subCategoryId!=""?req.body.subCategoryId:0;
    var detailedSubCategoryId = req.body.detailedSubCategoryId!=undefined && req.body.detailedSubCategoryId!=""?req.body.detailedSubCategoryId:0;
    console.log('---',req.body.detailedSubCategoryId)
    var productId = req.body.productId;
    var manValues = [accessToken, sectionId, branchId, productId, categoryId];
    var supplier_id;
    var productIds;
    var newId;
    var oldId,supplierId;
    var category,subCategory,detailedSubCategory;
    var commission, commissionType;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
             function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            // supplier_id = id;
            // func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            // },
            function (id,cb) {
                supplier_id = id;
             getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })
            },
           async function (cb) {
                console.log('------de-eeeeeeeeeee=',detailedSubCategoryId)
                // checkForProductsForBranch(req.dbName,res, branchId,categoryId,subCategoryId,detailedSubCategoryId, productId, cb);
                let productData = await checkForProductsForBranch(req.dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId, productId);
                logger.debug("===============prdouct data---==========-------======",productData)
                let ids = productData[0]
                let cat = productData[1]
                let subCat = productData[2]
                let detSubCat = productData[3]
                let commission1 = productData[4]
                let commissionType1 = productData[5]
                cb(null,ids,cat,subCat,detSubCat)    
            }, 
            async function (ids,cat,subCat,detSubCat,cb) {
                console.log("=========ids =========1",ids)
                ids = ids + '#';
                console.log("=========ids =========2",ids)
                oldId = (ids).split('#');
                console.log("=========ids =========3",oldId)
                oldId.pop();
                category=cat;
                subCategory=subCat;
                detailedSubCategory=detSubCat;
                if (oldId != "") {
                   let insertIds = await getData(req.dbName,res, oldId,0,0,0, cb);
                   cb(null,insertIds)
                } 
                else {
                    cb(null,[]);
                }
            },
            async function (ids,cb) {
                console.log("=========ids =========4",ids)
                newId=ids;
                if (oldId != "") {
                //console.log('ids',newId);
                await multilanguage(req.dbName,res,ids,oldId,cb);
                await Universal.copyAddsOnExistingPoduct(req.dbName,oldId,ids);
                cb(null);
            }
            else {
                cb(null);
                }
            },
            async function(cb){
                if (oldId != "") {
                    await productImage(req.dbName,res,newId,oldId)
                    cb(null)
            }
            else {
                cb(null);
            }
        },
        async function(cb){
            if (oldId != "") {
               await productPricing(req.dbName,res,newId,oldId,cb);
               cb(null)
            }
            else {
                cb(null);
            }
        },
        async function (cb) {
            if (oldId != "") {
                console.log("=new -=======and ---old ids=-=========",newId,oldId)
                await assignProductToSupplierBranch(req.dbName,res, branchId, newId, oldId,category, subCategory, detailedSubCategory, cb);
                cb(null)
            }
            else {
                cb(null);
            }
        }
        // ,
        // function (cb) {
        //     if(consts.LOCATION_FLOW.flow==0){
        //         if (productIds != "") {
        //             //console.log("here");
        //             updateAreaWiseDeliveryCharges(res,newId, supplierId, branchId, cb);
        //         }
        //         else {
        //             cb(null);
        //         }
        //     }else{
        //         cb(null)
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
async function getProductImages(dbName,res,productId,callback){
    try{
        var sql = "select image_path,imageOrder from product_image where product_id=?"
       let result =  await ExecuteQ.Query(dbName,sql,[productId]);
    // multiConnection[dbName].query(sql,[productId],function(err,result){
    //     if(err){
    //         sendResponse.somethingWentWrongError(res)
    //     }else{
            callback(null,result)
    //     }
    // })
    }
    catch(Err){
        logger.debug("==Err!==",Err);
        sendResponse.somethingWentWrongError(res)
    }
}
exports.addSupplierBranchProduct = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var priceUnit = req.body.priceUnit;
    var description = req.body.description;
    var calories = req.body.calories;
    var measuringUnit = req.body.measuringUnit;
    var sku = req.body.sku;
    var barCode = req.body.barCode;
    var count = req.body.count;
    var image = req.files.image;
    var commission = req.body.commission;
    var commissionType = req.body.commissionType;
    var pricing_type = req.body.pricing_type!=undefined?req.body.pricing_type:0
    var commissionPackage = req.body.commissionPackage;
    console.log('========sttastat========',req.body)
    let cart_image_upload=req.body.cart_image_upload || 0;
    let payment_after_confirmation=req.body.payment_after_confirmation || 0;

    var manValues = [accessToken, sectionId, measuringUnit, branchId, categoryId, subCategoryId, detailedSubCategoryId, name, languageId, priceUnit, description, commission, commissionType, commissionPackage, count];
    console.log("==manValues=",manValues)
    var folder = "abc";
    var names;
    var languages;
    var descriptions;
    var productId;
    var supplierId;
    var categories=[];
    var supplierName;
    var supplier_id;
    var subcatName;
    var cateName;
    var detSubCatName;
    var imageName = [];
    var imageOrder = req.body.imageOrder;
    imageOrder = imageOrder.split(',');
    var product_variant_ids=[]
    var quantity=req.body.quantity!=undefined && req.body.quantity!=""?req.body.quantity:0
    var parent_id=req.body.parent_id!=undefined && req.body.parent_id!=""?req.body.parent_id:0
    var brand_id=req.body.brand_id!=undefined && req.body.brand_id!=""?req.body.brand_id:0
    var variant_id=req.body.variant_id!=undefined && req.body.variant_id!=""?req.body.variant_id:[]
    var is_product=req.body.is_product !=undefined && req.body.is_product!==""?req.body.is_product:1
    var duration=req.body.duration !=undefined && req.body.duration!==""?req.body.duration:0
    var interval_flag=req.body.interval_flag !=undefined && req.body.interval_flag!==""?req.body.interval_flag:0;
    var interval_value=req.body.interval_value !=undefined && req.body.interval_value!==""?req.body.interval_value:0;
    var is_driver=req.body.is_driver !=undefined && req.body.is_driver!==""?req.body.is_driver:0;
    var path=Universal.getVersioning(req.path),api_version=Universal.getVersioning(req.path)
    let is_appointment = req.body.is_appointment!==undefined && req.body.is_appointment!==""?
    req.body.is_appointment:0


    let customTabDescription1 = req.body.customTabDescription1?req.body.customTabDescription1:null;
    let customTabDescription2 = req.body.customTabDescription2?req.body.customTabDescription2:null;
   
    let item_unavailable = req.body.item_unavailable==undefined?0:req.body.item_unavailable
    let is_non_veg = req.body.is_non_veg!==undefined && req.body.is_non_veg!==""?req.body.is_non_veg:0;
    let making_price=req.body.making_price !=undefined && req.body.making_price!==""?req.body.making_price:0;
    let zipcode=req.body.zipcode;
    if(req.body.zipcode){
        zipcode=zipcode.split(",")
    }
    
    let stock_number=req.body.stock_number;
    let grade=req.body.grade;

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            async function (cb) {
                if(parent_id!=0){
                    if(variant_id && variant_id.length>0){
                        try{
                            var sqlS="select prv.product_id,prv.variant_id,count(prv.product_id) AS count  from product_variants prv where prv.variant_id IN (?) "+ 
                            " and prv.parent_id!=prv.product_id group by prv.product_id having count>=?"
                            await ExecuteQ.Query(req.dbName,sqlS,[variant_id,parseInt(variant_id.length)])
                        // var st=multiConnection[req.dbName].query(sqlS,[variant_id,parseInt(variant_id.length)],function(err,variantDat){
                        //     if(err){
                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        //     else{
                                // if(variantDat && variantDat.length>0){
                                //     sendResponse.sendSuccessData({}, constant.ProductVariant.ALREADY_EXIST, res, constant.responseStatus.SOME_ERROR);
                                // }
                                // else{
                                    cb(null)
                                // }
                        //     }

                        // })
                        }
                        catch(Err){
                            logger.debug("===Err!==",Err)
                            sendResponse.somethingWentWrongError(res);
                        }
                       
                    }
                    else{
                        console.log("===PARAMS=MISSED=variant_id=",variant_id)
                        sendResponse.parameterMissingError(res);
                    }
                }
                else{
                    cb(null)
                }
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            }, 
            // function (id, cb) {
            //     supplier_id=id
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            // },
            function (id,cb) {
                supplier_id = id;
                 getId(req.dbName,res,supplier_id,function (err,result) {
                    if(err){
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        supplierId=result[0].supplier_id;
                        supplierName=result[0].name;

                        cb(null);
                    }
                })
            },
            function (cb) {
                names = name.split("#");
                languages = languageId.split("#");
                descriptions = description.split("#");
                measuringUnit = measuringUnit.split("#");
                
                insertProductBySupplierBranch(req.dbName,res,
                     supplierId, categoryId, subCategoryId,
                      detailedSubCategoryId, names[0], priceUnit,
                       descriptions[0], sku, barCode, commission,
                        commissionType, commissionPackage,
                         measuringUnit[0],pricing_type,quantity,
                         parent_id,brand_id,is_product,duration,
                         interval_flag,interval_value,api_version,
                         is_driver, cart_image_upload,
                         payment_after_confirmation,
                         item_unavailable,is_non_veg,is_appointment,calories,cb,making_price);
            },
            async function (id, cb) {
                productId = id;

                           //add grade and stock_number of the part

                           const stockNumberSettingKeys=await func.getSettingDataKeyAndValuev1(req.dbName,['enable_stock_number']);
                           stockNumberSettingKeys.keyAndValue.enable_stock_number= !!stockNumberSettingKeys.keyAndValue.enable_stock_number;
                           if(stockNumberSettingKeys.keyAndValue.enable_stock_number === true){
                               let sql="UPDATE product SET stock_number=? WHERE id=?";
                               let params=[stock_number,productId];
                               await ExecuteQ.Query(req.dbName,sql,params);
                           }
           
                           const gradeSettingKeys=await func.getSettingDataKeyAndValuev2(req.dbName,['enable_grading']);
                           gradeSettingKeys.keyAndValue.enable_grading= !!gradeSettingKeys.keyAndValue.enable_grading;
                           if(gradeSettingKeys.keyAndValue.enable_grading === true){
                               let sql="UPDATE product SET grade=? WHERE id=?";
                               let params=[grade,productId];
                               await ExecuteQ.Query(req.dbName,sql,params);
                           }
           
                           // assign zipcode to products.............
           
                           const zipcodeSettingKeys=await func.getSettingDataKeyAndValuev3(req.dbName,["enable_zipcode"]);
                           zipcodeSettingKeys.keyAndValue.enable_zipcode=!!zipcodeSettingKeys.keyAndValue.enable_zipcode;
                           if(zipcodeSettingKeys.keyAndValue.enable_zipcode === true)
                           {
                                for(var [keys,values] of Object.entries(zipcode))
                               {
                                   let sql="insert into zipcode(zipcode,supplier_id,product_id) values (?,?,?) ";
                                   let params=[zipcode[keys],supplierId,productId]
                                   await ExecuteQ.Query(req.dbName,sql,params);
                                
                               }
                               
                           }

                //================
    // Adding productCustomTabDescriptionLabel per supplier
        const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['isProductCustomTabDescriptionEnable']);
        settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable = !!settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable;
       if(settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable === true){
            let sql = "UPDATE product SET customTabDescription1 =?,customTabDescription2=? WHERE id = ?;";
            let params = [customTabDescription1,customTabDescription2,productId];
            await ExecuteQ.Query(req.dbName,sql,params);    
       }

                //========


                 insertProductNameInMultiLanguage(req.dbName,res, productId, names, descriptions, languages, measuringUnit, cb);
            },
            function (cb) {
                // console.log("===variant_id==",variant_id)
                var parent_ids=parent_id==0?productId:parent_id
                if(variant_id && variant_id.length>0){
                    _.each(variant_id,function(i){
                        product_variant_ids.push(
                            productId,
                            i,
                            parent_ids
                        )
                    })

                    var final_value=chunk(product_variant_ids,3);
                     insertProductVarints(req.dbName,res,final_value,cb);
                    
                }
                else{
                    cb(null)
                } 
            },
        function(cb){
            if(parent_id!=0){
                getProductImages(req.dbName,res,parent_id,cb)


            }else{
                logger.debug("============debug=============8=")
                cb(null,[])
            }
        },
        function (result,cb) {
            // function (cb) {
            if(parent_id!=0){
                logger.debug("============debug=============9=",result)
                if (result && result.length) {
                    _.each(result, function (obj) {
                        logger.debug("============debug=============10=",result)
                        imageName.push(
                            {
                                image: obj.image_path, order: obj.imageOrder
                            }
                        )
                    })
                    if (count > 0) {
                        logger.debug("============debug=============11=",count)
                        for (var i = 0; i < count; i++) {
                            (function (i) {
                                logger.debug("============debug=============12=",count)
                                imageName = _.reject(imageName, function (obj) {

                                    return obj.order == imageOrder[i]

                                })

                                async.waterfall([
                                    async function (cbs) {
                                        let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                        cbs(null,result);
                                        // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                    }
                                ], function (err2, response2) {

                                    logger.debug("============debug=============13=",response2,imageName)
                                    imageName.push({ image: response2, order: imageOrder[i] });
                                    logger.debug("============debug=============14=",imageName)
                                    //console.log("==============response2===============" + response2);
                                    if (imageName.length >= count) {
                                        //console.log("==========imagename===========" + JSON.stringify(imageName));
                                        cb(null);
                                    }
                                })
                            }(i))
                        }
                    }else{
                        imageName.push({order:1,image:config.get("defaultLogo")});
                        cb(null)
                    }
                }else{
                    if(count>0){
                        for (var i = 0; i < count; i++) {
                            (function (i) {
                                async.waterfall([
                                    async function (cbs) {
                                        let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                        cbs(null,result);
                                        // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                    }
                                ], function (err2, response2) {

                                    logger.debug("============debug=============15=",response2,imageName)
                                    imageName.push({image:response2,order:imageOrder[i]});
                                    //console.log("==============response2===============" + response2);
                                    if (imageName.length >= count) {
                                        logger.debug("============debug=============16=",imageName)
                                        //console.log("==========imagename===========" + JSON.stringify(imageName));
                                        cb(null);
                                    }
                                })
                            }(i))
                        }
                    }else{
                        imageName.push({order:1,image:config.get("defaultLogo")});
                        cb(null)
                    }
                }
            }
            else
            {
                if(count>0){
                    for (var i = 0; i < count; i++) {
                        (function (i) {
                            logger.debug("============debug=============17=",count,imageName)
                            async.waterfall([
                                async function (cbs) {
                                    let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                    cbs(null,result)
                                    // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                }
                            ], function (err2, response2) {

                                logger.debug("============debug=============18=",response2,imageName)
                                imageName.push({image:response2,order:imageOrder[i]});
                                //console.log("==============response2===============" + response2);
                                if (imageName.length >= count) {
                                    logger.debug("============debug=============19=",count,imageName)
                                    //console.log("==========imagename===========" + JSON.stringify(imageName));
                                    cb(null);
                                }
                            })
                        }(i))
                    }
                }else{
                    imageName.push({order:1,image:config.get("defaultLogo")});
                    cb(null)
                }
            }
        },
            function (cb) {
                console.log("....image...",imageName)

                 insertProductImages(req.dbName,res, imageName, productId,0,0, cb);
            },
            function (id, cb) {
                updateDefaultImage(req.dbName,res, id, cb);
            },
            async function (cb) {
                console.log("==========this is branch id ============",branchId)
                
                await assignProductToSupplierBranch(req.dbName,res, branchId, productId.toString(),[0], categoryId.toString(), subCategoryId.toString(), detailedSubCategoryId.toString(), cb);
                cb(null)
            }, 
            function (cb) {
                    // console.log("here");
                    // updateAreaWiseDeliveryCharges(req.dbName,res,[productId], supplierId, branchId, cb);
                    cb(null)
            },
            async function (cb) {
                try{
                categories.push(categoryId);
                categories.push(subCategoryId);
                categories.push(detailedSubCategoryId);
                categories=categories.toString();
                var sql='select name from categories where id IN('+categories+')';
                let result=await ExecuteQ.Query(req.dbName,sql,[])
                // multiConnection[req.dbName].query(sql,function (err,result) {
                //     if(err){
                //         console.log("......",err,result);
                //         sendResponse.somethingWentWrongError(res)
                //     }
                //     else {
                        cateName=result[0].name;
                        if(result[1]){
                            subcatName=result[1].name;
                        }
                        var detSubCat=parseInt(detailedSubCategoryId);
                        if(detSubCat && result[2]){
                            detSubCatName=result[2].name;
                        }
                        else {
                            detSubCatName='';
                        }
                        cb(null)
                //     }
                // })
            }
            catch(Err){
                sendResponse.somethingWentWrongError(res)
            }
            },
            function (cb) {
                // emailTemp.addProductBySupplier(req,res,AdminMail,supplierName,productId,names[0],cateName,subcatName,detSubCatName,function(err,result){
                //     if(err){
                //         console.log("..****register email*****....",err);
                //     }
                // })
                cb(null)
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = {
                    productId:productId
                }
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

exports.deleteSupplierBranchProduct = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var productId = req.body.productId;
    var manValues = [accessToken, sectionId, productId, branchId];
    var product = productId.split("#").toString();
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
           function (cb) {
               func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
           }, 
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            // },
            function (id,cb) {
                deleteSupplierProductOfBranch(req.dbName,res, product, branchId, cb);
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

exports.listBranchAreas = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var manValues = [accessToken, sectionId, branchId];
    var adminId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
        
            // },
            function (cb) {
                listBranchAreas(req.dbName,res, branchId, cb);
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

function insertProduct(dbName,is_prescribed,res, adminId, categoryId, 
    subCategoryId, detailedSubCategoryId, name, priceUnit,
     description, sku, barCode,unit, commission, commissionType, 
     commissionPackage,pricing_type,quantity,parent_id,brand_id,
     is_product,duration,interval_flag,interval_value,api_version,
     is_driver,cart_image_upload,payment_after_confirmation,is_supplier_product_approved,callback) {


    var sql = `insert into product(cart_image_upload,payment_after_confirmation,
        is_prescribed,name,price_unit,bar_code,product_desc,sku,measuring_unit,
        category_id,sub_category_id,detailed_sub_category_id,is_global,added_by,
        created_by,commission,commission_type,commission_package,pricing_type,is_live,
        quantity,parent_id,brand_id,is_product,duration) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    var params=[cart_image_upload,payment_after_confirmation,is_prescribed,name, priceUnit,
         barCode, description, sku,unit,categoryId, subCategoryId, detailedSubCategoryId, 0,1,
          adminId, commission, commissionType, commissionPackage,pricing_type,1,
          quantity,parent_id,brand_id,is_product,duration,is_supplier_product_approved]
    
    if(api_version>=1){
         sql = `insert into product(cart_image_upload,payment_after_confirmation,
            is_prescribed,name,price_unit,bar_code,product_desc,sku,measuring_unit,
            category_id,sub_category_id,detailed_sub_category_id,is_global,added_by,
            created_by,commission,commission_type,commission_package,pricing_type,
            is_live,quantity,parent_id,brand_id,is_product,
            duration,interval_flag,interval_value) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
         params=[cart_image_upload,payment_after_confirmation,is_prescribed,name, priceUnit, barCode, description,
             sku,unit,categoryId, subCategoryId, detailedSubCategoryId, 0,1, adminId, commission, commissionType,
              commissionPackage,pricing_type,1,quantity,
              parent_id,brand_id,is_product,duration,interval_flag,interval_value,is_supplier_product_approved]
        
    }
    let stmt =multiConnection[dbName].query(sql,params, function (err, result) {
        logger.debug("==STMT=>",stmt.sql)
        if (err) {
            console.log(".....err2.......",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result.insertId);

        }

    })

}

function insertproductsupplier (dbName,res,productId,supplierId,categoryId,subCategoryId,detailedSubCategoryId,callback) {
    var sql ="insert into supplier_product (supplier_id,category_id,sub_category_id,detailed_sub_category_id,product_id,is_deleted) values(?,?,?,?,?,?)"
    multiConnection[dbName].query(sql,[supplierId,categoryId,subCategoryId,detailedSubCategoryId,productId,0],function (err,result) {
        if (err) {
            console.log('error-----------',err)

            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);

        }
    })
}



function  insertProductNameInMultiLanguage(dbName,res, productId, names, descriptions, languages,unit, callback) {
    
    var values = [];
    var queryString = "(?,?,?,?,?),";
    var insertString = "";
    for (var i = 0; i < names.length; i++) {
        (function (i) {
            values.push(productId, names[i], languages[i], descriptions[i],unit[i]);
            insertString = insertString + queryString;
            if (i == names.length - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
                var sql = "insert into product_ml(product_id,name,language_id,product_desc,measuring_unit) values " + insertString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        console.log("err....",err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        callback(null);
                    }

                })
            }

        }(i))
    }
}


async function  insertProductImages(dbName,res, imageName, productId,update_request_id,by_supplier, callback) {
    var values = [];
    var queryString = "(?,?,?),";
    var insertString = "";

    if( imageName.length == 0){
        callback(null);
    }

    let vendorApprovalCheck = await ExecuteQ.Query(dbName,"select `key`,value from tbl_setting where `key`=? and value=1",["enable_updation_vendor_approval"]);
   
    if(vendorApprovalCheck && vendorApprovalCheck.length>0 && parseInt(by_supplier)==1){
        for (var i = 0; i < imageName.length; i++) {
            (async function (i) {
                values.push(update_request_id, imageName[i].image, imageName[i].order);
                insertString = insertString + queryString;
                if (i == (imageName.length - 1)) {
                    insertString = insertString.substring(0, insertString.length - 1);
                    var sql = "insert into product_image_request(update_request_id,image_path,imageOrder) values " + insertString;
                    let result=await ExecuteQ.Query(dbName,sql,values);
    
                    callback(null, result.insertId);
                }
    
            }(i))
        }
    }else{
        for (var i = 0; i < imageName.length; i++) {
            (async function (i) {
                values.push(productId, imageName[i].image, imageName[i].order);
                insertString = insertString + queryString;
                if (i == (imageName.length - 1)) {
                    insertString = insertString.substring(0, insertString.length - 1);
                    var sql = "insert into product_image(product_id,image_path,imageOrder) values " + insertString;
                    let result=await ExecuteQ.Query(dbName,sql,values);
    
                    callback(null, result.insertId);
                }
    
            }(i))
        }
    }

}

async function updateDefaultImage(dbName,res, id, callback) {
    try{
        var sql = "update product_image set default_image = ? where id = ? limit 1";
        await ExecuteQ.Query(dbName,sql,[1, id])
    // multiConnection[dbName].query(sql, [1, id], function (err, result) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
            callback(null);
    //     }

    // })
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res);
    }

}

function deleteProduct(dbName,res, productId, callback) {
    var sql = "update product set is_deleted = ? where id IN ("+productId+")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null);
        }

    })

}

function deleteSupplierProduct(dbName,res, productId, supplierId, callback) {
    var sql = "update supplier_product set is_deleted = ? where supplier_id = ? and product_id IN ("+productId+")";
    multiConnection[dbName].query(sql, [1, supplierId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })

}

function  productdescription(dbName,res,productId,languageId,cb) {
    var sql = "select product_ml.product_id,product_ml.product_desc from product_ml WHERE product_ml.product_id=? AND product_ml.language_id=? "
    multiConnection[dbName].query(sql, [productId, languageId], function (err, desc) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2="select product_id,image_path from product_image where product_id = ?"
            multiConnection[dbName].query(sql2,[productId],function (err,result) {
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    var length=result.length;
                    var images=[];
                     if(!length)
                     {
                         cb(null,[]);
                     }
                    else {
                         for(var i=0;i<length;i++)
                         {
                            (function(i)
                             {
                                if(result[i].product_id == desc[0].product_id)
                                {
                                 images.push({
                                     'image':result[i].image_path})
                                    if(i==length-1)
                                    {
                                       desc[0].images=images;
                                        cb(null,desc);
                                    }
                                }
                                 else {
                                    if(i==length-1)
                                    {
                                        desc[0].images=images;
                                        cb(null,desc);
                                    }
                                }
                             }(i))

                         }
                     }
                }
            })
        }
    })
}

function insertProductPricing(res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, productPricingId, houseCleaningCharge, beautySaloonCharge,id, callback) {
    var sql = "select id from product_pricing where product_id = ? and price_type = ? limit 1";
    multiConnection[dbName].query(sql, [productId, offerType], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (result.length) {
                var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,delivery_charges = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=? where id = ? limit 1"
                multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, productPricingId], function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                        multiConnection[dbName].query(sql2, [deliveryCharges, productId, id], function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                callback(null);
                            }

                        })
                    }

                })
            }
            else {
                var sql = "insert into product_pricing(product_id,start_date,end_date,price,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price) values(?,?,?,?,?,?,?,?,?,?,?,?)"
                multiConnection[dbName].query(sql, [productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge], function (err, result) {
                    if (err) {
                        console.log(err)
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                        multiConnection[dbName].query(sql2, [deliveryCharges, productId, id], function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                callback(null);
                            }

                        })
                    }
                })
            }
        }

    })
}

function editProductPricing(res, insertValues, callback) {
    var sql = " update product_pricing set start_date = ?,end_date= ?,price = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,commission = ?,delivery_charges = ?,commission_type =?, urgent_type =? where id = ? limit 1"
    multiConnection[dbName].query(sql, insertValues, function (err, result) {
        if (err) {
            console.log("error------",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
                callback(null);
        }
    })
}
/**
 * @desc used for listing and pricing of products
 * @param {*string} dbName 
 * @param {*Object} res 
 * @param {*Int} productId 
 * @param {*Int} type 
 * @param {*Int} id 
 * @param {*Int} supplierId 
 * @param {*callback} callback 
 */
async function listProductPriceDetails(dbName,res, productId,type,id,supplierId,callback) {
try{
    console.log("sippppp",id);
    console.log("sippppp",supplierId);
    if(type==0){
        var sql = "SELECT p.id,p.product_id,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier, ";
        sql += " p.can_urgent,p.urgent_value as urgent_price,p.house_cleaning_price,p.beauty_saloon_price,p.price_type,p.urgent_type, ";
        sql += " p.delivery_charges,p.pricing_type from product_pricing p join supplier_product s on p.product_id = s.product_id where ";
        sql += " s.supplier_id = ? and p.is_deleted = ? and p.product_id = ? and s.is_deleted = ? and p.is_deleted =? " +
            " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
            let result=await ExecuteQ.Query(dbName,sql,[supplierId, 0, productId, 0, 0]);
        // multiConnection[dbName].query(sql, [supplierId, 0, productId, 0, 0], function (err, result) {
        //     if (err) {
        //         sendResponse.somethingWentWrongError(res);
        //     }
        //     else {
                //   console.log("res",result);
                if(result.length){
                    for (var i=0;i<result.length;i++){
                        (function (i) {
                            if(result[i].pricing_type){
                                result[i].price = JSON.parse(result[i].price)
                                if(i==result.length-1){
                                    callback(null, result)
                                }
                            }
                            else {
                                if(i==result.length-1){
                                    callback(null, result)
                                }
                            }
                        }(i))
                    }
                }
                else {
                    callback(null, result)
                }
        //     }

        // })
    }
    else {

        var sql = "SELECT p.id,p.product_id,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier, ";
        sql += " p.can_urgent,p.urgent_value as urgent_price,p.house_cleaning_price,p.beauty_saloon_price,p.price_type,p.urgent_type, ";
        sql += " p.delivery_charges,p.pricing_type from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
        sql += " s.supplier_branch_id = ? and p.is_deleted = ? and p.product_id = ? and s.is_deleted = ? " +
            " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0)) ";
        let result=await ExecuteQ.Query(dbName,sql,[id, 0, productId,0]);

        // multiConnection[dbName].query(sql, [id, 0, productId,0], function (err, result) {
        //     if (err) {
        //         sendResponse.somethingWentWrongError(res);
        //     }
        //     else {
                var sql2 = "select b.area_id,b.delivery_charges,b.min_order,b.charges_below_min_order,a.name from ";
                sql2 += " supplier_branch_area_product b join area a on b.area_id = a.id where b.product_id = ? and b.is_deleted = ? and b.supplier_branch_id = ? ";
                let result5=await ExecuteQ.Query(dbName,sql2,[productId, 0, id]);
                // multiConnection[dbName].query(sql2, [productId, 0, id], function (err, result5) {
                //     if (err) {
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else {

                        if (!result.length) {
                            callback(null, [])
                        }
                        else {
                            for (var i = 0; i < result.length; i++) {
                                (function (i) {
                                    result[i].areas = result5;
                                    //console.log("kbjsdk",typeof (result[i].price));
                                    if(result[i].pricing_type){
                                        result[i].price = JSON.parse(result[i].price)
                                        if(i==result.length-1){
                                            callback(null, result)
                                        }
                                    }
                                    else {
                                        //console.log("else",result[i].price)
                                        if(i==result.length-1){
                                            callback(null, result)
                                        }
                                    }

                                }(i))

                            }
                        }


                //     }

                // })

        //     }

        // })
    }
}
catch(Err){
    logger.debug("=Err=",Err),
    sendResponse.somethingWentWrongError(res);
}
 /*   var sql = "select * from product_pricing where product_id = ? and is_deleted = ?"
    multiConnection[dbName].query(sql, [productId, 0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result)
        }

    })*/

}

// function  getId(dbName,res,id,cb){
//     var sql='select sa.supplier_id,s.name from supplier_admin sa join supplier s on s.id=sa.supplier_id where sa.id=?';
//     multiConnection[dbName].query(sql,[id],function (err,id) {
//         if(err)
//         {
//             console.log('error------',err);
//             sendResponse.somethingWentWrongError(res);

//         }
//         else {
//             //console.log('result-----',id);
//             cb(null,id);
//         }
//     })}
async function getId(dbName, res, id, cb) {
    try{
        var sql = 'select sa.supplier_id,s.name from supplier_admin sa join supplier s on s.id=sa.supplier_id where sa.id=?';
        var sql1 = 'select sb.supplier_id,s.name from supplier_branch sb join supplier s on s.id=sb.supplier_id where sb.id=?';
        let result=await ExecuteQ.Query(dbName,sql,[id]);
        let result1=await ExecuteQ.Query(dbName,sql1,[id])
        if (result && result.length) {
            cb(null,result);
        }
        else{
        if(result1 && result1.length){
            cb(null,result1);
        }
        else{
            sendResponse.somethingWentWrongError(res);
        }
    }
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res);
    }

    // var sql = 'select sa.supplier_id,s.name from supplier_admin sa join supplier s on s.id=sa.supplier_id where sa.id=?';
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
    //             var sql = 'select sb.supplier_id,s.name from supplier_branch sb join supplier s on s.id=sa.supplier_id where sb.id=?';
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

function listSupplierBranchProducts(dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId, callback) {

    async.waterfall([
            function (cb) {
                listSupplierBranchProductDetails(res, branchId, categoryId, subCategoryId, detailedSubCategoryId, cb);
            },
            function (products, cb) {
                productImages(res, products, cb);
            },
            function (products, cb) {
                promotionsCheck(res, products, branchId, cb);
            }
        ], function (err, response) {

            if (err) {
                sendResponse.somethingWentWrongError(res)
            }
            else {
                callback(null, response);
            }

        }
    )
}

function listSupplierBranchProductDetails(res, branchId, categoryId, subCategoryId, detailedSubCategoryId, callback) {
    var sql = "select p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,curr.currency_name from supplier_branch_product sp ";
    sql += " join product p on sp.product_id = p.id join categories c on c.id = p.category_id join currency_conversion curr ";
    sql += " on curr.id = p.price_unit where sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and ";
    multiConnection[dbName].query(sql, [branchId, 0, categoryId, subCategoryId, detailedSubCategoryId], function (err, products) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select p.id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit from product_ml p join language l on p.language_id = l.id";
            multiConnection[dbName].query(sql2, function (err, productMultiLanguage) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    var productLength = products.length;
                    var languageLength = productMultiLanguage.length;

                    if (!productLength) {
                        callback(null, [])
                    }
                    else {
                        for (var i = 0; i < productLength; i++) {
                            (function (i) {
                                var names = [];

                                for (var j = 0; j < languageLength; j++) {
                                    (function (j) {
                                        if (products[i].id == productMultiLanguage[j].product_id) {
                                            names.push({
                                                "product_multi_id": productMultiLanguage[j].id,
                                                "name": productMultiLanguage[j].name,
                                                "langauge_id": productMultiLanguage[j].language_id,
                                                "language_name": productMultiLanguage[j].language_name,
                                                "product_desc": productMultiLanguage[j].product_desc,
                                                "measuring_unit": productMultiLanguage[j].measuring_unit
                                            });
                                            if (j == languageLength - 1) {
                                                products[i].names = names;
                                                if (i == productLength - 1) {
                                                    callback(null, products);
                                                }
                                            }
                                        }
                                        else {
                                            if (j == languageLength - 1) {
                                                products[i].names = names;
                                                if (i == productLength - 1) {
                                                    callback(null, products);
                                                }
                                            }
                                        }

                                    }(j))

                                }

                            }(i))

                        }
                    }

                }
            })
        }

    })

}

function productImages(res, products, callback) {
    if (products.length) {
        var sql = "select product_id,image_path,default_image from product_image ";
        multiConnection[dbName].query(sql, function (err, productImages) {
            if (err) {
                sendResponse.somethingWentWrongError(res)
            }
            else {
                var imageLength = productImages.length;
                for (var i = 0; i < products.length; i++) {
                    (function (i) {
                        var images = [];
                        for (var j = 0; j < imageLength; j++) {
                            (function (j) {
                                if (products[i].id == productImages[j].product_id) {
                                    images.push(productImages[j]);
                                    if (j == imageLength - 1) {
                                        products[i].images = images;
                                        if (i == products.length - 1) {
                                            callback(null, products);
                                        }
                                    }
                                }
                                else {
                                    if (j == imageLength - 1) {
                                        products[i].images = images;
                                        if (i == products.length - 1) {
                                            callback(null, products);
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
    else {
        callback(null, []);
    }

}

function promotionsCheck(res, products, branchId, callback) {
    var sql = "select id,offer_product_value,promotion_type from supplier_branch_promotions where supplier_branch_id = ? and is_deleted = ? and "
    sql += " start_date<=CURDATE() and end_date >= CURDATE() and (promotion_type = 1 or promotion_type = 2 )";
    multiConnection[dbName].query(sql, [branchId, 0], function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            var promotionLength = response.length;
            for (var i = 0; i < products.length; i++) {
                (function (i) {
                    var buy_x_get_x = 0;
                    var buy_x_get_y = 0;
                    if (promotionLength) {
                        for (var j = 0; j < promotionLength; j++) {
                            (function (i) {
                                if (products[i].id == response[j].offer_product_value) {
                                    if (response[i].promotion_type == 1) {
                                        buy_x_get_x = 1;
                                    }
                                    else {
                                        buy_x_get_y = 1;
                                    }

                                    if (j == promotionLength - 1) {
                                        products[i].buy_x_get_x = buy_x_get_x;
                                        products[i].buy_x_get_y = buy_x_get_y;
                                        if (i == products.length - 1) {
                                            callback(null, products);
                                        }
                                    }

                                }
                                else {
                                    products[i].buy_x_get_x = buy_x_get_x;
                                    products[i].buy_x_get_y = buy_x_get_y;
                                    if (j == promotionLength - 1) {
                                        if (i == products.length - 1) {
                                            callback(null, products);
                                        }
                                    }
                                }

                            }(i))

                        }
                    }
                    else {
                        products[i].buy_x_get_x = buy_x_get_x;
                        products[i].buy_x_get_y = buy_x_get_y;
                        if (i == products.length - 1) {
                            callback(null, products);
                        }
                    }


                }(i))

            }
        }

    })

}
function assignProductToSupplierBranch(dbName,res, branchId, productId,oldProductId, categoryId, subCategoryId, detailedSubCategoryId, callback) {
    return new Promise(async(resolve,reject)=>{
        let recipe_pdf=""
        console.log("=========recipe_pdf========recipe_pdf=========",recipe_pdf)
        if(Array.isArray(productId)){
            var productIds=productId;
        }
        else {
            var productIds = productId.split("#");
        }
        console.log("oldprod prod car det subdet",oldProductId,productId,categoryId,subCategoryId,detailedSubCategoryId,productIds.length);
        categoryId = categoryId +'#';
        var categoryIds = categoryId.split("#");
        categoryIds.pop();
        subCategoryId = subCategoryId +'#'
        var subCategoryIds = subCategoryId.split("#");
        subCategoryIds.pop();
        detailedSubCategoryId = detailedSubCategoryId +'#'
        var detailedSubCategoryIds = detailedSubCategoryId.split("#");
        detailedSubCategoryIds.pop();
        var queryString = "(?,?,?,?,?,?,?,?),";
        var insertString = "";
       
    
        // if(productIds && productIds.length>0){
        //     for (const [index, i] of productIds.entries()) {
        //         values.push(branchId, productIds[index], categoryIds[index], subCategoryIds[index], detailedSubCategoryIds[index],oldProductId[index]);
        //         insertString = insertString + queryString;
        //         if(index==productIds.length-1){
        //             insertString = insertString.substring(0, insertString.length - 1);
        //             var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id) values " + insertString;
        //             await ExecuteQ.Query(dbName,sql,[values])                
        //             resolve();
        //         }
        //     }
        // }else{
        //     resolve();
        // }

        for (const [index, i] of productIds.entries()) {
            let values = [];
            values.push(branchId, productIds[index], categoryIds[index], subCategoryIds[index], detailedSubCategoryIds[index],oldProductId[index],recipe_pdf);
            insertString = insertString + queryString;
            logger.debug("====values=====>>",values)
            
            var insertSql = `SELECT ${values[0]},${values[1]},${values[2]},${values[3]},${values[4]},${values[5]},"${recipe_pdf}",MAX(order_no)+1
            from supplier_branch_product 
            where supplier_branch_id=${values[0]} and category_id=${values[2]};`;
         // var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id) values " + insertString;
            var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,recipe_pdf,order_no) " + insertSql;
            await ExecuteQ.Query(dbName,sql,[]);
            // var st= multiConnection[dbName].query(sql, values, function (err, result) {
            //  logger.debug(st.sql)    
            //  if (err) {
            //          console.log(err);
            //          sendResponse.somethingWentWrongError(res);
            //      } else {
            //          resolve()
            //      }
 
            //  })
            if (index == productIds.length - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
               //console.log("iii",values);               
            //    var insertSql = `SELECT ${values[0]},${values[1]},${values[2]},${values[3]},${values[4]},${values[5]},MAX(order_no)+1
            //    from supplier_branch_product 
            //    where supplier_branch_id=${values[0]} and category_id=${values[2]};`;
                
            // // var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id) values " + insertString;
            //    var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,order_no) " + insertSql;
            //    var st= multiConnection[dbName].query(sql, values, function (err, result) {
            //     logger.debug(st.sql)    
            //     if (err) {
            //             console.log(err);
            //             sendResponse.somethingWentWrongError(res);
            //         } else {
                        resolve()
                //     }
    
                // })
    
            }
    
        }






    })
    
    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    //         values.push(branchId, productIds[i], categoryIds[i], subCategoryIds[i], detailedSubCategoryIds[i],oldProductId[i]);
    //         insertString = insertString + queryString;
    //         if (i == productIds.length - 1) {
    //             insertString = insertString.substring(0, insertString.length - 1);
    //             var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id) values " + insertString;
    //             multiConnection[dbName].query(sql, values, function (err, result) {
    //                 if (err) {
    //                     console.log("eeeeee",err);
    //                     sendResponse.somethingWentWrongError(res);

    //                 } else {
    //                     callback(null);
    //                 }
    //             })
    //         }
    //     }(i))
    // }
}
// function assignProductToSupplierBranch(dbName,res, branchId, productId,oldProductId, categoryId, subCategoryId, detailedSubCategoryId, callback) {
//     if(Array.isArray(productId)){
//         var productIds=productId;
//     }
//     else {
        
//         var productIds = productId.split("#");
//     }
//     console.log("================product------------ids=========",productIds)
//     console.log("oldprod prod car det subdet",oldProductId,productId,categoryId,subCategoryId,detailedSubCategoryId,productIds.length);
//     categoryId = categoryId +'#';
//     var categoryIds = categoryId.split("#");
//     categoryIds.pop();
//     subCategoryId = subCategoryId +'#'
//     var subCategoryIds = subCategoryId.split("#");
//     subCategoryIds.pop();
//     detailedSubCategoryId = detailedSubCategoryId +'#'
//     var detailedSubCategoryIds = detailedSubCategoryId.split("#");
//     detailedSubCategoryIds.pop();
//     var queryString = "(?,?,?,?,?,?),";
//     var insertString = "";
//     var values = [];
//     for (var i = 0; i < productIds.length; i++) {
//         (async function (i) {
//     // for (var i = 0; i < productIds.length; i++) {
//             values.push(branchId, productIds[i], categoryIds[i], subCategoryIds[i], detailedSubCategoryIds[i],oldProductId[i]);
//             console.log("-------------values===========",values)
//             insertString = insertString + queryString;
//             if (i == productIds.length - 1) {
//                 try{
//                 insertString = insertString.substring(0, insertString.length - 1);
                
//                 var insertSql = `SELECT ${values[0]},${values[1]},${values[2]},${values[3]},${values[4]},${values[5]},MAX(order_no)+1
//                from supplier_branch_product 
//                where supplier_branch_id=${values[0]} and category_id=${values[2]};`;

//                 // var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id) values " + insertString;
//                 var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,order_no) " + insertSql;
//                 console.log("=================sqlqlqlql=======",sql)
//                 await ExecuteQ.Query(dbName,sql,values);
//                 // let stmt = multiConnection[dbName].query(sql, values, function (err, result) {
//                 //     console.log("===========stmt.sql======stmt=====",stmt.sql)
//                 //     if (err) {
//                 //         console.log("eeeeee",err);
//                 //         sendResponse.somethingWentWrongError(res);

//                 //     } else {
//                         callback(null);
//                 //     }
//                 // })
//                 }
//                 catch(Err){
//                     logger.debug("===Err!==",Err)
//                     sendResponse.somethingWentWrongError(res);
//                 }
//             }
            
//         })(i);
// }
// }

function updateAreaWiseDeliveryCharges(dbName,res, newProductId,supplierId, branchId, callback) {
    var areaId;
    var dataTobeInserted;
        console.log("fdffd",newProductId,supplierId,branchId)
    async.auto({
        one: function (cb) {
            getBranchAreas(dbName,res, branchId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    areaId = result.toString();
                    console.log("area idssss*", areaId);
                    cb(null);
                }

            })
        },
        two: ['one', function (cb) {
            getDeliveryChargesOfBranchAreaWise(dbName,res, areaId, supplierId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    dataTobeInserted = result;
                    console.log("delivery charge data", dataTobeInserted)
                    cb(null);
                }

            });
        }],
        three: ['two', function (cb) {
            if (dataTobeInserted.length) {
                insertAreaBranchProductCharges(dbName,res, dataTobeInserted, newProductId, branchId, cb);
            }
            else {
                cb(null);
            }

        }]
    }, function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null)
        }

    })

}

function getBranchAreas(dbName,res, branchId, callback) {
    var sql = "select area_id from supplier_branch_delivery_areas where supplier_branch_id = ? and is_deleted = ?"
    multiConnection[dbName].query(sql, [branchId, 0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var areaIds = [];
            for (var i = 0; i < result.length; i++) {
                (function (i) {
                    areaIds.push(result[i].area_id)

                }(i))

            }
            callback(null, areaIds);
        }

    })

}


function getDeliveryChargesOfBranchAreaWise(dbName,res, areaId, supplierId, callback) {
    var sql = "select area_id,delivery_charges,min_order,charges_below_min_order from supplier_delivery_areas where area_id IN (" + areaId + ") and is_deleted = ? and supplier_id = ?"
    // console.log("khbfd",sql);
    multiConnection[dbName].query(sql, [0, supplierId], function (err, result2) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, result2);
        }
    })
}

function insertAreaBranchProductCharges(dbName,res, dataTobeInserted, productId, branchId, callback) {
    console.log("pp",productId.length);
    console.log("paap",dataTobeInserted.length);
    var productIds = productId;
    var dataLength = dataTobeInserted.length;
    var queryString = "";
    var insertString = "(?,?,?,?,?,?),";
    var values = [];

    async.auto({
        setData:function (cb) {
            if(productIds.length){
                for (var i=0;i<productIds.length;i++){
                    (function (i) {
                        for (var j=0;j<dataLength;j++){
                            (function (j) {
                                values.push(branchId, dataTobeInserted[j].area_id, productIds[i], dataTobeInserted[j].delivery_charges, dataTobeInserted[j].min_order, dataTobeInserted[j].charges_below_min_order);
                                queryString = queryString + insertString;
                                if(j==dataLength-1  && i==productIds.length-1){
                                    queryString = queryString.substring(0, queryString.length - 1);
                                    cb(null);
                                }
                            }(j))
                        }
                    }(i))
                }
            }
            else {
                cb(null);
            }
        },
        insertData:['setData',function (cb) {
            console.log("val...........",values)
            if (productIds.length){
                var sql = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        console.log("err",err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null);
                    }

                })
            }
            else {
                cb(null);
            }
        }]
    },function (err,result) {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    })



//    console.log("aithe");
    //  console.log("dd",dataTobeInserted);
    /*if(productIds.length){
     for (var j = 0; j < productIds.length; j++) {
     (function (j) {
     for (var i = 0; i < dataLength; i++) {
     (function (i) {
     values.push(branchId, dataTobeInserted[i].area_id, productIds[j], dataTobeInserted[i].delivery_charges, dataTobeInserted[i].min_order, dataTobeInserted[i].charges_below_min_order);
     queryString = queryString + insertString;
     console.log("val",values);
     if (i == dataLength - 1 && j == productIds.length - 1) {
     // console.log("val1111111",values);
     queryString = queryString.substring(0, queryString.length - 1);
     var sql = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
     multiConnection[dbName].query(sql, values, function (err, result) {
     if (err) {
     sendResponse.somethingWentWrongError(res);
     }
     else {
     callback(null);
     }

     })
     }

     }(i))

     }

     }(j))
     }

     }
     else{
     callback(null);
     }*/


}

/**
 * @description used for insertion product of supplier
 * @param {*string} dbName 
 * @param {*Object} res 
 * @param {*Int} branchId 
 * @param {*Int} categoryId 
 * @param {*Int} subCategoryId 
 * @param {*Int} detailedSubCategoryId 
 * @param {*string} name 
 * @param {*} priceUnit 
 * @param {*} description 
 * @param {*} sku 
 * @param {*} barCode 
 * @param {*} commission 
 * @param {*} commissionType 
 * @param {*} commissionPackage 
 * @param {*} measuringUnit 
 * @param {*} pricing_type 
 * @param {*} quantity 
 * @param {*} parent_id 
 * @param {*} brand_id 
 * @param {*} is_product 
 * @param {*} duration 
 * @param {*} interval_flag 
 * @param {*} interval_value 
 * @param {*} api_version 
 * @param {*} is_driver 
 * @param {*} cart_image_upload 
 * @param {*} payment_after_confirmation 
 * @param {*} callback 
 */
async function insertProductBySupplierBranch(dbName,res, branchId,
     categoryId, subCategoryId, detailedSubCategoryId, name, priceUnit,
      description, sku, barCode, commission, commissionType,
       commissionPackage, measuringUnit,pricing_type,
       quantity,parent_id,brand_id,is_product,duration,
       interval_flag,interval_value,api_version,
       is_driver,cart_image_upload,
       payment_after_confirmation,
       item_unavailable,is_non_veg,is_appointment,calories,callback,making_price) {
try{
    var sql = "insert into product(making_price,cart_image_upload,payment_after_confirmation,pricing_type,is_live,name,price_unit,bar_code,product_desc,sku,category_id,is_global,created_by,added_by,commission,commission_type,commission_package,measuring_unit,quantity,parent_id,brand_id,is_product,duration,is_non_veg,calories) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    var params=[making_price,cart_image_upload,payment_after_confirmation,pricing_type,1,name, priceUnit, barCode, description, sku, detailedSubCategoryId, 0, branchId, 2, commission, commissionType, commissionPackage, measuringUnit,quantity,parent_id,brand_id,is_product,duration,is_non_veg,calories];
    
    if(api_version>=1){
         sql = `insert into product(
            making_price,
            cart_image_upload,
            payment_after_confirmation,
             pricing_type,
             is_live,
             name,
             price_unit,
             bar_code,
             product_desc,
             sku,
             category_id,
             is_global,
             created_by,
             added_by,
             commission,
             commission_type,
             commission_package,
             measuring_unit,
             quantity,
             parent_id,
             brand_id,
             is_product,
             duration,
             interval_flag,
             interval_value,
             item_unavailable,
             is_non_veg,is_appointment,calories) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
         params=[
            making_price,
            cart_image_upload,
            payment_after_confirmation,
            pricing_type,
            1,
            name,
            priceUnit,
            barCode,
            description,
            sku,
            categoryId,
            0,
            branchId, 
            2, 
            commission,
            commissionType, 
            commissionPackage, 
            measuringUnit,
            quantity,
            parent_id,
            brand_id,
            is_product,
            duration,
            interval_flag,
            interval_value,
            item_unavailable,
            is_non_veg,is_appointment,calories];
        
    }
    let results = await ExecuteQ.Query(dbName,sql,params);
    logger.debug("=====RESUL-->>",results)
    // multiConnection[dbName].query(sql,params, function (err, result) {
    //     logger.debug("==ERR!==",err)
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
            callback(null, results.insertId);

    //     }
    // });
}
catch(Err){
    logger.debug("==Err!==",Err);
    sendResponse.somethingWentWrongError(res);
}
}
async function  insertProductVarints(dbName,res,variant_id, callback) {    
    try{
    var sql = "insert into product_variants(`product_id`,`variant_id`,`parent_id`) values ?";
        await ExecuteQ.Query(dbName,sql,[variant_id]);
    // multiConnection[dbName].query(sql, [variant_id], function (err, result) {
    //     if (err) {
    //         console.log(err)
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
            callback(null);
    //     }
    // })
    }
    catch(Err){
        logger.debug("==Err!==",Err)
        sendResponse.somethingWentWrongError(res);
    }
}

function deleteSupplierProductOfBranch(dbName,res, productId, branchId, callback) {
    var sql = "update supplier_branch_product set is_deleted = ? where supplier_branch_id = ? and product_id IN ("+productId+")";
    multiConnection[dbName].query(sql, [1, branchId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql3 = "update supplier_branch_area_product set is_deleted = ? where  supplier_branch_id = ? and product_id IN ("+productId+")";
            multiConnection[dbName].query(sql3, [1, branchId], function (err, done) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    callback(null)
                }

            })
        }

    })
}

async function listSuppliersBranchesForAssigningProducts(dbName,res, supplierId, callback) {
    try{
        var sql = "select id,name,branch_name from supplier_branch where is_deleted = ? and supplier_id = ?"
        let result=await ExecuteQ.Query(dbName,sql,[0, supplierId]);
        callback(null, result);
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res)
    }
    // var sql = "select id,name,branch_name from supplier_branch where is_deleted = ? and supplier_id = ?"
    // multiConnection[dbName].query(sql, [0, supplierId], function (err, result) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res)
    //     }
    //     else {
    //         callback(null, result);
    //     }

    // })

}

function listBranchAreas(dbName,res, branchId, callback) {
    var sql = "select b.area_id,a.name from supplier_branch_delivery_areas b join area a on b.area_id = a.id where ";
    sql += " b.supplier_branch_id = ? and b.is_deleted = ?";
    multiConnection[dbName].query(sql, [branchId, 0], function (err, result) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, result);
        }

    })

}

// function getData(dbName,res, productIds,commission,commissionType,pricing_level, callback) {
//     console.log("=======productid in getdata",productIds.length,productIds)
    
//     var insertedIds=[];
//     for (var i = 0; i < productIds.length; i++) {
//         (function (i) {
//             var sql = "insert into product(quantity,is_product,duration,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
//                 "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
//                 "is_live,is_deleted,is_global,added_by,created_by,approved_by_supplier,approved_by_admin)" +
//                 " select quantity,is_product,duration,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
//                 "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
//                 "is_live,is_deleted,0,added_by,created_by,approved_by_supplier,approved_by_admin from product where id = ? ";
//            var stm= multiConnection[dbName].query(sql, [productIds[i]], function (err, result) {
//             logger.debug("=STMT:=>",stm.sql,err)    
//             if(err)
//                 {
//                     console.log("errerrr",err)
//                     sendResponse.somethingWentWrongError(res);
//                 }
//                 else{
//                     console.log("--==========qw111",result.insertId)
//                     insertedIds.push(result.insertId);
//                     if (i == productIds.length - 1) {
//                         console.log("===============last-------",insertedIds)
//                         callback(null,insertedIds);
//                     }
//                 }

//             })
//         }(i))
//     }


// }

function getData(dbName,res, productIds,commission,commissionType,pricing_level, callback) {
    console.log("=======productid in getdata",productIds.length,productIds)
    
    var insertedIds=[];
    return new Promise(async(resolve,reject)=>{
        if(productIds && productIds.length){
  
          for (const [index, i] of productIds.entries()) {
              try{
                  let sql = "insert into product(duration,is_product,quantity,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
                  "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                  "is_live,is_deleted,is_global,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type,brand_id)" +
                  " select duration,is_product,quantity,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
                  "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                  "is_live,is_deleted,0,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type,brand_id from product where id = ? ";        
                  let params = [productIds[index]]
                  let result = await ExecuteQ.Query(dbName,sql,params)
                  insertedIds.push(result.insertId);
                  if(index == productIds.length-1){
                      resolve(insertedIds)
                  }
              }catch(err){
                  logger.debug("===========errrrrr========",err)
                  reject(err)
              }
  
          }        
                
        }else{
              resolve([])
        }
    })


}


function multilanguage(dbName,res,newIds,id,callback){
    logger.debug("new old",newIds,id);
    var productIds = id;

    return new Promise(async (resolve,reject)=>{
        for (const [index, i] of productIds.entries()) {
            try{
            var sql = "insert into product_ml( language_id,name,product_desc,measuring_unit,product_id)" +
            " select language_id,name,product_desc,measuring_unit,'?' from product_ml where product_id = ? ";
            await ExecuteQ.Query(dbName,sql,[newIds[index],productIds[index]])
            // multiConnection[dbName].query(sql, [newIds[index],productIds[index]], function (err, result) {
            // if(err)
            // {
            //     console.log("errerrr",err);
            //     sendResponse.somethingWentWrongError(res);
            // }
            // else{
               //console.log("multi inserted");
                if (index == productIds.length - 1) {
                    resolve()
                }
            }
            catch(Err){
                logger.debug("==Err!==",Err);
                sendResponse.somethingWentWrongError(res); 
            }
        //     }
    
        // })
        }
    })

    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    //         var sql = "insert into product_ml( language_id,name,product_desc,measuring_unit,product_id)" +
    //             " select language_id,name,product_desc,measuring_unit,'?' from product_ml where product_id = ? ";
    //         multiConnection[dbName].query(sql, [newIds[i],productIds[i]], function (err, result) {
    //             if(err)
    //             {
    //                 console.log("errerrr",err);
    //                 sendResponse.somethingWentWrongError(res);
    //             }
    //             else{
    //                 //console.log("multi inserted");
    //                 if (i == productIds.length - 1) {
    //                     callback(null);
    //                 }
    //             }

    //         })
    //     }(i))
    // }
}

function productImage(dbName,res,newIds,id){
    logger.debug(",newIds,id",newIds,id)
    var productIds = id;
    return new Promise(async (resolve,reject)=>{
        for (const [index, i] of productIds.entries()) {
            try{
            var sql = "insert into product_image( image_path,default_image,product_id,imageOrder)" +
                " select image_path,default_image,'?',imageOrder from product_image where product_id = ? ";
                await ExecuteQ.Query(dbName,sql,[newIds[index],productIds[index]])
            // multiConnection[dbName].query(sql, [newIds[index],productIds[index]], function (err, result) {
            //     if(err)
            //     {
            //         console.log("errerrr",err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else{
                    //console.log("img inserted");
                    if (index == productIds.length - 1) {
                        resolve();
                    }
            //     }

            // })
                }
                catch(Err){
                    logger.debug("==Err!=",Err)
                    sendResponse.somethingWentWrongError(res);
                }
        }
    })

    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    //         var sql = "insert into product_image( image_path,default_image,product_id,imageOrder)" +
    //             " select image_path,default_image,'?',imageOrder from product_image where product_id = ? ";
    //         multiConnection[dbName].query(sql, [newIds[i],productIds[i]], function (err, result) {
    //             if(err)
    //             {
    //                 console.log("errerrr",err);
    //                 sendResponse.somethingWentWrongError(res);
    //             }
    //             else{
    //                 //console.log("img inserted");
    //                 if (i == productIds.length - 1) {
    //                     callback(null);
    //                 }
    //             }

    //         })
    //     }(i))
    // }
}

function productPricing(dbName,res,newIds,id,callback){

    var productIds = id
    return new Promise(async(resolve,reject)=>{
        if(productIds && productIds.length>0){
            for(const [index,i] of productIds.entries())  {
                        
                var sql = "insert into product_pricing( start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type," +
                "commission_type,urgent_type,product_id) " +
                "select  start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type, " +
                "commission_type,urgent_type,'?' from product_pricing where product_id = ? ";
                await ExecuteQ.Query(dbName,sql,[newIds[index],productIds[index]])     
                resolve();
        }
        }else{
            resolve();
        }
    })
    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    //         var sql = "insert into product_pricing( start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
    //             "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type," +
    //             "commission_type,urgent_type,product_id) " +
    //             "select  start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
    //             "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type, " +
    //             "commission_type,urgent_type,'?' from product_pricing where product_id = ? ";
    //         let stmt = multiConnection[dbName].query(sql, [newIds[i],productIds[i]], function (err, result) {
    //             console.log("==========insert product ============>>>>!>>",stmt.sql)
    //             if(err)
    //             {
    //                 console.log("errerrr",err);
    //                 sendResponse.somethingWentWrongError(res);
    //             }
    //             else{
    //                 //console.log("pricing inserted");
    //                 if (i == productIds.length - 1) {
    //                     callback(null);
    //                 }
    //             }

    //         })
    //     }(i))
    // }
}
// async function (cb) {
//     let productData = await checkForProductsForBranch(req.dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId, productId, pricing_level, supplierId);
//     logger.debug("===============prdouct data---==========-------======",productData)
//     let ids = productData[0]
//     let cat = productData[1]
//     let subCat = productData[2]
//     let detSubCat = productData[3]
//     let commission1 = productData[4]
//     let commissionType1 = productData[5]
//     cb(null,ids,cat,subCat,detSubCat,commission1,commissionType1)                
// },
function updateSupplierBranchProduct(dbName, res, productId, branchId) {
    return new Promise(async (resolve, reject) => {

        try {
            let sql = "select id from supplier_branch_product where supplier_branch_id = ? and (product_id = ? or original_product_id = ? )and is_deleted = ?  limit 1"
            let params = [branchId, productId, productId, 0]
            let result = await ExecuteQ.Query(dbName, sql, params)
            if (result && result.length) {
                let sql1 = 'update supplier_branch_product sbp ' +
                    ' set sbp.is_deleted =? where sbp.supplier_branch_id =? and (sbp.product_id = ? or sbp.original_product_id = ? )'
                let params1 = [1, branchId, productId, productId]
                let response = await ExecuteQ.Query(dbName, sql1, params1)
                resolve()
            } else {
                resolve()
            }
        } catch (err) {
            logger.debug("===========err in getProducts=+++++", err)
            reject()
        }
        // multiConnection[dbName].query(sql, [branchId, i,i, 0], function (err, result) {
        //     if(err){
        //         console.log("errerrr",err);
        //         sendResponse.somethingWentWrongError(res);
        //     }
        //     else{
        //         if (result.length) {
        //                 var sql1 = 'update supplier_branch_product sbp ' +
        //                     ' set sbp.is_deleted =? where sbp.supplier_branch_id =? and (sbp.product_id = ? or sbp.original_product_id = ? )'
        //                 multiConnection[dbName].query(sql1, [1, branchId, i, i], function (err, response) {
        //                     if (err) {
        //                         console.log("errrrrrr", err);
        //                         sendResponse.somethingWentWrongError(res);
        //                     }
        //                     else{
        //                         resolve()
        //                     }
        //                 })
        //         }else{
        //             resolve()
        //         }
        //     }
        // })

    })
}

function checkForProductsForBranch(dbName, res, branchId, category, subCategory, detailedSubCategory, productId) {
    return new Promise(async (resolve, reject) => {
        var prodId = "";
        var cateId = "";
        var subcat = "";
        var detsubcat = "";
        var commission = "";
        var commissionType = "";
        var productIds = productId.split("#");
        var categoryId = category.split("#");
        var subCategoryId = subCategory.split("#");
        var detailSubCategoryId = detailedSubCategory.split("#");

        console.log("lndsfk", productIds, categoryId, subCategoryId, detailSubCategoryId)
        if (productIds && productIds.length) {
            for (const [index, i] of productIds.entries()) {

                logger.debug("====i,index==========i,index==========", i, index)

                await updateSupplierBranchProduct(dbName, res, i, branchId)
                if (prodId == "") {
                    logger.debug("=============here====111111111111111======++", prodId)
                    prodId = i;
                    cateId = categoryId[index];
                    subcat = subCategoryId[index];
                    detsubcat = detailSubCategoryId[index];
                    logger.debug("======cateId,subcat,detsubcat=====aaaaaaaaaaaaa=====",cateId,subcat,detsubcat)
                    if (index == productIds.length - 1) {

                        logger.debug("=============here======55555555555====++", prodId, index, productIds.length)
                        resolve(
                            [
                                prodId, cateId, subcat, detsubcat, commission, commissionType
                            ]
                        );
                    }
                }
                else {
                    logger.debug("=============here======2222222222====++", prodId)
                    prodId = prodId + "#" + i;
                    cateId = cateId + "#" + categoryId[index];
                    subcat = subcat + "#" + subCategoryId[index];
                    detsubcat = detsubcat + "#" + detailSubCategoryId[index];
                    logger.debug("=============here======33333333333====++", prodId,cateId,subcat,detsubcat)
                    logger.debug("======cateId,subcat,detsubcat===bbbbbbbbbbb=======",cateId,subcat,detsubcat)
                    if (index == productIds.length - 1) {
                        logger.debug("=============here======4444444444444====++", prodId, index, productIds.length)
                        resolve(
                            [
                                prodId, cateId, subcat, detsubcat, commission, commissionType
                            ]
                        );
                    }
                }

            }
        } else {
            resolve(
                [
                    prodId, cateId, subcat, detsubcat, commission, commissionType
                ]
            )
        }

    })
}
// function checkForProductsForBranch(dbName,res, branchId,category,subCategory,detailedSubCategory, productId,callback) {
//     console.log('------------------',subCategory,detailedSubCategory)
//     var prodId = "";
//     var cateId = "";
//     var subcat = "";
//     var detsubcat = "";
//     var productIds = productId.split("#");
//     var categoryId=category.split("#");
//     var subCategoryId=subCategory.split("#");
//     var detailSubCategoryId=detailedSubCategory.split("#");

//     console.log("lndsfk",productIds,categoryId,subCategoryId,detailSubCategoryId)
//     if(productIds.length){
//         console.log("=============lenfht of prod ids====",productIds.length)
//         for (var i = 0; i < productIds.length; i++) {
//             (async function (i) {
//                 try{
//                 logger.debug("============once========",productIds)
//                 var sql = "select id from supplier_branch_product where supplier_branch_id = ? and (product_id = ? or original_product_id = ? )and is_deleted = ?  limit 1"
//                 let result=await ExecuteQ.Query(dbName,sql,[branchId, productIds[i],productIds[i ], 0])
//                 // multiConnection[dbName].query(sql, [branchId, productIds[i],productIds[i ], 0], function (err, result) {
//                 //     if(err){
//                 //         console.log("errerrr",err);
//                 //         sendResponse.somethingWentWrongError(res);
//                 //     }
//                 //     else{
                        
//                         if (result.length) {
//                                 // var sql1 = 'update supplier_branch_product sbp join supplier_branch_area_product sbap on sbap.product_id = sbp.product_id' +
//                                 //     ' set sbap.is_deleted = ? ,sbp.is_deleted =? where sbap.supplier_branch_id =? and (sbp.product_id = ? or sbp.original_product_id = ? )'
//                                 // connection.query(sql1, [1, 1, branchId, productIds[i], productIds[i]], function (err, response) {
//                                 //     if (err) {
//                                 //         console.log("errrrrrr", err);
//                                 //         sendResponse.somethingWentWrongError(res);
//                                 //     }
//                                 // })
//                                 var sql1 = 'update supplier_branch_product sbp ' +
//                                     ' set sbp.is_deleted =? where sbp.supplier_branch_id =? and (sbp.product_id = ? or sbp.original_product_id = ? )'
//                                 await ExecuteQ.Query(dbName,sql1,[1, branchId, productIds[i], productIds[i]])
//                                     // multiConnection[dbName].query(sql1, [1, branchId, productIds[i], productIds[i]], function (err, response) {
//                                 //     if (err) {
//                                 //         console.log("errrrrrr", err);
//                                 //         sendResponse.somethingWentWrongError(res);
//                                 //     }
//                                 // })
                            
//                         }
//                         if (prodId == "") {
//                             prodId = productIds[i];
//                             cateId = categoryId[i];
//                             subcat= subCategoryId[i];
//                             detsubcat= detailSubCategoryId[i];
//                             if (i == productIds.length - 1) {

//                                 callback(null, prodId,cateId,subcat,detsubcat);
//                             }
//                         }
//                         else {
//                             prodId = prodId + "#" + productIds[i];
//                             cateId = cateId + "#" + categoryId[i];
//                             subcat=  subcat+  "#" + subCategoryId[i];
//                             detsubcat=detsubcat+ "#" +  detailSubCategoryId[i];
//                             console.log("=========prorpp11111111-----32222222222------",prodId,cateId,subcat,detsubcat)
//                             if (i == productIds.length - 1) {
//                                 console.log("=========prorpp11111111-----------",prodId,cateId,subcat,detsubcat)
//                                 callback(null, prodId,cateId,subcat,detsubcat);
//                             }
//                         }
//                 //     }
//                 // })
//                     }
//                 catch(Err){
//                     sendResponse.somethingWentWrongError(res);
//                 }
//             }(i))
//         }
//     }
//     else {
//         console.log("=========prorpp11111111----333333333-------",prodId,cateId,subcat,detsubcat)
//         callback(null,prodId,cateId,subcat,detsubcat)
//     }


//     /*  else{
//      for (var i = 0; i < productIds.length; i++) {
//      (function (i) {
//      var sql = "select id from supplier_branch_product where supplier_branch_id = ? and (product_id = ? or original_product_id = ? )and is_deleted = ?  limit 1"
//      multiConnection[dbName].query(sql, [branchId, productIds[i],productIds[i], 0], function (err, result) {
//      if(err){
//      console.log("errerrr",err);
//      sendResponse.somethingWentWrongError(res);
//      }
//      else{
//      if (result.length) {
//      var sql11='update supplier_branch_product set is_deleted = ? where supplier_branch_id =? and (product_id = ? or original_product_id = ? )'
//      multiConnection[dbName].query(sql11,[0,branchId,productIds[i],productIds[i]],function (err,response) {
//      if(err)
//      {
//      console.log("errrrrrr",err);
//      sendResponse.somethingWentWrongError(res);
//      }
//      })
//      }
//      var sql1='select s.commission,s.commission_type from supplier_category s join supplier_branch sb on ' +
//      'sb.supplier_id = s.supplier_id where category_id= ? and sb.id=?'
//      multiConnection[dbName].query(sql1,[categoryId[i],branchId],function (err1,result) {
//      if(err){
//      console.log("errerrr",err1);
//      sendResponse.somethingWentWrongError(res);
//      }
//      else{
//      //    console.log("jksddf",result);
//      if (prodId == "") {
//      prodId = productIds[i];
//      cateId = categoryId[i];
//      subcat= subCategoryId[i];
//      detsubcat= detailSubCategoryId[i];
//      commission= result[0].commission;
//      commissionType=result[0].commission_type;
//      if (i == productIds.length - 1) {
//      callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//      }
//      }
//      else {
//      prodId = prodId + "#" + productIds[i];
//      cateId = cateId + "#" + categoryId[i];
//      subcat=  subcat+  "#" + subCategoryId[i];
//      detsubcat=detsubcat+ "#" +  detailSubCategoryId[i];
//      commission= commission + "#" + result[0].commission;
//      commissionType= commissionType + "#" + result[0].commission_type;
//      if (i == productIds.length - 1) {
//      callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//      }
//      }
//      }
//      })
//      }
//      })
//      }(i))
//      }
//      }*/


// }





exports.getLanguages = function (req, res) {

    //console.log(req.originalUrl);

    var accessToken = req.body.accessToken;
    var manValues = [accessToken];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
        ], async function (error,result) {
            try{
            var sqlSelect = "select language_name,id,default_language,is_live FROM language "
            let getLanguage=await ExecuteQ.Query(req.dbName,sqlSelect,[]);
            // multiConnection[req.dbName].query(sqlSelect, function (err, getLanguage) {
            //     if (err) {
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
                    sendResponse.sendSuccessData(getLanguage, constant.responseMessage.GET_LANGUAGE, res, constant.responseStatus.SUCCESS)
            //     }

            // })
            }
            catch(Err){
                sendResponse.somethingWentWrongError(res);
            }

        }
    );

}

exports.listCurrencies = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            function (id,cb) {
                listCurrencies(req.dbName,res, cb);
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

function listCurrencies(dbName,res, callback) {
    var sql = "select id,currency_name from currency_conversion"
    multiConnection[dbName].query(sql, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })
}

async function insertPricing(dbName,res, productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, displayPrice, houseCleaningPrice, beautySaloonPrice, discountPrice, discountStartDate, discountEndDate,pricing_type,actualProductPrice, callback) {
    {
        console.log("+===============111111111================",discountStartDate,discountEndDate)
        let vendorApprovalCheck = await ExecuteQ.Query(dbName,
            "select `key`,value from tbl_setting where `key`=? and value=1", ["enable_updation_vendor_approval"]);

        if (vendorApprovalCheck && vendorApprovalCheck.length > 0) {
            if (discountPrice == 0) {
                var sql = "select id from product_pricing_updation_request where product_id = ? and price_type = ? and is_deleted = ? limit 1";
                multiConnection[dbName].query(sql, [productId, 0, 0], function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        if(result.length){
                            var sql11='update product_pricing_updation_request set is_deleted =1 where product_id = ? and price_type= ?'
                            multiConnection[dbName].query(sql11,[productId,0],function (err,result) {
                                if(err){
                                    console.log("update",err);
                                    sendResponse.somethingWentWrongError(res);
                                }
                            })
                        }
                        var sql1 = "insert into product_pricing_updation_request(product_id,start_date,end_date,price,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
                        multiConnection[dbName].query(sql1, [productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningPrice, beautySaloonPrice, displayPrice,urgentPrice,pricing_type], function (err, result) {
                            if (err) {
                                console.log("errrr",err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                    callback(null);
                            }
                        })
                    }
    
                })
    
            }
            else {
                console.log("+===============222222222222================",discountStartDate,discountEndDate)
                var sql1 = "select id from product_pricing_updation_request where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                multiConnection[dbName].query(sql1, [productId, 0, 1], function (err, check) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        if (check.length) {
                            callback(null);
                        }
                        else {
                            var sql22 = "insert into product_pricing_updation_request(product_id,start_date,end_date,price,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                            multiConnection[dbName].query(sql22, [productId, discountStartDate, discountEndDate, discountPrice, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 1, houseCleaningPrice, beautySaloonPrice, displayPrice,urgentPrice,pricing_type], function (err, result) {
                                if (err) {
                                    console.log(err)
                                    sendResponse.somethingWentWrongError(res);
                                }
                                else {
                                    callback(null);
    
                                }
                            })
                        }
                    }
                })
            }
        }else{
            if (discountPrice == 0) {
                var sql = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? limit 1";
                multiConnection[dbName].query(sql, [productId, 0, 0], function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        if(result.length){
                            var sql11='update product_pricing set is_deleted =1 where product_id = ? and price_type= ?'
                            multiConnection[dbName].query(sql11,[productId,0],function (err,result) {
                                if(err){
                                    console.log("update",err);
                                    sendResponse.somethingWentWrongError(res);
                                }
                            })
                        }
                        let inserActualprice="";
                        let inserActualprice2=""
                if(actualProductPrice && actualProductPrice!=null && actualProductPrice!=undefined){
                    inserActualprice=",actual_price"
                     inserActualprice2=",?"

                }
                        var sql1 = "insert into product_pricing(product_id,start_date,end_date,price,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type "+inserActualprice+") values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?"+inserActualprice2+") ";
                        multiConnection[dbName].query(sql1, [productId, startDate, endDate, price, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningPrice, beautySaloonPrice, displayPrice,urgentPrice,pricing_type,actualProductPrice], function (err, result) {
                            if (err) {
                                console.log("errrr",err);
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                    callback(null);
                            }
                        })
                    }
    
                })
    
            }
            else {
                console.log("+===============222222222222================",discountStartDate,discountEndDate)
                var sql1 = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                multiConnection[dbName].query(sql1, [productId, 0, 1], function (err, check) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        if (check.length) {
                            callback(null);
                        }
                        else {
                            var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                            multiConnection[dbName].query(sql22, [productId, discountStartDate, discountEndDate, discountPrice, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 1, houseCleaningPrice, beautySaloonPrice, displayPrice,urgentPrice,pricing_type], function (err, result) {
                                if (err) {
                                    console.log(err)
                                    sendResponse.somethingWentWrongError(res);
                                }
                                else {
                                    callback(null);
    
                                }
                            })
                        }
                    }
                })
            }
        }

    }
}

var insertProductPriceNew = function(dbName,res,productId,startDate,endDate,price,handlingFeeAdmin,
    handlingFeeSupplier, isUrgent,urgentPrice,deliveryCharges,minOrder, chargesBelowMinOrder, 
    urgentType, offerType,type,id,displayPrice,discountPrice,discountStartDate,discountEndDate,
    pricing_type,houseCleaningPrice,beautySaloonPrice,user_type_id){
    return new Promise((resolve,reject)=>{
        console.log("==========start date====end date=====price======>>>>",startDate,endDate,price,discountPrice)
        if(discountPrice===0 || discountPrice===undefined || discountPrice==="" || discountPrice===null){
            console.log("======in regular price=================")
            var sql = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? and user_type_id=? limit 1";
            multiConnection[dbName].query(sql, [productId, 0, 0,user_type_id], function (err, result) {
                //console.log("1",err,result);
                logger.debug("===========1==============")
                if (err) {
                    console.log("-0000000000000000000=====111====",err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if(result.length){
                        var sql11='update product_pricing set is_deleted =1 where product_id = ? and price_type= ? and user_type_id=?'
                        multiConnection[dbName].query(sql11,[productId,0,user_type_id],function (err,result) {
                            logger.debug("===========2==============")
                            if(err){
                                console.log("update",err);
                                console.log("-0000000000000000000=====2=222===",err)
                                sendResponse.somethingWentWrongError(res);
                            }
                        })
                    }
                        var sql1 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,display_price,urgent_value,pricing_type,user_type_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
                        multiConnection[dbName].query(sql1, [productId, startDate, endDate, price, 
                            handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges,
                             urgentType, offerType, displayPrice,urgentPrice,pricing_type,user_type_id], function (err, result) {
                                console.log("=========Err==3==============",err)                                 
                            if (err) {
                                console.log("-0000000000000000000=====3=333===",err)
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                    var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                                    multiConnection[dbName].query(sql2, [deliveryCharges, productId, id], function (err, result) {
                                        logger.debug("===========4==============")
                                        if (err) {
                                            console.log("-0000000000000000000=====4444====",err)
                                            sendResponse.somethingWentWrongError(res)
                                        }
                                        else {
                                            logger.debug("======FINAL==CB=>>")
                                            resolve();
                                        }
                                    })
                            }
                        })
                }
    
            })   
        }
        else {
            console.log("======in discount price=================")
            var sql1 = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? and user_type_id=? limit 1";
           var stmt = multiConnection[dbName].query(sql1, [productId, 0, 0,user_type_id], function (err, result) {
            logger.debug("===========5==============")    
            if (err) {
                    console.log("=============in insert pricing=======error======7========",stmt.sql,err)    
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (result.length) {
                        var sql1 = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and user_type_id=? and ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                        var stmt = multiConnection[dbName].query(sql1, [productId, 0, 1, user_type_id], function (err, check) {
                            logger.debug("===========6==============")
                            if (err) {
                                logger.debug("=============in insert pricing=======error======8========",stmt.sql,err)
    
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                if (check.length) {
                                    resolve();
                                }
                                else {
                                    var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,user_type_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                                   var stmt =  multiConnection[dbName].query(sql22, [productId, discountStartDate,
                                     discountEndDate, discountPrice, handlingFeeAdmin, handlingFeeSupplier,
                                      isUrgent, urgentPrice, deliveryCharges, urgentType, 1, 
                                      houseCleaningPrice, beautySaloonPrice, displayPrice,urgentPrice,
                                      pricing_type,user_type_id], function (err, result) {
                                        logger.debug("===========7==============")
                                        if (err) {
                                            console.log(err)
                                            // logger.debug("=============in insert pricing=======error=======9=======",stmt.sql,err)
    
                                            sendResponse.somethingWentWrongError(res);
                                        }
                                        else {
                                            if (type == 0) {
                                                resolve();
                                            }
                                            else if (type == 1) {
                                                var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                                                var stmt = multiConnection[dbName].query(sql2, [deliveryCharges,
                                                     productId, id], function (err, result) {
                                                        logger.debug("===========8==============")
                                                        if (err) {
                                                        // logger.debug("=============in insert pricing=======error======10========",stmt.sql,err)
    
                                                        sendResponse.somethingWentWrongError(res)
                                                    }
                                                    else {
                                                        resolve();
                                                    }
                                                })
                                            }
                                            else {
                                                resolve();
                                            }
                                        }
                                    })
                                }
                            }
                        })
    
                    }
    
                    else {
    
                        var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and user_type_id=? and  ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                        var stmt = multiConnection[dbName].query(sql, [productId, 0, 1, user_type_id], function (err, check) {
                            
                            logger.debug("===========9==============")
                            if (err) {
                                logger.debug("=============in insert pricing=======error======13========",stmt.sql,err)
    
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                if (check.length) {
                                    var sql11 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,user_type_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                    var stmt = multiConnection[dbName].query(sql11, [productId, startDate,
                                         endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                                          urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice, 
                                          beautySaloonPrice, displayPrice,urgentPrice,pricing_type,
                                          user_type_id], function (err, result) {
                                            logger.debug("===========10==============")
                                            if (err) {
                                            // console.log(err);
                                            logger.debug("=============in insert pricing=======error======14========",stmt.sql,err)
    
                                            sendResponse.somethingWentWrongError(res);
                                        }
                                        else {
                                            resolve();
                                        }
                                    })
                                }
                                else {
                                    var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,user_type_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                    var stmt = multiConnection[dbName].query(sql22, [productId, startDate, 
                                        endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                                         urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice,
                                          beautySaloonPrice, displayPrice,urgentPrice,pricing_type,
                                          user_type_id], function (err, result) {
                                            logger.debug("===========11==============")
                                            if (err) {
                                            // console.log(err);
                                            logger.debug("=============in insert pricing=======error=========15=====",stmt.sql,err)
    
                                            sendResponse.somethingWentWrongError(res);
                                        }
                                        else {
                                            var sql33 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,user_type_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                            var stmt = multiConnection[dbName].query(sql33, [productId, 
                                                discountStartDate, discountEndDate, discountPrice,
                                                 handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                                                  urgentPrice, deliveryCharges, urgentType, 
                                                  1, houseCleaningPrice, beautySaloonPrice, 
                                                  displayPrice,urgentPrice,pricing_type,
                                                  user_type_id], function (err, result) {
                                                    logger.debug("===========12==============")
                                                    if (err) {
                                                    // console.log(err)
                                                    logger.debug("=============in insert pricing=======error=====16=========",stmt.sql,err)
    
                                                    sendResponse.somethingWentWrongError(res);
                                                }
                                                else {
                                                    if (type == 0) {
                                                        resolve();;
                                                    }
                                                    else if (type == 1) {
                                                        var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                                                       var stmt = multiConnection[dbName].query(sql2, [deliveryCharges,
                                                        productId, id], function (err, result) {
                                                            logger.debug("===========13==============")
                                                            if (err) {
                                                                logger.debug("=============in insert pricing=======error======17========",stmt.sql,err)
    
                                                                sendResponse.somethingWentWrongError(res)
                                                            }
                                                            else {
                                                                resolve();
                                                            }
                                                        })
                                                    }
                                                    else {
                                                        resolve();
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }
    
                            }
                        })
                    }
    
                }
    
            })
        }
    })
}


exports.editProduct = async function (req, res) {


   console.log("****************************",req.body)
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var multiLanguageId = req.body.multiLanguageId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var priceUnit = req.body.priceUnit;
    var description = req.body.description;
    var calories = req.body.calories;
    var measuringUnit = req.body.measuringUnit;
    var sku = req.body.sku;
    var barCode = req.body.barCode;
    var count = req.body.count;
    var imagePath = req.body.imagePath;
    var commissionType = req.body.commissionType;
    var commissionPackage = req.body.commissionPackage;
    var pricing_type = req.body.pricing_type!=undefined?req.body.pricing_type:0
    var duration = req.body.duration!=undefined?req.body.duration:0
    let tax_exempt =req.body.tax_exempt!=undefined && req.body.tax_exempt!=""?req.body.tax_exempt:0;

    var commission = parseFloat(req.body.commission);
    var manValues = [accessToken, sectionId, measuringUnit, productId, multiLanguageId, name, priceUnit, description, sku, count, languageId, commission, commissionPackage, commissionType];
    var folder = "abc";
    var imageName = [];
    var adminId;
    var names;
    var languages;
    var descriptions,supplierId,supplier_id;
    var image = [];
    var imageOrder = req.body.imageOrder;
    imageOrder = imageOrder.split(',');
    // var deleteOrder  = req.body.deleteOrder==undefined?0:req.body.deleteOrder;
    let deleteOrder  =req.body.deleteOrder;
    deleteOrder = deleteOrder.split(',');
    // if(deleteOrder!=0){
    //     logger.debug("===========detelte=====order====2==",deleteOrder)
    //     deleteOrder = deleteOrder.split(',');
    // }
    let quantity=req.body.quantity!=undefined && req.body.quantity!=""?req.body.quantity:0;
    // var parent_id=req.body.parent_id!=undefined && req.body.parent_id!=""?req.body.parent_id:0
    let variant=req.body.variant!=undefined && req.body.variant!=""?JSON.parse(req.body.variant):[]
    var brand_id=req.body.brand_id!=undefined && req.body.brand_id!="" && req.body.brand_id!=null ?req.body.brand_id:0
    let making_price=req.body.making_price !=undefined && req.body.making_price!==""?req.body.making_price:0;
    let product_tags=req.body.product_tags !=undefined && req.body.product_tags!==""?req.body.product_tags:'';
    let is_product=req.body.is_product!=undefined && req.body.is_product!="" && req.body.is_product!=null?req.body.is_product:1

    let customTabDescription1 = req.body.customTabDescription1?req.body.customTabDescription1:null;
    let customTabDescription2 = req.body.customTabDescription2?req.body.customTabDescription2:null;
    let payment_after_confirmation=req.body.payment_after_confirmation || 0
    let cart_image_upload=req.body.cart_image_upload || 0;
    var grade=req.body.grade;
    var stock_number=req.body.stock_number;

    let is_non_veg = req.body.is_non_veg!==undefined && req.body.is_non_veg!==""?req.body.is_non_veg:0;

    const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['isProductCustomTabDescriptionEnable']);
    settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable = !!settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable;
    let item_unavailable = req.body.item_unavailable==undefined?0:req.body.item_unavailable
    let purchase_limit =  req.body.purchase_limit!==undefined && req.body.purchase_limit!==null?req.body.purchase_limit:""
    let is_subscription_required = req.body.is_subscription_required!==undefined && req.body.is_subscription_required!==""?req.body.is_subscription_required:0
    let allergy_description = req.body.allergy_description!==undefined && req.body.allergy_description!==""?req.body.allergy_description:""
    let is_allergy_product = req.body.is_allergy_product!==undefined && req.body.is_allergy_product!==""?req.body.is_allergy_product:0
    let is_appointment = req.body.is_appointment!==undefined && req.body.is_appointment!==""?
    req.body.is_appointment:0
    // let special_instructions = req.body.special_instructions!==undefined && req.body.special_instructions!==""?req.body.special_instructions:""
    let updateRequestId = req.body.updateRequestId!==undefined?req.body.updationRequestId:0;
    let Size_chart_url = "";
    let country_of_origin = "";

    if(req.files && req.files.Size_chart_url){
        Size_chart_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.Size_chart_url);
    }else if(req.body.Size_chart_url){
        Size_chart_url = req.body.Size_chart_url || "";
    }

    if(req.body && req.body.country_of_origin){
        country_of_origin = req.body.country_of_origin
    }


    if (req.files.image) {
        image = req.files.image;
    }

    let special_instructions = req.body.special_instructions || "";

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
            if(err){
                console.log(".....err",err);
                sendResponse.somethingWentWrongError(res)
            }
            else {
                supplier_id = result;
                cb(null)
            }
             });
            },
            function (cb) {
                getId(req.dbName,res,supplier_id,function (err,result) {
                    console.log("3333333333333333333333333333333333333",err,result)
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })

            },
    function (cb) {
                console.log("444444444444444444444444444444")
                names = name.split("#");
                languages = languageId.split("#");
                descriptions = description.split("#");
                measuringUnit = measuringUnit.split("#");
                multiLanguageId = multiLanguageId.split("#");

                
               products.updateProduct(req.dbName,res, productId, names[0], priceUnit, descriptions[0], sku, barCode,
                 commission, commissionType, commissionPackage, measuringUnit[0],quantity,brand_id,making_price,
                 product_tags,is_product,
                 pricing_type,duration,payment_after_confirmation,cart_image_upload, Size_chart_url,
                 country_of_origin,purchase_limit,
                 is_subscription_required,allergy_description,is_allergy_product,is_appointment,special_instructions,
                 updateRequestId,1,calories,grade,stock_number,is_non_veg,tax_exempt, cb);
            },
            function (id,cb) {

                let is_update = 0;

                if(parseInt(updateRequestId)!==0){
                    is_update = 1;
                }else{
                    updateRequestId = id;
                }
              

                products.updateProductNameInMultiLanguage(req.dbName,res, names, descriptions, languages, 
                    measuringUnit, multiLanguageId,updateRequestId,1,is_update, cb);
            },
            function (cb) {
                
                if (count != 0) {
                    for (var i = 0; i < count; i++) {
                        (function (i) {
                            async.parallel([
                                async function (cbs) {
                                    let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                    cbs(null,result);
                                    // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                }
                            ], function (err2, response2) {
                                console.log(".......image order...............",imageOrder[i]);
                                console.log("...................image:response2....................",response2);
                                imageName.push({order:imageOrder[i],image:response2});
                                if (imageName.length == count) {
                                    //console.log("==========imagename===========" + JSON.stringify(imageName));
                                    cb(null);
                                }
                            })
                        }(i))
                    }
                }
                else {
                    cb(null);
                }
            },
            function (cb) {
                logger.debug("===========deleete order============3=======",deleteOrder)
                if(deleteOrder && deleteOrder.length>0){
                    logger.debug("===========deleete order============4=======",deleteOrder)
                   products.deleteProductImagesOrder(req.dbName,res, productId,deleteOrder,1, cb);
                }else{
                    logger.debug("===========deleete order============5=======",deleteOrder)
                    cb(null)
                }
            },
           async  function (cb) {


               if(settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable === true){
                    let sql = "UPDATE product SET customTabDescription1 =?,customTabDescription2=? WHERE id = ?;";
                    let params = [customTabDescription1,customTabDescription2,productId];
                    await ExecuteQ.Query(req.dbName,sql,params);    
               }



                if(imageName.length){
                     insertProductImages(req.dbName,res, imageName, productId,updateRequestId,1,function(err,result){
                        if(err){
                            cb(err);
                        }else{
                            cb(null)
                        }
                    });
                }else{
                    cb(null);
                }
            },
            function(cb){
                if(variant && variant.length>0){
                    var updateInertQuery="" 
                    async.every(variant,function(i,callback){
                        if(i.id!=undefined && i.id!==""){
                            updateInertQuery="update product_variants set value='"+i.variant_id+"' where id="+i.id+"";
                        }
                        else{
                            updateInertQuery="insert into product_variants (`product_id`,`variant_id`) values ('"+productId+"',"+i.variant_id+")";
                        }
                        console.log("===updateInertQuery==",updateInertQuery)
                        multiConnection[req.dbName].query(updateInertQuery,function(err,data){
                           if(err){
                               callback(err)
                           }
                           else{
                               callback(null)
                           }
                       })

                      },function(err){
                          console.log("===ERR!==",err);
                          cb(null)
                    })
                }
                else{
                    cb(null);
                }
        }
        ], function (error, result) {
            console.log("===ERR!==",error)
            if(error){
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

            }
        }
    );

}
/**
 * @desc used for listing of product pricing listing
 */
exports.listProductPricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var id = req.body.id;
    var type = req.body.type; //0 : supplier, 2: supplier branch
    var manValues = [accessToken, sectionId, productId];
    var data={},supplier_id;
    var supplierId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                    if(err){
                        console.log(".....err",err);
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        supplier_id = result;
                        cb(null)
                    }
                },1);
            },
            //   function (cb) {
            //       func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res, cb);

            //   },
            function (cb) {
                 getId(req.dbName,res,supplier_id,function (err,result) {
                    if(err){
                    sendResponse.somethingWentWrongError(res)
                    }
                    else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                    }
                })
            },
            function (cb) {
                listProductPriceDetails(req.dbName,res, productId,type,id,supplierId, cb);
            },
            async function (product,cb){
                try{
                    var sql = 'select pricing_type from product where id = ?';
                    let result=await ExecuteQ.Query(req.dbName,sql,[productId]);
                    data.pricing = product;
                        if(result.length){
                            data.pricing_type = result[0].pricing_type;
                        }else{
                            data.pricing_type = 0;
                        }
                        cb(null,data);
                }
                catch(Err){
                    sendResponse.somethingWentWrongError(res);
                }
                // var sql = 'select pricing_type from product where id = ?';
                // multiConnection[req.dbName].query(sql,[productId],function (err,result) {
                //     if(err){
                //         console.log("err");
                //         sendResponse.somethingWentWrongError(res);
                //     } else{
                //         data.pricing = product;
                //         if(result.length){
                //             data.pricing_type = result[0].pricing_type;
                //         }else{
                //             data.pricing_type = 0;
                //         }
                //         cb(null,data);
                //     }
                // })
            },

            async function(data,cb){
                try{

                
                var temp = [];
                    var sql = "select s.urgentButton,sc.urgent_type,sc.urgent_price from supplier s join supplier_product sp on s.id = sp.	supplier_id " +
                        " join supplier_category sc on sc.supplier_id = s.id join product p on p.id = sp.product_id and sc.category_id = p.category_id " +
                        " where p.id = ? and s.id = ? "
                    temp.push(productId);
                    temp.push(supplierId);
                    let result=await ExecuteQ.Query(req.dbName,sql,temp);
                // multiConnection[req.dbName].query(sql,temp,function (err,result) {
                //     if(err){
                //         console.log("err...........................",result);
                //         sendResponse.somethingWentWrongError(res);
                //     } else{
                        if(result.length){
                            data.urgent_type = result[0].urgent_type;
                            data.urgent_value = result[0].urgent_price;
                        } else{
                            data.urgent_type = 0;
                            data.urgent_value = 0;
                        }
                        cb(null,data);
                //     }
                // })
                    }
                    catch(Err){
                        logger.debug("====Err!==>>",Err)
                        sendResponse.somethingWentWrongError(res);
                    }
            },
            async function(data,cb){
                try{
                var sql = "select urgentButton from supplier where id = ?";
                let result=await ExecuteQ.Query(req.dbName,sql,[supplierId]);

                // multiConnection[req.dbName].query(sql,[supplierId],function (err,result) {
                //     if(err){
                //         console.log("err...........................",result);
                //         sendResponse.somethingWentWrongError(res);
                //     } else{
                        if(result.length){
                            data.urgentButton = result[0].urgentButton;
                        } else{
                            data.urgentButton = 0
                        }
                        cb(null,data);
                //     }
                // })
                    }
                    catch(Err){
                        logger.debug("====Err!==",Err);
                        sendResponse.somethingWentWrongError(res);
                    }
            },async function(data,cb){
                try{
                var sql = " select price from product_pricing where product_id = ? and price_type = ? and is_deleted = 0";
                let result=await ExecuteQ.Query(req.dbName,[productId,0]);

                // multiConnection[req.dbName].query(sql,[productId,0],function(err,result){
                //     console.log("......................................err...........",err,result);
                //     console.log("......................................productId...........",productId);
                //     if(err){
                //         cb(err);
                //     }else{
                        if(result.length){
                            data.is_price = 1;
                            data.price = result[0].price;
                            cb(null,data);
                        }else{
                            data.is_price = 0;
                            data.price = 0;
                            cb(null,data);
                        }
                //     }
                // })
                    }
                    catch(Err){
                        logger.debug("=====Err!==>>",Err)
                        cb(Err)
                    }
            },
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

exports.deletePricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productPricingId = req.body.productPricingId;
    var manValues = [accessToken, sectionId, productPricingId];
    var supplierId,supplier_id;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                if(err){
                    console.log(".....err",err);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplier_id = result;
                    cb(null)
                }
            },1);
        },
        // function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res, cb);

        // },
        function (cb) {
             getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })
        },
       async  function (cb) {
            let checkUserType = await Universal.getUserPriceType(req.dbName)
            if (checkUserType && checkUserType.length > 0) {
                if (req.service_type == 1 || req.service_type == 2) {
                    for (const [index, i] of productPricingId.entries()) {
                        await deleteProductPricingNew(req.dbName, res, i);
                    }
                    cb(null);
                }
            } else {
                deleteProductPricing(req.dbName,res, productPricingId, cb);
            }
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

function deleteProductPricingNew(dbName,res, productPricingId) {
    return new Promise((resolve,reject)=>{
        var sql = "update product_pricing set is_deleted = ? where id = ? limit 1"
        multiConnection[dbName].query(sql, [1, productPricingId], function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                resolve();
            }
    
        })
    })
}


function deleteProductPricing(dbName,res, productPricingId, callback) {
    var sql = "update product_pricing set is_deleted = ? where id = ? limit 1"
    multiConnection[dbName].query(sql, [1, productPricingId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })
}

exports.editPricing = function (req, res) {


    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var productPricingId = req.body.productPricingId;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var price = req.body.price;
    var displayPrice = req.body.displayPrice;
    var handlingFeeAdmin = req.body.handlingFeeAdmin;
    var handlingFeeSupplier = req.body.handlingFeeSupplier;
    var isUrgent = req.body.isUrgent;
    var urgentPrice = req.body.urgentPrice;
    var urgentType = req.body.urgentType;
    var deliveryCharges = req.body.deliveryCharges;
    var minOrder = req.body.minOrder;
    var chargesBelowMinOrder = req.body.chargesBelowMinOrder;
    var areaId = req.body.areaId;
    var offerType = req.body.offerType;
    var type = req.body.type;
    var id=req.body.id;

    var manValues = [displayPrice,minOrder,chargesBelowMinOrder,offerType,
        accessToken, sectionId, productPricingId, startDate, endDate, price, 
        handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, 
        deliveryCharges, urgentType,productId];
    var supplierId,supplier_id;
    var adminId;
    console.log("*********values****************",req.body)
    let actualProductPrice="";
    if(req.body.actualProductPrice && req.body.actualProductPrice!=undefined && req.body.actualProductPrice!=null){
         actualProductPrice=req.body.actualProductPrice;
         displayPrice = price;
    }
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                if(err){
                    console.log(".....err",err);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplier_id = result;
                    cb(null)
                }
            },1);
        },
        // function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res, cb);

        // },
        function (cb) {
             getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    if(id==0){
                        id=supplierId
                    }
                    cb(null);
                }
            })
        },
           async function (cb) {
                let checkUserType = await Universal.getUserPriceType(req.dbName)
                if(checkUserType && checkUserType.length>0){
                    if(req.service_type==1 || req.service_type==2){
                        for(const [index,i] of price.entries()){
                            
                            await editPricingNew(req.dbName,res,i.productPricingId, i.startDate, i.endDate, 
                                i.price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, 
                                deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType,
                                 i.offerType, type, id, i.displayPrice, houseCleaningPrice, 0,productId,
                                 i.user_type_id);  
                        }           
                    cb(null);
                    }
                }else{
                    if (req.body.houseCleaningPrice) {
                        var houseCleaningPrice = req.body.houseCleaningPrice;
                        editPricing(req.dbName,res,productPricingId, startDate,
                             endDate, price, handlingFeeAdmin, handlingFeeSupplier, 
                             isUrgent, urgentPrice, deliveryCharges, minOrder,
                              chargesBelowMinOrder, areaId, urgentType, offerType,type ,
                               id, displayPrice, houseCleaningPrice, 0,productId,cb);
                    }
                    else if (req.body.beautySaloonPrice) {
                        var beautySaloonPrice = req.body.beautySaloonPrice;
                        editPricing(req.dbName,res, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, beautySaloonPrice,productId,actualProductPrice,cb);
                    }
                    else {
                        editPricing(req.dbName,res, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, 0,productId,actualProductPrice,cb);
                    }
                }

            },
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = []
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}

/*
async function  editPricing(dbName,res,productPricingId,
     startDate, endDate, price, handlingFeeAdmin,
      handlingFeeSupplier, isUrgent, urgentPrice,
       deliveryCharges, minOrder, chargesBelowMinOrder,
        areaId, urgentType, offerType, type, id, displayPrice,
         houseCleaningPrice,beautySaloonPrice,productId,callback)
*/

async function  editPricing(dbName,res,productPricingId,
     startDate, endDate, price, handlingFeeAdmin, 
     handlingFeeSupplier, isUrgent, urgentPrice,
      deliveryCharges, minOrder, chargesBelowMinOrder,
       areaId, urgentType, offerType, type, id, displayPrice,
        houseCleaningPrice,beautySaloonPrice,productId,actualProductPrice,callback)
{
    console.log("price",price,typeof(price),displayPrice,typeof(displayPrice))
    console.log("type",type)

    let vendorApprovalCheck = await ExecuteQ.Query(dbName,
        "select `key`,value from tbl_setting where `key`=? and value=1", ["enable_updation_vendor_approval"]);

    if (vendorApprovalCheck && vendorApprovalCheck.length > 0) {

        if(offerType == 1)
        {
            var sql = "select id from product_pricing_updation_request where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + startDate + "' and '" + endDate + "') or (end_date BETWEEN '" + startDate + "' and '" + endDate + "')) and id != ?  limit 1";
            multiConnection[dbName].query(sql, [productId, 0, 1,productPricingId], function (err, check) {
    
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else{
                    if(check.length){
    
                        var data = [];
                        sendResponse.sendSuccessData(data,constant.responseMessage.DUPLICATE_PRODUCT_PRICING,res,constant.responseStatus.SOME_ERROR);
    
                    }
                    else{
                        var sql = "update product_pricing_updation_request set start_date = ?,end_date = ?,price = ?,handling = ?, ";
                        sql += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
                        sql += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges=? where id = ? limit 1";
                        let stmt = multiConnection[dbName].query(sql,[startDate,endDate,price,handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,offerType,urgentType,urgentPrice,deliveryCharges,productPricingId],function(err,result)
                        {
                            logger.debug("===========in offer type 1 update price=========",stmt.sql)
                            if(err){
                                console.log("2",err);
                                sendResponse.somethingWentWrongError(res)
                            }
                            else{
                                callback(null)
                            }
    
                        })
                    }
    
                }
    
    
            })
    
    
        }
        else{
            let regular_price = price
            var get_ids = await getProductPricingUpdationRequestIds(dbName,productId)
            logger.debug("======getIds==========",get_ids)
    
            if (get_ids && get_ids.length > 0) {
                for(const [index,i] of get_ids.entries()){
                   await updateProductPricingUpdationRequest(dbName,i.price_type,i.id,i.price,i.display_price,price,
                    displayPrice,deliveryCharges,handlingFeeAdmin,startDate,endDate,handlingFeeSupplier,
                    isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,urgentType,urgentPrice
                    )
                    if(index==get_ids.length-1)
                    {
                        callback(null);
                    }
                }
            }
        else{
            callback(null)
            }
        }
    }else{

        if(offerType == 1)
        {
            var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + startDate + "' and '" + endDate + "') or (end_date BETWEEN '" + startDate + "' and '" + endDate + "')) and id != ?  limit 1";
            multiConnection[dbName].query(sql, [productId, 0, 1,productPricingId], function (err, check) {
    
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else{
                    if(check.length){
    
                        var data = [];
                        sendResponse.sendSuccessData(data,constant.responseMessage.DUPLICATE_PRODUCT_PRICING,res,constant.responseStatus.SOME_ERROR);
    
                    }
                    else{
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?, ";
                        sql += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
                        sql += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges=? where id = ? limit 1";
                        let stmt = multiConnection[dbName].query(sql,[startDate,endDate,price,handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,offerType,urgentType,urgentPrice,deliveryCharges,productPricingId],function(err,result)
                        {
                            logger.debug("===========in offer type 1 update price=========",stmt.sql)
                            if(err){
                                console.log("2",err);
                                sendResponse.somethingWentWrongError(res)
                            }
                            else{
                                callback(null)
                            }
    
                        })
                    }
    
                }
    
    
            })
    
    
        }
        else{
            let regular_price = price
            var get_ids = await getProductPricingIds(dbName,productId)
            logger.debug("======getIds==========",get_ids)
    
            if (get_ids && get_ids.length > 0) {
                for(const [index,i] of get_ids.entries()){
                   await updateProductPricing(dbName,i.price_type,i.id,i.price,i.display_price,price,
                    displayPrice,deliveryCharges,handlingFeeAdmin,startDate,endDate,handlingFeeSupplier,
                    isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,urgentType,urgentPrice,actualProductPrice
                    )
                    if(index==get_ids.length-1)
                    {
                        callback(null);
                    }
                }
            }
        else{
            callback(null)
            }
        }
    }

}
async function  editPricingNew(dbName,res,productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, houseCleaningPrice,beautySaloonPrice,productId,user_type_id)
{
    return new Promise(async(resolve,reject)=>{
        console.log("price",price,typeof(price),displayPrice,typeof(displayPrice))
        let vendorApprovalCheck = await ExecuteQ.Query(dbName,
            "select `key`,value from tbl_setting where `key`=? and value=1",
            ["enable_updation_vendor_approval"]);

        if(offerType == 1)
        {
            var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and user_type_id=? and ((start_date BETWEEN '" + startDate + "' and '" + endDate + "') or (end_date BETWEEN '" + startDate + "' and '" + endDate + "')) and id != ?  limit 1";
            let check=await ExecuteQ.Query(dbName,sql,[productId, 0, 1,user_type_id,productPricingId])
            // multiConnection[dbName].query(sql, [productId, 0, 1,user_type_id,productPricingId], function (err, check) {
    
            //     if(err){
            //         sendResponse.somethingWentWrongError(res)
            //     }
            //     else{
                    if(check.length){
    
                        var data = [];
                        sendResponse.sendSuccessData(data,constant.responseMessage.DUPLICATE_PRODUCT_PRICING,res,constant.responseStatus.SOME_ERROR);
    
                    }
                    else{
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?, ";
                        sql += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
                        sql += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges=? where id = ? and user_type_id=? limit 1";
                        await ExecuteQ.Query(dbName,sql,[moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),price,handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,offerType,urgentType,urgentPrice,deliveryCharges,productPricingId,user_type_id])
                        // multiConnection[dbName].query(sql,[moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),price,handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,offerType,urgentType,urgentPrice,deliveryCharges,productPricingId,user_type_id],function(err,result)
                        // {
                        //     if(err){
                        //         console.log("2",err);
                        //         sendResponse.somethingWentWrongError(res)
                        //     }
                        //     else{
                                resolve();
                        //     }
    
                        // })
                    }
    
            //     }
    
    
            // })
            }
        else{
            let regular_price = price
            var get_ids = await getProductPricingIdsNew(dbName,productId,user_type_id)
            logger.debug("======getIds==========",get_ids)
    
            if (get_ids && get_ids.length > 0) {
                for(const [index,i] of get_ids.entries()){
                   await updateProductPricing(dbName,i.price_type,i.id,i.price,i.display_price,price,
                    displayPrice,deliveryCharges,handlingFeeAdmin,startDate,endDate,handlingFeeSupplier,
                    isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,urgentType,urgentPrice,actualProductPrice
                    )
                    if(index==get_ids.length-1)
                    {
                        resolve();
                    }
                }
            }
        else{
            resolve();
            }
        }  
    })
    

}
function getProductPricingIdsNew(dbName,productId,user_type_id){
    let data = []
    return new Promise((resolve,reject)=>{
        var sql = "select id,price_type,price,display_price from product_pricing where product_id=? and is_deleted=? and user_type_id=? "
        let stmt = multiConnection[dbName].query(sql,[productId,0,user_type_id],function(err,result){
            logger.debug("================statement in query===========",stmt.sql)
            if(err){
                    reject(err)
            }else{
                if(result && result.length){
                    data = result
                    resolve(data)
                }else{
                    resolve(data)
                }
            }
        })
    })
}

function getProductPricingIds(dbName,productId){
    let data = []
    return new Promise((resolve,reject)=>{
        var sql = "select id,price_type,price,display_price from product_pricing where product_id=? and is_deleted=? "
        let stmt = multiConnection[dbName].query(sql,[productId,0],function(err,result){
            logger.debug("================statement in query===========",stmt.sql)
            if(err){
                    reject(err)
            }else{
                if(result && result.length){
                    data = result
                    resolve(data)
                }else{
                    resolve(data)
                }
            }
        })
    })
}

// product_pricing_updation_request

function getProductPricingUpdationRequestIds(dbName,productId){
    let data = []
    return new Promise((resolve,reject)=>{
        var sql = "select id,price_type,price,display_price from product_pricing_updation_request where product_id=? and is_deleted=? "
        let stmt = multiConnection[dbName].query(sql,[productId,0],function(err,result){
            logger.debug("================statement in query===========",stmt.sql)
            if(err){
                    reject(err)
            }else{
                if(result && result.length){
                    data = result
                    resolve(data)
                }else{
                    resolve(data)
                }
            }
        })
    })
}


async function updateProductPricing(dbName,price_type,product_pricing_id,orignal_price,
    orignal_display_price,price,display_price,deliveryCharges,handlingFeeAdmin,startDate,endDate,handlingFeeSupplier,
    isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,urgentType,urgentPrice,actualProductPrice
    ){
        logger.debug("========productPricingIdproductPricingId=======",product_pricing_id)
    return new Promise(async (resolve,reject)=>{
        let inserActualprice=""
                if(actualProductPrice && actualProductPrice!=null && actualProductPrice!=undefined){
                    inserActualprice=",actual_price="+actualProductPrice+""
                }
        if(price_type==0){
            let query = "update product_pricing set price=?, display_price=?, start_date = ?,end_date = ?,handling = ?, ";
            query += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
            query += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges= ? "+inserActualprice+" where id = ? limit 1";

            let params = [price,display_price,moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),
            handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,price_type,urgentType,
            urgentPrice,deliveryCharges,product_pricing_id]

            var data = await ExecuteQ.Query(dbName,query,params)
            resolve(data)
        }else{
            let orignalPrice = orignal_price
            let orignalDisplayPrice = orignal_display_price
            let discounted_ammount = 100-((orignalPrice/orignalDisplayPrice)*100)
            logger.debug("=========discounted_ammount========",discounted_ammount)
            price = display_price-((display_price/100)*discounted_ammount)
            logger.debug("===========price calculated==========",price)

            let query = "update product_pricing set price=?, display_price=?, start_date = ?,end_date = ?,handling = ?, ";
            query += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
            query += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges= ? where id = ? limit 1";

            let params = [price,display_price,moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),
            handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,
            price_type,urgentType,urgentPrice,deliveryCharges,product_pricing_id]

            var data = await ExecuteQ.Query(dbName,query,params)
            resolve(data)
        }
    })
}

async function updateProductPricingUpdationRequest(dbName,price_type,product_pricing_id,orignal_price,
    orignal_display_price,price,display_price,deliveryCharges,handlingFeeAdmin,startDate,endDate,handlingFeeSupplier,
    isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,urgentType,urgentPrice,
    ){
        logger.debug("========productPricingIdproductPricingId=======",product_pricing_id)
    return new Promise(async (resolve,reject)=>{
        if(price_type==0){
            let query = "update product_pricing_updation_request set price=?, display_price=?, start_date = ?,end_date = ?,handling = ?, ";
            query += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
            query += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges= ? where id = ? limit 1";

            let params = [price,display_price,moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),
            handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,price_type,urgentType,
            urgentPrice,deliveryCharges,product_pricing_id]

            var data = await ExecuteQ.Query(dbName,query,params)
            resolve(data)
        }else{
            let orignalPrice = orignal_price
            let orignalDisplayPrice = orignal_display_price
            let discounted_ammount = 100-((orignalPrice/orignalDisplayPrice)*100)
            logger.debug("=========discounted_ammount========",discounted_ammount)
            price = display_price-((display_price/100)*discounted_ammount)
            logger.debug("===========price calculated==========",price)

            let query = "update product_pricing_updation_request set price=?, display_price=?, start_date = ?,end_date = ?,handling = ?, ";
            query += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
            query += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges= ? where id = ? limit 1";

            let params = [price,display_price,moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),
            handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,
            price_type,urgentType,urgentPrice,deliveryCharges,product_pricing_id]

            var data = await ExecuteQ.Query(dbName,query,params)
            resolve(data)
        }
    })
}

exports.listSupplierCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplier_id,supplierId;
    var manValues = [accessToken, sectionId];
    
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                    if(err){
                        console.log(".....err",err);
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        supplier_id = result;
                        cb(null)
                    }
                },1);
            },
            // function (cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res, cb);
            // },
            function (cb) {
             getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })
            },
            function (cb) {
                logger.debug("=======supplierId==>>",supplierId)
                listSupplierCategories(req.dbName,res, supplierId,cb)
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

exports.listSupplierSubCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId,supplier_id;
    var categoryId = req.body.categoryId;
    var manValues = [accessToken, sectionId, categoryId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                if(err){
                    console.log(".....err",err);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplier_id = result;
                    cb(null)
                }
            },1);
        },
        // function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res, cb);
        // },
        function (cb) {
             getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })
        },
            function (cb) {
                listSupplierSubCategories(req.dbName,res, supplierId, categoryId, cb);
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

exports.listSupplierDetailedSubCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId,supplier_id
    var subCategoryId = req.body.subCategoryId;
    var manValues = [accessToken, sectionId, subCategoryId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, function (err,result) {
                if(err){
                    console.log(".....err",err);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplier_id = result;
                    cb(null)
                }
            },1);
        },
        // function (cb) {
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res, cb);
        // },
        function (cb) {
             getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })
        },
            function (cb) {
                listSupplierDetailedSubCategories(req.dbName,res, supplierId, subCategoryId, cb);
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


async function listSupplierCategories(dbName,res, supplierId, callback) {
    try{
        var sql = "select ss.commisionButton ,ss.urgentButton,s.category_id,c.name,s.commission_type,s.commission,s.commission_package,c.type,c.is_variant,c.is_barcode,c.order,c.product_addition_level,c.tax from supplier_category s join categories c";
        sql += " on s.category_id = c.id join supplier ss on ss.id  = s.supplier_id where s.supplier_id = ? and c.id != 102 and c.parent_id = 0 and c.is_live=1 group by s.category_id";
        let categories=await ExecuteQ.Query(dbName,sql,[supplierId]);
        callback(null, categories);
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res);
    }

    // var sql = "select ss.commisionButton ,ss.urgentButton,s.category_id,c.name,s.commission_type,s.commission,s.commission_package,c.type,c.is_variant,c.is_barcode,c.order,c.product_addition_level,c.tax from supplier_category s join categories c";
    // sql += " on s.category_id = c.id join supplier ss on ss.id  = s.supplier_id where s.supplier_id = ? and c.id != 102 group by s.category_id";
    
    // multiConnection[dbName].query(sql, [supplierId], function (err, categories) {

    //     //   console.log(".er.......................",err,categories);
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null, categories);
    //     }

    // })

}


async function listSupplierSubCategories(dbName,res, supplierId, categoryId, callback) {
    try{
        var sql = "select s.sub_category_id,c.name from supplier_category s join categories c ";
        sql += " on s.sub_category_id = c.id where s.supplier_id = ? and s.category_id = ? group by s.sub_category_id ";
        let subCategories=await ExecuteQ.Query(dbName,sql,[supplierId, categoryId]);
        callback(null, subCategories);
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "select s.sub_category_id,c.name from supplier_category s join categories c ";
    // sql += " on s.sub_category_id = c.id where s.supplier_id = ? and s.category_id = ? group by s.sub_category_id ";
    // multiConnection[dbName].query(sql, [supplierId, categoryId], function (err, subCategories) {
    //     //  console.log("........",err,subCategories)
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null, subCategories);
    //     }

    // })

}


async function listSupplierDetailedSubCategories(dbName,res, supplierId, subCategoryId, callback) {
    try{
        var sql = "select s.detailed_sub_category_id,c.name from supplier_category s join categories c";
        sql += " on s.detailed_sub_category_id = c.id where s.supplier_id = ? and s.sub_category_id = ? group by s.detailed_sub_category_id";
        let detailedSubCategories=await ExecuteQ.Query(dbName,sql,[supplierId, subCategoryId]);
        callback(null, detailedSubCategories);
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "select s.detailed_sub_category_id,c.name from supplier_category s join categories c";
    // sql += " on s.detailed_sub_category_id = c.id where s.supplier_id = ? and s.sub_category_id = ? group by s.detailed_sub_category_id";
    // multiConnection[dbName].query(sql, [supplierId, subCategoryId], function (err, detailedSubCategories) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null, detailedSubCategories);
    //     }

    // })
}

exports.assignProductToSupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId,supplier_id;
    var productId = req.body.productId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, productId, categoryId, subCategoryId, detailedSubCategoryId];
    var adminId;
    var newId;

    var oldId;
    var pricing_level;
    var category,subCategory,detailedSubCategory;
    var commission,commissionType;
    // console.log(",,,,,,,",req.body)
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
        },
        // function (id, cb) {
        //     supplier_id = id;
        //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
        // },
        function (id,cb) {
            supplier_id = id;
             getId(req.dbName,res,supplier_id,function (err,result) {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    supplierId=result[0].supplier_id;
                    cb(null);
                }
            })
        },
            function (cb){
                
                var sql='select pricing_level from supplier where id = ? and is_deleted = 0 '
                multiConnection[req.dbName].query(sql,[supplierId],function (err,result) {
                    if(err){
                        console.log("errrrr",err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        pricing_level=result[0].pricing_level;
                        //console.log("kbjsdf",pricing_level);
                        cb(null);
                    }
                })
            },
           async function (cb) {                

                // checkForProducts(req.dbName,res, supplierId,categoryId,subCategoryId,detailedSubCategoryId, productId,pricing_level, cb);
                var productData = await checkForProducts(req.dbName,res, supplierId,categoryId,subCategoryId,detailedSubCategoryId, productId,pricing_level);
                logger.debug("===============prdouct data---==========-------======",productData)
                let ids = productData[0]
                let cat = productData[1]
                let subCat = productData[2]
                let detSubCat = productData[3]
                let commission1 = productData[4]
                let commissionType1 = productData[5]
                cb(null,ids,cat,subCat,detSubCat,commission1,commissionType1)                  
            },
            async function (ids,cat,subCat,detSubCat,commission1,commissionType1,cb) {
                logger.debug("bhdk",ids,cat,subCat,detSubCat,commission1,commissionType1);
                ids=ids+'#';
                commission1=commission1+'#';
                commissionType1=commissionType1+'#';
                oldId=ids.split('#');
                category=cat;
                subCategory=subCat;
                detailedSubCategory=detSubCat;
                commission=commission1.split('#');
                commissionType = commissionType1.split('#')
                oldId.pop();
                commission.pop();
                commissionType.pop();
                if (oldId != "") {

                    let insertIds = await  getData(req.dbName,res, oldId,commission,commissionType,pricing_level, cb);
                    cb(null,insertIds)                    
                }
                else {
                    cb(null,[]);
                }
            },
            async function (ids,cb) {
                newId=ids;
                if (oldId != "") {
                    await multilanguage(req.dbName,res,newId,oldId,cb);
                    cb(null,[])
                }
                else {
                    cb(null,[]);
                }

            },
            async function(ids,cb){
                if (oldId != "") {
                  await productImage(req.dbName,res,newId,oldId)
                  cb(null)
                }
                else {
                    cb(null);
                }
            },
            async function (cb) {
                if (oldId != "") {
                    
                    await assignProductToSupplier(req.dbName,res, supplierId, newId,oldId, category, subCategory, detailedSubCategory, cb);
                    cb(null)
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

// function checkForProducts(dbName,res, supplierId,category,subCategory,detailedSubCategory, productId,pricing_level, callback) {
//     var prodId = "";
//     var cateId = "";
//     var subcat = "";
//     var detsubcat = "";
//     var commission= "";
//     var commissionType="";
//     var productIds = productId.split("#");
//     var categoryId=category.split("#");
//     var subCategoryId=subCategory.split("#");
//     var detailSubCategoryId=detailedSubCategory.split("#");
//     if(pricing_level)
//     {
//         for (var i = 0; i < productIds.length; i++) {
//             (function (i) {
//                 var sql = "select id from supplier_product where supplier_id = ?  and (product_id = ? or original_product_id = ? ) and is_deleted = ? limit 1"
//                 multiConnection[dbName].query(sql, [supplierId, productIds[i], productIds[i], 0], function (err, result) {
//                     if(err){
//                         console.log("errerrr",err);
//                         sendResponse.somethingWentWrongError(res);
//                     }
//                     else{
//                         if (result.length) {
//                             var sql1='update supplier_product set is_deleted = ? where supplier_id =? and (product_id = ? or original_product_id = ? )'
//                             multiConnection[dbName].query(sql1,[1,supplierId,productIds[i],productIds[i]],function (err,response) {
//                                 if(err)
//                                 {
//                                     console.log("errrrrrr",err);
//                                     sendResponse.somethingWentWrongError(res);
//                                 }
//                             })
//                         }
//                         if (prodId == "") {
//                             prodId = productIds[i];
//                             cateId = categoryId[i];
//                             subcat= subCategoryId[i];
//                             detsubcat= detailSubCategoryId[i];
//                             if (i == productIds.length - 1) {
//                                 callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//                             }
//                         }
//                         else {
//                             prodId =  prodId + "#" + productIds[i];
//                             cateId =  cateId + "#" +categoryId[i];
//                             subcat=   subcat + "#" +subCategoryId[i];
//                             detsubcat= detsubcat + "#" + detailSubCategoryId[i];
//                             if (i == productIds.length - 1) {
//                                 callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//                             }
//                         }
//                     }
//                 })
//             }(i))
//         }
//     }
//     else {
//         for (var i = 0; i < productIds.length; i++) {
//             (function (i) {
//                 var sql = "select id from supplier_product where supplier_id = ?  and (product_id = ? or original_product_id = ? ) and is_deleted = ? limit 1"
//                 multiConnection[dbName].query(sql, [supplierId, productIds[i], productIds[i], 0], function (err, result) {
//                     if(err){
//                         console.log("errerrr",err);
//                         sendResponse.somethingWentWrongError(res);
//                     }
//                     else{
//                         if (result.length) {

//                             var sql11='update supplier_product set is_deleted = ? where supplier_id =? and (product_id = ? or original_product_id = ? )'
//                             multiConnection[dbName].query(sql11,[1,supplierId,productIds[i],productIds[i]],function (err,response) {
//                                 if(err)
//                                 {
//                                     console.log("errrrrrr",err);
//                                     sendResponse.somethingWentWrongError(res);
//                                 }
//                             })
//                         }
//                         var sql1='select commission,commission_type from supplier_category where category_id= ? and supplier_id=?'
//                         multiConnection[dbName].query(sql1,[categoryId[i],supplierId],function (err1,result) {
//                             if(err){
//                                 console.log("errerrr",err1);
//                                 sendResponse.somethingWentWrongError(res);
//                             }
//                             else{
//                                 if (prodId == "") {
//                                     prodId = productIds[i];
//                                     cateId = categoryId[i];
//                                     subcat= subCategoryId[i];
//                                     detsubcat= detailSubCategoryId[i];
//                                     commission= result[0].commission;
//                                     commissionType=result[0].commission_type;
//                                     if (i == productIds.length - 1) {
//                                         callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//                                     }
//                                 }
//                                 else {
//                                     prodId =  prodId + "#" + productIds[i];
//                                     cateId =  cateId + "#" +categoryId[i];
//                                     subcat=   subcat + "#" +subCategoryId[i];
//                                     detsubcat= detsubcat + "#" + detailSubCategoryId[i];
//                                     commission= commission + "#" + result[0].commission;
//                                     commissionType= commissionType + "#" + result[0].commission_type;
//                                     if (i == productIds.length - 1) {
//                                         callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//                                     }
//                                 }
//                             }
//                         })
//                     }
//                 })
//             }(i))
//         }

//     }


// }

async function checkForProducts(dbName,res, supplierId,category,subCategory,detailedSubCategory, productId,pricing_level) {
    return new Promise(async(resolve,reject)=>{
        var prodId = "";
        var cateId = "";
        var subcat = "";
        var detsubcat = "";
        var commission= "";
        var commissionType="";
        var productIds = productId.split("#");
        var categoryId=category.split("#");
        var subCategoryId = [];
        if (subCategory) {
            subCategoryId = subCategory.split("#");
        }
        var detailSubCategoryId = [];
        if(detailedSubCategory){
            detailSubCategoryId = detailedSubCategory.split("#");   
        }
        logger.debug("====checkForProducts==ssss===pricing_level======>>",pricing_level);
    
         if(pricing_level)
         {
    
            console.log("lndcheckForProductssfk=====ssss====", productIds, categoryId, subCategoryId, detailSubCategoryId)
            if (productIds && productIds.length) {
                for (const [index, i] of productIds.entries()) {
    
                    logger.debug("====i,index===checkForProducts=======i,index====ssss======", i, index)
    
                    await updateSupplierProduct(dbName, res, i, supplierId)
                    if (prodId == "") {
                        logger.debug("=======checkForProducts======here====111111111111111==ssss====++", prodId)
                        prodId = i;
                        cateId = categoryId[index];
                        subcat = subCategoryId[index];
                        detsubcat = detailSubCategoryId[index];
                        logger.debug("======cateId,subcat,detsubcat=checkForProducts====aaaaaaaaaaaaa=ssss====",cateId,subcat,detsubcat)
                        if (index == productIds.length - 1) {
    
                            logger.debug("=====checkForProducts========here======55555555555=ssss===++", prodId, index, productIds.length)
                            resolve(
                                [
                                    prodId, cateId, subcat, detsubcat, commission, commissionType
                                ]
                            );
                        }
                    }
                    else {
                        logger.debug("=====checkForProducts========here======2222222222==ssss==++", prodId)
                        prodId = prodId + "#" + i;
                        cateId = cateId + "#" + categoryId[index];
                        subcat = subcat + "#" + subCategoryId[index];
                        detsubcat = detsubcat + "#" + detailSubCategoryId[index];
                        logger.debug("=====checkForProducts========here======33333333333==ssss==++", prodId,cateId,subcat,detsubcat)
                        logger.debug("===checkForProducts===cateId,subcat,detsubcat===bbbbbbbbbbb===ssss====",cateId,subcat,detsubcat)
                        if (index == productIds.length - 1) {
                            logger.debug("=====checkForProducts========here======4444444444444==ssss==++", prodId, index, productIds.length)
                            resolve(
                                [
                                    prodId, cateId, subcat, detsubcat, commission, commissionType
                                ]
                            );
                        }
                    }
    
                }
            } else {
                resolve(
                    [
                        prodId, cateId, subcat, detsubcat, commission, commissionType
                    ]
                )
            }
         }
        else {
    
            console.log("lndsfk", productIds, categoryId, subCategoryId, detailSubCategoryId)
            if (productIds && productIds.length) {
                for (const [index, i] of productIds.entries()) {
    
                    logger.debug("====i,index===checkForProducts else=======i,index===ssss=======", i, index)
    
                    await updateSupplierProduct(dbName, res, i, supplierId)
                    if (prodId == "") {
                        logger.debug("======checkForProducts else=======here====111111111111111===ssss===++", prodId)
                        prodId = i;
                        cateId = categoryId[index];
                        subcat = subCategoryId[index];
                        detsubcat = detailSubCategoryId[index];
                        logger.debug("======cateId,subcat,detsubcat=checkForProducts else====aaaaaaaaaaaaa=ssss====",cateId,subcat,detsubcat)
                        if (index == productIds.length - 1) {
    
                            logger.debug("=====checkForProducts else========here======55555555555==ssss==++", prodId, index, productIds.length)
                            resolve(
                                [
                                    prodId, cateId, subcat, detsubcat, commission, commissionType
                                ]
                            );
                        }
                    }
                    else {
                        logger.debug("=======checkForProducts else======here======2222222222=ssss===++", prodId)
                        prodId = prodId + "#" + i;
                        cateId = cateId + "#" + categoryId[index];
                        subcat = subcat + "#" + subCategoryId[index];
                        detsubcat = detsubcat + "#" + detailSubCategoryId[index];
                        logger.debug("====checkForProducts else=========here======33333333333=ssss===++", prodId,cateId,subcat,detsubcat)
                        logger.debug("==checkForProducts else====cateId,subcat,detsubcat===bbbbbbbbbbb===ssss====",cateId,subcat,detsubcat)
                        if (index == productIds.length - 1) {
                            logger.debug("===checkForProducts else==========here======4444444444444==ssss==++", prodId, index, productIds.length)
                            resolve(
                                [
                                    prodId, cateId, subcat, detsubcat, commission, commissionType
                                ]
                            );
                        }
                    }
    
                }
            } else {
                resolve(
                    [
                        prodId, cateId, subcat, detsubcat, commission, commissionType
                    ]
                )
            }
    
         }
    
    })
    
}

function updateSupplierProduct(dbName, res, productId, supplierId) {
    return new Promise(async (resolve, reject) => {

        try {
            let sql = "select id from supplier_product where supplier_id = ? and (product_id = ? or original_product_id = ? )and is_deleted = ?  limit 1"
            let params = [supplierId, productId, productId, 0]
            let result = await ExecuteQ.Query(dbName, sql, params)
            if (result && result.length) {
                let sql1 = 'update supplier_product sp ' +
                    ' set sp.is_deleted =? where sp.supplier_id =? and (sp.product_id = ? or sp.original_product_id = ? )'
                let params1 = [1, supplierId, productId, productId]
                let response = await ExecuteQ.Query(dbName, sql1, params1)
                resolve()
            } else {
                resolve()
            }
        } catch (err) {
            logger.debug("===========err in getProducts=+++++", err)
            reject()
        }
    })
}




function assignProductToSupplier(dbName,res, supplierId, productId,oldProductId, categoryId, subCategoryId, detailedSubCategoryId, callback) {
//console.log("jnsdfbksd", supplierId, productId,oldProductId, categoryId, subCategoryId, detailedSubCategoryId,callback)
return new Promise((resolve,reject)=>{
    if(Array.isArray(productId)){
        var productIds=productId;
        }
        else {
        var productIds = productId.split("#");
    }
        categoryId=categoryId+'#';
        subCategoryId=subCategoryId+'#';
        detailedSubCategoryId=detailedSubCategoryId+'#';
        var categoryIds = categoryId.split("#");
        categoryIds.pop();
        var subCategoryIds = subCategoryId.split("#");
        subCategoryIds.pop();
        logger.debug("=========detailedSubCategoryIds===1>>",detailedSubCategoryIds)
        var detailedSubCategoryIds = detailedSubCategoryId.split("#");
         detailedSubCategoryIds.pop();
        //console.log("lmnsdsss",categoryIds,subCategoryIds,detailedSubCategoryIds,oldProductId,productId);
        logger.debug("=========detailedSubCategoryIds=>>",detailedSubCategoryIds)
        var queryString = "(?,?,?,?),";
        var insertString = "";
        var values = [];
    
        for (const [index, i] of productIds.entries()) {
            values.push(supplierId, productIds[index], categoryIds[index],oldProductId[index]);
            insertString = insertString + queryString;
            logger.debug("====values=====>>",values)
            if (index == productIds.length - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
               //console.log("iii",values);
                var sql = "insert into supplier_product(supplier_id,product_id,category_id,original_product_id) values " + insertString;
               var st= multiConnection[dbName].query(sql, values, function (err, result) {
                logger.debug(st.sql)    
                if (err) {
                        console.log(err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        resolve()
                    }
    
                })
    
            }
    
        }
    
})

}


exports.listProducts = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    let serachText=req.body.serachText;
    let searchType=serachText!=undefined && serachText!=""?1:0
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, categoryId, subCategoryId, detailedSubCategoryId];
    var supplier_id;
    var limit = req.body.limit
    var offset = req.body.offset
    console.log("...........",req.body);
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            // },
            function (id,cb) {
                supplier_id = id;

                adminloginFunctions.listOfProducts(req.dbName,res, categoryId, subCategoryId, detailedSubCategoryId,limit,offset,searchType,serachText,cb);
            },
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

exports.listSupplierBranchesWithNamesOnly = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    var supplier_id,supplierId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplier_id = id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            // },
           function (id,cb) {
            supplier_id = id;

                getId(req.dbName,res,supplier_id,function (err,result) {
                   if(err){
                       sendResponse.somethingWentWrongError(res)
                   }
                   else {
                       supplierId=result[0].supplier_id;
                       cb(null);
                   }
               })
           },
            function (cb) {
                listSuppliersBranchesForAssigningProducts(req.dbName,res, supplierId, cb);
            },
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

exports.deletezipcode=async(req,res)=>{
    try {
        
        let zipcode_id=req.body.zipcode_id;
        let supplier_id=req.body.supplier_id;
        let product_id=req.body.product_id;
  
        let sql="update zipcode set is_deleted= 1 where id=? and product_id=? and supplier_id=?";
        let params=[zipcode_id,product_id,supplier_id];
        let result=await ExecuteQ.Query(req.dbName,sql,params)
       
        sendResponse.sendSuccessData("Delete successfully", constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        
    } catch (err) {
        sendResponse.somethingWentWrongError(res)
    }


}

exports.editzipcode=async(req,res)=>
{
    try {
        let zipcode_id=req.body.zipcode_id;
        let supplier_id=req.body.supplier_id;
        let product_id=req.body.product_id;
        let zipcode=req.body.zipcode;

        let sql="update language set zipcode=? where id=? and product_id=? and supplier_id=?"
        let params=[zipcode,zipcode_id,product_id,supplier_id]

        let result=await ExecuteQ.Query(req.dbName,sql,params)

        sendResponse.sendSuccessData("Edit successfully", constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    } catch (err) {
        sendResponse.somethingWentWrongError(res)
    }

}