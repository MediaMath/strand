var path = require('path');

module.exports = function(grunt) {

	grunt.event.on('watch', function(action, filepath) {

		grunt.log.writeln("watch event");

		var module = filepath.split("/")[0];
		grunt.log.writeln("module:"+module).ok();
		if (module) {
			grunt.config.set("module",module);
		} else {
			grunt.log.error("Could not find module for: " + filepath);
		}
	});

	grunt.registerTask('sassShadowFixLive', function() {
		var file = grunt.template.process('<%=module%>/<%=module%>.css'),
			css = grunt.file.read(file);
		function stripQuotes(str, arg) {
			return str.replace(/'/g,"");
		}

		//strip '' from :host('.select') workaround
		css = css.replace(/:host\('.*'\)/ig, stripQuotes);
		//strip '' from :host-context('.select') workaround
		css = css.replace(/:host-context\('.*'\)/ig, stripQuotes);
		//strip '' from '/shadow/' workaround 
		css = css.replace(/'\/(shadow|shadow-child|shadow-deep)\/'/ig, stripQuotes);
		grunt.log.writeln("Wrote " + file);
		grunt.file.write(file, css);

		grunt.log.ok();

	});

	grunt.registerTask('live', ['connect','watch']);

	grunt.config.set("watch", {
		options: {
			livereload:true,
			hostname: '*'
		},
		modules: {
			files: ['src/mm-*/*'],
			tasks: ['default'],//['sass:module','sassShadowFixLive','vulcanize:module'],
			options: {
				nospawn: true,
			}
		},
		sharedScss: {
			files: ['src/shared/sass/*.scss'],
			tasks: ['default']
		},
		jslib: {
			files:['shared/js/*.js'],
			tasks: ['vulcanize:jslib'],
		},
		docs: {
			files: ['build/docs/*'],
			tasks: ['docs'],
			options: {
				nospawn: true,
			}
		},
		index: {
			files: ['mm-*/'],
			tasks: ['hogan_static:index'],
			options: {
				event: ['added','deleted']
			}
		}
	});

	grunt.config.set(["vulcanize","module"], {
		options: {
			inline:true,
			strip: true,
			excludes: {
				imports: ['.*\.html']
			}
		},
		files:{
			'dist/<%=module%>.html':'<%=module%>/<%=module%>.html'
		}
	});

	grunt.config.set("sass.module", {
		options: {
			style: 'compressed',
			includePaths: ["bower_components/bourbon/app/assets/stylesheets/"]
		},
		files: {
			'<%=module%>/<%=module%>.css':'<%=module%>/<%=module%>.scss'
		}
	});

	grunt.config.set("connect", {
		server: {
			options: {
				middleware: function(connect, options) {
					return [
					function(req, res, next) {
						res.setHeader('Access-Control-Allow-Origin', '*');
						res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
						res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
						return next();
					},
					connect.static('build'),
					connect().use(connect.query()),
					connect().use(connect.bodyParser()),
					connect().use('/bower_components', connect.static('./bower_components')),
					connect().use('/ajax', function(req, res, next) {
						res.setHeader('Content-Type', 'application/json');
						if (req.method === "GET") {
							res.end(JSON.stringify(req.query));
						} else {
							res.end(JSON.stringify(req.body));
						}
					})
					];
				}
			}
		}
	});

}