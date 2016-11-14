(function () {
  'use strict';

  angular
    .module('patients')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Patients',
      state: 'patients',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'patients', {
      title: 'List Patients',
      state: 'patients.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'patients', {
      title: 'Create Patient',
      state: 'patients.create',
      roles: ['user']
    });
  }
})();
