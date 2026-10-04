import express from 'express';
import { getProblems, getProblemById, createProblem, deleteProblem } from '../controllers/problemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProblems)
  .post(protect, admin, createProblem);

router.route('/:id')
  .get(getProblemById)
  .delete(protect, admin, deleteProblem);

export default router;
