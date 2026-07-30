const manifoldModule = require('manifold-3d');
(async () => {
  const wasm = await manifoldModule();
  wasm.setup();
  const { CrossSection } = wasm;
  const currentContours = [
    [
      [0, -50], [14, -20], [47, -15], [23, 8], [29, 40],
      [0, 25], [-29, 40], [-23, 8], [-47, -15], [-14, -20]
    ].reverse()
  ];
  const cs = new CrossSection(currentContours, wasm.FillRule.NonZero);
  console.log("Area:", cs.area());
})();
