# Introducing Data Components

## High Level Overview

Strand Data Components are a set of non-rendered web components that are used to handle both abstract and low level AJAX calls in a modern web browser.  The design philosophy behind this component set was to be loosely similar to backbone.js in the way that it uses models/collections as the primary I/O mechanisms while also leveraging some of the unique features of the polymer library: namely 2 way binding.  

We leverage 2-way binding in several ways. First most of the elements, while having a javascript API as well, are primarily designed to be updated via lightDOM node configuration.  The reason for this is that given bindable external data (say from an html form input) it is now possible to bind things like query params directly to the user input (or to an appropriate client filter method triggered on user input).

This philosophy is also carried through to the low level api components, which while the higher level ones are intended for regular developer use, can also be manipulated in the same way to achieve maximum flexibility and address the widest possible variety of use cases.

## Architecture

The component set consists of:

* [mm-ajax](mm-ajax.html): low level api to XHRequests
* [mm-sync](mm-sync.html): high level api (get/post/put/delete) with support for common header and input/output scenarios
* [mm-model](mm-model.html): 'bare' model component that largely serves to make server side data 2 way bindable
* [mm-collection](mm-collection.html): 'bare' collection component that follows a similar pattern to model (with the ability to manipulate and retrieve contained models)
* [mm-adapter-adama](mm-adapter-adama-html): (important note that this will likely be moved to T1 namespace soon) superclass of mm-sync with adama specific data marshaling and dom config

[graphic]


