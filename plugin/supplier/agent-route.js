var SupplierAgentCntrl=require('../../controller/supplier/agentController');
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /supplier/available/status:
 *   put:
 *     description: api for getting agent token 
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
 *                  required: true
 *              status:
 *                  type: number
 *                  required: true   
 *              id:
 *                  type: number
 *                  required: true   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/available/status',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        id:Joi.number().required(),
        status:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
SupplierAgentCntrl.availableStatus
),
/**
 * @swagger
 * /supplier/agent_create:
 *   post:
 *     description: api used for creation an agent
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: name
 *          required: true
 *        - in: formData
 *          name: email
 *          type: string
 *          required: true
 *        - in: formData
 *          name: area_id
 *          type: number
 *          required: true
 *        - in: formData
 *          name: supplier_id
 *          type: string
 *          required: false
 *        - in: formData
 *          name: experience
 *          type: number
 *          required: false
 *        - in: formData
 *          name: occupation
 *          type: string
 *          required: false
 *        - in: formData
 *          name: file
 *          required: false
 *          type: file
 *        - in: formData
 *          name: commission
 *          required : false
 *          type : number
 *     responses:
 *       200:
 *         description: encrypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 *      
 */
app.post('/supplier/agent_create',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
// expressJoi({body: {
//             first_name:Joi.string().required(),
//             last_name:Joi.string().required(),
//             email:Joi.string().required(),
//             area_id:Joi.number().required()
//     }
// }),
SupplierAgentCntrl.Add
)
/**
 * @swagger
 * /supplier/delete_agent_time_slots:
 *   put:
 *     description: api for deleting an time slots 
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: agent_token
 *         required: true
 *         type: string
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: slotId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/delete_agent_time_slots',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        agent_token:Joi.string().required(),
        sectionId:Joi.number().required(),
        slotId:Joi.number().required()
    }
}),
SupplierAgentCntrl.DeleteTimsSlots
),
/**
 * @swagger
 * /supplier/agent_list:
 *   get:
 *     description: agent list 
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         required: false
 *         type: number
 *       - in: query
 *         name: serachText
 *         required: false
 *         type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *       - in: query
 *         name: search
 *         required: false
 *         type: string
 *       - in: query
 *         name: startDate
 *         required: false
 *         type: string
 *       - in: query
 *         name: endDate
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/agent_list',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        serachText:Joi.string().optional().allow(""),
        search:Joi.string().optional().allow(""),
        limit:Joi.number().optional().allow(""),
        offset:Joi.number().optional().allow(""),
        sectionId:Joi.number().required(),
        order_by:Joi.number().optional(),
        is_desc: Joi.number().optional(),
        startDate: Joi.string().optional(),
        endDate: Joi.string().optional(),
        supplierId:Joi.number().optional().allow(0)
    }
}),
SupplierAgentCntrl.ListSupplierAgent
)

/**
 * @swagger
 * /supplier/reset_agent_password:
 *   post:
 *     description: api used for reset agent password
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: agentId
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          type: string
 *          required: true
 *     responses:
 *       200:
 *         description: encrypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 *      
 */
app.post('/supplier/reset_agent_password',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
SupplierAgentCntrl.setAgentPassword
)

