import mongoose from "mongoose";
import assignmentSchema from "./schema.js";

const assignmentModel = mongoose.model("AssignmentModel", assignmentSchema);

export default assignmentModel;