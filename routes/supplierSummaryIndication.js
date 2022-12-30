var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var moment = require('moment');
var summaryIndication = require('./supplierSummaryIndication')
var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const ExecuteQ=require('../lib/Execute')
exports.getSupplierCountryListWithId = function(req, res) {
    var supplierId = 0;
    var accessToken = 0;
    async.waterfall([

        function(cb) {
            if (req.body && req.body.supplierId && req.body.accessToken) {
                supplierId = req.body.supplierId;
                accessToken = req.body.accessToken;
                cb(null);
            } else {
                var msg = "fill some data";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }
        },
        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);

        },
        function(id, cb) {
            summaryIndication.getCountryListWithId(req.dbName,res, cb, supplierId);
        }
    ], function(err, response) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}

/*
 * -----------------
 * list al city name with corresponding supplierID
 *
 *
 */

exports.getSupplierCityListWithId = function(req, res) {
    var supplierId = 0;
    var accessToken = 0;
    var countryId = 0;
    async.waterfall([
        function(cb) {
            if (req.body && req.body.supplierId && req.body.accessToken && req.body.countryId) {
                supplierId = req.body.supplierId;
                accessToken = req.body.accessToken;
                countryId = req.body.countryId;
                cb(null);
            } else {
                var msg = "fill some data";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }
        },
        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);

        },
        function(id, cb) {
            summaryIndication.getCityListWithId(req.dbName,res, cb, supplierId,countryId);
        }


    ], function(err, response) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}

/*
 *--------------
 * list zone name with corresponding supplier id
 *
 *
 */

exports.getSupplierZoneListWithId = function(req, res) {

    var supplierId = 0;
    var accessToken = 0;
    var cityId = 0;
    async.waterfall([

        function(cb) {
            if (req.body && req.body.supplierId && req.body.accessToken && req.body.cityId) {
                supplierId = req.body.supplierId;
                accessToken = req.body.accessToken;
                cityId = req.body.cityId;
                cb(null);
            } else {
                var msg = "fill input field";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }
        },

        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);

        },
        function(id, cb) {
            summaryIndication.getZoneListWithId(req.dbName,res, cb, supplierId, cityId);
        }


    ], function(err, response) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });


}


// end of zone name with id

/*
 *---------------
 * list area name and id corresponding supplier Id
 *
 *------------------------------------
 */

