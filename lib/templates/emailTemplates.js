const contactUsEmail = (business_name,
    colorTheme,
    logo_url,
    emailId,
    phoneNumber,
    countryCode)=>{
        
        var subject = ''+business_name+'- User contact us';
        var emailTemplate=`<!DOCTYPE html>
        <html>
        <head>
            <title>${business_name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        </head>
        <body style="font-family: Segoe UI, Roboto, Helvetica Neue,Helvetica, Arial,sans-serif; background: #fff;  max-width: 700px;  margin:40px 10px; padding: 0px; border-radius: 15px; display:table; margin: 15px auto;">
        
               <table  cellspacing="0" cellpanding="0" style="max-width:700px;  border-collapse: collapse; border-radius: 15px; border: 1px solid #eee;">
                    <tr>
                    <td style="padding: 0px;">
                   
                        <table style="width:100%; border-collapse: collapse;background-color: ${colorTheme}; " cellspacing="0" cellpanding="0">
                            <tbody>
                                <tr>
                                    <td style="padding: 10px 20px;"> 
                                       <!--  <img src=${logo_url} alt="" 
                                         style="display: inline-block; width: 100px; margin:0 0 0px; "> -->
                                         <h2 style="color:#fff;margin:0;">Contact Us</h2>
                                         <p style="color:#fff;">You Have Received Contact Us Email as Per Below Details</p>
                                    </td>
                                    
                                </tr>
                            </tbody>
                        </table>        
                        <table style="width: 100%; ">
                            <tbody>
                                <tr>
                                     <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                                        <h5>UserDetails Detail !</h5>
                                    </td>
                                </tr>  
                                <tr>
                                     <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                                        <strong>User Email: <span style="font-weight:normal;">${emailId}</span> </strong>
                                    </td>
                                </tr>  
                                <tr>
                                     <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                                        <strong>Mobile Number: <span style="font-weight:normal;">${countryCode}${phoneNumber}</span> </strong>
                                    </td>
                                </tr>              
                            </tbody>
                        </table>`
    
    
                            let footer=`
                        <table style="width:100%; border-collapse: collapse;background-color: #fff;text-align:center; " cellspacing="0" cellpanding="0">
                            <tbody>
                                <tr>
                                    <td style="text-align: left; width: 0%;padding:10px 20px;">
                                        <h5>What happens Next?</h5>
                                    </td>
                                    
                                </tr>
                            </tbody>
                        </table>  
                  </td>
               </tr>
             </table>
                   
        </body>
        </html>`
    
        emailTemplate=emailTemplate+footer;
    return {template:emailTemplate,subject:subject}
       
}


const allUserEmailOnSupplierRegisteration = (business_name,
    colorTheme,
    logo_url,
    emailId,
    phoneNumber,
    countryCode)=>{
        
        var subject = ''+business_name+'- new Supplier Registered';
        var emailTemplate=`<!DOCTYPE html>
        <html>
        <head>
            <title>${business_name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        </head>
        <body style="font-family: Segoe UI, Roboto, Helvetica Neue,Helvetica, Arial,sans-serif; background: #fff;  max-width: 700px;  margin:40px 10px; padding: 0px; border-radius: 15px; display:table; margin: 15px auto;">
        
               <table  cellspacing="0" cellpanding="0" style="max-width:700px;  border-collapse: collapse; border-radius: 15px; border: 1px solid #eee;">
                    <tr>
                    <td style="padding: 0px;">
                   
                        <table style="width:100%; border-collapse: collapse;background-color: ${colorTheme}; " cellspacing="0" cellpanding="0">
                            <tbody>
                                <tr>
                                    <td style="padding: 10px 20px;"> 
                                       <!--  <img src=${logo_url} alt="" 
                                         style="display: inline-block; width: 100px; margin:0 0 0px; "> -->
                                         <h2 style="color:#fff;margin:0;">Contact Us</h2>
                                         <p style="color:#fff;">New supplier Just registered to out platform, Below is the details of Supplier.</p>
                                    </td>
                                    
                                </tr>
                            </tbody>
                        </table>        
                        <table style="width: 100%; ">
                            <tbody>
                                <tr>
                                     <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                                        <h5>Supplier Detail !</h5>
                                    </td>
                                </tr>  
                                <tr>
                                     <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                                        <strong>Supplier Email: <span style="font-weight:normal;">${emailId}</span> </strong>
                                    </td>
                                </tr>  
                                <tr>
                                     <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                                        <strong>Mobile Number: <span style="font-weight:normal;">${countryCode}${phoneNumber}</span> </strong>
                                    </td>
                                </tr>              
                            </tbody>
                        </table>`
    
    
                            let footer=`
                        <table style="width:100%; border-collapse: collapse;background-color: #fff;text-align:center; " cellspacing="0" cellpanding="0">
                            <tbody>
                                <tr>
                                    <td style="text-align: left; width: 0%;padding:10px 20px;">
                                        <h5>What happens Next?</h5>
                                    </td>
                                    
                                </tr>
                            </tbody>
                        </table>  
                  </td>
               </tr>
             </table>
                   
        </body>
        </html>`
    
        emailTemplate=emailTemplate+footer;
    return {template:emailTemplate,subject:subject}
       
}

