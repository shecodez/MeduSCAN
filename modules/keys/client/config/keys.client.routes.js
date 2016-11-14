(function () {
  'use strict';

  angular
    .module('keys')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('keys', {
        abstract: true,
        url: '/keys',
        template: '<ui-view/>'
      })
      .state('keys.list', {
        url: '',
        templateUrl: 'modules/keys/client/views/list-keys.client.view.html',
        controller: 'KeysListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: 'Keys List'
        }
      })
      .state('keys.create', {
        url: '/create',
        templateUrl: 'modules/keys/client/views/form-key.client.view.html',
        controller: 'KeysController',
        controllerAs: 'vm',
        resolve: {
          keyResolve: newKey
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Keys Create'
        }
      })
      .state('keys.edit', {
        url: '/:keyId/edit',
        templateUrl: 'modules/keys/client/views/form-key.client.view.html',
        controller: 'KeysController',
        controllerAs: 'vm',
        resolve: {
          keyResolve: getKey
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Edit Key {{ keyResolve.name }}'
        }
      })
      .state('keys.view', {
        url: '/:keyId',
        templateUrl: 'modules/keys/client/views/view-key.client.view.html',
        controller: 'KeysController',
        controllerAs: 'vm',
        resolve: {
          keyResolve: getKey
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Key {{ articleResolve.name }}'
        }
      });
  }

  getKey.$inject = ['$stateParams', 'KeysService'];

  function getKey($stateParams, KeysService) {
    return KeysService.get({
      keyId: $stateParams.keyId
    }).$promise;
  }

  newKey.$inject = ['KeysService'];

  function newKey(KeysService) {
    return new KeysService();
  }
})();
