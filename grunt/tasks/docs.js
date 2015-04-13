var marked = require('marked');

function lookupArticle(list, key) {
	for(var i=0; i<list.length; i++) {
	 	if (list[i].key === key) {
	 		return list[i];
	 	}
	 }
	 return null;
}

module.exports = function(grunt) {

	grunt.registerTask('docs', function() {
		var modules = grunt.file.expand({cwd: "src"}, "mm-*/doc.json"),
			articles = grunt.file.expand({cwd: "src"}, "articles/*.md"),
			articleMap = grunt.file.readJSON("src/articles/manifest.json"),
			mcheck = grunt.file.expand({cwd: "src"}, "mm-*/"),
			moduleDoc,
			moduleConfig,
			examplePath,
			moduleList = [],
			articleList = [],
			tasks = [];


		if (mcheck.length !== modules.length) {
			grunt.log.error("Documentation missing for some modules!!");
		}

		moduleList = modules.map(function(item){
			return {name: item.replace("/doc.json", "")};
		});

		articleList = articles.map(function(article) {
			var file = grunt.file.read("src/" + article),
				first = file.split("\n")[0],
				tmpPath = article.split("/"),
				key = tmpPath[tmpPath.length-1].replace(".md",""),
				link = "article_" + tmpPath[tmpPath.length-1].replace(".md",".html");
			return {
				key: key,
				name: first.replace("#",""),
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

		modules = modules.map(function(doc) {
			moduleDoc = grunt.file.readJSON("src/" + doc);
			moduleConfig = {
				options: {
					data: {},
					usePartials:'grunt/templates/docs/*.html'
				},
				files: {}
			};
			examplePath = "src/" + doc.split("doc.json").join("example.html");

			if (grunt.file.exists(examplePath)) {
				moduleDoc.example = grunt.file.read(examplePath);
			} else {
				grunt.log.error("example.html missing for " + doc);
			}
			if (moduleDoc.articles) {
				moduleDoc.articles = moduleDoc.articles.map(function( articleName ) {
					 return lookupArticle(articleList, articleName);
				});
			}

			moduleDoc.revision = "<%= pkg.version %>";
			moduleDoc.modules = moduleList;
			moduleDoc.articleList = articleList;
			moduleDoc.articleMap = articleMap;
			moduleConfig.files['build/docs/'+moduleDoc.name+'.html'] = 'grunt/templates/docs/template.html';
			moduleConfig.options.data = moduleDoc;

			grunt.config.set(["hogan_static","docs_"+moduleDoc.name], moduleConfig);
			tasks.push("hogan_static:docs_"+moduleDoc.name);

			return {name: moduleDoc.name};
		});

		articles.forEach(function(article) {
			var s = article.split("/"),
				articleName= s[s.length-1].replace(".md",""),
				articleBody = "",
				articleData = {},
				articleConfig = {
					options: {
						data:{},
						usePartials:'grunt/templates/docs/*.html'
					},
					files:{}
				};

			if (grunt.file.exists("src/" + article)) {
				articleBody = grunt.file.read("src/" + article);
				articleBody = marked(articleBody);

				//Special Case for our index page
				if (article === "articles/getting_started.md") {
					grunt.config.set("indexContent", articleBody);
				}
			}

			articleData = {
				name: articleName,
				revision: "<%= pkg.version %>",
				modules: moduleList,
				articleList: articleList,
				articleMap: articleMap,
				article: articleBody
			};

			articleConfig.files['build/docs/'+'article_'+articleName+'.html'] = 'grunt/templates/docs/article_template.html';
			articleConfig.options.data = articleData;

			grunt.config.set(["hogan_static","article_" + articleName], articleConfig);
			tasks.push("hogan_static:article_"+articleName);
		});

		grunt.config.set(["hogan_static","docs","options","data","modules"], modules);
		grunt.config.set(["hogan_static","docs","options","data","articleMap"], articleMap);
		tasks.push("sass:docs");
		tasks.push("hogan_static:docs");
		grunt.task.run(tasks);
	});

	grunt.config.set("hogan_static.docs", {
		options: {
			data: {
				modules: [],
				articles: [],
				revision: "<%= pkg.version %>",
				article: "<%= indexContent %>"
			},
			usePartials: 'grunt/templates/docs/*.html',
		},
		files: {
			'build/docs/index.html':'grunt/templates/docs/article_template.html'
		}
	});

};
