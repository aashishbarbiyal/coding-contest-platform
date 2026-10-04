import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Contest from './models/Contest.js';
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

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing
    // await Contest.deleteMany();
    // await Problem.deleteMany();

    const contest1 = new Contest({
      title: 'Weekly Coding Challenge #1',
      description: 'Join our first weekly challenge! Perfect for beginners and intermediates.',
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // Started yesterday
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), // Ends in 6 days
    });
    
    const contest2 = new Contest({
      title: 'CodeSprint 2026',
      description: 'A fast-paced contest with algorithm-heavy problems. Cash prizes for the top 3!',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // Starts in 2 days
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // Ends in 3 days
    });

    const savedContest1 = await contest1.save();
    const savedContest2 = await contest2.save();

    const prob1 = new Problem({
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      difficulty: 'Easy',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
      score: 10,
      contestId: savedContest1._id,
      testCases: [
        { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
        { input: '3\n3 2 4\n6', output: '1 2', isHidden: true }
      ]
    });

    const prob2 = new Problem({
      title: 'Valid Palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
      difficulty: 'Easy',
      constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
      score: 15,
      contestId: savedContest1._id,
      testCases: [
        { input: 'A man, a plan, a canal: Panama', output: 'true', isHidden: false },
        { input: 'race a car', output: 'false', isHidden: true }
      ]
    });

    const prob3 = new Problem({
      title: 'Merge K Sorted Lists',
      description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.',
      difficulty: 'Hard',
      constraints: 'k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500',
      score: 50,
      contestId: savedContest2._id,
      testCases: [
        { input: '3\n3 1 4 5\n3 1 3 4\n2 2 6', output: '1 1 2 3 4 4 5 6', isHidden: false }
      ]
    });

    const savedProb1 = await prob1.save();
    const savedProb2 = await prob2.save();
    const savedProb3 = await prob3.save();

    savedContest1.problems.push(savedProb1._id);
    savedContest1.problems.push(savedProb2._id);
    await savedContest1.save();

    savedContest2.problems.push(savedProb3._id);
    await savedContest2.save();

    console.log('Successfully seeded contests and problems!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
