exports.priceQueryWithAndWithoutUser = (areaId,languageId, serviceIds, user_id, type) => {

  if (type === 'getSupplierByServiceId') {

    if (user_id) {

      const sqlRest = `
            select 

        temp.supplier_id,
        temp.supplier_status,
        temp.supplier_name,
        temp.supplier_logo,
        temp.supplier_image,
        temp.total_reviews,
        temp.rating,
        temp.avg_rating,
        temp.product_id,
        temp.is_product,
        temp.duration
        ,temp.display_price,
        temp.quantity,temp.purchased_quantity,
        temp.discount

        ,temp.hourly_price

        ,temp.sumDuration
        ,temp.sumDisplayPrice
        ,temp.sumHourlyPrice
        ,temp.sumFixedPrice
        ,temp.pricing_type
        ,temp.urgent_type,temp.urgent_value,temp.can_urgent, temp.supplier_branch_id,
        temp.availability,temp.handling_admin,temp.handling_supplier,temp.house_cleaning_price,                            
        temp.beauty_saloon_price,
        temp.detailed_sub_category_id,
        temp.bar_code,temp.sku,temp.name,temp.product_desc
        ,temp.price,image_path,
        temp.measuring_unit,temp.price_type ,temp.delivery_charges ,
        temp.fixed_price,temp.price1,temp.min_order,
 group_discount.group_id,  
        group_discount.service_id,
        group_discount.valueChargeType,
        group_discount.flatValue,
       group_discount.percentageValue,
       (CASE
        WHEN temp.display_price=temp.price AND group_discount.valueChargeType = 1 THEN (temp.price - group_discount.flatValue)
        WHEN temp.display_price=temp.price AND group_discount.valueChargeType = 2 THEN (temp.price - ( (group_discount.percentageValue*temp.price)/100 ) )
        ELSE NULL
    END) AS displayUserPrice

from ( 


select 
        
        s.id as supplier_id,
        s.supplier_status as supplier_status,
        s.name as supplier_name,
        s.logo as supplier_logo,
        s.supplier_image,
        s.total_reviews,
        s.rating,
        p.avg_rating,
        p.id as product_id,
        p.is_product
        ,p.commission as commission
    ,p.commission_type as commission_type
        ,p.duration
        ,price.display_price,
        quantity,purchased_quantity,
        if(price.display_price=price.price,0,1) AS discount

        ,price.price as hourly_price

        ,p.duration as sumDuration
        ,price.display_price as sumDisplayPrice
        ,price.price  as sumHourlyPrice
        ,price.price as sumFixedPrice

        ,price.pricing_type
        ,price.urgent_type,price.urgent_value,price.can_urgent, sbapa.supplier_branch_id as supplier_branch_id,
        if(p.purchased_quantity>=p.quantity,0,1) AS availability,price.handling as handling_admin,price.handling_supplier,price.house_cleaning_price,                            
        price.beauty_saloon_price,
        bp.detailed_sub_category_id,
        bar_code,sku,pml.name,pml.product_desc
        ,price.price,pimage.image_path,
        pml.measuring_unit,price.price_type ,sbapa.delivery_charges ,
        price.price as fixed_price,price.price_type as price1,sbapa.min_order
      
        
                                         from
                                         supplier_branch_product bp 
                                         join product p on bp.product_id = p.id 
                                         join product_ml pml  on bp.product_id = pml.product_id
                                         join product_image pimage on bp.product_id = pimage.product_id 
                                         join product_pricing price on (bp.product_id = price.product_id and price.price_type = IF((SELECT COUNT(*) as counter  FROM product_pricing pc where  pc.product_id=bp.product_id and pc.is_deleted=0 having counter>1) , 1, 0) )
                                         join supplier_branch_area_product sbapa on sbapa.product_id = p.id
                                         join supplier_branch sbb on sbb.id = sbapa.supplier_branch_id 
                                         join supplier_branch_delivery_areas sbda on sbda.supplier_branch_id = sbapa.supplier_branch_id  
                                         join supplier s on s.id = sbb.supplier_id
            
                                      
            
                                         where 
                                           bp.detailed_sub_category_id != 0 and p.is_live = 1
                                         and p.parent_id=0 and p.is_deleted = 0 and bp.is_deleted=0 and price.is_deleted = 0  and s.is_deleted =0 and s.is_active=1 and
        sbda.area_id=? and
        sbda.is_deleted = 0 and
        pml.language_id=? and
        
        bp.product_id IN (
          ?
            )
group BY s.id,p.id
)temp
  Join groups ON (groups.supplier_id = temp.supplier_id)
  join group_and_user ON (group_and_user.group_id = groups.id AND group_and_user.user_id = ?  )
  join group_discount ON (group_discount.group_id = groups.id AND group_discount.service_id= temp.product_id)  
  AND groups.isDelete=0 AND group_discount.service_id IN (?) AND group_discount.isDelete=0;          
            `;
      const sqlParameter = [areaId,languageId, serviceIds, user_id, serviceIds];

      return { sqlRest, sqlParameter };

    } else {


      const sqlRest = `
    select 
        
    s.id as supplier_id,
    s.supplier_status as supplier_status,
    s.name as supplier_name,
    s.logo as supplier_logo,
    s.supplier_image,
    s.total_reviews,
    s.rating,
    p.avg_rating,
    p.id as product_id,
    p.is_product
    ,p.duration
    ,price.display_price,
    quantity,purchased_quantity,
    if(price.display_price=price.price,0,1) AS discount

    ,price.price as hourly_price

    ,p.commission as commission
    ,p.commission_type as commission_type
    ,p.duration as sumDuration
    ,price.display_price as sumDisplayPrice
    ,price.price  as sumHourlyPrice
    ,price.price as sumFixedPrice

    ,price.pricing_type
    ,price.urgent_type,price.urgent_value,price.can_urgent, sbapa.supplier_branch_id as supplier_branch_id,
    if(p.purchased_quantity>=p.quantity,0,1) AS availability,price.handling as handling_admin,price.handling_supplier,price.house_cleaning_price,                            
    price.beauty_saloon_price,
    bp.detailed_sub_category_id,
    bar_code,sku,pml.name,pml.product_desc
    ,price.price,pimage.image_path,
    pml.measuring_unit,price.price_type ,sbapa.delivery_charges ,
    price.price as fixed_price,price.price_type as price1,sbapa.min_order,
    NULL AS group_id,  
    NULL AS service_id,
    NULL AS valueChargeType,
    NULL AS flatValue,
    NULL AS percentageValue,
    NULL AS displayUserPrice
    
                                     from
                                     supplier_branch_product bp 
                                     join product p on bp.product_id = p.id 
                                     join product_ml pml  on bp.product_id = pml.product_id
                                     join product_image pimage on bp.product_id = pimage.product_id 
                                     join product_pricing price on (bp.product_id = price.product_id and price.price_type = IF((SELECT COUNT(*) as counter  FROM product_pricing pc where  pc.product_id=bp.product_id and pc.is_deleted=0 having counter>1) , 1, 0) )
                                     join supplier_branch_area_product sbapa on sbapa.product_id = p.id
                                     join supplier_branch sbb on sbb.id = sbapa.supplier_branch_id 
                                     join supplier_branch_delivery_areas sbda on sbda.supplier_branch_id = sbapa.supplier_branch_id  
                                     join supplier s on s.id = sbb.supplier_id
        
                                     where 
                                       bp.detailed_sub_category_id != 0 and p.is_live = 1
                                     and p.parent_id=0 and p.is_deleted = 0 and bp.is_deleted=0 and price.is_deleted = 0  and s.is_deleted =0 and s.is_active=1 and
    sbda.area_id=? and
    sbda.is_deleted = 0 and
    pml.language_id=? and
    bp.original_product_id IN (
        SELECT product_id
        FROM supplier_product WHERE original_product_id IN ( 
        SELECT original_product_id  FROM supplier_product WHERE product_id IN (SELECT original_product_id FROM supplier_branch_product WHERE product_id in (?)) 
        )
        )
        Group by s.id,p.id;
    
    `;
      const sqlParameter = [areaId,languageId, serviceIds];

      return { sqlRest, sqlParameter };

    }


  } else if (type === 'getUserPrice') {

    /*
select 
    temp.supplier_id,
    temp.supplier_name,
    temp.supplier_logo,
    temp.supplier_image,
    temp.total_reviews,
    temp.rating,
    temp.avg_rating,
    temp.product_id,
    temp.is_product,
    temp.quantity,
    temp.purchased_quantity,
    
    temp.duration as sumDuration,
    temp.display_price as sumDisplayPrice,
    temp.discount,
    temp.hourly_price as sumHourlyPrice,
    temp.fixed_price as sumFixedPrice,
    
    
    temp.pricing_type,temp.urgent_type,temp.urgent_value,temp.can_urgent, temp.supplier_branch_id,
    temp.availability,
    temp.handling_admin,temp.handling_supplier,temp.house_cleaning_price,                            
    temp.beauty_saloon_price,
    temp.detailed_sub_category_id,
    temp.bar_code,
    temp.sku,
    temp.name,
    temp.product_desc
    ,temp.price,temp.image_path,
    temp.measuring_unit,temp.price_type ,temp.delivery_charges ,
    temp.fixed_price,
    
    temp.price1,temp.min_order,
            
    
    temp.group_id,  
    temp.service_id,
    temp.valueChargeType,
    temp.flatValue,
   temp.percentageValue ,
    
    (CASE
        WHEN temp.discount=0 AND temp.valueChargeType = 1 THEN (temp.fixed_price - temp.flatValue)
        WHEN temp.discount=0 AND temp.valueChargeType = 2 THEN (temp.fixed_price - ( (temp.percentageValue*temp.fixed_price)/100 ) )
        ELSE NULL
    END) AS displayUserPrice
        
    FROM (
    select 
    
    s.id as supplier_id,
    s.name as supplier_name,
    s.logo as supplier_logo,
    s.supplier_image,
    s.total_reviews,
    s.rating,
    p.avg_rating,
    p.id as product_id,
    p.is_product,p.duration,
                                     price.display_price,
                                     quantity,purchased_quantity,
                                     if(price.display_price=price.price,0,1) AS discount
                                     ,price.price as hourly_price,price.pricing_type,price.urgent_type,price.urgent_value,price.can_urgent, sbapa.supplier_branch_id as supplier_branch_id,
                                     if(p.purchased_quantity>=p.quantity,0,1) AS availability,price.handling as handling_admin,price.handling_supplier,price.house_cleaning_price,                            
                                     price.beauty_saloon_price,
                                     bp.detailed_sub_category_id,
                                     bar_code,sku,pml.name,pml.product_desc
                                     ,price.price,pimage.image_path,
                                     pml.measuring_unit,price.price_type ,sbapa.delivery_charges ,
                                     price.price as fixed_price,price.price_type as price1,sbapa.min_order,
         group_discount.group_id,  
    group_discount.service_id,
    group_discount.valueChargeType,
    group_discount.flatValue,
   group_discount.percentageValue
    
                                     from
                                     supplier_branch_product bp 
                                     join product p on bp.product_id = p.id 
                                     join product_ml pml  on bp.product_id = pml.product_id
                                     join product_image pimage on bp.product_id = pimage.product_id 
                                     join product_pricing price on bp.product_id = price.product_id and price.price_type = IF ( (SELECT COUNT(*) as counter  FROM product_pricing pc where  pc.product_id=bp.product_id and pc.is_deleted=0 having counter>1) , 1, 0) 
                                     join supplier_branch_area_product sbapa on sbapa.product_id = p.id
                                     join supplier_branch sbb on sbb.id = sbapa.supplier_branch_id 
                                     join supplier s on s.id = sbb.supplier_id
        
                                     LEFT Join groups ON (groups.supplier_id = s.id)
                       INNER join group_and_user ON (group_and_user.group_id = groups.id)
    INNER join group_discount ON (group_discount.group_id = groups.id)  
        
                                     where 
                                       bp.detailed_sub_category_id != 0 and p.is_live = 1
                                     and p.parent_id=0 and p.is_deleted = 0 and bp.is_deleted=0 and price.is_deleted = 0  and s.is_deleted =0 and s.is_active=1 and
    pml.language_id=14 and
    p.id IN (545,546) AND groups.isDelete=0 AND group_discount.service_id IN (545,546) AND group_and_user.user_id = 26 AND group_discount.isDelete=0
        Group by s.id,p.id
    )temp
    */
   const sqlRest = `
   select 

temp.supplier_id,
temp.supplier_status,
temp.supplier_name,
temp.supplier_logo,
temp.supplier_image,
temp.total_reviews,
temp.rating,
temp.avg_rating,
temp.product_id,
temp.is_product,
temp.duration
,temp.display_price,
temp.quantity,temp.purchased_quantity,
temp.discount

,temp.hourly_price

,temp.sumDuration
,temp.sumDisplayPrice
,temp.sumHourlyPrice
,temp.sumFixedPrice
,temp.pricing_type
,temp.urgent_type,temp.urgent_value,temp.can_urgent, temp.supplier_branch_id,
temp.availability,temp.handling_admin,temp.handling_supplier,temp.house_cleaning_price,                            
temp.beauty_saloon_price,
temp.detailed_sub_category_id,
temp.bar_code,temp.sku,temp.name,temp.product_desc
,temp.price,image_path,
temp.measuring_unit,temp.price_type ,temp.delivery_charges ,
temp.fixed_price,temp.price1,temp.min_order,
group_discount.group_id,  
group_discount.service_id,
group_discount.valueChargeType,
group_discount.flatValue,
group_discount.percentageValue,
(CASE
WHEN temp.display_price=temp.price AND group_discount.valueChargeType = 1 THEN (temp.price - group_discount.flatValue)
WHEN temp.display_price=temp.price AND group_discount.valueChargeType = 2 THEN (temp.price - ( (group_discount.percentageValue*temp.price)/100 ) )
ELSE NULL
END) AS displayUserPrice

from ( 


select 

s.id as supplier_id,
s.supplier_status as supplier_status,
s.name as supplier_name,
s.logo as supplier_logo,
s.supplier_image,
s.total_reviews,
s.rating,
p.avg_rating,
p.id as product_id,
p.is_product
,p.duration
,price.display_price,
quantity,purchased_quantity,
if(price.display_price=price.price,0,1) AS discount

,price.price as hourly_price

,p.duration as sumDuration
,price.display_price as sumDisplayPrice
,price.price  as sumHourlyPrice
,price.price as sumFixedPrice

,price.pricing_type
,price.urgent_type,price.urgent_value,price.can_urgent, sbapa.supplier_branch_id as supplier_branch_id,
if(p.purchased_quantity>=p.quantity,0,1) AS availability,price.handling as handling_admin,price.handling_supplier,price.house_cleaning_price,                            
price.beauty_saloon_price,
bp.detailed_sub_category_id,
bar_code,sku,pml.name,pml.product_desc
,price.price,pimage.image_path,
pml.measuring_unit,price.price_type ,sbapa.delivery_charges ,
price.price as fixed_price,price.price_type as price1,sbapa.min_order


                                from
                                supplier_branch_product bp 
                                join product p on bp.product_id = p.id 
                                join product_ml pml  on bp.product_id = pml.product_id
                                join product_image pimage on bp.product_id = pimage.product_id 
                                join product_pricing price on (bp.product_id = price.product_id and price.price_type = IF((SELECT COUNT(*) as counter  FROM product_pricing pc where  pc.product_id=bp.product_id and pc.is_deleted=0 having counter>1) , 1, 0) )
                                join supplier_branch_area_product sbapa on sbapa.product_id = p.id
                                join supplier_branch sbb on sbb.id = sbapa.supplier_branch_id 
                                join supplier_branch_delivery_areas sbda on sbda.supplier_branch_id = sbapa.supplier_branch_id  
                                join supplier s on s.id = sbb.supplier_id
   
                             
   
                                where 
                                  bp.detailed_sub_category_id != 0 and p.is_live = 1
                                and p.parent_id=0 and p.is_deleted = 0 and bp.is_deleted=0 and price.is_deleted = 0  and s.is_deleted =0 and s.is_active=1 and
sbda.area_id=? and    
sbda.is_deleted = 0 and                            
pml.language_id=? and
bp.product_id IN (
 ?
   )
group BY s.id,p.id
)temp
Join groups ON (groups.supplier_id = temp.supplier_id)
join group_and_user ON (group_and_user.group_id = groups.id AND group_and_user.user_id = ?  )
join group_discount ON (group_discount.group_id = groups.id AND group_discount.service_id= temp.product_id)  
AND groups.isDelete=0 AND group_discount.service_id IN (?) AND group_discount.isDelete=0;          
   `;
const sqlParameter = [areaId,languageId, serviceIds, user_id, serviceIds];

    return { sqlRest, sqlParameter };

  } else if (type === 'getUserPrice_noUserDiscountFound') {

    /// incase no user discount then send them default product list

    const sqlRest = `
     
        select 
        
        s.id as supplier_id,
        s.supplier_status as supplier_status,
        s.name as supplier_name,
        s.logo as supplier_logo,
        s.supplier_image,
        s.total_reviews,
        s.rating,
        p.avg_rating,
        p.id as product_id,
        p.is_product
        ,p.duration
        ,price.display_price,
        quantity,purchased_quantity,
        if(price.display_price=price.price,0,1) AS discount

        ,price.price as hourly_price

        ,p.duration as sumDuration
        ,price.display_price as sumDisplayPrice
        ,price.price  as sumHourlyPrice
        ,price.price as sumFixedPrice

        ,price.pricing_type
        ,price.urgent_type,price.urgent_value,price.can_urgent, sbapa.supplier_branch_id as supplier_branch_id,
        if(p.purchased_quantity>=p.quantity,0,1) AS availability,price.handling as handling_admin,price.handling_supplier,price.house_cleaning_price,                            
        price.beauty_saloon_price,
        bp.detailed_sub_category_id,
        bar_code,sku,pml.name,pml.product_desc
        ,price.price,pimage.image_path,
        pml.measuring_unit,price.price_type ,sbapa.delivery_charges ,
        price.price as fixed_price,price.price_type as price1,sbapa.min_order,
        NULL AS group_id,  
        NULL AS service_id,
        NULL AS valueChargeType,
        NULL AS flatValue,
        NULL AS percentageValue,
        NULL AS displayUserPrice
        
                                         from
                                         supplier_branch_product bp 
                                         join product p on bp.product_id = p.id 
                                         join product_ml pml  on bp.product_id = pml.product_id
                                         join product_image pimage on bp.product_id = pimage.product_id 
                                         join product_pricing price on (bp.product_id = price.product_id and price.price_type = IF((SELECT COUNT(*) as counter  FROM product_pricing pc where  pc.product_id=bp.product_id and pc.is_deleted=0 having counter>1) , 1, 0) )
                                         join supplier_branch_area_product sbapa on sbapa.product_id = p.id
                                         join supplier_branch sbb on sbb.id = sbapa.supplier_branch_id 
                                         join supplier_branch_delivery_areas sbda on sbda.supplier_branch_id = sbapa.supplier_branch_id  
                                         join supplier s on s.id = sbb.supplier_id
            
               
                                         where 
                                           bp.detailed_sub_category_id != 0 and p.is_live = 1
                                         and p.parent_id=0 and p.is_deleted = 0 and bp.is_deleted=0 and price.is_deleted = 0  and s.is_deleted =0 and s.is_active=1 and
        sbda.area_id=? and   
        sbda.is_deleted = 0 and                              
        pml.language_id= ? and
        p.id IN (?)
        Group by s.id,p.id;

        `;
    const sqlParameter = [areaId,languageId, serviceIds];

    return { sqlRest, sqlParameter };


  }






};   