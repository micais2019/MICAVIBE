window.sketches.data = createProcessingSketch('*', function (self, p) {
  var records = []
  var ysteps = 16

  //
  // p5.js drawing code, default functions
  //
  p.setup = function () {
    p.createCanvas(self.width, self.height);
    p.noStroke();
  }

  p.draw = function () {
    p.background(0)

    records.forEach(function (record, idx) {
      var ystep = (p.height / ysteps)
      var ypos = (ystep * idx) + ystep/2

      p.fill(0)
      p.rect(0, ypos, p.width, 50)
      p.fill(255)
      p.text(record.key + ": " + record.value, 10, ypos)
    })
  }

  p.onData = function (data) {
    records.push(data)

    if (records.length > ysteps) {
      records.shift()
    }
  }

  // custom drawing functions
  p.drawValue = function (x, y, value) {
    var x = Math.floor(currentSpot / ysteps)
    var y = currentSpot - (x * ysteps)

    var xs = p.width / xsteps
    var ys = p.height / ysteps

    p.fill(0, 200, 0)
    p.ellipse(x * xs, y * ys, 30, 30)

    currentSpot = (currentSpot + 1) % (xsteps * ysteps)
  }

})
