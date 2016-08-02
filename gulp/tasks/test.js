(function() {
	'use strict';
	var fs = require('fs');
	var path = require('path');
	var hogan = require('hogan.js');
	var glob = require('glob');

	module.exports = function(gulp, plugins, C) {

		gulp.task('list', function() {
		});

		// Generates wct.config.json on the fly based on env variables
		gulp.task('test:config', function() {
			var templateString = fs.readFileSync(path.join(C.TEMPLATES,'test_index_template.html')).toString('utf8');
			var template = hogan.compile(templateString);
			var data = {
				environmentScripts: [],
				suites: []
			};

			// Add js to turn on shadow DOM at the top of the test
			if(process.env.SHADOW) {
				data.environmentScripts.push('useShadow.js');
			}

			var suites = C.TEST_SUITES[process.env.TEST_SUITE || 'default'];
			data.suites = glob.sync(suites, {cwd: C.TEST, ignore: 'index.html'});
			var contents = template.render(data);
			fs.writeFileSync(path.join(C.TEST, 'index.html'), contents);
		});

		// Adds wct tasks
		require('web-component-tester').gulp.init(gulp, ['test:config']);

		// Alias for test:local
		gulp.task('test', ['test:local']);
	};
})();
