
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientData, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyCEx2Lnrir_Ysm3Ef8aVPJyMgfG2jS-wfQ' });

// Utility to decode raw PCM audio data from Gemini TTS
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const analyzeRisk = async (data: PatientData): Promise<PredictionResult> => {
  const prompt = `Perform a disease risk assessment based on the following patient data:
    Age: ${data.age}
    Gender: ${data.gender}
    Weight: ${data.weight}kg, Height: ${data.height}cm
    Blood Pressure: ${data.systolicBP}/${data.diastolicBP} mmHg
    Fasting Blood Sugar: ${data.fastingBloodSugar} mg/dL
    Cholesterol: ${data.cholesterol} mg/dL
    Smoking: ${data.smokingStatus}
    Activity: ${data.physicalActivity}
    Family History: ${data.familyHistory.join(', ')}

    Identify risks for: Cardiovascular Disease, Type 2 Diabetes, Hypertension, and CKD.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                disease: { type: Type.STRING },
                riskScore: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING },
                reasoning: { type: Type.STRING }
              },
              required: ["disease", "riskScore", "riskLevel", "reasoning"]
            }
          },
          clinicalSummary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["risks", "clinicalSummary", "recommendations"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No text returned from model");
  }
  return JSON.parse(response.text);
};

export const speakSummary = async (text: string): Promise<() => void> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Clinical Report: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(
    decode(base64Audio),
    outputAudioContext,
    24000,
    1,
  );

  const source = outputAudioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(outputAudioContext.destination);
  source.start();

  return () => {
    source.stop();
    outputAudioContext.close();
  };
};
