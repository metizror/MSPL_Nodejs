/**
 * Created by cbl97 on 20/5/16.
 */


exports.orderManger = function(req,res)
{
    var orderId=0;
    var toDate=0;
    var fromDate =0;
    var serviceTo =0;
    var serviceFrom =0;
    var supplierName =0;
    var serviceName=0;
    var category =0;
    var status =-1;
    var userName =0;
    var clientMobile =0;
    var supplierBranchId =0;
    var accessToken =0;

    async.auto({
        checkBlank:function(cb)
        {
            if(req.body && req.body.supplier_branch_id && req.body.accessToken &&(req.body.order_id||req.body.to_date||req.body.from_date||req.body.service_to||req.body.service_from||req.body.supplier_name||req.body.service_name||req.body.category||req.body.status||req.body.username||req.body.client_mobile))
            {
                 supplierBranchId = req.body.supplier_branch_id;
                 accessToken = req.body.accessToken;
                 orderId=req.body.order_id;
                 toDate=req.body.to_date;
                 fromDate =req.body.from_date;
                 serviceTo =req.body.service_to;
                 serviceFrom =req.body.service_from;
                 supplierName =req.body.supplier_name;
                 serviceName=req.body.service_name;
                 category =req.body.category;
                 status =req.body.status;
                 userName =req.body.username;
                clientMobile =req.body.client_mobile;
                cb(null);
            }
            else {
                sendResponse.somethingWentWrongError(res);
            }
        },
        byOrder :['checkBlank' ,function(cb)
        {
            if(req.body.orderId!=0)
            {

            }
            else {
                cb(null);
            }
            var sql = ' select orders.id as orderId , product_ml.name , product_ml.language_id,language.language_name ' +
                   ' from orders '+
            ' join order_prices on order_prices.order_id = orders.id '+
            ' join product_ml  on product_ml.product_id = order_prices.product_id '+
            ' join language  on language.id = product_ml.language_id '+
                ' join product on product.id = order_prices.product_id '+
                '  join categories_ml cl on cl.category_id =  product.category_id '+
                ' join user on user.id = orders.user_id ' +
            ' where orders.supplier_branch_id = ? and orders.id =? or orders.created_on = in( ? ,? )  ' +
                ' or orders.service_date = in( ? ,? ) ' +
                ' or cl.name like %'+category+'%  ' +
                '  or orders.status = ? ' +
                ' or user.phone_no = ? ' +
                ' or user.name = ? '

            multiConnection[dbName].query(sql,[supplierBranchId ,orderId],function(err,result)
            {
                if(err)
                    sendResponse.somethingWentWrongError(res);
                else
                    cb(null,result);

            });


        }] ,
        byBooking :['checkBlank',function(cb)
        {
            if(req.body.toDate!=0 && req.body.fromDate!=0 )
            {
                var sql = ' select orders.id as orderId , product_ml.name , product_ml.language_id,language.language_name ' +
                    ' from orders '+
                    ' join order_prices on order_prices.order_id = orders.id '+
                    ' join product_ml  on product_ml.product_id = order_prices.product_id '+
                    ' join language  on language.id = product_ml.language_id '+
                    ' where orders.created_on = in( ? ,? ) and orders.supplier_branch_id =? '
                multiConnection[dbName].query(sql,[toDate ,fromDate , supplierBranchId],function(err,result)
                {
                    if(err)
                        sendResponse.somethingWentWrongError(res);
                    else
                        cb(null,result);

                });

            }
            else {
                cb(null);
            }



        }] ,
        byService : ['checkBlank' , function(cb)
        {
            if(req.body.serviceTo!=0 && req.body.serviceFrom!=0 )
            {
                var sql = ' select orders.id as orderId , product_ml.name , product_ml.language_id,language.language_name ' +
                    ' from orders '+
                    ' join order_prices on order_prices.order_id = orders.id '+
                    ' join product_ml  on product_ml.product_id = order_prices.product_id '+
                    ' join language  on language.id = product_ml.language_id '+
                    ' where orders.service_date = in( ? ,? ) and orders.supplier_branch_id =? '
                multiConnection[dbName].query(sql,[orderId],function(err,result)
                {
                    if(err)
                        sendResponse.somethingWentWrongError(res);
                    else
                        cb(null,result);

                });

            }
            else {
                cb(null);
            }


        }] ,
        bySupplierName: ['checkBlank' ,function(cb)
        {
            if(req.body.supplierName!=0)
            {
                var sql = ' select orders.id as orderId , product_ml.name , product_ml.language_id,language.language_name ' +
                    ' from orders '+
                    ' join order_prices on order_prices.order_id = orders.id '+
                    ' join product_ml  on product_ml.product_id = order_prices.product_id '+
                    ' join language  on language.id = product_ml.language_id '+
                    ' where orders.supplier_branch_id = ? and orders.id =? '
                multiConnection[dbName].query(sql,[orderId],function(err,result)
                {
                    if(err)
                        sendResponse.somethingWentWrongError(res);
                    else
                        cb(null,result);

                });

            }
            else {
                cb(null);
            }


        }] ,
        byServiceName : ['checkBlank',function(cb)
        {
            if(req.body.serviceName!=0)
            {
                cb(null);

            }
            else {
                cb(null);
            }

        }] ,
        byCategory : ['checkBlank',function(cb)
        {
            if(req.body.category!=0)
            {
                var sql = ' select orders.id as orderId , product_ml.name , product_ml.language_id,language.language_name ' +
                    ' from orders '+
                    ' join order_prices on order_prices.order_id = orders.id '+
                    ' join product_ml  on product_ml.product_id = order_prices.product_id '+
                    ' join language  on language.id = product_ml.language_id '+
                    ' join product on product.id = order_prices.product_id '+
                    '  join categories_ml cl on cl.category_id =  product.category_id '+
                    ' where orders.supplier_branch_id = ? and cl.name like %'+category+'% ' ;
                multiConnection[dbName].query(sql,function(err,result)
                {
                    if(err)
                        sendResponse.somethingWentWrongError(res);
                    else
                        cb(null,result);

                });

            }
            else {
                cb(null);
            }


        }] ,
        byStatus : ['checkBlank' ,function(err,result)
        {
            if(req.body.status!=0)
            {
                var sql = ' select orders.id as orderId , product_ml.name , product_ml.language_id,language.language_name ' +
                    ' from orders '+
                    ' join order_prices on order_prices.order_id = orders.id '+
                    ' join product_ml  on product_ml.product_id = order_prices.product_id '+
                    ' join language  on language.id = product_ml.language_id '+
                    ' where orders.status = ? and orders.supplier_branch_id =? '
                multiConnection[dbName].query(sql,[status,supplierBranchId],function(err,result)
                {
                    if(err)
                        sendResponse.somethingWentWrongError(res);
                    else
                        cb(null,result);

                });

            }
            else {
                cb(null);
            }


        }] ,
        byUserName : ['checkBlank' ,function(cb)
        {
            if(req.body.username!=0)
            {

            }
            else {
                cb(null);
            }


        }] ,
        byMobile :['checkBlank' , function(cb)
        {
            if(req.body.orderId!=0)
            {
                var sql = ' select orders.id as orderId , product_ml.name , product_ml.language_id,language.language_name ' +
                    ' from orders '+
                    ' join order_prices on order_prices.order_id = orders.id '+
                    ' join product_ml  on product_ml.product_id = order_prices.product_id '+
                    ' join language  on language.id = product_ml.language_id '+
                    ' join user on user.id = orders.user_id ' +
                    ' where user.phone_no = ? and  orders.supplier_branch_id =? '
                multiConnection[dbName].query(sql,[clientMobile ,supplierBranchId],function(err,result)
                {
                    if(err)
                        sendResponse.somethingWentWrongError(res);
                    else
                        cb(null,result);

                });

            }
            else {
                cb(null);
            }


        }]

    },function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })


}

