'use strict';
/*jslint node: true */
/*jslint esversion: 6*/
//TODO(shuwen): split into multiple files

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

//stream/gulp related
var merge = require('merge-stream');
var es = require('event-stream');
var gulp = require('gulp');
var through = require('through2');
var run = require('run-sequence');

//gulp plugins
var gutil = require('gulp-util');
var gif = require('gulp-if');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var vulcanize = require('gulp-vulcanize');
var debug = require('gulp-debug');
var htmlmin = require('gulp-minify-html');
var inlinemin = require('gulp-minify-inline');
var wrap = require('gulp-wrap');
var inlineAssets = require('gulp-inline-assets');
var marked = require('gulp-marked');
var cache = require('gulp-cached');
var postcss = require('gulp-postcss');
var git = require('gulp-git');
var bump = require('gulp-bump');
var tagVersion = require('gulp-tag-version');
var conventionalChangelog = require('gulp-conventional-changelog');
var ghPages = require('gulp-gh-pages');
var header = require('gulp-header');
var base64 = require('gulp-base64');
var minimist = require('minimist');
var open = require('gulp-open');

var C = {
	SRC:'src/',
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

var IS_DEBUG = !!gutil.env.debug;

function dbg(t) {
	return gif(IS_DEBUG, debug({title:t}));
}

/** BUILD **/

gulp.task('patch-lib', function() {

	gulp.src(C.PATCH_LIST, {base: j(__dirname, C.BOWER)})
		.pipe(dbg('patch-lib'))
		.pipe(wrap(function(data) {
			if (data.file.contents.toString('utf8').indexOf('/*patched*/') !== -1) {
				return "{{{contents}}}";
			} else {
				return "/*patched*/\n(function(define, require) { {{{contents}}} })();";
			}
		},{},{engine:'hogan'}).on('error',console.error))
		.pipe(gulp.dest( j(__dirname, C.BOWER) ));
});

gulp.task('clean', function() {
	return del([j(C.BUILD,'**'), j(C.BUILD_DOCS,'**')]);
});

gulp.task('clean:dist', function() {
	return del([j(C.DIST,'**')]);
});

gulp.task('copy', function() {
	return gulp.src([j(C.SRC,'**/*.+(html|js|woff)'), j('!',C.SRC,'**/example.html')])
		.pipe(cache('copy'))
		.pipe(dbg('copy'))
		.pipe(gulp.dest(C.BUILD));
});

gulp.task('sass', function() {
	var wrapper = fs.readFileSync(j(C.TEMPLATES,"style_module_template.html"),'utf8');
	return gulp.src(j(C.SRC, C.MODULE_MASK,'*.scss'))
		.pipe(cache('scss'))
		.pipe(sass({includePaths: C.SASS_INCLUDE}).on('error', sass.logError))
		.pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
		.pipe(dbg('sass'))
		.pipe(gulp.dest(C.BUILD))
		.pipe(wrap(function(data) {
			data.fname = path.basename(data.file.relative,'.css');
			return wrapper;
		},{},{engine:"hogan"}))
		.pipe(rename({basename:"style", extname: ".html"}))
		.pipe(dbg('sass-html'))
		.pipe(gulp.dest(C.BUILD));
});

gulp.task('font', function() {
	return gulp.src(j(C.SRC, C.SHARED, '/fonts/fonts.scss'))
		.pipe(sass({includePaths: C.SASS_INCLUDE}).on('error', sass.logError))
		.pipe(dbg('font'))
		.pipe(gulp.dest(C.BUILD + 'shared/fonts/'))
		.pipe(wrap("<style>{{{contents}}}</style>",{},{engine:"hogan"}).on('error',console.log))
		.pipe(rename("fonts.html").on('error',console.log))
		.pipe(dbg('font-output'))
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
		        cb(new gutil.PluginError('gulp-vulcanize', 'Streaming not supported'));
		        return;
		}

		var bl = baseList.slice() || [];
		var idx = bl.indexOf(basePath + file.relative);
		bl.splice(idx, 1);
		opts.excludes = bl;

		(new Vulcanize(opts)).process(file.path, function (err, inlinedHtml) {
			if (err) {
				cb(new gutil.PluginError('gulp-vulcanize', err, {fileName: file.path}));
				return;
			}

			file.contents = new Buffer(inlinedHtml);
			cb(null, file);
		}.bind(this));
    });
}

