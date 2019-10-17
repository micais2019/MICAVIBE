// Based on the original Welcome to Glitch web app.

// server.js
// where your node app starts

var nconf = require('nconf');
nconf.argv()
  .env()
  .file({ file: process.env.NCONF_FILE });

// set up express (the web service framework powering this app https://expressjs.com/)
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var bodyParser = require('body-parser');
var mqtt = require('mqtt');
var SocketCollection = require('./socket_collection')
var Weather = require('./weather')

var Datastore = require('nedb'),
  sqlite3 = require('sqlite3'),
  // Security note: the database is saved to the file `datafile` on the local filesystem.
  // It's deliberately placed in the `.data` directory which doesn't get copied if
  // someone remixes the project.
  feeds = new Datastore({ filename: '.data/datafile', autoload: true }),
  weather = new Datastore({ filename: '.data/weather', autoload: true }),
  archive = new sqlite3.Database('public/data/archive.sqlite', sqlite3.OPEN_READONLY);

// POST requests should unpack form data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// get IO user, key, and feed from .env file
var IO_USERNAME = nconf.get('IO_USERNAME')
var IO_KEY = nconf.get('IO_KEY')
var APP_SECRET = nconf.get('APP_SECRET')

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Use `.hbs` for extensions and find partials in `views/partials`.
var hbs = require('express-hbs');
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials',
  defaultLayout: "views/layout.hbs"
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

//////////////////// MQTT

var client = mqtt.connect('mqtts://io.adafruit.com', { username: IO_USERNAME, password: IO_KEY })

client.on('connect', function () {
  let topic = IO_USERNAME + "/dashboard/stream/create"

  client.subscribe(topic, function (err) {
    console.log("mqtt connected and subscribed: ", topic)
  })
})

var lastValues = {}
var Sockets = new SocketCollection()

client.on('message', function (topic, message) {
  // message is Buffer
  const data = JSON.parse(message.toString())

  const fwd = () => {
    console.log("[MQTT]", topic, message.toString())
    Sockets.onMessage(JSON.stringify({
      id: data.id,
      value: data.value,
      key: data.feed_key,
      created_at: data.created_at
    }))
  }

  // update the last value record...
  feeds.update({ key: data.feed_key }, {$set: {value: data.value, created_at: data.created_at}}, function (err, n) {
    if (n === 0) {
      // or store it, if this is the first time we've seen it...
      feeds.insert({ key: data.feed_key, value: data.value, created_at: data.created_at })
    }
    // and send it along to all connected sockets
    fwd()
  })
})

//////////////////// END MQTT



//////////////////// MQTT SIMULATOR

const VIBE_START = Date.parse('2019-04-15T17:00-04:00') / 1000
const VIBE_END = Date.parse('2019-05-05T04:00-04:00') / 1000
const VIBE_LENGTH = VIBE_END - VIBE_START
const QUERY = archive.prepare(`SELECT * FROM data WHERE created_at = ?`)

function pulse(unix_epoch) {
  // get timestamp mod length of experiment
  const round = unix_epoch % VIBE_LENGTH
  const sim_stamp = VIBE_START + round

  // const time = new Date()
  // time.setTime(sim_stamp * 1000)
  // console.log("tick", { unix_epoch, round, sim_stamp, VIBE_LENGTH, time })

  try {
    QUERY.all(sim_stamp, function  (err, records) {
      if (err) {
        console.error("failed search", err)
      } else if(records.length > 0) {
        records.forEach(function (record) {
          const to_publish = {
            value: record.value,
            key: record.key,
            created_at: record.created_at
          }
          // console.log("PUB", to_publish)
          Sockets.onMessage(JSON.stringify(to_publish))
        })
      }
    })
  } catch (ex) {
    console.error("failed lookup", ex)
  }
}

let last_update = 0
function pulse_trigger() {
  const now = new Date().getTime()
  if (now - last_update > 1000) {
    pulse(Math.floor(now / 1000))
    last_update = now
  }
}
// setInterval(pulse_trigger, 50)

//////////////// END MQTT SIMULATOR
///////////////////////////////////



//////////////////// WEBSOCKET
app.ws('/streaming', function(ws, req) {
  console.log("got client connection")
  Sockets.addConnection(ws)

  // when a streaming client (browser + websocket) connects, send them the most
  // recent feed values
  feeds.find({}, function (err, feeds) { // Find all values in the collection
    console.log("found", feeds.length, "feeds")

    feeds.forEach(function(feed) {
      ws.send(JSON.stringify({
        key: feed.key,
        value: feed.value,
        created_at: feed.created_at,
        mode: "reconnect"
      }))
    })
  })
})

//////////////////// END WEBSOCKET

app.get("/weather", function (req, res) {
  var at = parseInt(req.query.at);

  if (isNaN(at)) {
    at = new Date().getTime()
  } else if (at < 2000000000) {
    at *= 1000
  }

  weather.findOne({at: { $lt: (new Date(at)).getTime() }}, function (err, doc) {
    if (doc) {
      var time = new Date(doc.at).toISOString()
      doc.at_formatted = time

      res.send(JSON.stringify(doc))
    } else {
      var empty = { at: at, current: {} }
      var time = new Date(at).toISOString()
      empty.at_formatted = time
      res.send(JSON.stringify(empty))
    }
  })
});

app.post("/weather", function (req, res) {
  var token = req.query.token;

  if (token !== APP_SECRET) {
    res.sendStatus(403)
    return
  }

  Weather(IO_KEY, function (data) {
    if (data) {
      // update local weather value in nedb
      weather.insert({
        at: (new Date()).getTime(),
        current: data.current
      }, function () {
        res.send(JSON.stringify(data))
      })
    } else {
      res.send(JSON.stringify({ error: "could not get weather from Adafruit IO" }))
    }
  })
})

// This route sends the homepage
app.get("/", function (req, res) {
  res.render('index', { WS_URL: nconf.get('WS_URL') })
});

// static pages
app.get(/\/(motion|sound|mood|love|about|data)/, function (req, res) {
  var page = req.path.replace('/','')
  res.render(page, { WS_URL: nconf.get('WS_URL') })
});

// start listening for requests :)
var listener = app.listen(nconf.get('PORT'), function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
