
import React, { useState, useCallback } from 'react';
import { PatientData, PredictionResult, AppState } from './types';
import { analyzeRisk, speakSummary } from './services/geminiService';
import PatientForm from './components/PatientForm';
import RiskDashboard from './components/RiskDashboard';
import { Activity, ShieldAlert, Heart, Info, Speaker, Loader2, Volume2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isAnalyzing: false,
    result: null,
    error: null,
    isSpeaking: false
  });
  
  const [stopAudio, setStopAudio] = useState<(() => void) | null>(null);

  const handleAnalyze = async (data: PatientData) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, result: null }));
    try {
      const result = await analyzeRisk(data);
      setState(prev => ({ ...prev, result, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message || 'Analysis failed' }));
    }
  };

  const handleSpeak = async () => {
    if (!state.result) return;
    if (state.isSpeaking && stopAudio) {
      stopAudio();
      setState(prev => ({ ...prev, isSpeaking: false }));
      return;
    }

    setState(prev => ({ ...prev, isSpeaking: true }));
    try {
      const stop = await speakSummary(state.result.clinicalSummary);
      setStopAudio(() => stop);
      // We don't have an easy "onEnded" hook without more complex PCM management, 
      // so for this MVP we'll just let it play.
    } catch (err) {
      console.error("Audio playback error", err);
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Heart className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              HealthGuard AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="hidden md:inline text-sm font-medium text-slate-500">Early Detection System v1.0</span>
             <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-semibold text-slate-800">Patient Vitals</h2>
                </div>
                {state.isAnalyzing && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                )}
              </div>
              <PatientForm onSubmit={handleAnalyze} isLoading={state.isAnalyzing} />
            </div>
          </div>

          {/* Right Column: Results & Insights */}
          <div className="lg:col-span-7">
            {!state.result && !state.isAnalyzing && !state.error && (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <Info className="w-8 h-8 text-slate-400" />
                </div>
                <div className="max-w-sm">
                  <h3 className="text-lg font-semibold text-slate-800">No Analysis Data</h3>
                  <p className="text-slate-500 mt-2">Enter patient metrics on the left to generate an AI-powered disease risk assessment.</p>
                </div>
              </div>
            )}

            {state.isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                  <Heart className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-8 text-lg font-medium text-slate-700">Gemini Clinical Engine is analyzing data...</p>
                <p className="text-slate-400 text-sm">Processing blood pressure, BMI, and biometric historical trends</p>
              </div>
            )}

            {state.error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Analysis Error</h3>
                  <p className="text-red-600 text-sm mt-1">{state.error}</p>
                </div>
              </div>
            )}

            {state.result && !state.isAnalyzing && (
              <div className="space-y-6">
                <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-100 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-5 h-5" />
                        <span className="text-emerald-100 font-medium text-sm uppercase tracking-wider">Clinical Summary</span>
                      </div>
                      <p className="text-lg font-medium leading-relaxed">
                        {state.result.clinicalSummary}
                      </p>
                    </div>
                    <button 
                      onClick={handleSpeak}
                      className="shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30 transition-all active:scale-95 flex items-center gap-3"
                    >
                      {state.isSpeaking ? (
                         <>
                           <div className="flex gap-1">
                             <div className="w-1 h-3 bg-white animate-bounce" />
                             <div className="w-1 h-3 bg-white animate-bounce [animation-delay:0.2s]" />
                             <div className="w-1 h-3 bg-white animate-bounce [animation-delay:0.4s]" />
                           </div>
                           Stop Audio
                         </>
                      ) : (
                        <>
                          <Speaker className="w-5 h-5" />
                          Listen to Report
                        </>
                      )}
                    </button>
                  </div>
                  {/* Decorative blobs */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
                </div>

                <RiskDashboard result={state.result} />
                
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-emerald-500" />
                    Preventive Care Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.result.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-slate-700 text-sm font-medium">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Persistent CTA - Scroll to top if results exist */}
      {state.result && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur px-6 py-3 rounded-full border border-slate-200 shadow-xl z-50 transition-all hover:bg-white">
          <p className="text-sm font-medium text-slate-600">Patient Analysis Complete</p>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default App;
