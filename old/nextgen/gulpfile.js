/**
 * Created by delian on 9/4/16.
 */

var gulp = require('gulp');
var bower = require('gulp-bower');
var typings = require('gulp-typings');
var ts = require('gulp-typescript');
var merge = require('merge2');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

var tsProject = ts.createProject('./src/tsconfig.json',{
    typescript: require('typescript')
});

gulp.task('scripts',['typings'],function () {
    var result = gulp.src('./src/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));
    return merge([
        result.dts.pipe(gulp.dest('./definitions')),
        result.js
            .pipe(concat('cryptarsi.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./js'))
    ])
});

gulp.task('watch',['scripts'], function () {
    gulp.watch('./src/*.ts',['scripts']);
})

gulp.task('bower', function() {
    return bower();
});

gulp.task('typings', ['bower'], function() {
    return gulp.src('./src/typings.json').pipe(typings());
});

gulp.task('default',['typings','scripts'],function() {

});
