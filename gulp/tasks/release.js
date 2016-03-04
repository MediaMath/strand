(function() {
	'use strict';

	//stream/gulp related
	var merge = require('merge-stream');
	var es = require('event-stream');
	var gulp = require('gulp');
	var run = require('run-sequence');

	module.exports = function(gulp, plugins, C) {

		function inc(version) {
			if(!version) version = 'patch';
			return gulp.src(['package.json', 'bower.json'])
			   .pipe(plugins.bump({type: version}))
			   .pipe(gulp.dest(C.ROOT));
		}

		gulp.task('bump:major', function() { return inc('major'); });
		gulp.task('bump:minor', function() { return inc('minor'); });
		gulp.task('bump:patch', function() { return inc('patch'); });

		gulp.task('release:major', function() {
			run('bump:major', 'build:prod', 'changelog', 'stage-release', 'tag-release');
		});
		gulp.task('release:minor', function() {
			run('bump:minor', 'build:prod', 'changelog', 'stage-release', 'tag-release');
		});
		gulp.task('release:patch', function() {
			run('bump:patch', 'build:prod', 'changelog', 'stage-release', 'tag-release');
		});

		gulp.task('changelog', function() {
			return gulp.src('CHANGELOG.md')
				.pipe(plugins.conventionalChangelog({
					pkg: {
						transform: function(pkg) {
							pkg.version = 'v'+pkg.version;
							return pkg;
						}
					}
				}))
				.pipe(C.dbg('changelog'))
				.pipe(gulp.dest('.'));
		});

		gulp.task('stage-release', function() {
			var pkg = C.getPkgInfo();
			return gulp.src([C.DIST, 'package.json', 'bower.json', 'CHANGELOG.md'])
				.pipe(plugins.git.add())
				.pipe(plugins.git.commit('Release v'+pkg.version));
		});

		gulp.task('tag-release', function() {
			var pkg = C.getPkgInfo();
			plugins.git.tag('v'+pkg.version, 'Version '+pkg.version, function(err) {
				console.log(err);
			});
		});

	};
})();
