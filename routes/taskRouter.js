const express = require("express");
const taskController = require("../controllers/task");
const taskRouter = express.Router();

taskRouter.use("/tasks", taskController.getTasks);

module.exports = taskRouter;