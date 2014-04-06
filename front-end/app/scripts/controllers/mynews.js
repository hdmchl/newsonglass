'use strict';

angular.module('newsApp')
  .controller('MynewsCtrl', function ($scope, User, Preferences) {
    $scope.formData = {};

    //TODO: this is just a stub for topics... doesn't do much yet.
    $scope.topics = [
      {
        id: 0,
        label: 'Technology'
      },
      {
        id: 1,
        label: 'Science'
      },
      {
        id: 2,
        label: 'Politics'
      },
    ];

    //set up preferences
    $scope.preferences = {
      freq: []
    };

    //get user and preferences
    User.getUser().then(function(response) {
      $scope.user = response.user;
      Preferences.getPreferences(response.user.id).then(function(response) {
        $scope.preferences = response.data;
      });
    });

    $scope.submitForm = function() {
      for (var i in $scope.preferences.freq) {
        $scope.preferences.freq[i].selected = false;
      }
      $scope.preferences.freq[$scope.formData.freq].selected = true;

      console.log('POST', $scope.preferences);
      Preferences.postPreferences($scope.user.id, $scope.preferences);
    };
  });
