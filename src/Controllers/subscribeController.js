const { subscribers, subscribersValid } = require("../models/subscribers");
const { leads } = require("../models/leads");
const { ZipCode } = require("../models/zipcode");
const { socket } = require("../helpers/socket");

module.exports = {
  async create(req, res) {
    const { error } = subscribersValid.validate({
      ...req.body,
      userId: req.userId,
    });
    if (error) return res.json({ message: error.message });

    const getdata = await subscribers
      .findOne({ userId: req.userId })
      .select({ zipcode: 1, _id: 0 });

    if (getdata !== null && String(getdata.zipcode) === req.body.zipcode) {
      return res.json({ message: "you are already subscribes this ZipCode " });
    }
    // const data = subscribers(req.body);
    const data = subscribers({
      ...req.body,
      userId: req.userId,
    });

    try {
      await data.save(async(err, sucess) => {
        if (err) {
          return res.json({ message: err.message });
        }
        const getdata = await subscribers.findOne({_id: sucess._id}).populate('zipcode');
        return res.json({ message: "Subscriber created successfully", getdata });
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  },
  async getData(req, res) {
    try {
      // console.log("apiCall");
      const getdata = await subscribers
        .find({ userId: req.userId })
        .populate("zipcode");

      let newGet = [];

      for (let i of getdata) {
        const subscribersData = await subscribers
          .find({ zipcode: i.zipcode._id })
          .sort([["currentBitAmount", -1]]);
        // console.log(subscribersData, subscribersData[0].currentBitAmount);
        i._doc = {
          ...i._doc,
          topBidAmount: subscribersData[0].currentBitAmount,
        };
        newGet.push(i);
      }
      return res.json(newGet);
    } catch (err) {
      res.status(202).send(err.message);
    }
  },
  async update(req, res) {
    try {
      let getdata = await subscribers
        .findByIdAndUpdate(req.body._id, req.body, { new: true })
        .populate("zipcode");
      let newGet = [];
      const subscribersData = await subscribers
        .find({ zipcode: getdata.zipcode._id })
        .sort([["currentBitAmount", -1]]);
      getdata._doc = {
        ...getdata._doc,
        topBidAmount: subscribersData[0].currentBitAmount,
      };
      socket.emit("subscribers", getdata);
      return res.json(getdata);
    } catch (err) {
      res.send(err.message);
    }
  },
  async getAll(req, res) {
    try {
      if (req.userType !== "admin") return res.json({ message: "You are not authorized" });
      const getdata = await subscribers
        .find({})
        .populate("zipcode");
      return res.json(getdata);
    } catch (err) {
      res.status(202).send(err.message);
    }
  }

};
