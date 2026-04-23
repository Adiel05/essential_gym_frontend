// src/pages/SocioDashboard.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Sphere, OrbitControls, TorusKnot } from '@react-three/drei';
import {
  Dumbbell, CheckCircle, XCircle, Volume2, VolumeX, Award, Calendar,
  Clock, TrendingUp, Flame, Zap, Target, Heart, Activity, ChevronRight,
  Star, Trophy, Battery, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { getCurrentUser, logout } from '../services/auth';
import { useSound } from '../hooks/useSound';
import { Howl } from 'howler';

// ========== COMPONENTE 3D DE FONDO (GIMNASIO INTERACTIVO) ==========
const GymBackground3D = () => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[-2, 3, 4]} intensity={0.8} color="#6EC8E0" />

      {/* Cubo flotante principal */}
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.5}>
        <Box args={[0.8, 0.8, 0.8]} position={[-2.5, 1.5, -2]}>
          <meshStandardMaterial color="#1A4B8C" metalness={0.7} roughness={0.3} />
        </Box>
      </Float>

      {/* Esfera brillante */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.7}>
        <Sphere args={[0.6, 32, 32]} position={[2.5, -0.5, -1]}>
          <meshStandardMaterial color="#6EC8E0" metalness={0.8} roughness={0.2} emissive="#1A4B8C" emissiveIntensity={0.3} />
        </Sphere>
      </Float>

      {/* Toro (aro) giratorio */}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.3}>
        <TorusKnot args={[0.5, 0.12, 100, 16]} position={[0, 1.2, -3]}>
          <meshStandardMaterial color="#6EC8E0" metalness={0.6} roughness={0.4} emissive="#1A4B8C" emissiveIntensity={0.2} />
        </TorusKnot>
      </Float>

      {/* Partículas flotantes */}
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
  const backgroundMusic = React.useRef(null);
  const [hoveredCard, setHoveredCard] = useState(null);

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
        const completadosCount = Object.values(initialCompleted).filter(v => v === true).length;
        setProgreso(res.data.length ? (completadosCount / res.data.length) * 100 : 0);
      } catch (err) {
        console.error('Error fetching routine:', err);
        if (err.response?.status === 401) {
          // Token inválido o expirado: redirigir a login
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRutina();

    // Música de fondo
    if (!backgroundMusic.current) {
      backgroundMusic.current = new Howl({
        src: ['/sounds/background.mp3'],
        loop: true,
        volume: 0.1,
      });
      backgroundMusic.current.play();
    }
    return () => {
      if (backgroundMusic.current) backgroundMusic.current.stop();
    };
  }, []);

  const toggleMute = () => {
    if (backgroundMusic.current) {
      if (muted) {
        backgroundMusic.current.volume(0.1);
      } else {
        backgroundMusic.current.volume(0);
      }
      setMuted(!muted);
    }
  };

  const handleComplete = async (id, exerciseId) => {
    if (completados[id]) return;
    try {
      await axios.post('http://localhost:8000/api/training/toggle-completion/', {
        exercise_id: exerciseId,
        completed: true
      });
      const newCompletados = { ...completados, [id]: true };
      setCompletados(newCompletados);
      const completadosCount = Object.values(newCompletados).filter(v => v === true).length;
      setProgreso(rutina.length ? (completadosCount / rutina.length) * 100 : 0);
      playComplete();
    } catch (err) {
      console.error('Error marking exercise as completed:', err);
      playError();
    }
  };

  const allCompleted = rutina.length > 0 && Object.values(completados).every(v => v === true);

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

  // Calcular estadísticas del día
  const ejerciciosCompletados = Object.values(completados).filter(v => v === true).length;
  const totalEjercicios = rutina.length;
  const caloriasEstimadas = totalEjercicios * 45; // Estimación simple

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#07122a] to-[#1A4B8C]">
      {/* Fondo 3D */}
      <GymBackground3D />

      {/* Capa de contenido */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Navbar moderna */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#1A4B8C] to-[#6EC8E0] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-black">EG</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg">Essential Gym</span>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>👋 Hola, {user?.username}</span>
                <span>•</span>
                <span>🎯 {user?.training_goal?.replace('_', ' ') || 'Sin objetivo'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Indicador de racha (mock) */}
            <div className="hidden md:flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
              <Flame size={14} className="text-yellow-400" />
              <span className="text-white text-xs">3 días seguidos</span>
            </div>
            <button
              onClick={toggleMute}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              onMouseEnter={playHover}
            >
              {muted ? <VolumeX size={18} className="text-white/70" /> : <Volume2 size={18} className="text-white/70" />}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/80 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-lg transition"
              onMouseEnter={playHover}
            >
              Salir
            </button>
          </div>
        </nav>

        {/* Contenido principal - SIN SCROLL VERTICAL */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 max-h-[calc(100vh-64px)] overflow-hidden">

          {/* Tarjeta principal del dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
          >

            {/* Header con progreso */}
            <div className="bg-gradient-to-r from-[#1A4B8C]/50 to-[#6EC8E0]/50 px-5 py-4 border-b border-white/20">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[#6EC8E0]" />
                    Rutina de hoy
                  </h2>
                  <p className="text-white/60 text-xs">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3 text-white/80 text-sm">
                    <div className="flex items-center gap-1"><Zap size={14} className="text-yellow-400" /> {totalEjercicios - ejerciciosCompletados} restantes</div>
                    <div className="flex items-center gap-1"><Flame size={14} className="text-orange-400" /> ~{caloriasEstimadas} cal</div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso interactiva */}
              <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#6EC8E0] to-[#1A4B8C] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-white/70 text-xs mt-1">{Math.round(progreso)}% completado</p>
            </div>

            {/* Grid de ejercicios */}
            <div className="p-5 max-h-[420px] overflow-y-auto custom-scroll">
              {rutina.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">🏋️</div>
                  <p className="text-white/70">No hay ejercicios para hoy. Descansa o completa tu perfil.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rutina.map((ej, idx) => (
                    <motion.div
                      key={ej.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onMouseEnter={() => { setHoveredCard(ej.id); playHover(); }}
                      onMouseLeave={() => setHoveredCard(null)}
                      className={`relative group rounded-xl p-4 transition-all duration-300 ${completados[ej.id]
                        ? 'bg-green-500/20 border border-green-500/50'
                        : 'bg-black/30 border border-white/20 hover:border-[#6EC8E0]/50 hover:shadow-lg hover:shadow-[#6EC8E0]/10'
                        }`}
                      style={{
                        transform: hoveredCard === ej.id ? 'scale(1.02)' : 'scale(1)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Columna del GIF (si existe) */}
                        {ej.gif_url && (
                          <div className="sm:w-28 flex-shrink-0">
                            <img
                              src={ej.gif_url}
                              alt={ej.exercise_name}
                              className="w-full h-24 object-cover rounded-lg bg-black/40 shadow-md"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          </div>
                        )}

                        {/* Columna de información del ejercicio */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#6EC8E0]/20 flex items-center justify-center">
                              <span className="text-[#6EC8E0] text-sm font-bold">{idx + 1}</span>
                            </div>
                            <h3 className="text-white font-semibold">{ej.exercise_name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-3 text-white/60 text-xs mb-2">
                            <span className="flex items-center gap-1"><Activity size={12} /> {ej.sets} series</span>
                            <span className="flex items-center gap-1"><Target size={12} /> {ej.reps} reps</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {ej.rest_seconds}s descanso</span>
                          </div>
                          {ej.machine_required && (
                            <p className="text-white/40 text-xs mt-1">🏋️ {ej.machine_required}</p>
                          )}
                        </div>

                        {/* Botón de completado */}
                        <div className="flex items-center justify-end sm:justify-center">
                          {!completados[ej.id] ? (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleComplete(ej.id, ej.exercise_id)}
                              className="bg-[#6EC8E0]/20 hover:bg-[#6EC8E0]/40 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                              <CheckCircle size={16} /> Marcar
                            </motion.button>
                          ) : (
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle size={20} />
                              <span className="text-xs">Completado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón finalizar entrenamiento */}
            {allCompleted && rutina.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border-t border-white/20 bg-white/5"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={playHover}
                  onClick={handleOpenModal}
                  className="w-full bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Trophy size={18} /> Finalizar entrenamiento <ChevronRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Mensaje motivacional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-center text-white/40 text-xs"
          >
            <p>🏆 Mantén la constancia • Cada entrenamiento cuenta • Tú puedes</p>
          </motion.div>
        </div>
      </div>

      {/* Modal para registro post-entreno */}
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
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] px-5 py-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Award size={20} /> ¡Gran trabajo!
                </h3>
                <p className="text-white/70 text-sm">Registra cómo fue tu entrenamiento</p>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">¿Cómo calificas la dificultad?</label>
                  <div className="flex gap-3">
                    {['easy', 'moderate', 'hard'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFormLog({ ...formLog, difficulty: opt })}
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

                <div>
                  <label className="block text-white/80 text-sm mb-2">Notas adicionales (opcional)</label>
                  <textarea
                    rows="3"
                    value={formLog.notes}
                    onChange={(e) => setFormLog({ ...formLog, notes: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] text-sm"
                    placeholder="Ej. Me costó la última serie de press banca, pero mejoré técnica en sentadilla."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitLog}
                    className="flex-1 bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] py-2 rounded-lg text-white font-bold hover:shadow-lg transition"
                    onMouseEnter={playHover}
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