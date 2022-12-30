
var CancellationPolicyCntrl=require('../../controller/admin/CancellationPolicyController')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/update_cancellation_policy:
 *   post:
 *     description: For Updating an  cancellation policy
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: status_refund_types
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: min_time
 *         required: true
 *         type: string
 *       - in: formData
 *         name: partial_refund
 *         required: true
 *         schema:
 *            type:object
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/update_cancellation_policy',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    status_refund_types:Joi.array().items(Joi.object().keys(
                    {   
                        id:Joi.number().required(),
                        status:Joi.number().required(),
                        refund_type:Joi.number().required()
                    }
                )).required(),  

                min_time:Joi.object().keys({
                    id:Joi.number().required(),
                    min_time:Joi.string().required()
                }).required(),

                partial_refund:Joi.object().keys({
                    id:Joi.number().required(),
                    value : Joi.number().required(),
                    is_flat : Joi.number().required()
                })

    }
}),
CancellationPolicyCntrl.Update
)

/**
 * @swagger
 * /admin/cancellation_policy_details:
 *   get:
 *     description: For Brand list Api
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: formData
 *         name: sectionId
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
app.get('/admin/cancellation_policy_details',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
    }
}),
CancellationPolicyCntrl.List
)

}