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
            stopMovieOnBlur: true
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

      vm.projects = [
        {
          name: 'P1',
          description: 'test'
        },
        {
          name: 'P2',
          description: 'test2'
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
