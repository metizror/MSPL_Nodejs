const {Query} = require('../lib/Execute');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.get('server.debug_level');
module.exports.getServicesListingByBranchId = (dbName,branchId,
    offset,limit,languageId,agentId,category_id)=>{
    
    let methodName = "getServicesListingByBranchId";
    let categoryCheck = "";
    let branchCheck = "";
    if(category_id!==0){
        // categoryCheck = ` and  sp.category_id=${category_id} and sp.sub_category_id=${category_id} and sp.detailed_sub_category_id=${category_id}`
        categoryCheck = ` and  sp.category_id=${category_id}`
    }
    if(category_id!==0){
        branchCheck = ` and sp.supplier_branch_id = ${branchId} `
    }

    return new Promise(async(resolve,reject)=>{
        try{
            let agentDbName = dbName+"_agent"
            let  sql = `/*  query starts */  
            select p.purchase_limit,p.is_subscription_required,p.country_of_origin,
            p.Size_chart_url,p.item_unavailable,p.payment_after_confirmation,p.cart_image_upload,
            type,(p.quantity-p.purchased_quantity) as left_quantity,p.is_prescribed,p.interval_flag,
            p.interval_value, p.making_price,p.product_tags,p.quantity,p.purchased_quantity,
            p.pricing_type,p.name,p.id,p.is_product,p.duration,p.product_desc,p.is_live,

            price.id as price_id,price.display_price,price.start_date,price.end_date,price.delivery_charges,
            price.handling as handling_admin,price.handling_supplier,price.price as hourlyPrices,
            price.pricing_type as price_type,price.price as fixed_price,pml.name,pml.product_desc,
            p.category_id,p.sub_category_id,p.detailed_sub_category_id,c.name category_name,
            c.is_barcode,curr.currency_name,sp.order_no,
            ( select CONCAT('[',COALESCE(GROUP_CONCAT(CONCAT('{','\"product_id\": \"',product_id,
             '\", ','\"image_path\": \"', image_path,'\", ','\"default_image\": \"', default_image,
             '\",','\"imageOrder\": \"', imageOrder, '\"','}') SEPARATOR ','),''),']')
              AS bData from  product_image where product_id = p.id  )  as images,
            
              IFNULL((SELECT ${agentDbName}.cusp.agentBufferPrice from
                ${agentDbName}.cbl_user_service_pricing cusp
                where 
                ${agentDbName}.cusp.user_id=${agentId} and 
                ${agentDbName}.cusp.service_id=p.id order by 
                ${agentDbName}.cusp.id desc limit 1),0) as agentBufferPrice,

            IFNULL((SELECT ${agentDbName}.cusp.description from
                    ${agentDbName}.cbl_user_service_pricing cusp
                    where 
                    ${agentDbName}.cusp.user_id=${agentId} and 
                    ${agentDbName}.cusp.service_id=p.id order by 
                    ${agentDbName}.cusp.id desc limit 1),"") as description

            /*joins start*/

            from supplier_branch_product sp 
            join product p on sp.product_id = p.id
            left join brands br on br.id=p.brand_id and 
            br.deleted_by= 0 join categories c on c.id = p.category_id
            join supplier_category sc on sc.category_id = c.id
            or sc.sub_category_id=c.id or sc.detailed_sub_category_id=c.id
            join currency_conversion curr on curr.id = p.price_unit 
            left join product_pricing price on p.id = price.product_id 
            and price.price_type = IF ( (SELECT COUNT(*) as counter  
            FROM product_pricing pc where  pc.product_id=p.id
            and pc.is_deleted=0  having counter>1) , 1, 0) 
            join product_ml pml on pml.product_id=p.id

            /*joins end*/
            
            where p.parent_id=?
             
            and sp.is_deleted = ? and  p.is_deleted=0  and c.is_deleted=0
            and pml.language_id=?
            ${categoryCheck}
            and  c.is_live=1 group by p.id  order by p.id desc limit ?,?
            
            /*  query ends */ `

            let params = [0,0,languageId,offset,limit];

            let products = await Query(dbName,sql,params);

            let countSql = sql.replace("limit ?,?","");

            let productsCount = await Query(dbName,countSql,params);

            let result = {
                list:products,
                count:productsCount && productsCount.length>0?productsCount.length:0
            }
            
            resolve(result);
        }catch(Error){
            logger.debug({methodName:methodName,Error:Error});
            reject(Error);
        }

    })
}
