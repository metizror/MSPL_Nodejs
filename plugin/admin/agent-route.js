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
 * /admin/agent_list:
 *   get:
 *     description: agent list of 
 *     tags:
 *       - Admin API`S
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
 *         name: search
 *         required: false
 *         type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         type: string
 *       - in: query
 *         name: offset
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
app.get('/admin/agent_list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        serachText:Joi.string().optional().allow(""),
        search:Joi.string().optional().allow(""),
        limit:Joi.string().optional().allow(""),
        offset:Joi.string().optional().allow(""),
        sectionId:Joi.number().required(),
        order_by:Joi.number().optional(),
        is_desc: Joi.number().optional(),
        is_admin:Joi.number().optional(),
        supplierId:Joi.number().optional(),
        startDate:Joi.string().optional(),
        endDate: Joi.string().optional(),
        country_code:Joi.string().optional().allow(""),
        country_code_type:Joi.string().optional().allow(""),
        is_stripe_connected:Joi.number().optional().allow(0)
    }
}),
SupplierAgentCntrl.List
)
/**
 * @swagger
 * /admin/agent_according_area:
 *   get:
 *     description: agent list according area
 *     tags:
 *       - Admin API`S
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
app.get('/admin/agent_according_area',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: 
    {   
        sectionId:Joi.number().required(),
        supplierId:Joi.number().required(),
        agent_category_id:Joi.number().optional().allow(""),
        delivery_company_id:Joi.number().optional().allow(0)
        // areaId:Joi.number().required()
    }
}),
SupplierAgentCntrl.ListAccToArea
)


