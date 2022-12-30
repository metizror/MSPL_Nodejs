/**
 * Created by cbl98 on 19/5/16.
 */

var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginfunctionsupplier');
var loginFunction = require('./loginFunctions');
var orderFunction = require('./orderFunction');
var adminOrders = require('./adminOrders');
var pushNotifications = require('./pushNotifications');
var moment = require('moment');
var emailTemp = require('./email');
var _ = require('underscore')
var AdminMail = "ops@royo.com";
//var AdminMail = "mohit0641@gmail.com"
const common = require('../common/agent')
var log4js = require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';
var Execute = require('../lib/Execute')
const lib = require('../lib/NotificationMgr')
const Universal = require('../util/Universal')
var web_request = require('request');
const agent = require('../common/agent');
const smsManager = require('../lib/smsManager')

exports.orderListing = function (req, res) {

    var accessToken = 0;
    var sectionId = 0;
    var adminId;
    var data = {};
    var limit;
    var offset;
    offset = parseInt(req.body.offset);
    var serachType = 0;
    var serachText, total_order_count = 0;
    var tab_status = req.body.tab_status != undefined && req.body.tab_status != "" ? req.body.tab_status : 0
    var sub_status = req.body.sub_status != undefined && req.body.sub_status != "" ? req.body.sub_status : 0
    var payment_type = req.body.payment_type != undefined && req.body.payment_type != "" ? req.body.payment_type : 0
    var start_date = req.body.start_date || "1991-01-11";
    var end_date = req.body.end_date || "2025-01-11";

    async.auto({
        blankField: function (cb) {
            console.log("........req.body.....", req.body);
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                if (req.body.limit) {
                    limit = parseInt(req.body.limit);
                }
                if (req.body.serachType) {
                    serachType = parseInt(req.body.serachType);
                }
                if (req.body.serachText) {
                    serachText = req.body.serachText;
                    serachType = 1
                }
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    console.log("adminId:  ", adminId);
                    cb(null);
                }
            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        orderList: ['blankField', 'authenticate', 'checkauthority', function (cb) {

            console.log("==========", tab_status, sub_status);

            loginFunctions.adminOrders(req.dbName, res, limit, offset, serachText, serachType, tab_status, sub_status,
                payment_type,
                start_date,
                end_date,
                function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        data.orders = result.orders;
                        total_order_count = result.total_count
                        cb(null);
                    }
                })

        }],
        agentStatus: ['orderList', function (cb) {

            var final_data = [];
            var orderHistory = data.orders
            var leng = orderHistory.length, getAgentDbData = {}, agentConnection = {}
            if (leng > 0) {
                async.each(orderHistory, async function (i, callback2) {
                    console.log("==AGENT==CONNECTION==>>===", agentConnection)
                    // if(i.is_agent==1){

                    getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                    logger.debug("===AGENT==CONNECTION==>>==2=", Object.entries(agentConnection).length)
                    if (Object.entries(agentConnection).length === 0) {
                        agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                    }
                    var sqlQuery = "select `ors`.`status`,`usr`.`name`,`usr`.`image`,`usr`.`id` as `agent_id` from `cbl_user_orders` ors join `cbl_user` `usr` on `usr`.id=`ors`.`user_id`  where order_id=?";
                    agentConnection.query(sqlQuery, [i.id], function (err, statusData) {
                        logger.debug("==ERR!====", err)
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            // console.log("====statusData====",statusData)                        
                            if (statusData && statusData.length > 0) {
                                // i.status=statusData[0].status;
                                i.agent_name = statusData[0].name;
                                i.agent_image = statusData[0].image;
                                i.agent_id = statusData[0].agent_id;
                                // i.agent_name=
                                final_data.push(i)
                                callback2(null)
                            }
                            else {
                                final_data.push(i)
                                callback2(null)
                            }
                        }
                    });

                    // else{
                    //     final_data.push(i)
                    //     callback2(null)
                    // }

                }, function (err) {
                    // console.log("====FINAL==ERROR====",err);
                    if (err) {
                        cb(err);
                    }
                    else {
                        // console.log("====final_data=++ENR",final_data)
                        var order_data = _.sortBy(final_data, 'id').reverse();
                        data.orders = order_data
                        data.total_order = total_order_count
                        cb(null)
                    }

                });
            }
            else {
                cb(null)
            }
        }],
        totalOrders: ['agentStatus', function (cb) {
            // console.log("=======AFTER==STATUS==")
            if (serachType == 0) {
                var sql = 'select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id ' +
                    'join user u on o.user_id=u.id';
                multiConnection[req.dbName].query(sql, function (err, orders) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        // data.total_order=orders.length;
                        cb(null);
                    }
                })
            } else {
                var sql = "select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                    "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id " +
                    "join user u on o.user_id=u.id having o.id LIKE '%" + serachText + "%' or u.email LIKE '%" + serachText + "%'  or s.name LIKE '%" + serachText + "%'" +
                    " or u.mobile_no LIKE '%" + serachText + "%' ";
                console.log("***************", sql);
                multiConnection[req.dbName].query(sql, function (err, orders) {
                    if (err) {
                        // console.log('error------',err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        // data.total_order=orders.length;
                        cb(null);
                    }
                })
            }


        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
};
exports.orderListingV2 = function (req, res) {


    var accessToken = 0;
    var sectionId = 0;
    var adminId;
    var data = {};
    var limit;
    var offset;
    offset = parseInt(req.body.offset);
    var serachType = 0;
    var serachText, total_order_count = 0;
    var tab_status = req.body.tab_status != undefined && req.body.tab_status != "" ? req.body.tab_status : 0
    var sub_status = req.body.sub_status != undefined && req.body.sub_status != "" ? req.body.sub_status : 0
    var payment_type = req.body.payment_type != undefined && req.body.payment_type != "" ? req.body.payment_type : 0
    var start_date = req.body.start_date || "1991-01-11";
    var end_date = req.body.end_date || "2025-01-11";
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    let is_dine_in = req.body.is_dine_in == undefined ? 0 : req.body.is_dine_in
    let agent_id = req.body.agent_id == undefined ? 0 : req.body.agent_id
    let filter_by = req.body.filter_by !== undefined && req.body.filter_by !== "" &&
        req.body.filter_by !== null ? req.body.filter_by : 0
    async.auto({
        blankField: function (cb) {
            console.log("........req.body.....", req.body);
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                if (req.body.limit) {
                    limit = parseInt(req.body.limit);
                }
                if (req.body.serachType) {
                    serachType = parseInt(req.body.serachType);
                }
                if (req.body.serachText) {
                    serachText = req.body.serachText;
                    serachType = 1
                }
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    console.log("adminId:  ", adminId);
                    cb(null);
                }
            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        orderList: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            console.log("==========", tab_status, sub_status);


            loginFunctions.adminOrdersV2(req, req.dbName, res, limit, offset, serachText, serachType, tab_status, sub_status,
                payment_type,
                start_date,
                end_date,
                country_code,
                country_code_type,
                is_dine_in,
                agent_id,
                filter_by,
                function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        data.orders = result.orders;
                        total_order_count = result.total_count
                        cb(null);
                    }
                })

        }],
        agentStatus: ['orderList', async function (cb) {

            var final_data = [];
            var orderHistory = data.orders
            var leng = orderHistory.length, getAgentDbData = {}, agentConnection = {}
            if (leng > 0) {
                getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                logger.debug("===AGENT==CONNECTION==>>==2=", Object.entries(agentConnection).length)
                if (Object.entries(agentConnection).length === 0) {
                    agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                }

                //console.log("==AGENT==CONNECTION==>>===",agentConnection)


                let orderIds = [];
                async.each(orderHistory, async function (i, callback2) {
                    orderIds.push(i.id);
                });

                var sqlQuery = "select `ors`.`order_id`,`ors`.`status`,`usr`.`name`,`usr`.`image`,`usr`.`id` as `agent_id` from `cbl_user_orders` ors join `cbl_user` `usr` on `usr`.id=`ors`.`user_id`  where order_id IN (?)";
                let cblOrders = [];
                let statusData = await Execute.QueryAgent(agentConnection, sqlQuery, [orderIds]);
                cblOrders = statusData
                logger.debug("=====statusData======>>", statusData)
                // await agentConnection.query(sqlQuery,[orderIds], function(err,statusData){
                //     logger.debug("======Err!=====>>>",err,statusData)
                //       cblOrders = statusData;
                //  });
                if (orderHistory && orderHistory.length > 0) {
                    for (const [index, i] of orderHistory.entries()) {
                        // async.each(orderHistory,async function (i, callback2) 
                        //     {
                        // console.log("==AGENT==CONNECTION==>>===",agentConnection)
                        // if(i.is_agent==1){

                        // getAgentDbData=await common.GetAgentDbInformation(req.dbName);
                        //logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length)
                        // if(Object.entries(agentConnection).length===0){
                        //  agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                        //}
                        //below this  
                        //var sqlQuery="select `ors`.`status`,`usr`.`name`,`usr`.`image`,`usr`.`id` as `agent_id` from `cbl_user_orders` ors join `cbl_user` `usr` on `usr`.id=`ors`.`user_id`  where order_id=?";
                        //agentConnection.query(sqlQuery,[i.id],function(err,statusData){
                        //logger.debug("==ERR!====",err) 
                        //if (err) {
                        //  sendResponse.somethingWentWrongError(res);
                        // }
                        //else{       
                        // console.log("====statusData====",statusData)                        
                        //  if(statusData && statusData.length>0){                                   
                        // i.status=statusData[0].status;
                        //    i.agent_name=statusData[0].name;
                        //   i.agent_image=statusData[0].image;
                        //  i.agent_id=statusData[0].agent_id;                                
                        // i.agent_name=
                        // final_data.push(i)
                        //callback2(null)
                        // }
                        //else{
                        //  final_data.push(i)
                        // callback2(null)
                        // }
                        //}
                        //});

                        if (cblOrders && cblOrders.length > 0) {
                            for (const [categIndex, cblOrder] of cblOrders.entries()) {
                                logger.debug("==========cblOrder.order_id==i.id==========", cblOrder.order_id, i.id)
                                if (cblOrder.order_id == i.id) {
                                    // i.status=statusData[0].status;
                                    i.agent_name = cblOrder.name;
                                    i.agent_image = cblOrder.image;
                                    i.agent_id = cblOrder.agent_id;

                                    // callback2(null)
                                }
                            }
                        }
                        final_data.push(i)
                        if (index == orderHistory.length - 1) {
                            // console.log("====final_data=++ENR",final_data)
                            let order_data = _.sortBy(final_data, 'id').reverse();
                            data.orders = order_data
                            data.total_order = total_order_count
                            cb(null)
                        }

                        // else{
                        //     final_data.push(i)
                        //     callback2(null)
                        // }

                        // },function(err) {
                        //     // console.log("====FINAL==ERROR====",err);
                        //     if (err) {
                        //         cb(err);
                        //     }
                        //     else{
                        // console.log("====final_data=++ENR",final_data)
                        // var order_data=_.sortBy(final_data,'id').reverse();
                        // data.orders=order_data
                        // data.total_order = total_order_count
                        // cb(null)
                        //     }

                        //   });
                    }
                }
            }
            else {
                cb(null)
            }
        }],
        totalOrders: ['agentStatus', function (cb) {
            // console.log("=======AFTER==STATUS==")
            if (serachType == 0) {
                var sql = 'select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id ' +
                    'join user u on o.user_id=u.id';
                multiConnection[req.dbName].query(sql, function (err, orders) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        // data.total_order=orders.length;
                        cb(null);
                    }
                })
            } else {
                var sql = "select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                    "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id " +
                    "join user u on o.user_id=u.id having o.id LIKE '%" + serachText + "%' or u.email LIKE '%" + serachText + "%'  or s.name LIKE '%" + serachText + "%'" +
                    " or u.mobile_no LIKE '%" + serachText + "%' ";
                console.log("***************", sql);
                multiConnection[req.dbName].query(sql, function (err, orders) {
                    if (err) {
                        // console.log('error------',err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        // data.total_order=orders.length;
                        cb(null);
                    }
                })
            }


        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
};

exports.orderListingV2Prev = function (req, res) {

    var accessToken = 0;
    var sectionId = 0;
    var adminId;
    var data = {};
    var limit;
    var offset;
    offset = parseInt(req.body.offset);
    var serachType = 0;
    var serachText, total_order_count = 0;
    var tab_status = req.body.tab_status != undefined && req.body.tab_status != "" ? req.body.tab_status : 0
    var sub_status = req.body.sub_status != undefined && req.body.sub_status != "" ? req.body.sub_status : 0
    var payment_type = req.body.payment_type != undefined && req.body.payment_type != "" ? req.body.payment_type : 0
    var start_date = req.body.start_date || "1991-01-11";
    var end_date = req.body.end_date || "2025-01-11";
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    let is_dine_in = req.body.is_dine_in == undefined ? 0 : req.body.is_dine_in
    let agent_id = req.body.agent_id == undefined ? 0 : req.body.agent_id
    let filter_by = req.body.filter_by !== undefined && req.body.filter_by !== "" &&
        req.body.filter_by !== null ? req.body.filter_by : 0
    async.auto({
        blankField: function (cb) {
            console.log("........req.body.....", req.body);
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                if (req.body.limit) {
                    limit = parseInt(req.body.limit);
                }
                if (req.body.serachType) {
                    serachType = parseInt(req.body.serachType);
                }
                if (req.body.serachText) {
                    serachText = req.body.serachText;
                    serachType = 1
                }
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    console.log("adminId:  ", adminId);
                    cb(null);
                }
            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        orderList: ['blankField', 'authenticate', 'checkauthority', function (cb) {

            console.log("==========", tab_status, sub_status);

            loginFunctions.adminOrdersV2(req, req.dbName, res, limit, offset, serachText, serachType, tab_status, sub_status,
                payment_type,
                start_date,
                end_date,
                country_code,
                country_code_type,
                is_dine_in,
                agent_id,
                filter_by,
                function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        data.orders = result.orders;
                        total_order_count = result.total_count
                        cb(null);
                    }
                })

        }],
        agentStatus: ['orderList', async function (cb) {

            var final_data = [];
            var orderHistory = data.orders
            var leng = orderHistory.length, getAgentDbData = {}, agentConnection = {}
            if (leng > 0) {
                getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                logger.debug("===AGENT==CONNECTION==>>==2=", Object.entries(agentConnection).length)
                if (Object.entries(agentConnection).length === 0) {
                    agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                }

                //console.log("==AGENT==CONNECTION==>>===",agentConnection)


                let orderIds = [];
                async.each(orderHistory, async function (i, callback2) {
                    orderIds.push(i.id);
                });

                var sqlQuery = "select `ors`.`order_id`,`usr`.`name`,`usr`.`image`,`usr`.`id` as `agent_id` from `cbl_user_orders` ors join `cbl_user` `usr` on `usr`.id=`ors`.`user_id`  where order_id IN (?)";
                let cblOrders = [];
                await agentConnection.query(sqlQuery, [orderIds], function (err, statusData) {
                    cblOrders = statusData;
                });

                async.each(orderHistory, async function (i, callback2) {
                    // console.log("==AGENT==CONNECTION==>>===",agentConnection)
                    // if(i.is_agent==1){

                    // getAgentDbData=await common.GetAgentDbInformation(req.dbName);
                    //logger.debug("===AGENT==CONNECTION==>>==2=",Object.entries(agentConnection).length)
                    // if(Object.entries(agentConnection).length===0){
                    //  agentConnection=await common.RunTimeAgentConnection(getAgentDbData);
                    //}
                    //below this  
                    //var sqlQuery="select `ors`.`status`,`usr`.`name`,`usr`.`image`,`usr`.`id` as `agent_id` from `cbl_user_orders` ors join `cbl_user` `usr` on `usr`.id=`ors`.`user_id`  where order_id=?";
                    //agentConnection.query(sqlQuery,[i.id],function(err,statusData){
                    //logger.debug("==ERR!====",err) 
                    //if (err) {
                    //  sendResponse.somethingWentWrongError(res);
                    // }
                    //else{       
                    // console.log("====statusData====",statusData)                        
                    //  if(statusData && statusData.length>0){                                   
                    // i.status=statusData[0].status;
                    //    i.agent_name=statusData[0].name;
                    //   i.agent_image=statusData[0].image;
                    //  i.agent_id=statusData[0].agent_id;                                
                    // i.agent_name=
                    // final_data.push(i)
                    //callback2(null)
                    // }
                    //else{
                    //  final_data.push(i)
                    // callback2(null)
                    // }
                    //}
                    //});

                    if (cblOrders && cblOrders.length > 0) {
                        for (const [categIndex, cblOrder] of cblOrders.entries()) {
                            if (cblOrder.order_id == i.id) {
                                // i.status=statusData[0].status;
                                i.agent_name = cblOrder.name;
                                i.agent_image = cblOrder.image;
                                i.agent_id = cblOrder.agent_id;
                                final_data.push(i)
                                callback2(null)
                            }
                        }
                    } else {
                        final_data.push(i)
                        callback2(null)
                    }

                    // else{
                    //     final_data.push(i)
                    //     callback2(null)
                    // }

                }, function (err) {
                    // console.log("====FINAL==ERROR====",err);
                    if (err) {
                        cb(err);
                    }
                    else {
                        // console.log("====final_data=++ENR",final_data)
                        var order_data = _.sortBy(final_data, 'id').reverse();
                        data.orders = order_data
                        data.total_order = total_order_count
                        cb(null)
                    }

                });
            }
            else {
                cb(null)
            }
        }],
        totalOrders: ['agentStatus', function (cb) {
            // console.log("=======AFTER==STATUS==")
            if (serachType == 0) {
                var sql = 'select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id ' +
                    'join user u on o.user_id=u.id';
                multiConnection[req.dbName].query(sql, function (err, orders) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        // data.total_order=orders.length;
                        cb(null);
                    }
                })
            } else {
                var sql = "select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                    "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id " +
                    "join user u on o.user_id=u.id having o.id LIKE '%" + serachText + "%' or u.email LIKE '%" + serachText + "%'  or s.name LIKE '%" + serachText + "%'" +
                    " or u.mobile_no LIKE '%" + serachText + "%' ";
                console.log("***************", sql);
                multiConnection[req.dbName].query(sql, function (err, orders) {
                    if (err) {
                        // console.log('error------',err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        // data.total_order=orders.length;
                        cb(null);
                    }
                })
            }


        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
};

exports.deliveryCompanyOrderListing = function (req, res) {

    var accessToken = 0;
    var sectionId = 0;
    var adminId;
    var data = {};
    var limit;
    var offset;
    offset = parseInt(req.body.offset);
    var serachType = 0;
    var serachText, total_order_count = 0;
    var tab_status = req.body.tab_status != undefined && req.body.tab_status != "" ? req.body.tab_status : 0
    var sub_status = req.body.sub_status != undefined && req.body.sub_status != "" ? req.body.sub_status : 0
    var payment_type = req.body.payment_type != undefined && req.body.payment_type != "" ? req.body.payment_type : 0
    var start_date = req.body.start_date || "1991-01-11";
    var end_date = req.body.end_date || "2025-01-11";
    var country_code = req.body.country_code ? req.body.country_code : ''
    var country_code_type = req.body.country_code_type ? req.body.country_code_type : ''
    let is_dine_in = req.body.is_dine_in == undefined ? 0 : req.body.is_dine_in
    let agent_id = req.body.agent_id == undefined ? 0 : req.body.agent_id
    let filter_by = req.body.filter_by !== undefined && req.body.filter_by !== "" &&
        req.body.filter_by !== null ? req.body.filter_by : 0
    let delivery_company_id = req.body.delivery_company_id
    async.auto({
        blankField: function (cb) {
            console.log("........req.body.....", req.body);
            if (req.body &&
                req.body.accessToken &&
                req.body.delivery_company_id,
                req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                if (req.body.limit) {
                    limit = parseInt(req.body.limit);
                }
                if (req.body.serachType) {
                    serachType = parseInt(req.body.serachType);
                }
                if (req.body.serachText) {
                    serachText = req.body.serachText;
                    serachType = 1
                }
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        orderList: ['blankField', function (cb) {

            console.log("==========", tab_status, sub_status);

            loginFunctions.deliveryCompanyOrders(req.dbName,
                res, limit, offset, serachText, serachType, tab_status, sub_status,
                payment_type,
                start_date,
                end_date,
                country_code,
                country_code_type,
                is_dine_in,
                agent_id,
                filter_by,
                delivery_company_id,
                function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        data.orders = result.orders;
                        total_order_count = result.total_count
                        cb(null);
                    }
                })

        }],
        agentStatus: ['orderList', function (cb) {

            var final_data = [];
            var orderHistory = data.orders
            var leng = orderHistory.length, getAgentDbData = {}, agentConnection = {}
            if (leng > 0) {
                async.each(orderHistory, async function (i, callback2) {
                    console.log("==AGENT==CONNECTION==>>===", agentConnection)
                    // if(i.is_agent==1){

                    getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                    logger.debug("===AGENT==CONNECTION==>>==2=", Object.entries(agentConnection).length)
                    if (Object.entries(agentConnection).length === 0) {
                        agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                    }
                    var sqlQuery = "select `ors`.`status`,`usr`.`name`,`usr`.`image`,`usr`.`id` as `agent_id` from `cbl_user_orders` ors join `cbl_user` `usr` on `usr`.id=`ors`.`user_id`  where order_id=?";
                    agentConnection.query(sqlQuery, [i.id], function (err, statusData) {
                        logger.debug("==ERR!====", err)
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            // console.log("====statusData====",statusData)                        
                            if (statusData && statusData.length > 0) {
                                // i.status=statusData[0].status;
                                i.agent_name = statusData[0].name;
                                i.agent_image = statusData[0].image;
                                i.agent_id = statusData[0].agent_id;
                                // i.agent_name=
                                final_data.push(i)
                                callback2(null)
                            }
                            else {
                                final_data.push(i)
                                callback2(null)
                            }
                        }
                    });

                    // else{
                    //     final_data.push(i)
                    //     callback2(null)
                    // }

                }, function (err) {
                    // console.log("====FINAL==ERROR====",err);
                    if (err) {
                        cb(err);
                    }
                    else {
                        // console.log("====final_data=++ENR",final_data)
                        var order_data = _.sortBy(final_data, 'id').reverse();
                        data.orders = order_data
                        data.total_order = total_order_count
                        cb(null)
                    }

                });
            }
            else {
                cb(null)
            }
        }],
        totalOrders: ['agentStatus', function (cb) {
            // console.log("=======AFTER==STATUS==")
            if (serachType == 0) {
                var sql = 'select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id ' +
                    'join user u on o.user_id=u.id';
                multiConnection[req.dbName].query(sql, function (err, orders) {
                    if (err) {
                        console.log('error------', err);
                        sendResponse.somethingWentWrongError(res);
                    } else {
                        // data.total_order=orders.length;
                        cb(null);
                    }
                })
            } else {
                var sql = "select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                    "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id " +
                    "join user u on o.user_id=u.id having o.id LIKE '%" + serachText + "%' or u.email LIKE '%" + serachText + "%'  or s.name LIKE '%" + serachText + "%'" +
                    " or u.mobile_no LIKE '%" + serachText + "%' ";
                console.log("***************", sql);
                multiConnection[req.dbName].query(sql, function (err, orders) {
                    if (err) {
                        // console.log('error------',err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else {
                        // data.total_order=orders.length;
                        cb(null);
                    }
                })
            }


        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
};

exports.orderDescription = function (req, res) {
    var accessToken = 0;
    var sectionId = 0
    var orderId = 0;
    var adminId;
    var data = {};
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    //  console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],

        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        orderdescription: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            logger.debug("==============in orderDescription------function------");

            orderFunction.orderDescription(req.dbName, res, orderId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    logger.debug("=========in data of orderdesc function=========", result)
                    // data.productList = result;
                    data = result
                    // console.log('data----', result);
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            logger.debug("++==============final err--============", err)
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

};


exports.orderDescriptionV2 = function (req, res) {

    var accessToken = 0;
    var sectionId = 0
    var orderId = 0;
    var adminId;
    var data = {};
    let groupId = req.body.grouping_id || 0
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },

        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    //  console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],

        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        orderdescription: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            logger.debug("==============in orderDescription------function------");


            orderFunction.orderDescriptionV2(req.dbName, res, orderId, groupId, async function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    logger.debug("=========in data of orderdesc function=========", result)
                    // data.productList = result;
                    let shipooData = await Execute.Query(req.dbName, `select shippo_label_url,shippo_tracking_number from orders where  id=? `, [orderId]);
                    result[0].shippo_label_url = shipooData[0].shippo_label_url
                    result[0].shippo_tracking_number = shipooData[0].shippo_tracking_number
                    data = result
                    // console.log('data----', result);
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            logger.debug("++==============final err--============", err)
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

};
/**
 * add new for north west Eats project for without authentication case
 */
exports.orderDescriptionV3 = function (req, res) {
    var orderId = req.body.orderId;
    var data = {};
    let groupId = req.body.grouping_id || 0
    async.auto({
        orderdescription: function (cb) {
            logger.debug("==============in orderDescription------function------");

            orderFunction.orderDescriptionV2(req.dbName, res, orderId, groupId, async function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    logger.debug("=========in data of orderdesc function=========", result)
                    // data.productList = result;
                    let shipooData = await Execute.Query(req.dbName, `select shippo_label_url,shippo_tracking_number from orders where  id=? `, [orderId]);
                    result[0].shippo_label_url = shipooData[0].shippo_label_url
                    result[0].shippo_tracking_number = shipooData[0].shippo_tracking_number
                    data = result
                    // console.log('data----', result);
                    cb(null);
                }
            })

        }
    }, function (err, result) {
        if (err) {
            logger.debug("++==============final err--============", err)
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}
exports.orderDescriptionV2Prev = function (req, res) {
    var accessToken = 0;
    var sectionId = 0
    var orderId = 0;
    var adminId;
    var data = {};
    let groupId = req.body.grouping_id || 0
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    //  console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],

        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        orderdescription: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            orderFunction.orderDescriptionV2(req.dbName, res, orderId, groupId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result
                    cb(null);
                }
            })

        }]

    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

};

exports.deliveryCompanyOrderDescription = function (req, res) {
    var accessToken = 0;
    var sectionId = 0
    var orderId = 0;
    var adminId;
    var data = {};
    let groupId = req.body.grouping_id || 0
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        orderdescription: ['blankField', function (cb) {
            logger.debug("==============in orderDescription------function------");

            orderFunction.orderDescriptionV2(req.dbName, res, orderId, groupId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    logger.debug("=========in data of orderdesc function=========", result)
                    // data.productList = result;
                    data = result
                    // console.log('data----', result);
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })

};

exports.pendingOrders = function (req, res) {
    var accessToken = 0;
    var sectionId = 0
    var adminId = 0;
    var data;
    console.log(req.body);

    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        orderList: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            loginFunctions.adminPendingOrdersList(req.dbName, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
                    //   console.log('data----', result);
                    cb(null);
                }
            })

        }],
        status: ['orderList', function (cb) {
            var orders_data = data, agentConnection = {};
            console.log("========orders_data=====", orders_data)
            for (const [index, i] of orders_data.entries()) {

                if (i.is_agent == 1) {

                    var bQuery = "select is_agent,user_id from orders where id=? and is_agent=?"
                    multiConnection[req.dbName].query(bQuery, [i.id, 1], async function (err, bData) {
                        if (err) {
                            sendResponse.somethingWentWrongError(res);
                        }
                        else {
                            if (bData && bData.length > 0) {
                                var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                                logger.debug("===AGENT==CONNECTION==>>==2=", Object.entries(agentConnection).length)
                                if (Object.entries(agentConnection).length === 0) {
                                    agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                                }
                                var sqlQuery = "select `status` from cbl_user_orders  where order_id=?";
                                agentConnection.query(sqlQuery, [i.id], async function (err, statusData) {
                                    //    console.log(err)
                                    if (err) {
                                        sendResponse.somethingWentWrongError(res);
                                    }
                                    else {
                                        if (statusData && statusData.length > 0) {
                                            // console.log("=====statusData[i].status=====",i.id,orders_data[index].status,statusData[0].status)
                                            orders_data[index].status = statusData[0].status
                                        }

                                    }
                                });
                            }

                        }
                    })
                }
                if (index == orders_data.length - 1) {
                    data = orders_data;
                    cb(null);
                }
            }
        }],
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
};
/**
 * @description used for order confirmed by admin
 * @param {*Object} req 
 * @param {*Object} res 
 */
