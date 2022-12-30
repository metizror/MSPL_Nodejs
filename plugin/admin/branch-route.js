const Auth=require('../../lib/Auth')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const controller=require('../../controller')
module.exports=(app)=>{
 /**
 * @swagger
 * /admin/branch/copy/data:
 *   post:
 *     description: copy all information from main branch to other branch
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
 *                  required: false
 *              toBranchId:
 *                  type: number
 *                  required: true
 *              fromBranchId:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/branch/copy/data',
Auth.checkCblAuthority,
Auth.branchAdminAuth,
// Auth.checkforAuthorityofThisAdmin,

expressJoi({body: {
    toBranchId:Joi.number().required(),
    fromBranchId:Joi.number().required(),
    sectionId:Joi.number().optional().allow(0)
    }
}),
controller.adminSupplierController.branch.copyData
)
/**
 * @swagger
 * /admin/branch/list:
 *   get:
 *     description: api used for listing an branches
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: query
 *         name: sectionId
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/branch/list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        supplierId:Joi.number().required(),
        sectionId:Joi.number().optional().allow("")
    }
}),
controller.adminSupplierController.branch.list
)
/**
 * @swagger
 * /admin/branch/update/password:
 *   post:
 *     description: For an update an branch password
 *     tags:
 *       - Admin API`S
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
 *                  required: true
 *              branchId:
 *                  type: number
 *                  required: true
 *              password:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/branch/update/password',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            branchId:Joi.number().required(),
            supplierId: Joi.number().required(),
            password: Joi.string().required(),

    }
}),
controller.adminSupplierController.branch.updatePwd
)
}