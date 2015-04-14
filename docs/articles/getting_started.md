# Getting Started

The MediaMath Web Components library is built on Google's Polymer platform. Get started by reading the <a href="http://polymer-project.org" target="_blank">Google Polymer documentation</a>, which will demistify much about web components and general approach. Our documentation (intentionally) does not duplicate information which can be found in the Google Polymer documentation. Follow the steps below to begin using the MediaMath Web Components in your project.

Add the Polymer <a href="http://www.polymer-project.org/docs/start/platform.html" target="_blank">Platform</a> script tag to your `head` element.

```html
<script language="javascript" src="//wc.mediamath.com/loader.js?p=compass"></script>
```

Start adding web component tags to your markup or template wherever you would like the component to render (see the specific details for each component).

```html
<mm-button>
	<label>Hi There</label>
</mm-button>
```

If you need an event trigger for when all polymer elements present on a page have been 'upgraded' and are ready to use, try the following:

```javascript
window.addEventListener("polymer-ready", function() { 
	// your web components should be ready
	// do whatever you need to do here!
});

```

If you would like to link to a specific version of the framework (reccomended for production applications) use the following:

Add the <a href="http://webcomponents.org/polyfills/" target="_blank">webcomponentsjs</a> script tag to your `head` element.
```html
<script language="javascript" src="//wc.mediamath.com/{{revision}}/webcomponents.min.js?p=compass"></script>
```

Add the HTML import for the mm web components library to your head element.
```html
<link rel="import" href="//wc.mediamath.com/{{revision}}/lib.html"/>
```


