//import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";
import model from "./model.js";


export async function enrollUserInCourse(user, course) {
  // const { enrollments } = Database;
  // enrollments.push({ _id: uuidv4(), user: userId, course: courseId });
  const _id = `${user}-${course}`;
  const existing = await model.findOne({ _id });
  if (existing) return existing;

  const newEnrollment = { user, course, _id: `${user}-${course}` };
  // console.log("Enrolling user", user, "into course", course);
  return model.create(newEnrollment);
}

export async function findAllEnrollments() {
  const enrollments = await model.find();
  return enrollments;
}

export async function findCoursesForUser(userId) {
  // return Database.enrollments.filter(enrollment => enrollment.user === userId);
  const enrollments = await model.find({ user: userId }).populate("course");
  return enrollments.map((enrollment) => enrollment.course);
}

export async function findUsersForCourse(courseId) {
  //return Database.enrollments.filter(enrollment => enrollment.course === courseId);
  const enrollments = await model.find({ course: courseId }).populate("user");
  return enrollments.map((enrollment) => enrollment.user);
}

export async function findEnrollment(userId, courseId) {
  // return Database.enrollments.find(
  //   enrollment => enrollment.user === userId && enrollment.course === courseId);
  return await model.findOne({ user: userId, course: courseId }).populate("user").populate("course");
}

export function unenrollUserFromCourse(userId, courseId) {
  // Database.enrollments = Database.enrollments.filter(
  // (enrollment) => !(enrollment.user === userId && enrollment.course === courseId));
  return model.deleteOne({ user: userId, course: courseId });
}