import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors({ origin: 'http://localhost:5173' })); // Vite's default port
app.use(express.json());

app.post('/api/review', async (req, res) => {
  const { code, language } = req.body;

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are a senior software engineer doing a code review. Analyze the following ${language || 'code'} and respond ONLY with a JSON object in this exact format, no markdown, no explanation outside JSON:

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

    const raw = message.content[0].text;
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));