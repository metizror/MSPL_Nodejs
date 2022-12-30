
var BrandController=require('../../controller/admin/BrandController')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/update_brand:
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
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: file
 *         required: false
 *         type: file
 *       - in: formData
 *         name: id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/update_brand',
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
BrandController.Update
)
/**
 * @swagger
 * /admin/add_brand:
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
 *         name: sectionId
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
app.post('/admin/add_brand',
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
BrandController.Add
)
/**
 * @swagger
 * /admin/brand_list:
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
app.get('/admin/brand_list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
    limit:Joi.number().required(),
    offset:Joi.number().required(),
    sectionId:Joi.number().required(),
    }
}),
BrandController.List
)
/**
 * @swagger
 * /admin/delete_brand:
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
app.put('/admin/delete_brand',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {                
                id:Joi.number().required(),
                sectionId:Joi.number().required(),
            }
}),
BrandController.Delete
)
}