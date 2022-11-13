const express = require("express");
const userController = require("../controllers/user");
const userRouter = express.Router();

userRouter.route("/user").get(userController.getUser);
userRouter.route("/user").put(userController.updateUser);
userRouter.route("/user/photo").put(userController.updateUserPhoto);
userRouter.route("/user/parameters").put(userController.updateUserParameters);


module.exports = userRouter;