
import React from 'react';
import { PredictionResult, DiseaseRisk } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Zap, 
  Flame, 
  HeartPulse, 
  Droplets, 
  Activity, 
  Stethoscope,
  Info
} from 'lucide-react';

interface Props {
  result: PredictionResult;
}

const RiskDashboard: React.FC<Props> = ({ result }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return '#10b981'; // emerald-500
      case 'Moderate': return '#f59e0b'; // amber-500
      case 'High': return '#f97316'; // orange-500
      case 'Critical': return '#ef4444'; // red-500
      default: return '#64748b'; // slate-500
    }
  };

  const getDiseaseIcon = (disease: string) => {
    const d = disease.toLowerCase();
    if (d.includes('heart') || d.includes('cardio')) return <HeartPulse className="w-4 h-4" />;
    if (d.includes('diabetes')) return <Droplets className="w-4 h-4" />;
    if (d.includes('hypertension') || d.includes('blood pressure')) return <Activity className="w-4 h-4" />;
    if (d.includes('ckd') || d.includes('kidney')) return <Stethoscope className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const getLevelTheme = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          text: 'text-emerald-700',
          progressBg: 'bg-emerald-200',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-700',
          progressBg: 'bg-amber-200',
          icon: <Zap className="w-5 h-5 text-amber-600" />
        };
      case 'High':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-100',
          text: 'text-orange-700',
          progressBg: 'bg-orange-200',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />
        };
      case 'Critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          progressBg: 'bg-red-200',
          icon: <Flame className="w-5 h-5 text-red-600" />
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-100',
          text: 'text-slate-700',
          progressBg: 'bg-slate-200',
          icon: <ShieldAlert className="w-5 h-5 text-slate-600" />
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Aggregate Risk Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.risks} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="disease" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                domain={[0, 100]} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
              />
              <Bar dataKey="riskScore" radius={[8, 8, 8, 8]} barSize={32}>
                {result.risks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getLevelColor(entry.riskLevel)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.risks.map((risk, i) => {
          const theme = getLevelTheme(risk.riskLevel);
          return (
            <div 
              key={i} 
              className={`p-5 rounded-2xl border ${theme.bg} ${theme.border} transition-all hover:shadow-md group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    {theme.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`${theme.text}`}>
                        {getDiseaseIcon(risk.disease)}
                      </span>
                      <h4 className={`font-bold text-sm leading-tight ${theme.text}`}>{risk.disease}</h4>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-70`}>{risk.riskLevel} Severity</p>
                  </div>
                </div>
                <span className={`text-lg font-black ${theme.text}`}>{Math.round(risk.riskScore)}%</span>
              </div>
              
              <div className="w-full bg-white/60 h-2.5 rounded-full mb-4 overflow-hidden shadow-inner p-[1px]">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${risk.riskScore}%`,
                    backgroundColor: getLevelColor(risk.riskLevel)
                  }}
                />
              </div>

              <div className="relative">
                <div className={`absolute -left-1 top-0 bottom-0 w-1 rounded-full ${theme.progressBg} opacity-40`} />
                <p className="pl-3 text-xs text-slate-600 leading-relaxed font-medium">
                  {risk.reasoning}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskDashboard;
