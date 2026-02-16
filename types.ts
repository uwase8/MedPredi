
export interface PatientData {
  age: number;
  gender: string;
  weight: number;
  height: number;
  systolicBP: number;
  diastolicBP: number;
  fastingBloodSugar: number;
  cholesterol: number;
  smokingStatus: 'never' | 'former' | 'current';
  physicalActivity: 'low' | 'moderate' | 'high';
  familyHistory: string[];
}

export interface DiseaseRisk {
  disease: string;
  riskScore: number; // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  reasoning: string;
}

export interface PredictionResult {
  risks: DiseaseRisk[];
  clinicalSummary: string;
  recommendations: string[];
}

export interface AppState {
  isAnalyzing: boolean;
  result: PredictionResult | null;
  error: string | null;
  isSpeaking: boolean;
}
