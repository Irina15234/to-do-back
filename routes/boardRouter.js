const express = require("express");

const boardController = require("../controllers/board");
const boardRouter = express.Router();

boardRouter.route(`/list`).get(boardController.getBoards);
boardRouter.route(`/:id`).get(boardController.getBoard);
boardRouter.route(`/new`).post(boardController.saveBoard);
boardRouter.route(`/:id`).put(boardController.updateBoard);
boardRouter.route(`/:id`).delete(boardController.deleteBoard);

module.exports = boardRouter;