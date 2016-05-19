# Creating Adapters

## Overview

Adapters in general should extend strand-sync, or implement an API consistent with sync's to work with models/collections (notably post, get, etc).  Sync should provide most of the functionality needed to handle a standard RESTful API, but for more complicated use cases there are internal methods designed to be overwritten for marshaling data to and from nonstandard formats. In general adapter design should favor DOM configuration over JavaScript, but both should be accessible.

When `auto` is true on Strand-Sync DOM changes are watched via the `strand-item-notifier` component which dispatches change events for child modification (including due to 2-way binds). Your adapter should de designed with this in mind. We will get into this a little bit later as we look at `getDomParams`

## Publish Block (Defaults)

Strand-Sync exposes a large number of properties that can affect how it consumes and uses data.  In general most of these need to be explicitly set in your adapter to define the behavior you want.

Some common params that you will want to tweak:

```javascript
cacheBuster:"nowTime", //specify the cache buster string if any
cacheCsrf: true, //store the CSRF header (following mm standard) in localstorage
cacheGlobals: true, //cache properties saved via setGlobal getGlobal on sync in localstorage
withCredentials: true, //set this if you are doing any sort of XHR + CORS with ssl
autoIgnoreNodes:["sort","search"], //tells sync which DOM nodes to ignore for automatically updating when auto is true
```

## Working with DOM

Commonly you will want to address any query configuration for your API via DOM so that it is 2-way bindable from other components:

```html
<strand-model>
	<someConfig conf>things</someConfig>
</strand-model>
```

this means that someone can easily bind into your data config from user driven components

```html
<strand-input value="{{stuff}}"
<strand-model>
	<someConfig conf>{{stuff}}</someConfig>
</strand-model>
```

### DomReady

First, make sure that you have overloaded the `domReady` method from sync and are calling `this.super()` in your overloaded method.  This is necessary due to the vagaries of Polymer's inheritance where lifecycle methods are not passed to the subclass without an overload.

```javascript
	domReady: function() {
		this.super();
	},
```

Now that we have listeners in place, let's look at how to actually work with the user manipulated lightDOM.

### Handle Ignored Nodes

Configuring the adapter via DOM is useful even for JS driven calls to `get` or `post`

Strand-Sync provides a bare method called `handleIgnoredNode` which is called whenever the node name of the changed node matches one of the strings found in the `autoIgnoreNodes` array in the publish block.

The method is passed a reference to the node itself (or its parent if its a text node) as well as a boolean which is true when the node in question is a text node (useful for filtering out value only changes, but still knowing which param should be updated).

So far the only actual use case for this type of filtering has been dealing with sorting params changing when in a collection that is using paging. Because the fetching behavior is already triggered by the page being reset to 0, we intentionally ignore these nodes to avoid causing a double call.

```javascript
handleIgnoredNode:function(node, isTextNode) {
	//do things about paging
}
```

### Managing adapter via DOM params

For ordinary DOM param manipulation cases we handle updating our internal params in a single method called `getDomParams`.  This method is called when the lightDOM params are updated by either binds or modifications via JS DOM manipulation to any of the config nodes. By default this method will parse `<input-params>` and `<output-params>` tags as well as associated header, query and URL children.  In general your API wrapper should provide tags that are consistent with the API's design to ease the overall usage of your adapter.

As you can see by looking at the strand-sync source, the parent method returns a domProps object that has already been parsed from the lightDOM so the only task required in this method is to map the nodes (by name) into their respective input and output arrays of params.  The call method is also provided as a `mode` string which can be used to ignore some params that are bound to a specific mode of operation.

A note about the input and output params.  As we saw in [strand-sync](article_data_comps_using_sync.html) there are 2 arrays for managing URL, query and header params in each 'direction' of data traffic.

We reserve `this.inputParams` and `this.outputParams` for direct JavaScript usage by the developer. This means that we must use an internal property to actually set our combined params.  By convention we define this as `this._inputParams` and `this._outputParams`.

Please avoid tampering with the developer's JS settings where possible.  If `this.super()` is called at the beginning of this method, the developer specified params should be merged and available at runtime in the underscored array if any modification is necessary.

Here is an example of a custom API definition using `getDomParams`

```javascript
getDomParams: function(mode) {
	var domProps = this.super();
	if (mode === "get" && this.targetType === "collection") {
		if (domProps.searchQuery) {
			domProps.searchQuery.forEach(function(search) {
				this._inputParams.queryParams.push(DataUtils.param("search", search.inner));
			});
		}
	}
}
```

## Working with Data

In simple cases where the API returns a straightforward JSON format with no additional serialization necessary there will be no need for this section. For other use cases where the API returns data in a format that needs to be transformed before it is usable by a client side developer there are a built in set of transform methods that are called on both input and output of data.

### Models

When deserializing the API data into a usable data format, `setModelData` should be used.  This is called by sync as part of the response handling so no additional work is required.

```javascript
setModelData: function(model, result) {
	//stuff our API respond into model.data here
	//return is ignored
},
```

Conversely if it is necessary to transform the data prior to sending it to the server (in a consistent manner--individual view transforms can be handled by piping a bound dataset through a filter) `getModelData` may be overloaded and used to generate a new format or ignore certain properties that the server cannot handle.

```javascript
getModelData: function(model) {
	//return model.data or marshaled version of model.data as necessary.
}
```

### Collections

Similarly for collections it may be necessary to transform the API format into a nested set of strand-model objects or similar depending on your use case. By default strand-sync will attempt to marshall any objects it finds in an array formatted response into strand-model objects, but additional or more specific work may be required in certain cases. Additionally when paging is enabled the setter method gets an additional paging object that tells this method where to place the data in the collection.

```javascript
setCollectionData: function(collection, response, paging) {
	//marshall server response into collection.data using paging.page and paging.pageSize as necessary
}
```

When marshaling back to server format it is also necessary to unstack any model.data properties back to plain objects. Similar to `getModelData`, this method expects the return to be an array of server format marshaled objects or string data.

```javascript
getCollectionData: function(collection) {
	//unstack any strand-models into normal objects
	//return collection.data.map(function(model) {
		model.toJSON();
	})
}
```
