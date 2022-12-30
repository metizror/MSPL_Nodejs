/**
 * Created by cbl97 on 12/5/16.
 */
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var _ = require('underscore');
var validator = require("email-validator");
var loginCasesSupplierBranch = require('./loginCasesSupplierBranch');
var emailTemp = require('./email');

var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';


/*
 *-------------------------------
 *---------------------------------
 * get supplier home data
 *--------------------------------------
 * --------------------------
 */


exports.getSupplierBranchHomeData = function(req,res)
{
    var accessToken =  req.body.accessToken;
    var filter1 =  req.body.filter; // 0 ,1,2 (weekly,monthly)
    var sectionIdFromFrontEnd = req.body.sectionIdFromFront;
    var dataToBeSent;
    var supplierId;
    var supplierBranchId;
    var manValue = [accessToken,filter1];

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,0);

        },
        function (id, cb) {


                supplierBranchId = id;
                checkSupplierBranchActiveOrNotAtLogin(req.dbName,res, supplierBranchId, cb, 0);

        } ,
        function (cb) {
            //console.log("data on updation===========")

                dataOnUpdationSupplier(req.dbName,res, cb, supplierBranchId,sectionIdFromFrontEnd ,accessToken, filter1);

        }
    ], function (error, dataToBeSent1) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            dataToBeSent = dataToBeSent1;
            // console.log(JSON.stringify(dataToBeSent));
            sendResponse.sendSuccessData(dataToBeSent, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    })

}


function dataOnUpdationSupplier(dbName,res, callback, supplierBranchId, sectionIdFromFrontEnd, accessToken, filter1) {
    var dataSectionIds;
    var singleSectionData;
    var sectionDetails;
    var isSuper;
    async.waterfall([
        function(cb)
        {
            getAllSectionDetailsOfSuperAdminSupplier(dbName,res, cb);
        } ,
        function (sectionDetails1, cb) {
            sectionDetails = sectionDetails1;
            // console.log("==================SECTION DATA================" + JSON.stringify(sectionDetails));
            getSectionIdsSupplier(sectionDetails, cb);

        },
        function (sectionIds,cb) {
            dataSectionIds = sectionIds;

            loginCasesSupplierBranch.logInCases(req.dbName,res, supplierBranchId, sectionIdFromFrontEnd, cb, filter1);

        } ,
        function (singleSectionData1, cb) {
            /*
             *sectionIds : ids of those section for which only section name,
             * section id and category to be send
             */
            singleSectionData = singleSectionData1;
            // console.log("singleSectionData====",singleSectionData);
            getSectionNameByIdForSuperAdmin(req.dbName,res, dataSectionIds, cb);
        },
        function (remainingSectionNames, cb) {
            /* 
             *remainingSectionNames : array of section names
             */
            clubSectionDataAtLogin(singleSectionData, remainingSectionNames, sectionDetails, dataSectionIds, cb);
            // console.log("==========call after ====================================function call");

        }
         ], function (error, result) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    });

}

function getSectionNameById(dbName,res, supplierId, sectionIds, callback) {
    var sql = "select adma.supplier_section_id ,adms.section_name,adms.section_category_id,admscat.section_category_name from supplier ad ";
    sql += " join supplier_authority adma on ad.id = adma.supplier_admin_id join supplier_sections adms on adma.supplier_section_id=adms.id ";
    sql += " join supplier_section_category admscat on adms.section_category_id=admscat.id where ad.id = ? and adma.supplier_section_id in (" + sectionIds + ")";

    multiConnection[dbName].query(sql, [supplierId], function (err, reply) {
        // console.log(sql);
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        } else if (reply.length) {
            callback(null, reply);
        }
    });
}


/*
 *This function is used detials of sections and category of
 * sections by the given sectionIds for super admin
 */


function getSectionNameByIdForSuperAdmin(dbName,res, sectionIds, callback) {
    var sql = "select ads.id as section_id,ads.section_name,adsc.id as section_category_id, adsc.section_category_name";
    sql += " from supplier_sections ads join supplier_section_category adsc on ads.section_category_id = adsc.id WHERE ads.id > 10 ORDER BY ads.id ASC";
    multiConnection[dbName].query(sql, [], function (err, reply) {
        // console.log(sql);
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        } else if (reply.length) {
            callback(null, reply);
        }
    });
}



