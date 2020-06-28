const minify = require('@node-minify/core');
// const gcc = require('@node-minify/google-closure-compiler');
const uglifyjs = require('@node-minify/uglify-js');

minify({
    compressor: uglifyjs,
    input: 'js/*.js',
    output: 'compiled.js',
    callback: function(err, min) {}
});