/**
 * Created by brandonhebbert on 8/30/16.
 */
var app = angular.module('rRApp');

app.directive('showReqDir', function() {
  return {
    templateUrl: './views/directiveViews/showReqDirTemp.html',
    restrict: 'E',
    scope: {
      showing: '='
    }
  }
});