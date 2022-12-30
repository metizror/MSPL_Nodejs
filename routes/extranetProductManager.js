

var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var loginFunctions = require('./loginFunctions');



exports.listPendingApprovalProducts = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    var product;
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
                loginFunctions.pendingApprovalProducts(req.dbName,res, function(err,result){
                    if(err){
                        cb(err);
                    }else{
                        product = result;
                        cb(null);
                    }
                });
            },
        function(cb){
            var len = product.length;
            for(var i =0;i <len;i++){
                (function(i){
                    var sql = "select name,language_id,product_id,	product_desc,measuring_unit from product_ml where product_id = ? ";
                    multiConnection[req.dbName].query(sql,[product[i].id],function(err,result)
                    {
                        if(err){
                            sendResponse.somethingWentWrongError(res);
                        }
                        else{
                            product[i].names = result;
                            if(i == (len -1)){
                                cb(null);
                            }

                        }
                    })
                }(i));
            }
        },
        function(cb){
            var len = product.length;
            for(var i =0;i <len;i++){
                (function(i){
                    var sql = "select image_path,product_id,imageOrder from product_image where product_id = ? ";
                    multiConnection[req.dbName].query(sql,[product[i].id],function(err,result)
                    {
                        if(err){
                            sendResponse.somethingWentWrongError(res);
                        }
                        else{
                            product[i].images = result;
                            if(i == (len -1)){
                                cb(null);
                            }
                        }
                    })
                }(i));
            }
        }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(product, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );

}


exports.approveProductByAdmin = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var productId = req.body.productId;
    var manValues = [accessToken, sectionId,productId];
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
                approveProduct(req.dbName,res,productId,cb);
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


function approveProduct(dbName,res,productId,callback)
{
    var sql = "update product set is_live = ? ,approved_by_admin = ? where id = ? limit 1"
    multiConnection[dbName].query(sql,[1,1,productId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null);
        }

    })

}