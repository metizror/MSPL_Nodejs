var constant = require('./constant.js');
var sendResponse = require('./sendResponse.js');
var async = require('async');
var _ = require('underscore');
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
const ExecuteQ=require('../lib/Execute')
const Uninversal=require('../util/Universal')
const common = require('../common/agent')
/*
 * ------------------------------------------------------
 * Function which returns all the added countries with their possible languages added
 * This function is used in login api and list countries api(profileSetup.js)
 *
 * Output: List of countries added,its live status
 * ------------------------------------------------------
 */

exports.countryProfile = function (dbName,res, callback) {
  //  console.log("INSIDE COUNTRY PROFILE FUNCTION")
  logger.debug("================in the country profile======================")
    var sql = "SELECT id,is_live,is_deleted FROM country WHERE is_deleted=?"
    multiConnection[dbName].query(sql, [0], function (err, countries) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (countries.length == 0) {
                var data = {};
                return callback(null, data);
            }
            else {
                var sql2 = "SELECT cm.id,cm.name,cm.country_id,cm.language_id,l.language_name FROM country_ml cm join language l on cm.language_id = l.id "
                multiConnection[dbName].query(sql2, function (err, countryMultiLanguage) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        var results = [];
                        var addedCountriesLength = countries.length;
                        for (var i = 0; i < addedCountriesLength; i++) {
                            (function (i) {

                                var countryName = [];
                                var countryMultiLanguageLength = countryMultiLanguage.length;
                                for (var j = 0; j < countryMultiLanguageLength; j++) {
                                    (function (j) {

                                        if (countries[i].id == countryMultiLanguage[j].country_id) {
                                            countryName.push({
                                                "id": countryMultiLanguage[j].id,
                                                "name": countryMultiLanguage[j].name,
                                                "language_id": countryMultiLanguage[j].language_id,
                                                "language_name": countryMultiLanguage[j].language_name
                                            });
                                        }
                                    }(j))
                                }
                                results.push({
                                    "country_id": countries[i].id,
                                    "country_data": countryName,
                                    "is_live": countries[i].is_live
                                });
                                if (i == addedCountriesLength - 1) {
                                    return callback(null, results);
                                }
                            }(i))
                        }
                    }

                })
            }

        }

    })

}


/*
 * ------------------------------------------------------
 * Function which returns all the added cities with their possible languages added
 * This function is used in login api and list cities api (profileSetup.js)
 *
 * Output: List of cities added (of particular country) , its live status
 * ------------------------------------------------------
 */
exports.cityProfile = function (db_name,res, countryId, callback) {

   // console.log("INSIDE CITY PROFILE FUNCTION")
    async.waterfall([
        function (cb) {
            getCountries(db_name,res, cb);
        },
        function (countries, cb) {
            if (countries.length) {
                if (countryId == "") {
                 //   console.log("if")
                    getCitiesForCityProfile(db_name,countries, countries[0].id, res, cb);
                }
                else {
                 //   console.log("else")
                    getCitiesForCityProfile(db_name,countries, countryId, res, cb);
                }

            }
            else {
                cb(null, []);
            }
        },
    ], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        }
        else {
            return callback(null, result);

        }

    })

}


function getCountries(db_name,res, callback) {
   // console.log("inside get countries");
    var sql3 = "SELECT id,name FROM country WHERE is_deleted=? order by id";
    multiConnection[db_name].query(sql3, [0], function (err, Countries) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            console.log("countries data-------" + Countries);
            callback(null, Countries);
        }
    })
}


function getCitiesForCityProfile(db_name,countries, countryId, res, callback) {

    var sql = "SELECT c.id as city_id,c.is_live,cm.id,cm.name,cm.language_id,l.language_name from city c";
    sql += " join city_ml cm on c.id = cm.city_id join language l on cm.language_id = l.id WHERE c.is_deleted= ? and c.country_id = ? ORDER BY c.id,cm.language_id";
    multiConnection[db_name].query(sql, [0, countryId], function (err, cities) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
           // console.log("city",cities)
            var country = [];
            var countryLength = countries.length;
            var cityLength = cities.length;
            var breakException = {};
            var l = 0;
            for (var i = 0; i < countryLength; i++) {
                (function (i) {
                    var countryData = [];
                    if (countries[i].id == countryId) {
                        if (cityLength) {
                            for (var j = 0; j < cityLength; j++) {
                                (function (j) {
                                    var langCheck = false;
                                    var cityData = [];
                                    try {
                                        for (var k = l; k < cityLength; k++) {
                                            (function (k) {
                                                if (cities[j].city_id == cities[k].city_id) {
                                                    cityData.push({
                                                        "id": cities[k].id,
                                                        "name": cities[k].name,
                                                        "language_id": cities[k].language_id,
                                                        "language_name": cities[k].language_name
                                                    })
                                                    l++;
                                                    langCheck = true;
                                                    console.log(l)
                                                    if (k == cityLength - 1 && langCheck) {
                                                        countryData.push({
                                                            "city_id": cities[j].city_id,
                                                            "is_live": cities[j].is_live,
                                                            "city_data": cityData
                                                        });

                                                    }
                                                }
                                                else {
                                                    if (langCheck) {
                                                        countryData.push({
                                                            "city_id": cities[j].city_id,
                                                            "is_live": cities[j].is_live,
                                                            "city_data": cityData
                                                        })
                                                    }
                                                 //   console.log("exception");
                                                    throw breakException;
                                                }


                                            }(k))

                                        }
                                    }
                                    catch (e) {
                                        console.error(e);
                                    }
                                    finally {
                                        if (j == cityLength - 1) {
                                            country.push({
                                                "id": countries[i].id,
                                                "name": countries[i].name,
                                                "country_data": countryData
                                            });
                                            if (i == countryLength - 1) {
                                                callback(null, country);
                                            }
                                        }
                                    }


                                }(j))

                            }
                        }
                        else {
                            country.push({
                                "id": countries[i].id,
                                "name": countries[i].name,
                                "country_data": []
                            });
                            if (i == countryLength - 1) {
                                callback(null, country);
                            }
                        }

                    }
                    else {
                        country.push({
                            "id": countries[i].id,
                            "name": countries[i].name,
                            "country_data": []
                        });
                        if (i == countryLength - 1) {
                        //    console.log("country",country);
                            callback(null, country);
                        }
                    }


                }(i))

            }

        }

    })

}


/*
 * ------------------------------------------------------
 * Function which returns all the added countries and all the cities of 1 country passed
 * This function is used in login api and zone profile
 *
 * Output: List of countries and data of 1 city
 * ------------------------------------------------------
 */
exports.listCountryCity = function (db_name,res, callback, countryId) {
    if (countryId == "") {
        var sql = "select c.*,cc.name city_name,cc.id city_id";
        sql += " from country c left join city cc on c.id = cc.country_id and cc.country_id";
        sql += " in (select MIN(id) from country where is_deleted = ? ) and cc.is_deleted = ?  where c.is_deleted = 0 ORDER BY c.id"
        multiConnection[db_name].query(sql, [0, 0], function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var resultLength = result.length;
                var country = [];
                var cityCheck = false;
                var exception = {};
                var countryCheck = false;
                var exceptionCheck = false;
                var k = 0;
                try {
                    for (var i = 0; i < resultLength; i++) {
                        (function (i) {
                            var city = [];
                            try {
                                for (var j = k; j < resultLength; j++) {
                                    (function (j) {
                                        if (countryCheck) {
                                            exceptionCheck = true;
                                            throw exception;
                                        }
                                        else {
                                            if (result[i].id == result[j].id) {
                                                if (result[j].city_id != null) {
                                                    city.push({
                                                        "city_id": result[j].city_id,
                                                        "city_name": result[j].city_name
                                                    });
                                                }
                                                k++;
                                                cityCheck = true;
                                                if (j == resultLength - 1) {
                                                    country.push({
                                                        "country_id": result[i].id,
                                                        "country_name": result[i].name,
                                                        "country_data": city
                                                    });
                                                    countryCheck = true;
                                                }
                                            }
                                            else {
                                                if (cityCheck) {
                                                    country.push({
                                                        "country_id": result[i].id,
                                                        "country_name": result[i].name,
                                                        "country_data": city
                                                    });
                                                    countryCheck = true;
                                                    throw exception;
                                                }

                                            }
                                        }


                                    }(j))

                                }

                            }
                            catch (e) {

                                console.log(e);
                                if (exceptionCheck) {
                                    country.push({
                                        "country_id": result[k].id,
                                        "country_name": result[k].name,
                                        "country_data": []
                                    });
                                    k++;
                                }
                            }
                            if (i == resultLength - 1) {
                                callback(null, country);
                            }

                        }(i))

                    }
                }
                catch (e) {
                    console.log(e);
                }

            }
        })
    }

    else {
        var sql = "select c.*,cc.name city_name,cc.id city_id";
        sql += " from country c left join city cc on c.id = cc.country_id and cc.country_id";
        sql += " = ? and cc.is_deleted = ? where c.is_deleted = ? order by ISNULL(cc.id),c.id ,cc.id ASC";
        multiConnection[db_name].query(sql, [countryId, 0, 0], function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var resultLength = result.length;
                var country = [];
                var cityCheck = false;
                var exception = {};
                var countryCheck = false;
                var exceptionCheck = false;
                var k = 0;
                try {
                    for (var i = 0; i < resultLength; i++) {
                        (function (i) {
                            var city = [];
                            try {


                                for (var j = k; j < resultLength; j++) {
                                    (function (j) {
                                        if (countryCheck) {
                                            exceptionCheck = true;
                                            throw exception;
                                        }
                                        else {
                                            if (result[i].id == result[j].id) {
                                              //  console.log(typeof result[j].city_id);
                                                if (result[j].city_id != null) {
                                                    city.push({
                                                        "city_id": result[j].city_id,
                                                        "city_name": result[j].city_name
                                                    });
                                                }

                                                k++;
                                                cityCheck = true;
                                                if (j == resultLength - 1) {
                                                    country.push({
                                                        "country_id": result[i].id,
                                                        "country_name": result[i].name,
                                                        "country_data": city
                                                    });
                                                    countryCheck = true;
                                                }
                                            }
                                            else {
                                                if (cityCheck) {
                                                    country.push({
                                                        "country_id": result[i].id,
                                                        "country_name": result[i].name,
                                                        "country_data": city
                                                    });
                                                    countryCheck = true;
                                                    throw exception;
                                                }

                                            }
                                        }


                                    }(j))


                                }

                            }
                            catch (e) {

                                console.log(e);
                                if (exceptionCheck) {
                                    country.push({
                                        "country_id": result[k].id,
                                        "country_name": result[k].name,
                                        "country_data": []
                                    });
                                    k++;
                                }
                            }
                            if (i == resultLength - 1) {
                                callback(null, country);
                            }

                        }(i))

                    }
                }
                catch (e) {
                    console.log(e);
                }

            }
        })

    }

}


/*
 * ------------------------------------------------------
 * Function which returns all the added zones of a particular city
 *
 * Output: List of zones added
 * ------------------------------------------------------
 */
