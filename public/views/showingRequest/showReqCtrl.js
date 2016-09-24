angular.module( 'rRApp' )
  .controller( 'showReqCtrl', function ( $scope, $state, $interval, twilioSvc, listingSvc, showingSvc, authService ) {
    setTimeout(function() {
        $(window).scrollTop(0);
    });
    var date = new Date();
    $scope.loggedIn = false;
    $scope.user = {};
    authService.currentUser().then(function(response) {
      $scope.user = response;
      if($scope.user.permissions[0] === "ListingAgent") $scope.loggedIn = !$scope.loggedIn;
      else $scope.loggedIn = false;
    });

    $scope.listingId = $state.params.listingId;
    $scope.name = {};
    $scope.showFeedback = false;
    $scope.completedShowings = [];
    $scope.sellers = [];
    $scope.message = '';
    $scope.listing = {};
    $scope.showMe = false;
    $scope.timeSlot = null;
    $scope.today = new Date().getDay(); //get day from 0 to 6 (today is 0)
    $scope.weekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $scope.availableShowingTimes = {
      Today: [],
      Tomorrow: [],
    };
    $scope.dayAfterTomorrow = '';
    if (($scope.today + 2) <= $scope.weekArray.length - 1) {
      $scope.dayAfterTomorrow = $scope.weekArray[$scope.today + 2];
    } else {
      $scope.dayAfterTomorrow = $scope.weekArray[$scope.today - 5];
    }

    $scope.availableShowingTimes[$scope.dayAfterTomorrow] = [];

    for (i = 7; i <= 22; i ++) {
      var newDateObj1 = new Date();
      newDateObj1.setDate(date.getDate());
      newDateObj1.setHours(i);
      newDateObj1.setMinutes(0);
      newDateObj1.setSeconds(0);
      newDateObj1.setMilliseconds(0);
      $scope.availableShowingTimes.Today.push({timeSlot: newDateObj1, status: 'available'});
      var newDateObj2 = new Date();
      newDateObj2.setDate(date.getDate());
      newDateObj2.setHours(i);
      newDateObj2.setMinutes(30);
      newDateObj2.setSeconds(0);
      newDateObj2.setMilliseconds(0);
      $scope.availableShowingTimes.Today.push({timeSlot: newDateObj2, status: 'available'});
    }
    for (i = 7; i <= 22; i ++) {
      var newDateObj3 = new Date();
      newDateObj3.setDate(date.getDate() + 1);
      newDateObj3.setHours(i);
      newDateObj3.setMinutes(0);
      newDateObj3.setSeconds(0);
      newDateObj3.setMilliseconds(0);
      $scope.availableShowingTimes.Tomorrow.push({timeSlot: newDateObj3, status: 'available'});
      var newDateObj4 = new Date();
      newDateObj4.setDate(date.getDate() + 1);
      newDateObj4.setHours(i);
      newDateObj4.setMinutes(30);
      newDateObj4.setSeconds(0);
      newDateObj4.setMilliseconds(0);
      $scope.availableShowingTimes.Tomorrow.push({timeSlot: newDateObj4, status: 'available'});
    }
    for (i = 7; i <= 22; i ++) {
      var newDateObj5 = new Date();
      newDateObj5.setDate(date.getDate() + 2);
      newDateObj5.setHours(i);
      newDateObj5.setMinutes(0);
      newDateObj5.setSeconds(0);
      newDateObj5.setMilliseconds(0);
      $scope.availableShowingTimes[$scope.dayAfterTomorrow].push({timeSlot: newDateObj5, status: 'available'});
      var newDateObj6 = new Date();
      newDateObj6.setDate(date.getDate() + 2);
      newDateObj6.setHours(i);
      newDateObj6.setMinutes(30);
      newDateObj6.setSeconds(0);
      newDateObj6.setMilliseconds(0);
      $scope.availableShowingTimes[$scope.dayAfterTomorrow].push({timeSlot: newDateObj6, status: 'available'});
    }

    var rightNow = new Date().getTime();
    $scope.availableShowingTimes.Today.map(function(timeSlot, index) {
      if (new Date(timeSlot.timeSlot).getTime() < (rightNow + (1000 * 60 * 15)) && timeSlot.status !== 'confirmed' && timeSlot.status !== 'completed' && timeSlot.status !== 'feedback-requested') {
        timeSlot.status = 'pastTime';
      }
    });
    $scope.availableShowingTimes.Tomorrow.map(function(timeSlot, index) {
      if (new Date(timeSlot.timeSlot).getTime() < (rightNow + (1000 * 60 * 15)) && timeSlot.status !== 'confirmed' && timeSlot.status !== 'completed' && timeSlot.status !== 'feedback-requested') {
        timeSlot.status = 'pastTime';
      }
    });
    $scope.availableShowingTimes[$scope.dayAfterTomorrow].map(function(timeSlot, index) {
      if (new Date(timeSlot.timeSlot).getTime() < (rightNow + (1000 * 60 * 15)) && timeSlot.status !== 'confirmed' && timeSlot.status !== 'completed' && timeSlot.status !== 'feedback-requested') {
        timeSlot.status = 'pastTime';
      }
    });

    $scope.getListing = function () {

      /*get Listing by Id*/
      listingSvc.getListingById($scope.listingId)
        .then(function (response) {
          $scope.listing = response;
          if ($scope.listing.showings) {
            if ($scope.availableShowingTimes.Today) {
              /*if available showing map today's showings*/
              $scope.availableShowingTimes.Today.map(function(timeSlot, index) {
                $scope.listing.showings.map(function(showing) {
                  if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'pending' && $scope.availableShowingTimes.Today[index].status !== 'pastTime') {
                    $scope.availableShowingTimes.Today[index].status = 'pending';
                    $scope.availableShowingTimes.Today[index].buyersAgent = showing.buyersAgent.name;
                    $scope.availableShowingTimes.Today[index].showingId = showing._id;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'confirmed') {
                    $scope.availableShowingTimes.Today[index].status = 'confirmed';
                    $scope.availableShowingTimes.Today[index].showingId = showing._id;
                    $scope.availableShowingTimes.Today[index].buyersAgent = showing.buyersAgent.name;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.feedback) {
                    $scope.availableShowingTimes.Today[index].status = 'completed';
                    $scope.availableShowingTimes.Today[index].showingId = showing._id;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'feedback-requested') {
                    $scope.availableShowingTimes.Today[index].status = 'feedback-requested';
                    $scope.availableShowingTimes.Today[index].showingId = showing._id;
                    $scope.availableShowingTimes.Today[index].buyersAgent = showing.buyersAgent.name;
                  }
                });
                /*map today's unavailable showings*/
                $scope.listing.timeSlotsUnavailable.map(function(slotUnavailable) {
                  if (new Date(slotUnavailable).getTime() === new Date(timeSlot.timeSlot).getTime()) {
                    $scope.availableShowingTimes.Today[index].status = 'canceled';
                  }
                })
              })
            }
            if ($scope.availableShowingTimes.Tomorrow) {
              $scope.availableShowingTimes.Tomorrow.map(function(timeSlot, index) {
                $scope.listing.showings.map(function(showing) {
                  if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'pending' && $scope.availableShowingTimes.Tomorrow[index].status !== 'pastTime') {
                    $scope.availableShowingTimes.Tomorrow[index].status = 'pending';
                    $scope.availableShowingTimes.Tomorrow[index].showingId = showing._id;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'confirmed') {
                    $scope.availableShowingTimes.Tomorrow[index].status = 'confirmed';
                    $scope.availableShowingTimes.Tomorrow[index].buyersAgent = showing.buyersAgent.name;
                    $scope.availableShowingTimes.Tomorrow[index].showingId = showing._id;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.feedback) {
                    $scope.availableShowingTimes.Tomorrow[index].status = 'completed';
                    $scope.availableShowingTimes.Tomorrow[index].showingId = showing._id;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'feedback-requested') {
                    $scope.availableShowingTimes.Tomorrow[index].status = 'feedback-requested';
                    $scope.availableShowingTimes.Tomorrow[index].showingId = showing._id;
                    $scope.availableShowingTimes.Tomorrow[index].buyersAgent = showing.buyersAgent.name;
                  }
                });
                $scope.listing.timeSlotsUnavailable.map(function(slotUnavailable) {
                  if (new Date(slotUnavailable).getTime() === new Date(timeSlot.timeSlot).getTime()) {
                    $scope.availableShowingTimes.Tomorrow[index].status = 'canceled';
                  }
                })
              })
            }
            if ($scope.availableShowingTimes[$scope.dayAfterTomorrow]) {
              $scope.availableShowingTimes[$scope.dayAfterTomorrow].map(function(timeSlot, index) {
                $scope.listing.showings.map(function(showing) {
                  if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'pending' && $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].status !== 'pastTime') {
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].status = 'pending';
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].showingId = showing._id;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'confirmed') {
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].status = 'confirmed';
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].buyersAgent = showing.buyersAgent.name;
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].showingId = showing._id;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.feedback) {
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].status = 'completed';
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].showingId = showing._id;
                  } else if (new Date(showing.timeSlot).getTime() === new Date(timeSlot.timeSlot).getTime() && showing.status === 'feedback-requested') {
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].status = 'feedback-requested';
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].showingId = showing._id;
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].buyersAgent = showing.buyersAgent.name;
                  }
                });
                $scope.listing.timeSlotsUnavailable.map(function(slotUnavailable) {
                  if (new Date(slotUnavailable).getTime() === new Date(timeSlot.timeSlot).getTime()) {
                    $scope.availableShowingTimes[$scope.dayAfterTomorrow][index].status = 'canceled';
                  }
                })
              })
            }
          }
          $scope.listing.showings.map(function(showing) {
            console.log('showings time slot', new Date(showing.timeSlot));
            if (showing.feedback) {
              $scope.completedShowings.push(showing);
            }
          });
          $scope.listing.timeSlotsUnavailable.map(function(slotUnavailable) {
            console.log('time slot unavailable', new Date(slotUnavailable));
          })
        })
    };
    $scope.getListing();
    //query listing for sellers phone number.


    $scope.prevClick = {
      day: '',
      index: 0
    };
    $scope.timeSelected = function(day, index, timeSlot) {
      $scope.showMe = true;
      $scope.availableShowingTimes[day][index].status = 'selected';
      $scope.timeSlot = $scope.availableShowingTimes[day][index].timeSlot;
      if ($scope.prevClick.day) {
        $scope.availableShowingTimes[$scope.prevClick.day][$scope.prevClick.index].status = 'available';  
      }
      $scope.prevClick = {
        day: day,
        index: index
      }
    };

    $scope.showRequest2 = function () {
      $state.go('showing2request', { listingId: $scope.listingId, timeSlot: $scope.timeSlot});
    };


    
    


    $interval(function() {
     var rightNow = new Date().getTime();
     $scope.availableShowingTimes.Today.map(function(timeSlot, index) {
      if (new Date(timeSlot.timeSlot).getTime() < (rightNow + (1000 * 60 * 15)) && timeSlot.status !== 'confirmed' && timeSlot.status !== 'completed' && timeSlot.status !== 'feedback-requested') {
        timeSlot.status = 'pastTime';
      }
     })
     $scope.availableShowingTimes.Tomorrow.map(function(timeSlot, index) {
      if (new Date(timeSlot.timeSlot).getTime() < (rightNow + (1000 * 60 * 15)) && timeSlot.status !== 'confirmed' && timeSlot.status !== 'completed' && timeSlot.status !== 'feedback-requested') {
        timeSlot.status = 'pastTime';
      }
     })
     $scope.availableShowingTimes[$scope.dayAfterTomorrow].map(function(timeSlot, index) {
      if (new Date(timeSlot.timeSlot).getTime() < (rightNow + (1000 * 60 * 15)) && timeSlot.status !== 'confirmed' && timeSlot.status !== 'completed' && timeSlot.status !== 'feedback-requested') {
        timeSlot.status = 'pastTime';
      }
     })
     }, (3000));
  });
