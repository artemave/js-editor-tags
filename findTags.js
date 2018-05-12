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
      if (node.key.name !== 'constructor') {
        const tagname = node.key.name
        collect({tagname, filename, loc: node.loc, type: 'm'})
      }
    },
    VariableDeclarator ({node}) {
      collect(
        ...flatten(
          handleVariableDeclaration(node.id)
        ).map(t => Object.assign({filename}, t))
      )
    },
    ImportDefaultSpecifier ({node}) {
      const tagname = node.local.name
      const loc = node.loc
      collect({tagname, filename, loc, type: 'i'})
    },
    ImportSpecifier ({node}) {
      const tagname = node.local.name
      const loc = node.loc
      collect({tagname, filename, loc, type: 'i'})
    },
    FunctionDeclaration ({node}) {
      const tagname = node.id.name
      const loc = node.loc
      collect({tagname, filename, loc, type: 'f'})
    },
    ObjectMethod ({node}) {
      const tagname = node.key.name
      const loc = node.key.loc
      collect({tagname, filename, loc, type: 'm'})
    },
    ObjectProperty ({node}) {
      if (!node.extra || !node.extra.shorthand) {
        const tagname = node.key.name
        const loc = node.key.loc
        collect({tagname, filename, loc, type: 'p'})
      }
    }
  })

  return result
}
