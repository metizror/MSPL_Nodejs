/**
 * Created by Paras on 23/5/16.
 */


var func = require('./commonfunction');
const uploadMgr = require('../lib/UploadMgr')
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var async = require('async');
var moment = require('moment');
var pushNotifications = require('./pushNotifications');
var emailTemp = require('./email');
var AdminMail = "ops@royo.com"
//var AdminMail = "mohit0641@gmail.com"
var orderFunc = require('./orderFunction');
var supplierExtranet = require('./supplierExtranet');
var adminOrders = require('./adminOrders');
var consts = require('./../config/const');
var log4js = require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
var crypto = require('crypto')
algorithm = consts.SERVER.CYPTO.ALGO,
    crypto_password = consts.SERVER.CYPTO.PWD

const ExecuteQ = require('../lib/Execute');

exports.checkAppVersion = function (req, res) {
    var deviceType;
    //var appVersion;
    var app;
    var data = {};
    // console.log(req.headers)
    // var dbConnection;
    // if(req.headers.secretdbkey!=undefined && req.headers.secretdbkey!=""){
    //     var decipher = crypto.createDecipher(algorithm,crypto_password)
    //     var decDbName = decipher.update(req.headers.secretdbkey,'hex','utf8')
    //     decDbName += decipher.final('utf8');
    //     console.log("==DB_NAME==",decDbName)
    //     dbConnection=multiConnection[decDbName]
    // }
    // else{
    //     dbConnection=connection
    // }

    async.auto({
        checkValues: function (cb) {
            if (!req.body.deviceType) {
                var msg = "device type not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            /*  if (!req.body.appType) {
                  var msg = "device type not found";
                  return sendResponse.sendErrorMessage(msg, res, 400);
              }*/

            if (req.body && req.body.deviceType) {
                deviceType = req.body.deviceType;
                app = req.body.appType;
                cb(null);
            }
        },
        checkAppVersion: ['checkValues', function (cb) {
            if (req.body.appType) {
                var sql = "select version,forced_version from user_app_version where type  = ? and device_type = ?";
                logger.debug("============req.dbName in check app version========", req.dbName)
                multiConnection[req.dbName].query(sql, [app, deviceType], function (err, result) {
                    console.log("err2..", err, result);
                    if (err) {
                        var msg = "db error :";
                        sendResponse.sendErrorMessage(msg, res, 500);
                    } else {
                        data = result[0];
                        cb(null);
                    }
                })
            }
            else {
                data.version = 0;
                data.forced_version = 0
                cb(null);
            }

        }]
    }, function (err, response) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            data.is_forced = 0
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
        }

    })

}


exports.get_Admin_version = function (req, res) {
    var sql = "select version,forced_version,type,device_type from user_app_version where 1";
    multiConnection[req.dbName].query(sql, [], function (err, result) {
        console.log("err2..", err, result);
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 4);
        }
    })
}


exports.edit_version = function (req, res) {
    var sql = "update user_app_version set version = ?,forced_version = ? where device_type = ? and type = ?";
    multiConnection[req.dbName].query(sql, [req.body.version, req.body.forced_version, req.body.device_type, req.body.type], function (err, result) {
        console.log(".....err2..", err, result);
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, 4);
        }
    })
}

exports.requestForCategoriesApproval = async function (req, res) {

    var offset = req.query.offset ? req.query.offset : 0;
    var limit = req.query.limit ? req.query.limit : 10;
    var languageId = req.query.limit ? req.query.languageId : 10;

    offset = parseInt(offset);
    limit = parseInt(limit);
    languageId = parseInt(languageId);

    const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['isCategoryNeedAdminApproval']);
    settingDataKeys.keyAndValue.isCategoryNeedAdminApproval = !!settingDataKeys.keyAndValue.isCategoryNeedAdminApproval;
    if (settingDataKeys.keyAndValue.isCategoryNeedAdminApproval === true) {
        let sql1 = `SELECT sc.id as supplierCategoryId,c.id AS categoryId, c.name AS categoryName,c_ml.description AS categoryDescription, s.id AS supplierId, s.name AS supplierName FROM supplier_category sc 
    INNER JOIN categories c ON ( c.id = sc.category_id) 
    INNER JOIN categories_ml c_ml ON ( c_ml.category_id = c.id) 
    INNER JOIN supplier s ON ( s.id = sc.supplier_id) 
    WHERE sc.isAdminApproveCategory is NULL AND c_ml.language_id=?
    ORDER BY c.created_on DESC 
    LIMIT ?,?`;
        let params1 = [languageId, offset, limit];
        const result = await ExecuteQ.Query(req.dbName, sql1, params1);

        let sql2 = `SELECT count(sc.id) as count FROM supplier_category sc 
    INNER JOIN categories c ON ( c.id = sc.category_id) 
    INNER JOIN categories_ml c_ml ON ( c_ml.category_id = c.id) 
    INNER JOIN supplier s ON ( s.id = sc.supplier_id) 
    WHERE sc.isAdminApproveCategory is NULL AND c_ml.language_id=?
    ORDER BY c.created_on DESC`;
        let params2 = [languageId];
        const total = await ExecuteQ.Query(req.dbName, sql2, params2);

        sendResponse.sendSuccessData({ result, total: total[0]["count"], offset, limit }, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    } else {
        sendResponse.sendSuccessData({}, "Not active from settings", res, constant.responseStatus.SUCCESS);
    }

}



exports.patchRequestForCategoriesApproval = async function (req, res) {

    const supplierCategoryId = parseInt(req.body.supplierCategoryId);  //1 for approval, 0 disapproval
    const approvalType = parseInt(req.body.approvalType);  //1 for approval, 0 disapproval
    const supplierId = parseInt(req.body.supplierId);

    const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['isCategoryNeedAdminApproval']);
    settingDataKeys.keyAndValue.isCategoryNeedAdminApproval = !!settingDataKeys.keyAndValue.isCategoryNeedAdminApproval;
    if (settingDataKeys.keyAndValue.isCategoryNeedAdminApproval === true) {

        let sql1 = '';
        let params1 = '';
        if (approvalType) { // 1: approval
            sql1 = `
        UPDATE supplier_category sc 
        INNER JOIN categories c ON ( c.id = sc.category_id) 
        SET sc.isAdminApproveCategory=?, c.is_live=?,c.is_deleted=?
        WHERE sc.isAdminApproveCategory is NULL AND sc.supplier_id=? AND sc.id=?;`;
            params1 = [approvalType, 1, 0, supplierId, supplierCategoryId];
        } else { // 0: disapproval
            sql1 = `
        UPDATE supplier_category sc 
        INNER JOIN categories c ON ( c.id = sc.category_id) 
        SET sc.isAdminApproveCategory=?, c.is_live=?,c.is_deleted=?
        WHERE sc.isAdminApproveCategory is NULL AND sc.supplier_id=? AND sc.id=?;`;
            params1 = [approvalType, 0, 1, supplierId, supplierCategoryId];
        }

        const result = await ExecuteQ.Query(req.dbName, sql1, params1);
        sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
    } else {
        sendResponse.sendSuccessData({}, "Not active from settings", res, constant.responseStatus.SUCCESS);
    }

}


exports.addCategoryBySupplier = function (req, res) {

    logger.debug("====ENTEING===ADD=CATEGZORY==1", req.body);
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var category_name = req.body.name;
    let terminology = req.body.terminology;
    let type = req.body.type != undefined ? req.body.type : 0;
    var languageId = req.body.languageId;
    var description = req.body.description1;
    console.log("===========desc============", description)
    var image = req.files != undefined ? req.files.image : undefined;
    var icon = req.files != undefined ? req.files.icon1 : undefined;
    var category_flow = req.body.category_flow != undefined && req.body.category_flow != "" && req.body.category_flow != null ? req.body.category_flow : ""
    var agent_list = req.body.agent_list != undefined ? req.body.agent_list : 0;
    let order_instructions = req.body.order_instructions != undefined ? req.body.order_instructions : 0;
    let cart_image_upload = req.body.cart_image_upload != undefined ? req.body.cart_image_upload : 0;
    let payment_after_confirmation = req.body.payment_after_confirmation != undefined ? req.body.payment_after_confirmation : 0;
    var supplier_id;
    let is_agent = 0
    if (parseInt(agent_list) > 0) {
        is_agent = 1
    }

    var is_variant = req.body.is_variant != undefined && req.body.is_variant != "" && req.body.is_variant != null ? req.body.is_variant : 0;
    var is_liquor = req.body.is_liquor != undefined && req.body.is_liquor != "" && req.body.is_liquor != null ? req.body.is_liquor : 0;
    var variant_name = req.body.variant_name;
    var variant_values = req.body.variant_values != undefined && req.body.variant_values != "" ? JSON.parse(req.body.variant_values) : [];
    var supplierPlaceMentLevel = req.body.level != undefined ? req.body.level : 3;
    var start_time = req.body.start_time != undefined && req.body.start_time != "" && req.body.start_time != null ? req.body.start_time : "00:00:00";
    var end_time = req.body.end_time != undefined && req.body.end_time != "" && req.body.end_time != null ? req.body.end_time : "00:00:00";

    var adminId = req.supplier.supplier_id;
    var folder = "abc";
    var imageName;
    var iconName;
    var illustrationName;
    var languageIds;
    var names, insertedId;
    var descriptions;
    names = category_name.split("#");
    let tax = req.body.tax == undefined ? 0 : req.body.tax;
    var manValue = [accessToken, authSectionId, category_name, languageId];
    console.log("======manValue===========", manValue)
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        async function (cb) {
            try {
                let sql = "select id from categories where name like '" + names[0] + "' and is_deleted=0";

                const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['isCategoryNeedAdminApproval']);
                settingDataKeys.keyAndValue.isCategoryNeedAdminApproval = !!settingDataKeys.keyAndValue.isCategoryNeedAdminApproval;
                if (settingDataKeys.keyAndValue.isCategoryNeedAdminApproval === true) {
                    sql = "select c.id from categories c INNER JOIN supplier_category sc ON (sc.category_id = c.id) where c.is_deleted=0 AND c.name like '" + names[0] + "';";
                }
                let reply = await ExecuteQ.Query(req.dbName, sql, [0])
                // let stmt = multiConnection[req.dbName].query(sql,[0],function(err,reply){
                //     console.log("===slql ======query=======",stmt.sql)
                //     if(err){
                //         console.log(err);
                //         sendResponse.somethingWentWrongError(res);
                //     }else{
                if (reply && reply.length) {
                    sendResponse.sendErrorMessage(constant.responseMessage.DUPLICATE_ENTRY_FOR_CATEGORY, res, constant.responseStatus.SOME_ERROR);
                } else {
                    cb(null)
                }
                //     }
                // })
            }
            catch (Err) {
                logger.debug("===Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        },
        function (cb) {

            async.parallel([
                async function (cbin) {
                    if (image) {
                        let result = await uploadMgr.uploadImageFileToS3BucketNew(image)
                        // func.uploadImageFileToS3Bucket(res, image, folder, cbin);
                        cbin(null, result)
                    }
                    else {
                        cbin(null)
                    }
                },
                async function (cbin) {
                    //onsole.log("=====imagename===="+name);
                    if (icon) {
                        let result = await uploadMgr.uploadImageFileToS3BucketNew(icon);
                        //    func.uploadImageFileToS3Bucket(res, icon, folder, cbin);
                        cbin(null, result);
                    }
                    else {
                        cbin(null)
                    }

                }
            ], function (err2, response2) {
                if (err2) {
                } else {
                    cb(null, response2)
                }
            })
        },
        function (name, cb) {
            console.log("===========name==========name====", name)
            imageName = name[0];
            iconName = name[1];
            languageIds = languageId.split("#");
            descriptions = description != undefined && description != "" ? description.split("#") : "";
            console.log("======adminID===============", adminId)
            savecategory(req.dbName, order_instructions, cart_image_upload, res, cb, names[0], imageName, iconName, adminId, supplierPlaceMentLevel, is_variant, category_flow, agent_list, start_time, end_time, tax, is_agent, type, terminology, payment_after_confirmation, is_liquor)

        },
        function (categoryId, cb) {
            insertedId = categoryId
            createQueryString(req.dbName, res, cb, languageIds, names, descriptions, categoryId);
        },
        function (values, queryString, cb) {
            insertCategoryInMutipleLangauge(req.dbName, res, cb, values, queryString);
        },
        function (cb) {

            var params = [req.supplier.supplier_id, insertedId, 0, 0]
            insertCategoryInSupplier(req.dbName, res, cb, params);
        },
        async function (cb) {

            const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['isCategoryNeedAdminApproval']);
            settingDataKeys.keyAndValue.isCategoryNeedAdminApproval = !!settingDataKeys.keyAndValue.isCategoryNeedAdminApproval;
            if (settingDataKeys.keyAndValue.isCategoryNeedAdminApproval === true) {
                let sql1 = "UPDATE categories SET is_live =?,is_deleted=? WHERE id = ?;";
                let params1 = [1, 1, insertedId];
                await ExecuteQ.Query(req.dbName, sql1, params1);

                // let sql2 = "UPDATE supplier_category SET isAdminApproveCategory =? WHERE supplier_id = ? AND category_id = ?;";
                // let params2 = [null,req.supplier.supplier_id,insertedId];
                // await ExecuteQ.Query(req.dbName,sql2,params2); 

            }

            cb(null, {});
        }


    ], function (error, response) {

        console.log("===ERROR!==", error);

        if (error) {
            console.log("--------------", err)
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = { category_id: insertedId };
            sendResponse.sendSuccessData(data, constant.responseMessage.CATEGORY_ADDED, res, constant.responseStatus.SUCCESS);
        }
    })
}


exports.deleteCategoryBySupplier = function (req, res) {
    logger.debug("request parameters==>", req.body);
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = (req.body.id).toString();
    var manValues = [accessToken, sectionId, categoryId];

    var category = categoryId.split("#").toString();

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessTokenSupplier(req.dbName, accessToken, res, cb);
        }
    ], function (error, callback) {
        logger.debug("====RRR", error)
        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            async.parallel([
                function (cb) {
                    deleteFromCategoryTable(req.dbName, res, category, cb);
                },
                function (cb) {
                    deleteFromProductTable(req.dbName, res, category, cb);
                },
                function (cb) {
                    deleteFromSupplierProductTable(req.dbName, res, category, cb);
                },
                function (cb) {
                    deleteFromSupplierBranchProductTable(req.dbName, res, category, cb);
                },
                function (cb) {
                    deleteFromPromotions(req.dbName, res, category, cb);
                },
                function (cb) {
                    deleteFromPackage(req.dbName, res, category, cb);
                }
            ], function (err, response) {
                logger.debug("==ERR!==", err)
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    var data = {};
                    sendResponse.sendSuccessData(data, constant.responseMessage.DELETE_CATEGORY, res, constant.responseStatus.SUCCESS);
                }

            })

        }


    }
    );
}

