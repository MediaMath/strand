(function() {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var j = path.join;
	var glob = require('glob');
	var del = require('del');
	var autoprefixer = require('autoprefixer');
	var hogan = require('hogan.js');
	var Vulcanize = require('vulcanize');
	var cheerio = require('cheerio');
	var babel = require('babel-core');

	//stream/gulp related
	var merge = require('merge-stream');
	var es = require('event-stream');
	var gulp = require('gulp');
	var through = require('through2');
	var run = require('run-sequence');

	module.exports = function(gulp, plugins, C) {

		gulp.task('patch-lib', function() {

			gulp.src(C.PATCH_LIST, {base: C.BOWER})
				.pipe(C.dbg('patch-lib'))
				.pipe(plugins.wrap(function(data) {
					if (data.file.contents.toString('utf8').indexOf('/*patched*/') !== -1) {
						return "{{{contents}}}";
					} else {
						return "/*patched*/\n(function(define, require) { {{{contents}}} })();";
					}
				},{},{engine:'hogan'}).on('error',console.error))
				.pipe(gulp.dest(C.BOWER));
		});

		gulp.task('clean', function() {
			return del([j(C.BUILD,'**'), j(C.BUILD_DOCS,'**')]);
		});

		gulp.task('clean:dist', function() {
			return del([j(C.DIST,'**')]);
		});

		gulp.task('copy', function() {
			return gulp.src([j(C.SRC,'**/*.+(html|js|woff)'), j('!',C.SRC,'**/example.html')])
				.pipe(plugins.cache('copy'))
				.pipe(C.dbg('copy'))
				.pipe(gulp.dest(C.BUILD));
		});

		gulp.task('sass', function() {
			var wrapper = fs.readFileSync(j(C.TEMPLATES,"style_module_template.html"),'utf8');
			return gulp.src(j(C.SRC, C.MODULE_MASK,'*.scss'))
				.pipe(plugins.cache('scss'))
				.pipe(plugins.sass({includePaths: C.SASS_INCLUDE}).on('error', plugins.sass.logError))
				.pipe(plugins.postcss([autoprefixer({browsers: ['last 2 versions']})]))
				.pipe(C.dbg('sass'))
				.pipe(gulp.dest(C.BUILD))
				.pipe(plugins.wrap(function(data) {
					data.fname = path.basename(data.file.relative,'.css');
					return wrapper;
				},{},{engine:"hogan"}))
				.pipe(plugins.rename({basename:"style", extname: ".html"}))
				.pipe(C.dbg('sass-html'))
				.pipe(gulp.dest(C.BUILD));
		});

		gulp.task('font', function() {
			return gulp.src(j(C.SRC, C.SHARED, '/fonts/fonts.scss'))
				.pipe(plugins.sass({includePaths: C.SASS_INCLUDE}).on('error', plugins.sass.logError))
				.pipe(C.dbg('font'))
				.pipe(gulp.dest(C.BUILD + 'shared/fonts/'))
				.pipe(plugins.wrap("<style>{{{contents}}}</style>",{},{engine:"hogan"}).on('error',console.log))
				.pipe(plugins.rename("fonts.html").on('error',console.log))
				.pipe(C.dbg('font-output'))
				.pipe(gulp.dest(j(C.BUILD,'/shared/fonts/')));
		});

		function vulcanizeSingle(opts, baseList, basePath) {
			opts = opts || {};

		    return through.obj(function (file, enc, cb) {
				if (file.isNull()) {
				        cb(null, file);
				        return;
				}

				if (file.isStream()) {
				        cb(new plugins.gutil.PluginError('gulp-vulcanize', 'Streaming not supported'));
				        return;
				}

				var bl = baseList.slice() || [];
				var idx = bl.indexOf(basePath + file.relative);
				bl.splice(idx, 1);
				opts.excludes = bl;

				(new Vulcanize(opts)).process(file.path, function (err, inlinedHtml) {
					if (err) {
						cb(new plugins.gutil.PluginError('gulp-vulcanize', err, {fileName: file.path}));
						return;
					}

					file.contents = new Buffer(inlinedHtml);
					cb(null, file);
				}.bind(this));
		    });
		}

		function inlineBabel(opts) {
			opts = opts || {};
			return through.obj(function (file, enc, cb) {
				var fileContent = file.contents.toString("utf8");
				var ch = cheerio.load(fileContent, {
					withStartIndices: true
				});
				ch('script').each(function(index, el) {
					var script = cheerio(this).text();
					var o = babel.transform(script, opts.babel || {
						presets:['babili']
					});
					cheerio(this).text(o.code);
				});
				file.contents = new Buffer(ch.html());
				cb(null, file);
			});
		}

		gulp.task('vulcanize', function() {
			var moduleGlob = j(C.BUILD,C.MODULE_MASK, C.MODULE_HTML);
		    var excludes = glob.sync(moduleGlob);
		    excludes.push(j(C.BOWER, '/polymer/polymer.html'));

		    var modules = gulp.src(moduleGlob)
		        .pipe(plugins.cache('v-modules'))
		        .pipe(vulcanizeSingle({
		            inlineScripts: true,
		            inlineCss: true,
					implicitStrip: false
		        }, excludes, C.BUILD))
		        .pipe(C.dbg('vulcanize-modules'))
		        .pipe(plugins.htmlmin())
		        .pipe(gulp.dest(C.BUILD));

			var lib = gulp.src(j(C.BUILD,"strand.html"))
				.pipe(plugins.vulcanize({
					inlineScripts: true,
					inlineCss: true
				}))
				.pipe(C.dbg('vulcanize-lib'))
				.pipe(gulp.dest(C.BUILD));
			return merge(modules, lib);
		});

		gulp.task('default', function(cb) {
			run('clean','copy',['sass','font'],'lib-version','vulcanize',cb);
		});

		gulp.task('build', function(cb) {
			run('copy',['sass','font'],'lib-version',cb);
		});

		gulp.task('debug', function() {
			run('clean','build:debug');
		});

		gulp.task('build:debug', function() {
			run('copy',['sass','font'],'lib-version','copy:debug');
		});

		gulp.task('copy:debug', function() {
			gulp.src(j(C.BUILD,'**/*'))
				.pipe(C.dbg('debug'))
				.pipe(gulp.dest(C.DIST));
		});

		gulp.task('build:dist', function(cb) {
			run('clean','clean:dist','patch-lib', 'copy',['sass','font'], 'lib-version','build:prod', cb);
		});

		gulp.task('lib-version', function() {
			var pkg = C.getPkgInfo();
			var templatePath = j(C.TEMPLATES, '/lib_version.html');
			var templateString = fs.readFileSync(templatePath, 'utf8');
			var template = hogan.compile(templateString);
			var index = template.render(pkg);
			fs.writeFileSync(j(C.BUILD,'version.html'), index);
		});

		gulp.task('build:prod', function() {
			var excludes = glob.sync(j(C.BUILD,C.MODULE_MASK, C.MODULE_HTML));
		    excludes.push('bower_components/polymer/polymer.html');

			var modules = gulp.src(j(C.BUILD,C.MODULE_MASK, C.MODULE_HTML))
				.pipe(vulcanizeSingle({
						inlineScripts: true,
						inlineCss: true,
						implicitStrip: false
				}, excludes, C.BUILD))
				.pipe(plugins.cssBase64())
				.pipe(plugins.htmlmin({
					quotes: true,
					empty: true,
					spare: true
				}))
				// .pipe(inlineBabel())
				.pipe(plugins.inlinemin())
				.pipe(plugins.header('<!--\n' + fs.readFileSync('BANNER.txt','utf8') + ' -->'))
				.pipe(C.dbg('vulcanize-modules'))
				.pipe(gulp.dest(C.DIST));

			var lib = gulp.src(j(C.BUILD,'strand.html'))
				.pipe(plugins.vulcanize({
					inlineScripts: true,
					inlineCss: true,
					stripExcludes: []
				}))
				.pipe(plugins.cssBase64())
				.pipe(plugins.htmlmin({
					quotes: true,
					empty: true,
					spare: true
				}))
				// .pipe(inlineBabel())
				.pipe(plugins.inlinemin())
				.pipe(plugins.header('<!--\n' + fs.readFileSync('BANNER.txt','utf8') + ' -->'))
				.pipe(C.dbg('vulcanize-lib'))
				.pipe(gulp.dest(C.DIST));

			return merge(modules, lib);
		});

	};
})();
