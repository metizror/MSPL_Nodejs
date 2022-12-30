/**
 * Created by cbl101 on 11/3/16.
 */

var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var loginCases = require('./loginCases');
var supplierReg = require('./supplierReg');
var dataGather = require('./dataGathering');
var _ = require('underscore');
var  executeQ = require('../lib/Execute')
var UniversalFunction = require('../util/Universal')
var log4js=require("log4js")
var logger = log4js.getLogger();
var moment = require('moment');
logger.level = 'debug';
let emailTemp=require('../routes/email')

const pushNotifications = require('./pushNotifications');
const Universal = require('../util/Universal');

exports.listSubAndDetailedSubCategories = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var manValues = [accessToken, sectionId,categoryId];
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
               getSubAndDetailedCategory(req.dbName,res,categoryId,cb);
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
 * This function is used to get the list of dump data
 * Parameters: accessToken,sectionId
 *  Output : List of dump data
 */



exports.getDumpSupplierList = function (req, res) {
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
                getDumpSuppliers(req.dbName,res, cb);
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
 * This function is used to get the dump details of particular
 * supplier
 * Parameters: accessToken,sectionId,supplier dump id
 *  Output : dump details
 */
exports.dumpDetailsOfSupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierDumpId = req.body.supplierDumpId;
    var manValues = [accessToken, sectionId, supplierDumpId];
    //console.log(manValues + "request parameters");
    var fullDetails;

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
                getDumpData(req.dbName,res, supplierDumpId, cb);
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


function getDumpData(dbName,res, supplierDumpId, callback) {
    var zones;
    async.auto({
        supplier: function (cb) {
            getDumpDetails(dbName,res, supplierDumpId, cb);
        },
        deliveryZones: function (cb) {
            getDeliveryZoneDetails(req.dbName,res, supplierDumpId, function (err, result) {
                zones = result;
                //console.log(zones)
                cb(null);

            });
        },
        deliveryAreas: ['deliveryZones', function (cb) {
            getDeliveryAreaDetails(req.dbName,res, supplierDumpId, zones, cb);
        }],
        category: function (cb) {
            getCategoriesForDumpSupplier(req.dbName,res, supplierDumpId, cb)
        },
        categoryFormatting: ['supplier', 'category', function (cb, result) {

            //console.log("herr", result)
            clubDataForDump(res, cb, result);
        }],
        three: ['supplier', 'deliveryAreas', 'category', 'categoryFormatting', function (cb, result) {
            clubDataForSingleDumpSupplier(res, cb, result);
        }]
    }, function (error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result.three);

        }

    })


}


/*
 * This function deletes the data of supplier from dump table
 * supplier
 * Parameters: accessToken,sectionId,supplier dump id
 *  Output : success/error
 */
exports.deleteDumpDataOfSupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierDumpId = req.body.supplierDumpId;
    var manValues = [accessToken, sectionId, supplierDumpId];
//    console.log(manValues + "request parameters")

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
                deleteDumpDataOfSupplier(req.dbName,res, supplierDumpId, cb);
            },
        ], function (error, callback) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.DELETE_DUMP_DATA, res, constant.responseStatus.SUCCESS);
            }


        }
    );

}

/*
 This function is used to get the dump details of
 a particular supplier based on his dump id

 */
function getDumpDetails(dbName,res, supplierDumpId, callback) {
    var sql = "select * from supplier_dump where id = ? limit 1"
    multiConnection[dbName].query(sql, [supplierDumpId], function (err, result) {
        if (err) {
            console.log("errrr in dump", err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);

        }

    })
}


/*
 This function is used to get the added delivery areas of dump
 supplier

 */
