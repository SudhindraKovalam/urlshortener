const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');

// pull in the project TypeScript config
const tsProject = ts.createProject('./tsconfig.json');

gulp.task('clean',()=>{
	gulp.src('dist/views/**.*', {read: false}).pipe(clean());
	gulp.src('dist/public/styles/**.*', {read: false}).pipe(clean());
  	return gulp.src('dist/**.*', {read: false}).pipe(clean());
});

gulp.task('scripts',['clean'], () => {
  const tsResult = tsProject.src()
  .pipe(tsProject());
  gulp.src(['src/public/**.*']).pipe(gulp.dest('dist/public'));
 
  gulp.src(['src/views/**/*']).pipe(gulp.dest('dist/views'));
  gulp.src(['src/public/styles/**.*']).pipe(gulp.dest('dist/public/styles'));
 
  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('default', ['watch']);