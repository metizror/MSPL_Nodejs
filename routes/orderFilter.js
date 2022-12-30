/**
 * Created by vinay on 11/2/16.
 */



var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var homeLoginData = require('./homeLoginData');
var loginFunc = require('./loginFunctions');

var func = require('./commonfunction');

exports.getallOrder  = function(req,res){
    var filter  = req.body.filter;
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var manValue  = [filter,accessToken,authSectionId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(accessToken,res,cb);
        },
        function(superId,cb){
            func.checkforAuthorityofThisAdmin(superId,authSectionId,res,cb);
        },
        function(cb){
       //     console.log("=================calling getOrderCount==================")
            getOrderCount(res,cb,filter);
        }
    ],function(error,response){
            if(error){
                    sendResponse.somethingWentWrongError(res);
            }else{
                sendResponse.sendSuccessData(response,constant.responseMessage.FILTER_DATA,res,constant.responseStatus.SUCCESS);
            }
    })

}


exports.getAllRevenue  = function(req,res){
    var filter  = req.body.filter;
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var manValue  = [filter,accessToken,authSectionId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(accessToken,res,cb);
        },
        function(superId,cb){
            func.checkforAuthorityofThisAdmin(superId,authSectionId,res,cb);
        },
        function(cb){
            getRevenueCount(res,cb,filter);
        }
    ],function(error,response){
        if(error){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(response,constant.responseMessage.FILTER_DATA,res,constant.responseStatus.SUCCESS);
        }
    })

}



exports.getAllVisitors  = function(req,res){
    var filter  = req.body.filter;
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var manValue  = [filter,accessToken,authSectionId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(accessToken,res,cb);
        },
        function(superId,cb){
            func.checkforAuthorityofThisAdmin(superId,authSectionId,res,cb);
        },
        function(cb){
            getVisitorsCount(res,cb,filter);
        }
    ],function(error,response){
        if(error){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(response,constant.responseMessage.FILTER_DATA,res,constant.responseStatus.SUCCESS);
        }
    })

}



exports.getallCombineCount  = function(req,res){
    var filter  = req.body.filter;
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var manValue  = [filter,accessToken,authSectionId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(accessToken,res,cb);
        },
        function(superId,cb){
            func.checkforAuthorityofThisAdmin(superId,authSectionId,res,cb);
        },
        function(cb){
            getCombineFilterData(res,cb,filter);
        }
    ],function(error,response){
        if(error){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(response,constant.responseMessage.FILTER_DATA,res,constant.responseStatus.SUCCESS);
        }
    })

}


exports.getAllOnlineUsers  = function(req,res){
    var filter  = req.body.filter;
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var manValue  = [filter,accessToken,authSectionId];
    async.waterfall([
        function(cb){
            func.checkBlank(res,manValue,cb);
        },
        function(cb){
            func.authenticateAccessToken(accessToken,res,cb);
        },
        function(superId,cb){
            func.checkforAuthorityofThisAdmin(superId,authSectionId,res,cb);
        },
        function(cb){
            getOnlineUsersCount(res,cb,filter);
        }
    ],function(error,response){
        if(error){
            sendResponse.somethingWentWrongError(res);
        }else{
            sendResponse.sendSuccessData(response,constant.responseMessage.FILTER_DATA,res,constant.responseStatus.SUCCESS);
        }
    })

}


/*
 * Following function is used to get
 * order count according to filter
 *filter : 0 : today
 * filter : 1 : weekly
 * filter : in else condition : monthly
 */


