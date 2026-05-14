// ============================================================
//  INTEGRANTE 2 — Fauna y personajes animados
// ============================================================
//  fauna.js — Fauna animada para Escena Primaveral 3D
//  Incluye: mariposas, abejas, pájaros y conejos con movimiento orgánico
//  Usa THREE.Group + clock.getElapsedTime() para animación fluida
// ============================================================

// Arrays que almacenan cada instancia de criatura
var mariposas = [];
var abejas = [];
var pajaros = [];
var conejos = [];  

// Paletas de colores vibrantes para las mariposas
var COLORES_MARIPOSA = [
  { ala: 0xFF69B4, patron: 0xFF1493 }, // Rosa fuerte
  { ala: 0xFFD700, patron: 0xFF8C00 }, // Dorado / naranja
  { ala: 0x9370DB, patron: 0x4B0082 }, // Violeta / índigo
  { ala: 0x00CED1, patron: 0x008B8B }, // Turquesa
  { ala: 0xFF6347, patron: 0xDC143C }, // Tomate / carmesí
  { ala: 0x7FFF00, patron: 0x32CD32 }, // Verde lima
];

// ============================================================
//  INICIALIZACIÓN — Llamar UNA VEZ desde main.js (antes del loop)
// ============================================================
function initFauna() {

  //Crea todas las criaturas y les asigna sus parámetros de movimiento 
  // (velocidad, radio de órbita, posición inicial, etc.

  // --- Mariposas (12 unidades) ---
  for (var i = 0; i < 12; i++) {
    var m = crearMariposa(
      (Math.random() - 0.5) * 18,
      2.0 + Math.random() * 2.5,
      (Math.random() - 0.5) * 18
    );
    m.radioOrbita = 7.0 + i * 1.0;
    m.velocidadOrbita = 0.35 + i * 0.05;
    m.offsetFase = i * (Math.PI * 2 / 12);
    m.velocidadAleteo = 7 + Math.random() * 4;
    m.amplitudVertical = 0.3 + Math.random() * 0.4;
    m.centroX = (Math.random() - 0.5) * 28;
    m.centroZ = (Math.random() - 0.5) * 28;
    mariposas.push(m);
  }

  // --- Abejas (10 unidades) ---
  for (var j = 0; j < 10; j++) {
    var a = crearAbeja(
      (Math.random() - 0.5) * 14,
      0.8 + Math.random() * 1.5,
      (Math.random() - 0.5) * 14
    );
    a.offsetFase = j * 1.1;
    a.velocidadX = 0.6 + Math.random() * 0.4;
    a.velocidadZ = 0.5 + Math.random() * 0.3;
    a.radioX = 8.0 + Math.random() * 5.0;
    a.radioZ = 7.0 + Math.random() * 5.0;
    a.centroX = (Math.random() - 0.5) * 22;
    a.centroZ = (Math.random() - 0.5) * 22;
    abejas.push(a);
  }

  // --- Pájaros (una bandada de 4 en formación) ---
  crearBandada(4, 0, 5, 0);

  // --- Conejos (4 unidades saltando por el campo) ---  ← NUEVO
  for (var c = 0; c < 4; c++) { 
    var conejo = crearConejo(
      (Math.random() - 0.5) * 12,
      0,
      (Math.random() - 0.5) * 12
    );
    conejo.offsetFase  = c * (Math.PI / 2);
    conejo.velocidadX  = 0.28 + Math.random() * 0.15;
    conejo.velocidadZ  = 0.22 + Math.random() * 0.12;
    conejo.radioX  = 8.0  + Math.random() * 6.0;
    conejo.radioZ  = 7.0  + Math.random() * 5.0;
    conejo.centroX = (Math.random() - 0.5) * 18;
    conejo.centroZ = (Math.random() - 0.5) * 18;
    conejos.push(conejo);
  }
}

