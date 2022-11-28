const mongoose = require("mongoose");
const Joi = require("joi");

const subscribersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"user",
    required: true,
  },
  zipcode: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"zipcode",
    required: true,
  },
  currentBitAmount: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const subscribersValid = Joi.object({
  userId: Joi.object().id().required(),
  zipcode: Joi.required(),
  currentBitAmount: Joi.number().required(),
  isActive: Joi.boolean().default("false"),
});

const subscribers = mongoose.model("subscriber", subscribersSchema);

module.exports = { subscribers, subscribersValid };
