angular.module('rRApp')
  .controller('signupTwilioCtrl', function ($scope, $state, user, userSvc, twilioSvc) {
    setTimeout(function() {
        $(window).scrollTop(0);
    })

    $scope.agentId = user._id;
    console.log(user);

    // $scope.areaCode = "";

    //get twilioNumber by email 
    $scope.checkNumber = function () {
      console.log('hit checking numbers');
      if (!user.twilioNumber) {
        twilioSvc.checkTwilioNumber({user: user}, $scope.agentId)
          .then(function (response) {
            console.log(response);
            if (response) {
              for (var i = 0; i < response.incomingPhoneNumbers.length; i++) {
                console.log('looping through numbers');
                if (response.incomingPhoneNumbers[i].friendlyName === user.email) {
                  user.twilioNumber === response.incomingPhoneNumbers[i].phoneNumber;
                  //update user
                    console.log('updating users twilio number');
                    userSvc.editUserById(user, $scope.agentId)
                      .then(function (response) {
                        console.log('user updated', response);
                        // $state.go('listingagent');
                        // $scope.redirectLA();
                      });
                  };
                  break;
                }
              } else {
              alert('Please pick a new number');
            }
          })
      }
    }
    $scope.checkNumber();

    $scope.getNewNumber = function (areaCode) {
      if (!areaCode) {
        alert('please select an area code')
      } else {
        twilioSvc.findNumber({areaCode: areaCode, user: user}, $scope.agentId)
          .then(function (response) {
            console.log('response', response);
            $scope.twilioNumbers = response.availablePhoneNumbers;
          })
      }
    }

    $scope.purchaseNewNumber = function (twilioNumber) {
      if (user.twilioNumber) {
        $state.go('listingagent');
      }
      else if (!user.twilioNumber) {
        console.log('user before add twilioNumber: ', user);
        twilioSvc.buyNumber({twilioNumber: twilioNumber, user: user}, $scope.agentId)
          .then(function (response) {
            if (response) {
              // alert('success, your new number is ', response);
              alert("Success, your new number is", twilioNumber);
              $state.go('listingagent');
            }
            else {
              alert('There are currently no numbers available with that area code. Please choose another'
                + ' area code');
            }
          })
      }
    }

    $scope.skip = function () {
      if (user.mls && user.agentId) {
        $state.go('listingagent')
      } else {
        $state.go('mlssignup');
      }
    }

  });