exports.listZonesOfParticularCity = function (dbName,res, callback, cityId) {
    var sql = "select z.id zone_id,zm.name,zm.language_id,zm.id,l.language_name,z.is_live from zone z join zone_ml zm";
    sql += " on z.id= zm.zone_id join language l on l.id = zm.language_id where z.city_id=? and z.is_deleted = 0 order by z.id,zm.language_id"
   var stmt = multiConnection[dbName].query(sql, [cityId], function (err, result) {
       logger.debug("================listZonesOfParticularCity===================",stmt.sql)
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            var detailLength = result.length;
            var BreakException = {};
            var detailSection = [];
            var k = 0;
            if (detailLength) {
                for (var i = 0; i < detailLength; i++) {
                    (function (i) {

                        var langName = [];
                        var langCheck = false;
                        try {
                            for (var j = k; j < detailLength; j++) {
                                (function (j) {
                                  //  console.log("detail section " + JSON.stringify(result));
                                 //   console.log("langName  " + JSON.stringify(langName));
                                  //  console.log("value of j " + j + " result[i]" + result[i].id + "  detailedSubCategories[j]" + result[j].id);
                                    if (result[i].zone_id == result[j].zone_id) {
                                        langName.push({
                                            "id": result[j].id,
                                            "language_id": result[j].language_id,
                                            "language_name": result[j].language_name,
                                            "zone_name": result[j].name
                                        });
                                        langCheck = true;
                                        k++;
                                        if (j == detailLength - 1) {
                                            detailSection.push({
                                                "zone_id": result[i].zone_id,
                                                "is_live": result[i].is_live,
                                                "zone_data": langName
                                            });
                                        }
                                    } else {
                                        if (langCheck) {
                                          //  console.log("value pushed to detail " + j);
                                            detailSection.push({
                                                "zone_id": result[i].zone_id,
                                                "is_live": result[i].is_live,
                                                "zone_data": langName
                                            });

                                        }
                                        console.log("exception");
                                        throw BreakException;
                                    }

                                }(j))
                            }
                        } catch (e) {
                            console.error(e);
                        }
                        if (i == detailLength - 1) {
                          //  console.log("detail section " + JSON.stringify(result));
                            callback(null, detailSection);
                        }
                    }(i))
                }
            } else {
                callback(null, []);
            }
        }

    })

}


/*
 * ------------------------------------------------------
 * Function which returns all the added zones of a particular city
 *
 * Output: List of zones added
 * ------------------------------------------------------
 */
exports.listAreasOfParticularZone = function (dbName,res, callback, zoneId) {
    var sql = "select a.id area_id,am.name,am.language_id,am.id,l.language_name,a.is_live from area a join area_ml am";
    sql += " on a.id= am.area_id join language l on l.id = am.language_id where a.zone_id=? and a.is_deleted = 0 order by a.id,am.language_id"
    multiConnection[dbName].query(sql, [zoneId], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            var detailLength = result.length;
            var BreakException = {};
            var detailSection = [];
            var k = 0;
            if (detailLength) {
                for (var i = 0; i < detailLength; i++) {
                    (function (i) {

                        var langName = [];
                        var langCheck = false;
                        try {
                            for (var j = k; j < detailLength; j++) {
                                (function (j) {
                                //    console.log("detail section " + JSON.stringify(result));
                                 //   console.log("langName  " + JSON.stringify(langName));
                                 //   console.log("value of j " + j + " result[i]" + result[i].id + "  detailedSubCategories[j]" + result[j].id);
                                    if (result[i].area_id == result[j].area_id) {
                                        langName.push({
                                            "id": result[j].id,
                                            "language_id": result[j].language_id,
                                            "language_name": result[j].language_name,
                                            "area_name": result[j].name
                                        });
                                        langCheck = true;
                                        k++;
                                        if (j == detailLength - 1) {
                                            detailSection.push({
                                                "area_id": result[i].area_id,
                                                "is_live": result[i].is_live,
                                                "area_data": langName
                                            });
                                        }
                                    } else {
                                        if (langCheck) {
                                          //  console.log("value pushed to detail " + j);
                                            detailSection.push({
                                                "area_id": result[i].area_id,
                                                "is_live": result[i].is_live,
                                                "area_data": langName
                                            });

                                        }
                                      //  console.log("exception");
                                        throw BreakException;
                                    }

                                }(j))
                            }
                        } catch (e) {
                            console.error(e);
                        }
                        if (i == detailLength - 1) {
                           // console.log("detail section " + JSON.stringify(result));
                            callback(null, detailSection);
                        }
                    }(i))
                }
            } else {
                callback(null, []);
            }
        }

    })

}


/*
 * ------------------------------------------------------
 * Function which returns all the main categories
 * This function is used in login api and list categories api
 *
 * Output: List of main categories
 * ------------------------------------------------------
 */

