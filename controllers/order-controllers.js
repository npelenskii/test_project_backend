const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Product = require("../models/product");
const Order = require("../models/order");
const getCoordsForAddress = require("../util/location");

//coordinates
let coordinates;
try {
    //coordinates = await getCoordsForAddress(address);
} catch (error) {
    return next(error);
}

const getOrderByEmailOrNumber = async (req, res, next) => {
    const { email, phone } = req.body;
    let orders;

    if (!email && !phone) {
        const error = new HttpError(
            "Enter some data to search for your orders.",
            500
        );
        return next(error);
    }
    try {
        orders = await Order.find()
            .or([{ email: email }, { phone: phone }])
            .populate("products");
    } catch (err) {
        const error = new HttpError(
            "Fetching users failed, please try again later.",
            500
        );
        return next(error);
    }
    res.json({
        orders: orders.map((order) => order.toObject({ getters: true })),
    });
};

const createOrder = async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Creating order failed, please try again later.", 422)
        );
    }

    const { name, email, phone, address, products } = req.body;

    let price = 0;

    try {
        for (let product in products) {
            const productToCount = await Product.findById(products[product]);
            price += productToCount.price;
        }
    } catch (err) {
        const error = new HttpError(
            "Creating order failed, please try again 1later.",
            500
        );
        return next(error);
    }

    const createdOrder = new Order({
        name,
        email,
        phone,
        address,
        products: products,
        price: price,
    });

    try {
        await createdOrder.save();
        await createdOrder.populate("products");
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            "Creating order failed, please try again 1later.",
            500
        );
        return next(error);
    }

    res.status(201).json({ order: createdOrder.toObject({ getters: true }) });
};

exports.getOrderByEmailOrNumber = getOrderByEmailOrNumber;
exports.createOrder = createOrder;
