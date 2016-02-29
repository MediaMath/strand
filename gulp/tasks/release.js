(function() {
	'use strict';

	//node packages
	var fs = require('fs');
	var path = require('path');
	var j = path.join;
	var glob = require('glob');
	var del = require('del');
	var autoprefixer = require('autoprefixer');
	var hogan = require('hogan.js');
	var serveStatic = require('serve-static');
	var connect = require('connect');
	var Vulcanize = require('vulcanize');
	var minimist = require('minimist');

	//stream/gulp related
	var merge = require('merge-stream');
	var es = require('event-stream');
	var gulp = require('gulp');
	var through = require('through2');
	var run = require('run-sequence');

	module.exports = function(gulp, plugins, C) {

		var IS_DEBUG = !!plugins.gutil.env.debug;

		function dbg(t) {
			return plugins.gif(IS_DEBUG, plugins.debug({title:t}));
		}

		function inc(version) {
			if(!version) version = 'patch';
			return gulp.src(['package.json', 'bower.json'])
			   .pipe(plugins.bump({type: version}))
			   .pipe(gulp.dest(__dirname));
		}

		gulp.task('release', function() {
			var argv = minimist(process.argv.slice(3)),
				version = argv.v || argv.version,
				valid = ['major', 'minor', 'patch'];

			if(valid.indexOf(version) > -1) {
				run(inc(version), 'build:prod', 'changelog', 'stage-release', 'tag-release');
			}
		});

		gulp.task('release:major', function() {
			run(inc('major'), 'build:prod', 'changelog', 'stage-release', 'tag-release');
		});
		gulp.task('release:minor', function() {
			run(inc('minor'), 'build:prod', 'changelog', 'stage-release', 'tag-release');
		});
		gulp.task('release:patch', function() {
			run(inc('patch'), 'build:prod', 'changelog', 'stage-release', 'tag-release');
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
				.pipe(dbg('changelog'))
				.pipe(gulp.dest('.'));
		});

		function getPkgInfo() {
			return JSON.parse(fs.readFileSync('package.json', 'utf8'));
		}

		gulp.task('stage-release', function() {
			var pkg = getPkgInfo();
			return gulp.src([C.DIST, 'package.json', 'bower.json', 'CHANGELOG.md'])
				.pipe(plugins.git.add())
				.pipe(plugins.git.commit('Release v'+pkg.version));
		});

		gulp.task('tag-release', function() {
			var pkg = getPkgInfo();
			plugins.git.tag('v'+pkg.version, 'Version '+pkg.version, function(err) {
				console.log(err);
			});
		});

	};
})();
