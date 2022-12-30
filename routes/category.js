/**
 * Created by vinay on 23/2/16.
 */

var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var validator = require("email-validator");
var loginCases = require('./loginCases');
var objectAssign = require('object-assign');
var func = require('./commonfunction');
var loginFunctions = require('./loginFunctions');
var _ = require('underscore'); 
var chunk = require('chunk');
const uploadMgr = require('../lib/UploadMgr')
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
const ExecuteQ = require('../lib/Execute');
const UniversalFunction=require('../util/Universal')
/*
 * This function is used to add main category:
 *
 * Parameters : accessToken,authSectionId,name,
 *               languageId,description1,image,
 *               icon1,illustration,level
 */
exports.addCategory = function (req, res) {

    
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var name = req.body.name;
    var menu_type = req.body.menu_type;
    var languageId = req.body.languageId;
    let terminology=req.body.terminology;
    let payment_after_confirmation=req.body.payment_after_confirmation!=undefined?req.body.payment_after_confirmation:0;

    var description = req.body.description1;
   
    var image = req.files!=undefined?req.files.image:undefined;
    var icon = req.files!=undefined?req.files.icon1:undefined;
    let type=req.body.type!=undefined?req.body.type:0;
    var category_flow=req.body.category_flow!=undefined && req.body.category_flow!="" && req.body.category_flow!=null?req.body.category_flow:""
    var agent_list=req.body.agent_list!=undefined?req.body.agent_list:0;
    let is_agent=0
    if(parseInt(agent_list)>0){
        is_agent=1
    }
    var supplier_id=req.body.supplier_id!=undefined && req.body.supplier_id!=""?req.body.supplier_id:0;
    
    var is_variant=req.body.is_variant!=undefined && req.body.is_variant!="" && req.body.is_variant!=null?req.body.is_variant:0;
    var variant_name= req.body.variant_name;
    var variant_values=req.body.variant_values!=undefined && req.body.variant_values!=""?JSON.parse(req.body.variant_values):[];
    var supplierPlaceMentLevel = req.body.level!=undefined?req.body.level:3;
    var start_time=req.body.start_time!=undefined && req.body.start_time!="" && req.body.start_time!=null?req.body.start_time:"00:00:00";
    var end_time=req.body.end_time!=undefined && req.body.end_time!="" && req.body.end_time!=null?req.body.end_time:"00:00:00";
    let order_instructions=req.body.order_instructions!=undefined?req.body.order_instructions:0;
    let cart_image_upload=req.body.cart_image_upload!=undefined?req.body.cart_image_upload:0;
    
    let age_limit = req.body.age_limit!=undefined? req.body.age_limit:0;
    let commission = req.body.commission!=undefined? req.body.commission:0;

    let is_dine=req.body.is_dine!=undefined?req.body.is_dine:0
    let is_liquor=req.body.is_liquor!=undefined?req.body.is_liquor:0
    var adminId;
    var folder = "abc";
    var imageName;
    var iconName;
    var illustrationName;
    var languageIds;
    var names,insertedId;
    var descriptions;
    let tax = req.body.tax || 0;
    let businessName=req.body.businessName || ""
    let websiteUrl=req.body.websiteUrl || ""
    var manValue = [accessToken, authSectionId, name, languageId, supplierPlaceMentLevel,tax];

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            languageIds = languageId.split("#");
            names = name.split("#");
            descriptions = description!=undefined && description!=""?description.split("#"):"";
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);
        },
        async function(cb){
            let name = names[0].replace(/'/g,"\\'")
            let sql = "select id from categories where name like '"+name+"' and is_deleted=0;"
            let reply=await ExecuteQ.Query(req.dbName,sql,[0])
            // let stmt = multiConnection[req.dbName].query(sql,[0],function(err,reply){
            //     console.log("===slql ======query=======",stmt.sql)
            //     if(err){
            //         console.log(err);
            //         sendResponse.somethingWentWrongError(res);
            //     }else{
                    if(reply && reply.length){
                        var msg = "Category with this name already exists ";
                        return sendResponse.sendErrorMessage(msg,res,401);
                    }else{
                        cb(null)
                    }
            //     }
            // })
            },
        function (cb) {
            async.parallel([
                async function (cbin) {
                    if(image){
                         let imageUrl = await uploadMgr.uploadImageFileToS3BucketNew(image)
                        //  func.uploadImageFileToS3Bucket(res, image, folder, cbin);
                        cbin(null,imageUrl)
                    }
                    else{
                        cbin(null)
                    }
                },
                async function (cbin) {
                    //onsole.log("=====imagename===="+name);
                    if(icon){
                        let iconUrl = await uploadMgr.uploadImageFileToS3BucketNew(icon);
                        cbin(null,iconUrl);
                        // func.uploadImageFileToS3Bucket(res, icon, folder, cbin);
                    }
                    else{
                        cbin(null)
                    } 
                  
                }
            ], function (err2, response2) {
                if (err2) {
                } else {
                    cb(null, response2)
                }
            })
        },
        function (name, cb) {
            imageName = name[0] || "";
            iconName = name[1] || "";     

            savecategory(req.dbName,order_instructions,cart_image_upload,res,
                 cb, names[0], imageName, iconName, adminId, supplierPlaceMentLevel,
                 is_variant,age_limit,category_flow,agent_list,start_time,end_time,
                 tax,is_agent,type,terminology,
                 payment_after_confirmation,menu_type,is_dine,commission,is_liquor)
           
        },
        function (categoryId, cb) {
            insertedId=categoryId
            createQueryString(req.dbName,res, cb, languageIds, names, descriptions, categoryId);
        },
        function (values, queryString, cb) {

            insertCategoryInMutipleLangauge(req.dbName,res, cb, values, queryString);
        },
        function (cb) {
            if(supplier_id!=0){
                var params=[supplier_id,insertedId,0,0]
                 insertCategoryInSupplier(req.dbName,res, cb, params);
            }
            else{
                cb(null)
            }
        },
        async  function (cb) {
            try{
                if(businessName!="" && websiteUrl!=""){
                    let xmLpath=config.get("server.xmlPath")+businessName+"_sitemap.xml";
                    let supplierUrlJson=
                        {
                            loc: {
                                _text: websiteUrl+'/supplier/supplier-list?cat_id='+insertedId+'&cat_name='+names[0]+'',
                            },
                            changefreq: {
                                _text: 'weekly'
                            },
                            }
                    let xmlData=await UniversalFunction.getExistingUrlsFromXml(xmLpath,supplierUrlJson);

                    logger.debug("==xmLpath=xmlData!=====",xmLpath,xmlData);
                    if(Object.keys(xmLpath).length>0){
                        await UniversalFunction.writeNewUrlsInXml(xmLpath,xmlData);
                    }
                }
                cb(null)
            }
            catch(Err){
                cb(null)
            }
        },
        // function (cb) {
        //     if(is_variant==1){
        //         saveVariants(res,cb,insertedId,variant_name,variant_values)
        //     }
        //     else{
        //         cb(null)
        //     }
        // }

    ], function (error, response) {
        
        console.log("===ERROR!==",error);

        if (error) {
            console.log("--------------",err)
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {category_id:insertedId};
            sendResponse.sendSuccessData(data, constant.responseMessage.CATEGORY_ADDED, res, constant.responseStatus.SUCCESS);
        }
    })
}

