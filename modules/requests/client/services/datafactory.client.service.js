(function () {
    'use strict';

    angular
        .module('requests')
        .factory('DataFactory', DataFactory);

    DataFactory.$inject = ['$http'];

    function DataFactory($http) {
        // DataFactory service logic
        // ...

        var getData = function (data, id) {
            return $http.get('/api/' + data + '/' + id).then(
                function (response) {
                    return response.data;
                },
                function (error) {
                    // Error... handle it!
                }
            );
        };

        var getDataPromise = function (data, id) {
            return $http.get('/api/' + data + '/' + id);
        };

        var getList = function (data) {
            return $http.get('/api/' + data).then(
                function (response) {
                    return response.data;
                },
                function (error) {
                    // Error... handle it!
                }
            );
        };

        var getListPromise = function(data) {
          return $http.get('/api/'+ data);
        };


        //var setData = function (data, id) {};
        // var addData = function (data, id) {};
        //var cutData = function (data, id) {};

        // Public API
        return {
            getData: getData,
            getDataPromise: getDataPromise,
            getList: getList,
            getListPromise: getListPromise
        };
    }
})();
