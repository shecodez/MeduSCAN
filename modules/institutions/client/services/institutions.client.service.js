// Institutions service used to communicate Institutions REST endpoints
(function () {
  'use strict';

  angular
    .module('institutions')
    .factory('InstitutionsService', InstitutionsService);

  InstitutionsService.$inject = ['$resource'];

  function InstitutionsService($resource) {
    return $resource('api/institutions/:institutionId', {
      institutionId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
