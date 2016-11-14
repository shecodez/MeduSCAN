(function () {
  'use strict';

  angular
    .module('core')
    .factory('mailingService', mailingService);

  mailingService.$inject = [/*Example: '$state', '$window' */];

  function mailingService(/*Example: $state, $window */) {
    // MailingService service logic
    // ...

    // Public API
    return {
      someMethod: function () {
        return true;
      }
    };
  }
})();
