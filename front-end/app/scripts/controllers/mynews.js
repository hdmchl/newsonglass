'use strict';

angular.module('newsApp')
  .controller('MynewsCtrl', function ($scope, User, Preferences) {
    //TODO: this is just a stub for topics... it doesn't do anything yet.
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

    // $scope.preferences = User.getUser().then(function(data) {
    //   return Preferences.getPreferences(data.user.id);
    // });

    $scope.preferences = {
      freq: [
        {
          id: 0,
          label: 'Hourly',
          rule: {minute:0}
        },
        {
          id: 1,
          label: 'Daily',
          rule: {hour:8}
        },
        {
          id: 2,
          label: 'Often',
          rule: {second:10}
        }
      ]
    };
  });
