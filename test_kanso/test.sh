#!/bin/sh

PATH="../node_modules/.bin:$PATH"

couch="http://localhost:5984"
db="$couch/stew_test"

curl -X DELETE "$db"
kanso upload --force docs "$db"
kanso push . "$db"

echo
set -x
curl -i "$db/_design/stew_test/_view/fruit?group_level=1"
