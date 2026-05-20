// src/pages/ProfileSetup.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
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
// HUMAN BODY — built with LatheGeometry + smooth profiles
// Morphs based on: weight (fat ↔ lean ↔ muscular), height, gender
// ─────────────────────────────────────────────

/**
 * Build a smooth lathe profile for a body section.
 * points = array of [radius, y] pairs (bottom → top)
 */
const makeLatheGeo = (points, segments = 32) => {
  const vecs = points.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(vecs, segments);
};

/**
 * Compute body shape params from user inputs.
 * Returns an object of radii/scales used by the body mesh.
 */
const computeBodyParams = (weightKg = 70, heightCm = 170, gender = 'male', goal = 'hypertrophy') => {
  // Normalise: weight 40–180 kg, height 140–210 cm
  const wN = THREE.MathUtils.clamp((weightKg - 40) / 140, 0, 1);  // 0=40kg, 1=180kg
  const hN = THREE.MathUtils.clamp((heightCm - 140) / 70, 0, 1); // 0=140cm, 1=210cm
  const isMale = gender === 'male';

  // BMI-style category
  const bmi = weightKg / ((heightCm / 100) ** 2);
  const isThin   = bmi < 18.5;
  const isNormal = bmi >= 18.5 && bmi < 25;
  const isFat    = bmi >= 30;
  const isMusc   = goal === 'hypertrophy' && bmi >= 22 && bmi < 30;

  // Overall vertical scale (height)
  const heightScale = THREE.MathUtils.mapLinear(heightCm, 140, 210, 0.78, 1.22);

  // Waist width
  const waist = isFat
    ? THREE.MathUtils.mapLinear(bmi, 30, 45, 0.22, 0.42)
    : isThin
    ? THREE.MathUtils.mapLinear(bmi, 12, 18.5, 0.13, 0.18)
    : isMusc
    ? THREE.MathUtils.mapLinear(bmi, 22, 30, 0.18, 0.22)
    : THREE.MathUtils.mapLinear(bmi, 18.5, 30, 0.17, 0.28);

  // Shoulder width
  const shoulder = isFat
    ? THREE.MathUtils.mapLinear(bmi, 30, 45, isMale ? 0.38 : 0.33, isMale ? 0.55 : 0.48)
    : isThin
    ? (isMale ? 0.26 : 0.22)
    : isMusc
    ? THREE.MathUtils.mapLinear(bmi, 22, 30, isMale ? 0.36 : 0.30, isMale ? 0.46 : 0.38)
    : THREE.MathUtils.mapLinear(bmi, 18.5, 30, isMale ? 0.30 : 0.26, isMale ? 0.42 : 0.36);

  // Hip width
  const hip = isFat
    ? THREE.MathUtils.mapLinear(bmi, 30, 45, isMale ? 0.30 : 0.38, isMale ? 0.48 : 0.60)
    : isThin
    ? (isMale ? 0.19 : 0.22)
    : isMusc
    ? (isMale ? 0.28 : 0.29)
    : THREE.MathUtils.mapLinear(bmi, 18.5, 30, isMale ? 0.22 : 0.28, isMale ? 0.35 : 0.44);

  // Chest depth
  const chest = isFat
    ? THREE.MathUtils.mapLinear(bmi, 30, 45, 0.30, 0.50)
    : isThin ? 0.20
    : isMusc ? THREE.MathUtils.mapLinear(bmi, 22, 30, 0.28, 0.38)
    : THREE.MathUtils.mapLinear(bmi, 18.5, 30, 0.22, 0.38);

  // Arm radius
  const armR = isFat
    ? THREE.MathUtils.mapLinear(bmi, 30, 45, 0.09, 0.16)
    : isThin ? 0.055
    : isMusc ? THREE.MathUtils.mapLinear(bmi, 22, 30, 0.09, 0.14)
    : THREE.MathUtils.mapLinear(bmi, 18.5, 30, 0.07, 0.12);

  // Thigh radius
  const thighR = isFat
    ? THREE.MathUtils.mapLinear(bmi, 30, 45, isMale ? 0.14 : 0.18, isMale ? 0.22 : 0.28)
    : isThin ? 0.09
    : isMusc ? THREE.MathUtils.mapLinear(bmi, 22, 30, isMale ? 0.13 : 0.13, isMale ? 0.18 : 0.16)
    : THREE.MathUtils.mapLinear(bmi, 18.5, 30, isMale ? 0.11 : 0.13, isMale ? 0.18 : 0.22);

  return { heightScale, waist, shoulder, hip, chest, armR, thighR, bmi, isThin, isFat, isMusc, isMale };
};

