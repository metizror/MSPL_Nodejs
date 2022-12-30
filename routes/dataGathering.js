var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var func = require('./commonfunction');
var dataGather = require('./dataGathering');
var validator = require("email-validator");


exports.emailLogin = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var manValues = [email, password];
    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValues, cb);
        },
        function(cb) {
            checkEmailandPassword(req.dbName,res, email, password, cb);
        }
    ], function(error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {
                "access_token": result
            }
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });

};


/*
 * -----------------
 * list al city name with corresponding supplierID
 *
 *
 */


exports.getCityListWithId = function(req, res) {
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
            func.authenticateDataGatheringAccessToken(req.dbName,accessToken, res, cb);

        },
        function(id, cb) {
            getCityListWithId(req.dbName,res, cb, supplierId);
        }


    ], function(err, response) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}

function getCityListWithId(dbName,res, cb, supplierId) {
    q = 'select DISTINCT(supplier_delivery_area_dump.city) as city_id,city.name as city_name ,supplier_delivery_area_dump.delivery_charges as delivery_charges,supplier_delivery_area_dump.min_order as minOrder,supplier_delivery_area_dump.charges_below_min_order as chargesBelowMinOrder  ' +
        ' from city ' +
        ' join supplier_delivery_area_dump on  supplier_delivery_area_dump.city=city.id ' +
        ' where supplier_delivery_area_dump.dump_supplier_id=' + supplierId+' group by supplier_delivery_area_dump.city'


    multiConnection[dbName].query(q, function(err, result) {

        if (err) {

            cb(err);

        } else {

            cb(null, result);
        }

    });


}

/*
 *--------------
 * list zone name with corresponding supplier id
 *
 *
 */

exports.getZoneListWithId = function(req, res) {

    var supplierId = 0;
    var accessToken = 0;
    var flag = 0;
    var deliveryCharges = 0;
    var cityId = 0;
    var minOrder = 0;
    var chargesBelowMinOrder = 0;
    async.waterfall([

        function(cb) {
            if (req.body && req.body.supplierId && req.body.accessToken && req.body.cityId) {
                supplierId = req.body.supplierId;
                accessToken = req.body.accessToken;
                flag = req.body.flag;
                cityId = req.body.cityId;
                if (flag == 1) {
                    if (req.body.deliveryCharges) {
                        deliveryCharges = req.body.deliveryCharges;
                        minOrder  = req.body.minOrder;
                        chargesBelowMinOrder = req.body.chargesBelowMinOrder;

                    } else {
                        var msg = "enter delivery charges and corresponding id";
                        sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);

                    }

                }
                cb(null);


            } else {
                var msg = "fill input field";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }
        },

        function(cb) {
            func.authenticateDataGatheringAccessToken(req.dbName,accessToken, res, cb);
        },
        function(id, cb) {
            if (flag == 1)
                updateDeliveryChargesByCity(req.dbName,res, cityId, deliveryCharges, supplierId,minOrder,chargesBelowMinOrder, cb);
            else
                getZoneListWithId(req.dbName,res, cb, supplierId, cityId);
        }


    ], function(err, response) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });


}

function updateDeliveryChargesByCity(dbName,res, id, charges, supplierId,minOrder ,chargesBelowMinOrder,cb) {

    var id_array = id;
    var del_charges = charges;
    var min_charges = chargesBelowMinOrder;



    q = ' UPDATE supplier_delivery_area_dump ' +
        ' SET delivery_charges = ' + del_charges + ' , min_order = ' + minOrder + ',charges_below_min_order = '+min_charges+
        ' WHERE city =' + id_array + ' AND dump_supplier_id = ' + supplierId;
    multiConnection[dbName].query(q, function(err, result) {
        if (err) {
            cb(err);
        } else {

            getZoneListWithId(dbName,res, cb, supplierId, id_array);

        }
    });


}


