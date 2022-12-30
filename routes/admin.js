/**
 * Created by vinay on 3/2/16.
 */

var s = require('request-ip');
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var loginCases = require('./loginCases');
var geoip = require('geoip-lite');
var admin = require("./admin");
var parseCsv = require('csv-parse');
let emailTemp = require('./email')
var fs = require('fs');
var paths = require('path');
var fsExtra = require('fs-extra');
var log4js = require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
var UniversalFunction = require('../util/Universal')
var moment = require('moment')
var ExecuteQ = require('../lib/Execute')

/*
 *  Admin login using Email and
 *  Password
 *
 */


exports.adminLoginUsingPassword = function (req, res) {
    Log('from adminLogin', 'admin login function start');
    var email = req.body.email;
    var password = req.body.password;
    var clientIp = req.connection.remoteAddress;
    let fcm_token = req.body.fcm_token;
    var encryptedPassword;
    var adminId;
    var ipArray = clientIp.split(":");
    // console.log("===ip array==="+JSON.stringify(ipArray))
    /*
     * following commented code working to get
     * country and city
     */
    var ip = ipArray[ipArray.length - 1];
    // var geo = geoip.lookup(ip);
    //console.log(geo)
    //console.log(geo.country);
    //console.log(geo.city);


    /*    var country = geo.country;
        var city = geo.city;*/
    var country = "";
    var city = "";
    var accessToken;
    var manValue = [email, password, clientIp];
    async.waterfall([
        function (cb) {

            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            //encryptedPassword = cryptedPass;
            encryptedPassword = md5(password);
            /*
             * status : 0 for failure
             * status : 1 for success
             */


            func.adminRegOrNotByEmailAndPass(req.dbName, res, cb, email, encryptedPassword, country, city, ip, 0);
        },
        function (id, cb) {
            adminId = id;

            checkActiveOrNotAtLogin(req.dbName, res, adminId, cb, country, city, constant.responseMessage.NOT_ACTIVE, ip, 0);
        },
        function (cb) {


            func.updateAccessToken(req.dbName, res, cb, adminId, email, ip, country, city, constant.responseMessage.LOGGED_IN, 1, fcm_token);
        },
        function (accessToken1, cb) {

            accessToken = accessToken1;


            checkSuperAdminOrNot(req.dbName, res, adminId, cb);
        },
        async function (check, cb) {
            if (check) {
                // console.log("superadmin==============");
                let is_multibranch;
                let default_branch_id;
                var data;
                let is_single_vendor = await checkForSingleVendor(req.dbName);

                if (is_single_vendor) {

                    let supplierBranchDetails = await getSupplierBranchDetails(req.dbName)
                    is_multibranch = supplierBranchDetails[0].is_multibranch
                    default_branch_id = supplierBranchDetails[0].default_branch_id

                    data = {
                        "access_token": accessToken, "admin_id": adminId,
                        "admin_email": email, "categoryIds": [1, 2, 3, 4, 5, 6, 7], "is_super_admin": 1,
                        "is_multibranch": is_multibranch, "default_branch_id": default_branch_id
                    }
                }
                else {
                    data = {
                        "access_token": accessToken, "admin_id": adminId,
                        "admin_email": email, "categoryIds": [1, 2, 3, 4, 5, 6, 7], "is_super_admin": 1
                    }
                }





                sendResponse.sendSuccessData(data, constant.responseMessage.LOGGED_IN, res, constant.responseStatus.SUCCESS);
            } else {
                // console.log("superadmin=========check false====="+check);

                func.getAllSectionIds(req.dbName, res, adminId, cb);
            }
        },
        function (allSectionId, cb) {
            assignCategory(req.dbName, cb, allSectionId);
        }
    ],
        async function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            } else {
                let is_multibranch;
                let default_branch_id;
                var data;
                let is_single_vendor = await checkForSingleVendor(req.dbName);

                if (is_single_vendor) {

                    let supplierBranchDetails = await getSupplierBranchDetails(req.dbName)
                    is_multibranch = supplierBranchDetails[0].is_multibranch
                    default_branch_id = supplierBranchDetails[0].default_branch_id

                    data = {
                        "access_token": accessToken, "admin_id": adminId,
                        "admin_email": email, "categoryIds": result, "is_super_admin": 0,
                        "is_multibranch": is_multibranch, "default_branch_id": default_branch_id
                    };
                } else {

                    data = {
                        "access_token": accessToken, "admin_id": adminId,
                        "admin_email": email, "categoryIds": result, "is_super_admin": 0

                    };
                }
                sendResponse.sendSuccessData(data, constant.responseMessage.LOGGED_IN, res, constant.responseStatus.SUCCESS);
            }
        })
}

function getSupplierBranchDetails(dbName) {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "select sb.id as default_branch_id,s.is_sponser as is_multibranch from supplier s "
            query += "join supplier_branch sb on sb.supplier_id = s.id "
            query += "where is_head_branch =1 "

            let result = ExecuteQ.Query(dbName, query, [])

            resolve(result)
        } catch (err) {
            logger.debug("===========derrr======", err)
            reject(err)
        }
    })
}

function checkForSingleVendor(dbName) {
    return new Promise(async (resolve, reject) => {
        try {
            let query = "select * from screen_flow"
            let result = await ExecuteQ.Query(dbName, query, [])
            resolve(result[0].is_single_vendor)
        } catch (err) {
            logger.debug("===========ere======", err)
            reject(err)
        }
    })
}

// exports.forgotPassword = function(req,res)
// {
//     var email = req.body.email;
//     var manValue = [email];

//     async.waterfall([
//         function (cb) {
//             func.checkBlank(res, manValue, cb);
//         },
//         function (cb) {
//             authenticateAdminEmail(req.dbName,email, res, cb);
//         },
//         function(adminId,cb){
//             updatePassword(req.dbName,res,adminId,cb);
//         },
//         async function(password,cb){
//             let smtpData=await  UniversalFunction.smtpData(req.dbName);
//             var subject = "Forgot Password";
//             var content = "You seem to have forgotten your password. New Details are : \n\n";
//             content+="Email : "+email +" \n";
//             content+="Password : "+password +" \n";
//             content+="Thank You \n";
//             content+="\n\n"
//             content+="Royo Team \n";
//             emailTemp.userResetpassword(req,res,email,password,function(err,result){
//                 if(err){
//                     console.log("..****register email*****....",err);
//                 }
//             });
//             cb(null)
//             // func.sendMailthroughSMTP(smtpData,res,subject,email,content,1,cb);

//         }
//     ], function (error, dataToBeSent1) {

//         if (error) {
//             sendResponse.somethingWentWrongError(res);
//         } else {
//             var data = {};
//             sendResponse.sendSuccessData(data, constant.responseMessage.NEW_PASSWORD, res, constant.responseStatus.SUCCESS);
//         }

//     })
// }



exports.forgotPassword = function (req, res) {
    var email = req.body.email;
    var manValue = [email];

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            authenticateAdminEmail(req.dbName, email, res, cb);

        },
        async function (adminId, cb) {
            let smtpData = await UniversalFunction.smtpData(req.dbName);
            var subject = "Forgot Password";

            let html = ` <html>
                            <head>
                       <title>
                              forgot password
                    </title>
                           </head>
                                  <body>
                                              <p>You seem to have forgotten your password. New Details are :</p></br>
                                               <p>please click <a href ="`+ config.get('server.protocol') + config.get('server.ip') + '/v1/reset_password_link?email=' + email + '&dbName=' + req.dbName + '&id=' + adminId + '' + `"> here </a>to reset your password</p>
                                               <p>If this is not done by you . Please ignore!</p></br>
                                               <p>Thank You</p></br>
                                              
                           </body>

                      </html>`


            func.sendMailthroughSMTPv2(req, adminId, smtpData, res, subject, email, html, 1, cb);

        }
    ], function (error, dataToBeSent1) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.NEW_PASSWORD, res, constant.responseStatus.SUCCESS);
        }

    })
}

exports.sendPwdresetlink = function (request, response) {
    let email = request.query.email;
    let dbName = request.query.dbName;
    let id = request.query.id;
    console.log("=====dirName==>>", dirname)

    response.sendFile(dirname + '/public/adminForgotPassword.html', { email: email, dbName: dbName, id: id }, function (err, result) {
        console.log(result)

    })

}


exports.verifylink = function (request, response) {
    return new Promise(async (resolve, reject) => {
        let date = moment().format("YYYY-MM-DD HH:mm:ss");
        let email = request.body.email;
        let dbName = request.body.dbName;
        let id = request.body.id;

        let query = 'select forgot_link from admin where id=?'
        let getDate = await ExecuteQ.Query(dbName, query, [id]);

        let linkDate = moment(getDate[0].forgot_link).format("YYYY-MM-DD HH:mm:ss");

        let end = moment(date);
        let startTime = moment(linkDate)
        var duration = moment.duration(end.diff(startTime));
        var minutes = parseFloat(duration.asMinutes());
        if (minutes < 10) {
            var sql = "select id from admin where email = ?";
            let result = await ExecuteQ.Query(dbName, sql, [email]);
            if (result) {
                sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, response, 200);
            }
            else {
                var msg = "user not found";
                sendResponse.sendErrorMessage(msg, response, 500);
            }
        }
        else {
            let msg = "Token Expired"
            sendResponse.sendErrorMessage(msg, response, 500);
        }

    })
}

exports.updatePassword = function (req, res) {
    return new Promise(async (resolve, reject) => {
        let email = req.body.email;
        let password = req.body.password;
        let dbName = req.body.dbName;
        console.log(dbName)
        let crypassword = md5(password)
        var sql = "update  admin set password=? where email = ?";
        let result = await ExecuteQ.Query(dbName, sql, [crypassword, email]);
        console.log(result)
        if (result) {
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, 200)
        }
        else {
            var msg = "error in password updation";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
    })
}

exports.getAdminHomeData = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionIdFromFrontEnd = req.body.sectionId;
    var filter1 = req.body.filter;
    var dataToBeSent;
    var adminId;
    var manValue = [accessToken, filter1];
    //console.log("lkjsdfkbj",req.body);

    //    logger.debug("=================where 1==============");
    async.waterfall([
        function (cb) {
            // logger.debug("=================where 2==============");
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            // logger.debug("=================where 3==============");
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            //console.log("nkasd gjnh",id);
            adminId = id;
            // logger.debug("=================where 4==============");
            checkActiveOrNot(req.dbName, res, adminId, cb);
        },

        function (cb) {
            //console.log("in updation");
            // logger.debug("=================where 5==============");
            admin.dataOnUpdation(req.dbName, res, cb, adminId, sectionIdFromFrontEnd, accessToken, filter1);
        }
    ], function (error, dataToBeSent1) {

        if (error) {
            // logger.debug("=================where 6==============",dataToBeSent1);
            sendResponse.somethingWentWrongError(res);
        } else {
            // logger.debug("=================where 7==============");
            dataToBeSent = dataToBeSent1;
            // console.log(JSON.stringify(dataToBeSent));
            sendResponse.sendSuccessData(dataToBeSent, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    })


}


/*======================================================================================================================
 *To add admin
 *by super admin
 * ======================================================================================================================
 */





exports.addAdmin = function (req, res) {
    // Log("addAdmin", "   addadmin function startted");
    var superAccessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var email = req.body.email;
    var password = req.body.password;
    var phoneNumber = req.body.phoneNumber;
    // Log("superAccessToken", superAccessToken);
    // Log("email", email);
    // Log("password", password);
    // Log("phoneNumber", phoneNumber);
    let iso = req.body.iso != undefined ? req.body.iso : null;
    let country_code = req.body.country_code != undefined ? req.body.country_code : null;

    var manValue = [email, password, phoneNumber, superAccessToken, authSectionId];
    var encryptedPassword;
    var adminId;
    var accessToken;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            if (validator.validate(email)) {
                cb(null);
            } else {
                sendResponse.sendErrorMessage(constant.responseMessage.INVALID_EMAIL, res, constant.responseStatus.INVALID_EMAIL);
            }
        },
        function (cb) {

            func.authenticateAccessToken(req.dbName, superAccessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;

            func.checkforAuthorityofThisAdmin(req.dbName, adminId, authSectionId, res, cb);
        },
        function (cb) {
            // console.log("from check email availability");

            checkAdminEmailAvailability(req.dbName, res, email, cb);
        },
        function (cb) {

            createAdmin(req.dbName, res, email, password, phoneNumber, country_code, iso, cb);
        },
        function (id, cb) {

            func.insertAdminActions(req.dbName, res, cb, adminId, constant.responseMessage.ADMIN_ADDED + " with id " + id, baseUrl + "/add_admin");
        }

    ], function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            data.isActive = 0;
            sendResponse.sendSuccessData(data, constant.responseMessage.ADMIN_ADDED, res, constant.responseStatus.SUCCESS);
        }

    })
}


