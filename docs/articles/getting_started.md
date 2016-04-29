# Getting Started

The Strand Web Components library is built on Google's <a href="https://www.polymer-project.org" target="_blank">Polymer</a>. If you're unfamiliar, get started by reading the Polymer <a href="https://www.polymer-project.org/1.0/docs/devguide/feature-overview.html" target="_blank">API developer guide</a>. The Strand documentation does not attempt to duplicate information which can be found in the Polymer documentation (e.g. component life cycle, etc.). To get started using Strand Web Components in your project, follow the steps below:

## Latest Version

Install the latest version of Strand Web Components.

```
$ bower install strand
```

Add the <a href="http://webcomponents.org/polyfills/" target= "_blank">webcomponentsjs</a> polyfills and the Strand library to your `head` tag. 

```html
<script language="javascript" src="bower_components/webcomponentsjs/webcomponents-lite.min.js"></script>
<link rel="import" href="bower_components/strand/dist/strand.html"/>
```

Start adding web component tags to your markup or template wherever you would like the component to render (see the specific details for each component). Here's how you would add a strand-button:

```html
<strand-button id="coolBtn">
	<label>Hi There</label>
</strand-button>
```

To add an event trigger for when all Polymer elements on the page have been upgraded and are ready to use, try the following:

```javascript
window.addEventListener("WebComponentsReady", function() { 
	// Your web components are ready!
	// Do whatever you need to do here.
	var coolBtn = document.querySelector("#coolBtn");
	
	coolBtn.addEventListener("click", function(e) {
		console.log("coolBtn clicked!");
	});
});
```

## Migrating to Polymer 1.0

Strand is now built on <a href="https://www.polymer-project.org/1.0/docs/">Polymer 1.0</a>. For details on breaking changes to the Strand APIs, see our <a href="article_migration_guide.html">Migration guide</a>. For breaking changes between the 0.5 and 1.0 release of Polymer, see the <a href="https://www.polymer-project.org/1.0/docs/migration.html">Polymer migration guide</a>.

## Specific Version

For production applications, we'd recommend using a fixed version of the Strand library.

```
$ bower install strand#<version>
```