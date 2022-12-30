var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');
var products = require('./product');
var _ = require('underscore');
var moment = require('moment');
var chunk = require('chunk')
var consts = require('../config/const')
const uploadMgr = require('../lib/UploadMgr')
var log4js = require("log4js")
const Universal = require('../util/Universal')
const ExecuteQ = require('../lib/Execute')
var logger = log4js.getLogger();
logger.level = 'debug';

exports.listCurrencies = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listCurrencies(req.dbName, res, cb);
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


exports.listCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        /* function (cb) {
             func.authenticateAccessToken(accessToken, res, cb);
         },
         function (id, cb) {
             func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
         },*/
        function (cb) {
            listCategories(req.dbName, res, cb);
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


exports.listSubCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var manValues = [accessToken, sectionId, categoryId];
    console.log("***********", req.body);
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        /* function (cb) {
             func.authenticateAccessToken(accessToken, res, cb);
         },
         function (id, cb) {
             func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
         },*/
        function (cb) {
            listSubCategories(req.dbName, res, categoryId, cb);
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

/**
 * @desc used for adding an product by admin
 */
exports.addProduct = function (req, res) {
    logger.debug("================req.body in add Produt=========", req.body)
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    let payment_after_confirmation = req.body.payment_after_confirmation || 0
    let cart_image_upload = req.body.cart_image_upload || 0
    var name = req.body.name;
    var languageId = req.body.languageId;
    var priceUnit = req.body.priceUnit;
    var description = req.body.description;
    var measuringUnit = req.body.measuringUnit;
    var sku = req.body.sku;
    var barCode = req.body.barCode;
    var count = parseInt(req.body.count);
    var image = req.files != undefined ? req.files.image : [];
    var imageOrder = req.body.imageOrder;
    var quantity = req.body.quantity != undefined && req.body.quantity != "" ? req.body.quantity : 0
    var parent_id = req.body.parent_id != undefined && req.body.parent_id != "" ? req.body.parent_id : 0
    var variant_id = req.body.variant_id != undefined && req.body.variant_id != "" ? req.body.variant_id : []
    var is_product = req.body.is_product != undefined && req.body.is_product !== "" ? req.body.is_product : 1
    var duration = req.body.duration != undefined && req.body.duration !== "" ? req.body.duration : 0
    var interval_flag = req.body.interval_flag != undefined && req.body.interval_flag !== "" ? req.body.interval_flag : 0;
    var interval_value = req.body.interval_value != undefined && req.body.interval_value !== "" ? req.body.interval_value : 0;
    var making_price = req.body.making_price != undefined && req.body.making_price !== "" ? req.body.making_price : 0;
    var product_tags = req.body.product_tags != undefined && req.body.product_tags !== "" ? req.body.product_tags : '';
    var path = req.path;
    var getting_version = path.indexOf("v");
    let is_prescribed = req.body.is_prescribed != undefined && req.body.is_prescribed !== "" ? req.body.is_prescribed : 0;
    var api_version = 0
    if (getting_version > 0) {
        var after_v = path.substr(path.indexOf("v") + 1);
        api_version = parseInt(after_v.substr(0, after_v.indexOf("/")));
    }
    var product_variant_ids = []
    // else{

    // }
    imageOrder = imageOrder.split(",");
    console.log("..............imageOrder.......gf............", imageOrder);

    var commissionType = req.body.commissionType;
    var commissionPackage = req.body.commissionPackage;
    var commission = parseFloat(req.body.commission);
    var pricing_type = req.body.pricing_type;

    var brand_id = req.body.brand_id != undefined && req.body.brand_id != "" && req.body.brand_id != null ? req.body.brand_id : 0
    logger.debug("=============req.body.brand_id============", brand_id)

    //console.log("ljdf",commission,req.body.commission);
    var manValues = [accessToken, sectionId, measuringUnit, categoryId, subCategoryId, detailedSubCategoryId, name, priceUnit, description, sku, count, languageId, commission, commissionPackage, commissionType, pricing_type];
    //console.log("jhbvsda",manValues);
    var folder = "abc";
    var imageName = [];
    var adminId;
    var productId;
    var names;
    var languages;
    var descriptions, final_value;
    // console.log(req.body);
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        async function (cb) {
            try {
                if (parent_id != 0) {
                    if (variant_id && variant_id.length > 0) {
                        var sqlS = "select prv.product_id,prv.variant_id,count(prv.product_id) AS count  from product_variants prv where prv.variant_id IN (?) " +
                            " and prv.parent_id!=prv.product_id group by prv.product_id having count>=?"
                        let variantDat = await ExecuteQ.Query(dbName, sqlS, [variant_id, parseInt(variant_id.length)]);

                        // var st=multiConnection[dbName].query(sqlS,[variant_id,parseInt(variant_id.length)],function(er,variantDat){
                        //     if(err){
                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        //     else{
                        if (variantDat && variantDat.length > 0) {
                            sendResponse.sendSuccessData({}, constant.ProductVariant.ALREADY_EXIST, res, constant.responseStatus.SOME_ERROR);
                        }
                        else {
                            cb(null)
                        }
                        //     }

                        // })

                    }
                    else {
                        console.log("===PARAMS=MISSED=variant_id=", variant_id)
                        sendResponse.parameterMissingError(res);
                    }

                }
                else {
                    cb(null)
                }
            }
            catch (Err) {
                logger.debug("=====Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            names = name.split("#");
            languages = languageId.split("#");
            descriptions = description.split("#");
            measuringUnit = measuringUnit.split("#");

            insertProduct(req.dbName, res, is_prescribed, adminId, categoryId, subCategoryId, detailedSubCategoryId, names[0], priceUnit, descriptions[0], sku, barCode, commission, commissionType, commissionPackage, measuringUnit[0], pricing_type, quantity, parent_id, brand_id, is_product, duration, interval_flag, interval_value, making_price, product_tags, api_version, payment_after_confirmation, cart_image_upload, cb);
        },
        function (id, cb) {
            productId = id;
            insertProductNameInMultiLanguage(req.dbName, res, productId, names, descriptions, languages, measuringUnit, cb);
        },
        function (cb) {
            // console.log("===variant_id==",variant_id)
            var parent_ids = parent_id == 0 ? productId : parent_id
            if (variant_id && variant_id.length > 0) {
                _.each(variant_id, function (i) {
                    product_variant_ids.push(
                        productId,
                        i,
                        parent_ids
                    )
                })
                final_value = chunk(product_variant_ids, 3);
                insertProductVarints(req.dbName, res, final_value, cb);

            }
            else {
                cb(null)
            }
        },
        function (cb) {
            if (count) {
                for (var i = 0; i < count; i++) {
                    (function (i) {
                        async.parallel([
                            async function (cbs) {
                                // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                cbs(null, result);
                            }
                        ], function (err2, response2) {
                            /*        console.log("..............imageOrder...................",imageOrder[i]);
                                    console.log("..............response2...................",response2);
        */
                            imageName.push({ order: imageOrder[i], image: response2 });
                            //console.log("==============response2===============" + response2);
                            if (imageName.length == count) {
                                //console.log("==========imagename===========" + JSON.stringify(imageName));
                                cb(null);
                            }
                        })
                    }(i))
                }
            } else {
                cb(null);
            }
        },
        function (cb) {

            console.log("..............imageName...................", imageName);
            insertProductImages(req.dbName, res, imageName, productId, cb);

        },
        function (id, cb) {

            updateDefaultImage(req.dbName, res, id, cb);


        }
    ], function (error, result) {


        if (error) {
            sendResponse.somethingWentWrongError(res);
        }

        else {
            var data = {
                productId: productId
            }

            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }

    }
    );
}
/**
 * @description used for editing an product detail from admin panel
 */

exports.editProduct = async function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var multiLanguageId = req.body.multiLanguageId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var priceUnit = req.body.priceUnit == undefined ? 1 : req.body.priceUnit;
    console.log("================price unit 1=====priceUnit=======", priceUnit)
    var description = req.body.description;
    var calories = req.body.calories ? req.body.calories : null;
    var measuringUnit = req.body.measuringUnit;
    var sku = req.body.sku;
    var barCode = req.body.barCode != undefined ? req.body.barCode : 0;
    var count = req.body.count;
    var imagePath = req.body.imagePath;
    var commissionType = req.body.commissionType;
    var commissionPackage = req.body.commissionPackage;
    var commission = parseFloat(req.body.commission);
    //console.log('ljkbfe',commission,req.body.commission);
    var manValues = [accessToken, sectionId, measuringUnit, productId, multiLanguageId, name, priceUnit, description, sku, count, languageId, commission, commissionPackage, commissionType];
    var folder = "abc";
    var imageName = [];
    var adminId;
    var names;
    var languages;
    var descriptions;
    var image = [];
    var imageOrder = req.body.imageOrder;
    var tax_exempt = req.body.tax_exempt != undefined ? req.body.tax_exempt : 0

    var pricing_type = req.body.pricing_type != undefined ? req.body.pricing_type : 0
    var duration = req.body.duration != undefined ? req.body.duration : 0
    imageOrder = imageOrder.split(',');
    var deleteOrder = req.body.deleteOrder;
    let payment_after_confirmation = req.body.payment_after_confirmation || 0
    let cart_image_upload = req.body.cart_image_upload || 0
    deleteOrder = deleteOrder.split(',');
    var quantity = req.body.quantity != undefined && req.body.quantity != "" ? req.body.quantity : 0;
    // var parent_id=req.body.parent_id!=undefined && req.body.parent_id!=""?req.body.parent_id:0
    var variant = req.body.variant != undefined && req.body.variant != "" ? JSON.parse(req.body.variant) : []
    var brand_id = req.body.brand_id != undefined && req.body.brand_id != "" && req.body.brand_id != null ? req.body.brand_id : 0
    var making_price = req.body.making_price != undefined && req.body.making_price !== "" ? req.body.making_price : 0;
    var product_tags = req.body.product_tags != undefined && req.body.product_tags !== "" ? req.body.product_tags : '';
    var is_product = (req.body.is_product == undefined || req.body.is_product == "" || req.body.is_product == null) ? 1 : req.body.is_product;
    var grade = req.body.grade != undefined && req.body.grade !== "" ? req.body.grade : '';
    var stock_number = req.body.stock_number != undefined && req.body.stock_number !== "" ? req.body.stock_number : '';

    console.log("===updateInertQuery==is_product", variant, is_product, req.body.is_product)
    let recipe_pdf = req.body.recipe_pdf == undefined && req.body.recipe_pdf == "" ? "" : req.body.recipe_pdf
    if (req.files.recipe_pdf) {
        recipe_pdf = await uploadMgr.uploadImageFileToS3BucketNew(req.files.recipe_pdf)

    }

    if (req.files.image) {
        image = req.files.image;
    }
    console.log(".....req......", req.body);
    let item_unavailable = req.body.item_unavailable == undefined ? 0 : req.body.item_unavailable
    let Size_chart_url = "";
    let country_of_origin = "";

    if (req.files && req.files.Size_chart_url) {
        Size_chart_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.Size_chart_url);
    } else if (req.body.Size_chart_url) {
        Size_chart_url = req.body.Size_chart_url || "";
    }

    if (req.body && req.body.country_of_origin) {
        country_of_origin = req.body.country_of_origin
    }
    let purchase_limit = req.body.purchase_limit !== undefined && req.body.purchase_limit !== null ? req.body.purchase_limit : ""
    let is_subscription_required = req.body.is_subscription_required !== undefined && req.body.is_subscription_required !== "" ? req.body.is_subscription_required : 0
    let allergy_description = req.body.allergy_description !== undefined && req.body.allergy_description !== "" ? req.body.allergy_description : ""
    let is_allergy_product = req.body.is_allergy_product !== undefined && req.body.is_allergy_product !== "" ? req.body.is_allergy_product : 0
    let is_appointment = req.body.is_appointment !== undefined && req.body.is_appointment !== "" ?
        req.body.is_appointment : 0
    let special_instructions = req.body.special_instructions !== undefined && req.body.special_instructions !== "" ? req.body.special_instructions : ""

    let is_non_veg = req.body.is_non_veg !== undefined && req.body.is_non_veg !== "" ? req.body.is_non_veg : 0

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            logger.debug("====payment after confimation =======", payment_after_confirmation)

            names = name.split("#");
            languages = languageId.split("#");
            descriptions = description.split("#");
            measuringUnit = measuringUnit.split("#");
            multiLanguageId = multiLanguageId.split("#");
            console.log("==========price unit==========+", priceUnit)
            // let payment_after_confirmation=req.body.payment_after_confirmation || 0
            // let cart_image_upload=req.body.cart_image_upload || 0
            products.updateProduct(req.dbName, res, productId, names[0], priceUnit, descriptions[0], sku, barCode, commission, commissionType,
                commissionPackage, measuringUnit[0], quantity, brand_id, making_price, product_tags, is_product, pricing_type, duration,
                payment_after_confirmation, cart_image_upload,
                Size_chart_url, country_of_origin, purchase_limit,
                is_subscription_required, allergy_description,
                is_allergy_product, is_appointment, special_instructions, 0, 0, calories, grade, stock_number, is_non_veg, tax_exempt, cb);

        },
        function (id, cb) {
            //  console.log("..111..",languages);
            //   console.log("..111..",names);
            //   console.log("..111..",descriptions);
            //   console.log("..111..",measuringUnit);
            //   console.log("..111..",multiLanguageId);
            products.updateProductNameInMultiLanguage(req.dbName, res, names, descriptions,
                languages, measuringUnit, multiLanguageId, 0, 0, 0, cb);
        },
        function (cb) {
            //console.log("..222..");

            if (count != 0) {
                for (var i = 0; i < count; i++) {
                    (function (i) {
                        async.parallel([
                            async function (cbs) {
                                let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                cbs(null, result);
                                // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                            }
                        ], function (err2, response2) {
                            console.log(".......image order...............", imageOrder[i]);
                            console.log("...................image:response2....................", response2);
                            imageName.push({ order: imageOrder[i], image: response2 });
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
        /*   function (cb) {
               if (imagePath != "") {
                   imagePath = imagePath.split("#");
                   for (var i = 0; i < imagePath.length; i++) {
                       (function (i) {
                           imageName.push(imagePath[i]);
                           if (i == imagePath.length - 1) {
                          //     console.log("==========imagename==czxc=========" + JSON.stringify(imageName));

                               cb(null);
                           }

                       }(i))

                   }
               }
               else {

                   cb(null);
               }
           },*/
        function (cb) {
            console.log("..333..", deleteOrder);
            if (deleteOrder && deleteOrder !== "" && deleteOrder.length > 0) {
                products.deleteProductImagesOrder(req.dbName, res, productId, deleteOrder, 0, cb);
            } else {
                cb(null)
            }
        },
        function (cb) {
            console.log("..444..");
            if (imageName.length > 0) {
                insertProductImages(req.dbName, res, imageName, productId, function (err, result) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null)
                    }
                });
            } else {
                cb(null);
            }
        },
        async function (cb) {
            if (variant && variant.length > 0) {
                let dSql = "delete from product_variants where product_id=?"
                await ExecuteQ.Query(req.dbName, dSql, [productId]);
                var updateInertQuery = ""
                async.every(variant, async function (i, callback) {

                    // if(i.id!=undefined && i.id!==""){
                    //     updateInertQuery="update product_variants set value='"+i+"' where id="+i.id+"";
                    // }
                    // else{
                    updateInertQuery = "insert into product_variants (`product_id`,`variant_id`,`parent_id`) values ('" + productId + "'," + i + ",'" + productId + "')";
                    // }
                    console.log("===updateInertQuery==", updateInertQuery)
                    await ExecuteQ.Query(req.dbName, updateInertQuery, [])
                    // multiConnection[req.dbName].query(updateInertQuery,function(err,data){
                    //    if(err){
                    //        callback(err)
                    //    }
                    //    else{
                    callback(null)
                    //        }
                    //    })

                }, function (err) {
                    console.log("===ERR!==", err);
                    cb(null)
                })
            }
            else {
                console.log("-in variants=-----")
                cb(null);
            }
        }
        /*    function (id, cb) {
                updateDefaultImage(req.dbName,res, id, cb);
            }*/
    ], async function (error, result) {
        console.log("0000-----------", error)
        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var data = {
                productId: req.body.productId
            }
            let result = await updatePdfBranchProduct(recipe_pdf, data.productId, req.dbName);

            console.log("=====data======", data, result)
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS,
                res, constant.responseStatus.SUCCESS);
        }
    }
    );

}


function updatePdfBranchProduct(recipe_pdf, product_id, dbName) {
    return new Promise(async (resolve, reject) => {
        let sql = "update supplier_branch_product set recipe_pdf=? where product_id=?"
        let params = [recipe_pdf, product_id]
        let result = await ExecuteQ.Query(dbName, sql, params);
        resolve(result);
    })
}



exports.deleteProduct = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var manValues = [accessToken, sectionId, productId];
    var product = productId.split("#").toString();
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            deleteProduct(req.dbName, res, product, cb);
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


exports.deleteSupplierProduct = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var productId = req.body.productId;
    var manValues = [accessToken, sectionId, productId, supplierId];
    var product = productId.split("#").toString();
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            deleteSupplierProduct(req.dbName, res, product, supplierId, cb);
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


exports.listSupplierCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var temp;
    var manValues = [accessToken, sectionId, supplierId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listSupplierCategories(req.dbName, res, supplierId, cb)
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

exports.listSupplierCategoriesForUser = function (req, res) {
    var supplierId = req.query.supplierId;
    let language_id = req.query.languageId !== undefined ? req.query.languageId : 14
    var manValues = [supplierId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            listSupplierCategoriesV1(req.dbName, res, supplierId, language_id, cb)
        }
    ], function (error, result) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 200);
        }
    }
    );

}

