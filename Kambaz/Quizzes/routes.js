import * as dao from "./dao.js";

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
      console.error("Create quiz error ▶", e);
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
      const { studentId, answers, score } = req.body;
      await dao.storeStudentAnswer(studentId, quizId, answers, score);
      res.json({ success: true });
    } catch (e) {
      console.error("Store result error ▶", e);
      res.status(500).send(e.toString());
    }
  });

  app.get("/api/quizzes/:quizId/results/:studentId", async (req, res) => {
    const { quizId, studentId } = req.params;
    const result = await dao.findStudentResult(studentId, quizId);
    if (!result) {
      res.status(404).json({ error: "Result not found" });
    } else {
      res.json(result);
    }
  });
}