function deleteFromCategoryTable(dbName, res, category, callback) {
    var sql = " update categories set is_deleted=? where id IN (" + category + ")";
    multiConnection[dbName].query(sql, [1], function (err, deleteCategory) {
        if (err) {
            console.log("1", err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}


function deleteFromProductTable(dbName, res, category, callback) {
    var sql = "update product set is_deleted = ? where  category_id  IN (" + category + ") or sub_category_id IN (" + category + ") or detailed_sub_category_id  IN (" + category + ")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log("2", err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}

function deleteFromSupplierProductTable(dbName, res, category, callback) {
    var sql = "update supplier_product set is_deleted = ? where  category_id  IN (" + category + ") or sub_category_id  IN (" + category + ") or detailed_sub_category_id  IN (" + category + ")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log("3", err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}



function deleteFromSupplierBranchProductTable(dbName, res, category, callback) {
    var sql = "update supplier_branch_product set is_deleted = ? where  category_id  IN (" + category + ") or sub_category_id IN (" + category + ") or detailed_sub_category_id  IN (" + category + ")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log("4", err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })
}


function deleteFromPromotions(dbName, res, category, callback) {
    var sql = "update supplier_branch_promotions set is_deleted = ? where category_id  IN (" + category + ") or sub_category_id  IN (" + category + ") or detailed_sub_category_id  IN (" + category + ")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log("5", err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}


function deleteFromPackage(dbName, res, category, callback) {
    var sql = "update supplier_package set is_deleted = ? where category_id  IN (" + category + ") or sub_category_id  IN (" + category + ") or detailed_sub_category_id  IN (" + category + ")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log("6", err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}

/*
 * This function is used to insert category
 *  into category table.
 */
async function savecategory(dbName, order_instructions, cart_image_upload, res, callback, name, imageName, iconName, adminId, supplierPlaceMentLevel, is_variant, category_flow, agent_list, start_time, end_time, tax, is_agent, type, terminology, payment_after_confirmation, is_liquor) {
    try {
        var sql = "insert into categories(`order_instructions`,`cart_image_upload`,`name`, `supplier_placement_level`,  `image`, `icon`,`created_by`,`is_variant`,`category_flow`,`agent_list`,`start_time`,`end_time`,`tax`,`is_agent`,`type`,`terminology`,`payment_after_confirmation`,`is_liquor`) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        let reply1 = await ExecuteQ.Query(dbName, sql, [order_instructions, cart_image_upload, name, supplierPlaceMentLevel, imageName, iconName, adminId, is_variant, category_flow, agent_list, start_time, end_time, tax, is_agent, type, terminology, payment_after_confirmation, is_liquor])
        // multiConnection[dbName].query(sql, [order_instructions,cart_image_upload,name, supplierPlaceMentLevel, imageName, iconName, adminId,is_variant,category_flow,agent_list,start_time,end_time,tax,is_agent,type,terminology,payment_after_confirmation],async function (err1, reply1) {
        //     if (err1) {
        //         console.log(err1);
        //         sendResponse.somethingWentWrongError(res);
        //     } else {
        // try{
        //     await updateTaxForCategory(dbName,reply1.insertId,tax)
        // }catch(err){
        //     logger.debug("==========err1234========",err)
        //     sendResponse.somethingWentWrongError(res);
        // }
        //  console.log("============category id==============" + reply1.insertId);
        callback(null, reply1.insertId);
        //     }
        // })
    }
    catch (Err) {
        sendResponse.somethingWentWrongError(res);
    }
}

function updateTaxForCategory(dbName, categoryId, tax) {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = "update product_pricing pp join product p on p.id = pp.product_id " +
                "set handling=? where category_id = ?"
            await ExecuteQ.Query(dbName, sql, [tax, categoryId]);
            resolve()
        } catch (Err) {
            reject(Err)
        }
        // let sql = "update product_pricing pp join product p on p.id = pp.product_id "+
        // "set handling=? where category_id = ?"
        // multiConnection[dbName].query(sql,[tax,categoryId],function(err,data){
        //     if(err){
        //         reject()
        //     }else{
        //         resolve()
        //     }
        // })

    })
}


/*
 * This function is used to create
 *  query string.
 */
function createQueryString(dbName, res, callback, languageIds, names, descriptions, categoryId) {
    var values = new Array();
    var insertLength = "(?,?,?,?),";
    var querystring = '';
    var langLength = languageIds.length;
    var nameLength = names.length;
    for (var i = 0; i < nameLength; i++) {
        (function (i) {

            values.push(languageIds[i], names[i], descriptions[i], categoryId);
            // values.push(newValues);
            querystring = querystring + insertLength;

            if (i == nameLength - 1) {
                querystring = querystring.substring(0, querystring.length - 1);
                callback(null, values, querystring);

            }
        }(i))
    }
}


/*
 * This function is used to insert category
 *  into in multiple languages.
 */
async function insertCategoryInMutipleLangauge(dbName, res, callback, values, queryString) {
    try {
        var sql = "insert into categories_ml(language_id,name,description,category_id) values " + queryString;
        await ExecuteQ.Query(dbName, sql, values);
        callback(null);
    }
    catch (Err) {
        logger.debug("====Err!==", Err);
        sendResponse.somethingWentWrongError(res);
    }
    // let stmt = multiConnection[dbName].query(sql, values, function (err1, reply1) {
    //     logger.debug("========smt.sql===in insrer=====",stmt.sql,err1,reply1);
    //     if (err1) {
    //         console.log(err1);
    //         sendResponse.somethingWentWrongError(res);
    //     } else {
    // callback(null);
    //     }
    // })
}


/*
 * This function is used to insert category
 *  into in multiple languages.
 */
async function insertCategoryInSupplier(dbName, res, callback, values) {
    try {
        var sql2 = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id) values(?,?,?,?)"
        await ExecuteQ.Query(dbName, sql2, values);
        callback(null)
    }
    catch (Err) {
        logger.debug("===Err!=", Err)
        callback(null)
    }
    // multiConnection[dbName].query(sql2,values,function(err,result2)
    // {
    //     logger.debug("==SUPLIER=CATE=ERR!==",err)
    //     callback(null)

    // })
}



function authenticateAccessTokenOfSupplier(db_name, accesstoken, res, callback) {

    var sql = "select id from supplier";
    sql += " where access_token =? limit 1";
    var values = [accesstoken];
    //console.log("bksaddsa",values)
    console.log("================dbName============", db_name)
    var statement = multiConnection[db_name].query(sql, values, function (err, result) {
        console.log("kbfudfjsfd", result, err, statement.sql);
        if (result.length > 0) {
            return callback(null, result[0].id);
        } else {
            console.log("access token invalid in common function");
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }
    });

}


exports.addSubCategoryBySupplier = function (req, res) {

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var name = req.body.name;
    var sub_cat_name = name.split('#');
    var languageId = req.body.languageId;

    if (languageId == undefined) {
        languageId = '14#15'
    }
    var description = req.body.description1;
    var image = req.files.image;
    var icon = null;


    if (req.files.icon1) {
        icon = req.files.icon1
    }
    var categoryId = req.body.categoryId;
    var subCategory;
    var count = req.body.count;
    var supplier_id = req.supplier.supplier_id
    var adminId = req.supplier.supplier_id;
    var folder = "abc";
    var imageName = [];
    var iconName = [];
    var manValue = [accessToken, authSectionId, name, description, languageId, categoryId, count]
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        async function (cb) {
            try {
                let sql = "select id from categories where name like '" + sub_cat_name[0] + "'"
                let reply = await ExecuteQ.Query(req.dbName, sql, [0])
                // let stmt = multiConnection[req.dbName].query(sql,[0],function(err,reply){
                //     console.log("===slql ======query=======",stmt.sql)
                //     if(err){
                //         console.log(err);
                //         sendResponse.somethingWentWrongError(res);
                //     }else{
                if (reply && reply.length) {
                    if (req.dbName != 'hungrycanadian_0710') {
                        sendResponse.sendErrorMessage(constant.responseMessage.DUPLICATE_ENTRY_FOR_CATEGORY, res, constant.responseStatus.SOME_ERROR);
                    } else {
                        cb(null)
                    }

                } else {
                    cb(null)
                }
                //     }
                // })
            }
            catch (Err) {
                logger.debug("===Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        },
        async function (cb) {
            let result1 = await uploadMgr.uploadImageFileToS3BucketNew(image[0]);
            imageName.push(result1);
            if (icon != null) {
                let result2 = await uploadMgr.uploadImageFileToS3BucketNew(icon[0]);
                iconName.push(result2)
            }
            cb(null);
            // async.waterfall([
            //     function (cbs) {

            //         func.uploadImageFileToS3Bucket(res, image[0], folder,function(err,result){
            //             if(err){
            //                 cbs(err);
            //             }else{
            //                 imageName.push(result);
            //                 cbs(null);
            //             }
            //         });
            //     },
            //     function (cbs) {
            //         if(icon != null)
            //         {

            //             func.uploadImageFileToS3Bucket(res, icon[0], folder,function(err,result){
            //                 if(err){
            //                     cbs(err);
            //                 }else{
            //                     iconName.push(result);
            //                     cbs(null);
            //                 }
            //             });
            //         }
            //         else{

            //             cbs(null);
            //         }
            //     }
            // ], function (err2, response2) {
            //     console.log("=========image upload ==============")
            //  //   console.log("==============response2===============" + response2)
            //  //   console.log("==========imagename===========" + JSON.stringify(imageName));
            //  //   console.log("==========iconName===========" + JSON.stringify(iconName));
            //     cb(null);

            // })
        },
        function (cb) {
            console.log("=========in createQueryStringForSubCategory===============")
            if (iconName.length) {
                createQueryStringForSubCategory(res, cb, name, imageName, iconName, count, categoryId, adminId);
            }
            else {
                createQueryStringForSubCategory(res, cb, name, imageName, [" "], count, categoryId, adminId);
            }

        },
        function (values, queryString, cb) {
            console.log("======call======saveSubCategory=================")
            saveSubCategory(req.dbName, res, cb, queryString, values);
        },
        function (subCategoryId, cb) {
            subCategory = subCategoryId;
            console.log("======call======createQueryStringForMlSubCat=================")
            createQueryStringForMlSubCat(res, cb, languageId, name, description, count, subCategoryId);
        },
        function (values, queryString, cb) {
            insertCategoryInMutipleLangauge(req.dbName, res, cb, values, queryString);
        },
        async function (cb) {
            try {
                if (supplier_id != 0) {
                    let data = await ExecuteQ.Query(req.dbName, "select c1.id from categories c1,categories c2 where c1.id=c2.parent_id and c2.id=? and c1.is_deleted=?", [parseInt(categoryId), 0])
                    // multiConnection[req.dbName].query("select c1.id from categories c1,categories c2 where c1.id=c2.parent_id and c2.id=? and c1.is_deleted=?",[parseInt(categoryId),0],(err,data)=>{
                    //     logger.debug("==Err!==",err,data)
                    //     if(err){
                    //         sendResponse.somethingWentWrongError(res);
                    //     }
                    //     else{
                    //For detail sub category to supplier 
                    if (data && data.length > 0) {
                        var catId = data[0].id
                        var sql = "insert into supplier_category(`supplier_id`,`category_id`,`sub_category_id`,`detailed_sub_category_id`) values (?,?,?,?)"
                        await ExecuteQ.Query(req.dbName, sql, [parseInt(supplier_id), parseInt(catId), parseInt(categoryId), parseInt(subCategory)])
                        // multiConnection[req.dbName].query(sql,[parseInt(supplier_id),parseInt(catId),parseInt(categoryId),parseInt(subCategory)],(err,data)=>{
                        //     if(err){
                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        //     else{
                        cb(null)
                        //     }
                        // })
                    }
                    //For sub category to supplier
                    else {
                        var sql = "insert into supplier_category(`supplier_id`,`category_id`,`sub_category_id`,`detailed_sub_category_id`) values (?,?,?,?)"
                        await ExecuteQ.Query(req.dbName, sql, [parseInt(supplier_id), parseInt(categoryId), parseInt(subCategory), 0])
                        // multiConnection[req.dbName].query(sql,[parseInt(supplier_id),parseInt(categoryId),parseInt(subCategory),0],(err,data)=>{
                        //     if(err){
                        //         sendResponse.somethingWentWrongError(res);
                        //     }
                        //     else{
                        cb(null)
                        //     }
                        // })
                    }
                    // }
                    // })
                }
                else {
                    cb(null)
                }
            }
            catch (Err) {
                logger.debug("===Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        }
    ], function (err1, reponse1) {
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUB_CATEGORY_ADDED, res, constant.responseStatus.SUCCESS);
        }
    })
}


function createQueryStringForSubCategory(res, callback, name, imageName, iconName, count, categoryId, adminId) {
    var values = new Array();
    var insertLength = "(?,?,?,?,?),";
    var querystring = '';
    var nameString = name.split("*");
    //  console.log("===========log================" + JSON.stringify(iconName));
    for (var i = 0; i < count; i++) {
        (function (i) {
            var names = nameString[i].split("#");
            values.push(names[0], categoryId, imageName[i], iconName[i], adminId);
            // values.push(newValues);
            querystring = querystring + insertLength;

            if (i == count - 1) {
                querystring = querystring.substring(0, querystring.length - 1);
                callback(null, values, querystring);

            }
        }(i))
    }
}


async function saveSubCategory(dbName, res, callback, queryString, values) {
    try {
        var sql = "insert into categories(`name`, `parent_id`,`image`, `icon`,`created_by`) values" + queryString;
        let reply1 = await ExecuteQ.Query(dbName, sql, values);
        // let stmt = multiConnection[dbName].query(sql, values, function (err1, reply1) {
        //     console.log("===========save subCategory=======",stmt.sql)
        //     if (err1) {
        //         console.log("============saveSubCategory============" + err1);
        //         sendResponse.somethingWentWrongError(res);
        //     } else {
        console.log("============category id==============" + reply1.insertId);
        callback(null, reply1.insertId);
        // }
        // })
    }
    catch (Err) {
        logger.debug("===Err!==", Err)
        sendResponse.somethingWentWrongError(res);
    }
}

function createQueryStringForMlSubCat(res, callback, languageIds, names, descriptions, count, categoryId) {
    console.log("====count============" + count);
    var values = new Array();
    var insertLength = "(?,?,?,?),";
    var querystring = '';

    var suCategoryId = categoryId;
    var langId = languageIds.split("*");
    var name = names.split("*");
    var des = descriptions.split("*");
    for (var j = 0; j < count; j++) {
        (function (j) {
            console.log("=================languageid==========" + langId[j]);
            var languageId = langId[j].split("#");
            var name1 = name[j].split("#");
            var des1 = des[j].split("#");
            var langLength = languageId.length;
            for (var i = 0; i < langLength; i++) {
                (function (i) {

                    values.push(languageId[i], name1[i], des1[i], parseInt(suCategoryId) + j);
                    // values.push(newValues);
                    querystring = querystring + insertLength;


                    if (j == count - 1 && i == langLength - 1) {
                        //  console.log("values=========" + values);
                        querystring = querystring.substring(0, querystring.length - 1);
                        callback(null, values, querystring);

                    }
                }(i))
            }
        }(j))
    }
}


/*
 * This function is used to insert category
 *  into in multiple languages.
 */
function insertCategoryInMutipleLangauge(dbName, res, callback, values, queryString) {
    var sql = "insert into categories_ml(language_id,name,description,category_id) values " + queryString;
    multiConnection[dbName].query(sql, values, function (err1, reply1) {
        if (err1) {
            console.log(err1);
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })
}


/*
 * This function is used to edit main category:
 *
 * Parameters : accessToken,authSectionId,name,
 *               languageId,description1,image,
 *               icon1,illustration,level
 */
exports.editCategoryBySupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    let terminology = req.body.terminology;
    let type = req.body.type != undefined ? req.body.type : 0;
    let is_liquor = req.body.is_liquor != undefined ? req.body.is_liquor : 0;
    let payment_after_confirmation = req.body.payment_after_confirmation != undefined ? req.body.payment_after_confirmation : 0;
    var categoryId = req.body.categoryId;
    var imageUrl = req.body.imageUrl;
    var iconUrl = req.body.iconUrl;
    var name = req.body.name;
    var description = req.body.description1;
    var languageId = req.body.languageId;
    var image = req.files.image;
    var icon = req.files.icon1;
    var adminId;
    var folder = "abc";
    var imageName;
    var iconName;
    var languageIds;
    var names;
    var agent_list = req.body.agent_list
    var descriptions;
    let tax = req.body.tax
    var manValue = [accessToken, authSectionId, categoryId, name, description, languageId, tax];
    var start_time = req.body.start_time != undefined && req.body.start_time != "" && req.body.start_time != null ? req.body.start_time : "00:00:00";
    var end_time = req.body.end_time != undefined && req.body.end_time != "" && req.body.end_time != null ? req.body.end_time : "00:00:00";
    let order_instructions = req.body.order_instructions != undefined ? req.body.order_instructions : 0;
    let cart_image_upload = req.body.cart_image_upload != undefined ? req.body.cart_image_upload : 0;

    console.log("body", req.body);
    console.log("files", req.files.image, req.files.icon1);
    names = name.split("#");
    // console.log("==================image===========" + JSON.stringify(image));

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        async function (cb) {
            try {
                let sql = "select id from categories where name like '" + names[0].trim() + "' and id!=?"
                let reply = await ExecuteQ.Query(req.dbName, sql, [categoryId]);
                // let stmt = multiConnection[req.dbName].query(sql,[categoryId],function(err,reply){
                //     console.log("===slql ======query=======",stmt.sql,categoryId)
                //     if(err){
                //         console.log(err);
                //         sendResponse.somethingWentWrongError(res);
                //     }else{
                if (reply && reply.length) {
                    sendResponse.sendErrorMessage(constant.responseMessage.DUPLICATE_ENTRY_FOR_CATEGORY, res, constant.responseStatus.SOME_ERROR);
                } else {
                    cb(null)
                }
                //     }
                // })
            }
            catch (Err) {
                logger.debug("====Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        },
        async function (cb) {
            languageIds = languageId.split("#");
            descriptions = description.split("#");
            console.log("jnsa", imageUrl);
            if (imageUrl) {
                console.log("if");
                cb(null, imageUrl);
            } else {
                let result = await uploadMgr.uploadImageFileToS3BucketNew(image);
                cb(null, result);
                // func.uploadImageFileToS3Bucket(res, image, folder, cb);
            }
        },
        async function (name, cb) {
            console.log("=====imagename====" + name);
            imageName = name;
            if (iconUrl) {
                cb(null, iconUrl);
            } else {
                let result = await uploadMgr.uploadImageFileToS3BucketNew(icon);
                cb(null, result);
                // func.uploadImageFileToS3Bucket(res, icon, folder, cb);
            }
        },
        function (name1, cb) {
            // console.log("=====iconname====" + name1);
            iconName = name1;
            updateCategory(req.dbName, order_instructions, cart_image_upload, res, cb, categoryId, names[0], imageName, iconName, agent_list, start_time, end_time, tax, type, terminology, payment_after_confirmation, is_liquor);
        },
        function (cb) {
            updateCategoryInMultiple(req.dbName, res, cb, categoryId, names, languageIds, descriptions);
        }

    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.CATEGORY_UPDATED, res, constant.responseStatus.SUCCESS);
        }
    })
}

async function updateCategory(dbName, order_instructions, cart_image_upload, res, callback, categoryId, name, imageName, iconName, agent_list, start_time, end_time, tax, type, terminology, payment_after_confirmation, is_liquor) {
    try {
        var sql = "update categories set order_instructions=?,cart_image_upload=?,name = ?,image = ?,icon = ?,agent_list=?,start_time=?,end_time=?,tax=?,type=?,terminology=?,payment_after_confirmation=?,is_liquor=? where id = ? ";
        await ExecuteQ.Query(dbName, sql, [order_instructions, cart_image_upload, name, imageName, iconName, agent_list, start_time, end_time, tax, type, terminology, payment_after_confirmation, is_liquor, categoryId])
        // let stmt = multiConnection[dbName].query(sql, [order_instructions,cart_image_upload,name, imageName, iconName, agent_list, start_time, end_time, tax,type,terminology,payment_after_confirmation,categoryId],async function (error, response) {
        //     logger.debug("=====update category========",stmt.sql)
        //     if (error) {
        //         console.log("-----------ererr in update category=======",error)
        //         sendResponse.somethingWentWrongError(res);
        //     } else {

        await updateTaxForCategory(dbName, categoryId, tax)

        callback(null);
        //     }
        // })
    } catch (err) {
        logger.debug("==========err1234========", err)
        sendResponse.somethingWentWrongError(res);
    }
}

async function updateSubCategory(dbName, res, callback, categoryId, name, imageName, iconName, agent_list, start_time, end_time) {
    try {
        var sql = "update categories set name = ?,image = ?,icon = ?,agent_list=?,start_time=?,end_time=? where id = ? ";
        await ExecuteQ.Query(dbName, sql, [name, imageName, iconName, agent_list, start_time, end_time, categoryId]);
        callback(null);
    }
    catch (Err) {
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "update categories set name = ?,image = ?,icon = ?,agent_list=?,start_time=?,end_time=? where id = ? ";
    // let stmt = multiConnection[dbName].query(sql, [ name, imageName, iconName, agent_list, start_time, end_time, categoryId],async function (error, response) {
    //     logger.debug("=====update category========",stmt.sql)
    //     if (error) {
    //         console.log("-----------ererr in update category=======",error)
    //         sendResponse.somethingWentWrongError(res);
    //     } else {
    //         callback(null);
    //     }
    // })
}

function updateTaxForCategory(dbName, categoryId, tax) {
    return new Promise((resolve, reject) => {
        let sql = "update product_pricing pp join product p on p.id = pp.product_id " +
            "set handling=? where category_id = ?"
        multiConnection[dbName].query(sql, [tax, categoryId], function (err, data) {
            if (err) {
                reject()
            } else {
                resolve()
            }
        })

    })
}


function updateCategoryInMultiple(dbName, res, callback, categoryId, names, languageIds, descriptions) {
    var langLength = languageIds.length;
    var sql = "update categories_ml set name = ?, description = ?  where language_id = ? and category_id = ? ";

    for (var i = 0; i < langLength; i++) {
        (async function (i) {
            try {
                await ExecuteQ.Query(dbName, sql, [names[i], descriptions[i], languageIds[i], categoryId]);
                // multiConnection[dbName].query(sql, [names[i], descriptions[i], languageIds[i], categoryId], function (err1, reply1) {
                //     if (err1) {
                //         console.log("error" + err1);
                //         sendResponse.somethingWentWrongError(res);
                //     } else {
                if (i == langLength - 1) {
                    callback(null);
                }
                // }
                // })
            }
            catch (Err) {
                logger.debug("=====Err!==>>", Err);
                sendResponse.somethingWentWrongError(res);
            }
        }(i))
    }
}

/*
 * ------------------------------------------------------
 * List all the added sub categories under the main categories
 * Input:access token,section id, category_id
 * Output: List of sub categories added  under the given category id
 * ------------------------------------------------------
 */
exports.listSubCategoriesBySupplier = function (req, res) {
    // var accessToken = req.body.accessToken;
    // var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var manValues = [categoryId];
    //  console.log(manValues + "request parameters")

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            getSubCategories(req.dbName, categoryId, req.supplier.supplier_id, res, cb);
        }
    ], function (error, response) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(response, constant.responseMessage.LIST_SUB_CATEGORIES, res, constant.responseStatus.SUCCESS);
        }

    }
    );

}
/*
 * ------------------------------------------------------
 * Function which returns all the sub categories
 * This function is used in login api and list sub categories api
 * Input : main category id under which sub categories are required
 * Output: List of sub categories along with main category list
 * ------------------------------------------------------
 */
function getSubCategories(db_name, categoryId, supplier_id, res, callback) {

    var categories;
    var subCategories;
    var category;

    async.waterfall([
        function (cb) {

            getAllCategories(db_name, supplier_id, res, cb);
        },
        function (categories1, cb) {
            console.log(categories1)
            if (!categories1.length) {
                categories = [];
                callback(null, []);
            }
            else {
                categories = categories1;
                if (categoryId == "") {
                    category = categories[0].id;
                    getAllSubcategories(db_name, categories[0].id, res, cb);
                }
                else {
                    category = categoryId;
                    getAllSubcategories(db_name, categoryId, res, cb);
                }
            }

        },
        function (subCategories1, cb) {
            subCategories = subCategories1;
            clubSubCategoryData(db_name, subCategories, categories, category, res, cb);

        },
    ], function (error, subCategoryData) {

        if (error) {
            console.log(error)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            console.log("++++++++++++++++++subCategoriesData++++++++++++", subCategoryData)
            callback(null, subCategoryData);
        }

    }
    );

}


function getAllCategories(db_name, supplier_id, res, callback) {
    var sql = "select c.id,c.name from categories c join supplier_category sc on sc.category_id = c.id " +
        "where is_deleted=? and parent_id=? and sc.supplier_id=? group by c.name"
    multiConnection[db_name].query(sql, [0, 0, supplier_id], function (err, categories) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, categories);

        }

    })

}

