/**
 * Created by Nicole J. Nobles on 6/7/2016.
 */

(function () {
    'use strict';

    // SideNav controller
    angular
        .module('core')
        .controller('SideNavController', SideNavController);

    SideNavController.$inject = ['Authentication', '$mdSidenav'];

    function SideNavController(Authentication, $mdSidenav) {
        var vm = this;
        vm.authentication = Authentication;
        vm.user = vm.authentication.user;

        console.log(vm.authentication.user);

        if(vm.user){
            if(vm.user.roles[0] === 'teacher') {
                vm.sideBarLinks = [
                    {icon: 'home',          label: 'Home',          href: 'home'},
                    {icon: 'dashboard',     label: 'Dashboard',     href: 'dashboard'},
                    {icon: 'assignment_ind',label: 'Patients',      href: 'patients.list'},
                    {icon: 'add_box',       label: 'Medications',   href: 'medications.list'},
                    {icon: 'date_range',    label: 'Courses',       href: 'courses.list'},
                    {icon: 'input',         label: 'Join Institute', href: 'request-join'},
                    {icon: 'search',        label: 'Patient Lookup',href: 'patient-lookup'}
                ];
            }
            if(vm.user.roles[0] === 'student') {
                vm.sideBarLinks = [
                    {icon: 'home',          label: 'Home',          href: 'home'},
                    {icon: 'dashboard',     label: 'Dashboard',     href: 'dashboard'},
                    {icon: 'input',         label: 'Join Course',   href: 'request-join'},
                    {icon: 'search',        label: 'Patient Lookup',href: 'patient-lookup'}
                ];
            }
            if(vm.user.roles[0] === 'admin') {
                vm.sideBarLinks = [
                    {icon: 'home',          label: 'Home',          href: 'home'},
                    {icon: 'dashboard',     label: 'Dashboard',     href: 'dashboard'},
                    {icon: 'people',        label: 'Users',         href: 'admin.users'},
                    {icon: 'account_balance',label: 'Institutions', href: 'institutions.list'},
                    {icon: 'input',         label: 'Requests',      href: 'requests.list'},
                    {icon: 'vpn_key',       label: 'Keys',          href: 'keys.list'}

                    //{icon: 'assignment_ind',label: 'Patients',      href: 'patients.list'},
                    //{icon: 'add_box',       label: 'Medications',   href: 'medications.list'},
                    //{icon: 'date_range',    label: 'Courses',       href: 'courses.list'},
                    //{icon: 'search',        label: 'Patient Lookup',href: 'patient-lookup'}
                ];
            }
        }
        // ---- Toggle Menu & Close ---------------------------------

        vm.toggleMenu = function() {
            $mdSidenav('menu').toggle();
        };
        vm.close = function() {
            $mdSidenav('menu').close();
        };

    }
})();
