/**
 * Created by root on 6/5/16.
 */
// var Clikat = angular.module("Clikat",[]);
Clikat.service('services', ['$http', 'constants', function ($http, constants) {

    this.loginService = function ($scope, param_data, callback) {

        var data = {};
        data.email = param_data.username;
        data.password = param_data.password;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/admin_login',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.getAllCategory = function ($scope, callback) {

        var data = {};


        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_all_category',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };

    this.getAllCountry = function ($scope, param_data, callback) {

        var data = {};

        data.languageId = param_data.languageId;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_all_country',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.getAllCity = function ($scope, param_data, callback) {

        var data = {};

        data.languageId = param_data.languageId;
        data.countryId = param_data.countryId;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_all_city',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };

    this.getAllZone = function ($scope, param_data, callback) {

        var data = {};

        data.languageId = param_data.languageId;
        data.cityId = param_data.cityId;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_all_zone',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };


    this.getAllArea = function ($scope, param_data, callback) {

        var data = {};

        data.languageId = param_data.languageId;
        data.zoneId = param_data.zoneId;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_all_area',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.supplierDetails = function ($scope, param_data, callback) {

        var data = {};

        data.languageId = param_data.languageId;
        data.supplierId = param_data.supplierId;
        data.branchId = param_data.branchId;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/supplier_details',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.getSupplierList = function ($scope, param_data, callback) {

        var data = {};

        data.languageId = param_data.languageId;
        data.areaId = param_data.areaId;
        data.categoryId = param_data.categoryId;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_supplier_list',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.subcategoryListing = function ($scope, param_data, callback) {

        var data = {};

        data.languageId = param_data.languageId;
        data.supplierId = param_data.supplierId;
        data.categoryId = param_data.categoryId;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/subcategory_listing',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.customerRegisterStepFirst = function ($scope, param_data, callback) {

        var data = {};

       data.email= param_data.email ;
      data.deviceToken=  param_data.deviceToken ;
       data.deviceType= param_data.deviceType;
       data.password= param_data.password ;
       data.latitude= param_data.latitude;
        data.areaId= param_data.areaId;
        data.longitude= param_data.longitude ;
        data.languageId= param_data.languageId;

        $http({
            method: 'POST',
            url: constants.BASEURL + '/customer_register_step_first',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.customerRegisterStepSecond = function ($scope, param_data, callback) {

        var data = {};

        data.accessToken= param_data.accessToken ;
        data.countryCode=  param_data.countryCode ;
        data.mobileNumber= param_data.mobileNumber;


        $http({
            method: 'POST',
            url: constants.BASEURL + '/customer_register_step_second',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.checkOtp = function ($scope, param_data, callback) {

        var data = {};

        data.accessToken= param_data.accessToken ;
        data.otp=  param_data.otp ;
        data.languageId=  param_data.languageId ;



        $http({
            method: 'POST',
            url: constants.BASEURL + '/check_otp',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.customerRegisterStepThird = function ($scope, param_data, callback) {

        var formData = new FormData();
        formData.append("accessToken", param_data.accessToken);
        formData.append("name", param_data.name);
        formData.append("profilePic", param_data.profilePic);

        $.ajax({
            type: "POST",
            url: constants.BASEURL + '/customer_register_step_third',
            dataType: "json",
            data: formData,
            async: false,
            processData: false,
            contentType: false,
            success: function (data) {
                // if (data.status == constants.SUCCESS) {
                    callback(data);
                // } else {
                //
                //     factories.invalidDataPop(data.message);
                // }
            },
            error: function (error) {

                // factories.invalidDataPop("We are working on it, will be back after some time ");
            }

        })
    };
    this.login = function ($scope, param_data, callback) {

        var data = {};

        data.email= param_data.email ;
        data.password=  param_data.password ;
        data.deviceToken= param_data.deviceToken;
        data.deviceType= param_data.deviceType;


        $http({
            method: 'POST',
            url: constants.BASEURL + '/login',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.customerAddNewAddress = function ($scope, param_data, callback) {

        var data = {};

        data.landmark= param_data.landmark ;
        data.areaId=  param_data.areaId ;
        data.addressLineSecond= param_data.addressLineSecond;
        data.addressLineFirst= param_data.addressLineFirst;
        data.pincode= param_data.pincode;
        data.accessToken= param_data.accessToken;


        $http({
            method: 'POST',
            url: constants.BASEURL + '/add_new_address',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.getAllCustomerAddress = function ($scope, param_data, callback) {

        var data = {};


        data.accessToken= param_data.accessToken;


        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_all_customer_address',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.deleteCustomerAddress = function ($scope, param_data, callback) {

        var data = {};


        data.accessToken= param_data.accessToken;
        data.addressId= param_data.addressId;


        $http({
            method: 'POST',
            url: constants.BASEURL + '/delete_customer_address',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.editAddress = function ($scope, param_data, callback) {

        var data = {};

        data.landmark= param_data.landmark ;
        data.areaId=  param_data.areaId ;
        data.addressId=  param_data.addressId ;
        data.addressLineSecond= param_data.addressLineSecond;
        data.addressLineFirst= param_data.addressLineFirst;
        data.pincode= param_data.pincode;
        data.accessToken= param_data.accessToken;


        $http({
            method: 'POST',
            url: constants.BASEURL + '/edit_address',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };

    this.getProducts = function ($scope, param_data, callback) {

        var data = {};

        data.supplierBranchId= param_data.supplierBranchId ;
        data.languageId=  param_data.languageId ;
        data.countryId=  param_data.countryId ;
        data.subCategoryId= param_data.subCategoryId;



        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_products',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.getProductDetails = function ($scope, param_data, callback) {

        var data = {};

        data.accessToken= param_data.accessToken ;
        data.languageId=  param_data.languageId ;
        data.productId=  param_data.productId ;




        $http({
            method: 'POST',
            url: constants.BASEURL + '/get_product_details',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.addToCart = function ($scope, param_data, callback) {

        var data = {};

        data.accessToken= param_data.accessToken ;
        data.supplierBranchId=  param_data.supplierBranchId ;
        data.remarks=  param_data.remarks ;
        data.productList=  param_data.productList ;




        $http({
            method: 'POST',
            url: constants.BASEURL + '/add_to_cart',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.updateCartInfo = function ($scope, param_data, callback) {

        var data = {};

        data.accessToken= param_data.accessToken ;
        data.cartId=  param_data.cartId ;
        data.deliveryType=  param_data.deliveryType ;
        data.deliveryId=  param_data.deliveryId ;
        data.postPoneDate=  param_data.postPoneDate ;
        data.pickupTime=  param_data.pickupTime ;
        data.pickupId=  param_data.pickupId ;




        $http({
            method: 'POST',
            url: constants.BASEURL + '/update_cart_info',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };
    this.imageResize = function ($scope, param_data, callback) {

        var data = {};

        data.path= param_data.path ;
        data.width=  param_data.width ;
        data.height=  param_data.height ;





        $http({
            method: 'POST',
            url: constants.BASEURL + '/image_resize',
            contentType: 'application/json',
            data: data
        }).success(function (data) {
            // if (data.status == constants.SUCCESS) {
            callback(data);
            // } else {

            // $scope.loading = 0;

            // }
        }).error(function (error) {


        });
    };

}]);