exports.getSupplierAreaListWithId = function(req, res) {

    var supplierId = 0;
    var accessToken = 0;
    var zoneId = 0;
    async.waterfall([

        function(cb) {
            if (req.body && req.body.supplierId && req.body.accessToken && req.body.zoneId) {
                supplierId = req.body.supplierId;
                accessToken = req.body.accessToken;
                zoneId = req.body.zoneId;
                cb(null);

            } else {
                var msg = "fill input field";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }

        },

        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function(id, cb) {
            summaryIndication.getAreaListWithId(req.dbName,res, cb, supplierId, zoneId);
        }


    ], function(err, response) {
        if (err) {
            console.log('err-----something');
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });


}


/*
 *---------------------
 * update delivery charges by area id corresponding to supplierid
 *
 *
 */
exports.updateSupplierChargesByAreaId = function(req, res) {
    var supplierId = 0;
    var accessToken = 0;
    var deliveryCharges = 0;
    var areaId = 0;
    var minOrder =0;
    var chargesBelowMinOrder = 0;

    async.waterfall([

        function(cb) {
            if (req.body && req.body.supplierId && req.body.accessToken && req.body.areaId && req.body.deliveryCharges&&req.body.minOrder) {
                supplierId = req.body.supplierId;
                accessToken = req.body.accessToken;
                deliveryCharges = req.body.deliveryCharges.toString();
                areaId = req.body.areaId.toString();
                minOrder = req.body.minOrder.toString();
                chargesBelowMinOrder = req.body.chargesBelowMinOrder.toString();
                cb(null);
            } else {
                var msg = "Send  id";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);

            }
        },

        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function(id, cb) {

            summaryIndication.updateDeliveryChargesByArea(req.dbName,res, areaId, deliveryCharges, supplierId,minOrder ,chargesBelowMinOrder, cb);

        }


    ], function(err, response) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}



exports.updateSupplierChargesByCityAndZoneId = function(req,res)
{
    var supplierId = 0;
    var accessToken = 0;
    var deliveryCharges = 0;
    var id = 0;
    var minOrder =0;
    var chargesBelowMinOrder = 0;
    var type = 0;
    console.log("bhsdvs",req.body);

    async.waterfall([
        function(cb) {
            if (req.body && req.body.supplierId && req.body.accessToken && req.body.id && req.body.deliveryCharges && req.body.minOrder) {
                supplierId = req.body.supplierId;
                accessToken = req.body.accessToken;
                deliveryCharges = req.body.deliveryCharges;
                id = req.body.id;
                minOrder = req.body.minOrder ;
                chargesBelowMinOrder = req.body.chargesBelowMinOrder ;
                type = req.body.type ;
                cb(null);
            } else {
                var msg = "Send  id ";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }
        },
        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function(xid, cb) {
            if(type == 0)
            {
                var sql2 = "update supplier_delivery_areas set city_delivery_charges = ?,city_min_order = ?,city_charges_below_min_order = ? where city_id = ? and supplier_id = ? ";
                multiConnection[req.dbName].query(sql2,[deliveryCharges,minOrder,chargesBelowMinOrder,id,supplierId],function(err,result)
                {
                    if(err){
                     console.log("err",err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{
                        cb(null)
                    }
                })
            }
            else{
                var sql = "update supplier_delivery_areas set zone_delivery_charges = ?,zone_min_order = ?,zone_charges_below_min_order = ? where zone_id = ? and supplier_id = ? ";
                multiConnection[req.dbName].query(sql,[deliveryCharges,minOrder,chargesBelowMinOrder,id,supplierId],function(err,result)
                {
                    //console.log(sql)
                    if(err){
                        console.log("err",err);
                        sendResponse.somethingWentWrongError(res);
                    }
                    else{
                        cb(null)
                    }
                })
            }


        }


    ], function(err, response) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });

}


exports.getSupplierSummaryInfo = function(req,res)
{
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var values = [accessToken, sectionId, supplierId];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                summaryIndication.getSupplierSummary(req.dbName,supplierId, res, cb);
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

}



exports.updateSupplierSummaryInfo = function(req,res)
{

    
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var supplierId = req.body.supplierId;
    var deliveryPriorDays = req.body.deliveryPriorDays;
    var deliveryPriorTime = req.body.deliveryPriorTime;
    var deliveryMinTime = req.body.deliveryMinTime;
    var deliveryMaxTime = req.body.deliveryMaxTime;
    var urgentDeliveryTime = req.body.urgentDeliveryTime;
    var preparation_time = req.body.preparation_time!=undefined?req.body.preparation_time:"00:00:00"
    var timings = req.body.timings;
    var values = [accessToken, sectionId, supplierId,deliveryMaxTime,deliveryMinTime,deliveryPriorDays,deliveryPriorTime,urgentDeliveryTime,timings];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, values, cb);
            },

            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                var deliveryPriorTotalTime = parseInt(deliveryPriorTime) + parseInt(deliveryPriorDays)*24*60;
                var updateValues = [deliveryMinTime,deliveryMaxTime,deliveryPriorDays,deliveryPriorTime,urgentDeliveryTime,deliveryPriorTotalTime,preparation_time,supplierId];
                summaryIndication.updateSupplierSummary(req.dbName,res,supplierId,updateValues,timings,cb);
            }
        ], function (error, result) {
            console.log("==========Err!==>>",error);
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }

        }
    );
}



