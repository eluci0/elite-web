(function() {
  const container = document.getElementById('webgl-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 7.0;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Entorno de Estudio
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 512;
  envCanvas.height = 256;
  const envCtx = envCanvas.getContext('2d');
  const grad = envCtx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, '#8fa5ba');
  grad.addColorStop(0.5, '#0f1217');
  grad.addColorStop(0.8, '#c85a28');
  grad.addColorStop(1, '#ffffff');
  envCtx.fillStyle = grad;
  envCtx.fillRect(0, 0, 512, 256);

  envCtx.fillStyle = '#ffffff';
  envCtx.fillRect(50, 20, 120, 60);
  envCtx.fillRect(320, 30, 140, 70);

  const envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envTex;

  // Iluminación
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const goldKeyLight = new THREE.DirectionalLight(0xffe0a3, 3.4);
  goldKeyLight.position.set(5, 8, 6);
  scene.add(goldKeyLight);

  const coolRimLight = new THREE.PointLight(0xaad5ff, 2.5, 40);
  coolRimLight.position.set(-6, -4, 4);
  scene.add(coolRimLight);

  // Materiales de alta fidelidad
  const steelBladeMat = new THREE.MeshStandardMaterial({
    color: 0xf8f9fb, metalness: 0.98, roughness: 0.1, envMapIntensity: 2.8
  });
  const spineFacetMat = new THREE.MeshStandardMaterial({
    color: 0xd8dde4, metalness: 0.95, roughness: 0.22, envMapIntensity: 2.0
  });
  const blackGripMat = new THREE.MeshStandardMaterial({
    color: 0x181a20, roughness: 0.6, metalness: 0.2
  });
  const cyanCushionMat = new THREE.MeshStandardMaterial({
    color: 0x00b4d8, roughness: 0.65, metalness: 0.08
  });
  const screwMetalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, metalness: 0.98, roughness: 0.12, envMapIntensity: 3.0
  });

  const shearsMainGroup = new THREE.Group();

  function createFacetedBlade(isFlipped) {
    const g = new THREE.Group();

    const bShape = new THREE.Shape();
    bShape.moveTo(0.005, 0.0);
    bShape.lineTo(0.005, 3.2);
    bShape.lineTo(-0.04, 3.25);
    bShape.bezierCurveTo(-0.15, 2.3, -0.24, 1.3, -0.22, 0.1);
    bShape.lineTo(-0.25, 0.0);
    bShape.closePath();

    const bMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(bShape, {
      steps: 2, depth: 0.035, bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.016, bevelSegments: 4
    }), steelBladeMat);

    const rShape = new THREE.Shape();
    rShape.moveTo(-0.06, 0.1);
    rShape.lineTo(-0.015, 3.16);
    rShape.lineTo(-0.038, 3.2);
    rShape.lineTo(-0.17, 0.1);
    rShape.closePath();

    const rMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(rShape, {
      steps: 1, depth: 0.018, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2
    }), spineFacetMat);
    rMesh.position.z = 0.024;

    g.add(bMesh);
    g.add(rMesh);

    if (isFlipped) g.scale.x = -1;
    return g;
  }

  // Hoja 1 (Pulgar)
  const blade1PivotGroup = new THREE.Group();
  const blade1Mesh = createFacetedBlade(false);
  blade1Mesh.position.set(0, 0, 0.02);
  blade1PivotGroup.add(blade1Mesh);

  const thumbOuterShape = new THREE.Shape();
  thumbOuterShape.moveTo(0.06, -0.32);
  thumbOuterShape.lineTo(0.22, -0.85);
  thumbOuterShape.bezierCurveTo(0.35, -1.05, 0.75, -1.05, 0.88, -1.42);
  thumbOuterShape.bezierCurveTo(0.96, -1.72, 0.82, -2.12, 0.58, -2.25);
  thumbOuterShape.bezierCurveTo(0.50, -2.32, 0.42, -2.30, 0.35, -2.24);
  thumbOuterShape.bezierCurveTo(0.18, -2.10, 0.12, -1.72, 0.18, -1.32);
  thumbOuterShape.lineTo(0.04, -0.85);
  thumbOuterShape.lineTo(0.02, -0.32);
  thumbOuterShape.closePath();

  const thumbHole = new THREE.Path();
  thumbHole.absellipse(0.52, -1.68, 0.22, 0.28, 0, Math.PI * 2, true);
  thumbOuterShape.holes.push(thumbHole);

  const thumbGripMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(thumbOuterShape, {
    steps: 2, depth: 0.045, bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.016, bevelSegments: 4
  }), blackGripMat);
  thumbGripMesh.position.set(0, 0, 0.01);
  blade1PivotGroup.add(thumbGripMesh);

  const thumbCushionShape = new THREE.Shape();
  thumbCushionShape.absellipse(0.52, -1.68, 0.24, 0.30, 0, Math.PI * 2, false);
  const tHole2 = new THREE.Path();
  tHole2.absellipse(0.52, -1.68, 0.18, 0.24, 0, Math.PI * 2, true);
  thumbCushionShape.holes.push(tHole2);

  const thumbCushionMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(thumbCushionShape, {
    steps: 1, depth: 0.048, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2
  }), cyanCushionMat);
  thumbCushionMesh.position.set(0, 0, 0.008);
  blade1PivotGroup.add(thumbCushionMesh);

  // Hoja 2 (Multi-dedo)
  const blade2PivotGroup = new THREE.Group();
  const blade2Mesh = createFacetedBlade(true);
  blade2Mesh.position.set(0, 0, -0.06);
  blade2PivotGroup.add(blade2Mesh);

  const multiOuterShape = new THREE.Shape();
  multiOuterShape.moveTo(-0.06, -0.32);
  multiOuterShape.lineTo(-0.22, -0.85);
  multiOuterShape.bezierCurveTo(-0.35, -1.1, -0.75, -1.15, -0.88, -1.5);
  multiOuterShape.lineTo(-0.88, -2.35);
  multiOuterShape.bezierCurveTo(-0.85, -2.75, -0.42, -2.85, -0.22, -2.65);
  multiOuterShape.lineTo(-0.16, -1.65);
  multiOuterShape.lineTo(-0.04, -0.85);
  multiOuterShape.lineTo(-0.02, -0.32);
  multiOuterShape.closePath();

  const multiHole = new THREE.Path();
  multiHole.moveTo(-0.48, -1.52);
  multiHole.absarc(-0.48, -1.52, 0.22, 0, Math.PI, false);
  multiHole.lineTo(-0.70, -2.32);
  multiHole.absarc(-0.48, -2.32, 0.22, Math.PI, 0, false);
  multiHole.lineTo(-0.26, -1.52);
  multiOuterShape.holes.push(multiHole);

  const multiGripMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(multiOuterShape, {
    steps: 2, depth: 0.045, bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.016, bevelSegments: 4
  }), blackGripMat);
  multiGripMesh.position.set(0, 0, -0.062);
  blade2PivotGroup.add(multiGripMesh);

  const multiCushionShape = new THREE.Shape();
  multiCushionShape.moveTo(-0.48, -1.52);
  multiCushionShape.absarc(-0.48, -1.52, 0.24, 0, Math.PI, false);
  multiCushionShape.lineTo(-0.72, -2.32);
  multiCushionShape.absarc(-0.48, -2.32, 0.24, Math.PI, 0, false);
  multiCushionShape.lineTo(-0.24, -1.52);
  multiCushionShape.closePath();

  const mHole2 = new THREE.Path();
  mHole2.moveTo(-0.48, -1.52);
  mHole2.absarc(-0.48, -1.52, 0.17, 0, Math.PI, false);
  mHole2.lineTo(-0.65, -2.32);
  mHole2.absarc(-0.48, -2.32, 0.17, Math.PI, 0, false);
  mHole2.lineTo(-0.31, -1.52);
  multiCushionShape.holes.push(mHole2);

  const multiCushionMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(multiCushionShape, {
    steps: 1, depth: 0.048, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2
  }), cyanCushionMat);
  multiCushionMesh.position.set(0, 0, -0.064);
  blade2PivotGroup.add(multiCushionMesh);

  // Pivote con ranura cruzada
  const screwPivotGroup = new THREE.Group();
  const screwDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.045, 32), screwMetalMat);
  screwDisc.rotation.x = Math.PI / 2;
  screwPivotGroup.add(screwDisc);

  const slot1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.015), blackGripMat);
  slot1.position.z = 0.024;
  const slot2 = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.28, 0.015), blackGripMat);
  slot2.position.z = 0.024;
  screwPivotGroup.add(slot1);
  screwPivotGroup.add(slot2);
  screwPivotGroup.position.set(0, -0.15, 0.068);

  const subDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 24), blackGripMat);
  subDisc.rotation.x = Math.PI / 2;
  subDisc.position.set(-0.11, -0.36, 0.05);

  shearsMainGroup.add(blade1PivotGroup);
  shearsMainGroup.add(blade2PivotGroup);
  shearsMainGroup.add(screwPivotGroup);
  shearsMainGroup.add(subDisc);

  shearsMainGroup.scale.set(1.2, 1.2, 1.2);
  scene.add(shearsMainGroup);

  // Inercia y Parallax
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.7;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.7;
  });

  let autoRotY = 0;

  function animate() {
    requestAnimationFrame(animate);

    const isMobile = window.innerWidth <= 900;
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    const heroThreshold = vh * 0.85;
    const craftProgress = Math.min(Math.max((scrollY - vh * 0.2) / heroThreshold, 0), 1);

    let targetPosX = 0;
    let targetPosY = 0;
    let targetPosZ = 0;

    if (!isMobile) {
      targetPosX = craftProgress * 1.85;
      targetPosY = -craftProgress * 0.15;
    } else {
      targetPosY = -craftProgress * 0.4;
      targetPosZ = -craftProgress * 0.8;
    }

    if (scrollY > vh * 2.2) {
      container.style.opacity = '0.08';
    } else {
      container.style.opacity = '1';
    }

    const subtleSnip = 0.05 + Math.sin(Date.now() * 0.002) * 0.03;
    blade1PivotGroup.rotation.z = -subtleSnip;
    blade2PivotGroup.rotation.z = subtleSnip;

    autoRotY += 0.0035;

    const targetRotX = mouseY * 0.6;
    const targetRotY = autoRotY + mouseX * 0.6;
    const targetRotZ = craftProgress * 0.35;

    shearsMainGroup.position.x += (targetPosX - shearsMainGroup.position.x) * 0.08;
    shearsMainGroup.position.y += (targetPosY - shearsMainGroup.position.y) * 0.08;
    shearsMainGroup.position.z += (targetPosZ - shearsMainGroup.position.z) * 0.08;

    shearsMainGroup.rotation.x += (targetRotX - shearsMainGroup.rotation.x) * 0.08;
    shearsMainGroup.rotation.y = targetRotY;
    shearsMainGroup.rotation.z += (targetRotZ - shearsMainGroup.rotation.z) * 0.08;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();