'use strict';
/*jslint node: true */
/*jslint esversion: 6*/

var gulp = require('gulp');
var path = require('path');
var j = path.join;

//gulp plugins
var plugins = require('gulp-load-plugins')({
	camelize: true,
	lazy: true,
	rename: {
		'gulp-util': 'gutil',
		'gulp-if': 'gif',
		'gulp-minify-html': 'htmlmin',
		'gulp-minify-inline': 'inlinemin',
		'gulp-cached': 'cache'
	}
});

var C = require(j(__dirname, 'gulp/env.js'));

var build = require(j(__dirname, 'gulp/tasks/build.js'))(gulp, plugins, C);
var docs = require(j(__dirname, 'gulp/tasks/docs.js'))(gulp, plugins, C);
var live = require(j(__dirname, 'gulp/tasks/live.js'))(gulp, plugins, C);
var release = require(j(__dirname, 'gulp/tasks/release.js'))(gulp, plugins, C);
