// ============================================================
//  INTEGRANTE 1 — Escena base mejorada: terreno, cielo e iluminación
// ============================================================

var scene, camera, renderer, clock;
var nubes = [];

function initEscena() {
  clock = new THREE.Clock();

  // --- Escena ---
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xB8E0F7); // Azul cielo pastel
  scene.fog = new THREE.FogExp2(0xB8E0F7, 0.006);

  // --- Cámara ---
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 8, 20);
  camera.lookAt(0, 0, 0);

  // --- Renderer ---
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0; // ✅ Bajado de 1.1 (reducía el tono naranja)
  document.body.appendChild(renderer.domElement);

  // --- Iluminación ---
  // ✅ Sol blanco-amarillo suave (antes era naranja 0xFFCC88)
  var sol = new THREE.DirectionalLight(0xFFFFDD, 1.2);
  sol.position.set(20, 25, 10);
  sol.castShadow = true;
  sol.shadow.mapSize.width = 2048;
  sol.shadow.mapSize.height = 2048;
  sol.shadow.camera.near = 0.5;
  sol.shadow.camera.far = 100;
  sol.shadow.camera.left = -35;
  sol.shadow.camera.right = 35;
  sol.shadow.camera.top = 35;
  sol.shadow.camera.bottom = -35;
  scene.add(sol);

  // Luz de relleno azul (sin cambios)
  var luzRelleno = new THREE.DirectionalLight(0xAADDFF, 0.4);
  luzRelleno.position.set(-15, 10, -10);
  scene.add(luzRelleno);

  // ✅ Luz ambiente blanca neutra (antes era naranja 0xFFE0C0 y muy fuerte 0.8)
  var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
  scene.add(ambientLight);

  // ✅ Hemisférica: cielo azul arriba / verde abajo (sin cambios, ya estaba bien)
  var hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x2E7D32, 0.9);
  scene.add(hemiLight);

  // --- Terreno verde ---
  var terrenoGeo = new THREE.PlaneGeometry(80, 80, 30, 30);
  var pos = terrenoGeo.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    var x = pos.getX(i);
    var z = pos.getZ(i);
    var altura = Math.sin(x * 0.25) * 0.5 + Math.cos(z * 0.25) * 0.5
                + Math.sin(x * 0.6 + z * 0.4) * 0.2;
    pos.setY(i, altura);
  }
  terrenoGeo.computeVertexNormals();

  // ✅ Verde más saturado y emissive más visible
  var terrenoMat = new THREE.MeshLambertMaterial({
    color: 0x3A7D2C,
    emissive: 0x1C4A10,
    emissiveIntensity: 0.4  // ✅ Subido de 0.3 a 0.4
  });
  var terreno = new THREE.Mesh(terrenoGeo, terrenoMat);
  terreno.rotation.x = -Math.PI / 2;
  terreno.receiveShadow = true;
  scene.add(terreno);

  // --- Árboles ---
  crearArbol(5,   0, -5,  1.0);
  crearArbol(-6,  0, -8,  1.3);
  crearArbol(10,  0, -12, 0.8);
  crearArbol(-12, 0, -6,  1.1);
  crearArbol(0,   0, -15, 1.4);
  crearArbol(8,   0, -20, 0.9);
  crearArbol(-8,  0, -18, 1.2);

  // --- Flores ---
  for (var f = 0; f < 50; f++) {
    crearFlor(
      (Math.random() - 0.5) * 24,
      0,
      (Math.random() - 0.5) * 24
    );
  }

  // --- Nubes ---
  nubes.push(crearNube(-10, 12, -20));
  nubes.push(crearNube(5,  14, -25));
  nubes.push(crearNube(15, 11, -18));
  nubes.push(crearNube(-20, 13, -30));

  initControles();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ---------- Helpers ----------