const getUserAndSupplierLocation = (dbName, orderId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let res1 = await Execute.Query(dbName, `select user.latitude as user_latitude,user.longitude as user_longitude,sb.latitude as supplier_latitude,sb.longitude as supplier_longitude from orders o join user user on o.user_id=user.id join supplier_branch sb on o.supplier_branch_id=sb.id where o.id=? `, [orderId])

            resolve(res1)
        }
        catch (err) {
            logger.debug("============err======", err)
            reject()
        }
    })
}
exports.confirmPendingOrder = async function (req, res) {


    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var deviceToken = 0;
    let user_delivery_address = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierId = 0;
    var supplierName = 0;
    var notificationStatus;
    var notificationLanguage;
    let cartId = 0;
    let userLanguage = "en";
    var message;
    var userEmailId;
    var userName;
    var net_amount;
    var created_on;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    let reject_reasons = req.body.reject_reasons != undefined ? req.body.reject_reasons : "";
    var schedule_date;
    var payment_type, self_pickup = 0;
    let ordersPrice = []
    var preparation_time = req.body.preparation_time != undefined ? req.body.preparation_time : "00:00:00"
    var delivery_date_time = req.body.delivery_date_time != undefined ? req.body.delivery_date_time : "00:00:00"
    let agentOrderDetail = [];
    let countryCode = "";
    let mobileNumber = "";


    let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=? and value=1",
        ["allowTextMsgOnStatusChange"]
    )

    let enable_base_delivery_charge_on_vehicle_cat = await Execute.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=? and value=1",
        ["enable_base_delivery_charge_on_vehicle_cat"]
    )
    let isMultipleOrderAssingedOnce = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=? and `value`=?", ["assigned_multiple_order_once_after_confimation", "1"]);
    var check = 0;
    let vehicle_id = req.body.vehicle_id || 0;
    let _cartId = 0;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {

            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        checkOrderStatus: ['checkauthority', function (cb) {

            orderFunction.checkOrderStatus(req.dbName, orderId, cb, res);

        }],
        calculateDeliveryChargeAccToVehicleType: ['checkOrderStatus', async function (cb) {

            let data = await getUserAndSupplierLocation(req.dbName, orderId);

            if (enable_base_delivery_charge_on_vehicle_cat && enable_base_delivery_charge_on_vehicle_cat.length > 0) {
                //for agent db connection
                var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);


                console.log("========latitide and longitude of user and supplier=>>",
                    data[0].user_latitude,
                    data[0].user_longitude,
                    data[0].supplier_latitude,
                    data[0].supplier_longitude);

                // for getting distance between two latitude and longitude
                let mUnit = await Universal.getMeausringUnit(req.dbName);

                console.log("===mUnit=====>>", mUnit, req.query);
                let apiKey = await Universal.getGoogleApiKey(req.dbName);

                let { user_latitude, user_longitude, supplier_latitude, supplier_longitude } = data[0]

                let matrixData = await Universal.getDistanceMatrix(user_latitude, user_longitude, supplier_latitude, supplier_longitude, apiKey);
                console.log("----matrixData-------matrixData-----", matrixData)
                let finaldistance = (matrixData.distanceValue || 0) / 1000;
                console.log("===finaldistance=====>>", finaldistance);

                finaldistance = parseFloat(mUnit) == 3959 ? finaldistance * 0.621371 : finaldistance

                finaldistance = parseFloat(finaldistance)
                logger.debug("=final distance", finaldistance);
                //get base and km charge fromm cbl_user_category
                if (!vehicle_id) {
                    return cb(null)
                }
                let delivery_charges_for_categories = await Execute.QueryAgent(agentConnection,
                    "select base_delivery_charge,delivery_charge_per_km from cbl_user_categories where id=?", [vehicle_id]);
                // let base_charge_per_km = await Execute.QueryAgent(agentConnection, "select delivery_charge_per_km from cbl_user_categories where id=?", [id]);

                //logger.debug("==deliveryChar24525252322=>>", delivery_charges_for_categories.delivery_charge_per_km,delivery_charges_for_categories[0].delivery_charge_per_km);

                //logger.debug("===base_charge and perkm111=>>", typeof base_charge, base_charge, typeof base_charge_per_km, base_charge_per_km);


                let deliveryCharge = 0;

                //calculating delivery charge according to base fare and km/ charge
                if (delivery_charges_for_categories != undefined) {
                    deliveryCharge = (delivery_charges_for_categories[0].delivery_charge_per_km * finaldistance) + delivery_charges_for_categories[0].base_delivery_charge;
                } else {
                    deliveryCharge = 0;
                }
                console.log("==deliveryCharge2222222222=>>", deliveryCharge);

                //update net amount with delivery charge
                await Execute.Query(req.dbName, `update orders set net_amount = net_amount + ` + deliveryCharge + `,delivery_charges=` + deliveryCharge + ` where id = ?`, [orderId])

                cb(null);
            } else {
                cb(null)
            }


        }],


        orderInformation: ['calculateDeliveryChargeAccToVehicleType', async function (callback) {
            if ((enable_base_delivery_charge_on_vehicle_cat && enable_base_delivery_charge_on_vehicle_cat.length > 0) || (isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0)) {
                logger.debug("========$$$$$$$$$=%%%%%%%%%%%%%1111111111111%%%%%==============")
                let selectGroupSql = isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0 ? ",ors.grouping_id," : ","
                let clause = "ors.id IN (" + orderId + ")"
                if (isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0) {
                    let cartData = await Execute.Query(req.dbName, "select cart_id from orders where id=?", [orderId])
                    _cartId = cartData && cartData.length > 0 ? cartData[0].cart_id : 0;
                    clause = "ors.cart_id IN (" + _cartId + ")"
                }
                var select_query = "select IFNULL(ors.agent_verification_code,0) as agent_verification_code,ors.wallet_discount_amount,ors.supplier_branch_id, usr.email as customer_email,IFNULL(CONCAT(usr.firstname,usr.lastname),'') AS customer_name,IFNULL(ors.pres_description,'') AS pres_description,ors.have_coin_change,ors.buffer_time, " +
                    " ors.no_touch_delivery,ors.drop_off_date_utc,ors.drop_off_date,sp.id as supplier_id,sp.latitude as supplier_latitude,sp.longitude as supplier_longitude,ors.user_service_charge,sp.name as supplier_name,ors.created_on,ors.schedule_date as delivery_date,ors.schedule_date as delivered_on,usr.mobile_no as customer_phone_number,usr.user_image as customer_image ,CAST(usr.id as CHAR(50)) as customer_id," +
                    " spb.name as supplier_branch_name,spb.address as supplier_branch_address,spb.latitude as supplier_branch_latitude,spb.longitude as supplier_branch_longitude,ors.promo_discount,ors.promo_code,ors.payment_type,IFNULL(ors.comment, '') as comment,ors.remarks,ors.urgent_price," +
                    " ors.urgent,ors.tip_agent " + selectGroupSql + " ors.net_amount,ors.delivery_charges,ors.handling_supplier," +
                    " ors.handling_admin,CAST(ors.id AS CHAR) as order_id " +
                    " from orders ors join order_prices op on op.order_id=ors.id join supplier inner join" +
                    " supplier_branch spb on spb.id=op.supplier_branch_id inner join supplier sp " +
                    " on sp.id=spb.supplier_id inner join user usr on usr.id=ors.user_id where " + clause + " group by ors.id"
                let data = await Execute.Query(req.dbName, select_query, []);

                logger.debug("========$$$$$$$$$=%%%%%%%%%%%%%1111111111111%%%%%==============", data)

                if (data && data.length > 0) {
                    agentOrderDetail = data;

                }
                else {
                    agentOrderDetail = []
                }
                callback(null)
            } else {
                callback(null);
            }

        }],

        deliveryAddress: ["orderInformation", async function (callback) {

            if ((enable_base_delivery_charge_on_vehicle_cat && enable_base_delivery_charge_on_vehicle_cat.length > 0) || (isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0)) {
                let clause = "ors.id IN (" + orderId + ")"
                if (isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0) {
                    let cartData = await Execute.Query(req.dbName, "select cart_id from orders where id=?", [orderId])
                    _cartId = cartData && cartData.length > 0 ? cartData[0].cart_id : 0;
                    clause = "ors.cart_id IN (" + _cartId + ")"
                }

                var select_query = "select ors.id as order_id,usr.latitude,usr.longitude,usr.address_line_1,usr.address_line_2,usr.pincode,usr.city,usr.landmark, " +
                    " usr.reference_address,IFNULL(usr.name,'') as name,IFNULL(usr.phone_number,'') AS phone_number ,usr.directions_for_delivery,usr.address_link,usr.customer_address from orders ors left join user_address usr on usr.id=ors.user_delivery_address where " + clause + ""
                let deliveryData = await Execute.Query(req.dbName, select_query, []);
                logger.debug("=================in deliveryAddress-==============", agentOrderDetail, deliveryData)
                if (agentOrderDetail && agentOrderDetail.length > 0) {

                    let branchData = await Execute.Query(req.dbName, `SELECT COUNT(DISTINCT(supplier_branch_id)) as branchCount 
                   FROM order_prices where order_id IN(?)`,
                        [orderId]);
                    for (var j = 0; j < agentOrderDetail.length; j++) {
                        // agentOrderDetail[j].adds_on=adds_on_arr
                        // agentOrderDetail[j].duration=duration;
                        // agentOrderDetail[j].have_multiple_branch=branchData && branchData.length>0?branchData[0].branchCount:0
                        if (deliveryData && deliveryData.length > 0) {
                            for (var i = 0; i < deliveryData.length; i++) {
                                if (parseInt(deliveryData[i].order_id) == parseInt(agentOrderDetail[j].order_id)) {
                                    console.log("============ deliveryData[i].phone_number ==========", deliveryData[i].phone_number);
                                    deliveryData[i].type = 0;
                                    deliveryData[i].phone_number = deliveryData[i].phone_number === null ? "" : deliveryData[i].phone_number
                                    agentOrderDetail[j].address = deliveryData[i]

                                }
                            }
                        }
                        else {
                            agentOrderDetail[j].address = {}
                        }
                        if (j == (agentOrderDetail.length - 1)) {
                            callback(null)
                        }
                    }
                }
                else {
                    callback(null)
                }
            } else {
                callback(null)
            }
        }],
        orderItemData: ['deliveryAddress', async function (callback) {
            if ((enable_base_delivery_charge_on_vehicle_cat && enable_base_delivery_charge_on_vehicle_cat.length > 0) || (isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0)) {
                let clause = "op.order_id IN (" + orderId + ")"
                if (isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0) {
                    let cartData = await Execute.Query(req.dbName, "select cart_id from orders where id=?", [orderId])
                    _cartId = cartData && cartData.length > 0 ? cartData[0].cart_id : 0;
                    clause = "o.cart_id IN (" + _cartId + ")"
                }

                let select_query = "select spb.name as supplier_branch_name,spb.address as supplier_branch_address,spb.latitude,spb.longitude,op.is_liquor,op.handling_admin,op.id as order_price_id,op.order_id,op.quantity,op.price,op.product_id as item_id,op.product_name as item_name, " +
                    " op.product_reference_id,op.product_dimensions,op.product_upload_reciept,op.product_owner_name,op.product_desc as item_desc,op.product_name as item_name,op.image_path from order_prices op left join supplier_branch spb on spb.id=op.supplier_branch_id join orders o on o.id=op.order_id where " + clause + ""
                let orderItemData = await Execute.Query(req.dbName, select_query, [orderId])

                var items = []
                if (agentOrderDetail && agentOrderDetail.length > 0) {
                    for (var j = 0; j < agentOrderDetail.length; j++) {

                        if (orderItemData && orderItemData.length > 0) {
                            for (var i = 0; i < orderItemData.length; i++) {
                                if (parseInt(orderItemData[i].order_id) == parseInt(agentOrderDetail[j].order_id)) {
                                    items.push(orderItemData[i])
                                    agentOrderDetail[j].items = items
                                }
                                if (i == (orderItemData.length - 1)) {
                                    items = []
                                }
                            }
                        }
                        else {
                            agentOrderDetail[j].items = []
                        }
                        if (j == (agentOrderDetail.length - 1)) {
                            callback(null)
                        }
                    }
                }
                else {
                    callback(null)
                }

                //     }
                // })
            } else {
                callback(null);
            }



        }],

        addOrderToAgent: ['orderItemData', async function (callback) {

            if (enable_base_delivery_charge_on_vehicle_cat && enable_base_delivery_charge_on_vehicle_cat.length > 0) {
                agentOrderDetail["vehicleTypeId"] = vehicle_id
                try {
                    var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                    var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                    var api_key = await agent.KeyData(agentConnection, config.get("agent.api_key"));
                    var secret_key = await agent.KeyData(agentConnection, config.get("agent.db_secret_key"));
                    for (const [index, i] of agentOrderDetail.entries()) {

                        await agent.AssignOrderToAgentByLocation(i, api_key, secret_key)

                        if (index == (agentOrderDetail.length - 1)) {
                            logger.debug("=======77777777777777777%%%==============")

                            callback(null)
                        }
                    }
                }
                catch (err) {
                    logger.debug("========err9=%%%%%%%%%%%%%%%%%%==============", err)
                    callback(err)
                }
            } else {
                callback(null);
            }
        }],

        pendingOrder: ['blankField', 'authenticate', 'checkauthority', 'checkOrderStatus',
            'calculateDeliveryChargeAccToVehicleType', 'orderInformation', 'deliveryAddress', 'orderItemData', 'addOrderToAgent', function (cb) {

                // logger.debug("==333333333333333333=>>",deliveryCharge);

                orderFunction.confirmPendingOrder(req.dbName, res, orderId, status, reject_reasons, offset, preparation_time, delivery_date_time, function (err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        cb(null);
                    }
                })

            }],
        refundAmount: ['pendingOrder', async function (cb) {
            let orderDetail = await Execute.Query(req.dbName, `select id,schedule_date from orders where id=?`, [orderId]);
            let scheduleDateTime = moment(orderDetail[0].schedule_date).format("YYYY-MM-DD HH:mm:ss");
            let timingArray = preparation_time.split(":")
            let seconds = (+timingArray[0]) * 60 * 60 + (+timingArray[1]) * 60 + (+timingArray[2]);
            let scDate = moment(scheduleDateTime)
                .add(seconds, 'seconds').format("YYYY-MM-DD HH:mm:ss");
            logger.debug("=====seconds=dateTime======dateT===>>", seconds, scheduleDateTime, scDate);
            if (parseInt(req.service_type) == 1) {
                await Execute.Query(req.dbName, `update orders set schedule_date=? where id=?`, [scDate, orderId]);
            }
            if (status == "2") {
                await orderFunction.refund_stripe_payments(req.dbName, res, req, orderId);
            }
            cb(null);
        }],
        //notificationData: ['pendingOrder', function (cb) {
        notificationData: ['refundAmount', function (cb) {


            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {


                    deviceToken = values.device_token;
                    req.category_id = values.category_id;
                    userId = values.user_id;
                    self_pickup = values.self_pickup
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    cartId = values.cart_id;
                    userName = values.userName;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;
                    net_amount = values.net_amount;
                    user_delivery_address = values.user_delivery_address;
                    ordersPrice = values.order_prices;
                    created_on = (req.dbName == '4n1deliverylive_0755') ? moment(values.created_on).format('MM/DD/YYYY  hh:mm:ss a') : moment(values.created_on).format('YYYY-MM-DD HH:mm a');
                    schedule_date = (req.dbName == '4n1deliverylive_0755') ? moment(values.schedule_date).format('MM/DD/YYYY hh:mm:ss a') : moment(values.schedule_date).format('YYYY-MM-DD HH:mm a');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],

        updateReferToUser: ['notificationData', async function (cb) {
            try {
                let userData = await Execute.Query(req.dbName, `select id,user_id from orders where user_id=? and status=?`, [userId, 5])
                if (userData && userData.length > 0) {
                    cb(null)
                }
                else {
                    await Execute.Query(req.dbName, `update user_referral set ready_for_use=? where to_id=?`, [1, userId]);
                    cb(null)
                }
            } catch (e) {
                cb(null)
            }
        }],
        sendPushNotification: ['updateReferToUser', async function (cb) {
            let languageData = await Execute.Query(req.dbName, `SELECT language_code FROM language where id=?`, [parseInt(notificationLanguage)]);
            userLanguage = languageData && languageData.length > 0 ? languageData[0].language_code : userLanguage;
            req.userLanguage = userLanguage;

            let new_email_template_v12 = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=? and value=1 ", ["new_email_template_v12"]);
            if (status == 1) {
                let clientLanguage = await Universal.getClientLanguage(req.dbName);
                if (clientLanguage && clientLanguage.length > 0) {
                    notificationLanguage = 16
                }
                if (notificationStatus == 0) {
                    return cb(null);
                }
                else {
                    var data = {
                        "status": status,
                        "message": new_email_template_v12.length <= 0 ? await Universal.getMsgText(notificationLanguage, req, status) : "Vendor has accepted the order",
                        "orderId": orderId,
                        "self_pickup": self_pickup
                    }
                    pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                        console.log(".........errrrrrr.......", err, result);
                        if (err) {
                            console.log("err2", err);
                            cb(null)
                        }
                        else {
                            //console.log("push sent");
                            cb(null);
                        }
                    });

                }
            }
            else {
                if (notificationStatus == 0) {
                    return cb(null);
                }
                else {

                    if (deviceType == 0) {
                        var data = {
                            "status": status,
                            "message": await Universal.getMsgText(notificationLanguage, req, status),
                            "orderId": orderId,
                            "self_pickup": self_pickup
                        }

                        pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                            console.log(".........errrrrrr.......", err, result);
                            if (err) {
                                console.log("err2", err);
                                cb(null)
                            }
                            else {
                                //console.log("push sent");
                                cb(null);
                            }
                        });
                    }
                    else {
                        var path = "user";
                        var sound = "ping.aiff";
                        var data = {
                            "status": status,
                            "message": await Universal.getMsgText(notificationLanguage, req, status),
                            "orderId": orderId,
                            "self_pickup": self_pickup
                        }
                        // pushNotifications.sendIosPushNotification(deviceToken,data,path,sound,function (err, result) {
                        pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                            console.log(".........errrrrrr.......", err, result);
                            if (err) {
                                console.log("err2", err);
                                cb(null)
                            }
                            else {
                                //console.log("push sent");
                                cb(null);
                            }
                        });
                    }
                }
            }
        }],
        sendUserAgentNotification: ['sendPushNotification', async function (cb) {

            if (isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0) {
                let getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                let agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                let api_key = await agent.KeyData(agentConnection, config.get("agent.api_key"));
                let secret_key = await agent.KeyData(agentConnection, config.get("agent.db_secret_key"));

                console.log("=agentOrderDetail==>", agentOrderDetail)
                let totalOrderInCart = await Execute.Query(req.dbName, "select ors.id from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=? ", [cartId]);
                let totalOrderInCartWithStatusChange = await Execute.Query(req.dbName, "select ors.id from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=? and (ors.status=1 or ors.status=2 or ors.status=8)", [cartId]);

                if (totalOrderInCart.length == totalOrderInCartWithStatusChange.length) {
                    await agent.AssignOrderToAgentByLocationV1({ "ordersJson": agentOrderDetail }, api_key, secret_key)
                }
                // else{
                //     agentOrderDetail[0].notify=0;
                //     await agent.AssignMultipleOrderToAgentByLocation(agentOrderDetail[0],api_key,secret_key)
                // }
                cb(null)
            }
            else {
                var date1 = moment().utcOffset(offset);
                var progress_date = date1._d
                console.log("........Progress.DAte......", progress_date);
                var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                var sqlQuery = "select cbl_user_orders.*,cbl_user.device_token from cbl_user_orders join cbl_user on cbl_user.id=cbl_user_orders.user_id where order_id=?";
                var user_order_data = await Execute.QueryAgent(agentConnection, sqlQuery, [orderId]);
                if (user_order_data && user_order_data.length > 0) {
                    user_order_data[0].current_date_time = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");
                }
                var data = {
                    type: "OrderInProgress",
                    message: await Universal.getMsgText(notificationLanguage, req, status),
                    data: user_order_data && user_order_data.length > 0 ? user_order_data[0] : {},
                    items: []
                };
                var agent_token = user_order_data && user_order_data.length > 0 ? user_order_data[0].device_token : ""
                logger.debug("==Not:DATA!=agent_token=", data, agent_token);
                await pushNotifications.sendFcmPushNotificationToAgent(req.dbName, agent_token, data);
                cb(null)
            }
        }],
        sendMail: ['sendUserAgentNotification', async function (cb) {

            if (status == 1) {
                let sql = 'select o.self_pickup, o.handling_admin,  CONCAT(ua.country_code,ua.phone_number) as phoneNumber,  ua.name as customer_name,  CONCAT( ua.address_line_1,", ",ua.customer_address) as customer_address ,  o.self_pickup,  o.delivery_charges, o.promo_discount,o.status, o.net_amount, p.id,op.price,p.bar_code,op.quantity,p.measuring_unit,p.name,pi.image_path from order_prices op join product p on ' +
                    'op.product_id =p.id join product_image pi on pi.product_id =p.id join  orders o on o.id = op.order_id left join user_address ua on ua.id=o.user_delivery_address where op.order_id = ?  group by pi.product_id '
                let result = await Execute.Query(req.dbName, sql, [orderId])
                let orderDetails = result;
                let clientLanguage = await Universal.getClientLanguage(req.dbName);
                if (clientLanguage && clientLanguage.length > 0) {
                    notificationLanguage = 16
                }
                emailTemp.acceptOrder(self_pickup, req, req.dbName, res, '', userName, net_amount, created_on, schedule_date, orderId, supplierName, supplierName, payment_type, userEmailId, notificationLanguage, orderDetails, function (err, result) {
                    if (err) {
                        console.log("..****fb register email*****....", err);
                    }
                })

            }
            else {
                let clientLanguage = await Universal.getClientLanguage(req.dbName);
                if (clientLanguage && clientLanguage.length > 0) {
                    notificationLanguage = 16
                }
                emailTemp.orderRejections(self_pickup, req, req.dbName, res, '', userName, net_amount, created_on, schedule_date, orderId, supplierName, supplierName, payment_type, userEmailId, notificationLanguage, reject_reasons, function (err, result) {
                    if (err) {
                        console.log("..****rejection email*****....", err);
                    }
                })
            }
            cb(null)
        }],
        changeAgentOrderStatus: ['sendMail', async function (cb) {
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "update cbl_user_orders set status=? where order_id=?";
            agentConnection.query(sqlQuery, [status, orderId], async function (err, agentData) {
                logger.debug("===============adminOrder===agent connection======1===", err)
                if (err) {
                    logger.debug("===============adminOrder===agent connection======2===", err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null)
                }
            });
        }],
        shipStationOrderAdding: ['changeAgentOrderStatus', async function (cb) {
            try {
                let shipStationData = await Universal.getShippingData(req.dbName);
                let is_decimal_quantity_allowed_val = await Universal.is_decimal_quantity_allowed(req.dbName)
                var is_decimal_quantity_allowed = "0";
                if (is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value) {
                    is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
                }
                logger.debug("=====shipStationData===>>", shipStationData);
                // Object.keys(shipStationData).length>0 
                if (Object.keys(shipStationData).length > 0) {
                    let user_address_data = await Execute.Query(req.dbName, "select * from user_address where id=?", [user_delivery_address]);
                    let orderData = {
                        "orderNumber": "JUSTCBD-" + orderId,
                        "orderDate": created_on,
                        "orderStatus": "awaiting_shipment",
                        "customerId": userId,
                        "customerUsername": userName,
                        "customerEmail": userEmailId,
                        "billTo": {
                            "name": userName
                        },
                        "shipTo": {
                            "name": userName,
                            "street1": user_address_data && user_address_data.length > 0 ? user_address_data[0].address_line_1 : "",
                            "street2": user_address_data && user_address_data.length > 0 ? user_address_data[0].customer_address : "",
                            "phone": user_address_data && user_address_data.length > 0 ? user_address_data[0].phone_number : "",
                            "postalCode": user_address_data && user_address_data.length > 0 ? user_address_data[0].pincode : "",
                            "city": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "state": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "country": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "residential": false
                        },
                        "items": [
                        ],
                        "amountPaid": parseFloat(net_amount),
                        "customerNotes": "Please ship as soon as possible!",
                        "paymentMethod": payment_type
                    }
                    if (ordersPrice && ordersPrice.length > 0) {
                        for (const [index, i] of ordersPrice.entries()) {
                            var i_quantity = parseInt(i.quantity);
                            if (is_decimal_quantity_allowed == "1") {
                                i_quantity = parseFloat(i.quantity);
                            }
                            orderData.items.push(
                                {

                                    "name": i.product_name,
                                    "imageUrl": i.image_path,
                                    "quantity": i_quantity,
                                    "unitPrice": parseFloat(i.price),
                                    "taxAmount": parseFloat(i.handling_admin),
                                    "warehouseLocation": i.supplier_address,
                                    "productId": i.product_id
                                }
                            )
                        }
                    }
                    await Universal.addOrderInShipStation(shipStationData, orderData);
                    cb(null)
                }
                else {
                    cb(null)
                }

            }
            catch (Err) {
                logger.debug("====ShipStattionError==", Err)
                cb(null)
            }
        }],
        dhLOrderAdding: ['changeAgentOrderStatus', async function (cb) {
            try {
                let shipStationData = await Universal.getShippingData(req.dbName);
                let is_decimal_quantity_allowed_val = await Universal.is_decimal_quantity_allowed(req.dbName)
                var is_decimal_quantity_allowed = "0";
                if (is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value) {
                    is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
                }
                logger.debug("=====shipStationData===>>", shipStationData);
                // Object.keys(shipStationData).length>0 
                if (Object.keys(shipStationData).length > 0) {

                    let user_address_data = await Execute.Query(req.dbName, "select * from user_address where id=?", [user_delivery_address]);

                    let orderData = {
                        "orderNumber": "ORDER-" + orderId,
                        "orderDate": created_on,
                        "orderStatus": "awaiting_shipment",
                        "customerId": userId,
                        "customerUsername": userName,
                        "customerEmail": userEmailId,
                        "billTo": {
                            "name": userName
                        },
                        "shipTo": {
                            "name": userName,
                            "street1": user_address_data && user_address_data.length > 0 ? user_address_data[0].address_line_1 : "",
                            "street2": user_address_data && user_address_data.length > 0 ? user_address_data[0].customer_address : "",
                            "phone": user_address_data && user_address_data.length > 0 ? user_address_data[0].phone_number : "",
                            "postalCode": user_address_data && user_address_data.length > 0 ? user_address_data[0].pincode : "",
                            "city": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "state": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "country": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "residential": false
                        },
                        "items": [
                        ],
                        "amountPaid": parseFloat(net_amount),
                        "customerNotes": "Please ship as soon as possible!",
                        "paymentMethod": payment_type
                    }

                    if (ordersPrice && ordersPrice.length > 0) {
                        for (const [index, i] of ordersPrice.entries()) {
                            var i_quantity = parseInt(i.quantity);
                            if (is_decimal_quantity_allowed == "1") {
                                i_quantity = parseFloat(i.quantity);
                            }
                            orderData.items.push(
                                {

                                    "name": i.product_name,
                                    "imageUrl": i.image_path,
                                    "quantity": i_quantity,
                                    "unitPrice": parseFloat(i.price),
                                    "taxAmount": parseFloat(i.handling_admin),
                                    "warehouseLocation": i.supplier_address,
                                    "productId": i.product_id
                                }
                            )
                        }
                    }
                    let dhlXmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
                     <req:ShipmentRequest xmlns:req="http://www.dhl.com" 
                     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                     xsi:schemaLocation="http://www.dhl.com ship-val-global-req-6.2.xsd" 
                     schemaVersion="6.2">
                        <Request>
                           <ServiceHeader>
                              <MessageTime>2020-06-01T11:28:56.000-08:00</MessageTime>
                              <MessageReference>1234567890123456789012345678901</MessageReference>
                              <SiteID>v62_zRFmsy6tjp</SiteID>
                              <Password>NLJktOE6fO</Password>
                           </ServiceHeader>
                           <MetaData>
                              <SoftwareName>3PV</SoftwareName>
                              <SoftwareVersion>6.2</SoftwareVersion>
                           </MetaData>
                        </Request>
                        <RegionCode>AP</RegionCode>
                        <LanguageCode>en</LanguageCode>
                        <PiecesEnabled>Y</PiecesEnabled>
                        <Billing>
                           <ShipperAccountNumber>951984796</ShipperAccountNumber>
                           <ShippingPaymentType>S</ShippingPaymentType>
                           <BillingAccountNumber>951984796</BillingAccountNumber>
                           <DutyPaymentType>R</DutyPaymentType>
                        </Billing>
                        <Consignee>
                           <CompanyName>National Bank of Abu Dhabi</CompanyName>
                           <AddressLine>6HH2+VG Manama, Bahrain</AddressLine>
                           <City>Manama</City>
                           <CountryCode>BH</CountryCode>
                           <CountryName>Bahrain</CountryName>
                           <Contact>
                              <PersonName>Ms Aisss White</PersonName>
                              <PhoneNumber>17328888</PhoneNumber>
                              <Email>test@dhl.com</Email>
                           </Contact>
                        </Consignee>
                        <Commodity>
                           <CommodityCode>cc</CommodityCode>
                           <CommodityName>cm</CommodityName>
                        </Commodity>
                        <Dutiable>
                           <DeclaredValue>50.50</DeclaredValue>
                           <DeclaredCurrency>BHD</DeclaredCurrency>
                           <ShipperEIN>ShipperEIN</ShipperEIN>
                        </Dutiable>
                       <ShipmentDetails>
                           <NumberOfPieces>${orderData.length}</NumberOfPieces><Pieces>`

                    let itemPieces = `
                              <Piece>
                                 <PieceID>1</PieceID>
                                 <PackageType>EE</PackageType>
                                 <Weight>0.5</Weight>
                                 <Width>30</Width>
                                 <Height>40</Height>
                                 <Depth>20</Depth>
                              </Piece>
                              <Piece>
                                 <PieceID>2</PieceID>
                                 <PackageType>EE</PackageType>
                                 <Weight>2.0</Weight>
                                 <Width>60</Width>
                                 <Height>70</Height>
                                 <Depth>50</Depth>
                              </Piece>`

                    let footerXml = `</Pieces>
                           <Weight>2.5</Weight>
                           <WeightUnit>K</WeightUnit>
                      <GlobalProductCode>N</GlobalProductCode>
                           <LocalProductCode>N</LocalProductCode>
                           <Date>2020-08-10</Date>
                           <Contents>FOR TESTING PURPOSE ONLY. PLEASE DO NOT SHIP!</Contents>
                           <DoorTo>DD</DoorTo>
                           <DimensionUnit>C</DimensionUnit>
                           <InsuredAmount>10.00</InsuredAmount>
                           <PackageType>EE</PackageType>
                           <IsDutiable>N</IsDutiable>
                           <CurrencyCode>BHD</CurrencyCode>
                        </ShipmentDetails>
                        <Shipper>
                           <ShipperID>#ORDER1</ShipperID>
                           <CompanyName>Test</CompanyName>
                           <AddressLine>6HH2+VG Manama, Bahrain</AddressLine>
                           <City>Manama</City>
                           <CountryCode>BH</CountryCode>
                           <CountryName>Bahrain</CountryName>
                           <Contact>
                              <PersonName>Ms Righ White</PersonName>
                              <PhoneNumber>17328888</PhoneNumber>
                              <Email>test@dhl.com</Email>
                           </Contact>
                        </Shipper>
                        <EProcShip>N</EProcShip>
                        <LabelImageFormat>PDF</LabelImageFormat>
                     </req:ShipmentRequest>`;
                    let finalDhlXMl = dhlXmlRequest + itemPieces + footerXml;
                    await Universal.addOrderInDhl(shipStationData, orderData);
                    cb(null)
                }
                else {
                    cb(null)
                }

            }
            catch (Err) {
                logger.debug("====ShipStattionError==", Err)
                cb(null)
            }
        }],
        savePushNotification: ['sendPushNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {

                let notification_message = await Universal.getMsgText(notificationLanguage, req, status)

                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, notification_message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, notification_message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, notification_message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId,
                            orderId, constant.pushNotificationStatus.ORDER_REJECTED,
                            notification_message, cb)
                    }
                }
            }
        }],
        sendTextMsgToUser: ['savePushNotification', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);
            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);

            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                &&
                allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null)
            }
            else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            }

            else {
                logger.debug("=============keys not found========", twiliodata);
                cb(null)
            }
        }]
    },
        function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            } else {
                data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        })
};

exports.deliveryCompanyConfirmPendingOrder = async function (req, res) {


    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var deviceToken = 0;
    let user_delivery_address = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierId = 0;
    var supplierName = 0;
    var notificationStatus;
    var notificationLanguage;
    var message;
    var userEmailId;
    var userName;
    var net_amount;
    var created_on;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    let reject_reasons = req.body.reject_reasons != undefined ? req.body.reject_reasons : "";
    var schedule_date;
    var payment_type, self_pickup = 0;
    let ordersPrice = []
    var preparation_time = req.body.preparation_time != undefined ? req.body.preparation_time : "00:00:00"
    var delivery_date_time = req.body.delivery_date_time != undefined ? req.body.delivery_date_time : "00:00:00"

    let countryCode = "";
    let mobileNumber = "";


    let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=? and value=1",
        ["allowTextMsgOnStatusChange"]
    )



    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken &&
                req.body.authSectionId &&
                req.body.orderId &&
                req.body.status && req.body.delivery_company_id) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        checkOrderStatus: ['blankField', function (cb) {
            orderFunction.checkOrderStatus(req.dbName, orderId, cb, res)
        }],
        pendingOrder: ['blankField', 'checkOrderStatus', function (cb) {
            orderFunction.confirmPendingOrder(req.dbName, res, orderId, status, reject_reasons, offset, preparation_time, delivery_date_time, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })

        }],
        refundAmount: ['pendingOrder', async function (cb) {
            if (status == "2") {
                await orderFunction.refund_stripe_payments(req.dbName, res, req, orderId);
            }
            cb(null);
        }],
        //notificationData: ['pendingOrder', function (cb) {
        notificationData: ['refundAmount', function (cb) {

            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    req.category_id = values.category_id;
                    userId = values.user_id;
                    self_pickup = values.self_pickup
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    userName = values.userName;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;
                    net_amount = values.net_amount;
                    user_delivery_address = values.user_delivery_address;
                    ordersPrice = values.order_prices;
                    created_on = moment(values.created_on).format('YYYY-MM-DD HH:mm');
                    schedule_date = moment(values.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        updateReferToUser: ['notificationData', async function (cb) {
            try {
                let userData = await Execute.Query(req.dbName, `select id,user_id from orders where user_id=? and status=?`, [userId, 5])
                if (userData && userData.length > 0) {
                    cb(null)
                }
                else {
                    await Execute.Query(req.dbName, `update user_referral set ready_for_use=? where to_id=?`, [1, userId]);
                    cb(null)
                }
            } catch (e) {
                cb(null)
            }
        }],
        sendPushNotification: ['updateReferToUser', async function (cb) {
            if (status == 1) {
                let clientLanguage = await Universal.getClientLanguage(req.dbName);
                if (clientLanguage && clientLanguage.length > 0) {
                    notificationLanguage = 16
                }
                if (notificationStatus == 0) {
                    return cb(null);
                }
                else {

                    var data = {
                        "status": status,
                        "message": await Universal.getMsgText(notificationLanguage, req, status),
                        "orderId": orderId,
                        "self_pickup": self_pickup
                    }


                    pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                        console.log(".........errrrrrr.......", err, result);
                        if (err) {
                            console.log("err2", err);
                            cb(null)
                        }
                        else {
                            //console.log("push sent");
                            cb(null);
                        }
                    });

                }
            }
            else {
                if (notificationStatus == 0) {
                    return cb(null);
                }
                else {

                    if (deviceType == 0) {
                        var data = {
                            "status": status,
                            "message": await Universal.getMsgText(notificationLanguage, req, status),
                            "orderId": orderId,
                            "self_pickup": self_pickup
                        }

                        pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                            console.log(".........errrrrrr.......", err, result);
                            if (err) {
                                console.log("err2", err);
                                cb(null)
                            }
                            else {
                                //console.log("push sent");
                                cb(null);
                            }
                        });
                    }
                    else {
                        var path = "user";
                        var sound = "ping.aiff";
                        var data = {
                            "status": status,
                            "message": await Universal.getMsgText(notificationLanguage, req, status),
                            "orderId": orderId,
                            "self_pickup": self_pickup
                        }
                        // pushNotifications.sendIosPushNotification(deviceToken,data,path,sound,function (err, result) {
                        pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                            console.log(".........errrrrrr.......", err, result);
                            if (err) {
                                console.log("err2", err);
                                cb(null)
                            }
                            else {
                                //console.log("push sent");
                                cb(null);
                            }
                        });
                    }
                }
            }
        }],
        sendUserAgentNotification: ['sendPushNotification', async function (cb) {
            var date1 = moment().utcOffset(offset);
            var progress_date = date1._d
            console.log("........Progress.DAte......", progress_date);
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "select cbl_user_orders.*,cbl_user.device_token from cbl_user_orders join cbl_user on cbl_user.id=cbl_user_orders.user_id where order_id=?";
            var user_order_data = await Execute.QueryAgent(agentConnection, sqlQuery, [orderId]);
            if (user_order_data && user_order_data.length > 0) {
                user_order_data[0].current_date_time = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");
            }
            var data = {
                type: "OrderInProgress",
                message: await Universal.getMsgText(notificationLanguage, req, status),
                data: user_order_data && user_order_data.length > 0 ? user_order_data[0] : {},
                items: []
            };
            var agent_token = user_order_data && user_order_data.length > 0 ? user_order_data[0].device_token : ""
            logger.debug("==Not:DATA!=agent_token=", data, agent_token);
            await pushNotifications.sendFcmPushNotificationToAgent(req.dbName, agent_token, data);
            cb(null)


        }],
        sendMail: ['sendUserAgentNotification', async function (cb) {

            if (status == 1) {
                let sql = 'select o.self_pickup, o.handling_admin,  CONCAT(ua.country_code,ua.phone_number) as phoneNumber,  ua.name as customer_name,  CONCAT( ua.address_line_1,", ",ua.customer_address) as customer_address ,  o.self_pickup,  o.delivery_charges, o.promo_discount,o.status, o.net_amount, p.id,op.price,p.bar_code,op.quantity,p.measuring_unit,p.name,pi.image_path from order_prices op join product p on ' +
                    'op.product_id =p.id join product_image pi on pi.product_id =p.id join  orders o on o.id = op.order_id left join user_address ua on ua.id=o.user_delivery_address where op.order_id = ?  group by pi.product_id '
                let result = await Execute.Query(req.dbName, sql, [orderId])
                let orderDetails = result;
                let clientLanguage = await Universal.getClientLanguage(req.dbName);
                if (clientLanguage && clientLanguage.length > 0) {
                    notificationLanguage = 16
                }
                emailTemp.acceptOrder(self_pickup, req, req.dbName, res, '', userName, net_amount, created_on, schedule_date, orderId, supplierName, supplierName, payment_type, userEmailId, notificationLanguage, orderDetails, function (err, result) {
                    if (err) {
                        console.log("..****fb register email*****....", err);
                    }
                })

            }
            else {
                let clientLanguage = await Universal.getClientLanguage(req.dbName);
                if (clientLanguage && clientLanguage.length > 0) {
                    notificationLanguage = 16
                }
                emailTemp.orderRejections(req, req.dbName, res, '', userName, net_amount, created_on, schedule_date, orderId, supplierName, supplierName, payment_type, userEmailId, notificationLanguage, function (err, result) {
                    if (err) {
                        console.log("..****rejection email*****....", err);
                    }
                })
            }
            cb(null)
        }],
        changeAgentOrderStatus: ['sendMail', async function (cb) {
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "update cbl_user_orders set status=? where order_id=?";
            agentConnection.query(sqlQuery, [status, orderId], async function (err, agentData) {
                logger.debug("===============adminOrder===agent connection======1===", err)
                if (err) {
                    logger.debug("===============adminOrder===agent connection======2===", err)
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null)
                }
            });
        }],
        shipStationOrderAdding: ['changeAgentOrderStatus', async function (cb) {
            try {
                let shipStationData = await Universal.getShippingData(req.dbName);
                let is_decimal_quantity_allowed_val = await Universal.is_decimal_quantity_allowed(req.dbName)
                var is_decimal_quantity_allowed = "0";
                if (is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value) {
                    is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
                }
                logger.debug("=====shipStationData===>>", shipStationData);
                // Object.keys(shipStationData).length>0 
                if (Object.keys(shipStationData).length > 0) {
                    let user_address_data = await Execute.Query(req.dbName, "select * from user_address where id=?", [user_delivery_address]);
                    let orderData = {
                        "orderNumber": "JUSTCBD-" + orderId,
                        "orderDate": created_on,
                        "orderStatus": "awaiting_shipment",
                        "customerId": userId,
                        "customerUsername": userName,
                        "customerEmail": userEmailId,
                        "billTo": {
                            "name": userName
                        },
                        "shipTo": {
                            "name": userName,
                            "street1": user_address_data && user_address_data.length > 0 ? user_address_data[0].address_line_1 : "",
                            "street2": user_address_data && user_address_data.length > 0 ? user_address_data[0].customer_address : "",
                            "phone": user_address_data && user_address_data.length > 0 ? user_address_data[0].phone_number : "",
                            "postalCode": user_address_data && user_address_data.length > 0 ? user_address_data[0].pincode : "",
                            "city": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "state": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "country": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "residential": false
                        },
                        "items": [
                        ],
                        "amountPaid": parseFloat(net_amount),
                        "customerNotes": "Please ship as soon as possible!",
                        "paymentMethod": payment_type
                    }
                    if (ordersPrice && ordersPrice.length > 0) {
                        for (const [index, i] of ordersPrice.entries()) {
                            var i_quantity = parseInt(i.quantity);
                            if (is_decimal_quantity_allowed == "1") {
                                i_quantity = parseFloat(i.quantity);
                            }
                            orderData.items.push(
                                {

                                    "name": i.product_name,
                                    "imageUrl": i.image_path,
                                    "quantity": i_quantity,
                                    "unitPrice": parseFloat(i.price),
                                    "taxAmount": parseFloat(i.handling_admin),
                                    "warehouseLocation": i.supplier_address,
                                    "productId": i.product_id
                                }
                            )
                        }
                    }
                    await Universal.addOrderInShipStation(shipStationData, orderData);
                    cb(null)
                }
                else {
                    cb(null)
                }

            }
            catch (Err) {
                logger.debug("====ShipStattionError==", Err)
                cb(null)
            }
        }],
        dhLOrderAdding: ['changeAgentOrderStatus', async function (cb) {
            try {
                let shipStationData = await Universal.getShippingData(req.dbName);
                let is_decimal_quantity_allowed_val = await Universal.is_decimal_quantity_allowed(req.dbName)
                var is_decimal_quantity_allowed = "0";
                if (is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value) {
                    is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
                }
                logger.debug("=====shipStationData===>>", shipStationData);
                // Object.keys(shipStationData).length>0 
                if (Object.keys(shipStationData).length > 0) {

                    let user_address_data = await Execute.Query(req.dbName, "select * from user_address where id=?", [user_delivery_address]);

                    let orderData = {
                        "orderNumber": "ORDER-" + orderId,
                        "orderDate": created_on,
                        "orderStatus": "awaiting_shipment",
                        "customerId": userId,
                        "customerUsername": userName,
                        "customerEmail": userEmailId,
                        "billTo": {
                            "name": userName
                        },
                        "shipTo": {
                            "name": userName,
                            "street1": user_address_data && user_address_data.length > 0 ? user_address_data[0].address_line_1 : "",
                            "street2": user_address_data && user_address_data.length > 0 ? user_address_data[0].customer_address : "",
                            "phone": user_address_data && user_address_data.length > 0 ? user_address_data[0].phone_number : "",
                            "postalCode": user_address_data && user_address_data.length > 0 ? user_address_data[0].pincode : "",
                            "city": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "state": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "country": user_address_data && user_address_data.length > 0 ? user_address_data[0].city : "",
                            "residential": false
                        },
                        "items": [
                        ],
                        "amountPaid": parseFloat(net_amount),
                        "customerNotes": "Please ship as soon as possible!",
                        "paymentMethod": payment_type
                    }

                    if (ordersPrice && ordersPrice.length > 0) {
                        for (const [index, i] of ordersPrice.entries()) {
                            var i_quantity = parseInt(i.quantity);
                            if (is_decimal_quantity_allowed == "1") {
                                i_quantity = parseFloat(i.quantity);
                            }
                            orderData.items.push(
                                {

                                    "name": i.product_name,
                                    "imageUrl": i.image_path,
                                    "quantity": i_quantity,
                                    "unitPrice": parseFloat(i.price),
                                    "taxAmount": parseFloat(i.handling_admin),
                                    "warehouseLocation": i.supplier_address,
                                    "productId": i.product_id
                                }
                            )
                        }
                    }
                    let dhlXmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
                     <req:ShipmentRequest xmlns:req="http://www.dhl.com" 
                     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                     xsi:schemaLocation="http://www.dhl.com ship-val-global-req-6.2.xsd" 
                     schemaVersion="6.2">
                        <Request>
                           <ServiceHeader>
                              <MessageTime>2020-06-01T11:28:56.000-08:00</MessageTime>
                              <MessageReference>1234567890123456789012345678901</MessageReference>
                              <SiteID>v62_zRFmsy6tjp</SiteID>
                              <Password>NLJktOE6fO</Password>
                           </ServiceHeader>
                           <MetaData>
                              <SoftwareName>3PV</SoftwareName>
                              <SoftwareVersion>6.2</SoftwareVersion>
                           </MetaData>
                        </Request>
                        <RegionCode>AP</RegionCode>
                        <LanguageCode>en</LanguageCode>
                        <PiecesEnabled>Y</PiecesEnabled>
                        <Billing>
                           <ShipperAccountNumber>951984796</ShipperAccountNumber>
                           <ShippingPaymentType>S</ShippingPaymentType>
                           <BillingAccountNumber>951984796</BillingAccountNumber>
                           <DutyPaymentType>R</DutyPaymentType>
                        </Billing>
                        <Consignee>
                           <CompanyName>National Bank of Abu Dhabi</CompanyName>
                           <AddressLine>6HH2+VG Manama, Bahrain</AddressLine>
                           <City>Manama</City>
                           <CountryCode>BH</CountryCode>
                           <CountryName>Bahrain</CountryName>
                           <Contact>
                              <PersonName>Ms Aisss White</PersonName>
                              <PhoneNumber>17328888</PhoneNumber>
                              <Email>test@dhl.com</Email>
                           </Contact>
                        </Consignee>
                        <Commodity>
                           <CommodityCode>cc</CommodityCode>
                           <CommodityName>cm</CommodityName>
                        </Commodity>
                        <Dutiable>
                           <DeclaredValue>50.50</DeclaredValue>
                           <DeclaredCurrency>BHD</DeclaredCurrency>
                           <ShipperEIN>ShipperEIN</ShipperEIN>
                        </Dutiable>
                       <ShipmentDetails>
                           <NumberOfPieces>${orderData.length}</NumberOfPieces><Pieces>`

                    let itemPieces = `
                              <Piece>
                                 <PieceID>1</PieceID>
                                 <PackageType>EE</PackageType>
                                 <Weight>0.5</Weight>
                                 <Width>30</Width>
                                 <Height>40</Height>
                                 <Depth>20</Depth>
                              </Piece>
                              <Piece>
                                 <PieceID>2</PieceID>
                                 <PackageType>EE</PackageType>
                                 <Weight>2.0</Weight>
                                 <Width>60</Width>
                                 <Height>70</Height>
                                 <Depth>50</Depth>
                              </Piece>`

                    let footerXml = `</Pieces>
                           <Weight>2.5</Weight>
                           <WeightUnit>K</WeightUnit>
                      <GlobalProductCode>N</GlobalProductCode>
                           <LocalProductCode>N</LocalProductCode>
                           <Date>2020-08-10</Date>
                           <Contents>FOR TESTING PURPOSE ONLY. PLEASE DO NOT SHIP!</Contents>
                           <DoorTo>DD</DoorTo>
                           <DimensionUnit>C</DimensionUnit>
                           <InsuredAmount>10.00</InsuredAmount>
                           <PackageType>EE</PackageType>
                           <IsDutiable>N</IsDutiable>
                           <CurrencyCode>BHD</CurrencyCode>
                        </ShipmentDetails>
                        <Shipper>
                           <ShipperID>#ORDER1</ShipperID>
                           <CompanyName>Test</CompanyName>
                           <AddressLine>6HH2+VG Manama, Bahrain</AddressLine>
                           <City>Manama</City>
                           <CountryCode>BH</CountryCode>
                           <CountryName>Bahrain</CountryName>
                           <Contact>
                              <PersonName>Ms Righ White</PersonName>
                              <PhoneNumber>17328888</PhoneNumber>
                              <Email>test@dhl.com</Email>
                           </Contact>
                        </Shipper>
                        <EProcShip>N</EProcShip>
                        <LabelImageFormat>PDF</LabelImageFormat>
                     </req:ShipmentRequest>`;
                    let finalDhlXMl = dhlXmlRequest + itemPieces + footerXml;
                    await Universal.addOrderInDhl(shipStationData, orderData);
                    cb(null)
                }
                else {
                    cb(null)
                }

            }
            catch (Err) {
                logger.debug("====ShipStattionError==", Err)
                cb(null)
            }
        }],
        savePushNotification: ['sendPushNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {

                let notification_message = await Universal.getMsgText(notificationLanguage, req, status)

                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, notification_message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, notification_message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, notification_message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId,
                            orderId, constant.pushNotificationStatus.ORDER_REJECTED,
                            notification_message, cb)
                    }
                }
            }
        }],
        sendTextMsgToUser: ['savePushNotification', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);
            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);

            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                &&
                allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null)
            }
            else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            }

            else {
                logger.debug("=============keys not found========", twiliodata);
                cb(null)
            }
        }]
    },
        function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);
            } else {
                data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        })
};

