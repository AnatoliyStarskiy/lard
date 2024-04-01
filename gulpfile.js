const
// Common
	gulp = require('gulp'),
	bs = require('browser-sync').create(),
	del = require('del'),
	php = require('gulp-connect-php'),
	sourcemap = require('gulp-sourcemaps'),

// html
	pug = require('gulp-pug'),

// Image
	imagemin = require('gulp-imagemin'),
	svgSprite = require('gulp-svg-sprite');

// JavaScript
	babel = require('gulp-babel'),
	terser = require('gulp-terser'),
	replace = require('gulp-replace'),

// Style
	postcss = require('gulp-postcss'),
	less = require('gulp-less'),
	notify = require('gulp-notify'),

	isDebug = false;

function lessFunc(){
	return gulp.src([
		'./css/**/*.less',
		'!./css/**/_*.less'
		])
		.pipe(less())
		.on('error', notify.onError(function(err){
			return {
				title: 'Styles compilation error',
				message: err.message
			}
		}))
		.pipe(gulp.dest('./css'))
		.pipe(bs.stream());
}

function template(){
	return gulp.src('./templates/*.pug')
		.pipe(pug({
			pretty: true,
			locals: {
				debug: isDebug
			}
		}))
		.on('error', notify.onError(function(err){
			return {
				title: 'Pug compilation error',
				message: err.message
			}
		}))
		.pipe(gulp.dest('./'))
		.pipe(bs.stream());
}

function runServer() {
	php.server({base:'./', port:8000, keepalive:true}, function (){
		
		bs.init({
			proxy: '127.0.0.1:8000',
			watch: true,
			browser: 'chrome',
			ui: false,
			notify: false,
		});
	
		gulp.watch('./css/**/*.less', lessFunc);
		gulp.watch('./templates/**/*.pug', template);
		gulp.watch('./templates/**/*.pug').on('change', bs.reload);
		gulp.watch("./*.html").on('change', bs.reload);
		gulp.watch("./js/**/*.js").on('change', bs.reload);
	});
}

function clean(done){
	del.sync('./build/**');
	done();
}

function html(){
	return gulp.src('*.html')
		.pipe(gulp.dest('./build/'));
}

function data(){
	return gulp.src('./data/**/*')
		.pipe(gulp.dest('./build/data'));
}

function img(){
	return gulp.src(['./img/**/*', '!./img/**/**.svg'])
		.pipe(imagemin())
		.pipe(gulp.dest('./build/img'));
}

function svg(){
	return gulp.src('./img/**/**.svg')
		.pipe(gulp.dest('./build/img'));
}

function svgSprites(){
	return gulp.src('./icons/*.svg')
		.pipe(svgSprite({
				mode: {
					stack: {
						sprite: '../icons.svg'
					}
				},
				shape: {
					transform: []
				}
			}            
		))
		.pipe(gulp.dest('./img'));
}

function css(){
	return gulp.src('./css/*.css')
		// .pipe(sourcemap.init())
		// .pipe(cssimport())
		// .pipe(autoprefixer())
		// .pipe(csso())
		// .pipe(sourcemap.write('.'))
		.pipe(postcss([
			require('postcss-import'),
			require('autoprefixer'),
			require('postcss-csso')
		]))
		// .pipe(replace(/\.\.\//g, ''))
		.pipe(gulp.dest('./build/css'));
}

function js(){
	return gulp.src(['./js/**/*.js', '!./js/**/*.min.js'])
		.pipe(replace('/test.json', '/test/'))
		.pipe(replace('post', 'get'))
		.pipe(sourcemap.init())
		// .pipe(uglify())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(terser())
		.on('error', notify.onError(function(err){
			return {
				title: 'js compilation error',
				message: err.message
			}
		}))
		.pipe(sourcemap.write('.'))
		.pipe(gulp.dest('./build/js'));
}

function jsmin(){
	return gulp.src('./js/**/*.min.js')
		.pipe(gulp.dest('./build/js'));
}

function fonts(){
	return gulp.src('./fonts/**/*')
		.pipe(gulp.dest('./build/fonts'));
}


exports.watch = gulp.series(svgSprites, lessFunc, template, runServer);
exports.build = gulp.series(clean, gulp.parallel(html, data, img, svg, css, js, jsmin, fonts));