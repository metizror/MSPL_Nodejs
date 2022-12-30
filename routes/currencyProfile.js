/**
 * Created by vinay on 15/2/16.
 */

var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');

var currencyProfile = require('./currencyProfile');
/*
 *============================================= multiple country Ids will be # separated ===================================================================
 */


/*
 * This function is used to add currency
 * with the conversion rate according to
 * base currency i.e.,AED
 * Parameters  : accessToken,authSectionId,currencyName(currency),conversionRate,currencySymbol,countryIds
 *
 */
exports.addCurrency = function(req,res){

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId.toString();
    var currency  = req.body.currency;
    var conversionRate = req.body.conversionRate;
    var currencySymbol = req.body.currencySymbol;
    var countryIds = req.body.countryIds.toString();
    var adminId;

    var manValue = [accessToken,authSectionId,currency,conversionRate,currencySymbol,countryIds];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(req.dbName,accessToken,res,cb);
        },
        function(adminId1,cb){
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,authSectionId,res,cb);
        },
        function(cb){
            addCurrencyToCountry(req.dbName,res,cb,currency,currencySymbol,conversionRate,countryIds);
        },
        
        
        
        
        //function(cb){
        //    currencyProfile.getCountryWithCurrencyAndDefaultTrue(res,cb);
        //},
        function(cb){
            func.insertAdminActions(req.dbName,res,cb,adminId,constant.responseMessage.CURRENCY_ADDED+" to country with id "+countryIds,baseUrl+"/add_currency");
        }
        //function(queryData,cb){
        //        clubCurrencyData(cb,queryData);
        //}
    ],function(err,response){
            if(err){
                logger.debug("==================error in currency profile-=======================")
                sendResponse.somethingWentWrongError(res);
            }else{
                var data  = {};
                //    data.currency_data = response;
                //     data.base_currency = "AED";

                logger.debug("==============data========"+JSON.stringify(response));
                    sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS,res,constant.responseStatus.SUCCESS);
            }
    })

}



/*
 * This function is used to get currency details
 * with the country details.
 * Parameters : accessToken,authSectionId
 *
 */
exports.getCurrencyProfile = function(req,res){

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId.toString();


    var manValue = [accessToken,authSectionId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(req.dbName,accessToken,res,cb);
        },
        function(adminId,cb){
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,authSectionId,res,cb);
            logger.debug("==================after checkforAuthorityofThisAdmin======================",cb)
        },
        function(cb){
            currencyProfile.getCountryWithCurrencyAndDefaultTrue(req.dbName,res,cb);
        }
        //function(queryData,cb){
        //    clubCurrencyData(cb,queryData);
        //}
    ],function(err,response){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            //var data  = {};
            //data.currency_data = response;
            //data.base_currency = "AED";

            // console.log("==============data========"+JSON.stringify(response));
            sendResponse.sendSuccessData(response,constant.responseMessage.SUCCESS,res,constant.responseStatus.SUCCESS);
        }
    })

}


/*
 * This function is used to get countries
 * which has no currency.
 * Parameters  : accessToken,authSectionId
 *
 */
exports.getCountryAtAddMore = function(req,res){

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId.toString();

    var manValue = [accessToken,authSectionId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(req.dbName,accessToken,res,cb);
        },
        function(adminId,cb){
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,authSectionId,res,cb);
        },
        function(cb){
            getCountryWithoutCurrency(req.dbName,res,cb);
        }
    ],function(err,response){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            var data = response;
           // console.log("==============data========"+JSON.stringify(response));
            sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS,res,constant.responseStatus.SUCCESS);
        }
    })

}


/*
 * This function is used to get countries
 * which has no currency.
 * Parameters  : accessToken,authSectionId
 *
 */
exports.getAllCountries = function(req,res){

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId.toString();

    var manValue = [accessToken,authSectionId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(req.dbName,accessToken,res,cb);
        },
        function(adminId,cb){
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,authSectionId,res,cb);
        },
        function(cb){
            getAllCountries(req.dbName,res,cb);
        }
    ],function(err,response){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            var data = response;
           // console.log("==============data========"+JSON.stringify(response));
            sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS,res,constant.responseStatus.SUCCESS);
        }
    })

}

/*
 * This function is used to get currency details
 * with country details when user click to
 * edit curreny(of particular currency)
 * Parameters : accessToken,authSectionId,currencyId
 *
 */
