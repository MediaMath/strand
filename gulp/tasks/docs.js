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
	var jsonlint = require("gulp-jsonlint");

	//stream/gulp related
	var merge = require('merge-stream');
	var es = require('event-stream');
	var gulp = require('gulp');
	var through = require('through2');
	var run = require('run-sequence');


	module.exports = function(gulp, plugins, C) {

		gulp.task('docs', function() {
			run('clean','clean:docs', 'build:dist','copy:docs', 'sass:docs', 'docs:templates');
		});

		gulp.task('clean:docs', function() {
			return del([C.BUILD_DOCS+'**']);
		});

		gulp.task('copy:docs', function() {
			var assets = gulp.src(j(C.DOCS,'/images/*.svg'),{base:C.DOCS});
			var cname = gulp.src('CNAME');
			var license = gulp.src('LICENSE.txt');
			var touchIcons = gulp.src('apple-*.png');
			var favicon = gulp.src('favicon.ico');

			var merged_static = merge(assets, cname, license, touchIcons, favicon)
				.pipe(gulp.dest(C.BUILD_DOCS));

			var bower_components = gulp.src([j(C.BOWER,'/webcomponentsjs/**/*'), j(C.BOWER,'/polymer/**/*')], {base:C.BOWER})
				.pipe(C.dbg('copy-bower'))
				.pipe(gulp.dest(j(C.BUILD_DOCS,C.BOWER)));

			var lib = gulp.src(j(C.DIST,'**'))
				.pipe(C.dbg('copy-lib'))
				.pipe(gulp.dest(j(C.BUILD_DOCS,C.BOWER,'/strand/dist')));

			return merge(bower_components, merged_static, lib);
		});

		gulp.task('sass:docs', function() {
			return gulp.src(j(C.DOCS,'/**/*.scss'))
				.pipe(C.dbg('sass-docs'))
				.pipe(plugins.sass({includePaths: C.SASS_INCLUDE}).on('error', plugins.sass.logError))
				.pipe(plugins.postcss([autoprefixer({browsers: ['last 2 versions']})]))
				.pipe(gulp.dest(C.BUILD_DOCS));
		});

		gulp.task('docs:templates', function() {

			//orphaning this pipeline cause i dont think we care when it finishes
			gulp.src("./src/strand-*/doc.json")
				.pipe(jsonlint())
				.pipe(jsonlint.reporter());

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
					if(!file.isBuffer()) this.emit('error', new plugins.gutil.PluginError('Buffer required'));

					var moduleDoc = JSON.parse(file.contents),
						moduleBehaviors = moduleDoc.behaviors;

					// Merge behaviors docs with component docs
					if(moduleBehaviors) moduleBehaviors.forEach(function(key) {
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
					moduleDoc.articleMap = articleMap;
					if(moduleDoc.articles) {
						moduleDoc.articles = moduleDoc.articles.map(function(articleName) {
							return lookupArticle(articleList, articleName);
						});
					}
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
					var templatePath = j(C.DOCS,'/article_template.html');
					var templateString = fs.readFileSync(templatePath).toString('utf8');
					var template = hogan.compile(templateString);
					var doc = template.render(articleDoc, partialMap);
					file.contents = new Buffer(doc, enc);
					this.push(file);
					cb();
				});
			}

			var pkg = C.getPkgInfo();

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
				.pipe(plugins.cache('docs_dex'))
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
				.pipe(plugins.cache('docs_module'))
				.pipe(injectBehaviorDocs(behaviorsMap))
				.pipe(injectModuleData(pkg, moduleMap, articleList, articleMap))
				.pipe(C.dbg('docs-modules'))
				.pipe(through.obj(function(file, enc, cb) {
					var moduleDoc = JSON.parse(file.contents);
					var templatePath = j(C.DOCS,'/component_template.html');
					var templateString = fs.readFileSync(templatePath, 'utf8');
					var template = hogan.compile(templateString);
					var doc = template.render(moduleDoc, partialMap);
					file.contents = new Buffer(doc, enc);
					this.push(file);
					cb();
				}))
				.pipe(plugins.rename(function(path) {
					path.basename = path.dirname;
					path.dirname = '';
					path.extname = '.html';
				}))
				.pipe(gulp.dest(C.BUILD_DOCS))
				.on('error',console.log);

			var articleStream = gulp.src(j(C.DOCS,'/articles/*.md'))
				.pipe(plugins.cache('docs_article'))
				.pipe(plugins.marked().on('error',console.log))
				.pipe(injectArticleData(pkg, moduleMap, articleList, articleMap))
				.pipe(plugins.rename({prefix: 'article_'}))
				.pipe(C.dbg('docs-articles'))
				.pipe(gulp.dest(C.BUILD_DOCS));

			return merge(indexStream, moduleStream, articleStream);
		});

		gulp.task('gh-pages', function() {
			var pkg = C.getPkgInfo();
			return gulp.src(C.BUILD_DOCS+'**/*')
				.pipe(C.dbg('gh-pages'))
				.pipe(plugins.ghPages({
					message: 'docs updates v'+pkg.version,
					remoteUrl:'git@github.com:MediaMath/strand.git'
				}));
		});

	};
})();
