'use strict';

describe('Medications E2E Tests:', function () {
  describe('Test Medications page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/medications');
      expect(element.all(by.repeater('medication in medications')).count()).toEqual(0);
    });
  });
});
