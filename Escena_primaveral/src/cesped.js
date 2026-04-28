// ============================================================
//  CÉSPED — Agregar a la escena base
//  Llama a initCesped() después de initEscena()
// ============================================================

function initCesped() {
  // Césped en zona central y alrededor
  for (var i = 0; i < 1500; i++) {
    var x = (Math.random() - 0.5) * 40;
    var z = (Math.random() - 0.5) * 40;
    crearBrizna(x, 0, z);
  }
}

function crearBrizna(x, y, z) {
  var grupo = new THREE.Group();

  // Colores de verde variados para naturalidad
  var verdes = [0x4CAF50, 0x66BB6A, 0x388E3C, 0x81C784, 0x558B2F, 0x8BC34A];
  var color = verdes[Math.floor(Math.random() * verdes.length)];
  var mat = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });

  var altura = 0.25 + Math.random() * 0.35; // Entre 0.25 y 0.6 de alto
  var inclinacion = (Math.random() - 0.5) * 0.5; // Se inclina un poco

  // Cada "brizna" son 2 planos cruzados (cruz) para verse desde todos los ángulos
  for (var k = 0; k < 2; k++) {
    var geo = new THREE.PlaneGeometry(0.06, altura);
    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.y = (k * Math.PI) / 2;       // 0° y 90°
    mesh.rotation.z = inclinacion;              // Leve inclinación
    mesh.position.y = altura / 2;
    grupo.add(mesh);
  }

  // Posición con pequeña variación en Y para que siga el terreno ondulado
  var yTerreno = Math.sin(x * 0.25) * 0.5 + Math.cos(z * 0.25) * 0.5
               + Math.sin(x * 0.6 + z * 0.4) * 0.2;

  grupo.position.set(x, yTerreno, z);
  grupo.rotation.y = Math.random() * Math.PI * 2; // Orientación aleatoria
  scene.add(grupo);
}
