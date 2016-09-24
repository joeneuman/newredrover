angular.module('rRApp').controller('laCtrl',

  function ($scope, $state, $interval, authService, user, listingSvc, userSvc) {
    // console.log(user);
    $scope.companyName = user.companyName;
    $scope.agentId = user._id;
    $scope.agentListings = [];
    $scope.listings = [];
    $scope.listingToEdit = {};
    $scope.todayHolder = new Date().getDay(); //get day from 0 to 6 (today is 0)
    $scope.weekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $scope.dayAfterTomorrow = '';
    if (($scope.todayHolder + 2) <= $scope.weekArray.length - 1) {
      $scope.dayAfterTomorrow = $scope.weekArray[$scope.todayHolder + 2];
    } else {
      $scope.dayAfterTomorrow = $scope.weekArray[$scope.todayHolder - 5];
    }
    
    setTimeout(function () {
      $('#searchBar').blur(function () {
        $scope.showInput = false;
        $scope.$apply();
      })
/*<<<<<<< HEAD
    });
=======*/
    })

    $scope.toggleDropdown = function() {
      $('.dropdown').toggleClass('open');
    }

// >>>>>>> c87b4f035553820de89dd4c027fb3a10c4aae700
    $scope.listings.map(function (listing, listingIndex) {
      listing.upcommingShowings.map(function (showing, showingIndex) {
        if (new Date(showing.timeSlot).getDay() - $scope.todayHolder === 0) {
          listing.upcommingShowings[showingIndex].dayString = 'Today';
        } else if (new Date(showing.timeSlot).getDay() - $scope.todayHolder === 1) {
          listing.upcommingShowings[showingIndex].dayString = 'Tomorrow';
        } else if (new Date(showing.timeSlot).getDay() - $scope.todayHolder === 2) {
          listing.upcommingShowings[showingIndex].dayString = $scope.dayAfterTomorrow;
        }
      })
    });

    // $scope.getListing();

    /*$scope.response = [];
     $scope.officeId = "20081106224420599162000000";
     $scope.mlsId = '1';*/

    $scope.updateUserListings = function () { ////testing
      userSvc.editUserById(user._id, user)
        .then(function (response) {

        });
    };

    /*$scope.getData = function () {
     var params = ({
     // agent_id: '20130528172231442048000000',
     // agent_id: '20090105232626532639000000',
     agent_id: user.agentId,
     mls_id: user.mls
     //mls_id: agent.mls
     });
     var config = {
     headers: {
     'Content-Type': 'application/x-www-form-urlencoded;'
     }
     };
     /!*$scope.getListFromMls = function() {*!/
     listingSvc.getListingByAgentId(params, config)
     .then(function (response) {
     $scope.listings = response;
     console.log(response);
     });
     };*/

// $scope.getData();
    $scope.logOut = function () {
      userSvc.loggingOut()
        .then(function () {
          $scope.loggedIn = !$scope.loggedIn;
          $state.go('login');
        })
    };

    $scope.displayInput = function () {
      $scope.showInput = true;
      setTimeout(function () {
        $('#searchBar').focus();
      }, 0);

    };


    $scope.getListing = function () {
      var agentId = user.agentId;
      listingSvc.getListings(agentId)
        .then(function (response) {
          $scope.listings = response;
          $scope.listings.map(function (listing, listingIndex) {
            var rightNow = new Date().getTime();
            /*var difference = 260000000;
             listing.showings.map(function(showing) {
             if (new Date(showing.timeSlot).getTime() > rightNow && (new Date(showing.timeSlot).getTime() - rightNow < difference) && showing.status === 'confirmed') {
             difference = new Date(showing.timeSlot).getTime() - rightNow;
             listing.nextShowing = showing;
             console.log($scope.listings[listingIndex].nextShowing);
             }
             })*/
            listing.upcommingShowings = [];
            listing.showings.map(function (showing, showingIndex) {
              if (new Date(showing.timeSlot).getTime() > rightNow && showing.status === 'confirmed') {
                listing.upcommingShowings.push(showing);
              }
            })
          })
          $scope.listings.map(function (listing, listingIndex) {
            listing.upcommingShowings.map(function (showing, showingIndex) {
              if (new Date(showing.timeSlot).getDay() - $scope.todayHolder === 0) {
                listing.upcommingShowings[showingIndex].dayString = 'Today';
              } else if (new Date(showing.timeSlot).getDay() - $scope.todayHolder === 1) {
                listing.upcommingShowings[showingIndex].dayString = 'Tomorrow';
              } else if (new Date(showing.timeSlot).getDay() - $scope.todayHolder === 2) {
                listing.upcommingShowings[showingIndex].dayString = $scope.dayAfterTomorrow;
              }
            })
          })
        });
    };

    $scope.getListing();

    /*$scope.response = [];
     $scope.officeId = "20081106224420599162000000";
     $scope.mlsId = '1';*/

    $scope.updateUserListings = function () { ////testing
      userSvc.editUserById(user._id, user)
        .then(function (response) {

        });
    };

    /*$scope.getData = function () {
     var params = ({
     // agent_id: '20130528172231442048000000',
     // agent_id: '20090105232626532639000000',
     agent_id: user.agentId,
     mls_id: user.mls
     //mls_id: agent.mls
     });
     var config = {
     headers: {
     'Content-Type': 'application/x-www-form-urlencoded;'
     }
     };
     /!*$scope.getListFromMls = function() {*!/
     listingSvc.getListingByAgentId(params, config)
     .then(function (response) {
     $scope.listings = response;
     console.log(response);
     });
     };*/

// $scope.getData();

    $scope.billing = function () {
      $state.go('billing', {agentId: $scope.agentId});
    };

    $scope.addListing = function () {
      $state.go('addlisting');
    };

    $scope.editListing = function (listingId) {
      $state.go('editlisting', {id: listingId});
    };

    $scope.showRequest = function (listingId, seller) {
      if (!user.twilioNumber) {
        alert('You must have a twilio number before you can show your listings. Please sign up for a twilio number when you sign in.');
        return;
      }
      if (!seller) {
        alert('Must have a seller number attached to this listing to allow showing requests.');
        return;
      }
      $state.go('showingrequest', {listingId: listingId});
    };

    $scope.list = function (listingId) {
      // console.log(listing);
      // $scope.mlsListing = listing;
      $state.go('listing', {listingId: listingId});
    };

    $scope.sellerView = function (listingId) {
      $state.go('sellerview', {listingId: listingId});
    };

    $scope.showings = function (listingId) {
      $state.go('showings', {listingId: listingId})
    };

    $scope.editProfile = function () {
      $state.go('editprofile', {agentId: $scope.agentId});
    };
    $scope.changePassword = function () {
      $state.go('changepassword');
    }

    $scope.billing = function () {
      $state.go('billing', {agentId: $scope.agentId});
    };

    $scope.addListing = function () {
      $state.go('addlisting');
    };

    $scope.editListing = function (listingId) {
      $state.go('editlisting', {id: listingId});
    };

    $scope.showRequest = function (listingId, seller) {
      if (!seller) {
        alert('Must have a seller number attached to this listing to allow showing requests.');
        return;
      }
      $state.go('showingrequest', {listingId: listingId});
    };

    $scope.list = function (listingId) {
      // console.log(listing);
      // $scope.mlsListing = listing;
      $state.go('listing', {listingId: listingId});
    };

    $scope.sellerView = function (listingId) {
      $state.go('sellerview', {listingId: listingId});
    };

    $scope.showings = function (listingId) {
      $state.go('showings', {listingId: listingId})
    };

    $scope.editProfile = function () {
      $state.go('editprofile', {agentId: $scope.agentId});
    };
    $scope.changePassword = function () {
      $state.go('changepassword');
    }

    $interval(function () {
      var rightNow = new Date().getTime();
      $scope.listings.map(function (listing) {
        if (listing.upcommingShowings) {
          for (var i = listing.upcommingShowings.length - 1; i >= 0; i--) {
            if (new Date(listing.upcommingShowings[i].timeSlot).getTime() < rightNow) {
              listing.upcommingShowings.splice(i, 1);
            }
          }
        }
      })
    }, 3000);
  });

angular.module('rRApp').filter('tel', function () {
  return function (tel) {
    if (!tel) {
      return '';
    }

    var value = tel.toString().trim().replace(/^\+/, '');

    if (value.match(/[^0-9]/)) {
      return tel;
    }

    var country, city, number;

    switch (value.length) {
      case 10: // +1PPP####### -> C (PPP) ###-####
        country = 1;
        city = value.slice(0, 3);
        number = value.slice(3);
        break;

      case 11: // +CPPP####### -> CCC (PP) ###-####
        country = value[0];
        city = value.slice(1, 4);
        number = value.slice(4);
        break;

      case 12: // +CCCPP####### -> CCC (PP) ###-####
        country = value.slice(0, 3);
        city = value.slice(3, 5);
        number = value.slice(5);
        break;

      default:
        return tel;
    }

    if (country == 1) {
      country = "";
    }

    number = number.slice(0, 3) + '-' + number.slice(3);

    return (country + " (" + city + ") " + number).trim();
  };
});
