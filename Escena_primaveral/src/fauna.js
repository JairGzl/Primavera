// ============================================================
//  INTEGRANTE 2 — Fauna y personajes animados
// ============================================================
//  fauna.js — Fauna animada para Escena Primaveral 3D
//  Incluye: mariposas, abejas y pájaros con movimiento orgánico
//  Usa THREE.Group + clock.getElapsedTime() para animación fluida
// ============================================================

// Arrays que almacenan cada instancia de criatura
var mariposas = [];
var abejas = [];
var pajaros = [];

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

 // --- Mariposas (12 unidades) ---  ← antes: 6
  for (var i = 0; i < 12; i++) {
    var m = crearMariposa(
      (Math.random() - 0.5) * 18,
      2.0 + Math.random() * 2.5,
      (Math.random() - 0.5) * 18
    );
    m.radioOrbita = 4.0 + i * 0.8;
    m.velocidadOrbita = 0.35 + i * 0.05;        // ← ajustado para 12 bichos
    m.offsetFase = i * (Math.PI * 2 / 12);       // ← distribuir 12 fases
    m.velocidadAleteo = 7 + Math.random() * 4;
    m.amplitudVertical = 0.3 + Math.random() * 0.4;
    m.centroX = (Math.random() - 0.5) * 16;
    m.centroZ = (Math.random() - 0.5) * 16;
    mariposas.push(m);
  }


  // --- Abejas (10 unidades) ---  ← antes: 5
  for (var j = 0; j < 10; j++) {
    var a = crearAbeja(
      (Math.random() - 0.5) * 14,
      0.8 + Math.random() * 1.5,
      (Math.random() - 0.5) * 14
    );
    a.offsetFase = j * 1.1;                      // ← ajustado para 10 bichos
    a.velocidadX = 0.6 + Math.random() * 0.4;
    a.velocidadZ = 0.5 + Math.random() * 0.3;
    a.radioX = 5.0 + Math.random() * 3.0;
    a.radioZ = 4.5 + Math.random() * 3.0;
    a.centroX = (Math.random() - 0.5) * 12;
    a.centroZ = (Math.random() - 0.5) * 12;
    abejas.push(a);
  }
  // --- Pájaros (una bandada de 4 en formación) ---
  crearBandada(4, 0, 5, 0); // x=0, y=5 (altura), z=0 (centro)
}

