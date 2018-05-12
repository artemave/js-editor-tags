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
  },
  rrr: 8
}
`,
  expected: `!_TAG_FILE_FORMAT	2	/extended format/
!_TAG_FILE_SORTED	1	/0=unsorted, 1=sorted, 2=foldcase/
Stuff	/Users/artem/projects/js-tags/test/stuff.js	18	"	c
a	/Users/artem/projects/js-tags/test/stuff.js	14	"	p
bbb	/Users/artem/projects/js-tags/test/stuff.js	10	"	v
blah	/Users/artem/projects/js-tags/test/stuff.js	19	"	m
ccc	/Users/artem/projects/js-tags/test/stuff.js	11	"	v
ddd	/Users/artem/projects/js-tags/test/stuff.js	11	"	v
eee	/Users/artem/projects/js-tags/test/stuff.js	12	"	v
fff	/Users/artem/projects/js-tags/test/stuff.js	12	"	v
ggg	/Users/artem/projects/js-tags/test/stuff.js	13	"	v
hhh	/Users/artem/projects/js-tags/test/stuff.js	14	"	v
iii	/Users/artem/projects/js-tags/test/stuff.js	15	"	v
kkk	/Users/artem/projects/js-tags/test/stuff.js	16	"	v
lll	/Users/artem/projects/js-tags/test/stuff.js	22	"	i
mmm	/Users/artem/projects/js-tags/test/stuff.js	23	"	i
nestedFunction	/Users/artem/projects/js-tags/test/stuff.js	4	"	f
nnn	/Users/artem/projects/js-tags/test/stuff.js	24	"	i
ooo	/Users/artem/projects/js-tags/test/stuff.js	25	"	i
pf	/Users/artem/projects/js-tags/test/stuff.js	27	"	v
ppp	/Users/artem/projects/js-tags/test/stuff.js	25	"	i
qqq	/Users/artem/projects/js-tags/test/stuff.js	28	"	m
rrr	/Users/artem/projects/js-tags/test/stuff.js	31	"	p
topLevelFunction	/Users/artem/projects/js-tags/test/stuff.js	3	"	f`
}
