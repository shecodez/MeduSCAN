(function (window) {
  'use strict';

  var applicationModuleName = 'meduscan';

  var service = {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'angularFileUpload', 'ngMaterial', 'io-barcode', 'mdPickers', 'AngularPrint'],
    registerModule: registerModule
  };

  window.ApplicationConfiguration = service;

  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  }
}(window));

(function (app) {
  'use strict';

  // Start by defining the main module and adding the module dependencies
  angular
    .module(app.applicationModuleName, app.applicationModuleVendorDependencies);

  // Setting HTML5 Location Mode
  angular
    .module(app.applicationModuleName)
    .config(bootstrapConfig);

  function bootstrapConfig($locationProvider, $httpProvider, $mdThemingProvider, $mdIconProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');

    $mdThemingProvider.theme('default')
      .primaryPalette('cyan')
      .accentPalette('yellow');

    // Register 'avatar' icons
    $mdIconProvider
      .defaultIconSet('public/assets/svg/avatars.svg', 128);
  }

  bootstrapConfig.$inject = ['$locationProvider', '$httpProvider', '$mdThemingProvider', '$mdIconProvider'];

  // Then define the init function for starting up the application
  angular.element(document).ready(init);

  function init() {
    // Fixing facebook bug with redirect
    if (window.location.hash && window.location.hash === '#_=_') {
      if (window.history && history.pushState) {
        window.history.pushState('', document.title, window.location.pathname);
      } else {
        // Prevent scrolling by storing the page's current scroll offset
        var scroll = {
          top: document.body.scrollTop,
          left: document.body.scrollLeft
        };
        window.location.hash = '';
        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scroll.top;
        document.body.scrollLeft = scroll.left;
      }
    }

    // Then init the app
    angular.bootstrap(document, [app.applicationModuleName]);
  }
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('blogs');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('chat', ['core']);
  app.registerModule('chat.routes', ['ui.router', 'core.routes']);
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('core');
  app.registerModule('core.routes', ['ui.router']);
  app.registerModule('core.admin', ['core']);
  app.registerModule('core.admin.routes', ['ui.router']);
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('courses');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('institutions');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('keys');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('medications');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('patients');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('requests');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('tutorials');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('users');
  app.registerModule('users.admin');
  app.registerModule('users.admin.routes', ['ui.router', 'core.routes', 'users.admin.services']);
  app.registerModule('users.admin.services');
  app.registerModule('users.routes', ['ui.router', 'core.routes']);
  app.registerModule('users.services');
}(ApplicationConfiguration));

(function () {
  'use strict';

  angular
    .module('blogs')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('blogs', {
        abstract: true,
        url: '/blogs',
        template: '<ui-view/>'
      })
      .state('blogs.list', {
        url: '',
        templateUrl: 'modules/blogs/client/views/list-blogs.client.view.html',
        controller: 'BlogsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Blogs List'
        }
      })
      .state('blogs.create', {
        url: '/create',
        templateUrl: 'modules/blogs/client/views/form-blog.client.view.html',
        controller: 'BlogsController',
        controllerAs: 'vm',
        resolve: {
          blogResolve: newBlog
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Blogs Create'
        }
      })
      .state('blogs.edit', {
        url: '/:blogId/edit',
        templateUrl: 'modules/blogs/client/views/form-blog.client.view.html',
        controller: 'BlogsController',
        controllerAs: 'vm',
        resolve: {
          blogResolve: getBlog
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Edit Blog {{ blogResolve.name }}'
        }
      })
      .state('blogs.view', {
        url: '/:blogId',
        templateUrl: 'modules/blogs/client/views/view-blog.client.view.html',
        controller: 'BlogsController',
        controllerAs: 'vm',
        resolve: {
          blogResolve: getBlog
        },
        data: {
          pageTitle: 'Blog {{ articleResolve.name }}'
        }
      });
  }

  getBlog.$inject = ['$stateParams', 'BlogsService'];

  function getBlog($stateParams, BlogsService) {
    return BlogsService.get({
      blogId: $stateParams.blogId
    }).$promise;
  }

  newBlog.$inject = ['BlogsService'];

  function newBlog(BlogsService) {
    return new BlogsService();
  }
})();

(function () {
  'use strict';

  // Blogs controller
  angular
    .module('blogs')
    .controller('BlogsController', BlogsController);

  BlogsController.$inject = ['$scope', '$state', 'Authentication', 'blogResolve'];

  function BlogsController ($scope, $state, Authentication, blog) {
    var vm = this;

    vm.authentication = Authentication;
    vm.blog = blog;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Blog
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.blog.$remove($state.go('blogs.list'));
      }
    }

    // Save Blog
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.blogForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.blog._id) {
        vm.blog.$update(successCallback, errorCallback);
      } else {
        vm.blog.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('blogs.view', {
          blogId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

(function () {
  'use strict';

  angular
    .module('blogs')
    .controller('BlogsListController', BlogsListController);

  BlogsListController.$inject = ['BlogsService'];

  function BlogsListController(BlogsService) {
    var vm = this;

    vm.blogs = BlogsService.query();
  }
})();

// Blogs service used to communicate Blogs REST endpoints
(function () {
  'use strict';

  angular
    .module('blogs')
    .factory('BlogsService', BlogsService);

  BlogsService.$inject = ['$resource'];

  function BlogsService($resource) {
    return $resource('api/blogs/:blogId', {
      blogId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

(function () {
  'use strict';

  angular
    .module('chat')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Chat',
      state: 'chat'
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('chat.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    /* $stateProvider
      .state('chat', {
        url: '/chat',
        templateUrl: 'modules/chat/client/views/chat.client.view.html',
        controller: 'ChatController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Chat'
        }
      }); */
  }
}());

(function () {
  'use strict';

  angular
    .module('chat')
    .controller('ChatController', ChatController);

  ChatController.$inject = ['$scope', '$state', 'Authentication', 'Socket'];

  function ChatController($scope, $state, Authentication, Socket) {
    var vm = this;

    vm.messages = [];
    vm.messageText = '';
    vm.sendMessage = sendMessage;

    init();

    function init() {
      // If user is not signed in then redirect back home
      if (!Authentication.user) {
        $state.go('home');
      }

      // Make sure the Socket is connected
      if (!Socket.socket) {
        Socket.connect();
      }

      // Add an event listener to the 'chatMessage' event
      Socket.on('chatMessage', function (message) {
        vm.messages.unshift(message);
      });

      // Remove the event listener when the controller instance is destroyed
      $scope.$on('$destroy', function () {
        Socket.removeListener('chatMessage');
      });
    }

    // Create a controller method for sending messages
    function sendMessage() {
      // Create a new message object
      var message = {
        text: vm.messageText
      };

      // Emit a 'chatMessage' message event
      Socket.emit('chatMessage', message);

      // Clear the message text
      vm.messageText = '';
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('core.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenu('account', {
      roles: ['user']
    });

    menuService.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile',
      state: 'settings.profile'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile Picture',
      state: 'settings.picture'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Change Password',
      state: 'settings.password'
    });

    /* menuService.addSubMenuItem('account', 'settings', {
      title: 'Manage Social Accounts',
      state: 'settings.accounts'
    }); */
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .run(routeFilter);

  routeFilter.$inject = ['$rootScope', '$state', 'Authentication'];

  function routeFilter($rootScope, $state, Authentication) {
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeStart(event, toState, toParams, fromState, fromParams) {
      // Check authentication before changing state
      if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
        var allowed = false;

        for (var i = 0, roles = toState.data.roles; i < roles.length; i++) {
          if ((roles[i] === 'guest') || (Authentication.user && Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(roles[i]) !== -1)) {
            allowed = true;
            break;
          }
        }

        if (!allowed) {
          event.preventDefault();
          if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
            $state.transitionTo('forbidden');
          } else {
            $state.go('authentication.signin').then(function () {
              // Record previous state
              storePreviousState(toState, toParams);
            });
          }
        }
      }
    }

    function stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
      // Record previous state
      storePreviousState(fromState, fromParams);
    }

    // Store previous state
    function storePreviousState(state, params) {
      // only store this state if it shouldn't be ignored
      if (!state.data || !state.data.ignoreState) {
        $state.previous = {
          state: state,
          params: params,
          href: $state.href(state, params)
        };
      }
    }
  }
}());

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

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('AboutController', AboutController);

  // AboutController.$inject = [];

  function AboutController() {
    var vm = this;

    vm.testimonials = [
      {
        blockQuote: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et cupiditate deleniti ratione in. Expedita nemo, quisquam, fuga adipisci omnis ad mollitia libero culpa nostrum est quia eos esse vel!',
        name: 'FirstName LastName',
        company: 'GCSU Health Sciences'
      },
      {
        blockQuote: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et cupiditate deleniti ratione in. Expedita nemo, quisquam, fuga adipisci omnis ad mollitia libero culpa nostrum est quia eos esse vel!',
        name: 'FirstName LastName',
        company: 'company2'
      }
    ];
  }
}());

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('ContactController', ContactController);

  ContactController.$inject = ['$scope', '$http', 'toastService'];

  function ContactController($scope, $http, toastService) {
    // var vm = this;

    this.sendMail = function (form) {

      // Get the form data
      var data = ({
        contactName: this.contactName,
        contactEmail: this.contactEmail,
        contactMsg: this.contactMsg
      });

      // Contact POST request
      $http({
        method: 'POST',
        url: '/contact',
        data: data
      }).then(
        function successCallback(response) {
          toastService.simpleToast('Message sent. Thanks ' + response.data.contactName + '!');
        },
        function errorCallback(response) {
        });

      // Clear form
      this.contactName = '';
      this.contactEmail = '';
      this.contactMsg = '';
      $scope.resetForm(form);

    };

    $scope.resetForm = function (form) {
      form.$setPristine();
      form.$setUntouched();
    };
  }
}());

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['Authentication'];

  function DashboardController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;

    if (vm.authentication.user._id) {
      vm.role = vm.authentication.user.roles[0];
    }

    function init() {
      if (vm.authentication.user._id) {
        vm.role = vm.authentication.user.roles[0];
      }
    }

    this.studentsTiles = buildGridModelS({
      icon: '',
      title: '',
      href: '',
      background: ''
    });
    function buildGridModelS(tileTmpl) {
      var it = [];
      var results = [];
      var icons = ['search', 'dashboard', 'home', 'input'];
      var titles = ['Patient Lookup', 'Dashboard', 'Home', 'Request Join'];
      var links = ['patient-lookup', 'dashboard', 'home', 'request-join'];
      for (var i = 0; i < 4; i++) {
        it = angular.extend({}, tileTmpl);
        it.icon = it.icon + icons[i];
        it.title = it.title + titles[i];
        it.href = it.href + links[i];
        it.span = { row: 1, col: 1 };
        switch (i + 1) {
          case 1:
            it.background = 'gold-bg';
            it.span.col = 2;
            break;
          case 2:
            it.background = 'pink-bg';
            break;
          case 3:
            it.background = 'blue-bg';
            break;
          case 4:
            it.background = 'mint-bg';
            it.span.col = 2;
            break;
        }
        results.push(it);
      }
      return results;
    }

    this.teachersTiles = buildGridModelT({
      icon: '',
      title: '',
      href: '',
      background: ''
    });
    function buildGridModelT(tileTmpl) {
      var it = [];
      var results = [];
      var icons = ['assignment_ind', 'search', 'date_range', 'add_box'];
      var titles = ['Patients', 'Patient Lookup', 'Courses', 'Medications'];
      var links = ['patients.list', 'patient-lookup', 'courses.list', 'medications.list'];
      for (var i = 0; i < 4; i++) {
        it = angular.extend({}, tileTmpl);
        it.icon = it.icon + icons[i];
        it.title = it.title + titles[i];
        it.href = it.href + links[i];
        it.span = { row: 1, col: 1 };
        switch (i + 1) {
          case 1:
            it.background = 'pink-bg';
            it.span.col = 2;
            break;
          case 2:
            it.background = 'mint-bg';
            break;
          case 3:
            it.background = 'blue-bg';
            break;
          case 4:
            it.background = 'gold-bg';
            it.span.col = 2;
            break;
        }
        results.push(it);
      }
      return results;
    }

    init();
  }
}());

