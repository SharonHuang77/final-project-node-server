import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true,
    ref: "QuestionModel" //add
   },
  answer: { type: mongoose.Schema.Types.Mixed, default: null },
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0,
    min: 0 //add
   }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
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
  totalPoints: { //add
    type: Number,
    required: true,
    min: 0
  },//add
  percentage: {
    type: Number,
    default: 0
  },
  grade: { //add
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    required: true
  }, //add
  attemptNumber: { 
    type: Number, 
    default: 1,
    min: 1 //add 
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    required: true
  },
  attemptNumber: { 
    type: Number, 
    default: 1,
    min: 1
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
  timestamps: true ,
  _id:false
});

// Compound index to ensure unique attempts per student per quiz
resultSchema.index({ studentId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });

// Index for efficient queries
resultSchema.index({ quizId: 1 });
resultSchema.index({ studentId: 1 });
resultSchema.index({ courseId: 1 });

export default resultSchema;