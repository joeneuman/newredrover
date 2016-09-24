var app = angular.module('rRApp');


app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('splash', {
            url: '/splash',
            templateUrl: './views/splash/splashTempt.html',
            controller: 'logInCtrl'
        })
        .state('login', {
            url: '/login',
            templateUrl: './views/login/logInTempt.html',
            controller: 'logInCtrl'
        })
        .state('forgotpassword', {
            url: '/forgotpassword',
            templateUrl: './views/forgotPassword/forgotPasswordTempt.html',
            controller: 'forgotPasswordCtrl'
        })
        .state('signup', {
            url: '/signup',
            templateUrl: './views/contactInfo/contactInfoTempt.html',
            controller: 'contactInfoCtrl'
        })
        .state('twiliosignup', {
            url: '/twiliosignup',
            templateUrl: './views/signupTwilioNumber/signupTwilioNumberTempt.html',
            controller: 'signupTwilioCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
        .state('mlssignup', {
            url: '/mlssignup',
            templateUrl: './views/mls/mlsTempt.html',
            controller: 'mlsCtrl',
        })
        .state('addlisting', {
            url: '/addlisting',
            templateUrl: './views/addListing/addListingTempt.html',
            controller: 'addListingCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
        .state('editlisting', {
            url: '/editlisting/:id',
            templateUrl: './views/editListing/editListingTempt.html',
            controller: 'editListingCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
        .state('addagent', {
            url: '/addagent',
            templateUrl: './views/addAgent/addAgentTempt.html',
            controller: 'addAgentCtrl'
        })
        .state('editprofile', {
            url: '/editprofile/:agentId',
            templateUrl: './views/editProfile/editProfileTempt.html',
            controller: 'editProfileCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
        .state('billing', {
            url: '/billing/:agentId',
            templateUrl: './views/billing/billingTempt.html',
            controller: 'billingCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
      .state('changepassword', {
          url: '/changepassword/:agentId',
          templateUrl: './views/changePassword/changePasswordTempt.html',
          controller: 'changePassword',
          /*resolve: {
              user: function (authService, $state) {
                  return authService.currentUser()
                    .then(function (response) {
                        if (!response) {
                            $state.go('login')
                        } else {
                            return response;
                        }
                    });
              }
          }*/
      })
        .state('admin', {
            url: '/admin',
            templateUrl: './views/admin/adminTempt.html',
            controller: 'adminCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
        .state('listingagent', {
            url: '/listingagent',
            templateUrl: './views/listingAgent/laTempt.html',
            controller: 'laCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
        .state('showingrequest', {
            url: '/showingrequest/:listingId',
            templateUrl: './views/showingRequest/showReqTempt.html',
            controller: 'showReqCtrl'
        })
        .state('showing2request', {
            url: '/showing2request/?listingId&timeSlot',
            templateUrl: './views/showingRequest2/showReq2Tempt.html',
            controller: 'showReq2Ctrl'
        })
        .state('listing', {
            url: '/listing:listingId',
            templateUrl: './views/listing/listingTempt.html',
            controller: 'listingCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
        .state('showings', {
            url: '/showings:listingId',
            templateUrl: './views/showings/showTempt.html',
            controller: 'showCtrl',
            resolve: {
                user: function (authService, $state) {
                    return authService.currentUser()
                        .then(function (response) {
                            if (!response) {
                                $state.go('login')
                            } else {
                                return response;
                            }
                        });
                }
            }
        })
        .state('sellerview', {
            url: '/sellerview/:listingId',
            templateUrl: './views/seller/sellerViewTempt.html',
            controller: 'sellerViewCtrl'
        });

    $urlRouterProvider
        .otherwise('/splash');
});