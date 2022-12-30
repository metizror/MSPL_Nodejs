
var terminologiesController = require('../../controller/admin/TerminologiesController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /admin/add_terminologies:
 *   post:
 *     description: For updating terminologies
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: key
 *          required: true
 *          type: string
 *        - in: body
 *          name: value
 *          required : true
 *          schema:
 *            type: object
 *            properties: 
 *              english:
 *                  type: string
 *                  required: true
 *              other:
 *                     type: string
 *                     required: true
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/add_terminologies',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//             key : Joi.string().required(),
//             value : Joi.object().keys({
//                 english : Joi.string().required(),
//                 other : Joi.string().required()
//             }).required()
//     }
// }),
terminologiesController.addTerminologies
)

/**
 * @swagger
 * /admin/update_terminologies:
 *   post:
 *     description: For updating settings
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: key
 *          required: true
 *          type: string
 *        - in: body
 *          name: value
 *          required : true
 *          schema:
 *            type: object
 *            properties: 
 *              english:
 *                  type: string
 *                  required: true
 *              other:
 *                     type: string
 *                     required: true
 *     responses:
 *       200:
 *         description: Success!
 */
app.put('/admin/update_terminologies',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//             key : Joi.string().required(),
//             value : Joi.object().keys({
//                 english : Joi.string().required(),
//                 other : Joi.string().required()
//             }).required()
//     }
// }),
terminologiesController.updateTerminologies
)

}