# Introduction to Data Components

## High Level Overview

Strand Data Components are a set of javascript objects and non-rendered web components that are used to handle both abstract and low level AJAX calls in a modern web browser.  The design philosophy behind this component set was to be loosely similar to Backbone.js in the way that it uses models/collections as the primary I/O mechanisms while also leveraging some of the unique features of the Polymer library: namely 2-way binding.

We leverage 2-way binding in several ways. First most of the elements, while having a JavaScript API as well, are primarily designed to be updated via lightDOM node configuration.  The reason for this is that given bindable external data (say from an HTML form input) it is now possible to bind things like query params directly to the user input (or to an appropriate client filter method triggered on user input).

This philosophy is also carried through to the low level API components, which while the higher level ones are intended for regular developer use, can also be manipulated in the same way to achieve maximum flexibility and address the widest possible variety of use cases.

## Architecture

The component set consists of:

* [strand-ajax](strand-ajax.html): low level API to XHRequests
* [strand-sync](strand-sync.html): high level API (get/post/put/delete) with support for common header and input/output scenarios
* [strand-model](strand-model.html): 'bare' model component that largely serves to make server side data 2-way bindable
* [strand-collection](strand-collection.html): 'bare' collection component that follows a similar pattern to model (with the ability to manipulate and retrieve contained models)



