/**
 * Created by Nicole J. Nobles on 5/23/2016.
 */

'use strict';

angular.module('core').controller('ContactController', ['$scope', '$http', 'toastService',
    function($scope, $http, toastService) {

        this.sendMail = function(form) {

            // Get the form data
            var data = ({
                contactName : this.contactName,
                contactEmail : this.contactEmail,
                contactMsg: this.contactMsg
            });

            // /contact POST request
            $http({
                method: 'POST',
                url: '/contact',
                data: data
            }).then(
                function successCallback(response) {
                    toastService.simpleToast('Message sent. Thanks '+ response.data.contactName +'!');
                },
                function errorCallback(response) {
            });

            //clear form
            this.contactName = '';
            this.contactEmail = '';
            this.contactMsg = '';
            $scope.resetForm(form);

        };

        $scope.resetForm = function(form) {
            form.$setPristine();
            form.$setUntouched();
        };
    }
]);
