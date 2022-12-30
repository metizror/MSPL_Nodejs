/**
 * Created by Paras on 19/4/16.
 */

var func = require('./commonfunction');
var async = require('async');
var sendResponse = require('./sendResponse');
var constant = require('./constant');
var loginFunctions = require('./loginFunctions');



exports.registerSupplierOnWebsite = function (req, res) {
    var email = req.body.email;
    var phoneNo = req.body.phoneNo;
    var name = req.body.name;
    var category = req.body.category;
    var manValues = [email, phoneNo, name, category];
    async.waterfall([
            function (cb) {
                func.checkBlank(res, manValues, cb);
            },
            function (cb) {
                var subject = "New Registration On Website";
                var content = "New Supplier Registration Details \n";
                    content+="Email : "+email +" \n";
                    content+="Phone Number : "+phoneNo +" \n";
                    content+="Name : "+name +" \n";
                    content+="Categories Interested in : "+category +" \n";
                func.sendMailthroughSMTP(res,cb,subject,config.get('EmailCredentials.email'),content,1);
            },
           function(cb){
               var subject = "Welcome To royo";
               var content ='<!DOCTYPE html>';

               content+='<html lang="en">';
               content+= '<head>';
               content+='<title>Coli</title>';
               content+= '<meta charset="utf-8">';
               content+='<meta name="viewport" content="width=device-width, initial-scale=1">';
               content+='<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">';
               content+='<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">';
               content+='<script src="http://code.jquery.com/jquery-1.9.1.js"></script>';
               content+= '<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>';
               content+= '</head>';

               content+='<body style="margin:0px;border:solid 1px;color:#5c5c5c;width:610px;">';
               content+='<div style="padding: 10px;border-bottom:2px solid #CCC">';
               content+= '<table  style="width:100%">';
               content+= '<tr>';
               content+= '<td>';
               content+= '<b> <p>Dear Valued Customer,</p></b>';
               content+='</td>';
               content+='<td style="text-align: right;padding-left:40px;">';
               content+=   '<b><p>عميلنا العزيز،</p></b>';
               content+= '</td>';
               content+= '</tr>';

               content+='<tr>';
               content+='<td>';
               content+='<p>Thank you for contacting the ProApp Marketing Management & Portal LLC in Dubai.</p>';
               content+='</td>';
               content+= '<td style="text-align: right;padding-left:40px;">';
               content+=  '<p> شكراً لتواصلكم مع بروآب للإدارة التسويقية والتعامل الالكتروني في دبي</p>';
               content+=  '</td>';
               content+='</tr>';

               content+='<tr>';
               content+= '<td>';
               content+='<p>We have received your e-mail and our Sales Team will contact you within 2 working days.</p>';
               content+='</td>';
               content+='<td style="text-align: right;padding-left:40px;">';
               content+='<p>نود إعلامكم بأنه قد تم استلام رسالتكم، فريق المبيعات سيقوم بالتواصل معكم خلال يومين عمل</p>';
               content+='</td>';
               content+='</tr>';

               content+='<tr>';
               content+='<td>';
               content+= '<b><p>NOTE: THIS IS AN AUTO GENERATED REPLY. PLEASE DO NOT REPLY TO THIS MESSAGE.</p></b>';
               content+= '</td>';
               content+='<td style="text-align: right;padding-left:40px;">';
               content+= '<b> <p>ملاحظة: هذه رسالة تلقائية، يرجى عدم الرد</p></b>';

               content+= '</td>';
               content+='</tr>';

               content+='<tr>';
               content+='<td>';
               content+='<p>Should you require any further details, please do not hesitate to contact us.</p>';
               content+= '</td>';
               content+='<td style="text-align: right;padding-left:40px;">';
               content+= '<p>لمزيد من المعلومات، يرجى عدم التردد في التواصل معنا</p>';

               content+='</td>';
               content+='</tr>';
               content+='</table>';
               content+='</div>';
               content+='<div style="padding: 10px;">';

               content+= '<table style="width:100%;padding-right:10px;" >';

               content+= '<tr>';
               content+=  '<td>';
               content+=  '<p>Working Time</p>';

               content+='</td>';
               content+= '<td style="text-align: right;padding-left:40px;">';
               content+=    '<p>اوقات العمل</p>';

               content+= '</td>';
               content+= '</tr>';

               content+='<tr>';
               content+='<td>';

               content+='<p><b>Contact Center |</b> Sunday to Thursday: 08:30 AM to 06:00 PM</p>';

               content+='</td>';
               content+= '<td style="text-align: right;padding-left:40px;">';
               content+=  '<p>مركز الاتصال | الأحد إلى الخميس: 08:30 صباحاً إلى 06:00 مساءاً </p>';

               content+='</td>';
               content+='</tr>';
               content+='<tr>';
               content+='<td>';
               content+= '<p> Saturday :   08:30 AM to 01:00 PM</p>';
               content+= '</td>';
               content+='<td style="text-align: right;padding-left:40px;">';
               content+= '<p>                       السبت               : 08:30 صباحاً إلى 01:00 مساءاً </p>';

               content+= '</td>';
               content+= '</tr>';
               content+= '<tr>';
               content+= '<td>';
               content+='<p><b>Head Office</b> (Silicon Oasis - Dubai) | Sunday to Thursday: 08:30 AM to 06:00 PM</p>';
               content+='</td>';
               content+='<td style="text-align: right;padding-left:40px;">';
               content+=  '<p>المبنى الرئيسي (واحة السيليكون - دبي)| الأحد إلى الخميس: 08:30 صباحاً إلى 06:00 مساءاً</p>';

               content+='</td>';
               content+='</tr>';
               content+= '<tr style="text-align: center;">';
               content+=  '<td colspan="2">';
               content+= '<a href="www.royo.com" >www.royo.com</a>';

               content+= '</td>';
               content+= '</tr>';

               content+='</table>';
               content+='<table>';
               content+= '<tr>';
               content+= '<td >';
               content+=  '<img src="http://royo-s3.s3.amazonaws.com/royo.jpg" class="img-responsive"  alt="Image preview...">';

               content+=  '</td>';
               content+=  '</tr>';
               content+=  '</table>';
               content+=  '</div>';
               content+=  '</body>';
               content+=  '</html>';

                   func.sendMailthroughSMTP(res,cb,subject,email,content,0);

           }
        ], function (error, result) {

            if (error) {
                sendResponse.somethingWentWrongError(res);
            }
            else {
                var data = []
                sendResponse.sendSuccessData(data, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
            }
        }
    );
}