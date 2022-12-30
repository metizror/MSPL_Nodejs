
var Controller=require('../../controller')
var Auth=require('../../lib/Auth')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
module.exports=(app)=>{



  /**
 * @swagger
 * /admin/pos/importInventory:
 *   get:
 *     description: Inventory Api
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         required: true
 *         type: string
 *       - in: query
 *         name: subCategoryId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/importInventory',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    categoryId:Joi.string().required(),
    subCategoryId:Joi.string().optional().allow("")
}
}),
Controller.posController.importInventory)


 /**
 * @swagger
 * /supplier/pos/importInventory:
 *   get:
 *     description: Inventory Api
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         required: true
 *         type: string
 *       - in: query
 *         name: subCategoryId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/pos/importInventory',
Auth.supplierAuth,
Auth.checkCblAuthority,
expressJoi({query: {
    categoryId:Joi.string().optional().allow(""),
    subCategoryId:Joi.string().optional().allow(""),
    api_key:Joi.string().optional().allow(""),
    client_id:Joi.string().optional().allow(""),
    supplier_id:Joi.string().optional().allow("")
}
}),
Controller.posController.importInventory)



    /**
 * @swagger
 * /admin/pos/inventoryByLocation:
 *   get:
 *     description: Inventory Api
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: locationId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/inventoryByLocation',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    locationId:Joi.string().optional()
}
}),
Controller.posController.inventoryByLocation)


/**
 * @swagger
 * /admin/pos/inventoryNonZero:
 *   get:
 *     description: Inventory Api
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: locationId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/inventoryNonZero',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    locationId:Joi.string().optional()
}
}),
Controller.posController.inventoryNonZero)

/**
 * @swagger
 * /admin/pos/inventoryAnalytics:
 *   get:
 *     description: Inventory Api
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: locationId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/inventoryAnalytics',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    locationId:Joi.string().optional()
}
}),
Controller.posController.inventoryAnalytics)


/**
 * @swagger
 * /admin/pos/clientsLocations:
 *   get:
 *     description: Inventory Api
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: locationId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/clientsLocations',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    locationId:Joi.string().optional()
}
}),
Controller.posController.clientsLocations)



/**
 * @swagger
 * /admin/pos/inventoryByRooms:
 *   get:
 *     description: Api to get client locations or location by id
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: locationId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/inventoryByRooms',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    locationId:Joi.string().optional()
}
}),
Controller.posController.inventoryByRooms)

/**
 * @swagger
 * /admin/pos/inventoryByRoomsNonZero:
 *   get:
 *     description: Api to get client locations or location by id
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: locationId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/inventoryByRoomsNonZero',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    locationId:Joi.string().optional()
}
}),
Controller.posController.inventoryByRoomsNonZero)


/**
 * @swagger
 * /admin/pos/inventoryAnalyticsByRooms:
 *   get:
 *     description: Api to get client locations or location by id
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: locationId
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/inventoryAnalyticsByRooms',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    locationId:Joi.string().optional()
}
}),
Controller.posController.inventoryAnalyticsByRooms)

/**
 * @swagger
 * /admin/pos/findCustomersByPhoneNumber:
 *   get:
 *     description: Api to customers
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/findCustomersByPhoneNumber',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    phone_number:Joi.string().required()
}
}),
Controller.posController.findCustomersByPhoneNumber)


/**
 * @swagger
 * /admin/pos/findCustomersById:
 *   get:
 *     description: Api to customers
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/findCustomersById',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    customerId:Joi.string().required()
}
}),
Controller.posController.findCustomersById)


/**
 * @swagger
 * /admin/pos/findCustomers:
 *   get:
 *     description: Api to customers
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: created_after
 *         required: false
 *         type: string
 *       - in: query
 *         name: page
 *         required: false
 *         type: string
 *       - in: query
 *         name: page_size
 *         required: false
 *         type: string
 *       - in: query
 *         name: order_by
 *         required: false
 *         type: string
 *       - in: query
 *         name: created_before
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/findCustomers',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    created_after:Joi.string().optional(),
    page:Joi.string().optional(),
    page_size:Joi.string().optional(),
    order_by:Joi.string().optional(),
    created_before:Joi.string().optional()
}
}),
Controller.posController.findCustomers)

/**
 * @swagger
 * /admin/pos/findOrdersByCustomerId:
 *   get:
 *     description: Api to customers
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         type: string
 *       - in: query
 *         name: created_after
 *         required: false
 *         type: string
 *       - in: query
 *         name: page
 *         required: false
 *         type: string
 *       - in: query
 *         name: page_size
 *         required: false
 *         type: string
 *       - in: query
 *         name: order_by
 *         required: false
 *         type: string
 *       - in: query
 *         name: created_before
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/findOrdersByCustomerId',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    customerId:Joi.string().required(),
    created_after:Joi.string().optional(),
    page:Joi.string().optional(),
    page_size:Joi.string().optional(),
    order_by:Joi.string().optional(),
    created_before:Joi.string().optional()
}
}),
Controller.posController.findOrdersByCustomerId)


/**
 * @swagger
 * /admin/pos/findOrdersByLocationId:
 *   get:
 *     description: Api to customers
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: importId
 *         required: true
 *         type: string
 *       - in: query
 *         name: created_after
 *         required: false
 *         type: string
 *       - in: query
 *         name: page
 *         required: false
 *         type: string
 *       - in: query
 *         name: page_size
 *         required: false
 *         type: string
 *       - in: query
 *         name: order_by
 *         required: false
 *         type: string
 *       - in: query
 *         name: created_before
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/findOrdersByLocationId',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    importId:Joi.string().required(),
    created_after:Joi.string().optional(),
    page:Joi.string().optional(),
    page_size:Joi.string().optional(),
    order_by:Joi.string().optional(),
    created_before:Joi.string().optional()
}
}),
Controller.posController.findOrdersByLocationId)


/**
 * @swagger
 * /admin/pos/findOrdersByPhoneNumber:
 *   get:
 *     description: Api to customers
 *     tags:
 *       - POS
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         type: string
 *       - in: query
 *         name: page
 *         required: false
 *         type: string
 *       - in: query
 *         name: page_size
 *         required: false
 *         type: string
 *       - in: query
 *         name: order_by
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/pos/findOrdersByPhoneNumber',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
    phone_number:Joi.string().required(),
    page:Joi.string().optional(),
    page_size:Joi.string().optional(),
    order_by:Joi.string().optional()
}
}),
Controller.posController.findOrdersByPhoneNumber)

}