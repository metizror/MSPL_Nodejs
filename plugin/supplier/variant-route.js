var variantController=require('../../controller/user/variantController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /supplier/add_variant:
 *   post:
 *     description: For Creating an new variants by supplier
 *     tags:
 *       - Supplier API`S
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
app.post('/supplier/add_variant',
Auth.supplierAuth,
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
                variant_type:Joi.number().required()
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
 * /supplier/update_variant_value:
 *   post:
 *     description: For updating an variant value and inser new values in variant by supplier
 *     tags:
 *       - Supplier API`S
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
app.post('/supplier/update_variant_value',
Auth.supplierAuth,
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
            })).required()


        }
    }),
// expressJoi({body: {
//             // accessToken: Joi.string().required(),
//                 id:Joi.number().optional().allow(""),
//                 category_id:Joi.number().required(),
//                 sectionId:Joi.number().required(),
//                 variant_value:Joi.array().items(Joi.object().keys({
//                     variant_name:Joi.array().items(Joi.object().keys(
//                         {
//                             name:Joi.string().required(),
//                             language_id:Joi.number().required()
//                         }
//                     )).required(),
//                     variant_values:Joi.array().items(
//                         Joi.object().keys({
//                             value:Joi.string().required(),
//                             id:Joi.number().optional().allow("")
//                         }),
//
//
//                     ).required(),
//                     variant_type : Joi.number().required()
//                 })).required(),
//                 // variant_value:Joi.string().required(),
//                 // is_new:Joi.number().required()
//
//             // variant_name:Joi.falsearray().required(),
//
//     }
// }),
variantController.updateVariantValue
)
}