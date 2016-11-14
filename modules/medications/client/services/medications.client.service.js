//Medications service used to communicate Medications REST endpoints
(function () {
  'use strict';

  angular
    .module('medications')
    .factory('MedicationsService', MedicationsService);

  MedicationsService.$inject = ['$resource'];

  function MedicationsService($resource) {
    return $resource('api/medications/:medicationId', {
      medicationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
