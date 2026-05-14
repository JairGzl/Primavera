// ============================================================
//  INTEGRANTE 4 — lago.js
//  Lago natural orgánico con piedras, nenúfares y agua animada
// ============================================================

var ondasMesh = null;

var LAGO_X = 0; // horizontal
var LAGO_Z = 6;//profundidad
var LAGO_Y = 0.27; //vertical

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

  // ── 3. PIEDRAS  ───────────────────────────
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

  // ── 5. PATITO  ────────────────────────────────────────
  crearPato(LAGO_X + 0.5, LAGO_Y + 0.12, LAGO_Z - 0.5);


  console.log('[Lago] Lago natural creado');
}

// ── PIEDRA natural (forma irregular) ─────────────────────────
function crearPiedra(x, y, z) {
  // SphereGeometry deformada = piedra orgánica
  var geo = new THREE.SphereGeometry(
    0.18 + Math.random() * 0.18, // radio variable
    6, 5 //6 por 5 segmentos
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
  ondasMesh.scale.set(onda, 1, onda);//simula movimiento de ondas(muy leve)
  ondasMesh.material.opacity = 0.72 + Math.sin(t * 1.1) * 0.1;

  // Animar pato
  scene.traverse(function(obj) {
    if (!obj.userData || !obj.userData.velocidad) return;
    var off = obj.userData.offsetFase;
    var r   = obj.userData.radio;
    var v   = obj.userData.velocidad;

    // Nada en círculo dentro del lago
    obj.position.x = obj.userData.centroX + Math.sin(t * v + off) * r;
    obj.position.z = obj.userData.centroZ + Math.cos(t * v + off) * r;

    // Orientar hacia donde nada
    var dx =  Math.cos(t * v + off);
    var dz = -Math.sin(t * v + off);
    obj.rotation.y = Math.atan2(dx, dz);

    // Balanceo suave (como flotando en el agua)
    obj.rotation.z = Math.sin(t * 1.8 + off) * 0.08;

    // Cabeceo de la cabeza
    if (obj.userData.cabeza) {
      obj.userData.cabeza.rotation.x = Math.sin(t * 1.2 + off) * 0.12;
    }

    // Colita menea
    if (obj.userData.cola) {
      obj.userData.cola.rotation.z = Math.sin(t * 3.0 + off) * 0.2;
    }
  });
}

function crearPato(x, y, z) {
  var grupo = new THREE.Group();

  var matAmarillo = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  var matNaranja  = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
  var matOjo      = new THREE.MeshLambertMaterial({ color: 0x111111 });
  var matBlanco   = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

  // === CUERPO ===
  var cuerpoGeo = new THREE.SphereGeometry(0.35, 10, 10);
  var cuerpo    = new THREE.Mesh(cuerpoGeo, matAmarillo);
  cuerpo.scale.set(1.0, 0.65, 1.4);
  grupo.add(cuerpo);

  // === CABEZA ===
  var cabezaGeo = new THREE.SphereGeometry(0.20, 10, 10);
  var cabeza    = new THREE.Mesh(cabezaGeo, matAmarillo);
  cabeza.position.set(0, 0.28, 0.30);
  grupo.add(cabeza);

  // === PICO ===
  var picoGeo = new THREE.CylinderGeometry(0.035, 0.055, 0.15, 6);
  var pico    = new THREE.Mesh(picoGeo, matNaranja);
  pico.rotation.x = Math.PI / 2;
  pico.position.set(0, 0.25, 0.52);
  grupo.add(pico);

  // === OJO izquierdo y derecho ===
  [-0.055, 0.055].forEach(function(xO) {
    var ojoGeo = new THREE.SphereGeometry(0.028, 6, 6);
    var ojo    = new THREE.Mesh(ojoGeo, matOjo);
    ojo.position.set(xO, 0.35, 0.46);
    grupo.add(ojo);

    // Brillo del ojo
    var brilloGeo = new THREE.SphereGeometry(0.015, 5, 5);
    var brillo    = new THREE.Mesh(brilloGeo, matBlanco);
    brillo.position.set(xO + 0.008, 0.36, 0.475);
    grupo.add(brillo);
  });

  // === ALAS (ligeramente levantadas) ===
  var alaGeo = new THREE.SphereGeometry(0.12, 7, 7);
  [-1, 1].forEach(function(lado) {
    var ala = new THREE.Mesh(alaGeo, matAmarillo);
    ala.scale.set(0.35, 0.55, 0.9);
    ala.position.set(lado * 0.32, 0.06, 0);
    ala.rotation.z = lado * 0.3;
    grupo.add(ala);
  });

  // === COLA (pequeño triángulo levantado) ===
  var colaGeo = new THREE.ConeGeometry(0.11, 0.22, 5);
  var cola    = new THREE.Mesh(colaGeo, matAmarillo);
  cola.position.set(0, 0.18, -0.42);
  cola.rotation.x = -0.8;
  grupo.add(cola);

  // === PATAS (solo visibles en el borde del agua) ===
  var pataGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 5);
  [-0.07, 0.07].forEach(function(xP) {
    var pata = new THREE.Mesh(pataGeo, matNaranja);
    pata.position.set(xP, -0.22, 0.05);
    grupo.add(pata);
  });

  grupo.position.set(x, y, z);
  scene.add(grupo);

  // Guardar datos para animación
  grupo.userData.offsetFase = Math.random() * Math.PI * 2;
  grupo.userData.radio      = 0.8 + Math.random() * 0.6;
  grupo.userData.velocidad  = 0.18 + Math.random() * 0.1;
  grupo.userData.centroX    = LAGO_X;
  grupo.userData.centroZ    = LAGO_Z;
  grupo.userData.cabeza     = cabeza;
  grupo.userData.cola       = cola;

  return grupo;
}