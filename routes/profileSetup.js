/**
 * Created by Paras on 3/2/16.
 */

var md5 = require('md5');
var async = require('async');
var func = require('./commonfunction.js');
var loginFunctions = require('./loginFunctions.js');
var sendResponse = require('./sendResponse.js');
var constant = require('./constant.js');


/*
 * ------------------------------------------------------
 * Add language
 * Input:Language name, access token
 * Output: Success Message or Error
 * ------------------------------------------------------
 */

exports.addLanguage = function (req, res) {

    var accessToken = req.body.accessToken;
    var languageName = req.body.languageName;
    var manValues = [accessToken, languageName];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
        ], function (error, adminId) {

            var sql = "SELECT `language_code` FROM `language` ORDER BY id DESC LIMIT 1"
            multiConnection[req.dbName].query(sql, function (err, resultLanguage) {
                if (err) {
                    console.log(err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    var codeLength = resultLanguage.length;

                    if (codeLength) {
                        //console.log(resultLanguage[0].language_code);
                        var newCode = resultLanguage[0].language_code + 1;
                        insertLanguage(req.dbName,languageName, newCode, adminId, res);

                    }
                    else {
                        insertLanguage(req.dbName,languageName, 101, adminId, res);
                    }
                }

            })
        }
    );

}


/*
 * ------------------------------------------------------
 * Function to insert the languages into the language table with language name,language code
 * and setting the default language 1 or 0
 * Input:Language name, language unique code
 * Output: Error or response containing all language related data
 * ------------------------------------------------------
 */
function insertLanguage(dbName,languageName, languageCode, adminId, res) {
    //console.log(languageCode);
    var sql = "insert into language (language_name,language_code,is_live) VALUES (?,?,?) ";
    multiConnection[dbName].query(sql, [languageName, languageCode, 0], function (err, languageAdded) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sqlSelect = "select language_name,id,default_language,`is_live` FROM language "
            multiConnection[dbName].query(sqlSelect, function (err, getLanguage) {
                if (err) {
                    console.log(err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    var text = "Language " + languageName + " added with id " + languageAdded.insertId;
                    var url = baseUrl + "/add_language";

                    async.waterfall([
                        function (cb) {
                            func.insertAdminActions(dbName,res, cb, adminId, text, url);
                        }
                    ], function (error, result) {
                        if (error) {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            sendResponse.sendSuccessData(getLanguage, constant.responseMessage.ADD_LANGUAGE, res, constant.responseStatus.SUCCESS);
                        }

                    })

                }

            })

        }

    })

}


/*
 * ------------------------------------------------------
 * View all the added languages
 * Input: access token
 * Output: Language Names, language ids, live status and default language
 * ------------------------------------------------------
 */


exports.getLanguages = function (req, res) {

    //console.log(req.originalUrl);

    var accessToken = req.body.accessToken;
    var manValues = [accessToken];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
        ], function (callback) {

            var sqlSelect = "select language_name,id,default_language,is_live FROM language "
            multiConnection[req.dbName].query(sqlSelect, function (err, getLanguage) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    sendResponse.sendSuccessData(getLanguage, constant.responseMessage.GET_LANGUAGE, res, constant.responseStatus.SUCCESS)
                }

            })

        }
    );

}


/*
 * ------------------------------------------------------
 * Make default language/change its status
 * Input: access token,language id(which is to be set as default language)
 * Output: success/error
 * ------------------------------------------------------
 */


exports.makeDefaultLanguage = function (req, res) {

    var accessToken = req.body.accessToken;
    var languageId = req.body.languageId;
    var manValues = [accessToken, languageId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            }

        ], function (error, adminId) {

            var sql = "UPDATE language SET `default_language`=? WHERE `id`=? LIMIT 1"
            multiConnection[req.dbName].query(sql, [1, languageId], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    var sql2 = "UPDATE language SET `default_language`=? WHERE `id`!=?"
                    multiConnection[req.dbName].query(sql2, [0, languageId], function (err, resultUpdate) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            var text = "Language with id " + languageId + " is made default language ";
                            var url = baseUrl + +"/make_default_language";
                            async.waterfall([
                                function (cb) {
                                    func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                }
                            ], function (error, result) {

                                var data = {};
                                sendResponse.sendSuccessData(data, constant.responseMessage.DEFUALT_LANGUAGE, res, constant.responseStatus.SUCCESS);

                            })
                        }
                    })
                }
            })
        }
    );

}


/*
 * ------------------------------------------------------
 * Add country
 * Input:access token, country name, language id,section id
 * example input parameters: access_token="dbsdhfbsdbfds"
 *                           country_name ="Dubai,दुबई*India,भारत"
 *                           language_id ="14,15*14,15"
 *                           section_id ="22"
 * (* is used to separate different countries and comma is used to separate country names in different
 *   languages of same country)
 *
 * Output: Success Message or Error
 * ------------------------------------------------------
 */

exports.addCountry = function (req, res) {

    var accessToken = req.body.accessToken;
    var countryName = req.body.countryName;
    var languageId = req.body.languageId.toString();
    var sectionId = req.body.sectionId.toString();
    var manValues = [accessToken, countryName, languageId, sectionId];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
        ], function (error, adminId) {

            var countryNames = countryName.split("*");
            //console.log("countrynames----------" + countryNames);
            var languageIds = languageId.split("*");

            for (var i = 0; i < countryNames.length; i++) {
                (function (i) {
                    var countryName1 = countryNames[i].split("#");
                    var languageId1 = languageIds[i].split("#");

                    var sql2 = "select id from country where name LIKE '" + countryName1[0] + "' and is_deleted =?";
                    multiConnection[req.dbName].query(sql2, [0],function (err, result2) {
                        if (result2.length) {
                            if (i == countryNames.length - 1) {
                                var data = {};
                                sendResponse.sendSuccessData(data, constant.responseMessage.COUNTRY_ADDED, res, constant.responseStatus.SUCCESS);
                            }
                        }
                        else {
                            var sql = "insert into country(name) values(?)"
                            multiConnection[req.dbName].query(sql, [countryName1[0]], function (err, countryAdded) {
                                console.log(err);
                                var countryId = countryAdded.insertId;
                                var values = [];
                                var insertString = "(?,?,?),";
                                var queryString = "";
                                for (var j = 0; j < countryName1.length; j++) {
                                    (function (j) {
                                        values.push(languageId1[j], countryName1[j], countryId);
                                        queryString = queryString + insertString;
                                        if (j == countryName1.length - 1) {
                                            queryString = queryString.substring(0, queryString.length - 1);
                                            var sql1 = "insert into country_ml(language_id,name,country_id) values " + queryString;
                                            multiConnection[req.dbName].query(sql1, values, function (err, countries) {
                                                console.log(err);
                                                if (i == countryNames.length - 1) {
                                                    var text = "Country " + countryName + " added"
                                                    var url = baseUrl + +"/add_country";
                                                    async.waterfall([
                                                        function (cb) {
                                                            func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                        }
                                                    ], function (error, result) {
                                                        var data = {};
                                                        sendResponse.sendSuccessData(data, constant.responseMessage.COUNTRY_ADDED, res, constant.responseStatus.SUCCESS);

                                                    })
                                                }
                                            })
                                        }

                                    }(j))

                                }

                            })
                        }

                    })

                }(i))

            }

        }
    );
}


