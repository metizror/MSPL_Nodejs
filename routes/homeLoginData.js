/**
 * Created by vinay on 9/2/16.
 */


var requestIp = require('request-ip');
var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var loginCases = require('./loginCases');
var objectAssign = require('object-assign');

var log4js=require("log4js")
var logger = log4js.getLogger();
logger.level = 'debug';


exports.getHomeData5 = function(db_name,res,callback,colNameWithoutSum,colNameWithSum,colNameDatePlusOne,case10Check){

    var finalData={"Hello":123};

    /*
     * Here case10Check will decide where admin access
     * details to be sent or not.
     * If case10Check is false it means admin access data
     * not be sent
     */
    if(case10Check)
    {
        async.waterfall([
            function(cb)
            {
                if(colNameWithoutSum.length)
                {
                    getWithoutSumData(db_name,res,colNameWithoutSum,cb)
                }
                else
                {
                    cb(null,[]);
                }
            },
            function(dataWithoutSum1,cb)
            {
                if(dataWithoutSum1.length)
                    finalData = objectAssign(finalData,dataWithoutSum1[0]);
                    if(colNameWithSum.length) {
                        getWithSumData(db_name,res,colNameWithSum,cb)
                    }
                    else {
                        cb(null,[]);
                    }
            },
            function(dataWithSum1,cb)
            {
               // console.log("-------------data with sum------------"+JSON.stringify(dataWithSum1))
                if(dataWithSum1.length)
                  finalData = objectAssign(finalData,dataWithSum1[0]);
                if(colNameDatePlusOne.length)
                {
                    getDatePlusOneData(db_name,res,colNameDatePlusOne,cb)
                }
                else
                {
                    cb(null,[]);
                }
            },
            function(dataNextDay,cb){
                if(dataNextDay.length)
                    finalData = objectAssign(finalData,dataNextDay[0]);
                caseAdminAccess(db_name,res,cb)
            }

        ],function(err,response)
        {
            if(err)
            {
                 sendResponse.somethingWentWrongError(res);
            }
            else
            {
                if(Object.keys(finalData).length >1)
                {
                  //  console.log("here it is........................")
                   // console.log("----------------------------final data------------------    "+finalData);
                    var data =[];
                    delete finalData.Hello;
                    data.push(finalData);
                    var dataArray = [];
                    dataArray.push(data);
                    dataArray.push(response);
                    /*
                     *below, data of adminAcess is pushing
                     */
                //    console.log("home data sent------------"+JSON.stringify(dataArray))
                    callback(null,dataArray)
                }
                else
                {
                    /*
                     *below, data of adminAcess is pushing
                     */
                 //   console.log("home data sent------------"+JSON.stringify(response))
                    callback(null,response)
                }
            }
        })
    }
    else
    {
        async.waterfall([
            function(cb)
            {
                if(colNameWithoutSum.length)
                {
                    getWithoutSumData(db_name,res,colNameWithoutSum,cb)
                }
                else
                {
                    cb(null,[]);
                }
            },
            function(dataWithoutSum1,cb)
            {
                if(dataWithoutSum1.length)
                    finalData = objectAssign(finalData,dataWithoutSum1[0]);

                if(colNameWithSum.length)
                {
                    getWithSumData(db_name,res,colNameWithSum,cb)
                }
                else
                {
                    cb(null,[]);
                }


            },
            function(dataWithSum1,cb)
            {
                //console.log("-------------data with sum------------"+JSON.stringify(dataWithSum1))
                if(dataWithSum1.length)
                    finalData = objectAssign(finalData,dataWithSum1[0]);

                if(colNameDatePlusOne.length)
                {
                    getDatePlusOneData(db_name,res,colNameDatePlusOne,cb)
                }
                else
                {
                    cb(null,[]);
                }
            },
            function(dataNextDay,cb){
                if(dataNextDay.length)
                    finalData = objectAssign(finalData,dataNextDay[0]);
                   cb(null)
            }

        ],function(err,response)
        {
            if(err)
            {
                sendResponse.somethingWentWrongError(res);
            }
            else
            {
                //    console.log("here it is........................")
                    //console.log("----------------------------final data------------------    "+finalData);
                    var data =[];
                    delete finalData.Hello;
                    data.push(finalData);
                    var dataArray = [];
                    dataArray.push(data);
                    dataArray.push(response);
                    /*
                     *below, data of adminAcess is pushing
                     */
                    //console.log("home data sent------------"+JSON.stringify(dataArray))
                    callback(null,dataArray)

            }

        })

    }

}





