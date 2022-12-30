var passwordCntrl = require('../../controller/admin/PasswordController')
var Auth = require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports = (app) => {
/**
 * @swagger
 * /admin/reset_password:
 *   post:
 *     description: reset admin password
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: password
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/reset_password',
    Auth.authenticateAccessToken,
    Auth.checkforAuthorityofThisAdmin,
    Auth.checkCblAuthority,
    expressJoi({
        body:
        {
            password: Joi.string().required()
        }
    }),
    passwordCntrl.update
)
/**
 * @swagger
 * /supplier/reset_password:
 *   post:
 *     description: reset admin password
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: password
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/reset_password',
    Auth.supplierAuth,
    Auth.checkforAuthorityofThisSupplier,
    Auth.checkCblAuthority,
    expressJoi({
        body:
            {
                password: Joi.string().required()
            }
    }),
    passwordCntrl.resetSupplierPassword
)
}