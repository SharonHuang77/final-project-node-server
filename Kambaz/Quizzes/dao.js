import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import questionModel from "./Questions/model.js"
import resultModel from "./resultModel.js";


export async function findQuizzesForCourse(courseId) {
  return await model.find({ course: courseId });
}

export const findQuizById = async (quizId) => {

  console.log("▶ Fetching quiz by ID:", quizId);
  const quiz = await model.findById(quizId).lean();
  if (!quiz){
    console.log("Quiz not found for ID:", quizId);
   throw new Error("Quiz not found");
  }
  const questions = await questionModel.find({ quiz: quizId }).lean();
  console.log("Found questions:", questions);
  return { ...quiz, questions };
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
  return await model.findById(quizId).lean();
}

export async function deleteQuiz(quizId) {
  return await model.deleteOne({ _id: quizId });
}

export async function storeQuizResult(resultData) {
  try {
    // Check how many attempts the student has made
    const previousAttempts = await resultModel.countDocuments({
      studentId: resultData.studentId,
      quizId: resultData.quizId
    });
    const newResult = await resultModel.create({
      ...resultData,
      attemptNumber: previousAttempts + 1,
      percentage: (resultData.score / resultData.totalPoints) * 100
    });
    return newResult;
  } catch (error) {
    console.error("Error storing quiz result:", error);
    throw error;
  }
}
// Get student's results for a specific quiz
export async function findStudentQuizResults(studentId, quizId) {
  return await resultModel.find({ studentId, quizId }).sort({ submittedAt: -1 });
}

// Get all results for a quiz (for faculty)
export async function findAllQuizResults(quizId) {
  return await resultModel.find({ quizId }).populate('studentId').sort({ submittedAt: -1 });
}

// Get student's latest attempt
export async function findLatestStudentResult(studentId, quizId) {
  return await resultModel.findOne({ studentId, quizId }).sort({ attemptNumber: -1 });
}
