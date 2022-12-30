/**
 * Created by cbl98 on 6/6/16.
 */
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');
var packagesAndPromotions = require('./supplierPackagesAndPromotions')
var packages= require('./packagesAndPromotions')



exports.listBranches = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    var supplierId=0;
    var supplier_id=0;
    async.waterfall([
        
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else
                    {
                        cb(null,result);
                    }

                },1)
            },
            function (id,cb) {
                supplier_id=id;
                getId(req.dbName,res,id,cb);
            },
            // function (id, cb) {
            //     supplierId=id[0].supplier_id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
            //         if(err)
            //         {
            //             sendResponse.somethingWentWrongError(res);
            //         }
            //         else
            //         {
            //             cb(null);
            //         }
            //     });
            // },
            function (id, cb) {
                supplierId=id[0].supplier_id;
                packages.listSupplierBranches(req.dbName,res, supplierId, cb);

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


exports.listSupplierCategoriesForPackage = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = 0;
    var supplier_id=0;
    var manValues = [accessToken, sectionId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                      sendResponse.somethingWentWrongError(res);
                    }
                    else
                    {
                        cb(null,result);
                    }
                },1)
            },
            function (id,cb) {
                supplier_id=id;
               getId(req.dbName,res,id,cb);
            },
            // function (id, cb) {
            //     supplierId=id[0].supplier_id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
            //         if(err)
            //         {
            //          sendResponse.somethingWentWrongError(res);
            //         }
            //         else
            //         {
            //             cb(null);
            //         }
            //     });
            // },
            function (id, cb) {
                supplierId=id[0].supplier_id;
                packagesAndPromotions.listSupplierCategories(req.dbName,res, supplierId, cb);
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


exports.listBranchProducts = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, branchId, categoryId,subCategoryId,detailedSubCategoryId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
               func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else
                     {
                        cb(null,result);
                      }
               },1)
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res,function (err,result) {
            //         if(err)
            //         {
            //             sendResponse.somethingWentWrongError(res);
            //         }
            //         else
            //         {
            //             cb(null);
            //         }
            //     });
            // },
            function (id, cb) {
                packages.listBranchProductsOnPromotionsPage(req.dbName,res, branchId, categoryId,subCategoryId,detailedSubCategoryId, cb);

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


exports.listPackages = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, branchId, categoryId,subCategoryId,detailedSubCategoryId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
             function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                    sendResponse.somethingWentWrongError(res);
                    }
                    else
                    {
                        cb(null,result);
                    }
                },1)
             },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res,function (err,result) {
            //         if(err)
            //         {
            //             sendResponse.somethingWentWrongError(res);
            //         }
            //         else
            //         {
            //             cb(null);
            //         }
            //     });
            // },
            function (id, cb) {
                packages.listSupplierPackages(req.dbName,res, branchId, categoryId,subCategoryId,detailedSubCategoryId, cb);
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

exports.listPackagePricing = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var packageId = req.body.packageId;
    var supplier_id,supplierId;
    var manValues = [accessToken, sectionId,packageId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                if(err)
                {
                    sendResponse.somethingWentWrongError(res);
                }
                else
                {
                    cb(null,result);
                }
            },1)
         },
        //  function (id, cb) {
        //      supplier_id=id;
        //      func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res,function (err,result) {
        //         if(err)
        //         {
        //             sendResponse.somethingWentWrongError(res);
        //         }
        //         else
        //         {
        //             cb(null);
        //         }
        //     });
        // },
        function (id, cb) {
            supplier_id=id;
            getId(req.dbName,res,supplier_id,cb);
        },
            function (id,cb) {
                supplierId=id[0].supplier_id
                listPackagePriceDetails(res,packageId,id, cb);
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


exports.addPackage = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productIds = req.body.productIds; // separated by #
    var supplierId = 0;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
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
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var displayPrice = req.body.displayPrice;
    var price = req.body.price;
    var manValues = [accessToken, sectionId, measuringUnit, supplierId, measuringUnit, categoryId, subCategoryId, detailedSubCategoryId, name, languageId, priceUnit, description, sku, count, commission, commissionPackage, commissionType, productIds, branchId,startDate,endDate,displayPrice,price];
    var folder = "abc";
    var names;
    var languages;
    var descriptions;
    var imageName = [];
    var productId;
    var supplier_id=0;
    //console.log(req.body);
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                      sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null, result);
                    }
                },1)
            },
            function (id,cb) {
                supplier_id=id;
                getId(req.dbName,res,id,cb);
            },
            // function (id, cb) {
            //     supplierId=id[0].supplier_id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
            //         if(err)
            //         {
            //             console.log("7.",err);
            //          sendResponse.somethingWentWrongError(res);
            //         }
            //         else
            //         {
            //          cb(null);
            //         }
            //    });
            //  },
             function (id, cb) {
                supplierId=id[0].supplier_id;
                names = name.split("#");
                languages = languageId.split("#");
                descriptions = description.split("#");
                measuringUnit = measuringUnit.split("#");
                insertPackageBySupplier(req.dbName,res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, names[0], priceUnit, descriptions[0], sku, barCode, commission, commissionType, commissionPackage, measuringUnit[0], cb);
            },
            function (id, cb) {
                productId = id;
                insertPackageNameInMultiLanguage(req.dbName,res, productId, names, descriptions, languages, measuringUnit, cb);
            },
            function (cb) {
                for (var i = 0; i < count; i++) {
                    (function (i) {
                        async.waterfall([
                            function (cbs) {
                                func.uploadImageFileToS3Bucket(res, image[i], folder, cbs);
                            }
                        ], function (err2, response2) {
                            imageName.push(response2);
                            //console.log("==============response2===============" + response2);
                            if (imageName.length == count) {
                                //console.log("==========imagename===========" + JSON.stringify(imageName));
                                cb(null);
                            }
                        })
                    }(i))
                }
            },
            function (cb) {
                insertPackageImages(req.dbName,res, imageName, productId, cb);
            },
            function (id, cb) {
                updateDefaultImage(req.dbName,res, id, cb);
            },
            function (cb) {
                assignPackageToSupplier(req.dbName,res, supplierId, branchId, productId.toString(), categoryId.toString(), subCategoryId.toString(), detailedSubCategoryId.toString(),startDate,endDate,displayPrice,price,cb);
            },
            function (cb) {
                insertPackageProducts(req.dbName,res, supplierId, branchId, productId, productIds.toString(), cb);
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


exports.deletePackage = function(req,res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var packageId = req.body.packageId;
    var manValues = [accessToken, sectionId,packageId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
           function (cb) {
               func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                   if(err)
                   {
                       sendResponse.somethingWentWrongError(res);
                   }
                   else
                   {
                       cb(null,result);
                  }
                },1)
          },
        //   function (id, cb) {
        //       func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res,function (err,result) {
        //            if(err)
        //            {
        //                sendResponse.somethingWentWrongError(res);
        //            }
        //            else
        //             {
        //              cb(null);
        //             }
        //         });
        //     },  
            function (id, cb) {
                deletePackage(req.dbName,res,packageId,cb);
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


exports.addPromotion = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = 0;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var promotionType = req.body.promotionType;
    var promotionName = req.body.promotionName;
    var promotionDescription = req.body.promotionDescription;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var promotionImage = req.files.promotionImage;
    var languageId = req.body.languageId;
    var offerProduct1 = req.body.offerProduct1;
    var offerProduct2 = req.body.offerProduct2;
    var manValues = [accessToken, sectionId, supplierId, branchId, categoryId, promotionType, promotionName, promotionDescription,startDate,endDate, languageId, offerProduct1, offerProduct2,subCategoryId,detailedSubCategoryId];
    var folder = "abc";
    var supplier_id=0;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
             function (cb) {
                 func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                  if(err)
                    {
                     sendResponse.somethingWentWrongError(res);
                    }
                  else
                    {
                        cb(null,result);
                    }
                 },1)
             }, 
            function (id,cb) {
                supplier_id=id;
                getId(req.dbName,res,id,cb);
            },
            // function (id, cb) {
            //     supplierId=id[0].supplier_id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,sectionId, res,function (err,result) {
            //         if(err) 
            //         {
            //             sendResponse.somethingWentWrongError(res);
            //         } 
            //         else 
            //         {
            //             cb(null);
            //         }
            //     });
            // },
            function (id, cb) {
                supplierId=id[0].supplier_id;
                func.uploadImageFileToS3Bucket(res, promotionImage, folder, cb);
            },
            function (imageUrl,cb) {
                promotionName = promotionName.split("#");
                promotionDescription = promotionDescription.split("#");
                languageId = languageId.split("#");
                insertPromotions(req.dbName,res, promotionName[0], promotionDescription[0], imageUrl, supplierId, branchId, promotionType,startDate,endDate, offerProduct1, offerProduct2, categoryId,subCategoryId,detailedSubCategoryId, cb);
            },
            function (promotionId,cb) {
                insertPromotionInMultiLanguages(req.dbName,res,promotionId,promotionName,promotionDescription,languageId,cb);
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


exports.listPromotions = function(req,res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var promotionType = req.body.promotionType;
    var manValues = [accessToken, sectionId, branchId, categoryId,promotionType];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                   func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                     sendResponse.somethingWentWrongError(res);
                    }
                    else
                    {
                        cb(null,result);
                    }
                },1)
            }, 
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res,function (err,result) {
            //         if(err) 
            //         {
            //          sendResponse.somethingWentWrongError(res);
            //         } 
            //         else 
            //         {
            //         cb(null);
            //         }
            //     });
            // },
            function (id, cb) {
                listSupplierBranchPromotions(req.dbName,res, branchId, categoryId,promotionType, cb);
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


exports.deletePromotion = function(req,res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var manValues = [accessToken, sectionId,id];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
               func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                   if(err) 
                   {
                       sendResponse.somethingWentWrongError(res);
                   } 
                   else 
                   {
                       cb(null,result);
                   }
               },1)
            },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res,function (err,result) {
            //         if(err) {
            //         sendResponse.somethingWentWrongError(res);
            //         } 
            //         else {
            //             cb(null);
            //         }
            //     });
            // },
            function (id, cb) {
                deletePromotion(req.dbName,res,id,cb);
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


function  deletePackage(dbName,res,packageId,callback) {
    var sql = "update product set is_deleted = ? where id = ? limit 1";
    multiConnection[dbName].query(sql,[1,packageId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            var sql2 = "update supplier_package set is_deleted = ? where package_id = ? limit 1";
            multiConnection[dbName].query(sql2,[1,packageId],function(err,result3)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else{
                    callback(null,[]);
                }

            })
        }

    })


}


