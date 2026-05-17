import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

router.post('/logout', userController.logout);

router.post('/register', userController.register);

router.post('/quick-register', userController.quickRegister);

router.post('/login', userController.login);

router.get('/students/all', userController.getAllStudents);

router.post('/students/create', userController.createStudent);

router.put('/students/:studentId', userController.updateStudent);

router.delete('/students/:studentId', userController.deleteStudent);

router.get('/:userId', userController.getProfile);

router.put('/:userId', userController.updateProfile);

export default router;
