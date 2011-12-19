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
    , result = reducer(ks(vals), vals, false)

  t.equal(result.count  , 3 , 'Three rows emitted')
  t.equal(result.people , 10, 'Ten total people')
  t.equal(result.pencils, 16, "Sixteen pencils, Joe's missing value counts as 0")
  t.equal(Object.keys(result).length, 3, 'Only keys for people, pencils, and count')

  t.end()
})

test('Reducer input validation', function(t) {
  var vals = [ { 'n': 1 }
             , { 'n': 2 }
             , { 'n': 3 }
             ]
    , keys = ks(vals)

  t.ok(stew.reduce, 'Reduce function is in the API')

  t.throws(function() { stew.reduce()                        }, 'Throw for zero parameters')
  t.throws(function() { stew.reduce(keys)                    }, 'Throw for one parameter')
  t.throws(function() { stew.reduce(keys, vals)              }, 'Throw for two parameters')
  t.throws(function() { stew.reduce(keys, vals, false)       }, 'Throw for three parameters')

  t.throws(function() { stew.reduce(false, vals, false, 'n')}, 'Throw for boolean keys')
  t.throws(function() { stew.reduce('[1]', vals, false, 'n')}, 'Throw for string keys')
  t.throws(function() { stew.reduce({x:1}, vals, false, 'n')}, 'Throw for object keys')

  t.throws(function() { stew.reduce(keys, true , false, 'n')}, 'Throw for boolean vals')
  t.throws(function() { stew.reduce(keys, '[2]', false, 'n')}, 'Throw for string vals')
  t.throws(function() { stew.reduce(keys, {a:2}, false, 'n')}, 'Throw for object vals')

  t.throws(function() { stew.reduce(keys, vals, 'true', 'n')}, 'Throw for string rereduce')
  t.throws(function() { stew.reduce(keys, vals, [true], 'n')}, 'Throw for array rereduce')
  t.throws(function() { stew.reduce(keys, vals, {c:3} , 'n')}, 'Throw for object rereduce')

  t.throws(function() { stew.reduce(keys, vals, false, true )}, 'Throw for boolean key name')
  t.throws(function() { stew.reduce(keys, vals, false, ['x'])}, 'Throw for array key name')
  t.throws(function() { stew.reduce(keys, vals, false, {k:5})}, 'Throw for object key name')

  t.end()
})

//
// Utils
//

// Make up some keys for some values
function ks(vals) {
  var result = []
  vals.forEach(function(val, i) { result.push('key_' + (i+1)) })
  return result
}