// ── Single body segment mesh via LatheGeometry ──
const BodySegment = ({ points, color, emissive, metalness = 0.45, roughness = 0.3, opacity = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const geo = useMemo(() => makeLatheGeo(points), [JSON.stringify(points)]);
  return (
    <mesh geometry={geo} position={position} rotation={rotation}>
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={0.08}
        metalness={metalness}
        roughness={roughness}
        opacity={opacity}
        transparent={opacity < 1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ── Arm (upper + forearm as single lathe) ──
const Arm = ({ p, side, color, accentColor, armR, heightScale }) => {
  const x = side * (p.shoulder + armR * 0.6);
  const foreR = armR * 0.78;
  const handR = armR * 0.58;

  // Upper arm: slightly flared at top
  const upperPoints = [
    [armR * 0.7, 0],
    [armR, 0.12 / heightScale],
    [armR * 0.95, 0.22 / heightScale],
    [armR * 0.85, 0.38 / heightScale],
  ];
  // Forearm + hand
  const forePoints = [
    [foreR, 0],
    [foreR * 0.95, 0.14 / heightScale],
    [foreR * 0.88, 0.30 / heightScale],
    [handR * 1.1, 0.36 / heightScale],
    [handR, 0.42 / heightScale],
  ];

  // Angle: arms hang slightly outward
  const tilt = side * 0.18;

  return (
    <group position={[x, 0, 0]} rotation={[0, 0, tilt]}>
      <BodySegment points={upperPoints} color={color} position={[0, 0.26, 0]} />
      <BodySegment points={forePoints} color={color} position={[0, -0.16, 0]} />
    </group>
  );
};

// ── Leg ──
const Leg = ({ side, color, accentColor, thighR, heightScale }) => {
  const x = side * 0.13;
  const shinR = thighR * 0.72;
  const ankleR = thighR * 0.44;
  const footR = thighR * 0.52;

  const thighPoints = [
    [thighR * 0.85, 0],
    [thighR, 0.1],
    [thighR * 0.98, 0.24],
    [thighR * 0.88, 0.38],
    [shinR * 1.1, 0.44],
  ];
  const shinPoints = [
    [shinR, 0],
    [shinR * 0.95, 0.12],
    [shinR * 0.82, 0.28],
    [ankleR * 1.2, 0.36],
    [ankleR, 0.40],
  ];

  return (
    <group position={[x, 0, 0]}>
      <BodySegment points={thighPoints} color={accentColor} position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]} />
      <BodySegment points={shinPoints} color={color} position={[0, -0.66, 0]} rotation={[Math.PI, 0, 0]} />
      {/* Foot */}
      <mesh position={[side * 0.018, -1.08, 0.04]}>
        <boxGeometry args={[ankleR * 1.6, ankleR * 0.7, ankleR * 2.8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
};

// ── Main Mannequin ──
const Mannequin = ({ weight = 70, height = 170, gender = 'male', goal = 'hypertrophy' }) => {
  const groupRef = useRef();
  const targetParams = useRef(null);
  const currentParams = useRef(null);

  // Smooth lerp state
  const lerpState = useRef({
    heightScale: 1, waist: 0.19, shoulder: 0.32, hip: 0.26,
    chest: 0.26, armR: 0.08, thighR: 0.13
  });

  const newParams = computeBodyParams(weight, height, gender, goal);
  targetParams.current = newParams;

  useFrame(() => {
    if (!groupRef.current) return;
    const t = 0.06;
    const ls = lerpState.current;
    const tp = targetParams.current;
    // Lerp all params
    ls.heightScale = THREE.MathUtils.lerp(ls.heightScale, tp.heightScale, t);
    ls.waist = THREE.MathUtils.lerp(ls.waist, tp.waist, t);
    ls.shoulder = THREE.MathUtils.lerp(ls.shoulder, tp.shoulder, t);
    ls.hip = THREE.MathUtils.lerp(ls.hip, tp.hip, t);
    ls.chest = THREE.MathUtils.lerp(ls.chest, tp.chest, t);
    ls.armR = THREE.MathUtils.lerp(ls.armR, tp.armR, t);
    ls.thighR = THREE.MathUtils.lerp(ls.thighR, tp.thighR, t);

    groupRef.current.scale.y = ls.heightScale;
    groupRef.current.rotation.y += 0.004;
  });

  const isMale = gender === 'male';
  const baseColor   = isMale ? '#6EC8E0' : '#e879b0';
  const accentColor = isMale ? '#1A4B8C' : '#9B2EA0';
  const skinColor   = isMale ? '#7dd4e8' : '#f09fcc';

  // We use lerpState for rendering — but since Three/R3F re-renders via useFrame
  // we need to drive the geometry from a reactive useState that gets updated each frame.
  // Instead, we'll compute geometry once and rely on scale transforms + mesh deformation
  // by using a key that only changes when params cross thresholds.
  const p = lerpState.current;

  // ── Torso: lathe profile (waist, chest, shoulder) ──
  // Points from bottom (pelvis) to top (shoulder line), y=0 at hip, y=1 at shoulder
  const torsoPoints = useMemo(() => {
    const s = lerpState.current;
    return [
      [s.hip * 0.85,    0.00],   // hip bottom
      [s.hip,           0.06],   // widest hip
      [s.hip * 0.92,    0.14],
      [s.waist * 1.1,   0.28],  // waist narrow
      [s.waist,         0.36],   // true waist
      [s.waist * 1.15,  0.44],
      [s.chest * 0.85,  0.54],
      [s.chest,         0.62],   // mid chest
      [s.shoulder * 0.9,0.74],
      [s.shoulder,      0.82],   // widest shoulder
      [s.shoulder * 0.7,0.92],  // neck taper
      [s.shoulder * 0.18, 1.00], // neck top
    ];
  }, []);

  // Because lathe geo must be recomputed reactively, we use a dynamic approach:
  // render a TorsoMesh component that owns its geometry and self-updates via useFrame.
  return (
    <group ref={groupRef}>
      <TorsoMesh
        weight={weight}
        height={height}
        gender={gender}
        goal={goal}
        baseColor={baseColor}
        accentColor={accentColor}
        skinColor={skinColor}
      />
    </group>
  );
};

// ── TorsoMesh: owns geometry refs and morphs them via useFrame ──
const TorsoMesh = ({ weight, height, gender, goal, baseColor, accentColor, skinColor }) => {
  const torsoRef    = useRef();
  const neckRef     = useRef();
  const headRef     = useRef();
  const pelvisRef   = useRef();
  const lUpperRef   = useRef();
  const rUpperRef   = useRef();
  const lForeRef    = useRef();
  const rForeRef    = useRef();
  const lThighRef   = useRef();
  const rThighRef   = useRef();
  const lShinRef    = useRef();
  const rShinRef    = useRef();
  const lFootRef    = useRef();
  const rFootRef    = useRef();
  const shadowRef   = useRef();

  // Lerped params
  const ls = useRef({
    heightScale: 1, waist: 0.19, shoulder: 0.32, hip: 0.26,
    chest: 0.26, armR: 0.08, thighR: 0.13,
    isMale: gender === 'male',
  });

  const rootRef = useRef();

  useFrame(() => {
    const t = 0.055;
    const tp = computeBodyParams(weight, height, gender, goal);
    const s  = ls.current;

    s.heightScale = THREE.MathUtils.lerp(s.heightScale, tp.heightScale, t);
    s.waist    = THREE.MathUtils.lerp(s.waist,    tp.waist,    t);
    s.shoulder = THREE.MathUtils.lerp(s.shoulder, tp.shoulder, t);
    s.hip      = THREE.MathUtils.lerp(s.hip,      tp.hip,      t);
    s.chest    = THREE.MathUtils.lerp(s.chest,    tp.chest,    t);
    s.armR     = THREE.MathUtils.lerp(s.armR,     tp.armR,     t);
    s.thighR   = THREE.MathUtils.lerp(s.thighR,   tp.thighR,   t);

    if (!rootRef.current) return;
    rootRef.current.scale.y = s.heightScale;

    // Update torso geometry
    if (torsoRef.current) {
      const newGeo = makeTorsoGeo(s);
      torsoRef.current.geometry.dispose();
      torsoRef.current.geometry = newGeo;
    }
    // Update limbs by scaling
    const shinR = s.thighR * 0.72;
    const armForeR = s.armR * 0.78;
    const isMale = gender === 'male';
    const armX = s.shoulder + s.armR * 0.6;
    const tiltAngle = 0.22;

    [lUpperRef, rUpperRef].forEach((ref, i) => {
      if (!ref.current) return;
      const side = i === 0 ? -1 : 1;
      ref.current.position.x = side * armX;
      ref.current.scale.set(s.armR / 0.08, 1, s.armR / 0.08);
    });
    [lForeRef, rForeRef].forEach((ref, i) => {
      if (!ref.current) return;
      const side = i === 0 ? -1 : 1;
      ref.current.position.x = side * armX;
      ref.current.scale.set(s.armR / 0.08, 1, s.armR / 0.08);
    });

    const legOffX = Math.max(s.hip * 0.52, s.thighR * 0.8);
    [lThighRef, rThighRef].forEach((ref, i) => {
      if (!ref.current) return;
      const side = i === 0 ? -1 : 1;
      ref.current.position.x = side * legOffX;
      ref.current.scale.set(s.thighR / 0.13, 1, s.thighR / 0.13);
    });
    [lShinRef, rShinRef].forEach((ref, i) => {
      if (!ref.current) return;
      const side = i === 0 ? -1 : 1;
      ref.current.position.x = side * legOffX;
      ref.current.scale.set(shinR / 0.09, 1, shinR / 0.09);
    });
    [lFootRef, rFootRef].forEach((ref, i) => {
      if (!ref.current) return;
      const side = i === 0 ? -1 : 1;
      ref.current.position.x = side * legOffX + side * 0.015;
      ref.current.scale.set(s.thighR / 0.13, 1, s.thighR / 0.13);
    });

    // Shadow
    if (shadowRef.current) {
      const w = Math.max(s.shoulder, s.hip) * 1.6;
      shadowRef.current.scale.set(w / 0.3, 1, w / 0.3);
    }

    // Head size based on gender + fat
    if (headRef.current) {
      const headS = isMale ? 0.19 : 0.175;
      headRef.current.scale.setScalar(headS / 0.18);
    }
  });

  return (
    <group ref={rootRef}>
      {/* Torso + neck as one lathe */}
      <mesh ref={torsoRef} position={[0, 0, 0]}>
        <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.22} side={THREE.DoubleSide} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.16, 0]}>
        <sphereGeometry args={[0.18, 28, 28]} />
        <meshStandardMaterial color={baseColor} metalness={0.35} roughness={0.3} />
      </mesh>

      {/* ── Left arm ── */}
      <group ref={lUpperRef} position={[-0.42, 0.84, 0]} rotation={[0, 0, 0.26]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.072, 0.40, 16]} />
          <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Shoulder sphere */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.09, 14, 14]} />
          <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.25} />
        </mesh>
        {/* Elbow sphere */}
        <mesh position={[0, -0.20, 0]}>
          <sphereGeometry args={[0.072, 12, 12]} />
          <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
      <group ref={lForeRef} position={[-0.54, 0.48, 0]} rotation={[0, 0, 0.38]}>
        <mesh>
          <cylinderGeometry args={[0.064, 0.050, 0.36, 16]} />
          <meshStandardMaterial color={baseColor} metalness={0.35} roughness={0.3} />
        </mesh>
        {/* Wrist/hand */}
        <mesh position={[0, -0.20, 0]}>
          <sphereGeometry args={[0.054, 12, 12]} />
          <meshStandardMaterial color={skinColor} metalness={0.2} roughness={0.5} />
        </mesh>
      </group>

      {/* ── Right arm ── */}
      <group ref={rUpperRef} position={[0.42, 0.84, 0]} rotation={[0, 0, -0.26]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.072, 0.40, 16]} />
          <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.09, 14, 14]} />
          <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.20, 0]}>
          <sphereGeometry args={[0.072, 12, 12]} />
          <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
      <group ref={rForeRef} position={[0.54, 0.48, 0]} rotation={[0, 0, -0.38]}>
        <mesh>
          <cylinderGeometry args={[0.064, 0.050, 0.36, 16]} />
          <meshStandardMaterial color={baseColor} metalness={0.35} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.20, 0]}>
          <sphereGeometry args={[0.054, 12, 12]} />
          <meshStandardMaterial color={skinColor} metalness={0.2} roughness={0.5} />
        </mesh>
      </group>

      {/* ── Left leg ── */}
      <group ref={lThighRef} position={[-0.15, -0.26, 0]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.11, 0.50, 18]} />
          <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.25} />
        </mesh>
        {/* Hip joint */}
        <mesh position={[0, 0.27, 0]}>
          <sphereGeometry args={[0.135, 14, 14]} />
          <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.22} />
        </mesh>
        {/* Knee joint */}
        <mesh position={[0, -0.27, 0]}>
          <sphereGeometry args={[0.108, 14, 14]} />
          <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
      <group ref={lShinRef} position={[-0.15, -0.78, 0]}>
        <mesh>
          <cylinderGeometry args={[0.090, 0.064, 0.46, 16]} />
          <meshStandardMaterial color={baseColor} metalness={0.38} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={baseColor} metalness={0.35} roughness={0.4} />
        </mesh>
      </group>
      <mesh ref={lFootRef} position={[-0.15, -1.06, 0.045]}>
        <boxGeometry args={[0.14, 0.07, 0.28]} />
        <meshStandardMaterial color={skinColor} metalness={0.2} roughness={0.6} />
      </mesh>

      {/* ── Right leg ── */}
      <group ref={rThighRef} position={[0.15, -0.26, 0]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.11, 0.50, 18]} />
          <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <sphereGeometry args={[0.135, 14, 14]} />
          <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.22} />
        </mesh>
        <mesh position={[0, -0.27, 0]}>
          <sphereGeometry args={[0.108, 14, 14]} />
          <meshStandardMaterial color={baseColor} metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
      <group ref={rShinRef} position={[0.15, -0.78, 0]}>
        <mesh>
          <cylinderGeometry args={[0.090, 0.064, 0.46, 16]} />
          <meshStandardMaterial color={baseColor} metalness={0.38} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={baseColor} metalness={0.35} roughness={0.4} />
        </mesh>
      </group>
      <mesh ref={rFootRef} position={[0.15, -1.06, 0.045]}>
        <boxGeometry args={[0.14, 0.07, 0.28]} />
        <meshStandardMaterial color={skinColor} metalness={0.2} roughness={0.6} />
      </mesh>

      {/* Ground shadow */}
      <mesh ref={shadowRef} position={[0, -1.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial color="#6EC8E0" opacity={0.10} transparent />
      </mesh>
    </group>
  );
};