function getAllSectionDetailsOfSuperAdminSupplier(dbName,res, callback) {
    var sql = "select adms.id as section_id,adms.section_name,adms.section_category_id,adm.section_category_name ";
    sql += "from supplier_sections adms join supplier_section_category adm on adms.section_category_id = adm.id ORDER by adms.id ASC "
    multiConnection[dbName].query(sql, [], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            // console.log("----------------getAllSectionIdofSuperAdmin---" + result);
            callback(null, result);

        }

    })

}


function getSectionIdsSupplier(sectionDetails, cb) {
    var sectionLength = sectionDetails.length;
    var ids = [];
    for (var i = 0; i < sectionLength; i++) {
        (function (i) {
            ids.push(sectionDetails[i].section_id);
            if (i == sectionLength - 1) {
                // console.log("----------------" + ids)
                cb(null, ids);
            }

        }(i))
    }

}

/*
 * This function is used to get detail of sections and category
 * for supplier admin other than sub admin
 */

function getAllSectionDetailsSupplier(dbName,res, supplierId, callback) {
    var sql = "select adma.supplier_section_id as section_id,adms.section_name,adms.section_category_id,admscat.section_category_name from supplier ad ";
    sql += " join supplier_authority adma on ad.id = adma.supplier_admin_id join supplier_sections adms on adma.supplier_section_id=adms.id ";
    sql += " join supplier_section_category admscat on adms.section_category_id=admscat.id where ad.id = ? ORDER BY adma.supplier_section_id ASC ";
    multiConnection[dbName].query(sql, [supplierId], function (err, result) {
        if (err) {
            console.log("err====",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            // console.log("----------------getAllSectionId---" + result);
            callback(null, result);

        }

    })

}


/*
 * This function is used to check the whether admin
 * is active admin or not
 */

function checkSupplierAdminActiveOrNotAtLogin(dbName,res, supplierId, callback, status) {
    //console.log("from checkActiveOrNotAtLogin");
    var TABLE = ' supplier_admin ';
    var sql = "select is_active from " + TABLE + " where id = ? limit 1 ";



    multiConnection[dbName].query(sql, [supplierId], function(err, response) {
        if (err) {
            console.error(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            if (response[0].is_active == 1) {
                callback(null)
            } else {
                async.waterfall([

                    function(cb) {
                        cb(null)
                        // func.insertFailure(res, cb, clientIp, adminId, country, city, mesage,status);
                    }
                ], function(error, reply) {
                    var data = {};
                    sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.SOME_ERROR);
                })
            }
        }
    })
}

function checkSupplierBranchActiveOrNotAtLogin(dbName,res, supplierBranchId, callback, status) {
    //console.log("from checkActiveOrNotAtLogin");
    var TABLE = ' ';

    TABLE = ' supplier_branch ';
    var sql = "select is_live from " + TABLE + " where id = ? limit 1 ";

    //console.log('===supplier branch===', sql);
    multiConnection[dbName].query(sql, [supplierBranchId], function(err, response) {
        if (err) {
            console.error("branch error===", err)
            sendResponse.somethingWentWrongError(res);
        } else {
            //console.log('response===', response[0])
            if (response[0].is_live == 1) {
                callback(null)
            } else {
                async.waterfall([

                    function(cb) {
                        cb(null)
                        // func.insertFailure(res, cb, clientIp, adminId, country, city, mesage,status);
                    }
                ], function(error, reply) {
                    var data = {};
                    sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.SOME_ERROR);
                })
            }
        }
    })
}
/*
 * This function is used to check the whether admin
 * is super admin or not
 */


function checkSupplierSuperAdminOrNot(dbName,res, supplierId, cb) {
    //console.log("from checkSuperAdminOrNot")
    var sql = "select is_superadmin from supplier_admin where id = ? limit 1 ";
    multiConnection[dbName].query(sql, [supplierId], function(err, response) {
        if (err) {
            console.error("err check admin=====", err)
            sendResponse.somethingWentWrongError(res);
        } else {
            //console.log('===response admin or not==', response[0]);
            if (response[0].is_superadmin == 1) {
                //console.log('==err====qqqq');
                cb(null, 1);
            } else {
                //console.log('==err====wwwww');
                cb(null, 0);
            }
        }
    })
}


