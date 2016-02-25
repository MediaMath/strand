'use strict';
/*jslint node: true */
/*jslint esversion: 6*/
//TODO(shuwen): split into multiple files
//TODO(shuwen): replace path string concatenation with path.join

var fs = require('fs');
var gulp = require('gulp');
var glob = require('glob');
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
var inlinemin = require('gulp-minify-inline');
var wrap = require('gulp-wrap');
var inlineAssets = require('gulp-inline-assets');
var marked = require('gulp-marked');
var changed = require('gulp-changed');
var es = require('event-stream');
var cache = require('gulp-cached');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var git = require('gulp-git');
var bump = require('gulp-bump');
var tagVersion = require('gulp-tag-version');
var conventionalChangelog = require('gulp-conventional-changelog');
var ghPages = require('gulp-gh-pages');
var through = require('through2');
var hogan = require('hogan.js');
var header = require('gulp-header');
var base64 = require('gulp-base64');
var minimist = require('minimist');

var SRC = 'src/';
var BUILD = 'build/';
var BUILD_DOCS = 'build_docs/';
var DIST = 'dist/';
var TEMPLATES = 'gulp/templates/'; //TODO swap to gulp

var PATCH_LIST = [
	'bower_components/moment/min/moment.min.js'
];

/** BUILD **/

gulp.task('patch-lib', function() {
	gulp.src(PATCH_LIST, {base: path.join(__dirname, 'bower_components')})
		.pipe(debug())
		.pipe(wrap("(function(define, require) { {{{contents}}} })();",{},{engine:"hogan"}).on('error',console.error))
		.pipe(gulp.dest( path.join(__dirname, 'bower_components') ));
});

gulp.task('clean', function() {
	return del([BUILD + '**', BUILD_DOCS+ '**']);
});

gulp.task('copy', function() {
	return gulp.src([SRC + '**/*.+(html|js|woff)', '!' + SRC +'**/example.html'])
		.pipe(changed(BUILD))
		.pipe(debug())
		.pipe(gulp.dest(BUILD));
});

gulp.task('sass', function() {
	var wrapper = fs.readFileSync(TEMPLATES + "style_module_template.html");
	return gulp.src(SRC + 'mm-*/*.scss')
		// .pipe(cache())
		.pipe(changed(BUILD, {extension:'.css'}))
		.pipe(sass({includePaths: ['./bower_components/bourbon/app/assets/stylesheets/', './src/shared/sass/']}).on('error', sass.logError))
		.pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
		.pipe(gulp.dest(BUILD))
		.pipe(wrap({src:TEMPLATES + "style_module_template.html"},{},{engine:"hogan"}))
		.pipe(wrap(function(data) {
			data.fname = path.basename(data.file.relative,'.css');
			return wrapper;
		},{},{engine:"hogan"}))
		.pipe(rename({basename:"style", extname: ".html"}))
		.pipe(gulp.dest(BUILD));
});

gulp.task('font', function() {
	return gulp.src(SRC + 'shared/fonts/fonts.scss')
		.pipe(sass({includePaths: ['./bower_components/bourbon/app/assets/stylesheets/', './src/shared/sass/']}).on('error', sass.logError))
		.pipe(gulp.dest(BUILD + 'shared/fonts/'))
		.pipe(wrap("<style>{{{contents}}}</style>",{},{engine:"hogan"}).on('error',console.log))
		.pipe(rename("fonts.html").on('error',console.log))
		.pipe(gulp.dest(BUILD + '/shared/fonts/'));
});

gulp.task('vulcanize', function() {
	var modules = gulp.src(BUILD + "mm-*/mm-*.html")
		.pipe(changed(BUILD))
		.pipe(vulcanize({
			inlineScripts: true,
			inlineCss: true,
			excludes: ['bower_components/polymer/polymer.html']
		}))
		.pipe(debug())
		.pipe(htmlmin())
		.pipe(gulp.dest(BUILD));

	var lib = gulp.src(BUILD + "strand.html")
		.pipe(vulcanize({
			inlineScripts:true,
			inlineCss:true,
			stripExcludes:false,
			excludes: ['bower_components/polymer/polymer.html']
		}))
		.pipe(gulp.dest(BUILD));
	return merge(modules, lib);
});

gulp.task('default', function(cb) {
	run('clean','copy',['sass','font'],'vulcanize',cb);
});

gulp.task('build', function(cb) {
	run('copy',['sass','font'],'vulcanize',cb);
});

gulp.task('build:prod', ['patch-lib', 'build'], function() {
	var lib = gulp.src(BUILD + 'strand.html')
		.pipe(vulcanize({
			inlineScripts:true,
			inlineCss:true,
			stripExcludes:false
		}))
		.pipe(base64(['.woff']))
		.pipe(htmlmin({
			quotes: true,
			empty: true,
			spare: true
		}))
		.pipe(inlinemin())
		.pipe(header('<!--\n' + fs.readFileSync('BANNER.txt').toString('utf8') + ' -->'))
		.pipe(changed(DIST))
		.pipe(gulp.dest(DIST));
});

/** DOCS **/
gulp.task('docs', ['copy:docs', 'sass:docs', 'docs:templates']);

