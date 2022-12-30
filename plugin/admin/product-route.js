
var productController=require('../../controller/admin/ProductController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/products_by_branch:
 *   get:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: branchId
 *         required: true
 *         type: number 
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/products_by_branch',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                branchId:Joi.number().required(),
                sectionId:Joi.string().optional().allow("")
    }
}),
productController.productByBranch
)
/**
 * @swagger
 * /admin/product_adds_on/get:
 *   get:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: product_id
 *         required: true
 *         type: number 
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/product_adds_on/get',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                product_id:Joi.number().required(),
                sectionId:Joi.string().optional().allow("")
    }
}),
productController.GetAddsOn
)
/**
 * @swagger
 * /admin/product_adds_on/create:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: types
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name_ml
 *         required: true
 *         type: string
 *       - in: formData
 *         name: min_adds_on
 *         required: true
 *         type: number
 *       - in: formData
 *         name: product_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_multiple
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: addon_limit
 *         required: true
 *         type: number 
 *       - in: formData
 *         name: is_mandatory
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product_adds_on/create',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        product_id:Joi.number().required(),
        name:Joi.string().required(),
        name_ml:Joi.string().required(),
        is_multiple:Joi.number().required(),
        min_adds_on:Joi.number().required(),
        max_adds_on:Joi.number().optional(),
        is_mandatory:Joi.number().optional().allow(0),
        types:Joi.array().items(Joi.object().keys({
                name:Joi.string().required(),
                name_ml:Joi.string().required(),
                price:Joi.number().required(),
                is_default:Joi.number().required(),
                quantity:Joi.number().optional().default(1),
                bottle_count:Joi.number().optional().default(0)
        })),
        addon_limit : Joi.number().required()
    }
}),

    productController.AddProductAddsOn
)
/**
 * @swagger
 * /admin/product_adds_on/update:
 *   put:
 *     description: update  particular product
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: types
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name_ml
 *         required: true
 *         type: string
 *       - in: formData
 *         name: min_adds_on
 *         required: true
 *         type: number
 *       - in: formData
 *         name: id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: product_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_multiple
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_mandatory
 *         required: false
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/product_adds_on/update',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        product_id:Joi.number().required(),
        id:Joi.string().required(),
        name:Joi.string().required(),
        name_ml:Joi.string().required(),
        is_multiple:Joi.number().required(),
        min_adds_on:Joi.number().required(),
        max_adds_on:Joi.number().optional(),
        is_mandatory:Joi.number().optional().allow(0),
        types:Joi.array().items(Joi.object().keys({
                id:Joi.number().optional().allow(""),
                name:Joi.string().required(),
                name_ml:Joi.string().required(),
                price:Joi.number().required(),
                is_default:Joi.number().required(),
                quantity:Joi.number().optional().default(1),    
                bottle_count:Joi.number().optional().default(0)
        })),
        addon_limit : Joi.number().required()
    }
}),
    productController.UpdateProductAddsOn
)
/**
 * @swagger
 * /admin/product_adds_on/delete:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: add_on_id
 *         required: true
 *       - in: formData
 *         name: sectionId
 *         required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product_adds_on/delete',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        add_on_id:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
    productController.deleteAddOn
)

/**
 * @swagger
 * /admin/product_adds_on_type/delete:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: type_id
 *         required: true
 *       - in: formData
 *         name: sectionId
 *         required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product_adds_on_type/delete',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        type_id:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
    productController.deleteAddOnType
)


/**
 * @swagger
 * /admin/product_variant_list:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: serachText
 *         required: false
 *         type: number
 *       - in: formData
 *         name: serachType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: limit
 *         required: true
 *         type: number
 *       - in: formData
 *         name: offset
 *         required: true
 *         type: number
 *       - in: formData
 *         name: product_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product_variant_list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        product_id:Joi.number().required(),
        limit:Joi.number().required(),
        offset:Joi.number().required(),
        serachType:Joi.number().required(),
        serachText:Joi.string().optional().allow(""),
        sectionId:Joi.number().required()
    }
}),
    productController.variantList
)
/**
 * @swagger
 * /admin/product_detail:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: product_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product_detail',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        product_id:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
    productController.productDetail
),
/**
 * @swagger
 * /admin/product/import:
 *   post:
 *     description: impor product in bulk
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: catId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: subcatId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: detSubcatId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: serviceType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: parentId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product/import',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        catId:Joi.number().optional().allow(""),
        subcatId:Joi.number().optional().allow(""),
        detSubcatId:Joi.number().optional().allow(""),
        serviceType:Joi.number().required(),
        parentId:Joi.number().optional().allow("")
    }
}),
    productController.importProduct
)

/**
 * @swagger
 * /admin/variant/import:
 *   post:
 *     description: import variant in bulk
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: catId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/variant/import',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        catId:Joi.number().required()
    }
}),
    productController.importCategoryVariants
)
/**
 * @swagger
 * /v1/admin/product/import:
 *   post:
 *     description: impor product in bulk
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: catId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: subcatId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: detSubcatId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: serviceType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: parentId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/v1/admin/product/import',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        catId:Joi.number().optional().allow(""),
        subcatId:Joi.number().optional().allow(""),
        detSubcatId:Joi.number().optional().allow(""),
        serviceType:Joi.number().required(),
        parentId:Joi.number().optional().allow("")
    }
}),
    productController.importProduct
)
/**
 * @swagger
 * /admin/supplier/product/import:
 *   post:
 *     description: impor product in bulk
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: catId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: subcatId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: detSubcatId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: serviceType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/supplier/product/import',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        catId:Joi.number().required(),
        supplierId:Joi.number().required(),
        subcatId:Joi.number().required(),
        detSubcatId:Joi.number().required(),
        serviceType:Joi.number().required()
    }
}),
    productController.importSupplierProduct
)
/**
 * @swagger
 * /v1/admin/supplier/product/import:
 *   post:
 *     description: impor product in bulk
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: catId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: subcatId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: detSubcatId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: serviceType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: branchId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/v1/admin/supplier/product/import',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        catId:Joi.number().required(),
        branchId:Joi.number().optional().allow(""),
        supplierId:Joi.number().required(),
        subcatId:Joi.number().required(),
        detSubcatId:Joi.number().required(),
        serviceType:Joi.number().required()
    }
}),
    productController.importSupplierProduct
)

/**
 * @swagger
 * /v1/admin/supplier/variant_product/import:
 *   post:
 *     description: impor product in bulk
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: catId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: subcatId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: detSubcatId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: serviceType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: branchId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/v1/admin/supplier/variant_product/import',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        catId:Joi.number().required(),
        branchId:Joi.number().optional().allow(""),
        supplierId:Joi.number().required(),
        subcatId:Joi.number().required(),
        detSubcatId:Joi.number().required(),
        serviceType:Joi.number().required()
    }
}),
    productController.importSupplierProductWithVariants
)
// /**
//  * @swagger
//  * /v1/admin/supplier/variant_product/import:
//  *   post:
//  *     description: impor product in bulk
//  *     tags:
//  *       - Admin API`S
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - in: formData
//  *         name: sectionId
//  *         required: true
//  *         type: number
//  *       - in: formData
//  *         name: catId
//  *         required: true
//  *         type: number
//  *       - in: formData
//  *         name: subcatId
//  *         required: true
//  *         type: number
//  *       - in: formData
//  *         name: detSubcatId
//  *         required: true
//  *         type: number
//  *       - in: formData
//  *         name: serviceType
//  *         required: true
//  *         type: number
//  *       - in: formData
//  *         name: branchId
//  *         required: false
//  *         type: number
//  *       - in: formData
//  *         name: file
//  *         required: true
//  *         type: file
//  *     responses:
//  *       200:
//  *         description: encypt
//  *         schema:
//  *           $ref: '#/definitions/Stock'
//  */
//  app.post('/v1/admin/variant_product/import',
//  multipartMiddleware,
//  Auth.authenticateAccessToken,
//  Auth.checkforAuthorityofThisAdmin,
//  Auth.checkCblAuthority,
//  expressJoi({body: 
//      {
//          sectionId:Joi.number().required(),
//          catId:Joi.number().required(),
//          branchId:Joi.number().optional().allow(""),
//         //  supplierId:Joi.number().required(),
//          subcatId:Joi.number().required(),
//          detSubcatId:Joi.number().required(),
//          serviceType:Joi.number().required()
//      }
//  }),
//      productController.importAdminProductWithVariants
//  )
/**
 * @swagger
 * /admin/supplier/variant/import:
 *   post:
 *     description: impor product in bulk
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: catId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: subcatId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: variantId
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: detSubcatId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: serviceType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: parentId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/supplier/variant/import',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        catId:Joi.number().required(),
        supplierId:Joi.number().required(),
        subcatId:Joi.number().required(),
        detSubcatId:Joi.number().required(),
        parentId:Joi.number().required(),
        serviceType:Joi.number().required(),
        variantId:Joi.array().items(Joi.number().required()).required()
    }
}),
    productController.importSupplierProduct
)
/**
 * @swagger
 * /admin/product/adds_on_copy:
 *   post:
 *     description: For Copy Adds One Product To Anothers
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              sectionId:
 *                  type: number
 *                  required: true
 *              addsOnIds:
 *                type: array
 *                items:
 *                  type: number
 *              productIds:
 *                type: array
 *                items:
 *                  type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product/adds_on_copy',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                 sectionId:Joi.number().optional().allow(""),
                 addsOnIds:Joi.array().items(Joi.number().required()).required(),
                 productIds:Joi.array().items(Joi.number().required()).required()
            }
}),
productController.addsOnCopyInProducts
)

/**
 * @swagger
 * /admin/product/unavailable:
 *   post:
 *     description: For unavailable Product
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
*     parameters:
 *       - in: body
 *         name: product_id
 *         required: true
 *         type: number
 *       - in: body
 *         name: item_unavailable
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product/unavailable',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
              product_id:Joi.number().required(),
              item_unavailable:Joi.number().required()
            }
}),
productController.updateProductUnavailabe
)

/**
 * @swagger
 * /admin/product/aprove:
 *   post:
 *     description: For unavailable Product
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
*     parameters:
 *       - in: body
 *         name: product_id
 *         required: true
 *         type: number
 *       - in: body
 *         name: is_supplier_product_approved
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/product/aprove',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
              product_id:Joi.number().required(),
              is_supplier_product_approved:Joi.number().required()
            }
}),
productController.updateProductAproval
)


}