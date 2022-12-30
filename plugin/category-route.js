
var catCntrl=require('../controller/user/catController')
var category=require('../routes/category');
var Auth=require('../lib/Auth')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /add_category:
 *   post:
 *     description: For Creating an new categories
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: formData
 *         name: authSectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: level
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_variant
 *         required: false
 *         type: number
 *       - in: formData
 *         name: variant_name
 *         required: false
 *         type: string
 *       - in: formData
 *         name: variant_values
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: image
 *         required: false
 *         type: file
 * 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/add_category', 
multipartMiddleware,
// expressJoi({body: {
//             accessToken: Joi.string().required(),
//             supplierBranchId:Joi.number().required(),
//             deviceId:Joi.string().required(),
//             productList:Joi.array().required(),
//             area_id:Joi.number().required()
//     }
// }),
);
category.addCategory
/**
 * @swagger
 * /sub_category_data:
 *   get:
 *     description: for listing an sub categories
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: subCatId
 *         required: true
 *         type: number
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: query
 *         name: supplerId
 *         required: false
 *         type: number
 *       - in: query
 *         name: level
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/sub_category_data', 
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
            subCatId:Joi.number().required(),
            sectionId:Joi.number().required(),
            supplierId:Joi.number().optional().allow(""),
            level:Joi.number().optional().allow("")
         }
}),
catCntrl.subCateList
);
/**
 * @swagger
 * /supplier/sub_category_data:
 *   get:
 *     description: for listing an sub categories
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: subCatId
 *         required: true
 *         type: number
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: query
 *         name: level
 *         required: false
 *         type: number
 *       - in: query
 *         name: supplierId
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/sub_category_data', 
Auth.supplierAuth,
Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: {
            supplierId:Joi.number().optional().allow(""),
            subCatId:Joi.number().required(),
            sectionId:Joi.number().required(),
            level:Joi.number().optional().allow("")
         }
}),
catCntrl.supplierSubCat

);
/**
 * @swagger
 * /category_list:
 *   get:
 *     description: for listing an sub categories
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: language_id
 *         required: true
 *         type: string
 *       - in: query
 *         name: access_type
 *         required: false
 *         type: string
 *       - in: query
 *         name: supplier_id
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/category_list', 
            Auth.storeDbInRequest,
            Auth.checkCblAuthority,
            expressJoi({query: {
                  language_id:Joi.number().required(),
                  access_type:Joi.string().optional().allow(""),
                  supplier_id:Joi.number().optional().allow("")
               }
             }),
            catCntrl.categoryList
);

/**
 * @swagger
 * /block_category:
 *   post:
 *     description: For block unblock categories
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: category_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: is_live
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 * 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */

app.post('/block_category', 
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.storeDbInRequest,
expressJoi({body: {
            category_id:Joi.number().required(),
            is_live: Joi.number().required(),
            sectionId: Joi.number().required()
         }
}),
catCntrl.blockUnblockCategory
);

/**
 * @swagger
 * /block_category_by_supplier:
 *   post:
 *     description: For block unblock categories
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: category_id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: is_live
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 * 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */

app.post('/block_category_by_supplier', 
multipartMiddleware,
Auth.supplierAuth,
Auth.checkforAuthorityofThisSupplier,
Auth.storeDbInRequest,
expressJoi({body: {
            category_id:Joi.number().required(),
            is_live: Joi.number().required(),
            sectionId: Joi.number().required()
         }
}),
catCntrl.blockUnblockCategory
);



/**
 * @swagger
 * /admin/get_categories_list:
 *   get:
 *     description: Api for getting all the categories
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: search
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
 * 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */

app.get('/admin/get_categories_list', 
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.storeDbInRequest,
expressJoi({query: {
            search : Joi.string().optional().allow(""),
            limit : Joi.number().required(),
            offset : Joi.number().required()
         }
}),
catCntrl.getMainCategoryList
);


/**
 * @swagger
 * /supplier/get_categories_list:
 *   get:
 *     description: Api for getting all the categories
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: search
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
 * 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */

app.get('/supplier/get_categories_list', 
multipartMiddleware,
Auth.supplierAuth,
Auth.storeDbInRequest,
expressJoi({query: {
            search : Joi.string().optional().allow(""),
            limit : Joi.number().required(),
            offset : Joi.number().required()
         }
}),
catCntrl.getMainCategoryList
);


}