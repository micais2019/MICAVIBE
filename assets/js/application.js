$(function () {
  startWebsocket()

  $('#toggle-history').on('click', function () {
    var $h = $('#history'),
      $th = $('#toggle-history')
    if ($h.is(":visible")) {
      $th.text("show monitor")
      $h.hide()
    } else {
      $th.text("hide monitor")
      $h.show()
    }
  })
})

function formattedDate(date) {
  var ts = new Date()
  ts.setTime(parseInt(date) * 1000)
  return dateFns.format(ts, "MM.DD.YYYY HH:mm:ss")
}
