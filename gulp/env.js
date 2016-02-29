(function() {
	'use strict';

	module.exports = {
		ROOT: '.',
		SRC: 'src/',
		BUILD: 'build/',
		BUILD_DOCS: 'build_docs/',
		DOCS: 'docs/',
		DIST: 'dist/',
		TEMPLATES: 'gulp/templates/',
		MODULE_MASK: 'mm-*',
		MODULE_HTML: 'mm-*.html',
		SHARED: 'shared/',
		BOWER: 'bower_components/',
		SASS_INCLUDE: ['bower_components/bourbon/app/assets/stylesheets/', 'src/shared/sass/'],
		LIVE_PORT: 8000,
		DOCS_PORT: 8001,
		PATCH_LIST: [
			'bower_components/moment/min/moment.min.js'
		]
	};
})();
