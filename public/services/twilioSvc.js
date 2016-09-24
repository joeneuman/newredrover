/**
 * Created by brandonhebbert on 3/24/16.
 */
angular.module('rRApp').service('twilioSvc', function ($http) {


    /*request new showing*/
    this.newShowing = function (newRequest) {
        console.log('hit newShowing function in twilioSvc');
        return $http({
            method: 'POST',
            url: '/twilio/newShowingRequest',
            data: newRequest
        })
            .then(function (response) {
                return response.data;
            })
    };

    this.findNumber = function (areaCodeUser, userId) {
        console.log('twi service', areaCodeUser);
        return $http({
            method: 'POST',
            url: '/twilio/findNumber/' + userId,
            data: areaCodeUser
        })
            .then(function (response) {
                return response.data;
            })
    }

    this.checkTwilioNumber = function (user, userId) {
        console.log('twi service', user);
        return $http({
            method: 'POST',
            url: '/twilio/checkNumber/' + userId,
            data: user
        })
          .then(function (response) {
              return response.data;
          })
    }

    this.buyNumber = function (newNumber, userId) {
        console.log('twi service purchase number', newNumber);
        return $http({
            method: 'POST',
            url: '/twilio/buyNumber/' + userId,
            data: newNumber
        })
          .then(function (response) {
              return response.data;
          })
    };

    this.resetPassword = function(user) {
        return $http({
            method: 'POST',
            url: '/twilio/changePassword',
            data: user
        })
            .then(function (response) {
                return response.data;
            })
    };

    this.sendUrlToSeller = function(userUrl) {
        console.log('hit service sendUrltoSeller',userUrl);
        return $http({
            method: 'POST',
            url: '/twilio/sendUrlToSeller',
            data: userUrl
        })
          .then(function (response) {
              console.log(response.data);
              return response.data;
          })
    }
});


