window.sketches.motion = createProcessingSketch('split-motion', function (self, p) {
  var xsteps = 8
  var ysteps = 6

  let fromC = p.color(0, 40, 255);
  let toC = p.color(218, 28, 0);

  p.setup = function () {
    p.createCanvas(self.width, self.height)
    p.noStroke()
    p.frameRate(10)
  }

  p.draw = function () {
    // background fader
    p.fill(0, 15)
    p.rect(0, 0, p.width, p.height)
  }

  p.onData = function (data) {
    var values = data.value.split(' ').map(function (v) {
      return parseInt(v)
    })

    values.forEach(function (v, idx) {
      var x = Math.floor(idx / ysteps)
      var y = idx - (x * ysteps)
      p.drawValue(x, y, v)
    })
  }

  // custom drawing functions
  p.drawValue = function (x, y, value) {
    // calculate step size
    var xs = p.width / xsteps
    var ys = p.height / ysteps

    var colr = p.lerpColor(fromC, toC, value / 127.0);
    if (value > 3) {
      p.fill(colr)
      p.rect(x * xs, y * ys, xs, ys)
    }
  }

})
