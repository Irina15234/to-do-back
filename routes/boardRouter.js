const express = require("express");

const boardController = require("../controllers/board");
const boardRouter = express.Router();

boardRouter.route(`/list`).get(boardController.getBoards);

boardRouter.route(`/:id`).get(boardController.getBoard);
boardRouter.route(`/new`).post(boardController.saveBoard);
boardRouter.route(`/:id`).delete(boardController.deleteBoard);
boardRouter.route(`/board`).put(boardController.renameBoard);

boardRouter.route(`/column/add`).put(boardController.addColumn);
boardRouter.route(`/column/del`).delete(boardController.deleteColumn);
boardRouter.route(`/column`).put(boardController.renameColumn);

boardRouter.route(`/users/:id`).get(boardController.getBoardsUsers);
boardRouter.route(`/columns/:id`).get(boardController.getBoardColumns);

module.exports = boardRouter;