// ── Build torso lathe geometry from lerped state ──
function makeTorsoGeo(s) {
  const { waist, shoulder, hip, chest } = s;

  // Profile: pelvis (y=-0.52) up through hip, waist, chest, shoulder, neck (y=0.98)
  const pts = [
    new THREE.Vector2(hip * 0.5,      -0.52),
    new THREE.Vector2(hip * 0.88,     -0.42),
    new THREE.Vector2(hip,            -0.28),
    new THREE.Vector2(hip * 0.94,     -0.14),
    new THREE.Vector2(waist * 1.05,    0.00),  // waist
    new THREE.Vector2(waist,           0.10),
    new THREE.Vector2(waist * 1.08,    0.20),
    new THREE.Vector2(chest * 0.88,    0.35),
    new THREE.Vector2(chest,           0.48),  // lower chest
    new THREE.Vector2(chest * 1.02,    0.58),  // upper chest
    new THREE.Vector2(shoulder * 0.88, 0.70),
    new THREE.Vector2(shoulder,        0.80),  // shoulder
    new THREE.Vector2(shoulder * 0.62, 0.90),
    new THREE.Vector2(shoulder * 0.22, 0.98),  // neck base
    new THREE.Vector2(shoulder * 0.18, 1.04),  // neck top
  ];
  return new THREE.LatheGeometry(pts, 36);
}

