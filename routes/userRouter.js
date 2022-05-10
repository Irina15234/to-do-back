const express = require("express");
const userController = require("../controllers/test");
const userRouter = express.Router();

userRouter.use("/api/users", userController.getUsers);

module.exports = userRouter;