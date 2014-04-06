'use strict';

describe('Service: Preferences', function () {

  // load the service's module
  beforeEach(module('newsApp'));

  // instantiate service
  var Preferences;
  beforeEach(inject(function (_Preferences_) {
    Preferences = _Preferences_;
  }));

  it('should do something', function () {
    expect(!!Preferences).toBe(true);
  });

});
