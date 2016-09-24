angular.module('rRApp')
    .controller('editListingCtrl', function ($scope, $state, listingSvc, userSvc) {
        setTimeout(function() {
            $(window).scrollTop(0);
        })
        $scope.user = {};
        $scope.listingId = $state.params.id
        $scope.redirectLA = function () {
            $state.go('listingagent')
        };
        $scope.listingToEdit = {};
        $scope.message = '';
        listingSvc.getListingById($state.params.id)
            .then(function (response) {
                $scope.listingToEdit = response;
                $scope.mlsListingId = $scope.listingToEdit._id;
            });
        $scope.user.phoneNum = '';
        $scope.creatingSeller = function (seller) {

            seller.phoneNum = '1' + $scope.user.phoneNum.replace(/[^0-9.]/g, "");

            userSvc.createSeller({seller: seller, listingId: $scope.listingId})
                .then(function (response) {
                    console.log(response);
                    if (response === false) {
                        $scope.message = 'Cannot use this number. Please try another.';
                        setTimeout(function () {
                            $scope.message = '';
                            $scope.$apply();
                        }, 5000);
                        return;
                    }
                    console.log('new seller', response);
                    $state.go('listingagent');
                })
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

        $(window).scrollTop(0);
    });