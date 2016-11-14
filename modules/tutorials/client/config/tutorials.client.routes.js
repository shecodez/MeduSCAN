(function () {
  'use strict';

  angular
    .module('tutorials')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('tutorials', {
        abstract: true,
        url: '/tutorials',
        template: '<ui-view/>'
      })
      .state('tutorials.list', {
        url: '',
        templateUrl: 'modules/tutorials/client/views/list-tutorials.client.view.html',
        controller: 'TutorialsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Tutorials List'
        }
      })
      .state('tutorials.create', {
        url: '/create',
        templateUrl: 'modules/tutorials/client/views/form-tutorial.client.view.html',
        controller: 'TutorialsController',
        controllerAs: 'vm',
        resolve: {
          tutorialResolve: newTutorial
        },
        data: {
          roles: ['admin'],
          pageTitle : 'Tutorials Create'
        }
      })
      .state('tutorials.edit', {
        url: '/:tutorialId/edit',
        templateUrl: 'modules/tutorials/client/views/form-tutorial.client.view.html',
        controller: 'TutorialsController',
        controllerAs: 'vm',
        resolve: {
          tutorialResolve: getTutorial
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Edit Tutorial {{ tutorialResolve.name }}'
        }
      })
      .state('tutorials.view', {
        url: '/:tutorialId',
        templateUrl: 'modules/tutorials/client/views/view-tutorial.client.view.html',
        controller: 'TutorialsController',
        controllerAs: 'vm',
        resolve: {
          tutorialResolve: getTutorial
        },
        data:{
          pageTitle: 'Tutorial {{ articleResolve.name }}'
        }
      });
  }

  getTutorial.$inject = ['$stateParams', 'TutorialsService'];

  function getTutorial($stateParams, TutorialsService) {
    return TutorialsService.get({
      tutorialId: $stateParams.tutorialId
    }).$promise;
  }

  newTutorial.$inject = ['TutorialsService'];

  function newTutorial(TutorialsService) {
    return new TutorialsService();
  }
})();
