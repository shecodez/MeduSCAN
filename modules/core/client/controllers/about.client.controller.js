/**
 * Created by Nicole J. Nobles on 5/22/2016.
 */

'use strict';

angular.module('core').controller('AboutController', ['$scope', 'Authentication',
    function($scope, Authentication, Page) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.testimonials = [
            {
                blockQuote: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et cupiditate deleniti ratione in. Expedita nemo, quisquam, fuga adipisci omnis ad mollitia libero culpa nostrum est quia eos esse vel!',
                name: 'FirstName LastName',
                company: 'GCSU Health Sciences'
            },
            {
                blockQuote: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et cupiditate deleniti ratione in. Expedita nemo, quisquam, fuga adipisci omnis ad mollitia libero culpa nostrum est quia eos esse vel!',
                name: 'FirstName LastName',
                company: 'company2'
            }
        ];

    }
]);
