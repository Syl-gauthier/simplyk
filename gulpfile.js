'use strict';

const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const tap = require('gulp-tap');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const babel = require('gulp-babel'),
  rename = require('gulp-rename');

//HANDLE ERROR
uglify().on('error', function(err) {
  gutil.log(gutil.colors.red('[Error]'), err.toString());
  this.emit('end');
})

//BABEL TASK
gulp.task('babel', () => {
  return gulp.src('./public/javascripts/react/src/**/*.jsx', {
      read: true
    })
    .pipe(babel({
      presets: ['react', 'es2015']
    }))
    .pipe(gulp.dest('./public/javascripts/react/lib'));
});

//BROWSERIFY TASK
gulp.task('browserify', ['babel'], function() {

  return gulp.src('./public/javascripts/react/lib/**/*.js', {
      read: false
    })
    .pipe(tap(function(file) {
      gutil.log('bundling ' + file.path);
      // replace file contents with browserify's bundle stream
      file.contents = browserify(file.path, {
        debug: true
      }).bundle();
    }))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    // Add transformation tasks to the pipeline here.
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/javascripts/react/'));
});

/*gulp.task('boyboy', function() {
  return gulp.src('./public/javascripts/initmap.js')
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify().on('error', function(err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
      this.emit('end');
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/javascripts/min'))
});*/

//WATCH TASKS
gulp.task('watch', () => {
  gulp.watch('./public/javascripts/react/src/**/*.jsx', ['browserify']);
})

//DEFAULT TASK
gulp.task('default', ['browserify']);