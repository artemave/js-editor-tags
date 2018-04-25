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

  it('tags variables', function () {
    assertTag({
      tagname: 'bbb',
      loc: 8,
      type: 'v'
    })
  })

  it('tags default object destruction', function () {
    assertTag({
      tagname: 'ccc',
      loc: 9,
      type: 'v'
    })
  })
})
