const { subscribers } = require("../models/subscribers");
module.exports.subscriberbyzipcode = async (zipcode) => {
  try {
    const getdata = await subscribers.find({ zipcod: zipcode });
  } catch (err) {
    return err.message;
  }
};
