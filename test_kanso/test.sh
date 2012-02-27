#!/bin/sh

PATH="../node_modules/.bin:$PATH"

couch="http://localhost:5984"
db="$couch/stew_test"

kanso upload --force docs "$db"
kanso push . "$db"
