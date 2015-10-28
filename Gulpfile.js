'use strict';
/*jslint node: true */

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var path = require('path');
var vulcanize = require('gulp-vulcanize');
var debug = require('gulp-debug');
var run = require('run-sequence');
var htmlmin = require('gulp-minify-html');
var wrap = require('gulp-wrap');
var inlineAssets = require('gulp-inline-assets');

var SRC = 'src/';
var BUILD = 'build/';
var DOCS = 'build_docs/';
var DIST = 'dist/';
var TEMPLATES = 'grunt/templates/'; //TODO swap to gulp

gulp.task('clean', function() {
	return del(BUILD, DOCS, DIST, SRC + 'mm-*/*.+(css|min.js)');
});

gulp.task('copy', function() {
	return gulp.src(['**/*.+(html|js|woff)', '!**/example.html'], {base:SRC,buffer:true})
		.pipe(gulp.dest(BUILD));
});

gulp.task('sass', function() {
	return gulp.src(SRC + 'mm-*/*.scss')
		.pipe(sass({includePaths: ['./bower_components/bourbon/app/assets/stylesheets/', './src/shared/sass/']}).on('error', sass.logError))
		.pipe(gulp.dest(BUILD))
		.pipe(wrap({src:TEMPLATES + "style_module_template.html"},{},{engine:"hogan"}))
		.pipe(rename({basename:"style", extname: ".html"}))
		.pipe(gulp.dest(BUILD));
});

gulp.task('font', function() {
	return gulp.src(SRC + 'shared/fonts/fonts.scss')
		.pipe(sass({includePaths: ['./bower_components/bourbon/app/assets/stylesheets/', './src/shared/sass/']}).on('error', sass.logError))
		.pipe(gulp.dest(BUILD + 'shared/fonts/'))
		.pipe(wrap("<style><%= contents %></style>"))
		.pipe(rename("fonts.html"))
		.pipe(gulp.dest(BUILD + '/shared/fonts/'));
});

gulp.task('vulcanize', function() {
	var modules = gulp.src(BUILD + "mm-*/mm-*.html")
		.pipe(vulcanize({
			inlineScripts:true,
			inlineCss:true,
			stripExcludes:false,
			excludes: {
				imports: ['.*\.html','polymer.html']
			}
		}))
		.pipe(gulp.dest(BUILD));
	var lib = gulp.src(BUILD + "strand.html")
		.pipe(vulcanize({
			inlineScripts:true,
			inlineCss:true,
			stripExcludes:false
		}));
	return merge(modules, lib);
});

gulp.task('default', function(cb) {
	run('clean','copy',['sass','font'],'vulcanize',cb);
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