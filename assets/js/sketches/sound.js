// log base x of y
function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}


// constants
var DX = -1.8

window.sketches.sound = createProcessingSketch(['sound', 'sound-2'], function (self, p) {
  var SoundValue = function (x, value) {
    this.x = x
    this.value = value
  }

  SoundValue.prototype.update = function () {
    this.x += DX

    if (this.x < -10) {
      this.delete = true
    }
  }

  var soundData = {
    'sound': {
      values: [],
      lastUpdate: 0
    },
    'sound-2': {
      values: [],
      lastUpdate: 0
    }
  }

  var soundBars = [
    [],
    []
  ]

  //
  // p5.js drawing code, default functions
  //
  // NOTE: Sketch size should always come from self.width and self.height.
  // After createCanvas is called, other functions can use p.width and
  // p.height. Since the container might change while the sketch is running,
  // sketches MAY NOT assume that any particular geometry will be available.
  //
  p.setup = function () {
    p.createCanvas(self.width, self.height);
    p.noStroke();
  }

  // required
  p.draw = function () {
    p.background(0)

    p.updateBar(soundData['sound'], 0)
    p.updateBar(soundData['sound-2'], 1)

    p.drawBar(0, 0, p.height / 2)
    p.drawBar(1, p.height/2 + 1, p.height)
  }

  // required
  p.onData = function (data) {
    var values = data.value.split(' ').map(function (v) { return parseInt(v) })
    // add sound values to animate
    values.forEach(function (val) {
      if (!isNaN(val)) {
        soundData[data.key].values.push(val)
      }
    })
  }


  var INTERVAL = 100
  p.updateBar = function (sound, barIndex) {
    var bar = soundBars[barIndex]
    var xstep = p.width / 60

    var now = p.millis()
    if (now - sound.lastUpdate > INTERVAL && sound.values.length > 0) {
      // add the oldest value from sound data to drawing data
      var nextValue = sound.values.shift()
      if (typeof nextValue !== 'undefined' && !isNaN(nextValue)) {
        bar.push(new SoundValue(p.width, nextValue))
      }
      sound.lastUpdate = now
    } else {
      bar.forEach(function (value) {
        value.update()
      })

      for (var i = Math.min(bar.length - 1, 10); i >= 0; i--) {
        if (bar[i].delete) {
          bar.splice(i, 1)
        }
      }
    }
  }

  p.drawBar = function (barIndex, topY, botY) {
    var bar = soundBars[barIndex]
    var xstep = p.width / 48
    var maxHeight = botY - topY

    bar.forEach(function (sval) {
      var constrained = Math.min(Math.max(0, sval.value), 10000)

      var h = p.map(constrained, 0, 10000, 0, maxHeight)
      var c = p.lerpColor(p.color([0, 0, 150]), p.color([255, 28, 10]), h / maxHeight)

      p.fill(c)
      p.rect(sval.x, botY - h, xstep + 1, h)
    })
  }
})