/*
 * ------------------------------------------------------
 * function to check the authorities of the admin during any access of section
 * Input:admin id, section id
 * Output: Success Message or Error
 * ------------------------------------------------------
 */
checkforAuthorityofThisAdmin = function (dbName,id, sectionId, res, cb) {
    //console.log("Inside authority check fn");
    var sql = "SELECT `is_superadmin`,`is_active` FROM admin where id=? limit 1 "
    multiConnection[dbName].query(sql, [id], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (result.length) {
                if (result[0].is_superadmin == 1) {

                    if (result[0].is_active == 1) {
                        //console.log("from here")
                        return cb(null, id);
                    }
                    else {
                        var data = {};
                        sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
                    }


                }
                else {
                    if (result[0].is_active == 1) {
                        var sql = "select id from admin_authority where section_id=? && admin_id=? limit 1"
                        multiConnection[dbName].query(sql, [sectionId, id], function (err, checkAuthority) {
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {
                                if (checkAuthority.length) {
                                    return cb(null, id);
                                }
                                else {
                                    var data = {};
                                    sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
                                }
                            }

                        })
                    }
                    else {
                        var data = {};
                        sendResponse.sendSuccessData(data, constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.NOT_ACTIVE);
                    }
                }
            }
            else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.INVALID_ACCESS_TOKEN, res, constant.responseStatus.INVALID_ACCESS_TOKEN);
            }
        }

    })

}


/*
 * ------------------------------------------------------
 * List all the added countries which are not deleted
 * Input:access token,section id
 * Output: List of countries added
 * ------------------------------------------------------
 */

exports.listCountry = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(dbName,id, sectionId, res, cb);
            },
            function (id, cb) {
                loginFunctions.countryProfile(res, cb);
            },
        ], function (error, callback) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(callback, constant.responseMessage.LIST_OF_COUNTRIES, res, constant.responseStatus.SUCCESS);
            }


        }
    );

}


/*
 * ------------------------------------------------------
 * Make country live or not
 * Input:access token,section id, status(1: live),country id
 * Output: Success/Error
 * ------------------------------------------------------
 */
exports.makeCountryLive = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var countryId = req.body.countryId;
    var status = req.body.status;
    var country=countryId.split("#");
    var manValues = [accessToken, status, sectionId, countryId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            }
        ], function (error, adminId) {
        country=country.toString();
        var sql = "UPDATE country SET is_live=? WHERE id IN ("+country+")";
            multiConnection[req.dbName].query(sql, [status], function (err) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (status == 0) {
                        var text = "Country with id " + country + " is made unlive";
                        var url = baseUrl +"/make_country_live";
                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.COUNTRY_IS_NOT_MADE_LIVE, res, constant.responseStatus.SUCCESS);
                        })
                    }
                    else {
                        var text = "Country with id " + country + " is made live";
                        var url = baseUrl + "/make_country_live";
                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.COUNTRY_MADE_LIVE, res, constant.responseStatus.SUCCESS);
                        })
                    }
                }

            })

        }
    );

}


/*
 * ------------------------------------------------------
 * Delete country
 * Input:access token,section id,country id
 * (if country id ==1, then country cannot be deleted(Dubai))
 * Output: success/error
 * ------------------------------------------------------
 */


exports.deleteCountry = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var countryId = req.body.countryId;
    var manValues = [accessToken, sectionId, countryId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
            function (adminId, cb) {
                var country=countryId.split('#').toString();
                deleteCountry(req.dbName,res, country, cb);
            }
        ], function (error, response) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.COUNTRY_DELETED, res, constant.responseStatus.SUCCESS);
            }

        }
    );

}


/*
 * ------------------------------------------------------
 * Edit country name
 * Input:access token,country id, language id , section id,country name
 * (country names and language ids should be comma separated and should have one to
 *  one correspondance)
 * Output: success/error
 * ------------------------------------------------------
 */
exports.editCountryName = function (req, res) {

    var accessToken = req.body.accessToken;
    var languageId = req.body.languageId.toString();
    var countryId = req.body.countryId.toString();
    var countryName = req.body.countryName;
    var sectionId = req.body.sectionId.toString();
    var manValues = [accessToken, languageId, sectionId, countryId, countryName];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (id, cb) {

                checkforDefaultLanguage(req.dbName,id, res, cb);
            },
        ], function (err, adminId, defaultLanguageId) {

            //console.log(defaultLanguageId);

            var countryNames = countryName.split(",");
            var languageIds = languageId.split(",");

            var countryLength = countryNames.length;
            for (var i = 0; i < countryLength; i++) {
                (function (i) {
                    if (languageIds[i] == defaultLanguageId) {
                        var sql = "update country set name=? where id=? limit 1"
                        multiConnection[req.dbName].query(sql, [countryNames[i], countryId], function (err, resultUpdate) {

                            console.log(err);
                            var sql = "update country_ml set name=? where language_id=? && country_id=? limit 1"
                            multiConnection[req.dbName].query(sql, [countryNames[i], languageIds[i], countryId], function (err, resultUpdate) {
                                console.log(err);
                                if (i == countryLength - 1) {
                                    var text = "Country with id " + countryId + " is edited";
                                    var url = baseUrl + +"/edit_country_name";
                                    async.waterfall([
                                        function (cb) {
                                            func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                        }
                                    ], function (error, result) {
                                        var data = {};
                                        sendResponse.sendSuccessData(data, constant.responseMessage.COUNTRY_NAME_CHANGED, res, constant.responseStatus.SUCCESS);
                                    })
                                }
                            })

                        })
                    }
                    else {
                        var sql = "update country_ml set name=? where language_id=? && country_id=? limit 1"
                        multiConnection[req.dbName].query(sql, [countryNames[i], languageIds[i], countryId], function (err, resultUpdate) {
                            console.log(err);
                            if (i == countryLength - 1) {
                                var text = "Country with id " + countryId + " is edited";
                                var url = baseUrl + +"/edit_country_name";
                                async.waterfall([
                                    function (cb) {
                                        func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                    }
                                ], function (error, result) {
                                    var data = {};
                                    sendResponse.sendSuccessData(data, constant.responseMessage.COUNTRY_NAME_CHANGED, res, constant.responseStatus.SUCCESS);

                                })
                            }

                        })
                    }


                }(i))
            }


        }
    );
}


