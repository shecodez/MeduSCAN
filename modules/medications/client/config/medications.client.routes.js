(function () {
  'use strict';

  angular
    .module('medications')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('medications', {
        abstract: true,
        url: '/medications',
        template: '<ui-view/>'
      })
      .state('medications.list', {
        url: '',
        templateUrl: 'modules/medications/client/views/list-medications.client.view.html',
        controller: 'MedicationsListController',
        controllerAs: 'vm',
        data: {
          //roles: ['teacher', 'admin'],
          pageTitle: 'Medications List'
        }
      })
      .state('medications.create', {
        url: '/create',
        templateUrl: 'modules/medications/client/views/form-medication.client.view.html',
        controller: 'MedicationsController',
        controllerAs: 'vm',
        resolve: {
          medicationResolve: newMedication
        },
        data: {
          roles: ['teacher', 'admin'],
          pageTitle : 'Medications Create'
        }
      })
      .state('medications.edit', {
        url: '/:medicationId/edit',
        templateUrl: 'modules/medications/client/views/form-medication.client.view.html',
        controller: 'MedicationsController',
        controllerAs: 'vm',
        resolve: {
          medicationResolve: getMedication
        },
        data: {
          roles: ['teacher', 'admin'],
          pageTitle: 'Edit Medication {{ medicationResolve.name }}'
        }
      })
      .state('medications.view', {
        url: '/:medicationId',
        templateUrl: 'modules/medications/client/views/view-medication.client.view.html',
        controller: 'MedicationsController',
        controllerAs: 'vm',
        resolve: {
          medicationResolve: getMedication
        },
        data:{
          pageTitle: 'Medication {{ articleResolve.name }}'
        }
      });
  }

  getMedication.$inject = ['$stateParams', 'MedicationsService'];

  function getMedication($stateParams, MedicationsService) {
    return MedicationsService.get({
      medicationId: $stateParams.medicationId
    }).$promise;
  }

  newMedication.$inject = ['MedicationsService'];

  function newMedication(MedicationsService) {
    return new MedicationsService();
  }
})();
