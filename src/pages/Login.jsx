import React, { useState, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '../services/auth';
import axios from 'axios';
import GymScene from '../components/GymScene';
import { useSound } from '../hooks/useSound';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const playHover = useSound('/sounds/hover.mp3', 0.15);
  const playClick = useSound('/sounds/click.mp3', 0.2);
  const playError = useSound('/sounds/error.mp3', 0.25);
  const playSuccess = useSound('/sounds/success.mp3', 0.3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await login(username, password);
      const user = data.user;
      const role = user?.role;
      playSuccess();
      setSuccess('Inicio de sesión exitoso. Redirigiendo...');
      if (role === 'socio') {
        const token = localStorage.getItem('access_token');
        const profileRes = await axios.get('http://localhost:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = profileRes.data;
        const isComplete = profile.training_goal && profile.days_per_week && profile.experience_level && profile.session_duration;
        setTimeout(() => {
          if (isComplete) navigate('/socio/dashboard');
          else navigate('/profile-setup');
        }, 1000);
      } else if (role === 'admin') {
        setTimeout(() => navigate('/admin/machines'), 1000);
      } else {
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err) {
      playError();
      setError(err.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#6EC8E0] via-[#1A4B8C] to-[#0A1A3A]">
      {/* Fondo con brillo deslizante (shimmer) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#6EC8E0]/20 to-transparent -translate-x-full animate-shimmer"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* COLUMNA IZQUIERDA - Formulario redimensionado */}
        <div className="flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-5 md:p-6">
                {/* Logo y título compactos */}
                <div className="text-center mb-5">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-[#1A4B8C] to-[#6EC8E0] shadow-lg mb-2"
                  >
                    <span className="text-white text-2xl font-black">EG</span>
                  </motion.div>
                  <h2 className="text-2xl font-black text-white">
                    ESSENTIAL<span className="text-[#6EC8E0]">GYM</span>
                  </h2>
                  <p className="text-white/70 text-xs mt-1">Energía que transforma</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Usuario */}
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Usuario</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 group-focus-within:text-[#6EC8E0] transition-colors" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                        placeholder="Tu usuario"
                        required
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 group-focus-within:text-[#6EC8E0] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                        placeholder="Tu contraseña"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mensajes de error/éxito */}
                  <div className="min-h-[56px]">
                    {error && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 p-2 rounded-lg">
                        <p className="text-red-200 font-semibold text-xs">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-green-500/20 backdrop-blur-sm border border-green-500/50 p-2 rounded-lg">
                        <p className="text-green-200 font-semibold text-xs">{success}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Recordarme y registro */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1 text-white/70 cursor-pointer hover:text-white transition">
                      <input type="checkbox" className="w-3 h-3 rounded border-white/30 bg-white/10 text-[#6EC8E0] focus:ring-[#6EC8E0]" />
                      Recordarme
                    </label>
                    <Link to="/register" className="text-[#6EC8E0] hover:text-white transition font-medium">
                      ¿No tienes cuenta? Regístrate
                    </Link>
                  </div>

                  {/* Botón login */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="relative w-full py-2 px-3 bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] rounded-lg font-bold text-white shadow-md overflow-hidden group text-sm"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" /> Iniciar Sesión
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                  </motion.button>
                </form>

                <div className="mt-5 pt-4 text-center text-white/40 text-[10px] border-t border-white/10">
                  © 2026 Essential Gym - Fitness Center
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* COLUMNA DERECHA - Escena 3D */}
        <div className="hidden md:block relative bg-gradient-to-br from-[#0A1A3A] to-[#1A4B8C] overflow-hidden">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Suspense fallback={null}>
              <GymScene />
            </Suspense>
          </Canvas>
          <div className="absolute bottom-8 left-0 right-0 text-center text-white/60 text-sm pointer-events-none">
            <p>🏋️ Entrena con inteligencia artificial</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;