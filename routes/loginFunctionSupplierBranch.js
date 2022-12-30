/**
 * Created by cbl97 on 13/5/16.
 */
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');

/*
*=-------------
*  section id 11 tab info
*
*/

exports.getSupplierData =function (dbName,supplierBranchId, res, callback) {

  //  console.log("Hello from case 11=================");
    var supplierData = {};
    var namesData;
    var dataToBeSent = {};
    var categoryData;
    async.waterfall([
        function (callback) {

            getRegSupplierBranchData(dbName,supplierBranchId, res, callback);
        },
        function (data, callback) {

            supplierData = data;

            getMultipleNamesOfSupplier(dbName,supplierBranchId, res, callback);
        },
        function (namesData, callback) {
            dataToBeSent = supplierData;
            dataToBeSent[0].names = namesData;
            callback(null);
        }
    ], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {

            callback(null, dataToBeSent);
        }

    })

}

function getRegSupplierBranchData(dbName,supplierBranchId, res, callback) {

    var sql = "select * from supplier_branch where id = ? limit 1";
    multiConnection[dbName].query(sql, [supplierBranchId], function (err, result) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {

            callback(null, result);
        }
    });

}

function getMultipleNamesOfSupplier(dbName,supplierBranchId, res, callback)
{

    var sql = "select sm.id,sm.name supplier_name,sm.address,sm.language_id,lan.language_name from supplier_branch_ml sm "
              + "join language lan on sm.language_id = lan.id where sm.supplier_branch_id = ?"
    multiConnection[dbName].query(sql,[supplierBranchId],function(err,result)
    {
        if(err)
            sendResponse.somethingWentWrongError(res);
        else
        {
            callback(null,result);
        }


    })
}

/*
* case 14 about supplier branch
*
* */

exports.aboutSupplierBranch = function(supplierBranchId, res, callback)
{
   cb(null ,{"data":null});
}

/*
*  case 16 product info tab
* */
exports.productInfo = function(dbName,supplierBranchId , res ,callback)
{
    var sql =  " select p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id , "
        + " p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name from supplier_branch_product sp "
   + " join product p on sp.product_id = p.id join categories c on c.id = p.category_id join currency_conversion curr "
    + " on curr.id = p.price_unit where sp.supplier_branch_id = ? and sp.is_deleted =  ? "

    multiConnection[dbName].query(sql,[supplierBranchId,0],function(err,result)
    {
        if(err)
        {
            console.log("err====",err);
            sendResponse.somethingWentWrongError(res);

        }

        else
        {
            callback(null,result);
        }

    })


}

/*
*  case 17 and 18  prodcut decription and pricing tab
*
*
* */

exports.productDescription = function(dbName,supplierBranchId,res,callback)
{
   // console.log("result 17====0");
    var supplierData = {};
    var namesData;
    var dataToBeSent = {};
    async.waterfall([
        function(callback)
        {
          //  console.log("calling====1");
            productDescriptionPricing(dbName,supplierBranchId,res,callback);
        } ,
        function(data,callback)
        {
           // console.log("result 17====1",data);
            supplierData=data;
            productDescriptionMultiLanguage(dbName,supplierBranchId,res,callback);

        } ,
        function(nameData,callback)
        {
           // console.log("result 17====2",nameData);

            supplierData[0].product_name = nameData;
                callback(null);
        }
    ],function(err,result)
    {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {

            callback(null, supplierData);
        }


    })

}


function productDescriptionPricing(dbName,supplierBranchId ,res,callback) {

    var sql = " select product.id as product_id , product.name as product_name from product " +
            " join supplier_branch_product  " +
            " on supplier_branch_product.product_id = product.id where supplier_branch_product.supplier_branch_id = ? "
    multiConnection[dbName].query(sql,[supplierBranchId],function(err,result)
    {

        if(err)
        {
            console.log("err====",err);
            sendResponse.somethingWentWrongError(res);

        }

        else
        {
            callback(null,result);
        }
    });
}

function productDescriptionMultiLanguage(dbName,supplierBranchId,res,callback)
{
    var sql = "select pm.name product_name,pm.product_desc,pm.language_id from product_ml pm "
        + "join supplier_branch_product sm on pm.product_id = sm.product_id where sm.supplier_branch_id = ?"
    multiConnection[dbName].query(sql,[supplierBranchId],function(err,result)
    {
        if(err)
            sendResponse.somethingWentWrongError(res);
        else
        {
            callback(null,result);
        }


    })


}