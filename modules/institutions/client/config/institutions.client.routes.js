(function () {
  'use strict';

  angular
    .module('institutions')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('institutions', {
        abstract: true,
        url: '/institutions',
        template: '<ui-view/>'
      })
      .state('institutions.list', {
        url: '',
        templateUrl: 'modules/institutions/client/views/list-institutions.client.view.html',
        controller: 'InstitutionsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Institutions List'
        }
      })
      .state('institutions.create', {
        url: '/create',
        templateUrl: 'modules/institutions/client/views/form-institution.client.view.html',
        controller: 'InstitutionsController',
        controllerAs: 'vm',
        resolve: {
          institutionResolve: newInstitution
        },
        data: {
          roles: ['admin'],
          pageTitle : 'Institutions Create'
        }
      })
      .state('institutions.edit', {
        url: '/:institutionId/edit',
        templateUrl: 'modules/institutions/client/views/form-institution.client.view.html',
        controller: 'InstitutionsController',
        controllerAs: 'vm',
        resolve: {
          institutionResolve: getInstitution
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Edit Institution {{ institutionResolve.name }}'
        }
      })
      .state('institutions.view', {
        url: '/:institutionId',
        templateUrl: 'modules/institutions/client/views/view-institution.client.view.html',
        controller: 'InstitutionsController',
        controllerAs: 'vm',
        resolve: {
          institutionResolve: getInstitution
        },
        data:{
          pageTitle: 'Institution {{ articleResolve.name }}'
        }
      });
  }

  getInstitution.$inject = ['$stateParams', 'InstitutionsService'];

  function getInstitution($stateParams, InstitutionsService) {
    return InstitutionsService.get({
      institutionId: $stateParams.institutionId
    }).$promise;
  }

  newInstitution.$inject = ['InstitutionsService'];

  function newInstitution(InstitutionsService) {
    return new InstitutionsService();
  }
})();
