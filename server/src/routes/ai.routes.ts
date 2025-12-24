import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Gemini AI endpoint - moved to backend for security
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: context ? `${context}\n\n${prompt}` : prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.json({ text: generatedText });
  } catch (error) {
    console.error('AI generation error:', error);
    next(error);
  }
});

export default router;
