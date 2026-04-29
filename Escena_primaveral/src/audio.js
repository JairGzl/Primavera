// ============================================================
//  INTEGRANTE 4 — Sonido, ensamblado y documentación
//  Agrega música y sonidos ambientales aquí
// ============================================================

var audioCtx = null;
var sonidosActivos = [];

function initAudio() {
  // El audio en navegadores requiere interacción del usuario primero
  // Por eso lo iniciamos al primer click

  document.addEventListener('click', function iniciarAudio() {
    if (audioCtx) return;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      reproducirAmbiente();
      console.log('Audio iniciado');
    } catch (e) {
      console.log('Audio no disponible en este navegador');
    }

    // Solo una vez
    document.removeEventListener('click', iniciarAudio);
  }, { once: true });

  mostrarInstruccionAudio();
}

// ---------- Ambiente sonoro generado con Web Audio API ----------
// (Sin archivos externos — funciona sin servidor)

function reproducirAmbiente() {
  if (!audioCtx) return;

  // Sonido de viento suave (ruido filtrado)
  crearViento();
  crearSonidoAgua();    
  crearZumbidoAbejas();
  crearAvesAmbiente();

}

// ── SONIDO DEL LAGO (burbujeo + flujo suave) ──────────────────
function crearSonidoAgua() {
  if (!audioCtx) return;

  var bufferSize = audioCtx.sampleRate * 3;
  var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  var data = buffer.getChannelData(0);

  // Ruido marrón (brown noise) — mucho más grave y suave que blanco
  // Cada muestra depende de la anterior → acumula graves, elimina agudos
  var ultimo = 0;
  for (var i = 0; i < bufferSize; i++) {
    var blanco = Math.random() * 2 - 1;
    data[i] = (ultimo + (0.02 * blanco)) / 1.02;
    ultimo = data[i];
    data[i] *= 3.5; // compensar el volumen perdido
  }

  var source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Filtro lowpass agresivo — elimina todo lo agudo que quede
  var filtro = audioCtx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 180;
  filtro.Q.value = 0.5;

  var ganancia = audioCtx.createGain();
  ganancia.gain.value = 0.07;

  source.connect(filtro);
  filtro.connect(ganancia);
  ganancia.connect(audioCtx.destination);
  source.start();

  sonidosActivos.push(source);
}

// ── ZUMBIDO DE ABEJAS (estéreo simulado) ─────────────────────
function crearZumbidoAbejas() {
  if (!audioCtx) return;

  function buzzBreve() {
    if (!audioCtx) return;

    // ── Calcular distancia promedio cámara → abejas ──────────
    // Si no hay abejas aún o la cámara no existe, silencio
    var distancia = 999;
    if (typeof camera !== 'undefined' && typeof abejas !== 'undefined' && abejas.length > 0) {
      var totalDist = 0;
      abejas.forEach(function(a) {
        var dx = camera.position.x - a.grupo.position.x;
        var dy = camera.position.y - a.grupo.position.y;
        var dz = camera.position.z - a.grupo.position.z;
        totalDist += Math.sqrt(dx*dx + dy*dy + dz*dz);
      });
      distancia = totalDist / abejas.length; // distancia promedio
    }

    // ── Volumen según distancia ───────────────────────────────
    // Cerca (dist < 5)  → volumen máximo 0.06
    // Lejos (dist > 20) → silencio total
    var volMax = 0;
    if (distancia < 20) {
      volMax = Math.max(0, 0.06 * (1 - distancia / 20));
    }

    // Si está muy lejos, no reproducir nada — solo reagendar
    if (volMax < 0.002) {
      setTimeout(buzzBreve, 800 + Math.random() * 1200);
      return;
    }

    // ── Sonido: "bizz" rápido (2 pulsos cortos) ───────────────
    var numPulsos = 2; // bizz bizz
    for (var p = 0; p < numPulsos; p++) {
      (function(offset) {
        setTimeout(function() {
          if (!audioCtx) return;

          var osc = audioCtx.createOscillator();
          var gan = audioCtx.createGain();

          osc.type = 'square'; // Square da el "zumbido" áspero de insecto
          // Frecuencia de alas de abeja: 200-250 Hz
          osc.frequency.value = 200 + Math.random() * 50;

          // Cada pulso dura muy poco — es un "biz" rápido
          var durPulso = 0.06 + Math.random() * 0.04;

          gan.gain.setValueAtTime(0, audioCtx.currentTime);
          gan.gain.linearRampToValueAtTime(volMax, audioCtx.currentTime + 0.01);
          gan.gain.linearRampToValueAtTime(0, audioCtx.currentTime + durPulso);

          osc.connect(gan);
          gan.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime);
          osc.stop(audioCtx.currentTime + durPulso + 0.01);

        }, offset);
      })(p * 90); // 90ms entre pulsos → "bizz bizz"
    }

    // ── Reagendar: pausa larga entre grupos de buzz ───────────
    setTimeout(buzzBreve, 1200 + Math.random() * 2500);
  }

  setTimeout(buzzBreve, 600);
}

// ── AVES AMBIENTE (más naturales que los trinos anteriores) ───
function crearAvesAmbiente() {
  if (!audioCtx) return;

  function grupoPajaros() {
    if (!audioCtx) return;

    // Cada canto: frecuencia base, número de notas, velocidad
    var cantos = [
      // Canto 1: "pío pío" clásico — dos notas ascendentes
      [[1800, 2200], 0.06, 0.07],
      // Canto 2: trino descendente — jilguero
      [[2400, 2100, 1900, 2000], 0.05, 0.06],
      // Canto 3: silbido largo único — mirlo
      [[1600, 1900, 2100, 1800], 0.07, 0.14],
      // Canto 4: gorjeo rápido — gorrión
      [[2000, 2300, 2000, 2300, 1900], 0.04, 0.05],
    ];

    var canto = cantos[Math.floor(Math.random() * cantos.length)];
    var notas = canto[0];
    var vol   = canto[1];
    var dur   = canto[2];

    notas.forEach(function(freq, i) {
      setTimeout(function() {
        if (!audioCtx) return;

        // Tres osciladores por nota: fundamental + 2 armónicos
        // Esto da el "cuerpo" que hace que suene a pájaro real
        var frecuencias = [freq, freq * 2, freq * 3];
        var volumenes   = [1.0,  0.25,     0.08];

        frecuencias.forEach(function(f, k) {
          var osc = audioCtx.createOscillator();
          var gan = audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f * 1.02, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime( // exponencial → más natural
            f * 0.97,
            audioCtx.currentTime + dur
          );

          var volNota = vol * volumenes[k];
          gan.gain.setValueAtTime(0, audioCtx.currentTime);
          gan.gain.linearRampToValueAtTime(volNota, audioCtx.currentTime + 0.008);
          gan.gain.linearRampToValueAtTime(volNota * 0.7, audioCtx.currentTime + dur * 0.5);
          gan.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);

          osc.connect(gan);
          gan.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime);
          osc.stop(audioCtx.currentTime + dur + 0.02);
        });

      }, i * (dur * 1000 + 25));
    });

    setTimeout(grupoPajaros, 2500 + Math.random() * 4500);
  }

  setTimeout(grupoPajaros, 800);
}

// Helper: reproduce una secuencia de notas como canto de ave
function cantarAve(notas, volumen, duracion) {
  if (!audioCtx) return;

  notas.forEach(function(frecuencia, i) {
    setTimeout(function() {
      if (!audioCtx) return;

      // Oscilador principal
      var osc1 = audioCtx.createOscillator();
      osc1.type = 'triangle'; // Más cálido que sine

      // Segundo oscilador ligeramente desafinado → da cuerpo y textura
      var osc2 = audioCtx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = frecuencia * 1.003; // Apenas desafinado

      // Glissando más pronunciado → más expresivo
      osc1.frequency.setValueAtTime(frecuencia * 1.04, audioCtx.currentTime);
      osc1.frequency.linearRampToValueAtTime(
        frecuencia * 0.96,
        audioCtx.currentTime + duracion
      );
      osc2.frequency.setValueAtTime(frecuencia * 1.04 * 1.003, audioCtx.currentTime);
      osc2.frequency.linearRampToValueAtTime(
        frecuencia * 0.96 * 1.003,
        audioCtx.currentTime + duracion
      );

      var gan1 = audioCtx.createGain();
      var gan2 = audioCtx.createGain();
      gan2.gain.value = 0.3; // osc2 más suave, solo da textura

      // Envolvente con vibrato al final — como un ave real
      var ganMaster = audioCtx.createGain();
      ganMaster.gain.setValueAtTime(0, audioCtx.currentTime);
      ganMaster.gain.linearRampToValueAtTime(volumen, audioCtx.currentTime + 0.02);
      ganMaster.gain.setValueAtTime(volumen, audioCtx.currentTime + duracion * 0.6);
      ganMaster.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duracion);

      osc1.connect(gan1);
      osc2.connect(gan2);
      gan1.connect(ganMaster);
      gan2.connect(ganMaster);
      ganMaster.connect(audioCtx.destination);

      osc1.start(audioCtx.currentTime);
      osc2.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + duracion + 0.05);
      osc2.stop(audioCtx.currentTime + duracion + 0.05);

    }, i * (duracion * 900 + 40));
  });
}