/* For ADMIN (later use)

 inject CoursesService

 vm.courseCount = CoursesService.countCourses(); // returns a count of courses for the admin dashboard

 in view {{vm.courseCount.count}}

 */

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('GettingStartedController', GettingStartedController);

  // GettingStartedController.$inject = [];

  function GettingStartedController() {
    var vm = this;

    this.tiles = buildGridModel({
      icon: '',
      title: '',
      href: '',
      background: ''
    });
    function buildGridModel(tileTmpl) {
      var it = [];
      var results = [];
      var icons = ['fa-university', 'fa-graduation-cap', 'fa-users', 'fa-thumbs-o-up'];
      var titles = ['Teachers', 'Students', 'Partners', 'Investors'];
      var links = ['teachers', 'students', 'contact', 'contact'];
      for (var i = 0; i < 4; i++) {
        it = angular.extend({}, tileTmpl);
        it.icon = it.icon + icons[i];
        it.title = it.title + titles[i];
        it.href = it.href + links[i];
        it.span = { row: 1, col: 1 };
        switch (i + 1) {
          case 1:
            it.background = 'lime-bg';
            break;
          case 2:
            it.background = 'blue-bg';
            break;
          case 3:
            it.background = 'gold-bg';
            break;
          case 4:
            it.background = 'pink-bg';
            break;
        }
        results.push(it);
      }
      return results;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'Authentication', 'menuService', '$mdSidenav', '$mdDialog'];

  function HeaderController($scope, $state, Authentication, menuService, $mdSidenav, $mdDialog) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    // TODO Move to menuService
    vm.coreLinks = [
      { icon: 'home', label: 'Home', goTo: 'home' },
      { icon: 'group', label: 'About Us', goTo: 'about' },
      { icon: 'important_devices', label: 'Getting Started', goTo: 'getting_started' },
      { icon: 'account_balance', label: 'Teachers', goTo: 'teachers' },
      { icon: 'school', label: 'Students', goTo: 'students' },
      { icon: 'view_day', label: 'Blogs', goTo: 'blogs.list' },
      { icon: 'desktop_mac', label: 'Tutorials', goTo: 'tutorials.list' },
      { icon: 'send', label: 'Contact Us', goTo: 'contact' }
    ];

    // ---- Open legal dialog -----------------------------------
    vm.openLegalDialog = function () {
      $mdDialog.show({
        templateUrl: 'modules/core/client/views/dialogs/legal.client.dialog.html',
        controller: ["$scope", "$mdDialog", function ($scope, $mdDialog) {

          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        parent: angular.element(document.body)
      });
    };

    // ---- Open profile dropdown -------------------------------
    var originatorEv;
    this.openProfileMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    // ---- Toggle Menu & Close ---------------------------------

    vm.toggleMenu = function () {
      $mdSidenav('menu').toggle();
    };
    vm.close = function () {
      $mdSidenav('menu').close();
    };

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$window'];

  function HomeController($window) {
    var vm = this;

    // GridList (Tiles)
    this.tiles = buildGridModel({
      icon: '',
      title: '',
      href: '',
      background: ''
    });

    function buildGridModel(tileTmpl) {
      var it = [];
      var results = [];
      var icons = ['fa-group', 'fa-heartbeat', 'fa-university', 'fa-graduation-cap', 'fa-newspaper-o', 'fa-tv', 'fa-send-o'];
      var titles = ['About Us', 'Getting Started', 'Teachers', 'Students', 'Blog', 'Tutorials', 'Contact Us'];
      var links = ['about', 'getting_started', 'teachers', 'students', 'blogs.list', 'tutorials.list', 'contact'];

      for (var i = 0; i < 7; i++) {
        it = angular.extend({}, tileTmpl);
        it.icon = it.icon + icons[i];
        it.title = it.title + titles[i];
        it.href = it.href + links[i];
        it.span = { row: 1, col: 1 };
        switch (i + 1) {
          case 1:
            it.background = 'gold-bg';
            it.span.col = 2;
            break;
          case 2:
            it.background = 'primary-bg';
            it.span.row = it.span.col = 2;
            break;
          case 3:
            it.background = 'lime-bg';
            break;
          case 4:
            it.background = 'blue-bg';
            break;
          case 5:
            it.background = 'aqua-bg';
            break;
          case 6:
            it.background = 'mint-bg';
            break;
          case 7:
            it.background = 'pink-bg';
            it.span.col = 2;
            break;
        }
        results.push(it);
      }
      return results;
    }

    vm.news = {};
    vm.news.text = 'Welcome to the MeduSCAN Beta Test!';
    vm.news.author = '@MeduSCAN';
    vm.news.date = $window.moment('20160628', 'YYYYMMDD').fromNow();
  }
}());

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('NavigationController', NavigationController);

  NavigationController.$inject = ['Authentication', '$mdSidenav'];

  function NavigationController(Authentication, $mdSidenav) {
    var vm = this;
    vm.authentication = Authentication;
    vm.role = {};

    function init() {
      if (vm.authentication.user._id) {
        vm.role = vm.authentication.user.roles[0];
      }
    }
    init();

    if (vm.role) {
      if (vm.role === 'admin') {
        vm.sideBarLinks = [
          { icon: 'home', label: 'Home', href: 'home' },
          { icon: 'dashboard', label: 'Dashboard', href: 'dashboard' },
          { icon: 'people', label: 'Users', href: 'admin.users' },
          { icon: 'account_balance', label: 'Institutions', href: 'institutions.list' },
          { icon: 'input', label: 'Requests', href: 'requests.list' },
          { icon: 'vpn_key', label: 'Keys', href: 'keys.list' }

          // {icon: 'assignment_ind',label: 'Patients',      href: 'patients.list'},
          // {icon: 'add_box',       label: 'Medications',   href: 'medications.list'},
          // {icon: 'date_range',    label: 'Courses',       href: 'courses.list'},
          // {icon: 'search',        label: 'Patient Lookup',href: 'patient-lookup'}
        ];
      }
      if (vm.role === 'student') {
        vm.sideBarLinks = [
          { icon: 'home', label: 'Home', href: 'home' },
          { icon: 'dashboard', label: 'Dashboard', href: 'dashboard' },
          { icon: 'input', label: 'Join Course', href: 'request-join' },
          { icon: 'search', label: 'Patient Lookup', href: 'patient-lookup' }
        ];
      }
      if (vm.role === 'teacher') {
        vm.sideBarLinks = [
          { icon: 'home', label: 'Home', href: 'home' },
          { icon: 'dashboard', label: 'Dashboard', href: 'dashboard' },
          { icon: 'assignment_ind', label: 'Patients', href: 'patients.list' },
          { icon: 'add_box', label: 'Medications', href: 'medications.list' },
          { icon: 'date_range', label: 'Courses', href: 'courses.list' },
          { icon: 'input', label: 'Join Institute', href: 'request-join' },
          { icon: 'search', label: 'Patient Lookup', href: 'patient-lookup' }
        ];
      }
    }

    // ---- Toggle Menu & Close ---------------------------------

    /* vm.toggleMenu = function() {
     $mdSidenav('menu').toggle();
     };
     vm.close = function() {
     $mdSidenav('menu').close();
     }; */
  }
}());

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('StudentsController', StudentsController);

  StudentsController.$inject = ['Authentication'];

  function StudentsController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;

    function init() {
      if (vm.authentication.user._id) {
        vm.role = vm.authentication.user.roles[0];
      }
    }
    init();
  }
}());

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('TeachersController', TeachersController);

  TeachersController.$inject = ['Authentication'];

  function TeachersController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;

    function init() {
      if (vm.authentication.user._id) {
        vm.role = vm.authentication.user.roles[0];
      }
    }
    init();
  }
}());

'use strict';

angular.module('core')
  .directive('owlCarousel', function () {
    return {
      restrict: 'E',
      transclude: false,
      link: function (scope) {
        scope.initCarousel = function (element) {
          // provide any default options you want
          var defaultOptions = {};
          var customOptions = scope.$eval(element.attr('data-options'));
          // combine the two options objects
          for (var key in customOptions) {
            if (customOptions.hasOwnProperty(key)) {
              defaultOptions[key] = customOptions[key];
            }
          }
          // init carousel
          element.owlCarousel(defaultOptions);
        };
      }
    };
  })
  .directive('owlCarouselItem', [function () {
    return {
      restrict: 'A',
      transclude: false,
      link: function (scope, element) {
        // wait for the last item in the ng-repeat then call init
        if (scope.$last) {
          scope.initCarousel(element.parent());
        }
      }
    };
  }]);

(function () {
  'use strict';

  angular.module('core')
    .directive('pageTitle', pageTitle);

  pageTitle.$inject = ['$rootScope', '$timeout', '$interpolate', '$state'];

  function pageTitle($rootScope, $timeout, $interpolate, $state) {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {
      $rootScope.$on('$stateChangeSuccess', listener);

      function listener(event, toState) {
        var title = (getTitle($state.$current));
        $timeout(function () {
          element.text(title);
        }, 0, false);
      }

      function getTitle(currentState) {
        var applicationCoreTitle = 'MeduSCAN';
        var workingState = currentState;
        if (currentState.data) {
          workingState = (typeof workingState.locals !== 'undefined') ? workingState.locals.globals : workingState;
          var stateTitle = $interpolate(currentState.data.pageTitle)(workingState);
          return applicationCoreTitle + ' - ' + stateTitle;
        } else {
          return applicationCoreTitle;
        }
      }
    }
  }
}());

(function () {
  'use strict';

  // https://gist.github.com/rhutchison/c8c14946e88a1c8f9216

  angular
    .module('core')
    .directive('showErrors', showErrors);

  showErrors.$inject = ['$timeout', '$interpolate'];

  function showErrors($timeout, $interpolate) {
    var directive = {
      restrict: 'A',
      require: '^form',
      compile: compile
    };

    return directive;

    function compile(elem, attrs) {
      if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
        if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
          throw new Error('show-errors element does not have the \'form-group\' or \'input-group\' class');
        }
      }

      return linkFn;

      function linkFn(scope, el, attrs, formCtrl) {
        var inputEl,
          inputName,
          inputNgEl,
          options,
          showSuccess,
          initCheck = false,
          showValidationMessages = false;

        options = scope.$eval(attrs.showErrors) || {};
        showSuccess = options.showSuccess || false;
        inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
        inputNgEl = angular.element(inputEl);
        inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

        if (!inputName) {
          throw new Error('show-errors element has no child input elements with a \'name\' attribute class');
        }

        scope.$watch(function () {
          return formCtrl[inputName] && formCtrl[inputName].$invalid;
        }, toggleClasses);

        scope.$on('show-errors-check-validity', checkValidity);
        scope.$on('show-errors-reset', reset);

        function checkValidity(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            initCheck = true;
            showValidationMessages = true;

            return toggleClasses(formCtrl[inputName].$invalid);
          }
        }

        function reset(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            return $timeout(function () {
              el.removeClass('has-error');
              el.removeClass('has-success');
              showValidationMessages = false;
            }, 0, false);
          }
        }

        function toggleClasses(invalid) {
          el.toggleClass('has-error', showValidationMessages && invalid);

          if (showSuccess) {
            return el.toggleClass('has-success', showValidationMessages && !invalid);
          }
        }
      }
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .factory('authInterceptor', authInterceptor);

  authInterceptor.$inject = ['$q', '$injector', 'Authentication'];

  function authInterceptor($q, $injector, Authentication) {
    var service = {
      responseError: responseError
    };

    return service;

    function responseError(rejection) {
      if (!rejection.config.ignoreAuthModule) {
        switch (rejection.status) {
          case 401:
            // Deauthenticate the global user
            Authentication.user = null;
            $injector.get('$state').transitionTo('authentication.signin');
            break;
          case 403:
            $injector.get('$state').transitionTo('forbidden');
            break;
        }
      }
      // otherwise, default behaviour
      return $q.reject(rejection);
    }
  }
}());

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .factory('mailingService', mailingService);

  mailingService.$inject = [/* Example: '$state', '$window' */];

  function mailingService(/* Example: $state, $window */) {
    // MailingService service logic
    // ...

    // Public API
    return {
      someMethod: function () {
        return true;
      }
    };
  }
})();

