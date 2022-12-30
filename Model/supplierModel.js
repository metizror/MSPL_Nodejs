'use strict';
const { Logger } = require('mongodb');
const Execute=require('../lib/Execute')
let randomize = require('randomatic');
let func = require('../routes/commonfunction');
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
/**
 * @desc used for getting an detail for getting an data
 * @param {*Array} params 
 * @param {*String} dbName 
 */
const getSupplierAdminData=(attributes,dbName,params)=>{
    return new Promise(async (resolve,reject)=>{
            try{
               let paramAttribute;
                if(Array.isArray(attributes) &&  attributes.length){
                        paramAttribute=attributes.join(",")
                }
                let supplierAdminResult=await Execute.Query(dbName,`select ${paramAttribute} from supplier_admin where supplier_id=?`,params)
                resolve(supplierAdminResult)
            }
            catch(Err){
                reject(Err)
            }   
        })
}
/**
 * @description used for listing an supplier without pagination
 * @param {*String} attributes 
 * @param {*String} dbName 
 * @param {*Array} params 
 */
const supplierListWithoutPagination=(attributes,dbName,params)=>{
    return new Promise(async (resolve,reject)=>{
            try{
               let paramAttribute;
                if(Array.isArray(attributes) &&  attributes.length){
                        paramAttribute=attributes.join(",")
                }
              
                let supplierAdminResult=await Execute.Query(dbName,`select ${paramAttribute} from supplier where is_active=1 `,params)
                resolve(supplierAdminResult)
            }
            catch(Err){
                reject(Err)
            }   
        })
}
/**
 * @description used for insert an record in supplier one by one
 */
