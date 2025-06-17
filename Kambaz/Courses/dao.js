//import Database from "../Database/index.js";
import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export async function findAllCourses() {
  //return Database.courses;
  const courses = await model.find();
  return courses;
}

export async function findCoursesForEnrolledUser(userId) {
  // const { courses, enrollments } = Database;
  // const enrolledCourses = courses.filter((course) =>
  //   enrollments.some((enrollment) => enrollment.user === userId && enrollment.course === course._id));
  // return enrolledCourses;
  const enrollments = await model.find({ user: userId });
  const courseIds = enrollments.map(enrollment => enrollment.course);
  const enrolledCourses = await model.find({ _id: { $in: courseIds } });
  return enrolledCourses;
}

export async function createCourse(course) {
  const newCourse = { ...course, _id: uuidv4() };
  //Database.courses = [...Database.courses, newCourse];
  const actualCourse = await model.create(newCourse);
  return actualCourse;
}

export async function deleteCourse(courseId) {
  // const { courses, enrollments } = Database;
  // Database.courses = courses.filter((course) => course._id !== courseId);
  // Database.enrollments = enrollments.filter(
  //   (enrollment) => enrollment.course !== courseId
  // );
  const status = await model.deleteOne({ _id: courseId });
  return status;
}


export async function updateCourse(courseId, courseUpdates) {
  // const { courses } = Database;
  // const course = courses.find((course) => course._id === courseId);
  // Object.assign(course, courseUpdates);
  // return course;
  const status = await model.updateOne({ _id: courseId }, { $set: courseUpdates });
  return status;
}

