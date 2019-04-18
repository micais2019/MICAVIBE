window.sketches.mood = createProcessingSketch('mood', function (self, p) {
  var mood_colors = []

  // taken directly from LED code
  var COLORS = [
    [0, 192, 0],
    [250, 128, 0],
    [234, 21, 0],
    [216, 0, 39],
    [255, 0, 0],
    [108, 0, 147],
    [0, 64, 255],
    [0, 0, 150],
  ]

  p.setup = function () {
    p.createCanvas(self.width, self.height)
    p.noStroke()
    p.frameRate(4)

    // direct Adafruit IO API request
    fetch("https://io.adafruit.com/api/v2/mica_ia/feeds/mood/data?limit=25").then(function (response) {
      return response.json()
    }).then(function (json) {
      if (Array.isArray(json) && json.length > 0) {
        json.forEach(function (datum) {
          p.onData(datum)
        })
      }
    })
  }

  p.draw = function () {
    // no-op, only draws on new data
  }

  p.onData = function (data) {
    // ignore reconnect values
    if (data.mode && data.mode === 'reconnect') return

    data.value.split(' ').forEach(function (value) {
      mood_colors.push(parseInt(value))
    })

    p.background(0)

    var xstep = p.width / mood_colors.length
    while (xstep < 4) {
      // pull off the front of the list
      mood_colors.shift()
      xstep = p.width / mood_colors.length
    }

    mood_colors.forEach(function (color, idx) {
      p.fill(COLORS[color])
      p.rect(idx * xstep, 0, xstep + 1, p.height)
    })
  }
})