// ============================================================
//  ACTUALIZACIÓN — Llamar CADA FRAME desde el loop en main.js
//  Ejemplo en main.js:
//    function animate() {
//      requestAnimationFrame(animate);
//      actualizarFauna();   // <-- agregar esta línea
//      renderer.render(scene, camera);
//    }
// ============================================================
function actualizarFauna() {
  var t = clock.getElapsedTime();

  // ---- Animar mariposas ----
  mariposas.forEach(function (m, i) {
    // Trayectoria: espiral ovalada alrededor de su punto central
    var px = m.centroX + Math.sin(t * m.velocidadOrbita + m.offsetFase) * m.radioOrbita;
    var pz = m.centroZ + Math.cos(t * m.velocidadOrbita * 0.8 + m.offsetFase) * m.radioOrbita * 0.7;
    // Oscilación vertical suave (simula corrientes de aire)
    var py = 2.2 + m.amplitudVertical * Math.sin(t * 1.8 + m.offsetFase);

    m.grupo.position.set(px, py, pz);

    // Orientar hacia la dirección de movimiento calculando la derivada
    var dx = Math.cos(t * m.velocidadOrbita + m.offsetFase) * m.velocidadOrbita;
    var dz = -Math.sin(t * m.velocidadOrbita * 0.8 + m.offsetFase) * m.velocidadOrbita * 0.7;
    m.grupo.rotation.y = Math.atan2(dx, dz);

    // Leve inclinación lateral según la curva (sensación de giro real)
    m.grupo.rotation.z = Math.sin(t * m.velocidadOrbita + m.offsetFase) * 0.25;

    // Aleteo: las alas se pliegan y despliegan (scale.x va de 0.1 a 1.0)
    var aleteo = (Math.sin(t * m.velocidadAleteo + m.offsetFase) + 1) / 2;
    aleteo = Math.max(0.08, aleteo); // Mínimo 8% para no desaparecer
    m.alaIzq.scale.x = aleteo;
    m.alaDer.scale.x = aleteo;

    // Pequeña rotación de alas (ángulo de ataque)
    var anguloAla = aleteo * 0.4;
    m.alaIzq.rotation.y = anguloAla;
    m.alaDer.rotation.y = -anguloAla;
  });

  // ---- Animar abejas ----
  abejas.forEach(function (a, i) {
    var off = a.offsetFase;

    // Movimiento de Lissajous modificado → trayectoria errática realista
    var px = a.centroX
      + Math.sin(t * a.velocidadX + off) * a.radioX
      + Math.sin(t * 2.3 + off * 1.5) * 0.5; // Micro-zigzag

    var pz = a.centroZ
      + Math.cos(t * a.velocidadZ + off) * a.radioZ
      + Math.cos(t * 1.9 + off * 0.8) * 0.5;

    // Pequeños saltos verticales (búsqueda de flor)
    var py = 0.9 + Math.abs(Math.sin(t * 2.5 + off)) * 0.8;

    a.grupo.position.set(px, py, pz);

    // Girar hacia donde va
    var dx = Math.cos(t * a.velocidadX + off);
    var dz = -Math.sin(t * a.velocidadZ + off);
    a.grupo.rotation.y = Math.atan2(dx, dz);

    // Vibración rápida de alas (frecuencia alta como abeja real)
    var vibracion = Math.sin(t * 28 + off) * 0.5 + 0.5;
    a.ala1.scale.x = 0.7 + vibracion * 0.3;
    a.ala2.scale.x = 0.7 + vibracion * 0.3;

    // Leve movimiento de "zumbido" en el cuerpo
    a.cuerpo.position.y = Math.sin(t * 28 + off) * 0.005;
  });

  // ---- Animar pájaros ----
  pajaros.forEach(function (p, i) {
    var off = p.offsetFase;

    // Los pájaros vuelan en formación "V" atravesando la escena
    // Cada pájaro sigue la misma trayectoria pero con retraso de fase
    var velocidadVuelo = 1.2;
    var px = Math.sin(t * 0.18 + off) * 20;
    var pz = Math.cos(t * 0.12 + off) * 15 + p.offsetFormacion * 1.5;
    var py = 5.5 + Math.sin(t * 0.9 + off) * 0.4;

    p.grupo.position.set(px, py, pz);

    // Orientar hacia la dirección de vuelo
    var dx = Math.cos(t * 0.18 + off) * 0.18;
    var dz = -Math.sin(t * 0.12 + off) * 0.12;
    p.grupo.rotation.y = Math.atan2(dx, dz);

    // Aleteo suave (más lento que mariposas)
    var aleteo = Math.sin(t * 4.5 + off) * 0.5 + 0.5;
    p.alaIzq.rotation.z = aleteo * 0.6 + 0.1;
    p.alaDer.rotation.z = -(aleteo * 0.6 + 0.1);
  });
}

// ============================================================
//  HELPERS — Constructores de cada criatura
// ============================================================

/**
 * crearMariposa(x, y, z)
 * Crea una mariposa con alas en forma de elipse doble y cuerpo segmentado.
 * Retorna un objeto con { grupo, alaIzq, alaDer } para animarlas.
 */
