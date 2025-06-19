import { v4 as uuidv4 } from "uuid";
import model from "./model.js";


export async function findQuizzesForCourse(courseId) {
  return await model.find({ course: courseId });
}

export async function findQuizById(quizId) {
  return await model.findById(quizId);
}

export async function createQuiz(quiz) {
  try {
  const newQuiz = { ...quiz, _id: quiz._id || uuidv4(),
    title: quiz.title || "New Quiz",
    course: quiz.course,
    published: quiz.published || false
   };
  return await model.create(newQuiz);
  } catch (e) {
    console.error("Create quiz failed", e.message);
    throw e;
  }
}

export async function updateQuiz(quizId, updates) {
  await model.updateOne({ _id: quizId }, { $set: updates });
  return await model.findById(quizId);
}

export async function deleteQuiz(quizId) {
  return await model.deleteOne({ _id: quizId });
}

