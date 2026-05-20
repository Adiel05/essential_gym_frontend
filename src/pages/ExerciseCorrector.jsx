// src/pages/ExerciseCorrector.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, StopCircle, Activity, Volume2, VolumeX, AlertTriangle, CheckCircle } from 'lucide-react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .corrector-root {
    font-family: 'DM Sans', sans-serif;
    background: radial-gradient(ellipse at 20% 20%, #0d1f4a 0%, #07122a 50%, #020b1a 100%);
    min-height: 100vh;
  }
  .heading { font-family: 'Syne', sans-serif; }

  .btn-primary {
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    border: none;
    border-radius: 14px;
    color: white;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
    box-shadow: 0 4px 20px rgba(110,200,224,0.25);
  }
  .btn-primary:hover { box-shadow: 0 8px 32px rgba(110,200,224,0.4); transform: translateY(-1px); }

  .btn-danger {
    background: rgba(220,38,38,0.15);
    border: 1px solid rgba(220,38,38,0.4);
    border-radius: 14px;
    color: #f87171;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
  }
  .btn-danger:hover { background: rgba(220,38,38,0.25); }

  .btn-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-icon:hover { background: rgba(255,255,255,0.12); }

  .glass-card {
    background: rgba(10,20,50,0.55);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
  }
  .instruction-card {
    background: rgba(10,20,50,0.4);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(110,200,224,0.2);
    border-radius: 16px;
    padding: 16px 20px;
  }

  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(251,191,36,0.08);
    border: 1px solid rgba(251,191,36,0.2);
    border-radius: 10px;
    color: #fbbf24;
    font-size: 13px;
    line-height: 1.4;
  }
  .ok-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.2);
    border-radius: 10px;
    color: #4ade80;
    font-size: 13px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
  .spinner {
    width: 48px; height: 48px;
    border-radius: 50%;
    border: 3px solid rgba(110,200,224,0.15);
    border-top-color: #6EC8E0;
    animation: spin 0.9s linear infinite;
    margin: 0 auto 16px;
  }
  .pulse { animation: pulse 2s ease-in-out infinite; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────

const calcAngle = (a, b, c) => {
  if (!a || !b || !c) return 0;
  const rad =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);
  let deg = Math.abs((rad * 180) / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
};

const CONNECTIONS = [
  [11,12],[11,13],[13,15],[12,14],[14,16],
  [23,24],[23,25],[25,27],[24,26],[26,28],
  [11,23],[12,24],
  [27,29],[28,30],[27,31],[28,32],
];

// ─── Analysis rules ────────────────────────────────────────────────────────

const analyzeExercise = (pose, exerciseName) => {
  const name = exerciseName.toLowerCase();
  const alerts = [];
  const ok    = [];

  if (name.includes('press') || name.includes('banca')) {
    const lElbow = calcAngle(pose[11], pose[13], pose[15]);
    const rElbow = calcAngle(pose[12], pose[14], pose[16]);

    if (lElbow > 75) alerts.push('Codo izquierdo muy abierto (>75°)');
    else ok.push('Ángulo codo izquierdo correcto');

    if (rElbow > 75) alerts.push('Codo derecho muy abierto (>75°)');
    else ok.push('Ángulo codo derecho correcto');

    if (pose[15] && pose[13] && pose[15].y < pose[13].y - 0.02)
      alerts.push('Muñeca izquierda quebrada hacia arriba');

    if (pose[16] && pose[14] && pose[16].y < pose[14].y - 0.02)
      alerts.push('Muñeca derecha quebrada hacia arriba');

    if (pose[13] && pose[11] && (pose[13].y - pose[11].y) < 0.04)
      alerts.push('Baja más la barra hacia el pecho');

  } else if (name.includes('sentadilla') || name.includes('squat')) {
    const lKnee = calcAngle(pose[23], pose[25], pose[27]);
    const rKnee = calcAngle(pose[24], pose[26], pose[28]);

    if (lKnee < 80) alerts.push(`Baja más — rodilla izquierda: ${lKnee.toFixed(0)}°`);
    else ok.push(`Profundidad OK rodilla izquierda (${lKnee.toFixed(0)}°)`);

    if (rKnee < 80) alerts.push(`Baja más — rodilla derecha: ${rKnee.toFixed(0)}°`);
    else ok.push(`Profundidad OK rodilla derecha (${rKnee.toFixed(0)}°)`);

    if (pose[25] && pose[27] && (pose[25].x - pose[27].x) > 0.08)
      alerts.push('Rodilla izquierda cayendo hacia adentro');

    if (pose[26] && pose[28] && (pose[28].x - pose[26].x) > 0.08)
      alerts.push('Rodilla derecha cayendo hacia adentro');

  } else if (name.includes('peso muerto') || name.includes('deadlift')) {
    const hip = calcAngle(pose[11], pose[23], pose[25]);

    if (hip < 155) alerts.push(`Espalda redondeada — mantén columna neutra (${hip.toFixed(0)}°)`);
    else ok.push('Columna neutra correcta');

    if (pose[11] && pose[12]) {
      const shoulderDiff = Math.abs(pose[11].y - pose[12].y);
      if (shoulderDiff > 0.06) alerts.push('Hombros desnivelados');
    }

  } else if (name.includes('curl')) {
    const lElbow = calcAngle(pose[11], pose[13], pose[15]);
    const rElbow = calcAngle(pose[12], pose[14], pose[16]);

    if (lElbow > 30 && lElbow < 140) alerts.push('Completa el recorrido del curl izquierdo');
    if (rElbow > 30 && rElbow < 140) alerts.push('Completa el recorrido del curl derecho');

    if (pose[11] && pose[13] && Math.abs(pose[11].x - pose[13].x) > 0.12)
      alerts.push('Codo izquierdo se mueve — mantenlo fijo');

    if (pose[12] && pose[14] && Math.abs(pose[12].x - pose[14].x) > 0.12)
      alerts.push('Codo derecho se mueve — mantenlo fijo');

  } else {
    alerts.push('Ejercicio no configurado aún — modo observación activo');
  }

  return { alerts, ok };
};

// ─── Component ─────────────────────────────────────────────────────────────

const ExerciseCorrector = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const exerciseName   = searchParams.get('exerciseName') || 'Press de banca';

  // ── State ──
  const [cameraActive,    setCameraActive]    = useState(false);
  const [modelReady,      setModelReady]      = useState(false);
  const [modelError,      setModelError]      = useState(false);
  const [voiceEnabled,    setVoiceEnabled]    = useState(true);
  const [alerts,          setAlerts]          = useState([]);
  const [okItems,         setOkItems]         = useState([]);
  const [statusMsg,       setStatusMsg]       = useState('Cargando modelo de poses...');
  const [poseDetected,    setPoseDetected]    = useState(false);

  // ── Refs (for values used inside rAF loop) ──
  const videoRef          = useRef(null);
  const canvasRef         = useRef(null);
  const rafRef            = useRef(null);
  const landmarkerRef     = useRef(null);   // ← NOT useState, avoids stale closure
  const cameraActiveRef   = useRef(false);  // ← mirrors cameraActive for the loop
  const voiceEnabledRef   = useRef(true);
  const lastSpeechRef     = useRef(0);
  const lastAlertTextRef  = useRef('');

  // Keep refs in sync with state
  useEffect(() => { cameraActiveRef.current  = cameraActive;  }, [cameraActive]);
  useEffect(() => { voiceEnabledRef.current  = voiceEnabled;  }, [voiceEnabled]);

  // ── Load MediaPipe ──
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setStatusMsg('Descargando modelo de poses...');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        if (cancelled) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        setModelReady(true);
        setStatusMsg('Modelo listo. Activa la cámara para comenzar.');
      } catch (err) {
        console.error('MediaPipe load error:', err);
        if (!cancelled) {
          setModelError(true);
          setStatusMsg('Error al cargar el modelo. Recarga la página.');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Draw skeleton ──
  const drawSkeleton = useCallback((landmarks) => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;

    const W = video.videoWidth;
    const H = video.videoHeight;
    if (!W || !H) return;

    // Set canvas resolution to match video
    if (canvas.width !== W)  canvas.width  = W;
    if (canvas.height !== H) canvas.height = H;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    if (!landmarks || landmarks.length === 0) {
      setPoseDetected(false);
      return;
    }

    setPoseDetected(true);
    const pose = landmarks[0];

    // Connections
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(110,200,224,0.8)';
    ctx.beginPath();
    CONNECTIONS.forEach(([i, j]) => {
      const a = pose[i], b = pose[j];
      if (!a || !b) return;
      ctx.moveTo(a.x * W, a.y * H);
      ctx.lineTo(b.x * W, b.y * H);
    });
    ctx.stroke();

    // Joints
    pose.forEach((pt) => {
      if (!pt) return;
      ctx.beginPath();
      ctx.arc(pt.x * W, pt.y * H, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#6EC8E0';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, []);

  // ── rAF detection loop ──
  const runDetection = useCallback(() => {
    const video     = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!cameraActiveRef.current) return; // camera was stopped

    if (!landmarker || !video || video.readyState < 2 || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(runDetection);
      return;
    }

    try {
      const now     = performance.now();
      const results = landmarker.detectForVideo(video, now);
      drawSkeleton(results.landmarks);

      if (results.landmarks && results.landmarks.length > 0) {
        const { alerts: newAlerts, ok: newOk } = analyzeExercise(
          results.landmarks[0],
          exerciseName
        );
        setAlerts(newAlerts);
        setOkItems(newOk);

        // Throttled TTS: speak once every 4s, only if alert changed
        if (
          voiceEnabledRef.current &&
          newAlerts.length > 0 &&
          now - lastSpeechRef.current > 4000 &&
          newAlerts[0] !== lastAlertTextRef.current
        ) {
          const synth = window.speechSynthesis;
          if (synth && !synth.speaking) {
            const utt = new SpeechSynthesisUtterance(newAlerts[0]);
            utt.lang = 'es-ES';
            utt.rate = 0.95;
            synth.speak(utt);
            lastSpeechRef.current   = now;
            lastAlertTextRef.current = newAlerts[0];
          }
        }
      } else {
        setAlerts([]);
        setOkItems([]);
      }
    } catch (err) {
      // Silently skip bad frames
    }

    rafRef.current = requestAnimationFrame(runDetection);
  }, [drawSkeleton, exerciseName]);

  // ── Camera controls ──
  const startCamera = async () => {
    if (!modelReady) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      cameraActiveRef.current = true;
      setCameraActive(true);
      setStatusMsg('Cámara activa — detectando pose...');
      rafRef.current = requestAnimationFrame(runDetection);
    } catch (err) {
      console.error('Camera error:', err);
      setStatusMsg(`Error de cámara: ${err.message}`);
    }
  };

  const stopCamera = () => {
    cameraActiveRef.current = false;
    setCameraActive(false);

    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }

    // Clear canvas
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    setAlerts([]);
    setOkItems([]);
    setPoseDetected(false);
    setStatusMsg('Cámara detenida.');
    window.speechSynthesis?.cancel();
  };

  // ── Status color ──
  const statusColor =
    statusMsg.startsWith('Error') ? '#f87171' :
    statusMsg.includes('Cargando') || statusMsg.includes('Descargando') ? '#fbbf24' :
    '#4ade80';

  // ── Loading screen ──
  if (!modelReady && !modelError) {
    return (
      <div className="corrector-root" style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <style>{globalStyles}</style>
        <div style={{ textAlign:'center' }}>
          <div className="spinner" />
          <p className="heading" style={{ color:'white', fontSize:18, marginBottom:8 }}>Corrector Biomecánico</p>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13 }}>{statusMsg}</p>
        </div>
      </div>
    );
  }

  // ── Main UI ──
  return (
    <div className="corrector-root" style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <style>{globalStyles}</style>

      {/* ── Navbar ── */}
      <nav style={{
        padding: '10px 20px',
        background: 'rgba(7,18,42,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button className="btn-icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={17} color="white" />
          </button>
          <div>
            <div className="heading" style={{ color:'white', fontSize:15, fontWeight:700 }}>
              Corrector Biomecánico
            </div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:1 }}>{exerciseName}</div>
          </div>
        </div>

        <button
          className="btn-icon"
          onClick={() => setVoiceEnabled(v => !v)}
          title={voiceEnabled ? 'Silenciar voz' : 'Activar voz'}
        >
          {voiceEnabled
            ? <Volume2  size={17} color="#6EC8E0" />
            : <VolumeX  size={17} color="rgba(255,255,255,0.35)" />}
        </button>
      </nav>

      {/* ── Body ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: 20,
        padding: '18px 20px',
        overflow: 'hidden',
        // Stack vertically on narrow screens if needed
      }}>

        {/* ── Left: Camera feed ── */}
        <div style={{ flex: 3, display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>
          {/* Video wrapper */}
          <div style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            background: '#000',
            border: `1px solid ${poseDetected ? 'rgba(74,222,128,0.4)' : 'rgba(110,200,224,0.25)'}`,
            boxShadow: poseDetected
              ? '0 0 24px rgba(74,222,128,0.12)'
              : '0 16px 40px rgba(0,0,0,0.5)',
            transition: 'border-color 0.4s, box-shadow 0.4s',
            aspectRatio: '4/3',
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />
            {/* Canvas MUST be positioned over video with matching size */}
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />

            {/* Overlay badge */}
            {cameraActive && (
              <div style={{
                position: 'absolute', top: 12, left: 12,
                background: poseDetected ? 'rgba(74,222,128,0.15)' : 'rgba(0,0,0,0.5)',
                border: `1px solid ${poseDetected ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 8, padding: '4px 10px',
                display: 'flex', alignItems: 'center', gap: 6,
                backdropFilter: 'blur(6px)',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: poseDetected ? '#4ade80' : '#fbbf24',
                  animation: 'pulse 1.5s infinite',
                }} />
                <span style={{ color:'white', fontSize:11, fontWeight:600 }}>
                  {poseDetected ? 'Pose detectada' : 'Buscando pose...'}
                </span>
              </div>
            )}
          </div>

          {/* Camera button */}
          <div style={{ display:'flex', justifyContent:'center' }}>
            {!cameraActive ? (
              <button
                className="btn-primary"
                onClick={startCamera}
                disabled={!modelReady}
                style={{ opacity: modelReady ? 1 : 0.5, cursor: modelReady ? 'pointer' : 'not-allowed' }}
              >
                <Camera size={17} />
                Activar cámara
              </button>
            ) : (
              <button className="btn-danger" onClick={stopCamera}>
                <StopCircle size={17} />
                Detener
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Info panel ── */}
        <div style={{ flex: 2, display:'flex', flexDirection:'column', gap:16, overflowY:'auto', minWidth:0 }}>

          {/* Instructions */}
          <div className="instruction-card">
            <p style={{ color:'#6EC8E0', fontSize:13, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              📋 Cómo usar el corrector
            </p>
            <div style={{ color:'rgba(255,255,255,0.65)', fontSize:12, lineHeight:1.6, display:'flex', flexDirection:'column', gap:5 }}>
              <p>① Pósate <strong style={{color:'white'}}>de frente o de lado</strong>, cuerpo completo visible.</p>
              <p>② Buena iluminación y ropa de <strong style={{color:'white'}}>contraste con el fondo</strong>.</p>
              <p>③ Realiza el movimiento <strong style={{color:'white'}}>lentamente</strong>.</p>
              <p>④ El esqueleto azul confirma la detección.</p>
            </div>
          </div>

          {/* Status */}
          <div className="glass-card" style={{ padding:'12px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
              <Activity size={14} color="#6EC8E0" />
              <span className="heading" style={{ color:'white', fontWeight:600, fontSize:12 }}>Estado del sistema</span>
            </div>
            <p style={{ color: statusColor, fontSize:12 }}>{statusMsg}</p>
          </div>

          {/* Corrections */}
          <div className="glass-card" style={{ padding:'16px 20px', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Activity size={17} color="#6EC8E0" />
              <span className="heading" style={{ color:'white', fontWeight:700, fontSize:14 }}>
                Correcciones en tiempo real
              </span>
            </div>

            {!cameraActive && (
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13 }}>
                Activa la cámara para comenzar el análisis.
              </p>
            )}

            {cameraActive && !poseDetected && (
              <p className="pulse" style={{ color:'rgba(255,255,255,0.45)', fontSize:13 }}>
                🔍 Buscando pose... asegúrate de que tu cuerpo completo sea visible.
              </p>
            )}

            {cameraActive && poseDetected && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {alerts.length === 0 && okItems.length === 0 && (
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Analizando movimiento...</p>
                )}
                {alerts.map((a, i) => (
                  <div key={i} className="alert-item">
                    <AlertTriangle size={14} style={{ flexShrink:0, marginTop:1 }} />
                    {a}
                  </div>
                ))}
                {alerts.length === 0 && okItems.length > 0 && (
                  <div className="ok-item">
                    <CheckCircle size={14} style={{ flexShrink:0 }} />
                    ¡Excelente forma!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCorrector;