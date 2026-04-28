// ============================================================
//  CÉSPED — Agregar a la escena base
//  Llama a initCesped() después de initEscena()
// ============================================================
// ============================================================
// ============================================================
//  CESPED.JS — Césped avanzado con InstancedMesh + Vertex Shader
//  Técnica: Una sola llamada de draw para miles de briznas → GPU-friendly
//  Llama a initCesped() después de initEscena()
// ============================================================

// ──────────────────────────────────────────────────────────────
//  VERTEX SHADER DE VIENTO
//  Cómo funciona:
//  - Recibe la posición Y de cada vértice de la brizna
//  - Aplica un seno en función del tiempo y la posición XZ
//    para que cada brizna se balancee de forma distinta (no sincronizada)
//  - El factor (posY / alturaMax) hace que la BASE no se mueva
//    y que la PUNTA se mueva más → efecto natural de flexión
// ──────────────────────────────────────────────────────────────
var GRASS_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uWindFrequency;

  // Atributos de instancia (uno por brizna)
  attribute float aAlturaMax;   // altura máxima de ESA brizna
  attribute float aPhaseOffset; // desfase de fase → evita el movimiento sincronizado

  void main() {
    vec3 pos = position;

    // Factor de curvatura: 0 en la base, 1 en la punta
    float factor = clamp(pos.y / aAlturaMax, 0.0, 1.0);
    factor = factor * factor; // Curvatura cuadrática → más realista

    // Onda de viento con desfase individual por instancia
    float wave = sin(uTime * uWindFrequency + aPhaseOffset) * uWindStrength;
    float wave2 = cos(uTime * uWindFrequency * 0.7 + aPhaseOffset * 1.3) * uWindStrength * 0.4;

    pos.x += wave  * factor;
    pos.z += wave2 * factor;

    // Transformación de instancia (posición/rotación/escala de cada brizna)
    vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * worldPos;
  }
