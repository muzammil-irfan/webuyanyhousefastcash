const mongoose = require("mongoose");
const Joi = require("joi");

const fileDisputeSchema = new mongoose.Schema({
  filedBy: {
    type: String,
    required: true,
  },
  bidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "bid",
    required: true,
  },
  reasone: {
    type: String,
    required: true,
  },
  resolution: {
    type: String,
    required: true,
  },
  Status: {
    type: Boolean,
    required: true,
  },
});

const fileDisputevalid = Joi.object({
  filedBy: Joi.string().required(),
  bidId: Joi.string().required(),
  reasone: Joi.string().required(),
  resolution: Joi.string().required(),
  Status: Joi.boolean().required(),
});

const fileDispute = mongoose.model("fileDispute", fileDisputeSchema);
module.exports = { fileDispute, fileDisputevalid };
