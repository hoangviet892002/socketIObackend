const User = require("../models/user.model.js");

const getUsers = async (req, res) => {
  try {
    const search = req.query.search;
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    if (search) {
      const FilteredUsers = filteredUsers.filter((user) =>
        user.fullName.toLowerCase().includes(search.toLowerCase())
      );
      return res.status(200).json({
        message: "get User successfully",
        data: FilteredUsers,
        onSuccess: true,
      });
    }

    res.status(200).json({
      message: "get User successfully",
      data: filteredUsers,
      onSuccess: true,
    });
  } catch (error) {
    res
      .status(200)
      .json({ message: "Internal Server Error", data: null, onSuccess: false });
  }
};
module.exports = {
  getUsers,
};
