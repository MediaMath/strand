(function() {
	'use strict';

	var fs = require('fs');
	var gif = require('gulp-if');
	var gutil = require('gulp-util');
	var debug = require('gulp-debug');

	var IS_DEBUG = !!gutil.env.debug;

	function dbg(t) {
		return gif(IS_DEBUG, debug({title:t}));
	}

	function getPkgInfo() {
		return JSON.parse(fs.readFileSync('package.json', 'utf8'));
	}

	module.exports = {
		ROOT: '.',
		SRC: 'src/',
		BUILD: 'build/',
		BUILD_DOCS: 'build_docs/',
		DOCS: 'docs/',
		DIST: 'dist/',
		TEMPLATES: 'gulp/templates/',
		MODULE_MASK: 'strand-*',
		MODULE_HTML: 'strand-*.html',
		MODULE_JS: 'strand-*.js',
		SHARED: 'shared/',
		BOWER: 'bower_components/',
		SASS_INCLUDE: ['bower_components/bourbon/app/assets/stylesheets/', 'src/shared/sass/'],
		LIVE_PORT: 8000,
		DOCS_PORT: 8001,
		PATCH_LIST: [
			'bower_components/moment/min/moment.min.js'
		],

		dbg: dbg,
		getPkgInfo: getPkgInfo
	};
})();
