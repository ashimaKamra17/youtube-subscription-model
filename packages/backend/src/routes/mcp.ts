import express, { Request, Response } from 'express';
import MCP from '../services/mcpSchema';

const router = express.Router();

interface MCPRequest extends Request {
  params: {
    namespace: string;
  };
  query: {
    [key: string]: string | undefined;
  };
}

router.get('/:namespace', async (req: MCPRequest, res: Response) => {
  const ns = decodeURIComponent(req.params.namespace);
  const handler = MCP[ns as keyof typeof MCP];

  if (!handler) {
    return res.status(404).json({ error: 'Unknown MCP namespace' });
  }

  try {
    const data = await handler(req.query);
    res.json({ namespace: ns, data });
  } catch (err) {
    console.error('MCP Error:', err);
    res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Internal server error' 
    });
  }
});

export default router; 