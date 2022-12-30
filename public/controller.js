/**
 * Created by root on 6/5/16.
 */
var Clikat = angular.module("Clikat",[]);

Clikat.constant('constants', {
    APPNAME: 'Clikat',
    /** Local Url **/
    // BASEURL: 'http://192.168.100.114:3000',
    /** Server Url **/
    //Test Server..
    BASEURL: 'http://localhost:8081',
    //Live Server..
    // BASEURL: 'http://clikat.com:3000',
    SUCCESS: 4,
    ERROR: 2,
    ACCESSTOKEN: localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : "",

    //CATRGORIES DATA
    CAT_HOME: 1,
    CAT_PROFILE: 2,
    CAT_PRODUCTION: 3,
    CAT_ORDERS: 4,
    CAT_ACCOUNT: 5,
    CAT_REPORTS: 6,
    CAT_SETTINGS: 7,

    //SECTIONS DATA
    SEC_ONE: 1,
    SEC_TWO: 2,
    SEC_THREE: 3,
    SEC_FOUR: 4,
    SEC_FIVE: 5,
    SEC_SIX: 6,
    SEC_SEVEN: 7,
    SEC_EIGHT: 8,
    SEC_NINE: 9,
    SEC_TEN: 10,
    SEC_ELEVEN: 11,
    SEC_TWELVE: 12,
    SEC_THIRTEEN: 13,
    SEC_FOURTINE: 14,
    SEC_FIFTINE: 15,
    SEC_SIXTEEN: 16
});

