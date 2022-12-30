var requestIp = require('request-ip');
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var loginCases = require('./loginCasesSupplier');
var objectAssign = require('object-assign');
var moment=require('moment');




/*
 *This function is used to get data to display at home
 * screen after login
 * This functions gets all the data of the home sections and case 10(admin access)
 *
 * (filter: 0 -- today, 1-- weekly, 2--- monthly...)
 */

exports.getHomeData = function(dbName,res, callback, filter,supplierId ,case10Check) {

    console.log("in home data",case10Check);
    console.log("supplierId....",supplierId);
    var finalData = {
        "hello": 123
    };
    var date; /*= new Date().toISOString().split("T");*/

    var newDate = new Date();

   console.log("supplier id==========---- in main--",supplierId)

    if (parseInt(filter) == 2) {
        var start = new Date();
        start.setDate(start.getDate() + 1);
        start.setHours(5,29,59,0);
        var end = new Date();
       // end.setDate(end.getDate() - 6);
        end.setMonth(end.getMonth() - 1);
        end.setHours(5,30,0,000);
        date=end;
        newDate=start;
        newDate = newDate.toISOString().split("T");
        date = date.toISOString().split("T");

    } 
    else if (parseInt(filter) == 1) {
        var start = new Date();
        start.setDate(start.getDate() + 1);
        start.setHours(5,29,59,0);
        var end = new Date();
        end.setDate(end.getDate() - 6);
        end.setHours(5,30,0,000);
        date=end;
        newDate=start;
      /*  date = new Date().toISOString().split("T");
        newDate.setDate(newDate.getDate() - 6);*/
        newDate = newDate.toISOString().split("T");
        date = date.toISOString().split("T");
    }
    else {
        var start = new Date();
        start.setHours(5,30,0,0);
        var end = new Date();
        end.setDate(end.getDate() + 1);
        end.setHours(5,29,59,000);
        date=start;
        newDate=end;
        date = date.toISOString().split("T");
        newDate = newDate.toISOString().split("T");
    
    }
   // console.log("date",date,newDate);
    if (case10Check) {
    //   console.log("in case 10 check")
        async.waterfall([
            function(cb) {
            //    console.log("logg",logInArray.indexOf(1));
                if (logInArray.indexOf(1) != -1) {
                    functionCase1(dbName,res, cb, date, newDate, supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result1, cb) {
           //     console.log("result1",result1);
                if (result1.length)
                    finalData = objectAssign(finalData, result1[0]);
                console.log("result1222",finalData,logInArray.indexOf(2));
                if (logInArray.indexOf(2) != -1) {
                    functionCase2(dbName,res, cb, date, newDate, supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result2, cb) {
              //  console.log("result1222",result2,finalData,logInArray.indexOf(3));
                if (result2.length)
                    finalData = objectAssign(finalData, result2[0]);
                if (logInArray.indexOf(3) != -1) {
                    functionCase3(dbName,res, cb, date, newDate, supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result3, cb) {
          //      console.log("result12223333",result3,finalData,logInArray.indexOf(4));
                if (result3.length)
                    finalData = objectAssign(finalData, result3[0]);
                if (logInArray.indexOf(4) != -1) {
                    functionCase4(dbName,res, cb, date, newDate ,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result4, cb) {
           //     console.log("result1222444",result4,finalData,logInArray.indexOf(5));

                if (result4.length)
                    finalData = objectAssign(finalData, result4[0]);
                if (logInArray.indexOf(5) != -1) {
                    functionCase5(dbName,res, cb, date, newDate ,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result5, cb) {
                console.log("result1222888565",result5,finalData,logInArray.indexOf(6));
                if (result5.length)
                    finalData = objectAssign(finalData, result5[0]);
                if (logInArray.indexOf(6) != -1) {
                    functionCase6(dbName,res, cb, date, newDate , supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result6, cb) {
             //   console.log("result1225552",result6,finalData,logInArray.indexOf(7));
                if (result6.length)
                    finalData = objectAssign(finalData, result6[0]);
                if (logInArray.indexOf(7) != -1) {
                    functionCase7(dbName,res, cb, date, newDate ,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result7, cb) {
            //    console.log("result1226662",result7,finalData,logInArray.indexOf(8));

                if (result7.length)
                    finalData = objectAssign(finalData, result7[0]);
                if (logInArray.indexOf(8) != -1) {
                    functionCase8(dbName,res, cb, date, newDate ,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result8, cb) {
              //  console.log("result1222777",result8,finalData,logInArray.indexOf(9));
                if (result8.length)
                    finalData = objectAssign(finalData, result8[0]);

                if (logInArray.indexOf(9) != -1) {
                    functionCase9(dbName,res, cb, date, newDate ,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result9, cb) {
              //  console.log("result1222888",result9,finalData,logInArray.indexOf(10));
                console.log("hkbvdbjhvkbjdds",finalData)
                if (result9.length)
                    finalData = objectAssign(finalData, result9[0]);

                if (logInArray.indexOf(10) != -1) {
                    functionCase10(dbName,res, cb, date, newDate , supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result10, cb) {
             //   console.log("result12229999",result10,finalData,logInArray.indexOf(11));
                    console.log("hkbvdbjhvkbjdds",result10)
                if (result10.length)
                    finalData.subscription_status = result10[0].subscription_status;
                console.log("dsdfsfd",finalData)
                if (logInArray.indexOf(11) != -1) {
                    functionCase11(dbName,res, cb, date, newDate);
                } else {
                    cb(null, []);
                }
            },
/*
            function(result11, cb) {
                if (result11.length)
                    finalData = objectAssign(finalData, result11[0]);
                caseAdminAccess(res, cb)
            }*/
        ], function(error, response) {
            if (error) {
              //  console.log(error);
                sendResponse.somethingWentWrongError(res);
            } else {
                if (Object.keys(finalData).length > 1) {
              //      console.log("here it is........................")
              //      console.log("----------------------------final data------------------    " + finalData);
                    var data = [];
                    delete finalData.hello;
                    data.push(finalData);
                    var dataArray = [];
                    dataArray.push(data);
                    dataArray.push(response);
                    /*
                     *below, data of adminAcess is pushing
                     */
              //      console.log("home data sent------------" + JSON.stringify(dataArray))
                    callback(null, dataArray)
                } else {

                    /*
                     *below, data of adminAcess is pushing
                     */
                //    console.log("home data sent1------------" + JSON.stringify(response))
                    callback(null, response)
                }
            }

        })
    }
    else {
      //  console.log("in else home data");
        async.waterfall([
            function(cb) {
                console.log("in waterfall first=====",logInArray);
                if (logInArray.indexOf(1) != -1) {
           //         console.log(" in if=========waterfall")
                    functionCase1(dbName,res, cb, date, newDate,supplierId);
                } else {
          //          console.log(" in else function 1");
                    cb(null, []);
                }
            },
            function(result1, cb) {

                if (result1.length)
                    finalData = objectAssign(finalData, result1[0]);
                  console.log("1",JSON.stringify(finalData));
                if (logInArray.indexOf(2) != -1) {
                    functionCase2(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }


            },
            function(result2, cb) {
                if (result2.length)
                    finalData = objectAssign(finalData, result2[0]);
                console.log("2",JSON.stringify(finalData));
                if (logInArray.indexOf(3) != -1) {
                    functionCase3(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result3, cb) {
                if (result3.length)
                    finalData = objectAssign(finalData, result3[0]);
                console.log("3",JSON.stringify(finalData));
                if (logInArray.indexOf(4) != -1) {
                    functionCase4(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result4, cb) {

                if (result4.length)
                    finalData = objectAssign(finalData, result4[0]);
                console.log("4",JSON.stringify(finalData));
                if (logInArray.indexOf(5) != -1) {
                    functionCase5(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result5, cb) {
                if (result5.length)
                    finalData = objectAssign(finalData, result5[0]);
                console.log("5",JSON.stringify(finalData));
                if (logInArray.indexOf(6) != -1) {
                    functionCase6(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result6, cb) {

                if (result6.length)
                    finalData = objectAssign(finalData, result6[0]);
                console.log("6",JSON.stringify(finalData));
                if (logInArray.indexOf(7) != -1) {
                    functionCase7(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result7, cb) {
                if (result7.length)
                    finalData = objectAssign(finalData, result7[0]);
                console.log("7",JSON.stringify(finalData));
                if (logInArray.indexOf(8) != -1) {
                    functionCase8(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result8, cb) {
                if (result8.length)
                    finalData = objectAssign(finalData, result8[0]);
                console.log("8",JSON.stringify(finalData));
                if (logInArray.indexOf(9) != -1) {
                    functionCase9(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result9, cb) {
                if (result9.length)
                    finalData = objectAssign(finalData, result9[0]);
                console.log("9",JSON.stringify(finalData));
                if (logInArray.indexOf(10) != -1) {
                    functionCase10(dbName,res, cb, date, newDate,supplierId);
                } else {
                    cb(null, []);
                }
            },
            function(result10, cb) {
                if (result10.length)
                    finalData = objectAssign(finalData, result10[0]);
                console.log("10",JSON.stringify(finalData));
                cb(null, []);

            }

        ], function(error, response) {
            if (error) {
                sendResponse.somethingWentWrongError(res);
            } else {
             //   console.log("here it is........................")
            //    console.log("----------------------------final data------------------    "+finalData);
                var data = [];
                delete finalData.hello;
                data.push(finalData);
                var dataArray = [];
                dataArray.push(data);
                dataArray.push(response);
                /*
                 *below, data of adminAcess is pushing
                 */
                console.log("home data sent-2-----------"+JSON.stringify(dataArray))
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


function functionCase1(dbName,res , callback, date, newDate, supplierId) {

  var  q = ' select status from supplier where id = ? ';
    console.log("supplierId",supplierId);
    multiConnection[dbName].query(q ,[supplierId] , function(err,result) {
        if (err)
        {
     //       console.log("error=====",err);
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            console.log("function 1",JSON.stringify(result))
            callback(null, result);
        }

    })
}


/*
 *This function is used to get data of total no. of
 * orders today
 *
 */
function functionCase2(dbName,res, callback, date, newDate ,supplierId) {
    console.log("function 2")
 var data;
    var q = " select id from supplier_branch where supplier_id = ? ";

    var finaldata = [];
    var count =0;

    multiConnection[dbName].query(q, [supplierId], function(err, result1) {
        var q1 = " select COUNT(id) as `total_no_of_orders_today` from orders where DATE(created_on)= CURDATE() and supplier_branch_id = ? ";
       console.log("branch is====",result1);
     if(result1.length){
      for (var i = 0; i < result1.length; i++) {
          (function(i) {
              multiConnection[dbName].query(q1, [result1[i].id], function(err, result) {
                  if (err) {
                      sendResponse.somethingWentWrongError(res);
                  }
                  else{

                  }
                 // console.log("total order",result);
                  count = count +  result[0].total_no_of_orders_today;
                 // console.log("total_no_of_orders_today",result[0].total_no_of_orders_today);
             //   console.log("count---",count);
                  if (i == result1.length - 1) {
                      finaldata.push({"total_no_of_orders_today":count});
                     console.log("final1",finaldata)
                      callback(null, finaldata);
                  }
              });

          })(i);
      }
    }
        else {
         //finaldata.push({"total_no_of_orders_today":count});
         console.log("fina2l",finaldata)
         callback(null,finaldata);
     }
        
    });
}

/*
 *----------------------------
 * pending urgent orders
 *------------------------
 *
 */
function functionCase3(dbName,res, callback, date, newDate, supplierId) {

    console.log("function 3",date,newDate);
    var q = " select id from supplier_branch where supplier_id = ? ";
    var finaldata = [];
    var count=0;
    multiConnection[dbName].query(q, [supplierId], function(err, result1) {
      //  console.log("kjbdfskfdsf",result1)
        var sql = "select count(id) as `urgent_order` from orders where created_on >='" + date + "' and created_on <= '" + newDate + "' and supplier_branch_id = ? and urgent = 1 and status =0 ";
        // var q1 = " select COUNT(id) as `total_no_of_orders_today` from orders where created_on >='" + date + "' and created_on <= '" + newDate + "' and supplier_branch_id = '" + supplier_branch_id + "' "
            
        if(result1.length){
            for (var i = 0; i < result1.length; i++) {
         (function(i) {
           //  console.log("bsdjbsdsdsddsvfs",sql)
             multiConnection[dbName].query(sql, [result1[i].id], function(err, result) {
                // console.log("bsdjbdsvfs",result);
                 if (err) {
                     sendResponse.somethingWentWrongError(res);
                 }
                 count = count + result[0]['urgent_order'];
                 if (i == result1.length - 1) {
                     data = {
                         'urgent_order': count
                     };
                     finaldata.push(data);
                     callback(null, finaldata);
                 }
             });

         })(i);
     }
        }
        else {
            finaldata.push({"urgent_order":count});
            callback(null,finaldata);
        }
    });
}


/*
 *This function is used to get data of no. of
 * pending orders
 *
 */

function functionCase4(dbName,res, callback, date, newDate, supplierId) {
 //  console.log("function 4",supplierId)

    var q = " select id from supplier_branch where supplier_id = ? ";

    var finaldata = [] , count=0;

    multiConnection[dbName].query(q, [supplierId], function(err, result1) {
        if (err) {
   //         console.log("Error==in homeliginsupplier function 4")
            sendResponse.somethingWentWrongError(res);
        }
    //    console.log("result 1==",result1);
        var sql = "select COUNT(id) as `no_of_pending_orders` from orders where status =? and supplier_branch_id= ?";
    if(result1.length){
     for (var i = 0; i < result1.length; i++) {
         (function(i) {
             multiConnection[dbName].query(sql, [0, result1[i].id], function(err, result) {
                 if (err) {
                 //    console.log("Error==in homeliginsupplier function 4===")
                     sendResponse.somethingWentWrongError(res);
                 }
             //    console.log("result===",result);
                 count = count + result[0]['no_of_pending_orders'];
                 if (i == result1.length - 1) {
                     data = {
                         'no_of_pending_orders': count
                     };
                     finaldata.push(data);
                     callback(null, finaldata);
                 }
             });

         })(i);
     }
    }
        else {
        finaldata.push({"no_of_pending_orders":count});
        callback(null,finaldata);
    }
    });

}



/*
 *This function is used to get data of total revenue today
 *
 */
function functionCase5(dbName,res, callback, date, newDate, supplierId) {
 //   console.log("function 5")
  //  console.log("....sss..",date,newDate);
    var q = " select id from supplier_branch where supplier_id = ? ";

    var finaldata = [] ,count=0;

    multiConnection[dbName].query(q, [supplierId], function(err, result1) {

        var sql = "select if (SUM(net_amount) is NULL,0, SUM(net_amount) ) as `total_revenue_of_today` from orders where created_on >='" + date + "' and created_on <= '" + newDate + "' and supplier_branch_id = ? and status = 5 ";
        // var q1 = " select COUNT(id) as `total_no_of_orders_today` from orders where created_on >='" + date + "' and created_on <= '" + newDate + "' and supplier_branch_id = '" + supplier_branch_id + "' ";
     if(result1.length){
         for (var i = 0; i < result1.length; i++) {
             (function(i) {
                
              //   console.log("....srggfss..",sql);
                 multiConnection[dbName].query(sql, [result1[i].id], function(err, result) {
                     if (err) {
                         sendResponse.somethingWentWrongError(res);
                     }
                     count = count + result[0]['total_revenue_of_today'];
                     if (i == result1.length - 1) {
                         data = {
                             'total_revenue_of_today': count
                         };
                         finaldata.push(data);
                         callback(null, finaldata);
                     }
                 });

             })(i);
         }
     }
     else {
         finaldata.push({"total_revenue_of_today":count});
         callback(null,finaldata);
     }
    });



}



/*
 *This function is used to get data of no. of
 * pending tracking
 *
 */
function functionCase6(dbName,res, callback, date, newDate, supplierId) {
    var date1 = new Date();
 //  console.log("function 6");
    var q = " select id from supplier_branch where supplier_id = ? ";

    var finaldata = [],count=0;
    multiConnection[dbName].query(q, [supplierId], function(err, result1) {

        var sql = "select COUNT(id) as `no_of_pending_tracking` from orders where status =? and supplier_branch_id= ? ";
    if(result1.length){
        for (var i = 0; i < result1.length; i++) {
            (function(i) {
                multiConnection[dbName].query(sql, [7,result1[i].id], function(err, result) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    count =count+ result[0]['no_of_pending_tracking'];
                    if (i == result1.length - 1) {
                        data = {
                            'no_of_pending_tracking': count
                        };
                        finaldata.push(data);
                        callback(null, finaldata);
                    }
                });

            })(i);
        }
    }
        else {
        finaldata.push({"no_of_pending_tracking":count});
        callback(null,finaldata)
    }

    });



}




/* ----=-(pending)============
 *This function is used to get data of total no. of
 * scheduled orders today
 *
 */
function functionCase7(dbName,res, callback, date, newDate,supplierId) {
   console.log("lnbfsdhbjdfs",date)
    var start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(5,30,0,0);
    var end = new Date();
    end.setDate(end.getDate() + 2);
    end.setHours(5,29,59,000);
    var date1=start;
    var date2=end;
    date1 = date1.toISOString().split("T");
    date2 = date2.toISOString().split("T");
  /*  var date1 = new Date();
    date1.setDate(date1.getDate() + 1);
    date1 = date1.toISOString().split("T");*/
    console.log("......",date1);
    console.log("......",date2);
   // var sql = "select (select COUNT(id) from orders where schedule_date = ?  ) + (select COUNT(id) from order_recurring where recurring_date = ? ) as `no_of_scheduled_ordered_tomorrow` ";
    var sql='select COUNT(id) as "no_of_scheduled_ordered_tomorrow" from orders where schedule_date>= "'+date1+'" and schedule_date<= "'+date2+'" and status =9'
  //  console.log(sql);
    multiConnection[dbName].query(sql, function(err, result7) {
       // console.log("sql",sql)
        if (err) {
            //console.log("nnfdsa",err)
            sendResponse.somethingWentWrongError(res);
        } else {
//          console.log("=============case7===========" + JSON.stringify(result7));
            callback(null, result7);
        }

    });

}



/*
 * ----------------------------
 *     number of delivered orders
 *----------------------------
 *
 *
 */

function functionCase8(dbName,res ,callback ,date , newDate,supplierId) {
    //console.log("function 9")
    var q = " select id from supplier_branch where supplier_id = ? ";

    var finaldata = [],count=0;

    multiConnection[dbName].query(q, [supplierId], function(err, result1) {

        var sql = "select COUNT(id) as `no_of_order_delivered` from orders where status =? and supplier_branch_id= ? ";
     if(result1.length){
         for (var i = 0; i < result1.length; i++) {
             (function(i) {
                 multiConnection[dbName].query(sql, [5,result1[i].id], function(err, result) {
                     if (err) {
                         sendResponse.somethingWentWrongError(res);
                     }
                     count =count+ result[0]['no_of_order_delivered'];
                     if (i == result1.length - 1) {
                         data = {
                             'no_of_order_delivered': count
                         };
                         finaldata.push(data);
                         callback(null, finaldata);
                     }
                 });

             })(i);
         }
     }
        else {
         finaldata.push({"no_of_order_delivered":count});
         callback(null,finaldata);
     }

    });



}






/*
 *---------------------(pending)-----------------
 *This function is used to get data of no. of
 * new rating and review alert of new products added by supplier
 *
 */

function functionCase9(dbName,res, callback, date, newDate ,supplierId) {
    var sql = "select COUNT(id) as `no_of_new_rating_&_review_alert` from supplier_rating where is_approved=? and supplier_id=?";
    multiConnection[dbName].query(sql, [1,supplierId], function(err, result7) {
         if (err) {
             sendResponse.somethingWentWrongError(res);
         } else {
             console.log("kjbvxcvvxxxxcxvc",result7)

             callback(null, result7);
         }
    
     })

}

/*
 * --------------------
 *  live chat with admin
 *---------------------
 */
function functionCase10(dbName,res, callback, date, newDate ,supplierId) {
    var result1=0;
    var data1=[];
    var data2=[];
    var d = new Date();
    var n = d.getMonth();
    console.log("n====",n);
    async.auto({
        getdays:function (cb) {
            var sql = "SELECT DATEDIFF(`end_date`,curDate()) AS days from supplier_subscription where supplier_id = ?"
            multiConnection[dbName].query(sql, [supplierId], function (error, reply) {
               // console.log("error from getSupplierSubscriptionStatus " + error);

                if (error) {

                    var msg = "db error :";
                    sendResponse.sendErrorMessage(msg, res, 500);
                } else if (reply.length && reply[0].days > 0) {
                    /* callback(null, reply[0].days);*/
                    result1 = reply[0].days;
                    cb(null);
                } else {
                    cb(null);
                }
            })
        },
        setdays:['getdays',function (cb) {
            if(result1){
                var sql='select * from supplier_subscription where supplier_id = ?'
                multiConnection[dbName].query(sql,[supplierId],function (err,result) {
                    if(err){
                        console.log("error from getSupplierSubscriptionStatus1 " + err);
                        var msg = "db error :";
                        sendResponse.sendErrorMessage(msg, res, 500);
                    }
                    else {
                      //  console.log("res.1.1.....",result[0]);
                        var data= result[0];
                        data1.push(data.jan_price);
                        data1.push(data.feb_price);
                        data1.push(data.march_price);
                        data1.push(data.april_price);
                        data1.push(data.may_price);
                        data1.push(data.june_price);
                        data1.push(data.july_price);
                        data1.push(data.aug_price);
                        data1.push(data.sep_price);
                        data1.push(data.oct_price);
                        data1.push(data.nov_price);
                        data1.push(data.dec_price);

                     //   console.log("res.1.2.....",data1[n]);
                        if(n==0||n==2||n==4||n==6||n==7||n==9||n==11){
                            if(data1[n]==0){
                                result1=0;
                            }
                            cb(null);
                        }
                        else if(n==3||n==5||n==8||n==10)
                        {
                            if(data1[n]==0){
                                result1=0;
                            }
                            cb(null);
                        }
                        else {
                            if(data1[n]==0){
                                result1=0;
                            }
                            cb(null);
                        }
                    }
                })
            }
            else {
                cb(null);
            }

        }]
    },function (err,response) {
        if(err){
            console.log("errr",err);
            var msg = "db error :";
            sendResponse.sendErrorMessage(msg, res, 500);
        }
        else {
            console.log("kjbvxcvvxcxvc",result1)
            data2.push({
                "subscription_status":result1
            })
            console.log("bkdbksdds",data2)
            callback(null, data2);

        }
    })
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
      //  console.log(err);
      // console.log("====caseAdminAccess====" + JSON.stringify(result));

        cb(null, result);

    })

}