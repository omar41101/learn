import { Router } from 'express';
import * as progressController from '../controllers/progressController.js';

const router = Router();

router.get('/user/:userId/level/:levelId', progressController.getProgress);

router.get('/user/:userId', progressController.getAllProgress);

router.put('/user/:userId/level/:levelId', progressController.updateProgress);

router.post('/user/:userId/level/:levelId/complete', progressController.completeLevel);

router.get('/user/:userId/total-score', progressController.getTotalScore);

export default router;
