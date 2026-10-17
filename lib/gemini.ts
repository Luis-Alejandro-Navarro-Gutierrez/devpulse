import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ReleaseAnalysis {
  repo_name: string;
  version: string;
  has_breaking_changes: boolean;
  summary: string;
  key_changes: string[];
  urgency: 'low' | 'medium' | 'high';
}

export async function analyzeChangelog(
  repo: string,
  tag: string,
  rawBody: string
): Promise<ReleaseAnalysis> {
  const prompt = `Analiza las notas de release del repositorio ${repo} (versión ${tag}).
Extrae si introduce breaking changes, un resumen conciso en español, los cambios clave y el nivel de urgencia para un desarrollador.

Notas de release:
${rawBody}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          repo_name: { type: Type.STRING },
          version: { type: Type.STRING },
          has_breaking_changes: { type: Type.BOOLEAN },
          summary: { type: Type.STRING },
          key_changes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          urgency: {
            type: Type.STRING,
            enum: ['low', 'medium', 'high'],
          },
        },
        required: [
          'repo_name',
          'version',
          'has_breaking_changes',
          'summary',
          'key_changes',
          'urgency',
        ],
      },
    },
  });

  return JSON.parse(response.text || '{}') as ReleaseAnalysis;
}