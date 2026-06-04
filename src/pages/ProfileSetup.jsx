// src/pages/ProfileSetup.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, Sphere, Box, Cylinder, Torus, TorusKnot, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import {
  ChevronRight, ChevronLeft, Volume2, VolumeX,
  Dumbbell, Flame, Activity, Heart, Zap, TrendingUp, Trophy,
  User, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #07122a;
    --blue: #1A4B8C;
    --cyan: #6EC8E0;
    --cyan-dim: rgba(110,200,224,0.12);
    --cyan-border: rgba(110,200,224,0.28);
    --glass: rgba(255,255,255,0.05);
    --glass-border: rgba(255,255,255,0.10);
    --text-primary: rgba(255,255,255,0.95);
    --text-secondary: rgba(255,255,255,0.50);
    --text-muted: rgba(255,255,255,0.28);
  }

  .ps-root {
    font-family: 'DM Sans', sans-serif;
    background: radial-gradient(ellipse at 20% 20%, #0d1f4a 0%, #07122a 50%, #020b1a 100%);
    min-height: 100vh;
    overflow: hidden;
  }
  .heading { font-family: 'Syne', sans-serif; }

  .ps-scroll::-webkit-scrollbar { width: 3px; }
  .ps-scroll::-webkit-scrollbar-track { background: transparent; }
  .ps-scroll::-webkit-scrollbar-thumb { background: rgba(110,200,224,0.3); border-radius: 4px; }

  .glass-card {
    background: rgba(10,20,50,0.55);
    backdrop-filter: blur(14px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
  }

  .opt-tile {
    cursor: pointer;
    border-radius: 16px;
    border: 2px solid var(--glass-border);
    background: rgba(0,0,0,0.25);
    transition: all 0.22s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 18px 12px;
    user-select: none;
  }
  .opt-tile:hover {
    border-color: var(--cyan-border);
    background: rgba(110,200,224,0.06);
    transform: translateY(-2px);
  }
  .opt-tile.selected {
    border-color: var(--cyan);
    background: rgba(110,200,224,0.14);
    box-shadow: 0 0 20px rgba(110,200,224,0.18);
  }

  .pill-btn {
    cursor: pointer;
    border-radius: 12px;
    border: 1.5px solid var(--glass-border);
    background: rgba(0,0,0,0.2);
    color: var(--text-secondary);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    transition: all 0.2s;
    padding: 10px 0;
    flex: 1;
    text-align: center;
  }
  .pill-btn:hover { border-color: var(--cyan-border); color: var(--cyan); }
  .pill-btn.selected {
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 14px rgba(110,200,224,0.3);
  }

  input[type='range'] {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    border-radius: 99px;
    background: rgba(255,255,255,0.1);
    outline: none;
    cursor: pointer;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    box-shadow: 0 0 10px rgba(110,200,224,0.5);
    cursor: pointer;
    transition: transform 0.15s;
  }
  input[type='range']::-webkit-slider-thumb:active { transform: scale(1.25); }
  input[type='range']::-webkit-slider-runnable-track {
    background: linear-gradient(90deg, #1A4B8C var(--pct, 50%), rgba(255,255,255,0.08) var(--pct, 50%));
    border-radius: 99px;
  }

  .btn-nav-back {
    display: flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.07);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    color: var(--text-secondary);
    font-size: 14px; font-weight: 600;
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-nav-back:hover { background: rgba(255,255,255,0.12); color: white; }

  .btn-nav-next {
    display: flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 14px; font-weight: 700;
    padding: 10px 24px;
    cursor: pointer;
    transition: all 0.25s;
    font-family: 'Syne', sans-serif;
    box-shadow: 0 4px 18px rgba(110,200,224,0.25);
  }
  .btn-nav-next:hover { box-shadow: 0 8px 28px rgba(110,200,224,0.42); transform: translateY(-1px); }
  .btn-nav-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .inj-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 13px;
    border-radius: 99px;
    border: 1.5px solid var(--glass-border);
    background: rgba(0,0,0,0.2);
    color: var(--text-secondary);
    font-size: 12px; font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }
  .inj-chip:hover { border-color: var(--cyan-border); }
  .inj-chip.selected {
    border-color: var(--cyan);
    background: var(--cyan-dim);
    color: var(--cyan);
  }

  .sum-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 13px;
  }
  .sum-row:last-child { border-bottom: none; }
  .sum-key { color: var(--text-secondary); }
  .sum-val { color: var(--text-primary); font-weight: 600; font-family: 'Syne', sans-serif; }

  .ps-input {
    width: 100%;
    background: rgba(0,0,0,0.3);
    border: 1.5px solid var(--glass-border);
    border-radius: 12px;
    padding: 10px 14px;
    color: var(--text-primary);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s;
    resize: none;
  }
  .ps-input:focus { border-color: var(--cyan-border); }
  .ps-input::placeholder { color: var(--text-muted); }

  .step-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transition: all 0.3s;
  }
  .step-dot.active {
    width: 24px; border-radius: 99px;
    background: linear-gradient(90deg, #1A4B8C, #6EC8E0);
    box-shadow: 0 0 8px rgba(110,200,224,0.5);
  }
  .step-dot.done { background: rgba(110,200,224,0.5); }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float-up { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse-glow { 0%,100%{opacity:0.6} 50%{opacity:1} }
`;

// ─────────────────────────────────────────────
// COMPUTE BODY PARAMS
// ─────────────────────────────────────────────
function computeBodyParams(weightKg = 70, heightCm = 170, gender = 'male', goal = 'hypertrophy') {
  const bmi = weightKg / ((heightCm / 100) ** 2);
  const isMale = gender === 'male';

  // fatness 0→1 (lean→obese)
  const fat  = THREE.MathUtils.clamp((bmi - 17) / 22, 0, 1);
  // muscle boost when hypertrophy goal
  const musc = (goal === 'hypertrophy') ? THREE.MathUtils.clamp((bmi - 20) / 12, 0, 0.6) : 0;

  // Height scale (140 cm → 0.80,  210 cm → 1.20)
  const heightScale = THREE.MathUtils.mapLinear(heightCm, 140, 210, 0.80, 1.20);

  const shoulderW = isMale
    ? THREE.MathUtils.lerp(0.19, 0.38, fat * 0.5 + musc * 0.9)
    : THREE.MathUtils.lerp(0.16, 0.30, fat * 0.5 + musc * 0.7);

  const waistW = isMale
    ? THREE.MathUtils.lerp(0.11, 0.28, fat * 0.85 + musc * 0.1)
    : THREE.MathUtils.lerp(0.10, 0.24, fat * 0.80 + musc * 0.1);

  const hipW = isMale
    ? THREE.MathUtils.lerp(0.13, 0.28, fat * 0.75 + musc * 0.1)
    : THREE.MathUtils.lerp(0.15, 0.32, fat * 0.90 + musc * 0.15);

  const chestD = THREE.MathUtils.lerp(0.13, 0.28, fat * 0.7 + musc * 0.8);

  const armR   = THREE.MathUtils.lerp(0.055, 0.120, fat * 0.6 + musc * 0.8);
  const thighR = THREE.MathUtils.lerp(0.080, 0.175, fat * 0.8 + musc * 0.5);
  const shinR  = thighR * 0.72;

  return { heightScale, shoulderW, waistW, hipW, chestD, armR, thighR, shinR, isMale, bmi, fat, musc };
}

// ─────────────────────────────────────────────
// SHARED MATERIAL
// ─────────────────────────────────────────────
const Mat = ({ color, metalness = 0.45, roughness = 0.28, emissiveInt = 0.08 }) => (
  <meshStandardMaterial
    color={color}
    metalness={metalness}
    roughness={roughness}
    emissive={color}
    emissiveIntensity={emissiveInt}
  />
);

// ─────────────────────────────────────────────
// MANNEQUIN  —  cylinder + sphere primitives
//
//  Y=0 at floor level. All values in Three.js units.
//  heightScale applied to root group, so proportions stay
//  correct at any height. Arms splay naturally.
// ─────────────────────────────────────────────
const MannequinMesh = ({ p, primary, dark, skin }) => {
  // ── Fixed skeleton dimensions ──────────────────────────────────────────
  const FOOT_Y    = 0.00;
  const ANKLE_Y   = 0.12;
  const SHIN_LEN  = 0.52;
  const KNEE_Y    = ANKLE_Y + SHIN_LEN;          // 0.64
  const THIGH_LEN = 0.50;
  const HIP_Y     = KNEE_Y + THIGH_LEN;          // 1.14
  const PELVIS_H  = 0.22;
  const WAIST_Y   = HIP_Y + PELVIS_H;            // 1.36
  const TORSO_H   = 0.55;
  const CHEST_Y   = WAIST_Y + TORSO_H;           // 1.91
  const NECK_H    = 0.18;
  const HEAD_Y    = CHEST_Y + NECK_H + 0.19;     // 2.28

  const LEG_SEP   = Math.max(p.hipW * 0.55, p.thighR + 0.04);
  const ARM_X     = p.shoulderW + p.armR * 0.85;
  const ARM_SPLAY = 0.22 + p.fat * 0.10;         // outward tilt in radians

  return (
    <group>

      {/* HEAD */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.185, 28, 28]} />
        <Mat color={primary} />
      </mesh>

      {/* NECK */}
      <mesh position={[0, CHEST_Y + NECK_H * 0.5, 0]}>
        <cylinderGeometry args={[0.070, 0.082, NECK_H, 14]} />
        <Mat color={primary} />
      </mesh>

      {/* UPPER TORSO — scaled cylinder to get elliptical cross-section */}
      <mesh
        position={[0, WAIST_Y + TORSO_H * 0.5, 0]}
        scale={[p.shoulderW / 0.14, 1, p.chestD / 0.14]}
      >
        <cylinderGeometry args={[0.14, 0.12, TORSO_H, 22]} />
        <Mat color={dark} />
      </mesh>
      {/* shoulder dome cap (top of torso) */}
      <mesh
        position={[0, CHEST_Y, 0]}
        scale={[p.shoulderW / 0.14, 0.6, p.chestD / 0.14]}
      >
        <sphereGeometry args={[0.14, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color={dark} />
      </mesh>

      {/* WAIST sphere — smooth junction between torso sections */}
      <mesh
        position={[0, WAIST_Y, 0]}
        scale={[p.waistW / 0.10, 0.55, p.chestD * 0.88 / 0.10]}
      >
        <sphereGeometry args={[0.10, 18, 18]} />
        <Mat color={dark} />
      </mesh>

      {/* LOWER TORSO / PELVIS */}
      <mesh
        position={[0, HIP_Y + PELVIS_H * 0.5, 0]}
        scale={[p.hipW / 0.14, 1, p.chestD * 0.90 / 0.14]}
      >
        <cylinderGeometry args={[0.13, 0.14, PELVIS_H, 22]} />
        <Mat color={dark} />
      </mesh>
      {/* pelvis bottom dome */}
      <mesh
        position={[0, HIP_Y, 0]}
        rotation={[Math.PI, 0, 0]}
        scale={[p.hipW / 0.14, 0.55, p.chestD * 0.90 / 0.14]}
      >
        <sphereGeometry args={[0.14, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color={dark} />
      </mesh>

      {/* ── ARMS ── */}
      {[-1, 1].map(side => (
        <group key={side}>
          {/* Shoulder ball */}
          <mesh position={[side * (p.shoulderW + p.armR * 0.35), CHEST_Y, 0]}>
            <sphereGeometry args={[p.armR * 1.30, 16, 16]} />
            <Mat color={primary} />
          </mesh>

          {/* Upper arm group — tilted outward */}
          <group
            position={[side * ARM_X, CHEST_Y - 0.04, 0]}
            rotation={[0, 0, side * ARM_SPLAY]}
          >
            {/* Upper arm cylinder */}
            <mesh position={[0, -0.21, 0]}>
              <cylinderGeometry args={[p.armR * 0.97, p.armR * 0.89, 0.42, 16]} />
              <Mat color={primary} />
            </mesh>

            {/* Elbow joint */}
            <mesh position={[0, -0.43, 0]}>
              <sphereGeometry args={[p.armR * 0.93, 14, 14]} />
              <Mat color={primary} />
            </mesh>

            {/* Forearm */}
            <mesh position={[0, -0.65, 0]}>
              <cylinderGeometry args={[p.armR * 0.84, p.armR * 0.68, 0.40, 16]} />
              <Mat color={primary} />
            </mesh>

            {/* Wrist / hand */}
            <mesh position={[0, -0.87, 0]}>
              <sphereGeometry args={[p.armR * 0.72, 12, 12]} />
              <Mat color={skin} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ── LEGS ── */}
      {[-1, 1].map(side => (
        <group key={side} position={[side * LEG_SEP, 0, 0]}>

          {/* Hip ball joint */}
          <mesh position={[0, HIP_Y, 0]}>
            <sphereGeometry args={[p.thighR * 1.18, 16, 16]} />
            <Mat color={dark} />
          </mesh>

          {/* Thigh */}
          <mesh position={[0, KNEE_Y + THIGH_LEN * 0.5, 0]}>
            <cylinderGeometry args={[p.thighR * 0.97, p.thighR * 0.87, THIGH_LEN, 18]} />
            <Mat color={dark} />
          </mesh>

          {/* Knee joint */}
          <mesh position={[0, KNEE_Y, 0]}>
            <sphereGeometry args={[p.thighR * 0.92, 14, 14]} />
            <Mat color={primary} />
          </mesh>

          {/* Shin */}
          <mesh position={[0, ANKLE_Y + SHIN_LEN * 0.5, 0]}>
            <cylinderGeometry args={[p.shinR * 0.92, p.shinR * 0.72, SHIN_LEN, 16]} />
            <Mat color={primary} />
          </mesh>

          {/* Ankle joint */}
          <mesh position={[0, ANKLE_Y, 0]}>
            <sphereGeometry args={[p.shinR * 0.76, 12, 12]} />
            <Mat color={primary} />
          </mesh>

          {/* Foot */}
          <mesh position={[side * 0.018, FOOT_Y + 0.052, 0.038]}>
            <boxGeometry args={[p.thighR * 1.4, 0.100, p.thighR * 2.6]} />
            <Mat color={skin} />
          </mesh>

        </group>
      ))}

      {/* GROUND SHADOW */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(p.hipW, p.shoulderW) * 1.5, 32]} />
        <meshStandardMaterial color="#6EC8E0" opacity={0.10} transparent />
      </mesh>

    </group>
  );
};

// ── Wrapper: lerps params each frame, applies height scale to root ──────────
const Mannequin = ({ weight = 70, height = 170, gender = 'male', goal = 'hypertrophy', position = [0, 0, 0] }) => {
  const rootRef   = useRef();
  const lerpedRef = useRef(null);
  const [tick, setTick] = useState(0);

  const initParams = useMemo(
    () => computeBodyParams(weight, height, gender, goal),
    []
  );

  const [displayParams, setDisplayParams] = useState(initParams);

  const isMale  = gender === 'male';
  const primary = isMale ? '#6EC8E0' : '#e879b0';
  const dark    = isMale ? '#1A4B8C' : '#9B2EA0';
  const skin    = isMale ? '#7dd4e8' : '#f0a0d0';

  useFrame(() => {
    if (!rootRef.current) return;

    const target = computeBodyParams(weight, height, gender, goal);
    if (!lerpedRef.current) lerpedRef.current = { ...target };

    const s = lerpedRef.current;
    let changed = false;

    for (const k in target) {
      if (typeof target[k] === 'number') {
        const next = THREE.MathUtils.lerp(s[k] ?? target[k], target[k], 0.055);
        if (Math.abs(next - (s[k] ?? 0)) > 0.0001) changed = true;
        s[k] = next;
      } else {
        s[k] = target[k];
      }
    }

    rootRef.current.scale.y = s.heightScale;
    rootRef.current.rotation.y += 0.004;

    if (changed) setDisplayParams({ ...s });
  });

  return (
    <group ref={rootRef} position={position}>   {/* ← aquí se aplica la posición */}
      <MannequinMesh p={displayParams} primary={primary} dark={dark} skin={skin} />
    </group>
  );
};

// ─────────────────────────────────────────────
// Other 3D objects (unchanged)
// ─────────────────────────────────────────────
const GoalOrb = ({ goal }) => {
  const orbRef  = useRef();
  const ringRef = useRef();
  const config = {
    hypertrophy: { color: '#6EC8E0', emissive: '#0a4080', distort: 0.35, speed: 2 },
    fat_loss:    { color: '#f97316', emissive: '#7c2d12', distort: 0.55, speed: 3.5 },
    endurance:   { color: '#22c55e', emissive: '#052e16', distort: 0.2,  speed: 1.4 },
    maintenance: { color: '#a78bfa', emissive: '#2e1065', distort: 0.15, speed: 1 },
  }[goal] || { color: '#6EC8E0', emissive: '#0a4080', distort: 0.3, speed: 2 };
  useFrame(({ clock }) => {
    if (orbRef.current)  orbRef.current.rotation.y  = clock.getElapsedTime() * 0.5;
    if (ringRef.current) ringRef.current.rotation.x = clock.getElapsedTime() * 0.8;
  });
  return (
    <group>
      <Float speed={config.speed} floatIntensity={0.5} rotationIntensity={0.3}>
        <mesh ref={orbRef}>
          <sphereGeometry args={[0.9, 64, 64]} />
          <MeshDistortMaterial color={config.color} emissive={config.emissive} emissiveIntensity={0.4} metalness={0.6} roughness={0.15} distort={config.distort} speed={config.speed} />
        </mesh>
        <mesh ref={ringRef} rotation={[1.1, 0, 0]}>
          <torusGeometry args={[1.35, 0.04, 12, 80]} />
          <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.6} />
        </mesh>
      </Float>
    </group>
  );
};

const CalendarCubes = ({ days = 3, duration = 45 }) => {
  const cubes = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);
  const durationScale = THREE.MathUtils.mapLinear(duration, 30, 90, 0.5, 1.4);
  return (
    <group>
      {cubes.map(i => {
        const active = i < days;
        const x = (i - 3) * 0.55;
        return (
          <Float key={i} speed={1 + i * 0.15} floatIntensity={0.3}>
            <Box args={[0.38 * durationScale, active ? 0.7 + i * 0.05 : 0.3, 0.38 * durationScale]} position={[x, active ? 0.1 : -0.3, 0]}>
              <meshStandardMaterial color={active ? '#6EC8E0' : 'rgba(255,255,255,0.1)'} emissive={active ? '#1A4B8C' : '#000'} emissiveIntensity={active ? 0.4 : 0} metalness={0.6} roughness={0.2} opacity={active ? 1 : 0.3} transparent />
            </Box>
          </Float>
        );
      })}
    </group>
  );
};

const XPPodium = ({ level }) => {
  const heights = { beginner: [0.4, 0.7, 0.5], intermediate: [0.6, 1.1, 0.8], advanced: [1.0, 1.6, 1.3] };
  const h = heights[level] || heights.beginner;
  const colors = ['#fbbf24', '#6EC8E0', '#a78bfa'];
  return (
    <group>
      {[-0.7, 0, 0.7].map((x, i) => (
        <Float key={i} speed={1.2 + i * 0.3} floatIntensity={0.2}>
          <Cylinder args={[0.22, 0.22, h[i], 20]} position={[x, h[i] / 2 - 0.8, 0]}>
            <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.25} metalness={0.7} roughness={0.2} />
          </Cylinder>
          <Sphere args={[0.18, 20, 20]} position={[x, h[i] - 0.8 + 0.18, 0]}>
            <meshStandardMaterial color={colors[i]} metalness={0.8} roughness={0.1} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
};

// ── InjuryMannequin: real mannequin skeleton (ghosted) + correctly-placed injury markers ──
// All Y coordinates match MannequinMesh exactly:
//   FOOT_Y=0, ANKLE_Y=0.12, KNEE_Y=0.64, HIP_Y=1.14,
//   WAIST_Y=1.36, CHEST_Y=1.91, HEAD_Y=2.28
// ARM_GROUP origin: Y = CHEST_Y - 0.04 = 1.87
//   elbow offset in group: Y = -0.43  → world Y ≈ 1.87 - 0.43 = 1.44
//   wrist offset in group: Y = -0.87  → world Y ≈ 1.87 - 0.87 = 1.00
// ARM_X (default 70kg/170cm male) ≈ shoulderW(0.19) + armR(0.055)*0.85 ≈ 0.237
const INJURY_MARKERS = {
  knees:      { y: 0.64,  x: 0.17,  z: 0.12,  label: 'Rodillas',    bilateral: true  },
  lower_back: { y: 1.30,  x: 0,     z: -0.18, label: 'Espalda baja', bilateral: false },
  shoulders:  { y: 1.91,  x: 0.28,  z: 0.05,  label: 'Hombros',     bilateral: true  },
  elbows:     { y: 1.44,  x: 0.38,  z: 0.04,  label: 'Codos',       bilateral: true  },
  wrists:     { y: 1.00,  x: 0.50,  z: 0.03,  label: 'Muñecas',     bilateral: true  },
  neck:       { y: 2.10,  x: 0,     z: 0.08,  label: 'Cuello',      bilateral: false },
};

const InjuryBody = ({ injuries = [], gender = 'male', weight = 70, height = 170, goal = 'maintenance', position = [0, 0, 0] }) => {
  const groupRef = useRef();
  useFrame(() => { if (groupRef.current) groupRef.current.rotation.y += 0.005; });

  const p = useMemo(() => computeBodyParams(weight, height, gender, goal), [weight, height, gender, goal]);

  const isMale  = gender === 'male';
  const primary = isMale ? '#6EC8E0' : '#e879b0';
  const dark    = isMale ? '#1A4B8C' : '#9B2EA0';
  const skin    = isMale ? '#7dd4e8' : '#f0a0d0';

  // Ghost material helper
  const G = ({ color, o = 0.38 }) => (
    <meshStandardMaterial color={color} opacity={o} transparent metalness={0.35} roughness={0.4} />
  );

  const FOOT_Y  = 0.00;
  const ANKLE_Y = 0.12;
  const SHIN_LEN = 0.52;
  const KNEE_Y  = ANKLE_Y + SHIN_LEN;
  const THIGH_LEN = 0.50;
  const HIP_Y   = KNEE_Y + THIGH_LEN;
  const PELVIS_H = 0.22;
  const WAIST_Y = HIP_Y + PELVIS_H;
  const TORSO_H = 0.55;
  const CHEST_Y = WAIST_Y + TORSO_H;
  const NECK_H  = 0.18;
  const HEAD_Y  = CHEST_Y + NECK_H + 0.19;

  const LEG_SEP  = Math.max(p.hipW * 0.55, p.thighR + 0.04);
  const ARM_X    = p.shoulderW + p.armR * 0.85;
  const ARM_SPLAY = 0.22 + p.fat * 0.10;

  return (
    <group ref={groupRef} position={position} scale={[1, p.heightScale, 1]}>
      {/* ── Ghost body (same geometry as MannequinMesh, all semi-transparent) ── */}

      {/* HEAD */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.185, 22, 22]} />
        <G color={primary} o={0.45} />
      </mesh>
      {/* NECK */}
      <mesh position={[0, CHEST_Y + NECK_H * 0.5, 0]}>
        <cylinderGeometry args={[0.070, 0.082, NECK_H, 14]} />
        <G color={primary} o={0.40} />
      </mesh>
      {/* UPPER TORSO */}
      <mesh position={[0, WAIST_Y + TORSO_H * 0.5, 0]} scale={[p.shoulderW / 0.14, 1, p.chestD / 0.14]}>
        <cylinderGeometry args={[0.14, 0.12, TORSO_H, 22]} />
        <G color={dark} o={0.45} />
      </mesh>
      <mesh position={[0, CHEST_Y, 0]} scale={[p.shoulderW / 0.14, 0.6, p.chestD / 0.14]}>
        <sphereGeometry args={[0.14, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <G color={dark} o={0.45} />
      </mesh>
      {/* WAIST */}
      <mesh position={[0, WAIST_Y, 0]} scale={[p.waistW / 0.10, 0.55, p.chestD * 0.88 / 0.10]}>
        <sphereGeometry args={[0.10, 18, 18]} />
        <G color={dark} o={0.40} />
      </mesh>
      {/* PELVIS */}
      <mesh position={[0, HIP_Y + PELVIS_H * 0.5, 0]} scale={[p.hipW / 0.14, 1, p.chestD * 0.90 / 0.14]}>
        <cylinderGeometry args={[0.13, 0.14, PELVIS_H, 22]} />
        <G color={dark} o={0.45} />
      </mesh>
      <mesh position={[0, HIP_Y, 0]} rotation={[Math.PI, 0, 0]} scale={[p.hipW / 0.14, 0.55, p.chestD * 0.90 / 0.14]}>
        <sphereGeometry args={[0.14, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <G color={dark} o={0.40} />
      </mesh>

      {/* ARMS */}
      {[-1, 1].map(side => (
        <group key={side}>
          <mesh position={[side * (p.shoulderW + p.armR * 0.35), CHEST_Y, 0]}>
            <sphereGeometry args={[p.armR * 1.30, 14, 14]} />
            <G color={primary} o={0.40} />
          </mesh>
          <group position={[side * ARM_X, CHEST_Y - 0.04, 0]} rotation={[0, 0, side * ARM_SPLAY]}>
            <mesh position={[0, -0.21, 0]}>
              <cylinderGeometry args={[p.armR * 0.97, p.armR * 0.89, 0.42, 14]} />
              <G color={primary} o={0.38} />
            </mesh>
            <mesh position={[0, -0.43, 0]}>
              <sphereGeometry args={[p.armR * 0.93, 12, 12]} />
              <G color={primary} o={0.38} />
            </mesh>
            <mesh position={[0, -0.65, 0]}>
              <cylinderGeometry args={[p.armR * 0.84, p.armR * 0.68, 0.40, 14]} />
              <G color={primary} o={0.35} />
            </mesh>
            <mesh position={[0, -0.87, 0]}>
              <sphereGeometry args={[p.armR * 0.72, 10, 10]} />
              <G color={skin} o={0.35} />
            </mesh>
          </group>
        </group>
      ))}

      {/* LEGS */}
      {[-1, 1].map(side => (
        <group key={side} position={[side * LEG_SEP, 0, 0]}>
          <mesh position={[0, HIP_Y, 0]}>
            <sphereGeometry args={[p.thighR * 1.18, 14, 14]} />
            <G color={dark} o={0.42} />
          </mesh>
          <mesh position={[0, KNEE_Y + THIGH_LEN * 0.5, 0]}>
            <cylinderGeometry args={[p.thighR * 0.97, p.thighR * 0.87, THIGH_LEN, 16]} />
            <G color={dark} o={0.42} />
          </mesh>
          <mesh position={[0, KNEE_Y, 0]}>
            <sphereGeometry args={[p.thighR * 0.92, 12, 12]} />
            <G color={primary} o={0.40} />
          </mesh>
          <mesh position={[0, ANKLE_Y + SHIN_LEN * 0.5, 0]}>
            <cylinderGeometry args={[p.shinR * 0.92, p.shinR * 0.72, SHIN_LEN, 14]} />
            <G color={primary} o={0.38} />
          </mesh>
          <mesh position={[0, ANKLE_Y, 0]}>
            <sphereGeometry args={[p.shinR * 0.76, 10, 10]} />
            <G color={primary} o={0.38} />
          </mesh>
          <mesh position={[side * 0.018, FOOT_Y + 0.052, 0.038]}>
            <boxGeometry args={[p.thighR * 1.4, 0.100, p.thighR * 2.6]} />
            <G color={skin} o={0.35} />
          </mesh>
        </group>
      ))}

      {/* GROUND SHADOW */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(p.hipW, p.shoulderW) * 1.5, 32]} />
        <meshStandardMaterial color="#6EC8E0" opacity={0.08} transparent />
      </mesh>

      {/* ── INJURY MARKERS — mapped to real skeleton coordinates ── */}
      {injuries.map(inj => {
        const m = INJURY_MARKERS[inj];
        if (!m) return null;
        const positions = m.bilateral
          ? [[-m.x, m.y, m.z], [m.x, m.y, m.z]]
          : [[m.x, m.y, m.z]];
        return positions.map(([px, py, pz], idx) => (
          <Float key={`${inj}-${idx}`} speed={2.5} floatIntensity={0.18}>
            <group position={[px, py, pz]}>
              {/* Outer glow ring */}
              <mesh>
                <sphereGeometry args={[0.115, 14, 14]} />
                <meshStandardMaterial color="#f87171" opacity={0.25} transparent />
              </mesh>
              {/* Inner solid dot */}
              <mesh>
                <sphereGeometry args={[0.072, 14, 14]} />
                <meshStandardMaterial color="#ef4444" emissive="#f87171" emissiveIntensity={1.2} />
              </mesh>
            </group>
          </Float>
        ));
      })}
    </group>
  );
};

const SummaryTrophy = () => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.6;
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.12;
    }
  });
  return (
    <group ref={ref}>
      <Cylinder args={[0.55, 0.25, 0.9, 32]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} emissive="#92400e" emissiveIntensity={0.3} />
      </Cylinder>
      <Cylinder args={[0.12, 0.12, 0.45, 16]} position={[0, -0.35, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[0.42, 0.42, 0.1, 32]} position={[0, -0.6, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Torus args={[0.7, 0.03, 10, 60]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
      </Torus>
      {[0, 1, 2, 3, 4].map(i => (
        <Float key={i} speed={1.5 + i * 0.4} floatIntensity={0.5} rotationIntensity={0.2}>
          <Sphere args={[0.07, 10, 10]} position={[Math.cos(i * 1.26) * 1.1, Math.sin(i * 1.1) * 0.4, Math.sin(i * 1.26) * 1.1]}>
            <meshStandardMaterial color="#6EC8E0" emissive="#6EC8E0" emissiveIntensity={0.8} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
};

// ── Canvas wrapper ──────────────────────────────────────────────────────────
const Scene3D = ({ children, camera = [0, 0, 4.5], fov = 48 }) => (
  <Canvas camera={{ position: camera, fov }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true }}>
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 10, 5]} intensity={1.2} />
    <pointLight position={[-3, 4, 4]} intensity={0.8} color="#6EC8E0" />
    <pointLight position={[3, -2, 2]} intensity={0.4} color="#1A4B8C" />
    {children}
  </Canvas>
);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const Label = ({ children, sub }) => (
  <div style={{ marginBottom: 10 }}>
    <div className="heading" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, marginBottom: sub ? 3 : 0 }}>
      {children}
    </div>
    {sub && <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{sub}</div>}
  </div>
);

const SliderField = ({ label, min, max, step = 1, value, onChange, unit, format }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Label>{label}</Label>
        <span className="heading" style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: 18 }}>
          {format ? format(value) : value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{min}{unit}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{max}{unit}</span>
      </div>
    </div>
  );
};

const INJURY_OPTS = [
  { value: 'knees',      label: 'Rodillas',    icon: '🦵' },
  { value: 'lower_back', label: 'Espalda baja', icon: '🦴' },
  { value: 'shoulders',  label: 'Hombros',      icon: '💪' },
  { value: 'elbows',     label: 'Codos',        icon: '💢' },
  { value: 'wrists',     label: 'Muñecas',      icon: '✋' },
  { value: 'neck',       label: 'Cuello',       icon: '🧘' },
];

// ─────────────────────────────────────────────
// Step panels
// ─────────────────────────────────────────────
const Step1 = ({ data, set }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
    <div>
      <Label>Género</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[{ v: 'male', e: '💪', l: 'Hombre' }, { v: 'female', e: '🧘‍♀️', l: 'Mujer' }].map(o => (
          <div key={o.v} className={`opt-tile ${data.gender === o.v ? 'selected' : ''}`}
            onClick={() => set('gender', o.v)}>
            <span style={{ fontSize: 36 }}>{o.e}</span>
            <span className="heading" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{o.l}</span>
          </div>
        ))}
      </div>
    </div>
    <SliderField label="Edad" min={15} max={80} value={data.age || 25} onChange={v => set('age', v)} unit=" años" />
    <SliderField label="Peso" min={40} max={180} value={data.weight || 70} onChange={v => set('weight', v)} unit=" kg" />
    <SliderField label="Altura" min={140} max={210} value={data.height || 170} onChange={v => set('height', v)} unit=" cm" />
  </div>
);

const Step2 = ({ data, set }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
    <div>
      <Label>Objetivo principal</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { v: 'hypertrophy', e: '🏋️', l: 'Hipertrofia',   d: 'Ganar músculo' },
          { v: 'fat_loss',    e: '🔥', l: 'Pérdida grasa', d: 'Definición' },
          { v: 'endurance',   e: '🏃', l: 'Resistencia',   d: 'Aguante' },
          { v: 'maintenance', e: '❤️', l: 'Mantenimiento', d: 'Salud' },
        ].map(o => (
          <div key={o.v} className={`opt-tile ${data.training_goal === o.v ? 'selected' : ''}`}
            onClick={() => set('training_goal', o.v)}
            style={{ padding: '12px 10px', gap: 4 }}>
            <span style={{ fontSize: 28 }}>{o.e}</span>
            <span className="heading" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>{o.l}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{o.d}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <Label sub="¿Cuántos días por semana entrenas?">Días de entrenamiento</Label>
      <div style={{ display: 'flex', gap: 8 }}>
        {[2, 3, 4, 5, 6].map(d => (
          <button key={d} className={`pill-btn ${data.days_per_week == d ? 'selected' : ''}`}
            onClick={() => set('days_per_week', d)}>{d}</button>
        ))}
      </div>
    </div>
    <div>
      <Label>Nivel de experiencia</Label>
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { v: 'beginner',     l: 'Principiante', icon: <Zap size={14} /> },
          { v: 'intermediate', l: 'Intermedio',   icon: <TrendingUp size={14} /> },
          { v: 'advanced',     l: 'Avanzado',     icon: <Trophy size={14} /> },
        ].map(o => (
          <div key={o.v} className={`opt-tile ${data.experience_level === o.v ? 'selected' : ''}`}
            onClick={() => set('experience_level', o.v)}
            style={{ flex: 1, padding: '10px 6px', gap: 4 }}>
            <span style={{ color: 'var(--cyan)' }}>{o.icon}</span>
            <span style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{o.l}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <Label>Duración por sesión</Label>
      <div style={{ display: 'flex', gap: 8 }}>
        {[30, 45, 60, 90].map(m => (
          <button key={m} className={`pill-btn ${data.session_duration == m ? 'selected' : ''}`}
            onClick={() => set('session_duration', m)}>{m} min</button>
        ))}
      </div>
    </div>
  </div>
);

const Step3 = ({ data, set }) => {
  const selected = data.injuries ? data.injuries.split(',').filter(Boolean) : [];
  const toggleInj = (v) => {
    let next = selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v];
    set('injuries', next.join(','));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Label sub="Toca las zonas problemáticas para resaltarlas en el cuerpo 3D">Lesiones o zonas dolorosas</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INJURY_OPTS.map(o => (
            <div key={o.value} className={`inj-chip ${selected.includes(o.value) ? 'selected' : ''}`}
              onClick={() => toggleInj(o.value)}>
              <span>{o.icon}</span> {o.label}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Otras lesiones</Label>
        <input className="ps-input" name="other_injuries"
          value={data.other_injuries} onChange={e => set('other_injuries', e.target.value)}
          placeholder="Ej. tendón de Aquiles, cadera..." />
      </div>
      <div>
        <Label>Condiciones médicas crónicas</Label>
        <textarea className="ps-input" rows={2}
          value={data.medical_conditions} onChange={e => set('medical_conditions', e.target.value)}
          placeholder="Ej. hipertensión, diabetes, asma..." />
      </div>
      <div>
        <Label>Cirugías previas relevantes</Label>
        <textarea className="ps-input" rows={2}
          value={data.surgeries} onChange={e => set('surgeries', e.target.value)}
          placeholder="Ej. cirugía de rodilla 2021..." />
      </div>
    </div>
  );
};

const GOAL_LABEL  = { hypertrophy: 'Hipertrofia', fat_loss: 'Pérdida de grasa', endurance: 'Resistencia', maintenance: 'Mantenimiento' };
const LEVEL_LABEL = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };

const Step4 = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div className="heading" style={{ color: 'white', fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
      ¡Todo listo! Revisa tu perfil 🏆
    </div>
    {[
      ['Género',        data.gender === 'male' ? 'Hombre' : 'Mujer'],
      ['Edad',          `${data.age || '—'} años`],
      ['Peso',          `${data.weight || '—'} kg`],
      ['Altura',        `${data.height || '—'} cm`],
      ['Objetivo',      GOAL_LABEL[data.training_goal] || '—'],
      ['Días / semana', data.days_per_week ? `${data.days_per_week} días` : '—'],
      ['Experiencia',   LEVEL_LABEL[data.experience_level] || '—'],
      ['Sesión',        data.session_duration ? `${data.session_duration} min` : '—'],
      ['Lesiones',      data.injuries ? data.injuries.split(',').map(v => INJURY_OPTS.find(o => o.value === v)?.label || v).join(', ') : 'Ninguna'],
    ].map(([k, v]) => (
      <div key={k} className="sum-row">
        <span className="sum-key">{k}</span>
        <span className="sum-val">{v}</span>
      </div>
    ))}
    <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
      Usaremos estos datos para generar tu rutina personalizada con IA.
    </p>
  </div>
);

// ─────────────────────────────────────────────
// Canvas wrappers per step – FIXED CAMERA POSITION (Step1 & Step3)
// ─────────────────────────────────────────────

// Step 1 — Mannequin spans Y=0 (feet) to Y≈2.28 (top of head).
// Center = Y≈1.14. Camera at Y=1.14, distance 4.8, fov=52
// so the full ~2.3-unit figure fits perfectly.
const Step1Canvas = ({ data }) => (
  <Scene3D camera={[0, 1.14, 4.8]} fov={52}>
    <Mannequin
      weight={data.weight || 70}
      height={data.height || 170}
      gender={data.gender}
      goal={data.training_goal || 'hypertrophy'}
      position={[0, -1, 1]}  
    />
  </Scene3D>
);

const Step2Canvas = ({ data }) => {
  const [view, setView] = useState('goal');
  useEffect(() => {
    if (data.training_goal) setView('goal');
    else if (data.days_per_week || data.session_duration) setView('schedule');
    else if (data.experience_level) setView('xp');
  }, [data.training_goal, data.days_per_week, data.experience_level]);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Scene3D>
        {view === 'goal'     && <GoalOrb goal={data.training_goal || 'hypertrophy'} />}
        {view === 'schedule' && <CalendarCubes days={data.days_per_week || 3} duration={data.session_duration || 45} />}
        {view === 'xp'       && <XPPodium level={data.experience_level || 'beginner'} />}
      </Scene3D>
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {[['goal','🎯'],['schedule','📅'],['xp','🏆']].map(([v, e]) => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? 'rgba(110,200,224,0.25)' : 'rgba(0,0,0,0.4)',
            border: `1px solid ${view === v ? 'rgba(110,200,224,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8, padding: '4px 10px', fontSize: 16, cursor: 'pointer'
          }}>{e}</button>
        ))}
      </div>
    </div>
  );
};

