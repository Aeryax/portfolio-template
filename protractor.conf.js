//require('reflect-metadata');

exports.config = {
	framework: 'jasmine',
	baseUrl: 'http://localhost:3000/',

	capabilities: {
		'browserName': 'phantomjs',
		'phantomjs.binary.path': require('phantomjs-prebuilt').path,
		'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
	},

	localSeleniumStandaloneOpts: {
		args: ['-Djna.nosys=true']
  },

	//directConnect: true,
	allScriptsTimeout: 110000,
	getPageTimeout: 100000,
	jasmineNodeOpts: {
		isVerbose: false,
		showColors: true,
		includeStackTrace: false,
		defaultTimeoutInterval: 400000
	}
};
