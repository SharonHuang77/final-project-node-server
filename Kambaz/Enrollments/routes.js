import * as enrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app) {
  
  app.get("/api/enrollments", async (req, res) => {
    const enrollments = await enrollmentsDao.findAllEnrollments();
    res.json(enrollments);
  });

  app.get("/api/users/:userId/enrollments", async (req, res) => {
    res.json(await enrollmentsDao.findCoursesForUser(req.params.userId));
  });

  const findEnrollmentsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const enrollments = await enrollmentsDao.findUsersForCourse(courseId);
    res.json(enrollments);
  }
  app.get("/api/courses/:courseId/enrollments", findEnrollmentsForCourse);


  app.post("/api/users/:uid/courses/:cid", async (req, res) => {
    try {
      const { uid, cid } = req.params;
      const result = await enrollmentsDao.enrollUserInCourse(uid, cid);
      res.status(200).json(result);
    } catch (err) {
      console.error("💥 ENROLL FAIL:", err);
      res.status(500).json({ error: "Enroll failed" });
    }
  });

  // const enrollUserInCourse = async (req, res) => {
  //   let { uid, cid } = req.params;
  //   if (uid === "current") {
  //     const currentUser = req.session["currentUser"];
  //     uid = currentUser._id;
  //   }
  //   const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
  //   res.send(status);
  // };
  // app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);


  // app.post("/api/users/:userId/enrollments/:courseId", async (req, res) => {
  //   const { userId, courseId } = req.params;
    
  //   // Check if already enrolled
  //   const existingEnrollment = await enrollmentsDao.findEnrollment(userId, courseId);
  //   if (existingEnrollment) {
  //     // Return success instead of error if already enrolled
  //     return res.status(200).json({ 
  //       message: "Already enrolled", 
  //       enrollment: existingEnrollment 
  //     });
  //   }
    
  //   // Enroll user
  //   const newEnrollment = await enrollmentsDao.enrollUserInCourse(userId, courseId);
  //   res.status(201).json({ 
  //     message: "Enrolled successfully", 
  //     enrollment: newEnrollment 
  //   });
  // });

  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.send(status);
  };
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
  
  // app.delete("/api/users/:userId/enrollments/:courseId", async (req, res) => {
  //   const { userId, courseId } = req.params;
  //   await enrollmentsDao.unenrollUserFromCourse(userId, courseId);
  //   res.sendStatus(200);
  // });
}