gulp.task('vulcanize', function() {
	var moduleGlob = j(C.BUILD,C.MODULE_MASK, C.MODULE_HTML); 
    var excludes = glob.sync(moduleGlob);
    excludes.push(j(C.BOWER, '/polymer/polymer.html'));

    var modules = gulp.src(moduleGlob)
        .pipe(cache('v-modules'))
        .pipe(vulcanizeSingle({
            inlineScripts: true,
            inlineCss: true,
			implicitStrip: false
        }, excludes, C.BUILD))
        .pipe(dbg('vulcanize-modules'))
        .pipe(htmlmin())
        .pipe(gulp.dest(C.BUILD));

	var lib = gulp.src(j(C.BUILD,"strand.html"))
		.pipe(vulcanize({
			inlineScripts: true,
			inlineCss: true
		}))
		.pipe(dbg('vulcanize-lib'))
		.pipe(gulp.dest(C.BUILD));
	return merge(modules, lib);
});

gulp.task('default', function(cb) {
	run('clean','copy',['sass','font'],'vulcanize',cb);
});

gulp.task('build', function(cb) {
	run('copy',['sass','font'],'vulcanize',cb);
});

gulp.task('build:dist', function(cb) {
	run('clean','patch-lib', 'copy',['sass','font'], 'build:prod', cb);
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
		.pipe(base64(['.woff']))
		.pipe(htmlmin({
			quotes: true,
			empty: true,
			spare: true
		}))
		.pipe(inlinemin())
		.pipe(header('<!--\n' + fs.readFileSync('BANNER.txt','utf8') + ' -->'))
		.pipe(dbg('vulcanize-modules'))
		.pipe(gulp.dest(C.DIST));

	var lib = gulp.src(j(C.BUILD,'strand.html'))
		.pipe(vulcanize({
			inlineScripts: true,
			inlineCss: true,
			stripExcludes: []
		}))
		.pipe(base64(['.woff']))
		.pipe(htmlmin({
			quotes: true,
			empty: true,
			spare: true
		}))
		.pipe(inlinemin())
		.pipe(header('<!--\n' + fs.readFileSync('BANNER.txt','utf8') + ' -->'))
		.pipe(dbg('vulcanize-lib'))
		.pipe(gulp.dest(C.DIST));

	return merge(modules, lib);
});

/** DOCS **/
gulp.task('docs', ['copy:docs', 'sass:docs', 'docs:templates']);

gulp.task('clean:docs', function() {
	return del([C.BUILD_DOCS+'**']);
});

gulp.task('copy:docs', function() {
	var assets = gulp.src(j(C.DOCS,'/images/**'),{base:C.DOCS});
	var cname = gulp.src('CNAME');
	var license = gulp.src('LICENSE.txt');

	var merged_static = merge(assets, cname, license)
		.pipe(gulp.dest(C.BUILD_DOCS));

	var bower_components = gulp.src([j(C.BOWER,'/webcomponentsjs/**/*'), j(C.BOWER,'/polymer/**/*')], {base:C.BOWER})
		.pipe(dbg('copy-bower'))
		.pipe(gulp.dest(j(C.BUILD_DOCS,C.BOWER)));

	var lib = gulp.src(j(C.BUILD,'**'))
		.pipe(dbg('copy-lib'))
		.pipe(gulp.dest(j(C.BUILD_DOCS,C.BOWER,'/strand/dist')));

	return merge(bower_components, merged_static, lib);
});

gulp.task('sass:docs', function() {
	return gulp.src(j(C.DOCS,'/**/*.scss'))
		.pipe(dbg('sass-docs'))
		.pipe(sass({includePaths: C.SASS_INCLUDE}).on('error', sass.logError))
		.pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
		.pipe(gulp.dest(C.BUILD_DOCS));
});

