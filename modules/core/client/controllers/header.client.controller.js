(function () {
    'use strict';

    // Header controller
    angular
        .module('core')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['Authentication', '$mdSidenav', '$mdDialog'];

    function HeaderController(Authentication, $mdSidenav, $mdDialog) {
        var vm = this;
        vm.authentication = Authentication;
        vm.user = vm.authentication.user;

        if(vm.authentication.user._id) {
            vm.role = vm.authentication.user.roles[0];
        }

        // menuLinks
        vm.menuLinks = [];

        vm.coreLinks = [
            {icon: 'home',      label: 'Home',             goTo: 'home'},
            {icon: 'group',     label: 'About Us',         goTo: 'about'},
            {icon: 'important_devices', label: 'Getting Started',  goTo: 'getting_started'},
            {icon: 'account_balance',   label: 'Teachers',         goTo: 'teachers'},
            {icon: 'school',        label: 'Students',     goTo: 'students'},
            {icon: 'view_day',      label: 'Blogs',        goTo: 'blogs.list'},
            {icon: 'desktop_mac',   label: 'Tutorials',    goTo: 'tutorials.list'},
            {icon: 'send',          label: 'Contact Us',   goTo: 'contact'}
        ];

        // Get the topbar menu
        //$scope.menu = Menus.getMenu('topbar');

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
        this.openProfileMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        // ---- Toggle Menu & Close ---------------------------------

        vm.toggleMenu = function() {
            $mdSidenav('menu').toggle();
        };
        vm.close = function() {
            $mdSidenav('menu').close();
        };

    }
})();

