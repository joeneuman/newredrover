angular.module('rRApp').controller('listingCtrl',
    function ($scope, $state, authService, user, listingSvc) {
        setTimeout(function() {
            $(window).scrollTop(0);
        })
        $scope.listingToShow = $state.params.listingId;
        $scope.listingCtrlList = [];


        $scope.getListingById = function() {
            listingSvc.getListingById($scope.listingToShow)
                .then(function(response) {
                    $scope.thisListing = response;
                })
        }
        $scope.getListingById();
    });