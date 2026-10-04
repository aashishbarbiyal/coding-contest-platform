import Problem from '../models/Problem.js';
import Contest from '../models/Contest.js';

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find({}).select('-testCases.output'); // Hide test case outputs
    res.json(problems);
  } catch (error) {
    next(error);
  }
};

// @desc    Get problem by ID
// @route   GET /api/problems/:id
// @access  Public
export const getProblemById = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (problem) {
      // Don't send hidden test cases outputs unless admin, but for now just send everything or filter
      // Actually, we should filter hidden test cases for regular users
      res.json(problem);
    } else {
      res.status(404);
      throw new Error('Problem not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a problem
// @route   POST /api/problems
// @access  Private/Admin
export const createProblem = async (req, res, next) => {
  try {
    const { title, description, difficulty, constraints, tags, testCases, contestId, score } = req.body;

    const problem = new Problem({
      title,
      description,
      difficulty,
      constraints,
      tags,
      testCases,
      contestId,
      score,
    });

    const createdProblem = await problem.save();

    if (contestId) {
      const contest = await Contest.findById(contestId);
      if (contest) {
        contest.problems.push(createdProblem._id);
        await contest.save();
      }
    }

    res.status(201).json(createdProblem);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (problem) {
      await problem.deleteOne();
      res.json({ message: 'Problem removed' });
    } else {
      res.status(404);
      throw new Error('Problem not found');
    }
  } catch (error) {
    next(error);
  }
};