exports.updateAreaMo = function(req,res){

    var zone;
    var area;
    var city;
    var supplierId;
    
    async.auto({
        checkParameter:function(cb){
            supplierId = req.body.supplierId;
            if(req.body.zone){
                zone = JSON.parse(req.body.zone);
            }else{
                var msg = "zone not found";
                return sendResponse.sendErrorMessage(msg,res,400); 
            }
            
            if(req.body.area){
                area = JSON.parse(req.body.area);
            }else{
                var msg = "area not found";
                return sendResponse.sendErrorMessage(msg,res,400);
            }
            
            if(req.body.city){
                city = JSON.parse(req.body.city);
            }else{
                var msg = "city not found";
                return sendResponse.sendErrorMessage(msg,res,400);
            }
            
            cb(null);
        },
        updateArea:['checkParameter',function(cb){
            var areaLength = area.length;
            for(var a = 0;a < areaLength;a++){
                (function(a){
                    summaryIndication.updateArea(req.dbName,area[a],supplierId,function(err,result){
                        if(err){
                            cb(err)
                        }else{
                            if(a == (areaLength - 1)) {
                                cb(null);
                            }
                        }
                    })
                }(a));
            }
        }],
        updateCity:['checkParameter',function(cb){
            var cityLength = city.length ;
            for(var i =0;i < cityLength;i++){
                (function(i){
                    var sql = "update supplier_delivery_areas set city_delivery_charges = ?,city_min_order = ?,city_charges_below_min_order = ? where city_id = ? and supplier_id = ? ";
                    multiConnection[req.dbName].query(sql,[city[i].deliveryCharges,city[i].minOrder,city[i].chargesBelowMinOrder,city[i].id,supplierId],function(err,result)
                    {
                        console.log(".,..................updateCity...................",result);
                        if(err){
                          cb(err);
                        }
                        else{
                            if(i == (cityLength-1)){
                                cb(null)
                            }
                        }
                    })
                }(i));
            }
        }],
        updateZone:['checkParameter',function(cb){
            var zoneLength = zone.length;
            for(var z = 0;z < zoneLength;z++){
                (function(z){
                    var sql = "update supplier_delivery_areas set zone_delivery_charges = ?,zone_min_order = ?,zone_charges_below_min_order = ? where zone_id = ? and supplier_id = ? ";
                    multiConnection[req.dbName].query(sql,[zone[z].deliveryCharges,zone[z].minOrder,zone[z].chargesBelowMinOrder,zone[z].id,supplierId],function(err,result)
                    {
                        if(err){
                            cb(err)
                        }
                        else{
                            if(z == (zoneLength-1)){
                                cb(null)
                            }
                        }
                    })
                }(z));
            }
        }]
    },function(err,result){
        if(err){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData({}, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


exports.updateArea = function(dbName,areaId,supplierId,callback){
    
    async.auto({
        updateSupplierArea:function(cb){
            var sql = "update supplier_delivery_areas set delivery_charges= ? ,min_order = ?,charges_below_min_order = ? where area_id = ? and supplier_id = ? ";
            multiConnection[dbName].query(sql,[areaId.deliveryCharges,areaId.minOrder,areaId.chargesBelowMinOrder,areaId.id,supplierId],function(err,result)
            {
                if(err){
                    cb(err)
                }
                else{
                    cb(null);
                }
            })
        },
        updateBranchArea:function(cb){
            var sql = " update supplier s join supplier_branch sb on sb.supplier_id = s.id join supplier_branch_area_product " +
                " sbap on sbap.supplier_branch_id = sb.id set sbap.delivery_charges = ?,sbap.min_order = ?,sbap.charges_below_min_order = ? where sbap.area_id = ? and s.id = ? ";
            multiConnection[dbName].query(sql,[areaId.deliveryCharges,areaId.minOrder,areaId.chargesBelowMinOrder,areaId.id,supplierId],function(err,result)
            {
                if(err){
                    cb(err)
                }
                else{
                    cb(null);
                }
            })
        },
        updateAreaWise:function(cb){
            var sql = " update supplier s join supplier_branch sb on sb.supplier_id = s.id join supplier_branch_delivery_areas " +
                " sbap on sbap.supplier_branch_id = sb.id set sbap.delivery_charges = ?,sbap.min_order = ?,sbap.charges_below_min_order = ? where sbap.area_id = ? and s.id = ? ";
            multiConnection[dbName].query(sql,[areaId.deliveryCharges,areaId.minOrder,areaId.chargesBelowMinOrder,areaId.id,supplierId],function(err,result)
            {
                if(err){
                    cb(err)
                }
                else{
                    cb(null);
                }
            })
        }

    },function(err,result){
        if(err){
            callback(err);
        }else{
            callback(null);
        }
    })
}


exports.getCountryListWithId= function(dbName,res, cb, supplierId) {
    q = 'select supplier_delivery_areas.country_id,country.name as country_name ,supplier_delivery_areas.delivery_charges,supplier_delivery_areas.min_order,supplier_delivery_areas.charges_below_min_order ' +
        ' from country ' +
        ' join supplier_delivery_areas on  supplier_delivery_areas.country_id=country.id ' +
        ' where supplier_delivery_areas.supplier_id=' + supplierId+' and supplier_delivery_areas.is_deleted = ? group by supplier_delivery_areas.country_id'


    multiConnection[dbName].query(q,[0], function(err, result) {

        if (err) {

            cb(err);

        } else {

            if(result.length){
                for(var i = 0 ; i < result.length ; i++)
                {
                    (function(i)
                    {
                        if(result[i].delivery_charges == 0 && result[i].min_order == 0 && result[i].charges_below_min_order == 0)
                        {
                            result[i].status = 1;
                            if(i == result.length - 1)
                            {
                                cb(null, result);
                            }

                        }
                        else{
                            result[i].status = 0;
                            if(i == result.length - 1)
                            {
                                cb(null, result);

                            }
                        }

                    }(i))

                }

            }
            else{
                cb(null, result);
            }


        }

    });


}


exports.getCityListWithId = function(dbName,res, cb, supplierId,countryId) {
    q = 'select supplier_delivery_areas.city_id,city.name as city_name ,supplier_delivery_areas.city_delivery_charges as delivery_charges,supplier_delivery_areas.city_min_order as min_order,supplier_delivery_areas.city_charges_below_min_order as charges_below_min_order ' +
        ' from city ' +
        ' join supplier_delivery_areas on  supplier_delivery_areas.city_id=city.id ' +
        ' where supplier_delivery_areas.supplier_id=' + supplierId+' and supplier_delivery_areas.is_deleted = ? and supplier_delivery_areas.country_id = ? group by supplier_delivery_areas.city_id'


    multiConnection[dbName].query(q,[0,countryId], function(err, result) {

        if (err) {

            cb(err);

        } else {
            if(result.length){
                for(var i = 0 ; i < result.length ; i++)
                {
                    (function(i)
                    {
                        if(result[i].delivery_charges == 0 && result[i].min_order == 0 && result[i].charges_below_min_order == 0)
                        {
                            result[i].status = 1;
                            if(i == result.length - 1)
                            {
                                cb(null, result);
                            }

                        }
                        else{
                            result[i].status = 0;
                            if(i == result.length - 1)
                            {
                                cb(null, result);
                            }
                        }

                    }(i))

                }

            }
            else{
                cb(null, result);
            }
        }

    });


}


exports.getZoneListWithId=function(dbName,res, cb, supplierId, cityId) {


    q = 'select supplier_delivery_areas.zone_id,zone.name as zone_name ,supplier_delivery_areas.zone_delivery_charges as delivery_charges , supplier_delivery_areas.zone_min_order as min_order ,supplier_delivery_areas.zone_charges_below_min_order as charges_below_min_order' +
        ' from supplier_delivery_areas ' +
        ' join zone on  supplier_delivery_areas.zone_id=zone.id ' +
        ' where supplier_delivery_areas.supplier_id=' + supplierId + ' and supplier_delivery_areas.city_id = ' + cityId+' and supplier_delivery_areas.is_deleted = ? group by supplier_delivery_areas.zone_id';

    multiConnection[dbName].query(q,[0], function(err, result) {
        if (err) {
            cb(err);
        }
        else{
            if(result.length){
                for(var i = 0 ; i < result.length ; i++)
                {
                    (function(i)
                    {
                        if(result[i].delivery_charges == 0 && result[i].min_order == 0 && result[i].charges_below_min_order == 0)
                        {
                            result[i].status = 1;
                            if(i == result.length - 1)
                            {
                                cb(null, result);
                            }
                        }
                        else{
                            result[i].status = 0;
                            if(i == result.length - 1)
                            {
                                cb(null, result);
                            }
                        }
                    }(i))
                }
            }
            else{
                cb(null, result);
            }
        }
    });
}


exports.getAreaListWithId=function(dbName,res, cb, supplierId, zoneId) {
    q = 'select area.name as area_name , supplier_delivery_areas.area_id , supplier_delivery_areas.delivery_charges, supplier_delivery_areas.min_order, supplier_delivery_areas.charges_below_min_order ' +
        ' from area ' +
        ' join supplier_delivery_areas on  supplier_delivery_areas.area_id=area.id ' +
        ' where supplier_delivery_areas.supplier_id=' + supplierId + ' and supplier_delivery_areas.zone_id =' + zoneId+' and supplier_delivery_areas.is_deleted = ? group by  supplier_delivery_areas.area_id';

    multiConnection[dbName].query(q,[0], function(err, result) {
        if (err) {
            console.log('in..listing',err);
            cb(err);
        }
        cb(null, result);
    });
}



exports.updateDeliveryChargesByArea=function(dbName,res, id, charges, supplierId,minOrder ,chargesBelowMinOrder, callback) {

    var id_array = id.split('#');
    var del_charges = charges.split('#');
    var min_order = minOrder.split('#');
    var charges_below_min_order = chargesBelowMinOrder.split('#');
    var id_len = id_array.length;



    for (var i = 0; i < id_len; i++) {
        (function(i) {
            q = ' UPDATE supplier_delivery_areas ' +
                ' SET delivery_charges=' + del_charges[i] + ' , min_order = ' + min_order[i] +',charges_below_min_order = '+charges_below_min_order[i]+
                ' WHERE area_id=' + id_array[i] + ' AND supplier_id = ' + supplierId;

            multiConnection[dbName].query(q, function(err, result) {

                if (i == id_len - 1) {

                    async.parallel([
                            function(cb){
                                updateDeliveryChargesOfBranchesProducts(dbName,res,id,charges,supplierId,minOrder,chargesBelowMinOrder,cb);
                            },
                            function(cb){
                                updateDeliveryChargesOfBranches(dbName,res,id,charges,supplierId,minOrder,chargesBelowMinOrder,cb);
                            }
                        ]

                        ,function(err,response)
                        {
                            if(err){
                                sendResponse.somethingWentWrongError(res);
                            }
                            else{
                                callback(null);
                            }

                        })

                }
            });

        })(i);
    }
}


function updateDeliveryChargesOfBranchesProducts(dbName,res,id,charges,supplierId,minOrder,chargesBelowMinOrder,callback)
{
    var sql = "select id from supplier_branch where is_deleted = ? and supplier_id = ?";
    multiConnection[dbName].query(sql,[0,supplierId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){

                var branchArray = [];
                var id_array = id.split('#');
                var del_charges = charges.split('#');
                var min_order = minOrder.split('#');
                var charges_below_min_order = chargesBelowMinOrder.split('#');
                var id_len = id_array.length;
                for (var j = 0; j < result.length; j++) {
                    branchArray.push(result[j].id);
                }
                branchArray = branchArray.toString();

                for (var i = 0; i < id_len; i++) {
                    (function(i) {
                        q = ' UPDATE supplier_branch_area_product ' +
                            ' SET delivery_charges=' + del_charges[i] + ' , min_order = ' + min_order[i] +',charges_below_min_order = '+charges_below_min_order[i]+
                            ' WHERE area_id=' + id_array[i] + ' AND supplier_branch_id IN ( '+branchArray+' )';

                        multiConnection[dbName].query(q, function(err, result) {

                            if (i == id_len - 1) {
                                callback(null);
                            }
                        });

                    })(i);
                }

            }
            else{
                callback(null);
            }
        }

    })
}


function updateDeliveryChargesOfBranches(dbName,res,id,charges,supplierId,minOrder,chargesBelowMinOrder,callback)
{
    var sql = "select id from supplier_branch where is_deleted = ? and supplier_id = ?";
    multiConnection[dbName].query(sql,[0,supplierId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            if(result.length){

                var branchArray = [];
                var id_array = id.split('#');
                var del_charges = charges.split('#');
                var min_order = minOrder.split('#');
                var charges_below_min_order = chargesBelowMinOrder.split('#');
                var id_len = id_array.length;
                for (var j = 0; j < result.length; j++) {
                    branchArray.push(result[j].id);
                }
                branchArray = branchArray.toString();

                for (var i = 0; i < id_len; i++) {
                    (function(i) {
                        q = ' UPDATE supplier_branch_delivery_areas ' +
                            ' SET delivery_charges=' + del_charges[i] + ' , min_order = ' + min_order[i] +',charges_below_min_order = '+charges_below_min_order[i]+
                            ' WHERE area_id=' + id_array[i] + ' AND supplier_branch_id IN ( '+branchArray+' )';

                        multiConnection[dbName].query(q, function(err, result) {

                            if (i == id_len - 1) {
                                callback(null);
                            }
                        });

                    })(i);
                }

            }
            else{
                callback(null);
            }
        }

    })
}

summaryIndication.getSupplierSummary=function(dbName,supplierId, res, callback)
{
    var data = {};

    async.auto({
            one:function(cb){
                getSupplierPriorDeliveryDays(dbName,res,supplierId,cb);
            },
            two:function(cb){
                getSupplierWorkingHours(dbName,res,supplierId,cb);
            },
        },
        function(err,response)
        {
            if(err){
                sendResponse.somethingWentWrongError(res)
            }
            else{
                data = response.one;
                data[0].timings = response.two;
                console.log("=========da=ta=====",data)
                callback(null,data);
            }
        })

}


async function getSupplierPriorDeliveryDays(dbName,res,supplierId,callback)
{

    try{
        var sql = "select delivery_prior_days,preparation_time,delivery_prior_time,delivery_min_time,delivery_max_time,urgent_delivery_time,is_urgent ";
    sql +=" from supplier where id = ? limit 1";
       let result= await ExecuteQ.Query(dbName,sql,[supplierId])
       callback(null,result);
    }
    catch(Err){
        logger.debug("====getSupplierPriorDeliveryDays==>",Err)
        sendResponse.somethingWentWrongError(res)
    }

    

}


async function getSupplierWorkingHours(dbName,res,supplierId,callback)
{
    try{
        var sql = "select * from supplier_timings where supplier_id = ? order by week_id asc";
        let result=await ExecuteQ.Query(dbName,sql,[supplierId]);
        callback(null,result);
    }
    catch(Err){
        sendResponse.somethingWentWrongError(res)
    }
    

}


exports.updateSupplierSummary = function(dbName,res,supplierId,updateValues,timings,callback)
{
    async.auto({
            one:function(cb){

                updateSupplierDeliveryTime(dbName,res,updateValues,cb);
            },
            two : function(cb){
                updateSupplierWorkingHours(dbName,res,timings,supplierId,cb);
            }
        },
        function(err,response)
        {
            if(err){
                sendResponse.somethingWentWrongError(res)
            }
            else{
                callback(null);
            }

        })

}


async function updateSupplierDeliveryTime(dbName,res,updateValues,callback)
{
    try{
        var sql = "update supplier set delivery_min_time = ?,delivery_max_time = ?,delivery_prior_days = ?,delivery_prior_time ";
        sql +=" = ? ,urgent_delivery_time = ?,delivery_prior_total_time = ?, preparation_time = ? where id = ? limit 1";
        await ExecuteQ.Query(dbName,sql,updateValues);
        callback(null);
    }
    catch(Err){
        logger.debug("==Err!==>",Err);
        sendResponse.somethingWentWrongError(res);
    }
    

}



function updateSupplierWorkingHours(dbName,res,timings,supplierId,callback)
{


    var day = moment().isoWeekday();
    day=day-1;
    var j=0;
    var timingsJSON = JSON.parse(timings);
    var jsonLength = timingsJSON.length;
    var status =0;
 async.auto({
     deleteTimings:async function (cb) {
         try{
         var sql = "delete from supplier_timings where supplier_id = ?";
         await ExecuteQ.Query(dbName,sql,[supplierId]);
            cb(null);
       
         }
         catch(Err){
             logger.debug("=====Err!==",Err);
             cb(null);
         }
     },
     insertTimings:['deleteTimings',function (cb) {
      

         for(var i=0;i<jsonLength;i++){
             (async function (i) {
                 var sql = "insert into supplier_timings(supplier_id,week_id,start_time,end_time,is_open,close_week_id) values(?,?,?,?,?,?)";
                 await ExecuteQ.Query(dbName,sql,[supplierId,timingsJSON[i].week_id,timingsJSON[i].start_time,timingsJSON[i].end_time,timingsJSON[i].is_open,timingsJSON[i].close_week_id])
               
                         if(day == timingsJSON[i].week_id){
                             status =timingsJSON[i].week_id
                             if(i == (jsonLength-1))
                             {
                                 cb(null);
                             }
                         }
                         else {
                             if(i == (jsonLength-1))
                             {
                                 cb(null);
                             } 
                         }

             }(i))
         }
     }],
     updateStatus:['insertTimings',async function (cb) {
         try{
         var sql1='update supplier set status = ? where id =?';
         await ExecuteQ.Query(dbName,sql1,[status,supplierId]);
             cb(null);
        
         }
         catch(Err){
             cb(null)
         }
     }]
 },function (err,result) {
     if(err){
        console.log("err",err);
         callback(err);
     }
     else {
        callback(null);
     }
 })


}