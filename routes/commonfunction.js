var sendResponse = require('./sendResponse');
//var dbConfig = config.get('EmailCredentials');
var constant = require('./constant');
var readMultipleFiles = require('read-multiple-files');
const moment = require('moment')
var func = require('./commonfunction');
var async = require('async');
var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var Path = require('path');
var knox = require('knox-s3');
var UniversalFunctions = require('../util/Universal')
var fsExtra = require('fs-extra');
var Thumbnail = require('thumbnail');
var log4js = require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const ExecuteQ = require('../lib/Execute');
const { reject } = require('underscore');
/*
 * ------------------------------------------------------
 * Check if manadatory fields are not filled
 * INPUT : array of field names which need to be mandatory
 * OUTPUT : Error if mandatory fields not filled
 * ------------------------------------------------------
 */
exports.checkBlank = function (res, manValues, callback) {
    //  console.log('manvalue-------',manValues);
    var checkBlankData = checkBlank(manValues);
    logger.debug("============checkblankdata==============", checkBlankData)
    if (checkBlankData) {
        logger.debug("============in parameter missing error===================");
        sendResponse.parameterMissingError(res);
    } else {
        callback(null);
    }
}

function checkBlank(arr) {
    logger.debug("================arr.length============", arr.length)

    var arrlength = arr.length;
    //   console.log("================" + arr);
    for (var i = 0; i < arrlength; i++) {
        //   console.log("==============array values===============" + arr[i]);
        console.log("*****ss**********", arr[i]);
        if (arr[i] == undefined) {
            logger.debug("============here 1===============");
            return 1;
            break;
        }
        else if (arr[i].toString().trim() == '') {
            logger.debug("===============here 2==================", arrlength);
            return 1;
            break;
        } else if (arr[i] == '(null)') {
            logger.debug("================here 3====================");
            return 1;
            break;
        }
    }
    return 0;
}


/*
 * -----------------------------------------------------------------------------
 * Encryption code
 * INPUT : string
 * OUTPUT : crypted string
 * -----------------------------------------------------------------------------
 */
exports.encrypt = function (text) {

    var crypto = require('crypto');
    var cipher = crypto.createCipher('aes-256-cbc', 'd6F3Efeq');
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}


/*
 * ------------------------------------------------------
 * Authenticate a user through Access token and return id
 * Input:Access token
 * Output: Admin_id Or Json error
 * ------------------------------------------------------
 */
exports.authenticateAccessToken = async function (db_name, accesstoken, res, callback) {
    var sql = "select id from admin";
    sql += " where access_token =? limit 1";
    var values = [accesstoken];
    //console.log("bksaddsa",values)
    // console.log("================dbName=========/////===",multiConnection[db_name])
    try {
        let result = await ExecuteQ.Query(db_name, sql, values);
        if (result && result.length > 0) {
            return callback(null, result[0].id);
        }
        else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }

    }
    catch (Err) {
        logger.debug("access token invalid in common function");
        sendResponse.somethingWentWrongError(res);
    }
    // var statement =multiConnection[db_name].query(sql, values, function(err, result) {
    //     console.log(err,result);

    //     // console.log("kbfudfjsfd",result,err,statement.sql);
    //     if (result.length>0) {
    //         return callback(null, result[0].id);
    //     } else {
    //         console.log("access token invalid in common function");
    //         var data = {};
    //         sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);

    //     }
    // });

}
//exports.cryptPassword = function(password, callback) {
//    bcrypt.genSalt(10, function(err, salt) {
//        if (err){
//            return callback(err);
//        }
//
//        bcrypt.hash(password, salt, function(err, hash) {
//            return callback(err, hash);
//        });
//
//    });
//};

exports.adminRegOrNotByEmailAndPass = function (db_name, res, callback, email, pass, country, city, clientIp, status) {
    //  console.log("from adminRegOrNotByEmailAndPass")
    var sql = "select id,password from admin where email = ?  limit 1 ";
    multiConnection[db_name].query(sql, [email], function (err, userResponse) {

        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            if (userResponse.length) {
                if (pass == userResponse[0].password) {
                    callback(null, userResponse[0].id);
                } else {
                    async.waterfall([

                        function (cb) {
                            func.insertFailure(db_name, res, cb, clientIp, userResponse[0].id, country, city, constant.responseMessage.INVALID_PASS, status);
                        }
                    ], function (err1, reply1) {
                        var data = {};
                        sendResponse.sendSuccessData(data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
                    })

                }

            }
            else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
            }
        }


    });
}


exports.getAllSectionIds = function (db_name, res, adminId, callback) {
    var sql = "select section_id from admin_authority where admin_id = ?";
    multiConnection[db_name].query(sql, [adminId], function (err, userResponse) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (userResponse.length) {
                var limit = userResponse.length;
                var sectionIds = [];
                for (var i = 0; i < limit; i++) {
                    (function (i) {
                        sectionIds.push(userResponse[i].section_id);
                        if (i == limit - 1) {
                            callback(null, sectionIds);
                        }
                    }(i));
                }
            }
            else {
                callback(null, []);
            }
        }


    });
}


exports.updateAccessToken = function (db_name, res, cb, adminId, email, clientIp, country, city, message, status, fcm_token) {
    //  console.log("from updateAccessToken")
    var accessToken = func.encrypt(email + new Date());
    var sql = "update admin set access_token = ?,fcm_token=? where id=? limit 1"
    var statement = multiConnection[db_name].query(sql, [accessToken, fcm_token, adminId], function (err, result) {
        console.log(statement.sql)
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var date = new Date();
            var date1 = date.toISOString().split("T");
            var todayDate = date1[0];
            var sql1 = "insert into admin_login(ip,access_token,admin_id,login_date,city,country,login_status,status) values(?,?,?,?,?,?,?,?)"
            multiConnection[db_name].query(sql1, [clientIp, accessToken, adminId, todayDate, city, country, message, status], function (error, reply) {
                if (error) {
                    console.error(error)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null, accessToken);
                }

            })

        }

    })

}


/*
 * ------------------------------------------------------
 * function to check the authorities of the admin
 * Input:admin id, section id
 * Output: Success Message or Error
 * ------------------------------------------------------
 */
exports.checkforAuthorityofThisAdmin = async function (db_name, id, sectionId, res, cb) {
    try {
        //  console.log("Inside authority check fn");
        var sql = "SELECT `is_superadmin`,`is_active` FROM admin where id=? limit 1 "
        let result = await ExecuteQ.Query(db_name, sql, [id]);
        if (result && result.length > 0) {
            // logger.debug("===============in the if 1",result[0].is_superadmin)
            if (result[0].is_superadmin == 1) {
                return cb(null);
            }
            else {
                // logger.debug("===============in the else 2")
                return cb(null);
            }
        }
        else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
        }
    }
    catch (Err) {
        logger.debug("====checkforAuthorityofThisAdmin=Err!=", Err);
        sendResponse.somethingWentWrongError(res);
    }
    // var stat = multiConnection[db_name].query(sql, [id], function (err, result) {
    //     // logger.debug("=========================sql query in checkforAuthorityofThisAdmin =========",result)
    //     if (err) {
    //         // logger.debug("===========in the error 1===================")
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         // logger.debug("===========in the else 1===================")


    //         if (result.length>0) {
    //             // logger.debug("===============in the if 1",result[0].is_superadmin)
    //             if (result[0].is_superadmin == 1) {
    //                 // logger.debug("===============in the if 2")

    //                 return cb(null);
    //             }
    //             else {
    //                 // logger.debug("===============in the else 2")
    //                 return cb(null);
    //                 // var sql = "select id from admin_authority where section_id=? && admin_id=? limit 1"
    //                 // multiConnection[db_name].query(sql, [sectionId, id], function (err, checkAuthority) {
    //                 //     if (err) {
    //                 //         logger.debug("=======in the if 3==================")
    //                 //         sendResponse.somethingWentWrongError(res);
    //                 //     }
    //                 //     else {
    //                 //       //  console.log(checkAuthority)
    //                 //       logger.debug("===================in the else=================3");
    //                 //         if (checkAuthority.length) {
    //                 //             logger.debug("=============in the if 4")
    //                 //             return cb(null);
    //                 //         }
    //                 //         else {
    //                 //             logger.debug("=====================in the else 4=======")
    //                 //             sendResponse.invalidAccessTokenError(res);
    //                 //         }
    //                 //     }
    //                 //
    //                 // })
    //             }


    //         }
    //         else {
    //             // logger.debug("=========ELC")
    //             var data = {};
    //             sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
    //         }


    //     }

    // })

}




/*
 * ------------------------------------------------------
 * Authenticate a user through Access token and return id
 * Input:Access token
 * Output: supplier_id Or Json error
 * ------------------------------------------------------
 */
