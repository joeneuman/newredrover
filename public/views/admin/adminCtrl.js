angular.module('rRApp')
  .controller('adminCtrl', function ($scope, userSvc) {
    setTimeout(function () {
      $(window).scrollTop(0);
    });
    $scope.listingAgents = [];

    $scope.getListingAgents = function () {
      userSvc.getAllListingAgents()
        .then(function (response) {
          $scope.listingAgents = response;
        });
    };

    $scope.getListingAgents();
  });