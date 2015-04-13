# Using MM-Ajax

##Overview 
MM-Ajax is an extremely low level wrapper for the base XMLHttpRequest object present in all modern browsers. It exposes this functionality and accounts for some of the more common serialization scenarios in a matter consistent with jQuery's serialize method. as well as having higher level abstractions for resetting the request and managing raw inputs such as headers. See the [component documentation page](mm-ajax.html) for more details.

##Examples

It is possible to use mm-ajax in a variety of possible scenarios. Lets walk through 2 of the more common.

Using mm-ajax for a simple get request using markup for configuration.

```html
<mm-ajax id="simpleGet" url="http://example.com/api" method="get"></mm-ajax>
<script>
window.on("polymer-ready", function() {
	document.querySelector("#simpleGet").exec();
});
</script>
```

the example above is probably the simplest case for an ajax component. It makes a simple get request as soon as the component has loaded and the url and method are configured via markup flags.

Unfortunately in this example our data is going nowhere.  Lets do something with the data by adding a 2-way bind to an [auto binding template](http://polymer-project.org).

```html
<template is="auto-binding">
	<mm-ajax id="simpleGet" url="http://example.com/api" method="get" response="{{response}}"></mm-ajax>
	<div>{{response}}</div>
</template>
```

As you can see we are now dumping the response object into a div.  Since this is likely a parsed javascript object (in modern apis) this div will actually render [Object object]. It is possible to observe raw JSON for debugging by piping the result through a [filter method.](http://polymer-project.org)

Another common usage scenario for ajax requests is to instantiate them entirely via JS. Because polymer allows exposing component constructors it is possible to create and format the entire request via JS:
	
```Javascript
var ajax = new MMAjax();
ajax.url = "http://www.example.com/api";
ajax.method = ajax.POST;
ajax.addParam(DataUtils.param("test",1234)); //optionally {name:"test",value:1234}
ajax.addEventListener("data-ready", function() { 
	console.log(ajax.result);});
//we also expose a promise based callback system
ajax.promise.then(function() {
	console.log(ajax.result);});
```