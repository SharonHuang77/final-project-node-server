import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  answer: { type: mongoose.Schema.Types.Mixed, default: null },
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    required: true,
    ref: "UserModel"
  },
  quizId: { 
    type: String, 
    required: true,
    ref: "QuizModel"
  },
  courseId: {
    type: String,
    required: true,
    ref: "CourseModel"
  },
  answers: [answerSchema],
  score: { 
    type: Number, 
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  attemptNumber: { 
    type: Number, 
    default: 1 
  },
  startedAt: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  submittedAt: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ["in-progress", "submitted", "graded"],
    default: "submitted"
  }
}, 
{ 
  collection: "quizResults",
  timestamps: true 
});

// Compound index to ensure unique attempts per student per quiz
resultSchema.index({ studentId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });

// Index for efficient queries
resultSchema.index({ quizId: 1 });
resultSchema.index({ studentId: 1 });
resultSchema.index({ courseId: 1 });

export default resultSchema;