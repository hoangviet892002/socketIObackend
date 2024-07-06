const Game = require("../models/game.model");
const User = require("../models/user.model");

const getGame = async (req, res) => {
  const id = req.user._id;
  const games = await Game.find({
    $or: [{ loser_id: id }, { winner_id: id }],
  })
    .populate({
      path: "winner_id loser_id",
      select: "fullName profilePic",
    })
    .sort({ createdAt: -1 });

  const gameData = games.map((game) => {
    const competitor =
      game.winner_id._id === id ? game.loser_id : game.winner_id;
    const result = game.winner_id._id === id ? "Win" : "Lose";
    const price = game.gamePrice;

    return {
      competitor,
      result,
      price,
    };
  });

  res.status(200).json({ message: "Success", data: gameData, onSuccess: true });
};

module.exports = { getGame };
