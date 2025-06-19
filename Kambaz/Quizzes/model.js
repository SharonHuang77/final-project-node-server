import mongoose from "mongoose";
import quizSchema from "./quizSchema.js";

const QuizModel = mongoose.model("QuizModel", quizSchema);
export default QuizModel;