// if(type==undefined){
//     sql="select IF((select  count(*)  from  supplier_category where supplier_category.category_id = categories.id and supplier_category.supplier_id="+parseInt(supplier_id)+") > 0, 1, 0) as is_assign,categories.image,categories.icon,categories.category_flow,categories.parent_id,categories.id,categories_ml.name from categories inner join categories_ml on categories_ml.category_id=categories.id where categories.parent_id=? and categories.is_deleted=? and categories_ml.language_id=? and is_default=0"
// }
// else{
//     sql="select IF((select  count(*)  from  supplier_category where supplier_category.category_id = categories.id and supplier_category.supplier_id="+parseInt(supplier_id)+") > 0, 1, 0) as is_assign,categories.image,categories.icon,categories.category_flow,categories.parent_id,categories.id,categories_ml.name from categories inner join categories_ml on categories_ml.category_id=categories.id where categories.parent_id=? and categories.is_deleted=? and categories_ml.language_id=? order by is_default desc;"
// }       
exports.listCategories = async function (db_name,res, callback) {
   console.log("INSIDE CATEGORY FUNCTION");
    try{
    var sql = "select IF((select count(*)  from product  where  product.category_id=c.id and product.sub_category_id=c.id and product.detailed_sub_category_id=c.id) > 0, 1, 0) as is_product,IF((select COUNT(*) from categories cts where cts.parent_id=c.id )>0,1,0) as is_sub_category,category_flow,payment_after_confirmation,is_agent,agent_list,is_quantity,type,is_variant,id,image,icon,illustration,is_live,id,start_time,end_time,tax from categories c where c.parent_id=? and c.is_deleted= ? "
    let categories=await ExecuteQ.Query(db_name,sql,[0,0]);

    // multiConnection[db_name].query(sql, [0, 0], function (err, categories) {
    //     if (err) {
    //         logger.debug("=========erer=========in list categores==========",err)
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
            logger.debug("======================categoreisss-=s=d111====111111111=========",categories)
            var category = [];
            var categoryLength = categories.length;
            if (categoryLength == 0) {
                callback(null, category);
            }
            else {
                var sql2 = "select cm.language_id,cm.name,cm.description,cm.category_id,cm.id,l.language_name from categories_ml cm join language l ";
                sql2 += " on l.id = cm.language_id";
                let categoryMl=await ExecuteQ.Query(db_name,sql2,[]);
                // multiConnection[db_name].query(sql2, function (err, categoryMl) {
                //     if (err) {
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else {
                        logger.debug("======================categoreisss-=s=d111=============",categories)
                        var categoryMllength = categoryMl.length;
                        for (var i = 0; i < categoryLength; i++) {
                            (function (i) {
                                var categoriesMl = [];
                                for (var j = 0; j < categoryMllength; j++) {
                                    (function (j) {
                                        if (categories[i].id == categoryMl[j].category_id) {
                                            categoriesMl.push({
                                                "id": categoryMl[j].id,
                                                "name": categoryMl[j].name,
                                                "language_id": categoryMl[j].language_id,
                                                "language_name": categoryMl[j].language_name,
                                                "description": categoryMl[j].description
                                            });
                                            if (j == categoryMllength - 1) {
                                                category.push({
                                                    "category_id": categories[i].id,
                                                    "is_sub_category": categories[i].is_sub_category,
                                                    "image": categories[i].image,
                                                    "is_product":categories[i].is_product,
                                                    "icon": categories[i].icon,
                                                    "illustration": categories[i].illustration,
                                                    "is_live": categories[i].is_live,
                                                    "is_variant": categories[i].is_variant,
                                                    "category_flow": categories[i].category_flow,
                                                    "is_agent": categories[i].is_agent,
                                                    "agent_list": categories[i].agent_list,
                                                    "is_quantity": categories[i].is_quantity,
                                                    "type": categories[i].type,
                                                    "start_time":categories[i].start_time,
                                                    "end_time":categories[i].end_time,
                                                    "tax":categories[i].tax,
                                                    "payment_after_confirmation":categories[i].payment_after_confirmation,
                                                    "category_name": categoriesMl
                                                });
                                                if (i == categoryLength - 1) {
                                                    logger.debug("=============categorycategorycategory====1===",category)
                                                    callback(null, category);
                                                }
                                            }

                                        }
                                        else {
                                            if (j == categoryMllength - 1) {
                                                category.push({
                                                    "category_id": categories[i].id,
                                                    "is_sub_category": categories[i].is_sub_category,
                                                    "image": categories[i].image,
                                                    "is_product":categories[i].is_product,
                                                    "icon": categories[i].icon,
                                                    "illustration": categories[i].illustration,
                                                    "is_live": categories[i].is_live,
                                                    "category_name": categoriesMl,
                                                    "is_variant": categories[i].is_variant,
                                                    "category_flow": categories[i].category_flow,
                                                    "is_agent": categories[i].is_agent,
                                                    "agent_list": categories[i].agent_list,
                                                    "is_quantity": categories[i].is_quantity,
                                                    "start_time":categories[i].start_time,
                                                    "end_time":categories[i].end_time,
                                                    "tax":categories[i].tax,
                                                    "type": categories[i].type,
                                                    "payment_after_confirmation":categories[i].payment_after_confirmation
                                                });
                                                if (i == categoryLength - 1) {
                                                    logger.debug("=============categorycategorycategory====2===",category)
                                                    callback(null, category);
                                                }
                                            }
                                        }

                                    }(j))
                                }


                            }(i))

                        }

                    // }

                // })
            }

        // }

    // })
}
catch(Err){
    logger.debug("===Err!==",Err)
    sendResponse.somethingWentWrongError(res);
}

}

/** */
// exports.listVariants=function(categories,callback)
// {
//     // var output=[];
//     var json_data={};
//     for ( var j = 0; j < categories.length ; j++ ) {        

//          (function(j){

//                var variantSql="select `name` as variant_name,`cat_id`,`cat_variants`.`id`,GROUP_CONCAT(CONCAT('{\"value\":\"',variants.value,'\",\"value\":\"',variants.value,'\"}')) as variants from cat_variants left join variants on cat_variants.id=variants.cat_variant_id where cat_variants.cat_id=? GROUP BY `cat_variants`.`id`";
//                var statement=connection.query(variantSql,parseInt(categories[j].category_id),function(err,data){
//                 // console.log(statement.sql)
//                 if(err){
//                     console.log(err)
//                         sendResponse.somethingWentWrongError(res);
//                     }
//                     else{
                    
//                         if(data && data.length>0){

//                             // console.log(data[0].variants.replace(/\//g, ''));

//                             var variant_values=data[0].variants;
//                             console.log("===variDATAll===",variant_values,typeof variant_values);
//                             var datasplit=variant_values.split("}");
//                             console.log("===variDATAll===",datasplit);

//                             categories[j]["variants"]={
//                                 "variant_name":data[0].name,
//                                 "variant_value":variant_values
//                             };
//                             console.log("===variDATAll===",categories[j]);

//                             if (j == categories.length - 1) 
//                             {
//                                callback(null, categories);
//                             }
//                         }
//                         else{
//                             categories[j]["variants"]=[]
//                             if (j == categories.length - 1) 
//                             {
//                                 callback(null, categories);
//                             }
//                         }
//                     }
//                 });
                
//          })(j);
//     }
//     // console.log("===categories===",categories)
//     // callback(null,categories)

// }

/*
 * ------------------------------------------------------
 * Function which returns all the sub categories
 * This function is used in login api and list sub categories api
 * Input : main category id under which sub categories are required
 * Output: List of sub categories along with main category list
 * ------------------------------------------------------
 */
exports.getSubCategories = function (db_name,categoryId, res, callback) {

    var categories;
    var subCategories;
    var category;

    async.waterfall([

            function (cb) {
                getAllCategories(db_name,res, cb);
            },

            function (categories1, cb) {

                console.log(categories1)

                if (!categories1.length) {
                    categories = [];
                    callback(null, []);
                }
                else {
                    categories = categories1;
                    if (categoryId == "") {
                        category = categories[0].id;
                        getAllSubcategories(db_name,categories[0].id, res, cb);
                    }
                    else {
                        category = categoryId;
                        getAllSubcategories(db_name,categoryId, res, cb);
                    }
                }

            },
            function (subCategories1, cb) {

                subCategories = subCategories1;

                clubSubCategoryData(db_name,subCategories, categories, category, res, cb);

            },
        ], function (error, subCategoryData) {

            if (error) {
                console.log(error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                console.log("++++++++++++++++++subCategoriesData++++++++++++",subCategoryData)
                callback(null, subCategoryData);
            }

        }
    );

}

async function getAllCategories(db_name,res, callback) {
    try{
        var sql = "select id,name from categories where is_deleted=? and parent_id=?"
        let categories=await ExecuteQ.Query(db_name,sql,[0,0]);
        callback(null, categories);
    }
    catch(Err){
        logger.debug("===Err!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "select id,name from categories where is_deleted=? and parent_id=?"
    // multiConnection[db_name].query(sql, [0, 0], function (err, categories) {
    //     if (err) {
    //         console.log(err)
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null, categories);
    //     }
    // })

}

function getAllSubcategories(db_name,categoryId, res, callback) {
    var sql = "select IF((select count(*)  from questions  where questions.category_id=c.id) > 0, 1, 0) as is_question,IF((select count(*)  from product  where product.sub_category_id=c.id) > 0, 1, 0) as is_product,IF((select COUNT(*) from categories cts where cts.parent_id=c.id )>0,1,0) as is_sub_category,is_variant,id,name,image,icon,parent_id from categories c where c.is_deleted=? and c.parent_id=?"
    multiConnection[db_name].query(sql, [0, categoryId], function (err, subCategories) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
           // console.log("subcategories" + subCategories)
           // console.log(JSON.stringify(subCategories));
            return callback(null, subCategories);
        }

    })

}

function clubSubCategoryData(db_name,subCategories, categories, categoryId, res, callback) {
    var subCategoriesLength = subCategories.length;
  //  console.log(subCategoriesLength)
    var categoriesLength = categories.length;
    var category = [];
    if (subCategoriesLength == 0) {
        for (var i = 0; i < categoriesLength; i++) {
            (function (i) {
                category.push({
                    "category_id": categories[i].id,
                    "category_name": categories[i].name,
                    "category_data": []
                });
                if (i == categoriesLength - 1) {
                    callback(null, category);
                }

            }(i))

        }
    }
    else {
        var sql = "select cat.id,cat.image,cat.icon,catm.name,catm.description,catm.language_id,ll.language_name,catm.category_id from categories cat ";
        sql += " join categories_ml catm on cat.id = catm.category_id join language ll on catm.language_id = ll.id where cat.is_deleted=? and cat.parent_id=? ORDER BY cat.id"
        multiConnection[db_name].query(sql, [0, categoryId], function (err, subCategoriesMl) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var subCategoryMlLength = subCategoriesMl.length;
                console.log("subCategoryML" + JSON.stringify(subCategoriesMl));
                for (var i = 0; i < categoriesLength; i++) {
                    (function (i) {
                        var subCategory = [];
                        for (var j = 0; j < subCategoriesLength; j++) {

                            (function (j) {
                                var langName = [];

                                if (categories[i].id == subCategories[j].parent_id) {
                                   // console.log("main category id" + categories[i].id);
                                  //  console.log("sub category parent id" + subCategories[j].parent_id);
                                   // console.log("here");
                                    for (var k = 0; k < subCategoryMlLength; k++) {
                                        (function (k) {
                                            if (subCategoriesMl[k].category_id == subCategories[j].id) {
                                              //  console.log("subCategoriesMl id" + subCategoriesMl[k].category_id);
                                              //  console.log("sub category id" + subCategories[j].id);
                                                langName.push({
                                                    "name": subCategoriesMl[k].name,
                                                    "description": subCategoriesMl[k].description,
                                                    "language_id": subCategoriesMl[k].language_id,
                                                    "language_name": subCategoriesMl[k].language_name
                                                });
                                                if (k == subCategoryMlLength - 1) {
                                                    subCategory.push({
                                                        "is_product": subCategories[j].is_product,
                                                        "is_question": subCategories[j].is_question,
                                                        "subcategory_id": subCategories[j].id,
                                                        "subcategory_image": subCategories[j].image,
                                                        "subcategory_icon": subCategories[j].icon,
                                                        "is_sub_category":subCategories[j].is_sub_category,
                                                        "subcategory_data": langName
                                                    });
                                                    if (j == subCategoriesLength - 1) {
                                                        category.push({
                                                            "category_id": categories[i].id,
                                                            "category_name": categories[i].name,
                                                            "category_data": subCategory
                                                        });
                                                        if (i == categoriesLength - 1) {
                                                            callback(null, category);
                                                        }
                                                    }

                                                }
                                            }
                                            else {
                                                if (k == subCategoryMlLength - 1) {
                                                    subCategory.push({
                                                        "subcategory_id": subCategories[j].id,
                                                        "is_question": subCategories[j].is_question,
                                                        "is_product": subCategories[j].is_product,
                                                        "subcategory_image": subCategories[j].image,
                                                        "subcategory_icon": subCategories[j].icon,
                                                        "subcategory_data": langName,
                                                        "is_sub_category":subCategories[j].is_sub_category
                                                    });
                                                    if (j == subCategoriesLength - 1) {
                                                        category.push({
                                                            "category_id": categories[i].id,
                                                            "category_name": categories[i].name,
                                                            "category_data": subCategory
                                                        });
                                                        if (i == categoriesLength - 1) {
                                                            callback(null, category);
                                                        }
                                                    }
                                                }
                                            }

                                        }(k))
                                    }
                                }
                                else {
                                    if (j == subCategoriesLength - 1) {
                                        category.push({
                                            "category_id": categories[i].id,
                                            "category_name": categories[i].name,
                                            "category_data": subCategory
                                        });
                                        if (i == categoriesLength - 1) {
                                            callback(null, category);
                                        }
                                    }
                                }

                            }(j))

                        }

                    }(i))

                }
            }

        })

    }

}

/*
 * ------------------------------------------------------
 * Function which returns all the detailed sub categories
 * This function is used in login api and list detailed sub categories api
 * Input : sub category id under which detailed sub categories are required
 * Output: List of detailed sub categories along with sub category list
 * ------------------------------------------------------
 */
exports.getListOfSubCategoriesForDetailed = function (db_name,res, callback, subCategoryId) {

    var subCategories;
    var subCatId;
    async.waterfall([

            function (cb) {
                getAllSubcategoriesForDetailedSubCategory(db_name,res, cb);
            },
            function (subCategories1, cb) {

                if (subCategories1.length) {
                    subCategories = subCategories1;
                    if (subCategoryId == "") {
                        subCatId = subCategories[0].id;
                      //  console.log(subCategories[0].id);
                      
                        getAllDetailCategory(db_name,res, cb, subCategories[0].id);
                    }
                    else {
                        subCatId = subCategoryId;
                        getAllDetailCategory(db_name,res, cb, subCategoryId);
                    }
                }
                else {
                    return callback(null, []);
                }

            },
            function (detailedSubCategories, cb) {

                clubSubCategoryData(db_name,detailedSubCategories, subCategories, subCatId, res, cb);
            }
        ], function (error, detailedsubCategoryData) {

            if (error) {
                console.log(error)
                sendResponse.somethingWentWrongError(res);
            }
            else {
                return callback(null, detailedsubCategoryData);
            }

        }
    );
}


function getAllDetailCategory(db_name,res, callback, subCategoryId) {
    var sql = `select IF((select count(*)  from questions  where questions.category_id=categories.id) > 0, 1, 0) as is_question,
    IF((select count(*)  from product  where product.sub_category_id=categories.id) > 0, 1, 0) as is_product,IF((select COUNT(*) from categories cts where
       cts.parent_id=categories.id )>0,1,0) as is_sub_category,id,name,is_live,icon,image,illustration,parent_id from categories where is_deleted=? and parent_id=?`
    multiConnection[db_name].query(sql, [0, subCategoryId], function (err1, reply1) {
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, reply1);
        }
    });


}