exports.makeAdminActiveOrInActive = function (req, res) {
    var subAdminId = req.body.subAdminId;
    var status = req.body.status;
    var authSectionId = req.body.authSectionId;
    var superAccessToken = req.body.accessToken;
    var adminId;
    var manValue = [subAdminId, superAccessToken, status, authSectionId];
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, superAccessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, authSectionId, res, cb);
        },
        function (cb) {
            checkAdminRegOrNotById(req.dbName, res, subAdminId, cb);
        },
        function (cb) {
            doActiveOrInActive(req.dbName, res, status, subAdminId, cb);
        },
        function (cb) {
            if (status == '0') {
                func.insertAdminActions(req.dbName, res, cb, adminId, constant.responseMessage.ADMIN_DEACTIVATED + " of id " + subAdminId, baseUrl + "/make_admin_active_or_inactive");
            } else {
                func.insertAdminActions(req.dbName, res, cb, adminId, constant.responseMessage.ADMIN_ACTIVATED + " of id " + subAdminId, baseUrl + "/make_admin_active_or_inactive");
            }

        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError();
        } else {
            var data = {};
            data.subAdminId = subAdminId;
            if (status == '0') {
                sendResponse.sendSuccessData(data, constant.responseMessage.ADMIN_DEACTIVATED, res, constant.responseStatus.SUCCESS);
            } else {
                sendResponse.sendSuccessData(data, constant.responseMessage.ADMIN_ACTIVATED, res, constant.responseStatus.SUCCESS);
            }

        }
    })
}


/*======================================================================================================================
 *To assign section to the sub admin
 *Parameter: superadminaccesstoken,subadminid,multiple or single section ids
 *
 * ======================================================================================================================
 */

exports.assignOrRevokeSection = function (req, res) {
    var subAdminId = req.body.id;
    var superAccessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var sectionIds = req.body.assignSectionIds;
    var revokeSectionIds = req.body.revokeSectionIds;
    var superAdminId;
    var manValue = [subAdminId, superAccessToken, authSectionId];
    //console.log(req.body);
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, superAccessToken, res, cb);
        },
        function (superId, cb) {
            superAdminId = superId;
            func.checkforAuthorityofThisAdmin(req.dbName, superId, authSectionId, res, cb);
        },
        function (cb) {
            checkAdminRegOrNotById(req.dbName, res, subAdminId, cb);
        },
        function (cb) {
            var ids = sectionIds.trim().split(",");
            //   console.log("sectionIds" + sectionIds);
            if (ids.length && sectionIds != '') {
                assignSectionsToAdmin(req.dbName, subAdminId, superAdminId, ids, res, cb);
            } else {
                cb(null);
            }
        },
        function (cb) {
            var revokeIds = revokeSectionIds.trim().split(",");
            //console.log(revokeSectionIds);
            if (revokeIds.length && revokeSectionIds != '' && revokeSectionIds != '0') {
                revokeSectionOfAdmin(req.dbName, subAdminId, revokeIds, res, cb);
            } else {
                cb(null);
            }
        },
        function (cb) {
            func.insertAdminActions(req.dbName, res, cb, superAdminId, constant.responseMessage.SECTION_UPDATED + "of id " + subAdminId, baseUrl + "/make_admin_active_or_inactive");
        }
    ], function (error, response) {
        if (error) {

            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SECTION_UPDATED, res, constant.responseStatus.SUCCESS);
        }
    })
}


/*----------------------------------------------------------------------------------------------------------------------
 *This function is  used to get all admins
 * Parameter: authorized admin access token, auth section id
 * Success : will return all reg admin
 *
 * ---------------------------------------------------------------------------------------------------------------------
 */

exports.getAllAdmin = function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var manValue = [accessToken, authSectionId];
    var adminId;
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName, id, authSectionId, res, cb);
        },
        function (cb) {
            func.getAllRegisteredAdmins(req.dbName, res, adminId, 0, cb);
        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.ALL_REG_ADMIN, res, constant.responseStatus.SUCCESS);
        }
    })
}


/*
 * This function is used to get sigle sub admin data
 * To be viewed by authorized admin
 * Parameter: authorized admin access token, authSectionId, subAdminId
 */

exports.getAdminDataById = function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var subAdminId = req.body.subAdminId;
    var manValue = [accessToken, authSectionId, subAdminId];

    async.waterfall([
        function (cb) {
            //   console.log("===============checkBlank============");
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            //  console.log("===============authenticateAccessToken============");
            func.authenticateAccessToken(req.dbName, accessToken, res, cb);
        },
        function (superId, cb) {
            //  console.log("===============checkforAuthorityofThisAdmin============");
            func.checkforAuthorityofThisAdmin(req.dbName, superId, authSectionId, res, cb);
        },
        function (cb) {
            checkAdminRegOrNotById(req.dbName, res, subAdminId, cb);
        },
        function (cb) {
            //  console.log("===============getSingleAdminData============");
            getSingleAdminDataForSuperAdmin(req.dbName, res, subAdminId, cb);
        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.ADMIN_DATA, res, constant.responseStatus.SUCCESS);
        }
    })

}


/*
 * ----------------------------------------------------------------------------------------------------------------------------------------
 * check AdminEmail Availability
 * INPUT : email
 * OUTPUT : email available or not to register admin
 * ----------------------------------------------------------------------------------------------------------------------------------------
 */

function checkAdminEmailAvailability(db_name, res, email, callback) {


    //  console.log("=================checkAdminEmailAvailability================");
    //   console.log("=================checkAdminEmailAvailability================" + email);
    var sql = "select id from admin where email = ? limit 1";


    multiConnection[db_name].query(sql, [email], function (err, userResponse) {

        if (err) {
            logger.debug("===============err in email availability=======", err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (userResponse.length) {
                // var errorMsg = 'Email already exists!';
                sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
            }
            else {
                // console.log("=================checkAdminEmailAvailability================else" + userResponse);
                callback(null);
            }
        }


    });
}


function authenticateAdminEmail(db_name, email, res, callback) {
    var sql = "select id from admin where email = ? limit 1";
    multiConnection[db_name].query(sql, [email], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            if (result.length) {
                callback(null, result[0].id);
            }
            else {
                sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_NOT_EXISTS, res, constant.responseStatus.SOME_ERROR);
            }
        }

    })


}

/*
 * ----------------------------------------------------------------------------------------------------------------------------------------
 * check Admin id Availability
 * INPUT : id
 * OUTPUT : admin registered with the given id
 * ----------------------------------------------------------------------------------------------------------------------------------------
 */

function checkAdminRegOrNotById(db_name, res, id, callback) {


    var sql = "select email from admin where id = ? limit 1";


    multiConnection[db_name].query(sql, [id], function (err, userResponse) {

        if (err) {
            logger.debug("=========error in checkAdminRegOrNotById=============", err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (userResponse.length) {
                // var errorMsg = 'Email already exists!';
                callback(null);
            }
            else {
                //  console.log("=================checkAdminEmailAvailability================else" + userResponse);
                sendResponse.sendErrorMessage(constant.responseMessage.NOT_REG, res, constant.responseStatus.NOT_REG);
            }
        }


    });
}


function Log(message, value) {
    //console.log('==============================================');
    //  console.log(message, value);
    //console.log('==============================================');
}


/*
 * ----------------------------------------------------------------------------------------------------------------------------------------
 * To active admin
 * INPUT : email
 * OUTPUT : admin activated
 * ----------------------------------------------------------------------------------------------------------------------------------------
 */
function doActiveOrInActive(db_name, res, status, id, callback) {
    if (status == '1') {
        async.waterfall([
            function (cb) {
                var sql = "select section_id from admin_authority where admin_id = ? ";
                multiConnection[db_name].query(sql, [id], function (err1, reply1) {
                    if (err1) {
                        sendResponse.somethingWentWrongError(res);
                    } else if (reply1.length) {
                        cb(null, 1);
                    } else {
                        // cb(null, 0);
                        cb(null, 1)
                    }
                })
            },
            function (anySectionAssignedOrNot, cb) {
                if (anySectionAssignedOrNot) {
                    var sql = "update admin set is_active = ? where id = ?";
                    multiConnection[db_name].query(sql, [status, id], function (err, reply) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            //console.log("doActive=====", reply);
                            callback(null);
                        }
                    });
                } else {
                    var data = {};
                    sendResponse.sendSuccessData(data, constant.responseMessage.NO_ASSIGNED_SECTION, res, constant.responseStatus.SOME_ERROR);
                }
            }
        ], function (error, response) {

        })
    } else {
        var sql = "update admin set is_active = ? where id = ?";
        multiConnection[db_name].query(sql, [status, id], function (err, reply) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            } else {
                //console.log("doActive=====", reply);
                callback(null);
            }
        });
    }


}


function createAdmin(db_name, res, email, password, phoneNumber, country_code, iso, callback) {

    var randomize = require('randomatic');
    let user_created_id = randomize('A0', 30);

    var sql = "insert into admin(email,password,phone_number,access_token,is_superadmin,country_code,iso,is_active,user_created_id) values(?,?,?,?,?,?,?,?,?)";
    var accessToken = func.encrypt(email + new Date());
    async.waterfall([
        function (cb) {
            cb(null, md5(password));
        },
        function (cryptedPass, cb) {

            let stmt = multiConnection[db_name].query(sql, [email, cryptedPass, phoneNumber, accessToken, 0, country_code, iso, 1, user_created_id], function (err1, reply1) {
                if (err1) {
                    logger.debug("+=================err during create admin=======", err1)
                    sendResponse.somethingWentWrongError(res);
                } else {
                    callback(null, reply1.insertId);
                }
            })
        }
    ], function (err, response) {
        callback(null);
    })

}


