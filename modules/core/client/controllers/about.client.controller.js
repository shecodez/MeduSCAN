/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('AboutController', AboutController);

  // AboutController.$inject = [];

  function AboutController() {
    var vm = this;

    vm.testimonials = [
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
}());
