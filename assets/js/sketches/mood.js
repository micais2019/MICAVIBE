window.sketches.mood = createProcessingSketch('mood', function (self, p) {
  var mood_colors = []

  // taken directly from LED code
  var COLORS = [
    p.color(0, 192, 0),
    p.color(250, 128, 0),
    p.color(234, 21, 0),
    p.color(216, 0, 39),
    p.color(255, 0, 0),
    p.color(108, 0, 147),
    p.color(0, 64, 255),
    p.color(0, 0, 150),
  ]

  var UNDEF_COLOR = p.color(100, 100, 100)

  var bars = []

  p.setup = function () {
    p.createCanvas(self.width, self.height)
    p.frameRate(1)

    // direct Adafruit IO API request
    fetch("https://io.adafruit.com/api/v2/mica_ia/feeds/mood/data?limit=100").then(function (response) {
      return response.json()
    }).then(function (json) {
      if (Array.isArray(json) && json.length > 0) {
        json.forEach(function (datum) {
          p.onData(datum, false)
        })

        p.drawBars()
      }
    })
  }

  p.draw = function () {
    // no-op, only draws on new data
    p.drawBars(0)
  }

  p.onData = function (data, draw=true) {
    // ignore reconnect values
    if (data.mode && data.mode === 'reconnect') return

    data.value.split(' ').forEach(function (value) {
      mood_colors.push(parseInt(value))
    })

    while (mood_colors.length > 120) mood_colors.shift()

    if (draw) {
      p.drawBars()
    }
  }

  p.drawBars = function () {
    rects()
    // gradients()
  }

  const gradients = function () {
    var bar_width = p.width / mood_colors.length

    // Draw with lerping between colors
    p.strokeWeight(1)
    for (var x=0; x < p.width; x++) {
      var curr = Math.floor(x / bar_width)
      var next = Math.floor(x / bar_width) + 1
      var perc = (x % bar_width) / bar_width
      if (next >= mood_colors.length) next = 0
      var sc = COLORS[mood_colors[curr]]
      var ec = COLORS[mood_colors[next]]
      if (!sc) sc = UNDEF_COLOR
      if (!ec) ec = UNDEF_COLOR
      p.stroke(p.lerpColor(sc, ec, perc))
      p.line(x, 0, x, p.height)
    }
  }

  const rects = function () {
    var bar_width = p.width / mood_colors.length
    p.noStroke()
    mood_colors.forEach(function (c, idx) {
      p.fill(COLORS[c])
      p.rect(idx * bar_width, 0, bar_width + 1, p.height)
    })
  }
})

