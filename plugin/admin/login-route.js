const loginController=require('../../controller/admin/LoginController')
var Auth=require('../../lib/Auth')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /v1/admin/login:
 *   post:
 *     description: api used for login by admin
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              email:
 *                  type: string
 *                  required: true
 *              password:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/v1/admin/login',
Auth.storeDbInRequest,
expressJoi({body: {
            email:Joi.string().required(),
            password:Joi.string().required(),
            fcm_token : Joi.string().optional().allow("")
    }
}),
loginController.Login
)
/**
 * @swagger
 * /admin/logout:
 *   put:
 *     description: api used for log by admin
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: success!
 */
app.put('/admin/logout',
// Auth.checkCblAuthority,
Auth.authenticateAccessToken,
loginController.Logout
)
/**
 * @swagger
 * /admin/update/language:
 *   post:
 *     description: api used for log by admin
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              language_id:
 *                  type: number
 *                  required: true
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/admin/update/language',
// Auth.checkCblAuthority,
Auth.authenticateAccessToken,
loginController.updateLanguage
)
/**
 * @swagger
 * /v1/admin/get_admin_sections_data:
 *   post:
 *     description: api used to get admin sections
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
 *              email:
 *                  type: string
 *                  required: true
 *              password:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/v1/admin/get_admin_sections_data',
Auth.storeDbInRequest,
// Auth.authenticateAccessToken,
expressJoi({body: {
            subAdminId : Joi.number().required()
    }
}),
loginController.subAdminData
)

  /**
 * @swagger
 * /admin/logout:
 *   put:
 *     description: api used for log by admin
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: success!
 */
app.put('/admin/logout',
// Auth.checkCblAuthority,
Auth.authenticateAccessToken,
loginController.Logout
)

/**
 * @swagger
 * /v1/supplier/get_supplier_sections_data:
 *   post:
 *     description: api used to get supplier sections
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
 *              email:
 *                  type: string
 *                  required: true
 *              password:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/v1/supplier/get_supplier_sections_data',
Auth.storeDbInRequest,
// Auth.authenticateAccessToken,
expressJoi({body: {
            subSupplierId : Joi.number().required()
    }
}),
loginController.subSupplierData
)



/**
 * @swagger
 * /v1/admin/assign_or_revoke_sections:
 *   post:
 *     description: api used to get admin sections
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
 *              email:
 *                  type: string
 *                  required: true
 *              password:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/v1/admin/assign_or_revoke_sections',
Auth.storeDbInRequest,
Auth.authenticateAccessToken,
expressJoi({body: {
            subAdminId : Joi.number().required(),
            sectionIds : Joi.array().optional().allow("")
    }
}),
loginController.assignOrRevokeSectionToAdmin
)

/**
 * @swagger
 * /v1/supplier/assign_or_revoke_sections:
 *   post:
 *     description: api used to get admin sections
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
 *              email:
 *                  type: string
 *                  required: true
 *              password:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/v1/supplier/assign_or_revoke_sections',
Auth.storeDbInRequest,
// Auth.authenticateAccessToken,
Auth.supplierAuth,
expressJoi({body: {
            subSupplierId : Joi.number().required(),
            sectionIds : Joi.array().optional().allow("")
    }
}),
loginController.assignOrRevokeSectionToSupplier
)


 /**
 * @swagger
 * /admin/logout:
 *   put:
 *     description: api used for log by admin
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: success!
 */
app.put('/admin/logout',
// Auth.checkCblAuthority,
Auth.authenticateAccessToken,
loginController.Logout
)

 /**
 * @swagger
 * /admin/update_user_app_version:
 *   post:
 *     description: api used for log by admin
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: version_ios
 *         required: true
 *         type: string
 *       - in: formData
 *         name: version_android
 *         required: true
 *         type: string
 *       - in: formData
 *         name: is_update_ios
 *         required: true
 *         type: number
 *       - in: formData
 *         name: is_update_android
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/admin/update_user_app_version',
// Auth.checkCblAuthority,
// Auth.authenticateAccessToken,
multipartMiddleware,
Auth.storeDbInRequest,
// expressJoi({
//     body: {
//         version_ios:Joi.string().required(),
//         version_android:Joi.string().required(),
//         is_update_ios:Joi.number().required(),
//         is_update_android:Joi.number().required(),
//     }
// }),
loginController.updateAppVersionDetails
)

/**
 * @swagger
 * /admin/verify-otp:
 *   post:
 *     description: api used for verify-otp to admin
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              phone_number:
 *                type: string
 *                required: true
 *              country_code:
 *                type: string
 *                required: true
 *              otp:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/admin/verify-otp',
Auth.storeDbInRequest,
expressJoi({body: {
            phone_number:Joi.string().required(),
            country_code : Joi.string().required(),
            otp : Joi.string().required()
    }
}),
loginController.verifyOtp
)

/**
 * @swagger
 * /admin/resend-otp:
 *   post:
 *     description: api used for resend-otp to admin
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: falsesectionAuthorityData
 *          schema:
 *            type: object
 *            properties: 
 *              phone_number:
 *                type: string
 *                required: true
 *              country_code:
 *                type: string
 *                required: true
 *     responses:
 *       200:
 *         description: success!
 */
app.post('/admin/resend-otp',
Auth.storeDbInRequest,
expressJoi({body: {
            phone_number:Joi.string().required(),
            country_code : Joi.string().required()
    }
}),
loginController.resendOtp
)

}