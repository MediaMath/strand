var SRC_DIR = 'src',
	TEMPLATE_DIR = 'grunt',
	BUILD_DIR = 'build',
	DIST_DIR = 'dist';

var exec = require("child_process").exec;

module.exports = function(grunt) {

	var modules = grunt.file.expand({cwd: SRC_DIR}, 'mm-*');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		copy: {
			files: {
				expand: true,
				cwd: SRC_DIR,
				src: ['mm-*/+(index|mm-*).+(html|js)', 'shared/fonts/**', 'shared/js/**', '!**/*.scss'],
				dest: '<%= build_dir %>'
			}
		},

		sass: {
			options: {
				includePaths: ['bower_components/bourbon/app/assets/stylesheets/', SRC_DIR + '/shared/sass/']
			},

			dev: {
				files: [{
					expand: true,
					cwd: SRC_DIR,
					src: ['mm-*/*.scss', 'shared/fonts/*.scss'],
					dest: '<%= build_dir %>',
					ext: '.css'
				}]
			},

			dist: {
				options: {
					outputStyle: 'compressed'
				},
				files: [{
					expand: true,
					cwd: SRC_DIR,
					src: ['mm-*/*.scss', 'shared/fonts/*.scss'],
					dest: '<%= build_dir %>',
					ext: '.css'
				}]
			}
		},

		cssUrlEmbed: {
			fonts: {
				files: [{
					src: '<%= build_dir %>/shared/fonts/fonts.css',
					dest: '<%= build_dir %>/shared/fonts/fonts.css'
				}]
			}
		},

		hogan_static: {
			index: {
				options: {
					data: {
						modules: modules
					}
				},
				files: [{
					src: TEMPLATE_DIR + '/index_template.html',
					dest: '<%= build_dir %>/index.html'
				}]
			},
			colors: {
				options: {
					// delimiters:'<< >>',
					data: {
						colors: {}
					}
				},
				files: {
					'src/lib/Colors.js': TEMPLATE_DIR + '/lib_color.js'
				}
			},
			lib: {
				options:{
					data: {
						modules: modules,
						shared: grunt.file.expand({ cwd: SRC_DIR }, 'shared/**/*.html')
					}
				},
				files: [{
					src: TEMPLATE_DIR + '/lib_template.html',
					dest: '<%= build_dir %>/<%= pkg.name %>.html'
				}]
			}
		},

		vulcanize: {
			options: {
				inline:true,
				strip:true,
				'strip-excludes':false,
			},
			fontslib:{
				files: {
					'<%= build_dir %>/shared/fonts/fonts.html' : '<%= build_dir %>/shared/fonts/fonts.html',
				}
			},
			jslib: {
				files: [{
					expand: true,
					cwd: '<%= build_dir %>',
					src: ['shared/js/*.html'],
					dest: '<%= build_dir %>'
				}]
			},
			modules: {
				options:{
					excludes: {
						imports: ['.*\.html']
					}
				},
				files: [{
					expand: true,
					cwd: '<%= build_dir %>',
					src: ['mm-*/mm-*.html'],
					dest: '<%= build_dir %>'
				}]
			},
			dist:{
				files: {
					'<%= dist_dir %>/<%= pkg.name %>.html' : '<%= build_dir %>/<%= pkg.name %>.html'
				}
			}
		},

		bump: {
			options: {
				files: [ 'package.json', 'bower.json' ],
				commitFiles: [ 'package.json', 'bower.json', DIST_DIR + '/*' ],
				push: true,
				pushTo: "git@github.com:MediaMath/strand.git",
			}
		},

		clean: {
			build: '<%= build_dir %>',
			dist: '<%= dist_dir %>/strand.html'
		}

	});

	grunt.registerTask('sassShadowFix', function() {
		var files = grunt.file.expand(grunt.config('build_dir') + 'mm-*/mm-*.css'),
			css;
		function stripQuotes(str, arg) {
			return str.replace(/'/g,'');
		}

		files.forEach(function(file) {
			css = grunt.file.read(file);
			//strip '' from :host('.select') workaround
			css = css.replace(/:host\('.*'\)/ig, stripQuotes);
			//strip '' from :host-context('.select') workaround
			css = css.replace(/:host-context\('.*'\)/ig, stripQuotes);
			//strip '' from '/shadow/' workaround 
			css = css.replace(/'\/(shadow|shadow-child|shadow-deep)\/'/ig, stripQuotes);
			grunt.log.writeln('Wrote ' + file);
			grunt.file.write(file, css);
		}) ;

		grunt.log.ok();

	});

	//Create HTML imports for JS library
	grunt.registerTask('jslib:imports', function() {
		var files = grunt.file.expand({cwd: SRC_DIR + '/shared/js/' }, '*.js');

		files.forEach(function(file) {
			var fileName = file.substr(0, file.lastIndexOf('.')) || file;
			grunt.file.write(grunt.config('build_dir') + '/shared/js/' + fileName.toLowerCase() + '.html', '<script src=\"' + file + '\"></script>');
		});

		grunt.log.ok();
	});

	grunt.registerTask('color', function() {
		var path = SRC_DIR + '/shared/sass/_color.scss';
		var color = grunt.file.read(path);
		color = color.replace(/\$color-(\w\d\d*): (#[\w\d]*);/g, function(a, key, value) {
			return "\t\"" + key + "\":\"" + value + "\","; 
		});
		grunt.config.set('hogan_static.colors.options.data.colors', color);
		grunt.task.run(['hogan_static:colors']);
	});

	grunt.registerTask('build:dist', function(arg){
		grunt.config('build_dir', BUILD_DIR);
		grunt.config('dist_dir', DIST_DIR);

		grunt.task.run([
			'clean',
			'copy',
			'sass:dist',
			'sassShadowFix',
			'cssUrlEmbed', 
			'hogan_static:lib',
			// 'vulcanize:fontslib',
			// 'vulcanize:jslib',
			// 'vulcanize:modules',
			'vulcanize:dist'
		]);
	});

	grunt.registerTask('build:dev', function() {
		grunt.config('build_dir', BUILD_DIR);
		grunt.task.run([
			'clean:build',
			'copy',
			'sass:dev',
			'sassShadowFix',
			'hogan_static:index',
		]);
	});

	function execCmd(cmd, onExecuted) {
		exec( cmd, function(error, stdout, stderr) {
			error && console.error(error);
			stderr && console.error(stderr);
			stdout && console.log(stdout);
			onExecuted();
		});
	}

	grunt.registerTask( "stage-release", "Stage release files.", function() {
		execCmd( "git add " + DIST_DIR + "/*", this.async() );
	});

	grunt.registerTask('default', ['build:dev']);
	
	grunt.registerTask('release', function(version){
		version = version || "";
		grunt.task.run( "build:dist", "stage-release", "bump:" + version);
	});

};