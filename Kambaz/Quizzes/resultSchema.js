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
  studentId: { 
    type: String, 
    required: true,
    ref: "UserModel",
    index: true //add
  },
  quizId: { 
    type: String, 
    required: true,
    ref: "QuizModel",
    index: true //add
  },
  courseId: {
    type: String,
    required: true,
    ref: "CourseModel",
    index: true //add
  },
  answers: {
    type: [answerSchema], //fix
    required: true, //add
    default: [] //add
  },
  score: { 
    type: Number, 
    required: true,
    default: 0,
    min: 0
  },
  totalPoints: { //add
    type: Number,
    required: true,
    min: 0
  },//add
  percentage: {
    type: Number,
    default: 0,
    min: 0, //add
    max: 100 //add
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
    default: 0,
    min: 0 //add
  },
  status: {
    type: String,
    enum: ["in-progress", "submitted", "graded"],
    default: "submitted"
  },
  //add
  ipAddress: String,
  userAgent: String,
  isLateSubmission: {
    type: Boolean,
    default: false
  }
}, 
{ 
  collection: "quizResults",
  timestamps: true 
});
// add: Virtual for calculating duration if not provided
resultSchema.virtual('calculatedTimeSpent').get(function() {
  if (this.startedAt && this.submittedAt) {
    return Math.floor((this.submittedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
  return this.timeSpent;
});//
// add: Pre-save middleware to calculate percentage and grade
resultSchema.pre('save', function(next) {
  // Calculate percentage if totalPoints is set
  if (this.totalPoints && this.totalPoints > 0) {
    this.percentage = Math.round((this.score / this.totalPoints) * 100);
    
    // Calculate grade based on percentage
    if (this.percentage >= 90) this.grade = 'A';
    else if (this.percentage >= 80) this.grade = 'B';
    else if (this.percentage >= 70) this.grade = 'C';
    else if (this.percentage >= 60) this.grade = 'D';
    else this.grade = 'F';
  }//

  //add: Calculate timeSpent if not provided
  if (!this.timeSpent && this.startedAt && this.submittedAt) {
    this.timeSpent = Math.floor((this.submittedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
  
  next();
});//

// Compound index to ensure unique attempts per student per quiz
resultSchema.index({ studentId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });

// Index for efficient queries
resultSchema.index({ quizId: 1, submittedAt: -1 }); //fix
resultSchema.index({ studentId: 1, courseId: 1 }); //fix
resultSchema.index({ courseId: 1, submittedAt: -1 }); //fix

// add:Static methods
resultSchema.statics.findBestAttempt = async function(studentId, quizId) {
  const attempts = await this.find({ studentId, quizId })
    .sort({ percentage: -1 })
    .limit(1);
  return attempts[0];
}; //

//add:
resultSchema.statics.getQuizStatistics = async function(quizId) {
  const results = await this.find({ quizId, status: 'submitted' });
  
  if (results.length === 0) return null;
  
  const percentages = results.map(r => r.percentage);
  const sum = percentages.reduce((a, b) => a + b, 0);
  
  return {
    totalAttempts: results.length,
    uniqueStudents: new Set(results.map(r => r.studentId)).size,
    averageScore: sum / results.length,
    highestScore: Math.max(...percentages),
    lowestScore: Math.min(...percentages),
    medianScore: calculateMedian(percentages)
  };
};//

//add:  Helper function for median calculation
function calculateMedian(numbers) {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
}//


export default resultSchema;