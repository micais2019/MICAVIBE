// To use guli
// gulp 4.0.0

const { src, dest, parallel, watch } = require("gulp");
const cleanCss = require("gulp-clean-css");
const concatCss = require("gulp-concat-css");
const uglify = require('gulp-uglify-es').default;
const concat = require("gulp-concat");

function css() {
  return src('assets/css/*.css')
    .pipe(cleanCss({compatibility: 'ie10'}))
    .pipe(concatCss("style.css"))
    .pipe(dest('public/css'))
}

function js() {
  return src('assets/js/vendor/*.js')
    .pipe(src([
      'assets/js/socket.js',
      'assets/js/menu.js',
      'assets/js/application.js',
      'assets/js/sketches.js',
      'assets/js/sketches/*.js'
    ]))
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .on('error', function (err) {
      console.log(err.toString());
      this.emit('end');
    })
    .pipe(dest('public/js'))
}

exports.js = js;
exports.css = css;
exports.default = parallel(css, js);

exports.watch = function () {
  const watcher = watch(['assets/**/*']);

  watcher.on('change', function(path, stats) {
    console.log(`File ${path} was changed`);
    if (/.*\.js/.test(path)) {
      console.log('  rebuild js');
      js()
    } else if (/.*\.css/.test(path)) {
      console.log('  rebuild css');
      css()
    }
  });
}
