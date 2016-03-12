module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    files: [
      'src/assets/components/angular/angular.js',
      'src/assets/components/angular-mocks/angular-mocks.js',
      'src/assets/js/**/*.js',
      'test/unit/**/*.spec.js'
    ],
    reporters: ['progress'],
    phantomjsLauncher: {
	     exitOnRessourceError: true
    }
  });
};
