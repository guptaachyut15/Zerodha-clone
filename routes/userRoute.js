const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/balance", userController.balance);

module.exports = router;
