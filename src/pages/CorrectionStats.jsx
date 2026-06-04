import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const CorrectionStats = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://localhost:8000/api/training/correction-stats/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Agrupar por fecha (sumar todos los errores por día)
        const grouped = res.data.reduce((acc, curr) => {
          const existing = acc.find(item => item.date === curr.date);
          if (existing) {
            existing.errors += curr.count;
          } else {
            acc.push({ date: curr.date, errors: curr.count });
          }
          return acc;
        }, []);
        setData(grouped.sort((a,b) => new Date(a.date) - new Date(b.date)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07122a] to-[#1A4B8C]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6EC8E0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07122a] to-[#1A4B8C] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="bg-white/10 p-2 rounded-full">
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Evolución de errores</h1>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          {data.length === 0 ? (
            <p className="text-white/60 text-center">Aún no hay datos. Realiza algunos ejercicios con el corrector.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                <XAxis dataKey="date" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" />
                <Tooltip contentStyle={{ backgroundColor: '#1A4B8C', borderColor: '#6EC8E0' }} />
                <Line type="monotone" dataKey="errors" stroke="#6EC8E0" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorrectionStats;