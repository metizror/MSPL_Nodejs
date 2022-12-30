const request = require("request");
// const API_KEY = 'MzE5ZjAxNzEtNTQ2OS00ZTViLTk5MzgtMDZmNzYwODExMDlkOjgyN2U5ZjMwLWVlMWQtNDBlNy04YWJkLWQ1M2RjZGFlYjdiNw==';
// const OUTLET = 'b3a6cff6-bbbb-4a58-93a8-8c2cfd9ea010';

// live 
const API_KEY = 'NmExNDRkNGYtZTM5Zi00MzcxLWE2MjctYWFkZTlkMDcyNDhiOjBkMDA2ZDNhLWEzY2ItNDhlMS1iMzFiLWNlMzc5Njc5YzMxMQ=='; // live
const OUTLET = '52485272-7cfb-4020-8355-b2dd309167bb';

const getAccessToken = () => {
    // const url = "https://identity-uat.ngenius-payments.com/auth/realms/ni/protocol/openid-connect/token";

    const url = "https://identity.ngenius-payments.com/auth/realms/NetworkInternational/protocol/openid-connect/token"; // live
    var options = {
        method: 'POST',
        url: url,
        headers:
        {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'BASIC: ' + API_KEY
        },
        json: true,
        form: { grant_type: 'client_credentials' }
    };

    return new Promise((resolve, reject)=>{
        request(options, function (error, response, body) {
            //    const a = JSON.parse(body);
            if (error){ 
                reject(error);
            };
            resolve(body.access_token);
        });
    });
    
};
// skip3ds=true
const createOrder = async(orderObj) => {

    // const url = " https://api-gateway-uat.ngenius-payments.com/transactions/outlets/" + OUTLET + "/orders?skip3ds=true";
    const url = "https://api-gateway.ngenius-payments.com/transactions/outlets/" + OUTLET + "/orders?skip3ds=true";

    const access_token = await getAccessToken();

    console.log(access_token);
    console.log(url);

  

    const requestData = {
        'action': 'SALE',
        'amount': orderObj.amount,
        'emailAddress': orderObj.emailAddress,
        'merchantOrderReference': orderObj.merchantOrderReference,
        'merchantAttributes': {
            'redirectUrl': orderObj.redirectUrl,
            'cancelUrl':orderObj.cancelUrl, 'cancelText': 'Cancel', 'skipConfirmationPage': true
        },
        'billingAddress':orderObj.billingAddress
    };
    var options = {
        method: 'POST',
        url: url,
        headers:
        {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            'Accept': 'application/vnd.ni-payment.v2+json',
            Authorization: 'Bearer ' + access_token
        },
        json: true,
        json: requestData,
    };


    return new Promise((resolve, reject)=>{
        request(options, function (error, response, body) {
            if (error){ 
                reject(error);
            };
            const result = {
                'payment_href': body['_links']['payment']['href'],
                'reference': body.reference
            };
            console.log(result);
            console.log(JSON.stringify(body));
            resolve(result);
        });
    });

   
};
// https://developers.bluesnap.com/docs/test-credit-cards
/*
 pan: "4263982640269299",
        expiry: "2021-06",
        cvv: "123",
        "cardholderName": "John Brown"
*/

const getOrderDetail = async (orderReference, cb) => {
    order = '52485272-7cfb-4020-8355-b2dd309167bb';
    // const orderReference = '34410d2e-9aa3-40a2-bafa-5cac9d434a5e';
    // const url = "https://api-gateway-uat.ngenius-payments.com/transactions/outlets/" + order + "/orders/" + orderReference ;
    const url = "https://api-gateway.ngenius-payments.com/transactions/outlets/" + order + "/orders/" + orderReference ;
    
    const access_token = await getAccessToken();
    // console.log('access_token',access_token);
    
    console.log(url);

    var options = {
        method: 'GET',
        url: url,
        headers:
        {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            'Accept': 'application/vnd.ni-payment.v2+json',
            Authorization: 'Bearer ' + access_token
        },
        json: true
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        // console.log(body);
        cb(null, body);
        //   return result;
    });
};
module.exports = {
  
    createOrder,

    getOrderDetail
}