const fs = require('fs');
const opentype = require('opentype.js');

const font = opentype.parse(fs.readFileSync('apps/name-keychain/src/fonts/prompt.ttf'));
const g = font.charToGlyph('ำ');
console.log('ำ adv:', g.advanceWidth, 'X min/max:', g.getBoundingBox());
