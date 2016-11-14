(function () {
  'use strict';

  // Patients controller
  angular
    .module('patients')
    .controller('PatientsController', PatientsController);

  PatientsController.$inject = ['$scope', '$state', 'Authentication', 'patientResolve', 'rtCalcService', '$mdDialog'];

  function PatientsController($scope, $state, Authentication, patient, rtCalcService, $mdDialog) {
    var vm = this;

    vm.authentication = Authentication;
    vm.patient = patient;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // List Patient status boolean options
    vm.statusOpts = [
      { ID: 1, label: 'Active', value: true },
      { ID: 2, label: 'Inactive', value: false }
    ];

    // RT Calculations
    vm.calcAge = function (dateStr) {
      if (vm.exist(dateStr)) {
        return rtCalcService.calcAge(dateStr);
      } else {
        return 0;
      }
    };

    vm.calcFt = function (value) {
      if (vm.exist(value)) {
        return rtCalcService.calcFt(value);
      } else {
        return "0' 0\"";
      }
    };
    vm.calcLb = function (value) {
      if (vm.exist(value)) {
        return rtCalcService.calcLb(value);
      } else {
        return 0;
      }
    };

    vm.calcBMI = function (kg, cm) {
      vm.bmi = rtCalcService.calcBMI(kg, cm);
      return rtCalcService.calcBMI(kg, cm);
    };
    vm.textBMI = function (bmi) {
      return rtCalcService.textBMI(bmi);
    };

    // Check Value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    // Convert String to Date
    if (vm.exist(vm.patient.scenarioTime)) {
      vm.patient.scenarioTime = new Date(vm.patient.scenarioTime);
    } else {
      vm.patient.scenarioTime = new Date();
    }

    if (vm.exist(vm.patient.dob)) {
      vm.patient.dob = new Date(vm.patient.dob);
    }

    // DOB - datePicker min & max dates
    vm.minDate = new Date(1901, 1, 1);
    vm.maxDate = new Date(); // today

    // Remove existing Patient
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.patient.$remove($state.go('patients.list'));
      }
    }

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
    vm.printBarcode = function (patient) {
      $mdDialog.show({
        templateUrl: 'modules/patients/client/views/dialogs/patient-barcode.client.dialog.html',
        controller: function ($scope, $mdDialog, patient) {
          $scope.patient = patient;

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
          patient: patient
        },
        parent: angular.element(document.body)
      });
    };

    // Save Patient
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.patientForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.patient._id) {
        vm.patient.updated = new Date();
        vm.patient.$update(successCallback, errorCallback);
      } else {
        vm.patient.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('patients.view', {
          patientId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
