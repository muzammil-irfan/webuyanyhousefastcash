const walletHistory = require("../models/walletHistory");
module.exports = {
  async walletHistory(req, res) {
    try {
      const walletdata = await walletHistory.find({ userId: req.userId });
      res.json(walletdata);
    } catch (err) {
      res.json({ message: err.message });
    }
  },

  async allWalletHistory(req, res) {
    if (req.userType !== "admin")
      return res.status(404).json({ message: "you can't access this page." });

    try {
      const walletdata = await walletHistory.find({}).populate("userId");
      res.json(walletdata);
    } catch (err) {
      res.json({ message: err.message });
    }
  },
};
