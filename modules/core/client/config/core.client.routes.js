(function () {
  'use strict';

  angular
    .module('core.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/client/views/home.client.view.html',
        controller: 'HomeController',
        controllerAs: 'vm'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/error/404.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Not-Found'
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/error/400.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Bad-Request'
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/error/403.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Forbidden'
        }
      });

    // Dashboard state routing
    $stateProvider.state('dashboard', {
      url: '/dashboard',
      templateUrl: 'modules/core/client/views/dashboard.client.view.html',
      controller: 'DashboardController',
      controllerAs: 'vm'
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

    // Student state routing
    $stateProvider.state('students', {
      url: '/students',
      templateUrl: 'modules/core/client/views/students.client.view.html'
    });

    // Teacher state routing
    $stateProvider.state('teachers', {
      url: '/teachers',
      templateUrl: 'modules/core/client/views/teachers.client.view.html'
    });
  }
}());