// ============================================================
//  ACTUALIZACIÓN — Llamar CADA FRAME desde el loop en main.js
//  Animación basada en clock.getElapsedTime() para movimientos suaves y sincronizados
// ============================================================
function actualizarFauna() {
  var t = clock.getElapsedTime();

  // ---- Animar mariposas ----
  mariposas.forEach(function (m, i) {
    var px = m.centroX + Math.sin(t * m.velocidadOrbita + m.offsetFase) * m.radioOrbita;
    var pz = m.centroZ + Math.cos(t * m.velocidadOrbita * 0.8 + m.offsetFase) * m.radioOrbita * 0.7;
    var py = 2.2 + m.amplitudVertical * Math.sin(t * 1.8 + m.offsetFase);

    m.grupo.position.set(px, py, pz);

    var dx = Math.cos(t * m.velocidadOrbita + m.offsetFase) * m.velocidadOrbita;
    var dz = -Math.sin(t * m.velocidadOrbita * 0.8 + m.offsetFase) * m.velocidadOrbita * 0.7;
    m.grupo.rotation.y = Math.atan2(dx, dz);

    m.grupo.rotation.z = Math.sin(t * m.velocidadOrbita + m.offsetFase) * 0.25;

    var aleteo = (Math.sin(t * m.velocidadAleteo + m.offsetFase) + 1) / 2;
    aleteo = Math.max(0.08, aleteo);
    m.alaIzq.scale.x = aleteo;
    m.alaDer.scale.x = aleteo;

    var anguloAla = aleteo * 0.4;
    m.alaIzq.rotation.y = anguloAla;
    m.alaDer.rotation.y = -anguloAla;
  });

  // ---- Animar abejas ----
  abejas.forEach(function (a, i) {
    var off = a.offsetFase;

    var px = a.centroX
      + Math.sin(t * a.velocidadX + off) * a.radioX
      + Math.sin(t * 2.3 + off * 1.5) * 0.5;

    var pz = a.centroZ
      + Math.cos(t * a.velocidadZ + off) * a.radioZ
      + Math.cos(t * 1.9 + off * 0.8) * 0.5;

    var py = 1.3 + Math.sin(t * 2.5 + off) * 0.25;

    a.grupo.position.set(px, py, pz);

    var dx = Math.cos(t * a.velocidadX + off);
    var dz = -Math.sin(t * a.velocidadZ + off);
    a.grupo.rotation.y = Math.atan2(dx, dz);

    var vibracion = Math.sin(t * 28 + off) * 0.5 + 0.5;
    a.ala1.scale.x = 0.7 + vibracion * 0.3;
    a.ala2.scale.x = 0.7 + vibracion * 0.3;

    a.cuerpo.position.y = Math.sin(t * 28 + off) * 0.005;
  });

  // ---- Animar pájaros ----
  pajaros.forEach(function (p, i) {
    var off = p.offsetFase;

    var velocidadVuelo = 1.2;
    var px = Math.sin(t * 0.18 + off) * 20;
    var pz = Math.cos(t * 0.12 + off) * 15 + p.offsetFormacion * 1.5;
    var py = 5.5 + Math.sin(t * 0.9 + off) * 0.4;

    p.grupo.position.set(px, py, pz);

    var dx = Math.cos(t * 0.18 + off) * 0.18;
    var dz = -Math.sin(t * 0.12 + off) * 0.12;
    p.grupo.rotation.y = Math.atan2(dx, dz);

    var aleteo = Math.sin(t * 4.5 + off) * 0.5 + 0.5;
    p.alaIzq.rotation.z = aleteo * 0.6 + 0.1;
    p.alaDer.rotation.z = -(aleteo * 0.6 + 0.1);
  });

  // ---- Animar conejos ----  ← NUEVO
  conejos.forEach(function (c) {
    var off = c.offsetFase;

    var px = c.centroX + Math.sin(t * c.velocidadX + off) * c.radioX;
    var pz = c.centroZ + Math.cos(t * c.velocidadZ + off) * c.radioZ;

    // Saltos: arco parabólico, toca el suelo entre cada salto
    var cicloSalto = t * 2.8 + off;
    var py = Math.abs(Math.sin(cicloSalto)) * 1.1;

    c.grupo.position.set(px, py, pz);

    // Orientar hacia donde se mueve
    var dx =  Math.cos(t * c.velocidadX + off) * c.velocidadX;
    var dz = -Math.sin(t * c.velocidadZ + off) * c.velocidadZ;
    c.grupo.rotation.y = Math.atan2(dx, dz);

    // Orejas: se inclinan según la fase del salto
    var faseOreja = Math.sin(cicloSalto);
    c.orejaIzq.rotation.x = faseOreja * 0.35;
    c.orejaDer.rotation.x = faseOreja * 0.35;

    // Patas traseras: se estiran en el punto más alto
    var estiramiento = Math.abs(Math.sin(cicloSalto));
    c.pataTraseraIzq.rotation.x = -estiramiento * 0.7;
    c.pataTraseraDer.rotation.x = -estiramiento * 0.7;

    // Cuerpo: squash & stretch al aterrizar
    var aterrizaje = 1.0 - estiramiento * 0.15;
    c.cuerpo.scale.y = aterrizaje;
    c.cuerpo.scale.z = 1.0 + (1.0 - aterrizaje) * 0.5;

    // Colita: meneo continuo e independiente
    c.cola.rotation.z = Math.sin(t * 5.5 + off) * 0.25;
  });
}

