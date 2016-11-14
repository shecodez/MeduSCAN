(function () {
  'use strict';

  // Medications controller
  angular
    .module('medications')
    .controller('MedicationsController', MedicationsController);

  MedicationsController.$inject = ['$scope', '$state', 'Authentication', 'medicationResolve', '$mdDialog'];

  function MedicationsController($scope, $state, Authentication, medication, $mdDialog) {
    var vm = this;

    vm.authentication = Authentication;
    vm.medication = medication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // List Medication status boolean options
    vm.statusOpts = [
      { ID: 1, label: 'Active', value: true },
      { ID: 2, label: 'Inactive', value: false }
    ];

    // List Medication Types
    vm.medTypes = [
      { ID: 1, value: 'Generic' },
      { ID: 2, value: 'Brand' },
      { ID: 3, value: 'Fictitious' }
    ];

    // List Pregnancy Categories
    vm.pregnancyCategories = [
      { ID: 1, value: 'Category A' },
      { ID: 2, value: 'Category B' },
      { ID: 3, value: 'Category C' },
      { ID: 4, value: 'Category D' },
      { ID: 5, value: 'Category X' },
      { ID: 6, value: 'Category N' }
    ];

    // Barcode Options
    vm.bcOpts = {
      width: 1,
      height: 55,
      displayValue: true,
      font: 'monospace',
      textAlign: 'center',
      fontSize: 15
    };

    // TODO: move to service
    // Open print dialog
    vm.printBarcode = function (medication) {
      $mdDialog.show({
        templateUrl: 'modules/medications/client/views/dialogs/medication-barcode.client.dialog.html',
        controller: function ($scope, $mdDialog, medication) {
          $scope.medication = medication;

          // Barcode Options
          $scope.bcOpts = {
            width: 1,
            height: 55,
            displayValue: true,
            font: 'monospace',
            textAlign: 'center',
            fontSize: 15
          };

          $scope.ok = function () {
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        },
        locals: {
          medication: medication
        },
        parent: angular.element(document.body)
      });
    };

    // Remove existing Medication
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.medication.$remove($state.go('medications.list'));
      }
    }

    // Save Medication
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.medicationForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.medication._id) {
        vm.medication.updated = new Date();
        vm.medication.$update(successCallback, errorCallback);
      } else {
        vm.medication.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('medications.view', {
          medicationId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
