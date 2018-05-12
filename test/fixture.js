/* eslint-disable */

module.exports = {
  source: `

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
  }
}
`,
  expected: `!_TAG_FILE_FORMAT	2	/extended format/
!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/
Stuff	test/stuff.js	18	"	c
bbb	test/stuff.js	10	"	v
blah	test/stuff.js	19	"	m
ccc	test/stuff.js	11	"	v
ddd	test/stuff.js	11	"	v
eee	test/stuff.js	12	"	v
fff	test/stuff.js	12	"	v
ggg	test/stuff.js	13	"	v
hhh	test/stuff.js	14	"	v
iii	test/stuff.js	15	"	v
kkk	test/stuff.js	16	"	v
lll	test/stuff.js	22	"	i
mmm	test/stuff.js	23	"	i
nestedFunction	test/stuff.js	4	"	f
nnn	test/stuff.js	24	"	i
ooo	test/stuff.js	25	"	i
pf	test/stuff.js	27	"	v
ppp	test/stuff.js	25	"	i
qqq	test/stuff.js	28	"	m
topLevelFunction	test/stuff.js	3	"	f`
}
