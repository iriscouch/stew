// Stew tests
//


var tap = require('tap')
  , test = tap.test
  , util = require('util')

var stew = require('../views/lib/stew')

test('Defining reducers', function(t) {
  var vals = [ { 'name':'Bob', 'people':2, 'pencils':1  }
             , { 'name':'Joe', 'people':5               }
             , { 'name':'Ann', 'people':3, 'pencils':15 }
             ]

  var reducer = stew.reducer('people', 'pencils')
    , result = reducer(keys(vals), vals, false)

  t.equal(result.count  , 3 , 'Three rows emitted')
  t.equal(result.people , 10, 'Ten total people')
  t.equal(result.pencils, 16, "Sixteen pencils, Joe's missing value counts as 0")
  t.equal(Object.keys(result).length, 3, 'Only keys for people, pencils, and count')

  t.end()
})

//
// Utils
//

// Make up some keys for some values
function keys(vals) {
  var result = []
  vals.forEach(function(val, i) { result.push('key_' + (i+1)) })
  return result
}