exports.authenticateAccessTokenSupplier = async function (dbName, accesstoken, res, callback) {
    try {
        var sql = "select id from supplier_admin";
        sql += " where access_token =? limit 1";
        var values = [accesstoken];
        let result = await ExecuteQ.Query(dbName, sql, values);

        var sql1 = "select id from supplier_branch";
        sql1 += " where access_token =? limit 1";
        var values1 = [accesstoken];
        let result1 = await ExecuteQ.Query(dbName, sql1, values1);

        if (result && result.length > 0) {
            return callback(null, result[0].id);
        }
        else if (result1 && result1.length > 0) {
            return callback(null, result1[0].id);
        }
        else {
            console.log("access ==token invalid in common function", result1);
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }

    }
    catch (Err) {
        logger.debug("====checkforAuthorityofThisAdmin=Err!=", Err);
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "select id from supplier_admin";
    // sql += " where access_token =? limit 1";
    // var values = [accesstoken];
    // multiConnection[dbName].query(sql, values, function (err, result) {

    //     if (result.length > 0) {

    //         return callback(null, result[0].id);

    //     } else {
    //      //   console.log("access token invalid in common function");
    //         var data = {};
    //         sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
    //     }
    // });

}
exports.authenticateAccessTokenSupplierBranch = async function (dbName, accesstoken, res, callback) {
    try {
        var sql = "select id from supplier_branch";
        sql += " where access_token =? limit 1";
        var values = [accesstoken];
        let result = await ExecuteQ.Query(dbName, sql, values);
        if (result && result.length > 0) {
            return callback(null, result[0].id);
        } else {
            //   console.log("access token invalid in common function");
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }

    }
    catch (Err) {
        logger.debug("====checkforAuthorityofThisAdmin=Err!=", Err);
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "select id from supplier_admin";
    // sql += " where access_token =? limit 1";
    // var values = [accesstoken];
    // multiConnection[dbName].query(sql, values, function (err, result) {

    //     if (result.length > 0) {

    //         return callback(null, result[0].id);

    //     } else {
    //      //   console.log("access token invalid in common function");
    //         var data = {};
    //         sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
    //     }
    // });

}





























































/*
 * ------------------------------------------------------
 * function to check the authorities of the supplier
 * Input:supplier id, section id
 * Output: Success Message or Error
 * ------------------------------------------------------
 */
exports.checkforAuthorityofThisSupplier = async function (dbName, id, sectionId, res, cb) {
    console.log("Inside authority check fn");
    try {
        var sql = "SELECT `is_superadmin`,`is_active` FROM supplier_admin where id=? limit 1 "
        let result = await ExecuteQ.Query(dbName, sql, [id]);
        if (result.length) {
            if (result[0].is_active == 1) {

                if (result[0].is_superadmin == 1) {
                    return cb(null);
                }
                else {
                    var sql = "select id from supplier_authority where supplier_section_id=? && supplier_admin_id=? limit 1"
                    let checkAuthority = await ExecuteQ.Query(dbName, sql, [sectionId, id]);
                    if (checkAuthority.length) {
                        return cb(null);
                    }
                    else {
                        sendResponse.invalidAccessTokenError(res);
                    }

                }


            }
            else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
            }
        } else {
            var sql = "SELECT `is_superadmin`,`is_live` FROM supplier_branch where id=? limit 1 "
            let result = await ExecuteQ.Query(dbName, sql, [id]);
            if (result.length) {

                if (result[0].is_live == 1) {

                    // if (result[0].is_superadmin == 1) {
                    //     return cb(null);
                    // }
                    // else {
                    //     var sql = "select id from supplier_authority where supplier_section_id=? && supplier_admin_id=? limit 1"
                    //     multiConnection[dbName].query(sql, [sectionId, id], function (err, checkAuthority) {
                    //         if (err) {
                    //             sendResponse.somethingWentWrongError(res);
                    //         }
                    //         else {
                    //          //   console.log(checkAuthority)
                    //             if (checkAuthority.length) {
                    //                 return cb(null);
                    //             }
                    //             else {
                    //                 sendResponse.invalidAccessTokenError(res);
                    //             }
                    //         }

                    //     })
                    // }
                    return cb(null);

                }
                else {
                    var data = {};
                    sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
                }
            } else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
            }
            // multiConnection[dbName].query(sql, [id], function (err, result) {
            //     if(result.length){

            //         if (result[0].is_live == 1) {

            //             // if (result[0].is_superadmin == 1) {
            //             //     return cb(null);
            //             // }
            //             // else {
            //             //     var sql = "select id from supplier_authority where supplier_section_id=? && supplier_admin_id=? limit 1"
            //             //     multiConnection[dbName].query(sql, [sectionId, id], function (err, checkAuthority) {
            //             //         if (err) {
            //             //             sendResponse.somethingWentWrongError(res);
            //             //         }
            //             //         else {
            //             //          //   console.log(checkAuthority)
            //             //             if (checkAuthority.length) {
            //             //                 return cb(null);
            //             //             }
            //             //             else {
            //             //                 sendResponse.invalidAccessTokenError(res);
            //             //             }
            //             //         }

            //             //     })
            //             // }
            //             return cb(null);

            //         }
            //         else {
            //             var data = {};
            //             sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
            //         }
            //     }else{
            //         var data = {};
            //         sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
            //     }
            // })
        }
    }
    catch (Err) {
        sendResponse.somethingWentWrongError(res);
    }
    var sql = "SELECT `is_superadmin`,`is_active` FROM supplier_admin where id=? limit 1 "
    multiConnection[dbName].query(sql, [id], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (result.length) {
                if (result[0].is_active == 1) {

                    if (result[0].is_superadmin == 1) {
                        return cb(null);
                    }
                    else {
                        var sql = "select id from supplier_authority where supplier_section_id=? && supplier_admin_id=? limit 1"
                        multiConnection[dbName].query(sql, [sectionId, id], function (err, checkAuthority) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                //   console.log(checkAuthority)
                                if (checkAuthority.length) {
                                    return cb(null);
                                }
                                else {
                                    sendResponse.invalidAccessTokenError(res);
                                }
                            }

                        })
                    }


                }
                else {
                    var data = {};
                    sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
                }
            } else {
                var sql = "SELECT `is_superadmin`,`is_live` FROM supplier_branch where id=? limit 1 "
                multiConnection[dbName].query(sql, [id], function (err, result) {
                    if (result.length) {

                        if (result[0].is_live == 1) {

                            // if (result[0].is_superadmin == 1) {
                            //     return cb(null);
                            // }
                            // else {
                            //     var sql = "select id from supplier_authority where supplier_section_id=? && supplier_admin_id=? limit 1"
                            //     multiConnection[dbName].query(sql, [sectionId, id], function (err, checkAuthority) {
                            //         if (err) {
                            //             sendResponse.somethingWentWrongError(res);
                            //         }
                            //         else {
                            //          //   console.log(checkAuthority)
                            //             if (checkAuthority.length) {
                            //                 return cb(null);
                            //             }
                            //             else {
                            //                 sendResponse.invalidAccessTokenError(res);
                            //             }
                            //         }

                            //     })
                            // }
                            return cb(null);

                        }
                        else {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
                        }
                    } else {
                        var data = {};
                        sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
                    }
                })
            }


        }

    })

}















exports.getAllRegisteredAdmins = function (db_name, res, id, callCheck, callback) {
    // var sql = "select id,email,is_active from admin where is_superadmin = ? and id != ? ";
    var sql = "select id,email,is_active from admin where id != ? ";
    multiConnection[db_name].query(sql, [id], function (err, reply) {
        if (err) {
            console.log("err" + err);
            sendResponse.somethingWentWrongError(res)
        } else {
            if (reply.length) {
                //     console.log("============all admins=============" + JSON.stringify(reply));
                callback(null, reply);
            } else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.NO_ADMIN_FOUND, res, constant.responseStatus.SUCCESS);
            }
        }
    })
}


exports.insertFailure = function (db_name, res, cb, clientIp, adminId, country, city, message, status) {
    var date = new Date();
    var date1 = date.toISOString().split("T");
    var todayDate = date1[0];
    var sql1 = "insert into admin_login(ip,admin_id,login_date,login_status,country,city,status) values(?,?,?,?,?,?,?)";
    multiConnection[db_name].query(sql1, [clientIp, adminId, todayDate, message, country, city, status], function (error, reply) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            cb(null);
        }

    })
}


exports.getOnlyDate = function (callback) {
    var date = new Date().toISOString().split("T");
    callback(null, date);
}


/*
 * ------------------------------------------------------
 * Insert all the admin logs(actions performed by him on admin dashboard)
 * Input: admin id,action text, url
 * Output: success/error
 * ------------------------------------------------------
 */
