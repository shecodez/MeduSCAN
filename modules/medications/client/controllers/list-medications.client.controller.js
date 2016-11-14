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
