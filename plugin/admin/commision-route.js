var controller=require('../../controller')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 *  /admin/commision/list:
 *   get:
 *     description: For listing an admin commision
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
app.get('/admin/commision/list',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
controller.adminCommisionController.customizedcommision.list
)
/**
 * @swagger
 * /admin/commision/update:
 *   post:
 *     description: used for update an customized commision
 *     tags:
 *       - Admin API`S
 *     produces:
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
 *              below_commission_type:
 *                type: number
 *                required: true
 *              below_commission_amount:
 *                type: number
 *                required: true
 *              above_commission_amount:
 *                type: number
 *                required: true
 *              above_commission_type:
 *                type: number
 *                required: true
 *              minimum_cart_fee:
 *                type: number
 *                required: true
 *              minimum_amount:
 *                type: number
 *                required: true
 *              id:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/commision/update',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({
    body: {
        minimum_cart_fee:Joi.number().required(),
        id:Joi.number().required(),
        above_commission_type:Joi.number().required(),
        above_commission_amount:Joi.number().required(),
        below_commission_amount:Joi.number().required(),
        below_commission_type:Joi.number().required(),
        minimum_amount:Joi.number().required(),
        sectionId:Joi.number().optional().allow("")
    }
}),
controller.adminCommisionController.customizedcommision.update
)

}