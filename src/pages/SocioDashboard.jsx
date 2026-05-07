// src/pages/SocioDashboard.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Sphere, OrbitControls, TorusKnot } from '@react-three/drei';
import {
  Dumbbell, CheckCircle, Volume2, VolumeX, Award, Flame, Zap, Target, Heart, Activity, ChevronRight,
  Trophy, Clock
} from 'lucide-react';
import axios from 'axios';
import { getCurrentUser, logout } from '../services/auth';
import { useSound } from '../hooks/useSound';
import { Howl } from 'howler';

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
  const [hoveredCard, setHoveredCard] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);

  // Sonidos
  const playHover = useSound('/sounds/hover.mp3', 0.15);
  const playClick = useSound('/sounds/click.mp3', 0.2);
  const playComplete = useSound('/sounds/success.mp3', 0.3);
  const playError = useSound('/sounds/error.mp3', 0.25);

  // Cargar rutina del día
  useEffect(() => {
    const fetchRutina = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No hay token, redirigiendo a login...');
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:8000/api/training/rutina-hoy/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRutina(res.data);
        const initialCompleted = {};
        res.data.forEach(ej => {
          initialCompleted[ej.id] = ej.completed || false;
        });
        setCompletados(initialCompleted);
      } catch (err) {
        console.error('Error fetching routine:', err);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRutina();
  }, []);

  // Recalcular progreso
  useEffect(() => {
    const total = rutina.length;
    if (total === 0) {
      setProgreso(0);
      return;
    }
    const completadosCount = Object.values(completados).filter(v => v === true).length;
    setProgreso((completadosCount / total) * 100);
  }, [completados, rutina]);

  // Recalcular allCompleted
  useEffect(() => {
    const all = rutina.length > 0 && Object.values(completados).every(v => v === true);
    setAllCompleted(all);
  }, [completados, rutina]);

  const toggleMute = () => {
    if (window.__bgMusic) {
      if (muted) {
        window.__bgMusic.volume(0.1);
      } else {
        window.__bgMusic.volume(0);
      }
      setMuted(!muted);
    }
  };

  useEffect(() => {
    if (window.__bgMusic) {
      window.__bgMusic.volume(muted ? 0 : 0.1);
    }
  }, []);

  const handleComplete = async (id, exerciseId) => {
    if (completados[id]) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('/api/training/toggle-completion/', {
        exercise_id: exerciseId,
        completed: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletados(prev => ({ ...prev, [id]: true }));
      playComplete();
    } catch (err) {
      console.error('Error marking exercise:', err);
    }
  };

  const handleOpenModal = () => {
    if (allCompleted) setModalOpen(true);
  };

  const handleSubmitLog = async () => {
    try {
      await axios.post('http://localhost:8000/api/training/registrar-entreno/', {
        difficulty: formLog.difficulty,
        notes: formLog.notes,
        actual_weights: formLog.weights
      });
      playClick();
      setModalOpen(false);
      alert('¡Entrenamiento registrado exitosamente! 🎉');
    } catch (err) {
      console.error(err);
      playError();
    }
  };

  const handleLogout = () => {
    if (window.__bgMusic) {
      window.__bgMusic.stop();
      delete window.__bgMusic;
    }
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6EC8E0]"></div>
      </div>
    );
  }

  const ejerciciosCompletados = Object.values(completados).filter(v => v === true).length;
  const totalEjercicios = rutina.length;
  const caloriasEstimadas = totalEjercicios * 45;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-[#07122a] to-[#1A4B8C]">
      <GymBackground3D />

      <div className="relative z-10 flex flex-col h-full">
        {/* Navbar compacta */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-2 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#1A4B8C] to-[#6EC8E0] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-black">EG</span>
            </div>
            <div>
              <span className="text-white font-bold text-base">Essential Gym</span>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>👋 Hola, {user?.username}</span>
                <span>•</span>
                <span>🎯 {user?.training_goal?.replace('_', ' ') || 'Sin objetivo'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full">
              <Flame size={12} className="text-yellow-400" />
              <span className="text-white text-xs">3 días seguidos</span>
            </div>
            <button onClick={toggleMute} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition">
              {muted ? <VolumeX size={16} className="text-white/70" /> : <Volume2 size={16} className="text-white/70" />}
            </button>
            <button onClick={handleLogout} className="bg-red-500/80 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition">
              Salir
            </button>
          </div>
        </nav>

        {/* Contenido principal - ocupa todo el alto restante, sin scroll */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden flex flex-col h-full max-h-[calc(100%-2rem)]"
          >
            {/* Header progreso compacto */}
            <div className="bg-gradient-to-r from-[#1A4B8C]/50 to-[#6EC8E0]/50 px-4 py-3 border-b border-white/20 shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#6EC8E0]" /> Rutina de hoy
                  </h2>
                  <p className="text-white/60 text-[10px]">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right text-xs text-white/80 flex gap-2">
                  <span className="flex items-center gap-1"><Zap size={12} className="text-yellow-400" /> {totalEjercicios - ejerciciosCompletados} restantes</span>
                  <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> ~{caloriasEstimadas} cal</span>
                </div>
              </div>
              <div className="mt-1 relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#6EC8E0] to-[#1A4B8C] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-white/70 text-[10px] mt-0.5">{Math.round(progreso)}% completado</p>
            </div>

            {/* Grid de ejercicios - ocupará el espacio disponible y se desplazará solo si es necesario */}
            <div className="flex-1 p-4 overflow-y-auto custom-scroll">
              {rutina.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🏋️</div>
                  <p className="text-white/70 text-sm">No hay ejercicios para hoy. Descansa o completa tu perfil.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rutina.map((ej, idx) => (
                    <motion.div
                      key={ej.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onMouseEnter={() => { setHoveredCard(ej.id); playHover(); }}
                      onMouseLeave={() => setHoveredCard(null)}
                      className={`relative group rounded-lg p-3 transition-all duration-300 ${completados[ej.id]
                        ? 'bg-green-500/20 border border-green-500/50'
                        : 'bg-black/30 border border-white/20 hover:border-[#6EC8E0]/50 hover:shadow-md'
                        }`}
                      style={{
                        transform: hoveredCard === ej.id ? 'scale(1.01)' : 'scale(1)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <div className="flex flex-col sm:flex-row gap-3">
                        {ej.gif_url && (
                          <div className="sm:w-20 flex-shrink-0">
                            <img src={ej.gif_url} alt={ej.exercise_name} className="w-full h-16 object-cover rounded-md bg-black/40 shadow-sm" onError={(e) => e.target.style.display = 'none'} />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[#6EC8E0] text-xs font-bold bg-[#6EC8E0]/20 w-5 h-5 rounded-full flex items-center justify-center">{idx + 1}</span>
                            <h3 className="text-white font-semibold text-sm">{ej.exercise_name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 text-white/60 text-[11px]">
                            <span className="flex items-center gap-0.5"><Activity size={10} /> {ej.sets} series</span>
                            <span className="flex items-center gap-0.5"><Target size={10} /> {ej.reps} reps</span>
                            <span className="flex items-center gap-0.5"><Clock size={10} /> {ej.rest_seconds}s</span>
                          </div>
                          {ej.machine_required && <p className="text-white/40 text-[10px] mt-1">🏋️ {ej.machine_required}</p>}
                        </div>
                        <div className="flex items-center justify-end sm:justify-center">
                          {!completados[ej.id] ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleComplete(ej.id, ej.exercise_id)}
                              className="bg-[#6EC8E0]/20 hover:bg-[#6EC8E0]/40 text-white px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                            >
                              <CheckCircle size={12} /> Marcar
                            </motion.button>
                          ) : (
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle size={16} />
                              <span className="text-xs">Hecho</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón finalizar entrenamiento - siempre visible al final, con animación llamativa */}
            {allCompleted && rutina.length > 0 && (
              <div className="p-4 border-t border-white/20 bg-white/5 shrink-0">
                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenModal}
                  className="relative w-full bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] py-2.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all overflow-hidden group"
                >
                  {/* Efecto de brillo deslizante */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Trophy size={18} className="text-yellow-300" />
                  <span>Finalizar entrenamiento</span>
                  <ChevronRight size={16} />
                  {/* Efecto de pulso suave */}
                  <div className="absolute inset-0 rounded-xl animate-pulse ring-2 ring-white/40 pointer-events-none" />
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Mensaje motivacional compacto */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-center text-white/30 text-[10px]"
          >
            <p>🏆 Constancia • Progreso • Superación</p>
          </motion.div>
        </div>
      </div>

      {/* Modal post-entreno (sin cambios) */}
      {/* Modal para registro post-entreno - VERSIÓN DETALLADA */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] px-5 py-4 sticky top-0">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Award size={20} /> ¡Gran trabajo!
                </h3>
                <p className="text-white/70 text-sm">Ayúdanos a mejorar tu próxima rutina</p>
              </div>

              <div className="p-5 space-y-5">
                {/* RPE (Esfuerzo percibido) */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    RPE (Escala de esfuerzo 1-10)
                  </label>
                  <div className="flex justify-between text-white/60 text-xs mb-1">
                    <span>Muy fácil</span>
                    <span>Máximo</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <button
                        key={num}
                        onClick={() => setFormLog(prev => ({ ...prev, rpe: num }))}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition ${formLog.rpe === num
                            ? 'bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dolor / molestias */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">¿Sentiste dolor o molestias?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['ninguno', 'articular', 'muscular', 'agudo'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFormLog(prev => ({ ...prev, pain: opt }))}
                        className={`py-2 rounded-lg text-sm font-medium transition ${formLog.pain === opt
                            ? 'bg-red-500/80 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        {opt === 'ninguno' ? '😊 Ninguno' : opt === 'articular' ? '🦴 Articular' : opt === 'muscular' ? '💪 Muscular' : '⚠️ Agudo'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nivel de energía */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nivel de energía (1-10)</label>
                  <div className="flex justify-between text-white/60 text-xs mb-1">
                    <span>Agotado</span>
                    <span>Lleno</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <button
                        key={num}
                        onClick={() => setFormLog(prev => ({ ...prev, energy: num }))}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition ${formLog.energy === num
                            ? 'bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motivación */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Motivación (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => setFormLog(prev => ({ ...prev, motivation: num }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${formLog.motivation === num
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        {num} {num === 1 ? '😞' : num === 5 ? '🔥' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dificultad general (ya existía) */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">¿Cómo calificas la dificultad general?</label>
                  <div className="flex gap-3">
                    {['easy', 'moderate', 'hard'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFormLog(prev => ({ ...prev, difficulty: opt }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${formLog.difficulty === opt
                            ? 'bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        {opt === 'easy' ? '😊 Fácil' : opt === 'moderate' ? '😐 Moderado' : '😤 Difícil'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nota adicional (opcional pero estructurada) */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">¿Algo que no funcionó? (opcional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['pesado', 'muchas repeticiones', 'falta de tiempo', 'dolor', 'ninguna'].map(issue => (
                      <button
                        key={issue}
                        onClick={() => setFormLog(prev => ({ ...prev, issue: issue }))}
                        className={`py-1.5 rounded-lg text-xs font-medium transition ${formLog.issue === issue
                            ? 'bg-[#6EC8E0] text-black'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        {issue}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitLog}
                    className="flex-1 bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] py-2 rounded-lg text-white font-bold hover:shadow-lg transition"
                  >
                    Guardar registro
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SocioDashboard;