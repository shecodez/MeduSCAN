(function () {
  'use strict';

  angular
    .module('medications')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Medications',
      state: 'medications',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'medications', {
      title: 'List Medications',
      state: 'medications.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'medications', {
      title: 'Create Medication',
      state: 'medications.create',
      roles: ['user']
    });
  }
})();
