const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRoute = require("./routes/userRoute");
const productsRoute = require("./routes/productsRoute");
const categoryRoute = require("./routes/categoryRoute");
const colorRoute = require("./routes/colorRoute");
const brandRoute = require("./routes/brandRoute");
const bodyParser = require("body-parser");
const morgan = require("morgan");
app.use(morgan("dev"));

const dbConnect = () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected ");
  } catch (error) {
    console.log("Database Error");
  }
};

const corsOptions = {
  origin: [process.env.BASE_URL],
  credentials: true,
};
dbConnect();
app.use(cookieParser());
// app.use(cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use("/api/user", userRoute);
app.use("/api/products", productsRoute);
app.use("/api/category", categoryRoute);
app.use("/api/color", colorRoute);
app.use("/api/brand", brandRoute);

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
