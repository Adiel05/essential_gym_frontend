import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';

function Register() {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const data = await register(formData);
      setSuccess('¡Registro exitoso! Serás redirigido al login...');
      
      // Limpiar formulario
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        telefono: '',
        password: '',
        password2: ''
      });
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.error || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A4B8C] to-[#6EC8E0] relative overflow-hidden py-12">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wave-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q10 10, 20 20 T40 20" stroke="white" fill="none" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#wave-pattern)" />
        </svg>
      </div>

      {/* Círculos decorativos */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      {/* Contenedor principal */}
      <div className="max-w-2xl w-full bg-white p-10 rounded-2xl shadow-2xl relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-gradient-to-br from-[#1A4B8C] to-[#6EC8E0] rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <span className="text-white text-2xl font-black">EG</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-[#1A4B8C]">
            Crear<span className="text-[#6EC8E0]"> Cuenta</span>
          </h2>
          <p className="text-gray-500 mt-2">Únete a Essential Gym</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC8E0] focus:border-[#6EC8E0] text-gray-900 "
                placeholder="usuario123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC8E0] focus:border-[#6EC8E0] text-gray-900 "
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC8E0] focus:border-[#6EC8E0] text-gray-900 "
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC8E0] focus:border-[#6EC8E0] text-gray-900 "
                placeholder="Pérez"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC8E0] focus:border-[#6EC8E0] text-gray-900 "
              placeholder="+56 9 1234 5678"
            />
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC8E0] focus:border-[#6EC8E0] pr-10 text-gray-900 "
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword2 ? "text" : "password"}
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC8E0] focus:border-[#6EC8E0] pr-10 text-gray-900 "
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          {/* Mensajes de error/success */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-black uppercase tracking-wider ${
              loading 
                ? 'bg-gradient-to-r from-[#1A4B8C]/50 to-[#6EC8E0]/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] hover:shadow-lg transform hover:scale-[1.02] transition-all'
            }`}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          {/* Enlace a login */}
          <div className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-[#1A4B8C] font-medium hover:text-[#6EC8E0] transition-colors">
              Inicia Sesión
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4 mt-6">
          <p>© 2026 Essential Gym - Fitness Center</p>
        </div>
      </div>
    </div>
  );
}

export default Register;