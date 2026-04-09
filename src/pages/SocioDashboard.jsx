import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Sphere, OrbitControls } from '@react-three/drei';
import { Dumbbell, CheckCircle, XCircle, Volume2, VolumeX, Award, Calendar, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser, logout } from '../services/auth';
import { useSound } from '../hooks/useSound';
import { Howl } from 'howler';


const GymBackground = () => {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[-2, 3, 4]} intensity={0.8} color="#6EC8E0" />
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.5}>
        <Box args={[0.8, 0.8, 0.8]} position={[-2, 1, -2]}>
          <meshStandardMaterial color="#1A4B8C" metalness={0.7} roughness={0.3} />
        </Box>
      </Float>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.7}>
        <Sphere args={[0.5, 32, 32]} position={[2, -0.5, -1]}>
          <meshStandardMaterial color="#6EC8E0" metalness={0.8} roughness={0.2} emissive="#1A4B8C" emissiveIntensity={0.2} />
        </Sphere>
      </Float>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
    </Canvas>
  );
};

const SocioDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [rutina, setRutina] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completados, setCompletados] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [formLog, setFormLog] = useState({ difficulty: 'moderate', notes: '', weights: {} });
  const [muted, setMuted] = useState(false);
  const backgroundMusic = useRef(null);

  // Sonidos
  const playHover = useSound('/sounds/hover.mp3', 0.15);
  const playClick = useSound('/sounds/click.mp3', 0.2);
  const playComplete = useSound('/sounds/success.mp3', 0.3);

  useEffect(() => {
    // Cargar rutina del día
    const fetchRutina = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/training/rutina-hoy/');
        setRutina(res.data);
        // Inicializar estado de completados
        const initialCompleted = {};
        res.data.forEach(ej => { initialCompleted[ej.id] = false; });
        setCompletados(initialCompleted);
      } catch (err) {
        console.error('Error fetching routine:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRutina();

    // Iniciar música de fondo (si no está muteada)
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

  const handleComplete = (id) => {
    setCompletados(prev => ({ ...prev, [id]: true }));
    playComplete();
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
      // Podríamos redirigir o mostrar mensaje
      alert('¡Entrenamiento registrado!');
    } catch (err) {
      console.error(err);
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#07122a] to-[#1A4B8C]">
      <GymBackground />
      
      {/* Capa de contenido */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#1A4B8C] to-[#6EC8E0] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">EG</span>
            </div>
            <span className="text-white font-bold">Essential Gym</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-white/70 hover:text-white transition">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="text-white text-sm">Hola, {user?.username}</div>
            <button onClick={handleLogout} className="bg-red-500/80 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg">Salir</button>
          </div>
        </nav>

        {/* Contenido principal - sin scroll */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-5 md:p-6"
          >
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#6EC8E0]" /> Rutina de hoy
            </h2>
            {rutina.length === 0 ? (
              <p className="text-white/70 text-center py-8">No hay ejercicios para hoy. Descansa o completa tu perfil.</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {rutina.map((ej) => (
                  <motion.div
                    key={ej.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-black/30 border rounded-xl p-3 flex items-center justify-between ${completados[ej.id] ? 'border-green-500/50' : 'border-white/20'}`}
                  >
                    <div>
                      <h3 className="text-white font-semibold">{ej.exercise_name}</h3>
                      <p className="text-white/60 text-xs">{ej.sets} series x {ej.reps} reps • {ej.machine_required || 'Peso libre'}</p>
                    </div>
                    {!completados[ej.id] ? (
                      <button
                        onMouseEnter={playHover}
                        onClick={() => handleComplete(ej.id)}
                        className="bg-[#6EC8E0]/20 hover:bg-[#6EC8E0]/40 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        Marcar
                      </button>
                    ) : (
                      <CheckCircle className="text-green-400 w-5 h-5" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
            {allCompleted && rutina.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={playHover}
                onClick={handleOpenModal}
                className="mt-4 w-full bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] py-2 rounded-lg text-white font-bold flex items-center justify-center gap-2"
              >
                <Award size={18} /> Finalizar entrenamiento
              </motion.button>
            )}
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
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md p-5"
            >
              <h3 className="text-white text-lg font-bold mb-3">Registrar entrenamiento</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-white/80 text-sm mb-1">Dificultad</label>
                  <select
                    value={formLog.difficulty}
                    onChange={(e) => setFormLog({ ...formLog, difficulty: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="easy">Fácil</option>
                    <option value="moderate">Moderado</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">Notas (opcional)</label>
                  <textarea
                    rows="2"
                    value={formLog.notes}
                    onChange={(e) => setFormLog({ ...formLog, notes: e.target.value })}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                    placeholder="Ej. Me dolió el hombro en press banca"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-600 py-2 rounded-lg text-white">Cancelar</button>
                  <button onClick={handleSubmitLog} className="flex-1 bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] py-2 rounded-lg text-white font-bold">Guardar</button>
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