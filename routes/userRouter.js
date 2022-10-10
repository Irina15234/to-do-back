const express = require("express");
const userController = require("../controllers/user");
const userRouter = express.Router();

userRouter.route("/user").get(userController.getUser);
userRouter.route("/user").put(userController.updateUser);


module.exports = userRouter;