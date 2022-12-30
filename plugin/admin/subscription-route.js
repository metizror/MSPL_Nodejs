
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
 * /admin/create_user_subscription_plan:
 *   post:
 *     description: For creating user subscription plan name here
 *     tags:
 *       - Admin API`S
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
app.post('/admin/create_user_subscription_plan',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
multipartMiddleware,
expressJoi({body: {
    title:Joi.string().required(),
    description:Joi.string().required(),
    price:Joi.string().required(),
    type:Joi.number().required(),
    min_order_amount:Joi.number().optional().allow(""),
    gateway_unique_id:Joi.string().optional().allow("")
}}),
userSubscriptionController.createUserSubscriptionPlan
)



/**
 * @swagger
 * /admin/update_user_subscription_plan:
 *   post:
 *     description: For creating user subscription plan name here
 *     tags:
 *       - Admin API`S
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
app.post('/admin/update_user_subscription_plan',
Auth.authenticateAccessToken,
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
 * /admin/create_user_subscription_benefits:
 *   post:
 *     description: For creating user subscription benefits
 *     tags:
 *       - Admin API`S
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
Auth.authenticateAccessToken,
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
app.post('/admin/assign_benefits_to_plan',
Auth.authenticateAccessToken,
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
app.post('/admin/remove_benefits_from_plan',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({body: {
    plan_id:Joi.number().required(),
    benefit_id:Joi.number().required()
}}),
userSubscriptionController.removeBenefitsFromPlan
)

/**
 * @swagger
 * /admin/list_user_subscription_plans:
 *   get:
 *     description: For listing user subscription plan
 *     tags:
 *       - Admin API`S
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
app.get('/admin/list_user_subscription_plans',
Auth.authenticateAccessToken,
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
 *       - Admin API`S
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
app.get('/admin/list_user_subscription_benefits',
// Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        limit:Joi.number().required(),
        offset:Joi.number().required(),
        id:Joi.number().optional().allow("")
    }
}),
userSubscriptionController.listUserSubscriptionBenefits
)

























    /**
 * @swagger
 * /admin/create_subscription_plan:
 *   post:
 *     description: For creating subscription plans
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: name
 *          required: true
 *          type: string
 *        - in: body
 *          name: type
 *          required: true
 *          type: string
 *        - in: body
 *          name: permission_ids
 *          required: true
 *          schema:
 *           type:array
 *        - in: body
 *          name: price
 *          required: true
 *          type: number
 *        - in: body
 *          name: description
 *          required: true
 *          type: string
 *        - in: body
 *          name: admin_commission
 *          required: false
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/create_subscription_plan',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({body: {
                name:Joi.string().required(),
                type : Joi.string().required(),
                price:Joi.number().required(),
                permission_ids : Joi.array().required(),
                description:Joi.string().required(),
                banner_limit:Joi.number().optional().allow(0),
                is_on_top_priority:Joi.number().optional().allow(0),
                admin_commission:Joi.number().optional().allow(""),
                gateway_unique_id:Joi.string().optional().allow("")
    }
}),
subscriptionController.createSubscriptionPlan
)

/**
 * @swagger
 * /admin/update_subscription_plan:
 *   put:
 *     description: For updating subscription plans
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: name
 *          required: true
 *          type: string
 *        - in: body
 *          name: type
 *          required: true
 *          type: string
 *        - in: body
 *          name: permission_ids
 *          required: true
 *          schema:
 *           type:array
 *        - in: body
 *          name: price
 *          required: true
 *          type: number
 *        - in: body
 *          name: is_block
 *          required: true
 *          type: string
 *        - in: body
 *          name: id
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.put('/admin/update_subscription_plan',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({body: {
                is_block:Joi.number().required(),
                name:Joi.string().required(),
                type : Joi.string().required(),
                description:Joi.string().optional().allow(""),

                price:Joi.number().required(),
                permission_ids : Joi.array().required(),
                banner_limit:Joi.number().optional().allow(0),
                is_on_top_priority:Joi.number().optional().allow(0),
                id:Joi.number().required(),
                admin_commission:Joi.number().optional().allow(null)
    }
}),
subscriptionController.updateSubscriptionPlan
)

/**
 * @swagger
 * /admin/delete_subscription_plan:
 *   post:
 *     description: For deleting subscription plan
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: plan_id
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/delete_subscription_plan',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({body: {
        plan_id:Joi.string().required()
    }
}),
subscriptionController.deleteSubscriptionPlan
)

/**
 * @swagger
 * /admin/list_subscription_plans:
 *   get:
 *     description: For listing subscription plan
 *     tags:
 *       - Admin API`S
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
 *          name: name
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/list_subscription_plans',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
expressJoi({query: {
        limit:Joi.number().required(),
        offset:Joi.number().required(),
        name: Joi.string().optional().allow("")
    }
}),
subscriptionController.listSubscriptionPlan
)

/**
 * @swagger
 * /supplier/list_subscription_plans:
 *   get:
 *     description: For listing subscription plan
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: type
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/list_subscription_plans',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
// expressJoi({query: {
//         type:Joi.number().required()
//     }
// }),
subscriptionController.supplierListPlans
)


/**
 * @swagger
 * /supplier/stripSessionId:
 *   get:
 *     description: For listing subscription plan
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: plan_id
 *          required: true
 *          type: string
 *        - in: query
 *          name: supplier_id
 *          required: true
 *          type: string
 *        - in: query
 *          name: type
 *          required: true
 *          type: string
 *        - in: query
 *          name: stripe_plan_id
 *          required: true
 *          type: string
 *        - in: query
 *          name: successUrl
 *          required: true
 *          type: string
 *        - in: query
 *          name: failureUrl
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/supplier/stripSessionId',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
            plan_id:Joi.string().required(),
            stripe_plan_id : Joi.string().required(),
            supplier_id:Joi.number().required(),
            type:Joi.string().valid(["card"]),
            successUrl :Joi.string().required(),
            failureUrl :Joi.string().required()
    }
}),
subscriptionController.stripeSessionDetails
)


/**
 * @swagger
 * /user/stripeUserSessionId:
 *   get:
 *     description: For listing subscription plan
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: plan_id
 *          required: true
 *          type: string
 *        - in: query
 *          name: user_id
 *          required: true
 *          type: string
 *        - in: query
 *          name: type
 *          required: true
 *          type: string
 *        - in: query
 *          name: stripe_plan_id
 *          required: true
 *          type: string
 *        - in: query
 *          name: benefit_type
 *          required: true
 *          type: string
 *        - in: query
 *          name: price
 *          required: true
 *          type: string
 *        - in: query
 *          name: sub_type
 *          required: true
 *          type: string
 *        - in: query
 *          name: successUrl
 *          required: true
 *          type: string
 *        - in: query
 *          name: failureUrl
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/user/stripeUserSessionId',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
            plan_id:Joi.string().required(),
            stripe_plan_id : Joi.string().required(),
            benefit_type : Joi.string().required(),
            price : Joi.string().required(),
            sub_type : Joi.string().required(),//monthly/yearly/etc
            user_id:Joi.number().required(),
            type:Joi.string().valid(["card"]),
            successUrl :Joi.string().required(),
            failureUrl :Joi.string().required()
    }
}),
subscriptionController.stripeUserSessionDetails
)

/**
 * @swagger
 * /admin/get_all_permissions:
 *   get:
 *     description: For listing permissions
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: type
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/get_all_permissions',
Auth.authenticateAccessToken,
Auth.checkCblAuthority,
// expressJoi({query: {
//         type:Joi.number().required()
//     }
// }),
subscriptionController.getAllPermissions
)


/**
 * @swagger
 * /supplier/subscription/creation:
 *   post:
 *     description: For subscription creation
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: supplier_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: plan_id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/subscription/creation',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        supplier_id:Joi.number().required(),
        plan_id:Joi.number().required()
    }
}),
subscriptionController.subscriptionCreation
)



/**
 * @swagger
 * /supplier/subscription/cancel:
 *   post:
 *     description: For subscription creation
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: sub_id
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/subscription/cancel',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        sub_id:Joi.string().required(),
        payment_source:Joi.string().optional().allow("")
    }
}),
subscriptionController.cancelSubscription
)


/**
 * @swagger
 * /admin/approve_supplier_subscription:
 *   post:
 *     description: For supplier subscription approval
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: id
 *          required: true
 *          type: number
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/admin/approve_supplier_subscription',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
        id:Joi.number().required()
    }
}),
subscriptionController.approveSupplierSubscription
)


/**
 * @swagger
 * /supplier/webhook/subscription/creation:
 *   post:
 *     description: For webhook subscription
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: type
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/webhook/subscription/creation',
// Auth.authenticateAccessToken,
// Auth.checkCblAuthority,
// expressJoi({query: {
//         type:Joi.number().required()
//     }
// }),
subscriptionController.subscriptionCreateWebhook
)



/**
 * @swagger
 * /supplier/webhook/subscription/success:
 *   post:
 *     description: For webhook subscription
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: type
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/webhook/subscription/success',
// Auth.authenticateAccessToken,
// Auth.checkCblAuthority,
// expressJoi({query: {
//         type:Joi.number().required()
//     }
// }),
subscriptionController.updateSubscription
)








/**
 * @swagger
 * /supplier/webhook/subscription/fail:
 *   post:
 *     description: For webhook subscription
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: type
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/webhook/invoice/fail',
// Auth.authenticateAccessToken,
// Auth.checkCblAuthority,
// expressJoi({query: {
//         type:Joi.number().required()
//     }
// }),
subscriptionController.updateSubscription
)








/**
 * @swagger
 * /supplier/webhook/subscription/cancel:
 *   post:
 *     description: For webhook subscription
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: type
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/webhook/subscription/cancel',
// Auth.authenticateAccessToken,
// Auth.checkCblAuthority,
// expressJoi({query: {
//         type:Joi.number().required()
//     }
// }),
subscriptionController.cancelSubscriptionWebhook
)



/**
 * @swagger
 * /supplier/buy_subscription_plan:
 *   post:
 *     description: For webhook subscription
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
 *          name: current_period_end
 *          required: true
 *          type: string
 *        - in: body
 *          name: current_period_start
 *          required: true
 *          type: string
 *        - in: body
 *          name: supplier_id
 *          required: true
 *          type: string
 *        - in: body
 *          name: payment_source
 *          required: true
 *          type: string
 *        - in: body
 *          name: reciept_url
 *          required: true
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.post('/supplier/buy_subscription_plan',
// Auth.authenticateAccessToken,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
    plan_id:Joi.number().required(),
    current_period_end:Joi.string().required(),
    current_period_start:Joi.string().required(),
    supplier_id:Joi.number().required(),
    payment_source:Joi.string().required(),
    reciept_url:Joi.string().required(),
    }
}),
subscriptionController.buySupplierSubscription
)


/**
 * @swagger
 * /admin/supplier_subscriptions:
 *   get:
 *     description: For listing supplier subscription plan
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: limit
 *          required: true
 *          type: string
 *        - in: query
 *          name: offset
 *          required: true
 *          type: string
 *        - in: query
 *          name: period
 *          required: false
 *          type: string
 *        - in: query
 *          name: status
 *          required: false
 *          type: string
 *     responses:
 *       200:
 *         description: Success!
 */
app.get('/admin/supplier_subscriptions',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({query: {
            limit :Joi.number().required(),
            offset :Joi.number().required(),
            period : Joi.string().optional().allow(""),
            status : Joi.string().optional().allow(""),
            fromDate:Joi.string().optional().allow(""),
            toDate:Joi.string().optional().allow(""),
            is_download:Joi.number().optional().allow(0)


    }
}),
subscriptionController.suppliersSubscriptionDetails
)

}