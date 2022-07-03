const express = require("express");
const taskController = require("../controllers/task");
const taskRouter = express.Router();

taskRouter.use("/tasks", taskController.getTasks);
taskRouter.use("/task/:id", taskController.getTask);

module.exports = taskRouter;