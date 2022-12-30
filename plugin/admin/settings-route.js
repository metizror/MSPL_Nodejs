
var settingController = require('../../controller/admin/SettingsController')
var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports=(app)=>{
/**
 * @swagger
 * /admin/addSettings:
 *   post:
 *     description: For updating settings
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: logo_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: banner_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: paymentType
 *          required: false
 *          type: string
 *        - in: formData
 *          name: app_color
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/addSettings',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({query: {
//                 product_id:Joi.number().required(),
//                 sectionId:Joi.string().optional().allow("")
//     }
// }),
settingController.addSettings
)

/**
 * @swagger
 * /admin/add_description_sections:
 *   post:
 *     description: For updating settings
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: logo_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: banner_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: paymentType
 *          required: false
 *          type: string
 *        - in: formData
 *          name: app_color
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/add_description_sections',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({query: {
//                 product_id:Joi.number().required(),
//                 sectionId:Joi.string().optional().allow("")
//     }
// }),
settingController.addSectionsDescriptions
)
/**
 * @swagger
 * /admin/addcolorPallets:
 *   post:
 *     description: admin add color Pallets
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: color_pallet_codes
 *          required: true
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/addcolorPallets',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                color_pallet_codes:Joi.string().required(),
    }
}),
settingController.addColorPalleteCodes
)

/**
 * @swagger
 * /admin/pickup_delivery_banner_update:
 *   post:
 *     description: For updating settings
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: logo_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: banner_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: paymentType
 *          required: false
 *          type: string
 *        - in: formData
 *          name: app_color
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/pickup_delivery_banner_update',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({query: {
//                 product_id:Joi.number().required(),
//                 sectionId:Joi.string().optional().allow("")
//     }
// }),
settingController.addPickUpDeliveryBanners
)



/**
 * @swagger
 * /admin/settings_list:
 *   get:
 *     description: For Brand list Api
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/settings_list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
settingController.settingsList
),
/**
 * @swagger
 * /admin/default_ddress/add:
 *   post:
 *     description: api used for adding an address
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
 *              address:
 *                     type: string
 *                     required: true
 *              latitude:
 *                     type: number
 *                     required: true 
 *              longitude:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.post('/admin/default_ddress/add',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            address:Joi.string().required(),
            latitude:Joi.number().required(),
            longitude:Joi.number().required()
    }
}),
settingController.addDefaultAddress
),
/**
 * @swagger
 * /admin/default_ddress/update:
 *   put:
 *     description: api used for updating an address
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
 *              address:
 *                     type: string
 *                     required: true
 *              id:
 *                     type: number
 *                     required: true
 *              latitude:
 *                     type: number
 *                     required: true 
 *              longitude:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.put('/admin/default_ddress/update',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            sectionId:Joi.number().required(),
            address:Joi.string().required(),
            latitude:Joi.number().required(),
            id:Joi.number().required(),
            longitude:Joi.number().required()
    }
}),
settingController.updateDefaultAddrss
),
/**
 * @swagger
 * /admin/currency/update:
 *   put:
 *     description: api used for updating an currency
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
 *              currencyName:
 *                     ty/admin/currency/addpe: string
 *                     required: true
 *              currencySymbol:
 *                     type: string
 *                     required: true
 *     responses:
 *       200:
 *         description: Success!
 */

app.put('/admin/currency/update',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            currencyName:Joi.string().required(),
            currencySymbol:Joi.string().required(),
            conversion_rate:Joi.number().required(),
            currency_description:Joi.string().required(),
            id:Joi.number().required(),
            country_name	: Joi.string().required()

           
    }
}),
settingController.updateCurrencyValue
)

/**
 * @swagger
 * /admin/currency/update:
 *   post:
 *     description: api used for updating an currency
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
 *              currencyName:
 *                     type: string
 *                     required: true
 *              currencySymbol:
 *                     type: string
 *                     required: true
 *     responses:
 *       200:
 *         description: Success!
 */

app.post('/admin/currency/add',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            currencyName:Joi.string().required(),
            currencySymbol:Joi.string().required(),
            conversion_rate:Joi.number().required(),
            currency_description:Joi.string().required(),
            country_name	: Joi.string().required()
           
    }
}),
settingController.addCurrencyValue
),


/**
 * @swagger
 * /admin/currency/delete:
 *   post:
 *     description: api used for updating an currency
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
 *              currencyName:
 *                     type: string
 *                     required: true
 *              currencySymbol:
 *                     type: string
 *                     required: true
 *     responses:
 *       200:
 *         description: Success!
 */

app.post('/admin/currency/delete',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
expressJoi({body: {
            id:Joi.number().required()
           
    }
}),
settingController.deleteCurrencyValue
),

