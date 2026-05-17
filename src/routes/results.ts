import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as resultController from '../controllers/resultController.js';
import { submitResultSchema, submitDiagnosisSchema } from '../validators/resultValidator.js';

const router = Router();

router.post('/submit', validate(submitResultSchema), resultController.submit);

router.get('/user/:userId', resultController.getUserResults);

router.get('/user/:userId/level/:levelId', resultController.getLevelResults);

router.get('/diagnosis/all', resultController.getAllDiagnosis);

router.post('/diagnosis/submit', validate(submitDiagnosisSchema), resultController.submitDiagnosis);

router.get('/diagnosis/user/:userId', resultController.getUserDiagnosis);

router.get('/statistics/all', resultController.getStatistics);

export default router;