/*
 * This function is used to insert category of suppplier
 *  into in multiple languages.
 */
async function insertCategoryInSupplier(dbName,res, callback, values) {
    var sql2 = "insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id) values(?,?,?,?)"
    await ExecuteQ.Query(dbName,sql2,values);
    callback(null)
    // multiConnection[dbName].query(sql2,values,function(err,result2)
    // {
    //     logger.debug("==SUPLIER=CATE=ERR!==",err)
    //     callback(null)

    // })
}


exports.addSubCategory = function (req, res) {

    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var name = req.body.name;
    var languageId = req.body.languageId;

    if(languageId==undefined){
        languageId = '14#15'
    }
    var imageName = [];
    var iconName = [];
    var description = req.body.description1;
    var image = req.files.image || [];
    var icon = null ;


    if(req.files.icon1){
        icon1 = req.files.icon1
    }

    var categoryId = req.body.categoryId;
    var menu_type = req.body.menu_type;
    var subCategory;
    var count = req.body.count;
    var supplier_id=req.body.supplier_id!=undefined && req.body.supplier_id!=""?req.body.supplier_id:0
    var adminId;
    var folder = "abc";

    var manValue = [accessToken, authSectionId, name, description, languageId, categoryId, count]
    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            count = parseInt(count);
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);
        },
        async function (cb) {
            if(req.files.icon1){
                let result2 = await uploadMgr.uploadImageFileToS3BucketNew(icon1[0]);
                iconName.push(result2);
            }else{
                iconName.push("");
            }

            if(req.files.image){
                let result1 = await uploadMgr.uploadImageFileToS3BucketNew(image[0]);
                imageName.push(result1);
            }else{
                imageName.push("");
            }


       


           

            cb(null);
            // async.waterfall([
            //     function (cbs) {
            //         func.uploadImageFileToS3Bucket(res, image[0], folder,function(err,result){
            //             if(err){
            //                 cbs(err);
            //             }else{
            //                 imageName.push(result);
            //                 cbs(null);
            //             }
            //         });
            //     },
            //     function (cbs) {
            //         if(icon != null)
            //         {

            //             func.uploadImageFileToS3Bucket(res, icon[0], folder,function(err,result){
            //                 if(err){
            //                     cbs(err);
            //                 }else{
            //                     iconName.push(result);
            //                     cbs(null);
            //                 }
            //             });
            //         }
            //         else{

            //             cbs(null);
            //         }
            //     }
            // ], function (err2, response2) {

            //  //   console.log("==============response2===============" + response2)
            //  //   console.log("==========imagename===========" + JSON.stringify(imageName));
            //  //   console.log("==========iconName===========" + JSON.stringify(iconName));
            //     cb(null);

            // })
        },

        // function (cb) { //uncomment this code to enable n and n-1 level product category check
        //     checkSubCategoryMenutype(req,req.dbName,res,cb,categoryId);
        // },
        // function (cb) { //uncomment this code to enable n and n-1 level product category check
        //     checkSubCategorySiblingMenutype(req,req.dbName,res,cb,categoryId,menu_type);
        // },
        function (cb) {
            if(iconName.length)
            {
                createQueryStringForSubCategory(res, cb, name, imageName, iconName, count, categoryId, adminId,menu_type);
            }
            else{
                createQueryStringForSubCategory(res, cb, name, imageName,[" "], count, categoryId, adminId,menu_type);
            }

        },
        
        function (values, queryString, cb) {
           // console.log("======call======saveSubCategory=================")
            saveSubCategory(req.dbName,res, cb, queryString, values);
        },
        function (subCategoryId, cb) {
            subCategory = subCategoryId;
          //  console.log("======call======createQueryStringForMlSubCat=================")
            createQueryStringForMlSubCat(res, cb, languageId, name, description, count, subCategoryId);
        },
        function (values, queryString, cb) {        
         insertCategoryInMutipleLangauge(req.dbName,res, cb, values, queryString);
        },
        async function(cb){ 
            try {      
            if(supplier_id!=0){   
                let data=await ExecuteQ.Query(req.dbName,"select c1.id from categories c1,categories c2 where c1.id=c2.parent_id and c2.id=? and c1.is_deleted=?",[parseInt(categoryId),0])             
                // multiConnection[req.dbName].query("select c1.id from categories c1,categories c2 where c1.id=c2.parent_id and c2.id=? and c1.is_deleted=?",[parseInt(categoryId),0],(err,data)=>{
                //     logger.debug("==Err!==",err,data)
                //     if(err){
                //         sendResponse.somethingWentWrongError(res);
                //     }
                //     else{
                        //For detail sub category to supplier 
                        if(data && data.length>0){
                            var catId=data[0].id
                            var sql="insert into supplier_category(`supplier_id`,`category_id`,`sub_category_id`,`detailed_sub_category_id`) values (?,?,?,?)"
                           await ExecuteQ.Query(req.dbName,sql,[parseInt(supplier_id),parseInt(catId),parseInt(categoryId),parseInt(subCategory)])
                            // multiConnection[req.dbName].query(sql,[parseInt(supplier_id),parseInt(catId),parseInt(categoryId),parseInt(subCategory)],(err,data)=>{
                            //     if(err){
                            //         sendResponse.somethingWentWrongError(res);
                            //     }
                            //     else{
                                    cb(null)
                            //     }
                            // })
                        }
                        //For sub category to supplier
                        else{
                            var sql="insert into supplier_category(`supplier_id`,`category_id`,`sub_category_id`,`detailed_sub_category_id`) values (?,?,?,?)"
                            await ExecuteQ.Query(req.dbName,sql,[parseInt(supplier_id),parseInt(categoryId),parseInt(subCategory),0])
                            // multiConnection[req.dbName].query(sql,[parseInt(supplier_id),parseInt(categoryId),parseInt(subCategory),0],(err,data)=>{
                            //     if(err){
                            //         sendResponse.somethingWentWrongError(res);
                            //     }
                            //     else{
                                    cb(null)
                            //     }
                            // })
                        }
                //     }
                // })
            }
            else{
                cb(null)
            }
        }
        catch(Err){
            logger.debug("======+Err!==",Err);
            sendResponse.somethingWentWrongError(res);
        }
        }
    ], function (err1, reponse1) {
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUB_CATEGORY_ADDED, res, constant.responseStatus.SUCCESS);
        }
    })
}

