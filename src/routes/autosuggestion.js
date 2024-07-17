import express from 'express';
import { getAutocompleteSuggestions } from '../controllers/autosuggestion.js';

const router = express.Router();

router.get('/auto', getAutocompleteSuggestions);

export default router;