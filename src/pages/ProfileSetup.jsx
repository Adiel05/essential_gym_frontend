// src/pages/ProfileSetup.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Sphere, OrbitControls } from '@react-three/drei';
import {
  Dumbbell, Flame, Activity, Heart, ChevronRight, ChevronLeft,
  Volume2, VolumeX, User, AlertCircle, Calendar, Target, Clock,
  Trophy, Zap, Shield, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { useSound } from '../hooks/useSound';
import { Howl } from 'howler';

// ========== COMPONENTE 3D DE FONDO ==========
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

const API_URL = 'http://localhost:8000/api/';

// ========== COMPONENTE PRINCIPAL ==========
const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const backgroundMusic = React.useRef(null);
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState({
    // Datos personales
    gender: '',
    age: '',
    weight: '',
    height: '',
    // Objetivos y disponibilidad
    training_goal: '',
    days_per_week: '',
    experience_level: '',
    session_duration: '',
    // Lesiones y condiciones
    injuries: '',
    other_injuries: '',
    medical_conditions: '',
    surgeries: '',
  });

  // Sonidos
  const playHover = useSound('/sounds/hover.mp3', 0.15);
  const playClick = useSound('/sounds/click.mp3', 0.2);
  const playSuccess = useSound('/sounds/success.mp3', 0.3);
  const playError = useSound('/sounds/error.mp3', 0.25);

  const injuryOptions = [
    { value: 'knees', label: 'Rodillas', icon: '🦵' },
    { value: 'lower_back', label: 'Espalda baja', icon: '🦴' },
    { value: 'shoulders', label: 'Hombros', icon: '💪' },
    { value: 'elbows', label: 'Codos', icon: '💢' },
    { value: 'wrists', label: 'Muñecas', icon: '✋' },
    { value: 'neck', label: 'Cuello', icon: '🧘' },
  ];

  useEffect(() => {
    fetchProfile();
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

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}profile/`);
      setFormData({
        gender: res.data.gender || '',
        age: res.data.age || '',
        weight: res.data.weight || '',
        height: res.data.height || '',
        training_goal: res.data.training_goal || '',
        days_per_week: res.data.days_per_week || '',
        experience_level: res.data.experience_level || '',
        session_duration: res.data.session_duration || '',
        injuries: res.data.injuries || '',
        other_injuries: res.data.other_injuries || '',
        medical_conditions: res.data.medical_conditions || '',
        surgeries: res.data.surgeries || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInjuryChange = (e) => {
    const value = e.target.value;
    let currentInjuries = formData.injuries ? formData.injuries.split(',') : [];
    if (e.target.checked) {
      if (!currentInjuries.includes(value)) currentInjuries.push(value);
    } else {
      currentInjuries = currentInjuries.filter(i => i !== value);
    }
    setFormData({ ...formData, injuries: currentInjuries.join(',') });
  };

  const isInjurySelected = (value) => {
    return formData.injuries ? formData.injuries.split(',').includes(value) : false;
  };

  const handleSubmit = async () => {
    console.log("🔵 handleSubmit ejecutado, paso actual:", step);
    const token = localStorage.getItem('access_token');
    console.log("Token:", token);
    if (!token) {
      console.error("No hay token, redirigiendo a login...");
      navigate('/login');
      return;
    }
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

      await axios.put(`${API_URL}profile/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.post(`${API_URL}training/generar-rutina/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      playSuccess();
      navigate('/socio/dashboard');
    } catch (err) {
      playError();
      console.error('Error saving profile:', err);
      setError(err.response?.data?.error || 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
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

      <button onClick={toggleMute} className="fixed top-4 right-4 z-20 bg-white/10 backdrop-blur-md p-2 rounded-full text-white/70 hover:text-white transition">
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header con progreso */}
            <div className="bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-bold text-white">Configura tu entrenamiento</h1>
                <p className="text-white/80 text-sm">Paso {step} de {totalSteps}</p>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-6">
              <AnimatePresence mode="wait">
                {/* PASO 1: DATOS PERSONALES */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    {/* Género - tarjetas interactivas */}
                    <div>
                      <label className="block text-white font-medium mb-3">Género</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['male', 'female'].map((opt) => (
                          <motion.div
                            key={opt}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, gender: opt })}
                            className={`cursor-pointer p-6 rounded-xl flex flex-col items-center gap-3 border-2 transition-all ${formData.gender === opt
                              ? 'border-[#6EC8E0] bg-gradient-to-br from-[#6EC8E0]/30 to-[#1A4B8C]/30 shadow-xl'
                              : 'border-white/20 bg-black/30 hover:border-white/40'
                              }`}
                          >
                            <span className="text-6xl">{opt === 'male' ? '💪' : '🧘‍♀️'}</span>
                            <span className="text-white font-semibold text-lg capitalize">
                              {opt === 'male' ? 'Hombre' : 'Mujer'}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Edad con slider */}
                    <div>
                      <label className="block text-white font-medium mb-2">Edad: <span className="text-[#6EC8E0] font-bold">{formData.age || 25}</span> años</label>
                      <input type="range" min="15" max="100" value={formData.age || 25} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full accent-[#6EC8E0]" />
                      <div className="flex justify-between text-white/50 text-xs mt-1"><span>15</span><span>100</span></div>
                    </div>

                    {/* Peso con slider */}
                    <div>
                      <label className="block text-white font-medium mb-2">Peso: <span className="text-[#6EC8E0] font-bold">{formData.weight || 70}</span> kg</label>
                      <input type="range" min="30" max="200" step="1" value={formData.weight || 70} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full accent-[#6EC8E0]" />
                    </div>

                    {/* Altura con slider */}
                    <div>
                      <label className="block text-white font-medium mb-2">Altura: <span className="text-[#6EC8E0] font-bold">{formData.height || 170}</span> cm</label>
                      <input type="range" min="120" max="220" step="1" value={formData.height || 170} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="w-full accent-[#6EC8E0]" />
                    </div>
                  </motion.div>
                )}

                {/* PASO 2: OBJETIVOS Y DISPONIBILIDAD */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    {/* Objetivo - tarjetas */}
                    <div>
                      <label className="block text-white font-medium mb-3">Objetivo principal</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'hypertrophy', label: 'Hipertrofia', icon: <Dumbbell />, desc: 'Ganar músculo' },
                          { value: 'fat_loss', label: 'Pérdida grasa', icon: <Flame />, desc: 'Definición' },
                          { value: 'endurance', label: 'Resistencia', icon: <Activity />, desc: 'Aguante' },
                          { value: 'maintenance', label: 'Mantenimiento', icon: <Heart />, desc: 'Salud' }
                        ].map(opt => (
                          <motion.div key={opt.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setFormData({ ...formData, training_goal: opt.value })} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${formData.training_goal === opt.value ? 'border-[#6EC8E0] bg-[#6EC8E0]/20' : 'border-white/20 bg-black/30 hover:border-white/40'}`}>
                            <div className="flex items-center gap-3">
                              <div className="text-[#6EC8E0]">{opt.icon}</div>
                              <div><div className="text-white font-medium">{opt.label}</div><div className="text-white/50 text-xs">{opt.desc}</div></div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Días por semana - círculos */}
                    <div>
                      <label className="block text-white font-medium mb-3">Días por semana</label>
                      <div className="flex justify-between gap-2">
                        {[2, 3, 4, 5, 6].map(day => (
                          <motion.button key={day} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setFormData({ ...formData, days_per_week: day })} className={`w-12 h-12 rounded-full text-lg font-bold transition-all ${formData.days_per_week == day ? 'bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>{day}</motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Nivel experiencia - botones */}
                    <div>
                      <label className="block text-white font-medium mb-3">Nivel de experiencia</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'beginner', label: 'Principiante', icon: <Zap size={16} /> },
                          { value: 'intermediate', label: 'Intermedio', icon: <TrendingUp size={16} /> },
                          { value: 'advanced', label: 'Avanzado', icon: <Trophy size={16} /> }
                        ].map(opt => (
                          <motion.div key={opt.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setFormData({ ...formData, experience_level: opt.value })} className={`cursor-pointer p-2 rounded-xl text-center border-2 transition-all ${formData.experience_level === opt.value ? 'border-[#6EC8E0] bg-[#6EC8E0]/20' : 'border-white/20 bg-black/30'}`}>
                            <div className="text-white text-xs">{opt.icon} {opt.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Duración sesión - selector horizontal */}
                    <div>
                      <label className="block text-white font-medium mb-3">Duración por sesión</label>
                      <div className="flex gap-2">
                        {[30, 45, 60, 90].map(min => (
                          <motion.button key={min} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFormData({ ...formData, session_duration: min })} className={`flex-1 py-2 rounded-lg border transition-all ${formData.session_duration == min ? 'bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>{min} min</motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PASO 3: LESIONES Y CONDICIONES */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-3">Lesiones o zonas problemáticas</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {injuryOptions.map(opt => (
                          <motion.label key={opt.value} whileHover={{ scale: 1.02 }} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 cursor-pointer" style={{ background: isInjurySelected(opt.value) ? '#6EC8E0/20' : '' }}>
                            <input type="checkbox" value={opt.value} checked={isInjurySelected(opt.value)} onChange={handleInjuryChange} className="w-4 h-4 accent-[#6EC8E0]" />
                            <span className="text-white text-sm">{opt.icon} {opt.label}</span>
                          </motion.label>
                        ))}
                      </div>
                      <input type="text" name="other_injuries" value={formData.other_injuries} onChange={handleChange} placeholder="Otras lesiones (especificar)" className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Condiciones médicas crónicas</label>
                      <textarea name="medical_conditions" rows="2" value={formData.medical_conditions} onChange={handleChange} placeholder="Ej. hipertensión, diabetes, asma..." className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Cirugías previas relevantes</label>
                      <textarea name="surgeries" rows="2" value={formData.surgeries} onChange={handleChange} placeholder="Ej. cirugía de rodilla 2021..." className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                    </div>
                  </motion.div>
                )}

                {/* PASO 4: CONFIRMACIÓN Y GUARDADO */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 text-white">
                    <h3 className="text-lg font-semibold">Resumen de tu perfil</h3>
                    <div className="bg-white/10 p-4 rounded-xl space-y-2">
                      <p><strong>Género:</strong> {formData.gender === 'male' ? 'Hombre' : formData.gender === 'female' ? 'Mujer' : formData.gender === 'other' ? 'Otro' : 'No especificado'}</p>
                      <p><strong>Edad:</strong> {formData.age ? `${formData.age} años` : 'No especificada'}</p>
                      <p><strong>Peso:</strong> {formData.weight ? `${formData.weight} kg` : 'No especificado'}</p>
                      <p><strong>Altura:</strong> {formData.height ? `${formData.height} cm` : 'No especificada'}</p>
                      <p><strong>Objetivo principal:</strong> {
                        formData.training_goal === 'hypertrophy' ? 'Hipertrofia (ganar músculo)' :
                          formData.training_goal === 'fat_loss' ? 'Pérdida de grasa' :
                            formData.training_goal === 'endurance' ? 'Resistencia' :
                              formData.training_goal === 'maintenance' ? 'Mantenimiento' : 'No especificado'
                      }</p>
                      <p><strong>Días por semana:</strong> {formData.days_per_week ? `${formData.days_per_week} días` : 'No especificado'}</p>
                      <p><strong>Nivel de experiencia:</strong> {
                        formData.experience_level === 'beginner' ? 'Principiante' :
                          formData.experience_level === 'intermediate' ? 'Intermedio' :
                            formData.experience_level === 'advanced' ? 'Avanzado' : 'No especificado'
                      }</p>
                      <p><strong>Duración por sesión:</strong> {formData.session_duration ? `${formData.session_duration} minutos` : 'No especificada'}</p>
                      <p><strong>Lesiones seleccionadas:</strong> {
                        formData.injuries ? formData.injuries.split(',').map(i => {
                          const opt = injuryOptions.find(o => o.value === i);
                          return opt ? opt.label : i;
                        }).join(', ') : 'Ninguna'
                      }</p>
                      {formData.other_injuries && <p><strong>Otras lesiones:</strong> {formData.other_injuries}</p>}
                      <p><strong>Condiciones médicas:</strong> {formData.medical_conditions || 'Ninguna'}</p>
                      <p><strong>Cirugías previas:</strong> {formData.surgeries || 'Ninguna'}</p>
                    </div>
                    {error && <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg text-red-200 text-sm">{error}</div>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navegación entre pasos */}
              <div className="flex justify-between pt-4 border-t border-white/20">
                {step > 1 && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={prevStep} className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg text-white flex items-center gap-2">
                    <ChevronLeft size={16} /> Atrás
                  </motion.button>
                )}
                {step < totalSteps ? (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} className="bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] px-5 py-2 rounded-lg text-white flex items-center gap-2 ml-auto">
                    Siguiente <ChevronRight size={16} />
                  </motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={saving} className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 rounded-lg text-white font-bold flex items-center gap-2 ml-auto">
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Guardar y continuar'}
                  </motion.button>
                )}
              </div>
            </form>

            <div className="px-6 pb-4 pt-2 text-center text-white/40 text-xs border-t border-white/10">
              © 2026 Essential Gym - Fitness Center
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;