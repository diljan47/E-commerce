const mongoose = require("mongoose");

const orderScheme = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
        count: Number,
        color: String,
      },
    ],
    paymentMethod: {},
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Order Creation",
        "Not Processed",
        "Cash on Delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered",
      ],
    },
    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderScheme);
