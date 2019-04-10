function openNav() {
  $('nav').addClass('open')
}

function closeNav() {
  $('nav').removeClass('open')
}

function toggleNav() {
  if ($('nav').is('.open')) {
    closeNav()
  } else {
    openNav()
  }
}
