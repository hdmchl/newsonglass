'use strict';

angular.module('newsApp')
  .service('User', function User($http) {
    return {
      getUser: function() {
        return $http.get('http://newsonglass.herokuapp.com/user').then(function(result) {
          console.log('user', result);
          return result.data;
        });
      }
    };
  });
