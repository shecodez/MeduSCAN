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
        vm.user.canCreate = function() {
            var hasPermission = false;
            if(vm.authentication.user.roles[0] === 'admin' || vm.authentication.user.roles[0] === 'teacher'){
                hasPermission = true;
            }
            return hasPermission;
        };

        vm.user.canJoin = function() {
            var hasPermission = false;
            if(vm.authentication.user.roles[0] === 'student'){
                hasPermission = true;
            }
            return hasPermission;
        };
    }
})();
