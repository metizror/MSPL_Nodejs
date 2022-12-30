
var Cntrl=require('../../controller/')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');

module.exports=(app)=>{
/**
 * @swagger
 * /address/set_default:
 *   put:
 *     description: api used for set An default address
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              id:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/address/set_default',
Auth.userAuthenticate,
Auth.checkCblAuthority,
expressJoi({
    body: 
    {  
        id:Joi.number().required(),
    }
   
}),
Cntrl.UserController.setDefaultAddress
)

/**
 * @swagger
 * /user/add_nhs_status:
 *   put:
 *     description: api used for set An NHS
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: false
 *          schema:
 *            type: object
 *            properties: 
 *              id:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/user/add_nhs_status',
Auth.userAuthenticate,
Auth.checkCblAuthority,
// expressJoi({
//     body: 
//     {  
//         id:Joi.number().required(),
//     }
   
// }),
Cntrl.UserController.setNhsStatus
)
}