function msg(message) {
  $('#history').append("<div class='row'>" + message + "</div>")
}

function showValue(record) {
  console.log("unpack ", record)

  var key = record.key
  var value = / /.test(record.value) ? record.value : parseInt(record.value)
  if (isNaN(value)) {
    value = record.value
  }

  var $f = $('#' + key)
  $('.value', $f).text(value)
}

// https://github.com/websockets/ws/wiki/Websocket-client-implementation-for-auto-reconnect
function WebSocketClient() {
  this.interval = 5000;
}

WebSocketClient.prototype.open = function (url) {
  this.url = url
  this.instance = new WebSocket(this.url);

  var self = this

  this.instance.onopen = function () {
    console.log("[WebSocketClient on open]")
    self.onopen()
  }

  this.instance.onclose = function (evt) {
    console.log("[WebSocketClient on close]")
    switch (evt.code){
    case 1000:  // CLOSE_NORMAL
      console.log("WebSocketClient: closed");
      break;
    default:  // Abnormal closure
      self.reconnect(evt);
      break;
    }
    if (self.onclose)
      self.onclose(evt);
  }

  this.instance.onerror = function (evt) {
    console.log("[WebSocketClient on error]")
    switch (evt.code){
    case 'ECONNREFUSED':
      self.reconnect(evt);
      break;
    default:
      if (self.onerror) self.onerror(evt);
      break;
    }
  }

  this.instance.onmessage = function (evt) {
    console.log("[WebSocketClient on message]")
    self.onmessage(evt.data)
  }

  console.log("[WebSocketClient open] completed")
}

WebSocketClient.prototype.removeAllListeners = function () {
  this.instance.onopen = null
  this.instance.onclose = null
  this.instance.onerror = null
  this.instance.onmessage = null
}

WebSocketClient.prototype.reconnect = function (evt) {
  console.log("WebSocketClient: retry in", this.interval, "ms", evt);
  this.removeAllListeners();

  var self = this
  setTimeout(function() {
    console.log("WebSocketClient: reconnecting...")
    self.open(self.url)
  }, this.interval)
}

function startWebsocket(callback) {
  msg("connecting to websocket")

  var sock = new WebSocketClient()
  sock.open(window.WS_URL)

  sock.onopen = function (event) {
    $('#indicator').removeClass('disconnected').addClass('connected')
    msg("connected")
  }

  sock.onclose = function () {
    $('#indicator').addClass('disconnected').removeClass('connected')
  }
  sock.onerror = sock.onclose

  sock.onmessage = function (data) {
    if (data instanceof Blob) {
      var reader = new FileReader()
      reader.onload = function () {
        var message = JSON.parse(reader.result)
        if (callback) {
          callback(message)
        } else {
          showValue(message)
        }
        msg(JSON.stringify(message))
      }
      reader.readAsText(data)
    } else if (typeof data == "string") {
      var message = JSON.parse(data)
      if (callback) {
        callback(message)
      } else {
        showValue(message)
      }
      msg(JSON.stringify(message))
    }
  }
}
