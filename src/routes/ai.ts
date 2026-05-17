import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';

const router = Router();

router.post('/generate', aiController.generate);

router.post('/hint', aiController.hint);

router.post('/explain', aiController.explain);

export default router;
