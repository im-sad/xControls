'use strict';

// Плагины
const gulp         = require('gulp'),
    prefixer     = require('gulp-autoprefixer'),
    //gutil        = require('gulp-util'),
    plumber      = require('gulp-plumber'),
    notify       = require('gulp-notify'),
    runSequence  = require('run-sequence'),
    del          = require('del'),
    fs           = require('fs'),
    rename       = require("gulp-rename"),
    useref       = require('gulp-useref'),
    watch        = require('gulp-watch'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    cleanCSS     = require('gulp-clean-css'),
    csscomb      = require('gulp-csscomb'),
    browserSync  = require('browser-sync'),
    reload       = browserSync.reload;


// Настройки путей
const path = {
	build: { // Релиз
			html: 'build/',
			css: 'build/css/',
			style: ['build/css/*.css', '!build/css/*.min.css']
	},
	src: {
			html: 'src/*.html',
			style: 'src/style/*.scss'
	},
	watch: { // Изменяющиеся
			html: 'src/**/*.html',
			js: 'src/js/**/*.js',
			style: 'src/style/**/*.scss'
	},
	clean: 'build'
};

const config = {
  server: {
    baseDir: "./build"
  },
  tunnel: false,
  notify: false,
  host: 'localhost',
  port: 9000,
  logPrefix: "Frontend"
};


// Запуск BrowserSync
gulp.task('webserver', function () {
  browserSync(config);
});

// Очищаем папки
gulp.task('clean', function () {
  del.sync(path.clean);
});

// Собираем HTML
gulp.task('html:build', function () {
	gulp.src(path.src.html)
		.pipe(useref())
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({stream: true}));
});

// Собираем CSS
gulp.task('css:build', function () {
	return gulp.src(path.src.style)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(prefixer({ browsers: ['last 5 versions', '> 2%', 'ie 8'] }))
		.pipe(csscomb())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}));
});
// Сжатие
gulp.task('css:min', function () {
	return gulp.src(path.build.style)
		.pipe(plumber())
		.pipe(cleanCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}));
});

// Всё вместе
gulp.task('css', function(cb) {
  runSequence('css:build', 'css:min', cb);
});





// Все задачи в массиве
gulp.task('build', [
  'clean',
  'html:build',
  'css'
]);


// Следим за изменениями
gulp.task('watch', function(){
	watch([path.watch.html], function(event, cb) {
			gulp.start('html:build');
	});
	watch([path.watch.style], function(event, cb) {
			gulp.start('css');
	});
});


// Собираем файлы, запускаем веб-сервер, следим за изменениями
gulp.task('default', ['build', 'webserver', 'watch']);
