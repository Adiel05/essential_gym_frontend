// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Cylinder, Sphere, Torus } from '@react-three/drei';
import { User, Lock, Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { login } from '../services/auth';
import axios from 'axios';
import { useSound } from '../hooks/useSound';
import { Howl } from 'howler';

// ========== ESTILOS GLOBALES (igual a tu versión) ==========
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    background: #070f24;
  }

  .heading { font-family: 'Syne', sans-serif; }

  .gym-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    color: white;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.25s ease;
    outline: none;
  }
  .gym-input::placeholder { color: rgba(255,255,255,0.3); }
  .gym-input:focus {
    border-color: rgba(110,200,224,0.6);
    background: rgba(110,200,224,0.07);
    box-shadow: 0 0 0 3px rgba(110,200,224,0.1);
  }

  .btn-login {
    width: 100%;
    background: linear-gradient(135deg, #1A4B8C 0%, #3a7bd5 50%, #6EC8E0 100%);
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
    box-shadow: 0 8px 32px rgba(110,200,224,0.25), 0 2px 8px rgba(0,0,0,0.3);
    letter-spacing: 0.5px;
  }
  .btn-login::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }
  .btn-login:hover::before { left: 100%; }
  .btn-login:hover {
    box-shadow: 0 12px 40px rgba(110,200,224,0.4), 0 4px 16px rgba(0,0,0,0.3);
    transform: translateY(-1px);
  }
  .btn-login:active { transform: translateY(0); }
  .btn-login:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .login-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 28px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(110,200,224,0.05), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .gym-label {
    display: block;
    color: rgba(255,255,255,0.55);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 7px;
  }

  .input-icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .input-icon {
    position: absolute;
    left: 14px;
    color: rgba(255,255,255,0.3);
    pointer-events: none;
    transition: color 0.25s;
    z-index: 1;
  }
  .input-icon-wrap:focus-within .input-icon { color: #6EC8E0; }

  .gym-check { accent-color: #6EC8E0; width: 14px; height: 14px; cursor: pointer; }

  @keyframes shimmerLogo {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
  @keyframes pulseRing {
    0% { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(1.6); opacity: 0; }
  }
`;

// ========== ESCENA 3D INTERACTIVA (con flotación y controles) ==========
const GymScene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-2, 2, 3]} intensity={0.9} color="#6EC8E0" />
      <pointLight position={[2, -1, 4]} intensity={0.7} color="#1A4B8C" />
      <pointLight position={[0, 2, -3]} intensity={0.5} color="#E5B73B" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#0a1a3a" metalness={0.8} roughness={0.4} transparent opacity={0.3} />
      </mesh>

      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[-1.5, 0.3, -0.8]} rotation={[0.3, 0.5, 0.2]}>
          <Cylinder args={[0.12, 0.12, 1.6, 12]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#c0d0e0" metalness={0.9} roughness={0.2} />
          </Cylinder>
          {[-0.7, -0.85].map(x => (
            <Cylinder key={x} args={[0.32, 0.32, 0.15, 24]} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#6EC8E0" metalness={0.7} roughness={0.3} />
            </Cylinder>
          ))}
          {[0.7, 0.85].map(x => (
            <Cylinder key={x} args={[0.32, 0.32, 0.15, 24]} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#6EC8E0" metalness={0.7} roughness={0.3} />
            </Cylinder>
          ))}
        </group>
      </Float>

      <Float speed={0.9} rotationIntensity={0.4} floatIntensity={0.6}>
        <group position={[1.8, -0.2, -0.3]} rotation={[-0.2, 0.8, 0.1]}>
          <Sphere args={[0.55, 32, 32]} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color="#2a4a7a" metalness={0.6} roughness={0.4} />
          </Sphere>
          <mesh position={[0, 0.45, 0]}>
            <torusGeometry args={[0.35, 0.08, 16, 48]} />
            <meshStandardMaterial color="#E5B73B" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </Float>

      <Float speed={0.7} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[0, -0.6, -1.5]} rotation={[0.1, 0.2, 0.05]}>
          <Cylinder args={[0.09, 0.09, 3.2, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#c0d0e0" metalness={0.9} roughness={0.2} />
          </Cylinder>
          {[-1.4, -1.6, -1.8].map(x => (
            <Cylinder key={x} args={[0.28, 0.28, 0.12, 32]} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#1A4B8C" metalness={0.7} roughness={0.3} />
            </Cylinder>
          ))}
          {[1.4, 1.6, 1.8].map(x => (
            <Cylinder key={x} args={[0.28, 0.28, 0.12, 32]} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#1A4B8C" metalness={0.7} roughness={0.3} />
            </Cylinder>
          ))}
        </group>
      </Float>

      <Float speed={1.1} rotationIntensity={0.6} floatIntensity={0.3}>
        <group position={[-0.5, 0.6, -2]} rotation={[0.5, 0.8, 0.3]}>
          <Cylinder args={[0.45, 0.45, 0.12, 32]} castShadow>
            <meshStandardMaterial color="#E5B73B" metalness={0.8} roughness={0.3} />
          </Cylinder>
        </group>
      </Float>

      <Float speed={0.8} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[1.2, 0.1, -2.2]} rotation={[-0.3, 1.2, 0.4]}>
          <Cylinder args={[0.5, 0.5, 0.1, 32]} castShadow>
            <meshStandardMaterial color="#6EC8E0" metalness={0.7} roughness={0.3} />
          </Cylinder>
        </group>
      </Float>

      {[...Array(80)].map((_, i) => (
        <Float key={i} speed={0.3 + Math.random() * 0.8} floatIntensity={0.2 + Math.random() * 0.5}>
          <mesh position={[(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 5 - 1]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#6EC8E0" emissive="#1A4B8C" emissiveIntensity={0.4} />
          </mesh>
        </Float>
      ))}

      <OrbitControls enableZoom={true} enablePan={true} zoomSpeed={1.2} rotateSpeed={1.0} target={[0, 0, 0]} />
    </>
  );
};

// ========== COMPONENTE LOGIN (con diseño de columnas y escena 3D) ==========
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
        if (!window.__bgMusic) {
          window.__bgMusic = new Howl({ src: ['/sounds/background.mp3'], loop: true, volume: 0.1, autoplay: true });
        } else {
          if (!window.__bgMusic.playing()) window.__bgMusic.play();
        }
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
    <div className="login-root" style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <style>{globalStyles}</style>

      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div style={{
        width: '100%',
        maxWidth: 460,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '20px 36px',
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#070f24',
        height: '100%',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, #070f24 0%, #0a1a3a 80%, #070f24 100%)',
          zIndex: -1
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: -1, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(110,200,224,1) 1px, transparent 1px), linear-gradient(90deg, rgba(110,200,224,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 48, height: 48,
                background: 'linear-gradient(135deg, #1A4B8C, #6EC8E0)',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(110,200,224,0.4)',
                flexShrink: 0,
                position: 'relative',
                animation: 'shimmerLogo 3s ease-in-out infinite'
              }}>
                <div style={{
                  position: 'absolute', inset: -6,
                  borderRadius: 22,
                  border: '1px solid rgba(110,200,224,0.4)',
                  animation: 'pulseRing 2s ease-out infinite'
                }} />
                <span className="heading" style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>EG</span>
              </div>
              <div>
                <h1 className="heading" style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>
                  ESSENTIAL<span style={{ color: '#6EC8E0' }}>GYM</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Fitness · IA · Resultados
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 className="heading" style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Bienvenido<br />
              <span style={{ color: '#6EC8E0' }}>de vuelta</span> 🎉
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>
              Accede a tu rutina personalizada con IA.
            </p>
          </div>

          <div className="login-card" style={{ padding: '22px 24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="gym-label">Usuario</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" style={{ left: 14 }} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="gym-input"
                    style={{ padding: '11px 14px 11px 42px' }}
                    placeholder="Tu nombre de usuario"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="gym-label">Contraseña</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" style={{ left: 14 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="gym-input"
                    style={{ padding: '11px 44px 11px 42px' }}
                    placeholder="Tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 14,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                  <input type="checkbox" className="gym-check" /> Recordarme
                </label>
                <Link to="/register" style={{ color: '#6EC8E0', fontWeight: 600, textDecoration: 'none' }}>
                  ¿Sin cuenta? Regístrate
                </Link>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="err"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    style={{
                      background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)',
                      borderRadius: 12, padding: '9px 12px', color: '#fca5a5', fontSize: 12
                    }}
                  >
                    ⚠️ {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    style={{
                      background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                      borderRadius: 12, padding: '9px 12px', color: '#86efac', fontSize: 12
                    }}
                  >
                    ✅ {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-login"
                style={{ padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={playHover}
                onClick={playClick}
              >
                {loading ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <LogIn size={18} /> Iniciar Sesión <Zap size={14} style={{ opacity: 0.8 }} />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, textAlign: 'center', marginTop: 20 }}>
            © 2026 Essential Gym — Todos los derechos reservados
          </p>
        </motion.div>
      </div>

      {/* COLUMNA DERECHA: ESCENA 3D INTERACTIVA */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'none',
      }}
      className="right-panel"
      >
        <style>{`
          @media (min-width: 992px) {
            .right-panel { display: block !important; }
          }
        `}</style>
        <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} style={{ width: '100%', height: '100%', background: 'transparent' }}>
          <GymScene />
        </Canvas>
        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center',
          color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', zIndex: 10, pointerEvents: 'none'
        }}>
          🔥 Arrastra para rotar · Zoom con la rueda
        </div>
      </div>
    </div>
  );
};

export default Login;