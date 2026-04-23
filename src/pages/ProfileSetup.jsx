// src/pages/ProfileSetup.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Sphere, OrbitControls } from '@react-three/drei';
import { Target, Calendar, AlertCircle, BarChart2, Clock, ArrowRight, Volume2, VolumeX, User, Heart } from 'lucide-react';
import axios from 'axios';
import { useSound } from '../hooks/useSound';
import { Howl } from 'howler';

// Componente de fondo 3D
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

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const backgroundMusic = React.useRef(null);
  const [formData, setFormData] = useState({
    // Entrenamiento
    training_goal: '',
    days_per_week: '',
    injuries: '',
    experience_level: '',
    session_duration: '',
    // Datos personales
    gender: '',
    age: '',
    weight: '',
    height: '',
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
    { value: 'knees', label: 'Rodillas' },
    { value: 'lower_back', label: 'Espalda baja' },
    { value: 'shoulders', label: 'Hombros' },
    { value: 'elbows', label: 'Codos' },
    { value: 'wrists', label: 'Muñecas' },
    { value: 'neck', label: 'Cuello' },
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
        training_goal: res.data.training_goal || '',
        days_per_week: res.data.days_per_week || '',
        injuries: res.data.injuries || '',
        experience_level: res.data.experience_level || '',
        session_duration: res.data.session_duration || '',
        gender: res.data.gender || '',
        age: res.data.age || '',
        weight: res.data.weight || '',
        height: res.data.height || '',
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
      if (!currentInjuries.includes(value)) {
        currentInjuries.push(value);
      }
    } else {
      currentInjuries = currentInjuries.filter(i => i !== value);
    }
    setFormData({ ...formData, injuries: currentInjuries.join(',') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Convertir números
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        days_per_week: formData.days_per_week ? parseInt(formData.days_per_week) : null,
        session_duration: formData.session_duration ? parseInt(formData.session_duration) : null,
      };
      await axios.put(`${API_URL}profile/`, payload);
      await axios.post(`${API_URL}training/generar-rutina/`);
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

  const isInjurySelected = (value) => {
    return formData.injuries ? formData.injuries.split(',').includes(value) : false;
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
      {/* Fondo 3D */}
      <GymBackground />
      
      {/* Botón mute */}
      <button 
        onClick={toggleMute} 
        className="fixed top-4 right-4 z-20 bg-white/10 backdrop-blur-md p-2 rounded-full text-white/70 hover:text-white transition"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="w-full max-w-4xl"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] px-6 py-4">
              <h1 className="text-xl font-bold text-white">Configura tu entrenamiento personalizado</h1>
              <p className="text-white/80 text-sm mt-1">Complete todos los datos para generar una rutina profesional</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-6">
              {/* SECCIÓN 1: DATOS PERSONALES */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <User size={18} /> Datos personales
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Género</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange} 
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="male">Hombre</option>
                      <option value="female">Mujer</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Edad (años)</label>
                    <input 
                      type="number" 
                      name="age" 
                      value={formData.age} 
                      onChange={handleChange} 
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" 
                      placeholder="Ej: 28" 
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Peso (kg)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      name="weight" 
                      value={formData.weight} 
                      onChange={handleChange} 
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" 
                      placeholder="Ej: 75.5" 
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Altura (cm)</label>
                    <input 
                      type="number" 
                      step="1" 
                      name="height" 
                      value={formData.height} 
                      onChange={handleChange} 
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" 
                      placeholder="Ej: 175" 
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: OBJETIVOS Y DISPONIBILIDAD */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Target size={18} /> Objetivos y disponibilidad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Objetivo principal</label>
                    <select 
                      name="training_goal" 
                      value={formData.training_goal} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="hypertrophy">Hipertrofia (ganar músculo)</option>
                      <option value="fat_loss">Pérdida de grasa</option>
                      <option value="endurance">Resistencia</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Días por semana</label>
                    <select 
                      name="days_per_week" 
                      value={formData.days_per_week} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="2">2 días</option>
                      <option value="3">3 días</option>
                      <option value="4">4 días</option>
                      <option value="5">5 días</option>
                      <option value="6">6 días</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Nivel de experiencia</label>
                    <select 
                      name="experience_level" 
                      value={formData.experience_level} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="beginner">Principiante (menos de 6 meses)</option>
                      <option value="intermediate">Intermedio (6 meses - 2 años)</option>
                      <option value="advanced">Avanzado (más de 2 años)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Duración por sesión</label>
                    <select 
                      name="session_duration" 
                      value={formData.session_duration} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="30">30 minutos</option>
                      <option value="45">45 minutos</option>
                      <option value="60">60 minutos</option>
                      <option value="90">90 minutos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: LESIONES */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle size={18} /> Lesiones o zonas problemáticas
                </h3>
                <div className="flex flex-wrap gap-4 mb-3">
                  {injuryOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 text-white/80 text-sm">
                      <input 
                        type="checkbox" 
                        value={opt.value} 
                        checked={isInjurySelected(opt.value)} 
                        onChange={handleInjuryChange} 
                        className="w-4 h-4 rounded border-white/30 bg-white/10 text-[#6EC8E0]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <input 
                  type="text" 
                  name="other_injuries" 
                  value={formData.other_injuries} 
                  onChange={handleChange} 
                  placeholder="Otras lesiones (especificar)" 
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" 
                />
              </div>

              {/* SECCIÓN 4: CONDICIONES MÉDICAS Y CIRUGÍAS */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Heart size={18} /> Condiciones médicas y cirugías
                </h3>
                <textarea 
                  name="medical_conditions" 
                  rows="2" 
                  value={formData.medical_conditions} 
                  onChange={handleChange} 
                  placeholder="Enfermedades crónicas (hipertensión, diabetes, asma, problemas cardíacos, etc.)" 
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" 
                />
                <textarea 
                  name="surgeries" 
                  rows="2" 
                  value={formData.surgeries} 
                  onChange={handleChange} 
                  placeholder="Cirugías previas (ej. cirugía de rodilla 2021, apendicectomía...)" 
                  className="w-full mt-3 bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" 
                />
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Botón guardar */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all text-sm"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Guardar y continuar <ArrowRight size={16} />
                    </div>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="px-5 pb-4 pt-2 text-center text-white/40 text-[10px] border-t border-white/10">
              © 2026 Essential Gym - Fitness Center
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;