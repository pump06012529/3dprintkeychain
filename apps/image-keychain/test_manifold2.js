import manifoldModule from 'manifold-3d';
(async () => {
  const wasm = await manifoldModule();
  wasm.setup();
  const { CrossSection, Manifold } = wasm;

  const currentContours = [
    [
      [0, -50], [14, -20], [47, -15], [23, 8], [29, 40],
      [0, 25], [-29, 40], [-23, 8], [-47, -15], [-14, -20]
    ].reverse()
  ];
  let glyphsCS = new CrossSection(currentContours, 'NonZero');
  
  const holeX = -54.2, holeY = 0;
  const anchorX = -64.2, anchorY = 0;
  const lugDisc = CrossSection.circle(1.7, 32).translate([holeX, holeY]);
  const anchorDisc = CrossSection.circle(1.44, 16).translate([anchorX, anchorY]);
  const tabCS = CrossSection.hull([lugDisc, anchorDisc]);

  let plateSrc = glyphsCS.add(tabCS);
  let plateCS = plateSrc.offset(4.5, 'Round', 2.0, 24);
  plateCS = plateCS.offset(-2.0, 'Round', 2.0, 24);

  const baseSolid = Manifold.extrude(plateCS, 2.0, 0, 0);
  const cyl = Manifold.cylinder(4.0, 2.0, 2.0, 32).translate([holeX, holeY, -1]);
  const finalSolid = baseSolid.subtract(cyl);

  const mesh = finalSolid.getMesh();
  console.log("Vertices:", mesh.vertProperties.length / 3);
  console.log("Triangles:", mesh.triVerts.length / 3);
  console.log("PlateCS area:", plateCS.area());
})();
