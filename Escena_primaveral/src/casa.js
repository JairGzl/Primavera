// ============================================================
//  CASA ESTILO ANIMAL CROSSING
//  Agregar en initEscena() después de los árboles:
//  crearCasa(0, 0, -3);
// ============================================================

function crearCasa(x, z) {
  var grupo = new THREE.Group();

  // --- Calcular Y del terreno (igual que árboles y flores) ---
  var yTerreno = Math.sin(x * 0.25) * 0.5 + Math.cos(z * 0.25) * 0.5
               + Math.sin(x * 0.6 + z * 0.4) * 0.2;

  // =========================================================
  // BASE / PAREDES
  // =========================================================
  var paredMat = new THREE.MeshLambertMaterial({ color: 0xF5E6C8 }); // Crema cálido
  var paredGeo = new THREE.BoxGeometry(4.5, 3.0, 4.0);
  var pared = new THREE.Mesh(paredGeo, paredMat);
  pared.position.y = 1.5;
  pared.castShadow = true;
  pared.receiveShadow = true;
  grupo.add(pared);

  // Franja decorativa inferior (zócalo)
  var zocaloMat = new THREE.MeshLambertMaterial({ color: 0xD4B896 });
  var zocaloGeo = new THREE.BoxGeometry(4.6, 0.4, 4.1);
  var zocalo = new THREE.Mesh(zocaloGeo, zocaloMat);
  zocalo.position.y = 0.2;
  grupo.add(zocalo);

  // =========================================================
  // TECHO (dos planos inclinados estilo AC)
  // =========================================================
  var techoMat = new THREE.MeshLambertMaterial({ color: 0x4A90D9, side: THREE.DoubleSide }); // Azul AC
  var techoOscuroMat = new THREE.MeshLambertMaterial({ color: 0x3A78BE, side: THREE.DoubleSide });

  // Lado frontal del techo
  var techoFGeo = new THREE.BufferGeometry();
  var vF = new Float32Array([
    -2.6, 3.0,  2.2,   // izq base
     2.6, 3.0,  2.2,   // der base
     0.0, 5.5,  0.0,   // punta
  ]);
  techoFGeo.setAttribute('position', new THREE.BufferAttribute(vF, 3));
  techoFGeo.computeVertexNormals();
  var techoF = new THREE.Mesh(techoFGeo, techoMat);
  techoF.castShadow = true;
  grupo.add(techoF);

  // Lado trasero del techo
  var techoTGeo = new THREE.BufferGeometry();
  var vT = new Float32Array([
     2.6, 3.0, -2.2,
    -2.6, 3.0, -2.2,
     0.0, 5.5,  0.0,
  ]);
  techoTGeo.setAttribute('position', new THREE.BufferAttribute(vT, 3));
  techoTGeo.computeVertexNormals();
  var techoT = new THREE.Mesh(techoTGeo, techoMat);
  techoT.castShadow = true;
  grupo.add(techoT);

  // Lado izquierdo del techo
  var techoIGeo = new THREE.BufferGeometry();
  var vI = new Float32Array([
    -2.6, 3.0,  2.2,
    -2.6, 3.0, -2.2,
     0.0, 5.5,  0.0,
  ]);
  techoIGeo.setAttribute('position', new THREE.BufferAttribute(vI, 3));
  techoIGeo.computeVertexNormals();
  var techoI = new THREE.Mesh(techoIGeo, techoOscuroMat);
  grupo.add(techoI);

  // Lado derecho del techo
  var techoDGeo = new THREE.BufferGeometry();
  var vD = new Float32Array([
    2.6, 3.0, -2.2,
    2.6, 3.0,  2.2,
    0.0, 5.5,  0.0,
  ]);
  techoDGeo.setAttribute('position', new THREE.BufferAttribute(vD, 3));
  techoDGeo.computeVertexNormals();
  var techoD = new THREE.Mesh(techoDGeo, techoOscuroMat);
  grupo.add(techoD);

  // Borde del techo (alero) — caja plana que sobresale
  var aleroMat = new THREE.MeshLambertMaterial({ color: 0x2E5FA3 });
  var aleroGeo = new THREE.BoxGeometry(5.2, 0.15, 4.8);
  var alero = new THREE.Mesh(aleroGeo, aleroMat);
  alero.position.y = 3.0;
  grupo.add(alero);

  // =========================================================
  // PUERTA
  // =========================================================
  var puertaMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Café madera
  var puertaGeo = new THREE.BoxGeometry(0.9, 1.6, 0.15);
  var puerta = new THREE.Mesh(puertaGeo, puertaMat);
  puerta.position.set(0, 0.8, 2.08);
  grupo.add(puerta);

  // Marco de la puerta
  var marcoMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  var marcoGeo = new THREE.BoxGeometry(1.1, 1.75, 0.1);
  var marco = new THREE.Mesh(marcoGeo, marcoMat);
  marco.position.set(0, 0.88, 2.1);
  grupo.add(marco);

  // Pomo de la puerta
  var pomoGeo = new THREE.SphereGeometry(0.07, 6, 6);
  var pomoMat = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  var pomo = new THREE.Mesh(pomoGeo, pomoMat);
  pomo.position.set(0.35, 0.8, 2.15);
  grupo.add(pomo);

  // =========================================================
  // VENTANAS (2 — una a cada lado de la puerta)
  // =========================================================
  [-1.4, 1.4].forEach(function (vx) {
    // Marco blanco
    var vMarcoGeo = new THREE.BoxGeometry(0.95, 0.95, 0.12);
    var vMarco = new THREE.Mesh(vMarcoGeo, marcoMat);
    vMarco.position.set(vx, 1.7, 2.07);
    grupo.add(vMarco);

    // Vidrio azul clarito
    var vidrioMat = new THREE.MeshLambertMaterial({ color: 0xADD8E6 });
    var vidrioGeo = new THREE.BoxGeometry(0.75, 0.75, 0.1);
    var vidrio = new THREE.Mesh(vidrioGeo, vidrioMat);
    vidrio.position.set(vx, 1.7, 2.1);
    grupo.add(vidrio);

    // Cruz de la ventana
    var cruzMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    var cruzH = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.07, 0.12), cruzMat);
    cruzH.position.set(vx, 1.7, 2.12);
    grupo.add(cruzH);
    var cruzV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.75, 0.12), cruzMat);
    cruzV.position.set(vx, 1.7, 2.12);
    grupo.add(cruzV);
  });

  // =========================================================
  // CHIMENEA
  // =========================================================
  var chimeneMat = new THREE.MeshLambertMaterial({ color: 0xB0522A });
  var chimeneGeo = new THREE.CylinderGeometry(0.22, 0.25, 1.8, 8);
  var chimene = new THREE.Mesh(chimeneGeo, chimeneMat);
  chimene.position.set(1.2, 4.8, -0.5);
  chimene.castShadow = true;
  grupo.add(chimene);

  // Tope de la chimenea
  var topeGeo = new THREE.CylinderGeometry(0.30, 0.22, 0.2, 8);
  var tope = new THREE.Mesh(topeGeo, chimeneMat);
  tope.position.set(1.2, 5.7, -0.5);
  grupo.add(tope);

  // =========================================================
  // ESCALÓN DE ENTRADA
  // =========================================================
  var escalonMat = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
  var escalonGeo = new THREE.BoxGeometry(1.4, 0.2, 0.5);
  var escalon = new THREE.Mesh(escalonGeo, escalonMat);
  escalon.position.set(0, 0.1, 2.4);
  grupo.add(escalon);

  // =========================================================
  // MACETAS A LOS LADOS DE LA PUERTA
  // =========================================================
  [-0.9, 0.9].forEach(function (mx) {
    var macetaMat = new THREE.MeshLambertMaterial({ color: 0xCC5500 });
    var macetaGeo = new THREE.CylinderGeometry(0.18, 0.13, 0.3, 8);
    var maceta = new THREE.Mesh(macetaGeo, macetaMat);
    maceta.position.set(mx, 0.15, 2.3);
    grupo.add(maceta);

    // Plantita encima
    var plantaMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    var plantaGeo = new THREE.SphereGeometry(0.2, 6, 6);
    var planta = new THREE.Mesh(plantaGeo, plantaMat);
    planta.position.set(mx, 0.45, 2.3);
    grupo.add(planta);
  });

  // =========================================================
  // LETRERO encima de la puerta (estilo AC)
  // =========================================================
  var letMat = new THREE.MeshLambertMaterial({ color: 0xFFE066 });
  var letGeo = new THREE.BoxGeometry(1.2, 0.4, 0.12);
  var letrero = new THREE.Mesh(letGeo, letMat);
  letrero.position.set(0, 2.4, 2.1);
  grupo.add(letrero);

  // =========================================================
  // POSICIÓN FINAL
  // =========================================================
  grupo.position.set(x, yTerreno, z);
  scene.add(grupo);
  return grupo;
}