function getAllSubcategories(db_name, categoryId, res, callback) {
    var sql = `select IF((select count(*)  from questions  where questions.category_id=categories.id) > 0, 1, 0) as is_question,
    IF((select count(*)  from product  where product.sub_category_id=categories.id) > 0, 1, 0) as is_product,IF((select COUNT(*) from categories cts where
       cts.parent_id=categories.id )>0,1,0) as is_sub_category,is_variant,id,name,image,icon,parent_id from categories where
     is_deleted=? and parent_id=?`

    multiConnection[db_name].query(sql, [0, categoryId], function (err, subCategories) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            // console.log("subcategories" + subCategories)
            // console.log(JSON.stringify(subCategories));
            return callback(null, subCategories);
        }

    })

}



function clubSubCategoryData(db_name, subCategories, categories, categoryId, res, callback) {
    var subCategoriesLength = subCategories.length;
    //  console.log(subCategoriesLength)
    var categoriesLength = categories.length;

    var category = [];
    if (subCategoriesLength == 0) {
        for (var i = 0; i < categoriesLength; i++) {
            (function (i) {
                category.push({
                    "category_id": categories[i].id,
                    "category_name": categories[i].name,
                    "category_data": []
                });
                if (i == categoriesLength - 1) {
                    callback(null, category);
                }

            }(i))

        }
    }
    else {
        var sql = "select cat.id,cat.image,cat.icon,catm.name,catm.description,catm.language_id,ll.language_name,catm.category_id from categories cat ";
        sql += " join categories_ml catm on cat.id = catm.category_id join language ll on catm.language_id = ll.id where cat.is_deleted=? and cat.parent_id=? ORDER BY cat.id"
        multiConnection[db_name].query(sql, [0, categoryId], function (err, subCategoriesMl) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var subCategoryMlLength = subCategoriesMl.length;
                console.log("subCategoryML" + JSON.stringify(subCategoriesMl));
                for (var i = 0; i < categoriesLength; i++) {
                    (function (i) {
                        var subCategory = [];
                        for (var j = 0; j < subCategoriesLength; j++) {

                            (function (j) {
                                var langName = [];
                                if (categories[i].id == subCategories[j].parent_id) {
                                    // console.log("main category id" + categories[i].id);
                                    //  console.log("sub category parent id" + subCategories[j].parent_id);
                                    // console.log("here");
                                    for (var k = 0; k < subCategoryMlLength; k++) {
                                        (function (k) {
                                            if (subCategoriesMl[k].category_id == subCategories[j].id) {
                                                //  console.log("subCategoriesMl id" + subCategoriesMl[k].category_id);
                                                //  console.log("sub category id" + subCategories[j].id);
                                                langName.push({
                                                    "name": subCategoriesMl[k].name,
                                                    "description": subCategoriesMl[k].description,
                                                    "language_id": subCategoriesMl[k].language_id,
                                                    "language_name": subCategoriesMl[k].language_name
                                                });
                                                if (k == subCategoryMlLength - 1) {
                                                    subCategory.push({
                                                        "is_product": subCategories[j].is_product,
                                                        "is_question": subCategories[j].is_question,
                                                        "is_sub_category": subCategories[j].is_sub_category,
                                                        "subcategory_id": subCategories[j].id,
                                                        "subcategory_image": subCategories[j].image,
                                                        "subcategory_icon": subCategories[j].icon,
                                                        "subcategory_data": langName
                                                    });
                                                    if (j == subCategoriesLength - 1) {
                                                        category.push({
                                                            "category_id": categories[i].id,
                                                            "category_name": categories[i].name,
                                                            "category_data": subCategory
                                                        });
                                                        if (i == categoriesLength - 1) {
                                                            callback(null, category);
                                                        }
                                                    }

                                                }
                                            }
                                            else {
                                                if (k == subCategoryMlLength - 1) {
                                                    subCategory.push({
                                                        "is_product": subCategories[j].is_product,
                                                        "is_question": subCategories[j].is_question,
                                                        "is_sub_category": subCategories[j].is_sub_category,
                                                        "subcategory_id": subCategories[j].id,
                                                        "subcategory_image": subCategories[j].image,
                                                        "subcategory_icon": subCategories[j].icon,
                                                        "subcategory_data": langName
                                                    });
                                                    if (j == subCategoriesLength - 1) {
                                                        category.push({
                                                            "category_id": categories[i].id,
                                                            "category_name": categories[i].name,
                                                            "category_data": subCategory
                                                        });
                                                        if (i == categoriesLength - 1) {
                                                            callback(null, category);
                                                        }
                                                    }
                                                }
                                            }

                                        }(k))
                                    }
                                }
                                else {
                                    if (j == subCategoriesLength - 1) {
                                        category.push({
                                            "category_id": categories[i].id,
                                            "category_name": categories[i].name,
                                            "category_data": subCategory
                                        });
                                        if (i == categoriesLength - 1) {
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


/*
 * ------------------------------------------------------
 * List all the added detailed sub categories
 * Input:access token,section id,seb category id
 * Output: List of detailed sub categories added  under the given sub category id
 * ------------------------------------------------------
 */
exports.listDetailedSubCategoriesBySupplier = function (req, res) {
    // var accessToken = req.body.accessToken;
    // var sectionId = req.body.sectionId;
    var subCategoryId = req.body.subCategoryId;
    var manValues = [subCategoryId];
    // console.log(manValues + "request parameters")

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            getListOfSubCategoriesForDetailed(req.dbName, req.supplier.supplier_id, res, cb, subCategoryId);
        },
    ], function (error, response) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            sendResponse.sendSuccessData(response, constant.responseMessage.LIST_SUB_CATEGORIES, res, constant.responseStatus.SUCCESS);
        }


    }
    );

}
function getListOfSubCategoriesForDetailed(db_name, supplier_id, res, callback, subCategoryId) {

    var subCategories;
    var subCatId;
    async.waterfall([

        function (cb) {
            getAllSubcategoriesForDetailedSubCategory(db_name, res, cb);
        },
        function (subCategories1, cb) {

            if (subCategories1.length) {
                subCategories = subCategories1;
                if (subCategoryId == "") {
                    subCatId = subCategories[0].id;
                    //  console.log(subCategories[0].id);

                    getAllDetailCategory(db_name, res, cb, subCategories[0].id);
                }
                else {
                    subCatId = subCategoryId;
                    getAllDetailCategory(db_name, res, cb, subCategoryId);
                }
            }
            else {
                return callback(null, []);
            }

        },
        function (detailedSubCategories, cb) {

            clubSubCategoryData(db_name, detailedSubCategories, subCategories, subCatId, res, cb);
        }
    ], function (error, detailedsubCategoryData) {

        if (error) {
            console.log(error)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            return callback(null, detailedsubCategoryData);
        }

    }
    );
}


function getAllSubcategoriesForDetailedSubCategory(db_name, res, callback) {
    var sql = "select id,name,is_live,icon,image,illustration,parent_id from categories where is_deleted=?";
    sql += " and parent_id in(select id from categories where parent_id= 0)"
    multiConnection[db_name].query(sql, [0], function (err, subCategories) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            //  console.log(JSON.stringify(subCategories));
            return callback(null, subCategories);
        }

    })

}


function getAllDetailCategory(db_name, res, callback, subCategoryId) {
    var sql = `select IF((select count(*)  from questions  where questions.category_id=categories.id) > 0, 1, 0) as is_question,
    IF((select count(*)  from product  where product.sub_category_id=categories.id) > 0, 1, 0) as is_product,IF((select COUNT(*) from categories cts where
       cts.parent_id=categories.id )>0,1,0) as is_sub_category,id,name,is_live,icon,image,illustration,parent_id from categories where is_deleted=? and parent_id=?`
    multiConnection[db_name].query(sql, [0, subCategoryId], function (err1, reply1) {
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, reply1);
        }
    });


}


exports.editSubCategoryBySupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var description = req.body.description1;
    var subCategoryId = req.body.subCategoryId;
    var adminId;
    var folder = "abc";
    var imageName = req.body.imageName;
    var iconName = req.body.iconName;
    var iconStatus = req.body.iconStatus;
    var languageIds;
    var names;
    names = name.split("#");
    var descriptions;

    var is_variant = req.body.is_variant;
    var variant_name = req.body.variant_name;
    var update_variant = req.body.update_variant
    var new_variant = req.body.new_variant;

    var variant_values = req.body.variant_values != undefined && req.body.variant_values != "" ? JSON.parse(req.body.variant_values) : [];
    var start_time = req.body.start_time != undefined && req.body.start_time != "" && req.body.start_time != null ? req.body.start_time : "00:00:00";
    var end_time = req.body.end_time != undefined && req.body.end_time != "" && req.body.end_time != null ? req.body.end_time : "00:00:00";
    var agent_list = req.body.agent_list != undefined && req.body.agent_list != "" && req.body.agent_list ? req.body.agent_list : 1
    if (parseInt(is_variant) == 1) {
        // console.log("===variant_values==",variant_values,variant_values.length);

        if (new_variant && new_variant.length <= 0) {
            var msg = "please add some variant value"
            return sendResponse.sendErrorMessage(msg, res, 400);
        }
    }
    var manValue = [accessToken, authSectionId, name, description, languageId, subCategoryId, iconStatus];

    async.waterfall([
        function (cb) {

            func.checkBlank(res, manValue, cb);

        },
        async function (cb) {
            try {
                let sql = "select id from categories where name like '" + names[0].trim() + "' and id!=?"
                let reply = await ExecuteQ.Query(req.dbName, sql, [subCategoryId]);
                // let stmt = multiConnection[req.dbName].query(sql,[subCategoryId],function(err,reply){
                //     console.log("===slql ======query=======",stmt.sql)
                //     if(err){
                //         console.log(err);
                //         sendResponse.somethingWentWrongError(res);
                //     }else{
                if (reply && reply.length) {
                    sendResponse.sendErrorMessage(constant.responseMessage.DUPLICATE_ENTRY_FOR_CATEGORY, res, constant.responseStatus.SOME_ERROR);
                } else {
                    cb(null)
                }
                //     }
                // })
            }
            catch (Err) {
                logger.debug("===Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        },
        async function (cb) {
            logger.debug("=======image======icon====start===", imageName, iconName)
            languageIds = languageId.split("#");
            descriptions = description.split("#");
            if (req.files.image) {
                logger.debug("===uploadImageFileToS3Bucket==")
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.image[0]);
                cb(null, result);
                // func.uploadImageFileToS3Bucket(res,req.files.image[0], folder, cb);
            } else {
                cb(null, imageName);
            }
        },
        async function (name, cb) {
            imageName = name;

            // if(iconStatus == 1)
            // {
            if (req.files.icon1 != undefined) {
                logger.debug("===>>Icon==uploadImageFileToS3Bucket==")
                let result = await uploadMgr.uploadImageFileToS3BucketNew(req.files.icon1[0]);
                logger.debug("======result i=of icon======", result);
                cb(null, result);
                // func.uploadImageFileToS3Bucket(res,req.files.icon1[0], folder, cb);
            } else {
                logger.debug("=========iconName=======+", iconName);
                cb(null, iconName);
            }
            // }
            // else{
            //     cb(null,"");
            // }

        },
        function (name1, cb) {
            iconName = name1;
            logger.debug("===imageName=====iconName===", imageName, iconName);
            updateSubCategory(req.dbName, res, cb, subCategoryId, names[0], imageName, iconName, agent_list, start_time, end_time);
        },
        function (cb) {
            console.log("======call======createQueryStringForMlSubCat=================");
            createQueryStringForMlSubCat(res, cb, languageId, name, description, 1, subCategoryId);
        },
        function (values, queryString, cb) {
            console.log("======call======saveSubCategory=================")
            updateSubCategoryInMultiple(req.dbName, res, cb, subCategoryId, languageIds, values, queryString)
            logger.debug("===========last=========")
        },
        // function(cb){
        //     if(is_variant==1){
        //         saveVariants(res,cb,insertedId,variant_name,new_variant)
        //     }
        //     else{
        //         cb(null)
        //     }
        // },
        // function (cb){
        // }        
    ], function (err1) {
        logger.debug("===========err1,resp===", err1)
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            logger.debug("==================data==========", data)
            sendResponse.sendSuccessData(data, constant.responseMessage.SUB_CATEGORY_UPDATED, res, constant.responseStatus.SUCCESS);
        }
    })
}

async function updateSubCategoryInMultiple(dbName, res, callback, categoryId, languageIds, values, queryString) {
    try {
        // async.waterfall([
        //     function(cb){
        var sql = "delete from categories_ml where language_id in(?) and category_id in (?)";
        let reply = await ExecuteQ.Query(dbName, sql, [languageIds, categoryId]);
        // let stmt = multiConnection[dbName].query(sql,[languageIds,categoryId],function(err,reply){
        //     logger.debug('=======stmt.sql-=======',stmt.sql);
        //     if(err){
        //         logger.debug("-----------errrrrrr--------",err);
        //         sendResponse.somethingWentWrongError(res);
        //     }else{
        logger.debug('======delete success===', reply)
        // cb(null);
        var sql1 = "insert into categories_ml(language_id,name,description,category_id) values " + queryString;
        await ExecuteQ.Query(dbName, sql1, values);
        // let stmt = multiConnection[dbName].query(sql1, values, function (err1, reply1) {
        //     logger.debug("========smt.sql===in insrer=====",stmt.sql,err1,reply1);
        //     if (err1) {
        //         console.log(err1);
        //         sendResponse.somethingWentWrongError(res);
        //     } else {
        // logger.debug("============callback final========")
        callback(null);
        //     }
        // })
    }
    catch (Err) {
        logger.debug("====Err!==", Err)
        sendResponse.somethingWentWrongError(res);
    }
    // }
    // })
    //     },
    //     function(cb){
    //         logger.debug("============cbnew=======")
    //         insertCategoryInMutipleLangauge(dbName,res,callback,values,queryString);

    //     }
    // ],function(err2,response2){

    // })
}



exports.supplierLoginToApp = function (req, res) {
    console.log("..............req.............supplier login ......", req.body);
    var email;
    var password;
    var deviceToken;
    var deviceType;
    var languageId;
    var supplierId;
    var details = {};
    var accessToken;
    async.auto({
        getValues: function (cb) {
            if (!(req.body.email)) {
                var msg = "email not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.password)) {
                var msg = "password not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (req.body.deviceToken) {
                deviceToken = req.body.deviceToken;

            } else {
                deviceToken = "abcd";
            }

            if (!req.body.deviceType) {
                var msg = "device type not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (req.body && req.body.email && req.body.password && req.body.deviceType && req.body.languageId) {
                email = req.body.email;
                password = req.body.password;
                deviceType = req.body.deviceType;
                languageId = req.body.languageId;
                cb(null);
            } else {
                var msg = "something";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        verifyValues: ['getValues', function (cb) {
            console.log(".....", typeof (password))
            var password2 = md5(password);
            console.log("password", password);
            console.log("pass", email, password2);
            var sql = "select id,is_active,is_live from supplier where email = ? and password = ? ";
            multiConnection[req.dbName].query(sql, [email, password2], function (err, result) {
                console.log("err1..", err, result);
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    console.log("res...", result);
                    if (result.length) {
                        if (result[0].is_active == 0) {
                            if (req.body.languageId == 14) {
                                var msg = "This supplier is not active";
                            } else {
                                var msg = "هذا المورد غير نشط";
                            }
                            sendResponse.sendErrorMessage(msg, res, 400);
                        }
                        else {
                            supplierId = result[0].id;
                            cb(null, result[0].id);
                        }

                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "email id and password not correct";
                        } else {
                            var msg = " المرور غير صحيحة الإلكتروني وكلمة معرف البريد";
                        }
                        sendResponse.sendErrorMessage(msg, res, 400);
                    }
                }
            })
        }],
        updateAccessToken: ['verifyValues', function (cb) {
            accessToken = func.encrypt(req.body.email + new Date());
            var sql = "update supplier s join supplier_admin sa on s.id = sa.supplier_id set s.access_token = ?,sa.access_token = ?,s.device_token = ?,s.device_type = ? where s.id = ?";
            multiConnection[req.dbName].query(sql, [accessToken, accessToken, deviceToken, deviceType, supplierId], function (err, result) {
                console.log("err2..", err, result);
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else {
                    cb(null);
                }
            })

        }],
        getSupplierData: ['updateAccessToken', function (cb) {
            getSupplierDashboardData(req.dbName, res, supplierId, accessToken, languageId, function (err, result) {
                console.log("err3..", err, result);
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else {
                    details = result;
                    console.log("deya...", details)
                    cb(null);
                }

            });
        }],
    }, function (err, response) {
        console.log("err4..", err);
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })
}


exports.accessTokenLogin = function (req, res) {
    var deviceToken;
    var deviceType;
    var languageId;
    var supplierId;
    var details = {};
    var accessToken;
    var email;
    async.auto({
        getValues: function (cb) {
            if (!(req.body.accessToken)) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (req.body.deviceToken) {
                deviceToken = req.body.deviceToken;
            } else {
                deviceToken = "abcd";
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (req.body && req.body.accessToken && req.body.deviceType && req.body.languageId) {

                accessToken = req.body.accessToken;
                deviceToken = req.body.deviceToken;
                deviceType = req.body.deviceType;
                languageId = req.body.languageId;
                cb(null);

            } else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        verifyValues: ['getValues', function (cb) {
            var sql = " select id,is_active,is_live,email from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        if (result[0].is_active == 0) {
                            if (req.body.languageId == 14) {
                                var msg = "This supplier is not active";
                            } else {
                                var msg = "هذا المورد غير نشط";
                            }
                            sendResponse.sendErrorMessage(msg, res, 400);
                        }
                        else {
                            email = result[0].email;
                            supplierId = result[0].id;
                            cb(null, result[0].id);
                        }

                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })
        }],
        updateAccessToken: ['verifyValues', function (cb) {
            //accessToken = func.encrypt(email + new Date());
            var sql = "update supplier set device_token = ?,device_type = ? where id = ? limit 1";
            multiConnection[req.dbName].query(sql, [deviceToken, deviceType, supplierId], function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    cb(null);
                }
            })

        }],
        getSupplierData: ['updateAccessToken', function (cb) {
            getSupplierDashboardData(req.dbName, res, supplierId, accessToken, languageId, function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = result;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })

}


exports.orderManagementPage = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getOrderData: ['validateAccessToken', function (cb) {
            supplierExtranet.getOrderManagerPageData(req.dbName, res, supplierId, accessToken, cb);
        }]
    }, function (err, response) {


        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(response.getOrderData, constant.responseMessage.SUCCESS, res, 200);
        }

    })
}