function crearMariposa(x, y, z) {
  var grupo = new THREE.Group();

  // Seleccionar colores aleatorios de la paleta
  var paleta = COLORES_MARIPOSA[Math.floor(Math.random() * COLORES_MARIPOSA.length)];

  var matAla = new THREE.MeshLambertMaterial({
    color: paleta.ala,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88
  });

  // === ALA SUPERIOR IZQUIERDA (más grande) ===
  // Usamos EllipseCurve + ShapeGeometry para alas con forma real
  var formaAlaSup = new THREE.Shape();
  formaAlaSup.moveTo(0, 0);
  formaAlaSup.bezierCurveTo(-0.6, 0.1, -0.75, 0.55, -0.4, 0.7);
  formaAlaSup.bezierCurveTo(-0.15, 0.82, 0, 0.5, 0, 0);

  // === ALA INFERIOR IZQUIERDA (más pequeña y redondeada) ===
  var formaAlaInf = new THREE.Shape();
  formaAlaInf.moveTo(0, 0);
  formaAlaInf.bezierCurveTo(-0.45, -0.05, -0.55, -0.4, -0.3, -0.55);
  formaAlaInf.bezierCurveTo(-0.1, -0.65, 0, -0.35, 0, 0);

  var geoAlaSup = new THREE.ShapeGeometry(formaAlaSup);
  var geoAlaInf = new THREE.ShapeGeometry(formaAlaInf);

  // Ala superior izquierda
  var alaSupIzq = new THREE.Mesh(geoAlaSup, matAla);
  alaSupIzq.position.set(-0.02, 0.05, 0);

  // Ala inferior izquierda
  var alaInfIzq = new THREE.Mesh(geoAlaInf, matAla);
  alaInfIzq.position.set(-0.02, -0.02, 0);

  // Agrupar lado izquierdo en un subgrupo (para animación conjunta)
  var grupoIzq = new THREE.Group();
  grupoIzq.add(alaSupIzq);
  grupoIzq.add(alaInfIzq);
  grupo.add(grupoIzq);

  // Lado derecho: espejo del izquierdo
  var grupoDerechoContenedor = new THREE.Group();
  grupoDerechoContenedor.scale.x = -1; // Espejo en X
  var alaSupDer = new THREE.Mesh(geoAlaSup, matAla);
  alaSupDer.position.set(-0.02, 0.05, 0);
  var alaInfDer = new THREE.Mesh(geoAlaInf, matAla);
  alaInfDer.position.set(-0.02, -0.02, 0);
  grupoDerechoContenedor.add(alaSupDer);
  grupoDerechoContenedor.add(alaInfDer);
  grupo.add(grupoDerechoContenedor);

  // === CUERPO (tórax + abdomen segmentado) ===
  var matCuerpo = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });

  // Tórax (esfera pequeña en el centro)
  var toraxGeo = new THREE.SphereGeometry(0.06, 7, 7);
  var torax = new THREE.Mesh(toraxGeo, matCuerpo);
  torax.position.y = 0.05;
  grupo.add(torax);

  // Abdomen (cilindro fino hacia abajo)
  var abdomenGeo = new THREE.CylinderGeometry(0.03, 0.045, 0.38, 6);
  var abdomen = new THREE.Mesh(abdomenGeo, matCuerpo);
  abdomen.position.y = -0.12;
  grupo.add(abdomen);

  // Cabeza con ojos
  var cabezaGeo = new THREE.SphereGeometry(0.05, 7, 7);
  var cabeza = new THREE.Mesh(cabezaGeo, matCuerpo);
  cabeza.position.y = 0.13;
  grupo.add(cabeza);

  // Antenas (líneas finas)
  var matAntena = new THREE.LineBasicMaterial({ color: 0x333333 });
  [-1, 1].forEach(function (lado) {
    var puntosAntena = [
      new THREE.Vector3(lado * 0.02, 0.14, 0),
      new THREE.Vector3(lado * 0.08, 0.28, 0.02)
    ];
    var geoAntena = new THREE.BufferGeometry().setFromPoints(puntosAntena);
    var antena = new THREE.Line(geoAntena, matAntena);
    grupo.add(antena);

    // Bolita al final de la antena
    var bolGeo = new THREE.SphereGeometry(0.015, 5, 5);
    var bol = new THREE.Mesh(bolGeo, new THREE.MeshLambertMaterial({ color: paleta.patron }));
    bol.position.set(lado * 0.08, 0.29, 0.02);
    grupo.add(bol);
  });

  grupo.position.set(x, y, z);
  scene.add(grupo);

  // Retornamos referencias a los subgrupos de alas para animarlos
  return {
    grupo: grupo,
    alaIzq: grupoIzq,
    alaDer: grupoDerechoContenedor
  };
}

/**
 * crearAbeja(x, y, z)
 * Crea una abeja con cuerpo rayado, alas transparentes y aguijón.
 * Retorna { grupo, cuerpo, ala1, ala2 } para animación.
 */
