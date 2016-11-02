#Strand - Release

## code release
* merge develop into master
  * `git checkout master`
  * `git fetch origin master`
  * `git pull origin master`
  * `git merge origin develop`
* then: `gulp release:[major|minor|patch]`
* push tags: `git push --tags`
* merge master back into develop
  * `git checkout develop`
  * `git fetch origin develop`
  * `git pull origin develop`
  * `git merge origin master`

## docs release
* `gulp docs`
* verify via `gulp live:docs`
* push via `gulp gh-pages`

## notify interested parties

Internal release notes - craft an email in this format:

```
Features: (a condensed, readable version additions derived from changelog.md)
* some feature
* some feature

Bug Fixes: (a condensed, readable version fixes derived from changelog.md)
* some fix
* some fix

(always includes a link to current the changelog.md)
https://github.com/MediaMath/strand/blob/master/CHANGELOG.md
```

