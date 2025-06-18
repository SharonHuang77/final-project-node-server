import * as questionsDao from "./dao.js";

export default function QuestionRoutes(app) {
  // Get all questions for a specific quiz
  app.get("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const { quizId } = req.params;
      const questions = await questionsDao.findQuestionsForQuiz(quizId);
      res.json(questions);
    } catch (error) {
      console.error("Error getting questions for quiz:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new question for a quiz
  app.post("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser || currentUser.role !== "FACULTY") {
        return res.status(403).json({ error: "Access denied. Faculty only." });
      }

      const { quizId } = req.params;
      const questionData = { ...req.body, quiz: quizId };
      const question = await questionsDao.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get a specific question by ID
  app.get("/api/questions/:questionId", async (req, res) => {
    try {
      const { questionId } = req.params;
      const question = await questionsDao.findQuestionById(questionId);
      if (!question) return res.status(404).json({ error: "Question not found" });
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update a question
  app.put("/api/questions/:questionId", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser || currentUser.role !== "FACULTY") {
        return res.status(403).json({ error: "Access denied. Faculty only." });
      }

      const { questionId } = req.params;
      const question = await questionsDao.updateQuestion(questionId, req.body);
      if (!question) return res.status(404).json({ error: "Question not found" });
      res.json(question);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a question
  app.delete("/api/questions/:questionId", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser || currentUser.role !== "FACULTY") {
        return res.status(403).json({ error: "Access denied. Faculty only." });
      }

      const { questionId } = req.params;
      const question = await questionsDao.deleteQuestion(questionId);
      if (!question) return res.status(404).json({ error: "Question not found" });
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete all questions for a quiz
  app.delete("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser || currentUser.role !== "FACULTY") {
        return res.status(403).json({ error: "Access denied. Faculty only." });
      }

      const { quizId } = req.params;
      await questionsDao.deleteQuestionsForQuiz(quizId);
      res.json({ message: "All questions deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get question count for a quiz
  app.get("/api/quizzes/:quizId/questions/count", async (req, res) => {
    try {
      const { quizId } = req.params;
      const count = await questionsDao.countQuestionsForQuiz(quizId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get total points for a quiz
  app.get("/api/quizzes/:quizId/questions/points", async (req, res) => {
    try {
      const { quizId } = req.params;
      const result = await questionsDao.getTotalPointsForQuiz(quizId);
      const totalPoints = result.length > 0 ? result[0].totalPoints : 0;
      res.json({ totalPoints });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}