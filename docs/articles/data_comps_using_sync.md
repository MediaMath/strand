# Using mm-sync

## Overview

mm-sync provides a higher level API similar to jQuery or Backbone in terms of having pre-configured XHR calls for the most common RESTful scenarios. Sync is designed heavily around 2-way binding so virtually all of the request params can be manipulated via the DOM (and thus via 2-way binding) as we will see in the examples.

Sync is used as the base class for all 'adapters' which provide API specific implementations of sync that are usable with mm-model and mm-collection.  For more information on extending mm-sync please see [creating adapters](data_comps_creating_adapters.html).

Unlike mm-ajax which is designed to handle a single call at a time, mm-sync can handle multiple concurrent calls. The default concurrency setting is 4 simultaneous calls, but if more are desired they can be set via the `requestConcurrency` param (either markup or JS).

## Data Configuration

MM-Sync exposes a `data` property which can be set via JS or bound to to set the request body. This is actually serialized in mm-ajax so if you need to see the serialization code, please check there.

a `url` property is also exposed and can be used to set the base or non-changing part of the URL.  Note that the urlParams are then concatenated into that URL using '/''s per element.

### Param configuration

Sync's configuration is divided into 2 sets of operations: input and output.  
Input params are used for `GET` requests. Output params are used for `POST`, `PUT`, and `DELETE` requests.

Params were designed to give the developer full flexibility over crafting the request arguments. With this in mind the param options were divided into:

* queryParam -- name value pair objects used to generate the queryString
* urlParam -- name only strings concatenated with '/' to generate a URL
* headers -- name value pairs used to send additional metadata (CSRF, etc) to the webserver

The 'direction' of input or output is relative to the component itself, so when you are pulling data from the server via a get, we consider that 'input' to the component, and the reverse is true for saving/deletion operations.

### Input param example

```html
<mm-sync endpoint="http://example.com">
	<input-params>
		<queryParam name="q" value="123"/>
		<urlParam>123</urlParam>
		<header name="X-Some-Header">HeaderValue</header>
	</input-params>
</mm-sync>
```

This will generate a URL for the request of `http://example.com/123/?q=123` and it will send an X-Some-Header: HeaderValue to the server with the request. Note that it is possible to either use a value attribute or to just place the value inside the body of a named node. These formats may be used interchangeably.

### Output param example
```html
<mm-sync endpoint="http://test.com">
	<output-params>
		<urlParam>campaigns</urlParam>
		<urlParam>52312</urlParam>
		<header name="X-CSRF-Header">48ccbaffbb0675f2a</header>
	</output-params>
</mm-sync>
```

Note that we use the urlParam twice--this may be done for any set of params N number of times as appropriate. Params are parsed top down for API's where the order matters.

It is also possible to set both input and output params on the same element to configure it for general I/O by adding both sections at the same level:

```html
<mm-sync>
	<input-params></input-params>
	<output-params></output-params>
</mm-sync>
```

## Working with 2-way binding

To support 2-way binding in a scenario using mm-sync we have created the `auto` param. Auto tells mm-sync to respond automatically to data or param changes and make additional requests to sync the data back to the server. Auto may be set via JS or via HTML as an attribute.  Auto has 3 possible values:

*  true `boolean` -- bidirectional sync input/output for any changes
*  load `string`-- only sync data in from server when input params change
*  save `string` -- only sync data in from the server when the data property detects a change-- note that due to polymer 1.0 data binding limitations you must manually tell polymer that the data has changed using `set`

```javascript
var sync = document.querySelector("mm-sync");
sync.data.b = 2; //won't be picked up
sync.set('data.b',2); //will be picked up by Polymer
```

### 2-way binding on the input

A fairly common scenario in modern web applications is a user entering search terms into an input and expecting a list of items as output. To accomplish this via mm-sync we would use 2-way binding between the input value and the API specific params.

The following is an example of the simple input scenario using a self binding template.

```html
	<template is="dom-bind">
		<mm-input value="{{search}}"/>
	</template>
```

Now bind this to a sync components params from our earlier example:

```html
	<template is="auto-binding">
		<mm-input value="{{search}}"/>
		<mm-sync endpoint="http://example.com" auto="true">
			<input-params>
				<queryParam name="q" value="{{search}}"/>
				<urlParam>123</urlParam>
				<header name="X-Some-Header">HeaderValue</header>
			</input-params>
		</mm-sync>
	</template>
```

When the lightDOM queryParam values are changed via 2-way binding, the sync component will pick this up and trigger the requisite `GET` calls to retrieve this query from the server.  Note that this input is automatically debounced against keyboard input. If necessary you may vary this timing via the `autoDebounce` property. The default is 200ms.

### 2-way binding on the response

Unfortunately this example does not provide any feedback to the user, but it is possible to easily output this via 2-way binding as well. As mentioned earlier the sync component exposes a bindable `data` property which is used for both input and output of bindable data. By binding this to a repeated template we can show the user a list of items (we assume these objects have a name property) matching their search:

```html
	<template is="auto-binding">
		<input value="{{search}}">
		<mm-sync url="http://example.com" auto="true" data="{{result}}">
			<input-params>
				<queryParam name="q" value="{{search}}"/>
				<urlParam>123</urlParam>
				<header name="X-Some-Header">HeaderValue</header>
			</input-params>
		</mm-sync>
		<ul>
			<template is="dom-repeat" items="{{result.list}}">
				<li>{{item.name}}</li>
			</template>
		</ul>		
	</template>
```