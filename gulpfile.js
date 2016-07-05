var gulp = require('gulp');
var jshint = require('gulp-jshint');
var htmlmin = require('gulp-htmlmin');

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('build', ['minify', 'nodejs']);

gulp.task('publish', ['build', 'icons', 'locale']);

gulp.task('icons', function() {
    return gulp.src('src/icons/**/*').pipe(gulp.dest('modbus-rtu/icons'));
});

gulp.task('locale', function() {
    return gulp.src('src/locales/**/*').pipe(gulp.dest('modbus-rtu/locales'));
});

gulp.task('minify', function () {
    return gulp.src('src/*.html')
        .pipe(htmlmin({
            minifyJS: true, minifyCSS: true, minifyURLs: true,
            maxLineLength: 120, preserveLineBreaks: false,
            collapseWhitespace: true, collapseInlineTagWhitespace: true, conservativeCollapse: true,
            processScripts:["text/x-red"], quoteCharacter: "'"
        }))
        .pipe(gulp.dest('modbus-rtu'))
});

gulp.task('nodejs', function () {
    return gulp.src('src/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'))
      .pipe(gulp.dest('modbus-rtu'));
});

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
});