exports.insertAdminActions = function (db_name, res, callback, id, text, url) {
    var sql = "insert into admin_logs(admin_id,action_text,url) values(?,?,?)"
    multiConnection[db_name].query(sql, [id, text, url], function (err, result) {
        console.log(err);
        callback(null);
    })


}

// if(process.env.NODE_ENV=="nutanix"){
// }
//                 else{
//                 fs.readFile(path,function(error, file_buffer) {
//                     if(error){
//                         console.log("================s3============error==" + error);
//                         sendResponse.somethingWentWrongError(res);
//                     }else{
//                         AWS.config.update({
//                             accessKeyId: config.get('s3BucketCredentials.accessKeyId'),
//                             secretAccessKey: config.get('s3BucketCredentials.secretAccessKey')
//                         });
//                         var s3bucket = new AWS.S3();
//                         var params = {
//                             Bucket: config.get('s3BucketCredentials.bucket'),
//                             Key: filename,
//                             Body: file_buffer,
//                             ACL: 'public-read',
//                             ContentType: mimeType
//                         };
//                         s3bucket.putObject(params, function (err, data) {
//                             fs.unlink(path, function (err, result1) {
//                             });
//                             console.log("final....")
//                             if (err) {
//                                 console.log("================s3============error==" + err);
//                                 sendResponse.somethingWentWrongError(res);
//                             } else {
//                                 return callback(null, s3Url + filename);
//                             }
//                         });
//                     }
//                 });
// }
/**
 * Upload file to S3 bucket
 * @param file
 * @param folder
 * @param callback
 */

exports.uploadImageFileToS3Bucket = function (res, file, folder, callback) {
    var fs = require('fs');
    var AWS = require('aws-sdk');
    var filename = file.name; // actual filename of file
    var path = file.path; //will be put into a temp directory
    var mimeType = file.type;
    var s3Url = config.get('s3BucketCredentials.s3URL') + '/';
    var randomStrings, dimensions, stored_path;
    async.waterfall([
        function (cb) {
            func.generateRandomString(cb);
        },
        function (randomString, cb) {
            console.log("here");
            console.log("path*************file******************dimensions", path, file, dimensions);
            // var randomString = randomStrings;
            var fname = filename.trim().split(".");
            filename = fname[0].replace(/ /g, '') + randomString + "." + fname[1];
            stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
            logger.debug("====STORED_PATH====", stored_path, config.get("server.protocol") + config.get("server.ip") + ":" + config.get("server.uploadFolder") + "/" + filename);

            // thumbnailpath=
            saveFile(path, stored_path, (err, data) => {
                cb(null);
            })
        },
        function (cb) {
            let sizeOf = require('probe-image-size');
            logger.debug("==", config.get("server.protocol") + config.get("server.ip") + "/" + config.get("server.uploadFolder") + "/" + filename)
            sizeOf(config.get("server.protocol") + config.get("server.ip") + "/" + config.get("server.uploadFolder") + "/" + filename, function (err, dimen) {
                logger.debug("=====Err", err)
                dimensions = dimen;
                logger.debug("=====Err", err, dimensions)
                cb(null);
            });
        },
        function (cb) {

            createThumbnailImage(dimensions, `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`, `${Path.resolve(".")}${config.get("server.publicFolder")}${"thumb_" + filename}`, (err, data) => {
                return callback(null, config.get("server.protocol") + config.get("server.ip") + "/" + config.get("server.uploadFolder") + "/" + filename);
            })
        }
    ], function (error1, response1) {

    })

};

function createThumbnailImage(dimensions, originalPath, thumbnailPath, callback) {
    const ratio = dimensions.width / dimensions.height;
    logger.debug("========filename===originalPath, thumbnailPath========", ratio, dimensions, originalPath, thumbnailPath);
    var gm = require('gm').subClass({ imageMagick: true });
    gm(originalPath)
        .resize(dimensions.width * ratio * .15, dimensions.height * ratio * .15, "!")
        .autoOrient()
        .write(thumbnailPath, function (err, data) {
            callback(err, data)
        })
}

// exports.uploadImageFileToS3BucketSupplier = function (res, file, folder, callback) {
//     var fs = require('fs');
//     var AWS = require('aws-sdk');
//     var filename = file.name; // actual filename of file
//     var path = file.path; //will be put into a temp directory
//     var mimeType = file.type;
//     var s3Url = config.get('s3BucketCredentials.s3URL') + '/';
//     var randomStrings,originalpath;
//     console.log("....dgfsd? second");
//     var randomStrings;
//     // console.log("uploadImageFileToS3Bucket....................")
//     // console.log(file.name)
//     // console.log(file.path)
//     // console.log(folder)

//     async.waterfall([
//         function (cb) {
//             // console.log("here==========================")
//             func.generateRandomString(cb);
//         },
//         function(randomString,cb){
//             console.log("....random...",randomString);
//             randomStrings = randomString;
//             let sizeOf = require('image-size');
//             sizeOf(path, function (err, dimen) {              
//                 dimensions=dimen;
//                 cb(null,{});     
//             });                  
//         },
//         function (randomString,cb) {
//             console.log("here")
//             console.log("path*******************************",path);
//           //  var randomString = randomStrings;
//             var fname = filename.split(".");
//             filename = fname[0].replace(/ /g, '') + randomStrings + "." + fname[1];
//             let stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
//             logger.debug("====STORED_PATH====5",config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);

//             saveFile(path, stored_path,(err, data) => {
//                 cb(null,{});
//             })     
//             },
//            function(original_url,cb){            
//             createThumbnailImage(dimensions,`${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`,`${Path.resolve(".")}${config.get("server.publicFolder")}${"thumb_"+filename}`,(err, data) => {
//                     return callback(null,config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);
//                 })
//        }
//     ], function (error1, response1) {

//     })

// };

exports.uploadImageFileToS3BucketSupplier = function (res, file, folder, callback) {
    var fs = require('fs');
    var AWS = require('aws-sdk');
    var filename = file.name; // actual filename of file
    var path = file.path; //will be put into a temp directory
    var mimeType = file.type;
    var s3Url = config.get('s3BucketCredentials.s3URL') + '/';
    var randomStrings, originalpath;
    console.log("....dgfsd? second");
    var randomStrings;
    // console.log("uploadImageFileToS3Bucket....................")
    // console.log(file.name)
    // console.log(file.path)
    // console.log(folder)

    async.waterfall([
        function (cb) {
            // console.log("here==========================")
            func.generateRandomString(cb);
        },
        function (randomString, cb) {
            console.log("....random...", randomString);
            randomStrings = randomString;
            let sizeOf = require('image-size');
            sizeOf(path, function (err, dimen) {
                dimensions = dimen;
                cb(null, {});
            });
        },
        function (randomString, cb) {
            console.log("here")
            console.log("path*******************************", path);
            //  var randomString = randomStrings;
            var fname = filename.split(".");
            filename = fname[0].replace(/ /g, '') + randomStrings + "." + fname[1];
            let stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
            logger.debug("====STORED_PATH====5", config.get("server.protocol") + config.get("server.ip") + "/" + config.get("server.uploadFolder") + "/" + filename);

            saveFile(path, stored_path, (err, data) => {
                cb(null, {});
            })
        },
        function (original_url, cb) {
            createThumbnailImage(dimensions, `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`, `${Path.resolve(".")}${config.get("server.publicFolder")}${"thumb_" + filename}`, (err, data) => {
                return callback(null, config.get("server.protocol") + config.get("server.ip") + "/" + config.get("server.uploadFolder") + "/" + filename);
            })
        }
    ], function (error1, response1) {

    })

};


exports.uploadMultipleFiles = (filesArray, objectId, filetype, callback) => {
    let dataToUpload = [],
        imageURLs = [];
    async.eachSeries(filesArray, function iteratee(fileData, cb) {
        let imageURL = {
            original: null,
            thumbnail: null
        },
            originalPath = null,
            thumbnailPath = null;
        async.series([
            cb1 => {
                imageURL.original = UniversalFunctions.getFileNameWithUserIdWithCustomPrefix(false, fileData.filename, filetype, objectId);
                imageURL.thumbnail = UniversalFunctions.getFileNameWithUserIdWithCustomPrefix(true, fileData.filename, filetype, objectId);
                cb1();
            },
            cb1 => {
                let path = `${Path.resolve(".")}/uploads/${imageURL.original}`;
                saveFile(fileData.path, path, (err, data) => {
                    cb1(err, data)
                })
            },
            cb1 => {
                originalPath = `${Path.resolve(".")}/uploads/${imageURL.original}`;
                dataToUpload.push({
                    originalPath: originalPath,
                    nameToSave: imageURL.original
                });
                thumbnailPath = `${Path.resolve(".")}/uploads/${imageURL.thumbnail}`;
                let dimensions;
                let sizeOf = require('image-size');
                sizeOf(thumbnailPath, function (err, dimen) {
                    logger.debug("=====", dimen)
                    dimensions = dimen;
                    // cb(null,{});     
                    logger.debug("=========dimensions=====", dimensions)
                    createThumbnailImage(dimensions, originalPath, thumbnailPath, (err, data) => {
                        dataToUpload.push({
                            originalPath: thumbnailPath,
                            nameToSave: imageURL.thumbnail
                        });
                        cb1(err, data)
                    })
                });
            }
        ], (error, response) => {
            if (error) {
                return callback(error)
            } else {
                imageURLs.push(imageURL);
                cb()
            }
        })


    }, function done() {
        parallelUploadTOS3(dataToUpload, callback(null, imageURLs));
    });
};

