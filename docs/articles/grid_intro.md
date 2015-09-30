# Introduction to mm-grid

## Overview
`mm-grid` is a multi-purpose component for displaying tabular data. It has a number of customizable attributes and sub-components that allow a developer to change its functionality to fit a variety use-cases. Internally it uses a concept known as "item recycling" - reusing a small pool of DOM elements, which drastically improves the rendering performance of large datasets.

## Related Components

Sub-components that are used with mm-grid:

* [mm-grid-column](mm-grid-column.html): defines data-fields and constructs column headers
* [mm-grid-item](mm-grid-item.html): default item template that works with grid-columns to perform tasks like column resizing
* [mm-item-recycler](mm-item-recycler.html): reuses DOM elements to boost rendering performance


#### Continue Reading &#8594; [Configuring mm-grid](article_grid_config.html)