/**
 * @swagger
 * /admin/agent_create:
 *   post:
 *     description: api used for creation an agent
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
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
 *          name: supplier_name
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
app.post('/admin/agent_create',
multipartMiddleware,
Auth.checkCblAuthority,
Auth.storeDbInRequest, 
//  Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,

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
 * /admin/reset_agent_password:
 *   post:
 *     description: api used for reset agent password
 *     tags:
 *       - Admin API`S
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
app.post('/admin/reset_agent_password',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
SupplierAgentCntrl.setAgentPassword
)
/**
 * @swagger
 * /delivery_company/reset_agent_password:
 *   post:
 *     description: api used for reset agent password
 *     tags:
 *       - Admin API`S
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
app.post('/delivery_company/reset_agent_password',
multipartMiddleware,
Auth.storeDbInRequest,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
SupplierAgentCntrl.setAgentPassword
)


/**
 * @swagger
 * /common/reset_agent_password:
 *   post:
 *     description: api used for reset agent password
 *     tags:
 *       - Agent API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: agentId
 *          required: true
 *          type: number
 *        - in: body
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
app.post('/common/reset_agent_password',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
SupplierAgentCntrl.setAgentPasswordByAgent
)
/**
 * @swagger
 * /admin/agent_update:
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
app.put('/admin/agent_update',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
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
 * /admin/service/assignment:
 *   post:
 *     description: api used for assigned service an agent
 *     tags:
 *       - Admin API`S
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
 *                             id:
 *                                type: number
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
 *                             pricing_type:
 *                                     type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/service/assignment',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            serviceData:Joi.array().items(Joi.object().keys({
                service_id:Joi.number().required(),
                name:Joi.string().required(),
                image:Joi.string().optional().allow(""),
                priceArray:Joi.array().items(Joi.object().keys(
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
                    "tax_value": Joi.number().optional().allow(0),
                    "tax_type": Joi.number().optional().allow(0)
                    
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
 * /agent/service/assignment:
 *   post:
 *     description: api used for assigned service an agent
 *     tags:
 *       - Agent API`S
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
 *                             id:
 *                                type: number
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
 *                             pricing_type:
 *                                     type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/agent/service/assignment',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            serviceData:Joi.array().items(Joi.object().keys({
                service_id:Joi.number().required(),
                name:Joi.string().required(),
                image:Joi.string().optional().allow(""),
                priceArray:Joi.array().items(Joi.object().keys(
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
                    "agentBufferPrice":Joi.number().optional().allow(0),
                    "description":Joi.string().optional().allow("")
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
 * /admin/booking/assignment:
 *   post:
 *     description: api used for assigned booking to agent
 *     tags:
 *       - Admin API`S
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
app.post('/admin/booking/assignment',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            orderId:Joi.number().required(),
            agentIds:Joi.array().items(Joi.number().required())
    }
}),
SupplierAgentCntrl.BookingAssignmnt
)
/**
 * @swagger
 * /admin/service/assignedList:
 *   get:
 *     description: assigned servive list of agent 
 *     tags:
 *       - Admin API`S
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
app.get('/admin/service/assignedList',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
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
 * /admin/agent/in_out_timings:
 *   get:
 *     description: agent in out timings
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: agentId
 *         required: true
 *         type: number
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number   
 *       - in: query
 *         name: skip
 *         required: true
 *         type: number   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/agent/in_out_timings',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    query: 
    {
        agentId:Joi.number().required(),
        limit:Joi.number().required(),
        skip:Joi.number().required()

    }
}),
SupplierAgentCntrl.getAgentInOutTimings
)


/**
 * @swagger
 * /agent/service/assigned_ids:
 *   get:
 *     description: assigned servive list of agent 
 *     tags:
 *       - Admin API`S
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
app.get('/agent/service/assigned_ids',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    query: 
    {
        agent_id:Joi.number().required()
    }
}),
SupplierAgentCntrl.AssignServiceList
)

/**
 * @swagger
 * /agent/service/assignedList:
 *   get:
 *     description: assigned servive list of agent 
 *     tags:
 *       - Admin API`S
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
app.get('/agent/service/assignedList',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({
    query: 
    {
        agent_id:Joi.number().required(),
        latitude : Joi.number().optional().allow(0),
        longitude : Joi.number().optional().allow(0)
    }
}),
SupplierAgentCntrl.AssignServiceListForAgent
)


/**
 * @swagger
 * /admin/service/unassignment:
 *   put:
 *     description: api used for unassignment of services an agent
 *     tags:
 *       - Admin API`S
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
app.put('/admin/service/unassignment',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
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
 * /agent/service/unassignment:
 *   put:
 *     description: api used for unassignment of services an agent
 *     tags:
 *       - Admin API`S
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
app.put('/agent/service/unassignment',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            serviceIds:Joi.array().items(Joi.number().required()).required(),
            agentId:Joi.number().required()
    }
}),
SupplierAgentCntrl.RemoveAssignedService
)

/**
 * @swagger
 * /admin/agent_set_availability:
 *   post:
 *     description: api used for set an agent availability
 *     tags:
 *       - Admin API`S
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
app.post('/admin/agent_set_availability',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
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
 * /admin/agent_token:
 *   get:
 *     description: api for getting agent token 
 *     tags:
 *       - Admin API`S
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
app.get('/admin/agent_token',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
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
 * /admin/agent_update_availability:
 *   post:
 *     description: api used for set an agent availability
 *     tags:
 *       - Admin API`S
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
app.post('/admin/agent_update_availability',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
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
            agent_token:Joi.string().required(),
            offset:Joi.string().required()
    }
}),
SupplierAgentCntrl.UpdateAgentAvailability
)
/**
 * @swagger
 * /admin/get_agent_availability:
 *   get:
 *     description: api for getting agent token 
 *     tags:
 *       - Admin API`S
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
app.get('/admin/get_agent_availability',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        agent_token:Joi.string().required(),
        sectionId:Joi.number().required(),
        agent_id:Joi.number().optional().allow(0)
    }
}),
SupplierAgentCntrl.GetAgentAvailability
)
/**
 * @swagger
 * /admin/delete_agent_time_slots:
 *   put:
 *     description: api for deleting an time slots 
 *     tags:
 *       - Admin API`S
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
app.put('/admin/delete_agent_time_slots',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        agent_token:Joi.string().required(),
        sectionId:Joi.number().required(),
        slotId:Joi.number().required()
    }
}),
SupplierAgentCntrl.DeleteTimsSlots
)

/**
 * @swagger
 * /admin/get_agent_block_times:
 *   get:
 *     description: api for getting agent block times
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
 *         name: skip
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/get_agent_block_times',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: 
    {
        limit:Joi.number().required(),
        skip:Joi.number().required()
    }
}),
SupplierAgentCntrl.GetAgentBlockTimes
)

/**
 * @swagger
 * /admin/get_block_time_accepted_agents:
 *   get:
 *     description: api for getting agent block times
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
 *         name: skip
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/get_block_time_accepted_agents',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: 
    {
        limit:Joi.number().required(),
        skip:Joi.number().required(),
        block_time_id:Joi.number().required()
    }
}),
SupplierAgentCntrl.GetAcceptedAgentBlockTimes
)


/**
 * @swagger
 * /admin/set_agents_block_time:
 *   post:
 *     description: api for add agent block time
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: blockDate
 *         required: true
 *         type: string
 *       - in: body
 *         name: blockTime
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
app.post('/admin/set_agents_block_time',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: 
    {
        blockDate:Joi.string().required(),
        blockTime:Joi.string().required(),
        offset:Joi.string().required(),
        name:Joi.string().required(),
        description:Joi.string().required(),
        block_time_commission:Joi.number().required(),
        blockEndDate:Joi.string().required(),
        blockEndTime:Joi.string().required(),
        id:Joi.number().optional().allow(0)
    }
}),
SupplierAgentCntrl.setAgentsBlockTime
)



/**
 * @swagger
 * /admin/delete_agents_block_time:
 *   post:
 *     description: api for delete agent block time
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/delete_agents_block_time',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: 
    {
        id:Joi.number().required()
    }
}),
SupplierAgentCntrl.deleteAgentBlockTime
)

/**
 * @swagger
 * /admin/block_unlblock_agent:
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
app.put('/admin/block_unlblock_agent',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
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
 * /delivery_company/block_unlblock_agent:
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
app.put('/delivery_company/block_unlblock_agent',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: 
    {
        id:Joi.number().required(),
        status:Joi.number().required()
    }
}),
SupplierAgentCntrl.blockUnblock
),
/**
 * @swagger
 * /admin/available/status:
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
app.put('/admin/available/status',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
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
 * /delivery_company/available/status:
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
app.put('/delivery_company/available/status',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
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
 * /admin/delete_agent:
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
 *              id:
 *                  type: number
 *                  required: true   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/admin/delete_agent',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
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
 * /delivery_company/delete_agent:
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
 *              id:
 *                  type: number
 *                  required: true   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/delivery_company/delete_agent',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: 
    {
        id:Joi.number().required()
    }
}),
SupplierAgentCntrl.deleteAgent
)

/**
 * @swagger
 * /admin/add_agent_tips:
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
 *              id:
 *                  type: number
 *                  required: true   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/add_agent_tips',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: 
    {
        tips:Joi.array().required()
    }
}),
SupplierAgentCntrl.addagentTips
)

/**
 * @swagger
 * /admin/add_agent_tips:
 *   get:
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
 *              id:
 *                  type: number
 *                  required: true   
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/list_agent_tips',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: 
    {
        
    }
}),
SupplierAgentCntrl.listAgentTips
)
/**
 * @swagger
 * /admin/returnbooking/assignment:
 *   post:
 *     description: api used for assigned booking to agent
 *     tags:
 *       - Admin API`S
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
app.post('/admin/returnbooking/assignment',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            orderPriceId:Joi.number().required(),
            agentId:Joi.number().required()
    }
}),
SupplierAgentCntrl.returnOrderAssignment
)


/**
 * @swagger
 * /common/add_category_for_agents:
 *   post:
 *     description: api used for add_category_for_agents
 *     tags:
 *       - Agent API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: name
 *          required: true
 *          type: string
 *        - in: body
 *          name: type
 *          type: number
 *          required: true
 *     responses:
 *       200:
 *         description: encrypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 *      
 */
