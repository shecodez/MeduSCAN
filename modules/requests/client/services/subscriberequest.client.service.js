(function () {
    'use strict';

    angular
        .module('requests')
        .factory('subscribeRequest', subscribeRequest);

    subscribeRequest.$inject = ['$http', 'RequestsService', 'Users'];

    function subscribeRequest($http, RequestsService, Users) {
        // SubscribeRequest service logic

        /**
         * Get the request by id
         * @param id
         * @returns {HttpPromise}
         */
        var getRequest = function (id) {
            return $http.get('/api/requests/'+id);
        };

        /**
         * Get what the request was made for
         * @param object
         * @returns {HttpPromise}
         */
        var getObjOfRequest = function (object) {
            return $http.get('/api/'+object.type+'s/'+object.id);
        };

        /**
         * Add subscriber to request
         * @param request
         * @param subscriber
         * @returns {request}
         */
        var subscribe = function (request, subscriber) {
            var subscriberRequest = new RequestsService(request);

            subscriberRequest.subscribers.push(subscriber);

            return subscriberRequest.$update(function(res) {
                // console.log(res);
            }, function(error) {
                // Error... Handle it!
            });
        };

        /**
         * Add request to user
         * @param user
         * @param request
         * @returns {user}
         */
        var addRequestToUser = function (user, request) {
            var requestUser = new Users(user);

            requestUser.requests.push(request._id);

            return requestUser.$update(function(res){
                // console.log(res);
            }, function(error) {
                // Error... Handle it!
            });
        };

        var addCourseToUser = function (user, courseId) {
            // Then request a key type.trial to add to institution
            var requestUser = new Users(user);

            requestUser.courses.push(courseId);

            return requestUser.$update(function(res){
                // console.log(res);
            }, function(error) {
                // Error... Handle it!
            });
        };

        var addInstitutionToUser = function (user, institutionId) {
            // Then request a key type.trial to add to course
            var requestUser = new Users(user);

            requestUser.institutions.push(institutionId);

            return requestUser.$update(function(res){
                // console.log(res);
            }, function(error) {
                // Error... Handle it!
            });
        };

        // Public API
        return {
            getRequest: getRequest,
            getObjOfRequest: getObjOfRequest,
            subscribe: subscribe,
            addRequestToUser: addRequestToUser,
            addCourseToUser: addCourseToUser,
            addInstitutionToUser: addInstitutionToUser
        };
    }
})();
