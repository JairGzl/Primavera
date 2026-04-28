// ============================================================
//  INTEGRANTE 1 — Escena base mejorada: terreno, cielo e iluminación
// ============================================================

var scene, camera, renderer, clock;
var nubes = []; // Para animar las nubes

function initEscena() {
  clock = new THREE.Clock();

  // --- Escena ---
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xFFD0A0); // Amanecer cálido
  scene.fog = new THREE.FogExp2(0xFFCCA0, 0.012); // Niebla exponencial más suave

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
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Colores más cinematográficos
  renderer.toneMappingExposure = 1.1;
  document.body.appendChild(renderer.domElement);

  // --- Iluminación solar cálida (amanecer) ---
  var sol = new THREE.DirectionalLight(0xFFCC88, 1.6); // Luz naranja-dorada
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

  // Luz suave de relleno desde el otro lado
  var luzRelleno = new THREE.DirectionalLight(0xAADDFF, 0.4);
  luzRelleno.position.set(-15, 10, -10);
  scene.add(luzRelleno);

  // Luz ambiente cálida
  var ambientLight = new THREE.AmbientLight(0xFFE0C0, 0.5);
  scene.add(ambientLight);

  // Luz hemisférica: cielo rosado / suelo verde
  var hemiLight = new THREE.HemisphereLight(0xFFB0C8, 0x2E7D32, 0.6);
  scene.add(hemiLight);

  // --- Terreno ---
  var terrenoGeo = new THREE.PlaneGeometry(80, 80, 30, 30);
  var pos = terrenoGeo.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    var x = pos.getX(i);
    var z = pos.getZ(i);
    // Ondulación más suave y natural
    var altura = Math.sin(x * 0.25) * 0.5 + Math.cos(z * 0.25) * 0.5
                + Math.sin(x * 0.6 + z * 0.4) * 0.2;
    pos.setY(i, altura);
  }
  terrenoGeo.computeVertexNormals();

  var terrenoMat = new THREE.MeshLambertMaterial({ 
  color: 0x4CAF50,        // Verde vivo
  emissive: 0x1A3A0A,     // Toque oscuro propio para profundidad
  emissiveIntensity: 0.15
  }); // Verde más fresco
  var terreno = new THREE.Mesh(terrenoGeo, terrenoMat);
  terreno.rotation.x = -Math.PI / 2;
  terreno.receiveShadow = true;
  scene.add(terreno);

  // --- Árboles con variedad de tamaño ---
  crearArbol(5,   0, -5,  1.0);
  crearArbol(-6,  0, -8,  1.3);
  crearArbol(10,  0, -12, 0.8);
  crearArbol(-12, 0, -6,  1.1);
  crearArbol(0,   0, -15, 1.4);
  crearArbol(8,   0, -20, 0.9);
  crearArbol(-8,  0, -18, 1.2);

  // --- Flores más densas ---
  for (var f = 0; f < 50; f++) {
    crearFlor(
      (Math.random() - 0.5) * 24,
      0,
      (Math.random() - 0.5) * 24
    );
  }

  // --- Nubes animadas ---
  nubes.push(crearNube(-10, 12, -20));
  nubes.push(crearNube(5,  14, -25));
  nubes.push(crearNube(15, 11, -18));
  nubes.push(crearNube(-20, 13, -30));

  // --- Controles de cámara ---
  initControles();

  // --- Responsivo ---
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

  // Tronco más natural (más alto y delgado arriba)
  var troncoGeo = new THREE.CylinderGeometry(0.15 * escala, 0.28 * escala, 2.2 * escala, 8);
  var troncoMat = new THREE.MeshLambertMaterial({ color: 0x7A4F2D });
  var tronco = new THREE.Mesh(troncoGeo, troncoMat);
  tronco.position.y = 1.1 * escala;
  tronco.castShadow = true;
  grupo.add(tronco);

  // Copa principal (cerezo en flor rosa)
  var copaMat = new THREE.MeshLambertMaterial({ color: 0xFFAFC0 });
  var copaGeo = new THREE.SphereGeometry(1.9 * escala, 10, 10);
  var copa = new THREE.Mesh(copaGeo, copaMat);
  copa.position.y = 3.4 * escala;
  copa.castShadow = true;
  grupo.add(copa);

  // Segunda copa lateral
  var copaMat2 = new THREE.MeshLambertMaterial({ color: 0xFFCCD8 }); // Un poco más claro
  var copa2Geo = new THREE.SphereGeometry(1.2 * escala, 10, 10);
  var copa2 = new THREE.Mesh(copa2Geo, copaMat2);
  copa2.position.set(0.7 * escala, 4.6 * escala, 0.3 * escala);
  copa2.castShadow = true;
  grupo.add(copa2);

  // Tercera copa pequeña al otro lado
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
  var alturaFlor = 0.35 + Math.random() * 0.2; // Variedad de alturas

  // Tallo
  var talloGeo = new THREE.CylinderGeometry(0.02, 0.025, alturaFlor * 1.5, 5);
  var talloMat = new THREE.MeshLambertMaterial({ color: 0x3A9A5C });
  var tallo = new THREE.Mesh(talloGeo, talloMat);
  tallo.position.set(x, y + alturaFlor * 0.75, z);
  scene.add(tallo);

  // Cabeza de la flor
  var florGeo = new THREE.SphereGeometry(0.10 + Math.random() * 0.05, 6, 6);
  var florMat = new THREE.MeshLambertMaterial({ color: color });
  var flor = new THREE.Mesh(florGeo, florMat);
  flor.position.set(x, y + alturaFlor * 1.5, z);
  scene.add(flor);
}

function crearNube(x, y, z) {
  var grupo = new THREE.Group();
  var nubeMat = new THREE.MeshLambertMaterial({ color: 0xFFF8F0 }); // Blanco cálido

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

// --- Animación de nubes (llamar dentro del loop de render) ---
function animarNubes(delta) {
  nubes.forEach(function (nube, i) {
    nube.position.x += delta * (0.6 + i * 0.15); // Velocidades distintas
    if (nube.position.x > 35) nube.position.x = -35; // Ciclo
  });
}

// --- Controles básicos de órbita ---
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
