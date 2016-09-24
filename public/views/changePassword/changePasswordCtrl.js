angular.module('rRApp')
  .controller('changePassword', function ($scope, $state, userSvc) {
    setTimeout(function() {
        $(window).scrollTop(0);
    });
    $scope.user;
    $scope.password = '';
    $scope.passwordCheckHolder = '';
    $scope.currentUser = $state.params.agentId;


    $scope.redirectLA = function () {
      userSvc.currentUser()
        .then(function (response) {
          console.log(response);
        });
      $state.go('listingagent');
    };

    userSvc.getUserById($scope.currentUser)
      .then(function (response) {
        $scope.user = response;
        $scope.user.phoneNum = $scope.user.phoneNum.substring(1);
        $scope.user.password = '';
      });

    $scope.editUser = function (userId, userToEdit) {
      console.log(userToEdit.phoneNum);
      if (userToEdit.phoneNum.length < 10) {
        alert('Please check that your phone number is correct and in the right format.')
        return;
      }
      userToEdit.phoneNum = '1' + userToEdit.phoneNum;
      userSvc.editUserById(userId, userToEdit)
        .then(function (response) {
          console.log(response);
          $state.go('listingagent');
        });
    };

    $scope.editPassword = function (userId) {
      if (!$scope.password || !$scope.passwordCheckHolder) {
        alert('Please fill in the password inputs.');
        return;
      }
      if ($scope.password !== $scope.passwordCheckHolder) {
        alert('your passwords do not match');
        return;
      } else {
        userSvc.editUserPassword(userId, {password: $scope.password})
          .then(function (response) {
            console.log(response);
            alert('password updated')
            $state.go('login');
          });
      }
    };

    $scope.editAgent = function () {
      userSvc.editUser();
    };

    

    $('#passwordCheck').blur(function() {
      /*<<<<<<< Updated upstream
       if ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length >= $scope.user.password.length) {
       =======*/
      if ($scope.password && $scope.passwordCheckHolder && $scope.password.length >= $scope.passwordCheckHolder.length) {
        /*>>>>>>> Stashed changes*/
        if ($scope.passwordCheckHolder !== $scope.password) {
          $scope.passwordMessage = 'Password does not match.';
          $('#passwordMessage').css({color: 'red'});
          $scope.$apply();
        } else if ($scope.passwordCheckHolder === $scope.password) {
          $scope.passwordMessage = 'Password matches';
          $('#passwordMessage').css({color: 'green'});
          $scope.$apply();
        }
      } else {
        $scope.passwordMessage = 'Re-enter Password';
        $('#passwordMessage').css({color: 'black'});
        $scope.$apply();
      }
    });

    $('#password').blur(function() {
      if ($scope.password && $scope.passwordCheckHolder && $scope.password.length >= $scope.passwordCheckHolder.length) {
        /*>>>>>>> Stashed changes*/
        if ($scope.passwordCheckHolder !== $scope.password) {
          $scope.passwordMessage = 'Password does not match.';
          $('#passwordMessage').css({color: 'red'});
          $scope.$apply();
        } else if ($scope.passwordCheckHolder === $scope.password) {
          $scope.passwordMessage = 'Password matches';
          $('#passwordMessage').css({color: 'green'});
          $scope.$apply();
        }
      } else {
        /*>>>>>>> Stashed changes*/
        $scope.passwordMessage = 'Re-enter Password';
        $('#passwordMessage').css({color: 'black'});
        $scope.$apply();
      }
    });

    $scope.passwordCheck = function() {
      /*<<<<<<< Updated upstream
       if ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length >= $scope.user.password.length) {
       =======*/
      if ($scope.password && $scope.passwordCheckHolder && $scope.password.length >= $scope.passwordCheckHolder.length) {
        /*>>>>>>> Stashed changes*/
        if ($scope.passwordCheckHolder !== $scope.password) {
          $scope.passwordMessage = 'Password does not match.';
          $('#passwordMessage').css({color: 'red'});
        } else if ($scope.passwordCheckHolder === $scope.password) {
          $scope.passwordMessage = 'Password matches';
          $('#passwordMessage').css({color: 'green'});
        }
        /*<<<<<<< Updated upstream
         } else if (!$scope.user.passwordCheck || ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length < $scope.user.password.length)) {
         =======*/
      } else {
        /*>>>>>>> Stashed changes*/
        $scope.passwordMessage = 'Re-enter Password';
        $('#passwordMessage').css({color: 'black'});
      }
    }
  });