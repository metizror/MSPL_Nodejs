
var placeHolderController = require('../../controller/admin/PlaceHolderController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /admin/update_placeHolders:
 *   put:
 *     description: For updating place holders
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: key
 *         required: true
 *         type: string
 *       - in: formData
 *         name: web
 *         required: false
 *         type: file
 *       - in: formData
 *         name: app
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: Success!
 */
app.put('/admin/update_placeHolders',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
// expressJoi({body: {
//             key : Joi.string().required(),
//             value : Joi.object().keys({
//                 english : Joi.string().required(),
//                 other : Joi.string().required()
//             }).required()
//     }
// }),
placeHolderController.updatePlaceHolders
)
/**
 * @swagger
 * /v1/admin/update_placeHolders:
 *   put:
 *     description: For updating place holders
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: key
 *         required: true
 *         type: string
 *       - in: formData
 *         name: message
 *         required: false
 *         type: string
 *       - in: formData
 *         name: web
 *         required: false
 *         type: file
 *       - in: formData
 *         name: app
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: Success!
 */
app.put('/v1/admin/update_placeHolders',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
// expressJoi({body: {
//             key : Joi.string().required(),
//             value : Joi.object().keys({
//                 english : Joi.string().required(),
//                 other : Joi.string().required()
//             }).required()
//     }
// }),
placeHolderController.updatePlaceHoldersV1
)
}