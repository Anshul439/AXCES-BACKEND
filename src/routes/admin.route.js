import express from 'express';
import { adminSignup, getAllUsers, getUserDetails, updateUser } from '../controllers/admin.controller.js';
import { adminMiddleware } from '../middlewares/verifyAdmin.middleware.js';

const router = express.Router();

router.post('/signup', adminSignup);

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId', updateUser);


export default router;
