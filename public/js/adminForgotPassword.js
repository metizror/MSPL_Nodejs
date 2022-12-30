$(document).ready(function () {
    var email = getParameterByName('email');
    var dbName = getParameterByName('dbName');
    var id = getParameterByName('id');

    // ############# ajax call to check link is valid or not   ####################

    var url = window.location.origin;

    $.ajax({
        type: "POST",
        url: url + '/v1/verify',
        dataType: "JSON",
        data: {
            "id":id,
            "email":email,
            "dbName":dbName
        },
        success: function (response) {

            if (response['statusCode'] == 400 || response['statusCode'] == 404 || response['statusCode'] == 443){

                $("fieldset").text('Invalid Link!');
                $('fieldset').show();
                $("fieldset").addClass('alert alert-danger');
                $(".alert").show();
            }
            
            else if (response['status'] == 500) {

                $("fieldset").text('Link Expired! ');
                $('fieldset').show();
                $("fieldset").addClass('alert alert-danger');
                $(".alert").show();
            }
             else if (response['statusCode'] == 200) {
                //$("fieldset").text(response['message']);
                $('fieldset').show();
                //$("fieldset").addClass('alert alert-danger');
                //$(".alert").show();
            } else {
                $('fieldset').show();
            }
        },
        error: function (response) {
            $("fieldset").text('Invalid link or link has been expired.');
            $("fieldset").addClass('alert alert-danger');
            $(".alert").show();
        }
    });

    /*$("#menu_upload_form").submit(function( event ) {
     if($.trim($('#menu_file').val()).length){
     $("#menu_upload_form").trigger('submit');
     } else {
     $('.alert-danger').text("Select a file.");
     $(".alert").show();
     return false;
     }
     });*/

    $('#btn1').on("click", function () {

        if ($('#password').val() == '' || $('#password').val() == null) {
            $('.alert-danger').text("Password can't be blank.");
            $(".alert").show();
            return false;
        }

        else if ($('#password').val().length < 6) {
            $('.alert-danger').text("Password must be of at least 6 characters.");
            $(".alert").show();
            return false;
        }

        else if ($('#confirm_password').val() == '' || $('#confirm_password').val() == null) {
            $('.alert-danger').text("Confirm password can't be blank.");
            $(".alert").show();
            return false;
        }

        else if ($('#password').val() != $('#confirm_password').val()) {
            $('.alert-danger').text("Your password does not match.");
            $(".alert").show();
            return false;
        }

        else {
            $.ajax({
                type: "POST",
                url:url + '/v1/updatePassword', 
              
                dataType: "JSON",
                data: {
                    'id':id,
                    'email':email,
                    'password': $('#password').val(),
                    'dbName':dbName
                },
                success: function (response) {

                    if (response['statusCode'] == 400) {
                        $(".alert-danger").text('Invalid link or link has been expired.');
                        $(".alert").show();
                    }
                    else {
                        $("fieldset").text('Password changed successfully.');
                        $("fieldset").addClass('alert alert-success');
                        $(".alert").show();
                    }

                },
                error: function (response) {
           
                    $(".alert-danger").text('Something went wrong');
                    $(".alert").show();
                }
            });
        }
    });
});


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}