/**
 * @swagger
 * /supplier/agent_according_area:
 *   get:
 *     description: agent list according area
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         required: false
 *         type: number
 *       - in: query
 *         name: supplierId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/agent_according_area',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: 
    {   
        sectionId:Joi.number().required(),
        supplierId:Joi.number().required(),
        agent_category_id:Joi.number().optional().allow("")

        // areaId:Joi.number().required()
    }
}),
SupplierAgentCntrl.ListAccToArea
)
/**
 * @swagger
 * /supplier/service/assignment:
 *   post:
 *     description: api used for assigned service an agent
 *     tags:
 *       - Supplier API`S
 *     consumes:
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
 *                  required: true
 *              agentId:
 *                  type: number
 *                  required: true   
 *              serviceData:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   service_id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *                   priceArray:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties: 
 *                             start_date:
 *                                type: string 
 *                             end_date:
 *                                 type: string
 *                             price:
 *                               type: number
 *                             display_price:
 *                                  type: number
 *                             handling:
 *                                 type: number
 *                             handling_supplier:
 *                                   type: number
 *                             price_type:
 *                                 type: number
 *                                 description: discount price 1 otherwise 0 for regular price
 *                             delivery_charges:
 *                                     type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/service/assignment',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            serviceData:Joi.array().items(Joi.object().keys({
                service_id:Joi.number().required(),
                name:Joi.string().required(),
                image:Joi.string().optional().allow(""),
                priceArray:Joi.array().items(
                Joi.object().keys(
                    {
                    "id":Joi.number().optional(),
                    "start_date":Joi.string().required(),
                    "end_date":Joi.string().required(),
                    "price":Joi.string().required(),
                    "display_price":Joi.string().required(),
                    "handling":Joi.number().required(),
                    "handling_supplier":Joi.number().required(),
                    "price_type":Joi.number().required(),
                    "delivery_charges":Joi.number().required(),
                    "pricing_type":Joi.number().optional().allow(""),
                    "user_type_id":Joi.number().optional().allow(""),
                    "tax_type":Joi.number().optional().allow(""),
                    "tax_value":Joi.number().optional().allow("")
                  }
            )).required()
            
            })).required(),
            agentId:Joi.number().required()
    }
}),
SupplierAgentCntrl.AssignService
)
/**
 * @swagger
 * /supplier/service/assignedList:
 *   get:
 *     description: assigned servive list of agent 
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         required: false
 *         type: number
 *       - in: query
 *         name: agent_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/service/assignedList',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({
    query: 
    {
        sectionId:Joi.number().required(),
        agent_id:Joi.number().required()
    }
}),
SupplierAgentCntrl.AssignServiceList
)
/**
 * @swagger
 * /supplier/service/unassignment:
 *   put:
 *     description: api used for unassignment of services an agent
 *     tags:
 *       - Supplier API`S
 *     consumes:
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
 *                  required: true
 *              agentId:
 *                  type: number
 *                  required: true   
 *              serviceIds:
 *                type: array
 *                items:
 *                  type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.put('/supplier/service/unassignment',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            serviceIds:Joi.array().items(Joi.number().required()).required(),
            agentId:Joi.number().required()
    }
}),
SupplierAgentCntrl.RemoveAssignedService
)
/**
 * @swagger
 * /supplier/agent_set_availability:
 *   post:
 *     description: api used for set an agent availability
 *     tags:
 *       - Supplier API`S
 *     consumes:
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
 *                  required: true
 *              offset:
 *                  type: string
 *                  required: true   
 *              agent_token:
 *                  type: string
 *                  required: true   
 *              weeks_data:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   day_id:
 *                     type: number
 *                   status:
 *                     type: number
 *              user_time:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   day_id:
 *                     type: number
 *              user_avail_date:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   from_date:
 *                     type: string
 *                   to_date:
 *                     type: string
 *                   status:
 *                     type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/agent_set_availability',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            weeks_data:Joi.array().items(
                Joi.object().keys({
                    day_id:Joi.number().valid([0,1,2,3,4,5,6]).required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).min(7).unique().required(),

            user_time:Joi.array().items(
                Joi.object().keys({
                start_time:Joi.string().required(),
                end_time:Joi.string().required(),
                day_id:Joi.number().valid([0,1,2,3,4,5,6]).optional().allow(""),
            }).unknown(true)
            ).min(1).unique().required(),

            user_avail_date:Joi.array().items(
                Joi.object().keys({
                    from_date:Joi.string().required(),
                    to_date:Joi.string().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).required(),   
            offset:Joi.string().required(),
            agent_token:Joi.string().required(),
    }
}),
SupplierAgentCntrl.AddAgentAvailability
)
/**
 * @swagger
 * /supplier/agent_token:
 *   get:
 *     description: api for getting agent token 
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         required: false
 *         type: number
 *       - in: query
 *         name: agentId
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/agent_token',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        agentId:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
SupplierAgentCntrl.GetAgentToken
)
/**
 * @swagger
 * /supplier/agent_update_availability:
 *   post:
 *     description: api used for set an agent availability
 *     tags:
 *       - Supplier API`S
 *     consumes:
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
 *                  required: true
 *              offset:
 *                  type: string
 *                  required: true   
 *              agent_token:
 *                  type: string
 *                  required: true   
 *              weeks_data:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   day_id:
 *                     type: numberagent_update_availability
 *                   status:
 *                     type: numberagent_update_availability
 *              user_time:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   id:
 *                     type: string
 *                   day_id:
 *                     type: number
 *              user_avail_date:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   from_date:
 *                     type: string
 *                   to_date:
 *                     type: string
 *                   status:
 *                     type: string
 *                   id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/agent_update_availability',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            agent_token:Joi.string().required(),
            weeks_data:Joi.array().items(
                Joi.object().keys({
                    id:Joi.number().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).optional().allow(""),

            user_time:Joi.array().items(
                Joi.object().keys({
                        id:Joi.number().optional().allow(""),
                        start_time:Joi.string().required(),
                        end_time:Joi.string().required(),
                        day_id:Joi.number().valid([0,1,2,3,4,5,6]).optional().allow(""),
                }).unknown(true)
            ).optional().allow(""),
            user_avail_date:Joi.array().items(
                Joi.object().keys({
                    id:Joi.number().optional().allow(""),
                    from_date:Joi.string().required(),
                    to_date:Joi.string().required(),
                    status:Joi.number().required()
                }).unknown(true)
            ).required(),                  

            offset:Joi.string().required()
    }
}),
SupplierAgentCntrl.UpdateAgentAvailability
)
/**
 * @swagger
 * /supplier/agent_update:
 *   put:
 *     description: api used for updation an agent
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: id
 *          required: true
 *          type: string
 *        - in: formData
 *          name: sectionId
 *          required: true
 *          type: number
 *        - in: formData
 *          name: name
 *          required: true
 *        - in: formData
 *          name: email
 *          type: string
 *          required: true
 *        - in: formData
 *          name: area_id
 *          type: number
 *          required: true
 *        - in: formData
 *          name: phone_number
 *          type: string
 *          required: true
 *        - in: formData
 *          name: supplier_id
 *          type: number
 *          required: false
 *        - in: formData
 *          name: experience
 *          type: number
 *          required: false
 *        - in: formData
 *          name: supplier_name
 *          type: string
 *          required: false
 *        - in: formData
 *          name: occupation
 *          type: string
 *          required: false
 *        - in: formData
 *          name: offset
 *          type: string
 *          required: false
 *        - in: formData
 *          name: file
 *          required: false
 *          type: file
 *        - in: formData
 *          name: commission
 *          required : false
 *          type : number
 *     responses:
 *       200:
 *         description: encrypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 *      
 */
