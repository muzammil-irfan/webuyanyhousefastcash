const express = require("express");
const auth = require("../middleware/auth");
const userController = require("../Controllers/userController");
const subscribeController = require("../Controllers/subscribeController");
const zipcodeControoler = require("../Controllers/zipcodeController");
const leadsController = require("../Controllers/leadsController");
const walletController = require("../Controllers/walletController");
const walletHistoryController = require("../Controllers/walletHistoryController");
// const leadsBundleItemController = require("../Controllers/leadsBundleItemController");
// const bidController = require("../Controllers/bidController");
// const fileDisputeController = require("../Controllers/fileDisputeController");
const notificationController = require("../Controllers/notificationController");

const router = express.Router();

// user api
router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);
router.get("/alluser", userController.allUser);
router.post("/updateuser", auth, userController.updateUser);
router.post("/activation", userController.activate);
router.post("/forget-pass", userController.forgetPassword);
router.post("/new-pass", userController.newPassword);
router.post("/reset-pass", userController.resetpassword);

// zipcode api
router.post("/zipcode", auth, zipcodeControoler.create);
router.post("/zipcodeBulkUpload", auth, zipcodeControoler.creatBulk);
router.get("/zipcode", auth, zipcodeControoler.getData);

// subscribers api
router.post("/subscribe", auth, subscribeController.create);
router.get("/subscribe", auth, subscribeController.getData);
router.put("/subscribe", auth, subscribeController.update);
router.get("/allsubscribe", auth, subscribeController.getAll);

// leads api
router.post(
  "/leads",
  // auth,
  leadsController.create
);
router.post(
  "/leadsBulk",
  // auth,
  leadsController.createBulk
);

router.get("/leads", auth, leadsController.getAll);
router.get("/leadsrecent", auth, leadsController.getRecent);
router.get("/leadsbyuser", auth, leadsController.getById);
router.put("/leadsbyuser", auth, leadsController.updateByUser);
router.put("/leadsbyadmin", auth, leadsController.updateByAdmin);
router.get(`/leadsnew`, leadsController.createwithApi);

// wallet api
router.put("/wallet", auth, walletController.update);
router.get("/wallet", auth, walletController.getData);

// walletHistory api
router.get("/walletHistory", auth, walletHistoryController.walletHistory);
router.get("/allwalletHistory", auth, walletHistoryController.allWalletHistory);

// leadsBundleItem api
//router.post("/leadsBundleItem", auth, leadsBundleItemController.create);

// // bid api
// router.post("bid", auth, bidController.create);

// // fileDisputed api
// router.post("/fileDispute", auth, fileDisputeController.create);
// // router.put("/fileDispute", fileDisputeController.update);

// notification api
router.get("/notification", auth, notificationController.get);
router.put("/notification", auth, notificationController.update);

module.exports = router;
