import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors({ 
  origin: ['http://localhost:5173', 'https://codedotreview.vercel.app'] 
}));
app.use(express.json());

app.post('/api/review', async (req, res) => {
  const { code, language } = req.body;

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: 'You are a senior software engineer doing a code review. Always respond ONLY with a valid JSON object, no markdown, no backticks, no explanation outside the JSON.',
        },
        {
          role: 'user',
          content: `Analyze the following ${language || 'code'} and respond ONLY with a JSON object in this exact format:

{
  "summary": "1-2 sentence overall assessment",
  "score": <number 1-10>,
  "bugs": [{ "line": "<location>", "issue": "<description>", "fix": "<suggested fix>" }],
  "security": [{ "issue": "<description>", "severity": "low|medium|high", "fix": "<suggested fix>" }],
  "improvements": [{ "category": "<Performance|Readability|Best Practices>", "suggestion": "<description>" }],
  "positives": ["<thing done well>"]
}

Code to review:
\`\`\`${language || ''}
${code}
\`\`\``,
        },
      ],
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

const PORT = process.env.PORT || 3001;
app.post('/api/roast', async (req, res) => {
  const { code, language } = req.body;

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'You are a brutally honest, witty senior developer who roasts bad code like a comedy roast. Be savage, specific, and funny — but keep it about the code, not the person. Respond ONLY with a JSON object, no markdown, no backticks.',
        },
        {
          role: 'user',
          content: `Roast this ${language || 'code'} and respond ONLY with this JSON format:

{
  "opening": "<savage one-liner about the code overall>",
  "roasts": ["<specific roast about a real issue in the code>", ...],
  "verdict": "<final brutal summary, 1-2 sentences>"
}

Code:
\`\`\`${language || ''}
${code}
\`\`\``,
        },
      ],
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to roast code' });
  }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));