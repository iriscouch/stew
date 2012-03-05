exports.views = views()

function views() {
  return {'fruit':fruit()}
}

function fruit() {
  var view = {}

  view.map = function(doc) {
    emit(doc._id, doc)
  }

  view.reduce = function(keys, vals, rereduce) {
    var stew = require('views/lib/stew')
      , reducer = stew.reducer('apples', 'oranges', 'guavas')

    return reducer(keys, vals, rereduce)
  }

  return view
}
