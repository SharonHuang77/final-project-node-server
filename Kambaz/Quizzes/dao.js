import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import quizModel from "./model.js";
import questionModel from "./Questions/model.js"
import resultModel from "./resultModel.js";


export async function findQuizzesForCourse(courseId) {
  return await model.find({ course: courseId });
}

export const findQuizById = async (quizId) => {

  console.log("Fetching quiz by ID:", quizId);
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
    console.log("📥 Received quiz result submission:", resultData);

    // ───────────────
    // ✅ Step 1: Validate required fields
    if (!resultData.studentId || !resultData.quizId) {
      throw new Error("studentId and quizId are required");
    }

    if (!Array.isArray(resultData.answers)) {
      throw new Error("answers must be an array");
    }

    if (typeof resultData.score !== "number") {
      throw new Error("score must be a number");
    }

    if (typeof resultData.totalPoints !== "number" || resultData.totalPoints <= 0) {
      throw new Error("totalPoints must be a positive number");
    }

    // ───────────────
    // ✅ Step 2: Fetch quiz and attempt count
    const quiz = await model.findById(resultData.quizId).lean();
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const previousAttempts = await resultModel.countDocuments({
      studentId: resultData.studentId,
      quizId: resultData.quizId
    });

    // ───────────────
    // ✅ Step 3: Enforce attempt limits
    if (quiz.howManyAttempts && previousAttempts >= quiz.howManyAttempts) {
      throw new Error(`Maximum attempts (${quiz.howManyAttempts}) exceeded`);
    }

    // ───────────────
    // ✅ Step 4: Calculate percentage and grade
    const percentage = Math.round((resultData.score / resultData.totalPoints) * 100);
    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 80) grade = "B";
    else if (percentage >= 70) grade = "C";
    else if (percentage >= 60) grade = "D";

    // ───────────────
    // ✅ Step 5: Create the result entry
    const newResult = await resultModel.create({
      _id: uuidv4(),
      ...resultData,
      attemptNumber: previousAttempts + 1,
      percentage,
      grade,
      submittedAt: resultData.submittedAt || new Date()
    });

    console.log("✅ Quiz result stored successfully:", newResult._id);
    return newResult;

  } catch (error) {
    console.error("❌ Error storing quiz result:", error.message);
    throw error; // Will be caught and returned as 400 or 500 in the route handler
  }
}

// Get student's results for a specific quiz
// export async function findStudentQuizResults(studentId, quizId) {
//   return await resultModel.find({ studentId, quizId }).sort({ submittedAt: -1 });
// }

