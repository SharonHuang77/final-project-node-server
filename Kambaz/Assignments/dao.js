//import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export async function findAllAssignments() {
  // const { assignments } = Database;
  // return assignments;
  const assignments = await model.find();
  return assignments;
}

export async function findAssignmentsForCourse(courseId) {
  // const { assignments } = Database;
  // return assignments.filter((assignment) => assignment.course === courseId);
  const assignments = await model.find({ course: courseId });
  return assignments;
}

export async function createAssignment(assignment) {
  const newAssignment = { 
    ...assignment, 
    _id: uuidv4() 
  }
  const created = await model.create(newAssignment);
  return created;
  // Database.assignments = [...Database.assignments, newAssignment];
  // return newAssignment;
}

// export async function updateAssignment(assignmentId, assignmentUpdates) {
//   // const { assignments } = Database;
//   // const assignment = assignments.find((assignment) => assignment._id === assignmentId);
//   // if (assignment) {
//   //   Object.assign(assignment, assignmentUpdates);
//   //   return assignment;
//   // }
//   // return null;
//   await model.updateOne({ _id: assignmentId }, { $set: updates });
//   return await model.findById(assignmentId);
// }

export async function updateAssignment(assignmentId, assignmentUpdates) {
  try {
    const updatedAssignment = await model.findByIdAndUpdate(
      assignmentId,
      assignmentUpdates,
      { new: true } 
    );
    return updatedAssignment;
  } catch (error) {
    console.error("Error updating assignment:", error);
    throw error;
  }
}

export async function deleteAssignment(assignmentId) {
  // const { assignments } = Database;
  // Database.assignments = assignments.filter((assignment) => assignment._id !== assignmentId);
  // return { status: "ok" };
  return await model.deleteOne({ _id: assignmentId });
}