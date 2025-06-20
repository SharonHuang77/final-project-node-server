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
//s Submit quiz result
  app.post("/api/quizzes/:quizId/results", async (req, res) => {
    try {
    const { quizId } = req.params;
    const { studentId, 
      courseId, //add
      answers, 
      score, 
      totalPoints, 
      timeSpent, 
      startedAt,
    submittedAt //add
   } = req.body;
   //add
   console.log("Received quiz submission:", {
        quizId,
        studentId,
        courseId,
        score,
        totalPoints,
        answersCount: answers?.length
      });//

      // add: Validate required fields
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
      } //

      //add:  Store the result
      const result = await dao.storeQuizResult({
        studentId,
        quizId,
        courseId, // Use the courseId from request body
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

    
    // Get quiz details for total points
    // const quiz = await dao.findQuizById(quizId);
    
    // const result = await dao.storeQuizResult({
    //   studentId,
    //   quizId,
    //   courseId: quiz.course,
    //   answers,
    //   score,
    //   totalPoints: totalPoints || quiz.points,
    //   timeSpent: req.body.timeSpent || 0,
    //   startedAt: startedAt || new Date()
    // });
//     res.json(result);
//   } catch (error) {
//     console.error("Error saving quiz result:", error);
//     res.status(500).json({ error: "Failed to save quiz result" });
//   }
// }); 

  app.get("/api/quizzes/:quizId/results/:studentId", async (req, res) => {
   try {
      const { quizId, studentId } = req.params;
      const results = await dao.findStudentQuizResults(studentId, quizId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching student results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
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