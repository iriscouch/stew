// Stew tests
//


var tap = require('tap')
  , test = tap.test
  , util = require('util')

var stew = require('../views/lib/stew')

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

test('Reducer function', function(t) {
  var result
    , vals = [ { 'pins': 1 }
             , { 'pins': 2 }
             , { 'pins': 3, 'jason':23 }
             , { 'pins': 4 }
             ]
    , keys = ks(vals)

  result = stew.reduce(keys, vals, false, 'pins')

  t.equal(Object.keys(result).length, 2, 'Two keys in the final reduction')
  t.equal(result.count, 4, 'Reducer counted all four values')
  t.equal(result.pins, 10, 'Reducer accumulated all pins')

  result = null
  t.doesNotThrow(function() {
    result = stew.reduce(keys, vals, false, 'pins', 'jason', 'smith')
  }, 'Reducer is okay with missing values')

  t.ok('jason' in result, 'Reducer accumulated semi-missing key "jason"')
  t.ok('smith' in result, 'Reducer accumulated missing key "smith"')

  t.equal(result.jason, 23, 'Reducer accumulated semi-missing value "jason"')
  t.equal(result.smith,  0, 'Reducer accumulated missing key "smith"')

  t.end()
})

test('Adding values to reductions', function(t) {
  var KB = 1024
    , MB = KB * 1024
    , GB = MB * 1024
    , vals = [ { 'text':1*KB, 'docs':1*MB, 'all':1*GB }
             , { 'text':2*KB, 'docs':2*MB, 'all':3*GB }
             , { 'text':3*KB, 'docs':3*MB, 'all':2*GB }
             ]

  function to_kb(val) { return val / KB }
  function to_mb(val) { return val / MB }
  function to_gb(val) { return val / GB }

  var reducer
  t.doesNotThrow(make_reducer, 'No problem adding .convert options')
  function make_reducer() {
    reducer = stew.reducer('text', 'docs', 'all')
                  .convert('text', 'text_kb', to_kb)
                  .convert('text', 'text_mb', to_mb)
                  .convert('text', 'text_gb', to_gb)
                  .convert('docs', 'docs_kb', to_kb)
                  .convert('docs', 'docs_mb', to_mb)
                  .convert('docs', 'docs_gb', to_gb)
                  .convert('all' , 'all_kb' , to_kb)
                  .convert('all' , 'all_mb' , to_mb)
                  .convert('all' , 'all_gb' , to_gb)
  }

  t.ok(reducer, 'Built a converting reducing function')

  var result = reducer(ks(vals), vals, false)
  t.ok(result, 'Got a result from reducer with conversion function')

  // The count, plus the three original keys, plus three converters for each of them
  t.equal(Object.keys(result).length, 1 + 3 + (3 * 3), 'Result has all values and all converted values')
  t.equal(result.count, 3, 'Converters do not impact the count')

  t.equal(result.text, 6*KB, 'Correct sum for text')
  t.equal(result.docs, 6*MB, 'Correct sum for docs')
  t.equal(result.all , 6*GB, 'Correct sum for all')

  t.equal(result.text_kb, 6*KB / 1024, 'Correct converted sum for text_kb')
  t.equal(result.docs_kb, 6*MB / 1024, 'Correct converted sum for docs_kb')
  t.equal(result.all_kb , 6*GB / 1024, 'Correct converted sum for docs_kb')

  t.equal(result.text_mb, 6*KB / (1024*1024), 'Correct converted sum for text_mb')
  t.equal(result.docs_mb, 6*MB / (1024*1024), 'Correct converted sum for docs_mb')
  t.equal(result.all_mb , 6*GB / (1024*1024), 'Correct converted sum for docs_mb')

  t.equal(result.text_gb, 6*KB / (1024*1024*1024), 'Correct converted sum for text_gb')
  t.equal(result.docs_gb, 6*MB / (1024*1024*1024), 'Correct converted sum for docs_gb')
  t.equal(result.all_gb , 6*GB / (1024*1024*1024), 'Correct converted sum for docs_gb')

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