function getDeliveryAreaDetails(dbName,res, supplierDumpId, zones, callback) {
    var sql = "select s.delivery_charges,s.min_order,s.charges_below_min_order,c.name country_name,ct.name city_name,z.name zone_name, a.name area_name,z.id zone_id from supplier_delivery_area_dump s ";
    sql += " join country c on c.id = s.country join city ct on ct.id = s.city join zone z on z.id = s.zone join area a on a.id = s.area";
    sql += " where  s.dump_supplier_id = ?";
    multiConnection[dbName].query(sql, [supplierDumpId], function (err, result) {
        if (err) {
            console.log("errrr in delivery areas", err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var areasLength = result.length;
            var zonesLength = zones.length;
            for (var i = 0; i < zonesLength; i++) {
                (function (i) {
                    var areas = []
                    for (var j = 0; j < areasLength; j++) {
                        (function (j) {
                            if (zones[i].zone_id == result[j].zone_id) {
                                areas.push({
                                    "area_name": result[j].area_name,
                                    "delivery_charges": result[j].delivery_charges,
                                    "min_order": result[j].min_order,
                                    "charges_below_min_order": result[j].charges_below_min_order
                                })
                                if (j == areasLength - 1) {
                                    zones[i].zone_details = areas;
                                    if (i == zonesLength - 1) {
                                        callback(null, zones);
                                       // console.log("zones", zones)
                                    }
                                }
                            }
                            else {
                                if (j == areasLength - 1) {
                                    zones[i].zone_details = areas;
                                    if (i == zonesLength - 1) {
                                        callback(null, zones);
                                      //  console.log("zones", zones)
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


function getDeliveryZoneDetails(dbName,res, supplierDumpId, callback) {
    var sql = "select z.name zone_name,s.zone zone_id from supplier_delivery_area_dump s ";
    sql += " join zone z on z.id = s.zone ";
    sql += " where  s.dump_supplier_id = ? group by s.zone ";
    multiConnection[dbName].query(sql, [supplierDumpId], function (err, result) {
        if (err) {
            console.log("errrr in delivery zones", err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })
}


function getCategoriesForDumpSupplier(dbName,res, supplierDumpId, callback) {
    var sql = "select d.dump_supplier_id,d.category_id,d.sub_category_id,d.detailed_sub_category_id,c.name category_name,";
    sql += " sc.name sub_cat_name, dsc.name detailed_sub_cat_name from  dump_category d left join categories c on ";
    sql += " d.category_id = c.id  left join categories sc on d.sub_category_id = sc.id left join categories dsc ";
    sql += " on d.detailed_sub_category_id = dsc.id where d.dump_supplier_id = ?";
    multiConnection[dbName].query(sql, [supplierDumpId], function (err, categories) {
        if (err) {
            console.log("errrr in categories", err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, categories);
        }

    })

}


function clubDataForSingleDumpSupplier(res, callback, result) {

    var deliveryData = result.deliveryAreas;
    var supplierData = result.supplier;
    var categoryData = result.categoryFormatting;
    // console.log(categoryData)
    var categories = categoryData[0].category_data;
    // console.log("categories" +categories);
    // console.log("delivery areas "+ deliveryData);


    supplierData[0].delivery_areas = deliveryData;
    supplierData[0].category_data = categories;

    callback(null, supplierData);

}


function deleteDumpDataOfSupplier(dbName,res, supplierDumpId, callback) {
    var sql = "delete from supplier_dump where id = ? limit 1"
    multiConnection[dbName].query(sql, [supplierDumpId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, []);

        }

    })
}


/*
 This function is used to list of dump suppliers
 */
function getDumpSuppliers(dbName,res, callback) {
    async.auto({
        supplier: function (cb) {

            getDumpInformation(dbName,res, cb);
        },
        category: function (cb) {

            getDumpCategoryData(dbName,res, cb);
        },
        three: ['supplier', 'category', function (cb, result) {

            clubDataForDump(res, cb, result);

        }]
    }, function (error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result.three);

        }

    })

}

function getDumpInformation(dbName,res, callback) {

    var sql = "select `supplier_name`,`id`,`supplier_email`,`address`,`primary_mobile`,`status`,`category_ids` from supplier_dump where dump_complete_status = ? ";
    multiConnection[dbName].query(sql, [1], function (err, suppliers) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, suppliers);
        }

    })
}

function getDumpCategoryData(dbName,res, callback) {
    var sql = "select d.dump_supplier_id,d.category_id,d.sub_category_id,d.detailed_sub_category_id,c.name category_name,";
    sql += " sc.name sub_cat_name, dsc.name detailed_sub_cat_name from  dump_category d left join categories c on ";
    sql += " d.category_id = c.id  left join categories sc on d.sub_category_id = sc.id left join categories dsc ";
    sql += " on d.detailed_sub_category_id = dsc.id order by d.dump_supplier_id,d.category_id,d.sub_category_id,d.detailed_sub_category_id";
    multiConnection[dbName].query(sql, function (err, categories) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, categories);
        }

    })
}


function clubDataForDump(res, callback, result) {
    var suppliers = result.supplier;
    var categories = result.category;
    var supplier = [];
    var supplierLength = suppliers.length;
    var x = 0;
    var y = 0;
    var z = 0;
    var exception = {};
    if (supplierLength == 0) {
        callback(null, supplier);
    }
    else {

        for (var i = 0; i < supplierLength; i++) {
            (function (i) {
                var categoriesLength = categories.length;
                var category = [];
                var supplierCheck = false;
                try {
                    for (var j = x; j < categoriesLength; j++) {
                        (function (j) {
                            if (suppliers[i].id == categories[j].dump_supplier_id) {
                                x++;
                                supplierCheck = true;
                                var subCategoryLength = categories.length;
                                var subCategories = [];
                                var subCategoryCheck = false;
                                try {

                                    for (var k = y; k < subCategoryLength; k++) {

                                        (function (k) {

                                            if (categories[j].category_id == categories[k].category_id && categories[j].dump_supplier_id == categories[k].dump_supplier_id && suppliers[i].id == categories[j].dump_supplier_id && suppliers[i].id == categories[k].dump_supplier_id) {
                                                y++;
                                                subCategoryCheck = true;
                                                var detailedSubCategoryLength = categories.length;
                                                var detailedSubCategories = [];
                                                var detailedCheck = false;
                                                try {
                                                    for (var l = z; l < detailedSubCategoryLength; l++) {
                                                        (function (l) {

                                                            if (categories[j].category_id == categories[k].category_id && categories[j].dump_supplier_id == categories[k].dump_supplier_id && suppliers[i].id == categories[j].dump_supplier_id && suppliers[i].id == categories[k].dump_supplier_id && categories[k].sub_category_id == categories[l].sub_category_id && categories[k].dump_supplier_id == categories[l].dump_supplier_id && suppliers[i].id == categories[l].dump_supplier_id) {
                                                                z++;
                                                                detailedCheck = true;
                                                                if (categories[l].sub_category_id != 0) {

                                                                    if (categories[l].detailed_sub_category_id != 0) {
                                                                        detailedSubCategories.push({
                                                                            "detailed_sub_cat_id": categories[l].detailed_sub_category_id,
                                                                            "name": categories[l].detailed_sub_cat_name
                                                                        });
                                                                        if (l == detailedSubCategoryLength - 1) {

                                                                            subCategories.push({
                                                                                "sub_category_id": categories[k].sub_category_id,
                                                                                "name": categories[k].sub_cat_name,
                                                                                "category_data": detailedSubCategories
                                                                            });
                                                                            throw exception;
                                                                        }
                                                                    }
                                                                    else {
                                                                        if (l == detailedSubCategoryLength - 1) {

                                                                            subCategories.push({
                                                                                "sub_category_id": categories[k].sub_category_id,
                                                                                "name": categories[k].sub_cat_name,
                                                                                "category_data": detailedSubCategories
                                                                            });
                                                                            throw exception;
                                                                        }
                                                                    }

                                                                }

                                                            }
                                                            else {
                                                                if (detailedCheck && l == detailedSubCategoryLength - 1) {
                                                                    subCategories.push({
                                                                        "sub_category_id": categories[k].sub_category_id,
                                                                        "name": categories[k].sub_cat_name,
                                                                        "category_data": detailedSubCategories
                                                                    });
                                                                    throw exception;
                                                                }


                                                            }

                                                        }(l))

                                                    }
                                                }
                                                catch (e) {
                                                  //  console.log(e);
                                                }

                                                if (k == subCategoryLength - 1) {
                                                    category.push({
                                                        "category_id": categories[j].category_id,
                                                        "name": categories[j].category_name,
                                                        "category_data": subCategories
                                                    });
                                                    throw exception;
                                                }
                                            }
                                            else {
                                                if (subCategoryCheck && k == subCategoryLength - 1) {
                                                    category.push({
                                                        "category_id": categories[j].category_id,
                                                        "name": categories[j].category_name,
                                                        "category_data": subCategories
                                                    });
                                                    throw exception;
                                                }
                                            }

                                        }(k))
                                    }

                                }
                                catch (e) {
                                  //  console.log(e);
                                }
                                if (j == categoriesLength - 1) {
                                    var non_duplicated_data = _.uniq(category, 'category_id');

                                    supplier.push({
                                        "supplier_name": suppliers[i].supplier_name,
                                        "id": suppliers[i].id,
                                        "supplier_email": suppliers[i].supplier_email,
                                        "address": suppliers[i].address,
                                        "primary_mobile": suppliers[i].primary_mobile,
                                        "status": suppliers[i].status,
                                        "category_ids": suppliers[i].category_ids,
                                        "category_data": non_duplicated_data

                                    });
                                    throw exception;
                                }

                            }
                            else {
                                if (supplierCheck && j == categoriesLength - 1) {
                                    var non_duplicated_data = _.uniq(category, 'category_id');

                                    supplier.push({
                                        "supplier_name": suppliers[i].supplier_name,
                                        "id": suppliers[i].id,
                                        "supplier_email": suppliers[i].supplier_email,
                                        "address": suppliers[i].address,
                                        "primary_mobile": suppliers[i].primary_mobile,
                                        "status": suppliers[i].status,
                                        "category_ids": suppliers[i].category_ids,
                                        "category_data": non_duplicated_data

                                    });
                                    throw exception;
                                }

                            }

                        }(j))

                    }
                }
                catch (e) {
                  //  console.log(e);
                }

                if (i == supplierLength - 1) {
                    callback(null, supplier);
                }

            }(i))

        }
    }
}


/*
 * This function is used to reg supplier
 * Parameters: accessToken,authSectionId
 *              categoryIds,dumpSupplierId
 * supplierName,supplierAddress,supplierMobileNo
 * supplierEmail.
 */
module.exports.regSupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var categoryIds = req.body.categoryIds;
    var dumpSupplierId = req.body.dumpSupplierId;
    var supplierName = req.body.supplierName;
    var supplierAddress = req.body.supplierAddress;
    var supplierMobileNo = req.body.supplierMobileNo;
    var supplierEmail = req.body.supplierEmail;
    var manValue = [accessToken, authSectionId, supplierName, supplierAddress, supplierEmail, supplierMobileNo, categoryIds];
    var inputs = [supplierName, supplierEmail, supplierMobileNo, supplierAddress];
    var password;
    var adminId;
    var supplierInsertId;
    var supplierAdminId;
    var password2;
    var supplierAccessToken = func.encrypt(supplierEmail + new Date());
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb)
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;

            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);
        },
        function (cb) {
            checkSupplierEmailAvailability(req.dbName,res, cb, supplierEmail);
        },
        function (cb) {
            func.generateRandomString(cb);
        },
        function (pass, cb) {
            password = pass;
            password2 = md5(password);
            inputs.push(password2);
            inputs.push(adminId);
            
            registerSupplier(req.dbName,res, cb, inputs);
        },
        function (supplierInsertId1, cb) {
            supplierInsertId = supplierInsertId1;
            cb(null);
        },
        function (cb) {
            var sql = " insert into supplier_admin(email,phone_number,password,created_by_clikat)values(?,?,?,?)";
            multiConnection[dbName].query(sql, [supplierEmail,supplierMobileNo,password2,adminId], function (err, reply) {
                if (err) {
                    console.error(err)
                    sendResponse.somethingWentWrongError(res);
                } else {
                    cb(null);
                }
            })
        },
        function (cb) {
            inputs = null;
            var isSupplierSuperadmin = 1;
            inputs = [supplierEmail, md5(password), supplierMobileNo, isSupplierSuperadmin, adminId, supplierAccessToken, supplierInsertId];
            supplierAdminByClikat(req.dbName,res, cb, inputs, supplierInsertId);
        },
        function (insertId, cb) {
            supplierAdminId = insertId;
            
            dataGather.queryStringForDumpCategoryInsertion(cb, categoryIds, supplierInsertId);
        },
        function (values, querystring, cb) {
            
            insertSupplierInSupplierCategory(req.dbName,res, cb, querystring, values, supplierInsertId, supplierAdminId);
        },
        function (cb) {
            if(dumpSupplierId){
                var status = 1;
                changeSupplierStatusInDump(req.dbName,res, cb, dumpSupplierId, status);
            }
            else {
                cb(null);
            }
           
        },
        function (cb) {
            var subject = "New Supplier Registration";
            var content = "New Supplier Registration \n";
            content += "Congratulations you have been registered on royo \n\n";
            content += "Your login credentials are :\n\n";
            content +="Email: "+supplierEmail+"\n";
            content +="Password: "+password+"\n\n";
            content += " Regards \n";
            content += " Team royo";    
            emailTemp.supplierNewRegisteration(req,res,supplierEmail,password,function(err,result){
                if(err){
                    console.log("..****register email*****....",err);
                }
            });
            cb(null)
            // func.sendMailthroughSMTP(res, subject, supplierEmail, content, 1, cb);
        },
        function (cb) {
            insertNameInMultiLanguage(req.dbName,res, supplierName, 14, supplierInsertId, supplierAddress, cb);
        }
    ], function (error, response) {
        if (error) {
            console.error(error);
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

/*
 *This function is used to get list of reg supplier
 */
module.exports.getRegSupplierList = function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var manValue = [accessToken, authSectionId];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb)
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);
        },
        function (cb) {
            //loginCases.logInCases(res, [sectionIdFromFrontEnd], adminId, cb, filter1);
            //getRegSuppliers(res, cb);
            supplierReg.getRegSupplier(req.dbName,res, cb);
        }
    ], function (error, response) {
        if (error) {
            console.error(error);
            sendResponse.somethingWentWrongError(res);
        } else {
            //console.log("response" + JSON.stringify(response))
            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

/*
 * Too make supplier active or in-active
 */
module.exports.activeOrInActiveSupplier = function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var status = req.body.status.toString();
    var supplierId = req.body.supplierId;
    var manValue = [accessToken, authSectionId, status, supplierId];
    var adminId;
    var supplier=supplierId.split('#').toString();
    var email = "youremail@yopmail.com"
    let  password = "";
    let randomString = "";
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);
        },
        async function (cb) {
             randomString = await  generateRandomString();
            let documentString = ""
             password = md5(randomString);
            //loginCases.logInCases(res, [sectionIdFromFrontEnd], adminId, cb, filter1);
            supplierReg.activeOrInACtive(req.dbName,res, cb, status, supplier, password);
        },async function(cb){
            if(parseInt(status)!==0){
                let supplierDetails = await executeQ.Query(req.dbName,
                    "select email from 	supplier where id=? ",[supplierId]);
                emailTemp.supplierApprovalEmail(req,res,randomString,supplierDetails[0].email,function(err,result){
                    if(err){
                        console.log("..****register email*****....",err);
                    }
                    cb(null)
                });
            
            }else{
                cb(null);
            }

            
    }], function (error, response) {

        if (error) {
            console.error(error);
            sendResponse.somethingWentWrongError(res);
        } else {
         //   console.log("response" + JSON.stringify(response))
            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

function generateRandomString() {
    return new Promise((resolve,reject)=>{
        var generatedText = "";
        var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
        for (var i = 0; i < 6; i++) {
            generatedText += text.charAt(Math.floor((Math.random() * text.length)));
        }
        resolve(generatedText);
    })
}
/**
 * @description used for supplier registration from admin panel
 */
module.exports.regSupplierDirectlyV2 = async function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var categoryIds = req.body.categoryIds;
    var supplierName = req.body.supplierName;
    let _homeAddress=req.body.home_address || "";
    let supplierNameOl = req.body.supplierNameOl || supplierName
    var supplierAddress = req.body.supplierAddress;
    var supplierMobileNo = req.body.supplierMobileNo;
    var supplierEmail = req.body.supplierEmail;
    var latitude = req.body.latitude!=undefined && req.body.latitude!=''?req.body.latitude:0;
    var longitude = req.body.longitude!=undefined && req.body.longitude!=''?req.body.longitude:0;
    var commission = req.body.commission!=undefined && req.body.commission!=''?req.body.commission:0;
    var manValue = [accessToken, authSectionId, supplierName, supplierAddress, supplierEmail, supplierMobileNo, categoryIds];
    var inputs = [supplierName, supplierEmail, supplierMobileNo, supplierAddress];
    var self_pickup=req.body.self_pickup!=undefined?req.body.self_pickup:0
    var inputs = [supplierName, supplierEmail, supplierMobileNo, supplierAddress];
    let iso=req.body.iso!=undefined?req.body.iso:null
    let country_code=req.body.country_code!=undefined?req.body.country_code:null
    let license_number = req.body.license_number!==undefined?req.body.license_number:0
    let gstPrice=req.body.gst_price || 0.0
    var password;
    var adminId;
    var supplierInsertId;
    var supplierBranchId
    var supplierAdminId;
    var password2;
    console.log(req.body)
    var supplierAccessToken = func.encrypt(supplierEmail + new Date());
    var getApiVersion = UniversalFunction.getVersioning(req.path)
    var is_multibranch = req.body.is_multibranch!=null && req.body.is_multibranch!=undefined ?req.body.is_multibranch:0
    let pickupCommision=req.body.pickupCommision!=undefined && req.body.pickupCommision!=""?req.body.pickupCommision:0;
    let businessName=req.body.businessName || ""
    let websiteUrl=req.body.websiteUrl || ""
    let speciality=req.body.speciality || "";
    let nationality=req.body.nationality || "";
    let facebook_link=req.body.facebook_link || "";
    let linkedin_link=req.body.linkedin_link || "";
    let brand=req.body.brand || "";
    let description=req.body.description || "";

    let slogan_ol = req.body.slogan_ol || "";
    let slogan_en = req.body.slogan_en || "";

    var country_of_origin = req.body.country_of_origin || "";
    let is_out_network = req.body.is_out_network!==undefined?req.body.is_out_network:0
    console.log("=========getApiVersion==========",getApiVersion)
    let supplier_tags = req.body.supplier_tags==undefined?req.body.supplier_tags:[]
   
    const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName,
        [
           'isCategoryNeedAdminApproval',
           'sendPushToAllUserOnSupplierReg'
       ]);
   
    async.waterfall([
        function (cb) {
            logger.debug("=====================went wrong 1=========================")

            func.checkBlank(res, manValue, cb)
        },
        function (cb) {
            logger.debug("=====================went wrong 2 =========================")

            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;
            logger.debug("=====================went wrong 3=========================")

            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);
        },
        function (cb) {
            logger.debug("=====================went wrong 4 =========================")

            checkSupplierEmailAvailability(req.dbName,res, cb, supplierEmail);
        },
        function (cb) {
            logger.debug("=====================went wrong 5 =========================")

            func.generateRandomString(cb);
        },
        function (pass, cb) {
            logger.debug("=====================went wrong 6=========================")

            // password = "123456";
            password = pass;
            password2 = md5(password);
            inputs.push(password2);
            inputs.push(adminId);
            if(getApiVersion>0){
                inputs.push(latitude);
                inputs.push(longitude);
                inputs.push(commission);
                inputs.push(pickupCommision);
                inputs.push('1')
                inputs.push(self_pickup);
                inputs.push(country_code);
                inputs.push(iso);
                inputs.push(is_multibranch);
                inputs.push(license_number);
                inputs.push(description);
                inputs.push(brand);
                inputs.push(linkedin_link);
                inputs.push(facebook_link);
                inputs.push(nationality);
                inputs.push(speciality);
                inputs.push(gstPrice);
                inputs.push(country_of_origin);
                inputs.push(is_out_network);

                inputs.push(slogan_en);
                inputs.push(slogan_ol);
                inputs.push(_homeAddress);
                registerSupplierV1(req.dbName,res,cb,inputs);
            }else{
                registerSupplier(req.dbName,res, cb, inputs);
            }
        },
        async function (supplierInsertId1, cb) {
            logger.debug("=====================went wrong 7 =========================",supplierInsertId1)

            supplierInsertId = supplierInsertId1;
            // let sql = "insert into supplier_ml (name,language_id,supplier_id) values(?,?,?) ";
            // await executeQ.Query(req.dbName,sql,[supplierName,14,supplierInsertId]);

            // let sql2 = "insert into supplier_ml (name,language_id,supplier_id) values(?,?,?) ";
            // await executeQ.Query(req.dbName,sql2,[supplierNameOl,15,supplierInsertId]);
            cb(null);
        },
        function (cb) {
            logger.debug("=====================went wrong 8 =========================")

            inputs = null;
            var isSupplierSuperadmin = 1;
            inputs = [supplierEmail, md5(password), supplierMobileNo, isSupplierSuperadmin, adminId, supplierAccessToken, supplierInsertId,'1'];
            supplierAdminByClikat(req.dbName,res, cb, inputs, supplierInsertId);
        },
        async function (insertId, cb) {
            logger.debug("=====================went wrong 9 =========================");
            supplierAdminId = insertId;
            let cateArrayData=JSON.parse(categoryIds);
            let insertedValue=[];
            var insertLength = "(?,?,?,?),",querystring='';
            if(cateArrayData && cateArrayData.length>0){
                for (const [index,i] of cateArrayData.entries()){
                      if(i.data && i.data.length>0){
                            let returnJSON=  await UniversalFunction.nthLevelCategoryQueryString(req.dbName,i.id,i.data,supplierInsertId);
                              // insertedValue=returnJSON.insertedValues;
                            // querystring=returnJSON.querystring;
                            insertedValue.push(returnJSON.insertedValues);
                            querystring+=returnJSON.querystring;
                            logger.debug("=chunkArray====returnJSON==>>",returnJSON);
                            }
                            else{
                                querystring+=insertLength;
                                insertedValue.push(supplierInsertId,i.id,0,0);
                                logger.debug("===1St=Level==>>",insertedValue)
                            }
                            if(index==cateArrayData.length-1){
                                insertedValue=[].concat.apply([], insertedValue)
                                querystring=querystring.substring(0, querystring.length - 1);
                                logger.debug("===insertedValue=EndLoop====querystring====",insertedValue,querystring);
                                cb(null, insertedValue, querystring);
                            }
                        
                }
            }
            else{
                querystring+=insertLength;
                querystring=querystring.substring(0, querystring.length - 1);
                cb(null, [supplierInsertId,0,0,0], querystring);
            }
            // logger.debug("===========before calling makequerystringforsupplierRegisterApi==================",categoryIds,supplierInsertId)
          
            // makeQueryStringForSupplierRegisterApi(cb, categoryIds, supplierInsertId);
        },
        function (values, querystring, cb) {
            logger.debug("=====================went wrong 10 =========================")

            insertSupplierInSupplierCategory(req.dbName,res, cb, querystring, values, supplierInsertId, supplierAdminId);
        
        },
        function (cb) {

            updateOrderNoSupplierCategory(req.dbName,res,supplierInsertId,cb);
            
        },
        async function(cb){
            await assignTagsToSupplier(req.dbName,supplier_tags,supplierInsertId)
            cb(null);
        },
      async  function (cb) {
        let new_email_template_v12=await Execute.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? and value=1 ",["new_email_template_v12"]);


            logger.debug("=====================went wrong 11 =========================")
            let smtpData=await  UniversalFunction.smtpData(req.dbName);
            var subject = "New Supplier Registration";
            var content = "New Supplier Registration \n";
            content += "Congratulations you have been registered \n\n";
            content += "You can login using the following credentials :\n\n";
            content +="Email: "+supplierEmail+"\n";
            content +="Password: "+password+"\n\n";
            if(new_email_template_v12.length <=0)
            content += " Wishing your Business Prosperity and Success \n";
            // content += " Code Brew Lab";

            let colorThemeData=await executeQ.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["theme_color"]);
            let colorTheme=colorThemeData && colorThemeData.length>0?colorThemeData[0].value:"#e84b58"
        let new_email_template_v10=await executeQ.Query(req.dbName,
            "select `key`,`value` from tbl_setting where `key`=? and value=1 ",
            ["new_emain_template_v10"]);

            let new_content = `<!DOCTYPE html>
            <html>
            <head>
            <title>Email Tamplate</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            </head>
            <body style="font-family: Segoe UI, Roboto, Helvetica Neue,Helvetica, Arial,sans-serif; background: #fff;  max-width: 700px;  margin:40px 10px; padding: 0px; border-radius: 15px; display:table; margin: 15px auto;">

            <table  cellspacing="0" cellpanding="0" style="max-width:700px;  border-collapse: collapse; border-radius: 15px; border: 1px solid #eee;">
            <tr>
            <td style="padding: 0px;">
           
                <table style="width:100%; border-collapse: collapse;background-color: ${colorTheme}; " cellspacing="0" cellpanding="0">
                    <tbody>
                        <tr>
                            <td style="padding: 10px 20px;"> 
                                <img src=${req.logo_url} alt="" 
                                 style="display: inline-block; width: 100px; margin:0 0 0px; ">
                            </td>
                            
                        </tr>
                    </tbody>
                </table>        
                <table style="width: 100%; ">
                    <tbody>
                        <tr>
                             <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                              <h3></h3>
                                <p  style="font-size: 16px; color: #666; margin:0px; ">Successful Registration!
                                </p>
                                 <p style="color: #666; font-size: 16px; line-height:20px;">Congratulations ${supplierName}, you have been registered with ${req.bussiness_name} as a stylist at your doorstep </p>
                                 <p style="color: #666; font-size: 16px; line-height:20px;">We’re glad you chose us to be Your Service Expert. </p>
                                  <p style="color: #666; font-size: 16px; line-height:20px;">Our team works hard to serve you well, and we ensure that you are always matched with the right person for the job. It’s a tough task, but we continuously strive to ensure a stellar experience for you. So, trust us - you’re in good hands! </p>
                                 
                                <P style="color: #666; font-size: 16px;">Your ID – ${supplierEmail}</P>
                                <P style="color: #666; font-size: 16px;">Password - ${password} </P>
                                <P style="color: #666; font-size: 16px;">Wishing your Business Prosperity and Success </P>
                                <P style="color: #666; font-size: 16px;">If you have any questions along the way, email us at <a style="color: #000; text-decoration: underline;" href=${req.help_email} title="">${req.help_email} </a></P>
                                <p>Speak to you soon!</p>
                                <p>Team ${req.bussiness_name}</p>
                            </td>
                        </tr>                   
                    </tbody>
                </table>
                <table style="width:100%; border-collapse: collapse;background-color: #f2f2f2; " cellspacing="0" cellpanding="0">
                    <tbody>
                        <tr>
                            <td style="padding: 10px 20px;"> 
                                <h3 style="width: 300px;font-size: 14px;">${req.bussiness_name} Ltd</h3>
                            </td>
                            <td style="text-align: right; width: 90%;  padding: 10px 10px;">
                                
                                <a href="#" title="" style="color: #222; display: inline-block;  font-size: 20px; text-decoration: none;"><i class="fa fa-facebook" aria-hidden="true"></i></a>
                            </td>
                            <td style="text-align: right; width: 70%;  padding: 10px 10px;">
                                
                                <a href="#" title="" style="color: #222; display: inline-block;  font-size: 20px; text-decoration: none;"><i class="fa fa-twitter" aria-hidden="true"></i></a>
                            </td>
                            <td style="text-align: right; width: 70%;  padding: 10px 10px;">
                                
                                <a href="#" title="" style="color: #222; display: inline-block;  font-size: 20px; text-decoration: none;"><i class="fa fa-linkedin" aria-hidden="true"></i></a>
                            </td>
                            <td style="text-align: right; width: 70%;  padding: 10px 10px;">
                                
                                <a href="#" title="" style="color: #222; display: inline-block;  font-size: 20px; text-decoration: none;"><i class="fa fa-instagram" aria-hidden="true"></i></a>
                            </td>
                        </tr>
                    </tbody>
                </table> 
          </td>
       </tr>
     </table>
           
</body>
</html>`
let type = 1;
if(new_email_template_v10 && new_email_template_v10.length>0){
    content = new_content;
    type=0;
}


            func.sendMailthroughSMTP(smtpData,res, subject, supplierEmail, content, type, cb);
        },
        async function(cb){
            await assignTagsToSupplier(req.dbName,supplier_tags,supplierInsertId)
            cb(null);
        },
        async function(cb){
        if(settingDataKeys.keyAndValue.sendEmailToAllUserOnSupplierReg){
                let smtpSqlSata=await Universal.smtpData(req.dbName);
                let colorThemeData=await Execute.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["theme_color"]);
                let colorTheme=colorThemeData && colorThemeData.length>0?colorThemeData[0].value:"#e84b58"

                let subject = "New Supplier Just Registered";
                let receiverEmails = [];
                let sql = "select id,email from user where is_deleted=0 ";
                let result = await executeQ.Query(req.dbName,sql,[]);

                if(result && result.length>0){

                    for(const [index,i] of result.entries()){
                        receiverEmails.push(i.email);
                    }
                    let emailTemplate = await emailTemplates.allUserEmailOnSupplierRegisteration(
                        req.bussiness_name,
                        colorTheme,
                        req.logo_url,
                        supplierEmail,
                        supplierMobileNo, 
                        country_code
                        )
                    func.sendMailthroughSMTP(smtpSqlSata,res,
                        emailTemplate.subject,
                        receiverEmails,emailTemplate.template,0,cb)   
                }else{
                    cb(null);
                }
            }else{
                cb(null);
            }
        },
        async  function (cb) {
            try{
                if(businessName!="" && websiteUrl!=""){
                    let xmLpath=config.get("server.xmlPath")+businessName+"_sitemap.xml";
                    let supplierUrlJson=
                        {
                            loc: {
                                _text: websiteUrl+'/products/listing?supplierId='+supplierInsertId+'',
                            },
                            changefreq: {
                                _text: 'weekly'
                            },
                            }
                    let xmlData=await UniversalFunction.getExistingUrlsFromXml(xmLpath,supplierUrlJson);

                    logger.debug("==xmLpath=xmlData!=====",xmLpath,xmlData);
                    if(Object.keys(xmLpath).length>0){
                        await UniversalFunction.writeNewUrlsInXml(xmLpath,xmlData);
                    }
                }
                cb(null)
            }
            catch(Err){
                cb(null)
            }
        },
        async function (cb) {
            logger.debug("=====================went wrong 12 =========================")

            let sql = "insert into supplier_ml (name,language_id,address,supplier_id) values(?,?,?,?) ";
            await executeQ.Query(req.dbName,sql,[supplierName,14,supplierAddress,supplierInsertId]);

            let sql2 = "insert into supplier_ml (name,language_id,address,supplier_id) values(?,?,?,?) ";
            await executeQ.Query(req.dbName,sql2,[supplierNameOl,15,supplierAddress,supplierInsertId]);

            cb(null);
            // insertNameInMultiLanguage(req.dbName,res, supplierName,supplierNameOl, 14, supplierInsertId, supplierAddress, cb);
        },
        function(cb){

            updateSupplierSummary(req.dbName,res,supplierInsertId,cb)
        },
        function(cb){
            createSupplierDefaultBranch(req.dbName,res,supplierInsertId,supplierName,supplierAddress,supplierMobileNo,supplierEmail,latitude,longitude,password2,commission,cb)
        },
        function(id,cb){
            supplierBranchId = id;
            logger.debug("===========supplier_branch_id========",supplierBranchId)
            createSupplierDefaultBranchMl(req.dbName,res,supplierName,supplierAddress,supplierBranchId,cb)
        }

        
    ], function (error, response) {
        if (error) {
            console.error(error);
            logger.debug("=====================went wrong=========================")
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {
            };
            sendResponse.sendSuccessData(supplierInsertId, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}
async function updateOrderNoSupplierCategory(dbName, res, supplierInsertId, callback) {
    try{
        var sql = `select id from supplier_category 
        where supplier_id=${supplierInsertId} and order_no=0`;
        let results=await executeQ.Query(dbName,sql,[])
        // multiConnection[dbName].query(sql, [], function (err, results) {
        //     if (err) {
        //         cb(err);
        //     } 
            // else {
                async.eachSeries(results, async function (item, cb) {
                    var sql = `UPDATE supplier_category 
                  set order_no = (
                      (
                        SELECT 
                          order_no 
                        FROM 
                          (
                            SELECT 
                              MAX(order_no) AS order_no 
                            FROM 
                              supplier_category WHERE 
                   supplier_id=${supplierInsertId}
                          ) AS sub_selected_value
                      ) + 1.1
                    ) 
                  WHERE 
                   id=${item.id}`;
                   await executeQ.Query(dbName,sql,[])
                   cb(null)
                    // multiConnection[dbName].query(sql, [], function (err, result) {
                    //     cb(null);
                    // });
                }, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null)
                    }
                })
    
        //     }
        // })
    }
    catch(Err){
        logger.debug("===updateOrderNoSupplierCategory=ER!==",Err);
        cb(err);
    }
    
   
}