function listSupplierBranchPromotions(dbName,res, branchId, categoryId,type, callback) {
    if(type == 0 || type == 1)
    {
        var sql = "select p.id,p.promotion_image,p.promotion_price,pr1.name product1,pr2.name product2,p.start_date,p.end_date from supplier_branch_promotions p ";
        sql += " join product pr1 on p.offer_product_value = pr1.id join product pr2 on p.product_id_2 = pr2.id where ";
        sql += " p.supplier_branch_id = ? and p.category_id = ? and p.is_deleted = ? and p.promotion_type = ?";
        multiConnection[dbName].query(sql,[branchId,categoryId,0,type],function(err,result)
        {
            if(err){
                sendResponse.somethingWentWrongError(res);
            }
            else{
                var promotionLength = result.length;
                if(promotionLength){
                    var sql2 = "select p.promotion_id,p.promotion_name,p.promotion_description,p.language_id,l.language_name from ";
                    sql2 += "promotions_ml p join language l on p.language_id = l.id ";
                    multiConnection[dbName].query(sql2,function(err,result2)
                    {
                        if(err){
                            sendResponse.somethingWentWrongError(res)
                        }
                        else{
                            var mlLength = result2.length;
                            for( var  i = 0 ;i < promotionLength ; i++)
                            {
                                (function(i)
                                {
                                    var ml = [];
                                    for( var j = 0 ; j < mlLength ; j++)
                                    {
                                        (function(j)
                                        {
                                            if(result[i].id == result2[j].promotion_id)
                                            {
                                                ml.push(result2[j]);
                                                if(j == mlLength - 1)
                                                {
                                                    result[i].names = ml;
                                                    if(i == promotionLength - 1)
                                                    {
                                                        callback(null,result);
                                                    }
                                                }
                                            }
                                            else{
                                                if(j == mlLength - 1)
                                                {
                                                    result[i].names = ml;
                                                    if(i == promotionLength - 1)
                                                    {
                                                        callback(null,result);
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
                else{
                    callback(null,[])
                }
            }

        })
    }
    else{
        var sql = "select p.id,p.promotion_image,p.promotion_price,p.offer_product_value product1,pr1.name product2,p.start_date,p.end_date from supplier_branch_promotions p ";
        sql += " join product pr1 on p.product_id_2 = pr1.id where p.supplier_branch_id = ? and p.category_id = ? and p.is_deleted = ? and p.promotion_type = ?";
        multiConnection[dbName].query(sql,[branchId,categoryId,0,type],function(err,result)
        {
            if(err){
                sendResponse.somethingWentWrongError(res);
            }
            else{
                var promotionLength = result.length;
                if(promotionLength){
                    var sql2 = "select p.promotion_id,p.promotion_name,p.promotion_description,p.language_id,l.language_name from ";
                    sql2 += "promotions_ml p join language l on p.language_id = l.id ";
                    multiConnection[dbName].query(sql2,function(err,result2)
                    {
                        if(err){
                            sendResponse.somethingWentWrongError(res)
                        }
                        else{
                            var mlLength = result2.length;
                            for( var  i = 0 ;i < promotionLength ; i++)
                            {
                                (function(i)
                                {
                                    var ml = [];
                                    for( var j = 0 ; j < mlLength ; j++)
                                    {
                                        (function(j)
                                        {
                                            if(result[i].id == result2[j].promotion_id)
                                            {
                                                ml.push(result2[j]);
                                                if(j == mlLength - 1)
                                                {
                                                    result[i].names = ml;
                                                    if(i == promotionLength - 1)
                                                    {
                                                        callback(null,result);
                                                    }
                                                }
                                            }
                                            else{
                                                if(j == mlLength - 1)
                                                {
                                                    result[i].names = ml;
                                                    if(i == promotionLength - 1)
                                                    {
                                                        callback(null,result);
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
                else{
                    callback(null,[])
                }
            }

        })
    }


}


function  deletePromotion(dbName,res,id,callback) {
    
    console.log("......deletePromotion....",res,id);
    var sql = "update supplier_branch_promotions set is_deleted = ? where id = ? limit 1";
    multiConnection[dbName].query(sql,[1,id],function(err,result)
    {
        
        console.log(".....err.......delete promotion....result..........",err,result);
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null);
        }

    })

}


function insertPromotions(dbName,res, promotionName, promotionDescription, imageUrl, supplierId, branchId, promotionType,startDate,endDate, offerProduct1, offerProduct2, categoryId,subCategoryId,detailedSubCategoryId, callback) {
    var sql = "insert into supplier_branch_promotions(supplier_id,supplier_branch_id,category_id,offer_product_value,product_id_2,promotion_type,promotion_name,start_date,end_date,promotion_image,promotion_description,sub_category_id,detailed_sub_category_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
    multiConnection[dbName].query(sql, [supplierId, branchId, categoryId, offerProduct1, offerProduct2, promotionType, promotionName, startDate,endDate, imageUrl, promotionDescription,subCategoryId,detailedSubCategoryId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, result.insertId);
        }

    })

}


function insertPromotionInMultiLanguages(dbName,res,promotionId,promotionName,promotionDescription,languageId,callback) {
    var promotionLength = promotionName.length;
    var values = [];
    var queryString = "";
    var insertString = "(?,?,?,?),";
    for(var i = 0 ; i < promotionLength ;i++)
    {
        (function(i)
        {
            values.push(promotionId,promotionName[i],promotionDescription[i],languageId[i]);
            queryString = queryString + insertString;
            if(i == promotionLength - 1)
            {
                queryString = queryString.substring(0,queryString.length - 1);
                var sql = "insert into promotions_ml(promotion_id,promotion_name,promotion_description,language_id) values "+queryString;
                multiConnection[dbName].query(sql,values,function(err,result)
                {
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{
                        callback(null);
                    }

                })

            }

        }(i))
    }

}


function listBranchProductsOnPromotionsPage(dbName,res, branchId, categoryId,subCategoryId,detailedSubCategoryId, callback) {
    var sql = "select b.product_id,p.name,pr.price from supplier_branch_product b join product p on b.product_id = p.id join ";
    sql += "product_pricing pr on p.id = pr.product_id where b.supplier_branch_id = ? and b.category_id = ? and b.sub_category_id = ? and b.detailed_sub_category_id = ? and b.is_deleted = ? and ((pr.price_type = 1 and DATE(pr.start_date) <= CURDATE() and DATE(pr.end_date) >= CURDATE()) or (pr.price_type = 0)) and pr.is_deleted = ?";
    multiConnection[dbName].query(sql, [branchId, categoryId,subCategoryId,detailedSubCategoryId, 0, 0,0], function (err, result) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })
}


exports.listSupplierCategories=function(dbName,res, supplierId, callback) {
    

    // var sql = "select s.category_id,c.name from supplier_category s join categories c on s.category_id = c.id where s.supplier_id = ? group by s.category_id ";
    // multiConnection[dbName].query(sql, [supplierId], function (err, result) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res)
    //     }
    //     else {
    //         callback(null, result);
    //     }

    // })
    console.log("INSIDE CATEGORY FUNCTION");
    var sql = "select IF((select count(*)  from product  where  product.category_id=c.id and product.sub_category_id=c.id and product.detailed_sub_category_id=c.id) > 0, 1, 0) as is_product,IF((select COUNT(*) from categories cts where cts.parent_id=c.id )>0,1,0) as is_sub_category, c.id, s.supplier_id, c.parent_id, c.category_flow, c.is_agent, c.agent_list, c.is_quantity, c.type, c.is_variant, c.id, "+
    "c.image, c.icon, c.illustration, c.is_live, c.id, c.start_time,c.tax, c.end_time from supplier_category s join categories c on s.category_id = c.id "+
    "where s.supplier_id = ? and c.parent_id = ? and c.is_deleted = ? group by category_id"
    multiConnection[dbName].query(sql, [supplierId,0, 0], function (err, categories) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var category = [];
            var categoryLength = categories.length;
            if (categoryLength == 0) {
                callback(null, category);
            }
            else {
                var sql2 = "select cm.language_id,cm.name,cm.description,cm.category_id,cm.id,l.language_name from categories_ml cm join language l ";
                sql2 += " on l.id = cm.language_id";
                multiConnection[dbName].query(sql2, function (err, categoryMl) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        var categoryMllength = categoryMl.length;
                        for (var i = 0; i < categoryLength; i++) {
                            (function (i) {
                                var categoriesMl = [];
                                for (var j = 0; j < categoryMllength; j++) {
                                    (function (j) {
                                        if (categories[i].id == categoryMl[j].category_id) {
                                            categoriesMl.push({
                                                "id": categoryMl[j].id,
                                                "name": categoryMl[j].name,
                                                "language_id": categoryMl[j].language_id,
                                                "language_name": categoryMl[j].language_name,
                                                "description": categoryMl[j].description
                                            });
                                            if (j == categoryMllength - 1) {
                                                category.push({
                                                    "category_id": categories[i].id,
                                                    "image": categories[i].image,
                                                    "icon": categories[i].icon,
                                                    "illustration": categories[i].illustration,
                                                    "is_live": categories[i].is_live,
                                                    "is_variant": categories[i].is_variant,
                                                    "category_flow": categories[i].category_flow,
                                                    "is_agent": categories[i].is_agent,
                                                    "agent_list": categories[i].agent_list,
                                                    "is_quantity": categories[i].is_quantity,
                                                    "type": categories[i].type,
                                                    "start_time":categories[i].start_time,
                                                    "end_time":categories[i].end_time,
                                                    "is_product":categories[i].is_product,
                                                    "is_sub_category": categories[i].is_sub_category,
                                                    "tax":categories[i].tax,
                                                    "category_name": categoriesMl
                                                });
                                                if (i == categoryLength - 1) {
                                                    callback(null, category);
                                                }
                                            }

                                        }
                                        else {
                                            if (j == categoryMllength - 1) {
                                                category.push({
                                                    "category_id": categories[i].id,
                                                    "image": categories[i].image,
                                                    "icon": categories[i].icon,
                                                    "illustration": categories[i].illustration,
                                                    "is_live": categories[i].is_live,
                                                    "category_name": categoriesMl,
                                                    "is_variant": categories[i].is_variant,
                                                    "category_flow": categories[i].category_flow,
                                                    "is_agent": categories[i].is_agent,
                                                    "agent_list": categories[i].agent_list,
                                                    "is_quantity": categories[i].is_quantity,
                                                    "start_time":categories[i].start_time,
                                                    "end_time":categories[i].end_time,
                                                    "type": categories[i].type,
                                                    "is_product":categories[i].is_product,
                                                    "is_sub_category": categories[i].is_sub_category,
                                                    "tax":categories[i].tax
                                                });
                                                if (i == categoryLength - 1) {
                                                    callback(null, category);
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

        }

    })


}


function listSupplierBranches(dbName,res, supplierId, callback) {
    var sql = "select id,name,branch_name from supplier_branch where supplier_id = ? and is_deleted = ?"
    multiConnection[dbName].query(sql, [supplierId, 0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result)
        }

    })

}

exports.addPricingOfPackage = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var packageId = req.body.packageId;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var price = req.body.price;
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
    var productPricingId = req.body.productPricingId;
    var type = req.body.type; // 0-- admin, 1 -- supplier, 2 -- supplier branch
    var id = req.body.id,supplier_id; // supplier id or supplier branch id
    var manValues = [accessToken, sectionId, packageId, startDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, type, id];
    var adminId;
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                    sendResponse.somethingWentWrongError(res);
                    }
                    else
                    {
                        cb(null,result);
                    }
                },1)
             },
            // function (id, cb) {
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res,function (err,result) {
            //         if(err)
            //         {
            //             sendResponse.somethingWentWrongError(res);
            //         }
            //         else
            //         {
            //             cb(null);
            //         }
            //     });
            // },
            function (id, cb) {
                if (req.body.houseCleaningPrice) {
                    insertProductPricing(req.dbName,res, packageId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, productPricingId, req.body.houseCleaningPrice, 0, type, id, cb);
                }
                else if (req.body.beautySaloonPrice) {
                    insertProductPricing(req.dbName,res, packageId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, productPricingId, 0, req.body.beautySaloonPrice, type, id, cb);
                }
                else {
                    insertProductPricing(req.dbName,res, packageId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, productPricingId, 0, 0, type, id, cb);
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

function insertProductPricing(dbName,res, productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, minOrder, chargesBelowMinOrder, areaId, urgentType, offerType, productPricingId, houseCleaningCharge, beautySaloonCharge, type, id, callback) {

    if (offerType == 0) {
        var sql = "select id from product_pricing where product_id = ? and is_deleted = ? limit 1";
        multiConnection[dbName].query(sql, [productId, 0], function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                if (result.length) {
                    if (type == 0) {
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,delivery_charges = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, productId, offerType], function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                callback(null);
                            }
                        })
                    }

                    else if (type == 1) {

                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, productId, offerType], function (err, result) {
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
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, productId, offerType], function (err, result) {
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
                    var sql = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price) values(?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    multiConnection[dbName].query(sql, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge], function (err, result) {
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
        var sql = "select id from product_pricing where product_id = ? and is_deleted = ? and price_type = ? and (start_date BETWEEN '" + startDate + "' and '" + endDate + "') or (end_date BETWEEN '" + startDate + "' and '" + endDate + "')  limit 1";
        multiConnection[dbName].query(sql, [productId, offerType, 0], function (err, result) {
            if (err) {
                console.log("errror", err);
                sendResponse.somethingWentWrongError(res);
            }
            else {
                if (result.length) {
                    if (type == 0) {
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,delivery_charges = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, productId, offerType], function (err, result) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                callback(null);
                            }
                        })
                    }

                    else if (type == 1) {

                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, productId, offerType], function (err, result) {
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
                        var sql = "update product_pricing set start_date = ?,end_date = ?,price = ?,handling = ?,handling_supplier = ?,can_urgent = ?,urgent_price = ?,urgent_type = ?,price_type = ?,house_cleaning_price = ?,beauty_saloon_price=? where product_id = ? and price_type = ? limit 1"
                        multiConnection[dbName].query(sql, [startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, urgentType, offerType, houseCleaningCharge, beautySaloonCharge, productId, offerType], function (err, result) {
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
                    var sql = "insert into product_pricing(product_id,start_date,end_date,price,handling,handling_supplier,can_urgent,urgent_price,delivery_charges,urgent_type,price_type,house_cleaning_price,beauty_saloon_price) values(?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    multiConnection[dbName].query(sql, [productId, startDate, endDate, price, handlingFeeAdmin, handlingFeeSupplier, isUrgent, urgentPrice, deliveryCharges, urgentType, offerType, houseCleaningCharge, beautySaloonCharge], function (err, result) {
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

}
function listSupplierPackages(res, branchId, categoryId,subCategoryId,detailedSubCategoryId, callback) {

    var packages;
    var packageProducts;
    async.auto({
        package: function (cb) {
            getPackageDetails(res, branchId, categoryId,subCategoryId,detailedSubCategoryId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    if (result.length) {
                        packages = result;
                        cb(null);
                    }
                    else {
                        callback(null, [])
                    }

                }

            });
        },
        packageProducts: function (cb) {
            listSupplierPackageProducts(res, branchId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    packageProducts = result;
                    cb(null);
                }
            })
        },
        final: ['package', 'packageProducts', function (cb) {
            clubPackageProducts(res, packageProducts, packages, cb);

        }]

    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, result.final);
        }

    })

}


function getPackageDetails(dbName,res, branchId, categoryId,subId,detailedId, callback) {
    var sql = "select p.id,p.bar_code,p.sku,p.category_id,p.commission_type,p.commission,p.commission_package, ";
    sql += " p.recurring_possible,p.scheduling_possible,p.is_live,sp.start_date,sp.end_date,sp.display_price,sp.price from supplier_package sp join product p on ";
    sql += " sp.package_id = p.id where sp.supplier_branch_id = ? and sp.is_deleted = ? and sp.category_id = ? ";
    sql +=" and sp.sub_category_id = ? and sp.detailed_sub_category_id = ?";
    multiConnection[dbName].query(sql, [branchId, 0, categoryId,subId,detailedId], function (err, products) {
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
                                                "name": productMultiLanguage[j].name,
                                                "langauge_id": productMultiLanguage[j].language_id,
                                                "language_name": productMultiLanguage[j].language_name,
                                                "package_desc": productMultiLanguage[j].product_desc,
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


function listSupplierPackageProducts(dbName,res, branchId, callback) {
    var sql = "select p.id,p.name,sp.package_id from supplier_package_product sp join product p ";
    sql += " on sp.product_id = p.id where sp.is_deleted = ? and p.is_deleted = ? and sp.supplier_branch_id = ?";
    multiConnection[dbName].query(sql, [0, 0, branchId], function (err, products) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            //console.log("products", products)
            callback(null, products);
        }
    })
}


function clubPackageProducts(res, packageProducts, packages, callback) {
    var packageLength = packages.length;
    var packageProductsLength = packageProducts.length;
    for (var i = 0; i < packageLength; i++) {
        (function (i) {
            var products = [];

            for (var j = 0; j < packageProductsLength; j++) {
                (function (j) {
                    if (packages[i].id == packageProducts[j].package_id) {
                        products.push(packageProducts[j]);
                        if (j == packageProductsLength - 1) {
                            packages[i].products = products;
                            if (i == packageLength - 1) {
                                callback(null, packages);
                            }
                        }
                    }
                    else {
                        if (j == packageProductsLength - 1) {
                            packages[i].products = products;
                            if (i == packageLength - 1) {
                                callback(null, packages);
                            }
                        }
                    }

                }(j))

            }

        }(i))

    }
}


function insertPackageBySupplier(dbName,res, supplierId, categoryId, subCategoryId, detailedSubCategoryId, name, priceUnit, description, sku, barCode, commission, commissionType, commissionPackage, measuringUnit, callback) {
    var sql = "insert into product(name,price_unit,bar_code,product_desc,sku,category_id,sub_category_id,detailed_sub_category_id,is_global,created_by,added_by,commission,commission_type,commission_package,measuring_unit,is_package) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    multiConnection[dbName].query(sql, [name, priceUnit, barCode, description, sku, categoryId, subCategoryId, detailedSubCategoryId, 0, supplierId, 1, commission, commissionType, commissionPackage, measuringUnit, 1], function (err, result) {
        if (err) {
            console.log("6.",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result.insertId);

        }

    });
}


function insertPackageNameInMultiLanguage(dbName,res, productId, names, descriptions, languages, measuringUnit, callback) {
    var values = [];
    var queryString = "(?,?,?,?,?),";
    var insertString = "";
    for (var i = 0; i < names.length; i++) {
        (function (i) {
            values.push(productId, names[i], languages[i], descriptions[i], measuringUnit[i]);
            insertString = insertString + queryString;
            if (i == names.length - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
                var sql = "insert into product_ml(product_id,name,language_id,product_desc,measuring_unit) values " + insertString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        console.log("5.",err);
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


function insertPackageImages(dbName,res, imageName, productId, callback) {
    var values = [];
    var queryString = "(?,?),";
    var insertString = "";

    for (var i = 0; i < imageName.length; i++) {
        (function (i) {
            values.push(productId, imageName[i]);
            insertString = insertString + queryString;
            if (i == imageName.length - 1) {
                insertString = insertString.substring(0, insertString.length - 1);
                var sql = "insert into product_image(product_id,image_path) values " + insertString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        console.log("4.",err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        callback(null, result.insertId);
                    }

                })
            }

        }(i))
    }

}


function assignPackageToSupplier(dbName,res, supplierId, branchId, productId, categoryId, subCategoryId, detailedSubCategoryId,startDAte,endDate,displayPrice,price, callback) {


    var sql = "insert into supplier_package(supplier_id,supplier_branch_id,package_id,category_id,sub_category_id,detailed_sub_category_id,start_date,end_date,display_price,price) values (?,?,?,?,?,?,?,?,?,?)";
    multiConnection[dbName].query(sql,[supplierId, branchId, productId, categoryId, subCategoryId, detailedSubCategoryId,startDAte,endDate,displayPrice,price], function (err, result) {
        if (err) {
            console.log("2..",err);
            sendResponse.somethingWentWrongError(res);

        } else {

            callback(null)
        }

    });


    // var productIds = productId.split("#");
    // var categoryIds = categoryId.split("#");
    // var subCategoryIds = subCategoryId.split("#");
    // var detailedSubCategoryIds = detailedSubCategoryId.split("#");
    // var queryString = "(?,?,?,?,?,?,?,?,?,?),";
    // var insertString = "";
    // var values = [];
    // for (var i = 0; i < productIds.length; i++) {
    //     (function (i) {
    //         values.push(supplierId, branchId, productIds[i], categoryIds[i], subCategoryIds[i], detailedSubCategoryIds[i]);
    //         insertString = insertString + queryString;
    //         if (i == productIds.length - 1) {
    //             insertString = insertString.substring(0, insertString.length - 1);
    //             var sql = "insert into supplier_package(supplier_id,supplier_branch_id,package_id,category_id,sub_category_id,detailed_sub_category_id,start_date,end_date,display_price,price) values " + insertString;
    //             multiConnection[dbName].query(sql, values, function (err, result) {
    //                 if (err) {
    //                     console.log(err);
    //                     sendResponse.somethingWentWrongError(res);
    //
    //                 } else {
    //
    //                     callback(null)
    //                 }
    //
    //             })
    //
    //         }
    //
    //     }(i))
    //
    // }
}


function insertPackageProducts(dbName,res, supplierId, branchId, productId, productIds, callback) {

    productIds = productIds.split("#");
    var queryString = "";
    var values = [];
    var insertString = "(?,?,?,?),";
    for (var i = 0; i < productIds.length; i++) {
        (function (i) {
            values.push(supplierId, branchId, productId, productIds[i]);
            queryString = queryString + insertString;
            if (i == productIds.length - 1) {
                queryString = queryString.substring(0, queryString.length - 1);
                var sql = "insert into supplier_package_product(supplier_id,supplier_branch_id,package_id,product_id) values " + queryString;
                multiConnection[dbName].query(sql, values, function (err, result) {
                    if (err) {
                        console.log("1.",err);
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


function updateDefaultImage(dbName,res, id, callback) {
    var sql = "update product_image set default_image = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, [1, id], function (err, result) {
        if (err) {
            console.log("3.",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })

}


// function getId(dbName,res,id,cb){
//     var sql='select supplier_id from supplier_admin where id=?';
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
function getId(dbName, res, id, cb) {
    var sql = 'select supplier_id from supplier_admin where id=?';
    multiConnection[dbName].query(sql, [id], function (err, result) {
        if (err) {
            console.log('error------', err);
            sendResponse.somethingWentWrongError(res);

        }
        else {
            //console.log('result-----',id);
            if (result.length) {
                cb(null,result);
            } else {
                var sql = 'select supplier_id from supplier_branch where id=?';
                multiConnection[dbName].query(sql, [id], function (err, result) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        //console.log('result-----',id);
                        if (result.length){
                            cb(null, result);
                        }else{
                            sendResponse.somethingWentWrongError(res);
                        }
                    }
                })
            }

        }
    })
}

exports.listSupplierBranchProducts = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var manValues = [accessToken, sectionId, branchId, categoryId, subCategoryId, detailedSubCategoryId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res,function(err,result){
                    if(err)
                    {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else
                    {
                        cb(null,result);
                    }
                },1)
            },
            function (cb) {
                listBranchProducts(req.dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId, cb);
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


function listBranchProducts(dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId, callback) {
    var sql = "select p.id,p.name from supplier_branch_product sp join product p on sp.product_id = p.id ";
    sql += " where sp.supplier_branch_id = ? and sp.category_id = ? and sp.sub_category_id = ? and ";
    sql += " sp.detailed_sub_category_id = ? and p.is_deleted = ?";
    multiConnection[dbName].query(sql, [branchId, categoryId, subCategoryId, detailedSubCategoryId, 0], function (err, result) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {


            callback(null, result);
        }

    })
}