function parallelUploadTOS3(filesArray, callback) {
    logger.debug("===filesArray==", filesArray)
    //Create S3 Client
    const client = knox.createClient({
        key: config.get('s3BucketCredentials.accessKeyId'),
        secret: config.get('s3BucketCredentials.secretAccessKey'),
        bucket: config.get('s3BucketCredentials.secretAccessKey'),
        // region: CONSTANTS.awsS3Config.s3BucketCredentials.s3URL
    });
    var s3ClientOptions = { 'x-amz-acl': 'public-read' };
    // s3ClientOptions={};
    const taskToUploadInParallel = [];
    filesArray.forEach(fileData => {

        taskToUploadInParallel.push(((fileData => internalCB => {
            // console.log("===FILE==DATA==",fileData)
            if (!fileData.originalPath || !fileData.nameToSave) {
                internalCB(CONSTANTS.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            } else {
                client.putFile(fileData.originalPath, fileData.nameToSave, s3ClientOptions, (err, result) => {
                    console.log("====result==", err)
                    deleteFile(fileData.originalPath);
                    internalCB(err, result);
                })
            }
        }))(fileData))
    });
    async.parallel(taskToUploadInParallel, callback)
}



module.exports.generateRandomString = function (callback) {
    var generatedText = "";
    var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for (var i = 0; i < 6; i++) {
        generatedText += text.charAt(Math.floor((Math.random() * text.length)));
    }
    callback(null, generatedText);

}


module.exports.sendEmail = function (res, callback, inputArray) {

    // console.log(config.get('EmailCredentials.email'));

    var transporter = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: config.get('EmailCredentials.email'),
            pass: config.get('EmailCredentials.password')
        }
    })
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: config.get('EmailCredentials.email'), // sender address
        to: inputArray[0], // list of receivers
        subject: constant.responseMessage.SUPPLIER_REG, // Subject line
        // text:'your password is '+inputArray[1] , // plaintext body
        html: '<h1>your password is ?</h1>' + inputArray[1] // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
            callback
        } else {
            // console.log('Message sent: ' + JSON.stringify(info));
            callback(null);
        }

    });

}



module.exports.sendMailthroughSMTP = async function (smtpData, res, subject,
    receiversEmail, content, type, callback) {
    try {

        logger.debug("===========SMTP===>>", smtpData);
        // if(new_email_template_v10 && new_email_template_v10.length>0){
        //     content = new_content
        // }
        let secureCon = true;
        if (smtpData["smtp_secure"] !== undefined) {
            if (parseInt(smtpData["smtp_secure"]) == 0) {
                secureCon = false;
            }
        }
        logger.debug("=========secureCon = =========", secureCon);
        let options = {
            service: "mailgun",
            auth: {
                user: config.get('EmailCredentials.email'),
                pass: config.get('EmailCredentials.password')
            }
        }
        let objectLength = Object.entries(smtpData).length;
        var transporter;
        let from_email;
        if (objectLength > 0) {
            options.service = smtpData[config.get("smtp.smptp_service_key")]
            options.auth.user = smtpData[config.get("smtp.from_email_key")]
            options.auth.pass = smtpData[config.get("smtp.password_key")]
            var email_valid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            from_email = email_valid.test(options.auth.user) == true ? options.auth.user : smtpData["smtp_from_email"];
            from_email = smtpData["smtp_from_email"] != undefined && smtpData["smtp_from_email"] != "" ? smtpData["smtp_from_email"] : from_email
            if (smtpData.hasOwnProperty("smtp_host") && smtpData.hasOwnProperty("smtp_port")) {
                console.log("=====ENTING==>>", content)
                transporter = nodemailer.createTransport('SMTP', {
                    host: smtpData["smtp_host"],
                    port: parseInt(smtpData["smtp_port"]),
                    secureConnection: secureCon,
                    auth: {
                        user: smtpData[config.get("smtp.from_email_key")],
                        pass: smtpData[config.get("smtp.password_key")]
                    }
                });
            }
            else {
                console.log("=======>>", options)
                transporter = nodemailer.createTransport("SMTP",
                    options
                );
            }
        }
        else {
            console.log("=======>>", options)
            transporter = nodemailer.createTransport("SMTP",
                options
            );
            from_email = '"Royo" royo@mail.royoapps.com'
        }

        logger.debug("===from_email=", options, transporter, from_email)
        // console.log(reg.test("sd@f.com"))

        if (type == 0) {
            var mailOptions = {
                from: from_email, // sender address
                to: receiversEmail, // list of receivers
                subject: subject, // Subject line
                html: content  // plaintext body
            };
        }
        else {
            var mailOptions = {
                from: from_email, // sender address
                to: receiversEmail, // list of receivers
                subject: subject, // Subject line
                text: content // plaintext body
            };
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            console.log("-------err------info--------", error, info)
            if (error) {
                callback(null)
            } else {
                //    console.log('Message sent: ' + JSON.stringify(info));
                callback(null);
            }

        });
    }
    catch (Err) {
        callback(null)
    }
}

module.exports.sendMailthroughSMTPv2 = async function (req, id, smtpData, res, subject,
    receiversEmail, content, type, callback) {
    try {
        let date = moment().format("YYYY-MM-DD HH:mm:ss");
        logger.debug("===========SMTP===>>", smtpData);
        // if(new_email_template_v10 && new_email_template_v10.length>0){
        //     content = new_content
        // }
        let secureCon = true;
        if (smtpData["smtp_secure"] !== undefined) {
            if (parseInt(smtpData["smtp_secure"]) == 0) {
                secureCon = false;
            }
        }
        logger.debug("=========secureCon = =========", secureCon);
        let options = {
            service: "mailgun",
            auth: {
                user: config.get('EmailCredentials.email'),
                pass: config.get('EmailCredentials.password')
            }
        }
        let objectLength = Object.entries(smtpData).length;
        var transporter;
        let from_email;
        if (objectLength > 0) {
            options.service = smtpData[config.get("smtp.smptp_service_key")]
            options.auth.user = smtpData[config.get("smtp.from_email_key")]
            options.auth.pass = smtpData[config.get("smtp.password_key")]
            var email_valid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            from_email = email_valid.test(options.auth.user) == true ? options.auth.user : smtpData["smtp_from_email"];
            from_email = smtpData["smtp_from_email"] != undefined && smtpData["smtp_from_email"] != "" ? smtpData["smtp_from_email"] : from_email
            if (smtpData.hasOwnProperty("smtp_host") && smtpData.hasOwnProperty("smtp_port")) {
                logger.debug("=====ENTING==>>", content)
                transporter = nodemailer.createTransport('SMTP', {
                    host: smtpData["smtp_host"],
                    port: parseInt(smtpData["smtp_port"]),
                    secureConnection: secureCon,
                    auth: {
                        user: smtpData[config.get("smtp.from_email_key")],
                        pass: smtpData[config.get("smtp.password_key")]
                    }
                });
            }
            else {
                transporter = nodemailer.createTransport("SMTP",
                    options
                );
            }
        }
        else {
            logger.debug("=======>>", options)
            transporter = nodemailer.createTransport("SMTP",
                options
            );
            from_email = '"Royo" royo@mail.royoapps.com'
        }

        logger.debug("===from_email=", options, transporter, from_email)
        // console.log(reg.test("sd@f.com"))

        if (type == 0) {
            var mailOptions = {
                from: from_email, // sender address
                to: receiversEmail, // list of receivers
                subject: subject, // Subject line
                html: content  // plaintext body
            };
        }
        else {
            var mailOptions = {
                from: from_email, // sender address
                to: receiversEmail, // list of receivers
                subject: subject, // Subject line
                html: content // plaintext body
            };
        }
        // setup e-mail data with unicode symbols
        logger.debug("======Mail=Option1======", mailOptions)

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            logger.debug("-------err------info--------", error, info)
            if (error) {
                console.log("error in mail-----", error);
                callback(null)
            } else {
                let sql = "update admin set forgot_link=? where id= ?"
                ExecuteQ.Query(req.dbName, sql, [date, id]);
                //    console.log('Message sent: ' + JSON.stringify(info));
                callback(null);
            }

        });
    }
    catch (Err) {
        logger.debug("====sendMailthroughSMTP===>>", Err)
        callback(null)
    }
}




