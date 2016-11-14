(function () {
  'use strict';

  // Institutions controller
  angular
    .module('institutions')
    .controller('InstitutionsController', InstitutionsController);

  InstitutionsController.$inject = ['$scope', '$window', '$state', 'Authentication', 'institutionResolve', '$mdDialog', 'confirmDialog', 'generateRequest', 'DataFactory', 'toastService'];

  function InstitutionsController($scope, $window, $state, Authentication, institution, $mdDialog, confirmDialog, generateRequest, DataFactory, toastService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.institution = institution;
    vm.institutionTeachers = [];
    vm.subscribers = [];
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // console.log(vm.institution);

    // List Institution status boolean options
    vm.statusOpts = [
      { ID: 1, label: 'Active', value: true },
      { ID: 2, label: 'Inactive', value: false }
    ];
    vm.teacherStatusOpts = [
      { id: 1, value: 'Pending' },
      { id: 2, value: 'Approved' },
      { id: 3, value: 'Denied' }
    ];

    // Check if value Exist
    vm.exist = function (value) {
      return !(value === null || value === '' || value === undefined);
    };

    if (vm.institution._id) {
      vm.isCurrentUserOwner = institution.isCurrentUserOwner;
    }
    // ToDO: Add 'loading...' gif
    function init() {
      if (vm.institution._id) {
        vm.institution.isCurrentUserOwner = vm.isCurrentUserOwner;

        if (vm.institution.teachers.length) {
          DataFactory.getData('institutions', vm.institution._id).then(
            function (res) {
              vm.institutionTeachers = res.teachers;
              for (var i = 0; i < vm.institutionTeachers.length; i ++) {
                vm.institutionTeachers[i].statusUnchanged = true;
              }
              // console.log(vm.institutionTeachers);
            },
            function (err) {
              vm.error = err;
            }
          );
        }
      }
    }

    // Get Subscribers ---------------------------------------------------------------------------------------------
    if (vm.exist(vm.institution.request)) {
      vm.subscribers = vm.institution.request.subscribers;
    }
    // Open Dialog -------------------------------------------------------------------------------------------------
    vm.openSubscribersDialog = function () {
      var subscribers = vm.getAddableSubscribers(vm.subscribers);

      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/requests/client/views/dialogs/subs-table.client.template.html',
        controller: function ($scope, $mdDialog, subscribers) {
          $scope.subscribers = subscribers;

          $scope.ok = function () {
            vm.addTeachers(subscribers);
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        },
        locals: {
          subscribers: subscribers
        },
        parent: angular.element(document.body)
      });
    };

    // Mark subscribers that are already teachers isReadOnly--------------------------------------------------------
    vm.getAddableSubscribers = function (subscribers) {
      var tempSubs = [];

      angular.forEach(subscribers, function (subscriber) {
        if (vm.contains(vm.institutionTeachers, subscriber._id)) {
          subscriber.isReadOnly = true;
        } else {
          subscriber.isReadOnly = false;
        }
        tempSubs.push(subscriber);
      });
      return tempSubs;
    };

    vm.contains = function (array, item) {
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id._id === item) {
          return true;
        }
      }
      return false;
    };

    // ---- ADD ----------------------------------------------------------------------------------------------------
    vm.addTeachers = function (subscribers) {
      angular.forEach(subscribers, function (subscriber) {
        if (subscriber.selected) {
          var teacher = {};
          teacher._id = subscriber._id;
          teacher.status = 'Pending';
          vm.institution.teachers.push(teacher);
        }
      });
      vm.update('added');// update institution data & refresh
    };

    // ---- REMOVE -------------------------------------------------------------------------------------------------
    vm.removeTeacher = function (index) {
      vm.institution.teachers.splice(index, 1);
      vm.institutionTeachers.splice(index, 1);
      vm.update('removed');
    };

    // ---- UPDATE -------------------------------------------------------------------------------------------------
    vm.updateTeacherStatus = function (teacher, index) {
      vm.institution.teachers[index] = teacher;
      vm.update('status updated');
    };

    vm.update = function (action) {
      vm.institution.$update(function () {
        // $window.location.reload();
        toastService.simpleToast('Teacher ' + action);
        init();
      }, function (err) {
        toastService.simpleToast(err);
      });
    };

    // Generate Request --------------------------------------------------------------------------------------------
    vm.createRequest = function () {
      if (!vm.exist(vm.institution.request)) {
        var requestData = {
          for_id: vm.institution._id,
          type: 'Institution',
          user: vm.authentication.user._id
        };
        generateRequest.institutionRequest(requestData).then(
          function (request) {
            // console.log(request.data.request_id); <-- worried this will be undefined sometimes
            vm.institution.request = request.data.request;
            toastService.simpleToast('Join ID successfully generated!');
          },
          function (error) {
            vm.status = 'Failed to generate institution join ID. '; // +error.message
          }
        );
      }
    };

    // Remove existing Institution ---------------------------------------------------------------------------------
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.institution.$remove($state.go('institutions.list'));
      }
    }

    // Save Institution --------------------------------------------------------------------------------------------
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.institutionForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.institution._id) {
        vm.institution.$update(successCallback, errorCallback);
      } else {
        vm.institution.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('institutions.view', {
          institutionId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    init(); // Placement of this matters
  }
})();