function getAllSubcategoriesForDetailedSubCategory(db_name,res, callback) {
    var sql = "select id,name,is_live,icon,image,illustration,parent_id from categories where is_deleted=?";
    sql += " and parent_id in(select id from categories where parent_id= 0)"
    multiConnection[db_name].query(sql, [0], function (err, subCategories) {
        if (err) {
            console.log(err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
          //  console.log(JSON.stringify(subCategories));
            return callback(null, subCategories);
        }

    })

}


exports.listOfProducts = function (dbName,res,categoryId,subCategoryId,detailedSubCategoryId,limit,offset,serachType,serachText,callback) {
    var data={};
    var count;
    var productIds =[];
    var product_Count;
    async.auto({
        productList:async function(cb){
            try{
                limit=parseInt(limit);
                if(limit){
                    console.log("nasdnodasf",limit);
                    if(serachType == 0 ){
                        var sql = "select p.cart_image_upload,p.is_appointment,p.payment_after_confirmation,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.pricing_type, p.quantity,p.name as name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                            "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
                            " where p.is_global = ? and p.is_deleted = ? and p.parent_id=? and p.category_id = ?  ORDER BY p.id DESC LIMIT ?,? "
                    }
                    else {
                        var sql = "select p.cart_image_upload,p.is_appointment,p.payment_after_confirmation,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.quantity,p.pricing_type,p.name as name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                            "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit where p.is_global = ? and p.is_deleted = ? and p.parent_id=?  and p.category_id = ? " +
                            "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%' " +
                            " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%')  ORDER BY p.id DESC LIMIT ?,?"
                    }
                    let result=await ExecuteQ.Query(dbName,sql,[1, 0,0,detailedSubCategoryId,offset,limit]);
                //    var st=multiConnection[dbName].query(sql, [1, 0,0,detailedSubCategoryId,offset,limit],function(err,result){
                    //   console.log("....................productList....................",st.sql);
                       if(result && result.length){
                           productIds = result;
                           cb(null);
                       }else{
                           cb(null);
                       }
                //    })
                }
                else{
                   var sql = "select p.cart_image_upload,p.is_appointment,p.payment_after_confirmation,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.is_prescribed,p.id,p.pricing_type,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
                   sql += " from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit ";
                   sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.parent_id=? ORDER BY p.id DESC "
                    let result=await ExecuteQ.Query(dbName,sql,[1, 0,detailedSubCategoryId,0]);
                   //    multiConnection[dbName].query(sql, [1, 0,detailedSubCategoryId,0],function(err,result){
                     //  console.log("....................productList....................",err,result);
                       if(result && result.length){
                           productIds = result;
                           cb(null);
                       }else{
                           cb(null);
                       }
                //    })
               }
            }
            catch(Err){
                productIds = [];
                cb(null);
            }
        //    limit=parseInt(limit);
        //     if(limit){
        //         console.log("nasdnodasf",limit);
        //         if(serachType == 0 ){
        //             var sql = "select p.cart_image_upload,p.payment_after_confirmation,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.pricing_type, p.quantity,p.name as name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
        //                 "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
        //                 " where p.is_global = ? and p.is_deleted = ? and p.parent_id=? and p.category_id = ?  ORDER BY p.id DESC LIMIT ?,? "
        //         }
        //         else {
        //             var sql = "select p.cart_image_upload,p.payment_after_confirmation,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.quantity,p.pricing_type,p.name as name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
        //                 "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit where p.is_global = ? and p.is_deleted = ? and p.parent_id=?  and p.category_id = ? " +
        //                 "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%' " +
        //                 " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%')  ORDER BY p.id DESC LIMIT ?,?"
        //         }
        //        var st=multiConnection[dbName].query(sql, [1, 0,0,detailedSubCategoryId,offset,limit],function(err,result){
        //           console.log("....................productList....................",st.sql);
        //            if(result && result.length){
        //                productIds = result;
        //                cb(null);
        //            }else{
        //                cb(null);
        //            }
        //        })
        //     }
        //     else{
        //        var sql = "select p.cart_image_upload,p.payment_after_confirmation,br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.is_prescribed,p.id,p.pricing_type,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
        //        sql += " from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit ";
        //        sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.parent_id=? ORDER BY p.id DESC "
        //        multiConnection[dbName].query(sql, [1, 0,detailedSubCategoryId,0],function(err,result){
        //          //  console.log("....................productList....................",err,result);
        //            if(result && result.length){
        //                productIds = result;
        //                cb(null);
        //            }else{
        //                cb(null);
        //            }
        //        })
        //    }
        },
        getProductImage:['productList',function(cb){
            console.log("222...",productIds.length);
            if(productIds && productIds.length){
               var len = productIds.length;
                for(var k = 0;k<len;k++){
                    (async function(k){
                        var temp = [];
                        var sql = "select product_id,image_path,default_image,imageOrder from product_image where product_id = ?";
                        let result=await ExecuteQ.Query(dbName,sql,[productIds[k].id]);
                        // multiConnection[dbName].query(sql, [productIds[k].id],function(err,result){
                            if(result.length){
                                var imageLen = result.length;
                                for(var j = 0;j<imageLen;j++){
                                    (function(j){
                                        temp.push(result[j]);
                                        if(j == (imageLen -1)){
                                             productIds[k].images = temp;
                                        }
                                        
                                        if(k == (len-1) && j == (imageLen-1)){
                                            cb(null)
                                        }
                                        
                                    }(j));
                                }
                            }else{
                                productIds[k].images=[];
                                if(k == (len-1)){
                                    cb(null)
                                }
                            }
                        // })
                    }(k));
                }
            }else{
                cb(null)
                
            }
        }],
        getProductMl:['productList',function(cb){
            if(productIds.length){
                var len = productIds.length;
                for(var i =0;i < len;i++){
                    (async function(i){
                        var sql = "select pml.id as product_multi_id,l.language_name,pml.language_id,pml.name,	pml.product_desc,pml.measuring_unit from product_ml pml join language l on l.id = pml.language_id where product_id = ?";
                       let result=await ExecuteQ.Query(dbName,sql,[productIds[i].id]);
                        // multiConnection[dbName].query(sql, [productIds[i].id],function(err,result) {
                            productIds[i].names = result;
                            if(i == (len -1)){
                                cb(null)
                            }
                        // })
                    }(i));
                }
            }else{
                cb(null)
            }
        }],
        getVariants:['productList',function(cb){
            if(productIds.length){
                var len = productIds.length;
                for(var i =0;i < len;i++){
                    (async function(i){
                        var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
                        let vData=await ExecuteQ.Query(dbName,vsql,[productIds[i].id]);
                        // multiConnection[dbName].query(vsql, [productIds[i].id],function(err,vData) {
                            productIds[i].variant = vData;
                            if(i == (len -1)){
                                cb(null)
                            }
                        // })
                    }(i));
                }
            }else{
                cb(null)
            }
        }],
        last:['getProductMl','getProductImage','getVariants',async function(cb){
            try{
                if(serachType ==0){
                    var sql = "select p.id from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
                        // " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ?"
                                    " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? "
                    }
                else {
                    var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                        "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit" +
                        // " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? " +
                        " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? " +
                        "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%'" +
                        " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%')";
                }
                let result=await ExecuteQ.Query(dbName,sql,[1, 0,detailedSubCategoryId]);
                // multiConnection[dbName].query(sql, [1, 0,detailedSubCategoryId],function(err,result){
                    // console.log(",,....",err,result.length);
                    if(result.length){
                        product_Count = result.length;
                        cb(null);
                    }else{
                        product_Count = 0;
                        cb(null);
                    }
                // })
            }
            catch(Err){
                logger.debug("===last==",Err);
                product_Count = 0;
                cb(null);
            }
            // if(serachType ==0){
            //     var sql = "select p.id from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
            //         // " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ?"
            //                     " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? "
            //     }
            // else {
            //     var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
            //         "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit" +
            //         // " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? " +
            //         " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? " +
            //         "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%'" +
            //         " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%')";
            // }
            // multiConnection[dbName].query(sql, [1, 0,detailedSubCategoryId],function(err,result){
            //     console.log(",,....",err,result.length);
            //     if(result.length){
            //         product_Count = result.length;
            //         cb(null);
            //     }else{
            //         product_Count = 0;
            //         cb(null);
            //     }
            // })
        }],
    },function(err,result){
        if(err){
            callback(err);
        }else{
           // console.log("...productIds..",productIds);
            callback(null,{products:productIds,product_count:product_Count})
        }
    })





/*    async.waterfall([
            function (cb) {
                listProductDetails(res,categoryId,subCategoryId,detailedSubCategoryId,limit,offset, cb);
            },
            function (products,cb) {
                  productImages(res, products, cb);
            },
            function (product,cb) {
                var sql = "select p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name ";
                sql += " from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit  ";
                sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ";
                multiConnection[dbName].query(sql, [1, 0, categoryId, subCategoryId, detailedSubCategoryId], function (err, products) {
                    if (err) {
                        console.log(err);
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        count=products.length;
                        data.products=product;
                        data.product_Count=count;
                        cb(null,data)
                    }
                });
            }
        ], function (err, response) {

            if (err) {
                sendResponse.somethingWentWrongError(res)
            }
            else {

                callback(null, response);
            }

        }
    )*/
}

exports.listOfProductsv1 = function (dbName,res,categoryId,subCategoryId,detailedSubCategoryId,limit,offset,serachType,serachText,callback) {
    var data={};
    var count;
    var productIds =[];
    var product_Count;
    async.auto({
        productList:async function(cb){
            try{
                limit=parseInt(limit);
                if(limit){
                    console.log("nasdnodasf",limit);
                    if(serachType == 0 ){
                        var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.interval_flag,p.interval_value,p.quantity,p.name as name,p.id,p.is_product,p.duration, p.making_price,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                            "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
                            // " where p.is_global = ? and p.is_deleted = ? and p.parent_id=? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ORDER BY p.id DESC LIMIT ?,? "
                            " where p.is_global = ? and p.is_deleted = ? and p.parent_id=? and p.category_id = ? ORDER BY p.id DESC LIMIT ?,? "
                    
                        }
                    else {
                        var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.inteval_flag,p.interval_value,p.quantity,p.name as name,p.id,p.is_product,p.duration, p.making_price,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                            "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit where p.is_global = ? and p.is_deleted = ? and p.parent_id=?  and p.category_id = ? " +
                            // "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit where p.is_global = ? and p.is_deleted = ? and p.parent_id=?  and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? " +
                             "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%' " +
                            " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%')  ORDER BY p.id DESC LIMIT ?,?"
                    }
                    let result=await ExecuteQ.Query(dbName,sql,[1, 0,detailedSubCategoryId,0,offset,limit]);
                    if(result && result.length){
                        productIds = result;
                        cb(null);
                    }else{
                        cb(null);
                    }
                }
                else{
                        var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.interval_flag,interval_value,p.quantity,p.id,p.is_product,p.duration, p.making_price,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
                        sql += " from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit ";
                     //    sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? and p.parent_id=? ORDER BY p.id DESC "
                            sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.parent_id=? ORDER BY p.id DESC "
                            let result=await ExecuteQ.Query(dbName,sql,[1, 0,detailedSubCategoryId,0]);
                            if(result && result.length){
                                productIds = result;
                                cb(null);
                            }else{
                                cb(null);
                            }
                }
               
            }
            catch(Err){
                productIds=[];
                cb(null)
            }
        //    limit=parseInt(limit);
        //     if(limit){
        //         console.log("nasdnodasf",limit);
        //         if(serachType == 0 ){
        //             var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.interval_flag,p.interval_value,p.quantity,p.name as name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
        //                 "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
        //                 // " where p.is_global = ? and p.is_deleted = ? and p.parent_id=? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ORDER BY p.id DESC LIMIT ?,? "
        //                 " where p.is_global = ? and p.is_deleted = ? and p.parent_id=? and p.category_id = ? ORDER BY p.id DESC LIMIT ?,? "
                
        //             }
        //         else {
        //             var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.inteval_flag,p.interval_value,p.quantity,p.name as name,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
        //                 "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit where p.is_global = ? and p.is_deleted = ? and p.parent_id=?  and p.category_id = ? " +
        //                 // "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit where p.is_global = ? and p.is_deleted = ? and p.parent_id=?  and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? " +
        //                  "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%' " +
        //                 " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%')  ORDER BY p.id DESC LIMIT ?,?"
        //         }
        //        var st=multiConnection[dbName].query(sql, [1, 0,0,detailedSubCategoryId,offset,limit],function(err,result){
        //           console.log("....................productList....................",st.sql);
        //            if(result && result.length){
        //                productIds = result;
        //                cb(null);
        //            }else{
        //                cb(null);
        //            }
        //        })

        //     }
        //     else{
        //        var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.is_prescribed,p.interval_flag,interval_value,p.quantity,p.id,p.is_product,p.duration,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
        //        sql += " from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit ";
        //     //    sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? and p.parent_id=? ORDER BY p.id DESC "
        //            sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.parent_id=? ORDER BY p.id DESC "
              
        //     multiConnection[dbName].query(sql, [1, 0,detailedSubCategoryId,0],function(err,result){
        //          //  console.log("....................productList....................",err,result);
        //            if(result && result.length){
        //                productIds = result;
        //                cb(null);
        //            }else{
        //                cb(null);
        //            }
        //        })
        //    }
        },
        getProductImage:['productList',function(cb){
            console.log("222...",productIds.length);
            if(productIds && productIds.length){
               var len = productIds.length;
                for(var k = 0;k<len;k++){
                    (async function(k){
                        var temp = [];
                        var sql = "select product_id,image_path,default_image,imageOrder from product_image where product_id = ?";
                        let result=await ExecuteQ.Query(dbName,sql,[productIds[k].id]);
                        // multiConnection[dbName].query(sql, [productIds[k].id],function(err,result){
                            if(result.length){
                                var imageLen = result.length;
                                for(var j = 0;j<imageLen;j++){
                                    (function(j){
                                        temp.push(result[j]);
                                        if(j == (imageLen -1)){
                                             productIds[k].images = temp;
                                        }
                                        
                                        if(k == (len-1) && j == (imageLen-1)){
                                            cb(null)
                                        }
                                        
                                    }(j));
                                }
                            }else{
                                productIds[k].images=[];
                                if(k == (len-1)){
                                    cb(null)
                                }
                            }
                        // })
                    }(k));
                }
            }else{
                cb(null)
                
            }
        }],
        getProductMl:['productList',function(cb){
            if(productIds.length){
                var len = productIds.length;
                for(var i =0;i < len;i++){
                    (async function(i){
                        var sql = "select pml.id as product_multi_id,l.language_name,pml.language_id,pml.name,	pml.product_desc,pml.measuring_unit from product_ml pml join language l on l.id = pml.language_id where product_id = ?";
                        let result=await ExecuteQ.Query(dbName,sql,[productIds[i].id])
                        // multiConnection[dbName].query(sql, [productIds[i].id],function(err,result) {
                            productIds[i].names = result;
                            if(i == (len -1)){
                                cb(null)
                            }
                        // })
                    }(i));
                }
            }else{
                cb(null)
            }
        }],
        getVariants:['productList',function(cb){
            if(productIds.length){
                var len = productIds.length;
                for(var i =0;i < len;i++){
                    (async function(i){
                        var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
                       let vData=await ExecuteQ.Query(dbName,vsql,[productIds[i].id]);
                        // multiConnection[dbName].query(vsql, [productIds[i].id],function(err,vData) {
                            productIds[i].variant = vData;
                            if(i == (len -1)){
                                cb(null)
                            }
                        // })
                    }(i));
                }
            }else{
                cb(null)
            }
        }],
        last:['getProductMl','getProductImage','getVariants',async function(cb){
            try{
            if(serachType ==0){
                var sql = "select p.id from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
                    " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ?"
            }
            else {
                var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.quantity,p.name,p.id,p.is_product,p.duration, p.making_price,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                    "from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit" +
                    " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? " +
                    "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%'" +
                    " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%')";
            }
            let result=await ExecuteQ.Query(dbName,sql,[1, 0,categoryId,subCategoryId,detailedSubCategoryId]);
            // multiConnection[dbName].query(sql, [1, 0,categoryId,subCategoryId,detailedSubCategoryId],function(err,result){
                // console.log(",,....",err,result.length);
                if(result.length){
                    product_Count = result.length;
                    cb(null);
                }else{
                    product_Count = 0;
                    cb(null);
                }
            }
            catch(Err){
                logger.debug("==last!=Err",Err)
                product_Count=0;
                cb(null)
            }
            // })
        }],
    },function(err,result){
        if(err){
            callback(err);
        }else{
           // console.log("...productIds..",productIds);
            callback(null,{products:productIds,product_count:product_Count})
        }
    })





/*    async.waterfall([
            function (cb) {
                listProductDetails(res,categoryId,subCategoryId,detailedSubCategoryId,limit,offset, cb);
            },
            function (products,cb) {
                  productImages(res, products, cb);
            },
            function (product,cb) {
                var sql = "select p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name ";
                sql += " from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit  ";
                sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ";
                multiConnection[dbName].query(sql, [1, 0, categoryId, subCategoryId, detailedSubCategoryId], function (err, products) {
                    if (err) {
                        console.log(err);
                        sendResponse.somethingWentWrongError(res)
                    }
                    else {
                        count=products.length;
                        data.products=product;
                        data.product_Count=count;
                        cb(null,data)
                    }
                });
            }
        ], function (err, response) {

            if (err) {
                sendResponse.somethingWentWrongError(res)
            }
            else {

                callback(null, response);
            }

        }
    )*/
}

exports.listOfVariants = function (dbName,is_global,res,productId,limit,offset,serachType,serachText,callback) {
    var data={};
    var count;
    var productIds =[];
    var product_Count;
    var tax = 0
    async.auto({
        productList:function(cb){
           limit=parseInt(limit);
            if(limit){
                console.log("nasdnodasf",limit);
                if(serachType == 0 ){
                    var sql = "select p.quantity,(p.quantity-p.purchased_quantity) as left_quantity,pp.handling,p.name as name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                        "from product p left join product_pricing pp on p.id = pp.product_id join categories c on c.id = p.category_id left join currency_conversion curr on curr.id = p.price_unit " +
                        " where  p.is_deleted = ?  and pp.is_deleted=0 and p.parent_id=? group by p.id ORDER BY p.id DESC LIMIT ?,? "
                }
                else {
                    var sql = "select p.quantity,(p.quantity-p.purchased_quantity) as left_quantity,pp.handling,p.name as name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                        "from product p join product_pricing pp on p.id = pp.product_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit where p.is_deleted = ? and pp.is_deleted=0 and p.parent_id=?  " +
                        "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%' " +
                        " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%') group by p.id  ORDER BY p.id DESC LIMIT ?,?"
                }
               var stmt = multiConnection[dbName].query(sql, [0,parseInt(productId),offset,limit],function(err,result){
                  console.log("....................productList....................",err,result,stmt.sql);
                   if(result && result.length){
                       productIds = result;
                        tax = productIds[0].handling
                       product_Count = productIds.length
                       cb(null);
                   }else{
                       cb(null);
                   }
               })
            }
            else{
               var sql = "select p.quantity,(p.quantity-p.purchased_quantity) as left_quantity,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
               sql += " from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit ";
               sql += " where p.is_global = ? and pp.is_deleted=0 and p.is_deleted = ?  and p.parent_id=? group by p.id ORDER BY p.id DESC "
               multiConnection[dbName].query(sql, [parseInt(is_global), 0,parseInt(productId)],function(err,result){
                 //  console.log("....................productList....................",err,result);
                   if(result && result.length){
                       productIds = result;
                       product_Count = productIds.length
                       cb(null);
                   }else{
                       cb(null);
                   }
               })
           }
        },
        getProductImage:['productList',function(cb){
            console.log("222...",productIds.length);
            var len = productIds.length;
            if(productIds && productIds.length){
                for (const [index, i] of productIds.entries()) {
                    var temp = [];
                    var sql = "select product_id,image_path,default_image,imageOrder from product_image where product_id = ?";
                    multiConnection[dbName].query(sql, [productIds[index].id],function(err,result){
                        if(result.length){
                            var imageLen = result.length;
                            for(var j = 0;j<imageLen;j++){
                                (function(j){
                                    temp.push(result[j]);
                                    if(j == (imageLen -1)){
                                         productIds[index].images = temp;
                                    }
                                    
                                    if(index == (len-1) && j == (imageLen-1)){
                                        cb(null);
                                    }
                                    
                                }(j));
                            }
                        }else{
                            productIds[index].images=[];
                            if(index == (productIds.length-1)){
                                cb(null);
                            }
                        }
                    })
                }
            //    var len = productIds.length;
            //     for(var k = 0;k<len;k++){
            //         (function(k){
            //             var temp = [];
            //             var sql = "select product_id,image_path,default_image,imageOrder from product_image where product_id = ?";
            //             multiConnection[dbName].query(sql, [productIds[k].id],function(err,result){
            //                 if(result.length){
            //                     var imageLen = result.length;
            //                     for(var j = 0;j<imageLen;j++){
            //                         (function(j){
            //                             temp.push(result[j]);
            //                             if(j == (imageLen -1)){
            //                                  productIds[k].images = temp;
            //                             }
                                        
            //                             if(k == (len-1) && j == (imageLen-1)){
            //                                 cb(null)
            //                             }
                                        
            //                         }(j));
            //                     }
            //                 }else{
            //                     productIds[k].images=[];
            //                     if(k == (len-1)){
            //                         cb(null)
            //                     }
            //                 }
            //             })
            //         }(k));
            //     }
            }else{
                cb(null)
                
            }
        }],
        getProductMl:['productList',function(cb){
            if(productIds.length){

                for (const [index, i] of productIds.entries()) {
                    var sql = "select pml.id as product_multi_id,l.language_name,pml.language_id,pml.name,	pml.product_desc,pml.measuring_unit from product_ml pml join language l on l.id = pml.language_id where product_id = ?";
                    multiConnection[dbName].query(sql, [productIds[index].id],function(err,result) {
                        productIds[index].names = result;
                        if(index == (productIds.length -1)){
                            cb(null)
                        }
                    })
                }


                // var len = productIds.length;
                // for(var i =0;i < len;i++){
                //     (function(i){
                //         var sql = "select pml.id as product_multi_id,l.language_name,pml.language_id,pml.name,	pml.product_desc,pml.measuring_unit from product_ml pml join language l on l.id = pml.language_id where product_id = ?";
                //         multiConnection[dbName].query(sql, [productIds[i].id],function(err,result) {
                //             productIds[i].names = result;
                //             if(i == (len -1)){
                //                 cb(null)
                //             }
                //         })
                //     }(i));
                // }
            }else{
                cb(null)
            }
        }],
        getVariants:['productList',function(cb){
            if(productIds.length){
                var len = productIds.length;

                for (const [index, i] of productIds.entries()) {
                    var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
                    multiConnection[dbName].query(vsql, [productIds[index].id],function(err,vData) {
                        productIds[index].variant = vData;
                        if(index == (productIds.length -1)){
                            cb(null)
                        }
                    })
                }



                // for(var i =0;i < len;i++){
                //     (function(i){
                //         var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
                //         multiConnection[dbName].query(vsql, [productIds[i].id],function(err,vData) {
                //             productIds[i].variant = vData;
                //             if(i == (len -1)){
                //                 cb(null)
                //             }
                //         })
                //     }(i));
                // }
            }else{
                cb(null)
            }
        }],
        getPrice:['getVariants',function(cb){
            if(productIds.length){
                var len = productIds.length;

                for(const [index,i] of productIds.entries()){
                    var sql = "SELECT p.user_type_id,p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
                    sql += " ,p.price_type,";
                    sql += " p.delivery_charges from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
                    sql += " p.is_deleted = ? and p.is_deleted=0 and p.product_id = ? " +
                        " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
                        console.log("===========price id sql ========>>>>>>>>",sql)
                let stmt = multiConnection[dbName].query(sql, [0,productIds[index].id],function(err,priceData) {
                    console.log("===========price id sql =====2====",stmt.sql)
                    productIds[index].price = priceData;
                    // logger.debug("+=========product pricing 11-------============",productIds[index].price)
                    if(index == (productIds.length -1)){
                        cb(null)
                    }
                })
                }

            //     for(var i =0;i < len;i++){  
            //         (function(i){
            //             var sql = "SELECT p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
            //                 sql += " ,p.price_type,";
            //                 sql += " p.delivery_charges from product_pricing p join supplier_branch_product s on p.product_id = s.product_id where ";
            //                 sql += " p.is_deleted = ? and p.is_deleted=0 and p.product_id = ? " +
            //                     " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
            //                     console.log("===========price id sql ========>>>>>>>>",sql)
            //             let stmt = multiConnection[dbName].query(sql, [0,productIds[i].id],function(err,priceData) {
            //                 console.log("===========price id sql =====2====",stmt.sql)
            //                 productIds[i].price = priceData;
            //                 logger.debug("+=========product pricing 11-------============",productIds[i].price)
            //                 if(i == (len -1)){
            //                     cb(null)
            //                 }
            //             })
            //     }(i));
            // }
        }
            else{
                cb(null)
            }
        }],
        last:['getProductMl','getProductImage','getVariants','getPrice',function(cb){
            if(serachType ==0){
                var sql = "select p.quantity,p.id from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit " +
                    " where p.is_global = ? and p.is_deleted = ? and p.parent_id=?"
            }
            else {
                var sql = "select p.quantity,p.name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name " +
                    "from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit" +
                    " where p.is_global = ? and p.is_deleted = ? and p.parent_id=?" +
                    "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%'" +
                    " or p.sku LIKE '%"+serachText+"%'or p.name LIKE '%"+serachText+"%')";
            }
            multiConnection[dbName].query(sql, [1, 0,parseInt(productId)],function(err,result){
                console.log(",,....",err,result.length);
                if(result.length){
                    // product_Count = result.length;
                    cb(null);
                }else{
                    // product_Count = 0;
                    cb(null);
                }
            })
        }],
    },function(err,result){
        if(err){
            callback(err);
        }else{
            
           // console.log("...productIds..",productIds);
           let data = {products:productIds,product_count:product_Count,"tax":tax}
           console.log("=-========data=============",data)
            callback(null,data)
        }
    })
}




exports.getCategories = function(db_name,res,callback) {

    var sql = "select IF((select COUNT(*) from categories cts where cts.parent_id=c.id )>0,1,0) as is_sub_category,c.category_flow,c.is_agent,c.agent_list,c.is_quantity,c.type,c.is_variant,c.id,c.name,c.is_barcode,c.order,c.product_addition_level from categories c where c.parent_id = 0 and c.is_deleted = 0 and c.id != 102 "
    var st=multiConnection[db_name].query(sql, [0, 0], function (err, result) {
        console.log(st.sql);
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null, result);
        }

    })
}

