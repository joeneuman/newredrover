var app = angular.module('rRApp', ['ui.router', 'ngFitText', 'angularPayments', 'ngAnimate']);

app.directive('feedback', function() {
	return {
		templateUrl: './views/directiveViews/feedbackTmpl.html',
		restrict: 'E',
		scope: {
			showing: '='
		},
		link: function(scope, elem) {
			
		}
	}
})


