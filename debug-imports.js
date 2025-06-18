// debug-imports.js
console.log("🔍 Starting import debug...");

async function testImports() {
  try {
    console.log("1. Testing dotenv...");
    await import("dotenv/config");
    console.log("✅ dotenv OK");

    console.log("2. Testing express...");
    await import('express');
    console.log("✅ express OK");

    console.log("3. Testing cors...");
    await import("cors");
    console.log("✅ cors OK");

    console.log("4. Testing session...");
    await import('express-session');
    console.log("✅ session OK");

    console.log("5. Testing mongoose...");
    await import("mongoose");
    console.log("✅ mongoose OK");

    console.log("6. Testing UserRoutes...");
    try {
      await import("./Kambaz/Users/routes.js");
      console.log("✅ UserRoutes OK");
    } catch (e) {
      console.log("❌ UserRoutes FAILED:", e.message);
    }

    console.log("7. Testing CourseRoutes...");
    try {
      await import("./Kambaz/Courses/routes.js");
      console.log("✅ CourseRoutes OK");
    } catch (e) {
      console.log("❌ CourseRoutes FAILED:", e.message);
    }

    console.log("8. Testing ModuleRoutes...");
    try {
      await import("./Kambaz/Modules/routes.js");
      console.log("✅ ModuleRoutes OK");
    } catch (e) {
      console.log("❌ ModuleRoutes FAILED:", e.message);
    }

    console.log("9. Testing AssignmentRoutes...");
    try {
      await import("./Kambaz/Assignments/routes.js");
      console.log("✅ AssignmentRoutes OK");
    } catch (e) {
      console.log("❌ AssignmentRoutes FAILED:", e.message);
    }

    console.log("10. Testing EnrollmentsRoutes...");
    try {
      await import("./Kambaz/Enrollments/routes.js");
      console.log("✅ EnrollmentsRoutes OK");
    } catch (e) {
      console.log("❌ EnrollmentsRoutes FAILED:", e.message);
    }

    console.log("11. Testing QuestionRoutes...");
    try {
      await import("./Kambaz/Quizzes/Questions/routes.js");
      console.log("✅ QuestionRoutes OK");
    } catch (e) {
      console.log("❌ QuestionRoutes FAILED:", e.message);
    }

    console.log("🎉 Debug complete!");

  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

testImports();