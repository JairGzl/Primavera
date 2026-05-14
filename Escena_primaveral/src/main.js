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
  crearArbol(100,   0, -5,  1.0);
  crearArbol(-6,  0, -8,  1.3);
  crearArbol(10,  0, -12, 0.8);
  crearArbol(-12, 0, -6,  1.1);
  crearArbol(0,   0, -15, 1.4);
  crearArbol(8,   0, -20, 0.9);
  crearArbol(-8,  0, -18, 1.2);
  

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
//  ÁRBOL MEJORADO — Con hojas y forma más realista
// ============================================================
 
function crearArbol(x, y, z, escala = 1.0) {
  var grupo = new THREE.Group();
 
  // --- Tronco ancho y cónico (como en la imagen) ---
  var troncoGeo = new THREE.CylinderGeometry(0.45 * escala, 0.6 * escala, 2.5 * escala, 12);
  var troncoMat = new THREE.MeshLambertMaterial({ color: 0xA0612A }); // Café claro
  var tronco = new THREE.Mesh(troncoGeo, troncoMat);
  tronco.position.y = 1.25 * escala;
  tronco.castShadow = true;
  tronco.receiveShadow = true;
  grupo.add(tronco);
 
  // Detalle oscuro del tronco (líneas internas, simula el sombreado)
  var troncoOscuroGeo = new THREE.CylinderGeometry(0.15 * escala, 0.25 * escala, 2.4 * escala, 8);
  var troncoOscuroMat = new THREE.MeshLambertMaterial({ color: 0x7A4A1E });
  var troncoOscuro = new THREE.Mesh(troncoOscuroGeo, troncoOscuroMat);
  troncoOscuro.position.y = 1.25 * escala;
  grupo.add(troncoOscuro);
 
  // --- Copa: esferas grandes formando la silueta redondeada ---
  var verdeBase  = new THREE.MeshLambertMaterial({ color: 0x5BBD2F }); // Verde brillante
  var verdeClaro = new THREE.MeshLambertMaterial({ color: 0x76D44A }); // Verde claro (luz arriba)
  var verdeOscuro= new THREE.MeshLambertMaterial({ color: 0x3E8C1E }); // Verde oscuro (sombra)
 
  // Esfera central grande
  var centroBola = new THREE.Mesh(
    new THREE.SphereGeometry(1.9 * escala, 12, 12), verdeBase
  );
  centroBola.position.y = 4.0 * escala;
  centroBola.castShadow = true;
  grupo.add(centroBola);
 
  // Bolas que forman los "bultos" de la copa (igual que en la imagen)
  var bolasData = [
    { x: -1.6, y: 3.5, z:  0.0, r: 1.4, mat: verdeBase   },
    { x:  1.6, y: 3.5, z:  0.0, r: 1.4, mat: verdeBase   },
    { x: -1.0, y: 4.8, z:  0.3, r: 1.2, mat: verdeClaro  },
    { x:  1.0, y: 4.8, z:  0.3, r: 1.2, mat: verdeClaro  },
    { x:  0.0, y: 5.2, z:  0.0, r: 1.3, mat: verdeClaro  }, // Tope
    { x: -1.8, y: 4.5, z: -0.2, r: 0.9, mat: verdeOscuro },
    { x:  1.8, y: 4.5, z: -0.2, r: 0.9, mat: verdeOscuro },
    { x:  0.0, y: 3.2, z:  0.5, r: 1.1, mat: verdeOscuro }, // Base copa
  ];
 
  bolasData.forEach(function (b) {
    var mesh = new THREE.Mesh(
      new THREE.SphereGeometry(b.r * escala, 10, 10), b.mat
    );
    mesh.position.set(b.x * escala, b.y * escala, b.z * escala);
    mesh.castShadow = true;
    grupo.add(mesh);
  });
 
  // --- Manzanas rojas (2 a 3 por árbol) ---
  var manzanaMat      = new THREE.MeshLambertMaterial({ color: 0xFF2020 });
  var talloManzanaMat = new THREE.MeshLambertMaterial({ color: 0x5D3A1A });
  var hojaManzanaMat  = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
 
  var manzanasPos = [
    [ 1.8, 3.4,  1.0],
    [-1.7, 3.6, -0.6],
    [ 0.3, 3.0,  1.8],
    [-1.6, 3.2, -1.5],
    [ 1.9, 4.2, -0.5],
    ];
    
 
  var cuantas = 4 + Math.floor(Math.random() * 2); // 2 o 3 manzanas
  for (var i = 0; i < cuantas; i++) {
    var p = manzanasPos[i];
 
    // Cuerpo
    var manzana = new THREE.Mesh(
      new THREE.SphereGeometry(0.24 * escala, 8, 8), manzanaMat
    );
    manzana.position.set(p[0] * escala, p[1] * escala, p[2] * escala);
    manzana.castShadow = true;
    manzana.renderOrder = 1;
    grupo.add(manzana);
 
    // Tallito
    var tallo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025 * escala, 0.025 * escala, 0.2 * escala, 5),
      talloManzanaMat
    );
    tallo.position.set(p[0] * escala, (p[1] + 0.3) * escala, p[2] * escala);
    tallo.renderOrder = 1;
    grupo.add(tallo);
 
    // Hojita
    var hojaGeo = new THREE.SphereGeometry(0.09 * escala, 5, 4);
    hojaGeo.scale(2.0, 0.5, 1.0);
    var hoja = new THREE.Mesh(hojaGeo, hojaManzanaMat);
    hoja.position.set((p[0] + 0.12) * escala, (p[1] + 0.38) * escala, p[2] * escala);
    hoja.renderOrder = 1;
    grupo.add(hoja);
  }
 
  // --- Sigue el terreno ondulado ---
  var yTerreno = Math.sin(x * 0.25) * 0.5 + Math.cos(z * 0.25) * 0.5
               + Math.sin(x * 0.6 + z * 0.4) * 0.2;
 
  grupo.position.set(x, yTerreno, z);
  grupo.rotation.y = Math.random() * Math.PI * 2;
  scene.add(grupo);
  return grupo;
}
 
 
// ============================================================
//  FLOR MEJORADA — Con pétalos reales y centro
// ============================================================
 
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
