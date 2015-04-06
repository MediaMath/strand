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

	grunt.registerTask("build", ["clean","default","docs", "build_status_check", "deploy_docs", "deploy"]);

};
