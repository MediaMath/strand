# Using strand-sync

## Overview

strand-sync provides a higher level API similar to jQuery or Backbone in terms of having pre-configured XHR calls for the most common RESTful scenarios. Sync is designed heavily around 2-way binding so virtually all of the request params can be manipulated via the DOM (and thus via 2-way binding) as we will see in the examples.

Sync is used as the base class for all 'adapters' which provide API specific implementations of sync that are usable with strand-model and strand-collection.

Unlike strand-ajax which is designed to handle a single call at a time, strand-sync can handle multiple concurrent calls. The default concurrency setting is 4 simultaneous calls, but if more are desired they can be set via the `requestConcurrency` param (either markup or JS).

## Data Configuration

Strand-Sync exposes a `data` property which can be set via JS or bound to to set the request body. This is actually serialized in strand-ajax so if you need to see the serialization code, please check there.

a `url` property is also exposed and can be used to set the base or non-changing part of the URL.  Note that the urlParams are then concatenated into that URL using '/''s per element.

### Param configuration

Sync accepts configuration via tags corresponding to HTTP methods: `<get>`, `<post>`, `<put>`, and `<delete>`. Params can then be passed to Sync as DOM children of those nodes.

Params were designed to give the developer full flexibility over crafting the request arguments. With this in mind the param options were divided into:

* queryParam&thinsp;&mdash;&thinsp;name value pair objects used to generate the queryString
* urlParam&thinsp;&mdash;&thinsp;name only strings concatenated with '/' to generate a URL
* headers&thinsp;&mdash;&thinsp;name value pairs used to send additional metadata (CSRF, etc) to the webserver

### GET example

```html
<strand-sync endpoint="http://example.com">
	<get>
		<queryParam name="q" value="123"/>
		<urlParam>123</urlParam>
		<header name="X-Some-Header">HeaderValue</header>
	</get>
</strand-sync>
```

This will generate a URL for the request of `http://example.com/123/?q=123` and it will send an X-Some-Header: HeaderValue to the server with the request. Note that it is possible to either use a value attribute or to just place the value inside the textContent of a named node. These formats may be used interchangeably.

### POST example
```html
<strand-sync endpoint="http://test.com">
	<post>
		<urlParam>campaigns</urlParam>
		<urlParam>52312</urlParam>
		<header name="X-CSRF-Header">48ccbaffbb0675f2a</header>
	</post>
</strand-sync>
```

Note that we use the urlParam twice&thinsp;&mdash;&thinsp;this may be done for any set of params _N_ number of times as appropriate. Params are parsed top down for API's where the order matters.

It is also possible to pass multiple sets of params to the same element to configure it for general I/O by adding sections at the same level:

```html
<strand-sync>
	<get></get>
	<post></post>
	<put></put>
	<delete></delete>
</strand-sync>
```

## Working with 2-way binding

To support 2-way binding in a scenario using strand-sync we have created the `auto` property. Auto tells strand-sync to respond automatically to data or param changes and make additional requests to sync the data back to the server. Auto may be set via JS or via HTML as an attribute.  Auto has 3 possible values:

*  true `boolean`&thinsp;&mdash;&thinsp;bidirectional sync input/output for any changes
*  load `string`&thinsp;&mdash;&thinsp;only sync data in from server when input params change
*  save `string`&thinsp;&mdash;&thinsp;only sync data in from the server when the data property detects a change&thinsp;&mdash;&thinsp;note that due to Polymer 1.0 data binding limitations you must manually tell Polymer that the data has changed using `set`

```javascript
var sync = document.querySelector("strand-sync");
sync.data.b = 2; //won't be picked up
sync.set('data.b',2); //will be picked up by Polymer
```

### 2-way binding on the input

A fairly common scenario in modern web applications is a user entering search terms into an input and expecting a list of items as output. To accomplish this via strand-sync we would use 2-way binding between the input value and the API specific params.

The following is an example of the simple input scenario using a self binding template.

```html
	<template is="dom-bind">
		<strand-input value="{{search}}"/>
	</template>
```

Now bind this to a sync components params from our earlier example:

```html
	<template is="dom-bind">
		<strand-input value="{{search}}"/>
		<strand-sync endpoint="http://example.com" auto="true">
			<get>
				<queryParam name="q" value="{{search}}"/>
				<urlParam>123</urlParam>
				<header name="X-Some-Header">HeaderValue</header>
			</get>
		</strand-sync>
	</template>
```

When the light DOM queryParam values are changed via 2-way binding, the sync component will pick this up and trigger the requisite `GET` calls to retrieve this query from the server. Note that this input is automatically debounced against keyboard input. If necessary you may vary this timing via the `autoDebounce` property. The default is 200ms.

### 2-way binding on the response

Unfortunately this example does not provide any feedback to the user, but it is possible to easily output this via 2-way binding as well. As mentioned earlier the sync component exposes a bindable `data` property which is used for both input and output of bindable data. By binding this to a repeated template we can show the user a list of items (we assume these objects have a name property) matching their search:

```html
	<template is="auto-binding">
		<input value="{{search}}">
		<strand-sync url="http://example.com" auto="true" data="{{result}}">
			<get>
				<queryParam name="q" value="{{search}}"/>
				<urlParam>123</urlParam>
				<header name="X-Some-Header">HeaderValue</header>
			</get>
		</strand-sync>
		<ul>
			<template is="dom-repeat" items="{{result.list}}">
				<li>{{item.name}}</li>
			</template>
		</ul>		
	</template>
```
