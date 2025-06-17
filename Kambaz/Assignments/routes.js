import * as assignmentsDao from "./dao.js";

export default function AssignmentRoutes(app) {
  
  app.get("/api/assignments", async (req, res) => {
    const assignments = await assignmentsDao.findAllAssignments();
    res.json(assignments);
  });

  app.get("/api/courses/:cid/assignments", async (req, res) => {
    const { cid } = req.params;
    const assignments = await assignmentsDao.findAssignmentsForCourse(cid);
    res.json(assignments);
  });

  app.post("/api/courses/:cid/assignments", async (req, res) => {
    const { cid } = req.params;
    const assignmentData = {
      ...req.body,
      course: cid,
    };
    const newAssignment = await assignmentsDao.createAssignment(assignmentData);
    res.json(newAssignment);
  });

  app.put("/api/assignments/:aid", async (req, res) => {
    const { aid } = req.params;
    const assignmentUpdates = req.body;
    const updatedAssignment = await assignmentsDao.updateAssignment(aid, assignmentUpdates);
    
    if (updatedAssignment) {
      res.json(updatedAssignment);
    } else {
      res.status(404).json({ message: "Assignment not found" });
    }
  });


  app.delete("/api/assignments/:aid", async (req, res) => {
    const { aid } = req.params;
    const result = await assignmentsDao.deleteAssignment(aid);
    if (result) {
      res.json({ message: "Assignment deleted successfully" });
    } else {
      res.status(404).json({ message: "Assignment not found" });
    }
  });
  
}