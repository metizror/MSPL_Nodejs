var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';


exports.getLoyaltyPoints = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
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
                loginFunctions.getLoyaltyPoints(req.dbName,res, cb);
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


exports.updateLoyaltyPoints = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var amount = req.body.amount;
    var commissionPackage = req.body.commissionPackage;
    var loyaltyPoints = req.body.loyaltyPoints;
    var manValues = [accessToken, sectionId, amount, loyaltyPoints,commissionPackage];
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
                updatePoints(req.dbName,res, amount,loyaltyPoints,commissionPackage, cb);
            }
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


exports.listSupplierBranchProductsForRedemptionPage = function (req, res) {
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
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
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


exports.updateLoyaltyPointsofBranch = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var branchId = req.body.branchId;
    var categoryId = req.body.categoryId;
    var subCategoryId = req.body.subCategoryId;
    var detailedSubCategoryId = req.body.detailedSubCategoryId;
    var productId = req.body.productId;
    var loyaltyPoints = req.body.loyaltyPoints;
    var manValues = [accessToken, sectionId, branchId, supplierId, categoryId, subCategoryId, detailedSubCategoryId, productId, loyaltyPoints];
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

                updateLoyaltyPointsBranch(req.dbName,res, supplierId, branchId, categoryId, subCategoryId, detailedSubCategoryId, productId, loyaltyPoints, cb);
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


exports.deleteLoyaltyPointsOfProduct = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var id = req.body.id;
    var manValues = [accessToken, sectionId,id];
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
                var ids=id.split('#').toString();
                deleteProductLoyaltyPoints(req.dbName,res,ids,cb);
            }
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


exports.listLoyaltyPointsOfProduct = function(req,res)
{
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
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
               listOfProductsWithLoyaltyPoints(req.dbName,res,branchId,categoryId,subCategoryId,detailedSubCategoryId,cb);
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

};


exports.delete_voucher = function(req,res){
    console.log("...........................req.........",req.body);
    var sql = "update supplier_product_loyalty_points set is_deleted = ? where id = ?";
   // var sql2 = "update supplier_product_loyalty_points set is_deleted = ? , points = ? where id = ? limit 1";


    multiConnection[req.dbName].query(sql, [1,req.body.voucherId], function (err, result) {
    console.log(".*******************************************",err,result);
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}



function updatePoints(dbName,res, amount, loyaltyPoints,commissionPackage, callback) {
    var sql = "select id from loyalty_points where commission_package = ? limit 1";
    multiConnection[dbName].query(sql, [commissionPackage],function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
//            console.log("kjbsdvkjbsd",result);
            if (result.length) {
                console.log("id",result[0].id);
                var sql2 = "update loyalty_points set amount_spent = ? , points = ? where id = ? limit 1";
                multiConnection[dbName].query(sql2, [amount, loyaltyPoints, result[0].id], function (err, result2) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        callback(null);
                    }
                })
            }
            else {

                var sql3 = "insert into loyalty_points(amount_spent,points,commission_package) values(?,?,?) ";
                multiConnection[dbName].query(sql3, [amount, loyaltyPoints,commissionPackage], function (err, result) {
                    if (err) {
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


function updateLoyaltyPointsBranch(dbName,res, supplierId, branchId, categoryId, subCategoryId, detailedSubCategoryId, productId, loyaltyPoints, callback) {
    var sql = "select id from supplier_product_loyalty_points where supplier_branch_id = ? and product_id = ? and is_deleted = ? limit 1"
  
    var statement = multiConnection[dbName].query(sql, [branchId, productId, 0], function (err, result) {
        if (err) {
            logger.debug("====================in the updateLoyaltyPointsBranch one==============",statement.sql,err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (result.length) {
                var sql2 = "update supplier_product_loyalty_points set loyalty_points = ? where id = ? limit 1";
                multiConnection[dbName].query(sql2, [loyaltyPoints, result[0].id], function (err, updated) {
                    if (err) {
                        logger.debug("====================in the updateLoyaltyPointsBranch two==============",statement.sql2,err)
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        callback(null);
                    }
                })

            }
            else {


                var sql3 = "insert into supplier_product_loyalty_points(supplier_id,supplier_branch_id,category_id,sub_category_id,detailed_sub_category_id,product_id,loyalty_points) values(?,?,?,?,?,?,?)";
                multiConnection[dbName].query(sql3, [supplierId, branchId, categoryId, subCategoryId, detailedSubCategoryId, productId, loyaltyPoints], function (err, result2) {
                    if (err) {
                        logger.debug("====================in the updateLoyaltyPointsBranch two==============",statement.sql3,err)
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        callback(null);
                    }


                })
            }
            
        }

    })
}


function listBranchProducts(dbName,res, branchId, categoryId, subCategoryId, detailedSubCategoryId, callback) {
    var sql = "select p.id,p.name,p.sku from supplier_branch_product sp join product p on sp.product_id = p.id ";
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


function  deleteProductLoyaltyPoints(dbName,res,ids,callback)
{
    var sql = "update supplier_product_loyalty_points set is_deleted = ? where id IN ("+ids+")";
    multiConnection[dbName].query(sql,[1],function(err,response)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null)
        }

    })

}


function  listOfProductsWithLoyaltyPoints(dbName,res,branchId,categoryId,subCategoryId,detailedSubCategoryId,callback)
{
    var sql = " select p.name,sp.id,sp.loyalty_points from supplier_product_loyalty_points sp join product p ";
    sql += " on sp.product_id = p.id where sp.supplier_branch_id = ? and sp.category_id = ? and sp.sub_category_id = ? ";
    sql += " and sp.detailed_sub_category_id = ? and sp.is_deleted = ? and p.is_deleted = ? and sp.is_deleted = ?";
    multiConnection[dbName].query(sql,[branchId,categoryId,subCategoryId,detailedSubCategoryId,0,0,0],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })

}