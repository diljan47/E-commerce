const mongoose = require("mongoose");
const productModelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    gender: {
      type: String,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brands",
    },

    quantity: {
      type: Number,
      required: true,
    },

    images: [
      {
        imageURL: String,
        public_id: String,
      },
    ],
    color: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
      },
    ],
    tags: String,
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productModelSchema);