function getZoneListWithId(dbName,res, cb, supplierId, cityId) {


    q = 'select supplier_delivery_area_dump.zone as zone_id,zone.name as zone_name ,supplier_delivery_area_dump.delivery_charges  as delivery_charges  , supplier_delivery_area_dump.min_order as minOrder,supplier_delivery_area_dump.charges_below_min_order as chargesBelowMinOrder ' +
        ' from supplier_delivery_area_dump ' +
        ' join zone on  supplier_delivery_area_dump.zone=zone.id ' +
        ' where supplier_delivery_area_dump.dump_supplier_id=' + supplierId + ' and supplier_delivery_area_dump.city = ' + cityId+' group by supplier_delivery_area_dump.zone';

    multiConnection[dbName].query(q, function(err, result) {
        if (err) {

            console.log(err)
            cb(err);
        }
        else{
            cb(null, result);
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


exports.getAreaListWithId = function(req, res) {

    var supplierId = 0;
    var accessToken = 0;
    var flag = 0;
    var deliveryCharges = 0;
    var zoneId = 0;
    var minOrder =0;
    var chargesBelowMinOrder = 0;
    async.waterfall([

        function(cb) {
            if (req.body && req.body.supplierId && req.body.accessToken && req.body.zoneId) {
                supplierId = req.body.supplierId;
                accessToken = req.body.accessToken;
                flag = req.body.flag;
                zoneId = req.body.zoneId;
                if (flag == 1) {
                    if (req.body.deliveryCharges) {
                        deliveryCharges = req.body.deliveryCharges;
                        minOrder =  req.body.minOrder;
                        chargesBelowMinOrder = req.body.chargesBelowMinOrder;

                        cb(null);

                    } else {
                        var msg = "enter delivery charges and corresponding id";
                        console.log('msg',msg);
                        sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);

                    }

                }
                else
                {
                    cb(null);
                }



            } else {
                var msg = "fill input field";
              //  console.log('msg',msg);
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }

        },

        function(cb) {
            func.authenticateDataGatheringAccessToken(req.dbName,accessToken, res, cb);
        },
        function(id, cb) {
            if (flag == 1)
                updateDeliveryChargesByZone(req.dbName,res, zoneId, deliveryCharges, supplierId,minOrder,chargesBelowMinOrder, cb);
            else
                getAreaListWithId(req.dbName,res, cb, supplierId, zoneId);

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

function updateDeliveryChargesByZone(dbName,res, id, charges, supplierId, minOrder ,chargesBelowMinOrder,cb) {

    var id_array = id;
    var del_charges = charges;
    var min_charges = chargesBelowMinOrder;


    q = ' UPDATE supplier_delivery_area_dump ' +
        ' SET delivery_charges=' + del_charges + ' , min_order = ' +minOrder +',charges_below_min_order = '+min_charges+
        ' WHERE zone=' + id_array + ' AND dump_supplier_id = ' + supplierId;

    multiConnection[dbName].query(q, function(err, result) {
        if (err) {
            console.log('in update-----------',err);
            cb(err);
        } else {

            getAreaListWithId(dbName,res, cb, supplierId, id_array);


        }
    });


}

function getAreaListWithId(dbName,res, cb, supplierId, zoneId) {


    q = 'select area.name as area_name , supplier_delivery_area_dump.area as area_id , supplier_delivery_area_dump.delivery_charges  as delivery_charges  , supplier_delivery_area_dump.min_order as minOrder, supplier_delivery_area_dump.charges_below_min_order as chargesBelowMinOrder' +
        ' from area ' +
        ' join supplier_delivery_area_dump on  supplier_delivery_area_dump.area=area.id ' +
        ' where supplier_delivery_area_dump.dump_supplier_id=' + supplierId + ' and supplier_delivery_area_dump.zone =' + zoneId+' group by  supplier_delivery_area_dump.area';

    multiConnection[dbName].query(q, function(err, result) {
        if (err) {
            console.log('in..listing',err);
            cb(err);
        }
        cb(null, result);
    });
}

/*
 *---------------------
 * update delivery charges by area id corresponding to supplierid
 *
 *
 */
exports.updateChargesByAreaId = function(req, res) {
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
            func.authenticateDataGatheringAccessToken(req.dbName,accessToken, res, cb);
        },
        function(id, cb) {

            updateDeliveryChargesByArea(req.dbName,res, areaId, deliveryCharges, supplierId,minOrder ,chargesBelowMinOrder, cb);

        }


    ], function(err, response) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}

function updateDeliveryChargesByArea(dbName,res, id, charges, supplierId,minOrder ,chargesBelowMinOrder, cb) {

    var id_array = id.split('#');
    var del_charges = charges.split('#');
    var min_order = minOrder.split('#');
    var charges_below_min_order = chargesBelowMinOrder.split('#');
    var id_len = id_array.length;



    for (var i = 0; i < id_len; i++) {
        (function(i) {
            q = ' UPDATE supplier_delivery_area_dump ' +
                ' SET delivery_charges=' + del_charges[i] + ' , min_order = ' + min_order[i] +',charges_below_min_order = '+charges_below_min_order[i]+
                ' WHERE area=' + id_array[i] + ' AND dump_supplier_id = ' + supplierId;

            multiConnection[dbName].query(q, function(err, result) {
                if (err)
                    cb(err);


                if (i == id_len - 1) {
                    cb(null);
                }
            });

        })(i);
    }
}



/*
 * ------------------------------------------------------
 * List all countries names and ids
 * Output:  Country names, country ids
 * ------------------------------------------------------
 */
exports.listCountryWithNamesAndId = function(req, res) {
    var sql = "select id,name from country where is_deleted =?"
    multiConnection[req.dbName].query(sql, [0], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    })

}


/*
 * ------------------------------------------------------
 * List all zone names of a particular city
 * Output:  zone names, zone ids
 * ------------------------------------------------------
 */
exports.listZonesWithNamesAndId = function(req, res) {
    var cityId = req.body.cityId;
    var manValues = [cityId];
    console.log(manValues + "request parameters")

    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValues, cb);
        },
        function(cb) {
            getZoneNames(req.dbName,res, cityId, cb);
        },
    ], function(error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    });
}

