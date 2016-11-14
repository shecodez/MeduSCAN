(function () {
    'use strict';

    // Courses controller
    angular
        .module('courses')
        .controller('CoursesController', CoursesController);

    CoursesController.$inject = ['$scope', '$state', 'Authentication', 'courseResolve', 'DataFactory', 'confirmDialog', 'generateRequest', 'toastService', '$mdDialog'];

    function CoursesController($scope, $state, Authentication, course, DataFactory, confirmDialog, generateRequest, toastService, $mdDialog) {
        var vm = this;
        vm.authentication = Authentication;
        vm.course = course;
        vm.courseStudents = [];
        vm.coursePatients = [];
        vm.subscribers = [];
        vm.patients = [];
        vm.error = null;
        vm.form = {};
        vm.remove = remove;
        vm.save = save;

        //console.log(vm.course);

        // md-select options
        vm.statusOpts = [
            {label: 'Active', value: true},
            {label: 'Inactive', value: false}
        ];
        vm.studentStatusOpts = [
            {id: 1, value: 'Pending'},
            {id: 2, value: 'Approved'},
            {id: 3, value: 'Denied'}
        ];

        // Course date logic
        vm.date = new Date();
        vm.minStartDate = vm.date;
        vm.maxStartDate = '';  // should be user's 'institution.keyExpiration' Date
        vm.minEndDate = vm.date.setDate((new Date()).getDate() + 1);
        vm.maxEndDate = '';    // should be user's 'institution.keyExpiration' Date

        vm.user = {};
        vm.user.canEdit = function () {
            var hasPermission = false;
            if(vm.authentication.user) {
                for(var i =0; i < vm.authentication.user.roles.length; i++) {
                    if (vm.authentication.user.roles[i] === 'admin' || vm.authentication.user.roles[i] === 'teacher') {
                        return true;
                    }
                }
            }
            return hasPermission;
        };

        // Check Value Exist
        vm.exist = function (value) {
            return !(value === null || value === '' || value === undefined);
        };

        if(vm.exist(vm.course.startDate)) {
            vm.course.startDate = new Date(vm.course.startDate);
        }else vm.course.startDate = new Date();

        if(vm.exist(vm.course.endDate)) {
            vm.course.endDate = new Date(vm.course.endDate);
        }else vm.course.endDate = new Date();

        if(vm.course._id) {
            vm.isCurrentUserOwner = course.isCurrentUserOwner;
        }
        // ToDO: Add 'loading...' gif to display in tabs
        function init() {
            if(vm.course._id) {
                vm.course.isCurrentUserOwner = vm.isCurrentUserOwner;

                if(vm.course.students.length) {
                    DataFactory.getData('courses', vm.course._id).then(
                        function (res) {
                            vm.courseStudents = res.students;
                            for (var i in vm.courseStudents) {
                                vm.courseStudents[i].statusUnchanged = true;
                            }
                            //console.log(vm.courseStudents);
                        },
                        function (err) {
                            vm.error = err;
                        }
                    );
                }
                if(vm.course.patients.length) {
                    DataFactory.getData('courses', vm.course._id).then(
                        function (res) {
                            vm.coursePatients = res.patients;
                            for (var i in vm.coursePatients) {
                                vm.coursePatients[i].statusUnchanged = true;
                            }
                            //console.log(vm.coursePatients);
                        },
                        function (err) {
                            vm.error = err;
                        }
                    );
                }
            }
        }

        // Get patients and subscribers --------------------------------------------------------------------------------
        if(vm.exist(vm.course.request)) {
            vm.subscribers = vm.course.request.subscribers;
        }

        vm.getPatients = function () {
            var data = 'patients';

            DataFactory.getListPromise(data).then(
                function(patients) {
                    vm.patients = patients.data;
                },
                function(error) {
                    vm.error = 'Failed to retrieve Patient Data. Make sure you create some first'; //+error.message
                }
            );
        };
        vm.getPatients();

        // ---- Open Dialog --------------------------------------------------------------------------------------------
        vm.openSubscribersDialog = function() {
            var subscribers = vm.getAddableSubscribers(vm.subscribers);

            $mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: 'modules/requests/client/views/dialogs/subs-table.client.template.html',
                controller: function ($scope, $mdDialog, subscribers) {
                    $scope.subscribers = subscribers;

                    $scope.ok = function () {
                        vm.addStudents(subscribers);
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

        vm.openPatientsDialog = function() {
            //vm.getPatients();
            var patients = vm.getAddablePatients(vm.patients);

            $mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: 'modules/patients/client/views/dialogs/patients-table.client.dialog.html',
                controller: function ($scope, $mdDialog, patients) {
                    $scope.patients = patients;

                    $scope.ok = function () {
                        vm.addPatients(patients);
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                },
                locals: {
                    patients: patients
                },
                parent: angular.element(document.body)
            });
        };

        // If already course student/patient mark isReadOnly--------------------------------------------------------
        vm.getAddableSubscribers = function (subscribers) {
            var tempSubs = [];

            angular.forEach(subscribers, function(subscriber) {
                if(vm.contains(vm.courseStudents, subscriber._id)) {
                    subscriber.isReadOnly = true;
                }else { subscriber.isReadOnly = false; }
                tempSubs.push(subscriber);
            });
            return tempSubs;
        };

        vm.getAddablePatients = function (patients) {
            var tempPats = [];

            angular.forEach(patients, function(patient) {
                if(vm.containsPatient(vm.coursePatients, patient._id)) {
                    patient.isReadOnly = true;
                }else { patient.isReadOnly = false; }
                tempPats.push(patient);
            });
            return tempPats;
        };
        // nested populate
        vm.contains = function (array, item) {
            for(var i=0; i<array.length; i++) {
                if(array[i]._id._id === item) {
                    return true;
                }
            }
            return false;
        };
        vm.containsPatient = function (array, item) {
            for(var i=0; i<array.length; i++) {
                if(array[i]._id === item) {
                    return true;
                }
            }
            return false;
        };

        // --- ADD -----------------------------------------------------------------------------------------------------
        vm.addStudents = function (subscribers) {
            angular.forEach(subscribers, function(subscriber) {
                if(subscriber.selected) {
                    var student = {}; student._id = subscriber._id; student.status = 'Pending';
                    vm.course.students.push(student);
                }
            });
            vm.update('Student Added');
        };
        vm.addPatients = function (patients) {
            angular.forEach(patients, function(nPatient) {
                if(nPatient.selected) {
                    var patient = {}; patient._id = nPatient._id; //patient.status = true;
                    vm.course.patients.push(patient);
                }
            });
            vm.update('Patient Added');
        };
        // --- REMOVE --------------------------------------------------------------------------------------------------
        vm.removeStudent = function (index) {
            vm.course.students.splice(index, 1);
            vm.courseStudents.splice(index, 1);
            vm.update('Student removed');
        };
        vm.removePatient = function (index) {
            vm.course.patients.splice(index, 1);
            vm.coursePatients.splice(index, 1);
            vm.update('Patient removed');
        };
        // --- UPDATE --------------------------------------------------------------------------------------------------
        vm.updateStudentStatus = function (student, index) {
            vm.course.students[index] = student;
            vm.update('Student status updated');
        };

        vm.update = function(action) {
            vm.course.$update(function(res){
                toastService.simpleToast(action);
                init();
            }, function(err) {
                toastService.simpleToast('Oops, something went wrong.');
            });
        };

        // Generate Request ---------------------------------------------------------------------------------------
        vm.createRequest = function() {
            if(!vm.exist(vm.course.request)) {
                var requestData = {
                    for_id: vm.course._id,
                    type: 'Course',
                    user: vm.authentication.user._id
                };
                generateRequest.courseRequest(requestData).then(
                    function (request) {
                        //console.log(request.data.request_id); <-- worried this will be undefined sometimes
                        vm.course.request = request.data.request;
                        toastService.simpleToast('Join ID successfully generated!');
                    },
                    function (error) {
                        vm.error = 'Failed to generate course join ID. '; //+error.message
                    }
                );
            }
        };

        // Remove existing Course ---------------------------------------------------------------------------------
        function remove() {
            if (confirm('Are you sure you want to delete?')) {
                vm.course.$remove($state.go('courses.list'));
            }
        }

        // Save Course --------------------------------------------------------------------------------------------
        function save(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.form.courseForm');
                return false;
            }

            // TODO: move create/update logic to service
            if (vm.course._id) {
                vm.course.$update(successCallback, errorCallback);
            } else {
                vm.course.$save(successCallback, errorCallback);
            }

            function successCallback(res) {
                $state.go('courses.view', {
                    courseId: res._id
                });
            }

            function errorCallback(res) {
                vm.error = res.data.message;
            }
        }
        init(); // Placement of this matters
    }
})();