function assignSupplierCategory(cb, allSectionId) {
    var _ = require('underscore');
    var categoryId = [];
    var categoryData = [];
    //console.log("==============all section ids==========" + JSON.stringify(allSectionId));
    var BreakException = {};
    for (var i = 0; i < 7; i++) {
        (function(i) {
            switch (i) {
                //HOME
                case 0:
                    /*
                     * This loop will execute for the total number of
                     * section assigned to this admin.
                     */
                    var home = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                    if ((_.intersection(home, allSectionId).length)) {
                        categoryId.push({
                            "category_id": 1,
                            "section_ids": _.intersection(home, allSectionId)
                        });
                        //console.log("Home");
                    }

                    break;
                //PROFILE
                case 1:
                    var case1 = false;

                    var profile = [11,12,13,14,15];
                    if ((_.intersection(profile, allSectionId).length)) {
                        categoryId.push({
                            "category_id": 2,
                            "section_ids": _.intersection(profile, allSectionId)
                        });
                        //console.log("Home");
                    }
                    break;
                //PRODUCTION
                case 2:
                    var case2 = false;
                    var production = [16,17,18,19];
                    if ((_.intersection(production, allSectionId).length))
                        categoryId.push({
                            "category_id": 3,
                            "section_ids": _.intersection(production, allSectionId)
                        });
                    break;
                //ORDERS
                case 3:
                    var case3 = false;
                    var orders = [20,21,22];
                    if ((_.intersection(orders, allSectionId).length))
                        categoryId.push({
                            "category_id": 4,
                            "section_ids": _.intersection(orders, allSectionId)
                        });
                    break;
                //ACCOUNT
                case 4:
                    var case4 = false;
                    var account = [23,24,25,26];
                    if ((_.intersection(account, allSectionId).length))
                        categoryId.push({
                            "category_id": 5,
                            "section_ids": _.intersection(account, allSectionId)
                        });
                    break;
                //REPORTS
                case 5:
                    var case5 = false;
                    var reports = [27];
                    if ((_.intersection(reports, allSectionId).length))
                        categoryId.push({
                            "category_id": 6,
                            "section_ids": _.intersection(reports, allSectionId)
                        });
                    break;
                //SETTINGS
                case 6:
                    var case6 = false;
                    var settings = [28,29,30,31,32,33,34,35,36,37,38];
                    if ((_.intersection(settings, allSectionId).length))
                        categoryId.push({
                            "category_id": 7,
                            "section_ids": _.intersection(settings, allSectionId)
                        });
                    break;


                default:
                    break;
            }
            if (i == 6) {
                categoryData.push(categoryId);
                cb(null, categoryData);
            }
        }(i))
    }
}


function getDifference(myArray, toRemove, callback1) {
    //console.log("myarray" + myArray);
    //console.log("toremove" + toRemove);
    var result = [];
    for (var j = 0; j < myArray.length; j++) {
        (function (j) {
            if (toRemove.indexOf(parseInt(myArray[j])) === -1) {
                //console.log(toRemove.indexOf(myArray[j]))
                result.push(myArray[j]);
            }
            if (j == myArray.length - 1) {
                //console.log("result" + result);

                callback1(null, result);
            }
        }(j))
    }
}




/*
 *This function is used to club all the data to be sent
 * at the time of admin login after successfull authentication
 */

