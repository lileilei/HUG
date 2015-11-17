var gulp = require('gulp'),
    compass = require('gulp-compass'),
    stylus = require('gulp-stylus'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),//js规范
    uglify = require('gulp-uglify'),//混淆 丑化
    rename = require('gulp-rename'),//重命名
    clean = require('gulp-clean'),//清除
    concat = require('gulp-concat'),//合并
    notify = require('gulp-notify'),//更改通知
    watchify = require('gulp-watchify'),//加速browserify的构建
    server = require('gulp-develop-server'),
    cache = require('gulp-cache'),//图片快取，只有更改过得图片会进行压缩
    livereload = require('gulp-livereload'),//不用刷新自动F5
    sourcemaps = require('gulp-sourcemaps'),
    minifycss = require('gulp-minify-css'),//css压缩
    imagemin = require('gulp-imagemin'),//图片压缩
    _ = require('lodash'),
    plumber = require('gulp-plumber'),
    streamify = require('gulp-streamify');//把可读流转换为gulp支持的 vinyl流（虚拟文件格式）
var nib = require('nib');

//
var modules = require("./Develop/js/seed/modules");
console.log(modules);
var getModuls=_.chain(modules)
    .map(function (mod) {
        return "Develop/js/" + mod + ".js";
    });
//stylus
gulp.task('nib', function () {
    return gulp.src('src/stylus/**/*.styl')
        .pipe(plumber())
        .pipe(stylus({use: [nib()]}))
        //.pipe(stylus({use: [nib()],compress:true}))
        .pipe(autoprefixer({browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']}))
        .pipe(gulp.dest('public/stylus'))
        .on('error', function (err) {
            console.log('stylus编译出错！', err);
        });
});
//js concat
gulp.task('cancat', function () {
    return gulp.src(getModuls.value())
        //.pipe(uglify())
        .pipe(concat('seed.js'))
        .pipe(gulp.dest('./src/js'));
});
// 清理
gulp.task('clean', function () {
    "use strict";
    return gulp.src(['public/css', 'public/stylus', 'public/js'], {read: false})
        .pipe(clean())
        .pipe(notify({message: 'clean success!!'}));
});

//监查
gulp.task('watch', function () {
    return gulp.src('Develop/stylus/**/*.css')
        .pipe(watch('Develop/stylus/**/*.css'))
        .pipe(gulp.dest('build'));
});
//模块依赖
gulp.task('browserify', function () {
    return browserify('./src/js/app.js')
        .pipe(streamify())
        .pipe(gulp.dest('./dist/js'));
});
gulp.task('watch', ['watchify'], function () {
    "use strict";
    gulp.watch('src/sass/**/*.scss', ['compass']);
    gulp.watch('src/stylus/**/*.styl', ['nib']);
    gulp.watch('src/js/**/*.js', ['jshint', 'browserify']);
    gulp.watch(['./app.js', './_config.js', './routes/**/*.js', './utils/**/*.js', './gulpfile.js'], server.restart);
});

gulp.task('default', ['jshint', 'clean'], function () {
    gulp.start('nib', 'compass', 'server:start', 'watch');
});
