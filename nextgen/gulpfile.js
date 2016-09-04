/**
 * Created by delian on 9/4/16.
 */

var gulp = require('gulp');
var bower = require('gulp-bower');
var typings = require('gulp-typings');

gulp.task('bower', function() {
    return bower();
});

gulp.task('typings', ['bower'], function() {
    return gulp.src('./src/typings.json').pipe(typings());
});

gulp.task('default',['typings'],function() {

});