function clubSectionDataAtLogin(singleSectionData, remainingSectionNames, sectionDetails, allSectionIds, cb) {
    var home = [];
    var profile = [];
    var production = [];
    var orders = [];
    var account = [];
    var reports = [];
    var settings = [];
    var sectionDetailsLength = sectionDetails.length;


    var loginArrayLength = logInArray.length;
    var singleSectionDataLength = singleSectionData.length;
    var data = [];
    /*
     *This loop is working for seven categories
     */
    for (var i = 0; i < 7; i++) {
        (function (i) {
            switch (i) {
                //HOME
                case 0 :
                    var case0 = false;
                    /*
                     * This loop will execute for the total number of
                     * section assigned to this admin.
                     */
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {

                            var section = {};
                            if (sectionDetails[j].section_id < 10) {
                                case0 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            //console.log("===========singleSectionData1============="+JSON.stringify(singleSectionData));
                                            var singleSectionData1 = singleSectionData[0];
                                            if (Array.isArray(singleSectionData1)) {
                                                var singleSectionData2 = singleSectionData1[0];
                                                // console.log(JSON.stringify(singleSectionData2)+"dfsgdfdsfh");
                                                var c = Object.keys(JSON.parse(JSON.stringify(singleSectionData2)));
                                                var data = {};
                                                //data[sectionDetails[j].sections_name] = singleSectionData2[c[k]];
                                                data["values"] = singleSectionData2[c[k]];
                                                homeData.push(data);
                                                section.data = homeData;
                                                lengthCheck = true
                                            }
                                            else {

                                                //console.log(JSON.stringify(singleSectionData1)+"dfsgdfdsfh");
                                                var c = Object.keys(JSON.parse(JSON.stringify(singleSectionData1)));
                                                var data = {};
                                                //data[sectionDetails[j].sections_name] = singleSectionData1[c[k]];
                                                data["values"] = singleSectionData1[c[k]];
                                                homeData.push(data);
                                                section.data = homeData;
                                                lengthCheck = true;
                                            }

                                        }
                                        else if (k == loginArrayLength - 1 && !lengthCheck) {
                                            section.data = [];
                                        }


                                    }(k))
                                }
                                home.push(section);
                            }
                            else {
                                if (sectionDetails[j].section_id == 10) {
                                    case0 = true;
                                    section.section_name = sectionDetails[j].sections_name;
                                    section.section_id = sectionDetails[j].section_id;
                                    var lengthCheck = false;
                                    for (var k = 0; k < loginArrayLength; k++) {
                                        (function (k) {
                                            if (logInArray[k] == sectionDetails[j].section_id) {
                                                var singleSectionData1 = singleSectionData[0];
                                                if (Array.isArray(singleSectionData1)) {
                                                    //var homeData =[];
                                                    // var data ={};
                                                    var single = singleSectionData[singleSectionDataLength - 1]
                                                    //data = single[0]
                                                    //console.log("=====data 0 ====" + JSON.stringify(single));

                                                    //homeData.push(single);
                                                    //section.data =homeData;
                                                    section.data = single;
                                                    lengthCheck = true;
                                                }
                                                else {
                                                    //  var homeData =[];
                                                    // var data ={};
                                                    //data = singleSectionData;
                                                    // homeData.push(data);
                                                    //  section.data =homeData;
                                                    section.data = singleSectionData;
                                                    lengthCheck = true;
                                                }

                                            }
                                            else if (k == loginArrayLength - 1 && !lengthCheck) {
                                                section.data = [];
                                            }
                                        }(k))
                                    }
                                    home.push(section);
                                }

                            }

                            if (j == sectionDetailsLength - 1 && case0 == true) {

                                data.push({"category_id": 1, "category_name": "HOME", "category_data": home});
                                //console.log(JSON.stringify(data));

                            }
                        }(j))
                    }
                    break;
                //PROFILE
                case 1 :
                    var case1 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 10 && sectionDetails[j].section_id < 16) {
                                case1 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //console.log(singleSectionData1);
                                            //var data = {};
                                            //data = singleSectionData1;
                                            // homeData.push(singleSectionData1);
                                            section.data = singleSectionData1;
                                            lengthCheck = true;
                                        }
                                        else if (k == loginArrayLength - 1 && !lengthCheck) {
                                            section.data = [];
                                        }

                                    }(k))
                                }
                                profile.push(section);

                            }
                            if (j == sectionDetailsLength - 1 && case1 == true) {
                                data.push({"category_id": 2, "category_name": "PROFILE", "category_data": profile});
                            }

                        }(j))
                    }
                    break;
                //PRODUCTION
                case 2 :
                    var case2 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 15 && sectionDetails[j].section_id < 20) {
                                case2 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //console.log(singleSectionData1);
                                            //var data = {};
                                            //data = singleSectionData1;
                                            // homeData.push(singleSectionData1);
                                            section.data = singleSectionData1;
                                            lengthCheck = true;
                                        }
                                        else if (k == loginArrayLength - 1 && !lengthCheck) {
                                            section.data = [];
                                        }
                                    }(k))
                                }
                                production.push(section);

                            }
                            if (j == sectionDetailsLength - 1 && case2 == true) {
                                data.push({
                                    "category_id": 3,
                                    "category_name": "PRODUCTION",
                                    "category_data": production
                                });
                            }

                        }(j))
                    }
                    break;
                //ORDERS
                case 3 :
                    var case3 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 19 && sectionDetails[j].section_id < 25) {
                                case3 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //console.log(singleSectionData1);
                                            //var data = {};
                                            //data = singleSectionData1;
                                            // homeData.push(singleSectionData1);
                                            section.data = singleSectionData1;
                                            lengthCheck = true;
                                        }
                                        else if (k == loginArrayLength - 1 && !lengthCheck) {
                                            section.data = [];
                                        }
                                    }(k))
                                }
                                orders.push(section);

                            }
                            if (j == sectionDetailsLength - 1 && case3 == true) {
                                data.push({"category_id": 4, "category_name": "ORDERS", "category_data": orders});
                            }


                        }(j))
                    }
                    break;
                //ACCOUNT
                case 4 :
                    var case4 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 24 && sectionDetails[j].section_id < 29) {
                                case4 = true
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //console.log(singleSectionData1);
                                            //var data = {};
                                            //data = singleSectionData1;
                                            // homeData.push(singleSectionData1);
                                            section.data = singleSectionData1;
                                            lengthCheck = true;
                                        }
                                        else if (k == loginArrayLength - 1 && !lengthCheck) {
                                            section.data = [];
                                        }
                                    }(k))
                                }
                                account.push(section);

                            }
                            if (j == sectionDetailsLength - 1 && case4 == true) {
                                data.push({"category_id": 5, "category_name": "ACCOUNT", "category_data": account});
                            }


                        }(j))
                    }
                    break;
                //REPORTS
                case 5 :
                    var case5 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 28 && sectionDetails[j].section_id < 35) {
                                case5 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //console.log(singleSectionData1);
                                            //var data = {};
                                            //data = singleSectionData1;
                                            // homeData.push(singleSectionData1);
                                            section.data = singleSectionData1;
                                            lengthCheck = true;
                                        }
                                        else if (k == loginArrayLength - 1 && !lengthCheck) {
                                            section.data = [];
                                        }
                                    }(k))
                                }
                                reports.push(section);

                            }
                            if (j == sectionDetailsLength - 1 && case5 == true) {
                                data.push({"category_id": 6, "category_name": "REPORTS", "category_data": reports});
                            }


                        }(j))
                    }
                    break;
                //SETTINGS
                case 6 :
                    var case6 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 34 && sectionDetails[j].section_id < 46) {
                                case6 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //console.log(singleSectionData1);
                                            //var data = {};
                                            //data = singleSectionData1;
                                            // homeData.push(singleSectionData1);
                                            section.data = singleSectionData1;
                                            lengthCheck = true;
                                        }
                                        else if (k == loginArrayLength - 1 && !lengthCheck) {
                                            section.data = [];
                                        }
                                    }(k))
                                }
                                settings.push(section);

                            }
                            if (j == sectionDetailsLength - 1 && case6 == true) {
                                data.push({"category_id": 7, "category_name": "SETTINGS", "category_data": settings});
                            }

                        }(j))
                    }
                    break;


                default :
                    break;
            }
            if (i == 6) {
                cb(null, data);
            }
        }(i))
    }

}