exports.orderShipped = function (req, res) {

    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    var deviceToken, userId, deviceType, supplierId,
        supplierName,
        notificationLanguage,
        notificationStatus,
        userEmailId,
        userName,
        net_amount,
        created_on,
        schedule_date, payment_type, self_pickup = 0;
    let countryCode = "";
    let mobileNumber = "";
    let userLanguage = "en"
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        },
        checkauthority: ['authenticate', function (cb) {

            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        ShippedOrder: ['checkauthority', function (cb) {
            orderFunction.orderShipped(req.dbName, res, orderId, status, offset, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }],
        notificationData: ['ShippedOrder', function (cb) {
            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    req.category_id = values.category_id;
                    userId = values.user_id;
                    self_pickup = values.self_pickup;
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    userName = values.userName;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;

                    net_amount = values.net_amount;
                    created_on = moment(values.created_on).format('YYYY-MM-DD HH:mm');
                    schedule_date = moment(values.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        sendUserPushNotification: ['notificationData', async function (cb) {
            let clientLanguage = await Universal.getClientLanguage(req.dbName);
            let languageData = await Execute.Query(req.dbName, `SELECT language_code FROM language where id=?`, [parseInt(notificationLanguage)]);
            userLanguage = languageData && languageData.length > 0 ? languageData[0].language_code : userLanguage;
            req.userLanguage = userLanguage;
            if (clientLanguage && clientLanguage.length > 0) {
                notificationLanguage = 16
            }
            if (notificationStatus == 0) {
                cb(null)
            }
            else {
                var data = {
                    "status": notificationStatus,
                    "message": await Universal.getMsgText(notificationLanguage, req, status),
                    "orderId": orderId,
                    "self_pickup": self_pickup
                }
                pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                    console.log(".........errrrrrr.......", err, result);
                    if (err) {
                        console.log("err2", err);
                        cb(null)
                    } else {
                        cb(null);
                    }
                });
            }
        }],
        changeAgentOrderStatus: ['sendUserPushNotification', function (cb) {
            var bQuery = "select is_agent,user_id from orders where id=?"
            multiConnection[req.dbName].query(bQuery, [orderId], async function (err, data) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (data && data.length > 0) {
                        var date1 = moment().utcOffset(offset);
                        var on_the_way_date = date1._d
                        console.log("........Progress.DAte......", on_the_way_date);

                        var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                        var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                        var sqlQuery = "update cbl_user_orders set status=?,shipped_on=?,progress_on=? where order_id=? and customer_id=?";
                        agentConnection.query(sqlQuery, [status, on_the_way_date, on_the_way_date, orderId, data[0].user_id], async function (err, agentData) {
                            //    console.log(err)
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {

                                let query1 = "select progress_on,reached_on from cbl_user_orders where id=?";
                                let result1 = await agentConnection.query(query1, [orderId]);
                                if (result1 && result1.length) {
                                    var update_set = []
                                    if (result1[0] && result1[0].progress_on == "0000-00-00 00:00:00") {
                                        update_set.push(' progress_on="' + on_the_way_date + '" ');
                                    }
                                    if (result1[0] && result1[0].reached_on == "0000-00-00 00:00:00") {
                                        update_set.push(' reached_on="' + on_the_way_date + '" ');
                                    }
                                    update_set.join(',')
                                    if (update_set != "") {
                                        var sql1 = 'update cbl_user_orders set ' + update_set + ' where id=? ';
                                        await agentConnection.query(sql1, [orderId]);
                                    }
                                }
                                cb(null)
                            }
                        });
                    }
                    else {
                        cb(null)
                    }
                }
            })
        }],
        sendUserAgentNotification: ['changeAgentOrderStatus', async function (cb) {
            let isEnableAgentNotifcationIn = await Universal.getKeysValue(["is_agent_order_shipped_notification"], req.dbName);
            if (isEnableAgentNotifcationIn && isEnableAgentNotifcationIn.length > 0) {
                var date1 = moment().utcOffset(offset);
                var progress_date = date1._d
                console.log("........Progress.DAte......", progress_date);
                var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                var sqlQuery = "select cbl_user_orders.*,cbl_user.device_token from cbl_user_orders join cbl_user on cbl_user.id=cbl_user_orders.user_id where order_id=?";
                var user_order_data = await Execute.QueryAgent(agentConnection, sqlQuery, [orderId]);
                if (user_order_data && user_order_data.length > 0) {
                    user_order_data[0].current_date_time = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");
                }
                var data = {
                    type: "OrderInProgress",
                    message: await Universal.getMsgText(notificationLanguage, req, status),
                    data: user_order_data && user_order_data.length > 0 ? user_order_data[0] : {},
                    items: []
                };
                var agent_token = user_order_data && user_order_data.length > 0 ? user_order_data[0].device_token : ""
                logger.debug("==Not:DATA!=agent_token=", data, agent_token);
                await pushNotifications.sendFcmPushNotificationToAgent(req.dbName, agent_token, data);
                cb(null)
            }
            else {
                cb(null)
            }
        }],
        savePushNotification: ['sendUserAgentNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                let message = await Universal.getMsgText(notificationLanguage, req, status);
                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
            }
        }],
        sendTextMsgToUser: ['savePushNotification', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);
            let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
                "select `key`,value from tbl_setting where `key`=? and value=1",
                ["allowTextMsgOnStatusChange"]
            )
            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);


            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                && allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null)
            } else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            } else {
                logger.debug("=============keys not found========", twiliodata);
                cb(null)
            }
        }]
    }, function (err, result) {

        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
};

