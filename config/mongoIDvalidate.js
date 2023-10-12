const mongoose = require("mongoose");

const validId = async (_id, res) => {
  const isValid = await mongoose.Types.ObjectId.isValid(_id);
  if (!isValid) {
    return res.status(400).send("Invalid MongoDB Id");
  }
};

module.exports = validId;