const getParentId=(dbName,id)=>{
    return new Promise((resolve,reject)=>{
        multiConnection[dbName].query("select c1.id from categories c1,categories c2 where c1.id=c2.parent_id and c2.id=? and c1.is_deleted=?",[parseInt(id),0],(err,data)=>{
            logger.debug("==Err!==",err,data)
            if(data && data.length>0){
                resolve(data[0].id)
            }
            else{
                resolve(id)
            }
        })
    })
}


exports.editSubCategory = function (req, res) {
    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var name = req.body.name;
    var languageId = req.body.languageId;
    var description = req.body.description1;
    var subCategoryId = req.body.subCategoryId;
    var adminId;
    var folder = "abc";
    var imageName = req.body.imageName;
    var iconName = req.body.iconName;
    var iconStatus = req.body.iconStatus;
    var languageIds;
    var names;
    var descriptions;
    var image = req.files.image;
    var icon = null ;
    let terminology=req.body.terminology;
    let type=req.body.type!=undefined?req.body.type:0;
    var menu_type = req.body.menu_type;

    if(req.files.icon1){
        icon = req.files.icon1
    }
    var is_variant=req.body.is_variant;
    var variant_name= req.body.variant_name;
    var update_variant=req.body.update_variant
    var new_variant=req.body.new_variant;
    let age_limit = req.body.age_limit!=undefined? req.body.age_limit:0;
    var variant_values=req.body.variant_values!=undefined && req.body.variant_values!=""?JSON.parse(req.body.variant_values):[];
    
    var agent_list = req.body.agent_list;
    let order_instructions=req.body.order_instructions!=undefined?req.body.order_instructions:0;
    let cart_image_upload=req.body.cart_image_upload!=undefined?req.body.cart_image_upload:0;
    let payment_after_confirmation=req.body.payment_after_confirmation!=undefined?req.body.payment_after_confirmation:0;
    let is_agent=0
    if(parseInt(agent_list)>0){
        is_agent=1
    }
    var descriptions;
    let tax = req.body.tax
    // var manValue = [accessToken, authSectionId, categoryId, name, description, languageId, tax];
    var start_time=req.body.start_time!=undefined && req.body.start_time!="" && req.body.start_time!=null?req.body.start_time:"00:00:00";
    var end_time=req.body.end_time!=undefined && req.body.end_time!="" && req.body.end_time!=null?req.body.end_time:"00:00:00";
    let commission = req.body.commission!==undefined?req.body.commission:0;
    if(parseInt(is_variant)==1){
        // console.log("===variant_values==",variant_values,variant_values.length);

        if(new_variant && new_variant.length<=0){
            var msg = "please add some variant value"
            return sendResponse.sendErrorMessage(msg,res,400);
        }
    }
    var manValue = [accessToken, authSectionId, name, description, languageId,subCategoryId,iconStatus];
    
    async.waterfall([
        function (cb) {

            func.checkBlank(res, manValue, cb);

        },
        function (cb) {

            func.authenticateAccessToken(req.dbName,accessToken, res, cb);

        },
        function (adminId1, cb) {

            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);

        },

        // function (cb) { //uncomment this code to enable n and n-1 level product category check
        //     checkSubCategoryMenutype(req.dbName,res,cb,categoryId);
        // },
        // function (cb) { //uncomment this code to enable n and n-1 level product category check
        //     checkSubCategorySiblingMenutype(req.dbName,res,cb,categoryId,menu_type);
        // },
        async function (cb) {
            languageIds = languageId.split("#");
            names = name.split("#");
            descriptions = description.split("#");
            if(req.files.image){

                // func.uploadImageFileToS3Bucket(res, image[0], folder, cb);
               let imageResult = await uploadMgr.uploadImageFileToS3BucketNew(image[0]);
               cb(null,imageResult);
            }else{
                cb(null,imageName);
            }
        },
        async function (name, cb) {
            imageName = name;
            
            // if(iconStatus == 1)
            // {
                if(req.files.icon1){
                    let imageResult = await uploadMgr.uploadImageFileToS3BucketNew(icon[0]);
                    cb(null,imageResult);
                    // func.uploadImageFileToS3Bucket(res,icon[0], folder, cb);
                }else{
                    cb(null,iconName);
                }
            // }
            // else{
            //     cb(null,"");
            // }

        },
        function (name1,cb) {
            iconName = name1;
            updateCategory(req.dbName,order_instructions,cart_image_upload,res, cb,
                 subCategoryId, names[0], imageName, age_limit,iconName,agent_list,
                 start_time,end_time,tax,is_agent,type,terminology,
                 payment_after_confirmation,menu_type,0,commission);
        },
        function (cb) {
          //  console.log("======call======createQueryStringForMlSubCat=================");
            createQueryStringForMlSubCat(res, cb, languageId, name, description, 1, subCategoryId);
        },
        function (values, queryString,cb) {
          //  console.log("======call======saveSubCategory=================")
            updateSubCategoryInMultiple(req.dbName,res, cb, subCategoryId ,languageIds,values,queryString)
        },
        // function(cb){
        //     if(is_variant==1){
        //         saveVariants(res,cb,insertedId,variant_name,new_variant)
        //     }
        //     else{
        //         cb(null)
        //     }
        // },
        // function (cb){
        // }        
    ], function (err1, response1) {
        if (err1) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.SUB_CATEGORY_UPDATED, res, constant.responseStatus.SUCCESS);
        }
    })
}



