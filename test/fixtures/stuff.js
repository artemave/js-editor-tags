/* eslint-disable */

function topLevelFunction () {
  function nestedFunction (arg) {
    return arg
  }
  return 1
}

const bbb = require('./b')
const {ccc, ddd} = require('./c')
const [eee, fff] = []
const [{ggg}] = []
const {a: [hhh]} = {}
const [...iii] = []
const [, ...kkk] = []

class Stuff {
  blah () {}
}
