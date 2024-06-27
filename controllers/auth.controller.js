const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const { generateToken } = require("../utils/generateToken.js");

const signup = async (req, res) => {
  try {
    console.log(req.body);
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (password !== confirmPassword) {
      return res.status(200).json({
        message: "Passwords don't match",
        data: null,
        onSuccess: false,
      });
    }

    const user = await User.findOne({ username });

    if (user) {
      return res.status(200).json({
        message: "Username already exists",
        data: null,
        onSuccess: false,
      });
    }

    // HASH PASSWORD HERE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // https://avatar-placeholder.iran.liara.run/

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
    });

    if (newUser) {
      await newUser.save();

      res.status(200).json({
        message: "create success",
        data: {
          _id: newUser._id,
          fullName: newUser.fullName,
          username: newUser.username,
          profilePic: newUser.profilePic,
        },
        onSuccess: true,
      });
    } else {
      res
        .status(200)
        .json({ message: "Invalid user data", data: null, onSuccess: false });
    }
  } catch (error) {
    res
      .status(200)
      .json({ message: "Internal Server Error", data: null, onSuccess: false });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(200).json({
        message: "Invalid username or password",
        data: null,
        onSuccess: false,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "login success",
      data: {
        _id: user._id,
        fullName: user.fullName,
        profilePic: user.profilePic,
        wallet: user.wallet,
        token: token,
      },
      onSuccess: true,
    });
  } catch (error) {
    res
      .status(200)
      .json({ message: "Internal Server Error", data: null, onSuccess: false });
  }
};
const logout = (req, res) => {
  try {
    res.status(200).json({
      message: "Logged out successfully",
      data: null,
      onSuccess: true,
    });
  } catch (error) {
    res
      .status(200)
      .json({ message: "Internal Server Error", data: null, onSuccess: false });
  }
};
const getProfile = async (req, res) => {
  const id = req.user._id;
  const user = await User.findById(id);
  res.status(200).json({ message: "Success", data: user, onSuccess: true });
};

module.exports = {
  signup,
  login,
  logout,
  getProfile,
};