/*
 * ------------------------------------------------------
 * List all the added main categories which are not deleted
 * Input:access token,section id
 * Output: List of categories added
 * ------------------------------------------------------
 */

exports.listCategories = function (req, res) {

    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];
  //  console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                loginFunctions.listCategories(req.dbName,res, cb);
            },
            // function (data,cb) {
            //     loginFunctions.listVariants(data, cb);
            // },
        ], function (error, callback) {
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(callback, constant.responseMessage.LIST_CATEGORIES, res, constant.responseStatus.SUCCESS);
            }


        }
    );
}


/*
 * This function is used to edit main category:
 *
 * Parameters : accessToken,authSectionId,name,
 *               languageId,description1,image,
 *               icon1,illustration,level
 */
exports.editCategory = function (req, res) {


    var accessToken = req.body.accessToken;
    var authSectionId = req.body.authSectionId;
    var categoryId = req.body.categoryId;
    let terminology=req.body.terminology;
    let type=req.body.type!=undefined?req.body.type:0;
    let is_liquor=req.body.is_liquor!=undefined?req.body.is_liquor:0;
    let is_dine=req.body.is_dine!=undefined?req.body.is_dine:0;
    var imageUrl = req.body.imageUrl;
    var iconUrl = req.body.iconUrl;
    var name = req.body.name;
    var description = req.body.description1;
    var languageId = req.body.languageId;
    var image = req.files.image;
    var icon = req.files.icon1;
    var adminId;
    var folder = "abc";
    var imageName;
    var iconName;
    var languageIds;
    var names;
    var menu_type = req.body.menu_type;
    var agent_list = req.body.agent_list;
    let order_instructions=req.body.order_instructions!=undefined?req.body.order_instructions:0;
    let cart_image_upload=req.body.cart_image_upload!=undefined?req.body.cart_image_upload:0;
    let payment_after_confirmation=req.body.payment_after_confirmation!=undefined?req.body.payment_after_confirmation:0;
    let is_agent=0
    let age_limit = req.body.age_limit!=undefined? req.body.age_limit:0;
    let commission = req.body.commission!==undefined? req.body.commission:0;
    if(parseInt(agent_list)>0){
        is_agent=1
    }
    var descriptions;
    let tax = req.body.tax
    var manValue = [accessToken, authSectionId, categoryId, name, description, languageId, tax];
    var start_time=req.body.start_time!=undefined && req.body.start_time!="" && req.body.start_time!=null?req.body.start_time:"00:00:00";
    var end_time=req.body.end_time!=undefined && req.body.end_time!="" && req.body.end_time!=null?req.body.end_time:"00:00:00";
  
    console.log("body",req.body);
    console.log("files",req.files.image,req.files.icon1);

   // console.log("==================image===========" + JSON.stringify(image));
   console.log("=====age_limit===33=" , age_limit);

    async.waterfall([
        function (cb) {
            func.checkBlank(res, manValue, cb);
        },
        function (cb) {
            console.log("==================auth===========");
            func.authenticateAccessToken(req.dbName,accessToken, res, cb);
        },
        function (adminId1, cb) {
            adminId = adminId1;
            func.checkforAuthorityofThisAdmin(req.dbName,adminId, authSectionId, res, cb);
        },
        async function (cb) {
            let taxData=await ExecuteQ.Query(req.dbName,`select tax from categories where id=?`,[categoryId])
            if(taxData && taxData.length>0){
                   logger.debug("======Tax=tax===",parseFloat(taxData[0].tax),parseFloat(tax))
                    // if(parseFloat(taxData[0].tax)!=parseFloat(tax)){
                    let subData=await ExecuteQ.Query(req.dbName,`select parent_id,id from categories where parent_id!=? 
                    and is_deleted=? and is_live=?`,[
                        0,0,1
                    ]);
                    let nthLevelIds=UniversalFunction.getNestedChildrenIds(subData,categoryId);
                    logger.debug("===nthLevelIds====>>",nthLevelIds)
                    if(nthLevelIds==""){
                        nthLevelIds=categoryId
                    }
                    logger.debug("===nthLevelIds====>>",nthLevelIds)
                    let productPricing=await ExecuteQ.Query(req.dbName,`select pc.* from product_pricing pc join product p on p.id=pc.product_id where p.category_id IN(?)`,[nthLevelIds]);
                    // order_instructions=?,cart_image_upload=?
                    await ExecuteQ.Query(req.dbName,'update categories set order_instructions=?,cart_image_upload=? where id IN(?)',[order_instructions,cart_image_upload,nthLevelIds]);

                    let adminHandling=0,price=0,displayPrice=0;
                    if(productPricing && productPricing.length>0){
                        for await (const [indx,i] of productPricing.entries()){
                            // adminHandling=parseFloat(i.handling);
                            displayPrice=parseFloat(i.display_price);
                            price=parseFloat(i.price);
                            logger.debug("==price==>",tax,price)
                            // adminHandling=price*parseFloat(tax)/100;
                            adminHandling=tax;
                            logger.debug("====>>",(Number.isNaN(adminHandling)))
                            if(!(Number.isNaN(adminHandling))){
                                await ExecuteQ.Query(req.dbName,"update product_pricing set handling=? where id=?",[
                                    adminHandling,
                                    i.id])
                            }
                        }
                    }
                // }
            }
            languageIds = languageId.split("#");
            names = name.split("#");
            descriptions = description.split("#");
            console.log("jnsa",imageUrl);
            if (imageUrl) {
                console.log("if");
                cb(null, imageUrl);
            } else {
                // func.uploadImageFileToS3Bucket(res, image, folder, cb);
                let imageResult = await uploadMgr.uploadImageFileToS3BucketNew(image);
                cb(null,imageResult);
            }
        },
        async function (name, cb) {
            
            imageName = name;
            if (iconUrl) {
                cb(null, iconUrl);
            } else {
                // func.uploadImageFileToS3Bucket(res, icon, folder, cb);
                let imageResult = await uploadMgr.uploadImageFileToS3BucketNew(icon);
                cb(null,imageResult);
            }
        },
        function (name1, cb) {
            console.log("=====age_limit==44==" , age_limit);
            iconName = name1;
            updateCategory(req.dbName,
                order_instructions,
                cart_image_upload,
                res,
                cb,
                categoryId,
                names[0], 
                imageName,age_limit, iconName,agent_list,start_time,
                 end_time,tax,is_agent,type,terminology,
                 payment_after_confirmation, menu_type,is_dine,commission,is_liquor);
        },
        function (cb) {
            logger.debug("=================in update multiple==========")
            updateCategoryInMultiple(req.dbName,res, cb, categoryId, names, languageIds, descriptions);
        }

    ], function (error, response) {
        if (error) {
            sendResponse.somethingWentWrongError(res);
        } else {
            var data = {};
            sendResponse.sendSuccessData(data, constant.responseMessage.CATEGORY_UPDATED, res, constant.responseStatus.SUCCESS);
        }
    })
}
/*
 * This function is used to insert category
 *  into category table.
 */
