
var CatController=require('../../controller/admin/CategoryController')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /admin/brand_list_cat:
 *   get:
 *     description: For Brand list Api
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: query
 *         name: cat_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/brand_list_cat',

// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,

expressJoi({query: {
                // limit:Joi.number().required(),
                // offset:Joi.number().required(),
                cat_id:Joi.number().required(),
                sectionId:Joi.number().required()
    }
}),
CatController.BrandListAccCat
)
/**
 * @swagger
 * /admin/add_brand_to_cat:
 *   post:
 *     description: For adding an brands in category
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: brandIds
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: cat_id
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
app.post('/admin/add_brand_to_cat',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            brandIds:Joi.array().items(Joi.number().required()).required(),  
            cat_id:Joi.number().required(),
            sectionId:Joi.number().required()
    }
}),
CatController.AddBrandToCat
)
/**
 * @swagger
 * /supplier/add_brand_to_cat:
 *   post:
 *     description: For adding an brands in category
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: brandIds
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: cat_id
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
app.post('/supplier/add_brand_to_cat',
    multipartMiddleware,
    Auth.supplierAuth,
    Auth.checkforAuthorityofThisSupplier,
    Auth.checkCblAuthority,
    expressJoi({body: {
            brandIds:Joi.array().items(Joi.number().required()).required(),
            cat_id:Joi.number().required(),
            sectionId:Joi.number().required()
        }
    }),
    CatController.AddBrandToCat
)

/**
 * @swagger
 * /supplier/update_category_timings:
 *   post:
 *     description: For adding an brands in category
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: brandIds
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: cat_id
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
app.post('/supplier/update_category_timings',
    Auth.supplierAuth,
    Auth.checkCblAuthority,
    expressJoi({body: {
            category_id:Joi.number().required(),
            supplier_id:Joi.number().required(),
            startTime:Joi.string().required(),
            endTime:Joi.string().required()
,           weekday:Joi.number().required()

        }
    }),
    CatController.addCategoryTimings
)
/**
 * @swagger
 * /admin/delete_brand_from_cat:
 *   post:
 *     description: For deletion brands in category
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: cat_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: brandId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/delete_brand_from_cat',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            brandIds:Joi.array().items(Joi.number().required()).required(),  
            cat_id:Joi.number().required(),
            sectionId:Joi.number().required(),  
    }
}),
CatController.DeleteBrandFromCat
)
/**
 * @swagger
 * /supplier/delete_brand_from_cat:
 *   post:
 *     description: For deletion brands in category
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: cat_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: brandId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/delete_brand_from_cat',
    multipartMiddleware,
    Auth.supplierAuth,
    Auth.checkforAuthorityofThisSupplier,
    Auth.checkCblAuthority,
    expressJoi({body: {
            brandIds:Joi.array().items(Joi.number().required()).required(),
            cat_id:Joi.number().required(),
            sectionId:Joi.number().required(),
        }
    }),
    CatController.DeleteBrandFromCat
)

/**
 * @swagger
 * /admin/update_category_sequence:
 *   post:
 *     description: For update_category_sequence
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: categoryOrders
 *         required: true
 *         type: array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/update_category_sequence',
    Auth.checkCblAuthority,
    Auth.storeDbInRequest,
    expressJoi({body: {
        categoryOrders:Joi.array().required()
        }
    }),
    CatController.orderByMainCategoriesSequence
)


/**
 * @swagger
 * /admin/add_category_geofence:
 *   post:
 *     description: For add category geofence
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: coordinates
 *          required: true
 *          type: array
 *        - in: body
 *          name: category_id
 *          required: true
 *          type: number
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/add_category_geofence',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,

expressJoi({body: {
                category_id:Joi.number().required(),
                coordinates : Joi.array().required()
    }
}),
CatController.addCategoryGeoFence
)
/**
 * @swagger
 * /admin/update_category_geofence:
 *   post:
 *     description: For add category geofence
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: coordinates
 *          required: true
 *          type: array
 *        - in: body
 *          name: category_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/update_category_geofence',
// multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,

expressJoi({body: {
                id:Joi.number().required(),
                coordinates : Joi.array().required()
    }
}),
CatController.updateCategoryGeoFence
)

/**
 * @swagger
 * /admin/delete_category_geofence:
 *   post:
 *     description: For deleting category geofence
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/delete_category_geofence',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                id:Joi.number().required()
    }
}),
CatController.deleteCategoryGeoFence
)

/**
 * @swagger
 * /admin/list_categories_geofence:
 *   get:
 *     description: For listing geofence categories
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: category_id
 *          required: true
 *          type: number
 *     responses:
 *       200: 
 *         description: Success!
 */
app.get('/admin/list_categories_geofence',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
        category_id:Joi.number().required()
    }
}),
CatController.listCategoryGeoFence
)


}