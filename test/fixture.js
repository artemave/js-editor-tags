module.exports = `

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

import lll from 'lll'
import {mmm} from 'mmm'
import {mmm as nnn} from 'mmm'
import {o as ooo, p as ppp} from 'ooo'

const pf = {
  qqq () {
    return 1
  },
  rrr: 8
}
`
