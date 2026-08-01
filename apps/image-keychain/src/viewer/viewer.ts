// @ts-ignore
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// @ts-ignore
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
// @ts-ignore
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface PartMesh {
  name: string;
  vertProperties: Float32Array;
  triVerts: Uint32Array;
  colorRgb: [number, number, number];
}

export interface Viewer {
  setParts(parts: PartMesh[], preserveCamera?: boolean): void;
  setPartColor(name: string, colorHex: string): void;
  setTheme(theme: 'dark' | 'light'): void;
  setEditMode(mode: 'color' | 'extrude' | null): void;
  onPartSelected(cb: (name: string | null) => void): void;
  highlightPart(name: string | null): void;
  setView(viewName: 'front' | 'iso' | 'top' | 'fit' | 'reset'): void;
  dispose(): void;
}

export function createViewer(container: HTMLElement): Viewer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const currentTheme = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
  scene.background = new THREE.Color(currentTheme === 'dark' ? 0x15171c : 0xf3f4f6);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.up.set(0, 0, 1); // Z-up CAD coordinate system
  camera.position.set(70, -70, 70);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(50, -50, 100);
  scene.add(keyLight);
  
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-50, 50, 50);
  scene.add(fillLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  // Visual grid helper
  let grid: THREE.GridHelper | null = null;
  function rebuildGrid(theme: 'dark' | 'light', z: number) {
    if (grid) scene.remove(grid);
    const accentColor = theme === 'dark' ? 0x5b9dff : 0x2563eb;
    const gridColor = theme === 'dark' ? 0x2f3440 : 0xd1d5db;
    grid = new THREE.GridHelper(200, 20, accentColor, gridColor);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = z;
    grid.renderOrder = -1;
    if (Array.isArray(grid.material)) {
      grid.material.forEach((m: any) => { m.depthWrite = false; });
    } else {
      grid.material.depthWrite = false;
    }
    scene.add(grid);
  }
  rebuildGrid(currentTheme, -0.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2 - 0.01; // don't go below grid

  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  let animationFrameId = 0;
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  const handleResize = () => {
    if (container.clientWidth === 0 || container.clientHeight === 0) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  const resizeObserver = new ResizeObserver(() => handleResize());
  resizeObserver.observe(container);

  function clearGroup(g: THREE.Group) {
    for (const child of [...g.children]) {
      g.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  }

  // --- Raycasting & Selection ---
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const HILITE = new THREE.Color(0x3b82f6);
  let hoveredName: string | null = null;
  let selectedName: string | null = null;
  let pickCb: ((name: string | null) => void) | null = null;
  let currentEditMode: 'color' | 'extrude' | null = null;

  let downX = 0;
  let downY = 0;
  let downT = 0;
  let outlineMesh: THREE.LineSegments | null = null;
  const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, depthTest: false });

  function applyHighlight() {
    if (outlineMesh) {
      outlineMesh.removeFromParent();
      if (outlineMesh.geometry) outlineMesh.geometry.dispose();
      outlineMesh = null;
    }

    const meshes = Array.from(meshesMap.values());
    for (const mesh of meshes) {
      const isSelected = selectedName === mesh.name;
      const isHovered = hoveredName === mesh.name;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (m && mesh.name.startsWith('image')) { // Only highlight image parts
        if ((isSelected || isHovered) && currentEditMode) {
          m.emissive.copy(HILITE);
          m.emissiveIntensity = isHovered ? 0.4 : 0.2;
        } else {
          m.emissiveIntensity = 0;
        }
      }
    }

    if (currentEditMode && selectedName && meshesMap.has(selectedName)) {
      const mesh = meshesMap.get(selectedName)!;
      const edges = new THREE.EdgesGeometry(mesh.geometry, 15);
      outlineMesh = new THREE.LineSegments(edges, outlineMaterial) as any;
      outlineMesh!.renderOrder = 999;
      outlineMesh!.position.copy(mesh.position);
      outlineMesh!.quaternion.copy(mesh.quaternion);
      outlineMesh!.scale.copy(mesh.scale);
      modelGroup.add(outlineMesh!);
    } else if (currentEditMode && hoveredName && meshesMap.has(hoveredName)) {
      const mesh = meshesMap.get(hoveredName)!;
      const edges = new THREE.EdgesGeometry(mesh.geometry, 15);
      outlineMesh = new THREE.LineSegments(edges, outlineMaterial) as any;
      outlineMesh!.renderOrder = 999;
      outlineMesh!.position.copy(mesh.position);
      outlineMesh!.quaternion.copy(mesh.quaternion);
      outlineMesh!.scale.copy(mesh.scale);
      modelGroup.add(outlineMesh!);
    }
  }

  function pickNameAt(clientX: number, clientY: number): string | null {
    if (!currentEditMode || meshesMap.size === 0) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const meshes = Array.from(meshesMap.values()).filter(m => m.name.startsWith('image'));
    const hits = raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) return hits[0].object.name;
    return null;
  }

  const onPointerMove = (e: PointerEvent) => {
    if (e.buttons !== 0) return;
    const name = pickNameAt(e.clientX, e.clientY);
    renderer.domElement.style.cursor = name === null ? '' : 'pointer';
    if (name !== hoveredName) {
      hoveredName = name;
      applyHighlight();
    }
  };
  const onPointerLeave = () => {
    if (hoveredName !== null) {
      hoveredName = null;
      applyHighlight();
    }
  };
  const onPointerDown = (e: PointerEvent) => {
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
  };
  const onPointerUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
    if (performance.now() - downT > 500) return;
    const name = pickNameAt(e.clientX, e.clientY);
    if (name !== selectedName) {
      selectedName = name;
      applyHighlight();
      pickCb?.(name);
    }
  };

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerleave', onPointerLeave);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);

  function parsePartGeometry(p: PartMesh): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(p.vertProperties, 3));
    geo.setIndex(new THREE.BufferAttribute(p.triVerts, 1));
    
    // Smooth curves, keep sharp corners distinct
    const creased = toCreasedNormals(geo, (35 * Math.PI) / 180);
    geo.dispose();
    return creased;
  }

  const meshesMap = new Map<string, THREE.Mesh>();
  let baseRadius = 100;
  let baseTargetZ = 0;

  return {
    setParts(parts: PartMesh[], preserveCamera = false) {
      console.log('setParts called with:', parts);
      clearGroup(modelGroup);
      meshesMap.clear();

      for (const p of parts) {
        console.log('Part:', p.name, 'Vertices:', p.vertProperties.length / 3, 'Triangles:', p.triVerts.length / 3);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setRGB(p.colorRgb[0] / 255, p.colorRgb[1] / 255, p.colorRgb[2] / 255, THREE.SRGBColorSpace),
          metalness: 0.1,
          roughness: 0.45,
          side: THREE.DoubleSide,
        });
        
        const geom = parsePartGeometry(p);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.name = p.name;
        modelGroup.add(mesh);
        meshesMap.set(p.name, mesh);
      }

      // Re-center assembly
      modelGroup.position.set(0, 0, 0);
      const box = new THREE.Box3().setFromObject(modelGroup);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Shift so XY is centered, bottom of the plate sits at Z = 0
      modelGroup.position.set(-center.x, -center.y, -box.min.z);

      if (!preserveCamera) {
        baseRadius = Math.max(size.x, size.y, size.z) * 1.5 + 20;
        baseTargetZ = size.z / 2;
        camera.position.set(baseRadius, -baseRadius, baseRadius * 0.9);
        controls.target.set(0, 0, baseTargetZ);
        controls.update();
      }
    },

    setPartColor(name: string, colorHex: string) {
      const mesh = meshesMap.get(name);
      if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color.set(colorHex);
      }
    },

    setTheme(theme: 'dark' | 'light') {
      scene.background = new THREE.Color(theme === 'dark' ? 0x15171c : 0xf3f4f6);
      rebuildGrid(theme, -0.2);
    },

    setEditMode(mode: 'color' | 'extrude' | null) {
      currentEditMode = mode;
      applyHighlight();
    },

    onPartSelected(cb: (name: string | null) => void) {
      pickCb = cb;
    },

    highlightPart(name: string | null) {
      selectedName = name;
      applyHighlight();
    },

    setView(viewName: 'front' | 'iso' | 'top' | 'fit' | 'reset') {
      switch (viewName) {
        case 'front':
          camera.position.set(0, -baseRadius * 1.5, baseTargetZ);
          controls.target.set(0, 0, baseTargetZ);
          break;
        case 'top':
          camera.position.set(0, 0, baseRadius * 1.5);
          controls.target.set(0, 0, baseTargetZ);
          break;
        case 'iso':
        case 'reset':
          camera.position.set(baseRadius, -baseRadius, baseRadius * 0.9);
          controls.target.set(0, 0, baseTargetZ);
          break;
        case 'fit':
          const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
          camera.position.copy(controls.target).add(dir.multiplyScalar(baseRadius * 1.5));
          break;
      }
      controls.update();
    },

    dispose() {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      clearGroup(modelGroup);
      scene.remove(modelGroup);
      if (grid) scene.remove(grid);
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