exports.deliveryCompanyOrderShipped = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    var deviceToken, userId, deviceType, supplierId,
        supplierName,
        notificationLanguage,
        notificationStatus,
        userEmailId,
        userName,
        net_amount,
        created_on,
        schedule_date, payment_type, self_pickup = 0;
    let countryCode = "";
    let mobileNumber = "";

    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken &&
                req.body.authSectionId && req.body.orderId
                && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        /*     sendPush:['checkauthority',function(cb){
                 getDetailsUsers(orderId,function(err,result){
                     if(err){
                         console.log("err",err);
                         cb(err);
                     }else{
                         console.log("res....",result);
                         if(result[0].notification_status == 1){
                             if(result[0].device_type == 0){
                                 if(result[0].notification_language == 14){
                                     var data = {
                                         "status": "ORDER_SHIPPED",
                                         "message": "ORDER_SHIPPED",
                                      }
                                 }else{
                                     var data = {
                                         "status": "تم قبول طلبك من قبل المورد",
                                         "message": "تم قبول طلبك من قبل المورد",
                                     }
                                 }
                                 pushNotifications.sendAndroidPushNotification(result[0].device_token, data, function (err, result) {
                                     if (err) {
                                         cb(null);
                                     }
                                     else {
                                         //console.log("push sent");
                                         cb(null);
                                     }
     
                                 });
                             }else{
                                 if(result[0].notification_language == 14){
                                     var data = {
                                         "status": "ORDER_SHIPPED",
                                         "message": "ORDER_SHIPPED",
                                     }
                                 }else{
                                     var data = {
                                         "status": "تم قبول طلبك من قبل المورد",
                                         "message": "تم قبول طلبك من قبل المورد",
                                     }
                                 }
                                 var path ="user";
                                 var sound = "ping.aiff";
                                 pushNotifications.sendIosPushNotification(result[0].device_token,data,path,sound,function (err, result) {
                                     console.log(".........errrrrrr.......",err,result);
                                     if (err) {
                                         console.log("err2",err);
                                         cb(null)
                                     }
                                     else {
                                         //console.log("push sent");
                                         cb(null);
                                     }
                                 });
                             }
                         }else{
                             cb(null);
                         }
                     }
                 })
             }],*/
        ShippedOrder: ['blankField', function (cb) {
            orderFunction.orderShipped(req.dbName, res, orderId, status, offset, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }],
        notificationData: ['ShippedOrder', function (cb) {

            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    req.category_id = values.category_id;
                    userId = values.user_id;
                    self_pickup = values.self_pickup;
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    userName = values.userName;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;

                    net_amount = values.net_amount;
                    created_on = moment(values.created_on).format('YYYY-MM-DD HH:mm');
                    schedule_date = moment(values.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        sendUserPushNotification: ['notificationData', async function (cb) {
            let clientLanguage = await Universal.getClientLanguage(req.dbName);
            if (clientLanguage && clientLanguage.length > 0) {
                notificationLanguage = 16
            }
            if (notificationStatus == 0) {
                cb(null)
            }
            else {
                var data = {
                    "status": notificationStatus,
                    "message": await Universal.getMsgText(notificationLanguage, req, status),
                    "orderId": orderId,
                    "self_pickup": self_pickup
                }
                pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                    console.log(".........errrrrrr.......", err, result);
                    if (err) {
                        console.log("err2", err);
                        cb(null)
                    } else {
                        cb(null);
                    }
                });
            }

        }],
        changeAgentOrderStatus: ['sendUserPushNotification', function (cb) {
            var bQuery = "select is_agent,user_id from orders where id=?"
            multiConnection[req.dbName].query(bQuery, [orderId], async function (err, data) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (data && data.length > 0) {

                        var date1 = moment().utcOffset(offset);
                        var on_the_way_date = date1._d
                        console.log("........Progress.DAte......", on_the_way_date);

                        var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
                        var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
                        var sqlQuery = "update cbl_user_orders set status=?,shipped_on=? where order_id=? and customer_id=?";
                        agentConnection.query(sqlQuery, [status, on_the_way_date, orderId, data[0].user_id], async function (err, agentData) {
                            //    console.log(err)
                            if (err) {
                                sendResponse.somethingWentWrongError(res);
                            }
                            else {

                                let query1 = "select progress_on,reached_on from cbl_user_orders where id=?";
                                let result1 = await agentConnection.query(query1, [orderId]);
                                if (result1 && result1.length) {
                                    var update_set = []
                                    if (result1[0] && result1[0].progress_on == "0000-00-00 00:00:00") {
                                        update_set.push(' progress_on="' + on_the_way_date + '" ');
                                    }
                                    if (result1[0] && result1[0].reached_on == "0000-00-00 00:00:00") {
                                        update_set.push(' reached_on="' + on_the_way_date + '" ');
                                    }
                                    update_set.join(',')
                                    if (update_set != "") {
                                        var sql1 = 'update cbl_user_orders set ' + update_set + ' where id=? ';
                                        await agentConnection.query(sql1, [orderId]);
                                    }
                                }
                                cb(null)
                            }
                        });
                    }
                    else {
                        cb(null)
                    }
                }
            })
        }],
        savePushNotification: ['changeAgentOrderStatus', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                let message = await Universal.getMsgText(notificationLanguage, req, status);
                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
            }
        }],
        sendTextMsgToUser: ['savePushNotification', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);
            let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
                "select `key`,value from tbl_setting where `key`=? and value=1",
                ["allowTextMsgOnStatusChange"]
            )
            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);


            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                && allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null)
            } else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            } else {
                logger.debug("=============keys not found========", twiliodata);
                cb(null)
            }
        }]
    }, function (err, result) {

        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
};

exports.orderInProgress = async function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    var deviceToken, userId, deviceType, supplierId,
        supplierName,
        notificationLanguage,
        notificationStatus,
        userEmailId,
        userName,
        net_amount,
        created_on,
        schedule_date, payment_type, self_pickup = 0;
    let checkZoomEnable = await Execute.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=?", ["is_zoom_call_enabled"])
    let countryCode = "";
    let mobileNumber = "";
    let userLanguage = "en"
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        },
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        ProgressOrder: ['checkauthority', function (cb) {
            console.log("----------------in progress order-----------");

            orderFunction.orderInProgress(req.dbName, res, orderId, status, offset, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })
        }],
        changeAgentOrderStatus: ['ProgressOrder', async function (cb) {
            // var bQuery="select is_agent,user_id from orders where id=? and is_agent=?"
            // connection.query(bQuery,[orderId,1],async function(err,data){
            //     if (err) {
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else{
            //         if(data && data.length>0){
            var date1 = moment().utcOffset(offset);
            var progress_date = date1._d
            console.log("........Progress.DAte......", progress_date);
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "update cbl_user_orders set status=?,progress_on=? where order_id=?";
            agentConnection.query(sqlQuery, [status, progress_date, orderId], async function (err, agentData) {
                //    console.log(err)
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    logger.debug("========is zoom enable===1======", checkZoomEnable);

                    if (checkZoomEnable && checkZoomEnable.length) {
                        if (parseInt(checkZoomEnable[0].value) == 1) {
                            logger.debug("========is zoom enable====2=====", checkZoomEnable);
                            await createZoomCallUrl(req.dbName, orderId);
                            cb(null);
                        } else {
                            logger.debug("========is zoom enable===3======", checkZoomEnable);

                            cb(null);
                        }
                    } else {
                        logger.debug("========is zoom enable====4=====", checkZoomEnable);

                        cb(null);
                    }

                }
            })

            //         }
            //         else{
            //             cb(null)
            //         }
            //     }
            // })
        }],
        notificationData: ['changeAgentOrderStatus', function (cb) {
            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    req.category_id = values.category_id;
                    userId = values.user_id;
                    deviceType = values.device_type;
                    self_pickup = values.self_pickup
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    userName = values.userName;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;
                    net_amount = values.net_amount;
                    created_on = moment(values.created_on).format('YYYY-MM-DD HH:mm');
                    schedule_date = moment(values.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        sendUserPushNotification: ['notificationData', async function (cb) {
            let languageData = await Execute.Query(req.dbName, `SELECT language_code FROM language where id=?`, [parseInt(notificationLanguage)]);
            userLanguage = languageData && languageData.length > 0 ? languageData[0].language_code : userLanguage;
            req.userLanguage = userLanguage;

            let clientLanguage = await Universal.getClientLanguage(req.dbName);
            if (clientLanguage && clientLanguage.length > 0) {
                notificationLanguage = 16
            }
            if (notificationStatus == 0) {
                cb(null)
            }
            else {
                data = {
                    "status": status,
                    "message": await Universal.getMsgText(notificationLanguage, req, status),
                    "orderId": orderId,
                    "self_pickup": self_pickup
                }
                logger.debug("+====================data for notif=++++++", data, notificationLanguage, req.service_type, status)

                pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                    console.log(".........errrrrrr.......", err, result);
                    if (err) {
                        console.log("err2", err);
                        cb(null)
                    } else {
                        cb(null);
                    }
                });
            }

        }],
        sendUserAgentNotification: ['sendUserPushNotification', async function (cb) {
            var date1 = moment().utcOffset(offset);
            var progress_date = date1._d
            console.log("........Progress.DAte......", progress_date);
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "select cbl_user_orders.*,cbl_user.device_token from cbl_user_orders join cbl_user on cbl_user.id=cbl_user_orders.user_id where order_id=?";
            var user_order_data = await Execute.QueryAgent(agentConnection, sqlQuery, [orderId]);
            if (user_order_data && user_order_data.length > 0) {
                user_order_data[0].current_date_time = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");
            }
            var data = {
                type: "OrderInProgress",
                message: await Universal.getMsgText(notificationLanguage, req, status),
                data: user_order_data && user_order_data.length > 0 ? user_order_data[0] : {},
                items: []
            };
            var agent_token = user_order_data && user_order_data.length > 0 ? user_order_data[0].device_token : ""
            logger.debug("==Not:DATA!=agent_token=", data, agent_token);
            await pushNotifications.sendFcmPushNotificationToAgent(req.dbName, agent_token, data);
            cb(null)

        }],
        savePushNotification: ['sendUserAgentNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                let notification_message = await Universal.getMsgText(notificationLanguage, req, status)
                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, notification_message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, notification_message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, notification_message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, notification_message, cb)
                    }
                }
            }
        }],
        sendTextMsgToUser: ['savePushNotification', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);

            let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
                "select `key`,value from tbl_setting where `key`=? and value=1",
                ["allowTextMsgOnStatusChange"]
            )
            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)

            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);


            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                && allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null)
            } else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            } else {
                logger.debug("=============keys not found========", twiliodata);
                cb(null)
            }
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
};

exports.deliveryCompanyOrderInProgress = async function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    var deviceToken, userId, deviceType, supplierId,
        supplierName,
        notificationLanguage,
        notificationStatus,
        userEmailId,
        userName,
        net_amount,
        created_on,
        schedule_date, payment_type, self_pickup = 0;
    let checkZoomEnable = await Execute.Query(req.dbName,
        "select `key`,value from tbl_setting where `key`=?", ["is_zoom_call_enabled"])
    let countryCode = "";
    let mobileNumber = "";

    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        ProgressOrder: ['blankField', function (cb) {
            console.log("----------------in progress order-----------");

            orderFunction.orderInProgress(req.dbName, res, orderId, status, offset, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })
        }],
        changeAgentOrderStatus: ['ProgressOrder', async function (cb) {
            // var bQuery="select is_agent,user_id from orders where id=? and is_agent=?"
            // connection.query(bQuery,[orderId,1],async function(err,data){
            //     if (err) {
            //         sendResponse.somethingWentWrongError(res);
            //     }
            //     else{
            //         if(data && data.length>0){
            var date1 = moment().utcOffset(offset);
            var progress_date = date1._d
            console.log("........Progress.DAte......", progress_date);
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "update cbl_user_orders set status=?,progress_on=? where order_id=?";
            agentConnection.query(sqlQuery, [status, progress_date, orderId], async function (err, agentData) {
                //    console.log(err)
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    logger.debug("========is zoom enable===1======", checkZoomEnable);

                    if (checkZoomEnable && checkZoomEnable.length) {
                        if (parseInt(checkZoomEnable[0].value) == 1) {
                            logger.debug("========is zoom enable====2=====", checkZoomEnable);
                            await createZoomCallUrl(req.dbName, orderId);
                            cb(null);
                        } else {
                            logger.debug("========is zoom enable===3======", checkZoomEnable);

                            cb(null);
                        }
                    } else {
                        logger.debug("========is zoom enable====4=====", checkZoomEnable);

                        cb(null);
                    }

                }
            })

            //         }
            //         else{
            //             cb(null)
            //         }
            //     }
            // })
        }],
        notificationData: ['changeAgentOrderStatus', function (cb) {
            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    req.category_id = values.category_id;
                    userId = values.user_id;
                    deviceType = values.device_type;
                    self_pickup = values.self_pickup
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    userName = values.userName;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;
                    net_amount = values.net_amount;
                    created_on = moment(values.created_on).format('YYYY-MM-DD HH:mm');
                    schedule_date = moment(values.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        sendUserPushNotification: ['notificationData', async function (cb) {
            let clientLanguage = await Universal.getClientLanguage(req.dbName);
            if (clientLanguage && clientLanguage.length > 0) {
                notificationLanguage = 16
            }
            if (notificationStatus == 0) {
                cb(null)
            }
            else {
                data = {
                    "status": status,
                    "message": await Universal.getMsgText(notificationLanguage, req, status),
                    "orderId": orderId,
                    "self_pickup": self_pickup
                }
                logger.debug("+====================data for notif=++++++", data, notificationLanguage, req.service_type, status)

                pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                    console.log(".........errrrrrr.......", err, result);
                    if (err) {
                        console.log("err2", err);
                        cb(null)
                    } else {
                        cb(null);
                    }
                });
            }

        }],
        sendUserAgentNotification: ['sendUserPushNotification', async function (cb) {
            var date1 = moment().utcOffset(offset);
            var progress_date = date1._d
            console.log("........Progress.DAte......", progress_date);
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "select cbl_user_orders.*,cbl_user.device_token from cbl_user_orders join cbl_user on cbl_user.id=cbl_user_orders.user_id where order_id=?";
            var user_order_data = await Execute.QueryAgent(agentConnection, sqlQuery, [orderId]);
            if (user_order_data && user_order_data.length > 0) {
                user_order_data[0].current_date_time = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");
            }
            var data = {
                type: "OrderInProgress",
                message: await Universal.getMsgText(notificationLanguage, req, status),
                data: user_order_data && user_order_data.length > 0 ? user_order_data[0] : {},
                items: []
            };
            var agent_token = user_order_data && user_order_data.length > 0 ? user_order_data[0].device_token : ""
            logger.debug("==Not:DATA!=agent_token=", data, agent_token);
            await pushNotifications.sendFcmPushNotificationToAgent(req.dbName, agent_token, data);
            cb(null)
            // pushNotifications.sendFcmPushNotificationToAgent(agent_token,data,function (err, result) {
            //     console.log(".........errrrrrr.......",err,result);
            //     if (err) {
            //         console.log("err2",err);
            //         cb(null)
            //     }
            //     else {
            //         cb(null);
            //     }
            // });

        }],
        savePushNotification: ['sendUserAgentNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                let notification_message = await Universal.getMsgText(notificationLanguage, req, status)
                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, notification_message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, notification_message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, notification_message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, notification_message, cb)
                    }
                }
            }
        }],
        sendTextMsgToUser: ['savePushNotification', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);

            let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
                "select `key`,value from tbl_setting where `key`=? and value=1",
                ["allowTextMsgOnStatusChange"]
            )
            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)

            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);


            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                && allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null)
            } else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            } else {
                logger.debug("=============keys not found========", twiliodata);
                cb(null)
            }
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            data = [];
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
};

