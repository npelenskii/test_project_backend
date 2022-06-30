const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Product = require("../models/product");
const Order = require("../models/order");
const Shop = require("../models/shop");

const getProducts = async (req, res, next) => {
    let products;
    try {
        products = await Product.find({}, "-order");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not find a products.",
            500
        );
        return next(error);
    }
    let shops;
    try {
        shops = await Shop.find({}).populate("products");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not find a shops.",
            500
        );
        return next(error);
    }

    if (!products) {
        const error = new HttpError(
            "Could not find products for the provided id.",
            404
        );
        return next(error);
    }

    if (!shops) {
        const error = new HttpError(
            "Could not find shops for the provided id.",
            404
        );
        return next(error);
    }

    res.json({
        shops: shops.map((shop) => shop.toObject({ getters: true })),
        products: products.map((product) =>
            product.toObject({ getters: true })
        ),
    });
};

const getShops = async (req, res, next) => {
    let shops;
    try {
        shops = await Shop.find({}).populate("products");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not find a shops.",
            500
        );
        return next(error);
    }

    if (!shops) {
        const error = new HttpError(
            "Could not find shops for the provided id.",
            404
        );
        return next(error);
    }

    res.json({
        shops: shops.map((shop) => shop.toObject({ getters: true })),
    });
};

const getProductByShop = async (req, res, next) => {
    const shop = req.params.sid;

    let productsShop;
    try {
        productsShop = await Shop.findOne({ name: shop }).populate("products");
    } catch (err) {
        const error = new HttpError(
            "Fetching products failed, please try again later.",
            500
        );
        return next(error);
    }

    if (!productsShop || productsShop.length === 0) {
        return next(
            new HttpError(
                "Could not find places for the provided user id.",
                404
            )
        );
    }

    res.json({
        shop: productsShop.toObject({ getters: true }),
    });
};

const createProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    const { name, shop, price } = req.body;

    const createdProduct = new Product({
        name,
        shop,
        price,
        image: "",
    });

    let shopToAdd;
    try {
        shopToAdd = await Shop.findById(shop);
    } catch (err) {
        const error = new HttpError(
            "Creating product failed, please try again.",
            500
        );
        return next(error);
    }

    if (!shopToAdd) {
        const error = new HttpError(
            "Could not find shop for provided id.",
            404
        );
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdProduct.save({ session: sess });
        shopToAdd.products.push(createdProduct);
        await shopToAdd.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            "Creating product failed, please try1 again.",
            500
        );
        return next(error);
    }

    res.status(201).json({ product: createdProduct });
};

const createShop = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    const { name } = req.body;

    const createdShop = new Shop({
        name,
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdShop.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            "Creating product failed, please try again.",
            500
        );
        return next(error);
    }

    res.status(201).json({ shop: createdShop });
};

const deleteProduct = async (req, res, next) => {
    const productId = req.params.pid;

    let product;
    try {
        product = await Product.findById(productId);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not delete product.",
            500
        );
        return next(error);
    }

    if (!product) {
        const error = new HttpError("Could not find product for this id.", 404);
        return next(error);
    }

    const imagePath = product.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await product.remove({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not delete product.",
            500
        );
        return next(error);
    }

    fs.unlink(imagePath, (err) => {
        console.log(err);
    });

    res.status(200).json({ message: "Deleted product." });
};

exports.getProducts = getProducts;
exports.getShops = getShops;
exports.getProductByShop = getProductByShop;
exports.createProduct = createProduct;
exports.createShop = createShop;
exports.deleteProduct = deleteProduct;
