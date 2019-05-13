/*
 * Convert a two-column csv file into a sqlite3 database file
 *
 * Usage:
 *   DATA_IN='public/data/sound-2.csv' FEED_KEY='sound-2' \
 *     DATA_OUT='public/data/archive.sqlite' \
 *     node  --max_old_space_size=8192  bin/create_db.js
 *
 * By keeping the same DATA_OUT value, all the data streams can be combined into one DB
 */
const sqlite3 = require('sqlite3'),
  fs = require('fs'),
  readline = require('readline');

const data_file = process.env.DATA_IN
const db_file = process.env.DATA_OUT
const feed_key = process.env.FEED_KEY

if (!(data_file && db_file)) {
  console.error("make sure DATA_IN='' and DATA_OUT='' env vars are set")
  process.exit(1)
}

console.log('<', data_file)
console.log('>', db_file)
const db = new sqlite3.Database(db_file, function (err) {
  const create_table = `
    CREATE TABLE IF NOT EXISTS data (
        key TEXT,
        value TEXT,
        created_at TEXT,
        score INT
    );
    CREATE INDEX IF NOT EXISTS index_data_created_at ON data ( created_at ASC );
    CREATE INDEX IF NOT EXISTS index_data_key_created ON data ( key, created_at );
  `

  if (err) {
    console.error('failed to open', err)
  } else {
    console.log("CREATING")
    db.exec(create_table, function (cerr) {
      if (cerr) {
        console.error('failed to create', cerr)
      } else {
        console.log('created db')
      }
    })
  }

  const readInterface = readline.createInterface({
    input: fs.createReadStream(data_file),
    crlfDelay: Infinity
  });

  let documents = []
  readInterface.on('line', function (line) {
    const [ ts, value ] = line.split(',')
    documents.push([ feed_key, ts, value ])
  })


  const doInsert = function (batches, statement) {
    const batch = batches.shift()

    if (batch) {
      const flat_batch = []
      batch.forEach(record => {
        record.forEach(r => flat_batch.push(r))
      })
      statement.run(flat_batch, (err) => {
        if (err) {
          console.error("failed INSERT of", batch, err)
          process.exit(1)
        } else {
          console.log("INSERT", batch.length, "LIKE", batch[0])
          doInsert(batches, statement)
        }
      })
    } else {
      console.log("FINISHED!")
    }
  }

  readInterface.on('close', function () {
    console.log("INSERT", documents.length)
    let count = 0
    let batch = []
    let batches = []

    documents.forEach(doc => {
      batch.push(doc)

      if (batch.length === 100) {
        const batch_copy = batch.slice()
        batches.push(batch_copy)
        batch = []
      }
    })

    let collection = []
    for (var i=0; i < 100; i++) {
      collection.push("(?, ?, ?)")
    }
    const statement = db.prepare(`INSERT INTO data (key, created_at, value) VALUES ${collection.join(',')};`)

    doInsert(batches, statement)
  })
})

