//Tutorials service used to communicate Tutorials REST endpoints
(function () {
  'use strict';

  angular
    .module('tutorials')
    .factory('TutorialsService', TutorialsService);

  TutorialsService.$inject = ['$resource'];

  function TutorialsService($resource) {
    return $resource('api/tutorials/:tutorialId', {
      tutorialId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