module.exports.sendMailthroughSMTPOnlyToBCC = async function (smtpData, res, subject,
    receiversEmail, content, type, callback) {
    try {
        console.log(type, "type.........")
        logger.debug("===========SMTP===>>", smtpData);
        // if(new_email_template_v10 && new_email_template_v10.length>0){
        //     content = new_content
        // }
        let secureCon = true;
        if (smtpData["smtp_secure"] !== undefined) {
            if (parseInt(smtpData["smtp_secure"]) == 0) {
                secureCon = false;
            }
        }
        logger.debug("=========secureCon = =========", secureCon);
        let options = {
            service: "mailgun",
            auth: {
                user: config.get('EmailCredentials.email'),
                pass: config.get('EmailCredentials.password')
            }
        }
        let objectLength = Object.entries(smtpData).length;
        var transporter;
        let from_email;
        if (objectLength > 0) {
            options.service = smtpData[config.get("smtp.smptp_service_key")]
            options.auth.user = smtpData[config.get("smtp.from_email_key")]
            options.auth.pass = smtpData[config.get("smtp.password_key")]
            var email_valid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            from_email = email_valid.test(options.auth.user) == true ? options.auth.user : smtpData["smtp_from_email"];
            from_email = smtpData["smtp_from_email"] != undefined && smtpData["smtp_from_email"] != "" ? smtpData["smtp_from_email"] : from_email
            if (smtpData.hasOwnProperty("smtp_host") && smtpData.hasOwnProperty("smtp_port")) {
                console.log("=====ENTING smtp==>>", content)
                transporter = nodemailer.createTransport('SMTP', {
                    host: smtpData["smtp_host"],
                    port: parseInt(smtpData["smtp_port"]),
                    secureConnection: secureCon,
                    auth: {
                        user: smtpData[config.get("smtp.from_email_key")],
                        pass: smtpData[config.get("smtp.password_key")]
                    }
                });
            }
            else {
                console.log("=======>>", options)
                transporter = nodemailer.createTransport("SMTP",
                    options
                );
            }
        }
        else {
            console.log("=======>>", options)
            transporter = nodemailer.createTransport("SMTP",
                options
            );
            from_email = '"Royo" royo@mail.royoapps.com'
        }

        console.log("===from_email=", options, transporter, from_email)
        // console.log(reg.test("sd@f.com"))

        if (type == 0) {
            var mailOptions = {
                from: from_email, // sender address
                bcc: receiversEmail, // list of receivers
                subject: subject, // Subject line
                html: content  // plaintext body
            };
        }
        else {
            var mailOptions = {
                from: from_email, // sender address
                bcc: receiversEmail, // list of receivers
                subject: subject, // Subject line
                text: content // plaintext body
            };
        }
        // setup e-mail data with unicode symbols
        console.log("======Mail=Option2======", mailOptions)

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            logger.debug("-------err------info--------", error, info)
            
            if (error) {
                console.log("check here the result$$$$$$$$$$$$$",error);
                callback(null)
            } else {
                console.log("check here the result$$$$$$$$$$$$$",info);
                callback(null);
            }

        });
    }
    catch (Err) {
        logger.debug("====sendMailthroughSMTP===>>", Err)
        callback(null)
    }
}


module.exports.sendMailthroughSMTPWithPromises =
    async function (smtpData,
        res,
        subject,
        receiversEmail,
        content,
        type) {
        return new Promise((resolve, reject) => {




            logger.debug("===========SMTP===>>", smtpData);
            // if(new_email_template_v10 && new_email_template_v10.length>0){
            //     content = new_content
            // }
            let secureCon = true;
            if (smtpData["smtp_secure"] !== undefined) {
                if (parseInt(smtpData["smtp_secure"]) == 0) {
                    secureCon = false;
                }
            }
            logger.debug("=========secureCon = =========", secureCon);
            let options = {
                service: "mailgun",
                auth: {
                    user: config.get('EmailCredentials.email'),
                    pass: config.get('EmailCredentials.password')
                }
            }
            let objectLength = Object.entries(smtpData).length;
            var transporter;
            let from_email;
            if (objectLength > 0) {
                options.service = smtpData[config.get("smtp.smptp_service_key")]
                options.auth.user = smtpData[config.get("smtp.from_email_key")]
                options.auth.pass = smtpData[config.get("smtp.password_key")]
                var email_valid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                from_email = email_valid.test(options.auth.user) == true ? options.auth.user : smtpData["smtp_from_email"];
                if (smtpData.hasOwnProperty("smtp_host") && smtpData.hasOwnProperty("smtp_port")) {
                    logger.debug("=====ENTING==>>", content)
                    transporter = nodemailer.createTransport('SMTP', {
                        host: smtpData["smtp_host"],
                        port: parseInt(smtpData["smtp_port"]),
                        secureConnection: secureCon,
                        auth: {
                            user: smtpData[config.get("smtp.from_email_key")],
                            pass: smtpData[config.get("smtp.password_key")]
                        }
                    });
                }
                else {
                    transporter = nodemailer.createTransport("SMTP",
                        options
                    );
                }
            }
            else {
                var transporter = nodemailer.createTransport("SMTP",
                    options
                );
                from_email = '"Royo" royo@mail.royoapps.com'
            }

            logger.debug("===from_email=", transporter, from_email)
            // console.log(reg.test("sd@f.com"))

            if (type == 0) {
                var mailOptions = {
                    from: from_email, // sender address
                    to: receiversEmail, // list of receivers
                    subject: subject, // Subject line
                    html: content  // plaintext body
                };
            }
            else {
                var mailOptions = {
                    from: from_email, // sender address
                    to: receiversEmail, // list of receivers
                    subject: subject, // Subject line
                    text: content // plaintext body
                };
            }
            // setup e-mail data with unicode symbols
            logger.debug("======Mail=Option3======", mailOptions)

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                logger.debug("-------err------info--------", error, info)
                if (error) {
                    logger.debug("err", error);
                    resolve()
                } else {
                    //    console.log('Message sent: ' + JSON.stringify(info));
                    resolve();
                }

            });

        })
    }

module.exports.checkAdminExists = async (id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select * from admin  where id = ?";
            let data = await ExecuteQ.Query(dbName, sql, [id])
            return resolve(data)
        }
        catch (Err) {
            console.log("======checkAdminExists====err", err);
            return reject(err)
        }
    })
}

module.exports.checkSupplierExists = async (id, dbName) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from supplier  where id = ?";
        //	logger.debug("==========connection", connection);
        let stmt = multiConnection[dbName].query(sql, id, function (err, data) {
            logger.debug("==============stmt.sql========user detauls===", stmt.sql)
            if (err) {
                console.log("==========err", err);
                return reject(err)
            }
            else {
                // logger.debug("================checkuserexist========",data)
                return resolve(data)
            }
        })
    })
}

module.exports.checkUserExists = async (id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select * from user  where id = ?";
            let data = await ExecuteQ.Query(dbName, sql, [id])
            return resolve(data)
        }
        catch (Err) {
            console.log("===checkUserExists==>>", Err)
            return reject(Err)
        }
    })
}

module.exports.checkAdminExistsByToken = async (id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select * from admin  where access_token = ?";
            let data = await ExecuteQ.Query(dbName, sql, [id])
            return resolve(data)
        }
        catch (Err) {
            logger.debug("==checkAdminExistsByToken=====>>", Err)
            return reject(Err)
        }
        // //	logger.debug("==========connection", connection);
        // let stmt = multiConnection[dbName].query(sql,id ,function(err,data){
        //     logger.debug("==============stmt.sql========user detauls===",stmt.sql)
        //     if(err){
        //         console.log("==========err", err);
        //         return reject(err)
        //     }
        //     else{
        //         // logger.debug("================checkuserexist========",data)
        //         return resolve(data)
        //     }
        // })
    })
}

module.exports.checkSupplierExistsByToken = async (id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select * from supplier  where access_token = ?";
            let data = await ExecuteQ.Query(dbName, sql, [id])
            return resolve(data)
        }
        catch (Err) {
            console.log("=====checkSupplierExistsByToken=====err", err);
            return reject(err)
        }
        //	logger.debug("==========connection", connection);
        // let stmt = multiConnection[dbName].query(sql,id ,function(err,data){
        //     logger.debug("==============stmt.sql========user detauls===",stmt.sql)
        //     if(err){
        //         console.log("==========err", err);
        //         return reject(err)
        //     }
        //     else{
        //         // logger.debug("================checkuserexist========",data)
        //         return resolve(data)
        //     }
        // })
    })
}
module.exports.checkUserExistsByToken = async (id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select * from user  where access_token = ?";
            let data = await ExecuteQ.Query(dbName, sql, [id])
            return resolve(data)
        }
        catch (Err) {
            logger.debug("=====checkUserExistsByToken===>>", Err)
            return reject(Err)
        }
        //	logger.debug("==========connection", connection);
        // let stmt = multiConnection[dbName].query(sql,id ,function(err,data){
        //     logger.debug("==============stmt.sql========user detauls===",stmt.sql)
        //     if(err){
        //         console.log("==========err", err);
        //         return reject(err)
        //     }
        //     else{
        //         // logger.debug("================checkuserexist========",data)
        //         return resolve(data)
        //     }
        // })
    })
}