// ============================================================
//  HELPERS — Constructores de cada criatura
// ============================================================

/**
 * crearMariposa(x, y, z)
 */
function crearMariposa(x, y, z) {
  var grupo = new THREE.Group();

  var paleta = COLORES_MARIPOSA[Math.floor(Math.random() * COLORES_MARIPOSA.length)];

  var matAla = new THREE.MeshLambertMaterial({
    color: paleta.ala,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88
  });

  var formaAlaSup = new THREE.Shape();
  formaAlaSup.moveTo(0, 0);
  formaAlaSup.bezierCurveTo(-0.6, 0.1, -0.75, 0.55, -0.4, 0.7);
  formaAlaSup.bezierCurveTo(-0.15, 0.82, 0, 0.5, 0, 0);

  var formaAlaInf = new THREE.Shape();
  formaAlaInf.moveTo(0, 0);
  formaAlaInf.bezierCurveTo(-0.45, -0.05, -0.55, -0.4, -0.3, -0.55);
  formaAlaInf.bezierCurveTo(-0.1, -0.65, 0, -0.35, 0, 0);

  var geoAlaSup = new THREE.ShapeGeometry(formaAlaSup);
  var geoAlaInf = new THREE.ShapeGeometry(formaAlaInf);

  var alaSupIzq = new THREE.Mesh(geoAlaSup, matAla);
  alaSupIzq.position.set(-0.02, 0.05, 0);

  var alaInfIzq = new THREE.Mesh(geoAlaInf, matAla);
  alaInfIzq.position.set(-0.02, -0.02, 0);

  var grupoIzq = new THREE.Group();
  grupoIzq.add(alaSupIzq);
  grupoIzq.add(alaInfIzq);
  grupo.add(grupoIzq);

  var grupoDerechoContenedor = new THREE.Group();
  grupoDerechoContenedor.scale.x = -1;
  var alaSupDer = new THREE.Mesh(geoAlaSup, matAla);
  alaSupDer.position.set(-0.02, 0.05, 0);
  var alaInfDer = new THREE.Mesh(geoAlaInf, matAla);
  alaInfDer.position.set(-0.02, -0.02, 0);
  grupoDerechoContenedor.add(alaSupDer);
  grupoDerechoContenedor.add(alaInfDer);
  grupo.add(grupoDerechoContenedor);

  var matCuerpo = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });

  var toraxGeo = new THREE.SphereGeometry(0.06, 7, 7);
  var torax = new THREE.Mesh(toraxGeo, matCuerpo);
  torax.position.y = 0.05;
  grupo.add(torax);

  var abdomenGeo = new THREE.CylinderGeometry(0.03, 0.045, 0.38, 6);
  var abdomen = new THREE.Mesh(abdomenGeo, matCuerpo);
  abdomen.position.y = -0.12;
  grupo.add(abdomen);

  var cabezaGeo = new THREE.SphereGeometry(0.05, 7, 7);
  var cabeza = new THREE.Mesh(cabezaGeo, matCuerpo);
  cabeza.position.y = 0.13;
  grupo.add(cabeza);

  var matAntena = new THREE.LineBasicMaterial({ color: 0x333333 });
  [-1, 1].forEach(function (lado) {
    var puntosAntena = [
      new THREE.Vector3(lado * 0.02, 0.14, 0),
      new THREE.Vector3(lado * 0.08, 0.28, 0.02)
    ];
    var geoAntena = new THREE.BufferGeometry().setFromPoints(puntosAntena);
    var antena = new THREE.Line(geoAntena, matAntena);
    grupo.add(antena);

    var bolGeo = new THREE.SphereGeometry(0.015, 5, 5);
    var bol = new THREE.Mesh(bolGeo, new THREE.MeshLambertMaterial({ color: paleta.patron }));
    bol.position.set(lado * 0.08, 0.29, 0.02);
    grupo.add(bol);
  });

  grupo.position.set(x, y, z);
  scene.add(grupo);

  return {
    grupo: grupo,
    alaIzq: grupoIzq,
    alaDer: grupoDerechoContenedor
  };
}