/*
 * ------------------------------------------------------
 * List all city names of a particular country
 * Output:  city names, city ids
 * ------------------------------------------------------
 */
exports.listCityWithNameAndId = function(req, res) {
    var countryId = req.body.countryId;
    var manValue = [countryId];
    async.waterfall([

        function(cb) {
           // console.log(JSON.stringify(manValue))
            func.checkBlank(res, manValue, cb);
        },
        function(cb) {
            getCityByCountryId(req.dbName,res, cb, countryId);
        }
    ], function(err, response) {
        if (err) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


/*
 * ------------------------------------------------------
 * List all area names of a particular zone
 * Output:  area names, area ids
 * ------------------------------------------------------
 */
exports.listAreaWithNameAndId = function(req, res) {
    var zoneId = req.body.zoneId;
    var manValue = [zoneId];
    async.waterfall([

        function(cb) {
           // console.log(JSON.stringify(manValue))
            func.checkBlank(res, manValue, cb);
        },
        function(cb) {
            getAreaByZoneId(req.dbName,res, cb, zoneId);
        }
    ], function(err, response) {
        if (err) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


exports.listZonesAndAreas = function(req, res) {
    var cityId = req.body.cityId;
    var manValue = [cityId];
    async.waterfall([

        function(cb) {
          //  console.log(JSON.stringify(manValue))
            func.checkBlank(res, manValue, cb);
        },
        function(cb) {
            getZoneAndAreaByCityId(req.dbName,res, cb, cityId);
        }
    ], function(err, response) {
        if (err) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(response, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })


}


function getZoneAndAreaByCityId(dbName,res, callback, cityId) {

    var sql = "select z.id zone_id,z.name zone_name,a.id area_id ,a.name area_name from zone z join area a on z.id = a.zone_id ";
    sql += " where z.city_id =? and a.is_deleted = ? and z.is_deleted = ? ORDER BY z.id,a.id";
    multiConnection[dbName].query(sql, [cityId, 0, 0], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var zoneLength = result.length;
            var areaLength = result.length;
            if (zoneLength == 0) {
                callback(null, []);
            } else {
                var j = 0;
                var zoneArray = [];
                var exception = {};
                for (var i = 0; i < zoneLength; i++) {
                    (function(i) {
                        var matchedCheck = false;
                        var areaArray = [];

                        try {
                            for (var k = j; k < areaLength; k++) {
                                (function(k) {

                                    if (result[i].zone_id == result[k].zone_id) {

                                        j++;
                                        matchedCheck = true;
                                        areaArray.push({
                                            "area_id": result[k].area_id,
                                            "area_name": result[k].area_name
                                        });
                                        if (k == areaLength - 1) {
                                            zoneArray.push({
                                                "zone_id": result[i].zone_id,
                                                "zone_name": result[i].zone_name,
                                                "area": areaArray
                                            });
                                            //if( i ==  zoneLength - 1){
                                            //    callback(null,zoneArray);
                                            //}
                                        }

                                    } else {
                                        if ((k == areaLength - 1 && matchedCheck) || matchedCheck) {
                                            zoneArray.push({
                                                "zone_id": result[i].zone_id,
                                                "zone_name": result[i].zone_name,
                                                "area": areaArray
                                            });
                                        }
                                        throw exception;
                                    }

                                }(k))
                            }
                        } catch (e) {
                            console.log(e);
                        } finally {
                            if (i == zoneLength - 1) {
                                callback(null, zoneArray)
                            }
                        }

                    }(i))
                }

            }
        }

    })


}

/*
 * ------------------------------------------------------
 * Save supplier data step 3
 * Output:  supplier ids
 * ------------------------------------------------------
 */
exports.storeSupplierDataStepThree = function(req, res) {
    var accessToken = req.body.accessToken;
    var supplierId = req.body.supplierId;
    var providingDelivery = req.body.providingDelivery;
    var priorDays = req.body.priorDays;
    var priorTimeHrs = req.body.priorTimeHrs;
    var workingDays = req.body.workingDays;
    var workingHrs = req.body.workingHrs;
    var minOrder = req.body.minOrder;
    var paymentMethod = req.body.paymentMethod;
    var urgentFacility = req.body.urgentFacility;
    var urgentPrice = req.body.urgentPrice;
    var urgentType = req.body.urgentType;
    var houseMaintenanceInspection = req.body.houseMaintenanceInspection;
    var inspectionCharges = req.body.inspectionCharges;
    var scheduleOrderFacility = req.body.scheduleOrderFacility;
    var handlingFees = req.body.handlingFees;
    var commissionGiving = req.body.commissionGiving;
    var commissionType = req.body.commissionType;
    var commissionPrice = req.body.commissionPrice;
    var wepOrApp = req.body.wepOrApp;
    var reaction = req.body.reaction;
    var subscription = req.body.subscription;
    var productImages = req.body.productImages;
    var interestedInKey = req.body.interestedInKey;
    var internetConnection = req.body.internetConnection;
    var minOrderForDelivery = req.body.minOrderForDelivery;
    var minOrderDeliveryCharge = req.body.minOrderDeliveryCharge;
    var deliveryCharges = req.body.deliveryCharges;
    var manValue = [accessToken, priorDays, priorTimeHrs, workingDays, workingHrs, minOrder, paymentMethod, urgentFacility, urgentPrice, houseMaintenanceInspection, inspectionCharges, scheduleOrderFacility, handlingFees, commissionGiving, wepOrApp, reaction, productImages, interestedInKey, internetConnection, providingDelivery, supplierId,urgentType,commissionType,commissionPrice];
    var insertValues = [priorDays, priorTimeHrs, workingDays, workingHrs, minOrder, paymentMethod, urgentFacility, urgentPrice, houseMaintenanceInspection, inspectionCharges, scheduleOrderFacility, handlingFees, commissionGiving, wepOrApp, reaction, subscription, productImages, interestedInKey, internetConnection, providingDelivery, minOrderForDelivery, minOrderDeliveryCharge, deliveryCharges,urgentType,commissionType,commissionPrice, supplierId];

    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValue, cb);
        },
        function(cb) {
            func.authenticateDataGatheringAccessToken(req.dbName,accessToken, res, cb)
        },
        function(id, cb) {
            storeDataStepThree(req.dbName,res, cb, insertValues);
        }
    ], function(err, response) {
        if (err) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            data.supplier_id = supplierId;
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


/*
 * ------------------------------------------------------
 * Save supplier data step 4
 * Output:  supplier ids
 * ------------------------------------------------------
 */
exports.storeSupplierDataStepFour = function(req, res) {
    var accessToken = req.body.accessToken;
    var supplierId = req.body.supplierId;
    var estimateStartDate = req.body.estimateStartDate;
    var contractStatus = req.body.contractStatus;
    var advertisementInterest = req.body.advertisementInterest;
    var concernedPersonName = req.body.concernedPersonName;
    var designation = req.body.designation;
    var mobileNumber = req.body.mobileNumber;
    var rateFrequentChange = req.body.rateFrequentChange;
    var rateValidity = req.body.rateValidity;
    var staffGender = req.body.staffGender;
    var noOfStaff = req.body.noOfStaff;
    var staffRemarks = req.body.staffRemarks;
    var comments = req.body.comments;
    var contentDiedLine = req.body.contentDiedLine;
    var noOfBranches = req.body.noOfBranches;
    var subscriptionPeriod = req.body.subscriptionPeriod;
    var aboutUs = req.body.aboutUs;
    var businessStartDate = req.body.businessStartDate;
    // 1  is for dump complete status
    var manValue = [estimateStartDate, contractStatus, concernedPersonName, designation, mobileNumber, rateFrequentChange, rateValidity, staffGender, noOfStaff, contentDiedLine, noOfBranches, aboutUs, 1, subscriptionPeriod, supplierId,businessStartDate];
    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValue, cb);
        },
        function(cb) {
            func.authenticateDataGatheringAccessToken(req.dbName,accessToken, res, cb)
        },
        function(id, cb) {
            var insertValues = [estimateStartDate, contractStatus, advertisementInterest, concernedPersonName, designation, mobileNumber, rateFrequentChange, rateValidity, staffGender, noOfStaff, comments, staffRemarks, contentDiedLine, noOfBranches, aboutUs, 1, subscriptionPeriod, id,businessStartDate, supplierId];
            storeDataStepFour(req.dbName,res, cb, insertValues);
        }
    ], function(err, response) {
        if (err) {
            console.error(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            data.supplier_id = supplierId;
            data.reference_number = response;
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


/*
 * ------------------------------------------------------
 * List all categories
 * Output:  Category names, ids
 * ------------------------------------------------------
 */
exports.listCategoryWithNamesAndId = function(req, res) {
    var sql = "select id,name from categories where is_deleted =? and parent_id =? and id != 102 "
    multiConnection[req.dbName].query(sql, [0, 0], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    })

}


/*
 * ------------------------------------------------------
 * List all sub category names of a particular category
 * Output:  category names, category ids
 * ------------------------------------------------------
 */
exports.listSubCategoriesWithNamesAndId = function(req, res) {
    var categoryId = req.body.categoryId;
    var manValues = [categoryId];
    console.log(manValues + "request parameters")

    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValues, cb);
        },
        function(cb) {
            getSubCategoryNames(req.dbName,res, categoryId, cb);
        },
    ], function(error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    });
}
/*
 * ------------------------------------------------------
 * Save supplier data step 1
 * Input : supplier name, email,category, providing delivery, country id,
 * city id, zone id, area id, address, telephone, fax , email ,
 * primary mobile , secondary mobile
 * Output:  supplier ids
 * ------------------------------------------------------
 */
