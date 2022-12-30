const Auth=require('../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const deliveryCompanyLoginCntrl = require('../controller/delivery_company/loginCntrl')
const deliveryCompanyDashboardCntrl = require('../controller/delivery_company/dashboardCntrl')
const SupplierAgentCntrl = require('../controller/supplier/agentController')
module.exports=(app)=>{
/**
 * @swagger
 * /delivery_company/login:
 *   post:
 *     description: For assign_delivery_company_to_supplier
 *     tags:
 *       - delivery_company API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: supplierDeliveryCompanyIds
 *         required: true
 *         type: array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/delivery_company/login',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    email: Joi.string().required(),
    password: Joi.string().required(),
    fcm_token: Joi.string().optional().allow("")
    }
}),
deliveryCompanyLoginCntrl.deliveryCompanyLogin
)

/**
 * @swagger
 * /delivery_company/logout:
 *   post:
 *     description: For logout_delivery_company
 *     tags:
 *       - delivery_company API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: id
 *         required: true
 *         type: array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/delivery_company/logout',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
// expressJoi({body: {
//     email: Joi.string().required(),
//     password: Joi.string().required(),
//     fcm_token: Joi.string().required()
//     }
// }),
deliveryCompanyLoginCntrl.deliveryCompanyLogout
)

/**
 * @swagger
 * /delivery_company/dashboard:
 *   get:
 *     description: For listing delivery companies
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: delivery_company_id 
 *         required: true
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/delivery_company/dashboard',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
    delivery_company_id:Joi.number().required()
               }
}),
deliveryCompanyDashboardCntrl.dashboard
)


/**
 * @swagger
 * /delivery_company/booking/assignment:
 *   post:
 *     description: api used for delivery_company booking to agent
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
app.post('/delivery_company/booking/assignment',
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
 * /delivery_company/agent_list:
 *   get:
 *     description: delivery_company list of  agents
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
app.get('/delivery_company/agent_list',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
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
        delivery_company_id:Joi.number().required()
    }
}),
deliveryCompanyDashboardCntrl.ListDeliveryCompanyAgents
)

/**
 * @swagger
 * /delivery_company/agent_create:
 *   post:
 *     description: api used for creation an agent
 *     tags:
 *       - delivery_company API`S
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
app.post('/delivery_company/agent_create',
multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
// expressJoi({body: {
//             first_name:Joi.string().required(),
//             last_name:Joi.string().required(),
//             email:Joi.string().required(),
//             area_id:Joi.number().required()
//     }
// }),
SupplierAgentCntrl.AddAgentsByDeliveryCompany
)

/**
 * @swagger
 * /delivery_company/agent_update:
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
app.put('/delivery_company/agent_update',
multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
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
 * /delivery_company/profile:
 *   get:
 *     description: For profile delivery companies
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: delivery_company_id 
 *         required: true
 *         type: number 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/delivery_company/profile',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
    delivery_company_id:Joi.number().required()
               }
}),
deliveryCompanyDashboardCntrl.deliveryCompanyProfile
)


}