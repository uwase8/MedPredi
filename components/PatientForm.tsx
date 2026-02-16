
import React, { useState } from 'react';
import { PatientData } from '../types';
import { ChevronRight } from 'lucide-react';

interface Props {
  onSubmit: (data: PatientData) => void;
  isLoading: boolean;
}

const PatientForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PatientData>({
    age: 45,
    gender: 'Male',
    weight: 75,
    height: 175,
    systolicBP: 120,
    diastolicBP: 80,
    fastingBloodSugar: 95,
    cholesterol: 180,
    smokingStatus: 'never',
    physicalActivity: 'moderate',
    familyHistory: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleCheckbox = (history: string) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.includes(history) 
        ? prev.familyHistory.filter(h => h !== history)
        : [...prev.familyHistory, history]
    }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Height (cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Measurements</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
             <input
              type="number"
              name="systolicBP"
              placeholder="Systolic BP"
              value={formData.systolicBP}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">SYS</span>
          </div>
          <div className="relative">
            <input
              type="number"
              name="diastolicBP"
              placeholder="Diastolic BP"
              value={formData.diastolicBP}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">DIA</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="number"
              name="fastingBloodSugar"
              placeholder="Sugar"
              value={formData.fastingBloodSugar}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">mg/dL</span>
          </div>
          <div className="relative">
            <input
              type="number"
              name="cholesterol"
              placeholder="Cholesterol"
              value={formData.cholesterol}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">CHOL</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Lifestyle Factors</label>
        <select
          name="smokingStatus"
          value={formData.smokingStatus}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="never">Never Smoked</option>
          <option value="former">Former Smoker</option>
          <option value="current">Current Smoker</option>
        </select>
        <select
          name="physicalActivity"
          value={formData.physicalActivity}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="low">Sedentary / Low Activity</option>
          <option value="moderate">Moderate Activity</option>
          <option value="high">High Physical Activity</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Family History</label>
        <div className="flex flex-wrap gap-2">
          {['Diabetes', 'Heart Disease', 'Hypertension', 'Stroke'].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => handleCheckbox(h)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                formData.familyHistory.includes(h)
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        Run AI Diagnostics
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
};

export default PatientForm;