async function assignTagsToSupplier(dbName, tags, supplier_id) {
    try {
        return new Promise(async(resolve, reject) => {
            if (tags && tags.length > 0) {
                for (const [index, i] of tags.entries()) {
                    var sql = "insert into supplier_assigned_tags(supplier_id,tag_id) values(?,?)"
                    let result = await executeQ.Query(dbName, sql, [supplier_id, i])

                }
                resolve();
            }
            else {
                resolve();
            }

            // callback(null,result.insertId)
        })
    }
    catch (Err) {
        reject(Err);
    }
}
const emailTemplates = require('../lib/templates/emailTemplates');
const Execute = require('../lib/Execute');

module.exports.regSupplierDirectly = async function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var categoryIds = req.body.categoryIds;
    var supplierName = req.body.supplierName;
    var supplierAddress = req.body.supplierAddress;
    var supplierMobileNo = req.body.supplierMobileNo;
    var supplierEmail = req.body.supplierEmail || "";
    var latitude = req.body.latitude!=undefined && req.body.latitude!=''?req.body.latitude:0;
    var longitude = req.body.longitude!=undefined && req.body.longitude!=''?req.body.longitude:0;
    var commission = req.body.commission!=undefined && req.body.commission!=''?req.body.commission:0;
    var manValue = [accessToken, authSectionId, supplierName, supplierAddress, supplierEmail, supplierMobileNo, categoryIds];
    var inputs = [supplierName, supplierEmail, supplierMobileNo, supplierAddress];
    var self_pickup=req.body.self_pickup!=undefined?req.body.self_pickup:0
    var inputs = [supplierName, supplierEmail, supplierMobileNo, supplierAddress];
    let iso=req.body.iso!=undefined?req.body.iso:null
    let country_code=req.body.country_code!=undefined?req.body.country_code:null
    let license_number = req.body.license_number!==undefined?req.body.license_number:0
    var password;
    var adminId;
    var supplierInsertId;
    var supplierBranchId
    var supplierAdminId;
    var password2;
    console.log(req.body)
    var supplierAccessToken = func.encrypt(supplierEmail + new Date());
    var getApiVersion = UniversalFunction.getVersioning(req.path)
    var is_multibranch = req.body.is_multibranch!=null && req.body.is_multibranch!=undefined ?req.body.is_multibranch:0
    let pickupCommision=req.body.pickupCommision!=undefined && req.body.pickupCommision!=""?req.body.pickupCommision:0;

    let speciality=req.body.speciality || "";
    let nationality=req.body.nationality || "";
    let facebook_link=req.body.facebook_link || "";
    let linkedin_link=req.body.linkedin_link || "";
    let brand=req.body.brand || "";
    let description=req.body.description || "";
    let productCustomTabDescriptionLabelSelected = (req.body.productCustomTabDescriptionLabelSelected && req.body.productCustomTabDescriptionLabelSelected.length)?req.body.productCustomTabDescriptionLabelSelected:[];
    console.log("=========getApiVersion==========",getApiVersion)
    let customTabDescription3 = req.body.customTabDescription3?req.body.customTabDescription3:null;

    const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName,
         [
            'isCategoryNeedAdminApproval',
            'sendPushToAllUserOnSupplierReg'
        ]);
    settingDataKeys.keyAndValue.isCategoryNeedAdminApproval = !!settingDataKeys.keyAndValue.isCategoryNeedAdminApproval;
    let slogan_ol = req.body.slogan_ol || "";
    let slogan_en = req.body.slogan_en || "";


    async.waterfall([
        function (cb) {
            logger.debug("=====================went wrong 1=========================")

            func.checkBlank(res, manValue, cb)
        },
        function (cb) {
            logger.debug("=====================went wrong 2 =========================")

            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;
            logger.debug("=====================went wrong 3=========================")

            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);
        },
        function (cb) {
            logger.debug("=====================went wrong 4 =========================")
            if(supplierEmail=="" && supplierMobileNo!==""){
                checkSupplierEmailAvailability(req.dbName,res, cb, supplierEmail);

            }else{
                checkSupplierEmailAvailability(req.dbName,res, cb, supplierEmail);

            }
        },
        function (cb) {
            logger.debug("=====================went wrong 5 =========================")

            func.generateRandomString(cb);
        },
        function (pass, cb) {
            logger.debug("=====================went wrong 6=========================")

            // password = "123456";
            password = pass;
            password2 = md5(password);
            inputs.push(password2);
            inputs.push(adminId);
            if(getApiVersion>0){
                inputs.push(latitude);
                inputs.push(longitude);
                inputs.push(commission);
                inputs.push(pickupCommision);
                inputs.push('1')
                inputs.push(self_pickup);
                inputs.push(country_code);
                inputs.push(iso);
                inputs.push(is_multibranch);
                inputs.push(license_number);
                inputs.push(description);
                inputs.push(brand);
                inputs.push(linkedin_link);
                inputs.push(facebook_link);
                inputs.push(nationality);
                inputs.push(speciality);

                inputs.push(slogan_ol);
                inputs.push(slogan_en);

                registerSupplierV1(req.dbName,res,cb,inputs);
            }else{
                registerSupplier(req.dbName,res, cb, inputs);
            }
        },
        async function (supplierInsertId1, cb) {
            logger.debug("=====================went wrong 7 =========================",supplierInsertId1)

            supplierInsertId = supplierInsertId1;

           // Adding productCustomTabDescriptionLabel per supplier
            if(productCustomTabDescriptionLabelSelected && productCustomTabDescriptionLabelSelected.length){
                const settingDataKeys = await func.getSettingDataKeyAndValue(req.dbName, ['productCustomTabDescriptionLabel', 'isProductCustomTabDescriptionEnable']);
                settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable = !!settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable;
               if(settingDataKeys.keyAndValue.isProductCustomTabDescriptionEnable === true){


                if( 
                     (productCustomTabDescriptionLabelSelected && productCustomTabDescriptionLabelSelected.length) &&
                     settingDataKeys.keyAndValue.productCustomTabDescriptionLabel && settingDataKeys.keyAndValue.productCustomTabDescriptionLabel.length
                    ){
                    let sql = "UPDATE supplier SET productCustomTabDescriptionLabelSelected=?,customTabDescription3=? WHERE id = ?;";
                    let params = [JSON.stringify(productCustomTabDescriptionLabelSelected),customTabDescription3,supplierInsertId]
                    await executeQ.Query(req.dbName,sql,params);    
                }

               }
            }

            cb(null);
        },
        function (cb) {
            logger.debug("=====================went wrong 8 =========================")

            inputs = null;
            var isSupplierSuperadmin = 1;
            inputs = [supplierEmail, md5(password), supplierMobileNo, isSupplierSuperadmin, adminId, supplierAccessToken, supplierInsertId,'1'];
            supplierAdminByClikat(req.dbName,res, cb, inputs, supplierInsertId);
        },
        function (insertId, cb) {
            logger.debug("=====================went wrong 9 =========================")

            supplierAdminId = insertId;
            logger.debug("===========before calling makequerystringforsupplierRegisterApi==================",categoryIds,supplierInsertId)

            makeQueryStringForSupplierRegisterApi(cb, categoryIds, supplierInsertId);
           

        },
        function (values, querystring, cb) {
            logger.debug("=====================went wrong 10 =========================")
        insertSupplierInSupplierCategory(req.dbName,res, cb, querystring, values, supplierInsertId, supplierAdminId);
            
        },
      async  function (cb) {
            logger.debug("=====================went wrong 11 =========================")
            let new_email_template_v12=await Execute.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=? and value=1 ",["new_email_template_v12"]);
            let smtpData=await  UniversalFunction.smtpData(req.dbName);
            var subject = "New Supplier Registration";
            var content = "New Supplier Registration \n";
            content += "Congratulations you have been registered \n\n";
            content += "You can login using the following credentials :\n\n";
            content +="Email: "+supplierEmail+"\n";
            content +="Password: "+password+"\n\n";
            
          if(new_email_template_v12.length <=0)
            content += " Wishing your Business Prosperity and Success \n";
            // content += " Code Brew Lab";
            func.sendMailthroughSMTP(smtpData,res, subject, supplierEmail, content, 1, cb);            
        },
        function (cb) {
            logger.debug("=====================went wrong 12 =========================")

            insertNameInMultiLanguage(req.dbName,res, supplierName, 14, supplierInsertId, supplierAddress, cb);
        },
        function(cb){
            updateSupplierSummary(req.dbName,res,supplierInsertId,cb)
        },
        function(cb){
            createSupplierDefaultBranch(req.dbName,res,supplierInsertId,supplierName,supplierAddress,supplierMobileNo,supplierEmail,latitude,longitude,password2,commission,cb)
        },
        async function(id,cb){
            supplierBranchId = id;
            logger.debug("===========supplier_branch_id========",supplierBranchId)

            if( settingDataKeys.keyAndValue.isCategoryNeedAdminApproval){
               let sql22 = "UPDATE supplier_category SET isAdminApproveCategory=1 WHERE supplier_id = ?;";
               let params222= [supplierInsertId]
               await executeQ.Query(req.dbName,sql22,params222);    
           }
           
            if (settingDataKeys.keyAndValue.sendPushToAllUserOnSupplierReg){
          
            let fcm_server_key = await Universal.getFcmServerKey(req.dbName);

            if(fcm_server_key!=""){
                fcm_server_key=fcm_server_key
            }else{
                fcm_server_key = config.get('server.fcm_server_key')
            }
                
            let sql = "select id,device_type,device_token from user where is_deleted=0 and notification_status=1";
            
            let result = await executeQ.Query(req.dbName,sql,[]);

            let data = {
                "title":bussinessName,
                "status": constant.pushNotificationStatus.SYSTEM_PUSH,
                "message":"New Restaurant "+supplierName+" added on "+req.bussiness_name+" ",
                "orderId":0
            }
            let deviceToken = [];
            let userData = [];

            for(var i=0;i<result.length;i++){
                (async function (i) {
                    deviceToken.push(result[i].device_token);
                    userData.push(result[i])
                })
            }

            await pushNotifications.sendFcmPushNotificationInBulk(userData,
                req.dbName,fcm_server_key,deviceToken,data);
 
            }

            if(settingDataKeys.keyAndValue.sendEmailToAllUserOnSupplierReg){
                let smtpSqlSata=await Universal.smtpData(req.dbName);
                let colorThemeData=await Execute.Query(req.dbName,"select `key`,`value` from tbl_setting where `key`=?",["theme_color"]);
                let colorTheme=colorThemeData && colorThemeData.length>0?colorThemeData[0].value:"#e84b58"

                let subject = "New Supplier Just Registered";
                let receiverEmails = [];
                let sql = "select id,email from user where is_deleted=0 ";
                let result = await executeQ.Query(req.dbName,sql,[]);

                if(result && result.length>0){

                    for(const [index,i] of result.entries()){
                        receiverEmails.push(i.email);
                    }
                    let emailTemplate = await emailTemplates.allUserEmailOnSupplierRegisteration(
                        req.bussiness_name,
                        colorTheme,
                        req.logo_url,
                        supplierEmail,
                        supplierMobileNo, 
                        country_code
                        )
                    func.sendMailthroughSMTP(smtpSqlSata,res,
                        emailTemplate.subject,
                        receiverEmails,emailTemplate.template,0,cb)   
                }
            }else{
                cb(null);
            }
            

        },
        async function(cb){
            createSupplierDefaultBranchMl(req.dbName,res,supplierName,supplierAddress,supplierBranchId,cb)

        }
    ], function (error, response) {
        if (error) {
            console.error(error);
            logger.debug("=====================went wrong=========================")
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

async function createSupplierDefaultBranch(dbName,res,supplierId,supplierName,supplierAddress,supplierMobileNO,supplierEmail,latitude,longitude,password2,commission,callback){
   try{
    var sql = "insert into supplier_branch(supplier_id,name,branch_name,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,is_live,password,commission) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    let result=await executeQ.Query(dbName,sql,[supplierId,supplierName,supplierName,supplierMobileNO,supplierMobileNO,supplierMobileNO,supplierEmail,supplierAddress,1,latitude,longitude,1,password2,commission])
    // var stmt=multiConnection[dbName].query(sql,[supplierId,supplierName,supplierName,supplierMobileNO,supplierMobileNO,supplierMobileNO,supplierEmail,supplierAddress,1,latitude,longitude,1,password2,commission],function(err,result){
    //     console.log("============errr============",err,stmt.sql,result)
    //     if(err){
    //         callback(err);
    //     }else{
            callback(null,result.insertId)
    //     }
    // })   
   }
   catch(Err){
        callback(Err);
   } 
}

async function assignTagsToSupplier(dbName, tags, supplier_id) {
    try {
        return new Promise(async(resolve, reject) => {
            if (tags && tags.length > 0) {
                for (const [index, i] of tags.entries()) {
                    var sql = "insert into supplier_assigned_tags(supplier_id,tag_id) values(?,?)"
                    let result = await executeQ.Query(dbName, sql, [supplier_id, i])

                }
                resolve();
            }
            else {
                resolve();
            }

            // callback(null,result.insertId)
        })
    }
    catch (Err) {
        reject(Err);
    }
}
 


async function createSupplierDefaultBranchMl(dbName,res,supplierName,supplierAddress,supplierBranchId,callback){
  try{
    var sql1 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
   await executeQ.Query(dbName,sql1,[supplierName,supplierName,14,supplierBranchId,supplierAddress])
    // var stmt = multiConnection[dbName].query(sql1,[supplierName,supplierName,14,supplierBranchId,supplierAddress],function(err,result1){
    //     console.log("============errr============",err,result1)
    //     if(err){
    //         callback(err)
    //     }else{
            var sql2 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
            let result2=await executeQ.Query(dbName,sql2,[supplierName,supplierName,14,supplierBranchId,supplierAddress])
            // var stmt=multiConnection[dbName].query(sql2,[supplierName,supplierName,14,supplierBranchId,supplierAddress],function(err,result2){
            //     console.log("============qeru==========",stmt.sql2,err)
            //     if(err){
            //         callback(err)
            //     }else{
                    callback(null,result2.insertId)
            //     }
            // })            
    //     }
    // })
  }
  catch(Err){
      logger.debug("===Err!==",Err);
      callback(err)
  }
}

function getDefaultAddress(dbName){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select * from default_address limit 1"
            let params = []
            let result = await executeQ.Query(dbName,query,params)
            if(result && result.length>0){
                resolve(result);
            }else{
                resolve([])
            }
        }catch(err){
            logger.debug("============er=====",err)
            reject(err)
        }
    })
}