exports.listPendingOrders = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    var isUrgent;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.isUrgent) {
                var msg = "urgent field not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId && req.body.isUrgent) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                isUrgent = req.body.isUrgent;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getPendingOrderDetails: ['validateAccessToken', function (cb) {
            supplierExtranet.getPendingOrdersPageData(res, supplierId, accessToken, languageId, isUrgent, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })

}


exports.listPendingTrackingAlerts = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getPendingTackingDetails: ['validateAccessToken', function (cb) {
            supplierExtranet.getPendingTackingDetailsPage(req.dbName, res, supplierId, accessToken, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })
}




exports.listScheduledOrderForTomorrow = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getScheduledOrders: ['validateAccessToken', function (cb) {
            supplierExtranet.getScheduledOrdersPage(dbName, res, supplierId, accessToken, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })
}


exports.supplierProfile = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getProfileData: ['validateAccessToken', function (cb) {
            getSupplierProfileData(req.dbName, res, supplierId, accessToken, languageId, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(response.getProfileData, constant.responseMessage.SUCCESS, res, 200);
        }

    })
}


exports.supplierRevenue = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    var filter; // 0 : weekly,1: monthly ,2 : yearly
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.filter) {
                var msg = "filter not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId && req.body.filter) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                filter = req.body.filter;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getRevenues: ['validateAccessToken', function (cb) {
            getSupplierOrderRevenues(res, supplierId, accessToken, languageId, filter, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(response.getProfileData, constant.responseMessage.SUCCESS, res, 200);
        }

    })

}


exports.advertisementPage = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getAds: ['validateAccessToken', function (cb) {
            getAdvertisements(req.dbName, res, supplierId, accessToken, languageId, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(response.getAds, constant.responseMessage.SUCCESS, res, 200);
        }

    })
}


exports.noOfOrdersDelivered = function (req, res) {
    var accessToken;
    var supplierId;
    var filter; // 0 for today,1 for weekly,2 for monthly
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.filter) {
                var msg = "filter not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.filter) {
                accessToken = req.body.accessToken;
                filter = req.body.filter;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "Invalid access token";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getNoOfOrdersDelivered: ['validateAccessToken', function (cb) {
            noOfOrderDelivered(req.dbName, res, supplierId, filter, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.total_orders_delivered = response.getNoOfOrdersDelivered;
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
        }

    })

}


exports.acceptPendingOrder = function (req, res) {

    var accessToken;
    var orderId;
    var supplierNameEnglish, supplierNameArabic, supplierId;
    var languageId;
    var userEmail;
    var deviceToken;
    var deviceType;
    var supplierName;
    var userId;
    var notificationStatus;
    let self_pickup = 0
    var notificationLanguage;
    var message, userName, amount, placeDate, deliveryDate, paymentMethod;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.orderId) {
                var msg = "order id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.orderId && req.body.languageId) {
                accessToken = req.body.accessToken;
                orderId = req.body.orderId;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = "select s.id,sml.name,sml.language_id from supplier s join supplier_ml sml on s.id = sml.supplier_id " +
                " where access_token =  ? order by language_id ASC";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    console.log(":.......", err, result);
                    if (result.length) {
                        supplierId = result[0].id;
                        supplierNameEnglish = result[0].name;
                        supplierNameArabic = result[1].name;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        acceptOrder: ['validateAccessToken', function (cb) {
            acceptOrder(res, orderId, cb);
        }],
        getUserEmail: ['acceptOrder', function (cb) {
            getUserEmail(res, orderId, function (err, result) {
                console.log("........", result)
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    userName = result.User_Name
                    self_pickup = result.self_pickup;
                    userId = result.user_id;
                    userEmail = result.email;
                    deviceToken = result.device_token;
                    deviceType = result.device_type;
                    notificationStatus = result.notification_status;
                    notificationLanguage = result.notification_language;
                    amount = result.net_amount;
                    placeDate = moment(result.created_on).format('YYYY-MM-DD HH:mm');
                    deliveryDate = moment(result.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (result.payment_type == 0) {
                        paymentMethod = "CASH";
                    }
                    else {
                        paymentMethod = "Card";
                    }
                    cb(null);
                }

            });
        }],
        sendUserEmail: ['getUserEmail', function (cb) {
            emailTemp.acceptOrder(self_pickup, req, req.dbName, AdminMail, userName, amount, placeDate, deliveryDate, orderId, supplierNameEnglish, supplierNameArabic, paymentMethod, userEmail, notificationLanguage, function (err, result) {
                if (err) {
                    console.log("..****fb register email*****....", err);
                }
            })
            cb(null)
        }],
        /*  sendUserEmail: ['getUserEmail', function (cb) {
              var subject = "Order Confirmation";
              var content = "Your Order has been accepted \n\n";
              content += " Regards \n";
              content += " Team royo";
              func.sendMailthroughSMTP(res, subject, userEmail, content, 1, function (err, result) {
                  if (err) {
                      var msg = "something went wrong";
                      return sendResponse.sendErrorMessage(msg, res, 500);
                  }
                  else {
                      //console.log("heredsfd");
                      cb(null);
                  }
  
              });
  
          }],*/
        sendPushNotification: ['sendUserEmail', function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                if (deviceType == 0) {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": 0,
                            "message": "Your Order Has been Confirmed",
                            "orderId": orderId

                        }
                    }
                    else {
                        var data = {
                            "status": 0,
                            "message": "تم تاكيد طلبك ",
                            "orderId": orderId

                        }
                    }
                    message = data.message;
                    pushNotifications.sendAndroidPushNotification(deviceToken, data, function (err, result) {
                        if (err) {
                            var msg = "something went wrong";
                            return sendResponse.sendErrorMessage(msg, res, 500);
                        }
                        else {
                            cb(null);
                        }

                    });
                }
                else {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": 0,
                            "message": "Your Order Has been Confirmed",
                            "orderId": orderId

                        }
                    }
                    else {
                        var data = {
                            "status": 0,
                            "message": "تم تاكيد طلبك ",
                            "orderId": orderId

                        }
                    }
                    var path = "user";
                    var sound = "ping.aiff";


                    pushNotifications.sendIosPushNotification(deviceToken, data, path, sound, function (err, result) {
                        if (err) {
                            var msg = "something went wrong";
                            return sendResponse.sendErrorMessage(msg, res, 500);
                        }
                        else {
                            cb(null);
                        }
                    });
                }
            }
        }],
        savePushNotification: ['sendPushNotification', function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                if (notificationLanguage == 14) {
                    saveNoticationData(res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, constant.pushNotificationMessage.ORDER_ACCEPTED_ENGLISH, cb)
                }
                else {
                    saveNoticationData(res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, constant.pushNotificationMessage.ORDER_ACCEPTED_ARABIC, cb)
                }

                //console.log(message);

            }
        }],
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);

        }

    })
}


exports.rejectPendingOrder = function (req, res) {
    var accessToken;
    var orderId;
    var rejectionReason;
    var supplierNameEnglish, supplierNameArabic, supplierId;
    var languageId;
    var userEmail;
    var deviceToken;
    var deviceType;
    var supplierName;
    var userId;
    var notificationStatus;
    let self_pickup;
    var notificationLanguage;
    var message, userName, amount, placeDate, deliveryDate, paymentMethod;;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!req.body.orderId) {
                var msg = "order id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.rejectionReason) {
                var msg = "rejection reason not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.orderId && req.body.languageId && req.body.rejectionReason) {
                accessToken = req.body.accessToken;
                orderId = req.body.orderId;
                rejectionReason = req.body.rejectionReason;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = "select s.id,sml.name,sml.language_id from supplier s join supplier_ml sml on s.id = sml.supplier_id " +
                " where access_token =  ? order by language_id ASC";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        supplierNameEnglish = result[0].name;
                        supplierNameArabic = result[1].name;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })
        }],
        rejectOrder: ['validateAccessToken', function (cb) {
            rejectOrder(req.dbName, res, orderId, rejectionReason, cb);
        }],
        getUserEmail: ['rejectOrder', function (cb) {
            getUserEmail(req.dbName, res, orderId, function (err, result) {

                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    userEmail = result.email;
                    userId = result.user_id;
                    deviceToken = result.device_token;
                    self_pickup = result.self_pickup
                    deviceType = result.device_type;
                    notificationStatus = result.notification_status;
                    notificationLanguage = result.notification_language;
                    amount = result.net_amount;
                    placeDate = moment(result.created_on).format('YYYY-MM-DD HH:mm');
                    deliveryDate = moment(result.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (result.payment_type == 0) {
                        paymentMethod = "CASH";
                    }
                    else {
                        paymentMethod = "Card";
                    }
                    cb(null);
                }

            });
        }],
        sendUserEmail: ['getUserEmail', function (cb) {
            emailTemp.orderRejections(self_pickup, req, res, AdminMail, userName, amount, placeDate, deliveryDate, orderId, supplierNameEnglish, supplierNameArabic, paymentMethod, userEmail, notificationLanguage, function (err, result) {
                if (err) {
                    console.log("..****fb register email*****....", err);
                }
            })
            cb(null)
        }],
        sendPushNotification: ['getUserEmail', function (cb) {
            if (notificationStatus == 0) {
                cb(null)
            }
            else {

                if (deviceType == 0) {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": 1,
                            "message": "Regret Your Order Has Been Rejected From " + supplierNameEnglish,
                            "orderId": orderId

                            //   "data": {"supplier_name": supplierName}
                        }
                    }
                    else {
                        var data = {
                            "status": 1,
                            "message": "مع الاسف تم رفض طلبك من قبل " + supplierNameArabic,
                            "orderId": orderId

                            //   "data": {"supplier_name": supplierName}
                        }
                    }
                    message = data.message;

                    pushNotifications.sendAndroidPushNotification(deviceToken, data, cb);
                }
                else {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": 1,
                            "message": "Regret Your Order Has Been Rejected From " + supplierNameEnglish,
                            "orderId": orderId

                            //   "data": {"supplier_name": supplierName}
                        }
                    }
                    else {
                        var data = {
                            "status": 1,
                            "message": "مع الاسف تم رفض طلبك من قبل " + supplierNameArabic,
                            "orderId": orderId

                            //   "data": {"supplier_name": supplierName}
                        }
                    }
                    var path = "user";
                    var sound = "ping.aiff";
                    pushNotifications.sendIosPushNotification(deviceToken, data, path, sound, cb);
                }
            }
        }],
        savePushNotification: ['sendPushNotification', function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                if (notificationLanguage == 14) {
                    saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, constant.pushNotificationMessage.ORDER_REJECTED_ENGLISH, cb)
                }
                else {
                    saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, constant.pushNotificationMessage.ORDER_REJECTED_ARABIC, cb)
                }
            }
        }],
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 4);

        }

    })

}