async function savecategory(dbName,order_instructions,cart_image_upload,res,
     callback, name, imageName, iconName, adminId, supplierPlaceMentLevel,is_variant,age_limit,
     category_flow,agent_list,start_time,end_time,tax,is_agent,type,
     terminology,payment_after_confirmation,menu_type,is_dine,commission,is_liquor) {
    try{
    var sql = "insert into categories(`commission`,`order_instructions`,`cart_image_upload`,`name`, `supplier_placement_level`,  `image`, `icon`,`created_by`,`is_variant`,`age_limit`,`category_flow`,`agent_list`,`start_time`,`end_time`,`tax`,`is_agent`,`type`,`terminology`,`payment_after_confirmation`,`menu_type`,`is_dine`,`is_liquor`) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    let reply1=await ExecuteQ.Query(dbName,sql,[commission,order_instructions,cart_image_upload,name, supplierPlaceMentLevel, imageName, iconName, adminId,is_variant,age_limit,category_flow,agent_list,start_time,end_time,tax,is_agent,type,terminology,payment_after_confirmation,menu_type,is_dine,is_liquor])

               await updateTaxForCategory(dbName,reply1.insertId,tax)
            
              callback(null, reply1.insertId);
    }
    catch(err){
        logger.debug("==========err1234========",err)
        sendResponse.somethingWentWrongError(res);
    }
}
function updateTaxForCategory(dbName,categoryId,tax){
    return new Promise(async (resolve,reject)=>{
        try{
            let sql = "update product_pricing pp join product p on p.id = pp.product_id "+
            "set handling=? where category_id = ?"
            await ExecuteQ.Query(dbName,sql,[tax,categoryId]);
            resolve()
        }
        catch(Err){
            logger.debug("==Err!",Err)
            reject(Err)
        }
        // let sql = "update product_pricing pp join product p on p.id = pp.product_id "+
        // "set handling=? where category_id = ?"
        // var stmt = multiConnection[dbName].query(sql,[tax,categoryId],function(err,data){
        //     logger.debug("===========updateTaxForCategoryupdateTaxForCategory========",stmt.sql)
        //     if(err){
        //         reject()
        //     }else{
        //         resolve()
        //     }
        // })
        
    })
}

/**
 * @desc used for saving an categories variants
 * @param {*Object} res 
 * @param {*function} callback 
 * @param {*Int} cat_id 
 * @param {*String} name 
 * @param {*Array} variant_values 
 */
function updateVariants(res,cbs,name,variant_values) {
    var variant_values_array=[];
    // console.log("==variant_values==",variant_values,cbs);
    multiConnection[dbName].beginTransaction(function(err) {
        if (err) { sendResponse.somethingWentWrongError(res);}
        var catVariantQuery="insert into cat_variants (`name`,`cat_id`) values(?,?)";
        var statememt=multiConnection[dbName].query(catVariantQuery,[name,cat_id], function(err, result) {
          if (err) { 
                multiConnection[dbName].rollback(function() {
                    sendResponse.somethingWentWrongError(res);
                });
          }
          if(variant_values && variant_values.length>0){
                        _.each(variant_values,function(i){
                            variant_values_array.push(
                                result.insertId,
                                i.value
                            )
                        })
          }

        //   console.log("==variant_values_array=",variant_values_array);
          var variantQuery="insert into variants (`cat_variant_id`,`value`) values(?,?)"
          multiConnection[dbName].query(variantQuery,variant_values_array,function(err, result) {

                        if (err) { 
                            multiConnection[dbName].rollback(function() {
                                sendResponse.somethingWentWrongError(res);
                            });
                        }  
                        multiConnection[dbName].commit(function(err) {
                        if (err) { 
                                multiConnection[dbName].rollback(function() {
                                    sendResponse.somethingWentWrongError(res);
                                });
                        }else{
                            multiConnection[dbName].end();
                            cbs(null,{})
                        }        
                        });
          });
        });
      });

}

/**
 * @desc used for check sub category menu type
 * @param {*String} dbName 
 * @param {*Object} res 
 * @param {*Function} callback 
 * @param {*Int} category_id 
 */
