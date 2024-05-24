const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    loser_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    winner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gamePrice: {
      type: Number,
      require: true,
    },
    // createdAt, updatedAt
  },
  { timestamps: true }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
