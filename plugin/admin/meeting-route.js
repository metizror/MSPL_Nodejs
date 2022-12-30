
var supplierController = require('../../controller/admin/SupplierController')
var Auth=require('../../lib/Auth');
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const Controller=require('../../controller')
module.exports=(app)=>{
/**
 * @swagger
 * /admin/meeting/addUpdate:
 *   post:
 *     description: api used for addding an meeting on date
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
 *              from_date:
 *                  type: string
 *                  required: true
 *              to_date:
 *                  type: string
 *                  required: true
 *              offset:
 *                  type: string
 *                  required: true 
 *              dateId:
 *                  type: number
 *                  required: false   
 *              timing:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/meeting/addUpdate',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            sectionId:Joi.number().required(),
            from_date:Joi.string().required(),
            to_date:Joi.string().required(),
            dateId:Joi.number().optional().allow(""),
            timing:Joi.array().items(
                Joi.object().keys({
                        start_time:Joi.string().required(),
                        end_time:Joi.string().required()
                }).unknown(true)
            ).optional().allow(""),
            offset:Joi.string().required()
    }
}),
Controller.MeetingCntrl.meeting.addUpdate
)
/**
 * @swagger
 * /admin/meeting/list:
 *   get:
 *     description: api for listing an meeting
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/meeting/list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
Controller.MeetingCntrl.meeting.listing
)
/**
 * @swagger
 * /admin/meeting/slots/delete:
 *   put:
 *     description: For deleting an meeting slot
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
 *              id:
 *                  type: number
 *                  required: true
 *     responses:
*       200:
 *         description: Success!
 */
app.put('/admin/meeting/slots/delete',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({body: {
    sectionId:Joi.number().required(),
    id:Joi.number().required()
}
}),
Controller.MeetingCntrl.meeting.deleteSlots
)
/**
 * @swagger
 * /admin/meeting/request/list:
 *   get:
 *     description: For listign an meeting request
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         required: true
 *         type: number 
 *       - in: query
 *         name: limit
 *         required: true
 *         type: string 
 *       - in: query
 *         name: offset
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/meeting/request/list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required(),
                sectionId:Joi.string().optional().allow("")
    }
}),
Controller.MeetingCntrl.meeting.requestList
);
/**
 * @swagger
 * /agent/meeting/request/list:
 *   get:
 *     description: For listign an meeting request from agent
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: true
 *         type: string 
 *       - in: query
 *         name: offset
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/agent/meeting/request/list',
Auth.storeDbInRequest,
Auth.agentAuthentication,
expressJoi({query: {
                limit:Joi.number().required(),
                offset:Joi.number().required()
    }
}),
Controller.MeetingCntrl.meeting.requestList
);
/**
 * @swagger
 * /admin/meeting/request/approve:
 *   put:
 *     description: For deleting an meeting slot
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
 *              id:
 *                  type: number
 *                  required: true
 *              status:
 *                  type: number
 *                  required: true
 *              link:
 *                  type: string
 *                  required: false
 *     responses:
*       200:
 *         description: Success!
 */
app.put('/admin/meeting/request/approve',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({body: {
    sectionId:Joi.number().required(),
    id:Joi.number().required(),
    link:Joi.string().required(),
    status:Joi.number().required()
}
}),
Controller.MeetingCntrl.meeting.meetingRequestApprove
)
/**
 * @swagger
 * /agent/meeting/list:
 *   get:
 *     description: api for listing an meeting
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/agent/meeting/list',
Auth.storeDbInRequest,
Auth.agentAuthentication,
Controller.MeetingCntrl.meeting.listing
)
/**
 * @swagger
 * /agent/meeting/request/add:
 *   put:
 *     description: For adding an meeting request from agent
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
 *              id:
 *                  type: number
 *                  required: true
 *     responses:
*       200:
 *         description: Success!
 */
app.put('/agent/meeting/request/add',
Auth.storeDbInRequest,
Auth.agentAuthentication,
expressJoi({body: {
    id:Joi.number().required()
}
}),
Controller.MeetingCntrl.meeting.meetingRequestByAgent
)

}