exports.storeSupplierDataStep1 = function(req, res) {
    var accessToken = req.body.accessToken;
    var supplierName = req.body.supplierName;
    var autoFetchAddress = req.body.autoFetchAddress;
    var telephone = req.body.telephone;
    var fax = req.body.fax;
    var email = req.body.email;
    var primaryMobile = req.body.primaryMobile;
    var secondaryMobile = req.body.secondaryMobile;
    var categoryString = req.body.categoryString;
    var manValues = [accessToken, supplierName, email, primaryMobile, autoFetchAddress, categoryString];
  //  console.log(manValues + "request parameters");
  //  console.log("file " + JSON.stringify(req.files));
  //  console.log(req.files);
    var folder = "abc";
    var imageUrl = "http://royo-s3.s3.amazonaws.com/default_user.png";
    var supplierId;
    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValues, cb);
        },
        function(cb) {
            func.authenticateDataGatheringAccessToken(req.dbName,accessToken, res, cb)
        },
        function(id, cb) {
            if (!req.files || req.files == "" || req.files == undefined || Object.keys(req.files).length === 0) {
                cb(null, imageUrl);
            } else {
                func.uploadImageFileToS3Bucket(res, req.files.image, folder, cb);
            }
        },
        function(imageUrl, cb) {
            insertDumpDataIntoSupplier(req.dbName,res, supplierName, autoFetchAddress, telephone, fax, email, primaryMobile, secondaryMobile, imageUrl, categoryString, cb);
        },
        function(id, cb) {
            supplierId = id;
            dataGather.queryStringForDumpCategoryInsertion(cb, categoryString, supplierId);
        },
        function(values, queryString, cb) {
            insertDumpCategory(res, cb, values, queryString);
        }
    ], function(error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {
                "supplier_id": supplierId
            };
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    });

};