exports.supplierForgetPassword  = function(req,reply){
    logger.debug("==================entered in supplierforgot password=====================")
   var password;
    var supplierId  =0;
    var superAd  =1;
    var id=0;
    var supplierName ;
    var supperAdminSupplierId = 0;
    async.auto({
        getValue:function(cb){
            if(!(req.body.email)){
                var msg = "supplier email not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                supplierId = req.body.email;
            }
            cb(null);
        },
        checkSupplier:['getValue',function (cb) {
            // var sql='select sa.id,s.id as supplier_id from supplier s join supplier_admin sa on s.id =sa.supplier_id where s.email = ? ';
            var sql='select sa.id,sa.supplier_id as supplier_id from supplier_admin sa where sa.email  = ? ';
            multiConnection[req.dbName].query(sql,[supplierId],function (err,result) {
               console.log("mdfsf",err,result)
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    if(result.length){
                        id=result[0].id;
                        supperAdminSupplierId = result[0].supplier_id;
                        cb(null);
                    }
                    else {
                        var msg = "EmailId not exist";
                        sendResponse.sendErrorMessage(msg, reply, 400);
                    }
                }
            })
        }],
        checkSuperAdmin:['checkSupplier',function (cb) {
            console.log("supplier id ", id);
            var sql='select is_superadmin from supplier_admin where id = ? ';
            multiConnection[req.dbName].query(sql,[id],function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    if(result.length){
                        superAd=result[0].is_superadmin
                    }
                    console.log("superAd ", superAd);
                    cb(null)
                   
                }
            })
        }],
        getPassword:['checkSuperAdmin',function (cb) {
            func.generateRandomString(function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    password = result;
                    
                    cb(null);
                }
            })
        }],
        updatePassword:['getPassword',function(cb){
          var  newpassword = md5(password);
           logger.debug("=========================...",password);
            logger.debug("==================..............",newpassword);
            if(superAd){
                var sql = "update supplier s join supplier_admin sa on s.id = sa.supplier_id set s.password = ?,sa.password = ? where s.email  = ? and sa.is_superadmin=1 ";
                multiConnection[req.dbName].query(sql,[newpassword,newpassword,supplierId],function (err,result) {
                    if(err){
                        cb(err)
                    }
                    else {
                        cb(null);
                    }
                })
            }
            else {
                var sql = "update supplier_admin sa set sa.password = ? where sa.email  = ? ";
                multiConnection[req.dbName].query(sql,[newpassword,supplierId],function (err,result) {
                    if(err){
                        cb(err)
                    }
                    else {
                        cb(null);
                    }
                })
            }
           
        }],
        getSupplierName:['updatePassword',function (cb) {
           var sql='select name from supplier where id = ? LIMIT 1' 
            multiConnection[req.dbName].query(sql,[supperAdminSupplierId],function (err,result) {
                if(err){
                    cb(err)
                }
                else {
                    if(result.length){
                        supplierName=result[0].name;
                    }
                    cb(null);
                }
            })
        }],
        sendSupplierMail:['getSupplierName',function(cb){
            emailTemp.supplierResetpassword(req,reply,supplierId,supplierName,password,function(err,result){
                if(err){
                    console.log("..****send email*****....",err);
                }
            })
            console.log("..................send mail");
            cb(null)
        }],
    },function(err,result){
        if(err){

            var msg = "some thing went wrong ";
            sendResponse.sendErrorMessage(msg, reply, 500);
            //   sendResponse.somethingWentWrongError(reply); 
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply, constant.responseStatus.SUCCESS);
        }
    })
}

