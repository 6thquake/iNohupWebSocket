const gulp = require('gulp');
const watch = require('gulp-watch');
const uglifyjs = require('gulp-uglifyjs');
const umd = require('gulp-umd');
const concat = require('gulp-concat');
gulp.task('umd', () => {
    gulp.src(['src/Karn.js', 'src/NohupWebSocket.js'])
        .pipe(concat('NohupWebSocket.js'))
        .pipe(umd({
            dependencies: function(file) {
                return [{
                    name: 'q',
                    amd: 'q',
                    cjs: 'q',
                    global: 'Q'
                }];
            },
            exports: function(file) {
                return 'NohupWebSocket';
            },
            namespace: function(file) {
                return 'NohupWebSocket';
            }
        }))
        .pipe(gulp.dest('dist'));
    console.log('umd ok');
});
gulp.task('uglifyjs', ['umd'], () => {
    gulp.src('dist/NohupWebSocket.js')
        .pipe(uglifyjs('NohupWebSocket.min.js'))
        .pipe(gulp.dest('dist'));
    console.log('uglify ok');
});
gulp.task('watch', () => {
    gulp.watch('src/*.js', ['umd', 'uglifyjs']);
    console.log('watch ok');
});

gulp.task('build', ['uglifyjs']);

gulp.task('default', ['build']);

gulp.task('watch', ['build', 'watch']);