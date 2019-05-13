const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("public/data/archive.sqlite")

const ts = '1557186910'

// MOOD
db.all(`
  SELECT *
  FROM data
  WHERE key = 'mood' AND
        created_at < '${ts}'
  ORDER BY created_at DESC
  LIMIT 100
`, (err, result) => {
  if (err) { console.error("ERROR", err) }
  if (result) {
    console.log("MOOD -------------------------------------")
    console.log(result.map(r => r.value).join(' '))
  }
})

db.all(`
  SELECT *
  FROM data
  WHERE key = 'sound' AND
        created_at < '${ts}'
  ORDER BY created_at DESC
  LIMIT 5
`, (err, result) => {
  if (err) { console.error("ERROR", err) }
  if (result) {
    console.log("sound -------------------------------------")
    console.log(result.map(r => r['value']).join('\n'))
  }
})

db.all(`
  SELECT *
  FROM data
  WHERE key = 'sound-2' AND
        created_at < '${ts}'
  ORDER BY created_at DESC
  LIMIT 5
`, (err, result) => {
  if (err) { console.error("ERROR", err) }
  if (result) {
    console.log("sound-2 -------------------------------------")
    console.log(result.map(r => r['value']).join('\n'))
  }
})

db.all(`
  SELECT *
  FROM data
  WHERE key = 'motion' AND
        created_at < '${ts}'
  ORDER BY created_at DESC
  LIMIT 8
`, (err, result) => {
  if (err) { console.error("ERROR", err) }
  if (result) {
    console.log("motion -------------------------------------")
    console.log(result.map(r => r['value']).join('\n'))
  }
})
