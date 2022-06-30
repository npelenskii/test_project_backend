const express = require("express");
const { check } = require("express-validator");

const orderController = require("../controllers/order-controllers");

const router = express.Router();

router.post("/history", orderController.getOrderByEmailOrNumber);

router.post(
    "/create",
    [
        check("name").not().isEmpty(),
        check("email").normalizeEmail().isEmail(),
        check("phone").isMobilePhone(),
        check("address").not().isEmpty(),
    ],
    orderController.createOrder
);

module.exports = router;
