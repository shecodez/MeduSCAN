(function () {
  'use strict';

  angular
    .module('patients')
    .factory('dialogService', dialogService);

  dialogService.$inject = ['$mdDialog'];

  function dialogService($mdDialog) {
    // dialogService service logic
    var dialog = {};

    dialog.simpleAlert = function (alert) {
      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/dialogs/alerts/simple-alert.client.dialog.html',
        controller: function ($scope, $mdDialog, alert) {
          $scope.dialog = alert;
          // console.log(alert);

          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        },
        locals: {
          alert: alert
        },
        parent: angular.element(document.body)
      });
    };

    dialog.alert = function (alert) {
      return $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/patients/client/views/dialogs/alerts/alert-client.dialog.html',
        controller: function ($scope, $mdDialog, alert) {
          $scope.dialog = alert;
          // console.log(alert);

          $scope.ok = function () {
            $mdDialog.hide(true);
          };
          $scope.cancel = function () {
            $mdDialog.cancel(true);
          };
        },
        locals: {
          alert: alert
        },
        parent: angular.element(document.body)
      }).then(function (ans) {
        return ans;
      }, function () {
        return false;
      });
    };

    // Public API
    return dialog;
  }
})();
