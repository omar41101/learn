import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

const FREE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
];

function getAIClient(): GoogleGenAI {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('API_KEY_MISSING'), { statusCode: 400 });
  }
  return new GoogleGenAI({ apiKey });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: string
): Promise<{ text: string }> {
  for (const model of FREE_MODELS) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      return { text: (response as any).text || '' };
    } catch (err: any) {
      const isQuota = err.status === 429 || (err.message || '').includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        const retryMatch = (err.message || '').match(/retry[^0-9]*([\d.]+)s/i);
        const delaySec = retryMatch ? parseFloat(retryMatch[1]) : 0;
        if (delaySec > 0 && delaySec <= 60) {
          await sleep((delaySec + 1) * 1000);
          try {
            const response = await ai.models.generateContent({ model, contents });
            return { text: (response as any).text || '' };
          } catch {
            // fall through to next model
          }
        }
        continue;
      }
      throw err;
    }
  }
  throw Object.assign(new Error('ALL_QUOTAS_EXHAUSTED'), { status: 429 });
}

export async function generateExercise(
  topic: string,
  type: string,
  level: number
): Promise<Record<string, unknown>> {
  const ai = getAIClient();

  const prompt = `
    You are an educational AI assistant specialized in creating interactive exercises for children.
    Language: Arabic (Modern Standard Arabic).

    Topic: ${topic}
    Exercise Type: ${type}
    Educational Level: ${level} (Age group: ${level === 1 ? '5-6' : level === 2 ? '7-8' : level === 3 ? '9-10' : '11-12'} years old).

    Instructions:
    1. Generate a valid JSON object matching the exercise schema.
    2. The content should be educational, engaging, and in Arabic.
    3. Do not include any text outside the JSON block.

    JSON Schema based on type:
    - If type is 'multiple_choice':
      { "title": "Exercise Title in Arabic", "question": "Question text in Arabic", "hint": "Small hint in Arabic", "data": { "options": ["Option A", "Option B", "Option C"], "correctAnswer": 0 } }
    - If type is 'drag-drop':
      { "title": "Exercise Title in Arabic", "question": "Question text in Arabic", "hint": "Small hint in Arabic", "data": { "categories": ["Category 1", "Category 2"], "items": [{ "name": "Item Name", "correctCategory": "Category 1" }, { "name": "Item Name 2", "correctCategory": "Category 2" }] } }
    - If type is 'matching':
      { "title": "Exercise Title in Arabic", "question": "Question text in Arabic", "hint": "Small hint in Arabic", "data": { "pairs": [{ "left": "Text 1", "right": "Match 1" }, { "left": "Text 2", "right": "Match 2" }] } }

    Return only the JSON object.
  `;

  const response = await generateWithFallback(ai, prompt);
  const cleanJson = response.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanJson);
}

export async function generateHint(
  question: string,
  context: unknown
): Promise<{ hint: string }> {
  const ai = getAIClient();
  const prompt = `A student is stuck on this question: "${question}".
    Context: ${JSON.stringify(context)}.
    Provide a very short, encouraging hint in Arabic that helps them think without giving the answer away.
    Limit to 10 words.`;

  const response = await generateWithFallback(ai, prompt);
  return { hint: response.text.trim() };
}

export async function generateExplanation(
  question: string,
  studentAnswer: string,
  correctAnswer: string
): Promise<{ explanation: string }> {
  const ai = getAIClient();
  const prompt = `A student answered "${studentAnswer}" to the question "${question}".
    The correct answer is "${correctAnswer}".
    In Arabic, explain briefly and kindly why "${correctAnswer}" is correct and why ${studentAnswer} was a mistake.
    Use a friendly tone for a child.`;

  const response = await generateWithFallback(ai, prompt);
  return { explanation: response.text.trim() };
}
