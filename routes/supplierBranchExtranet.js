/**
 * Created by cbl102 on 24/8/16.
 */
exports.checkAppVersion = function (req, res) {
    var deviceType;
    var appVersion;
    async.auto({
        checkValues: function (cb) {
            if (!req.body.deviceType) {
                var msg = "device type not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.appVersion) {
                var msg = "app version not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (req.body && req.body.deviceType && req.body.appVersion) {
                deviceType = req.body.deviceType;
                appVersion = req.body.appVersion;
                cb(null);

            }
        },
        checkAppVersion: ['checkValues', function (cb) {
            checkSupplierBranchAppVersion(res, deviceType, appVersion, cb);

        }]
    }, function (err, response) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(response.checkAppVersion, constant.responseMessage.SUCCESS, res, 200);
        }

    })

}

exports.supplierBranchLoginToApp = function (req, res) {
    var email;
    var password;
    var deviceToken;
    var deviceType;
    var languageId;
    var branchId;
    var details = {};
    var accessToken;
    async.auto({
        getValues: function (cb) {
            if (!(req.body.email)) {
                var msg = "email not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.password)) {
                var msg = "password not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.deviceToken)) {
                var msg = "device token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.deviceType) {
                var msg = "device type not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (req.body && req.body.email && req.body.password && req.body.deviceToken && req.body.deviceType && req.body.languageId) {
                email = req.body.email;
                password = req.body.password;
                deviceToken = req.body.deviceToken;
                deviceType = req.body.deviceType;
                languageId = req.body.languageId;
                cb();
            } else {
                var msg = "something";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        verifyValues: ['getValues', function (cb) {
            var password2 = md5(password);
            var sql = "select id,is_deleted,is_live from supplier_branch where email = ? and password = ? ";
            multiConnection[dbName].query(sql, [email,password2], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        if (result[0].is_live == 0) {
                            if (req.body.languageId == 14) {
                                var msg = "This branch is not live";
                            } else {
                                var msg = "هذا الفرع لا يعيش";
                            }
                            sendResponse.sendErrorMessage(msg, res, 400);
                        }
                        else {
                            branchId = result[0].id;
                            cb(null, result[0].id);
                        }

                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "email id and password not correct";
                        } else {
                            var msg = " المرور غير صحيحة الإلكتروني وكلمة معرف البريد";
                        }
                        sendResponse.sendErrorMessage(msg, res, 400);
                    }
                }
            })
        }],
        updateAccessToken: ['verifyValues', function (cb) {
            accessToken = func.encrypt(req.body.email + new Date());
            var sql = "update supplier_branch set access_token = ?,device_token = ?,device_type = ? where id = ?";
            multiConnection[dbName].query(sql, [accessToken,deviceToken, deviceType, branchId], function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    cb(null);
                }
            })

        }],
        getSupplierData: ['updateAccessToken', function (cb) {
            getSupplierBranchDashboardData(res, branchId, accessToken, languageId, function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = result;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })
}

exports.accessTokenLogin = function (req, res) {
    var deviceToken;
    var deviceType;
    var languageId;
    var branchId;
    var details = {};
    var accessToken;
    var email;
    async.auto({
        getValues: function (cb) {
            if (!(req.body.accessToken)) {
                var msg = "access token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (!(req.body.deviceToken)) {
                var msg = "device token not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.deviceType) {
                var msg = "device type not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }
            if (!req.body.languageId) {
                var msg = "language id not found";
                return sendResponse.sendErrorMessage(msg, res, 400);
            }

            if (req.body && req.body.accessToken && req.body.deviceToken && req.body.deviceType && req.body.languageId) {
                accessToken = req.body.accessToken;
                deviceToken = req.body.deviceToken;
                deviceType = req.body.deviceType;
                languageId = req.body.languageId;
                cb(null);
            } else {
                var msg = "something went wrong";
                return sendResponse.sendErrorMessage(msg, res, 500);
            }
        },
        verifyValues: ['getValues', function (cb) {
            var sql = " select id,is_live,email from supplier_branch where access_token = ? limit 1";
            multiConnection[dbName].query(sql, [accessToken], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(reply);
                } else {
                    if (result.length) {
                        if (result[0].is_active == 0) {
                            if (req.body.languageId == 14) {
                                var msg = "This branch is not live";
                            } else {
                                var msg = "هذا الفرع لا يعيش";
                            }
                            sendResponse.sendErrorMessage(msg, res, 400);
                        }
                        else {
                            email = result[0].email;
                            supplierId = result[0].id;
                            cb(null, result[0].id);
                        }

                    } else {
                        if (req.body.languageId == 14) {
                            var msg = "Invalid access token";
                        } else {
                            var msg = "تصريح الدخول غير صالح";
                        }
                        sendResponse.sendErrorMessage(msg, res, 401);
                    }
                }
            })
        }],
        updateAccessToken: ['verifyValues', function (cb) {
            accessToken = func.encrypt(email + new Date());
            var sql = "update supplier set access_token = ?,device_token = ?,device_type = ? where id = ? limit 1";
            multiConnection[dbName].query(sql, [accessToken, deviceToken, deviceType, supplierId], function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    cb(null);
                }
            })

        }],
        getSupplierData: ['updateAccessToken', function (cb) {
            getSupplierDashboardData(res, supplierId, accessToken, languageId, function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    details = result;
                    cb(null);
                }

            });
        }]
    }, function (err, response) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            sendResponse.sendSuccessData(details, constant.responseMessage.SUCCESS, res, 200);
        }

    })

}


