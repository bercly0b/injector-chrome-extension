const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify-es').default
const sass = require('gulp-sass')
const htmlmin = require('gulp-htmlmin')
const cleanCSS = require('gulp-clean-css')

const path = {
  bg: 'src/background/index.js',
  content: 'src/content/index.js',
  popup: 'src/popup/index.js',
  allScript: 'src/**/*.js',
  scss: 'src/**/*.scss',
  html: 'src/popup.html',
  manifest: 'src/manifest.json',
  icons: 'src/icons/*.png',
  build: 'bundle'
}

gulp.task('html', () => {
  return gulp.src(path.html)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(path.build))
})

gulp.task('icons', () => {
  return gulp.src(path.icons)
    .pipe(gulp.dest(`${path.build}/icons`))
})

gulp.task('manifest', () => {
  return gulp.src(path.manifest)
    .pipe(gulp.dest(path.build))
})

gulp.task('scss', () => {
  return gulp.src(path.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.build))
})

gulp.task('buildBg', () => {
  return browserify(path.bg)
    .bundle()
    .pipe(source('background.js'))
    .pipe(buffer())
    // .pipe(uglify())
    .pipe(gulp.dest(path.build))
})

gulp.task('buildContent', () => {
  return browserify(path.content)
    .bundle()
    .pipe(source('content.js'))
    .pipe(buffer())
    // .pipe(uglify())
    .pipe(gulp.dest(path.build))
})

gulp.task('buildPopup', () => {
  return browserify(path.popup)
    .bundle()
    .pipe(source('popup.js'))
    .pipe(buffer())
    // .pipe(uglify())
    .pipe(gulp.dest(path.build))
})

gulp.task('watch', () => {
  gulp.watch(path.scss, gulp.series('scss'))
  gulp.watch(path.html, gulp.series('html'))
  gulp.watch(path.icons, gulp.series('icons'))
  gulp.watch(path.manifest, gulp.series('manifest'))
  gulp.watch(path.scss, gulp.series('scss'))
  gulp.watch(path.allScript, gulp.parallel('buildBg', 'buildContent', 'buildPopup'))
})

gulp.task('build', gulp.parallel('scss', 'buildBg', 'buildContent', 'buildPopup', 'manifest', 'html', 'icons'))
gulp.task('default', gulp.parallel('watch'))
