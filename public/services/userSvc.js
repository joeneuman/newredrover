angular.module('rRApp').service('userSvc', function ($http, $state) {


    this.user = {};

    this.login = function (userLogin) {
        return $http({
            method: 'POST',
            url: '/auth/login',
            data: userLogin
        })
            .then(function (response) {
                return response.data;
            })
            .catch(function(err) {
                return false;
            });
    };

    this.loggingOut = function () {
        return $http({
            method: 'GET',
            url: '/auth/logout',
        })
            .then(function (response) {
                return response.data;
            })
            .catch(function(err) {
                return false;
            });
    };

    this.checkEmail = function(email) {
        return $http({
            method: 'POST',
            url: 'user/checkEmail',
            data: email
        }).then(function(response) {
            return response.data;
        }).catch(function(err) {
            return err.data;
        });
    }

    this.phoneNumCheck = function(phoneNum) {
        return $http({
            method: 'POST',
            url: 'user/phoneNumCheck',
            data: phoneNum
        }).then(function(response) {
            return response.data;
        }).catch(function(err) {
            return err.data;
        })
    }
    
    this.currentUser = function () {
        return $http({
            method: 'GET',
            url: 'user/current'
        })
            .then(function (response) {
                // console.log(response);
                delete response.data.password;
                return response;
            })
            .catch(function (err) {
                $state.go('login');
            });
    };
    
    this.createAgent = function (agent) {
        return $http({
            method: 'POST',
            url: '/user/create',
            data: agent
        })
        .then(function (response) {
            return response.data;
        })
        .catch(function(err) {
            return err.data;
        });
    };

    this.getUserById = function(userId) {
        
        return $http({
            method: 'GET',
            url: '/user/getUser/' + userId
        })
            .then(function (response) {
                
                return response.data;
            });
    };

    this.getAllListingAgents = function() {
        return $http({
            method: 'GET',
            url: '/user/getUser'
        })
            .then(function (response) {
                
                return response.data;
            });
    };
    
    this.editUserById = function(userToEdit, user) {
        console.log('edit user: ', user, userToEdit);
        return $http({
            method: 'PUT',
            url: '/user/update/' + userToEdit,
            data: user
        })
            .then(function (response) {
                console.log("response: ", response.data);
                return response.data;
            });
    };
    
    this.editUserPassword = function(userToEdit, user) {
        console.log('edit user password: ', userToEdit, user);
        return $http({
            method: 'PUT',
            url: '/user/updateUserPassword/' + userToEdit,
            data: user
        })
            .then(function (response) {
                return response.data;
            });
    };

    this.createSeller = function (seller) {
        console.log('createseller function in service');
        return $http({
            method: 'POST',
            url: '/user/createSeller',
            data: seller
        })
            .then(function (response) {
                return response.data;
            })
            .catch(function(err) {
                return false;
            });
    };
});