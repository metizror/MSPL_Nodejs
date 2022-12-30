var termsAndConditionsController = require('../../controller/admin/TermsCondController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


module.exports=(app)=>{
 /**
 * @swagger
 * /admin/add_termsConditions:
 *   post:
 *     description: For updating termsConditions
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: termsAndConditions
 *          required: false
 *          type: string
 *        - in: formData
 *          name: privacyPolicy
 *          required: false
 *          type: string
 *        - in: formData
 *          name: language_ids
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/add_termsConditions',
    multipartMiddleware,
    Auth.authenticateAccessToken,
    Auth.checkforAuthorityofThisAdmin,
    Auth.checkCblAuthority,
    expressJoi({body: {
                 termsAndConditions : Joi.array().optional().allow(""),
                 privacyPolicy : Joi.array().optional().allow(""),
                 language_ids : Joi.string().required(),
                 about_us:Joi.array().optional().allow(""),
                 faqs : Joi.array().optional().allow(""),
                 cookie_policy: Joi.array().optional().allow(""),
                 allergy_policy: Joi.array().optional().allow("")
        }
    }),
    termsAndConditionsController.addTermsAndConditions
)

/**
 * @swagger
 * /list_termsConditions:
 *   get:
 *     description: For updating termsConditions
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/list_termsConditions',
Auth.checkCblAuthority,
// expressJoi({query: {
//              termsAndConditions : Joi.string().optional().allow(""),
//              privacyPolicy : Joi.string().optional().allow(""),
//              language_ids : Joi.string().required()
//     }
// }),
termsAndConditionsController.listTermsAndConditions
)

    
}