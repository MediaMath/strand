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
		var modules = grunt.file.expand("mm-*/doc.json"),
			articles = grunt.file.expand("articles/*.md"),
			articleMap = grunt.file.readJSON("articles/manifest.json"),
			mcheck = grunt.file.expand("mm-*/"),
			moduleDoc,
			moduleConfig,
			examplePath,
			moduleList = [],
			articleList = [],
			tasks = ["git_tag_parse"];

		if (grunt.config.get("docsLocal") !== true) {
			grunt.config.set("docsLocal", false);
		}

		if (mcheck.length !== modules.length) {
			grunt.log.error("Documentation missing for some modules!!");
		}

		moduleList = modules.map(function(item){
			return {name: item.replace("/doc.json", "")};
		});

		articleList = articles.map(function(article) {
			var file = grunt.file.read(article),
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
			moduleDoc = grunt.file.readJSON(doc);
			moduleConfig = {
				options: {
					data: {},
					usePartials:'build/docs/*.html'
				},
				files: {}
			};
			examplePath = doc.split("doc.json").join("example.html");

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

			moduleDoc.docsLocal = grunt.config.get("docsLocal");
			moduleDoc.revision = "<%= meta.revision%>";
			moduleDoc.modules = moduleList;
			moduleDoc.articleList = articleList;
			moduleDoc.articleMap = articleMap;
			moduleConfig.files['docs/'+moduleDoc.name+'.html'] = 'build/docs/template.html';
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
						usePartials:'build/docs/*.html'
					},
					files:{}
				};

			if (grunt.file.exists(article)) {
				articleBody = grunt.file.read(article);
				articleBody = marked(articleBody);

				//Special Case for our index page
				if (article === "articles/getting_started.md") {
					grunt.config.set("meta.indexContent", articleBody);
				}
			}

			articleData = {
				name: articleName,
				docsLocal: grunt.config.get("docsLocal"),
				revision: "<%= meta.revision%>",
				modules: moduleList,
				articleList: articleList,
				articleMap: articleMap,
				article: articleBody
			};

			articleConfig.files['docs/'+'article_'+articleName+'.html'] = 'build/docs/article_template.html';
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

	grunt.registerTask("docs_local", function() {
		grunt.config.set("docsLocal", true);
		grunt.task.run(["docs"]);
	});

	grunt.config.set("sass.docs", {
		options: {
			style: 'compressed',
			includePaths: ["bower_components/bourbon/app/assets/stylesheets/"]
		},
		files: {
			'docs/docs.css':'build/docs/docs.scss'
		}
	});

	grunt.config.set("hogan_static.docs", {
		options: {
			data: {
				modules: [],
				articles: [],
				docsLocal: "<%= docsLocal %>",
				revision: "<%= meta.revision%>",
				article: "<%= meta.indexContent%>"
			},
			usePartials: 'build/docs/*.html',
		},
		files: {
			'docs/index.html':'build/docs/article_template.html'
		}
	});

};
