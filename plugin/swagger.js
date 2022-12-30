var swaggerUI=require("swagger-ui-express")
var swaggerDocs=require("swagger-jsdoc")
var endpoint=require('./swagger-route')
// require('./')
const options = {
    swaggerDefinition: {
      // Like the one described here: https://swagger.io/specification/#infoObject
      info: {
        title: 'Cbl SAas APi`s ',
        version: '1.0.0',
        description: 'Cbl SAas APi`s',
      },
      securityDefinitions: {
        secretdbkey:{
          type: "apiKey",
          in: "header",
          name: "secretdbkey"
        },

        agent_db_secret_key:{
          type: "apiKey",
          in: "header",
          name: "agent_db_secret_key"
        },
        JWT:{
          type: "apiKey",
          in: "header",
          name: "Authorization"
        }
      },
      "security": [
        {
             "secretdbkey": [],
             "JWT":[],
             "agent_db_secret_key":[]
        }
    ]
    },
    // List of files to be processes. You can also set globs './routes/*.js'
    apis: [
    './plugin/swagger-route.js',
    './plugin/category-route.js',
    './plugin/variant-route.js',
    './plugin/product-route.js',
    './plugin/admin/product-route.js',
    './plugin/admin/agent-route.js',
    './plugin/admin/area-route.js',
    './plugin/user/area-route.js',
    './plugin/user/rating-route.js',
     './plugin/user/payment-route.js',
    './plugin/user/address-route.js',
    './plugin/user/agent-route.js',
    './plugin/user/referral_route.js',
    './plugin/supplier/product-route.js',
    './plugin/supplier/cat-route.js',
    './plugin/supplier/agent-route.js',
    './plugin/supplier/order-route.js',
    './plugin/supplier/gift-route.js',
    './plugin/supplier/branch-route.js',
    './plugin/admin/variant-route.js',
    './plugin/admin/brand-route.js',
    './plugin/admin/cat-route.js',
    './plugin/common-route.js',
    './plugin/user/order-route.js',
    './plugin/user/home-route.js',
    './plugin/admin/dashboard-route.js',
    './plugin/supplier/dashboard-route.js',
    './plugin/admin/pgateway-route.js',
    './plugin/admin/banner-route.js',
    './plugin/admin/password-route.js',
    './plugin/admin/promo-route.js',
    './plugin/admin/supplier-route.js',
    './plugin/admin/settings-route.js',
    './plugin/admin/terminologies-route.js',
    './plugin/admin/termsConditions-route.js',
    './plugin/admin/placeHolder-route.js',
    './plugin/admin/order-route.js',
    './plugin/admin/gift-route.js',
    './plugin/admin/login-route.js',
    './plugin/admin/subAdmin-route.js',
    './plugin/admin/cancellationPolicy-route.js',
    './plugin/supplier/profile-route.js',
    './plugin/supplier/subscription-route.js',
    './plugin/admin/subscription-route.js',
    './plugin/admin/loyality-route.js',
    './plugin/user/wallet-route.js',
    './plugin/user/loyality-route.js',
    './plugin/admin/surveymonkey-route.js',
    './plugin/user/posts-route.js',
    './plugin/user/promo-route.js',
    './plugin/admin/pos-route.js',
    './plugin/agent/service-route.js',
    './plugin/admin/deliveryCompanies-route.js',
    './plugin/admin/countryCodes-route.js',
    './plugin/admin/commision-route.js',
    './plugin/admin/branch-route.js',
    './plugin/admin/meeting-route.js',
  ],
  };
const specs=swaggerDocs(options);
module.exports=(app)=>{
    app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(specs));
}
