# Using mm-repeater

## Overview

`mm-repeater` allows the duplication of a set of fields contained within a template tag.

```html
<mm-repeater id="myRepeater">
	<template preserve-content>
		<mm-input name="first_name" placeholder="First Name"></mm-input>
		<mm-input name="last_name" placeholder="Last Name"></mm-input>
		<mm-input name="address" placeholder="Address"></mm-input>
		<mm-input name="city" placeholder="City"></mm-input>
		<mm-dropdown name="state" placeholder="State/Province">
			...
		</mm-dropdown>
		<mm-input name="zip_code" placeholder="ZIP/Postal Code"></mm-input>
	</template>
</mm-repeater>
```

## Validation
Like `mm-form`, `mm-repeater` takes a `config` object, which can take `validation` as a `string` or a custom validation method taking the arguments `value, row:Object, domref:HTMLElement`, and an `errorMessage`. If a custom validation method is used, `this.errorMessage` can be set dynamically.

```javascript
var myRepeater = document.getElementById('myRepeater'),
	Validator = StrandLib.Validator;
myRepeater.config = {
	'first_name': {
		validation: 'alpha'
	},
	'last_name': {
		validation: 'alpha'
	},
	'address': {
		validation: function(value) {
			var a = value.split(" "),
				street_num = parseInt(a[0]),
				street_name = a[1];
			return street_num != NaN;
		},
	},
	'city': {
		validation: 'alpha'
	},
	'zip_code': {
		validation: function(zip) {
			var z = zip.replace('-','');
			return parseInt(z) != NaN && (z.length == 5 || z.length == 9);
		},
		errorMessage: 'Not a valid ZIP'
	}
}
```

## Getting data from `mm-repeater`
User data from repeated form fields are accessible through the `value` property on the `mm-repeater` element. `value` is a getter/setter interface for the `data` property—this ensures Polymer's data binding updates properly. Each object in the `value` array corresponds to a single repeater row, with key-value pairs corresponding to the name-value pairs of the form elements.

## Getting data into `mm-repeater`

Data can be preloaded into the repeater by setting the `value`. This is useful in views where the end user wishes to edit some pre-existing data.
```javascript
var myRepeater = document.getElementById('myRepeater');
myRepeater.value = [
	{
		first_name: "Jerry",
		last_name: "Seinfeld",
		address: "2880 Broadway",
		city: "New York",
		state: "NY",
		zip_code: "10025"
	},
	{
		first_name: "George",
		last_name: "Costanza",
		address: "2880 Broadway",
		city: "New York",
		state: "NY",
		zip_code: "10025"
	}
];
```
By default, `mm-repeater` initializes the `value` property with an array containing a single, empty `Object`. This results in a single, blank instance of the template being rendered when the form loads.
