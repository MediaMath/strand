(function() {
	'use strict';

	//node packages
	var fs = require('fs');
	var path = require('path');
	var j = path.join;
	var glob = require('glob');
	var hogan = require('hogan.js');
	var serveStatic = require('serve-static');
	var connect = require('connect');

	//stream/gulp related
	var merge = require('merge-stream');
	var es = require('event-stream');
	var gulp = require('gulp');
	var favicon = require('serve-favicon');

	module.exports = function(gulp, plugins, C) {

		gulp.task('watch', function () {
			gulp.watch(j(C.SRC, C.MODULE_MASK, '/*.scss'), ['sass']);
			gulp.watch(j(C.SRC, C.MODULE_MASK, C.MODULE_HTML), ['copy', 'vulcanize']);
			gulp.watch(j(C.SRC, C.MODULE_MASK, 'index.html'), ['copy']);
			gulp.watch(j(C.SRC, C.SHARED, '**'), ['copy']);
		});

		gulp.task('index', function() {
			var modules = glob.sync(j(C.MODULE_MASK,"/index.html"), {cwd:C.SRC});
			var moduleList = modules.map(function(name) { return name.replace('/index.html',''); });
			var moduleMap = {modules: moduleList};
			var templatePath = j(C.TEMPLATES, '/index_template.html');
			var templateString = fs.readFileSync(templatePath, 'utf8');
			var template = hogan.compile(templateString);
			var index = template.render(moduleMap);
			fs.writeFileSync(j(C.BUILD,'index.html'), index);
		});

		gulp.task('server', function() {
			var server = connect()
				.use('/bower_components', serveStatic(C.BOWER))
				.use(serveStatic(C.BUILD))
				.use(favicon('favicon.ico'))
				.listen(C.LIVE_PORT);

			gulp.src(__filename)
				.pipe(plugins.open({
					uri: 'http://localhost:'+C.LIVE_PORT
				}));
		});

		gulp.task('live', ['build', 'index', 'watch', 'server']);

		gulp.task('watch:docs', function() {
			gulp.watch([j(C.DOCS,'/**/*.md'), C.SRC + '**/doc.json'], ['docs:templates']);
		});

		gulp.task('server:docs', function() {
			var server = connect()
				.use(serveStatic(C.BUILD_DOCS))
				.listen(C.DOCS_PORT);

			gulp.src(__filename)
				.pipe(plugins.open({
					uri: 'http://localhost:'+C.DOCS_PORT
				}));
		});

		gulp.task('live:docs', ['watch:docs', 'server:docs']);

	};
})();
