# Configuring strand-grid

## Overview
`strand-grid` has a small set of configuration settings that are required in order to get it up and running. In order to create a basic grid we will first create an `<strand-grid>` custom element. On its own the grid cannot do much. We need to define what fields of our dataset that we want to display. We achieve this by adding `<strand-grid-column>` elements to our grid.

### strand-grid-column
`<strand-grid-column>` has an attribute `field` which maps to the fields or "keys" in our data objects. Defining a grid-column also has the benefit of rendering a human readable title into the header of our grid. This is achieved by adding a column title to the HTML content or "label" attribute of a grid-column.

Let's imagine a dataset of users that has the fields "first_name", "last_name", and "email". We would define our grid like so:

```html
	<strand-grid>
		<strand-grid-column field="first_name">First Name</strand-grid-column>
		<strand-grid-column field="last_name">Last Name</strand-grid-column>
		<strand-grid-column field="email">Email</strand-grid-column>
	</strand-grid>
```

For multi-line headers you can either add `<br/>` tags to the HTML content or `\n` newline characters to the `label` attribute like this:

```html
	<strand-grid>
		<strand-grid-column field="first_name">First<br/>Name</strand-grid-column>
		<strand-grid-column field="last_name" label="Last\nName"></strand-grid-column>
	</strand-grid>
```

This is one of the most basic forms of the grid we can generate. However, it is not hooked up to any data source - which we will cover in another tutorial.


## Configuration Continued

### strand-grid Attributes
The grid has some other settings that make it really easy to get up and running with some common use-cases.

A common case we encounter with grids is being able to select a range of items within the grid. `strand-grid` makes this extremely simple - by adding a `selectable` boolean flag to your grid like so:

```html
	<strand-grid selectable></strand-grid>
```

This will enable a `<strand-checkbox>` on all grid-items. As you select items in the grid, the `selected` field on the grid will be populated with an up to date array of selected data objects. For example:

```javascript
	document.querySelector("strand-grid").selected = [...];
```

In much the same way, grid has an `expandable` flag. This will enable a clickable "carat" on all grid-items that will toggle an "expanded" flag on each data object. This can be used to show/hide more detailed information related to each grid-item.

```html
	<strand-grid expandable></strand-grid>
```

### strand-grid-column Attributes
`strand-grid-column` has a number of additional attributes to configure built-in functionality. 

#### Width
The `width` attribute accepts a string which defines the width of a column. Use this to define a column with a fluid width percentage or fixed width in pixels.
```html
	<strand-grid-column width="20%"></strand-grid-column>
	<strand-grid-column width="200px"></strand-grid-column>
```

#### Align
The `align` attribute will align the contents of the column header and the column data. Valid values are "left" or "right" (defaults to "left").

#### Resize
The `resize` flag will enable the resize functionality of a grid-column. This will activate a draggable area on the right side of the column header. (Note - currently fluid width columns will be converted to fixed width upon resizing)

#### Sort
The `sort` flag enables the firing of "column-sort" events. It works in tandem with the `field` and `sort-field` attributes to enable the sorting of data by higher-level components and functions. More about this in the data integration walkthrough.


## Advanced Configuration

### Viewport Width
For grids that need to expand beyond the bounds of their containers / window, there is an attribute called `viewport-width`. This attribute takes a fixed width number in pixels, which will set its internal container width respectively.

```html
	<strand-grid viewport-width="1500"></strand-grid>
```

#### Continue Reading &#8594; [Data Integration with strand-grid](article_grid_data_integration.html)