exports.supplierBranchForgetPassword = function(req,res){
    var password;
    var emailId  = 0;
    var supplierName;
    async.auto({
        getValue:function(cb){
            if(!(req.body.email)){
                var msg = "email not found";
                return sendResponse.sendErrorMessage(msg,res,400);
            }else{
                emailId = req.body.email;
            }
            cb(null);
        },
        checkSupplier:['getValue',function (cb) {
            var sql='select * from supplier_branch where email = ?';
            multiConnection[req.dbName].query(sql,[emailId],function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if(result.length){
                        cb(null);
                    }
                    else {
                        var msg = "EmailId not exist";
                        sendResponse.sendErrorMessage(msg, res, 400);
                    }
                }
            })
        }],
        getPassword:['checkSupplier',function (cb) {
            func.generateRandomString(function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    password = result;
                    cb(null);
                }
            })
        }],
        updatePassword:['getPassword',function(cb){
            var  newpassword = md5(password);
            console.log("...",password);
            console.log("..............",newpassword);
            var sql = "update supplier_branch s set s.password = ? where s.email  = ? ";
            multiConnection[req.dbName].query(sql,[newpassword,emailId],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })
        }],
        getSupplierName:['updatePassword',function (cb) {
            var sql='select name from supplier_branch where email = ? '
            multiConnection[req.dbName].query(sql,[emailId],function (err,result) {
                console.log("...................err...........get supplier name.........",err,result);

                if(err){
                    cb(err)
                }
                else {
                    if(result.length){
                        supplierName=result[0].name;
                    }
                    cb(null);
                }
            })
        }],
        sendSupplierMail:['getSupplierName',function(cb){
            emailTemp.supplierResetpassword(req,res,emailId,supplierName,password,function(err,result){
                if(err){
                    console.log("..****send email*****....",err);
                }
            })
            console.log("..................send mail");
            cb(null)
        }],
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}




