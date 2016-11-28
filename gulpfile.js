const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');

// pull in the project TypeScript config
const tsProject = ts.createProject('./tsconfig.json');

gulp.task('clean',()=>{
  return gulp.src('dist/**.*', {read: false})
    .pipe(clean());
});

gulp.task('scripts',['clean'], () => {
  const tsResult = tsProject.src()
  .pipe(tsProject());
  gulp.src(['src/views/**/*']).pipe(gulp.dest('dist/views'));
  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('default', ['watch']);