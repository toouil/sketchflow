require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const parser = require("socket.io-msgpack-parser");

const CLIENT_URL = process.env.CLIENT_URL;
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: [CLIENT_URL],
  })
);

const server = http.createServer(app);

const rooms = {}

const io = new Server(server, {
  parser,
  cors: {
    origin: [CLIENT_URL],
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({room: roomId, elements}) => {
    socket.join(roomId);

    if (rooms[roomId]) {
      socket.emit("initElements", rooms[roomId]);
    } else {
      rooms[roomId] = elements;
    }
  });

  socket.on("leave", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("getElements", ({ elements, roomId }) => {
    socket.to(roomId).emit("setElements", elements);
    rooms[roomId] = elements;
  });
});

app.get("/", (req, res) => {
  res.send(
    `To try the app visite : <a href="${CLIENT_URL}">${CLIENT_URL}</a>`
  );
});

server.listen(PORT, () => {
  console.log("Listen in port : " + PORT);
});
