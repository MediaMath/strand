# Working with strand-repeater

## Overview
`strand-repeater` allows the duplication of a set of fields contained within a template tag.

`strand-repeater-row` has three bindable properties (like `strand-grid-item`):
- `model`, a reference to javascript object with the data filling the row
- `scope`, a reference to the `strand-repeater` the row is contained in
- `index`, the index of the row's model within the repeater's `data`

So if you wanted to take a list of _n_ addresses, you could set up:
```html
<strand-repeater id="myRepeater">
	<template preserve-content>
		<strand-repeater-row model="{{model}}" scope="{{scope}}" index="{{index}}">
			<span>{{index}}</span>
			<strand-input name="first_name" placeholder="First Name" value="{{model.first_name}}"></strand-input>
			<strand-input name="last_name" placeholder="Last Name" value="{{model.last_name}}"></strand-input>
			<strand-input name="address" placeholder="Address" value="{{model.address}}"></strand-input>
			<strand-input name="city" placeholder="City" value="{{model.city}}"></strand-input>
			<strand-dropdown name="state" placeholder="State/Province" value="{{model.state}}">
				...
			</strand-dropdown>
			<strand-input name="zip_code" placeholder="ZIP/Postal Code" value="{{model.zip_code}}"></strand-input>
		</strand-repeater-row>
	</template>
</strand-repeater>
```
Binding the values of the form input to the model means that the javascript object will update when the value of the form fields update.

Binding works just like in a custom `strand-grid-item`, so, for example, to disable a specific form field based on the value of a property in the model, you could write something like this:
```html
<strand-repeater>
	<template preserve-content>
		<strand-repeater-row model="{{model}}" scope="{{scope}}">
			<strand-input name="name" placeholder="Name" value="{{model.name}}" disabled$="{{model.locked}}"></strand-input>
		</strand-repeater-row>
	</template>
</strand-repeater>
```
This will create an attribute binding to the `disabled` property of the input, so the user will not be able to modify the inputs of rows that are "locked".

## Reading data from `strand-repeater`
`strand-repeater` has four public arrays that are exactly what they say on the tin:
- `data` contains all of the data in the repeater
- `added` contains only the models that have been added by the user
- `modified` contains only the pre-populated models that have been modified
- `deleted` contains the models that have been removed by the user (and are therefore no longer in `data`)
You will find these arrays on any element that implements the `Collection` behavior such as `strand-collection`. Each model also gets a `cId` property (distinct from the index) which will be useful to identify models [when validating](#validation).

`strand-repeater` also has a `value` attribute that is just a getter/setter pair for `data`, allowing you to drop it into a larger `strand-form`.

## Pre-populating data
Data can be pre-populated into the repeater by setting `data`. This is useful in views where the user wishes to edit some pre-existing collection of data.
```javascript
var myRepeater = document.getElementById('myRepeater');
myRepeater.data = [
	{
		first_name: "Jerry",
		last_name: "Seinfeld",
		address: "129 W. 81st Street",
		city: "New York",
		state: "NY",
		zip_code: "10024"
	},
	{
		first_name: "George",
		last_name: "Costanza",
		address: "1344 Queens Blvd.",
		city: "Queens",
		state: "NY",
		zip_code: "11374"
	}
];
```
By default `data` will contain one array with an empty object, giving you a single row with all fields blank.

## Validation
You can assign a function to `strand-repeater`'s `validation` property, which the element will use to validate user input, set error state, and display error messages. When you call `validate()` on the repeater, that subsequently calls `validation` with four parameters, which are the `data`, `added`, `modified`, and `deleted` arrays (in that order) and should return an array of invalid models with error messages. There are two requirements for this to work properly:
- The `name` attribute of each form field you want to validate must match the name of the property its `value` is bound to. So in our example above, we have `<strand-input name="first_name" value="{{model.first_name}}">`.
- The models that `validation` returns must include the `cId` (which you can just pass through)

The easiest way to do this is with ES5 array `map` and `filter`:
```javascript
function validateAddr(address) {
	if(!address) return 'Address required!';
	var tmp = address.split(' ');
	if(Number.isNaN(parseInt(tmp[0]))) return 'Street number required!';
}

function validateZip(zip) {
	if(!zip) return 'ZIP required!';
	var zip5 = zip.length === 5 && !Number.isNaN(parseInt(zip));
	var zip9 = zip.length === 10 && zip.split('-').reduce(function(acc, current, index) {
		return !Number.isNaN(parseInt(current)) && acc;
	});
	return (zip5 || zip9) ? null : 'ZIP is invalid!'
}

myRepeater.validation = function(data, added, modified, removed) {
	return data.map(function(model) {
		return {
			cId: model.cId,
			first_name: model.first_name ? null : 'First name required!',
			last_name: model.last_name ? null : 'Last name required!',
			address: validateAddr(model.address),
			city: model.city ? null : 'City required!',
			state: model.state ? null : 'State required!',
			zip_code: validateZip(model.zip)
		}
	});
};
```
The repeater considers the field invalid if an error message is present. It will set the error state on the associated element if possible and add an error message below the form element, which will persist until the next call of `validate()`.
