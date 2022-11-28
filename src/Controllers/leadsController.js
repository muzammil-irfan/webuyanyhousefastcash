const { leads, leadsValid } = require("../models/leads");
const { subscribers } = require("../models/subscribers");
const { ZipCode } = require("../models/zipcode");
const { Wallet, walletValid } = require("../models/wallet");
const walletHistory = require("../models/walletHistory");
const generateApiKey = require("generate-api-key");
const { socket } = require("../helpers/socket");
module.exports = {
  async create(req, res) {
    // if (req.userType !== "admin")
    //   return res.status(404).json({ message: "you can't access this page." });

    const { error } = leadsValid.validate(req.body);
    console.log(error);
    if (error) return res.json(error.message);

    const data = leads({
      ...req.body,
      status: "pending",
    });

    try {
      await data.save(async (err, success) => {
        if (err) return res.json({ message: err.message });

        //Get zipid against aipcode

        const zipcodeData = await ZipCode.find({
          zipcode: req.body.zipcode,
        }).select("_id");

        if (!zipcodeData) return res.json({ message: err.message });

        //Get subscribers Data and sort againt zipId
        const subscribersData = await subscribers
          .find({ zipcode: zipcodeData })
          .sort([["currentBitAmount", -1]]);

        if (!subscribersData) return res.json({ message: err.message });

        for (var i = 0; i < subscribersData.length; i++) {
          if (subscribersData[i].isActive) {
            const walletAamount = await Wallet.findOne({
              userId: subscribersData[i].userId,
            });

            if (walletAamount.amount >= subscribersData[i].currentBitAmount) {
              walletAamount.amount =
                Number(walletAamount.amount) -
                Number(subscribersData[i].currentBitAmount);
              const check = await leads.findByIdAndUpdate(
                success._id,
                {
                  userId: walletAamount.userId,
                  amount: subscribersData[i].currentBitAmount,
                },
                { new: true }
              );
              await Wallet.findOneAndUpdate(
                { userId: subscribersData[i].userId },
                { amount: walletAamount.amount },
                { new: true }
              );

              const walletHistoryData = new walletHistory({
                userId: subscribersData[i].userId,
                amountHistor: subscribersData[i].currentBitAmount,
                payType: "wallet",
                description: `Detduct ${subscribersData[i].currentBitAmount} from your wallet for Lead Id ${success._id}`,
              });
              await walletHistoryData.save();
              socket.emit("leads", check);
              break;
            }
          }
        }
      });
      return res.status(201).json({ message: "Data Create Sucessfully" });
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  async createBulk(req, res) {
    try {
      await leads.insertMany(req.body).then(async (success) => {
        for (const s of success) {
          const zipcodeData = await ZipCode.find({
            zipcode: s.zipcode,
          }).select("_id");
          if (!zipcodeData) return null;
          const subscribersData = await subscribers
            .find({ zipcode: zipcodeData })
            .sort([["currentBitAmount", -1]]);
          if (!subscribersData) return null
          for (const i of subscribersData) {
            if (i.isActive) {
              const walletAamount = await Wallet.findOne({
                userId: i.userId,
              });

              if (walletAamount.amount >= i.currentBitAmount) {
                walletAamount.amount =
                  Number(walletAamount.amount) -
                  Number(i.currentBitAmount);
                const check = await leads.findByIdAndUpdate(
                  s._id,
                  {
                    userId: walletAamount.userId,
                    amount: i.currentBitAmount,
                  },
                  { new: true }
                );
                await Wallet.findOneAndUpdate(
                  { userId: i.userId },
                  { amount: walletAamount.amount },
                  { new: true }
                );

                const walletHistoryData = new walletHistory({
                  userId: i.userId,
                  amountHistor: i.currentBitAmount,
                  payType: "wallet",
                  description: `Detduct ${i.currentBitAmount} from your wallet for Lead Id ${s._id}`,
                });
                await walletHistoryData.save();
                socket.emit("leads", check);
                break;
              }
            }
          }
        }
      });
      return res.status(201).json({ message: "Data Create Sucessfully" });
    } catch (err) {
      console.log(err);
      res.send(err.message);
    }
  },
  async getAll(req, res) {
    console.log("get all");
    try {
      const data = await leads.find({}).populate('userId').sort([["_id", -1]]);
      res.status(200).json(data);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  async getRecent(req, res) {
    console.log("get all");
    try {
      const data = await leads.find({}).populate('userId').sort([["_id", -1]]);
      let newData = [];
      for (d of data) {
        let { _id, amount, zipcode, county } = d;
        newData.push({ _id, amount, zipcode, county })
      }
      res.status(200).json(newData);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  async getById(req, res) {
    try {
      const data = await leads.find({ userId: req.userId }).sort([["_id", -1]]);
      res.status(200).json(data);
    } catch (err) {
      res.send(err.message);
    }
  },
  async updateByUser(req, res) {
    req.body.userId = req.userId;
    try {
      const updatedLead = await leads.findOneAndUpdate(
        { _id: req.body._id, userId: req.userId },
        { status: req.body.status, comment: req.body.comment },
        { new: true }
      );
      console.log(updatedLead);
      return res.json({ message: "Data Update Sucessfully", updatedLead });
    } catch (err) {
      res.json({ message: err.message });
    }
  },
  async updateByAdmin(req, res) {
    console.log(req.userType);
    if (req.userType !== "admin")
      return res.json({ message: "you can't access this page." });
    try {
      const leadsApprove = await leads.findOneAndUpdate(
        { _id: req.body._id },
        { comment: req.body.comment, isApprove: req.body.isApprove },
        { new: true }
      );

      if (leadsApprove.isApprove) {
        const getWalletAmount = await Wallet.findOne({
          userId: leadsApprove.userId,
        });

        getWalletAmount.amount =
          Number(getWalletAmount.amount) + Number(leadsApprove.amount);

        await Wallet.findOneAndUpdate(
          { userId: leadsApprove.userId },
          { amount: getWalletAmount.amount },
          { new: true }
        );

        const walletHistoryData = new walletHistory({
          userId: leadsApprove.userId,
          amountHistor: leadsApprove.amount,
          payType: "wallet",
          description: `Retrun Amount ${leadsApprove.amount} in your wallet for Disputed Lead ${leadsApprove._id}`,
        });

        await walletHistoryData.save();

        return res.json({ message: "Data Update Sucessfully", leadsApprove });
      }
      return res.json({ message: "chalo kato" });
    } catch (err) {
      res.json({ message: err.message });
    }
  },
  async getbydate(req, res) {
    let { startDate, endDate } = req.query;
    try {
      const data = await leads.find({
        createdAt: {
          $gte: new Date(new Date(startDate)),
          $lt: new Date(new Date(endDate)),
        },
      });
      res.status(200).json(data);
    } catch (err) {
      res.send(err.message);
    }
  },
  async createwithApi(req, res) {
    console.log(req.body,"body",req.query)
    // if (req.userType !== "admin")
    //   return res.status(404).json({ message: "you can't access this page." });

    // console.log("Enter your API key");
    // const apikey = process.env.API_KEY;
    // if (key !== req.params.id) return res.status(400).json({ message: 'you are not authorized to access this page' });
    // const { error } = leadsValid.validate(req.body);
    // if (error) return res.status(400).json(error.message);

    const data = leads({
      ...req.query,
      status: "pending",
    });

    try {
      await data.save(async (err, success) => {
        if (err) return res.json({ message: err.message });

        //Get zipid against aipcode

        const zipcodeData = await ZipCode.find({
          zipcode: req.body.zipcode,
        }).select("_id");

        if (!zipcodeData) return res.json({ message: err.message });

        //Get subscribers Data and sort againt zipId
        const subscribersData = await subscribers
          .find({ zipcode: zipcodeData })
          .sort([["currentBitAmount", -1]]);

        if (!subscribersData) return res.json({ message: err.message });

        for (var i = 0; i < subscribersData.length; i++) {
          if (subscribersData[i].isActive) {
            const walletAamount = await Wallet.findOne({
              userId: subscribersData[i].userId,
            });

            if (walletAamount.amount >= subscribersData[i].currentBitAmount) {
              walletAamount.amount =
                Number(walletAamount.amount) -
                Number(subscribersData[i].currentBitAmount);
              const check = await leads.findByIdAndUpdate(
                success._id,
                {
                  userId: walletAamount.userId,
                  amount: subscribersData[i].currentBitAmount,
                },
                { new: true }
              );
              await Wallet.findOneAndUpdate(
                { userId: subscribersData[i].userId },
                { amount: walletAamount.amount },
                { new: true }
              );

              const walletHistoryData = new walletHistory({
                userId: subscribersData[i].userId,
                amountHistor: subscribersData[i].currentBitAmount,
                payType: "wallet",
                description: `Detduct ${subscribersData[i].currentBitAmount} from your wallet for Lead Id ${success._id}`,
              });
              await walletHistoryData.save();
              socket.emit("leads", check);
              break;
            }
          }
        }
      });
      return res.status(201).json({ message: "Data Create Sucessfully" });
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
};
