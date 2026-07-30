const fs = require('fs');
const opentype = require('opentype.js');

const font = opentype.parse(fs.readFileSync('apps/name-keychain/src/fonts/prompt.ttf'));
const g1 = font.charToGlyph('ฎ');
const g2 = font.charToGlyph('ุ');
console.log('ฎ bounds:', g1.getBoundingBox());
console.log('ุ bounds:', g2.getBoundingBox());
