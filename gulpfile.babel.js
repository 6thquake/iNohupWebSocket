const gulp = require('gulp');
const watch = require('gulp-watch');
const uglifyjs = require('gulp-uglifyjs');
const umd = require('gulp-umd');
const concat = require('gulp-concat');
gulp.task('umd', () => {
    gulp.src(['src/generateEvent.js','src/addEvent.js','src/ExponentialBackoff.js','src/NohupWebSocket.js'])
        .pipe(concat('index.js'))
        .pipe(umd({
            exports:function (file) {
                return 'NohupWebSocket';
            },
            namespace:function (file) {
                return 'NohupWebSocket';
            }
        }))
        .pipe(gulp.dest('dist'));
    console.log('umd ok');
});
gulp.task('uglifyjs',()=>{
    gulp.src('dist/index.js')
        .pipe(uglifyjs('index.min.js'))
        .pipe(gulp.dest('dist'));
    console.log('uglify ok');
});
gulp.task('watch', () => {
    gulp.watch('src/*.js', ['umd','uglifyjs']);
    console.log('watch ok');
});

gulp.task('default', ['umd','uglifyjs','watch']);