exports.requestSubscriptionRenewal = function (req, res) {
    var accessToken;
    var languageId;
    var supplierName;
    var supplierId;
    var supplierEmail;
    console.log("console.ll.......", req.body)
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id,name,email from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    console.log(".......", result);
                    if (result.length) {
                        supplierId = result[0].id;
                        supplierName = result[0].name;
                        supplierEmail = result[0].email;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        /*    sendAdminMail:['notificationData',function(cb){
                emailTemp.userRateOrder(reply,AdminMail,orderId,supplierName,userName,mobileNumber,area,landmark,building,houseNumber[0],function(err,result){
                    if(err){
                        console.log("..****user rate email*****....",err);
                    }
                })
                cb(null)
            }],*/
        /* sendEmailToAdmin: ['validateAccessToken', function (cb) {
 
           /!*  var subject = "Subscription Renewal Request";
             var content = "Supplier " + supplierName + " with email " + supplierEmail + "\n"
             content += "   has requested for subscription renewal\n\n";
             content += " Regards \n";
             content += " Team royo";
             func.sendMailthroughSMTP(res, subject, config.adminEmail, content, 1, function (err, result) {
                 cb(null);
 
             });*!/
 
         }]*/
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            if (languageId == 14) {
                var message = "Subscription renewal request has been sent";
                sendResponse.sendSuccessData({}, message, res, 200);
            }
            else {
                var message = "تم إرسال طلب تجديد الاشتراك";
                sendResponse.sendSuccessData({}, message, res, 200);
            }

        }

    })

}


exports.requestCommissionChange = function (req, res) {
    var accessToken;
    var languageId;
    var supplierName;
    var supplierId;
    var supplierEmail;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id,name,email from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        supplierName = result[0].name;
                        supplierEmail = result[0].email;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        sendEmailToAdmin: ['validateAccessToken', function (cb) {
            var subject = "Commission Change Request";
            var content = "Supplier " + supplierName + " with email " + supplierEmail + "\n"
            content += "   has requested for commission change\n\n";
            content += " Regards \n";
            content += " Team royo";
            func.sendMailthroughSMTP(res, subject, config.adminEmail, content, 1, function (err, result) {
                cb(null);

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            if (languageId == 14) {
                var message = "Commission Change request has been sent";
                sendResponse.sendSuccessData({}, message, res, 200);
            }
            else {
                var message = "وقد أرسلت تغيير جنة طلب";
                sendResponse.sendSuccessData({}, message, res, 200);
            }

        }

    })

}


exports.supplierLogout = async function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    let checkMultiSupplierLogin = await ExecuteQ.Query(req.dbName,
        "select `key`, value from tbl_setting where `key`=? and value='1' ",
        ["supplier_multiple_login"]);
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select s.id,s.name,s.email from supplier s join supplier_admin sa on sa.supplier_id=s.id where sa.access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (checkMultiSupplierLogin && checkMultiSupplierLogin.length > 0) {
                            supplierId = 0;

                            cb(null, 0);

                        } else {
                            if (req.body.languageId == 14) {
                                var msg = "Invalid access token";
                            } else {
                                var msg = "تصريح الدخول غير صالح";
                            }
                            sendResponse.sendErrorMessage(msg, res, 401);
                        }

                    }
                }
            })

        }],
        Logout: ['validateAccessToken', async function (cb) {
            try {
                var sql = "update supplier set device_token=?,access_token = ? where id = ? limit 1";
                await ExecuteQ.Query(req.dbName, sql, ['', '', supplierId]);
                var sql1 = "update supplier_admin set fcm_token=? where access_token = ? limit 1";
                await ExecuteQ.Query(req.dbName, sql1, ['', accessToken]);
                cb(null);
            }
            catch (Err) {
                var msg = "db error :";
                sendResponse.sendErrorMessage(msg, res, 500);
            }

        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            if (languageId == 14) {
                var message = "Supplier logged out";
                sendResponse.sendSuccessData({}, message, res, 200);
            }
            else {
                var message = "تسجيل مزود خارج";
                sendResponse.sendSuccessData({}, message, res, 200);
            }
        }

    })

}
exports.supplierBranchLogout = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id,email from supplier_branch where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        Logout: ['validateAccessToken', function (cb) {
            var sql = "update supplier_branch set access_token = ? where id = ? limit 1";
            multiConnection[req.dbName].query(sql, ['', supplierId], function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    cb(null);
                }
            })
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            if (languageId == 14) {
                var message = "Supplier logged out";
                sendResponse.sendSuccessData({}, message, res, 200);
            }
            else {
                var message = "تسجيل مزود خارج";
                sendResponse.sendSuccessData({}, message, res, 200);
            }
        }

    })

}

function getUserEmail(dbName, res, orderId, callback) {
    var sql = "select o.self_pickup,o.payment_type,o.net_amount,CONCAT(u.firstname,' ',u.lastname) As User_Name,u.id,u.email,u.device_token,u.device_type,u.notification_status,u.notification_language,o.created_on,o.schedule_date from orders o join user u on o.user_id = u.id where o.id = ? limit 1"
    multiConnection[dbName].query(sql, [orderId], function (err, result) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {
                "user_id": result[0].id,
                "email": result[0].email,
                "device_token": result[0].device_token,
                "device_type": result[0].device_type,
                "notification_status": result[0].notification_status,
                "notification_language": result[0].notification_language,
                "User_Name": result[0].User_Name,
                "net_amount": result[0].net_amount,
                "created_on": result[0].created_on,
                "schedule_date": result[0].schedule_date,
                "payment_type": result[0].payment_type,
                "self_pickup": result[0].self_pickup
            };
            //console.log("data.......", data)
            callback(null, data);
        }
    })

}


function acceptOrder(res, orderId, callback) {
    var sql = "update orders set status = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, [1, orderId], function (err, result) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null);
        }
    })

}


function rejectOrder(dbName, res, orderId, reason, callback) {
    var sql = "update orders set status = ?,approve_rejection_reason = ? where id = ? limit 1";
    multiConnection[dbName].query(sql, [2, reason, orderId], function (err, result) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null);
        }
    })

}

function getTotalOrdersDelivered(dbName, res, supplierId, callback) {
    async.parallel([
        function (cb) {
            var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(`delivered_on`) = curdate() and supplier_branch_id IN ";
            sql += " (select id from supplier_branch where supplier_id = ?) and (status = ? || status = ?)";
            multiConnection[dbName].query(sql, [supplierId, 5, 6], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered1 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].total_orders_delivered);
                } else {
                    cb(null, 0);
                }
            })
        },
        function (cb) {
            var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(`delivered_on`) BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() and supplier_branch_id IN ";
            sql += " (select id from supplier_branch where supplier_id = ?) and (status = ? || status = ?)";
            multiConnection[dbName].query(sql, [supplierId, 5, 6], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered2 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].total_orders_delivered);
                } else {
                    cb(null, 0);
                }
            })
        },
        function (cb) {
            var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(`delivered_on`) BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() and supplier_branch_id IN ";
            sql += " (select id from supplier_branch where supplier_id = ?) and (status = ? || status = ?)";
            multiConnection[dbName].query(sql, [supplierId, 5, 6], function (error, reply) {
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered3 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].total_orders_delivered);
                } else {
                    cb(null, 0);
                }
            })
        }
    ], function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.today = response[0];
            data.weekly = response[1];
            data.monthly = response[2];
            //console.log("dftsy",data);
            callback(null, data);

        }

    })

}


function getRevenueFiltering(dbName, res, supplierId, callback) {
    async.parallel([
        function (cb) {
            var sql = "select if (sum(`net_amount`) IS NULL,0,sum(net_amount)) as revenue from orders where status = 5 and DATE(`delivered_on`) = curdate() and supplier_branch_id IN ";
            sql += " (select id from supplier_branch where supplier_id = ?)";
            multiConnection[dbName].query(sql, [supplierId], function (error, reply) {
                console.log("/.......today....", reply)
                if (error) {
                    console.log("error from getSupplierTodayRevenue4 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else if (reply.length) {
                    cb(null, reply[0].revenue);
                } else {
                    cb(null, 0);
                }
            })
        },
        function (cb) {
            var sql = "select if (sum(`net_amount`) IS NULL,0,sum(net_amount)) as revenue from orders where status = 5 and DATE(delivered_on) BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() and supplier_branch_id IN ";
            sql += " (select id from supplier_branch where supplier_id = ?) ";
            multiConnection[dbName].query(sql, [supplierId], function (error, reply) {
                console.log("/.......week....", reply)
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered5 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].revenue);
                } else {
                    cb(null, 0);
                }
            })
        },
        function (cb) {
            var sql = "select if (sum(`net_amount`) IS NULL,0,sum(net_amount)) as revenue from orders where status = 5 and DATE(delivered_on) BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() and supplier_branch_id IN ";
            sql += " (select id from supplier_branch where supplier_id = ?) ";
            multiConnection[dbName].query(sql, [supplierId], function (error, reply) {
                console.log("/.......month....", reply)
                if (error) {
                    console.log("error from getSupplierTotalOrdersDelivered6 " + error);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length) {
                    cb(null, reply[0].revenue);
                } else {
                    cb(null, 0);
                }
            })
        }
    ], function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.today = response[0];
            data.weekly = response[1];
            data.monthly = response[2];
            //console.log("dsdsfd",data)
            callback(null, data);
        }

    })
}

function noOfOrderDelivered(dbName, res, supplierId, filter, callback) {

    if (filter == 0) {
        var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(delivered_on) = curdate() and supplier_branch_id IN ";
        sql += " (select id from supplier_branch where supplier_id = ?) and (status = ? || status = ?)";
        multiConnection[dbName].query(sql, [supplierId, 5, 6], function (error, reply) {
            if (error) {
                console.log("error from getSupplierTotalOrdersDelivered " + error);
                var msg = "db error :";
                sendResponse.sendErrorMessage(msg, res, 500);
            } else if (reply.length) {
                callback(null, reply[0].total_orders_delivered);
            } else {
                callback(null, 0);
            }
        })
    }
    else if (filter == 1) {
        var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(delivered_on) BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() and supplier_branch_id IN ";
        sql += " (select id from supplier_branch where supplier_id = ?) and (status = ? || status = ?)";
        multiConnection[dbName].query(sql, [supplierId, 5, 6], function (error, reply) {
            if (error) {
                console.log("error from getSupplierTotalOrdersDelivered " + error);
                var msg = "db error :";
                sendResponse.sendErrorMessage(msg, res, 500);
            } else if (reply.length) {
                callback(null, reply[0].total_orders_delivered);
            } else {
                callback(null, 0);
            }
        })
    }
    else {
        var sql = "select COUNT(*) as total_orders_delivered from orders where DATE(delivered_on) BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() and supplier_branch_id IN ";
        sql += " (select id from supplier_branch where supplier_id = ?) and (status = ? || status = ?)";
        multiConnection[dbName].query(sql, [supplierId, 5, 6], function (error, reply) {
            if (error) {
                console.log("error from getSupplierTotalOrdersDelivered " + error);
                var msg = "db error :";
                sendResponse.sendErrorMessage(msg, res, 500);
            } else if (reply.length) {
                callback(null, reply[0].total_orders_delivered);
            } else {
                callback(null, 0);
            }
        })
    }

}


function getAdvertisements(dbName, res, supplierId, accessToken, languageId, callback) {
    async.auto({
        getBannerAds: function (cb) {
            getSupplierBannerAds(dbName, res, supplierId, languageId, cb);
        },
        getSponsorAds: function (cb) {
            getSupplierSponsorAds(dbName, res, supplierId, languageId, cb);
        },
        getNotificationAds: function (cb) {
            getSupplierNotificationAds(dbName, res, supplierId, languageId, cb);
        }
    },
        function (err, response) {
            if (err) {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
            else {

                var data = {};
                data.banner = response.getBannerAds;
                data.sponsor = response.getSponsorAds;
                data.notification = response.getNotificationAds;
                callback(null, data);

            }

        })

}


function getSupplierBannerAds(dbName, res, supplierId, languageId, callback) {
    var currentDate = new Date();

    var sql = "select a.id,ad.name,a.banner_image image,a.start_date,a.end_date from advertisements a join advertisement_ml ad ";
    sql += " on a.id = ad.advertisement_id where a.advertisement_type = ? and ad.language_id = ? and a.supplier_id = ? ";
    multiConnection[dbName].query(sql, [0, languageId, supplierId], function (err, result) {
        if (err) {
            console.log("error from banner ads " + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var expired = [];
            var active = [];
            var future = [];
            var data = {};
            if (result.length) {
                for (var i = 0; i < result.length; i++) {
                    (function (i) {
                        if (result[i].start_date >= currentDate) {
                            future.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "expiry_date": moment(result[i].end_date).format('D MMMM YYYY')
                            })
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }
                        else if (result[i].start_date <= currentDate && result[i].end_date >= currentDate) {
                            active.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "expiry_date": moment(result[i].end_date).format('D MMMM YYYY')
                            });
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }
                        else if (result[i].end_date <= currentDate) {
                            expired.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "expiry_date": moment(result[i].end_date).format('D MMMM YYYY')
                            });
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }


                    }(i))

                }
            }
            else {
                data.expired = expired;
                data.active = active;
                data.future = future;
                callback(null, data);

            }
        }

    })
}


function getSupplierSponsorAds(dbName, res, supplierId, languageId, callback) {
    var currentDate = new Date();

    var sql = "select a.id,ad.name,a.banner_image image,a.start_date,a.end_date from advertisements a join advertisement_ml ad ";
    sql += " on a.id = ad.advertisement_id where a.advertisement_type = ? and ad.language_id = ? and a.supplier_id = ? ";
    multiConnection[dbName].query(sql, [3, languageId, supplierId], function (err, result) {
        if (err) {
            console.log("error from banner ads " + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var expired = [];
            var active = [];
            var future = [];
            var data = {};
            if (result.length) {
                for (var i = 0; i < result.length; i++) {
                    (function (i) {
                        if (result[i].start_date >= currentDate) {
                            future.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "expiry_date": moment(result[i].end_date).format('D MMMM YYYY')
                            })
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }
                        else if (result[i].start_date <= currentDate && result[i].end_date >= currentDate) {
                            active.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "expiry_date": moment(result[i].end_date).format('D MMMM YYYY')
                            });
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }
                        else if (result[i].end_date <= currentDate) {
                            expired.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "expiry_date": moment(result[i].end_date).format('D MMMM YYYY')
                            });
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }


                    }(i))

                }
            }
            else {
                data.expired = expired;
                data.active = active;
                data.future = future;
                callback(null, data);

            }
        }

    })
}


function getSupplierNotificationAds(dbName, res, supplierId, languageId, callback) {
    var currentDate = new Date();

    var sql = "select a.id,ad.name,a.banner_image image,a.start_date,ad.description from advertisements a join advertisement_ml ad ";
    sql += " on a.id = ad.advertisement_id where a.advertisement_type = ? and ad.language_id = ? and a.supplier_id = ? ";
    multiConnection[dbName].query(sql, [1, languageId, supplierId], function (err, result) {
        if (err) {
            console.log("error from banner ads " + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var expired = [];
            var active = [];
            var future = [];
            var data = {};
            if (result.length) {
                for (var i = 0; i < result.length; i++) {
                    (function (i) {
                        if (result[i].start_date >= currentDate) {
                            future.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "advertisement_description": result[i].description,
                                "expiry_date": moment(result[i].start_date).format('D MMMM YYYY')
                            })
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }
                        else if (result[i].start_date == currentDate) {
                            active.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "advertisement_description": result[i].description,
                                "expiry_date": moment(result[i].start_date).format('D MMMM YYYY')
                            });
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }
                        else if (result[i].start_date <= currentDate) {
                            expired.push({
                                "advertisement_id": result[i].id,
                                "advertisement_name": result[i].name,
                                "advertisement_image": result[i].image,
                                "advertisement_description": result[i].description,
                                "expiry_date": moment(result[i].start_date).format('D MMMM YYYY')
                            });
                            if (i == result.length - 1) {
                                data.expired = expired;
                                data.active = active;
                                data.future = future;
                                callback(null, data);

                            }
                        }


                    }(i))

                }
            }
            else {
                data.expired = expired;
                data.active = active;
                data.future = future;
                callback(null, data);

            }
        }

    })
}


function getSupplierDashboardData(dbName, res, supplierId, accessToken, languageId, callback) {
    var status = 0;
    async.parallel([
        function (cb1) {
            getSupplierTodayRevenue(dbName, res, cb1, supplierId);
        },
        function (cb1) {
            getSupplierSubscriptionStatus(dbName, res, cb1, supplierId);
        },
        function (cb1) {
            getSupplierCommissionPlan(dbName, res, cb1, languageId, supplierId);
        },
        function (cb1) {
            getSupplierPositioning(dbName, res, cb1, languageId, supplierId);
        },
        function (cb1) {
            getSupplierNameAndRating(dbName, res, supplierId, languageId, cb1);
        },
        function (cb1) {
            getSupplierCategories(dbName, res, supplierId, languageId, cb1);
        },
        function (cb1) {
            getSupplierReviews(dbName, res, supplierId, cb1);
        },
        function (cb1) {
            supplierStatus(dbName, res, supplierId, function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    status = result;
                    cb1(null);
                }
            });
        }
    ], function (err, response) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else {
            var data = {};
            data.supplier_id = supplierId;
            data.access_token = accessToken;
            data.revenue = response[0];
            data.subscription = response[1];
            data.supplier_image = response[4].supplier_image;
            data.name = response[4].name;
            data.total_reviews = response[4].total_reviews;
            data.rating = response[4].rating;
            data.is_active = response[4].is_active;
            data.status = status;
            data.categories = response[5];
            data.reviews = response[6];
            async.waterfall([
                function (cb) {
                    clubCommissionPlanAndPosition(res, response[2], response[3], cb);
                }
            ], function (err, response1) {

                data.commission = response1;
                callback(null, data);

            })


        }
    })
}