exports.getCurrencyDataAtEdit = function(req,res){

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId.toString();
    var currencyId  = req.body.currencyId.toString();
    var countryWithCurrency;

    var manValue = [accessToken,authSectionId,currencyId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(req.dbName,accessToken,res,cb);
        },
        function(adminId,cb){
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,authSectionId,res,cb);
        },
        function(cb){
            getCountryWithCurrency(req.dbName,res,cb,currencyId);
        },
        function(countryWithCurrency1,cb){
            countryWithCurrency = countryWithCurrency1;
            getCountryWithoutCurrency(req.dbName,res,cb);
        },
        function(countryWithoutCurrency,cb){
            clubDataForEdit(res,cb,countryWithCurrency,countryWithoutCurrency);
        }
    ],function(err,response){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
           // var data  = {};
            //data.currency_data = response;
            //data.base_currency = "AED";

          //  console.log("==============data========"+JSON.stringify(response));
            sendResponse.sendSuccessData(response,constant.responseMessage.SUCCESS,res,constant.responseStatus.SUCCESS);
        }
    })

}



/*
 *This function is used to edit corrency details
 * Parameters : accessToken,authSectionId,currencyId,currencyName,conversionRate,currencySymbol,countryIds
 */
exports.editThisCurrency = function(req,res){

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId.toString();
    var currencyId  = req.body.currencyId.toString();
    var currencyName  = req.body.currencyName;
    var conversionRate = req.body.conversionRate;
    var currencySymbol = req.body.currencySymbol;
    var countryIds = req.body.countryIds.toString();
    var adminId;

    var manValue = [accessToken,authSectionId,currencyName,conversionRate,currencySymbol,currencyId,countryIds];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(req.dbName,accessToken,res,cb);
        },
        function(adminId1,cb){
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,authSectionId,res,cb);
        },
        function(cb){
            editCurrency(req.dbName,res,cb,currencyId,currencyName,currencySymbol,conversionRate);
        },
        function(cb){
            editCountryOfCurrency(req.dbName,res,cb,currencyId,countryIds);
        },
        //function(cb){
        //    currencyProfile.getCountryWithCurrencyAndDefaultTrue(res,cb);
        //},
        function(cb){
            func.insertAdminActions(res,cb,adminId,constant.responseMessage.CURRENCY_EDITED+" with id "+currencyId,baseUrl+"/edit_currency");
        }
        //function(queryData,cb){
        //    clubCurrencyData(cb,queryData);
        //}
    ],function(err,response){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            var data  = {};
            //data.currency_data = response;
            //data.base_currency = "AED";

         //   console.log("==============data========"+JSON.stringify(response));
            sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS,res,constant.responseStatus.SUCCESS);
        }
    })

}



/*
 *This function is used to delete currency
 * Parameters : accessToken,authSectionId,currencyId
 */
exports.deleteThisCurrency = function(req,res){

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId.toString();
    var currencyId  = req.body.currencyId.toString();
    var adminId;
    var manValue = [accessToken,authSectionId,currencyId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(req.dbName,accessToken,res,cb);
        },
        function(adminId1,cb){
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,authSectionId,res,cb);
        },
        function(cb){
            deleteCurrency(req.dbName,res,cb,currencyId);
        },
        function(cb){
            deleteCountriesOfThisCurrency(req.dbName,res,cb,currencyId);
        },
        //function(cb){
        //    getCountryWithCurrencyAndDefaultTrue(res,cb);
        //},
        function(cb){
            func.insertAdminActions(req.dbName,res,cb,adminId,constant.responseMessage.CURRENCY_DELETED+" with id "+currencyId,baseUrl+"/delete_currency");
        }
        //function(queryData,cb){
        //    clubCurrencyData(cb,queryData);
        //}
    ],function(err,response){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            var data  = {};
            //data.currency_data = response;
            //data.base_currency = "AED";

          //  console.log("==============data========"+JSON.stringify(response));
            sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS,res,constant.responseStatus.SUCCESS);
        }
    })

}


/*
 *This function is used to make a currency
 * deafult currency
 * Parameters : accessToken,authSectionId,currencyId
 */

