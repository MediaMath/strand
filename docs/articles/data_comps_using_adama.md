# Using MM-Adapter-Adama

##Overview

While adapters extend MM-Sync and can certainly be used for simple I/O tasks on their own, this guide will primarily consider their intended usage a child component instantiated by an [mm-model](mm-model.html) or [mm-collection](mm-collection.html). 

Please note that adapters are intentionally not included in the HTML import dependency mapping of either the collection or model components to reduce overall size in cases where some adapters would be redundant.  When using the library import directly this is irrelevant as the adapters are included by default, but when including data components directly in your project it is necessary to import any adapters directly in addition to the data component you intend to use or the component will throw an instantiation error.

## Using mm-adapter-adama

### Instantiating

The adama adapter is not intended to be used directly, rather it should be used by specifying the `adapter` property on an mm-model or mm-collection.  This string should match the constructor attribute of the adapter you intend to inflate. For the adama adapter the constructor is `MMAdapterAdama`.

```html
<mm-model adapter="MMAdapterAdama"></mm-model>
```

### Specifying Options

Because the adama adapter is housed solely inside of the parent component there are a limited number of ways to pass information to the adapter.

* dom -- via lightDOM markup passed through the container class
* js -- via the `connection` property on mm-model and mm-collection (note that this is named oddly to avoid a namespace collision with the adapter string since attributes are shared between JS and markup)

To specify options via DOM, pass options as tags via the light dom:

```html
<mm-model adapter="MMAdapterAdama">
	<entity>campaigns</entity>
</mm-model>
```

To specify options via JS, pass options either directly to the adapter or to its underlying input and output arrays (see [mm-sync](article_data_comps_using_sync.html) for more information)

```javascript
var model = document.querySelector("mm-model");
model.connection.entity = "campaigns";
```

### Converting an adama URL to options markup

Given a fairly robust adama URL it is possible to break this down into entirely markup based constraints for the adapter:

```
https://t1qa2.mediamath.com/api/v2.0/campaigns/limit/advertiser.agency.organization=100048?with=advertiser%2Cagency&with=rpt_margin_management_partial&with=budget_flights&full=*&sort_by=-status%2C-updated_on%2Cid&order_by=descending&currentTime=1422314276036&page_limit=10&page_offset=0
```

Lets start with the API version:

//t1qa2.mediamath.com/api/**v2.0**/

```html
<mm-collection>
	<version>v2.0</version>
</mm-collection>
```

From the url we determine that the entity is `campaigns`

//t1qa2.mediamath.com/api/v2.0/**campaigns**/

```html
<mm-collection>
	<version>v2.0</version>
	<entity>campaigns</entity>
</mm-collection>
```

Next lets handle the foreign key limiting clause:

//t1qa2.mediamath.com/api/v2.0/campaigns/limit/**advertiser.agency.organization=100048**?

Since this is a fairly common foreign key relationship, the built in routing behavior should be able to handle this.  The org id is also cached from previous component based calls and thus is not needed unless it has not been specified in a component call.

```html
<mm-collection>
	<version>v2.0</version>
	<entity>campaigns</entity>
	<useLimit>true</useLimit>
</mm-collection>
```

If it is necessary to manually specify the limit string it is also possible to pass this directly to the adapter:

```html
<mm-collection>
	<version>v2.0</version>
	<entity>campaigns</entity>
	<useLimit>advertiser.agency.organization=100048</useLimit>
</mm-collection>
```

Continuing in order lets tackle the `with` part of the query string. As we see in the url there are several with parameters. We can specify each as its own node to get the same result. In some cases in adama with params of related types are separated with a comma--and should be contained within a single dom node. 

?**with=advertiser%2Cagency&with=rpt_margin_management_partial&with=budget_flights**&full=*


```html
<mm-collection>
	<version>v2.0</version>
	<entity>campaigns</entity>
	<useLimit>true</useLimit>
	<with>advertiser,agency</with>
	<with>rpt_margin_management_partial</with>
	<with>budget_flights</with>
</mm-collection>
```
Next lets tack on the relatively straightforward `full` attribute. this is generally always an entity name or a * for all fields in the given related entities.

&with=budget_flights&**full=&ast;**&sort_by

```html
<mm-collection>
	<version>v2.0</version>
	<entity>campaigns</entity>
	<useLimit>true</useLimit>
	<with>advertiser,agency</with>
	<with>rpt_margin_management_partial</with>
	<with>budget_flights</with>
	<full>*</full>
</mm-collection>
```

Sorting is slightly less complicated than in most T1 based scenarios.  The current T1 code generates a useless parameter `order_by` which is not actually used by adama.  

&**sort_by=-status%2C-updated_on%2Cid**&order_by=descending&currentTime=1422314276036

The minus `-` in adama urls specifies descending, and the lack of a minus is assumed to be ascending. We follow similar defaults in the component markup, feel free to specify ascending as a node attribute for clarity, but only 'descending' is actually used when formatting the url.

```html
<mm-collection>
	<version>v2.0</version>
	<entity>campaigns</entity>
	<useLimit>true</useLimit>
	<with>advertiser,agency</with>
	<with>rpt_margin_management_partial</with>
	<with>budget_flights</with>
	<full>*</full>
	<sort descending>status,updated_on</sort>
</mm-collection>
```

Note that a `-` in an existing sort is left alone, but the parent node may place a 2nd `-` in the node value if already specified.

Next we have the cacheBuster--this is generated automatically by mm-sync, if you wish to disable it specify `connection.cacheBuster=false;` if you wish to alter the parameter name used for the buster you may also set this as a string value `connection.cacheBuster="imABusterIRL";`

Finally, lets take a look at the paging params.  Paging is handled at the collection level and the params are passed through to the component. While adding them as dom nodes is supported, its just as easy to create binds at the collection level.  Models do not support paging for obvious reasons.

&currentTime=1422314276036&**page_limit=10&page_offset=0**

```html
<mm-collection page="0" pageSize="10">
	<version>v2.0</version>
	<entity>campaigns</entity>
	<useLimit>true</useLimit>
	<with>advertiser,agency</with>
	<with>rpt_margin_management_partial</with>
	<with>budget_flights</with>
	<full>*</full>
	<sort descending>status,updated_on</sort>
</mm-collection>
```

An important note about converting the page numbers from an adama URL to mm-collection markup. In adama the `page_offset` is the number of the record you want the query to start at. So if your page width was 10 and you want the 2nd page of requests your `page_offset` would be 10. In the adapter we use just a simple page count and then calculate this number behind the scenes. If you want the 2nd page you would just specify '1' (zero indexed) as your page.  Page Limit translates directly to pageSize so no conversion is necessary for that parameter.
