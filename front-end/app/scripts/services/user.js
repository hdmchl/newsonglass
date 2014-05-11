'use strict';

angular.module('newsApp')
  .service('User', function User($http) {
    return {
      getUser: function() {
        return $http.get('http://localhost:8080/user').then(function(result) {
          console.log('user', result);
          return result.data;
        });
      }
    };
  });
