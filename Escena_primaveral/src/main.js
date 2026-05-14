// ============================================================
//  INTEGRANTE 1 — Escena base mejorada: terreno, cielo e iluminación
// ============================================================

var scene, camera, renderer, clock;
var nubes = [];

function initEscena() {
  clock = new THREE.Clock();

  // --- Escena ---
  scene = new THREE.Scene();
  // Cielo degradado — usamos un canvas como textura
var canvas = document.createElement('canvas');
canvas.width = 2;
canvas.height = 512;
var ctx = canvas.getContext('2d');
var grad = ctx.createLinearGradient(0, 0, 0, 512);
grad.addColorStop(0.0,  '#6B4FA0');  // morado oscuro arriba
grad.addColorStop(0.3,  '#C4709A');  // rosa-morado
grad.addColorStop(0.6,  '#F4A05A');  // naranja pastel
grad.addColorStop(0.85, '#F9C49A');  // melocotón suave
grad.addColorStop(1.0,  '#FDE8C8');  // crema en el horizonte
ctx.fillStyle = grad;
ctx.fillRect(0, 0, 2, 512);
var skyTex = new THREE.CanvasTexture(canvas);
scene.background = skyTex;
scene.fog = new THREE.FogExp2(0xF4C5A0, 0.005); // niebla melocotón suave

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
 // Sol visible — más pequeño y suave
var solGeo = new THREE.SphereGeometry(1.4, 16, 16);
var solMat = new THREE.MeshBasicMaterial({ color: 0xFFE0A0 });
var solMesh = new THREE.Mesh(solGeo, solMat);
solMesh.position.set(30, 5, -45);
scene.add(solMesh);

// Halo del sol
var haloGeo = new THREE.SphereGeometry(2.8, 16, 16);
var haloMat = new THREE.MeshBasicMaterial({
  color: 0xFFBB77,
  transparent: true,
  opacity: 0.18
});
var halo = new THREE.Mesh(haloGeo, haloMat);
halo.position.copy(solMesh.position);
scene.add(halo);

// Luz direccional cálida pero suave
var sol = new THREE.DirectionalLight(0xFFBB88, 1.0);
sol.position.set(30, 5, -45);
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

// Luz de relleno morada (lado opuesto al sol)
var luzRelleno = new THREE.DirectionalLight(0x9966BB, 0.4);
luzRelleno.position.set(-15, 10, -10);
scene.add(luzRelleno);

// Ambiente rosado muy suave
var ambientLight = new THREE.AmbientLight(0xFFAABB, 0.35);
scene.add(ambientLight);

// Hemisférica: rosa-morado arriba / tierra oscura abajo
var hemiLight = new THREE.HemisphereLight(0xCC88AA, 0x221108, 0.7);
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

var terrenoMat = new THREE.MeshLambertMaterial({
  color: 0x566A2A,       // exactamente ese hex
  emissive: 0x2A1020,
  emissiveIntensity: 0.15
});
  var terreno = new THREE.Mesh(terrenoGeo, terrenoMat);
  terreno.rotation.x = -Math.PI / 2;
  terreno.receiveShadow = true;
  scene.add(terreno);

// --- Árboles de cerezo ---
crearArbolCerezo(-15, 0, -18, 1.3);  // fondo izquierdo
crearArbolCerezo( -5, 0, -20, 1.1);  // fondo centro-izq
crearArbolCerezo(  5, 0, -18, 1.4);  // fondo centro-der
crearArbolCerezo( 15, 0, -15, 1.0);  // fondo derecho
crearArbolCerezo( 18, 0,  -5, 1.2);  // lado derecho trasero
crearArbolCerezo( 17, 0,   6, 1.1);  // lado derecho centro
crearArbolCerezo( 12, 0,  15, 0.9);  // frente derecho
crearArbolCerezo(  2, 0,  17, 1.0);  // frente centro
crearArbolCerezo( -9, 0,  15, 1.2);  // frente izquierdo
crearArbolCerezo(-17, 0,   8, 1.1);  // lado izquierdo centro
crearArbolCerezo(-18, 0,  -5, 1.0);  // lado izquierdo trasero
crearArbolCerezo( -3, 0,  -9, 0.9);  // interior izquierdo
crearArbolCerezo(  8, 0,  -6, 1.0);  // interior derecho
crearArbolCerezo(-11, 0,   3, 1.1);  // interior centro-izq
crearArbolCerezo(  6, 0,   8, 0.8);  // interior centro-der

 // --- Flores ---
var tiposFlor = ['girasol', 'tulipan', 'rosa', 'margarita'];

for (var f = 0; f < 200; f++) {
  var fx = (Math.random() - 0.5) * 36;  // ±18 — bien dentro del terreno
  var fz = (Math.random() - 0.5) * 36;

  // Descartar flores muy lejos del centro
  var distCentro = Math.sqrt(fx * fx + fz * fz);
  if (distCentro > 17) continue;  // ✅ limita a un círculo de radio 17

  var dx = fx - 0;
  var dz = fz - 6;
  if (Math.sqrt(dx * dx + dz * dz) > 4.0) {
    var tipo = tiposFlor[Math.floor(Math.random() * tiposFlor.length)];
    var ySuelo = calcularYTerreno(fx, fz);
    crearFlor(fx, ySuelo, fz, tipo);
  }
}

  // --- Nubes ---
  nubes.push(crearNube(  0, 12, -22));
  nubes.push(crearNube( 16, 13, -16));
  nubes.push(crearNube( 22, 11,   0));
  nubes.push(crearNube(-16, 14,  16));

  initControles();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ============================================================
//  ÁRBOL DE CEREZO — Con pétalos cayendo y raíces visibles
// ============================================================

var petalosCache = []; // pétalos animados globales

function crearArbolCerezo(x, y, z, escala) {
  escala = escala || 1.0;
  var grupo = new THREE.Group();

  var matTronco  = new THREE.MeshLambertMaterial({ color: 0x6B3A2A });
  var matTroncoO = new THREE.MeshLambertMaterial({ color: 0x4A2318 });
  var matRaiz    = new THREE.MeshLambertMaterial({ color: 0x5A3020 });

  // === RAÍCES (4 raíces que salen de la base) ===
  var angRaices = [0, Math.PI/2, Math.PI, Math.PI * 1.5];
  angRaices.forEach(function(ang) {
    // Raíz principal
    var raizGeo = new THREE.CylinderGeometry(
      0.04 * escala, 0.12 * escala, 0.9 * escala, 6
    );
    var raiz = new THREE.Mesh(raizGeo, matRaiz);
    raiz.position.set(
      Math.sin(ang) * 0.5 * escala,
      0.1 * escala,
      Math.cos(ang) * 0.5 * escala
    );
    raiz.rotation.z =  Math.sin(ang) * 0.55;
    raiz.rotation.x = -Math.cos(ang) * 0.55;
    grupo.add(raiz);

    // Ramita de raíz secundaria
    var raiz2Geo = new THREE.CylinderGeometry(
      0.02 * escala, 0.05 * escala, 0.55 * escala, 5
    );
    var raiz2 = new THREE.Mesh(raiz2Geo, matRaiz);
    raiz2.position.set(
      Math.sin(ang + 0.4) * 0.75 * escala,
      0.0,
      Math.cos(ang + 0.4) * 0.75 * escala
    );
    raiz2.rotation.z =  Math.sin(ang + 0.4) * 0.7;
    raiz2.rotation.x = -Math.cos(ang + 0.4) * 0.7;
    grupo.add(raiz2);
  });

  // === TRONCO principal cónico ===
  var troncoGeo = new THREE.CylinderGeometry(
    0.22 * escala, 0.45 * escala, 3.2 * escala, 10
  );
  var tronco = new THREE.Mesh(troncoGeo, matTronco);
  tronco.position.y = 1.6 * escala;
  tronco.castShadow = true;
  grupo.add(tronco);

  // Detalle interior oscuro del tronco
  var troncoIGeo = new THREE.CylinderGeometry(
    0.08 * escala, 0.18 * escala, 3.1 * escala, 7
  );
  var troncoI = new THREE.Mesh(troncoIGeo, matTroncoO);
  troncoI.position.y = 1.6 * escala;
  grupo.add(troncoI);

  // === RAMAS principales (4 ramas que se abren) ===
  var matRama = new THREE.MeshLambertMaterial({ color: 0x7A4030 });
  var ramasData = [
    { ang: 0,           incl: 0.55, largo: 1.6 },
    { ang: Math.PI/2,   incl: 0.50, largo: 1.5 },
    { ang: Math.PI,     incl: 0.58, largo: 1.7 },
    { ang: Math.PI*1.5, incl: 0.48, largo: 1.4 },
    { ang: Math.PI/4,   incl: 0.65, largo: 1.3 },
    { ang: Math.PI*1.25,incl: 0.60, largo: 1.5 },
  ];

  ramasData.forEach(function(r) {
    var ramaGeo = new THREE.CylinderGeometry(
      0.03 * escala, 0.09 * escala, r.largo * escala, 6
    );
    var rama = new THREE.Mesh(ramaGeo, matRama);

    var altBase = 2.8 * escala;
    rama.position.set(
      Math.sin(r.ang) * (r.largo / 2) * Math.sin(r.incl) * escala,
      altBase + (r.largo / 2) * Math.cos(r.incl) * escala,
      Math.cos(r.ang) * (r.largo / 2) * Math.sin(r.incl) * escala
    );
    rama.rotation.z =  Math.sin(r.ang) * r.incl;
    rama.rotation.x = -Math.cos(r.ang) * r.incl;
    rama.castShadow = true;
    grupo.add(rama);
  });

  // === COPA — esferas de flores rosas en capas ===
  var matFlorClaro  = new THREE.MeshLambertMaterial({ color: 0xFFB7C5 }); // Rosa claro
  var matFlorMedio  = new THREE.MeshLambertMaterial({ color: 0xFF85A1 }); // Rosa medio
  var matFlorOscuro = new THREE.MeshLambertMaterial({ color: 0xFF5C8A }); // Rosa oscuro
  var matFlorBlanco = new THREE.MeshLambertMaterial({ color: 0xFFE8EE }); // Casi blanco

  var copaData = [
    // [x, y, z, radio, material]
    [ 0.0,  5.0,  0.0,  1.7,  matFlorClaro  ],
    [-1.4,  4.4, -0.2,  1.3,  matFlorMedio  ],
    [ 1.4,  4.4, -0.2,  1.3,  matFlorMedio  ],
    [ 0.0,  4.2,  1.4,  1.2,  matFlorClaro  ],
    [ 0.0,  4.2, -1.4,  1.1,  matFlorOscuro ],
    [-1.0,  5.5,  0.5,  1.1,  matFlorBlanco ],
    [ 1.0,  5.5,  0.5,  1.1,  matFlorBlanco ],
    [ 0.0,  6.0,  0.0,  1.0,  matFlorClaro  ],
    [-1.8,  4.8,  0.8,  0.9,  matFlorOscuro ],
    [ 1.8,  4.8,  0.8,  0.9,  matFlorOscuro ],
    [ 0.5,  4.0,  0.5,  1.0,  matFlorMedio  ],
    [-0.5,  4.0,  0.5,  1.0,  matFlorMedio  ],
    [ 0.0,  3.6,  0.0,  0.9,  matFlorOscuro ],
  ];

  copaData.forEach(function(b) {
    var bola = new THREE.Mesh(
      new THREE.SphereGeometry(b[3] * escala, 10, 10),
      b[4]
    );
    bola.position.set(b[0] * escala, b[1] * escala, b[2] * escala);
    bola.castShadow = true;
    grupo.add(bola);
  });

  // === PÉTALOS cayendo (10 por árbol, animados) ===
  var matPetalo = new THREE.MeshLambertMaterial({
    color: 0xFFB7C5,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });

  var yBase = Math.sin(x * 0.25) * 0.5 + Math.cos(z * 0.25) * 0.5
            + Math.sin(x * 0.6 + z * 0.4) * 0.2;

  for (var p = 0; p < 10; p++) {
    var petalGeo = new THREE.SphereGeometry(0.07, 5, 4);
    petalGeo.scale(1.8, 0.3, 1.0);
    var petal = new THREE.Mesh(petalGeo, matPetalo);

    // Posición inicial aleatoria cerca de la copa
    petal.position.set(
      x + (Math.random() - 0.5) * 3.5 * escala,
      yBase + 3.0 + Math.random() * 3.0,
      z + (Math.random() - 0.5) * 3.5 * escala
    );

    scene.add(petal);

    // Guardar parámetros de animación
    petalosCache.push({
      mesh:      petal,
      velY:      -(0.008 + Math.random() * 0.012),  // caída lenta
      velX:      (Math.random() - 0.5) * 0.015,     // deriva horizontal
      velZ:      (Math.random() - 0.5) * 0.015,
      velRotX:   (Math.random() - 0.5) * 0.04,      // rotación suave
      velRotZ:   (Math.random() - 0.5) * 0.04,
      yMin:      yBase,                              // toca el suelo aquí
      yStart:    yBase + 3.0 + Math.random() * 3.0, // altura de reaparición
      xCenter:   x,
      zCenter:   z,
      escala:    escala
    });
  }

  // Posición en el terreno
  grupo.position.set(x, yBase, z);
  grupo.rotation.y = Math.random() * Math.PI * 2;
  scene.add(grupo);
  return grupo;
}

// ============================================================
//  ANIMACIÓN DE PÉTALOS — llamar en el loop de animación
// ============================================================
function actualizarPetalos() {
  petalosCache.forEach(function(p) {
    p.mesh.position.y += p.velY;
    p.mesh.position.x += p.velX + Math.sin(Date.now() * 0.001 + p.velRotX) * 0.008;
    p.mesh.position.z += p.velZ;
    p.mesh.rotation.x += p.velRotX;
    p.mesh.rotation.z += p.velRotZ;

    // Al tocar el suelo, reaparece en la copa
    if (p.mesh.position.y < p.yMin) {
      p.mesh.position.set(
        p.xCenter + (Math.random() - 0.5) * 3.5 * p.escala,
        p.yStart,
        p.zCenter + (Math.random() - 0.5) * 3.5 * p.escala
      );
    }
  });
}

 
 
// ============================================================
//  FLOR MEJORADA — Con pétalos reales y centro
// ============================================================l
 
function crearFlor(x, y, z, tipo) {
  var grupo = new THREE.Group();
  tipo = tipo || 'margarita';

  var alturaFlor = 0.25 + Math.random() * 0.18;

  // --- Tallo ---
  var talloGeo = new THREE.CylinderGeometry(0.03, 0.035, alturaFlor * 2, 6);
  var talloMat = new THREE.MeshLambertMaterial({ color: 0x2E8B32 });
  var tallo = new THREE.Mesh(talloGeo, talloMat);
  tallo.position.y = alturaFlor;
  grupo.add(tallo);

  // --- Hojita lateral ---
  var hojaGeo = new THREE.SphereGeometry(0.14, 5, 4);
  hojaGeo.scale(2.0, 0.4, 0.9);
  var hoja = new THREE.Mesh(hojaGeo,
    new THREE.MeshLambertMaterial({ color: 0x3A8C3F }));
  hoja.position.set(0.18, alturaFlor * 0.55, 0);
  hoja.rotation.z = 0.45;
  grupo.add(hoja);

  var yFlor = alturaFlor * 2;

  if (tipo === 'girasol') {
    // ── Pétalos amarillo-naranja en dos capas ──
    var coloresPetaloG = [0xFFCC00, 0xFFAA00];
    for (var capa = 0; capa < 2; capa++) {
      var numP = 12;
      for (var i = 0; i < numP; i++) {
        var ang = (i / numP) * Math.PI * 2 + capa * (Math.PI / numP);
        var radio = 0.16 + capa * 0.06;
        var petalGeo = new THREE.SphereGeometry(0.11, 6, 5);
        petalGeo.scale(0.7, 0.3, 2.2);
        var petal = new THREE.Mesh(petalGeo,
          new THREE.MeshLambertMaterial({ color: coloresPetaloG[capa], side: THREE.DoubleSide }));
        petal.position.set(Math.cos(ang) * radio, yFlor, Math.sin(ang) * radio);
        petal.rotation.y = ang;
        grupo.add(petal);
      }
    }
    // Centro café oscuro y texturizado
    var centroGeo = new THREE.SphereGeometry(0.16, 10, 10);
    var centro = new THREE.Mesh(centroGeo,
      new THREE.MeshLambertMaterial({ color: 0x3B1F08 }));
    centro.position.y = yFlor + 0.04;
    centro.scale.set(1, 0.55, 1);
    grupo.add(centro);
    // Puntitos del centro (semillas)
    for (var s = 0; s < 7; s++) {
      var sAng = (s / 7) * Math.PI * 2;
      var sGeo = new THREE.SphereGeometry(0.025, 5, 5);
      var sPunto = new THREE.Mesh(sGeo,
        new THREE.MeshLambertMaterial({ color: 0x1A0A00 }));
      sPunto.position.set(Math.cos(sAng) * 0.07, yFlor + 0.09, Math.sin(sAng) * 0.07);
      grupo.add(sPunto);
    }

  } else if (tipo === 'tulipan') {
    // ── Copa cerrada de tulipán rojo ──
    var copaGeo = new THREE.SphereGeometry(0.22, 10, 10);
    var copa = new THREE.Mesh(copaGeo,
      new THREE.MeshLambertMaterial({ color: 0xDD1111 }));
    copa.position.y = yFlor + 0.1;
    copa.scale.set(0.75, 1.1, 0.75);
    grupo.add(copa);
    // Pétalos exteriores que abren un poco
    var numPT = 6;
    for (var pt = 0; pt < numPT; pt++) {
      var angT = (pt / numPT) * Math.PI * 2;
      var petalTGeo = new THREE.SphereGeometry(0.14, 6, 6);
      petalTGeo.scale(0.6, 1.8, 0.55);
      var petalT = new THREE.Mesh(petalTGeo,
        new THREE.MeshLambertMaterial({ color: 0xFF2222, side: THREE.DoubleSide }));
      petalT.position.set(
        Math.cos(angT) * 0.13,
        yFlor + 0.05,
        Math.sin(angT) * 0.13
      );
      petalT.rotation.y  = angT;
      petalT.rotation.x  = 0.35;
      grupo.add(petalT);
    }
    // Estambre amarillo interior
    var estGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.18, 5);
    var est = new THREE.Mesh(estGeo,
      new THREE.MeshLambertMaterial({ color: 0xFFEE44 }));
    est.position.y = yFlor + 0.32;
    grupo.add(est);

  } else if (tipo === 'rosa') {
    // ── Rosa rosa en espiral de pétalos ──
    var coloresRosa = [0xFF85B3, 0xFF5599, 0xFFAACC];
    var capasRosa   = [
      { num: 5, radio: 0.06, escY: 1.0, yOff: 0.00 },
      { num: 7, radio: 0.14, escY: 0.8, yOff: -0.04 },
      { num: 9, radio: 0.22, escY: 0.55, yOff: -0.08 },
    ];
    capasRosa.forEach(function (capa, ci) {
      for (var pr = 0; pr < capa.num; pr++) {
        var angR = (pr / capa.num) * Math.PI * 2 + ci * 0.4;
        var pGeo = new THREE.SphereGeometry(0.1, 6, 6);
        pGeo.scale(0.65, capa.escY, 1.5);
        var pMesh = new THREE.Mesh(pGeo,
          new THREE.MeshLambertMaterial({ color: coloresRosa[ci], side: THREE.DoubleSide }));
        pMesh.position.set(
          Math.cos(angR) * capa.radio,
          yFlor + capa.yOff,
          Math.sin(angR) * capa.radio
        );
        pMesh.rotation.y = angR;
        pMesh.rotation.x = 0.2 * ci;
        grupo.add(pMesh);
      }
    });
    // Centro rosado oscuro
    var cRosaGeo = new THREE.SphereGeometry(0.055, 8, 8);
    var cRosa = new THREE.Mesh(cRosaGeo,
      new THREE.MeshLambertMaterial({ color: 0xCC2266 }));
    cRosa.position.y = yFlor + 0.05;
    grupo.add(cRosa);

  } else {
    // ── Margarita blanca ──
    var numPetM = 10;
    for (var pm = 0; pm < numPetM; pm++) {
      var angM = (pm / numPetM) * Math.PI * 2;
      var pMGeo = new THREE.SphereGeometry(0.09, 6, 5);
      pMGeo.scale(0.55, 0.28, 2.0);
      var pMesh2 = new THREE.Mesh(pMGeo,
        new THREE.MeshLambertMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide }));
      pMesh2.position.set(
        Math.cos(angM) * 0.17,
        yFlor,
        Math.sin(angM) * 0.17
      );
      pMesh2.rotation.y = angM;
      grupo.add(pMesh2);
    }
    // Centro amarillo
    var cMarGeo = new THREE.SphereGeometry(0.085, 8, 8);
    var cMar = new THREE.Mesh(cMarGeo,
      new THREE.MeshLambertMaterial({ color: 0xFFDD00 }));
    cMar.position.y = yFlor + 0.02;
    cMar.scale.set(1, 0.6, 1);
    grupo.add(cMar);
  }

  // --- Posición siguiendo el terreno ---
  grupo.position.set(x, y, z);
  grupo.rotation.y = Math.random() * Math.PI * 2;
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
    // Cada nube gira a velocidad distinta
    var velocidad = 0.08 + i * 0.02;
    
    // Calcular el ángulo actual en base a su posición
    var angulo = Math.atan2(nube.position.x, nube.position.z);
    angulo += delta * velocidad; // Avanzar el ángulo
    
    // Radio fijo por nube (distancia al centro)
    var radio = Math.sqrt(nube.position.x * nube.position.x + nube.position.z * nube.position.z);
    
    // Actualizar posición en círculo
    nube.position.x = Math.sin(angulo) * radio;
    nube.position.z = Math.cos(angulo) * radio;
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
