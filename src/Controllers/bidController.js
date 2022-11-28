const { bid, bidValid } = require("../models/user");

module.exports = {
  async create(req, res) {
    const { error } = bidValid.validate(req.body);
    if (error) return res.json(error.message);

    const data = bid(req.body);
    try {
      await data.save();
      res.json(data);
    } catch (err) {
      res.json(err.message);
    }
  },
};
