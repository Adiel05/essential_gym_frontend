// src/pages/SocioDashboard.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Sphere, OrbitControls, TorusKnot } from '@react-three/drei';
import {
  Dumbbell, CheckCircle, Volume2, VolumeX, Award, Flame, Zap, Target, Heart, Activity, ChevronRight,
  Trophy, Clock, RefreshCw, ChevronLeft, BarChart2, LogOut, User, Calendar, Camera
} from 'lucide-react';
import axios from 'axios';
import { getCurrentUser, logout } from '../services/auth';
import { useSound } from '../hooks/useSound';
import { Howl } from 'howler';

// ========== ESTILOS GLOBALES ==========
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  
  * { box-sizing: border-box; }

  :root {
    --navy: #07122a;
    --blue: #1A4B8C;
    --cyan: #6EC8E0;
    --cyan-dim: rgba(110,200,224,0.15);
    --cyan-border: rgba(110,200,224,0.3);
    --glass: rgba(255,255,255,0.06);
    --glass-hover: rgba(255,255,255,0.1);
    --glass-border: rgba(255,255,255,0.12);
    --text-primary: rgba(255,255,255,0.95);
    --text-secondary: rgba(255,255,255,0.55);
    --text-muted: rgba(255,255,255,0.3);
    --green: #22c55e;
    --green-dim: rgba(34,197,94,0.12);
    --green-border: rgba(34,197,94,0.35);
  }

  .dashboard-root {
    font-family: 'DM Sans', sans-serif;
    background: radial-gradient(ellipse at 20% 20%, #0d1f4a 0%, #07122a 50%, #020b1a 100%);
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
  }

  .heading { font-family: 'Syne', sans-serif; }

  /* Scrollbar */
  .custom-scroll::-webkit-scrollbar { width: 4px; }
  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(110,200,224,0.25); border-radius: 4px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(110,200,224,0.5); }

  /* Progress bar glow */
  .progress-fill {
    background: linear-gradient(90deg, #1A4B8C, #6EC8E0);
    box-shadow: 0 0 12px rgba(110,200,224,0.5);
  }

  /* Exercise card */
  .ex-card {
    background: rgba(10,20,50,0.6);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    transition: all 0.25s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .ex-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(110,200,224,0.4), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .ex-card:hover::before { opacity: 1; }
  .ex-card:hover {
    border-color: var(--cyan-border);
    background: rgba(10,25,65,0.75);
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(110,200,224,0.15);
  }
  .ex-card.completed {
    background: rgba(10,40,25,0.5);
    border-color: var(--green-border);
  }
  .ex-card.completed::before {
    background: linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent);
    opacity: 1;
  }

  /* Stat pill */
  .stat-pill {
    background: rgba(110,200,224,0.1);
    border: 1px solid rgba(110,200,224,0.2);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 11px;
    color: rgba(110,200,224,0.9);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }

  /* Glow button */
  .btn-glow {
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    border: none;
    border-radius: 14px;
    color: white;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: 0 4px 20px rgba(110,200,224,0.25);
  }
  .btn-glow::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  .btn-glow:hover::after { transform: translateX(100%); }
  .btn-glow:hover { box-shadow: 0 8px 32px rgba(110,200,224,0.4); transform: translateY(-1px); }

  /* Number badge */
  .ex-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 13px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(110,200,224,0.3);
  }

  /* Modal */
  .modal-card {
    background: linear-gradient(145deg, #0a1630, #0d2050);
    border: 1px solid rgba(110,200,224,0.2);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,200,224,0.05);
  }

  /* Metric card in modal */
  .metric-box {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 16px;
    text-align: center;
  }
  .metric-val {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: #6EC8E0;
    line-height: 1;
  }
  .metric-label { font-size: 11px; color: var(--text-secondary); margin-top: 4px; }

  /* Segmented controls */
  .seg-btn {
    flex: 1;
    padding: 8px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .seg-btn.active {
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    border-color: transparent;
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(110,200,224,0.3);
  }
  .seg-btn:hover:not(.active) { background: rgba(255,255,255,0.06); color: var(--text-primary); }

  /* Rating number btn */
  .rate-btn {
    flex: 1;
    padding: 10px 4px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    font-family: 'Syne', sans-serif;
  }
  .rate-btn.active {
    background: linear-gradient(135deg, #1A4B8C, #6EC8E0);
    border-color: transparent;
    color: white;
    box-shadow: 0 2px 8px rgba(110,200,224,0.3);
  }
  .rate-btn:hover:not(.active) { background: rgba(255,255,255,0.08); color: var(--text-primary); }

  /* Gym GIF frame */
  .gif-frame {
    border-radius: 16px;
    overflow: hidden;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.08);
    position: relative;
  }
  .gif-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Navbar icon btn */
  .nav-icon-btn {
    width: 34px; height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: rgba(255,255,255,0.7);
  }
  .nav-icon-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(110,200,224,0.3); color: #6EC8E0; }

  /* Streak badge */
  .streak-badge {
    display: flex; align-items: center; gap: 5px;
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 12px;
    color: #fbbf24;
    font-weight: 600;
  }

  /* Complete overlay */
  .complete-check {
    position: absolute;
    top: 12px; right: 12px;
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(34,197,94,0.4);
  }

  /* Machine tag */
  .machine-tag {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    color: var(--text-secondary);
  }
`;

// ========== COMPONENTE 3D DE FONDO ==========
const GymBackground3D = () => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[-2, 3, 4]} intensity={0.8} color="#6EC8E0" />
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.5}>
        <Box args={[0.8, 0.8, 0.8]} position={[-2.5, 1.5, -2]}>
          <meshStandardMaterial color="#1A4B8C" metalness={0.7} roughness={0.3} />
        </Box>
      </Float>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.7}>
        <Sphere args={[0.6, 32, 32]} position={[2.5, -0.5, -1]}>
          <meshStandardMaterial color="#6EC8E0" metalness={0.8} roughness={0.2} emissive="#1A4B8C" emissiveIntensity={0.3} />
        </Sphere>
      </Float>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.3}>
        <TorusKnot args={[0.5, 0.12, 100, 16]} position={[0, 1.2, -3]}>
          <meshStandardMaterial color="#6EC8E0" metalness={0.6} roughness={0.4} emissive="#1A4B8C" emissiveIntensity={0.2} />
        </TorusKnot>
      </Float>
      {[...Array(40)].map((_, i) => (
        <Float key={i} speed={0.5 + Math.random() * 1.5} floatIntensity={0.3 + Math.random()}>
          <mesh position={[Math.sin(i) * 5, Math.cos(i * 1.5) * 3, Math.cos(i) * 4 - 3]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#6EC8E0" emissive="#1A4B8C" emissiveIntensity={0.4} />
          </mesh>
        </Float>
      ))}
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
    </Canvas>
  );
};

// ========== EXERCISE CARD ==========
const ExerciseCard = ({ ej, idx, completado, onComplete, onOpenDetail, onAlt, onOpenCorrector, playHover }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.4 }}
      className={`ex-card ${completado ? 'completed' : ''}`}
      onClick={() => onOpenDetail(idx)}
      onMouseEnter={playHover}
    >
      <div style={{ display: 'flex', gap: '16px', padding: '20px' }}>

        {/* GIF */}
        {ej.gif_url && (
          <div className="gif-frame" style={{ width: 110, height: 110, flexShrink: 0 }}>
            <img
              src={ej.gif_url}
              alt={ej.exercise_name}
              onError={(e) => e.target.parentElement.style.display = 'none'}
            />
            {completado && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,30,15,0.65)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 14
              }}>
                <CheckCircle size={36} color="#22c55e" />
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="ex-number">{idx + 1}</div>
              <h3 className="heading" style={{
                color: 'var(--text-primary)',
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2
              }}>
                {ej.exercise_name}
              </h3>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            <span className="stat-pill"><Zap size={10} />{ej.sets} series</span>
            <span className="stat-pill"><Target size={10} />{ej.reps} reps</span>
            <span className="stat-pill"><Clock size={10} />{ej.rest_seconds}s descanso</span>
          </div>

          {ej.machine_required && (
            <div style={{ marginBottom: 12 }}>
              <span className="machine-tag">🏋️ {ej.machine_required}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            {!completado ? (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={(e) => { e.stopPropagation(); onComplete(ej.id, ej.exercise_id); }}
                style={{
                  background: 'linear-gradient(135deg, #1A4B8C, #6EC8E0)',
                  border: 'none',
                  borderRadius: 10,
                  color: 'white',
                  padding: '7px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'DM Sans, sans-serif'
                }}
              >
                <CheckCircle size={13} /> Completar
              </motion.button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                color: '#22c55e', fontSize: 13, fontWeight: 600
              }}>
                <CheckCircle size={15} /> Completado
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={(e) => { e.stopPropagation(); onAlt(ej); }}
              title="Ver alternativas"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.6)',
                padding: '7px 10px',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={13} /> Alt.
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom progress indicator if completed */}
      {completado && (
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #16a34a, #22c55e)',
          boxShadow: '0 0 8px rgba(34,197,94,0.4)'
        }} />
      )}
    </motion.div>
  );
};

// ========== COMPONENTE PRINCIPAL ==========
const SocioDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [rutina, setRutina] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completados, setCompletados] = useState({});
  const [progreso, setProgreso] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [formLog, setFormLog] = useState({ difficulty: 'moderate', notes: '', weights: {} });
  const [allCompleted, setAllCompleted] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [showAltModal, setShowAltModal] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [currentExerciseForAlt, setCurrentExerciseForAlt] = useState(null);

  const playHover = useSound('/sounds/hover.mp3', 0.15);
  const playClick = useSound('/sounds/click.mp3', 0.2);
  const playComplete = useSound('/sounds/success.mp3', 0.3);
  const playError = useSound('/sounds/error.mp3', 0.25);

  useEffect(() => {
    const fetchRutina = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) { navigate('/login'); return; }
        const res = await axios.get('http://localhost:8000/api/training/rutina-hoy/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRutina(res.data);
        const initialCompleted = {};
        res.data.forEach(ej => { initialCompleted[ej.id] = ej.completed || false; });
        setCompletados(initialCompleted);

        const statusRes = await axios.get('http://localhost:8000/api/training/status/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statusRes.data.workout_completed) {
          setWorkoutCompleted(true);
        }
      } catch (err) {
        if (err.response?.status === 401) { logout(); navigate('/login'); }
      } finally { setLoading(false); }
    };
    fetchRutina();
  }, []);

  useEffect(() => {
    const total = rutina.length;
    if (total === 0) { setProgreso(0); return; }
    const count = Object.values(completados).filter(v => v === true).length;
    setProgreso((count / total) * 100);
  }, [completados, rutina]);

  useEffect(() => {
    setAllCompleted(rutina.length > 0 && Object.values(completados).every(v => v === true));
  }, [completados, rutina]);

  const toggleMute = () => {
    if (window.__bgMusic) {
      window.__bgMusic.volume(muted ? 0.1 : 0);
      setMuted(!muted);
    }
  };

  const handleComplete = async (id, exerciseId) => {
    if (completados[id]) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('/api/training/toggle-completion/', {
        exercise_id: exerciseId, completed: true
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCompletados(prev => ({ ...prev, [id]: true }));
      playComplete();
    } catch (err) { console.error('Error marking exercise:', err); }
  };

  const handleOpenModal = () => { if (allCompleted) setModalOpen(true); };

  const handleSubmitLog = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const feedback = { rpe: formLog.rpe, pain: formLog.pain, energy: formLog.energy, motivation: formLog.motivation, issue: formLog.issue, notes: formLog.notes };
      const weights = formLog.actual_weights || {};
      const payload = { difficulty: formLog.difficulty, actual_weights: { ...weights, _feedback: feedback }, notes: formLog.notes };
      await axios.post('http://localhost:8000/api/training/registrar-entreno/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      playClick();
      setModalOpen(false);
      setWorkoutCompleted(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    } catch (err) { playError(); alert('Error al registrar. Intenta de nuevo.'); }
  };

  const handleLogout = () => {
    if (window.__bgMusic) { window.__bgMusic.stop(); delete window.__bgMusic; }
    logout(); navigate('/login');
  };

  const openExerciseDetail = (index) => {
    setCurrentExerciseIndex(index);
    setSelectedExerciseDetail(rutina[index]);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => { setDetailModalOpen(false); setSelectedExerciseDetail(null); };

  const completeAndNext = async () => {
    const current = rutina[currentExerciseIndex];
    if (!completados[current.id]) await handleComplete(current.id, current.exercise_id);
    if (currentExerciseIndex + 1 < rutina.length) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedExerciseDetail(rutina[currentExerciseIndex + 1]);
    } else { closeDetailModal(); }
  };

  const handleOpenCorrectorFromModal = () => {
    if (selectedExerciseDetail) {
      navigate(`/corrector?exerciseName=${encodeURIComponent(selectedExerciseDetail.exercise_name)}&exerciseId=${selectedExerciseDetail.exercise_id}`);
    }
  };

  const fetchAlternatives = async (exercise) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`http://localhost:8000/api/training/alternatives/?exercise_id=${exercise.exercise_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlternatives(res.data);
      setCurrentExerciseForAlt(exercise);
      setShowAltModal(true);
    } catch (err) { console.error('Error fetching alternatives:', err); }
  };

  const replaceExercise = (oldExerciseId, newExercise) => {
    setRutina(prev => prev.map(ej => ej.id === oldExerciseId ? { ...ej, ...newExercise } : ej));
    setShowAltModal(false);
    alert(`Ejercicio reemplazado por: ${newExercise.name}`);
  };

  if (loading) {
    return (
      <div className="dashboard-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <style>{globalStyles}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: '3px solid rgba(110,200,224,0.2)',
            borderTopColor: '#6EC8E0',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
            Cargando tu rutina...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const ejerciciosCompletados = Object.values(completados).filter(v => v === true).length;
  const totalEjercicios = rutina.length;
  const caloriasEstimadas = totalEjercicios * 45;

  return (
    <div className="dashboard-root" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{globalStyles}</style>
      <GymBackground3D />

      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(7,18,42,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0
      }}>
        {/* Left: Logo + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #1A4B8C, #6EC8E0)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(110,200,224,0.3)',
            flexShrink: 0
          }}>
            <span className="heading" style={{ color: 'white', fontSize: 14, fontWeight: 800 }}>EG</span>
          </div>
          <div>
            <div className="heading" style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
              Essential Gym
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, display: 'flex', gap: 8 }}>
              <span>👋 {user?.username}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{user?.training_goal?.replace('_', ' ') || 'Sin objetivo'}</span>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="streak-badge">
            <Flame size={13} />
            <span>3 días</span>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
            onMouseEnter={playHover}
          >
            <Calendar size={16} className="text-white/70" />
          </button>
          <button className="nav-icon-btn" onClick={() => navigate('/exercises')} title="Ejercicios">
            <Dumbbell size={16} />
          </button>
          <button className="nav-icon-btn" onClick={toggleMute} title="Sonido">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 10,
              color: '#f87171',
              fontSize: 13, fontWeight: 600,
              padding: '6px 14px',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif'
            }}
          >
            <LogOut size={14} /> Salir
          </motion.button>
        </div>
      </nav>

      {/* ===== MAIN ===== */}
      <div style={{
        flex: 1,
        position: 'relative', zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 24px',
        overflow: 'hidden',
        gap: 16
      }}>

        {/* ===== STATS ROW ===== */}
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          {[
            { icon: <Dumbbell size={16} />, label: 'Ejercicios', value: `${ejerciciosCompletados}/${totalEjercicios}`, color: '#6EC8E0' },
            { icon: <Flame size={16} />, label: 'Calorías est.', value: `~${caloriasEstimadas}`, color: '#fb923c' },
            { icon: <Zap size={16} />, label: 'Restantes', value: totalEjercicios - ejerciciosCompletados, color: '#a78bfa' },
            { icon: <BarChart2 size={16} />, label: 'Progreso', value: `${Math.round(progreso)}%`, color: '#34d399' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                flex: 1,
                background: 'rgba(10,20,50,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `${s.color}18`,
                border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.color, flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div>
                <div className="heading" style={{ color: s.color, fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ===== PROGRESS BAR ===== */}
        <div style={{
          background: 'rgba(10,20,50,0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '14px 20px',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span className="heading" style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Rutina de hoy</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginLeft: 10 }}>
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <span className="heading" style={{ color: '#6EC8E0', fontWeight: 700, fontSize: 14 }}>
                {Math.round(progreso)}%
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 999 }}
              />
            </div>
          </div>
        </div>

        {/* ===== EXERCISE GRID ===== */}
        <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {rutina.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🏋️</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
                No hay ejercicios para hoy. Descansa o completa tu perfil.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
              paddingBottom: 16
            }}>
              {rutina.map((ej, idx) => (
                <ExerciseCard
                  key={ej.id}
                  ej={ej}
                  idx={idx}
                  completado={completados[ej.id]}
                  onComplete={handleComplete}
                  onOpenDetail={openExerciseDetail}
                  onAlt={fetchAlternatives}
                  onOpenCorrector={() => navigate(`/corrector?exerciseName=${encodeURIComponent(ej.exercise_name)}&exerciseId=${ej.exercise_id}`)}
                  playHover={playHover}
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== FINISH BUTTON ===== */}
        <AnimatePresence>
          {allCompleted && rutina.length > 0 && !workoutCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{ flexShrink: 0 }}
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenModal}
                className="btn-glow"
                style={{
                  width: '100%', padding: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  letterSpacing: '0.3px'
                }}
              >
                <Trophy size={20} color="#fbbf24" />
                <span>Finalizar entrenamiento</span>
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}
          {workoutCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'rgba(16,100,50,0.3)',
                border: '1px solid rgba(34,197,94,0.4)',
                borderRadius: 16, padding: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                color: '#4ade80', fontWeight: 700, fontSize: 15,
                fontFamily: 'Syne, sans-serif', flexShrink: 0
              }}
            >
              <CheckCircle size={20} /> ¡Entrenamiento completado!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== DETAIL MODAL ===== */}
      <AnimatePresence>
        {detailModalOpen && selectedExerciseDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, padding: '20px'
            }}
            onClick={closeDetailModal}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="modal-card"
              style={{ width: '100%', maxWidth: 820, maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1A4B8C, #0a3070)',
                padding: '20px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(110,200,224,0.2)'
              }}>
                <div>
                  <div style={{ color: 'rgba(110,200,224,0.7)', fontSize: 12, marginBottom: 4 }}>
                    Ejercicio {currentExerciseIndex + 1} de {rutina.length}
                  </div>
                  <h3 className="heading" style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0 }}>
                    {selectedExerciseDetail.exercise_name}
                  </h3>
                </div>
                <button onClick={closeDetailModal} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: 18, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>×</button>
              </div>

              <div style={{ padding: '24px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Left: GIF */}
                <div style={{ flex: '0 0 auto', width: 280 }}>
                  {selectedExerciseDetail.gif_url ? (
                    <div className="gif-frame" style={{ width: '100%', height: 280 }}>
                      <img src={selectedExerciseDetail.gif_url} alt={selectedExerciseDetail.exercise_name} />
                    </div>
                  ) : (
                    <div style={{
                      width: '100%', height: 280, background: 'rgba(0,0,0,0.3)',
                      borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.3)', fontSize: 14
                    }}>Sin GIF disponible</div>
                  )}
                </div>

                {/* Right: details */}
                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div className="metric-box">
                      <div className="metric-val">{selectedExerciseDetail.sets}</div>
                      <div className="metric-label">Series</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-val">{selectedExerciseDetail.reps}</div>
                      <div className="metric-label">Reps</div>
                    </div>
                    <div className="metric-box">
                      <div className="metric-val">{selectedExerciseDetail.rest_seconds}s</div>
                      <div className="metric-label">Descanso</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14, padding: 16
                  }}>
                    <div style={{ color: '#6EC8E0', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      📝 Descripción
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                      {selectedExerciseDetail.description || 'No hay descripción disponible para este ejercicio.'}
                    </p>
                  </div>

                  {selectedExerciseDetail.machine_required && (
                    <div style={{
                      background: 'rgba(110,200,224,0.08)',
                      border: '1px solid rgba(110,200,224,0.2)',
                      borderRadius: 12, padding: '10px 14px',
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: 'rgba(255,255,255,0.75)', fontSize: 13
                    }}>
                      🏋️ Máquina: <strong style={{ color: '#6EC8E0' }}>{selectedExerciseDetail.machine_required}</strong>
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>

                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={(e) => { e.stopPropagation(); handleOpenCorrectorFromModal(); }}
                      title="Corregir técnica con IA"
                      style={{
                        background: 'rgba(110,200,224,0.15)',
                        border: '1px solid rgba(110,200,224,0.3)',
                        borderRadius: 10,
                        color: '#6EC8E0',
                        padding: '7px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Camera size={13} /> Ayuda con la técnica
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={completeAndNext}
                      className="btn-glow"
                      style={{ flex: 2, padding: '12px', fontSize: 14, borderRadius: 14 }}
                    >
                      {completados[selectedExerciseDetail.id]
                        ? '▶ Siguiente ejercicio'
                        : '✔ Marcar y siguiente'}
                    </motion.button>

                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ALTERNATIVES MODAL ===== */}
      <AnimatePresence>
        {showAltModal && currentExerciseForAlt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, padding: '20px'
            }}
            onClick={() => setShowAltModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              className="modal-card"
              style={{ width: '100%', maxWidth: 560 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                background: 'linear-gradient(135deg, #1A4B8C, #0a3070)',
                padding: '20px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(110,200,224,0.2)'
              }}>
                <div>
                  <div style={{ color: 'rgba(110,200,224,0.7)', fontSize: 12, marginBottom: 4 }}>Alternativas para</div>
                  <h3 className="heading" style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: 0 }}>
                    {currentExerciseForAlt.exercise_name}
                  </h3>
                </div>
                <button onClick={() => setShowAltModal(false)} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: 18, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>×</button>
              </div>

              <div style={{ padding: '20px' }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 16 }}>
                  ¿Máquina ocupada? Prueba con uno de estos ejercicios similares:
                </p>
                <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                  {alternatives.map(alt => (
                    <div key={alt.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 14, padding: '14px 16px'
                    }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{alt.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                          {alt.machine_required || 'Sin máquina específica'}
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => replaceExercise(currentExerciseForAlt.id, alt)}
                        className="btn-glow"
                        style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10 }}
                      >
                        Usar esta
                      </motion.button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAltModal(false)} style={{
                  width: '100%', marginTop: 14, padding: '12px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif'
                }}>
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== POST-WORKOUT MODAL ===== */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, padding: '20px'
            }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              className="modal-card custom-scroll"
              style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1A4B8C, #0a3070)',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(110,200,224,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(251,191,36,0.2)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Award size={20} color="#fbbf24" />
                  </div>
                  <div>
                    <h3 className="heading" style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>
                      ¡Gran trabajo!
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0 }}>
                      Ayúdanos a mejorar tu próxima rutina
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* RPE */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Esfuerzo percibido (RPE 1–10)
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button key={n} className={`rate-btn ${formLog.rpe === n ? 'active' : ''}`}
                        onClick={() => setFormLog(p => ({ ...p, rpe: n }))}>{n}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Muy fácil</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Máximo</span>
                  </div>
                </div>

                {/* Dolor */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    ¿Sentiste dolor o molestias?
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { val: 'ninguno', label: '😊 Ninguno' },
                      { val: 'articular', label: '🦴 Articular' },
                      { val: 'muscular', label: '💪 Muscular' },
                      { val: 'agudo', label: '⚠️ Agudo' },
                    ].map(opt => (
                      <button key={opt.val}
                        className={`seg-btn ${formLog.pain === opt.val ? 'active' : ''}`}
                        style={{ padding: '10px', borderRadius: 12 }}
                        onClick={() => setFormLog(p => ({ ...p, pain: opt.val }))}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Nivel de energía (1–10)
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button key={n} className={`rate-btn ${formLog.energy === n ? 'active' : ''}`}
                        onClick={() => setFormLog(p => ({ ...p, energy: n }))}>{n}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Agotado</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Lleno</span>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Motivación (1–5)
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[
                      { n: 1, e: '😞' }, { n: 2, e: '😐' }, { n: 3, e: '🙂' }, { n: 4, e: '😄' }, { n: 5, e: '🔥' }
                    ].map(({ n, e }) => (
                      <button key={n}
                        className={`seg-btn ${formLog.motivation === n ? 'active' : ''}`}
                        style={{ padding: '10px 6px', flexDirection: 'column', display: 'flex', alignItems: 'center', gap: 2, borderRadius: 12 }}
                        onClick={() => setFormLog(p => ({ ...p, motivation: n }))}>
                        <span style={{ fontSize: 18 }}>{e}</span>
                        <span style={{ fontSize: 11 }}>{n}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Dificultad general
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { val: 'easy', label: '😊 Fácil' },
                      { val: 'moderate', label: '😐 Moderado' },
                      { val: 'hard', label: '😤 Difícil' },
                    ].map(opt => (
                      <button key={opt.val}
                        className={`seg-btn ${formLog.difficulty === opt.val ? 'active' : ''}`}
                        style={{ padding: '10px', borderRadius: 12 }}
                        onClick={() => setFormLog(p => ({ ...p, difficulty: opt.val }))}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issues */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    ¿Algo que no funcionó? <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(opcional)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['pesado', 'muchas repeticiones', 'falta de tiempo', 'dolor', 'ninguna'].map(issue => (
                      <button key={issue}
                        className={`seg-btn ${formLog.issue === issue ? 'active' : ''}`}
                        style={{ padding: '8px', borderRadius: 10, fontSize: 12 }}
                        onClick={() => setFormLog(p => ({ ...p, issue }))}>
                        {issue}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setModalOpen(false)} style={{
                    flex: 1, padding: '13px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    Cancelar
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmitLog}
                    className="btn-glow"
                    style={{ flex: 2, padding: '13px', fontSize: 15, borderRadius: 14 }}
                  >
                    Guardar registro
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CELEBRATION ===== */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'fixed', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100, pointerEvents: 'none'
            }}
          >
            <motion.div
              animate={{
                boxShadow: ['0 0 0px #6EC8E0', '0 0 40px #6EC8E0', '0 0 0px #6EC8E0'],
                transition: { repeat: Infinity, duration: 1.5 }
              }}
              style={{
                background: 'linear-gradient(135deg, #0a3070, #1A4B8C)',
                border: '1px solid rgba(110,200,224,0.4)',
                borderRadius: 24, padding: '32px 40px',
                textAlign: 'center', maxWidth: 400, margin: '0 20px'
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: 56, marginBottom: 12 }}
              >
                🎉🏆🎉
              </motion.div>
              <h3 className="heading" style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                ¡ENTRENAMIENTO COMPLETADO!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                ¡Excelente trabajo! Sigue así, cada día estás más cerca de tus metas. 💪
              </p>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ color: '#fbbf24', fontSize: 16, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}
              >
                🔥 ¡Eres imparable! 🔥
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocioDashboard;