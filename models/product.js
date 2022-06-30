const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    order: { type: mongoose.Types.ObjectId, required: false, ref: "Order" },
    shop: { type: mongoose.Types.ObjectId, required: false, ref: "Shop" },
});

module.exports = mongoose.model("Product", productSchema);
