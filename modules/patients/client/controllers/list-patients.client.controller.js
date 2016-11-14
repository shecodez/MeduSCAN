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
