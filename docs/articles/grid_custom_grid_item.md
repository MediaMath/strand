# Creating Custom Grid Items

## Overview
The grid is quite extendable and can utilize a user-defined template to generate grid items. We recommend utilizing the built-in `strand-grid-item` component, as it works in tandem with the grid - re-sizable columns, selections, and expansions work out of the box. However, there will undoubtedly be situations where grid items require a more customized approach. 

### Creating a custom grid item template
In order to use a custom template we create a `template` DOM fragment inside of our `strand-grid` tag. Note that the template tag must include the attribute `preserve-content`, which prevents Polymer from modifying nested `<template/>` elements unintentionally. 

In this example, we define an `<strand-grid-item>` with the attributes `model` and `scope`. These are two special attributes that give us a particular grid item's model as well as giving us access to the "scope" of the grid itself.

Defining `<div field="...">` inside of an `strand-grid-item` allows us to override that particular data field's DOM. In the example below we have overridden the `first_name` column, adding an some custom text, and added a new custom column `star_rating`.

```html
	<strand-grid id="customItems">
		<strand-grid-column field="first_name">First Name</strand-grid-column>
		<strand-grid-column field="last_name">Last Name</strand-grid-column>
		<strand-grid-column field="email">Email</strand-grid-column>
		<strand-grid-column field="star_rating">Star Rating</strand-grid-column>
		
		<template preserve-content>
			<strand-grid-item model="{{model}}" scope="{{scope}}">
				<div field="first_name">
					<span>Star Employee: {{model.first_name}}</span>
				</div>
				<div field="star_rating">
					<template is="dom-repeat" items="{{model.stars}}">
						<strand-icon width="12" height="12" type="favorite"></strand-icon>
					</template>
				</div>
			</strand-grid-item>
		</template>
	</strand-grid>

	<script>
		window.addEventListener("WebComponentsReady", function() {
			var customItems = document.querySelector('#customItems');

			function randomInt(min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			customItems.data = [
				{ 	id:0, 
					first_name: "Bob", 
					last_name: "Smith", 
					email: "bsmith@gmail.com", 
					stars: new Array(randomInt(1,5)) 
				},
				{ 
					id:1, 
					first_name: "Jane", 
					last_name: "Doe", 
					email: "jdoe@gmail.com", 
					stars: new Array(randomInt(1,5))  
				},
				{ 
					id:2, 
					first_name: "Rick", 
					last_name: "James", 
					email: "rjames@gmail.com", 
					stars: new Array(randomInt(1,5))  
				},
				/* more data items here... */
			];
		});
	</script>

```

### Using positionable Strand components in a custom grid item template
When adding some of the web components from the Strand library to a custom grid item, there will be some additional configuration required. Most of the 'positionable' components in the Strand library (see: [strand-popover](strand-popover.html), [strand-tooltip](strand-tooltip.html), and [strand-menu](strand-menu.html)) require that a `target` element be specified. Normally, it is sufficient to simply to supply an id string to this attribute, but custom grid items represent a special case.

#### Adding a target to a positionable component in a custom grid item template
To supply a `target` to a positionable component in a custom grid item, a convenience method is available on all Strand components, called `findById()`. Giving the target element an id. Next, on the positionable element, bind the property `target={{findById('someTargetId')}}`. The positionable component will work as expected within the custom grid item. NOTE: this approach is not necessary when using positionable components outside of a custom grid item template.

```html
	<strand-grid id="customItems">
		<strand-grid-column field="first_name">First Name</strand-grid-column>
		<strand-grid-column field="last_name">Last Name</strand-grid-column>
		<strand-grid-column field="info">Info</strand-grid-column>
		
		<template preserve-content>
			<strand-grid-item model="{{model}}" scope="{{scope}}">
				<div field="info">
					<strand-icon type="info" id="infoIcon" width="12" height="12"></strand-icon>
					<strand-tooltip 
						id="infoTip"
						model="{{model}}" 
						target="{{findById('infoIcon')}}">
							<label>{{model.tip}}</label>
						</strand-tooltip>
				</div>
			</strand-grid-item>
		</template>
	</strand-grid>

	<script>
		window.addEventListener("WebComponentsReady", function() {
			var customItems = document.querySelector('#customItems');

			customItems.data = [
				{ first_name: "Bob", last_name: "Smith", tip: "A real all star employee" },
				{ first_name: "Jane", last_name: "Doe", tip: "A great leader"  },
				{ first_name: "Rick", last_name: "James", tip: "He's a cool guy" },
				/* more data items here... */
			];
		});
	</script>

```

### Using dropdowns in a custom grid item template
When using an `strand-dropdown` component inside of an `strand-grid, there will also be some special considerations. At it's core, the `strand-grid` uses item recycling to minimize the amount of DOM nodes necessary in the document. Therefor, the minimum number of grid items are rendered to fill the viewport, and they will be reused over and over, with different data injected.

To ensure that an custom grid item maintains its state during item recycling, the data for the dropdown must be added to the model for the grid item, and the value for that data also stored to the same model. This way, `strand-grid` ensures that each item's model data populates each `strand-dropdown` is correctly updated upon recycling. 

```html
	<strand-grid id="customItems">
		<strand-grid-column field="first_name">First Name</strand-grid-column>
		<strand-grid-column field="last_name">Last Name</strand-grid-column>
		<strand-grid-column field="email">Email</strand-grid-column>
		<strand-grid-column field="role">Role</strand-grid-column>
		
		<template preserve-content>
			<strand-grid-item model="{{model}}" scope="{{scope}}">
				<div field="role">
					<strand-dropdown 
						data="{{model.dropdown_data}}" 
						value="{{model.dropdown_data_value}}"
						placeholder="Select Role"></strand-dropdown>
				</div>
			</strand-grid-item>
		</template>
	</strand-grid>

	<script>
		var NUM_ITEMS = 300,
			data = [];

		function randomInt(min, max) {
		  return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		for(var i=0; i<NUM_ITEMS; i++) {
			generateItem();
		}

		function generateItem() {
			var firstName = Math.random().toString(36).substring(7),
				lastName =  Math.random().toString(36).substring(7);

			data.push({
				id:0, 
				first_name: firstName, 
				last_name: lastName, 
				email: lastName + '@gmail.com', 
				dropdown_data: getDropdownData(lastName), 
				dropdown_data_value: null
			});
		}

		function getDropdownData(lastName) {
			return [
				{ "name" : "manager", "value" : "man" },
				{ "name" : "sales", "value" : "sal" },
				{ "name" : "developer", "value" : "dev" },
				{ "name" : "designer", "value" : "des" },
			];
		}
		
		window.addEventListener("WebComponentsReady", function() {
			var customItems = document.querySelector('#customItems');
			customItems.data = data;
		});
	</script>

```