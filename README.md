# HealthGuard AI - Disease Risk Prediction System

## Overview

**HealthGuard AI** is an AI-powered medical risk assessment application that analyzes patient vitals and lifestyle factors to predict disease risks. It uses Google's Gemini AI for intelligent analysis and provides text-to-speech clinical summaries.

### Key Features
- Real-time disease risk assessment
- Interactive risk visualization with charts
- AI-powered text-to-speech clinical reports
- Personalized preventive care recommendations
- Multi-disease analysis (Cardiovascular, Diabetes, Hypertension, CKD)

---

##  Project Structure

```
MedPredi/
├── components/           # React UI components
│   ├── PatientForm.tsx   # Patient data input form
│   └── RiskDashboard.tsx # Risk visualization dashboard
├── services/             # External service integrations
│   └── geminiService.ts  # Google Gemini AI integration
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
├── types.ts              # TypeScript type definitions
├── index.css             # Global styles
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

---

## Dependencies

### Core Libraries
- **React 19.2.4** - UI framework
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool and dev server

### UI & Visualization
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **Recharts 3.7.0** - Chart library for risk visualization
- **Lucide React 0.564.0** - Icon library

### AI Integration
- **@google/genai 1.41.0** - Google Gemini AI SDK

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd MedPredi
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API Key**
   - Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set it as an environment variable or update `services/geminiService.ts`

4. **Run development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

---

## Code Documentation

### 1. **types.ts** - Type Definitions

Defines all TypeScript interfaces used throughout the application.

#### `PatientData`
Patient information and vitals collected from the form.

```typescript
interface PatientData {
  age: number;                    // Patient age in years
  gender: string;                 // 'Male', 'Female', or 'Other'
  weight: number;                 // Weight in kilograms
  height: number;                 // Height in centimeters
  systolicBP: number;             // Systolic blood pressure (mmHg)
  diastolicBP: number;            // Diastolic blood pressure (mmHg)
  fastingBloodSugar: number;      // Fasting blood sugar (mg/dL)
  cholesterol: number;            // Total cholesterol (mg/dL)
  smokingStatus: 'never' | 'former' | 'current';
  physicalActivity: 'low' | 'moderate' | 'high';
  familyHistory: string[];        // Array of family disease history
}
```

#### `DiseaseRisk`
Individual disease risk assessment result.

```typescript
interface DiseaseRisk {
  disease: string;                // Disease name
  riskScore: number;              // Risk score (0-100)
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  reasoning: string;              // AI explanation for the risk
}
```

#### `PredictionResult`
Complete analysis result from Gemini AI.

```typescript
interface PredictionResult {
  risks: DiseaseRisk[];           // Array of disease risks
  clinicalSummary: string;        // Overall clinical summary
  recommendations: string[];      // Preventive care recommendations
}
```

#### `AppState`
Application state management.

```typescript
interface AppState {
  isAnalyzing: boolean;           // Loading state during analysis
  result: PredictionResult | null; // Analysis result
  error: string | null;           // Error message if any
  isSpeaking: boolean;            // Audio playback state
}
```

---

### 2. **index.tsx** - Application Entry Point

The root file that mounts the React application to the DOM.

**Key Concepts:**
- Uses `ReactDOM.createRoot()` for React 18+ concurrent features
- Wraps app in `React.StrictMode` for development warnings
- Throws error if root element is missing (defensive programming)

```typescript
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### 3. **App.tsx** - Main Application Component

The main orchestrator component that manages application state and coordinates between child components.

#### State Management

```typescript
const [state, setState] = useState<AppState>({
  isAnalyzing: false,    // Shows loading spinner
  result: null,          // Stores analysis results
  error: null,           // Stores error messages
  isSpeaking: false      // Tracks audio playback
});

const [stopAudio, setStopAudio] = useState<(() => void) | null>(null);
```

#### Key Functions

**`handleAnalyze(data: PatientData)`**
- Triggered when user submits the patient form
- Calls Gemini AI service to analyze risk
- Updates state with results or error

```typescript
const handleAnalyze = async (data: PatientData) => {
  setState(prev => ({ ...prev, isAnalyzing: true, error: null, result: null }));
  try {
    const result = await analyzeRisk(data);
    setState(prev => ({ ...prev, result, isAnalyzing: false }));
  } catch (err: any) {
    setState(prev => ({ ...prev, isAnalyzing: false, error: err.message }));
  }
};
```

**`handleSpeak()`**
- Converts clinical summary to speech using Gemini TTS
- Toggles between play and stop
- Manages audio playback state

```typescript
const handleSpeak = async () => {
  if (state.isSpeaking && stopAudio) {
    stopAudio();  // Stop current audio
    setState(prev => ({ ...prev, isSpeaking: false }));
    return;
  }

  setState(prev => ({ ...prev, isSpeaking: true }));
  const stop = await speakSummary(state.result.clinicalSummary);
  setStopAudio(() => stop);
};
```

#### UI Layout

The app uses a **two-column responsive layout**:
- **Left Column (lg:col-span-5)**: Patient input form
- **Right Column (lg:col-span-7)**: Results dashboard

**Conditional Rendering:**
1. **Empty State**: Shows when no analysis has been run
2. **Loading State**: Shows spinner during analysis
3. **Error State**: Displays error message
4. **Results State**: Shows clinical summary, charts, and recommendations

---

### 4. **components/PatientForm.tsx** - Patient Data Input

A controlled form component that collects patient vitals and lifestyle information.

#### Form State

```typescript
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
```

#### Key Functions

**`handleChange(e)`**
- Updates form fields for text, number, and select inputs
- Automatically parses numbers for numeric fields

