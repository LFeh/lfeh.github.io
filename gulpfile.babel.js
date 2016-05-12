'use strict';

import gulp from 'gulp';
import plumber from 'gulp-plumber';
import stylus from 'gulp-stylus';
import poststylus from 'poststylus';
import rucksack from 'rucksack-css';
import fontMagician from 'postcss-font-magician';
import gcmq from 'gulp-group-css-media-queries';
import cssnano from 'gulp-cssnano';
import sourcemaps from 'gulp-sourcemaps';
import lost from 'lost';
import rupture from 'rupture';
import postcss from 'gulp-postcss';
import concat from 'gulp-concat';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';
import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import cheerio from 'gulp-cheerio';

var Hexo = require('hexo');
var hexo = new Hexo(process.cwd(), {});

function onError(err) {
  console.log(err);
  this.emit('end');
}

const srcPaths = {
  css: 'themes/kratos/_source/styl/**/*.styl',
  styl: 'themes/kratos/_source/styl/style.styl',
  icons: 'themes/kratos/_source/svg/icons/*',
  svg: 'themes/kratos/_source/svg/',
  img: 'themes/kratos/_source/img/**/*',
  hexo: [
   'themes/kratos/layout/**/*',
   'src/**/*'
  ],
};

const buildPaths = {
  build: 'build/**/*',
  css: 'build/css/',
  img: 'build/img',
  svg: 'build/svg/',
};

gulp.task('css', () => {
  gulp.src(srcPaths.styl)
    .pipe(stylus({
      use: [rupture(), poststylus([lost(), fontMagician(), rucksack({ autoprefixer: true })])],
      compress: false
    }))
    .on('error', onError)
    .pipe(postcss([
      require('mdcss')({
        logo: '../logo-kratos.png',
        examples: {
          css: ['../build/css/style.css']
        }
      })
    ]))
    .on('error', onError)
    .pipe(gcmq())
    .pipe(cssnano())
    .pipe(gulp.dest(buildPaths.css));
});

gulp.task('images', () => {
  gulp.src(srcPaths.img)
    .pipe(plumber())
    .pipe(imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest(buildPaths.img));
});

gulp.task('icons', () => {
  gulp.src(srcPaths.icons)
    .pipe(svgmin())
    .pipe(svgstore({ fileName: 'icons.svg', inlineSvg: true}))
    .pipe(cheerio({
      run: function ($, file) {
          $('svg').addClass('hide');
          $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(gulp.dest(buildPaths.svg))
    .pipe(gulp.dest(srcPaths.svg));
});

gulp.task('hexo', () => {
  hexo.init().then(function(){
    return hexo.call('generate', {watch: false});
  }).catch(function(err){
    console.log(err);
  });
});

gulp.task('watch', () => {
  gulp.watch(srcPaths.hexo, ['hexo']);
  gulp.watch(srcPaths.css, ['css']);
  gulp.watch(srcPaths.img, ['images']);
  gulp.watch(srcPaths.icons, ['icons']);
});

gulp.task('browser-sync', () => {
  var files = [
    buildPaths.build
  ];

  browserSync.init(files, {
    server: {
      baseDir: './build/'
    },
  });
});

gulp.task('default', ['hexo', 'css', 'images', 'icons', 'watch', 'browser-sync']);
gulp.task('build', ['hexo', 'css', 'images', 'icons']);