const createZoomCallUrl = (dbName, orderId) => {
    return new Promise(async (resolve, reject) => {
        var getAgentDbData = await common.GetAgentDbInformation(dbName);
        var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
        var resultSql = await Execute.Query(dbName, `select zoom_call_url,zoom_call_start_url from orders where id=?`, [orderId])
        if (resultSql[0] && resultSql[0].zoom_call_url && resultSql[0].zoom_call_url != "") {
            await Execute.QueryAgent(agentConnection, "update cbl_user_orders set zoom_call_url=?,zoom_call_start_url=? where order_id=?", [resultSql[0].zoom_call_url, resultSql[0].zoom_call_start_url, orderId]);
            resolve();
        } else {
            var settings = await Execute.Query(dbName, "SELECT (SELECT value FROM `tbl_setting` WHERE `key` = 'zoom_api_key' LIMIT 1) zoom_api_key, (SELECT value FROM `tbl_setting` WHERE `key` = 'zoom_api_secret' LIMIT 1) zoom_api_secret, (SELECT value FROM `tbl_setting` WHERE `key` = 'zoom_email' LIMIT 1) zoom_email FROM user LIMIT 1", [])

            if (settings[0] && settings[0].zoom_api_key && settings[0].zoom_api_key != "" && settings[0].zoom_api_secret && settings[0].zoom_api_secret != "" && settings[0].zoom_email && settings[0].zoom_email != "") {
                var jwt = require('jsonwebtoken');
                var payload = {
                    iss: settings[0].zoom_api_key,
                    exp: ((new Date()).getTime() + 5000)
                };
                var zoom_token = jwt.sign(payload, settings[0].zoom_api_secret);
                var user_id = settings[0].zoom_email;
                data = {
                    "topic": "Zoom Meeting For Order Id - " + orderId,
                    "type": 5,
                    "start_time": moment().toISOString(),
                    "duration": 60,
                    "password": "",
                    "agenda": "Zoom Meeting For Order Id - " + orderId,
                    "recurrence": {
                        "type": 1,
                        "repeat_interval": 1,
                        "end_date_time": moment().add(5, 'days').toISOString()
                    },
                    "settings": {
                        "host_video": true,
                        "participant_video": true,
                        "approval_type": 0,
                        "registration_type": 1,
                        "audio": "both",
                        "auto_recording": "none",
                        "enforce_login": "false",
                        "enforce_login_domains": "",
                        "alternative_hosts": ""
                    }
                }
                let baseURL = "https://api.zoom.us/v2/users/" + user_id + "/meetings";
                var options = {
                    method: 'POST',
                    url: baseURL,
                    headers: {
                        "User-Agent": "Zoom-Jwt-Request",
                        "Content-type": "application/json",
                        "Authorization": 'bearer ' + zoom_token
                    },
                    body: data,
                    json: true
                };
                console.log("data =================== ", JSON.stringify(options))
                web_request(options, async function (error, response, body) {
                    console.log(error, "=====================================", body)
                    if (error) {
                        resolve();
                        //reject(APP_CONSTANTS.STATUS_MSG.ERROR.DEFAUTL_ERROR)
                    }
                    else {
                        var zoom_call_url = body.join_url;
                        var zoom_call_start_url = body.start_url;
                        await Execute.Query(dbName, "update orders set zoom_call_url=?,zoom_call_start_url=? where id=?", [zoom_call_url, zoom_call_start_url, orderId]);
                        await Execute.QueryAgent(agentConnection, "update cbl_user_orders set zoom_call_url=?, zoom_call_start_url=? where order_id=?", [zoom_call_url, zoom_call_start_url, orderId]);

                        let device_tokens = [];

                        var sqlQueryAgentDetails = `select cbu.id,cbu.device_token from cbl_user_orders cuo 
                        join cbl_user cbu on cbu.id = cuo.user_id
                        where cuo.order_id=?`
                        let agentDetails = await Execute.QueryAgent(agentConnection,
                            sqlQueryAgentDetails, [orderId]);

                        // let data = {
                        //     "message":" User try to contact you via video call ",
                        //     "type":"zoom_call",
                        //     "order_id":orderId
                        // }

                        var sqlQueryUserDetails = `select u.id,u.device_token from orders o 
                        join user u on u.id = o.user_id
                        where o.id=?`
                        let userDetails = await Execute.Query(dbName,
                            sqlQueryUserDetails, [orderId]);

                        if (agentDetails && agentDetails.length > 0) {
                            device_tokens.push(agentDetails[0].device_token)
                        }
                        if (userDetails && userDetails.length > 0) {
                            device_tokens.push(userDetails[0].device_token)
                        }
                        let data = {
                            "message": " zoom call started you can join now.. ",
                            "type": "zoom_call",
                            "order_id": orderId
                        }
                        await lib.sendFcmPushNotification(device_tokens, data, dbName);


                        resolve();
                    }
                });
            } else {
                resolve();
                //reject(APP_CONSTANTS.STATUS_MSG.ERROR.DEFAUTL_ERROR)
            }
        }
    })
}


var getDetailsUsers = function (dbName, orderId, cb) {
    var sql = " select u.id, u.firstname,u.lastname,u.notification_status,u.notification_language,u.device_type,u.device_token from orders o join user u on o.user_id = u.id where o.id = ?";
    multiConnection[dbName].query(sql, [orderId], function (err, result) {
        if (err) {
            console.log("err1", err);
            cb(err);
        } else {
            cb(null, result);
        }
    })


};

exports.orderNearby = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    var deviceToken, userId, deviceType, supplierId,
        supplierName,
        notificationLanguage,
        notificationStatus,
        userEmailId,
        userName,
        net_amount,
        created_on,
        schedule_date, payment_type, self_pickup = 0;

    let countryCode = "";
    let mobileNumber = "";
    let userLanguage = "en";
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        // sendPush:['checkauthority',function(cb){
        //     getDetailsUsers(orderId,function(err,result){
        //         if(err){
        //             cb(err);
        //         }else{
        //             if(result[0].notification_status == 1){
        //                 if(result[0].device_type == 0){
        //                     if(result[0].notification_language == 14){
        //                         var data = {
        //                             "status": "ORDER NEARBY",
        //                             "message": "ORDER NEARBY",
        //                         }
        //                     }else{
        //                         var data = {
        //                             "status": "تم قبول طلبك من قبل المورد",
        //                             "message": "تم قبول طلبك من قبل المورد",
        //                         }
        //                     }
        //                     pushNotifications.sendAndroidPushNotification(result[0].device_token, data, function (err, result) {
        //                         if (err) {
        //                             cb(null);
        //                         }
        //                         else {
        //                             cb(null);
        //                         }
        //                     });
        //                 }else{
        //                     if(result[0].notification_language == 14){
        //                         var data = {
        //                             "status": "ORDER NEARBY",
        //                             "message": "ORDER NEARBY",
        //                         }
        //                     }else{
        //                         var data = {
        //                             "status": "تم قبول طلبك من قبل المورد",
        //                             "message": "تم قبول طلبك من قبل المورد",
        //                         }
        //                     }
        //                     var path ="user";
        //                     var sound = "ping.aiff";
        //                     pushNotifications.sendIosPushNotification(result[0].device_token,data,path,sound,function (err, result) {
        //                         console.log(".........errrrrrr.......",err,result);
        //                         if (err) {
        //                             console.log("err2",err);
        //                             cb(null)
        //                         }
        //                         else {
        //                             //console.log("push sent");
        //                             cb(null);
        //                         }
        //                     });
        //                 }
        //             }else{
        //                 cb(null);
        //             }
        //         }
        //     })
        // }],
        OrderNearby: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            console.log("111111111111111")
            orderFunction.orderNearby(req.dbName, res, orderId, status, offset, req.service_type, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }],
        notificationData: ['OrderNearby', function (cb) {
            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    req.category_id = values.category_id;
                    userId = values.user_id;
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    self_pickup = values.self_pickup;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;
                    userName = values.userName;
                    is_dine_in = values.is_dine_in;
                    net_amount = values.net_amount;
                    created_on = moment(values.created_on).format('YYYY-MM-DD HH:mm');
                    schedule_date = moment(values.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        changeAgentOrderStatus: ['notificationData', async function (cb) {
            //     var bQuery="select is_agent,user_id from orders where id=? and is_agent=?"
            //    let stmt  =  multiConnection[req.dbName].query(bQuery,[orderId,1],async function(err,data){
            //        logger.debug("=============sttm===========.swql===",stmt.sql)
            //         if (err) {
            //             sendResponse.somethingWentWrongError(res);
            //         }
            //         else{
            //             if(data && data.length>0){

            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            let query1 = "select id from cbl_user_orders where order_id=? and progress_on='0000-00-00 00:00:00'";
            let result1 = await Execute.QueryAgent(agentConnection, query1, [orderId]);
            console.log("2222222222222222222==result1>>", result1)
            var date10 = moment().utcOffset(offset);
            var reached_on = date10._d;
            var sqlQuery = "update cbl_user_orders set status=?,reached_on=? where order_id=? and customer_id=?";
            let stmt2 = agentConnection.query(sqlQuery, [status, reached_on, orderId, userId], async function (err, agentData) {
                logger.debug("=============sttm===========.swql==222=", stmt2.sql)
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (result1 && result1.length > 0) {
                        var sql1 = 'update cbl_user_orders set progress_on=? where order_id=?';
                        await Execute.QueryAgent(agentConnection, sql1, [reached_on, orderId]);
                        // await agentConnection.query(sql1,[reached_on,orderId]);
                        cb(null)
                    }
                    else {
                        cb(null)
                    }

                }
            });
            //         }
            //         else{
            //             cb(null)
            //         }
            //     }
            // })
        }],
        sendUserPushNotification: ['changeAgentOrderStatus', async function (cb) {
            let clientLanguage = await Universal.getClientLanguage(req.dbName);
            let languageData = await Execute.Query(req.dbName, `SELECT language_code FROM language where id=?`, [parseInt(notificationLanguage)]);
            userLanguage = languageData && languageData.length > 0 ? languageData[0].language_code : userLanguage;
            req.userLanguage = userLanguage;
            if (clientLanguage && clientLanguage.length > 0) {
                notificationLanguage = 16
            }
            if (notificationStatus == 0) {
                cb(null)
            }
            else {
                let enable_product_appointment = await Execute.Query(req.dbName,
                    "select `key`,value from tbl_setting where `key`=? and value=1",
                    ["enable_product_appointment"]
                )

                let msg = await Universal.getMsgText(notificationLanguage, req, status);

                if (parseInt(self_pickup) == 1 && enable_product_appointment && enable_product_appointment.length > 0) {
                    msg = "reached"
                }
                console.log(msg, "msg", is_dine_in, "is_dine_inis_dine_in")
                if (is_dine_in == 1 && msg == "Your order is ready to be picked") {
                    msg = "Your order is ready to be served"
                }
                console.log(msg, "msg", is_dine_in, "is_dine_inis_dine_in")


                var data = {
                    "status": status,
                    "message": msg,
                    "orderId": orderId
                }
                pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                    console.log(".........errrrrrr.......", err, result);
                    if (err) {
                        console.log("err2", err);
                        cb(null)
                    } else {
                        cb(null);
                    }
                });
            }

        }],
        sendUserAgentNotification: ['sendUserPushNotification', async function (cb) {
            var date1 = moment().utcOffset(offset);
            var progress_date = date1._d
            console.log("........Progress.DAte......", progress_date);
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "select cbl_user_orders.*,cbl_user.device_token from cbl_user_orders join cbl_user on cbl_user.id=cbl_user_orders.user_id where order_id=?";
            var user_order_data = await Execute.QueryAgent(agentConnection, sqlQuery, [orderId]);
            if (user_order_data && user_order_data.length > 0) {
                user_order_data[0].current_date_time = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");
            }
            var data = {
                type: "OrderReadyToBePicked",
                message: await Universal.getMsgText(notificationLanguage, req, status),
                data: user_order_data && user_order_data.length > 0 ? user_order_data[0] : {},
                items: []
            };
            var agent_token = user_order_data && user_order_data.length > 0 ? user_order_data[0].device_token : ""
            logger.debug("==Not:DATA!=agent_token=", data, agent_token);
            await pushNotifications.sendFcmPushNotificationToAgent(req.dbName, agent_token, data);
            cb(null)
            // pushNotifications.sendFcmPushNotificationToAgent(agent_token,data,function (err, result) {
            //     console.log(".........errrrrrr.......",err,result);
            //     if (err) {
            //         console.log("err2",err);
            //         cb(null)
            //     }
            //     else {
            //         cb(null);
            //     }
            // });

        }],
        savePushNotification: ['sendUserAgentNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                let message = await Universal.getMsgText(notificationLanguage, req, status)
                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
            }
        }],
        sendTextMsgToUser: ['savePushNotification', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);
            logger.debug("====twiliodata========twiliodata=============+", twiliodata)


            let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
                "select `key`,value from tbl_setting where `key`=? and value=1",
                ["allowTextMsgOnStatusChange"]
            )

            logger.debug("====allowTextMsgOnStatusChange========allowTextMsgOnStatusChange=============+", allowTextMsgOnStatusChange)

            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);

            logger.debug("====bandWidthData========bandWidthData=============+", bandWidthData)



            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)


            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                && allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null);
            } else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            }
            else {
                logger.debug("=============keys not found========", twiliodata);
                logger.debug("=============keys not found========", bandWidthData);

                cb(null)
            }
        }]
    },
        function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);

            } else {
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        })
}

exports.deliveryCompanyOrderNearby = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    var deviceToken, userId, deviceType, supplierId,
        supplierName,
        notificationLanguage,
        notificationStatus,
        userEmailId,
        userName,
        net_amount,
        created_on,
        schedule_date, payment_type, self_pickup = 0;

    let countryCode = "";
    let mobileNumber = "";

    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        // sendPush:['checkauthority',function(cb){
        //     getDetailsUsers(orderId,function(err,result){
        //         if(err){
        //             cb(err);
        //         }else{
        //             if(result[0].notification_status == 1){
        //                 if(result[0].device_type == 0){
        //                     if(result[0].notification_language == 14){
        //                         var data = {
        //                             "status": "ORDER NEARBY",
        //                             "message": "ORDER NEARBY",
        //                         }
        //                     }else{
        //                         var data = {
        //                             "status": "تم قبول طلبك من قبل المورد",
        //                             "message": "تم قبول طلبك من قبل المورد",
        //                         }
        //                     }
        //                     pushNotifications.sendAndroidPushNotification(result[0].device_token, data, function (err, result) {
        //                         if (err) {
        //                             cb(null);
        //                         }
        //                         else {
        //                             cb(null);
        //                         }
        //                     });
        //                 }else{
        //                     if(result[0].notification_language == 14){
        //                         var data = {
        //                             "status": "ORDER NEARBY",
        //                             "message": "ORDER NEARBY",
        //                         }
        //                     }else{
        //                         var data = {
        //                             "status": "تم قبول طلبك من قبل المورد",
        //                             "message": "تم قبول طلبك من قبل المورد",
        //                         }
        //                     }
        //                     var path ="user";
        //                     var sound = "ping.aiff";
        //                     pushNotifications.sendIosPushNotification(result[0].device_token,data,path,sound,function (err, result) {
        //                         console.log(".........errrrrrr.......",err,result);
        //                         if (err) {
        //                             console.log("err2",err);
        //                             cb(null)
        //                         }
        //                         else {
        //                             //console.log("push sent");
        //                             cb(null);
        //                         }
        //                     });
        //                 }
        //             }else{
        //                 cb(null);
        //             }
        //         }
        //     })
        // }],
        OrderNearby: ['blankField', function (cb) {
            console.log("111111111111111")
            orderFunction.orderNearby(req.dbName, res, orderId, status, offset, req.service_type, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }],
        notificationData: ['OrderNearby', function (cb) {
            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    req.category_id = values.category_id;
                    userId = values.user_id;
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    self_pickup = values.self_pickup;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;
                    userName = values.userName;
                    net_amount = values.net_amount;
                    created_on = moment(values.created_on).format('YYYY-MM-DD HH:mm');
                    schedule_date = moment(values.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        changeAgentOrderStatus: ['notificationData', async function (cb) {
            //     var bQuery="select is_agent,user_id from orders where id=? and is_agent=?"
            //    let stmt  =  multiConnection[req.dbName].query(bQuery,[orderId,1],async function(err,data){
            //        logger.debug("=============sttm===========.swql===",stmt.sql)
            //         if (err) {
            //             sendResponse.somethingWentWrongError(res);
            //         }
            //         else{
            //             if(data && data.length>0){

            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            let query1 = "select id from cbl_user_orders where order_id=? and progress_on='0000-00-00 00:00:00'";
            let result1 = await Execute.QueryAgent(agentConnection, query1, [orderId]);
            console.log("2222222222222222222==result1>>", result1)
            var date10 = moment().utcOffset(offset);
            var reached_on = date10._d;
            var sqlQuery = "update cbl_user_orders set status=?,reached_on=? where order_id=? and customer_id=?";
            let stmt2 = agentConnection.query(sqlQuery, [status, reached_on, orderId, userId], async function (err, agentData) {
                logger.debug("=============sttm===========.swql==222=", stmt2.sql)
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    if (result1 && result1.length > 0) {
                        var sql1 = 'update cbl_user_orders set progress_on=? where order_id=?';
                        await Execute.QueryAgent(agentConnection, sql1, [reached_on, orderId]);
                        // await agentConnection.query(sql1,[reached_on,orderId]);
                        cb(null)
                    }
                    else {
                        cb(null)
                    }

                }
            });
            //         }
            //         else{
            //             cb(null)
            //         }
            //     }
            // })
        }],
        sendUserPushNotification: ['changeAgentOrderStatus', async function (cb) {
            let clientLanguage = await Universal.getClientLanguage(req.dbName);
            if (clientLanguage && clientLanguage.length > 0) {
                notificationLanguage = 16
            }
            if (notificationStatus == 0) {
                cb(null)
            }
            else {
                var data = {
                    "status": status,
                    "message": await Universal.getMsgText(notificationLanguage, req, status),
                    "orderId": orderId
                }
                pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                    console.log(".........errrrrrr.......", err, result);
                    if (err) {
                        console.log("err2", err);
                        cb(null)
                    } else {
                        cb(null);
                    }
                });
            }

        }],
        sendUserAgentNotification: ['sendUserPushNotification', async function (cb) {
            var date1 = moment().utcOffset(offset);
            var progress_date = date1._d
            console.log("........Progress.DAte......", progress_date);
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var sqlQuery = "select cbl_user_orders.*,cbl_user.device_token from cbl_user_orders join cbl_user on cbl_user.id=cbl_user_orders.user_id where order_id=?";
            var user_order_data = await Execute.QueryAgent(agentConnection, sqlQuery, [orderId]);
            if (user_order_data && user_order_data.length > 0) {
                user_order_data[0].current_date_time = moment().utcOffset(offset).format("YYYY-MM-DD HH:mm:ss");
            }
            var data = {
                type: "OrderReadyToBePicked",
                message: await Universal.getMsgText(notificationLanguage, req, status),
                data: user_order_data && user_order_data.length > 0 ? user_order_data[0] : {},
                items: []
            };
            var agent_token = user_order_data && user_order_data.length > 0 ? user_order_data[0].device_token : ""
            logger.debug("==Not:DATA!=agent_token=", data, agent_token);
            await pushNotifications.sendFcmPushNotificationToAgent(req.dbName, agent_token, data);
            cb(null)
            // pushNotifications.sendFcmPushNotificationToAgent(agent_token,data,function (err, result) {
            //     console.log(".........errrrrrr.......",err,result);
            //     if (err) {
            //         console.log("err2",err);
            //         cb(null)
            //     }
            //     else {
            //         cb(null);
            //     }
            // });

        }],
        savePushNotification: ['sendUserAgentNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                let message = await Universal.getMsgText(notificationLanguage, req, status)
                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
            }
        }],
        sendTextMsgToUser: ['savePushNotification', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);
            logger.debug("====twiliodata========twiliodata=============+", twiliodata)


            let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
                "select `key`,value from tbl_setting where `key`=? and value=1",
                ["allowTextMsgOnStatusChange"]
            )

            logger.debug("====allowTextMsgOnStatusChange========allowTextMsgOnStatusChange=============+", allowTextMsgOnStatusChange)

            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);

            logger.debug("====bandWidthData========bandWidthData=============+", bandWidthData)



            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)


            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                && allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null);
            } else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            }
            else {
                logger.debug("=============keys not found========", twiliodata);
                logger.debug("=============keys not found========", bandWidthData);

                cb(null)
            }
        }]
    },
        function (err, result) {
            if (err) {
                sendResponse.somethingWentWrongError(res);

            } else {
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        })
}


/**
 * @description used for delivered order by admin
 */