/////////////////////		Current UTC 		/////////////////////////////////
module.exports.currentUTC = () => {
    return moment.utc().format("YYYY-MM-DD HH:mm:ss");
};

module.exports.updateSupplierAdminDetails = async (socket_id, type, updated_at, id, dbName) => {
    logger.debug("=====socket_id======", socket_id, updated_at, id);
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "UPDATE `supplier` SET `socket_id`= ?, `updated_at`=? WHERE id = ?";
            if (type == "4") {
                sql = "UPDATE `admin` SET `socket_id`= ?, `updated_at`=? WHERE id = ?";
            }
            let data = await ExecuteQ.Query(dbName, sql, [socket_id, updated_at, id])
            return resolve(data)
        }
        catch (Err) {
            console.log("==========err", err);
            return reject(err)
        }
    })


};


module.exports.updateUserDetails = async (socket_id, updated_at, id, dbName) => {
    logger.debug("=====socket_id======", socket_id, updated_at, id);
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "UPDATE `user` SET `socket_id`= ?, `updated_at`=? WHERE id = ?";
            let data = await ExecuteQ.Query(dbName, sql, [socket_id, updated_at, id])
            return resolve(data);
        }
        catch (Err) {
            logger.debug("===updateUserDetails=====", Err)
            return reject(err)
        }
    })


};


module.exports.getrecieverDetails = async (user_created_id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select * from user where  is_deleted=? and  user_created_id=? ";
            let data = await ExecuteQ.Query(dbName, sql, [0, user_created_id]);

            if (data && data.length > 0) {
                return resolve(data)
            } else {
                var sql1 = "select * from user where  is_deleted=? and id=?  ";
                let data1 = await ExecuteQ.Query(dbName, sql1, [0, user_created_id]);
                return resolve(data1)
            }

        }
        catch (Err) {
            logger.debug("===updateUserDetails=====", Err)
            return reject(err)
        }
    })
}


module.exports.getrecieverSupplierAdminDetails = async (user_created_id, type, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select * from supplier where (user_created_id =? or id=?)  and is_deleted=?  ";
            if (type == "4") {
                sql = "select * from admin where (user_created_id =? or id=?) ";
            }
            let data = await ExecuteQ.Query(dbName, sql, [user_created_id, user_created_id, 0])
            return resolve(data)
        }
        catch (Err) {
            logger.debug("====getrecieverSupplierAdminDetails=Err=>>", Err)
            return reject(Err)
        }

    })
}
module.exports.getrecieverSuperAdminDetails = async (dbName, receiver_created_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            sql = "select * from admin where user_created_id =?";
            let data = await ExecuteQ.Query(dbName, sql, [receiver_created_id]);
            return resolve(data);
        }
        catch (Err) {
            logger.debug("====getrecieverSuperAdminDetails==Err=>>", Err)
            return reject(Err)
        }
    })
}

module.exports.getrecieverSuperAdminDetailsV1 = async (dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = "select * from admin where is_superadmin=?";
            let data = await ExecuteQ.Query(dbName, sql, [1]);
            return resolve(data);
        }
        catch (Err) {
            logger.debug("====getrecieverSuperAdminDetails==Err=>>", Err)
            return reject(Err)
        }
    })
}


module.exports.getrecieverSocketDetails = async (id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select * from user where id =?  and is_deleted=?  ";
            let data = await ExecuteQ.Query(dbName, sql, [id, 0])
            return resolve(data[0].socket_id)
        }
        catch (Err) {
            logger.debug("===getrecieverSocketDetails==Err=>>", Err)
            return reject(Err)
        }

    })
}


module.exports.getUserorderDetails = async (order_id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "select status from orders where id= ?";
            let data = await ExecuteQ.Query(dbName, sql, [order_id]);
            return resolve(data)
        }
        catch (Err) {
            logger.debug("===getUserorderDetails===>>", Err)
            return reject(Err)
        }
    })

};


module.exports.insertMsgText = async (dbName, send_to, send_by, text, image_url, sent_at, original, thumbnail, chat_type, order_id, message_id, send_by_type, send_to_type) => {

    return new Promise(async (resolve, reject) => {
        try {
            var sql = "insert into chats(send_to, send_by, text,image_url, sent_at, original, thumbnail, chat_type, order_id,message_id,send_by_type,send_to_type) values(?,?,?,?,?,?,?,?,?,?,?,?)"
            let data = await ExecuteQ.Query(dbName, sql, [send_to, send_by, text, image_url, sent_at, original, thumbnail, chat_type, order_id, message_id, send_by_type, send_to_type])
            return resolve(data)
        }
        catch (Err) {
            logger.debug("===Err==>>", Err)
            return reject(Err)
        }

    })
}


module.exports.checkPrevConversationsExists = async (dbName, send_to, send_by) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "SELECT `message_id`, `c_id`, `send_to`, `send_by`, `text`, `sent_at`, `send_to_deleted`, `send_by_deleted`, `original`, `thumbnail`, `chat_type` FROM `conversations` AS `conversations` WHERE ((`conversations`.`send_to` = ? AND `conversations`.`send_by` = ?) OR (`conversations`.`send_by` = ? AND `conversations`.`send_to` = ?))";
            let data = await ExecuteQ.Query(dbName, sql, [send_to, send_by, send_to, send_by])
            return resolve(data)
        }
        catch (Err) {
            logger.debug("===checkPrevConversationsExists===>>", Err)
            return reject(Err)
        }

    })
}

module.exports.insertlastMsgText = async (dbName, c_id, send_to, send_by, text, sent_at, original, thumbnail, chat_type, order_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "insert into conversations(c_id,send_to, send_by, text, sent_at, original, thumbnail, chat_type, order_id) values(?,?,?,?,?,?,?,?,?)"
            let data = await ExecuteQ.Query(dbName, sql, [c_id, send_to, send_by, text, sent_at, original, thumbnail, chat_type, order_id])
            return resolve(data)
        }
        catch (Err) {
            logger.debug("===insertlastMsgText==Err=>>", Err)
            return reject(Err)
        }
    })

};


module.exports.updatelastMsgText = async (dbName, c_id, send_to, send_by, text, sent_at, original, thumbnail, chat_type, order_id) => {
    logger.debug("=============order=============", c_id, send_to, send_by, text, sent_at, original, thumbnail, chat_type, order_id)
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "UPDATE `conversations` SET `c_id`= ?,`send_to`= ?,`send_by`= ?,`text`= ?,`sent_at`= ? ,`original`= ?,`thumbnail`=?, `chat_type`= ?, `order_id`=? WHERE ((`send_to` = ? AND `send_by` = ?) OR (`send_by` = ? AND `send_to` = ?))";
            let data = await ExecuteQ.Query(dbName, sql, [c_id, send_to, send_by, text, original, thumbnail, sent_at, chat_type, order_id, send_to, send_by, send_to, send_by])
            return resolve(data)
        }
        catch (Err) {
            logger.debug("=====updatelastMsgText==Err=>>", Err)
            return reject(Err)
        }
    })


};


module.exports.updateChatText = async (message_id, c_id, dbName) => {
    return new Promise(async (resolve, reject) => {
        try {
            var sql = "UPDATE `chats` SET `message_id`= ?  WHERE  c_id = ?";
            let data = await ExecuteQ.Query(dbName, sql, [message_id, c_id])
            return resolve(data)
        }
        catch (Err) {
            logger.debug("======updateChatText====Err", Err)
            return reject(Err)
        }

    })
};

module.exports.sendEmailToUser = (smtpData, subject, receiversEmail, content) => {
    logger.debug("===========SMTP===>>", smtpData);
    let options = {
        service: "mailgun",
        auth: {
            user: config.get('EmailCredentials.email'),
            pass: config.get('EmailCredentials.password')
        }
    }
    let objectLength = Object.entries(smtpData).length;
    logger.debug("=========objectLength==on", objectLength)
    if (objectLength > 0) {
        logger.debug("======ENTE")
        options.service = smtpData[config.get("smtp.smptp_service_key")]
        options.auth.user = smtpData[config.get("smtp.from_email_key")]
        options.auth.pass = smtpData[config.get("smtp.password_key")]
        if (smtpData.hasOwnProperty("smtp_host") && smtpData.hasOwnProperty("smtp_port")) {
            var transporter = nodemailer.createTransport('SMTP', {
                host: smtpData["smtp_host"],
                port: parseInt(smtpData["smtp_host"]),
                auth: {
                    user: smtpData[config.get("smtp.from_email_key")],
                    pass: smtpData[config.get("smtp.password_key")]
                }
            });
        }
        else {
            var transporter = nodemailer.createTransport("SMTP",
                options
            );
        }
    }
    else {
        logger.debug("=========OPTION==DATA!==", options)
        var transporter = nodemailer.createTransport("SMTP",
            options
        );
    }

    var mailOptions = {
        from: options.auth.user, // sender address
        to: receiversEmail, // list of receivers
        subject: subject, // Subject line
        text: content // plaintext body
    };

    // setup e-mail data with unicode symbols
    logger.debug("======Mail=Option4======", mailOptions)
    return new Promise((resolve, reject) => {
        // send mail with defined transport object  
        transporter.sendMail(mailOptions, function (error, info) {
            logger.debug("==email=sendingn==err==>", error, info);
            resolve();
        });
    })

}
module.exports.sendEmailToUserByTemplate = (smtpData, subject, receiversEmail, content) => {
    logger.debug("===========SMTP===>>", smtpData);
    let options = {
        service: "mailgun",
        auth: {
            user: config.get('EmailCredentials.email'),
            pass: config.get('EmailCredentials.password')
        }
    }
    let objectLength = Object.entries(smtpData).length;
    logger.debug("=========objectLength==on", objectLength)
    if (objectLength > 0) {
        // logger.debug("======ENTE")
        options.service = smtpData[config.get("smtp.smptp_service_key")]
        options.auth.user = smtpData[config.get("smtp.from_email_key")]
        options.auth.pass = smtpData[config.get("smtp.password_key")]
        if (smtpData.hasOwnProperty("smtp_host") && smtpData.hasOwnProperty("smtp_port")) {
            var transporter = nodemailer.createTransport('SMTP', {
                host: smtpData["smtp_host"],
                port: parseInt(smtpData["smtp_host"]),
                auth: {
                    user: smtpData[config.get("smtp.from_email_key")],
                    pass: smtpData[config.get("smtp.password_key")]
                }
            });
        }
        else {
            var transporter = nodemailer.createTransport("SMTP",
                options
            );
        }
    }
    else {
        logger.debug("=========OPTION==DATA!==", options)
        var transporter = nodemailer.createTransport("SMTP",
            options
        );
    }
    var mailOptions = {
        from: options.auth.user, // sender address
        to: receiversEmail, // list of receivers
        subject: subject, // Subject line
        html: content
    };

    // setup e-mail data with unicode symbols
    logger.debug("======Mail=Option5======", mailOptions)
    return new Promise((resolve, reject) => {
        // send mail with defined transport object  
        transporter.sendMail(mailOptions, function (error, info) {
            logger.debug("==email=sendingn==err==>", error, info);
        });
        resolve();
    })

}
/*
 * ------------------------------------------------------
 * Authenticate a data gathering admin through Access token and return id
 * Input:Access token
 * Output: Admin_id Or Json error
 * ------------------------------------------------------
 */
exports.authenticateDataGatheringAccessToken = function (dbName, accesstoken, res, callback) {

    var sql = "select id from data_gathering_admin";
    sql += " where access_token =? limit 1";
    var values = [accesstoken];
    multiConnection[dbName].query(sql, values, function (err, result) {

        if (result.length > 0) {
            return callback(null, result[0].id);

        } else {
            console.log("access token invalid in common function");
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }
    });

}

exports.uploadMultipleFilesToS3Bucket = function (bufs, file, count, res, callback) {
    var fs = require('fs');
    var AWS = require('aws-sdk');
    var fileUrls = []
    for (var i = 0; i < count; i++) {
        (function (i) {
            var x = func.generateString();
            var filename = file[i].name; // actual filename of file
            var path = file[i].path; //will be put into a temp directory
            var mimeType = file[i].type;
            var s3Url = config.get('s3BucketCredentials.s3URL') + '/';
            var fname = filename.split(".");
            filename = fname[0].replace(/ /g, '') + x + "." + fname[1];


            AWS.config.update({
                accessKeyId: config.get('s3BucketCredentials.accessKeyId'),
                secretAccessKey: config.get('s3BucketCredentials.secretAccessKey')
            });
            var s3bucket = new AWS.S3();
            var params = {
                Bucket: config.get('s3BucketCredentials.bucket'),
                Key: filename,
                Body: bufs[0],
                ACL: 'public-read',
                ContentType: mimeType
            };

            s3bucket.putObject(params, function (err, data) {
                console.log("Uploading image...........................", err, data, null);

                fs.unlink(path, function (err, result1) {
                });
                fileUrls.push(s3Url + filename);
                if (i == count - 1) {
                    console.log(fileUrls);
                    callback(null, fileUrls);
                }
            });

        }(i))
    }

}

module.exports.generateString = function () {
    var generatedText = ""
    var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

    for (var i = 0; i < 9; i++) {
        generatedText += text.charAt(Math.floor((Math.random() * text.length)));
    }
    return generatedText;

}

exports.supplierRegOrNotByEmailAndPass = function (res, callback, email, pass, status, flag) {
    console.log("from supplier adminRegOrNotByEmailAndPass", email);
    var TABLE = ' ';
    if (flag == 1) {
        TABLE = ' supplier ';
    }
    else {
        TABLE = ' supplier_branch ';
    }
    var sql = "select id,password from " + TABLE + " where email = ?  limit 1 ";
    multiConnection[dbName].query(sql, [email], function (err, userResponse) {

        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            console.log("user Response", userResponse);
            if (userResponse.length) {
                console.log(' user password from data===', userResponse[0].password);
                console.log(' pass===', pass);
                if (pass == userResponse[0].password) {
                    callback(null, userResponse[0].id);
                } else {
                    var data = {};
                    sendResponse.sendSuccessData(data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
                }

            } else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.INCORRECT_CREDENTIALS, res, constant.responseStatus.SOME_ERROR);
            }
        }


    });
}

exports.getAllSectionIdsSupplier = function (res, supplierId, callback) {
    var sql = "select supplier_section_id from supplier_authority where supplier_admin_id = ?";
    multiConnection[dbName].query(sql, [supplierId], function (err, userResponse) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            if (userResponse.length) {
                var limit = userResponse.length;
                var sectionIds = [];
                for (var i = 0; i < limit; i++) {
                    (function (i) {
                        sectionIds.push(userResponse[i].supplier_section_id);
                        if (i == limit - 1) {
                            callback(null, sectionIds);
                        }
                    }(i));
                }
            } else {
                callback(null, []);
            }
        }


    });
}

exports.updateSupplierAccessToken = async function (dbName, fcmToken, res, cb, supplierId,
    email, status, flag, supplierBranchId) {
    try {

        let query = "select `key`, value from tbl_setting where `key`=? and value='1'";

        let supplierLoginCheck = await ExecuteQ.Query(dbName, query, ["supplier_multiple_login"]);

        if (supplierLoginCheck && supplierLoginCheck.length > 0) {

            accessToken = func.encrypt(email);
            logger.debug("============logincheck=======1==", accessToken)
        } else {

            accessToken = func.encrypt(email + new Date());
            logger.debug("============logincheck=======2==", accessToken)

        }

        if (flag == 1) {

            var sql = "update supplier_admin sa join supplier s on s.id = sa.supplier_id " +
                " SET sa.access_token = ?,s.access_token = ?,s.device_token=? where s.id = ? and sa.is_superadmin = 1 ";
            await ExecuteQ.Query(dbName, sql, [accessToken, accessToken, fcmToken, supplierId])
            console.log('==calling callback==');
            cb(null, accessToken);
        }
        else {
            var sql = "update supplier_branch set access_token = ? where id=? limit 1";
            await ExecuteQ.Query(dbName, sql, [accessToken, supplierBranchId])
            console.log('==calling callback==');
            cb(null, accessToken);
        }

    }
    catch (Err) {
        logger.debug("==Err!==", Err)
        sendResponse.somethingWentWrongError(res);
    }
}
/**
 * @description used for listin an side bar section ids
 */
exports.getAllSupplierSectionIds = async function (dbName, res, supplierId, callback) {
    try {
        console.log("kbhfasvjfd", supplierId)
        var sql = "select supplier_section_id from supplier_authority where supplier_admin_id = ?";
        let userResponse = await ExecuteQ.Query(dbName, sql, [supplierId]);
        // multiConnection[dbName].query(sql, [supplierId], function(err, userResponse) {

        //     if (err) {
        //         sendResponse.somethingWentWrongError(res);
        //     } else {
        //console.log('userResonse===',userResponse);
        if (userResponse.length) {
            var limit = userResponse.length;
            var sectionIds = [];
            for (var i = 0; i < limit; i++) {
                (function (i) {
                    sectionIds.push(userResponse[i].supplier_section_id);
                    if (i == limit - 1) {
                        callback(null, sectionIds);
                    }
                }(i));
            }
        } else {
            callback(null, []);
        }
        //     }


        // });
    }
    catch (Err) {
        logger.debug("=== sendResponse.somethingWentWrongError(res)");
        sendResponse.somethingWentWrongError(res);
    }
}

