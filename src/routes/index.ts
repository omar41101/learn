import { Router } from 'express';
import userRoutes from './users.js';
import exerciseRoutes from './exercises.js';
import progressRoutes from './progress.js';
import resultsRoutes from './results.js';
import aiRoutes from './ai.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/progress', progressRoutes);
router.use('/results', resultsRoutes);
router.use('/ai', aiRoutes);

export default router;