function crearArbol(x, y, z, escala) {
  escala = escala || 1.0;
  var grupo = new THREE.Group();

  var troncoGeo = new THREE.CylinderGeometry(0.15 * escala, 0.28 * escala, 2.2 * escala, 8);
  var troncoMat = new THREE.MeshLambertMaterial({ color: 0x7A4F2D });
  var tronco = new THREE.Mesh(troncoGeo, troncoMat);
  tronco.position.y = 1.1 * escala;
  tronco.castShadow = true;
  grupo.add(tronco);

  var copaMat = new THREE.MeshLambertMaterial({ color: 0xFFAFC0 });
  var copaGeo = new THREE.SphereGeometry(1.9 * escala, 10, 10);
  var copa = new THREE.Mesh(copaGeo, copaMat);
  copa.position.y = 3.4 * escala;
  copa.castShadow = true;
  grupo.add(copa);

  var copaMat2 = new THREE.MeshLambertMaterial({ color: 0xFFCCD8 });
  var copa2Geo = new THREE.SphereGeometry(1.2 * escala, 10, 10);
  var copa2 = new THREE.Mesh(copa2Geo, copaMat2);
  copa2.position.set(0.7 * escala, 4.6 * escala, 0.3 * escala);
  copa2.castShadow = true;
  grupo.add(copa2);

  var copa3Geo = new THREE.SphereGeometry(0.9 * escala, 8, 8);
  var copa3 = new THREE.Mesh(copa3Geo, copaMat);
  copa3.position.set(-0.6 * escala, 4.2 * escala, -0.2 * escala);
  copa3.castShadow = true;
  grupo.add(copa3);

  grupo.position.set(x, y, z);
  scene.add(grupo);
  return grupo;
}

function crearFlor(x, y, z) {
  var colores = [0xFF6B9D, 0xFFD700, 0xFF4500, 0xFF69B4, 0xFFFFFF, 0xFF9EBC, 0xFFE566];
  var color = colores[Math.floor(Math.random() * colores.length)];
  var alturaFlor = 0.35 + Math.random() * 0.2;

  var talloGeo = new THREE.CylinderGeometry(0.02, 0.025, alturaFlor * 1.5, 5);
  var talloMat = new THREE.MeshLambertMaterial({ color: 0x3A9A5C });
  var tallo = new THREE.Mesh(talloGeo, talloMat);
  tallo.position.set(x, y + alturaFlor * 0.75, z);
  scene.add(tallo);

  var florGeo = new THREE.SphereGeometry(0.10 + Math.random() * 0.05, 6, 6);
  var florMat = new THREE.MeshLambertMaterial({ color: color });
  var flor = new THREE.Mesh(florGeo, florMat);
  flor.position.set(x, y + alturaFlor * 1.5, z);
  scene.add(flor);
}

function crearNube(x, y, z) {
  var grupo = new THREE.Group();
  var nubeMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // ✅ Blanco puro

  var posiciones = [
    [0,    0,   0,   1.6],
    [1.7,  0.2, 0,   1.3],
    [-1.6, 0.1, 0,   1.1],
    [0.6,  0.9, 0,   1.1],
    [-0.4, 0.7, 0.4, 0.9],
    [1.0, -0.2, 0.5, 0.8],
  ];

  posiciones.forEach(function (p) {
    var geo = new THREE.SphereGeometry(p[3], 8, 8);
    var mesh = new THREE.Mesh(geo, nubeMat);
    mesh.position.set(p[0], p[1], p[2]);
    grupo.add(mesh);
  });

  grupo.position.set(x, y, z);
  scene.add(grupo);
  return grupo;
}

function animarNubes(delta) {
  nubes.forEach(function (nube, i) {
    nube.position.x += delta * (0.6 + i * 0.15);
    if (nube.position.x > 35) nube.position.x = -35;
  });
}

function initControles() {
  var isDragging = false;
  var prevMouse = { x: 0, y: 0 };
  var theta = 0, phi = 0.4, radius = 22;

  function updateCamera() {
    camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
    camera.position.y = radius * Math.sin(phi) + 3;
    camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
    camera.lookAt(0, 2, 0);
  }

  renderer.domElement.addEventListener('mousedown', function (e) {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    theta -= (e.clientX - prevMouse.x) * 0.005;
    phi += (e.clientY - prevMouse.y) * 0.005;
    phi = Math.max(0.1, Math.min(1.2, phi));
    prevMouse = { x: e.clientX, y: e.clientY };
    updateCamera();
  });
  renderer.domElement.addEventListener('mouseup', function () { isDragging = false; });
  renderer.domElement.addEventListener('wheel', function (e) {
    radius += e.deltaY * 0.05;
    radius = Math.max(5, Math.min(50, radius));
    updateCamera();
  });
  updateCamera();
}

// Nota: En tu loop de animación principal, llama a animarNubes(clock.getDelta())
// Ejemplo:
// function animate() {
//   requestAnimationFrame(animate);
//   var delta = clock.getDelta();
//   animarNubes(delta);
//   renderer.render(scene, camera);
// }
