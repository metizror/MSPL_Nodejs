var sendResponse = require('../routes/sendResponse');
//var dbConfig = config.get('EmailCredentials');
var constant = require('../routes/constant');
var readMultipleFiles = require('read-multiple-files');
var func = require('../routes/commonfunction');
var async = require('async');
var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var Path = require('path');
var fsExtra = require('fs-extra');
var log4js=require("log4js")
var logger = log4js.getLogger();
let sizeOf = require('image-size');
logger.level = config.get('server.debug_level');
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
exports.getOnlyDate = function (callback) {
    var date = new Date().toISOString().split("T");
    callback(null, date);
}
/**
 * Upload file to S3 bucket
 * @param file
 * @param folder
 * @param callback
 */

exports.uploadImageFileToS3Bucket = function (res, file, folder) {
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
            generateRandomString(cb);
        },
        function(randomString,cb){
            logger.debug("....random...",randomString);
            randomStrings = randomString;
            cb(null);         
        },
        function (randomString,cb) {
            console.log("here");
            console.log("path*******************************",path);
            var randomString = randomStrings;
            var fname = filename.split(".");
            filename = fname[0].replace(/ /g, '') + randomString + "." + fname[1];
            let stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
            logger.debug("====STORED_PATH====1",config.get("server.protocol")+config.get("server.ip")+":"+config.get("server.uploadFolder")+"/"+filename);
            
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


    var randomStrings;
  
    async.waterfall([
        function (cb) {
            func.generateRandomString(cb);
        },
        
        function (randomString,cb) {
            console.log("here")
            console.log("path*******************************",path);
          //  var randomString = randomStrings;
            var fname = filename.split(".");
            filename = fname[0].replace(/ /g, '') + randomString + "." + fname[1];
            let stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
            logger.debug("====STORED_PATH====2",config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);
            
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

module.exports.uploadImage=async function(file){
logger.debug("===========file===========",file)
    var fs = require('fs');
    var AWS = require('aws-sdk');
    var filename = file.name; // actual filename of file
    var path = file.path; //will be put into a temp directory
    var mimeType = file.type;
    var s3Url = config.get('s3BucketCredentials.s3URL') + '/';
    var randomStrings;
    logger.debug("=========HERE==");
    logger.debug("path*******************************",path);
    

    return new Promise(async (resolve,reject)=>{
        var generatedText = "";
        var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
        for (var i = 0; i < 6; i++) {
            generatedText += text.charAt(Math.floor((Math.random() * text.length)));
        }
        var fname = filename.split(".");
        filename = fname[0].replace(/ /g, '') + generatedText + "." + fname[1];

        let stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
       
        logger.debug("====STORED_PATH====3",config.get("server.protocol")+config.get("server.ip")+":"+config.get("server.uploadFolder")+"/"+filename);
        
        saveFile(path, stored_path,(err, data) => {
            resolve(config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);
        })

    })
}




const createCsvWriter = require('csv-writer').createObjectCsvWriter;
module.exports.uploadCsvFile=async function(data,header,fileType){
        // logger.debug("===========file===========",file)
            var filename = "file.name"; // actual filename of file
        
            return new Promise(async (resolve,reject)=>{
                var generatedText = "";
                var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
                for (var i = 0; i < 6; i++) {
                    generatedText += text.charAt(Math.floor((Math.random() * text.length)));
                }
                // var fname = filename.split(".");
                filename = fileType+generatedText+".csv"
                console.log("============config.getserver.publicFolder=========",config.get("server.publicFolder"))
        
                let stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
                console.log("+=======store=====",stored_path)
               
                logger.debug("====STORED_PATH====3",config.get("server.protocol")+config.get("server.ip")+":"+config.get("server.uploadFolder")+"/"+filename);
               
                console.log("============in savecsv-----------");
                const csvWriter = createCsvWriter(
                    {
                        path : `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`,
                        header
                }
                    );
                csvWriter
                  .writeRecords(data)
                  .then(
                      ()=> {
                          console.log("+====================write success===")
                        resolve(config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);
                      }
                    );    
            })
        }



function saveFile(fileData, path, callback) {
    fsExtra.copy(fileData, path, callback);
}
function saveFileInOrigin(path,stored_path,filename){
    return new Promise((resolve,reject)=>{
        saveFile(path, stored_path,(err, data) => {
            resolve(config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);
        })
    })
}

function GetSize(path){
    return new Promise((resolve,reject)=>{    
        sizeOf(path, function (err, dimen) {      
            logger.debug("=====+++DIMERNIO==",dimen)        
            resolve(dimen) 
        }); 
})
}
function createThumbnailImage(dimensions,originalPath, thumbnailPath, callback) {    
    return new Promise((resolve,reject)=>{
            const ratio = dimensions.width/dimensions.height;
            logger.debug("========filename===originalPath, thumbnailPath========",ratio,dimensions,originalPath, thumbnailPath); 
            var gm = require('gm').subClass({imageMagick: true});
            gm(originalPath)
                .resize(dimensions.width * ratio * .15, dimensions.height * ratio * .15, "!")
                .autoOrient()
                .write(thumbnailPath, function (err, data) {
                    resolve()
                })
            })
}




exports.uploadImageFileToS3BucketNew = function (file) {
    return new Promise((resolve,reject)=>{
        logger.debug("------------file=------------",file);
        let fs = require('fs');
        let AWS = require('aws-sdk');
        let filename = file.name; // actual filename of file
        let path = file.path; //will be put into a temp directory
        let mimeType = file.type;
        let s3Url = config.get('s3BucketCredentials.s3URL') + '/';
        console.log("here")
        console.log("path*******************************",path);
        filename = Date.now()+"_"+filename
        fs.readFile(path,function(error, file_buffer) {
            if(error){
                console.log("================s3============error==" + error);
                reject(error);
            }else{
                AWS.config.update({
                    accessKeyId: config.get('s3BucketCredentials.accessKeyId'),
                    secretAccessKey: config.get('s3BucketCredentials.secretAccessKey')
                });
                
                var s3bucket = new AWS.S3();
                var params = {
                    Bucket: config.get('s3BucketCredentials.bucket'),
                    Key: filename,
                    Body: file_buffer,
                    ACL: 'public-read',
                    ContentType: mimeType
                };
                s3bucket.putObject(params, function (err, data) {
                    console.log("================s3============error==" + err);
                     resolve(s3Url + filename);
                    // fs.unlink(path, function (err, result1) {
                    // });

                    // if (err) {
                    //     console.log("================s3============error==" + err);
                    //     // sendResponse.somethingWentWrongError(res);
                    //     reject(err);
                    // } else {
                        // return resolve(s3Url + filename);
                    // }
                });
            }
        });
    })

};


// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
module.exports.uploadCsvFileNew=async function(data,header,fileType){
        // logger.debug("===========file===========",file)
            var filename = "file.name"; // actual filename of file

            return new Promise(async (resolve,reject)=>{
                var generatedText = "";
                var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
                for (var i = 0; i < 6; i++) {
                    generatedText += text.charAt(Math.floor((Math.random() * text.length)));
                }
                // var fname = filename.split(".");
                filename = fileType+generatedText+".csv"
                console.log("============config.getserver.publicFolder=========",config.get("server.publicFolder"))
        
                let stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`;
                console.log("+=======store=====",stored_path)
               
                logger.debug("====STORED_PATH====3",config.get("server.protocol")+config.get("server.ip")+":"+config.get("server.uploadFolder")+"/"+filename);
               
                console.log("============in savecsv-----------");
                const csvWriter = createCsvWriter(
                    {
                        path : `${Path.resolve(".")}${config.get("server.publicFolder")}${filename}`,
                        header
                }
                    );
                csvWriter
                  .writeRecords(data)
                  .then(
                      ()=> {
                        let fs = require('fs');
                        let AWS = require('aws-sdk');
                        let s3Url = config.get('s3BucketCredentials.s3URL') + '/';
                          console.log("+====================write success===")
                       let path = stored_path
                       fs.readFile(path,function(error, file_buffer) {
                        if(error){
                            console.log("================s3============error==" + error);
                            // sendResponse.somethingWentWrongError(res);
                            reject(error)
                        }else{
                            AWS.config.update({
                                accessKeyId: config.get('s3BucketCredentials.accessKeyId'),
                                secretAccessKey: config.get('s3BucketCredentials.secretAccessKey')
                            });
                            
                            var s3bucket = new AWS.S3();
                            var params = {
                                Bucket: config.get('s3BucketCredentials.bucket'),
                                Key: filename,
                                Body: file_buffer,
                                ACL: 'public-read',
                                ContentType: "text/csv"
                            };
                            s3bucket.putObject(params, function (err, data) {
                                fs.unlink(path, function (err, result1) {
                                });
                                if (err) {
                                    console.log("================s3============error==" + err);
                                    reject(err);
                                } else {
                                  resolve(s3Url+filename);
                                }
                            });
                        }
                        });
                      }
                    );    
            })
        }
