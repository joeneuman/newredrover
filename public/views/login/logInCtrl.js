angular.module('rRApp').controller('logInCtrl',
    function ($scope, $state, $timeout, userSvc) {
        setTimeout(function() {
            $(window).scrollTop(0);
        })
        $scope.errorMessage = '';
        
        $scope.user = {
            password: 'p',
            email: 'p@p.com'
        };

        $scope.logOut = function () {
            userSvc.loggingOut()
                .then(function () {
                })
        }
        $scope.logOut();

        $scope.submitLogin = function (userLog) {
            var userObj = {
                password: userLog.password,
                email: userLog.email.toLowerCase()
            };
            userSvc.login(userObj)
                .then(function (response) {
                    if (response === false) {
                        $scope.errorMessage = 'Email or password incorrect. Please try again...';
                        $timeout(function () {
                            $scope.errorMessage = '';
                            $scope.$apply();
                        }, 4000);
                    } else if (response && !response.twilioNumber) {
                        $state.go('twiliosignup');
                    } else if (response && response.twilioNUmber && !response.mls) {
                        $state.go('mlssignup');
                    } else if (response && response.twilioNumber && response.mls) {
                        $state.go('listingagent');
                    }
            });
        }

        $scope.loginUser = function () {
            $state.go('login');
        }
        $scope.createUser = function () {
            $state.go('addagent');
        }
        $scope.cancel = function() {
            $state.go('splash')
        }


})
