'use strict';

angular.module('newsApp')
  .service('Preferences', function Preferences($http) {
    return {
      getPreferences: function(userId) {
        return $http.get('http://localhost:8080/user/'+userId+'/preferences').success(function(result) {
          console.log('prefs', result);
          return result.data;
        });
      },
      postPreferences: function(userId, prefs) {
        return $http.post('http://localhost:8080/user/'+userId+'/preferences', prefs).success(function() {
          console.log('sent prefs', prefs);
        });
      }
    };
  });
