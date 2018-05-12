const App = require('..')
const FsAdapter = require('../fsAdapter')
const FsAdapterMemory = require('./fsAdapterMemory')
const {expect} = require('chai')
const path = require('path')
const {expected, source} = require('./fixture')

/* eslint-disable */
const existingTags = `
!_TAG_FILE_FORMAT	2	/extended format/
!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/
App	index.js	35	"	c
App	test/generateTagsFileSpec.js	1	"	v
`
/* eslint-enable */

describe('cli', function () {
  let fs, app
  const tagsFilePath = path.join(__dirname, 'tags')
  const fixtureFilePath = path.join(__dirname, 'stuff.js')

  beforeEach(async function () {
    fs = process.env.REAL_FS ? new FsAdapter() : new FsAdapterMemory()
    app = new App({fs, tagsFilePath})

    await fs.writeFile(tagsFilePath, existingTags)
    await fs.writeFile(fixtureFilePath, source)
  })

  it('regenates tags file by default', async function () {
    await app.run([fixtureFilePath])
    const tags = await fs.readFile(tagsFilePath)
    expect(tags).to.eq(expected)
  })
})
