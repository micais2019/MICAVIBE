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

  $('.feed-value').on('click', function (evt) {
    var $p = $(evt.target).parent('.feed-value')
    console.log("evt", evt, $p.data('link'))
    if ($p.data('link')) {
      document.location.href = $p.data('link')
    }
  })
});
