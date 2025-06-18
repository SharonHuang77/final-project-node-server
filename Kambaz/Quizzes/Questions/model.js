import mongoose from "mongoose";
import questionSchema from "./questionSchema.js";

const QuestionModel = mongoose.model("QuestionModel", questionSchema);

export default QuestionModel;