/*
 * ------------------------------------------------------
 * function to check the default language while editing country name
 * Input: admin id
 * Output: Success Message or Error
 * ------------------------------------------------------
 */

checkforDefaultLanguage = function (dbName,id, res, cb) {

    var sql = "select id from language where default_language=? limit 1"
    multiConnection[dbName].query(sql, [1], function (err, reply) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            return cb(null, id, reply[0].id);
        }

    })

}


exports.getCountryCityList = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var countryId = req.body.countryId;
    var manValues = [accessToken, sectionId, countryId];
    //console.log(manValues + "request parameters")

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
        },
        function (cb) {
            loginFunctions.listCountryCity(req.dbName,res, cb, countryId);
        }
    ], function (error, result) {
        if (error) {

        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    })

}


exports.listZonesAccordingToCityId = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var cityId = req.body.cityId;
    var manValues = [accessToken, sectionId, cityId];
    //console.log(manValues + "request parameters")

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValues, cb);
        },
        function (cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (id, cb) {
            checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
        },
        function (adminId, cb) {
            loginFunctions.listZonesOfParticularCity(req.dbName,res, cb, cityId);
        }
    ], function (error, result) {
        if (error) {
            console.log(error);
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    })

}


/*
 * ------------------------------------------------------
 * Add city
 * Input:access token,country ids, city names, language ids,section id
 *EG: access_token = "knsjkfgdfhgbchjbhdsbfhdf"
 *    country_id = "13,14"
 *    city_name  = "DELHI,दिल्ली*HARYANA,हरयाणा$PUNJAB,पंजाब"
 *    language_id = "14,15*14,15$14,15"
 *    section_id = "18"
 *
 *
 * Output: success/error
 * ------------------------------------------------------
 */
exports.addCity = function (req, res) {

    var accessToken = req.body.accessToken;
    var countryId = req.body.countryId.toString();
    var cityName = req.body.cityName;
    var languageId = req.body.languageId.toString();
    var sectionId = req.body.sectionId.toString();
    var manValues = [accessToken, languageId, sectionId, countryId, cityName];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (id, cb) {
                checkforDefaultLanguage(req.dbName,id, res, cb);
            },
        ], function (err, adminId, defaultLanguageId) {

            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var countryIds = countryId.split(",");
                var cityNames = cityName.split("$");
                var languageIds = languageId.split("$");
                for (var i = 0; i < countryIds.length; i++) {
                    (function (i) {
                        var cityNames1 = cityNames[i].split("*");
                        var languageIds1 = languageIds[i].split("*");

                        for (var j = 0; j < cityNames1.length; j++) {

                            (function (j) {
                                var cityNameInsert = cityNames1[j].split("#");

                                //console.log(cityNameInsert[0]);
                                var sql3 = "select id from city where name LIKE '" + cityNameInsert[0] + "'  and is_deleted =?";
                                multiConnection[req.dbName].query(sql3, [0],function (err, result3) {
                                    if (result3.length) {
                                        if (j == cityNames1.length - 1 && i == countryIds.length - 1) {
                                            var data = {};
                                            sendResponse.sendSuccessData(data, constant.responseMessage.ADD_CITY, res, constant.responseStatus.SUCCESS);
                                        }
                                    }
                                    else {
                                        var sql = "insert into city(country_id,name) values(?,?)"
                                        multiConnection[req.dbName].query(sql, [countryIds[i], cityNameInsert[0]], function (err, insertCity) {
                                            console.log(err);
                                            var cityId = insertCity.insertId;

                                    var cityNames2 = cityNames1[j].split("#");
                                    var languageIds2 = languageIds1[j].split("#");
                                    for (var k = 0; k < cityNames2.length; k++) {
                                        (function (k) {
                                            var sql2 = "insert into city_ml(language_id,city_id,name) values(?,?,?)"
                                            multiConnection[req.dbName].query(sql2, [languageIds2[k], cityId, cityNames2[k]], function (err, insertCityMl) {
                                                console.log(err);
                                                if (k == cityNames2.length - 1 && j == cityNames1.length - 1 && i == countryIds.length - 1) {

                                                    var text = "City with NAMES " + cityName + " is added";
                                                    var url = baseUrl + +"/add_city";
                                                    async.waterfall([
                                                        function (cb) {
                                                            func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                        }
                                                    ], function (error, result) {
                                                        var data = {};
                                                        sendResponse.sendSuccessData(data, constant.responseMessage.ADD_CITY, res, constant.responseStatus.SUCCESS);
                                                    })
                                                }

                                                    })

                                                }(k))
                                            }
                                        })

                                    }

                                })
                            }(j))
                        }

                    }(i))

                }


            }

        }
    );


}


/*
 * ------------------------------------------------------
 * List all the added cities which are not deleted
 * Input:access token,section id
 * Output: List of cities added
 * ------------------------------------------------------
 */
exports.listCity = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var countryId = req.body.countryId;
    var manValues = [accessToken, sectionId, countryId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (id, cb) {
                loginFunctions.cityProfile(req.dbName,res, countryId, cb);
            },
        ], function (error, callback) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(callback, constant.responseMessage.LIST_OF_CITIES, res, constant.responseStatus.SUCCESS);
            }


        }
    );


}


/*
 * ------------------------------------------------------
 * Delete City
 * Input:access token,section id,city id
 * Output: success/error
 * ------------------------------------------------------
 */
exports.deleteCity = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var cityId = req.body.cityId;
    var manValues = [accessToken, sectionId, cityId];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
            function (adminId, cb) {
                var city=cityId.split('#').toString();
                updateCityDeletion(req.dbName,res, city, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res)
            }
            else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.CITY_DELETED, res, constant.responseStatus.SUCCESS);

            }
        }
    );

}


/*
 * ------------------------------------------------------
 * Make city live or not
 * Input:access token,section id, status(1: live),city id
 * Output: Success/Error
 * ------------------------------------------------------
 */