function supplierStatus(dbName, res, supplierId, callback) {
    var day = moment().isoWeekday();
    day = day - 1;
    console.log(".....", supplierId, day);
    var sql1 = 'select is_open as status from supplier_timings where supplier_id =? and week_id= ?'
    multiConnection[dbName].query(sql1, [supplierId, day], function (err, response) {
        if (err) {
            console.log("err2", err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            console.log(".....response.....", response);
            if (response.length) {
                callback(null, response[0].status);
            }
            else {
                callback(null, 0)
            }

        }
    })
}

function clubCommissionPlanAndPosition(res, commissionPackage, position, callback) {
    var first = 0
    var second = 0;
    var third = 0;
    var onOffComm = 0;
    var commisionButton = 0;
    var commission_type = 0;
    var currentCommission = 0;
    for (var i = 0; i < position.length; i++) {
        (function (i) {
            var package = 0;
            for (var j = 0; j < commissionPackage.length; j++) {
                (function (j) {
                    if (position[i].category_id == commissionPackage[j].category_id) {
                        package = commissionPackage[j].commission_package;
                        currentCommission = commissionPackage[j].commission;
                        first = commissionPackage[j].first;
                        second = commissionPackage[j].second;
                        third = commissionPackage[j].third;
                        onOffComm = commissionPackage[j].onOffComm;
                        commisionButton = commissionPackage[j].commisionButton;
                        commission_type = commissionPackage[j].commission_type;
                        if (j == commissionPackage.length - 1) {
                            position[i].commission_package = package;
                            position[i].currentCommission = currentCommission;
                            position[i].first = first
                            position[i].second = second;
                            position[i].third = third;
                            position[i].onOffComm = onOffComm;
                            position[i].commisionButton = commisionButton;
                            position[i].commission_type = commission_type;
                            if (i == position.length - 1) {
                                callback(null, position);
                            }
                        }

                    }
                    else {
                        if (j == commissionPackage.length - 1) {
                            position[i].commission_package = package;
                            position[i].currentCommission = currentCommission;
                            position[i].first = first
                            position[i].second = second;
                            position[i].third = third;
                            position[i].onOffComm = onOffComm;
                            position[i].commisionButton = commisionButton;
                            position[i].commission_type = commission_type;
                            if (i == position.length - 1) {
                                callback(null, position);
                            }
                        }
                    }

                }(j))

            }

        }(i))

    }

}


function getSupplierTodayRevenue(dbName, res, callback, supplierId) {
    var sql = "select if (sum(`net_amount`) IS NULL,0,sum(net_amount)) as revenue from orders where DATE(`delivered_on`) = curdate() and status=5 and  supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?)";
    multiConnection[dbName].query(sql, [supplierId], function (error, reply) {
        console.log(".......getSupplierTodayRevenue........", reply);

        if (error) {
            console.log("error from getSupplierTodayRevenue " + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].revenue);
        } else {
            callback(null, 0);
        }
    })
}


