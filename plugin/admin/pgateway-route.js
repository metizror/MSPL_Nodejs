
var Controller=require('../../controller');
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/pgateway:
 *   post:
 *     description: api used for adding an payment gateway
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
 *              keyData:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   id:
 *                     type: number
 *                     required: true
 *                   value:
 *                     type: string
 *                     required: true 
 *                   for_front_end:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.post('/admin/pgateway',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            status:Joi.number().required(),
            keyData:Joi.array().items(Joi.object({
                id:Joi.number().required(),
                value:Joi.string().required(),
                for_front_end:Joi.number().required()
            })).required()
    }
}),
Controller.PGatewaController.EnablePGateWay
)


/**
 * @swagger
 * /admin/add_payment_gateway_location:
 *   post:
 *     description: api used for adding an payment gateway
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
 *              keyData:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   id:
 *                     type: number
 *                     required: true
 *                   value:
 *                     type: string
 *                     required: true 
 *                   for_front_end:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.post('/admin/add_payment_gateway_location',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//             sectionId:Joi.number().required(),
//             status:Joi.number().required(),
//             keyData:Joi.array().items(Joi.object({
//                 id:Joi.number().required(),
//                 value:Joi.string().required(),
//                 for_front_end:Joi.number().required()
//             })).required()
//     }
// }),
Controller.PGatewaController.addPaymentGatewaysArea
)



/**
 * @swagger
 * /admin/update_payment_gateway_location:
 *   post:
 *     description: api used for adding an payment gateway
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
 *              keyData:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   id:
 *                     type: number
 *                     required: true
 *                   value:
 *                     type: string
 *                     required: true 
 *                   for_front_end:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.post('/admin/update_payment_gateway_location',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//             sectionId:Joi.number().required(),
//             status:Joi.number().required(),
//             keyData:Joi.array().items(Joi.object({
//                 id:Joi.number().required(),
//                 value:Joi.string().required(),
//                 for_front_end:Joi.number().required()
//             })).required()
//     }
// }),
Controller.PGatewaController.updatePaymentGatewaysArea
)

/**
 * @swagger
 * /admin/delete_payment_gateway_location:
 *   post:
 *     description: api used for adding an payment gateway
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
 *              keyData:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   id:
 *                     type: number
 *                     required: true
 *                   value:
 *                     type: string
 *                     required: true 
 *                   for_front_end:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.post('/admin/delete_payment_gateway_location',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//             sectionId:Joi.number().required(),
//             status:Joi.number().required(),
//             keyData:Joi.array().items(Joi.object({
//                 id:Joi.number().required(),
//                 value:Joi.string().required(),
//                 for_front_end:Joi.number().required()
//             })).required()
//     }
// }),
Controller.PGatewaController.deletePaymentGatewaysCoordinate
)

/**
 * @swagger
 * /admin/list_payment_gateway_location:
 *   get:
 *     description: api used for adding an payment gateway
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
 *              keyData:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   id:
 *                     type: number
 *                     required: true
 *                   value:
 *                     type: string
 *                     required: true 
 *                   for_front_end:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.get('/admin/list_payment_gateway_location',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//             sectionId:Joi.number().required(),
//             status:Joi.number().required(),
//             keyData:Joi.array().items(Joi.object({
//                 id:Joi.number().required(),
//                 value:Joi.string().required(),
//                 for_front_end:Joi.number().required()
//             })).required()
//     }
// }),
Controller.PGatewaController.listPaymentGateways
)

}