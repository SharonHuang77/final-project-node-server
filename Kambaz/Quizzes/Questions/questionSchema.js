import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      default: "New Question"
    },
    type: {
      type: String,
      enum: ["multiple-choice", "true-false", "fill-in-blank"],
      required: true,
      default: "multiple-choice"
    },
    points: {
      type: Number,
      required: true,
      default: 1,
      min: 0
    },
    question: {
      type: String,
      required: true,
      default: ""
    },
    quiz: {
      type: String, 
      required: true
    },
    choices: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    possibleAnswers: [String],
    caseSensitive: {
      type: Boolean,
      default: false
    }
  },
  { collection: "questions" }
);

// Validation middleware (optional, leave as-is)
questionSchema.pre("save", function (next) {
  if (this.type === "multiple-choice") {
    if (!this.choices || this.choices.length < 2) {
      return next(new Error("Multiple choice questions must have at least 2 choices"));
    }
    if (
      typeof this.correctAnswer !== "number" ||
      this.correctAnswer < 0 ||
      this.correctAnswer >= this.choices.length
    ) {
      return next(new Error("Multiple choice questions must have a valid correct answer index"));
    }
  } else if (this.type === "true-false") {
    if (typeof this.correctAnswer !== "boolean") {
      return next(new Error("True/False questions must have a boolean correct answer"));
    }
  } else if (this.type === "fill-in-blank") {
    if (!this.correctAnswer || typeof this.correctAnswer !== "string") {
      return next(new Error("Fill in the blank questions must have a valid correct answer"));
    }
  }
  next();
});

export default questionSchema;