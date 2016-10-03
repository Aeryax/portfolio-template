var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var fs = require('fs');
var browserSync = require('browser-sync').create();
var notifier = require('node-notifier');
var karma = require('karma').Server;
var webdriver = require('gulp-protractor').webdriver_update;

/**
* ================================================
* Public Tasks
* ================================================
**/

// gulp serve
gulp.task('serve', gulp.series(
  compileSass,
	gulp.parallel(autoreload, watch)
));

// gulp build
gulp.task('build', gulp.series(
	cleanDistFolder,
	compileSass,
	gulp.parallel(compileCssAndJs, minimizeImages, moveFonts, movePages, moveJson)
));

gulp.task('test-prod', gulp.series(
	testProd
));

// gulp clean
gulp.task('clean', gulp.parallel(
	cleanDistFolder
));

// gulp test-unit
gulp.task('test-unit', gulp.series(
	cleanKarma,
	runKarma,
	cleanKarma
));

// gulp e2e
gulp.task('test-e2e', gulp.series(
	gulp.parallel(cleanProtractor, updateProtractor, compileSass),
	runProtractor,
	cleanProtractor
));

// gulp doc-markdown
gulp.task('doc-markdown', gulp.series(

));

// gulp doc-html
gulp.task('doc-html', gulp.series(

));

// gulp release
gulp.task('release', gulp.series(
	cleanDistFolder,
	compileSass,
	gulp.parallel(compileCssAndJs, minimizeImages, moveFonts, movePages, moveJson),
	generateGithubPages
));

// gulp build-zip
gulp.task('build-zip', gulp.series(
  gulp.parallel(cleanDistFolder, cleanZip),
	compileSass,
	gulp.parallel(compileCssAndJs, minimizeImages, moveFonts, movePages, moveJson),
	zip
));

// gulp clean-zip
gulp.task('clean-zip', cleanZip);


/**
* ================================================
* Private Tasks
* ================================================
**/

function cleanDistFolder() {
	return del(['dist']);
}

function generateGithubPages() {
	return gulp.src('dist/**/*')
		.pipe(plugins.ghPages());
}

function moveFonts() {
	return gulp.src('src/assets/fonts/**/*')
		.pipe(plugins.size({
			title: 'Fonts'
		}))
		.pipe(gulp.dest('dist/assets/fonts'));
}

function movePages() {
	return gulp.src('src/assets/pages/**/*')
		.pipe(plugins.size({
			title: 'Pages'
		}))
		.pipe(gulp.dest('dist/assets/pages'));
}

function moveJson() {
	return gulp.src('src/*.json')
		.pipe(plugins.size({
			title: 'Json'
		}))
		.pipe(gulp.dest('dist/'));
}

function watch() {
	gulp.watch('src/assets/scss/*.{scss,sass}', compileSass);
	gulp.watch('src/**/*.html', browserSync.reload);
	gulp.watch('src/assets/js/**/*.js', browserSync.reload);
	gulp.watch('src/assets/css/**/*.css', browserSync.reload);
}

function compileSass() {
	return gulp.src('src/assets/scss/*.{scss,sass}')
			.pipe(plugins.cached('sass-cache'))
			// .pipe(plugins.sassLint())
			// .pipe(plugins.sassLint.format())
			//.pipe(plugins.sassLint.failOnError())
    	.pipe(plugins.sass())
    	.pipe(gulp.dest('src/assets/css'))
			.on('error', showError('Compile SASS'));
}

function compileCssAndJs() {
	return gulp.src('src/*.html')
    	.pipe(plugins.useref())
      // // js actions
			.pipe(plugins.if('*.js', plugins.stripComments()))
      .pipe(plugins.if('*.js', plugins.stripDebug()))
    	.pipe(plugins.if('*.js', plugins.uglify()))
			.pipe(plugins.if('*.js', plugins.rev()))
    	// // css actions
			// .pipe(plugins.if('*.css', plugins.uncss({
	    // 	html: ['src/index.html', 'src/assets/pages/*.html'],
			// 	uncssrc: '.uncssrc'
	    // })))
			.pipe(plugins.if('*.css', plugins.autoprefixer({
				browsers: ['last 2 versions'],
				cascade: false
			})))
    	.pipe(plugins.if('*.css', plugins.cssnano()))
			.pipe(plugins.if('*.css', plugins.rev()))
			// html actions
			.pipe(plugins.if('*.html', plugins.stripComments()))
			.pipe(plugins.if('*.html', plugins.htmlmin({
				collapseWhitespace: true
			})))
			.pipe(plugins.revReplace())
			.pipe(plugins.size({
				title: 'Assets'
			}))
    	.pipe(gulp.dest('dist'))
			.on('error', showError('Compile CSS and JS'));
}