async function checkSubCategoryMenutype(req,dbName,res, callback, category_id) {
    try{
    var sql = "select parent_id,menu_type,type from categories where `id`='"+category_id+"'";
    let result=await ExecuteQ.Query(dbName,sql,[])
    // multiConnection[dbName].query(sql, function (err, result) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     } 
     if(result[0] && result[0].menu_type && result[0].menu_type=='0'){
            var sql1 = "select id,menu_type from categories where `id`='"+result[0].parent_id+"'";
            let result1=await ExecuteQ.Query(dbName,sql1,[])
            // multiConnection[dbName].query(sql1, function (err1, result1) {
            //     if (err1) {
            //         sendResponse.somethingWentWrongError(res);
            //     } 
             if(result1[0] && result1[0].menu_type && result1[0].menu_type=='0' && parseInt(req.service_type)==1){                    
                    sendResponse.sendErrorMessage("Third level food category is not allowed",res,400);
                }
            else if(parseInt(req.service_type)>10){
                if(result1[0] && result1[0].menu_type && result1[0].menu_type=='0' && parseInt(result[0].type)==1){                    
                    sendResponse.sendErrorMessage("Third level food category is not allowed",res,400);
                }
                else{
                    callback(null);
                }
            }
            else{
                    callback(null);
                }
            // })
        }else{
            callback(null);
        }
    // })
}catch(Err){
    logger.debug("====Err!==",Err)
    sendResponse.somethingWentWrongError(res);
}
}
/**
 * @description chek an supplier have further menu type
 * @param {*String} dbName 
 * @param {*Object} res 
 * @param {*Function} callback 
 * @param {*Int} category_id 
 * @param {*Int} menu_type 
 */
async function checkSubCategorySiblingMenutype(req,dbName,res, callback, category_id,menu_type) {
    try{
    var sql = "SELECT id,menu_type,type FROM `categories` WHERE parent_id='"+category_id+"'";
    let result=await ExecuteQ.Query(dbName,sql,[])
    // multiConnection[dbName].query(sql, function (err, result) {
    //     if (err) {
    //         sendResponse.somethingWentWrongError(res);
    //     } 
         if(result[0]){
            if(result[0].menu_type==menu_type || result[0].menu_type=="" || result[0].menu_type==null ){
                callback(null);
            }else{
                if(parseInt(req.service_type)==1){
                    var menu_type_name = "Food";
                    if(result[0].menu_type=="1"){
                        menu_type_name = "Restaurant";
                    }
                    sendResponse.sendErrorMessage("Selected category can only have "+menu_type_name+" type categories",res,400);
                }
                else {
                    callback(null);
                }
            }
        }else{
            callback(null);
        }
    // })
    }
    catch(Err){
        logger.debug("Er!==",Err)
        sendResponse.somethingWentWrongError(res);
    }
}



/**
 * @desc saving sub category data
 * @param {*String} dbName 
 * @param {*Object} res 
 * @param {*function} callback 
 * @param {*string} queryString 
 * @param {*Array} values 
 */
