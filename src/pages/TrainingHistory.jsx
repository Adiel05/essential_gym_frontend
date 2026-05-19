// src/pages/TrainingHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Dumbbell, Activity, TrendingUp, ArrowLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser } from '../services/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrainingHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [progressData, setProgressData] = useState([]);
    const [exerciseOptions, setExerciseOptions] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://localhost:8000/api/training/history/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);

            // Extraer ejercicios con peso registrado
            const exercisesSet = new Set();
            const weightMap = new Map(); // para acumular datos de progreso por ejercicio
            res.data.forEach(log => {
                log.exercises.forEach(ex => {
                    if (ex.weight_used) {
                        exercisesSet.add(ex.exercise_name);
                        if (!weightMap.has(ex.exercise_name)) {
                            weightMap.set(ex.exercise_name, []);
                        }
                        weightMap.get(ex.exercise_name).push({
                            date: log.date,
                            weight: ex.weight_used
                        });
                    }
                });
            });

            const exList = Array.from(exercisesSet);
            setExerciseOptions(exList);
            if (exList.length > 0) {
                setSelectedExercise(exList[0]);
                const data = weightMap.get(exList[0]) || [];
                setProgressData(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseChange = (exerciseName) => {
        setSelectedExercise(exerciseName);
        // Recolectar datos de ese ejercicio desde history
        const newData = [];
        history.forEach(log => {
            log.exercises.forEach(ex => {
                if (ex.exercise_name === exerciseName && ex.weight_used) {
                    newData.push({ date: log.date, weight: ex.weight_used });
                }
            });
        });
        setProgressData(newData.sort((a, b) => new Date(a.date) - new Date(b.date)));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07122a] to-[#1A4B8C]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6EC8E0]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#07122a] to-[#1A4B8C] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header con botón de regreso */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/socio/dashboard')}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
                    >
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">Historial de entrenamientos</h1>
                </div>

                {/* Gráfico de progreso */}
                {exerciseOptions.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="text-[#6EC8E0]" /> Progreso de cargas
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {exerciseOptions.map(ex => (
                                <button
                                    key={ex}
                                    onClick={() => handleExerciseChange(ex)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedExercise === ex
                                            ? 'bg-gradient-to-r from-[#1A4B8C] to-[#6EC8E0] text-white'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                        {progressData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={progressData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                                    <XAxis dataKey="date" stroke="#ffffff80" tick={{ fill: '#ffffff80' }} />
                                    <YAxis stroke="#ffffff80" tick={{ fill: '#ffffff80' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A4B8C', borderColor: '#6EC8E0' }}
                                        labelStyle={{ color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="weight" stroke="#6EC8E0" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-white/60 text-center py-8">No hay suficientes datos para mostrar el progreso de este ejercicio.</p>
                        )}
                    </div>
                )}

                {/* Lista de sesiones */}
                {history.length === 0 ? (
                    <div className="text-center py-12 text-white/60">
                        <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Aún no has completado ningún entrenamiento.</p>
                        <p className="text-sm">¡Finaliza tu primera rutina para ver tu historial!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((session, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
                            >
                                <div className="bg-gradient-to-r from-[#1A4B8C]/50 to-[#6EC8E0]/50 px-5 py-3 flex justify-between items-center flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-white" />
                                        <span className="text-white font-medium">
                                            {(() => {
                                                const [year, month, day] = session.date.split('-');
                                                return new Date(year, month - 1, day).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Activity size={16} className="text-white/70" />
                                        <span className="text-white/80 text-sm capitalize">Dificultad: {session.difficulty}</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="text-white/80 text-sm font-medium mb-2">Ejercicios realizados:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {session.exercises.map((ex, i) => (
                                            <div key={i} className="bg-black/30 rounded-lg p-2 flex justify-between items-center">
                                                <span className="text-white text-sm">{ex.exercise_name}</span>
                                                {ex.weight_used && (
                                                    <span className="text-[#6EC8E0] text-xs font-mono">{ex.weight_used} kg</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {session.notes && (
                                        <p className="text-white/50 text-xs mt-3 italic">📝 {session.notes}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingHistory;