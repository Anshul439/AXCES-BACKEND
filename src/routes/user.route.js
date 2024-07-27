import express from 'express';
import { createProfile, getUserProfile, updateUserProfile, verifyNumber } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/verifyUser.js';

const router = express.Router();

router.post('/profile', createProfile);
router.post('/user/profile', authenticateToken, updateUserProfile);
router.get('/profile', authenticateToken, getUserProfile);

router.post('/user/verify', verifyNumber);

export default router;
