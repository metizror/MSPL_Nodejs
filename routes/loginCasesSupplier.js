
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var homeLoginDataSupplier = require('./homeLoginDataSupplier');
var loginFuncSupplier = require('./loginfunctionsupplier'); //need to update
var supplierProfile = require('./supplierProfile');
var supplierSummary=require('./supplierSummarySetup');
var supplierOrder=require('./supplierorder');
var supplierAccount= require('./supplierAccount');
var packagesAndPromotions= require('./supplierPackagesAndPromotions');
var summaryIndication = require('./supplierSummaryIndication')


/*
 * This function is used to find sectionIds out of given sectionIds as input,
 * data of these sectionIds
 * will send to the user to be display on home screen after logged in.
 */

exports.logInCases = function (dbName,res, sectionIds, supplierId, cb, filter1) {

    var sectionIdsLength = sectionIds.length;
    var homeCheck = false;
    logInArray.length = 0;
    var case10Check = false;

    /*This loop will continue till the length of sectionIds
     * i.e., total number ids assigned to the admin
     */
    console.log("supplier id in login case",supplierId);
    console.log('===section id from login cases===',sectionIds);
    console.log('===section id from login casessssssssssssssss===',sectionIdsLength);
    var BreakException = {};
    try {
        if(sectionIdsLength>0){
        for (var i = 0; i <= sectionIdsLength - 1; i++) {




            (function (i) {
                //console.log("=========value of i============" + i);
                /*
                 *This is the condition when admin has access to the
                 * Home Category, and not require further data(after Home Category)
                 * for home screen
                 */
                if ((sectionIds[i] > 10 && homeCheck)) {
                    if (case10Check) {
                        //console.log("herrrrrrrrrr")
                        homeLoginDataSupplier.getHomeData(dbName,res, cb, filter1,supplierId ,1);
                        throw BreakException;
                    } else {
                      //  console.log("getting break exception");
                        homeLoginDataSupplier.getHomeData(dbName,res, cb, filter1,supplierId , 0);
                        throw BreakException;
                    }
                }
                else {
                    console.log("entering in switch",sectionIds[i]);
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
                            case10Check = true;

                            break;
                        case 11 :
                            console.log("hello from 11");
                            logInArray.push(sectionIds[i]);
                            supplierProfile.getSupplierData(dbName,supplierId,res,cb);
                            throw BreakException;
                            break;
                        case 12 :
                            logInArray.push(sectionIds[i]);
                            console.log("hello from case 12");
                            loginFuncSupplier.listofSubsupplier(dbName,res,supplierId,cb)
                            throw BreakException;
                            break;
                        case 13 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 13");
                            loginFuncSupplier.showBranchListing(dbName,supplierId,res,cb);

                            throw BreakException;
                            break;
                        case 14 :
                            logInArray.push(sectionIds[i]);
                          //  console.log("hello from case 14");
                            supplierProfile.getSupplierDataTab3(dbName,supplierId,res,cb);
                            throw BreakException;
                            break;
                        case 15 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 15");
                            summaryIndication.getCountryListWithId(dbName,res,cb,supplierId);
                            throw BreakException;
                            break;
                        case 16 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 16");
                            loginFuncSupplier.listSupplierProducts(dbName,res,supplierId,cb);
                            throw BreakException;
                            break;
                        case 17 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 17");
                            loginFuncSupplier.productinfo(dbName,res,supplierId,cb);
                            throw BreakException;
                            break;
                        case 18 :
                            logInArray.push(sectionIds[i]);
                          //  console.log("hello from case 18");
                            loginFuncSupplier.productinfo(dbName,res,supplierId,cb);
                            throw BreakException;
                            break;
                        case 19 :
                            logInArray.push(sectionIds[i]);
                          //  console.log("hello from case 19");
                            packagesAndPromotions.listSupplierCategories(dbName,res,supplierId,cb);
                            throw BreakException;
                            break;
                        case 20 :
                            logInArray.push(sectionIds[i]);
                          //  console.log("hello from case 20");
                            loginFuncSupplier.listSupplierOrder(dbName,res,supplierId,cb);
                            throw BreakException;
                            break;
                        case 21 :
                            logInArray.push(sectionIds[i]);
                         //   console.log("hello from case 21");
                            loginFuncSupplier.supplierScheduleOrdersList(dbName,res,supplierId,cb)
                            throw BreakException;
                            break;
                        case 22 :
                            logInArray.push(sectionIds[i]);
                         //   console.log("hello from case 22");
                            supplierOrder.trackedOrders(res,supplierId,cb);
                            throw BreakException;
                            break;
                        case 23 :
                            logInArray.push(sectionIds[i]);
                          //  console.log("hello from case 23");
                            supplierAccount.accountPayableListing(res,supplierId,'','','',cb);
                            throw BreakException;
                            break;
                        case 24 :
                            logInArray.push(sectionIds[i]);
                          //  console.log("hello from case 24");
                            supplierAccount.accountReceivableListing(res,supplierId,'','','',cb);
                            throw BreakException;
                            break;
                        case 25 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 25");
                            cb(null,[]);
                            throw BreakException;
                            break;
                        case 26 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 26");
                            cb(null,[]);
                            throw BreakException;
                            break;
                        case 27 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 27");
                            throw BreakException;
                            break;
                        case 28 :
                            logInArray.push(sectionIds[i]);
                            //console.log("hello from case 28");
                            throw BreakException;
                            break;
                        case 29 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 29");
                            throw BreakException;
                            break;
                        case 30 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 30");
                            throw BreakException;
                            break;
                        case 31 :
                            logInArray.push(sectionIds[i]);
                           // console.log("hello from case 31");
                            throw BreakException;
                            break;
                        case 32 :
                            logInArray.push(sectionIds[i]);
                            //console.log("hello from case 32");
                            throw BreakException;
                            break;
                        case 33 :
                            logInArray.push(sectionIds[i]);
                            //console.log("hello from case 32");
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
                console.log("bvhfjdfssdfdfsdssdfdsf",homeCheck,i)
                if (homeCheck && i == sectionIdsLength - 1) {
                    /*
                     * If case 10 is assigned to  get data
                     */
                   console.log("in home check and section ids");
                    if (case10Check) {
                        
                        homeLoginDataSupplier.getHomeData(res, cb, filter1,supplierId, 1);
                        throw BreakException;
                    }
                    else {
                        homeLoginDataSupplier.getHomeData(res, cb, filter1,supplierId, 0);
                        throw BreakException;
                    }
                }
            }(i));
        }
    }
    else{
        cb(null,{})
    }
    } catch (e) {
        console.log("errrrr",e);
        console.log("===================== caught out of loop =======================");
    }

}