function autoreload() {
	browserSync.init({
		server: {
			baseDir: 'src'
		},
	});
	showNotification('Autoreload', 'Your app is now live');
}

function minimizeImages() {
	return gulp.src('src/assets/img/**/*.+(png|PNG|jpg|JPG|gif|GIF|svg|SVG)')
		.pipe(plugins.cache(plugins.imagemin({
			interlaced: true
		})))
		.pipe(plugins.size({
			title: 'Images'
		}))
		.pipe(gulp.dest('dist/assets/img'));
}


function zip() {
	if (fs.existsSync(__dirname + '/dist')) {
		var name = require(__dirname + '/package.json').name;
		var version = require(__dirname + '/package.json').version;

		var buildDate = new Date();
		var yyyy = buildDate.getFullYear();
		var mm = buildDate.getMonth() < 9 ? '0' + (buildDate.getMonth() + 1) : (buildDate.getMonth() + 1);
		var dd  = buildDate.getDate() < 10 ? '0' + buildDate.getDate() : buildDate.getDate();
		var hh = buildDate.getHours() < 10 ? '0' + buildDate.getHours() : buildDate.getHours();
		var min = buildDate.getMinutes() < 10 ? '0' + buildDate.getMinutes() : buildDate.getMinutes();
		var ss = buildDate.getSeconds() < 10 ? '0' + buildDate.getSeconds() : buildDate.getSeconds();

		return gulp.src('dist/**/*')
			.pipe(plugins.zip(name + '-' + version + '-' + yyyy + mm + dd + '-' + hh + min + ss + '.zip'))
			.pipe(plugins.size({
				title: 'ZIP'
			}))
			.pipe(gulp.dest('.'));

	} else {
		throw new plugins.util.PluginError({
			plugin: 'archive',
			message: 'build directory is empty, you should start gulp build'
		});
	}

}

function cleanZip() {
	var name = require(__dirname + '/package.json').name;
	return del([name + '-*' + '.zip']);
}

function cleanKarma() {
	return del(['.karma']);
}

function runKarma(done) {
	return new karma({
	    configFile: __dirname + '/karma.conf.js',
	    singleRun: true
	}, done).start();
}

function cleanProtractor() {
	return del(['.protractor', 'phantomjsdriver.log']);
}

function testProd() {
	return gulp.src('dist')
	 .pipe(plugins.webserver({
		 livereload: false,
		 directoryListing: false,
		 open: false,
		 port: 3000
	 }));
}

function runProtractor() {

	var server = gulp.src('src')
	 .pipe(plugins.webserver({
		 livereload: false,
		 directoryListing: false,
		 open: false,
		 port: 3000
	 }));

	gulp.src('test/e2e/**/*.e2e.js')
		.pipe(plugins.protractor.protractor({
			configFile: __dirname + '/protractor.conf.js'
		}))
		.on('error', showError('runProtractor'));

	return server.emit('kill');
}

function updateProtractor(done) {
	webdriver({}, done);
}


/**
* ================================================
* Helpers
* ================================================
**/

var showError = function(task) {
	return function(err) {
		plugins.util.log(plugins.util.colors.bgRed(task + ' error:'), plugins.util.colors.red(err));
		showNotification(task, err);
	};
};

var showSuccess = function(task) {
	return function() {
		plugins.util.log(plugins.util.colors.bgGreen(task + ' :'), plugins.util.colors.green('success'));
		showNotification(task, 'Done successfully');
	};
};

var showNotification = function(title, message) {
	notifier.notify({
	  title: title,
	  message: message,
	  // icon: path.join(__dirname, 'coulson.jpg'),
	  sound: true,
	  wait: false
	}, function (err, response) {
	  // Response is response from notification
	});
};
