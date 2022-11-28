const { fileDispute, fileDisputevalid } = require("../models/fileDispute");

module.exports = {
  async create(req, res) {
    const { error } = fileDisputevalid.validate(req.body);
    if (error) return res.status(422).json(error.message);

    const data = new fileDispute(req.body);
    try {
      await data.save();
      return res.json(data);
    } catch (err) {
      res.send(err.message);
    }
  },

  // async update(req, res) {
  //   const { error } = fileDisputevalidSchema.validate(req.body);
  //   if (error) {
  //     return res.status(422).json(error.message);
  //   }
  //   const data = fileDispute(req.body);
  //   try {
  //     const document = await fileDispute.findOneAndUpdate(
  //       { _id: req.params._id },
  //       { data },
  //       { new: true }
  //     );
  //     res.status(201).json({ message: "Update Succesfully" });
  //   } catch (err) {
  //     res.send(err.message);
  //   }
  // },
};
