js-editor-tags [![Build Status](https://travis-ci.org/artemave/js-editor-tags.svg?branch=master)](https://travis-ci.org/artemave/js-editor-tags)
-------

Generate tags file for javascript codebase using static code analyses.

## Is it fast?

Yes, it is fast.

## Usage

The following will generate `tags` file in the current folder:

```bash
npm i -g js-editor-tags

# generate `tags` file for all _not git ignored_, _existing_, js/mjs/jsx files in the current folder and subfolders
js-editor-tags # add --no-git-files-only if you really want ALL files

# update existing `tags` file instead of regenerating it
js-editor-tags -u

# generate `tags` file and keep it up to date as the files change
js-editor-tags -w

# ultimately, you can just pipe in a list of files to tag
git ls-files | js-editor-tags

# and watch it your way
fswatch -0 -r . | while read -d "" file_path; do git ls-files $file_path; done | js-editor-tags -u
```

Another option is to use a git hook to run the script.  [Here's an example](https://tbaggery.com/2011/08/08/effortless-ctags-with-git.html).

## Running tests

```bash
yarn test
```
