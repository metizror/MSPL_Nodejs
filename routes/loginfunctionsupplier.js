/**
 * Created by cbl98 on 11/5/16.
 */
var async= require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var log4js = require('log4js');
var logger = log4js.getLogger();
var chunk = require('chunk');
logger.level = config.get('server.debug_level');
var func = require('./commonfunction');
var Execute = require('../lib/Execute');
const Universal=require('../util/Universal')
const moment = require('moment');
const users = require('./user')
exports.listSupplierProducts = function(dbName,res, supplierId,categoryId,subCategoryId,detailedSubCategoryId,limit,offset,serachText,callback) {
   // console.log(".........aaa.......",supplierId,categoryId,subCategoryId,detailedSubCategoryId,limit,offset);
    var productIds =[];
    var product_Count = 0;
    async.auto({
        productList:function(cb){
            if(serachText!=undefined && serachText!=""){
                var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.pricing_type,p.duration,p.quantity,p.is_product,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
                sql += " from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit join supplier_product sp on sp.product_id =p.id ";
                sql += " where sp.supplier_id = ? and sp.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? "
                sql += "and (p.id LIKE '%"+serachText+"%' or p.bar_code LIKE '%"+serachText+"%' or p.name LIKE '%"+serachText+"%'";
                sql += "or p.sku LIKE '%"+serachText+"%' or p.product_desc LIKE '%"+serachText+"%' or c.name LIKE '%"+serachText+"%'  or c.name LIKE '%"+serachText+"%')  ORDER BY p.id DESC LIMIT ?,?";
               
            }
            else{
                var sql = "select br.id as brand_id,br.name as brand_name,br.image as brand_image,p.pricing_type,p.duration,p.quantity,p.is_product,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
                sql += " from product p left join brands br on br.id=p.brand_id join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit join supplier_product sp on sp.product_id =p.id ";
                sql += " where sp.supplier_id = ? and sp.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ORDER BY p.id DESC LIMIT ?,? ";
            }
                let stmt = multiConnection[dbName].query(sql, [supplierId, 0,categoryId,subCategoryId,detailedSubCategoryId,offset,limit],function(err,result){
                     console.log("....................productList....................",err,result,stmt.sql);
                     if(err){
                         cb(err)
                     }
                    if(result && result.length){
                        console.log("=========result==============",result)
                        productIds = result;
                        product_Count = productIds.length;
                        cb(null);
                    }else{
                        cb(null);
                    }
                })
            
        },
        getProductImage:['productList',function(cb){
            if(productIds && productIds.length){
                var len = productIds.length;
                for(var k = 0;k<len;k++){
                    (function(k){
                        var temp = [];
                        var sql = "select product_id,image_path,default_image,imageOrder from product_image where product_id = ?";
                        multiConnection[dbName].query(sql, [productIds[k].id],function(err,result){
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
                                cb(null);
                            }
                        })
                    }(k));
                }
            }else{
                cb(null)

            }
        }],
        getProductMl:['productList',function(cb){
            if(productIds && productIds.length){
                var len = productIds.length;
                for(var i =0;i < len;i++){
                    (function(i){
                        var sql = "select pml.id as product_multi_id,l.language_name,pml.language_id,pml.name,	pml.product_desc,pml.measuring_unit from product_ml pml join language l on l.id = pml.language_id where product_id = ?";
                        multiConnection[dbName].query(sql, [productIds[i].id],function(err,result) {
                            productIds[i].names = result;
                            if(i == (len -1)){
                                cb(null)
                            }
                        })
                    }(i));
                }
            }else{
                cb(null)
            }
        }],
        getProductVariant:['getProductMl',function(cb){
            if(productIds && productIds.length){
                var len = productIds.length;
                for(var i =0;i < len;i++){
                    (function(i){
                        var vsql = "select variants.id as vaiant_id,variants.value,product_variants.product_id,product_variants.id from product_variants inner join variants on variants.id=product_variants.variant_id where product_variants.product_id=?";
                        multiConnection[dbName].query(vsql, [productIds[i].id],function(err,vData) {
                            productIds[i].variant = vData;
                            if(i == (len -1)){
                                cb(null)
                            }
                        })
                    }(i));
                }
            }else{
                cb(null)
            }
        }],
        getProductPrice:['getProductVariant',function(cb){
            if(productIds && productIds.length){
                var len = productIds.length;
                for(var i =0;i < len;i++){
                    (function(i){
                        var sql = "SELECT p.id,p.pricing_type,p.start_date,p.end_date,p.price,p.display_price,p.handling,p.handling_supplier";
                            sql += " ,p.price_type,";
                            sql += " p.delivery_charges from product_pricing p join supplier_product s on p.product_id = s.product_id where ";
                            sql += " p.is_deleted = ? and p.product_id = ? " +
                                " and ((p.pricing_type=1) or(p.pricing_type=0 and p.price !=0))";
                        multiConnection[dbName].query(sql, [0,productIds[i].id],function(err,priceData) {
                            productIds[i].price = priceData;
                            if(i == (len -1)){
                                cb(null)
                            }
                        })
                }(i));
            }}
            else{
                cb(null)
            }
        }] 
        // last:['getProductMl','getProductImage','getProductVariant','getProductPrice',function(cb){
        //     var sql = "select p.duration,p.is_product,p.id,p.bar_code,p.product_desc,p.sku,p.is_live,p.commission_type,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,c.is_barcode,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name  ";
        //     sql += " from product p join categories c on c.id = p.category_id join currency_conversion curr on curr.id = p.price_unit join supplier_product sp on sp.product_id =p.id ";
        //     sql += " where sp.supplier_id = ? and sp.is_deleted = ? and p.category_id = ? and p.sub_category_id = ? and p.detailed_sub_category_id = ? ";
        //     multiConnection[dbName].query(sql, [supplierId, 0,categoryId,subCategoryId,detailedSubCategoryId],function(err,result){
        //         if(result){
        //             product_Count = result.length;
        //             cb(null);
        //         }else{
        //             product_Count = 0;
        //             cb(null);
        //         }
        //     })
        // }]
    },function(err,result){
        if(err){
            callback(err);
        }else{

            // console.log("...productIds..",productIds);
            callback(null,{products:productIds,product_count:product_Count})
        }
    })
   
   
   
   
   
   /*
    var sql = "select p.id,p.bar_code,p.sku,p.is_live,p.commission,p.commission_package,p.category_id,p.sub_category_id,p.detailed_sub_category_id,p.commission_type,c.name category_name,c.chemical_tools_price_applicable,c.services_at_home_price_applicable,curr.currency_name from supplier_product sp ";
    sql += " join product p on sp.product_id = p.id join categories c on c.id = p.category_id join currency_conversion curr ";
    sql += " on curr.id = p.price_unit where sp.supplier_id = ? and sp.is_deleted = ? and sp.category_id = ? and sp.sub_category_id = ? and " +
        " sp.detailed_sub_category_id = ? ORDER BY p.id DESC LIMIT ?,? ";
    multiConnection[dbName].query(sql, [supplierId,0,categoryId,subCategoryId,detailedSubCategoryId,limit,offset], function (err, products) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        }
        else {
            var sql2 = "select p.id,p.name,l.language_name,p.language_id,p.product_id,p.product_desc,p.measuring_unit from product_ml p join language l on p.language_id = l.id";
            multiConnection[dbName].query(sql2, function (err, productMultiLanguage) {
                if (err) {
                    sendResponse.somethingWentWrongError(res);
                }
                else {
                    var productLength = products.length;
                    var languageLength = productMultiLanguage.length;

                    if (!productLength) {
                       // console.log("sending null=====");
                        callback(null, [])
                    }
                    else {
                        for (var i = 0; i < productLength; i++) {
                            (function (i) {
                                var names = [];

                                for (var j = 0; j < languageLength; j++) {
                                    (function (j) {
                                        if (products[i].id == productMultiLanguage[j].product_id) {
                                            names.push({
                                                "product_multi_id":productMultiLanguage[j].id,
                                                "name": productMultiLanguage[j].name,
                                                "langauge_id": productMultiLanguage[j].language_id,
                                                "language_name": productMultiLanguage[j].language_name,
                                                "product_desc": productMultiLanguage[j].product_desc,
                                                "measuring_unit": productMultiLanguage[j].measuring_unit

                                            });
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
                                                    callback(null, products);
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

    })*/


}

exports.productinfo = function(dbName,res,supplierId,cb) {
var sql='select p.id,p.name from product p join supplier_product sp on p.id= sp.product_id where sp.supplier_id=?'
    multiConnection[dbName].query(sql,[supplierId],function(err,products){
        if(err)
        {
            sendResponse.somethingWentWrongError(res);
        }
        else 
        {
            cb(null,products);
        }
    })
}

exports.showBranchListing = function(dbName,supplierId,res,cb)
{
    var sql = ' select id , name from supplier_branch where supplierId = ? ';
    multiConnection[dbName].query(sql , function(err,result)
    {
        if(err)
            sendResponse.somethingWentWrongError(res);
        else
            cb(null,result);
    })
}


/*
section id:12 ;It returns subupplier for Supplier-Admin
 */
exports.listofSubsupplier =function(dbName,res,supplierId,callback) {
    var sql = "select id,email,is_active from supplier_admin where is_superadmin = ? and created_by_supplier= ?"
    multiConnection[dbName].query(sql,[0,supplierId],function(err,result)
    {
        if(err){
            sendResponse.somethingWentWrongError(res);
        }
        else{
            callback(null,result);
        }

    })
}


