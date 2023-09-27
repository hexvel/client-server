const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const route = require("./route");
const { addUser, findUser, getRoomUsers, removeUser } = require("./users");
const app = express();

app.use(cors({ origin: "*" }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room);

    const { user, isExist } = addUser({ name, room });

    const userMessage = isExist
      ? `${user.name}, с возвращением в комнату: ${user.room}!`
      : `${user.name}, приветствую в команте: ${user.room}!`;

    socket.emit("message", {
      data: {
        user: { name: "Admin" },
        message: userMessage,
      },
    });

    socket.broadcast.to(user.room).emit("message", {
      data: {
        user: { name: "Admin" },
        message: `${user.name} зашёл в комнату: ${user.room}!`,
      },
    });

    io.to(user.room).emit("room", {
      data: { room: user.room, users: getRoomUsers(user.room) },
    });
  });

  socket.on("send_message", ({ message, params }) => {
    const user = findUser(params);

    if (user) {
      io.to(user.room).emit("message", { data: { user, message } });
    }
  });

  socket.on("left_room", ({ params }) => {
    const user = removeUser(params);

    console.log(user);

    if (user) {
      const { room, name } = user;

      io.to(room).emit("message", {
        data: {
          user: { name: "Admin" },
          message: `Участник ${name} вышел из комнаты.`,
        },
      });

      io.to(room).emit("room", {
        data: { users: getRoomUsers(room) },
      });
    }
  });

  io.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
