// minimal-server.js
console.log("🚀 Starting minimal server...");

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173"]
}));

app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'Minimal server works!', timestamp: new Date() });
});

app.get('/api/users/profile', (req, res) => {
  res.json({ 
    _id: 'test-user',
    username: 'testuser',
    role: 'FACULTY',
    firstName: 'Test',
    lastName: 'User'
  });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`✅ Minimal server running on http://localhost:${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}`);
  console.log(`👤 Profile: http://localhost:${PORT}/api/users/profile`);
})