exports.listSupplierSubCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var categoryId = req.body.categoryId;
    var manValues = [accessToken, sectionId, supplierId, categoryId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listSupplierSubCategories(req.dbName, res, supplierId, categoryId, cb);
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
    var supplierId = req.body.supplierId;
    var subCategoryId = req.body.subCategoryId;
    var manValues = [accessToken, sectionId, supplierId, subCategoryId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listSupplierDetailedSubCategories(req.dbName, res, supplierId, subCategoryId, cb);
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


exports.listProducts = function (req, res) {
    var serachType = 0;
    var serachText = '';
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    if (req.body.serachType) {
        serachType = parseInt(req.body.serachType);
    }
    if (req.body.serachText) {
        serachText = req.body.serachText;
    }
    var limit = parseInt(req.body.limit);
    var offset = parseInt(req.body.offset);
    var manValues = [accessToken, sectionId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset];
    var adminId;
    console.log("...........", req.body);
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            console.log("....d......", serachType, serachText);
            var path = req.path;
            var getting_version = path.indexOf("v");
            var api_version = 0
            if (getting_version > 0) {
                var after_v = path.substr(path.indexOf("v") + 1);
                api_version = parseInt(after_v.substr(0, after_v.indexOf("/")));
                logger.debug("====API==VERSION==", api_version);
                if (api_version == 1) {
                    loginFunctions.listOfProductsv1(req.dbName, res, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, cb);
                }
                else {
                    loginFunctions.listOfProducts(req.dbName, res, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, cb);
                }
            }
            else {
                loginFunctions.listOfProducts(req.dbName, res, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, cb);
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


exports.assignProductToSupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var productId = req.body.productId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId != undefined && req.body.subCategoryId != "" ? req.body.subCategoryId : 0;
    var detailedSubCategoryId = req.body.detailedSubCategoryId != undefined && req.body.detailedSubCategoryId != "" ? req.body.detailedSubCategoryId : 0
    var manValues = [accessToken, sectionId, supplierId, productId, categoryId];
    var adminId;
    var newId;
    var oldId;
    var pricing_level;
    var category, subCategory, detailedSubCategory;
    var commission, commissionType;
    // console.log(",,,,,,,",req.body)
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            var sql = 'select pricing_level from supplier where id = ? and is_deleted = 0 '
            var stmt = multiConnection[req.dbName].query(sql, [supplierId], function (err, result) {
                logger.debug("===============select pricing level =============", stmt.sql)
                if (err) {
                    console.log("errrrr", err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    pricing_level = result[0].pricing_level;
                    //console.log("kbjsdf",pricing_level);
                    cb(null);
                }
            })
        },
        async function (cb) {


            // checkForProducts(req.dbName,res, supplierId,categoryId,subCategoryId,detailedSubCategoryId, productId,pricing_level, cb);
            var productData = await checkForProducts(req.dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, productId, pricing_level);
            logger.debug("===============prdouct data---==========-------======", productData)
            let ids = productData[0]
            let cat = productData[1]
            let subCat = productData[2]
            let detSubCat = productData[3]
            let commission1 = productData[4]
            let commissionType1 = productData[5]
            cb(null, ids, cat, subCat, detSubCat, commission1, commissionType1)
        },
        async function (ids, cat, subCat, detSubCat, commission1, commissionType1, cb) {
            //console.log("bhdk",ids,cat,subCat,detSubCat,commission1,commissionType1);
            ids = ids + '#';
            commission1 = commission1 + '#';
            commissionType1 = commissionType1 + '#';
            oldId = ids.split('#');
            category = cat;
            subCategory = subCat;
            detailedSubCategory = detSubCat;
            commission = commission1.split('#');
            commissionType = commissionType1.split('#')
            oldId.pop();
            commission.pop();
            commissionType.pop();
            if (oldId != "") {
                let insertIds = await getData(req.dbName, res, ids, commission, commissionType, pricing_level, cb);
                cb(null, insertIds)
            }
            else {
                cb(null, []);
            }
        },
        async function (ids, cb) {
            newId = ids;
            if (oldId != "") {
                //  console.log('ids',newId);
                await multilanguage(req.dbName, res, newId, oldId);
                cb(null, [])
            }
            else {
                cb(null, []);
            }

        },
        async function (ids, cb) {

            if (oldId != "") {
                //  console.log('ids',newId);
                await addVariants(req.dbName, res, newId, oldId, cb);
                cb(null)
            }
            else {
                cb(null);
            }
        },
        async function (cb) {
            //  console.log('callback1');
            if (oldId != "") {
                await productImage(req.dbName, res, newId, oldId, cb)
                cb(null)
            }
            else {
                cb(null);
            }
        },
        /* function(cb){
             if (oldId != "") {
                 productPricing(res,newId,oldId,cb);
             }
             else {
                 cb(null);
             }
         },*/
        async function (cb) {
            // console.log('callback2');
            if (oldId != "") {

                await assignProductToSupplier(req.dbName, res, supplierId, newId, oldId, category, subCategory, detailedSubCategory);
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


exports.addSupplierProduct = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId || 0;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var priceUnit = req.body.priceUnit;
    var description = req.body.description;
    var measuringUnit = req.body.measuringUnit;
    var sku = req.body.sku;
    var barCode = req.body.barCode;
    var count = req.body.count;
    var image = req.files.image;
    var commissionType = req.body.commissionType;
    var commissionPackage = req.body.commissionPackage;
    var commission = req.body.commission;
    var pricing_type = req.body.pricing_type;
    var manValues = [accessToken, sectionId, measuringUnit, supplierId, measuringUnit, categoryId, subCategoryId, detailedSubCategoryId, name, languageId, priceUnit, description, sku, count, commission, commissionPackage, commissionType, pricing_type];
    var folder = "abc";
    var names;
    var languages;
    var descriptions;
    var productId;
    var imageName = [];


    var quantity = req.body.quantity != undefined && req.body.quantity != "" ? req.body.quantity : 0
    var parent_id = req.body.parent_id != undefined && req.body.parent_id != "" ? req.body.parent_id : 0
    var brand_id = req.body.brand_id != undefined && req.body.brand_id != "" ? req.body.brand_id : 0
    var variant_id = req.body.variant_id != undefined && req.body.variant_id != "" ? req.body.variant_id : []
    var is_product = req.body.is_product != undefined && req.body.is_product !== "" ? req.body.is_product : 1
    var duration = req.body.duration != undefined && req.body.duration !== "" ? req.body.duration : 0
    var interval_flag = req.body.interval_flag != undefined && req.body.interval_flag !== "" ? req.body.interval_flag : 0;
    var interval_value = req.body.interval_value != undefined && req.body.interval_value !== "" ? req.body.interval_value : 0;
    var is_driver = req.body.is_driver != undefined && req.body.id_driver !== "" ? req.body.is_driver : 0;
    var making_price = req.body.making_price != undefined && req.body.making_price !== "" ? req.body.making_price : 0;
    var product_tags = req.body.product_tags != undefined && req.body.product_tags !== "" ? req.body.product_tags : '';
    var api_version = Universal.getVersioning(req.path);
    var product_variant_ids = [];
    var imageOrder = req.body.imageOrder;
    imageOrder = imageOrder.split(',');
    var urgent_type;
    var urgent_price;


    //console.log(req.body);
    async.waterfall([
        function (cb) {

            logger.debug("===========variant id==========", variant_id, variant_id.length)

            if (parent_id != 0) {
                if (variant_id && variant_id.length > 0) {
                    var sqlS = "select prv.product_id,prv.variant_id,count(prv.product_id) AS count  from product_variants prv where prv.variant_id IN (?) " +
                        " and prv.parent_id=? group by prv.product_id having count>=?"
                    var st = multiConnection[req.dbName].query(sqlS, [variant_id, parent_id, parseInt(variant_id.length)], function (err, variantDat) {
                        console.log("=============stmt-===21212=======", st.sqlS, variantDat)
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            if (variantDat && variantDat.length > 0) {
                                sendResponse.sendSuccessData({}, constant.ProductVariant.ALREADY_EXIST, res, constant.responseStatus.SOME_ERROR);
                            }
                            else {
                                cb(null)
                            }
                        }

                    })

                }
                else {
                    console.log("===PARAMS=MISSED=variant_id=", variant_id)
                    sendResponse.parameterMissingError(res);
                }
            }
            else {
                cb(null)
            }
        },
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            names = name.split("#");
            languages = languageId.split("#");
            descriptions = description.split("#");
            measuringUnit = measuringUnit.split("#");
            insertProductBySupplier(req.dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, names[0], priceUnit, descriptions[0], sku, barCode, commission, commissionType, commissionPackage, measuringUnit[0], pricing_type, quantity, parent_id, brand_id, is_product, duration, interval_flag, interval_value, api_version, is_driver, making_price, product_tags, cb);

        },
        function (id, cb) {
            productId = id;
            insertProductNameInMultiLanguage(req.dbName, res, productId, names, descriptions, languages, measuringUnit, cb);
        },
        function (cb) {
            logger.debug("============debug=============1=", parent_id)
            console.log("===variant_id==", variant_id)
            var parent_ids = parent_id == 0 ? productId : parent_id
            logger.debug("============debug=============2=", parent_ids)
            if (variant_id && variant_id.length > 0) {
                _.each(variant_id, function (i) {
                    product_variant_ids.push(
                        productId,
                        i,
                        parent_ids
                    )
                })
                logger.debug("============debug=============3=", product_variant_ids)
                final_value = chunk(product_variant_ids, 3);
                logger.debug("============debug=============4=", final_value)
                insertProductVarints(req.dbName, res, final_value, cb);
                logger.debug("============debug=============5=")
            }
            else {
                logger.debug("============debug=============6=")
                cb(null)
            }
        },
        function (cb) {
            if (parent_id != 0) {
                getProductImages(req.dbName, res, parent_id, cb)


            } else {
                logger.debug("============debug=============8=")
                cb(null, [])
            }
        },
        function (result, cb) {
            // function (cb) {
            if (parent_id != 0) {
                logger.debug("============debug=============9=", result)
                if (result && result.length) {
                    _.each(result, function (obj) {
                        logger.debug("============debug=============10=", result)
                        imageName.push(
                            {
                                image: obj.image_path, order: obj.imageOrder
                            }
                        )
                    })
                    if (count > 0) {
                        logger.debug("============debug=============11=", count)
                        for (var i = 0; i < count; i++) {
                            (function (i) {
                                logger.debug("============debug=============12=", count)
                                imageName = _.reject(imageName, function (obj) {

                                    return obj.order == imageOrder[i]

                                })

                                async.waterfall([
                                    async function (cbs) {
                                        // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                        let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                        cbs(null, result);
                                    }
                                ], function (err2, response2) {

                                    logger.debug("============debug=============13=", response2, imageName)
                                    imageName.push({ image: response2, order: imageOrder[i] });
                                    logger.debug("============debug=============14=", imageName)
                                    //console.log("==============response2===============" + response2);
                                    if (imageName.length >= count) {
                                        //console.log("==========imagename===========" + JSON.stringify(imageName));
                                        cb(null);
                                    }
                                })
                            }(i))
                        }
                    } else {
                        cb(null)
                    }
                } else {
                    if (count > 0) {
                        for (var i = 0; i < count; i++) {
                            (function (i) {
                                async.waterfall([
                                    async function (cbs) {
                                        // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                        let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                        cbs(null, result);
                                    }
                                ], function (err2, response2) {

                                    logger.debug("============debug=============15=", response2, imageName)
                                    imageName.push({ image: response2, order: imageOrder[i] });
                                    //console.log("==============response2===============" + response2);
                                    if (imageName.length >= count) {
                                        logger.debug("============debug=============16=", imageName)
                                        //console.log("==========imagename===========" + JSON.stringify(imageName));
                                        cb(null);
                                    }
                                })
                            }(i))
                        }
                    } else {
                        cb(null)
                    }
                }
            }
            else {
                if (count > 0) {
                    for (var i = 0; i < count; i++) {
                        (function (i) {
                            logger.debug("============debug=============17=", count, imageName)
                            async.waterfall([
                                async function (cbs) {
                                    let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                    cbs(null, result);
                                    // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                }
                            ], function (err2, response2) {

                                logger.debug("============debug=============18=", response2, imageName)
                                imageName.push({ image: response2, order: imageOrder[i] });
                                //console.log("==============response2===============" + response2);
                                if (imageName.length >= count) {
                                    logger.debug("============debug=============19=", count, imageName)
                                    //console.log("==========imagename===========" + JSON.stringify(imageName));
                                    cb(null);
                                }
                            })
                        }(i))
                    }
                } else {
                    cb(null)
                }
            }
        },
        function (cb) {
            logger.debug("============debug=============20=", imageName)

            insertProductImages(req.dbName, res, imageName, productId, cb);
        },
        /*   function (id, cb) {
               updateDefaultImage(req.dbName,res, id, cb);
           },*/
        async function (id, cb) {
            await assignProductToSupplier(req.dbName, res, supplierId, productId.toString(), [0], categoryId, subCategoryId.toString(), detailedSubCategoryId.toString())
            cb(null)
        },
        /*        function(cb){
                    var sql = " select urgent_type,urgent_price from supplier_category where supplier_id = ? ";
                    multiConnection[dbName].query(sql,[supplierId], function (err, result) {
                        if (err){
                            console.log("eeeeee",err);
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            urgent_type = result[0].urgent_type;
                            urgent_price = result[0].urgent_price;
                            callback(null);
                        }
                    })
        
                }*/
    ], function (error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var data = {
                productId: productId
            };
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    }
    );
}

function removeParentDiscount(dbName, product_id) {
    return new Promise(async (resolve, reject) => {
        let sql = "delete from product_pricing where product_id=? and price_type=?"
        await ExecuteQ.Query(dbName, sql, [product_id, 1]);
        resolve()
    })
}


exports.addSupplierBranchProduct = async function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId || 0;
    let payment_after_confirmation = req.body.payment_after_confirmation || 0
    let cart_image_upload = req.body.cart_image_upload || 0
    var name = req.body.name;
    var languageId = req.body.languageId;
    var priceUnit = req.body.priceUnit;
    var description = req.body.description;
    var calories = req.body.calories ? req.body.calories : null;
    var measuringUnit = req.body.measuringUnit;
    var sku = req.body.sku;
    var barCode = req.body.barCode;
    var count = req.body.count;
    var image = req.files.image;

    var commission = req.body.commission;
    var commissionType = req.body.commissionType;
    var commissionPackage = req.body.commissionPackage;
    var pricing_type = req.body.pricing_type;
    var quantity = req.body.quantity != undefined && req.body.quantity != "" ? req.body.quantity : 0
    var parent_id = req.body.parent_id != undefined && req.body.parent_id != "" ? req.body.parent_id : 0
    var brand_id = req.body.brand_id != undefined && req.body.brand_id != "" ? req.body.brand_id : 0
    var variant_id = req.body.variant_id != undefined && req.body.variant_id !== "" ? req.body.variant_id : []
    var is_product = req.body.is_product != undefined && req.body.is_product !== "" ? req.body.is_product : 1
    var duration = req.body.duration != undefined && req.body.duration !== "" ? req.body.duration : 0;
    var interval_flag = req.body.interval_flag != undefined && req.body.interval_flag !== "" ? req.body.interval_flag : 0;
    var interval_value = req.body.interval_value != undefined && req.body.interval_value !== "" ? req.body.interval_value : 0;
    var making_price = req.body.making_price != undefined && req.body.making_price !== "" ? req.body.making_price : 0;
    var product_tags = req.body.product_tags != undefined && req.body.product_tags !== "" ? req.body.product_tags : '';
    var is_driver = req.body.is_driver != undefined && req.body.is_driver !== "" ? req.body.is_driver : 0;
    let is_prescribed = req.body.is_prescribed != undefined && req.body.is_prescribed !== "" ? req.body.is_prescribed : 0;
    let purchase_limit = req.body.purchase_limit !== undefined && req.body.purchase_limit !== "" ? req.body.purchase_limit : ""
    let is_subscription_required = req.body.is_subscription_required !== undefined && req.body.is_subscription_required !== "" ? req.body.is_subscription_required : 0

    let allergy_description = req.body.allergy_description !== undefined && req.body.allergy_description !== "" ? req.body.allergy_description : ""
    let is_allergy_product = req.body.is_allergy_product !== undefined && req.body.is_allergy_product !== "" ? req.body.is_allergy_product : 0
    let is_non_veg = req.body.is_non_veg !== undefined && req.body.is_non_veg !== "" ? req.body.is_non_veg : 0
    let is_appointment = req.body.is_appointment !== undefined && req.body.is_appointment !== "" ?
        req.body.is_appointment : 0

    let special_instructions = req.body.special_instructions != undefined && req.body.special_instructions !== "" ? req.body.special_instructions : "";

    var api_version = Universal.getVersioning(req.path);
    var product_variant_ids = [];
    let stock_number = req.body.stock_number;
    let grade = req.body.grade;
    let tax_exempt = req.body.tax_exempt != undefined && req.body.tax_exempt != "" ? req.body.tax_exempt : 0





    logger.debug("==api_version=quantity=parent_id=variant_id==", api_version, quantity, parent_id, variant_id, product_variant_ids);


    var manValues = [accessToken,
        sectionId, measuringUnit,
        branchId, categoryId, subCategoryId,
        detailedSubCategoryId, name, languageId];
    logger.debug("=quantity=parent_id=variant_id==", quantity, parent_id, variant_id, product_variant_ids, manValues)
    var folder = "abc";
    var names;
    var languages;
    var descriptions;
    var productId;
    var imageName = [];
    var imageOrder = req.body.imageOrder;
    imageOrder = imageOrder.split(',');
    let recipe_pdf = req.files.recipe_pdf

    let customTabDescription1 = req.body.customTabDescription1 ? req.body.customTabDescription1 : null;
    let customTabDescription2 = req.body.customTabDescription2 ? req.body.customTabDescription2 : null;

    let item_unavailable = req.body.item_unavailable == undefined ? 0 : req.body.item_unavailable

    let Size_chart_url = ""
    logger.debug("============fiel=======files========", req.files, req.files.Size_chart_url)
    if (req.files && req.files.Size_chart_url) {
        Size_chart_url = await uploadMgr.uploadImageFileToS3BucketNew(req.files.Size_chart_url);

    }
    let country_of_origin = req.body.country_of_origin || ""
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        async function (cb) {

            if (parent_id != 0) {
                await removeParentDiscount(req.dbName, parent_id);
                if (variant_id && variant_id.length > 0) {
                    var sqlS = "select prv.product_id,prv.variant_id,count(prv.product_id) AS count  from product_variants prv where prv.variant_id IN (?) " +
                        " and prv.parent_id!=prv.product_id and prv.parent_id=" + parent_id + " group by prv.product_id having count>=?"
                    let variantDat = await ExecuteQ.Query(req.dbName, sqlS, [variant_id, parseInt(variant_id.length)])
                    var st = multiConnection[req.dbName].query(sqlS, [variant_id, parseInt(variant_id.length)], function (err, variantDat) {
                        console.log(err);
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            if (variantDat && variantDat.length > 0) {
                                sendResponse.sendSuccessData({}, constant.ProductVariant.ALREADY_EXIST, res, constant.responseStatus.SOME_ERROR);
                            }
                            else {
                                cb(null)
                            }
                        }

                    })

                }
                else {
                    console.log("===PARAMS=MISSED=variant_id=", variant_id)
                    sendResponse.parameterMissingError(res);
                }
            }
            else {
                cb(null)
            }
        },
        function (cb) {

            names = name.split("#");
            languages = languageId.split("#");
            descriptions = description.split("#");

            measuringUnit = measuringUnit.split("#");
            //             let payment_after_confirmation=req.body.payment_after_confirmation || 0
            // let cart_image_upload=req.body.cart_image_upload || 0
            insertProductBySupplierBranch(req.dbName, is_prescribed, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, names[0], priceUnit, descriptions[0], sku, barCode,
                commission, commissionType, commissionPackage, measuringUnit[0], pricing_type,
                quantity, parent_id, brand_id, is_product, duration, interval_flag, interval_value, making_price, product_tags, api_version,
                is_driver, payment_after_confirmation, cart_image_upload,
                item_unavailable, Size_chart_url, country_of_origin, purchase_limit,
                is_subscription_required, allergy_description,
                is_allergy_product, is_non_veg, is_appointment, special_instructions, calories, tax_exempt, cb);

        },
        function (id, cb) {
            productId = id;
            insertProductNameInMultiLanguage(req.dbName, res, productId, names, descriptions, languages, measuringUnit, cb);

        },
        async function (cb) {


            //add grade and stock_number of part

            const stockNumberSettingKeys = await func.getSettingDataKeyAndValuev1(req.dbName, ['enable_stock_number']);
            stockNumberSettingKeys.keyAndValue.enable_stock_number = !!stockNumberSettingKeys.keyAndValue.enable_stock_number;
            if (stockNumberSettingKeys.keyAndValue.enable_stock_number === true) {
                let sql = "UPDATE product SET stock_number=? WHERE id=?";
                let params = [stock_number, productId];
                await ExecuteQ.Query(req.dbName, sql, params);
            }

            const gradeSettingKeys = await func.getSettingDataKeyAndValuev2(req.dbName, ['enable_grading']);
            gradeSettingKeys.keyAndValue.enable_grading = !!gradeSettingKeys.keyAndValue.enable_grading;
            if (gradeSettingKeys.keyAndValue.enable_grading === true) {
                let sql = "UPDATE product SET grade=? WHERE id=?";
                let params = [grade, productId];
                await ExecuteQ.Query(req.dbName, sql, params);
            }





            //================
            // Adding productCustomTabDescriptionLabel per supplier
            const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['isProductCustomTabDescriptionEnable']);
            settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable = !!settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable;
            if (settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable === true) {
                let sql = "UPDATE product SET customTabDescription1 =?,customTabDescription2=? WHERE id = ?;";
                let params = [customTabDescription1, customTabDescription2, productId];
                await ExecuteQ.Query(req.dbName, sql, params);
            }

            //========

            console.log("===variant_id==", variant_id)
            var parent_ids = parent_id == 0 ? productId : parent_id

            if (variant_id && variant_id.length > 0) {
                _.each(variant_id, function (i) {
                    product_variant_ids.push(
                        productId,
                        i,
                        parent_ids
                    )
                })
                final_value = chunk(product_variant_ids, 3);
                insertProductVarints(req.dbName, res, final_value, cb);
            }
            else {
                cb(null)
            }
        },
        function (cb) {
            if (parent_id != 0) {
                getProductImages(req.dbName, res, parent_id, cb)


            } else {
                logger.debug("============debug=============8=")
                cb(null, [])
            }
        },
        function (result, cb) {
            // function (cb) {
            if (parent_id != 0) {
                logger.debug("============debug=============9=", result)
                if (result && result.length) {
                    _.each(result, function (obj) {
                        logger.debug("============debug=============10=", result)
                        imageName.push(
                            {
                                image: obj.image_path, order: obj.imageOrder
                            }
                        )
                    })
                    if (count > 0) {
                        logger.debug("============debug=============11=", count)
                        for (var i = 0; i < count; i++) {
                            (function (i) {
                                logger.debug("============debug=============12=", count)
                                imageName = _.reject(imageName, function (obj) {

                                    return obj.order == imageOrder[i]

                                })

                                async.waterfall([
                                    async function (cbs) {
                                        let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                        // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                        cbs(null, result);
                                    }
                                ], function (err2, response2) {

                                    logger.debug("============debug=============13=", response2, imageName)
                                    imageName.push({ image: response2, order: imageOrder[i] });
                                    logger.debug("============debug=============14=", imageName)
                                    //console.log("==============response2===============" + response2);
                                    if (imageName.length >= count) {
                                        //console.log("==========imagename===========" + JSON.stringify(imageName));
                                        cb(null);
                                    }
                                })
                            }(i))
                        }
                    } else {
                        // imageName.push({image:config.get("defaultLogo"),order:1});
                        cb(null)
                    }
                } else {
                    if (count > 0) {
                        for (var i = 0; i < count; i++) {
                            (function (i) {
                                async.waterfall([
                                    async function (cbs) {
                                        let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                        // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                        cbs(null, result);
                                    }
                                ], function (err2, response2) {

                                    logger.debug("============debug=============15=", response2, imageName)
                                    imageName.push({ image: response2, order: imageOrder[i] });
                                    //console.log("==============response2===============" + response2);
                                    if (imageName.length >= count) {
                                        logger.debug("============debug=============16=", imageName)
                                        //console.log("==========imagename===========" + JSON.stringify(imageName));
                                        cb(null);
                                    }
                                })
                            }(i))
                        }
                    } else {
                        imageName.push({ image: config.get("defaultLogo"), order: 1 });
                        cb(null)
                    }
                }
            }
            else {
                if (count > 0) {
                    for (var i = 0; i < count; i++) {
                        (function (i) {
                            logger.debug("============debug=============17=", count, imageName)
                            async.waterfall([
                                async function (cbs) {
                                    let result = await uploadMgr.uploadImageFileToS3BucketNew(image[i]);
                                    // func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                                    cbs(null, result);
                                }
                            ], function (err2, response2) {

                                logger.debug("============debug=============18=", response2, imageName)
                                imageName.push({ image: response2, order: imageOrder[i] });
                                //console.log("==============response2===============" + response2);
                                if (imageName.length >= count) {
                                    logger.debug("============debug=============19=", count, imageName)
                                    //console.log("==========imagename===========" + JSON.stringify(imageName));
                                    cb(null);
                                }
                            })
                        }(i))
                    }
                } else {
                    imageName.push({ image: config.get("defaultLogo"), order: 1 });
                    cb(null)
                }
            }
        },
        function (cb) {
            // console.log("===insertProductImages==")
            insertProductImages(req.dbName, res, imageName, productId, cb);
        },
        function (id, cb) {
            // console.log("===updateDefaultImage==",id)
            updateDefaultImage(req.dbName, res, id, cb);
        },
        async function (cb) {
            // console.log("===assignProductToSupplierBranch==")

            if (recipe_pdf != undefined) {
                recipe_pdf = await uploadMgr.uploadImageFileToS3BucketNew(recipe_pdf);
            } else {
                recipe_pdf = ""
            }
            await assignProductToSupplierBranch(req.dbName, res, branchId, productId.toString(), [0], categoryId.toString(), subCategoryId.toString(), detailedSubCategoryId.toString(), recipe_pdf, cb);
            cb(null)
        }
    ], function (error, result) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {
                productId: productId
            };
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    }
    );
}
exports.orderBySupplierBranchProduct = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = (req.body.subCategoryId) ? req.body.subCategoryId : categoryId;
    var detailedSubCategoryId = (req.body.detailedSubCategoryId) ? req.body.detailedSubCategoryId : subCategoryId;
    var prdouctOrder = req.body.productOrder;
    var api_version = Universal.getVersioning(req.path);

    var manValues = [accessToken, sectionId, branchId, categoryId, subCategoryId];

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            for (var i = 0; i < prdouctOrder.length; i++) {
                (function (i) {
                    let item = prdouctOrder[i];
                    var sql = `update supplier_branch_product 
                        set order_no=${item.order_no} 
                        where supplier_branch_id=${branchId} and category_id=${categoryId} and sub_category_id=${subCategoryId} and product_id= ${item.product_id}`;
                    multiConnection[req.dbName].query(sql, async function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            if (i == prdouctOrder.length - 1) {
                                cb(null);
                            }
                        }
                    });
                }(i))
            }
        }
    ], function (error, result) {
        if (error) {
            console.log(error);
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    }
    );
}

exports.listProductDetailsOfSupplier = function (req, res) {
    var serachType = 0;
    var serachText = '';
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    if (req.body.serachType) {
        serachType = parseInt(req.body.serachType);
    }
    if (req.body.serachText) {
        serachText = req.body.serachText;
    }
    var manValues = [accessToken, sectionId, supplierId, categoryId, subCategoryId, detailedSubCategoryId];
    var adminId;
    var length;
    var limit = 0;
    var offset = 10000;
    var api_version = Universal.getVersioning(req.path)
    var temp_product;
    var data = {};
    limit = parseInt(req.body.limit);
    offset = parseInt(req.body.offset);



    data.product_count = 0;
    data.products = []
    console.log("rerrr", req.body);

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {


            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            logger.debug("=======API-VERSION==", api_version);
            if (api_version >= 1) {
                listSupplierProductsV1(req.dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, cb);
            }
            else {
                listSupplierProducts(req.dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, cb);
            }
            // }
            // else{
            //     listSupplierProducts(req.dbName,res, supplierId, categoryId, subCategoryId, detailedSubCategoryId,limit,offset,serachType,serachText,cb );
            // }

            /*  loginFunctions.listOfProducts(res, categoryId, subCategoryId, detailedSubCategoryId,limit,offset,cb);*/

            // console.log("=------------",products)

        },

        function (products, cb) {
            console.log("-----heetttttt---==================", products)
            if (api_version >= 1) {
                if (serachType == 0) {
                    var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,p.interval_flag,p.interval_value, p.making_price,product_tags,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.purchased_quantity,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name,c.is_barcode from supplier_product sp ";
                    sql += " join product p  on sp.product_id = p.id left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr ";
                    sql += " on curr.id = p.price_unit join product_ml pml on p.id = pml.product_id where sp.supplier_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and sp.product_id !=0 group by p.id";
                }
                else {
                    var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,p.interval_flag,p.interval_value, p.making_price,product_tags,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.purchased_quantity,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name,c.is_barcode from supplier_product sp ";
                    sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr ";
                    sql += " on curr.id = p.price_unit join product_ml pml on p.id = pml.product_id where sp.supplier_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and sp.product_id !=0 " +
                        "and (p.id LIKE '%" + serachText + "%' or p.bar_code LIKE '%" + serachText + "%' " +
                        " or p.sku LIKE '%" + serachText + "%' or p.name LIKE '%" + serachText + "%') group by p.id"
                }
            }
            else {
                if (serachType == 0) {
                    var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.purchased_quantity,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name,c.is_barcode from supplier_product sp ";
                    sql += " join product p  on sp.product_id = p.id left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr ";
                    sql += " on curr.id = p.price_unit join product_ml pml on p.id = pml.product_id where sp.supplier_id = ? and p.parent_id=0 and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and sp.product_id !=0 group by p.id";
                }
                else {
                    var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.purchased_quantity,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name,c.is_barcode from supplier_product sp ";
                    sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr ";
                    sql += " on curr.id = p.price_unit join product_ml pml on p.id = pml.product_id where sp.supplier_id = ? and p.parent_id=0 and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and sp.product_id !=0 " +
                        "and (p.id LIKE '%" + serachText + "%' or p.bar_code LIKE '%" + serachText + "%' " +
                        " or p.sku LIKE '%" + serachText + "%' or p.name LIKE '%" + serachText + "%') group by p.id"
                }
            }
            multiConnection[req.dbName].query(sql, [supplierId, 0, categoryId, subCategoryId, detailedSubCategoryId], function (err, products) {
                //   console.log("............err.........11111..........product..............",err,products);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    temp_product = products;
                    data.product_count = products.length
                    cb(null);
                }
            })
        },
        function (cb) {
            var len = temp_product.length;
            if (len == 0) {
                cb(null);
            }
            for (var i = 0; i < len; i++) {
                (function (i) {
                    var sql = " select id as product_multi_id,name,product_desc,measuring_unit,language_id  from product_ml where product_id =  ? order by language_id "
                    multiConnection[req.dbName].query(sql, [temp_product[i].id], function (err, products) {
                        // console.log("...........................err.................",err,products);

                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            temp_product[i].names = products;


                            if (i == (len - 1)) {
                                data.products = temp_product
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        },
        function (cb) {
            var len = data.products.length;
            var temp = data.products;

            if (len == 0) {
                cb(null);
            }

            for (var i = 0; i < len; i++) {
                (function (i) {
                    var sql = "select product_id,image_path,imageOrder from product_image where product_id = ? "
                    multiConnection[req.dbName].query(sql, [data.products[i].id], function (err, products) {
                        //  console.log("...........................err.................",err,products);
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            data.products[i].images = products;
                            if (i == (len - 1)) {
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        },
        function (cb) {
            var len = data.products.length;
            var temp = data.products;

            if (data.products.length) {
                // var len = productIds.length;
                for (var i = 0; i < len; i++) {
                    (function (i) {

                        var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
                        multiConnection[req.dbName].query(vsql, [data.products[i].id], function (err, vData) {
                            data.products[i].variant = vData;
                            // productIds[i].variant = vData;
                            if (i == (len - 1)) {
                                cb(null)
                            }
                        })

                    }(i));
                }
            } else {
                cb(null)
            }
        },
        async function (cb) {
            if (data.products.length) {
                var len = parseInt(data.products.length);
                logger.debug("=======Prduct Length=====", len);
                for (const [index, i] of data.products.entries()) {
                    logger.debug("==Index==", index)
                    i.price = await getPrice(req.dbName, i.id)
                    if (index == len - 1) {
                        cb(null)
                    }
                }

                // for(var i =0;i < len;i++){
                //     (function(i){
                //         var sql = "SELECT p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
                //             sql += " ,p.price_type,";
                //             sql += " p.delivery_charges from product_pricing p join supplier_product s on p.product_id = s.product_id where ";
                //             sql += " p.is_deleted = ? and p.product_id = ? " +
                //                 " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
                //                 console.log("===========price id sql ========>>>>>>>>",sql)
                //         let stmt = multiConnection[req.dbName].query(sql, [0,data.products[i].id],function(err,priceData) {
                //             console.log("===========price id sql =====2====",stmt.sql)
                //             data.products[i].price = priceData;
                //             logger.debug("+=========product pricing 11-------============",data.products[i].price);
                //             if(i == (len -1)){
                //                 cb(null)
                //             }

                //         })
                // }(i));
            }
            else {
                cb(null)
            }
        }
    ], function (error, result) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            logger.debug("==Product=Data!===>>>", data)
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    }
    );
}

const getPrice = (dbName, id) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
        sql += " ,p.price_type,";
        sql += " p.delivery_charges from product_pricing p join supplier_product s on p.product_id = s.product_id where ";
        sql += " p.is_deleted = ? and p.product_id = ? " +
            " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
        let stmt = multiConnection[dbName].query(sql, [0, id], function (err, priceData) {
            logger.debug("=========Err!==", err)
            resolve(priceData)
        })

    })
}

exports.listProductsSortedByCategoryOfSupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var limit = 0;
    var offset = 0;


    if (req.body.limit) {
        limit = req.body.limit
    }

    if (req.body.offset) {
        offset = req.body.offset
    }


    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, supplierId, categoryId, subCategoryId, detailedSubCategoryId];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {

            loginFunctions.listOfProducts(req.dbName, res, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, 0, '', cb);

            //listOfProductsCategoryWise(res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, cb);
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

    if (req.body.serachType) {
        serachType = parseInt(req.body.serachType);
    }
    if (req.body.serachText) {
        serachText = req.body.serachText;
    }
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, branchId, categoryId, subCategoryId, detailedSubCategoryId];
    var adminId;
    var limit = 0;
    var offset = 0;
    if (req.body.limit) {
        limit = (parseInt(req.body.limit));
    }
    if (req.body.offset) {
        offset = parseInt(req.body.offset)
    }
    var data = {};
    var tags = req.body.tagText ? req.body.tagText : "";
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            var path = req.path;
            var getting_version = path.indexOf("v");
            var api_version = 0
            if (getting_version > 0) {
                var after_v = path.substr(path.indexOf("v") + 1);
                api_version = parseInt(after_v.substr(0, after_v.indexOf("/")));
                if (api_version >= 1) {
                    products.listSupplierBranchProductsV1(req.dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, tags, cb);
                }
                else {
                    products.listSupplierBranchProducts(req.dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, cb);
                }
            }
            else {
                products.listSupplierBranchProducts(req.dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, cb);
            }
        },
        function (product, cb) {
            if (product && product.length) {
                var len = product.length;
                for (var i = 0; i < len; i++) {
                    (async function (i) {
                        let actualPriceQuery = "";
                        let query = "SELECT *  FROM `tbl_setting` WHERE `key` = 'enable_actual_price' AND `value` = '1'"
                        let enableActualPrice = await ExecuteQ.Query(req.dbName, query)
                        if (enableActualPrice && enableActualPrice.length > 0) {
                            actualPriceQuery = "p.actual_price,"
                        }
                        var sql = "SELECT p.tax_type,p.tax_value,p.user_type_id," + actualPriceQuery + "p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
                        sql += " ,p.price_type,";
                        sql += " p.delivery_charges from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
                        sql += " p.is_deleted = ? and p.product_id = ? " +
                            " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
                        let priceData = await ExecuteQ.Query(req.dbName, sql, [0, product[i].id])
                        //   let stmt =  multiConnection[req.dbName].query(sql, [0,product[i].id],function(err,priceData) {
                        //       logger.debug("===========stmt.sql of price====",stmt.sql)
                        product[i].price = priceData;
                        if (i == (len - 1)) {
                            cb(null, product)
                        }
                        // })

                    }(i));
                }
            }
            else {
                cb(null, product)
            }
        },
        // async function(product,cb){
        //     if(product.length){
        //         var len = product.length;
        //         let productIds = [];
        //         for(var i =0;i < len;i++){
        //             productIds.push(product[i].id);
        //             product[i].price = [];
        //         }

        //         var sql = "SELECT p.user_type_id,p.id, p.product_id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
        //         sql += " ,p.price_type,";
        //         sql += " p.delivery_charges from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
        //         sql += " p.is_deleted = ? and p.product_id IN (?) " +
        //             " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
        //     let priceData=await ExecuteQ.Query(req.dbName,sql,[0,productIds])
        //     if (priceData && priceData.length) {
        //         for (const [index, i] of priceData.entries()) {
        //             for(var j =0;j < len;j++){
        //                 if (i.product_id == product[j].id) {
        //                     product[j].price = i;
        //                 }
        //             }
        //         }
        //     }

        //     cb(null,product)
        // } else{
        //         cb(null,product)
        //     }
        // },
        async function (product, cb) {
            try {
                if (serachType == 0) {
                    var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,p.interval_flag,p.interval_value,p.quantity,p.purchased_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.name,p.calories,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
                    sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id and br.deleted_by= 0 join categories c on c.id = p.category_id join currency_conversion curr ";
                    sql += " on curr.id = p.price_unit where p.parent_id=? and sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ?  and sp.detailed_sub_category_id = ?";

                } else {
                    var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,p.interval_flag,p.interval_value,p.quantity,p.purchased_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.name,p.calories,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
                    sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id and br.deleted_by= 0 join categories c on c.id = p.category_id join currency_conversion curr ";
                    sql += " on curr.id = p.price_unit where p.parent_id=? and sp.supplier_branch_id = ? and sp.is_deleted = ?  and sp.category_id = ? and sp.detailed_sub_category_id = ? " +
                        "and (p.id LIKE '%" + serachText + "%' or p.bar_code LIKE '%" + serachText + "%' or p.name LIKE '%" + serachText + "%'" +
                        " or p.sku LIKE '%" + serachText + "%' or p.product_desc LIKE '%" + serachText + "%' or c.name LIKE '%" + serachText + "%'  or c.name LIKE '%" + serachText + "%') ";

                }
                console.log("sql======", sql)
                let products = await ExecuteQ.Query(req.dbName, sql, [0, branchId, 0, categoryId, detailedSubCategoryId]);
                //    var st= multiConnection[req.dbName].query(sql, [0,branchId,0,categoryId,subCategoryId,detailedSubCategoryId], function (err, products) {
                //     console.log(st.sql);    
                //     if (err) {
                //             console.log("err1.....",err);
                //             sendResponse.somethingWentWrongError(res);
                //         }
                //         else {
                data.products = product;
                data.product_count = products.length;
                cb(null);
                //     }

                // })
            }
            catch (Err) {
                sendResponse.somethingWentWrongError(res);
            }
        }
    ], async function (error, result) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    }
    );
}

