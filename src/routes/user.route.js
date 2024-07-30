import express from 'express';
import { createProfile, getUserProfile, sendOtp, updateUserProfile, verifyNumber, verifyOtp } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/verifyUser.js';

const router = express.Router();

router.post('/profile', createProfile);
router.post('/user/profile', authenticateToken, updateUserProfile);
router.get('/profile', authenticateToken, getUserProfile);
router.post('/verify-otp', verifyOtp);

router.post('/user/verify', verifyNumber);

router.post('/send-otp', sendOtp)

export default router;
