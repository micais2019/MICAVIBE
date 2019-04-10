// Based on the original Welcome to Glitch web app.

// server.js
// where your node app starts

var nconf = require('nconf');
nconf.argv()
  .env()
  .file({ file: process.env.NCONF_FILE });

// set up express (the web service framework powering this app https://expressjs.com/)
var Request = require('request-promise');
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var bodyParser = require('body-parser');
var mqtt = require('mqtt');
var SocketCollection = require('./socket_collection')

var Datastore = require('nedb'),
  // Security note: the database is saved to the file `datafile` on the local filesystem.
  // It's deliberately placed in the `.data` directory which doesn't get copied if
  // someone remixes the project.
  db = new Datastore({ filename: '.data/datafile', autoload: true });

// POST requests should unpack form data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// get IO user, key, and feed from .env file
var IO_USERNAME = nconf.get('IO_USERNAME')
var IO_KEY = nconf.get('IO_KEY')

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.set('view engine', 'hbs');

//////////////////// MQTT

var client = mqtt.connect('mqtts://io.adafruit.com', { username: IO_USERNAME, password: IO_KEY })

client.on('connect', function () {
  let topic = IO_USERNAME + "/dashboard/stream/create"

  client.subscribe(topic, function (err) {
    console.log("mqtt connected and subscribed: ", topic)
  })
})

var lastValues = {}

client.on('message', function (topic, message) {
  // message is Buffer
  const data = JSON.parse(message.toString())

  const fwd = () => {
    console.log("[MQTT]", topic, message.toString())
    sockets.onMessage(JSON.stringify({
      id: data.id,
      value: data.value,
      key: data.feed_key,
      created_at: data.created_at
    }))
  }

  db.update({ key: data.feed_key }, {$set: {value: data.value, created_at: data.created_at}}, function (err, n) {
    if (n === 0) {
      db.insert({ key: data.feed_key, value: data.value, created_at: data.created_at })
    }
    fwd()
  })
})

//////////////////// END MQTT



//////////////////// WEBSOCKET

var sockets = new SocketCollection()
app.ws('/streaming', function(ws, req) {
  console.log("got client connection")
  sockets.addConnection(ws)

  db.find({}, function (err, feeds) { // Find all values in the collection
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
  var url = "https://io.adafruit.com/api/v2/mica_ia/integrations/weather/2222"

  var options = {
    uri: url,
    method: 'GET',
    headers: {
      'X-AIO-Key': IO_KEY,
      'Content-Type': 'application/json'
    },
    json: true // Automatically parses the JSON string in the response from Adafruit IO
  };
  Request(options).
    then(function (data) {
      res.send(JSON.stringify(data))
    }).catch(function (err) {
      res.send(JSON.stringify({ error: err.message }))
    })
});

// This route sends the homepage
app.get("/", function (req, res) {
  res.render('index', { WS_URL: nconf.get('WS_URL') })
});

// static pages
app.get(/\/(motion|sound|mood|love|about)/, function (req, res) {
  var page = req.path.replace('/','')
  res.render(page, { WS_URL: nconf.get('WS_URL') })
});

// /motion
app.get("/mood", function (req, res) {
  res.render('mood', { WS_URL: nconf.get('WS_URL') })
});

// start listening for requests :)
var listener = app.listen(nconf.get('PORT'), function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
