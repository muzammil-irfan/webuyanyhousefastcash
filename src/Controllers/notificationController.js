const {
  notifications,
  notificationsvalidSchema,
} = require("../models/notifications");

module.exports = {
  // get Notfication
  async get(req, res) {
    try {
      const data = await notifications.find({
        userId: req.userId,
      }).sort([["_id", -1]]);
      if (!data) return res.json({ message: "No data found" });
      return res.json(data);
    } catch (err) {
      return res.json({ message: err.message });
    }
  },
  // update Notification
  async update(req, res) {
    console.log(req.body);
    try {
      // const { error } = notificationsvalidSchema.validate(req.body);
      // if (error) return res.json(error.message);
      const data = await notifications.findByIdAndUpdate(
        req.body._id,
        req.body,
        { new: true }
      );
      if (!data) return res.json({ message: "No data found" });
      return res.json(data);
    } catch (err) {
      return res.json({ message: err.message });
    }
  }
  // async create(req, res) {
  //   const { error } = notificationsvalidSchema.validate(req.body);
  //   if (error) {
  //     return res.status(400).json(error.message);
  //   }

  //   const data = notifications(req.body);
  //   try {
  //     await data.save();
  //     return res.status(201).json({ message: "Data Create Sucessfully" });
  //   } catch (err) {
  //     res.status(400).json(err.message);
  //   }
  // },

  // async update(req, res) {
  //   const { error } = notificationsvalidSchema.validate(req.body);
  //   if (error) {
  //     return res.status(422).json(error.message);
  //   }
  //   const data = notificationsvalidSchema(req.body);
  //   try {
  //     const document = await notifications.findByIdAndUpdate(
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