exports.deliveryCompanyDeliveredOrder = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var deviceToken = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierId = 0;
    var supplierName = 0;
    var notificationStatus;
    var notificationLanguage;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    var deviceToken, userId, deviceType, supplierId,
        supplierName,
        notificationLanguage,
        notificationStatus,
        userEmailId,
        userName,
        net_amount,
        created_on,
        schedule_date, payment_type, self_pickup = 0;
    let countryCode = "";
    let mobileNumber = "";
    var message;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        isAlreadyDelivered: ['blankField', async function (cb) {
            try {
                let orderData = await Execute.Query(req.dbName, `select id from orders where id=? and status=?`, [orderId, status]);
                logger.debug("========>>")
                if (orderData && orderData.length > 0) {
                    var msg = "order is already delivered";
                    return sendResponse.sendErrorMessage(msg, res, 400);
                }
                else {
                    cb(null)
                }
            }
            catch (Err) {
                logger.debug("======Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        }],
        changeAgentOrderStatus: ['blankField', 'authenticate', 'checkauthority', 'isAlreadyDelivered', async function (cb) {
            logger.debug("================here===in changeagentorderstatus========")
            var getAgentDbData = await common.GetAgentDbInformation(req.dbName);
            var agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
            var netAmmountAndCommission = await getOrderNetAmmountAndCommission(agentConnection, orderId)
            if (netAmmountAndCommission && netAmmountAndCommission.length > 0) {
                let deliveryChargeData = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=? and `value`=?", ["commission_delivery_wise", "1"])
                logger.debug("===deliveryChargeData===", deliveryChargeData)
                let calculateCommission = 0;
                if (deliveryChargeData && deliveryChargeData.length > 0) {
                    calculateCommission = await calculateTotalCommission(agentConnection,
                        netAmmountAndCommission[0].delivery_charges, netAmmountAndCommission[0].user_id,
                        req.dbname, orderId)

                }
                else {
                    calculateCommission = await calculateTotalCommission(agentConnection, netAmmountAndCommission[0].net_amount,
                        netAmmountAndCommission[0].user_id, req.dbName, orderId)
                }
                console.log("111111111111111111111111111")
                let query5 = "select (SELECT value FROM " + req.dbName + ".`tbl_setting` WHERE `key` = 'is_enabled_agent_base_price' LIMIT 1) is_enabled_agent_base_price, (SELECT value FROM " + req.dbName + ".`tbl_setting` WHERE `key` = 'allow_agentwallet_to_pay_for_cashorder' LIMIT 1) allow_agentwallet_to_pay_for_cashorder,cuo.payment_type, cu.base_price,cu.delivery_charge_share from cbl_user_orders cuo left join cbl_user cu on cuo.user_id=cu.id where order_id=?";
                let result5 = await Execute.QueryAgent(agentConnection, query5, [orderId]);

                if (result5[0] && result5[0].payment_type == "0" && result5[0].allow_agentwallet_to_pay_for_cashorder && result5[0].allow_agentwallet_to_pay_for_cashorder == "1") {
                    console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", result5)

                    var agentOrderDetails = await Execute.QueryAgent(agentConnection, "SELECT (select wallet_amount from cbl_user where id=cbl_user_orders.user_id) as agent_wallet_balance, `tip_agent`, `commission_ammount`,`net_amount`, agent_base_price, agent_delivery_charge_share,user_id,(net_amount - (tip_agent + commission_ammount + agent_base_price + agent_delivery_charge_share)) amount_payable, (tip_agent + commission_ammount + agent_base_price + agent_delivery_charge_share) agent_amount FROM `cbl_user_orders` WHERE order_id=?", [orderId]);
                    console.log("ccccccccccccccccccccccccccccccc", agentOrderDetails)
                    if (agentOrderDetails[0].agent_wallet_balance < agentOrderDetails[0].amount_payable) {
                        console.log("dddddddddddddddddddddddd")
                        var message = "Delivery boy do not have enough balance in wallet";
                        return sendResponse.sendErrorMessage(message, res, 400)
                        //cb({messagemessage})
                    } else {
                        console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
                        let query1 = "update cbl_user set wallet_amount=wallet_amount-? where id=?"
                        let params1 = [agentOrderDetails[0].amount_payable, agentOrderDetails[0].user_id]
                        await Execute.QueryAgent(agentConnection, query1, params1);
                        await agentPayablePayment(req.dbName, res, agentOrderDetails[0].agent_amount, orderId, agentOrderDetails[0].user_id)
                    }
                }

                if (result5[0] && result5[0].is_enabled_agent_base_price && result5[0].is_enabled_agent_base_price == "1") {
                    var data_to_update = "";
                    if (result5[0].base_price && result5[0].base_price != "0") {
                        data_to_update = "agent_base_price='" + result5[0].base_price + "'"
                    }
                    if (result5[0].delivery_charge_share && result5[0].delivery_charge_share != "0") {
                        if (data_to_update != "") {
                            data_to_update += ","
                        }
                        data_to_update += "agent_delivery_charge_share='" + result5[0].delivery_charge_share + "'"
                    }
                    if (data_to_update != "") {
                        await Execute.QueryAgent(agentConnection, "update cbl_user_orders set " + data_to_update + " where order_id=?", [orderId]);
                        await multiConnection[req.dbName].query("update orders set " + data_to_update + " where id =?", [orderId])
                    }
                }

                // await updateAgentCommission(agentConnection,netAmmountAndCommission[0].cbl_id,calculateCommission)
                logger.debug("========final calculated commission ammoutn======", calculateCommission)
                var date10 = moment().utcOffset(offset);
                var delivered_on = date10._d;
                var sqlQuery = "update cbl_user_orders set status=?,delivered_on=?,commission_ammount=? where order_id=? ";
                //    var st=await agentConnection.query(sqlQuery,[status,delivered_on,calculateCommission,orderId],async function(err,agentData){
                //     //    console.log(st)
                //         if (err) {
                //             sendResponse.somethingWentWrongError(res);
                //         }
                //         else{
                await Execute.QueryAgent(agentConnection, sqlQuery, [status, delivered_on, calculateCommission, orderId]);
                let query1 = "select progress_on,reached_on,shipped_on,delivered_on from cbl_user_orders where order_id=?";
                //let result1 = await agentConnection.query(query1,[orderId]);
                let result1 = await Execute.QueryAgent(agentConnection, query1, [orderId]);
                if (result1 && result1.length) {
                    var update_set = []
                    if (result1[0] && result1[0].progress_on == "0000-00-00 00:00:00") {
                        update_set.push(' progress_on="' + delivered_on + '" ');
                    }
                    if (result1[0] && result1[0].reached_on == "0000-00-00 00:00:00") {
                        update_set.push(' reached_on="' + delivered_on + '" ');
                    }
                    if (result1[0] && result1[0].shipped_on == "0000-00-00 00:00:00") {
                        update_set.push(' shipped_on="' + delivered_on + '" ');
                    }
                    update_set.join(',')
                    if (update_set != "") {
                        var sql1 = 'update cbl_user_orders set ' + update_set + ' where order_id=? ';
                        //await agentConnection.query(sql1,[date,orderId]);    
                        await Execute.QueryAgent(agentConnection, sql1, [orderId]);
                    }
                }
                cb(null)
                //     }
                // });
            } else {
                cb(null)
            }
        }],
        deliveredOrder: ['changeAgentOrderStatus', function (cb) {

            orderFunction.deliveredOrder(req.dbName, res, orderId, status, offset, req.service_type, function (err, result) {
                console.log("..........err........deliver....result.........", err, result);

                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })

        }],
        /* notificationData: ['deliveredOrder', function (cb) {
              adminOrders.getValue(res, orderId, function (err, values) {
                  if (err) {
                      sendResponse.somethingWentWrongError(res);
                  }
                  else {
                      deviceToken = values.device_token;
                      userId = values.user_id;
                      deviceType = values.device_type;
                      supplierId = values.supplier_id;
                      supplierName = values.supplier_name;
                      notificationLanguage = values.notification_language;
                      notificationStatus = values.notification_status;
                      cb(null);
                  }
              });
          }],
          sendPushNotification: ['notificationData', function (cb) {
                  if (notificationStatus == 0) {
                      return cb(null);
                  }
                  else {
                      if (deviceType == 0) {
                          if (notificationLanguage == 14) {
                              var data = {
                                  "status": 0,
                                  "message":" Your Order Has been Delivered",
                                  "orderId":orderId
  
                              }
                          }
                          else {
                              var data = {
                                  "status": 0,
                                  "message": "وقد تم تسليم طلبك",
                                  "orderId":orderId
  
                              }
                          }
                          message = data.message;
                          console.log("......",message);
                          pushNotifications.sendAndroidPushNotification(deviceToken,data, function (err, result) {
                              if (err) {
                                  var msg = "something went wrong";
                                  return sendResponse.sendErrorMessage(msg, res, 500);
                              }
                              else {
                                  cb(null);
                              }
                          });
                      }
                      else {
                          if (notificationLanguage == 14) {
                              var data = {
                                  "status": 0,
                                  "message":" Your Order Has been Delivered",
                                  "orderId":orderId
  
                              }
                          }
                          else {
                              var data = {
                                  "status": 0,
                                  "message": "وقد تم تسليم طلبك",
                                  "orderId":orderId
  
                              }
                          }
                        var path = "user";
                          var sound = "ping.aiff";
                          
                          console.log("........................send ios");
                          
                          
                          pushNotifications.sendIosPushNotification(deviceToken, data, path,sound ,function (err, result) {
                              if (err) {
                                  var msg = "something went wrong";
                                  return sendResponse.sendErrorMessage(msg, res, 500);
                              }
                              else {
                                  cb(null);
                              }
                          });
                      }
                  }
              
    
          }],
          savePushNotification: ['sendPushNotification', function (cb) {
              if (notificationStatus == 0) {
                  cb(null);
              }
              }
              else {
                  if(notificationLanguage ==14){
                      adminOrders.saveNoticationData(res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_DELIVERED,constant.pushNotificationMessage.ORDER_DELIVERED_ENGLISH, cb)
                  }
                  else {
                      adminOrders.saveNoticationData(res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_DELIVERED,constant.pushNotificationMessage.ORDER_DELIVERED_ARABIC, cb)
                  }
              }
          }]*/


        payToAgentAndSupplier: ['deliveredOrder', function (cb) {

            orderFunction.payToAgentAndSupplier(req.dbName, res, orderId, function (err, result) {
                console.log("..........err........deliver....result.........", err, result);

                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })

        }],
        //notificationData: ['deliveredOrder', function (cb) {
        notificationData: ['payToAgentAndSupplier', function (cb) {
            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    userId = values.user_id;
                    req.category_id = values.category_id;
                    self_pickup = values.self_pickup;
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    userName = values.userName;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;

                    net_amount = values.net_amount;
                    created_on = moment(values.created_on).format('YYYY-MM-DD HH:mm');
                    schedule_date = moment(values.schedule_date).format('YYYY-MM-DD HH:mm');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        updateReferToUser: ['notificationData', async function (cb) {
            try {

                let pointsPerOrder = 1;
                let orderDetails = await Execute.Query(req.dbName, `select * from orders where id=? `, [orderId]);

                let enable_min_loyality_points = await Execute.Query(req.dbName,
                    "select `key`,`value` from tbl_setting where `key`=? and `value`=?",
                    ["enable_min_loyality_points", "1"]);

                if (enable_min_loyality_points && enable_min_loyality_points.length > 0) {

                    let minOrderAmountForLoyalityPoints = await Execute.Query(req.dbName,
                        "select `key`,`value` from tbl_setting where `key`=? ",
                        ["min_order_amount_for_loyality_points"]);

                    let loyalityPointsOnOrder = await Execute.Query(req.dbName,
                        "select `key`,`value` from tbl_setting where `key`=? ",
                        ["loyality_point_per_order"]);

                    if (minOrderAmountForLoyalityPoints
                        && minOrderAmountForLoyalityPoints.length > 0) {
                        minOrderAmountForLoyalityPoints =
                            parseFloat(minOrderAmountForLoyalityPoints[0].value) || 1000
                    }

                    if (loyalityPointsOnOrder
                        && loyalityPointsOnOrder.length > 0) {
                        loyalityPointsOnOrder =
                            parseFloat(loyalityPointsOnOrder[0].value) || 5

                    }

                    if (parseFloat(orderDetails[0].net_amount) >=
                        parseFloat(minOrderAmountForLoyalityPoints)) {
                        let totalPoints = parseFloat(orderDetails[0].net_amount) / parseInt(minOrderAmountForLoyalityPoints);
                        loyalityPointsOnOrder = parseInt(loyalityPointsOnOrder) * parseInt(totalPoints);
                        pointsPerOrder = loyalityPointsOnOrder;
                    }
                    let pointOrderData = await Execute.Query(req.dbName, `select * from loyality_point_earning where order_id=? and is_ready_for_use=? and user_id=?`, [orderId, 0, userId]);
                    if (pointOrderData && pointOrderData.length > 0) {
                        await Execute.Query(req.dbName, `update loyality_point_earning set is_ready_for_use=1 where order_id=? and user_id=?`, [orderId, userId])
                        await Execute.Query(req.dbName, `update user set total_loyality_amount=total_loyality_amount+?,loyalty_points=loyalty_points+? where id=?`, [pointOrderData[0].earned_amount, pointsPerOrder, userId])
                    }

                    let userData = await Execute.Query(req.dbName, `select id,user_id from orders where user_id=? and status=?`, [userId, 5])
                    if (userData && userData.length > 0) {
                        cb(null)
                    }
                    else {
                        await Execute.Query(req.dbName, `update user_referral set ready_for_use=? where to_id=?`, [1, userId]);
                        cb(null)
                    }
                } else {
                    let pointOrderData = await Execute.Query(req.dbName, `select * from loyality_point_earning where order_id=? and is_ready_for_use=? and user_id=?`, [orderId, 0, userId]);
                    if (pointOrderData && pointOrderData.length > 0) {
                        await Execute.Query(req.dbName, `update loyality_point_earning set is_ready_for_use=1 where order_id=? and user_id=?`, [orderId, userId])
                        await Execute.Query(req.dbName, `update user set total_loyality_amount=total_loyality_amount+?,loyalty_points=loyalty_points+? where id=?`, [pointOrderData[0].earned_amount, pointsPerOrder, userId])
                    }

                    let userData = await Execute.Query(req.dbName, `select id,user_id from orders where user_id=? and status=?`, [userId, 5])
                    if (userData && userData.length > 0) {
                        cb(null)
                    }
                    else {
                        await Execute.Query(req.dbName, `update user_referral set ready_for_use=? where to_id=?`, [1, userId]);
                        cb(null)
                    }
                }
            } catch (e) {
                cb(null)
            }
        }],
        sendUserPushNotification: ['updateReferToUser', async function (cb) {
            let clientLanguage = await Universal.getClientLanguage(req.dbName);
            if (clientLanguage && clientLanguage.length > 0) {
                notificationLanguage = 16
            }
            if (notificationStatus == 0) {
                cb(null)
            }
            else {
                var data = {
                    "status": status,
                    "message": await Universal.getMsgText(notificationLanguage, req, status),
                    "orderId": orderId,
                    "self_pickup": self_pickup
                }
                if (parseInt(self_pickup) == 1) {
                    data.message = data.message.replace("delivered", "Picked Up");
                }
                pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                    console.log(".........errrrrrr.......", err, result);
                    if (err) {
                        console.log("err2", err);
                        cb(null)
                    } else {
                        cb(null);
                    }
                });
            }

        }],
        savePushNotification: ['sendUserPushNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                let message = await Universal.getMsgText(notificationLanguage, req, status)
                if (parseInt(self_pickup) == 1) {
                    message = message.replace("delivered", "Picked Up");
                }
                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
            }
        }],
        sendMail: ['savePushNotification', async function (cb) {
            let sql = 'select o.self_pickup, o.handling_admin,  CONCAT(ua.country_code,ua.phone_number) as phoneNumber,  ua.name as customer_name,  CONCAT( ua.address_line_1,", ",ua.customer_address) as customer_address ,  o.self_pickup,  o.delivery_charges, o.promo_discount,o.status, o.net_amount, p.id,op.price,p.bar_code,op.quantity,p.measuring_unit,p.name,pi.image_path from order_prices op join product p on ' +
                'op.product_id =p.id join product_image pi on pi.product_id =p.id join  orders o on o.id = op.order_id left join user_address ua on ua.id=o.user_delivery_address where op.order_id = ?  group by pi.product_id '
            let result = await Execute.Query(req.dbName, sql, [orderId])
            let orderDetails = result;

            emailTemp.deliverOrder(self_pickup, req, req.dbName, res, '', userName, net_amount, created_on, schedule_date, orderId, supplierName, supplierName, payment_type, userEmailId, notificationLanguage, orderDetails, function (err, result) {
                if (err) {
                    console.log("..****fb register email*****....", err);
                } else {
                    cb(null);
                }
            })
        }],

        sendTextMsgToUser: ['sendMail', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);
            let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
                "select `key`,value from tbl_setting where `key`=? and value=1",
                ["allowTextMsgOnStatusChange"]
            )
            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);


            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                && allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null)
            } else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            } else {
                logger.debug("=============keys not found========", twiliodata);
                cb(null)
            }
        }]
    }, function (err, result) {
        if (err) {
            console.log("...............err.......final...........", err);
            sendResponse.somethingWentWrongError(res);
        } else {
            data = [];
            console.log(".........final..........callback..................");
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}




/**
 * @description used for delivered order by admin
 */
exports.deliveredOrder = async function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = 0;
    var adminId = 0;
    var data;
    var deviceToken = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierId = 0;
    var supplierName = 0;
    var notificationStatus;
    var notificationLanguage;
    var offset = req.body.offset != undefined && req.body.offset != "" && req.body.offset != null ? req.body.offset : 4
    var deviceToken, userId, deviceType, supplierId,
        supplierName,
        notificationLanguage,
        notificationStatus,
        userEmailId,
        userName,
        net_amount,
        created_on,
        schedule_date, payment_type, self_pickup = 0;
    let countryCode = "";
    let mobileNumber = "";
    let userLanguage = "en";
    var message;
    let cartId = 0;
    let getAgentDbData = await common.GetAgentDbInformation(req.dbName);
    let agentConnection = await common.RunTimeAgentConnection(getAgentDbData);
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],

        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        isAlreadyDelivered: ['checkauthority', async function (cb) {
            try {
                let orderData = await Execute.Query(req.dbName, `select id from orders where id=? and status=?`, [orderId, status]);
                logger.debug("========>>")
                if (orderData && orderData.length > 0) {
                    var msg = "order is already delivered";
                    return sendResponse.sendErrorMessage(msg, res, 400);
                }
                else {
                    cb(null)
                }
            }
            catch (Err) {
                logger.debug("======Err!==", Err)
                sendResponse.somethingWentWrongError(res);
            }
        }],
        changeAgentOrderStatus: ['blankField', 'authenticate', 'checkauthority', 'isAlreadyDelivered', async function (cb) {
            logger.debug("================here===in changeagentorderstatus========")




            var netAmmountAndCommission = await getOrderNetAmmountAndCommission(agentConnection, orderId);

            if (netAmmountAndCommission && netAmmountAndCommission.length > 0) {
                let deliveryChargeData = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=? and `value`=?", ["commission_delivery_wise", "1"])

                logger.debug("===deliveryChargeData===", deliveryChargeData)
                let calculateCommission = 0;

                if (deliveryChargeData && deliveryChargeData.length > 0) {

                    calculateCommission = await calculateTotalCommission(agentConnection, netAmmountAndCommission[0].delivery_charges,
                        netAmmountAndCommission[0].user_id, req.dbName, orderId)

                }
                else {
                    calculateCommission = await calculateTotalCommission(agentConnection, netAmmountAndCommission[0].net_amount,
                        netAmmountAndCommission[0].user_id, req.dbName, orderId)
                }

                console.log("111111111111111111111111111")
                let query5 = "select (SELECT value FROM " + req.dbName + ".`tbl_setting` WHERE `key` = 'is_enabled_agent_base_price' LIMIT 1) is_enabled_agent_base_price, (SELECT value FROM " + req.dbName + ".`tbl_setting` WHERE `key` = 'allow_agentwallet_to_pay_for_cashorder' LIMIT 1) allow_agentwallet_to_pay_for_cashorder,cuo.payment_type, cu.base_price,cu.delivery_charge_share from cbl_user_orders cuo left join cbl_user cu on cuo.user_id=cu.id where order_id=?";
                let result5 = await Execute.QueryAgent(agentConnection, query5, [orderId]);

                if (result5[0] && result5[0].payment_type == "0" && result5[0].allow_agentwallet_to_pay_for_cashorder && result5[0].allow_agentwallet_to_pay_for_cashorder == "1") {
                    console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", result5)

                    var agentOrderDetails = await Execute.QueryAgent(agentConnection, "SELECT (select wallet_amount from cbl_user where id=cbl_user_orders.user_id) as agent_wallet_balance, `tip_agent`, `commission_ammount`,`net_amount`, agent_base_price, agent_delivery_charge_share,user_id,(net_amount - (tip_agent + commission_ammount + agent_base_price + agent_delivery_charge_share)) amount_payable, (tip_agent + commission_ammount + agent_base_price + agent_delivery_charge_share) agent_amount FROM `cbl_user_orders` WHERE order_id=?", [orderId]);
                    console.log("ccccccccccccccccccccccccccccccc", agentOrderDetails)
                    if (agentOrderDetails[0].agent_wallet_balance < agentOrderDetails[0].amount_payable) {
                        console.log("dddddddddddddddddddddddd")
                        var message = "Delivery boy do not have enough balance in wallet";
                        return sendResponse.sendErrorMessage(message, res, 400)
                        //cb({messagemessage})
                    } else {
                        console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
                        let query1 = "update cbl_user set wallet_amount=wallet_amount-? where id=?"
                        let params1 = [agentOrderDetails[0].amount_payable, agentOrderDetails[0].user_id]
                        await Execute.QueryAgent(agentConnection, query1, params1);
                        await agentPayablePayment(req.dbName, res, agentOrderDetails[0].agent_amount, orderId, agentOrderDetails[0].user_id)
                    }
                }

                if (result5[0] && result5[0].is_enabled_agent_base_price && result5[0].is_enabled_agent_base_price == "1") {
                    var data_to_update = "";
                    if (result5[0].base_price && result5[0].base_price != "0") {
                        data_to_update = "agent_base_price='" + result5[0].base_price + "'"
                    }
                    if (result5[0].delivery_charge_share && result5[0].delivery_charge_share != "0") {
                        if (data_to_update != "") {
                            data_to_update += ","
                        }
                        data_to_update += "agent_delivery_charge_share='" + result5[0].delivery_charge_share + "'"
                    }
                    if (data_to_update != "") {
                        await Execute.QueryAgent(agentConnection, "update cbl_user_orders set " + data_to_update + " where order_id=?", [orderId]);
                        await multiConnection[req.dbName].query("update orders set " + data_to_update + " where id =?", [orderId])
                    }
                }

                // await updateAgentCommission(agentConnection,netAmmountAndCommission[0].cbl_id,calculateCommission)
                logger.debug("========final calculated commission ammoutn======", calculateCommission)
                var date10 = moment().utcOffset(offset);
                var delivered_on = date10._d;
                var sqlQuery = "update cbl_user_orders set status=?,delivered_on=?,commission_ammount=? where order_id=? ";
                //    var st=await agentConnection.query(sqlQuery,[status,delivered_on,calculateCommission,orderId],async function(err,agentData){
                //     //    console.log(st)
                //         if (err) {
                //             sendResponse.somethingWentWrongError(res);
                //         }
                //         else{
                await Execute.QueryAgent(agentConnection, sqlQuery, [status, delivered_on, calculateCommission, orderId]);
                let query1 = "select progress_on,reached_on,shipped_on,delivered_on from cbl_user_orders where order_id=?";
                //let result1 = await agentConnection.query(query1,[orderId]);
                let result1 = await Execute.QueryAgent(agentConnection, query1, [orderId]);
                if (result1 && result1.length) {
                    var update_set = []
                    if (result1[0] && result1[0].progress_on == "0000-00-00 00:00:00") {
                        update_set.push(' progress_on="' + delivered_on + '" ');
                    }
                    if (result1[0] && result1[0].reached_on == "0000-00-00 00:00:00") {
                        update_set.push(' reached_on="' + delivered_on + '" ');
                    }
                    if (result1[0] && result1[0].shipped_on == "0000-00-00 00:00:00") {
                        update_set.push(' shipped_on="' + delivered_on + '" ');
                    }
                    update_set.join(',')
                    if (update_set != "") {
                        var sql1 = 'update cbl_user_orders set ' + update_set + ' where order_id=? ';
                        //await agentConnection.query(sql1,[date,orderId]);    
                        await Execute.QueryAgent(agentConnection, sql1, [orderId]);
                    }
                }
                cb(null)
                //     }
                // });
            } else {
                cb(null)
            }
        }],
        deliveredOrder: ['changeAgentOrderStatus', function (cb) {

            orderFunction.deliveredOrder(req.dbName, res, orderId, status, offset, req.service_type, function (err, result) {
                console.log("..........err........deliver....result.........", err, result);

                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })

        }],
        payToAgentAndSupplier: ['deliveredOrder', function (cb) {
            orderFunction.payToAgentAndSupplier(req.dbName, res, orderId, function (err, result) {
                console.log("..........err........deliver....result.........", err, result);

                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            })

        }],
        //notificationData: ['deliveredOrder', function (cb) {
        notificationData: ['payToAgentAndSupplier', function (cb) {
            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                console.log(".......log.......", values);
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    userId = values.user_id;
                    req.category_id = values.category_id;
                    self_pickup = values.self_pickup;
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    userEmailId = values.email;
                    cartId = values.cart_id;
                    userName = values.userName;
                    countryCode = values.country_code;
                    mobileNumber = values.mobile_no;
                    net_amount = values.net_amount;
                    created_on = (req.dbName == '4n1deliverylive_0755') ? moment(values.created_on).format('MM/DD/YYYY hh:mm:ss a') : moment(values.created_on).format('YYYY-MM-DD HH:mm a');
                    schedule_date = (req.dbName == '4n1deliverylive_0755') ? moment(values.schedule_date).format('MM/DD/YYYY hh:mm:ss a') : moment(values.schedule_date).format('YYYY-MM-DD HH:mm a');
                    if (values.payment_type == 0) {
                        payment_type = "cash";
                    }
                    else {
                        payment_type = 'Online Transaction'
                    }
                    cb(null);
                }
            });
        }],
        updateReferToUser: ['notificationData', async function (cb) {
            try {


                let pointsPerOrder;
                let orderDetails = await Execute.Query(req.dbName, `select * from orders where id=? `, [orderId]);
                var pointEnableKey = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key` =?", ["is_loyality_point_distributed"]);
                if (pointEnableKey.length && pointEnableKey[0].value == 0) {
                    pointsPerOrder = parseFloat(orderDetails[0].net_amount);
                }
                else {
                    pointsPerOrder = 1;
                }

                let enable_min_loyality_points = await Execute.Query(req.dbName,
                    "select `key`,`value` from tbl_setting where `key`=? and `value`=?",
                    ["enable_min_loyality_points", "1"]);

                if (enable_min_loyality_points && enable_min_loyality_points.length > 0) {

                    let minOrderAmountForLoyalityPoints = await Execute.Query(req.dbName,
                        "select `key`,`value` from tbl_setting where `key`=? ",
                        ["min_order_amount_for_loyality_points"]);

                    let loyalityPointsOnOrder = await Execute.Query(req.dbName,
                        "select `key`,`value` from tbl_setting where `key`=? ",
                        ["loyality_point_per_order"]);

                    if (minOrderAmountForLoyalityPoints
                        && minOrderAmountForLoyalityPoints.length > 0) {
                        minOrderAmountForLoyalityPoints =
                            parseFloat(minOrderAmountForLoyalityPoints[0].value) || 0
                    }

                    if (loyalityPointsOnOrder
                        && loyalityPointsOnOrder.length > 0) {
                        loyalityPointsOnOrder =
                            parseFloat(loyalityPointsOnOrder[0].value) || 0

                    }

                    if (parseFloat(orderDetails[0].net_amount) >=
                        parseFloat(minOrderAmountForLoyalityPoints)) {
                        var pointEnableKey = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key` =? ", ["is_loyality_point_distributed"]);
                        if (pointEnableKey.length && pointEnableKey[0].value == 0) {

                            pointsPerOrder = parseFloat(orderDetails[0].net_amount);

                        }
                        else {
                            let totalPoints = parseFloat(orderDetails[0].net_amount) / parseInt(minOrderAmountForLoyalityPoints);
                            loyalityPointsOnOrder = parseInt(loyalityPointsOnOrder) * parseInt(totalPoints);
                            pointsPerOrder = loyalityPointsOnOrder;
                        }
                        //           let totalPoints = parseFloat(orderDetails[0].net_amount)/parseInt(minOrderAmountForLoyalityPoints);
                        //    loyalityPointsOnOrder = parseInt(loyalityPointsOnOrder)*parseInt(totalPoints);
                        //    pointsPerOrder = loyalityPointsOnOrder;

                    }
                    let pointOrderData = await Execute.Query(req.dbName, `select * from loyality_point_earning where order_id=? and is_ready_for_use=? and user_id=?`, [orderId, 0, userId]);
                    if (pointOrderData && pointOrderData.length > 0) {
                        await Execute.Query(req.dbName, `update loyality_point_earning set is_ready_for_use=1 where order_id=? and user_id=?`, [orderId, userId])
                        await Execute.Query(req.dbName, `update user set total_loyality_amount=total_loyality_amount+?,loyalty_points=loyalty_points+? where id=?`, [pointOrderData[0].earned_amount, pointsPerOrder, userId])
                    }

                    let userData = await Execute.Query(req.dbName, `select id,user_id from orders where user_id=? and status=?`, [userId, 5])
                    if (userData && userData.length > 0) {
                        cb(null)
                    }
                    else {
                        await Execute.Query(req.dbName, `update user_referral set ready_for_use=? where to_id=?`, [1, userId]);
                        cb(null)
                    }
                } else {
                    let pointOrderData = await Execute.Query(req.dbName, `select * from loyality_point_earning where order_id=? and is_ready_for_use=? and user_id=?`, [orderId, 0, userId]);
                    if (pointOrderData && pointOrderData.length > 0) {
                        await Execute.Query(req.dbName, `update loyality_point_earning set is_ready_for_use=1,earned_points=? where order_id=? and user_id=?`, [pointsPerOrder, orderId, userId])
                        await Execute.Query(req.dbName, `update user set total_loyality_amount=total_loyality_amount+?,loyalty_points=loyalty_points+? where id=?`, [pointOrderData[0].earned_amount, pointsPerOrder, userId])
                    }

                    let userData = await Execute.Query(req.dbName, `select id,user_id from orders where user_id=? and status=?`, [userId, 5])
                    if (userData && userData.length > 0) {
                        cb(null)
                    }
                    else {
                        await Execute.Query(req.dbName, `update user_referral set ready_for_use=? where to_id=?`, [1, userId]);
                        cb(null)
                    }
                }
            } catch (e) {
                cb(null)
            }
        }],
        sendUserPushNotification: ['updateReferToUser', async function (cb) {
            let clientLanguage = await Universal.getClientLanguage(req.dbName);
            let languageData = await Execute.Query(req.dbName, `SELECT language_code FROM language where id=?`, [parseInt(notificationLanguage)]);

            userLanguage = languageData && languageData.length > 0 ? languageData[0].language_code : userLanguage;
            req.userLanguage = userLanguage;
            if (clientLanguage && clientLanguage.length > 0) {
                notificationLanguage = 16
            }
            if (notificationStatus == 0) {
                cb(null)
            }
            else {
                let agent_id = 0;
                let agentOrderData = await Execute.QueryAgent(agentConnection,
                    "select * from cbl_user_orders where order_id=?", [orderId]);

                if (agentOrderData && agentOrderData.length > 0) {
                    agent_id = agentOrderData[0].user_id;
                }
                var data = {
                    "status": status,
                    "message": await Universal.getMsgText(notificationLanguage, req, status),
                    "orderId": orderId,
                    "self_pickup": self_pickup,
                    "agent_id": agent_id
                }
                if (parseInt(self_pickup) == 1) {
                    data.message = data.message.replace("delivered", "Picked Up");
                }
                pushNotifications.sendFcmPushNotification(deviceToken, data, req.dbName, function (err, result) {
                    console.log(".........errrrrrr.......", err, result);
                    if (err) {
                        console.log("err2", err);
                        cb(null)
                    } else {
                        cb(null);
                    }
                });
            }

        }],
        savePushNotification: ['sendUserPushNotification', async function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                let message = await Universal.getMsgText(notificationLanguage, req, status)
                if (parseInt(self_pickup) == 1) {
                    message = message.replace("delivered", "Picked Up");
                }
                if (notificationLanguage == 14) {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
                else {
                    if (status == 1) {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_ACCEPTED, message, cb)
                    }
                    else {
                        adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_REJECTED, message, cb)
                    }
                }
            }
        }],
        sendMail: ['savePushNotification', async function (cb) {
            let isMultipleOrderAssingedOnce = await Execute.Query(req.dbName, "select `key`,`value` from tbl_setting where `key`=? and `value`=?", ["assigned_multiple_order_once_after_confimation", "1"]);

            if (isMultipleOrderAssingedOnce && isMultipleOrderAssingedOnce.length > 0) {
                let _orderData = [];
                let totalOrderInCart = await Execute.Query(req.dbName, "select ors.id from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=? ", [cartId]);

                let totalOrderInCartWithStatusChange = await Execute.Query(req.dbName, "select ors.id from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=?  and (ors.status=5 or ors.status=2 or ors.status=8)", [cartId]);

                let SupplierNameOrderNumber = await Execute.Query(req.dbName, "select GROUP_CONCAT(s.name) as supplierName,GROUP_CONCAT(ors.id) as order_ids from orders ors join supplier_branch sb on sb.id=ors.supplier_branch_id join supplier s on s.id=sb.supplier_id where ors.cart_id=?", [cartId]);

                console.log("====totalOrderInCart===totalOrderInCartWithStatusChange=", totalOrderInCart, totalOrderInCartWithStatusChange)
                if (totalOrderInCart.length == totalOrderInCartWithStatusChange.length) {

                    let orderSql = "select IFNULL(ors.agent_verification_code,0) as agent_verification_code,ors.wallet_discount_amount,ors.supplier_branch_id, usr.email as customer_email,IFNULL(CONCAT(usr.firstname,usr.lastname),'') AS customer_name,IFNULL(ors.pres_description,'') AS pres_description,ors.have_coin_change,ors.buffer_time, " +
                        "ors.no_touch_delivery,ors.drop_off_date_utc,ors.drop_off_date,sp.id as supplier_id,sp.latitude as supplier_latitude,sp.longitude as supplier_longitude,ors.user_service_charge,sp.name as supplier_name,ors.created_on,ors.schedule_date as delivery_date,ors.schedule_date as delivered_on,usr.mobile_no as customer_phone_number,usr.user_image as customer_image ,CAST(usr.id as CHAR(50)) as customer_id," +
                        " spb.name as supplier_branch_name,spb.address as supplier_branch_address,spb.latitude as supplier_branch_latitude,spb.longitude as supplier_branch_longitude,ors.promo_discount,ors.promo_code,ors.payment_type,IFNULL(ors.comment, '') as comment,ors.remarks,ors.urgent_price," +
                        " ors.urgent,ors.tip_agent,ors.net_amount,ors.delivery_charges,ors.handling_supplier," +
                        " ors.handling_admin,CAST(ors.id AS CHAR) as order_id " +
                        " from orders ors join order_prices op on op.order_id=ors.id join supplier inner join" +
                        " supplier_branch spb on spb.id=op.supplier_branch_id inner join supplier sp " +
                        " on sp.id=spb.supplier_id inner join user usr on usr.id=ors.user_id where ors.id IN (" + SupplierNameOrderNumber[0].order_ids + ") group by ors.id";
                    let _oData = await Execute.Query(req.dbName, orderSql, []);


                    let orderItemSql = "select spb.name as supplier_branch_name,spb.address as supplier_branch_address,spb.latitude,spb.longitude,op.handling_admin,op.id as order_price_id,op.order_id,op.quantity,op.price,op.product_id as item_id,op.product_name as item_name, " +
                        " op.product_reference_id,op.product_dimensions,op.product_upload_reciept,op.product_owner_name,op.product_desc as item_desc,op.product_name as item_name,op.image_path from order_prices op left join supplier_branch spb on spb.id=op.supplier_branch_id where op.order_id IN(" + SupplierNameOrderNumber[0].order_ids + ")"
                    let orderItemData = await Execute.Query(req.dbName, orderItemSql, []);

                    if (_oData && _oData.length > 0) {

                        let accountOrderObj = {
                            "netAmount": 0,
                            "subTotal": 0,
                            "deliveryCharges": 0,
                            "agentTip": 0,
                            "tax": 0,
                            "cartProcessingFee": 0
                        }
                        let subTotal = 0, subTotalOfAllOrders = 0;
                        let tax = 0, deliveryCharge = 0, agentTip = 0, cartProcessingFee = 0
                        let orderItem = []
                        for (const [index, i] of _oData.entries()) {
                            subTotal = 0;
                            orderItem = [];
                            let ordObj = {
                                tax: i.handling_admin,
                                supplierName: i.supplier_name,
                            }

                            for (const [inex_1, j] of orderItemData.entries()) {

                                if (parseInt(j.order_id) == parseInt(i.order_id)) {
                                    orderItem.push(j)
                                    subTotal = subTotal + (parseFloat(j.price) * parseInt(j.quantity));
                                }
                            }
                            ordObj["items"] = orderItem;
                            subTotalOfAllOrders = subTotalOfAllOrders + subTotal;
                            tax = tax + i.handling_admin
                            agentTip = agentTip + i.tip_agent;
                            deliveryCharge = deliveryCharge + i.delivery_charges;
                            cartProcessingFee = cartProcessingFee + i.user_service_charge;
                            ordObj["subTotal"] = subTotal;
                            _orderData.push(ordObj);

                            if (index == (_oData.length - 1)) {

                                accountOrderObj["subTotal"] = subTotalOfAllOrders;
                                accountOrderObj["agentTip"] = agentTip;
                                accountOrderObj["tax"] = tax;
                                accountOrderObj["deliveryCharges"] = deliveryCharge;
                                accountOrderObj["cartProcessingFee"] = cartProcessingFee;
                                accountOrderObj["netAmount"] = accountOrderObj["subTotal"] + accountOrderObj["agentTip"] + accountOrderObj["tax"] + accountOrderObj["deliveryCharges"] + accountOrderObj["cartProcessingFee"];
                                console.log("===accountOrderObj==_orderData==>", accountOrderObj, _orderData)
                                emailTemp.deliverOrderV1(self_pickup, req, req.dbName, res, '', userName, net_amount, created_on, schedule_date, orderId, supplierName, supplierName, payment_type, userEmailId, notificationLanguage, _orderData, accountOrderObj, function (err, result) {
                                    if (err) {
                                        console.log("..****fb register email*****....", err);
                                    } else {
                                        cb(null);
                                    }
                                })
                            }


                        }


                    }




                }

                else {

                    emailTemp.deliverOrder(self_pickup, req, req.dbName, res, '', userName, net_amount, created_on, schedule_date, orderId, supplierName, supplierName, payment_type, userEmailId, notificationLanguage, function (err, result) {
                        if (err) {
                            console.log("..****fb register email*****....", err);
                        } else {
                            cb(null);
                        }
                    })

                }



            }
            else {
                let sql = 'select o.self_pickup, o.handling_admin,  CONCAT(ua.country_code,ua.phone_number) as phoneNumber,  ua.name as customer_name,  CONCAT( ua.address_line_1,", ",ua.customer_address) as customer_address ,  o.self_pickup,  o.delivery_charges, o.promo_discount,o.status, o.net_amount, p.id,op.price,p.bar_code,op.quantity,p.measuring_unit,p.name,pi.image_path from order_prices op join product p on ' +
                    'op.product_id =p.id join product_image pi on pi.product_id =p.id join  orders o on o.id = op.order_id left join user_address ua on ua.id=o.user_delivery_address where op.order_id = ?  group by pi.product_id '
                let result = await Execute.Query(req.dbName, sql, [orderId])
                let orderDetails = result;
                emailTemp.deliverOrder(self_pickup, req, req.dbName, res, '', userName, net_amount, created_on, schedule_date, orderId, supplierName, supplierName, payment_type, userEmailId, notificationLanguage, orderDetails, function (err, result) {
                    if (err) {
                        console.log("..****fb register email*****....", err);
                    } else {
                        cb(null);
                    }
                })
            }
        }],

        sendTextMsgToUser: ['sendMail', async function (cb) {

            let twiliodata = await Universal.getTwilioData(req.dbName);
            let allowTextMsgOnStatusChange = await Execute.Query(req.dbName,
                "select `key`,value from tbl_setting where `key`=? and value=1",
                ["allowTextMsgOnStatusChange"]
            )
            let bandWidthData = await Universal.getBandwidthData(req.dbName);
            let notification_message = await Universal.getMsgText(notificationLanguage, req, status)
            let semaphoreData = await Universal.getSemaPhoreData(req.dbName);


            if (Object.keys(twiliodata).length > 0 && allowTextMsgOnStatusChange.length > 0) {

                var client = require('twilio')(twiliodata[config.get("twilio.s_id")], twiliodata[config.get("twilio.auth_key")]);
                var smsOptions = {
                    from: twiliodata[config.get("twilio.number_key")],
                    to: countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    body: notification_message
                };
                logger.debug("=====smsOptions=>>==", smsOptions)
                client.messages.create(smsOptions, function (err, message) {
                    console.log("=========Twilio==ER!==", err, message)
                    cb(null);
                });
            } else if (Object.keys(bandWidthData).length > 0
                && allowTextMsgOnStatusChange.length > 0) {

                await smsManager.bandwidth(notification_message,
                    countryCode + mobileNumber.toString().replace(/\s/g, ''),
                    bandWidthData.bandwidth_basic_auth_user_name,
                    bandWidthData.bandwidth_basic_auth_password,
                    bandWidthData.bandwidth_application_id,
                    bandWidthData.bandwidth_user_id,
                    bandWidthData.bandwidth_from_number
                )
                cb(null)
            } else if (Object.keys(semaphoreData).length > 0 &&
                allowTextMsgOnStatusChange.length > 0) {
                await Universal.sendSemaphoreMessage(
                    semaphoreData.semaphore_apikey,
                    semaphoreData.semaphore_sendername,
                    message,
                    mobileNumber.toString().replace(/\s/g, '')
                )
            } else {
                logger.debug("=============keys not found========", twiliodata);
                cb(null)
            }
        }]
    }, function (err, result) {
        if (err) {
            console.log("...............err.......final...........", err);
            sendResponse.somethingWentWrongError(res);
        } else {
            data = [];
            console.log(".........final..........callback..................");
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


function agentPayablePayment(dbName, res, totalAmount, order_Id, agentId) {

    return new Promise((resolve, reject) => {

        async.auto({
            update: async function (cb) {
                let getAgentDbData = await common.GetAgentDbInformation(dbName);
                let agentConnection = await common.RunTimeAgentConnection(getAgentDbData);

                var amount = parseFloat(totalAmount);
                var orderId = parseInt(order_Id);
                var user_id = parseInt(agentId);
                var transaction_mode = 1;

                var selSql = "select tip_agent, waiting_charges, commission_ammount, agent_base_price, agent_delivery_charge_share, delivery_charges from cbl_user_orders where user_id = '" + user_id + "' and order_id = '" + orderId + "'";
                let orderExistingDetails = await Execute.QueryAgent(agentConnection, selSql, []);
                var tip_agent = orderExistingDetails[0].tip_agent;
                var total_amount = amount;
                var total_paid = amount;
                var total_left = 0;
                var waiting_charges = orderExistingDetails[0].waiting_charges;
                var delivery_charges = orderExistingDetails[0].delivery_charges;
                var commission_ammount = orderExistingDetails[0].commission_ammount;
                var agent_base_price = orderExistingDetails[0].agent_base_price;
                var agent_delivery_charge_share = orderExistingDetails[0].agent_delivery_charge_share;
                var status = 1;
                sql = "INSERT INTO `cbl_account_payable_order` (`user_id`, `tip_agent`, `order_id`, `total_amount`, `total_paid`, `total_left`, `status`, `transaction_mode`, `waiting_charges`,`commission_ammount`, `delivery_charges`,`agent_base_price`, `agent_delivery_charge_share`) VALUES ('" + user_id + "', '" + tip_agent + "', '" + orderId + "', '" + total_amount + "', '" + total_paid + "', '" + total_left + "', '" + status + "', '" + transaction_mode + "', '" + waiting_charges + "', '" + commission_ammount + "', '" + delivery_charges + "', '" + agent_base_price + "', '" + agent_delivery_charge_share + "')";

                await Execute.QueryAgent(agentConnection, sql, []);
                cb(null);

            }
        }, function (err, result) {
            if (err) {
                reject(err)
            }
            else {
                resolve(result)
            }
        });





    })

}
async function getOrderNetAmmountAndCommission(agentConnection, orderId) {
    var sql = "select cuo.delivery_charges,cu.name,(cuo.net_amount-cuo.wallet_discount_amount) as net_amount,cu.id as user_id,cu.commission,cu.agent_commission_type," +
        "cuo.id as cbl_id ,cuo.user_id,cuo.order_id from cbl_user cu  join " +
        "cbl_user_orders cuo on cu.id = cuo.user_id where cuo.order_id = ?"
    return new Promise(async (resolve, reject) => {
        try {
            var res_data = await Execute.QueryAgent(agentConnection, sql, [orderId]);
            resolve(res_data)
        } catch (err) {
            logger.debug("=======err!!=====", err)
            reject(err)
        }

    })
}

async function getCommissionPercentageForBlockTime(agentConnection, orderId, dbName) {

    return new Promise(async (resolve, reject) => {
        try {
            let query = "select created_on from orders where id=?"
            let result = await Execute.Query(dbName, query, orderId);

            let bookingTime = moment(new Date(result[0].created_on)).format('HH:mm:ss');

            let bookingDate = moment(result[0].created_on).format('YYYY-MM-DD');

            let blockTimeDetails = await Execute.QueryAgent(agentConnection,
                ` select * from cbl_user_block_times where blockDate<="${bookingDate}" and blockEndDate>="${bookingDate}"
                    and blockTime<="${bookingTime}" and blockEndTime>="${bookingTime}" `, [])

            resolve(blockTimeDetails)
        } catch (err) {
            logger.debug("=======err!!=====", err)
            reject(err)
        }

    })
}

async function calculateTotalCommission(agentConnection, net_amount, user_id, dbName, orderId) {
    var sql = "select commission,agent_commission_type from cbl_user where id = ?"
    return new Promise(async (resolve, reject) => {
        try {
            var res_data = await Execute.QueryAgent(agentConnection, sql, [user_id]);

            let blockTimeCommissionDetails = await getCommissionPercentageForBlockTime(agentConnection, orderId, dbName);

            logger.debug("=============agent_commission_type=====", blockTimeCommissionDetails)
            let commission = res_data[0].commission
            let totalAmmount = 0;


            if (blockTimeCommissionDetails && blockTimeCommissionDetails.length > 0) {
                commission = blockTimeCommissionDetails[0].block_time_commission
            }

            if (res_data[0].agent_commission_type !== 0) {
                totalAmmount = commission
            } else {

                totalAmmount = (commission / 100) * net_amount
            }
            logger.debug("----------net ammount -------------", totalAmmount)
            resolve(totalAmmount);
        } catch (err) {
            logger.debug("=====eerr!!=====calculateTotalCommission=====", err)
            reject(err)
        }
    })
}

async function updateAgentCommission(agentConnection, cbl_id, commissionAmmount) {
    var sql = "update cbl_user_orders set commission_ammount=? where id=?"
    return new Promise(async (resolve, reject) => {
        try {
            var update_data = await Execute.QueryAgent(agentConnection, sql, [commissionAmmount, cbl_id]);
            resolve();
        } catch (err) {
            logger.debug("=======err in updateAgentCommission========", err)
            reject(err)
        }
    })
}


exports.ordersTracked = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId = 0;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        trackedOrders: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            adminOrders.trackedOrders(req.dbName, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.mumybenePaymentStatus = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId = 0;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.paymentReference) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                paymentReference = req.body.paymentReference;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        getPaymentStatus: ['blankField', 'authenticate', 'checkauthority', async function (cb) {
            let mumybene_key_data = await Universal.getMumybeneKeyData(req.dbName);
            if (mumybene_key_data) {
                var mumybene_username = mumybene_key_data[config.get("payment.mumybene.mumybene_username")]
                var mumybene_password = mumybene_key_data[config.get("payment.mumybene.mumybene_password")]
                var baseUrl = "http://test.543.cgrate.co.zm:55555/Konik/KonikWs"

                let xml = `<soapenv:Envelope
                    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:kon="http://konik.cgrate.com">
                    <soapenv:Header xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                        <wsse:Security xmlns:mustUnderstand="1">
                            <wsse:UsernameToken xmlns:Id="UsernameToken-1" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                                <wsse:Username xmlns="http://konik.cgrate.com">`+ mumybene_username + `</wsse:Username>
                                <wsse:Password xmlns:Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">`+ mumybene_password + `</wsse:Password>
                            </wsse:UsernameToken>
                        </wsse:Security>
                    </soapenv:Header>
                    <soapenv:Body>
                    <kon:queryCustomerPayment>
                    <paymentReference>`+ paymentReference + `</paymentReference>
                    </kon:queryCustomerPayment>
                    </soapenv:Body>
                    </soapenv:Envelope>`;
                var options = {
                    method: 'POST',
                    url: baseUrl,
                    headers: {
                        'Content-Type': 'text/xml;charset=utf-8',
                        'Accept-Encoding': 'gzip,deflate',
                        'Content-Length': xml.length
                    },
                    body: xml
                };

                web_request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
                    if (error) {
                        sendResponse.somethingWentWrongError(res);
                    } else if (!error && response.statusCode == 200) {
                        var xml2js = require('xml2js');
                        var parser = new xml2js.Parser({ explicitArray: false, trim: true });
                        parser.parseString(body, (err, result) => {
                            var responseCode = result['env:Envelope']['env:Body']['ns2:queryCustomerPaymentResponse']['return']['responseCode']
                            var paymentID = result['env:Envelope']['env:Body']['ns2:queryCustomerPaymentResponse']['return']['paymentID']
                            var responseMessage = result['env:Envelope']['env:Body']['ns2:queryCustomerPaymentResponse']['return']['responseMessage']
                            data = {
                                responseCode: responseCode,
                                responseMessage: responseMessage,
                                paymentID: paymentID,
                            };
                            cb(null);
                        });
                    } else {
                        sendResponse.somethingWentWrongError(res);
                    }
                });
            }
            else {
                sendResponse.somethingWentWrongError(res);
            }

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}



exports.mumybeneReversePayment = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId = 0;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.paymentReference) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                paymentReference = req.body.paymentReference;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        reversePayment: ['blankField', 'authenticate', 'checkauthority', async function (cb) {
            let mumybene_key_data = await Universal.getMumybeneKeyData(req.dbName);
            if (mumybene_key_data) {
                var mumybene_username = mumybene_key_data[config.get("payment.mumybene.mumybene_username")]
                var mumybene_password = mumybene_key_data[config.get("payment.mumybene.mumybene_password")]
                var baseUrl = "http://test.543.cgrate.co.zm:55555/Konik/KonikWs"

                let xml = `<soapenv:Envelope
                    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:kon="http://konik.cgrate.com">
                    <soapenv:Header xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                        <wsse:Security xmlns:mustUnderstand="1">
                            <wsse:UsernameToken xmlns:Id="UsernameToken-1" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                                <wsse:Username xmlns="http://konik.cgrate.com">`+ mumybene_username + `</wsse:Username>
                                <wsse:Password xmlns:Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">`+ mumybene_password + `</wsse:Password>
                            </wsse:UsernameToken>
                        </wsse:Security>
                    </soapenv:Header>
                    <soapenv:Body>
                    <kon:reverseCustomerPayment>
                    <paymentReference>`+ paymentReference + `</paymentReference>
                    </kon:reverseCustomerPayment>
                    </soapenv:Body>
                    </soapenv:Envelope>`;
                var options = {
                    method: 'POST',
                    url: baseUrl,
                    headers: {
                        'Content-Type': 'text/xml;charset=utf-8',
                        'Accept-Encoding': 'gzip,deflate',
                        'Content-Length': xml.length
                    },
                    body: xml
                };

                web_request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
                    if (error) {
                        sendResponse.somethingWentWrongError(res);
                    } else if (!error && response.statusCode == 200) {
                        var xml2js = require('xml2js');
                        var parser = new xml2js.Parser({ explicitArray: false, trim: true });
                        parser.parseString(body, (err, result) => {
                            var responseCode = result['env:Envelope']['env:Body']['ns2:reverseCustomerPaymentResponse']['return']['responseCode']
                            var responseMessage = result['env:Envelope']['env:Body']['ns2:reverseCustomerPaymentResponse']['return']['responseMessage']
                            data = {
                                responseCode: responseCode,
                                responseMessage: responseMessage
                            };
                            cb(null);
                        });
                    } else {
                        sendResponse.somethingWentWrongError(res);
                    }
                });
            }
            else {
                sendResponse.somethingWentWrongError(res);
            }

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}




