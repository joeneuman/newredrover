angular.module('rRApp')
  .controller('showReq2Ctrl', function ($scope, $state, twilioSvc, listingSvc, showingSvc, authService) {

    setTimeout(function () {
      $(window).scrollTop(0);
    });
    $scope.user = {};
    authService.currentUser().then(function (response) {
      $scope.user = response;
    });
    $scope.listingId = $state.params.listingId;
    $scope.timeSlot = new Date($state.params.timeSlot);
    $scope.phoneNumber = '14357671597';
    $scope.message = '';
    // $scope.modalShow = false;
    $scope.modalShow = true;
    $scope.name = {};
    $scope.sellers = [];
    $scope.showing = {};


    /*get listings by agentID*/
    $scope.getListing = function () {
      listingSvc.getListingById($scope.listingId)
        .then(function (response) {
          $scope.listing = response;
        })
    };
    $scope.getListing();


    /*request showing get confirmation number sent to you*/
    /*$scope.requestShowing = function (showing) {

      var phoneNumTest = $scope.showing.phoneNumber.replace(/[^0-9.]/g, "");
      if (phoneNumTest.length !== 10) {

        alert('Please ensure your phone number is in the correct format');
        return false;
      } else {
        $scope.showing.phoneNumber = '1' + phoneNumTest;

        /!*call twilioSvc.newShoing with argument: obj{showing:showing,listingId:$scope.listingId}*!/
        twilioSvc.newShowing({
          showing: showing,
          listingId: $scope.listingId
        }).then(function (response) {
          console.log('response from initial request', response);
          if (response === false) {
            $scope.message = 'Cannot use this phone number. Please try another.';
            setTimeout(function () {
              $scope.message = '';
              $scope.$apply();
            }, 5000);
          } else {
            $scope.modalShow = true;
          }
        });
      }

    };*/
/* confirm showing request by entering confirmation code*/
    $scope.confirmShowingRequest = function (showing) {
      /*console.log('in confirm');
      if ($scope.requestCode.toString().length !== 4) {
        $scope.message = 'Your code must be 4 digits long.';
        setTimeout(function () {
          $scope.message = '';
          $scope.$apply();
        }, 5000);
        return;
      }*/

      /*showing: showing,
       listingId: $scope.listingId*/
      console.log("showing: ", showing);
      console.log("$scope.timeSlot", $scope.timeSlot);
      console.log("$scope.listingId", $scope.listingId);
      showingSvc.confirmShowingRequest({
        listingId: $scope.listingId,
        // requestCode: $scope.requestCode,
        timeSlot: $scope.timeSlot,
        showing: $scope.showing
      }).then(function (response) {
        console.log(response);
        if (response === true) {
          $scope.message = 'Your request has been sent to the seller. Please wait for their confirmation.';
          setTimeout(function () {
            $scope.message = '';
            $scope.$apply();
            $scope.getOutOfHere();
            $scope.modalShow = false;
          }, 5000)
        } else if (response === 'already showing') {
          $scope.message = 'There is a showing request in progress for this time slot already. Please try another time.';
          setTimeout(function () {
            $scope.message = '';
            $scope.$apply();
            $scope.getOutOfHere();
            $scope.modalShow = false;
          }, 5000)
        } else if (response === 'added to queue') {
          $scope.message = 'Your request will be sent to the seller during the next regular hours. ';
          setTimeout(function () {
            $scope.message = '';
            $scope.$apply();
            $scope.getOutOfHere();
            $scope.modalShow = false;
          }, 5000)
        } else {
          $scope.message = 'Your code did not match. Please re-enter the code and click "Confirm" again.';
          setTimeout(function () {
            $scope.message = '';
            $scope.$apply();
          }, 5000)
        }
      }).then(function() {
          $scope.getOutOfHere();
      });
    };


      /*go to showing request*/
    $scope.getOutOfHere = function () {
      $state.go('showingrequest', {listingId: $scope.listingId});
    };

      /* number validation*/
    $scope.isNumberKey = function (event) {
      var element = $("#test");
      var len = element.val().length + 1;
      var max = Number(element.attr("maxlength"));
      var cond = (46 < event.which && event.which < 58) || (46 < event.keyCode && event.keyCode < 58);

      if (cond && len <= max) {
        return true;
      } else {
        event.preventDefault();
        return false;
      }
    };

    $('#phoneNum').focus(function () {
      $('#phoneNum').attr({placeholder: '(XXX) XXX-XXXX'});
    });

    $('#phoneNum').blur(function () {
      $('#phoneNum').attr({placeholder: ''});
    });

    $scope.phoneNumCheckTest = function (event) {
      if ($scope.showing.phoneNumber) {
        $scope.showing.phoneNumber = $scope.showing.phoneNumber.replace(/[^0-9]+?/g, '')
      }

      var element = $("#phoneNum");
      var len = element.val().length + 1;
      var max = element.attr("maxlength");
      if (!(len <= max)) {
        event.preventDefault();
        return false;
      }
    };

    $(window).scrollTop(0);
  });