exports.makeCityLive = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var cityId = req.body.cityId;
    var status = req.body.status;
    var city=cityId.split("#");
    var manValues = [accessToken, sectionId, cityId, status];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
        ], function (error, adminId) {
            city=city.toString();
            var sql = "UPDATE city SET is_live =? WHERE id IN ("+city+") ";
            multiConnection[req.dbName].query(sql, [status], function (err) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log(sql)
                    if (status == 0) {
                        var text = "City with id " + city + " is made unlive";
                        var url = baseUrl + +"/make_city_live";
                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.CITY_IS_NOT_MADE_LIVE, res, constant.responseStatus.SUCCESS);

                        })
                    }
                    else {
                        var text = "City with id " + city + " is made live";
                        var url = baseUrl + +"/make_city_live";
                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.CITY_MADE_LIVE, res, constant.responseStatus.SUCCESS);
                        })
                    }
                }

            })
        }
    );

}


/*
 * ------------------------------------------------------
 * Delete All cities of a particular country
 * Input:access token,section id,country id
 * Output: success/error
 * ------------------------------------------------------
 */
exports.deleteAllCitiesOfCountry = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var countryId = req.body.countryId;
    var manValues = [accessToken, sectionId, countryId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
        ], function (error, adminId) {
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {

                var sql = "update city SET is_deleted=? where country_id=?"
                multiConnection[req.dbName].query(sql, [1, countryId], function (err, updateCity) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        var text = "All the cities of country id " + countryId + "are deleted";
                        var url = baseUrl + +"/delete_all_cities_of_country";
                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.ALL_CITIES_OF_COUNTRY_DELETED, res, constant.responseStatus.SUCCESS)
                        })
                    }

                })

            }
        }
    );

}


/*
 * ------------------------------------------------------
 * Edit city name
 *    access_token = "knsjkfgdfhgbchjbhdsbfhdf"
 *    city_id = "13,14",
 *    id ="21,22#25,26"
 *    city_name  = "DELHI12,दिल्ली#Haryana13,हरयाणा"
 *    language_id = "14,15#14,15"
 *    section_id = "18"
 *
 * ------------------------------------------------------
 */

exports.editCityName = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId.toString();
    var cityId = req.body.cityId.toString();
    var cityMlId = req.body.id.toString();
    var cityName = req.body.cityName;
    var languageId = req.body.languageId.toString();
    var manValues = [accessToken, languageId, sectionId, cityMlId, cityName, cityId];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (id, cb) {
                checkforDefaultLanguage(req.dbName,id, res, cb);
            },
        ], function (err, adminId, defaultLanguageId) {

            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var cityIds = cityId.split(",");
                var cityMlIds = cityMlId.split("#");
                var languageIds = languageId.split("#");
                var cityMlNames = cityName.split("#");
                for (var i = 0; i < cityIds.length; i++) {
                    (function (i) {
                        var cityMlIds1 = cityMlIds[i].split(",");
                        var languageIds1 = languageIds[i].split(",");
                        var cityMlNames1 = cityMlNames[i].split(",");
                        for (var j = 0; j < cityMlIds1.length; j++) {
                            (function (j) {

                                if (languageIds1[j] == defaultLanguageId) {
                                    var sql = "update city set name =? where id = ? limit 1"
                                    multiConnection[req.dbName].query(sql, [cityMlNames1[j], cityIds[i]], function (err, cities) {
                                        console.log(err);
                                        var sql = "update city_ml set name =? where id = ? limit 1"
                                        multiConnection[req.dbName].query(sql, [cityMlNames1[j], cityMlIds1[j]], function (err, citiesMl) {
                                            console.log(err);
                                            if (i == cityIds.length - 1 && j == cityMlIds1.length - 1) {
                                                var text = "City names  " + cityName + " are edited";
                                                var url = baseUrl + +"/edit_city_name";
                                                async.waterfall([
                                                    function (cb) {
                                                        func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                    }
                                                ], function (error, result) {
                                                    var data = {};
                                                    sendResponse.sendSuccessData(data, constant.responseMessage.CITY_NAME_CHANGED, res, constant.responseStatus.SUCCESS)
                                                })
                                            }

                                        })


                                    })
                                }
                                else {
                                    var sql = "update city_ml set name =? where id = ? limit 1"
                                    multiConnection[req.dbName].query(sql, [cityMlNames1[j], cityMlIds1[j]], function (err, cities) {
                                        console.log(err);
                                        if (i == cityIds.length - 1 && j == cityMlIds1.length - 1) {
                                            var text = "City names  " + cityName + " are edited";
                                            var url = baseUrl + +"/edit_city_name";
                                            async.waterfall([
                                                function (cb) {
                                                    func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                }
                                            ], function (error, result) {
                                                var data = {};
                                                sendResponse.sendSuccessData(data, constant.responseMessage.CITY_NAME_CHANGED, res, constant.responseStatus.SUCCESS);

                                            })
                                        }


                                    })

                                }


                            }(j))

                        }


                    }(i))
                }


            }

        }
    );
}


/*
 * ------------------------------------------------------
 * List of city ids with names for adding city/zone/area
 * Input:access token,section id
 * Output: success/error(city ids and city names)
 * ------------------------------------------------------
 */
exports.listCityNameWIthId = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var countryId = req.body.countryId;
    var manValues = [accessToken, sectionId, countryId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
        ], function (error, callback) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var sql = "select id,name from city where `is_deleted`=? && `country_id`=?"
                multiConnection[req.dbName].query(sql, [0, countryId], function (err, resultCountry) {
                    if (err) {

                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        sendResponse.sendSuccessData(resultCountry, constant.responseMessage.LIST_OF_CITIES, res, constant.responseStatus.SUCCESS);
                    }

                })
            }


        }
    );

}


/*
 * ------------------------------------------------------
 * Add zone
 * Input:access token,city ids, zone names, language ids,section id
 *EG: access_token = "knsjkfgdfhgbchjbhdsbfhdf"
 *    city_id = "13,14"
 *    zone_name  = "DELHI,दिल्ली*HARYANA,हरयाणा$PUNJAB,पंजाब"
 *    language_id = "14,15*14,15$14,15"
 *    section_id = "18"
 *
 *
 * Output: success/error
 * ------------------------------------------------------
 */
