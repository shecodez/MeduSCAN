/**
 * Created by Nicole J. Nobles on 6/30/2016.
 */

(function () {
  'use strict';

  angular
    .module('core')
    .controller('GettingStartedController', GettingStartedController);

  // GettingStartedController.$inject = [];

  function GettingStartedController() {
    var vm = this;

    this.tiles = buildGridModel({
      icon: '',
      title: '',
      href: '',
      background: ''
    });
    function buildGridModel(tileTmpl) {
      var it = [];
      var results = [];
      var icons = ['fa-university', 'fa-graduation-cap', 'fa-users', 'fa-thumbs-o-up'];
      var titles = ['Teachers', 'Students', 'Partners', 'Investors'];
      var links = ['teachers', 'students', 'contact', 'contact'];
      for (var i = 0; i < 4; i++) {
        it = angular.extend({}, tileTmpl);
        it.icon = it.icon + icons[i];
        it.title = it.title + titles[i];
        it.href = it.href + links[i];
        it.span = { row: 1, col: 1 };
        switch (i + 1) {
          case 1:
            it.background = 'lime-bg';
            break;
          case 2:
            it.background = 'blue-bg';
            break;
          case 3:
            it.background = 'gold-bg';
            break;
          case 4:
            it.background = 'pink-bg';
            break;
        }
        results.push(it);
      }
      return results;
    }
  }
}());
