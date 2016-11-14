(function () {
    'use strict';

    angular
        .module('users')
        .factory('confirmDialog', confirmDialog);

    confirmDialog.$inject = ['$mdDialog'];

    function confirmDialog($mdDialog) {
        // ConfirmDelete service logic

        // Include a reference to the object we're deleting
        var confirmDelete = function(data) {

            // Call the confirm() function to configure the confirmation dialog
            var confirm = $mdDialog.confirm()
                .title('Delete Confirmation')
                .content('Are you sure you want to delete '+data+'?')
                .ariaLabel('Delete')
                .ok('Delete')
                .cancel('Cancel');

            return $mdDialog.show(confirm); //returns promise
        };
        // Public API
        return {
            confirmDelete: confirmDelete
        };
    }
})();
// cg2: Jacob Swain

// To Use
/*
$scope.delete = function(data) {
    confirmDelete(data).then(
        function() {
            data.splice(index, 1);
        }
    );
 }
*/
