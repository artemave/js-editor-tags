const babylon = require('babylon')
const {default: traverse} = require('babel-traverse')
const debug = require('debug')('js-tags')
const flatten = require('lowscore/flatten')

module.exports = function findTags (filename, source) {
  const ast = babylon.parse(source, {
    sourceType: 'module',
    plugins: ['jsx']
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
    return elements.filter(_ => _).map(handleVariableDeclaration)
  }

  function RestElement ({argument}) {
    return handleVariableDeclaration(argument)
  }

  function handleVariableDeclaration (node) {
    const handler = {
      Identifier,
      ObjectPattern,
      ArrayPattern,
      RestElement
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
      collect({tagname, filename, loc: node.loc, type: 'c'})
    },
    ClassMethod ({node, parentPath}) {
      debug('ClassMethod', JSON.stringify(node, null, 2))
      if (node.key.name !== 'constructor') {
        const tagname = node.key.name
        collect({tagname, filename, loc: node.loc, type: 'm'})
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
      collect({tagname, filename, loc: node.loc, type: 'i'})
    },
    ImportSpecifier ({node}) {
      let tagname = node.local.name
      collect({tagname, filename, loc: node.loc, type: 'i'})
    },
    FunctionDeclaration ({node}) {
      let tagname = node.id.name
      collect({tagname, filename, loc: node.loc, type: 'f'})
    }
  })

  return result
}
