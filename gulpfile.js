//REQUIRED

var gulp = require('gulp'),
	babel = require('gulp-babel'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify');

//Scripts Task

gulp.task('scripts', function() {
	gulp.src(['public/javascripts/*.js', '!public/javascripts/*.min.js'])
		//.pipe(babel())
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('public/javascripts/'));
});

//Default Task

gulp.task('default', ['scripts']);