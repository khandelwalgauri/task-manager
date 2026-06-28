const express = require('express');
const router = express.Router();

const {
  createBoard,
  getBoards,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBoards).post(protect, createBoard);

router.put('/:id', protect, updateBoard);
router.delete('/:id', protect, deleteBoard);

module.exports = router;
