angular.module('rRApp')
    .controller('forgotPasswordCtrl', function ($scope, $state, twilioSvc) {
        setTimeout(function() {
            $(window).scrollTop(0);
        })
        $scope.cancel = function() {
            $state.go('login');
        };

        $scope.submitResetPassword = function(user) {
            if (!$scope.user.phoneNum) {
                return;
            }
            if ($scope.user.phoneNum) {
                $scope.user.phoneNum = $scope.user.phoneNum.replace(/[^0-9]+?/g, '')    
            }
            if ($scope.user.phoneNum.length < 10) {
                alert('Please check that your phone number is correct and in the right format.')
                return;
            }
            user.phoneNum = '1' + user.phoneNum.toString();
            twilioSvc.resetPassword(user)
                .then(function(response) {
                    console.log(response);
                })
        }

        $scope.phoneNumCheckTest = function (event) {
            if ($scope.user.phoneNum) {
                $scope.user.phoneNum = $scope.user.phoneNum.replace(/[^0-9]+?/g, '')    
            }
            
            var element = $("#phoneNum");
            var len = element.val().length + 1;
            var max = element.attr("maxlength");
            if (!(len <= max)) {
                event.preventDefault();
                return false;
            }
        }

    });