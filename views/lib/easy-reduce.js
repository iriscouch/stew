// Stew reducer
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

exports.reducer = define_easy_reducer

function define_easy_reducer() {
  // Return a CouchDB reduce function which accumulates all the desired keys in
  // an object. The exception is a "count" key which is the count of total objects.

  var key_names = Array.prototype.slice.apply(arguments)

  // Always have a "count" key to count the total rows emitted.
  if(!~ key_names.indexOf('count'))
    key_names.push('count')

  return reducer
  function reducer(keys, vals, rereduce) {
    var initial_values = {}
    key_names.forEach(function(key) {
      initial_values[key] = 0
    })

    return vals.reduce(accumulator, initial_values)
    function accumulator(state, value) {
      var result = {} // Stores state + value
      key_names.forEach(function(key) {
        if(rereduce)
          result[key] = state[key] + (value[key] || 0) // rereduce always accumultates

        else if(key != 'count')
          result[key] = state[key] + (value[key] || 0) // Most values just accumulate too

        else if(key == 'count')
          result[key] = state[key] + 1               // Count is a counter
      })

      return result
    }
  }
}