exports.mumybeneAccountBalance = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId = 0;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });

        }],
        getAccountBalance: ['blankField', 'authenticate', 'checkauthority', async function (cb) {
            let mumybene_key_data = await Universal.getMumybeneKeyData(req.dbName);
            if (mumybene_key_data) {
                var mumybene_username = mumybene_key_data[config.get("payment.mumybene.mumybene_username")]
                var mumybene_password = mumybene_key_data[config.get("payment.mumybene.mumybene_password")]
                var baseUrl = "http://test.543.cgrate.co.zm:55555/Konik/KonikWs"

                let xml = `<soapenv:Envelope
                    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:kon="http://konik.cgrate.com">
                    <soapenv:Header xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                        <wsse:Security xmlns:mustUnderstand="1">
                            <wsse:UsernameToken xmlns:Id="UsernameToken-1" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                                <wsse:Username xmlns="http://konik.cgrate.com">`+ mumybene_username + `</wsse:Username>
                                <wsse:Password xmlns:Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">`+ mumybene_password + `</wsse:Password>
                            </wsse:UsernameToken>
                        </wsse:Security>
                    </soapenv:Header>
                    <soapenv:Body>
                    <getAccountBalance xmlns="http://konik.cgrate.com"></getAccountBalance>
                    </soapenv:Body>
                    </soapenv:Envelope>`;
                var options = {
                    method: 'POST',
                    url: baseUrl,
                    headers: {
                        'Content-Type': 'text/xml;charset=utf-8',
                        'Accept-Encoding': 'gzip,deflate',
                        'Content-Length': xml.length
                    },
                    body: xml
                };

                web_request(options, async function (error, response, body) { //0,1,6,7,48,62,63,75,565
                    console.log("body-- ------ ---", body)
                    if (error) {
                        sendResponse.somethingWentWrongError(res);
                    } else if (!error && response.statusCode == 200) {
                        var xml2js = require('xml2js');
                        var parser = new xml2js.Parser({ explicitArray: false, trim: true });
                        parser.parseString(body, (err, result) => {
                            console.log("result ------- ", result)
                            var responseCode = result['env:Envelope']['env:Body']['ns2:getAccountBalanceResponse']['return']['responseCode']
                            if (responseCode == "0") {
                                var balance = result['env:Envelope']['env:Body']['ns2:getAccountBalanceResponse']['return']['balance']
                                data = {
                                    responseCode: responseCode,
                                    balance: balance
                                };
                                cb(null);
                            } else {
                                var responseMessage = result['env:Envelope']['env:Body']['ns2:getAccountBalanceResponse']['return']['responseMessage']
                                return sendResponse.sendErrorMessage(responseMessage, reply, 400);
                            }
                        });
                    } else {
                        sendResponse.somethingWentWrongError(res);
                    }
                });
            }
            else {
                sendResponse.somethingWentWrongError(res);
            }

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.updateTrackedOrder = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId = 0;
    var orderId = 0;
    var date = 0;
    var status = 0;
    var data;
    var deviceToken = 0;
    var userId = 0;
    var deviceType = 0;
    var supplierId = 0;
    var supplierName = 0;
    var notificationStatus;
    var notificationLanguage;
    var message;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.date && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                date = req.body.date;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    cb(null);
                }
            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    cb(null);
                }
            });
        }],
        updateTrackedOrder: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            orderFunction.updateOrder(req.dbName, res, status, orderId, date, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }],
        notificationData: ['updateTrackedOrder', function (cb) {
            adminOrders.getValue(req.dbName, res, orderId, function (err, values) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    deviceToken = values.device_token;
                    userId = values.user_id;
                    req.category_id = values.category_id;
                    deviceType = values.device_type;
                    supplierId = values.supplier_id;
                    supplierName = values.supplier_name;
                    notificationLanguage = values.notification_language;
                    notificationStatus = values.notification_status;
                    cb(null);
                }
            });
        }],
        sendPushNotification: ['notificationData', function (cb) {

            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                if (deviceType == 0) {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": 0,
                            "message": "Your Order Expected Delivery time: " + date,
                            "orderId": orderId

                            // "data": {"supplier_name": supplierName}
                        }
                    }
                    else {
                        var data = {
                            "status": 0,
                            "message": date + " تم تحديث وقت توصيل الطلب الى: ",
                            "orderId": orderId


                            //  "data": {"supplier_name": supplierName}
                        }
                    }

                    message = data.message;

                    pushNotifications.sendAndroidPushNotification(deviceToken, data, function (err, result) {
                        if (err) {
                            cb(null);
                        }
                        else {
                            cb(null);
                        }

                    });
                }
                else {
                    if (notificationLanguage == 14) {
                        var data = {
                            "status": 0,
                            "message": "Your Order Expected Deleivery time: " + date,
                            "orderId": orderId
                        }
                    }
                    else {
                        var data = {
                            "status": 0,
                            "message": date + "موعد توصيل طلبك المتوقع هو ",
                            "orderId": orderId
                        }
                    }
                    var path = "user";
                    var sound = "ping.aiff";
                    pushNotifications.sendIosPushNotification(deviceToken, data, path, sound, function (err, result) {
                        if (err) {
                            cb(null)
                        } else {
                            cb(null);
                        }
                    });
                }
            }
        }],
        savePushNotification: ['sendPushNotification', function (cb) {
            if (notificationStatus == 0) {
                cb(null);
            }
            else {
                if (notificationLanguage == 14) {
                    adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_TRACKED, constant.pushNotificationMessage.ORDER_TRACKED_ENGLISH, cb)
                }
                else {
                    adminOrders.saveNoticationData(req.dbName, res, userId, supplierId, orderId, constant.pushNotificationStatus.ORDER_TRACKED, constant.pushNotificationMessage.ORDER_TRACKED_ARABIC, cb)
                }

            }
        }],
        /* sendAdminMail:['savePushNotification',function(cb){
             emailTemp.trackOrder(res,AdminMail,orderId,date,function(err,result){
                 if(err){
                     console.log("..****fb register email*****....",err);
                 }
             })
             cb(null)
         }],*/
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.rateCommentListing = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        rateComment: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            loginFunction.rateCommentListing(req.dbName, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.approveRateComment = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = -1;
    var adminId;
    var data;
    async.auto({
        blankField: function (cb) {
            logger.debug("======================in the blankfield=================")
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                logger.debug("======================in the blankfield== if part ===============")
                cb(null);
            }
            else {
                logger.debug("======================in the blankfield==== else part =============")
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                logger.debug("======================in the authenticateAccessToken=================")
                if (err) {
                    logger.debug("======================in the authenticateAccessToken===== if part ============")

                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    logger.debug("======================in the authenticateAccessToken==== else part =============")

                    adminId = result;
                    //  console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                logger.debug("======================in the checkforAuthorityofThisAdmin=================")

                if (err) {
                    logger.debug("======================in the checkforAuthorityofThisAdmin== if part ===============")

                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    logger.debug("======================in the checkforAuthorityofThisAdmin===== else part ============")

                    // console.log("checkauthority complete");
                    cb(null);
                }
            });
        }],
        approveRateComment: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            logger.debug("======================in the checkforAuthorityofThisAdmin=================")

            if (status == 1) {
                logger.debug("======================in the checkforAuthorityofThisAdmin=====if part ============")

                approveRateComment(req.dbName, res, adminId, status, orderId, function (err, result) {
                    logger.debug("======================in the approveRateComment=================")

                    if (err) {
                        logger.debug("======================in the approveRateComment=====if part============")

                        cb(err);
                    }
                    else {
                        logger.debug("======================in the approveRateComment=====else part============")

                        data = [];
                        cb(null);
                    }
                })
            } else {
                diapproveComment(req.dbName, adminId, status, orderId, function (err, result) {
                    logger.debug("=======================in the diapproveComment=========================")
                    if (err) {
                        logger.debug("=======================in the diapproveComment=========if part================")
                        cb(err);
                    } else {
                        logger.debug("=======================in the diapproveComment======else part ===================")
                        cb(null);
                    }
                })
            }
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

var diapproveComment = function (dbName, adminId, status, orderId, callback) {
    var sql = "update orders SET CommentApprove = ? where id = ?"
    multiConnection[dbName].query(sql, [2, orderId], function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null);
        }
    })
}

