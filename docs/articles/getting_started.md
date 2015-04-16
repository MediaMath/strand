# Getting Started

The Strand Web Components library is built on Google's <a href="https://www.polymer-project.org" target="_blank">Polymer</a>. If you're unfamiliar, get started by reading the Polymer <a href="https://www.polymer-project.org/docs/polymer/polymer.html" target="_blank">API developer guide</a>, which will demystify much about Strand's design philosophy and general approach. The Strand documentation does not attempt to duplicate information which can be found in the Polymer documentation (e.g. component life cycle, etc.). To get started using Strand Web Components in your project, follow the steps below:

## Latest Version

Install the latest version of Strand Web Components.

```
$ bower install strand
```

Add the <a href="http://webcomponents.org/polyfills/" target= "_blank">webcomponentsjs</a> polyfills and the Strand library to your `head` tag. 

```html
<script language="javascript" src="bower_components/webcomponentsjs/webcomponents.min.js"></script>
<link rel="import" href="bower_components/strand/dist/strand.html"/>
```

Start adding web component tags to your markup or template wherever you would like the component to render (see the specific details for each component). Here's how you would add a mm-button:

```html
<mm-button id="coolBtn">
	<label>Hi There</label>
</mm-button>
```

To add an event trigger for when all polymer elements on the page have been upgraded and are ready to use, try the following:

```javascript
window.addEventListener("polymer-ready", function() { 
	// Your web components are ready!
	// Do whatever you need to do here.
	var coolBtn = document.querySelector("#coolBtn");
	
	coolBtn.addEventListener("click", function(e) {
		console.log("coolBtn clicked!");
	});
});
```

## Specific Version

For production applications, we'd recommend using a fixed version of the Strand library.

```
$ bower install strand#<version>
```