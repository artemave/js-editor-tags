const babylon = require('babylon')
const {default: traverse} = require('babel-traverse')
const {get} = require('dot-prop')
const debug = require('debug')('js-tags')
const flatten = require('lowscore/flatten')

module.exports = function findTags (filename, source) {
  const ast = babylon.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  })
  const result = []

  function collect (...tags) {
    result.push(...tags)
  }

  function Identifier ({name, loc}) {
    return [{tagname: name, loc: loc, type: 'v'}]
  }

  function ObjectPattern ({properties}) {
    return properties.map(({value: node}) => {
      return handleVariableDeclaration(node)
    })
  }

  function ArrayPattern ({elements}) {
    return elements.map(node => {
      return handleVariableDeclaration(node)
    })
  }

  function handleVariableDeclaration (node) {
    const handler = {
      Identifier,
      ObjectPattern,
      ArrayPattern
    }[node.type]

    if (handler) {
      return handler(node)
    } else {
      debug('No handler for node type %s', node.type)
      return []
    }
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
      debug('VariableDeclarator', JSON.stringify(node, null, 2))
      collect(
        ...flatten(
          handleVariableDeclaration(node.id)
        ).map(t => Object.assign({filename}, t))
      )
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
