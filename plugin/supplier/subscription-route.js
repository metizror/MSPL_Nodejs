
var subscriptionController = require('../../controller/admin/SubscriptionController')
var userSubscriptionController = require('../../controller/admin/UserSubscriptionController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /supplier/create_user_subscription_plan:
 *   post:
 *     description: For creating user subscription plan name here
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: title
 *          required: true
 *          type: string
 *        - in: body
 *          name: description
 *          required: true
 *          type: string
 *        - in: body
 *          name: price
 *          required: true
 *          type: string
 *        - in: body
 *          name: type
 *          required: true
 *          type: string
 *        - in: body
 *          name: min_order_amount
 *          required: false
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/create_user_subscription_plan',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
multipartMiddleware,
expressJoi({body: {
    title:Joi.string().required(),
    description:Joi.string().required(),
    price:Joi.string().required(),
    type:Joi.number().required(),
    min_order_amount:Joi.number().optional().allow("")
}}),
userSubscriptionController.createUserSubscriptionPlan
)



/**
 * @swagger
 * /supplier/update_user_subscription_plan:
 *   post:
 *     description: For creating user subscription plan name here
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *        - in: body
 *          name: title
 *          required: true
 *          type: string
 *        - in: body
 *          name: description
 *          required: true
 *          type: string
 *        - in: body
 *          name: price
 *          required: true
 *          type: string
 *        - in: body
 *          name: type
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/update_user_subscription_plan',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
multipartMiddleware,
expressJoi({body: {
    id:Joi.number().required(),
    title:Joi.string().required(),
    description:Joi.string().required(),
    price:Joi.string().required(),
    image:Joi.string().optional().allow(""),
    type:Joi.number().required(),
    is_blocked:Joi.number().required(),
    min_order_amount:Joi.number().optional().allow("")
}}),
userSubscriptionController.updateUserSubscriptionPlan
)


/**
 * @swagger
 * /supplier/create_user_subscription_benefits:
 *   post:
 *     description: For creating user subscription benefits
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: title
 *          required: true
 *          type: string
 *        - in: body
 *          name: description
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/create_user_subscription_benefits',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
    title:Joi.string().required(),
    description:Joi.string().required()
}}),
userSubscriptionController.createUserSubscriptionBenefits
)

/**
 * @swagger
 * /admin/assign_benefits_to_plan:
 *   post:
 *     description: For assigning benefits to a plan
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: plan_id
 *          required: true
 *          type: string
 *        - in: body
 *          name: benefit_ids
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/assign_benefits_to_plan',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
    plan_id:Joi.number().required(),
    benefit_ids:Joi.string().required()
}}),
userSubscriptionController.assignBenefitsToPlan
)
/**
 * @swagger
 * /admin/remove_benefits_from_plan:
 *   post:
 *     description: For removing benefits from a plan
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: plan_id
 *          required: true
 *          type: number
 *        - in: body
 *          name: benefit_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/remove_benefits_from_plan',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({body: {
    plan_id:Joi.number().required(),
    benefit_id:Joi.number().required()
}}),
userSubscriptionController.removeBenefitsFromPlan
)

/**
 * @swagger
 * /supplier/list_user_subscription_plans:
 *   get:
 *     description: For listing user subscription plan
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: offset
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/list_user_subscription_plans',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: {
        limit:Joi.number().required(),
        offset:Joi.number().required()
    }
}),
userSubscriptionController.listUserSubscriptionPlan
)


/**
 * @swagger
 * /admin/list_user_subscription_benefits:
 *   get:
 *     description: For listing user subscription benefits
 *     tags:
 *       - Supplier API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: number
 *        - in: query
 *          name: offset
 *          required: true
 *          type: number
 *        - in: query
 *          name: id
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/list_user_subscription_benefits',
Auth.supplierAuth,
// Auth.checkforAuthorityofThisSupplier,
Auth.checkCblAuthority,
expressJoi({query: {
        limit:Joi.number().required(),
        offset:Joi.number().required(),
        id:Joi.number().optional().allow("")
    }
}),
userSubscriptionController.listUserSubscriptionBenefits
)

}