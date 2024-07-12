import express from 'express';
import { createProfile, updateUserProfile } from '../controllers/user.controller.js';
import { validateProfile } from '../middlewares/validate.js';
import { authenticateToken } from '../middlewares/verifyUser.js';

const router = express.Router();

router.post('/profile', validateProfile, createProfile);
router.post('/user/profile', authenticateToken, updateUserProfile);

export default router;