/**
 * crearAbeja(x, y, z)
 */
function crearAbeja(x, y, z) {
  var grupo = new THREE.Group();

  var cuerpoGeo = new THREE.SphereGeometry(0.12, 10, 10);
  var cuerpoMat = new THREE.MeshLambertMaterial({ color: 0xFFCC00 });
  var cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat);
  cuerpo.scale.set(0.9, 0.85, 1.6);
  grupo.add(cuerpo);

  var franjaMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  [-0.05, 0.06].forEach(function (zOffset) {
    var franjaGeo = new THREE.TorusGeometry(0.10, 0.035, 6, 14);
    var franja = new THREE.Mesh(franjaGeo, franjaMat);
    franja.rotation.x = Math.PI / 2;
    franja.position.z = zOffset;
    franja.scale.set(0.9, 0.9, 1);
    grupo.add(franja);
  });

  var toraxGeo = new THREE.SphereGeometry(0.085, 8, 8);
  var toraxMat = new THREE.MeshLambertMaterial({ color: 0x553300 });
  var torax = new THREE.Mesh(toraxGeo, toraxMat);
  torax.position.z = 0.2;
  torax.scale.set(1, 0.9, 1.1);
  grupo.add(torax);

  var cabezaGeo = new THREE.SphereGeometry(0.07, 8, 8);
  var cabezaMat = new THREE.MeshLambertMaterial({ color: 0x222200 });
  var cabeza = new THREE.Mesh(cabezaGeo, cabezaMat);
  cabeza.position.z = 0.3;
  grupo.add(cabeza);

  var ojoMat = new THREE.MeshLambertMaterial({ color: 0x880000 });
  [-0.04, 0.04].forEach(function (xOjo) {
    var ojoGeo = new THREE.SphereGeometry(0.02, 5, 5);
    var ojo = new THREE.Mesh(ojoGeo, ojoMat);
    ojo.position.set(xOjo, 0.03, 0.36);
    grupo.add(ojo);
  });

  var aguijonGeo = new THREE.ConeGeometry(0.015, 0.08, 5);
  var aguijonMat = new THREE.MeshLambertMaterial({ color: 0x333300 });
  var aguijon = new THREE.Mesh(aguijonGeo, aguijonMat);
  aguijon.position.z = -0.22;
  aguijon.rotation.x = -Math.PI / 2;
  grupo.add(aguijon);

  var alaMat = new THREE.MeshLambertMaterial({
    color: 0xDDEEFF,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });

  var formaAla = new THREE.Shape();
  formaAla.moveTo(0, 0);
  formaAla.bezierCurveTo(0.05, 0.18, 0.28, 0.22, 0.32, 0.08);
  formaAla.bezierCurveTo(0.28, -0.02, 0.08, -0.02, 0, 0);

  var geoAla = new THREE.ShapeGeometry(formaAla);

  var ala1 = new THREE.Mesh(geoAla, alaMat);
  ala1.position.set(0.12, 0.1, 0.15);
  ala1.rotation.x = -0.3;
  grupo.add(ala1);

  var ala2 = new THREE.Mesh(geoAla, alaMat);
  ala2.position.set(-0.12, 0.1, 0.15);
  ala2.rotation.x = -0.3;
  ala2.scale.x = -1;
  grupo.add(ala2);

  var formaAlaTras = new THREE.Shape();
  formaAlaTras.moveTo(0, 0);
  formaAlaTras.bezierCurveTo(0.04, 0.12, 0.2, 0.14, 0.22, 0.04);
  formaAlaTras.bezierCurveTo(0.18, -0.02, 0.05, -0.02, 0, 0);
  var geoAlaTras = new THREE.ShapeGeometry(formaAlaTras);
  var ala3 = new THREE.Mesh(geoAlaTras, alaMat);
  ala3.position.set(0.1, 0.06, 0.05);
  ala3.rotation.x = -0.3;
  grupo.add(ala3);

  var ala4 = new THREE.Mesh(geoAlaTras, alaMat);
  ala4.position.set(-0.1, 0.06, 0.05);
  ala4.rotation.x = -0.3;
  ala4.scale.x = -1;
  grupo.add(ala4);

  grupo.position.set(x, y, z);
  scene.add(grupo);

  return { grupo: grupo, cuerpo: cuerpo, ala1: ala1, ala2: ala2 };
}

