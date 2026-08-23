const sizeOf = require('image-size');
const fn = sizeOf.imageSize ? sizeOf.imageSize : sizeOf.default ? sizeOf.default : sizeOf;
const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.match(/\.(png|jpe?g)$/i)) {
        try {
          fn(file);
        } catch (e) {
          console.log(`CORRUPT: ${file} - ${e.message}`);
        }
      }
    }
  });
  return results;
}
walk('public');