function crearViento() {
  if (!audioCtx) return;

  var bufferSize = audioCtx.sampleRate * 2;
  var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  var data = buffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }

  var source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  var filtro = audioCtx.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.frequency.value = 100;
  filtro.Q.value = 0.8;

  var ganancia = audioCtx.createGain();
  ganancia.gain.value = 0.12;

  // ── 4. LFO DE FRECUENCIA (cambia el tono del viento) ─────────
  // Oscila lento (0.15 Hz = una ola cada ~7 segundos)
  // Mueve la frecuencia del filtro entre 40Hz y 160Hz
  var lfoFrecuencia = audioCtx.createOscillator();
  lfoFrecuencia.type = 'sine';
  lfoFrecuencia.frequency.value = 0.15;

  var profundidadFrecuencia = audioCtx.createGain();
  profundidadFrecuencia.gain.value = 60; // base 100 ± 60 → entre 40 y 160 Hz

  lfoFrecuencia.connect(profundidadFrecuencia);
  profundidadFrecuencia.connect(filtro.frequency); // controla el tono
  lfoFrecuencia.start();

  // ── 5. LFO DE VOLUMEN (simula ráfagas de viento) ─────────────
  // Más lento aún (0.08 Hz = una ráfaga cada ~12 segundos)
  var lfoVolumen = audioCtx.createOscillator();
  lfoVolumen.type = 'sine';
  lfoVolumen.frequency.value = 0.08;

  var profundidadVolumen = audioCtx.createGain();
  profundidadVolumen.gain.value = 0.06; // volumen oscila: 0.12 ± 0.06

  lfoVolumen.connect(profundidadVolumen);
  profundidadVolumen.connect(ganancia.gain); // controla el volumen
  lfoVolumen.start();

  source.connect(filtro);
  filtro.connect(ganancia);
  ganancia.connect(audioCtx.destination);
  source.start();

  sonidosActivos.push(source);
}

function trino() {
  if (!audioCtx) return;

  var patrones = [
    { notas: [780, 720, 650, 600], dur: 0.18, vol: 0.07 },
    { notas: [1100, 1300, 1050, 1250, 980], dur: 0.09, vol: 0.06 },
    { notas: [520, 680, 850, 720, 580], dur: 0.22, vol: 0.08 },
  ];

  var patron = patrones[Math.floor(Math.random() * patrones.length)];

  patron.notas.forEach(function(frecuencia, i) {
    setTimeout(function() {
      if (!audioCtx) return;

      var osc = audioCtx.createOscillator();
      var gan = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(
        frecuencia * (0.93 + Math.random() * 0.1),
        audioCtx.currentTime + patron.dur
      );

      gan.gain.setValueAtTime(0, audioCtx.currentTime);
      gan.gain.linearRampToValueAtTime(patron.vol, audioCtx.currentTime + 0.015);
      gan.gain.linearRampToValueAtTime(0, audioCtx.currentTime + patron.dur * 0.9);

      osc.connect(gan);
      gan.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + patron.dur + 0.05);

    }, i * (patron.dur * 900));
  });
}

// ---------- UI pequeña de instrucción ----------

function mostrarInstruccionAudio() {
  var div = document.getElementById('info');
  var audio = document.createElement('div');
  audio.style.cssText = 'margin-top:6px;font-size:11px;opacity:0.8;';
  audio.textContent = '🔊 Haz click en la escena para activar el audio';
  div.appendChild(audio);
}

// ============================================================
//  NOTAS PARA EL INTEGRANTE 4
//  ───────────────────────────────────────────────────────────
//  Para usar archivos de audio reales (.mp3/.ogg):
//
//    var audio = new Audio('sounds/pajaros.mp3');
//    audio.loop = true;
//    audio.volume = 0.4;
//    audio.play();  // (dentro de un evento de click)
//
//  Recursos de audio gratuitos recomendados:
//    - freesound.org  (libre para uso educativo)
//    - pixabay.com/music
//    - zapsplat.com
//
//  Para la integración final:
//    1. Asegúrate de que todos los archivos .js están en la
//       misma carpeta que index.html
//    2. Prueba en Live Server (extensión de VS Code)
//       o con: python -m http.server 8000
//    3. Para exportar a WebGL suben la carpeta completa
//       a un hosting gratuito como GitHub Pages o Netlify
// ============================================================