app.post('/common/add_category_for_agents',
// multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    name:Joi.string().required(),
    type:Joi.number().required(),
    base_delivery_charge:Joi.number().optional(),
    delivery_charge_per_km:Joi.number().optional()
}
}),
SupplierAgentCntrl.addCategoriesForAgent
)


/**
 * @swagger
 * /common/delete_category_for_agents:
 *   post:
 *     description: api used for delete_category_for_agents
 *     tags:
 *       - Agent API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          type: number
 *          required: true
 *     responses:
 *       200:
 *         description: encrypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 *      
 */
app.post('/common/delete_category_for_agents',
// multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    id:Joi.number().required()
}
}),
SupplierAgentCntrl.deleteCategoriesForAgent
)


/**
 * @swagger
 * /admin/list_category_for_agents:
 *   get:
 *     description: api for list_category_for_agents
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          type: number
 *          required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/list_category_for_agents',
Auth.storeDbInRequest,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
// expressJoi({query: 
//     {
        
//     }
// }),
SupplierAgentCntrl.listCategoriesForAgent

)

/**
 * @swagger
 * /common/list_category_for_agents:
 *   get:
 *     description: api for list_category_for_agents
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          type: number
 *          required: false
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/common/list_category_for_agents',
Auth.storeDbInRequest,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
// expressJoi({query: 
//     {
        
//     }
// }),
SupplierAgentCntrl.listCategoriesForAgent

),
/**
 * @swagger
 * /admin/agent_order_list:
 *   get:
 *     description: listing of agent active orders
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: agent_id
 *         required: false
 *         type: number
 *       - in: query
 *         name: limit
 *         required: true
 *         type: number
 *       - in: query
 *         name: skip
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/agent_order_list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: 
    {   
        agent_id:Joi.number().required(),
        limit:Joi.number().required(),
        skip:Joi.number().required()
        // areaId:Joi.number().required()
    }
}),
SupplierAgentCntrl.listAgentActiveOrders
)

/**
 * @swagger
 * /v1/admin/get_agent_availability:
 *   get:
 *     description: api for getting agent token 
 *     tags:
 *       - Admin API`S
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
 app.get('/v1/admin/get_agent_availability',
 Auth.authenticateAccessToken,
 Auth.checkforAuthorityofThisAdmin,
 Auth.checkCblAuthority,
 expressJoi({query: 
     {
         agent_token:Joi.string().optional(),
         sectionId:Joi.number().required(),
         agent_id:Joi.number().required(),
     }
 }),
 SupplierAgentCntrl.GetAgentAvailabilityV1
 )

}