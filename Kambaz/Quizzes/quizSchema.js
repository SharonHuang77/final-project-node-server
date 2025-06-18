import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    course: String,
    published: {
      type: Boolean,
      default: false
    }
  },
  { collection: "quizzes" }
);

export default quizSchema;