/**
 * @description used for assign product to branch of supplier from admin
 */
exports.assignProductToSupplierBranch = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var productId = req.body.productId;
    var pricing_level;
    var manValues = [accessToken, sectionId, supplierId, branchId, productId, categoryId, subCategoryId, detailedSubCategoryId];
    var adminId;
    var productIds;
    var newId;
    var oldId;
    var category, subCategory, detailedSubCategory;
    var commission, commissionType;
    console.log("===InputParams==>>", req.body);


    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        async function (cb) {
            try {
                var sql = 'select pricing_level from supplier where id = ? and is_deleted = 0 '
                let result = await ExecuteQ.Query(req.dbName, sql, [supplierId])
                pricing_level = result && result.length > 0 ? result[0].pricing_level : 0
                console.log("kbjsdf", pricing_level);
                cb(null);
            }
            catch (Err) {
                logger.debug("===Err!==", Err);
                sendResponse.somethingWentWrongError(res);
            }
            // var sql = 'select pricing_level from supplier where id = ? and is_deleted = 0 '
            // multiConnection[req.dbName].query(sql, [supplierId], function (err, result) {
            //     if (err) {
            //         console.log("errrrr", err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
            //         pricing_level = result[0].pricing_level;
            //           console.log("kbjsdf",pricing_level);
            //         cb(null);
            //     }
            // })
        },
        async function (cb) {
            let productData = await checkForProductsForBranch(req.dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, productId, pricing_level, supplierId);
            logger.debug("===============prdouct data---==========-------======", productData)
            let ids = productData[0]
            let cat = productData[1]
            let subCat = productData[2]
            let detSubCat = productData[3]
            let commission1 = productData[4]
            let commissionType1 = productData[5]
            cb(null, ids, cat, subCat, detSubCat, commission1, commissionType1)
        },
        async function (ids, cat, subCat, detSubCat, commission1, commissionType1, cb) {
            console.log("bhdk", ids, cat, subCat, detSubCat, commission1, commissionType1);
            ids = ids + '#';
            oldId = (ids).split('#');
            oldId.pop();
            category = cat;
            subCategory = subCat;
            detailedSubCategory = detSubCat;
            commission = (commission1 + '#').split('#');
            commission.pop();
            commissionType = (commissionType1 + '#').split('#');
            commissionType.pop();
            console.log("..................*****************.**afetreqwrfesf******................", oldId);




            // console.log("bhdkwww8w",commissionType,commission,oldId);
            if (oldId.length) {

                console.log("..................*****************.********................", ids);

                let insertIds = await getData(req.dbName, res, ids, commission, commissionType, pricing_level, cb);
                cb(null, insertIds)
            }
            else {
                cb(null, []);
            }
        },
        async function (ids, cb) {
            newId = ids;
            console.log("idss", newId);
            if (oldId != "") {
                console.log('ids', newId);
                await multilanguage(req.dbName, res, ids, oldId);
                await Universal.copyAddsOnExistingPoduct(req.dbName, oldId, ids);
                cb(null, []);
            }
            else {
                cb(null, []);
            }

        },
        async function (ids, cb) {

            if (oldId != "") {
                //  console.log('ids',newId);
                await addVariants(req.dbName, res, newId, oldId, cb);
                cb(null)
            }
            else {
                cb(null);
            }
        },
        async function (cb) {
            if (oldId != "") {
                await productImage(req.dbName, res, newId, oldId, cb)
                cb(null)
            }
            else {
                cb(null);
            }
        },
        async function (cb) {
            if (oldId != "") {

                await productPricing(req.dbName, res, newId, oldId, cb);
                cb(null)
            }
            else {
                cb(null);
            }
        },
        async function (cb) {

            if (oldId != "") {
                await assignProductToSupplierBranch(req.dbName, res, branchId, newId, oldId, category, subCategory, detailedSubCategory, "", cb);
                cb(null)
            }
            else {
                cb(null);
            }
        }],
        // function (cb) {
        //     if (newId != "") {
        //         updateAreaWiseDeliveryCharges(res, newId, supplierId, branchId, cb);
        //     }
        //     else {
        //         cb(null);
        //     }
        // }]
        function (error, result) {
            if (error) {
                console.log(":============:err=============", error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}
/**
 * @description used for deletion an production from branch by admin
 */
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
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            deleteSupplierProductOfBranch(req.dbName, res, product, branchId, cb);
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

/**
 * @description used for adding an pricing of product by admin
 */
exports.addPricingOfProductByAdmin = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
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
    console.log("===========req.body.deliveryCharges===========", req.body.deliveryCharges)
    var minOrder = req.body.minOrder;
    var chargesBelowMinOrder = req.body.chargesBelowMinOrder;
    var areaId = req.body.areaId;
    var offerType = req.body.offerType;
    var type = req.body.type; // 0-- admin, 1 -- supplier, 2 -- supplier branch
    var id = req.body.id; // supplier id or supplier branch id
    var pricing_type = req.body.pricing_type;
    var discountPrice = req.body.discountPrice;
    var discountStartDate = req.body.discountStartDate
    var discountEndDate = req.body.discountEndDate;
    var houseCleaningPrice = req.body.houseCleaningPrice;
    var beautySaloonPrice = req.body.beautySaloonPrice;
    let tax_type = req.body.tax_type || 0;
    let tax_value = req.body.tax_value || 0;
    console.log("opeee", typeof (price))
    // console.log("opeee",stringyfy(price))
    var manValues = [];
    var manValues = [accessToken, sectionId, productId, startDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, pricing_type];
    let service_type = req.service_type
    var adminId;
    var actualPrice = 0;
    let actualProductPrice = "";
    if (req.body.actualProductPrice && req.body.actualProductPrice != undefined && req.body.actualProductPrice != null) {
        actualProductPrice = req.body.actualProductPrice;
        displayPrice = price;
    }
    console.log(consts.LOCATION_FLOW.flow ,":kbjsdfuvjfd>>>>>>>>>>>>>>>", req.body);
    if (consts.LOCATION_FLOW.flow == 0) {
        location_area_wise(res, req.dbName, accessToken, sectionId, productId, startDate, endDate, price, displayPrice, handlingFeeAdmin,
            handlingFeeSupplier, isUrgent, urgentPrice, urgentType, deliveryCharges, minOrder, chargesBelowMinOrder, areaId,
            offerType, type, id, pricing_type, manValues, adminId, actualPrice, tax_type, tax_value, actualProductPrice, function (err, data) {
                if (err) {
                    console.log(":err>>>>>>>>>>>>>>>", err);
                    sendResponse.somethingWentWrongError(res);
                } else {
                    var data = []
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                }
            }
        )
    } else {
        manValues = [accessToken, sectionId, productId, startDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, urgentType, offerType, type, id, displayPrice, pricing_type];
        location_lat_long_wise(service_type,
            res,
            req.dbName, accessToken, sectionId, productId, startDate, endDate, price, displayPrice, handlingFeeAdmin,
            handlingFeeSupplier, isUrgent, urgentPrice, urgentType, deliveryCharges, minOrder, chargesBelowMinOrder,
            offerType, type, id, pricing_type, manValues, adminId, actualPrice, discountPrice, discountStartDate, discountEndDate, houseCleaningPrice, beautySaloonPrice,
            tax_type, tax_value, actualProductPrice, function (err, data) {
                if (err) {
                    console.log("==============EROOR=======", err)
                    sendResponse.somethingWentWrongError(res);
                } else {
                    console.log("==============Success=======")
                    var data = []
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                }
            }
        )

    }
    // var data = []
    // sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
}

var location_area_wise = function (
    res, dbName,
    accessToken, sectionId, productId, startDate, endDate, price, displayPrice, handlingFeeAdmin,
    handlingFeeSupplier, isUrgent, urgentPrice, urgentType, deliveryCharges, minOrder, chargesBelowMinOrder, areaId,
    offerType, type, id, pricing_type, manValues, adminId, actualPrice, tax_type, tax_value, actualProductPrice, callback
) {
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(id, sectionId, res, cb);
        },
        function (cb) {
            if (req.body.discountPrice) {

                var discountPrice = req.body.discountPrice;
                var discountStartDate = req.body.discountStartDate;
                var discountEndDate = req.body.discountEndDate;
                if (req.body.houseCleaningPrice) {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>a")
                    var houseCleaningPrice = req.body.houseCleaningPrice;
                    insertPricing(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, houseCleaningPrice, 0, discountPrice, discountStartDate, discountEndDate, pricing_type, tax_type, tax_value, actualProductPrice,cb);
                }
                else if (req.body.beautySaloonPrice) {
                    var beautySaloonPrice = req.body.beautySaloonPrice;
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>b")
                    insertPricing(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, beautySaloonPrice, discountPrice, discountStartDate, discountEndDate, pricing_type, tax_type, tax_value, actualProductPrice,cb);
                }
                else {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>c")
                    insertPricing(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, 0, discountPrice, discountStartDate, discountEndDate, pricing_type, tax_type, tax_value,actualProductPrice, cb);
                }

            }
            else {
                if (req.body.houseCleaningPrice) {
                    var houseCleaningPrice = req.body.houseCleaningPrice;
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>1")
                    insertPricing(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, houseCleaningPrice, 0, 0, 0, 0, pricing_type, tax_type, tax_value, actualProductPrice, cb);
                }
                else if (req.body.beautySaloonPrice) {
                    var beautySaloonPrice = req.body.beautySaloonPrice;
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>2")
                    insertPricing(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, beautySaloonPrice, 0, 0, 0, pricing_type, tax_type, tax_value, actualProductPrice,cb);
                }
                else {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>3")
                    insertPricing(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, 0, 0, 0, 0, pricing_type, tax_type, tax_value, actualProductPrice, cb);
                }
            }
        },
    ], function (error, result) {

        if (error) {
            console.log('error>>>>>>>>>>>>>>>>>>>>4', error)
            callback(error);
        }
        else {
            var data = []
            callback(data);
        }
    }
    );
}

var location_lat_long_wise = function (service_type,
    res, dbName,
    accessToken, sectionId, productId, startDate, endDate, price, displayPrice, handlingFeeAdmin,
    handlingFeeSupplier, isUrgent, urgentPrice, urgentType, deliveryCharges, minOrder, chargesBelowMinOrder,
    offerType, type, id, pricing_type, manValues, adminId, actualPrice, discountPrice, discountStartDate, discountEndDate, houseCleaningPrice, beautySaloonPrice, tax_type, tax_value, actualProductPrice,callback
) {
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(dbName, id, sectionId, res, cb);
        },
        async function (cb) {
            console.log("==================in insertProduct Pricde==============", startDate, endDate)
            let checkUserType = await Universal.getUserPriceType(dbName)
            if (service_type == 1 || service_type == 2) {
                if (checkUserType && checkUserType.length > 0) {
                    if (discountPrice && discountPrice.length > 0) {
                        for (const [index, i] of discountPrice.entries()) {
                            await insertProductPriceNew(dbName, res, productId, i.startDate, i.endDate, i.price, handlingFeeAdmin,
                                handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder,
                                chargesBelowMinOrder, urgentType, i.offerType, type, id, i.displayPrice, i.discountPrice,
                                i.discountStartDate, i.discountEndDate, pricing_type, houseCleaningPrice, beautySaloonPrice, i.user_type_id, tax_type, tax_value);
                        }
                    } else {
                        for (const [index, i] of price.entries()) {
                            await insertProductPriceNew(dbName, res, productId, i.startDate, i.endDate, i.price, handlingFeeAdmin,
                                handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder,
                                chargesBelowMinOrder, urgentType, i.offerType, type, id, i.displayPrice, "",
                                "", "", pricing_type, houseCleaningPrice, beautySaloonPrice, i.user_type_id, tax_type, tax_value);
                        }
                    }
                    cb(null);
                } else {
                    insertProductPrice(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin,
                        handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder,
                        chargesBelowMinOrder, urgentType, offerType, type, id, displayPrice,
                        discountPrice, discountStartDate, discountEndDate, pricing_type, houseCleaningPrice,
                        beautySaloonPrice, tax_type, tax_value, actualProductPrice,cb);
                }
            }
            else {
                insertProductPrice(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin,
                    handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder,
                    chargesBelowMinOrder, urgentType, offerType, type, id, displayPrice,
                    discountPrice, discountStartDate, discountEndDate, pricing_type, houseCleaningPrice,
                    beautySaloonPrice, tax_type, tax_value, actualProductPrice,cb);
            }
        }
    ], function (error, result) {
        logger.debug("=========ERR==RS=", error, result)
        if (error) {
            console.log("--------------er-------------", error)
            console.log("============222=========", err)
            callback(error);
        }
        else {
            var data = []
            callback();
        }
    }
    );

}

var insertProductPrice = async function (dbName, res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, urgentType, offerType, type, id, displayPrice, discountPrice, discountStartDate, discountEndDate, pricing_type, houseCleaningPrice, beautySaloonPrice, tax_type, tax_value, actual_price,callback) {
    try {
        console.log("==========start date====end date=====price===previous===>>>>", startDate, endDate, price, discountPrice)


        if (discountPrice === 0 || discountPrice === undefined || discountPrice === "" || discountPrice === null) {
            logger.debug("======in regular price=======previous==========")
            var sql = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? limit 1";
            let result = await ExecuteQ.Query(dbName, sql, [productId, 0, 0]);

            if (result.length) {
                var sql11 = 'update product_pricing set is_deleted =1 where product_id = ? and price_type= ?'
                await ExecuteQ.Query(dbName, sql11, [productId, 0])

            }
            console.log("======consolea2=================")

            if(dbName == "yunofood_0906"){
                var sql1 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,display_price,urgent_value,pricing_type,tax_type,tax_value,actual_price) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
                await ExecuteQ.Query(dbName, sql1, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, displayPrice, urgentPrice, pricing_type, tax_type, tax_value,actual_price])
            } else{
                var sql1 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,display_price,urgent_value,pricing_type,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
                await ExecuteQ.Query(dbName, sql1, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, displayPrice, urgentPrice, pricing_type, tax_type, tax_value])
            }
            var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
            await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])

            logger.debug("======FINAL==CB=>>")
            callback(null);
        }
        else {
            var sql1 = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? limit 1";
            let result = await ExecuteQ.Query(dbName, sql1, [productId, 0, 0]);

            if(dbName == "yunofood_0906"){  
                var sql22 = "update product_pricing set actual_price = ? where product_id = ?"
                await ExecuteQ.Query(dbName, sql22, [actual_price, productId])
            }

            if (result.length) {
                var sql1 = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                let check = await ExecuteQ.Query(dbName, sql1, [productId, 0, 1])

                if (check.length) {
                    callback(null);
                }
                else {
                    var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value,actual_price) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    await ExecuteQ.Query(dbName, sql22, [productId, discountStartDate, discountEndDate, discountPrice, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 1, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value,actual_price])

                    if (type == 0) {
                        callback(null);
                    }
                    else if (type == 1) {
                        var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                        await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])

                        callback(null);
                    }
                    else {
                        callback(null)
                    }
                }

            }

            else {

                var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                let check = await ExecuteQ.Query(dbName, sql, [productId, 0, 1]);

                if (check.length) {
                    var sql11 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    await ExecuteQ.Query(dbName, sql11, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value]);
                }
                else {
                    var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    await ExecuteQ.Query(dbName, sql22, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value])

                    var sql33 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    await ExecuteQ.Query(dbName, sql33, [productId, discountStartDate, discountEndDate, discountPrice, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 1, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value]);
                    if (type == 0) {
                        callback(null);
                    }
                    else if (type == 1) {
                        var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                        await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])
                        callback(null);
                    }
                    else {
                        callback(null)
                    }
                }
            }
        }
    }
    catch (Err) {
        logger.debug("=insertProductPrice=", Err)
        sendResponse.somethingWentWrongError(res);
    }
}

var insertProductPriceNew = async function (dbName, res, productId, startDate, endDate, price, handlingFeeAdmin,
    handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder,
    urgentType, offerType, type, id, displayPrice, discountPrice, discountStartDate, discountEndDate,
    pricing_type, houseCleaningPrice, beautySaloonPrice, user_type_id, tax_type, tax_value) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.debug("==========start date====end date=====price======>>>>", startDate, endDate, price, discountPrice)
            if (discountPrice === 0 || discountPrice === undefined || discountPrice === "" || discountPrice === null) {
                logger.debug("======in regular price=================")
                var sql = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? and user_type_id=? limit 1";
                let result = await ExecuteQ.Query(dbName, sql, [productId, 0, 0, user_type_id])
                // multiConnection[dbName].query(sql, [productId, 0, 0,user_type_id], function (err, result) {
                //     //console.log("1",err,result);
                //     logger.debug("===========1==============")
                //     if (err) {
                //         console.log("-0000000000000000000=====111====",err)
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else {
                if (result.length) {
                    var sql11 = 'update product_pricing set is_deleted =1 where product_id = ? and price_type= ? and user_type_id=?'
                    await ExecuteQ.Query(dbName, sql11, [productId, 0, user_type_id])
                    // multiConnection[dbName].query(sql11,[productId,0,user_type_id],function (err,result) {
                    //     logger.debug("===========2==============")
                    //     if(err){
                    //         console.log("update",err);
                    //         console.log("-0000000000000000000=====2=222===",err)
                    //         sendResponse.somethingWentWrongError(res);
                    //     }
                    // })
                }
                var sql1 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,display_price,urgent_value,pricing_type,user_type_id,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
                await ExecuteQ.Query(dbName, sql1, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, displayPrice, urgentPrice, pricing_type, user_type_id, tax_type, tax_value])
                // multiConnection[dbName].query(sql1, [productId, startDate, endDate, price, 
                //     handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges,
                //      urgentType, offerType, displayPrice,urgentPrice,pricing_type,user_type_id], function (err, result) {
                //         logger.debug("===========3==============")                                 
                //     if (err) {
                //         console.log("-0000000000000000000=====3=333===",err)
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else {
                var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])
                // multiConnection[dbName].query(sql2, [deliveryCharges, productId, id], function (err, result) {
                //     logger.debug("===========4==============")
                //     if (err) {
                //         console.log("-0000000000000000000=====4444====",err)
                //         sendResponse.somethingWentWrongError(res)
                //     }
                //     else {
                logger.debug("======FINAL==CB=>>")
                resolve();
                //     }
                // })
                //     }
                // })
                //     }

                // })   
            }
            else {
                logger.debug("======in discount price=================")
                var sql1 = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? and user_type_id=? limit 1";
                let result = await ExecuteQ.Query(dbName, sql1, [productId, 0, 0, user_type_id])
                //    var stmt = multiConnection[dbName].query(sql1, [productId, 0, 0,user_type_id], function (err, result) {
                //     logger.debug("===========5==============")    
                //     if (err) {
                //             logger.debug("=============in insert pricing=======error======7========",stmt.sql,err)

                //             sendResponse.somethingWentWrongError(res);
                //         }
                //         else {
                if (result.length) {
                    var sql1 = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and user_type_id=? and ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                    let check = await ExecuteQ.Query(dbName, sql1, [productId, 0, 1, user_type_id])
                    // var stmt = multiConnection[dbName].query(sql1, [productId, 0, 1, user_type_id], function (err, check) {
                    //     logger.debug("===========6==============")
                    //     if (err) {
                    //         logger.debug("=============in insert pricing=======error======8========",stmt.sql,err)

                    //         sendResponse.somethingWentWrongError(res)
                    //     }
                    //     else {
                    if (check.length) {
                        resolve();
                    }
                    else {
                        var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,user_type_id,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                        await ExecuteQ.Query(dbName, sql22, [productId, discountStartDate,
                            discountEndDate, discountPrice, handlingFeeAdmin, handlingFeeSupplier,
                            isUrgent, urgentPrice, deliveryCharges, urgentType, 1,
                            houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice,
                            pricing_type, user_type_id, tax_type, tax_value
                        ])
                        //    var stmt =  multiConnection[dbName].query(sql22, [productId, discountStartDate,
                        //      discountEndDate, discountPrice, handlingFeeAdmin, handlingFeeSupplier,
                        //       isUrgent, urgentPrice, deliveryCharges, urgentType, 1, 
                        //       houseCleaningPrice, beautySaloonPrice, displayPrice,urgentPrice,
                        //       pricing_type,user_type_id], function (err, result) {
                        //         logger.debug("===========7==============")
                        //         if (err) {
                        //             console.log(err)
                        //             // logger.debug("=============in insert pricing=======error=======9=======",stmt.sql,err)

                        //             sendResponse.somethingWentWrongError(res);
                        //         }
                        //         else {
                        if (type == 0) {
                            resolve();
                        }
                        else if (type == 1) {
                            var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                            await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])
                            // var stmt = multiConnection[dbName].query(sql2, [deliveryCharges,
                            //      productId, id], function (err, result) {
                            //         logger.debug("===========8==============")
                            //         if (err) {
                            //         // logger.debug("=============in insert pricing=======error======10========",stmt.sql,err)

                            //         sendResponse.somethingWentWrongError(res)
                            //     }
                            //     else {
                            resolve();
                            //     }
                            // })
                        }
                        else {
                            resolve();
                        }
                        //     }
                        // })
                    }
                    //     }
                    // })

                }

                else {

                    var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and user_type_id=? and  ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                    let check = await ExecuteQ.Query(dbName, sql, [productId, 0, 1, user_type_id]);
                    // var stmt = multiConnection[dbName].query(sql, [productId, 0, 1, user_type_id], function (err, check) {

                    //     logger.debug("===========9==============")
                    //     if (err) {
                    //         logger.debug("=============in insert pricing=======error======13========",stmt.sql,err)

                    //         sendResponse.somethingWentWrongError(res)
                    //     }
                    //     else {
                    if (check.length) {
                        var sql11 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,user_type_id,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                        await ExecuteQ.Query(dbName, sql11, [
                            productId, startDate,
                            endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                            urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice,
                            beautySaloonPrice, displayPrice, urgentPrice, pricing_type, user_type_id, tax_type, tax_value
                        ])
                        // var stmt = multiConnection[dbName].query(sql11, [productId, startDate,
                        //  endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                        //   urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice, 
                        //   beautySaloonPrice, displayPrice,urgentPrice,pricing_type,
                        //       user_type_id], function (err, result) {
                        //         logger.debug("===========10==============")
                        //         if (err) {
                        //         // console.log(err);
                        //         logger.debug("=============in insert pricing=======error======14========",stmt.sql,err)

                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        //     else {
                        resolve();
                        //     }
                        // })
                    }
                    else {
                        var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,user_type_id,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                        await ExecuteQ.Query(dbName, sql22, [productId, startDate,
                            endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                            urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice,
                            beautySaloonPrice, displayPrice, urgentPrice, pricing_type,
                            user_type_id, tax_type, tax_value])
                        // var stmt = multiConnection[dbName].query(sql22, [productId, startDate, 
                        //     endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                        //      urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice,
                        //       beautySaloonPrice, displayPrice,urgentPrice,pricing_type,
                        //       user_type_id], function (err, result) {
                        //         logger.debug("===========11==============")
                        //         if (err) {
                        //         // console.log(err);
                        //         logger.debug("=============in insert pricing=======error=========15=====",stmt.sql,err)

                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        //     else {
                        var sql33 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,user_type_id,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                        await ExecuteQ.Query(dbName, sql33, [productId,
                            discountStartDate, discountEndDate, discountPrice,
                            handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                            urgentPrice, deliveryCharges, urgentType,
                            1, houseCleaningPrice, beautySaloonPrice,
                            displayPrice, urgentPrice, pricing_type,
                            user_type_id, tax_type, tax_value])
                        // var stmt = multiConnection[dbName].query(sql33, [productId, 
                        //     discountStartDate, discountEndDate, discountPrice,
                        //      handlingFeeAdmin, handlingFeeSupplier, isUrgent,
                        //       urgentPrice, deliveryCharges, urgentType, 
                        //       1, houseCleaningPrice, beautySaloonPrice, 
                        //       displayPrice,urgentPrice,pricing_type,
                        //       user_type_id], function (err, result) {
                        //         logger.debug("===========12==============")
                        //         if (err) {
                        //         // console.log(err)
                        //         logger.debug("=============in insert pricing=======error=====16=========",stmt.sql,err)

                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        // else {
                        if (type == 0) {
                            resolve();;
                        }
                        else if (type == 1) {
                            var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                            await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])
                            //    var stmt = multiConnection[dbName].query(sql2, [deliveryCharges,
                            //     productId, id], function (err, result) {
                            //         logger.debug("===========13==============")
                            //         if (err) {
                            //             logger.debug("=============in insert pricing=======error======17========",stmt.sql,err)

                            //             sendResponse.somethingWentWrongError(res)
                            //         }
                            //         else {
                            resolve();
                            //     }
                            // })
                        }
                        else {
                            resolve();
                        }
                        //     }
                        // })
                        //     }
                        // })
                    }

                    //     }
                    // })
                }

                //     }

                // })
            }
        }
        catch (Err) {
            logger.debug("=insertProductPriceNew=", Err)
            sendResponse.somethingWentWrongError(res);
        }
    })
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
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listBranchAreas(req.dbName, res, branchId, cb);
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

exports.changeProductStatus = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var status = req.body.status;  // 1: active , 0 : inactive
    var manValues = [accessToken, sectionId, productId, status];
    var adminId;
    var product = productId.split("#").toString();
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            changeProductStatus(req.dbName, res, product, status, cb);
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


