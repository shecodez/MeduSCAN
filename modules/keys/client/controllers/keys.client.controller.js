(function () {
    'use strict';

    // Keys controller
    angular
        .module('keys')
        .controller('KeysController', KeysController);

    KeysController.$inject = ['$scope', '$state', 'Authentication', 'keyResolve'];

    function KeysController($scope, $state, Authentication, key) {
        var vm = this;

        vm.authentication = Authentication;
        vm.key = key;
        vm.error = null;
        vm.form = {};
        vm.remove = remove;
        vm.save = save;

        // Key status options
        vm.statusOpts = [
            {label: 'Active', value: true},
            {label: 'Inactive', value: false}
        ];

        // Key Type Opts
        vm.keyTypeOpts = [
            {value: 'Trial'},
            {value: 'Beta Tester'}, // Remove this option after beta
            {value: 'Single Session'},
            {value: 'Annual License'}
        ];

        // Key date logic
        vm.date = new Date();
        vm.minStartDate = vm.date;
        vm.maxStartDate = '';  // should be user's 'institution.keyExpiration' Date
        vm.minEndDate = vm.date.setDate((new Date()).getDate() + 1);
        vm.maxEndDate = '';    // should be user's 'institution.keyExpiration' Date

        // Check Value Exist
        vm.exist = function (value) {
            return !(value === null || value === '' || value === undefined);
        };

        if (vm.exist(vm.key.activationDate)) {
            vm.key.activationDate = new Date(vm.key.activationDate);
        } else vm.key.activationDate = new Date();

        if (vm.exist(vm.key.expirationDate)) {
            vm.key.expirationDate = new Date(vm.key.expirationDate);
        } else vm.key.expirationDate = new Date();

        // Remove existing Key
        function remove() {
            if (confirm('Are you sure you want to delete?')) {
                vm.key.$remove($state.go('keys.list'));
            }
        }

        // Save Key
        function save(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.form.keyForm');
                return false;
            }

            // TODO: move create/update logic to service
            if (vm.key._id) {
                vm.key.$update(successCallback, errorCallback);
            } else {
                vm.key.$save(successCallback, errorCallback);
            }

            function successCallback(res) {
                $state.go('keys.view', {
                    keyId: res._id
                });
            }

            function errorCallback(res) {
                vm.error = res.data.message;
            }
        }
    }
})();
