const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const initLogic = require("../ai/logic");
const { generateBoard } = require("../utils/generateBoard");
const User = require("../models/user.model.js");
const Game = require("../models/game.model.js");

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {};
const listRooms = [];
const getRoom = (roomId) => {
  return listRooms.find((room) => room.id === roomId);
};
const updateGameBoard = (room, row, col, userId) => {
  if (!room || !room.game || !room.turn) return;

  const mark = room.playerX._id === room.turn ? "X" : "O";

  if (room.game[row][col] === "") {
    room.game[row][col] = mark;
  } else {
    return;
  }

  room.turn =
    room.turn === room.playerX._id ? room.playerO._id : room.playerX._id;
  // console.log(room);
};

const checkWinner = (board) => {
  const size = board.length;
  const winCondition = 5;

  const isWinningSequence = (sequence) => {
    return sequence.every((cell) => cell !== "" && cell === sequence[0]);
  };

  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const sequence = board[row].slice(col, col + winCondition);
      if (isWinningSequence(sequence)) {
        return true;
      }
    }
  }

  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winCondition; row++) {
      const sequence = [];
      for (let k = 0; k < winCondition; k++) {
        sequence.push(board[row + k][col]);
      }
      if (isWinningSequence(sequence)) {
        return true;
      }
    }
  }

  for (let row = 0; row <= size - winCondition; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const sequence = [];
      for (let k = 0; k < winCondition; k++) {
        sequence.push(board[row + k][col + k]);
      }
      if (isWinningSequence(sequence)) {
        return true;
      }
    }
  }

  for (let row = winCondition - 1; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      const sequence = [];
      for (let k = 0; k < winCondition; k++) {
        sequence.push(board[row - k][col + k]);
      }
      if (isWinningSequence(sequence)) {
        return true;
      }
    }
  }

  return false;
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

  socket.on("joinroom", async function (data) {
    socket.data = data;
    const user = await User.findById(data.user._id);
    if (user.wallet < data.money) {
      io.emit("not-enough-money");
    } else {
      for (var i = 0; i < listRooms.length; i++) {
        if (
          listRooms[i].playerO == null &&
          listRooms[i].gamePrice === data.money
        ) {
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
        gamePrice: data.money,
        turn: data.user._id,
        status: "created",
      };
      listRooms.push(room);
      socket.room = room.id;
      socket.join(socket.room);
      console.log("Room [" + socket.room + "] created");
      io.in(socket.room).emit("waiting-play", listRooms[i]);
    }
  });

  socket.on("joinroom-ai", function (data) {
    socket.data = data;
    var room = {
      id: data.user._id + Date.now(),
      playerO: {
        _id: "I am bot",
      },
      playerX: data.user,
      game: generateBoard(),
      gamePrice: 0,
      turn: data.user._id,
      status: "ready",
    };
    listRooms.push(room);
    socket.room = room.id;
    socket.withBot = true;
    socket.logic = initLogic();
    socket.emit("joinroom-success", room);
    // const randX = Math.floor(Math.random() * 10 + 5);
    // const randY = Math.floor(Math.random() * 10 + 5);
    // socket.logic.makeBotMove(randX, randY);
    // socket.emit("move", {
    //   row: randX,
    //   col: randY,
    // });
    console.log("Room [" + socket.room + "] with AI created");
  });

  socket.on("move", async function (data) {
    if (socket.withBot) {
      const { row, col, user } = data;
      const room = getRoom(socket.room);
      const botMove = socket.logic.makePlayerMove(row, col);
      updateGameBoard(room, row, col, user._id);
      if (botMove[0] == -1 && botMove[1] == -1) {
        socket.emit("surrender-request", "I am bot");
      } else {
        updateGameBoard(room, botMove[0], botMove[1], "I am bot");
        if (checkWinner(room.game)) {
          room.status = "finish";
          room.winner = user;
          //do win game
          const indexToRemove = listRooms.findIndex(
            (room) => room.id === room.id
          );
          if (indexToRemove !== -1) {
            listRooms.splice(indexToRemove, 1);
          }
          io.in(socket.room).emit("finish-game", room);
        } else socket.emit("move", room);
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

      // console.log(checkWinner(room.game));
      if (checkWinner(room.game)) {
        room.status = "finish";
        room.winner = user;
        //do win game
        const indexToRemove = listRooms.findIndex(
          (room) => room.id === room.id
        );
        if (indexToRemove !== -1) {
          listRooms.splice(indexToRemove, 1);
        }

        let winnerId;
        let loseId;
        if (room.playerO._id !== user) {
          winnerId = room.playerO._id;
          loseId = room.playerX._id;
        } else if (room.playerX._id !== user) {
          winnerId = room.playerX._id;
          loseId = room.playerO._id;
        } else {
          throw new Error("Winner cannot be the same as the current user.");
        }
        console.log(winnerId);
        const newGame = new Game({
          loser_id: loseId,
          gamePrice: room.gamePrice,
          winner_id: winnerId,
        });
        const winplayer = await User.findById(winnerId);
        const loseplayer = await User.findById(loseId);
        winplayer.wallet += room.gamePrice;
        loseplayer.wallet -= room.gamePrice;

        await Promise.all([
          winplayer.save(),
          loseplayer.save(),
          newGame.save(),
        ]);

        io.in(socket.room).emit("finish-game", room);
      } else io.in(socket.room).emit("move", room);
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

  socket.on("disconnect", async () => {
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
          if (
            listRooms[i].playerO === "DISCONNECTED" &&
            listRooms[i].playerX === "DISCONNECTED"
          ) {
            listRooms.splice(i, 1);
            console.log("Room [" + socket.room + "] destroyed");
          } else {
            socket.leave(socket.room);
            console.log(
              "Player [" + userId + "] leave room [" + socket.room + "]"
            );
            const room = getRoom(socket.room);

            let winnerId;
            let loseId;
            if (room.playerO._id !== userId) {
              winnerId = room.playerO._id;
              loseId = room.playerX._id;
            } else if (room.playerX._id !== userId) {
              winnerId = room.playerX._id;
              loseId = room.playerO._id;
            } else {
              throw new Error("Winner cannot be the same as the current user.");
            }

            const newGame = new Game({
              loser_id: loseId,
              gamePrice: room.gamePrice,
              winner_id: winnerId,
            });
            const winplayer = await User.findById(winnerId);
            const loseplayer = await User.findById(loseId);
            winplayer.wallet += room.gamePrice;
            loseplayer.wallet -= room.gamePrice;

            await Promise.all([
              winplayer.save(),
              loseplayer.save(),
              newGame.save(),
            ]);

            io.in(listRooms[i].id).emit("emely-scrare", null);
            listRooms.splice(i, 1);
          }
        }
        break;
      }
    }
  });
});

module.exports = { app, io, server, getReceiverSocketId };
