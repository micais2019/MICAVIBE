var Request = require('request-promise');

function Weather(io_key, callback) {
  var url = "https://io.adafruit.com/api/v2/mica_ia/integrations/weather/2222"
  var options = {
    uri: url,
    method: 'GET',
    headers: {
      'X-AIO-Key': io_key,
      'Content-Type': 'application/json'
    },
    json: true // Automatically parses the JSON string in the response from Adafruit IO
  };
  Request(options).
    then(function (data) {
      callback(data)
    }).catch(function (err) {
      callback()
    })
}

module.exports = Weather