(function () {
  'use strict';

  angular
    .module('core')
    .factory('menuService', menuService);

  function menuService() {
    var shouldRender;
    var service = {
      addMenu: addMenu,
      addMenuItem: addMenuItem,
      addSubMenuItem: addSubMenuItem,
      defaultRoles: ['user', 'admin'],
      getMenu: getMenu,
      menus: {},
      removeMenu: removeMenu,
      removeMenuItem: removeMenuItem,
      removeSubMenuItem: removeSubMenuItem,
      validateMenuExistence: validateMenuExistence
    };

    init();

    return service;

    // Add new menu object by menu id
    function addMenu(menuId, options) {
      options = options || {};

      // Create the new menu
      service.menus[menuId] = {
        roles: options.roles || service.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return service.menus[menuId];
    }

    // Add menu item object
    function addMenuItem(menuId, options) {
      options = options || {};

      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Push new menu item
      service.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          if (options.items.hasOwnProperty(i)) {
            service.addSubMenuItem(menuId, options.state, options.items[i]);
          }
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Add submenu item object
    function addSubMenuItem(menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item
      for (var itemIndex in service.menus[menuId].items) {
        if (service.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          service.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Get the menu object by menu id
    function getMenu(menuId) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Return the menu object
      return service.menus[menuId];
    }

    function init() {
      // A private function for rendering decision
      shouldRender = function (user) {
        if (this.roles.indexOf('*') !== -1) {
          return true;
        } else {
          if (!user) {
            return false;
          }

          for (var userRoleIndex in user.roles) {
            if (user.roles.hasOwnProperty(userRoleIndex)) {
              for (var roleIndex in this.roles) {
                if (this.roles.hasOwnProperty(roleIndex) && this.roles[roleIndex] === user.roles[userRoleIndex]) {
                  return true;
                }
              }
            }
          }
        }

        return false;
      };

      // Adding the topbar menu
      addMenu('topbar', {
        roles: ['*']
      });
    }

    // Remove existing menu object by menu id
    function removeMenu(menuId) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      delete service.menus[menuId];
    }

    // Remove existing menu object by menu id
    function removeMenuItem(menuId, menuItemState) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item to remove
      for (var itemIndex in service.menus[menuId].items) {
        if (service.menus[menuId].items.hasOwnProperty(itemIndex) && service.menus[menuId].items[itemIndex].state === menuItemState) {
          service.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Remove existing menu object by menu id
    function removeSubMenuItem(menuId, submenuItemState) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item to remove
      for (var itemIndex in service.menus[menuId].items) {
        if (this.menus[menuId].items.hasOwnProperty(itemIndex)) {
          for (var subitemIndex in service.menus[menuId].items[itemIndex].items) {
            if (this.menus[menuId].items[itemIndex].items.hasOwnProperty(subitemIndex) && service.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
              service.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
            }
          }
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Validate menu existance
    function validateMenuExistence(menuId) {
      if (menuId && menuId.length) {
        if (service.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
    }
  }
}());

(function () {
  'use strict';

  // Create the Socket.io wrapper service
  angular
    .module('core')
    .factory('Socket', Socket);

  Socket.$inject = ['Authentication', '$state', '$timeout'];

  function Socket(Authentication, $state, $timeout) {
    var service = {
      connect: connect,
      emit: emit,
      on: on,
      removeListener: removeListener,
      socket: null
    };

    connect();

    return service;

    // Connect to Socket.io server
    function connect() {
      // Connect only when authenticated
      if (Authentication.user) {
        service.socket = io();
      }
    }

    // Wrap the Socket.io 'emit' method
    function emit(eventName, data) {
      if (service.socket) {
        service.socket.emit(eventName, data);
      }
    }

    // Wrap the Socket.io 'on' method
    function on(eventName, callback) {
      if (service.socket) {
        service.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    }

    // Wrap the Socket.io 'removeListener' method
    function removeListener(eventName) {
      if (service.socket) {
        service.socket.removeListener(eventName);
      }
    }
  }
}());

/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .factory('toastService', toastService);

  toastService.$inject = ['$mdToast'];

  function toastService($mdToast) {
    // ToastService service logic

    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };
    var toastPosition = angular.extend({}, last);
    var getToastPosition = function () {
      sanitizePosition();
      return Object.keys(toastPosition)
        .filter(function (pos) {
          return toastPosition[pos];
        })
        .join(' ');
    };

    function sanitizePosition() {
      var current = toastPosition;
      if (current.bottom && last.top) current.top = false;
      if (current.top && last.bottom) current.bottom = false;
      if (current.right && last.left) current.left = false;
      if (current.left && last.right) current.right = false;
      last = angular.extend({}, current);
    }

    var simpleToast = function (message) {
      var pinTo = getToastPosition();
      var toast = $mdToast.simple()
        .textContent(message)
        .action('X')
        .position(pinTo);

      $mdToast.show(toast).then(
        function (response) {
          if (response === 'ok') {
            $mdToast.hide();
          }
        }
      );
    };


    // Public API
    return {
      simpleToast: simpleToast
    };
  }
})();

(function () {
  'use strict';

  angular
    .module('courses')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('courses', {
        abstract: true,
        url: '/courses',
        template: '<ui-view/>'
      })
      .state('courses.list', {
        url: '',
        templateUrl: 'modules/courses/client/views/list-courses.client.view.html',
        controller: 'CoursesListController',
        controllerAs: 'vm',
        data: {
          roles: ['student', 'teacher', 'admin'],
          pageTitle: 'Courses List'
        }
      })
      .state('courses.create', {
        url: '/create',
        templateUrl: 'modules/courses/client/views/form-course.client.view.html',
        controller: 'CoursesController',
        controllerAs: 'vm',
        resolve: {
          courseResolve: newCourse
        },
        data: {
          roles: ['teacher', 'admin'],
          pageTitle: 'Courses Create'
        }
      })
      .state('courses.edit', {
        url: '/:courseId/edit',
        templateUrl: 'modules/courses/client/views/form-course.client.view.html',
        controller: 'CoursesController',
        controllerAs: 'vm',
        resolve: {
          courseResolve: getCourse
        },
        data: {
          roles: ['teacher', 'admin'],
          pageTitle: 'Edit Course {{ courseResolve.name }}'
        }
      })
      .state('courses.view', {
        url: '/:courseId',
        templateUrl: 'modules/courses/client/views/view-course.client.view.html',
        controller: 'CoursesController',
        controllerAs: 'vm',
        resolve: {
          courseResolve: getCourse
        },
        data: {
          pageTitle: 'Course {{ articleResolve.name }}'
        }
      });
  }

  getCourse.$inject = ['$stateParams', 'CoursesService'];

  function getCourse($stateParams, CoursesService) {
    return CoursesService.get({
      courseId: $stateParams.courseId
    }).$promise;
  }

  newCourse.$inject = ['CoursesService'];

  function newCourse(CoursesService) {
    return new CoursesService();
  }
})();

(function () {
  'use strict';

  // Courses controller
  angular
    .module('courses')
    .controller('CoursesController', CoursesController);

  CoursesController.$inject = ['$scope', '$state', 'Authentication', 'courseResolve', 'DataFactory', 'confirmDialog', 'generateRequest', 'toastService', '$mdDialog'];

  function CoursesController($scope, $state, Authentication, course, DataFactory, confirmDialog, generateRequest, toastService, $mdDialog) {
    var vm = this;
    vm.authentication = Authentication;
    vm.course = course;
    vm.courseStudents = [];
    vm.coursePatients = [];
    vm.subscribers = [];
    vm.patients = [];
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // console.log(vm.course);

    // md-select options
    vm.statusOpts = [
      { label: 'Active', value: true },
      { label: 'Inactive', value: false }
    ];
    vm.studentStatusOpts = [
      { id: 1, value: 'Pending' },
      { id: 2, value: 'Approved' },
      { id: 3, value: 'Denied' }
    ];

    // Course date logic
    vm.date = new Date();
    vm.minStartDate = vm.date;
    vm.maxStartDate = '';  // should be user's 'institution.keyExpiration' Date
    vm.minEndDate = vm.date.setDate((new Date()).getDate() + 1);
    vm.maxEndDate = '';    // should be user's 'institution.keyExpiration' Date

    vm.user = {};
    vm.user.canEdit = function () {
      var hasPermission = false;
      if (vm.authentication.user) {
        for (var i = 0; i < vm.authentication.user.roles.length; i++) {
          if (vm.authentication.user.roles[i] === 'admin' || vm.authentication.user.roles[i] === 'teacher') {
            return true;
          }
        }
      }
      return hasPermission;
    };

    // Check Value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    if (vm.exist(vm.course.startDate)) {
      vm.course.startDate = new Date(vm.course.startDate);
    } else vm.course.startDate = new Date();

    if (vm.exist(vm.course.endDate)) {
      vm.course.endDate = new Date(vm.course.endDate);
    } else vm.course.endDate = new Date();

    if (vm.course._id) {
      vm.isCurrentUserOwner = course.isCurrentUserOwner;
    }
    // ToDO: Add 'loading...' gif to display in tabs
    function init() {
      if (vm.course._id) {
        vm.course.isCurrentUserOwner = vm.isCurrentUserOwner;

        if (vm.course.students.length) {
          DataFactory.getData('courses', vm.course._id).then(
            function (res) {
              vm.courseStudents = res.students;
              for (var i = 0; i < vm.courseStudents.length; i++) {
                vm.courseStudents[i].statusUnchanged = true;
              }
              // console.log(vm.courseStudents);
            },
            function (err) {
              vm.error = err;
            }
          );
        }
        if (vm.course.patients.length) {
          DataFactory.getData('courses', vm.course._id).then(
            function (res) {
              vm.coursePatients = res.patients;
              for (var i = 0; i < vm.coursePatients.length; i++) {
                vm.coursePatients[i].statusUnchanged = true;
              }
              // console.log(vm.coursePatients);
            },
            function (err) {
              vm.error = err;
            }
          );
        }
      }
    }

    // Get patients and subscribers --------------------------------------------------------------------------------
    if (vm.exist(vm.course.request)) {
      vm.subscribers = vm.course.request.subscribers;
    }

    vm.getPatients = function () {
      var data = 'patients';

      DataFactory.getListPromise(data).then(
        function (patients) {
          vm.patients = patients.data;
        },
        function (error) {
          vm.error = 'Failed to retrieve Patient Data. Make sure you create some first'; // +error.message
        }
      );
    };
    vm.getPatients();

    // ---- Open Dialog --------------------------------------------------------------------------------------------
    vm.openSubscribersDialog = function () {
      var subscribers = vm.getAddableSubscribers(vm.subscribers);

      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/requests/client/views/dialogs/subs-table.client.template.html',
        controller: ["$scope", "$mdDialog", "subscribers", function ($scope, $mdDialog, subscribers) {
          $scope.subscribers = subscribers;

          $scope.ok = function () {
            vm.addStudents(subscribers);
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        locals: {
          subscribers: subscribers
        },
        parent: angular.element(document.body)
      });
    };

    vm.openPatientsDialog = function () {
      // vm.getPatients();
      var patients = vm.getAddablePatients(vm.patients);

      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/dialogs/patients-table.client.dialog.html',
        controller: ["$scope", "$mdDialog", "patients", function ($scope, $mdDialog, patients) {
          $scope.patients = patients;

          $scope.ok = function () {
            vm.addPatients(patients);
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        locals: {
          patients: patients
        },
        parent: angular.element(document.body)
      });
    };

    // If already course student/patient mark isReadOnly--------------------------------------------------------
    vm.getAddableSubscribers = function (subscribers) {
      var tempSubs = [];

      angular.forEach(subscribers, function (subscriber) {
        if (vm.contains(vm.courseStudents, subscriber._id)) {
          subscriber.isReadOnly = true;
        } else {
          subscriber.isReadOnly = false;
        }
        tempSubs.push(subscriber);
      });
      return tempSubs;
    };

    vm.getAddablePatients = function (patients) {
      var tempPats = [];

      angular.forEach(patients, function (patient) {
        if (vm.containsPatient(vm.coursePatients, patient._id)) {
          patient.isReadOnly = true;
        } else {
          patient.isReadOnly = false;
        }
        tempPats.push(patient);
      });
      return tempPats;
    };
    // nested populate
    vm.contains = function (array, item) {
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id._id === item) {
          return true;
        }
      }
      return false;
    };
    vm.containsPatient = function (array, item) {
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id === item) {
          return true;
        }
      }
      return false;
    };

    // --- ADD -----------------------------------------------------------------------------------------------------
    vm.addStudents = function (subscribers) {
      angular.forEach(subscribers, function (subscriber) {
        if (subscriber.selected) {
          var student = {};
          student._id = subscriber._id;
          student.status = 'Pending';
          vm.course.students.push(student);
        }
      });
      vm.update('Student Added');
    };
    vm.addPatients = function (patients) {
      angular.forEach(patients, function (nPatient) {
        if (nPatient.selected) {
          var patient = {};
          patient._id = nPatient._id; // patient.status = true;
          vm.course.patients.push(patient);
        }
      });
      vm.update('Patient Added');
    };
    // --- REMOVE --------------------------------------------------------------------------------------------------
    vm.removeStudent = function (index) {
      vm.course.students.splice(index, 1);
      vm.courseStudents.splice(index, 1);
      vm.update('Student removed');
    };
    vm.removePatient = function (index) {
      vm.course.patients.splice(index, 1);
      vm.coursePatients.splice(index, 1);
      vm.update('Patient removed');
    };
    // --- UPDATE --------------------------------------------------------------------------------------------------
    vm.updateStudentStatus = function (student, index) {
      vm.course.students[index] = student;
      vm.update('Student status updated');
    };

    vm.update = function (action) {
      vm.course.$update(function (res) {
        toastService.simpleToast(action);
        init();
      }, function (err) {
        toastService.simpleToast('Oops, something went wrong.');
      });
    };

    // Generate Request ---------------------------------------------------------------------------------------
    vm.createRequest = function () {
      if (!vm.exist(vm.course.request)) {
        var requestData = {
          for_id: vm.course._id,
          type: 'Course',
          user: vm.authentication.user._id
        };
        generateRequest.courseRequest(requestData).then(
          function (request) {
            // console.log(request.data.request_id); <-- worried this will be undefined sometimes
            vm.course.request = request.data.request;
            toastService.simpleToast('Join ID successfully generated!');
          },
          function (error) {
            vm.error = 'Failed to generate course join ID. '; // +error.message
          }
        );
      }
    };

    // Remove existing Course ---------------------------------------------------------------------------------
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.course.$remove($state.go('courses.list'));
      }
    }

    // Save Course --------------------------------------------------------------------------------------------
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.courseForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.course._id) {
        vm.course.$update(successCallback, errorCallback);
      } else {
        vm.course.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('courses.view', {
          courseId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    init(); // Placement of this matters
  }
})();


/**
 * Created by Nicole J. Nobles on 6/2/2016.
 */

(function () {
  'use strict';

  angular
    .module('courses')
    .controller('JoinCourseController', JoinCourseController);

  JoinCourseController.$inject = [/* Example: '$scope', 'Authentication' */];

  function JoinCourseController(/* Example: $scope, Authentication */) {
    // var vm = this;
  }
})();

(function () {
  'use strict';

  angular
    .module('courses')
    .controller('CoursesListController', CoursesListController);

  CoursesListController.$inject = ['CoursesService', 'Authentication'];

  function CoursesListController(CoursesService, Authentication) {
    var vm = this;

    vm.authentication = Authentication;
    vm.courses = CoursesService.query();

    vm.user = {};
    vm.user.name = vm.authentication.user.displayName;
    vm.user.role = vm.authentication.user.roles;

    // This function is called more than once don't know why...
    vm.user.canCreate = function () {
      var hasPermission = false;
      if (vm.authentication.user.roles[0] === 'admin' || vm.authentication.user.roles[0] === 'teacher') {
        hasPermission = true;
      }
      return hasPermission;
    };

    vm.user.canJoin = function () {
      var hasPermission = false;
      if (vm.authentication.user.roles[0] === 'student') {
        hasPermission = true;
      }
      return hasPermission;
    };
  }
})();

// Courses service used to communicate Courses REST endpoints
(function () {
  'use strict';

  angular
    .module('courses')
    .factory('CoursesService', CoursesService);

  CoursesService.$inject = ['$resource'];

  function CoursesService($resource) {
    return $resource('api/courses/:courseId', {
      courseId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      countCourses: {
        method: 'GET',
        url: '/api/courses/count',
        isArray: false
      }
    });
  }
})();

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
          pageTitle: 'Institutions Create'
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
        data: {
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

(function () {
  'use strict';

  // Institutions controller
  angular
    .module('institutions')
    .controller('InstitutionsController', InstitutionsController);

  InstitutionsController.$inject = ['$scope', '$window', '$state', 'Authentication', 'institutionResolve', '$mdDialog', 'confirmDialog', 'generateRequest', 'DataFactory', 'toastService'];

  function InstitutionsController($scope, $window, $state, Authentication, institution, $mdDialog, confirmDialog, generateRequest, DataFactory, toastService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.institution = institution;
    vm.institutionTeachers = [];
    vm.subscribers = [];
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // console.log(vm.institution);

    // List Institution status boolean options
    vm.statusOpts = [
      { ID: 1, label: 'Active', value: true },
      { ID: 2, label: 'Inactive', value: false }
    ];
    vm.teacherStatusOpts = [
      { id: 1, value: 'Pending' },
      { id: 2, value: 'Approved' },
      { id: 3, value: 'Denied' }
    ];

    // Check if value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    if (vm.institution._id) {
      vm.isCurrentUserOwner = institution.isCurrentUserOwner;
    }
    // ToDO: Add 'loading...' gif
    function init() {
      if (vm.institution._id) {
        vm.institution.isCurrentUserOwner = vm.isCurrentUserOwner;

        if (vm.institution.teachers.length) {
          DataFactory.getData('institutions', vm.institution._id).then(
            function (res) {
              vm.institutionTeachers = res.teachers;
              for (var i = 0; i < vm.institutionTeachers.length; i ++) {
                vm.institutionTeachers[i].statusUnchanged = true;
              }
              // console.log(vm.institutionTeachers);
            },
            function (err) {
              vm.error = err;
            }
          );
        }
      }
    }

    // Get Subscribers ---------------------------------------------------------------------------------------------
    if (vm.exist(vm.institution.request)) {
      vm.subscribers = vm.institution.request.subscribers;
    }
    // Open Dialog -------------------------------------------------------------------------------------------------
    vm.openSubscribersDialog = function () {
      var subscribers = vm.getAddableSubscribers(vm.subscribers);

      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/requests/client/views/dialogs/subs-table.client.template.html',
        controller: ["$scope", "$mdDialog", "subscribers", function ($scope, $mdDialog, subscribers) {
          $scope.subscribers = subscribers;

          $scope.ok = function () {
            vm.addTeachers(subscribers);
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        locals: {
          subscribers: subscribers
        },
        parent: angular.element(document.body)
      });
    };

    // Mark subscribers that are already teachers isReadOnly--------------------------------------------------------
    vm.getAddableSubscribers = function (subscribers) {
      var tempSubs = [];

      angular.forEach(subscribers, function (subscriber) {
        if (vm.contains(vm.institutionTeachers, subscriber._id)) {
          subscriber.isReadOnly = true;
        } else {
          subscriber.isReadOnly = false;
        }
        tempSubs.push(subscriber);
      });
      return tempSubs;
    };

    vm.contains = function (array, item) {
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id._id === item) {
          return true;
        }
      }
      return false;
    };

    // ---- ADD ----------------------------------------------------------------------------------------------------
    vm.addTeachers = function (subscribers) {
      angular.forEach(subscribers, function (subscriber) {
        if (subscriber.selected) {
          var teacher = {};
          teacher._id = subscriber._id;
          teacher.status = 'Pending';
          vm.institution.teachers.push(teacher);
        }
      });
      vm.update('added');// update institution data & refresh
    };

    // ---- REMOVE -------------------------------------------------------------------------------------------------
    vm.removeTeacher = function (index) {
      vm.institution.teachers.splice(index, 1);
      vm.institutionTeachers.splice(index, 1);
      vm.update('removed');
    };

    // ---- UPDATE -------------------------------------------------------------------------------------------------
    vm.updateTeacherStatus = function (teacher, index) {
      vm.institution.teachers[index] = teacher;
      vm.update('status updated');
    };

    vm.update = function (action) {
      vm.institution.$update(function () {
        // $window.location.reload();
        toastService.simpleToast('Teacher ' + action);
        init();
      }, function (err) {
        toastService.simpleToast(err);
      });
    };

    // Generate Request --------------------------------------------------------------------------------------------
    vm.createRequest = function () {
      if (!vm.exist(vm.institution.request)) {
        var requestData = {
          for_id: vm.institution._id,
          type: 'Institution',
          user: vm.authentication.user._id
        };
        generateRequest.institutionRequest(requestData).then(
          function (request) {
            // console.log(request.data.request_id); <-- worried this will be undefined sometimes
            vm.institution.request = request.data.request;
            toastService.simpleToast('Join ID successfully generated!');
          },
          function (error) {
            vm.status = 'Failed to generate institution join ID. '; // +error.message
          }
        );
      }
    };

    // Remove existing Institution ---------------------------------------------------------------------------------
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.institution.$remove($state.go('institutions.list'));
      }
    }

    // Save Institution --------------------------------------------------------------------------------------------
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.institutionForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.institution._id) {
        vm.institution.$update(successCallback, errorCallback);
      } else {
        vm.institution.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('institutions.view', {
          institutionId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    init(); // Placement of this matters
  }
})();

/**
 * Created by Nicole J. Nobles on 6/8/2016.
 */

(function () {
  'use strict';

  angular
    .module('institutions')
    .controller('JoinInstitutionController', JoinInstitutionController);

  JoinInstitutionController.$inject = [/* Example: '$scope', 'Authentication' */];

  function JoinInstitutionController(/* Example: $scope, Authentication */) {
    // var vm = this;
  }
})();

(function () {
  'use strict';

  angular
    .module('institutions')
    .controller('InstitutionsListController', InstitutionsListController);

  InstitutionsListController.$inject = ['InstitutionsService'];

  function InstitutionsListController(InstitutionsService) {
    var vm = this;

    vm.institutions = InstitutionsService.query();
  }
})();

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

(function () {
  'use strict';

  // Keys controller
  angular
    .module('keys')
    .controller('KeysController', KeysController);

  KeysController.$inject = ['$scope', '$state', 'Authentication', 'keyResolve'];

  function KeysController($scope, $state, Authentication, key) {
    var vm = this;

    vm.authentication = Authentication;
    vm.key = key;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Key status options
    vm.statusOpts = [
      { label: 'Active', value: true },
      { label: 'Inactive', value: false }
    ];

    // Key Type Opts
    vm.keyTypeOpts = [
      { value: 'Trial' },
      { value: 'Beta Tester' }, // Remove this option after beta
      { value: 'Single Session' },
      { value: 'Annual License' }
    ];

    // Key date logic
    vm.date = new Date();
    vm.minStartDate = vm.date;
    vm.maxStartDate = '';  // should be user's 'institution.keyExpiration' Date
    vm.minEndDate = vm.date.setDate((new Date()).getDate() + 1);
    vm.maxEndDate = '';    // should be user's 'institution.keyExpiration' Date

    // Check Value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    if (vm.exist(vm.key.activationDate)) {
      vm.key.activationDate = new Date(vm.key.activationDate);
    } else vm.key.activationDate = new Date();

    if (vm.exist(vm.key.expirationDate)) {
      vm.key.expirationDate = new Date(vm.key.expirationDate);
    } else vm.key.expirationDate = new Date();

    // Remove existing Key
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.key.$remove($state.go('keys.list'));
      }
    }

    // Save Key
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.keyForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.key._id) {
        vm.key.$update(successCallback, errorCallback);
      } else {
        vm.key.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('keys.view', {
          keyId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

(function () {
  'use strict';

  angular
    .module('keys')
    .controller('KeysListController', KeysListController);

  KeysListController.$inject = ['KeysService'];

  function KeysListController(KeysService) {
    var vm = this;

    vm.keys = KeysService.query();
  }
})();

// Keys service used to communicate Keys REST endpoints
(function () {
  'use strict';

  angular
    .module('keys')
    .factory('KeysService', KeysService);

  KeysService.$inject = ['$resource'];

  function KeysService($resource) {
    return $resource('api/keys/:keyId', {
      keyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

(function () {
  'use strict';

  angular
    .module('medications')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Medications',
      state: 'medications',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'medications', {
      title: 'List Medications',
      state: 'medications.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'medications', {
      title: 'Create Medication',
      state: 'medications.create',
      roles: ['user']
    });
  }
})();

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
          // roles: ['teacher', 'admin'],
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
          pageTitle: 'Medications Create'
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
        data: {
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

(function () {
  'use strict';

  angular
    .module('medications')
    .controller('MedicationsListController', MedicationsListController);

  MedicationsListController.$inject = ['MedicationsService'];

  function MedicationsListController(MedicationsService) {
    var vm = this;

    vm.medications = MedicationsService.query();
  }
})();

(function () {
  'use strict';

  // Medications controller
  angular
    .module('medications')
    .controller('MedicationsController', MedicationsController);

  MedicationsController.$inject = ['$scope', '$state', 'Authentication', 'medicationResolve', '$mdDialog'];

  function MedicationsController($scope, $state, Authentication, medication, $mdDialog) {
    var vm = this;

    vm.authentication = Authentication;
    vm.medication = medication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // List Medication status boolean options
    vm.statusOpts = [
      { ID: 1, label: 'Active', value: true },
      { ID: 2, label: 'Inactive', value: false }
    ];

    // List Medication Types
    vm.medTypes = [
      { ID: 1, value: 'Generic' },
      { ID: 2, value: 'Brand' },
      { ID: 3, value: 'Fictitious' }
    ];

    // List Pregnancy Categories
    vm.pregnancyCategories = [
      { ID: 1, value: 'Category A' },
      { ID: 2, value: 'Category B' },
      { ID: 3, value: 'Category C' },
      { ID: 4, value: 'Category D' },
      { ID: 5, value: 'Category X' },
      { ID: 6, value: 'Category N' }
    ];

    // Barcode Options
    vm.bcOpts = {
      width: 1,
      height: 55,
      displayValue: true,
      font: 'monospace',
      textAlign: 'center',
      fontSize: 15
    };

    // TODO: move to service
    // Open print dialog
    vm.printBarcode = function (medication) {
      $mdDialog.show({
        templateUrl: 'modules/medications/client/views/dialogs/medication-barcode.client.dialog.html',
        controller: ["$scope", "$mdDialog", "medication", function ($scope, $mdDialog, medication) {
          $scope.medication = medication;

          // Barcode Options
          $scope.bcOpts = {
            width: 1,
            height: 55,
            displayValue: true,
            font: 'monospace',
            textAlign: 'center',
            fontSize: 15
          };

          $scope.ok = function () {
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        locals: {
          medication: medication
        },
        parent: angular.element(document.body)
      });
    };

    // Remove existing Medication
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.medication.$remove($state.go('medications.list'));
      }
    }

    // Save Medication
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.medicationForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.medication._id) {
        vm.medication.updated = new Date();
        vm.medication.$update(successCallback, errorCallback);
      } else {
        vm.medication.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('medications.view', {
          medicationId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

// Medications service used to communicate Medications REST endpoints
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

(function () {
  'use strict';

  angular
    .module('patients')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Patients',
      state: 'patients',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'patients', {
      title: 'List Patients',
      state: 'patients.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'patients', {
      title: 'Create Patient',
      state: 'patients.create',
      roles: ['user']
    });
  }
})();

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
          pageTitle: 'Patients Create'
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
        data: {
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

(function () {
  'use strict';

  angular
    .module('patients')
    .controller('PatientsListController', PatientsListController);

  PatientsListController.$inject = ['PatientsService'];

  function PatientsListController(PatientsService) {
    var vm = this;

    vm.patients = PatientsService.query();
  }
})();

(function () {
  'use strict';

  angular
    .module('patients')
    .controller('LookupPatientController', LookupPatientController);

  LookupPatientController.$inject = ['$scope', '$location', 'Authentication', 'DataFactory'];

  function LookupPatientController($scope, $location, Authentication, DataFactory) {
    var vm = this;
    vm.authentication = Authentication;
    vm.courses = [];
    vm.error = null;

    function init() {
      if (vm.authentication.user.courses.length) {
        angular.forEach(vm.authentication.user.courses, function (course) {
          DataFactory.getData('courses', course).then(
            function (res) {
              // console.log(res);
              var course = {};
              course._id = res._id;
              course.active = res.active;
              course.name = res.name;
              course.patients = res.patients;
              vm.courses.push(course);
            },
            function (err) {
              vm.error = err;
            }
          );
        });
      }
      if (vm.authentication.user._id) {
        if (vm.authentication.user.roles[0] === 'teacher') {
          DataFactory.getList('courses').then(
            function (res) {
              vm.courseDataIfTeacher(res);
            },
            function (err) {
              vm.error = err;
            }
          );
        }
      }
    }

    vm.courseDataIfTeacher = function (courses) {
      angular.forEach(courses, function (course) {
        DataFactory.getData('courses', course._id).then(
          function (res) {
            // console.log(res);
            var course = {};
            course._id = res._id;
            course.active = res.active;
            course.name = res.name;
            course.patients = res.patients;
            vm.courses.push(course);
          },
          function (err) {
            vm.error = err;
          }
        );
      });
    };

    vm.lookupPatient = function (isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'pLookupForm');
        return false;
      }

      var id = vm.pID;
      var course = vm.course;
      var index = vm.contains(course.patients, id);
      if (index >= 0) {
        var patient = course.patients[index];
        if (patient.active) {
          // redirect to patient EMAR
          $location.path('patients/' + patient._id + '/emar');
        } else {
          vm.error = 'Patient : "' + patient.firstName + ' ' + patient.lastName + '" is NOT active.';
        }
      } else {
        vm.error = 'Patient ID : "' + id + '" NOT found in ' + course.name;
      }
    };

    vm.contains = function (array, item) {
      // console.log(array);
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id === item) {
          return i;
        }
      }
      return -1;
    };

    init();
  }
})();

(function () {
  'use strict';

  angular
    .module('patients')
    .controller('PatientEmarController', PatientEmarController);

  PatientEmarController.$inject = ['$scope', 'Authentication', 'patientResolve', 'rtCalcService', 'DataFactory', 'dialogService', 'toastService'];

  function PatientEmarController($scope, Authentication, patient, rtCalcService, DataFactory, dialogService, toastService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.patient = patient;
    vm.patientMedications = [];

    // RT Calculations
    vm.calcAge = function (dateStr) {
      if (vm.exist(dateStr)) {
        return rtCalcService.calcAge(dateStr);
      } else {
        return 0;
      }
    };

    vm.calcFt = function (value) {
      if (vm.exist(value)) {
        return rtCalcService.calcFt(value);
      } else {
        return "0' 0\"";
      }
    };
    vm.calcLb = function (value) {
      if (vm.exist(value)) {
        return rtCalcService.calcLb(value);
      } else {
        return 0;
      }
    };

    vm.calcBMI = function (kg, cm) {
      vm.bmi = rtCalcService.calcBMI(kg, cm);
      return rtCalcService.calcBMI(kg, cm);
    };
    vm.textBMI = function (bmi) {
      return rtCalcService.textBMI(bmi);
    };

    vm.calcAmt = function (str, dose, amt) {
      if (vm.exist(str) && vm.exist(dose) && vm.exist(amt)) {
        return rtCalcService.calcAmt(str, dose, amt);
      } else {
        return amt;
      }
    };

    // Check Value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    function init() {
      DataFactory.getData('patients', vm.patient._id).then(
        function (res) {
          vm.patientMedications = res.medications;
        },
        function (err) {
          vm.error = err;
        }
      );
    }

    // Verify 5 Rights of Patient
    vm.verify5Rights = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.meduScanForm');
        return false;
      }
      var id = vm.scan;

      // Right Patient?
      var patient = vm.patient;

      // Right Medication?
      var index = vm.rightMedication(vm.patientMedications, id);
      if (index < 0) {// Medication was not found.
        // Alert medication NOT found
        alert.msg = 'Medication : "' + id + '" NOT found for patient : "' + patient.firstName + ' ' + patient.lastName + '".';
        dialogService.simpleAlert(alert);
      } else {// Medication was found.
        var medication = vm.patientMedications[index];
        // console.log(medication);

        // If all checks go -> Give the medication
        if (!medication.triggerScenario && !medication.given && !patient.pregnant && vm.rightTime(medication.time, patient.scenarioTime) === 'onTime' && vm.rightDose(medication._id.strength, medication.dose) === 'correct') {
          vm.giveMedication(index);
        } else {
          if (patient.pregnant) {
            vm.resultOfPregnancyCategory(medication, index);
          } else {
            vm.resultOfTriggerScenarioAlert(medication, index);
          }
        }
      }
    };

    vm.giveMedication = function (index) {
      vm.patientMedications[index].given = true;
      vm.patientMedications[index].givenTime = new Date();

      toastService.simpleToast(vm.patientMedications[index]._id.name + ' administered @: ' + vm.patientMedications[index].givenTime + '.');
    };

    vm.rightMedication = function (patientMedications, id) {
      var index = -1;

      for (var i = 0; i < patientMedications.length; i++) {
        if (patientMedications[i]._id._id === id) {
          return i;
        }
      }
      return index;
    };

    vm.rightTime = function (giveTime, scenarioTime) {
      // 2 hour window
      var time = '';
      var gt = new Date(giveTime);
      var st = new Date(scenarioTime);
      // console.log(gt.getHours());
      // console.log((st.getHours() -2) +' - '+(st.getHours() +2));
      if (gt.getHours() > (st.getHours() + 2)) {
        time = 'late';
      }
      if (gt.getHours() < (st.getHours() - 2)) {
        time = 'early';
      } else if (gt.getHours() >= (st.getHours() - 2) && gt.getHours() <= (st.getHours() + 2)) {
        time = 'onTime';
      }
      return time;
    };

    vm.rightDose = function (str, dose) {
      var doseReq = '';
      // console.log('str: '+ str+ ' dose: '+dose);
      if (dose > str) {
        doseReq = 'needMore';
      }
      if (dose < str) {
        doseReq = 'needLess';
      } else if (dose === str) {
        doseReq = 'correct';
      }
      return doseReq;
    };

    vm.resultOfPregnancyCategory = function (medication, index) {
      var alert = {};
      alert.title = 'Alert - Pregnancy Category';
      alert.question = 'Would you like to give anyway?';
      alert.medication = medication;

      var pc = medication._id.pregnancyCategory;
      if (pc === 'Category C' || pc === 'Category D' || pc === 'Category X' || pc === 'Category N') {
        alert.msg = 'Warning patient is pregnant, and this medication is labeled with Pregnancy ' + pc + '. ';
        dialogService.alert(alert).then(
          function (give) {
            if (give) {
              // medication.triggerScenario = false;
              vm.resultOfTriggerScenarioAlert(medication, index);
            }
          },
          function () {
          }
        );
      } else {
        vm.resultOfTriggerScenarioAlert(medication, index);
      }
    };

    vm.resultOfTriggerScenarioAlert = function (medication, index) {
      var alert = {};
      alert.title = 'Alert';
      alert.question = 'Would you like to give anyway?';
      alert.medication = medication;

      if (medication.triggerScenario) {
        // Alert scenarioAlertMsg
        alert.msg = medication.scenarioAlertMsg;
        dialogService.alert(alert).then(
          function (give) {
            if (give) {
              // medication.triggerScenario = false;
              vm.resultOfAlreadyGivenAlert(medication, index);
            }
          },
          function () {
          }
        );
      } else {
        vm.resultOfAlreadyGivenAlert(medication, index);
      }
    };

    vm.resultOfAlreadyGivenAlert = function (medication, index) {
      var alert = {};
      alert.title = 'Alert - Already Given';
      alert.question = 'Would you like to give anyway?';
      alert.medication = medication;

      if (medication.given) {
        // Alert given if 'yes, give anyway' is selected --> continue
        alert.msg = 'Warning this medication already been given to ' + patient.firstName + ' ' + patient.lastName +
          '@ : ' + medication.time;
        dialogService.alert(alert).then(
          function (give) {
            if (give) {
              vm.resultOfWrongTimeAlert(medication, index);
            }
          },
          function () {
          }
        );
      } else {
        vm.resultOfWrongTimeAlert(medication, index);
      }
    };

    vm.resultOfWrongTimeAlert = function (medication, index) {
      var alert = {};
      alert.title = 'Alert - Medication Early/Late';
      alert.question = 'Would you like to give anyway?';
      alert.medication = medication;

      var time = vm.rightTime(medication.time, patient.scenarioTime);
      if (time === 'early') {
        alert.msg = 'This medication is early.';
      }
      if (time === 'late') {
        alert.msg = 'This medication is late.';
      }
      if (time !== 'onTime') {
        // Alert time if 'yes, give anyway' is selected --> continue
        dialogService.alert(alert).then(
          function (give) {
            if (give) {
              vm.resultOfWrongDoseAlert(medication, index);
            }
          },
          function () {
          }
        );
      } else {
        vm.resultOfWrongDoseAlert(medication, index);
      }
    };

    vm.resultOfWrongDoseAlert = function (medication, index) {
      var alert = {};
      // alert.title = 'Alert';
      // alert.question = 'Would you like to give anyway?';
      alert.medication = medication;

      var dose = vm.rightDose(medication._id.strength, medication.dose);
      var amt = vm.calcAmt(medication._id.strength, medication.dose, medication._id.amount);
      if (dose === 'needMore') {
        var xMore = medication.dose - medication._id.strength;
        alert.msg = 'The strength of this medication is ' + medication._id.strength + ' ' + medication._id.unit +
          '. The dose required for this medication is: ' + medication.dose + ' ' + medication._id.unit +
          '. You must ADD ' + xMore + ' ' + medication._id.unit + ' to administer the correct dosage.';
      }
      if (dose === 'needLess') {
        var xLess = medication._id.strength - medication.dose;
        alert.msg = 'The strength of this medication is ' + medication._id.strength + ' ' + medication._id.unit +
          '. The dose required for this medication is: ' + medication.dose + ' ' + medication._id.unit +
          '. You must REMOVE ' + xLess + ' ' + medication._id.unit + ' to administer the correct dosage.';
      }
      if (dose !== 'correct') {
        alert.title = 'Alert - Amount Adjustment Required';
        alert.instructions = 'Please administer a total of ' + amt + ' ' + medication._id.form + '. ';
        // Alert dosage if 'yes, give anyway' is selected -->  continue
        dialogService.alert(alert).then(
          function (give) {
            if (give) {
              vm.giveMedication(index);
            }
          },
          function () {
          }
        );
      } else { // All checks go -> Give the medication
        vm.giveMedication(index);
      }
    };

    init();
  }
})();

/**
 * Created by Nicole J. Nobles on 6/21/2016.
 */

(function () {
  'use strict';

  angular
    .module('patients')
    .controller('PatientMedicationsController', PatientMedicationsController);

  PatientMedicationsController.$inject = ['$scope', 'Authentication', 'patientResolve', '$mdDialog', 'DataFactory', 'rtCalcService', 'toastService'];

  function PatientMedicationsController($scope, Authentication, patient, $mdDialog, DataFactory, rtCalcService, toastService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.patient = patient;
    vm.patientMedications = [];
    vm.error = null;
    vm.form = {};

    // console.log(vm.patient.medications);

    // Check Value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    // RT Calculations
    vm.calcAmt = function (str, dose, amt) {
      if (vm.exist(str) && vm.exist(dose) && vm.exist(amt)) {
        return rtCalcService.calcAmt(str, dose, amt);
      } else {
        return amt;
      }
    };

    function init() {
      DataFactory.getData('patients', vm.patient._id).then(
        function (res) {
          vm.patientMedications = res.medications;
        },
        function (err) {
          vm.error = err;
        }
      );
    }


    // ---- ADD/UPDATE Form ----------------------------------------------------------------------------------------
    vm.dialogPatientMedForm = function (action, patient, medication, index) {

      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/medications/dialogs/form-patientMedication.client.view.html',
        controller: ["$scope", "$mdDialog", "action", "patient", "medication", "index", "rtCalcService", function ($scope, $mdDialog, action, patient, medication, index, rtCalcService) {
          $scope.patient = patient;
          $scope.medication = medication;
          $scope.action = action;

          if (index >= 0) {
            $scope.patient.medication = patient.medications[index];
            $scope.patient.medication.time = new Date(patient.medications[index].time); // hot fix b/c times is array.
          }

          // MedType Opts
          $scope.medTypeOpts = [
            { ID: 1, value: 'Scheduled' },
            { ID: 2, value: 'PRN' },
            { ID: 3, value: 'Stat/1x' },
            { ID: 4, value: 'IV Fluid' }
          ];

          // Check Value Exist
          $scope.exist = function (value) {
            return !(value === null || value === '' || value === undefined);
          };

          $scope.calcAge = function (dateStr) {
            if ($scope.exist(dateStr)) {
              return rtCalcService.calcAge(dateStr);
            } else {
              return 0;
            }
          };

          // if(!$scope.exist($scope.patient.medication.times)) { $scope.patient.medication.times = new Date(); }

          $scope.ok = function (pMed) {
            if (action === 'Add') {
              pMed._id = medication._id;
              vm.addPatientMed(pMed);
            } else if (action === 'Update') {
              vm.updatePatientMed(pMed, index);
            }
            $mdDialog.cancel();
          };
          $scope.cancel = function () {
            // $scope.pMedForm.$rollbackViewValue();
            $scope.pMedForm.$setPristine();
            $scope.pMedForm.$setUntouched();
            $mdDialog.cancel();
          };
        }],
        locals: {
          index: index,
          action: action,
          patient: patient,
          medication: medication
        },
        parent: angular.element(document.body)
      });
    };

    // ---- ADD ----------------------------------------------------------------------------------------------------
    vm.addPatientMed = function (pMed) {
      vm.patient.medications.push(pMed);
      vm.update('added');
      // console.log(vm.patient.medications);
    };

    // ---- REMOVE  ------------------------------------------------------------------------------------------------
    vm.removePatientMed = function (index) {
      vm.patient.medications.splice(index, 1);
      vm.update('removed');
    };

    // ---- UPDATE -------------------------------------------------------------------------------------------------
    vm.updatePatientMed = function (pMed, index) {
      vm.patient.medications[index] = pMed;
      vm.update('updated');
      // console.log(vm.patient.medications[index]);
    };

    vm.update = function (action) {
      vm.patient.updated = Date.now();
      vm.patient.$update(function () {
        toastService.simpleToast('Medication ' + action);
        init();
      }, function (err) {
        toastService.simpleToast('Oops something went wrong.');
      });
    };

    // ---- SEARCH -------------------------------------------------------------------------------------------------
    vm.lookupMed = function (mID) {

      if (vm.alreadyAdded(vm.patient.medications, mID)) {
        vm.error = 'Medication ID: "' + mID + '" has already been added to this patient.';
      } else {
        DataFactory.getDataPromise('medications', mID).then(
          function (res) {
            var med = res.data;
            if (med && !med.active) {
              vm.error = '"' + med.name + '" is NOT active. Please change the medication\'s status ' +
                'from "inactive" to "active" to add this medication.';
            } else {
              // Close dialogLookupMed
              vm.closeDialogLookupMed();
              // Open dialogForm
              vm.dialogPatientMedForm('Add', vm.patient, med, -1);
              vm.error = null; // Clear error msg
            }
          },
          function (err) {
            vm.error = 'Medication ID : "' + mID + '" NOT found. \n' +
              'Please make sure to add the medication to the medications database first.';
          }
        );
      }
    };
    // Open a dialog window to find an existing Medication
    vm.dialogLookupMed = function () {
      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/medications/dialogs/lookup-medication.client.dialog.html',
        scope: $scope,
        preserveScope: true,
        parent: angular.element(document.body)
      });
      vm.okDialogLookupMed = function (mID) {
        vm.lookupMed(mID);
      };
      vm.closeDialogLookupMed = function () {
        $mdDialog.cancel();
        vm.mID = '';
      };
    };

    // ---- MISC ---------------------------------------------------------------------------------------------------
    vm.alreadyAdded = function (patientMedications, scannedId) {
      var found = false;

      for (var i = 0; i < patientMedications.length; i++) {
        if (patientMedications[i]._id === scannedId) {
          found = true;
          break;
        }
      }
      return found;
    };

    init();
  }
})();

(function () {
  'use strict';

  // Patients controller
  angular
    .module('patients')
    .controller('PatientsController', PatientsController);

  PatientsController.$inject = ['$scope', '$state', 'Authentication', 'patientResolve', 'rtCalcService', '$mdDialog'];

  function PatientsController($scope, $state, Authentication, patient, rtCalcService, $mdDialog) {
    var vm = this;

    vm.authentication = Authentication;
    vm.patient = patient;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // List Patient status boolean options
    vm.statusOpts = [
      { ID: 1, label: 'Active', value: true },
      { ID: 2, label: 'Inactive', value: false }
    ];

    // RT Calculations
    vm.calcAge = function (dateStr) {
      if (vm.exist(dateStr)) {
        return rtCalcService.calcAge(dateStr);
      } else {
        return 0;
      }
    };

    vm.calcFt = function (value) {
      if (vm.exist(value)) {
        return rtCalcService.calcFt(value);
      } else {
        return "0' 0\"";
      }
    };
    vm.calcLb = function (value) {
      if (vm.exist(value)) {
        return rtCalcService.calcLb(value);
      } else {
        return 0;
      }
    };

    vm.calcBMI = function (kg, cm) {
      vm.bmi = rtCalcService.calcBMI(kg, cm);
      return rtCalcService.calcBMI(kg, cm);
    };
    vm.textBMI = function (bmi) {
      return rtCalcService.textBMI(bmi);
    };

    // Check Value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    // Convert String to Date
    if (vm.exist(vm.patient.scenarioTime)) {
      vm.patient.scenarioTime = new Date(vm.patient.scenarioTime);
    } else {
      vm.patient.scenarioTime = new Date();
    }

    if (vm.exist(vm.patient.dob)) {
      vm.patient.dob = new Date(vm.patient.dob);
    }

    // DOB - datePicker min & max dates
    vm.minDate = new Date(1901, 1, 1);
    vm.maxDate = new Date(); // today

    // Remove existing Patient
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.patient.$remove($state.go('patients.list'));
      }
    }

    // Barcode Options
    vm.bcOpts = {
      width: 1,
      height: 55,
      displayValue: true,
      font: 'monospace',
      textAlign: 'center',
      fontSize: 15
    };

    // TODO: move to service
    // Open print dialog
    vm.printBarcode = function (patient) {
      $mdDialog.show({
        templateUrl: 'modules/patients/client/views/dialogs/patient-barcode.client.dialog.html',
        controller: ["$scope", "$mdDialog", "patient", function ($scope, $mdDialog, patient) {
          $scope.patient = patient;

          // Barcode Options
          $scope.bcOpts = {
            width: 1,
            height: 55,
            displayValue: true,
            font: 'monospace',
            textAlign: 'center',
            fontSize: 15
          };

          $scope.ok = function () {
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        locals: {
          patient: patient
        },
        parent: angular.element(document.body)
      });
    };

    // Save Patient
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.patientForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.patient._id) {
        vm.patient.updated = new Date();
        vm.patient.$update(successCallback, errorCallback);
      } else {
        vm.patient.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('patients.view', {
          patientId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

(function () {
  'use strict';

  angular
    .module('patients')
    .factory('dialogService', dialogService);

  dialogService.$inject = ['$mdDialog'];

  function dialogService($mdDialog) {
    // dialogService service logic
    var dialog = {};

    dialog.simpleAlert = function (alert) {
      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/dialogs/alerts/simple-alert.client.dialog.html',
        controller: ["$scope", "$mdDialog", "alert", function ($scope, $mdDialog, alert) {
          $scope.dialog = alert;
          // console.log(alert);

          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        locals: {
          alert: alert
        },
        parent: angular.element(document.body)
      });
    };

    dialog.alert = function (alert) {
      return $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/dialogs/alerts/alert-client.dialog.html',
        controller: ["$scope", "$mdDialog", "alert", function ($scope, $mdDialog, alert) {
          $scope.dialog = alert;
          // console.log(alert);

          $scope.ok = function () {
            $mdDialog.hide(true);
          };
          $scope.cancel = function () {
            $mdDialog.cancel(true);
          };
        }],
        locals: {
          alert: alert
        },
        parent: angular.element(document.body)
      }).then(function (ans) {
        return ans;
      }, function () {
        return false;
      });
    };

    // Public API
    return dialog;
  }
})();

// Patients service used to communicate Patients REST endpoints
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

(function () {
  'use strict';

  angular
    .module('patients')
    .factory('rtCalcService', rtCalcService);

  rtCalcService.$inject = [/* Example: '$state', '$window' */];

  function rtCalcService(/* Example: $state, $window */) {
    // rtCalcService service logic
    var calcService = {};

    calcService.calcAge = function (dateString) {
      // var birthday = +new Date(dateString);
      // return ~~((Date.now() - birthday) / (31557600000)); ~Kristoffer Dorph - SO

      var today = new Date();
      var birthDate = new Date(dateString);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };// Mohit Yadav - SO

    /* ft = cm/30.48 */
    calcService.calcFt = function (value) {
      // var value = parseFloat(cm);
      var _ft = parseInt(value / 30.48, 10);
      var _in = ((value / 30.48) % 1).toFixed(1).toString().split('.')[1];

      return parseInt(value / 30.48, 10) + '\' ' + ((value / 30.48) % 1).toFixed(1).toString().split('.')[1] + '\'\'';
    };

    /* lb = kg*2.2046 */
    calcService.calcLb = function (value) {
      // var value = parseFloat(kg);
      var _lbs = parseInt(value * 2.2046, 10);

      return parseInt(value * 2.2046, 10);
    };

    /* bmi = kg/m^2 */
    calcService.calcBMI = function (kg, cm) {
      var m = (cm / 100);

      return (kg / (m * m)).toFixed(1);
    };

    calcService.textBMI = function (bmi) {
      var bmiText = '';

      if (bmi < 18.5)
        bmiText = 'Underweight';
      if (bmi > 18.5 && bmi < 24.9)
        bmiText = 'Normal Weight';
      if (bmi > 25.0 && bmi < 29.9)
        bmiText = 'Overweight';
      if (bmi > 30.0)
        bmiText = 'Obese';

      return bmiText;
    };

    calcService.calcAmt = function (str, dose, amt) {
      var newAmt = ((dose / str) * amt);
      if (newAmt % 1 === 0) {// is whole number
        return newAmt;
      }
      return newAmt.toFixed(2);
    };

    // Public API
    return calcService;
  }
})();

(function () {
  'use strict';

  angular
    .module('requests')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('request-join', {
        url: '/request-join',
        templateUrl: 'modules/requests/client/views/request-join.client.view.html',
        controller: 'RequestJoinController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'student', 'teacher', 'admin'],
          pageTitle: 'Request Join'
        }
      })
      .state('requests', {
        abstract: true,
        url: '/requests',
        template: '<ui-view/>'
      })
      .state('requests.list', {
        url: '',
        templateUrl: 'modules/requests/client/views/list-requests.client.view.html',
        controller: 'RequestsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Requests List'
        }
      })
      .state('requests.create', {
        url: '/create',
        templateUrl: 'modules/requests/client/views/form-request.client.view.html',
        controller: 'RequestsController',
        controllerAs: 'vm',
        resolve: {
          requestResolve: newRequest
        },
        data: {
          roles: ['user', 'student', 'teacher', 'admin'],
          pageTitle: 'Requests Create'
        }
      })
      .state('requests.edit', {
        url: '/:requestId/edit',
        templateUrl: 'modules/requests/client/views/form-request.client.view.html',
        controller: 'RequestsController',
        controllerAs: 'vm',
        resolve: {
          requestResolve: getRequest
        },
        data: {
          roles: ['user', 'student', 'teacher', 'admin'],
          pageTitle: 'Edit Request {{ requestResolve.name }}'
        }
      })
      .state('requests.view', {
        url: '/:requestId',
        templateUrl: 'modules/requests/client/views/view-request.client.view.html',
        controller: 'RequestsController',
        controllerAs: 'vm',
        resolve: {
          requestResolve: getRequest
        },
        data: {
          pageTitle: 'Request {{ articleResolve.name }}'
        }
      });
  }

  getRequest.$inject = ['$stateParams', 'RequestsService'];

  function getRequest($stateParams, RequestsService) {
    return RequestsService.get({
      requestId: $stateParams.requestId
    }).$promise;
  }

  newRequest.$inject = ['RequestsService'];

  function newRequest(RequestsService) {
    return new RequestsService();
  }
})();

(function () {
  'use strict';

  angular
    .module('requests')
    .controller('RequestsListController', RequestsListController);

  RequestsListController.$inject = ['RequestsService'];

  function RequestsListController(RequestsService) {
    var vm = this;

    vm.requests = RequestsService.query();
  }
})();

(function () {
  'use strict';

  angular
    .module('requests')
    .controller('RequestJoinController', RequestJoinController);

  RequestJoinController.$inject = ['$scope', 'Authentication', '$mdDialog', 'subscribeRequest', 'toastService'];

  function RequestJoinController($scope, Authentication, $mdDialog, subscribeRequest, toastService) {
    var vm = this;
    vm.authentication = Authentication;

    vm.request = [];
    vm.course = [];
    vm.institution = [];
    vm.error = null;
    vm.form = {};

    vm.lookupRequestId = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'requestJForm');
        return false;
      }

      subscribeRequest.getRequest(vm.requestId).then(
        function (request) {
          // console.log(request.data);
          vm.request = request.data;
          vm.lookupObjOfRequest(vm.request);
        },
        function (error) {
          vm.error = 'Request ID NOT found. ';
          vm.requestId = '';
        }
      );
    };

    vm.lookupObjOfRequest = function (request) {
      var object = {
        id: request.for_id,
        type: request.type
      };

      if (vm.isNewRequest(request._id)) {
        subscribeRequest.getObjOfRequest(object).then(
          function (reqObj) {
            // console.log(reqObj.data);
            if (request.type === 'Course') {
              vm.course = reqObj.data;
              vm.joinCourseDialog(vm.course);
            } else if (request.type === 'Institution') {
              vm.institution = reqObj.data;
              vm.joinInstitutionDialog(vm.institution);
            }
          },
          function (error) {
            vm.error = request.type + ' NOT found. ';
          }
        );
      } else {
        vm.error = 'You have already requested to join this ' + request.type + '!';
        vm.requestId = '';
      }
    };

    vm.isNewRequest = function (id) {
      var length = vm.authentication.user.requests.length;

      if (length === 0) {
        return true;
      }

      for (var i = 0; i < length; i++) {
        if (vm.authentication.user.requests[i] === id) {
          return false;
        }
      }
      return true;
    };

    /**
     * Subscribe to...
     * @param type
     */
    vm.subscribeTo = function (type) {

      var subscriber = vm.authentication.user._id;

      subscribeRequest.subscribe(vm.request, subscriber).then(
        function (response) {
          // console.log(response);
          vm.addRequestTo(vm.authentication.user);
        },
        function (error) {
          vm.error = 'Error requesting subscription to ' + type + '.';
        }
      );
    };

    /**
     * Add request to...
     * @param user
     */
    vm.addRequestTo = function (user) {

      var request = vm.request;

      subscribeRequest.addRequestToUser(user, request).then(
        function (response) {
          // console.log(response);
          toastService.simpleToast('Request to join ' + request.type + ' successfully processed.');
        },
        function (error) {
          toastService.simpleToast('Error Requesting to join ' + request.type + ',');
        }
      );
    };

    vm.joinCourseDialog = function (course) {
      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/courses/client/views/dialogs/join-course.client.view.html',
        controller: ["$scope", "$mdDialog", "course", function ($scope, $mdDialog, course) {
          $scope.course = course;

          $scope.ok = function () {
            vm.subscribeTo('course');
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        locals: {
          course: course
        },
        parent: angular.element(document.body)
      });
    };

    vm.joinInstitutionDialog = function (institution) {
      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/institutions/client/views/dialogs/join-institution.client.view.html',
        controller: ["$scope", "$mdDialog", "institution", function ($scope, $mdDialog, institution) {
          $scope.institution = institution;

          $scope.ok = function () {
            vm.subscribeTo('institution');
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        }],
        locals: {
          institution: institution
        },
        parent: angular.element(document.body)
      });
    };
  }
})();

