import Contest from '../models/Contest.js';
import Problem from '../models/Problem.js';

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
export const getContests = async (req, res, next) => {
  try {
    const contests = await Contest.find({}).sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    next(error);
  }
};

// @desc    Get contest by ID
// @route   GET /api/contests/:id
// @access  Public
export const getContestById = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems', 'title difficulty score');
    if (contest) {
      res.json(contest);
    } else {
      res.status(404);
      throw new Error('Contest not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a contest
// @route   POST /api/contests
// @access  Private/Admin
export const createContest = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    const contest = new Contest({
      title,
      description,
      startTime,
      endTime,
    });

    const createdContest = await contest.save();
    res.status(201).json(createdContest);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
export const deleteContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (contest) {
      await contest.deleteOne();
      res.json({ message: 'Contest removed' });
    } else {
      res.status(404);
      throw new Error('Contest not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register for a contest
// @route   POST /api/contests/:id/register
// @access  Private
export const registerForContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (contest) {
      if (contest.registeredUsers.includes(req.user._id)) {
        res.status(400);
        throw new Error('Already registered for this contest');
      }

      contest.registeredUsers.push(req.user._id);
      await contest.save();
      res.status(200).json({ message: 'Successfully registered for the contest' });
    } else {
      res.status(404);
      throw new Error('Contest not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public
export const getLeaderboard = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('leaderboard.user', 'username');
    if (contest) {
      // Sort leaderboard by score descending, then time penalty ascending
      const sortedLeaderboard = contest.leaderboard.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timePenalty - b.timePenalty;
      });
      res.json(sortedLeaderboard);
    } else {
      res.status(404);
      throw new Error('Contest not found');
    }
  } catch (error) {
    next(error);
  }
};
