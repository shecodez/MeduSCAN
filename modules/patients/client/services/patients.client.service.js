//Patients service used to communicate Patients REST endpoints
(function () {
  'use strict';

  angular
    .module('patients')
    .factory('PatientsService', PatientsService);

  PatientsService.$inject = ['$resource'];

  function PatientsService($resource) {
    return $resource('api/patients/:patientId', {
      patientId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
