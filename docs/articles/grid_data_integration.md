# Data Integration with mm-grid

## Basic Data Integration
It is quite straightforward to get an array of data into the grid. And because of 2-way binding, there are no render or update methods to worry about. Any changes to your data will automatically be reflected in the grid.

### Example
Given an array of data like this:

```javascript
	var userData = [{
		first_name: "First",
		last_name: "Last",
		email: "test@example.com"
	}, ... ];
```
All we have to do is assign the "userData" array to the `data` property on the grid like so:

```javascript
	window.addEventListener("WebComponentsReady", function() {
		document.getElementById("mm-grid").data = userData;
	});
```

This will kick off the grid lifecycle and generate our item-recycled grid-items!


## Data Components
`mm-grid` plays nicely with our set of [data components](article_data_comps_intro.html). With two-way binding we eliminate the boilerplate code that would be required to wire these components together. All that is required is a bit of up-front configuration. In order to get an understanding of how data components work, please read more about using them [here](article_data_comps_intro.html).

### Searchable Grid Example
Let's imagine that we have a service that provides a collection of "users" that we can retrieve. We can easily set up a searchable grid. We will add an `mm-collection` — configured to retrieve what we need, our `mm-grid` — configured to display the data fields we need, and an `mm-input` with its value bound to our mm-collection's `<queryParam>` tags. Changes to the input value will automatically trigger a change in the collection, which will fetch the appropriate results and update the grid — all through two-way binding.

```html
	<template is="dom-bind">
		<mm-input value="{{terms}}"></mm-input>

		<mm-collection data="{{data}}" index="{{page}}" auto>
			<get>
				<urlParam>users</urlParam>
				<queryParam name="first_name" value="{{terms}}">
				<queryParam name="last_name" value="{{terms}}">
			</get>
		</mm-collection>

		<mm-grid data="{{data}}" index="{{page}}">
			<mm-grid-column field="first_name">First Name</mm-grid-column>
			<mm-grid-column field="last_name">Last Name</mm-grid-column>
			<mm-grid-column field="email">Email</mm-grid-column>
		</mm-grid>
	</template>
```

Data components also have the ability to take care of things like paging in the grid. As a user scrolls down the grid, the collection will automatically fetch the next set of results to display. This is handled by binding the `index` properties of the collection and grid together (as seen above).

### Sortable Grid Example
Another grid use case that ties in nicely with data components is sorting. Like searching, it can be achieved solely by two-way binding. Adding the appropriate binds to the `sort-order` and `sort-field` attributes on the grid, and enabling the `sort` flags on the desired grid-columns will get this running. Example below:

```html
	<template is="dom-bind">
		<mm-collection data="{{data}}" index="{{page}}" auto>
			<get>
				<queryParam name="sort" value="{{sortField}}"></queryParam>
				<queryParam name="sort_order" value="{{sortOrder}}"></queryParam>
			</get>
		</mm-collection>

		<mm-grid data="{{data}}" index="{{page}}" sort-field="{{sortField}}" sort-order="{{sortOrder}}">
			<mm-grid-column field="first_name" sort>First Name</mm-grid-column>
			<mm-grid-column field="last_name" sort>Last Name</mm-grid-column>
			<mm-grid-column field="email">Email</mm-grid-column>
		</mm-grid>
	</template>
```

When a user clicks on a sort enabled column, the grid will update its `sort-field` attribute with that column's `sort-field` attribute if it exists, or default to the `field` attribute that was set on it. In the example above clicking on the "First Name" column set the grid's `sort-field` to "first_name".

#### Continue Reading &#8594; [Creating Custom Grid Items](article_grid_custom_grid_item.html)