function updateSupplierSummary(dbName,res,supplierId,callback){
        var deliveryMinTime = 15,deliveryMaxTime=15,deliveryPriorDays=0,deliveryPriorTime=0,urgentDeliveryTime=30;
        var deliveryPriorTotalTime = parseInt(deliveryPriorTime) + parseInt(deliveryPriorDays)*24*60;        


    var updateValues = [deliveryMinTime, deliveryMaxTime, deliveryPriorDays, 
        deliveryPriorTime, urgentDeliveryTime, deliveryPriorTotalTime, supplierId];

    var timings =
        [

            {  "supplier_id": supplierId, "week_id": 0, "week": "mon", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
            {  "supplier_id": supplierId, "week_id": 1, "week": "tue", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
            {  "supplier_id": supplierId, "week_id": 2, "week": "wed", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
            {  "supplier_id": supplierId, "week_id": 3, "week": "thu", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
            {  "supplier_id": supplierId, "week_id": 4, "week": "fri", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
            {  "supplier_id": supplierId, "week_id": 5, "week": "sat", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
            {  "supplier_id": supplierId, "week_id": 6, "week": "sun", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 }
        ]

    async.auto({
        one:function(cb){
            updateSupplierDeliveryTime(dbName,res,updateValues,cb);
        },
        two : function(cb){
            updateSupplierWorkingHours(dbName,res,timings,supplierId,cb);
        }
    },
    function(err,response)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null);
        }

    })
}

async function updateSupplierDeliveryTime(dbName,res,updateValues,callback)
{
    try{
    var sql = "update supplier set delivery_min_time = ?,delivery_max_time = ?,delivery_prior_days = ?,delivery_prior_time ";
    sql +=" = ? ,urgent_delivery_time = ?,delivery_prior_total_time = ? where id = ? limit 1";
    await executeQ.Query(dbName,sql,updateValues);
    callback(null);
    }
    catch(Err){
        logger.debug("==Err!=",Err)
        sendResponse.somethingWentWrongError(res);
    }

    // multiConnection[dbName].query(sql,updateValues,function(err,result)
    // {
    //     if(err){
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else{
            // callback(null);
    //     }

    // })

}

function updateSupplierWorkingHours(dbName,res,timings,supplierId,callback)
{
    console.log("....s....",timings)
    var day = moment().isoWeekday();
    day=day-1;
    var j=0;
    var timingsJSON = timings
    var jsonLength = timingsJSON.length;
    var status =0;
    console.log("....length....",jsonLength);
 async.auto({
     deleteTimings:async function (cb) {
         try{
         var sql = "delete from supplier_timings where supplier_id = ?";
         await executeQ.Query(dbName,sql,[supplierId])
        //  multiConnection[dbName].query(sql, [supplierId], function (errr, response) {
        //      //console.log(".......",errr,response);
        //      if (errr) {
        //          console.log("error in updating timings", errr);
        //          cb(errr);

        //      }
        //      else {
                 cb(null);
        //      }
        //  })
         }
         catch(Err){
             cb(Err)
         }
     },
     insertTimings:['deleteTimings',function (cb) {
         console.log("..start....");
         for(var i=0;i<jsonLength;i++){
             (async function (i) {
                 var sql = "insert into supplier_timings(supplier_id,week_id,start_time,end_time,is_open) values(?,?,?,?,?)";
                await executeQ.Query(dbName,sql,[supplierId,timingsJSON[i].week_id,timingsJSON[i].start_time,timingsJSON[i].end_time,timingsJSON[i].is_open])
                 //  multiConnection[dbName].query(sql,[supplierId,timingsJSON[i].week_id,timingsJSON[i].start_time,timingsJSON[i].end_time,timingsJSON[i].is_open],function(err,result)
                //  {
                //      if(err){
                //          console.log("error in updating timings",err);
                //      }
                //      else {
                         if(day == timingsJSON[i].week_id){
                             status =timingsJSON[i].week_id
                             if(i == (jsonLength-1))
                             {
                                 cb(null);
                             }
                         }
                         else {
                             if(i == (jsonLength-1))
                             {
                                 cb(null);
                             } 
                         }

                //      }
                //      // console.log("error in inserting timings",err);

                //  })
             }(i))
         }
     }],
     updateStatus:['insertTimings',async function (cb) {
         try{
         var sql1='update supplier set status = ? where id =?';
         await executeQ.Query(dbName,sql1,[status,supplierId])
        //  multiConnection[dbName].query(sql1,[status,supplierId],function (errr,response) {
        //      if(errr){
        //          console.log("error in updating timings",errr);
        //      }
        //      else {
                //  console.log(",,,,,finish,,,,,,,,",response);
                cb(null);
        //      }
        //  })
         }
         catch(Err){
             cb(Err)
         }
     }]
 },function (err,result) {
     if(err){
        console.log("err",err);
         callback(err);
     }
     else {
        callback(null);
     }
 })
}




makeQueryStringForSupplierRegisterApi = function(callback,categoryJSON,id)
{



    console.log("dfjdfjdbfjdf",JSON.parse(categoryJSON),id);
    
    categoryJSON = JSON.parse(categoryJSON);
    console.log("length",categoryJSON.length)
    var values = [];
    var insertLength = "(?,?,?,?),";
    var querystring = '';
    // if(categoryJSON.length>1){
    for(var i = 0 ; i < categoryJSON.length ;i++)
    {
        (function(i)
        {
            var categoryId = categoryJSON[i].id;
            var subCategoryData = categoryJSON[i].data;
            var subCategoryLength = subCategoryData.length;
            console.log("==subCategoryLength==subCategoryData=",categoryId,subCategoryLength,subCategoryData)
            if(subCategoryLength>0)
            {
                for(var j = 0 ; j < subCategoryLength;j++)
            {
                (function(j)
                {
                    var subCategoryId = subCategoryData[j].id;
                    var detailedSubCategoryData = subCategoryData[j].data;
                    var detailedSubCategoryLength = detailedSubCategoryData .length;
                    console.log("==detailedSubCategoryLength=detailedSubCategoryData=",detailedSubCategoryLength,detailedSubCategoryData)
                    if(detailedSubCategoryLength>0){
                    for(var k = 0 ; k < detailedSubCategoryLength ; k++)
                    {
                        (function(k)
                        {
                            var detailedSubCategoryId = detailedSubCategoryData[k].id;
                            values.push(id,categoryId,subCategoryId,detailedSubCategoryId);
                            querystring += insertLength;
                            console.log("value",values)
                            if(i == categoryJSON.length - 1 && j == subCategoryLength - 1 && k == detailedSubCategoryLength - 1)
                            {
                                querystring = querystring.substring(0, querystring.length - 1);
                                console.log("dfsdfdjfdfdfdf")
                                callback(null, values, querystring);
                            }

                        }(k))
                    }}
                    else{


                        querystring += insertLength;
                        values.push(id,categoryId,subCategoryId,0);

                        if(i == categoryJSON.length - 1 && j == subCategoryLength - 1){
                            //  values.push(id,categoryId,subCategoryId,subCategoryId);

                             querystring = querystring.substring(0, querystring.length - 1);

                             logger.debug("=========================values==========",)
                             callback(null, values, querystring);
                        }
                    }

                }(j))

            }
        }
        else{
            querystring += insertLength;
            values.push(id,categoryId,0,0);
            if(i == categoryJSON.length - 1){
                querystring = querystring.substring(0, querystring.length - 1);
                console.log("===DF=Values===",values,querystring)
                callback(null, values, querystring);
           }
            // values.push(id,categoryId,categoryId,categoryId);
        }

        }(i))

    }
// }
// else{
//     values.push(id,categoryId,subCategoryId,detailedSubCategoryId);
// }

}



/*
 * This function is used to make an entry in supplier table
 * at the time of supplier reg.
 */
function registerSupplier(dbName,res, callback, inputs) {
    inputs.push('1')
    var sql = " insert into supplier(name,email,mobile_number_1,address,password,created_by,is_active)values(?,?,?,?,?,?,?)";
    let stmt = multiConnection[dbName].query(sql, inputs, function (err, reply) {
        console.log("===========register supplier query============",stmt.sql)
        if (err) {
            console.error(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            console.log("=========reply.insertId  reply.insertId=======",reply.insertId)
            callback(null, reply.insertId);
        }
    })
}

/*
 * This function is used to make an entry in supplier table
 * at the time of supplier reg.
 */
async function registerSupplierV1(dbName,res, callback, inputs) {
  
    try{
        let randomize = require('randomatic');
        let  user_created_id =  randomize('A0', 30);
        inputs.push(user_created_id);
        var sql = " insert into supplier(name,email,mobile_number_1,address,password,created_by,latitude,longitude,commission,pickup_commission,is_active,self_pickup,country_code,iso,is_sponser,license_number,description,brand,linkedin_link,facebook_link,nationality,speciality,gst_price,country_of_origin,is_out_network,slogan_ol,slogan_en,home_address,user_created_id)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        let reply=await executeQ.Query(dbName,sql,inputs);
        callback(null, reply.insertId);
    
    }
    catch(Err){
        logger.debug("==Err!==",Err)
        sendResponse.somethingWentWrongError(res);
    }
}
/*
 *This function is used to make an entry in supplier_admin
 * table at the time of supplier reg.
 */
async function supplierAdminByClikat(dbName,res, callback, inputs, supplierInsertId) {
    try{
    var sql = "insert into supplier_admin(email,password,phone_number,is_superadmin,created_by_clikat,access_token,supplier_id,is_active)values(?,?,?,?,?,?,?,?)";
    let reply=await executeQ.Query(dbName,sql,inputs);
    // multiConnection[dbName].query(sql, inputs, function (err, reply) {
    //     if (err) {
    //         console.error(err);
    //     } else {
            callback(null, reply.insertId);
    //     }
    // })
    }
    catch(Err){
        async.waterfall([
            async function (cb1) {
                var sql = "delete from supplier where id = ?";
                multiConnection[dbName].query(sql, [supplierInsertId], function (err2, reply2) {
                    if (err2) {
                        console.error("err2" + err2);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        callback(null);
                    }
                })
            }
        ], function (err1, reply1) {
            sendResponse.somethingWentWrongError(res);
        })
        // logger.debug("==Err!==",Err);
        // sendResponse.somethingWentWrongError(res);
    }
}


/*
 *This function is used to reg supplier admin
 */

function supplierAdminBySupplier(res, callback, inputs) {
    var sql = "insert into supplier_admin(email,password,phone_number,is_superadmin,created_by_supplier)values(?,?,?,?,?)";
    multiConnection[dbName].query(sql, inputs, function (err, reply) {
        if (err) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })
}

/*
 * This function is used to change status
 * at the time of supplier reg.
 */
function changeSupplierStatusInDump(dbName,res, callback, dumpSupplierId, status) {
    var sql = "update supplier_dump set status = ? where id = ?";
    multiConnection[dbName].query(sql, [status, dumpSupplierId], function (err, reply) {
        if (err) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })
}


/*
 *This function is used to get all the reg
 * supplier, but the data will not be in
 * the form of clubed data.
 */

//module.exports.getRegSupplier = function (res, callback) {
//    var sql = "select s.id,s.name,s.address,s.mobile_number_1,s.email,s.is_active,c.name as category_name,c.id as category_id from supplier s";
//    sql += " join supplier_category ss on s.id = ss.supplier_id join categories c on ss.category_id = c.id ";
//    multiConnection[dbName].query(sql, [], function (err, reply) {
//        if (err) {
//            console.error(err);
//            sendResponse.somethingWentWrongError(res);
//        } else if (reply.length) {
//            clubSupplierList(res, callback, reply);
//        } else {
//            callback(null, []);
//        }
//    })
//}

/*
 * This function is used to check whether any supplier
 * is already reg with the same email at the time of
 * supplier reg
 */
async function checkSupplierEmailAvailability(dbName,res, cb, supplierEmail) {
    try{
    var sql = " select 1 from supplier where email = ?";
    let reply=await executeQ.Query(dbName,sql,[supplierEmail])
    if (reply && reply.length) {
        sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
    }
    else{
        cb(null);
    }
    }
    catch(Err){
        logger.debug("==ERR!==checkSupplierEmailAvailability=",Err);
        sendResponse.somethingWentWrongError(res);
    }
    // multiConnection[dbName].query(sql, [supplierEmail], function (err, reply) {
    //     if (err) {
    //         console.error(err);
    //         sendResponse.somethingWentWrongError(res);
    //     } else if (reply.length) {
    //         sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
    //     } else {
    //         cb(null);
    //     }
    // })
}




async function checkSupplierPhoneNumberAvailability(dbName,res, cb,
     phoneNumber) {
    try{
    var sql = " select 1 from supplier where email = ?";
    let reply=await executeQ.Query(dbName,sql,[supplierEmail])
    if (reply && reply.length) {
        sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
    }
    else{
        cb(null);
    }
    }
    catch(Err){
        logger.debug("==ERR!==checkSupplierEmailAvailability=",Err);
        sendResponse.somethingWentWrongError(res);
    }
    // multiConnection[dbName].query(sql, [supplierEmail], function (err, reply) {
    //     if (err) {
    //         console.error(err);
    //         sendResponse.somethingWentWrongError(res);
    //     } else if (reply.length) {
    //         sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
    //     } else {
    //         cb(null);
    //     }
    // })
}





/*
 * This function is used to create query string
 * to insert multiple category corresponding to
 * the supplier at the time of supplier reg
 */
function createQueryString(res, callback, category, supplierInsertId) {
    var values = new Array();
    var insertLength = "(?,?),";
    var querystring = '';
    var idLength = category.length;
    //console.log(idLength);
    if (idLength) {
        for (var i = 0; i < idLength; i++) {
            (function (i) {

                values.push(supplierInsertId, category[i]);
                // values.push(newValues);
                querystring = querystring + insertLength;

                if (i == idLength - 1) {
                    querystring = querystring.substring(0, querystring.length - 1);
                    callback(null, querystring, values);
                }

            }(i))
        }
    }
    else {
        callback(null);
    }
}


/*
 * This function is used to insert multiple
 * category of a supplier at the time of
 * supplier reg
 */
async function insertSupplierInSupplierCategory(dbName,res, callback, querystring, values, supplierInsertId, supplierAdminId) {
   logger.debug("===========values===values=============",values);
   try{
    var sql = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id) values" + querystring;


    const settingDataKeys = await func.getSettingDataKeyAndValue(dbName, ['isCategoryNeedAdminApproval']);
    settingDataKeys.keyAndValue.isCategoryNeedAdminApproval = !!settingDataKeys.keyAndValue.isCategoryNeedAdminApproval;
   if(settingDataKeys.keyAndValue.isCategoryNeedAdminApproval === true){
        
   }else{
       
   }
   await executeQ.Query(dbName,sql,values);

    // multiConnection[dbName].query(sql, values, function (err1, reply1) {
    //     console.log("......................",err1,reply1);

    //     if (err1) {
    //         console.log("gfdhgfjhfyjfjh",err1);
    //         sendResponse.somethingWentWrongError(res);
    //     } else {
            callback(null);
    //     }
    // })
}
catch(Err){
    logger.debug("===insertSupplierInSupplierCategory==ERR!==",Err);
    sendResponse.somethingWentWrongError(res);
}

}

/*
 *This function is used to club data of
 * reg supplier.
 */
function clubSupplierList(res, callback, reply) {
    var replyLength = reply.length;
    //console.log("reply length " + replyLength);
    //console.log("reply data " + JSON.stringify(reply));
    var k = 0;
    var BreakException = {};
    var supplierData = [];
    for (var i = 0; i < replyLength; i++) {
        (function (i) {
            try {
                var categoryData = [];
                var same = false;

                for (var j = k; j < replyLength; j++) {
                    (function (j) {
                        //console.log("id for i" + reply[i].id);
                        //console.log("id for j" + reply[j].id);
                        if (reply[i].id == reply[j].id) {
                            //console.log("matched");
                            categoryData.push({
                                "category_id": reply[j].category_id,
                                "category_name": reply[j].category_name
                            });
                            k++;
                            same = true;
                            if (j == replyLength - 1) {
                                supplierData.push({
                                    "supplier_id": reply[j].id,
                                    "supplier_name": reply[j].name,
                                    "supplier_address": reply[j].address,
                                    "supplier_mobile": reply[j].mobile_number_1,
                                    "supplier_email": reply[j].email,
                                    "is_active": reply[j].is_active,
                                    "category_data": categoryData
                                });
                            }
                        } else {
                            if (same) {
                                //console.log("value pushed to detail " + j);
                                supplierData.push({
                                    "supplier_id": reply[i].id,
                                    "supplier_name": reply[i].name,
                                    "supplier_address": reply[i].address,
                                    "supplier_mobile": reply[i].mobile_number_1,
                                    "supplier_email": reply[i].email,
                                    "is_active": reply[i].is_active,
                                    "category_data": categoryData
                                });

                            }
                            //console.log("exception");
                            throw BreakException;
                        }
                    }(j))
                }

            } catch (e) {
                console.error(e);
            }

            //console.log("inside finally");
            if (i == replyLength - 1) {
           //     console.log("supplier data " + JSON.stringify(supplierData));
                callback(null, supplierData);
            }
        }(i))
    }
}

const execute = require('../lib/Execute');
module.exports.activeOrInACtive = async function (dbName,res, callback, status, supplierId, password=0) {

    if(parseInt(password)!==0){
        await execute.Query(dbName,
            "update supplier set password=? where id=?",[password,supplierId]);
            await execute.Query(dbName,
                "update supplier_admin set password=? where supplier_id=?",[password,supplierId]);
    }

    var sql = "update supplier s join supplier_admin sa on s.id = sa.supplier_id set sa.password=?, s.is_live=?,s.is_active = ?,sa.is_active = ? where s.id IN ("+supplierId+") ";
    multiConnection[dbName].query(sql, [password,status,status,status], function (err, reply) {
        if (err) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            var sql2 = "update supplier_branch set is_live = ? where supplier_id IN ("+supplierId+") ";
            multiConnection[dbName].query(sql2,[status],function(err,result2)
            {
                if (err) {
                    console.error(err);
                    sendResponse.somethingWentWrongError(res);
                }
                else{
                    callback(null);
                }
            })

        }
    })
}


module.exports.getRegSupplier = function (db_name,res, callback) {
    
    logger.debug("========================in the getRegSupplier=========================")
    var supplier_data;

    async.auto({
        supplier: function (cb) {
                
            logger.debug("==============in first============================")
            getSupplier(db_name,res, cb);
            
            // supplier_data = suppliers
        },
        // check: ['supplier',function(cb,result){
        //     logger.debug("--------print suppliers------------",result.supplier)
        //     getOrdersRevenue(db_name,result.supplier,res,cb)
        // }],
        category: function (cb) {
            logger.debug("==============in second============================")
            getRegSupplierCategoryData(db_name,res, cb);
            
            logger.debug("==============in second 2 ============================")

        },
        three: ['supplier', 'category', function (cb, result) {
            logger.debug("==============in third============================")
            clubDataForRegSupplier(res, cb, result);

        }]
    }, function (error, result) {

        if (error) {
            logger.debug("================ result.three =========",result.three)
            logger.debug("================ error in supplierReg =========",result.three,error)
             sendResponse.somethingWentWrongError(res);
        }
        else {
            logger.debug("================result.three=========",result.three)
             callback(null, result.three);

        }

    })

}


async function getOrdersRevenue(db_name,suppliers_data,res){
    var sql1 = "select id from supplier_branch where supplier_id = ? "
    var sql2 = "SELECT IFNULL(SUM(supplier_commision),0) as total_revenue from orders where supplier_branch_id = ? and status = 5 "
    let response_array = []
    try{
        
        if(suppliers_data && suppliers_data.length){
            for(let i=0; i<suppliers_data.length; i++){
    
                let get_branch = await executeQ.Query(db_name,sql1,[suppliers_data[i].id])

                let total = 0;
                for(let j=0; j<get_branch.length; j++){
    
                    let get_revenue = await executeQ.Query(db_name,sql2,[get_branch[j].id])
    
                    total = total + get_revenue[0].total_revenue
                }
                suppliers_data[i].total_revenue = total || 0
            }
            return suppliers_data
        }
        // logger.debug("-------response_array---------------",response_array)
    }catch(err){
        logger.debug(err)
        sendResponse.somethingWentWrongError(res);
    }
}

 function getSupplier(db_name,res, callback) {

    var sql = "select `self_pickup`,`name`,`id`,`email`,`address`,`mobile_number_1`,`is_active`,`pricing_level`,`commission` from supplier";
    multiConnection[db_name].query(sql, async function (err, suppliers) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            let get_revenue = await getOrdersRevenue(db_name,suppliers,res)
            logger.debug("--------------get_revenue--------------",get_revenue)
            callback(null, get_revenue);
        }

    })
}


function getRegSupplierCategoryData(db_name,res, callback) {
    var sql = "select d.supplier_id,d.category_id,d.sub_category_id,d.detailed_sub_category_id,c.name category_name,";
    sql += " sc.name sub_cat_name, dsc.name detailed_sub_cat_name from  supplier_category d left join categories c on ";
    sql += " d.category_id = c.id  left join categories sc on d.sub_category_id = sc.id left join categories dsc ";
    sql += " on d.detailed_sub_category_id = dsc.id group by d.category_id, d.supplier_id order by d.supplier_id,d.category_id,d.sub_category_id,d.detailed_sub_category_id";
    multiConnection[db_name].query(sql, function (err, categories) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, categories);
        }

    })
}


