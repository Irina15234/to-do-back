const express = require("express");
const taskController = require("../controllers/task");
const taskRouter = express.Router();

taskRouter.route(`/list`).get(taskController.getTasks);

taskRouter.route(`/:id`).get(taskController.getTask);
taskRouter.route(`/new`).post(taskController.saveTask);
//taskRouter.route(`/:id`).put(taskController.updateTask);
taskRouter.route(`/:id`).delete(taskController.deleteTask);

taskRouter.route(`/columns`).put(taskController.changeColumns);

module.exports = taskRouter;