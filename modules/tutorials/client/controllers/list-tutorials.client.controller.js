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
