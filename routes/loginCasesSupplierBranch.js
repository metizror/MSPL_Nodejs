/**
 * Created by cbl97 on 12/5/16.
 */

var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var homeLoginDataSupplierBranch = require('./homeLoginDataSupplierBranch');
var loginFunc = require('./loginFunctions'); //need to update
var supplierProduct = require('./supplierproduct');
var loginFunctionSupplierBranch = require('./loginFunctionSupplierBranch');
/*
 * This function is used to find sectionIds out of given sectionIds as input,
 * data of these sectionIds
 * will send to the user to be display on home screen after logged in.
 */

exports.logInCases = function (dbName,res,  supplierBranchId, sectionIdFromFrontEnd, cb, filter1) {

    var homeCheck = false;
    logInArray.length = 0;
    var case10Check = false;

    if(sectionIdFromFrontEnd.toString()!='')
        var sectionIds = [parseInt(sectionIdFromFrontEnd)]
    else
        var sectionIds =[1,2,3,4,5,6,7,8,9,10];
  //  console.log("welcome in login case");
  //  console.log("section id===[",sectionIds);


    var sectionIdsLength = sectionIds.length;
    /*This loop will continue till the length of sectionIds
     * i.e., total number ids assigned to the admin
     */
    var BreakException = {};
    try {
        for (var i = 0; i <= sectionIdsLength - 1; i++) {

            (function (i) {
             //   console.log("=========value of i============" + i);
                /*
                 *This is the condition when admin has access to the
                 * Home Category, and not require further data(after Home Category)
                 * for home screen
                 */
                if ((sectionIds[i] > 10 && homeCheck)) {
                    if (case10Check) {
                     //   console.log("herrrrrrrrrr")
                        homeLoginDataSupplierBranch.getHomeData(dbName,res, cb, filter1,supplierBranchId ,1);
                        throw BreakException;
                    } else {
                      //  console.log("getting break exception");
                        homeLoginDataSupplierBranch.getHomeData(dbName,res, cb, filter1,supplierBranchId , 0);
                        throw BreakException;
                    }
                }
                else {
                    switch (sectionIds[i]) {
                        case 1 :
                            console.log("case 1 in logincasesSupplier");
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 2 :
                            console.log("case 2 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 3 :
                            console.log("case 3 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 4 :
                            console.log("case 4 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 5 :
                            console.log("case 5 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 6 :
                            console.log("case 6 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 7 :
                            console.log("case 7 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 8 :
                            console.log("case 8 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 9 :
                            console.log("case 9 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 10 :
                            console.log("case 10 in logincasesSupplier");

                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 11 :
                            console.log("hello from 11");
                            logInArray.push(sectionIds[i]);
                            loginFunctionSupplierBranch.getSupplierData(dbName,supplierBranchId,res,cb);
                            throw BreakException;
                            break;
                        case 12 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 12");
                            // loginFunc.cityProfile(res,"",cb);
                            cb(null,[{"data":null}]);
                            throw BreakException;
                            break;
                        case 13 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 13");
                            cb(null,[{"data":null}]);

                            throw BreakException;
                            break;
                        case 14 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 20");
                            cb(null,[{"data":null}]);
                            throw BreakException;
                            break;
                        case 15 :
                            logInArray.push(sectionIds[i]);
                            cb(null,[{"data":null}]);
                            console.log("hello from case 15");
                            throw BreakException;
                            break;
                        case 16 :
                            logInArray.push(sectionIds[i]);
                            loginFunctionSupplierBranch.productInfo(dbName,supplierBranchId,res,cb);
                            throw BreakException;
                            break;
                        case 17 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 17");
                            loginFunctionSupplierBranch.productDescription(dbName,supplierBranchId,res,cb);

                            throw BreakException;
                            break;
                        case 18 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 24");
                            loginFunctionSupplierBranch.productDescription(dbName,supplierBranchId,res,cb);
                            throw BreakException;
                            break;
                        case 19 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 25");
                            throw BreakException;
                            break;
                        case 20 :
                            logInArray.push(sectionIds[i]);
                            func.getAllRegisteredAdmins(dbName,res, adminId, 1, cb);
                            console.log("hello from case 26");
                            throw BreakException;
                            break;
                        case 21 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 27");
                            loginFunc.listCategories(dbName,res,cb);
                            throw BreakException;
                            break;
                        case 22 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case pass category id 28");
                            loginFunc.getSubCategories(dbName,"",res,cb);
                            throw BreakException;
                            break;
                        case 23 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 29");
                            loginFunc.getListOfSubCategoriesForDetailed(dbName,res,cb,"");
                            throw BreakException;
                            break;
                        case 24 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 30");
                            loginFunc.listOfProducts(res,cb);
                            throw BreakException;
                            break;
                        case 25 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 31");
                            throw BreakException;
                            break;
                        case 26 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 32");
                            throw BreakException;
                            break;
                        case 27 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 33");
                            throw BreakException;
                            break;
                        case 28 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 34");
                            throw BreakException;
                            break;
                        case 29 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 35");
                            throw BreakException;
                            break;
                        case 30 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 36");
                            throw BreakException;
                            break;
                        case 31 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 37");
                            throw BreakException;
                            break;
                        case 32 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 38");
                            throw BreakException;
                            break;
                        case 33 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 39");
                            throw BreakException;
                            break;
                        case 34 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 40");
                            throw BreakException;
                            break;
                        case 35 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 41");
                            throw BreakException;
                            break;
                        case 36 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 42");
                            throw BreakException;
                            break;
                        case 37 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 43");
                            throw BreakException;
                            break;
                        case 38 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 44");
                            throw BreakException;
                            break;



                        default :
                            var data = {};
                            sendResponse.sendSuccessData(data,constant.responseMessage.INVALID_SECTION_ID,res,constant.responseStatus.SOME_ERROR);
                            throw BreakException;
                            break;

                    }

                }

                /*
                 * This is the condition when loop will be at the last stage
                 * and atleast on case will be assigned(homeCheck will be true)
                 */

                if (homeCheck && i == sectionIdsLength - 1) {
                    /*
                     * If case 10 is assigned to  get data
                     */
                    console.log("in home check and section ids");
                    if (case10Check) {
                        homeLoginDataSupplierBranch.getHomeData(res, cb, filter1,supplierBranchId, 1);
                        throw BreakException;
                    }
                    else {
                        homeLoginDataSupplierBranch.getHomeData(res, cb, filter1,supplierBranchId, 0);
                        throw BreakException;
                    }


                }


            }(i));
        }
    } catch (e) {
        console.log("===================== caught out of loop =======================")
    }


}