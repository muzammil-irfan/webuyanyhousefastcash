const mongoose = require("mongoose");
const Joi = require("joi");

const leadsSchema = new mongoose.Schema(
  {
    name:{
      type:String,
    },
    email: {
      type: String,
      // required: true,
      // unique: [true, "Email is already used."],
    },
    mobile: {
      type: String,
      // required: true,
    },
    AddressLocation: {
      type: String,
      // required: true,
    },
    userId: {
      type: mongoose.Schema.Types,
      ref: "user",
      require: false,
    },
    zipcode: {
      type: String,
      // required: true,
    },
    county: {
      type: String,
      // required: true,
    },
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["converted", "disputed", "pending"],
      default: "pending",
    },
    comment: {
      type: [String],
    },
    isApprove: {
      type: String,
      default: "pending",
      enum: ["approved", "rejected", "pending"]
    },
  },
  { timestamps: true }
);

const leadsValid = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  mobile: Joi.string()
    .min(8)
    .max(11)
    .pattern(/^[0-9]+$/)
    .required(),
  AddressLocation: Joi.string().required(),
  userId: Joi.object().id().allow(null).allow(""),
  zipcode: Joi.string().required(),
  county: Joi.string().required(),
  amount: Joi.string(),
  status: Joi.string(),
  comment: Joi.array().items(Joi.string()),
  isApprove: Joi.string(),
});

const leads = mongoose.model("leads", leadsSchema);

module.exports = { leads, leadsValid };
