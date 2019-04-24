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