/**
 * crearBandada(cantidad, cx, cy, cz)
 */
function crearBandada(cantidad, cx, cy, cz) {
  for (var i = 0; i < cantidad; i++) {
    var lado = (i % 2 === 0 ? 1 : -1);
    var fila = Math.floor(i / 2) + 1;
    var xFormacion = lado * fila * 1.2;
    var zFormacion = fila * 0.9;

    var p = crearPajaro(cx + xFormacion, cy, cz + zFormacion);
    p.offsetFase = i * 0.18;
    p.offsetFormacion = xFormacion;
    pajaros.push(p);
  }
}

/**
 * crearPajaro(x, y, z)
 */
function crearPajaro(x, y, z) {
  var grupo = new THREE.Group();

  var matCuerpo = new THREE.MeshLambertMaterial({ color: 0x2C3E50 });
  var matAla = new THREE.MeshLambertMaterial({
    color: 0x34495E,
    side: THREE.DoubleSide
  });

  var cuerpoGeo = new THREE.SphereGeometry(0.12, 8, 6);
  var cuerpo = new THREE.Mesh(cuerpoGeo, matCuerpo);
  cuerpo.scale.set(0.7, 0.6, 1.8);
  grupo.add(cuerpo);

  var colaGeo = new THREE.ConeGeometry(0.09, 0.2, 4);
  var cola = new THREE.Mesh(colaGeo, matCuerpo);
  cola.position.z = -0.26;
  cola.rotation.x = Math.PI / 2;
  cola.scale.set(1, 0.3, 1);
  grupo.add(cola);

  var cabezaGeo = new THREE.SphereGeometry(0.07, 7, 7);
  var cabeza = new THREE.Mesh(cabezaGeo, matCuerpo);
  cabeza.position.z = 0.22;
  cabeza.position.y = 0.03;
  grupo.add(cabeza);

  var picoGeo = new THREE.ConeGeometry(0.012, 0.07, 5);
  var picoMat = new THREE.MeshLambertMaterial({ color: 0xF39C12 });
  var pico = new THREE.Mesh(picoGeo, picoMat);
  pico.position.set(0, 0.025, 0.32);
  pico.rotation.x = Math.PI / 2;
  grupo.add(pico);

  var formaAla = new THREE.Shape();
  formaAla.moveTo(0, 0);
  formaAla.bezierCurveTo(0.1, 0.05, 0.45, 0.08, 0.55, 0);
  formaAla.bezierCurveTo(0.45, -0.06, 0.15, -0.04, 0, 0);
  var geoAla = new THREE.ShapeGeometry(formaAla);

  var alaIzq = new THREE.Mesh(geoAla, matAla);
  alaIzq.position.set(0.05, 0, 0);
  alaIzq.rotation.x = -0.15;

  var alaDer = new THREE.Mesh(geoAla, matAla);
  alaDer.position.set(-0.05, 0, 0);
  alaDer.rotation.x = -0.15;
  alaDer.scale.x = -1;

  grupo.add(alaIzq);
  grupo.add(alaDer);

  grupo.position.set(x, y, z);
  scene.add(grupo);

  return { grupo: grupo, alaIzq: alaIzq, alaDer: alaDer };
}

/**
 * crearConejo(x, y, z)  ← NUEVO
 * Conejo blanco y esponjoso con orejas largas, colita y patas animadas.
 * Retorna { grupo, cuerpo, orejaIzq, orejaDer, pataTraseraIzq, pataTraseraDer, cola }
 */
