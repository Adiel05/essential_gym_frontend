// src/pages/ExerciseCorrector.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Camera, StopCircle, Activity, Volume2, VolumeX,
  AlertTriangle, CheckCircle, Repeat2, Award, ChevronRight, Timer,
  Play, Dumbbell, ChevronUp, ChevronDown,
} from 'lucide-react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:         #07122a;
    --blue:         #1A4B8C;
    --cyan:         #6EC8E0;
    --cyan-dim:     rgba(110,200,224,0.12);
    --cyan-border:  rgba(110,200,224,0.28);
    --glass:        rgba(10,20,50,0.55);
    --glass-border: rgba(255,255,255,0.08);
    --ok:           #4ade80;
    --warn:         #fbbf24;
    --crit:         #f87171;
    --text:         rgba(255,255,255,0.92);
    --text-dim:     rgba(255,255,255,0.45);
  }

  .corrector-root {
    font-family: 'DM Sans', sans-serif;
    background: radial-gradient(ellipse at 20% 20%, #0d1f4a 0%, #07122a 50%, #020b1a 100%);
    min-height: 100vh;
    color: var(--text);
  }
  .heading { font-family: 'Syne', sans-serif; }

  .btn-primary {
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    border: none; border-radius: 14px;
    color: white; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
    cursor: pointer; padding: 11px 28px;
    display: flex; align-items: center; gap: 8px;
    transition: all 0.3s;
    box-shadow: 0 4px 20px rgba(110,200,224,0.25);
  }
  .btn-primary:hover  { box-shadow: 0 8px 32px rgba(110,200,224,0.4); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  .btn-danger {
    background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.4);
    border-radius: 14px; color: #f87171;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    cursor: pointer; padding: 11px 28px;
    display: flex; align-items: center; gap: 8px; transition: all 0.3s;
  }
  .btn-danger:hover { background: rgba(220,38,38,0.28); }

  .btn-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; color: white;
  }
  .btn-icon:hover { background: rgba(255,255,255,0.12); }

  .glass-card {
    background: var(--glass); backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border); border-radius: 20px;
  }

  .fb-crit {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 9px 13px;
    background: rgba(248,113,113,0.09); border: 1px solid rgba(248,113,113,0.28);
    border-radius: 11px; color: var(--crit); font-size: 13px; line-height: 1.45;
    animation: slide-in 0.25s ease;
  }
  .fb-warn {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 9px 13px;
    background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.22);
    border-radius: 11px; color: var(--warn); font-size: 13px; line-height: 1.45;
    animation: slide-in 0.25s ease;
  }
  .fb-ok {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 13px;
    background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.22);
    border-radius: 11px; color: var(--ok); font-size: 13px;
    animation: slide-in 0.25s ease;
  }
  .fb-info {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 9px 13px;
    background: rgba(110,200,224,0.07); border: 1px solid rgba(110,200,224,0.18);
    border-radius: 11px; color: var(--cyan); font-size: 13px; line-height: 1.45;
    animation: slide-in 0.25s ease;
  }

  .score-ring {
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .score-ring svg { transform: rotate(-90deg); }
  .score-ring .label {
    position: absolute; text-align: center;
    font-family: 'Syne', sans-serif;
  }

  .stat-chip {
    flex: 1;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 12px 14px;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }

  .phase-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 99px;
    font-size: 11px; font-weight: 700; font-family: 'Syne', sans-serif;
    letter-spacing: 0.05em; transition: all 0.3s;
  }

  .instr-step {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.5;
  }
  .instr-step:last-child { border-bottom: none; }
  .step-num {
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(110,200,224,0.15); border: 1px solid rgba(110,200,224,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #6EC8E0; flex-shrink: 0;
    margin-top: 1px;
  }

  /* Overlay modal */
  .overlay-modal {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(16px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px;
  }
  .modal-box {
    background: linear-gradient(145deg, #0a1630, #0d2050);
    border: 1px solid rgba(110,200,224,0.25);
    border-radius: 24px; padding: 32px 36px;
    max-width: 420px; width: 100%; text-align: center;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  }

  /* Rest timer ring */
  .rest-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .rest-ring svg { transform: rotate(-90deg); }
  .rest-ring-label {
    position: absolute; font-family: 'Syne', sans-serif;
    font-size: 42px; font-weight: 800; color: #6EC8E0;
    line-height: 1;
  }

  /* GIF frame */
  .gif-frame {
    border-radius: 14px; overflow: hidden;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .gif-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes pulse   { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
  @keyframes slide-in { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
  @keyframes count-bounce { 0%,100% { transform: scale(1); } 40% { transform: scale(1.3); } }

  .spinner {
    width: 48px; height: 48px; border-radius: 50%;
    border: 3px solid rgba(110,200,224,0.15); border-top-color: #6EC8E0;
    animation: spin 0.9s linear infinite; margin: 0 auto 16px;
  }
  .pulse  { animation: pulse 2s ease-in-out infinite; }

  .slim-scroll::-webkit-scrollbar { width: 3px; }
  .slim-scroll::-webkit-scrollbar-track { background: transparent; }
  .slim-scroll::-webkit-scrollbar-thumb { background: rgba(110,200,224,0.25); border-radius: 4px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const angle3 = (a, b, c) => {
  if (!a || !b || !c) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magA = Math.hypot(ab.x, ab.y);
  const magC = Math.hypot(cb.x, cb.y);
  if (!magA || !magC) return null;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (magA * magC)))) * 180) / Math.PI;
};

const xDiff = (a, b) => a && b ? b.x - a.x : null;

const L = {
  NOSE: 0,
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW: 13, R_ELBOW: 14,
  L_WRIST: 15, R_WRIST: 16,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
  L_HEEL: 29, R_HEEL: 30,
  L_TOE: 31, R_TOE: 32,
};

const CONNECTIONS = [
  [L.L_SHOULDER, L.R_SHOULDER],
  [L.L_SHOULDER, L.L_ELBOW], [L.L_ELBOW, L.L_WRIST],
  [L.R_SHOULDER, L.R_ELBOW], [L.R_ELBOW, L.R_WRIST],
  [L.L_SHOULDER, L.L_HIP], [L.R_SHOULDER, L.R_HIP],
  [L.L_HIP, L.R_HIP],
  [L.L_HIP, L.L_KNEE], [L.L_KNEE, L.L_ANKLE],
  [L.R_HIP, L.R_KNEE], [L.R_KNEE, L.R_ANKLE],
  [L.L_ANKLE, L.L_HEEL], [L.L_HEEL, L.L_TOE],
  [L.R_ANKLE, L.R_HEEL], [L.R_HEEL, L.R_TOE],
];

// ─────────────────────────────────────────────────────────────────────────────
// ANGLE HISTORY
// ─────────────────────────────────────────────────────────────────────────────
const HISTORY_SIZE = 10;

class AngleHistory {
  constructor() { this.frames = []; }
  push(vals) {
    this.frames.push(vals);
    if (this.frames.length > HISTORY_SIZE) this.frames.shift();
  }
  avg(key, n = 5) {
    const slice = this.frames.slice(-n);
    const vals = slice.map(f => f[key]).filter(v => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  trend(key, n = 6) {
    const slice = this.frames.slice(-n);
    if (slice.length < 3) return 0;
    const first = slice.slice(0, Math.floor(n / 2)).map(f => f[key]).filter(v => v != null);
    const last = slice.slice(Math.floor(n / 2)).map(f => f[key]).filter(v => v != null);
    if (!first.length || !last.length) return 0;
    const avgF = first.reduce((a, b) => a + b, 0) / first.length;
    const avgL = last.reduce((a, b) => a + b, 0) / last.length;
    return avgL - avgF;
  }
  latest(key) {
    for (let i = this.frames.length - 1; i >= 0; i--) {
      if (this.frames[i][key] != null) return this.frames[i][key];
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE DEFINITIONS — includes instructions array
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISES = {
  sentadilla: {
    name: 'Sentadilla', emoji: '🏋️',
    cue: 'De pie, cuerpo completo visible de frente o de lado',
    instructions: [
      'Párate con los pies a la anchura de los hombros, punteras ligeramente hacia afuera.',
      'Mantén el pecho arriba y la columna neutra durante todo el movimiento.',
      'Baja las caderas como si fueras a sentarte, empujando las rodillas hacia afuera.',
      'Desciende hasta que los muslos estén paralelos al suelo (o más abajo).',
      'Empuja el suelo con los pies para subir, extendiendo rodillas y caderas a la vez.',
    ],
    phases: ['top', 'bajando', 'fondo', 'subiendo'],
    repPhase: 'top',
    detect(hist) {
      const lKnee = hist.avg('lKnee');
      const trend = hist.trend('lKnee');
      if (lKnee == null) return 'top';
      if (lKnee > 155) return 'top';
      if (lKnee <= 155 && trend < -3) return 'bajando';
      if (lKnee < 100) return 'fondo';
      if (lKnee > 100 && trend > 3) return 'subiendo';
      return 'fondo';
    },
    analyze(hist, pose, phase) {
      const feedback = []; let score = 100;
      const lKnee = hist.avg('lKnee', 4); const rKnee = hist.avg('rKnee', 4);
      if (phase === 'fondo') {
        const depth = lKnee ?? rKnee;
        if (depth != null && depth > 110) {
          feedback.push({ level: 'warn', text: `Profundidad insuficiente (${depth.toFixed(0)}°) — baja más hasta paralelo`, speak: 'Baja más, llega a paralelo' });
          score -= 20;
        } else if (depth != null && depth <= 90) {
          feedback.push({ level: 'ok', text: '¡Profundidad excelente! Por debajo del paralelo', speak: null });
        }
      }
      if (phase === 'bajando') feedback.push({ level: 'info', text: 'Bajando — rodillas alineadas con pies, pecho arriba', speak: null });
      if (pose[L.L_KNEE] && pose[L.L_ANKLE]) {
        const valgusL = xDiff(pose[L.L_KNEE], pose[L.L_ANKLE]);
        if (valgusL != null && valgusL > 0.06) {
          feedback.push({ level: 'crit', text: 'Rodilla izquierda cayendo hacia adentro — empuja hacia afuera', speak: 'Empuja la rodilla izquierda hacia afuera' });
          score -= 25;
        }
      }
      if (pose[L.R_KNEE] && pose[L.R_ANKLE]) {
        const valgusR = xDiff(pose[L.R_ANKLE], pose[L.R_KNEE]);
        if (valgusR != null && valgusR > 0.06) {
          feedback.push({ level: 'crit', text: 'Rodilla derecha cayendo hacia adentro — empuja hacia afuera', speak: 'Empuja la rodilla derecha hacia afuera' });
          score -= 25;
        }
      }
      if (pose[L.L_SHOULDER] && pose[L.R_SHOULDER]) {
        if (Math.abs(pose[L.L_SHOULDER].y - pose[L.R_SHOULDER].y) > 0.05) {
          feedback.push({ level: 'warn', text: 'Hombros desnivelados — mantén el torso simétrico', speak: 'Nivela los hombros' });
          score -= 10;
        }
      }
      if (feedback.length === 0 && phase !== 'top') feedback.push({ level: 'ok', text: '¡Excelente forma! Sigue así', speak: null });
      return { feedback, score: Math.max(0, score) };
    },
  },

  peso_muerto: {
    name: 'Peso Muerto', emoji: '🔩',
    cue: 'De lado preferiblemente, cuerpo completo visible',
    instructions: [
      'Párate con los pies a la anchura de caderas, barra sobre el dorso del pie.',
      'Agarra la barra con manos a la anchura de hombros, espalda plana.',
      'Empuja las caderas hacia atrás (bisagra de cadera), no doblar solo rodillas.',
      'Mantén la barra pegada al cuerpo todo el recorrido, pecho arriba.',
      'Al subir, extiende caderas y rodillas simultáneamente apretando glúteos.',
    ],
    phases: ['top', 'bajando', 'fondo', 'subiendo'],
    repPhase: 'top',
    detect(hist) {
      const hipAngle = hist.avg('lHip'); const trend = hist.trend('lHip');
      if (hipAngle == null) return 'top';
      if (hipAngle > 160) return 'top';
      if (hipAngle <= 160 && trend < -4) return 'bajando';
      if (hipAngle < 90) return 'fondo';
      if (hipAngle >= 90 && trend > 4) return 'subiendo';
      return 'fondo';
    },
    analyze(hist, pose, phase) {
      const feedback = []; let score = 100;
      if (pose[L.L_SHOULDER] && pose[L.L_HIP] && pose[L.L_KNEE]) {
        const spineAngle = angle3(pose[L.L_SHOULDER], pose[L.L_HIP], pose[L.L_KNEE]);
        if (spineAngle != null && spineAngle < 150 && phase !== 'top') {
          feedback.push({ level: 'crit', text: `Espalda redondeada (${spineAngle.toFixed(0)}°) — columna neutra, pecho arriba`, speak: 'Columna neutra, no redondees la espalda' });
          score -= 30;
        } else if (spineAngle != null && spineAngle >= 160 && phase !== 'top') {
          feedback.push({ level: 'ok', text: 'Columna neutra — muy bien', speak: null });
        }
      }
      if (pose[L.L_SHOULDER] && pose[L.L_HIP] && phase === 'fondo') {
        const shoulderAhead = pose[L.L_HIP].x - pose[L.L_SHOULDER].x;
        if (Math.abs(shoulderAhead) > 0.12) {
          feedback.push({ level: 'warn', text: 'Hombros muy al frente de caderas — mantén la barra pegada al cuerpo', speak: 'Mantén la barra pegada al cuerpo' });
          score -= 15;
        }
      }
      if (phase === 'bajando') feedback.push({ level: 'info', text: 'Bajando — empuja las caderas hacia atrás, pecho arriba', speak: null });
      if (phase === 'subiendo') feedback.push({ level: 'info', text: 'Subiendo — extiende caderas y rodillas juntas', speak: null });
      if (feedback.filter(f => f.level !== 'info').length === 0 && phase !== 'top') feedback.push({ level: 'ok', text: '¡Excelente técnica en peso muerto!', speak: null });
      return { feedback, score: Math.max(0, score) };
    },
  },

  press_banca: {
    name: 'Press de Banca', emoji: '🏋️',
    cue: 'Cámara lateral — tumbado, cuerpo visible de lado',
    instructions: [
      'Túmbate en el banco, pies planos en el suelo, espalda con curvatura natural.',
      'Agarra la barra un poco más ancha que los hombros, muñecas rectas.',
      'Baja la barra controlando hacia la parte media-inferior del pecho.',
      'Codos a 45-75° del cuerpo (no completamente abiertos ni cerrados).',
      'Empuja la barra hacia arriba y ligeramente atrás, extendiendo casi completamente.',
    ],
    phases: ['top', 'bajando', 'fondo', 'subiendo'],
    repPhase: 'top',
    detect(hist) {
      const elbow = hist.avg('lElbow'); const trend = hist.trend('lElbow');
      if (elbow == null) return 'top';
      if (elbow > 155) return 'top';
      if (elbow <= 155 && trend < -4) return 'bajando';
      if (elbow < 85) return 'fondo';
      if (elbow >= 85 && trend > 4) return 'subiendo';
      return 'fondo';
    },
    analyze(hist, pose, phase) {
      const feedback = []; let score = 100;
      const lElbow = hist.avg('lElbow', 4); const rElbow = hist.avg('rElbow', 4);
      if (phase === 'fondo') {
        [['izquierdo', lElbow], ['derecho', rElbow]].forEach(([side, ang]) => {
          if (ang == null) return;
          if (ang > 90) { feedback.push({ level: 'warn', text: `Codo ${side} muy abierto (${ang.toFixed(0)}°) — mantén 45-75°`, speak: `Cierra el codo ${side}` }); score -= 15; }
          else if (ang < 60) { feedback.push({ level: 'warn', text: `Codo ${side} muy cerrado (${ang.toFixed(0)}°) — abre un poco`, speak: null }); score -= 10; }
        });
      }
      if (pose[L.L_WRIST] && pose[L.L_ELBOW]) {
        if (Math.abs(pose[L.L_WRIST].x - pose[L.L_ELBOW].x) > 0.1) {
          feedback.push({ level: 'warn', text: 'Muñeca izquierda desalineada — mantén muñeca recta sobre el codo', speak: 'Mantén la muñeca recta' });
          score -= 12;
        }
      }
      if (phase === 'top') {
        const ext = lElbow ?? rElbow;
        if (ext != null && ext < 150) { feedback.push({ level: 'warn', text: 'No extiendes completamente — lleva brazos a casi rectos arriba', speak: 'Extiende los brazos completamente arriba' }); score -= 15; }
      }
      if (phase === 'bajando') feedback.push({ level: 'info', text: 'Bajando — codos a 45-75°, baja hasta el pecho', speak: null });
      if (phase === 'subiendo') feedback.push({ level: 'info', text: 'Subiendo — empuja explosivamente, extiende casi completamente', speak: null });
      if (feedback.filter(f => f.level !== 'info').length === 0 && phase !== 'top') feedback.push({ level: 'ok', text: '¡Press perfecto! Buen rango y técnica', speak: null });
      return { feedback, score: Math.max(0, score) };
    },
  },

  curl_biceps: {
    name: 'Curl de Bíceps', emoji: '💪',
    cue: 'De frente o de lado, torso y brazos visibles',
    instructions: [
      'Párate erguido, mancuernas en manos con palmas hacia adelante.',
      'Pega los codos a los costados del cuerpo y no los muevas durante el ejercicio.',
      'Sube el peso contrayendo el bíceps hasta que los codos estén a menos de 60°.',
      'En la parte alta, aprieta el bíceps un segundo antes de bajar.',
      'Baja lentamente y de forma controlada (fase excéntrica), hasta extender completamente.',
    ],
    phases: ['abajo', 'subiendo', 'arriba', 'bajando'],
    repPhase: 'arriba',
    detect(hist) {
      const elbow = hist.avg('lElbow'); const trend = hist.trend('lElbow');
      if (elbow == null) return 'abajo';
      if (elbow > 150) return 'abajo';
      if (elbow <= 150 && trend < -5) return 'subiendo';
      if (elbow < 50) return 'arriba';
      if (elbow >= 50 && trend > 5) return 'bajando';
      return 'subiendo';
    },
    analyze(hist, pose, phase) {
      const feedback = []; let score = 100;
      ['L', 'R'].forEach(s => {
        const shoulder = pose[s === 'L' ? L.L_SHOULDER : L.R_SHOULDER];
        const elbow = pose[s === 'L' ? L.L_ELBOW : L.R_ELBOW];
        const side = s === 'L' ? 'izquierdo' : 'derecho';
        if (shoulder && elbow && Math.abs(shoulder.x - elbow.x) > 0.13) {
          feedback.push({ level: 'crit', text: `Codo ${side} se mueve — pégalo al costado del cuerpo`, speak: `Fija el codo ${side} al cuerpo` });
          score -= 20;
        }
      });
      if (pose[L.L_SHOULDER] && pose[L.L_HIP] && Math.abs(pose[L.L_SHOULDER].x - pose[L.L_HIP].x) > 0.08) {
        feedback.push({ level: 'warn', text: 'Torso balanceándose — usa solo el bíceps, no el cuerpo', speak: 'No te balancees, usa solo el bíceps' });
        score -= 15;
      }
      if (phase === 'abajo') {
        const ext = hist.avg('lElbow', 3);
        if (ext != null && ext < 140) { feedback.push({ level: 'warn', text: 'No bajas completamente — extiende el brazo al máximo abajo', speak: 'Extiende completamente el brazo abajo' }); score -= 15; }
      }
      if (phase === 'arriba') {
        const peak = hist.avg('lElbow', 3);
        if (peak != null && peak > 60) { feedback.push({ level: 'warn', text: 'Sube más — contrae el bíceps hasta menos de 60°', speak: 'Sube más, contrae el bíceps' }); score -= 15; }
        else feedback.push({ level: 'ok', text: 'Contracción completa — excelente', speak: null });
      }
      if (phase === 'subiendo') feedback.push({ level: 'info', text: 'Subiendo — contrae el bíceps, codo fijo', speak: null });
      if (phase === 'bajando') feedback.push({ level: 'info', text: 'Bajando — controla la fase excéntrica', speak: null });
      if (feedback.filter(f => f.level !== 'info').length === 0 && phase !== 'abajo') feedback.push({ level: 'ok', text: '¡Curl perfecto! Técnica impecable', speak: null });
      return { feedback, score: Math.max(0, score) };
    },
  },

  press_hombro: {
    name: 'Press de Hombro', emoji: '🏹',
    cue: 'De frente, torso y brazos completamente visibles',
    instructions: [
      'Siéntate o párate erguido, mancuernas/barra a la altura de los hombros.',
      'Codos a ~90° al inicio, ligeramente por delante del cuerpo.',
      'Empuja hacia arriba de forma controlada, sin arquear la espalda baja.',
      'Aprieta el abdomen durante todo el movimiento para proteger la columna.',
      'Extiende los brazos casi completamente arriba y baja de forma controlada.',
    ],
    phases: ['abajo', 'subiendo', 'arriba', 'bajando'],
    repPhase: 'arriba',
    detect(hist) {
      const elbow = hist.avg('lElbow'); const trend = hist.trend('lElbow');
      if (elbow == null) return 'abajo';
      if (elbow < 100) return 'abajo';
      if (elbow >= 100 && trend > 4) return 'subiendo';
      if (elbow > 155) return 'arriba';
      if (elbow <= 155 && trend < -4) return 'bajando';
      return 'abajo';
    },
    analyze(hist, pose, phase) {
      const feedback = []; let score = 100;
      if (pose[L.L_SHOULDER] && pose[L.L_HIP]) {
        const lean = pose[L.L_HIP].x - pose[L.L_SHOULDER].x;
        if (Math.abs(lean) > 0.1 && (phase === 'subiendo' || phase === 'arriba')) {
          feedback.push({ level: 'crit', text: 'Estás arqueando la espalda — aprieta el abdomen y empuja recto', speak: 'Aprieta el abdomen, no arquees la espalda' });
          score -= 25;
        }
      }
      if (phase === 'abajo') {
        const el = hist.avg('lElbow', 3);
        if (el != null && (el < 70 || el > 110)) { feedback.push({ level: 'warn', text: `Codo en ${el.toFixed(0)}° — posición inicial debe ser ~90°`, speak: null }); score -= 10; }
      }
      if (phase === 'arriba') {
        const el = hist.avg('lElbow', 3);
        if (el != null && el < 155) { feedback.push({ level: 'warn', text: 'No extiendes completamente — sube hasta casi rectos', speak: 'Extiende los brazos completamente arriba' }); score -= 15; }
        else feedback.push({ level: 'ok', text: 'Extensión completa — bien hecho', speak: null });
      }
      if (pose[L.L_WRIST] && pose[L.R_WRIST] && Math.abs(pose[L.L_WRIST].y - pose[L.R_WRIST].y) > 0.08) {
        feedback.push({ level: 'warn', text: 'Asimetría entre brazos — sube ambos al mismo ritmo', speak: 'Mantén los brazos simétricos' });
        score -= 12;
      }
      if (feedback.filter(f => f.level !== 'info').length === 0 && phase !== 'abajo') feedback.push({ level: 'ok', text: '¡Press de hombro perfecto!', speak: null });
      return { feedback, score: Math.max(0, score) };
    },
  },

  zancada: {
    name: 'Zancada', emoji: '🦵',
    cue: 'De lado, cuerpo completo visible — da un paso al frente',
    instructions: [
      'Párate erguido con pies juntos, da un paso largo hacia adelante.',
      'Baja la rodilla trasera hacia el suelo sin llegar a tocarlo.',
      'La rodilla delantera debe estar sobre el tobillo, nunca más adelante.',
      'Mantén el torso vertical durante todo el movimiento.',
      'Empuja con el pie delantero para volver a la posición inicial.',
    ],
    phases: ['top', 'bajando', 'fondo', 'subiendo'],
    repPhase: 'top',
    detect(hist) {
      const knee = hist.avg('lKnee'); const trend = hist.trend('lKnee');
      if (knee == null) return 'top';
      if (knee > 155) return 'top';
      if (knee <= 155 && trend < -4) return 'bajando';
      if (knee < 100) return 'fondo';
      if (knee >= 100 && trend > 4) return 'subiendo';
      return 'fondo';
    },
    analyze(hist, pose, phase) {
      const feedback = []; let score = 100;
      if (pose[L.L_KNEE] && pose[L.L_ANKLE]) {
        const kneeOver = pose[L.L_KNEE].x - pose[L.L_ANKLE].x;
        if (Math.abs(kneeOver) > 0.10 && phase !== 'top') {
          feedback.push({ level: 'crit', text: 'Rodilla delantera pasando el tobillo — da un paso más largo', speak: 'La rodilla no debe pasar el tobillo' });
          score -= 25;
        }
      }
      if (phase === 'fondo') {
        const k = hist.avg('lKnee', 3);
        if (k != null && k > 105) { feedback.push({ level: 'warn', text: 'Baja más — rodilla trasera cerca del suelo', speak: 'Baja más la rodilla trasera' }); score -= 15; }
        else if (k != null) feedback.push({ level: 'ok', text: 'Profundidad correcta', speak: null });
      }
      if (phase === 'bajando') feedback.push({ level: 'info', text: 'Bajando — torso erguido, rodilla sobre tobillo', speak: null });
      if (feedback.filter(f => f.level !== 'info').length === 0 && phase !== 'top') feedback.push({ level: 'ok', text: '¡Zancada perfecta!', speak: null });
      return { feedback, score: Math.max(0, score) };
    },
  },

  plancha: {
    name: 'Plancha', emoji: '🧱',
    cue: 'Cámara lateral — cuerpo horizontal apoyado en manos o codos',
    instructions: [
      'Apóyate en manos o antebrazos y puntillas, cuerpo en línea recta.',
      'Activa el core apretando el abdomen como si fuera a recibir un golpe.',
      'Las caderas no deben caer ni subir demasiado — línea recta de cabeza a talones.',
      'Mantén el cuello neutro, mirando hacia el suelo con la cabeza alineada.',
      'Respira de forma controlada, no contengas el aliento.',
    ],
    phases: ['manteniendo', 'posicion_baja'],
    repPhase: null,
    detect(hist) {
      const hip = hist.avg('lHip', 4);
      if (hip == null) return 'manteniendo';
      return hip >= 155 ? 'manteniendo' : 'posicion_baja';
    },
    analyze(hist, pose, phase) {
      const feedback = []; let score = 100;
      const hipAngle = hist.avg('lHip', 5);
      if (hipAngle != null && hipAngle < 155) {
        feedback.push({ level: 'crit', text: `Caderas caídas (${hipAngle.toFixed(0)}°) — aprieta glúteos y abdomen para subirlas`, speak: 'Sube las caderas, aprieta el abdomen' });
        score -= 35;
      } else if (hipAngle != null && hipAngle > 175) {
        feedback.push({ level: 'warn', text: 'Caderas demasiado elevadas — baja para formar línea recta', speak: 'Baja un poco las caderas' });
        score -= 10;
      }
      if (pose[L.NOSE] && pose[L.L_SHOULDER]) {
        if (pose[L.NOSE].y - pose[L.L_SHOULDER].y > 0.08) {
          feedback.push({ level: 'warn', text: 'Cuello caído — mira hacia el suelo con cuello neutro', speak: 'Mantén el cuello neutro' });
          score -= 12;
        }
      }
      if (score >= 90) feedback.push({ level: 'ok', text: 'Alineación perfecta — mantén el core activado', speak: null });
      return { feedback, score: Math.max(0, score) };
    },
  },

  dominada: {
    name: 'Dominada', emoji: '🤸',
    cue: 'De frente, cuerpo completo visible — colgado de la barra',
    instructions: [
      'Agarra la barra con palmas hacia afuera, manos un poco más anchas que hombros.',
      'Cuélgate completamente, brazos extendidos, core activado.',
      'Jala los codos hacia las caderas (no hacia atrás), llevando el pecho a la barra.',
      'La barbilla debe superar la barra en la parte alta del movimiento.',
      'Baja de forma controlada hasta extender completamente los brazos.',
    ],
    phases: ['abajo', 'subiendo', 'arriba', 'bajando'],
    repPhase: 'arriba',
    detect(hist) {
      const elbow = hist.avg('lElbow'); const trend = hist.trend('lElbow');
      if (elbow == null) return 'abajo';
      if (elbow > 155) return 'abajo';
      if (elbow <= 155 && trend < -5) return 'subiendo';
      if (elbow < 60) return 'arriba';
      if (elbow >= 60 && trend > 5) return 'bajando';
      return 'abajo';
    },
    analyze(hist, pose, phase) {
      const feedback = []; let score = 100;
      if (phase === 'arriba') {
        const el = hist.avg('lElbow', 3);
        if (el != null && el > 65) { feedback.push({ level: 'warn', text: 'Sube más — la barbilla debe pasar la barra', speak: 'Sube más, barbilla sobre la barra' }); score -= 20; }
        else feedback.push({ level: 'ok', text: 'Llegaste arriba — excelente', speak: null });
      }
      if (phase === 'abajo') {
        const el = hist.avg('lElbow', 3);
        if (el != null && el < 150) { feedback.push({ level: 'warn', text: 'Extiende completamente los brazos al bajar', speak: 'Extiende los brazos completamente abajo' }); score -= 15; }
      }
      if (pose[L.L_SHOULDER] && pose[L.R_SHOULDER] && Math.abs(pose[L.L_SHOULDER].y - pose[L.R_SHOULDER].y) > 0.07) {
        feedback.push({ level: 'warn', text: 'Desequilibrio lateral — tira de forma simétrica', speak: 'Tira parejo con ambos lados' });
        score -= 12;
      }
      if (pose[L.L_KNEE] && pose[L.R_KNEE] && Math.abs(pose[L.L_KNEE].x - pose[L.R_KNEE].x) > 0.15) {
        feedback.push({ level: 'warn', text: 'Piernas balanceándose — mantenlas juntas y quietas', speak: 'Quieta las piernas' });
        score -= 10;
      }
      if (phase === 'subiendo') feedback.push({ level: 'info', text: 'Subiendo — jala los codos hacia las caderas', speak: null });
      if (phase === 'bajando') feedback.push({ level: 'info', text: 'Bajando — controla la fase, no te sueltes', speak: null });
      if (feedback.filter(f => f.level !== 'info').length === 0 && phase !== 'abajo') feedback.push({ level: 'ok', text: '¡Dominada perfecta!', speak: null });
      return { feedback, score: Math.max(0, score) };
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// NAME → EXERCISE KEY MAPPING (flexible matching)
// ─────────────────────────────────────────────────────────────────────────────
const nameToKey = (name) => {
  if (!name) return null;
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (n.includes('sentadilla') || n.includes('squat')) return 'sentadilla';
  if (n.includes('peso muerto') || n.includes('deadlift')) return 'peso_muerto';
  if (n.includes('banca') || n.includes('bench')) return 'press_banca';
  if (n.includes('bicep') || n.includes('biceps') || n.includes('curl')) return 'curl_biceps';
  if (n.includes('hombro') || n.includes('shoulder') || n.includes('press')) return 'press_hombro';
  if (n.includes('zancada') || n.includes('lunge')) return 'zancada';
  if (n.includes('plancha') || n.includes('plank')) return 'plancha';
  if (n.includes('dominada') || n.includes('pull')) return 'dominada';
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// TTS QUEUE
// ─────────────────────────────────────────────────────────────────────────────
const LEVEL_PRIORITY = { crit: 3, warn: 2, info: 1, ok: 0 };
const SPEAK_COOLDOWN = 5000;

class TTSQueue {
  constructor() { this.lastSpoken = {}; this.speaking = false; }
  speak(items, enabled) {
    if (!enabled || !window.speechSynthesis) return;
    const candidates = items.filter(i => i.speak).sort((a, b) => (LEVEL_PRIORITY[b.level] || 0) - (LEVEL_PRIORITY[a.level] || 0));
    for (const item of candidates) {
      if (Date.now() - (this.lastSpoken[item.speak] || 0) > SPEAK_COOLDOWN) {
        if (!window.speechSynthesis.speaking) {
          const utt = new SpeechSynthesisUtterance(item.speak);
          utt.lang = 'es-ES'; utt.rate = 1.0;
          utt.onend = () => { this.speaking = false; };
          this.speaking = true;
          this.lastSpoken[item.speak] = Date.now();
          window.speechSynthesis.speak(utt);
        }
        break;
      }
    }
  }
  cancel() { this.speaking = false; window.speechSynthesis?.cancel(); }
  reset() { this.lastSpoken = {}; this.cancel(); }
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON DRAWING
// ─────────────────────────────────────────────────────────────────────────────
const PHASE_COLORS = {
  bajando: '#fbbf24', subiendo: '#4ade80', fondo: '#f87171',
  arriba: '#a78bfa', top: '#6EC8E0', abajo: '#6EC8E0',
  manteniendo: '#4ade80', posicion_baja: '#f87171', default: '#6EC8E0',
};

function drawSkeleton(canvas, video, landmarks, phase) {
  const W = video.videoWidth; const H = video.videoHeight;
  if (!W || !H) return;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  if (!landmarks?.length) return;
  const pose = landmarks[0];
  const color = PHASE_COLORS[phase] || PHASE_COLORS.default;
  ctx.lineWidth = 3.5; ctx.strokeStyle = color + 'cc'; ctx.lineCap = 'round';
  CONNECTIONS.forEach(([i, j]) => {
    const a = pose[i], b = pose[j];
    if (!a || !b) return;
    ctx.beginPath(); ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H); ctx.stroke();
  });
  pose.forEach((pt, idx) => {
    if (!pt) return;
    const r = [L.L_SHOULDER, L.R_SHOULDER, L.L_HIP, L.R_HIP, L.L_KNEE, L.R_KNEE, L.L_ELBOW, L.R_ELBOW].includes(idx) ? 7 : 4;
    ctx.beginPath(); ctx.arc(pt.x * W, pt.y * H, r, 0, 2 * Math.PI);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE RING
// ─────────────────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 68 }) => {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#4ade80' : score >= 55 ? '#fbbf24' : '#f87171';
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }} />
      </svg>
      <div className="label">
        <div style={{ color, fontSize: 15, fontWeight: 800, lineHeight: 1 }}>{score}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 1 }}>forma</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REST TIMER RING
// ─────────────────────────────────────────────────────────────────────────────
const RestRing = ({ current, total }) => {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const pct = current / total;
  const color = current > total * 0.5 ? '#6EC8E0' : current > total * 0.25 ? '#fbbf24' : '#f87171';
  return (
    <div className="rest-ring" style={{ width: 160, height: 160, margin: '0 auto' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} />
      </svg>
      <div className="rest-ring-label" style={{ color }}>{current}</div>
    </div>
  );
};

// ── IA: envía ángulos al backend y recibe corrección ──────
// ── Detecta el grupo muscular / tipo de movimiento ────────
const getExerciseGroup = (exerciseName) => {
  const n = (exerciseName || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar tildes

  // PIERNAS
  if (n.includes('sentadilla') || n.includes('squat') ||
    n.includes('zancada') || n.includes('lunge') ||
    n.includes('leg press') || n.includes('hip thrust') ||
    n.includes('peso muerto') || n.includes('deadlift') ||
    n.includes('rumano')) return 'piernas';

  // EMPUJE HORIZONTAL (pecho)
  if (n.includes('banca') || n.includes('bench') ||
    n.includes('press') && (n.includes('pecho') || n.includes('inclinado')))
    return 'empuje_horizontal';

  // EMPUJE VERTICAL (hombros)
  if (n.includes('militar') || n.includes('hombro') || n.includes('shoulder') ||
    n.includes('press') && !n.includes('banca') && !n.includes('bench'))
    return 'empuje_vertical';

  // JALÓN / TIRÓN VERTICAL (espalda vertical)
  if (n.includes('jalon') || n.includes('jalón') || n.includes('polea') && n.includes('pecho') ||
    n.includes('dominada') || n.includes('pull'))
    return 'jalon_vertical';

  // REMO / TIRÓN HORIZONTAL (espalda horizontal)
  if (n.includes('remo') || n.includes('row') ||
    n.includes('polea') && n.includes('baja'))
    return 'remo';

  // CURL / BÍCEPS
  if (n.includes('curl') || n.includes('bicep') || n.includes('biceps'))
    return 'curl';

  // TRÍCEPS
  if (n.includes('tricep') || n.includes('triceps') ||
    n.includes('extension') || n.includes('fondo') ||
    n.includes('trasnuca'))
    return 'triceps';

  // CORE / PLANCHA
  if (n.includes('plancha') || n.includes('plank') ||
    n.includes('abdominal') || n.includes('core') ||
    n.includes('crunch') || n.includes('bicicleta'))
    return 'core';

  // Si no matchea nada → tratar como piernas (más genérico)
  return 'piernas';
};

// ── Mapea ángulos de MediaPipe según el grupo muscular ────
const getAnglesForExercise = (angles, exerciseName, pose) => {
  const group = getExerciseGroup(exerciseName);

  // Helper para distancia lateral de un punto respecto a otro
  const lateralDist = (idxA, idxB) => {
    if (!pose || !pose[idxA] || !pose[idxB]) return 0.03;
    return Math.abs(pose[idxA].x - pose[idxB].x);
  };
  const verticalDist = (idxA, idxB) => {
    if (!pose || !pose[idxA] || !pose[idxB]) return 0.03;
    return Math.abs(pose[idxA].y - pose[idxB].y);
  };

  switch (group) {

    // ── PIERNAS (sentadilla, peso muerto, zancada, etc.) ───
    case 'piernas':
      return {
        knee_l: angles.lKnee ?? 90,
        knee_r: angles.rKnee ?? 90,
        valgus_l: lateralDist(L.L_KNEE, L.L_ANKLE),
        valgus_r: lateralDist(L.R_KNEE, L.R_ANKLE),
        shoulder_sym: verticalDist(L.L_SHOULDER, L.R_SHOULDER),
        hip_angle: angles.lHip ?? 85,
      };

    // ── EMPUJE HORIZONTAL (press banca, press inclinado) ───
    case 'empuje_horizontal':
      return {
        knee_l: angles.lElbow ?? 90,   // ángulo codo
        knee_r: angles.rElbow ?? 90,
        valgus_l: lateralDist(L.L_WRIST, L.L_ELBOW),  // muñeca alineada
        valgus_r: lateralDist(L.R_WRIST, L.R_ELBOW),
        shoulder_sym: verticalDist(L.L_SHOULDER, L.R_SHOULDER),
        hip_angle: angles.lElbow ?? 160,  // extensión final
      };

    // ── EMPUJE VERTICAL (press militar, press hombro) ─────
    case 'empuje_vertical':
      return {
        knee_l: angles.lElbow ?? 90,
        knee_r: angles.rElbow ?? 90,
        valgus_l: lateralDist(L.L_WRIST, L.L_ELBOW),
        valgus_r: lateralDist(L.R_WRIST, L.R_ELBOW),
        shoulder_sym: lateralDist(L.L_SHOULDER, L.L_HIP), // arqueo espalda
        hip_angle: angles.lElbow ?? 155,
      };

    // ── JALÓN VERTICAL (jalón al pecho, dominadas) ────────
    case 'jalon_vertical':
      return {
        knee_l: angles.lElbow ?? 90,
        knee_r: angles.rElbow ?? 90,
        valgus_l: verticalDist(L.L_SHOULDER, L.R_SHOULDER), // asimetría
        valgus_r: lateralDist(L.L_KNEE, L.R_KNEE),          // piernas quietas
        shoulder_sym: verticalDist(L.L_SHOULDER, L.R_SHOULDER),
        hip_angle: angles.lHip ?? 170,
      };

    // ── REMO (remo con barra, remo en polea) ──────────────
    case 'remo':
      return {
        knee_l: angles.lElbow ?? 90,
        knee_r: angles.rElbow ?? 90,
        valgus_l: lateralDist(L.L_SHOULDER, L.L_HIP),  // espalda recta
        valgus_r: lateralDist(L.R_SHOULDER, L.R_HIP),
        shoulder_sym: verticalDist(L.L_SHOULDER, L.R_SHOULDER),
        hip_angle: angles.lHip ?? 75,  // inclinación hacia adelante
      };

    // ── CURL (curl bíceps con barra, barra Z, mancuernas) ─
    case 'curl':
      return {
        knee_l: angles.lElbow ?? 90,   // ángulo codo izq
        knee_r: angles.rElbow ?? 90,   // ángulo codo der
        valgus_l: lateralDist(L.L_SHOULDER, L.L_ELBOW),  // codo fijo
        valgus_r: lateralDist(L.R_SHOULDER, L.R_ELBOW),
        shoulder_sym: lateralDist(L.L_SHOULDER, L.L_HIP),    // balanceo torso
        hip_angle: angles.lHip ?? 170,  // torso erguido
      };

    // ── TRÍCEPS (extensión polea, trasnuca, fondos) ───────
    case 'triceps':
      return {
        knee_l: angles.lElbow ?? 160,  // extensión codo
        knee_r: angles.rElbow ?? 160,
        valgus_l: lateralDist(L.L_SHOULDER, L.L_ELBOW),  // codo pegado
        valgus_r: lateralDist(L.R_SHOULDER, L.R_ELBOW),
        shoulder_sym: verticalDist(L.L_SHOULDER, L.R_SHOULDER), // hombro estable
        hip_angle: angles.lHip ?? 170,
      };

    // ── CORE (plancha, crunch, bicicleta abdominal) ───────
    case 'core':
      return {
        knee_l: angles.lKnee ?? 175,
        knee_r: angles.rKnee ?? 175,
        valgus_l: 0.01,
        valgus_r: 0.01,
        shoulder_sym: verticalDist(L.L_SHOULDER, L.R_SHOULDER),
        hip_angle: angles.lHip ?? 170,  // alineación cadera
      };

    default:
      return {
        knee_l: angles.lKnee ?? 90,
        knee_r: angles.rKnee ?? 90,
        valgus_l: 0.03,
        valgus_r: 0.03,
        shoulder_sym: 0.02,
        hip_angle: angles.lHip ?? 90,
      };
  }
};

// ── Envía al backend y recibe la corrección ───────────────
const analyzeWithAI = async (angles, exerciseName, exDef, hist, pose, phase) => {
  try {
    const token = localStorage.getItem('access_token');
    const mappedAngles = getAnglesForExercise(angles, exerciseName, pose);

    const response = await fetch('/api/training/analyze-pose/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        exercise: exerciseName,
        exercise_group: getExerciseGroup(exerciseName), // extra info para el backend
        angles: mappedAngles,
      }),
    });

    if (!response.ok) throw new Error(`Backend ${response.status}`);
    const data = await response.json();

    const level = data.has_error
      ? (data.confidence > 0.85 ? 'crit' : 'warn')
      : 'ok';

    const feedback = [{
      level,
      text: `[IA] ${data.message}`,
      speak: data.has_error ? data.message : null,
    }];

    const score = data.has_error
      ? Math.round(100 - data.confidence * 40)
      : 100;

    return { feedback, score };

  } catch (err) {
    console.warn('[IA] Usando análisis local:', err.message);
    return exDef.analyze(hist, pose, phase);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ExerciseCorrector = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [exerciseInfo, setExerciseInfo] = useState(null);

  // ── Exercise info from URL ──
  const exerciseNameParam = searchParams.get('exerciseName') || '';
  const exerciseIdParam = parseInt(searchParams.get('exerciseId') || '0');
  const totalSets = parseInt(searchParams.get('sets') || '3');
  const targetReps = parseInt(searchParams.get('reps') || '10');
  const restSeconds = parseInt(searchParams.get('restSeconds') || '60');
  const gifUrl = searchParams.get('gifUrl') || null;
  const nextExercise = searchParams.get('nextExercise') ? JSON.parse(decodeURIComponent(searchParams.get('nextExercise'))) : null;

  // Resolve exercise key from name
  const resolvedKey = nameToKey(exerciseNameParam);
  const exDef = EXERCISES[resolvedKey] || EXERCISES['sentadilla'];

  // ── Camera / AI state ──
  const [cameraActive, setCameraActive] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [phase, setPhase] = useState('top');
  const [feedback, setFeedback] = useState([]);
  const [score, setScore] = useState(100);
  const [repCount, setRepCount] = useState(0);
  const [repScores, setRepScores] = useState([]);
  const [poseDetected, setPoseDetected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Cargando modelo de poses...');

  // ── Sets / Reps tracking ──
  const [currentSet, setCurrentSet] = useState(1);
  // overlay: null | 'rest' | 'set_done' | 'exercise_done'
  const [overlay, setOverlay] = useState(null);
  const [restTimeLeft, setRestTimeLeft] = useState(restSeconds);
  const restIntervalRef = useRef(null);

  // ── Refs ──
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const landmarkerRef = useRef(null);
  const cameraActiveRef = useRef(false);
  const voiceRef = useRef(true);
  const historyRef = useRef(new AngleHistory());
  const ttsRef = useRef(new TTSQueue());
  const prevPhaseRef = useRef(null);
  const repScoreAccRef = useRef([]);
  // track reps within current set
  const setRepCountRef = useRef(0);

  const lastAiCallRef = useRef(0);

  useEffect(() => { cameraActiveRef.current = cameraActive; }, [cameraActive]);

  useEffect(() => {
    if (!exerciseNameParam) return;
    const token = localStorage.getItem('access_token');
    fetch(`/api/training/exercise-info/?name=${encodeURIComponent(exerciseNameParam)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (!data.error) setExerciseInfo(data); })
      .catch(() => { });
  }, [exerciseNameParam]);

  useEffect(() => { voiceRef.current = voiceEnabled; }, [voiceEnabled]);

  // ── Rep count within current set ──
  const [setRepsDone, setSetRepsDone] = useState(0);

  // Reset when exercise changes
  useEffect(() => {
    historyRef.current = new AngleHistory();
    ttsRef.current.reset();
    setPhase('top'); setFeedback([]); setScore(100);
    setRepCount(0); setRepScores([]);
    prevPhaseRef.current = null;
    repScoreAccRef.current = [];
    setRepCountRef.current = 0;
    setCurrentSet(1); setSetRepsDone(0); setOverlay(null);
  }, [resolvedKey]);

  // ── Load MediaPipe ──
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setStatusMsg('Descargando modelo de poses...');
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO', numPoses: 1,
        });
        if (cancelled) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        setModelReady(true);
        setStatusMsg('Modelo listo — activa la cámara para comenzar');
      } catch (err) {
        if (!cancelled) { setModelError(true); setStatusMsg('Error al cargar el modelo. Recarga la página.'); }
      }
    };
    load();
    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  // ── Handle rep completion → set tracking ──
  const handleRepCompleted = useCallback((repScore) => {
    setRepCountRef.current += 1;
    const newSetReps = setRepCountRef.current;
    setSetRepsDone(newSetReps);

    if (newSetReps >= targetReps) {
      // Set completed
      setRepCountRef.current = 0;
      setSetRepsDone(0);

      if (currentSet >= totalSets) {
        // All sets done!
        stopCamera();
        setOverlay('exercise_done');
      } else {
        // Start rest period
        stopCamera();
        setOverlay('rest');
        setRestTimeLeft(restSeconds);

        let remaining = restSeconds;
        restIntervalRef.current = setInterval(() => {
          remaining -= 1;
          setRestTimeLeft(remaining);
          if (remaining <= 0) {
            clearInterval(restIntervalRef.current);
            restIntervalRef.current = null;
            setCurrentSet(s => s + 1);
            setOverlay('set_done');
          }
        }, 1000);
      }
    }
  }, [currentSet, totalSets, targetReps, restSeconds]);

  // ── Detection loop ──
  const runDetection = useCallback(() => {
    if (!cameraActiveRef.current) return;
    const video = videoRef.current; const landmarker = landmarkerRef.current;
    if (!landmarker || !video || video.readyState < 2 || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(runDetection); return;
    }
    try {
      const now = performance.now();
      const results = landmarker.detectForVideo(video, now);
      const pose = results.landmarks?.[0];
      if (pose) {
        setPoseDetected(true);
        const angles = {
          lElbow: angle3(pose[L.L_SHOULDER], pose[L.L_ELBOW], pose[L.L_WRIST]),
          rElbow: angle3(pose[L.R_SHOULDER], pose[L.R_ELBOW], pose[L.R_WRIST]),
          lKnee: angle3(pose[L.L_HIP], pose[L.L_KNEE], pose[L.L_ANKLE]),
          rKnee: angle3(pose[L.R_HIP], pose[L.R_KNEE], pose[L.R_ANKLE]),
          lHip: angle3(pose[L.L_SHOULDER], pose[L.L_HIP], pose[L.L_KNEE]),
          rHip: angle3(pose[L.R_SHOULDER], pose[L.R_HIP], pose[L.R_KNEE]),
          lAnkle: angle3(pose[L.L_KNEE], pose[L.L_ANKLE], pose[L.L_HEEL]),
          torsoLean: angle3(pose[L.L_SHOULDER], pose[L.L_HIP], pose[L.L_KNEE]),
        };
        historyRef.current.push(angles);
        const newPhase = exDef.detect(historyRef.current);

        // Rep counting
        if (exDef.repPhase && newPhase === exDef.repPhase &&
          prevPhaseRef.current !== null && prevPhaseRef.current !== exDef.repPhase) {
          const repScore = repScoreAccRef.current.length
            ? Math.round(repScoreAccRef.current.reduce((a, b) => a + b, 0) / repScoreAccRef.current.length)
            : 100;
          repScoreAccRef.current = [];
          setRepCount(r => r + 1);
          setRepScores(rs => [...rs.slice(-9), repScore]);
          handleRepCompleted(repScore);
        }
        prevPhaseRef.current = newPhase;

        // Llamar al backend de IA máx cada 500ms
        // Llamar al backend de IA máx cada 500ms
        const nowMs = Date.now();
        if (nowMs - lastAiCallRef.current > 500) {
          lastAiCallRef.current = nowMs;
          analyzeWithAI(angles, resolvedKey, exDef, historyRef.current, pose, newPhase)
            .then(({ feedback: aiFeedback, score: aiScore }) => {
              setFeedback(aiFeedback);
              setScore(aiScore);
              repScoreAccRef.current.push(aiScore);
              ttsRef.current.speak(aiFeedback, voiceRef.current);
              drawSkeleton(canvasRef.current, video, results.landmarks, newPhase);
            })
            .catch(err => {
              console.warn('Error en IA, usando análisis local:', err);
              const { feedback: localFB, score: localScore } = exDef.analyze(historyRef.current, pose, newPhase);
              setFeedback(localFB);
              setScore(localScore);
              repScoreAccRef.current.push(localScore);
              ttsRef.current.speak(localFB, voiceRef.current);
              drawSkeleton(canvasRef.current, video, results.landmarks, newPhase);
            });
        } else {
          // Si no toca llamar a IA, usar el análisis local (para mantener la detección fluida)
          const { feedback: localFB, score: localScore } = exDef.analyze(historyRef.current, pose, newPhase);
          setFeedback(localFB);
          setScore(localScore);
          repScoreAccRef.current.push(localScore);
          ttsRef.current.speak(localFB, voiceRef.current);
          drawSkeleton(canvasRef.current, video, results.landmarks, newPhase);
        }
      } else {
        setPoseDetected(false); setFeedback([]);
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    } catch (_) { }
    rafRef.current = requestAnimationFrame(runDetection);
  }, [exDef, handleRepCompleted]);

  // ── Camera controls ──
  const startCamera = async () => {
    if (!modelReady) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      cameraActiveRef.current = true;
      setCameraActive(true);
      setStatusMsg('Cámara activa — analizando movimiento...');
      rafRef.current = requestAnimationFrame(runDetection);
    } catch (err) { setStatusMsg(`Error de cámara: ${err.message}`); }
  };

  const stopCamera = () => {
    cameraActiveRef.current = false;
    setCameraActive(false);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPoseDetected(false); setFeedback([]);
    ttsRef.current.cancel();
  };

  // ── Mark exercise as completed and navigate to next ──
  const handleFinishExercise = async () => {
    if (exerciseIdParam) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.post('/api/training/toggle-completion/', {
          exercise_id: exerciseIdParam, completed: true
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) { console.error('Error marking complete:', err); }
    }

    if (nextExercise) {
      const params = new URLSearchParams({
        exerciseName: nextExercise.exercise_name,
        exerciseId: nextExercise.exercise_id,
        sets: nextExercise.sets,
        reps: nextExercise.reps,
        restSeconds: nextExercise.rest_seconds,
      });
      if (nextExercise.gif_url) params.set('gifUrl', nextExercise.gif_url);
      navigate(`/corrector?${params.toString()}`);
    } else {
      navigate('/socio/dashboard');
    }
  };

  // ── Start next set after rest ──
  const handleStartNextSet = () => {
    setOverlay(null);
    historyRef.current = new AngleHistory();
    ttsRef.current.reset();
    startCamera();
  };

  const phaseColor = PHASE_COLORS[phase] || PHASE_COLORS.default;
  const avgScore = repScores.length ? Math.round(repScores.reduce((a, b) => a + b, 0) / repScores.length) : null;
  const statusColor = statusMsg.startsWith('Error') ? '#f87171'
    : (statusMsg.includes('Cargando') || statusMsg.includes('Descargando')) ? '#fbbf24' : '#4ade80';

  // ── Loading ──
  if (!modelReady && !modelError) {
    return (
      <div className="corrector-root" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{globalStyles}</style>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p className="heading" style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>Corrector Biomecánico</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{statusMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="corrector-root" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{globalStyles}</style>

      {/* ── REST OVERLAY ── */}
      {overlay === 'rest' && (
        <div className="overlay-modal">
          <div className="modal-box">
            <div style={{ color: '#6EC8E0', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✅ Set {currentSet - 1} de {totalSets} completado
            </div>
            <h3 className="heading" style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>
              Tiempo de descanso
            </h3>
            <RestRing current={restTimeLeft} total={restSeconds} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 20 }}>
              Prepárate para el set {currentSet} de {totalSets}
            </p>
          </div>
        </div>
      )}

      {/* ── NEXT SET OVERLAY ── */}
      {overlay === 'set_done' && (
        <div className="overlay-modal">
          <div className="modal-box">
            <div style={{ fontSize: 48, marginBottom: 12 }}>💪</div>
            <h3 className="heading" style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              ¡Descanso terminado!
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 }}>
              Iniciando <strong style={{ color: '#6EC8E0' }}>Set {currentSet}</strong> de <strong style={{ color: '#6EC8E0' }}>{totalSets}</strong>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn-primary" onClick={handleStartNextSet} style={{ fontSize: 15, padding: '12px 32px' }}>
                <Play size={18} /> Comenzar set {currentSet}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXERCISE DONE OVERLAY ── */}
      {overlay === 'exercise_done' && (
        <div className="overlay-modal">
          <div className="modal-box">
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
            <h3 className="heading" style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              ¡Ejercicio completado!
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
              Completaste todos los <strong style={{ color: '#6EC8E0' }}>{totalSets} sets</strong> de <strong style={{ color: '#6EC8E0' }}>{targetReps} reps</strong>
            </p>
            {avgScore != null && (
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>
                Puntuación de forma promedio: <strong style={{ color: avgScore >= 80 ? '#4ade80' : avgScore >= 55 ? '#fbbf24' : '#f87171' }}>{avgScore}/100</strong>
              </p>
            )}
            <div style={{
              background: 'rgba(110,200,224,0.1)', border: '1px solid rgba(110,200,224,0.25)',
              borderRadius: 14, padding: '12px 16px', marginBottom: 24,
              color: 'rgba(255,255,255,0.65)', fontSize: 13
            }}>
              <Timer size={14} style={{ display: 'inline', marginRight: 6, color: '#6EC8E0' }} />
              Descansa 3 minutos antes del siguiente ejercicio
            </div>
            <button
              className="btn-primary"
              onClick={handleFinishExercise}
              style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px' }}
            >
              {nextExercise ? (
                <><ChevronRight size={18} /> Ir al siguiente ejercicio</>
              ) : (
                <><CheckCircle size={18} /> Volver al dashboard</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        padding: '10px 20px',
        background: 'rgba(7,18,42,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0, gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={17} />
          </button>
          <div>
            <div className="heading" style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>
              {exDef.emoji} {exerciseNameParam || exDef.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 1 }}>
              Set {currentSet}/{totalSets} · {setRepsDone}/{targetReps} reps · {restSeconds}s descanso
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Set progress pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalSets }, (_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i + 1 < currentSet ? '#4ade80' : i + 1 === currentSet ? '#6EC8E0' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          <button className="btn-icon" onClick={() => setVoiceEnabled(v => !v)} title={voiceEnabled ? 'Silenciar' : 'Activar voz'}>
            {voiceEnabled ? <Volume2 size={17} color="#6EC8E0" /> : <VolumeX size={17} color="rgba(255,255,255,0.35)" />}
          </button>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', gap: 14, padding: '14px 16px', overflow: 'hidden' }}>

        {/* ── LEFT COLUMN: GIF reference + Camera ── */}
        <div style={{ flex: '0 0 auto', width: '42%', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* GIF reference */}
          {gifUrl && (
            <div style={{ flexShrink: 0 }}>
              <div style={{ color: 'rgba(110,200,224,0.7)', fontSize: 10, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Dumbbell size={11} color="#6EC8E0" /> Técnica de referencia
              </div>
              <div className="gif-frame" style={{ height: 180 }}>
                <img src={gifUrl} alt="Técnica del ejercicio" />
              </div>
            </div>
          )}

          {/* Camera */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            <div style={{ color: 'rgba(110,200,224,0.7)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <Camera size={11} color="#6EC8E0" /> Tu cámara
            </div>
            <div style={{
              position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000',
              border: `1px solid ${poseDetected ? phaseColor + '66' : 'rgba(110,200,224,0.2)'}`,
              boxShadow: poseDetected ? `0 0 20px ${phaseColor}22` : '0 8px 32px rgba(0,0,0,0.5)',
              transition: 'border-color 0.4s, box-shadow 0.4s',
              flex: 1, minHeight: gifUrl ? 0 : 200,
            }}>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

              {cameraActive && poseDetected && (
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                  <div className="phase-badge" style={{
                    background: phaseColor + '22', border: `1px solid ${phaseColor}55`, color: phaseColor,
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: phaseColor, animation: 'pulse 1.5s infinite' }} />
                    {phase.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              )}

              {cameraActive && !poseDetected && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(251,191,36,0.3)',
                  borderRadius: 8, padding: '3px 8px',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fbbf24', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ color: '#fbbf24', fontSize: 10, fontWeight: 600 }}>Buscando pose...</span>
                </div>
              )}

              {/* Reps counter in camera */}
              {cameraActive && exDef.repPhase && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(7,18,42,0.82)',
                  border: '1px solid rgba(110,200,224,0.25)',
                  borderRadius: 10, padding: '5px 10px',
                  backdropFilter: 'blur(8px)', textAlign: 'center',
                }}>
                  <div className="heading" style={{ color: '#6EC8E0', fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
                    {setRepsDone}<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>/{targetReps}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 1 }}>reps</div>
                </div>
              )}
            </div>

            {/* Camera button */}
            <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              {!cameraActive ? (
                <button className="btn-primary" onClick={startCamera} disabled={!modelReady} style={{ fontSize: 13, padding: '9px 20px' }}>
                  <Camera size={15} /> Activar cámara
                </button>
              ) : (
                <button className="btn-danger" onClick={stopCamera} style={{ fontSize: 13, padding: '9px 20px' }}>
                  <StopCircle size={15} /> Detener
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Info ── */}
        <div className="slim-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', minWidth: 0 }}>

          {/* Score + Stats row */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <div className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <ScoreRing score={score} size={64} />
              <div>
                <div className="heading" style={{ color: 'white', fontWeight: 700, fontSize: 11 }}>Forma actual</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>
                  {score >= 85 ? '🟢 Excelente' : score >= 65 ? '🟡 Mejorable' : '🔴 Corregir'}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 8 }}>
              <div className="stat-chip">
                <Repeat2 size={13} color="#6EC8E0" />
                <div className="heading" style={{ color: 'white', fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{repCount}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10 }}>reps totales</div>
              </div>
              {avgScore != null && (
                <div className="stat-chip">
                  <Award size={13} color="#fbbf24" />
                  <div className="heading" style={{ color: '#fbbf24', fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{avgScore}</div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10 }}>prom. forma</div>
                </div>
              )}
            </div>
          </div>

          {/* Rep score dots */}
          {repScores.length > 0 && (
            <div className="glass-card" style={{ padding: '10px 14px', flexShrink: 0 }}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginBottom: 7 }}>Historial de reps</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {repScores.map((s, i) => (
                  <div key={i} style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: s >= 80 ? 'rgba(74,222,128,0.2)' : s >= 55 ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)',
                    border: `1.5px solid ${s >= 80 ? '#4ade80' : s >= 55 ? '#fbbf24' : '#f87171'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: s >= 80 ? '#4ade80' : s >= 55 ? '#fbbf24' : '#f87171' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOW TO DO IT — instructions */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', flexShrink: 0 }}>
            <div
              onClick={() => setInstructionsOpen(!instructionsOpen)}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'rgba(110,200,224,0.03)',
                borderBottom: instructionsOpen ? '1px solid rgba(110,200,224,0.15)' : 'none',
              }}
            >
              <div style={{ color: '#6EC8E0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                📋 Cómo realizarlo
              </div>
              {instructionsOpen ? <ChevronUp size={16} color="#6EC8E0" /> : <ChevronDown size={16} color="#6EC8E0" />}
            </div>
            {instructionsOpen && (
              <div style={{ padding: '12px 16px 16px 16px' }}>
                {(exerciseInfo?.description
                  ? exerciseInfo.description.split('\n').filter(Boolean)
                  : exDef.instructions
                ).map((step, i) => (
                  <div key={i} className="instr-step">
                    <div className="step-num">{i + 1}</div>
                    <span>{step}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, padding: '7px 10px', background: 'rgba(110,200,224,0.08)', borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                  📸 {exerciseInfo?.description ? `Grupo muscular: ${exerciseInfo.muscle_group}` : exDef.cue}
                </div>
              </div>
            )}
          </div>

          {/* Feedback panel */}
          <div className="glass-card" style={{ padding: '14px 16px', flex: 1, minHeight: 120 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Activity size={15} color="#6EC8E0" />
              <span className="heading" style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>Correcciones en tiempo real</span>
            </div>
            {!cameraActive && (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Activa la cámara para comenzar el análisis.</p>
            )}
            {cameraActive && !poseDetected && (
              <p className="pulse" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                🔍 Asegúrate de que tu cuerpo completo sea visible y bien iluminado.
              </p>
            )}
            {cameraActive && poseDetected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {feedback.length === 0 && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Analizando...</p>}
                {feedback.map((fb, i) => (
                  <div key={i} className={`fb-${fb.level}`}>
                    {fb.level === 'crit' && <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />}
                    {fb.level === 'warn' && <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />}
                    {fb.level === 'ok' && <CheckCircle size={12} style={{ flexShrink: 0 }} />}
                    {fb.level === 'info' && <Activity size={12} style={{ flexShrink: 0, marginTop: 2 }} />}
                    <span>{fb.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="glass-card" style={{ padding: '8px 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={11} color="#6EC8E0" />
              <span style={{ color: statusColor, fontSize: 11 }}>{statusMsg}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCorrector;