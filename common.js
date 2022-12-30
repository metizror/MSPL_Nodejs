var sendResponse = require('./routes/sendResponse');
//var dbConfig = config.get('EmailCredentials');
var constant = require('./routes/constant');
var readMultipleFiles = require('read-multiple-files');
var func = require('./routes/commonfunction');
var async = require('async');
var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var Path = require('path');
var fsExtra = require('fs-extra');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const Universal=require('./util/Universal')
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

    if (checkBlankData) {
        sendResponse.parameterMissingError(res);
    } else {
        callback(null);
    }
}

function checkBlank(arr) {

    var arrlength = arr.length;
 //   console.log("================" + arr);
    for (var i = 0; i < arrlength; i++) {
     //   console.log("==============array values===============" + arr[i]);
      //  console.log("*****ss**********",arr[i]);
        if (arr[i] == undefined) {
            return 1;
            break;
        }
        else if (arr[i].toString().trim() == '') {
            return 1;
            break;
        } else if (arr[i] == '(null)') {
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
exports.encrypt = function(text) {

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
exports.authenticateAccessToken = function(accesstoken, res, callback) {

    var sql = "select id from admin";
    sql += " where access_token =? limit 1";
    var values = [accesstoken];
    //console.log("bksaddsa",values)
    multiConnection[dbName].query(sql, values, function(err, result) {

        console.log("kbfudfjsfd",result,err);
        if (result.length>0) {
            return callback(null, result[0].id);
        } else {
            console.log("access token invalid in common function");
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }
    });

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

exports.adminRegOrNotByEmailAndPass = function(res, callback, email, pass, country, city, clientIp, status) {
  //  console.log("from adminRegOrNotByEmailAndPass")
    var sql = "select id,password from admin where email = ?  limit 1 ";
    multiConnection[dbName].query(sql, [email], function(err, userResponse) {

        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            if (userResponse.length) {
                if (pass == userResponse[0].password) {
                    callback(null, userResponse[0].id);
                } else {
                    async.waterfall([

                        function(cb) {
                            func.insertFailure(res, cb, clientIp, userResponse[0].id, country, city, constant.responseMessage.INVALID_PASS, status);
                        }
                    ], function(err1, reply1) {
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


exports.getAllSectionIds = function (res, adminId, callback) {
    var sql = "select section_id from admin_authority where admin_id = ?";
    multiConnection[dbName].query(sql, [adminId], function (err, userResponse) {

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


exports.updateAccessToken = function (res, cb, adminId, email, clientIp, country, city, message, status) {
  //  console.log("from updateAccessToken")
    var accessToken = func.encrypt(email + new Date());
    var sql = "update admin set access_token = ? where id=? limit 1"
    multiConnection[dbName].query(sql, [accessToken, adminId], function (err, result) {

        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var date = new Date();
            var date1 = date.toISOString().split("T");
            var todayDate = date1[0];
            var sql1 = "insert into admin_login(ip,access_token,admin_id,login_date,city,country,login_status,status) values(?,?,?,?,?,?,?,?)"
            multiConnection[dbName].query(sql1, [clientIp, accessToken, adminId, todayDate, city, country, message, status], function (error, reply) {
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
exports.checkforAuthorityofThisAdmin = function(id, sectionId, res, cb) {
  //  console.log("Inside authority check fn");
    var sql = "SELECT `is_superadmin`,`is_active` FROM admin where id=? limit 1 "
    multiConnection[dbName].query(sql, [id], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (result[0].is_active == 1) {

                if (result[0].is_superadmin == 1) {
                    return cb(null);
                }
                else {
                    var sql = "select id from admin_authority where section_id=? && admin_id=? limit 1"
                    multiConnection[dbName].query(sql, [sectionId, id], function (err, checkAuthority) {
                        if (err) {  
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                          //  console.log(checkAuthority)
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


        }

    })

}




/*
 * ------------------------------------------------------
 * Authenticate a user through Access token and return id
 * Input:Access token
 * Output: supplier_id Or Json error
 * ------------------------------------------------------
 */
exports.authenticateAccessTokenSupplier = function (accesstoken, res, callback) {

    var sql = "select id from supplier_admin";
    sql += " where access_token =? limit 1";
    var values = [accesstoken];
    multiConnection[dbName].query(sql, values, function (err, result) {

        if (result.length > 0) {

            return callback(null, result[0].id);

        } else {
         //   console.log("access token invalid in common function");
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }
    });

}













































/*
 * ------------------------------------------------------
 * Authenticate a user through Access token and return id
 * Input:Access token
 * Output: supplier_id Or Json error
 * ------------------------------------------------------
 */
exports.authenticateAccessTokenSupplier = function (accesstoken, res, callback) {

    var sql = "select id from supplier_admin";
    sql += " where access_token =? limit 1";
    var values = [accesstoken];
    multiConnection[dbName].query(sql, values, function (err, result) {

        if (result.length > 0) {

            return callback(null, result[0].id);

        } else {
         //   console.log("access token invalid in common function");
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }
    });

}



/*
 * ------------------------------------------------------
 * Authenticate a user through Access token and return id
 * Input:Access token
 * Output: supplier_id Or Json error
 * ------------------------------------------------------
 */
exports.authenticateAccessTokenSupplier = function (accesstoken, res, callback) {

    var sql = "select id from supplier_admin";
    sql += " where access_token =? limit 1";
    var values = [accesstoken];
    multiConnection[dbName].query(sql, values, function (err, result) {

        if (result.length > 0) {

            return callback(null, result[0].id);

        } else {
          //  console.log("access token invalid in common function");
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }
    });

}















/*
 * ------------------------------------------------------
 * function to check the authorities of the supplier
 * Input:supplier id, section id
 * Output: Success Message or Error
 * ------------------------------------------------------
 */
exports.checkforAuthorityofThisSupplier = function (dbName,id, sectionId, res, cb) {
    console.log("Inside authority check fn");
    var sql = "SELECT `is_superadmin`,`is_active` FROM supplier_admin where id=? limit 1 "
    multiConnection[dbName].query(sql, [id], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
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


        }

    })

}















exports.getAllRegisteredAdmins = function (res, id, callCheck, callback) {
    var sql = "select id,email,is_active from admin where is_superadmin = ? and id != ? ";
    multiConnection[dbName].query(sql, [0, id], function (err, reply) {
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


exports.insertFailure = function (res, cb, clientIp, adminId, country, city, message, status) {
    var date = new Date();
    var date1 = date.toISOString().split("T");
    var todayDate = date1[0];
    var sql1 = "insert into admin_login(ip,admin_id,login_date,login_status,country,city,status) values(?,?,?,?,?,?,?)";
    multiConnection[dbName].query(sql1, [clientIp, adminId, todayDate, message, country, city, status], function (error, reply) {
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
exports.insertAdminActions = function (res, callback, id, text, url) {
    var sql = "insert into admin_logs(admin_id,action_text,url) values(?,?,?)"
    multiConnection[dbName].query(sql, [id, text, url], function (err, result) {
        console.log(err);
        callback(null);
    })


}

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
    var randomStrings;
    // console.log("uploadImageFileToS3Bucket....................")
    // console.log(file.name)
    // console.log(file.path)
    // console.log(folder)
    async.waterfall([
        function (cb) {
            console.log("here==========================")
            func.generateRandomString(cb);
        },
        function(randomString,cb){
            console.log("....random...",randomString);
            randomStrings = randomString;
            var gm = require('gm').subClass({imageMagick: true});
            gm(path)
                .resize(300,300, "!")
                .autoOrient()
                .write(path, function (err, data) {
                    if(err){
                        cb(err)
                    }
                    else {
                        cb(null);
                    }
                    
                })
        },
        function (randomString,cb) {
            console.log("here");
            console.log("path*******************************",path);
            var randomString = randomStrings;
            var fname = filename.split(".");
            filename = fname[0].replace(/ /g, '') + randomString + "." + fname[1];
            var stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
            
            saveFile(path, stored_path,(err, data) => {
                return callback(null, config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);
            })
            

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
        }
    ], function (error1, response1) {
        
    })

};


exports.uploadImageFileToS3BucketSupplier = function (res, file, folder, callback) {
    var fs = require('fs');
    var AWS = require('aws-sdk');
    var filename = file.name; // actual filename of file
    var path = file.path; //will be put into a temp directory
    var mimeType = file.type;
    var s3Url = config.get('s3BucketCredentials.s3URL') + '/';
    var randomStrings;

    console.log("....dgfsd? second");
    
    var randomStrings;
    // console.log("uploadImageFileToS3Bucket....................")
    // console.log(file.name)
    // console.log(file.path)
    // console.log(folder)
    async.waterfall([
        function (cb) {
            console.log("here==========================")
            func.generateRandomString(cb);
        },
        
        function (randomString,cb) {
            console.log("here")
            console.log("path*******************************",path);
          //  var randomString = randomStrings;
            var fname = filename.split(".");
            filename = fname[0].replace(/ /g, '') + randomString + "." + fname[1];
            var stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
            
            saveFile(path, stored_path,(err, data) => {
                return callback(null, config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);
            })
            // fs.readFile(path,function(error, file_buffer) {
            //     if(error){
            //         console.log("================s3============error==" + error);
            //         sendResponse.somethingWentWrongError(res);
            //     }else{
            //         AWS.config.update({
            //             accessKeyId: config.get('s3BucketCredentials.accessKeyId'),
            //             secretAccessKey: config.get('s3BucketCredentials.secretAccessKey')
            //         });
                    
            //         var s3bucket = new AWS.S3();
            //         var params = {
            //             Bucket: config.get('s3BucketCredentials.bucket'),
            //             Key: filename,
            //             Body: file_buffer,
            //             ACL: 'public-read',
            //             ContentType: mimeType
            //         };
            //         s3bucket.putObject(params, function (err, data) {
            //             fs.unlink(path, function (err, result1) {
            //             });
            //             if (err) {
            //                 console.log("================s3============error==" + err);
            //                 sendResponse.somethingWentWrongError(res);
            //             } else {
            //                 return callback(null, s3Url + filename);
            //             }
            //         });
            //     }
            // });
        }
    ], function (error1, response1) {

    })

};






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



module.exports.sendMailthroughSMTP = function (res,subject,receiversEmail,content,type,callback) {


    var transporter = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: config.get('EmailCredentials.email'),
            pass: config.get('EmailCredentials.password')
        }
    });
    if(type==0)
    {
        var mailOptions = {
            from: config.get('EmailCredentials.email'), // sender address
            to: receiversEmail, // list of receivers
            subject: subject, // Subject line
            html: content  // plaintext body
        };
    }
    else{
        var mailOptions = {
            from: config.get('EmailCredentials.email'), // sender address
            to: receiversEmail, // list of receivers
            subject: subject, // Subject line
            text: content // plaintext body
        };
    }
// setup e-mail data with unicode symbols


// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("err",error);
           callback(null)
        } else {
        //    console.log('Message sent: ' + JSON.stringify(info));
            callback(null);
        }

    });

}

/*
 * ------------------------------------------------------
 * Authenticate a data gathering admin through Access token and return id
 * Input:Access token
 * Output: Admin_id Or Json error
 * ------------------------------------------------------
 */
exports.authenticateDataGatheringAccessToken = function (accesstoken, res, callback) {

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

 exports.uploadMultipleFilesToS3Bucket = function (bufs,file,count,res,callback)
{
    var fs = require('fs');
    var AWS = require('aws-sdk');
    var fileUrls = []
    for(var i = 0 ; i < count ; i++)
    {
        (function(i)
        {
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
                if(i == count - 1)
                {
                    console.log(fileUrls);
                    callback(null,fileUrls);
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

exports.supplierRegOrNotByEmailAndPass = function(res, callback, email, pass, status,flag) {
    console.log("from supplier adminRegOrNotByEmailAndPass",email);
    var TABLE = ' ';
    if(flag==1){
        TABLE = ' supplier ';
    }
    else {
         TABLE = ' supplier_branch ';
     } 
    var sql = "select id,password from " + TABLE + " where email = ?  limit 1 ";
    multiConnection[dbName].query(sql, [email], function(err, userResponse) {

        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            console.log("user Response",userResponse);
            if (userResponse.length) {
                console.log(' user password from data===',userResponse[0].password);
                console.log(' pass===',pass);
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

exports.getAllSectionIdsSupplier = function(res, supplierId, callback) {
    var sql = "select supplier_section_id from supplier_authority where supplier_admin_id = ?";
    multiConnection[dbName].query(sql, [supplierId], function(err, userResponse) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            if (userResponse.length) {
                var limit = userResponse.length;
                var sectionIds = [];
                for (var i = 0; i < limit; i++) {
                    (function(i) {
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

exports.updateSupplierAccessToken = function(res, cb, supplierId, email ,status , flag) {
    var accessToken = func.encrypt(email + new Date());
    if (flag == 1)
    {

        var sql = "update supplier_admin sa join supplier s on s.id = sa.supplier_id " +
            " SET sa.access_token = ?,s.access_token = ? where s.id = ? and sa.is_superadmin = 1 ";
    multiConnection[dbName].query(sql, [accessToken, accessToken, supplierId], function (err, result) {

        if (err) {
            console.log("err update ==>", err);
            sendResponse.somethingWentWrongError(res);
        } else {
            console.log('==calling callback==');
            cb(null, accessToken);

        }

    })
}
    else {
        var sql = "update supplier_branch set access_token = ? where id=? limit 1" ;
        multiConnection[dbName].query(sql, [accessToken, supplierId], function(err, result) {

            if (err) {
                console.log("err update ==>",err);
                sendResponse.somethingWentWrongError(res);
            } else {
                console.log('==calling callback==');
                cb(null,accessToken);

            }

        })
     }


}

exports.getAllSupplierSectionIds = function(res, supplierId, callback) {
    console.log("kbhfasvjfd",supplierId)
    var sql = "select supplier_section_id from supplier_authority where supplier_admin_id = ?";
    multiConnection[dbName].query(sql, [supplierId], function(err, userResponse) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            //console.log('userResonse===',userResponse);
            if (userResponse.length) {
                var limit = userResponse.length;
                var sectionIds = [];
                for (var i = 0; i < limit; i++) {
                    (function(i) {
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

exports.authenticateSupplierAccessToken = function(accessToken, res, callback,flag)
{
    console.log("..fll..",flag,accessToken);
    var q;
    if(flag==1)
    {
        console.log("...if,..")
        q = ' select id from supplier_admin where access_token = ? ';

    }
    else
    {
        q = ' select id from supplier_branch where access_token = ? ';
    }

    multiConnection[dbName].query(q, [accessToken], function(err, result) {
        console.log("....er....",err,result);
        if (result.length) {
            return callback(null, result[0].id);

        } else {
          //  console.log("access token invalid in common function");
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
        }
    });


}
function saveFile(fileData, path, callback) {
    fsExtra.copy(fileData, path, callback);
}

exports.sort_by = function(field, reverse, primer){

    var key = primer ?
        function(x) {return primer(x[field])} :
        function(x) {return x[field]};

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}


const ExecuteQ = require('./lib/Execute')
exports.getGoogleApiKey = function(dbName){
    return new Promise(async(resolve,reject)=>{
        try{
            let query = "select value from tbl_setting where `key` = 'google_map_key'"
            let query2 = "select value from tbl_setting where `key` = 'google_map_key_backend'"
            let result = await ExecuteQ.Query(dbName,query,[]);
            let result2=await ExecuteQ.Query(dbName,query2,[]);
            if(result2 && result2.length>0){
                resolve(result2[0].value);
            }
            else{
                resolve(result[0].value);
            }
           
        }catch(err){
            resolve([])
        }
    })
}
exports.getEstimatedTime = function (dbName, api_key,user_latitude,user_longitude,
    agent_latitude,agent_longitude) {
        
    return new Promise(async(resolve, reject) => {
        let u_lat_long = user_latitude+","+user_longitude
        let a_lat_long = agent_latitude+","+agent_longitude
        const distance = require('google-distance');
        distance.apiKey = api_key;
        distance.get(
            {
                index: 1,
                origin: a_lat_long,
                destination: u_lat_long
            },
            function (err, data) {
                if (err) {
                    console.log(err);
                }else{
                    resolve(data.duration)
                }
                
            });
    })
}

exports.getUserDetails = function(dbName,orderId){
    return new Promise((resolve,reject)=>{
        try{
            let query = "select ua.latitude, ua.longitude from orders o join user u on o.user_id = u.id join "
                query += "user_address ua on ua.id = o.user_delivery_address where o.id=?"
            let params = [orderId]
            let result = ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(err){
            reject(err);
        }
    })
}

exports.getUserDriverDistance = function(dbName,orderId){
    return new Promise(async (resolve,reject)=>{
        try{
            let mUnit=await Universal.getMeausringUnit(dbName)
            let query = "select round(("+mUnit+" * acos( cos( radians( cu.latitude) ) * cos( radians( ua.latitude ) ) * cos( radians( ua.longitude ) - radians(cu.longitude) ) + sin( radians(cu.latitude) ) * sin( radians( ua.latitude ) ) ) )) as distance from orders o join user u on o.user_id = u.id join user_address ua on ua.id = o.user_delivery_address left join "+dbName+"_agent.cbl_user_orders cuo on o.id=cuo.order_id left join "+dbName+"_agent.cbl_user cu on cuo.user_id=cu.id where o.id=?"

            let params = [orderId]
            let result = ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(err){
             reject(err);
        }
    })
}

exports.getUserSupplierDistance = function(dbName,user_latitude,user_longitude,branch_id){
    return new Promise(async (resolve,reject)=>{
        try{
            let mUnit=await Universal.getMeausringUnit(dbName);
            let query = "select ("+mUnit+" * acos (cos ( radians("+user_latitude+") )* cos( radians( sb.latitude ) )* cos( radians( sb.longitude ) - radians("+user_longitude+") )+ sin ( radians("+user_latitude+") )* sin( radians( sb.latitude ) ))) AS distance "
            query+=     " from supplier_branch sb where sb.id = ?"
            let params = [branch_id]
            let result = ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(err){
            reject(err);
        }
    })
}

exports.getTableBookingDetails = function(dbName,table_booking_id){
    return new Promise(async (resolve,reject)=>{
        try{
            
            let query = "select * from user_table_booked where id=?"
            let params = [table_booking_id]
            let result = ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(err){
            reject(err);
        }
    })
}

exports.getDistanceAndTimeCheckForNotification = function(dbName){
    return new Promise(async (resolve,reject)=>{
        try{
            
            let query = "select `key`,`value` from tbl_setting where `key`=? or `key`=? ";
            let params = ["table_booking_distance","table_booking_time"]
            let result = ExecuteQ.Query(dbName,query,params);
            resolve(result);
        }catch(err){
            reject(err);
        }
    })
}

exports.saveadminsNotifications = function(dbName,supplierId,orderId,message,status,user_id){
    return new Promise(async(resolve,reject)=>{
        try{
                var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status,is_admin,notification_type) values(?,?,?,?,?,?,?) ";
                let params = [user_id, supplierId, orderId, message, status,1,"table_booking"]

                await ExecuteQ.Query(dbName,sql,params);
                resolve()
            
        }catch(e){
            logger.debug(e);
            resolve()
        }
    })
}