exports.addZone = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId.toString();
    var cityId = req.body.cityId.toString();
    var zoneName = req.body.zoneName;
    var languageId = req.body.languageId.toString();
    var manValues = [accessToken, sectionId, cityId, zoneName, languageId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
        ], function (error, adminId) {
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var cityIds = cityId.split(",");
                var zoneNames = zoneName.split("$");
                var languageIds = languageId.split("$");
                for (var i = 0; i < cityIds.length; i++) {
                    (function (i) {
                        var zoneNames1 = zoneNames[i].split("*");
                        var languageIds1 = languageIds[i].split("*");

                        for (var j = 0; j < zoneNames1.length; j++) {

                            (function (j) {
                                var zoneNameInsert = zoneNames1[j].split("#");

                                var sql2 = "select id from zone where name LIKE '" + zoneNameInsert[0] + "'  and is_deleted =?";
                                multiConnection[req.dbName].query(sql2,[0], function (err, result4) {
                                    if (result4.length) {
                                        if (j == zoneNames1.length - 1 && i == cityIds.length - 1) {
                                            var data = {};
                                            sendResponse.sendSuccessData(data, constant.responseMessage.ADD_ZONE, res, constant.responseStatus.SUCCESS);
                                        }
                                    }
                                    else {
                                        var sql = "insert into zone(city_id,name) values(?,?)"
                                        multiConnection[req.dbName].query(sql, [cityIds[i], zoneNameInsert[0]], function (err, insertZone) {
                                            console.log(err);
                                            var zoneId = insertZone.insertId;
                                            var zoneNames2 = zoneNames1[j].split("#");
                                            var languageIds2 = languageIds1[j].split("#");
                                            for (var k = 0; k < zoneNames2.length; k++) {
                                                (function (k) {
                                                    var sql2 = "insert into zone_ml(language_id,zone_id,name) values(?,?,?)"
                                                    multiConnection[req.dbName].query(sql2, [languageIds2[k], zoneId, zoneNames2[k]], function (err, insertCityMl) {
                                                        console.log(err);
                                                        if (k == zoneNames2.length - 1 && j == zoneNames1.length - 1 && i == cityIds.length - 1) {
                                                            var text = "Zone names  " + zoneName + " are added";
                                                            var url = baseUrl + +"/add_zone";
                                                            async.waterfall([
                                                                function (cb) {
                                                                    func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                                }
                                                            ], function (error, result) {
                                                                var data = {};
                                                                sendResponse.sendSuccessData(data, constant.responseMessage.ADD_ZONE, res, constant.responseStatus.SUCCESS);
                                                            })
                                                        }

                                                    })

                                                }(k))
                                            }
                                        })

                                    }

                                })
                            }(j))
                        }

                    }(i))

                }

            }
        }
    );
}


/*
 * ------------------------------------------------------
 * Delete Zone
 * Input:access token,section id,zone id
 * Output: success/error
 * ------------------------------------------------------
 */
exports.deleteZone = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var zoneId = req.body.zoneId;
    var manValues = [accessToken, sectionId, zoneId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
            function (adminId, cb) {
                var zone= zoneId.split('#').toString();
                updateZoneDeletion(req.dbName,res, zone, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.ZONE_DELETED, res, constant.responseStatus.SUCCESS);

            }
        }
    );

}


/*
 * ------------------------------------------------------
 * Make zone live or not
 * Input:access token,section id, status(1: live),zone id
 * Output: Success/Error
 * ------------------------------------------------------
 */
exports.makeZoneLive = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var zoneId = req.body.zoneId;
    var status = req.body.status;
    var zone=zoneId.split('#').toString();
    var manValues = [accessToken, sectionId, zoneId, status];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
        ], function (error, adminId) {

            var sql = "UPDATE zone SET is_live =? WHERE id IN ("+zone+")"
            multiConnection[req.dbName].query(sql, [status], function (err) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {

                    if (status == 0) {
                        var text = "Zone with id " + zone + " is made unlive";
                        var url = baseUrl + +"/make_zone_live";
                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.ZONE_IS_NOT_MADE_LIVE, res, constant.responseStatus.SUCCESS);

                        })
                    }
                    else {
                        var text = "Zone with id " + zone + " is made live";
                        var url = baseUrl + +"/make_zone_live";
                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.ZONE_MADE_LIVE, res, constant.responseStatus.SUCCESS);

                        })
                    }
                }

            })
        }
    );

}


/*
 * ------------------------------------------------------
 * List all the added zones which are not deleted
 * Input:access token,section id
 * Output: List of zones added
 * ------------------------------------------------------
 */
exports.listZone = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (id, cb) {
                loginFunctions.zoneProfile(res, cb);
            },
        ], function (error, callback) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(callback, constant.responseMessage.LIST_OF_ZONES, res, constant.responseStatus.SUCCESS);
            }


        }
    );


}


/*
 * ------------------------------------------------------
 * Edit zone name
 * access_token = "knsjkfgdfhgbchjbhdsbfhdf"
 *    zone_id = "13,14",
 *    id ="21,22#25,26"
 *    zone_name  = "DELHI12,दिल्ली#Haryana13,हरयाणा"
 *    language_id = "14,15#14,15"
 *    section_id = "18"
 *
 * ------------------------------------------------------
 */
exports.editZoneName = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId.toString();
    var zoneId = req.body.zoneId.toString();
    var zoneMlId = req.body.id.toString();
    var zoneName = req.body.zoneName;
    var languageId = req.body.languageId.toString();
    var manValues = [accessToken, languageId, sectionId, zoneMlId, zoneName, zoneId];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (id, cb) {
                checkforDefaultLanguage(req.dbName,id, res, cb);
            },
        ], function (err, adminId, defaultLanguageId) {

            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var zoneIds = zoneId.split(",");
                var zoneMlIds = zoneMlId.split("#");
                var languageIds = languageId.split("#");
                var zoneMlNames = zoneName.split("#");
                for (var i = 0; i < zoneIds.length; i++) {
                    (function (i) {
                        var zoneMlIds1 = zoneMlIds[i].split(",");
                        var languageIds1 = languageIds[i].split(",");
                        var zoneMlNames1 = zoneMlNames[i].split(",");
                        for (var j = 0; j < zoneMlIds1.length; j++) {
                            (function (j) {


                                if (languageIds1[j] == defaultLanguageId) {
                                    var sql = "update zone set name =? where id = ? limit 1"
                                    multiConnection[req.dbName].query(sql, [zoneMlNames1[j], zoneIds[i]], function (err, zones) {
                                        console.log(err);
                                        var sql = "update zone_ml set name =? where id = ? limit 1"
                                        multiConnection[req.dbName].query(sql, [zoneMlNames1[j], zoneMlIds1[j]], function (err, zonesMl) {
                                            console.log(err);
                                            if (i == zoneIds.length - 1 && j == zoneMlIds1.length - 1) {
                                                var text = "Zone with names " + zoneName + " are edited";
                                                var url = baseUrl + +"/edit_zone_name";
                                                async.waterfall([
                                                    function (cb) {
                                                        func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                    }
                                                ], function (error, result) {
                                                    var data = {};
                                                    sendResponse.sendSuccessData(data, constant.responseMessage.ZONE_NAME_CHANGED, res, constant.responseStatus.SUCCESS)

                                                })
                                            }

                                        })


                                    })
                                }
                                else {
                                    var sql = "update zone_ml set name =? where id = ? limit 1"
                                    multiConnection[req.dbName].query(sql, [zoneMlNames1[j], zoneMlIds1[j]], function (err, zones) {
                                        console.log(err);
                                        if (i == zoneIds.length - 1 && j == zoneMlIds1.length - 1) {
                                            var text = "Zone with names " + zoneName + " are edited";
                                            var url = baseUrl + +"/edit_zone_name";
                                            async.waterfall([
                                                function (cb) {
                                                    func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                }
                                            ], function (error, result) {
                                                var data = {};
                                                sendResponse.sendSuccessData(data, constant.responseMessage.ZONE_NAME_CHANGED, res, constant.responseStatus.SUCCESS);
                                            })
                                        }


                                    })

                                }


                            }(j))

                        }


                    }(i))
                }


            }

        }
    );
}


