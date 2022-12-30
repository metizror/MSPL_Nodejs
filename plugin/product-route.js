
var productController=require('../controller/user/productController')
var Auth=require('../lib/Auth')
var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');

module.exports=(app)=>{
/**
 * @swagger
 * /v1/product_filteration:
 *   post:
 *     description: filteration an product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: subCategoryId
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: brand_ids
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: low_to_high
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_availability
 *         required: true
 *         type: number
 *       - in: formData
 *         name: max_price_range
 *         required: true
 *         type: number
 *       - in: formData
 *         name: min_price_range
 *         required: true
 *         type: number
 *       - in: formData
 *         name: offset
 *         required: false
 *         type: number
 *       - in: formData
 *         name: limit
 *         required: false
 *         type: number 
 *       - in: formData
 *         name: is_discount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_popularity
 *         required: true
 *         type: number
 *       - in: formData
 *         name: product_name
 *         required: false
 *         type: string
 *       - in: formData
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: formData
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: formData
 *         name: variant_ids
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: supplier_ids
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: booking_from_date
 *         required: false
 *         type: string
 *       - in: formData
 *         name: zone_offset
 *         required: false
 *         type: string
 *       - in: formData
 *         name: booking_to_date
 *         required: false
 *         type: string
 *       - in: formData
 *         name: need_agent
 *         required: false
 *         type: number
 *       - in: formData
 *         name: categoryId
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/v1/product_filteration',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        languageId:Joi.number().required(),
        subCategoryId:Joi.array().required(),
        limit:Joi.number().optional().allow(""),
        offset:Joi.number().optional().allow(""),
        need_agent:Joi.number().optional().allow(""),
        zone_offset:Joi.string().optional().allow(""),
        low_to_high:Joi.number().optional().allow(""),
        max_price_range:Joi.number().required(),
        min_price_range:Joi.number().required(),
        supplierBranchId:Joi.number().optional().allow(),
        is_discount:Joi.number().required(),
        is_availability:Joi.number().required(),
        booking_from_date:Joi.date().optional().allow(""),
        booking_to_date:Joi.date().optional().allow(""),
        is_popularity:Joi.number().optional().allow(""),
        brand_ids:Joi.array().optional().allow(""),
        product_name:Joi.string().optional().allow(""),
        variant_ids:Joi.array().optional().allow(""),
        supplier_ids:Joi.array().optional().allow(""),
        latitude:Joi.number().optional().allow(""),
        longitude:Joi.number().optional().allow(""),
        categoryId:Joi.number().optional().allow(""),
        zip_code:Joi.number().optional().allow(""),
        supplier_branch_id:Joi.number().optional().allow(""),
    }
}),
    productController.filterProductsV1
)
/**
 * @swagger
 * /product_filteration:
 *   post:
 *     description: filteration an product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: subCategoryId
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: brand_ids
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: low_to_high
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_availability
 *         required: true
 *         type: number
 *       - in: formData
 *         name: max_price_range
 *         required: true
 *         type: number
 *       - in: formData
 *         name: min_price_range
 *         required: true
 *         type: number
 *       - in: formData
 *         name: offset
 *         required: false
 *         type: number
 *       - in: formData
 *         name: limit
 *         required: false
 *         type: number 
 *       - in: formData
 *         name: is_discount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_popularity
 *         required: true
 *         type: number
 *       - in: formData
 *         name: product_name
 *         required: false
 *         type: string
 *       - in: formData
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: formData
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: formData
 *         name: variant_ids
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: supplier_ids
 *         required: false
 *         schema:
 *           type:array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/product_filteration',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        languageId:Joi.number().required(),
        subCategoryId:Joi.array().required(),
        limit:Joi.number().optional().allow(""),
        offset:Joi.number().optional().allow(""),
        low_to_high:Joi.number().required(),

        max_price_range:Joi.number().required(),
        min_price_range:Joi.number().required(),
        is_discount:Joi.number().required(),
        is_availability:Joi.number().required(),
        is_popularity:Joi.number().optional().allow(""),
        brand_ids:Joi.array().optional().allow(""),
        product_name:Joi.string().optional().allow(""),
        variant_ids:Joi.array().optional().allow(""),
        supplier_ids:Joi.array().optional().allow(""),
        latitude:Joi.number().optional().allow(""),
        longitude:Joi.number().optional().allow("")

    }
}),
    productController.filterProducts
)
/**
 * @swagger
 * /product_variant_list:
 *   post:
 *     description: variatn list an product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: variant_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: product_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/product_variant_list',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: 
    {
        variant_id:Joi.number().required(),
        product_id:Joi.number().required()
    }
}),
    productController.productVariantList
)
/**
 * @swagger
 * /supplier/product_list:
 *   get:
 *     description: api used for getting an product list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: supplier_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/product_list',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        latitude:Joi.number().optional().allow(""),
        longitude:Joi.number().optional().allow(""),
        limit:Joi.number().optional().allow(""),
        offset:Joi.number().optional().allow(""),
        supplier_id:Joi.number().optional().allow(""),
        languageId:Joi.number().required(),
        is_non_veg:Joi.number().optional().allow(0),
        is_location_disable:Joi.number().optional().allow(0)
    }
}),
productController.productAccToSupplier   //updated by pankaj productAccToSupplier -> productAccToSupplierV1
)

/**
 * @swagger
 * /v1/supplier/product_list:
 *   get:
 *     description: api used for getting an product list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: supplier_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/v1/supplier/product_list',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        latitude:Joi.number().optional().allow(""),
        longitude:Joi.number().optional().allow(""),
        limit:Joi.number().optional().allow(""),
        offset:Joi.number().optional().allow(""),
        supplier_id:Joi.number().required(),
        languageId:Joi.number().required(),
        category_id :Joi.number().optional().allow(0),
        is_non_veg:Joi.number().optional().allow(0)
    }
}),
productController.productAccToSupplierV1
)

/**
 * @swagger
 * /v2/supplier/product_list:
 *   get:
 *     description: api used for getting an product list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: supplier_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/v2/supplier/product_list',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        latitude:Joi.number().optional().allow(""),
        longitude:Joi.number().optional().allow(""),
        limit:Joi.number().optional().allow(""),
        offset:Joi.number().optional().allow(""),
        supplier_id:Joi.number().required(),
        languageId:Joi.number().required(),
        category_id :Joi.number().optional().allow(0),
        is_non_veg:Joi.number().optional().allow(0),
        search : Joi.string().optional().allow("")
    }
}),
productController.productAccToSupplierV2
)


/**
 * @swagger
 * /supplier_branch/product_list:
 *   get:
 *     description: api used for getting an product list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: supplier_id
 *         required: true
 *         type: string
 *       - in: query
 *         name: supplier_branch_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier_branch/product_list',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        latitude:Joi.number().optional().allow(""),
        longitude:Joi.number().optional().allow(""),
        supplier_id:Joi.number().required(),
        supplier_branch_id:Joi.number().required(),
        languageId:Joi.number().required(),
        limit:Joi.number().optional().allow(""),
        offset:Joi.number().optional().allow(""),
        is_non_veg:Joi.number().optional().allow("")
    }
}),
productController.productAccToSupplierBranch
)





/**
 * @swagger
 * /v2/supplier/product_list:
 *   get:
 *     description: api used for getting an product list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: query
 *         name: supplier_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/v2/supplier/product_list',
Auth.storeDbInRequest,
// Auth.userAuthenticate,
// Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        latitude:Joi.number().optional().allow(""),
        longitude:Joi.number().optional().allow(""),
        limit:Joi.number().optional().allow(""),
        offset:Joi.number().optional().allow(""),
        supplier_id:Joi.number().required(),
        languageId:Joi.number().required(),
        category_id :Joi.number().optional().allow(0),
        is_non_veg:Joi.number().optional().allow(0),
        search : Joi.string().optional().allow("")
    }
}),
productController.productAccToSupplierV2
)

/**
 * @swagger
 * /check_product_list:
 *   post:
 *     description: api used for getting an product list 
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: product_ids
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/check_product_list',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        product_ids : Joi.array().required(),
        latitude : Joi.number().optional().allow(0),
        longitude : Joi.number().optional().allow(0)
    }
}),
productController.checkProductList
)

/**
 * @swagger
 * /v1/check_product_list:
 *   post:
 *     description: api used for getting an product list 
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
  *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              product_ids:
 *                type: array
 *                items:
 *                  type: number
 *              latitude:
 *                  type: number
 *                  required: true
 *              longitude:
 *                  type: number
 *                  required: true   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/v1/check_product_list',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        product_ids : Joi.array().required(),
        latitude : Joi.number().optional().allow(0),
        longitude : Joi.number().optional().allow(0),
        vehicle_cat_id : Joi.number().optional().allow(0)
    }
}),
productController.checkProductListV1
)

/**
 * @swagger
 * /product_mark_fav_unfav:
 *   post:
 *     description: used or fav/unfav of an product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: status
 *         required: true
 *         type: number
 *       - in: formData
 *         name: product_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/product_mark_fav_unfav',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        status:Joi.number().required(),
        product_id:Joi.number().required()
    }
}),
    productController.productFavUnFav
)
/**
 * @swagger
 * /favourite_product:
 *   get:
 *     description: api used for getting an favourite product list
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: language_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/favourite_product',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        language_id:Joi.number().required(),
        product_id: Joi.number().optional().allow(""),
        latitude : Joi.number().optional().allow(""),
        longitude : Joi.number().optional().allow(""),
    }
}),
productController.productFavList
)
/**
 * @swagger
 * /product/adds_on/list:
 *   get:
 *     description: api used for getting an adds on listing of product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: product_id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/product/adds_on/list',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        product_id:Joi.number().required()
    }
}),
productController.productAddsOn
)
/**
 * @swagger
 * /search/tags:
 *   get:
 *     description: api used for getting listing an product/supplier name
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: query
 *         name: tags
 *         required: true
 *         type: string
 *       - in: query
 *         name: zone_offset
 *         required: false
 *         type: string
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number
 *       - in: query
 *         name: offset
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/search/tags',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({   
    query: 
    {  
        languageId:Joi.number().required(),
        tags:Joi.string().required(),
        zone_offset:Joi.string().optional().allow(""),
        latitude : Joi.number().required(),
        limit:Joi.number().required(),
        offset:Joi.number().required(),
        longitude : Joi.number().required()
    }
}),
productController.productByTagsName
)
/**
 * @swagger
 * /popular/product:
 *   get:
 *     description: api used for getting an adds on listing of product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: query
 *         name: zone_offset
 *         required: false
 *         type: string
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number
 *       - in: query
 *         name: offset
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/popular/product',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        languageId:Joi.number().required(),
        zone_offset:Joi.string().optional().allow(""),
        latitude : Joi.number().required(),
        limit:Joi.number().required(),
        offset:Joi.number().required(),
        longitude : Joi.number().required(),
        type:Joi.number().optional().allow(""),
        categoryId:Joi.number().optional().allow("")
    }
}),
productController.popularProduct
)

/**
 * @swagger
 * /popular/product/V1:
 *   get:
 *     description: api used for getting an adds on listing of product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: query
 *         name: zone_offset
 *         required: false
 *         type: string
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number
 *       - in: query
 *         name: offset
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/popular/product/V1',
Auth.storeDbInRequest,
// Auth.checkCblAuthority,
expressJoi({
    query: 
    {  
        languageId:Joi.number().required(),
        zone_offset:Joi.string().optional().allow(""),
        latitude : Joi.number().required(),
        limit:Joi.number().required(),
        offset:Joi.number().required(),
        longitude : Joi.number().required(),
        type:Joi.number().optional().allow(""),
        categoryId:Joi.number().optional().allow("")
    }
}),
productController.popularProductV1
)
/**
 * @swagger
 * /view/product:
 *   put:
 *     description: used for viewing an product
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              productId:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/view/product',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {   
        productId:Joi.number().optional().allow("")
    }
}),
productController.viewProductByUser
)
/**
 * @swagger
 * /product/supplier_list:
 *   post:
 *     description: api used for getting an supplier list according area`s
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              latitude:
 *                  type: number
 *                  required: true
 *              longitude:
 *                  type: number
 *                  required: true
 *              productName:
 *                  type: string
 *                  required: false
 *              languageId:
 *                  type: number
 *                  required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/product/supplier_list',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        
        latitude:Joi.number().required(),
        longitude : Joi.number().required(),
        productName : Joi.array().items(Joi.string().required()).required(),
        languageId:Joi.number().required()
    }
}),
productController.supplierByProduct
),
/**
 * @swagger
 * /user/recent/view:
 *   get:
 *     description: api for gettng an recent view
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: longitude
 *         required: false
 *         type: number
 *       - in: query
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: query
 *         name: offset
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/recent/view',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        languageId:Joi.number().required(),
        offset:Joi.string().optional().allow(""),
        latitude : Joi.number().required(),
        longitude : Joi.number().required()
    }
}),
productController.recentHistory
)
}