exports.supplierIOsBranchForgetPassword = function(req,res){
    var password;
    var emailId  = 0;
    async.auto({
        getValue:function(cb){
            if(!(req.body.emailId)){
                var msg = "email not found"
                return sendResponse.sendErrorMessage(msg,res,400);
            }else{
                emailId = req.body.emailId;
            }
            cb(null);
        },
        checkSupplier:['getValue',function (cb) {
            var sql='select * from supplier_branch where email = ?';
            multiConnection[req.dbName].query(sql,[emailId],function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if(result.length){
                        cb(null);
                    }
                    else {
                        var msg = "EmailId not exist";
                        sendResponse.sendErrorMessage(msg, res, 400);
                    }
                }
            })
        }],
        getPassword:['checkSupplier',function (cb) {
            func.generateRandomString(function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    password = result;
                    cb(null);
                }
            })
        }],
        updatePassword:['getPassword',function(cb){
            var  newpassword = md5(password);
            var sql = "update supplier_branch set password = ? where email  = ?";
            multiConnection[req.dbName].query(sql,[newpassword,emailId],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })
        }],
        sendMail:['getValue',function(cb){
            var subject = "royo";
            var content = "You seem to have forgotten your password. New Details are : \n\n";
            content+="Email : "+emailId +" \n";
            content+="Password : "+password +" \n";
            content+="Thank You \n";
            content+="\n\n"
            content+="Team royo \n";
            func.sendMailthroughSMTP(res,subject,emailId,content,1,function(err,result){
                if(err){
                    cb(err);
                }else{
                    cb(null)
                }
            });
        }]
    },function(err,result){
        if(err){
            var msg = "something went wrong";
            sendResponse.sendErrorMessage(msg,res,400);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res,200);
        }
    })
}


