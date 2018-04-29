const generateTags = require('..')
const {expect} = require('chai')
const path = require('path')

describe('tags', function () {
  let tags, filename, assertTag

  beforeEach(function () {
    filename = path.join(__dirname, 'fixtures/stuff.js')
    tags = generateTags([filename])

    assertTag = ({tagname, loc, type}) => {
      const expected = `${tagname}\t${filename}\t${loc}\t"\t${type}`
      expect(tags).to.deep.include(expected, JSON.stringify(tags, null, 2))
    }
  })

  it('ignores non js files', function () {
    tags = generateTags([path.join(__dirname, 'fixtures/index.html')])
    expect(tags.length).to.eq(2)
  })

  it('tags functions', function () {
    assertTag({
      tagname: 'topLevelFunction',
      loc: 1,
      type: 'f'
    })
    assertTag({
      tagname: 'nestedFunction',
      loc: 2,
      type: 'f'
    })
  })

  it('tags "const bbb = 2"', function () {
    assertTag({
      tagname: 'bbb',
      loc: 8,
      type: 'v'
    })
  })

  it('tags "const {ccc} = {}"', function () {
    assertTag({
      tagname: 'ccc',
      loc: 9,
      type: 'v'
    })
  })

  it('tags "const {ccc, ddd} = {}"', function () {
    assertTag({
      tagname: 'ddd',
      loc: 9,
      type: 'v'
    })
  })

  it('tags "const [eee] = []"', function () {
    assertTag({
      tagname: 'eee',
      loc: 10,
      type: 'v'
    })
  })

  it('tags "const [eee, fff] = []"', function () {
    assertTag({
      tagname: 'fff',
      loc: 10,
      type: 'v'
    })
  })

  it('tags "const [{ggg}] = []"', function () {
    assertTag({
      tagname: 'ggg',
      loc: 11,
      type: 'v'
    })
  })

  it('tags "const {a: [hhh]} = {}"', function () {
    assertTag({
      tagname: 'hhh',
      loc: 12,
      type: 'v'
    })
  })

  it('tags "const [...iii] = []"', function () {
    assertTag({
      tagname: 'iii',
      loc: 13,
      type: 'v'
    })
  })

  it('tags "const [, ...kkk] = []"', function () {
    assertTag({
      tagname: 'kkk',
      loc: 14,
      type: 'v'
    })
  })
})