function listProductDetails(res,categoryId,subCategoryId,detailedSubCategoryId,limit,offset,callback) {
    var result={};
    var product_count=0;
    if(offset){
        var sql = "select p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
        sql += " from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit ";
        sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ORDER BY p.id DESC LIMIT ?,?";
        multiConnection[dbName].query(sql, [1, 0,categoryId,subCategoryId,detailedSubCategoryId,limit,offset], function (err, products) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res)
        }
        else {
            product_count=products.length
            var sql2 = "select p.id product_multi_id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit from product_ml p join language l on p.language_id = l.id";
            multiConnection[dbName].query(sql2, function (err, productMultiLanguage) {
                if (err) {
                    console.log(err);
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    //  console.log(JSON.stringify(productMultiLanguage));
                    var productLength = products.length;
                    var languageLength = productMultiLanguage.length;

                    if (!productLength) {
                        callback(null, [])
                    }
                    else {
                        for (var i = 0; i < productLength; i++) {
                            (function (i) {
                                var names = [];
                                for (var j = 0; j < languageLength; j++) {
                                    (function (j) {
                                        if (products[i].id == productMultiLanguage[j].product_id) {
                                            names.push(productMultiLanguage[j]);
                                            if (j == languageLength - 1) {
                                                products[i].names = names;
                                                if (i == productLength - 1) {
                                                    callback(null, products);
                                                }
                                            }
                                        }
                                        else {
                                            if (j == languageLength - 1) {
                                                products[i].names = names;
                                                if (i == productLength - 1) {
                                                    callback(null,  products);
                                                }
                                            }
                                        }
                                    }(j))
                                }
                            }(i))
                        }
                    }
                }
            })
        }
    })
    }
    else {
        var sql = "select p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
        sql += " from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit ";
        sql += " where p.is_global = ? and p.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ORDER BY p.id";
        multiConnection[dbName].query(sql, [1, 0,categoryId,subCategoryId,detailedSubCategoryId,limit,offset], function (err, products) {
            if (err) {
                console.log(err);
                sendResponse.somethingWentWrongError(res)
            }
            else {
                product_count=products.length
                var sql2 = "select p.id product_multi_id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit from product_ml p join language l on p.language_id = l.id";
                multiConnection[dbName].query(sql2, function (err, productMultiLanguage) {
                    if (err) {
                        console.log(err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        //  console.log(JSON.stringify(productMultiLanguage));
                        var productLength = products.length;
                        var languageLength = productMultiLanguage.length;

                        if (!productLength) {
                            callback(null, [])
                        }
                        else {
                            for (var i = 0; i < productLength; i++) {
                                (function (i) {
                                    var names = [];
                                    for (var j = 0; j < languageLength; j++) {
                                        (function (j) {
                                            if (products[i].id == productMultiLanguage[j].product_id) {
                                                names.push(productMultiLanguage[j]);
                                                if (j == languageLength - 1) {
                                                    products[i].names = names;
                                                    if (i == productLength - 1) {
                                                        callback(null, products);
                                                    }
                                                }
                                            }
                                            else {
                                                if (j == languageLength - 1) {
                                                    products[i].names = names;
                                                    if (i == productLength - 1) {
                                                        callback(null,  products);
                                                    }
                                                }
                                            }
                                        }(j))
                                    }
                                }(i))}
                        }
                    }

                })
            }
        })

    }
}


