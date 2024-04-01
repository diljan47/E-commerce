const mongoose = require("mongoose");

const validId = async (_id, res) => {
  const isValid = await mongoose.Types.ObjectId.isValid(_id);
  if (!isValid) {
    console.log("mongo Invalid");
    return res.status(401).send("Invalid MongoDB Id");
  }
};

module.exports = validId;
