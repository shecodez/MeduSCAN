(function () {
    'use strict';

    angular
        .module('core')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['Authentication'];

    function DashboardController(Authentication) {
        // Dashboard controller logic
        var vm = this;
        vm.authentication = Authentication;
        if(vm.authentication.user._id) {
            vm.role = vm.authentication.user.roles[0];
        }

        function init() {
            if(vm.authentication.user._id) {
                vm.role = vm.authentication.user.roles[0];
            }
        }

        this.studentsTiles = buildGridModelS({
            icon : "",
            title: "",
            href : "",
            background: ""
        });
        function buildGridModelS(tileTmpl) {
            var it, results = [ ];
            var icons = ['search', 'dashboard', 'home', 'input'];
            var titles = ['Patient Lookup','Dashboard', 'Home', 'Request Join'];
            var links = ['patient-lookup', 'dashboard', 'home', 'request-join'];
            for (var i=0; i<4; i++) {
                it = angular.extend({},tileTmpl);
                it.icon  = it.icon + icons[i];
                it.title = it.title + titles[i];
                it.href  = it.href + links[i];
                it.span  = { row : 1, col : 1 };
                switch(i+1) {
                    case 1:
                        it.background = "gold-bg";
                        it.span.col = 2;
                        break;
                    case 2: it.background = "pink-bg";      break;
                    case 3: it.background = "blue-bg";      break;
                    case 4:
                        it.background = "mint-bg";
                        it.span.col = 2;
                        break;
                }
                results.push(it);
            }
            return results;
        }

        this.teachersTiles = buildGridModelT({
            icon : "",
            title: "",
            href : "",
            background: ""
        });
        function buildGridModelT(tileTmpl){
            var it, results = [ ];
            var icons = ['assignment_ind', 'search', 'date_range', 'add_box'];
            var titles = ['Patients','Patient Lookup', 'Courses', 'Medications'];
            var links = ['patients.list', 'patient-lookup', 'courses.list', 'medications.list'];
            for (var i=0; i<4; i++) {
                it = angular.extend({},tileTmpl);
                it.icon  = it.icon + icons[i];
                it.title = it.title + titles[i];
                it.href  = it.href + links[i];
                it.span  = { row : 1, col : 1 };
                switch(i+1) {
                    case 1:
                        it.background = "pink-bg";
                        it.span.col = 2;
                        break;
                    case 2: it.background = "mint-bg";      break;
                    case 3: it.background = "blue-bg";      break;
                    case 4:
                        it.background = "gold-bg";
                        it.span.col = 2;
                        break;
                }
                results.push(it);
            }
            return results;
        }

        init();
    }
})();

/* For ADMIN (later use)

 inject CoursesService

 vm.courseCount = CoursesService.countCourses(); // returns a count of courses for the admin dashboard

 in view {{vm.courseCount.count}}

 */

