(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$window'];

  function HomeController($window) {
    var vm = this;

    // GridList (Tiles)
    this.tiles = buildGridModel({
      icon: '',
      title: '',
      href: '',
      background: ''
    });

    function buildGridModel(tileTmpl) {
      var it = [];
      var results = [];
      var icons = ['fa-group', 'fa-heartbeat', 'fa-university', 'fa-graduation-cap', 'fa-newspaper-o', 'fa-tv', 'fa-send-o'];
      var titles = ['About Us', 'Getting Started', 'Teachers', 'Students', 'Blog', 'Tutorials', 'Contact Us'];
      var links = ['about', 'getting_started', 'teachers', 'students', 'blogs.list', 'tutorials.list', 'contact'];

      for (var i = 0; i < 7; i++) {
        it = angular.extend({}, tileTmpl);
        it.icon = it.icon + icons[i];
        it.title = it.title + titles[i];
        it.href = it.href + links[i];
        it.span = { row: 1, col: 1 };
        switch (i + 1) {
          case 1:
            it.background = 'gold-bg';
            it.span.col = 2;
            break;
          case 2:
            it.background = 'primary-bg';
            it.span.row = it.span.col = 2;
            break;
          case 3:
            it.background = 'lime-bg';
            break;
          case 4:
            it.background = 'blue-bg';
            break;
          case 5:
            it.background = 'aqua-bg';
            break;
          case 6:
            it.background = 'mint-bg';
            break;
          case 7:
            it.background = 'pink-bg';
            it.span.col = 2;
            break;
        }
        results.push(it);
      }
      return results;
    }

    vm.news = {};
    vm.news.text = 'Welcome to the MeduSCAN Beta Test!';
    vm.news.author = '@MeduSCAN';
    vm.news.date = $window.moment('20160628', 'YYYYMMDD').fromNow();
  }
}());
