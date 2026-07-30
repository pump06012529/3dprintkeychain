const fs = require('fs');
const data = JSON.parse(fs.readFileSync('generators.json'));
data.generators.splice(3, 0, {
  "id": "image-keychain",
  "name": "Image Keychain Generator",
  "route": "app",
  "status": "live",
  "appUrl": "/Image-Keychain/",
  "blurb": "Turn any SVG or PNG image into a custom 3D printable keychain with generated backplates and holes."
});
fs.writeFileSync('generators.json', JSON.stringify(data, null, 2));
