
var variantController=require('../controller/user/variantController')
var Auth=require('../lib/Auth')
var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/delete_variant:
 *   put:
 *     description: For delete variants
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formdata
 *         name: id
 *         required: true
 *         type: number
 *       - in: formdata
 *         name: sectionId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/delete_variant',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
Auth.checkforAuthorityofThisAdmin,
expressJoi({body: {
            id:Joi.number().required(),
            sectionId:Joi.number().required(),
    }
}),
variantController.deleteVariants
)
/**
 * @swagger
 * /admin/add_variant:
 *   post:
 *     description: For Creating an new variants
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: variant
 *         required: false
 *         schema:
 *           type:array
 *       - in: formData
 *         name: category_id
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
app.post('/admin/add_variant',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,

expressJoi({body: {
            // accessToken: Joi.string().required(),
            variant:Joi.array().items(Joi.object().keys({

                variant_name:Joi.array().items(Joi.object().keys(
                    {
                        name:Joi.string().required(),
                        language_id:Joi.number().required()
                    }
                )).required(),
                variant_values:Joi.array().required(),
                variant_type : Joi.number().required()
            })).required(),
            // variant_name:Joi.falsearray().required(),
            category_id:Joi.number().required(),
            sectionId:Joi.number().required(),

    }
}),
variantController.addVariant
)
/**
 * @swagger
 * /common/variant_list:
 *   post:
 *     description: For variant list Api
 *     tags:
 *       - Common API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: category_id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: languageId
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/common/variant_list',
Auth.storeDbInRequest,
Auth.checkCblAuthority,
// Auth.checkforAuthorityofThisAdmin,
expressJoi({body: {
    category_id:Joi.number().required(),
    sectionId:Joi.number().optional().allow(""),
    languageId:Joi.number().optional().allow("")
    }
}),
variantController.variantList
)
/**
 * @swagger
 * /admin/update_variant_value:
 *   post:
 *     description: For updating an variant value and inser new values in variant
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: id
 *         required: false
 *         type: false
 *       - in: formData
 *         name: variant_value
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: category_id
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
app.post('/admin/update_variant_value',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,

expressJoi({body: {
            // accessToken: Joi.string().required(),
                id:Joi.number().optional().allow(""),
                category_id:Joi.number().required(),
                sectionId:Joi.number().required(),
                variant:Joi.array().items(Joi.object().keys({
                variant_name:Joi.array().items(Joi.object().keys(
                        {
                            name:Joi.string().required(),
                            language_id:Joi.number().required()
                        }
                    )).required(),
                    variant_values:Joi.array().items(
                        Joi.object().keys({
                            value:Joi.string().required(),
                            id:Joi.number().optional().allow("")
                        })

                    ).required(),

                    variant_type : Joi.number().required()

                })).required(),
                // variant_value:Joi.string().required(),
                // is_new:Joi.number().required()
           
            // variant_name:Joi.falsearray().required(),
           
    }
}),
variantController.updateVariantValue
)

/**
 * @swagger
 * /admin/delete_variant_value:
 *   put:
 *     description: For delete
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
*        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              sectionId:
 *                  type: number
 *                  required: true 
 *              ids:
 *                type: array
 *                items:
 *                  type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/delete_variant_value',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,

expressJoi({body: {
            // accessToken: Joi.string().required(),
          
                ids:Joi.array().required(),
                sectionId:Joi.number().required(),
           
            // variant_name:Joi.falsearray().required(),
           
    }
}),
variantController.deleteVariantValue
)
/**
 * @swagger
 * /supplier/delete_variant:
 *   put:
 *     description: For delete variants
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formdata
 *         name: id
 *         required: true
 *         type: number
 *       - in: formdata
 *         name: sectionId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/delete_variant',
    multipartMiddleware,
    Auth.supplierAuth,
    Auth.checkforAuthorityofThisSupplier,
    Auth.checkCblAuthority,
    expressJoi({body: {
            id:Joi.number().required(),
            sectionId:Joi.number().required(),
        }
    }),
    variantController.deleteVariants
)
/**
 * @swagger
 * /supplier/delete_variant_value:
 *   put:
 *     description: For delete
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties:
 *              sectionId:
 *                  type: number
 *                  required: true
 *              ids:
 *                type: array
 *                items:
 *                  type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/delete_variant_value',
    Auth.supplierAuth,
    Auth.checkforAuthorityofThisSupplier,
    Auth.checkCblAuthority,
    expressJoi({body: {
            // accessToken: Joi.string().required(),

            ids:Joi.array().required(),
            sectionId:Joi.number().required(),

            // variant_name:Joi.falsearray().required(),

        }
    }),
    variantController.deleteVariantValue
)

}