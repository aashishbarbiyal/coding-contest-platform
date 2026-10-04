import express from 'express';
import {
  getContests,
  getContestById,
  createContest,
  deleteContest,
  registerForContest,
  getLeaderboard
} from '../controllers/contestController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getContests)
  .post(protect, admin, createContest);

router.route('/:id')
  .get(getContestById)
  .delete(protect, admin, deleteContest);

router.route('/:id/register')
  .post(protect, registerForContest);

router.route('/:id/leaderboard')
  .get(getLeaderboard);

export default router;
