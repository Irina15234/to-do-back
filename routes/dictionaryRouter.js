const express = require("express");

const dictionaryController = require("../controllers/dictionary");
const dictionaryRouter = express.Router();

dictionaryRouter.route(`/priority`).get(dictionaryController.getPriority);
dictionaryRouter.route(`/roles`).get(dictionaryController.getRoles);

module.exports = dictionaryRouter;