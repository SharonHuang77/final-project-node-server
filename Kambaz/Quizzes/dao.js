import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import quizModel from "./model.js";
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
      _id: uuidv4(), // ✅ custom ID
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
// export async function findStudentQuizResults(studentId, quizId) {
//   return await resultModel.find({ studentId, quizId }).sort({ submittedAt: -1 });
// }

export const findStudentQuizResults = async (studentId, quizId) => {
  // ─────────────────────────────
  // ⏱ Helper: Format Time Display
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds) return "0 minutes";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  // ─────────────────────────────
  // 🧠 Helper: Format One Question
  const formatQuestion = (originalQuestion, studentAnswer) => {
    const formatted = {
      id: originalQuestion._id,
      title: originalQuestion.title,
      type: originalQuestion.type,
      question: originalQuestion.question,
      studentAnswer: studentAnswer.answer,
      isCorrect: studentAnswer.isCorrect, // Use the stored isCorrect value
      earnedPoints: studentAnswer.pointsEarned || 0,
      maxPoints: originalQuestion.points || 1,
      explanation: originalQuestion.explanation || null,
    };

    switch (originalQuestion.type) {
      case "multiple-choice":
        formatted.options = originalQuestion.choices;
        
        // Fix: Properly handle correctAnswer (it's stored as index in DB)
        if (typeof originalQuestion.correctAnswer === "number") {
          formatted.correctAnswer = originalQuestion.choices[originalQuestion.correctAnswer];
        } else {
          formatted.correctAnswer = originalQuestion.correctAnswer;
        }

        // Fix: Student answer is already the choice text, not index
        formatted.studentAnswer = studentAnswer.answer;
        break;

      case "true-false":
        formatted.correctAnswer = originalQuestion.correctAnswer ? "True" : "False";
        // Fix: Handle both boolean and string student answers
        if (typeof studentAnswer.answer === 'boolean') {
          formatted.studentAnswer = studentAnswer.answer ? "True" : "False";
        } else {
          formatted.studentAnswer = studentAnswer.answer;
        }
        break;

      case "fill-in-blank":
        // Fix: Use possibleAnswers (all acceptable answers) instead of correctAnswer
        formatted.correctAnswer = Array.isArray(originalQuestion.possibleAnswers) 
          ? originalQuestion.possibleAnswers 
          : [originalQuestion.possibleAnswers];
        formatted.possibleAnswers = originalQuestion.possibleAnswers; // Keep original field
        formatted.caseSensitive = originalQuestion.caseSensitive;
        formatted.studentAnswer = studentAnswer.answer;
        break;

      case "short-answer":
        formatted.correctAnswer = originalQuestion.correctAnswer;
        formatted.studentAnswer = studentAnswer.answer;
        break;
    }

    return formatted;
  };

  // ─────────────────────────────
  // 📦 Fetch: Get ALL attempts for this student and quiz
  const allResults = await resultModel.find({ studentId, quizId }).sort({ attemptNumber: -1 });
  
  if (!allResults || allResults.length === 0) {
    console.warn("No results found for", studentId, quizId);
    return null;
  }

  // Get the latest result (first in sorted array)
  const latestResult = allResults[0];

  const quiz = await quizModel.findById(quizId);
  if (!quiz) throw new Error("Quiz not found");

  const questions = await questionModel.find({ quiz: quizId });

  // ─────────────────────────────
  // 🧮 Score Calculation & Mapping
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const questionMap = Object.fromEntries(questions.map(q => [q._id, q]));

  const enrichedQuestions = latestResult.answers
    .map((studentAnswer) => {
      const originalQuestion = questionMap[studentAnswer.questionId];
      return originalQuestion ? formatQuestion(originalQuestion, studentAnswer) : null;
    })
    .filter(Boolean); // remove null entries

  // ─────────────────────────────
  // 📅 Quiz metadata
  const availablePeriod = quiz.availableFromDate && quiz.availableUntilDate
    ? `${new Date(quiz.availableFromDate).toLocaleDateString()} – ${new Date(quiz.availableUntilDate).toLocaleDateString()}`
    : "N/A";

  // Fix: Build attempt history from ALL results
  const attemptHistory = allResults.map((result, index) => ({
    attempt: result.attemptNumber,
    score: result.score,
    timeUsed: formatTime(result.timeSpent),
    totalPoints,
    submittedAt: result.submittedAt,
    isLatest: index === 0 // Mark the latest attempt
  }));

  const enrichedResult = {
    title: quiz.title,
    dueDate: quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : "No due date",
    points: totalPoints,
    totalPoints,
    availablePeriod,
    instructions: quiz.instructions || {
      title: "Please read before starting.",
      guidelines: ["Complete all questions", "Submit when finished"]
    },
    totalQuestions: questions.length,
    timeLimit: quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} minutes` : "No time limit",
    lockDate: quiz.availableUntilDate ? new Date(quiz.availableUntilDate).toLocaleDateString() : "Not specified",
    multipleAttempts: quiz.multipleAttempts || false,
    maxAttempts: quiz.maxAttempts || 1,
    currentAttempt: {
      score: latestResult.score,
      totalPoints,
      submittedDate: new Date(latestResult.submittedAt).toLocaleDateString(),
      timeUsed: formatTime(latestResult.timeSpent),
    },
    attemptHistory, // Now includes all attempts
    questions: enrichedQuestions,
  };

  console.log("✅ Successfully enriched quiz result");
  console.log("🔍 Debug - Attempt History:", attemptHistory);
  return enrichedResult;
};

// Get all results for a quiz (for faculty)
export async function findAllQuizResults(quizId) {
  return await resultModel.find({ quizId }).populate('studentId').sort({ submittedAt: -1 });
}


// Get student's latest attempt
export async function findLatestStudentResult(studentId, quizId) {
  return await resultModel.findOne({ studentId, quizId }).sort({ attemptNumber: -1 });
}
