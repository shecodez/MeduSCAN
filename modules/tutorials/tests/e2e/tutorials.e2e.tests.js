'use strict';

describe('Tutorials E2E Tests:', function () {
  describe('Test Tutorials page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/tutorials');
      expect(element.all(by.repeater('tutorial in tutorials')).count()).toEqual(0);
    });
  });
});
