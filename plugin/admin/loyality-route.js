
var Controller=require('../../controller')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 *  /admin/wallet/approve:
 *   post:
 *     description: For approve and money to user wallet
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: transId
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/wallet/approve',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({
    body: {
        transId:Joi.number().required()
    }
}),
Controller.walletController.approveWalletTransaction
)
/**
 * @swagger
 * /admin/loyality/create:
 *   post:
 *     description: used for creating and loyality level
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: categoryData
 *         required: true
 *         schema:
 *           type:array  
 *       - in: formData
 *         name: totalLoyalityPoints
 *         required: true
 *         type: number
 *       - in: formData
 *         name: isForAllCategory
 *         required: true
 *         type: number
 *       - in: formData
 *         name: perPointOrderAmount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: perPointAmount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: perPointAmountType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: description
 *         required: false
 *         type: string
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/loyality/create',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: 
//     {
//         sectionId:Joi.number().required(),
//         name:Joi.string().required(),
//         description:Joi.string().optional().allow(""),
//         totalLoyalityPoints:Joi.number().required(),
//         isForAllCategory:Joi.number().required(),
//         perPointOrderAmount:Joi.number().required(),
//         perPointAmount:Joi.number().required(),
//         perPointAmountType:Joi.number().required(),
//         categoryData:Joi.array().items(Joi.object().keys({
//             supplierId:Joi.number().optional().allow(""),
//             categoryId:Joi.number().optional().allow(""),
//             discountPrice:Joi.number().optional().allow(""),
//             discountPriceType:Joi.number().optional().allow("")
//     })).optional().allow(""),
//     }
// }),
Controller.loyalityLevelController.addLoyalityLevel
),
/**
 * @swagger
 * /admin/loyality/update:
 *   put:
 *     description: used for updating and loyality level
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: id
 *         required: true
 *         type: number
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: categoryData
 *         required: true
 *         schema:
 *           type:array  
 *       - in: formData
 *         name: totalLoyalityPoints
 *         required: true
 *         type: number
 *       - in: formData
 *         name: isForAllCategory
 *         required: true
 *         type: number
 *       - in: formData
 *         name: perPointOrderAmount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: perPointAmount
 *         required: true
 *         type: number
 *       - in: formData
 *         name: perPointAmountType
 *         required: true
 *         type: number
 *       - in: formData
 *         name: description
 *         required: false
 *         type: string
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/loyality/update',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: 
//     {
//         sectionId:Joi.number().required(),
//         name:Joi.string().required(),
//         description:Joi.string().optional().allow(""),
//         id:Joi.number().required(),
//         totalLoyalityPoints:Joi.number().required(),
//         isForAllCategory:Joi.number().required(),
//         perPointOrderAmount:Joi.number().required(),
//         perPointAmount:Joi.number().required(),
//         perPointAmountType:Joi.number().required(),
//         categoryData:Joi.array().items(Joi.object().keys({
//             supplierId:Joi.number().optional().allow(""),
//             categoryId:Joi.number().optional().allow(""),
//             discountPrice:Joi.number().optional().allow(""),
//             discountPriceType:Joi.number().optional().allow("")
//     })).optional().allow(""),
//     }
// }),
Controller.loyalityLevelController.udateLoyalityLevel
)
/**
 * @swagger
 * /admin/loyality/list:
 *   get:
 *     description: For Loyality List Api
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
app.get('/admin/loyality/list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
    limit:Joi.number().required(),
    offset:Joi.number().required(),
    sectionId:Joi.number().required(),
    }
}),
Controller.loyalityLevelController.listLoyalityLevel
)
/**
 * @swagger
 * /admin/loyality/delete:
 *   put:
 *     description: used for deletion an loyality level
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
*        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              sectionId:
 *                  type: number
 *                  required: true
 *              id:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/loyality/delete',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        id:Joi.number().required()
    }
}),
Controller.loyalityLevelController.deleteLoyalityLevel
)






/**
 * @swagger
 * /admin/agent_loyality/create:
 *   post:
 *     description: used for creating and loyality level
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: description
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: image
 *         required: true
 *         type: file       
 *       - in: formData
 *         name: commission
 *         required: true
 *         type: number 
 *  
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/agent_loyality/create',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: 
//     {
//         sectionId:Joi.number().required(),
//         name:Joi.string().required(),
//         description:Joi.string().optional().allow(""),
//         totalLoyalityPoints:Joi.number().required(),
//         isForAllCategory:Joi.number().required(),
//         perPointOrderAmount:Joi.number().required(),
//         perPointAmount:Joi.number().required(),
//         perPointAmountType:Joi.number().required(),
//         categoryData:Joi.array().items(Joi.object().keys({
//             supplierId:Joi.number().optional().allow(""),
//             categoryId:Joi.number().optional().allow(""),
//             discountPrice:Joi.number().optional().allow(""),
//             discountPriceType:Joi.number().optional().allow("")
//     })).optional().allow(""),
//     }
// }),
Controller.loyalityLevelController.addLoyalityLevelAdmin
)




/**
 * @swagger
 * /admin/agent_loyality/list:
 *   get:
 *     description: For Loyality List Api
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
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset 
 *         required: false     
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/agent_loyality/list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
    limit:Joi.number().required(),
    offset:Joi.number().required()
    }
}),
Controller.loyalityLevelController.listAdminLoyalityLevel
)


/**
 * @swagger
 * /admin/agent_loyality/update:
 *   put:
 *     description: used for updating and loyality level
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: description
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string      
 *       - in: formData
 *         name: commission
 *         required: true
 *         type: number  
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/agent_loyality/update',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({body: 
//     {
//         sectionId:Joi.number().required(),
//         name:Joi.string().required(),
//         description:Joi.string().optional().allow(""),
//         id:Joi.number().required(),
//         totalLoyalityPoints:Joi.number().required(),
//         isForAllCategory:Joi.number().required(),
//         perPointOrderAmount:Joi.number().required(),
//         perPointAmount:Joi.number().required(),
//         perPointAmountType:Joi.number().required(),
//         categoryData:Joi.array().items(Joi.object().keys({
//             supplierId:Joi.number().optional().allow(""),
//             categoryId:Joi.number().optional().allow(""),
//             discountPrice:Joi.number().optional().allow(""),
//             discountPriceType:Joi.number().optional().allow("")
//     })).optional().allow(""),
//     }
// }),
Controller.loyalityLevelController.updateAdminLoyalityLevel
)








/**
 * @swagger
 * /admin/agent_loyality/delete:
 *   put:
 *     description: used for deletion an loyality level
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
*        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              sectionId:
 *                  type: number
 *                  required: true
 *              id:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/agent_loyality/delete',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        id:Joi.number().required()
    }
}),
Controller.loyalityLevelController.deleteAdminLoyalityLevel
)




}


