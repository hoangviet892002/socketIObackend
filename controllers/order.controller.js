const User = require("../models/user.model.js");
const moment = require("moment");
const qs = require("qs");
const crypto = require("crypto");

const { sortObject } = require("../utils/sortObject");
// Mock mail service
const mailService = {
  sendMail: (subject, email, message) => {
    // Mock implementation - replace with actual logic
    console.log(`Email sent to ${email} with subject: ${subject}`);
  },
};
// Mock account service
const accountService = {
  TopUp: async (accId, subscriptionType) => {
    // Mock implementation - replace with actual logic
    const account = await User.findById(accId);
    if (!account) {
      throw new Error("Account not found");
    }
    let ammount;
    switch (subscriptionType) {
      case "Common":
        ammount = 10000;
        break;
      case "Uncommon":
        ammount = 50000;
        break;
      case "Rare":
        ammount = 200000;
        break;
      case "Epic":
        ammount = 500000;
        break;
      case "Legendary":
        ammount = 1000000;
        break;
      default:
        ammount = 0;
        break;
    }
    account.wallet += ammount;
    await account.save();
    return account;
  },
};
const create_payment = async (req, res) => {
  const id = req.user.id;
  const { money } = req.body;
  const user = await User.findById(id);
  user.wallet += money;
  user.save();
  return res.status(200).json({
    message: "Success",
    data: {
      wallet: user.wallet,
    },
    onSuccess: true,
  });
};
const vnpay_return = async (req, res) => {
  const { packageType, accId } = req.params;

  const account = await accountService.TopUp(accId, packageType);
  return res.status(200).json({
    message: "Payment success",
    data: {
      account,
    },
    onSuccess: true,
  });
};
module.exports = { create_payment, vnpay_return };
