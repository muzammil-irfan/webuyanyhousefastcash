const {
  leadsBundleItem,
  leadsBundleItemValid,
} = require("../models/leadsBundleItem");
const leads = require("../models/leads");

module.exports = {
  async create(req, res) {
    req.body.userId = req.user._id;

    const { error } = leadsBundleItemValid.validate(req.body);
    if (error) return res.status(204).json(error.message);

    // const data = leadsBundleItem(req.body);
    const data = leadsBundleItem({
      zipid: req.body.zipcode,
      leadsId: req.body.leadsId,
      amount: req.body.amount,
      isActive: req.body.isActive,
    });
    try {
      await data.save();
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json(err.message);
    }
  },
};