`;

// ──────────────────────────────────────────────────────────────
//  FRAGMENT SHADER — Gradiente de color raíz→punta
// ──────────────────────────────────────────────────────────────
var GRASS_FRAGMENT_SHADER = `
  uniform vec3 uColorBase;  // Verde oscuro (raíz)
  uniform vec3 uColorTip;   // Verde claro (punta)

  varying float vHeightFactor;

  void main() {
    // Interpolamos el color según la altura relativa del vértice
    vec3 color = mix(uColorBase, uColorTip, vHeightFactor);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Necesitamos pasar vHeightFactor desde vertex → fragment.
// Versión completa con varying:
var GRASS_VERTEX_SHADER_FULL = `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uWindFrequency;

  attribute float aAlturaMax;
  attribute float aPhaseOffset;

  varying float vHeightFactor;

  void main() {
    vec3 pos = position;

    float factor = clamp(pos.y / aAlturaMax, 0.0, 1.0);
    factor = factor * factor;

    vHeightFactor = factor; // Pasamos al fragment shader

    float wave  = sin(uTime * uWindFrequency + aPhaseOffset) * uWindStrength;
    float wave2 = cos(uTime * uWindFrequency * 0.7 + aPhaseOffset * 1.3) * uWindStrength * 0.4;

    pos.x += wave  * factor;
    pos.z += wave2 * factor;

    vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * worldPos;
  }
`;

// ──────────────────────────────────────────────────────────────
//  VARIABLES GLOBALES DEL MÓDULO
// ──────────────────────────────────────────────────────────────
var grassMesh = null;        // La malla instanciada
var grassUniforms = null;    // Referencia a los uniforms para actualizarlos en el loop

// Configuración ajustable
var GRASS_CONFIG = {
  count:         10000,  // Más briznas para cubrir bien toda el área
  areaSize:      38,     // Tamaño del área cubierta (debe coincidir con el terreno)
  heightMin:     0.20,   // Altura mínima de brizna
  heightMax:     0.55,   // Altura máxima de brizna
  windStrength:  0.18,   // Amplitud del balanceo (0 = sin viento)
  windFrequency: 1.2,    // Velocidad de la onda de viento
  // Colores en formato [r,g,b] normalizados (0–1)
  colorBase: new THREE.Color(0x2E6B1A), // Verde oscuro raíz
  colorTip:  new THREE.Color(0x7DC95E), // Verde brillante punta
};

// ──────────────────────────────────────────────────────────────
//  GEOMETRÍA DE UNA SOLA BRIZNA
//  Forma: 3 segmentos verticales (quad estrecho) para que el
//  shader de curvatura tenga puntos intermedios donde doblar.
// ──────────────────────────────────────────────────────────────
function crearGeometriaBrizna(alturaBase) {
  // PlaneGeometry(ancho, alto, segX, segY)
  // segY = 3 → 4 filas de vértices → la curva es suave
  var geo = new THREE.PlaneGeometry(0.06, alturaBase, 1, 3);

  // THREE.PlaneGeometry centra el plano en Y=0, pero necesitamos
  // que la BASE esté en Y=0 y la PUNTA arriba.
  // Desplazamos todos los vértices +alturaBase/2 en Y:
  var positions = geo.attributes.position;
  for (var i = 0; i < positions.count; i++) {
    positions.setY(i, positions.getY(i) + alturaBase / 2);
  }
  positions.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// ──────────────────────────────────────────────────────────────
//  FUNCIÓN PÚBLICA: initCesped()
// ──────────────────────────────────────────────────────────────
function initCesped() {
  var cfg   = GRASS_CONFIG;
  var count = cfg.count;

  // 1. Geometría base de una brizna (usamos la altura media como referencia)
  var alturaMedia = (cfg.heightMin + cfg.heightMax) / 2;
  var baseGeo = crearGeometriaBrizna(alturaMedia);

  // 2. Arrays de atributos por instancia
  var alturas      = new Float32Array(count); // altura real de cada brizna
  var phaseOffsets = new Float32Array(count); // desfase de viento

  for (var i = 0; i < count; i++) {
    alturas[i]      = cfg.heightMin + Math.random() * (cfg.heightMax - cfg.heightMin);
    phaseOffsets[i] = Math.random() * Math.PI * 2; // [0, 2π]
  }

  // Añadimos los atributos a la geometría
  // InstancedBufferAttribute → un valor distinto por instancia
  baseGeo.setAttribute('aAlturaMax',   new THREE.InstancedBufferAttribute(alturas,      1));
  baseGeo.setAttribute('aPhaseOffset', new THREE.InstancedBufferAttribute(phaseOffsets, 1));

  // 3. Uniforms del shader (valores globales compartidos por todas las instancias)
  grassUniforms = {
    uTime:          { value: 0.0 },
    uWindStrength:  { value: cfg.windStrength },
    uWindFrequency: { value: cfg.windFrequency },
    uColorBase:     { value: cfg.colorBase },
    uColorTip:      { value: cfg.colorTip },
  };

  // 4. Material con ShaderMaterial
  //    side: THREE.DoubleSide → visible desde ambos lados (importante para planos finos)
  var grassMat = new THREE.ShaderMaterial({
    uniforms:       grassUniforms,
    vertexShader:   GRASS_VERTEX_SHADER_FULL,
    fragmentShader: GRASS_FRAGMENT_SHADER,
    side:           THREE.DoubleSide,
    // alphaTest: 0.5 ← útil si añades textura con transparencia en el futuro
  });

  // 5. InstancedMesh: UN SOLO objeto en la escena con `count` instancias
  //    → UNA sola llamada de draw al GPU en lugar de 8000 llamadas separadas
  grassMesh = new THREE.InstancedMesh(baseGeo, grassMat, count);
  grassMesh.castShadow    = false; // El pasto no necesita sombras propias (optimización)
  grassMesh.receiveShadow = true;

  // 6. Colocar cada instancia con su matriz de transformación
  //
  //  DISTRIBUCIÓN ESTRATIFICADA: divide el área en una cuadrícula de celdas
  //  y coloca al menos 1 brizna por celda con jitter (ruido) adentro de ella.
  //  Esto garantiza cobertura uniforme sin huecos, a diferencia del puro random
  //  que estadísticamente deja zonas vacías y otras sobrepobladas.
  //
  //  Además reservamos un 25% de las instancias para el primer plano (Z > 0)
  //  que es la zona más visible desde la cámara y donde el hueco era más notorio.

  var dummy    = new THREE.Object3D();
  var half     = cfg.areaSize / 2;

  // ── Lote A: distribución estratificada por cuadrícula ──────
  // Usamos el 75% de las instancias para cubrir toda el área uniformemente
  var countGrid   = Math.floor(count * 0.75);
  var gridCells   = Math.ceil(Math.sqrt(countGrid)); // e.g. ~87 celdas por lado
  var cellSize    = cfg.areaSize / gridCells;
  var gridPlaced  = 0;

  outerLoop:
  for (var row = 0; row < gridCells; row++) {
    for (var col = 0; col < gridCells; col++) {
      if (gridPlaced >= countGrid) break outerLoop;

      // Centro de esta celda + jitter aleatorio dentro de la celda
      var x = -half + (col + 0.1 + Math.random() * 0.8) * cellSize;
      var z = -half + (row + 0.1 + Math.random() * 0.8) * cellSize;

      var yTerrain = calcularYTerreno(x, z);
      dummy.position.set(x, yTerrain, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.set(1, alturas[gridPlaced] / alturaMedia, 1);
      dummy.updateMatrix();
      grassMesh.setMatrixAt(gridPlaced, dummy.matrix);
      gridPlaced++;
    }
  }

  // ── Lote B: primer plano denso (zona central-frontal visible) ──
  // El 25% restante se concentra en la franja Z = [-5, +18] y X = [-20, +20]
  // que es exactamente el área donde la cámara ve el "hueco"
  for (var j = gridPlaced; j < count; j++) {
    var x = (Math.random() - 0.5) * 40;           // Ancho completo
    var z = -5 + Math.random() * 23;              // Primer plano: Z de -5 a +18

    var yTerrain = calcularYTerreno(x, z);
    dummy.position.set(x, yTerrain, z);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.scale.set(1, alturas[j] / alturaMedia, 1);
    dummy.updateMatrix();
    grassMesh.setMatrixAt(j, dummy.matrix);
  }

  grassMesh.instanceMatrix.needsUpdate = true;
  scene.add(grassMesh);

  console.log('[Cesped] InstancedMesh creado con', count, 'instancias.');
}

// ──────────────────────────────────────────────────────────────
//  FUNCIÓN DE ACTUALIZACIÓN — llamar en el loop de animación
// ──────────────────────────────────────────────────────────────
function updateCesped(elapsedTime) {
  if (grassUniforms) {
    grassUniforms.uTime.value = elapsedTime;
  }
}

// ──────────────────────────────────────────────────────────────
//  HELPER: altura del terreno (misma fórmula que en el terreno base)
//  Si tu compañero cambia la fórmula del terreno, actualiza esto.
// ──────────────────────────────────────────────────────────────
function calcularYTerreno(x, z) {
  return Math.sin(x * 0.25) * 0.5
       + Math.cos(z * 0.25) * 0.5
       + Math.sin(x * 0.6 + z * 0.4) * 0.2;
}