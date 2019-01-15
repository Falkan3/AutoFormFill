required:
npm install browserify
npm install uglifyjs
#optional for scss compilation
npm install -g node-sass

Compile new code to bundle.js:
browserify src/js/app.js | uglifyjs > dist/js/bundle.js

Compile scss to css folder:
node-sass src/scss/ -o dist/css/
