(function () {
    'use strict';

    angular
        .module('core')
        .factory('toastService', toastService);

    toastService.$inject = ['$mdToast'];

    function toastService($mdToast) {
        // ToastService service logic

        var last = {
            bottom: false,
            top: true,
            left: false,
            right: true
        };
        var toastPosition = angular.extend({},last);
        var getToastPosition = function() {
            sanitizePosition();
            return Object.keys( toastPosition)
                .filter(function(pos) { return  toastPosition[pos]; })
                .join(' ');
        };
        function sanitizePosition() {
            var current =  toastPosition;
            if ( current.bottom && last.top ) current.top = false;
            if ( current.top && last.bottom ) current.bottom = false;
            if ( current.right && last.left ) current.left = false;
            if ( current.left && last.right ) current.right = false;
            last = angular.extend({},current);
        }

        var simpleToast = function (message) {
            var pinTo =  getToastPosition();
            var toast = $mdToast.simple()
                .textContent(message)
                .action('X')
                .position(pinTo);

            $mdToast.show(toast).then(
                function (response) {
                    if (response === 'ok') { $mdToast.hide(); }
                }
            );
        };


        // Public API
        return {
            simpleToast : simpleToast
        };
    }
})();
