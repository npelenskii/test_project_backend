const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, minlength: 6 },
    address: { type: String, reqired: true, minlength: 6 },
    price: { type: Number, reqired: true },
    products: [
        { type: mongoose.Types.ObjectId, required: true, ref: "Product" },
    ],
});

module.exports = mongoose.model("Order", orderSchema);