async function saveSubCategory(dbName,res, callback, queryString, values) {
    try{
        var sql = "insert into categories(`name`, `parent_id`,`image`, `icon`,`created_by`,`menu_type`) values" + queryString;
        let reply1=await ExecuteQ.Query(dbName,sql,values);
        callback(null, reply1.insertId);
    }
    catch(Err){
        logger.debug("====Err!==",Err);
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "insert into categories(`name`, `parent_id`,`image`, `icon`,`created_by`) values" + queryString;
    // multiConnection[dbName].query(sql, values, function (err1, reply1) {
    //     if (err1) {
    //         //console.log("============saveSubCategory============" + err1);
    //         sendResponse.somethingWentWrongError(res);
    //     } else {
    //        // console.log("============category id==============" + reply1.insertId);
    //         callback(null, reply1.insertId);
    //     }
    // })
}


/*
 * This function is used to insert category
 *  into in multiple languages.
 */
async function insertCategoryInMutipleLangauge(dbName,res, callback, values, queryString) {
    try{
        var sql = "insert into categories_ml(language_id,name,description,category_id) values " + queryString;
        await ExecuteQ.Query(dbName,sql,values);
        callback(null);
    }
    catch(Err){
        logger.debug("=====Err!===",Err)
        sendResponse.somethingWentWrongError(res);
    }
    // var sql = "insert into categories_ml(language_id,name,description,category_id) values " + queryString;
    // let stmt = multiConnection[dbName].query(sql, values, function (err1, reply1) {
    //     logger.debug("===========cat add in multi========",stmt.sql)
    //     if (err1) {
    //         console.log(err1);
    //         sendResponse.somethingWentWrongError(res);
    //     } else {
    //         callback(null);
    //     }
    // })
}

/*
 * This function is used to create
 *  query string.
 */
function createQueryString(dbName,res, callback, languageIds, names, descriptions, categoryId) {
    var values = new Array();
    var insertLength = "(?,?,?,?),";
    var querystring = '';
    var langLength = languageIds.length;
    var nameLength = names.length;
    for (var i = 0; i < nameLength; i++) {
        (function (i) {

            values.push(languageIds[i], names[i], descriptions[i], categoryId);
            // values.push(newValues);
            querystring = querystring + insertLength;

            if (i == nameLength - 1) {
                querystring = querystring.substring(0, querystring.length - 1);
                callback(null, values, querystring);

            }
        }(i))
    }
}

function createQueryStringForMlSubCat(res, callback, languageIds, names, descriptions, count, categoryId) {
    console.log("====count============" + count);
    var values = new Array();
    var insertLength = "(?,?,?,?),";
    var querystring = '';

    var suCategoryId = categoryId;
    var langId = languageIds.split("*");
    var name = names.split("*");
    var des = descriptions.split("*");
    for (var j = 0; j < count; j++) {
        (function (j) {
            console.log("=================languageid==========" + langId[j]);
            var languageId = langId[j].split("#");
            var name1 = name[j].split("#");
            var des1 = des[j].split("#");
            var langLength = languageId.length;
            for (var i = 0; i < langLength; i++) {
                (function (i) {

                    values.push(languageId[i], name1[i], des1[i], parseInt(suCategoryId) + j);
                    // values.push(newValues);
                    querystring = querystring + insertLength;


                    if (j == count - 1 && i == langLength - 1) {
                      //  console.log("values=========" + values);
                        querystring = querystring.substring(0, querystring.length - 1);
                        callback(null, values, querystring);

                    }
                }(i))
            }
        }(j))
    }
}

/**
 * @description update an category data
 * @param {*string} dbName 
 * @param {*int} order_instructions 
 * @param {*int} cart_image_upload 
 * @param {*object} res 
 * @param {*function} callback 
 * @param {*int} categoryId 
 * @param {*string} name 
 * @param {*string} imageName 
 * @param {*string} iconName 
 * @param {*int} agent_list 
 * @param {*string} start_time 
 * @param {*string} end_time 
 * @param {*int} tax 
 * @param {*string} is_agent 
 * @param {*int} type 
 * @param {*string} terminology 
 * @param {*Int} payment_after_confirmation 
 */
async function updateCategory(dbName,order_instructions,cart_image_upload,res, callback,
     categoryId, name, imageName,age_limit, iconName,agent_list,start_time,end_time,
      tax,is_agent,type,terminology,payment_after_confirmation,menu_type,is_dine,commission,is_liquor) {
    try{
        console.log("=====age_limit==55==" , age_limit);

    var sql = "update categories set commission="+commission+",order_instructions=?,cart_image_upload=?,name = ?,age_limit="+age_limit+",image = ?,icon = ?,agent_list=?,start_time=?,end_time=?,tax=?,is_agent=?,type=?,terminology=?,payment_after_confirmation=?,menu_type=?,is_dine=?,is_liquor=? where id = ? ";
    
    await ExecuteQ.Query(dbName,sql,[order_instructions,cart_image_upload,name, imageName, iconName, agent_list, start_time, end_time,tax, is_agent,type,terminology,payment_after_confirmation,menu_type,is_dine,is_liquor,categoryId])
    
    await ExecuteQ.Query(dbName,`update categories set payment_after_confirmation=? where parent_id=?`,[payment_after_confirmation,categoryId]);
    
    await updateTaxForCategory(dbName,categoryId,tax);

    callback(null);
}catch(err){
    logger.debug("========errin update tax========",err)
    sendResponse.somethingWentWrongError(res)
}
}


function updateCategoryInMultiple(dbName,res, callback, categoryId, names, languageIds, descriptions) {
    var langLength = languageIds.length;
    var sql = "update categories_ml set name = ?, description = ?  where language_id = ? and category_id = ? ";

    for (var i = 0; i < langLength; i++) {
        (async function (i) {
            await ExecuteQ.Query(dbName,sql,[names[i], descriptions[i], languageIds[i], categoryId])
            // multiConnection[dbName].query(sql, [names[i], descriptions[i], languageIds[i], categoryId], function (err1, reply1) {
            //     if (err1) {
            //         console.log("error" + err1);
            //         sendResponse.somethingWentWrongError(res);
            //     } else {
                    if (i == langLength - 1) {
                        callback(null);
                    }
            //     }
            // })
        }(i))
    }
}


function updateSubCategoryInMultiple(dbName,res, callback, categoryId ,languageIds,values,queryString) {

   async.waterfall([
       async function(cb){
           var sql = "delete from categories_ml where language_id in(?) and category_id in (?)";
           await ExecuteQ.Query(dbName,sql,[languageIds,categoryId])
        //    multiConnection[dbName].query(sql,[languageIds,categoryId],function(err,reply){
        //        if(err){
        //            sendResponse.somethingWentWrongError(res);
        //        }else{
                   cb(null);
        //        }
        //    })
       },
       function(cb){
           insertCategoryInMutipleLangauge(dbName,res,callback,values,queryString)
       }
   ],function(err2,response2){

   })
}


function createQueryStringForSubCategory(res, callback, name, imageName, iconName, count, categoryId, adminId, menu_type) {
    var values = new Array();
    var insertLength = "(?,?,?,?,?,?),";
    var querystring = '';
    var nameString = name.split("*");
  //  console.log("===========log================" + JSON.stringify(iconName));
    for (var i = 0; i < count; i++) {
        (function (i) {
            var names = nameString[i].split("#");
            values.push(names[0], categoryId, imageName[i], iconName[i], adminId, menu_type);
            // values.push(newValues);
            querystring = querystring + insertLength;

            if (i == count - 1) {
                querystring = querystring.substring(0, querystring.length - 1);
                callback(null, values, querystring);

            }
        }(i))
    }
}




/*
 * ------------------------------------------------------
 * Delete the main category
 * Input:access token,section id, category id
 * Output: Success/ error
 * ------------------------------------------------------
 */
exports.deleteCategory = function (req, res) {
    logger.debug("request parameters==>",req.body);
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = (req.body.id).toString();
    var manValues = [accessToken, sectionId, categoryId];
  
    var category=categoryId.split("#").toString();

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            }
        ], function (error, callback) {
            logger.debug("====RRR",error)
            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                async.parallel([
                   function(cb){
                       deleteFromCategoryTable(req.dbName,res,category,cb);
                   },
                    function(cb){
                        deleteFromProductTable(req.dbName,res,category,cb);
                    },
                    function(cb){
                        deleteFromSupplierProductTable(req.dbName,res,category,cb);
                    },
                    function(cb){
                        deleteFromSupplierBranchProductTable(req.dbName,res,category,cb);
                    },
                    function(cb){
                        deleteFromPromotions(req.dbName,res,category,cb);
                    },
                    function(cb){
                        deleteFromPackage(req.dbName,res,category,cb);
                    }
                ],function(err,response)
                {
                    logger.debug("==ERR!==",err)
                    if(err){
                        sendResponse.somethingWentWrongError(res)
                    }
                    else{
                        var data = {};
                        sendResponse.sendSuccessData(data, constant.responseMessage.DELETE_CATEGORY, res, constant.responseStatus.SUCCESS);
                    }

                })

            }


        }
    );
}


/*
 * ------------------------------------------------------
 * Make category live
 * Input:access token,section id, category id, status
 * Output: Success/ error
 * ------------------------------------------------------
 */