function insertDumpCategory(res, callback, values, queryString) {
    var sql = "insert into dump_category(dump_supplier_id,category_id,sub_category_id,detailed_sub_category_id) values" + queryString;
    multiConnection[dbName].query(sql, values, function(err, reply) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })
}
/*
 * catId#subCatId#detailedSubCatId$catId#subCatId#detailedSubCatId
 */
module.exports.queryStringForDumpCategoryInsertion = function(callback, categoryString, id) {
    var category = categoryString.split("$");
    var categoryLength = category.length;
    var values = new Array();
    var insertLength = "(?,?,?,?),";
    var querystring = '';
    for (var i = 0; i < categoryLength; i++) {
        (function(i) {
            var categorySub = category[i].split("#");
            var categorySubLength = categorySub.length;
            values.push(id, categorySub[0], categorySub[1], categorySub[2]);
            querystring += insertLength;

            if (i == categoryLength - 1) {
                console.log("idsLength   from querystring")
                querystring = querystring.substring(0, querystring.length - 1);
                callback(null, values, querystring);
            }
        }(i))
    }
}


/*
 * ------------------------------------------------------
 * Save supplier data step 2
 * Input : supplier id, delivery charges, country id , city id
 * Output:  supplier id
 * ------------------------------------------------------
 */
