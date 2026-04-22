// ============================================================
//  INTEGRANTE 1 — Escena base, terreno, cielo e iluminación
// ============================================================

// Variables globales (accesibles para todos los módulos)
var scene, camera, renderer, clock;

function initEscena() {
  clock = new THREE.Clock();

  // --- Escena ---
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Cielo azul
  scene.fog = new THREE.Fog(0x87CEEB, 30, 80);  // Niebla suave

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
  document.body.appendChild(renderer.domElement);

  // --- Iluminación solar ---
  // Luz direccional (sol)
  var sol = new THREE.DirectionalLight(0xFFF5E0, 1.4);
  sol.position.set(15, 30, 10);
  sol.castShadow = true;
  sol.shadow.mapSize.width = 2048;
  sol.shadow.mapSize.height = 2048;
  sol.shadow.camera.near = 0.5;
  sol.shadow.camera.far = 100;
  sol.shadow.camera.left = -30;
  sol.shadow.camera.right = 30;
  sol.shadow.camera.top = 30;
  sol.shadow.camera.bottom = -30;
  scene.add(sol);

  // Luz ambiente (cielo)
  var ambientLight = new THREE.AmbientLight(0xB0D4FF, 0.6);
  scene.add(ambientLight);

  // Luz hemisférica (suelo/cielo)
  var hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x5A8A3C, 0.4);
  scene.add(hemiLight);

  // --- Terreno ---
  var terrenoGeo = new THREE.PlaneGeometry(80, 80, 20, 20);
  // Ondular el terreno un poco
  var pos = terrenoGeo.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    var x = pos.getX(i);
    var z = pos.getZ(i);
    pos.setY(i, Math.sin(x * 0.3) * 0.4 + Math.cos(z * 0.3) * 0.4);
  }
  terrenoGeo.computeVertexNormals();

  var terrenoMat = new THREE.MeshLambertMaterial({ color: 0x5A8A3C });
  var terreno = new THREE.Mesh(terrenoGeo, terrenoMat);
  terreno.rotation.x = -Math.PI / 2;
  terreno.receiveShadow = true;
  scene.add(terreno);

  // --- Árboles básicos ---
  crearArbol(5, 0, -5);
  crearArbol(-6, 0, -8);
  crearArbol(10, 0, -12);
  crearArbol(-12, 0, -6);
  crearArbol(0, 0, -15);

  // --- Flores ---
  for (var f = 0; f < 30; f++) {
    crearFlor(
      (Math.random() - 0.5) * 20,
      0,
      (Math.random() - 0.5) * 20
    );
  }

  // --- Nubes simples ---
  crearNube(-10, 12, -20);
  crearNube(5, 14, -25);
  crearNube(15, 11, -18);

  // --- Controles de cámara (arrastrar para rotar) ---
  initControles();

  // --- Responsivo ---
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ---------- Helpers de Integrante 1 ----------

function crearArbol(x, y, z) {
  var grupo = new THREE.Group();

  // Tronco
  var troncoGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
  var troncoMat = new THREE.MeshLambertMaterial({ color: 0x8B5E3C });
  var tronco = new THREE.Mesh(troncoGeo, troncoMat);
  tronco.position.y = 1;
  tronco.castShadow = true;
  grupo.add(tronco);

  // Copa (cereza en flor = color rosa)
  var copaGeo = new THREE.SphereGeometry(1.8, 10, 10);
  var copaMat = new THREE.MeshLambertMaterial({ color: 0xFFB7C5 });
  var copa = new THREE.Mesh(copaGeo, copaMat);
  copa.position.y = 3.2;
  copa.castShadow = true;
  grupo.add(copa);

  // Segunda capa de copa
  var copa2Geo = new THREE.SphereGeometry(1.3, 10, 10);
  var copa2 = new THREE.Mesh(copa2Geo, copaMat);
  copa2.position.set(0.5, 4.5, 0);
  copa2.castShadow = true;
  grupo.add(copa2);

  grupo.position.set(x, y, z);
  scene.add(grupo);
  return grupo;
}

function crearFlor(x, y, z) {
  var colores = [0xFF6B9D, 0xFFD700, 0xFF4500, 0xFF69B4, 0xFFFFFF];
  var color = colores[Math.floor(Math.random() * colores.length)];

  // Tallo
  var talloGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 5);
  var talloMat = new THREE.MeshLambertMaterial({ color: 0x2E8B57 });
  var tallo = new THREE.Mesh(talloGeo, talloMat);
  tallo.position.set(x, y + 0.2, z);
  scene.add(tallo);

  // Pétalo (esfera pequeña)
  var florGeo = new THREE.SphereGeometry(0.12, 6, 6);
  var florMat = new THREE.MeshLambertMaterial({ color: color });
  var flor = new THREE.Mesh(florGeo, florMat);
  flor.position.set(x, y + 0.45, z);
  scene.add(flor);
}

function crearNube(x, y, z) {
  var grupo = new THREE.Group();
  var nubeMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

  var posiciones = [
    [0, 0, 0, 1.5],
    [1.5, 0.3, 0, 1.2],
    [-1.5, 0.2, 0, 1.0],
    [0.5, 0.8, 0, 1.0],
    [-0.5, 0.6, 0.5, 0.8],
  ];

  posiciones.forEach(function (p) {
    var geo = new THREE.SphereGeometry(p[3], 7, 7);
    var mesh = new THREE.Mesh(geo, nubeMat);
    mesh.position.set(p[0], p[1], p[2]);
    grupo.add(mesh);
  });

  grupo.position.set(x, y, z);
  scene.add(grupo);
}

// --- Controles básicos de órbita (sin importar OrbitControls) ---
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
