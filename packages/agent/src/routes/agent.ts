import express from 'express';
import { agentPrompt } from '../services/agent';

const router = express.Router();

router.post('/', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required and must be a string' });
  }

  try {
    const reply = await agentPrompt(query);
    res.json({ reply });
  } catch (error) {
    console.error('Error processing agent request:', error);
    res.status(500).json({ error: 'Failed to process AI response' });
  }
});

export default router; 