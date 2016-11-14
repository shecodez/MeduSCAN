(function () {
  'use strict';

  // Tutorials controller
  angular
    .module('tutorials')
    .controller('TutorialsController', TutorialsController);

  TutorialsController.$inject = ['$scope', '$state', 'Authentication', 'tutorialResolve'];

  function TutorialsController ($scope, $state, Authentication, tutorial) {
    var vm = this;

    vm.authentication = Authentication;
    vm.tutorial = tutorial;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Tutorial
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.tutorial.$remove($state.go('tutorials.list'));
      }
    }

    // Save Tutorial
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tutorialForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.tutorial._id) {
        vm.tutorial.$update(successCallback, errorCallback);
      } else {
        vm.tutorial.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('tutorials.view', {
          tutorialId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
