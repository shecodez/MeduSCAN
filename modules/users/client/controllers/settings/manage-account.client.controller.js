/**
 * Created by Nicole J. Nobles on 6/1/2016.
 */

(function () {
    'use strict';

    angular
        .module('users')
        .controller('ManageAccountController', ManageAccountController);

    ManageAccountController.$inject = ['$scope', 'Authentication', 'DataFactory', 'subscribeRequest', 'toastService'];

    function ManageAccountController($scope, Authentication, DataFactory, subscribeRequest, toastService) {
        var vm = this;
        vm.authentication = Authentication;
        vm.requests = [];
        vm.institutions = [];
        vm.courses = [];

        function init() {
            if(vm.authentication.user.requests.length) {
                vm.getRequestData();
                if(vm.authentication.user.institutions.length) {
                    vm.getInstitutionsData();
                }
                if(vm.authentication.user.courses.length) {
                    vm.getCoursesData();
                }
            }
        }

        //console.log(vm.authentication.user);

        vm.getRequestData = function () {
            angular.forEach(vm.authentication.user.requests, function (request) {
                vm.data = {};
                DataFactory.getData('requests', request).then(
                    function(res) {
                        //console.log(res);
                        vm.data.for_id = res.for_id;
                        vm.data.type = res.type;
                        vm.data.user = res.user.displayName;
                        if(res.type === 'Institution') {
                            DataFactory.getData(res.type + 's', res.for_id).then(
                                function (res) {
                                    vm.data.name = res.name;
                                    var index = vm.currentUserIndex(res.teachers);
                                    if (index >= 0) {
                                        vm.data.stat = res.teachers[index].status;
                                    } else {
                                        vm.data.stat = 'N/A';
                                    }
                                    //console.log(vm.data);
                                    vm.requests.push(vm.data);
                                }, function (err) {
                                }
                            );
                        }
                        else if(res.type === 'Course') {
                            DataFactory.getData(res.type + 's', res.for_id).then(
                                function (res) {
                                    vm.data.name = res.name;
                                    var index = vm.currentUserIndex(res.students);
                                    if (index >= 0) {
                                        vm.data.stat = res.students[index].status;
                                    } else {
                                        vm.data.stat = 'N/A';
                                    }
                                    //console.log(vm.data);
                                    vm.requests.push(vm.data);
                                }, function (err) {
                                }
                            );
                        }
                    }, function(err){}
                );
            });
        };

        vm.getInstitutionsData = function () {
            angular.forEach(vm.authentication.user.institutions, function (request) {
                vm.data = {};
                DataFactory.getData('institutions', request).then(
                    function(res) {
                        //console.log(res);
                        vm.data._id = res._id;
                        vm.data.active = res.active;
                        vm.data.name = res.name;
                        vm.data.key = 'Beta Tester';
                        vm.institutions.push(vm.data);
                    }, function(err) {}
                );
            });
        };

        vm.getCoursesData = function () {
            angular.forEach(vm.authentication.user.courses, function (request) {
                vm.data = {};
                DataFactory.getData('courses', request).then(
                    function(res) {
                        //console.log(res);
                        vm.data._id = res._id;
                        vm.data.active = res.active;
                        vm.data.startDate = res.startDate;
                        vm.data.endDate = res.endDate;
                        vm.data.teacher = res.user.displayName;
                        vm.data.name = res.name;
                        vm.data.key = 'Beta Tester';
                        vm.courses.push(vm.data);
                    }, function(err) {}
                );
            });
        };

        vm.currentUserIndex = function (array) {

            var id = vm.authentication.user._id;

            for(var i =0; i <array.length; i++){
                if(array[i]._id._id === id) {
                    return i;
                }
            }
            return -1;
        };

        vm.addedToMe = function (type, id){
            if(type === 'Institution') {
                var institutions = vm.authentication.user.institutions;
                return vm.contains(institutions, id);
            }
            else if (type === 'Course') {
                var courses = vm.authentication.user.courses;
                return vm.contains(courses, id);
            }
            //return false;
        };

        vm.contains = function (array, item) {
            for(var i=0; i<array.length; i++) {
                if(array[i] === item) {
                    return true;
                }
            }
            return false;
        };

        vm.addToMe = function (type, id) {
            if(type === 'Institution') {
                subscribeRequest.addInstitutionToUser(vm.authentication.user, id).then(
                    function (res) {
                        //console.log(res);
                        toastService.simpleToast(type+ ' Added.');
                        vm.getInstitutionsData();
                    },
                    function (err) {
                        toastService.simpleToast('Error adding '+type+'.');
                    }
                );
            }
            else if(type === 'Course') {
                subscribeRequest.addCourseToUser(vm.authentication.user, id).then(
                    function (res) {
                        //console.log(res);
                        toastService.simpleToast(type+ ' Added.');
                        vm.getCoursesData();
                    },
                    function (err) {
                        toastService.simpleToast('Error adding '+type+'.');
                    }
                );
            }
        };

        init(); // Placement of this matters
    }
})();
