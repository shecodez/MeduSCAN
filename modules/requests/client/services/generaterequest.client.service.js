(function () {
    'use strict';

    angular
        .module('requests')
        .factory('generateRequest', generateRequest);

    generateRequest.$inject = ['$http', 'InstitutionsService'];

    function generateRequest($http, InstitutionsService) {
        // GenerateRequest service logic

        var courseRequest = function (request) {
            var generatedRequest = null;

            // Post new request and then post requestId to course
            return $http({
                method: 'POST',
                //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                url: '/api/requests',
                data: {
                    for_id: request.for_id,
                    type: request.type,
                    user: request.user
                }
            }).then(function(response) {
                generatedRequest = response.data;
                return $http({
                    method: 'PUT',
                    url: '/api/courses/'+request.for_id,
                    data: {
                        request : generatedRequest._id
                    }
                });
            });
        };

        /**
         * Post new request, then push new request to institution
         * @param request
         */
        var institutionRequest = function (request) {
            var generatedRequest = null;

            return $http({
                method: 'POST',
                //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                url: '/api/requests',
                data: {
                    for_id: request.for_id,
                    type:   request.type,
                    user:   request.user
                }
            }).then(function(response) {
                generatedRequest = response.data;
                return $http({
                    method: 'PUT',
                    url: '/api/institutions/'+request.for_id,
                    data: {
                        request : generatedRequest._id
                    }
                });
            });
        };

        // Public API
        return {
            courseRequest: courseRequest,
            institutionRequest: institutionRequest
        };
    }
})();
