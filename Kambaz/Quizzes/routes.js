import * as dao from "./dao.js";
import quizModel from "./model.js";
import questionModel from "./Questions/model.js"
import resultModel from "./resultModel.js";

export default function QuizRoutes(app) {
  app.get("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
    const { courseId } = req.params;
    console.log("Fetching quizzes for course:", courseId);
    const quizzes = await dao.findQuizzesForCourse(courseId);
    console.log("Found quizzes:", quizzes);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/quizzes/:quizId", async (req, res) => {
    try {
      const { quizId } = req.params;
      const quiz = await dao.findQuizById(quizId);
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: "Quiz not found" });
      } else {
        res.status(500).json({ error: "Failed to fetch quiz" });
      }
    }  
  });

  app.post("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const { courseId } = req.params;
      console.log("Creating quiz with data:", req.body);
      const quiz = { ...req.body, course: courseId };
      const newQuiz = await dao.createQuiz(quiz);
      res.json(newQuiz);
    } catch (e) {
      console.error("Create quiz error", e);
      res.status(500).send(e.toString());
    }
  });

  app.put("/api/quizzes/:quizId", async (req, res) => {
    const { quizId } = req.params;
    res.json(await dao.updateQuiz(quizId, req.body));
  });

  app.delete("/api/quizzes/:quizId", async (req, res) => {
    const { quizId } = req.params;
    res.json(await dao.deleteQuiz(quizId));
  });

  app.post("/api/quizzes/:quizId/results", async (req, res) => {
    try {
    const { quizId } = req.params;
    const { 
      studentId, 
      courseId,
      answers, 
      score, 
      totalPoints, 
      timeSpent, 
      startedAt,
      submittedAt
      } = req.body;

   console.log("Received quiz submission:", {
        quizId,
        studentId,
        courseId,
        score,
        totalPoints,
        answersCount: answers?.length
      });

      // Validate required fields
      if (!studentId) {
        return res.status(400).json({ error: "studentId is required" });
      }
      
      if (!courseId) {
        return res.status(400).json({ error: "courseId is required" });
      }
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "answers array is required" });
      }
      if (score === undefined || score === null) {
        return res.status(400).json({ error: "score is required" });
      }
      if (!totalPoints || totalPoints === 0) {
        return res.status(400).json({ error: "totalPoints must be greater than 0" });
      }

      //Store the result
      const result = await dao.storeQuizResult({
        studentId,
        quizId,
        courseId,
        answers,
        score,
        totalPoints,
        timeSpent: timeSpent || 0,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        submittedAt: submittedAt ? new Date(submittedAt) : new Date()
      });
      console.log("Quiz result stored successfully:", result._id);
      res.json(result);
    } catch (error) {
      console.error("Error saving quiz result:", error);
      
      // Send appropriate error response based on error type
      if (error.message.includes("Maximum attempts")) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes("required")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to save quiz result" });
      }
    }
  });

app.get("/api/quizzes/:quizId/results/:studentId", async (req, res) => {
  const { quizId, studentId } = req.params;
  console.log("Fetching results for student:", studentId, "in quiz:", quizId);

  try {
    // Validate input parameters
    if (!quizId || !studentId) {
      return res.status(400).json({ error: "Quiz ID and Student ID are required" });
    }

    // Get quiz data
    const quiz = await quizModel.findOne({ _id: quizId });
    if (!quiz) {
      console.error("Quiz not found:", quizId);
      return res.status(404).json({ error: "Quiz not found" });
    }
    console.log("Found quiz:", quiz.title);

    // Get questions for the quiz
    const questions = await questionModel.find({ quiz: quizId });
    if (!questions || questions.length === 0) {
      console.warn("No questions found for quiz:", quizId);
      return res.status(404).json({ error: "No questions found for this quiz" });
    }
    console.log("Found questions:", questions.length);

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Get student results
    const results = await dao.findStudentQuizResults(studentId, quizId);
    
    if (!results || results.length === 0) {
      console.warn("No results found for student:", studentId);
      return res.status(404).json({ error: "No quiz attempts found for this student" });
    }

    console.log("Found results:", results.length);

    // Build response
    const response = {
      title: quiz.title,
      dueDate: quiz.dueDate || "No due date set",
      points: totalPoints,
      totalQuestions: questions.length,
      availablePeriod: quiz.availableFromDate && quiz.availableUntilDate 
        ? `${new Date(quiz.availableFromDate).toDateString()} - ${new Date(quiz.availableUntilDate).toDateString()}`
        : "Always available",
      timeLimit: quiz.timeLimit ? `${quiz.timeLimitMinutes || 30} minutes` : "Unlimited",
      instructions: {
        title: "Before You Begin",
        guidelines: [
          "You must complete the quiz in one sitting.",
          "Once started, the timer cannot be paused.",
        ],
      },
      lockDate: quiz.availableUntilDate 
        ? new Date(quiz.availableUntilDate).toDateString()
        : "No lock date",
      multipleAttempts: quiz.multipleAttempts || false,
      maxAttempts: quiz.howManyAttempts || 1,
      currentAttempt: results[0],       // most recent
      attemptHistory: results,          // full history
    };

    res.json(response);

  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).json({ 
      error: "Failed to fetch results", 
      details: error.message 
    });
  }
});

app.get("/api/quizzes/:quizId/results", async (req, res) => {
  try {
      const { quizId } = req.params;
      const results = await dao.findAllQuizResults(quizId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching all results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });
}