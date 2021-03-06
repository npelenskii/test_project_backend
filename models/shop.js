const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const shopSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: { type: Object, required: true },
    products: [
        { type: mongoose.Types.ObjectId, required: false, ref: "Product" },
    ],
});

module.exports = mongoose.model("Shop", shopSchema);
