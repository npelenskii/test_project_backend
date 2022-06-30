const express = require("express");
const { check } = require("express-validator");

const productControllers = require("../controllers/product-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", productControllers.getProducts);
router.get("/shop", productControllers.getShops);
router.post(
    "/shop",
    [check("name").not().isEmpty()],
    productControllers.createShop
);
router.get("/:sid", productControllers.getProductByShop);

router.post(
    "/",
    fileUpload.single("image"),
    [
        check("name").not().isEmpty(),
        check("shop").isLength({ min: 2 }),
        check("price").not().isEmpty(),
    ],
    productControllers.createProduct
);

router.delete("/:pid", productControllers.deleteProduct);

module.exports = router;