function getSupplierSubscriptionStatus(dbName, res, callback, supplierId) {
    var result1 = 0;
    var data1 = [];
    var d = new Date();
    var n = d.getMonth();
    console.log("n====", n);
    async.auto({
        getdays: function (cb) {
            var sql = "SELECT DATEDIFF(`end_date`,curDate()) AS days from supplier_subscription where supplier_id = ?"
            multiConnection[dbName].query(sql, [supplierId], function (error, reply) {
                console.log("error from getSupplierSubscriptionStatus " + error);

                if (error) {

                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length && reply[0].days > 0) {
                    /* callback(null, reply[0].days);*/
                    result1 = reply[0].days;
                    cb(null);
                } else {
                    cb(null);
                }
            })
        },
        setdays: ['getdays', function (cb) {
            if (result1) {
                var sql = 'select * from supplier_subscription where supplier_id = ?'
                multiConnection[dbName].query(sql, [supplierId], function (err, result) {
                    if (err) {
                        console.log("error from getSupplierSubscriptionStatus1 " + err);
                        var msg = "db error :";
                        sendResponse.sendErrorMessage(msg, res, 500);
                    }
                    else {
                        console.log("res.1.1.....", result[0]);
                        var data = result[0];
                        data1.push(data.jan_price);
                        data1.push(data.feb_price);
                        data1.push(data.march_price);
                        data1.push(data.april_price);
                        data1.push(data.may_price);
                        data1.push(data.june_price);
                        data1.push(data.july_price);
                        data1.push(data.aug_price);
                        data1.push(data.sep_price);
                        data1.push(data.oct_price);
                        data1.push(data.nov_price);
                        data1.push(data.dec_price);

                        console.log("res.1.2.....", data1[n]);
                        if (n == 0 || n == 2 || n == 4 || n == 6 || n == 7 || n == 9 || n == 11) {
                            if (data1[n] == 0) {
                                result1 = 0;
                            }
                            cb(null);
                        }
                        else if (n == 3 || n == 5 || n == 8 || n == 10) {
                            if (data1[n] == 0) {
                                result1 = 0;
                            }
                            cb(null);
                        }
                        else {
                            if (data1[n] == 0) {
                                result1 = 0;
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
    }, function (err, response) {
        if (err) {
            console.log("errr", err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result1);

        }
    })

}


function getSupplierCommissionPlan(dbName, res, callback, languageId, supplierId) {
    var result;
    var data = [];

    async.auto({
        getCommission: function (cb) {
            var sql = "select s.commission,s.commission_package,s.onOffComm,c.name,c.category_id,s.commission_type,ss.commisionButton from supplier_category s join categories_ml c on ";
            sql += " s.category_id = c.category_id join supplier ss on ss.id = s.supplier_id where s.supplier_id = ? and c.language_id = ? group by s.category_id ORDER BY c.id ASC";
            multiConnection[dbName].query(sql, [supplierId, languageId], function (error, reply) {
                console.log("error from getSupplierCommissionPlan " + error);
                if (error) {

                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    result = reply;
                    cb(null)
                }
            })
        },
        setPackage: ['getCommission', function (cb) {
            var length = result.length;
            if (length == 0) {
                cb(null);
            }
            console.log("error from setPackage ");
            for (var i = 0; i < length; i++) {
                (function (i) {
                    if (result[i].onOffComm == 1 && result[i].commission_type == 1 && result[i].commisionButton == 1) {
                        setCommission(dbName, res, result[i], function (err, response, result1) {
                            if (err) {

                                var msg = "db error :";
                                sendResponse.sendErrorMessage(msg, res, 500);
                            }
                            else {
                                if (result1.length) {
                                    result[i].commission_package = response;
                                    result[i].first = 0;
                                    result[i].second = 0;
                                    result[i].third = 0;
                                    console.log(".....", result1);
                                    if (result1[0].commission > result[i].commission) {
                                        result[i].first = result1[0].commission - result[i].commission;
                                    }
                                    if (result1[1].commission > result[i].commission) {
                                        result[i].second = result1[1].commission - result[i].commission;
                                    } if (result1[2].commission > result[i].commission) {
                                        result[i].third = result1[2].commission - result[i].commission;
                                    }

                                    if (i == (length - 1)) {
                                        cb(null);
                                    }
                                }
                                else {
                                    result[i].commission_package = response;
                                    result[i].first = 0;
                                    result[i].second = 0;
                                    result[i].third = 0;
                                    if (i == (length - 1)) {
                                        cb(null);
                                    }
                                }

                            }
                        });
                    }
                    else {
                        result[i].commission_package = 3;
                        result[i].first = 0;
                        result[i].second = 0;
                        result[i].third = 0;
                        if (i == (length - 1)) {
                            cb(null);
                        }
                    }
                }(i))
            }
        }]
    }, function (err, response) {
        if (err) {
            console.log("errr", err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            console.log("...............call.....................");
            if (result.length) {
                callback(null, result)
            }
            else {
                callback(null, "NO PLAN")
            }
        }
    })

}


function getSupplierPositioning(dbName, res, callback, languageId, supplierId) {
    //console.log("inside here")
    var categoryTotal;
    var categoryPosition;
    async.auto({
        getTotalValues: function (cb) {
            getCategoryWiseTotalValues(dbName, res, supplierId, function (err, result) {
                if (err) {
                    console.log("rrr1", err);
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    categoryTotal = result;
                    cb(null);

                }

            });
        },
        getCategoryWisePositioning: function (cb) {
            getCategoryWisePositioning(dbName, res, supplierId, languageId, function (err, result) {
                if (err) {
                    console.log("rrr2", err);
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    categoryPosition = result;
                    cb(null);

                }
            });
        },
        clubPositioning: ['getTotalValues', 'getCategoryWisePositioning', function (cb) {
            getPositionsCategoryWise(res, categoryTotal, categoryPosition, cb);
        }]
    }
        , function (err, response) {
            callback(null, response.clubPositioning)
        })


}


function getCategoryWiseTotalValues(dbName, res, supplierId, callback) {
    var sql = "select count(*) total,category_id from supplier_category where category_id IN ";
    sql += " (select category_id from supplier_category where supplier_id = ? group by category_id) group by category_id";
    multiConnection[dbName].query(sql, [supplierId], function (err, result) {
        if (err) {
            console.log("error from getCategoryWiseTotalValues " + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}


function getCategoryWisePositioning(dbName, res, supplierId, languageId, callback) {
    var data = [];
    var sql = "select category_id from supplier_category where supplier_id = ? group by category_id";
    multiConnection[dbName].query(sql, [supplierId], function (err, categories) {
        if (err) {
            console.log("error from getCategoryWiseTotalValues " + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else {
            for (var i = 0; i < categories.length; i++) {
                (function (i) {
                    var sql2 = "select supplier_id,category_name,category_id,position from (SELECT s.supplier_id, ";
                    sql2 += " a.name category_name,a.category_id category_id, @rownum := @rownum + 1 AS position FROM supplier_category s ";
                    sql2 += " join categories_ml a on a.category_id =s.category_id,(SELECT @rownum := 0) r where ";
                    sql2 += " s.category_id = ? and a.language_id = ? group by s.supplier_id) selection where supplier_id = ?";
                    multiConnection[dbName].query(sql2, [categories[i].category_id, languageId, supplierId], function (err, response) {

                        data.push({
                            "category_id": response[0].category_id,
                            "category_name": response[0].category_name,
                            "position": response[0].position
                        })
                        if (i == categories.length - 1) {
                            callback(null, data);
                        }


                    })


                }(i))

            }

        }

    })


}


function getPositionsCategoryWise(res, categoryTotal, categoryPosition, callback) {
    var categoryTotalLength = categoryTotal.length;
    for (var i = 0; i < categoryTotalLength; i++) {
        (function (i) {
            for (var j = 0; j < categoryTotalLength; j++) {
                (function (j) {
                    if (categoryPosition[i].category_id == categoryTotal[j].category_id) {
                        categoryPosition[i].total = categoryTotal[j].total;
                        if (j == categoryTotalLength - 1) {
                            if (i == categoryTotalLength - 1) {

                                callback(null, categoryPosition);

                            }
                        }
                    }
                    else {
                        if (j == categoryTotalLength - 1) {
                            if (i == categoryTotalLength - 1) {

                                callback(null, categoryPosition);

                            }
                        }
                    }

                }(j))

            }

        }(i))

    }
}


function checkSupplierAppVersion(res, deviceType, callback) {
    var appData = {};

    async.auto({
        'getAppVersion': function (cb) {
            AppVersion(res, deviceType, function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    appData = result;
                    cb(null);
                }

            });
        },
        checkAppVersion: ['getAppVersion', function (cb) {

            checkAppVersion(res, appData, appVersion, deviceType, cb);
        }]

    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, response.checkAppVersion);
        }

    })
}


function AppVersion(res, deviceType, callback) {
    if (deviceType == 0) {
        var sql = "select android_version,is_forced_android from user_app_version where type = ? limit 1";
        multiConnection[dbName].query(sql, [0], function (err, result) {
            if (err) {
                var msg = "something went wrong";
                sendResponse.sendErrorMessage(msg, res, 500);
            }
            else {

                var data = {};
                data.version = result[0].android_version;
                data.is_forced = result[0].is_forced_android;
                callback(null, data);

            }

        })
    }
    else {
        var sql = "select ios_version,is_forced_ios from user_app_version where type = ? limit 1";
        multiConnection[dbName].query(sql, [0], function (err, result) {
            if (err) {
                var msg = "something went wrong";
                sendResponse.sendErrorMessage(msg, res, 500);
            }
            else {
                var data = {};
                data.version = result[0].ios_version;
                data.is_forced = result[0].is_forced_ios;
                callback(null, data);
            }
        })
    }

}


function checkAppVersion(res, appData, appVersion, deviceType, callback) {
    var data = {};
    if (appData.version > appVersion) {
        data.is_update_required = 1;
        data.is_forced = appData.is_forced;
        callback(null, data);
    }
    else {
        data.is_update_required = 0;
        data.is_forced = appData.is_forced;
        callback(null, data);
    }

}


exports.getOrderManagerPageData = function (dbName, res, supplierId, accessToken, callback) {

    async.parallel([
        function (cb) {
            getTotalOrdersDelivered(dbName, res, supplierId, cb);
        },
        function (cb) {
            getRevenueFiltering(dbName, res, supplierId, cb);
        },
        function (cb) {
            getSupplierPendingUrgentOrders(dbName, res, supplierId, cb);
        },
        function (cb) {
            getSupplierPendingOrders(dbName, res, supplierId, cb);
        },
        function (cb) {
            getSupplierPendingTrackingAlerts(dbName, res, supplierId, cb);
        },
        function (cb) {
            getSupplierOrdersofTomorrow(dbName, res, supplierId, cb);
        }, function (cb) {
            getcancelOrdersByUser(dbName, res, supplierId, cb);
        },
    ], function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            //console.log("response", response);
            var filteredData = [];
            filteredData[0] = {
                "name": "Today",
                "total_orders_delivered": response[0].today,
                "total_revenue": response[1].today
            };
            filteredData[1] = {
                "name": "Weekly",
                "total_orders_delivered": response[0].weekly,
                "total_revenue": response[1].weekly
            };
            filteredData[2] = {
                "name": "Monthly",
                "total_orders_delivered": response[0].monthly,
                "total_revenue": response[1].monthly
            };

            var data = {};
            data.access_token = accessToken;
            data.supplier_id = supplierId;
            data.filtered_data = filteredData;
            data.pending_urgent_orders = response[2];
            data.pending_orders = response[3];
            data.pending_tracking = response[4];
            data.scheduled_orders_tomorrow = response[5];
            data.cancel_orders = response[6];
            callback(null, data);

        }

    })

}


function getTotalOrdersDeliveredToday(res, supplierId, callback) {
    var sql = "select COUNT(*) as total_orders_delivered from orders where `delivered_on` = curdate() and supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and status = ?";
    multiConnection[dbName].query(sql, [supplierId, 1], function (error, reply) {
        if (error) {
            console.log("error from getSupplierTotalOrdersDelivered " + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].total_orders_delivered);
        } else {
            callback(null, 0);
        }
    })

}


function getSupplierPendingUrgentOrders(dbName, res, supplierId, callback) {
    var sql = "select COUNT(*) as pending_urgent_orders from orders where supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and status = ? and urgent = ?";
    multiConnection[dbName].query(sql, [supplierId, 0, 1], function (error, reply) {
        if (error) {
            console.log("error from getSupplierPendingUrgentOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].pending_urgent_orders);
        } else {
            callback(null, 0);
        }
    })
}


function getSupplierPendingOrders(dbName, res, supplierId, callback) {
    var sql = "select COUNT(*) as pending_orders from orders where supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and status = ? and urgent = ?";
    multiConnection[dbName].query(sql, [supplierId, 0, 0], function (error, reply) {
        if (error) {
            console.log("error from getSupplierPendingUrgentOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].pending_orders);
        } else {
            callback(null, 0);
        }
    })

}


function getSupplierPendingTrackingAlerts(dbName, res, supplierId, callback) {
    var sql = "select COUNT(*) as pending_tracking_alerts from orders where supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and status = ?";
    multiConnection[dbName].query(sql, [supplierId, 7], function (error, reply) {
        if (error) {
            console.log("error from getSupplierPendingUrgentOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].pending_tracking_alerts);
        } else {
            callback(null, 0);
        }
    })
}


function getSupplierOrdersofTomorrow(dbName, res, supplierId, callback) {
    var sql = "select COUNT(*) as scheduled_orders_for_tommorrow from orders where supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and status IN (?,?,?)";
    multiConnection[dbName].query(sql, [supplierId, 1, 3, 4], function (error, reply) {
        if (error) {
            console.log("error from getSupplierTomorrowOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].scheduled_orders_for_tommorrow);
        } else {
            callback(null, 0);
        }
    })
}


function getSupplierProfileData(dbName, res, supplierId, accessToken, languageId, callback) {
    async.parallel([
        function (cb) {
            getSupplierNameAndRating(dbName, res, supplierId, languageId, cb);
        },
        function (cb) {
            getSupplierCategories(dbName, res, supplierId, languageId, cb);
        },
        function (cb) {
            getSupplierReviews(dbName, res, supplierId, cb);
        }
    ],
        function (err, response) {
            if (err) {
                var msg = "Something went wrong";
                sendResponse.sendErrorMessage(msg, res, 500);
            }
            else {
                var data = {};
                data.supplier_image = response[0].supplier_image;
                data.name = response[0].name;
                data.total_reviews = response[0].total_reviews;
                data.rating = response[0].rating;
                data.is_active = response[0].is_active;
                data.status = response[0].status;
                data.categories = response[1];
                data.reviews = response[2];
                data.access_token = accessToken;
                data.supplier_id = supplierId;
                callback(null, data);

            }
        })

}


function getSupplierNameAndRating(dbName, res, supplierId, languageId, callback) {
    var sql = "select sim.image_path supplier_image,sml.name,s.total_reviews,s.rating,s.is_active from supplier s ";
    sql += " left join supplier_ml sml on s.id = sml.supplier_id left join supplier_image sim on s.id = sim.supplier_id where s.id = ? and sml.language_id = ? ";
    multiConnection[dbName].query(sql, [supplierId, languageId], function (err, response) {
        if (err) {
            console.log("error from Name and Rating" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (response.length) {
            callback(null, response[0]);
        } else {
            console.log("er,,,,,", err)
            var msg = "Something went wrong";
            sendResponse.sendErrorMessage(msg, res, 500);
        }

    })

}


function getSupplierCategories(dbName, res, supplierId, languageId, callback) {
    var sql = "select cml.name from supplier_category s join categories_ml cml on s.category_id = cml.category_id ";
    sql += " where s.supplier_id = ? and cml.language_id = ? group by s.category_id";
    multiConnection[dbName].query(sql, [supplierId, languageId], function (err, response) {
        if (err) {
            console.log("error from supplier categories" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (response.length) {
            callback(null, response);
        } else {
            var msg = "Something went wrong";
            sendResponse.sendErrorMessage(msg, res, 500);
        }


    })
}


function getSupplierReviews(dbName, res, supplierId, callback) {
    var sql = "select s.id,s.rating,s.comment,u.firstname,u.user_image from supplier_rating s join user u on ";
    sql += " s.user_id = u.id where s.supplier_id = ? and s.is_deleted = ? order by id DESC ";
    multiConnection[dbName].query(sql, [supplierId, 0], function (err, response) {
        if (err) {
            console.log("error from supplier categories" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else {
            callback(null, response);
        }

    })

}


exports.getPendingOrdersPageData = function (res, supplierId, accessToken, languageId, isUrgent, callback) {
    var orders;
    var orderDetails;
    async.auto({
        getOrders: function (cb) {
            getPendingOrders(res, supplierId, languageId, isUrgent, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getPendingTracking(dbName, res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrders', 'getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}


function getPendingOrders(res, supplierId, languageId, isUrgent, callback) {


    var sql = "select o.id as order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date as delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address ";
    sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and o.status = ? and o.urgent = ? ";
    multiConnection[dbName].query(sql, [supplierId, 0, isUrgent], function (err, result) {
        if (err) {
            console.log("error from pending orders" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}


function getPendingTracking(dbName, res, languageId, callback) {
    var sql = "select pp.category_id,pp.bar_code,pi.image_path,o.order_id,o.price,o.quantity,p.name,p.measuring_unit from order_prices o join product_ml p ";
    sql += " on o.product_id = p.product_id  join product_image pi on pi.product_id = p.product_id join product pp on pp.id=p.product_id where p.language_id = ? and pi.imageOrder=1";
    multiConnection[dbName].query(sql, [languageId], function (err, result) {
        if (err) {
            console.log("error from order details" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })
}


function clubOrderData(res, orders, orderDetails, callback) {
    var orderLength = orders.length;
    var orderDetailsLength = orderDetails.length;

    if (!orderLength) {
        callback(null, []);
    }
    else {
        for (var i = 0; i < orderLength; i++) {
            (function (i) {
                // orders[i].delivery_date = moment(orders[i].delivery_date).format('D MMMM YYYY');
                var details = [];
                var date = orders[i].delivery_date;
                var date1 = orders[i].pickup_date;
                var date2 = orders[i].pickup_time;
                orders[i].delivery_date = moment(date).format('D MMMM YYYY');
                orders[i].pickup_date = moment(date1).format('D MMMM YYYY');
                orders[i].delivery_time = moment(date).format('HH:mm');
                orders[i].ios_delivery_time = moment(date).format('hh:mm A');
                console.log(".....", date2, orders[i].delivery_time)
                console.log("....delivery.....", orders[i].ios_delivery_time)
                // orders[i].delivery_time1 = moment(date).format('hh:mm A');
                var date3 = moment(date2, 'h:mma');
                var date4 = date3._d;
                orders[i].ios_pickup_time = moment(date4).format('hh:mm A');
                console.log(".....pickup......", orders[i].ios_pickup_time)
                for (var j = 0; j < orderDetailsLength; j++) {
                    (function (j) {
                        if (orders[i].order_id == orderDetails[j].order_id) {
                            if (orderDetails[j].category_id == 7 || orderDetails[j].category_id == 7) {
                                details.push({
                                    "product_amount": orderDetails[j].price,
                                    "product_name": orderDetails[j].name,
                                    "quantity": orderDetails[j].quantity,
                                    "measuring_unit": orderDetails[j].measuring_unit,
                                    "image": orderDetails[j].image_path,
                                    "bar_code": orderDetails[j].bar_code
                                });
                            }
                            else {
                                details.push({

                                    "product_amount": orderDetails[j].price,
                                    "product_name": orderDetails[j].name,
                                    "quantity": orderDetails[j].quantity,
                                    "measuring_unit": orderDetails[j].measuring_unit,
                                    "image": orderDetails[j].image_path,
                                });
                            }

                            if (j == orderDetailsLength - 1) {
                                orders[i].order_details = details;
                                if (i == orderLength - 1) {
                                    callback(null, orders);
                                }
                            }

                        }
                        else {
                            if (j == orderDetailsLength - 1) {
                                orders[i].order_details = details;
                                if (i == orderLength - 1) {
                                    callback(null, orders);
                                }
                            }
                        }

                    }(j))

                }

            }(i))
        }
    }

}


function getSupplierOrderRevenues(res, supplierId, accessToken, languageId, filter, callback) {
    var revenues;
    async.auto({
        orderRevenues: function (cb) {
            getOrderRevenues(res, supplierId, filter, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    revenues = result;
                    cb(null);
                }

            });
        },
        makeRevenueData: ['orderRevenues', function (cb) {

            makeDateWiseRevenueData(res, revenues, cb);


        }]
    }, function (err, response) {

    })


}


function getOrderRevenues(res, supplierId, filter, callback) {

    var sql = "select SUM(net_amount) price, COUNT(id) no_of_orders,created_on from orders where supplier_branch_id IN ";
    sql += "(select id from supplier_branch where supplier_id = ?) ";
    multiConnection[dbName].query(sql, [supplierId], function (err, response) {
        if (err) {
            console.log("error from order revenues" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, response);
        }
    })

}


exports.getPendingTackingDetailsPage = function (dbName, res, supplierId, accessToken, languageId, callback) {
    var orders;
    var orderDetails;
    async.auto({
        getOrders: function (cb) {
            getPendingTracking(dbName, res, supplierId, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getOrderDetails(dbName, res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrders', 'getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}


function getPendingTracking(dbName, res, supplierId, languageId, callback) {


    var sql = "select o.id order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address  ";
    sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and o.status = ? ";
    multiConnection[dbName].query(sql, [supplierId, 7], function (err, result) {
        if (err) {
            console.log("error from pending orders" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}


exports.getScheduledOrdersPage = function (dbName, res, supplierId, accessToken, languageId, callback) {
    var orders;
    var orderDetails;
    async.auto({
        getOrders: function (cb) {
            getScheduledOrders(dbName, res, supplierId, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getPendingTracking(dbName, res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrders', 'getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}


function getScheduledOrders(dbName, res, supplierId, languageId, callback) {

    var sql = "select o.status,o.id order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address";
    sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and o.status IN(?,?,?) ";
    multiConnection[dbName].query(sql, [supplierId, 1, 3, 4], function (err, result) {
        if (err) {
            console.log("error from pending orders" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}


exports.totalRevenue = function (request, reply) {
    //console.log("===============")
    var accessToken;
    var flag = 1; //  1:monthly , :2:yearly
    var languageId;
    var supplierId;
    var data = [], finalData = {}, supplierBranch = [];
    var date;
    var temp = {};
    var tempData = [];
    var month = 0;
    var year;
    console.log(request.body);
    async.auto({
        getValue: function (callback) {
            if (!(request.body.accessToken)) {
                var msg = "please provide accessToken";
                return sendResponse.sendErrorMessage(msg, reply, 400);
            }
            if (!(request.body.flag)) {
                var msg = "please enter flag for monthly or yearly";
                return sendResponse.sendErrorMessage(msg, reply, 400);
            }
            flag = request.body.flag;
            if (!(request.body.languageId)) {
                var msg = "please enter languageId";
                return sendResponse.sendErrorMessage(msg, reply, 400);

            }
            if ((request.body.flag == 1) && !(request.body.month)) {
                var msg = "please enter month";
                return sendResponse.sendErrorMessage(msg, reply, 400);
            }
            if (!(request.body.year)) {
                var msg = "please enter year";
                return sendResponse.sendErrorMessage(msg, reply, 400);
            }
            accessToken = request.body.accessToken;
            date = request.body.date;
            languageId = request.body.languageId;
            month = request.body.month;
            year = request.body.year;
            callback(null);
        },
        checkAccessToken: ['getValue', function (callback) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[request.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {

                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        callback(null);
                    } else {
                        if (languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, reply, 401);
                    }
                }
            })


        }],
        getSupplierBranch: ['checkAccessToken', function (callback) {
            getAllsupplierBranch(request.dbName, reply, supplierId, function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    // //console.log("....",result);
                    supplierBranch = result;
                    callback(null);
                }

            });

        }],
        getTotalRevenue: ['getSupplierBranch', function (callback) {
            var subId = supplierBranch;
            //console.log("....subId", subId);
            getRevenueSupplier(request.dbName, reply, subId, flag, month, year, function (err, result) {
                if (err) {
                    callback(err);
                } else {

                    finalData = result;
                    callback(null);
                }

            });
        }]

    }, function (err, result) {
        if (err) {
            var msg = err;
            return sendResponse.sendErrorMessage(msg, reply, 500);
        } else {
            return sendResponse.sendSuccessData(finalData, constant.responseMessage.SUCCESS, reply, 200);
        }

    })
}

function getRevenueSupplier(dbName, reply, supplierIds, flag, mm, yy, callback) {
    supplierIds = supplierIds.toString();
    if (flag == 1) // for month
    {
        var month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

        month = month.toString();
        var sql = " SELECT SUM(o.net_amount) as total_price ,  COUNT(o.id) as total_order , date(o.created_on) as date " +
            " FROM orders o " +
            " WHERE o.supplier_branch_id  IN(" + supplierIds + ") AND MONTH(created_on) = ? AND YEAR(created_on) = ?  " +
            " AND DAY(o.created_on)  IN (" + month + ") " +
            " GROUP BY date(o.created_on) ";
        //   console.log(sql);
        multiConnection[dbName].query(sql, [mm, yy], function (err, result) {
            if (err) {
                var msg = "some thing went wrong while getting revenue ";
                console.log("errrrr", err);
                sendResponse.sendErrorMessage(msg, reply, 500);
            }
            else {
                //console.log(".....", result);
                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        (function (i) {
                            result[i].date = moment(result[i].date).format('D MMMM YYYY');
                            if (i == result.length - 1) {
                                var data = { "monthly": result };
                                callback(null, data);
                            }

                        }(i))

                    }
                }
                else {
                    var data = { "monthly": result }
                    callback(null, data);
                }
            }

        })

    }
    else if (flag == 2)  // yearly
    {
        var month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        month = month.toString();

        var sql = " SELECT SUM(o.net_amount) as total_price ,  COUNT(DISTINCT(o.id)) as total_order   , MONTH(o.created_on) as month " +
            " FROM orders o " +
            " WHERE o.supplier_branch_id  IN(" + supplierIds + ") AND MONTH(created_on) IN (" + month + ") AND YEAR(created_on) = ?  " +
            " GROUP BY MONTH(o.created_on) ";
        //console.log(sql);
        multiConnection[dbName].query(sql, [yy], function (err, result) {
            if (err) {
                var msg = "some thing went wrong while getting revenue ";
                console.log("errrrr", err);
                sendResponse.sendErrorMessage(msg, reply, 500);
            }
            else {
                var data = { "yearly": result };
                callback(null, data);
            }

        })

    }
}

function getAllsupplierBranch(dbName, reply, supplierId, callback) {

    var sql = " select id from supplier_branch where supplier_id =  ? ";
    multiConnection[dbName].query(sql, [supplierId], function (err, result) {
        if (err) {
            var msg = "some thing went wrong ";
            console.log("errrrr", err);
            sendResponse.sendErrorMessage(msg, reply, 500);

        }
        else {
            var data = [];
            for (var i = 0; i < result.length; i++) {
                (function (i) {
                    data.push(result[i].id);

                })(i);
            }

            callback(null, data);
        }

    });

}


function saveNoticationData(dbName, res, userId, supplierId, orderId, status, message, callback) {
    var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status) values(?,?,?,?,?) ";
    multiConnection[dbName].query(sql, [userId, supplierId, orderId, message, status], function (err, result) {

        console.log("...........notifivation sdave ..........", err, result);
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })

}


function supplierSubscriptionPrice(cb) {
    var now = moment(new Date()); //todays date
    var day = now.format("MM");
    var date = now.format("YYYY-MM-DD ")
    var data = [], temp = [];

    async.auto({
        getSupplierSub: function (callback) {
            var sql = " select created_by,supplier_id , jan_price as January , feb_price as February ,march_price as March ,april_price as April ,may_price as May ,june_price as Jun ,july_price as July ,aug_price as  August ,sep_price as September , oct_price as October , nov_price as November , dec_price as December from supplier_subscription where  DATE(start_date) <= " + "'" + date + "'" + " <= DATE(end_date) ";
            //console.log(sql)
            multiConnection[dbName].query(sql, function (err, result) {
                if (err)
                    console.log("....err", err);
                else {
                    // console.log("...",result);
                    data = result;
                    callback(null);
                }

            })
        },
        accountUpdate: ['getSupplierSub', function (callback) {
            for (var i = 0; i < data.length; i++) {
                (function (i) {
                    async.auto({
                        checkAccount: function (callback) {
                            var sql = " select * from account_receivable where supplier_id = ? and created_date =  ? ";
                            multiConnection[dbName].query(sql, [data[i].supplier_id, date], function (err, result) {
                                if (err)
                                    console.log(err);
                                else {
                                    temp = result;
                                    callback(null);
                                }
                            })
                        },
                        updateAccount: ['checkAccount', function (callback) {
                            var now = moment(new Date()); //todays date
                            var month = now.format('MMM').toString();
                            var val = 0;

                            if (month == 'January') {
                                val = data[i].January

                            }
                            if (month == 'February') {
                                val = data[i].February;

                            }
                            if (month == 'March') {
                                val = data[i].March;

                            }
                            if (month == 'April') {
                                val = data[i].April;

                            }
                            if (month == 'May') {
                                val = data[i].May;
                            }
                            if (month == 'Jun') {
                                val = data[i].Jun;

                            }
                            if (month == 'July') {
                                val = data[i].July;

                            }
                            if (month == 'August') {
                                val = data[i].August;

                            }
                            if (month == 'September') {
                                val = data[i].September;

                            }
                            if (month == 'October') {
                                val = data[i].October;

                            }
                            if (month == 'November') {
                                val = data[i].November;

                            }
                            if (month == 'December') {
                                val = data[i].December;

                            }
                            if (temp.length) {

                                var sql = " update account_receivable set total_amount += ?  , amount_left += ?  where supplier_id = ? "
                                multiConnection[dbName].query(sql, [val, val], function (err, result) {
                                    if (err)
                                        console.log("..........", err);
                                    else {
                                        //console.log(".....", result);

                                        if (i == data.length - 1) {
                                            callback(null);

                                        }
                                    }
                                });
                            }
                            else {
                                //console.log("-----------val---------", val)

                                var sql = " insert into account_receivable (supplier_id,admin_id,total_amount , amount_left ) values(?,?,?,?)"
                                multiConnection[dbName].query(sql, [data[i].supplier_id, data[i].created_by, val, val], function (err, result) {
                                    if (err)
                                        console.log("....in account......", err);
                                    else {
                                        //console.log(".....", result);

                                        if (i == data.length - 1) {
                                            callback(null);

                                        }
                                    }
                                });
                            }
                        }]


                    }, function (err, resultr) {
                        if (err)
                            console.log(err)
                        else
                            callback(null);
                    });

                })(i)
            }
        }],
        account_sub_update: ['getSupplierSub', function (callback) {
            for (var j = 0; j < data.length; j++) {
                (function (j) {
                    var now = moment(new Date()); //todays date
                    var month = now.format('MMM').toString();
                    var val1 = 0;


                    if (month == 'January') {
                        val1 = data[j].January

                    }
                    if (month == 'February') {
                        val1 = data[j].February;

                    }
                    if (month == 'March') {
                        val1 = data[j].March;

                    }
                    if (month == 'April') {
                        val1 = data[j].April;

                    }
                    if (month == 'May') {
                        val1 = data[j].May;
                    }
                    if (month == 'Jun') {
                        //console.log("-------in JUNE--------------")
                        val1 = data[j].Jun;

                    }
                    if (month == 'July') {
                        val1 = data[j].July;

                    }
                    if (month == 'August') {
                        val1 = data[j].August;

                    }
                    if (month == 'September') {
                        val1 = data[j].September;

                    }
                    if (month == 'October') {
                        val1 = data[j].October;

                    }
                    if (month == 'November') {
                        val1 = data[j].November;

                    }
                    if (month == 'December') {
                        val1 = data[j].December;

                    }
                    //console.log("--------val1-------", val1)
                    var query = " insert into  account_receivable_subscriptions (supplier_id,service_type,amount) values(?,?,?) "
                    multiConnection[dbName].query(query, [data[j].supplier_id, 0, val1], function (err, result) {
                        if (err)
                            console.log(err)
                        else {
                            callback(null);
                        }

                    })


                })(j);
            }
        }]


    }, function (err, result) {
        if (err)
            console.log(".............", err);
        else {
            //console.log("...................", result);
            cb(null);

        }
    });
}

exports.changeStatusOrder = function (request, reply) {
    var orderId;
    var supplierId;
    var status;
    var oldStatus = 0;
    var accessToken;
    var temp_value = 0;
    var deviceToken = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierName;
    var notificationStatus;
    var notificationLanguage;
    var offset = request.body.offset != undefined && request.body.offset != "" && request.body.offset != null ? request.body.offset : 4

    async.auto({
        getValue: function (cb) {
            if (!(request.body.accessToken)) {
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                accessToken = request.body.accessToken;
            }

            if (!(request.body.orderId)) {
                var msg = "order id  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                orderId = request.body.orderId;
            }
            if (!(request.body.status)) {
                var msg = "status  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                status = request.body.status;
            }
            cb(null);
        },
        checkAccessToken: ['getValue', function (cb) {
            var sql = "select id from supplier where access_token =?";
            multiConnection[request.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null);
                    } else {
                        cb("invalid access token")
                    }
                }
            })
        }],
        getStatus: ['checkAccessToken', function (cb) {
            var sql1 = 'select status from orders where id = ?';
            multiConnection[request.dbName].query(sql1, [orderId], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if (result.length) {
                        oldStatus = result[0].status;
                    }
                    cb(null);
                }
            })
        }],
        changeStatus: ['getStatus', function (cb) {
            var datexvc = new Date();
            if (oldStatus == 5) {
                temp_value = 1;
                return cb(null);
            }

            if (status == 3) {
                var sql = "update orders set status = ? , shipped_on = ? where id = ? ";
                multiConnection[request.dbName].query(sql, [status, datexvc, orderId], function (err, result) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null);
                    }
                })
            }
            else if (status == 4) {
                if (oldStatus == 1) {
                    var sql = "update orders set status = ? , near_on = ? ,shipped_on = ? where id = ? ";
                    multiConnection[request.dbName].query(sql, [status, datexvc, datexvc, orderId], function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                } else if (oldStatus == 3) {
                    var sql = "update orders set status = ? , near_on = ?  where id = ? ";
                    multiConnection[request.dbName].query(sql, [status, datexvc, orderId], function (err, result) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                }
            }
            else if (status == 5) {
                if (oldStatus == 1) {
                    var sql = "update orders set status = ? , near_on = ? ,shipped_on = ?,delivered_on = ? where id = ? ";
                    multiConnection[request.dbName].query(sql, [status, datexvc, datexvc, datexvc, orderId], function (err, result) {
                        console.log("....status............5............");

                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                } else if (oldStatus == 3) {
                    var sql = "update orders set status = ? , near_on = ?,delivered_on = ? where id = ? ";
                    multiConnection[request.dbName].query(sql, [status, datexvc, datexvc, orderId], function (err, result) {
                        console.log("....status............5............");

                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                } else if (oldStatus == 4) {
                    var sql = "update orders set status = ? ,delivered_on = ? where id = ? ";
                    multiConnection[request.dbName].query(sql, [status, datexvc, orderId], function (err, result) {
                        console.log("....status............5............");

                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null);
                        }
                    })
                }
            }
        }],
        orderLoyalityPoints: ['changeStatus', function (cb) {

            console.log("..statsus...........", status, orderId);

            if (status == 5 && temp_value == 0) {
                console.log("...vsdfvgbdshvdshjkgvbjkfddff.g..........................");
                orderFunc.deliveredOrder(request.dbName, reply, orderId, status, offset, function (err, result) {
                    console.log("..............result...........csvfbdfvb.........", err, result);
                    if (err) {
                        cb(err);
                    } else {
                        cb(null);
                    }
                })
            } else {
                cb(null);
            }
        }],
        /* notificationData: ['orderLoyalityPoints', function (cb) {
             if(status == 5){
                 adminOrders.getValue(reply, orderId, function (err, values) {
                     if (err) {
                         sendResponse.somethingWentWrongError(reply);
                     }
                     else {
                         deviceToken = values.device_token;
                         userId = values.user_id;
                         deviceType = values.device_type;
                         supplierId = values.supplier_id;
                         supplierName = values.supplier_name;
                         notificationLanguage = values.notification_language;
                         notificationStatus = values.notification_status;
                         cb(null);
                     }
                 });
             }
             else {
                 cb(null)
             }
 
         }],
         sendPushNotification: ['notificationData', function (cb) {
 
             if(status==5){
                 if (notificationStatus == 0) {
                     return cb(null);
                 }
                 else {
                     if (deviceType == 0) {
                         if (notificationLanguage == 14) {
                             var data = {
                                 "status": 0,
                                 "message":" Your Order Has been Delivered",
                                 "orderId":orderId
 
                             }
                         }
                         else {
                             var data = {
                                 "status": 0,
                                 "message": "وقد تم تسليم طلبك",
                                 "orderId":orderId
 
                             }
                         }
                         message = data.message;
                         console.log("......",message);
                         pushNotifications.sendAndroidPushNotification(deviceToken,data, function (err, result) {
                             if (err) {
                                 var msg = "something went wrong";
                                 return sendResponse.sendErrorMessage(msg, reply, 500);
                             }
                             else {
                                 cb(null);
                             }
                         });
                     }
                     else {
                         if (notificationLanguage == 14) {
                             var data = {
                                 "status": 0,
                                 "message":" Your Order Has been Delivered",
                                 "orderId":orderId
 
                             }
                         }
                         else {
                             var data = {
                                 "status": 0,
                                 "message": "وقد تم تسليم طلبك",
                                 "orderId":orderId
 
                             }
                         }
                         var path = "user";
                         var sound = "ping.aiff";
 
                         console.log("........................send ios");
 
 
                         pushNotifications.sendIosPushNotification(deviceToken, data, path,sound ,function (err, result) {
                             if (err) {
                                 var msg = "something went wrong";
                                 return sendResponse.sendErrorMessage(msg, reply, 500);
                             }
                             else {
                                 cb(null);
                             }
                         });
                     }
                 }
             }
             else {
                 cb(null)
             }
         }],
         savePushNotification: ['sendPushNotification', function (cb) {
             if(status==5){
                 if (notificationStatus == 0) {
                     cb(null);
                 }
                 else {
                     if(notificationLanguage ==14){
                         adminOrders.saveNoticationData(reply, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_DELIVERED,constant.pushNotificationMessage.ORDER_DELIVERED_ENGLISH, cb)
                     }
                     else {
                         adminOrders.saveNoticationData(reply, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_DELIVERED,constant.pushNotificationMessage.ORDER_DELIVERED_ARABIC, cb)
                     }
                 }
             }
             else {
                 cb(null);
             }
 
         }]*/
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(reply);
        } else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
        }
    })
}

exports.supplierSubscriptionPrice = supplierSubscriptionPrice;


function setCommission(dbName, res, result1, callback) {
    var data = result1;
    var comm = data.category_id;
    var commission = [];
    var sql1 = 'select distinct(sc.commission) as commission from supplier_category sc join supplier s on sc.supplier_id = s.id where sc.onOffComm = 1 and sc.category_id = ? and sc.commission_type = 1  and s.commisionButton = 1 order by sc.commission DESC LIMIT 0,3'
    multiConnection[dbName].query(sql1, [comm], function (err, result) {
        console.log("eee.....ee..", result);
        if (err) {
            console.log("1....", err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (!(result[0])) {
                result.push({ 'commission': 0 });
            }
            if (!(result[1])) {
                result.push({ 'commission': 0 });
            }
            if (!(result[2])) {
                result.push({ 'commission': 0 });
            }
            if (result[0].commission == data.commission) {
                callback(null, 2, result);
            }
            else if (result[1].commission == data.commission) {
                callback(null, 0, result);
            }
            else if (result[2].commission == data.commission) {
                callback(null, 1, result);
            }
            else {
                callback(null, 3, result);
            }
        }
    })
}

exports.changeSupplierStatus = function (request, reply) {
    var orderId;
    var supplierId;
    var status;
    var oldStatus = 0;
    var accessToken;
    async.auto({
        getValue: function (cb) {
            if (!(request.body.accessToken)) {
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                accessToken = request.body.accessToken;
            }
            if (!(request.body.status)) {
                var msg = "status  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                status = request.body.status;
            }
            cb(null);
        },
        checkAccessToken: ['getValue', function (cb) {
            var sql = "select id from supplier where access_token =?";
            multiConnection[request.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null);
                    } else {
                        cb("invalid access token")
                    }
                }
            })
        }],
        changeStatus: ['checkAccessToken', function (cb) {
            var day = moment().isoWeekday();
            day = day - 1;
            console.log("status.....", day);
            var sql = 'update supplier s join supplier_timings st on s.id=st.supplier_id set s.status = ?,st.is_open = ? ' +
                'where s.id= ? and st.week_id = ?';
            multiConnection[request.dbName].query(sql, [status, status, supplierId, day], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null);
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(reply);
        } else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
        }
    })
}

exports.orderDetails = function (request, reply) {
    var orderId = 0;
    var languageId = 0;
    var supplierId;
    var accessToken;
    var data = []
    async.auto({
        getValue: function (cb) {
            if (!(request.body.accessToken)) {
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                accessToken = request.body.accessToken;
            }
            if (!(request.body.orderId)) {
                var msg = "orderId  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                orderId = request.body.orderId;
            }
            if (!(request.body.languageId)) {
                var msg = "languageId  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                languageId = request.body.languageId;
            }
            cb(null);
        },
        checkAccessToken: ['getValue', function (cb) {
            var sql = "select id from supplier where access_token =?";
            multiConnection[request.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null);
                    } else {
                        cb("invalid access token")
                    }
                }
            })
        }],
        orderDescription: ['checkAccessToken', function (cb) {
            supplierExtranet.orderDescription(request.dbName, reply, orderId, languageId, function (err, result) {
                if (err) {
                    console.log("er....", err);
                    cb(err);
                }
                else {
                    data = result;
                    cb(null)
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            console.log("err", err);
            sendResponse.somethingWentWrongError(reply);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, reply, 200);
        }
    })
}

exports.orderDescription = function (dbName, res, orderId, languageId, callback) {
    var data = {};
    var data1;
    async.auto({
        orderDetail1: function (cb) {
            var sql = "select o.urgent as urgent_type,o.preparation_time,o.urgent_price,o.id as order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date as delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address,o.remarks ";
            sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.id = ?";
            multiConnection[dbName].query(sql, [orderId], function (err, result) {
                if (err) {
                    console.log("error from orders descriptions" + err);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    if (result.length) {
                        data1 = result;

                    }
                    cb(null);
                }

            })
        },
        orderDetail2: ['orderDetail1', function (cb) {
            var sql = "select p.product_id,pp.category_id,pp.bar_code,pi.image_path,pi.image_path as image,o.price,o.price as product_amount,o.quantity,p.name,p.name as product_name,p.measuring_unit from order_prices o join product_ml p ";
            sql += " on o.product_id = p.product_id  join product_image pi on pi.product_id = p.product_id join product pp on pp.id=p.product_id where o.order_id = ? and pi.imageOrder=1 and p.language_id = ?";
            multiConnection[dbName].query(sql, [orderId, languageId], function (err, result) {
                if (err) {
                    console.log("error from order details" + err);
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    if (result.length) {
                        data1[0].order_details = result;
                        data = data1;
                    }

                    cb(null);
                }

            })
        }]
    }, function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, data);
        }
    })

}



exports.userCancelOrder = function (req, res) {
    var accessToken;
    var languageId;
    var supplierId;
    var details = {};
    async.auto({
        checkValues: function (cb) {
            if (!req.body.accessToken) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.accessToken && req.body.languageId) {
                accessToken = req.body.accessToken;
                languageId = req.body.languageId;
                cb(null);
            }
            else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }

        },
        validateAccessToken: ['checkValues', function (cb) {
            var sql = " select id from supplier where access_token = ? limit 1";
            multiConnection[req.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null, result[0].id);
                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })

        }],
        getPendingOrderDetails: ['validateAccessToken', function (cb) {
            supplierExtranet.getCancelOrdersPageData(req.dbName, res, supplierId, accessToken, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = response;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })

}

exports.getCancelOrdersPageData = function (dbName, res, supplierId, accessToken, languageId, callback) {
    var orders;
    var orderDetails;
    async.auto({
        getOrders: function (cb) {
            getcancelOrders(dbName, res, supplierId, languageId, function (err, response) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orders = response;
                    cb(null);

                }

            });
        },
        getOrderDetails: ['getOrders', function (cb) {
            getPendingTracking(dbName, res, languageId, function (err, result) {
                if (err) {
                    var msg = "something went wrong";
                    return sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    orderDetails = result;
                    cb(null);
                }

            });
        }],
        clubOrderData: ['getOrders', 'getOrderDetails', function (cb) {
            clubOrderData(res, orders, orderDetails, cb);
        }]
    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            return sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            var data = {};
            data.access_token = accessToken;
            data.details = response.clubOrderData;
            callback(null, data)
        }

    })

}

function getcancelOrders(dbName, res, supplierId, languageId, callback) {


    var sql = "select o.id as order_id,o.created_on,o.delivery_charges,CONCAT(u.firstname, ' ',u.lastname) user_name,o.net_amount,ua.customer_address,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date as delivery_date,o.handling_admin,o.handling_supplier,u.mobile_no,ua.address_link,o.payment_type,o.pickup_time,o.pickup_date,o.user_pickup_address ";
    sql += " from orders o join user u on o.user_id = u.id join user_address ua on o.user_delivery_address = ua.id where o.supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and o.status = ? and o.is_acknowledged=0 ";
    multiConnection[dbName].query(sql, [supplierId, 8], function (err, result) {
        if (err) {
            console.log("error from pending orders" + err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, result);
        }

    })

}

function getcancelOrdersByUser(dbName, res, supplierId, callback) {
    var sql = "select COUNT(*) as cancel_orders from orders where supplier_branch_id IN ";
    sql += " (select id from supplier_branch where supplier_id = ?) and status =? and  is_acknowledged=0";
    multiConnection[dbName].query(sql, [supplierId, 8], function (error, reply) {
        if (error) {
            console.log("error from getSupplierTomorrowOrders" + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].cancel_orders);
        } else {
            callback(null, 0);
        }
    })
}


exports.acknowledgeCancelOrder = function (request, reply) {
    var orderId;
    var supplierId;
    var status;
    var accessToken;
    console.log("req.body...", request.body)
    async.auto({
        getValue: function (cb) {
            if (!(request.body.accessToken)) {
                var msg = "accessToken  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                accessToken = request.body.accessToken;
            }

            if (!(request.body.orderId)) {
                var msg = "order id  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                orderId = request.body.orderId;
            }
            if (!(request.body.status)) {
                var msg = "status  not found"
                return sendResponse.sendErrorMessage(msg, reply, 400);
            } else {
                status = request.body.status;
            }
            cb(null);
        },
        checkAccessToken: ['getValue', function (cb) {
            console.log("access....", accessToken);
            var sql = "select id from supplier where access_token =?";
            multiConnection[request.dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    cb(err);
                }
                else {
                    if (result.length) {
                        supplierId = result[0].id;
                        cb(null);
                    } else {
                        cb("invalid access token")
                    }
                }
            })
        }],
        changeStatus: ['checkAccessToken', function (cb) {
            console.log("status", status, orderId);
            status = parseInt(status);
            var sql = 'update orders set is_acknowledged = ? where id = ?';
            multiConnection[request.dbName].query(sql, [status, orderId], function (err, result) {
                if (err) {
                    console.log("er...", err);
                    cb(err);
                }
                else {
                    cb(null);
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(reply);
        } else {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, 200);
        }
    })
}


exports.supplierPayoutRequest = function (req, res) {

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    // var order_ids = req.body.order_ids
    // var orderIds = order_ids.split(',');
    var orderData = req.body.order_data;
    var payable_amount = 0;
    var type = "2";
    var supplier_id = req.supplier.supplier_id
    var manValue = [accessToken, authSectionId]
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        async function (cb) {
            try {

                //var values = orderIds.map(orderId => [type, supplier_id, orderId,payable_amount])
                var values = orderData.map(order_data => [type, supplier_id, order_data.order_id, order_data.amount])
                var sql = "insert into agent_supplier_payouts(`type`,`agent_supplier_id`,`order_id`,`payable_amount`) values ?"
                await ExecuteQ.Query(req.dbName, sql, [values])
                cb(null)
            }
            catch (Err) {
                logger.debug("===Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        }
    ], function (err1, reponse1) {
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

}