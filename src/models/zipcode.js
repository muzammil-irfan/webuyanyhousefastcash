const mongoose = require("mongoose");
const Joi = require("joi");

const zipcodeSchema = new mongoose.Schema({
  zipcode: {
    type: String,
    required: true,
    unique: [true, "zipcode already used"],
  },
  county: {
    type: String,
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

const zipcodeVali = Joi.object({
  zipcode: Joi.string().required(),
  county: Joi.string().required(),
  amount: Joi.number().required(),
  isActive: Joi.boolean().default("false"),
});

const ZipCode = mongoose.model("zipcode", zipcodeSchema);
module.exports = { ZipCode, zipcodeVali };
