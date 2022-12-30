var Jimp = require("jimp");
var easyimg = require('easyimage');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var fs =require('fs');
var url = require('url');
var http = require('http');
var imgHeight;
var imgWidth;
var path;
var width;
var height;
var imageName;
var pathw;
var uploadImageName;
var Path = require('path');
var fsExtra = require('fs-extra');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';

exports.getimageResize = function(req,res){

    if(!(req.query.path)){
        var msg = "image not found";
        return sendResponse.sendErrorMessage(msg,res,400);
    }


    if(!(req.query.width))
    {
        var msg = "resize image width not found";
        return sendResponse.sendErrorMessage(msg,res,400);
    }

    if(!(req.query.height)){
        var msg = "resize heigth width id not found";
        return sendResponse.sendErrorMessage(msg,res,400);
    }


    path = req.query.path;
    width = parseInt(req.query.width);
    height = parseInt(req.query.height);
    var folder = 'abc';

    var data;


    async.auto({
        imageDetail: function (cb) {
            imageDetail(path, function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
        },
        checkSize: ['imageDetail', function (cb) {

            if(width > imgWidth){
                var msg = "resize width is more then actual image width  ";
                return sendResponse.sendErrorMessage(msg,res,400);

            }

            if(height > imgHeight){
                var msg = "resize heigth is more then actual image height  ";
                return sendResponse.sendErrorMessage(msg,res,400);

            }
            cb(null);
        }],
        imageResize: ['imageDetail', 'checkSize', function (cb) {
            reSizeImage(function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
        }],
        uploadImageFileToS3Bucket: ['imageResize', function (cb) {
            uploadImageFileToS3Bucket(res, pathw, folder, uploadImageName, function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    data = result;
                    cb(null);
                }
            });
        }]

    }, function (err, result) {
        if (err) {
            var msg = "something went wrong ";
            return sendResponse.sendErrorMessage(msg,res,500);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    }) 
}



exports.imageResize = function(req, res) {
    
    
    if(!(req.body.path)){
        var msg = "image not found";
        return sendResponse.sendErrorMessage(msg,res,400);
    }
    
    
    if(!(req.body.width))
    {
        var msg = "resize image width not found";
        return sendResponse.sendErrorMessage(msg,res,400);
    }
    
    if(!(req.body.height)){
        var msg = "resize heigth width id not found";
        return sendResponse.sendErrorMessage(msg,res,400);
    }
    
    
    path = req.body.path;
    width = parseInt(req.body.width);
    height = parseInt(req.body.height);
    var folder = 'abc';

    var data;


    async.auto({
        imageDetail: function (cb) {
            imageDetail(path, function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
        },
        checkSize: ['imageDetail', function (cb) {
            
            if(width > imgWidth){
                var msg = "resize width is more then actual image width  ";
                return sendResponse.sendErrorMessage(msg,res,400);

            }
            
            if(height > imgHeight){
                var msg = "resize heigth is more then actual image height  ";
                return sendResponse.sendErrorMessage(msg,res,400);

            }
            cb(null);
        }],
        imageResize: ['imageDetail', 'checkSize', function (cb) {
            reSizeImage(function (err, result) { 
                console.log("................err.res",err,result);
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
        }],
        uploadImageFileToS3Bucket: ['imageResize', function (cb) {
            uploadImageFileToS3Bucket(res, pathw, folder, uploadImageName, function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    data = result;
                    cb(null);
                }
            });
        }]

    }, function (err, result) {
        if (err) {
            var msg = "something went wrong ";
            return sendResponse.sendErrorMessage(msg,res,500);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,200);
        }
    })
}


function reSizeImage(cb) {
    Jimp.read(path, function(err, img) {
        if (err) {
            var msg = "something went wrong ";
            return sendResponse.sendErrorMessage(msg,res,500);
        } else {

            var date = new Date().toISOString().split("T");
            uploadImageName=date + imageName ;
       //     console.log("===================",uploadImageName);
            pathw = "./upload/" + date + '.jpg';
            console.log(width, height);
            img.resize(width, height) // resize
                .quality(100) // set JPEG quality
                .write(pathw, cb); // save
            //console.log('===========',img);
            //cb(null);

        }
    });
}



function imageDetail(path, cb) {
/*    easyimg.info(path).then(
        function(file) {
            console.log(file);
            imgHeight = file.height;
            imgWidth = file.width;
            imageName = file.name;
            cb(null);
        },
        function(err) {
            var msg = "something went wrong ";
            return sendResponse.sendErrorMessage(msg,res,500);
        }
    );*/
/*    imgHeight = 500;
    imgWidth = 500;
    imageName = "nbame";
    cb(null);*/

    var sizeOf = require('image-size');

    var imgUrl = 'http://royo-s3.s3.amazonaws.com/royo.jpg';
    var options = url.parse(path);

    http.get(options, function (response) {
        var chunks = [];
        response.on('data', function (chunk) {
            chunks.push(chunk);
        }).on('end', function() {
            var buffer = Buffer.concat(chunks);
            imgHeight = buffer.height;
            imgWidth = buffer.width;
            imageName = "name";
            cb(null);
        });
    });


}

function saveFile(fileData, path, callback) {
    fsExtra.copy(fileData, path, callback);
}


function uploadImageFileToS3Bucket(res, path, folder,uploadImageName, cb) {
    var AWS = require('aws-sdk');
    var s3Url = config.get('s3BucketCredentials.s3URL') + '/';
   // console.log("............................path............",path);
   let stored_path = `${Path.resolve(".")}${config.get("server.publicFolder")}${uploadImageName}`;
   logger.debug("====STORED_PATH====6",config.get("server.protocol")+config.get("server.ip")+":"+config.get("server.uploadFolder")+"/"+filename);
   saveFile(path, stored_path,(err, data) => {
       return callback(null, config.get("server.protocol")+config.get("server.ip")+"/"+config.get("server.uploadFolder")+"/"+filename);
   })
    // fs.readFile(path, function(error, file_buffer) {
    //  //   console.log("file bufferrr..........................",file_buffer);
    //     if (error) {
    //         var msg = "something went wrong ";
    //         return sendResponse.sendErrorMessage(msg,res,500);
    //     } else {
    //         AWS.config.update({
    //             accessKeyId: config.get('s3BucketCredentials.accessKeyId'),
    //             secretAccessKey: config.get('s3BucketCredentials.secretAccessKey')
    //         });
    //         var s3bucket = new AWS.S3();
    //         var params = {
    //             Bucket: config.get('s3BucketCredentials.bucket'),
    //             Key: uploadImageName,
    //             Body: file_buffer,
    //             ACL: 'public-read',
    //             ContentType: "image/jpeg"
    //         };

    //         s3bucket.putObject(params, function(err, data) {
    //         //    console.log("Uploading image...........................", err, data, null);

    //             fs.unlink(path, function(err, result1) {});
    //             if (err) {
    //                 var msg = "something went wrong ";
    //                 return sendResponse.sendErrorMessage(msg,res,500);
    //             } else {
    //                // console.log("........................",s3Url + uploadImageName);
    //                 return cb(null, s3Url + uploadImageName);
    //             }
    //         });
    //     }
    // });
}