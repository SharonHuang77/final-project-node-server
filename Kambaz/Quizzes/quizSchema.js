import mongoose from "mongoose";
import questionSchema from "./Questions/questionSchema.js";

const quizSchema = new mongoose.Schema(
  {
    _id: {type: String, required: true},
    title: {type: String, required: true, default: "Unnamed Quiz"},
    description: {type: String, default: ""},
    quizType: {
      type: String,
      enum: ["Graded Quiz", "Practice Quiz", "Graded Survey", "Ungraded Survey"],
      default: "Graded Quiz"
    },
    course: { type: String, required: true },
    availableFromDate: { type: Date },
    availableUntilDate: { type: Date },
    dueDate: { type: Date },
    points: { type: Number, default: 0 },
    numberOfQuestions: Number,
    assignmentGroup: {
      type: String,
      enum: ["Quizzes", "Exams", "Assignments", "Project", "QUIZZES", "ASSIGNMENTS"],
      default: "Quizzes"
    },
    shuffleAnswers: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 20 },
    multipleAttempts: { type: Boolean, default: false },
    howManyAttempts: { type: Number, default: 1 },
    showCorrectAnswers: { type: Boolean, default: false },
    accessCode: { type: String, default: "" },
    oneQuestionAtATime:  {type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
    lockAfterAnswering: { type: Boolean, default: false },
    published: { type: Boolean, default: false, required: true },
    questions: [questionSchema],
  },
  { collection: "quizzes",
    _id: false
   }
);

export default quizSchema;