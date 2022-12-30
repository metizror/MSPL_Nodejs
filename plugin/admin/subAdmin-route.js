
var subAdminController = require('../../controller/admin/SubAdminController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
 /**
 * @swagger
 * /admin/sub_admin_list:
 *   get:
 *     description: For listing of sub admins
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
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
app.get('/admin/sub_admin_list',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
                limit : Joi.number().required(),
                offset : Joi.number().required(),
                search : Joi.string().optional().allow("")
    }
}),
subAdminController.subAdminList
)

}