/*
 *This function is used to get data to display at home
 * screen after login
 * This functions gets all the data of the home sections and case 16(admin access)
 *
 * (filter: 0 -- today, 1-- weekly, 2--- monthly...)
 */

exports.getHomeData = function(db_name,res,callback,filter,case10Check){

   // console.log("in home data")
   var finalData ={"hello":123};
    var date = new Date().toISOString().split("T");

    var newDate = new Date();



    if(parseInt(filter) == 2){
        newDate.setMonth(newDate.getMonth()-1);
        newDate = newDate.toISOString().split("T");

    }else if(parseInt(filter) == 1){
        newDate.setDate(newDate.getDate()-6);
        newDate = newDate.toISOString().split("T");
    }else{
        newDate = newDate.toISOString().split("T");
    }


    if(case10Check)
    {
        console.log("in case 16 check")
        async.waterfall([
            function(cb){
                if(logInArray.indexOf(1) != -1){
                    functionCase1(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result1,cb){

                if(result1.length)
                    finalData = objectAssign(finalData,result1[0]);

                if(logInArray.indexOf(2) != -1){
                    functionCase2(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }


            },
            function(result2,cb){
                if(result2.length)
                    finalData = objectAssign(finalData,result2[0]);
                if(logInArray.indexOf(3) != -1){
                    functionCase3(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result3,cb){
                if(result3.length)
                    finalData = objectAssign(finalData,result3[0]);
                if(logInArray.indexOf(4) != -1){
                    functionCase4(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result4,cb){

                if(result4.length)
                    finalData = objectAssign(finalData,result4[0]);
                if(logInArray.indexOf(5) != -1){
                    functionCase5(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result5,cb){
                if(result5.length)
                    finalData = objectAssign(finalData,result5[0]);

                if(logInArray.indexOf(6) != -1){
                    functionCase6(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result6,cb){

                if(result6.length)
                    finalData = objectAssign(finalData,result6[0]);


                if(logInArray.indexOf(7) != -1){
                    functionCase7(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result7,cb){
                if(result7.length)
                    finalData = objectAssign(finalData,result7[0]);

                if(logInArray.indexOf(8) != -1){
                    functionCase8(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result8,cb){
                if(result8.length)
                    finalData = objectAssign(finalData,result8[0]);

                if(logInArray.indexOf(9) != -1){
                    functionCase9(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result9,cb){
                if(result9.length)
                    finalData = objectAssign(finalData,result9[0]);

                if(logInArray.indexOf(10) != -1){
                    functionCase10(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result10,cb){
                if(result10.length)
                    finalData = objectAssign(finalData,result10[0]);

                if(logInArray.indexOf(11) != -1){
                    functionCase11(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result11,cb){

                if(result11.length)
                    finalData = objectAssign(finalData,result11[0]);
                if(logInArray.indexOf(12) != -1){
                    functionCase12(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result12,cb){

                if(result12.length)
                    finalData = objectAssign(finalData,result12[0]);

                if(logInArray.indexOf(13) != -1){
                    functionCase13(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result13,cb){

                if(result13.length)
                    finalData = objectAssign(finalData,result13[0]);

                if(logInArray.indexOf(14) != -1){
                    functionCase14(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result14,cb){

                if(result14.length)
                    finalData = objectAssign(finalData,result14[0]);

                if(logInArray.indexOf(15) != -1){
                    functionCase15(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },  function(result15,cb){
                if(result15.length)
                    finalData = objectAssign(finalData,result15[0]);
                caseAdminAccess(db_name,res,cb)
            }
        ],function(error,response){
            if(error)
            {
                console.log(error);
                
                sendResponse.somethingWentWrongError(res);
            }
            else
            {
                if(Object.keys(finalData).length >1)
                {
                   // console.log("here it is........................")
                  //  console.log("----------------------------final data------------------    "+finalData);
                    var data =[];
                    delete finalData.hello;
                    data.push(finalData);
                    var dataArray = [];
                    dataArray.push(data);
                    dataArray.push(response);
                    /*
                     *below, data of adminAcess is pushing
                     */
                  //  console.log("home data sent------------"+JSON.stringify(dataArray))
                    callback(null,dataArray)
                }
                else
                {

                    /*
                     *below, data of adminAcess is pushing
                     */
                 //   console.log("home data sent------------"+JSON.stringify(response))
                    callback(null,response)
                }
            }

        })
    }
    else
    {
        async.waterfall([
            function(cb){
                if(logInArray.indexOf(1) != -1){
                    functionCase1(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result1,cb){

                if(result1.length)
                    finalData = objectAssign(finalData,result1[0]);

                if(logInArray.indexOf(2) != -1){
                    functionCase2(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }


            },
            function(result2,cb){
                if(result2.length)
                    finalData = objectAssign(finalData,result2[0]);
                if(logInArray.indexOf(3) != -1){
                    functionCase3(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result3,cb){
                if(result3.length)
                    finalData = objectAssign(finalData,result3[0]);
                if(logInArray.indexOf(4) != -1){
                    functionCase4(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result4,cb){

                if(result4.length)
                    finalData = objectAssign(finalData,result4[0]);
                if(logInArray.indexOf(5) != -1){
                    functionCase5(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result5,cb){
                if(result5.length)
                    finalData = objectAssign(finalData,result5[0]);

                if(logInArray.indexOf(6) != -1){
                    functionCase6(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result6,cb){

                if(result6.length)
                    finalData = objectAssign(finalData,result6[0]);


                if(logInArray.indexOf(7) != -1){
                    functionCase7(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result7,cb){
                if(result7.length)
                    finalData = objectAssign(finalData,result7[0]);

                if(logInArray.indexOf(8) != -1){
                    functionCase8(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result8,cb){
                if(result8.length)
                    finalData = objectAssign(finalData,result8[0]);

                if(logInArray.indexOf(9) != -1){
                    functionCase9(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result9,cb){
                if(result9.length)
                    finalData = objectAssign(finalData,result9[0]);

                if(logInArray.indexOf(10) != -1){
                    functionCase10(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result10,cb){
                if(result10.length)
                    finalData = objectAssign(finalData,result10[0]);

                if(logInArray.indexOf(11) != -1){
                    functionCase11(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result11,cb){

                if(result11.length)
                    finalData = objectAssign(finalData,result11[0]);
                if(logInArray.indexOf(12) != -1){
                    functionCase12(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result12,cb){

                if(result12.length)
                    finalData = objectAssign(finalData,result12[0]);

                if(logInArray.indexOf(13) != -1){
                    functionCase13(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result13,cb){

                if(result13.length)
                    finalData = objectAssign(finalData,result13[0]);

                if(logInArray.indexOf(14) != -1){
                    functionCase14(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            },
            function(result14,cb){

                if(result14.length)
                    finalData = objectAssign(finalData,result14[0]);

                if(logInArray.indexOf(15) != -1){
                    functionCase15(db_name,res,cb,date,newDate);
                }else{
                    cb(null,[]);
                }
            }
        ],function(error,response){
            if(error)
            {
                 sendResponse.somethingWentWrongError(res);
            }
            else
            {
              //  console.log("here it is........................")
                //console.log("----------------------------final data------------------    "+finalData);
                var data =[];
                delete finalData.hello;
                data.push(finalData);
                var dataArray = [];
                dataArray.push(data);
                dataArray.push(response);
                /*
                 *below, data of adminAcess is pushing
                 */
                //console.log("home data sent------------"+JSON.stringify(dataArray))
                callback(null,dataArray)
            }

        })
    }


}




/*
 *This function is used to get data of total no. of
 * orders today
 *
 */
function functionCase1(db_name,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `total_no_of_orders_today` from orders where created_on >='"+date+"' and created_on <= '"+newDate+"'";
    multiConnection[db_name].query(sql,function(err,result1)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result1);
        }

    })

}


/*
 *This function is used to get data of total revenue today
 *
 */
function functionCase2(dbName,res,callback,date,newDate)
{
    var sql="select if (SUM(net_amount) is NULL,0, SUM(net_amount) ) as `total_revenue_of_today` from orders where created_on >='"+date+"' and created_on <= '"+newDate+"'";
    multiConnection[dbName].query(sql,function(err,result2)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result2);
        }

    })

}



/*
 *This function is used to get  no. of
 * visitors today
 *
 */
function functionCase3(dbName,res,callback,date,newDate)
{
    var sql="select if(SUM(no_of_users) is NULL,0,SUM(no_of_users)) as `no_of_visitors_today` from visitors where today_date >='"+date[0]+"' and today_date <= '"+newDate[0]+"'";
    multiConnection[dbName].query(sql,function(err,result3)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result3);
        }

    })

}



/*
 *This function is used to get data of  no. of
 * online users now
 *
 */
function functionCase4(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_online_users_now` from user where `is_logged_in` =?";
    multiConnection[dbName].query(sql,[1],function(err,result4)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result4);
        }

    })

}




/*
 *This function is used to get data of no. of alert
 * of new product pending
 *
 */
function functionCase5(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_alert_of_new_product_pending` from product where is_live =?";
    multiConnection[dbName].query(sql,[0],function(err,result5)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result5);
        }

    })

}



/*
 *This function is used to get data of  no. of
 * feedback pending of orders
 *
 */
function functionCase6(dbName,res,callback,date,newDate)
{
    var sql="select if(SUM(id) is NULL,0,SUM(id)) as `no_of_feedback_pending` from orders where status=?";
    multiConnection[dbName].query(sql,[5],function(err,result6)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result6);
        }

    })

}




/*
 *This function is used to get data of no. of
 * new rating and review alert of new products added by supplier
 *
 */

function functionCase7(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_new_rating_&_review_alert` from supplier_rating where is_approved=?";
    multiConnection[dbName].query(sql,[0],function(err,result7)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result7);
        }

    })

}



/*
 *This function is used to get data of no. of
 * pending orders
 *
 */
function functionCase8(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_pending_orders` from orders where status =?";
    multiConnection[dbName].query(sql,[0],function(err,result8)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result8);
        }

    })

}




/*
 *This function is used to get data of no. of
 * pending tracking
 *
 */
function functionCase9(dbName,res,callback,date,newDate)
{
   var date1 = new Date();
    var sql="select COUNT(id) as `no_of_pending_tracking` from orders where status = ?";
    multiConnection[dbName].query(sql,[7],function(err,result9)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result9);
        }

    })

}




/*
 *This function is used to get data of  no. of
 * New Supplier Registration which are not approved by admin
 *
 */
function functionCase10(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_new_supplier_registration_alert` from supplier where approved_by = ? ";
    multiConnection[dbName].query(sql,[0],function(err,result10)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result10);
        }

    })

}



/*
 *This function is used to get data of no. of
 * orders which are added to cart by customer but not ordered yety
 *
 */
function functionCase11(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_uncompleted_orders_alert` from orders where status = ? ";
    multiConnection[dbName].query(sql,[0],function(err,result11)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result11);
        }

    })

}



/*
 *This function is used to get total no. of
 * failed emails sent by admin to supplier
 *
 */
function functionCase12(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_uncompleted_emails` from sms_email_text where status = ? and type = ? ";
    multiConnection[dbName].query(sql,[0,1],function(err,result12)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result12);
        }

    })

}



/*
 *This function is used to get data of total no. of
 * failed sms sent by admin to supplier
 *
 */
function functionCase13(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_uncompleted_sms` from sms_email_text where status = ? and type = ? ";
    multiConnection[dbName].query(sql,[0,0],function(err,result13)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            callback(null,result13);
        }

    })

}




/*
 *This function is used to get data of no. of
 * orders which are not yet acknowledged by customer yet
 *
 */
function functionCase14(dbName,res,callback,date,newDate)
{
    var sql="select COUNT(id) as `no_of_unacknowledged_order_delivery_confirmation_from_client` from orders where status = ? ";
    multiConnection[dbName].query(sql,[5],function(err,result14)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
           // console.log("=============case14==========="+JSON.stringify(result14));
            callback(null,result14);
        }

    })

}



/*
 *This function is used to get data of total no. of
 * scheduled orders today
 *
 */
function functionCase15(dbName,res,callback,date,newDate)
{
    var date1 =new Date();
    date1.setDate(date1.getDate()+1);
    date1 = date1.toISOString().split("T");
   // console.log("next date  "+date1[0]);
    var sql="select (select COUNT(id) from orders where schedule_date = ?  ) + (select COUNT(id) from order_recurring where recurring_date = ? ) as `no_of_scheduled_ordered_tomorrow` ";
 //   console.log(sql)
    multiConnection[dbName].query(sql,[date1[0],date1[0]],function(err,result15)
    {
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else
        {
            console.log("=============case15==========="+JSON.stringify(result15));
            callback(null,result15);
        }

    })

}


/*
 *This function is used to get data for the cases
 * in which we need data by doing sum of clumn in db
 */

function getWithoutSumData(dbName,res,colNameWithoutSum,cb){
    var date = new Date().toISOString().split("T");
    var sql = "select "+colNameWithoutSum+" from home_section_data where updated_on='"+date[0]+"'";
   // console.log("sql  "+sql);
    multiConnection[dbName].query(sql,function(err,reply){
        if(err){
            console.log("error login data "+err);
            sendResponse.somethingWentWrongError(res);
        }else if(reply.length){
         //   console.log(" getWithoutSumData "+reply);
            cb(null,reply);
        }else{
            console.log("no entry found in home_section_data table");
        }
    })
}


/*
 *This function is used to get data for the cases
 * in which we need data without doing sum of clumn in db
 */


function getWithSumData(dbName,res,colNameWithSum,cb){
    var sql = "select "+colNameWithSum+" from home_section_data ";
    console.log("sql  "+sql);
    multiConnection[dbName].query(sql,function(err,reply){
        if(err){
            console.log("error login data "+err);
            sendResponse.somethingWentWrongError(res);
        }else if(reply.length){
          //  console.log(" getWithSumData"+ reply);
            cb(null,reply);
        }else{
            console.log("no entry found in home_section_data table");
        }
    })
}


/*
 *This function is used to get data for the cases
 * in which we need data of tomorrow: ex : Scheduled order for tomorrow
 */


function getDatePlusOneData(dbName,res,colNameDatePlusOne,cb){
    var date = new Date();
    date.setDate(date.getDate() + 1);
    date = date.toISOString().split("T");
    var sql = "select "+colNameDatePlusOne+" from home_section_data where updated_on ='"+date[0]+"'";
   // console.log("sql  "+sql);
    multiConnection[dbName].query(sql,function(err,reply){
        if(err){
            console.log("error login data "+err);
            sendResponse.somethingWentWrongError(res);
        }else if(reply.length){
           // console.log(" getDatePlusOneData "+ reply);
            cb(null,reply);
        }else{
            console.log("no entry found in home_section_data table");
        }
    })
}


/*
 *This function is used to get data for the cases
 * adminAccess
 */


function caseAdminAccess(dbName,res,cb){
    var date = new Date().toISOString().split("T");

    var newDate = new Date();

    newDate.setDate(newDate.getDate()-6);
    newDate = newDate.toISOString().split("T");

    var sql = "select adl.id,adl.ip,adl.login_time,adl.country,adl.city,adl.login_status login_message,adl.status,ad.email from ";
        sql += "admin_login adl join admin ad on ad.id=adl.admin_id where adl.login_date>= '"+newDate[0]+"' && adl.login_date<='"+date[0]+"' order by adl.id DESC";
    multiConnection[dbName].query(sql,function(err,result)
    {
        console.log(err);
       // console.log("====caseAdminAccess===="+JSON.stringify(result));

        cb(null,result);

    })

}