```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'number' ? parseFloat(value) : value
  }));
};
```

**`handleCheckbox(history: string)`**
- Toggles family history selections
- Adds or removes items from array

```typescript
const handleCheckbox = (history: string) => {
  setFormData(prev => ({
    ...prev,
    familyHistory: prev.familyHistory.includes(history) 
      ? prev.familyHistory.filter(h => h !== history)
      : [...prev.familyHistory, history]
  }));
};
```

#### Form Sections

1. **Demographics**: Age, Gender
2. **Physical Metrics**: Weight, Height
3. **Clinical Measurements**: Blood Pressure, Blood Sugar, Cholesterol
4. **Lifestyle Factors**: Smoking Status, Physical Activity
5. **Family History**: Checkboxes for hereditary conditions

---

### 5. **components/RiskDashboard.tsx** - Risk Visualization

Displays analysis results with interactive charts and risk cards.

#### Key Functions

**`getLevelColor(level: string)`**
- Returns color code based on risk level
- Used for chart bars and progress indicators

```typescript
const getLevelColor = (level: string) => {
  switch (level) {
    case 'Low': return '#10b981';      // Green
    case 'Moderate': return '#f59e0b'; // Amber
    case 'High': return '#f97316';     // Orange
    case 'Critical': return '#ef4444'; // Red
    default: return '#64748b';         // Gray
  }
};
```

**`getDiseaseIcon(disease: string)`**
- Returns appropriate icon for each disease type
- Uses pattern matching on disease name

**`getLevelTheme(level: string)`**
- Returns complete theme object (colors, icons, styles)
- Used for risk cards styling

#### Components

1. **Bar Chart**: Aggregate risk distribution using Recharts
2. **Risk Cards**: Individual disease risk with:
   - Risk level indicator
   - Progress bar
   - AI reasoning
   - Disease-specific icon

---

### 6. **services/geminiService.ts** - AI Integration

Handles all interactions with Google Gemini AI.

#### Configuration

```typescript
const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY || 'YOUR_API_KEY_HERE' 
});
```

#### `analyzeRisk(data: PatientData): Promise<PredictionResult>`

Sends patient data to Gemini AI for risk analysis.

**Features:**
- Uses structured output with JSON schema
- Ensures consistent response format
- Analyzes 4 major diseases: Cardiovascular, Diabetes, Hypertension, CKD

**Prompt Structure:**
```typescript
const prompt = `Perform a disease risk assessment based on the following patient data:
  Age: ${data.age}
  Gender: ${data.gender}
  Weight: ${data.weight}kg, Height: ${data.height}cm
  Blood Pressure: ${data.systolicBP}/${data.diastolicBP} mmHg
  ...
  Identify risks for: Cardiovascular Disease, Type 2 Diabetes, Hypertension, and CKD.`;
```

**Response Schema:**
```typescript
responseSchema: {
  type: Type.OBJECT,
  properties: {
    risks: { type: Type.ARRAY, items: {...} },
    clinicalSummary: { type: Type.STRING },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
}
```

#### `speakSummary(text: string): Promise<() => void>`

Converts clinical summary to speech using Gemini TTS.

**Process:**
1. Calls Gemini TTS model with text
2. Receives base64-encoded PCM audio
3. Decodes audio data
4. Creates Web Audio API buffer
5. Plays audio through browser
6. Returns stop function for playback control

**Audio Decoding:**
```typescript
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer>
```

Converts raw PCM data to AudioBuffer:
- Converts Int16 PCM to Float32 samples
- Normalizes values to [-1, 1] range
- Creates multi-channel audio buffer

---

## Styling

The application uses **Tailwind CSS** for styling with a custom design system:

### Color Palette
- **Primary**: Emerald (Green) - `emerald-500`, `emerald-600`
- **Risk Levels**:
  - Low: Green (`emerald-500`)
  - Moderate: Amber (`amber-500`)
  - High: Orange (`orange-500`)
  - Critical: Red (`red-500`)
- **Neutral**: Slate shades for text and backgrounds

### Design Patterns
- **Rounded corners**: `rounded-xl`, `rounded-2xl` for modern look
- **Shadows**: Subtle shadows for depth (`shadow-sm`, `shadow-lg`)
- **Transitions**: Smooth hover effects with `transition-all`
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

---

## Application Flow

1. **User Input**: Patient fills out form with vitals and lifestyle data
2. **Submission**: Form data is validated and sent to Gemini AI
3. **AI Analysis**: Gemini processes data and returns structured risk assessment
4. **Visualization**: Results are displayed with charts and risk cards
5. **Audio Summary**: User can listen to clinical summary via TTS
6. **Recommendations**: Preventive care suggestions are shown

---

## Key Learning Concepts

### React Concepts
- **Hooks**: `useState`, `useCallback` for state management
- **Props**: Component communication via props
- **Conditional Rendering**: Dynamic UI based on state
- **Event Handling**: Form submissions, button clicks
- **Controlled Components**: Form inputs controlled by React state

### TypeScript
- **Interfaces**: Type definitions for data structures
- **Type Safety**: Compile-time error checking
- **Generics**: Type-safe state management

### API Integration
- **Async/Await**: Handling asynchronous operations
- **Error Handling**: Try-catch blocks for API failures
- **Structured Output**: JSON schema for consistent responses

### Web Audio API
- **AudioContext**: Browser audio processing
- **AudioBuffer**: In-memory audio data
- **PCM Decoding**: Converting raw audio to playable format

---
## 📞 Support

For questions or issues, please open an issue on GitHub
and ask me i'll assist.

---
