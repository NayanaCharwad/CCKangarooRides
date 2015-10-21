/**
 * Created by charna10 on 6/15/2015.
 * This file contains route configuration for webpages 
 */

myApp.config([
        '$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'home.html',
                })

                .when('/home', {
                    templateUrl: 'home.html',
                })

                .when('/registration', {
                    templateUrl: 'registration.html',
                })

                .when('/reviewBookings', {
                    templateUrl:  'reviewBookings.html',
                })

                .when('/editBookings', {
                    templateUrl:  'EditBookings.html',
                })

                .when('/addRide', {
                    templateUrl:  'AddRide.html',
                })

                .when('/chart', {
                    templateUrl:  'Graph.html',
                })
                .otherwise({
                    redirectTo: '/'
                });
        }
    ]);

myApp.config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(5000);
    growlProvider.globalDisableCountDown(true);
}]);