app.put('/supplier/agent_update',
multipartMiddleware,
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
// expressJoi({body: {
//             first_name:Joi.string().required(),
//             last_name:Joi.string().required(),
//             email:Joi.string().required(),
//             area_id:Joi.number().required()
//     }
// }),
SupplierAgentCntrl.Update
)
/**
 * @swagger
 * /supplier/get_agent_availability:
 *   get:
 *     description: api for getting agent token 
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         required: false
 *         type: number
 *       - in: query
 *         name: agent_token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/supplier/get_agent_availability',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        agent_token:Joi.string().required(),
        sectionId:Joi.number().required()
    }
}),
SupplierAgentCntrl.GetAgentAvailability
)
/**
 * @swagger
 * /supplier/booking/assignment:
 *   post:
 *     description: api used for assigned booking to agent
 *     tags:
 *       - Supplier API`S
 *     consumes:
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
 *                  required: true
 *              orderId:
 *                  type: number
 *                  required: true
 *              agentIds:
 *                type: array
 *                items:
 *                  type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/booking/assignment',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
expressJoi({body: {
            sectionId:Joi.number().required(),
            orderId:Joi.number().required(),
            agentIds:Joi.array().items(Joi.number().required())
    }
}),
SupplierAgentCntrl.BookingAssignmnt
),
/**
 * @swagger
 * /supplier/block_unlblock_agent:
 *   put:
 *     description: api for getting agent token 
 *     tags:
 *       - Supplier API`S
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
 *                  required: true
 *              status:
 *                  type: number
 *                  required: true   
 *              id:
 *                  type: number
 *                  required: true   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/block_unlblock_agent',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
expressJoi({body: 
    {
        id:Joi.number().required(),
        status:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
SupplierAgentCntrl.blockUnblock
),
/**
 * @swagger
 * /supplier/delete_agent:
 *   put:
 *     description: api for getting agent token 
 *     tags:
 *       - Supplier API`S
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
 *                  required: true
 *              id:
 *                  type: number
 *                  required: true   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/supplier/delete_agent',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
expressJoi({body: 
    {
        id:Joi.number().required(),
        sectionId:Joi.number().required()
    }
}),
SupplierAgentCntrl.deleteAgent
)
/**
 * @swagger
 * /supplier/returnbooking/assignment:
 *   post:
 *     description: api used for assigned booking to agent
 *     tags:
 *       - Supplier API`S
 *     consumes:
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
 *                  required: true
 *              orderPriceId:
 *                  type: number
 *                  required: true
 *              agentId:
 *                type: number
 *                required: true
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/returnbooking/assignment',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
expressJoi({body: {
            sectionId:Joi.number().required(),
            orderPriceId:Joi.number().required(),
            agentId:Joi.number().required()
    }
}),
SupplierAgentCntrl.returnOrderAssignment
)
}