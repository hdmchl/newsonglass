'use strict';

describe('Controller: MynewsCtrl', function () {

  // load the controller's module
  beforeEach(module('newsApp'));

  var MynewsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MynewsCtrl = $controller('MynewsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
