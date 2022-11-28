const mongoose = require("mongoose");
const walletHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amountHistor: {
      type: Number,
      required: true,
    },
    payType: {
      type: String,
      required: true,
      enum: ["wallet", "stripe"]
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const walletHistory = mongoose.model("walletHistory", walletHistorySchema);
module.exports = walletHistory;