exports.makeDefaultThisCurrency = function(req,res){

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId.toString();
    var currencyId  = req.body.currencyId.toString();

    var manValue = [accessToken,authSectionId,currencyId];
    var adminId;
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(req.dbName,accessToken,res,cb);
        },
        function(adminId1,cb){
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId,authSectionId,res,cb);
        },
        function(cb){
            setDefaultCurrency(req.dbName,res,cb,currencyId);
        },
        //function(cb){
        //    currencyProfile.getCountryWithCurrencyAndDefaultTrue(res,cb);
        //},
        function(cb){
            func.insertAdminActions(req.dbName,res,cb,adminId,constant.responseMessage.CURRENCY_MADE_DEFAULT+" with id "+currencyId,baseUrl+"/set_default_currency");
        }
        //function(queryData,cb){
        //    clubCurrencyData(cb,queryData);
        //}
    ],function(err,response){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            var data  = {};
            //data.currency_data = response;
            //data.base_currency = "AED";

          //  console.log("==============data========"+JSON.stringify(response));
            sendResponse.sendSuccessData(data,constant.responseMessage.SUCCESS,res,constant.responseStatus.SUCCESS);
        }
    })

}



function addCurrencyToCountry(dbName,res,callback,currency,currencySymbol,conversionRate,countryIds){
    var ids = countryIds.split("#");
    var countryQueryString = '';
    var insertLength ="(?,?),";
    var idsLength = ids.length;
    var conversionId;
    var values = [];
    async.waterfall([
        function(cb){
            var sql = "insert into currency_conversion(conversion_rate,currency_name,currency_symbol)";
            sql += " values(?,?,?)";
            multiConnection[dbName].query(sql,[conversionRate,currency,currencySymbol],function(err1,reply1){
                if(err1){
                    sendResponse.somethingWentWrongError(res);
                }else{
                    console.log("con...id============"+reply1.insertId);
                     conversionId = reply1.insertId;
                    cb(null);
                }
            })
        },
        function(cb){
            for(var i = 0; i < idsLength; i++){
                (function(i) {
                    countryQueryString += insertLength;
                    values.push(conversionId,ids[i]);
                    if(i == idsLength -1){
                        cb(null);
                    }
                }(i))
            }
        },
        function(cb){
            countryQueryString = countryQueryString.substr(0,countryQueryString.length-1);
          //  console.log("countryQueryString=============="+countryQueryString);
            var sql = "insert into currency_country(currency_conversion_id,country_id) values"+countryQueryString;
            multiConnection[dbName].query(sql,values,function(err2,reply2){
                if(err2){
                    console.log("===========error==========="+err);
                    sendResponse.somethingWentWrongError(res);
                }else{
                    callback(null);
                }
            })

        }
    ],function(err,response){

    })

}



exports.getCountryWithCurrencyAndDefaultTrue = function(db_name,res,cb){
    console.log("====from getCountryWithCurrencyAndDefaultTrue");
    var sql = "select cc.currency_conversion_id,cc.country_id,cco.currency_name,cco.currency_symbol,cco.conversion_rate,c.name as country_name,";
    sql += "if (cd.is_default IS NULL,0,1) as is_default  from currency_country cc join currency_conversion cco on";
    sql +=" cc.currency_conversion_id = cco.id join country c on cc.country_id = c.id left join currency_default cd";
    sql +=" on cc.currency_conversion_id=cd.currency_conversion_id where c.is_deleted = 0 ";
    multiConnection[db_name].query(sql,[],function(err,response){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            if(response.length){
                clubCurrencyData(cb,response);
               // cb(null,response);
            }else{
             //   console.log("====from else"+response);
                clubCurrencyData(cb,[]);
                //sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
            }
        }
    })
}


