
var Controller=require('../../controller/index')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
module.exports=(app)=>{
/**
 * @swagger
 * /supplier/order/add_items:
 *   post:
 *     description: add an items
 *     tags:
 *       - Supplier API`S
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
 *              orderId:
 *                type: number
 *                required: true
 *              handlingAdmin:
 *                type: number
 *                required: true
 *              userServiceCharge:
 *                type: number
 *                required: true
 *              removalItems:
 *                type: array
 *                items:
 *                  type: number
 *              items:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   price:
 *                     type: number
 *                     required: false
 *                   quantity:
 *                     type: number
 *                     required: true 
 *                   productName:
 *                     type: string
 *                     required: false
 *                   productId:
 *                     type: number
 *                     required: true
 *                   branchId:
 *                     type: number
 *                     required: true
 *                   productDesc:
 *                     type: string
 *                     required: false 
 *                   imagePath:
 *                     type: string
 *                     required: false
 *                   orderPriceId:
 *                     type: number
 *                     required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/order/add_items',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required(),
        handlingAdmin:Joi.number().optional().allow(""),
        userServiceCharge:Joi.number().optional().allow(""),
        removalItems:Joi.array().items(Joi.number().optional().allow("")).optional().allow(""),
        items:Joi.array().items(Joi.object().keys({
            price:Joi.number().optional().allow(""),
            quantity:Joi.number().required(),
            orderPriceId:Joi.number().optional().allow(""),
            productName:Joi.string().optional().allow(""),
            branchId:Joi.number().required(),
            productId:Joi.number().required(),
            productDesc:Joi.string().optional().allow(""),
            imagePath:Joi.string().optional().allow(""),
            // addsOn:Joi.array().items(Joi.object().keys(
            //     {
            //         // adds_on_id: 108
            //         // adds_on_name: "Customization"
            //         // adds_on_type_jd: 331
            //         // adds_on_type_name: "chesse"
            //         // adds_on_type_quantity: 0
            //         // cart_id: 657
            //         // created_at: null
            //         // id: 376
            //         // price: 6
            //         // quantity: 1
            //         // serial_number: 1
            //     }
            // )  
            // ).optional().allow(""),
           
        }))
        
    }
}),
Controller.adminOrderController.AddItemInOrder
)
/**
 * @swagger
 * /supplier/block/product_rating:
 *   put:
 *     description: api used for rating an product
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: is_approved
 *         required: true
 *         type: number
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
app.put('/supplier/block/product_rating',
Auth.checkCblAuthority,
Auth.supplierAuth,
expressJoi({body: 
    {
        is_approved:Joi.number().required(),
        id : Joi.number().required(),
        
    }
}),
Controller.adminOrderController.updateRatingOfProduct
)
/**
 * @swagger
 * /supplier/product/rating_list:
 *   get:
 *     description: For Listing Supplier Ratings
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
app.get('/supplier/product/rating_list',
Auth.checkCblAuthority,
Auth.supplierAuth,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required(),
                country_code:Joi.string().optional().allow(""),
                country_code_type:Joi.string().optional().allow("")
    }
}),
Controller.adminOrderController.productRatingListOfSupplier
)
/**
 * @swagger
 * /supplier/order/remove_items:
 *   put:
 *     description: add an items
 *     tags:
 *       - Supplier API`S
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
 *              orderId:
 *                type: number
 *                required: true
 *              items:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   productId:
 *                     type: number
 *                     required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/order/remove_items',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required(),
        items:Joi.array().items(Joi.object().keys({
            productId:Joi.number().required()
        }))
        
    }
}),
Controller.adminOrderController.removeItemFromOrder
)
/**
 * @swagger
 * /supplier/order/create:
 *   post:
 *     description: create an new order for user
 *     tags:
 *       - Supplier API`S
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
 *              userId:
 *                type: number
 *                required: true
 *              branchId:
 *                type: number
 *                required: true
 *              zoneOffset:
 *                type: string
 *                required: true
 *              deliveryCharge:
 *                type: number
 *                required: false
 *              userServiceCharge:
 *                type: number
 *                required: false
 *              items:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   price:
 *                     type: number
 *                     required: false
 *                   quantity:
 *                     type: number
 *                     required: true 
 *                   productName:
 *                     type: string
 *                     required: false
 *                   productId:
 *                     type: number
 *                     required: true
 *                   productDesc:
 *                     type: string
 *                     required: false 
 *                   imagePath:
 *                     type: string
 *                     required: false  
 *                   branchId:
 *                     type: number
 *                     required: false 
 *                   handlingAdmin:
 *                     type: number
 *                     required: false  
 *                   handlingSupplier:
 *                     type: number
 *                     required: false 
 *                   paymentType:
 *                     type: number
 *                     required: false 
 *                   requestId:
 *                     type: number
 *                     required: false 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/order/create',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        userId:Joi.number().required(),
        deliveryCharge:Joi.number().optional().allow(""),
        paymentType:Joi.number().optional().allow(""),
        branchId:Joi.number().required(),
        zoneOffset:Joi.string().required(),
        selfPickup:Joi.number().required(),
        userServiceCharge:Joi.number().optional().allow(""),
        requestId:Joi.number().optional().allow(""),
        items:Joi.array().items(Joi.object().keys({
            price:Joi.number().optional().allow(""),
            quantity:Joi.number().required(),
            productName:Joi.string().required(),
            branchId:Joi.number().required(),
            productId:Joi.number().required(),
            productDesc:Joi.string().optional().allow(""),
            imagePath:Joi.string().required(),
            handlingAdmin:Joi.number().required(),
            handlingSupplier:Joi.number().required()
        }))
    }
}),
Controller.adminOrderController.createNewOrderForRequest
)
/**
 * @swagger
 * /supplier/order/return_request:
 *   get:
 *     description: For Listing And Request
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: true
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
app.get('/supplier/order/return_request',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required(),
                sectionId:Joi.number().required()
    }
}),
Controller.adminOrderController.orderReturnRequest
)
/**
 * @swagger
 * /supplier/order/request:
 *   get:
 *     description: For Listing And Request
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: true
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
app.get('/supplier/order/request',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required(),
                sectionId:Joi.number().required()
    }
}),
Controller.adminOrderController.orderRequestBySupplier
)
/**
 * @swagger
 * /supplier/order/request_reject:
 *   put:
 *     description: For Listing And Request
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
 *              status:
 *                type: number
 *                required: true
 *              reason:
 *                type: string
 *                required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/order/request_reject',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
                 sectionId:Joi.number().optional().allow(""),
                 id:Joi.number().required(),
                 status:Joi.number().required(),
                 reason:Joi.string().optional().allow("")
            }
}),
Controller.adminOrderController.rejectOrderRequest
)
}