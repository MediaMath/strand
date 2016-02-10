'use strict';
/*jslint node: true */

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

var SRC = 'src/';
var BUILD = 'build/';
var BUILD_DOCS = 'build_docs/';
var DIST = 'dist/';
var TEMPLATES = 'grunt/templates/'; //TODO swap to gulp

/** BUILD **/

gulp.task('clean', function() {
	return del([BUILD + '**', BUILD_DOCS+ '**', DIST+ '**']);
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
			inlineScripts:true,
			inlineCss:true,
			stripExcludes:true,
			excludes: {
				imports: ['.*polymer\.html']
			}
		}))
		.pipe(htmlmin())
		.pipe(gulp.dest(BUILD));
	var lib = gulp.src(BUILD + "strand.html")
		.pipe(vulcanize({
			inlineScripts:true,
			inlineCss:true,
			stripExcludes:false,
			// excludes: {
			// 	imports: ['.*\.html','polymer.html']
			// }
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

gulp.task('build:prod', function(cb) {
	run('copy',['sass','font'],'vulcanize','vulcanize:prod','copy:prod',cb);
});

gulp.task('vulcanize:prod', function() {
	return gulp.src(BUILD + 'strand.html')
		.pipe(vulcanize({
			inlineScripts:true,
			inlineCss:true,
			stripExcludes:false
		}))
		.pipe(htmlmin({
			quotes: true,
			empty: true,
			spare: true
		}))
		.pipe(inlinemin())
		.pipe(gulp.dest(BUILD));
});

gulp.task('copy:prod', ['vulcanize:prod'], function() {
	return gulp.src([BUILD+'**/*.+(html|woff)', '!'+BUILD+'/shared/**/*.html', '!'+BUILD +'**/example.html'])
		.pipe(changed(DIST))
		.pipe(debug())
		.pipe(gulp.dest(DIST));
});

// gulp.task('minify:prod', function() {
// 	return gulp.src(BUILD+'strand.html')
// 		.pipe(debug())
// 		.pipe(htmlmin({
// 			quotes: true,
// 			empty: true,
// 			spare: true
// 		}))
// 		.pipe(inlinemin())
// 		.pipe(gulp.dest(DIST))
// });

/** DOCS **/

gulp.task('docs', function() {
	var modules = glob.sync("mm-*", {cwd:SRC});
	var articles = glob.sync("*.md", {cwd:"./docs/articles/"});
	var articleMap = JSON.parse(fs.readFileSync('./docs/articles/manifest.json'));

	var articleStream = gulp.src('./docs/articles/*.md')
		.pipe(debug())
		.pipe(marked().on('error',console.log))
		.pipe(wrap({src:"./docs/article_template.html"},{},{engine:"hogan"}).on('error',console.log))
		.pipe(gulp.dest(BUILD_DOCS));
	return articles;
});

/** LIVE **/

gulp.task('watch', function () {
 gulp.watch(SRC + 'mm-*/*.scss', ['sass']);
 // gulp.watch(SRC)
 // gulp.watch('./')
});

/** DEPLOY **/

gulp.task('release:major', function() {
	run('build:prod', 'bump:major', 'changelog', 'stage-release');
});
gulp.task('release:minor', function() {
	run('build:prod', 'bump:minor', 'changelog', 'stage-release');
});
gulp.task('release:patch', function() {
	run('build:prod', 'bump:patch', 'changelog', 'stage-release');
});

gulp.task('bump:major', function(){
	 return gulp.src(['package.json', 'bower.json'])
		.pipe(bump({type: 'major'}))
		.pipe(gulp.dest('./'));
});
gulp.task('bump:minor', function(){
	 return gulp.src(['package.json', 'bower.json'])
		.pipe(bump({type: 'minor'}))
		.pipe(gulp.dest('./'));
});
gulp.task('bump:patch', function(){
	 return gulp.src(['package.json', 'bower.json'])
		.pipe(bump({type: 'patch'}))
		.pipe(gulp.dest('./'));
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

gulp.task('stage-release', function() {
	var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	return gulp.src([DIST, 'package.json', 'bower.json', 'CHANGELOG.md'])
		.pipe(git.add())
		.pipe(git.commit('Release v'+pkg.version));
});
