# Contributing

Let's improve Strand together!  We're looking forward to receiving pull requests.

## <a name="developer"></a> Developer Setup

Setting up the development environment is simple and easy.

#### Building the components

1. Fork [Strand](https://github.com/MediaMath/strand)
1. Clone your fork (we'll refer to your fork as `origin` hereafter)
1. Install the [Node Package Manager](https://www.npmjs.com/) dependencies
1. Install the [Bower](http://bower.io/) dependencies
1. Execute a [Gulp](https://github.com/gulpjs/gulp) build -- which is the default task
1. Run the Gulp `live` task to serve the project resources locally, and automatically update when files are changed

```bash
$ git clone git@github.com:[my-user-name]/strand.git
$ cd strand/
$ npm install
$ bower install
$ gulp
$ gulp live
```

When using the server provided by `gulp live`, the Strand preview page can be accessed at `http://localhost:8000/`

#### Building the documentation

After building the components themselves, the documentation pages for Strand can be built by running the `docs` Gulp task:

```bash
$ gulp docs
$ gulp live:docs
```

When using the server provided by `gulp live`, the Strand documentation can be accessed at `http://localhost:8001`

## <a name="issue"></a> Found an Issue?
If you find a bug in the source code or a mistake in the documentation, help us by
submitting an [issue](https://github.com/MediaMath/strand/issues).

If you have a solution, you can submit a [Pull Request](#pr) with the fix, but please log the issue anyway for tracking purposes.

## Consideration of Submissions
If you are submitting a new component, or making significant architectural changes in your PR, please consider opening a spec-bug first for discussion purposes prior to comitting to the work.  Generally our components are designed with the following philosophy:
* Heavily leverage existing strand behaviors/patterns where applicable
* Be data/API agnostic. All data sources should work for simple JS object/array patterns as well as when hooked up to sync or other pageable api adapters by exposing an `index`
* Favor UI components. Generally speaking data considerations should be local to your application as they can vary wildly in use case and the library should remain as agnostic as possible.

## <a name="pr"></a>Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

* Search [GitHub](https://github.com/MediaMath/strand/pulls) for an open or closed Pull Request that relates to your submission.
* When submitting a component, please limit your submission to _1 component or behavior per PR_ unless there is a parent -> child relationship between the components.
* Make sure your fork is [synched](https://help.github.com/articles/syncing-a-fork/)
* Create a new branch from `develop`
* Make your changes in a new git branch:

     ```bash
     git checkout -b my-branch-name
     ```

* Create your patch
* Follow our [Coding Guidelines](#guidelines).
* Commit your changes using a descriptive commit message
* Push your branch to GitHub:

    ```bash
    git push origin my-branch-name
    ```

* In GitHub, send a pull request to `strand:develop`.
* If we suggest changes then:
	* Make the required updates
	* [Rebase](https://help.github.com/articles/about-git-rebase/) your branch and force push to your GitHub repository (this will update your Pull Request):

    ```bash
    git fetch upstream
    git rebase -i upstream/develop
    git push -f origin my-branch-name
    ```

* When you solution is approved, please [squash](https://help.github.com/articles/about-git-rebase/) your commits

Thanks for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository.

## <a name="guidelines"></a> Coding Guidelines
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested**
* All public API methods **must be documented** in the `doc.json` included in the `mm-element-name` folder, as we use these to generate documentation
* Regarding code styling in general:
    * Strand does not subscribe to a specific javascript code guideline, but readability and organization are paramount
    * Methods and properties should be named in a meaningful way
    * Please refer to any of the Strand components or shared javascript files for reference
    * Use of `eval` or `innerHTML` in components is strongly discouraged
    * Please use `_name` for variables and methods that should not be publicly accessible. This follows the general Polymer convention.
