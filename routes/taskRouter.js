const express = require("express");
const taskController = require("../controllers/task");
const taskRouter = express.Router();

taskRouter.use("/tasks", taskController.getTasks);
taskRouter.use("/task/get/:id", taskController.getTask);
taskRouter.use("/task/columns", taskController.changeColumns);
taskRouter.use("/task/new", taskController.saveTask);

module.exports = taskRouter;