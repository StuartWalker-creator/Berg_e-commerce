const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const sendEmail = require('../utils/sendEmail.js')

router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  const body = req.body;

  console.log("Airtel webhook received:", body);

  const { reference, transaction_id, status } = body;

  try {
    const order = await Order.findOne({tx_ref: reference });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status === "success") {
      order.paymentStatus = "paid";
      order.isValid = true
      await order.save();

      await sendEmail(order)
    }

    res.status(200).json({ message: "Webhook handled successfully" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
