const Game = require("../models/game.model");

const getGame = async (req, res) => {
  const id = req.user._id;
  const games = await Game.find({ $or: [{ loser_id: id }, { winner_id: id }] });
  res.status(200).json({ message: "Success", data: games, onSuccess: true });
};

module.exports = { getGame };
