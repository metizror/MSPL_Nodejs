/**
 * Created by cbl98 on 6/5/16.
 */
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var validator = require("email-validator");
md5 = require('md5');
var loginFunctions = require('./loginfunctionsupplier');

var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';


exports.add_sub_supplier = function(req, res) {
    var accessToken =0;
    var sub_supplierMobileNo = 0;
    var sub_supplierEmail = 0;
    var inputs=null;
    var password = req.body.password
    
    var supplierId = req.supplier.supplier_id;
    var supplier_id;
    var sub_supplierAccessToken = func.encrypt(sub_supplierEmail + new Date());
    let authSectionId = req.body.authSectionId;
    let iso = req.body.iso==undefined?"":req.body.iso
    let country_code = req.body.country_code==undefined?"":req.body.country_code
   
    async.waterfall([
        function(cb) {
            logger.debug("================333333========")
            if(req.body && req.body.accessToken && req.body.phoneNumber && req.body.email)
            {
                accessToken = req.body.accessToken;
                sub_supplierMobileNo=req.body.phoneNumber;
                sub_supplierEmail=req.body.email;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        // function(cb){
        //     if (validator.validate(sub_supplierEmail)) {
        //         cb(null);
        //     } else {
        //         sendResponse.sendErrorMessage(constant.responseMessage.INVALID_EMAIL, res, constant.responseStatus.INVALID_EMAIL);
        //     }
        // },
        // function(cb) {
        //     func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
        // },
        // function(supplierId1, cb) {
        //     supplier_id = supplierId1;
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,0, res, cb);
        // },
        function(cb) {
            logger.debug("================4444========")
                checkSupplierEmailAvailability(req.dbName,res, cb, sub_supplierEmail);
        },
        // function (cb) {
        //     getId(req.dbName,res,supplier_id,cb)
        // },
        // function(id,cb) {
        //     // supplierId=id[0].supplier_id;
        //     //console.log('supplier-----',supplierId);
        //     func.generateRandomString(cb);
        // },
        function( cb) {
            logger.debug("================5555========")
            // password = password;
            var isSupplierSuperadmin = 0;
            inputs = [supplierId,sub_supplierEmail, md5(password),
                 sub_supplierMobileNo, isSupplierSuperadmin,
                  supplierId, sub_supplierAccessToken,iso,country_code];
            subsupplierBysupplier(req.dbName,res, cb, inputs);
        },
        /*function (cb) {
            registerSupplier(res, cb,sub_supplierEmail,sub_supplierMobileNo,md5(password));
        },*/
        function(cb) {
            logger.debug("================888========")
           // inputs = null;
            // inputs = [sub_supplierEmail, password];
            // func.sendEmail(res, cb, inputs);
            cb(null);
        }

    ],  function (error, response) {
        if (error) {
            console.error(error);
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

function registerSupplier(res, callback, email,mobile,pass) {
    var sql = " insert into supplier(email,mobile_number_1,password,is_admin)values(?,?,?)";
    multiConnection[dbName].query(sql, [email,mobile,pass,0], function (err, reply) {
        if (err) {
            console.error(err)
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })
}


exports.listSubsupplier= function(req,res) {
    var accessToken =0;
    var sectionId =0;
    var supplier_id;
    var supplierId;
    async.waterfall([
            function (cb) {
                if(req.body && req.body.accessToken && req.body.sectionId)
                {
                    accessToken = req.body.accessToken;
                    sectionId = req.body.sectionId;
                    cb(null);
                }
                else {
                    sendResponse.parameterMissingError(res);
                }
            },
            function (cb) {
                func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
            },
            // function (id, cb) {
            //     supplier_id=id;
            //     func.checkforAuthorityofThisSupplier(req.dbName,id,sectionId, res, cb);
            // },
            function (id,cb) {
                supplier_id=id;
            getId(req.dbName,res,supplier_id,cb)
            },
            function (id,cb) {
                supplierId=id[0].supplier_id;
                loginFunctions.listofSubsupplier(req.dbName,res,supplierId,cb);
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

exports.makeSubsupplierActiveOrInActive = function (req, res) {
    var accessToken =0;
    var status = 0;
    var subsupplierId = 0;
    var supplierId;
    async.waterfall([
        function (cb) {
            if(req.body && req.body.accessToken&& req.body.subsupplierId)
            {
                accessToken = req.body.accessToken;
                status = req.body.status;
                subsupplierId = req.body.subsupplierId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
        },
        // function (id, cb) {
        //     supplierId = id;
        //     func.checkforAuthorityofThisSupplier(req.dbName,id,0, res, cb);
        // },
        function (id,cb) {
            supplierId = id;

            checkSubsupplierRegOrNotById(req.dbName,res,subsupplierId, cb);
        },
        function (cb) {
            checkSubsupplierAuthority(req.dbName,res,subsupplierId, cb);
        },
        function(cb){
            makeSubsupplierActiveOrNotActive(res,status,subsupplierId,cb);
        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError();
        } else {
            var data = {};
            data.subsupplierId = subsupplierId;
            if (status == '0') {
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            } else {
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    })
}

exports.assignOrRevokesubsupplierSection = function (req, res) {
    var subSupplierId = 0;
    var superAccessToken = 0;
    var sectionIds='';
    var revokeSectionIds='';
    var supplierId;
    var supplier_id;
    var manValue=[subSupplierId,superAccessToken];
    //console.log('body------>',req.body);
    async.waterfall([
        function (cb) {
            if(req.body && req.body.accessToken && req.body.id && req.body.assignSectionIds && req.body.revokeSectionIds)
            {
                superAccessToken = req.body.accessToken;
                subSupplierId = req.body.id;
                sectionIds = req.body.assignSectionIds;
                revokeSectionIds = req.body.revokeSectionIds;
                cb(null);
            }
            else if(req.body && req.body.accessToken && req.body.id && req.body.assignSectionIds)
            {
                //console.log("if2");
                superAccessToken = req.body.accessToken;
                subSupplierId = req.body.id;
                sectionIds = req.body.assignSectionIds;
                //console.log('body------>',superAccessToken,subSupplierId,sectionIds,revokeSectionIds);
                cb(null);

            }
            else if(req.body && req.body.accessToken && req.body.id  && req.body.revokeSectionIds)
            {
                //console.log("if3");
                superAccessToken = req.body.accessToken;
                subSupplierId = req.body.id;
                revokeSectionIds = req.body.revokeSectionIds;
                cb(null);

            }
            else {
                sendResponse.parameterMissingError(res);
            }        },
        function (cb) {
            func.authenticateSupplierAccessToken(req.dbName,superAccessToken, res, cb,1);
        },
        // function (superId, cb) {
        //     supplier_id = superId;
        //     func.checkforAuthorityofThisSupplier(req.dbName,supplier_id,0, res, cb);
        // },
        function (superId,cb) {
            supplier_id = superId;
            getId(req.dbName,res,supplier_id,cb)
        },
        function (id,cb) {
            supplierId=id[0].supplier_id;
            checkSupplierRegOrNotById(req.dbName,res, supplierId, cb);
        },
        function (cb) {
            var ids = sectionIds.trim().split(",");
            //console.log("sectionIds" ,sectionIds,ids.length);
            if (ids.length && sectionIds != '') {
                assignSectionsTosubsupplier(req.dbName,subSupplierId, supplierId, ids, res, cb);
            } else {
                cb(null);
            }

        },
        function (cb)
        {
            //console.log(revokeSectionIds);
            var revokeIds = revokeSectionIds.trim().split(",");
            //console.log("abc:",revokeIds);
            if (revokeIds.length && revokeSectionIds != '' && revokeSectionIds != '0') {
                revokeSectionOfAdmin(dbName,subSupplierId, revokeIds, res, cb);
            } else {
                cb(null);
            }
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

exports.getallsectionwithassignedstatus = function (req, res) {
    var accessToken = 0;
    var subsupplierId = 0;
    var manValue = [accessToken, subsupplierId];

    async.waterfall([
        function (cb) {
            //console.log("===============checkBlank============");
            if(req.body && req.body.accessToken && req.body.subsupplierId)
            {
                accessToken = req.body.accessToken;
                subsupplierId = req.body.subsupplierId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        function (cb) {
            //console.log("===============authenticateAccessToken============");
            func.authenticateSupplierAccessToken(req.dbName,accessToken, res, cb,1);
        },
        // function (superId, cb) {
        //     //console.log("===============checkforAuthorityofThisSupplier-Admin============");
        //     func.checkforAuthorityofThisSupplier(req.dbName,superId,0, res, cb);
        // },
        function (cb) {
            checkSupplierRegOrNotById(req.dbName,res, subsupplierId, cb);
        },
        function (cb) {
            //console.log("===============getSingleAdminData============");
            getSingleSubsupplierDataForSupplierAdmin(req.dbName,res, subsupplierId, cb);
        }
    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.ADMIN_DATA, res, constant.responseStatus.SUCCESS);
        }
    })

}

function checkSupplierEmailAvailability(dbName,res, cb, supplierEmail) {
    var sql = " select id from supplier_admin where email = ? limit 1";
    multiConnection[dbName].query(sql, [supplierEmail], function(err, reply) {
        if (err || reply === undefined) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else if (reply.length) {
            sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
        } else {
            //console.log("New User,Email not Exist");
            cb(null);
        }
    })
}

function subsupplierBysupplier(dbName,res, callback, inputs) {
 console.log(",,,,",inputs)
    var sql = "insert into supplier_admin(supplier_id,email,password,phone_number,is_superadmin,created_by_supplier,access_token,iso,country_code)values(?,?,?,?,?,?,?,?,?)";
    multiConnection[dbName].query(sql, inputs, function(err, reply) {
        if (err) {
            console.error("kbjsds",err);
            sendResponse.somethingWentWrongError(res);
            }
         else {
            callback(null);
        }
    })
}

function checkSupplierRegOrNotById(dbName,res, id, callback) {


    //console.log("=================checkSupplierEmailAvailability================");;
    var sql = "select email from supplier_admin where id = ? limit 1";


    multiConnection[dbName].query(sql, [id], function (err, userResponse) {

        if (err || userResponse === undefined) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (userResponse.length) {
                // var errorMsg = 'Email already exists!';
                callback(null);
            }
            else {
                //console.log("=================checkAdminEmailAvailability================else" + userResponse);
                sendResponse.sendErrorMessage(constant.responseMessage.NOT_REG, res, constant.responseStatus.NOT_REG);
            }
        }


    });
}

function assignSectionsTosubsupplier(dbName,subsupplierId, createdById, sectionIds, res, callback) {

    //var idLength = sectionIds.length;

    async.waterfall([
        /*
         *---------------------------------------------------------------------------------------------------------------------
         * Here(for this waterfall model) callback will be cb.
         * If we are using callback(main callback of assignSectionsToAdmin function ) from final function of this waterfall,
         * it will take to the last function.
         *---------------------------------------------------------------------------------------------------------------------
         */
        function (cb) {
            var sql = "select supplier_section_id from supplier_authority where supplier_admin_id = ? ";
            multiConnection[dbName].query(sql, [subsupplierId], function (err1, reply1) {
                if (err1) {
                    //console.log("from select section_id");
                    sendResponse.somethingWentWrongError(res);
                } else if (reply1.length) {
                    var result = new Array();
                    var replyLength = reply1.length;
                    for (var i = 0; i < replyLength; i++) {
                        (function (i) {

                            result.push(reply1[i].section_id);
                            if (i == replyLength - 1) {
                                //console.log("================before getDifference==============");
                                // result = result.split(",");
                                getDifference(sectionIds, result, cb);

                            }

                        }(i))


                    }


                } else {
                    //console.log('==========in else======')
                    cb(null, sectionIds);
                }
            })
        },
        function (ids, cb) {

            //console.log("ids to be insert" + ids);

            var values = new Array();
            var insertLength = "(?,?,?,?),";
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
                    //console.log(idLength);

                    if (idLength) {
                        for (var i = 0; i < idLength; i++) {
                            (function (i) {
                                var createdby=1;
                                values.push(ids[i], subsupplierId, createdById,createdby);
                                // values.push(newValues);
                                querystring = querystring + insertLength;
                                //console.log('<=======querystring=======>'+querystring);
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
                    //console.log(querystring + "--------------")
                    var sql = "insert into supplier_authority(supplier_section_id,supplier_admin_id,created_by_id,created_by) values " + querystring;
                    //console.log("values============" + values);
                    multiConnection[dbName].query(sql, values, function (err, reply) {
                        if (err) {
                            console.log("error",err);
                            //console.log("from insert");
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            //console.log('------in else2====================')
                            cb1(null);
                        }
                    })
                }
            ], function (err2, response2) {
                if (err2) {
                    //console.log("from insert final");
                    sendResponse.somethingWentWrongError(res);
                } else {
                    cb(null)
                }
            })


        }
    ], function (error, response) {
        if (error) {
            //console.log("from assignSectionsToSupplier final");
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })


}

function getDifference(myArray, toRemove, callback1) {
    //console.log("myarray=====>" + myArray);
    //console.log("toremove=====>" + toRemove);
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

function revokeSectionOfAdmin(dbName,subSupplierId, revokeIds, res, callback) {

    async.waterfall([
        function (cbr) {
            var sql = "delete from supplier_authority where supplier_admin_id = ? and supplier_section_id in (" + revokeIds + ") ";
            //console.log("query" + sql);
            multiConnection[dbName].query(sql, [subSupplierId], function (err, reply) {
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

function  checkSubsupplierRegOrNotById(dbName,res, subsupplierId, callback) {
    var sql = " select id from supplier_admin where id = ? limit 1"
    multiConnection[dbName].query(sql,[subsupplierId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){
                callback(null)
            }
            else{
                var msg=" Supplier sub-admin not registered ";
                sendResponse.sendErrorMessage(msg, res, constant.responseStatus.NOT_REG);
            }
        }

    })


}

function checkSubsupplierAuthority(dbName,res,subsupplierId, callback) {
    var sql = "select id from supplier_authority where supplier_admin_id = ? "
    logger.debug("=======inside the ==========checkSubsupplierAuthority===============");

    var stat = multiConnection[dbName].query(sql,[subsupplierId],function(err,result)
    {
        logger.debug("=============checkSubsupplierAuthority===============",stat.sql);
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){
                callback(null);
            }
            else{
                sendResponse.sendErrorMessage(constant.responseMessage.NO_SECTION_ASSIGNED, res, constant.responseStatus.SOME_ERROR);
            }
        }

    })

}

function makeSubsupplierActiveOrNotActive(res,status,subsupplierId,callback) {
    var sql = "update supplier_admin set is_active = ? where id = ?";
    multiConnection[dbName].query(sql,[status,subsupplierId],function(err,result)
    {
        if(err){
            console.log("bakfasassda",err)
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null);
        }

    })

}

function getSingleSubsupplierDataForSupplierAdmin(dbName,res, subsupplierId, cb) {
    var result1;
    var result2;
    var check;

    async.waterfall([
        function (cb) {
            async.parallel([
                function (cb1) {
                    var sql = "select sd.id,sd.email,sd.is_active,sa.supplier_section_id,ss.section_name,ss.section_category_id,sscat.section_category_name from supplier_admin sd ";
                    sql += " join supplier_authority sa on sd.id = sa.supplier_admin_id join supplier_sections ss on sa.supplier_section_id=ss.id ";
                    sql += " join supplier_section_category sscat on ss.section_category_id=sscat.id where sd.id = ? ";
                    multiConnection[dbName].query(sql, [subsupplierId], function (err, reply) {
                        if (err) {
                            console.log('error1==========>',err);
                            sendResponse.somethingWentWrongError(res);
                        } else if (reply.length) {
                            result1 = reply;
                            check = 1;
                            cb1(null);
                        } else {
                            var sql = "select id,email,is_active from supplier_admin where id  = ? ";
                            multiConnection[dbName].query(sql, [subsupplierId], function (err2, reply2) {
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
                    var sql = "select ss.id,ss.section_name,ss.section_category_id,ssc.section_category_name from supplier_sections ss join supplier_section_category ssc on ss.section_category_id = ssc.id";
                    multiConnection[dbName].query(sql, [], function (sqlErr, sqlReply) {
                        if (sqlErr) {
                            console.log('error2=========>',sqlErr);
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            result2 = sqlReply;
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

            if (check == 1) {
                var count = 0;
                for (var i = 0; i < 6; i++) {
                    (function (i) {
                        console.log("value of i1 from second==="+i);
                        switch (i) {
                            case 0 :
                                for (var j = 0; j < 10; j++) {
                                    (function (j) {
                                        var length1 = result1.length;
                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                if (result2[count].id == result1[k].supplier_section_id) {
                                                    section.section_name = result2[count].sections_name;
                                                    section.section_id = result2[count].id;
                                                    section.is_assigned = 1;
                                                    assignedCheck = true;
                                                    home.push(section);
                                                    //console.log('home------->',JSON.stringify(home));
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
                                        if (j == 9) {
                                            data[i] = {
                                                "category_id": 1,
                                                "category_name": "HOME",
                                                "category_data": home
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 1 :
                                for (var j = 0; j < 5; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].supplier_section_id) {
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
                                        if (j == 4) {
                                            data[i] = {
                                                "category_id": 2,
                                                "category_name": "PROFILE",
                                                "category_data": profile
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 2 :
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {

                                        var length1 = result1.length;

                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].supplier_section_id) {
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
                                        if (j == 3) {
                                            data[i] = {
                                                "category_id": 3,
                                                "category_name": "PRODUCTION",
                                                "category_data": production
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 3 :
                                for (var j = 0; j < 3; j++) {
                                    (function (j) {
                                        var length1 = result1.length;
                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].supplier_section_id) {
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
                                        if (j == 2) {
                                            data[i] = {
                                                "category_id": 4,
                                                "category_name": "ORDERS",
                                                "category_data": orders
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 4 :
                               // console.log("result1..",result1);
                             //   console.log("result2..",result2);
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {
                                        var length1 = result1.length;
                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                console.log("value of k from second==="+k);
                                                console.log("value of resss from second==="+result2[count].id,result1[k].supplier_section_id);
                                                //console.log("value of k from second==="+k);
                                                if (result2[count].id == result1[k].supplier_section_id) {
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
                                        console.log("value of j from second==="+j);
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
                            case 5 :
                                console.log("..start..");
                                for (var j = 0; j < 6; j++) {
                                    (function (j) {
                                        var length1 = result1.length;
                                        var assignedCheck = false;
                                        for (var k = 0; k < length1; k++) {
                                            (function (k) {
                                                var section = {};
                                                console.log("value of k from second==="+k);
                                                console.log("value of resss from second==="+result2[count].id,result1[k].supplier_section_id);
                                                if (result2[count].id == result1[k].supplier_section_id) {
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
                            default :
                                break;
                        }
                        if (i == 5) {
                            cb(null, data);
                        }
                    }(i))
                }

            }
            else {
                var count = 0;
                for (var i = 0; i < 6; i++) {
                    (function (i) {
                        console.log("value of i2 from second==="+i);
                        switch (i) {
                            case 0 :
                                for (var j = 0; j < 10; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        home.push(section);
                                        count++;
                                        if (j == 9) {
                                            data[i] = {
                                                "category_id": 1,
                                                "category_name": "HOME",
                                                "category_data": home
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 1 :
                                for (var j = 0; j < 5; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        profile.push(section);
                                        count++;
                                        if (j == 4) {
                                            data[i] = {
                                                "category_id": 2,
                                                "category_name": "PROFILE",
                                                "category_data": profile
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 2 :
                                for (var j = 0; j < 4; j++) {
                                    (function (j) {
                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        production.push(section);
                                        count++;
                                        if (j == 3) {
                                            data[i] = {
                                                "category_id": 3,
                                                "category_name": "PRODUCTION",
                                                "category_data": production
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 3 :
                                for (var j = 0; j < 3; j++) {
                                    (function (j) {


                                        var section = {};
                                        section.section_name = result2[count].sections_name;
                                        section.section_id = result2[count].id;
                                        section.is_assigned = 0;
                                        orders.push(section);

                                        count++;
                                        if (j == 2) {
                                            data[i] = {
                                                "category_id": 4,
                                                "category_name": "ORDERS",
                                                "category_data": orders
                                            };
                                        }
                                    }(j))
                                }
                                break;
                            case 4 :
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
                            case 5 :
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


                            default :
                                break;
                        }
                        if (i == 5) {
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
            cb(null, response1);
        }

    })

}

// function getId(dbName,res,id,cb){
//     var sql='select supplier_id from supplier_admin where id=?';
//     multiConnection[dbName].query(sql,[id],function (err,id) {
//         if(err)
//         {
//             console.log('error------',err);
//             sendResponse.somethingWentWrongError(res);

//         }
//         else {
//             //console.log('result-----',id);
//             cb(null,id);
//         }
//     })}
function getId(dbName, res, id, cb) {
        var sql = 'select supplier_id from supplier_admin where id=?';
        multiConnection[dbName].query(sql, [id], function (err, result) {
            if (err) {
                console.log('error------', err);
                sendResponse.somethingWentWrongError(res);
    
            }
            else {
                //console.log('result-----',id);
                if (result.length) {
                    cb(null,result);
                } else {
                    var sql = 'select supplier_id from supplier_branch where id=?';
                    multiConnection[dbName].query(sql, [id], function (err, result) {
                        if (err) {
                            console.log('error------', err);
                            sendResponse.somethingWentWrongError(res);
    
                        }
                        else {
                            //console.log('result-----',id);
                            if (result.length){
                                cb(null, result);
                            }else{
                                sendResponse.somethingWentWrongError(res);
                            }
                        }
                    })
                }
    
            }
        })
    }
