import express from 'express';
import { createProfile, getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/verifyUser.js';

const router = express.Router();

router.post('/profile', createProfile);
router.post('/user/profile', authenticateToken, updateUserProfile);
router.get('/profile', authenticateToken, getUserProfile);

export default router;