// ─────────────────────────────────────────────
// Other 3D objects (unchanged / slightly refined)
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

const InjuryBody = ({ injuries = [] }) => {
  const groupRef = useRef();
  useFrame(() => { if (groupRef.current) groupRef.current.rotation.y += 0.006; });
  const zonePositions = {
    knees:      [0,   -0.80, 0.18],
    lower_back: [0,    0.00, -0.22],
    shoulders:  [0,    0.85, 0.15],
    elbows:     [-0.52, 0.55, 0.1],
    wrists:     [-0.66, 0.30, 0.1],
    neck:       [0,    1.10, 0.12],
  };
  return (
    <group ref={groupRef}>
      <Sphere args={[0.18, 20, 20]} position={[0, 1.20, 0]}>
        <meshStandardMaterial color="#6EC8E0" metalness={0.4} roughness={0.3} opacity={0.5} transparent />
      </Sphere>
      <Cylinder args={[0.26, 0.22, 0.75, 20]} position={[0, 0.70, 0]}>
        <meshStandardMaterial color="#1A4B8C" metalness={0.5} roughness={0.25} opacity={0.55} transparent />
      </Cylinder>
      <Cylinder args={[0.24, 0.24, 0.28, 20]} position={[0, 0.22, 0]}>
        <meshStandardMaterial color="#1A4B8C" metalness={0.5} roughness={0.25} opacity={0.5} transparent />
      </Cylinder>
      {[-0.14, 0.14].map(x => (
        <React.Fragment key={x}>
          <Cylinder args={[0.10, 0.09, 0.44, 14]} position={[x, -0.12, 0]}>
            <meshStandardMaterial color="#1A4B8C" opacity={0.5} transparent />
          </Cylinder>
          <Cylinder args={[0.075, 0.058, 0.42, 14]} position={[x, -0.58, 0]}>
            <meshStandardMaterial color="#6EC8E0" opacity={0.4} transparent />
          </Cylinder>
        </React.Fragment>
      ))}
      {injuries.map(inj => {
        const pos = zonePositions[inj];
        if (!pos) return null;
        return (
          <Float key={inj} speed={3} floatIntensity={0.3}>
            <Sphere args={[0.14, 16, 16]} position={pos}>
              <meshStandardMaterial color="#f87171" emissive="#f87171" emissiveIntensity={0.9} opacity={0.85} transparent />
            </Sphere>
          </Float>
        );
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

const Scene3D = ({ children, camera = [0, 0, 4.5] }) => (
  <Canvas camera={{ position: camera, fov: 48 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true }}>
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
// Canvas wrappers per step
// ─────────────────────────────────────────────
const Step1Canvas = ({ data }) => (
  <Scene3D camera={[0, 0.05, 3.6]}>
    <Mannequin
      weight={data.weight || 70}
      height={data.height || 170}
      gender={data.gender}
      goal={data.training_goal || 'hypertrophy'}
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
    <Scene3D camera={[0, 0.3, 4]}>
      <InjuryBody injuries={inj} />
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

            {/* Body type label (step 1 only) */}
            {step === 1 && (() => {
              const bmi = formData.weight && formData.height
                ? formData.weight / ((formData.height / 100) ** 2) : 0;
              const typeLabel = bmi < 18.5 ? 'Delgado' : bmi < 22 ? 'Esbelto' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Sobrepeso' : 'Obeso';
              const typeColor = bmi < 18.5 ? '#93c5fd' : bmi < 25 ? '#6EC8E0' : bmi < 30 ? '#fbbf24' : '#f87171';
              return (
                <div style={{
                  position:'absolute', top:16, right:20,
                  background:'rgba(10,20,50,0.8)',
                  border:`1px solid ${typeColor}44`,
                  borderRadius:10, padding:'6px 12px',
                  backdropFilter:'blur(8px)',
                }}>
                  <div style={{ color: typeColor, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13 }}>{typeLabel}</div>
                  <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, marginTop:1 }}>
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