const Step3Canvas = ({ data }) => {
  const inj = data.injuries ? data.injuries.split(',').filter(Boolean) : [];
  return (
    <Scene3D camera={[0, 1.14, 4.8]} fov={52}>
      <InjuryBody
        injuries={inj}
        gender={data.gender}
        weight={data.weight || 70}
        height={data.height || 170}
        goal={data.training_goal || 'maintenance'}
        position={[0, -1, 1]}  
      />
    </Scene3D>
  );
};

const Step4Canvas = () => (
  <Scene3D camera={[0, 0, 4.5]}>
    <SummaryTrophy />
  </Scene3D>
);

// ─────────────────────────────────────────────
// Dynamic 3D description
// ─────────────────────────────────────────────
const CANVAS_DESCRIPTIONS = [
  (d) => {
    const bmi = d.weight && d.height ? (d.weight / ((d.height / 100) ** 2)).toFixed(1) : null;
    const cat = bmi
      ? bmi < 18.5 ? 'Bajo peso'
      : bmi < 25   ? 'Normal'
      : bmi < 30   ? 'Sobrepeso'
      : 'Obesidad'
      : null;
    const bodyType = bmi
      ? bmi < 18.5 ? 'cuerpo delgado'
      : bmi < 22   ? 'cuerpo esbelto'
      : bmi < 25   ? 'cuerpo estándar'
      : bmi < 30   ? 'cuerpo con sobrepeso'
      : 'cuerpo obeso'
      : '';
    return bmi
      ? `IMC: ${bmi} — ${cat} · El maniquí muestra un ${bodyType}`
      : 'Ajusta los sliders para ver tu figura';
  },
  (d) => d.training_goal
    ? `Modo: ${GOAL_LABEL[d.training_goal]} | ${d.days_per_week || '?'} días/sem · ${d.session_duration || '?'} min`
    : 'Selecciona tu objetivo y mira cómo cambia el orbe',
  (d) => {
    const count = d.injuries ? d.injuries.split(',').filter(Boolean).length : 0;
    return count > 0
      ? `${count} zona${count > 1 ? 's' : ''} marcada${count > 1 ? 's' : ''} en rojo sobre el cuerpo`
      : 'Toca las zonas para resaltarlas en 3D';
  },
  () => '¡Tu rutina personalizada está lista para generarse!',
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const ProfileSetup = () => {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    gender: 'male', age: 25, weight: 70, height: 170,
    training_goal: 'hypertrophy', days_per_week: 4, experience_level: 'beginner', session_duration: 45,
    injuries: '', other_injuries: '', medical_conditions: '', surgeries: '',
  });

  const setField = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) { navigate('/login'); return; }
        const res = await axios.get(`${API_URL}profile/`, { headers: { Authorization: `Bearer ${token}` } });
        setFormData(prev => ({ ...prev, ...res.data }));
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        days_per_week: formData.days_per_week ? parseInt(formData.days_per_week) : null,
        session_duration: formData.session_duration ? parseInt(formData.session_duration) : null,
      };
      await axios.put(`${API_URL}profile/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      await axios.post(`${API_URL}training/generar-rutina/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/socio/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ps-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <style>{globalStyles}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48,height:48,borderRadius:'50%',border:'3px solid rgba(110,200,224,0.2)',borderTopColor:'#6EC8E0',animation:'spin 0.9s linear infinite',margin:'0 auto 14px' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontFamily:'DM Sans,sans-serif', fontSize:14 }}>Cargando tu perfil...</p>
      </div>
    </div>
  );

  const totalSteps = 4;
  const progress   = ((step - 1) / (totalSteps - 1)) * 100;
  const desc3d     = CANVAS_DESCRIPTIONS[step - 1]?.(formData) || '';

  const stepForms = [
    <Step1 data={formData} set={setField} />,
    <Step2 data={formData} set={setField} />,
    <Step3 data={formData} set={setField} />,
    <Step4 data={formData} />,
  ];

  const canvases = [
    <Step1Canvas data={formData} />,
    <Step2Canvas data={formData} />,
    <Step3Canvas data={formData} />,
    <Step4Canvas />,
  ];

  const stepTitles = ['👤 Tu cuerpo', '🎯 Objetivos', '🩺 Salud', '🏆 Confirmar'];

  return (
    <div className="ps-root" style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <style>{globalStyles}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        padding:'10px 24px',
        background:'rgba(7,18,42,0.85)',
        backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.08)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexShrink:0, zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:38, height:38, borderRadius:11,
            background:'linear-gradient(135deg,#1A4B8C,#6EC8E0)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(110,200,224,0.3)',
          }}>
            <span className="heading" style={{ color:'white', fontSize:13, fontWeight:800 }}>EG</span>
          </div>
          <div>
            <div className="heading" style={{ color:'white', fontWeight:700, fontSize:15 }}>Essential Gym</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>Configuración de perfil</div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          {stepTitles.map((t, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer' }}
              onClick={() => i < step - 1 && setStep(i + 1)}>
              <div className={`step-dot ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`} />
              <span style={{ color: step === i+1 ? 'var(--cyan)' : 'var(--text-muted)', fontSize:10, whiteSpace:'nowrap' }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-secondary)' }}>
          <span className="heading" style={{ color:'var(--cyan)', fontWeight:700 }}>{step}</span>
          <span>/</span>
          <span>{totalSteps}</span>
        </div>
      </nav>

      {/* ── PROGRESS BAR ── */}
      <div style={{ height:3, background:'rgba(255,255,255,0.06)', flexShrink:0, zIndex:10 }}>
        <motion.div animate={{ width:`${progress}%` }} transition={{ duration:0.5, ease:'easeOut' }}
          style={{ height:'100%', background:'linear-gradient(90deg,#1A4B8C,#6EC8E0)', boxShadow:'0 0 10px rgba(110,200,224,0.5)' }} />
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* LEFT: Form */}
        <div style={{
          width:'42%', minWidth:360, maxWidth:520,
          display:'flex', flexDirection:'column',
          padding:'24px', gap:0, overflowY:'auto',
        }} className="ps-scroll">

          <motion.div key={`title-${step}`} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.35 }} style={{ marginBottom:20 }}>
            <div className="heading" style={{ color:'white', fontSize:22, fontWeight:800, lineHeight:1.2 }}>
              {stepTitles[step - 1]}
            </div>
            <div style={{ color:'var(--text-secondary)', fontSize:13, marginTop:4 }}>
              {step === 1 && 'El maniquí se adapta en tiempo real: peso, altura y complexión'}
              {step === 2 && 'Define tus metas y disponibilidad — el orbe reacciona a tu selección'}
              {step === 3 && 'Marca tus zonas de dolor — se resaltarán sobre el cuerpo 3D'}
              {step === 4 && 'Revisa todo antes de generar tu rutina personalizada con IA'}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={`step-${step}`} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-30 }} transition={{ duration:0.3 }}>
              {stepForms[step - 1]}
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{
              marginTop:16, background:'rgba(239,68,68,0.12)',
              border:'1px solid rgba(239,68,68,0.35)', borderRadius:12, padding:'10px 14px',
              color:'#fca5a5', fontSize:13, display:'flex', alignItems:'center', gap:8,
            }}>
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            {step > 1 ? (
              <button className="btn-nav-back" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={15} /> Atrás
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button className="btn-nav-next" onClick={() => setStep(s => s + 1)}>
                Siguiente <ChevronRight size={15} />
              </button>
            ) : (
              <button className="btn-nav-next" onClick={handleSubmit} disabled={saving}
                style={{ background:'linear-gradient(135deg, #16a34a, #22c55e)', minWidth:160 }}>
                {saving
                  ? <div style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',animation:'spin 0.8s linear infinite' }} />
                  : '🚀 Generar mi rutina'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: 3D canvas */}
        <div style={{
          flex:1, display:'flex', flexDirection:'column', position:'relative',
          borderLeft:'1px solid rgba(255,255,255,0.06)',
          background:'rgba(4,10,26,0.6)',
        }}>
          <div style={{ flex:1, position:'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div key={`canvas-${step}`} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                transition={{ duration:0.5 }}
                style={{ width:'100%', height:'100%', position:'absolute', inset:0 }}>
                {canvases[step - 1]}
              </motion.div>
            </AnimatePresence>

            {/* Corner brackets */}
            {['tl','tr','bl','br'].map(c => (
              <div key={c} style={{
                position:'absolute',
                top:    c.startsWith('t') ? 16 : undefined,
                bottom: c.startsWith('b') ? 16 : undefined,
                left:   c.endsWith('l')   ? 16 : undefined,
                right:  c.endsWith('r')   ? 16 : undefined,
                width:28, height:28,
                borderTop:    c.startsWith('t') ? '2px solid rgba(110,200,224,0.35)' : undefined,
                borderBottom: c.startsWith('b') ? '2px solid rgba(110,200,224,0.35)' : undefined,
                borderLeft:   c.endsWith('l')   ? '2px solid rgba(110,200,224,0.35)' : undefined,
                borderRight:  c.endsWith('r')   ? '2px solid rgba(110,200,224,0.35)' : undefined,
                pointerEvents:'none',
              }} />
            ))}

            {/* Live badge */}
            <div style={{
              position:'absolute', top:16, left:'50%', transform:'translateX(-50%)',
              background:'rgba(10,20,50,0.75)',
              border:'1px solid rgba(110,200,224,0.2)',
              borderRadius:99, padding:'5px 14px', backdropFilter:'blur(8px)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#6EC8E0',animation:'pulse-glow 2s infinite' }} />
              <span className="heading" style={{ color:'white', fontSize:11, fontWeight:700, letterSpacing:'0.06em' }}>
                VISTA 3D EN VIVO
              </span>
            </div>

            {/* Body type card (Step 1 only) */}
            {step === 1 && (() => {
              const bmi = formData.weight && formData.height
                ? formData.weight / ((formData.height / 100) ** 2) : 0;
              const typeLabel = bmi < 18.5 ? 'Delgado' : bmi < 22 ? 'Esbelto' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Sobrepeso' : 'Obeso';
              const typeColor = bmi < 18.5 ? '#93c5fd' : bmi < 25 ? '#6EC8E0' : bmi < 30 ? '#fbbf24' : '#f87171';
              return (
                <div style={{
                  position:'absolute', top:16, right:20,
                  background:'rgba(10,20,50,0.85)',
                  border:`1px solid ${typeColor}66`,
                  borderRadius:12, padding:'8px 14px',
                  backdropFilter:'blur(12px)',
                  textAlign:'center',
                }}>
                  <div style={{ color: typeColor, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14 }}>{typeLabel}</div>
                  <div style={{ color:'rgba(255,255,255,0.45)', fontSize:10, marginTop:2 }}>
                    IMC {bmi ? bmi.toFixed(1) : '--'}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom description */}
          <motion.div key={`desc-${step}`} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.4, delay:0.15 }}
            style={{
              padding:'12px 20px', background:'rgba(4,10,26,0.85)',
              backdropFilter:'blur(10px)', borderTop:'1px solid rgba(255,255,255,0.06)',
              display:'flex', alignItems:'center', gap:10,
            }}>
            <div style={{
              width:32, height:32, borderRadius:10,
              background:'var(--cyan-dim)', border:'1px solid var(--cyan-border)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <Activity size={14} color="var(--cyan)" />
            </div>
            <span style={{ color:'var(--text-secondary)', fontSize:12, lineHeight:1.5 }}>{desc3d}</span>
          </motion.div>

          {/* Weight/height readout (step 1) */}
          {step === 1 && (
            <div style={{ position:'absolute', bottom:64, right:20, display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{
                background:'rgba(10,20,50,0.8)',
                border:'1px solid var(--cyan-border)',
                borderRadius:12, padding:'8px 14px',
                backdropFilter:'blur(8px)', minWidth:90, textAlign:'center',
              }}>
                <div className="heading" style={{ color:'var(--cyan)', fontWeight:800, fontSize:22 }}>{formData.weight}</div>
                <div style={{ color:'var(--text-secondary)', fontSize:10, marginTop:1 }}>kg peso</div>
              </div>
              <div style={{
                background:'rgba(10,20,50,0.8)',
                border:'1px solid rgba(110,200,224,0.2)',
                borderRadius:12, padding:'8px 14px',
                backdropFilter:'blur(8px)', minWidth:90, textAlign:'center',
              }}>
                <div className="heading" style={{ color:'white', fontWeight:800, fontSize:22 }}>{formData.height}</div>
                <div style={{ color:'var(--text-secondary)', fontSize:10, marginTop:1 }}>cm altura</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;