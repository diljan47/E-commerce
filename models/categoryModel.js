const monogoose = require("mongoose");

const categorySchema = new monogoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = monogoose.model("Category", categorySchema);
