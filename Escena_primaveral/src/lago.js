// ============================================================
//  INTEGRANTE 4 — lago.js
//  Lago natural orgánico con piedras, nenúfares y agua animada
// ============================================================

var ondasMesh = null;

var LAGO_X = 0;
var LAGO_Z = 6;
var LAGO_Y = 0.27;

function initLago() {

  // ── 1. BASE DE AGUA (forma irregular con vértices desplazados) ──
  var aguaGeo = new THREE.CircleGeometry(3.2, 16); // 16 segmentos = más vértices para deformar

  // Desplazamos cada vértice del borde para romper la forma circular
  var positions = aguaGeo.attributes.position;
  for (var i = 1; i < positions.count; i++) { // i=0 es el centro, lo saltamos
    var x = positions.getX(i);
    var z = positions.getZ(i);
    var angulo = Math.atan2(z, x);
    // Variación de radio: entre 0.75 y 1.25 del radio original
    var variacion = 0.78 + Math.abs(Math.sin(angulo * 2.3 + 1.1)) * 0.44;
    positions.setX(i, x * variacion);
    positions.setZ(i, z * variacion);
  }
  positions.needsUpdate = true;
  aguaGeo.computeVertexNormals();

  var aguaMat = new THREE.MeshLambertMaterial({
    color: 0x3A9BD5,
    transparent: true,
    opacity: 0.82
  });
  ondasMesh = new THREE.Mesh(aguaGeo, aguaMat);
  ondasMesh.rotation.x = -Math.PI / 2;
  ondasMesh.position.set(LAGO_X, LAGO_Y + 0.04, LAGO_Z);
  scene.add(ondasMesh);

  // ── 2. FONDO visible bajo el agua (más oscuro en el centro) ──
  var fondoGeo = new THREE.CircleGeometry(3.0, 16);
  var fondoMat = new THREE.MeshLambertMaterial({ color: 0x1A6B8A });
  var fondo = new THREE.Mesh(fondoGeo, fondoMat);
  fondo.rotation.x = -Math.PI / 2;
  fondo.position.set(LAGO_X, LAGO_Y + 0.01, LAGO_Z);
  scene.add(fondo);

  // ── 3. PIEDRAS ALREDEDOR DEL BORDE ───────────────────────────
  var numPiedras = 14;
  for (var p = 0; p < numPiedras; p++) {
    var angPiedra = (p / numPiedras) * Math.PI * 2;
    // Radio irregular para que no queden en círculo perfecto
    var radioPiedra = 3.0 + Math.sin(p * 1.7) * 0.5;
    var px = LAGO_X + Math.cos(angPiedra) * radioPiedra;
    var pz = LAGO_Z + Math.sin(angPiedra) * radioPiedra;
    crearPiedra(px, LAGO_Y + 0.02, pz);
  }

  // ── 4. NENÚFARES MEJORADOS ────────────────────────────────────
  var posNenufares = [
    [ 1.0,  0.5],
    [-1.3,  0.3],
    [ 0.2, -1.2],
    [-0.5, -0.6],
    [ 1.4, -0.8],
  ];
  posNenufares.forEach(function(n) {
    crearNenufar(LAGO_X + n[0], LAGO_Y + 0.06, LAGO_Z + n[1]);
  });

  console.log('[Lago] Lago natural creado');
}

// ── PIEDRA natural (forma irregular) ─────────────────────────
function crearPiedra(x, y, z) {
  // SphereGeometry deformada = piedra orgánica
  var geo = new THREE.SphereGeometry(
    0.18 + Math.random() * 0.18, // radio variable
    6, 5
  );

  // Deformar vértices para hacerla irregular
  var pos = geo.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) * (0.8 + Math.random() * 0.5));
    pos.setY(i, pos.getY(i) * (0.4 + Math.random() * 0.3)); // aplanar
    pos.setZ(i, pos.getZ(i) * (0.8 + Math.random() * 0.5));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  // Color gris variado
  var grises = [0x808080, 0x909090, 0x707070, 0x6E6E6E, 0x989898];
