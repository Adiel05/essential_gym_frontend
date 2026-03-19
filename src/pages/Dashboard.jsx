import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/dashboard/');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Estadísticas con estructura ordenada
  const stats = [
    { 
      name: 'Socios Activos', 
      value: '156', 
      icon: '👥', 
      change: '+12%', 
      changeType: 'increase',
      period: 'vs mes anterior'
    },
    { 
      name: 'Check-ins Hoy', 
      value: '43', 
      icon: '📊', 
      change: '+8%', 
      changeType: 'increase',
      period: 'vs mes anterior'
    },
    { 
      name: 'Ingresos Mes', 
      value: 'Bs.12,450', 
      icon: '💰', 
      change: '+23%', 
      changeType: 'increase',
      period: 'vs mes anterior'
    },
    { 
      name: 'Nuevas Membresías', 
      value: '18', 
      icon: '📈', 
      change: '-2%', 
      changeType: 'decrease',
      period: 'vs mes anterior'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-[#6EC8E0]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-10 w-10 bg-gradient-to-br from-[#1A4B8C] to-[#6EC8E0] rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-black">EG</span>
                </div>
                <span className="ml-3 text-xl font-black text-[#1A4B8C]">
                  ESSENTIAL<span className="text-[#6EC8E0]">GYM</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <button className="p-2 rounded-full text-[#1A4B8C] hover:bg-[#6EC8E0]/10 transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              {/* Perfil */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-3 focus:outline-none bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-[#1A4B8C] font-medium text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{user?.username}</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {menuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#6EC8E0]/10 hover:text-[#1A4B8C]">
                        Mi Perfil
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#6EC8E0]/10 hover:text-[#1A4B8C]">
                        Configuración
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#1A4B8C]">
              Bienvenido, {user?.username}!
            </h1>
            <p className="text-[#6EC8E0] font-medium">
              {dashboardData?.message || 'Panel de control - Essential Gym'}
            </p>
          </div>

          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-[#6EC8E0]/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gradient-to-br from-[#1A4B8C] to-[#6EC8E0] rounded-lg flex items-center justify-center text-white text-2xl">
                        {stat.icon}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {stat.name}
                      </p>
                      <div className="mt-1 flex items-baseline">
                        <p className="text-2xl font-black text-[#1A4B8C]">
                          {stat.value}
                        </p>
                        <p className={`ml-2 text-sm font-semibold ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Línea separadora con texto de período - CORREGIDO */}
                <div className="bg-[#F5F7FA] px-6 py-2 border-t border-[#6EC8E0]/10">
                  <p className="text-xs text-gray-500">
                    {stat.period}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            {/* Evolución de socios */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#6EC8E0]/20">
              <h3 className="text-lg font-black text-[#1A4B8C] mb-4 flex items-center">
                <span className="h-3 w-3 bg-[#6EC8E0] rounded-full mr-2"></span>
                Evolución de Socios
              </h3>
              <div className="h-64 bg-gradient-to-b from-[#F5F7FA] to-white rounded-lg flex items-center justify-center border-2 border-dashed border-[#6EC8E0]/30">
                <div className="text-center">
                  <p className="text-[#1A4B8C] font-medium">Gráfico: Altas vs Bajas</p>
                  <p className="text-sm text-gray-400">(Próximamente en Sprint 2)</p>
                </div>
              </div>
            </div>

            {/* Ingresos vs Egresos */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#6EC8E0]/20">
              <h3 className="text-lg font-black text-[#1A4B8C] mb-4 flex items-center">
                <span className="h-3 w-3 bg-[#6EC8E0] rounded-full mr-2"></span>
                Ingresos vs Egresos
              </h3>
              <div className="h-64 bg-gradient-to-b from-[#F5F7FA] to-white rounded-lg flex items-center justify-center border-2 border-dashed border-[#6EC8E0]/30">
                <div className="text-center">
                  <p className="text-[#1A4B8C] font-medium">Gráfico Financiero</p>
                  <p className="text-sm text-gray-400">(Próximamente en Sprint 2)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de usuario y actividad reciente */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Perfil del socio */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-[#6EC8E0]/20">
              <h3 className="text-lg font-black text-[#1A4B8C] mb-4">Mi Perfil</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-[#1A4B8C] to-[#6EC8E0] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500 capitalize">Rol: {user?.role}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user?.email || 'No especificado'}</p>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 mb-1">Último acceso</p>
                  <p className="text-sm font-medium text-gray-900">{dashboardData?.ultimo_acceso || 'Primera vez'}</p>
                </div>
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-[#6EC8E0]/20">
              <h3 className="text-lg font-black text-[#1A4B8C] mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-[#6EC8E0]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#1A4B8C] text-lg">🏋️</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Nuevo check-in registrado</p>
                        <p className="text-xs text-gray-500">Hace {item * 15} minutos</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#6EC8E0] font-medium cursor-pointer hover:underline">
                      Ver detalle
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#6EC8E0]/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2026 Essential Gym - Fitness Center. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;