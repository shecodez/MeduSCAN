/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('StudentsController', StudentsController);

  StudentsController.$inject = ['Authentication'];

  function StudentsController(Authentication) {
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
