# Migration Guide
Strand is now built on <a href="https://www.polymer-project.org/1.0/docs/">Polymer 1.0</a>. This article will only document breaking changes to the Strand APIs. For breaking changes between the 0.5 and 1.0 release of Polymer, see the <a href="https://www.polymer-project.org/1.0/docs/migration.html">Polymer migration guide</a>.

### mm-icon
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
<mm-icon type="actions" width="32" height="32"></mm-icon>
```

---

### mm-input
Autocompleting `mm-input` is now a separate component, `mm-autocomplete`

Before:
```html
<mm-input autocomplete data="[{"name":"apples"},{"name":"bears"},{"name":"candy"},{"name":"ducks"},{"name":"everything"}]"></mm-input>
```

After:
```html
<mm-autocomplete data="[{"name":"apples"},{"name":"bears"},{"name":"candy"},{"name":"ducks"},{"name":"everything"}]"></mm-autocomplete>
```

---

### mm-tooltip
`mm-tooltip` no longer requires a template tag. The tooltip's target should be moved outside of the component, and a selector should be passed to tooltip using the `target` attribute.

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
<mm-icon id="defaultTarg" type="info" width="14" height="14"></mm-icon>
<mm-tooltip target="#defaultTarg">
	<label>Hi there, I'm a tooltip.</label>
</mm-tooltip>
```