function productImages(res, products, callback) {
    if (products.length) {
        var sql = "select product_id,image_path,default_image,imageOrder from product_image ";
        multiConnection[dbName].query(sql, function (err, productImages) {
            if(err){
                sendResponse.somethingWentWrongError(res)
            }
            else{
                var imageLength = productImages.length;
                for(var i = 0 ; i < products.length ; i++)
                {
                    (function(i)
                    {
                        var images = [];
                        for(var j = 0 ; j < imageLength ; j++)
                        {
                            (function(j)
                            {
                                if(products[i].id == productImages[j].product_id)
                                {
                                  images.push(productImages[j]);
                                    if(j == imageLength - 1)
                                    {
                                        products[i].images = images;
                                        if(i == products.length - 1)
                                        {
                                            callback(null,products);
                                        }
                                    }
                                }
                                else {
                                    if(j == imageLength - 1)
                                    {
                                        products[i].images = images;
                                        if(i == products.length - 1)
                                        {
                                            callback(null,products);
                                        }
                                    }
                                }

                            }(j))

                        }

                    }(i))

                }
            }
        })
    }
    else {
        callback(null, []);
    }

}



exports.pendingApprovalProducts = function (db_name,res, callback) {
    var sql = "select s.name as supplier_name,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name ";
    sql += " from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit join supplier s on s.id = p.created_by ";
    sql += " where p.is_global = ? and p.is_deleted = ? and p.added_by != ? and p.approved_by_admin = ? and p.is_live = ?";
    multiConnection[db_name].query(sql, [0, 0, 0, 0, 0], function (err, products) {
        
        console.log("***********************err****************",err,products);
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null,products);
        }
    })
}


exports.getLoyaltyPoints = function (db_name,res, callback) {

    var sql = "select * from loyalty_points ";
    var statement = multiConnection[db_name].query(sql, function (err, result) {
        if (err) {
            logger.debug("=================in the getLoyaltyPoints=============",statement.sql,err)
            sendResponse.somethingWentWrongError(res);
        }
        else {
            logger.debug("=================in the getLoyaltyPoints=============",statement.sql,err,result)
            callback(null, result);
        }

    })
}


exports.listSuppliers = function (db_name,res, callback) {
    var sql = "select id,name from supplier where is_deleted = ? and is_active =1"
    multiConnection[db_name].query(sql, [0], function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        }
        else {
            callback(null, result)

        }

    })

} 
const uploadMgr = require('../lib/UploadMgr')
const moment = require('moment')

