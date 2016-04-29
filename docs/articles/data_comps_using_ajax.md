# Using strand-ajax

## Overview 
Strand-Ajax is an extremely low level wrapper for the base XMLHttpRequest object present in all modern browsers. It exposes this functionality and accounts for some of the more common serialization scenarios in a matter consistent with jQuery's serialize method, as well as having higher level abstractions for resetting the request and managing raw inputs such as headers. See the [component documentation page](strand-ajax.html) for more details.

Generally end developers should use Strand-Sync in nearly all cases.

## Examples

It is possible to use strand-ajax in a variety of possible scenarios. Let's walk through 2 of the more common.

Using strand-ajax for a simple get request using markup for configuration.

```html
<strand-ajax id="simpleGet" url="http://example.com/api" method="get"></strand-ajax>
<script>
window.addEventListener("WebComponentsReady", function() {
	document.querySelector("#simpleGet").exec();
});
</script>
```

The example above is probably the simplest case for an Ajax component. It makes a simple get request as soon as the component has loaded and the URL and method are configured via markup flags.

Unfortunately in this example our data is going nowhere.  Let's do something with the data by adding a 2-way bind to an [auto binding template](http://polymer-project.org).

```html
<template is="dom-bind">
	<strand-ajax id="simpleGet" url="http://example.com/api" method="get" response="{{response}}"></strand-ajax>
	<div>{{response}}</div>
</template>
```

As you can see we are now dumping the response object into a div.  Since this is likely a parsed JavaScript object (in modern APIs) this wont be terribly useful for our application, but depending on the response binding into sub-properties will be.

Another common usage scenario for Ajax requests is to instantiate them entirely via JS. Strand exposes a set of Javascript only AJAX objects which are intended to be used from inside model and collection objects to avoid the overhead of instantiating an HTMLElement object just to get child data in complex server scenarios.
	
```Javascript
var ajax = new StrandLib.Ajax();
ajax.addParam(DataUtils.param("test",1234)); 
ajax.exec(null, {
	method:StrandLib.Ajax.POST,
	url:"http://www.example.com/api"
}).then(function(result) {
	console.log(result.response);
});
```