export const findStudentQuizResults = async (studentId, quizId) => {
  try {
    console.log("🔍 Looking for results:", { studentId, quizId });
    console.log("🔍 Types:", { studentIdType: typeof studentId, quizIdType: typeof quizId });

    const formatTime = (timeInSeconds) => {
      if (!timeInSeconds) return "0 minutes";
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    // Try multiple query variations to handle type mismatches
    let allResults = [];
    
    const queryVariations = [
      { studentId: studentId, quizId: quizId },           // Original types
      { studentId: String(studentId), quizId: String(quizId) }, // Both as strings
      { studentId: parseInt(studentId), quizId: quizId },  // Student as number
      { studentId: studentId, quizId: parseInt(quizId) },  // Quiz as number (unlikely but possible)
      { studentId: parseInt(studentId), quizId: parseInt(quizId) } // Both as numbers
    ];

    for (const query of queryVariations) {
      try {
        const results = await resultModel.find(query).sort({ attemptNumber: -1 });
        if (results && results.length > 0) {
          console.log(`✅ Found ${results.length} results with query:`, query);
          allResults = results;
          break; // Use the first successful query
        }
      } catch (err) {
        console.warn(`⚠️ Query failed:`, query, err.message);
      }
    }
    
    if (!allResults || allResults.length === 0) {
      console.warn("⚠️ No results found with any query variation");
      
      // Let's also check what's actually in the database
      const sampleResults = await resultModel.find({}).limit(3);
      console.log("📊 Sample database entries:", sampleResults.map(r => ({
        studentId: r.studentId,
        studentIdType: typeof r.studentId,
        quizId: r.quizId,
        quizIdType: typeof r.quizId
      })));
      
      return [];
    }

    // Get quiz data
    const quiz = await quizModel.findById(quizId);
    if (!quiz) {
      console.error("❌ Quiz not found:", quizId);
      throw new Error("Quiz not found");
    }

    // Get questions
    const questions = await questionModel.find({ quiz: quizId });
    if (!questions || questions.length === 0) {
      console.warn("⚠️ No questions found for quiz:", quizId);
      return [];
    }

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const questionMap = Object.fromEntries(questions.map(q => [q._id.toString(), q]));

    const formatQuestion = (originalQuestion, studentAnswer) => {
      if (!originalQuestion || !studentAnswer) {
        console.warn("⚠️ Missing question or answer data");
        return null;
      }

      const formatted = {
        id: originalQuestion._id,
        title: originalQuestion.title,
        type: originalQuestion.type,
        question: originalQuestion.question,
        studentAnswer: studentAnswer.answer,
        isCorrect: studentAnswer.isCorrect,
        earnedPoints: studentAnswer.pointsEarned || 0,
        maxPoints: originalQuestion.points || 1,
        explanation: originalQuestion.explanation || null,
      };

      switch (originalQuestion.type) {
        case "multiple-choice":
          formatted.options = originalQuestion.choices || [];
          formatted.correctAnswer = typeof originalQuestion.correctAnswer === "number"
            ? originalQuestion.choices?.[originalQuestion.correctAnswer]
            : originalQuestion.correctAnswer;
          break;
        case "true-false":
          formatted.correctAnswer = originalQuestion.correctAnswer ? "True" : "False";
          formatted.studentAnswer = typeof studentAnswer.answer === 'boolean'
            ? (studentAnswer.answer ? "True" : "False")
            : studentAnswer.answer;
          break;
        case "fill-in-blank":
          formatted.correctAnswer = Array.isArray(originalQuestion.possibleAnswers)
            ? originalQuestion.possibleAnswers
            : [originalQuestion.possibleAnswers];
          formatted.possibleAnswers = originalQuestion.possibleAnswers;
          formatted.caseSensitive = originalQuestion.caseSensitive;
          break;
        case "short-answer":
          formatted.correctAnswer = originalQuestion.correctAnswer;
          break;
      }

      return formatted;
    };

    // Process each result
    const enrichedResults = allResults.map((result) => {
      if (!result.answers || !Array.isArray(result.answers)) {
        console.warn("⚠️ Result has no answers array:", result._id);
        return {
          score: result.score || 0,
          submittedDate: new Date(result.submittedAt).toLocaleDateString(),
          timeUsed: formatTime(result.timeSpent),
          attempt: result.attemptNumber || 1,
          questions: [],
          totalPoints,
        };
      }

      const enrichedQuestions = result.answers
        .map((studentAnswer) => {
          if (!studentAnswer.questionId) {
            console.warn("⚠️ Answer missing questionId:", studentAnswer);
            return null;
          }
          
          const originalQuestion = questionMap[studentAnswer.questionId.toString()];
          if (!originalQuestion) {
            console.warn("⚠️ Question not found for ID:", studentAnswer.questionId);
            return null;
          }
          
          return formatQuestion(originalQuestion, studentAnswer);
        })
        .filter(Boolean);

      return {
        score: result.score || 0,
        submittedDate: new Date(result.submittedAt).toLocaleDateString(),
        timeUsed: formatTime(result.timeSpent),
        attempt: result.attemptNumber || 1,
        questions: enrichedQuestions,
        totalPoints,
      };
    });

    console.log("✅ Returning enriched results:", enrichedResults.length);
    return enrichedResults;

  } catch (error) {
    console.error("❌ Error in findStudentQuizResults:", error);
    throw error;
  }
};

// Get all results for a quiz (for faculty)
export async function findAllQuizResults(quizId) {
  return await resultModel.find({ quizId }).populate('studentId').sort({ submittedAt: -1 });
}


// Get student's latest attempt
export async function findLatestStudentResult(studentId, quizId) {
  return await resultModel.findOne({ studentId, quizId }).sort({ attemptNumber: -1 });
}
