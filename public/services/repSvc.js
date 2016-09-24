var app = angular.module('rRApp');

app.service('whoismyrepsvc', function ($http) {


  this.findRepresentativesByState = function (state) {
    console.log('hit whoismyrepsvc', state);
    return $http({
      method: 'GET',
      url: '/representatives/' + state
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (err) {
        return err.data;
      });
  };

  this.findSenatorsByState = function(state) {
    console.log('hit findSenatorsByState whoismyrepsvc', state);
    return $http({
      method: 'GET',
      url: '/senators/' + state
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (err) {
        return err.data;
      });
  }

});