function clubCurrencyData(cb,queryData){


    var aLength = queryData.length;
    if(aLength){
        var currency = [];
        for(var i=0;i < aLength; i++)
        {
            (function(i)
            {
                if(i == 0)
                {

                    var country_data =[];
                    for(var m=0;m<aLength;m++)
                    {
                        (function(m)
                        {
                            if(queryData[m].currency_conversion_id == queryData[i].currency_conversion_id)
                            {
                                country_data.push({"country_id":queryData[m].country_id,"country_name":queryData[m].country_name});
                                if(m == aLength -1)
                                {
                                    currency.push({"currency_id":queryData[i].currency_conversion_id,"conversion_rate":queryData[i].conversion_rate,"currency_symbol":queryData[i].currency_symbol,"is_default":queryData[i].is_default,"currency_name":queryData[i].currency_name,"country_data":country_data});
                                }

                            }
                            else
                            {
                                if(m == aLength -1)
                                {
                                    currency.push({"currency_id":queryData[i].currency_conversion_id,"conversion_rate":queryData[i].conversion_rate,"currency_symbol":queryData[i].currency_symbol,"is_default":queryData[i].is_default,"currency_name":queryData[i].currency_name,"country_data":country_data});
                                }
                            }

                        }(m))

                    }

                }

                else
                {
                    var check = false;

                    for( var k = 0; k <currency.length; k++)
                    {
                        (function(k)
                        {
                           // console.log("value of k====="+k);
                            if(currency[k].currency_id == queryData[i].currency_conversion_id)
                            {
                                console.log("id matched.. not push "+ queryData[i].currency_conversion_id );
                                check = true;
                                if(i==aLength -1)
                                    console.log("unique currency ids 0 === " +JSON.stringify(currency));

                            }

                            else{


                                if( k == currency.length-1 && !check){
                                  //  console.log("gdshghjdfsdgf");
                                  //  console.log("value of k====="+k);
                                    var j = i;
                                    var country_data =[];
                                    for(; j < aLength; j++)
                                    {
                                        (function(j)
                                        {
                                         //   console.log("value of j and i "+j+"========"+i);
                                            if(queryData[i].currency_conversion_id == queryData[j].currency_conversion_id)
                                            {
                                               // console.log("inside country push");
                                                country_data.push({"country_id":queryData[j].country_id,"country_name":queryData[j].country_name});
                                                if(j == aLength -1)
                                                {
                                                    //console.log("inside j end"+(aLength -1));
                                                    currency.push({"currency_id":queryData[i].currency_conversion_id,"conversion_rate":queryData[i].conversion_rate,"currency_symbol":queryData[i].currency_symbol,"is_default":queryData[i].is_default,"currency_name":queryData[i].currency_name,"country_data":country_data});

                                                    if(i == aLength -1)
                                                        console.log("unique currency ids === " +JSON.stringify(currency));

                                                }

                                            }
                                            else
                                            {
                                                if(j == aLength -1)
                                                {
                                                   // console.log("inside j end"+(aLength -1));
                                                    currency.push({"currency_id":queryData[i].currency_conversion_id,"conversion_rate":queryData[i].conversion_rate,"currency_symbol":queryData[i].currency_symbol,"is_default":queryData[i].is_default,"currency_name":queryData[i].currency_name,"country_data":country_data});

                                                    if(i == aLength -1){
                                                        var data  = {};
                                                        data.currency_data = currency;
                                                        data.base_currency = "AED";
                                                        var arr = [];
                                                        arr.push(data);
                                                        cb(null,arr);
                                                    }

                                                        //cb(null,currency);

                                                }

                                            }



                                        }(j))

                                    }

                                }

                            }


                        }(k))

                    }


                }
                if(i == aLength -1){
                    var data  = {};
                    data.currency_data = currency;
                    data.base_currency = "AED";
                    var arr = [];
                    arr.push(data);
                    cb(null,arr);
                   // cb(null,currency);
                }


            }(i))

        }
    }else{
        var data  = {};
        data.currency_data = currency;
        data.base_currency = "AED";
        var arr = [];
        arr.push(data);
        cb(null,arr);
      //  cb(null,[]);
    }



}



function getCountryWithoutCurrency(dbName,res,cb){

    var sql = "select c.id as country_id,c.name as country_name from country c where c.id not in (select distinct country_id from currency_country) and c.is_deleted = 0 ";
    multiConnection[dbName].query(sql,[],function(err,reply){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else if(reply.length){
            cb(null,reply);
        }else{
            cb(null,[]);
        }
    })

}
function getAllCountries(dbName,res,cb){

    var sql = "select c.id as country_id,c.name as country_name, c.country_code from country c  where c.is_deleted = 0 ";
    multiConnection[dbName].query(sql,[],function(err,reply){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else if(reply.length){
            cb(null,reply);
        }else{
            cb(null,[]);
        }
    })

}


function getCountryWithCurrency(dbName,res,callback,currencyId){

    var sql = "select cc.country_id,cc.currency_conversion_id,cco.conversion_rate,cco.currency_name,c.name as country_name";
    sql += " from currency_country cc join currency_conversion cco on cc.currency_conversion_id = cco.id";
    sql += " join country c on c.id=cc.country_id where cc.currency_conversion_id = ?";
    multiConnection[dbName].query(sql,[currencyId],function(err,reply){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else if(reply.length){
            callback(null,reply);
        }else{

            callback(null,[]);
        }
    })
}




