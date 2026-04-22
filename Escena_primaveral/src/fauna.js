// ============================================================
//  INTEGRANTE 2 — Fauna y personajes animados
//  Agrega aquí mariposas, abejas, pájaros, conejos, personas
// ============================================================

var mariposas = [];
var abejas = [];

function initFauna() {
  // Crear varias mariposas
  for (var i = 0; i < 5; i++) {
    var m = crearMariposa(
      (Math.random() - 0.5) * 12,
      2 + Math.random() * 3,
      (Math.random() - 0.5) * 12
    );
    mariposas.push(m);
  }

  // Crear abejas
  for (var j = 0; j < 4; j++) {
    var a = crearAbeja(
      (Math.random() - 0.5) * 10,
      1.5 + Math.random() * 2,
      (Math.random() - 0.5) * 10
    );
    abejas.push(a);
  }

  // Crear un conejo
  crearConejo(-3, 0, 3);
}

function actualizarFauna() {
  var t = clock.getElapsedTime();

  // Animar mariposas (vuelo en círculo + aleteo)
  mariposas.forEach(function (m, i) {
    var velocidad = 0.4 + i * 0.1;
    var radio = 3 + i * 0.8;
    var offset = i * 1.2;

    m.grupo.position.x = Math.sin(t * velocidad + offset) * radio;
    m.grupo.position.z = Math.cos(t * velocidad + offset) * radio;
    m.grupo.position.y = 2.5 + Math.sin(t * 2 + offset) * 0.5;

    // Girar hacia la dirección de vuelo
    m.grupo.rotation.y = t * velocidad + offset + Math.PI / 2;

    // Aleteo (escalar alas en X)
    var aleteo = Math.abs(Math.sin(t * 8 + offset));
    m.alaIzq.scale.x = aleteo;
    m.alaDer.scale.x = aleteo;
  });

  // Animar abejas (movimiento errático)
  abejas.forEach(function (a, i) {
    var offset = i * 2.1;
    a.grupo.position.x = Math.sin(t * 0.7 + offset) * 4 + Math.sin(t * 1.3 + offset) * 1.5;
    a.grupo.position.z = Math.cos(t * 0.5 + offset) * 4 + Math.cos(t * 1.1 + offset) * 1.5;
    a.grupo.position.y = 1.5 + Math.sin(t * 3 + offset) * 0.3;
    a.grupo.rotation.y = Math.atan2(
      Math.cos(t * 0.7 + offset),
      Math.sin(t * 0.5 + offset)
    );
  });
}

// ---------- Helpers de Integrante 2 ----------

function crearMariposa(x, y, z) {
  var grupo = new THREE.Group();

  var colores = [0xFF69B4, 0xFFD700, 0xFF6347, 0x9370DB, 0x00CED1];
  var color = colores[Math.floor(Math.random() * colores.length)];
  var mat = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });

  // Ala izquierda
  var alaGeo = new THREE.PlaneGeometry(0.7, 0.5);
  var alaIzq = new THREE.Mesh(alaGeo, mat);
  alaIzq.position.x = -0.35;
  alaIzq.rotation.y = 0.3;
  grupo.add(alaIzq);

  // Ala derecha
  var alaDer = new THREE.Mesh(alaGeo, mat);
  alaDer.position.x = 0.35;
  alaDer.rotation.y = -0.3;
  grupo.add(alaDer);

  // Cuerpo
  var cuerpoGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
  var cuerpoMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  var cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat);
  cuerpo.rotation.z = Math.PI / 2;
  grupo.add(cuerpo);

  grupo.position.set(x, y, z);
  scene.add(grupo);

  return { grupo: grupo, alaIzq: alaIzq, alaDer: alaDer };
}

function crearAbeja(x, y, z) {
  var grupo = new THREE.Group();

  // Cuerpo amarillo con franjas
  var cuerpoGeo = new THREE.SphereGeometry(0.15, 8, 8);
  var cuerpoMat = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  var cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat);
  cuerpo.scale.z = 1.5;
  grupo.add(cuerpo);

  // Franja negra
  var franjaGeo = new THREE.TorusGeometry(0.15, 0.04, 6, 10);
  var franjaMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  var franja = new THREE.Mesh(franjaGeo, franjaMat);
  franja.rotation.x = Math.PI / 2;
  grupo.add(franja);

  // Alas transparentes
  var alaGeo = new THREE.PlaneGeometry(0.3, 0.18);
  var alaMat = new THREE.MeshLambertMaterial({
    color: 0xCCEEFF,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  var ala1 = new THREE.Mesh(alaGeo, alaMat);
  ala1.position.set(0.2, 0.15, 0);
  ala1.rotation.z = 0.3;
  grupo.add(ala1);

  var ala2 = new THREE.Mesh(alaGeo, alaMat);
  ala2.position.set(-0.2, 0.15, 0);
  ala2.rotation.z = -0.3;
  grupo.add(ala2);

  grupo.position.set(x, y, z);
  scene.add(grupo);

  return { grupo: grupo };
}

function crearConejo(x, y, z) {
  var grupo = new THREE.Group();
  var mat = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });

  // Cuerpo
  var cuerpoGeo = new THREE.SphereGeometry(0.35, 8, 8);
  var cuerpo = new THREE.Mesh(cuerpoGeo, mat);
  cuerpo.position.y = 0.4;
  cuerpo.scale.y = 1.2;
  cuerpo.castShadow = true;
  grupo.add(cuerpo);

  // Cabeza
  var cabezaGeo = new THREE.SphereGeometry(0.22, 8, 8);
  var cabeza = new THREE.Mesh(cabezaGeo, mat);
  cabeza.position.y = 1.0;
  cabeza.castShadow = true;
  grupo.add(cabeza);

  // Orejas
  var orejaGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
  var orejaIzq = new THREE.Mesh(orejaGeo, mat);
  orejaIzq.position.set(-0.1, 1.5, 0);
  orejaIzq.rotation.z = 0.15;
  grupo.add(orejaIzq);

  var orejaDer = new THREE.Mesh(orejaGeo, mat);
  orejaDer.position.set(0.1, 1.5, 0);
  orejaDer.rotation.z = -0.15;
  grupo.add(orejaDer);

  // Nariz
  var narizGeo = new THREE.SphereGeometry(0.04, 6, 6);
  var narizMat = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
  var nariz = new THREE.Mesh(narizGeo, narizMat);
  nariz.position.set(0, 0.98, 0.21);
  grupo.add(nariz);

  grupo.position.set(x, y, z);
  scene.add(grupo);
  return grupo;
}
