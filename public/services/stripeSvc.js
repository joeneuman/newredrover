angular.module('rRApp').service('stripeSvc', function ($http) {

    this.createSubscription = function (payment) {
        return $http({
            method: 'POST',
            url: '/stripe/createUserSubscription',
            data: payment
        })
            .then(function (responses) {
                return responses.data;
            })
    };

    this.updateCreditCard = function (user) {
        console.log("in service update CC: ", user);
        return $http({
            method: 'PUT',
            url: '/stripe/updateCard/' + user.user._id,
            data: user
        })
            .then(function (responses) {
                return responses.data;
            })
    };
    
    this.deleteUserAccount = function(user) {
        console.log('stripe delete func', user);
        return $http({
            method: 'POST',
            url: '/stripe/deleteAccount/',
            data: user
        })
            .then(function (responses) {
                return responses.data;
            })
    }

});