exports.adminOrders= function(dbName,res,limit,offset,serachText,serachType,tab_status,sub_status,payment_type,
    start_date,
    end_date,
    callback) {
  console.log(".....",serachText,limit);
  

   var product=[];
    var results=[];
    var cate=[];
    var total_orders,sql;
    async.auto({
        orders:function (cb) {
            
            if(limit){
                console.log("=============after count==============",tab_status)

                if(tab_status==0){
                    console.log("==============after tab status=========")
                    if(serachType==0){
                        console.log("==========status=======")
                         sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.referral_amount,o.payment_source,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                            "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                            "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=0 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" group by id order by o.id DESC LIMIT ?,?";
                    }   
                        else {
                         sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,sb.supplier_id,o.zelle_receipt_url,o.self_pickup,o.preparation_time,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                            "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                            "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=0 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                            " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                    }

                }else if(tab_status==1){
                    if(sub_status==1){
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=1 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=1 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }else if(sub_status==3){
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=3 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=3 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }else if(sub_status==10){
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=10 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=10 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }else if(sub_status==11){
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=11  and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=11 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }else {
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and (o.status=1 or o.status=3 or o.status=10 or o.status=11)  group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.status=1 or o.status=3 or o.status=10 or o.status=11) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }

                }else if(tab_status==2){
                    if(sub_status==2){
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=2 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=2 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }else if(sub_status==5){
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=5 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=5 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }else if(sub_status==8){
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=8 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where o.status=8 and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }else{
                        if(serachType==0){
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.status=8 or o.status=2 or o.status=5 or o.status=6) group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.created_by,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.status=8 or o.status=2 or o.status=5 or o.status=6) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') group by id order by o.id DESC LIMIT ?,?";   
                        }

                    }

                }

                if (payment_type = 2) {
                    sql = sql.replace("and o.payment_type=2", "")
                }
                
               var st= multiConnection[dbName].query(sql,[offset,limit],function (err,orders) {
                    console.log(st.sql);
                    if(err)
                    {
                        console.log('error------',err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else if(orders.length) {
                        results = orders;
                        // console.log('asdf------',results);
                        cb(null);
                    }
                    else {
                        var data = [];
                        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

                    }
                })
            }
            else {
                 sql='select o.created_by,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.self_pickup,crt.area_id,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id '+
                    'join user u on o.user_id=u.id where o.status != 9 group by id order by o.id DESC';
                multiConnection[dbName].query(sql,function (err,orders) {
                    if(err)
                    {
                        console.log('error------',err);
                        sendResponse.somethingWentWrongError(res);

                    }
                    else if(orders.length) {
                        results = orders;
                        //console.log('asdf------',results);
                        cb(null);
                    }
                    else {
                        var data = [];
                        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

                    }
                })
            }
        },
        total_order_count:['orders',function(cb){
            var final_count_query=sql.split('LIMIT')[0]; 
            var st= multiConnection[dbName].query(final_count_query,function (err,orderslength) {
                console.log(st.sql);
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    total_orders = orderslength && orderslength.length>0?orderslength.length:0;
                    // console.log('asdf------',results);
                    cb(null);
                }
               
            })
        }],
        product:['total_order_count',async function(cb){
            var sql2='select op.id as orderPriceId,op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
            let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
            var is_decimal_quantity_allowed = "0";
            if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
            }
            multiConnection[dbName].query(sql2,function (err,product1) {
                let temp_price;
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    console.log("======temp price now ===1.1.1==",temp_price)
                for(var i=0;i<results.length;i++) {
                    (function (i) {
                        console.log("======temp price now ===1.1==",temp_price)
                        product=[];
                        temp_price = 0;
                        for(var j=0;j<product1.length;j++)
                        {
                            (function(j){
                                // console.log("======temp price now ===1==",temp_price)
                                if(product1[j].order_id == results[i].id)
                                {
                                    var productDetail = {
                                        product_name : product1[j].product_name,
                                        product_quantity : product1[j].quantity,
                                        product_image : product1[j].product_image,
                                        price : product1[j].price,
                                        orderPriceId:product1[j].orderPriceId
                                    }
                                    console.log("======temp price now ===2==",temp_price,productDetail.price)

                                    if(is_decimal_quantity_allowed == "1"){
                                        temp_price = Number(productDetail.price) * parseFloat(productDetail.product_quantity) + temp_price
                                    }else{
                                        temp_price = Number(productDetail.price) * Number(productDetail.product_quantity) + temp_price
                                    }
                                    console.log("======temp price now ===3==",temp_price)
                                    product.push(productDetail)
                                    if(j==product1.length-1) {
                                        console.log("======temp price now ===4==",temp_price)
                                        results[i].total_order_price = temp_price
                                        results[i].product=product;
                                    }
                                }
                                else {
                                    if(j==product1.length-1)
                                    {
                                        console.log("======temp price now ===5==",temp_price)
                                        results[i].total_order_price = temp_price
                                        results[i].product=product;
                                    }
                                }
                            }(j));

                        }
                        if(i==results.length-1)
                        {
                            cb(null);
                        }
                }(i))

                }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.terminology,c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                  
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].order_id == results[i].id)
                                    {
                                        cate.push({
                                            name:cat[j].name,
                                            terminology:cat[j].terminology
                                        }
                                            // cat[j].name
                                            );
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            var result=results.sort(func.sort_by('id', true, parseInt));
            //data.orders=result;
            callback(null,{orders:result,total_count:total_orders});
        }
    })
}
exports.adminOrdersV2 =async function(req,dbName,res,limit,offset,serachText,
    serachType,tab_status,sub_status,payment_type,
    start_date,
    end_date,
    country_code,
    country_code_type,
    is_dine_in,
    agent_id,
    filter_by,
    callback) {
    let orderGrouping=await Universal.getKeysValue(["order_grouping"],req.dbName);
    let groupBySql=orderGrouping && orderGrouping.length>0?"group by o.grouping_id":"group by id";
    let countGroupOrderSql=orderGrouping && orderGrouping.length>0?",(SELECT COUNT(orss.id) from orders orss where orss.grouping_id=o.grouping_id) as totalGroupingOrder,":",";
    let totalOrderIdsSql=orderGrouping && orderGrouping.length>0?",(SELECT group_concat(DISTINCT(orss1.id)) from orders orss1 where orss1.grouping_id=o.grouping_id) as  order_ids":"";


    let dine_in_orders_check = ""
    if(parseInt(is_dine_in)>0){
        dine_in_orders_check = " and o.is_dine_in =1 "
    }
  console.log(".....",serachText,limit);
  
   var product=[];
    var results=[];
    var cate=[];
    var total_orders,sql;
    let sqlCount=""
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
    let agent_order_check = ""
    if(parseInt(agent_id)!==0){
        agent_order_check= " and  ao.agent_id="+agent_id+" "
    }

    let flexpay_on=await Execute.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",["flexpay_on"]);
    let flexpay_check = ""
 if(flexpay_on && flexpay_on.length>0 && flexpay_on[0].value==1){
    flexpay_check= ",crt.flexpay_status,crt.flexpay_id"
 }



   let agent_assign_order_filter = "";
   let rating_given_filter = "";
   let agent_assign_order_filter_2 = "";
   let rating_given_filter_2 = "";


    if(parseInt(filter_by)!==0){
        if(parseInt(filter_by)==1){
            agent_assign_order_filter = " join "+dbName+"_agent.cbl_user_orders aos ON aos.order_id = o.id and aos.user_id!=0 ";
            agent_assign_order_filter_2 = " join "+dbName+"_agent.cbl_user_orders aos ON aos.order_id = o2.id and aos.user_id!=0 ";
        }else if(parseInt(filter_by)==2){
            rating_given_filter = " join supplier_rating srt ON srt.order_id = o.id ";
            rating_given_filter_2= " join supplier_rating srt ON srt.order_id = o2.id ";
        }
    }



    async.auto({
        orders:async function (cb) {
            
            if(limit){
                console.log("=============after count==============",tab_status);
                
                if(tab_status==0){
                    console.log("==============after tab status=========")
                  
                    let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=0) >= 1":"";


                    if(serachType==0){
                        console.log("==========status=======")
                       

                         sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.referral_amount,o.payment_source,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no "+flexpay_check+" " +
                            "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                            " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where o.status=0 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";
                    }   
                        else {
                         sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,s.is_own_delivery,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,sb.supplier_id,o.zelle_receipt_url,o.self_pickup,o.preparation_time,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no  "+flexpay_check+" " +
                            "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                            " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where o.status=0 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                            " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                    }
  
                }else if(tab_status==1){
                    if(sub_status==1){
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=1)=totalGroupingOrder":"";
                        if(serachType==0){
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left  join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=1 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=1 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==3){
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=3)=totalGroupingOrder":"";
                        if(serachType==0){
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left  join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=3 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=3 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==10){
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=10)=totalGroupingOrder":"";
                        if(serachType==0){
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=10 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id   "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=10 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==11){
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=11)=totalGroupingOrder":"";
                        if(serachType==0){
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=11 "+dine_in_orders_check+" "+agent_order_check+"  and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by order by o.id LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=11 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                    else if(sub_status==4){
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=1 or o.status=3 or o.status=10 or o.status=11)=totalGroupingOrder":"";
                        if(serachType==0){
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and (o.status=1 or o.status=3 or o.status=10 or o.status=11)  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"   where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=1 or o.status=3 or o.status=10 or o.status=11) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                    else {
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=1 or o.status=3 or o.status=10 or o.status=11 or o.status=4)=totalGroupingOrder":"";
                        if(serachType==0){
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" "+dine_in_orders_check+" and (o.status=1 or o.status=3 or o.status=10 or o.status=11 or o.status=4)  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.created_on DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.supplier_branch_id,s.qb_customer_id,o.table_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.created_on,o.zone_offset,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"'  "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=1 or o.status=3 or o.status=10 or o.status=11 or o.status=4) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                }else if(tab_status==2){
                    if(sub_status==2){
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=2)=totalGroupingOrder":"";
                        if(serachType==0){
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id, o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=2 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id  DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id, o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=2 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==5){
                        agent_assign_order_filter="";
                        rating_given_filter="";
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=5)=totalGroupingOrder":"";
                        let paymentMethodSql=parseInt(payment_type)!=2?"and o.payment_type="+payment_type+"":""
                        if(serachType==0){

                             sql="SELECT temp.*,s.name as supplier,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no,crt.area_id,sb.address as branch_address,sb.supplier_id,IFNULL(odp.discountAmount,0) as discountAmount,sb.branch_name,s.is_own_delivery,s.is_own_delivery,dc.name as delivery_company_name,dc.id as delivery_company_id from (select o.is_dine_in "+countGroupOrderSql+" o.grouping_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.delivered_on,o.is_payment_confirmed,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,o.payment_source,o.referral_amount,o.cart_id,o.delivery_company_id,o.user_id,o.user_delivery_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,o.status " +
                                "from orders o where o.status=5 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' "+country_code_query+" "+groupBySql+" "+havingGroupClause+" "+paymentMethodSql+"  order by o.id DESC LIMIT ?,?) as temp join order_prices op on temp.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=temp.cart_id "+
                                " left join delivery_companies dc on dc.id = temp.delivery_company_id left join agent_orders ao on ao.order_id=temp.id  join user u on temp.user_id=u.id left join user_address ua on ua.id=temp.user_delivery_address left join order_promo odp on odp.orderId = temp.id "+agent_assign_order_filter+" "+rating_given_filter+"   group by id" 
                                sqlCount="select COUNT(o.id) as total_orders from orders o where o.status=5 "+dine_in_orders_check+"  and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' "+paymentMethodSql+"  "
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=5 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                "  or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" "+groupBySql+" "+havingGroupClause+"  order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==8){
                        let havingGroupClause=orderGrouping && orderGrouping.length>0?"HAVING COUNT(o.status=8)=totalGroupingOrder":"";
                        if(serachType==0){
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=8 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in"+totalOrderIdsSql+""+countGroupOrderSql+"o.grouping_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=8 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" "+groupBySql+" "+havingGroupClause+" order by o.id DESC LIMIT ?,?";   
                        }

  
                    }else{
                        
                       


                        if(serachType==0){
                            sql="select u.email AS User_Name,dc.name as delivery_company_name,o2.is_payment_confirmed,o2.delivery_company_id, s.name AS supplier, ua.address_link, ua.customer_address, ua.latitude, ua.longitude, ua.landmark, ua.pincode, ua.address_line_1, ua.address_line_2, u.mobile_no, sb.branch_name, Ifnull(odp.discountamount, 0) AS discountAmount, sb.address AS branch_address, crt.area_id, sb.supplier_id,o2.is_dine_in, o2.wallet_discount_amount, o2.delivery_charges, o2.handling_supplier, o2.handling_admin, o2.approve_rejection_reason, o2.payment_status, o2.type, o2.tip_agent, o2.user_service_charge, o2.pres_description, o2.pres_image1, o2.pres_image2,o2.delivered_on, o2.pres_image3, o2.pres_image4, o2.pres_image5, o2.payment_source, o2.referral_amount, o2.self_pickup, o2.zelle_receipt_url, o2.preparation_time, o2.is_agent, o2.payment_type,group_concat(o2.id) as order_ids, o2.net_amount, o2.id, o2.created_on, o2.schedule_date, o2.status,o2.supplier_branch_id,o2.cart_id,o2.user_id,o2.user_delivery_address from (SELECT o.is_dine_in,o.grouping_id, o.is_payment_confirmed,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.delivery_company_id, o.delivery_charges, o.handling_supplier, o.handling_admin, o.approve_rejection_reason,o.delivered_on, o.payment_status, o.type, o.tip_agent, o.user_service_charge, o.pres_description, o.pres_image1, o.pres_image2, o.pres_image3, o.pres_image4, o.pres_image5, o.payment_source, o.referral_amount, o.self_pickup, o.zelle_receipt_url, o.preparation_time, o.is_agent, o.payment_type, o.net_amount, o.id, o.created_on, o.schedule_date, o.status,o.supplier_branch_id,o.cart_id,o.user_id,o.user_delivery_address from orders o ORDER BY o.id DESC LIMIT "+offset+", "+parseInt(offset)+parseInt(limit)+") as o2 JOIN supplier_branch sb ON sb.id = o2.supplier_branch_id JOIN supplier s ON sb.supplier_id = s.id LEFT JOIN cart crt ON crt.id = o2.cart_id LEFT JOIN agent_orders ao ON ao.order_id = o2.id JOIN user u ON o2.user_id = u.id left join delivery_companies dc on dc.id = o2.delivery_company_id LEFT JOIN user_address ua ON ua.id = o2.user_delivery_address LEFT JOIN order_promo odp ON odp.orderid = o2.id WHERE Date(o2.created_on) >= '1991-01-11' AND Date(o2.created_on) <= '2025-01-11' AND ( o2.status = 8 OR o2.status = 2 OR o2.status = 5 OR o2.status = 6 ) GROUP BY o2.id order by o2.id DESC LIMIT ?, ?"
                            
                            // sqlCount="select * from (SELECT COUNT(*) as total_orders,o.is_dine_in,group_concat(DISTINCT(o.id)) as order_ids,o.grouping_id, o.wallet_discount_amount, o.delivery_charges,o.delivered_on, o.handling_supplier, o.handling_admin, o.approve_rejection_reason, o.payment_status, o.type, o.tip_agent, o.user_service_charge, o.pres_description, o.pres_image1, o.pres_image2, o.pres_image3, o.pres_image4, o.pres_image5, o.payment_source, o.referral_amount, o.self_pickup, o.zelle_receipt_url, o.preparation_time, o.is_agent, o.payment_type, o.net_amount, o.id, o.created_on, o.schedule_date, o.status,o.supplier_branch_id,o.cart_id,o.user_id,o.user_delivery_address from orders o ORDER BY o.id ) as o2 JOIN supplier_branch sb ON sb.id = o2.supplier_branch_id JOIN supplier s ON sb.supplier_id = s.id LEFT JOIN cart crt ON crt.id = o2.cart_id LEFT JOIN agent_orders ao ON ao.order_id = o2.id JOIN user u ON o2.user_id = u.id LEFT JOIN user_address ua ON ua.id = o2.user_delivery_address LEFT JOIN order_promo odp ON odp.orderid = o2.id  "+agent_assign_order_filter_2+" "+rating_given_filter_2+"  WHERE Date(o2.created_on) >= '1991-01-11' AND Date(o2.created_on) <= '2025-01-11' AND ( o2.status = 8 OR o2.status = 2 OR o2.status = 5 OR o2.status = 6 ) GROUP BY o2.id"

                            sqlCount="SELECT COUNT(DISTINCT o.id) as total_orders from orders o JOIN user u ON o.user_id = u.id "+agent_assign_order_filter_2+" "+rating_given_filter_2+"  WHERE Date(o.created_on) >= '1991-01-11' AND Date(o.created_on) <= '2025-01-11' AND ( o.status = 8 OR o.status = 2 OR o.status = 5 OR o.status = 6 )"

                           
                        }   
                            else {
                             sql="select dc.name as delivery_company_name,o.is_payment_confirmed,o.delivered_on,dc.id as delivery_company_id,o.is_dine_in"+totalOrderIdsSql+",o.grouping_id,o.wallet_discount_amount,o.delivery_latitude,o.delivery_longitude,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=8 or o.status=2 or o.status=5 or o.status=6) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" "+groupBySql+" order by o.id DESC LIMIT ?,?";   

                        }
  
                    }
  
                }
  
                if (payment_type = 2) {
                    sql = sql.replace("and o.payment_type=2", "")
                }
  
                let orders = await Execute.Query(dbName,sql,[offset,parseInt(offset)+parseInt(limit)]);
                if(orders.length){
                    results = orders;
                    let query = "select `key`,value from tbl_setting where `key`=? and value='1'";
                    let orderCancelCheck = await Execute.Query(dbName,query,["enable_cancel_order_with_time"]);

                    if(orderCancelCheck && orderCancelCheck.length>0){
                        if(results && results.length>0){
                            for(const [index,i] of results.entries()){
                                if(parseInt(i.status)==0){
                                    logger.debug("========i.status=====",i.status);
                                    let currentDateTime = moment().utcOffset(i.zone_offset).format("YYYY-MM-DD HH:mm:ss");
                                    let orderCreatedDateTime = moment(new Date(i.created_on)).format("YYYY-MM-DD HH:mm:ss");
                                    let diff = moment.duration(moment(currentDateTime).diff(moment(orderCreatedDateTime)));
                                    diff = parseInt(diff.asMinutes());

                                    logger.debug("=currentDateTime==========orderCreatedDateTime===diff======",
                                    currentDateTime,orderCreatedDateTime,diff)
                                    if(diff>2){
                                        await users.cancelOrdersNewWithPromises(dbName,res,i.user_id,
                                            i.id,1)
                                    }
                                }
                                if(index==results.length-1){
                                    cb(null);
                                }
                            }
                        }else{
                            cb(null);
                        }
                    }else{
                        cb(null);
                    }

                }else{
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
                }
           
            }
            else {
  
                 sql='select o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.self_pickup,crt.area_id,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id left join user_address ua on ua.id=o.user_delivery_address left join cart crt on crt.id=o.cart_id '+
                    'join user u on o.user_id=u.id where o.status != 9 '+country_code_query+'  '+groupBySql+' order by o.id DESC';
                let orders = await Execute.Query(dbName,sql,[]);
                if(orders.length){
                    results = orders;
                    cb(null);
                }else{
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
                }
  
            }
        },
        total_order_count:['orders',async function(cb){
            if(sqlCount!=""){
                // var final_count_query=sql.split('LIMIT')[0]; 
                let orderslength = await Execute.Query(dbName,sqlCount,[]);
                total_orders = orderslength && orderslength.length>0?orderslength[0].total_orders:0
                cb(null);
            }
            else{
            var final_count_query=sql.split('LIMIT')[0]; 
            let orderslength = await Execute.Query(dbName,final_count_query,[]);
            total_orders = orderslength && orderslength.length>0?orderslength.length:0
            cb(null);
            }
  
           
        }],
        product:['total_order_count',async function(cb){
           var sql2='select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
  
            let product1 = await Execute.Query(dbName,sql2,[]);

            let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
            var is_decimal_quantity_allowed = "0";
            if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
            }
            let temp_price;
            console.log("======temp price now ===1.1.1==",temp_price)
            for(var i=0;i<results.length;i++) {
                (function (i) {
                    console.log("======temp price now ===1.1==",temp_price)
                    results[i].net_amount=parseFloat(results[i].net_amount)-parseFloat(results[i].discountAmount)-parseFloat(results[i].referral_amount)-parseFloat(results[i].wallet_discount_amount)
                    product=[];
                    temp_price = 0;
                    for(var j=0;j<product1.length;j++)
                    {
                        (function(j){
                            // console.log("======temp price now ===1==",temp_price)
                            if(product1[j].order_id == results[i].id)
                            {
                                var productDetail = {
                                    product_name : product1[j].product_name,
                                    product_quantity : product1[j].quantity,
                                    product_image : product1[j].product_image,
                                    price : product1[j].price
                                }
                                console.log("======temp price now ===2==",temp_price,productDetail.price)
                                if(is_decimal_quantity_allowed == "1"){
                                    temp_price = Number(productDetail.price) * parseFloat(productDetail.product_quantity) + temp_price
                                }else{
                                    temp_price = Number(productDetail.price) * Number(productDetail.product_quantity) + temp_price
                                }

                                console.log("======temp price now ===3==",temp_price)
                                product.push(productDetail)
                                if(j==product1.length-1) {
                                    console.log("======temp price now ===4==",temp_price)
                                    results[i].total_order_price = temp_price
                                    results[i].product=product;
                                }
                            }
                            else {
                                if(j==product1.length-1)
                                {
                                    console.log("======temp price now ===5==",temp_price)
                                    results[i].total_order_price = temp_price
                                    results[i].product=product;
                                }
                            }
                        }(j));
  
                    }
                    if(i==results.length-1)
                    {
                        cb(null);
                    }
            }(i))
            }
        }],
        category:['product',async function(cb){
            var sql3='select c.terminology,c.name,c.id,op.order_id from order_prices op join supplier_branch_product sp on sp.product_id =op.product_id join categories c on c.id =sp.category_id';
            let cat = await Execute.Query(dbName,sql3,[]);
            for(var i=0;i<results.length;i++) {
                (function (i) {
                    cate=[];
                    for(var j=0;j<cat.length;j++)
                    {
                        (function(j){
                            if(cat[j].order_id == results[i].id)
                            {
                                cate.push({
                                    name:cat[j].name,
                                    terminology:cat[j].terminology
                                }
                                    // cat[j].name
                                    );
                                if(j==cat.length-1) {
                                    results[i].category=cate;
                                }
                            }
                            else {
                                if(j==cat.length-1)
                                {
                                    results[i].category=cate;
                                }
                            }
                        }(j));
                    }
                    if(i==results.length-1)
                    {
                        cb(null);
                    }
                }(i))
            }
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            // var result=results.sort(func.sort_by('id', true, parseInt));
            // data.orders=result;
            data.orders=results;
            callback(null,{orders:results,total_count:total_orders});
        }
    })

}


exports.adminOrdersV2Prev =async function(dbName,res,limit,offset,serachText,
    serachType,tab_status,sub_status,payment_type,
    start_date,
    end_date,
    country_code,
    country_code_type,
    is_dine_in,
    agent_id,
    filter_by,
    callback) {

        let dine_in_orders_check = ""
        if(parseInt(is_dine_in)>0){
            dine_in_orders_check = " and o.is_dine_in =1 "
        }
  console.log(".....",serachText,limit);
  
   var product=[];
    var results=[];
    var cate=[];
    var total_orders,sql;
    let sqlCount=""
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
    let agent_order_check = ""
    if(parseInt(agent_id)!==0){
        agent_order_check= " and  ao.agent_id="+agent_id+" "
    }

   let agent_assign_order_filter = "";
   let rating_given_filter = "";
   let agent_assign_order_filter_2 = "";
   let rating_given_filter_2 = "";
   let not_assigned_clause=""
   let select_unassigned_column=""

    if(parseInt(filter_by)!==0){
        if(parseInt(filter_by)==1){
            // left join agent_orders ao on ao.order_id=o.id
            agent_assign_order_filter = " join agent_orders aos ON aos.order_id = o.id ";
            agent_assign_order_filter_2 = " join agent_orders aos ON aos.order_id = o2.id ";
        }else if(parseInt(filter_by)==2){
            rating_given_filter = " join supplier_rating srt ON srt.order_id = o.id ";
            rating_given_filter_2= " join supplier_rating srt ON srt.order_id = o2.id ";
        }
        else if(parseInt(filter_by)==3){
            agent_assign_order_filter = "left join agent_orders aos ON aos.order_id = o.id ";
            agent_assign_order_filter_2 = "left join agent_orders aos ON aos.order_id = o2.id ";
            not_assigned_clause="having agent_assign_id=0 "
            select_unassigned_column="IFNULL(aos.id,0) as agent_assign_id,"
        }
    }


    async.auto({
        orders:async function (cb) {
            
            if(limit){
                console.log("=============after count==============",tab_status,sub_status)
  
                if(tab_status==0){

                    
                    
                    console.log("==============after tab status=========")
                    if(serachType==0){
                        console.log("==========status=======")
                         sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.referral_amount,o.payment_source,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                            "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                            " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where o.status=0 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                    }   
                        else {
                         sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,s.is_own_delivery,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,sb.supplier_id,o.zelle_receipt_url,o.self_pickup,o.preparation_time,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                            "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                            " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where o.status=0 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                            " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                    }
  
                }else if(tab_status==1){
                    if(sub_status==1){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left  join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=1 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=1 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==3){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left  join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=3 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=3 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==10){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=10 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id   "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=10 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==11){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=11 "+dine_in_orders_check+" "+agent_order_check+"  and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=11 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                    else if(sub_status==4){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and (o.status=1 or o.status=3 or o.status=10 or o.status=11)  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"   where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=1 or o.status=3 or o.status=10 or o.status=11) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                    else {
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" "+dine_in_orders_check+" and (o.status=1 or o.status=3 or o.status=10 or o.status=11 or o.status=4)  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=1 or o.status=3 or o.status=10 or o.status=11 or o.status=4) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                }else if(tab_status==2){
                    if(sub_status==2){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id, o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=2 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id, o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=2 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==5){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=5 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=5 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                "  or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==8){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=8 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.delivered_on,o.is_payment_confirmed,dc.name as delivery_company_name,dc.id as delivery_company_id,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=8 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }

  
                    }else{
                        if(serachType==0){
                            sql="select u.email AS User_Name,dc.name as delivery_company_name,o2.is_payment_confirmed,o2.delivery_company_id, s.name AS supplier, ua.address_link, ua.customer_address, ua.latitude, ua.longitude, ua.landmark, ua.pincode, ua.address_line_1, ua.address_line_2, u.mobile_no, sb.branch_name, Ifnull(odp.discountamount, 0) AS discountAmount, sb.address AS branch_address, crt.area_id, sb.supplier_id,o2.is_dine_in, o2.wallet_discount_amount, o2.delivery_charges, o2.handling_supplier, o2.handling_admin, o2.approve_rejection_reason, o2.payment_status, o2.type, o2.tip_agent, o2.user_service_charge, o2.pres_description, o2.pres_image1, o2.pres_image2,o2.delivered_on, o2.pres_image3, o2.pres_image4, o2.pres_image5, o2.payment_source, o2.referral_amount, o2.self_pickup, o2.zelle_receipt_url, o2.preparation_time, o2.is_agent, o2.payment_type, o2.net_amount, o2.id, o2.created_on, o2.schedule_date, o2.status,o2.supplier_branch_id,o2.cart_id,o2.user_id,o2.user_delivery_address from (SELECT o.is_dine_in, o.is_payment_confirmed,o.wallet_discount_amount,o.delivery_company_id, o.delivery_charges, o.handling_supplier, o.handling_admin, o.approve_rejection_reason,o.delivered_on, o.payment_status, o.type, o.tip_agent, o.user_service_charge, o.pres_description, o.pres_image1, o.pres_image2, o.pres_image3, o.pres_image4, o.pres_image5, o.payment_source, o.referral_amount, o.self_pickup, o.zelle_receipt_url, o.preparation_time, o.is_agent, o.payment_type, o.net_amount, o.id, o.created_on, o.schedule_date, o.status,o.supplier_branch_id,o.cart_id,o.user_id,o.user_delivery_address from orders o ORDER BY o.id DESC LIMIT ?, ? ) as o2 JOIN supplier_branch sb ON sb.id = o2.supplier_branch_id JOIN supplier s ON sb.supplier_id = s.id LEFT JOIN cart crt ON crt.id = o2.cart_id LEFT JOIN agent_orders ao ON ao.order_id = o2.id JOIN user u ON o2.user_id = u.id left join delivery_companies dc on dc.id = o2.delivery_company_id LEFT JOIN user_address ua ON ua.id = o2.user_delivery_address LEFT JOIN order_promo odp ON odp.orderid = o2.id WHERE Date(o2.created_on) >= '1991-01-11' AND Date(o2.created_on) <= '2025-01-11' AND ( o2.status = 8 OR o2.status = 2 OR o2.status = 5 OR o2.status = 6 ) GROUP BY o2.id"
                            
                            sqlCount="select * from (SELECT COUNT(*) as total_orders,o.is_dine_in, o.wallet_discount_amount, o.delivery_charges,o.delivered_on, o.handling_supplier, o.handling_admin, o.approve_rejection_reason, o.payment_status, o.type, o.tip_agent, o.user_service_charge, o.pres_description, o.pres_image1, o.pres_image2, o.pres_image3, o.pres_image4, o.pres_image5, o.payment_source, o.referral_amount, o.self_pickup, o.zelle_receipt_url, o.preparation_time, o.is_agent, o.payment_type, o.net_amount, o.id, o.created_on, o.schedule_date, o.status,o.supplier_branch_id,o.cart_id,o.user_id,o.user_delivery_address from orders o ORDER BY o.id ) as o2 JOIN supplier_branch sb ON sb.id = o2.supplier_branch_id JOIN supplier s ON sb.supplier_id = s.id LEFT JOIN cart crt ON crt.id = o2.cart_id LEFT JOIN agent_orders ao ON ao.order_id = o2.id JOIN user u ON o2.user_id = u.id LEFT JOIN user_address ua ON ua.id = o2.user_delivery_address LEFT JOIN order_promo odp ON odp.orderid = o2.id  "+agent_assign_order_filter_2+" "+rating_given_filter_2+"  WHERE Date(o2.created_on) >= '1991-01-11' AND Date(o2.created_on) <= '2025-01-11' AND ( o2.status = 8 OR o2.status = 2 OR o2.status = 5 OR o2.status = 6 ) GROUP BY o2.id"
                            //  sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                            //     "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                            //     "  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=8 or o.status=2 or o.status=5 or o.status=6) "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select dc.name as delivery_company_name,o.is_payment_confirmed,o.delivered_on,dc.id as delivery_company_id,o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                " left join delivery_companies dc on dc.id = o.delivery_company_id left join delivery_companies dc on dc.id = o.delivery_company_id left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=8 or o.status=2 or o.status=5 or o.status=6) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
  
                }
  
                if (payment_type = 2) {
                    sql = sql.replace("and o.payment_type=2", "")
                }
  
                let orders = await Execute.Query(dbName,sql,[offset,limit]);
                if(orders.length){
                    results = orders;
                    cb(null);
                }else{
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
                }
            //    var st= multiConnection[dbName].query(sql,[offset,limit],function (err,orders) {
            //         console.log(st.sql);
            //         if(err)
            //         {
            //             console.log('error------',err);
            //             sendResponse.somethingWentWrongError(res);
  
            //         }
            //         else if(orders.length) {
            //             results = orders;
            //             // console.log('asdf------',results);
            //             cb(null);
            //         }
            //         else {
            //             var data = [];
            //             sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
            //         }
            //     })
            }
            else {
  
                 sql='select o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.self_pickup,crt.area_id,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id left join user_address ua on ua.id=o.user_delivery_address left join cart crt on crt.id=o.cart_id '+
                    'join user u on o.user_id=u.id where o.status != 9 '+country_code_query+'  group by id order by o.id DESC';
                let orders = await Execute.Query(dbName,sql,[]);
                if(orders.length){
                    results = orders;
                    cb(null);
                }else{
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
                }
  
                // multiConnection[dbName].query(sql,function (err,orders) {
                //     if(err)
                //     {
                //         console.log('error------',err);
                //         sendResponse.somethingWentWrongError(res);
  
                //     }
                //     else if(orders.length) {
                //         results = orders;
                //         //console.log('asdf------',results);
                //         cb(null);
                //     }
                //     else {
                //         var data = [];
                //         sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
                //     }
                // })
            }
        },
        total_order_count:['orders',async function(cb){
            if(sqlCount!=""){
                // var final_count_query=sql.split('LIMIT')[0]; 
                let orderslength = await Execute.Query(dbName,sqlCount,[]);
                total_orders = orderslength && orderslength.length>0?orderslength[0].total_orders:0
                cb(null);
            }
            else{
            var final_count_query=sql.split('LIMIT')[0]; 
            let orderslength = await Execute.Query(dbName,final_count_query,[]);
            total_orders = orderslength && orderslength.length>0?orderslength.length:0
            cb(null);
            }
  
            // var st= multiConnection[dbName].query(final_count_query,function (err,orderslength) {
            //     console.log(st.sql);
            //     if(err)
            //     {
            //         console.log('error------',err);
            //         sendResponse.somethingWentWrongError(res);
  
            //     }
            //     else {
            //         total_orders = orderslength && orderslength.length>0?orderslength.length:0;
            //         // console.log('asdf------',results);
            //         cb(null);
            //     }
               
            // })
        }],
        product:['total_order_count',async function(cb){
           var sql2='select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
  
            let product1 = await Execute.Query(dbName,sql2,[]);

            let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
            var is_decimal_quantity_allowed = "0";
            if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
            }
            let temp_price;
            console.log("======temp price now ===1.1.1==",temp_price)
            for(var i=0;i<results.length;i++) {
                (function (i) {
                    console.log("======temp price now ===1.1==",temp_price)
                    results[i].net_amount=parseFloat(results[i].net_amount)-parseFloat(results[i].discountAmount)-parseFloat(results[i].referral_amount)-parseFloat(results[i].wallet_discount_amount)
                    product=[];
                    temp_price = 0;
                    for(var j=0;j<product1.length;j++)
                    {
                        (function(j){
                            // console.log("======temp price now ===1==",temp_price)
                            if(product1[j].order_id == results[i].id)
                            {
                                var productDetail = {
                                    product_name : product1[j].product_name,
                                    product_quantity : product1[j].quantity,
                                    product_image : product1[j].product_image,
                                    price : product1[j].price
                                }
                                console.log("======temp price now ===2==",temp_price,productDetail.price)
                                if(is_decimal_quantity_allowed == "1"){
                                    temp_price = Number(productDetail.price) * parseFloat(productDetail.product_quantity) + temp_price
                                }else{
                                    temp_price = Number(productDetail.price) * Number(productDetail.product_quantity) + temp_price
                                }

                                console.log("======temp price now ===3==",temp_price)
                                product.push(productDetail)
                                if(j==product1.length-1) {
                                    console.log("======temp price now ===4==",temp_price)
                                    results[i].total_order_price = temp_price
                                    results[i].product=product;
                                }
                            }
                            else {
                                if(j==product1.length-1)
                                {
                                    console.log("======temp price now ===5==",temp_price)
                                    results[i].total_order_price = temp_price
                                    results[i].product=product;
                                }
                            }
                        }(j));
  
                    }
                    if(i==results.length-1)
                    {
                        cb(null);
                    }
            }(i))
  
            }
  
            // var sql2='select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
            // multiConnection[dbName].query(sql2,function (err,product1) {
            //     let temp_price;
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);
  
            //     }
            //     else {
            //         console.log("======temp price now ===1.1.1==",temp_price)
            //     for(var i=0;i<results.length;i++) {
            //         (function (i) {
            //             console.log("======temp price now ===1.1==",temp_price)
            //             results[i].net_amount=results[i].net_amount-(results[i].discountAmount)-(results[i].referral_amount)
            //             product=[];
            //             temp_price = 0;
            //             for(var j=0;j<product1.length;j++)
            //             {
            //                 (function(j){
            //                     // console.log("======temp price now ===1==",temp_price)
            //                     if(product1[j].order_id == results[i].id)
            //                     {
            //                         var productDetail = {
            //                             product_name : product1[j].product_name,
            //                             product_quantity : product1[j].quantity,
            //                             product_image : product1[j].product_image,
            //                             price : product1[j].price
            //                         }
            //                         console.log("======temp price now ===2==",temp_price,productDetail.price)
            //                         temp_price = Number(productDetail.price) * 
            //                         Number(productDetail.product_quantity) + temp_price
            //                         console.log("======temp price now ===3==",temp_price)
            //                         product.push(productDetail)
            //                         if(j==product1.length-1) {
            //                             console.log("======temp price now ===4==",temp_price)
            //                             results[i].total_order_price = temp_price
            //                             results[i].product=product;
            //                         }
            //                     }
            //                     else {
            //                         if(j==product1.length-1)
            //                         {
            //                             console.log("======temp price now ===5==",temp_price)
            //                             results[i].total_order_price = temp_price
            //                             results[i].product=product;
            //                         }
            //                     }
            //                 }(j));
  
            //             }
            //             if(i==results.length-1)
            //             {
            //                 cb(null);
            //             }
            //     }(i))
  
            //     }
  
            //     }
            // })
        }],
        category:['product',async function(cb){
        
            var sql3='select c.terminology,c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            let cat = await Execute.Query(dbName,sql3,[]);
            for(var i=0;i<results.length;i++) {
  
                (function (i) {
                    cate=[];
                    for(var j=0;j<cat.length;j++)
                    {
                        (function(j){
                            if(cat[j].order_id == results[i].id)
                            {
                                cate.push({
                                    name:cat[j].name,
                                    terminology:cat[j].terminology
                                }
                                    // cat[j].name
                                    );
                                if(j==cat.length-1) {
                                    results[i].category=cate;
                                }
                            }
                            else {
                                if(j==cat.length-1)
                                {
                                    results[i].category=cate;
                                }
                            }
                        }(j));
                    }
                    if(i==results.length-1)
                    {
                        cb(null);
                    }
                }(i))
            }
            
            // var sql3='select c.terminology,c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            // multiConnection[dbName].query(sql3,function (err,cat) {
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);
  
            //     }
            //     else {
                  
            //         for(var i=0;i<results.length;i++) {
  
            //             (function (i) {
            //                 cate=[];
            //                 for(var j=0;j<cat.length;j++)
            //                 {
            //                     (function(j){
            //                         if(cat[j].order_id == results[i].id)
            //                         {
            //                             cate.push({
            //                                 name:cat[j].name,
            //                                 terminology:cat[j].terminology
            //                             }
            //                                 // cat[j].name
            //                                 );
            //                             if(j==cat.length-1) {
            //                                 results[i].category=cate;
            //                             }
            //                         }
            //                         else {
            //                             if(j==cat.length-1)
            //                             {
            //                                 results[i].category=cate;
            //                             }
            //                         }
            //                     }(j));
            //                 }
            //                 if(i==results.length-1)
            //                 {
            //                     cb(null);
            //                 }
            //             }(i))
            //         }
  
            //     }
            // })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            var result=results.sort(func.sort_by('id', true, parseInt));
            //data.orders=result;
            callback(null,{orders:result,total_count:total_orders});
        }
    })
  }

  exports.deliveryCompanyOrders =async function(dbName,res,
    limit,offset,serachText,
    serachType,tab_status,sub_status,payment_type,
    start_date,
    end_date,
    country_code,
    country_code_type,
    is_dine_in,
    agent_id,
    filter_by,
    delivery_company_id,
    callback) {
        let dine_in_orders_check = ""
        if(parseInt(is_dine_in)>0){
            dine_in_orders_check = " and o.is_dine_in =1 "
        }
  console.log(".....",serachText,limit);
  
   var product=[];
    var results=[];
    var cate=[];
    var total_orders,sql;
    let sqlCount=""
    var country_code_query = ""


    let delivery_company_query = " and o.delivery_company_id = "+delivery_company_id+""

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
    let agent_order_check = ""
    if(parseInt(agent_id)!==0){
        agent_order_check= " and  ao.agent_id="+agent_id+" "
    }

   let agent_assign_order_filter = "";
   let rating_given_filter = "";
   let agent_assign_order_filter_2 = "";
   let rating_given_filter_2 = "";
    if(parseInt(filter_by)!==0){
        if(parseInt(filter_by)==1){
            agent_assign_order_filter = " join agent_orders aos ON aos.order_id = o.id ";
            agent_assign_order_filter_2 = " join agent_orders aos ON aos.order_id = o2.id ";
        }else if(parseInt(filter_by)==2){
            rating_given_filter = " join supplier_rating srt ON srt.order_id = o.id ";
            rating_given_filter_2= " join supplier_rating srt ON srt.order_id = o2.id ";
        }
    }


    async.auto({
        orders:async function (cb) {
            
            if(limit){
                console.log("=============after count==============",tab_status)
  
                if(tab_status==0){

                    console.log("==============after tab status=========")
                    if(serachType==0){
                        console.log("==========status=======")
                         sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.referral_amount,o.payment_source,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                            "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                            " left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where o.status=0 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' "+delivery_company_query+"  and o.payment_type="+payment_type+" "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                    }   
                        else {
                         sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,s.is_own_delivery,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,sb.supplier_id,o.zelle_receipt_url,o.self_pickup,o.preparation_time,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                            "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                            " left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where o.status=0 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' "+delivery_company_query+" and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                            " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                    }
  
                }else if(tab_status==1){
                    if(sub_status==1){
                        if(serachType==0){
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left  join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=1 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=1 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==3){
                        if(serachType==0){
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left  join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=3 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=3 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==10){
                        if(serachType==0){
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=10 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id   "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=10 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==11){
                        if(serachType==0){
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=11 "+dine_in_orders_check+" "+agent_order_check+"  and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"   where o.status=11 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                    else if(sub_status==4){
                        if(serachType==0){
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+delivery_company_query+" "+dine_in_orders_check+" and o.payment_type="+payment_type+" and (o.status=1 or o.status=3 or o.status=10 or o.status=11)  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id  "+agent_assign_order_filter+" "+rating_given_filter+"   where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+delivery_company_query+" "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=1 or o.status=3 or o.status=10 or o.status=11) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                    else {
                        if(serachType==0){
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" "+dine_in_orders_check+" "+delivery_company_query+" and (o.status=1 or o.status=3 or o.status=10 or o.status=11 or o.status=4)  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select "+select_unassigned_column+"o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"  where  DATE(o.created_on)>='"+start_date+"' and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" "+delivery_company_query+" and(o.status=1 or o.status=3 or o.status=10 or o.status=11 or o.status=4) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%')  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
                }else if(tab_status==2){
                    if(sub_status==2){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount, o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=2 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+"  "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount, o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=2 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==5){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+"  where o.status=5 "+dine_in_orders_check+" "+agent_order_check+" and DATE(o.created_on)>='"+start_date+"' "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' and o.payment_type="+payment_type+" "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=5 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+delivery_company_query+" "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                "  or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }else if(sub_status==8){
                        if(serachType==0){
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=8 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+delivery_company_query+" "+dine_in_orders_check+" and o.payment_type="+payment_type+" "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id "+agent_assign_order_filter+" "+rating_given_filter+" where o.status=8 and DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"'  "+delivery_company_query+" "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }

  
                    }else{
                        if(serachType==0){
                            sql="select u.email AS User_Name, s.name AS supplier, ua.address_link, ua.customer_address, ua.latitude, ua.longitude, ua.landmark, ua.pincode, ua.address_line_1, ua.address_line_2, u.mobile_no, sb.branch_name, Ifnull(odp.discountamount, 0) AS discountAmount, sb.address AS branch_address, crt.area_id, sb.supplier_id,o2.is_dine_in, o2.wallet_discount_amount, o2.delivery_charges, o2.handling_supplier, o2.handling_admin, o2.approve_rejection_reason, o2.payment_status, o2.type, o2.tip_agent, o2.user_service_charge, o2.pres_description, o2.pres_image1,o2.delivery_company_id, o2.pres_image2, o2.pres_image3, o2.pres_image4, o2.pres_image5, o2.payment_source, o2.referral_amount, o2.self_pickup, o2.zelle_receipt_url, o2.preparation_time, o2.is_agent, o2.payment_type, o2.net_amount, o2.id, o2.created_on, o2.schedule_date, o2.status,o2.supplier_branch_id,o2.cart_id,o2.user_id,o2.user_delivery_address from (SELECT o.is_dine_in, o.wallet_discount_amount, o.delivery_charges, o.handling_supplier, o.handling_admin, o.approve_rejection_reason, o.payment_status, o.type, o.tip_agent,o.delivery_company_id, o.user_service_charge, o.pres_description, o.pres_image1, o.pres_image2, o.pres_image3, o.pres_image4, o.pres_image5, o.payment_source, o.referral_amount, o.self_pickup, o.zelle_receipt_url, o.preparation_time, o.is_agent, o.payment_type, o.net_amount, o.id, o.created_on, o.schedule_date, o.status,o.supplier_branch_id,o.cart_id,o.user_id,o.user_delivery_address from orders o ORDER BY o.id DESC LIMIT ?, ? ) as o2 JOIN supplier_branch sb ON sb.id = o2.supplier_branch_id JOIN supplier s ON sb.supplier_id = s.id LEFT JOIN cart crt ON crt.id = o2.cart_id LEFT JOIN agent_orders ao ON ao.order_id = o2.id JOIN user u ON o2.user_id = u.id LEFT JOIN user_address ua ON ua.id = o2.user_delivery_address LEFT JOIN order_promo odp ON odp.orderid = o2.id WHERE Date(o2.created_on) >= '1991-01-11' AND Date(o2.created_on) <= '2025-01-11' and o2.delivery_company_id = "+delivery_company_id+" AND ( o2.status = 8 OR o2.status = 2 OR o2.status = 5 OR o2.status = 6 ) GROUP BY o2.id"
                            
                            sqlCount="select * from (SELECT COUNT(*) as total_orders,o.is_dine_in, o.wallet_discount_amount, o.delivery_charges, o.handling_supplier, o.handling_admin, o.approve_rejection_reason, o.payment_status, o.type, o.tip_agent, o.user_service_charge, o.pres_description, o.pres_image1, o.pres_image2, o.pres_image3, o.pres_image4, o.pres_image5, o.payment_source, o.referral_amount, o.self_pickup, o.zelle_receipt_url, o.preparation_time, o.is_agent, o.payment_type, o.net_amount, o.id, o.created_on, o.schedule_date, o.status,o.supplier_branch_id,o.cart_id,o.user_id,o.user_delivery_address from orders o ORDER BY o.id ) as o2 JOIN supplier_branch sb ON sb.id = o2.supplier_branch_id JOIN supplier s ON sb.supplier_id = s.id LEFT JOIN cart crt ON crt.id = o2.cart_id LEFT JOIN agent_orders ao ON ao.order_id = o2.id JOIN user u ON o2.user_id = u.id LEFT JOIN user_address ua ON ua.id = o2.user_delivery_address LEFT JOIN order_promo odp ON odp.orderid = o2.id  "+agent_assign_order_filter_2+" "+rating_given_filter_2+"  WHERE Date(o2.created_on) >= '1991-01-11' "+delivery_company_query+" AND Date(o2.created_on) <= '2025-01-11' AND ( o2.status = 8 OR o2.status = 2 OR o2.status = 5 OR o2.status = 6 ) GROUP BY o2.id"
                            //  sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,crt.area_id,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                            //     "from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id left join cart crt on crt.id=o.cart_id "+
                            //     "  left join agent_orders ao on ao.order_id=o.id  join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=8 or o.status=2 or o.status=5 or o.status=6) "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";
                        }   
                            else {
                             sql="select o.is_dine_in,o.wallet_discount_amount,o.user_service_charge,o.delivery_charges,o.handling_supplier,o.handling_admin,o.approve_rejection_reason,o.payment_status,s.is_own_delivery,o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,o.payment_source,o.referral_amount,IFNULL(odp.discountAmount,0) as discountAmount,sb.address as branch_address,o.self_pickup,o.zelle_receipt_url,o.preparation_time,sb.supplier_id,o.is_agent,o.payment_type,o.net_amount,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no " +
                                "from orders o join order_prices op on o.id = op.order_id join supplier_branch sb on sb.id=op.supplier_branch_id join supplier s on sb.supplier_id=s.id  "+
                                "  left join agent_orders ao on ao.order_id=o.id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where  DATE(o.created_on)>='"+start_date+"' "+agent_order_check+" "+delivery_company_query+" and DATE(o.created_on)<='"+end_date+"' "+dine_in_orders_check+" and o.payment_type="+payment_type+" and(o.status=8 or o.status=2 or o.status=5 or o.status=6) and(o.id LIKE '%"+serachText+"%' or u.email LIKE '%"+serachText+"%' " +
                                " or s.name LIKE '%"+serachText+"%'or u.mobile_no LIKE '%"+serachText+"%') "+country_code_query+" group by id order by o.id DESC LIMIT ?,?";   
                        }
  
                    }
  
                }
  
                if (payment_type = 2) {
                    sql = sql.replace("and o.payment_type=2", "")
                }
  
                let orders = await Execute.Query(dbName,sql,[offset,limit]);
                if(orders.length){
                    results = orders;
                    cb(null);
                }else{
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
                }
          
            }
            else {
  
                 sql='select o.type,o.tip_agent,o.user_service_charge,o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.self_pickup,crt.area_id,sb.supplier_id,o.is_agent,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id left join user_address ua on ua.id=o.user_delivery_address left join cart crt on crt.id=o.cart_id '+
                    'join user u on o.user_id=u.id where o.status != 9 '+country_code_query+'  group by id order by o.id DESC';
                let orders = await Execute.Query(dbName,sql,[]);
                if(orders.length){
                    results = orders;
                    cb(null);
                }else{
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
                }
  
                // multiConnection[dbName].query(sql,function (err,orders) {
                //     if(err)
                //     {
                //         console.log('error------',err);
                //         sendResponse.somethingWentWrongError(res);
  
                //     }
                //     else if(orders.length) {
                //         results = orders;
                //         //console.log('asdf------',results);
                //         cb(null);
                //     }
                //     else {
                //         var data = [];
                //         sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
  
                //     }
                // })
            }
        },
        total_order_count:['orders',async function(cb){
            if(sqlCount!=""){
                // var final_count_query=sql.split('LIMIT')[0]; 
                let orderslength = await Execute.Query(dbName,sqlCount,[]);
                total_orders = orderslength && orderslength.length>0?orderslength[0].total_orders:0
                cb(null);
            }
            else{
                let withoutGroupCountSql=sql.split('group by')[0]; 
                withoutGroupCountSql= withoutGroupCountSql.substring(withoutGroupCountSql.indexOf(" from orders o join order_prices") + 1);
                logger.debug("======withoutGroupCountSql===>>",withoutGroupCountSql)
                withoutGroupCountSql="SELECT count(distinct o.id) as totalOrders "+withoutGroupCountSql
                let orderslength = await Execute.Query(dbName,withoutGroupCountSql,[]);
                total_orders = orderslength && orderslength.length>0?orderslength[0].totalOrders:0
            // var final_count_query=sql.split('LIMIT')[0]; 
            // let orderslength = await Execute.Query(dbName,final_count_query,[]);
            // total_orders = orderslength && orderslength.length>0?orderslength.length:0
            cb(null);
            }
  
           
        }],
        product:['total_order_count',async function(cb){
           var sql2='select op.price,op.order_id,op.product_name,op.quantity,op.image_path as product_image from order_prices op';
  
            let product1 = await Execute.Query(dbName,sql2,[]);

            let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
            var is_decimal_quantity_allowed = "0";
            if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
            }
            let temp_price;
            console.log("======temp price now ===1.1.1==",temp_price)
            for(var i=0;i<results.length;i++) {
                (function (i) {
                    console.log("======temp price now ===1.1==",temp_price)
                    results[i].net_amount=parseFloat(results[i].net_amount)-parseFloat(results[i].discountAmount)-parseFloat(results[i].referral_amount)-parseFloat(results[i].wallet_discount_amount)
                    product=[];
                    temp_price = 0;
                    for(var j=0;j<product1.length;j++)
                    {
                        (function(j){
                            // console.log("======temp price now ===1==",temp_price)
                            if(product1[j].order_id == results[i].id)
                            {
                                var productDetail = {
                                    product_name : product1[j].product_name,
                                    product_quantity : product1[j].quantity,
                                    product_image : product1[j].product_image,
                                    price : product1[j].price
                                }
                                console.log("======temp price now ===2==",temp_price,productDetail.price)
                                if(is_decimal_quantity_allowed == "1"){
                                    temp_price = Number(productDetail.price) * parseFloat(productDetail.product_quantity) + temp_price
                                }else{
                                    temp_price = Number(productDetail.price) * Number(productDetail.product_quantity) + temp_price
                                }

                                console.log("======temp price now ===3==",temp_price)
                                product.push(productDetail)
                                if(j==product1.length-1) {
                                    console.log("======temp price now ===4==",temp_price)
                                    results[i].total_order_price = temp_price
                                    results[i].product=product;
                                }
                            }
                            else {
                                if(j==product1.length-1)
                                {
                                    console.log("======temp price now ===5==",temp_price)
                                    results[i].total_order_price = temp_price
                                    results[i].product=product;
                                }
                            }
                        }(j));
  
                    }
                    if(i==results.length-1)
                    {
                        cb(null);
                    }
            }(i))
            }
        }],
        category:['product',async function(cb){
        
            var sql3='select c.terminology,c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            let cat = await Execute.Query(dbName,sql3,[]);
            for(var i=0;i<results.length;i++) {
  
                (function (i) {
                    cate=[];
                    for(var j=0;j<cat.length;j++)
                    {
                        (function(j){
                            if(cat[j].order_id == results[i].id)
                            {
                                cate.push({
                                    name:cat[j].name,
                                    terminology:cat[j].terminology
                                }
                                    // cat[j].name
                                    );
                                if(j==cat.length-1) {
                                    results[i].category=cate;
                                }
                            }
                            else {
                                if(j==cat.length-1)
                                {
                                    results[i].category=cate;
                                }
                            }
                        }(j));
                    }
                    if(i==results.length-1)
                    {
                        cb(null);
                    }
                }(i))
            }
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            var result=results.sort(func.sort_by('id', true, parseInt));
            //data.orders=result;
            callback(null,{orders:result,total_count:total_orders});
        }
    })
  }

exports.adminPendingOrdersList=  function (dbName,res,callback) {
    var product=[];
    var results=[];
    var cate=[];
    var data={}
    async.auto({
        orders:function (cb) {
            var sql='select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on o.user_id=u.id where o.status= ?';
            multiConnection[dbName].query(sql,[0],function (err,orders) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(orders.length) {
                    results = orders;
                //    console.log('asdf------',results);
                    cb(null);
                }
                else {
                     data = []
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

                }
            })
        },
        product:['orders',function(cb){
            var sql2='select op.order_id,op.product_name from order_prices op';
            multiConnection[dbName].query(sql2,function (err,product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            product=[];
                            for(var j=0;j<product1.length;j++)
                            {

                                (function(j){
                                    if(product1[j].order_id == results[i].id)
                                    {
                                        product.push(product1[j].product_name)
                                        if(j==product1.length-1) {
                                            results[i].product=product;
                                        }
                                    }
                                    else {
                                        if(j==product1.length-1)
                                        {
                                            results[i].product=product;
                                        }
                                    }
                                }(j));

                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].order_id == results[i].id)
                                    {
                                        cate.push(cat[j].name);
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            data=results;
         //   console.log('final1====',data);
            callback(null,data)
        }
    })

}

exports.listSupplierOrder= function(dbName,res,supplierId,limit,offset,orderType,tab_status,sub_status,searchType,
    searchText,payment_type,
    start_date,
    end_date,
    callback) {
    console.log("supplier........",supplierId,limit,offset,searchType,searchText);

    var product=[];
    var results=[];
    var cate=[];
    var orderId=[];
    var sql,sqlQ,total_orders=0;
    async.auto({
        orders:function (cb) {
            console.log("----------------inside async auto-------")
            // if(orderType==0){
            //     var sql='select crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
            //         'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id '+
            //         'join user u on o.user_id=u.id where s.id= ? order by o.id DESC LIMIT ?,?';
            // }
            // else if(orderType==1){
            //     var sql='select  crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.net_amount,payment_type,o.apply_promo,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
            //         'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id '+
            //         'join user u on o.user_id=u.id where s.id= ? and o.status = 0 order by o.id DESC LIMIT ?,?';

            // }
            // else if(orderType==2){
            //     var sql='select  o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.net_amount,payment_type,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
            //         'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
            //         'join user u on o.user_id=u.id where s.id= ? and o.status = 0 and o.urgent = 1 order by o.id DESC LIMIT ?,?';

            // }
            // else if(orderType==3){
            //     var sql='select  o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.net_amount,payment_type,o.apply_promo,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
            //         'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
            //         'join user u on o.user_id=u.id where s.id= ? and o.status = 5 order by o.id DESC LIMIT ?,?';

            // }
            var subStatusNew = sub_status != undefined && sub_status != null && sub_status != "" ? sub_status : 0
           
            
            console.log("============my taba status========",tab_status)
            if (tab_status == 0) {
                if(searchType==0){
                sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                    'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.status IN(0) and o.payment_type='+payment_type+' group by o.id order by o.created_on DESC LIMIT ?,?';
                
                }
                else{
                    sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                    'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(0) and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%")  group by o.id order by o.created_on DESC LIMIT ?,?';
                    
                }
                } else if (tab_status == 1) {
                if (subStatusNew) {
                    if(searchType==0){
                    sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                        'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(' + subStatusNew + ') group by o.id order by o.created_on DESC LIMIT ?,?';
                    
                    }
                    else{
                        sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                        'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(' + subStatusNew + ') and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%") group by o.id order by o.created_on DESC LIMIT ?,?';
                    
                    }
                    } else {
                        if(searchType==0){
                         sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                        'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(1,3,7,9,10,11) group by o.id order by o.created_on DESC LIMIT ?,?';
                        }
                        else{
                            sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                            'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                            'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(1,3,7,9,10,11) and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%") group by o.id order by o.created_on DESC LIMIT ?,?';
                           
                        }

                    }
            } else if (tab_status == 2) {
                if(subStatusNew){
                    if(searchType==0){
                    sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                    'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(' + subStatusNew + ') group by o.id order by o.created_on DESC LIMIT ?,?';
                   
                }
                    else{
                        sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                        'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(' + subStatusNew + ') and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%") group by o.id order by o.created_on DESC LIMIT ?,?';
                       
                    }
                }else{                    
                    if(searchType==0){
                            sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                            'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                            'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(2,5,8) order by o.id DESC LIMIT ?,?';
                    }
                    else{
                        sql = 'select o.pres_description,o.pres_image1,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id ' +
                        'join user u on o.user_id=u.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(2,5,8) and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%") order by o.id DESC LIMIT ?,?';
                    }
                }
            }

            if(payment_type==2){
                sql = sql.replace(" and o.payment_type=2","")
            }

            let stmt = multiConnection[dbName].query(sql,[supplierId,offset,limit],function (err,orders) {
                console.log("----------------",stmt.sql)
                sqlQ=stmt.sql
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(orders.length) {
                    for(var i=0;i<orders.length;i++)
                    {
                        (function (i) {
                            orderId.push(orders[i].id);
                            if(i==(orders.length-1)){
                                results = orders;
                                cb(null);
                            }
                        }(i))
                    }
                }
                else{
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

                }
            })
        },
        totalOrder:['orders',function(cb){
            var final_count_query=sqlQ.split('LIMIT')[0]; 
            var st= multiConnection[dbName].query(final_count_query,function (err,orderslength) {
                console.log(st.sql);
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    total_orders = orderslength && orderslength.length>0?orderslength.length:0;
                    // console.log('asdf------',results);
                    cb(null);
                }
               
            })
        }],
        product:['totalOrder',async function(cb){
            var sql2='select op.order_id,op.price,op.product_name,op.quantity,op.image_path as product_image from order_prices op where op.order_id IN('+orderId+')';
            let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
            var is_decimal_quantity_allowed = "0";
            if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
            }
            multiConnection[dbName].query(sql2,function (err,product1) {
                let temp_price;
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    console.log("======temp price now ===1.1.1======ssss=",temp_price)
                for(var i=0;i<results.length;i++) {
                    (function (i) {
                        console.log("======temp price now ===1.1=======ssss=",temp_price)
                        product=[];
                        temp_price = 0;
                        for(var j=0;j<product1.length;j++)
                        {
                            (function(j){
                                // console.log("======temp price now ===1==",temp_price)
                                if(product1[j].order_id == results[i].id)
                                {
                                    var productDetail = {
                                        product_name : product1[j].product_name,
                                        product_quantity : product1[j].quantity,
                                        product_image : product1[j].product_image,
                                        price : product1[j].price
                                    }
                                    console.log("======temp price now ===2===s=ssss=",temp_price,productDetail.price)
                                    if(is_decimal_quantity_allowed == "1"){
                                        temp_price = Number(productDetail.price) * parseFloat(productDetail.product_quantity) + temp_price
                                    }else{
                                        temp_price = Number(productDetail.price) * Number(productDetail.product_quantity) + temp_price
                                    }
                                    console.log("======temp price now ===3====sssss==",temp_price)
                                    product.push(productDetail)
                                    if(j==product1.length-1) {
                                        console.log("======temp price now ===4===ssssss===",temp_price)
                                        results[i].total_order_price = temp_price
                                        results[i].product=product;
                                    }
                                }
                                else {
                                    if(j==product1.length-1)
                                    {
                                        console.log("======temp price now ===5===ssss===",temp_price)
                                        results[i].total_order_price = temp_price
                                        results[i].product=product;
                                    }
                                }
                            }(j));

                        }
                        if(i==results.length-1)
                        {
                            cb(null);
                        }
                }(i))

                }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id where op.order_id IN('+orderId+')';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].order_id == results[i].id)
                                    {
                                        cate.push(cat[j].name);
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            var result=results.sort(func.sort_by('id', true, parseInt));
            callback(null,{orders:result,total_orders:total_orders})
        }
    })
}

exports.listSupplierOrderV2= async function(dbName,
    res,supplierId,limit,offset,orderType,tab_status,
    sub_status,searchType,
    searchText,payment_type,

    start_date,
    end_date,
    callback,supplierBranchId=0) {
        
    console.log("supplier........",supplierId,limit,offset,searchType,searchText);
  

    let enable_payment_reciept_by_admin = Execute.Query(dbName,
        "select `key`,value from tbl_setting where `key`=? and value='1' ",["enable_payment_reciept_by_admin"])
 
    let orderApprovalByAdmin = await Execute.Query(dbName,
        "select `key`,value from tbl_setting where `key`=? and value=1",
        ["order_approval_by_admin"]
    )

    var product=[];
    var results=[];
    var cate=[];
    var orderId=[];
    var sql,sqlQ,total_orders=0;
    async.auto({
        orders:async function (cb) {
            var subStatusNew = sub_status != undefined && sub_status != null && sub_status != "" ? sub_status : 0
            if(subStatusNew==5){
                subStatusNew= "5,6"
            }
            let payment_source_check = "";

            if(enable_payment_reciept_by_admin && enable_payment_reciept_by_admin.length>0){
                 payment_source_check = " and ((o.payment_source='zelle' or o.payment_source='PipolPay' or o.payment_source='cashapp') and o.is_payment_confirmed=1)";
            }


            let flexpay_on=await Execute.Query(dbName,"select `key`,`value` from tbl_setting where `key`=?",["flexpay_on"]);
            let flexpay_check = ""
         if(flexpay_on && flexpay_on.length>0 && flexpay_on[0].value==1){
            flexpay_check= ",crt.flexpay_status,crt.flexpay_id"
         }
        
         
            
            console.log("============my taba status========",tab_status)
            if (tab_status == 0) {

                if(searchType==0){
                    
                sql = 'select o.admin_commission,o.pres_description,o.pres_image1,o.referral_amount,o.handling_admin as tax,dc.name as delivery_company_name,dc.id as delivery_company_id,o.pres_image2,o.pres_image3,IFNULL(odp.discountAmount,0) as discountAmount,o.pres_image4,ct.terminology,  o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.delivered_on,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no '+flexpay_check+' ' +
                    'from orders o join order_prices op on op.order_id=o.id join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                    ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id  left join order_promo odp on odp.orderId = o.id left join user_address ua on ua.id=o.user_delivery_address  join product p on p.id=op.product_id join categories ct on ct.id=p.category_id  where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.status IN(0) '+payment_source_check+' and o.payment_type='+payment_type+' group by o.id order by o.created_on DESC LIMIT ?,?';
                
                }
                else{
                    sql = 'select o.admin_commission,o.pres_description,o.referral_amount,o.handling_admin as tax,o.pres_image1,dc.name as delivery_company_name,dc.id as delivery_company_id,o.pres_image2,IFNULL(odp.discountAmount,0) as discountAmount,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.delivered_on,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.promo_discount,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no '+flexpay_check+' ' +
                    'from orders o  join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                    ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(0) '+payment_source_check+' and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%")  group by o.id order by o.created_on DESC LIMIT ?,?';
                    
                }
            } else if (tab_status == 1) {
                if (subStatusNew) {
                    if(searchType==0){
                    sql = 'select o.admin_commission,o.pres_description,o.referral_amount,o.handling_admin as tax,o.pres_image1,dc.name as delivery_company_name,dc.id as delivery_company_id,o.pres_image2,IFNULL(odp.discountAmount,0) as discountAmount,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.delivered_on,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                        ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(' + subStatusNew + ') '+payment_source_check+' group by o.id order by o.created_on DESC LIMIT ?,?';
                    
                    }
                    else{
                        sql = 'select o.admin_commission,o.pres_description,o.pres_image1,o.handling_admin as tax,o.referral_amount,dc.name as delivery_company_name,dc.id as delivery_company_id,IFNULL(odp.discountAmount,0) as discountAmount,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.delivered_on,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o  join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                        ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(' + subStatusNew + ') '+payment_source_check+' and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%") group by o.id order by o.created_on DESC LIMIT ?,?';
                    
                    }
                    } else {
                        if(searchType==0){
                         sql = 'select o.admin_commission,o.pres_description,o.pres_image1,o.handling_admin as tax,o.referral_amount,dc.name as delivery_company_name,dc.id as delivery_company_id,IFNULL(odp.discountAmount,0) as discountAmount,o.delivered_on,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                        ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(1,3,7,9,10,11,4) '+payment_source_check+' group by o.id order by o.created_on DESC LIMIT ?,?';
                        }
                        else{
                            sql = 'select o.admin_commission,o.pres_description,o.pres_image1,o.handling_admin as tax,o.referral_amount,dc.name as delivery_company_name,dc.id as delivery_company_id,IFNULL(odp.discountAmount,0) as discountAmount,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.delivered_on,o.is_agent,o.duration,o.promo_discount,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                            'from orders o join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                            ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(1,3,7,9,10,11,4) '+payment_source_check+' and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%") group by o.id order by o.created_on DESC LIMIT ?,?';
                           
                        }

                    }
            } else if (tab_status == 2) {
                if(subStatusNew){
                    if(searchType==0){
                    sql = 'select o.admin_commission,o.pres_description,o.pres_image1,o.referral_amount,o.handling_admin as tax,dc.name as delivery_company_name,dc.id as delivery_company_id,IFNULL(odp.discountAmount,0) as discountAmount,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.delivered_on,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                    'from orders o join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                    ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(' + subStatusNew + ') '+payment_source_check+' group by o.id order by o.created_on DESC LIMIT ?,?';
                   
                }
                    else{
                        sql = 'select o.admin_commission,o.pres_description,o.pres_image1,o.referral_amount,o.handling_admin as tax,dc.name as delivery_company_name,dc.id as delivery_company_id,IFNULL(odp.discountAmount,0) as discountAmount,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.delivered_on,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                        ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(' + subStatusNew + ') '+payment_source_check+' and( u.lastname LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%") group by o.id order by o.created_on DESC LIMIT ?,?';
                       
                    }
                }else{                    
                    if(searchType==0){
                            sql = 'select o.admin_commission,o.pres_description,o.pres_image1,o.referral_amount,o.handling_admin as tax,dc.name as delivery_company_name,dc.id as delivery_company_id,IFNULL(odp.discountAmount,0) as discountAmount,o.delivered_on,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,o.net_amount,payment_type,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                            'from orders o join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                            ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(2,5,8,6) '+payment_source_check+' group by o.id order by o.id DESC LIMIT ?,?';
                    }
                    else{
                        sql = 'select o.admin_commission,o.pres_description,o.pres_image1,o.referral_amount,o.handling_admin as tax,dc.name as delivery_company_name,dc.id as delivery_company_id,IFNULL(odp.discountAmount,0) as discountAmount,o.delivered_on,o.pres_image2,o.pres_image3,o.pres_image4,o.pres_image5,sb.branch_name,sb.address as branch_address,o.preparation_time,o.self_pickup,o.status,crt.area_id,sb.supplier_id,o.is_agent,o.duration,o.promo_discount,o.type,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,o.net_amount,payment_type,ua.address_link,ua.customer_address,ua.latitude,ua.longitude,ua.landmark,ua.pincode,ua.address_line_1,ua.address_line_2,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                        'from orders o join order_prices op on op.order_id=o.id  join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id join cart crt on crt.id=o.cart_id join cart_products  crtp on crt.id = crtp.cart_id ' +
                        ' left join delivery_companies dc on dc.id = o.delivery_company_id join user u on o.user_id=u.id left join user_address ua on ua.id=o.user_delivery_address left join order_promo odp on odp.orderId = o.id where s.id= ? and DATE(o.created_on) >="'+start_date+'" and DATE(o.created_on)<="'+end_date+'" and o.payment_type='+payment_type+' and o.status IN(2,5,8,6) '+payment_source_check+' and( u.lastname  LIKE "%'+searchText+'%" or u.firstname LIKE "%'+searchText+'%" or u.email LIKE "%'+searchText+'%" or o.id LIKE "%'+searchText+'%") group by o.id order by o.id DESC LIMIT ?,?';
                    }
                }
            }

            if(payment_type==2){
                sql = sql.replace(" and o.payment_type=2","")
            }

            if(supplierBranchId){
               var sqlSplit = sql.split('s.id= ?');
               sql = sqlSplit[0] + 's.id= ? and crtp.supplier_branch_id='+supplierBranchId + sqlSplit[1];           
                
               if ( orderApprovalByAdmin && orderApprovalByAdmin.length > 0)
                   sql = sqlSplit[0] + 's.id= ? and o.is_approved_by_admin=1 and crtp.supplier_branch_id='+supplierBranchId + sqlSplit[1]+' group by o.id';           

            } 

            if (!supplierBranchId && orderApprovalByAdmin && orderApprovalByAdmin.length > 0) {
                var sqlSplit = sql.split('s.id= ?');
                sql = sqlSplit[0] + 's.id= ? and o.is_approved_by_admin=1 group by o.id';           
             }
           
            try{
                    console.log("--- tab_status--- sql sqlsql----------",sql)
                    let orders=await Execute.Query(dbName,sql,[supplierId,offset,limit]);
                    if(orders.length) {
                        for(var i=0;i<orders.length;i++)
                        {
                            (function (i) {
                                orderId.push(orders[i].id);
                                if(i==(orders.length-1)){
                                    results = orders;
                                    cb(null);
                                }
                            }(i))
                        }
                    }
                    else{
                        var data = [];
                        sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                    }
            }
            catch(Err){
                sendResponse.somethingWentWrongError(res);
            }
        },
        totalOrder:['orders',async function(cb){
            
            var final_count_query=sql.split('LIMIT')[0]; 
            try{
                let orderslength=await Execute.Query(dbName,final_count_query,[supplierId])
                total_orders = orderslength && orderslength.length>0?orderslength.length:0;
                // console.log('asdf------',results);
                    cb(null);
            }
            catch(Err){
                    console.log('error------',Err);
                    sendResponse.somethingWentWrongError(res);
            }
            // var st= multiConnection[dbName].query(final_count_query,function (err,orderslength) {
            //     console.log(st.sql);
            //     if(err)
            //     {
            //         console.log('error------',err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
            //         total_orders = orderslength && orderslength.length>0?orderslength.length:0;
            //         // console.log('asdf------',results);
            //         cb(null);
            //     }
               
            // })
        }],
        product:['totalOrder',async function(cb){
            try{
                var sql2='select op.order_id,op.price,op.product_name,op.quantity,op.image_path as product_image,op.supplier_branch_id,sb.name,sb.address from order_prices op join supplier_branch sb on sb.id= op.supplier_branch_id where op.order_id IN('+orderId+')';
                let is_decimal_quantity_allowed_val=await Universal.is_decimal_quantity_allowed(dbName)
                var is_decimal_quantity_allowed = "0";
                if(is_decimal_quantity_allowed_val[0] && is_decimal_quantity_allowed_val[0].value){
                    is_decimal_quantity_allowed = is_decimal_quantity_allowed_val[0].value
                }
                let product1=await Execute.Query(dbName,sql2,[])
                let temp_price;
                if(results && results.length>0){
                    for(var i=0;i<results.length;i++) {
                        (function (i) {
                            console.log("======temp price now ===1.1=======ssss=",temp_price)
                            results[i].net_amount=results[i].net_amount-(results[i].discountAmount)-(results[i].referral_amount)
                            product=[];
                            temp_price = 0;
                            for(var j=0;j<product1.length;j++)
                            {
                                (function(j){
                                    // console.log("======temp price now ===1==",temp_price)
                                    // results[i].net_amount=results[i].net_amount-(results[i].discountAmount)-(results[i].referral_amount)

                                    if(product1[j].order_id == results[i].id)
                                    {
                                        var productDetail = {
                                            product_name : product1[j].product_name,
                                            product_quantity : product1[j].quantity,
                                            product_image : product1[j].product_image,
                                            price : product1[j].price,
                                            supplier_branch_id : product1[j].supplier_branch_id,
                                            supplier_branch_name : product1[j].name,
                                            supplier_branch_address : product1[j].address
                                        }
                                        console.log("======temp price now ===2===s=ssss=",temp_price,productDetail.price)
                                        if(is_decimal_quantity_allowed == "1"){
                                            temp_price = Number(productDetail.price) * parseFloat(productDetail.product_quantity) + temp_price
                                        }else{
                                            temp_price = Number(productDetail.price) * Number(productDetail.product_quantity) + temp_price
                                        }
                                        console.log("======temp price now ===3====sssss==",temp_price)
                                        product.push(productDetail)
                                        if(j==product1.length-1) {
                                            console.log("======temp price now ===4===ssssss===",temp_price)
                                            results[i].total_order_price = temp_price
                                            results[i].product=product;
                                        }
                                    }
                                    else {
                                        if(j==product1.length-1)
                                        {
                                            console.log("======temp price now ===5===ssss===",temp_price)
                                            results[i].total_order_price = temp_price
                                            results[i].product=product;
                                        }
                                    }
                                }(j));

                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                    }(i))

                    }
                }
                else{
                    cb(null)
                }

            }
            catch(Err){
                logger.debug("==totalOrder=ERR==>",Err)
                sendResponse.somethingWentWrongError(res);
            }
            // var sql2='select op.order_id,op.price,op.product_name,op.quantity,op.image_path as product_image,op.supplier_branch_id,sb.name,sb.address from order_prices op join supplier_branch sb on sb.id= op.supplier_branch_id where op.order_id IN('+orderId+')';
            
            // multiConnection[dbName].query(sql2,function (err,product1) {
            //     let temp_price;
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
            //         console.log("======temp price now ===1.1.1======ssss=",temp_price)
            //     for(var i=0;i<results.length;i++) {
            //         (function (i) {
            //             console.log("======temp price now ===1.1=======ssss=",temp_price)
            //             results[i].net_amount=results[i].net_amount-(results[i].discountAmount)-(results[i].referral_amount)
            //             product=[];
            //             temp_price = 0;
            //             for(var j=0;j<product1.length;j++)
            //             {
            //                 (function(j){
            //                     // console.log("======temp price now ===1==",temp_price)
            //                     results[i].net_amount=results[i].net_amount-(results[i].discountAmount)-(results[i].referral_amount)

            //                     if(product1[j].order_id == results[i].id)
            //                     {
            //                         var productDetail = {
            //                             product_name : product1[j].product_name,
            //                             product_quantity : product1[j].quantity,
            //                             product_image : product1[j].product_image,
            //                             price : product1[j].price,
            //                             supplier_branch_id : product1[j].supplier_branch_id,
            //                             supplier_branch_name : product1[j].name,
            //                             supplier_branch_address : product1[j].address
            //                         }
            //                         console.log("======temp price now ===2===s=ssss=",temp_price,productDetail.price)
            //                         temp_price = Number(productDetail.price) * Number(productDetail.product_quantity) + temp_price
            //                         console.log("======temp price now ===3====sssss==",temp_price)
            //                         product.push(productDetail)
            //                         if(j==product1.length-1) {
            //                             console.log("======temp price now ===4===ssssss===",temp_price)
            //                             results[i].total_order_price = temp_price
            //                             results[i].product=product;
            //                         }
            //                     }
            //                     else {
            //                         if(j==product1.length-1)
            //                         {
            //                             console.log("======temp price now ===5===ssss===",temp_price)
            //                             results[i].total_order_price = temp_price
            //                             results[i].product=product;
            //                         }
            //                     }
            //                 }(j));

            //             }
            //             if(i==results.length-1)
            //             {
            //                 cb(null);
            //             }
            //     }(i))

            //     }

            //     }
            // })
        }],
        category:['product',async function(cb){
            try{    
                var sql3='select c.name,c.id, c.terminology, op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id where op.order_id IN('+orderId+')';
           
                let cat=await Execute.Query(dbName,sql3,[]);
                if(results && results.length>0){
                for(var i=0;i<results.length;i++) {

                    (function (i) {
                        cate=[];
                        for(var j=0;j<cat.length;j++)
                        {
                            (function(j){
                                if(cat[j].order_id == results[i].id)
                                {
                                    cate.push(cat[j].name);
                                    if(j==cat.length-1) {
                                        results[i].category=cate;
                                    }
                                }
                                else {
                                    if(j==cat.length-1)
                                    {
                                        results[i].category=cate;
                                    }
                                }
                            }(j));
                        }
                        if(i==results.length-1)
                        {
                            cb(null);
                        }
                    }(i))
                }
            }
            else{
                cb(null);
            }

            }
            catch(Err){
                logger.debug("===Err=category,product==>>",Err)
                sendResponse.somethingWentWrongError(res);
            }
            // var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id where op.order_id IN('+orderId+')';
           
            // multiConnection[dbName].query(sql3,function (err,cat) {
            //     if (err) {
            //         console.log('error------', err);
            //         sendResponse.somethingWentWrongError(res);

            //     }
            //     else {
            //         for(var i=0;i<results.length;i++) {

            //             (function (i) {
            //                 cate=[];
            //                 for(var j=0;j<cat.length;j++)
            //                 {
            //                     (function(j){
            //                         if(cat[j].order_id == results[i].id)
            //                         {
            //                             cate.push(cat[j].name);
            //                             if(j==cat.length-1) {
            //                                 results[i].category=cate;
            //                             }
            //                         }
            //                         else {
            //                             if(j==cat.length-1)
            //                             {
            //                                 results[i].category=cate;
            //                             }
            //                         }
            //                     }(j));
            //                 }
            //                 if(i==results.length-1)
            //                 {
            //                     cb(null);
            //                 }
            //             }(i))
            //         }

            //     }
            // })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            var result=results.sort(func.sort_by('id', true, parseInt));
            callback(null,{orders:result,total_orders:total_orders})
        }
    })
}

exports.supplierPendingOrdersList=  function (dbName,res,id,callback) {
    var product=[];
    var results=[];
    var cate=[];
    async.auto({
        orders:function (cb) {
            var sql='select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on o.user_id=u.id where s.id= ? AND o.status= ?';
            multiConnection[dbName].query(sql,[id,0],function (err,orders) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(orders.length) {
                    results = orders;
                 //   console.log('asdf------',results);
                    cb(null);
                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

                }
            })
        },
        product:['orders',function(cb){
            var sql2='select op.order_id,op.product_name from order_prices op';
            multiConnection[dbName].query(sql2,function (err,product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            product=[];
                            for(var j=0;j<product1.length;j++)
                            {

                                (function(j){
                                    if(product1[j].order_id == results[i].id)
                                    {
                                        product.push(product1[j].product_name)
                                        if(j==product1.length-1) {
                                            results[i].product=product;
                                        }
                                    }
                                    else {
                                        if(j==product1.length-1)
                                        {
                                            results[i].product=product;
                                        }
                                    }
                                }(j));

                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].order_id == results[i].id)
                                    {
                                        cate.push(cat[j].name);
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            data=results;
         //   console.log('final1====',data);
            callback(null,data)
        }
    })

}

exports.listBranchOrder= function(dbName,res,branchId,callback) {
    var product=[];
    var results=[];
    var cate=[];
    async.auto({
        orders:function (cb) {
            var sql='select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on o.user_id=u.id where o.supplier_branch_id= ?';
            multiConnection[dbName].query(sql,[branchId],function (err,orders) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(orders.length){
                    results = orders;
                //    console.log('asdf------',results);
                    cb(null);
                }
                
            })
        },
        product:['orders',function(cb){
            var sql2='select op.order_id,op.product_name from order_prices op';
            multiConnection[dbName].query(sql2,function (err,product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            product=[];
                            for(var j=0;j<product1.length;j++)
                            {

                                (function(j){
                                    if(product1[j].order_id == results[i].id)
                                    {
                                        product.push(product1[j].product_name)
                                        if(j==product1.length-1) {
                                            results[i].product=product;
                                        }
                                    }
                                    else {
                                        if(j==product1.length-1)
                                        {
                                            results[i].product=product;
                                        }
                                    }
                                }(j));

                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].order_id == results[i].id)
                                    {
                                        cate.push(cat[j].name);
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            data=results;
          //  console.log('final1====',data);
            callback(null,data)
        }
    })
}

exports.branchPendingOrdersList= function (dbName,res,id,callback) {
    var product=[];
    var results=[];
    var cate=[];
    async.auto({
        orders:function (cb) {
            var sql='select o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on o.user_id=u.id where o.supplier_branch_id = ? AND o.status= ?';
            multiConnection[dbName].query(sql,[id,0],function (err,orders) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(orders.length) {
                    results = orders;
                  //  console.log('asdf------',results);
                    cb(null);
                }
                else {
                    var msg = "No Orders selected";
                    sendResponse.sendErrorMessage(msg,res,500);
                }
            })
        },
        product:['orders',function(cb){
            var sql2='select op.order_id,op.product_name from order_prices op';
            multiConnection[dbName].query(sql2,function (err,product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            product=[];
                            for(var j=0;j<product1.length;j++)
                            {

                                (function(j){
                                    if(product1[j].order_id == results[i].id)
                                    {
                                        product.push(product1[j].product_name)
                                        if(j==product1.length-1) {
                                            results[i].product=product;
                                        }
                                    }
                                    else {
                                        if(j==product1.length-1)
                                        {
                                            results[i].product=product;
                                        }
                                    }
                                }(j));

                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].order_id == results[i].id)
                                    {
                                        cate.push(cat[j].name);
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            data=results;
           // console.log('final1====',data);
            callback(null,data)
        }
    })

}

exports.adminScheduleOrdersList= function (dbName,res,callback) {
    var product=[];
    var results=[];
    var cate=[];
    async.auto({
        orders:function (cb) {
            var sql='select sdla.area_id,sb.supplier_id,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id  '+
                'join user u on o.user_id=u.id where o.status= ?';
            multiConnection[dbName].query(sql,[9],function (err,orders) {
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else if(orders.length) {
                    results = orders;
                  //  console.log('asdf------',results);
                    cb(null);
                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);

                }
            })
        },
        product:['orders',function(cb){
            var sql2='select op.order_id,op.product_name from order_prices op';
            multiConnection[dbName].query(sql2,function (err,product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            product=[];
                            for(var j=0;j<product1.length;j++)
                            {

                                (function(j){
                                    if(product1[j].order_id == results[i].id)
                                    {
                                        product.push(product1[j].product_name)
                                        if(j==product1.length-1) {
                                            results[i].product=product;
                                        }
                                    }
                                    else {
                                        if(j==product1.length-1)
                                        {
                                            results[i].product=product;
                                        }
                                    }
                                }(j));

                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].order_id == results[i].id)
                                    {
                                        cate.push(cat[j].name);
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            data=results;
           // console.log('final1====',data);
            callback(null,data)
        }
    })

}

exports.supplierScheduleOrdersList=  function (dbName,res,id,limit,count,callback) {
    var product=[];
    var results=[];
    var cate=[];
    var orderId=[];
    limit = limit-1;
    async.auto({
        orders:function (cb) {
            var sql='select  o.promo_discount,o.promo_code,o.redeem_promo,o.apply_promo,o.id,o.created_on,o.schedule_date,s.name as supplier,o.status,u.email As User_Name,u.mobile_no ' +
                'from orders o join supplier_branch sb on sb.id=o.supplier_branch_id join supplier s on sb.supplier_id=s.id '+
                'join user u on o.user_id=u.id where s.id= ? AND o.status= ? limit ?,?';
            multiConnection[dbName].query(sql,[id,9,limit,count],function (err,orders) {
                console.log(".........",err,orders);
                if(err)
                {
                    console.log('error------',err);
                    sendResponse.somethingWentWrongError(res);

                }
                else
                if(orders.length) {
                    for(var i=0;i<orders.length;i++)
                    {
                        (function (i) {
                            orderId.push(orders[i].id);
                            if(i==(orders.length-1)){
                                results = orders;
                                cb(null);
                            }
                        }(i))
                    }
                    // console.log('asdf------',results);
                    // 
                }
                else {
                    var data = [];
                    sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res,constant.responseStatus.SUCCESS);
                }
            })
        },
        product:['orders',function(cb){
            orderId=orderId.toString()
            var sql2='select op.order_id,op.product_name from order_prices op where op.order_id IN('+orderId+')';
            multiConnection[dbName].query(sql2,function (err,product1) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            product=[];
                            for(var j=0;j<product1.length;j++)
                            {

                                (function(j){
                                    if(product1[j].order_id == results[i].id)
                                    {
                                        product.push(product1[j].product_name)
                                        if(j==product1.length-1) {
                                            results[i].product=product;
                                        }
                                    }
                                    else {
                                        if(j==product1.length-1)
                                        {
                                            results[i].product=product;
                                        }
                                    }
                                }(j));

                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))

                    }

                }
            })
        }],
        category:['product',function(cb){
            var sql3='select c.name,c.id,op.order_id from order_prices op join product p on p.id=op.product_id join categories c on c.id=p.category_id where op.order_id IN('+orderId+')';
            multiConnection[dbName].query(sql3,function (err,cat) {
                if (err) {
                    console.log('error------', err);
                    sendResponse.somethingWentWrongError(res);

                }
                else {
                    for(var i=0;i<results.length;i++) {

                        (function (i) {
                            cate=[];
                            for(var j=0;j<cat.length;j++)
                            {
                                (function(j){
                                    if(cat[j].order_id == results[i].id)
                                    {
                                        cate.push(cat[j].name);
                                        if(j==cat.length-1) {
                                            results[i].category=cate;
                                        }
                                    }
                                    else {
                                        if(j==cat.length-1)
                                        {
                                            results[i].category=cate;
                                        }
                                    }
                                }(j));
                            }
                            if(i==results.length-1)
                            {
                                cb(null);
                            }
                        }(i))
                    }

                }
            })
        }]
    },function(err,data){
        if(err) {
            sendResponse.somethingWentWrongError(res);
        }else{
            data=results;
          //  console.log('final1====',data);
            callback(null,data)
        }
    })

}
