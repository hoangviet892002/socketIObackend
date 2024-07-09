const Game = require("../models/game.model");
const User = require("../models/user.model");

const getGame = async (req, res) => {
  try {
    const id = req.user._id;

    // Fetching games where the user is either the winner or the loser
    const games = await Game.find({
      $or: [{ loser_id: id }, { winner_id: id }],
    })
      .populate({
        path: "winner_id loser_id",
        select: "fullName profilePic",
      })
      .sort({ createdAt: -1 });

    // Formatting the game data
    const gameData = games.map((game) => {
      const isWinner = game.winner_id._id.equals(id);
      const competitor = isWinner ? game.loser_id : game.winner_id;
      const result = isWinner ? "Win" : "Lose";

      return {
        competitor,
        result,
        price: game.gamePrice,
        createdAt: game.createdAt,
      };
    });

    // Sending the response
    res
      .status(200)
      .json({ message: "Success", data: gameData, onSuccess: true });
  } catch (error) {
    // Handling errors
    res
      .status(500)
      .json({ message: "Internal Server Error", onSuccess: false });
  }
};

module.exports = { getGame };
