angular.module('rRApp')
    .controller('billingCtrl', function ($scope, $state, userSvc, user, stripeSvc) {
        setTimeout(function() {
            $(window).scrollTop(0);
        });
      
        $scope.currentUser = user._id;

        $scope.ccLast4 = user.cardLast4;
        console.log('user',user);

        userSvc.getUserById($scope.currentUser)
            .then(function (response) {
                $scope.agent = response;
                console.log($scope.agent);
            });

      $scope.logginOut = function () {
        $state.go('splash')
      };
      
        $scope.handleStripe = function (status, response) {
            if (response.error) {
            } else {
                stripeSvc.updateCreditCard({user: user, token: response})
                    .then(function (response) {
                        console.log(response);
                    })
            }
        };

        $scope.deleteAccount = function () {
            console.log('in your account, deleting it');
            stripeSvc.deleteUserAccount(user)
                .then(function (response) {
                    console.log(response);
                    alert('your account has been deleted');
                    userSvc.loggingOut()
                        .then(function () {
                            $scope.logginOut()
                        })
                })
        }

    });