/**
 * Created by brandonhebbert on 3/23/16.
 */

var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});
var port = process.env.PORT || config.defaultPort; // what port
//someone puts in the command line environment or a config default port

gulp.task('jsAnalyze', function () {
    log('Analyzing source with JSHint and JSCS');
    return gulp
        .src(config.jsSource)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'))
    // .pipe($.plumber())
    // .pipe($.annotate())
    // .pipe($.concat('bundle.js'))
    // .pipe(gulp.dest('./public'));
});

gulp.task('jsCompiler', function () {
    log('Analyzing source with JSHint and JSCS');
    return gulp
        .src(config.jsSource)
    .pipe($.plumber())
    .pipe($.ngAnnotate())
    .pipe($.concat('bundle.js'))
    .pipe(gulp.dest('./public'));
});

gulp.task('styles', function () {
    log('Compiling Sass --> CSS');
    return gulp
        .src(config.sassSource)
        .pipe($.plumber())
        .pipe($.sass())
        .pipe($.concat('style.css'))
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest('./public/styles'))
});

gulp.task('serve-dev', function () {
    var isDev = true;

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    }
    return $.nodemon(nodeOptions)
        .on('restart', function (ev) {
            log('*** nodemon restarted');
            log('files changed on restart:\n' + ev);
        })
        .on('start', function () {
            log('*** nodemon started');
        })
        .on('crash', function () {
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function () {
            log('*** nodemon exited cleanly');
        });
});

gulp.task('sass-watcher', function () {
    gulp.watch([config.sassSource], ['styles']);
});

gulp.task('wiredep', function () {
    var options = config.getWiredepDefaultOptions(); //TODO
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index) //TODO index.html
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js))) //TODO
        .pipe(gulp.dest(config.public)); //TODO
})


/////////  DEFAULT  \\\\\\\\\ 

gulp.task('default', ['sass-watcher', 'serve-dev']);

////////////

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
///////////////////////////////////////////////////////
/*var gulp = require('gulp')
 , concat = require('gulp-concat')
 , annotate = require('gulp-ng-annotate')
 , plumber = require('gulp-plumber')
 , uglify = require('gulp-uglify')
 , watch = require('gulp-watch')
 , sass = require('gulp-sass')
 , path = require('path');

 var paths = {
 jsSource: ['./public/!**!/!*.js'],
 sassSource: ['./public/styles/sass/!*.sass']
 };

 gulp.task('js', function() {
 return gulp.src(paths.jsSource)
 .pipe(plumber())
 .pipe(concat('bundle.js'))
 .pipe(annotate())
 .pipe(gulp.dest('./public'));
 });

 gulp.task('sass', function () {
 return gulp.src(paths.sassSource)
 .pipe(sass({
 paths: paths.sassSource
 }))
 .pipe(concat('style.css'))
 .pipe(gulp.dest('./public/styles'));
 });

 gulp.task('watch', function() {
 gulp.watch(paths.jsSource, ['js']);
 gulp.watch(paths.sassSource, ['sass']);
 });

 gulp.task('default', ['watch', 'js', 'sass']);*/
