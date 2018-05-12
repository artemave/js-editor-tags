#!/usr/bin/env node

const FsAdapter = require('./fsAdapter')
const path = require('path')
const findTags = require('./findTags')

function formatTag (tag) {
  let line = [
    tag.tagname,
    tag.filename,
    tag.loc.start.line,
    '"',
    tag.type
  ]
  return line.join('\t')
}

async function readFileListFromStdin () {
  const stdin = process.openStdin()
  let data = ''
  return new Promise((resolve, reject) => {
    stdin.on('end', () => {
      resolve(data.split('\n'))
    })
    stdin.on('data', (chunk) => {
      data += chunk
    })
  })
}

function jsOnly (fileName) {
  return fileName.match(/\.jsx?$/)
}

class App {
  constructor ({fs, tagsFilePath}) {
    this.fs = fs
    this.tagsFilePath = tagsFilePath
  }

  async run (filesToTag) {
    const tags = []

    for (let fileName of filesToTag.filter(jsOnly)) {
      const source = await this.fs.readFile(fileName)
      tags.push(
        ...findTags(fileName, source).map(formatTag)
      )
    }
    tags.sort()

    tags.unshift(
      '!_TAG_FILE_FORMAT	2	/extended format/', // eslint-disable-line
      '!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/' // eslint-disable-line
    )
    await this.fs.writeFile(this.tagsFilePath, tags.join('\n'))
  }
}

module.exports = App

if (!module.parent) {
  const app = new App({
    fs: new FsAdapter(),
    tagsFilePath: path.join(process.cwd(), 'tags')
  })
  readFileListFromStdin().then(filesToTag => {
    return app.run(filesToTag)
  }).then(() => {
    console.info('Success!')
    process.exit()
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
}
