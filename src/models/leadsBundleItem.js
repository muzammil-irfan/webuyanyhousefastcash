const mongoose = require("mongoose");
const Joi = require("joi");
// Joi.objectId = require('joi-objectid')(Joi);

const leadsBundleItemSchema = new mongoose.Schema({
  zipid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "zipcode",
    required: true,
  },
  leadsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "leads",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const leadsBundleItemValid = Joi.object({
  zipid: Joi.object().id().required(),
  leadsId: Joi.object().id().required(),
  amount: Joi.number().required(),
  isActive: Joi.boolean().default("false"),
});

const leadsBundleItem = mongoose.model(
  "leadsBundleItem",
  leadsBundleItemSchema
);
module.exports = { leadsBundleItem, leadsBundleItemValid };
