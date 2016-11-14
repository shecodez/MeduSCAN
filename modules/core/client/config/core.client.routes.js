'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'modules/core/client/views/dashboard.client.view.html',
        controller: 'DashboardController',
        controllerAs: 'dvm'
      })
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/error/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/error/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/error/403.client.view.html',
      data: {
        ignoreState: true
      }
    });

    // About state routing
    $stateProvider.state('about', {
      url: '/about',
      templateUrl: 'modules/core/client/views/about.client.view.html'
    });

    // Getting Started state routing
    $stateProvider.state('getting_started', {
      url: '/getting-started',
      templateUrl: 'modules/core/client/views/getting_started.client.view.html'
    });

    // Contact state routing
    $stateProvider.state('contact', {
      url: '/contact',
      templateUrl: 'modules/core/client/views/contact.client.view.html'
    });

    // Students state routing
    $stateProvider
    .state('students', {
      url: '/students',
      templateUrl: 'modules/core/client/views/students.client.view.html'
    })
    /*.state('students_dashboard', {
      url: '/students/dashboard',
      templateUrl: 'modules/core/client/views/dashboard.client.view.html',
      data:{
        roles: ['student', 'admin'],
        pageTitle : 'Student Dashboard'
      }
    })*/;

    // Teachers state routing
    $stateProvider
    .state('teachers', {
      url: '/teachers',
      templateUrl: 'modules/core/client/views/teachers.client.view.html'
    })
    /*.state('teachers_dashboard', {
      url: '/teachers/dashboard',
      templateUrl: 'modules/core/client/views/dashboard.client.view.html',
      data: {
        roles: ['teacher', 'admin'],
        pageTitle : 'Teacher Dashboard'
      }
    })*/;
  }
]);