gulp.task('docs:templates', function() {
	function lookupArticle(list, key) {
		for(var i=0; i<list.length; i++) {
		 	if (list[i].key === key) {
		 		return list[i];
		 	}
		 }
		 return null;
	}

	function mergeDocArray(doc, behavior) {
		var p = {};
		if (!behavior) {
			return doc;
		}
		if (!doc && behavior) {
			return behavior;
		}
		behavior.forEach(function(obj) {
			if(obj.name) p[obj.name] = obj;
			else if(obj.type) p[obj.type] = obj;
		});
		doc.forEach(function(obj) {
			if(obj.name) p[obj.name] = obj;
			else if(obj.type) p[obj.type] = obj;
		});
		return Object.keys(p).map(function(key) {
			return p[key];
		});
	}

	// Ad-hoc plugin for injecting behaviors
	function injectBehaviorDocs(behaviorsMap) {
		return through.obj(function(file, enc, cb) {
			if(!file.isBuffer()) this.emit('error', new gutil.PluginError('Buffer required'));

			var moduleDoc = JSON.parse(file.contents),
				moduleBehaviors = moduleDoc.behaviors;

			// Merge behaviors docs with component docs
			moduleBehaviors.forEach(function(key) {
				var behavior = behaviorsMap[key];
				if(moduleDoc && behavior) {
					moduleDoc.attributes = mergeDocArray(moduleDoc.attributes, behavior.attributes);
					moduleDoc.methods = mergeDocArray(moduleDoc.methods, behavior.methods);
					moduleDoc.events = mergeDocArray(moduleDoc.events, behavior.events);
				}
			});

			file.contents = new Buffer(JSON.stringify(moduleDoc), enc);
			this.push(file);
			cb();
		});
	}

	// Ad-hoc plugin for injecting everything else
	function injectModuleData(pkg, moduleMap, articleList, articleMap) {
		return through.obj(function(file, enc, cb) {
			var moduleDoc = JSON.parse(file.contents);
			var examplePath = j(C.SRC, moduleDoc.name, 'example.html');
			var example;
			try {
				example = fs.readFileSync(examplePath).toString('utf8');
			} catch(e) {
				console.log('Missing example.html for '+moduleDoc.name);
				console.log(e);
			}

			// Inject metadata
			moduleDoc.revision = pkg.version;
			moduleDoc.modules = moduleMap;
			moduleDoc.articleList = articleList;
			moduleDoc.articleMap = articleMap;
			if(example) moduleDoc.example = example;

			file.contents = new Buffer(JSON.stringify(moduleDoc), enc);
			this.push(file);
			cb();
		});
	}

	function injectArticleData(pkg, moduleMap, articleList, articleMap) {
		return through.obj(function(file, enc, cb) {
			var articleContents = file.contents.toString('utf8');
			var articleDoc = {
				contents: articleContents,
				revision: pkg.version,
				modules: moduleMap,
				articleList: articles,
				articleMap: articleMap
			};
			var templatePath = j(__dirname, C.DOCS,'/article_template.html');
			var templateString = fs.readFileSync(templatePath).toString('utf8');
			var template = hogan.compile(templateString);
			var doc = template.render(articleDoc, partialMap);
			file.contents = new Buffer(doc, enc);
			this.push(file);
			cb();
		});
	}

	var pkg = getPkgInfo();

	// Create moduleList from directory listing
	var modules = glob.sync(j(C.MODULE_MASK, "/doc.json"), {cwd:C.SRC});
	var moduleList = modules.map(function(name) { return name.replace('/doc.json',''); });
	var moduleMap = moduleList.map(function(name) { return {name: name}; });

	// Create behaviorsMap
	var behaviors = glob.sync(j(C.SRC, C.SHARED, '/behaviors/*.json'));
	var behaviorsMap = {};
	behaviors.forEach(function(behavior) {
		var behaviorKey = behavior.replace(j(C.SRC, C.SHARED, '/behaviors/'),'')
			.replace('.json','')
			.toLowerCase();
		behaviorsMap[behaviorKey] = JSON.parse(fs.readFileSync(behavior));
	});

	// Create articleList and articleMap
	var articles = glob.sync("*.md", {cwd:j(C.DOCS, "/articles/")});
	var articleMap = JSON.parse(fs.readFileSync(j(C.DOCS, '/articles/manifest.json')));
	var articleList = articles.map(function(article) {
		var file = fs.readFileSync(j(C.DOCS,'/articles/',article), 'utf8'),
			name = file.split("\n")[0].replace("#",""),
			key = path.basename(article, '.md'),
			link = "article_" + key + ".html";
		return {
			key: key,
			name: name,
			link: link
		};
	});
	articleMap = articleMap.map(function(section) {
		var a = lookupArticle(articleList, section.key);
		if (a) {
			section.link = a.link.trim();
			section.name = a.name.trim();
		}
		if (section.children) {
			section.children = section.children.map(function(key) {
				return lookupArticle(articleList, key);
			});
		}
		return section;
	});

	// Compile partials
	var partials = glob.sync("*.html", {cwd:C.DOCS, ignore: '(*_template).html'});
	var partialMap = {};
	partials.forEach(function(part) {
		var name = part.replace('.html','');
		var partialString = fs.readFileSync(j(C.DOCS,part), 'utf8');
		partialMap[name] = hogan.compile(partialString);
	});

	var indexStream = gulp.src(j(C.DOCS,'/index.html'))
		.pipe(cache('docs_dex'))
		.pipe(through.obj(function(file, enc, cb) {
			// TODO: Put this in a closure
			var templateString = file.contents.toString('utf8');
			var template = hogan.compile(templateString);
			var doc = template.render(null, partialMap);
			file.contents = new Buffer(doc, enc);
			this.push(file);
			cb();
		}))
		.pipe(gulp.dest(C.BUILD_DOCS));

	var moduleStream = gulp.src(j(C.SRC,C.MODULE_MASK,'/doc.json'))
		.pipe(cache('docs_module'))
		.pipe(injectBehaviorDocs(behaviorsMap))
		.pipe(injectModuleData(pkg, moduleMap, articleList, articleMap))
		.pipe(dbg('docs-modules'))
		.pipe(through.obj(function(file, enc, cb) {
			var moduleDoc = JSON.parse(file.contents);
			var templatePath = j(__dirname,C.DOCS,'/component_template.html');
			var templateString = fs.readFileSync(templatePath, 'utf8');
			var template = hogan.compile(templateString);
			var doc = template.render(moduleDoc, partialMap);
			file.contents = new Buffer(doc, enc);
			this.push(file);
			cb();
		}))
		.pipe(rename(function(path) {
			path.basename = path.dirname;
			path.dirname = '';
			path.extname = '.html';
		}))
		.pipe(gulp.dest(C.BUILD_DOCS))
		.on('error',console.log);

	var articleStream = gulp.src(j(C.DOCS,'/articles/*.md'))
		.pipe(cache('docs_article'))
		.pipe(marked().on('error',console.log))
		.pipe(injectArticleData(pkg, moduleMap, articleList, articleMap))
		.pipe(rename({prefix: 'article_'}))
		.pipe(dbg('docs-articles'))
		.pipe(gulp.dest(C.BUILD_DOCS));

	return merge(indexStream, moduleStream, articleStream);
});

