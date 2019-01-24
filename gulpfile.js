const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const sass = require('gulp-sass')

const path = {
  bg: 'src/background/index.js',
  content: 'src/content/index.js',
  popup: 'src/popup/index.js',
  allScript: 'src/**/*.js',
  scss: 'src/**/*.scss',
  build: 'bundle',
}

gulp.task('scss', () => {
  return gulp.src(path.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.build))
})

gulp.task('buildBg', () => {
  return browserify(path.bg)
    .bundle()
    .pipe(source('background.js'))
    .pipe(buffer())
    .pipe(gulp.dest(path.build))
})

gulp.task('buildContent', () => {
  return browserify(path.content)
    .bundle()
    .pipe(source('content.js'))
    .pipe(buffer())
    .pipe(gulp.dest(path.build))
})

gulp.task('buildPopup', () => {
  return browserify(path.popup)
    .bundle()
    .pipe(source('popup.js'))
    .pipe(buffer())
    .pipe(gulp.dest(path.build))
})

gulp.task('watch', () => {
  gulp.watch(path.scss, gulp.series('scss'))
  gulp.watch(path.allScript, gulp.parallel('buildBg', 'buildContent', 'buildPopup'))
})

gulp.task('build', gulp.parallel('scss', 'buildBg', 'buildContent', 'buildPopup'))

gulp.task('default', gulp.parallel('watch'))
