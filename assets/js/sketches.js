if (!window.sketches) {
  window.sketches = {}
}

function createProcessingSketch(channel, callback) {
  return function (container) {
    console.log("[createProcessingSketch] got container")
    var sketch = function (p) {
      var self = this
      var resize = function () {
        self.width = $(container).width()
        self.height = $(container).height()
        console.log("got size", { width: self.width, height: self.height })
      }
      resize()

      // user defined callback includes only the actual Processing drawing code
      callback(self, p)

      p.windowResized = _.debounce(function () {
        resize()
        p.resizeCanvas(self.width, self.height);
      }, 300)

      setTimeout(function () {
        // give the p5 sketch time to start before pumping data
        window.Socket.on('data.' + channel, function (data) {
          if (p.onData) {
            p.onData(data)
          }
        })
      }, 100)
    }

    return new p5(sketch, container)
  }
}
