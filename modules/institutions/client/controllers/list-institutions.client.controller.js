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
