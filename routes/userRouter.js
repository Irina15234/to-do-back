const express = require("express");
const userController = require("../controllers/user");
const userRouter = express.Router();

userRouter.use("/user", userController.getUser);

module.exports = userRouter;