const {parse} = require('@babel/parser')
const traverse = require('@babel/traverse').default
const debug = require('debug')('js-tags')
const flatten = require('lowscore/flatten')

module.exports = function findTags (filename, source) {
  const ast = parse(source, {
    sourceType: 'unambiguous',
    plugins: [
      'jsx'
    ]
  })
  const result = []

  function collect (...tags) {
    result.push(...tags)
  }

  function Identifier ({name, loc}) {
    return [{tagname: name, line: loc.start.line, type: 'v'}]
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
      collect({tagname, filename, line: node.loc.start.line, type: 'c'})
    },
    ClassMethod ({node, parentPath}) {
      if (node.key.name !== 'constructor') {
        const tagname = node.key.name
        collect({tagname, filename, line: node.loc.start.line, type: 'm'})
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
      const line = node.loc.start.line
      collect({tagname, filename, line, type: 'i'})
    },
    ImportSpecifier ({node}) {
      const tagname = node.local.name
      const line = node.loc.start.line
      collect({tagname, filename, line, type: 'i'})
    },
    FunctionDeclaration ({node}) {
      const tagname = node.id.name
      const line = node.loc.start.line
      collect({tagname, filename, line, type: 'f'})
    },
    ObjectMethod ({node}) {
      const tagname = node.key.name
      const line = node.key.loc.start.line
      collect({tagname, filename, line, type: 'm'})
    }
  })

  return result
}
