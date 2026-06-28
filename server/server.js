const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const boardRoutes = require('./routes/boardRoutes');

const { protect } = require('./middleware/authMiddleware');

dotenv.config();
connectDB();

const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);

// Home Route
app.get('/', (req, res) => {
  res.send('TaskFlow API Running...');
});

// Protected Profile Route
app.get('/api/profile', protect, (req, res) => {
  res.json(req.user);
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const aiRoutes = require('./routes/aiRoutes');

app.use('/api/ai', aiRoutes);