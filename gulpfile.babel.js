const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const browserify = require('gulp-browserify');
const uglify = require('gulp-uglify');
gulp.task('babel', () => {
    gulp.src('src/index.js')
        .pipe(babel())
        .pipe(browserify())
        .pipe(gulp.dest('dist'));
    console.log('babel ok');
});
gulp.task('uglify',()=>{
    gulp.src('dist/index.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});
gulp.task('watch', () => {
    gulp.watch('src/*.js', ['babel']);
    console.log('watch ok');
});

gulp.task('default', ['babel','watch']);
