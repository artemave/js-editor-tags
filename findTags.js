const babylon = require('babylon')
const {default: traverse} = require('babel-traverse')
const {get} = require('dot-prop')
const debug = require('debug')('js-tags')

function ObjectPattern (node) {
  return node.id.properties.map(({key: {loc, name: tagname}}) => {
    return {tagname, loc, type: 'v'}
  })
}

function ArrayPattern (node) {
  return node.id.elements.map(({loc, name: tagname}) => {
    return {tagname, loc, type: 'v'}
  })
}

module.exports = function findTags (filename, source) {
  const ast = babylon.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  })
  const result = []

  function collect (...tags) {
    result.push(...tags)
  }

  traverse(ast, {
    ClassDeclaration ({node}) {
      const tagname = node.id.name
      collect({tagname, filename, loc: node.loc, type: 'c'}, node)
    },
    ClassMethod ({node, parentPath}) {
      if (node.key.name !== 'constructor') {
        const tagname = node.key.name
        const options = {}
        const className = get('parentPath.parentPath.node.id.name')
        if (className) {
          options.class = className
        }
        collect({tagname, filename, loc: node.loc, type: 'f', options}, node)
      }
    },
    VariableDeclarator ({node}) {
      const tagname = node.id.name
      debug('VariableDeclarator', JSON.stringify(node, null, 2))

      if (tagname) {
        collect({tagname: tagname, filename: filename, loc: node.loc, type: 'v'}, node)
      } else {
        const handler = {
          ObjectPattern,
          ArrayPattern
        }[node.id.type]

        if (handler) {
          collect(
            ...handler(node).map(t => Object.assign({filename}, t))
          )
        }
      }
    },
    ImportDefaultSpecifier ({node}) {
      let tagname = node.local.name
      collect({tagname, filename, loc: node.loc, type: 'i'}, node)
    },
    ImportSpecifier ({node}) {
      // id may be null for flow function declarations
      if (node.id) {
        let tagname = node.id.name
        collect({tagname, filename, loc: node.loc, type: 'i'}, node)
      }
    },
    FunctionDeclaration ({node}) {
      // id may be null for flow function declarations
      if (node.id) {
        let tagname = node.id.name
        collect({tagname, filename, loc: node.loc, type: 'f'}, node)
      }
    }
  })

  return result
}