exports.clientProfile = async function (db_name,res,
    limit,offset,searchType,serachText,search,
    country_code,country_code_type,subscription_id,is_stripe_connected,callback) {
   limit=parseInt(limit);
    offset=parseInt(offset);

    var country_code_query = ""
    if(country_code!='' && country_code_type!=''){
        if(country_code_type=='1'){
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (u.country_code LIKE '"+cc_array[i]+"' or u.country_code LIKE '+"+cc_array[i]+"') "
            }
        }else{
            var cc_array = country_code.split(",");
            for (var i = 0; i < cc_array.length; i++) {
                country_code_query += " AND (u.country_code NOT LIKE '"+cc_array[i]+"' and u.country_code NOT LIKE '+"+cc_array[i]+"') "
            }
        }
    }
    var having_data="";
    if(subscription_id!=""){
        having_data = " having subscription_id='"+subscription_id+"' "
    }
    
    let stripeFilterQuery = ""

    if(parseInt(is_stripe_connected)==1){
        having_data = " having is_stripe_account=1 "
    }else if(parseInt(is_stripe_connected)==2){
        having_data = " having is_stripe_account=0 "

    }


    if(searchType == 1){
        var sql = "SELECT (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=u.user_created_id or send_to=u.user_created_id) and (`send_to_type`='USER' or `send_by_type`='USER') order by c_id desc limit 1) as message_id,u.user_created_id,(select ups.title from user_subscription us left join user_subscription_plans ups on us.subscription_plan_id=ups.id where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_title,(select us.start_date from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_start_date, (select us.end_date from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_end_date, (select us.id from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_id, u.user_type_id,u.country_code,u.iso,u.limit_cancel_orders,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders, u.email, u.mobile_no,u.documents,u.phone_no, u.firstname, u.lastname, u.gender, u.is_logged_in,email_verified," +
        " u.abn_number,u.business_name, IF((SELECT id FROM   user_cards WHERE  user_id = u.id AND is_deleted = 0 LIMIT  1)>0,1,0) AS is_stripe_account, u.id,u.id_for_invoice,u.dateOfBirth,u.otp_verified,u.user_image,u.total_loyality_amount,u.used_loyality_amount,u.device_type,u.is_verified,u.loyalty_points,u.is_active," +
        "u.fb_access_token FROM user u  where u.is_deleted = 0   and (u.email LIKE '%"+search+"%' OR u.firstname LIKE '%"+search+"%' OR u.phone_no LIKE '%"+search+"%' OR u.mobile_no LIKE '%"+search+"%') "+country_code_query +" group by u.id "+having_data+" order by u.id desc limit ?,? ";

        // var sql = "SELECT created_on,id, email, mobile_no, phone_no, firstname, lastname, gender, is_logged_in,email_verified," +
        //     "otp_verified,user_image,device_type,is_verified,loyalty_points,is_active," +
        //     "fb_access_token FROM user where is_deleted = 0 and (id LIKE '%"+serachText+"%' or email LIKE '%"+serachText+"%' " +
        //     " or mobile_no LIKE '%"+serachText+"%'or phone_no LIKE '%"+serachText+"%' " +
        //     " or firstname LIKE '%"+serachText+"%'or lastname LIKE '%"+serachText+"%' " +
        //     " or gender LIKE '%"+serachText+"%'or is_logged_in LIKE '%"+serachText+"%'" +
        //     " or email_verified LIKE '%"+serachText+"%'or otp_verified LIKE '%"+serachText+"%' or  (email LIKE '%"+search+"%' OR firstname LIKE '%"+search+"%' OR phone_no LIKE '%"+search+"%') ) LIMIT ?,? ";
    
    }else{

        let isHidePrivateData = await ExecuteQ.Query(db_name,
            "select `key`,`value` from tbl_setting where `key`=? and `value`=?",
            ["hide_private_data","1"]);

        var sql;
        if(isHidePrivateData && isHidePrivateData.length > 0){
            sql = "SELECT (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=u.user_created_id or send_to=u.user_created_id) and (`send_to_type`='USER' or `send_by_type`='USER') order by c_id desc limit 1) as message_id,u.user_created_id, (select ups.title from user_subscription us left join user_subscription_plans ups on us.subscription_plan_id=ups.id where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_title,(select us.start_date from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_start_date, (select us.end_date from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_end_date, (select us.id from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_id, u.user_type_id,u.country_code,u.iso,u.limit_cancel_orders,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders, concat(SUBSTRING(u.email,1,1),'**********') as email, concat(SUBSTRING(u.mobile_no,1,1),'**********') as mobile_no, u.phone_no, concat(SUBSTRING(u.firstname,1,1),'**********') as firstname, u.documents,u.lastname, u.gender, u.is_logged_in,email_verified," +
        " u.abn_number,u.business_name, IF((SELECT id FROM   user_cards WHERE  user_id = u.id AND is_deleted = 0 LIMIT  1)>0,1,0) AS is_stripe_account, u.id,u.id_for_invoice,u.dateOfBirth,u.otp_verified,u.user_image,u.device_type,u.is_verified,u.loyalty_points,u.total_loyality_amount,u.used_loyality_amount,u.is_active," +
        "u.fb_access_token FROM user u  where u.is_deleted = 0  "+country_code_query+" group by u.id "+having_data+" order by u.id desc limit ?,? ";
        }else{
            sql = "SELECT (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=u.user_created_id or send_to=u.user_created_id) and (`send_to_type`='USER' or `send_by_type`='USER') order by c_id desc limit 1) as message_id,u.user_created_id, (select ups.title from user_subscription us left join user_subscription_plans ups on us.subscription_plan_id=ups.id where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_title,(select us.start_date from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_start_date, (select us.end_date from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_end_date, (select us.id from user_subscription us where us.status='1' and us.is_deleted='0' and us.is_cancelled='0' and us.user_id=u.id limit 1) subscription_id, u.user_type_id,u.country_code,u.iso,u.limit_cancel_orders,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders, u.email, u.mobile_no, u.phone_no, u.firstname,u.documents,u.lastname, u.gender, u.is_logged_in,email_verified," +
        " u.abn_number,u.business_name, IF((SELECT id FROM   user_cards WHERE  user_id = u.id AND is_deleted = 0 LIMIT  1)>0,1,0) AS is_stripe_account, u.id,u.id_for_invoice,u.dateOfBirth,u.otp_verified,u.user_image,u.device_type,u.is_verified,u.loyalty_points,u.total_loyality_amount,u.used_loyality_amount,u.is_active," +
        "u.fb_access_token FROM user u  where u.is_deleted = 0  "+country_code_query+" group by u.id "+having_data+" order by u.id desc limit ?,? ";
        }

    }
    // let stmt = multiConnection[db_name].query(sql, [offset,limit], function (err, result) {
    //     logger.debug("===============stmt======>>>>>>>>>>>==",stmt.sql)
    //     if (err) {
    //         console.log("eee1",err)
    //         sendResponse.somethingWentWrongError(res);
    //     }
        let result=await ExecuteQ.Query(db_name,sql,[offset,limit]);

        console.log("======result====result===result==",result);

        if(result && result.length>0){
            for(const [index,i] of result.entries()){
                i.levelData=await Uninversal.getUserLoyalityLevelData(db_name,i.id);

                // i.is_stripe_account  = await Uninversal.checkIfUserStripeCard(db_name,i.id);

                // logger.debug("======is_stripe_account==============reuslt==========",result);

                if(i.fb_access_token)
                {
                    i.is_fb=1;
                    if(index==result.length-1){
                        callback(null, result);
                    }
                }
                else {
                    i.is_fb=0;
                    if(index==result.length-1){
                        callback(null, result);
                    }
                }
            }
            // for(var i=0;i<result.length;i++){
            //     (async function (i) {
            //         result[i].levelData=await Uninversal.getUserLoyalityLevelData(db_name,i.id);

            //         result[i].is_stripe_account = await Uninversal.checkIfUserStripeCard(db_name,i.id);
                    
                    
            //         if(result[i].fb_access_token)
            //         {
            //             result[i].is_fb=1;
            //             if(i==result.length-1){
            //                 callback(null, result);
            //             }
            //         }
            //         else {
            //             result[i].is_fb=0;
            //             if(i==result.length-1){
            //                 callback(null, result);
            //             }
            //         }
            //     }(i))
            // }
        }
       else {
            callback(null,result);
        }
    }
    // catch(Err){
    //     logger.debug("====clientProfile===",Err)
    //     sendResponse.somethingWentWrongError(res);
    // }

//    limit=parseInt(limit);
//     offset=parseInt(offset);
   
//     if(searchType == 1){
//         var sql = "SELECT u.user_type_id,u.country_code,u.iso,u.limit_cancel_orders,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders, u.email, u.mobile_no, u.phone_no, u.firstname, u.lastname, u.gender, u.is_logged_in,email_verified," +
//         "u.otp_verified,u.user_image,u.device_type,u.is_verified,u.loyalty_points,u.is_active," +
//         "u.fb_access_token FROM user u  where u.is_deleted = 0 and (u.email LIKE '%"+search+"%' OR u.firstname LIKE '%"+search+"%' OR u.phone_no LIKE '%"+search+"%' OR u.mobile_no LIKE '%"+search+"%') group by u.id order by u.id desc limit ?,? ";

//         // var sql = "SELECT created_on,id, email, mobile_no, phone_no, firstname, lastname, gender, is_logged_in,email_verified," +
//         //     "otp_verified,user_image,device_type,is_verified,loyalty_points,is_active," +
//         //     "fb_access_token FROM user where is_deleted = 0 and (id LIKE '%"+serachText+"%' or email LIKE '%"+serachText+"%' " +
//         //     " or mobile_no LIKE '%"+serachText+"%'or phone_no LIKE '%"+serachText+"%' " +
//         //     " or firstname LIKE '%"+serachText+"%'or lastname LIKE '%"+serachText+"%' " +
//         //     " or gender LIKE '%"+serachText+"%'or is_logged_in LIKE '%"+serachText+"%'" +
//         //     " or email_verified LIKE '%"+serachText+"%'or otp_verified LIKE '%"+serachText+"%' or  (email LIKE '%"+search+"%' OR firstname LIKE '%"+search+"%' OR phone_no LIKE '%"+search+"%') ) LIMIT ?,? ";
    
//     }else{
//         var sql = "SELECT u.user_type_id,u.country_code,u.iso,u.limit_cancel_orders,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders, u.email, u.mobile_no, u.phone_no, u.firstname, u.lastname, u.gender, u.is_logged_in,email_verified," +
//         "u.otp_verified,u.user_image,u.device_type,u.is_verified,u.loyalty_points,u.is_active," +
//         "u.fb_access_token FROM user u  where u.is_deleted = 0 group by u.id order by u.id desc limit ?,? "

//     }
//     let stmt = multiConnection[db_name].query(sql, [offset,limit], function (err, result) {
//         logger.debug("===============stmt======>>>>>>>>>>>==",stmt.sql)
//         if (err) {
//             console.log("eee1",err)
//             sendResponse.somethingWentWrongError(res);
//         }
//         else {
//             if(result.length){
//                 for(var i=0;i<result.length;i++){
//                     (function (i) {
//                         if(result[i].fb_access_token)
//                         {
//                             result[i].is_fb=1;
//                             if(i==result.length-1){
//                                 callback(null, result);
//                             }
//                         }
//                         else {
//                             result[i].is_fb=0;
//                             if(i==result.length-1){
//                                 callback(null, result);
//                             }
//                         }
//                     }(i))
//                 }
//             }
//            else {
//                 callback(null,result);
//             }
//         }

//     })

//}

