const {readFileSync, writeFileSync} = require('fs')
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

module.exports = function (filesToTag) {
  const tags = []
  filesToTag.filter(jsOnly).forEach(fileName => {
    const source = readFileSync(fileName, 'utf-8')
    tags.push(
      ...findTags(fileName, source).map(formatTag)
    )
  })
  tags.sort()

  const tagsBanner = [
    '!_TAG_FILE_FORMAT	2	/extended format/',
    '!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/'
  ]
  return tagsBanner.concat(tags)
}

if (!module.parent) {
  readFileListFromStdin().then(filesToTag => {
    return module.exports(filesToTag)
  }).then(tags => {
    console.info('Success!')
    writeFileSync(path.join(process.cwd(), '/tags'), tags.join('\n'))
    process.exit()
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
}
