const App = require('..')
const FsAdapter = require('../fsAdapter')
const FsAdapterMemory = require('./fsAdapterMemory')
const {expect} = require('chai')
const path = require('path')
const {source: fixture} = require('./fixture')

describe('tags', function () {
  let tags, assertTag, generateTags
  const fixtureFilePath = path.join(__dirname, 'stuff.js')
  const tagsFilePath = path.join(__dirname, 'tags')

  beforeEach(async function () {
    const fs = process.env.REAL_FS ? new FsAdapter() : new FsAdapterMemory()
    const app = new App({fs, tagsFilePath})

    await fs.writeFile(fixtureFilePath, fixture)
    await fs.removeFile(tagsFilePath)

    generateTags = async (filesToTag) => {
      await app.run(filesToTag)
      const tags = await fs.readFile(tagsFilePath)
      return tags.split('\n')
    }

    tags = await generateTags([fixtureFilePath])

    assertTag = ({tagname, loc, type}) => {
      const expected = `${tagname}\ttest/stuff.js\t${loc}\t"\t${type}`
      expect(tags).to.deep.include(expected, JSON.stringify(tags, null, 2))
    }
  })

  it('ignores non js files', async function () {
    tags = await generateTags([path.join(__dirname, 'index.html')])
    expect(tags.length).to.eq(2)
  })

  it('tags functions', function () {
    assertTag({
      tagname: 'topLevelFunction',
      loc: 3,
      type: 'f'
    })
    assertTag({
      tagname: 'nestedFunction',
      loc: 4,
      type: 'f'
    })
  })

  it('tags "const bbb = 2"', function () {
    assertTag({
      tagname: 'bbb',
      loc: 10,
      type: 'v'
    })
  })

  it('tags "const {ccc} = {}"', function () {
    assertTag({
      tagname: 'ccc',
      loc: 11,
      type: 'v'
    })
  })

  it('tags "const {ccc, ddd} = {}"', function () {
    assertTag({
      tagname: 'ddd',
      loc: 11,
      type: 'v'
    })
  })

  it('tags "const [eee] = []"', function () {
    assertTag({
      tagname: 'eee',
      loc: 12,
      type: 'v'
    })
  })

  it('tags "const [eee, fff] = []"', function () {
    assertTag({
      tagname: 'fff',
      loc: 12,
      type: 'v'
    })
  })

  it('tags "const [{ggg}] = []"', function () {
    assertTag({
      tagname: 'ggg',
      loc: 13,
      type: 'v'
    })
  })

  it('tags "const {a: [hhh]} = {}"', function () {
    assertTag({
      tagname: 'hhh',
      loc: 14,
      type: 'v'
    })
  })

  it('tags "const [...iii] = []"', function () {
    assertTag({
      tagname: 'iii',
      loc: 15,
      type: 'v'
    })
  })

  it('tags "const [, ...kkk] = []"', function () {
    assertTag({
      tagname: 'kkk',
      loc: 16,
      type: 'v'
    })
  })

  it('tags class declarations', function () {
    assertTag({
      tagname: 'Stuff',
      loc: 18,
      type: 'c'
    })
  })

  it('tags methods', function () {
    assertTag({
      tagname: 'blah',
      loc: 19,
      type: 'm'
    })
  })

  it('tags simple imports', function () {
    assertTag({
      tagname: 'lll',
      loc: 22,
      type: 'i'
    })
  })

  it('tags "import {m} from "', function () {
    assertTag({
      tagname: 'mmm',
      loc: 23,
      type: 'i'
    })
  })

  it('tags "import {m as n} from "', function () {
    assertTag({
      tagname: 'nnn',
      loc: 24,
      type: 'i'
    })
  })

  it('tags "import {m as n, o as p} from "', function () {
    assertTag({
      tagname: 'ooo',
      loc: 25,
      type: 'i'
    })
    assertTag({
      tagname: 'ppp',
      loc: 25,
      type: 'i'
    })
  })

  it('tags object methods', function () {
    assertTag({
      tagname: 'qqq',
      loc: 28,
      type: 'm'
    })
  })
})
