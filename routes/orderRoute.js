const express = require("express");
const orderController = require("../controllers/orderController");

router = express.Router();

router.get("/book", orderController.getOrderBook);
router.post("/limit", orderController.limitOrder);

module.exports = router;
