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
	var run = require('run-sequence');

	//stream/gulp related
	var merge = require('merge-stream');
	var es = require('event-stream');
	var gulp = require('gulp');
	var favicon = require('serve-favicon');

	module.exports = function(gulp, plugins, C) {

		gulp.task('watch', function () {
			var sassCallback = function(events, done) { run('sass', done); };
			plugins.watch(j(C.SRC, C.MODULE_MASK, '/*.scss'), plugins.batch(sassCallback));

			var copyCallback = function(events, done) { run('copy', done); };
			plugins.watch([
				j(C.SRC, C.MODULE_MASK, C.MODULE_HTML),
				j(C.SRC, C.MODULE_MASK, C.MODULE_JS),
				j(C.SRC, C.MODULE_MASK, 'index.html'),
				j(C.SRC, C.SHARED, '**')
			], plugins.batch(copyCallback));
		});

		gulp.task('debugwatch', function () {
			var debugCallback = function(events, done) { run('debug', done); };

			plugins.watch([
				j(C.SRC, C.MODULE_MASK, '/*.scss'),
				j(C.SRC, C.MODULE_MASK, C.MODULE_HTML),
				j(C.SRC, C.MODULE_MASK, C.MODULE_JS),
				j(C.SRC, C.MODULE_MASK, 'index.html'),
				j(C.SRC, C.SHARED, '**')
			], plugins.batch(debugCallback));
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
				//for /test/* routes
				.use('/build',serveStatic(C.BUILD))
				.use('/test', serveStatic('./test'))
				//end test routes
				.use(favicon('favicon.ico'))
				.listen(C.LIVE_PORT);

			gulp.src(__filename)
				.pipe(plugins.open({
					uri: 'http://localhost:'+C.LIVE_PORT
				}));
		});

		gulp.task('live', ['build', 'index', 'watch', 'server']);

		gulp.task('debug:live', ['debug', 'debugwatch']);

		gulp.task('watch:docs', function() {
			var docsCallback = function(events, done) { run('docs:templates', done); };

			plugins.watch([
				j(C.DOCS,'/**/*.md'),
				j(C.SRC,'**/example.html'),
				C.SRC + '**/doc.json'
			], plugins.batch(docsCallback));
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