(function () {
  'use strict';

  // Requests controller
  angular
    .module('requests')
    .controller('RequestsController', RequestsController);

  RequestsController.$inject = ['$scope', '$state', 'Authentication', 'requestResolve', 'DataFactory', 'toastService'];

  function RequestsController($scope, $state, Authentication, request, DataFactory, toastService) {
    var vm = this;
    vm.authentication = Authentication;

    vm.request = request;
    vm.subscribers = [];
    vm.status = null;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Request type options
    vm.requestTypeOpts = [
      { id: 1, value: 'Course' },
      { id: 2, value: 'Institution' },
      { id: 3, value: 'Key' }
    ];

    function init() {
      vm.subs = [];
      angular.forEach(vm.request.subscribers, function (value) {
        vm.subs.push(value);
      });

      // Get users(subscribers) data from [request.subscribers]
      vm.getRequestSubscriberData();
    }

    vm.getRequestSubscriberData = function () {
      var data = 'users';

      angular.forEach(vm.subs, function (sub) {
        var id = sub._id;
        var status = sub.approvalStatus;
        DataFactory.getData(data, id).then(
          function (userData) {

            var subData = {};
            subData._id = userData._id;
            subData.firstName = userData.firstName;
            subData.lastName = userData.lastName;
            subData.email = userData.email;
            subData.approvalStatus = status;

            vm.subscribers.push(subData);
            // console.log(userData);
          },
          function (error) {
            vm.status = 'Failed to retrieve Subscriber Data. '; // +error.message
          }
        );
      });
    };

    init(); // Placement of this matters

    vm.updateSubscriberData = function () {
      var tempSubArr = [];
      angular.forEach(vm.subscribers, function (sub) {
        var updatedSub = {};
        updatedSub._id = sub._id;
        updatedSub.approvalStatus = sub.approvalStatus;

        tempSubArr.push(updatedSub);
      });
      vm.request.subscribers = tempSubArr;
      vm.updateRequestData();
    };

    vm.updateRequestData = function () {
      vm.request.$update(function (res) {
        // console.log(res);
        toastService.simpleToast('Subscriber approval status updated.');
      }, function (error) {
        vm.error = error;
      });
    };

    // Remove existing Request
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.request.$remove($state.go('requests.list'));
      }
    }

    // Save Request
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.requestForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.request._id) {
        vm.request.$update(successCallback, errorCallback);
      } else {
        vm.request.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('requests.view', {
          requestId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

(function () {
  'use strict';

  angular
    .module('requests')
    .factory('DataFactory', DataFactory);

  DataFactory.$inject = ['$http'];

  function DataFactory($http) {
    // DataFactory service logic
    // ...

    var getData = function (data, id) {
      return $http.get('/api/' + data + '/' + id).then(
        function (response) {
          return response.data;
        },
        function (error) {
          // Error... handle it!
        }
      );
    };

    var getDataPromise = function (data, id) {
      return $http.get('/api/' + data + '/' + id);
    };

    var getList = function (data) {
      return $http.get('/api/' + data).then(
        function (response) {
          return response.data;
        },
        function (error) {
          // Error... handle it!
        }
      );
    };

    var getListPromise = function (data) {
      return $http.get('/api/' + data);
    };


    // var setData = function (data, id) {};
    // var addData = function (data, id) {};
    // var cutData = function (data, id) {};

    // Public API
    return {
      getData: getData,
      getDataPromise: getDataPromise,
      getList: getList,
      getListPromise: getListPromise
    };
  }
})();

(function () {
  'use strict';

  angular
    .module('requests')
    .factory('generateRequest', generateRequest);

  generateRequest.$inject = ['$http'];

  function generateRequest($http) {
    // GenerateRequest service logic

    var courseRequest = function (request) {
      var generatedRequest = null;

      // Post new request and then post requestId to course
      return $http({
        method: 'POST',
        // headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        url: '/api/requests',
        data: {
          for_id: request.for_id,
          type: request.type,
          user: request.user
        }
      }).then(function (response) {
        generatedRequest = response.data;
        return $http({
          method: 'PUT',
          url: '/api/courses/' + request.for_id,
          data: {
            request: generatedRequest._id
          }
        });
      });
    };

    /**
     * Post new request, then push new request to institution
     * @param request
     */
    var institutionRequest = function (request) {
      var generatedRequest = null;

      return $http({
        method: 'POST',
        // headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        url: '/api/requests',
        data: {
          for_id: request.for_id,
          type: request.type,
          user: request.user
        }
      }).then(function (response) {
        generatedRequest = response.data;
        return $http({
          method: 'PUT',
          url: '/api/institutions/' + request.for_id,
          data: {
            request: generatedRequest._id
          }
        });
      });
    };

    // Public API
    return {
      courseRequest: courseRequest,
      institutionRequest: institutionRequest
    };
  }
})();

// Requests service used to communicate Requests REST endpoints
(function () {
  'use strict';

  angular
    .module('requests')
    .factory('RequestsService', RequestsService);

  RequestsService.$inject = ['$resource'];

  function RequestsService($resource) {
    return $resource('api/requests/:requestId', {
      requestId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

(function () {
  'use strict';

  angular
    .module('requests')
    .factory('subscribeRequest', subscribeRequest);

  subscribeRequest.$inject = ['$http', 'RequestsService', 'UsersService'];

  function subscribeRequest($http, RequestsService, UsersService) {
    // SubscribeRequest service logic

    /**
     * Get the request by id
     * @param id
     * @returns {HttpPromise}
     */
    var getRequest = function (id) {
      return $http.get('/api/requests/' + id);
    };

    /**
     * Get what the request was made for
     * @param object
     * @returns {HttpPromise}
     */
    var getObjOfRequest = function (object) {
      return $http.get('/api/' + object.type + 's/' + object.id);
    };

    /**
     * Add subscriber to request
     * @param request
     * @param subscriber
     * @returns {request}
     */
    var subscribe = function (request, subscriber) {
      var subscriberRequest = new RequestsService(request);

      subscriberRequest.subscribers.push(subscriber);

      return subscriberRequest.$update(function (res) {
        // console.log(res);
      }, function (error) {
        // Error... Handle it!
      });
    };

    /**
     * Add request to user
     * @param user
     * @param request
     * @returns {user}
     */
    var addRequestToUser = function (user, request) {
      var requestUser = new UsersService(user);

      requestUser.requests.push(request._id);

      return requestUser.$update(function (res) {
        // console.log(res);
      }, function (error) {
        // Error... Handle it!
      });
    };

    var addCourseToUser = function (user, courseId) {
      // Then request a key type.trial to add to institution
      var requestUser = new UsersService(user);

      requestUser.courses.push(courseId);

      return requestUser.$update(function (res) {
        // console.log(res);
      }, function (error) {
        // Error... Handle it!
      });
    };

    var addInstitutionToUser = function (user, institutionId) {
      // Then request a key type.trial to add to course
      var requestUser = new UsersService(user);

      requestUser.institutions.push(institutionId);

      return requestUser.$update(function (res) {
        // console.log(res);
      }, function (error) {
        // Error... Handle it!
      });
    };

    // Public API
    return {
      getRequest: getRequest,
      getObjOfRequest: getObjOfRequest,
      subscribe: subscribe,
      addRequestToUser: addRequestToUser,
      addCourseToUser: addCourseToUser,
      addInstitutionToUser: addInstitutionToUser
    };
  }
})();

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
          pageTitle: 'Tutorials Create'
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
        data: {
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

(function () {
  'use strict';

  angular
    .module('tutorials')
    .controller('TutorialsListController', TutorialsListController);

  TutorialsListController.$inject = ['TutorialsService'];

  function TutorialsListController(TutorialsService) {
    var vm = this;

    vm.tutorials = TutorialsService.query();
  }
})();

(function () {
  'use strict';

  // Tutorials controller
  angular
    .module('tutorials')
    .controller('TutorialsController', TutorialsController);

  TutorialsController.$inject = ['$scope', '$state', 'Authentication', 'tutorialResolve'];

  function TutorialsController ($scope, $state, Authentication, tutorial) {
    var vm = this;

    vm.authentication = Authentication;
    vm.tutorial = tutorial;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Tutorial
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.tutorial.$remove($state.go('tutorials.list'));
      }
    }

    // Save Tutorial
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tutorialForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.tutorial._id) {
        vm.tutorial.$update(successCallback, errorCallback);
      } else {
        vm.tutorial.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('tutorials.view', {
          tutorialId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

// Tutorials service used to communicate Tutorials REST endpoints
(function () {
  'use strict';

  angular
    .module('tutorials')
    .factory('TutorialsService', TutorialsService);

  TutorialsService.$inject = ['$resource'];

  function TutorialsService($resource) {
    return $resource('api/tutorials/:tutorialId', {
      tutorialId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

(function () {
  'use strict';

  angular
    .module('users.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Users module
  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
}());

(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Users List'
        }
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit {{ userResolve.displayName }}'
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit User {{ userResolve.displayName }}'
        }
      });

    getUser.$inject = ['$stateParams', 'AdminService'];

    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }
  }
}());

(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'student', 'teacher', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html',
        controller: 'EditProfileController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings'
        }
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html',
        controller: 'ChangePasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings password'
        }
      })
      /* .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html',
        controller: 'SocialAccountsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings accounts'
        }
      }) */
      .state('settings.account', {
        url: '/account',
        templateUrl: 'modules/users/client/views/settings/manage-account-details.client.view.html',
        controller: 'ManageAccountController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Manage Account'
        }
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html',
        controller: 'ChangeProfilePictureController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings picture'
        }
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signup'
        }
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signin'
        }
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password forgot'
        }
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html',
        data: {
          pageTitle: 'Password reset invalid'
        }
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html',
        data: {
          pageTitle: 'Password reset success'
        }
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password reset form'
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserListController', UserListController);

  UserListController.$inject = ['$scope', '$filter', 'AdminService'];

  function UserListController($scope, $filter, AdminService) {
    var vm = this;
    vm.buildPager = buildPager;
    vm.figureOutItemsToDisplay = figureOutItemsToDisplay;
    vm.pageChanged = pageChanged;

    AdminService.query(function (data) {
      vm.users = data;
      vm.buildPager();
    });

    function buildPager() {
      vm.pagedItems = [];
      vm.itemsPerPage = 15;
      vm.currentPage = 1;
      vm.figureOutItemsToDisplay();
    }

    function figureOutItemsToDisplay() {
      vm.filteredItems = $filter('filter')(vm.users, {
        $: vm.search
      });
      vm.filterLength = vm.filteredItems.length;
      var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
      var end = begin + vm.itemsPerPage;
      vm.pagedItems = vm.filteredItems.slice(begin, end);
    }

    function pageChanged() {
      vm.figureOutItemsToDisplay();
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', '$state', '$window', 'Authentication', 'userResolve'];

  function UserController($scope, $state, $window, Authentication, user) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = user;
    vm.remove = remove;
    vm.update = update;

    function remove(user) {
      if ($window.confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          vm.users.splice(vm.users.indexOf(user), 1);
        } else {
          vm.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    }

    function update(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = vm.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        vm.error = errorResponse.data.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'toastService'];

  function AuthenticationController($scope, $state, $http, $location, $window, Authentication, PasswordValidator, toastService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;

    // Get an eventual error defined in the URL query string:
    vm.error = $location.search().err;

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    function signup(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.signupForm');

        return false;
      }

      $http.post('/api/auth/signup', vm.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;

        toastService.simpleToast('Welcome to MeduSCAN ' + response.firstName + '!');

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    function signin(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.signinForm');

        return false;
      }

      $http.post('/api/auth/signin', vm.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;

        toastService.simpleToast('Welcome back, ' + response.firstName + '!');

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('PasswordController', PasswordController);

  PasswordController.$inject = ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator'];

  function PasswordController($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    var vm = this;

    vm.resetUserPassword = resetUserPassword;
    vm.askForPasswordReset = askForPasswordReset;
    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    function askForPasswordReset(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', vm.credentials).success(function (response) {
        // Show user success message and clear form
        vm.credentials = null;
        vm.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        vm.credentials = null;
        vm.error = response.message;
      });
    }

    // Change user password
    function resetUserPassword(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, vm.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        vm.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangePasswordController', ChangePasswordController);

  ChangePasswordController.$inject = ['$scope', '$http', 'Authentication', 'PasswordValidator'];

  function ChangePasswordController($scope, $http, Authentication, PasswordValidator) {
    var vm = this;

    vm.user = Authentication.user;
    vm.changeUserPassword = changeUserPassword;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;

    // Change user password
    function changeUserPassword(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.passwordForm');

        return false;
      }

      $http.post('/api/users/password', vm.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'vm.passwordForm');
        vm.success = true;
        vm.passwordDetails = null;
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangeProfilePictureController', ChangeProfilePictureController);

  ChangeProfilePictureController.$inject = ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader'];

  function ChangeProfilePictureController($scope, $timeout, $window, Authentication, FileUploader) {
    var vm = this;

    vm.user = Authentication.user;
    vm.imageURL = vm.user.profileImageURL;
    vm.uploadProfilePicture = uploadProfilePicture;

    vm.cancelUpload = cancelUpload;
    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture',
      onAfterAddingFile: onAfterAddingFile,
      onSuccessItem: onSuccessItem,
      onErrorItem: onErrorItem
    });

    // Set file uploader image filter
    vm.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    function onAfterAddingFile(fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    }

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(fileItem, response, status, headers) {
      // Show success message
      vm.success = true;

      // Populate user object
      vm.user = Authentication.user = response;

      // Clear upload buttons
      cancelUpload();
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(fileItem, response, status, headers) {
      // Clear upload buttons
      cancelUpload();

      // Show error message
      vm.error = response.message;
    }

    // Change user profile picture
    function uploadProfilePicture() {
      // Clear messages
      vm.success = vm.error = null;

      // Start upload
      vm.uploader.uploadAll();
    }

    // Cancel the upload process
    function cancelUpload() {
      vm.uploader.clearQueue();
      vm.imageURL = vm.user.profileImageURL;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('EditProfileController', EditProfileController);

  EditProfileController.$inject = ['$scope', '$http', '$location', 'UsersService', 'Authentication'];

  function EditProfileController($scope, $http, $location, UsersService, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
    vm.updateUserProfile = updateUserProfile;

    // Update a user profile
    function updateUserProfile(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = new UsersService(vm.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.userForm');

        vm.success = true;
        Authentication.user = response;
      }, function (response) {
        vm.error = response.data.message;
      });
    }
  }
}());

/**
 * Created by Nicole J. Nobles on 6/1/2016.
 */

(function () {
  'use strict';

  angular
    .module('users')
    .controller('ManageAccountController', ManageAccountController);

  ManageAccountController.$inject = ['$scope', 'Authentication', 'DataFactory', 'subscribeRequest', 'toastService'];

  function ManageAccountController($scope, Authentication, DataFactory, subscribeRequest, toastService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.requests = [];
    vm.institutions = [];
    vm.courses = [];

    function init() {
      if (vm.authentication.user.requests.length) {
        vm.getRequestData();
        if (vm.authentication.user.institutions.length) {
          vm.getInstitutionsData();
        }
        if (vm.authentication.user.courses.length) {
          vm.getCoursesData();
        }
      }
    }

    // console.log(vm.authentication.user);

    vm.getRequestData = function () {
      angular.forEach(vm.authentication.user.requests, function (request) {
        vm.data = {};
        DataFactory.getData('requests', request).then(
          function (res) {
            // console.log(res);
            vm.data.for_id = res.for_id;
            vm.data.type = res.type;
            vm.data.user = res.user.displayName;
            if (res.type === 'Institution') {
              DataFactory.getData(res.type + 's', res.for_id).then(
                function (res) {
                  vm.data.name = res.name;
                  var index = vm.currentUserIndex(res.teachers);
                  if (index >= 0) {
                    vm.data.stat = res.teachers[index].status;
                  } else {
                    vm.data.stat = 'N/A';
                  }
                  // console.log(vm.data);
                  vm.requests.push(vm.data);
                }, function (err) {}
              );
            } else if (res.type === 'Course') {
              DataFactory.getData(res.type + 's', res.for_id).then(
                function (res) {
                  vm.data.name = res.name;
                  var index = vm.currentUserIndex(res.students);
                  if (index >= 0) {
                    vm.data.stat = res.students[index].status;
                  } else {
                    vm.data.stat = 'N/A';
                  }
                  // console.log(vm.data);
                  vm.requests.push(vm.data);
                }, function (err) {}
              );
            }
          }, function (err) {}
        );
      });
    };

    vm.getInstitutionsData = function () {
      angular.forEach(vm.authentication.user.institutions, function (request) {
        vm.data = {};
        DataFactory.getData('institutions', request).then(
          function (res) {
            // console.log(res);
            vm.data._id = res._id;
            vm.data.active = res.active;
            vm.data.name = res.name;
            vm.data.key = 'Beta Tester';
            vm.institutions.push(vm.data);
          }, function (err) {}
        );
      });
    };

    vm.getCoursesData = function () {
      angular.forEach(vm.authentication.user.courses, function (request) {
        vm.data = {};
        DataFactory.getData('courses', request).then(
          function (res) {
            // console.log(res);
            vm.data._id = res._id;
            vm.data.active = res.active;
            vm.data.startDate = res.startDate;
            vm.data.endDate = res.endDate;
            vm.data.teacher = res.user.displayName;
            vm.data.name = res.name;
            vm.data.key = 'Beta Tester';
            vm.courses.push(vm.data);
          }, function (err) {}
        );
      });
    };

    vm.currentUserIndex = function (array) {

      var id = vm.authentication.user._id;

      for (var i = 0; i < array.length; i++) {
        if (array[i]._id._id === id) {
          return i;
        }
      }
      return -1;
    };

    vm.addedToMe = function (type, id) {
      if (type === 'Institution') {
        var institutions = vm.authentication.user.institutions;
        return vm.contains(institutions, id);
      } else if (type === 'Course') {
        var courses = vm.authentication.user.courses;
        return vm.contains(courses, id);
      }
      // return false;
    };

    vm.contains = function (array, item) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] === item) {
          return true;
        }
      }
      return false;
    };

    vm.addToMe = function (type, id) {
      if (type === 'Institution') {
        subscribeRequest.addInstitutionToUser(vm.authentication.user, id).then(
          function (res) {
            // console.log(res);
            toastService.simpleToast(type + ' Added.');
            vm.getInstitutionsData();
          },
          function (err) {
            toastService.simpleToast('Error adding ' + type + '.');
          }
        );
      } else if (type === 'Course') {
        subscribeRequest.addCourseToUser(vm.authentication.user, id).then(
          function (res) {
            // console.log(res);
            toastService.simpleToast(type + ' Added.');
            vm.getCoursesData();
          },
          function (err) {
            toastService.simpleToast('Error adding ' + type + '.');
          }
        );
      }
    };

    init(); // Placement of this matters
  }
})();

(function () {
  'use strict';

  angular
    .module('users')
    .controller('SocialAccountsController', SocialAccountsController);

  SocialAccountsController.$inject = ['$scope', '$http', 'Authentication'];

  function SocialAccountsController($scope, $http, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
    vm.hasConnectedAdditionalSocialAccounts = hasConnectedAdditionalSocialAccounts;
    vm.isConnectedSocialAccount = isConnectedSocialAccount;
    vm.removeUserSocialAccount = removeUserSocialAccount;

    // Check if there are additional accounts
    function hasConnectedAdditionalSocialAccounts() {
      return ($scope.user.additionalProvidersData && Object.keys($scope.user.additionalProvidersData).length);
    }

    // Check if provider is already in use with current user
    function isConnectedSocialAccount(provider) {
      return vm.user.provider === provider || (vm.user.additionalProvidersData && vm.user.additionalProvidersData[provider]);
    }

    // Remove a user social account
    function removeUserSocialAccount(provider) {
      vm.success = vm.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        vm.success = true;
        vm.user = Authentication.user = response;
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$scope', 'Authentication'];

  function SettingsController($scope, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .directive('passwordValidator', passwordValidator);

  passwordValidator.$inject = ['PasswordValidator'];

  function passwordValidator(PasswordValidator) {
    var directive = {
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, element, attrs, ngModel) {
      ngModel.$validators.requirements = function (password) {
        var status = true;
        if (password) {
          var result = PasswordValidator.getResult(password);
          var requirementsIdx = 0;

          // Requirements Meter - visual indicator for users
          var requirementsMeter = [{
            color: 'danger',
            progress: '20'
          }, {
            color: 'warning',
            progress: '40'
          }, {
            color: 'info',
            progress: '60'
          }, {
            color: 'primary',
            progress: '80'
          }, {
            color: 'success',
            progress: '100'
          }];

          if (result.errors.length < requirementsMeter.length) {
            requirementsIdx = requirementsMeter.length - result.errors.length - 1;
          }

          scope.requirementsColor = requirementsMeter[requirementsIdx].color;
          scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

          if (result.errors.length) {
            scope.getPopoverMsg = PasswordValidator.getPopoverMsg();
            scope.passwordErrors = result.errors;
            status = false;
          } else {
            scope.getPopoverMsg = '';
            scope.passwordErrors = [];
            status = true;
          }
        }
        return status;
      };
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .directive('passwordVerify', passwordVerify);

  function passwordVerify() {
    var directive = {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: link
    };

    return directive;

    function link(scope, element, attrs, ngModel) {
      var status = true;
      scope.$watch(function () {
        var combined;
        if (scope.passwordVerify || ngModel) {
          combined = scope.passwordVerify + '_' + ngModel;
        }
        return combined;
      }, function (value) {
        if (value) {
          ngModel.$validators.passwordVerify = function (password) {
            var origin = scope.passwordVerify;
            return (origin === password);
          };
        }
      });
    }
  }
}());

(function () {
  'use strict';

  // Users directive used to force lowercase input
  angular
    .module('users')
    .directive('lowercase', lowercase);

  function lowercase() {
    var directive = {
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  }
}());

(function () {
  'use strict';

  // Authentication service for user variables

  angular
    .module('users.services')
    .factory('Authentication', Authentication);

  Authentication.$inject = ['$window'];

  function Authentication($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .factory('confirmDialog', confirmDialog);

  confirmDialog.$inject = ['$mdDialog'];

  function confirmDialog($mdDialog) {
    // ConfirmDelete service logic

    // Include a reference to the object we're deleting
    var confirmDelete = function (data) {

      // Call the confirm() function to configure the confirmation dialog
      var confirm = $mdDialog.confirm()
        .title('Delete Confirmation')
        .content('Are you sure you want to delete ' + data + '?')
        .ariaLabel('Delete')
        .ok('Delete')
        .cancel('Cancel');

      return $mdDialog.show(confirm); // returns promise
    };
    // Public API
    return {
      confirmDelete: confirmDelete
    };
  }
})();
// cg2: Jacob Swain

// To Use
/*
 $scope.delete = function(data) {
 confirmDelete(data).then(
 function() {
 data.splice(index, 1);
 }
 );
 }
 */

(function () {
  'use strict';

  // PasswordValidator service used for testing the password strength
  angular
    .module('users.services')
    .factory('PasswordValidator', PasswordValidator);

  PasswordValidator.$inject = ['$window'];

  function PasswordValidator($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    var service = {
      getResult: getResult,
      getPopoverMsg: getPopoverMsg
    };

    return service;

    function getResult(password) {
      var result = owaspPasswordStrengthTest.test(password);
      return result;
    }

    function getPopoverMsg() {
      var popoverMsg = 'Please enter a passphrase or password with 10 or more characters, numbers, lowercase, uppercase, and special characters.';

      return popoverMsg;
    }
  }

}());

(function () {
  'use strict';

  // Users service used for communicating with the users REST endpoint
  angular
    .module('users.services')
    .factory('UsersService', UsersService);

  UsersService.$inject = ['$resource'];

  function UsersService($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }

  // TODO this should be Users service
  angular
    .module('users.admin.services')
    .factory('AdminService', AdminService);

  AdminService.$inject = ['$resource'];

  function AdminService($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
