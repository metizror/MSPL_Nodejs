var Auth = require('./lib/Auth');
var users_digidine = require('./routes/user-digidine');
// digidine

exports.setup= (app)=>{

    /*
POST: /signupOrLoginWithPhoneNumber
Parameters:
{
"deviceToken"	: "test",
"deviceType"	: "test",
"latitude"	: 0,
"longitude"	: 0,
"countryCode"	: "91",
"mobileNumber"	: "XXXXXXX"
	
}
    */

   app.post('/signupOrLoginWithPhoneNumber',Auth.checkCblAuthority, Auth.storeDbInRequest, users_digidine.signupOrLoginWithPhoneNumber);
//    Auth.checkCblAuthority, Auth.storeDbInRequest,
   app.post('/promoCodeList', Auth.checkCblAuthority, Auth.storeDbInRequest,users_digidine.promoCodeList);

};


