
var productController=require('../../controller/admin/ProductController')
var SupplierController=require('../../controller/supplier/productController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
    /**
 * @swagger
 * /supplier/product_adds_on/get:
 *   get:
 *     description: For Creating an new brands
 *     tags:
 *       - Supplier API`S
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
app.get('/supplier/product_adds_on/get',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
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
 * /supplier/product_adds_on/create:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Supplier API`S
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
 *         name: is_mandatory
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/product_adds_on/create',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        addon_limit : Joi.number().required(),
        product_id:Joi.number().required(),
        name:Joi.string().required(),
        name_ml:Joi.string().required(),
        is_multiple:Joi.number().required(),
        is_mandatory:Joi.number().optional().allow(0),
        min_adds_on:Joi.number().required(),
        max_adds_on:Joi.number().optional(),
        types:Joi.array().items(Joi.object().keys({
                name:Joi.string().required(),
                name_ml:Joi.string().required(),
                price:Joi.number().required(),
                is_default:Joi.number().required(),
                quantity:Joi.number().optional().default(1),
                bottle_count:Joi.number().optional()
        })),
    }
}),
    productController.AddProductAddsOn
)
/**
 * @swagger
 * /supplier/product_adds_on/delete:
 *   post:
 *     description: variant deletion of particular product by supplier
 *     tags:
 *       - Supplier API`S
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
app.post('/supplier/product_adds_on/delete',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
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
 * /supplier/product_adds_on_type/delete:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Supplier API`S
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
app.post('/supplier/product_adds_on_type/delete',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
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
 * /supplier/product_adds_on/update:
 *   put:
 *     description: update particular product
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
 *         name: is_mandatory
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/product_adds_on/update',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        addon_limit : Joi.number().required(),
        product_id:Joi.number().required(),
        id:Joi.string().required(),
        name:Joi.string().required(),
        name_ml:Joi.string().required(),
        is_multiple:Joi.number().required(),
        is_mandatory:Joi.number().optional().allow(0),
        min_adds_on:Joi.number().required(),
        max_adds_on:Joi.number().optional(),
        types:Joi.array().items(Joi.object().keys({
                id:Joi.number().optional().allow(""),
                name:Joi.string().required(),
                name_ml:Joi.string().required(),
                price:Joi.number().required(),
                is_default:Joi.number().required(),
                quantity:Joi.number().optional().default(1),
                bottle_count:Joi.number().optional()
        }))
    }
}),
    productController.UpdateProductAddsOn
)
/**
 * @swagger
 * /supplier/product_variant_list:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Supplier API`S
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
app.post('/supplier/product_variant_list',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
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
SupplierController.supplierVariantList
)
/**
 * @swagger
 * /supplier/product_detail:
 *   post:
 *     description: variant list of particular product
 *     tags:
 *       - Supplier API`S
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
app.post('/supplier/product_detail',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        product_id:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
    productController.productDetail
)
/**
 * @swagger
 * /supplier/product/import:
 *   post:
 *     description: impor product in bulk
 *     tags:
 *       - Supplier API`S
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
app.post('/supplier/product/import',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
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
 * /v1/supplier/product/import:
 *   post:
 *     description: impor product in bulk
 *     tags:
 *       - Supplier API`S
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
app.post('/v1/supplier/product/import',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
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
 * /supplier/product/adds_on_copy:
 *   post:
 *     description: For Copy Adds One Product To Anothers
 *     tags:
 *       - Supplier API`S
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
app.post('/supplier/product/adds_on_copy',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
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
 * /supplier/product/unavailable:
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
app.post('/supplier/product/unavailable',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
              product_id:Joi.number().required(),
              item_unavailable:Joi.number().required()
            }
}),
productController.updateProductUnavailabe
)
}