gulp.task('gh-pages', function() {
	var pkg = getPkgInfo();
	return gulp.src(C.BUILD_DOCS+'**/*')
		.pipe(dbg('gh-pages'))
		.pipe(ghPages({
			message: 'docs updates v'+pkg.version
		}));
});

/** LIVE **/

gulp.task('watch', function () {
	gulp.watch(j(C.SRC, C.MODULE_MASK, '/*.scss'), ['sass']);
	gulp.watch(j(C.SRC, C.MODULE_MASK, C.MODULE_HTML), ['copy', 'vulcanize']);
	gulp.watch(j(C.SRC, C.SHARED, '**'), ['copy']);
});

gulp.task('index', function() {
	var modules = glob.sync(j(C.MODULE_MASK,"/index.html"), {cwd:C.SRC});
	var moduleList = modules.map(function(name) { return name.replace('/index.html',''); });
	var moduleMap = {modules: moduleList};
	var templatePath = j(__dirname, C.TEMPLATES, '/index_template.html');
	var templateString = fs.readFileSync(templatePath, 'utf8');
	var template = hogan.compile(templateString);
	var index = template.render(moduleMap);
	fs.writeFileSync(j(C.BUILD,'index.html'), index);
});

gulp.task('server', function() {
	var server = connect()
		.use('/bower_components', serveStatic(C.BOWER))
		.use(serveStatic(C.BUILD))
		.listen(C.LIVE_PORT);

	gulp.src(__filename)
		.pipe(open({
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
		.pipe(open({
			uri: 'http://localhost:'+C.DOCS_PORT
		}));
});

gulp.task('live:docs', ['watch:docs', 'server:docs']);

/** DEPLOY **/

function inc(version) {
	if(!version) version = 'patch';
	return gulp.src(['package.json', 'bower.json'])
	   .pipe(bump({type: version}))
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
		.pipe(conventionalChangelog({
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
		.pipe(git.add())
		.pipe(git.commit('Release v'+pkg.version));
});

gulp.task('tag-release', function() {
	var pkg = getPkgInfo();
	git.tag('v'+pkg.version, 'Version '+pkg.version, function(err) {
		console.log(err);
	});
});
