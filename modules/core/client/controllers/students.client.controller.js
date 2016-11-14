/**
 * Created by Nicole J. Nobles on 5/24/2016.
 */

'use strict';

angular.module('core').controller('StudentsController', ['$scope', 'Authentication',
    function($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.role = $scope.authentication.user.roles[0];

    }
]);
