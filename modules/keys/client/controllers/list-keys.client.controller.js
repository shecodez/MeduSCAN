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
