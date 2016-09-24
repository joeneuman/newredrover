angular.module('rRApp')
    .service('authService', function ($http, $state) {

        this.currentUser = function () {
            return $http({
                method: 'GET',
                url: '/user/current'
            })
                .then(function (response) {
                    return response.data;
                })
                .catch(function (err) {
                    return err.data;
                });
        };
    });