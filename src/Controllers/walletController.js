const { Wallet, walletValid } = require("../models/wallet");
const walletHistory = require("../models/walletHistory");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
  async update(req, res) {
    // const { error } = walletValid.validate({
    //   ...req.body,
    //   userId: req.userId,
    // });
    // if (error) return res.json({ message: error.message });
    // const stripeToken = req.body;
    try {
      const { product, token } = req.body
      const idempontencyKey = uuidv4();
      const getWalletAmount = await Wallet.findOne({ userId: req.userId });
      const camount = Number(product.price) + Number(getWalletAmount.amount);
      console.log(token, "token", req.body);
      stripe.customers.create({
        email: token.email,
        source: token.id,
      }).then(customer => {
        console.log(customer, "customer");
        stripe.charges.create({
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `Purchased the ${product.name}`,
        }).then(async charge => {
          console.log(charge, "charge",);
          if (charge.status !== "succeeded") return res.json({ message: "Payment was not successful" });
          await Wallet.findOneAndUpdate(
            { userId: req.userId },
            { amount: camount },
            { new: true }
          )
          const walletHistoryData = new walletHistory({
            userId: req.userId,
            amountHistor: Number(product.price),
            payType: "stripe",
            description: `${Number(product.price)} Added in your wallet `,
          })
          await walletHistoryData.save();

          res.json({ message: "Payment Successfully", charge })
        }).catch(err => {
          console.log(err, "err");
        })
      })
        .then(async result => {

        })
        .catch(err => res.json({ message: "Error while purchasing the product", err }))


    } catch (err) {
      res.send(err.message);
    }
  },
  async getData(req, res) {
    try {
      const getdata = await Wallet.find({ userId: req.userId });
      return res.json(getdata);
    } catch (err) {
      res.status(202).send(err.message);
    }
  },
};
