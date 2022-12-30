
var Controller=require('../../controller/index')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
var shippo = require('shippo')('shippo_test_4fcd3062fd92472037c3904e3126cf4cddc6eb6d');
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/dhl/shipment/track:
 *   post:
 *     description: used for dhl shipment tracking
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
 *              orderId:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/dhl/shipment/track',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required()
    }
}),
Controller.adminOrderController.trackShipment
)

/**
 * @swagger
 * /admin/dhl/shipment/track:
 *   post:
 *     description: used for dhl shipment tracking
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
 *              orderId:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/shiprocket/shipment/track',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required()
    }
}),
Controller.adminOrderController.trackShipmentOfShipRocket
)

/**
 * @swagger
 * /admin/dhl/add_shipment:
 *   post:
 *     description: used for assinged order to dhl shipment 
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
 *              orderId:
 *                type: number
 *                required: true
 *              handlingAdmin:
 *                type: number
 *                required: true
 *              userServiceCharge:
 *                type: number
 *                required: true
 *              offset:
 *                type: string
 *                required: true
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
 *                   weight:
 *                     type: number
 *                     required: false
 *                   width:
 *                     type: number
 *                     required: false
 *                   height:
 *                     type: number
 *                     required: false
 *                   depth:
 *                     type: number
 *                     required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/dhl/add_shipment',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required(),
        pricing_type:Joi.number().optional().allow(0),
        duration:Joi.number().optional().allow(0),
        offset:Joi.string().required(),
        handlingAdmin:Joi.number().optional().allow(""),
        userServiceCharge:Joi.number().optional().allow(""),
        deliveryCharge:Joi.number().optional().allow(""),
        items:Joi.array().items(Joi.object().keys({
            price:Joi.number().optional().allow(""),
            quantity:Joi.number().required(),
            weight:Joi.number().required(),
            width:Joi.number().required(),
            height:Joi.number().required(),
            depth:Joi.number().required(),
            orderPriceId:Joi.number().optional().allow(""),
            productName:Joi.string().optional().allow(""),
            branchId:Joi.number().required(),
            productId:Joi.number().required(),
            productDesc:Joi.string().optional().allow(""),
            imagePath:Joi.string().optional().allow("")
        }))
        
    }
}),
Controller.adminOrderController.dhlShipment
)







/**
 * @swagger
 * /shippo/create_label:
 *   post:
 *     description: used for assinged order to dhl shipment 
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
 *                  required: false
 *              orderId:
 *                type: number
 *                required: false
 *              handlingAdmin:
 *                type: number
 *                required: false
 *              userServiceCharge:
 *                type: number
 *                required: false
 *              offset:
 *                type: string
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
 *                     required: false 
 *                   productName:
 *                     type: string
 *                     required: false
 *                   productId:
 *                     type: number
 *                     required: false
 *                   branchId:
 *                     type: number
 *                     required: false
 *                   productDesc:
 *                     type: string
 *                     required: false 
 *                   imagePath:
 *                     type: string
 *                     required: false
 *                   orderPriceId:
 *                     type: number
 *                     required: false
 *                   weight:
 *                     type: number
 *                     required: false
 *                   width:
 *                     type: number
 *                     required: false
 *                   height:
 *                     type: number
 *                     required: false
 *                   depth:
 *                     type: number
 *                     required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/shippo/create_label',
//Auth.authenticateAccessToken,
//Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
// expressJoi({body: 
//     {
//         sectionId:Joi.number().required(),
//         orderId:Joi.number().required(),
//         pricing_type:Joi.number().optional().allow(0),
//         duration:Joi.number().optional().allow(0),
//         offset:Joi.string().required(),
//         handlingAdmin:Joi.number().optional().allow(""),
//         userServiceCharge:Joi.number().optional().allow(""),
//         deliveryCharge:Joi.number().optional().allow(""),
//         items:Joi.array().items(Joi.object().keys({
//             price:Joi.number().optional().allow(""),
//             quantity:Joi.number().required(),
//             weight:Joi.number().required(),
//             width:Joi.number().required(),
//             height:Joi.number().required(),
//             depth:Joi.number().required(),
//             orderPriceId:Joi.number().optional().allow(""),
//             productName:Joi.string().optional().allow(""),
//             branchId:Joi.number().required(),
//             productId:Joi.number().required(),
//             productDesc:Joi.string().optional().allow(""),
//             imagePath:Joi.string().optional().allow("")
//         }))
        
//     }
// }),
Controller.adminOrderController.shippoShipment
)


/**
 * @swagger
 * /admin/order/add_items:
 *   post:
 *     description: add an items
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
 *                   deliveryCharge:
 *                     type: number
 *                     required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/order/add_items',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required(),
        pricing_type:Joi.number().optional().allow(0),
        duration:Joi.number().optional().allow(0),
        removalItems:Joi.array().items(Joi.number().optional().allow("")).optional().allow(""),
        handlingAdmin:Joi.number().optional().allow(""),
        userServiceCharge:Joi.number().optional().allow(""),
        deliveryCharge:Joi.number().optional().allow(""),
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
 * /user/order/add_items:
 *   post:
 *     description: add an items
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
 *                   deliveryCharge:
 *                     type: number
 *                     required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/order/add_items',
Auth.storeDbInRequest,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required(),
        pricing_type:Joi.number().optional().allow(0),
        duration:Joi.number().optional().allow(0),
        removalItems:Joi.array().items(Joi.number().optional().allow("")).optional().allow(""),
        handlingAdmin:Joi.number().optional().allow(""),
        userServiceCharge:Joi.number().optional().allow(""),
        table_booking_fee : Joi.number().optional().allow(""),
        //deliveryCharge:Joi.number().optional().allow(""),
        items:Joi.array().items(Joi.object().keys({
            price:Joi.number().optional().allow(""),
            quantity:Joi.number().required(),
            orderPriceId:Joi.number().optional().allow(""),
            productName:Joi.string().optional().allow(""),
            branchId:Joi.number().required(),
            productId:Joi.number().required(),
            productDesc:Joi.string().optional().allow(""),
            imagePath:Joi.string().optional().allow("")
           
        }))
        
    }
}),
Controller.adminOrderController.AddItemInOrder
)


/**
 * @swagger
 * /admin/order/remove_items:
 *   put:
 *     description: add an items
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
app.put('/admin/order/remove_items',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
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
 * /agent/order/add_items:
 *   post:
 *     description: add an items
 *     tags:
 *       - Agent API`S
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
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/agent/order/add_items',
Auth.storeDbInRequest,
// Auth.agentAuthentication,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required(),
        pricing_type:Joi.number().optional().allow(0),
        duration:Joi.number().optional().allow(0),
        handlingAdmin:Joi.number().optional().allow(""),
        userServiceCharge:Joi.number().optional().allow(""),
        items:Joi.array().items(Joi.object().keys({
            price:Joi.number().optional().allow(""),
            quantity:Joi.number().required(),
            productName:Joi.string().optional().allow(""),
            branchId:Joi.number().required(),
            orderPriceId:Joi.number().optional().allow(""),
            productId:Joi.number().required(),
            productDesc:Joi.string().optional().allow(""),
            imagePath:Joi.string().optional().allow("")
        })),
        removalItems:Joi.array().items(Joi.number().optional().allow("")).optional().allow(""),
        
    }
}),
Controller.adminOrderController.AddItemInOrder
)




/**
 * @swagger
 * /agent/order/remove_items:
 *   put:
 *     description: add an items
 *     tags:
 *       - Agent API`S
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
app.put('/agent/order/remove_items',
Auth.storeDbInRequest,
// Auth.agentAuthentication,
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
 * /admin/order/create:
 *   post:
 *     description: create an new order for user
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
 *                required: true
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
app.post('/admin/order/create',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        userId:Joi.number().required(),
        userServiceCharge:Joi.number().optional().allow(""),
        paymentType:Joi.number().optional().allow(""),
        deliveryCharge:Joi.number().optional().allow(""),
        presImage1:Joi.string().optional().allow(""),
        presDescription:Joi.string().optional().allow(""),
        branchId:Joi.number().required(),
        zoneOffset:Joi.string().required(),
        selfPickup:Joi.number().required(),
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
 * /admin/order/request:
 *   get:
 *     description: For Listing And Request
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
app.get('/admin/order/request',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required(),
                sectionId:Joi.number().required()
    }
}),
Controller.adminOrderController.orderRequest
)

/**
 * @swagger
 * /admin/order/amount_update_with_receipt:
 *   post:
 *     description: For updating order price
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order_id
 *         required: true
 *         type: number 
 *       - in: body
 *         name: admin_updated_charge
 *         required: true
 *         type: number 
 *       - in: body
 *         name: admin_price_update_receipt
 *         required: true
 *         type: string
 *       - in: body
 *         name: is_tax_add
 *         required: true
 *         type: number 
 *       - in: body
 *         name: is_subtotal_add
 *         required: true
 *         type: number 
 *       - in: body
 *         name: handlingAdmin
 *         required: true
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/order/amount_update_with_receipt',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.storeDbInRequest,
Auth.checkCblAuthority,
multipartMiddleware,
expressJoi({body: {
                order_id:Joi.number().required(),
                admin_updated_charge:Joi.number().required(),
                admin_price_update_receipt:Joi.string().required(),
                is_tax_add:Joi.number().required(),
                is_subtotal_add:Joi.number().required(),
                handlingAdmin:Joi.number().required()
    }
}),
Controller.adminOrderController.OrderAmountUpdateWithReceipt
)
/**
 * @swagger
 * /admin/order/return_status:
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
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/order/return_status',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                 sectionId:Joi.number().required(),
                 id:Joi.number().required(),
                 status:Joi.number().required(),
                 orderId:Joi.number().required()
            }
}),
Controller.adminOrderController.updateStatusReturnOrder
),
/**
 * @swagger
 * /admin/order/request_reject:
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
app.put('/admin/order/request_reject',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
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
/**
 * @swagger
 * /admin/order/return_request:
 *   get:
 *     description: For Listing And Request
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
app.get('/admin/order/return_request',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
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
 * /admin/order/update_delivery_date:
 *   put:
 *     description: add an items
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: orderId
 *         required: true
 *         type: number 
 *       - in: body
 *         name: deliveryDateTime
 *         required: true
 *         type: string 
 *       - in: body
 *         name: offset
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/order/update_delivery_date',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        orderId:Joi.number().required(),
        deliveryDateTime : Joi.string().required(),
        offset : Joi.string().optional().allow("")
        
    }
}),
Controller.adminOrderController.scheduleDeliveryDate
)

/**
 * @swagger
 * /supplier/order/update_delivery_date:
 *   put:
 *     description: add an items
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: orderId
 *         required: true
 *         type: number 
 *       - in: body
 *         name: deliveryDateTime
 *         required: true
 *         type: string 
 *       - in: body
 *         name: offset
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/order/update_delivery_date',
Auth.storeDbInRequest,
Auth.supplierAuth,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        orderId:Joi.number().required(),
        deliveryDateTime : Joi.string().required(),
        offset : Joi.string().optional().allow("")
        
    }
}),
Controller.adminOrderController.scheduleDeliveryDate
)

/**
 * @swagger
 * /customer/order/update_delivery_date:
 *   put:
 *     description: add an items
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: orderId
 *         required: true
 *         type: number 
 *       - in: body
 *         name: deliveryDateTime
 *         required: true
 *         type: string 
 *       - in: body
 *         name: offset
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/customer/order/update_delivery_date',
Auth.storeDbInRequest,
Auth.supplierAuth,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        orderId:Joi.number().required(),
        deliveryDateTime : Joi.string().required(),
        offset : Joi.string().optional().allow("")
        
    }
}),
Controller.adminOrderController.scheduleDeliveryDate
)


/**
 * @swagger
 * /admin/supplier/rating_list:
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
app.get('/admin/supplier/rating_list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required(),
                country_code:Joi.string().optional().allow(""),
                country_code_type:Joi.string().optional().allow("")
    }
}),
Controller.adminOrderController.supplierRatingList
)

/**
 * @swagger
 * /admin/product/rating_list:
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
app.get('/admin/product/rating_list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required(),
                country_code:Joi.string().optional().allow(""),
                country_code_type:Joi.string().optional().allow("")
    }
}),
Controller.adminOrderController.productRatingList
)

/**
 * @swagger
 * /admin/block/supplier_rating:
 *   put:
  *     description: api used for rating an product
 *     tags:
 *       - App API`S
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
app.put('/admin/block/supplier_rating',
Auth.storeDbInRequest,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        is_approved:Joi.number().required(),
        id : Joi.number().required(),
        
    }
}),
Controller.adminOrderController.updateRatingOfSupplier
)

/**
 * @swagger
 * /admin/block/product_rating:
 *   put:
 *     description: api used for rating an product
 *     tags:
 *       - App API`S
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
app.put('/admin/block/product_rating',
Auth.storeDbInRequest,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        is_approved:Joi.number().required(),
        id : Joi.number().required(),
        
    }
}),
Controller.adminOrderController.updateRatingOfProduct
),
/**
 * @swagger
 * /admin/ship_rocket/add_shipment:
 *   post:
 *     description: used for assinged order to shiprocket
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
 *              orderId:
 *                type: number
 *                required: true
 *              handlingAdmin:
 *                type: number
 *                required: true
 *              userServiceCharge:
 *                type: number
 *                required: true
 *              offset:
 *                type: string
 *                required: true
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
 *                   weight:
 *                     type: number
 *                     required: false
 *                   width:
 *                     type: number
 *                     required: false
 *                   height:
 *                     type: number
 *                     required: false
 *                   depth:
 *                     type: number
 *                     required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/ship_rocket/add_shipment',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required(),
        pricing_type:Joi.number().optional().allow(0),
        duration:Joi.number().optional().allow(0),
        offset:Joi.string().required(),
        handlingAdmin:Joi.number().optional().allow(""),
        userServiceCharge:Joi.number().optional().allow(""),
        deliveryCharge:Joi.number().optional().allow(""),
        weight:Joi.number().required(),
        length:Joi.number().required(),
        height:Joi.number().required(),
        breadth:Joi.number().required(),
        customer_pincode:Joi.string().optional().allow(""),
        customer_state:Joi.string().optional().allow(""),
        supplier_pincode:Joi.string().optional().allow(""),
        supplier_state:Joi.string().optional().allow(""),
        supplier_city:Joi.string().optional().allow(""),
        items:Joi.array().items(Joi.object().keys({
            price:Joi.number().optional().allow(""),
            quantity:Joi.number().required(),
            orderPriceId:Joi.number().optional().allow(""),
            productName:Joi.string().optional().allow(""),
            branchId:Joi.number().required(),
            productId:Joi.number().required(),
            productDesc:Joi.string().optional().allow(""),
            imagePath:Joi.string().optional().allow("")
        }))
        
    }
}),
Controller.adminOrderController.shiprocketShipment
)

/**
 * @swagger
 * /admin/ship_rocket/add_shipment:
 *   post:
 *     description: used for assinged order to shiprocket
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
 *              orderId:
 *                type: number
 *                required: true
 *              handlingAdmin:
 *                type: number
 *                required: true
 *              userServiceCharge:
 *                type: number
 *                required: true
 *              offset:
 *                type: string
 *                required: true
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
 *                   weight:
 *                     type: number
 *                     required: false
 *                   width:
 *                     type: number
 *                     required: false
 *                   height:
 *                     type: number
 *                     required: false
 *                   depth:
 *                     type: number
 *                     required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/ship_rocket/add_shipment',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        sectionId:Joi.number().required(),
        orderId:Joi.number().required(),
        pricing_type:Joi.number().optional().allow(0),
        duration:Joi.number().optional().allow(0),
        offset:Joi.string().required(),
        handlingAdmin:Joi.number().optional().allow(""),
        userServiceCharge:Joi.number().optional().allow(""),
        deliveryCharge:Joi.number().optional().allow(""),
        weight:Joi.number().required(),
        length:Joi.number().required(),
        height:Joi.number().required(),
        breadth:Joi.number().required(),
        customer_pincode:Joi.string().optional().allow(""),
        customer_state:Joi.string().optional().allow(""),
        supplier_pincode:Joi.string().optional().allow(""),
        supplier_state:Joi.string().optional().allow(""),
        supplier_city:Joi.string().optional().allow(""),
        items:Joi.array().items(Joi.object().keys({
            price:Joi.number().optional().allow(""),
            quantity:Joi.number().required(),
            orderPriceId:Joi.number().optional().allow(""),
            productName:Joi.string().optional().allow(""),
            branchId:Joi.number().required(),
            productId:Joi.number().required(),
            productDesc:Joi.string().optional().allow(""),
            imagePath:Joi.string().optional().allow("")
        }))
        
    }
}),
Controller.adminOrderController.shiprocketShipment
)

/**
 * @swagger
 * /admin/update_order_payment_status:
 *   put:
 *     description: api used for update_order_payment_status
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: is_payment_confirmed
 *         required: true
 *         type: number
 *       - in: body
 *         name: order_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/update_order_payment_status',
Auth.storeDbInRequest,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        is_payment_confirmed:Joi.number().required(),
        order_id : Joi.number().required(),
        
    }
}),
Controller.adminOrderController.updateOrderPaymentStatus
)

/**
 * @swagger
 * /supplier/update_order_payment_status:
 *   put:
 *     description: api used for update_order_payment_status
 *     tags:
 *       - App API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: is_payment_confirmed
 *         required: true
 *         type: number
 *       - in: body
 *         name: order_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/update_order_payment_status',
Auth.storeDbInRequest,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
expressJoi({body: 
    {
        is_payment_confirmed:Joi.number().required(),
        order_id : Joi.number().required(),
        
    }
}),
Controller.adminOrderController.updateOrderPaymentStatus
)
}