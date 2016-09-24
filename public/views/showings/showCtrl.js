/*angular.module('rRApp').directive('showingsDir', function () {

    return {
        restrict: 'AE',
        templateUrl: './views/showings/showTempt.html',
        scope: {},
        controller: function ($scope, $state, authService, listingSvc) {*/


            angular.module('rRApp').controller('showCtrl',
             function ($scope, $state, authService, user, listingSvc) {
            setTimeout(function() {
                $(window).scrollTop(0);
            })
            // angular.module('rRApp').controller('showCtrl',
            //     function ($scope, $state, authService, user, listingSvc) {

            // $scope.companyName = user.companyName;
            // $scope.agentId = user._id;
            // $scope.agentListings = [];
            // $scope.listings = [];
            // $scope.companyName = {};
            // $scope.listingToEdit = {};
            
            $scope.listingId = $state.params.listingId;

            $scope.getListing = function () {
                listingSvc.getListingById($scope.listingId)
                    .then(function (response) {
                        $scope.listing = response;
                    })
            }
            $scope.getListing();
            /*$scope.getListing = function () {
             /!*var agentId = user._id;
             listingSvc.getListings(agentId)
             .then(function (response) {
             $scope.listings = response;
             });*!/

             /!*$scope.getSellers();*!/
             // $scope.getShowings = function() {
             showingSvc.getShowingByListing($state.params.listingId)
             // console.log($state.params.listingId)
             .then(function (response) {
             $scope.showings = response;
             });
             // }
             }*/
        // }
    // }
});




