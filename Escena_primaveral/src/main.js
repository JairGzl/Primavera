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

// ============================================================
//  ÁRBOL MEJORADO — Con hojas y forma más realista
// ============================================================
 
function crearArbol(x, y, z, escala = 1.0) {
  var grupo = new THREE.Group();
 
  // --- Tronco corto y gordito (estilo AC) ---
  var troncoGeo = new THREE.CylinderGeometry(0.28 * escala, 0.35 * escala, 1.8 * escala, 10);
  var troncoMat = new THREE.MeshLambertMaterial({ color: 0x8B5E3C });
  var tronco = new THREE.Mesh(troncoGeo, troncoMat);
  tronco.position.y = 0.9 * escala;
  tronco.castShadow = true;
  tronco.receiveShadow = true;
  grupo.add(tronco);
 
  // --- Copa principal: esfera grande central ---
  // Animal Crossing usa una esfera grande esponjosa como copa
  var verdeOscuro  = new THREE.MeshLambertMaterial({ color: 0x3B8C3A });
  var verdeMedio   = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
  var verdeClaro   = new THREE.MeshLambertMaterial({ color: 0x66BB6A });
 
  // Esfera base (la más grande, atrás/abajo)
  var copaBaseGeo = new THREE.SphereGeometry(2.0 * escala, 12, 12);
  var copaBase = new THREE.Mesh(copaBaseGeo, verdeOscuro);
  copaBase.position.y = 3.2 * escala;
  copaBase.castShadow = true;
  copaBase.receiveShadow = true;
  grupo.add(copaBase);
 
  // Esferas medianas alrededor para la forma esponjosa característica de AC
  var bolasData = [
    { x:  1.2, y: 3.0, z:  0.5, r: 1.4, mat: verdeMedio  },
    { x: -1.2, y: 3.0, z:  0.3, r: 1.3, mat: verdeMedio  },
    { x:  0.5, y: 3.0, z: -1.1, r: 1.3, mat: verdeOscuro },
    { x: -0.5, y: 3.0, z:  1.1, r: 1.2, mat: verdeMedio  },
    { x:  0.0, y: 4.4, z:  0.0, r: 1.5, mat: verdeClaro  }, // Parte de arriba más clara
    { x:  0.9, y: 4.2, z: -0.6, r: 1.0, mat: verdeClaro  },
    { x: -0.9, y: 4.3, z:  0.5, r: 1.0, mat: verdeMedio  },
  ];
 
  bolasData.forEach(function (b) {
    var geo = new THREE.SphereGeometry(b.r * escala, 10, 10);
    var mesh = new THREE.Mesh(geo, b.mat);
    mesh.position.set(b.x * escala, b.y * escala, b.z * escala);
    mesh.castShadow = true;
    grupo.add(mesh);
  });
 
  // --- Detalle: pequeñas manchitas oscuras (huecos entre hojas) ---
  // Simula la textura esponjosa de AC con esferas muy pequeñas oscuras
  var detalleMat = new THREE.MeshLambertMaterial({ color: 0x2E6B2E });
  var detallesPos = [
    [ 1.5, 3.5,  0.8],
    [-1.3, 3.8, -0.5],
    [ 0.3, 4.8,  1.0],
    [-0.8, 4.5, -0.9],
    [ 1.0, 2.8, -0.8],
    [-0.4, 2.9,  1.2],
  ];
  detallesPos.forEach(function (p) {
    var dGeo = new THREE.SphereGeometry(0.35 * escala, 6, 6);
    var d = new THREE.Mesh(dGeo, detalleMat);
    d.position.set(p[0] * escala, p[1] * escala, p[2] * escala);
    grupo.add(d);
  });
 
  // --- Sigue el terreno ondulado ---
  var yTerreno = Math.sin(x * 0.25) * 0.5 + Math.cos(z * 0.25) * 0.5
               + Math.sin(x * 0.6 + z * 0.4) * 0.2;
 
  grupo.position.set(x, yTerreno, z);
  // Pequeña rotación aleatoria para que no todos sean iguales
  grupo.rotation.y = Math.random() * Math.PI * 2;
  scene.add(grupo);
  return grupo;
}
 
 
// ============================================================
//  FLOR MEJORADA — Con pétalos reales y centro
// ============================================================
 
function crearFlor(x, y, z) {
  var grupo = new THREE.Group();
 
  // Colores para los pétalos
  var coloresPetalos = [
    0xFF6B9D, // Rosa fuerte
    0xFF69B4, // Rosa claro
    0xFFD700, // Amarillo
    0xFF4500, // Naranja-rojo
    0xFFFFFF, // Blanco
    0xDA70D6, // Orquídea
    0xFF85A1, // Salmón
  ];
  var colorPetalo = coloresPetalos[Math.floor(Math.random() * coloresPetalos.length)];
  var alturaFlor = 0.4 + Math.random() * 0.3;
 
  // --- Tallo ---
  var talloGeo = new THREE.CylinderGeometry(0.025, 0.03, alturaFlor * 2, 6);
  var talloMat = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
  var tallo = new THREE.Mesh(talloGeo, talloMat);
  tallo.position.y = alturaFlor;
  tallo.receiveShadow = true;
  grupo.add(tallo);
 
  // --- Hojita lateral en el tallo ---
  var hojaGeo = new THREE.SphereGeometry(0.12, 5, 4);
  hojaGeo.scale(1.8, 0.4, 0.8); // Aplanar para que parezca hoja
  var hojaMat = new THREE.MeshLambertMaterial({ color: 0x388E3C });
  var hoja = new THREE.Mesh(hojaGeo, hojaMat);
  hoja.position.set(0.15, alturaFlor * 0.6, 0);
  hoja.rotation.z = 0.4;
  grupo.add(hoja);
 
  // --- Pétalos (6 elipses alrededor del centro) ---
  var petalMat = new THREE.MeshLambertMaterial({ color: colorPetalo, side: THREE.DoubleSide });
  var numPetalos = 6;
  for (var i = 0; i < numPetalos; i++) {
    var angulo = (i / numPetalos) * Math.PI * 2;
    var petalGeo = new THREE.SphereGeometry(0.13, 6, 5);
    petalGeo.scale(1.0, 0.35, 1.8); // Forma ovalada de pétalo
    var petal = new THREE.Mesh(petalGeo, petalMat);
 
    // Posición alrededor del centro
    petal.position.set(
      Math.cos(angulo) * 0.18,
      alturaFlor * 2,
      Math.sin(angulo) * 0.18
    );
    petal.rotation.y = angulo;
    petal.castShadow = true;
    grupo.add(petal);
  }
 
  // --- Centro de la flor (pistilo) ---
  var centroGeo = new THREE.SphereGeometry(0.09, 8, 8);
  var centroMat = new THREE.MeshLambertMaterial({ color: 0xFFE000 }); // Amarillo brillante
  var centro = new THREE.Mesh(centroGeo, centroMat);
  centro.position.y = alturaFlor * 2;
  centro.castShadow = true;
  grupo.add(centro);
 
  // --- Posición siguiendo el terreno ---
  var yTerreno = Math.sin(x * 0.25) * 0.5 + Math.cos(z * 0.25) * 0.5
               + Math.sin(x * 0.6 + z * 0.4) * 0.2;
 
  grupo.position.set(x, yTerreno, z);
  grupo.rotation.y = Math.random() * Math.PI * 2; // Orientación aleatoria
  scene.add(grupo);
  return grupo;
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
