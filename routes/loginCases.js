/**
 * Created by vinay on 9/2/16.
 */


var requestIp = require('request-ip');
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var homeLoginData = require('./homeLoginData');
var loginFunc = require('./loginFunctions');
var adminOrders = require('./adminOrders');
var adminAccounts = require('./adminAccounts');
var currencyObj = require('./currencyProfile');
var supplerReg = require('./supplierReg');
var reports = require('./Reports');

var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';

/*
 * This function is used to find sectionIds out of given sectionIds as input,
 * data of these sectionIds
 * will send to the user to be display on home screen after logged in.
 */

exports.logInCases = function (db_name,res, sectionIds, adminId, cb, filter1) {

    logger.debug("==================entered in login cases====================");
    var sectionIdsLength = sectionIds.length;
    var homeCheck = false;
    logInArray.length = 0;
    var case16Check = false;

    /*This loop will continue till the length of sectionIds
     * i.e., total number ids assigned to the admin
     */
    logger.debug("==================length of section IDs====================",sectionIdsLength);
    var BreakException = {};
    try {
        for (var i = 0; i <= sectionIdsLength - 1; i++) {

            (function (i) {
            logger.debug("=========value of i============" + i);
                /*
                 *This is the condition when admin has access to the
                 * Home Category, and not require further data(after Home Category)
                 * for home screen
                 */
                if ((sectionIds[i] > 16 && homeCheck)) {
                    if (case16Check) {

                       logger.debug("herrrrrrrrrr")
                        homeLoginData.getHomeData(db_name,res, cb, filter1, 1);
                        throw BreakException;
                    } else {
                       logger.debug("herr%%%%rrrrrrrr")
                        homeLoginData.getHomeData(db_name,res, cb, filter1, 0);
                        throw BreakException;
                    }
                }
                else {
                    switch (sectionIds[i]) {
                        case 1 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 2 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 3 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 4 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 5 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 6 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 7 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 8 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 9 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 10 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 11 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 12 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 13 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 15 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;
                        case 14 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            break;

                        case 16 :
                            logInArray.push(sectionIds[i]);
                            homeCheck = true;
                            case16Check = true;
                            break;
                        case 17 :
                            logger.debug("hello from case 17");
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from >>>>>case 17*");
                            loginFunc.countryProfile(db_name,res, cb);
                            logger.debug("hello from case 17*DDDD*");
                            throw BreakException;
                            break;
                        case 18 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 18");
                            loginFunc.cityProfile(db_name,res,"",cb);
                            throw BreakException;
                            break;
                        case 19 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 19");
                            loginFunc.listCountryCity(db_name,res,cb,"");
                            throw BreakException;
                            break;
                        case 20 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 20");
                            loginFunc.listCountryCity(db_name,res,cb,"");
                            throw BreakException;
                            break;
                        case 21 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 21");
                            loginFunc.clientProfile(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 22 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 22*******************");
                            
                            supplerReg.getRegSupplier(db_name,res,cb);
                            logger.debug("hello from case 22+++++++++++++++++++");
                            throw BreakException;
                            break;
                        case 23 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 23");
                            loginFunc.listSuppliers(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 24 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 24");
                            currencyObj.getCountryWithCurrencyAndDefaultTrue(db_name,res, cb);
                            throw BreakException;
                            break;
                        case 25 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 25");
                            loginFunc.listSuppliers(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 26 :
                            logInArray.push(sectionIds[i]);
                            func.getAllRegisteredAdmins(db_name,res, adminId, 1, cb);
                            logger.debug("hello from case 26");
                            throw BreakException;
                            break;
                        case 27 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 27");
                            
                            loginFunc.listCategories(db_name,res,cb);
                            logger.debug("===========BreakException==============",BreakException)
                            throw BreakException;
                            break;
                        case 28 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case pass category id 28");
                            loginFunc.getSubCategories(db_name,"",res,cb);
                            throw BreakException;
                            break;
                        case 29 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 29");
                            loginFunc.getListOfSubCategoriesForDetailed(db_name,res,cb,"");
                            throw BreakException;
                            break;
                        case 30 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 30");
                            loginFunc.getCategories(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 31 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 31");
                            loginFunc.getCategories(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 32 :

                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 32");
                            loginFunc.pendingApprovalProducts(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 33 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.listSuppliers(db_name,res,cb);
                            logger.debug("hello from case 33");
                            throw BreakException;
                            break;
                        case 34 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 34");
                            loginFunc.getLoyaltyPoints(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 35 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.listSuppliers(db_name,res,cb);
                            logger.debug("hello from case 35");
                            throw BreakException;
                            break;
                        case 36 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.adminOrders(res,cb);
                            logger.debug("hello from case 36");
                            throw BreakException;
                            break;
                        case 37 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.adminScheduleOrdersList(res,cb);
                            logger.debug("hello from case 37");
                            throw BreakException;
                            break;
                        case 38 :
                            logInArray.push(sectionIds[i]);
                            adminOrders.trackedOrders(db_name,res,cb);
                            logger.debug("hello from case 38");
                            throw BreakException;
                            break;
                        case 39 :
                            logInArray.push(sectionIds[i]);
                           loginFunc.rateCommentListing(db_name,res,cb);
                           logger.debug("hello from case 39");
                            throw BreakException;
                            break;
                        case 40 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.feedbackList(db_name,res,cb)
                            logger.debug("hello from case 40");
                            throw BreakException;
                            break;
                        case 41 :
                            logInArray.push(sectionIds[i]);
                            adminAccounts.accountPayableListing(db_name,res,cb);
                            logger.debug("hello from case 41");
                            throw BreakException;
                            break;
                        case 42 :
                            logInArray.push(sectionIds[i]);
                            adminAccounts.accountReceivableListing(db_name,res,cb);
                            logger.debug("hello from case 42");
                            throw BreakException;
                            break;
                        case 43 :
                            logInArray.push(sectionIds[i]);
                            adminAccounts.getStatement(db_name,res,'','1990-01-01','2100-01-01',cb);
                            logger.debug("hello from case 43");
                            throw BreakException;
                            break;
                        case 44 :
                            logInArray.push(sectionIds[i]);
                            adminAccounts.getStatement(db_name,res,'','1990-01-01','2100-01-01',cb);
                            logger.debug("hello from case 44");
                            throw BreakException;
                            break;
                        case 45 :
                            logInArray.push(sectionIds[i]);
                            reports.orderListing(db_name,res,0,10,cb);
                            logger.debug("hello from case 45");
                            throw BreakException;
                            break;
                        case 46 :
                            logInArray.push(sectionIds[i]);
                            reports.userListing(db_name,res,0,10,cb);
                            logger.debug("hello from case 46");
                            throw BreakException;
                            break;
                        case 47 :
                            logInArray.push(sectionIds[i]);
                            reports.supplierListing(db_name,res,0,10,cb);
                            logger.debug("hello from case 47");
                            throw BreakException;
                            break;
                        case 48 :
                            logInArray.push(sectionIds[i]);
                            reports.areaListing(db_name,res,0,10,cb);
                            logger.debug("hello from case 48");
                            throw BreakException;
                            break;
                        case 49 :
                            logInArray.push(sectionIds[i]);
                            reports.categoryListing(res,0,10,cb);
                            logger.debug("hello from case 49");
                            throw BreakException;
                            break;
                        case 50 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 18");
                            throw BreakException;
                            break;
                        case 51 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 51");
                            loginFunc.listSocialAccounts(res,cb)
                            throw BreakException;
                            break;
                        case 52 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 52");
                            loginFunc.listUsers(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 53 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 53");
                            loginFunc.listUsers(db_name,res,cb);
                            throw BreakException;
                            break;
                        case 54 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.listTandC(db_name,res,cb);
                            logger.debug("hello from case 54");
                            throw BreakException;
                            break;
                        case 55 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.listTandC(db_name,res,cb);
                            logger.debug("hello from case 55");
                            throw BreakException;
                            break;
                        case 56 :
                            logInArray.push(sectionIds[i]);
                            currencyObj.getCountryWithCurrencyAndDefaultTrue(db_name,res, cb);
                            logger.debug("hello from case 56");
                            throw BreakException;
                            break;
                        case 57 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 57");
                            throw BreakException;
                            break;
                        case 58 :
                            logInArray.push(sectionIds[i]);
                            logger.debug("hello from case 58");
                            throw BreakException;
                            break;
                        case 59 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.rateCommentListing(db_name,res,cb);
                            logger.debug("hello from case 59");
                            throw BreakException;
                            break;
                        case 60 :
                            logInArray.push(sectionIds[i]);
                            adminOrders.trackedOrders(db_name,res,cb);
                            logger.debug("hello from case 60");
                            throw BreakException;
                            break;
                        case 61 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.listTandC(db_name,res,cb);
                            logger.debug("hello from case 61");
                            throw BreakException;
                            break;
                        case 62 :
                            logInArray.push(sectionIds[i]);
                            loginFunc.listTandC(db_name,res,cb);
                            logger.debug("hello from case 62");
                            throw BreakException;
                            break;
                        case 63 :
                        logInArray.push(sectionIds[i]);
                        loginFunc.listTandC(db_name,res,cb);
                        logger.debug("hello from case 62");
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
                     * If case 16 is assigned to  get data
                     */
                    if (case16Check) {
                        
                        homeLoginData.getHomeData(db_name,res, cb, filter1, 1);
                        throw BreakException;
                    }
                    else {
                        homeLoginData.getHomeData(db_name,res, cb, filter1, 0);
                        throw BreakException;
                    }


                }


            }(i));
        }
    } catch (e) {

        console.log("===================== caught out of loop =======================",e)
    }


}