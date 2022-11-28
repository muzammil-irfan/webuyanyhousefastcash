const { subscribers } = require('../models/subscribers');
const { ZipCode } = require('../models/zipcode');
const { notifications } = require('../models/notifications');

exports.getSubscribers = async (zipid) => {
    try {
        const zipcodeId = await ZipCode.find({ zipcode: zipid });
        if (!zipcodeId) return false;
        const data = await subscribers.find({
            zipcode: zipcodeId[0]._id,
        })
        // .sort([["currentBitAmount", -1]]);
        return data;
    } catch (err) {
        return err;
    }
}
// create Notification
exports.createNotification = async (data) => {
    try {
        const notification = new notifications(data);
        const notify = await notification.save();
        return notify;
    } catch (err) {
        return err;
    }
}
