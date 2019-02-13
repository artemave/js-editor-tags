const App = require('..')
const FsAdapter = require('../fsAdapter')
const FsAdapterMemory = require('./fsAdapterMemory')
const {expect} = require('chai')
const path = require('path')
const {expected, source} = require('./fixture')

// /\%12l\%34c/ line and column

/* eslint-disable */
const existingTags = `
!_TAG_FILE_FORMAT	2	/extended format/
!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/
App	test/stuff.js	35;"	c
App	test/generateTagsFileSpec.js	1;"	v
blah	test/stuff.js	36;"	v
private	package.json	/^  "private": true,$/;"	b
`

const expectedUpdatedTags = `!_TAG_FILE_FORMAT	2	/extended format/
!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/
App	test/generateTagsFileSpec.js	1;"	v
a	test/stuff.js	1;"	v
private	package.json	/^  "private": true,$/;"	b`

const expectedNewTags = `!_TAG_FILE_FORMAT	2	/extended format/
!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/
a	test/stuff.js	1;"	v`
/* eslint-enable */

describe('cli', function () {
  let fs, app
  const tagsFilePath = path.join(__dirname, 'tags')
  const fixtureFilePath = path.join(__dirname, 'stuff.js')

  beforeEach(function () {
    fs = process.env.REAL_FS ? new FsAdapter() : new FsAdapterMemory()
    app = new App({fs, tagsFilePath})
  })

  it('regenates tags file by default', async function () {
    await fs.writeFile(tagsFilePath, existingTags)
    await fs.writeFile(fixtureFilePath, source)

    await app.run([fixtureFilePath])
    const tags = await fs.readFile(tagsFilePath)
    expect(tags).to.eq(expected)
  })

  describe('update mode', function () {
    beforeEach(async function () {
      await fs.writeFile(fixtureFilePath, 'const a = 2')
    })

    context('tags file exists', function () {
      beforeEach(async function () {
        await fs.writeFile(tagsFilePath, existingTags)
      })

      it('updates existing tags file', async function () {
        await app.run([fixtureFilePath], {update: true})
        const tags = await fs.readFile(tagsFilePath)
        expect(tags).to.eq(expectedUpdatedTags)
      })
    })

    it('generates new tags file', async function () {
      await app.run([fixtureFilePath], {update: true})
      const tags = await fs.readFile(tagsFilePath)
      expect(tags).to.eq(expectedNewTags)
    })
  })

  it('skips source file that contains invalid js', async function () {
    const fixtureFilePath2 = path.join(__dirname, 'stuff2.js')
    await fs.writeFile(fixtureFilePath, 'const a = 2')
    await fs.writeFile(fixtureFilePath2, 'function blah (a {}')
    await app.run([fixtureFilePath, fixtureFilePath2])
    const tags = await fs.readFile(tagsFilePath)
    expect(tags).to.eq(expectedNewTags)
  })
})