const allUserEmailOnPromoCodeRegisteration = (business_name,
    colorTheme,
    logo_url,
    PromoCode
    )=>{
        
        var subject = ' '+business_name+'- Promo Code added. ';
        var emailTemplate=`<!DOCTYPE html>
        <html>
        <head>
            <title>${business_name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        </head>
        <body style="font-family: Segoe UI, Roboto, Helvetica Neue,Helvetica, Arial,sans-serif; background: #fff;  max-width: 700px;  margin:40px 10px; padding: 0px; border-radius: 15px; display:table; margin: 15px auto;">
        
               <table  cellspacing="0" cellpanding="0" style="max-width:700px;  border-collapse: collapse; border-radius: 15px; border: 1px solid #eee;">
                    <tr>
                    <td style="padding: 0px;">
                   
                        <table style="width:100%; border-collapse: collapse;background-color: ${colorTheme}; " cellspacing="0" cellpanding="0">
                            <tbody>
                                <tr>
                                    <td style="padding: 10px 20px;"> 
                                       <!--  <img src=${logo_url} alt="" 
                                         style="display: inline-block; width: 100px; margin:0 0 0px; "> -->
                                         <h2 style="color:#fff;margin:0;">Contact Us</h2>
                                         <p style="color:#fff;">New Promo Code just added to our platform.</p>
                                    </td>
                                    
                                </tr>
                            </tbody>
                        </table>        
                        <table style="width: 100%; ">
                            <tbody>
                                <tr>
                                     <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                                        <h5>Promo Code Detail !</h5>
                                    </td>
                                </tr>  
                                <tr>
                                     <td style="text-align: left; padding:0px 15px 8px; width: 100%; ">
                                        <strong>Promo Code : <span style="font-weight:normal;">${PromoCode}</span> </strong>
                                    </td>
                                </tr>              
                            </tbody>
                        </table>`
    
    
                            let footer=`
                        <table style="width:100%; border-collapse: collapse;background-color: #fff;text-align:center; " cellspacing="0" cellpanding="0">
                            <tbody>
                                <tr>
                                    <td style="text-align: left; width: 0%;padding:10px 20px;">
                                        <h5>What happens Next?</h5>
                                    </td>
                                    
                                </tr>
                            </tbody>
                        </table>  
                  </td>
               </tr>
             </table>
                   
        </body>
        </html>`
    
        emailTemplate=emailTemplate+footer;
    return {template:emailTemplate,subject:subject}
       
}
module.exports={
    contactUsEmail:contactUsEmail,
    allUserEmailOnSupplierRegisteration:allUserEmailOnSupplierRegisteration,
    allUserEmailOnPromoCodeRegisteration:allUserEmailOnPromoCodeRegisteration
}