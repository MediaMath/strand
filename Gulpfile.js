'use strict';
/*jslint node: true */

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var path = require('path');
var vulcanize = require('gulp-vulcanize');
var hogan = require('gulp-hogan');
var debug = require('gulp-debug');
var run = require('run-sequence');
var htmlmin = require('gulp-minify-html');

var SRC = 'src/';
var BUILD = 'build/';
var DOCS = 'build_docs/';
var DIST = 'dist/';
var TEMPLATES = 'grunt/templates/'; //TODO swap to gulp

gulp.task('clean', function() {
	return del(BUILD, DOCS, DIST, SRC + 'mm-*/*.+(css|min.js)');
});

gulp.task('copy', function() {
	return gulp.src(['**/*.+(html|js|woff)', '!**/example.html'], {base:SRC})
		.pipe(gulp.dest(BUILD));
});


gulp.task('sass', function() {
	return gulp.src(SRC + 'mm-*/*.scss')
		.pipe(sass({includePaths: ['./bower_components/bourbon/app/assets/stylesheets/', './src/shared/sass/']}).on('error', sass.logError))
		.pipe(gulp.dest(BUILD));
});

gulp.task('fontcss', function() {
	return gulp.src(SRC + 'shared/fonts/fonts.scss')
		.pipe(sass({includePaths: ['./bower_components/bourbon/app/assets/stylesheets/', './src/shared/sass/']}).on('error', sass.logError))
		.pipe(gulp.dest(BUILD + 'shared/fonts/'));
});

gulp.task('fontinclude', function() {

	var font=fs.readFileSync(BUILD + 'shared/fonts/fonts.css', 'utf8');
	return gulp.src(TEMPLATES + 'font_template.html')
		.pipe(debug())
		.pipe(hogan({style:font}, {}, '.html'))
		.pipe(rename("fonts.html"))
		.pipe(debug())
		.pipe(gulp.dest(BUILD + '/shared/fonts/'));
	
});

gulp.task('vulcanize', function() {
	return gulp.src(BUILD + "mm-*/mm-*.html")
		.pipe(vulcanize({
				inlineScripts:true,
				inlineCss:true,
				stripExcludes:false
		}))
		.pipe(gulp.dest(BUILD));
});


gulp.task('vulcanize:prod', function() {
	return gulp.src(BUILD + "mm-*/mm-*.html")
		.pipe(vulcanize({
				inlineScripts:true,
				inlineCss:true,
				stripExcludes:false
		}))
		.pipe(htmlmin({
			quotes: true,
			empty: true,
			spare: true
		}))
		.pipe(gulp.dest(BUILD));
});
 
//gulp.task('sass:watch', function () {
//  gulp.watch('./sass/**/*.scss', ['sass']);
//});