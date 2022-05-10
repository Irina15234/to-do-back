const express = require("express");
const boardController = require("../controllers/board");
const boardRouter = express.Router();

boardRouter.use("/api/boards", boardController.getBoards);

module.exports = boardRouter;