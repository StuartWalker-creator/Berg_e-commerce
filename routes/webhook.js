const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers["verif-hash"];

  if (!signature || signature !== secretHash) {
    return res.status(401).send("Unauthorized");
  }

  const data = req.body.data;

  if (req.body.status === "successful") {
    await Order.findOneAndUpdate(
      { tx_ref: data.tx_ref },
      { paymentStatus: "paid" }
    );
  }

  res.status(200).send("OK");
});

module.exports = router;
