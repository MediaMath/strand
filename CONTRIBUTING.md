# Contributing

Let's improve Strand together!  We're looking forward to receiving pull requests.

### Developer Setup

Setting up the development environment is simple and easy.

#### Building the components

1. Clone the [repository](https://github.com/MediaMath/strand)
1. Install the [Node Package Manager](https://www.npmjs.com/) dependencies
1. Install the [Bower](http://bower.io/) dependencies
1. Execute a [Grunt](http://gruntjs.com/) build -- which the default task
1. Run the `live` Grunt task to serve the project resources locally and automatically update when file changes are made

```
$ git clone git@github.com:MediaMath/strand.git
$ cd strand/
$ npm install
$ bower install
$ grunt
$ grunt live
```

When using the server provided by `grunt live`, the Strand preview page can be accessed at http://localhost:8000/

#### Building the documentation

After building the components themselves, the documentation pages for Strand can be built by running the `docs` Grunt task:

```
$ grunt docs
$ grunt live
```

When using the server provided by `grunt live`, the Strand documentation can be accessed at http://localhost:8000/docs/


