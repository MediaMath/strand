# Creating Custom Grid Items

## Overview
The grid is quite extendable and can utilize a user-defined template to generate grid items. We recommend utilizing the built-in `mm-grid-item` component, as it works in tandem with the grid - resizable columns, selections, and expansions work out of the box. However, there will undoubtedly be situations where grid items require a more customized approach. 

### Creating a custom grid item template
In order to use a custom template we create a `template` DOM fragment inside of our `mm-grid` tag. Note that the template tag must include the attribute `preserve-content` [TODO: because... more detailed reason here]. 

In this example, we define an `<mm-grid-item>` with the attributes `model` and `scope`. These are two special attributes that give us a particular grid item's model as well as giving us access to the "scope" of the grid itself.

Defining `<div field="...">` inside of an `mm-grid-item` allows us to override that particular data field's DOM. In the example below we have overridden the "first_name" column, adding an icon and some custom text.

```html
	<mm-grid id="customItems">
		<mm-grid-column field="first_name">First Name</mm-grid-column>
		<mm-grid-column field="last_name">Last Name</mm-grid-column>
		<mm-grid-column field="email">Email</mm-grid-column>
		
		<template preserve-content>
			<mm-grid-item model="{{model}}" scope="{{scope}}">
				<div field="first_name">
					<span>Star Employee: {{model.first_name}}</span>
					<mm-icon width="15" height="15" type="favorite"></mm-icon>
				</div>
			</mm-grid-item>
		</template>
	</mm-grid>

	<script>
		window.addEventListener("WebComponentsReady", function() {
			var customItems = document.querySelector('#customItems');

			customItems.data = [
				{ id:0, first_name: "Bob", last_name: "Smith", email: "bsmith@gmail.com" },
				{ id:1, first_name: "Jane", last_name: "Doe", email: "jdoe@gmail.com" },
				{ id:2, first_name: "Rick", last_name: "James", email: "rjames@gmail.com" },
				...
			];
		});
	</script>

```

### Using positionable Strand components in a custom grid item template
When adding some of the web components from the Strand library to a custom grid item, there will be some additional configuration required. Most of the 'positionable' components in the Strand library (see: [mm-popover](mm-popover.html), [mm-tooltip](mm-tooltip.html), and [mm-menu](mm-menu.html)) require that a `target` element be specified. Normally, it is sufficient to simply to supply an id string to this attribute, but custom grid items represent a special case.

#### Adding a target to a positionable component in a custom grid item template
To supply a `target` to a positionable component in a custom grid item, a convenience method is available on all Strand components, called `findById()`. Giving the target element an id. Next, on the positionable element, bind the property `target={{findById('someTargetId')}}`. The positionable component will work as expected within the custom grid item. NOTE: this approach is not necessary when using positionable components outside of a custom grid item template.

```html
	<mm-grid id="customItems">
		<mm-grid-column field="first_name">First Name</mm-grid-column>
		<mm-grid-column field="last_name">Last Name</mm-grid-column>
		<mm-grid-column field="email">Email</mm-grid-column>
		<mm-grid-column field="actions">Actions</mm-grid-column>
		
		<template preserve-content>
			<mm-grid-item model="{{model}}" scope="{{scope}}">
				<div field="actions">
					<mm-icon type="actions" id="actionMenuIcon" width="15" height="15"></mm-icon>
					<mm-menu id="actionsMenu" direction="s" offset="15" model="{{model}}" target="{{findById('actionMenuIcon')}}">
						<mm-list-item value="m1">{{model.name}} action 1</mm-list-item>
						<mm-list-item value="m2">{{model.name}} action 2</mm-list-item>
						<mm-list-item value="m3">{{model.name}} action 3</mm-list-item>
						<mm-list-item value="m4">{{model.name}} action 4</mm-list-item>
						<mm-list-item value="m5">{{model.name}} action 5</mm-list-item>
					</mm-menu>
				</div>
			</mm-grid-item>
		</template>
	</mm-grid>

	<script>
		window.addEventListener("WebComponentsReady", function() {
			var customItems = document.querySelector('#customItems');

			customItems.data = [
				{ id:0, first_name: "Bob", last_name: "Smith", email: "bsmith@gmail.com" },
				{ id:1, first_name: "Jane", last_name: "Doe", email: "jdoe@gmail.com" },
				{ id:2, first_name: "Rick", last_name: "James", email: "rjames@gmail.com" },
				...
			];
		});
	</script>

```