function assignSectionsToAdmin(db_name, adminId, createdById, sectionIds, res, callback) {
    logger.debug("------=================entered in assignSectionToAdmin======================")

    var idLength = sectionIds.length;

    async.waterfall([
        /*
         *---------------------------------------------------------------------------------------------------------------------
         * Here(for this waterfall model) callback will be cb.
         * If we are using callback(main callback of assignSectionsToAdmin function ) from final function of this waterfall,
         * it will take to the last function.
         *---------------------------------------------------------------------------------------------------------------------
         */
        function (cb) {
            var sql = "select section_id from admin_authority where admin_id = ? ";
            multiConnection[db_name].query(sql, [adminId], function (err1, reply1) {
                if (err1) {
                    console.log("from select section_id");
                    sendResponse.somethingWentWrongError(res);
                } else if (reply1.length) {
                    var result = new Array();
                    var replyLength = reply1.length;
                    for (var i = 0; i < replyLength; i++) {
                        (function (i) {

                            result.push(reply1[i].section_id);
                            if (i == replyLength - 1) {
                                //   console.log("================before getDifference==============");
                                // result = result.split(",");
                                getDifference(sectionIds, result, cb);

                            }

                        }(i))


                    }


                } else {
                    cb(null, sectionIds);
                }
            })
        },
        function (ids, cb) {

            //    console.log("ids to be insert" + ids);

            var values = new Array();
            var insertLength = "(?,?,?),";
            var querystring = '';

            async.waterfall([
                /*
                 *--------------------------------------------------------------------------------------------
                 * Here callback will be cb1
                 * Using cb1 we can tranfer control to next in this waterfall model
                 * If we are using cb in this model,it will call to next function of previous waterfall model
                 * If we are using callback in this model , it will go back to the assignSection function.
                 * --------------------------------------------------------------------------------------------
                 */
                function (cb1) {
                    var idLength = ids.length;
                    console.log("===============", idLength);

                    if (idLength) {
                        for (var i = 0; i < idLength; i++) {
                            (function (i) {

                                values.push(ids[i], adminId, createdById);
                                // values.push(newValues);
                                querystring = querystring + insertLength;

                                if (i == idLength - 1) {

                                    querystring = querystring.substring(0, querystring.length - 1);
                                    cb1(null);

                                }

                            }(i))
                        }
                    }
                    else {
                        callback(null);
                    }

                },
                function (cb1) {
                    //       console.log(querystring + "--------------")
                    var sql = "insert into admin_authority(section_id,admin_id,created_by_id) values " + querystring;
                    //     console.log("values============" + values);
                    var stmt = multiConnection[db_name].query(sql, values, function (err, reply) {
                        logger.debug("===================query to insert in admin_authority============", stmt.sql)
                        if (err) {
                            console.log(err + "error")
                            console.log("from insert");
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            cb1(null);
                        }
                    })
                }
            ], function (err2, response2) {
                if (err2) {
                    console.log("from insert final");
                    sendResponse.somethingWentWrongError(res);
                } else {
                    cb(null)
                }
            })


        }
    ], function (error, response) {
        if (error) {
            console.log("from assignSectionsToAdmin final");
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })


}


function revokeSectionOfAdmin(db_name, adminId, revokeIds, res, callback) {

    async.waterfall([
        function (cbr) {
            var sql = "delete from admin_authority where admin_id = ? and section_id in (" + revokeIds + ") ";
            //     console.log("query" + sql);
            multiConnection[db_name].query(sql, [adminId], function (err, reply) {
                if (err) {
                    console.log("err" + err);
                } else {
                    cbr(null);
                }
            })
        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })

}


function getSingleAdminDataForSuperAdmin(db_name, res, subAdminId, callback) {
    var result1;
    var result2;
    var check;

    async.waterfall([
        function (cb) {
            async.parallel([
                function (cb1) {
                    var sql = "select ad.id,ad.email,ad.is_active,adma.section_id,adms.sections_name,adms.section_category_id,admscat.section_category_name from admin ad ";
                    sql += " join admin_authority adma on ad.id = adma.admin_id join admin_sections adms on adma.section_id=adms.id ";
                    sql += " join admin_section_category admscat on adms.section_category_id=admscat.id where ad.id = ? ";
                    multiConnection[db_name].query(sql, [subAdminId], function (err, reply) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        } else if (reply.length) {
                            result1 = reply;
                            check = 1;
                            cb1(null);
                        } else {
                            var sql = "select id,email,is_active from admin where id  = ? ";
                            multiConnection[db_name].query(sql, [subAdminId], function (err2, reply2) {
                                if (err2) {
                                    sendResponse.somethingWentWrongError(res);
                                } else {
                                    result1 = reply2;
                                    check = 0;
                                    cb1(null);
                                }
                            })
                        }
                    })
                },
                function (cb1) {
                    var sql = "select ad.id,ad.sections_name,ad.section_category_id,adsc.section_category_name from admin_sections ad join admin_section_category adsc on ad.section_category_id = adsc.id";
                    multiConnection[db_name].query(sql, [], function (sqlErr, sqlReply) {
                        if (sqlErr) {
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            result2 = sqlReply;
                            // logger.debug("===============data in the result2===================",result2)
                            cb1(null);
                        }
                    })
                }
            ], function (error, response) {
                cb(null);
            })
        },
        function (cb) {
            var data = [];
            var home = [];
            var profile = [];
            var production = [];
            var orders = [];
            var account = [];
            var reports = [];
            var settings = [];

            if (check == 1) {
                var count = 0;
                for (var i = 0; i < 7; i++) {
                    (function (i) {
                        switch (i) {
                            case 0:
                                for (var j = 0; j < 16; j++) {
                                    (function (j) {
                                        var length1 = result1.length;
                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    home.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            home.push(section);
                                        }

                                        count++;
                                        if (j == 15) {
                                            data[i] = {
                                                "category_id": 1,
                                                "category_name": "HOME",
                                                "category_data": home
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 1:
                                for (var j = 0; j < 11; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    profile.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            profile.push(section);
                                        }

                                        count++;
                                        if (j == 10) {
                                            data[i] = {
                                                "category_id": 2,
                                                "category_name": "PROFILE",
                                                "category_data": profile
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 2:
                                for (var j = 0; j < 10; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    production.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            production.push(section);
                                        }

                                        count++;
                                        if (j == 9) {
                                            data[i] = {
                                                "category_id": 3,
                                                "category_name": "PRODUCTION",
                                                "category_data": production
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 3:
                                for (var j = 0; j < 5; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    orders.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            orders.push(section);
                                        }

                                        count++;
                                        if (j == 4) {
                                            data[i] = {
                                                "category_id": 4,
                                                "category_name": "ORDERS",
                                                "category_data": orders
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 4:
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    account.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            account.push(section);
                                        }

                                        count++;
                                        if (j == 3) {
                                            data[i] = {
                                                "category_id": 5,
                                                "category_name": "ACCOUNT",
                                                "category_data": account
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 5:
                                for (var j = 0; j < 6; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    reports.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            // logger.debug("===========result2[count[.sections_name============",result2[count].sections_name)
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            reports.push(section);
                                        }

                                        count++;
                                        if (j == 5) {
                                            data[i] = {
                                                "category_id": 6,
                                                "category_name": "REPORTS",
                                                "category_data": reports
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 6:
                                for (var j = 0; j < 11; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                // logger.debug("===========result2[count].id ===========",result2[count].id)
                                                if (result2[count].id == result1[k].section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    settings.push(section);
                                                }


                                            }(k))
                                        }
                                        if (!(assignedCheck)) {
                                            var section = {};
                                            section.section_name = result2[count].sections_name;
                                            section.section_id = result2[count].id;
                                            section.is_assigned = 0;
                                            settings.push(section);
                                        }

                                        count++;
                                        if (j == 10) {
                                            data[i] = {
                                                "category_id": 7,
                                                "category_name": "SETTINGS",
                                                "category_data": settings
                                            };
                                        }
                                    }(j))
                                }
                                break;


                            default:
                                break;
                        }
                        if (i == 6) {
                            cb(null, data);
                        }
                    }(i))
                }

            } else {
                var count = 0;
                for (var i = 0; i < 7; i++) {
                    (function (i) {
                        switch (i) {
                            case 0:
                                for (var j = 0; j < 16; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        home.push(section);
                                        count++;
                                        if (j == 15) {
                                            data[i] = {
                                                "category_id": 1,
                                                "category_name": "HOME",
                                                "category_data": home
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 1:
                                for (var j = 0; j < 11; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        profile.push(section);
                                        count++;
                                        if (j == 9) {
                                            data[i] = {
                                                "category_id": 2,
                                                "category_name": "PROFILE",
                                                "category_data": profile
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 2:
                                for (var j = 0; j < 10; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        production.push(section);
                                        count++;
                                        if (j == 8) {
                                            data[i] = {
                                                "category_id": 3,
                                                "category_name": "PRODUCTION",
                                                "category_data": production
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 3:
                                for (var j = 0; j < 5; j++) {
                                    (function (j) {


                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        orders.push(section);

                                        count++;
                                        if (j == 4) {
                                            data[i] = {
                                                "category_id": 4,
                                                "category_name": "ORDERS",
                                                "category_data": orders
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 4:
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {


                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        account.push(section);
                                        count++;
                                        if (j == 3) {
                                            data[i] = {
                                                "category_id": 5,
                                                "category_name": "ACCOUNT",
                                                "category_data": account
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 5:
                                for (var j = 0; j < 6; j++) {
                                    (function (j) {

                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        reports.push(section);

                                        count++;
                                        if (j == 5) {
                                            data[i] = {
                                                "category_id": 6,
                                                "category_name": "REPORTS",
                                                "category_data": reports
                                            };
                                        }
                                    }(j))
                                }
                                break;

                            case 6:
                                for (var j = 0; j < 11; j++) {
                                    (function (j) {

                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        settings.push(section);
                                        count++;
                                        if (j == 10) {
                                            data[i] = {
                                                "category_id": 7,
                                                "category_name": "SETTINGS",
                                                "category_data": settings
                                            };
                                        }
                                    }(j))
                                }
                                break;


                            default:
                                break;
                        }
                        if (i == 6) {
                            cb(null, data);
                        }
                    }(i))
                }
            }
        }
    ], function (err1, response1) {
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, response1);
        }

    })

}


/*
 *--------------------------------------------------------------------------------------------
 *This function is used to get the section Ids
 * which are not assigned to particular sub admin
 * Parameter: myArray : sectionIds to be assign by super admin to sub admin
 * toRemove : These section Ids are already assigned to this sub admin
 * This function will return only those section Ids which are not already
 * assigned to this sub admin or empty array
 *---------------------------------------------------------------------------------------------
 */

function getDifference(myArray, toRemove, callback1) {
    //   console.log("myarray" + myArray);
    //  console.log("toremove" + toRemove);
    var result = [];
    for (var j = 0; j < myArray.length; j++) {
        (function (j) {
            if (toRemove.indexOf(parseInt(myArray[j])) === -1) {
                //  console.log(toRemove.indexOf(myArray[j]))
                result.push(myArray[j]);
            }
            if (j == myArray.length - 1) {
                //   console.log("result" + result);

                callback1(null, result);
            }
        }(j))
    }
}


/*
 * This function is used to check the whether admin
 * is active admin or not
 */

function checkActiveOrNot(db_name, res, adminId, callback) {
    var sql = "select is_active from admin where id = ? limit 1 ";
    multiConnection[db_name].query(sql, [adminId], function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            if (response[0].is_active == 1) {
                callback(null)
            } else {
                async.waterfall([
                    function (cb) {
                        func.insertFailure(db_name, res, cb, adminId, country, city, mesage);
                    }
                ], function (error, reply) {
                    sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.SOME_ERROR);
                })
            }
        }
    })
}


/*
 * This function is used to check the whether admin
 * is active admin or not
 */

function checkActiveOrNotAtLogin(db_name, res, adminId, callback, country, city, mesage, clientIp, status) {
    // console.log("from checkActiveOrNotAtLogin")
    var sql = "select is_active from admin where id = ? limit 1 ";
    multiConnection[db_name].query(sql, [adminId], function (err, response) {
        if (err) {
            console.error(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            if (response[0].is_active == 1) {
                callback(null)
            } else {
                async.waterfall([
                    function (cb) {

                        func.insertFailure(db_name, res, cb, clientIp, adminId, country, city, mesage, status);
                    }
                ], function (error, reply) {
                    var data = {};
                    sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.SOME_ERROR);
                })
            }
        }
    })
}


function checkActiveOrNot(dbName, res, adminId, callback) {
    var sql = "select is_active from admin where id = ? limit 1 ";
    multiConnection[dbName].query(sql, [adminId], function (err, response) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            if (response[0].is_active == 1) {
                callback(null)
            } else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.SOME_ERROR);
            }
        }
    })
}


/*
 * This function is used to check the whether admin
 * is super admin or not
 */


function checkSuperAdminOrNot(db_name, res, adminId, cb) {
    //console.log("from checkSuperAdminOrNot")
    var sql = "select is_superadmin from admin where id = ? limit 1 ";
    multiConnection[db_name].query(sql, [adminId], function (err, response) {
        if (err) {
            console.error(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            if (response[0].is_superadmin == 1) {
                cb(null, 1)
            } else {
                cb(null, 0);
            }
        }
    })
}


/*
 *This function is used detials of sections and category of
 * sections by the given sectionIds for sub admin
 */


function getSectionNameById(dbName, res, adminId, sectionIds, callback) {
    var sql = "select adma.section_id,adms.sections_name,adms.section_category_id,admscat.section_category_name from admin ad ";
    sql += " join admin_authority adma on ad.id = adma.admin_id join admin_sections adms on adma.section_id=adms.id ";
    sql += " join admin_section_category admscat on adms.section_category_id=admscat.id where ad.id = ? and adma.section_id in (" + sectionIds + ")";
    multiConnection[dbName].query(sql, [adminId], function (err, reply) {
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


function getSectionNameByIdForSuperAdmin(dbName, res, sectionIds, callback) {
    var sql = "select ads.id as section_id,ads.sections_name,adsc.id as section_category_id, adsc.section_category_name";
    sql += " from admin_sections ads join admin_section_category adsc on ads.section_category_id = adsc.id WHERE ads.id > 16 ORDER BY ads.id ASC";
    multiConnection[dbName].query(sql, [], function (err, reply) {
        //  console.log(sql);
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        } else if (reply.length) {
            callback(null, reply);
        }
    });
}


/*
 * This function is used to get detail of sections and category
 * for admin other than sub admin
 */

function getAllSectionDetails(db_name, res, adminId, callback) {
    var sql = "select adma.section_id,adms.sections_name,adms.section_category_id,admscat.section_category_name from admin ad ";
    sql += " join admin_authority adma on ad.id = adma.admin_id join admin_sections adms on adma.section_id=adms.id ";
    sql += " join admin_section_category admscat on adms.section_category_id=admscat.id where ad.id = ? ORDER BY adma.section_id ASC ";
    multiConnection[db_name].query(sql, [adminId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            // console.log("----------------getAllSectionId---" + result.length);
            callback(null, result);

        }

    })

}

/*
 * This function is used to get detail of sections and category
 * for super admin
 */


function getAllSectionDetailsOfSuperAdmin(db_name, res, callback) {
    var sql = "select adms.id as section_id,adms.sections_name,adms.section_category_id,adm.section_category_name ";
    sql += "from admin_sections adms join admin_section_category adm on adms.section_category_id = adm.id ORDER by adms.id ASC "
    var st = multiConnection[db_name].query(sql, [], function (err, result) {
        logger.debug(st.sql)
        if (err) {
            // logger.debug("========= error in =============get all section details ================",err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            //   console.log("----------------getAllSectionIdofSuperAdmin---" + result);
            callback(null, result);

        }

    })

}

function getSectionIds(sectionDetails, cb) {
    var sectionLength = sectionDetails.length;
    var ids = [];
    for (var i = 0; i < sectionLength; i++) {
        (function (i) {
            ids.push(sectionDetails[i].section_id);
            if (i == sectionLength - 1) {
                //  console.log("----------------" + ids)
                cb(null, ids);
            }

        }(i))
    }

}


/*
 *This function is used to club all the data to be sent
 * at the time of admin login after successfull authentication
 */

function clubSectionDataAtLogin(singleSectionData, remainingSectionNames, sectionDetails, allSectionIds, cb) {
    // logger.debug("=============section details==================",sectionDetails[0].section_id)
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
    // logger.debug("===========before loop ==============",sectionDetails[1].section_id);

    for (var i = 0; i < 7; i++) {
        (function (i) {
            switch (i) {
                //HOME
                case 0:
                    var case0 = false;
                    /*
                     * This loop will execute for the total number of
                     * section assigned to this admin.
                     */
                    // logger.debug("===========in the loop ==============",j);

                    // logger.debug("===========in the loop second  ==============",sectionDetails);
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {


                            // logger.debug("===========in the loop ==============",j);

                            // logger.debug("===========in the loop ==============",sectionDetails[j]);
                            var section = {};

                            if (sectionDetails[j].section_id < 16) {
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
                                if (sectionDetails[j].section_id == 16) {
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
                                                    //     console.log("=====data 0 ====" + JSON.stringify(single));

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

                                data.push({ "category_id": 1, "category_name": "HOME", "category_data": home });
                                //   console.log(JSON.stringify(data));

                            }
                        }(j))
                    }
                    break;
                //PROFILEgetDifference
                case 1:
                    var cagetDifferencese1 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 16 && sectionDetails[j].section_id < 27 || sectionDetails[j].section_id == 63) {
                                case1 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //  console.log(singleSectionData1);
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
                                data.push({ "category_id": 2, "category_name": "PROFILE", "category_data": profile });
                            }

                        }(j))
                    }
                    break;
                //PRODUCTION
                case 2:
                    var case2 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {

                        (function (j) {

                            var section = {};

                            if (sectionDetails[j].section_id > 26 && sectionDetails[j].section_id < 36 || sectionDetails[j].section_id == 62) {

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
                case 3:
                    var case3 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 35 && sectionDetails[j].section_id < 41) {
                                case3 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //    console.log(singleSectionData1);
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
                                data.push({ "category_id": 4, "category_name": "ORDERS", "category_data": orders });
                            }


                        }(j))
                    }
                    break;
                //ACCOUNT
                case 4:
                    var case4 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 40 && sectionDetails[j].section_id < 45) {
                                case4 = true
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //     console.log(singleSectionData1);
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
                                data.push({ "category_id": 5, "category_name": "ACCOUNT", "category_data": account });
                            }


                        }(j))
                    }
                    break;
                //REPORTS
                case 5:
                    var case5 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 44 && sectionDetails[j].section_id < 51) {
                                case5 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //      console.log(singleSectionData1);
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
                                data.push({ "category_id": 6, "category_name": "REPORTS", "category_data": reports });
                            }


                        }(j))
                    }
                    break;
                //SETTINGS
                case 6:
                    var case6 = false;
                    for (var j = 0; j < sectionDetailsLength; j++) {
                        (function (j) {
                            var section = {};
                            if (sectionDetails[j].section_id > 50 && sectionDetails[j].section_id < 62) {
                                case6 = true;
                                section.section_name = sectionDetails[j].sections_name;
                                section.section_id = sectionDetails[j].section_id;
                                var lengthCheck = false;
                                for (var k = 0; k < loginArrayLength; k++) {
                                    (function (k) {
                                        if (logInArray[k] == sectionDetails[j].section_id) {
                                            var homeData = [];
                                            var singleSectionData1 = singleSectionData;
                                            //     console.log(singleSectionData1);
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
                                data.push({ "category_id": 7, "category_name": "SETTINGS", "category_data": settings });
                            }

                        }(j))
                    }
                    break;


                default:
                    break;
            }
            if (i == 6) {
                cb(null, data);
            }
        }(i))
    }

}


exports.dataOnUpdation = function (db_name, res, callback, adminId, sectionIdFromFrontEnd, accessToken, filter1) {
    var dataSectionIds;
    var singleSectionData;
    var sectionDetails;
    var isSuper;
    logger.debug("======in the dataOnUpdation 1==================")
    //console.log("======================sectionIdFromFrontEnd================" + sectionIdFromFrontEnd);

    if (sectionIdFromFrontEnd != '') {

        sectionIdFromFrontEnd = parseInt(sectionIdFromFrontEnd);
    }
    async.waterfall([
        function (cb) {
            //console.log("HERE 1");
            logger.debug("==========here 1=============")
            checkSuperAdminOrNot(db_name, res, adminId, cb);
        },
        function (superAdminCheck, cb) {
            logger.debug("=============here 2=============")
            //console.log("HERE 2");
            isSuper = superAdminCheck;

            if (superAdminCheck) {
                logger.debug("========here in superadmin================")
                getAllSectionDetailsOfSuperAdmin(db_name, res, cb);
                //console.log("here in superadmin");
            }
            else {
                logger.debug("================= here in superadmin 2==============")
                getAllSectionDetails(db_name, res, adminId, cb);
            }


        },
        function (sectionDetails1, cb) {

            sectionDetails = sectionDetails1;

            //  console.log("==================SECTION DATA================" + JSON.stringify(sectionDetails));
            logger.debug("============getsec id ======================")

            getSectionIds(sectionDetails, cb);

        },
        function (sectionIds, cb) {
            /*
             *dataSectionIds : all section ids assigned to this admin
             */
            dataSectionIds = sectionIds;



            if (accessToken && (sectionIdFromFrontEnd.toString() != '')) {

                logger.debug("=============================sectionIdFromFrontEnd======================" + sectionIdFromFrontEnd);
                loginCases.logInCases(db_name, res, [sectionIdFromFrontEnd], adminId, cb, filter1);
            } else if (accessToken) {
                logger.debug("=============================sectionIdFromFrontEnd===========else if===========");
                loginCases.logInCases(db_name, res, sectionIds, adminId, cb, filter1);
            }
        },
        function (singleSectionData1, cb) {
            /*
             *singleSectionData : data of section(single section) to be
             * display at home screen after login
             */

            singleSectionData = singleSectionData1;
            //  var singleSectionDataKeys = Object.keys(singleSectionData[0]);
            getDifference(dataSectionIds, logInArray, cb);

        },
        function (sectionIds, cb) {
            // console.log(sectionIds)
            /*
             *sectionIds : ids of those section for which only section name,
             * section id and category to be send
             */
            if (sectionIds.length) {
                if (isSuper) {
                    getSectionNameByIdForSuperAdmin(db_name, res, sectionIds, cb);
                }
                else {
                    getSectionNameById(db_name, res, adminId, sectionIds, cb);
                }

            }
            else {

                getSectionNameById(db_name, res, adminId, dataSectionIds, cb);
            }


        },
        function (remainingSectionNames, cb) {
            // console.log(remainingSectionNames)
            /*
             *remainingSectionNames : array of section names
             */
            clubSectionDataAtLogin(singleSectionData, remainingSectionNames, sectionDetails, dataSectionIds, cb);
            //   console.log("==========call after ====================================function call");

        }
    ], function (error, result) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })

}

function updatePassword(db_name, res, adminId, callback) {
    var password = "";
    async.waterfall([
        function (cb) {
            func.generateRandomString(cb)
        },
        function (password, cb) {
            //  console.log(password)
            cb(null, password);

        }], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            password = result;
            var cryptedPassword = md5(result);

            var sql = "update admin set password = ? where id = ? limit 1";
            multiConnection[db_name].query(sql, [cryptedPassword, adminId], function (err, result2) {
                if (err) {
                    sendResponse.somethingWentWrongError(res)
                }
                else {
                    callback(null, password);
                }

            })
        }

    })



}

function assignCategory(db_name, cb, allSectionId) {
    var _ = require('underscore');
    var categoryId = [];
    var categoryData = [];
    // console.log("==============all section ids=========="+JSON.stringify(allSectionId));
    var BreakException = {};
    for (var i = 0; i < 7; i++) {
        (function (i) {
            switch (i) {
                //HOME
                case 0:
                    /*
                     * This loop will execute for the total number of
                     * section assigned to this admin.
                     */
                    var home = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                    if ((_.intersection(home, allSectionId).length)) {
                        categoryId.push({ "category_id": 1, "section_ids": _.intersection(home, allSectionId) });
                        //   console.log("Home");
                    }

                    break;
                //PROFILE
                case 1:
                    var case1 = false;

                    var profile = [17, 18, 19, 20, 20, 21, 22, 23, 24, 25, 26, 63];
                    if ((_.intersection(profile, allSectionId).length)) {
                        categoryId.push({ "category_id": 2, "section_ids": _.intersection(profile, allSectionId) });
                        // console.log("Home");
                    }
                    break;
                //PRODUCTION
                case 2:
                    var case2 = false;
                    var production = [27, 28, 29, 30, 31, 32, 33, 34, 35, 62];
                    if ((_.intersection(production, allSectionId).length))
                        categoryId.push({ "category_id": 3, "section_ids": _.intersection(production, allSectionId) });
                    break;
                //ORDERS
                case 3:
                    var case3 = false;
                    var orders = [36, 37, 38, 39, 40];
                    if ((_.intersection(orders, allSectionId).length))
                        categoryId.push({ "category_id": 4, "section_ids": _.intersection(orders, allSectionId) });
                    break;
                //ACCOUNT
                case 4:
                    var case4 = false;
                    var account = [41, 42, 43, 44];
                    if ((_.intersection(account, allSectionId).length))
                        categoryId.push({ "category_id": 5, "section_ids": _.intersection(account, allSectionId) });
                    break;
                //REPORTS
                case 5:
                    var case5 = false;
                    var reports = [45, 46, 47, 48, 49, 50];
                    if ((_.intersection(reports, allSectionId).length))
                        categoryId.push({ "category_id": 6, "section_ids": _.intersection(reports, allSectionId) });
                    break;
                //SETTINGS
                case 6:
                    var case6 = false;
                    var settings = [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61];
                    if ((_.intersection(settings, allSectionId).length))
                        categoryId.push({ "category_id": 7, "section_ids": _.intersection(settings, allSectionId) });
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



exports.importAdminProduct = function (req, res) {
    var filepath = req.files.fileName;
    var base = paths.resolve(".") + "/uploads/" + "file.csv";
    //console.log("bvb",base);
    //console.log("gfggg",filepath.path,filepath);
    var header = [];
    var values = [];
    var csvData;
    var flag = 0;
    var missingField = [];
    var unSavedData = [];
    var data = [];
    var category = req.body.cat;
    var subCategory = req.body.subcat;
    var detailSubCategory = req.body.detSubcat;
    async.auto({
        uploadFile: function (cb) {
            console.log("fff", req.files.fileName);
            console.log("base", base);
            if (filepath.originalFilename) {
                fsExtra.copy(filepath.path, base, function (err, result) {
                    if (err) {
                        console.error("** 1ERROR ** ", err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        cb(null);
                    }
                });

            }
            else {
                var msg = "upload the file";
                sendResponse.sendErrorMessage(msg, res, 400);
            }

        },
        readFile: ['uploadFile', function (cb) {
            fs.readFile(base, function (err, data) { // Read the contents of the file
                if (err) {
                    console.error("** 2ERROR ** ", err);
                } else {

                    parseCsv(data.toString(), { comment: '#' }, function callback(err, data) {
                        if (err) {
                            console.error("** 3ERROR ** ", err);
                            sendResponse.somethingWentWrongError(res);

                        } else {
                            //console.log("ddddddd",data);
                            csvData = data;
                            cb(null);
                        }
                    });
                }
            });
        }],
        getHeader: ['readFile', function (cb) {
            var temp = csvData[0];
            for (var i = 0; i < temp.length; i++) {
                (function (i) {
                    header.push(temp[i])
                    if (i == (temp.length - 1)) {
                        cb(null);
                    }
                }(i));
            }
        }],
        SaveData: ['getHeader', function (cb) {
            var csvLength = csvData.length;
            for (var i = 1; i < csvLength; i++) {
                (function (i) {
                    var temp = csvData[i];
                    //console.log("........tewmpo...............",temp);
                    if (!(temp[0])) {
                        //console.log("in insert funcxtion");

                        newInsertValue(req.dbName, csvData[i], category, subCategory, detailSubCategory, function (err, result) {
                            if (err) {
                                if (i == (csvLength - 1)) {
                                    cb(null);
                                }

                            } else {
                                if (i == (csvLength - 1)) {
                                    cb(null);
                                }

                            }
                        })



                    } else {

                        updateInsertValue(req.dbName, csvData[i], category, subCategory, detailSubCategory, function (err, result) {
                            if (err) {
                                if (i == (csvLength - 1)) {
                                    cb(null);
                                }
                            } else {
                                if (i == (csvLength - 1)) {
                                    cb(null);
                                }
                            }
                        })
                    }

                }(i));
            }
        }]

        /*saveData:['getHeader',function(cb){
            console.log("kbhasdf",csvData.length)
            for(var i=1;i<csvData.length;i++){
                    (function (i) {
                        values=[];
                        var temp=csvData[i];
                        console.log("mhbjhbjhb",temp[0])
                        if(temp[0]){
                            var id=temp[0];
                            var length_temp=temp.length
                            for (var j=0;j<length_temp;j++){
                                (function (j) {
                                    if(temp[j] && flag==0){
                                        values.push(temp[j]);
                                        if(j==(length_temp-1)){
                                            console.log("kjbdvsssssss",values);
                                            var sql='update product set name = ?,product_desc = ?,measuring_unit = ?,bar_code=?,sku=?,category_id=?,sub_category_id=?,detailed_sub_category_id=? where id = ?';
                                            multiConnection[dbName].query(sql,[values[1],values[3],values[5],values[7],values[8],category,subCategory,detailSubCategory,id],function (err,result1) {
                                                if(err){
                                                    console.log('eeee',err);
                                                    sendResponse.somethingWentWrongError(res);
                                                }
                                                else{
                                                    var sql1='update product_ml set name=?,product_desc =?,measuring_unit=? where product_id =? and language_id=?';
                                                    multiConnection[dbName].query(sql1,[values[1],values[3],values[5],id,14],function (err,result2) {
                                                        if(err){
                                                            console.log('ffff',err);
                                                            sendResponse.somethingWentWrongError(res);
                                                        }
                                                        else {
                                                            var sql2='update product_ml set name=?,product_desc =?,measuring_unit=? where product_id =? and language_id=?';
                                                            multiConnection[dbName].query(sql2,[values[2],values[4],values[6],id,15],function (err,result3) {
                                                                if(err){
                                                                    console.log('gggg',err);
                                                                    sendResponse.somethingWentWrongError(res);
                                                                }
                                                                else{
                                                                    var sql3='update product_image set image_path = ? where product_id =? ';
                                                                    console.log("image",values[9])
                                                                    multiConnection[dbName].query(sql3,[values[9],id],function (err,result3) {
                                                                        if(err){
                                                                            console.log('hhhh',err);
                                                                            sendResponse.somethingWentWrongError(res);
                                                                        }
                                                                        else{
                                                                            flag=0
                                                                            if(i==csvData.length-1){
                                                                                cb(null);
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    }
                                    else{
                                        flag=1;
                                        if(j==temp.length-1){
                                            missingField.push(j);
                                            flag=0;
                                            if(i==csvData.length-1){
                                                cb(null);
                                            }
                                        }
                                    }

                                }(j))
                            }
                        }
                        else{
                            console.log("aaaabbbbbbbbbcccccc",temp);
                            for (var j=1;j<temp.length;j++){
                                (function (j) {
                                    if(temp[j] && flag==0){
                                        values.push(temp[j]);
                                        console.log("aaaabbbbbbbbb",values);
                                        if(j==temp.length-1){
                                            console.log("aaaa",values[0],values[1],values[2],values[3],values[4],values[5],values[6],values[7],values[8]);
                                            var sql='insert into product(name,product_desc,measuring_unit,bar_code,sku,category_id,sub_category_id,detailed_sub_category_id,is_global)values(?,?,?,?,?,?,?,?,?)'
                                            multiConnection[dbName].query(sql,[values[0],values[2],values[4],values[6],values[7],category,subCategory,detailSubCategory,1],function (err,result1) {
                                                if(err){
                                                    console.log('aaeeee',err);
                                                    sendResponse.somethingWentWrongError(res);
                                                }
                                                else{
                                                    var productId=result1.insertId;
                                                    //console.log("id-------",productId);
                                                    var sql1='insert into product_ml(name,product_desc,measuring_unit,language_id,product_id)values(?,?,?,?,?)'
                                                    multiConnection[dbName].query(sql1,[values[0],values[2],values[4],14,productId],function (err1,result2) {
                                                        if(err){
                                                            console.log('aaaiii',err1);
                                                            sendResponse.somethingWentWrongError(res);
                                                        }
                                                        else {
                                                            var sql2='insert into product_ml(name,product_desc,measuring_unit,language_id,product_id)values(?,?,?,?,?)'
                                                            multiConnection[dbName].query(sql2,[values[1],values[3],values[5],15,productId],function (err2,result3) {
                                                                if(err){
                                                                    console.log('aaajjj',err2);
                                                                    sendResponse.somethingWentWrongError(res);
                                                                }
                                                                else{
                                                                    var sql3='insert into product_image(product_id,image_path,default_image)values(?,?,?)'
                                                                    multiConnection[dbName].query(sql3,[productId,values[8],0],function (err3,result3) {
                                                                        if(err){
                                                                            console.log('aaakkk',err3);
                                                                            sendResponse.somethingWentWrongError(res);
                                                                        }
                                                                        else{
                                                                            flag=0
                                                                            if(i==csvData.length-1){
                                                                                cb(null);
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    }
                                    else{
                                        flag=1;
                                        if(j==temp.length-1){
                                            missingField.push(j);
                                            flag=0;
                                            if(i==csvData.length-1){
                                                cb(null);
                                            }
                                        }
                                    }

                                }(j))
                            }
                        }
                    }(i))
                }
        }],*/
        /* unSavedData:['saveData',function (cb) {
             data.push(header);
             //console.log("bkfik",data);
            // console.log("mmmm",missingField.length);
             for(var i=0;i<missingField.length;i++){
                 (function (i) {
                     var data1=csvData[missingField[i]];
                     console.log("bkfik",data1,data1.length);
                     for(var k=0;k< data1.length;k++){
                         (function (k) {
                             if(data1[k]){
                                 console.log("if",data1[k]);
                                 unSavedData.push(data1[k])
                                 if(k==data1.length-1){
                                     console.log("if if",unSavedData);
                                     data.push(unSavedData);
                                     if(i==missingField.length-1){
                                         console.log("if if if",data);
                                         cb(null);
                                     }
                                 }
                             }
                             else{
                                 console.log("else",data1[k]);
                                 unSavedData.push('missing');
                                 if(k==data1.length-1){
                                     console.log("else if",unSavedData);
                                     data.push(unSavedData);
                                     if(i==missingField.length-1){
                                         console.log("else if if",data);
                                         cb(null);
                                     }
                                 }
                             }
                         }(k))
                     }
                 }(i))
             }
         }]*/
    }, function (err, result) {
        if (err) {
            console.log("err", err)
            sendResponse.somethingWentWrongError(res);
        } else {
            //console.log("aaa",data);
            sendResponse.sendSuccessData(data, "csv uploaded ", res, constant.responseStatus.SUCCESS);
        }
    })

}


var newInsertValue = function (db_name, csvData, category, subCategory, detailSubCategory, cb) {
    var nameEnglish = '';
    var productId = 0;
    var flag = true;
    // console.log("..........................................csvData...................",csvData);
    // console.log("......................................................csvData[1]",csvData[3]);
    if (csvData[1] == '' || csvData[2] == '' || csvData[3] == '' || csvData[4] == '' || csvData[5] == '' || csvData[6] == '' ||
        csvData[7] == '' || csvData[8] == '' || csvData[9] == '') {
        flag = false;
    }

    async.auto({
        insertProduct: function (callback) {
            if (flag == true) {
                var sql = 'insert into product(name,product_desc,measuring_unit,bar_code,sku,category_id,sub_category_id,detailed_sub_category_id,is_global)values(?,?,?,?,?,?,?,?,?)'
                multiConnection[db_name].query(sql, [csvData[1], csvData[3], csvData[5], csvData[7], csvData[8], category, subCategory, detailSubCategory, 1], function (err, result) {
                    if (err) {
                        callback(null);
                    }
                    else {
                        productId = result.insertId;
                        callback(null);
                    }
                })
            } else {
                callback(null)
            }
        },
        insertImage: ['insertProduct', function (callback) {
            if (flag == true) {
                var default_image = 0;
                var images = csvData[9].split(',');
                var image_len = images.length;
                for (var j = 0; j < image_len; j++) {
                    (function (j) {
                        imageUpdate(db_name, images[j], productId, j, function (err, result) {
                            if (err) {
                                callback(err);
                            } else {
                                if (j == (image_len - 1)) {
                                    callback(null);
                                }
                            }
                        })
                    }(j));
                }
            } else {
                callback(null);
            }
        }],
        insertProductNameEnglish: ['insertProduct', function (callback) {
            if (flag == true) {
                var sql = 'insert into product_ml(name,product_desc,measuring_unit,language_id,product_id)values(?,?,?,?,?)'
                multiConnection[db_name].query(sql, [csvData[1], csvData[3], csvData[5], 14, productId], function (err, result) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(null);
                    }
                })
            } else {
                callback(null)
            }
        }],
        insertProductNameArabic: ['insertProduct', function (callback) {
            if (flag == true) {
                var sql = 'insert into product_ml(name,product_desc,measuring_unit,language_id,product_id)values(?,?,?,?,?)'
                multiConnection[db_name].query(sql, [csvData[2], csvData[4], csvData[6], 15, productId], function (err, result) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(null);
                    }
                })
            } else {
                callback(null)
            }
        }]
    }, function (err, result) {
        if (err) {
            cb(err);
        } else {
            cb(null)
        }
    })


}

var updateInsertValue = function (db_name, csvData, category, subCategory, detailSubCategory, cb) {
    async.auto({
        updateProduct: function (callback) {
            var sql = 'update product set name = ?,product_desc = ?,measuring_unit = ?,bar_code=?,sku=?,category_id=?,sub_category_id=?,detailed_sub_category_id=? where id = ?';
            multiConnection[db_name].query(sql, [csvData[1], csvData[3], csvData[5], csvData[7], csvData[8], category, subCategory, detailSubCategory, csvData[0]], function (err, result1) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            })
        },
        updateProductNameEnglish: function (callback) {
            var sql2 = 'update product_ml set name=?,product_desc =?,measuring_unit=? where product_id =? and language_id=?';
            multiConnection[db_name].query(sql2, [csvData[1], csvData[3], csvData[5], csvData[0], 14], function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            })
        },
        updateNameArabic: function (callback) {
            var sql2 = 'update product_ml set name=?,product_desc =?,measuring_unit=? where product_id =? and language_id=?';
            multiConnection[db_name].query(sql2, [csvData[2], csvData[4], csvData[6], csvData[0], 15], function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            })
        },
        updateImageDelete: function (callback) {
            var sql3 = "Delete from  product_image where product_id =? ";
            multiConnection[db_name].query(sql3, [csvData[0]], function (err, result) {
                if (err) {
                    callback(err)
                }
                else {
                    callback(null);
                }
            })
        },
        updateImage: ['updateImageDelete', function (callback) {
            var default_image = 0;
            //console.log("cc",csvData[9]);
            var images = csvData[9].split(',');
            var image_len = images.length;
            for (var j = 0; j < image_len; j++) {
                (function (j) {
                    imageUpdate(db_name, images[j], csvData[0], j, function (err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            if (j == (image_len - 1)) {
                                callback(null);
                            }
                        }
                    })
                }(j));
            }
        }]
    }, function (err, result) {
        if (err) {
            cb(err);
        } else {
            cb(null)
        }
    })
}

var imageUpdate = function (db_name, images, productId, imageOrder, callback) {
    imageOrder = imageOrder + 1;
    var sql = "insert into product_image(product_id,image_path,default_image)values(?,?,?)";
    multiConnection[db_name].query(sql, [productId, images, imageOrder], function (err, result3) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    })
}


/*
exports.multipleImageUpload = function (req,res) {
console.log(req.files);
}*/

exports.importAdminProductPricing = function (req, res) {
    var filepath = req.files.fileName;
    var base = paths.resolve(".") + "/uploads/" + "pricingfile.csv";
    // console.log("bvb",base);
    // console.log("gfggg",filepath.path,filepath);
    var header = [];
    var values = [];
    var csvData;
    var flag = 0;
    var missingField = [];
    var unSavedData = [];
    var data = [];
    var ids = [];
    async.auto({
        uploadFile: function (cb) {
            if (filepath.originalFilename) {
                fsExtra.copy(filepath.path, base, function (err, result) {
                    if (err) {
                        console.error("** 1ERROR ** ", err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        cb(null);
                    }
                });

            }
            else {
                var msg = "upload the file";
                sendResponse.sendErrorMessage(msg, res, 400);
            }

        },
        readFile: ['uploadFile', function (cb) {
            fs.readFile(base, function (err, data) { // Read the contents of the file
                if (err) {
                    console.error("** 2ERROR ** ", err);
                } else {
                    parseCsv(data.toString(), { comment: '#' }, function callback(err, data) {
                        if (err) {
                            console.error("** 3ERROR ** ", err);
                            sendResponse.somethingWentWrongError(res);

                        } else {
                            //console.log("ddddddd",data);
                            csvData = data;
                            cb(null);
                        }
                    });
                }
            });
        }],
        getHeader: ['readFile', function (cb) {
            var temp = csvData[0];
            for (var i = 0; i < temp.length; i++) {
                (function (i) {
                    //console.log("temp value22.......................................",temp[i]);
                    header.push(temp[i])
                    if (i == (temp.length - 1)) {
                        cb(null);
                    }
                }(i));
            }
        }],
        saveData: ['getHeader', function (cb) {
            var csvLength = csvData.length
            for (var i = 1; i < csvLength; i++) {
                (function (i) {
                    var temp = csvData[i];

                    updateProductPricing(req.dbName, temp, function (err, result) {
                        if (err) {
                            if (i == (csvLength - 1)) {
                                cb(null);
                            }

                        } else {
                            if (i == (csvLength - 1)) {
                                cb(null);
                            }

                        }
                    });
                    /*  for (var j=0;j<temp.length;j++){
                              (function (j) {
                                  if(temp[j] && flag==0){
                                      values.push(temp[j]);
                                      if(j==temp.length-1){
                                          var sql1='select id from product where id=?';
                                          multiConnection[dbName].query(sql1,[id],function (err,result) {
                                              if(err){
                                                  console.log('eeee',err);
                                                  sendResponse.somethingWentWrongError(res);
                                              }
                                              else {
                                                  if(result.length){
                                                      var sql2='update product_pricing set price = ?,handling = ?,can_urgent = ?,urgent_type=?,urgent_value=?,delivery_charges=? where product_id = ? and price_type = 0 and is_deleted=0';
                                                      multiConnection[dbName].query(sql2,[values[3],values[4],values[6],values[7],values[8],values[9],id],function (err,result1) {
                                                          if(err){
                                                              console.log('eeee',err);
                                                              sendResponse.somethingWentWrongError(res);
                                                          }
                                                          else {
                                                              console.log("ressss",result1)
                                                              if(result.affectedRows){
                                                                  flag = 0;
                                                                  if (i == csvData.length - 1) {
                                                                      cb(null);
                                                                  }
                                                              }else {
                                                                  var sql3 = 'insert into product_pricing '
                                                              }
  
                                                          }
  
                                                      });
                                                  }
                                                  else {
                                                      flag = 0;
                                                      if (i == csvData.length - 1) {
                                                          cb(null);
                                                      }
                                                  }
                                              }
                                          })
                                      }
                                  }
                                  else{
                                      flag=1;
                                      if(j==temp.length-1){
                                          missingField.push(j);
                                          flag=0;
                                          if(i==csvData.length-1){
                                              cb(null);
                                          }
                                      }
                                  }
  
                              }(j))
                          }*/
                }(i))
            }
        }],
        /* unSavedData:['saveData',function (cb) {
         data.push(header);
         //console.log("bkfik",data);
         // console.log("mmmm",missingField.length);
         for(var i=0;i<missingField.length;i++){
         (function (i) {
         var data1=csvData[missingField[i]];
         console.log("bkfik",data1,data1.length);
         for(var k=0;k< data1.length;k++){
         (function (k) {
         if(data1[k]){
         console.log("if",data1[k]);
         unSavedData.push(data1[k])
         if(k==data1.length-1){
         console.log("if if",unSavedData);
         data.push(unSavedData);
         if(i==missingField.length-1){
         console.log("if if if",data);
         cb(null);
         }
         }
         }
         else{
         console.log("else",data1[k]);
         unSavedData.push('missing');
         if(k==data1.length-1){
         console.log("else if",unSavedData);
         data.push(unSavedData);
         if(i==missingField.length-1){
         console.log("else if if",data);
         cb(null);
         }
         }
         }
         }(k))
         }
         }(i))
         }
         }]*/
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            //console.log("aaa",data);
            sendResponse.sendSuccessData(data, "csv uploaded ", res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.importSupplierProduct = function (req, res) {
    var filepath = req.files.fileName;
    var base = paths.resolve(".") + "/uploads/" + "file.csv";
    var header = [];
    var values = [];
    var csvData;
    var flag = 0;
    var missingField = [];
    var unSavedData = [];
    var data = [];
    var category = req.body.cat;
    var subCategory = req.body.subcat;
    var detailSubCategory = req.body.detSubcat;
    //console.log("iddddd",category,subCategory,detailSubCategory);
    async.auto({
        uploadFile: function (cb) {
            console.log("fff", filepath.originalFilename)
            if (filepath.originalFilename) {
                fsExtra.copy(filepath.path, base, function (err, result) {
                    if (err) {
                        console.error("** ERROR ** ", err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        cb(null);
                    }
                });

            }
            else {
                var msg = "upload the file";
                sendResponse.sendErrorMessage(msg, res, 400);
            }

        },
        readFile: ['uploadFile', function (cb) {
            fs.readFile(base, function (err, data) { // Read the contents of the file
                if (err) {
                    console.error("** ERROR ** ", err);
                } else {
                    parseCsv(data.toString(), { comment: '#' }, function callback(err, data) {
                        if (err) {
                            console.error("** ERROR ** ", err);
                            sendResponse.somethingWentWrongError(res);

                        } else {
                            //console.log("ddddddd",data);
                            csvData = data;
                            cb(null);
                        }
                    });
                }
            });
        }],
        getHeader: ['readFile', function (cb) {
            var temp = csvData[0];
            for (var i = 0; i < temp.length; i++) {
                (function (i) {
                    //console.log("temp value22.......................................",temp[i]);
                    header.push(temp[i])
                    if (i == (temp.length - 1)) {
                        cb(null);
                    }
                }(i));
            }
        }],
        SaveData: ['getHeader', function (cb) {
            var csvLength = csvData.length;
            for (var i = 1; i < csvLength; i++) {
                (function (i) {
                    var temp = csvData[i];
                    console.log("........tewmpo...............", csvLength);
                    if (!(temp[0])) {

                        newSupplierInsertValue(req.dbName, csvData[i], category, subCategory, detailSubCategory, function (err, result) {
                            console.log(".............vvalue of i.............................", i)
                            console.log(".............vvalue of csvLength.............................", csvLength)
                            if (err) {
                                if (i == (csvLength - 1)) {
                                    cb(null);
                                }

                            } else {
                                if (i == (csvLength - 1)) {
                                    cb(null);
                                }

                            }
                        })
                    } else {
                        supplierupdateInsertValue(req.dbName, csvData[i], category, subCategory, detailSubCategory, function (err, result) {
                            if (err) {
                                if (i == (csvLength - 1)) {
                                    cb(null);
                                }
                            } else {
                                if (i == (csvLength - 1)) {
                                    cb(null);
                                }
                            }
                        })
                    }

                }(i));
            }
        }]
        /*  saveData:['getHeader',function(cb){
              for(var i=1;i<csvData.length;i++){
                  (function (i) {
                      values=[];
                      var temp=csvData[i];
                      if(temp[0]){
                          var id=temp[0];
                          for (var j=0;j<temp.length;j++){
                              (function (j) {
                                  if(temp[j] && flag==0){
                                      values.push(temp[j]);
                                      if(j==temp.length-1){
                                          var sql='update product set name = ?,product_desc = ?,measuring_unit = ?,bar_code=?,sku=?,category_id=?,sub_category_id=?,detailed_sub_category_id=? where id = ?';
                                          multiConnection[dbName].query(sql,[values[2],values[4],values[6],values[8],values[9],category,subCategory,detailSubCategory,id],function (err,result1) {
                                              if(err){
                                                  console.log('eeee',err);
                                                  sendResponse.somethingWentWrongError(res);
                                              }
                                              else{
                                                  var sql1='update product_ml set name=?,product_desc =?,measuring_unit=? where product_id =? and language_id=?';
                                                  multiConnection[dbName].query(sql1,[values[2],values[4],values[6],id,14],function (err,result2) {
                                                      if(err){
                                                          console.log('ffff',err);
                                                          sendResponse.somethingWentWrongError(res);
                                                      }
                                                      else {
                                                          var sql2='update product_ml set name=?,product_desc =?,measuring_unit=? where product_id =? and language_id=?';
                                                          multiConnection[dbName].query(sql2,[values[3],values[5],values[7],id,15],function (err,result3) {
                                                              if(err){
                                                                  //  console.log('gggg',err);
                                                                  sendResponse.somethingWentWrongError(res);
                                                              }
                                                              else{
                                                                  var sql3='update product_image set image_path = ? where product_id =? ';
                                                                  multiConnection[dbName].query(sql3,[values[10],id],function (err,result3) {
                                                                      if(err){
                                                                          //console.log('hhhh',err);
                                                                          sendResponse.somethingWentWrongError(res);
                                                                      }
                                                                      else{
                                                                          var sql4='update supplier_product set category_id= ?,sub_category_id=?,detailed_sub_category_id=? where supplier_id=? and product_id = ?';
                                                                          multiConnection[dbName].query(sql4,[category,subCategory,detailSubCategory,values[1],id],function (err,result) {
                                                                              if(err){
                                                                                  //console.log('hhhh',err);
                                                                                  sendResponse.somethingWentWrongError(res);
                                                                              }
                                                                              else {
                                                                                  flag=0;
                                                                                  if(i==csvData.length-1){
                                                                                      cb(null);
                                                                                  }
                                                                              }
                                                                          });
                                                                      }
                                                                  })
                                                              }
                                                          });
                                                      }
                                                  });
                                              }
                                          })
                                      }
                                  }
                                  else{
                                      flag=1;
                                      if(j==temp.length-1){
                                          missingField.push(j);
                                          flag=0;
                                          if(i==csvData.length-1){
                                              cb(null);
                                          }
                                      }
                                  }
  
                              }(j))
                          }
                      }
                      else{
                          for (var j=1;j<temp.length;j++){
                              (function (j) {
                                  if(temp[j] && flag==0){
                                      values.push(temp[j]);
                                      if(j==temp.length-1){
                                          var sql='insert into product(name,product_desc,measuring_unit,bar_code,sku)values(?,?,?,?,?)'
                                          multiConnection[dbName].query(sql,[values[1],values[3],values[5],values[7],values[8]],function (err,result1) {
                                              if(err){
                                                  console.log('eeee',err);
                                                  sendResponse.somethingWentWrongError(res);
                                              }
                                              else{
                                                  var productId=result1.insertId;
                                                  //console.log("id-------",productId);
                                                  var sql1='insert into product_ml(name,product_desc,measuring_unit,language_id,product_id)values(?,?,?,?,?)'
                                                  multiConnection[dbName].query(sql1,[values[1],values[3],values[5],14,productId],function (err,result2) {
                                                      if(err){
                                                          console.log('iii',err);
                                                          sendResponse.somethingWentWrongError(res);
                                                      }
                                                      else {
                                                          var sql2='insert into product_ml(name,product_desc,measuring_unit,language_id,product_id)values(?,?,?,?,?)'
                                                          multiConnection[dbName].query(sql2,[values[2],values[4],values[6],15,productId],function (err,result3) {
                                                              if(err){
                                                                  //       console.log('jjj',err);
                                                                  sendResponse.somethingWentWrongError(res);
                                                              }
                                                              else{
                                                                  var sql3='insert into product_image(product_id,image_path,default_image)values(?,?,?)'
                                                                  multiConnection[dbName].query(sql3,[productId,values[9],0],function (err,result3) {
                                                                      if(err){
                                                                          //            console.log('kkk',err);
                                                                          sendResponse.somethingWentWrongError(res);
                                                                      }
                                                                      else{
                                                                          var sql4='insert into supplier_product(supplier_id,category_id,sub_category_id,detailed_sub_category_id,product_id)values(?,?,?,?,?)'
  
                                                                          multiConnection[dbName].query(sql4,[values[1],category,subCategory,detailSubCategory,productId],function (err,result) {
                                                                              if(err){
                                                                                  //console.log('hhhh',err);
                                                                                  sendResponse.somethingWentWrongError(res);
                                                                              }
                                                                              else {
                                                                                  flag=0;
                                                                                  if(i==csvData.length-1){
                                                                                      cb(null);
                                                                                  }
                                                                              }
                                                                          })
                                                                      }
                                                                  })
                                                              }
                                                          });
                                                      }
                                                  });
                                              }
                                          })
                                      }
                                  }
                                  else{
                                      flag=1;
                                      if(j==temp.length-1){
                                          missingField.push(j);
                                          flag=0;
                                          if(i==csvData.length-1){
                                              cb(null);
                                          }
                                      }
                                  }
  
                              }(j))
                          }
                      }
                  }(i))
              }
          }]*/
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, "csv uploaded ", res, constant.responseStatus.SUCCESS);
        }
    })
}

var newSupplierInsertValue = function (db_name, csvData, category, subCategory, detailSubCategory, cb) {
    var nameEnglish = '';
    var productId = 0;
    var flag = true;
    console.log("..........................................csvData...................", csvData);
    // console.log("......................................................csvData[1]",csvData[3]);
    if (csvData[1] == '' || csvData[2] == '' || csvData[3] == '' || csvData[4] == '' || csvData[5] == '' || csvData[6] == '' ||
        csvData[7] == '' || csvData[8] == '' || csvData[9] == '' || csvData[10] == '') {
        flag = false;
    }

    async.auto({
        insertProduct: function (callback) {
            if (flag == true) {
                var sql = 'insert into product(name,product_desc,measuring_unit,bar_code,sku,category_id,sub_category_id,detailed_sub_category_id,is_global,is_live)values(?,?,?,?,?,?,?,?,?,?)';
                multiConnection[db_name].query(sql, [csvData[2], csvData[4], csvData[6], csvData[8], csvData[9], category, subCategory, detailSubCategory, 0, 1], function (err, result) {
                    if (err) {
                        callback(null);
                    }
                    else {
                        productId = result.insertId;
                        console.log("result.insertId..........................................", result.insertId);
                        callback(null);
                    }
                })
            } else {
                callback(null)
            }
        },
        insertImage: ['insertProduct', function (callback) {
            if (flag == true) {
                var default_image = 0;
                var images = csvData[10].split(',');
                var image_len = images.length;
                for (var j = 0; j < image_len; j++) {
                    (function (j) {
                        imageUpdate(db_name, images[j], productId, j, function (err, result) {
                            if (err) {
                                callback(err);
                            } else {
                                if (j == (image_len - 1)) {
                                    callback(null);
                                }
                            }
                        })
                    }(j));
                }
            } else {
                callback(null);
            }
        }],
        insertProductNameEnglish: ['insertProduct', function (callback) {
            if (flag == true) {
                var sql = 'insert into product_ml(name,product_desc,measuring_unit,language_id,product_id)values(?,?,?,?,?)'
                multiConnection[db_name].query(sql, [csvData[2], csvData[4], csvData[6], 14, productId], function (err, result) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(null);
                    }
                })
            } else {
                callback(null)
            }
        }],
        insertProductNameArabic: ['insertProduct', function (callback) {
            if (flag == true) {
                var sql = 'insert into product_ml(name,product_desc,measuring_unit,language_id,product_id)values(?,?,?,?,?)'
                multiConnection[db_name].query(sql, [csvData[3], csvData[5], csvData[7], 15, productId], function (err, result) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(null);
                    }
                })
            } else {
                callback(null)
            }
        }],
        insertSupplierProduct: ['insertProductNameArabic', function (callback) {
            if (flag == true) {
                var sql = 'insert into supplier_product(supplier_id,category_id,sub_category_id,detailed_sub_category_id,product_id)values(?,?,?,?,?)'
                multiConnection[db_name].query(sql, [csvData[1], category, subCategory, detailSubCategory, productId], function (err, result) {
                    if (err) {
                        console.log("err", err);
                        callback(null);
                    } else {
                        callback(null);
                    }
                })
            } else {
                callback(null)
            }
        }],
        blank: ['insertSupplierProduct', function (callback) {
            callback(null);
        }],
    }, function (err, result) {
        if (err) {
            cb(err);
        } else {
            console.log(".......callback.....");
            cb(null)
        }
    })


}

var supplierupdateInsertValue = function (db_name, csvData, category, subCategory, detailSubCategory, cb) {
    var flag = 0
    async.auto({
        updateProduct: function (callback) {
            var sql = 'update product set name = ?,product_desc = ?,measuring_unit = ?,bar_code=?,sku=?,category_id=?,sub_category_id=?,detailed_sub_category_id=?,is_live=? where id = ?';
            multiConnection[db_name].query(sql, [csvData[2], csvData[4], csvData[6], csvData[8], csvData[9], category, subCategory, detailSubCategory, 1, csvData[0]], function (err, result1) {
                if (err) {
                    console.log("eeeerrrrrr", err);
                    callback(null);
                } else {
                    callback(null);
                }
            })
        },
        updateProductNameEnglish: function (callback) {
            var sql2 = 'update product_ml set name=?,product_desc =?,measuring_unit=? where product_id =? and language_id=?';
            multiConnection[db_name].query(sql2, [csvData[2], csvData[4], csvData[6], csvData[0], 14], function (err, result) {
                if (err) {
                    console.log("eeeerrrr", err);
                    callback(null);
                } else {
                    callback(null);
                }
            })
        },
        updateNameArabic: function (callback) {
            var sql2 = 'update product_ml set name=?,product_desc =?,measuring_unit=? where product_id =? and language_id=?';
            multiConnection[db_name].query(sql2, [csvData[3], csvData[5], csvData[7], csvData[0], 15], function (err, result) {
                if (err) {
                    console.log("aaerr", err);
                    callback(null);
                } else {
                    callback(null);
                }
            })
        },
        updateImageDelete: function (callback) {
            var sql3 = "Delete from  product_image where product_id =? ";
            multiConnection[db_name].query(sql3, [csvData[0]], function (err, result) {
                if (err) {
                    console.log("errrr", err);
                    callback(null)
                }
                else {
                    callback(null);
                }
            })
        },
        updateImage: ['updateImageDelete', function (callback) {
            var default_image = 0;
            //console.log("cc",csvData[10]);
            var images = csvData[10].split(',');
            var image_len = images.length;
            for (var j = 0; j < image_len; j++) {
                (function (j) {
                    imageUpdate(db_name, images[j], csvData[0], j, function (err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            if (j == (image_len - 1)) {
                                callback(null);
                            }
                        }
                    })
                }(j));
            }
        }],
        updateSupplierProduct: ['updateImage', function (callback) {
            var sql = 'update supplier_product set category_id= ?,sub_category_id=?,detailed_sub_category_id=? where supplier_id=? and product_id = ?'
            multiConnection[db_name].query(sql, [category, subCategory, detailSubCategory, csvData[1], csvData[0]], function (err, result) {
                if (err) {
                    console.log("err", err);
                    callback(null);
                } else {
                    callback(null);
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            cb(err);
        } else {
            cb(null)
        }
    })
}

exports.importSupplierProductPricing = function (req, res) {
    var filepath = req.files.fileName;
    var base = paths.resolve(".") + "/uploads/" + "pricingfile.csv";
    // console.log("bvb",base);
    // console.log("gfggg",filepath.path,filepath);
    var header = [];
    var values = [];
    var csvData;
    var flag = 0;
    var missingField = [];
    var unSavedData = [];
    var data = [];
    async.auto({
        uploadFile: function (cb) {
            //console.log("fff",filepath.originalFilename)
            if (filepath.originalFilename) {
                fsExtra.copy(filepath.path, base, function (err, result) {
                    if (err) {
                        console.error("** ERROR ** ", err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        cb(null);
                    }
                });

            }
            else {
                var msg = "upload the file";
                sendResponse.sendErrorMessage(msg, res, 400);
            }

        },
        readFile: ['uploadFile', function (cb) {
            fs.readFile(base, function (err, data) { // Read the contents of the file
                if (err) {
                    console.error("** ERROR ** ", err);
                } else {
                    parseCsv(data.toString(), { comment: '#' }, function callback(err, data) {
                        if (err) {
                            console.error("** ERROR ** ", err);
                            sendResponse.somethingWentWrongError(res);

                        } else {
                            //console.log("ddddddd",data);
                            csvData = data;
                            cb(null);
                        }
                    });
                }
            });
        }],
        getHeader: ['readFile', function (cb) {
            var temp = csvData[0];
            for (var i = 0; i < temp.length; i++) {
                (function (i) {
                    //console.log("temp value22.......................................",temp[i]);
                    header.push(temp[i])
                    if (i == (temp.length - 1)) {
                        cb(null);
                    }
                }(i));
            }
        }],
        saveData: ['getHeader', function (cb) {
            var csvLength = csvData.length
            for (var i = 1; i < csvLength; i++) {
                (function (i) {
                    var temp = csvData[i];
                    updateProductPricing(temp, function (err, result) {
                        if (err) {
                            if (i == (csvLength - 1)) {
                                cb(null);
                            }

                        } else {
                            if (i == (csvLength - 1)) {
                                cb(null);
                            }

                        }
                    });
                    /*  for (var j=0;j<temp.length;j++){
                     (function (j) {
                     if(temp[j] && flag==0){
                     values.push(temp[j]);
                     if(j==temp.length-1){
                     var sql1='select id from product where id=?';
                     multiConnection[dbName].query(sql1,[id],function (err,result) {
                     if(err){
                     console.log('eeee',err);
                     sendResponse.somethingWentWrongError(res);
                     }
                     else {
                     if(result.length){
                     var sql2='update product_pricing set price = ?,handling = ?,can_urgent = ?,urgent_type=?,urgent_value=?,delivery_charges=? where product_id = ? and price_type = 0 and is_deleted=0';
                     multiConnection[dbName].query(sql2,[values[3],values[4],values[6],values[7],values[8],values[9],id],function (err,result1) {
                     if(err){
                     console.log('eeee',err);
                     sendResponse.somethingWentWrongError(res);
                     }
                     else {
                     console.log("ressss",result1)
                     if(result.affectedRows){
                     flag = 0;
                     if (i == csvData.length - 1) {
                     cb(null);
                     }
                     }else {
                     var sql3 = 'insert into product_pricing '
                     }

                     }

                     });
                     }
                     else {
                     flag = 0;
                     if (i == csvData.length - 1) {
                     cb(null);
                     }
                     }
                     }
                     })
                     }
                     }
                     else{
                     flag=1;
                     if(j==temp.length-1){
                     missingField.push(j);
                     flag=0;
                     if(i==csvData.length-1){
                     cb(null);
                     }
                     }
                     }

                     }(j))
                     }*/
                }(i))
            }
        }],
        /* saveData:['getHeader',function(cb){
             for(var i=1;i<csvData.length;i++){
                 (function (i) {
                     var temp=csvData[i];
                     var id=temp[0];
                     values =[];
                     for (var j=0;j<temp.length;j++){
                         (function (j) {
                             if(temp[j] && flag==0){
                                 values.push(temp[j]);
                                 if(j==temp.length-1){
                                     var sql='update product_pricing set price = ?,handling = ?,can_urgent = ?,urgent_type=?,urgent_price=?,delivery_charges=? where product_id = ? and price_type = 0 and is_deleted=0';
                                     multiConnection[dbName].query(sql,[values[1],values[2],values[3],values[4],values[5],values[6],id],function (err,result1) {
                                         if(err){
                                             console.log('eeee',err);
                                             sendResponse.somethingWentWrongError(res);
                                         }
                                         else {
                                             flag = 0;
                                             if (i == csvData.length - 1) {
                                                 cb(null);
                                             }
                                         }
 
                                     });
                                 }
                             }
                             else{
                                 flag=1;
                                 if(j==temp.length-1){
                                     missingField.push(j);
                                     flag=0;
                                     if(i==csvData.length-1){
                                         cb(null);
                                     }
                                 }
                             }
 
                         }(j))
                     }
                 }(i))
             }
         }],*/
        /* unSavedData:['saveData',function (cb) {
         data.push(header);
         //console.log("bkfik",data);
         // console.log("mmmm",missingField.length);
         for(var i=0;i<missingField.length;i++){
         (function (i) {
         var data1=csvData[missingField[i]];
         console.log("bkfik",data1,data1.length);
         for(var k=0;k< data1.length;k++){
         (function (k) {
         if(data1[k]){
         console.log("if",data1[k]);
         unSavedData.push(data1[k])
         if(k==data1.length-1){
         console.log("if if",unSavedData);
         data.push(unSavedData);
         if(i==missingField.length-1){
         console.log("if if if",data);
         cb(null);
         }
         }
         }
         else{
         console.log("else",data1[k]);
         unSavedData.push('missing');
         if(k==data1.length-1){
         console.log("else if",unSavedData);
         data.push(unSavedData);
         if(i==missingField.length-1){
         console.log("else if if",data);
         cb(null);
         }
         }
         }
         }(k))
         }
         }(i))
         }
         }]*/
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            //console.log("aaa",data);
            sendResponse.sendSuccessData(data, "csv uploaded ", res, constant.responseStatus.SUCCESS);
        }
    })
}

function updateProductPricing(db_name, csvData, callback) {
    var flag = true;
    var check = true;
    var insert = true;
    //console.log("cs",csvData);
    if (csvData[1] == '' || csvData[2] == '' || csvData[3] == '' || csvData[4] == '' || csvData[5] == '' || csvData[6] == '' ||
        csvData[7] == '' || csvData[8] == '' || csvData[9] == '' || csvData[10] == '' || csvData[11] == '') {
        flag = false;
    }

    async.auto({
        checkProduct: function (cb) {
            //      console.log("flag",flag);
            if (flag = true) {
                //        console.log(" in if")
                var sql1 = 'select id from product where id=?';
                multiConnection[db_name].query(sql1, [csvData[0]], function (err, result) {
                    if (err) {
                        cb(null);
                    }
                    else {
                        if (result.length) {
                            cb(null)
                        }
                        else {
                            check = false;
                            cb(null);
                        }
                    }
                });
            }
            else {
                //      console.log(" in else")
                cb(null)
            }
        },
        updatePricing: ['checkProduct', function (cb) {
            // console.log("flag ch",flag,check);
            if (flag == true && check == true) {
                // console.log(" in if")
                var sql2 = 'update product_pricing set price = ?,display_price=?,handling = ?,handling_supplier=?,can_urgent = ?,urgent_type=?,urgent_value=?,start_date=?,end_date=? where product_id = ? and price_type = 0 and is_deleted=0';
                multiConnection[db_name].query(sql2, [csvData[4], csvData[4], csvData[5], csvData[6], csvData[7], csvData[8], csvData[9], csvData[10], csvData[11], csvData[0]], function (err, result) {
                    if (err) {
                        console.log("errr", err)
                        cb(null);
                    }
                    else {
                        if (result.affectedRows) {
                            insert = false;
                            cb(null);
                        }
                        else {
                            cb(null)
                        }
                    }
                })
            }
            else {
                //   console.log(" in else")
                cb(null)
            }
        }],
        insertPricing: ['updatePricing', function (cb) {
            // console.log("flag ch ii",flag,check,insert);
            if (flag == true && check == true && insert == true) {
                // console.log(" in if")
                var sql3 = 'insert into product_pricing(product_id,price,display_price,handling,handling_supplier,can_urgent,urgent_type,urgent_value,start_date,end_date)values(?,?,?,?,?,?,?,?,?,?)'
                multiConnection[db_name].query(sql3, [csvData[0], csvData[4], csvData[4], csvData[5], csvData[6], csvData[7], csvData[8], csvData[9], csvData[10], csvData[11]], function (err, result) {
                    if (err) {
                        console.log("errr", err)
                        cb(null);
                    }
                    else {
                        cb(null)
                    }
                })
            }
            else {
                //  console.log(" in else")
                cb(null)
            }
        }]
    }, function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null)
        }
    })
}