function clubDataForEdit(res,callback,countryWithCurrency,countryWithoutCurrency){

   // console.log("==========================="+JSON.stringify(countryWithCurrency));
    var countryWithCurrencyLength = countryWithCurrency.length;
     var currency = [];
    var country_data = [];
    if(countryWithCurrencyLength){
        for(var i = 0; i < countryWithCurrencyLength; i++){
            (function(i){
                country_data.push({"country_name":countryWithCurrency[i].country_name,"country_id":countryWithCurrency[i].country_id});
                if(i == countryWithCurrencyLength-1){
                    currency.push({"currency_id":countryWithCurrency[i].currency_conversion_id,"currency_name":countryWithCurrency[i].currency_name,"conversion_rate":countryWithCurrency[i].conversion_rate,"assigned_countries":country_data,"non_assigned_countries":countryWithoutCurrency});
                    callback(null,currency);
                }
            }(i))
        }
    }else{
        callback(null,[]);
    }

}


function editCurrency(dbName,res,callback,currencyId,currencyName,currencySymbol,conversionRate){

    /*
     * If currencyId == 1 means AED,
     * so we will not change anything about this.
     * As AED is fixed, any change will be made
     * directly in db.
     */    
    if(parseInt(currencyId) != 1){
        var sql = "update currency_conversion set currency_name = ? , currency_symbol = ? , conversion_rate = ? where id = ? ";
        multiConnection[dbName].query(sql,[currencyName,currencySymbol,conversionRate,currencyId],function(err,reply){
            if(err){
                sendResponse.somethingWentWrongError(res);
            }else{
                callback(null);
            }
        })
    }else{
        callback(null);
    }

}


function editCountryOfCurrency(dbName,res,callback,currencyId,countryIds){

    var ids = countryIds.split("#");
    var countryQueryString = '';
    var insertLength ="(?,?),";
    var idsLength = ids.length;
    var values = [];
/*
 *Below countryId 1 i.e., of Dubai,
 * is removed from ids.
 */

    if (ids.indexOf('1') !== -1) {
        ids.splice(ids.indexOf('1'),1);
        console.log(ids);
    }

   // console.log("==========from editCountryOfCurrency============");
    async.waterfall([
        function(cb){

            /*
             *Here we are deleting all the countries corressponding
             * to currencyId, but if country Id is of Dubai and currencyId
             * is AED then that record will not be deleted.
             */

            var sql = "delete from currency_country where currency_conversion_id = ? and country_id != ? ";
            multiConnection[dbName].query(sql,[currencyId,1],function(err1,reply1){
                if(err1){
                    sendResponse.somethingWentWrongError(res);
                }else{
                    cb(null);
                }
            })
        },
        function(cb){
            for(var i = 0; i < idsLength; i++){
                (function(i) {
                    countryQueryString += insertLength;
                    values.push(currencyId,ids[i]);
                    if(i == idsLength -1){
                        cb(null);
                    }
                }(i))
            }
        },
        function(cb){
            countryQueryString = countryQueryString.substr(0,countryQueryString.length-1);
          //  console.log("countryQueryString=============="+countryQueryString);
            var sql = "insert into currency_country(currency_conversion_id,country_id) values"+countryQueryString;
            multiConnection[dbName].query(sql,values,function(err2,reply2){
                if(err2){
                    console.log("===========error==========="+err);
                    sendResponse.somethingWentWrongError(res);
                }else{
                    callback(null);
                }
            })
        }
    ],function(error,response){

    })
}


function  deleteCurrency(dbName,res,callback,currencyId){

    if(parseInt(currencyId) != 1){
        var sql = "delete from currency_conversion where id = ? ";
        multiConnection[dbName].query(sql,[currencyId],function(err1,reply1){
            if(err1){
                sendResponse.somethingWentWrongError(res);
            }else{
                callback(null);
            }
        })
    }else{
        callback(null);
    }


}


function  deleteCountriesOfThisCurrency(dbName,res,callback,currencyId){
        var sql = "delete from currency_country where currency_conversion_id = ? and country_id != ? ";
        multiConnection[dbName].query(sql,[currencyId,1],function(err1,reply1){
            if(err1){
                sendResponse.somethingWentWrongError(res);
            }else{
                callback(null);
            }
        })

}

function  setDefaultCurrency(dbName,res,callback,currencyId){

    var sql = "update currency_default set currency_conversion_id = ? where id = 1 ";
    multiConnection[dbName].query(sql,[currencyId],function(err1,reply1){
        if(err1){
            sendResponse.somethingWentWrongError(res);
        }else{
            callback(null);
        }
    })
}