'use strict';

angular.module('newsApp')
  .service('Preferences', function Preferences($http) {
    return {
      getPreferences: function(userId) {
        return $http.get('http://localhost:8080/user/'+userId+'/preferences').then(function(result) {
          console.log('prefs', result);
          return result.data;
        });
      }
    };
  });
