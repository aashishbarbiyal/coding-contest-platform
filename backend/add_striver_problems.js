import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected...`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const addProblems = async () => {
  await connectDB();

  try {
    // 1. Update Two Sum
    await Problem.updateOne(
      { title: 'Two Sum' },
      { 
        $set: {
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n**Input Format:**\nLine 1: N (Size of array)\nLine 2: N space-separated integers representing the array.\nLine 3: target (The target sum)\n\n**Output Format:**\nTwo space-separated integers representing the indices.',
          tags: ['Array', 'Hashing', 'Two Pointers'],
        }
      }
    );

    // 2. Set Matrix Zeroes
    const setMatrixZeroes = new Problem({
      title: 'Set Matrix Zeroes',
      description: 'Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0\'s.\n\nYou must do it in place.\n\n**Input Format:**\nLine 1: m n (number of rows and columns)\nNext m lines: n space-separated integers representing each row.\n\n**Output Format:**\nm lines, each containing n space-separated integers representing the modified matrix.',
      difficulty: 'Medium',
      constraints: 'm == matrix.length\nn == matrix[0].length\n1 <= m, n <= 200\n-2^31 <= matrix[i][j] <= 2^31 - 1',
      score: 20,
      tags: ['Array', 'Matrix', 'Striver SDE Sheet'],
      testCases: [
        { input: '3 3\n1 1 1\n1 0 1\n1 1 1', output: '1 0 1\n0 0 0\n1 0 1', isHidden: false },
        { input: '3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5', output: '0 0 0 0\n0 4 5 0\n0 3 1 0', isHidden: true }
      ]
    });

    // 3. Pascal's Triangle
    const pascalsTriangle = new Problem({
      title: 'Pascal\'s Triangle',
      description: 'Given an integer numRows, return the first numRows of Pascal\'s triangle.\n\nIn Pascal\'s triangle, each number is the sum of the two numbers directly above it.\n\n**Input Format:**\nA single integer numRows.\n\n**Output Format:**\nnumRows lines, where the i-th line contains i space-separated integers.',
      difficulty: 'Easy',
      constraints: '1 <= numRows <= 30',
      score: 10,
      tags: ['Array', 'Dynamic Programming', 'Striver SDE Sheet'],
      testCases: [
        { input: '5', output: '1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1', isHidden: false },
        { input: '1', output: '1', isHidden: true }
      ]
    });

    // 4. Maximum Subarray
    const maxSubarray = new Problem({
      title: 'Maximum Subarray',
      description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\n**Input Format:**\nLine 1: N (Size of array)\nLine 2: N space-separated integers.\n\n**Output Format:**\nA single integer representing the maximum sum.',
      difficulty: 'Medium',
      constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
      score: 20,
      tags: ['Array', 'Divide and Conquer', 'Dynamic Programming', 'Striver SDE Sheet'],
      testCases: [
        { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', isHidden: false },
        { input: '1\n1', output: '1', isHidden: true },
        { input: '5\n5 4 -1 7 8', output: '23', isHidden: true }
      ]
    });

    // 5. Sort Colors
    const sortColors = new Problem({
      title: 'Sort an array of 0s, 1s and 2s',
      description: 'Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.\n\nWe will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.\n\nYou must solve this problem without using the library\'s sort function.\n\n**Input Format:**\nLine 1: N (Size of array)\nLine 2: N space-separated integers (0, 1, or 2).\n\n**Output Format:**\nN space-separated integers representing the sorted array.',
      difficulty: 'Medium',
      constraints: 'n == nums.length\n1 <= n <= 300\nnums[i] is either 0, 1, or 2.',
      score: 20,
      tags: ['Array', 'Two Pointers', 'Sorting', 'Striver SDE Sheet'],
      testCases: [
        { input: '6\n2 0 2 1 1 0', output: '0 0 1 1 2 2', isHidden: false },
        { input: '3\n2 0 1', output: '0 1 2', isHidden: true }
      ]
    });

    await setMatrixZeroes.save();
    await pascalsTriangle.save();
    await maxSubarray.save();
    await sortColors.save();

    console.log('Striver SDE Sheet problems added successfully!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

addProblems();