class bulk {
    constructor (dbName,supplierData){
        this.dbName=dbName
        this.supplierData=supplierData
    }
    // async updateDetail(sql,inputParams,dbName){
    async insert() {
        return new Promise(async (resolve,reject)=>{
        try{
          
        let sData=this.supplierData;
        let insertData;
        for await (let [index, i] of sData.entries()) {
            console.log("===>>",i[0],i[1],i[2])
            let isDupSupplier=await Execute.Query(this.dbName,`select id from supplier where email=? and is_deleted=?`,[i[1],0]);

            logger.debug("=====isDupSupplier===>>",isDupSupplier);

            if(isDupSupplier && isDupSupplier.length<=0 && i[1]!="" && i[1]!=undefined){
                var supSql = " insert into supplier(logo,supplier_image,stripe_account,rating_total,urgentButton,commisionButton,device_type,device_token,delivery_prior_time,delivery_prior_days,delivery_prior_total_time,delivery_min_time,delivery_max_time,urgent_delivery_time,total_rating_by_user,step_completed,business_start_date,urgent_type,urgent_price,is_urgent,is_postpone,total_reviews,rating,payment_method,handling_supplier,handling_admin,pricing_level,is_recommended,access_token,approved_by,is_deleted,terms_and_conditions,uniqueness,trade_license_no,status,name,email,mobile_number_1,address,password,created_by,latitude,longitude,commission,pickup_commission,is_active,self_pickup,country_code,iso,is_sponser,license_number,description,brand,linkedin_link,facebook_link,nationality,speciality,gst_price,country_of_origin,is_out_network,user_created_id)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                 insertData=await Execute.Query(this.dbName,supSql,[
                    i[14]==undefined?"":i[14],
                    i[5],
                     "",
                     0,
                     0,
                     0,
                     1,
                     "",
                     0,
                     0,
                     0,
                     0,
                     0,
                     0,
                     0,
                    0,
                    new Date(),
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0.0,
                    0.0,
                    0,
                    0,
                    func.encrypt(i[1] + new Date()),
                     1,
                     0,
                    "",
                    "",
                    "",
                     1,
                    i[0],
                    i[1],
                    i[11],
                    i[3],
                    md5(i[2]),
                    1,
                    i[12],
                    i[13],
                    i[8],
                    i[7],
                    1,
                    2,
                    i[10],
                    i[15]==undefined?"IND":i[15],
                   (i[7]).toLowerCase()=="yes"?1:0,
                   i[9],
                   i[4],
                   "",
                   "",
                   "",
                   "",
                   "",
                   0,
                   "",
                   0,
                   randomize('A0', 30)
                ])
                logger.debug("======insertData=====>>",insertData)
                var supAdminSql = "insert into supplier_admin(supplier,approved_by,email,password,phone_number,is_superadmin,created_by_clikat,access_token,supplier_id,is_active)values(?,?,?,?,?,?,?,?,?,?)";
                await Execute.Query(this.dbName,supAdminSql,[
                    insertData.insertId,
                    1,
                    i[1],
                    md5(i[2]),
                    // i[11],
                    1,
                    1,
                    0,
                    func.encrypt(i[1] + new Date()),
                    insertData.insertId,
                    1
                ]);
                // let imageSql="select image_path,orderImage from supplier_image where supplier_id = ? order by id desc";
                 let imageSql=`insert into supplier_image(image_path,orderImage,supplier_id) values(?,?,?)`
                 await Execute.Query(this.dbName,imageSql,[i[5],1,insertData.insertId]);


                await Execute.Query(this.dbName,"insert into supplier_ml(description,uniqueness,terms_and_conditions,name,address,language_id,supplier_id) values(?,?,?,?,?,?,?)",["","","",i[0], i[3], 14, insertData.insertId]);
                  
                await Execute.Query(this.dbName,"insert into supplier_ml(description,uniqueness,terms_and_conditions,name,address,language_id,supplier_id) values(?,?,?,?,?,?,?)",["","","",i[0], i[3], 15, insertData.insertId]);
                let timings =
                [
        
                    {  "supplier_id":  insertData.insertId, "week_id": 0, "week": "mon", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                    {  "supplier_id":  insertData.insertId, "week_id": 1, "week": "tue", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                    {  "supplier_id":  insertData.insertId, "week_id": 2, "week": "wed", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                    {  "supplier_id":  insertData.insertId, "week_id": 3, "week": "thu", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                    {  "supplier_id":  insertData.insertId, "week_id": 4, "week": "fri", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                    {  "supplier_id":  insertData.insertId, "week_id": 5, "week": "sat", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 },
                    {  "supplier_id":  insertData.insertId, "week_id": 6, "week": "sun", "start_time": "00:00:00", "end_time": "23:59:59", "is_open": 1 }
                ]
                let deliveryMinTime = 15,deliveryMaxTime=15,deliveryPriorDays=0,deliveryPriorTime=0,urgentDeliveryTime=30;
                let deliveryPriorTotalTime = parseInt(deliveryPriorTime) + parseInt(deliveryPriorDays)*24*60;    
                let  updateValues = [deliveryMinTime, deliveryMaxTime, deliveryPriorDays, 
                deliveryPriorTime, urgentDeliveryTime, deliveryPriorTotalTime, insertData.insertId];
                let deliverTimeSql = "update supplier set delivery_min_time = ?,delivery_max_time = ?,delivery_prior_days = ?,delivery_prior_time ";
                deliverTimeSql +=" = ? ,urgent_delivery_time = ?,delivery_prior_total_time = ? where id = ? limit 1";
                await Execute.Query(this.dbName,deliverTimeSql,updateValues);
                let deleteSql = "delete from supplier_timings where supplier_id = ?";
                await Execute.Query(this.dbName,deleteSql,[insertData.insertId]);
                for(const [index1,j] of timings.entries()){
                    var sqlTiming = "insert into supplier_timings(supplier_id,week_id,start_time,end_time,is_open) values(?,?,?,?,?)";
                    await Execute.Query(this.dbName,sqlTiming,[insertData.insertId,j.week_id,j.start_time,j.end_time,j.is_open])
                }
                let branchSql = "insert into supplier_branch(supplier_id,name,branch_name,phone,mobile_1,mobile_2,email,address,is_head_branch,latitude,longitude,is_live,password,commission) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                let branchData=await Execute.Query(this.dbName,branchSql,[insertData.insertId,i[0],i[0],i[11],i[11],i[11],i[1],i[3],1,i[12],i[13],1,md5(i[2]),i[8]]);

                let branchSqlMl = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
                await Execute.Query(this.dbName,branchSqlMl,[i[0],i[0],14,branchData.insertId,i[3]])
                let branchSqlMl1 = "insert into supplier_branch_ml(name,branch_name,language_id,supplier_branch_id,address) values(?,?,?,?,?)"
                await Execute.Query(this.dbName,branchSqlMl1,[i[0],i[0],15,branchData.insertId,i[3]]);
                // (?,?,?,?)
                await Execute.Query(this.dbName,"insert into supplier_category(supplier_id,category_id,sub_category_id,detailed_sub_category_id) values (?,?,?,?)",[insertData.insertId,0,0,0]); 
            }
        }
        resolve (insertData);
    }
    catch(Err){
        logger.debug("=bulk=insert=Err!===>",Err)
        reject(Err)
    }
    })
    }
    
}
class commision{
    constructor(dbName,commision)
    {
        this.dbName=dbName;
        this.commision=commision;
    }
    async update(){
        let updateCommision=await Execute.Query(this.dbName,"update supplier set commission=? where id!=0",[this.commision])
        return updateCommision;
    }
}
/**
 * @description for fetching an producto
 */
class branch{
    /**
     * @description used for email data
     * @param {*Number} branchId 
     */
    static async data(attributes,dbName,branchId){
        return new Promise(async (resolve,reject)=>{
            try{
                let paramAttribute;
                if(Array.isArray(attributes) &&  attributes.length){
                        paramAttribute=attributes.join(",")
                }
                let bData=await Execute.Query(dbName,`select ${paramAttribute} from supplier_branch where id=?`,[branchId]);
                resolve(bData);
            }
            catch(Err){
                reject(Err)
            }
        })
    }
    /**
     * @description used for an updation of password
     * @param {*Number} id 
     * @param {*String} password 
     */
    static async updatePwd(dbName,id,password){
        return new Promise(async (resolve,reject)=>{
            try{
                await Execute.Query(dbName,"update supplier_branch set password=? where id=?",[password,id]);
                resolve();
            }
            catch(Err){
                reject(Err)
            }
        })
    }
    /**
     * @description used for getting an active branches list
     * @param {*Number} sId 
     * @param {*String} dbName 
     */
    static async list(sId,dbName){
        return new Promise(async (resolve,reject)=>{
            try{
                let branchData=await Execute.Query(dbName,"select id,name,supplier_id from supplier_branch where supplier_id = ? and is_deleted = ?",[sId,0]);
                resolve(branchData);
            }
            catch(Err){
                reject(Err)
            }
        })
    }
    /**
     * @description used for getting an branch product list
     * @param {*String} dbName 
     * @param {*Number} branchId 
     */
    static async productList(dbName,branchId){
        return new Promise(async (resolve,reject)=>{
            try{
                let pData=await Execute.Query(dbName,"select sbp.product_id,sbp.supplier_branch_id,sbp.category_id,sbp.sub_category_id,sbp.detailed_sub_category_id,sbp.original_product_id from supplier_branch_product sbp join product p on p.id=sbp.product_id where supplier_branch_id=? and sbp.is_deleted=0 and p.is_deleted=0",[branchId]);
                resolve(pData);
            }
            catch(Err){
                reject(Err)
            }
        })
    }
    /**
     * @description used for adding an new product same copy of main branch product
     * @param {*String} dbName 
     * @param {*Array} products 
     */
    static async copyProduct(dbName,products){
        return new Promise(async (resolve,reject)=>{
        let insertedIds=[],product=[],originalIds=[];
        if(products && products.length>0){
        for (const [index, i] of products.entries()) {
            try{
                let sql = "insert into product(detailed_sub_category_id,sub_category_id,cart_image_upload,payment_after_confirmation,duration,is_product,quantity,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id," +
                "commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                "is_live,is_deleted,is_global,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type,brand_id)" +
                " select detailed_sub_category_id,sub_category_id,cart_image_upload,payment_after_confirmation,duration,is_product,quantity,name,price_unit,bar_code,product_desc,measuring_unit,sku,category_id" +
                ",commission_type,commission,commission_package,recurring_possible,scheduling_possible,is_package," +
                "is_live,is_deleted,0,added_by,created_by,approved_by_supplier,approved_by_admin,pricing_type,brand_id from product where id = ? ";        
                let params = [i.product_id]
                let result = await Execute.Query(dbName,sql,params)
                product.push({
                    "product_id":result.insertId,
                    "original_product_id":i.product_id,
                    "category_id":i.category_id,
                    "sub_category_id":i.sub_category_id,
                    "detailed_sub_category_id":i.detailed_sub_category_id
                });
                insertedIds.push(result.insertId);
                originalIds.push(i.product_id);
                if(index == products.length-1){
                    resolve({"insertedIds":insertedIds,"products":product,"originalIds":originalIds})
                }
            }catch(err){
                logger.debug("===========errrrrr========",err)
                reject(err)
            }
        } 
    }
    else{
        resolve({"insertedIds":insertedIds,"products":products})
    }
        })  
    }
    /**
     * @description used for insert same product price that exist in main branch product
     * @param {*String} dbName 
     * @param {*Array} products 
     */
    static async copyProductPrice(dbName,products){
        return new Promise(async (resolve,reject)=>{
        let insertedIds=[];
        if(products && products.length>0){
        for (const [index, i] of products.entries()) {
            try{
                var sql = "insert into product_pricing(tax_type,tax_value,start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type," +
                "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,product_id) " +
                "select  tax_type,tax_value,start_date,end_date,offer_name,price,display_price,handling,handling_supplier," +
                "can_urgent,urgent_price,house_cleaning_price,beauty_saloon_price,commission,delivery_charges,is_deleted,price_type, " +
                "commission_type,urgent_type,min_hour,max_hour,per_hour_price,urgent_value,pricing_type,'?' from product_pricing where product_id = ? ";
                let params = [i.product_id,i.original_product_id]
                let result = await Execute.Query(dbName,sql,params);
                // insertedIds.push(result.insertId);
                if(index == products.length-1){
                    resolve(insertedIds)
                }
            }catch(err){
                logger.debug("===========errrrrr========",err)
                reject(err)
            }
        } 
    }
    else{
        resolve([])
    }
        })  
    }
    /**
     * @description used for checking if branch product already exist then delete it softly
     * @param {*String} dbName 
     * @param {*Array} products 
     * @param {*Number} branchId 
     */
    static async deleteIfDupExistInBranch(dbName,products,branchId){
        return new Promise(async (resolve,reject)=>{
        try {
            if(products && products.length>0){
                try{
           
                let sql1 = 'update supplier_branch_product sbp ' +
                    ' set sbp.is_deleted =? where sbp.supplier_branch_id =?'
                let params1 = [1, branchId]
                 await Execute.Query(dbName, sql1, params1);
             resolve()
            
            
        }catch(Err){
            reject(Err)
        }
         
        }
        else{
            resolve()
        }
        } catch (err) {
            logger.debug("===========err in getProducts=+++++", err)
            reject(err)
        }
    })
    }
    /**
     * @description used for adding an product in supplier branch
     * @param {*String} dbName 
     * @param {*Number} mainBranchId 
     * @param {*Number} branchId 
     * @param {*Array} products 
     */
    static async addProductInSupplierBranch(dbName,mainBranchId,branchId,products){
        return new Promise(async(resolve,reject)=>{
            try{
                if(products && products.length>0){
                for (const [index, i] of products.entries()) {
                        var insertSql = `SELECT ${branchId},${i.product_id},category_id,sub_category_id,detailed_sub_category_id,${i.original_product_id},recipe_pdf,MAX(order_no)+1
                        from supplier_branch_product 
                        where supplier_branch_id=${mainBranchId} and category_id=${i.category_id} and is_deleted=0;`;
                        var sql = `insert into supplier_branch_product(supplier_branch_id,product_id,category_id,sub_category_id,detailed_sub_category_id,original_product_id,recipe_pdf,order_no)` + insertSql;
                        await Execute.Query(dbName,sql,[]);
                        if (index == products.length - 1) {
                                resolve()
                            }
                        }
                }
            else{
                resolve()
            }
            }
            catch(Err){
                reject(Err);
            }
        })
    }
    /**
     * @description used for adding/copy an product image 
     * @param {*Array} products 
     */
    static async copyProductImages(dbName,products){
        return new Promise(async(resolve,reject)=>{
            try{
                if(products && products.length>0){
                    for (const [index, i] of products.entries()) {
                        var sql = "insert into product_image( image_path,default_image,product_id,imageOrder)" +
                        " select image_path,default_image,'?',imageOrder from product_image where product_id = ? ";            
                        await Execute.Query(dbName,sql,[i.product_id,i.original_product_id])
                        if(index==products.length-1){
                                resolve();
                            }
                        }
                }
                else{
                    resolve(

                    )
                }
            }
            catch(Err){
                reject(Err);
            }
        })
    }
    /**
     * @description used for copy name of products
     * @param {*String} dbName 
     * @param {*Array} products 
     */
    static async copyProductName(dbName,products){
        return new Promise(async(resolve,reject)=>{
        try{
            if(products && products.length>0){
                for (const [index, i] of products.entries()) {
                    var sql = "insert into product_ml( language_id,name,product_desc,measuring_unit,product_id)" +
                    " select language_id,name,product_desc,measuring_unit,'?' from product_ml where product_id = ? ";
                    await Execute.Query(dbName,sql,[i.product_id,i.original_product_id]);
                    if(index==products.length-1){
                        resolve();
                    }
                }
            }
            else{
                resolve()
            }
        }
        catch(Err){
            reject(Err)
        }
    })
}
    
}
module.exports={
    branch:branch,
    bulk:bulk,
    commision:commision,
    supplierListWithoutPagination:supplierListWithoutPagination,
    getSupplierAdminData:getSupplierAdminData
}