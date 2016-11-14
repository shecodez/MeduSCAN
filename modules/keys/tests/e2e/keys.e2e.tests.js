'use strict';

describe('Keys E2E Tests:', function () {
  describe('Test Keys page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/keys');
      expect(element.all(by.repeater('key in keys')).count()).toEqual(0);
    });
  });
});
