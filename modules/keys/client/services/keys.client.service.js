//Keys service used to communicate Keys REST endpoints
(function () {
  'use strict';

  angular
    .module('keys')
    .factory('KeysService', KeysService);

  KeysService.$inject = ['$resource'];

  function KeysService($resource) {
    return $resource('api/keys/:keyId', {
      keyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
