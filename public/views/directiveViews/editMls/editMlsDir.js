/**
 * Created by brandonhebbert on 6/16/16.
 */


var app = angular.module('rRApp');

app.directive('editmlsdir', function() {
  return {
    templateUrl: './views/directiveViews/editMls/editMlsDir.html',
    restrict: 'E',
    scope: {
      showing: '='
    },
    /*link: function(scope, elem, attrs) {
    function () {
        
    }
      $('editmlsdir').css('visibility', toggle ? "hidden" : "visible");
      
    },*/

    controller: function ($scope, $state, userSvc, listingSvc) {
      $scope.user = userSvc.user;
      $scope.user.agentId = '';
      $scope.editmlsdir = false;

      $scope.toggleEditMlsDir = function() {
          $scope.editmlsdir = !$scope.editmlsdir;
      }

      $scope.editUserAgentId = function () {
        console.log('signing up: ', $scope.user);
        userSvc.createAgent($scope.user)
          .then(function (response) {
            console.log('user created', response);
            userSvc.login({password: userSvc.user.password, email: userSvc.user.email})
              .then(function (response) {
                console.log('user is signed in', response);
                userSvc.user = {};
                $state.go('twiliosignup');
              })
          });
      };
    }
  }
});