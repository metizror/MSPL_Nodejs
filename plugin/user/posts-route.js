var Auth=require('../../lib/Auth')
var category=require('../../routes/category')
const Joi = require('joi')
const expressJoi = require('express-joi-validator');
const postsController=require('../../controller/user/postsController');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports=(app)=>{
/**
 * @swagger
 * /user/create_post:
 *   post:
 *     description: For Creating an post
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: heading
 *         required: true
 *         type: string
 *       - in: body
 *         name: description
 *         required: true
 *         type: string
 *       - in: body
 *         name: supplier_id
 *         required: false
 *         type: number
 *       - in: body
 *         name: product_id
 *         required: false
 *         type: number
 *       - in: body
 *         name: branch_id
 *         required: false
 *         type: number
 *       - in: body
 *         name: user_id
 *         required: true
 *         type: number
 *       - in: body
 *         name: post_images
 *         required: false
 *         type: array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/create_post', 
Auth.storeDbInRequest,
// Auth.userAuthenticate,
expressJoi({body: {
            heading: Joi.string().required(),
            description:Joi.string().required(),
            product_id:Joi.number().optional().allow(""),
            supplier_id:Joi.number().optional().allow(""),
            branch_id:Joi.number().optional().allow(""),
            user_id:Joi.number().required(),
            post_images:Joi.array().optional().allow([])
    }
}),
postsController.createPost
);

/**
 * @swagger
 * /user/update_post:
 *   put:
 *     description: For updating an post
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: heading
 *         required: true
 *         type: string
 *       - in: body
 *         name: description
 *         required: true
 *         type: string
 *       - in: body
 *         name: supplier_id
 *         required: false
 *         type: number
 *       - in: body
 *         name: product_id
 *         required: false
 *         type: number
 *       - in: body
 *         name: branch_id
 *         required: false
 *         type: number
 *       - in: body
 *         name: id
 *         required: true
 *         type: number
 *       - in: body
 *         name: post_images
 *         required: false
 *         type: array
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.put('/user/update_post', 
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({body: {
            heading: Joi.string().required(),
            description:Joi.string().required(),
            product_id:Joi.number().optional().allow(""),
            supplier_id:Joi.number().optional().allow(""),
            branch_id:Joi.number().optional().allow(""),
            post_images:Joi.array().optional().allow([]),
            id:Joi.number().required()
    }
}),
postsController.updatePost
);

/**
 * @swagger
 * /user/get_posts:
 *   get:
 *     description: api used for getting posts
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *       - in: query
 *         name: user_id
 *         required: false
 *         type: number
 *       - in: query
 *         name: is_trending
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/get_posts',
    // Auth.userAuthenticate,
    Auth.checkCblAuthority,
    Auth.storeDbInRequest,
    expressJoi({
        query:
            {
                limit:Joi.number().optional().allow(""),
                offset:Joi.number().optional().allow(""),
                user_id:Joi.number().optional().allow(""),
                is_trending:Joi.number().optional().allow()
            }
    }),
    postsController.getPosts
)


/**
 * @swagger
 * /user/post_details:
 *   get:
 *     description: api used for getting posts
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/post_details',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    expressJoi({
        query:
            {
                id:Joi.number().required()
            }
    }),
    postsController.postDetails
)

/**
 * @swagger
 * /user/post/delete/:id:
 *   delete:
 *     description: For deleting an post
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.delete('/user/post/delete/:id', 
Auth.storeDbInRequest,
// Auth.userAuthenticate,
// expressJoi({body: {
//             heading: Joi.string().required(),
//             description:Joi.string().required(),
//             supplier_id:Joi.number().required(),
//             branch_id:Joi.number().required(),
//             user_id:Joi.number().required(),
//             post_images:Joi.array().required()
//     }
// }
// ),
postsController.deletePost
);

/**
 * @swagger
 * /admin/post/delete:
 *   put:
 *     description: For deleting an post
 *     tags:
 *       - User API`S
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
app.put('/admin/post/delete', 
Auth.storeDbInRequest,
// Auth.userAuthenticate,
expressJoi({body: {
            id:Joi.number().required()
    }
}
),
postsController.deletePostByAdmin
);


/**
 * @swagger
 * /user/add_comment:
 *   post:
 *     description: For adding comment on an post
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: comment
 *         required: true
 *         type: string
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
app.post('/user/add_comment', 
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({body: {
            comment: Joi.string().required(),
            id: Joi.number().required()
    }
}),
postsController.addPostComment
);

/**
 * @swagger
 * /user/update_comment:
 *   post:
 *     description: For update comment on an post
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: comment
 *         required: true
 *         type: string
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
app.post('/user/update_comment', 
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({body: {
            comment: Joi.string().required(),
            id: Joi.number().required()
    }
}),
postsController.updatePostComment
);

/**
 * @swagger
 * /user/delete_comment:
 *   post:
 *     description: For delete comment on an post
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: comment
 *         required: true
 *         type: string
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
app.post('/user/delete_comment', 
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({body: {
            id: Joi.number().required()
    }
}),
postsController.deletePostComment
);

/**
 * @swagger
 * /user/add_like:
 *   post:
 *     description: For adding like on an post
 *     tags:
 *       - User API`S
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
app.post('/user/add_like', 
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({body: {
            id: Joi.number().required(),
    }
}),
postsController.addPostLike
);

/**
 * @swagger
 * /user/remove_like:
 *   post:
 *     description: For adding like on an post
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: post_id
 *         required: true
 *         type: number
 *       - in: body
 *         name: user_id
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/remove_like', 
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({body: {
            post_id: Joi.number().required(),
            user_id: Joi.number().required()
    }
}),
postsController.removePostLike
);

/**
 * @swagger
 * /user/get_post_comments:
 *   get:
 *     description: api used for getting posts
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/get_post_comments',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    expressJoi({
        query:
            {
                limit:Joi.number().optional().allow(""),
                offset:Joi.number().optional().allow(""),
                post_id : Joi.number().required()
            }
    }),
    postsController.getPostComments
)

/**
 * @swagger
 * /user/get_post_likes_users_list:
 *   get:
 *     description: api used for getting posts
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/get_post_likes_users_list',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    expressJoi({
        query:
            {
                limit:Joi.number().optional().allow(""),
                offset:Joi.number().optional().allow(""),
                post_id : Joi.number().required()
            }
    }),
    postsController.getPostLikeUsers
)

/**
 * @swagger
 * /user/post_report:
 *   post:
 *     description: For posting report
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: post_id
 *         required: true
 *         type: number 
 *       - in: body
 *         name: user_id
 *         required: true
 *         type: number 
 *       - in: body
 *         name: heading
 *         required: true
 *         type: string 
 *       - in: body
 *         name: description
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/post_report', 
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({body: {
            post_id: Joi.number().required(),
            user_id: Joi.number().required(),
            heading: Joi.string().required(),
            description: Joi.string().required(),
    }
}),
postsController.addReport
);

/**
 * @swagger
 * /admin/list_reports:
 *   get:
 *     description: api used for getting posts
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/admin/list_reports',
    // Auth.userAuthenticate,
    Auth.checkCblAuthority,
    expressJoi({
        query:
            {
                limit:Joi.number().optional().allow(""),
                offset:Joi.number().optional().allow("")
            }
    }),
    postsController.listReports
)

/**
 * @swagger
 * /user/block_unblock_user:
 *   post:
 *     description: For block the user
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: blocked_by_user_id
 *         required: true
 *         type: number
 *       - in: body
 *         name: blocked_user_id
 *         required: true
 *         type: number
 *       - in: body
 *         name: is_block
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.post('/user/block_unblock_user', 
Auth.storeDbInRequest,
Auth.userAuthenticate,
expressJoi({body: {
            blocked_by_user_id: Joi.number().required(),
            blocked_user_id: Joi.number().required(),
            is_block : Joi.number().required()
    }
}),
postsController.blockUnblockUser
);


/**
 * @swagger
 * /user/get_blocked_users:
 *   get:
 *     description: api used for getting posts
 *     tags:
 *       - User API`S
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         type: number
 *       - in: query
 *         name: offset
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: encypt
 *         schema:
 *           $ref: '#/definitions/Stock'
 */
app.get('/user/get_blocked_users',
    Auth.userAuthenticate,
    Auth.checkCblAuthority,
    expressJoi({
        query:
            {
                limit:Joi.number().optional().allow(""),
                offset:Joi.number().optional().allow("")
            }
    }),
    postsController.getBlockUsers
)


}