function clubDataForRegSupplier(res, callback, result) {
    var suppliers = result.supplier;
    logger.debug("==============suppliers list========+",suppliers)
    var categories = result.category;
    var supplier = [];
    var supplierLength = suppliers && suppliers.length>0?suppliers.length:0;
    // logger.debug("=======suppliers=>>==",suppliers.length,suppliers,supplierLength)
    var x = 0;
    var y = 0;
    var z = 0;
    var exception = {};
    //console.log("here");
    if (supplierLength == 0) {
        callback(null, supplier);
    }
    else {

        for (var i = 0; i < supplierLength; i++) {
            (function (i) {
                var categoriesLength = categories.length;
                var category = [];
                var supplierCheck = false;
                try {
                    for (var j = x; j < categoriesLength; j++) {
                        (function (j) {

                            if (suppliers[i].id == categories[j].supplier_id) {
                                x++;
                                supplierCheck = true;
                                var subCategoryLength = categories.length;
                                var subCategories = [];
                                var subCategoryCheck = false;
                                try {
                                    for (var k = y; k < subCategoryLength; k++) {
                                        (function (k) {
                                            if (categories[j].category_id == categories[k].category_id && categories[j].supplier_id == categories[k].supplier_id && suppliers[i].id == categories[j].supplier_id && suppliers[i].id == categories[k].supplier_id) {
                                                y++;
                                                subCategoryCheck = true;
                                                var detailedSubCategoryLength = categories.length;
                                                var detailedSubCategories = [];
                                                var detailedCheck = false;
                                                try {
                                                    for (var l = z; l < detailedSubCategoryLength; l++) {
                                                        (function (l) {

                                                            if (categories[k].sub_category_id == categories[l].sub_category_id && suppliers[i].id == categories[l].supplier_id) {
                                                                z++;

                                                                if (categories[l].sub_category_id != 0) {
                                                                    detailedCheck = true;
                                                                    if (categories[l].detailed_sub_category_id != 0) {
                                                                        detailedSubCategories.push({
                                                                            "detailed_sub_cat_id": categories[l].detailed_sub_category_id,
                                                                            "name": categories[l].detailed_sub_cat_name
                                                                        });
                                                                      //  console.log("detailed sub categories " + JSON.stringify(detailedSubCategories));
                                                                    }
                                                                    if (l == detailedSubCategoryLength - 1) {

                                                                        subCategories.push({
                                                                            "sub_category_id": categories[k].sub_category_id,
                                                                            "name": categories[k].sub_cat_name,
                                                                            "sub_category_data": detailedSubCategories
                                                                        });
                                                                       // console.log("sub categories " + JSON.stringify(subCategories));
                                                                    }

                                                                }

                                                            }
                                                            else {
                                                                if (detailedCheck && l == detailedSubCategoryLength - 1) {
                                                                    subCategories.push({
                                                                        "sub_category_id": categories[k].sub_category_id,
                                                                        "name": categories[k].sub_cat_name,
                                                                        "sub_category_data": detailedSubCategories
                                                                    });
                                                                   // console.log("sub categories " + JSON.stringify(subCategories));
                                                                    throw exception;
                                                                }

                                                            }

                                                        }(l))

                                                    }
                                                }
                                                catch (e) {
                                                  //  console.log(e);
                                                }

                                                if (k == subCategoryLength - 1) {

                                                    category.push({
                                                        "category_id": categories[j].category_id,
                                                        "name": categories[j].category_name,
                                                        "category_data": subCategories
                                                    })
                                                }
                                            }
                                            else {
                                                if (subCategoryCheck && k == subCategoryLength - 1) {
                                                    category.push({
                                                        "category_id": categories[j].category_id,
                                                        "name": categories[j].category_name,
                                                        "category_data": subCategories
                                                    });
                                                    throw exception;
                                                }

                                            }

                                        }(k))
                                    }
                                    if (j == categoriesLength - 1) {
                                        supplier.push({
                                            "supplier_name": suppliers[i].name,
                                            "id": suppliers[i].id,
                                            "supplier_email": suppliers[i].email,
                                            "address": suppliers[i].address,
                                            "primary_mobile": suppliers[i].mobile_number_1,
                                            "is_active": suppliers[i].is_active,
                                            "pricing_level": suppliers[i].pricing_level,
                                            "total_revenue": suppliers[i].total_revenue,
                                            "commission":suppliers[i].commission,
                                            "category_data": category

                                        })
                                    }
                                }
                                catch (e) {
                                   // console.log(e);
                                }
                            }
                            else {
                                if (supplierCheck && j == categoriesLength - 1) {
                                    supplier.push({
                                        "supplier_name": suppliers[i].name,
                                        "id": suppliers[i].id,
                                        "supplier_email": suppliers[i].email,
                                        "address": suppliers[i].address,
                                        "primary_mobile": suppliers[i].mobile_number_1,
                                        "is_active": suppliers[i].is_active,
                                        "pricing_level": suppliers[i].pricing_level,
                                        "total_revenue": suppliers[i].total_revenue,
                                        "commission":suppliers[i].commission,
                                        "category_data": category

                                    });
                                    throw exception;
                                }

                            }

                        }(j))

                    }
                }
                catch (e) {
                 //   console.log(e);
                }

                if (i == supplierLength - 1) {
                    callback(null, supplier);
                }

            }(i))

        }
    }


}

