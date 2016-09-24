angular.module('rRApp').service('listingSvc', function ($http) {

  this.cancelTimeslot = function (listingShowing) {
    return $http({
      method: 'POST',
      url: '/listing/cancelTimeslot',
      data: listingShowing
    }).then(function (response) {
      return response.data;
    }).catch(function (err) {
      console.log(err.data);
      return err.data
    })
  }

  this.uncancelTimeslot = function (listingShowing) {
    return $http({
      method: 'POST',
      url: '/listing/uncancelTimeslot',
      data: listingShowing
    }).then(function (response) {
      return response.data;
    }).catch(function (err) {
      console.log(err.data);
      return err.data;
    })
  };

  this.createListing = function (listing) {
    return $http({
      method: 'POST',
      url: '/listing/create',
      data: listing
    })
      .then(function (response) {
        console.log(response.data);
        return response.data;
      });
  };
  
  this.editListing = function (update) {
    console.log('edit listing', update);
    return $http({
      method: 'PUT',
      url: '/listing/editListing/' + update.listingId,
      data: update
    })
      .then(function (response) {
        console.log("response: ", response.data);
        return response.data;
      });
  };

  this.getListingById = function (listingId) {
    return $http({
      method: 'GET',
      url: '/listing/getlisting/' + listingId
    })
      .then(function (response) {
        return (response.data);
      })
  }

  this.getListingByAgentId = function (params, config) {
    $http.post('http://104.236.170.136/washington/webservices/agents.php', params, config)
      .then(function (response) {
        console.log('Data', response.data.data);
        return response.data.data;
      }, function (err) {
        console.log('Error', err);
      });
  },

    this.getListings = function (agent) {
      return $http({
        method: 'GET',
        url: '/listing/agentListings/' + agent
      })
        .then(function (response) {
          return response.data;
        })
        .catch(function (err) {
          return false;
        });
    };

});