function crearConejo(x, y, z) {
  var grupo = new THREE.Group();

  var matBlanco = new THREE.MeshLambertMaterial({ color: 0xFFFAF0 }); // Blanco cálido
  var matRosa   = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 }); // Rosa bebé
  var matOjo    = new THREE.MeshLambertMaterial({ color: 0xFF69B4 }); // Ojos rosados
  var matNariz  = new THREE.MeshLambertMaterial({ color: 0xFF9999 });

  // === CUERPO ===
  var cuerpoGeo = new THREE.SphereGeometry(0.38, 10, 10);
  var cuerpo    = new THREE.Mesh(cuerpoGeo, matBlanco);
  cuerpo.scale.set(1.0, 0.95, 1.2);
  grupo.add(cuerpo);

  // === CABEZA ===
  var cabezaGeo = new THREE.SphereGeometry(0.26, 10, 10);
  var cabeza    = new THREE.Mesh(cabezaGeo, matBlanco);
  cabeza.position.set(0, 0.25, 0.18);
  cabeza.scale.set(1.0, 0.95, 1.0);
  grupo.add(cabeza);

  // Mejillas rosadas
  [-0.07, 0.07].forEach(function (xM) {
    var mejillaGeo = new THREE.SphereGeometry(0.045, 7, 7);
    var mejilla    = new THREE.Mesh(mejillaGeo, matRosa);
    mejilla.position.set(xM, 0.22, 0.31);
    grupo.add(mejilla);
  });

  // Nariz
  var narizGeo = new THREE.SphereGeometry(0.025, 6, 6);
  var nariz    = new THREE.Mesh(narizGeo, matNariz);
  nariz.position.set(0, 0.245, 0.335);
  nariz.scale.set(1.2, 0.7, 0.8);
  grupo.add(nariz);

  // Ojos con brillo
  [-0.065, 0.065].forEach(function (xO) {
    var ojoGeo = new THREE.SphereGeometry(0.028, 7, 7);
    var ojo    = new THREE.Mesh(ojoGeo, matOjo);
    ojo.position.set(xO, 0.29, 0.31);
    grupo.add(ojo);

    var brilloGeo = new THREE.SphereGeometry(0.009, 5, 5);
    var brillo    = new THREE.Mesh(brilloGeo,
                      new THREE.MeshLambertMaterial({ color: 0xFFFFFF }));
    brillo.position.set(xO + 0.01, 0.298, 0.337);
    grupo.add(brillo);
  });

  // === OREJAS ===
  var orejaGeo = new THREE.CylinderGeometry(0.05, 0.035, 0.65, 8);
  var orejaInterGeo = new THREE.CylinderGeometry(0.018, 0.012, 0.38, 8);

  function hacerOreja(xPos) {
    var orejaGrupo = new THREE.Group();
    var orejaMesh  = new THREE.Mesh(orejaGeo, matBlanco);
    orejaGrupo.add(orejaMesh);
    var interior = new THREE.Mesh(orejaInterGeo, matRosa);
    interior.position.z = 0.008;
    orejaGrupo.add(interior);
    orejaGrupo.position.set(xPos, 0.44, 0.18);
    orejaGrupo.rotation.z = xPos * -2.2;
    orejaGrupo.rotation.x = -0.15;
    grupo.add(orejaGrupo);
    return orejaGrupo;
  }

  var orejaIzq = hacerOreja(-0.075);
  var orejaDer = hacerOreja( 0.075);

  // === PATAS DELANTERAS ===
  var pataGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.28, 8);
  [-0.12, 0.12].forEach(function (xP) {
    var pata = new THREE.Mesh(pataGeo, matBlanco);
    pata.position.set(xP, -0.16, 0.14);
    pata.rotation.x = 0.4;
    grupo.add(pata);
  });

  // === PATAS TRASERAS (más grandes, dan el impulso del salto) ===
 var pataTGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.34, 8);

  var pataTraseraIzq = new THREE.Mesh(pataTGeo, matBlanco);
  pataTraseraIzq.position.set(-0.13, -0.18, -0.08);
  pataTraseraIzq.rotation.x = -0.3;
  grupo.add(pataTraseraIzq);

  var pataTraseraDer = new THREE.Mesh(pataTGeo, matBlanco);
  pataTraseraDer.position.set( 0.13, -0.18, -0.08);
  pataTraseraDer.rotation.x = -0.3;
  grupo.add(pataTraseraDer);

  // === COLITA ESPONJOSA ===
  var colaGeo = new THREE.SphereGeometry(0.11, 8, 8);
  var cola    = new THREE.Mesh(colaGeo, matBlanco);
  cola.position.set(0, 0.02, -0.25);
  cola.scale.set(1.1, 1.0, 0.85);
  grupo.add(cola);

  grupo.position.set(x, y, z);
  scene.add(grupo);

  return {
    grupo          : grupo,
    cuerpo         : cuerpo,
    orejaIzq       : orejaIzq,
    orejaDer       : orejaDer,
    pataTraseraIzq : pataTraseraIzq,
    pataTraseraDer : pataTraseraDer,
    cola           : cola
  };
}