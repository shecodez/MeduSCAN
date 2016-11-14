'use strict';

describe('Patients E2E Tests:', function () {
  describe('Test Patients page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/patients');
      expect(element.all(by.repeater('patient in patients')).count()).toEqual(0);
    });
  });
});
