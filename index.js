import "dotenv/config";
console.log("🧪 If you see this, import is OK.");
import express from 'express';
import cors from "cors";
import session from 'express-session';
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentsRoutes from "./Kambaz/Enrollments/routes.js";
import QuestionRoutes from "./Kambaz/Quizzes/Questions/routes.js";
import mongoose from "mongoose";

console.log("🚀 Starting server...");
console.log("📊 Environment:", process.env.NODE_ENV);
console.log("🔗 MongoDB:", process.env.MONGO_CONNECTION_STRING);


const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";

try {
  console.time("⏱️ MongoDB connection time");
  await mongoose.connect(CONNECTION_STRING);
  console.log("✅ MongoDB connected successfully");
  console.timeEnd("⏱️ MongoDB connection time");
} catch (error) {
  console.error("❌ MongoDB connection failed:", error);
}
//mongoose.connect(CONNECTION_STRING);

const app = express();
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://spectacular-faloodeh-27b361.netlify.app"] 
  })
 );
 
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax",
    secure: false
  }
};
if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
}
app.use(session(sessionOptions));
//console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
app.use(express.json());

console.log("📝 Setting up routes...");
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentsRoutes(app);
QuestionRoutes(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Access your API at: http://localhost:${PORT}`);
});

// app.listen(process.env.PORT || 4000);