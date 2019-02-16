const debug = require('debug')('js-tags')
const FsAdapter = require('./fsAdapter')
const findTags = require('./findTags')

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

module.exports = class App {
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
    try {
      const existingTagsFile = await this.fs.readFile(this.tagsFilePath)
      const existingTags = existingTagsFile.split('\n').filter(tag => {
        return !tag.match('!_TAG_FILE') && tag !== ''
      })
      return existingTags.filter(tag => {
        return !filesToTag.map(toRelative).some(path => tag.match(path))
      }).map(parseTag)
    } catch (e) {
      if (e.code === 'ENOENT') {
        return []
      }
      throw e
    }
  }
}
