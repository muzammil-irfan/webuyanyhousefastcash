const mongoose = require("mongoose");
const Joi = require("joi");

const notificationsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true
});


const notificationsvalid = Joi.object({
  title: Joi.string().required(),
  detail: Joi.string().required(),
  imageUrl: Joi.string().required(),
  Status: Joi.boolean().required(),
});

const notifications = mongoose.model("notification", notificationsSchema);

module.exports = { notifications, notificationsvalid };