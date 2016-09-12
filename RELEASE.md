#Strand - Release

## code release
* merge develop into master
* then: `gulp release:[major|minor|patch]`
* push tags: `git push --tags`
* merge master back into develop

## docs release
* `gulp docs`
* verify via `gulp docs:live`
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

