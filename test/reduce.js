// Easy Reduce tests
//

var easy = require('../views/lib/easy-reduce')

function test() {
  var assert = require('assert')

  var keys = ['row1', 'row2', 'row3']
    , vals = [ { 'name':'Bob', 'people':2, 'pencils':1  }
             , { 'name':'Joe', 'people':5               }
             , { 'name':'Ann', 'people':3, 'pencils':15 }
             ]

  var reduce = easy.reducer('people', 'pencils')
    , result = reduce(keys, vals, false)

  assert.equal(result.count  , 3 , 'Three rows emitted')
  assert.equal(result.people , 10, 'Ten total people')
  assert.equal(result.pencils, 16, "Sixteen pencils, Joe's missing value counts as 0")
  assert.equal(result.name, undefined, 'No .name value since it was not in the definition')

  console.log('ok')
}

if(require.main === module)
  test()
