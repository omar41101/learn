import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Free-tier models in priority order (fallback if one quota is exhausted)
const FREE_MODELS = [
    'gemini-flash-latest',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash-8b',
];

/**
 * Helper to get Gemini Client
 */
function getAIClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '') {
        throw new Error('API_KEY_MISSING');
    }
    return new GoogleGenAI({ apiKey });
}

/**
 * Sleep for ms milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call generateContent with automatic retry on 429 and model fallback.
 * Tries each model in FREE_MODELS; on 429 waits the retryDelay then retries once.
 */
async function generateWithFallback(ai, contents) {
    for (const model of FREE_MODELS) {
        try {
            const response = await ai.models.generateContent({ model, contents });
            return response;
        } catch (err) {
            const isQuota = err.status === 429 || (err.message || '').includes('RESOURCE_EXHAUSTED');
            if (isQuota) {
                // Try to honour the retryDelay for per-minute limits
                const retryMatch = (err.message || '').match(/retry[^0-9]*([\d.]+)s/i);
                const delaySec = retryMatch ? parseFloat(retryMatch[1]) : 0;
                if (delaySec > 0 && delaySec <= 60) {
                    // Per-minute quota: wait and retry this model once
                    await sleep((delaySec + 1) * 1000);
                    try {
                        const response = await ai.models.generateContent({ model, contents });
                        return response;
                    } catch (retryErr) {
                        // Still failing — fall through to next model
                    }
                }
                // Daily quota or retry failed: move to next model
                continue;
            }
            throw err; // Non-quota error — propagate immediately
        }
    }
    // All models exhausted
    throw Object.assign(new Error('ALL_QUOTAS_EXHAUSTED'), { status: 429 });
}

/**
 * Endpoint: /api/ai/generate
 */
router.post('/generate', async (req, res) => {
    const { topic, type, level } = req.body;

    if (!topic || !type || !level) {
        return res.status(400).json({ error: 'Missing topic, type, or level' });
    }

    try {
        const ai = getAIClient();

        const prompt = `
            You are an educational AI assistant specialized in creating interactive exercises for children.
            Language: Arabic (Modern Standard Arabic).
            
            Topic: ${topic}
            Exercise Type: ${type}
            Educational Level: ${level} (Age group: ${level == 1 ? '5-6' : level == 2 ? '7-8' : level == 3 ? '9-10' : '11-12'} years old).

            Instructions:
            1. Generate a valid JSON object matching the exercise schema.
            2. The content should be educational, engaging, and in Arabic.
            3. Do not include any text outside the JSON block.

            JSON Schema based on type:
            - If type is 'multiple_choice':
              {
                "title": "Exercise Title in Arabic",
                "question": "Question text in Arabic",
                "hint": "Small hint in Arabic",
                "data": { "options": ["Option A", "Option B", "Option C"], "correctAnswer": 0 }
              }
            - If type is 'drag-drop':
              {
                "title": "Exercise Title in Arabic",
                "question": "Question text in Arabic",
                "hint": "Small hint in Arabic",
                "data": { 
                  "categories": ["Category 1", "Category 2"], 
                  "items": [
                    {"name": "Item Name", "correctCategory": "Category 1"},
                    {"name": "Item Name 2", "correctCategory": "Category 2"}
                  ] 
                }
              }
            - If type is 'matching':
              {
                "title": "Exercise Title in Arabic",
                "question": "Question text in Arabic",
                "hint": "Small hint in Arabic",
                "data": { 
                  "pairs": [
                    {"left": "Text 1", "right": "Match 1"},
                    {"left": "Text 2", "right": "Match 2"}
                  ]
                }
              }

            Return only the JSON object.
        `;

        const response = await generateWithFallback(ai, prompt);

        const responseText = response.text;
        
        // Clean response text (remove markdown if any)
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const exercise = JSON.parse(cleanJson);

        res.json(exercise);
    } catch (err) {
        console.error('AI Generation Error:', err);
        let errorMsg = err.message || '';
        let userFriendlyError = 'Failed to generate exercise with AI';
        
        if (errorMsg === 'API_KEY_MISSING' || errorMsg.includes('API_KEY_INVALID')) {
            userFriendlyError = 'Invalid or missing API Key. Please check your .env file.';
        } else if (errorMsg === 'ALL_QUOTAS_EXHAUSTED' || err.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED')) {
            userFriendlyError = 'All free AI models are quota-limited right now. Please try again in a few minutes or tomorrow.';
            return res.status(429).json({ error: userFriendlyError });
        } else if (errorMsg.includes('404') || errorMsg.includes('NOT_FOUND')) {
            userFriendlyError = 'AI model not found. Please contact support.';
        }
        
        res.status(500).json({ error: userFriendlyError, details: errorMsg });
    }
});

/**
 * Endpoint: /api/ai/hint
 */
router.post('/hint', async (req, res) => {
    const { question, context } = req.body;
    try {
        const ai = getAIClient();
        const prompt = `A student is stuck on this question: "${question}". 
                        Context: ${JSON.stringify(context)}.
                        Provide a very short, encouraging hint in Arabic that helps them think without giving the answer away.
                        Limit to 10 words.`;

        const response = await generateWithFallback(ai, prompt);

        res.json({ hint: response.text.trim() });
    } catch (err) {
        console.error('AI Hint Error:', err);
        let errorMsg = err.message || '';
        if (err.status === 429 || errorMsg.includes('quota')) {
            return res.status(429).json({ error: 'AI Quota Exceeded. Please try again in a few minutes.' });
        }
        res.status(500).json({ error: 'AI Hint failed', details: errorMsg });
    }
});

/**
 * Endpoint: /api/ai/explain
 */
router.post('/explain', async (req, res) => {
    const { question, studentAnswer, correctAnswer } = req.body;
    try {
        const ai = getAIClient();
        const prompt = `A student answered "${studentAnswer}" to the question "${question}".
                        The correct answer is "${correctAnswer}".
                        In Arabic, explain briefly and kindly why "${correctAnswer}" is correct and why ${studentAnswer} was a mistake. 
                        Use a friendly tone for a child.`;

        const response = await generateWithFallback(ai, prompt);

        res.json({ explanation: response.text.trim() });
    } catch (err) {
        console.error('AI Explanation Error:', err);
        let errorMsg = err.message || '';
        if (err.status === 429 || errorMsg.includes('quota')) {
            return res.status(429).json({ error: 'AI Quota Exceeded. Please try again later.' });
        }
        res.status(500).json({ error: 'AI Explanation failed', details: errorMsg });
    }
});

export default router;
