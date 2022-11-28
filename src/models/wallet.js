const mongoose = require("mongoose");
const Joi = require("joi");

const walletSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    paymentStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const walletValid = Joi.object({
  amount: Joi.number().required(),
  userId: Joi.object().id().required(),
});

const Wallet = mongoose.model("wallet", walletSchema);
module.exports = { Wallet, walletValid };
