/**
 * Created by brandonhebbert on 4/18/16.
 */
angular.module('rRApp').controller('mlsCtrl',
    function ($scope, $state, userSvc, listingSvc) {
        setTimeout(function() {
            $(window).scrollTop(0);
        })
        $scope.errorMessage = ''
        $scope.user = userSvc.user;
        $scope.user.agentId = '';
        $scope.editUserAgentId = function () {
            console.log('signing up: ', $scope.user);
            userSvc.createAgent($scope.user)
                .then(function (response) {
                    console.log('response from create user: ', response);
                    if (!response) {
                        $scope.errorMessage = 'This ID is already in use by another user.';
                        setTimeout(function() {
                            $scope.errorMessage = '';
                            $scope.$apply();
                        }, 4000);
                        return;
                    }
                    userSvc.login({password: userSvc.user.password, email: userSvc.user.email})
                        .then(function (response) {
                            console.log('user is signed in', response);
                            userSvc.user = {};
                            $state.go('twiliosignup');
                        })
                });
        };
    });