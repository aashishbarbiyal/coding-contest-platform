import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import Contest from '../models/Contest.js';
import User from '../models/User.js';
import executeCode from '../utils/executeCode.js';

// @desc    Submit code for a problem
// @route   POST /api/submissions
// @access  Private
export const submitCode = async (req, res, next) => {
  try {
    const { problemId, contestId, code, language } = req.body;
    const userId = req.user._id;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(404);
      throw new Error('Problem not found');
    }

    // Initial submission state
    const submission = new Submission({
      user: userId,
      problem: problemId,
      contest: contestId,
      code,
      language,
      status: 'Pending',
    });
    await submission.save();

    let finalStatus = 'Accepted';
    let maxExecutionTime = 0;
    let errorMessage = '';

    // Run against test cases
    for (const testCase of problem.testCases) {
      try {
        let result = await executeCode(code, testCase.input, language.toLowerCase());

        if (result.status === 'Compilation Error') {
          finalStatus = 'Compilation Error';
          errorMessage = result.error;
          break;
        } else if (result.status === 'Runtime Error') {
          finalStatus = 'Runtime Error';
          errorMessage = result.error;
          maxExecutionTime = Math.max(maxExecutionTime, result.executionTime || 0);
          break;
        } else if (result.status === 'Time Limit Exceeded') {
          finalStatus = 'Time Limit Exceeded';
          maxExecutionTime = Math.max(maxExecutionTime, result.executionTime || 0);
          break;
        } else if (result.status === 'Success') {
          maxExecutionTime = Math.max(maxExecutionTime, result.executionTime || 0);
          // Compare output
          if (result.output !== testCase.output.trim()) {
            finalStatus = 'Wrong Answer';
            break;
          }
        }
      } catch (err) {
        finalStatus = 'Runtime Error';
        errorMessage = err.message || 'Execution failed';
        break;
      }
    }

    submission.status = finalStatus;
    submission.executionTime = maxExecutionTime;
    submission.errorMessage = errorMessage;
    await submission.save();

    // If Accepted, add to user's solved problems
    if (finalStatus === 'Accepted') {
      const user = await User.findById(userId);
      if (!user.solvedProblems.includes(problemId)) {
        user.solvedProblems.push(problemId);
        await user.save();
      }
    }

    // Update leaderboard if part of a contest
    if (contestId) {
      const contest = await Contest.findById(contestId);
      if (contest) {
        // Check if user already solved this problem in this contest
        const previousAccepted = await Submission.findOne({
          user: userId,
          problem: problemId,
          contest: contestId,
          status: 'Accepted',
          _id: { $ne: submission._id } // exclude current submission
        });

        // Find user in leaderboard
        const lbIndex = contest.leaderboard.findIndex(l => l.user.toString() === userId.toString());
        
        // Only award points if it wasn't already accepted
        let userScore = (finalStatus === 'Accepted' && !previousAccepted) ? problem.score : 0;
        
        // Simplified time penalty: add penalty only if wrong answer and not previously accepted?
        // Let's just add 10 penalty points for every wrong submission before accepted
        let timePenalty = (finalStatus !== 'Accepted' && !previousAccepted) ? 10 : 0;
        
        if (lbIndex !== -1) {
          contest.leaderboard[lbIndex].score += userScore;
          contest.leaderboard[lbIndex].timePenalty += timePenalty;
        } else {
          contest.leaderboard.push({
            user: userId,
            score: userScore,
            timePenalty: timePenalty,
          });
        }
        await contest.save();
      }
    }

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user submissions
// @route   GET /api/submissions
// @access  Private
export const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions
// @route   GET /api/submissions/all
// @access  Private/Admin
export const getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({})
      .populate('user', 'username email')
      .populate('problem', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Run arbitrary code (Playground)
// @route   POST /api/submissions/run
// @access  Public
export const runCode = async (req, res, next) => {
  try {
    const { code, language, input } = req.body;
    
    if (!code || !language) {
      res.status(400);
      throw new Error('Code and language are required');
    }

    const result = await executeCode(code, input || '', language.toLowerCase());
    res.json(result);
  } catch (error) {
    next(error);
  }
};