function checkSupplierBranchAppVersion(res, deviceType, appVersion, callback) {
    var appData = {};

    async.auto({
        'getAppVersion': function (cb) {
            AppVersion(res, deviceType, function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                }
                else {
                    appData = result;
                    cb(null);
                }

            });
        },
        checkAppVersion: ['getAppVersion', function (cb) {

            checkAppVersion(res, appData, appVersion, deviceType, cb);
        }]

    }, function (err, response) {
        if (err) {
            var msg = "something went wrong";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            callback(null, response.checkAppVersion);
        }

    })
}

function AppVersion(res, deviceType, callback) {
    if (deviceType == 0) {
        var sql = "select android_version,is_forced_android from user_app_version where type = ? limit 1";
        multiConnection[dbName].query(sql, [0], function (err, result) {
            if (err) {
                var msg = "something went wrong";
                sendResponse.sendErrorMessage(msg, res, 500);
            }
            else {

                var data = {};
                data.version = result[0].android_version;
                data.is_forced = result[0].is_forced_android;
                callback(null, data);

            }

        })
    }
    else {
        var sql = "select ios_version,is_forced_ios from user_app_version where type = ? limit 1";
        multiConnection[dbName].query(sql, [0], function (err, result) {
            if (err) {
                var msg = "something went wrong";
                sendResponse.sendErrorMessage(msg, res, 500);
            }
            else {
                var data = {};
                data.version = result[0].ios_version;
                data.is_forced = result[0].is_forced_ios;
                callback(null, data);
            }
        })
    }

}

function checkAppVersion(res, appData, appVersion, deviceType, callback) {
    var data = {};
    if (appData.version > appVersion) {
        data.is_update_required = 1;
        data.is_forced = appData.is_forced;
        callback(null, data);
    }
    else {
        data.is_update_required = 0;
        data.is_forced = appData.is_forced;
        callback(null, data);
    }

}

function getSupplierBranchDashboardData(res, branchId, accessToken, languageId, callback) {
    async.parallel([
        function (cb1) {
            getSupplierBranchTodayRevenue(res, branchId,cb1);
        },
        function (cb1) {
            getSupplierBranchName(res, branchId, languageId, cb1);
        },
    ], function (err, response) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, reply, 500);
        } else {
            var data = {};
            data.branchId = branchId;
            data.access_token = accessToken;
            data.revenue = response[0];
            data.name = response[1].name;
            data.is_live = response[1].is_live;
            callback(null, data);

        }
    })
}

function getSupplierBranchTodayRevenue(res,branchId,callback) {
    var sql = "select if (sum(`net_amount`) IS NULL,0,sum(net_amount)) as revenue from orders where DATE(`created_on`) = curdate() and supplier_branch_id = ? ";
    multiConnection[dbName].query(sql, [branchId], function (error, reply) {
        if (error) {
            console.log("error from getSupplierTodayRevenue " + error);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (reply.length) {
            callback(null, reply[0].revenue);
        } else {
            callback(null, 0);
        }
    })
}

function getSupplierBranchName(res, branchId, languageId, callback) {
    var sql = "select sml.name,s.is_live,from supplier_branch s ";
    sql += " join supplier_branch_ml sml on s.id = sml.supplier_id where s.id = ? and sml.language_id = ? ";
    multiConnection[dbName].query(sql, [branchId, languageId], function (err, response) {
        if (err) {
            console.log("error from Name",err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else if (response.length) {
            callback(null, response[0]);
        } else {
            var msg = "Something went wrong";
            sendResponse.sendErrorMessage(msg, res, 500);
        }

    })

}