exports.feedbackList = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        totalFeedback: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            loginFunction.feedbackList(req.dbName, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
                    // console.log('data----', result);
                    cb(null);
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.readFeedback = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var orderId = 0;
    var status = -1;
    var adminId;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId && req.body.orderId && req.body.status) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                orderId = req.body.orderId;
                status = req.body.status;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        readFeedback: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            readFeedback(req.dbName, res, status, adminId, orderId, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = [];
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
}

exports.scheduledOrder = function (req, res) {
    var accessToken = 0;
    var sectionId = 0;
    var adminId;
    var data;
    async.auto({
        blankField: function (cb) {
            if (req.body && req.body.accessToken && req.body.authSectionId) {
                accessToken = req.body.accessToken;
                sectionId = req.body.authSectionId;
                cb(null);
            }
            else {
                sendResponse.parameterMissingError(res);
            }
        },
        authenticate: ['blankField', function (cb) {
            func.authenticateAccessToken(req.dbName, accessToken, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    adminId = result;
                    //  console.log("adminId:  ", adminId);
                    cb(null);
                }

            }, 1)
        }],
        checkauthority: ['authenticate', function (cb) {
            func.checkforAuthorityofThisAdmin(req.dbName, adminId, sectionId, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    //   console.log("checkauthority complete");
                    cb(null);
                }
            });

        }],
        scheduleOrderList: ['blankField', 'authenticate', 'checkauthority', function (cb) {
            loginFunctions.adminScheduleOrdersList(req.dbName, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
                    // console.log('data----', result);
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

        }
    })
}

exports.trackedOrders = function (db_name, res, callback) {
    var product = [];
    var results = [];
    var cate = [];
    async.auto({
        orders: function (cb) {
            var sql = 'select o.info,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id ' +
                'join user u on o.user_id=u.id where o.status= ?';
            multiConnection[db_name].query(sql, [7], function (err, orders) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);
                }
                else if (orders.length) {
                    results = orders;
                    //   console.log('asdf------', results);
                    cb(null);
                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                }
            })
        },
        product: ['orders', function (cb) {
            var sql2 = 'select op.order_id,op.product_name from order_prices op';
            multiConnection[db_name].query(sql2, function (err, product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for (var i = 0; i < results.length; i++) {

                        (function (i) {
                            product = [];
                            for (var j = 0; j < product1.length; j++) {

                                (function (j) {
                                    if (product1[j].order_id == results[i].id) {
                                        product.push(product1[j].product_name)
                                        if (j == product1.length - 1) {
                                            results[i].product = product;
                                        }
                                    }
                                    else {
                                        if (j == product1.length - 1) {
                                            results[i].product = product;
                                        }
                                    }
                                }(j));

                            }
                            if (i == results.length - 1) {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category: ['product', function (cb) {
            var sql3 = 'select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            multiConnection[db_name].query(sql3, function (err, cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for (var i = 0; i < results.length; i++) {

                        (function (i) {
                            cate = [];
                            for (var j = 0; j < cat.length; j++) {
                                (function (j) {
                                    if (cat[j].order_id == results[i].id) {
                                        cate.push(cat[j].name);
                                        if (j == cat.length - 1) {
                                            results[i].category = cate;
                                        }
                                    }
                                    else {
                                        if (j == cat.length - 1) {
                                            results[i].category = cate;
                                        }
                                    }
                                }(j));
                            }
                            if (i == results.length - 1) {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    }, function (err, data) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            data = results;
            console.log('final1====', data);
            callback(null, data)
        }
    })

}

function approveRateComment(dbName, res, adminId, status, rateId, callback) {

    var flag = 0;
    var data;
    var total_rating;
    var review;
    var totalUser, rating_total;

    async.auto({
        approveRate: function (cb) {
            var sql = 'Update orders set  CommentApprove = ? where id = ?';
            var stat = multiConnection[dbName].query(sql, [1, rateId], function (err, approved) {
                if (err) {
                    logger.debug("=============error in approveRate 1===========", stat.sql, err);
                    cb(err);
                }
                else {
                    if (approved.affectedRows > 0) {
                        flag = 1;
                        cb(null);
                    }
                    else {
                        var data = [];
                        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                    }
                }
            })
        },
        getSupplierDetails: ['approveRate', function (cb) {
            if (flag == 1) {
                var sql = "select o.user_id,o.comment,o.rating,s.rating_total,s.total_rating_by_user,s.id,s.total_reviews,s.rating as supplier_rating from orders o join supplier_branch sb on o.supplier_branch_id = sb.id join " +
                    "  supplier s on s.id = sb.supplier_id where o.id = ?"
                var stat2 = multiConnection[dbName].query(sql, [rateId], function (err, result) {
                    if (err) {
                        logger.debug("=============error in approveRate 2===========", stat2.sql, err);
                        cb(err)
                    }
                    else {
                        if (result.length) {

                            console.log(".result.......................db value..........", result);
                            total_rating = result[0].supplier_rating;
                            review = result[0].total_reviews;
                            totalUser = result[0].total_rating_by_user;
                            rating_total = result[0].rating_total;
                            data = result[0];
                            cb(null);
                        } else {
                            cb("***************some thing went wrong ************************");
                        }
                    }
                })
            } else {
                cb(null);
            }
        }],
        supplierComment: ['getSupplierDetails', function (cb) {
            if (flag == 1) {
                console.log("......rateId....", rateId);
                var sql = "insert into supplier_rating(supplier_id,user_id,rating,comment,is_deleted,is_approved,approved_by) values(?,?,?,?,?,?,?)";
                var stat3 = multiConnection[dbName].query(sql, [data.id, data.user_id, data.rating, data.comment, 0, 1, rateId], function (err, result) {
                    if (err) {
                        logger.debug("=============error in approveRate 3===========", stat3.sql, err);
                        cb(err);
                    }
                    else {

                        cb(null);
                    }
                })
            } else {
                cb(null);
            }
        }],
        updateSupplierRating: ['supplierComment', function (cb) {
            if (data.comment != '' || data.comment != null || data.comment != 0) {
                console.log(".in if condition");
                review = parseInt(review) + parseInt(1)
            } else {
                console.log(".in else condition");
                review = parseInt(review)
            }


            var temp = rating_total;
            rating_total = rating_total + parseInt(data.rating);
            console.log(".......totalUser * total_rating.....", temp);

            temp = parseInt(temp) + parseInt(data.rating);
            console.log(".......parseInt(temp) + parseInt(data.rating).....", temp);

            totalUser = parseInt(totalUser) + parseInt(1);
            console.log("......parseInt(totalUser) + parseInt(1).....", totalUser);


            var avg = parseInt(temp) / parseInt(totalUser);
            console.log("......parseInt(temp) / parseInt(totalUser).....", avg);

            avg = parseInt(avg);

            var sql = 'Update supplier set  total_reviews = ?, rating = ? , total_rating_by_user = ?,rating_total =? where id = ?';
            var stat4 = multiConnection[dbName].query(sql, [review, avg, totalUser, rating_total, data.id], function (err, approved) {
                console.log(".................nbgfnhmgj,fhg,k.k,.kj..........", err, approved);
                if (err) {
                    logger.debug("=============error in approveRate 4===========", stat4.sql, err);
                    cb(err);
                } else {
                    cb(null);
                }
            })
        }]
    }, function (err, result) {
        if (err) {
            callback(err)
        } else {
            callback(null);
        }
    })
}

function readFeedback(dbName, res, adminId, status, orderId, callback) {
    console.log("dd", adminId, status, orderId);
    var sql = 'update orders set is_read=?,read_by=? where id =  ? AND status = 6 ';
    multiConnection[dbName].query(sql, [status, adminId, orderId], function (err, approved) {
        if (err) {
            console.log('error------', err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            if (approved.affectedRows > 0) {
                callback(null);
            }
            else {
                var data = [];
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);

            }

        }
    })

}

exports.saveNoticationData = async function (dbName, res, userId, supplierId, orderId, status, message, callback) {
    try {
        var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status) values(?,?,?,?,?) ";
        await Execute.Query(dbName, sql, [userId, supplierId, orderId, message, status]);
        callback(null);
    }
    catch (Err) {
        logger.debug("===Err!==", Err);
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "insert into push_notifications(user_id,supplier_id,order_id,notification_message,notification_status) values(?,?,?,?,?) ";

    // let stmt = multiConnection[dbName].query(sql, [userId, supplierId, orderId, message, status], function (err, result) {
    //     logger.debug("===============stmt of save notif=======",stmt.sql);
    //     if (err) {
    //         console.log("err....",err);
    //         sendResponse.somethingWentWrongError(res);
    //     }
    //     else {
    //         callback(null);
    //     }
    // })
}

exports.getValue = async function (dbName, res, orderId, callback) {
    try {

        var sql = `select ors.*,o.cart_id,o.is_dine_in,o.delivery_charges,o.handling_admin,o.user_delivery_address,s.address as supplier_address,sbp.category_id,o.self_pickup,o.payment_type,o.schedule_date,o.created_on,o.net_amount,
    s.supplier_id as supplier_id,s.name as supplier_name,u.email,u.id as user_id,u.device_token,u.device_type,u.notification_status,u.notification_language,
    CONCAT(u.firstname,' ',u.lastname) as userName,u.country_code,u.mobile_no from orders o join user u on o.user_id = u.id 
    join order_prices ors on ors.order_id=o.id join product pr on pr.id=ors.product_id join
    supplier_branch sb on sb.id=o.supplier_branch_id join supplier_ml s on s.supplier_id = sb.supplier_id left join supplier_branch_product sbp on sbp.product_id=ors.product_id
     where o.id = ?`

        let result = await Execute.Query(dbName, sql, [orderId]);
        if (result && result.length > 0) {
            let amount = dbName == "4n1deliverylive_0755" ? parseFloat(result[0].net_amount) - (parseFloat(result[0].delivery_charges) + parseFloat(result[0].handling_admin)) : parseFloat(result[0].net_amount)
            var data = {

                "cart_id": result[0].cart_id,
                "self_pickup": result[0].self_pickup,
                "category_id": result[0].category_id,
                "user_id": result[0].user_id,
                "device_token": result[0].device_token,
                "device_type": result[0].device_type,
                "supplier_id": result[0].supplier_id,
                "supplier_name": result[0].supplier_name,
                "notification_status": result[0].notification_status,
                "notification_language": result[0].notification_language,
                "email": result[0].email,
                "userName": result[0].userName,
                "net_amount": amount,
                "created_on": result[0].created_on,
                "schedule_date": result[0].schedule_date,
                "user_delivery_address": result[0].user_delivery_address,
                "payment_type": result[0].payment_type,
                "mobile_no": result[0].mobile_no,
                "country_code": result[0].country_code,
                "order_prices": result,
                "is_dine_in": result[0].is_dine_in,
            }
            callback(null, data);
        }
        else {
            callback(null, {});
        }
    }
    catch (Err) {
        console.log("====ERR==>>", Err)
        var msg = "db error :";
        sendResponse.sendErrorMessage(msg, res, 500);
    }

}

exports.changeDate = function (req, res) {

    var schedule_date = req.body.schedule_date;
    console.log("...........schedule_date..........", schedule_date);
    //var schedule_date = moment(schedule_date).format('YYYY-MM-DD HH:mm:ss');

    var order_id = req.body.order_id;
    console.log(".......", req.body);
    var schedule_date1 = moment(schedule_date).format('Do MMM HH:mm');
    schedule_date = moment(schedule_date).format('YYYY-MM-DD HH:mm');
    console.log("....schedule..1..", schedule_date1);
    console.log("....schedule....", schedule_date);
    var user_name = "";
    async.auto({
        updateDate: function (cb) {
            var sql = 'update orders set schedule_date = ? ,status = 1  where id =  ?';
            multiConnection[req.dbName].query(sql, [schedule_date, order_id], function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                } else {
                    console.log("..result11111....", result);
                    cb(null);
                }
            })
        },
        sendPush: ['updateDate', function (cb) {
            getDetailsUsers(req.dbName, order_id, function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    user_name = result[0].lastname + " " + result[0].lastname;
                    console.log("..result....", result);

                    schedule_date = moment(schedule_date).format('Do MMM hh:mm A');



                    console.log("-******************", schedule_date);
                    if (result[0].notification_status == 1) {
                        if (result[0].device_type == 0) {
                            if (result[0].notification_language == 14) {
                                var data = {
                                    "status": 0,
                                    "message": "Your Order Expected Delivery time: " + schedule_date,
                                    "orderId": order_id
                                }
                            } else {
                                var data = {
                                    "status": 0,
                                    "message": schedule_date + " تم تحديث وقت توصيل الطلب الى: ",
                                    "orderId": order_id

                                }
                            }
                            pushNotifications.sendAndroidPushNotification(result[0].device_token, data, function (err, result) {
                                if (err) {
                                    var msg = "something went wrong";
                                    return sendResponse.sendErrorMessage(msg, res, 500);
                                }
                                else {
                                    //console.log("push sent");
                                    cb(null);
                                }
                            });
                        } else {

                            if (result[0].notification_language == 14) {
                                var data = {
                                    "status": 0,
                                    "message": "Your Order Expected Delivery time: " + schedule_date,
                                    "orderId": order_id

                                }
                            } else {
                                var data = {
                                    "status": 0,
                                    "message": schedule_date + " تم تحديث وقت توصيل الطلب الى: ",
                                    "orderId": order_id
                                }
                            }

                            var path = "user";
                            var sound = "ping.aiff";
                            pushNotifications.sendIosPushNotification(result[0].device_token, data, path, sound, function (err, result) {
                                console.log(".........errrrrrr.......", err, result);
                                if (err) {
                                    console.log("err2", err);
                                    cb(null)
                                }
                                else {
                                    //console.log("push sent");
                                    cb(null);
                                }
                            });
                        }
                    } else {
                        cb(null);
                    }
                }
            })
        }],
        sendUserEmail: ['sendPush', function (cb) {
            emailTemp.changeDate(res, AdminMail, order_id, schedule_date, user_name, function (err, result) {
                if (err) {
                    console.log("..****change DateTime email*****....", err);
                }
            })
            cb(null)
        }],
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


exports.changeDateIos = function (req, res) {

    var schedule_date = req.body.schedule_date;
    console.log("...........schedule_date..........", schedule_date);
    //var schedule_date = moment(schedule_date).format('YYYY-MM-DD HH:mm:ss');

    var order_id = req.body.order_id;
    console.log(".......", req.body);
    var schedule_date1 = moment(schedule_date).format('Do MMM HH:mm');
    schedule_date = moment(schedule_date).format('YYYY-MM-DD HH:mm');
    console.log("....schedule..1..", schedule_date1);
    console.log("....schedule....", schedule_date);
    var user_name = "";
    async.auto({
        updateDate: function (cb) {
            var sql = 'update orders set schedule_date = ? ,status = 1  where id =  ?';
            multiConnection[req.dbName].query(sql, [schedule_date, order_id], function (err, result) {
                if (err) {
                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else {
                    console.log("..result11111....", result);
                    cb(null);
                }
            })
        },
        sendPush: ['updateDate', function (cb) {
            getDetailsUsers(req.dbName, order_id, function (err, result) {
                if (err) {
                    cb(err);
                } else {
                    console.log("..result....", result);
                    user_name = result[0].lastname + " " + result[0].lastname;

                    schedule_date = moment(schedule_date).format('Do MMM hh:mm A');



                    console.log("-******************", schedule_date);
                    if (result[0].notification_status == 1) {
                        if (result[0].device_type == 0) {
                            if (result[0].notification_language == 14) {
                                var data = {
                                    "status": 0,
                                    "message": "Your order time " + schedule_date + " has been updated",
                                    "orderId": order_id
                                }
                            } else {
                                var data = {
                                    "status": 0,
                                    "message": "الوقت طلبك " + schedule_date + " تم التحديث",
                                    "orderId": order_id

                                }
                            }
                            pushNotifications.sendAndroidPushNotification(result[0].device_token, data, function (err, result) {
                                if (err) {
                                    var msg = "something went wrong";
                                    return sendResponse.sendErrorMessage(msg, res, 500);
                                }
                                else {
                                    //console.log("push sent");
                                    cb(null);
                                }
                            });
                        } else {

                            if (result[0].notification_language == 14) {
                                var data = {
                                    "status": 0,
                                    "message": "Your order time " + schedule_date + " has been updated",
                                    "orderId": order_id

                                }
                            } else {
                                var data = {
                                    "status": 0,
                                    "message": "الوقت طلبك " + schedule_date + " تم التحديث",
                                    "orderId": order_id
                                }
                            }

                            var path = "user";
                            var sound = "ping.aiff";
                            pushNotifications.sendIosPushNotification(result[0].device_token, data, path, sound, function (err, result) {
                                console.log(".........errrrrrr.......", err, result);
                                if (err) {
                                    console.log("err2", err);
                                    cb(null)
                                }
                                else {
                                    //console.log("push sent");
                                    cb(null);
                                }
                            });
                        }
                    } else {
                        cb(null);
                    }
                }
            })
        }],
        sendUserEmail: ['sendPush', function (cb) {
            emailTemp.changeDate(res, AdminMail, order_id, schedule_date, user_name, function (err, result) {
                if (err) {
                    console.log("..****change DateTime email*****....", err);
                }
            })
            cb(null)
        }],
    }, function (err, result) {
        if (err) {
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, 200);
        }
    })
}

exports.listPosKeys = function (req, res) {
    var accessToken = 0;
    var adminId = 0;
    var data;
    async.auto({
        blankField: function (cb) {
            // if (req.query && req.query.accessToken) {
            //     accessToken = req.query.accessToken;
            cb(null);
            // }
            // else {
            //     sendResponse.parameterMissingError(res);
            // }
        },
        poskeysList: ['blankField', function (cb) {
            adminOrders.poskeysList(req.dbName, res, function (err, result) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    data = result;
                    cb(null);
                }
            })

        }]
    }, function (err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);

        } else {
            sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}


exports.poskeysList = function (db_name, res, callback) {
    var results = [];
    async.auto({
        dataa: function (cb) {
            var sql = "select * from `pos_settings`";
            multiConnection[db_name].query(sql, [], function (err, dataa) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);
                }
                else if (dataa.length) {
                    results = dataa;
                    //   console.log('asdf------', results);
                    cb(null);
                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
                }
            })
        }
    }, function (err, data) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
            data = results;
            console.log('final1====', data);
            callback(null, data)
        }
    })

}