exports.supplierIosForgetPassword  = function(req,reply){
    var password;
    var supplierId  =0;
    var supplierName ;
    
    console.log("...........................rewq..........",req.body);
    
    
    async.auto({
        getValue:function(cb){
            if(!(req.body.emailId)){
                var msg = "supplier email not found"
                return sendResponse.sendErrorMessage(msg,reply,400);
            }else{
                supplierId = req.body.emailId;
            }
            cb(null);
        },
        checkSupplier:['getValue',function (cb) {
            var sql='select * from supplier s join supplier_admin sa on s.id =sa.supplier_id where s.email = ? '
            multiConnection[req.dbName].query(sql,[supplierId],function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    if(result.length){
                        cb(null);
                    }
                    else {
                        var msg = "EmailId not exist";
                        sendResponse.sendErrorMessage(msg, reply, 400);
                    }
                }
            })
        }],
        getPassword:['checkSupplier',function (cb) {
            func.generateRandomString(function (err,result) {
                if(err){
                    console.log("err1",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    password = result;
                    cb(null);
                }
            })
        }],
        updatePassword:['getPassword',function(cb){
            var  newpassword = md5(password);
            console.log("...",password);
            console.log("..............",newpassword);
            var sql = "update supplier s join supplier_admin sa on s.id = sa.supplier_id set s.password = ?,sa.password = ? where s.email  = ? ";
            multiConnection[req.dbName].query(sql,[newpassword,newpassword,supplierId],function (err,result) {
              
              console.log("........updatePassword.................",err,result);
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    cb(null);
                }
            })
        }],
        getSupplierName:['updatePassword',function (cb) {
            var sql='select name from supplier where email = ? LIMIT 1'
            multiConnection[req.dbName].query(sql,[supplierId],function (err,result) {

                console.log("........getSupplierName.................",err,result);

                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    if(result.length){
                        supplierName=result[0].name;
                    }
                    cb(null);
                }
            })
        }],
        sendSupplierMail:['getSupplierName',function(cb){
            emailTemp.supplierResetpassword(req,reply,supplierId,supplierName,password,function(err,result){
                if(err){
                    console.log("..****send email*****....",err);
                }
            })


            cb(null)
        }],
        /*      sendMail:['getValue',function(cb){
         /!*var subject = "SUPPLIER RESET PASSWORD";*!/
         /!*var content = "You seem to have forgotten your password. New Details are : \n\n";
         content+="Email : "+supplierId +" \n";
         content+="Password : "+password +" \n";
         content+="Thank You \n";
         content+="\n\n"
         content+="Team royo \n";

         *!/



         }]*/
    },function(err,result){
        if(err){
            var msg = "something went wrong";
            sendResponse.sendErrorMessage(msg,res,400);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, reply,200);
        }
    })
}


exports.dashBoardTicker = function(req,reply){

    var urgentCount;
    var totalPrice;
    var sudOrder;
    console.log("..........req.body.......................",req.body);
    
    var supplierId = 0;
    async.auto({
        getSupplierId:function(cb){
            var sql='select id from supplier where access_token = ?'
            multiConnection[req.dbName].query(sql,[req.body.accessToken],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    
                    console.log("************************************************",err,result);
                    
                    if(result.length){
                        
                        supplierId = result[0].id;
                        cb(null);
                    }else{
                        sendResponse.somethingWentWrongError(reply);
                    }

                }
            })
        },
        pendingOrder:['getSupplierId',function(cb){
            var sql='select count(o.id) as ids from orders o join supplier_branch sb on sb.id = o.supplier_branch_id join supplier s ' +
                ' on s.id = sb.supplier_id where  s.id = ?  and  o.urgent = 1'
            multiConnection[req.dbName].query(sql,[supplierId],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    if(result.length){
                        urgentCount = result[0].ids;
                        cb(null);
                    }else{
                        urgentCount = 0;
                        cb(null);
                    }

                }
            })
        }],
       totalRen:['getSupplierId',function(cb){
            var sql="select sum(o.net_amount)  as sums  from orders o join supplier_branch sb on sb.id = o.supplier_branch_id join supplier s " +
                " on s.id = sb.supplier_id where s.id = ? ";
            multiConnection[req.dbName].query(sql,[supplierId],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    if(result.length){
                        console.log(".........result..........",result);
                        totalPrice = result[0].sums;
                        cb(null);
                    }else{
                        totalPrice = 0;
                        cb(null);
                        
                        
                    }
                }
            })
        }],
        schOrder:['getSupplierId',function(cb) {
            var sql='select count(o.id) as ids from orders o join supplier_branch sb on sb.id = o.supplier_branch_id join supplier s ' +
                ' on s.id = sb.supplier_id where  s.id = ?  and  o.status  = 9'
            multiConnection[req.dbName].query(sql,[supplierId],function (err,result) {
                if(err){
                    console.log("err",err);
                    sendResponse.somethingWentWrongError(reply);
                }
                else {
                    if(result.length){
                        sudOrder = result[0].ids;
                        cb(null);
                    }else{
                        sudOrder = 0;
                        cb(null);
                    }

                }
            })
        }]

    },function(err,result){
        
        if(err){
            var msg = "something went wrong";
            sendResponse.sendErrorMessage(msg,res,400);
        }else{
            sendResponse.sendSuccessData({urgentCount:urgentCount,sudOrder:sudOrder,totalPrice:totalPrice}, constant.responseMessage.SUCCESS, reply,4);
        }
    })

}