var gris = grises[Math.floor(Math.random() * grises.length)];
  var mat = new THREE.MeshLambertMaterial({ color: gris });
  var piedra = new THREE.Mesh(geo, mat);
  piedra.position.set(x, y, z);
  piedra.rotation.y = Math.random() * Math.PI * 2;
  piedra.castShadow = true;
  piedra.receiveShadow = true;
  scene.add(piedra);
}

// ── NENÚFAR mejorado (hoja grande + flor de loto rosa) ────────
function crearNenufar(x, y, z) {
  var grupo = new THREE.Group();

  // Hoja grande verde oscuro
  var hojaGeo = new THREE.CircleGeometry(0.45, 12);
  var hojaMat = new THREE.MeshLambertMaterial({
    color: 0x2D6A2D,
    side: THREE.DoubleSide
  });
  var hoja = new THREE.Mesh(hojaGeo, hojaMat);
  hoja.rotation.x = -Math.PI / 2;
  grupo.add(hoja);

  // Líneas de la hoja (ranura característica del nenúfar)
  var ranuraGeo = new THREE.PlaneGeometry(0.44, 0.02);
  var ranuraMat = new THREE.MeshLambertMaterial({
    color: 0x1A4A1A,
    side: THREE.DoubleSide
  });
  var ranura = new THREE.Mesh(ranuraGeo, ranuraMat);
  ranura.rotation.x = -Math.PI / 2;
  ranura.position.y = 0.005;
  grupo.add(ranura);

  // Flor de loto rosa (pétalos en capas)
  var colorLoto = 0xFFB7C5; // Rosa suave
  var colorCentro = 0xFFE066; // Amarillo

  // Capa exterior de pétalos (8 pétalos grandes)
  for (var i = 0; i < 8; i++) {
    var ang = (i / 8) * Math.PI * 2;
    var petalGeo = new THREE.SphereGeometry(0.09, 5, 4);
    petalGeo.scale(0.6, 0.3, 1.4);
    var petalMat = new THREE.MeshLambertMaterial({ color: colorLoto });
    var petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(
      Math.cos(ang) * 0.13,
      0.06,
      Math.sin(ang) * 0.13
    );
    petal.rotation.y = ang;
    grupo.add(petal);
  }

  // Capa interior (5 pétalos más erguidos)
  for (var j = 0; j < 5; j++) {
    var ang2 = (j / 5) * Math.PI * 2 + 0.3;
    var petalGeo2 = new THREE.SphereGeometry(0.07, 5, 4);
    petalGeo2.scale(0.5, 0.9, 1.1);
    var petalMat2 = new THREE.MeshLambertMaterial({ color: 0xFFCDD5 });
    var petal2 = new THREE.Mesh(petalGeo2, petalMat2);
    petal2.position.set(
      Math.cos(ang2) * 0.07,
      0.10,
      Math.sin(ang2) * 0.07
    );
    petal2.rotation.y = ang2;
    grupo.add(petal2);
  }

  // Centro amarillo
  var centroGeo = new THREE.SphereGeometry(0.055, 7, 7);
  var centroMat = new THREE.MeshLambertMaterial({ color: colorCentro });
  var centro = new THREE.Mesh(centroGeo, centroMat);
  centro.position.y = 0.14;
  grupo.add(centro);

  grupo.position.set(x, y, z);
  grupo.rotation.y = Math.random() * Math.PI * 2;
  scene.add(grupo);
  return grupo;
}

// ── ANIMACIÓN ─────────────────────────────────────────────────
function updateLago(t) {
  if (!ondasMesh) return;
  var onda = 1 + Math.sin(t * 0.7) * 0.015;
  ondasMesh.scale.set(onda, 1, onda);
  ondasMesh.material.opacity = 0.72 + Math.sin(t * 1.1) * 0.1;
}