/*
 * ------------------------------------------------------
 * List of zone ids with names for adding area
 * Input:access token,section id
 * Output: success/error(zone ids and zone names)
 * ------------------------------------------------------
 */
exports.listZoneNameWIthId = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var cityId = req.body.cityId;
    var manValues = [accessToken, sectionId, cityId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
        ], function (error, callback) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var sql = "select id,name from zone where `is_deleted`=? && `city_id`=?"
                multiConnection[req.dbName].query(sql, [0, cityId], function (err, resultZone) {
                    if (err) {

                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        sendResponse.sendSuccessData(resultZone, constant.responseMessage.LIST_OF_ZONES, res, constant.responseStatus.SUCCESS);
                    }

                })
            }


        }
    );

}


exports.listAreasOfParticularZone = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var zoneId = req.body.zoneId;
    var manValues = [accessToken, sectionId, zoneId];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
            function (adminId, cb) {
                loginFunctions.listAreasOfParticularZone(req.dbName,res, cb, zoneId);
            }
        ], function (error, response) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(response, constant.responseMessage.LIST_OF_AREAS, res, constant.responseStatus.SUCCESS);

            }

        }
    );

}
/*
 * ------------------------------------------------------
 * Add area
 * Input:access token,city ids, zone names, language ids,section id
 *EG: access_token = "knsjkfgdfhgbchjbhdsbfhdf"
 *    city_id ="12"
 *    zone_id = "13,14"
 *    area_name  = "DELHI,दिल्ली*HARYANA,हरयाणा$PUNJAB,पंजाब"
 *    language_id = "14,15*14,15$14,15"
 *    section_id = "18"
 *
 *
 * Output: success/error
 * ------------------------------------------------------
 */
exports.addArea = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var cityId = req.body.cityId.toString();
    var zoneId = req.body.zoneId.toString();
    var areaName = req.body.areaName;
    var languageId = req.body.languageId.toString();
    var manValues = [accessToken, sectionId, zoneId, areaName, languageId, cityId];
    console.log("/...xd.fvgrgfs.d..................................",req.body)

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
        ], function (error, adminId) {
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var zoneIds = zoneId.split(",");
                var areaNames = areaName.split("$");
                var languageIds = languageId.split("$");
                for (var i = 0; i < zoneIds.length; i++) {
                    (function (i) {
                        var areaNames1 = areaNames[i].split("*");
                        var languageIds1 = languageIds[i].split("*");

                        if (zoneIds[i] == "") {
                            for (var j = 0; j < areaNames1.length; j++) {

                                (function (j) {
                                    var areaNameInsert = areaNames1[j].split("#");
                                    var sql = "insert into zone(city_id,name) values(?,?)";
                                    multiConnection[req.dbName].query(sql, [cityId, areaNameInsert[0]], function (err, insertZone) {
                                        console.log(err);
                                        var zoneId = insertZone.insertId;
                                        var areaNames2 = areaNames1[j].split(",");
                                        var languageIds2 = languageIds1[j].split(",");

                                        var sql3 = "insert into area(zone_id,name) values(?,?)";
                                        multiConnection[req.dbName].query(sql3, [zoneId, areaNameInsert[0]], function (err, insertArea) {

                                            var areaId = insertArea.insertId;
                                            for (var k = 0; k < areaNames2.length; k++) {
                                                (function (k) {
                                                    var sql2 = "insert into zone_ml(language_id,zone_id,name) values(?,?,?)"
                                                    multiConnection[req.dbName].query(sql2, [languageIds2[k], zoneId, areaNames2[k]], function (err, insertZoneMl) {
                                                        console.log(err);
                                                        var sql4 = "insert into area_ml(language_id,area_id,name) values(?,?,?)"
                                                        multiConnection[req.dbName].query(sql4, [languageIds2[k], areaId, areaNames2[k]], function (err, insertAreaMl) {
                                                            if (k == areaNames2.length - 1 && j == areaNames1.length - 1 && i == zoneIds.length - 1) {
                                                                var text = "Area with names " + areaName + " are added";
                                                                var url = baseUrl + +"/add_area";
                                                                async.waterfall([
                                                                    function (cb) {
                                                                        func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                                    }
                                                                ], function (error, result) {
                                                                    var data = {};
                                                                    sendResponse.sendSuccessData(data, constant.responseMessage.ADD_AREA, res, constant.responseStatus.SUCCESS);
                                                                })
                                                            }

                                                        })


                                                    })

                                                }(k))
                                            }
                                        })

                                    })
                                }(j))
                            }
                        }
                        else {
                            for (var j = 0; j < areaNames1.length; j++) {

                                (function (j) {
                                    var areaNameInsert = areaNames1[j].split("#");
                                    var sql2 = "select id from area where name LIKE '" + areaNameInsert[0] + "'  and is_deleted =?";
                                    multiConnection[req.dbName].query(sql2,[0], function (err, result4) {
                                        if (result4.length) {
                                            if (j == areaNames1.length - 1 && i == zoneIds.length - 1) {
                                                var data = {};
                                                sendResponse.sendSuccessData(data, constant.responseMessage.ADD_AREA, res, constant.responseStatus.SUCCESS);
                                            }
                                        }
                                        else {
                                            var sql = "insert into area(zone_id,name) values(?,?)"
                                            multiConnection[req.dbName].query(sql, [zoneIds[i], areaNameInsert[0]], function (err, insertArea) {
                                                console.log(err);
                                                var areaId = insertArea.insertId;
                                                var areaNames2 = areaNames1[j].split(",");
                                                var languageIds2 = languageIds1[j].split(",");
                                                for (var k = 0; k < areaNames2.length; k++) {
                                                    (function (k) {
                                                        var sql2 = "insert into area_ml(language_id,area_id,name) values(?,?,?)"
                                                        multiConnection[req.dbName].query(sql2, [languageIds2[k], areaId, areaNames2[k]], function (err, insertAreaMl) {
                                                            console.log(err);
                                                            if (k == areaNames2.length - 1 && j == areaNames1.length - 1 && i == zoneIds.length - 1) {
                                                                var text = "Area with names " + areaName + " are added";
                                                                var url = baseUrl + +"/add_area";
                                                                async.waterfall([
                                                                    function (cb) {
                                                                        func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                                    }
                                                                ], function (error, result) {
                                                                    var data = {};
                                                                    sendResponse.sendSuccessData(data, constant.responseMessage.ADD_AREA, res, constant.responseStatus.SUCCESS);
                                                                })
                                                            }

                                                        })

                                                    }(k))
                                                }
                                            })

                                        }

                                    })
                                }(j))
                            }
                        }


                    }(i))

                }

            }
        }
    );
}


