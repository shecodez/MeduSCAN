/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('TeachersController', TeachersController);

  TeachersController.$inject = ['Authentication'];

  function TeachersController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;

    function init() {
      if (vm.authentication.user._id) {
        vm.role = vm.authentication.user.roles[0];
      }
    }
    init();
  }
}());
