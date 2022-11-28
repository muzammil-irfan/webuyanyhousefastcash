const mongoose = require("mongoose");
const Joi = require("joi");

const bidSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email is already used."],
  },
  bundleItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "leadsBundleItem",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  Status: {
    type: Boolean,
    required: true,
  },
},{timestamps:true});


const bidValid = Joi.object({
  amount: Joi.number().required(),
  email: Joi.string().email().required(),
  bundleItemId: Joi.string().required(),
  name: Joi.string().required(),
  Status: Joi.boolean().required(),
});

const bid = mongoose.model("user", bidSchema);
module.exports = { bid, bidValid };