exports.deletePricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productPricingId = req.body.productPricingId;
    var manValues = [accessToken, sectionId, productPricingId];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        async function (cb) {
            let checkUserType = await Universal.getUserPriceType(req.dbName)

            if (req.service_type == 1 || req.service_type == 2) {
                if (checkUserType && checkUserType.length > 0) {
                    for (const [index, i] of productPricingId.entries()) {
                        await deleteProductPricingNew(req.dbName, res, i);
                    }
                    cb(null);
                } else {
                    deleteProductPricing(req.dbName, res, productPricingId, cb);
                }
            } else {
                deleteProductPricing(req.dbName, res, productPricingId, cb);
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
    var type = req.body.type; // 0-- admin, 1 -- supplier, 2 -- supplier branch
    var id = req.body.id; // supplier id or supplier branch id
    var manValues = [displayPrice, minOrder, chargesBelowMinOrder, areaId, offerType, type, id, accessToken, sectionId, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, productId];

    let tax_type = req.body.tax_type || 0;
    let tax_value = req.body.tax_value || 0;
    let actualProductPrice = "";
    if (req.body.actualProductPrice && req.body.actualProductPrice != undefined && req.body.actualProductPrice != null) {
        actualProductPrice = req.body.actualProductPrice
        displayPrice = price;
    }

    console.log("...................type..............................", price);

     
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        async function (cb) {
            let checkUserType = await Universal.getUserPriceType(req.dbName)

            if (req.service_type == 1 || req.service_type == 2) {
                if (checkUserType && checkUserType.length > 0) {
                    for (const [index, i] of price.entries()) {
                        await editPricingNew(req.dbName, res, i.productPricingId, i.startDate, i.endDate,
                            i.price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice,
                            deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType,
                            i.offerType, type, id, i.displayPrice, houseCleaningPrice, 0, productId, i.user_type_id, tax_type, tax_value);
                    }
                    cb(null);
                } else {
                    if (req.body.houseCleaningPrice) {
                        var houseCleaningPrice = req.body.houseCleaningPrice;
                        editPricing(req.dbName, res, productPricingId, startDate, endDate,
                            price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice,
                            deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType,
                            offerType, type, id, displayPrice, houseCleaningPrice, 0, productId, cb, tax_type, tax_value);
                    }
                    else if (req.body.beautySaloonPrice) {
                        var beautySaloonPrice = req.body.beautySaloonPrice;
                        editPricing(req.dbName, res, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, beautySaloonPrice, productId, cb, tax_type, tax_value);
                    }
                    else {
                        editPricing(req.dbName, res, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, 0, productId, cb, tax_type, tax_value, actualProductPrice);
                    }
                }

            } else {
                if (req.body.houseCleaningPrice) {
                    var houseCleaningPrice = req.body.houseCleaningPrice;
                    editPricing(req.dbName, res, productPricingId, startDate, endDate,
                        price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice,
                        deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType,
                        offerType, type, id, displayPrice, houseCleaningPrice, 0, productId, cb, tax_type, tax_value);
                }
                else if (req.body.beautySaloonPrice) {
                    var beautySaloonPrice = req.body.beautySaloonPrice;
                    editPricing(req.dbName, res, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, beautySaloonPrice, productId, cb, tax_type, tax_value);
                }
                else {
                    editPricing(req.dbName, res, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, 0, 0, productId, cb, tax_type, tax_value, actualProductPrice);
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


exports.listProductPricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var type = req.body.type; //0 : admin , 1: supplier , 2: supplier branch
    var id = req.body.id; // supplier id or supplier branch id
    var manValues = [accessToken, sectionId, productId, type, id];
    var adminId;
    var data = {};
    var supplierId = req.body.supplierId
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listProductPriceDetails(req.dbName, res, productId, type, id, cb);
        },
        function (product, cb) {
            var sql = 'select pricing_type from product where id = ?';
            multiConnection[req.dbName].query(sql, [productId], function (err, result) {
                if (err) {
                    console.log("err");
                    sendResponse.somethingWentWrongError(res);
                } else {
                    data.pricing = product;
                    if (result.length) {
                        data.pricing_type = result[0].pricing_type;
                    } else {
                        data.pricing_type = 0;
                    }
                    cb(null, data);
                }
            })
        },

        function (data, cb) {
            var temp = [];
            if (type == 1) {
                var sql = "select s.urgentButton,sc.urgent_type,sc.urgent_price from supplier s join supplier_product sp on s.id = sp.	supplier_id " +
                    " join supplier_category sc on sc.supplier_id = s.id join product p on p.id = sp.product_id and sc.category_id = p.category_id " +
                    " where p.id = ? and s.id = ? "
                temp.push(productId);
                temp.push(supplierId);
            } else {
                var sql = " SELECT sc.urgent_type, sc.urgent_price FROM product p " +
                    "JOIN supplier_branch_product sbp ON sbp.product_id = p.id " +
                    "JOIN supplier_branch sb ON sb.id = sbp.supplier_branch_id " +
                    "JOIN supplier_category sc ON sc.supplier_id = sb.supplier_id " +
                    "AND sc.category_id = p.category_id " +
                    "WHERE product_id =? "

                temp.push(productId);
            }

            multiConnection[req.dbName].query(sql, temp, function (err, result) {

                // console.log(".............err..............result............",err,result);
                if (err) {
                    console.log("err...........................", result);
                    sendResponse.somethingWentWrongError(res);
                } else {
                    if (result.length) {
                        data.urgent_type = result[0].urgent_type;
                        data.urgent_value = result[0].urgent_price;
                    } else {
                        data.urgent_type = 0;
                        data.urgent_value = 0;
                    }
                    cb(null, data);
                }
            })
        },
        function (data, cb) {
            var sql = "select urgentButton from supplier where id = ?";
            multiConnection[req.dbName].query(sql, [supplierId], function (err, result) {
                if (err) {
                    console.log("err...........................", result);
                    sendResponse.somethingWentWrongError(res);
                } else {
                    if (result.length) {
                        data.urgentButton = result[0].urgentButton;
                    } else {
                        data.urgentButton = 0
                    }
                    cb(null, data);
                }
            })
        }, function (data, cb) {
            var sql = " select price from product_pricing where product_id = ? and price_type = ? and is_deleted = 0";
            multiConnection[req.dbName].query(sql, [productId, 0], function (err, result) {
                console.log("......................................err...........", err, result);
                console.log("......................................productId...........", productId);
                if (err) {
                    cb(err);
                } else {
                    if (result.length) {
                        data.is_price = 1;
                        data.price = result[0].price;
                        cb(null, data);
                    } else {
                        data.is_price = 0;
                        data.price = 0;
                        cb(null, data);
                    }
                }
            })
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

/**
 * @description used for listing an all supplier name from admin
 */
exports.listRegisteredSuppliersWithNamesOnly = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listSuppliersForAssigningProducts(req.dbName, res, cb);
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
    var supplierId = req.body.supplierId;
    var manValues = [accessToken, sectionId, supplierId];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listSuppliersBranchesForAssigningProducts(req.dbName, res, supplierId, cb);
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


exports.addPerHourPricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var perHourPrice = req.body.perHourPrice;
    var minHour = req.body.minHour;
    var maxHour = req.body.maxHour;
    var manValues = [accessToken, sectionId, productId, minHour, maxHour, perHourPrice];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            addHourlyPricing(req.dbName, res, productId, minHour, maxHour, perHourPrice, cb);
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


exports.listPerHourPricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var manValues = [accessToken, sectionId, productId];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            listHourlyPricing(req.dbName, res, productId, cb);
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


exports.deletePerHourPricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var manValues = [accessToken, sectionId, id];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            deletePricingHourly(req.dbName, res, id, cb);
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


exports.editPerHourPricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var perHourPrice = req.body.perHourPrice;
    var minHour = req.body.minHour;
    var maxHour = req.body.maxHour;
    var manValues = [accessToken, sectionId, id, minHour, maxHour, perHourPrice];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, sectionId, res, cb);
        },
        function (cb) {
            editHourlyPricing(req.dbName, res, id, minHour, maxHour, perHourPrice, cb);
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


async function insertPricing(dbName, res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, houseCleaningPrice, beautySaloonPrice, discountPrice, discountStartDate, discountEndDate, pricing_type, tax_type, tax_value, actualProductPrice, callback) {
    try {
        if (discountPrice == 0) {
            var sql = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? limit 1";
            let result = await ExecuteQ.Query(dbName, sql, [productId, 0, 0])

            if (result.length) {
                var sql11 = 'update product_pricing set is_deleted =1 where product_id = ? and price_type= ?'
                await ExecuteQ.Query(dbName, sql11, [productId, 0]);

            }
            let inserActualprice = "";
            let inserActualprice2 = ""
            if (actualProductPrice && actualProductPrice != null && actualProductPrice != undefined) {
                inserActualprice = ",actual_price";
                inserActualprice2 = ",?"
            }

            var sql1 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value " + inserActualprice + ") values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?" + inserActualprice2 + ") ";
            await ExecuteQ.Query(dbName, sql1, [productId, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value, actualProductPrice])

            if (type == 0) {
                callback(null);
            }
            else if (type == 1) {
                var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])

                callback(null);

            }
            else {
                var sql3 = "delete from supplier_branch_area_product where supplier_branch_id = ? and product_id = ?";
                await ExecuteQ.Query(dbName, sql3, [id, productId])

                areaId = areaId.split("#");
                deliveryCharges = deliveryCharges.split("#");
                minOrder = minOrder.split("#");
                chargesBelowMinOrder = chargesBelowMinOrder.split("#");
                var values = [];
                var queryString = "";
                var insertString = "(?,?,?,?,?,?),";
                for (var i = 0; i < areaId.length; i++) {
                    (async function (i) {
                        values.push(id, areaId[i], productId, deliveryCharges[i], minOrder[i], chargesBelowMinOrder[i]);
                        queryString = queryString + insertString;
                        if (i == areaId.length - 1) {
                            queryString = queryString.substring(0, queryString.length - 1);
                            var sql4 = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                            await ExecuteQ.Query(dbName, sql4, values);

                            callback(null);

                        }

                    }(i))

                }

            }



        }

        else {
            var sql1 = "select id from product_pricing where product_id = ? and price_type = ? and is_deleted = ? limit 1";
            let result = await ExecuteQ.Query(dbName, sql1, [productId, 0, 0])

            if (result.length) {
                var sql1 = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                let check = await ExecuteQ.Query(dbName, sql1, [productId, 0, 1])

                if (check.length) {
                    callback(null);
                }
                else {
                    var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    await ExecuteQ.Query(dbName, sql22, [productId, discountStartDate, discountEndDate, discountPrice, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 1, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value])

                    if (type == 0) {
                        callback(null);
                    }
                    else if (type == 1) {
                        var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                        await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])

                        callback(null);

                    }
                    else {
                        var sql3 = "delete from supplier_branch_area_product where supplier_branch_id = ? and product_id = ?";
                        await ExecuteQ.Query(dbName, sql3, [id, productId])

                        areaId = areaId.split("#");
                        deliveryCharges = deliveryCharges.split("#");
                        minOrder = minOrder.split("#");
                        chargesBelowMinOrder = chargesBelowMinOrder.split("#");
                        var values = [];
                        var queryString = "";
                        var insertString = "(?,?,?,?,?,?),";
                        for (var i = 0; i < areaId.length; i++) {
                            (async function (i) {
                                values.push(id, areaId[i], productId, deliveryCharges[i], minOrder[i], chargesBelowMinOrder[i]);
                                queryString = queryString + insertString;
                                if (i == areaId.length - 1) {
                                    queryString = queryString.substring(0, queryString.length - 1);
                                    var sql4 = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                                    await ExecuteQ.Query(dbName, sql4, values)

                                    callback(null);

                                }

                            }(i))

                        }


                    }

                }


            }

            else {

                var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "') or (end_date BETWEEN '" + discountStartDate + "' and '" + discountEndDate + "'))  limit 1";
                let check = await ExecuteQ.Query(dbName, sql, [productId, 0, 1])

                if (check.length) {
                    var sql11 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    await ExecuteQ.Query(dbName, sql11, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value])

                    callback(null);

                }
                else {
                    var sql22 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    await ExecuteQ.Query(dbName, sql22, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 0, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value])

                    var sql33 = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price,urgent_value,pricing_type,tax_type,tax_value) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    await ExecuteQ.Query(dbName, sql33, [productId, discountStartDate, discountEndDate, discountPrice, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, 1, houseCleaningPrice, beautySaloonPrice, displayPrice, urgentPrice, pricing_type, tax_type, tax_value])

                    if (type == 0) {
                        callback(null);
                    }
                    else if (type == 1) {
                        var sql2 = "update supplier_product set delivery_charges = ? where product_id = ? and supplier_id = ?"
                        await ExecuteQ.Query(dbName, sql2, [deliveryCharges, productId, id])

                        callback(null);

                    }
                    else {
                        var sql3 = "delete from supplier_branch_area_product where supplier_branch_id = ? and product_id = ?";
                        await ExecuteQ.Query(dbName, sql3, [id, productId])

                        areaId = areaId.split("#");
                        deliveryCharges = deliveryCharges.split("#");
                        minOrder = minOrder.split("#");
                        chargesBelowMinOrder = chargesBelowMinOrder.split("#");
                        var values = [];
                        var queryString = "";
                        var insertString = "(?,?,?,?,?,?),";
                        for (var i = 0; i < areaId.length; i++) {
                            (async function (i) {
                                values.push(id, areaId[i], productId, deliveryCharges[i], minOrder[i], chargesBelowMinOrder[i]);
                                queryString = queryString + insertString;
                                if (i == areaId.length - 1) {
                                    queryString = queryString.substring(0, queryString.length - 1);
                                    var sql4 = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                                    await ExecuteQ.Query(dbName, sql4, values);

                                    callback(null);

                                }

                            }(i))

                        }

                    }

                }

            }

        }
    }
    catch (Err) {
        logger.debug("==Add=Pricing ==Err>>", Err)
        sendResponse.somethingWentWrongError(res);
    }
}



async function editPricing(dbName, res, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, houseCleaningPrice, beautySaloonPrice, productId, callback, tax_type, tax_value, actualProductPrice) {
    console.log("price", price, typeof (price), displayPrice, typeof (displayPrice))
    try {
        if (offerType == 1) {

            var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + startDate + "' and '" + endDate + "') or (end_date BETWEEN '" + startDate + "' and '" + endDate + "')) and id != ?  limit 1";
            let check = await ExecuteQ.Query(dbName, sql, [productId, 0, 1, productPricingId])
            // multiConnection[dbName].query(sql, [productId, 0, 1,productPricingId], function (err, check) {

            //     if(err){
            //         sendResponse.somethingWentWrongError(res)
            //     }
            //     else{
            if (check.length) {

                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.DUPLICATE_PRODUCT_PRICING, res, constant.responseStatus.SOME_ERROR);

            }
            else {
                var sql = "update product_pricing set tax_type=?,tax_value=?,start_date = ?,end_date = ?,price = ?,handling = ?, ";
                sql += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
                sql += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges=? where id = ? limit 1";
                await ExecuteQ.Query(dbName, sql, [tax_type, tax_value, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, houseCleaningPrice, beautySaloonPrice, offerType, urgentType, urgentPrice, deliveryCharges, productPricingId])
                // multiConnection[dbName].query(sql,[moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'),price,handlingFeeAdmin,handlingFeeSupplier,isUrgent,urgentPrice,houseCleaningPrice,beautySaloonPrice,offerType,urgentType,urgentPrice,deliveryCharges,productPricingId],function(err,result)
                // {
                //     if(err){
                //         console.log("2",err);
                //         sendResponse.somethingWentWrongError(res)
                //     }
                //     else{
                callback(null);
                //     }

                // })
            }

        }


        // })
        // }
        else {
            let regular_price = price
            var get_ids = await getProductPricingIds(dbName, productId)
            logger.debug("======getIds==========", get_ids)

            if (get_ids && get_ids.length > 0) {
                for (const [index, i] of get_ids.entries()) {
                    await updateProductPricing(dbName, i.price_type, i.id, i.price, i.display_price, price,
                        displayPrice, deliveryCharges, handlingFeeAdmin, startDate, endDate, handlingFeeSupplier,
                        isUrgent, urgentPrice, houseCleaningPrice, beautySaloonPrice, urgentType, urgentPrice, tax_type, tax_value, actualProductPrice
                    )
                    if (index == get_ids.length - 1) {
                        callback(null);
                    }
                }
            }
            else {
                callback(null);
            }
        }
    }
    catch (Err) {
        logger.debug("=editPricingerror=", Err)
        sendResponse.somethingWentWrongError(res)
    }
}

async function editPricingNew(dbName, res, productPricingId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id, displayPrice, houseCleaningPrice, beautySaloonPrice, productId, user_type_id, tax_type, tax_value) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("price", price, typeof (price), displayPrice, typeof (displayPrice))
            if (offerType == 1) {
                var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and user_type_id=? and ((start_date BETWEEN '" + startDate + "' and '" + endDate + "') or (end_date BETWEEN '" + startDate + "' and '" + endDate + "')) and id != ?  limit 1";
                let check = await ExecuteQ.Query(dbName, sql, [productId, 0, 1, user_type_id, productPricingId])
                // multiConnection[dbName].query(sql, [productId, 0, 1,user_type_id,productPricingId], function (err, check) {

                //     if(err){
                //         sendResponse.somethingWentWrongError(res)
                //     }
                //     else{
                if (check.length) {

                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.DUPLICATE_PRODUCT_PRICING, res, constant.responseStatus.SOME_ERROR);

                }
                else {
                    var sql = "update product_pricing set tax_type=?,tax_value=?,start_date = ?,end_date = ?,price = ?,handling = ?, ";
                    sql += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
                    sql += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges=? where id = ? and user_type_id=? limit 1";
                    await ExecuteQ.Query(dbName, sql, [tax_type, tax_value, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, houseCleaningPrice, beautySaloonPrice, offerType, urgentType, urgentPrice, deliveryCharges, productPricingId, user_type_id])
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

                // }


                // })
            }
            else {
                let regular_price = price
                var get_ids = await getProductPricingIdsNew(dbName, productId, user_type_id)
                logger.debug("======getIds==========", get_ids)

                if (get_ids && get_ids.length > 0) {
                    for (const [index, i] of get_ids.entries()) {
                        await updateProductPricing(dbName, i.price_type, i.id, i.price, i.display_price, price,
                            displayPrice, deliveryCharges, handlingFeeAdmin, startDate, endDate, handlingFeeSupplier,
                            isUrgent, urgentPrice, houseCleaningPrice, beautySaloonPrice, urgentType, urgentPrice, tax_type, tax_value
                        )
                        if (index == get_ids.length - 1) {
                            resolve();
                        }
                    }
                }
                else {
                    resolve();
                }
            }
        }
        catch (Err) {
            logger.debug("=editPricingNew=Err!===", Err)
            sendResponse.somethingWentWrongError(res)
        }
    })


}


async function updateProductPricing(dbName, price_type, product_pricing_id, orignal_price,
    orignal_display_price, price, display_price, deliveryCharges, handlingFeeAdmin, startDate, endDate, handlingFeeSupplier,
    isUrgent, urgentPrice, houseCleaningPrice, beautySaloonPrice, urgentType, urgentPrice, tax_type, tax_value, actualProductPrice
) {
    logger.debug("========productPricingIdproductPricingId=======", product_pricing_id)
    return new Promise(async (resolve, reject) => {
        let inserActualprice = ""
        if (actualProductPrice && actualProductPrice != null && actualProductPrice != undefined) {
            inserActualprice = ",actual_price=" + actualProductPrice + ""
        }
        if (price_type == 0) {
            let query = "update product_pricing set tax_type=?,tax_value=?,price=?, display_price=?, start_date = ?,end_date = ?,handling = ?, ";
            query += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
            query += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges= ? " + inserActualprice + " where id = ? limit 1";

            let params = [tax_type, tax_value, price, display_price, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'),
                handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, houseCleaningPrice, beautySaloonPrice, price_type, urgentType,
                urgentPrice, deliveryCharges, product_pricing_id]

            var data = await ExecuteQ.Query(dbName, query, params)
            resolve(data)
        } else {
            let comingPrice = price;
            let comingDisplayPrice = display_price;
            let orignalPrice = orignal_price
            let orignalDisplayPrice = orignal_display_price
            let discounted_ammount = 100 - ((orignalPrice / orignalDisplayPrice) * 100)
            logger.debug("=========discounted_ammount========", discounted_ammount)
            price = display_price - ((display_price / 100) * discounted_ammount)
            logger.debug("===========price calculated==========", price, isNaN(price))
            if (isNaN(price)) {
                price = comingPrice;
                display_price = display_price;
                price_type = 0;
            }
            let query = "update product_pricing set tax_type=?,tax_value=?,price=?, display_price=?, start_date = ?,end_date = ?,handling = ?, ";
            query += "  handling_supplier = ?,can_urgent = ?,urgent_price = ?,house_cleaning_price = ? , beauty_saloon_price = ? ,";
            query += " price_type = ? , urgent_type = ?,urgent_value = ?,delivery_charges= ? " + inserActualprice + " where id = ? limit 1";

            let params = [tax_type, tax_value, price, display_price, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'),
                handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, houseCleaningPrice, beautySaloonPrice,
                price_type, urgentType, urgentPrice, deliveryCharges, product_pricing_id]

            var data = await ExecuteQ.Query(dbName, query, params)
            resolve(data)
        }
    })
}

function getProductPricingIds(dbName, productId) {
    let data = []
    return new Promise((resolve, reject) => {
        var sql = "select id,price_type,price,display_price from product_pricing where product_id=? and is_deleted=? "
        let stmt = multiConnection[dbName].query(sql, [productId, 0], function (err, result) {
            logger.debug("================statement in query===========", stmt.sql)
            if (err) {
                reject(err)
            } else {
                if (result && result.length) {
                    data = result
                    resolve(data)
                } else {
                    resolve(data)
                }
            }
        })
    })
}

function getProductPricingIdsNew(dbName, productId, user_type_id) {
    let data = []
    return new Promise((resolve, reject) => {
        var sql = "select id,price_type,price,display_price from product_pricing where product_id=? and is_deleted=? and user_type_id=? "
        let stmt = multiConnection[dbName].query(sql, [productId, 0, user_type_id], function (err, result) {
            logger.debug("================statement in query===========", stmt.sql)
            if (err) {
                reject(err)
            } else {
                if (result && result.length) {
                    data = result
                    resolve(data)
                } else {
                    resolve(data)
                }
            }
        })
    })
}

function getProductPriceDurationDetails(dbName, productId) {
    return new Promise((resolve, reject) => {
        try {
            let sql = "select pricing_type,duration from product where id=? "
            let result = ExecuteQ.Query(dbName, sql, [productId]);
            resolve(result);
        } catch (err) {
            logger.debug("==========errrrr=======", err);
            reject(err)
        }
    })
}

