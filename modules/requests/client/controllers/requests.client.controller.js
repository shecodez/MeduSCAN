(function () {
  'use strict';

  // Requests controller
  angular
    .module('requests')
    .controller('RequestsController', RequestsController);

  RequestsController.$inject = ['$scope', '$state', 'Authentication', 'requestResolve', 'DataFactory', 'toastService'];

  function RequestsController($scope, $state, Authentication, request, DataFactory, toastService) {
    var vm = this;
    vm.authentication = Authentication;

    vm.request = request;
    vm.subscribers = [];
    vm.status = null;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Request type options
    vm.requestTypeOpts = [
      { id: 1, value: 'Course' },
      { id: 2, value: 'Institution' },
      { id: 3, value: 'Key' }
    ];

    function init() {
      vm.subs = [];
      angular.forEach(vm.request.subscribers, function (value) {
        vm.subs.push(value);
      });

      // Get users(subscribers) data from [request.subscribers]
      vm.getRequestSubscriberData();
    }

    vm.getRequestSubscriberData = function () {
      var data = 'users';

      angular.forEach(vm.subs, function (sub) {
        var id = sub._id;
        var status = sub.approvalStatus;
        DataFactory.getData(data, id).then(
          function (userData) {

            var subData = {};
            subData._id = userData._id;
            subData.firstName = userData.firstName;
            subData.lastName = userData.lastName;
            subData.email = userData.email;
            subData.approvalStatus = status;

            vm.subscribers.push(subData);
            // console.log(userData);
          },
          function (error) {
            vm.status = 'Failed to retrieve Subscriber Data. '; // +error.message
          }
        );
      });
    };

    init(); // Placement of this matters

    vm.updateSubscriberData = function () {
      var tempSubArr = [];
      angular.forEach(vm.subscribers, function (sub) {
        var updatedSub = {};
        updatedSub._id = sub._id;
        updatedSub.approvalStatus = sub.approvalStatus;

        tempSubArr.push(updatedSub);
      });
      vm.request.subscribers = tempSubArr;
      vm.updateRequestData();
    };

    vm.updateRequestData = function () {
      vm.request.$update(function (res) {
        // console.log(res);
        toastService.simpleToast('Subscriber approval status updated.');
      }, function (error) {
        vm.error = error;
      });
    };

    // Remove existing Request
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.request.$remove($state.go('requests.list'));
      }
    }

    // Save Request
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.requestForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.request._id) {
        vm.request.$update(successCallback, errorCallback);
      } else {
        vm.request.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('requests.view', {
          requestId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