/**
 * @swagger
 * /admin/currency/list:
 *   get:
 *     description: For Currency  list Api
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/currency/list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
settingController.currencyList
)
/**
 * @swagger
 * /admin/default_address/list:
 *   get:
 *     description: For Default Address list Api
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/default_address/list',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
settingController.listDefaultAddrs
)



/**
 * @swagger
 * /admin/update_user_types:
 *   post:
 *     description: For updating user types
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: logo_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: banner_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: paymentType
 *          required: false
 *          type: string
 *        - in: formData
 *          name: app_color
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/update_user_types',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({query: {
//                 product_id:Joi.number().required(),
//                 sectionId:Joi.string().optional().allow("")
//     }
// }),
settingController.updateUserTypes
)


/**
 * @swagger
 * /admin/add_user_types:
 *   post:
 *     description: For adding user types
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: logo_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: banner_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: paymentType
 *          required: false
 *          type: string
 *        - in: formData
 *          name: app_color
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/add_user_types',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({query: {
//                 product_id:Joi.number().required(),
//                 sectionId:Joi.string().optional().allow("")
//     }
// }),
settingController.addUserTypes
)


/**
 * @swagger
 * /admin/delete_user_types:
 *   post:
 *     description: For adding user types
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: logo_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: banner_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: paymentType
 *          required: false
 *          type: string
 *        - in: formData
 *          name: app_color
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/delete_user_types',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({query: {
//                 product_id:Joi.number().required(),
//                 sectionId:Joi.string().optional().allow("")
//     }
// }),
settingController.deleteUserTypes
)


/**
 * @swagger
 * /admin/list_user_types:
 *   get:
 *     description: For updating user types
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: logo_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: banner_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: paymentType
 *          required: false
 *          type: string
 *        - in: formData
 *          name: app_color
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/admin/list_user_types',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
// expressJoi({query: {
//                 product_id:Joi.number().required(),
//                 sectionId:Joi.string().optional().allow("")
//     }
// }),
settingController.listUserTypes
)
/**
 * @swagger
 * /admin/list_user_types:
 *   get:
 *     description: For updating user types
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: logo_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: banner_url
 *          required: false
 *          type: file
 *        - in: formData
 *          name: paymentType
 *          required: false
 *          type: string
 *        - in: formData
 *          name: app_color
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.get('/supplier/list_user_types',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
// Auth.checkCblAuthority,
Auth.storeDbInRequest,
// expressJoi({query: {
//                 product_id:Joi.number().required(),
//                 sectionId:Joi.string().optional().allow("")
//     }
// }),
settingController.listUserTypes
)

/**
 * @swagger
 * /admin/edit_user_details:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: loyalty_points
 *          required: false
 *          type: number
 *        - in: formData
 *          name: otp_verified
 *          required: true
 *          type: number
 *        - in: formData
 *          name: phone_number
 *          required: true
 *          type: string
 *        - in: formData
 *          name: country_code
 *          required: true
 *          type: string
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: iso
 *          required: true
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/edit_user_details',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                otp_verified:Joi.number().required(),
                phone_number:Joi.string().required(),
                country_code:Joi.string().required(),
                user_id:Joi.number().required(),
                iso:Joi.string().required(),
                user_type_id :Joi.number().optional().allow(""),
                loyalty_points :Joi.number().optional().allow(""),
                firstname :Joi.string().optional().allow(""),
                lastname :Joi.string().optional().allow(""),
                email :Joi.string().optional().allow(""),
    }
}),
settingController.editUserDetails
)

/**
 * @swagger
 * /admin/reset_user_password:
 *   post:
 *     description: For updating users
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: user_id
 *          required: true
 *          type: number
 *        - in: formData
 *          name: password
 *          required: true
 *          type: string
 *        - in: formData
 *          name: confirm_password
 *          required: false
 *          type: string
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/reset_user_password',
multipartMiddleware,
Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
                user_id:Joi.number().required(),
                password : Joi.string().required(),
                confirm_password:Joi.string().required()
    }
}),
settingController.updateUserPassword
)

/**
 * @swagger
 * /admin/activate_user_types:
 *   post:
 *     description: For activate User Types
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: default_id
 *          required: true
 *          type: number`
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/activate_user_types',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
Auth.authenticateAccessToken,
expressJoi({body: {
                is_active:Joi.number().required()
    }
}),
settingController.activateUserType
)

/**
 * @swagger
 * /admin/deactivate_user_types:
 *   post:
 *     description: For activate User Types
 *     tags:
 *       - Admin API`S
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: formData
 *          name: default_id
 *          required: true
 *          type: number`
 *     responses:
*       200:
 *         description: Success!
 */
app.post('/admin/deactivate_user_types',
Auth.checkCblAuthority,
Auth.storeDbInRequest,
Auth.authenticateAccessToken,
expressJoi({body: {
                is_active:Joi.number().required()
    }
}),
settingController.deactivateUserType
)
/**
 * @swagger
 * /admin/pickup/status:
 *   put:
 *     description: 0- delivery 1-pickup 2-both
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
 *              is_pickup_order:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.put('/admin/pickup/status',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            is_pickup_order:Joi.number().required()
    }
}),
settingController.changePickupStatus
)


/**
 * @swagger
 * /admin/active_deactive_supplier_scheduling:
 *   put:
 *     description: 0- delivery 1-pickup 2-both
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
 *              is_pickup_order:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.put('/admin/active_deactive_supplier_scheduling',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
            status:Joi.number().required()
    }
}),
settingController.activeDeactiveAllSuppilerScheduling
)


/**
 * @swagger
 * /admin/block_unblock_all_suppliers:
 *   put:
 *     description: 0- delivery 1-pickup 2-both
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
 *              is_pickup_order:
 *                     type: number
 *                     required: true 
 *     responses:
 *       200:
 *         description: Success!
 */

app.put('/admin/block_unblock_all_suppliers',
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
expressJoi({body: {
    is_block:Joi.number().required()
    }
}),
settingController.blockUnblockAllSuppliers
)



}
