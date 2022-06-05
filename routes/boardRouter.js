const express = require("express");
const urlencodedParser = express.urlencoded({extended: false});

const boardController = require("../controllers/board");
const boardRouter = express.Router();

boardRouter.use("/boards", boardController.getBoards);
boardRouter.use("/board/new", urlencodedParser, boardController.saveBoard);
boardRouter.use("/board/:id", boardController.getBoard);

module.exports = boardRouter;