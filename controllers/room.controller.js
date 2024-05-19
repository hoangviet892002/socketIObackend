const { io } = require("../socket/socket.js");
const gameRooms = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  players: [],
  gameState: [],
}));
const getRooms = (req, res) => {
  const rooms = gameRooms.map((room) => ({
    id: room.id,
    players: room.players.map((player) => player.userId),
    playerCount: room.players.length,
  }));
  io.emit("rooms", rooms);
  res.status(200).json({
    message: "Get successfully",
    data: null,
    onSuccess: true,
  });
};
const joinRoom = (req, res) => {
  const { roomId } = req.body;

  const room = gameRooms.find((room) => room.id === roomId);

  if (room && room.players.length < 2) {
    room.players.push({ userId, socketId: req.user._id });
    console.log("a user " + req.user._id + " join room: " + roomId);
    io.join(`room-${roomId}`);
    io.to(`room-${roomId}`).emit(
      "roomJoined",
      room.players.map((player) => player.userId)
    );

    if (room.players.length === 2) {
      io.to(`room-${roomId}`).emit("startGame", room.id);
    }
  } else {
    io.emit("roomFull");
  }

  res.status(200).json({
    message: "Join successfully",
    data: null,
    onSuccess: true,
  });
};
module.exports = { joinRoom, getRooms };
