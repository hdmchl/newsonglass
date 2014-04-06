'use strict';

angular.module('newsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/mynews', {
        templateUrl: 'views/mynews.html',
        controller: 'MynewsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
