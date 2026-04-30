// ============================================================
//  INTEGRANTE 3 — Partículas y efectos visuales
//  Pétalos cayendo, polen flotando, flores abriéndose
// ============================================================lll

var petalos = [];
var polen = [];

function initEfectos() {
  // Crear sistema de pétalos cayendo
  for (var i = 0; i < 60; i++) {
    crearPetalo();
  }

  // Crear partículas de polen
  for (var j = 0; j < 40; j++) {
    crearPolen();
  }
}

function actualizarEfectos() {
  var t = clock.getElapsedTime();
  var delta = clock.getDelta ? 0.016 : 0.016;

  // Mover pétalos
  petalos.forEach(function (p) {
    p.mesh.position.y -= p.velocidadY;
    p.mesh.position.x += Math.sin(t * p.frecuencia + p.offset) * 0.008;
    p.mesh.position.z += Math.cos(t * p.frecuencia * 0.8 + p.offset) * 0.005;
    p.mesh.rotation.x += p.rotX;
    p.mesh.rotation.z += p.rotZ;

    // Reiniciar si cae demasiado
    if (p.mesh.position.y < -1) {
      p.mesh.position.y = 8 + Math.random() * 4;
      p.mesh.position.x = (Math.random() - 0.5) * 20;
      p.mesh.position.z = (Math.random() - 0.5) * 20;
    }
  });

  // Flotar partículas de polen
  polen.forEach(function (p) {
    p.mesh.position.y += Math.sin(t * p.frecuencia + p.offset) * 0.003;
    p.mesh.position.x += Math.cos(t * p.frecuencia * 0.6 + p.offset) * 0.004;
    p.mesh.position.z += Math.sin(t * p.frecuencia * 0.4 + p.offset) * 0.004;

    // Mantener en rango
    if (p.mesh.position.y > 6) p.mesh.position.y = 0.5;
    if (p.mesh.position.y < 0.3) p.mesh.position.y = 0.5;
  });
}

// ---------- Helpers de Integrante 3 ----------

function crearPetalo() {
  var colores = [0xFFB7C5, 0xFF69B4, 0xFFFFFF, 0xFFD0E4];
  var color = colores[Math.floor(Math.random() * colores.length)];

  var geo = new THREE.PlaneGeometry(0.15, 0.1);
  var mat = new THREE.MeshLambertMaterial({
    color: color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  var mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(
    (Math.random() - 0.5) * 20,
    Math.random() * 10,
    (Math.random() - 0.5) * 20
  );
  mesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  scene.add(mesh);

  petalos.push({
    mesh: mesh,
    velocidadY: 0.008 + Math.random() * 0.012,
    frecuencia: 0.5 + Math.random() * 1.5,
    offset: Math.random() * Math.PI * 2,
    rotX: (Math.random() - 0.5) * 0.02,
    rotZ: (Math.random() - 0.5) * 0.02
  });
}

function crearPolen() {
  var geo = new THREE.SphereGeometry(0.03, 4, 4);
  var mat = new THREE.MeshLambertMaterial({
    color: 0xFFEA00,
    transparent: true,
    opacity: 0.7
  });
  var mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(
    (Math.random() - 0.5) * 15,
    0.5 + Math.random() * 3,
    (Math.random() - 0.5) * 15
  );

  scene.add(mesh);

  polen.push({
    mesh: mesh,
    frecuencia: 0.3 + Math.random() * 1.2,
    offset: Math.random() * Math.PI * 2
  });
}

// ---- BONUS: Función para animar flores abriéndose ----
// Llama crearFlorAnimada(x, y, z) para agregar una flor que crece
var floresAnimadas = [];

function crearFlorAnimada(x, y, z) {
  var grupo = new THREE.Group();
  var talloMat = new THREE.MeshLambertMaterial({ color: 0x2E8B57 });
  var petalMat = new THREE.MeshLambertMaterial({ color: 0xFF6B9D, side: THREE.DoubleSide });

  var tallo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6),
    talloMat
  );
  tallo.position.y = 0.25;
  grupo.add(tallo);

  var centro = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    new THREE.MeshLambertMaterial({ color: 0xFFD700 })
  );
  centro.position.y = 0.5;
  grupo.add(centro);

  // 6 pétalos alrededor
  for (var i = 0; i < 6; i++) {
    var angle = (i / 6) * Math.PI * 2;
    var petalGeo = new THREE.PlaneGeometry(0.15, 0.3);
    var petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(
      Math.cos(angle) * 0.18,
      0.5,
      Math.sin(angle) * 0.18
    );
    petal.rotation.y = angle;
    petal.rotation.x = -0.5; // cerrado inicialmente
    grupo.add(petal);
  }

  grupo.position.set(x, y, z);
  grupo.scale.set(0.1, 0.1, 0.1); // empieza pequeña
  scene.add(grupo);

  floresAnimadas.push({
    grupo: grupo,
    progreso: 0,
    velocidad: 0.005 + Math.random() * 0.005
  });

  return grupo;
}

// Llamar esta función en el loop si quieres flores creciendo:
function actualizarFloresAnimadas() {
  floresAnimadas.forEach(function (f) {
    if (f.progreso < 1) {
      f.progreso += f.velocidad;
      var s = Math.min(f.progreso, 1);
      f.grupo.scale.set(s, s, s);
    }
  });
}
