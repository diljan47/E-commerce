const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/userRoute");
const productsRoute = require("./routes/productsRoute");
const categoryRoute = require("./routes/categoryRoute");
const dbConnect = () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected ");
  } catch (error) {
    console.log("Database Error");
  }
};
dbConnect();
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRoute);
app.use("/api/products", productsRoute);
app.use("/api/category", categoryRoute);

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
