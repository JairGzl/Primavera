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

  // Trinos de pájaros periódicos
  setTimeout(function loop() {
    if (audioCtx) {
      trino();
      setTimeout(loop, 2000 + Math.random() * 3000);
    }
  }, 1000);
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
  filtro.frequency.value = 400;
  filtro.Q.value = 0.3;

  var ganancia = audioCtx.createGain();
  ganancia.gain.value = 0.08;

  source.connect(filtro);
  filtro.connect(ganancia);
  ganancia.connect(audioCtx.destination);
  source.start();

  sonidosActivos.push(source);
}

function trino() {
  if (!audioCtx) return;

  var notas = [523, 659, 784, 880, 1047]; // Do, Mi, Sol, La, Do alto
  var cantidad = 3 + Math.floor(Math.random() * 4);

  for (var i = 0; i < cantidad; i++) {
    (function (delay) {
      setTimeout(function () {
        var osc = audioCtx.createOscillator();
        var gan = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.value = notas[Math.floor(Math.random() * notas.length)];

        // Glissando ligero
        osc.frequency.linearRampToValueAtTime(
          osc.frequency.value * (0.95 + Math.random() * 0.1),
          audioCtx.currentTime + 0.1
        );

        gan.gain.setValueAtTime(0, audioCtx.currentTime);
        gan.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
        gan.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.18);

        osc.connect(gan);
        gan.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
      }, delay);
    })(i * (80 + Math.random() * 120));
  }
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
