var BannerController=require('../../controller/admin/BannerController')
var Auth=require('../../lib/Auth')
// var category=require('../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /admin/update_banner_advertisement:
 *   post:
 *     description: For Updating an banners
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: order
 *         required: false
 *         type: number
 *       - in: formData
 *         name: isBottom
 *         required: false
 *         type: number
 *       - in: formData
 *         name: website_image
 *         required: false
 *         type: file
 *       - in: formData
 *         name: phone_image
 *         required: false
 *         type: file  
 *       - in: formData
 *         name: startDate
 *         required: true
 *         type: string
 *       - in: formData
 *         name: endDate
 *         required: false
 *         type: string
 *       - in: formData
 *         name: activeStatus
 *         required: false
 *         type: number  
 *       - in: formData
 *         name: categoryId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: branch_id
 *         required: false
 *         type: number  
 *       - in: formData
 *         name: website_image_url
 *         required: false
 *         type: string
 *       - in: formData
 *         name: phone_image_url
 *         required: false
 *         type: string
 *       - in: formDate
 *         name: banner_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/update_banner_advertisement',
multipartMiddleware,
Auth.authenticateAccessToken,
Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
BannerController.Update
)

/**
 * @swagger
 * /supplier/update_banner_advertisement:
 *   post:
 *     description: For Updating an banners
 *     tags:
 *       - Supplier API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: order
 *         required: false
 *         type: number
 *       - in: formData
 *         name: website_image
 *         required: false
 *         type: file
 *       - in: formData
 *         name: phone_image
 *         required: false
 *         type: file  
 *       - in: formData
 *         name: startDate
 *         required: true
 *         type: string
 *       - in: formData
 *         name: endDate
 *         required: false
 *         type: string
 *       - in: formData
 *         name: activeStatus
 *         required: false
 *         type: number  
 *       - in: formData
 *         name: categoryId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: branch_id
 *         required: false
 *         type: number  
 *       - in: formData
 *         name: isBottom
 *         required: false
 *         type: number
 *       - in: formData
 *         name: website_image_url
 *         required: false
 *         type: string
 *       - in: formData
 *         name: phone_image_url
 *         required: false
 *         type: string
 *       - in: formDate
 *         name: banner_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/supplier/update_banner_advertisement',
multipartMiddleware,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
BannerController.Update
)

/**
 * @swagger
 * /admin/update_default_banner:
 *   post:
 *     description: For Updating an banners
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: order
 *         required: false
 *         type: number
 *       - in: formData
 *         name: website_image
 *         required: false
 *         type: file
 *       - in: formData
 *         name: phone_image
 *         required: false
 *         type: file  
 *       - in: formData
 *         name: startDate
 *         required: true
 *         type: string
 *       - in: formData
 *         name: endDate
 *         required: false
 *         type: string
 *       - in: formData
 *         name: activeStatus
 *         required: false
 *         type: number  
 *       - in: formData
 *         name: categoryId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: branch_id
 *         required: false
 *         type: number  
 *       - in: formData
 *         name: website_image_url
 *         required: false
 *         type: string
 *       - in: formData
 *         name: phone_image_url
 *         required: false
 *         type: string
 *       - in: formDate
 *         name: banner_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/update_default_banner',
multipartMiddleware,
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
BannerController.UpdateDefaulBanner
)

/**
 * @swagger
 * /admin/delete_default_banner:
 *   post:
 *     description: For Updating an banners
 *     tags:
 *       - Admin API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: accessToken
 *         required: true
 *         type: string
 *       - in: formData
 *         name: sectionId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: supplierId
 *         required: true
 *         type: number
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: languageId
 *         required: true
 *         type: string
 *       - in: formData
 *         name: order
 *         required: false
 *         type: number
 *       - in: formData
 *         name: website_image
 *         required: false
 *         type: file
 *       - in: formData
 *         name: phone_image
 *         required: false
 *         type: file  
 *       - in: formData
 *         name: startDate
 *         required: true
 *         type: string
 *       - in: formData
 *         name: endDate
 *         required: false
 *         type: string
 *       - in: formData
 *         name: activeStatus
 *         required: false
 *         type: number  
 *       - in: formData
 *         name: categoryId
 *         required: false
 *         type: number
 *       - in: formData
 *         name: branch_id
 *         required: false
 *         type: number  
 *       - in: formData
 *         name: website_image_url
 *         required: false
 *         type: string
 *       - in: formData
 *         name: phone_image_url
 *         required: false
 *         type: string
 *       - in: formDate
 *         name: banner_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/admin/delete_default_banner',
// Auth.authenticateAccessToken,
// Auth.checkforAuthorityofThisAdmin,
Auth.checkCblAuthority,
Auth.storeDbInRequest,
BannerController.deleteDefaulBanner
)


}