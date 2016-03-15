(function(angular) {

  console.log('init angular');

  var app = angular.module('demoApp', ['ngRoute', 'ngResource', 'ngAnimate', 'uiGmapgoogle-maps']);

  app.config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
        when('/home', {
          templateUrl: 'assets/pages/home.html',
          controller: 'HomeController',
          controllerAs: 'home'
        }).
        when('/cv', {
          templateUrl: 'assets/pages/cv.html',
          controller: 'CvController',
          controllerAs: 'cv'
        }).
        when('/portfolio', {
          templateUrl: 'assets/pages/portfolio.html',
          controller: 'PortfolioController',
          controllerAs: 'portfolio'
        }).
        when('/contact', {
          templateUrl: 'assets/pages/contact.html',
          controller: 'ContactController',
          controllerAs: 'contact'
        }).
        otherwise({
          redirectTo: '/home'
        });
    }]);

    app.factory('ConfigService', ['$resource', function($resource) {
      var observersCallback = [];

      var res = $resource('config.json', {}, {
        query: {method: 'GET', isArray: false}
      });

      var notify = function() {
        angular.forEach(observersCallback, function(cb) {
          cb();
        });
      };

      res.query(function(data) {
        obj.config = data;
        notify();
      });

      var obj = {
        registerCallback: function(cb) {
          observersCallback.push(cb);
        },
        unregisterCallback: function(cb) {
          observersCallback = observersCallback.filter(function(item) {
            return item !== cb;
          });
        },
        config: {}
      };

      return obj;
    }]);

    app.controller('MainController', ['$scope', 'ConfigService', function($scope, ConfigService) {

      var vm = this;

      vm.currentController = 'HomeController';

      $scope.$on('$routeChangeSuccess', function(event, current) {
        vm.currentController = current.$$route.controller;
      });

      // general infos
      var configCallback = function() {
        vm.config = ConfigService.config;
      };

      vm.config = ConfigService.config;

      ConfigService.registerCallback(configCallback);

      $scope.$destroy = function() {
        ConfigService.unregisterCallback(configCallback);
      };

    }]);

    app.controller('HomeController', ['$scope', 'ConfigService', function($scope, ConfigService) {
      var vm = this;

      /* ------------------
      Init
      ------------------ */
      console.log('Init Home');

      var pleaseWait = window.pleaseWait({
        logo: 'assets/img/logo.png',
        backgroundColor: '#FFF',
        loadingHtml: '<p class=\'loading-message\'>Chargement en cours...</p>'
      });

      vm.config = ConfigService;

      // general infos
      var configCallback = function() {
        configAction();
      };

      var configAction = function() {
        vm.config = ConfigService.config;

        jQuery(function($) {

          var videoPlayerProperties = {
            videoURL: vm.config.videoURL,
            containment:'#bgndVideo',
            autoPlay:true,
            mute:true,
            startAt:10,
            opacity:1,
            showControls: false,
            loop: true,
            gaTrack: false,
            stopMovieOnBlur: true,
            onReady: function(player) {
              pleaseWait.finish();
            }
          };

          $('.player').mb_YTPlayer(videoPlayerProperties);
          console.log('starting player');
        });
      };

      configAction();

      ConfigService.registerCallback(configCallback);

      $scope.$destroy = function() {
        ConfigService.unregisterCallback(configCallback);
      };

      // TODO
      // $scope.$destroy = function() {
      //   // looks like a bad idea
      //   $('#bgndVideo').remove();
      //   console.log('destroying player');
      // };

      // ---------------

    }]);

    app.controller('PortfolioController', [function() {
      var vm = this;

      /* ------------------
      Init
      ------------------ */
      console.log('Init portfolio');

      vm.index = 0;
      vm.filter = '';

      vm.projects = [
        {
          name: 'Projet 1',
          description: 'Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed blandit risus urna, vel mollis tellus tempor mollis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam quis turpis vel elit rhoncus vestibulum tincidunt id libero. ',
          tags: ['opensource', 'graphisme']
        },
        {
          name: 'Projet 2',
          description: 'Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed blandit risus urna, vel mollis tellus tempor mollis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam quis turpis vel elit rhoncus vestibulum tincidunt id libero. ',
          tags: ['graphisme', '3d']
        }
      ];

      // ---------------

    }]);

    app.controller('CvController', [function() {
      var vm = this;

      /* ------------------
      Init
      ------------------ */
      console.log('Init cv');
      setTimeout(function() {
        $('.progress .progress-bar').progressbar();
      }, 1500);


      // ---------------

    }]);

    app.controller('ContactController', [function() {
      var vm = this;


      /* ------------------
      Init
      ------------------ */
      console.log('Init contact');
      vm.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
      // ---------------

    }]);

})(angular);