Clikat.controller('apiCtrl', ['$scope','$rootScope', 'services',  function ($scope, $rootScope, services) {
    $scope.show=1;
    // $scope.showResponse =

    $scope.login = {};
    $scope.loginSubmit = function () {

        //Call Login Service
        var param_data = {};
        param_data.username = $scope.login.username;
        param_data.password = $scope.login.password;
        services.loginService($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;
            }
        );
    }
    $scope.allCategory = function () {

        //Call Login Service


        services.getAllCategory($scope, function (data) {

                console.log(data);
                $scope.showResponse = data;
            }
        );
    }

    $scope.country = {};
    $scope.allCountry = function () {
       

        //Call Login Service
        var param_data = {};
  
        param_data.languageId = $scope.country.languageId;
        services.getAllCountry($scope, param_data, function (data) {

                console.log(data);
                $scope.showResponse = data;
            }
        );
    }
    $scope.city = {};
    $scope.allCity = function () {

        //Call Login Service
        var param_data = {};

        param_data.languageId = $scope.city.languageId;
        param_data.countryId = $scope.city.countryId;
        services.getAllCity($scope, param_data, function (data) {

                console.log(data);
                $scope.showResponse = data;
            }
        );
    }
    $scope.zone = {};
    $scope.allZone = function () {

        //Call Login Service
        var param_data = {};

        param_data.languageId = $scope.zone.languageId;
        param_data.cityId = $scope.zone.cityId;
        services.getAllZone($scope, param_data, function (data) {

                console.log(data);
                $scope.showResponse = data;
            }
        );
    }

    $scope.area = {};
    $scope.allArea = function () {

        //Call Login Service
        var param_data = {};

        param_data.languageId = $scope.area.languageId;
        param_data.zoneId = $scope.area.zoneId;
        services.getAllArea($scope, param_data, function (data) {

                console.log(data);
                $scope.showResponse = data;
            }
        );
    }
    $scope.supplierInfo = {};
    $scope.supplierDetails = function () {

        //Call Login Service
        var param_data = {};

        param_data.languageId = $scope.supplierInfo.languageId;
        param_data.supplierId = $scope.supplierInfo.supplierId;
        param_data.branchId = $scope.supplierInfo.branchId;
        services.supplierDetails($scope, param_data, function (data) {

                console.log(data);
                $scope.showResponse = data;
            }
        );
    }
    $scope.supplierList = {};
    $scope.supplierList = function () {

        //Call Login Service
        var param_data = {};

        param_data.languageId = $scope.supplierList.languageId;
        param_data.areaId = $scope.supplierList.areaId;
        param_data.categoryId = $scope.supplierList.categoryId;
        services.getSupplierList($scope, param_data, function (data) {

                console.log(data);
                $scope.showResponse = data;
            }
        );
    }
    $scope.subcategoryList = {};
    $scope.subcategoryListing = function () {

        //Call Login Service
        var param_data = {};

        param_data.languageId = $scope.subcategoryList.languageId;
        param_data.supplierId = $scope.subcategoryList.supplierId;
        param_data.categoryId = $scope.subcategoryList.categoryId;
        services.subcategoryListing($scope, param_data, function (data) {

                console.log(data);
                $scope.showResponse = data;
            }
        );
    }




$scope.adminData= {};
    $scope.adminHomeData=function () {
        var param_data = {};
        param_data.section_id = $scope.adminData.sectionId ;
        param_data.filter_type = $scope.adminData.filterType;
        param_data.accessToken= $scope.adminData.accessToken;
        services.getHomePageData($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

                });

            }
    $scope.stepFirst= {};
    $scope.customerRegisterStepFirst=function () {
        var param_data = {};
        param_data.email = $scope.stepFirst.email ;
        param_data.deviceToken = $scope.stepFirst.deviceToken;
        param_data.deviceType= $scope.stepFirst.deviceType;
        param_data.password = $scope.stepFirst.password;
        param_data.latitude= $scope.stepFirst.latitude;
        param_data.areaId= $scope.stepFirst.areaId;
        param_data.longitude = $scope.stepFirst.longitude;
        param_data.languageId= $scope.stepFirst.languageId;
        services.customerRegisterStepFirst($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }


    $scope.stepSecond= {};
    $scope.customerRegisterStepSecond=function () {
        var param_data = {};
        param_data.accessToken = $scope.stepSecond.accessToken ;
        param_data.countryCode = $scope.stepSecond.countryCode;
        param_data.mobileNumber= $scope.stepSecond.mobileNumber;
    
        services.customerRegisterStepSecond($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

    $scope.checkOtp= {};
    $scope.checkOtp=function () {
        var param_data = {};
        param_data.accessToken = $scope.checkOtp.accessToken ;
        param_data.otp = $scope.checkOtp.otp;
        param_data.languageId = $scope.checkOtp.languageId;


        services.checkOtp($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }


    //an array of files selected
    $scope.files = [];
    $rootScope.image_file;
// /listen for the file selected event
    $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {
            //add the file object to the scope's files collection
            $scope.files.push(args.file);
        });
    });

    /* Get to be uploading file and set it into a variable and read to show it on view */
    $scope.file_to_upload_for_image = function (File) {
        $scope.FileUploaded = File[0];

        var file = File[0];
        $scope.image_file = File[0];
        var imageType = /image.*/;
        if (!file.type.match(imageType)) {

            factories.invalidDataPop("Invalid file type selected");
            console(file);
        }
    };

    $scope.stepThird= {};
    $scope.customerRegisterStepThird=function () {
        var param_data = {};
        param_data.accessToken = $scope.stepThird.accessToken ;
        param_data.name = $scope.stepThird.name;
        param_data.profilePic= $scope.image_file;
        console.log($scope.image_file);

        services.customerRegisterStepThird($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

    $scope.logIn= {};
    $scope.logIn=function () {
        var param_data = {};
        param_data.email = $scope.logIn.email ;
        param_data.password = $scope.logIn.password;
        param_data.deviceToken= $scope.logIn.deviceToken;
        param_data.deviceType= $scope.logIn.deviceType;

        services.login($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

    $scope.customerAddNewAddress= {};
    $scope.customerAddNewAddress=function () {
        var param_data = {};
        param_data.landmark = $scope.customerAddNewAddress.landmark ;
        param_data.areaId = $scope.customerAddNewAddress.areaId;
        param_data.pincode= $scope.customerAddNewAddress.pincode;
        param_data.addressLineSecond= $scope.customerAddNewAddress.addressLineSecond;
        param_data.addressLineFirst= $scope.customerAddNewAddress.addressLineFirst;
        param_data.accessToken= $scope.customerAddNewAddress.accessToken;


        services.customerAddNewAddress($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

    $scope.allCustomerAddress= {};
    $scope.allCustomerAddress=function () {
        var param_data = {};

        param_data.accessToken= $scope.allCustomerAddress.accessToken;


        services.getAllCustomerAddress($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }
    $scope.deleteCustomerAddress= {};
    $scope.deleteCustomerAddress=function () {
        var param_data = {};

        param_data.accessToken= $scope.deleteCustomerAddress.accessToken;
        param_data.addressId= $scope.deleteCustomerAddress.addressId;


        services.deleteCustomerAddress($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }
    $scope.editAddress= {};
    $scope.editAddress=function () {
        var param_data = {};
        param_data.landmark = $scope.editAddress.landmark ;
        param_data.areaId = $scope.editAddress.areaId;
        param_data.addressId = $scope.editAddress.addressId;
        param_data.pincode= $scope.editAddress.pincode;
        param_data.addressLineSecond= $scope.editAddress.addressLineSecond;
        param_data.addressLineFirst= $scope.editAddress.addressLineFirst;
        param_data.accessToken= $scope.editAddress.accessToken;


        services.editAddress($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }
    $scope.getProducts= {};
    $scope.getProducts=function () {
        var param_data = {};
        param_data.supplierBranchId = $scope.getProducts.supplierBranchId ;
        param_data.languageId = $scope.getProducts.languageId;
        param_data.countryId = $scope.getProducts.countryId;
        param_data.subCategoryId= $scope.getProducts.subCategoryId;



        services.getProducts($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

    $scope.getProductDetails= {};
    $scope.getProductDetails=function () {
        var param_data = {};
        param_data.accessToken = $scope.getProductDetails.accessToken ;
        param_data.languageId = $scope.getProductDetails.languageId;
        param_data.productId = $scope.getProductDetails.productId;




        services.getProductDetails($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

    $scope.addToCart= {};
    $scope.addToCart=function () {
        var param_data = {};
        param_data.accessToken = $scope.addToCart.accessToken ;
        param_data.supplierBranchId = $scope.addToCart.supplierBranchId;
        param_data.remarks = $scope.addToCart.remarks;
        param_data.productList = $scope.addToCart.productList;




        services.addToCart($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

    $scope.updateCartInfo= {};
    $scope.updateCartInfo=function () {
        var param_data = {};
        param_data.accessToken = $scope.updateCartInfo.accessToken ;
        param_data.cartId = $scope.updateCartInfo.cartId;
        param_data.deliveryType = $scope.updateCartInfo.deliveryType;
        param_data.deliveryId = $scope.updateCartInfo.deliveryId;
        param_data.postPoneDate = $scope.updateCartInfo.postPoneDate;
        param_data.pickupTime = $scope.updateCartInfo.pickupTime;
        param_data.pickupId = $scope.updateCartInfo.pickupId;





        services.updateCartInfo($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

    $scope.imageResize= {};
    $scope.imageResize=function () {
        var param_data = {};
        param_data.path = $scope.imageResize.path ;
        param_data.height = $scope.imageResize.height;
        param_data.width = $scope.imageResize.width;
    
        services.imageResize($scope, param_data, function (data) {

            console.log(data);
            $scope.showResponse = data;

        });

    }

}]);