/*
 * ------------------------------------------------------
 * Delete Area
 * Input:access token,section id,area id
 * Output: success/error
 * ------------------------------------------------------
 */
exports.deleteArea = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var areaId = req.body.areaId;
    var manValues = [accessToken, sectionId, areaId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
            function (adminId, cb) {
                var area=areaId.split('#').toString();
                updateAreaDeletion(req.dbName,res, area, cb);
            }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = {};
                sendResponse.sendSuccessData(data, constant.responseMessage.AREA_DELETED, res, constant.responseStatus.SUCCESS);

            }
        }
    );

}


/*
 * ------------------------------------------------------
 * Make area live or not
 * Input:access token,section id, status(1: live),area id
 * Output: Success/Error
 * ------------------------------------------------------
 */
exports.makeAreaLive = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var areaId = req.body.areaId;
    var status = req.body.status;
    var area=areaId.split('#').toString();
    var manValues = [accessToken, sectionId, areaId, status];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb)
            },
        ], function (error, adminId) {

            var sql = "UPDATE area SET is_live =? WHERE id IN("+area+")"
            multiConnection[req.dbName].query(sql, [status], function (err) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {

                    if (status == 0) {
                        var text = "Area with id " + areaId + " is made unlive";
                        var url = baseUrl + +"/make_area_live";

                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.AREA_IS_NOT_MADE_LIVE, res, constant.responseStatus.SUCCESS);
                        })
                    }
                    else {
                        var text = "Area with id " + areaId + " is made live";
                        var url = baseUrl + +"/make_area_live";
                        async.waterfall([
                            function (cb) {
                                func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                            }
                        ], function (error, result) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.AREA_MADE_LIVE, res, constant.responseStatus.SUCCESS);

                        })
                    }
                }

            })
        }
    );

}

/*
 * ------------------------------------------------------
 * Edit area name
 * access_token = "knsjkfgdfhgbchjbhdsbfhdf"
 *    area_id = "13,14",
 *    id ="21,22#25,26"
 *    area_name  = "DELHI12,दिल्ली#Haryana13,हरयाणा"
 *    language_id = "14,15#14,15"
 *    section_id = "18"
 *
 * ------------------------------------------------------
 */
exports.editAreaName = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId.toString();
    var areaId = req.body.areaId.toString();
    var areaMlId = req.body.id.toString();
    var areaName = req.body.areaName;
    var languageId = req.body.languageId.toString();
    var manValues = [accessToken, languageId, sectionId, areaMlId, areaName, areaId];

    console.log("**********************************",req.body);
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (id, cb) {
                checkforDefaultLanguage(req.dbName,id, res, cb);
            },
        ], function (err, adminId, defaultLanguageId) {

            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var areaIds = areaId.split(",");
                var areaMlIds = areaMlId.split("#");
                var languageIds = languageId.split("#");
                var areaMlNames = areaName.split("#");
                for (var i = 0; i < areaIds.length; i++) {
                    (function (i) {
                        var areaMlIds1 = areaMlIds[i].split(",");
                        var languageIds1 = languageIds[i].split(",");
                        var areaMlNames1 = areaMlNames[i].split(",");
                        for (var j = 0; j < areaMlIds1.length; j++) {
                            (function (j) {


                                if (languageIds1[j] == defaultLanguageId) {
                                    var sql = "update area set name =? where id = ? limit 1"
                                    multiConnection[req.dbName].query(sql, [areaMlNames1[j], areaIds[i]], function (err, areas) {
                                        console.log(err);
                                        var sql = "update area_ml set name =? where id = ? limit 1"
                                        multiConnection[req.dbName].query(sql, [areaMlNames1[j], areaMlIds1[j]], function (err, areasMl) {
                                            console.log(err);
                                            if (i == areaIds.length - 1 && j == areaMlIds1.length - 1) {
                                                var text = "Area with names " + areaName + " are edited";
                                                var url = baseUrl + +"/edit_area_name";
                                                async.waterfall([
                                                    function (cb) {
                                                        func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                    }
                                                ], function (error, result) {
                                                    var data = {};
                                                    sendResponse.sendSuccessData(data, constant.responseMessage.AREA_NAME_CHANGED, res, constant.responseStatus.SUCCESS)

                                                })
                                            }

                                        })


                                    })
                                }
                                else {
                                    var sql = "update area_ml set name =? where id = ? limit 1"
                                    multiConnection[req.dbName].query(sql, [areaMlNames1[j], areaMlIds1[j]], function (err, areas) {
                                        console.log(err);
                                        if (i == areaIds.length - 1 && j == areaMlIds1.length - 1) {
                                            var text = "Area with names " + areaName + " are edited";
                                            var url = baseUrl + +"/edit_area_name";
                                            async.waterfall([
                                                function (cb) {
                                                    func.insertAdminActions(req.dbName,res, cb, adminId, text, url);
                                                }
                                            ], function (error, result) {
                                                var data = {};
                                                sendResponse.sendSuccessData(data, constant.responseMessage.AREA_NAME_CHANGED, res, constant.responseStatus.SUCCESS);

                                            })
                                        }


                                    })

                                }


                            }(j))

                        }


                    }(i))
                }


            }

        }
    );
}


/*
 * ------------------------------------------------------
 * List all the added areas which are not deleted
 * Input:access token,section id
 * Output: List of areas added
 * ------------------------------------------------------
 */
exports.listArea = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    //console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (id, cb) {
                loginFunctions.areaProfile(res, cb);
            },
        ], function (error, callback) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(callback, constant.responseMessage.LIST_OF_AREAS, res, constant.responseStatus.SUCCESS);
            }


        }
    );


}


