const Board = require('../models/Board');

// Create Board
const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: 'Title is required',
      });
    }

    const board = await Board.create({
      title,
      description,
      owner: req.user._id,
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Boards
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      owner: req.user._id,
    });

    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Board
const updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        message: 'Board not found',
      });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: 'Not authorized',
      });
    }

    board.title = req.body.title || board.title;
    board.description = req.body.description || board.description;

    const updatedBoard = await board.save();

    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Board
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        message: 'Board not found',
      });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: 'Not authorized',
      });
    }

    await board.deleteOne();

    res.status(200).json({
      message: 'Board deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBoard,
  getBoards,
  updateBoard,
  deleteBoard,
};