exports.storeSupplierDataStep2 = function(req, res) {
    var accessToken = req.body.accessToken;
    var supplierId = req.body.supplierId;
    var ids = req.body.ids;
    var manValues = [accessToken, supplierId, ids];
  //  console.log(manValues + "request parameters");

    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValues, cb);
        },
        function(cb) {
            func.authenticateDataGatheringAccessToken(req.dbName,accessToken, res, cb)
        },
        function(id,cb)
        {
            deleteDeliveryLocations(req.dbName,res,supplierId,cb);
        } ,
        function(cb) {
            insertDeliveryLocations(req.dbName,res, cb, ids, supplierId);
        }
    ], function(error, result) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {
                "supplier_id": supplierId
            };
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }

    });

}


/*
 * ------------------------------------------------------
 * List Data Gathering Admins
 * Input : access token , section id
 * Output:  list of data gathering admins
 * ------------------------------------------------------
 */
exports.listDataGatheringAdmins = function(req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValues, cb);
        },
        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function(id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
        },
        function(cb) {
            listDataGatheringAdmins(req.dbName,res, cb);
        }
    ], function(error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });

}


/*
 * ------------------------------------------------------
 * Add Data Gathering Admin
 * Input : access token , section id , name , email , password
 * Output:  list of data gathering admins
 * ------------------------------------------------------
 */
exports.addDataGatheringAdmin = function(req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var manValues = [accessToken, sectionId, name, email, password];
    var adminId;
    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValues, cb);
        },
        function(cb) {
            if (validator.validate(email)) {
                cb(null);
            } else {
                sendResponse.sendErrorMessage(constant.responseMessage.INVALID_EMAIL, res, constant.responseStatus.INVALID_EMAIL);
            }
        },
        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function(id, cb) {
            adminId = id;
            func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
        },
        function(cb) {
            checkDataGatheringEmailAvailablity(req.dbName,res, email, cb);
        },
        function(cb) {
            createDataGatheringAdmin(req.dbName,res, name, email, password, adminId, cb);
        }
    ], function(error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });

}


/*
 * ------------------------------------------------------
 * active or inactive data gathering admin
 * Input : access token , section id , data gathering id
 * Output:  success/error
 * ------------------------------------------------------
 */
exports.activeOrInactiveDataGatheringAdmin = function(req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var dataGatheringAdminId = req.body.dataGatheringAdminId;
    var status = req.body.status; // 0 for inactive, 1 for active
    var manValues = [accessToken, sectionId, dataGatheringAdminId, status];
    async.waterfall([

        function(cb) {
            func.checkBlank(res, manValues, cb);
        },
        function(cb) {
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function(id, cb) {
            func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
        },
        function(cb) {
            changeDataGatheringAdminStatus(req.dbName,res, dataGatheringAdminId, status, cb);
        }
    ], function(error, result) {

        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });

}

/*
 * ------------------------------------------------------
 * Following function inserts the data into supplier dump for step 1
 * Input : supplier name, email,category, providing delivery,
 * address, telephone, fax , email ,
 * primary mobile , secondary mobile(store data step 1)
 * Output:  supplier ids
 * ------------------------------------------------------
 */
function insertDumpDataIntoSupplier(dbName,res, supplierName, autoFetchAddress, telephone, fax, email, primaryMobile, secondaryMobile, imageUrl, categoryString, callback) {
    var sql = "insert into supplier_dump(supplier_name,supplier_email,address,telephone,fax";
    sql += " ,primary_mobile,secondary_mobile,supplier_image,category_ids) values(?,?,?,?,?,?,?,?,?)"
    multiConnection[dbName].query(sql, [supplierName, email, autoFetchAddress, telephone, fax, primaryMobile, secondaryMobile, imageUrl, categoryString], function(err, resultDump) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, resultDump.insertId);
        }
    })


}


function getSubCategoryNames(dbName,res, categoryId, callback) {

    var sql = "select id,name from categories where parent_id = ? and is_deleted = ? "
    multiConnection[dbName].query(sql, [categoryId, 0], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, result);
        }

    })

}


function getZoneNames(dbName,res, cityId, callback) {
    var sql = "select id,name from zone where city_id=? and is_deleted=?"
    multiConnection[dbName].query(sql, [cityId, 0], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, result);
        }

    })

}