gulp.task('clean:docs', function() {
	return del([BUILD_DOCS+'**']);
});

gulp.task('copy:docs', function() {
	var assets = gulp.src('docs/images/**',{base:'./docs'});
	var cname = gulp.src('CNAME');
	var license = gulp.src('LICENSE.txt');

	var merged_static = merge(assets, cname, license)
		.pipe(gulp.dest(BUILD_DOCS));

	var bower_components = gulp.src(['bower_components/webcomponentsjs/**/*', 'bower_components/polymer/**/*'], {base:'bower_components'})
		.pipe(debug())
		.pipe(gulp.dest(BUILD_DOCS+'/bower_components/'));

	var lib = gulp.src(BUILD+'**')
		.pipe(gulp.dest(BUILD_DOCS+'/bower_components/strand/dist'));

	return merge(bower_components, merged_static, lib);
});

gulp.task('sass:docs', function() {
	return gulp.src('docs/**/*.scss')
		.pipe(sass({includePaths: ['./bower_components/bourbon/app/assets/stylesheets/', './src/shared/sass/']}).on('error', sass.logError))
		.pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
		.pipe(gulp.dest(BUILD_DOCS));
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
			var examplePath = path.join(SRC, moduleDoc.name, 'example.html');
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
			var templatePath = path.join(__dirname,'docs/article_template.html');
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
	var modules = glob.sync("mm-*/doc.json", {cwd:SRC});
	var moduleList = modules.map(function(name) { return name.replace('/doc.json',''); });
	var moduleMap = moduleList.map(function(name) { return {name: name}; });

	// Create behaviorsMap
	var behaviors = glob.sync(SRC+'shared/behaviors/*.json');
	var behaviorsMap = {};
	behaviors.forEach(function(behavior) {
		var behaviorKey = behavior.replace(SRC+'shared/behaviors/','')
			.replace('.json','')
			.toLowerCase();
		behaviorsMap[behaviorKey] = JSON.parse(fs.readFileSync(behavior));
	});

	// Create articleList and articleMap
	var articles = glob.sync("*.md", {cwd:"./docs/articles/"});
	var articleMap = JSON.parse(fs.readFileSync('./docs/articles/manifest.json'));
	var articleList = articles.map(function(article) {
		var file = fs.readFileSync('./docs/articles/'+article).toString('utf8'),
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
	var partials = glob.sync("*.html", {cwd:"./docs/", ignore: '(*_template).html'});
	var partialMap = {};
	partials.forEach(function(part) {
		var name = part.replace('.html','');
		var partialString = fs.readFileSync('./docs/'+part).toString('utf8');
		partialMap[name] = hogan.compile(partialString);
	});

	var indexStream = gulp.src('./docs/index.html')
		.pipe(through.obj(function(file, enc, cb) {
			// TODO: Put this in a closure
			var templateString = file.contents.toString('utf8');
			var template = hogan.compile(templateString);
			var doc = template.render(null, partialMap);
			file.contents = new Buffer(doc, enc);
			this.push(file);
			cb();
		}))
		.pipe(gulp.dest(BUILD_DOCS));

	var moduleStream = gulp.src(SRC+'mm-*/doc.json')
		.pipe(injectBehaviorDocs(behaviorsMap))
		.pipe(injectModuleData(pkg, moduleMap, articleList, articleMap))
		// .pipe(debug())
		.pipe(through.obj(function(file, enc, cb) {
			var moduleDoc = JSON.parse(file.contents);
			var templatePath = path.join(__dirname,'docs/component_template.html');
			var templateString = fs.readFileSync(templatePath).toString('utf8');
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
		.pipe(gulp.dest(BUILD_DOCS))
		.on('error',console.log);

	var articleStream = gulp.src('./docs/articles/*.md')
		// .pipe(debug())
		.pipe(marked().on('error',console.log))
		.pipe(injectArticleData(pkg, moduleMap, articleList, articleMap))
		.pipe(rename({prefix: 'article_'}))
		.pipe(gulp.dest(BUILD_DOCS));

	return merge(indexStream, moduleStream, articleStream);
});

gulp.task('gh-pages', function() {
	var pkg = getPkgInfo();
	return gulp.src(BUILD_DOCS+'**/*')
		.pipe(ghPages({
			message: 'docs updates v'+pkg.version
		}));
});

/** LIVE **/

gulp.task('watch', function () {
 gulp.watch(SRC + 'mm-*/*.scss', ['sass']);
 // gulp.watch(SRC)
 // gulp.watch('./')
});

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
		.pipe(debug())
		.pipe(gulp.dest('.'));
});

function getPkgInfo() {
	return JSON.parse(fs.readFileSync('package.json', 'utf8'));
}

gulp.task('stage-release', function() {
	var pkg = getPkgInfo();
	return gulp.src([DIST, 'package.json', 'bower.json', 'CHANGELOG.md'])
		.pipe(git.add())
		.pipe(git.commit('Release v'+pkg.version));
});

gulp.task('tag-release', function() {
	var pkg = getPkgInfo();
	git.tag('v'+pkg.version, 'Version '+pkg.version, function(err) {
		console.log(err);
	});
});
