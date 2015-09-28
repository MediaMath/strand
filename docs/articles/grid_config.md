#Configuring mm-grid

##Overview
`mm-grid` has a small set of configuration settings that are required in order to get it up and running. In order to create a basic grid we will first create an `<mm-grid>` custom element. On its own the grid cannot do much. We need to define what fields of our dataset that we want to display. We achieve this by adding `<mm-grid-column>` elements to our grid.

###mm-grid-column
`<mm-grid-column>` has an attribute `field` which maps to the fields or "keys" in our data objects. Defining a grid-column also has the benefit of rendering a human readable title into the header of our grid. This is achieved by adding a column title to the HTML content or "label" attribute of a grid-column.

Let's imagine a dataset of users that has the fields "first_name", "last_name", and "email". We would define our grid like so:

```html
	<mm-grid>
		<mm-grid-column field="first_name">First Name</mm-grid-column>
		<mm-grid-column field="last_name">Last Name</mm-grid-column>
		<mm-grid-column field="email">Email</mm-grid-column>
	</mm-grid>
```

For multi-line headers you can either add `<br/>` tags to the HTML content or `\n` newline characters to the `label` attribute like this:

```html
	<mm-grid>
		<mm-grid-column field="first_name">First<br/>Name</mm-grid-column>
		<mm-grid-column field="last_name" label="Last\nName"></mm-grid-column>
	</mm-grid>
```

This is one of the most basic forms of the grid we can generate. However, it is not hooked up to any data source - which we will cover in another tutorial.


##Configuration Continued

###mm-grid Attributes
The grid has some other settings that make it really easy to get up and running with some common use-cases.

A common case we encounter with grids is being able to select a range of items within the grid. `mm-grid` makes this extremely simple - by adding a `selectable` boolean flag to your grid like so:

```html
	<mm-grid selectable></mm-grid>
```

This will enable a `<mm-checkbox>` on all grid-items. As you select items in the grid, the `selected` field on the grid will be populated with an up to date array of selected data objects. For example:

```javascript
	document.querySelector("mm-grid").selected = [...];
```

In much the same way, grid has an `expandable` flag. This will enable a clickable "carat" on all grid-items that will toggle an "expanded" flag on each data object. This can be used to show/hide more detailed information related to each grid-item.

```html
	<mm-grid expandable></mm-grid>
```

###mm-grid-column Attributes
`mm-grid-column` has a number of additional attributes to configure built-in functionality. 

####Width
The `width` attribute accepts a string which defines the width of a column. Use this to define a column with a fluid width percentage or fixed width in pixels.
```html
	<mm-grid-column width="20%"></mm-grid-column>
	<mm-grid-column width="200px"></mm-grid-column>
```

####Align
The `align` attribute will align the contents of the column header and the column data. Valid values are "left" or "right" (defaults to "left").

####Resize
The `resize` flag will enable the resize functionality of a grid-column. This will activate a draggable area on the right side of the column header. (Note - currently fluid width columns will be converted to fixed width upon resizing)

####Sort
The `sort` flag enables the firing of "column-sort" events. It works in tandem with the `field` and `sort-field` attributes to enable the sorting of data by higher-level components and functions. More about this in the data integration walkthrough.


##Advanced Configuration

###Viewport Width
For grids that need to expand beyond the bounds of their containers / window, there is an attribute called `viewport-width`. This attribute takes a fixed width number in pixels, which will set its internal container width respectively.

```html
	<mm-grid viewport-width="1500"></mm-grid>
```

###Custom Item Templates - mm-grid-item
The grid is quite extendable and can utilize a user-defined template to generate grid items. We recommend utilizing the built-in `mm-grid-item` component, as it works in tandem with the grid. Things like resizable columns, selections, and expansions work out of the box.

In order to use a custom template we define the `item-template` attribute of the grid. This can either be a string with the id of the template we are using, or can point directly to a template DOM fragment. We define the template inside our grid with a `<template>` tag. Here we define an `<mm-grid-item>` with the attributes `model` and `scope`. These are two special attributes that give us a particular grid item's model as well as giving us access to the "scope" of the grid itself.

Defining `<div field="...">` inside of an `mm-grid-item` allows us to override that particular data field's DOM. In the example below we have overridden the "first_name" column with some custom text.

```html
	<mm-grid item-template="customTemplate">
		<mm-grid-column field="first_name">First Name</mm-grid-column>
		<mm-grid-column field="last_name">Last Name</mm-grid-column>
		<mm-grid-column field="email">Email</mm-grid-column>
		
		<template id="customTemplate">
			<mm-grid-item model="{{model}}" scope="{{scope}}">
				<div field="first_name">
					Custom Text - {{model.first_name}}
				</div>
			</mm-grid-item>
		</template>
	</mm-grid>
```

####Continue Reading &#8594; [Data Integration with mm-grid](article_grid_data_integration.html)