async function insertNameInMultiLanguage(dbName,res, supplierName,supplierNameOl, languageId, supplierInsertId, address, callback) {
   try{

    var sql = "insert into supplier_ml(name,address,language_id,supplier_id) values(?,?,?,?) ";
    await executeQ.Query(dbName,sql,[supplierName, address, languageId, supplierInsertId])

    console.log("fdhbgfnjmhmfnhmghmgmgjmgh",err);

    var sql2 = "insert into supplier_ml(name,address,language_id,supplier_id) values(?,?,?,?) ";
    await executeQ.Query(dbName,sql2,[supplierNameOl, "", 15, supplierInsertId]);

    callback(null);
 
}
catch(Err){
    callback(null);
}

}



function getSubAndDetailedCategory(dbName,res,categoryId,callback)
{
    var subCategories;
    var detailedSubCategories;
    async.auto({
        one:function(cb){
           var sql = "select id,name from categories where parent_id = ? and is_deleted = ?";
            multiConnection[dbName].query(sql,[categoryId,0],function(err,response)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else{
                    if(response.length){
                        subCategories = response;
                        cb(null);
                    }
                    else{
                        callback(null,[]);
                    }
                }

            })
        },
        two:['one',function(cb)
        {
            var sql = "select id,name,parent_id from categories where parent_id IN (select id from categories where parent_id = ? and is_deleted = ?) and is_deleted = ?";
            multiConnection[dbName].query(sql,[categoryId,0,0],function(err,response)
            {
                if(err){
                    sendResponse.somethingWentWrongError(res)
                }
                else{
                        detailedSubCategories = response;
                        cb(null);
                    }

            })

        }],
        three:['two',function(cb)
        {
            clubSubWithDetailed(res,subCategories,detailedSubCategories,cb);
        }]
    },function(err,response)
    {

        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null,response.three);
        }

    })

}


