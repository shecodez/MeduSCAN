(function () {
  'use strict';

  angular
    .module('requests')
    .controller('RequestJoinController', RequestJoinController);

  RequestJoinController.$inject = ['$scope', 'Authentication', '$mdDialog', 'subscribeRequest', 'toastService'];

  function RequestJoinController($scope, Authentication, $mdDialog, subscribeRequest, toastService) {
    var vm = this;
    vm.authentication = Authentication;

    vm.request = [];
    vm.course = [];
    vm.institution = [];
    vm.error = null;
    vm.form = {};

    vm.lookupRequestId = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'requestJForm');
        return false;
      }

      subscribeRequest.getRequest(vm.requestId).then(
        function (request) {
          // console.log(request.data);
          vm.request = request.data;
          vm.lookupObjOfRequest(vm.request);
        },
        function (error) {
          vm.error = 'Request ID NOT found. ';
          vm.requestId = '';
        }
      );
    };

    vm.lookupObjOfRequest = function (request) {
      var object = {
        id: request.for_id,
        type: request.type
      };

      if (vm.isNewRequest(request._id)) {
        subscribeRequest.getObjOfRequest(object).then(
          function (reqObj) {
            // console.log(reqObj.data);
            if (request.type === 'Course') {
              vm.course = reqObj.data;
              vm.joinCourseDialog(vm.course);
            } else if (request.type === 'Institution') {
              vm.institution = reqObj.data;
              vm.joinInstitutionDialog(vm.institution);
            }
          },
          function (error) {
            vm.error = request.type + ' NOT found. ';
          }
        );
      } else {
        vm.error = 'You have already requested to join this ' + request.type + '!';
        vm.requestId = '';
      }
    };

    vm.isNewRequest = function (id) {
      var length = vm.authentication.user.requests.length;

      if (length === 0) {
        return true;
      }

      for (var i = 0; i < length; i++) {
        if (vm.authentication.user.requests[i] === id) {
          return false;
        }
      }
      return true;
    };

    /**
     * Subscribe to...
     * @param type
     */
    vm.subscribeTo = function (type) {

      var subscriber = vm.authentication.user._id;

      subscribeRequest.subscribe(vm.request, subscriber).then(
        function (response) {
          // console.log(response);
          vm.addRequestTo(vm.authentication.user);
        },
        function (error) {
          vm.error = 'Error requesting subscription to ' + type + '.';
        }
      );
    };

    /**
     * Add request to...
     * @param user
     */
    vm.addRequestTo = function (user) {

      var request = vm.request;

      subscribeRequest.addRequestToUser(user, request).then(
        function (response) {
          // console.log(response);
          toastService.simpleToast('Request to join ' + request.type + ' successfully processed.');
        },
        function (error) {
          toastService.simpleToast('Error Requesting to join ' + request.type + ',');
        }
      );
    };

    vm.joinCourseDialog = function (course) {
      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/courses/client/views/dialogs/join-course.client.view.html',
        controller: function ($scope, $mdDialog, course) {
          $scope.course = course;

          $scope.ok = function () {
            vm.subscribeTo('course');
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        },
        locals: {
          course: course
        },
        parent: angular.element(document.body)
      });
    };

    vm.joinInstitutionDialog = function (institution) {
      $mdDialog.show({
        clickOutsideToClose: false,
        templateUrl: 'modules/institutions/client/views/dialogs/join-institution.client.view.html',
        controller: function ($scope, $mdDialog, institution) {
          $scope.institution = institution;

          $scope.ok = function () {
            vm.subscribeTo('institution');
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
        },
        locals: {
          institution: institution
        },
        parent: angular.element(document.body)
      });
    };
  }
})();
