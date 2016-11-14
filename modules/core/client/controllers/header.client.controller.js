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
        controller: function ($scope, $mdDialog) {

          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        },
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
