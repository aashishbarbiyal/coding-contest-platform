import mongoose from 'mongoose';

const testCaseSchema = mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: true,
  }
});

const problemSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    constraints: {
      type: String,
    },
    tags: [
      {
        type: String,
      }
    ],
    testCases: [testCaseSchema],
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
    },
    score: {
      type: Number,
      default: 100,
    }
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
