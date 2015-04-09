module.exports = function(grunt) {
	
	grunt.registerTask("update", function() {
		var done = this.async();
		grunt.log.writeln("updating npm...");
		grunt.util.spawn({
			cmd:"npm",
			args: ["install"]
		}, function(err, result, code) {
			if (!err) {
				grunt.log.ok(result);
				grunt.log.writeln("updating bower...");
				grunt.util.spawn({
					cmd: "bower",
					args: ["install"]
				}, function(err, result, code) {
					if (!err) {
						grunt.log.ok(result);
					} else {
						grunt.log.error(err);
					}
					done();
				});
			} else {
				grunt.log.error(err);
				done();
			} 
		});

	});

	grunt.registerTask("deprecated", function() {
		var files = grunt.file.expand("mm-*/");
		var e = false;
		files.forEach(function(file) {
			var strip = file.slice(0,-1);
			if (grunt.file.exists(file + strip + ".css") && !grunt.file.exists(file + strip + ".html")) {
				grunt.log.writeln(file + " appears to be empty");
				grunt.file.delete(file);
				if (grunt.file.exists(file)) {
					grunt.log.error("Unable to delete " + file);
				} else {
					grunt.log.ok("Deleted "+ file);
				}
				e = true;
			}
		});
		if (!e) {
			grunt.log.ok("No empty module folders were detected...");
		}
	});

	grunt.registerTask('migrate', function() {
		grunt.task.run('clean:src');

		var files = grunt.file.expand(['src/mm-*/*.html', 'src/mm-*/*.scss']),
			content;

		files.forEach(function(file) {
			content = grunt.file.read(file);
			content = content.replace(/\"\.\.\/(bower_components)/gi, '"../../$1');
			content = content.replace(/output\/(mm-[\w-]+)/gi, '$1/$1');
			content = content.replace(/output\/(fonts)/gi, 'shared/fonts/$1');
			content = content.replace(/output\/(\w+)/gi, 'shared/js/$1');
			content = content.replace(/lib\/(\w+)/gi, 'shared/js/$1');
			content = content.replace(/sass\/(_\w+)|.scss/gi, '$1');
			grunt.file.write(file, content);
		});

		grunt.log.ok();
	});

};