function crearAbeja(x, y, z) {
  var grupo = new THREE.Group();

  // === CUERPO (abdomen ovalado amarillo) ===
  var cuerpoGeo = new THREE.SphereGeometry(0.12, 10, 10);
  var cuerpoMat = new THREE.MeshLambertMaterial({ color: 0xFFCC00 });
  var cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat);
  cuerpo.scale.set(0.9, 0.85, 1.6); // Alargado horizontalmente
  grupo.add(cuerpo);

  // === FRANJAS NEGRAS (toroides aplanados) ===
  var franjaMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  [-0.05, 0.06].forEach(function (zOffset) {
    var franjaGeo = new THREE.TorusGeometry(0.10, 0.035, 6, 14);
    var franja = new THREE.Mesh(franjaGeo, franjaMat);
    franja.rotation.x = Math.PI / 2;
    franja.position.z = zOffset;
    franja.scale.set(0.9, 0.9, 1);
    grupo.add(franja);
  });

  // === TÓRAX (esfera más oscura al frente) ===
  var toraxGeo = new THREE.SphereGeometry(0.085, 8, 8);
  var toraxMat = new THREE.MeshLambertMaterial({ color: 0x553300 });
  var torax = new THREE.Mesh(toraxGeo, toraxMat);
  torax.position.z = 0.2;
  torax.scale.set(1, 0.9, 1.1);
  grupo.add(torax);

  // === CABEZA ===
  var cabezaGeo = new THREE.SphereGeometry(0.07, 8, 8);
  var cabezaMat = new THREE.MeshLambertMaterial({ color: 0x222200 });
  var cabeza = new THREE.Mesh(cabezaGeo, cabezaMat);
  cabeza.position.z = 0.3;
  grupo.add(cabeza);

  // Ojos compuestos (pequeñas esferas)
  var ojoMat = new THREE.MeshLambertMaterial({ color: 0x880000 });
  [-0.04, 0.04].forEach(function (xOjo) {
    var ojoGeo = new THREE.SphereGeometry(0.02, 5, 5);
    var ojo = new THREE.Mesh(ojoGeo, ojoMat);
    ojo.position.set(xOjo, 0.03, 0.36);
    grupo.add(ojo);
  });

  // === AGUIJÓN ===
  var aguijonGeo = new THREE.ConeGeometry(0.015, 0.08, 5);
  var aguijonMat = new THREE.MeshLambertMaterial({ color: 0x333300 });
  var aguijon = new THREE.Mesh(aguijonGeo, aguijonMat);
  aguijon.position.z = -0.22;
  aguijon.rotation.x = -Math.PI / 2;
  grupo.add(aguijon);

  // === ALAS TRANSPARENTES ===
  var alaMat = new THREE.MeshLambertMaterial({
    color: 0xDDEEFF,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });

  // Forma de ala con curva Bézier
  var formaAla = new THREE.Shape();
  formaAla.moveTo(0, 0);
  formaAla.bezierCurveTo(0.05, 0.18, 0.28, 0.22, 0.32, 0.08);
  formaAla.bezierCurveTo(0.28, -0.02, 0.08, -0.02, 0, 0);

  var geoAla = new THREE.ShapeGeometry(formaAla);

  var ala1 = new THREE.Mesh(geoAla, alaMat);
  ala1.position.set(0.12, 0.1, 0.15);
  ala1.rotation.x = -0.3;
  grupo.add(ala1);

  // Espejo para ala derecha
  var ala2 = new THREE.Mesh(geoAla, alaMat);
  ala2.position.set(-0.12, 0.1, 0.15);
  ala2.rotation.x = -0.3;
  ala2.scale.x = -1;
  grupo.add(ala2);

  // Ala trasera (más pequeña)
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
 * Crea una bandada de pájaros en formación "V" que sobrevuela la escena.
 */
function crearBandada(cantidad, cx, cy, cz) {
  for (var i = 0; i < cantidad; i++) {
    // Posición en formación V: cada pájaro desplazado lateralmente y en profundidad
    var lado = (i % 2 === 0 ? 1 : -1);
    var fila = Math.floor(i / 2) + 1;
    var xFormacion = lado * fila * 1.2;
    var zFormacion = fila * 0.9;

    var p = crearPajaro(cx + xFormacion, cy, cz + zFormacion);
    p.offsetFase = i * 0.18;       // Fase de aleteo ligeramente distinta por pájaro
    p.offsetFormacion = xFormacion; // Para mantener la formación en el movimiento
    pajaros.push(p);
  }
}

/**
 * crearPajaro(x, y, z)
 * Crea un pájaro estilizado (silhouette minimalista).
 * Retorna { grupo, alaIzq, alaDer }.
 */
function crearPajaro(x, y, z) {
  var grupo = new THREE.Group();

  var matCuerpo = new THREE.MeshLambertMaterial({ color: 0x2C3E50 });
  var matAla = new THREE.MeshLambertMaterial({
    color: 0x34495E,
    side: THREE.DoubleSide
  });

  // Cuerpo fusiforme (streamlined)
  var cuerpoGeo = new THREE.SphereGeometry(0.12, 8, 6);
  var cuerpo = new THREE.Mesh(cuerpoGeo, matCuerpo);
  cuerpo.scale.set(0.7, 0.6, 1.8);
  grupo.add(cuerpo);

  // Cola en abanico
  var colaGeo = new THREE.ConeGeometry(0.09, 0.2, 4);
  var cola = new THREE.Mesh(colaGeo, matCuerpo);
  cola.position.z = -0.26;
  cola.rotation.x = Math.PI / 2;
  cola.scale.set(1, 0.3, 1);
  grupo.add(cola);

  // Cabeza
  var cabezaGeo = new THREE.SphereGeometry(0.07, 7, 7);
  var cabeza = new THREE.Mesh(cabezaGeo, matCuerpo);
  cabeza.position.z = 0.22;
  cabeza.position.y = 0.03;
  grupo.add(cabeza);

  // Pico
  var picoGeo = new THREE.ConeGeometry(0.012, 0.07, 5);
  var picoMat = new THREE.MeshLambertMaterial({ color: 0xF39C12 });
  var pico = new THREE.Mesh(picoGeo, picoMat);
  pico.position.set(0, 0.025, 0.32);
  pico.rotation.x = Math.PI / 2;
  grupo.add(pico);

  // Alas con forma curva
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