const Game = require("../models/game.model");

const getGame = async(req, res) => {
  const id = req.user._id;
  const games = await Game.find()
};

export { getGame };
