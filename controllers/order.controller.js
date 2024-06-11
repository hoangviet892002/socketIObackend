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
const create_payment = (req, res) => {
  const { package: packageTy } = req.params;
  const userId = req.user._id;

  const date = new Date();
  const ipAddr = req.ip;
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  const orderId = moment(date).format("DDHHmmss");
  const tmnCode = "0HMW9F90";
  const secretKey = "4IKW54V2L7D1RN4L8PDKTP2Y2UP3O9BI";
  let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl = `http://localhost:3000/payment/vnpay_return/${packageTy}/${userId}`;
  let amount;
  switch (packageTy) {
    case "Common":
      amount = 10000;
      break;
    case "Uncommon":
      amount = 50000;
      break;
    case "Rare":
      amount = 200000;
      break;
    case "Epic":
      amount = 500000;
      break;
    case "Legendary":
      amount = 1000000;
      break;
    default:
      amount = 0;
      break;
  }
  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan cho ma GD: ${orderId}`,
    vnp_OrderType: "other",
    vnp_IpAddr: ipAddr,
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,

    vnp_CreateDate: createDate,
  };
  const sortedVnpParams = sortObject(vnp_Params);
  const signData = qs.stringify(sortedVnpParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

  return res.status(200).json({
    message: "Payment created",
    data: {
      package: packageTy,
      price: amount,
      orderId,
      vnpUrl,
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