function clubSubWithDetailed(res,subCategories,detailedSubCategories,callback)
{

    var subLength = subCategories.length;
    var detailedLength = detailedSubCategories.length;

    if(detailedLength){

        for(var i = 0 ; i < subLength ; i++){
            (function(i)
            {

                var detailedSubCategoryArray = [];
                for(var j = 0 ; j < detailedLength ; j++)
                {
                    (function(j)
                    {
                        if(subCategories[i].id == detailedSubCategories[j].parent_id)
                        {
                            detailedSubCategoryArray.push({
                                "id":detailedSubCategories[j].id,
                                "name":detailedSubCategories[j].name
                            });
                            if(j == detailedLength -1)
                            {
                                subCategories[i].data = detailedSubCategoryArray;
                                if(i == subLength - 1)
                                {
                                    callback(null,subCategories)
                                }
                            }
                        }
                        else{
                            if(j == detailedLength -1)
                            {
                                subCategories[i].data = detailedSubCategoryArray;
                                if(i == subLength - 1)
                                {
                                    callback(null,subCategories)
                                }
                            }
                        }

                    }(j))

                }

            }(i))

        }

    }
    else{

        for(var i = 0 ; i < subLength ; i++){
            (function(i)
            {
                subCategories[i].data = [];
                if( i == subLength - 1)
                {
                    callback(null,subCategories);

                }

            }(i))

        }

    }


}