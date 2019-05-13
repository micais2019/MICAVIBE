window.DEBUG = false

function WebSocketClient() {
  this.reconnect_interval = 1500;
}

WebSocketClient.prototype.open = function (url) {
  this.url = url
  this.instance = new WebSocket(this.url);

  var self = this

  this.instance.onopen = function () {
    if (window.DEBUG)
      console.log("[WebSocketClient on open]")
    self.onopen()
  }

  this.instance.onclose = function (evt) {
    if (window.DEBUG)
      console.log("[WebSocketClient on close]")
    switch (evt.code){
    case 1000:  // CLOSE_NORMAL
      if (window.DEBUG)
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
    if (window.DEBUG)
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
    if (window.DEBUG)
      console.log("[WebSocketClient on message]")
    self.onmessage(evt.data)
  }

  if (window.DEBUG)
    console.log("[WebSocketClient open] completed")
}

WebSocketClient.prototype.removeAllListeners = function () {
  this.instance.onopen = null
  this.instance.onclose = null
  this.instance.onerror = null
  this.instance.onmessage = null
}

WebSocketClient.prototype.reconnect = function (evt) {
  if (window.DEBUG)
    console.log("WebSocketClient: retry in", this.reconnect_interval, "ms", evt);
  this.removeAllListeners();

  var self = this
  setTimeout(function() {
    if (window.DEBUG)
      console.log("WebSocketClient: reconnecting...")
    self.open(self.url)
  }, this.reconnect_interval)
}

window.Socket = new EventEmitter3()

function startWebsocket(callback) {
  var sock = new WebSocketClient()
  sock.open(window.WS_URL)

  sock.onopen = function (event) {
    console.log("socket connected")
  }

  sock.onclose = function () {
    console.log("socket closed")
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
          window.Socket.emit('data.*', message)
          if (message.key) {
            window.Socket.emit('data.' + message.key, {
              key: message.key,
              value: message.value,
              created_at: message.created_at,
              mode: message.mode ? message.mode : 'live'
            })
          } else {
            window.Socket.emit('data', message)
          }
        }
      }
      reader.readAsText(data)
    } else if (typeof data == "string") {
      var message = JSON.parse(data)
      if (callback) {
        callback(message)
      } else {
        window.Socket.emit('data.*', message)
        if (message.key) {
          window.Socket.emit('data.' + message.key, {
            key: message.key,
            value: message.value,
            created_at: message.created_at,
            mode: message.mode ? message.mode : 'live'
          })
        } else {
          window.Socket.emit('data', { message: message })
        }
      }
    }
  }
}
