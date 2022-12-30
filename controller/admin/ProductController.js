/**
 * ==========================================================================
 * created by cbl-146
 * @description used for performing an product/variant related action from admin panel
 * ==========================================================================
 */

var async = require('async');
var sendResponse = require('../../routes/sendResponse');
var constant = require('../../routes/constant');
var func = require('../../routes/commonfunction');
var consts = require('./../../config/const')
const lib = require('../../lib/NotificationMgr')
var _ = require('underscore');
var something = "Something went wrong";
var client = require('twilio')("AC4b6d9ecd84afd6db7cf9ac5f055d7784", "782e67bf1f26170706acd639d757ae08");
var moment = require('moment');
var pushNotifications = require('../../routes/pushNotifications');
var orderFunction = require('../../routes/orderFunction');
var loginFunctions = require('../../routes/loginFunctions');
var AdminMail = "ops@royo.com";
var crypto = require('crypto')
algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password = consts.SERVER.CYPTO.PWD
var chunk = require('chunk');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const csv = require('fast-csv');
let fs = require('fs');
const ExecuteQ = require('../../lib/Execute')
let Universal = require('../../util/Universal')
/**
 * @description used for listing an variants
 * @param {*Object} req 
 * @param {*Object} res 
 */
const variantList = async (req, res) => {
    var product_id = req.body.product_id;
    var limit = req.body.limit;
    var offset = req.body.offset;
    var serachType = req.body.serachType;
    var serachText = req.body.serachText;
    // async.waterfall([
    //     function (cb) {
    // loginFunctions.listOfVariants(req.dbName,1,res, product_id,limit,offset,serachType,serachText,cb);
    let finalData = {};
    let tax = await getParentProductTax(req.dbName, product_id);
    let variantProductDetails = await getProductList(req.dbName, limit, offset, serachText, serachType, product_id);
    if (variantProductDetails.products && variantProductDetails.products.length > 0) {
        logger.debug("==========have products===============", variantProductDetails.products)
        let productDetailsWithImages = await getProductImages(req.dbName, variantProductDetails.products);
        let productsWithMl = await getProductsMl(req.dbName, productDetailsWithImages);
        let productsWithVariant = await getProductVariants(req.dbName, productsWithMl);
        let productsWithPrice = await getProductPrice(req.dbName, productsWithVariant);
        finalData.products = productsWithPrice;
        finalData.product_count = variantProductDetails.count;
        finalData.tax = tax;
    } else {
        logger.debug("==========have no products===============", variantProductDetails);
        finalData.products = variantProductDetails.products;
        finalData.product_count = variantProductDetails.count;
        finalData.tax = 0;
    }
    sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    // },
    // ], function (error, result) {
    //     console.log("==error=",error)
    //         if (error) {
    //                 sendResponse.somethingWentWrongError(res);
    //             }
    //             else {
    //                 sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    //             }
    // }
    // );  

}

function getParentProductTax(dbName, product_id) {
    return new Promise(async (resolve, reject) => {
        let sql = "select handling from product_pricing where product_id=? "
        let result = await ExecuteQ.Query(dbName, sql, [product_id])
        logger.debug("===========tax=====", result)
        if (result && result.length > 0) {
            resolve(result[0].handling)
        } else {
            resolve(0)
        }
    })
}

function getProductList(dbName, limit, offset, serachText, serachType, productId) {
    return new Promise(async (resolve, reject) => {
        try {
            if (serachType == 0) {
                var sql = "select p.quantity,(p.quantity-p.purchased_quantity) as left_quantity,pp.handling,p.name as name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,sbp.category_id,sbp.sub_category_id,sbp.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                    "from product p left join product_pricing pp on p.id = pp.product_id join categories c on c.id = p.category_id left join currency_conversion curr on curr.id = p.price_unit left join supplier_branch_product sbp on sbp.product_id=p.id" +
                    " where  p.is_deleted = ?  and pp.is_deleted=0 and p.parent_id=? group by p.id ORDER BY p.id DESC LIMIT ?,? "
            }
            else {
                var sql = "select p.quantity,(p.quantity-p.purchased_quantity) as left_quantity,pp.handling,p.name as name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,sbp.category_id,sbp.sub_category_id,sbp.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                    "from product p join product_pricing pp on p.id = pp.product_id join categories c on c.id = p.category_id left join supplier_branch_product sbp on sbp.product_id=p.id join currency_conversion curr on curr.id = p.price_unit where p.is_deleted = ? and pp.is_deleted=0 and p.parent_id=?  " +
                    "and (p.id LIKE '%" + serachText + "%' or p.bar_code LIKE '%" + serachText + "%' " +
                    " or p.sku LIKE '%" + serachText + "%'or p.name LIKE '%" + serachText + "%') group by p.id  ORDER BY p.id DESC LIMIT ?,?"
            }
            let count_query = sql.replace("LIMIT ?,?", "");
            let count_result = await ExecuteQ.Query(dbName, count_query, [0, parseInt(productId)]);

            let result = await ExecuteQ.Query(dbName, sql, [0, parseInt(productId), offset, limit]);
            let final = {}
            if (result.length) {
                final.products = result;
                final.count = count_result.length;
                resolve(final)
            } else {
                final.products = [];
                final.count = 0;
                resolve(final)
            }

        } catch (err) {
            logger.debug("=================errr====1===", err)
            reject(err)
        }
    })
}

function getProductImages(dbName, products) {
    return new Promise(async (resolve, reject) => {
        try {
            for (const [index, i] of products.entries()) {
                var temp = [];
                var sql = "select product_id,image_path,default_image,imageOrder from product_image where product_id = ?";
                var result = await ExecuteQ.Query(dbName, sql, [products[index].id])
                if (result.length) {
                    // var imageLen = result.length;

                    for (const [index2, i] of result.entries()) {
                        temp.push(result[index2])
                        if (index2 == (result.length - 1)) {
                            logger.debug("===============temp=======", temp)
                            products[index].images = temp;
                        }

                        if (index == (products.length - 1) && index2 == (result.length - 1)) {
                            resolve(products)
                        }
                    }
                } else {
                    products[index].images = [];
                    if (index == (products.length - 1)) {
                        resolve(products)
                    }
                }
            }
        } catch (err) {
            logger.debug("=============errrr=========2=======", err)
            reject(err)
        }
    })
}

function getProductsMl(dbName, products) {
    return new Promise(async (resolve, reject) => {
        try {
            for (const [index, i] of products.entries()) {
                var sql = "select pml.id as product_multi_id,l.language_name,pml.language_id,pml.name,  pml.product_desc,pml.measuring_unit from product_ml pml join language l on l.id = pml.language_id where product_id = ?";
                var result = await ExecuteQ.Query(dbName, sql, [products[index].id]);

                products[index].names = result;
                if (index == (products.length - 1)) {
                    resolve(products)
                }
            }

        } catch (err) {
            logger.debug(err)
            cb(err)
        }
    })
}

function getProductVariants(dbName, products) {
    return new Promise(async (resolve, reject) => {
        try {
            for (const [index, i] of products.entries()) {
                var vsql = "select cv.name,variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id join cat_variants cv on cv.id = variants.cat_variant_id where product_variants.product_id=?";

                var vData = await ExecuteQ.Query(dbName, vsql, [products[index].id])

                products[index].variant = vData;
                if (index == (products.length - 1)) {
                    resolve(products)
                }
            }
        } catch (err) {
            logger.debug(err)
            reject(err)
        }
    })
}


