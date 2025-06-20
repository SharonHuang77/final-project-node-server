import mongoose from "mongoose";
import resultSchema from "./resultSchema.js";

const resultModel = mongoose.model("QuizResultModel", resultSchema);
export default resultModel;