function getAreaByZoneId(dbName,res, callback, zoneId) {
    var sql = "select id,name from area where zone_id = ? and is_deleted = ? ";
    multiConnection[dbName].query(sql, [zoneId, 0], function(err, reply) {
        if (err) {
            console.error(err);
            callback(1);
        } else {
            callback(null, reply);
        }
    })
}


function getCityByCountryId(dbName,res, callback, countryId) {
    var sql = "select id,name from city where country_id = ? and is_deleted = ? ";
    multiConnection[dbName].query(sql, [countryId, 0], function(err, reply) {
        if (err) {
            console.error(err);
            callback(1);
        } else {
            callback(null, reply);
        }
    })
}


/*
 *Following function is used to update data
 * for step three
 */
function storeDataStepThree(dbName,res, callback, manValue) {
    var sql = "update supplier_dump set delivery_prior_days = ?, delivery_prior_time = ?, working_days = ?, working_hrs = ?,minimum_order = ?,";
    sql += "  payment_method = ?, urgent_facility = ?,urgent_price = ?,house_maintenance_inspection = ?,house_maintenance_inspection_charges = ?, schedule_order_facility = ?, handling_fees = ?,";
    sql += " commision_giving = ?, web_app = ?, 	reaction = ?, subscription_type = ?, product_images_content = ?, interest_in_key = ?,";
    sql += " internet_available = ?, providing_delivery = ?,min_order_for_delivery = ?,min_order_delivery_charge = ?,delivery_charge = ?,urgent_type = ?,commission_type = ?,commission_price = ? where id = ? ";
    multiConnection[dbName].query(sql, manValue, function(error, reply) {
        if (error) {
            console.error(error);
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })
}


/*
 Following function is used to update data
 for step two
 */
function insertDeliveryLocations(dbName,res, callback, ids, supplierId) {
    var newValues;
    var newQueryString;
    async.auto({
        one: function(cb) {
            if (ids.length) {
                console.log("ids.length")
                createQueryStringForIds(cb, ids, supplierId, 0);
            } else {
                cb(null);
            }
        },
        three: ['one',
            function(cb, response) {
               // console.log("response.length first")
               // console.log(response)
                if (response.one) {
                    console.log("response.length")
                    newValues = response.one[1];
                    newQueryString = response['one'][0];
                  //  console.log("new values" + newValues);
                  //  console.log(("new query" + newQueryString))
                    var sql = "insert into supplier_delivery_area_dump(dump_supplier_id,country,city,zone,area,status) values" + newQueryString;
                    multiConnection[dbName].query(sql, newValues, function(err1, reply1) {
                        if (err1) {
                            console.log(err1);
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            cb(null);
                        }
                    })
                }
            }
        ]
    }, function(err, reply) {
        if (err) {
            console.log(err1);
            sendResponse.somethingWentWrongError(res);
        } else {
           // console.log("final function")
            callback(null);
        }
    })
}



function createQueryStringForIds(callback, ids1, supplierId, status) {
    var ids = ids1.split("$");
    var idsLength = ids.length;
    var values = new Array();
    var insertLength = "(?,?,?,?,?,?),";
    var querystring = '';
    for (var i = 0; i < idsLength; i++) {
        (function(i) {
            var countryCityZone = ids[i].split("#");
            var areaArray = countryCityZone[countryCityZone.length - 1].split("@");
            var areaLength = areaArray.length;

            for (var j = 0; j < areaLength; j++) {
                (function(j) {
                    values.push(supplierId, countryCityZone[0], countryCityZone[1], countryCityZone[2], areaArray[j], status);
                    querystring += insertLength;
                }(j))
            }
            if (i == idsLength - 1) {
              //  console.log("idsLength   from querystring")
                var idsData = [];
                idsData.push(querystring.substring(0, querystring.length - 1));
                idsData.push(values);
                callback(null, idsData);
            }
        }(i))
    }
}


function insertDeliveryCharge(res, callback, supplierId, deliveryCharge) {
    var sql = "update supplier_dump set delivery_charge = ? where id = ?";
    multiConnection[dbName].query(sql, [deliveryCharge, supplierId], function(err, reply) {
        if (err) {
            console.log(err);
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }
    })
}


/*
 *Following function is used to update data
 * for step four
 */
function storeDataStepFour(dbName,res, callback, manValue) {
    var referenceNumber;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    var today = dd + '/' + mm + '/' + yyyy;

    async.waterfall([

        function(cb) {
            func.generateRandomString(cb);
        },
        function(randomString, cb) {

            referenceNumber = "DG/" + today + "/" + randomString;

            var sql = "update supplier_dump set estimate_start_date = ?, contract_status = ?, advertisement_interest = ?, concerned_person_name = ?,designation = ?,";
            sql += " mobile_number = ?, rate_frequent_change = ?, rate_validity = ?, staff_gender = ?, 	no_of_staff = ?,";
            sql += " comments = ? ,staff_remarks = ? , content_died_line = ? , no_of_branches = ?, about_us = ?,dump_complete_status= ?,subscription_period = ?, registered_by = ?,business_start_date = ? where id = ? ";
            multiConnection[dbName].query(sql, manValue, function(error, reply) {
                if (error) {
                    console.error(error);
                    sendResponse.somethingWentWrongError(res);
                } else {
                    var sql2 = "update supplier_dump set reference_no = ? where id = ? limit 1"
                    multiConnection[dbName].query(sql2, [referenceNumber, manValue[manValue.length - 1]], function(err, result2) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        } else {
                            cb(null, referenceNumber);
                        }

                    })

                }
            })
        }
    ], function(err, result) {

        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null, referenceNumber);
        }
    })


}


