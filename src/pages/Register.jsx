import React, { useState, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Box, Sphere, Torus, Stars } from '@react-three/drei';
import { User, Mail, UserRound, Phone, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { register } from '../services/auth';
import { useSound } from '../hooks/useSound';

const TechScene = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#6EC8E0" />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      {/* Partículas estelares */}
      <Stars radius={10} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

      {/* Cubo central rotante */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={0.8}>
        <Box args={[1, 1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#6EC8E0" metalness={0.9} roughness={0.1} emissive="#1A4B8C" emissiveIntensity={0.3} />
        </Box>
      </Float>

      {/* Toro (anillo) alrededor del cubo */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <Torus args={[0.8, 0.08, 64, 200]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#FFFFFF" metalness={0.8} roughness={0.2} />
        </Torus>
      </Float>

      {/* Esferas flotantes alrededor */}
      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={0.8 + i * 0.2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere args={[0.12, 16, 16]} position={[Math.sin(i) * 1.5, Math.cos(i * 2) * 1.2, Math.cos(i) * 1.2]}>
            <meshStandardMaterial color="#1A4B8C" metalness={0.7} roughness={0.3} />
          </Sphere>
        </Float>
      ))}

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
    </>
  );
};

// --- Componente principal Register ---
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telefono: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const playHover = useSound('/sounds/hover.mp3', 0.15);
  const playClick = useSound('/sounds/click.mp3', 0.2);
  const playError = useSound('/sounds/error.mp3', 0.25);
  const playSuccess = useSound('/sounds/success.mp3', 0.3);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(formData);
      playSuccess();
      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      setFormData({
        username: '', email: '', first_name: '', last_name: '',
        telefono: '', password: '', password2: ''
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      playError();
      setError(err.error || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#07122a] to-[#1A4B8C]">
      {/* Fondo con brillo deslizante */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#6EC8E0]/20 to-transparent -translate-x-full animate-shimmer"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* COLUMNA IZQUIERDA - Formulario */}
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
                    Crear<span className="text-[#6EC8E0]"> Cuenta</span>
                  </h2>
                  <p className="text-white/70 text-xs mt-1">Únete a Essential Gym</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Usuario y Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Usuario *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                          placeholder="usuario123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Nombre</label>
                      <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                          placeholder="Juan"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Apellido</label>
                      <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                          placeholder="Pérez"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  </div>

                  {/* Contraseñas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Contraseña *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-9 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                          placeholder="Mínimo 8 caracteres"
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
                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Confirmar Contraseña *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                        <input
                          type={showPassword2 ? 'text' : 'password'}
                          name="password2"
                          value={formData.password2}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-9 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0] focus:border-transparent text-sm"
                          placeholder="Repite la contraseña"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition"
                          onClick={() => setShowPassword2(!showPassword2)}
                        >
                          {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mensajes */}
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

                  {/* Botón */}
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
                          <UserPlus className="w-4 h-4" /> Registrarse
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                  </motion.button>

                  <div className="text-center text-xs text-white/70 mt-2">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-[#6EC8E0] hover:text-white transition font-medium">
                      Inicia Sesión
                    </Link>
                  </div>
                </form>

                <div className="mt-5 pt-4 text-center text-white/40 text-[10px] border-t border-white/10">
                  © 2026 Essential Gym - Fitness Center
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* COLUMNA DERECHA - Escena 3D abstracta tecnológica */}
        <div className="hidden md:block relative bg-gradient-to-br from-[#0A1A3A] to-[#1A4B8C] overflow-hidden">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <Suspense fallback={null}>
              <TechScene />
            </Suspense>
          </Canvas>
          <div className="absolute bottom-8 left-0 right-0 text-center text-white/60 text-sm pointer-events-none">
            <p>✨ Tecnología de vanguardia para tu entrenamiento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;