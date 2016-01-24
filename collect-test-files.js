var glob = require('glob');

var files = glob.sync(process.argv[2]);

if (!files.length) {
  throw new Error('no test files found!');
}

console.log("require('" + files.join("'); require('") + "')");
