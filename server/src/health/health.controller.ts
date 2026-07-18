// server/src/health/health.controller.ts
import { Router, Request, Response } from 'express';
import { healthService } from '../monitoring/health.service';
import { metricsService } from '../monitoring/metrics.service';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const check = await healthService.checkReadiness();
  res.status(check.status === 'ready' ? 200 : 503).json(check);
});

router.get('/health/live', async (req: Request, res: Response) => {
  const check = await healthService.checkLiveness();
  res.json(check);
});

router.get('/health/ready', async (req: Request, res: Response) => {
  const check = await healthService.checkReadiness();
  res.status(check.status === 'ready' ? 200 : 503).json(check);
});

router.get('/metrics', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(metricsService.getPrometheusMetrics());
});

export default router;
