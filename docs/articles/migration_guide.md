# Migration Guide
Strand is now built on <a href="https://www.polymer-project.org/1.0/docs/" target="_blank">Polymer 1.0</a>. This article will only document breaking changes to the Strand APIs. For breaking changes between the 0.5 and 1.0 release of Polymer, see the <a href="https://www.polymer-project.org/1.0/docs/migration.html" target="_blank">Polymer migration guide</a>.

## Setting Properties via Attributes
Previously, Polymer 0.5 accepted camel cased attributes. Currently, camel cased attributes are no longer accepted. Any camel case property will need to be set via a hyphenated (or 'kebab-case') attribute. For example the attribute that was previously set as `maxItems` will now be set as `max-items`. When setting properties via JS, there is no difference. In the documentation for each component, not that all properties which can be set as attributes will list the hypenated attribute name. 

Before:
```html
<mm-dropdown placeholder="Select One" maxItems="5">
	...
</mm-dropdown>

```

After:
```html
<strand-dropdown placeholder="Select One" max-items="5">
	...
</strand-dropdown>
```

---

## Use WebComponentsReady instead of polymer-ready
Some examples found in the Strand documentation demonstrate setting data or properties when the component has been initalized. Previously, a `polymer-ready` event was used for this purpose. This has changed to `WebComponentsReady`. See the <a href="https://www.polymer-project.org/1.0/docs/migration.html#polymer-ready" target="_blank">Polymer 1.0 migration guide</a> for more details.  

---

## Removal of the bindModel method
Previously, a `bindModel` method was provided as a convenience to bind a property on the given model to the input's value. The `bindModel` method has been deprecated. The components affected are: <a href="/strand-dropdown.html">strand-dropdown</a>, <a href="/strand-checkbox.html">strand-checkbox</a>, <a href="/strand-input.html">strand-input</a>, <a href="/strand-textarea.html">strand-textarea</a>, and <a href="/strand-group.html">strand-group</a>.

---

## The unresolved attribute
Although Polymer no longer supports the `unresolved` attribute per component (the `unresolved` attribute may still be used on the `body` element), Strand still supports this via the `StrandTraits.Resolvable` behavior. The `unresolved` attribute will be removed upon component `ready`.

Before & After:
```html
<style>
	strand-dropdown[unresolved] {
		display: none;
	}
</style>

<strand-dropdown placeholder="Select One" unresolved>
	...
</strand-dropdown>

```

---

## strand-icon
`primaryColor` and `hoverColor` properties have been deprecated. Color should instead be configured in stylesheets.

Before:
```html
<mm-icon type="actions" width="32" height="32" primaryColor="#666666" hoverColor="#333333"></mm-icon>
```

After:
```html
<style>
	#myIcon {
		color: #666666;
	}
	#myIcon:hover {
		color: #333333;
	}
</style>
<strand-icon type="actions" width="32" height="32"></strand-icon>
```

---

## strand-input
Autocompleting `strand-input` is now a separate component, `strand-autocomplete`

Before:
```html
<mm-input autocomplete data="[{"name":"apples"},{"name":"bears"},{"name":"candy"},{"name":"ducks"},{"name":"everything"}]"></mm-input>
<!-- OR -->
<mm-input autocomplete id="autoInput"></mm-input>
<script>
	window.addEventListener("WebComponentsReady", function() { 
		var autoInput = document.querySelector("#autoInput");
		autoInput.data = [
			{"name": "apples"},
			{"name": "bears"},
			{"name": "candy"},
			{"name": "ducks"},
			{"name": "everything"}
		];
	});
</script>
```

After:
```html
<strand-autocomplete data="[{"name":"apples"},{"name":"bears"},{"name":"candy"},{"name":"ducks"},{"name":"everything"}]"></strand-autocomplete>
<!-- OR -->
<strand-input autocomplete id="autoComplete"></strand-input>
<script>
	window.addEventListener("WebComponentsReady", function() { 
		var autoComplete = document.querySelector("#autoComplete");
		autoComplete.data = [
			{"name": "apples"},
			{"name": "bears"},
			{"name": "candy"},
			{"name": "ducks"},
			{"name": "everything"}
		];
	});
</script>
```

---

## strand-popover
Previously, to set the direction of a popover, the attribute (or Property) `valign` was used to specify vertical alignment, and `align` was used to specify horizontal alignment. Currently, these properties have been deprecated in favor of a Cardinal direction positioning system using the property `direction` with arguements `'n', 'e', 's', 'w'`.

Before:
```html
<mm-popover id="popover" valign="bottom" align="center">
	<div class="body">
		...
	</div>
</mm-popover>
```

After:
```html
<strand-popover id="popover" direction="s">
	<div class="body">
		...
	</div>
</strand-popover>
```

---

## strand-scroll-panel
The `scope` property has been deprecated. Previously, all dom mutations were handled by a separate internal Polymer component, which needed to be passed the appropriate scope in order to capture dom mutations. Currently, all dom mutation are handled at the component level, so the scope of the light dom will be accurate.

Before:
```html
<polymer-element name="x-test">
	<mm-scroll-panel scope="{{}}">
		<content></content>
	</mm-scroll-panel>
</polymer-element>
```

After:
```html
<dom-module id="x-test">
	<template>
		<strand-scroll-panel>
			<content></content>
		</strand-scroll-panel>
	</template>
</dom-module>
```

---

## strand-tooltip
`strand-tooltip` no longer requires a template tag. The tooltip's target should be moved outside of the component, and a selector should be passed to tooltip using the `target` attribute.

Before:
```html
<mm-tooltip>
	<mm-icon type="info" width="14" height="14"></mm-icon>
	<template>
		<label>Hi there, I'm a tooltip.</label>
	</template>
</mm-tooltip>
```
After:
```html
<strand-icon id="defaultTarg" type="info" width="14" height="14"></strand-icon>
<strand-tooltip target="#defaultTarg">
	<label>Hi there, I'm a tooltip.</label>
</strand-tooltip>
```