function getOrderCount(res,callback,filter){
    var date = new Date();
    var date1 = date.toISOString().split("T");
    var todayDate = date1[0];
    if(filter == '0'){
       // Total No of orders Today
        async.waterfall([
                   function(cb){
                       date = date.toISOString().split("T");
                       var newDate = date[0]
                       cb(null,newDate);
                   },
            function(newDate,cb){
                var sql = " select `Total No of orders Today` from home_section_data where updated_on = '"+newDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                            sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else if(filter == '1'){
//        console.log("=====================getOrderCount============1");
        async.waterfall([
            function(cb){
                date.setDate(date.getDate()-6);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select sum(`Total No of orders Today`) as `Total No of orders Today`from ";
                sql += " home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
            //    console.log("====================sql=================="+sql);
                multiConnection[dbName].query(sql,[date],function(err1,reply1){
                    if(err1){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply1.length){
                        cb(null,reply1);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){
                if(error){
                    sendResponse.somethingWentWrongError(res);
                }else{
                    callback(null,response);
                }
        })
    }else{
        async.waterfall([
            function(cb){
                date.setMonth(date.getMonth()-1);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate)
            },
            function(newDate,cb){
                var sql = " select sum(`Total No of orders Today`) as `Total No of orders Today`from ";
                sql += " home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){
                    if(error){
                        sendResponse.somethingWentWrongError(res);
                    }
        })
    }

}











/*
 * Following function is used to get
 * revenue count according to filter
 *filter : 0 : today
 * filter : 1 : weekly
 * filter : in else condition : monthly
 */


function getRevenueCount(res,callback,filter){
    var date = new Date();
    var date1 = date.toISOString().split("T");
    var todayDate = date1[0];
    if(filter == '0'){
        // Total No of orders Today
        async.waterfall([
            function(cb){
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select `Total Revenue of Today` from home_section_data where updated_on = '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        console.log("================================"+JSON.stringify(reply));
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else if(filter == '1'){
        async.waterfall([
            function(cb){
                date.setDate(date.getDate()-6);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate)
            },
            function(newDate,cb){
                var sql = " select sum(`Total Revenue of Today`) as `Total Revenue of Today`from ";
                sql += " home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else{
        async.waterfall([
            function(cb){
                date.setMonth(date.getMonth()-1);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select sum(`Total Revenue of Today`) as `Total Revenue of Today` from ";
                sql += " home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){
            if(error){
                sendResponse.somethingWentWrongError(res);
            }
        })
    }

}



/*
 * Following function is used to get
 * visitors count according to filter
 *filter : 0 : today
 * filter : 1 : weekly
 * filter : in else condition : monthly
 */


function getVisitorsCount(res,callback,filter){
    var date = new Date();
    var date1 = date.toISOString().split("T");
    var todayDate = date1[0];
    if(filter == 0){
        // Total No of orders Today
        async.waterfall([
            function(cb){
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select `No of visitors Today` from home_section_data where updated_on = '"+newDate+"' ";
                multiConnection[dbName].query(sql,[],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else if(filter == 1){
        async.waterfall([
            function(cb){
                date.setDate(date.getDate()-6);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate)
            },
            function(newDate,cb){
                var sql = " select sum(`No of visitors Today`) as `No of visitors Today`from ";
                sql += " home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else{
        async.waterfall([
            function(cb){
                date.setMonth(date.getMonth()-1);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select sum(`No of visitors Today`) as `No of visitors Today`from ";
                sql += " home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){
            if(error){
                sendResponse.somethingWentWrongError(res);
            }
        })
    }

}



/*
 * Following function is used to get
 * pending order,tracking,incompleted,unack count, according to filter
 *filter : 0 : today
 * filter : 1 : weekly
 * filter : in else condition : monthly
 */


function getCombineFilterData(res,callback,filter){
    var date = new Date();
    var date1 = date.toISOString().split("T");
    var todayDate = date1[0];
    if(filter == 0){
        // Total No of orders Today
        async.waterfall([
            function(cb){
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select `No of Pending Orders`,`No of Pending Tracking`,`No of Uncompleted Orders Alert`,";
                sql += "`No of unacknowledged order delivery confirmation from client` from home_section_data where updated_on = '"+newDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else if(filter == 1){
        async.waterfall([
            function(cb){
                date.setDate(date.getDate()-6);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select sum(`No of Pending Orders`) as `No of Pending Orders`,sum(`No of Pending Tracking`) as `No of Pending Tracking`,";
                sql += "sum(`No of Uncompleted Orders Alert`) as `No of Uncompleted Orders Alert`,sum(`No of unacknowledged order delivery confirmation from client`) as `No of unacknowledged order delivery confirmation from client`";
                sql += " from home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else{
        async.waterfall([
            function(cb){
                date.setMonth(date.getMonth()-1);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select sum(`No of Pending Orders`) as `No of Pending Orders`,sum(`No of Pending Tracking`) as `No of Pending Tracking`,";
                sql += "sum(`No of Uncompleted Orders Alert`) as `No of Uncompleted Orders Alert`,sum(`No of unacknowledged order delivery confirmation from client`) as `No of unacknowledged order delivery confirmation from client`";
                sql += " from home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){
            if(error){
                sendResponse.somethingWentWrongError(res);
            }
        })
    }
}



/*
 * Following function is used to get
 * online user count according to filter
 *filter : 0 : today
 * filter : 1 : weekly
 * filter : in else condition : monthly
 */


function getOnlineUsersCount(res,callback,filter){
    var date = new Date();
    var date1 = date.toISOString().split("T");
    var todayDate = date1[0];
    if(filter == 0){
        // Total No of orders Today
        async.waterfall([
            function(cb){
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select `No of online users now` from home_section_data where updated_on = '"+newDate+"' ";
                multiConnection[dbName].query(sql,[],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else if(filter == 1){
        async.waterfall([
            function(cb){
                date.setDate(date.getDate()-6);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate)
            },
            function(newDate,cb){
                var sql = " select sum(`No of online users now`) as `No of online users now`from ";
                sql += " home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){

        })
    }else{
        async.waterfall([
            function(cb){
                date.setMonth(date.getMonth()-1);
                date = date.toISOString().split("T");
                var newDate = date[0]
                cb(null,newDate);
            },
            function(newDate,cb){
                var sql = " select sum(`No of visitors Today`) as `No of visitors Today`from ";
                sql += " home_section_data where updated_on >= '"+newDate+"' and updated_on <= '"+todayDate+"' ";
                multiConnection[dbName].query(sql,[date],function(err,reply){
                    if(err){
                        sendResponse.somethingWentWrongError(res);
                    }else if(reply.length){
                        callback(null,reply);
                    }else{
                        var data = {};
                        sendResponse.sendSuccessData(data,constant.responseMessage.NO_DATA_FOUND,res,constant.responseStatus.SOME_ERROR);
                    }
                })
            }
        ],function(error,response){
            if(error){
                sendResponse.somethingWentWrongError(res);
            }
        })
    }

}