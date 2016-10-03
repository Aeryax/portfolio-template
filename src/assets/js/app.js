(function(angular) {

  console.log('init angular');

  var app = angular.module('demoApp', ['ngRoute', 'ngResource', 'ngAnimate', 'uiGmapgoogle-maps', 'ngSanitize']);

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
        when('/project/:id', {
          templateUrl: 'assets/pages/project.html',
          controller: 'ProjectController',
          controllerAs: 'project'
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

    app.factory('PortfolioService', ['$resource', function($resource) {
      return $resource('portfolio.json', {}, {
        list: {method: 'GET', isArray: true}
      });
    }]);

    app.factory('CVService', ['$resource', function($resource) {
      return $resource('cv.json', {}, {
        list: {method: 'GET', isArray: false}
      });
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

    app.controller('PortfolioController', ['PortfolioService', function(PortfolioService) {
      var vm = this;

      /* ------------------
      Init
      ------------------ */
      console.log('Init portfolio');

      vm.index = 0;
      vm.filter = '';

      vm.projects = [];

      PortfolioService.list(function(data) {
        vm.projects = data;
      });

      vm.changeFilter = function(filter) {
        vm.filter = filter;
        vm.index = 0;
      };

      vm.newer = function(filteredLength) {
        if(filteredLength >= 8) {
          vm.index++;
        }

      };

      vm.older = function() {
        if(vm.index > 0) {
          vm.index--;
        }
      };

      // ---------------

    }]);

    app.controller('CvController', ['CVService', function(CVService) {
      var vm = this;

      /* ------------------
      Init
      ------------------ */
      console.log('Init cv');

      vm.infos = {};

      CVService.list(function(data) {
        vm.infos = data;
        setTimeout(function() {
          $('.progress .progress-bar').progressbar();
        }, 1500);
      });




      // ---------------

    }]);

    app.controller('ProjectController', ['PortfolioService', '$routeParams', '$location', function(PortfolioService, $routeParams, $location) {
      var vm = this;

      vm.name = '';
      vm.content = '';

      PortfolioService.list(function(data) {
        var projects = data.filter(function(item) {
          return item.id == $routeParams.id;
        });

        if(projects.length > 0) {
          vm.name = projects[0].name;
          vm.content = projects[0].content;
        }
        else {
          $location.path('/portfolio');
        }
      });


    }]);

    app.controller('ContactController', ['ConfigService', function(ConfigService) {
      var vm = this;

      /* ------------------
      Init
      ------------------ */
      console.log('Init contact');
      vm.map = { center: { latitude: ConfigService.config.latitude, longitude: ConfigService.config.longitude }, zoom: ConfigService.config.zoom };
      // ---------------

    }]);

})(angular);
