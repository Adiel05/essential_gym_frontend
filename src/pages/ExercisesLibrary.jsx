// src/pages/ExercisesLibrary.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Dumbbell, Filter, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser } from '../services/auth';

const ExercisesLibrary = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMuscle, setFilterMuscle] = useState('');
    const [filterMachine, setFilterMachine] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExercise, setSelectedExercise] = useState(null);
    
    const navigate = useNavigate();

    const muscleGroups = [
        { value: 'chest', label: 'Pecho' },
        { value: 'back', label: 'Espalda' },
        { value: 'legs', label: 'Pierna' },
        { value: 'shoulders', label: 'Hombros' },
        { value: 'arms', label: 'Brazos' },
        { value: 'core', label: 'Core' },
    ];

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://localhost:8000/api/training/exercises/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExercises(res.data);
        } catch (err) {
            console.error('Error fetching exercises:', err);
        } finally {
            setLoading(false);
        }
    };

    // Obtener máquinas únicas de los ejercicios para el filtro
    const uniqueMachines = [...new Set(exercises.map(ex => ex.machine_required).filter(m => m))];

    const filteredExercises = exercises.filter(ex => {
        const matchesMuscle = !filterMuscle || ex.muscle_group === filterMuscle;
        const matchesMachine = !filterMachine || ex.machine_required === filterMachine;
        const matchesSearch = !searchTerm || ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMuscle && matchesMachine && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07122a] to-[#1A4B8C]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6EC8E0]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#07122a] to-[#1A4B8C] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
                    >
                        <ArrowLeft className="text-white w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Dumbbell className="text-[#6EC8E0]" /> Biblioteca de ejercicios
                    </h1>
                </div>
                {/* Filtros */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-white/70 text-sm mb-1">Buscar</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nombre del ejercicio..."
                                    className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#6EC8E0]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Grupo muscular</label>
                            <select
                                value={filterMuscle}
                                onChange={(e) => setFilterMuscle(e.target.value)}
                                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="">Todos</option>
                                {muscleGroups.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Máquina</label>
                            <select
                                value={filterMachine}
                                onChange={(e) => setFilterMachine(e.target.value)}
                                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="">Todas</option>
                                {uniqueMachines.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        {(filterMuscle || filterMachine || searchTerm) && (
                            <button
                                onClick={() => { setFilterMuscle(''); setFilterMachine(''); setSearchTerm(''); }}
                                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-white text-sm flex items-center gap-1"
                            >
                                <X size={14} /> Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid de ejercicios */}
                {filteredExercises.length === 0 ? (
                    <div className="text-center py-12 text-white/60">No se encontraron ejercicios.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExercises.map((ex, idx) => (
                            <motion.div
                                key={ex.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedExercise(ex)}
                                className="cursor-pointer bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:border-[#6EC8E0]/50 transition-all"
                            >
                                <div className="aspect-video bg-black/30 flex items-center justify-center p-4">
                                    {ex.gif_url ? (
                                        <img src={ex.gif_url} alt={ex.name} className="max-h-32 object-contain" />
                                    ) : (
                                        <Dumbbell className="text-white/30 w-12 h-12" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold text-lg">{ex.name}</h3>
                                    <p className="text-white/60 text-xs mt-1">
                                        {muscleGroups.find(g => g.value === ex.muscle_group)?.label || ex.muscle_group}
                                    </p>
                                    {ex.machine_required && (
                                        <p className="text-white/40 text-xs mt-1">🏋️ {ex.machine_required}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de detalle del ejercicio */}
            {selectedExercise && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedExercise(null)}>
                    <div className="bg-gradient-to-br from-[#0A1A3A] to-[#1A4B8C] rounded-2xl border border-[#6EC8E0]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] px-5 py-4 sticky top-0 flex justify-between items-center">
                            <h3 className="text-white font-bold text-xl">{selectedExercise.name}</h3>
                            <button onClick={() => setSelectedExercise(null)} className="text-white/80 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="p-5 flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/2 flex justify-center">
                                {selectedExercise.gif_url ? (
                                    <img src={selectedExercise.gif_url} alt={selectedExercise.name} className="max-w-full max-h-64 rounded-xl shadow-lg" />
                                ) : (
                                    <div className="w-full h-64 bg-black/30 rounded-xl flex items-center justify-center text-white/50">Sin GIF</div>
                                )}
                            </div>
                            <div className="md:w-1/2 space-y-4">
                                <div className="bg-black/30 p-4 rounded-xl">
                                    <h4 className="text-[#6EC8E0] font-semibold mb-2">📝 Descripción</h4>
                                    <p className="text-white/80 text-sm">{selectedExercise.description || 'Sin descripción'}</p>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl">
                                    <p><span className="text-[#6EC8E0]">🎯 Grupo muscular:</span> <span className="text-white/80">{muscleGroups.find(g => g.value === selectedExercise.muscle_group)?.label || selectedExercise.muscle_group}</span></p>
                                    <p><span className="text-[#6EC8E0]">🏋️ Máquina:</span> <span className="text-white/80">{selectedExercise.machine_required || 'Peso libre / sin máquina'}</span></p>
                                    <p><span className="text-[#6EC8E0]">⭐ Dificultad:</span> <span className="text-white/80">{selectedExercise.difficulty === 1 ? 'Principiante' : selectedExercise.difficulty === 2 ? 'Intermedio' : 'Avanzado'}</span></p>
                                </div>
                                <button
                                    onClick={() => setSelectedExercise(null)}
                                    className="w-full bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] py-2 rounded-lg text-white font-bold hover:shadow-lg transition"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExercisesLibrary;