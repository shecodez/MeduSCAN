/**
 * Created by Nicole J. Nobles on 6/21/2016.
 */

(function () {
  'use strict';

  angular
    .module('patients')
    .controller('PatientMedicationsController', PatientMedicationsController);

  PatientMedicationsController.$inject = ['$scope', 'Authentication', 'patientResolve', '$mdDialog', 'DataFactory', 'rtCalcService', 'toastService'];

  function PatientMedicationsController($scope, Authentication, patient, $mdDialog, DataFactory, rtCalcService, toastService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.patient = patient;
    vm.patientMedications = [];
    vm.error = null;
    vm.form = {};

    // console.log(vm.patient.medications);

    // Check Value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    // RT Calculations
    vm.calcAmt = function (str, dose, amt) {
      if (vm.exist(str) && vm.exist(dose) && vm.exist(amt)) {
        return rtCalcService.calcAmt(str, dose, amt);
      } else {
        return amt;
      }
    };

    function init() {
      DataFactory.getData('patients', vm.patient._id).then(
        function (res) {
          vm.patientMedications = res.medications;
        },
        function (err) {
          vm.error = err;
        }
      );
    }


    // ---- ADD/UPDATE Form ----------------------------------------------------------------------------------------
    vm.dialogPatientMedForm = function (action, patient, medication, index) {

      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/medications/dialogs/form-patientMedication.client.view.html',
        controller: function ($scope, $mdDialog, action, patient, medication, index, rtCalcService) {
          $scope.patient = patient;
          $scope.medication = medication;
          $scope.action = action;

          if (index >= 0) {
            $scope.patient.medication = patient.medications[index];
            $scope.patient.medication.time = new Date(patient.medications[index].time); // hot fix b/c times is array.
          }

          // MedType Opts
          $scope.medTypeOpts = [
            { ID: 1, value: 'Scheduled' },
            { ID: 2, value: 'PRN' },
            { ID: 3, value: 'Stat/1x' },
            { ID: 4, value: 'IV Fluid' }
          ];

          // Check Value Exist
          $scope.exist = function (value) {
            return !(value === null || value === '' || value === undefined);
          };

          $scope.calcAge = function (dateStr) {
            if ($scope.exist(dateStr)) {
              return rtCalcService.calcAge(dateStr);
            } else {
              return 0;
            }
          };

          // if(!$scope.exist($scope.patient.medication.times)) { $scope.patient.medication.times = new Date(); }

          $scope.ok = function (pMed) {
            if (action === 'Add') {
              pMed._id = medication._id;
              vm.addPatientMed(pMed);
            } else if (action === 'Update') {
              vm.updatePatientMed(pMed, index);
            }
            $mdDialog.cancel();
          };
          $scope.cancel = function () {
            // $scope.pMedForm.$rollbackViewValue();
            $scope.pMedForm.$setPristine();
            $scope.pMedForm.$setUntouched();
            $mdDialog.cancel();
          };
        },
        locals: {
          index: index,
          action: action,
          patient: patient,
          medication: medication
        },
        parent: angular.element(document.body)
      });
    };

    // ---- ADD ----------------------------------------------------------------------------------------------------
    vm.addPatientMed = function (pMed) {
      vm.patient.medications.push(pMed);
      vm.update('added');
      // console.log(vm.patient.medications);
    };

    // ---- REMOVE  ------------------------------------------------------------------------------------------------
    vm.removePatientMed = function (index) {
      vm.patient.medications.splice(index, 1);
      vm.update('removed');
    };

    // ---- UPDATE -------------------------------------------------------------------------------------------------
    vm.updatePatientMed = function (pMed, index) {
      vm.patient.medications[index] = pMed;
      vm.update('updated');
      // console.log(vm.patient.medications[index]);
    };

    vm.update = function (action) {
      vm.patient.updated = Date.now();
      vm.patient.$update(function () {
        toastService.simpleToast('Medication ' + action);
        init();
      }, function (err) {
        toastService.simpleToast('Oops something went wrong.');
      });
    };

    // ---- SEARCH -------------------------------------------------------------------------------------------------
    vm.lookupMed = function (mID) {

      if (vm.alreadyAdded(vm.patient.medications, mID)) {
        vm.error = 'Medication ID: "' + mID + '" has already been added to this patient.';
      } else {
        DataFactory.getDataPromise('medications', mID).then(
          function (res) {
            var med = res.data;
            if (med && !med.active) {
              vm.error = '"' + med.name + '" is NOT active. Please change the medication\'s status ' +
                'from "inactive" to "active" to add this medication.';
            } else {
              // Close dialogLookupMed
              vm.closeDialogLookupMed();
              // Open dialogForm
              vm.dialogPatientMedForm('Add', vm.patient, med, -1);
              vm.error = null; // Clear error msg
            }
          },
          function (err) {
            vm.error = 'Medication ID : "' + mID + '" NOT found. \n' +
              'Please make sure to add the medication to the medications database first.';
          }
        );
      }
    };
    // Open a dialog window to find an existing Medication
    vm.dialogLookupMed = function () {
      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/medications/dialogs/lookup-medication.client.dialog.html',
        scope: $scope,
        preserveScope: true,
        parent: angular.element(document.body)
      });
      vm.okDialogLookupMed = function (mID) {
        vm.lookupMed(mID);
      };
      vm.closeDialogLookupMed = function () {
        $mdDialog.cancel();
        vm.mID = '';
      };
    };

    // ---- MISC ---------------------------------------------------------------------------------------------------
    vm.alreadyAdded = function (patientMedications, scannedId) {
      var found = false;

      for (var i = 0; i < patientMedications.length; i++) {
        if (patientMedications[i]._id === scannedId) {
          found = true;
          break;
        }
      }
      return found;
    };

    init();
  }
})();
