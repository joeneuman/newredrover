/**
 * Created by brandonhebbert on 3/30/16.
 */
angular.module('rRApp')
    .controller('editProfileCtrl', function ($scope, $state, userSvc) {
        setTimeout(function() {
            $(window).scrollTop(0);
        })
        $scope.user;
        $scope.password = '';
        $scope.passwordCheckHolder = '';
        $scope.currentUser = $state.params.agentId;
        // $scope.currentUser = user._id;
        // $scope.userEmail = user.email;
        /*$scope.newPassword = '';
        $scope.passwordConfirmed = '';*/
        // $scope.user = '';

        $scope.redirectLA = function () {
            userSvc.currentUser()
                .then(function (response) {
                    console.log(response);
                    // $scope.currentUser = response.data;
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
                    // $scope.redirectLA();
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
/*<<<<<<< Updated upstream
        $scope.pinNumCheck = function (event) {
            var element = $("#pinNum");
            var len = element.val().length + 1;
            var max = element.attr("maxlength");

            var cond = (46 < event.which && event.which < 58) || (46 < event.keyCode && event.keyCode < 58);

            if (!(cond && len <= max)) {
                event.preventDefault();
                return false;
            }
        }
=======*/
/*>>>>>>> Stashed changes*/

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
        }

        /*$scope.phoneNumCheck = function (event) {

            var element = $("#phoneNum");
            var len = element.val().length + 1;
            var val = element.val();
            var max = element.attr("maxlength");
            var cond = (46 < event.which && event.which < 58) || (46 < event.keyCode && event.keyCode < 58) || (95 < event.which && event.which < 106) || (95 < event.keyCode && event.keyCode < 106);
            if (!(cond && len <= max)) {
                event.preventDefault();
                return false;
            }
        }

        $scope.phoneNumCheck2 = function (event) {
            if (event.which === 8) {
                if ($scope.user.phoneNum) {
                    $scope.user.phoneNum = $scope.user.phoneNum.substr(0, $scope.user.phoneNum.length - 1);
                }
                return;
            }
            if ($scope.user.phoneNum) {
                str = $scope.user.phoneNum.replace(/[^0-9]+?/g, '');
                switch (str.length) {
                    case 3:
                        str = "("+str.substr(0,3)+") ";
                        break;
                    case 6:
                        str = "("+str.substr(0,3)+") "+str.substr(3,3)+"-";
                        break;
                    case 10:
                        str = "("+str.substr(0,3)+") "+str.substr(3,3)+"-"+str.substr(6,4);
                        break;
                    default:
                        return;
                }
                $scope.user.phoneNum = str;
            }           
        }*/

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
/*<<<<<<< Updated upstream
            } else if (!$scope.user.passwordCheck || ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length < $scope.user.password.length)) {
=======*/
            } else {
/*>>>>>>> Stashed changes*/
                $scope.passwordMessage = 'Re-enter Password';
                $('#passwordMessage').css({color: 'black'});
                $scope.$apply();
            }
        })

        $('#password').blur(function() {
/*<<<<<<< Updated upstream
            if ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length <= $scope.user.password.length) {
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
/*<<<<<<< Updated upstream
            } else if (!$scope.user.passwordCheck || ($scope.user.password && $scope.user.passwordCheck && $scope.user.passwordCheck.length < $scope.user.password.length)) {
=======*/
            } else {
/*>>>>>>> Stashed changes*/
                $scope.passwordMessage = 'Re-enter Password';
                $('#passwordMessage').css({color: 'black'});
                $scope.$apply();
            }
        })

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