function deleteCountry(dbName,res, countryId, callback) {
    if (countryId == 1) {
        var data = {};
        sendResponse.sendSuccessData(data, constant.responseMessage.COUNTRY_CANT_BE_DELETED, res, constant.responseStatus.COUNTRY_CANT_BE_DELETED);
    }
    else {

        async.auto({
            one: function (cb) {
                updateCountryStatus(dbName,res, countryId, cb);
            },
            two: function (cb) {
                updateCountryCurrency(dbName,res, countryId, cb);
            },
            three: ['one', function (cb) {
                updateCountriesOfSuppliers(dbName,res, countryId, cb);
            }]
        }, function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                callback(null);
            }

        })
    }

}


function updateCityDeletion(dbName,res, cityId, callback) {
    async.auto({
        one: function (cb) {
            updateCityStatus(dbName,res, cityId, cb);
        },
        three: ['one', function (cb) {
            updateCitiesOfSuppliers(dbName,res, cityId, cb);
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })
}

function updateZoneDeletion(dbName,res, zoneId, callback) {
    async.auto({
        one: function (cb) {
            updateZoneStatus(dbName,res, zoneId, cb);
        },
        three: ['one', function (cb) {
            updateZonesOfSuppliers(dbName,res, zoneId, cb);
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })
}


function updateAreaDeletion(dbName,res, areaId, callback) {
    async.auto({
        one: function (cb) {
            updateAreaStatus(dbName,res, areaId, cb);
        },
        three: ['one', function (cb) {
            updateAreasOfSuppliers(dbName,res, areaId, cb);
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })
}

function updateCountryStatus(dbName,res, countryId, callback) {
    var sql = "UPDATE country SET is_deleted=? WHERE id IN ("+countryId+")";
    multiConnection[dbName].query(sql, [1, countryId], function (err, response) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })
}


function updateCityStatus(dbName,res, cityId, callback) {
    var sql = "UPDATE city SET is_deleted=? WHERE id IN ("+cityId+")";
    multiConnection[dbName].query(sql, [1], function (err, response) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })

}


function updateZoneStatus(dbName,res, zoneId, callback) {
    var sql = "UPDATE zone SET is_deleted=? WHERE id IN ("+zoneId+")";
    multiConnection[dbName].query(sql, [1], function (err, response) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })
}


function updateAreaStatus(dbName,res, area, callback) {
    var sql = "UPDATE area SET is_deleted=? WHERE id IN("+area+")"
    multiConnection[dbName].query(sql, [1], function (err, response) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }

    })
}

function updateCountryCurrency(dbName,res, countryId, callback) {
    var sql2 = "delete from currency_country where country_id IN ("+countryId+")";
    multiConnection[dbName].query(sql2, [countryId], function (err, currencyDelete) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null);
        }
    })
}


function updateCitiesOfSuppliers(dbName,res, cityId, callback) {
    var areaArray = [];

    var sql = "update supplier_delivery_areas set is_deleted = ? where city_id IN ("+cityId+")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select area_id from supplier_delivery_areas where city_id IN ("+cityId+")";
            multiConnection[dbName].query(sql2, function (err, result2) {
                if (err) {
                    console.log(err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    for (var i = 0; i < result2.length; i++) {
                        areaArray.push(result2[i].area_id);
                    }

                    if(areaArray.length)
                    {
                        areaArray = areaArray.toString();
                        var sql3 = "update supplier_branch_delivery_areas set is_deleted = ? where area_id IN ( " + areaArray + " )";
                        multiConnection[dbName].query(sql3, [1], function (err, result4) {
                            if (err) {
                                console.log("errrr", err)
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                //console.log("isbdu",sql3);
                                callback(null);
                            }

                        })
                    }
                    else{
                        callback(null)
                    }
                }

            })
        }

    })
}

function updateZonesOfSuppliers(dbName,res, zone, callback) {
    var areaArray = [];

    var sql = "update supplier_delivery_areas set is_deleted = ? where zone_id  IN ("+zone+")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select area_id from supplier_delivery_areas where zone_id IN ("+zone+")";
            multiConnection[dbName].query(sql2, function (err, result2) {
                if (err) {
                    console.log(err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    for (var i = 0; i < result2.length; i++) {
                        areaArray.push(result2[i].area_id);
                    }

                    if(areaArray.length)
                    {
                        areaArray = areaArray.toString();
                        var sql3 = "update supplier_branch_delivery_areas set is_deleted = ? where area_id IN ( " + areaArray + " )";
                        multiConnection[dbName].query(sql3, [1], function (err, result4) {
                            if (err) {
                                console.log("errrr", err)
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                               // console.log("isbdu",sql3);
                                callback(null);
                            }

                        })
                    }
                    else{
                        callback(null)
                    }
                }

            })
        }

    })

}

function updateCountriesOfSuppliers(dbName,res, countryId, callback) {
    var areaArray = [];

    var sql = "update supplier_delivery_areas set is_deleted = ? where country_id IN ("+countryId+")";
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select area_id from supplier_delivery_areas where country_id  IN ("+countryId+")"
            multiConnection[dbName].query(sql2, function (err, result2) {
                if (err) {
                    console.log(err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    for (var i = 0; i < result2.length; i++) {
                        areaArray.push(result2[i].area_id);
                    }


                    //console.log("iasbas",areaArray);
                    if(areaArray.length)
                    {
                        areaArray = areaArray.toString();
                        var sql3 = "update supplier_branch_delivery_areas set is_deleted = ? where area_id IN ( " + areaArray + " )";
                        multiConnection[dbName].query(sql3, [1], function (err, result4) {
                            if (err) {
                                console.log("errrr", err)
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                //console.log("isbdu",sql3);
                                callback(null);
                            }

                        })
                    }
                    else{
                        callback(null)
                    }

                }

            })
        }

    })

}

function updateAreasOfSuppliers(dbName,res, area, callback) {
    var areaArray = [];

    var sql = "update supplier_delivery_areas set is_deleted = ? where area_id IN("+area+")"
    multiConnection[dbName].query(sql, [1], function (err, result) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select area_id from supplier_delivery_areas where area_id IN("+area+")"
            multiConnection[dbName].query(sql2, function (err, result2) {
                if (err) {
                    console.log(err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    for (var i = 0; i < result2.length; i++) {
                        areaArray.push(result2[i].area_id);
                    }
                    if(areaArray.length)
                    {
                        areaArray = areaArray.toString();
                        var sql3 = "update supplier_branch_delivery_areas set is_deleted = ? where area_id IN ( " + areaArray + " )";
                        multiConnection[dbName].query(sql3, [1], function (err, result4) {
                            if (err) {
                                console.log("errrr", err)
                                sendResponse.somethingWentWrongError(res)
                            }
                            else {
                                //console.log("isbdu",sql3);
                                callback(null);
                                callback(null);
                            }

                        })
                    }
                    else{
                        callback(null)
                    }
                }
            })
        }
    })
}
