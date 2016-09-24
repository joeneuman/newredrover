angular.module('rRApp').service('showingSvc', function ($http) {

    /*this.getShowingByListing = function (showingId) {
        return $http({
            method: 'GET',
            url: '/showing/getShowing/' + showingId
        })
            .then(function (response) {
                console.log("response: ", response.data);
                return response.data;
            });
    };*/

    this.confirmShowingRequest = function(listing) {
        console.log('in confirm svc');
        return $http.post('/showing/confirmShowingRequest', listing).then(function(response) {
            return response.data;
        })
    }
});