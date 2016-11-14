'use strict';

describe('Institutions E2E Tests:', function () {
  describe('Test Institutions page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/institutions');
      expect(element.all(by.repeater('institution in institutions')).count()).toEqual(0);
    });
  });
});
