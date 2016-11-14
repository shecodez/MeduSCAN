(function () {
  'use strict';

  angular
    .module('patients')
    .controller('LookupPatientController', LookupPatientController);

  LookupPatientController.$inject = ['$scope', '$location', 'Authentication', 'DataFactory'];

  function LookupPatientController($scope, $location, Authentication, DataFactory) {
    var vm = this;
    vm.authentication = Authentication;
    vm.courses = [];
    vm.error = null;

    function init() {
      if (vm.authentication.user.courses.length) {
        angular.forEach(vm.authentication.user.courses, function (course) {
          DataFactory.getData('courses', course).then(
            function (res) {
              // console.log(res);
              var course = {};
              course._id = res._id;
              course.active = res.active;
              course.name = res.name;
              course.patients = res.patients;
              vm.courses.push(course);
            },
            function (err) {
              vm.error = err;
            }
          );
        });
      }
      if (vm.authentication.user._id) {
        if (vm.authentication.user.roles[0] === 'teacher') {
          DataFactory.getList('courses').then(
            function (res) {
              vm.courseDataIfTeacher(res);
            },
            function (err) {
              vm.error = err;
            }
          );
        }
      }
    }

    vm.courseDataIfTeacher = function (courses) {
      angular.forEach(courses, function (course) {
        DataFactory.getData('courses', course._id).then(
          function (res) {
            // console.log(res);
            var course = {};
            course._id = res._id;
            course.active = res.active;
            course.name = res.name;
            course.patients = res.patients;
            vm.courses.push(course);
          },
          function (err) {
            vm.error = err;
          }
        );
      });
    };

    vm.lookupPatient = function (isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'pLookupForm');
        return false;
      }

      var id = vm.pID;
      var course = vm.course;
      var index = vm.contains(course.patients, id);
      if (index >= 0) {
        var patient = course.patients[index];
        if (patient.active) {
          // redirect to patient EMAR
          $location.path('patients/' + patient._id + '/emar');
        } else {
          vm.error = 'Patient : "' + patient.firstName + ' ' + patient.lastName + '" is NOT active.';
        }
      } else {
        vm.error = 'Patient ID : "' + id + '" NOT found in ' + course.name;
      }
    };

    vm.contains = function (array, item) {
      // console.log(array);
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id === item) {
          return i;
        }
      }
      return -1;
    };

    init();
  }
})();
