
var AdminVariantController=require('../../controller/admin/VariantController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /admin/variant_list:
 *   post:
 *     description: For variant list Api
 *     tags:
 *       - Admin API`S
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
app.post('/admin/variant_list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    category_id:Joi.number().required(),
    sectionId:Joi.number().optional().allow(""),
    languageId:Joi.number().optional().allow("")
    }
}),
AdminVariantController.variantList
)
/**
 * @swagger
 * /supplier/variant_list:
 *   post:
 *     description: For variant list Api
 *     tags:
 *       - Admin API`S
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
app.post('/supplier/variant_list',
    Auth.supplierAuth,
    Auth.checkforAuthorityofThisSupplier,
    Auth.checkCblAuthority,
    expressJoi({body: {
            category_id:Joi.number().required(),
            sectionId:Joi.number().optional().allow(""),
            languageId:Joi.number().optional().allow("")
        }
    }),
    AdminVariantController.variantList
)


/**
 * @swagger
 * /admin/variant/importv1:
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
 app.post('/admin/variant/importv1',
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
 AdminVariantController.importCategoryVariantsv1
 )
}