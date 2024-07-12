import express from 'express';
import { authenticateToken } from "../middlewares/verifyUser.js";
import { getBalance, rechargeCoins } from '../controllers/coins.controller.js';

const router = express.Router();

router.get('/balance', authenticateToken, getBalance);
router.post('/recharge', authenticateToken, rechargeCoins);

export default router;
