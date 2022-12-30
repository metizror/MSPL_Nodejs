
var Controller=require('../../controller')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/gift/update:
 *   put:
 *     description: For Updating an  brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: names
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: description
 *         required: false
 *         type: string
 *       - in: formData
 *         name: price
 *         required: true
 *         type: number
 *       - in: formData
 *         name: price_type
 *         required: true
 *         type: number
 *       - in: formData
 *         name: from_date
 *         required: true
 *         type: string
 *       - in: formData
 *         name: to_date
 *         required: true
 *         type: string
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: offset
 *         required: true
 *         type: string
 *       - in: formData
 *         name: id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: quantity
 *         required: true
 *         type: number
 *       - in: formData
 *         name: percentage_value
 *         required: true
 *         type: number
 *       - in: formData
 *         name: file
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/gift/update',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: {
//                 names:Joi.array().items(Joi.object().keys(
//                     {
//                         name:Joi.string().required(),
//                         language_id:Joi.number().required()
//                     }
//                 )).required(),  
//                 file: Joi.any()
//                 .meta({ swaggerType: 'file' })
//                 .optional()
//                 .description('image file'),
//                 description:Joi.string().required(),

//     }
// }),
Controller.adminGiftController.Update
)
/**
 * @swagger
 * /admin/gift/add:
 *   post:
 *     description: For Creating an new brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: names
 *         required: true
 *         schema:
 *           type:array
 *       - in: formData
 *         name: description
 *         required: false
 *         type: string
 *       - in: formData
 *         name: price
 *         required: true
 *         type: number
 *       - in: formData
 *         name: price_type
 *         required: true
 *         type: number
 *       - in: formData
 *         name: from_date
 *         required: true
 *         type: string
 *       - in: formData
 *         name: to_date
 *         required: true
 *         type: string
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: offset
 *         required: true
 *         type: string
 *       - in: formData
 *         name: quantity
 *         required: true
 *         type: number
 *       - in: formData
 *         name: percentage_value
 *         required: true
 *         type: number
 *       - in: formData
 *         name: file
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/gift/add',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,

// expressJoi({body: {
//                 names:Joi.array().items(Joi.object().keys(
//                     {
//                         name:Joi.string().required(),
//                         language_id:Joi.number().required()
//                     }
//                 )).required(),  
//                 file: Joi.any()
//                 .meta({ swaggerType: 'file' })
//                 .optional()
//                 .description('image file'),
//                 description:Joi.string().required(),

//     }
// }),
Controller.adminGiftController.Add
)
/**
 * @swagger
 * /admin/gift/list:
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
 *       - in: query
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
app.get('/admin/gift/list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
    limit:Joi.number().required(),
    offset:Joi.number().required(),
    sectionId:Joi.number().required(),
    }
}),
Controller.adminGiftController.List
)
/**
 * @swagger
 * /admin/gift/delete:
 *   put:
 *     description: For Deleting an  brands
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/gift/delete',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {                
                id:Joi.number().required(),
                sectionId:Joi.number().required(),
            }
}),
Controller.adminGiftController.Delete
)
}