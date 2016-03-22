'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var paths = ['*.js', 'test/test.js', 'routes/*.js', 'models/*.js'];

gulp.task('default', ['watch']);

gulp.task('watch', function() {
  gulp.watch(paths,['lint', 'mocha']);
});

gulp.task('lint', function(){
  return gulp.src(paths)
  .pipe(eslint({
    rules: {
      'no-console': 0,
      'indent': [
        2,
        2
      ],
      'quotes': [
        2,
        'single'
      ],
      'linebreak-style': [
        2,
        'unix'
      ],
      'semi': [
        2,
        'always'
      ]
    },
    env: {
      'es6': true,
      'node': true,
      'browser': true
    },
    globals: {
      'describe': false,
      'it': false,
      'beforeEach': false,
      'afterEach': false,
      'before': false,
      'after': false
    },
    ecmaFeatures: {
      'modules': true,
      'experimentalObjectRestSpread': true
    },
    'extends': 'eslint:recommended'
  }))
  .pipe(eslint.format());
});

gulp.task('mocha', function() {
  return gulp.src('test/', {read: false})
  .pipe(mocha({reporter: 'progress'}));
});
