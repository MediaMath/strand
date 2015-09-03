module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		src_dir: 'src',
		template_dir: 'grunt/templates',
		build_dir: 'build',
		docs_dir: 'build_docs',
		dist_dir: 'dist',
		
		modules: grunt.file.expand({ cwd: 'src' }, 'mm-*'),
		shared: grunt.file.expand({ cwd: 'src' }, 'shared/**/*.html'),

		clean: {
			build: '<%= build_dir %>',
			docs: '<%= docs_dir %>',
			dist: '<%= dist_dir %>',
			src: ['src/mm-*/*.+(css|min.js)', 'src/mm-*/template.html']
		},

		copy: {
			build: {
				expand: true,
				cwd: '<%= src_dir %>',
				src: ['**/*.+(html|js|woff)', '!**/example.html'],
				dest: '<%= build_dir %>'
			},
			dist: {
				expand: true,
				cwd: '<%= build_dir %>',
				src: ['**/*.html', '!mm-*/index.html'],
				dest: '<%= dist_dir %>'
			}
		},

		sass: {
			options: {
				includePaths: ['bower_components/bourbon/app/assets/stylesheets/', '<%= src_dir %>/shared/sass/']
			},

			dev: {
				files: [{
					expand: true,
					cwd: '<%= src_dir %>',
					src: ['**/*.scss'],
					dest: '<%= build_dir %>',
					ext: '.css'
				}]
			},

			docs: {
				files: {
					'<%= docs_dir %>/docs.css':'docs/docs.scss'
				}
			},

			dist: {
				options: {
					outputStyle: 'compressed'
				},
				files: [{
					expand: true,
					cwd: '<%= src_dir %>',
					src: ['**/*.scss'],
					dest: '<%= build_dir %>',
					ext: '.css'
				}]
			}
		},

		uglify: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= build_dir %>',
					src: ['mm-*/*.js', 'shared/js/*.js'],
					dest: '<%= build_dir %>'
				}]
			}
		},

		cssUrlEmbed: {
			fonts: {
				files: {
					'<%= build_dir %>/shared/fonts/fonts.css' : '<%= build_dir %>/shared/fonts/fonts.css'
				}
			}
		},

		hogan_static: {
			index: {
				options: {
					data: {
						modules: '<%= modules %>'
					}
				},
				files: [{
					src: '<%= template_dir %>/index_template.html',
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
					'<%= src_dir %>/lib/Colors.js': '<%= template_dir %>/lib_color.js'
				}
			},
			lib: {
				options:{
					data: {
						modules: '<%= modules %>',
						shared: '<%= shared %>',
					}
				},
				files: [{
					src: '<%= template_dir %>/lib_template.html',
					dest: '<%= build_dir %>/<%= pkg.name %>.html'
				}]
			},
			fonts:{
				options:{
					data:{
						module:'shared-fonts',
						//style:grunt.file.read("build/shared/fonts/fonts.css")
					}
				},
				files:{
					'<%= build_dir %>/shared/fonts/shared-fonts.html': "<%= template_dir %>/style_module_template.html"
				}
			}
		},

		vulcanize: {
			options: {
				inlineScripts:true,
				inlineCss:true,
				stripExcludes:false
			},
			shared: {
				files: [{
					expand: true,
					cwd: '<%= build_dir %>',
					src: ['shared/**/*.html'],
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
				options:{
					excludes: {
						imports: ['polymer.html']
					}
				},
				files: {
					'<%= build_dir %>/<%= pkg.name %>.html' : '<%= build_dir %>/<%= pkg.name %>.html'
				}
			}
		},

		htmlmin: {
			dist: {
				options: {
					customAttrAssign: /\$=/,
					minifyJS: true,
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					'<%= build_dir %>/<%= pkg.name %>.html' : '<%= build_dir %>/<%= pkg.name %>.html'
				}
			}
		},

		replace: {
            bower: {
                src: ['<%= build_dir %>/**/*.html'],
                overwrite: true,
                replacements: [{
                    from: 'bower_components',
                    to: '..'
                }]
            }
        },

		banner: grunt.file.read("BANNER.txt"),

		usebanner: {
			jscss: {
				options: {
					banner: "/**\n<%= banner %>\n*/"
				},
				files: {
					src: [ 'src/**/*.js', 'src/**/*.scss' ]
				}
			},
			html: {
				options: {
					banner: "<!--\n<%= banner %>\n-->"
				},
				files: {
					src: [ 'src/mm-*/mm-*.html' ]
				}
			},
			dist: {
				options: {
					banner: "<!--\n<%= banner %>\n-->"
				},
				files: {
					src: [ '<%= build_dir %>/strand.html' ]
				}
			},
		},

		shell: {
			stageRelease: {
				command: 'git add <%= dist_dir %>/*'
			}
		},

		githubChanges: {
			release: {
				options: {
					owner: 'MediaMath',
					repository: 'strand',
					branch: 'develop',
					noMerges: true,
					tagName: 'v<%= pkg.version %>'
				}
			}
		},

		bump: {
			options: {
				files: [ 'package.json', 'bower.json' ],
				commitFiles: [ 'package.json', 'bower.json', 'CHANGELOG.md', 'dist/*' ],
				updateConfigs: ['pkg'],
				push: false,
				pushTo: 'upstream',
				createTag: true
			}
		}

	});

	//Generate template style includes for new polymer 1.1 ext-styling
	grunt.registerTask('style:imports', function() {
		var tasks = [];
		var build = grunt.config('build_dir') + "/";
		var styles = grunt.file.expand({
			cwd: grunt.config('build_dir')
		}, 'mm-**/*.css');

		var styleData = {};
		styles.forEach(function(file) {
			var key = file.split(".css").join("").split("/")[0];
			if (grunt.file.exists(build + file)) {
				var css = grunt.file.read(build + file);
				// styleData[key] = css;
				grunt.config.set("hogan_static.styles_" + key, {
					options:{
						data:{
							module:key,
							style:css
						}
					},
					files:[{
						src:'<%= template_dir %>/style_module_template.html',
						dest:'<%=build_dir%>/'+key+'/style.html'
					}]
				});
				tasks.push("hogan_static:styles_" + key);
			} else {
				grunt.log.writeln("Not Found:"+build+file);
			}
		});

		//set config for the static fonts lib as well
		var fnts = grunt.config.get('build_dir') + '/shared/fonts/fonts.css';
		grunt.config.set("hogan_static.fonts.options.data.style", grunt.file.read(fnts));
		
		//run batched
		grunt.task.run(tasks);

	});

	//Create HTML imports for JS library
	grunt.registerTask('jslib:imports', function() {
		var files = grunt.file.expand({cwd: grunt.config('src_dir') + '/shared/js/' }, '*.js');

		files.forEach(function(file) {
			var fileName = file.substr(0, file.lastIndexOf('.')) || file;
			grunt.file.write(grunt.config('build_dir') + '/shared/js/' + fileName.toLowerCase() + '.html', '<script src=\"' + file + '\"></script>');
		});

		grunt.log.ok();
	});

	grunt.registerTask('color', function() {
		var path = grunt.config('src_dir') + '/shared/sass/_color.scss';
		var color = grunt.file.read(path);
		color = color.replace(/\$color-(\w\d\d*): (#[\w\d]*);/g, function(a, key, value) {
			return "\t\"" + key + "\":\"" + value + "\","; 
		});
		grunt.config.set('hogan_static.colors.options.data.colors', color);
		grunt.task.run(['hogan_static:colors']);
	});

	grunt.registerTask('build:dist', function(arg){
		grunt.task.run([
			'clean:build',
			'copy:build',
			'sass:dist',
			'cssUrlEmbed', 
			'style:imports',
			'hogan_static:fonts',
			// 'hogan_static:lib', //un-comment to build entire library
			'vulcanize:dist',
			'htmlmin:dist',
			'usebanner:dist'
		]);
	});

	grunt.registerTask('build:dev', function() {
		grunt.task.run([
			'clean:build',
			'copy:build',
			'sass:dev',
			'style:imports',
			'hogan_static:fonts',
			'hogan_static:index'
			// 'hogan_static:lib'
		]);
	});

	grunt.registerTask('default', ['build:dev']);

	grunt.registerTask('release', function(version){
		version = version || "patch";
		grunt.task.run( "bump-only:" + version, "clean:dist", "build:dist", "replace:bower", "copy:dist", "shell:stageRelease", "githubChanges", "bump-commit");
	});
};