function getProductPrice(dbName, products) {
    return new Promise(async (resolve, reject) => {
        try {
            for (const [index, i] of products.entries()) {
                var sql = "SELECT p.user_type_id,p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
                sql += " ,p.price_type,";
                sql += " p.delivery_charges from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
                sql += " p.is_deleted = ? and p.is_deleted=0 and p.product_id = ? " +
                    " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
                console.log("===========price id sql ========>>>>>>>>", sql)
                var priceData = await ExecuteQ.Query(dbName, sql, [0, products[index].id]);

                products[index].price = priceData;
                // logger.debug("+=========product pricing 11-------============",products[index].price)
                if (index == (products.length - 1)) {
                    resolve(products)
                }
            }
        } catch (err) {
            logger.debug(err)
            reject(err)
        }
    })
}
const productDetail = async (req, res) => {
    var product_id = req.body.product_id, productIds;

    try {
        // productIds[0].names=pData
        // productIds[0].variant=vData;
        var p_data = await GetProductDetail(product_id, req.dbName)
        if (p_data && p_data.length > 0) {
            p_data[0].names = await GetMlProducts(product_id, req.dbName)
            p_data[0].variant = await GetVaraintProduct(product_id, req.dbName)
            p_data[0].images = await GetImageProduct(product_id, req.dbName)
        }

        sendResponse.sendSuccessData(p_data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch (err) {
        console.log(err);
        sendResponse.somethingWentWrongError(res);
    }
    // var product_id=req.body.product_id,productIds;
    // var sql = "select p.name as name,p.id,p.price_unit,p.bar_code,p.pricing_type,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
    // "from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
    // " where  p.is_deleted = ? and p.id=? "
    // multiConnection[dbName].query(sql,[0,product_id],function(err,result){
    //     console.log(err)
    //     if(err){
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else{
    //         // console.log
    //         productIds=result;
    //         var sql = "select pml.id as product_multi_id,l.language_name,pml.language_id,pml.name,	pml.product_desc,pml.measuring_unit from product_ml pml join language l on l.id = pml.language_id where product_id = ?";
    //         multiConnection[dbName].query(sql, [product_id],function(err,pData) {
    //            var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
    //             connection.query(vsql, [product_id],function(err,vData) {
    //                 console.log(err)
    //                 productIds[0].names=pData
    //                 productIds[0].variant=vData;
    //                 sendResponse.sendSuccessData(productIds, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    //             })
    //    if(pData && pData.length>0){
    //         var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
    //         connection.query(vsql, [product_id],function(err,vData) {
    //             console.log(err)
    //             productIds[0].names=pData
    //             productIds[0].variant=vData;
    //             sendResponse.sendSuccessData(productIds, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    //         })
    //     }
    //    else{
    //     var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
    //     connection.query(vsql, [product_id],function(err,vData) {
    //         productIds[0].names=[]
    //         productIds[0].variant=vData;
    //         sendResponse.sendSuccessData(productIds, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

    //     })                
    //   }
    // })

    // }
    // })
}

function GetProductDetail(product_id, dbName) {
    return new Promise((resolve, reject) => {
        var sql = "select sbp.category_id,sbp.sub_category_id,sbp.detailed_sub_category_id,p.is_product,p.name as name,p.id,p.price_unit,p.bar_code,p.pricing_type,p.product_desc,p.sku,p.quantity,p.purchased_quantity,p.is_live,p.commission_type,p.commission,p.commission_package,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
            "from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit left join supplier_branch_product sbp on sbp.product_id=p.id" +
            " where  p.is_deleted = ? and p.id=? "
        multiConnection[dbName].query(sql, [0, product_id], function (err, result) {
            console.log(err)
            if (err) {
                reject(err)
            }
            else {
                resolve(result)
            }
        })
    })
}
function GetMlProducts(product_id, dbName) {
    return new Promise((resolve, reject) => {
        var sql = "select pml.id as product_multi_id,l.language_name,pml.language_id,pml.name,	pml.product_desc,pml.measuring_unit from product_ml pml join language l on l.id = pml.language_id where product_id = ?";
        multiConnection[dbName].query(sql, [product_id], function (err, nData) {
            // multiConnection[dbName].query(sql,[0,product_id],function(err,result){
            console.log(err)
            if (err) {
                reject(err)
            }
            else {
                resolve(nData)
            }
        })
    })
}
function GetVaraintProduct(product_id, dbName) {
    return new Promise((resolve, reject) => {
        var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
        multiConnection[dbName].query(vsql, [product_id], function (err, vData) {
            console.log(err)
            if (err) {
                reject(err)
            }
            else {
                resolve(vData)
            }
        })
    })

}
function GetImageProduct(product_id, dbName) {
    return new Promise((resolve, reject) => {
        var vsql = "select product_id,image_path,imageOrder,default_image from product_image where product_id=?";
        multiConnection[dbName].query(vsql, [product_id], function (err, imData) {
            if (err) {
                reject(err)
            }
            else {
                resolve(imData)
            }
        })
    })
}
const AddProductAddsOn = async (req, res) => {
    try {
        var name = req.body.name;
        var name_ml = req.body.name_ml
        var type = req.body.types;
        var product_id = req.body.product_id;
        var is_multiple = req.body.is_multiple;
        var min_adds_on = req.body.min_adds_on == undefined ? 0 : req.body.min_adds_on;
        var max_adds_on = req.body.max_adds_on == undefined ? 0 : req.body.max_adds_on;
        var addon_limit = req.body.addon_limit == undefined ? 0 : req.body.addon_limit;
        var bottle_count = req.body.bottle_count == undefined ? 0 : req.body.bottle_count;
        let is_mandatory = req.body.is_mandatory == undefined ? 1 : parseInt(req.body.is_mandatory)
        var bulk_type_data = [], final_ml_value;
        var dup_data = await ExecuteQ.Query(req.dbName, "select `name` from product_adds_on where `name`=? and product_id=? and is_deleted=?", [name, parseInt(product_id), 0]);

        logger.debug("===DUP==>>", dup_data);
        if (dup_data && dup_data.length > 0 && req.dbName!="hungrycanadian_0710") {
            sendResponse.sendErrorMessage(constant.ProductRating.ADDS_ON, res, 400);
        }
        else {

            var insert_adds_on = await ExecuteQ.Query(req.dbName, "insert into product_adds_on(`product_id`," +
                "`is_multiple`,`min_adds_on`,`max_adds_on`,`name`,`addon_limit`,`is_mandatory`) values(?,?,?,?,?,?,?)",
                [parseInt(product_id), parseInt(is_multiple), parseInt(min_adds_on), parseInt(max_adds_on), name, addon_limit, is_mandatory]
            )

            var insert_adds_on_ml1 = await ExecuteQ.Query(req.dbName, "insert into product_adds_on_ml(`add_on_id`," +
                "`name`,`language_id`) values(?,?,?)",
                [insert_adds_on.insertId, name, 14]
            )

            var insert_adds_on_ml2 = await ExecuteQ.Query(req.dbName, "insert into product_adds_on_ml(`add_on_id`," +
                "`name`,`language_id`) values(?,?,?)",
                [insert_adds_on.insertId, name_ml, 15]
            )

            logger.debug("=======INSRTED==DATA==>>", insert_adds_on);

            // _.each(type,function(i){
            //          bulk_type_data.push(i.name,i.price,i.is_default,insert_adds_on.insertId,i.quantity);
            // })     

            // final_ml_value=chunk(bulk_type_data,5);

            // logger.debug("======final_ml_value=>",final_ml_value);

            // var inser_type_adds_on=await ExecuteQ.Query(req.dbName,"insert into product_adds_on_type (`name`,"+
            //     "`price`,`is_default`,`adds_on_id`,`quantity`) VALUES ?",[final_ml_value]
            // )


            for (const [index, i] of type.entries()) {
                let final_value = [i.name, i.price, i.is_default, insert_adds_on.insertId, i.quantity, i.bottle_count]
                logger.debug("=====final value=====+", final_value)
                let query = `insert into product_adds_on_type (name,price,is_default,adds_on_id,quantity,bottle_count) VALUES (?,?,?,?,?,?)`
                var insert_type_adds_on = await ExecuteQ.Query(req.dbName, query, final_value)
                logger.debug("============", insert_type_adds_on)

                let query2 = `insert into product_adds_on_type_ml (name,adds_on_type_id,language_id) VALUES (?,?,?)`
                let params2 = [i.name, insert_type_adds_on.insertId, 14]
                await ExecuteQ.Query(req.dbName, query2, params2);

                let query3 = `insert into product_adds_on_type_ml (name,adds_on_type_id,language_id) VALUES (?,?,?)`
                let params3 = [i.name_ml, insert_type_adds_on.insertId, 15]
                await ExecuteQ.Query(req.dbName, query3, params3);
            }


            // logger.debug("===inser_type_adds_on=====inser_type_adds_on=======",inser_type_adds_on)

            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    }
    catch (err) {
        logger.debug("====ERR!==", err);
        sendResponse.somethingWentWrongError(res);
    }
}
const UpdateProductAddsOn = async (req, res) => {
    try {
        var name = req.body.name;
        var name_ml = req.body.name_ml
        var type = req.body.types;
        var product_id = req.body.product_id;
        let addon_limit = req.body.addon_limit
        let id = req.body.id
        var is_multiple = req.body.is_multiple;
        var min_adds_on = req.body.min_adds_on == undefined ? 0 : req.body.min_adds_on;
        var max_adds_on = req.body.max_adds_on == undefined ? 0 : req.body.max_adds_on;
        let is_mandatory = req.body.is_mandatory == undefined ? 1 : parseInt(req.body.is_mandatory)
        let bottle_count = req.body.bottle_count == undefined ? 0 : req.body.bottle_count;
        
        var bulk_type_data = [], final_ml_value;
        var dup_data = await ExecuteQ.Query(req.dbName, "select `name` from product_adds_on where `name`=? and product_id=? and is_deleted=? and id!=?", [name, parseInt(product_id), 0, id]);
        logger.debug("===DUP==>>", dup_data);
        if (dup_data && dup_data.length > 0 && req.dbName!="hungrycanadian_0710") {
            sendResponse.sendErrorMessage(constant.ProductRating.ADDS_ON, res, 400);
        }
        else {
            var insert_adds_on = await ExecuteQ.Query(req.dbName, "update product_adds_on set " +
                "`is_multiple`=?,`min_adds_on`=?,`max_adds_on`=?,`name`=?,addon_limit=?,is_mandatory=? where id=?",
                [parseInt(is_multiple), parseInt(min_adds_on), parseInt(max_adds_on), name, addon_limit, is_mandatory, id]
            )

            var insert_adds_on = await ExecuteQ.Query(req.dbName, "update product_adds_on_ml set " +
                "name=? where add_on_id=? and language_id=?",
                [name, id, 14]
            )

            var insert_adds_on = await ExecuteQ.Query(req.dbName, "update product_adds_on_ml set " +
                "name=? where add_on_id=? and language_id=?",
                [name_ml, id, 15]
            )
            // logger.debug("=======INSRTED==DATA==>>",insert_adds_on);
            // _.each(type,async function(i){
            //     // bulk_type_data.push(i.name,i.price,i.is_default,insert_adds_on.insertId);
            //     if(i.id!=undefined && i.id!=""){
            //         await ExecuteQ.Query(req.dbName,"update product_adds_on_type set `name`=?,"+
            //         "`price`=?,`is_default`=?,`quantity`=? where id=?",[i.name,i.price,i.is_default,i.quantity,i.id]
            //         )
            //     }
            //     else{
            //         await ExecuteQ.Query(req.dbName,"insert into product_adds_on_type (`name`,"+
            //         "`price`,`is_default`,`adds_on_id`,`quantity`) values(?,?,?,?,?) ",[i.name,i.price,i.is_default,id,i.quantity]
            //      )
            //     }
            // })     


            for (const [index, i] of type.entries()) {

                if (i.id != undefined && i.id != "") {
                    await ExecuteQ.Query(req.dbName, "update product_adds_on_type set `name`=?," +
                        "`price`=?,`is_default`=?,`quantity`=?, `bottle_count`=? where id=?", [i.name, i.price, i.is_default, i.quantity,i.bottle_count, i.id]
                    )
                    await ExecuteQ.Query(req.dbName, "update product_adds_on_type_ml set `name`=? " +
                        " where adds_on_type_id=? and language_id=?", [i.name, i.id, 14]
                    )
                    await ExecuteQ.Query(req.dbName, "update product_adds_on_type_ml set `name`=? " +
                        " where adds_on_type_id=? and language_id=?", [i.name_ml, i.id, 15]
                    )
                }
                else {
                    let insert_type_adds_on = await ExecuteQ.Query(req.dbName, "insert into product_adds_on_type (`name`," +
                        "`price`,`is_default`,`adds_on_id`,`quantity`) values(?,?,?,?,?) ", [i.name, i.price, i.is_default, id, i.quantity]
                    )

                    let query2 = `insert into product_adds_on_type_ml (name,adds_on_type_id,language_id) VALUES (?,?,?)`
                    let params2 = [i.name, insert_type_adds_on.insertId, 14]
                    await ExecuteQ.Query(req.dbName, query2, params2);

                    let query3 = `insert into product_adds_on_type_ml (name,adds_on_type_id,language_id) VALUES (?,?,?)`
                    let params3 = [i.name_ml, insert_type_adds_on.insertId, 15]
                    await ExecuteQ.Query(req.dbName, query3, params3);
                }

            }



            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    }
    catch (err) {
        logger.debug("====ERR!==", err);
        sendResponse.somethingWentWrongError(res);
    }
}
const deleteAddOn = async (req, res) => {
    try {
        var query = "update product_adds_on set is_deleted=? where id = ?"
        await ExecuteQ.Query(req.dbName, query, [1, req.body.add_on_id])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    } catch (err) {
        logger.debug("=====Errr!!======", err);
        sendResponse.somethingWentWrongError(res);
    }
}


const deleteAddOnType = async (req, res) => {
    try {
        var query = "update product_adds_on_type set is_deleted=? where id = ?"
        await ExecuteQ.Query(req.dbName, query, [1, req.body.type_id])
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    } catch (err) {
        logger.debug("=====Errr!!======", err);
        sendResponse.somethingWentWrongError(res);
    }
}

const GetAddsOn = async (req, res) => {
    try {
        var product_id = parseInt(req.query.product_id);
        var adds_on_data = await ExecuteQ.Query(req.dbName, "select pr.is_multiple,pr.addon_limit,pr.is_mandatory,pr.min_adds_on,pr.max_adds_on,pr.name,pr.id," +
            "CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"name\": \"', Replace(pdt.name,'\"',''), '\", ','\"id\": \"', pdt.id, '\",','\"price\": \"', price, '\",','\"is_default\": \"', pdt.is_default, '\",','\"quantity\": \"', pdt.quantity, '\",','\"bottle_count\": \"', pdt.bottle_count, '\"','}') SEPARATOR ','),''),']') AS bData from product_adds_on pr left join product_adds_on_type pdt on pdt.adds_on_id=pr.id and pdt.is_deleted=? where pr.product_id=? and pr.is_deleted=?  group by pr.id",
            [0, product_id, 0])
        if (adds_on_data && adds_on_data.length > 0) {
            for (const [index, i] of adds_on_data.entries()) {

                if (i.bData) {
                    i.bData = JSON.parse(i.bData)
                    logger.debug("-=======i.bdata========", i.bData)
                    for (const [index, j] of i.bData.entries()) {
                        let query = "select name,language_id from product_adds_on_type_ml where adds_on_type_id=?"
                        let params = [j.id]
                        let result = await ExecuteQ.Query(req.dbName, query, params)
                        j.names = result
                    }
                }
                let querymain = "select name,language_id from product_adds_on_ml where add_on_id=?"
                let paramsmain = [i.id]
                let result = await ExecuteQ.Query(req.dbName, querymain, paramsmain);
                i.names = result
            }
        }

        logger.debug("==========+", adds_on_data)
        sendResponse.sendSuccessData(adds_on_data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch (Err) {
        logger.debug("=============errr====", Err)
        sendResponse.somethingWentWrongError(res);
    }
}
const productByBranch = async (req, res) => {
    try {
        let branchId = req.query.branchId;
        let productsData, productIds = [];
        let productData = await ExecuteQ.Query(req.dbName, `select IF((select count(*) from product where product.parent_id=p.id and 
        product.is_deleted=0)>0,1,0) as is_variant,c.type,(p.quantity-p.purchased_quantity) as left_quantity,p.interval_flag,
        p.interval_value,p.quantity,p.purchased_quantity,br.id as brand_id,br.name as brand_name,br.image as brand_image,
        p.pricing_type,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission,p.commission_type,
        p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.chemical_tools_price_applicable,
        c.services_at_home_price_applicable,c.name category_name,c.is_barcode,curr.currency_name from supplier_branch_product sp 
        join product p on sp.product_id = p.id left join brands br on br.id=p.brand_id and br.deleted_by= 0 join categories c 
        on c.id = p.category_id join currency_conversion curr 
        on curr.id = p.price_unit where p.parent_id=0 and sp.supplier_branch_id = ? and sp.is_deleted = 0`, [branchId]);

        let productNameData = await ExecuteQ.Query(req.dbName, "select p.id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit from " +
            "product_ml p join language l on p.language_id = l.id join supplier_branch_product sp on sp.product_id = " +
            "p.product_id  where sp.is_deleted = 0 and sp.supplier_branch_id =?", [branchId]);

        if (productData.length > 0) {
            for (const [index, i] of productData.entries()) {
                let names_arr = [];
                for (const [index1, j] of productNameData.entries()) {
                    logger.debug("==id==image_product_id====", parseInt(j.product_id), parseInt(i.id))
                    if (parseInt(j.product_id) == parseInt(i.id)) {
                        names_arr.push(j)
                    }
                }
                i.names = names_arr
                productIds.push(i.id)
            }
        }
        logger.debug("=====IDS==", productIds)
        let productImage = await ExecuteQ.Query(req.dbName, "select product_id,image_path,default_image,imageOrder from product_image where product_id IN(" + productIds + ")")
        for (const [index, i] of productData.entries()) {
            let images_arr = [];
            for (const [index1, j] of productImage.entries()) {
                logger.debug("==id==image_product_id====", parseInt(i.id), parseInt(j.product_id))
                if (parseInt(j.product_id) == parseInt(i.id)) {
                    images_arr.push(j)
                }
            }
            i.images = images_arr;
        }
        for (const [index, i] of productData.entries()) {
            let sql = "SELECT p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
            sql += " ,p.price_type,";
            sql += " p.delivery_charges from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
            sql += " p.is_deleted = ? and p.product_id = ? " +
                " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
            let priceData = await ExecuteQ.Query(req.dbName, sql, [0, i.id])
            i.price = priceData;
        }

        for (const [index, i] of productData.entries()) {
            var vsql = `select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id
            from product_variants inner join variants on variants.id=product_variants.variant_id 
            where product_variants.product_id=?`;
            let variantData = await ExecuteQ.Query(req.dbName, vsql, [i.id]);
            i.variant = variantData;
        }

        sendResponse.sendSuccessData({ products: productData }, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch (Err) {
        logger.debug("======Err!===>>", Err)
        sendResponse.somethingWentWrongError(res);
    }
}
const importProduct = (req, res) => {
    try {
        // logger.debug("====req.files.file",req.files.file)
        let fileRows = [];
        let fileName = req.files.file.name
        let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
        let categoryId = req.body.catId || 0;
        let subCategoryId = req.body.subcatId || 0;
        let detailSubCategoryId = req.body.detSubcatId || 0;
        let userId = req.user.id;
        let serviceType = req.body.serviceType;
        let parentId = req.body.parentId || 0;
        let apiVersion = Universal.getVersioning(req.path);
        logger.debug("=======fileExtension======>>", fileExtension);
        if (fileExtension == "csv") {
            if (req.files.file) {
                csv.parseFile(req.files.file.path)
                    .on("data", function (data) {
                        // logger.debug("=====DATA!==>>",data);
                        fileRows.push(data); // push each row
                    })
                    .on("end", async function () {
                        let isProduct = parseInt(serviceType) == 1 || parseInt(serviceType) == 2 ? 1 : 0;
                        logger.debug("===isProduct===>>", isProduct, fileRows, fileRows[0]);     //contains array of arrays.
                        await fs.unlinkSync(req.files.file.path);   // remove temp file
                        let validHeader = await Universal.validationHeaderColumn(fileRows[0], serviceType);
                        logger.debug("=====HeaderVliadtion===>>", validHeader);
                        if (parseInt(apiVersion) > 0) {
                            let validHeaderWithCat = await Universal.validationHeaderColumnWithCategory(fileRows[0], serviceType);
                            if (!validHeaderWithCat) {
                                const dataRows = fileRows.slice(1, fileRows.length);
                                let definedNameOfValue = await Universal.getModifiedProdutDataForCategories(dataRows);
                                let afterGroupBy = _.groupBy(definedNameOfValue, "categories");
                                let productValues;
                                let cateId = 0;
                                for await (let [key, cValues] of Object.entries(afterGroupBy)) {

                                    logger.debug("========cateName==>>", key);

                                    let isCateExist = await ExecuteQ.Query(req.dbName, `select * from categories where name=? and is_deleted=?`, [key, 0]);
                                    if (isCateExist && isCateExist.length > 0) {
                                        cateId = isCateExist[0].id
                                        await ExecuteQ.Query(req.dbName, `update categories set tax=?,name=?,description=? where id=?`, [
                                            cValues[0].catTaxInPercentage,
                                            cValues[0].categories, cValues[0].categoriesDesc, cateId])
                                        await ExecuteQ.Query(req.dbName, `update categories_ml set name=?,description=? where category_id=? and language_id=?`,
                                            [cValues[0].categories, cValues[0].categoriesDesc, cateId, 14]);
                                        await ExecuteQ.Query(req.dbName, `update categories_ml set name=?,description=? where category_id=? and language_id=?`,
                                            [cValues[0].categoriesInOl, cValues[0].categoriesDescInOl, cateId, 15]);

                                    }
                                    else {
                                        let newCate = await ExecuteQ.Query(req.dbName, "insert into categories(`product_addition_level`,`category_order`,`services_at_home_price_applicable`,`chemical_tools_price_applicable`,`is_barcode`,`category_flow`,`approved_by`,`created_by`,`illustration`,`icon`,`image`,`product_placement_level`,`supplier_placement_level`,`order`,`new_order`,`name`,`description`,`tax`,`type`,`parent_id`) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                                            [0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                'Category>Suppliers>SupplierInfo>SubCategory>Pl',
                                                userId,
                                                userId,
                                                "tes",
                                                "https://",
                                                "https://",
                                                0,
                                                0,
                                                0,
                                                0,
                                                cValues[0].categories,
                                                cValues[0].categoriesDesc,
                                                cValues[0].catTaxInPercentage,
                                                serviceType,
                                                parentId
                                            ]);
                                        await ExecuteQ.Query(req.dbName, `insert into categories_ml(language_id,name,description,category_id) values(?,?,?,?)`, [14, cValues[0].categories, cValues[0].categoriesDesc, newCate.insertId]);
                                        await ExecuteQ.Query(req.dbName, `insert into categories_ml(language_id,name,description,category_id) values(?,?,?,?)`, [15, cValues[0].categoriesInOl, cValues[0].categoriesDescInOl, newCate.insertId]);

                                        cateId = newCate.insertId
                                    }

                                    productValues = _.groupBy(cValues, "productName");
                                    let newProductId = 0;
                                    for await (let [pKeys, pValues] of Object.entries(productValues)) {
                                        customData = []
                                        let customDataValue;
                                        logger.debug("======productValues====",);
                                        let isProductExist = await ExecuteQ.Query(req.dbName, `select id,name,product_desc from product where name=? and category_id=? and is_deleted=?`, [pValues[0].productName, cateId, 0]);
                                        if (isProductExist && isProductExist.length > 0) {
                                            logger.debug("====Dup=Product==>")
                                            newProductId = isProductExist[0].id
                                            await ExecuteQ.Query(req.dbName, `update product 
                                        set quantity=?,product_desc=? where id=?`, [
                                                pValues[0].productQuantity,
                                                pValues[0].productDesc,
                                                isProductExist[0].id
                                            ])
                                            await ExecuteQ.Query(req.dbName, `update product_ml set name=?,product_desc=? where product_id=? and language_id=?`, [
                                                pValues[0].productName,
                                                pValues[0].productDesc,
                                                isProductExist[0].id,
                                                14
                                            ])
                                            await ExecuteQ.Query(req.dbName, `update product_ml set name=?,product_desc=? where product_id=? and language_id=?`, [
                                                pValues[0].productNameInOl,
                                                pValues[0].productDescInOl,
                                                isProductExist[0].id,
                                                14
                                            ])


                                        }
                                        else {
                                            let inserProd = await ExecuteQ.Query(req.dbName, `insert into product(
                                            name,
                                            product_desc,
                                            quantity,
                                            category_id,
                                            sub_category_id,
                                            detailed_sub_category_id,
                                            is_global,
                                            is_live,
                                            is_product,
                                            pricing_type,
                                            bar_code,
                                            measuring_unit,
                                            sku,
                                            commission_type,
                                            commission,
                                            commission_package,
                                            recurring_possible,
                                            scheduling_possible,
                                            is_package,
                                            is_deleted,
                                            created_by,
                                            approved_by_supplier,
                                            approved_by_admin
                                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                                                pValues[0].productName, pValues[0].productDesc, pValues[0].productQuantity
                                                , cateId, 0, 0, 1, 1, isProduct, 0,
                                                "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1]);
                                            newProductId = inserProd.insertId;
                                            // logger.debug("===inserProd===",inserProd);
                                            // logger.debug("======discountInPercntage====");

                                            await ExecuteQ.Query(req.dbName, `insert into product_ml(
                                            product_id,
                                            product_desc,
                                            measuring_unit,
                                            name,
                                            language_id) values (?,?,?,?,?)`, [inserProd.insertId, pValues[0].productDesc, "", pValues[0].productName, 14]);

                                            await ExecuteQ.Query(req.dbName, `insert into product_ml(
                                                product_id,
                                                product_desc,
                                                measuring_unit,
                                                name,
                                                language_id) values (?,?,?,?,?)`, [inserProd.insertId, pValues[0].productDescInOl, "", pValues[0].productNameInOl, 15]);

                                            await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                                                [inserProd.insertId, pValues[0].productImage, 1, 1]
                                            );

                                        }
                                        customDataValue = _.groupBy(pValues, "customizationName");
                                        logger.debug("====customDataValue========", customDataValue)
                                        let adds_on_inserted_id = 0
                                        for await (let [keys, values] of Object.entries(customDataValue)) {
                                            logger.debug("=keys===", keys)
                                            if (keys != "undefined" && keys != "" && keys != null && keys != undefined) {
                                                let bulk_type_data = [], final_ml_value, adds_final_ml_value, adds_type_final_ml_value;
                                                let isSameAdsOnExist = await ExecuteQ.Query(req.dbName, `select * from product_adds_on where product_id=? and name=?`, [parseInt(newProductId), values[0].customizationName])
                                                if (isSameAdsOnExist && isSameAdsOnExist.length > 0) {
                                                    logger.debug("==DUP=customization>>")
                                                    adds_on_inserted_id = isSameAdsOnExist[0].id
                                                    await ExecuteQ.Query(req.dbName, "update product_adds_on set " +
                                                        "`is_multiple`=?,`min_adds_on`=?,`max_adds_on`=?,`name`=?,`addon_limit`=?,`is_mandatory`=? where id =?",
                                                        [parseInt(values[0].isMultipleCust), parseInt(values[0].minCustSelection), parseInt(values[0].maxCustSelection),
                                                        values[0].customizationName, parseInt(values[0].maxCustSelection), values[0].isCustMandatory, adds_on_inserted_id]
                                                    )
                                                }
                                                else {
                                                    var insert_adds_on = await ExecuteQ.Query(req.dbName, "insert into product_adds_on(`product_id`," +
                                                        "`is_multiple`,`min_adds_on`,`max_adds_on`,`name`,`addon_limit`,`is_mandatory`) values(?,?,?,?,?,?,?)",
                                                        [parseInt(newProductId), parseInt(values[0].isMultipleCust), parseInt(values[0].minCustSelection), parseInt(values[0].maxCustSelection),
                                                        values[0].customizationName, parseInt(values[0].maxCustSelection), values[0].isCustMandatory]
                                                    )
                                                    adds_on_inserted_id = insert_adds_on.insertId
                                                    adds_final_ml_value = chunk([values[0].customizationName, adds_on_inserted_id, 14, values[0].customizationName, insert_adds_on.insertId, 15], 3);
                                                    var adds_name_ml = await ExecuteQ.Query(req.dbName, `insert into product_adds_on_ml(name,add_on_id,language_id) values ?`,
                                                        [adds_final_ml_value]
                                                    )

                                                }

                                                // logger.debug("=======INSRTED==DATA==>>",insert_adds_on,values);
                                                for await (const [indx, i] of values.entries()) {
                                                    let isAddsOnTypeIdExist = await ExecuteQ.Query(req.dbName, `select * from product_adds_on_type where name=? and adds_on_id=?`, [i.custTypeName, adds_on_inserted_id])
                                                    if (isAddsOnTypeIdExist && isAddsOnTypeIdExist.length > 0) {
                                                        logger.debug("==DUP=customization==type==>>")
                                                        var inser_type_adds_on = await ExecuteQ.Query(req.dbName, "update product_adds_on_type set `name`=?," +
                                                            "`price`=?,`is_default`=?,`quantity`=? where id=?", [
                                                            i.custTypeName, i.custTypePrice, i.custTypeIsDefault, i.custTypeQuantity, isAddsOnTypeIdExist[0].id]
                                                        )
                                                    }
                                                    else {
                                                        var inser_type_adds_on = await ExecuteQ.Query(req.dbName, "insert into product_adds_on_type (`name`," +
                                                            "`price`,`is_default`,`adds_on_id`,`quantity`) VALUES (?,?,?,?,?)", [
                                                            i.custTypeName, i.custTypePrice, i.custTypeIsDefault, adds_on_inserted_id, i.custTypeQuantity]
                                                        )
                                                        adds_type_final_ml_value = chunk([i.custTypeName, inser_type_adds_on.insertId, 14, i.custTypeName, inser_type_adds_on.insertId, 15], 3);
                                                        var adds_name_ml = await ExecuteQ.Query(req.dbName, `insert into product_adds_on_type_ml(name,adds_on_type_id,language_id) values ?`,
                                                            [adds_type_final_ml_value]
                                                        )
                                                    }

                                                    // bulk_type_data.push(i.custTypeName,i.custTypePrice,i.custTypeIsDefault,
                                                    //     insert_adds_on.insertId,i.custTypeQuantity);
                                                }
                                                final_ml_value = chunk(bulk_type_data, 5);
                                                logger.debug("======final_ml_value=>", final_ml_value);
                                                // var inser_type_adds_on=await ExecuteQ.Query(req.dbName,"insert into product_adds_on_type (`name`,"+
                                                //     "`price`,`is_default`,`adds_on_id`,`quantity`) VALUES ?",[final_ml_value]
                                                // )
                                            }
                                        }

                                    }

                                }
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                            }
                            else {
                                logger.debug("====constant.fileMessage.INVALID_FILE", constant.fileMessage);
                                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
                            }

                        }
                        else {
                            if (validHeader) {
                                const validationError = await insertProduct(
                                    userId,
                                    isProduct,
                                    serviceType,
                                    req.dbName,
                                    categoryId,
                                    subCategoryId,
                                    detailSubCategoryId,
                                    fileRows);
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                            }
                            else {
                                logger.debug("====constant.fileMessage.INVALID_FILE", constant.fileMessage);
                                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
                            }
                        }
                    })
            }
            else {
                sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
            }
        }
        else {
            sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
        }

    }
    catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const importCategoryVariants = async(req, res) => {
    try {

        let categoryId = req.body.catId || 0;
        let fileRows = [];
        let fileName = req.files.file.name
        let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
        logger.debug("=======fileExtension======>>", fileExtension);
         await updateCatVarient(req.dbName,categoryId)
        if (fileExtension == "csv") {
            if (req.files.file) {
                csv.parseFile(req.files.file.path)
                    .on("data", function (data) {
                        // logger.debug("=====DATA!==>>",data);
                        fileRows.push(data); // push each row
                    })
                    .on("end", async function () {
                        await fs.unlinkSync(req.files.file.path);   // remove temp file

                        let validHeader = await Universal.validationHeaderCategoryVariantColumns(fileRows[0], 2);

                        if (!validHeader) {
                            const dataRows = fileRows.slice(1, fileRows.length);
                            let definedNameOfValue = await Universal.getModifiedCategoryVariantData(dataRows);
                            let afterGroupBy = _.groupBy(definedNameOfValue, "variantName");
                            let variant_ml_values = [];
                            let variant_values_array = [],final_value = ""
                            for await (let [key, cValues] of Object.entries(afterGroupBy)) {
                                variant_ml_values = [];
                                variant_values_array = [];
                                logger.debug("========key==>>", key);
                                logger.debug("========cValues==>>", cValues);

                                let catVariantQuery =
                                    "insert into cat_variants (`name`,`cat_id`,`variant_type`,`created_by`) values(?,?,?,?)";
                                let catVariantResult = await ExecuteQ.Query(req.dbName, catVariantQuery,
                                    [key, categoryId, 0, 0]);

                                variant_ml_values.push(cValues[0].variantName, 14, catVariantResult.insertId);
                                variant_ml_values.push(cValues[0].variantNameOl, 15, catVariantResult.insertId);
    
                                final_ml_value=chunk(variant_ml_values,3);

                                let mlQuery = "insert into cat_variants_ml (`name`,`language_id`,`cat_variant_id`) values ?"
                                await ExecuteQ.Query(req.dbName, mlQuery, [final_ml_value])


                                _.each(cValues,function(i){
                                    variant_values_array.push(
                                        catVariantResult.insertId,
                                        i.variantValue,
                                        0
                                    )
                                })
                                final_value=chunk(variant_values_array,3);

                                    let variantQuery = "insert into variants (`cat_variant_id`,`value`,`created_by`) values ?"
                                    await ExecuteQ.Query(req.dbName, variantQuery, [final_value]);
    
                            }
                            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                        }
                        else {
                            logger.debug("====constant.fileMessage.INVALID_FILE", constant.fileMessage);
                            sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
                        }
                    })
            }
            else {
                sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
            }
        }
        else {
            sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
        }

    }
    catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const updateCatVarient = async(dbName,category_id)=>{
    return new Promise((resolve,reject)=>{
        var sql = "update categories set is_variant=? where id = ?"
        multiConnection[dbName].query(sql,[1,category_id],function(err,data){
            if(err){
                reject();
            }else{
                resolve()
            }
        })
    })
}
const insertProduct = (userId, isProduct, serviceType, dbName, catId, subId, detailSubId, rows) => {
    return new Promise(async (resolve, reject) => {
        // logger.debug("=====validateCsvData====",rows);
        const dataRows = rows.slice(1, rows.length); //ignore header at 0 and get rest of the rows
        // logger.debug("===dataRows====",rows[0]);
        try {
            for (const [index, i] of dataRows.entries()) {
                logger.debug("=======I==", i[0], i[2], i[3], catId, subId, detailSubId, 1, 1, i[8])
                // if(serviceType==1){
                let inserProd = await ExecuteQ.Query(dbName, `insert into product(
                    name,
                    product_desc,
                    quantity,
                    category_id,
                    sub_category_id,
                    detailed_sub_category_id,
                    is_global,
                    is_live,
                    is_product,
                    pricing_type,
                    bar_code,
                    measuring_unit,
                    sku,
                    commission_type,
                    commission,
                    commission_package,
                    recurring_possible,
                    scheduling_possible,
                    is_package,
                    is_deleted,
                    created_by,
                    approved_by_supplier,
                    approved_by_admin
                    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [i[0], i[2], i[4], detailSubId, 0, 0, 1, 1, isProduct, 0,
                    "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1]);

                logger.debug("===inserProd===", inserProd);

                await ExecuteQ.Query(dbName, `insert into product_ml(
                    product_id,
                    product_desc,
                    measuring_unit,
                    name,
                    language_id) values (?,?,?,?,?)`, [inserProd.insertId, i[2], "", i[0], 14])
                await ExecuteQ.Query(dbName, `insert into product_ml(
                        product_id,
                        product_desc,
                        measuring_unit,
                        name,
                        language_id) values (?,?,?,?,?)`, [inserProd.insertId, i[3], "", i[1], 15])
                await ExecuteQ.Query(dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                    [inserProd.insertId, i[5], 1, 1]
                )

                // aw
            }
            // }
            resolve()
        }
        catch (Err) {
            logger.debug("=======ERR!==>", Err);
            reject(Err)
        }

    })
}

const importSupplierProduct = async (req, res) => {
    try {
        // logger.debug("====req.files.file",req.files.file)
        let fileRows = [];
        let fileName = req.files.file.name
        let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
        let categoryId = req.body.catId;
        let subCategoryId = req.body.subcatId;
        let detailSubCategoryId = req.body.detSubcatId;
        let supplierId = req.body.supplierId;
        let branchId = req.body.branchId || 0;
        let userId = req.user.id;
        let serviceType = req.body.serviceType;
        let apiVersion = Universal.getVersioning(req.path);
        logger.debug("=======fileExtension======>>", apiVersion, fileExtension);
        if (fileExtension == "csv" || fileExtension=="xlsx" || fileExtension=="XLSX" ) {
            if (req.files.file) {
                // if(parseInt(apiVersion)>0){
                csv.parseFile(req.files.file.path)
                    .on("data", function (data) {
                        // logger.debug("=====DATA!==>>",data);
                        fileRows.push(data); // push each row
                    })
                    .on("end", async function () {
                        let isProduct = parseInt(serviceType) == 1 || parseInt(serviceType) == 2 ? 1 : 0;
                        let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId]);
                        logger.debug("===isProduct===>>", isProduct, fileRows, fileRows[0]);     //contains array of arrays.
                        branchId = parseInt(branchId) == 0 ? supplierBtanchData[0].id : branchId
                        logger.debug("=======branchId==", branchId)

                        await fs.unlinkSync(req.files.file.path);   // remove temp file
                        if (parseInt(apiVersion) > 0) {
                            let validHeaderWithCustomization = await Universal.validationSupplierHeaderColumn(fileRows[0], serviceType);
                            if (validHeaderWithCustomization) {
                                const dataRows = fileRows.slice(1, fileRows.length);
                                let productArray = await Universal.getModifiedProdutData(dataRows);
                                let afterGroupBy = _.groupBy(productArray, "productName");
                                let isUserTypePriceEnable=await ExecuteQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? and `value`=?",["is_user_type","1"]);
                                
                                let productValues;
                                let pJson = {}, pData = [], customJson = {}, customData = [];
                                let newProductId = 0
                                for await (let [key, value] of Object.entries(afterGroupBy)) {
                                    customData = []
                                    let isBranchProductExist = await ExecuteQ.Query(req.dbName, `select p.id from product p join supplier_branch_product sbp on sbp.product_id=p.id where p.name=? and sbp.supplier_branch_id=? and p.category_id=? and p.is_deleted=0 `, [value[0].productName, branchId, detailSubCategoryId])
                                    if (isBranchProductExist && isBranchProductExist.length > 0) {
                                        newProductId = isBranchProductExist[0].id
                                        await ExecuteQ.Query(req.dbName, `update product set product_desc=?,quantity=? where id=?`, [
                                            value[0].productDesc,
                                            value[0].productQuantity,
                                            , isBranchProductExist[0].id]);
                                        if (parseFloat(value[0].discount) > 0) {
                                            let isDiscountPriceExist = await ExecuteQ.Query(req.dbName, `select * from product_pricing where product_id=?
                                                     and price_type=? and is_deleted=?`, [isBranchProductExist[0].id, 1, 0])
                                            let discountPrices = value[0].productPrice - (value[0].productPrice * value[0].discount / 100);
                                            logger.debug("===discountPrice====");
                                            if (isDiscountPriceExist && isDiscountPriceExist.length > 0) {
                                                await ExecuteQ.Query(req.dbName, `update product_pricing set price=?,display_price=? where id=?`,
                                                    [discountPrices, value[0].productPrice, isDiscountPriceExist[0].id])
                                            }
                                            else {
                                                var discountPriceSql = `insert into product_pricing(
                                                            product_id,
                                                            start_date,
                                                            end_date,
                                                            price,
                                                            handling,
                                                            handling_supplier,
                                                            can_urgent,
                                                            urgent_price,
                                                            delivery_charges,
                                                            urgent_type,
                                                            price_type,
                                                            display_price,
                                                            urgent_value,
                                                            pricing_type,
                                                            user_type_id,
                                                            offer_name,
                                                            house_cleaning_price,
                                                            beauty_saloon_price,
                                                            commission,
                                                            is_deleted,
                                                            commission_type,
                                                            min_hour,
                                                            max_hour,
                                                            per_hour_price
                                                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                await ExecuteQ.Query(req.dbName, discountPriceSql, [
                                                    inserProd.insertId,
                                                    // // 03-01-2020 13-12-2020
                                                    // moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
                                                    // moment(value[0].priceValidTo).format('YYYY-MM-DD'),
                                                    moment(value[0].priceValidFrom, "DD-MM-YYYY").format("YYYY-MM-DD"),

                                                    moment(value[0].priceValidTo, "DD-MM-YYYY").format("YYYY-MM-DD"),
                                                    
                                                    discountPrice,
                                                    value[0].handlingAdmin,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    1,
                                                    value[0].productPrice,
                                                    0,
                                                    0,
                                                    0,
                                                    "",
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0
                                                ])
                                            }
                                        }
                                        await ExecuteQ.Query(req.dbName, `update product_pricing set 
                                                handling=?,price=?,display_price=? where product_id=? and price_type=?`, [
                                            value[0].handlingAdmin,
                                            value[0].productPrice,
                                            value[0].productPrice,
                                            isBranchProductExist[0].id,
                                            0
                                        ])

                                    }
                                    else {
                                        logger.debug("======productValues====", value, value[2], value[3], value[0].productDescInOl);
                                       
                                        let inserProd = await ExecuteQ.Query(req.dbName, `insert into product(
                                            name,
                                            product_desc,
                                            quantity,
                                            category_id,
                                            sub_category_id,
                                            detailed_sub_category_id,
                                            is_global,
                                            is_live,
                                            is_product,
                                            pricing_type,
                                            bar_code,
                                            measuring_unit,
                                            sku,
                                            commission_type,
                                            commission,
                                            commission_package,
                                            recurring_possible,
                                            scheduling_possible,
                                            is_package,
                                            is_deleted,
                                            created_by,
                                            approved_by_supplier,
                                            approved_by_admin
                                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                                            value[0].productName, value[0].productDesc, value[0].productQuantity
                                            , detailSubCategoryId, 0, 0, 0, 1, isProduct, 0,
                                            "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1]);
                                        newProductId = inserProd.insertId;

                                        console.log("===inserProd===", inserProd);
                                        console.log("======discountInPercntage====", value[0].priceValidFrom, value[0].priceValidTo);
                                        if(isUserTypePriceEnable.length<=0){
                                        if (parseFloat(value[0].discount) > 0) {
                                            var regularPriceSql = `insert into product_pricing(
                                                    product_id,
                                                    start_date,
                                                    end_date,
                                                    price,
                                                    handling,
                                                    handling_supplier,
                                                    can_urgent,
                                                    urgent_price,
                                                    delivery_charges,
                                                    urgent_type,
                                                    price_type,
                                                    display_price,
                                                    urgent_value,
                                                    pricing_type,
                                                    user_type_id,
                                                    offer_name,
                                                    house_cleaning_price,
                                                    beauty_saloon_price,
                                                    commission,
                                                    is_deleted,
                                                    commission_type,
                                                    min_hour,
                                                    max_hour,
                                                    per_hour_price
                                                    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                            await ExecuteQ.Query(req.dbName, regularPriceSql, [
                                                inserProd.insertId,
                                                // moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
                                                // moment(value[0].priceValidTo).format('YYYY-MM-DD'),
                                                moment(value[0].priceValidFrom, "DD-MM-YYYY").format("YYYY-MM-DD"),

                                                    moment(value[0].priceValidTo, "DD-MM-YYYY").format("YYYY-MM-DD"),
                                                value[0].productPrice,
                                                value[0].handlingAdmin,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                value[0].productPrice,
                                                0,
                                                0,
                                                0,
                                                "",
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0
                                            ])
                                            let discountPrice = value[0].productPrice - (value[0].productPrice * value[0].discount / 100);
                                            logger.debug("===discountPrice====", discountPrice)
                                            // let discountPric=

                                            var discountPriceSql = `insert into product_pricing(
                                                        product_id,
                                                        start_date,
                                                        end_date,
                                                        price,
                                                        handling,
                                                        handling_supplier,
                                                        can_urgent,
                                                        urgent_price,
                                                        delivery_charges,
                                                        urgent_type,
                                                        price_type,
                                                        display_price,
                                                        urgent_value,
                                                        pricing_type,
                                                        user_type_id,
                                                        offer_name,
                                                        house_cleaning_price,
                                                        beauty_saloon_price,
                                                        commission,
                                                        is_deleted,
                                                        commission_type,
                                                        min_hour,
                                                        max_hour,
                                                        per_hour_price
                                                        ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                            await ExecuteQ.Query(req.dbName, discountPriceSql, [
                                                inserProd.insertId,
                                                // moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
                                                // moment(value[0].priceValidTo).format('YYYY-MM-DD'),
                                                moment(value[0].priceValidFrom, "DD-MM-YYYY").format("YYYY-MM-DD"),

                                                    moment(value[0].priceValidTo, "DD-MM-YYYY").format("YYYY-MM-DD"),
                                                discountPrice,
                                                value[0].handlingAdmin,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                1,
                                                value[0].productPrice,
                                                0,
                                                0,
                                                0,
                                                "",
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0
                                            ])

                                        }
                                        else {
                                            var regularPriceSql = `insert into product_pricing(
                                                    product_id,
                                                    start_date,
                                                    end_date,
                                                    price,
                                                    handling,
                                                    handling_supplier,
                                                    can_urgent,
                                                    urgent_price,
                                                    delivery_charges,
                                                    urgent_type,
                                                    price_type,
                                                    display_price,
                                                    urgent_value,
                                                    pricing_type,
                                                    user_type_id,
                                                    offer_name,
                                                    house_cleaning_price,
                                                    beauty_saloon_price,
                                                    commission,
                                                    is_deleted,
                                                    commission_type,
                                                    min_hour,
                                                    max_hour,
                                                    per_hour_price
                                                    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                            await ExecuteQ.Query(req.dbName, regularPriceSql, [
                                                inserProd.insertId,
                                                // moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
                                                // moment(value[0].priceValidTo).format('YYYY-MM-DD'),
                                                moment(value[0].priceValidFrom, "DD-MM-YYYY").format("YYYY-MM-DD"),

                                                    moment(value[0].priceValidTo, "DD-MM-YYYY").format("YYYY-MM-DD"),
                                                value[0].productPrice,
                                                value[0].handlingAdmin,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                value[0].productPrice,
                                                0,
                                                0,
                                                0,
                                                "",
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0
                                            ])
                                        }
                                        }

                                        let insertSql = `SELECT ${branchId},${inserProd.insertId},${categoryId},${subCategoryId},${detailSubCategoryId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
                                            from supplier_branch_product 
                                            where supplier_branch_id=${branchId} and category_id=${categoryId};`;
                                        let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
                                        await ExecuteQ.Query(req.dbName, branchProductSql, []);


                                        await ExecuteQ.Query(req.dbName, `insert into product_ml(
                                            product_id,
                                            product_desc,
                                            measuring_unit,
                                            name,
                                            language_id) values (?,?,?,?,?)`, [inserProd.insertId, value[0].productDesc, "", value[0].productName, 14]);

                                        await ExecuteQ.Query(req.dbName, `insert into product_ml(
                                                product_id,
                                                product_desc,
                                                measuring_unit,
                                                name,
                                                language_id) values (?,?,?,?,?)`, [inserProd.insertId, value[0].productDescInOl, "", value[0].productNameInOl, 15]);

                                        await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                                            [inserProd.insertId, value[0].productImage, 1, 1]
                                        );
                                    }
                                    productValues = _.groupBy(value, "customizationName");

                                    let adds_on_inserted_id = 0
                                    for await (let [keys, values] of Object.entries(productValues)) {
                                        logger.debug("=keys===", keys)
                                        if (keys != "undefined" && keys != "" && keys != null && keys != undefined) {
                                            let bulk_type_data = [], final_ml_value, adds_final_ml_value, adds_type_final_ml_value;
                                            let isSameAdsOnExist = await ExecuteQ.Query(req.dbName, `select * from product_adds_on where product_id=? and name=?`, [parseInt(newProductId), values[0].customizationName])
                                            if (isSameAdsOnExist && isSameAdsOnExist.length > 0) {
                                                logger.debug("==DUP=customization>>")
                                                adds_on_inserted_id = isSameAdsOnExist[0].id
                                                await ExecuteQ.Query(req.dbName, "update product_adds_on set " +
                                                    "`is_multiple`=?,`min_adds_on`=?,`max_adds_on`=?,`name`=?,`addon_limit`=?,`is_mandatory`=? where id =?",
                                                    [parseInt(values[0].isMultipleCust), parseInt(values[0].minCustSelection), parseInt(values[0].maxCustSelection),
                                                    values[0].customizationName, parseInt(values[0].maxCustSelection), values[0].isCustMandatory, adds_on_inserted_id]
                                                )
                                            }
                                            else {
                                                var insert_adds_on = await ExecuteQ.Query(req.dbName, "insert into product_adds_on(`product_id`," +
                                                    "`is_multiple`,`min_adds_on`,`max_adds_on`,`name`,`addon_limit`,`is_mandatory`) values(?,?,?,?,?,?,?)",
                                                    [parseInt(newProductId), parseInt(values[0].isMultipleCust), parseInt(values[0].minCustSelection), parseInt(values[0].maxCustSelection),
                                                    values[0].customizationName, parseInt(values[0].maxCustSelection), values[0].isCustMandatory]
                                                )
                                                adds_on_inserted_id = insert_adds_on.insertId
                                                adds_final_ml_value = chunk([values[0].customizationName, adds_on_inserted_id, 14, values[0].customizationName, insert_adds_on.insertId, 15], 3);
                                                var adds_name_ml = await ExecuteQ.Query(req.dbName, `insert into product_adds_on_ml(name,add_on_id,language_id) values ?`,
                                                    [adds_final_ml_value]
                                                )

                                            }

                                            // logger.debug("=======INSRTED==DATA==>>",insert_adds_on,values);
                                            for await (const [indx, i] of values.entries()) {
                                                let isAddsOnTypeIdExist = await ExecuteQ.Query(req.dbName, `select * from product_adds_on_type where name=? and adds_on_id=?`, [i.custTypeName, adds_on_inserted_id])
                                                if (isAddsOnTypeIdExist && isAddsOnTypeIdExist.length > 0) {
                                                    logger.debug("==DUP=customization==type==>>")
                                                    var inser_type_adds_on = await ExecuteQ.Query(req.dbName, "update product_adds_on_type set `name`=?," +
                                                        "`price`=?,`is_default`=?,`quantity`=? where id=?", [
                                                        i.custTypeName, i.custTypePrice, i.custTypeIsDefault, i.custTypeQuantity, isAddsOnTypeIdExist[0].id]
                                                    )
                                                }
                                                else {
                                                    var inser_type_adds_on = await ExecuteQ.Query(req.dbName, "insert into product_adds_on_type (`name`," +
                                                        "`price`,`is_default`,`adds_on_id`,`quantity`) VALUES (?,?,?,?,?)", [
                                                        i.custTypeName, i.custTypePrice, i.custTypeIsDefault, adds_on_inserted_id, i.custTypeQuantity]
                                                    )
                                                    adds_type_final_ml_value = chunk([i.custTypeName, inser_type_adds_on.insertId, 14, i.custTypeName, inser_type_adds_on.insertId, 15], 3);
                                                    var adds_name_ml = await ExecuteQ.Query(req.dbName, `insert into product_adds_on_type_ml(name,adds_on_type_id,language_id) values ?`,
                                                        [adds_type_final_ml_value]
                                                    )
                                                }

                                                // bulk_type_data.push(i.custTypeName,i.custTypePrice,i.custTypeIsDefault,
                                                //     insert_adds_on.insertId,i.custTypeQuantity);
                                            }
                                            final_ml_value = chunk(bulk_type_data, 5);
                                            logger.debug("======final_ml_value=>", final_ml_value);
                                            // var inser_type_adds_on=await ExecuteQ.Query(req.dbName,"insert into product_adds_on_type (`name`,"+
                                            //     "`price`,`is_default`,`adds_on_id`,`quantity`) VALUES ?",[final_ml_value]
                                            // )
                                        }
                                    }


                                }
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                            }
                            else {
                                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
                            }
                        }
                        else {

                            let validHeader = await Universal.validationSupplierHeaderColumn(fileRows[0], serviceType);
                            let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId])
                            logger.debug("=====HeaderVliadtion==supplierBtanchData=>>", validHeader, supplierBtanchData);
                            if (validHeader && supplierBtanchData && supplierBtanchData.length > 0) {
                                const validationError = await insertSupplierProduct(
                                    supplierBtanchData,
                                    userId,
                                    isProduct,
                                    serviceType,
                                    req.dbName,
                                    categoryId,
                                    subCategoryId,
                                    detailSubCategoryId,
                                    fileRows);
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                            }
                            else {
                                logger.debug("====constant.fileMessage.INVALID_FILE", constant.fileMessage);
                                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
                            }
                        }
                    })
            }
            else {
                sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
            }
        }
        else {
            sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
        }

    }
    catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}
const importSupplierProductWithVariants = async (req, res) => {
    try {
        // logger.debug("====req.files.file",req.files.file)


        let fileRows = [];
        let fileName = req.files.file.name
        let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
        let categoryId = req.body.catId;
        let subCategoryId = req.body.subcatId;
        let detailSubCategoryId = req.body.detSubcatId;
        let supplierId = req.body.supplierId;
        let branchId = req.body.branchId || 0;
        let userId = req.user.id;
        let serviceType = req.body.serviceType;
        let apiVersion = Universal.getVersioning(req.path);
        let inserProd = {
            insertId: 0
        }
        let is_cat_variant_value_not_matched = 0;

        //if variant key not matchesds
        let is_cat_variant_not_matched = 0;
        if (fileExtension == "csv") {
            if (req.files.file) {
                // if(parseInt(apiVersion)>0){
                csv.parseFile(req.files.file.path)
                    .on("data", function (data) {
                        // logger.debug("=====DATA!==>>",data);
                        fileRows.push(data); // push each row
                    })
                    .on("end", async function () {
                        let isProduct = parseInt(serviceType) == 1 || parseInt(serviceType) == 2 ? 1 : 0;
                        let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId]);
                        logger.debug("===isProduct===>>", isProduct, fileRows, fileRows[0]);     //contains array of arrays.
                        branchId = parseInt(branchId) == 0 ? supplierBtanchData[0].id : branchId
                        logger.debug("=======branchId==", branchId)

                        await fs.unlinkSync(req.files.file.path);   // remove temp file
                        if (parseInt(apiVersion) > 0) {
                            let validHeaderWithVariants = await Universal.validationSupplierHeaderColumnForVariants(fileRows[0], serviceType);
                            if (validHeaderWithVariants) {
                                const dataRows = fileRows.slice(1, fileRows.length);
                                let productArray = await Universal.getModifiedProdutDataForVariants(dataRows);
                                let afterGroupBy = _.groupBy(productArray, "productName");
                                let productValues;
                                let pJson = {}, pData = [], customJson = {}, customData = [];
                                let newProductId = 0
                                console.log("================after group by=============",afterGroupBy)
                                for await (let [key, value] of Object.entries(afterGroupBy)) {
                                    if(value[0].productName == '' || value[0].productName == undefined){
                                        continue;
                                    }
                                    
                                    customData = []
                                    let isBranchProductExist = await ExecuteQ.Query(req.dbName, `select p.id from product p join supplier_branch_product sbp on sbp.product_id=p.id where p.name=? and sbp.supplier_branch_id=? and p.category_id=?`, [value[0].productName, branchId, detailSubCategoryId])
                                    if (isBranchProductExist && isBranchProductExist.length > 0) {
                                        newProductId = isBranchProductExist[0].id
                                        inserProd.insertId = isBranchProductExist[0].id
                                        await ExecuteQ.Query(req.dbName, `update product set product_desc=?,quantity=? where id=?`, [
                                            value[0].productDesc,
                                            value[0].productQuantity,
                                            , isBranchProductExist[0].id]);
                                        if (parseFloat(value[0].discount) > 0) {
                                            let isDiscountPriceExist = await ExecuteQ.Query(req.dbName, `select * from product_pricing where product_id=?
                                                     and price_type=? and is_deleted=?`, [isBranchProductExist[0].id, 1, 0])
                                            let discountPrices = value[0].productPrice - (value[0].productPrice * value[0].discount / 100);
                                            logger.debug("===discountPrice====", discountPrice);
                                            if (isDiscountPriceExist && isDiscountPriceExist.length > 0) {
                                                await ExecuteQ.Query(req.dbName, `update product_pricing set price=?,display_price=? where id=?`,
                                                    [discountPrices, value[0].productPrice, isDiscountPriceExist[0].id])
                                            }
                                            else {
                                                var discountPriceSql = `insert into product_pricing(
                                                            product_id,
                                                            start_date,
                                                            end_date,
                                                            price,
                                                            handling,
                                                            handling_supplier,
                                                            can_urgent,
                                                            urgent_price,
                                                            delivery_charges,
                                                            urgent_type,
                                                            price_type,
                                                            display_price,
                                                            urgent_value,
                                                            pricing_type,
                                                            user_type_id,
                                                            offer_name,
                                                            house_cleaning_price,
                                                            beauty_saloon_price,
                                                            commission,
                                                            is_deleted,
                                                            commission_type,
                                                            min_hour,
                                                            max_hour,
                                                            per_hour_price
                                                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                await ExecuteQ.Query(req.dbName, discountPriceSql, [
                                                    inserProd.insertId,
                                                    moment(value[0].priceValidFromDate).format('YYYY-MM-DD'),
                                                    moment(value[0].priceValidToDate).format('YYYY-MM-DD'),
                                                    discountPrice,
                                                    value[0].handlingAdmin,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    1,
                                                    value[0].productPrice,
                                                    0,
                                                    0,
                                                    0,
                                                    "",
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0
                                                ])
                                            }
                                        }
                                        await ExecuteQ.Query(req.dbName, `update product_pricing set 
                                                handling=?,price=?,display_price=? where product_id=? and price_type=?`, [
                                            value[0].handlingAdmin,
                                            value[0].productPrice,
                                            value[0].productPrice,
                                            isBranchProductExist[0].id,
                                            0
                                        ])

                                    }
                                    else {
                                        logger.debug("======productValues====", value, value[2], value[3], value[0].productDescInOl);
                                        console.log("==============11111111111111111========")

                                        inserProd = await ExecuteQ.Query(req.dbName, `insert into product(
                                            making_price,
                                            name,
                                            product_desc,
                                            quantity,
                                            category_id,
                                            sub_category_id,
                                            detailed_sub_category_id,
                                            is_global,
                                            is_live,
                                            is_product,
                                            pricing_type,
                                            bar_code,
                                            measuring_unit,
                                            sku,
                                            commission_type,
                                            commission,
                                            commission_package,
                                            recurring_possible,
                                            scheduling_possible,
                                            is_package,
                                            is_deleted,
                                            created_by,
                                            approved_by_supplier,
                                            approved_by_admin,
                                            videoUrl
                                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [value[0].costPrice,
                                            value[0].productName, value[0].productDesc, value[0].productQuantity
                                            , detailSubCategoryId, 0, 0, 1, 1, isProduct, 0,
                                            "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1, value[0].videoUrl]);

                                            console.log("==============22222222222222222222222222222222========")


                                        newProductId = inserProd.insertId;

                                        logger.debug("===inserProd===", inserProd);
                                        logger.debug("======discountInPercntage====", value[0].priceValidFrom, value[0].priceValidTo);

                                        if (parseFloat(value[0].discount) > 0) {
                                            var regularPriceSql = `insert into product_pricing(
                                                    product_id,
                                                    start_date,
                                                    end_date,
                                                    price,
                                                    handling,
                                                    handling_supplier,
                                                    can_urgent,
                                                    urgent_price,
                                                    delivery_charges,
                                                    urgent_type,
                                                    price_type,
                                                    display_price,
                                                    urgent_value,
                                                    pricing_type,
                                                    user_type_id,
                                                    offer_name,
                                                    house_cleaning_price,
                                                    beauty_saloon_price,
                                                    commission,
                                                    is_deleted,
                                                    commission_type,
                                                    min_hour,
                                                    max_hour,
                                                    per_hour_price
                                                    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                            await ExecuteQ.Query(req.dbName, regularPriceSql, [
                                                inserProd.insertId,
                                                moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
                                                moment(value[0].priceValidTo).format('YYYY-MM-DD'),
                                                value[0].productPrice,
                                                value[0].handlingAdmin,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                value[0].productPrice,
                                                0,
                                                0,
                                                0,
                                                "",
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0
                                            ])
                                            let discountPrice = value[0].productPrice - (value[0].productPrice * value[0].discount / 100);
                                            logger.debug("===discountPrice====", discountPrice)
                                            // let discountPric=

                                            var discountPriceSql = `insert into product_pricing(
                                                        product_id,
                                                        start_date,
                                                        end_date,
                                                        price,
                                                        handling,
                                                        handling_supplier,
                                                        can_urgent,
                                                        urgent_price,
                                                        delivery_charges,
                                                        urgent_type,
                                                        price_type,
                                                        display_price,
                                                        urgent_value,
                                                        pricing_type,
                                                        user_type_id,
                                                        offer_name,
                                                        house_cleaning_price,
                                                        beauty_saloon_price,
                                                        commission,
                                                        is_deleted,
                                                        commission_type,
                                                        min_hour,
                                                        max_hour,
                                                        per_hour_price
                                                        ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                            await ExecuteQ.Query(req.dbName, discountPriceSql, [
                                                inserProd.insertId,
                                                moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
                                                moment(value[0].priceValidTo).format('YYYY-MM-DD'),
                                                discountPrice,
                                                value[0].handlingAdmin,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                1,
                                                value[0].productPrice,
                                                0,
                                                0,
                                                0,
                                                "",
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0
                                            ])

                                        }
                                        else {
                                            var regularPriceSql = `insert into product_pricing(
                                                    product_id,
                                                    start_date,
                                                    end_date,
                                                    price,
                                                    handling,
                                                    handling_supplier,
                                                    can_urgent,
                                                    urgent_price,
                                                    delivery_charges,
                                                    urgent_type,
                                                    price_type,
                                                    display_price,
                                                    urgent_value,
                                                    pricing_type,
                                                    user_type_id,
                                                    offer_name,
                                                    house_cleaning_price,
                                                    beauty_saloon_price,
                                                    commission,
                                                    is_deleted,
                                                    commission_type,
                                                    min_hour,
                                                    max_hour,
                                                    per_hour_price
                                                    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                            await ExecuteQ.Query(req.dbName, regularPriceSql, [
                                                inserProd.insertId,
                                                moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
                                                moment(value[0].priceValidTo).format('YYYY-MM-DD'),
                                                value[0].productPrice,
                                                value[0].handlingAdmin,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                value[0].productPrice,
                                                0,
                                                0,
                                                0,
                                                "",
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                0
                                            ])
                                        }
                                        let insertSql = `SELECT ${branchId},${inserProd.insertId},${categoryId},${subCategoryId},${detailSubCategoryId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
                                            from supplier_branch_product 
                                            where supplier_branch_id=${branchId} and category_id=${categoryId};`;
                                        let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
                                        await ExecuteQ.Query(req.dbName, branchProductSql, []);


                                        await ExecuteQ.Query(req.dbName, `insert into product_ml(
                                            product_id,
                                            product_desc,
                                            measuring_unit,
                                            name,
                                            language_id) values (?,?,?,?,?)`, [inserProd.insertId, value[0].productDesc, "", value[0].productName, 14]);

                                        await ExecuteQ.Query(req.dbName, `insert into product_ml(
                                                product_id,
                                                product_desc,
                                                measuring_unit,
                                                name,
                                                language_id) values (?,?,?,?,?)`, [inserProd.insertId, value[0].productDescInOl, "", value[0].productNameInOl, 15]);

                                        let productImages = [
                                            { image: value[0].productImage },
                                            { image: value[0].imageTwo },
                                            { image: value[0].imageThree },
                                            { image: value[0].ImageFour }
                                        ]

                                        for (const [index, i] of productImages.entries()) {
                                            if (i.image !== "") {
                                                await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                                                    [inserProd.insertId, i.image, index + 1, 0]
                                                )
                                            }

                                        }
                                        await ExecuteQ.Query(req.dbName,
                                             `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                                        [inserProd.insertId, "",  1, 1])
                                    }

                                    console.log("==============*************************variant product add start***********========")

                                    /********************************variant product add start************************************* */
                                    logger.debug("==================value==============", value)
                                    if(value && value.length>1){
                                        let variantData = [
                                            { variantKeyName: value[0].variantKeyNameOne, variantKeyValue: value[0].variantKeyValueOne },
                                            { variantKeyName: value[0].variantKeyNameTwo, variantKeyValue: value[0].variantKeyValueTwo },
                                            { variantKeyName: value[0].variantKeyNameThird, variantKeyValue: value[0].variantKeyValueThird },

                                        ]
                                        await Universal.addVariantsProductsIds(req.dbName,
                                            variantData,categoryId,res,inserProd.insertId,inserProd.insertId )
                                        
                                        value.shift();

                                        for (const [index1, i] of value.entries()) {
                                            if (i.variantKeyNameOne !== "" && i.variantKeyValueOne != "" ||
                                                i.variantKeyNameTwo !== "" && i.variantKeyValueTwo != "" ||
                                                i.variantKeyNameTwo !== "" && i.variantKeyValueTwo != "") {
    
                                                let productId = inserProd.insertId
                                                let variantData = [
                                                    { variantKeyName: i.variantKeyNameOne, variantKeyValue: i.variantKeyValueOne },
                                                    { variantKeyName: i.variantKeyNameTwo, variantKeyValue: i.variantKeyValueTwo },
                                                    { variantKeyName: i.variantKeyNameThird, variantKeyValue: i.variantKeyValueThird },
    
                                                ]
                                                logger.debug("======productValues====", value, value[2], value[3], value[0].productDescInOl);
    
                                                let inserVariantProd = await ExecuteQ.Query(req.dbName, `insert into product(
                                                                    making_price,
                                                                    videoUrl,
                                                                    parent_id,
                                                                    name,
                                                                    product_desc,
                                                                    quantity,
                                                                    category_id,
                                                                    sub_category_id,
                                                                    detailed_sub_category_id,
                                                                    is_global,
                                                                    is_live,
                                                                    is_product,
                                                                    pricing_type,
                                                                    bar_code,
                                                                    measuring_unit,
                                                                    sku,
                                                                    commission_type,
                                                                    commission,
                                                                    commission_package,
                                                                    recurring_possible,
                                                                    scheduling_possible,
                                                                    is_package,
                                                                    is_deleted,
                                                                    created_by,
                                                                    approved_by_supplier,
                                                                    approved_by_admin
                                                                    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                                                                        i.costPrice,
                                                    i.videoUrl, productId, i.productName, i.productDesc, i.productQuantity
                                                    , detailSubCategoryId, 0, 0, 1, 1, isProduct, 0,
                                                    "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1]);
                                                newVariantProductId = inserVariantProd.insertId;
    
                                                await Universal.addVariantsProductsIds(req.dbName,
                                                    variantData,categoryId,res,newVariantProductId,productId )
                                                logger.debug("===inserProd===", inserVariantProd);
                                                logger.debug("======discountInPercntage====", i.priceValidFrom, i.priceValidTo);
                                                
                                                if (parseFloat(i.discount) > 0) {
                                                    let regularPriceSql = `insert into product_pricing(
                                                                            product_id,
                                                                            start_date,
                                                                            end_date,
                                                                            price,
                                                                            handling,
                                                                            handling_supplier,
                                                                            can_urgent,
                                                                            urgent_price,
                                                                            delivery_charges,
                                                                            urgent_type,
                                                                            price_type,
                                                                            display_price,
                                                                            urgent_value,
                                                                            pricing_type,
                                                                            user_type_id,
                                                                            offer_name,
                                                                            house_cleaning_price,
                                                                            beauty_saloon_price,
                                                                            commission,
                                                                            is_deleted,
                                                                            commission_type,
                                                                            min_hour,
                                                                            max_hour,
                                                                            per_hour_price
                                                                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                    await ExecuteQ.Query(req.dbName, regularPriceSql, [
                                                        inserVariantProd.insertId,
                                                        moment(i.priceValidFromDate).format('YYYY-MM-DD'),
                                                        moment(i.priceValidToDate).format('YYYY-MM-DD'),
                                                        i.productPrice,
                                                        i.handlingAdmin,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        i.productPrice,
                                                        0,
                                                        0,
                                                        0,
                                                        "",
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0
                                                    ])
                                                    let discountPrice = i.productPrice - (i.productPrice * i.discount / 100);
                                                    logger.debug("===discountPrice====", discountPrice)
                                                    // let discountPric=
    
                                                    let discountPriceSql = `insert into product_pricing(
                                                                                product_id,
                                                                                start_date,
                                                                                end_date,
                                                                                price,
                                                                                handling,
                                                                                handling_supplier,
                                                                                can_urgent,
                                                                                urgent_price,
                                                                                delivery_charges,
                                                                                urgent_type,
                                                                                price_type,
                                                                                display_price,
                                                                                urgent_value,
                                                                                pricing_type,
                                                                                user_type_id,
                                                                                offer_name,
                                                                                house_cleaning_price,
                                                                                beauty_saloon_price,
                                                                                commission,
                                                                                is_deleted,
                                                                                commission_type,
                                                                                min_hour,
                                                                                max_hour,
                                                                                per_hour_price
                                                                                ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                    await ExecuteQ.Query(req.dbName, discountPriceSql, [
                                                        inserVariantProd.insertId,
                                                        moment(i.priceValidFromDate).format('YYYY-MM-DD'),
                                                        moment(i.priceValidToDate).format('YYYY-MM-DD'),
                                                        discountPrice,
                                                        i.handlingAdmin,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        1,
                                                        i.productPrice,
                                                        0,
                                                        0,
                                                        0,
                                                        "",
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0
                                                    ])
    
                                                }
                                                else {
                                                    let regularPriceSql = `insert into product_pricing(
                                                                            product_id,
                                                                            start_date,
                                                                            end_date,
                                                                            price,
                                                                            handling,
                                                                            handling_supplier,
                                                                            can_urgent,
                                                                            urgent_price,
                                                                            delivery_charges,
                                                                            urgent_type,
                                                                            price_type,
                                                                            display_price,
                                                                            urgent_value,
                                                                            pricing_type,
                                                                            user_type_id,
                                                                            offer_name,
                                                                            house_cleaning_price,
                                                                            beauty_saloon_price,
                                                                            commission,
                                                                            is_deleted,
                                                                            commission_type,
                                                                            min_hour,
                                                                            max_hour,
                                                                            per_hour_price
                                                                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                    await ExecuteQ.Query(req.dbName, regularPriceSql, [
                                                        inserVariantProd.insertId,
                                                        moment(i.priceValidFromDate).format('YYYY-MM-DD'),
                                                        moment(i.priceValidToDate).format('YYYY-MM-DD'),
                                                        i.productPrice,
                                                        i.handlingAdmin,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        i.productPrice,
                                                        0,
                                                        0,
                                                        0,
                                                        "",
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        0
                                                    ])
                                                }
    
                                                let insertSql = `SELECT ${branchId},${inserVariantProd.insertId},${categoryId},${subCategoryId},${detailSubCategoryId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
                                                            from supplier_branch_product 
                                                            where supplier_branch_id=${branchId} and category_id=${categoryId};`;
                                                let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
                                                await ExecuteQ.Query(req.dbName, branchProductSql, []);
    
    
                                                await ExecuteQ.Query(req.dbName, `insert into product_ml(
                                                            product_id,
                                                            product_desc,
                                                            measuring_unit,
                                                            name,
                                                            language_id) values (?,?,?,?,?)`, [inserVariantProd.insertId, i.productDesc, "", i.productName, 14]);
    
                                                await ExecuteQ.Query(req.dbName, `insert into product_ml(
                                                                product_id,
                                                                product_desc,
                                                                measuring_unit,
                                                                name,
                                                                language_id) values (?,?,?,?,?)`, [inserVariantProd.insertId, i.productDescInOl, "", i.productNameInOl, 15]);
    
                                                let productImages = [
                                                    { image: i.productImage },
                                                    { image: i.imageTwo },
                                                    { image: i.imageThree },
                                                    { image: i.ImageFour }
                                                ]
                                                for (const [index, i] of productImages.entries()) {
                                                    if (i.image !== "") {
                                                        await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                                                            [inserVariantProd.insertId, i.image, index + 1, 1]
                                                        )
                                                    }
                                                }
                                                await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                                                [inserProd.insertId, "",  1, 1])
    
    
    
    
                                            }
                                        }
                                    }else{
                                        let variantData = [
                                            { variantKeyName: value[0].variantKeyNameOne, variantKeyValue: value[0].variantKeyValueOne },
                                            { variantKeyName: value[0].variantKeyNameTwo, variantKeyValue: value[0].variantKeyValueTwo },
                                            { variantKeyName: value[0].variantKeyNameThird, variantKeyValue: value[0].variantKeyValueThird }
                                        ];

                                        let productId = inserProd.insertId;

                                        await Universal.addVariantsProductsIds(req.dbName,
                                            variantData,categoryId,res,productId,productId )
                                    }
                                  
                                    /********************************variant product add end************************************* */



                                    // await Universal.validateVariantKeyValue(req.dbName,)




                                }
                                let message = ""
                                if (is_cat_variant_not_matched == 1) {
                                    message = "some of the variant key or category id not matched"
                                }
                                if (is_cat_variant_value_not_matched == 1) {
                                    message = "some of the variant values not matched"
                                }
                                if (is_cat_variant_value_not_matched == 1 && is_cat_variant_not_matched == 1) {
                                    message = "some of the variant keys and values not matched"
                                }
                                sendResponse.sendSuccessData({ message: message }, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                            }
                            else {
                                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
                            }
                        }
                        else {

                            let validHeader = await Universal.validationSupplierHeaderColumn(fileRows[0], serviceType);
                            let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId])
                            logger.debug("=====HeaderVliadtion==supplierBtanchData=>>", validHeader, supplierBtanchData);
                            if (validHeader && supplierBtanchData && supplierBtanchData.length > 0) {
                                const validationError = await insertSupplierProduct(
                                    supplierBtanchData,
                                    userId,
                                    isProduct,
                                    serviceType,
                                    req.dbName,
                                    categoryId,
                                    subCategoryId,
                                    detailSubCategoryId,
                                    fileRows);
                                sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                            }
                            else {
                                logger.debug("====constant.fileMessage.INVALID_FILE", constant.fileMessage);
                                sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
                            }
                        }
                    })
            }
            else {
                sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
            }
        }
        else {
            sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
        }

    }
    catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}
// const importAdminProductWithVariants = async (req, res) => {
//     try {
//         // logger.debug("====req.files.file",req.files.file)


//         let fileRows = [];
//         let fileName = req.files.file.name
//         let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
//         let categoryId = req.body.catId;
//         let subCategoryId = req.body.subcatId;
//         let detailSubCategoryId = req.body.detSubcatId; 
//         // let supplierId = req.body.supplierId;
//         let branchId = req.body.branchId || 0;
//         let userId = req.user.id;
//         let serviceType = req.body.serviceType;
//         let apiVersion = Universal.getVersioning(req.path);
//         logger.debug("=======fileExtension=====>>", apiVersion, fileExtension);
//         let inserProd = {
//             insertId: 0
//         }
//         let is_cat_variant_value_not_matched = 0;

//         //if variant key not matchesds
//         let is_cat_variant_not_matched = 0;
//         if (fileExtension == "csv") {
//             if (req.files.file) {
//                 // if(parseInt(apiVersion)>0){
//                 csv.parseFile(req.files.file.path)
//                     .on("data", function (data) {
//                         // logger.debug("=====DATA!==>>",data);
//                         fileRows.push(data); // push each row
//                     })
//                     .on("end", async function () {
//                         let isProduct = parseInt(serviceType) == 1 || parseInt(serviceType) == 2 ? 1 : 0;
//                         let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId]);
//                         logger.debug("===isProduct===>>", isProduct, fileRows, fileRows[0]);     //contains array of arrays.
//                         branchId = parseInt(branchId) == 0 ? supplierBtanchData[0].id : branchId
//                         logger.debug("=======branchId==", branchId)

//                         await fs.unlinkSync(req.files.file.path);   // remove temp file
//                         if (parseInt(apiVersion) > 0) {
//                             let validHeaderWithVariants = await Universal.validationSupplierHeaderColumnForVariants(fileRows[0], serviceType);
//                             if (validHeaderWithVariants) {
//                                 const dataRows = fileRows.slice(1, fileRows.length);
//                                 let productArray = await Universal.getModifiedProdutDataForVariants(dataRows);
//                                 let afterGroupBy = _.groupBy(productArray, "productName");
//                                 let productValues;
//                                 let pJson = {}, pData = [], customJson = {}, customData = [];
//                                 let newProductId = 0
//                                 console.log("================after group by=============",afterGroupBy)
//                                 for await (let [key, value] of Object.entries(afterGroupBy)) {
//                                     if(value[0].productName == '' || value[0].productName == undefined){
//                                         continue;
//                                     }
                                    
//                                     customData = []
//                                     let isBranchProductExist = await ExecuteQ.Query(req.dbName, `select p.id from product p join supplier_branch_product sbp on sbp.product_id=p.id where p.name=? and sbp.supplier_branch_id=? and p.category_id=?`, [value[0].productName, branchId, detailSubCategoryId])
//                                     if (isBranchProductExist && isBranchProductExist.length > 0) {
//                                         newProductId = isBranchProductExist[0].id
//                                         inserProd.insertId = isBranchProductExist[0].id
//                                         await ExecuteQ.Query(req.dbName, `update product set product_desc=?,quantity=? where id=?`, [
//                                             value[0].productDesc,
//                                             value[0].productQuantity,
//                                             , isBranchProductExist[0].id]);
//                                         if (parseFloat(value[0].discount) > 0) {
//                                             let isDiscountPriceExist = await ExecuteQ.Query(req.dbName, `select * from product_pricing where product_id=?
//                                                      and price_type=? and is_deleted=?`, [isBranchProductExist[0].id, 1, 0])
//                                             let discountPrices = value[0].productPrice - (value[0].productPrice * value[0].discount / 100);
//                                             logger.debug("===discountPrice====", discountPrice);
//                                             if (isDiscountPriceExist && isDiscountPriceExist.length > 0) {
//                                                 await ExecuteQ.Query(req.dbName, `update product_pricing set price=?,display_price=? where id=?`,
//                                                     [discountPrices, value[0].productPrice, isDiscountPriceExist[0].id])
//                                             }
//                                             else {
//                                                 var discountPriceSql = `insert into product_pricing(
//                                                             product_id,
//                                                             start_date,
//                                                             end_date,
//                                                             price,
//                                                             handling,
//                                                             handling_supplier,
//                                                             can_urgent,
//                                                             urgent_price,
//                                                             delivery_charges,
//                                                             urgent_type,
//                                                             price_type,
//                                                             display_price,
//                                                             urgent_value,
//                                                             pricing_type,
//                                                             user_type_id,
//                                                             offer_name,
//                                                             house_cleaning_price,
//                                                             beauty_saloon_price,
//                                                             commission,
//                                                             is_deleted,
//                                                             commission_type,
//                                                             min_hour,
//                                                             max_hour,
//                                                             per_hour_price
//                                                             ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                                 await ExecuteQ.Query(req.dbName, discountPriceSql, [
//                                                     inserProd.insertId,
//                                                     moment(value[0].priceValidFromDate).format('YYYY-MM-DD'),
//                                                     moment(value[0].priceValidToDate).format('YYYY-MM-DD'),
//                                                     discountPrice,
//                                                     value[0].handlingAdmin,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     1,
//                                                     value[0].productPrice,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     "",
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0
//                                                 ])
//                                             }
//                                         }
//                                         await ExecuteQ.Query(req.dbName, `update product_pricing set 
//                                                 handling=?,price=?,display_price=? where product_id=? and price_type=?`, [
//                                             value[0].handlingAdmin,
//                                             value[0].productPrice,
//                                             value[0].productPrice,
//                                             isBranchProductExist[0].id,
//                                             0
//                                         ])

//                                     }
//                                     else {
//                                         logger.debug("======productValues====", value, value[2], value[3], value[0].productDescInOl);
//                                         console.log("==============11111111111111111========")

//                                         inserProd = await ExecuteQ.Query(req.dbName, `insert into product(
//                                             making_price,
//                                             name,
//                                             product_desc,
//                                             quantity,
//                                             category_id,
//                                             sub_category_id,
//                                             detailed_sub_category_id,
//                                             is_global,
//                                             is_live,
//                                             is_product,
//                                             pricing_type,
//                                             bar_code,
//                                             measuring_unit,
//                                             sku,
//                                             commission_type,
//                                             commission,
//                                             commission_package,
//                                             recurring_possible,
//                                             scheduling_possible,
//                                             is_package,
//                                             is_deleted,
//                                             created_by,
//                                             approved_by_supplier,
//                                             approved_by_admin,
//                                             videoUrl
//                                             ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [value[0].costPrice,
//                                             value[0].productName, value[0].productDesc, value[0].productQuantity
//                                             , detailSubCategoryId, 0, 0, 1, 1, isProduct, 0,
//                                             "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1, value[0].videoUrl]);

//                                             console.log("==============22222222222222222222222222222222========")


//                                         newProductId = inserProd.insertId;

//                                         logger.debug("===inserProd===", inserProd);
//                                         logger.debug("======discountInPercntage====", value[0].priceValidFrom, value[0].priceValidTo);

//                                         if (parseFloat(value[0].discount) > 0) {
//                                             var regularPriceSql = `insert into product_pricing(
//                                                     product_id,
//                                                     start_date,
//                                                     end_date,
//                                                     price,
//                                                     handling,
//                                                     handling_supplier,
//                                                     can_urgent,
//                                                     urgent_price,
//                                                     delivery_charges,
//                                                     urgent_type,
//                                                     price_type,
//                                                     display_price,
//                                                     urgent_value,
//                                                     pricing_type,
//                                                     user_type_id,
//                                                     offer_name,
//                                                     house_cleaning_price,
//                                                     beauty_saloon_price,
//                                                     commission,
//                                                     is_deleted,
//                                                     commission_type,
//                                                     min_hour,
//                                                     max_hour,
//                                                     per_hour_price
//                                                     ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                             await ExecuteQ.Query(req.dbName, regularPriceSql, [
//                                                 inserProd.insertId,
//                                                 moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
//                                                 moment(value[0].priceValidTo).format('YYYY-MM-DD'),
//                                                 value[0].productPrice,
//                                                 value[0].handlingAdmin,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 value[0].productPrice,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 "",
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0
//                                             ])
//                                             let discountPrice = value[0].productPrice - (value[0].productPrice * value[0].discount / 100);
//                                             logger.debug("===discountPrice====", discountPrice)
//                                             // let discountPric=

//                                             var discountPriceSql = `insert into product_pricing(
//                                                         product_id,
//                                                         start_date,
//                                                         end_date,
//                                                         price,
//                                                         handling,
//                                                         handling_supplier,
//                                                         can_urgent,
//                                                         urgent_price,
//                                                         delivery_charges,
//                                                         urgent_type,
//                                                         price_type,
//                                                         display_price,
//                                                         urgent_value,
//                                                         pricing_type,
//                                                         user_type_id,
//                                                         offer_name,
//                                                         house_cleaning_price,
//                                                         beauty_saloon_price,
//                                                         commission,
//                                                         is_deleted,
//                                                         commission_type,
//                                                         min_hour,
//                                                         max_hour,
//                                                         per_hour_price
//                                                         ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                             await ExecuteQ.Query(req.dbName, discountPriceSql, [
//                                                 inserProd.insertId,
//                                                 moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
//                                                 moment(value[0].priceValidTo).format('YYYY-MM-DD'),
//                                                 discountPrice,
//                                                 value[0].handlingAdmin,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 1,
//                                                 value[0].productPrice,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 "",
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0
//                                             ])

//                                         }
//                                         else {
//                                             var regularPriceSql = `insert into product_pricing(
//                                                     product_id,
//                                                     start_date,
//                                                     end_date,
//                                                     price,
//                                                     handling,
//                                                     handling_supplier,
//                                                     can_urgent,
//                                                     urgent_price,
//                                                     delivery_charges,
//                                                     urgent_type,
//                                                     price_type,
//                                                     display_price,
//                                                     urgent_value,
//                                                     pricing_type,
//                                                     user_type_id,
//                                                     offer_name,
//                                                     house_cleaning_price,
//                                                     beauty_saloon_price,
//                                                     commission,
//                                                     is_deleted,
//                                                     commission_type,
//                                                     min_hour,
//                                                     max_hour,
//                                                     per_hour_price
//                                                     ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                             await ExecuteQ.Query(req.dbName, regularPriceSql, [
//                                                 inserProd.insertId,
//                                                 moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
//                                                 moment(value[0].priceValidTo).format('YYYY-MM-DD'),
//                                                 value[0].productPrice,
//                                                 value[0].handlingAdmin,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 value[0].productPrice,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 "",
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0
//                                             ])
//                                         }
//                                         let insertSql = `SELECT ${branchId},${inserProd.insertId},${categoryId},${subCategoryId},${detailSubCategoryId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
//                                             from supplier_branch_product 
//                                             where supplier_branch_id=${branchId} and category_id=${categoryId};`;
//                                         let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
//                                         await ExecuteQ.Query(req.dbName, branchProductSql, []);


//                                         await ExecuteQ.Query(req.dbName, `insert into product_ml(
//                                             product_id,
//                                             product_desc,
//                                             measuring_unit,
//                                             name,
//                                             language_id) values (?,?,?,?,?)`, [inserProd.insertId, value[0].productDesc, "", value[0].productName, 14]);

//                                         await ExecuteQ.Query(req.dbName, `insert into product_ml(
//                                                 product_id,
//                                                 product_desc,
//                                                 measuring_unit,
//                                                 name,
//                                                 language_id) values (?,?,?,?,?)`, [inserProd.insertId, value[0].productDescInOl, "", value[0].productNameInOl, 15]);

//                                         let productImages = [
//                                             { image: value[0].productImage },
//                                             { image: value[0].imageTwo },
//                                             { image: value[0].imageThree },
//                                             { image: value[0].ImageFour }
//                                         ]

//                                         for (const [index, i] of productImages.entries()) {
//                                             if (i.image !== "") {
//                                                 await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
//                                                     [inserProd.insertId, i.image, index + 1, 0]
//                                                 )
//                                             }

//                                         }
//                                         await ExecuteQ.Query(req.dbName,
//                                              `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
//                                         [inserProd.insertId, "",  1, 1])
//                                     }

//                                     console.log("==============*************************variant product add start***********========")

//                                     /********************************variant product add start************************************* */
//                                     logger.debug("==================value==============", value)
//                                     if(value && value.length>1){
//                                         let variantData = [
//                                             { variantKeyName: value[0].variantKeyNameOne, variantKeyValue: value[0].variantKeyValueOne },
//                                             { variantKeyName: value[0].variantKeyNameTwo, variantKeyValue: value[0].variantKeyValueTwo },
//                                             { variantKeyName: value[0].variantKeyNameThird, variantKeyValue: value[0].variantKeyValueThird },

//                                         ]
//                                         await Universal.addVariantsProductsIds(req.dbName,
//                                             variantData,categoryId,res,inserProd.insertId,inserProd.insertId )
                                        
//                                         value.shift();

//                                         for (const [index1, i] of value.entries()) {
//                                             if (i.variantKeyNameOne !== "" && i.variantKeyValueOne != "" ||
//                                                 i.variantKeyNameTwo !== "" && i.variantKeyValueTwo != "" ||
//                                                 i.variantKeyNameTwo !== "" && i.variantKeyValueTwo != "") {
    
//                                                 let productId = inserProd.insertId
//                                                 let variantData = [
//                                                     { variantKeyName: i.variantKeyNameOne, variantKeyValue: i.variantKeyValueOne },
//                                                     { variantKeyName: i.variantKeyNameTwo, variantKeyValue: i.variantKeyValueTwo },
//                                                     { variantKeyName: i.variantKeyNameThird, variantKeyValue: i.variantKeyValueThird },
    
//                                                 ]
//                                                 logger.debug("======productValues====", value, value[2], value[3], value[0].productDescInOl);
    
//                                                 let inserVariantProd = await ExecuteQ.Query(req.dbName, `insert into product(
//                                                                     making_price,
//                                                                     videoUrl,
//                                                                     parent_id,
//                                                                     name,
//                                                                     product_desc,
//                                                                     quantity,
//                                                                     category_id,
//                                                                     sub_category_id,
//                                                                     detailed_sub_category_id,
//                                                                     is_global,
//                                                                     is_live,
//                                                                     is_product,
//                                                                     pricing_type,
//                                                                     bar_code,
//                                                                     measuring_unit,
//                                                                     sku,
//                                                                     commission_type,
//                                                                     commission,
//                                                                     commission_package,
//                                                                     recurring_possible,
//                                                                     scheduling_possible,
//                                                                     is_package,
//                                                                     is_deleted,
//                                                                     created_by,
//                                                                     approved_by_supplier,
//                                                                     approved_by_admin
//                                                                     ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
//                                                                         i.costPrice,
//                                                     i.videoUrl, productId, i.productName, i.productDesc, i.productQuantity
//                                                     , detailSubCategoryId, 0, 0, 1, 1, isProduct, 0,
//                                                     "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1]);
//                                                 newVariantProductId = inserVariantProd.insertId;
    
//                                                 await Universal.addVariantsProductsIds(req.dbName,
//                                                     variantData,categoryId,res,newVariantProductId,productId )
//                                                 logger.debug("===inserProd===", inserVariantProd);
//                                                 logger.debug("======discountInPercntage====", i.priceValidFrom, i.priceValidTo);
                                                
//                                                 if (parseFloat(i.discount) > 0) {
//                                                     let regularPriceSql = `insert into product_pricing(
//                                                                             product_id,
//                                                                             start_date,
//                                                                             end_date,
//                                                                             price,
//                                                                             handling,
//                                                                             handling_supplier,
//                                                                             can_urgent,
//                                                                             urgent_price,
//                                                                             delivery_charges,
//                                                                             urgent_type,
//                                                                             price_type,
//                                                                             display_price,
//                                                                             urgent_value,
//                                                                             pricing_type,
//                                                                             user_type_id,
//                                                                             offer_name,
//                                                                             house_cleaning_price,
//                                                                             beauty_saloon_price,
//                                                                             commission,
//                                                                             is_deleted,
//                                                                             commission_type,
//                                                                             min_hour,
//                                                                             max_hour,
//                                                                             per_hour_price
//                                                                             ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                                     await ExecuteQ.Query(req.dbName, regularPriceSql, [
//                                                         inserVariantProd.insertId,
//                                                         moment(i.priceValidFromDate).format('YYYY-MM-DD'),
//                                                         moment(i.priceValidToDate).format('YYYY-MM-DD'),
//                                                         i.productPrice,
//                                                         i.handlingAdmin,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         i.productPrice,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         "",
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0
//                                                     ])
//                                                     let discountPrice = i.productPrice - (i.productPrice * i.discount / 100);
//                                                     logger.debug("===discountPrice====", discountPrice)
//                                                     // let discountPric=
    
//                                                     let discountPriceSql = `insert into product_pricing(
//                                                                                 product_id,
//                                                                                 start_date,
//                                                                                 end_date,
//                                                                                 price,
//                                                                                 handling,
//                                                                                 handling_supplier,
//                                                                                 can_urgent,
//                                                                                 urgent_price,
//                                                                                 delivery_charges,
//                                                                                 urgent_type,
//                                                                                 price_type,
//                                                                                 display_price,
//                                                                                 urgent_value,
//                                                                                 pricing_type,
//                                                                                 user_type_id,
//                                                                                 offer_name,
//                                                                                 house_cleaning_price,
//                                                                                 beauty_saloon_price,
//                                                                                 commission,
//                                                                                 is_deleted,
//                                                                                 commission_type,
//                                                                                 min_hour,
//                                                                                 max_hour,
//                                                                                 per_hour_price
//                                                                                 ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                                     await ExecuteQ.Query(req.dbName, discountPriceSql, [
//                                                         inserVariantProd.insertId,
//                                                         moment(i.priceValidFromDate).format('YYYY-MM-DD'),
//                                                         moment(i.priceValidToDate).format('YYYY-MM-DD'),
//                                                         discountPrice,
//                                                         i.handlingAdmin,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         1,
//                                                         i.productPrice,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         "",
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0
//                                                     ])
    
//                                                 }
//                                                 else {
//                                                     let regularPriceSql = `insert into product_pricing(
//                                                                             product_id,
//                                                                             start_date,
//                                                                             end_date,
//                                                                             price,
//                                                                             handling,
//                                                                             handling_supplier,
//                                                                             can_urgent,
//                                                                             urgent_price,
//                                                                             delivery_charges,
//                                                                             urgent_type,
//                                                                             price_type,
//                                                                             display_price,
//                                                                             urgent_value,
//                                                                             pricing_type,
//                                                                             user_type_id,
//                                                                             offer_name,
//                                                                             house_cleaning_price,
//                                                                             beauty_saloon_price,
//                                                                             commission,
//                                                                             is_deleted,
//                                                                             commission_type,
//                                                                             min_hour,
//                                                                             max_hour,
//                                                                             per_hour_price
//                                                                             ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                                     await ExecuteQ.Query(req.dbName, regularPriceSql, [
//                                                         inserVariantProd.insertId,
//                                                         moment(i.priceValidFromDate).format('YYYY-MM-DD'),
//                                                         moment(i.priceValidToDate).format('YYYY-MM-DD'),
//                                                         i.productPrice,
//                                                         i.handlingAdmin,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         i.productPrice,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         "",
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0
//                                                     ])
//                                                 }
    
//                                                 let insertSql = `SELECT ${branchId},${inserVariantProd.insertId},${categoryId},${subCategoryId},${detailSubCategoryId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
//                                                             from supplier_branch_product 
//                                                             where supplier_branch_id=${branchId} and category_id=${categoryId};`;
//                                                 let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
//                                                 await ExecuteQ.Query(req.dbName, branchProductSql, []);
    
    
//                                                 await ExecuteQ.Query(req.dbName, `insert into product_ml(
//                                                             product_id,
//                                                             product_desc,
//                                                             measuring_unit,
//                                                             name,
//                                                             language_id) values (?,?,?,?,?)`, [inserVariantProd.insertId, i.productDesc, "", i.productName, 14]);
    
//                                                 await ExecuteQ.Query(req.dbName, `insert into product_ml(
//                                                                 product_id,
//                                                                 product_desc,
//                                                                 measuring_unit,
//                                                                 name,
//                                                                 language_id) values (?,?,?,?,?)`, [inserVariantProd.insertId, i.productDescInOl, "", i.productNameInOl, 15]);
    
//                                                 let productImages = [
//                                                     { image: i.productImage },
//                                                     { image: i.imageTwo },
//                                                     { image: i.imageThree },
//                                                     { image: i.ImageFour }
//                                                 ]
//                                                 for (const [index, i] of productImages.entries()) {
//                                                     if (i.image !== "") {
//                                                         await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
//                                                             [inserVariantProd.insertId, i.image, index + 1, 1]
//                                                         )
//                                                     }
//                                                 }
//                                                 await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
//                                                 [inserProd.insertId, "",  1, 1])
    
    
    
    
//                                             }
//                                         }
//                                     }else{
//                                         let variantData = [
//                                             { variantKeyName: value[0].variantKeyNameOne, variantKeyValue: value[0].variantKeyValueOne },
//                                             { variantKeyName: value[0].variantKeyNameTwo, variantKeyValue: value[0].variantKeyValueTwo },
//                                             { variantKeyName: value[0].variantKeyNameThird, variantKeyValue: value[0].variantKeyValueThird }
//                                         ];

//                                         let productId = inserProd.insertId;

//                                         await Universal.addVariantsProductsIds(req.dbName,
//                                             variantData,categoryId,res,productId,productId )
//                                     }
                                  
//                                     /********************************variant product add end************************************* */



//                                     // await Universal.validateVariantKeyValue(req.dbName,)




//                                 }
//                                 let message = ""
//                                 if (is_cat_variant_not_matched == 1) {
//                                     message = "some of the variant key or category id not matched"
//                                 }
//                                 if (is_cat_variant_value_not_matched == 1) {
//                                     message = "some of the variant values not matched"
//                                 }
//                                 if (is_cat_variant_value_not_matched == 1 && is_cat_variant_not_matched == 1) {
//                                     message = "some of the variant keys and values not matched"
//                                 }
//                                 sendResponse.sendSuccessData({ message: message }, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
//                             }
//                             else {
//                                 sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
//                             }
//                         }
//                         else {

//                             let validHeader = await Universal.validationSupplierHeaderColumn(fileRows[0], serviceType);
//                             let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId])
//                             logger.debug("=====HeaderVliadtion==supplierBtanchData=>>", validHeader, supplierBtanchData);
//                             if (validHeader && supplierBtanchData && supplierBtanchData.length > 0) {
//                                 const validationError = await insertSupplierProduct(
//                                     supplierBtanchData,
//                                     userId,
//                                     isProduct,
//                                     serviceType,
//                                     req.dbName,
//                                     categoryId,
//                                     subCategoryId,
//                                     detailSubCategoryId,
//                                     fileRows);
//                                 sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
//                             }
//                             else {
//                                 logger.debug("====constant.fileMessage.INVALID_FILE", constant.fileMessage);
//                                 sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
//                             }
//                         }
//                     })
//             }
//             else {
//                 sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
//             }
//         }
//         else {
//             sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
//         }

//     }
//     catch (Err) {
//         logger.debug("======Err!===>>", Err);
//         sendResponse.somethingWentWrongError(res);
//     }
// }


// const importSupplierProductWithVariants = async (req, res) => {
//     try {
//         // logger.debug("====req.files.file",req.files.file)
//         let fileRows = [];
//         let fileName = req.files.file.name
//         let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
//         let categoryId = req.body.catId;
//         let subCategoryId = req.body.subcatId;
//         let detailSubCategoryId = req.body.detSubcatId;
//         let supplierId = req.body.supplierId;
//         let branchId = req.body.branchId || 0;
//         let userId = req.user.id;
//         let serviceType = req.body.serviceType;
//         let apiVersion = Universal.getVersioning(req.path);
//         logger.debug("=======fileExtension======>>", apiVersion, fileExtension);
//         let inserProd = {
//             insertId: 0
//         }
//         let is_cat_variant_value_not_matched = 0;

//         //if variant key not matched 
//         let is_cat_variant_not_matched = 0;
//         if (fileExtension == "csv") {
//             if (req.files.file) {
//                 // if(parseInt(apiVersion)>0){
//                 csv.parseFile(req.files.file.path)
//                     .on("data", function (data) {
//                         // logger.debug("=====DATA!==>>",data);
//                         fileRows.push(data); // push each row
//                     })
//                     .on("end", async function () {
//                         let isProduct = parseInt(serviceType) == 1 || parseInt(serviceType) == 2 ? 1 : 0;
//                         let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId]);
//                         logger.debug("===isProduct===>>", isProduct, fileRows, fileRows[0]);     //contains array of arrays.
//                         branchId = parseInt(branchId) == 0 ? supplierBtanchData[0].id : branchId
//                         logger.debug("=======branchId==", branchId)

//                         await fs.unlinkSync(req.files.file.path);   // remove temp file
//                         if (parseInt(apiVersion) > 0) {
//                             let validHeaderWithVariants = await Universal.validationSupplierHeaderColumnForVariants(fileRows[0], serviceType);
//                             if (validHeaderWithVariants) {
//                                 const dataRows = fileRows.slice(1, fileRows.length);
//                                 let productArray = await Universal.getModifiedProdutDataForVariants(dataRows);
//                                 let afterGroupBy = _.groupBy(productArray, "productName");
//                                 let productValues;
//                                 let pJson = {}, pData = [], customJson = {}, customData = [];
//                                 let newProductId = 0
//                                 console.log("================after group by=============",afterGroupBy)
//                                 for await (let [key, value] of Object.entries(afterGroupBy)) {
//                                     customData = []
//                                     let isBranchProductExist = await ExecuteQ.Query(req.dbName, `select p.* from product p join supplier_branch_product sbp on sbp.product_id=p.id where p.name=? and sbp.supplier_branch_id=? and p.category_id=?`, [value[0].productName, branchId, detailSubCategoryId])
//                                     if (isBranchProductExist && isBranchProductExist.length > 0) {
//                                         newProductId = isBranchProductExist[0].id
//                                         inserProd.insertId = isBranchProductExist[0].id
//                                         await ExecuteQ.Query(req.dbName, `update product set product_desc=?,quantity=? where id=?`, [
//                                             value[0].productDesc,
//                                             value[0].productQuantity,
//                                             , isBranchProductExist[0].id]);
//                                         if (parseFloat(value[0].discount) > 0) {
//                                             let isDiscountPriceExist = await ExecuteQ.Query(req.dbName, `select * from product_pricing where product_id=?
//                                                      and price_type=?,is_deleted=?`, [isBranchProductExist[0].id, 1, 0])
//                                             let discountPrices = value[0].productPrice - (value[0].productPrice * value[0].discount / 100);
//                                             logger.debug("===discountPrice====", discountPrice);
//                                             if (isDiscountPriceExist && isDiscountPriceExist.length > 0) {
//                                                 await ExecuteQ.Query(req.dbName, `update product_pricing price=?,display_price=? where id=?`,
//                                                     [discountPrices, value[0].productPrice, isDiscountPriceExist[0].id])
//                                             }
//                                             else {
//                                                 var discountPriceSql = `insert into product_pricing(
//                                                             product_id,
//                                                             start_date,
//                                                             end_date,
//                                                             price,
//                                                             handling,
//                                                             handling_supplier,
//                                                             can_urgent,
//                                                             urgent_price,
//                                                             delivery_charges,
//                                                             urgent_type,
//                                                             price_type,
//                                                             display_price,
//                                                             urgent_value,
//                                                             pricing_type,
//                                                             user_type_id,
//                                                             offer_name,
//                                                             house_cleaning_price,
//                                                             beauty_saloon_price,
//                                                             commission,
//                                                             is_deleted,
//                                                             commission_type,
//                                                             min_hour,
//                                                             max_hour,
//                                                             per_hour_price
//                                                             ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                                 await ExecuteQ.Query(req.dbName, discountPriceSql, [
//                                                     inserProd.insertId,
//                                                     moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
//                                                     moment(value[0].priceValidTo).format('YYYY-MM-DD'),
//                                                     discountPrice,
//                                                     value[0].handlingAdmin,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     1,
//                                                     value[0].productPrice,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     "",
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0,
//                                                     0
//                                                 ])
//                                             }
//                                         }
//                                         await ExecuteQ.Query(req.dbName, `update product_pricing set 
//                                                 handling=?,price=?,display_price=? where product_id=? and price_type=?`, [
//                                             value[0].handlingAdmin,
//                                             value[0].productPrice,
//                                             value[0].productPrice,
//                                             isBranchProductExist[0].id,
//                                             0
//                                         ])

//                                     }
//                                     else {
//                                         logger.debug("======productValues====", value, value[2], value[3], value[0].productDescInOl);
//                                         console.log("==============11111111111111111========")

//                                         inserProd = await ExecuteQ.Query(req.dbName, `insert into product(
//                                             making_price,
//                                             name,
//                                             product_desc,
//                                             quantity,
//                                             category_id,
//                                             sub_category_id,
//                                             detailed_sub_category_id,
//                                             is_global,
//                                             is_live,
//                                             is_product,
//                                             pricing_type,
//                                             bar_code,
//                                             measuring_unit,
//                                             sku,
//                                             commission_type,
//                                             commission,
//                                             commission_package,
//                                             recurring_possible,
//                                             scheduling_possible,
//                                             is_package,
//                                             is_deleted,
//                                             created_by,
//                                             approved_by_supplier,
//                                             approved_by_admin,
//                                             videoUrl
//                                             ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [value[0].costPrice,
//                                             value[0].productName, value[0].productDesc, value[0].productQuantity
//                                             , detailSubCategoryId, 0, 0, 1, 1, isProduct, 0,
//                                             "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1, value[0].videoUrl]);

//                                             console.log("==============22222222222222222222222222222222========")


//                                         newProductId = inserProd.insertId;

//                                         logger.debug("===inserProd===", inserProd);
//                                         logger.debug("======discountInPercntage====", value[0].priceValidFrom, value[0].priceValidTo);

//                                         if (parseFloat(value[0].discount) > 0) {
//                                             var regularPriceSql = `insert into product_pricing(
//                                                     product_id,
//                                                     start_date,
//                                                     end_date,
//                                                     price,
//                                                     handling,
//                                                     handling_supplier,
//                                                     can_urgent,
//                                                     urgent_price,
//                                                     delivery_charges,
//                                                     urgent_type,
//                                                     price_type,
//                                                     display_price,
//                                                     urgent_value,
//                                                     pricing_type,
//                                                     user_type_id,
//                                                     offer_name,
//                                                     house_cleaning_price,
//                                                     beauty_saloon_price,
//                                                     commission,
//                                                     is_deleted,
//                                                     commission_type,
//                                                     min_hour,
//                                                     max_hour,
//                                                     per_hour_price
//                                                     ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                             await ExecuteQ.Query(req.dbName, regularPriceSql, [
//                                                 inserProd.insertId,
//                                                 moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
//                                                 moment(value[0].priceValidTo).format('YYYY-MM-DD'),
//                                                 value[0].productPrice,
//                                                 value[0].handlingAdmin,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 value[0].productPrice,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 "",
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0
//                                             ])
//                                             let discountPrice = value[0].productPrice - (value[0].productPrice * value[0].discount / 100);
//                                             logger.debug("===discountPrice====", discountPrice)
//                                             // let discountPric=

//                                             var discountPriceSql = `insert into product_pricing(
//                                                         product_id,
//                                                         start_date,
//                                                         end_date,
//                                                         price,
//                                                         handling,
//                                                         handling_supplier,
//                                                         can_urgent,
//                                                         urgent_price,
//                                                         delivery_charges,
//                                                         urgent_type,
//                                                         price_type,
//                                                         display_price,
//                                                         urgent_value,
//                                                         pricing_type,
//                                                         user_type_id,
//                                                         offer_name,
//                                                         house_cleaning_price,
//                                                         beauty_saloon_price,
//                                                         commission,
//                                                         is_deleted,
//                                                         commission_type,
//                                                         min_hour,
//                                                         max_hour,
//                                                         per_hour_price
//                                                         ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                             await ExecuteQ.Query(req.dbName, discountPriceSql, [
//                                                 inserProd.insertId,
//                                                 moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
//                                                 moment(value[0].priceValidTo).format('YYYY-MM-DD'),
//                                                 discountPrice,
//                                                 value[0].handlingAdmin,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 1,
//                                                 value[0].productPrice,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 "",
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0
//                                             ])

//                                         }
//                                         else {
//                                             var regularPriceSql = `insert into product_pricing(
//                                                     product_id,
//                                                     start_date,
//                                                     end_date,
//                                                     price,
//                                                     handling,
//                                                     handling_supplier,
//                                                     can_urgent,
//                                                     urgent_price,
//                                                     delivery_charges,
//                                                     urgent_type,
//                                                     price_type,
//                                                     display_price,
//                                                     urgent_value,
//                                                     pricing_type,
//                                                     user_type_id,
//                                                     offer_name,
//                                                     house_cleaning_price,
//                                                     beauty_saloon_price,
//                                                     commission,
//                                                     is_deleted,
//                                                     commission_type,
//                                                     min_hour,
//                                                     max_hour,
//                                                     per_hour_price
//                                                     ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                             await ExecuteQ.Query(req.dbName, regularPriceSql, [
//                                                 inserProd.insertId,
//                                                 moment(value[0].priceValidFrom).format('YYYY-MM-DD'),
//                                                 moment(value[0].priceValidTo).format('YYYY-MM-DD'),
//                                                 value[0].productPrice,
//                                                 value[0].handlingAdmin,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 value[0].productPrice,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 "",
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0,
//                                                 0
//                                             ])
//                                         }
//                                         let insertSql = `SELECT ${branchId},${inserProd.insertId},${categoryId},${subCategoryId},${detailSubCategoryId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
//                                             from supplier_branch_product 
//                                             where supplier_branch_id=${branchId} and category_id=${categoryId};`;
//                                         let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
//                                         await ExecuteQ.Query(req.dbName, branchProductSql, []);


//                                         await ExecuteQ.Query(req.dbName, `insert into product_ml(
//                                             product_id,
//                                             product_desc,
//                                             measuring_unit,
//                                             name,
//                                             language_id) values (?,?,?,?,?)`, [inserProd.insertId, value[0].productDesc, "", value[0].productName, 14]);

//                                         await ExecuteQ.Query(req.dbName, `insert into product_ml(
//                                                 product_id,
//                                                 product_desc,
//                                                 measuring_unit,
//                                                 name,
//                                                 language_id) values (?,?,?,?,?)`, [inserProd.insertId, value[0].productDescInOl, "", value[0].productNameInOl, 15]);

//                                         let productImages = [
//                                             { image: value[0].productImage },
//                                             { image: value[0].imageTwo },
//                                             { image: value[0].imageThree },
//                                             { image: value[0].ImageFour }
//                                         ]

//                                         for (const [index, i] of productImages.entries()) {
//                                             if (i.image !== "") {
//                                                 await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
//                                                     [inserProd.insertId, i.image, index + 1, 0]
//                                                 )
//                                             }

//                                         }
//                                         await ExecuteQ.Query(req.dbName,
//                                              `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
//                                         [inserProd.insertId, "",  1, 1])
//                                     }

//                                     console.log("==============*************************variant product add start***********========")

//                                     /********************************variant product add start************************************* */
//                                     logger.debug("==================value==============", value)
//                                     if(value && value.length>1){
//                                         for (const [index1, i] of value.entries()) {
//                                             if (i.variantKeyNameOne !== "" && i.variantKeyValueOne != "" ||
//                                                 i.variantKeyNameTwo !== "" && i.variantKeyValueTwo != "" ||
//                                                 i.variantKeyNameTwo !== "" && i.variantKeyValueTwo != "") {
    
//                                                 let productId = inserProd.insertId
//                                                 let variantData = [
//                                                     { variantKeyName: i.variantKeyNameOne, variantKeyValue: i.variantKeyValueOne },
//                                                     { variantKeyName: i.variantKeyNameTwo, variantKeyValue: i.variantKeyValueTwo },
//                                                     { variantKeyName: i.variantKeyNameThird, variantKeyValue: i.variantKeyValueThird },
    
//                                                 ]
//                                                 logger.debug("======productValues====", value, value[2], value[3], value[0].productDescInOl);
    
//                                                 let inserVariantProd = await ExecuteQ.Query(req.dbName, `insert into product(
//                                                                     making_price,
//                                                                     videoUrl,
//                                                                     parent_id,
//                                                                     name,
//                                                                     product_desc,
//                                                                     quantity,
//                                                                     category_id,
//                                                                     sub_category_id,
//                                                                     detailed_sub_category_id,
//                                                                     is_global,
//                                                                     is_live,
//                                                                     is_product,
//                                                                     pricing_type,
//                                                                     bar_code,
//                                                                     measuring_unit,
//                                                                     sku,
//                                                                     commission_type,
//                                                                     commission,
//                                                                     commission_package,
//                                                                     recurring_possible,
//                                                                     scheduling_possible,
//                                                                     is_package,
//                                                                     is_deleted,
//                                                                     created_by,
//                                                                     approved_by_supplier,
//                                                                     approved_by_admin
//                                                                     ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
//                                                                         i.costPrice,
//                                                     i.videoUrl, productId, i.productName, i.productDesc, i.productQuantity
//                                                     , detailSubCategoryId, 0, 0, 1, 1, isProduct, 0,
//                                                     "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1]);
//                                                 newVariantProductId = inserVariantProd.insertId;
    
//                                                 await Universal.addVariantsProductsIds(req.dbName,
//                                                     variantData,categoryId,res,newVariantProductId,productId )
//                                                 logger.debug("===inserProd===", inserVariantProd);
//                                                 logger.debug("======discountInPercntage====", i.priceValidFrom, i.priceValidTo);
                                                
//                                                 if (parseFloat(i.discount) > 0) {
//                                                     let regularPriceSql = `insert into product_pricing(
//                                                                             product_id,
//                                                                             start_date,
//                                                                             end_date,
//                                                                             price,
//                                                                             handling,
//                                                                             handling_supplier,
//                                                                             can_urgent,
//                                                                             urgent_price,
//                                                                             delivery_charges,
//                                                                             urgent_type,
//                                                                             price_type,
//                                                                             display_price,
//                                                                             urgent_value,
//                                                                             pricing_type,
//                                                                             user_type_id,
//                                                                             offer_name,
//                                                                             house_cleaning_price,
//                                                                             beauty_saloon_price,
//                                                                             commission,
//                                                                             is_deleted,
//                                                                             commission_type,
//                                                                             min_hour,
//                                                                             max_hour,
//                                                                             per_hour_price
//                                                                             ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                                     await ExecuteQ.Query(req.dbName, regularPriceSql, [
//                                                         inserVariantProd.insertId,
//                                                         moment(i.priceValidFrom).format('YYYY-MM-DD'),
//                                                         moment(i.priceValidTo).format('YYYY-MM-DD'),
//                                                         i.productPrice,
//                                                         i.handlingAdmin,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         i.productPrice,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         "",
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0
//                                                     ])
//                                                     let discountPrice = i.productPrice - (i.productPrice * i.discount / 100);
//                                                     logger.debug("===discountPrice====", discountPrice)
//                                                     // let discountPric=
    
//                                                     let discountPriceSql = `insert into product_pricing(
//                                                                                 product_id,
//                                                                                 start_date,
//                                                                                 end_date,
//                                                                                 price,
//                                                                                 handling,
//                                                                                 handling_supplier,
//                                                                                 can_urgent,
//                                                                                 urgent_price,
//                                                                                 delivery_charges,
//                                                                                 urgent_type,
//                                                                                 price_type,
//                                                                                 display_price,
//                                                                                 urgent_value,
//                                                                                 pricing_type,
//                                                                                 user_type_id,
//                                                                                 offer_name,
//                                                                                 house_cleaning_price,
//                                                                                 beauty_saloon_price,
//                                                                                 commission,
//                                                                                 is_deleted,
//                                                                                 commission_type,
//                                                                                 min_hour,
//                                                                                 max_hour,
//                                                                                 per_hour_price
//                                                                                 ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                                     await ExecuteQ.Query(req.dbName, discountPriceSql, [
//                                                         inserVariantProd.insertId,
//                                                         moment(i.priceValidFrom).format('YYYY-MM-DD'),
//                                                         moment(i.priceValidTo).format('YYYY-MM-DD'),
//                                                         discountPrice,
//                                                         i.handlingAdmin,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         1,
//                                                         i.productPrice,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         "",
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0
//                                                     ])
    
//                                                 }
//                                                 else {
//                                                     let regularPriceSql = `insert into product_pricing(
//                                                                             product_id,
//                                                                             start_date,
//                                                                             end_date,
//                                                                             price,
//                                                                             handling,
//                                                                             handling_supplier,
//                                                                             can_urgent,
//                                                                             urgent_price,
//                                                                             delivery_charges,
//                                                                             urgent_type,
//                                                                             price_type,
//                                                                             display_price,
//                                                                             urgent_value,
//                                                                             pricing_type,
//                                                                             user_type_id,
//                                                                             offer_name,
//                                                                             house_cleaning_price,
//                                                                             beauty_saloon_price,
//                                                                             commission,
//                                                                             is_deleted,
//                                                                             commission_type,
//                                                                             min_hour,
//                                                                             max_hour,
//                                                                             per_hour_price
//                                                                             ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                                                     await ExecuteQ.Query(req.dbName, regularPriceSql, [
//                                                         inserVariantProd.insertId,
//                                                         moment(i.priceValidFrom).format('YYYY-MM-DD'),
//                                                         moment(i.priceValidTo).format('YYYY-MM-DD'),
//                                                         i.productPrice,
//                                                         i.handlingAdmin,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         i.productPrice,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         "",
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0,
//                                                         0
//                                                     ])
//                                                 }
    
//                                                 let insertSql = `SELECT ${branchId},${inserVariantProd.insertId},${categoryId},${subCategoryId},${detailSubCategoryId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
//                                                             from supplier_branch_product 
//                                                             where supplier_branch_id=${branchId} and category_id=${categoryId};`;
//                                                 let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
//                                                 await ExecuteQ.Query(req.dbName, branchProductSql, []);
    
    
//                                                 await ExecuteQ.Query(req.dbName, `insert into product_ml(
//                                                             product_id,
//                                                             product_desc,
//                                                             measuring_unit,
//                                                             name,
//                                                             language_id) values (?,?,?,?,?)`, [inserVariantProd.insertId, i.productDesc, "", i.productName, 14]);
    
//                                                 await ExecuteQ.Query(req.dbName, `insert into product_ml(
//                                                                 product_id,
//                                                                 product_desc,
//                                                                 measuring_unit,
//                                                                 name,
//                                                                 language_id) values (?,?,?,?,?)`, [inserVariantProd.insertId, i.productDescInOl, "", i.productNameInOl, 15]);
    
//                                                 let productImages = [
//                                                     { image: i.productImage },
//                                                     { image: i.imageTwo },
//                                                     { image: i.imageThree },
//                                                     { image: i.ImageFour }
//                                                 ]
//                                                 for (const [index, i] of productImages.entries()) {
//                                                     if (i.image !== "") {
//                                                         await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
//                                                             [inserVariantProd.insertId, i.image, index + 1, 1]
//                                                         )
//                                                     }
//                                                 }
//                                                 await ExecuteQ.Query(req.dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
//                                                 [inserProd.insertId, "",  1, 1])
    
    
    
    
//                                             }
//                                         }
//                                     }else{
//                                         let variantData = [
//                                             { variantKeyName: value[0].variantKeyNameOne, variantKeyValue: value[0].variantKeyValueOne }

//                                         ];

//                                         let productId = inserProd.insertId;

//                                         await Universal.addVariantsProductsIds(req.dbName,
//                                             variantData,categoryId,res,productId,productId )
//                                     }
                                  
//                                     /********************************variant product add end************************************* */



//                                     // await Universal.validateVariantKeyValue(req.dbName,)




//                                 }
//                                 let message = ""
//                                 if (is_cat_variant_not_matched == 1) {
//                                     message = "some of the variant key or category id not matched"
//                                 }
//                                 if (is_cat_variant_value_not_matched == 1) {
//                                     message = "some of the variant values not matched"
//                                 }
//                                 if (is_cat_variant_value_not_matched == 1 && is_cat_variant_not_matched == 1) {
//                                     message = "some of the variant keys and values not matched"
//                                 }
//                                 sendResponse.sendSuccessData({ message: message }, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
//                             }
//                             else {
//                                 sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
//                             }
//                         }
//                         else {

//                             let validHeader = await Universal.validationSupplierHeaderColumn(fileRows[0], serviceType);
//                             let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId])
//                             logger.debug("=====HeaderVliadtion==supplierBtanchData=>>", validHeader, supplierBtanchData);
//                             if (validHeader && supplierBtanchData && supplierBtanchData.length > 0) {
//                                 const validationError = await insertSupplierProduct(
//                                     supplierBtanchData,
//                                     userId,
//                                     isProduct,
//                                     serviceType,
//                                     req.dbName,
//                                     categoryId,
//                                     subCategoryId,
//                                     detailSubCategoryId,
//                                     fileRows);
//                                 sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
//                             }
//                             else {
//                                 logger.debug("====constant.fileMessage.INVALID_FILE", constant.fileMessage);
//                                 sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
//                             }
//                         }
//                     })
//             }
//             else {
//                 sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
//             }
//         }
//         else {
//             sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
//         }

//     }
//     catch (Err) {
//         logger.debug("======Err!===>>", Err);
//         sendResponse.somethingWentWrongError(res);
//     }
// }

const insertSupplierProduct = (supplierBtanchData, userId, isProduct, serviceType, dbName, catId, subId, detailSubId, rows) => {
    return new Promise(async (resolve, reject) => {
        // logger.debug("=====validateCsvData====",rows);
        const dataRows = rows.slice(1, rows.length); //ignore header at 0 and get rest of the rows
        // logger.debug("===dataRows====",rows[0]);
        try {
            for (const [index, i] of dataRows.entries()) {
                logger.debug("=======I==", i[0], i[2], i[3], catId, subId, detailSubId, 1, 1, i[8]);

                // if(serviceType==1){
                let inserProd = await ExecuteQ.Query(dbName, `insert into product(
                    name,
                    product_desc,
                    quantity,
                    category_id,
                    sub_category_id,
                    detailed_sub_category_id,
                    is_global,
                    is_live,
                    is_product,
                    pricing_type,
                    bar_code,
                    measuring_unit,
                    sku,
                    commission_type,
                    commission,
                    commission_package,
                    recurring_possible,
                    scheduling_possible,
                    is_package,
                    is_deleted,
                    created_by,
                    approved_by_supplier,
                    approved_by_admin
                    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [i[0], i[2], i[4], catId, subId, detailSubId, 1, 1, isProduct, 0,
                    "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1]);


                logger.debug("===inserProd===", inserProd);

                await ExecuteQ.Query(dbName, `insert into product_ml(
                    product_id,
                    product_desc,
                    measuring_unit,
                    name,
                    language_id) values (?,?,?,?,?)`, [inserProd.insertId, i[2], "", i[0], 14]);

                await ExecuteQ.Query(dbName, `insert into product_ml(
                        product_id,
                        product_desc,
                        measuring_unit,
                        name,
                        language_id) values (?,?,?,?,?)`, [inserProd.insertId, i[3], "", i[1], 15]);

                await ExecuteQ.Query(dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                    [inserProd.insertId, i[5], 1, 1]
                );

                logger.debug("======discountInPercntage====", i[7]);
                if (parseFloat(i[8]) > 0) {
                    var regularPriceSql = `insert into product_pricing(
                            product_id,
                            start_date,
                            end_date,
                            price,
                            handling,
                            handling_supplier,
                            can_urgent,
                            urgent_price,
                            delivery_charges,
                            urgent_type,
                            price_type,
                            display_price,
                            urgent_value,
                            pricing_type,
                            user_type_id,
                            offer_name,
                            house_cleaning_price,
                            beauty_saloon_price,
                            commission,
                            is_deleted,
                            commission_type,
                            min_hour,
                            max_hour,
                            per_hour_price
                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    await ExecuteQ.Query(dbName, regularPriceSql, [
                        inserProd.insertId,
                        moment(i[9]).format('YYYY-MM-DD'),
                        moment(i[10]).format('YYYY-MM-DD'),
                        i[6],
                        i[7],
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        i[6],
                        0,
                        0,
                        0,
                        "",
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ])
                    let discountPrice = i[6] - (i[6] * i[8] / 100);
                    logger.debug("===discountPrice====", discountPrice)
                    // let discountPric=

                    var discountPriceSql = `insert into product_pricing(
                                product_id,
                                start_date,
                                end_date,
                                price,
                                handling,
                                handling_supplier,
                                can_urgent,
                                urgent_price,
                                delivery_charges,
                                urgent_type,
                                price_type,
                                display_price,
                                urgent_value,
                                pricing_type,
                                user_type_id,
                                offer_name,
                                house_cleaning_price,
                                beauty_saloon_price,
                                commission,
                                is_deleted,
                                commission_type,
                                min_hour,
                                max_hour,
                                per_hour_price
                                ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    await ExecuteQ.Query(dbName, discountPriceSql, [
                        inserProd.insertId,
                        moment(i[9]).format('YYYY-MM-DD'),
                        moment(i[10]).format('YYYY-MM-DD'),
                        discountPrice,
                        i[7],
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        i[6],
                        0,
                        0,
                        0,
                        "",
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ])

                }
                else {
                    var regularPriceSql = `insert into product_pricing(
                            product_id,
                            start_date,
                            end_date,
                            price,
                            handling,
                            handling_supplier,
                            can_urgent,
                            urgent_price,
                            delivery_charges,
                            urgent_type,
                            price_type,
                            display_price,
                            urgent_value,
                            pricing_type,
                            user_type_id,
                            offer_name,
                            house_cleaning_price,
                            beauty_saloon_price,
                            commission,
                            is_deleted,
                            commission_type,
                            min_hour,
                            max_hour,
                            per_hour_price
                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    await ExecuteQ.Query(dbName, regularPriceSql, [
                        inserProd.insertId,
                        moment(i[9]).format('YYYY-MM-DD'),
                        moment(i[10]).format('YYYY-MM-DD'),
                        i[6],
                        i[7],
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        i[6],
                        0,
                        0,
                        0,
                        "",
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ])
                }

                // catId,subId,detailSubId
                let insertSql = `SELECT ${supplierBtanchData[0].id},${inserProd.insertId},${catId},${subId},${detailSubId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
                    from supplier_branch_product 
                    where supplier_branch_id=${supplierBtanchData[0].id} and category_id=${catId};`;
                let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
                await ExecuteQ.Query(dbName, branchProductSql, []);
            }
            // }
            resolve()
        }
        catch (Err) {
            logger.debug("=======ERR!==>", Err);
            reject(Err)
        }

    })
}
const importSupplierProductVariant = (req, res) => {
    try {
        // logger.debug("====req.files.file",req.files.file)
        let fileRows = [];
        let fileName = req.files.file.name
        let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
        let categoryId = req.body.catId;
        let subCategoryId = req.body.subcatId;
        let detailSubCategoryId = req.body.detSubcatId;
        let supplierId = req.body.supplierId;
        let userId = req.user.id;
        let serviceType = req.body.serviceType;
        let variantId = req.body.variantId;
        let parentId = req.body.parentId;
        logger.debug("=======fileExtension======>>", fileExtension);
        if (fileExtension == "csv") {
            if (req.files.file) {
                csv.parseFile(req.files.file.path)
                    .on("data", function (data) {
                        // logger.debug("=====DATA!==>>",data);
                        fileRows.push(data); // push each row
                    })
                    .on("end", async function () {
                        let isProduct = parseInt(serviceType) == 1 || parseInt(serviceType) == 2 ? 1 : 0;
                        logger.debug("===isProduct===>>", isProduct, fileRows, fileRows[0]);     //contains array of arrays.
                        await fs.unlinkSync(req.files.file.path);   // remove temp file
                        let validHeader = await Universal.validationSupplierHeaderColumn(fileRows[0], serviceType);
                        let supplierBtanchData = await ExecuteQ.Query(req.dbName, `select sb.* from supplier s join supplier_branch sb on sb.supplier_id=s.id where s.id=?`, [supplierId])
                        logger.debug("=====HeaderVliadtion==supplierBtanchData=>>", validHeader, supplierBtanchData);
                        if (validHeader && supplierBtanchData && supplierBtanchData.length > 0 && variantId && variantId.length > 0) {
                            const validationError = await insertSupplierProductVariant(
                                parentId,
                                variantId,
                                supplierBtanchData,
                                userId,
                                isProduct,
                                serviceType,
                                req.dbName,
                                categoryId,
                                subCategoryId,
                                detailSubCategoryId,
                                fileRows);
                            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                        }
                        else {
                            logger.debug("====constant.fileMessage.INVALID_FILE", constant.fileMessage);
                            sendResponse.sendErrorMessage(constant.fileMessage.INVALID_HEADER, res, 400);
                        }
                    })
            }
            else {
                sendResponse.sendErrorMessage(constant.ProductRating.INVALID_FILE, res, 400);
            }
        }
        else {
            sendResponse.sendErrorMessage(constant.fileMessage.INVALID_FILE, res, 400);
        }

    }
    catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}
const insertSupplierProductVariant = (parentId, variantId, supplierBtanchData, userId, isProduct, serviceType, dbName, catId, subId, detailSubId, rows) => {
    return new Promise(async (resolve, reject) => {
        // logger.debug("=====validateCsvData====",rows);
        const dataRows = rows.slice(1, rows.length); //ignore header at 0 and get rest of the rows
        // logger.debug("===dataRows====",rows[0]);
        let variantArr;
        let
        try {
            for (const [index, i] of dataRows.entries()) {
                logger.debug("=======I==", i[0], i[2], i[3], catId, subId, detailSubId, 1, 1, i[8]);
                variantArr = []
                // if(serviceType==1){
                let inserProd = await ExecuteQ.Query(dbName, `insert into product(
                    name,
                    product_desc,
                    quantity,
                    category_id,
                    sub_category_id,
                    detailed_sub_category_id,
                    is_global,
                    is_live,
                    is_product,
                    pricing_type,
                    bar_code,
                    measuring_unit,
                    sku,
                    commission_type,
                    commission,
                    commission_package,
                    recurring_possible,
                    scheduling_possible,
                    is_package,
                    is_deleted,
                    created_by,
                    approved_by_supplier,
                    approved_by_admin,
                    parent_id
                    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [i[0], i[2], i[4], catId, subId, detailSubId, 1, 1, isProduct, 0,
                    "", "", "", 0, 0.0, 0, 0, 0, 0, 0, userId, 1, 1, parentId]);


                logger.debug("===inserProd===", inserProd);

                await ExecuteQ.Query(dbName, `insert into product_ml(
                    product_id,
                    product_desc,
                    measuring_unit,
                    name,
                    language_id) values (?,?,?,?,?)`, [inserProd.insertId, i[2], "", i[0], 14]);

                await ExecuteQ.Query(dbName, `insert into product_ml(
                        product_id,
                        product_desc,
                        measuring_unit,
                        name,
                        language_id) values (?,?,?,?,?)`, [inserProd.insertId, i[3], "", i[1], 15]);

                await ExecuteQ.Query(dbName, `insert into product_image(product_id,image_path,imageOrder,default_image) values(?,?,?,?)`,
                    [inserProd.insertId, i[5], 1, 1]
                );
                logger.debug("======discountInPercntage====", i[7]);
                if (parseFloat(i[8]) > 0) {
                    var regularPriceSql = `insert into product_pricing(
                            product_id,
                            start_date,
                            end_date,
                            price,
                            handling,
                            handling_supplier,
                            can_urgent,
                            urgent_price,
                            delivery_charges,
                            urgent_type,
                            price_type,
                            display_price,
                            urgent_value,
                            pricing_type,
                            user_type_id,
                            offer_name,
                            house_cleaning_price,
                            beauty_saloon_price,
                            commission,
                            is_deleted,
                            commission_type,
                            min_hour,
                            max_hour,
                            per_hour_price
                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    await ExecuteQ.Query(dbName, regularPriceSql, [
                        inserProd.insertId,
                        moment(i[9]).format('YYYY-MM-DD'),
                        moment(i[10]).format('YYYY-MM-DD'),
                        i[6],
                        i[7],
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        i[6],
                        0,
                        0,
                        0,
                        "",
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ])
                    let discountPrice = i[6] - (i[6] * i[8] / 100);
                    logger.debug("===discountPrice====", discountPrice)
                    // let discountPric=
                    var discountPriceSql = `insert into product_pricing(
                                product_id,
                                start_date,
                                end_date,
                                price,
                                handling,
                                handling_supplier,
                                can_urgent,
                                urgent_price,
                                delivery_charges,
                                urgent_type,
                                price_type,
                                display_price,
                                urgent_value,
                                pricing_type,
                                user_type_id,
                                offer_name,
                                house_cleaning_price,
                                beauty_saloon_price,
                                commission,
                                is_deleted,
                                commission_type,
                                min_hour,
                                max_hour,
                                per_hour_price
                                ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    await ExecuteQ.Query(dbName, discountPriceSql, [
                        inserProd.insertId,
                        moment(i[9]).format('YYYY-MM-DD'),
                        moment(i[10]).format('YYYY-MM-DD'),
                        discountPrice,
                        i[7],
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        i[6],
                        0,
                        0,
                        0,
                        "",
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ])

                }
                else {
                    var regularPriceSql = `insert into product_pricing(
                            product_id,
                            start_date,
                            end_date,
                            price,
                            handling,
                            handling_supplier,
                            can_urgent,
                            urgent_price,
                            delivery_charges,
                            urgent_type,
                            price_type,
                            display_price,
                            urgent_value,
                            pricing_type,
                            user_type_id,
                            offer_name,
                            house_cleaning_price,
                            beauty_saloon_price,
                            commission,
                            is_deleted,
                            commission_type,
                            min_hour,
                            max_hour,
                            per_hour_price
                            ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    await ExecuteQ.Query(dbName, regularPriceSql, [
                        inserProd.insertId,
                        moment(i[9]).format('YYYY-MM-DD'),
                        moment(i[10]).format('YYYY-MM-DD'),
                        i[6],
                        i[7],
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        i[6],
                        0,
                        0,
                        0,
                        "",
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ])
                }
                // catId,subId,detailSubId
                let insertSql = `SELECT ${supplierBtanchData[0].id},${inserProd.insertId},${catId},${subId},${detailSubId},${0},${0},${0},IFNULL(MAX(order_no)+1,0) as order_no
                    from supplier_branch_product 
                    where supplier_branch_id=${supplierBtanchData[0].id} and category_id=${catId};`;
                let branchProductSql = "insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,delivery_charges,is_deleted,order_no) " + insertSql;
                await ExecuteQ.Query(dbName, branchProductSql, []);
                // insert into product_variants(`product_id`,`variant_id`,`parent_id`) values ?
                for (const [index, j] of variantId.entries()) {
                    variantArr.push(inserProd.insertId, i, parentId)
                }
                finalVariantValue = chunk(variantArr, 3);
                logger.debug("=====finalVariantValue==>>", finalVariantValue)
                await ExecuteQ.Query(dbName, `insert into product_variants(product_id,variant_id,parent_id) values ?`,
                    [finalVariantValue]
                )

            }
            // }
            resolve()
        }
        catch (Err) {
            logger.debug("=======ERR!==>", Err);
            reject(Err)
        }

    })
}
/**
 * @description used for copy adds in other products
 * @param {*Object} req 
 * @param {*Object} res 
 */
const addsOnCopyInProducts = async (req, res) => {
    try {
        let adsOnIds = req.body.addsOnIds;
        let productIds = req.body.productIds;
        logger.debug("===productIds=adsOnIds==>>", productIds, adsOnIds)
        if (productIds && productIds.length > 0) {
            for (const [index, i] of productIds.entries()) {

                if (adsOnIds && adsOnIds.length > 0) {


                    for (const [index1, j] of adsOnIds.entries()) {

                        let addsOnData = await ExecuteQ.Query(req.dbName, `insert into product_adds_on(name,is_multiple,min_adds_on,addon_limit,max_adds_on,
                                is_mandatory,product_id) select name,is_multiple,min_adds_on,addon_limit,max_adds_on,is_mandatory,${i}
                                from product_adds_on where id=?`, [j]);

                        let addssOnType = await ExecuteQ.Query(req.dbName, `insert into product_adds_on_type(name,price,is_default,quantity,adds_on_id) select 
                            pat.name,pat.price,pat.is_default,pat.quantity,${addsOnData.insertId}
                            from product_adds_on_type pat join product_adds_on pa on pa.id=pat.adds_on_id 
                            where pa.id=?`, [j]);

                        let typData=await ExecuteQ.Query(req.dbName,`select 
                        pat.id,pat.name,pat.price,pat.is_default,pat.quantity
                        from product_adds_on_type pat join product_adds_on pa on pa.id=pat.adds_on_id 
                        where pa.id=?`,[addsOnData.insertId])
                        if(typData && typData.length>0){

                            for(const [ind,k] of typData.entries()){
                                let addssOnTypeMl = await ExecuteQ.Query(req.dbName, `insert into product_adds_on_type_ml(name,adds_on_type_id,language_id) select 
                                paty.name,${k.id},paty.language_id
                                from product_adds_on_type_ml paty join product_adds_on_type pat on paty.adds_on_type_id=pat.id join product_adds_on pa on pa.id=pat.adds_on_id 
                                where pa.id=? and paty.adds_on_type_id IN (select 
                                    paty.adds_on_type_id
                                    from product_adds_on_type_ml paty join product_adds_on_type pat on paty.adds_on_type_id=pat.id join product_adds_on pa on pa.id=pat.adds_on_id 
                                    where pa.id=298 and paty.name=? )`, [j,k.name])
                                
                            }
                    }
                        
                        
                    }

                }
            }

        }
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}

const updateProductUnavailabe = async (req, res) => {
    try {
        let product_id = req.body.product_id;
        let item_unavailable = req.body.item_unavailable;
        let is_live=parseInt(req.body.item_unavailable)==1?0:1
        let query = "update product set item_unavailable=?,is_live=? where id =?";
        let params = [item_unavailable,is_live, product_id];
        await ExecuteQ.Query(req.dbName, query, params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}


const updateProductAproval = async (req, res) => {
    try {
        let product_id = req.body.product_id;
        let is_supplier_product_approved = req.body.is_supplier_product_approved;

        let query = "update product set is_supplier_product_approved=? where id =?";
        let params = [is_supplier_product_approved, product_id];
        await ExecuteQ.Query(req.dbName, query, params);

        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    }
    catch (Err) {
        logger.debug("======Err!===>>", Err);
        sendResponse.somethingWentWrongError(res);
    }
}
module.exports = {
    addsOnCopyInProducts: addsOnCopyInProducts,
    importSupplierProductVariant: importSupplierProductVariant,
    importSupplierProduct: importSupplierProduct,
    importProduct: importProduct,
    productByBranch: productByBranch,
    UpdateProductAddsOn: UpdateProductAddsOn,
    GetAddsOn: GetAddsOn,
    AddProductAddsOn: AddProductAddsOn,
    variantList: variantList,
    productDetail: productDetail,
    deleteAddOn: deleteAddOn,
    deleteAddOnType: deleteAddOnType,
    updateProductUnavailabe: updateProductUnavailabe,
    importSupplierProductWithVariants: importSupplierProductWithVariants,
    // importAdminProductWithVariants: importAdminProductWithVariants,
    importCategoryVariants:importCategoryVariants,
    updateProductAproval:updateProductAproval
}
