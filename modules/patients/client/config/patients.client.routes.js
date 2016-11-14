(function () {
  'use strict';

  angular
    .module('patients')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('patient-lookup', {
        url: '/patient-lookup',
        templateUrl: 'modules/patients/client/views/lookup-patient.client.view.html',
        controller: 'LookupPatientController',
        controllerAs: 'vm',
        data: {
          roles: ['student', 'teacher', 'admin'],
          pageTitle: 'Patient Lookup'
        }
      })
      .state('patients', {
        abstract: true,
        url: '/patients',
        template: '<ui-view/>'
      })
      .state('patients.list', {
        url: '',
        templateUrl: 'modules/patients/client/views/list-patients.client.view.html',
        controller: 'PatientsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Patients List'
        }
      })
      .state('patients.create', {
        url: '/create',
        templateUrl: 'modules/patients/client/views/form-patient.client.view.html',
        controller: 'PatientsController',
        controllerAs: 'vm',
        resolve: {
          patientResolve: newPatient
        },
        data: {
          roles: ['teacher', 'admin'],
          pageTitle : 'Patients Create'
        }
      })
      .state('patients.edit', {
        url: '/:patientId/edit',
        templateUrl: 'modules/patients/client/views/form-patient.client.view.html',
        controller: 'PatientsController',
        controllerAs: 'vm',
        resolve: {
          patientResolve: getPatient
        },
        data: {
          roles: ['teacher', 'admin'],
          pageTitle: 'Edit Patient {{ patientResolve.name }}'
        }
      })
      .state('patients.emar', {
        url: '/:patientId/emar',
        templateUrl: 'modules/patients/client/views/emar-patient.client.view.html',
        controller: 'PatientEmarController',
        controllerAs: 'vm',
        resolve: {
          patientResolve: getPatient
        },
        data: {
          roles: ['student', 'teacher', 'admin'],
          pageTitle: 'EMAR'
        }
      })
      .state('patients.medications', {
        url: '/:patientId/medications',
        templateUrl: 'modules/patients/client/views/medications/list-patientMedications.client.view.html',
        controller: 'PatientMedicationsController',
        controllerAs: 'vm',
        resolve: {
          patientResolve: getPatient
        },
        data: {
          roles: ['teacher', 'admin'],
          pageTitle: 'Patient Medications'
        }
      })
      .state('patients.view', {
        url: '/:patientId',
        templateUrl: 'modules/patients/client/views/view-patient.client.view.html',
        controller: 'PatientsController',
        controllerAs: 'vm',
        resolve: {
          patientResolve: getPatient
        },
        data:{
          pageTitle: 'Patient {{ articleResolve.name }}'
        }
      });
  }

  getPatient.$inject = ['$stateParams', 'PatientsService'];

  function getPatient($stateParams, PatientsService) {
    return PatientsService.get({
      patientId: $stateParams.patientId
    }).$promise;
  }

  newPatient.$inject = ['PatientsService'];

  function newPatient(PatientsService) {
    return new PatientsService();
  }
})();