function listDataGatheringAdmins(dbName,res, callback) {

    var sql = "SELECT `name`,`email`,`is_active`,`id` FROM `data_gathering_admin` order by id DESC"
    multiConnection[dbName].query(sql, function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res)
        } else {
            callback(null, result);
        }

    })

}


function checkDataGatheringEmailAvailablity(dbName,res, email, callback) {
    var sql = "select id from data_gathering_admin where email = ? limit 1"
    multiConnection[dbName].query(sql, [email], function(err, emailCheck) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            if (emailCheck.length) {
                sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_EXISTS, res, constant.responseStatus.SOME_ERROR);
            } else {
                callback(null);
            }
        }

    })

}

function createDataGatheringAdmin(dbName,res, name, email, password, adminId, callback) {
    var sql = "insert into data_gathering_admin(name,email,password,access_token,created_by) values(?,?,?,?,?)";
    var accessToken = func.encrypt(email + new Date());
    async.waterfall([

        function(cb) {
            cb(null, md5(password));
        },
        function(cryptedPass, cb) {
            multiConnection[dbName].query(sql, [name, email, cryptedPass, accessToken, adminId], function(err1, reply1) {
                if (err1) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    callback(null, reply1.insertId);
                }
            })
        }
    ], function(err, response) {
        callback(null);
    })

}


function changeDataGatheringAdminStatus(dbName,res, dataGatheringAdminId, status, callback) {
    var sql = "update data_gathering_admin set is_active = ? where id = ? limit 1"
    multiConnection[dbName].query(sql, [status, dataGatheringAdminId], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            callback(null);
        }

    })
}


function checkEmailandPassword(dbName,res, email, password, callback) {
    var sql = "select id,access_token,password,is_active from data_gathering_admin where email = ?  limit 1"
    multiConnection[dbName].query(sql, [email], function(err, result) {
        if (err) {

            sendResponse.somethingWentWrongError(res);
        } else {
            var encryptedPassword = md5(password);
            if (result.length) {

                if(result[0].is_active == 1)
                {
                    if (encryptedPassword == result[0].password) {
                        callback(null, result[0].access_token);
                    } else {
                        sendResponse.sendErrorMessage(constant.responseMessage.INVALID_PASS, res, constant.responseStatus.SOME_ERROR);
                    }
                }
                else{
                    sendResponse.sendErrorMessage(constant.responseMessage.NOT_ACTIVE, res, constant.responseStatus.SOME_ERROR);
                }


            } else {
                sendResponse.sendErrorMessage(constant.responseMessage.EMAIL_NOT_EXISTS, res, constant.responseStatus.SOME_ERROR);
            }
        }

    })

}

function checkNumber(res, data, cb) {
    var z1 = /^[0-9]*$/;
    if (!z1.test(data[0]) || !z1.test(data[1])) {
        sendResponse.parameterMissingError(res);
    } else {
        cb(null);
    }
}

function deleteDeliveryLocations(dbName,res,supplierId,cb)
{
    q = 'DELETE FROM supplier_delivery_area_dump ' +
        ' WHERE dump_supplier_id =' + supplierId ;
    multiConnection[dbName].query(q ,function(err,result)
    {
        if(err){
            console.log("errrrrrrrrrr",err)
            sendResponse.somethingWentWrongError(res);
        }

        else
            cb(null);
    })
}