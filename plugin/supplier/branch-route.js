const Auth=require('../../lib/Auth')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const controller=require('../../controller')
module.exports=(app)=>{
/**
 * @swagger
 * /supplier/branch/update/password:
 *   post:
 *     description: For an update an branch password
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
*        - in: body
 *          name: body
 *          required: true
 *          schema:
 *            type: object
 *            properties: 
 *              supplierId:
 *                  type: number
 *                  required: false
 *              branchId:
 *                  type: number
 *                  required: false
 *              password:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/branch/update/password',
Auth.supplierAuth,
expressJoi({body: {
            branchId:Joi.number().optional().allow(""),
            supplierId: Joi.number().optional().allow(""),
            password: Joi.string().required()
    }
}),
controller.adminSupplierController.branch.updatePwd
)
}