// exports.authenticateSupplierAccessToken = function(dbName,accessToken, res, callback,flag)
// {
//     console.log("..fll..",flag,accessToken);
//     var q;
//     if(flag==1)
//     {
//         console.log("...if,..")
//         q = ' select id from supplier_admin where access_token = ? ';

//     }
//     else
//     {
//         q = ' select id from supplier_branch where access_token = ? ';
//     }

//     multiConnection[dbName].query(q, [accessToken], function(err, result) {
//         console.log("....er....",err,result);
//         if (result.length) {
//             return callback(null, result[0].id);
//         } else {
//           //  console.log("access token invalid in common function");
//             var data = {};
//             sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
//         }
//     });


// }
exports.authenticateSupplierAccessToken = async function (dbName, accessToken, res, callback, flag) {
    try {
        logger.debug("========Enteing==>>")
        let supplierAdminQ, supplierQ;
        supplierAdminQ = ' select id from supplier_admin where access_token = ? ';
        supplierQ = ' select id from supplier_branch where access_token = ? ';
        let sAdminResult = await ExecuteQ.Query(dbName, supplierAdminQ, [accessToken]);
        let sResult = await ExecuteQ.Query(dbName, supplierQ, [accessToken]);
        if (sAdminResult && sAdminResult.length > 0) {
            return callback(null, sAdminResult[0].id);
        }
        else if (sResult && sResult.length > 0) {
            return callback(null, sResult[0].id);
        }
        else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);

        }
    } catch (Err) {
        logger.debug("===Auth=Err!=", Err)
        var data = {};
        sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);

    }
    // multiConnection[dbName].query(q, [accessToken], function (err, result) {
    //     // console.log("....er....", err, result);
    //     if (result.length) {
    //         return callback(null, result[0].id);
    //     } else {
    //         q = ' select id from supplier_branch where access_token = ? ';
    //         multiConnection[dbName].query(q, [accessToken], function (err, result) {
    //             if (result.length) {
    //                 return callback(null, result[0].id);
    //             } else {
    //                 //  console.log("access token invalid in common function");
    //                 var data = {};
    //                 sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);

    //             }
    //         });
    //     }
    // });
}

function saveFile(fileData, path, callback) {
    logger.debug("===FILE=DATA!==")
    fsExtra.copy(fileData, path, err => {
        logger.debug("Errrr===", err)
        if (err) return callback(err)
        callback(null)
    });
}

exports.sort_by = function (field, reverse, primer) {

    var key = primer ?
        function (x) { return primer(x[field]) } :
        function (x) { return x[field] };

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}
// module.exports={
//     sendEmailToUser:sendEmailToUser
// }

const getSettingData = (dbName, key) => {
    let keyArray = [];
    if (Array.isArray(key)) {
        keyArray = key;
    } else {
        keyArray = [key];
    }

    return new Promise(async (resolve, reject) => {
        try {
            let data = await ExecuteQ.Query(dbName, "select * from tbl_setting WHERE `key` IN (?);", [keyArray])
            resolve(data)
        }
        catch (Err) {
            logger.debug(Err)
            reject([])
        }
        // multiConnection[dbName].query("select * from tbl_setting WHERE `key` IN (?);",[keyArray],(err,data)=>{
        //        if(err){
        //            reject([])
        //        }
        //        else{
        //            resolve(data)
        //        }
        //    })
    })
};

exports.getSettingData = getSettingData;




exports.getSettingDataKeyAndValue = async (dbName, key) => {

    const settingDataKeys = await getSettingData(dbName, key);
    const keyAndValue = {};
    settingDataKeys.map((rec) => {

        const { key, value } = rec;

        if (key === "productCustomTabDescriptionLabel") {
            keyAndValue[key] = JSON.parse(value);
        } else {
            keyAndValue[key] = value;
        }


    });

    return { keyAndValue }

};

exports.getSettingDataKeyAndValuev1 = async (dbName, key) => {
    const settingDataKeys = await getSettingData(dbName, key);
    const keyAndValue = {};
    settingDataKeys.map((rec) => {

        const { key, value } = rec;

        if (key === "enable_stock_number") {
            keyAndValue[key] = JSON.parse(value);
        } else {
            keyAndValue[key] = value;
        }


    });

    return { keyAndValue }
};

exports.getSettingDataKeyAndValuev2 = async (dbName, key) => {
    const settingDataKeys = await getSettingData(dbName, key);
    const keyAndValue = {};
    settingDataKeys.map((rec) => {

        const { key, value } = rec;

        if (key === "enable_grading") {
            keyAndValue[key] = JSON.parse(value);
        } else {
            keyAndValue[key] = value;
        }


    });

    return { keyAndValue }
};

exports.getSettingDataKeyAndValuev3 = async (dbName, key) => {
    const settingDataKeys = await getSettingData(dbName, key);
    const keyAndValue = {};
    settingDataKeys.map((rec) => {

        const { key, value } = rec;

        if (key === "enable_zipcode") {
            keyAndValue[key] = JSON.parse(value);
        } else {
            keyAndValue[key] = value;
        }


    });

    return { keyAndValue }
};

exports.getSettingDataKeyAndValuev4 = async (dbName, key) => {
    const settingDataKeys = await getSettingData(dbName, key);
    const keyAndValue = {};
    settingDataKeys.map((rec) => {

        const { key, value } = rec;

        if (key === "product_approved_by_admin") {
            keyAndValue[key] = JSON.parse(value);
        } else {
            keyAndValue[key] = value;
        }


    });

    return { keyAndValue }
};


exports.sendMailthroughSMTPV3 = async function (smtpData, res, subject,
    receiversEmail, content, type) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.debug("===========SMTP===>>", smtpData);
            // if(new_email_template_v10 && new_email_template_v10.length>0){
            //     content = new_content
            // }
            let secureCon = true;
            if (smtpData["smtp_secure"] !== undefined) {
                if (parseInt(smtpData["smtp_secure"]) == 0) {
                    secureCon = false;
                }
            }
            logger.debug("=========secureCon = =========", secureCon);
            let options = {
                service: "mailgun",
                auth: {
                    user: config.get('EmailCredentials.email'),
                    pass: config.get('EmailCredentials.password')
                }
            }
            let objectLength = Object.entries(smtpData).length;
            var transporter;
            let from_email;
            if (objectLength > 0) {
                options.service = smtpData[config.get("smtp.smptp_service_key")]
                options.auth.user = smtpData[config.get("smtp.from_email_key")]
                options.auth.pass = smtpData[config.get("smtp.password_key")]
                var email_valid = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                from_email = email_valid.test(options.auth.user) == true ? options.auth.user : smtpData["smtp_from_email"];
                from_email = smtpData["smtp_from_email"] != undefined && smtpData["smtp_from_email"] != "" ? smtpData["smtp_from_email"] : from_email
                if (smtpData.hasOwnProperty("smtp_host") && smtpData.hasOwnProperty("smtp_port")) {
                    console.log("=====ENTING==>>", content)
                    transporter = nodemailer.createTransport('SMTP', {
                        host: smtpData["smtp_host"],
                        port: parseInt(smtpData["smtp_port"]),
                        secureConnection: secureCon,
                        auth: {
                            user: smtpData[config.get("smtp.from_email_key")],
                            pass: smtpData[config.get("smtp.password_key")]
                        }
                    });
                }
                else {
                    console.log("=======>>", options)
                    transporter = nodemailer.createTransport("SMTP",
                        options
                    );
                }
            }
            else {
                console.log("=======>>", options)
                transporter = nodemailer.createTransport("SMTP",
                    options
                );
                from_email = '"Royo" royo@mail.royoapps.com'
            }

            logger.debug("===from_email=", options, transporter, from_email)
            // console.log(reg.test("sd@f.com"))

            if (type == 0) {
                var mailOptions = {
                    from: from_email, // sender address
                    to: receiversEmail, // list of receivers
                    subject: subject, // Subject line
                    html: content  // plaintext body
                };
            }
            else {
                var mailOptions = {
                    from: from_email, // sender address
                    to: receiversEmail, // list of receivers
                    subject: subject, // Subject line
                    text: content // plaintext body
                };
            }

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                console.log("-------err------info--------", error, info)
                resolve()

            });
        }
        catch (Err) {
            resolve()
        }
    });
}
