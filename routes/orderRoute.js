const express = require("express")
const orderController = require("../controllers/orderController")

router = express.Router()

// exports.router.get("/book",)
router.post("/limit",orderController.limitOrder)

module.exports=router