exports.getTotalClientProfile = function (db_name,res,limit,offset,searchType,serachText,search,country_code,country_code_type) {
    limit=parseInt(limit);
     offset=parseInt(offset);
     return new Promise(async (resolve,reject)=>{
         try{
            var country_code_query = ""
            if(country_code!='' && country_code_type!=''){
                if(country_code_type=='1'){
                    var cc_array = country_code.split(",");
                    for (var i = 0; i < cc_array.length; i++) {
                        country_code_query += " AND (u.country_code LIKE '"+cc_array[i]+"' or u.country_code LIKE '+"+cc_array[i]+"') "
                    }
                }else{
                    var cc_array = country_code.split(",");
                    for (var i = 0; i < cc_array.length; i++) {
                        country_code_query += " AND (u.country_code NOT LIKE '"+cc_array[i]+"' and u.country_code NOT LIKE '+"+cc_array[i]+"') "
                    }
                }
            }
            if(searchType == 1){
                var sql = "SELECT (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=u.user_created_id or send_to=u.user_created_id) and (`send_to_type`='USER' or `send_by_type`='USER') order by c_id desc limit 1) as message_id,u.user_created_id,u.limit_cancel_orders,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders,u.business_name,u.abn_number, u.email, u.mobile_no, u.phone_no, u.firstname, u.lastname, u.gender, u.is_logged_in,email_verified," +
                "u.otp_verified,u.user_image,u.device_type,u.is_verified,u.loyalty_points,u.is_active," +
                "u.fb_access_token FROM user u left join orders o on o.user_id = u.id where u.is_deleted = 0 and (u.email LIKE '%"+search+"%' OR u.firstname LIKE '%"+search+"%' OR u.phone_no LIKE '%"+search+"%' OR u.mobile_no LIKE '%"+search+"%') "+country_code_query+" group by u.id order by u.id desc  ";
    
            }else{
                var sql = "SELECT (SELECT message_id FROM `chats` WHERE (`send_to_type`='ADMIN' or `send_by_type`='ADMIN') and (send_by=u.user_created_id or send_to=u.user_created_id) and (`send_to_type`='USER' or `send_by_type`='USER') order by c_id desc limit 1) as message_id,u.user_created_id, u.limit_cancel_orders,u.business_name,u.abn_number,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders, u.email, u.mobile_no, u.phone_no, u.firstname, u.lastname, u.gender, u.is_logged_in,email_verified," +
                "u.otp_verified,u.user_image,u.device_type,u.is_verified,u.loyalty_points,u.is_active," +
                "u.fb_access_token FROM user u left join orders o on o.user_id = u.id where u.is_deleted = 0 "+country_code_query+" group by u.id order by u.id desc  "
        
            }
            let result=await ExecuteQ.Query(db_name,sql,[offset,limit]);
            if(result.length){
                for(var i=0;i<result.length;i++){
                    (function (i) {
                        if(result[i].fb_access_token)
                        {
                            result[i].is_fb=1;
                            if(i==result.length-1){
                                resolve(result);
                            }
                        }
                        else {
                            result[i].is_fb=0;
                            if(i==result.length-1){
                                resolve(result);
                            }
                        }
                    }(i))
                }
            }
           else {
                resolve(result);
            }
         }
         catch(Err){
            sendResponse.somethingWentWrongError(res);
         }
        })
    //     if(searchType == 1){
    //         var sql = "SELECT u.limit_cancel_orders,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders, u.email, u.mobile_no, u.phone_no, u.firstname, u.lastname, u.gender, u.is_logged_in,email_verified," +
    //         "u.otp_verified,u.user_image,u.device_type,u.is_verified,u.loyalty_points,u.is_active," +
    //         "u.fb_access_token FROM user u left join orders o on o.user_id = u.id where u.is_deleted = 0 and (u.email LIKE '%"+search+"%' OR u.firstname LIKE '%"+search+"%' OR u.phone_no LIKE '%"+search+"%' OR u.mobile_no LIKE '%"+search+"%') group by u.id order by u.id desc  ";

    //     }else{
    //         var sql = "SELECT u.limit_cancel_orders,u.created_on,u.id,( select count(*) from orders where user_id=u.id and status=5 ) as total_delivered_orders, u.email, u.mobile_no, u.phone_no, u.firstname, u.lastname, u.gender, u.is_logged_in,email_verified," +
    //         "u.otp_verified,u.user_image,u.device_type,u.is_verified,u.loyalty_points,u.is_active," +
    //         "u.fb_access_token FROM user u left join orders o on o.user_id = u.id where u.is_deleted = 0 group by u.id order by u.id desc  "
    
    //     }
    //     // let result=await ExecuteQ.Query(db_name,sql,[offset,limit]);

    //     let stmt = multiConnection[db_name].query(sql, [offset,limit], function (err, result) {
    //         logger.debug("===============stmt======>>>>>>>>>>>==",stmt.sql)
    //         if (err) {
    //             console.log("eee1",err)
    //             sendResponse.somethingWentWrongError(res);
    //         }
    //         else {
    //             if(result.length){
    //                 for(var i=0;i<result.length;i++){
    //                     (function (i) {
    //                         if(result[i].fb_access_token)
    //                         {
    //                             result[i].is_fb=1;
    //                             if(i==result.length-1){
    //                                 resolve(result);
    //                             }
    //                         }
    //                         else {
    //                             result[i].is_fb=0;
    //                             if(i==result.length-1){
    //                                 resolve(result);
    //                             }
    //                         }
    //                     }(i))
    //                 }
    //             }
    //            else {
    //                 resolve(result);
    //             }
    //         }
    
    //     })
    //  })
 
 }  

exports.makeCsvOfRecords = function(totalClientProfiles,limit,offset){
     return new Promise(async(resolve,reject)=>{
            let header = [ 
                {id: 'ID', title: 'ID'},
                // {id: 'IMAGE', title: 'IMAGE'},
                {id: 'NAME', title: 'NAME'},
                {id: 'EMAIL', title: 'EMAIL'},
                {id: 'PHONE', title: 'PHONE'},
                {id: 'OTP VERIFIED', title: 'OTP VERIFIED'},
                {id: 'FLAGGED', title: 'FLAGGED'},
                {id: 'JOINED ON', title: 'JOINED ON'},
                {id: 'BUSINESS NAME', title: 'BUSINESS NAME'},
                {id: 'ABN NUMBER', title: 'ABN NUMBER'},
                {id: 'STATUS', title: 'STATUS'}
              ]
            
            let data = totalClientProfiles.map((element) => {
                console.log("+==============",moment(element.created_on).format("MMMM DD,YYYY"))
                let temp = {}    
                temp.ID = element.id

                // temp.IMAGE = element.user_image!==""?element.user_image:""
                temp.NAME = element.firstname
                temp.EMAIL = element.email
                temp.PHONE = element.mobile_no!==""?element.mobile_no:""
                temp["OTP VERIFIED"] = element.otp_verified!==1?"NO":"YES"
                temp.FLAGGED = element.limit_cancel_orders<=2?"NO":"YES"
                temp["JOINED ON"] =  moment(element.created_on).format("MMMM DD,YYYY")  
                temp["BUSINESS NAME"] =  element.business_name
                temp["ABN NUMBER"] =  element.abn_number
                temp.STATUS = element.is_active!==1?"OFF":"ON"
                console.log("==============temp========",temp)
                return temp; 
         })

         let csvFileLink = await uploadMgr.uploadCsvFileNew(data,header,"user_list_")
         resolve(csvFileLink);
     })
 }

exports.rateCommentListing =  function (db_name,res,callback) {

    var sql="select sr.id,s.name,CONCAT(u.firstname,' ',u.lastname) As User_Name,sr.rating,sr.comment,sr.is_approved,sr.rated_on from supplier_rating sr join supplier s on s.id=sr.supplier_id " +
        "join user u on u.id=sr.user_id";

    multiConnection[db_name].query(sql,function (err,rating) {
        if(err)
        {
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res);

        }
        else {
        //    console.log('result-----',rating);
            callback(null,rating);

        }
    })

}

exports.feedbackList = function (db_name,res,callback) {

    var sql="select o.id,CONCAT(u.firstname,' ',u.lastname) As User_Name,s.name as supplier,o.CommentApprove as is_approved,o.is_read,o.net_amount,c.currency_name,o.rating,o.comment,o.rated_on " +
        "from orders o join user u on u.id=o.user_id join currency_conversion c on c.id=o.currency_id join supplier_branch sb on sb.id=o.supplier_branch_id " +
        "join supplier s on s.id=sb.supplier_id where o.status = 6 order by o.id DESC";

    multiConnection[db_name].query(sql,function (err,feedback) {
        if(err)
        {
            console.log('error------',err);
            sendResponse.somethingWentWrongError(res);
        }
        else if(feedback.length)  {
            callback(null,feedback);
        }
        else {
            var data = []
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

        }
    })
}



exports.listSocialAccounts = function(db_name,res,callback)
{
    var sql = "select * from social_account_links limit 1";
    multiConnection[db_name].query(sql,function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })
    
}




exports.listUsers = function(db_name,res,callback)
{
    var sql = "select id,dateOfBirth,email,CONCAT(country_code,'',mobile_no) mobile_no from user ";
    multiConnection[db_name].query(sql,function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){
                for(var i = 0 ; i < result.length ; i++)
                {
                    (function(i)
                    {
                        result[i].type = 0;
                        if(i == result.length - 1)
                        {
                            callback(null,result);
                        }
    
                    }(i))
    
                }
    
            }else{
                callback(null,[])
            }
        }

    })

}


exports.listSuppliersForSettingsPage = async function(dbName,res,callback)
{
    try{
        var sql = "select id,email,mobile_number_1 mobile_no from supplier where is_deleted = 0 ";
        let result=await ExecuteQ.Query(dbName,sql,[]);
        if(result && result.length>0){
            for(var i = 0 ; i < result.length ; i++)
            {
                (function(i)
                {
                    result[i].type = 1;
                    if(i == result.length - 1)
                    {
                        callback(null,result);
                    }

                }(i))

            }
        }else{
            callback(null,[])
        }
    }
    catch(Err){
        logger.debug("=====Err!==>",Err);
        sendResponse.somethingWentWrongError(res);
    }

    // var sql = "select id,email,mobile_number_1 mobile_no from supplier where is_deleted = 0 ";
    // multiConnection[dbName].query(sql,function(err,result)
    // {
    //     if(err){
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else{
    //         if(result && result.length>0){
    //             for(var i = 0 ; i < result.length ; i++)
    //             {
    //                 (function(i)
    //                 {
    //                     result[i].type = 1;
    //                     if(i == result.length - 1)
    //                     {
    //                         callback(null,result);
    //                     }
    
    //                 }(i))
    
    //             }
    //         }else{
    //             callback(null,[])
    //         }
    //     }
    // })


}

exports.listAgentsForSettingsPage = async function(dbName,res,callback)
{
    try{
        let getAgentDbData=await common.GetAgentDbInformation(dbName); 
        let agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
        var sql = "select id,email,phone_number from cbl_user where deleted_by=0";
        let result=await ExecuteQ.QueryAgent(agentConnection,sql,[])
        if(result && result.length>0){
            for(var i = 0 ; i < result.length ; i++)
            {
                (function(i)
                {
                    result[i].type = 2;
                    if(i == result.length - 1)
                    {
                        callback(null,result);
                    }

                }(i))

            }
        }else{
            callback(null,[])
        }
    }
    catch(Err){
        logger.debug("=====Err!==>",Err);
        sendResponse.somethingWentWrongError(res);
    }




}



exports.listTandC = function(db_name,res, callback)
{
    var sql = "select t.terms_and_conditions,t.faq,t.about_us,l.language_name,l.id language_id from terms_and_conditions t join language l on t.language_id = l.id ";
    multiConnection[db_name].query(sql,function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res)
        }
        else{
            callback(null,result)
        }

    })

}
