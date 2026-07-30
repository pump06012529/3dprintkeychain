const { SVGLoader } = require('three/examples/jsm/loaders/SVGLoader.js');
const ImageTracer = require('imagetracerjs');

const imgData = { width: 10, height: 10, data: new Uint8ClampedArray(400) };
for(let i=0; i<400; i+=4) { imgData.data[i+3] = 255; } // all black

const options = {
  ltres: 1, qtres: 1, pathomit: 8, colorsampling: 0,
  numberofcolors: 2, mincolorratio: 0, colorquantcycles: 1,
  blurradius: 0, blurdelta: 20
};

const svgStr = ImageTracer.imagedataToSVG(imgData, options);
console.log(svgStr);
