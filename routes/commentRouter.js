const express = require("express");
const commentController = require("../controllers/comment");
const commentRouter = express.Router();

commentRouter.route(`/:taskId`).get(commentController.getComments);
commentRouter.route(`/new`).post(commentController.saveComment);
commentRouter.route(`/update/:id`).put(commentController.updateComment);
commentRouter.route(`/:id`).delete(commentController.deleteComment);

module.exports = commentRouter;