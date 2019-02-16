#!/usr/bin/env node

const debug = require('debug')('js-tags')
const readline = require('readline')
const FsAdapter = require('./fsAdapter')
const path = require('path')
const chokidar = require('chokidar')
const findTags = require('./findTags')
const BatchRunner = require('./batchRunner')
const Shell = require('./shell')
const argv = require('yargs')
  .options({
    update: {
      alias: 'u',
      describe: 'Update existing tags file instead of creating from scratch',
      type: 'boolean'
    },
    'git-files-only': {
      describe: 'Only tag files that are tracked in git',
      type: 'boolean'
    },
    watch: {
      alias: 'w',
      describe: 'Watch files in changes and update tags file',
      type: 'boolean'
    }
  }).argv

function formatTag (tag) {
  const exCmd = tag.exCmd || `${tag.line};"`
  const rest = tag.rest || [tag.type]
  let line = [
    tag.tagname,
    tag.filename,
    exCmd,
    ...rest
  ]
  return line.join('\t')
}

function parseTag (tagString) {
  const [tagname, filename, exCmd, ...rest] = tagString.split('\t')
  return {tagname, filename, exCmd, rest}
}

function isJsFile (fileName) {
  return fileName.match(/\.(mjs|jsx?)$/)
}

function toRelative (path) {
  return path.replace(process.cwd() + '/', '')
}

function byTagname (a, b) {
  if (a.tagname < b.tagname) {
    return -1
  }
  if (a.tagname > b.tagname) {
    return 1
  }
  return 0
}

class App {
  constructor ({fs = new FsAdapter(), tagsFilePath}) {
    this.fs = fs
    this.tagsFilePath = tagsFilePath
  }

  async run (filesToTag, {update} = {}) {
    let tags = update ? await this._existingTagsToKeep(filesToTag) : []

    for (let path of filesToTag.filter(isJsFile)) {
      debug('tagging %s', path)
      try {
        const source = await this.fs.readFile(path)
        tags.push(
          ...findTags(toRelative(path), source)
        )
      } catch (e) {
        if (e.code === 'ENOENT') {
          debug(`deleting tags for ${path}`)
          tags = tags.filter(tag => {
            return tag.filename !== path
          })
        } else {
          console.warn(`Error opening ${path}: ${e.message}`)
        }
      }
    }
    tags.sort(byTagname)
    const formattedTags = tags.map(formatTag)
    formattedTags.unshift(
      '!_TAG_FILE_FORMAT	2	/extended format/', // eslint-disable-line
      '!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/' // eslint-disable-line
    )
    await this.fs.writeFile(this.tagsFilePath, formattedTags.join('\n'))
  }

  async _existingTagsToKeep (filesToTag) {
    const existingTagsFile = await this.fs.readFile(this.tagsFilePath)
    if (existingTagsFile) {
      const existingTags = existingTagsFile.split('\n').filter(tag => {
        return !tag.match('!_TAG_FILE') && tag !== ''
      })
      return existingTags.filter(tag => {
        return !filesToTag.map(toRelative).some(path => tag.match(path))
      }).map(parseTag)
    } else {
      return []
    }
  }
}

module.exports = App

if (!module.parent) {
  (async () => {
    try {
      const app = new App({
        tagsFilePath: path.join(process.cwd(), 'tags')
      })
      const batchRunner = new BatchRunner()

      if (process.stdin.isTTY) {
        const sh = new Shell()

        const filesToTag = async () => {
          // TODO: handle --no-git-files-only
          // the second `git status` is to include deleted staged files
          const files = await sh('{ git ls-files & git status --porcelain -uall | sed s/^...//; } | sort -u')
          return files
        }

        await app.run(await filesToTag(), argv)

        if (argv.watch) {
          chokidar.watch(process.cwd(), {
            ignored: /node_modules/,
            cwd: process.cwd(),
            ignoreInitial: true
          }).on('all', async (event, path) => {
            debug('%s %s', event, path)
            if (event.match(/add|change|unlink/) && (await filesToTag()).includes(path)) {
              batchRunner.addToBatch(path)
            }
          })
          await batchRunner.process(async (filesToTag) => {
            await app.run(filesToTag, Object.assign({}, argv, {update: true}))
          })
        }
      } else {
        const rl = readline.createInterface({
          input: process.stdin
        })

        rl.on('line', fileToTag => {
          batchRunner.addToBatch(fileToTag)
        })

        rl.on('close', () => {
          batchRunner.quit()
        })
        await batchRunner.process(async (filesToTag) => {
          await app.run(filesToTag, argv)
        })
      }
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
    process.exit()
  })()
}
