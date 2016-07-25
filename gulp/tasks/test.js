(function() {
	'use strict';
	var fs = require('fs');
	var path = require('path');

	module.exports = function(gulp, plugins, C) {

		// Generates wct.config.json on the fly based on env variables
		gulp.task('test:config', function() {
			var newCfg = JSON.parse( fs.readFileSync(path.join(C.TEMPLATES,'wct_conf_base.json')) );

			// Add js to turn on shadow DOM at the top of the test
			if(process.env.SHADOW) {
				newCfg.clientOptions.environmentScripts.push('strand/test/useShadow.js');
			}

			// Overwrites suites setting if using a suite configured in env.js
			if(process.env.TEST_SUITE) {
				newCfg.suites = C.TEST_SUITES[process.env.TEST_SUITE];
			}

			var contents = JSON.stringify(newCfg);

			fs.writeFileSync(path.join(C.ROOT, 'wct.conf.json'), contents);
		});

		// Adds wct tasks
		require('web-component-tester').gulp.init(gulp, ['test:config']);

		// Alias for test:local
		gulp.task('test', ['test:local']);
	};
})();
