import { Router } from 'express';
import * as exerciseController from '../controllers/exerciseController.js';

const router = Router();

router.get('/level/:levelId', exerciseController.getByLevel);

router.get('/:exerciseId', exerciseController.getOne);

router.post('/', exerciseController.create);

router.put('/:exerciseId', exerciseController.update);

router.delete('/:exerciseId', exerciseController.remove);

export default router;
