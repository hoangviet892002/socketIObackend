const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const initLogic = require("../ai/logic");
const { generateBoard } = require("../utils/generateBoard");

const app = express();
const server = http.createServer(app);
app.use(cors({ origin: "http://localhost:5173" }));

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
const initialBoard = Array(20)
  .fill(null)
  .map(() => Array(20).fill(""));
const userSocketMap = {};
const listRooms = [];
const getRoom = (roomId) => {
  return listRooms.find((room) => room.id === roomId);
};
const updateGameBoard = (room, row, col, userId) => {
  if (!room || !room.game || !room.turn) return;

  // Determine the mark based on the user making the move
  const mark = room.playerX._id === room.turn ? "X" : "O";

  // Update the game board at the specified row and col
  if (room.game[row][col] === "") {
    room.game[row][col] = mark;
  } else {
    return; // Invalid move, cell already occupied
  }

  // Switch turns to the next player
  room.turn =
    room.turn === room.playerX._id ? room.playerO._id : room.playerX._id;
  // console.log(room);
};

const checkWinner = (board) => {
  const size = board.length;
  const winCondition = 5; // Number of consecutive marks needed to win

  // Helper function to check if a sequence is all the same mark
  const isWinningSequence = (sequence) => {
    return sequence.every((cell) => cell !== "" && cell === sequence[0]);
  };

  // Check rows
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const sequence = board[row].slice(col, col + winCondition);
      if (isWinningSequence(sequence)) {
        return true; // Winner found
      }
    }
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winCondition; row++) {
      const sequence = [];
      for (let k = 0; k < winCondition; k++) {
        sequence.push(board[row + k][col]);
      }
      if (isWinningSequence(sequence)) {
        return true; // Winner found
      }
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= size - winCondition; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const sequence = [];
      for (let k = 0; k < winCondition; k++) {
        sequence.push(board[row + k][col + k]);
      }
      if (isWinningSequence(sequence)) {
        return true; // Winner found
      }
    }
  }

  // Check diagonals (bottom-left to top-right)
  for (let row = winCondition - 1; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const sequence = [];
      for (let k = 0; k < winCondition; k++) {
        sequence.push(board[row - k][col + k]);
      }
      if (isWinningSequence(sequence)) {
        return true; // Winner found
      }
    }
  }

  return false; // No winner
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Implementing the caro game logic

  socket.on("on-reconnect", function (data) {
    if (data.roomInfo) {
      socket.data = data.userInfo;
      for (var i = 0; i < listRooms.length; i++) {
        if (listRooms[i].id === data.roomInfo.id) {
          if (listRooms[i].playerO === "DISCONNECTED") {
            listRooms[i].playerO = data.userInfo.fullname;
          } else {
            listRooms[i].playerX = data.userInfo.fullname;
          }
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          socket.to(socket.room).emit("on-reconnect", listRooms[i]);
          console.log(
            "Player [" +
              data.userInfo.username +
              "] reconnected in room [" +
              socket.room +
              "]"
          );
          if (listRooms[i].lastMove) {
            socket.emit("move", listRooms[i].lastMove);
          }
          return;
        }
      }
      socket.emit("on-reconnect", null);
      console.log(
        "Player [" +
          data.userInfo.username +
          "] find room [" +
          data.roomInfo.id +
          "] but not exists"
      );
    }
  });

  socket.on("joinroom", function (data) {
    socket.data = data;
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].playerO == null) {
        listRooms[i].playerO = data.user;

        listRooms[i].status = "ready";
        socket.room = listRooms[i].id;
        socket.join(socket.room);
        io.in(socket.room).emit("joinroom-success", listRooms[i]);

        console.log("Room [" + socket.room + "] ready");
        return;
      }
    }

    var room = {
      id: data.user._id + Date.now(),
      playerX: data.user,
      playerO: null,
      game: generateBoard(),
      turn: data.user._id,
      status: "created",
    };
    listRooms.push(room);
    socket.room = room.id;
    socket.join(socket.room);
    console.log("Room [" + socket.room + "] created");
    console.log(room.game);
    io.in(socket.room).emit("waiting-play", listRooms[i]);
  });

  socket.on("joinroom-ai", function (data) {
    socket.data = data;
    var room = {
      id: data.username + Date.now(),
      playerX: data.fullname,
      playerO: "I am Bot",
    };
    listRooms.push(room);
    socket.room = room.id;
    socket.withBot = true;
    socket.emit("joinroom-success-ai", room);
    socket.logic = initLogic();
    const randX = Math.floor(Math.random() * 10 + 5);
    const randY = Math.floor(Math.random() * 10 + 5);
    socket.logic.makeBotMove(randX, randY);
    socket.emit("move", {
      row: randX,
      col: randY,
    });
    console.log("Room [" + socket.room + "] with AI created");
  });

  socket.on("move", function (data) {
    if (socket.withBot) {
      const botMove = socket.logic.makePlayerMove(data.row, data.col);
      if (botMove[0] == -1 && botMove[1] == -1) {
        socket.emit("surrender-request", "I am bot");
      } else {
        socket.emit("move", {
          row: botMove[0],
          col: botMove[1],
        });
      }
    } else {
      const { row, col, user } = data;
      const room = getRoom(socket.room);

      updateGameBoard(room, row, col, user._id);
      // for (var i = 0; i < listRooms.length; i++) {
      //   if (listRooms[i].id == socket.room) {
      //     listRooms[i] = room;
      //   }
      // }
      console.log("user go to[" + data.row + "][" + data.col + "]");
      console.log(checkWinner(room.game));
      socket.in(socket.room).emit("move", room);
      socket.emit("move", room);
    }
    // for (var i = 0; i < listRooms.length; i++) {
    //   if (listRooms[i].id == socket.room) {
    //     listRooms[i].lastMove = data;
    //   }
    // }
  });

  socket.on("chat", function (data) {
    if (socket.withBot) {
      socket.emit("chat", {
        sender: "Mình",
        message: data,
      });
      if (!data.startsWith("@@@AVATAR_SIGNAL@@@")) {
        socket.emit("chat", {
          sender: "ĐThủ",
          message: "I am just a Bot",
        });
      }
    } else {
      socket.emit("chat", {
        sender: "Mình",
        message: data,
      });
      socket.to(socket.room).emit("chat", {
        sender: "ĐThủ",
        message: data,
      });
    }
  });

  socket.on("surrender-request", function (data) {
    if (socket.withBot) {
      socket.emit("surrender-result", {
        message: "yes",
        noAlert: true,
      });
    } else {
      socket.to(socket.room).emit("surrender-request", "");
    }
  });

  socket.on("surrender-result", function (data) {
    socket.to(socket.room).emit("surrender-result", data);
  });

  socket.on("ceasefire-request", function (data) {
    if (socket.withBot) {
      socket.emit("ceasefire-result", {
        message: "yes",
        noAlert: true,
      });
    } else {
      socket.to(socket.room).emit("ceasefire-request", data);
    }
  });

  socket.on("ceasefire-result", function (data) {
    socket.to(socket.room).emit("ceasefire-result", data);
  });

  socket.on("undo-request", function (data) {
    if (socket.withBot) {
      socket.emit("undo-result", {
        noAlert: true,
        message: "yes",
        stepNumber: data.stepNumber,
      });
      if (socket.logic.rollBackTo(data.stepNumber, data.x, data.y)) {
        setTimeout(function () {
          socket.emit("move", {
            row: data.nextX,
            col: data.nextY,
          });
        }, 1000);
      }
    } else {
      socket.to(socket.room).emit("undo-request", data);
    }
  });

  socket.on("undo-result", function (data) {
    socket.to(socket.room).emit("undo-result", data);
  });

  socket.on("play-again-request", function (data) {
    if (socket.withBot) {
      socket.emit("play-again-result", {
        message: "yes",
        noAlert: true,
      });
      socket.logic.reset();
      const randX = Math.floor(Math.random() * 10 + 5);
      const randY = Math.floor(Math.random() * 10 + 5);
      socket.logic.makeBotMove(randX, randY);
      socket.emit("move", {
        row: randX,
        col: randY,
      });
    } else {
      socket.to(socket.room).emit("play-again-request", data);
    }
  });

  socket.on("play-again-result", function (data) {
    socket.to(socket.room).emit("play-again-result", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.leave(socket.room);
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id == socket.room) {
        if (socket.withBot || listRooms[i].playerO == null) {
          listRooms.splice(i, 1);
          console.log("Room [" + socket.room + "] destroyed");
        } else {
          if (listRooms[i].playerO === socket.data.fullname) {
            listRooms[i].playerO = "DISCONNECTED";
          } else {
            listRooms[i].playerX = "DISCONNECTED";
          }
          if (
            listRooms[i].playerO === "DISCONNECTED" &&
            listRooms[i].playerX === "DISCONNECTED"
          ) {
            listRooms.splice(i, 1);
            console.log("Room [" + socket.room + "] destroyed");
          } else {
            socket.leave(socket.room);
            console.log(
              "Player [" +
                socket.data.fullname +
                "] leave room [" +
                socket.room +
                "]"
            );
            io.in(listRooms[i].id).emit("emely-scrare", null);
            listRooms.splice(i, 1);
            console.log(listRooms);
          }
        }
        break;
      }
    }
  });
});

module.exports = { app, io, server, getReceiverSocketId };
