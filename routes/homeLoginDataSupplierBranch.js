var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var loginCases = require('./loginCasesSupplier');
var objectAssign = require('object-assign');


/*
 *This function is used to get data to display at home
 * screen after login
 * This functions gets all the data of the home sections and case 10(admin access)
 *
 * (filter: 0 -- today, 1-- weekly, 2--- monthly...)
 */

exports.getHomeData = function(dbName,res, callback, filter,supplierBranchId ,case10Check) {

 //   console.log("in home data")
    var finalData = {
        "hello": 123
    };
    var date = new Date().toISOString().split("T");

    var newDate = new Date();

   // console.log("supplier id==========---- in main--",supplierBranchId)

    if (parseInt(filter) == 2) {
        newDate.setMonth(newDate.getMonth() - 1);
        newDate = newDate.toISOString().split("T");

    } else if (parseInt(filter) == 1) {
        newDate.setDate(newDate.getDate() - 6);
        newDate = newDate.toISOString().split("T");
    } else {
        newDate = newDate.toISOString().split("T");
    }


    if (case10Check) {
      //  console.log("in case 10 check")
        async.waterfall([

            function(cb) {
                if (logInArray.indexOf(1) != -1) {
                    functionCase1(dbName,res, cb, date, newDate, supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result1, cb) {

                if (result1.length)
                    finalData = objectAssign(finalData, result1[0]);

                if (logInArray.indexOf(2) != -1) {
                    functionCase2(dbName,res, cb, date, newDate, supplierBranchId);
                } else {
                    cb(null, []);
                }


            },
            function(result2, cb) {

                if (result2.length)
                    finalData = objectAssign(finalData, result2[0]);
                if (logInArray.indexOf(3) != -1) {
                    functionCase3(dbName,res, cb, date, newDate, supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result3, cb) {
                if (result3.length)
                    finalData = objectAssign(finalData, result3[0]);
                if (logInArray.indexOf(4) != -1) {
                    functionCase4(dbName,res, cb, date, newDate ,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result4, cb) {

                if (result4.length)
                    finalData = objectAssign(finalData, result4[0]);
                if (logInArray.indexOf(5) != -1) {
                    functionCase5(dbName,res, cb, date, newDate ,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result5, cb) {
                if (result5.length)
                    finalData = objectAssign(finalData, result5[0]);

                if (logInArray.indexOf(6) != -1) {
                    functionCase6(dbName,res, cb, date, newDate , supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result6, cb) {

                if (result6.length)
                    finalData = objectAssign(finalData, result6[0]);


                if (logInArray.indexOf(7) != -1) {
                    functionCase7(dbName,res, cb, date, newDate ,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result7, cb) {
                if (result7.length)
                    finalData = objectAssign(finalData, result7[0]);

                if (logInArray.indexOf(8) != -1) {
                    functionCase8(dbName,res, cb, date, newDate ,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result8, cb) {
                if (result8.length)
                    finalData = objectAssign(finalData, result8[0]);

                if (logInArray.indexOf(9) != -1) {
                    functionCase9(dbName,res, cb, date, newDate ,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result9, cb) {
                if (result9.length)
                    finalData = objectAssign(finalData, result9[0]);

                if (logInArray.indexOf(10) != -1) {
                    functionCase10(dbName,res, cb, date, newDate , supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result10, cb) {
                if (result10.length)
                    finalData = objectAssign(finalData, result10[0]);

                if (logInArray.indexOf(11) != -1) {
                    functionCase11(dbName,res, cb, date, newDate);
                } else {
                    cb(null, []);
                }
            },

            function(result11, cb) {
                if (result11.length)
                    finalData = objectAssign(finalData, result11[0]);
                caseAdminAccess(dbName,res, cb)
            }
        ], function(error, response) {
            if (error) {
                console.log(error);
                sendResponse.somethingWentWrongError(res);
            } else {
                if (Object.keys(finalData).length > 1) {
                 //   console.log("here it is........................")
                 //   console.log("----------------------------final data------------------    " + finalData);
                    var data = [];
                    delete finalData.hello;
                    data.push(finalData);
                    var dataArray = [];
                    dataArray.push(data);
                    dataArray.push(response);
                    /*
                     *below, data of adminAcess is pushing
                     */
                 //   console.log("home data sent------------" + JSON.stringify(dataArray))
                    callback(null, dataArray)
                } else {

                    /*
                     *below, data of adminAcess is pushing
                     */
                //    console.log("home data sent------------" + JSON.stringify(response))
                    callback(null, response)
                }
            }

        })
    } else {
     //   console.log("in else home data");
        async.waterfall([

            function(cb) {
                console.log("in waterfall first=====");
                if (logInArray.indexOf(1) != -1) {
                    console.log(" in if=========waterfall")
                    functionCase1(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    console.log(" in else function 1");
                    cb(null, []);
                }
            },
            function(result1, cb) {

                if (result1.length)
                    finalData = objectAssign(finalData, result1[0]);
              //  console.log(JSON.stringify(finalData));
                if (logInArray.indexOf(2) != -1) {
                    functionCase2(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }


            },
            function(result2, cb) {
                if (result2.length)
                    finalData = objectAssign(finalData, result2[0]);
                if (logInArray.indexOf(3) != -1) {
                    functionCase3(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result3, cb) {
                if (result3.length)
                    finalData = objectAssign(finalData, result3[0]);
                if (logInArray.indexOf(4) != -1) {
                    functionCase4(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result4, cb) {

                if (result4.length)
                    finalData = objectAssign(finalData, result4[0]);
                if (logInArray.indexOf(5) != -1) {
                    functionCase5(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result5, cb) {
                if (result5.length)
                    finalData = objectAssign(finalData, result5[0]);

                if (logInArray.indexOf(6) != -1) {
                    functionCase6(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result6, cb) {

                if (result6.length)
                    finalData = objectAssign(finalData, result6[0]);


                if (logInArray.indexOf(7) != -1) {
                    functionCase7(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result7, cb) {
                if (result7.length)
                    finalData = objectAssign(finalData, result7[0]);

                if (logInArray.indexOf(8) != -1) {
                    functionCase8(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result8, cb) {
                if (result8.length)
                    finalData = objectAssign(finalData, result8[0]);

                if (logInArray.indexOf(9) != -1) {
                    functionCase9(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result9, cb) {
                if (result9.length)
                    finalData = objectAssign(finalData, result9[0]);

                if (logInArray.indexOf(10) != -1) {
                    functionCase10(dbName,res, cb, date, newDate,supplierBranchId);
                } else {
                    cb(null, []);
                }
            },
            function(result10, cb) {
                if (result10.length)
                    finalData = objectAssign(finalData, result10[0]);


                cb(null, []);

            }

        ], function(error, response) {
            if (error) {
                sendResponse.somethingWentWrongError(res);
            } else {
              //  console.log("here it is........................")
                //console.log("----------------------------final data------------------    "+finalData);
                var data = [];
                delete finalData.hello;
                data.push(finalData);
                var dataArray = [];
                dataArray.push(data);
                dataArray.push(response);

             //   console.log("dataArray======",JSON.stringify(dataArray));
                /*
                 *below, data of adminAcess is pushing
                 */
                //console.log("home data sent------------"+JSON.stringify(dataArray))
                callback(null, dataArray)
            }

        })
    }


}

/*
 * supplier status
 *------------
 *
 */


function functionCase1(dbName,res , callback, date, newDate, supplierBranchId) {
    q = ' select is_live from supplier_branch where id = ? ';
   // console.log("supplierBranchId",supplierBranchId);
    multiConnection[dbName].query(q ,[supplierBranchId] , function(err,result) {
        if (err)
        {
            console.log("error=====",err);
            sendResponse.somethingWentWrongError(res);}
        else
        {
           // console.log("function 1",JSON.stringify(result))
            callback(null, result);
        }

    })
}


/*
 *This function is used to get data of total no. of
 * orders today
 *
 */
function functionCase2(dbName,res, callback, date, newDate ,supplierBranchId) {
  //  console.log("function 2")
    var finaldata = [];
    var count =0;
    var q1 = " select COUNT(id) as `total_no_of_orders_today` from orders where created_on >='" + date + "' and created_on <= '" + newDate + "' and supplier_branch_id = ? ";
    multiConnection[dbName].query(q1, [supplierBranchId], function(err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                         count = result[0]['total_no_of_orders_today'];

                        data = {
                            'total_no_of_orders_today': count
                        };
                        finaldata.push(data);
                        callback(null, finaldata);

                    }
                });
}

/*
 *----------------------------
 * pending urgent orders
 *------------------------
 *
 */
function functionCase3(dbName,res, callback, date, newDate, supplierBranchId) {

    //console.log("function 3");
    var finaldata = [];
    var count =0;
    var sql = "select sum(urgent) as `urgent_order` from orders where created_on >='" + date + "' and created_on <= '" + newDate + "' and supplier_branch_id = ? ";
    multiConnection[dbName].query(sql, [supplierBranchId], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
             count = result[0]['urgent_order'];

            data = {
                'urgent_order': count
            };
            finaldata.push(data);
            callback(null, finaldata);

        }
    });
}

/*
 *This function is used to get data of no. of
 * pending orders
 *
 */
function functionCase4(dbName,res, callback, date, newDate, supplierBranchId) {
  //  console.log("function 4")
    var finaldata = [];
    var count =0;
    var sql = "select COUNT(id) as `no_of_pending_orders` from orders where status =? and supplier_branch_id= ?";
    multiConnection[dbName].query(sql, [0,supplierBranchId], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {

             count = result[0]['no_of_pending_orders'];

            data = {
                'no_of_pending_orders': count
            };
            finaldata.push(data);

      //      console.log("data===>>>===>>>",finaldata);
            callback(null, finaldata);

        }
    });

}

/*
 *This function is used to get data of total revenue today
 *
 */
function functionCase5(dbName,res, callback, date, newDate, supplierBranchId) {
   // console.log("function 5")
    var finaldata = [];
    var count =0;
    var sql = "select if (SUM(net_amount) is NULL,0, SUM(net_amount) ) as `total_revenue_of_today` from orders where created_on >='" + date + "' and created_on <= '" + newDate + "' and supplier_branch_id = ? ";
    multiConnection[dbName].query(sql, [supplierBranchId], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
             count = result[0]['total_revenue_of_today'];

            data = {
                'total_revenue_of_today': count
            };
            finaldata.push(data);
            callback(null, finaldata);

        }
    });

}

/*
 *This function is used to get data of no. of
 * pending tracking
 *
 */
function functionCase6(dbName,res, callback, date, newDate, supplierBranchId) {
    var date1 = new Date();
   // console.log("function 6");
    var finaldata = [];
    var count =0;
    var sql = "select COUNT(id) as `no_of_pending_tracking` from orders where delivered_on <'" + date1 + "' and status != 1 or status != 2 and supplier_branch_id = ? ";
    multiConnection[dbName].query(sql, [supplierBranchId], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
             count = result[0]['no_of_pending_tracking'];

            data = {
                'no_of_pending_tracking': count
            };
            finaldata.push(data);
            callback(null, finaldata);

        }
    });

}




/* ----=-(pending)============
 *This function is used to get data of total no. of
 * scheduled orders today
 *
 */
function functionCase7(dbName,res, callback, date, newDate) {
    var date1 = new Date();
  //  console.log("function 8")
    date1.setDate(date1.getDate() + 1);
    date1 = date1.toISOString().split("T");
 //   console.log("next date  " + date1[0]);
    var sql = "select (select COUNT(id) from orders where schedule_date = ?  ) + (select COUNT(id) from order_recurring where recurring_date = ? ) as `no_of_scheduled_ordered_tomorrow` ";
  //  console.log(sql);
    multiConnection[dbName].query(sql, [date1[0], date1[0]], function(err, result7) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {
         //   console.log("=============case7===========" + JSON.stringify(result7));
            callback(null, result7);
        }

    });

}

/*
 * ----------------------------
 *     nuber of delivered orders
 *----------------------------
 */

function functionCase8(dbName,res ,callback ,date , newDate,supplierBranchId)
{    //console.log("function 8")
    var date1 = new Date();

    var finaldata = [];
    var count =0;
    var sql = "select COUNT(id) as `no_of_order_delivered` from orders where delivered_on <='" + date1 + "'  and supplier_branch_id = ? ";
    multiConnection[dbName].query(sql, [supplierBranchId], function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
             count = result[0]['no_of_order_delivered'];

            data = {
                'no_of_order_delivered': count
            };
            finaldata.push(data);
            callback(null, finaldata);

        }
    });

}

/*
 *---------------------(pending)-----------------
 *This function is used to get data of no. of
 * new rating and review alert of new products added by supplier
 *
 */

function functionCase9(dbName,res, callback, date, newDate ,supplierBranchId) {
    var data ={
        "rating":"pending"
    }
    callback(null ,data);
    // var sql = "select COUNT(id) as `no_of_new_rating_&_review_alert` from product_rating where is_approved=?";
    // multiConnection[dbName].query(sql, [0], function(err, result7) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     } else {
    //         callback(null, result7);
    //     }
    //
    // })

}

/*
 * --------------------
 *  live chat with admin
 *---------------------
 */
function functionCase10(res, callback, date, newDate ,supplierBranchId)
{
    var data ={
        "chat":"pending"
    }
    callback(null ,data);

}


/*
 *This function is used to get data for the cases
 * adminAccess
 */


function caseAdminAccess(dbName,res, cb) {
    var date = new Date().toISOString().split("T");

    var newDate = new Date();

    newDate.setDate(newDate.getDate() - 6);
    newDate = newDate.toISOString().split("T");

    var sql = "select adl.id,adl.ip,adl.login_time,adl.country,adl.city,adl.login_status login_message,adl.status,ad.email from ";
    sql += "admin_login adl join admin ad on ad.id=adl.admin_id where adl.login_date>= '" + newDate[0] + "' && adl.login_date<='" + date[0] + "' order by adl.id DESC";
    multiConnection[dbName].query(sql, function(err, result) {
        console.log(err);
       // console.log("====caseAdminAccess====" + JSON.stringify(result));

        cb(null, result);

    })

}