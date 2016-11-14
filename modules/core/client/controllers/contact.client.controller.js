/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('ContactController', ContactController);

  ContactController.$inject = ['$scope', '$http', 'toastService'];

  function ContactController($scope, $http, toastService) {
    // var vm = this;

    this.sendMail = function (form) {

      // Get the form data
      var data = ({
        contactName: this.contactName,
        contactEmail: this.contactEmail,
        contactMsg: this.contactMsg
      });

      // Contact POST request
      $http({
        method: 'POST',
        url: '/contact',
        data: data
      }).then(
        function successCallback(response) {
          toastService.simpleToast('Message sent. Thanks ' + response.data.contactName + '!');
        },
        function errorCallback(response) {
        });

      // Clear form
      this.contactName = '';
      this.contactEmail = '';
      this.contactMsg = '';
      $scope.resetForm(form);

    };

    $scope.resetForm = function (form) {
      form.$setPristine();
      form.$setUntouched();
    };
  }
}());
