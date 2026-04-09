import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/gym/';

const AdminMachines = () => {
  const [machines, setMachines] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    zone: '',
    status: 'active',
    purchase_date: '',
    last_maintenance: '',
    image: null
  });
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchMachines();
    fetchBranches();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${API_URL}machines/`);
      setMachines(res.data);
    } catch (err) {
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_URL}branches/`);
      setBranches(res.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    });

    try {
      if (editingMachine) {
        await axios.put(`${API_URL}machines/${editingMachine.id}/`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API_URL}machines/`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchMachines();
      closeModal();
    } catch (err) {
      console.error('Error saving machine:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta máquina?')) {
      try {
        await axios.delete(`${API_URL}machines/${id}/`);
        fetchMachines();
      } catch (err) {
        console.error('Error deleting machine:', err);
      }
    }
  };

  const openModal = (machine = null) => {
    if (machine) {
      setEditingMachine(machine);
      setFormData({
        name: machine.name,
        branch: machine.branch,
        zone: machine.zone || '',
        status: machine.status,
        purchase_date: machine.purchase_date || '',
        last_maintenance: machine.last_maintenance || '',
        image: null
      });
    } else {
      setEditingMachine(null);
      setFormData({
        name: '',
        branch: '',
        zone: '',
        status: 'active',
        purchase_date: '',
        last_maintenance: '',
        image: null
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMachine(null);
  };

  const filteredMachines = machines.filter(m => {
    if (filterBranch && m.branch !== parseInt(filterBranch)) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header con título y botón agregar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1A4B8C]">Gestión de Máquinas</h1>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-md transition"
        >
          <Plus size={20} /> Agregar Máquina
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white px-6 py-3 border-b border-gray-200 flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">Todas las sucursales</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="maintenance">Mantenimiento</option>
          <option value="retired">Dada de baja</option>
        </select>
      </div>

      {/* Grid de máquinas (scroll solo si es necesario) */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6EC8E0]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map(machine => (
              <div
                key={machine.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
              >
                <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                  {machine.image ? (
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-5xl mb-2">🏋️</div>
                      <span className="text-sm">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => openModal(machine)}
                      className="bg-white/80 p-1 rounded-full hover:bg-white transition"
                    >
                      <Edit size={16} className="text-[#1A4B8C]" />
                    </button>
                    <button
                      onClick={() => handleDelete(machine.id)}
                      className="bg-white/80 p-1 rounded-full hover:bg-white transition"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{machine.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {machine.zone || 'Sin zona'} • Sucursal: {machine.branch_name}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    machine.status === 'active' ? 'bg-green-100 text-green-700' :
                    machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {machine.get_status_display || machine.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar (sin scroll vertical) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-[#1A4B8C]">
                {editingMachine ? 'Editar Máquina' : 'Nueva Máquina'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#6EC8E0] focus:border-[#6EC8E0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal *</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Seleccionar</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
                  <input
                    type="text"
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Ej. Zona de pesas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="active">Activa</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="retired">Dada de baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha compra</label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Último mantenimiento</label>
                  <input
                    type="date"
                    name="last_maintenance"
                    value={formData.last_maintenance}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (opcional)</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white rounded-lg hover:shadow-md transition"
                >
                  {editingMachine ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMachines;