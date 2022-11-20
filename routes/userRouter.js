const express = require("express");
const userController = require("../controllers/user");
const userRouter = express.Router();

userRouter.route("").post(userController.createUser);
userRouter.route("").get(userController.getUser);
userRouter.route("").put(userController.updateUser);
userRouter.route("/photo").put(userController.updateUserPhoto);
userRouter.route("/parameters").put(userController.updateUserParameters);

module.exports = userRouter;