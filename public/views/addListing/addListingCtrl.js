angular.module( 'rRApp' )
  .controller( 'addListingCtrl', function ( $scope, $state, listingSvc, user ) {
    setTimeout(function() {
        $(window).scrollTop(0);
    });
    $scope.listing = {
      agent: user._id,
      address: null,
      taxId: null,
      mlsId: null,
      sellerName: null,
      sellerPhone: null
    };
    $scope.message = '';


    $scope.goListingAgent = function () {
      $state.go( 'listingagent' );
    };

    $scope.newListing = function ( createNewListing ) {
      var phoneNumTest = createNewListing.sellerPhone.replace(/[^0-9.]/g, "");
      console.log(phoneNumTest.length);
      if (phoneNumTest.length <= 9) {
          $scope.message = 'Seller\'s phone number must be 11 digits long...';
          setTimeout(function() {
            $scope.message = '';
            $scope.$apply();
          }, 5000);
          return false;
      } else {
        listingSvc.createListing( createNewListing )
          .then( function () {
            $scope.goListingAgent();
        });
      }
      
    };

  });
