import express from 'express';
import { submitCode, getSubmissions, getAllSubmissions, runCode } from '../controllers/submissionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/run')
  .post(runCode); // Public access for playground

router.route('/')
  .post(protect, submitCode)
  .get(protect, getSubmissions);

router.route('/all')
  .get(protect, admin, getAllSubmissions);

export default router;