function removeProductPricing(dbName, productId) {
    return new Promise((resolve, reject) => {
        try {
            let sql = "delete from product_pricing where product_id=?"
            let result = ExecuteQ.Query(dbName, sql, [productId]);
            resolve(result);
        } catch (err) {
            logger.debug("==========errrrr=======", err);
            reject(err)
        }
    })
}
exports.updateProduct = async function (dbName, res, productId, names, priceUnit,
    descriptions, sku, barCode, commission, commissionType, commissionPackage,
    measuringUnit, quantity, brand_id, making_price, product_tags,
    is_product, pricing_type, duration, payment_after_confirmation,
    cart_image_upload, Size_chart_url, country_of_origin, purchase_limit,
    is_subscription_required, allergy_description,
    is_allergy_product, is_appointment, special_instructions, updateRequestId, by_supplier, calories, grade, stock_number, is_non_veg, tax_exempt, callback) {
    try {

        logger.debug("===============chek arguments =======+", dbName, res, productId, names,
            priceUnit, descriptions, sku, barCode, commission, commissionType, commissionPackage,
            measuringUnit, quantity, brand_id, making_price, product_tags,
            is_product, pricing_type, duration, payment_after_confirmation, cart_image_upload)

        let results = await ExecuteQ.Query(dbName, "select app_type from screen_flow", []);

        // enable_updation_vendor_approval

        let vendorApprovalCheck = await ExecuteQ.Query(dbName, "select `key`,value from tbl_setting where `key`=? and value=1", ["enable_updation_vendor_approval"]);

        let gradeSettingKeys = await ExecuteQ.Query(dbName, "select `key`,value from tbl_setting where `key`=? and value=1", ["enable_grading"]);
        let stockNumberSettingKeys = await ExecuteQ.Query(dbName, "select `key`,value from tbl_setting where `key`=? and value=1", ["enable_stock_number"]);




        if (vendorApprovalCheck && vendorApprovalCheck.length > 0 && parseInt(by_supplier) == 1) {
            if (parseInt(updateRequestId) !== 0) {
                let sql = "update supplier_product_updation_request set payment_after_confirmation = ?,cart_image_upload = ?,name = ?,price_unit = ?,product_desc = ?,sku = ?,bar_code = ?,commission = ?,  ";
                sql += " commission_type = ?,commission_package = ? ,measuring_unit= ?,quantity = ?,brand_id=?,is_product=?,pricing_type=?,duration=?, making_price=?,product_tags=?,Size_chart_url=?,country_of_origin=?,purchase_limit=?,is_subscription_required=?,allergy_description=?,is_allergy_product=?,is_appointment=?,special_instructions=?,calories=? where id = ? limit 1";

                logger.debug("========sql======", sql)
                logger.debug("=======payment_after_confirmation,cart_image_upload,names, priceUnit, descriptions, sku, barCode, commission, commissionType, commissionPackage, measuringUnit,quantity,brand_id,is_product,pricing_type,duration,making_price,product_tags,productId=====",
                    payment_after_confirmation, cart_image_upload, names,
                    priceUnit, descriptions, sku, barCode, commission,
                    commissionType, commissionPackage, measuringUnit,
                    quantity, brand_id, is_product, pricing_type, duration,
                    making_price, product_tags, Size_chart_url, country_of_origin,
                    special_instructions, calories, updateRequestId)

                await ExecuteQ.Query(dbName, sql, [payment_after_confirmation,
                    cart_image_upload, names,
                    priceUnit, descriptions, sku, barCode, commission,
                    commissionType, commissionPackage,
                    measuringUnit, quantity, brand_id, is_product, pricing_type,
                    duration, making_price,
                    product_tags, Size_chart_url,
                    country_of_origin, purchase_limit, is_subscription_required,
                    allergy_description, is_allergy_product, is_appointment,
                    special_instructions, calories, updateRequestId]);

                if (gradeSettingKeys && gradeSettingKeys.length > 0) {
                    let sql = "UPDATE supplier_product_updation_request SET grade=? WHERE id=? limit 1";
                    await ExecuteQ.Query(dbName, sql, [grade, updateRequestId])
                }
                if (stockNumberSettingKeys && stockNumberSettingKeys.length > 0) {
                    let sql = "UPDATE supplier_product_updation_request SET stock_number=? WHERE id=? limit 1";
                    await ExecuteQ.Query(dbName, sql, [stock_number, updateRequestId])
                }

                callback(null, updateRequestId);
            } else {
                let sql = `insert into supplier_product_updation_request (payment_after_confirmation ,
                cart_image_upload ,name ,price_unit ,product_desc ,sku ,bar_code ,commission ,  
                commission_type ,commission_package ,measuring_unit,quantity ,brand_id,is_product,
                pricing_type,duration, making_price,product_tags,Size_chart_url,country_of_origin,
                purchase_limit,is_subscription_required,allergy_description,is_allergy_product,is_appointment,special_instructions,product_id )
                values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

                logger.debug("========sql======", sql)
                logger.debug("=======payment_after_confirmation,cart_image_upload,names, priceUnit, descriptions, sku, barCode, commission, commissionType, commissionPackage, measuringUnit,quantity,brand_id,is_product,pricing_type,duration,making_price,product_tags,productId=====",
                    payment_after_confirmation, cart_image_upload, names,
                    priceUnit, descriptions, sku, barCode, commission,
                    commissionType, commissionPackage, measuringUnit,
                    quantity, brand_id, is_product, pricing_type, duration,
                    making_price, product_tags, Size_chart_url, country_of_origin,
                    special_instructions)

                let data = await ExecuteQ.Query(dbName, sql, [payment_after_confirmation,
                    cart_image_upload, names,
                    priceUnit, descriptions, sku, barCode, commission,
                    commissionType, commissionPackage,
                    measuringUnit, quantity, brand_id, is_product, pricing_type,
                    duration, making_price,
                    product_tags, Size_chart_url,
                    country_of_origin, purchase_limit, is_subscription_required,
                    allergy_description, is_allergy_product, is_appointment,
                    special_instructions, productId]);

                if (gradeSettingKeys && gradeSettingKeys.length > 0) {
                    let sql = "UPDATE supplier_product_updation_request SET grade=? WHERE product_id=? limit 1";
                    await ExecuteQ.Query(dbName, sql, [grade, data.insertId])
                }
                if (stockNumberSettingKeys && stockNumberSettingKeys.length > 0) {
                    let sql = "UPDATE supplier_product_updation_request SET stock_number=? WHERE product_id=? limit 1";
                    await ExecuteQ.Query(dbName, sql, [stock_number, data.insertId])
                }


                callback(null, data.insertId);
            }
        } else {
            var sql = "update product set tax_exempt =?, purchased_quantity=0,is_non_veg=?,payment_after_confirmation = ?,cart_image_upload = ?,name = ?,price_unit = ?,product_desc = ?,sku = ?,bar_code = ?,commission = ?,  ";
            sql += " commission_type = ?,commission_package = ? ,measuring_unit= ?,quantity = ?,brand_id=?,is_product=?,pricing_type=?,duration=?, making_price=?,product_tags=?,Size_chart_url=?,country_of_origin=?,purchase_limit=?,is_subscription_required=?,allergy_description=?,is_allergy_product=?,is_appointment=?,special_instructions=?,approved_by_admin=0 where id = ? limit 1";

            logger.debug("========sql======", sql)
            logger.debug("=======payment_after_confirmation,cart_image_upload,names, priceUnit, descriptions, sku, barCode, commission, commissionType, commissionPackage, measuringUnit,quantity,brand_id,is_product,pricing_type,duration,making_price,product_tags,productId=====",
                payment_after_confirmation, cart_image_upload, names,
                priceUnit, descriptions, sku, barCode, commission,
                commissionType, commissionPackage, measuringUnit,
                quantity, brand_id, is_product, pricing_type, duration,
                making_price, product_tags, Size_chart_url, country_of_origin,
                special_instructions, productId)

            await ExecuteQ.Query(dbName, sql, [tax_exempt, is_non_veg, payment_after_confirmation,
                cart_image_upload, names,
                priceUnit, descriptions, sku, barCode, commission,
                commissionType, commissionPackage,
                measuringUnit, quantity, brand_id, is_product, pricing_type,
                duration, making_price,
                product_tags, Size_chart_url,
                country_of_origin, purchase_limit, is_subscription_required,
                allergy_description, is_allergy_product, is_appointment,
                special_instructions, productId]);


            if (gradeSettingKeys && gradeSettingKeys.length > 0) {
                let sql = "UPDATE product SET grade=? WHERE id=? limit 1";
                await ExecuteQ.Query(dbName, sql, [grade, productId])
            }
            if (stockNumberSettingKeys && stockNumberSettingKeys.length > 0) {
                let sql = "UPDATE product SET stock_number=? WHERE id=? limit 1";
                await ExecuteQ.Query(dbName, sql, [stock_number, productId])
            }

            callback(null, productId);
        }
    }
    catch (Err) {
        logger.debug("===Err!=", Err)
        sendResponse.somethingWentWrongError(res)
    }

}


function updateAreaWiseDeliveryCharges(dbName, res, newProductId, supplierId, branchId, callback) {
    var areaId;
    var dataTobeInserted;
    async.auto({
        one: function (cb) {
            getBranchAreas(dbName, res, branchId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    logger.debug("=======result in update area wise delivery charges =============", result)
                    areaId = result.toString();
                    console.log("area idssss#", areaId);
                    cb(null);
                }

            })
        },
        two: ['one', function (cb) {
            getDeliveryChargesOfBranchAreaWise(dbName, res, areaId, supplierId, function (err, result) {
                if (err) {
                    logger.debug("============error in getdelivery charges branch area wise==================")
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    logger.debug("=====NOT=======error in getdelivery charges branch area wise==================")

                    dataTobeInserted = result;
                    console.log("delivery charge data", dataTobeInserted)
                    cb(null);
                }
            });
        }],
        three: ['two', function (cb) {
            if (dataTobeInserted.length) {
                insertAreaBranchProductCharges(dbName, res, dataTobeInserted, newProductId, branchId, cb);
            }
            else {
                cb(null);
            }
        }]
    }, function (err, response) {
        if (err) {
            console.log("============errrrrrr================", err)
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null)
        }

    })

}



function insertAreaBranchProductCharges(dbName, res, dataTobeInserted, productId, branchId, callback) {
    console.log("pp", productId.length);
    console.log("paap", dataTobeInserted.length);
    var productIds = productId;
    var dataLength = dataTobeInserted.length;
    var queryString = "";
    var insertString = "(?,?,?,?,?,?),";
    var values = [];

    async.auto({
        setData: function (cb) {
            if (productIds.length) {
                for (var i = 0; i < productIds.length; i++) {
                    (function (i) {
                        for (var j = 0; j < dataLength; j++) {
                            (function (j) {
                                values.push(branchId, dataTobeInserted[j].area_id, productIds[i], dataTobeInserted[j].delivery_charges, dataTobeInserted[j].min_order, dataTobeInserted[j].charges_below_min_order);
                                queryString = queryString + insertString;
                                if (j == dataLength - 1 && i == productIds.length - 1) {
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
        insertData: ['setData', function (cb) {
            console.log("val...........", values)
            if (productIds.length) {
                var sql = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        console.log("err", err);
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
    }, function (err, result) {
        if (err) {
            console.log("================errrrrrrrrrrrr", err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    })
}


exports.updateProductNameInMultiLanguage = async function (dbName, res, names, descriptions,
    languages, measuringUnit, multiLanguageId, updation_request_id, by_supplier, is_update, callback) {
    var languageLength = multiLanguageId.length;
    console.log("......multi....", multiLanguageId);
    console.log(".....name..", names);
    console.log("....desc...", descriptions);
    console.log(".....mea..", measuringUnit);

    console.log(".update proudct id ............................", names[0], descriptions[0], measuringUnit[0], multiLanguageId[0], updation_request_id);

    console.log("......lengh.", languageLength);

    let vendorApprovalCheck = await ExecuteQ.Query(dbName, "select `key`,value from tbl_setting where `key`=? and value=1", ["enable_updation_vendor_approval"]);

    if (vendorApprovalCheck && vendorApprovalCheck.length > 0 && parseInt(by_supplier) == 1) {
        if (multiLanguageId && multiLanguageId.length > 0 && parseInt(is_update) !== 0) {
            // for (var i = 0; i < multiLanguageId.length; i++){
            //     (async function (i) {
            //         console.log("if...........",i);

            let sql = "update supplier_updation_request_product_ml set name = ?,product_desc = ?,measuring_unit = ? where updation_request_id = ? and language_id=14 limit 1";
            await ExecuteQ.Query(dbName, sql, [names[0], descriptions[0], measuringUnit[0], updation_request_id])

            let sql2 = "update supplier_updation_request_product_ml set name = ?,product_desc = ?,measuring_unit = ? where updation_request_id = ? and language_id=15 limit 1";
            await ExecuteQ.Query(dbName, sql2, [names[1], descriptions[1], measuringUnit[1], updation_request_id])

            // if (i == languageLength - 1) {
            //     callback(null);
            // }
            //     }(i))
            // } 
            callback(null);
        } else {

            let sql = "insert into supplier_updation_request_product_ml  ( name ,product_desc ,measuring_unit,language_id, updation_request_id) values(?,?,?,?,?)";
            await ExecuteQ.Query(dbName, sql, [names[0], descriptions[0], measuringUnit[0], 14, updation_request_id]);

            let sql2 = "insert into supplier_updation_request_product_ml ( name ,product_desc ,measuring_unit,language_id, updation_request_id) values(?,?,?,?,?)";
            await ExecuteQ.Query(dbName, sql2, [names[1], descriptions[1], measuringUnit[1], 15, updation_request_id]);
            callback(null);
        }
    } else {
        for (var i = 0; i < languageLength; i++) {
            (async function (i) {
                console.log("if...........", i);
                var sql = "update product_ml set name = ?,product_desc = ?,measuring_unit = ? where id = ? limit 1";
                await ExecuteQ.Query(dbName, sql, [names[i], descriptions[i], measuringUnit[i], multiLanguageId[i]])
                if (i == languageLength - 1) {
                    callback(null);
                }
            }(i))

        }
    }
}



exports.deleteProductImagesOrder = async function (dbName, res, productId, order, by_supplier, callback) {
    var len = order.length;
    if (len == 0) {
        callback(null)
    }
    console.log("=======order===========", order, len)
    let vendorApprovalCheck = await ExecuteQ.Query(dbName, "select `key`,value from tbl_setting where `key`=? and value=1", ["enable_updation_vendor_approval"]);

    if (vendorApprovalCheck && vendorApprovalCheck.length > 0 && parseInt(by_supplier) == 1) {
        for (var i = 0; i < len; i++) {
            (async function (i) {
                async.auto({
                    productOrder: async function (cb) {
                        var sql = "delete from product_image_updation_request where update_request_id = ? and imageOrder = ? ";
                        await ExecuteQ.Query(dbName, sql, [productId, order[i]]);
                        cb(null);
                    },
                    defaultOrder: async function (cb) {
                        var sql = "delete from product_image_updation_request where update_request_id = ? and 	default_image = ? and imageOrder = 0";
                        await ExecuteQ.Query(dbName, sql, [productId, 1]);
                        cb(null);
                    }
                }, function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        if (i == (len - 1)) {
                            callback(null)
                        }
                    }
                })
            }(i));
        }
    } else {
        for (var i = 0; i < len; i++) {
            (async function (i) {
                async.auto({
                    productOrder: async function (cb) {
                        var sql = "delete from product_image where product_id = ? and imageOrder = ? ";
                        await ExecuteQ.Query(dbName, sql, [productId, order[i]])
                        cb(null);
                    },
                    defaultOrder: async function (cb) {
                        var sql = "delete from product_image where product_id = ? and 	default_image = ? and imageOrder = 0";
                        await ExecuteQ.Query(dbName, sql, [productId, 1]);
                        cb(null);
                    }
                }, function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        if (i == (len - 1)) {
                            callback(null)
                        }
                    }
                })
            }(i));
        }
    }
}

function deleteProductImages(res, productId, callback) {
    var sql = "delete from product_image where product_id = ?";
    multiConnection[dbName].query(sql, [productId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null);
        }

    })

}

function getDeliveryChargesOfBranchAreaWise(dbName, res, areaId, supplierId, callback) {
    logger.debug("=====================areaId================", areaId);
    var areaIds = areaId != undefined && areaId != "" ? areaId : 0
    var sql = "select area_id,delivery_charges,min_order,charges_below_min_order from supplier_delivery_areas where area_id IN (" + areaIds + ") and is_deleted = ? and supplier_id = ?"
    // console.log("khbfd",sql);
    var stmt = multiConnection[dbName].query(sql, [0, supplierId], function (err, result2) {
        if (err) {
            logger.debug("==============error in get delivery charges of branch=============", stmt.sql, err)
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, result2);
        }
    })
}


function getBranchAreas(dbName, res, branchId, callback) {
    var sql = "select area_id from supplier_branch_delivery_areas where supplier_branch_id = ? and is_deleted = ?"
    var stmt = multiConnection[dbName].query(sql, [branchId, 0], function (err, result) {
        logger.debug("===========result in get branch areas ============", result, stmt.sql)
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

function listBranchAreas(dbName, res, branchId, callback) {
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

function listOfProductsCategoryWise(res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, callback) {








    async.waterfall([
        function (cb) {
            listSupplierCategoryProductDetails(res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, cb);
        },
        function (products, id, cb) {
            if (products.length) {
                productImages(req.dbName, res, products, id, cb);
            }
            else {
                cb(null, []);
            }
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


function listSupplierCategoryProductDetails(res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, callback) {
    var id = [];
    var sql = "select p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package," +
        " p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  " +
        " from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit";
    sql += " where p.is_global = 1 and p.is_deleted = 0 and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ";
    multiConnection[dbName].query(sql, [categoryId, subCategoryId, detailedSubCategoryId], function (err, products) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select p.id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc from product_ml p join language l on p.language_id = l.id where ";
            multiConnection[dbName].query(sql2, function (err, productMultiLanguage) {
                if (err) {
                    console.log(err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    //  console.log(JSON.stringify(productMultiLanguage));
                    var productLength = products.length;
                    var languageLength = productMultiLanguage.length;

                    if (!productLength) {
                        callback(null, [])
                    }
                    else {
                        for (var i = 0; i < productLength; i++) {
                            (function (i) {
                                var names = [];
                                id.push(products[i].id)
                                for (var j = 0; j < languageLength; j++) {
                                    (function (j) {
                                        if (products[i].id == productMultiLanguage[j].product_id) {
                                            names.push({
                                                "product_multi_id": productMultiLanguage[j].id,
                                                "name": productMultiLanguage[j].name,
                                                "langauge_id": productMultiLanguage[j].language_id,
                                                "language_name": productMultiLanguage[j].language_name,
                                                "product_desc": productMultiLanguage[j].product_desc
                                            });
                                            if (j == languageLength - 1) {
                                                products[i].names = names;
                                                if (i == productLength - 1) {
                                                    callback(null, products, id);
                                                }
                                            }
                                        }
                                        else {
                                            if (j == languageLength - 1) {
                                                products[i].names = names;
                                                if (i == productLength - 1) {
                                                    callback(null, products, id);
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


function listSuppliersBranchesForAssigningProducts(dbName, res, branchId, callback) {
    var sql = "select id,name,branch_name from supplier_branch where is_deleted = ? and supplier_id = ?"
    multiConnection[dbName].query(sql, [0, branchId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, result);
        }

    })

}


exports.listSupplierBranchProducts = function (dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, callback) {
    var products, id, data, data1;
    async.auto({
        listSupplierProductDetails: function (cb) {

            listSupplierBranchProductDetails(dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, function (err, result, result1) {
                if (err) {
                    console.log("err..", err)
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    products = result;
                    id = result1;
                    cb(null);
                }
            });
        },
        productImage: ["listSupplierProductDetails", function (cb) {
            productImages(dbName, res, products, id, function (err, result) {
                if (err) {
                    console.log("err1..", err)
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    data1 = result;
                    cb(null);
                }
            });
        }],
        productVariant: ["productImage", function (cb) {
            var len = data1.length;
            if (data1.length) {
                // var len = productIds.length;
                for (var i = 0; i < len; i++) {
                    (async function (i) {
                        var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
                        let vData = await ExecuteQ.Query(dbName, vsql, [data1[i].id]);
                        // multiConnection[dbName].query(vsql, [data1[i].id],function(err,vData) {
                        data1[i].variant = vData;
                        // productIds[i].variant = vData;
                        if (i == (len - 1)) {
                            cb(null)
                        }
                        // })

                    }(i));
                }
            } else {
                cb(null)
            }
        }],
        promotionCheck: ['productVariant', function (cb) {
            promotionsCheck(dbName, res, data1, branchId, function (err, result) {
                if (err) {
                    console.log("err2..", err);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    data = result;
                    cb(null);
                }
            });

        }]
    }, function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, data);
        }

    })
    /* async.waterfall([
             function (cb) {
                 listSupplierBranchProductDetails(res, branchId, categoryId, subCategoryId, detailedSubCategoryId, cb);
             },
             function (products,id, cb) {
                // console.log("bkaasdasa",products.length)
                 if(products.length){
                     productImages(res, products,id, cb);
                 }
                 else {
                     cb(null,[]);
                 }
 
             },
             function (products, cb) {
                 if(products.length){
                     promotionsCheck(res, products, branchId, cb);
                 }
                 else {
                     cb(null,[]);
                 }
             }
         ], function (err, response) {
 
             if (err) {
                 sendResponse.somethingWentWrongError(res)
             }
             else {
               //  console.log("aaaaaaaa",response)
                 callback(null, response);
             }
 
         }
     )*/
}
exports.listSupplierBranchProductsV1 = function (dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, tags, callback) {
    var products, id, data, data1;
    async.auto({

        listSupplierProductDetails: function (cb) {

            listSupplierBranchProductDetailsV1(dbName, res, branchId, categoryId,
                subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, tags, function (err, result, result1) {
                    if (err) {
                        console.log("err..", err)
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        products = result;
                        id = result1;
                        cb(null);
                    }
                });
        },
        productImage: ["listSupplierProductDetails", function (cb) {
            productImages(dbName, res, products, id, function (err, result) {
                if (err) {
                    console.log("err1..", err)
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    data1 = result;
                    cb(null);
                }
            });
        }],
        productVariant: ["productImage", function (cb) {
            var len = data1.length;
            if (data1.length) {
                // var len = productIds.length;
                for (var i = 0; i < len; i++) {
                    (async function (i) {
                        var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
                        let vData = await ExecuteQ.Query(dbName, vsql, [data1[i].id]);
                        // multiConnection[dbName].query(vsql, [data1[i].id],function(err,vData) {
                        data1[i].variant = vData;
                        // productIds[i].variant = vData;
                        if (i == (len - 1)) {
                            cb(null)
                        }
                        // })

                    }(i));
                }
            } else {
                cb(null)
            }
        }],
        promotionCheck: ['productVariant', function (cb) {
            promotionsCheck(dbName, res, data1, branchId, function (err, result) {
                if (err) {
                    console.log("err2..", err);
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    data = result;
                    cb(null);
                }
            });

        }]
    }, function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, data);
        }

    })
    /* async.waterfall([
             function (cb) {
                 listSupplierBranchProductDetails(res, branchId, categoryId, subCategoryId, detailedSubCategoryId, cb);
             },
             function (products,id, cb) {
                // console.log("bkaasdasa",products.length)
                 if(products.length){
                     productImages(res, products,id, cb);
                 }
                 else {
                     cb(null,[]);
                 }
 
             },
             function (products, cb) {
                 if(products.length){
                     promotionsCheck(res, products, branchId, cb);
                 }
                 else {
                     cb(null,[]);
                 }
             }
         ], function (err, response) {
 
             if (err) {
                 sendResponse.somethingWentWrongError(res)
             }
             else {
               //  console.log("aaaaaaaa",response)
                 callback(null, response);
             }
 
         }
     )*/
}

async function listSupplierBranchProductDetails(dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, callback) {
    try {
        var id = [];



        // Adding productCustomTabDescriptionLabel per supplier
        let tblSettingSql = "";
        const settingDataKeys = await func.getSettingDataKeyAndValue(dbName, ['isProductCustomTabDescriptionEnable']);
        settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable = !!settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable;
        if (settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable === true) {
            tblSettingSql = "p.customTabDescription1,p.customTabDescription2,";
        }

        let stock_number_query = ""
        const stock_keys = await func.getSettingDataKeyAndValuev1(dbName, ['enable_stock_number']);
        stock_keys.keyAndValue.enable_stock_number = !!stock_keys.keyAndValue.enable_stock_number;
        if (stock_keys.keyAndValue.enable_stock_number === true) {
            stock_number_query = "p.stock_number,";
        }
        let grade_query = ""
        const grade_keys = await func.getSettingDataKeyAndValuev2(dbName, ['enable_grading']);
        grade_keys.keyAndValue.enable_grading = !!grade_keys.keyAndValue.enable_grading;
        if (grade_keys.keyAndValue.enable_grading === true) {
            grade_query = "p.grade,";
        }


        let approvalQuery = "";
        const approval_keys = await func.getSettingDataKeyAndValuev4(dbName, ['product_approved_by_admin']);
        approval_keys.keyAndValue.product_approved_by_admin = !!approval_keys.keyAndValue.product_approved_by_admin;
        if (approval_keys.keyAndValue.product_approved_by_admin === true) {
            approvalQuery = "p.approved_by_admin,";

        }

        if (serachType == 0) {
            var sql = "select " + grade_query + "" + stock_number_query + " " + approvalQuery + " " + tblSettingSql + "p.quantity,IF((select count(*) from product where product.parent_id=p.id and product.is_deleted=0)>0,1,0) as is_variant,p.pricing_type,(p.quantity-p.purchased_quantity) as left_quantity,p.purchased_quantity,p.special_instructions,p.calories,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.making_price,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
            sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr ";
            sql += " on curr.id = p.price_unit  where p.parent_id=? and sp.supplier_branch_id = ? and sp.is_deleted = ?  and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? limit ?,?";

        }
        else {
            var sql = "select " + grade_query + "" + stock_number_query + " " + approvalQuery + " " + tblSettingSql + "p.quantity,IF((select count(*) from product where product.parent_id=p.id)>0,1,0) as is_variant,p.pricing_type,(p.quantity-p.purchased_quantity) as left_quantity,p.purchased_quantity,br.id as brand_id,br.name as brand_name,p.special_instructions,p.calories,br.image as brand_image,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.making_price,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp ";
            sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr ";
            sql += " on curr.id = p.price_unit where p.parent_id=? and sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? " +
                "and (p.id LIKE '%" + serachText + "%' or p.bar_code LIKE '%" + serachText + "%' or p.name LIKE '%" + serachText + "%'" +
                " or p.sku LIKE '%" + serachText + "%' or p.product_desc LIKE '%" + serachText + "%' or c.name LIKE '%" + serachText + "%'  or c.name LIKE '%" + serachText + "%')  ORDER BY p.id DESC LIMIT ?,?";

        }
        let products = await ExecuteQ.Query(dbName, sql, [0, branchId, 0, categoryId, subCategoryId, detailedSubCategoryId, offset, limit]);

        // multiConnection[dbName].query(sql, [0,branchId,0,categoryId,subCategoryId,detailedSubCategoryId,offset,limit], function (err, products) {

        //     if (err) {
        //         console.log("err.....",err);
        //         sendResponse.somethingWentWrongError(res);
        //     }
        //     else {
        if (products.length) {
            var sql2 = "select p.id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit from " +
                "product_ml p join language l on p.language_id = l.id join supplier_branch_product sp on sp.product_id = " +
                "p.product_id  where sp.is_deleted = 0 and sp.supplier_branch_id =?  and sp.category_id = ? and " +
                "sp.sub_category_id = ? and sp.detailed_sub_category_id = ?";
            let productMultiLanguage = await ExecuteQ.Query(dbName, sql2, [branchId, categoryId, subCategoryId, detailedSubCategoryId]);

            // multiConnection[dbName].query(sql2,[branchId, categoryId, subCategoryId, detailedSubCategoryId], function (err, productMultiLanguage) {
            //     if (err) {
            //         console.log("err.....",err);
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
            var productLength = products.length;
            var languageLength = productMultiLanguage.length;

            if (!productLength) {
                callback(null, [])
            }
            else {
                for (var i = 0; i < productLength; i++) {
                    (function (i) {
                        var names = [];
                        id.push(products[i].id);
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
                                            callback(null, products, id);
                                        }
                                    }
                                }
                                else {
                                    if (j == languageLength - 1) {
                                        products[i].names = names;
                                        if (i == productLength - 1) {
                                            callback(null, products, id);
                                        }
                                    }
                                }

                            }(j))

                        }

                    }(i))

                }
            }

            // }
            // })
        }
        else {
            callback(null, [], id);
        }
        //     }

        // })
    }
    catch (Err) {
        logger.debug("===listSupplierBranchProductDetails=", Err)
        sendResponse.somethingWentWrongError(res);
    }

}
async function listSupplierBranchProductDetailsV1(dbName, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, tags, callback) {

    try {

        var id = [];

        // Adding productCustomTabDescriptionLabel per supplier
        let tblSettingSql = "";
        const settingDataKeys = await func.getSettingDataKeyAndValue(dbName, ['isProductCustomTabDescriptionEnable']);
        settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable = !!settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable;
        if (settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable === true) {
            tblSettingSql = "p.customTabDescription1,p.customTabDescription2,";
        }

        let stock_number_query = ""
        const stock_keys = await func.getSettingDataKeyAndValuev1(dbName, ['enable_stock_number']);
        stock_keys.keyAndValue.enable_stock_number = !!stock_keys.keyAndValue.enable_stock_number;
        if (stock_keys.keyAndValue.enable_stock_number === true) {
            stock_number_query = "p.stock_number,";
        }
        let grade_query = ""
        const grade_keys = await func.getSettingDataKeyAndValuev2(dbName, ['enable_grading']);
        grade_keys.keyAndValue.enable_grading = !!grade_keys.keyAndValue.enable_grading;
        if (grade_keys.keyAndValue.enable_grading === true) {
            grade_query = "p.grade,";
        }



        let approvalQuery = "";
        const approval_keys = await func.getSettingDataKeyAndValuev4(dbName, ['product_approved_by_admin']);
        approval_keys.keyAndValue.product_approved_by_admin = !!approval_keys.keyAndValue.product_approved_by_admin;
        if (approval_keys.keyAndValue.product_approved_by_admin === true) {
            approvalQuery = "p.approved_by_admin,";

        }


        var qr = "";
        if (tags != "") {
            qr = " and find_in_set('" + tags + "',p.product_tags) "
        }

        if (serachType == 0) {
            var sql = "SELECT temp.*,IF(vv.parent_id,1,0) as is_variant from (select " + grade_query + " " + stock_number_query + " " + approvalQuery + " " + tblSettingSql + "sp.recipe_pdf, p.tax_exempt, p.special_instructions,p.is_supplier_product_approved,p.is_appointment,p.is_non_veg,p.purchase_limit,p.allergy_description,p.is_allergy_product,p.is_subscription_required,p.calories,p.country_of_origin,p.Size_chart_url,p.item_unavailable,p.payment_after_confirmation,p.cart_image_upload,c.type,(p.quantity-p.purchased_quantity) as left_quantity,p.is_prescribed,s.commission as supplier_commission,p.interval_flag,p.interval_value, p.making_price,p.product_tags,p.quantity,p.purchased_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.pricing_type,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name,sp.order_no from supplier_branch_product sp ";
            sql += " join product p on sp.product_id = p.id left join supplier_branch sb on sp.supplier_branch_id=sb.id left join supplier s on sb.supplier_id=s.id left join brands br on br.id=p.brand_id and br.deleted_by= 0 join categories c on c.id = p.category_id left join currency_conversion curr ";
            sql += " on curr.id = p.price_unit  where p.parent_id=? and sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ?  and sp.detailed_sub_category_id = ?  " + qr + " order by sp.order_no limit ?,?) as temp left join (select pv.parent_id from product pv where pv.is_deleted=0 GROUP by pv.parent_id) vv on temp.id=vv.parent_id ";

        }
        else {
            var sql = "SELECT temp.*,IF(vv.parent_id,1,0) as is_variant from (select " + grade_query + " " + stock_number_query + " " + approvalQuery + " sp.recipe_pdf,p.tax_exempt,p.Size_chart_url,p.special_instructions,p.is_supplier_product_approved,p.is_appointment,p.is_non_veg,p.purchase_limit,p.allergy_description,p.is_allergy_product,p.is_subscription_required,p.calories,p.country_of_origin,p.payment_after_confirmation,p.item_unavailable,p.cart_image_upload,(p.quantity-p.purchased_quantity) as left_quantity,c.type,s.commission as supplier_commission,p.interval_flag,p.interval_value, p.making_price,p.product_tags,p.is_prescribed,p.quantity,p.purchased_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.name,p.id,p.pricing_type,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name,sp.order_no from supplier_branch_product sp ";
            sql += " join product p on sp.product_id = p.id left join supplier_branch sb on sp.supplier_branch_id=sb.id left join supplier s on sb.supplier_id=s.id left join brands br on br.id=p.brand_id and br.deleted_by= 0 join categories c on c.id = p.category_id left join currency_conversion curr ";
            sql += " on curr.id = p.price_unit  where p.parent_id=? and sp.supplier_branch_id = ? and sp.is_deleted = ?   and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? " +
                "and (p.id LIKE '%" + serachText + "%' or p.bar_code LIKE '%" + serachText + "%' or p.name LIKE '%" + serachText + "%'" +
                " or p.sku LIKE '%" + serachText + "%' or p.product_desc LIKE '%" + serachText + "%' or c.name LIKE '%" + serachText + "%'  or c.name LIKE '%" + serachText + "%') " + qr + " ORDER BY sp.order_no,p.id DESC LIMIT ?,?) as temp left join (select pv.parent_id from product pv where pv.is_deleted=0 GROUP by pv.parent_id) vv on temp.id=vv.parent_id ";

        }
        let products = await ExecuteQ.Query(dbName, sql, [0, branchId, 0, categoryId, subCategoryId, detailedSubCategoryId, offset, limit]);

        // let stmt =  multiConnection[dbName].query(sql, [0,branchId,0,categoryId,subCategoryId,detailedSubCategoryId,offset,limit], function (err, products) {
        //     logger.debug("=========list supplier branch products query =======",stmt.sql)
        //      if (err) {
        //          console.log("err.....",err);
        //          sendResponse.somethingWentWrongError(res);
        //      }
        //      else {
        if (products.length) {
            var sql2 = "select sp.recipe_pdf, p.id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit from " +
                "product_ml p join language l on p.language_id = l.id join supplier_branch_product sp on sp.product_id = " +
                "p.product_id  where sp.is_deleted = 0 and sp.supplier_branch_id =?  and sp.category_id = ?  " +
                "and sp.detailed_sub_category_id = ?";

            let productMultiLanguage = await ExecuteQ.Query(dbName, sql2, [branchId, categoryId, detailedSubCategoryId]);

            //  multiConnection[dbName].query(sql2,[branchId, categoryId, subCategoryId, detailedSubCategoryId], function (err, productMultiLanguage) {
            //     if (err) {
            //          console.log("err.....",err);
            //          sendResponse.somethingWentWrongError(res);
            //      }
            //      else {
            var productLength = products.length;
            var languageLength = productMultiLanguage.length;

            if (!productLength) {
                callback(null, [])
            }
            else {
                for (var i = 0; i < productLength; i++) {
                    (function (i) {
                        var names = [];
                        id.push(products[i].id);
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
                                            callback(null, products, id);
                                        }
                                    }
                                }
                                else {
                                    if (j == languageLength - 1) {
                                        products[i].names = names;
                                        if (i == productLength - 1) {
                                            callback(null, products, id);
                                        }
                                    }
                                }

                            }(j))

                        }

                    }(i))

                }
            }

            //      }
            //  })
        }
        else {
            callback(null, [], id);
        }
        //      }

        //  })
    }
    catch (Err) {
        logger.debug("==listSupplierBranchProductDetailsV1===Err!==>>", Err);
        sendResponse.somethingWentWrongError(res);
    }

}

async function promotionsCheck(dbName, res, products, branchId, callback) {
    try {
        if (products.length) {
            var sql = "select id,offer_product_value,promotion_type from supplier_branch_promotions where supplier_branch_id = ? and is_deleted = ? and "
            sql += " start_date<=CURDATE() and end_date >= CURDATE() and (promotion_type = 1 or promotion_type = 2 )";
            let response = await ExecuteQ.Query(dbName, sql, [branchId, 0]);
            //  multiConnection[dbName].query(sql, [branchId, 0], function (err, response) {
            //      if (err) {
            //          sendResponse.somethingWentWrongError(res)
            //      }
            //  else
            //  {
            //console.log("uiehtrre",response);
            var promotionLength = response.length;
            for (var i = 0; i < products.length; i++) {
                (function (i) {
                    var buy_x_get_x = 0;
                    var buy_x_get_y = 0;
                    if (promotionLength) {
                        for (var j = 0; j < promotionLength; j++) {
                            (function (i) {
                                if (products[i].id == response[j].offer_product_value) {
                                    if (response[j].promotion_type == 1) {
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
            //  }

            //  })
        }
        else {
            callback(null, []);
        }
    }
    catch (Err) {
        logger.debug("=promotionsCheck==ERR!=", Err)
        sendResponse.somethingWentWrongError(res)
    }


}


function changeProductStatus(dbName, res, productId, status, callback) {
    var sql = "update product set is_live = ? where id IN (" + productId + ")";
    multiConnection[dbName].query(sql, [status], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null);
        }

    })

}


function deleteProductPricing(dbName, res, productPricingId, callback) {
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


function deleteProductPricingNew(dbName, res, productPricingId) {
    return new Promise((resolve, reject) => {
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


async function listSuppliersForAssigningProducts(dbName, res, callback) {
    try {
        var sql = "select id,name,pricing_level from supplier where is_deleted = ?";
        let suppliers = await ExecuteQ.Query(dbName, sql, [0]);
        callback(null, suppliers);
    }
    catch (Err) {
        logger.debug("===Err!==", Err)
        sendResponse.somethingWentWrongError(res)
    }
}


function listProductPriceDetails(dbName, res, productId, type, id, callback) {
    if (type == 0) {
        var sql = "select * from product_pricing where product_id = ? and is_deleted = ? "
        multiConnection[dbName].query(sql, [productId, 0], function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                //     console.log("res       product princoinmg",result);
                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        (function (i) {
                            if (result[i].pricing_type) {
                                result[i].price = JSON.parse(result[i].price)
                                if (i == result.length - 1) {
                                    callback(null, result)
                                }
                            }
                            else {
                                if (i == result.length - 1) {
                                    callback(null, result)
                                }
                            }
                        }(i))
                    }
                }
                else {
                    callback(null, result)
                }
            }

        })
    }
    else if (type == 1) {
        var sql = "SELECT p.id,p.product_id,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier, ";
        sql += " p.can_urgent,p.urgent_value as urgent_price,p.house_cleaning_price,p.beauty_saloon_price,p.price_type,p.urgent_type, ";
        sql += " p.delivery_charges,p.pricing_type from product_pricing p join supplier_product s on p.product_id = s.product_id where ";
        sql += " s.supplier_id = ? and p.is_deleted = ? and p.product_id = ? and s.is_deleted = ? and p.is_deleted =? " +
            " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
        multiConnection[dbName].query(sql, [id, 0, productId, 0, 0], function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                //   console.log("res",result);
                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        (function (i) {
                            if (result[i].pricing_type) {
                                result[i].price = JSON.parse(result[i].price)
                                if (i == result.length - 1) {
                                    callback(null, result)
                                }
                            }
                            else {
                                if (i == result.length - 1) {
                                    callback(null, result)
                                }
                            }
                        }(i))
                    }
                }
                else {
                    callback(null, result)
                }
            }

        })

    }
    else {

        var sql = "SELECT p.id,p.product_id,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier, ";
        sql += " p.can_urgent,p.urgent_value as urgent_price,p.house_cleaning_price,p.beauty_saloon_price,p.price_type,p.urgent_type, ";
        sql += " p.delivery_charges,p.pricing_type from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
        sql += " s.supplier_branch_id = ? and p.is_deleted = ? and p.product_id = ? and s.is_deleted = ? " +
            " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0)) ";
        multiConnection[dbName].query(sql, [id, 0, productId, 0], function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var sql2 = "select b.area_id,b.delivery_charges,b.min_order,b.charges_below_min_order,a.name from ";
                sql2 += " supplier_branch_area_product b join area a on b.area_id = a.id where b.product_id = ? and b.is_deleted = ? and b.supplier_branch_id = ? ";
                multiConnection[dbName].query(sql2, [productId, 0, id], function (err, result5) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {

                        if (!result.length) {
                            callback(null, [])
                        }
                        else {
                            for (var i = 0; i < result.length; i++) {
                                (function (i) {
                                    result[i].areas = result5;
                                    //console.log("kbjsdk",typeof (result[i].price));
                                    if (result[i].pricing_type) {
                                        result[i].price = JSON.parse(result[i].price)
                                        if (i == result.length - 1) {
                                            callback(null, result)
                                        }
                                    }
                                    else {
                                        //console.log("else",result[i].price)
                                        if (i == result.length - 1) {
                                            callback(null, result)
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


}


async function insertProduct(dbName, res, is_prescribed, adminId, categoryId, subCategoryId, detailedSubCategoryId, name, priceUnit, description, sku, barCode, commission, commissionType, commissionPackage, measuringUnit, pricing_type, quantity, parent_id, brand_id, is_product, duration, interval_flag, interval_value, making_price, product_tags, api_version, payment_after_confirmation, cart_image_upload, callback) {
    logger.debug("=============brandid====================", brand_id)
    var sql = "insert into product(cart_image_upload,payment_after_confirmation,is_prescribed,name,price_unit,bar_code,product_desc,sku,category_id,is_global,created_by,commission,commission_type,commission_package,measuring_unit,pricing_type,is_live,quantity,parent_id,brand_id,is_product,duration) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    var params = [cart_image_upload, payment_after_confirmation, is_prescribed, name, priceUnit, barCode, description, sku, detailedSubCategoryId, 1, adminId, commission, commissionType, commissionPackage, measuringUnit, pricing_type, 1, quantity, parent_id, brand_id, is_product, duration];

    if (api_version >= 1) {
        var sql = "insert into product(cart_image_upload,payment_after_confirmation,is_prescribed,name,price_unit,bar_code,product_desc,sku,category_id,is_global,created_by,commission,commission_type,commission_package,measuring_unit,pricing_type,is_live,quantity,parent_id,brand_id,is_product,duration,interval_flag,interval_value,making_price,product_tags) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        var params = [cart_image_upload, payment_after_confirmation, is_prescribed, name, priceUnit, barCode, description, sku, detailedSubCategoryId, 1, adminId, commission, commissionType, commissionPackage, measuringUnit, pricing_type, 1, quantity, parent_id, brand_id, is_product, duration, interval_flag, interval_value, making_price, product_tags];
        await ExecuteQ.Query(dbName, sql, params);
    }

    try {
        let result = await ExecuteQ.Query(dbName, sql, params);
        callback(null, result.insertId);
    }
    catch (Err) {
        logger.debug("==insertProduct=Err!", Err);
        sendResponse.somethingWentWrongError(res);
    }
    // multiConnection[dbName].query(sql,params, function (err, result) {
    //     if (err) {
    //         console.log(err)
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null, result.insertId);

    //     }

    // })

}


function insertProductBySupplier(dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, name, priceUnit, description, sku, barCode, commission, commissionType, commissionPackage, measuringUnit, pricing_type, quantity, parent_id, brand_id, is_product, duration, interval_flag, interval_value, api_version, is_driver, making_price, product_tags, callback) {
    var sql = "insert into product(name,price_unit,bar_code,product_desc,sku,category_id,is_global,created_by,added_by,commission,commission_type,commission_package,measuring_unit,is_live,pricing_type,quantity,parent_id,brand_id,is_product,duration) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    var params = [name, priceUnit, barCode, description, sku, categoryId, 0, supplierId, 1, commission, commissionType, commissionPackage, measuringUnit, 1, pricing_type, quantity, parent_id, brand_id, is_product, duration];

    if (api_version >= 1) {
        var sql = "insert into product(name,price_unit,bar_code,product_desc,sku,category_id,is_global,created_by,added_by,commission,commission_type,commission_package,measuring_unit,is_live,pricing_type,quantity,parent_id,brand_id,is_product,duration,interval_flag,interval_value,making_price,product_tags) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        var params = [name, priceUnit, barCode, description, sku, categoryId, 0, supplierId, 1, commission, commissionType, commissionPackage, measuringUnit, 1, pricing_type, quantity, parent_id, brand_id, is_product, duration, interval_flag, interval_value, making_price, product_tags];

    }
    multiConnection[dbName].query(sql, params, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result.insertId);
        }

    });
}


async function insertProductBySupplierBranch(dbName, is_prescribed, res, branchId, categoryId, subCategoryId, detailedSubCategoryId, name, priceUnit, description, sku, barCode, commission, commissionType, commissionPackage, measuringUnit,
    pricing_type, quantity, parent_id, brand_id, is_product, duration, interval_flag, interval_value, making_price, product_tags, api_version,
    is_driver, payment_after_confirmation, cart_image_upload,
    item_unavailable, Size_chart_url, country_of_origin, purchase_limit,
    is_subscription_required, allergy_description, is_allergy_product,
    is_non_veg, is_appointment, special_instructions, calories, tax_exempt, callback) {

    try {
        var sql = "insert into product(country_of_origin,Size_chart_url,payment_after_confirmation,cart_image_upload,is_prescribed,name,price_unit,bar_code,product_desc,sku,category_id,is_global,created_by,added_by,commission,commission_type,commission_package,measuring_unit,is_live,pricing_type,quantity,parent_id,brand_id,is_product,duration,purchase_limit,is_subscription_required,allergy_description,is_allergy_product,is_non_veg,special_instructions,calories,tax_exempt) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        var params = [country_of_origin, Size_chart_url,
            payment_after_confirmation, cart_image_upload,
            is_prescribed, name, priceUnit, barCode, description,
            sku, detailedSubCategoryId, 0, branchId, 2, commission,
            commissionType, commissionPackage, measuringUnit, 1,
            pricing_type, quantity, parent_id, brand_id, is_product,
            duration, purchase_limit, is_subscription_required,
            allergy_description, is_allergy_product, is_non_veg, special_instructions, calories, tax_exempt]
        if (api_version == 1) {
            sql = "insert into product(country_of_origin,Size_chart_url,payment_after_confirmation,cart_image_upload,is_prescribed,name,price_unit,bar_code,product_desc,sku,category_id,is_global,created_by,added_by,commission,commission_type,commission_package,measuring_unit,is_live,pricing_type,quantity,parent_id,brand_id,is_product,duration,interval_flag,interval_value,making_price,product_tags,item_unavailable,purchase_limit,is_subscription_required,allergy_description,is_allergy_product,is_non_veg,is_appointment,special_instructions,calories,tax_exempt) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
            params = [country_of_origin, Size_chart_url,
                payment_after_confirmation, cart_image_upload,
                is_prescribed, name, priceUnit, barCode, description,
                sku, detailedSubCategoryId, 0, branchId, 2, commission,
                commissionType, commissionPackage, measuringUnit, 1,
                pricing_type, quantity, parent_id, brand_id, is_product,
                duration, interval_flag, interval_value, making_price,
                product_tags, item_unavailable, purchase_limit,
                is_subscription_required, allergy_description,
                is_allergy_product, is_non_veg, is_appointment, special_instructions, calories, tax_exempt]
        }
        let result = await ExecuteQ.Query(dbName, sql, params);
        console.log("--Exit--")
        callback(null, result.insertId);
    }
    catch (Err) {
        logger.debug("===Err!==", Err)
        sendResponse.somethingWentWrongError(res);
    }
}

function getProductImages(dbName, res, productId, callback) {
    var sql = "select image_path,imageOrder from product_image where product_id=?"
    multiConnection[dbName].query(sql, [productId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        } else {
            callback(null, result)
        }
    })
}

function insertProductNameInMultiLanguage(dbName, res, productId, names, descriptions, languages, measuringUnit, callback) {
    var values = [];
    var queryString = "(?,?,?,?,?),";
    var insertString = "";
    for (var i = 0; i < names.length; i++) {
        (async function (i) {
            values.push(productId, names[i], languages[i], descriptions[i], measuringUnit[i]);
            insertString = insertString + queryString;
            if (i == names.length - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
                try {
                    var sql = "insert into product_ml(product_id,name,language_id,product_desc,measuring_unit) values " + insertString;
                    let result = await ExecuteQ.Query(dbName, sql, values, []);
                    callback(null);
                }
                catch (Err) {
                    logger.debug("===Err!==", Err)
                    sendResponse.somethingWentWrongError(res);
                }
                // var sql = "insert into product_ml(product_id,name,language_id,product_desc,measuring_unit) values " + insertString;
                // multiConnection[dbName].query(sql, values, function (err, result) {
                //     if (err) {
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else {
                //         console.log("FINAL==CB",result)
                //         callback(null);
                //     }

                // })
            }

        }(i))
    }
}
async function insertProductVarints(dbName, res, variant_id, callback) {
    try {
        var sql = "insert into product_variants(`product_id`,`variant_id`,`parent_id`) values ?";
        await ExecuteQ.Query(dbName, sql, [variant_id]);
        callback(null);
    }
    catch (Err) {
        logger.debug("===Err!!!=", Err)
        sendResponse.somethingWentWrongError(res);
    }

    // multiConnection[dbName].query(sql, [variant_id], function (err, result) {
    //     if (err) {
    //         console.log(err)
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null);
    //     }
    // })
}


function insertProductImages(dbName, res, imageName, productId, callback) {
    var values = [];
    var queryString = "(?,?,?),";
    var insertString = "";

    if (imageName && imageName.length == 0) {
        callback(null, 0);
    }

    for (var i = 0; i < imageName.length; i++) {
        (async function (i) {
            values.push(productId, imageName[i].image, imageName[i].order);
            insertString = insertString + queryString;
            if (i == (imageName.length - 1)) {
                try {
                    insertString = insertString.substring(0, insertString.length - 1);
                    var sql = "insert into product_image(product_id,image_path,imageOrder) values " + insertString;
                    let result = await ExecuteQ.Query(dbName, sql, values);
                    callback(null, result.insertId);
                }
                catch (Err) {
                    sendResponse.somethingWentWrongError(res);
                }
                // insertString = insertString.substring(0, insertString.length - 1);
                // var sql = "insert into product_image(product_id,image_path,imageOrder) values " + insertString;
                // multiConnection[dbName].query(sql, values, function (err, result) {
                //     console.log(err)
                //     if (err) {
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else {
                //         callback(null, result.insertId);
                //     }
                // })
            }

        }(i))
    }

}


function checkForInsertedProducts(res, supplierId, productId, callback) {
    var ids = "";
    var productIds = productId.split("#");
    for (var i = 0; i < productIds.length; i++) {
        (function (i) {
            var sql = "select id from supplier_product where supplier_id = ? and product_id = ? and is_deleted = ? limit 1"
            multiConnection[dbName].query(sql, [supplierId, productIds[i], 0], function (err, result) {
                if (result.length) {

                    if (i == productIds.length - 1) {
                        callback(null, ids);
                    }
                }
                else {
                    if (ids == "") {
                        ids = productIds[i];
                        if (i == productIds.length - 1) {
                            callback(null, ids);
                        }
                    }
                    else {
                        ids = ids + "#" + productIds[i];
                        if (i == productIds.length - 1) {
                            callback(null, ids);
                        }
                    }


                }


            })
        }(i))
    }


}


function checkForInsertedProductsForBranch(res, branchId, productId, callback) {
    var ids = "";
    var productIds = productId.split("#");
    for (var i = 0; i < productIds.length; i++) {
        (function (i) {
            var sql = "select id from supplier_branch_product where supplier_branch_id = ? and product_id = ? and is_deleted = ? limit 1"
            multiConnection[dbName].query(sql, [branchId, productIds[i], 0], function (err, result) {
                if (result.length) {

                    if (i == productIds.length - 1) {
                        callback(null, ids);
                    }
                }
                else {
                    if (ids == "") {
                        ids = productIds[i];
                        if (i == productIds.length - 1) {
                            callback(null, ids);
                        }
                    }
                    else {
                        ids = ids + "#" + productIds[i];
                        if (i == productIds.length - 1) {
                            callback(null, ids);
                        }
                    }


                }


            })
        }(i))
    }


}

async function listSupplierCategoriesV1(dbName, res, supplierId, language_id, callback) {
    try {
        // var sql = "select ss.commisionButton ,ss.urgentButton,s.category_id,c.type,c.is_variant,c.name,s.commission_type,s.commission,s.commission_package,c.is_barcode,c.order,c.product_addition_level,c.tax from supplier_category s join categories c";
        // sql += " on s.category_id = c.id join supplier ss on ss.id  = s.supplier_id where s.supplier_id = ? and c.id != 102 and c.parent_id = 0 and c.is_live=1 group by s.category_id";
        // var sql = "select ss.commisionButton ,ss.urgentButton,s.category_id,c.type,c.is_variant,c.name,s.commission_type,s.commission,s.commission_package,c.is_barcode,c.order,c.product_addition_level,c.tax from supplier_category s join categories c";
        // sql += " on s.category_id = c.id join supplier ss on ss.id  = s.supplier_id where s.supplier_id = ? and c.parent_id = 0 and c.is_live=1 group by s.category_id";

        var sql = "select  c.description,ss.commisionButton ,ss.urgentButton,c.id as category_id,c.type,c.is_variant, cml.name,s.commission_type,s.commission,s.commission_package,c.is_barcode,c.order,c.product_addition_level,c.tax from supplier_category s join categories c";
        sql += " on c.menu_type=0 or s.sub_category_id = c.id or s.detailed_sub_category_id = c.id or s.category_id = c.id  ";
        sql += " join categories_ml cml on cml.category_id = c.id   join supplier ss on ss.id  = s.supplier_id join supplier_branch sb on sb.supplier_id = ss.id  join product p on  p.category_id = c.id join supplier_branch_product sbp on (sbp.product_id=p.id ) and sbp.supplier_branch_id=sb.id   where s.supplier_id = ?  and c.is_live=1 and p.is_deleted=0 and sbp.is_deleted = 0 and cml.language_id=?  group by c.id";
        let categories = await ExecuteQ.Query(dbName, sql, [supplierId, language_id]);
        callback(null, categories);
    }
    catch (Err) {
        logger.debug("==listSupplierCategories=Err!===", Err);
        sendResponse.somethingWentWrongError(res);
    }


}

async function listSupplierCategories(dbName, res, supplierId, callback) {
    try {
        // var sql = "select ss.commisionButton ,ss.urgentButton,s.category_id,c.type,c.is_variant,c.name,s.commission_type,s.commission,s.commission_package,c.is_barcode,c.order,c.product_addition_level,c.tax from supplier_category s join categories c";
        // sql += " on s.category_id = c.id join supplier ss on ss.id  = s.supplier_id where s.supplier_id = ? and c.id != 102 and c.parent_id = 0 and c.is_live=1 group by s.category_id";
        var sql = "select ss.commisionButton ,ss.urgentButton,s.category_id,c.type,c.is_variant,c.name,s.commission_type,s.commission,s.commission_package,c.is_barcode,c.order,c.product_addition_level,c.tax from supplier_category s join categories c";
        sql += " on c.menu_type=0 or s.category_id = c.id or s.detailed_sub_category_id = c.id or  ";
        sql += " s.sub_category_id = c.id  join supplier ss on ss.id  = s.supplier_id where s.supplier_id = ? and c.parent_id = 0 and c.is_live=1  group by s.category_id";

        let categories = await ExecuteQ.Query(dbName, sql, [supplierId, 0]);
        callback(null, categories);
    }
    catch (Err) {
        logger.debug("==listSupplierCategories=Err!===", Err);
        sendResponse.somethingWentWrongError(res);
    }
    //     var sql = "select ss.commisionButton ,ss.urgentButton,s.category_id,c.type,c.is_variant,c.name,s.commission_type,s.commission,s.commission_package,c.is_barcode,c.order,c.product_addition_level,c.tax from supplier_category s join categories c";
    //     sql += " on s.category_id = c.id join supplier ss on ss.id  = s.supplier_id where s.supplier_id = ? and c.id != 102 and c.parent_id = 0 and c.is_live=1 group by s.category_id";

    //     multiConnection[dbName].query(sql, [supplierId], function (err, categories) {

    //   //   console.log(".er.......................",err,categories);
    //         if (err) {
    //             sendResponse.somethingWentWrongError(res);
    //         }
    //         else {
    //             callback(null, categories);
    //         }

    //     })

}


function listCategories(dbName, res, callback) {
    var sql = "select c.id,c.name,c.is_barcode,c.order,c.product_addition_level from categories c where c.parent_id = 0 and c.is_deleted = 0 and c.id != 102 ";
    multiConnection[dbName].query(sql, [0, 0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })
}


function listSubCategories(dbName, res, categoryId, callback) {
    var sql = "select id,name from categories where parent_id = ? and is_deleted = ?"
    multiConnection[dbName].query(sql, [categoryId, 0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })
}


function listSupplierSubCategories(dbName, res, supplierId, categoryId, callback) {
    var sql = "select s.sub_category_id,c.name from supplier_category s join categories c ";
    sql += " on s.sub_category_id = c.id where s.supplier_id = ? and s.category_id = ? group by s.sub_category_id ";
    multiConnection[dbName].query(sql, [supplierId, categoryId], function (err, subCategories) {
        //  console.log("........",err,subCategories)
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, subCategories);
        }

    })

}


function listSupplierDetailedSubCategories(dbName, res, supplierId, subCategoryId, callback) {
    var sql = "select s.detailed_sub_category_id,c.name from supplier_category s join categories c";
    sql += " on s.detailed_sub_category_id = c.id where s.supplier_id = ? and s.sub_category_id = ? group by s.detailed_sub_category_id";
    multiConnection[dbName].query(sql, [supplierId, subCategoryId], function (err, detailedSubCategories) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, detailedSubCategories);
        }

    })
}


async function assignProductToSupplier(dbName, res, supplierId, productId, oldProductId, categoryId, subCategoryId, detailedSubCategoryId) {
    //console.log("jnsdfbksd", supplierId, productId,oldProductId, categoryId, subCategoryId, detailedSubCategoryId,callback)
    return new Promise((resolve, reject) => {
        if (Array.isArray(productId)) {
            var productIds = productId;
        }
        else {
            var productIds = productId.split("#");
        }
        categoryId = categoryId + '#';
        subCategoryId = subCategoryId + '#';
        detailedSubCategoryId = detailedSubCategoryId + '#';
        var categoryIds = categoryId.split("#");
        categoryIds.pop();
        var subCategoryIds = subCategoryId.split("#");
        subCategoryIds.pop();
        logger.debug("=========detailedSubCategoryIds===1>>", detailedSubCategoryIds)
        var detailedSubCategoryIds = detailedSubCategoryId.split("#");
        detailedSubCategoryIds.pop();
        //console.log("lmnsdsss",categoryIds,subCategoryIds,detailedSubCategoryIds,oldProductId,productId);
        logger.debug("=========detailedSubCategoryIds=>>", detailedSubCategoryIds)
        var queryString = "(?,?,?,?),";
        var insertString = "";
        var values = [];

        for (const [index, i] of productIds.entries()) {
            values.push(supplierId, productIds[index], categoryIds[index], subCategoryIds[index], detailedSubCategoryIds[index], oldProductId[index]);
            insertString = insertString + queryString;
            logger.debug("====values=====>>", values)
            if (index == productIds.length - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
                //console.log("iii",values);
                var sql = "insert into supplier_product(supplier_id,product_id,category_id,original_product_id) values " + insertString;
                var st = multiConnection[dbName].query(sql, values, function (err, result) {
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

    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    // values.push(supplierId, productIds[i], categoryIds[i], subCategoryIds[i], detailedSubCategoryIds[i],oldProductId[i]);
    // insertString = insertString + queryString;
    // logger.debug("====values=====>>",values)
    // if (i == productIds.length - 1) {
    //     insertString = insertString.substring(0, insertString.length - 1);
    //    //console.log("iii",values);
    //     var sql = "insert into supplier_product(supplier_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id) values " + insertString;
    //    var st= multiConnection[dbName].query(sql, values, function (err, result) {
    //     logger.debug(st.sql)    
    //     if (err) {
    //             console.log(err);
    //             sendResponse.somethingWentWrongError(res);
    //         } else {
    //             callback(null)
    //         }

    //     })

    // }

    //     }(i))

    // }
}




function assignProductToSupplierBranch(dbName, res, branchId, productId, oldProductId, categoryId, subCategoryId, detailedSubCategoryId, recipe_pdf, callback) {
    return new Promise(async (resolve, reject) => {
        console.log("=========recipe_pdf========recipe_pdf=========", recipe_pdf)
        if (Array.isArray(productId)) {
            var productIds = productId;
        }
        else {
            var productIds = productId.split("#");
        }
        console.log("oldprod prod car det subdet", oldProductId, productId, categoryId, subCategoryId, detailedSubCategoryId, productIds.length);
        categoryId = categoryId + '#';
        var categoryIds = categoryId.split("#");
        categoryIds.pop();
        subCategoryId = subCategoryId + '#'
        var subCategoryIds = subCategoryId.split("#");
        subCategoryIds.pop();
        detailedSubCategoryId = detailedSubCategoryId + '#'
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
            values.push(branchId, productIds[index], categoryIds[index], subCategoryIds[index], detailedSubCategoryIds[index], oldProductId[index], recipe_pdf);
            insertString = insertString + queryString;
            logger.debug("====values=====>>", values)

            var insertSql = `SELECT ${values[0]},${values[1]},${values[2]},${values[3]},${values[4]},${values[5]},"${recipe_pdf}",MAX(order_no)+1
            from supplier_branch_product 
            where supplier_branch_id=${values[0]} and category_id=${values[2]};`;
            // var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id) values " + insertString;
            var sql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,recipe_pdf,order_no) " + insertSql;
            await ExecuteQ.Query(dbName, sql, []);
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


function listSupplierProducts(dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, callback) {
    var products, id, data;

    console.log("....................limit,offset................", limit, offset, serachType, serachText);
    async.auto({
        listSupplierProductDetails: function (cb) {

            listSupplierProductDetails(dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, function (err, result, result1) {


                if (err) {
                    console.log("err1..", err)
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    products = result;
                    id = result1;
                    cb(null);
                }
            });
        },
        productImage: ["listSupplierProductDetails", function (cb) {
            console.log("......12111...22222", products.length, id.length);
            productImages(dbName, res, products, id, function (err, result) {
                if (err) {
                    console.log("err2..", err)
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    data = result;
                    cb(null);
                }
            });
        }]
    }, function (err, response) {
        //console.log("...........ee...",data);
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, data);
        }

    })
}
function listSupplierProductsV1(dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, callback) {
    var products, id, data;

    console.log("....................limit,offset................", limit, offset, serachType, serachText);
    async.auto({
        listSupplierProductDetails: function (cb) {

            listSupplierProductDetailsV1(dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, function (err, result, result1) {


                if (err) {
                    console.log("err1..", err)
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    products = result;
                    id = result1;
                    cb(null);
                }
            });
        },
        productImage: ["listSupplierProductDetails", function (cb) {
            console.log("......12111...22222", products.length, id.length);
            productImages(dbName, res, products, id, function (err, result) {
                if (err) {
                    console.log("err2..", err)
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    data = result;
                    cb(null);
                }
            });
        }]
    }, function (err, response) {
        //console.log("...........ee...",data);
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, data);
        }

    })
}

function listSupplierProductDetails(dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, callback) {
    var id = [];
    if (serachType == 0) {

        var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.purchased_quantity,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name,c.is_barcode from supplier_product sp ";
        sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id  join categories c on c.id = p.category_id join currency_conversion curr ";
        sql += " on curr.id = p.price_unit join product_ml pml on p.id = pml.product_id where sp.supplier_id = ? and  p.parent_id=0  and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and sp.product_id !=0  group by p.id limit ?,? ";
    }
    else {
        var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.purchased_quantity,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name,c.is_barcode from supplier_product sp ";
        sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id  join categories c on c.id = p.category_id join currency_conversion curr ";
        sql += " on curr.id = p.price_unit join product_ml pml on p.id = pml.product_id where sp.supplier_id = ? and p.parent_id=0 and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and sp.product_id !=0 " +
            "and (p.id LIKE '%" + serachText + "%' or p.bar_code LIKE '%" + serachText + "%' " +
            " or p.sku LIKE '%" + serachText + "%'or p.name LIKE '%" + serachText + "%')  group by p.id ORDER BY p.id DESC LIMIT ?,?"

    }
    var st = multiConnection[dbName].query(sql, [supplierId, 0, categoryId, subCategoryId, detailedSubCategoryId, offset, limit], function (err, products) {
        console.log(st.sql);
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            console.log("...................", products);
            if (products.length) {
                console.log("if....", supplierId, categoryId, subCategoryId, detailedSubCategoryId)
                var sql2 = "select p.id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit " +
                    "from product_ml p join language l on p.language_id = l.id join supplier_product sp on sp.product_id = p.product_id  " +
                    "where sp.is_deleted = 0 and sp.supplier_id =?  and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? order by p.language_id ASC";
                multiConnection[dbName].query(sql2, [supplierId, categoryId, subCategoryId, detailedSubCategoryId], function (err, productMultiLanguage) {
                    console.log("......12111...", productMultiLanguage.length, err);
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        var productLength = products.length;
                        var languageLength = productMultiLanguage.length;

                        if (!languageLength) {
                            callback(null, [], id)
                        }
                        else {
                            for (var i = 0; i < productLength; i++) {
                                (function (i) {
                                    var names = [];
                                    id.push(products[i].id);
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
                                                        callback(null, products, id);
                                                    }
                                                }
                                            }
                                            else {
                                                if (j == languageLength - 1) {
                                                    products[i].names = names;
                                                    if (i == productLength - 1) {
                                                        callback(null, products, id);
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
            else {
                callback(null, [], id);
            }
        }

    })
}
function listSupplierProductDetailsV1(dbName, res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, limit, offset, serachType, serachText, callback) {
    var id = [];
    if (serachType == 0) {

        var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.pricing_type, p.interval_flag,p.interval_value,p.quantity,p.purchased_quantity,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name,c.is_barcode from supplier_product sp ";
        sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id  join categories c on c.id = p.category_id join currency_conversion curr ";
        sql += " on curr.id = p.price_unit join product_ml pml on p.id = pml.product_id where sp.supplier_id = ? and p.parent_id=0 and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and sp.product_id !=0  group by p.id limit ?,? ";
    }
    else {
        var sql = "select (p.quantity-p.purchased_quantity) as left_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.pricing_type,p.interval_flag,p.interval_value,p.quantity,p.purchased_quantity,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name,c.is_barcode from supplier_product sp ";
        sql += " join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id  join categories c on c.id = p.category_id join currency_conversion curr ";
        sql += " on curr.id = p.price_unit join product_ml pml on p.id = pml.product_id where sp.supplier_id = ? and p.parent_id=0 and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? and sp.product_id !=0 " +
            "and (p.id LIKE '%" + serachText + "%' or p.bar_code LIKE '%" + serachText + "%' " +
            " or p.sku LIKE '%" + serachText + "%'or p.name LIKE '%" + serachText + "%')  group by p.id ORDER BY p.id DESC LIMIT ?,?"

    }
    var st = multiConnection[dbName].query(sql, [supplierId, 0, categoryId, subCategoryId, detailedSubCategoryId, offset, limit], function (err, products) {
        console.log(st.sql);
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            console.log("...................", products);
            if (products.length) {
                console.log("if....", supplierId, categoryId, subCategoryId, detailedSubCategoryId)
                var sql2 = "select p.interval_flag,interval_value,p.id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit " +
                    "from product_ml p join language l on p.language_id = l.id join supplier_product sp on sp.product_id = p.product_id  " +
                    "where sp.is_deleted = 0 and sp.supplier_id =?  and sp.category_id = ? and sp.sub_category_id = ? and sp.detailed_sub_category_id = ? order by p.language_id ASC";
                multiConnection[dbName].query(sql2, [supplierId, categoryId, subCategoryId, detailedSubCategoryId], function (err, productMultiLanguage) {
                    console.log("......12111...", productMultiLanguage.length, err);
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        var productLength = products.length;
                        var languageLength = productMultiLanguage.length;

                        if (!languageLength) {
                            callback(null, [], id)
                        }
                        else {
                            for (var i = 0; i < productLength; i++) {
                                (function (i) {
                                    var names = [];
                                    id.push(products[i].id);
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
                                                        callback(null, products, id);
                                                    }
                                                }
                                            }
                                            else {
                                                if (j == languageLength - 1) {
                                                    products[i].names = names;
                                                    if (i == productLength - 1) {
                                                        callback(null, products, id);
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
            else {
                callback(null, [], id);
            }
        }

    })
}


async function productImages(dbName, res, products, id, callback) {
    try {
        var productId = id.toString();
        if (products.length) {
            var sql = " select product_id,image_path,default_image,imageOrder from product_image where product_id IN(" + productId + ")";
            let productImages = await ExecuteQ.Query(dbName, sql, []);
            // multiConnection[dbName].query(sql, function (err, productImages) {
            //     if(err){
            //         sendResponse.somethingWentWrongError(res)
            //     }
            //     else{
            var imageLength = productImages.length;
            if (imageLength && imageLength > 0) {

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
            else {
                callback(null, products);
            }
            // }
            // })
        }
        else {
            callback(null, []);
        }
    }
    catch (Err) {
        logger.debug("=productImages==", Err)
        sendResponse.somethingWentWrongError(res)
    }

}


function insertProductPricing(res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, productPricingId, houseCleaningCharge, beautySaloonCharge, type, id, displayPrice, callback) {

    if (offerType == 0) {
        var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? limit 1";
        multiConnection[dbName].query(sql, [productId, 0, offerType], function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                if (result.length) {
                    if (type == 0) {
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,delivery_charges = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=?,display_price = ? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, displayPrice, productId, offerType], function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                callback(null);
                            }
                        })
                    }

                    else if (type == 1) {

                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=?,display_price = ? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, displayPrice, productId, offerType], function (err, result) {
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
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=?,display_price = ? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, displayPrice, productId, offerType], function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                var sql3 = "delete from supplier_branch_area_product where supplier_branch_id = ? and product_id = ?";
                                multiConnection[dbName].query(sql3, [id, productId], function (err, result5) {
                                    if (err) {
                                        sendResponse.somethingWentWrongError(res);
                                    }
                                    else {
                                        areaId = areaId.split("#");
                                        deliveryCharges = deliveryCharges.split("#");
                                        minOrder = minOrder.split("#");
                                        chargesBelowMinOrder = chargesBelowMinOrder.split("#");
                                        var values = [];
                                        var queryString = "";
                                        var insertString = "(?,?,?,?,?,?),";
                                        for (var i = 0; i < areaId.length; i++) {
                                            (function (i) {
                                                values.push(id, areaId[i], productId, deliveryCharges[i], minOrder[i], chargesBelowMinOrder[i]);
                                                queryString = queryString + insertString;
                                                if (i == areaId.length - 1) {
                                                    queryString = queryString.substring(0, queryString.length - 1);
                                                    var sql4 = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                                                    multiConnection[dbName].query(sql4, values, function (err, result) {
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
                                    }

                                })
                            }
                        })
                    }

                }
                else {
                    var sql = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    multiConnection[dbName].query(sql, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, displayPrice], function (err, result) {
                        if (err) {
                            console.log(err)
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            if (type == 0) {
                                callback(null);
                            }
                            else if (type == 1) {
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
                            else {
                                var sql3 = "delete from supplier_branch_area_product where supplier_branch_id = ? and product_id = ?";
                                multiConnection[dbName].query(sql3, [id, productId], function (err, result5) {
                                    if (err) {
                                        sendResponse.somethingWentWrongError(res);
                                    }
                                    else {
                                        areaId = areaId.split("#");
                                        deliveryCharges = deliveryCharges.split("#");
                                        minOrder = minOrder.split("#");
                                        chargesBelowMinOrder = chargesBelowMinOrder.split("#");
                                        var values = [];
                                        var queryString = "";
                                        var insertString = "(?,?,?,?,?,?),";
                                        for (var i = 0; i < areaId.length; i++) {
                                            (function (i) {
                                                values.push(id, areaId[i], productId, deliveryCharges[i], minOrder[i], chargesBelowMinOrder[i]);
                                                queryString = queryString + insertString;
                                                if (i == areaId.length - 1) {
                                                    queryString = queryString.substring(0, queryString.length - 1);
                                                    var sql4 = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                                                    multiConnection[dbName].query(sql4, values, function (err, result) {
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


                                    }

                                })
                            }

                        }
                    })
                }
            }

        })
    }
    else {
        //console.log("hereeeee");
        var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and ((start_date BETWEEN '" + startDate + "' and '" + endDate + "') or (end_date BETWEEN '" + startDate + "' and '" + endDate + "'))  limit 1";
        multiConnection[dbName].query(sql, [productId, 0, offerType], function (err, result) {
            if (err) {
                console.log("errror", err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                //console.log("no error");
                //console.log(result)
                if (result.length) {
                    if (type == 0) {
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,delivery_charges = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=?,display_price = ? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, displayPrice, productId, offerType], function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                callback(null);
                            }
                        })
                    }

                    else if (type == 1) {

                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=?,display_price = ? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, displayPrice, productId, offerType], function (err, result) {
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
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=?,display_price = ? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, displayPrice, productId, offerType], function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                var sql3 = "delete from supplier_branch_area_product where supplier_branch_id = ? and product_id = ?";
                                multiConnection[dbName].query(sql3, [id, productId], function (err, result5) {
                                    if (err) {
                                        sendResponse.somethingWentWrongError(res);
                                    }
                                    else {
                                        areaId = areaId.split("#");
                                        deliveryCharges = deliveryCharges.split("#");
                                        minOrder = minOrder.split("#");
                                        chargesBelowMinOrder = chargesBelowMinOrder.split("#");
                                        var values = [];
                                        var queryString = "";
                                        var insertString = "(?,?,?,?,?,?),";
                                        for (var i = 0; i < areaId.length; i++) {
                                            (function (i) {
                                                values.push(id, areaId[i], productId, deliveryCharges[i], minOrder[i], chargesBelowMinOrder[i]);
                                                queryString = queryString + insertString;
                                                if (i == areaId.length - 1) {
                                                    queryString = queryString.substring(0, queryString.length - 1);
                                                    var sql4 = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                                                    multiConnection[dbName].query(sql4, values, function (err, result) {
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


                                    }

                                })
                            }
                        })
                    }

                }
                else {
                    //console.log("not found");
                    var sql = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price,display_price) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    multiConnection[dbName].query(sql, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, displayPrice], function (err, result) {
                        if (err) {
                            console.log(err)
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            if (type == 0) {
                                //console.log("admin vala")
                                callback(null);
                            }
                            else if (type == 1) {
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
                            else {
                                var sql3 = "delete from supplier_branch_area_product where supplier_branch_id = ? and product_id = ?";
                                multiConnection[dbName].query(sql3, [id, productId], function (err, result5) {
                                    if (err) {
                                        sendResponse.somethingWentWrongError(res);
                                    }
                                    else {
                                        areaId = areaId.split("#");
                                        deliveryCharges = deliveryCharges.split("#");
                                        minOrder = minOrder.split("#");
                                        chargesBelowMinOrder = chargesBelowMinOrder.split("#");
                                        var values = [];
                                        var queryString = "";
                                        var insertString = "(?,?,?,?,?,?),";
                                        for (var i = 0; i < areaId.length; i++) {
                                            (function (i) {
                                                values.push(id, areaId[i], productId, deliveryCharges[i], minOrder[i], chargesBelowMinOrder[i]);
                                                queryString = queryString + insertString;
                                                if (i == areaId.length - 1) {
                                                    queryString = queryString.substring(0, queryString.length - 1);
                                                    var sql4 = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id,delivery_charges,min_order,charges_below_min_order) values " + queryString;
                                                    multiConnection[dbName].query(sql4, values, function (err, result) {
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


                                    }

                                })
                            }

                        }
                    })
                }
            }

        })
    }

}


function editProductPricing(res, insertValues, callback) {
    var sql = " update product_pricing set start_date = ?,end_date= ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,commission = ?,delivery_charges = ?,commission_type =?, urgent_type =? where id = ? limit 1"
    multiConnection[dbName].query(sql, insertValues, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    })
}


function deleteProduct(dbName, res, productId, callback) {
    var sql = "update product set is_deleted = ? where id IN (" + productId + ")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            var sql2 = "update supplier_product set is_deleted = ? where product_id  IN (" + productId + ")";
            multiConnection[dbName].query(sql2, [1], function (err, response) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    var sql = "update supplier_branch_product set is_deleted = ? where product_id  IN (" + productId + ")";
                    multiConnection[dbName].query(sql, [1], function (err, result) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res)
                        }
                        else {
                            var sql3 = "update supplier_branch_area_product set is_deleted = ? where product_id  IN (" + productId + ")";
                            multiConnection[dbName].query(sql3, [1], function (err, done) {
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

            })
        }

    })

}


function deleteSupplierProduct(dbName, res, productId, supplierId, callback) {
    var sql = "update supplier_product set is_deleted = ? where supplier_id = ? and product_id IN (" + productId + ")";
    multiConnection[dbName].query(sql, [1, supplierId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select id from supplier_branch where supplier_id = ? ";
            multiConnection[dbName].query(sql2, [supplierId], function (err, branches) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    var branchArray = [];
                    for (var i = 0; i < branches.length; i++) {
                        branchArray.push(branches[i].id);
                    }
                    branchArray = branchArray.toString();
                    var sql = "update supplier_branch_product set is_deleted = ? where supplier_branch_id IN ('" + branchArray + "') and product_id IN (" + productId + ")";
                    multiConnection[dbName].query(sql, [1], function (err, result) {
                        if (err) {
                            console.log("err", err);
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            var sql3 = "update supplier_branch_area_product set is_deleted = ? where supplier_branch_id IN ('" + branchArray + "') and product_id IN (" + productId + ")";
                            multiConnection[dbName].query(sql3, [1], function (err, done) {
                                if (err) {
                                    console.log("err", err);
                                    sendResponse.somethingWentWrongError(res);
                                }
                                else {
                                    callback(null)
                                }

                            })
                        }

                    })
                }

            })
        }

    })

}


async function deleteSupplierProductOfBranch(dbName, res, productId, branchId, callback) {
    try {
        var sql = "delete from supplier_branch_product where supplier_branch_id = ? and product_id IN (" + productId + ")";
        await ExecuteQ.Query(dbName, sql, [branchId]);
        // multiConnection[dbName].query(sql, [1, branchId], function (err, result) {
        //     if (err) {
        //         sendResponse.somethingWentWrongError(res);
        //     }
        //     else {
        var sql3 = "delete sbp from supplier_branch_product sbp join product p on sbp.product_id=p.id where  sbp.supplier_branch_id = ? and p.parent_id IN (" + productId + ")";
        await ExecuteQ.Query(dbName, sql3, [branchId]);
        // multiConnection[dbName].query(sql3, [1, branchId], function (err, done) {
        //     if (err) {
        //         sendResponse.somethingWentWrongError(res);
        //     }
        //     else {
        callback(null)
        //     }

        // })
        //     }

        // })
    }
    catch (Err) {
        logger.debug("====Err!==", Err);
        sendResponse.somethingWentWrongError(res);
    }
}


async function listCurrencies(dbName, res, callback) {
    try {
        var sql = "select id,currency_name from currency_conversion"
        let result = await ExecuteQ.Query(dbName, sql, []);
        // multiConnection[dbName].query(sql, function (err, result) {
        //     if (err) {
        //         sendResponse.somethingWentWrongError(res);
        //     }
        //     else {
        callback(null, result);
        //     }

        // })
    }
    catch (Err) {
        sendResponse.somethingWentWrongError(res);
    }
}


async function updateDefaultImage(dbName, res, id, callback) {
    try {
        if (id === 0) {
            callback(null);
        } else {
            var sql = "update product_image set default_image = ? where id = ? limit 1";
            await ExecuteQ.Query(dbName, sql, [1, id])
            // multiConnection[dbName].query(sql, [1, id], function (err, result) {
            //     if (err) {
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else {
            callback(null);
            //     }

            // })
        }
    }
    catch (Err) {
        logger.debug("===Err", Err);
        sendResponse.somethingWentWrongError(res);
    }
}

function addHourlyPricing(dbName, res, productId, minHour, maxHour, perHourPrice, callback) {
    var sql = "insert into product_pricing(product_id,min_hour,max_hour,per_hour_price) values(?,?,?,?) ";
    multiConnection[dbName].query(sql, [productId, minHour, maxHour, perHourPrice], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            console.log(err)
            callback(null);
        }

    })

}


function listHourlyPricing(dbName, res, productId, callback) {
    var sql = " select id,min_hour,max_hour,per_hour_price from product_pricing where product_id = ? and is_deleted = ? ";
    multiConnection[dbName].query(sql, [productId, 0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result)
        }

    })

}


function deletePricingHourly(dbName, res, id, callback) {
    var sql = "update product_pricing set is_deleted = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, [1, id], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })
}

function editHourlyPricing(dbName, res, id, minHour, maxHour, perHourPrice, callback) {
    var sql = "update product_pricing set min_hour = ?,max_hour = ?,per_hour_price = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, [minHour, maxHour, perHourPrice, id], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}

function getData(dbName, res, productId, commission, commissionType, pricing_level, callback) {
    var productIds = productId.split("#");
    productIds.pop();
    var insertedIds = [];


    console.log("./..............productIds.length......................", productIds.length)

    return new Promise(async (resolve, reject) => {
        if (productIds && productIds.length) {

            for (const [index, i] of productIds.entries()) {
                try {
                    let sql = "insert into product(cart_image_upload,payment_after_confirmation,duration,is_product,quantity,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id," +
                        "commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                        "is_live,is_deleted,is_global,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type,brand_id)" +
                        " select cart_image_upload,payment_after_confirmation,duration,is_product,quantity,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id" +
                        ",commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                        "is_live,is_deleted,0,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type,brand_id from product where id = ? ";
                    let params = [productIds[index]]
                    let result = await ExecuteQ.Query(dbName, sql, params)
                    insertedIds.push(result.insertId);
                    if (index == productIds.length - 1) {
                        resolve(insertedIds)
                    }
                } catch (err) {
                    logger.debug("===========errrrrr========", err)
                    reject(err)
                }

            }

        } else {
            resolve([])
        }
    })

    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    //         console.log("./..............i......................",i)
    //         var sql = "insert into product(duration,is_product,quantity,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
    //             "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
    //             "is_live,is_deleted,is_global,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type,brand_id)" +
    //             " select duration,is_product,quantity,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
    //             "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
    //             "is_live,is_deleted,0,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type,brand_id from product where id = ? ";
    //       console.log(".........productIds[i].......................",productIds[i]);
    //         multiConnection[dbName].query(sql, [productIds[i]], function (err, result) {


    //             console.log(".............productIds[i]..............",productIds);
    //             console.log("..........,result........................",result);

    //             if(err)
    //             {
    //                 console.log("errerrr",err)
    //                 sendResponse.somethingWentWrongError(res);
    //             }
    //             else{
    //                 insertedIds.push(result.insertId);
    //                 if (i == productIds.length - 1) {
    //                     callback(null,insertedIds);
    //                 }
    //             }

    //         })
    //     }(i))
    // }
    /*  else {
     for (var i = 0; i < productIds.length; i++) {
     (function (i) {
     var sql = "insert into product( name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
     "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
     "is_live,is_deleted,is_global,added_by,created_by,approved_by_supplier,approved_by_admin)" +
     " select name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
     "detailed_sub_category_id,?,?,commission_package,recurring_possible,scheduling_possible,is_package," +
     "?,is_deleted,0,added_by,created_by,approved_by_supplier,approved_by_admin from product where id = ? ";
     multiConnection[dbName].query(sql, [commissionType[i],commission[i],1,productIds[i]], function (err, result) {
     if(err)
     {
     console.log("errerrr",err)
     sendResponse.somethingWentWrongError(res);
     }
     else{
     insertedIds.push(result.insertId);
     if (i == productIds.length - 1) {
     callback(null,insertedIds);
     }
     }

     })
     }(i))
     }

     }*/


}
function addVariants(dbName, res, newIds, id, callback) {
    return new Promise(async (resolve, reject) => {

        try {
            var productIds = id
            if (productIds && productIds.length > 0) {
                for (const [index, i] of productIds.entries()) {
                    var sql = "insert into product_variants(parent_id,variant_id,product_id)" +
                        " select parent_id,variant_id,'?' from product_variants where product_id = ? ";
                    await ExecuteQ.Query(dbName, sql, [newIds[index], productIds[index]])
                    if (index == productIds.length - 1) {
                        resolve()
                    }

                }
            } else {
                resolve()
            }
        } catch (err) {
            logger.debug("======err=;==", err)
            reject(err)
        }

    })
    // var productIds = id;
    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    //         var sql = "insert into product_variants(parent_id,variant_id,product_id)" +
    //             " select parent_id,variant_id,'?' from product_variants where product_id = ? ";
    //         multiConnection[dbName].query(sql, [newIds[i],productIds[i]], function (err, result) {
    //             if(err)
    //             {
    //                 console.log("errerrr",err);
    //                 sendResponse.somethingWentWrongError(res);
    //             }
    //             else{
    //                //console.log("multi inserted");
    //                 if (i == productIds.length - 1) {
    //                     callback(null);
    //                 }
    //             }
    //         })
    //     }(i))
    // }
}

function multilanguage(dbName, res, newIds, id) {
    //console.log("new old",newIds,id);
    return new Promise(async (resolve, reject) => {
        var productIds = id;
        if (productIds && productIds.length > 0) {
            for (const [index, i] of productIds.entries()) {
                try {
                    var sql = "insert into product_ml( language_id,name,product_desc,measuring_unit,product_id)" +
                        " select language_id,name,product_desc,measuring_unit,'?' from product_ml where product_id = ? ";
                    await ExecuteQ.Query(dbName, sql, [newIds[index], productIds[index]])
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
                    //     }

                    // })
                }
                catch (Err) {
                    logger.debug("===Err!==", Err);
                    sendResponse.somethingWentWrongError(res);
                }
            }
        } else {
            resolve()
        }
    })
    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    // var sql = "insert into product_ml( language_id,name,product_desc,measuring_unit,product_id)" +
    //     " select language_id,name,product_desc,measuring_unit,'?' from product_ml where product_id = ? ";
    // multiConnection[dbName].query(sql, [newIds[i],productIds[i]], function (err, result) {
    //     if(err)
    //     {
    //         console.log("errerrr",err);
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else{
    //        //console.log("multi inserted");
    //         if (i == productIds.length - 1) {
    //             callback(null,[]);
    //         }
    //     }

    // })
    //     }(i))
    // }
}

function productImage(dbName, res, newIds, id, callback) {
    return new Promise(async (resolve, reject) => {
        var productIds = id;
        if (productIds && productIds.length) {
            for (const [index, i] of productIds.entries()) {
                var sql = "insert into product_image( image_path,default_image,product_id,imageOrder)" +
                    " select image_path,default_image,'?',imageOrder from product_image where product_id = ? ";
                await ExecuteQ.Query(dbName, sql, [newIds[index], productIds[index]])
                if (index == productIds.length - 1) {
                    resolve();
                }
            }
        } else {
            resolve()
        }

    })
    // var productIds = id;
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

function productPricing(dbName, res, newIds, id, callback) {
    return new Promise(async (resolve, reject) => {
        var productIds = id;
        if (productIds && productIds.length > 0) {
            for (const [index, i] of productIds.entries()) {
                var sql = "insert into product_pricing(start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                    "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type," +
                    "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,product_id) " +
                    "select  start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                    "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type, " +
                    "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,'?' from product_pricing where product_id = ? ";

                await ExecuteQ.Query(dbName, sql, [newIds[index], productIds[index]]);
                if (index == productIds.length - 1) {
                    resolve();
                }
            }
        } else {
            resolve()
        }

    })
    // var productIds = id;
    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    //         var sql = "insert into product_pricing(start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
    //             "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type," +
    //             "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,product_id) " +
    //             "select  start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
    //             "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type, " +
    //             "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,'?' from product_pricing where product_id = ? ";
    //         multiConnection[dbName].query(sql, [newIds[i],productIds[i]], function (err, result) {
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

// function checkForProducts(dbName,res, supplierId,category,subCategory,detailedSubCategory, productId,pricing_level, callback) {
//     var prodId = "";
//     var cateId = "";
//     var subcat = "";
//     var detsubcat = "";
//     var commission= "";
//     var commissionType="";
//     var productIds = productId.split("#");
//     var categoryId=category.split("#");
//     var subCategoryId = [];
//     if (subCategory) {
//         subCategoryId = subCategory.split("#");
//     }
//     var detailSubCategoryId = [];
//     if(detailedSubCategory){
//         detailSubCategoryId = detailedSubCategory.split("#");   
//     }
//     logger.debug("=========pricing_level======>>",pricing_level);

//      if(pricing_level)
//      {
//      for (var i = 0; i < productIds.length; i++) {
//          (function (i) {
//              var sql = "select id from supplier_product where supplier_id = ?  and (product_id = ? or original_product_id = ? ) and is_deleted = ? limit 1"
//              multiConnection[dbName].query(sql, [supplierId, productIds[i], productIds[i], 0], function (err, result) {
//                  if(err){
//                      console.log("errerrr",err);
//                      sendResponse.somethingWentWrongError(res);
//                  }
//                  else{
//                      if (result.length) {
//                         var sql1='update supplier_product set is_deleted = ? where supplier_id =? and (product_id = ? or original_product_id = ? )'
//                         multiConnection[dbName].query(sql1,[1,supplierId,productIds[i],productIds[i]],function (err,response) {
//                             if(err)
//                             {
//                                 console.log("errrrrrr",err);
//                                 sendResponse.somethingWentWrongError(res);
//                             }
//                         })
//                      }
//                          if (prodId == "") {
//                              prodId = productIds[i];
//                              cateId = categoryId[i];
//                              subcat= subCategoryId[i];
//                              detsubcat= detailSubCategoryId[i];
//                              if (i == productIds.length - 1) {
//                                  callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//                              }
//                          }
//                          else {
//                              prodId =  prodId + "#" + productIds[i];
//                              cateId =  cateId + "#" +categoryId[i];
//                              subcat=   subcat + "#" +subCategoryId[i];
//                              detsubcat= detsubcat + "#" + detailSubCategoryId[i];
//                              if (i == productIds.length - 1) {
//                                  callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//                              }
//                          }
//                  }
//              })
//          }(i))
//      }
//      }
//     else {
//          for (var i = 0; i < productIds.length; i++) {
//              (function (i) {
//                  var sql = "select id from supplier_product where supplier_id = ?  and (product_id = ? or original_product_id = ? ) and is_deleted = ? limit 1"
//                  multiConnection[dbName].query(sql, [supplierId, productIds[i], productIds[i], 0], function (err, result) {
//                      if(err){
//                          console.log("errerrr",err);
//                          sendResponse.somethingWentWrongError(res);
//                      }
//                      else{
//                          if (result.length) {

//                              var sql11='update supplier_product set is_deleted = ? where supplier_id =? and (product_id = ? or original_product_id = ? )'
//                              multiConnection[dbName].query(sql11,[1,supplierId,productIds[i],productIds[i]],function (err,response) {
//                                  if(err)
//                                  {
//                                      console.log("errrrrrr",err);
//                                      sendResponse.somethingWentWrongError(res);
//                                  }
//                              })
//                          }
//                           var sql1='select commission,commission_type from supplier_category where category_id= ? and supplier_id=?'
//                              multiConnection[dbName].query(sql1,[categoryId[i],supplierId],function (err1,result) {
//                                  if(err){
//                                      console.log("errerrr",err1);
//                                      sendResponse.somethingWentWrongError(res);
//                                  }
//                                  else{
//                                      if (prodId == "") {
//                                          prodId = productIds[i];
//                                          cateId = categoryId[i];
//                                          subcat= subCategoryId[i];
//                                          detsubcat= detailSubCategoryId[i];
//                                          commission= result[0].commission;
//                                          commissionType=result[0].commission_type;
//                                          if (i == productIds.length - 1) {
//                                              callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//                                          }
//                                      }
//                                      else {
//                                          prodId =  prodId + "#" + productIds[i];
//                                          cateId =  cateId + "#" +categoryId[i];
//                                          subcat=   subcat + "#" +subCategoryId[i];
//                                          detsubcat= detsubcat + "#" + detailSubCategoryId[i];
//                                          commission= commission + "#" + result[0].commission;
//                                          commissionType= commissionType + "#" + result[0].commission_type;
//                                          if (i == productIds.length - 1) {
//                                              callback(null, prodId,cateId,subcat,detsubcat,commission,commissionType);
//                                          }
//                                      }
//                                  }
//                              })
//                      }
//                  })
//              }(i))
//          }

//      }


// }



async function checkForProducts(dbName, res, supplierId, category, subCategory, detailedSubCategory, productId, pricing_level) {
    return new Promise(async (resolve, reject) => {
        var prodId = "";
        var cateId = "";
        var subcat = "";
        var detsubcat = "";
        var commission = "";
        var commissionType = "";
        var productIds = productId.split("#");
        var categoryId = category.split("#");
        var subCategoryId = [];
        if (subCategory) {
            subCategoryId = subCategory.split("#");
        }
        var detailSubCategoryId = [];
        if (detailedSubCategory) {
            detailSubCategoryId = detailedSubCategory.split("#");
        }
        logger.debug("====checkForProducts=====pricing_level======>>", pricing_level);

        if (pricing_level) {

            console.log("lndcheckForProductssfk", productIds, categoryId, subCategoryId, detailSubCategoryId)
            if (productIds && productIds.length) {
                for (const [index, i] of productIds.entries()) {

                    logger.debug("====i,index===checkForProducts=======i,index==========", i, index)

                    await updateSupplierProduct(dbName, res, i, supplierId)
                    if (prodId == "") {
                        logger.debug("=======checkForProducts======here====111111111111111======++", prodId)
                        prodId = i;
                        cateId = categoryId[index];
                        subcat = subCategoryId[index];
                        detsubcat = detailSubCategoryId[index];
                        logger.debug("======cateId,subcat,detsubcat=checkForProducts====aaaaaaaaaaaaa=====", cateId, subcat, detsubcat)
                        if (index == productIds.length - 1) {

                            logger.debug("=====checkForProducts========here======55555555555====++", prodId, index, productIds.length)
                            resolve(
                                [
                                    prodId, cateId, subcat, detsubcat, commission, commissionType
                                ]
                            );
                        }
                    }
                    else {
                        logger.debug("=====checkForProducts========here======2222222222====++", prodId)
                        prodId = prodId + "#" + i;
                        cateId = cateId + "#" + categoryId[index];
                        subcat = subcat + "#" + subCategoryId[index];
                        detsubcat = detsubcat + "#" + detailSubCategoryId[index];
                        logger.debug("=====checkForProducts========here======33333333333====++", prodId, cateId, subcat, detsubcat)
                        logger.debug("===checkForProducts===cateId,subcat,detsubcat===bbbbbbbbbbb=======", cateId, subcat, detsubcat)
                        if (index == productIds.length - 1) {
                            logger.debug("=====checkForProducts========here======4444444444444====++", prodId, index, productIds.length)
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

                    logger.debug("====i,index===checkForProducts else=======i,index==========", i, index)

                    await updateSupplierProduct(dbName, res, i, supplierId)
                    if (prodId == "") {
                        logger.debug("======checkForProducts else=======here====111111111111111======++", prodId)
                        prodId = i;
                        cateId = categoryId[index];
                        subcat = subCategoryId[index];
                        detsubcat = detailSubCategoryId[index];
                        logger.debug("======cateId,subcat,detsubcat=checkForProducts else====aaaaaaaaaaaaa=====", cateId, subcat, detsubcat)
                        if (index == productIds.length - 1) {

                            logger.debug("=====checkForProducts else========here======55555555555====++", prodId, index, productIds.length)
                            resolve(
                                [
                                    prodId, cateId, subcat, detsubcat, commission, commissionType
                                ]
                            );
                        }
                    }
                    else {
                        logger.debug("=======checkForProducts else======here======2222222222====++", prodId)
                        prodId = prodId + "#" + i;
                        cateId = cateId + "#" + categoryId[index];
                        subcat = subcat + "#" + subCategoryId[index];
                        detsubcat = detsubcat + "#" + detailSubCategoryId[index];
                        logger.debug("====checkForProducts else=========here======33333333333====++", prodId, cateId, subcat, detsubcat)
                        logger.debug("==checkForProducts else====cateId,subcat,detsubcat===bbbbbbbbbbb=======", cateId, subcat, detsubcat)
                        if (index == productIds.length - 1) {
                            logger.debug("===checkForProducts else==========here======4444444444444====++", prodId, index, productIds.length)
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





function checkForProductsForBranch(dbName, res, branchId, category, subCategory, detailedSubCategory, productId, pricing_level, supplierId) {
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
                    logger.debug("======cateId,subcat,detsubcat=====aaaaaaaaaaaaa=====", cateId, subcat, detsubcat)
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
                    logger.debug("=============here======33333333333====++", prodId, cateId, subcat, detsubcat)
                    logger.debug("======cateId,subcat,detsubcat===bbbbbbbbbbb=======", cateId, subcat, detsubcat)
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


exports.productsList = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    var adminId;
    var data = {};
    var final = [];
    var id = [];
    async.auto({
        checkBlank: function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        authenticate: ['checkBlank', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null)

                }
            });
        }],
        checkAuthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, cb);
        }],
        getProduct: ['checkAuthority', function (cb) {
            var sql = 'SELECT id,name,bar_code,sku  FROM `product` WHERE  `is_deleted` = 0 AND `is_global` = 1 AND `parent_id`=0 '
            multiConnection[req.dbName].query(sql, function (err, result) {
                if (err) {
                    console.log("0", err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    //console.log("resssss",result.length);
                    if (result.length) {
                        for (var i = 0; i < result.length; i++) {
                            (function (i) {
                                data.product_id = result[i].id;
                                data.bar_code = result[i].bar_code;
                                data.sku = result[i].sku;
                                data.product_name = result[i].name;
                                id.push(result[i].id);
                                final.push(data);
                                data = {};
                                if (i == result.length - 1) {
                                    cb(null);
                                }
                            }(i))
                        }
                    }
                    else {
                        cb(null)
                    }

                }
            })
        }],
        /*  getMultiName:['getProduct',function (cb) {
              id = id.toString();
              var sql2='select pml.name,pml.product_desc,pml.measuring_unit,pml.language_id,pml.product_id from product_ml pml where product_id In ('+id+')';
              multiConnection[dbName].query(sql2,function (err,result) {
                  if(err){
                      console.log("1",err);
                      sendResponse.somethingWentWrongError(res);
                  }
                  else{
                     if(result.length){
                         for(var i=0;i<final.length;i++){
                             (function (i) {
                                 final[i].name_english="";
                                 final[i].name_arabic="";
                                 final[i].product_desc_english="";
                                 final[i].product_desc_arabic="";
                                 final[i].measuring_unit_english="";
                                 final[i].measuring_unit_arabic="";
  
                                 for(var j=0;j<result.length;j++){
                                     (function (j) {
                                         if(final[i].product_id == result[j].product_id ){
                                             if(result[j].language_id == 14){
                                                 final[i].name_english=result[j].name;
                                                 final[i].product_desc_english=result[j].product_desc;
                                                 final[i].measuring_unit_english=result[j].measuring_unit;
                                             }
                                             else {
                                                 final[i].name_arabic=result[j].name;
                                                 final[i].product_desc_arabic=result[j].product_desc;
                                                 final[i].measuring_unit_arabic=result[j].measuring_unit;
  
                                             }
                                             if(j==result.length-1){
                                                 if(i==final.length-1){
                                                     cb(null);
                                                 }
                                             }
                                         }
                                         else{
                                             if(j==result.length-1){
                                                 if(i==final.length-1){
                                                     cb(null);
                                                 }
                                             }
                                         }
                                     }(j))
                                 }
                             }(i))
                         }
                     }
                      else {
                         cb(null);
                     }
                  }
              })
          }],*/
        getPrice: ['getProduct', function (cb) {
            id = id.toString();
            // console.log("kbhdfs",id)
            var sql3 = 'select pp.start_date,pp.end_date,pp.price,pp.handling,pp.handling_supplier,pp.can_urgent,pp.urgent_type,pp.urgent_value,pp.product_id,pp.delivery_charges from product_pricing pp where pp.price_type = 0 and pp.product_id In (' + id + ') and pp.is_deleted =0 and pricing_type = 0';
            //  console.log("sql",sql3)
            multiConnection[req.dbName].query(sql3, function (err, result) {
                if (err) {
                    console.log("2", err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    // console.log("sss",result.length);
                    for (var i = 0; i < final.length; i++) {
                        (function (i) {
                            final[i].price = "";
                            final[i].handling_admin = "";
                            final[i].handling_supplier = "";
                            final[i].can_urgent = "";
                            final[i].urgent_type = "";
                            final[i].urgent_value = "";
                            final[i].start_date = "";
                            final[i].end_date = "";
                            for (var j = 0; j < result.length; j++) {
                                //console.log("eee",final[i].product_id,result[j].product_id);
                                (function (j) {
                                    if (final[i].product_id == result[j].product_id) {
                                        if (result[j].price) {
                                            final[i].price = result[j].price;
                                        } if (result[j].handling >= 0) {
                                            final[i].handling_admin = result[j].handling;
                                        } if (result[j].handling_supplier >= 0) {
                                            final[i].handling_supplier = result[j].handling_supplier;
                                        } if (result[j].can_urgent == 1 || result[j].can_urgent == 0) {
                                            final[i].can_urgent = result[j].can_urgent;
                                        } if (result[j].urgent_type == 0 || result[j].urgent_type == 0) {
                                            final[i].urgent_type = result[j].urgent_type;
                                        } if (result[j].urgent_value >= 0) {
                                            final[i].urgent_value = result[j].urgent_value;
                                        } if (result[j].start_date) {
                                            final[i].start_date = result[j].start_date;
                                        } if (result[j].end_date) {
                                            final[i].end_date = result[j].end_date;
                                        }

                                        if (j == (result.length - 1)) {
                                            if (i == (final.length - 1)) {
                                                cb(null);
                                            }
                                        }
                                    }
                                    else {
                                        if (j == (result.length - 1)) {
                                            if (i == (final.length - 1)) {
                                                cb(null);
                                            }
                                        }
                                    }
                                }(j))
                            }
                        }(i))
                    }
                }
            })
        }]

    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    });
}

exports.supplierProductsList = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplier_id = req.body.supplierId;
    var manValues = [accessToken, sectionId, supplier_id];
    var adminId;
    var data = {};
    var final = [];
    var id = [];
    async.auto({
        checkBlank: function (cb) {
            console.log("000-----------", manValues)
            func.checkBlank(res, manValues, cb);
        },
        authenticate: ['checkBlank', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null)

                }
            });
        }],
        checkAuthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, cb);
        }],
        getProduct: ['checkAuthority', function (cb) {
            var sql = 'SELECT p.id,p.bar_code,p.name,p.product_desc,p.measuring_unit,p.sku  FROM product p join supplier_product sp on p.id= sp.product_id WHERE p.is_deleted = 0 AND p.parent_id = 0 AND sp.supplier_id = ? AND sp.is_deleted =0 ';
            multiConnection[req.dbName].query(sql, [supplier_id], function (err, result) {
                if (err) {
                    console.log("0", err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (result.length) {
                        for (var i = 0; i < result.length; i++) {
                            (function (i) {
                                data.product_id = result[i].id;
                                data.bar_code = result[i].bar_code;
                                data.sku = result[i].sku;
                                data.product_name = result[i].name;
                                id.push(result[i].id);
                                final.push(data);
                                data = {};
                                if (i == result.length - 1) {
                                    cb(null);
                                }
                            }(i))
                        }
                    }
                    else {
                        cb(null)
                    }

                }
            })
        }],
        /*  getMultiName:['getProduct',function (cb) {
              id = id.toString();
              var sql2='select  pml.name,pml.product_desc,pml.measuring_unit,pml.language_id,pml.product_id from product_ml pml where product_id In ('+id+')';
              multiConnection[dbName].query(sql2,function (err,result) {
                  if(err){
                      console.log("1",err);
                      sendResponse.somethingWentWrongError(res);
                  }
                  else{
                      if(result.length){
                          final[i].name_english="";
                          final[i].name_arabic="";
                          final[i].product_desc_english="";
                          final[i].product_desc_arabic="";
                          final[i].measuring_unit_english="";
                          final[i].measuring_unit_arabic="";
  
                          for(var i=0;i<final.length;i++){
                              (function (i) {
                                  for(var j=0;j<result.length;j++){
                                      (function (j) {
                                          if(final[i].product_id == result[j].product_id ){
                                              if(result[j].language_id == 14){
                                                  final[i].name_english=result[j].name;
                                                  final[i].product_desc_english=result[j].product_desc;
                                                  final[i].measuring_unit_english=result[j].measuring_unit;
                                              }
                                              else {
                                                  final[i].name_arabic=result[j].name;
                                                  final[i].product_desc_arabic=result[j].product_desc;
                                                  final[i].measuring_unit_arabic=result[j].measuring_unit;
  
                                              }
                                              if(j==result.length-1){
                                                  if(i==final.length-1){
                                                      cb(null);
                                                  }
                                              }
                                          }
                                          else{
                                              if(j==result.length-1){
                                                  if(i==final.length-1){
                                                      cb(null);
                                                  }
                                              }
                                          }
                                      }(j))
                                  }
                              }(i))
                          }
                      }
                      else {
                          cb(null);
                      }
                  }
              })
          }],*/
        getPrice: ['getProduct', function (cb) {
            //console.log("......id....",id);
            if (id.length) {
                id = id.toString();
                //console.log("kbhdfs",id)
                var sql3 = 'select pp.start_date,pp.end_date,pp.price,pp.handling,pp.handling_supplier,pp.can_urgent,pp.urgent_type,pp.urgent_value,pp.product_id,pp.delivery_charges from product_pricing pp where pp.price_type = 0 and pp.product_id IN (' + id + ') and pp.is_deleted =0 and pp.pricing_type =0';
                //  console.log("sql",sql3)
                multiConnection[req.dbName].query(sql3, function (err, result) {
                    if (err) {
                        console.log("2", err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        if (result.length) {
                            for (var i = 0; i < final.length; i++) {
                                (function (i) {
                                    final[i].price = "";
                                    final[i].handling_admin = "";
                                    final[i].handling_supplier = "";
                                    final[i].can_urgent = "";
                                    final[i].urgent_type = "";
                                    final[i].urgent_value = "";
                                    final[i].start_date = "";
                                    final[i].end_date = ""
                                    for (var j = 0; j < result.length; j++) {
                                        //console.log("eee",final[i].product_id,result[j].product_id);
                                        (function (j) {
                                            if (final[i].product_id == result[j].product_id) {
                                                //   console.log("res",result[j])
                                                if (result[j].price) {
                                                    final[i].price = result[j].price;
                                                } if (result[j].handling >= 0) {
                                                    final[i].handling_admin = result[j].handling;
                                                } if (result[j].handling_supplier >= 0) {
                                                    final[i].handling_supplier = result[j].handling_supplier;
                                                } if (result[j].can_urgent == 1 || result[j].can_urgent == 0) {
                                                    final[i].can_urgent = result[j].can_urgent;
                                                } if (result[j].urgent_type == 0 || result[j].urgent_type == 0) {
                                                    final[i].urgent_type = result[j].urgent_type;
                                                } if (result[j].urgent_value >= 0) {
                                                    final[i].urgent_value = result[j].urgent_value;
                                                } if (result[j].start_date) {
                                                    final[i].start_date = result[j].start_date;
                                                } if (result[j].end_date) {
                                                    final[i].end_date = result[j].end_date;
                                                }
                                                if (j == (result.length - 1)) {
                                                    if (i == (final.length - 1)) {
                                                        cb(null);
                                                    }
                                                }
                                            }
                                            else {
                                                if (j == (result.length - 1)) {
                                                    if (i == (final.length - 1)) {
                                                        cb(null);
                                                    }
                                                }
                                            }
                                        }(j))
                                    }
                                }(i))
                            }
                        }
                        else {
                            for (var i = 0; i < final.length; i++) {
                                (function (i) {
                                    final[i].price = "";
                                    final[i].handling_admin = "";
                                    final[i].handling_supplier = "";
                                    final[i].can_urgent = "";
                                    final[i].urgent_type = "";
                                    final[i].urgent_value = "";
                                    final[i].start_date = "";
                                    final[i].end_date = ""
                                    if (i == (final.length - 1)) {
                                        cb(null);
                                    }
                                }(i))
                            }
                            cb(null);
                        }

                    }
                })
            }
            else {
                cb(null);
            }

        }]

    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}


exports.refreshButttons = function (req, res) {
    var suppllierId;
    var productIds;
    var suppllierBranchId;
    var branchAreaIds;
    var newProductIds = [];
    var dataProduct = [];
    var flag = true;
    async.auto({
        checkValue: function (cb) {


            suppllierId = req.body.supplierId;
            suppllierBranchId = req.body.suppllierBranchId;
            console.log(".......suppllierId........", suppllierId);
            console.log(".......suppllierBranchId........", suppllierBranchId);

            cb(null);
        },

        getSupplierProduct: ['checkValue', function (cb) {
            var sql = "select product_id,supplier_id from supplier_product where supplier_id = ? and is_deleted = 0"
            multiConnection[req.dbName].query(sql, [suppllierId], function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    productIds = result;
                    console.log("..--------------------------productIds-----------", productIds.length);
                    cb(null);
                }
            })
        }],

        getAllAreaBranch: ['checkValue', function (cb) {
            var sql = "select area_id from supplier_branch_delivery_areas where is_deleted = 0 and supplier_branch_id = ?";
            multiConnection[req.dbName].query(sql, [suppllierBranchId], function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    branchAreaIds = result;
                    console.log("............................branchAreaId////", branchAreaIds.length);
                    cb(null);
                }
            })
        }],
        deleteBranchProduct: ['getAllAreaBranch', function (cb) {
            deleteBranchData(req.dbName, suppllierBranchId, branchAreaIds, function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            })
        }],
        genrateNewProduct: ['getSupplierProduct', function (cb) {
            var lens = productIds.length;
            if (lens == 0) {
                return cb(null)
            }
            for (var j = 0; j < lens; j++) {
                (function (j) {
                    genrateNewProducts(req.dbName, productIds[j], function (err, result) {
                        if (err) {
                            cb(err);
                        } else {
                            console.log("*************************************result.*/*****", result);
                            newProductIds.push(result);
                            if (j == (lens - 1)) {
                                console.log(".........newProductIds..............", newProductIds);
                                cb(null);
                            }
                        }
                    })

                }(j));
            }
        }],

        productBranchDev: ['genrateNewProduct', function (cb) {
            var len = newProductIds.length;
            if (len == 0) {
                cb(null);
            }
            for (var i = 0; i < len; i++) {
                (function (i) {
                    insertValue(req.dbName, newProductIds[i], function (err, result) {
                        if (err) {
                            cb(null);
                        } else {
                            if (i == (len - 1)) {
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }],
        addBranchProduct: ['genrateNewProduct', 'getAllAreaBranch', function (cb) {
            var branchlen = branchAreaIds.length;

            for (var k = 0; k < branchlen; k++) {
                (function (k) {
                    supplierBranchData(req.dbName, newProductIds, branchAreaIds[k], suppllierBranchId, function (err, result) {
                        if (err) {
                            cb(err);
                        } else {
                            if (k == (branchlen - 1)) {
                                console.log("callback");
                                cb(null);
                            }
                        }
                    })
                }(k));
            }
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


var getprodcutCategory = function (productIds, callback) {
    var sql = "select 	category_id,sub_category_id,detailed_sub_category_id from product where id = ?";
    multiConnection[dbName].query(sql, [productIds], function (err, result) {
        console.log(".......................sucess delete product....................");
        if (err) {
            callback(err);
        } else {
            callback(null, result[0]);
        }
    })
}


var insertValue = function (dbName, dataValue, callback) {
    var sql = "insert into supplier_branch_product( category_id,sub_category_id,detailed_sub_category_id,product_id,original_product_id)" +
        " select category_id,sub_category_id, detailed_sub_category_id ,id,0 from product where id = ? ";
    multiConnection[dbName].query(sql, [dataValue], function (err, result) {
        console.log(".......................sucess delete product....................");
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    })

}

var deleteBranchData = function (dbName, suppllierBranchId, branchAreaIds, callback) {
    async.auto({
        supplierBranchProdcut: function (cb) {
            var sql = "delete from supplier_branch_product where supplier_branch_id = ?"
            multiConnection[dbName].query(sql, [suppllierBranchId], function (err, result) {
                console.log(".......................sucess delete product....................");
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            })
        },
        supplierAreaProduct: function (cb) {
            var len = branchAreaIds.length;
            if (len == 0) {
                cb(null)
            }
            for (var i = 0; i < len; i++) {
                (function (i) {
                    var sql = "delete from supplier_branch_area_product where supplier_branch_id = ? and area_id = ?"
                    multiConnection[dbName].query(sql, [suppllierBranchId, branchAreaIds[i].area_id], function (err, result) {
                        if (err) {
                            cb(err);
                        } else {
                            if (i == (len - 1)) {
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }
    }, function (err, result) {
        if (err) {
            callback(err)
        } else {
            callback(null);
        }
    })
}


var genrateNewProducts = function (dbName, productId, callback) {
    var newProductId;
    async.auto({
        productEntry: function (cb) {
            var sql = "insert into product( name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
                "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                "is_live,is_deleted,is_global,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type)" +
                " select name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id,sub_category_id," +
                "detailed_sub_category_id,commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                "is_live,is_deleted,0,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type from product where id = ? ";
            multiConnection[dbName].query(sql, [productId.product_id], function (err, result) {
                console.log(".............product enrty .....................", err);
                if (err) {
                    cb(err)
                } else {
                    newProductId = result.insertId
                    cb(null);
                }
            })
        },
        PriceEntry: ['productEntry', function (cb) {
            var sql = "insert into product_pricing( start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type," +
                "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,product_id) " +
                "select  start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type, " +
                "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,'?' from product_pricing where product_id = ? ";
            multiConnection[dbName].query(sql, [newProductId, productId.product_id], function (err, result) {


                if (err) {
                    cb(err);
                } else {
                    cb(null)
                }
            })
        }],
        ImageUpload: ['productEntry', function (cb) {
            var sql = "insert into product_image(image_path,product_id,imageOrder)" +
                " select image_path,'?',imageOrder from product_image where product_id = ? ";
            multiConnection[dbName].query(sql, [newProductId, productId.product_id], function (err, result) {

                console.log(".............image upload .....................", err);

                if (err) {
                    cb(err);
                } else {
                    cb(null)
                }
            })
        }],
        productMl: ['productEntry', function (cb) {
            var sql = "insert into product_ml( language_id,name,product_desc,measuring_unit,product_id)" +
                " select language_id,name,product_desc,measuring_unit,'?' from product_ml where product_id = ? ";
            multiConnection[dbName].query(sql, [newProductId, productId.product_id], function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb(null)
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, newProductId)
        }
    })
}


function supplierBranchData(dbName, product, areaId, supplierBranchId, callback) {


    /*    
        console.log(".......supplierBranchData........in********************************************************..",areaId);
        callback(null);*/

    async.auto({
        areaproduct: function (cb) {
            var prouductLength = product.length;
            var queryString = "(?,?,?),";
            var insertString = "";
            var values = [];
            for (var i = 0; i < prouductLength; i++) {
                (function (i) {
                    values.push(supplierBranchId, areaId, product[i]);
                    insertString = insertString + queryString;
                    if (i == (prouductLength - 1)) {
                        insertString = insertString.substring(0, insertString.length - 1);
                        var sql = "insert into supplier_branch_area_product(supplier_branch_id,area_id,product_id) values " + insertString;
                        multiConnection[dbName].query(sql, values, function (err, result) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                callback(null);
                            }
                        })
                    }
                }(i))
            }
        }
    }), function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null)
        }
    }




}


exports.branchProductList = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var manValues = [accessToken, sectionId, branchId];
    var adminId;
    var data = {};
    var final = [];
    var id = [];
    async.auto({
        checkBlank: function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        authenticate: ['checkBlank', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null)

                }
            });
        }],
        checkAuthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, cb);
        }],
        getProduct: ['checkAuthority', function (cb) {
            var sql = 'select distinct(p.id),p.name,p.bar_code,p.sku,count(sp.area_id) from ' +
                ' product p join supplier_branch_area_product sp on sp.product_id=p.id where sp.supplier_branch_id = ? and sp.is_deleted =0 and sp.area_id!=0 group by p.id '
            multiConnection[req.dbName].query(sql, [branchId], function (err, result) {
                if (err) {
                    console.log("0", err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (result.length) {
                        final = result;
                        cb(null);
                    }
                    else {
                        cb(null)
                    }

                }
            })
        }],

        /*  getPrice:['getProduct',function (cb) {
              if(id.length){
                  id = id.toString();
                  //console.log("kbhdfs",id)
                  var sql3='select pp.start_date,pp.end_date,pp.price,pp.handling,pp.handling_supplier,pp.can_urgent,pp.urgent_type,pp.urgent_value,pp.product_id,pp.delivery_charges from product_pricing pp where pp.price_type = 0 and pp.product_id IN ('+id+') and pp.is_deleted =0 and pp.pricing_type =0';
                  //  console.log("sql",sql3)
                  multiConnection[dbName].query(sql3,function (err,result) {
                      if(err){
                          console.log("2",err);
                          sendResponse.somethingWentWrongError(res);
                      }
                      else{
                          // console.log("sss",result.length);
  
                          if(result.length){
                              for(var i=0;i<final.length;i++){
                                  (function (i) {
                                      final[i].price="";
                                      final[i].handling_admin="";
                                      final[i].handling_supplier="";
                                      final[i].can_urgent="";
                                      final[i].urgent_type="";
                                      final[i].urgent_value="";
                                      final[i].start_date="";
                                      final[i].end_date=""
                                      for(var j=0;j<result.length;j++){
                                          //console.log("eee",final[i].product_id,result[j].product_id);
                                          (function (j) {
                                              if(final[i].product_id == result[j].product_id ){
                                                  //   console.log("res",result[j])
                                                  if(result[j].price){
                                                      final[i].price=result[j].price;
                                                  } if(result[j].handling>=0){
                                                      final[i].handling_admin=result[j].handling;
                                                  } if(result[j].handling_supplier >=0){
                                                      final[i].handling_supplier=result[j].handling_supplier;
                                                  } if(result[j].can_urgent == 1 || result[j].can_urgent == 0){
                                                      final[i].can_urgent=result[j].can_urgent;
                                                  } if(result[j].urgent_type==0 || result[j].urgent_type==0 ){
                                                      final[i].urgent_type=result[j].urgent_type;
                                                  } if(result[j].urgent_value>=0){
                                                      final[i].urgent_value=result[j].urgent_value;
                                                  } if(result[j].start_date){
                                                      final[i].start_date=result[j].start_date;
                                                  } if(result[j].end_date){
                                                      final[i].end_date=result[j].end_date;
                                                  }
                                                  if(j==(result.length-1))
                                                  {
                                                      if(i==(final.length-1)){
                                                          cb(null);
                                                      }
                                                  }
                                              }
                                              else{
                                                  if(j==(result.length-1)){
                                                      if(i==(final.length-1)){
                                                          cb(null);
                                                      }
                                                  }
                                              }
                                          }(j))
                                      }
                                  }(i))
                              }
                          }
                          else{
                              cb(null);
                          }
  
                      }
                  })
              }
              else {
                  cb(null);
              }
  
          }]*/

    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(final, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}
