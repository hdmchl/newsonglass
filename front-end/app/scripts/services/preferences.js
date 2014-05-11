'use strict';

angular.module('newsApp')
  .service('Preferences', function Preferences($http) {
    return {
      getPreferences: function(userId) {
        return $http.get('http://localhost:8080/user/'+userId+'/preferences').success(function(response) {
          console.log('GET results:', response);
          return response.data;
        });
      },
      postPreferences: function(userId, prefs) {
        return $http.post('http://localhost:8080/user/'+userId+'/preferences', prefs).success(function(response) {
          console.log('POST', prefs);
          console.log('POST response', response);
          return response;
        });
      }
    };
  });
