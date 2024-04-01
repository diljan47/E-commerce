const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

const checkOut = async (req, res) => {
  const { totalAmount } = req.body;
  try {
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: "",
    };

    const order = await instance.orders.create(options);

    res.status(200).json({ order, sucess: true });
    if (!order) return res.status(500).send("Some error occured");
  } catch (error) {
    console.error("Razorpay Error:", error);
  }
};

const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId } = req.body;
  try {
    res.status(200).json({ razorpayOrderId, razorpayPaymentId });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  checkOut,
  verifyPayment,
};
