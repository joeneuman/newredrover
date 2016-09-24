angular.module('rRApp')
  .controller('addAgentCtrl', function ($scope, $state, userSvc, stripeSvc) {
    setTimeout(function () {
      $(window).scrollTop(0);
    });
    $scope.user = {
      phoneNum: ''
    };
    $scope.passwordMessage = 'Re-enter Password';
    $scope.emailMessage = 'Email';
    $scope.phoneMessage = 'Phone Number';
    $scope.phoneChecker = false;
    $scope.emailChecker = false;
    $scope.errorMessage = '';
    $scope.isDisabled = false;
    
    
    $scope.test = function () {
      if ($scope.user.phoneNum) {
        var phoneNumTest = $scope.user.phoneNum.replace(/[^0-9.]/g, "");
      }
      if (!$scope.user.firstName || !$scope.user.lastName || !$scope.user.companyName || !$scope.user.email || !phoneNumTest || phoneNumTest.length < 10 || !$scope.user.password || ($scope.user.password !== $scope.user.passwordCheck) || !$scope.user.pinNum || $scope.user.pinNum.length < 4 || $scope.phoneChecker === false || $scope.emailChecker === false) {
        return false;
      } else {
        return true;
      }
    };
    

    $scope.generateRandomNumber = function () {
      console.log('registering');
      var arr = [];

      while (arr.length < 4) {
        var randomnumber = Math.ceil(Math.random() * 9);
        var found = false;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] == randomnumber) {
            found = true;
            break
          }
        }
        if (!found)arr[arr.length] = randomnumber;
      }
      var randomNum = arr.join('');

      var phoneNumTest = $scope.user.phoneNum.replace(/[^0-9.]/g, "");
      $scope.user.phoneNum = '1' + phoneNumTest;
      console.log($scope.user.phoneNum);

      function generateEmail(num) {
        var email = 'user@h8.rs';
        var arr = email.split('');
        var index = email.indexOf('@');
        var ema = arr.splice(index, 0, '+', num);
        email = arr.join('');
        $scope.user.randomEmail = email;
      }
      generateEmail(randomNum);
    };


    $scope.handleStripe = function (status, response) {
      if (response.error) {
        console.log('there was an error', response.error);
        $scope.errorMessage = 'There was an error registering your card. Please check that the form is filled out correctly.';
        setTimeout(function () {
          $scope.errorMessage = '';
          $scope.$apply();
        }, 4000);
      } else {
        $scope.user.token = response;
        $scope.user.email = $scope.user.email.toLowerCase();
        userSvc.user = $scope.user;
        $state.go('mlssignup');

      }
    };
    
    $scope.disableButton = function () {
      $scope.isDisabled = true;
    };

    $scope.loginUser = function () {
      $state.go('login');
    };

    $scope.cancel = function () {
      $state.go('splash');
    };
    $scope.logginOut = function () {
      $state.go('splash')
    };
    
    $scope.logOut = function () {
      console.log('logging out');
      userSvc.loggingOut()
        .then(function () {
          $scope.logginOut();
          console.log('logged out');
        })
    };

    $scope.newAgent = function (createNewAgent) {
      addAgentSvc.createAgent(createNewAgent);
      $scope.agent = "";
      $state.go('listingagent');
    };

    $scope.logOut = function () {
      console.log('logging out');
      userSvc.loggingOut()
        .then(function () {
          $scope.logginOut();
          console.log('logged out');
        })
    };


    $scope.pinNumCheck = function (event) {
      var element = $("#pinNum");
      var len = element.val().length + 1;
      var max = element.attr("maxlength");

      var cond = (46 < event.which && event.which < 58) || (46 < event.keyCode && event.keyCode < 58);

      if (!(cond && len <= max)) {
        event.preventDefault();
        return false;
      }
    };

    $scope.phoneNumCheckTest = function (event) {
      if ($scope.user.phoneNum) {
        $scope.user.phoneNum = $scope.user.phoneNum.replace(/[^0-9]+?/g, '')
      }

      var element = $("#phoneNum");
      var len = element.val().length + 1;
      var max = element.attr("maxlength");
      if (!(len <= max)) {
        event.preventDefault();
        return false;
      }
    };

    $('#email').blur(function () {
      if (!$scope.user.email) {
        return;
      }
      userSvc.checkEmail({email: $scope.user.email}).then(function (response) {
        if (response === true) {
          $scope.emailMessage = 'Email already in use. Please use another.';
          $('#emailMessage').css({color: 'red'});
          $scope.emailChecker = false;

        } else {
          $scope.emailMessage = 'Email';
          $('#emailMessage').css({color: 'green'});
          $scope.emailChecker = true;
        }
        console.log($scope.emailChecker);
      });
    });

    $('#phoneNum').blur(function () {
      if (!$scope.user.phoneNum) {
        return;
      }
      userSvc.phoneNumCheck({phoneNum: $scope.user.phoneNum}).then(function (response) {
        if (response === true) {
          $scope.phoneMessage = 'Phone number already in use. Please use another.';
          $('#phoneMessage').css({color: 'red'});
          $scope.phoneChecker = false;
        } else {
          $scope.phoneMessage = 'Phone Number';
          $('#phoneMessage').css({color: 'green'});
          $scope.phoneChecker = true;
        }
      })
    });

    $('#passwordCheck').blur(function () {
      if ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length >= $scope.user.password.length) {
        if ($scope.user.passwordCheck !== $scope.user.password) {
          $scope.passwordMessage = 'Password does not match.';
          $('#passwordMessageOne').css({color: 'red'});
          $('#passwordMessageTwo').css({color: 'red'});
          $scope.$apply();
        } else if ($scope.user.passwordCheck === $scope.user.password) {
          $scope.passwordMessage = 'Password matches';
          $('#passwordMessageOne').css({color: 'green'});
          $('#passwordMessageTwo').css({color: 'green'});
          $scope.$apply();
        }
      } else if (!$scope.user.passwordCheck || ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length < $scope.user.password.length)) {
        $scope.passwordMessage = 'Re-enter Password';
        $('#passwordMessageOne').css({color: 'black'});
        $('#passwordMessageTwo').css({color: 'black'});
        $scope.$apply();
      }
    });

    $('#password').blur(function () {
      if ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length <= $scope.user.password.length) {
        if ($scope.user.passwordCheck !== $scope.user.password) {
          $scope.passwordMessage = 'Password does not match.';
          $('#passwordMessageOne').css({color: 'red'});
          $('#passwordMessageTwo').css({color: 'red'});
          $scope.$apply();
        } else if ($scope.user.passwordCheck === $scope.user.password) {
          $scope.passwordMessage = 'Password matches';
          $('#passwordMessageOne').css({color: 'green'});
          $('#passwordMessageTwo').css({color: 'green'});
          $scope.$apply();
        }
      } else if (!$scope.user.passwordCheck || ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length < $scope.user.password.length)) {
        $scope.passwordMessage = 'Re-enter Password';
        $('#passwordMessageOne').css({color: 'black'});
        $('#passwordMessageTwo').css({color: 'black'});
        $scope.$apply();
      }
    });

    $scope.passwordCheck = function () {
      if ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length >= $scope.user.password.length) {
        if ($scope.user.passwordCheck !== $scope.user.password) {
          $scope.passwordMessage = 'Password does not match.';
          $('#passwordMessageOne').css({color: 'red'});
          $('#passwordMessageTwo').css({color: 'red'});
        } else if ($scope.user.passwordCheck === $scope.user.password) {
          $scope.passwordMessage = 'Password matches';
          $('#passwordMessageOne').css({color: 'green'});
          $('#passwordMessageTwo').css({color: 'green'});
        }
      } else if (!$scope.user.passwordCheck || ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length < $scope.user.password.length)) {
        $scope.passwordMessage = 'Re-enter Password';
        $('#passwordMessageOne').css({color: 'black'});
        $('#passwordMessageTwo').css({color: 'black'});
      }
    };

    $scope.$watch('user.firstName', function (newValue, oldValue) {
      if (newValue) {
        $scope.test();
      }
    });
    $scope.$watch('user.lastName', function (newValue, oldValue) {
      if (newValue) {
        $scope.test();
      }
    });
    $scope.$watch('user.companyName', function (newValue, oldValue) {
      if (newValue) {
        $scope.test();
      }
    });
    $scope.$watch('user.email', function (newValue, oldValue) {
      if (newValue) {
        if (!$scope.user.email) {
          return;
        }
        userSvc.checkEmail({email: $scope.user.email}).then(function (response) {
          if (response === true) {
            $scope.emailMessage = 'Email already in use. Please use another.';
            $('#emailMessage').css({color: 'red'});
            $scope.emailChecker = false;

          } else {
            $scope.emailMessage = 'Email';
            $('#emailMessage').css({color: 'green'});
            $scope.emailChecker = true;
          }
          console.log($scope.emailChecker);
          $scope.test();
        });
      }
    });
    $scope.$watch('user.phoneNum', function (newValue, oldValue) {
      if (newValue) {
        if (!$scope.user.phoneNum) {
          return;
        }

        var phoneNumTest = $scope.user.phoneNum.replace(/[^0-9.]/g, "");
        if (phoneNumTest.length < 10) {
          return;
        }
        userSvc.phoneNumCheck({phoneNum: $scope.user.phoneNum}).then(function (response) {
          if (response === true) {
            $scope.phoneMessage = 'Phone number already in use. Please use another.';
            $('#phoneMessage').css({color: 'red'});
            $scope.phoneChecker = false;
          } else {
            $scope.phoneMessage = 'Phone Number';
            $('#phoneMessage').css({color: 'green'});
            $scope.phoneChecker = true;
          }
          $scope.test();
        })
      }
    });
    
    $scope.$watch('user.pinNum', function (newValue, oldValue) {
      if (newValue) {
        $scope.test();
      }
    })

  });