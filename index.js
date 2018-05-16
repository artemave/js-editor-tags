#!/usr/bin/env node

const debug = require('debug')('js-tags')
const readline = require('readline')
const FsAdapter = require('./fsAdapter')
const path = require('path')
const findTags = require('./findTags')
const argv = require('yargs')
  .boolean('u')
  .describe('u', 'Update existing tags file')
  .argv

function formatTag (tag) {
  let line = [
    tag.tagname,
    tag.filename,
    tag.line,
    '"',
    tag.type
  ]
  return line.join('\t')
}

function parseTag (tagString) {
  const [tagname, filename, line,, type] = tagString.split('\t')
  return {tagname, filename, line, type}
}

function jsOnly (fileName) {
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
  constructor ({fs, tagsFilePath}) {
    this.fs = fs
    this.tagsFilePath = tagsFilePath
  }

  async run (filesToTag, {update} = {}) {
    const tags = update ? await this._existingTagsToKeep(filesToTag) : []

    for (let fileName of filesToTag.filter(jsOnly)) {
      debug(fileName)
      try {
        const source = await this.fs.readFile(fileName)
        tags.push(
          ...findTags(toRelative(fileName), source)
        )
      } catch (e) {
        console.warn(`Skipping ${fileName}: ${e.message}`)
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
  const app = new App({
    fs: new FsAdapter(),
    tagsFilePath: path.join(process.cwd(), 'tags')
  })

  const rl = readline.createInterface({
    input: process.stdin
  })

  const filesToTag = []

  try {
    rl.on('line', async fileToTag => {
      if (argv.u) {
        await app.run([fileToTag], {update: true})
      } else {
        filesToTag.push(fileToTag)
      }
    })

    if (!argv.u) {
      rl.on('close', async () => {
        await app.run(filesToTag)
      })
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