exports.makeCategoryLive = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var status = req.body.status;
    var manValues = [accessToken, sectionId, categoryId, status];
    var category=categoryId.split("#").toString();
  //  console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            }
        ], function (error, callback) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {

                var sql = " update categories set is_live=? where id IN ("+category+")";
                multiConnection[req.dbName].query(sql, [status], function (err, makeCategoryLive) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        if (status == 1) {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.CATEGORY_MADE_LIVE, res, constant.responseStatus.SUCCESS);

                        }
                        else {
                            var data = {};
                            sendResponse.sendSuccessData(data, constant.responseMessage.CATEGORY_NOT_MADE_LIVE, res, constant.responseStatus.SUCCESS);
                        }

                    }

                })
            }


        }
    );
}


/*
 * ------------------------------------------------------
 * List all the added sub categories under the main categories
 * Input:access token,section id, category_id
 * Output: List of sub categories added  under the given category id
 * ------------------------------------------------------
 */
exports.listSubCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var categoryId = req.body.categoryId;
    var manValues = [accessToken, sectionId, categoryId];
  //  console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                loginFunctions.getSubCategories(req.dbName,categoryId, res, cb);
            }
        ], function (error, response) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(response, constant.responseMessage.LIST_SUB_CATEGORIES, res, constant.responseStatus.SUCCESS);
            }

        }
    );

}


/*
 * ------------------------------------------------------
 * List all the added detailed sub categories
 * Input:access token,section id,seb category id
 * Output: List of detailed sub categories added  under the given sub category id
 * ------------------------------------------------------
 */
exports.listDetailedSubCategories = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var subCategoryId = req.body.subCategoryId;
    var manValues = [accessToken, sectionId,subCategoryId];
   // console.log(manValues + "request parameters")

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
            function (cb) {
                loginFunctions.getListOfSubCategoriesForDetailed(req.dbName,res,cb,subCategoryId);
            },
        ], function (error, response) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                sendResponse.sendSuccessData(response, constant.responseMessage.LIST_SUB_CATEGORIES, res, constant.responseStatus.SUCCESS);
            }


        }
    );

}


/*
 * ------------------------------------------------------
 * List all the category names and ids for subcategory section
 * Input:access token,section id
 * Output: List of categories names and ids
 * ------------------------------------------------------
 */
exports.listCategoriesNamesWithIds = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
        ], function (error, response) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var sql = "select id,name from categories where is_deleted=? and parent_id=?"
                multiConnection[req.dbName].query(sql, [0,0], function (err, categories) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        sendResponse.sendSuccessData(categories, constant.responseMessage.LIST_CATEGORIES_NAMES_WITH_IDS, res, constant.responseStatus.SUCCESS);
                    }

                })
            }


        }
    );

}

/*
 * ------------------------------------------------------
 * List all the sub categories names and ids for detailed subcategory section
 * Input:access token,section id
 * Output: List of sub categories names and ids
 * ------------------------------------------------------
 */
exports.listSubCategoriesNamesWithIds = function (req, res) {
    var accessToken = req.body.accessToken;
    var sectionId = req.body.sectionId;
    var manValues = [accessToken, sectionId];

    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                func.authenticateAccessToken(req.dbName,accessToken, res, cb);
            },
            function (id, cb) {
                func.checkforAuthorityofThisAdmin(req.dbName,id, sectionId, res, cb);
            },
        ], function (error, response) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var sql = "select id,name from categories where is_deleted=? and parent_id in (select id from categories where parent_id = ?)"
                multiConnection[req.dbName].query(sql, [0, 0], function (err, categories) {
                    if (err) {
                        sendResponse.somethingWentWrongError(res);
                    }
                    else {
                        sendResponse.sendSuccessData(categories, constant.responseMessage.LIST_SUB_CATEGORIES_NAMES_WITH_IDS, res, constant.responseStatus.SUCCESS);
                    }

                })
            }


        }
    );

}




function deleteFromCategoryTable(dbName,res,category,callback)
{
    var sql = " update categories set is_deleted=? where id IN ("+category+")";
    multiConnection[dbName].query(sql, [1], function (err, deleteCategory) {
        if (err) {
            console.log("1",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}


function  deleteFromProductTable(dbName,res,category,callback)
{
    var sql = "update product set is_deleted = ? where  category_id  IN ("+category+") or sub_category_id IN ("+category+") or detailed_sub_category_id  IN ("+category+")";
    multiConnection[dbName].query(sql,[1],function(err,result)
    {
        if (err) {
            console.log("2",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}

function  deleteFromSupplierProductTable(dbName,res,category,callback)
{
    var sql = "update supplier_product set is_deleted = ? where  category_id  IN ("+category+") or sub_category_id  IN ("+category+") or detailed_sub_category_id  IN ("+category+")";
    multiConnection[dbName].query(sql,[1],function(err,result)
    {
        if (err) {
            console.log("3",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}

function deleteFromSupplierBranchProductTable(dbName,res,category,callback)
{
    var sql = "update supplier_branch_product set is_deleted = ? where  category_id  IN ("+category+") or sub_category_id IN ("+category+") or detailed_sub_category_id  IN ("+category+")";
    multiConnection[dbName].query(sql,[1],function(err,result)
    {
        if (err) {
            console.log("4",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })
}


function deleteFromPromotions(dbName,res,category,callback)
{
    var sql = "update supplier_branch_promotions set is_deleted = ? where category_id  IN ("+category+") or sub_category_id  IN ("+category+") or detailed_sub_category_id  IN ("+category+")";
    multiConnection[dbName].query(sql,[1],function(err,result)
    {
        if (err) {
            console.log("5",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}


function deleteFromPackage(dbName,res,category,callback)
{
    var sql = "update supplier_package set is_deleted = ? where category_id  IN ("+category+") or sub_category_id  IN ("+category+") or detailed_sub_category_id  IN ("+category+")";
    multiConnection[dbName].query(sql,[1],function(err,result)
    {
        if (err) {
            console.log("6",err);
            sendResponse.somethingWentWrongError(res);
        }
        else {
            callback(null)
        }

    })

}