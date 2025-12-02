import { Router, Request, Response } from 'express';
import { redisClient } from '../config/redis';
import { checkCanvasHealth } from '../utils/canvas-adapter';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'customer-backend' });
});

router.get('/redis', async (req: Request, res: Response) => {
    try {
        await redisClient.set('health', 'ok');
        const val = await redisClient.get('health');
        res.json({ status: 'ok', redis: val === 'ok' ? 'connected' : 'error' });
    } catch (e: any) {
        res.status(500).json({ error: e.message || 'Redis Error' });
    }
});

router.get('/canvas-check', (req: Request, res: Response) => {
    const health = checkCanvasHealth();
    if (health) res.status(200).json(health);
    else res.status(500).json({ status: 'error', message: 'Canvas crashed' });
});

export default router;
